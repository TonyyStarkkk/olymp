"""Run against a fresh production build: npm run build && npm run test:e2e.

Exercises real Pyodide in Chromium, not a mocked Python implementation.
Set OLYMP_TEST_URL to test an already-running server instead of starting preview.
"""
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import time
import urllib.request

from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = ROOT / "test-results"
ARTIFACTS.mkdir(exist_ok=True)
lessons = json.loads(subprocess.check_output(
    ["node", "--experimental-strip-types", "-e",
     "import {lessons} from './src/course.ts'; console.log(JSON.stringify(lessons));"],
    cwd=ROOT, text=True,
))


def check_reference_solutions():
    count = 0
    for lesson in lessons:
        for task in lesson["exercises"]:
            for case in task["tests"]:
                run = subprocess.run([sys.executable, "-I", "-c", task["solution"]],
                                     input=case["input"] + "\n", capture_output=True, text=True, timeout=3)
                assert run.returncode == 0, (task["id"], run.stderr)
                assert run.stdout.rstrip("\n") == case["expected"], (task["id"], case, run.stdout)
                count += 1
    print(f"PASS: all {count} reference cases independently checked with CPython", flush=True)


def main():
    check_reference_solutions()
    server = None
    server_log = None
    url = os.environ.get("OLYMP_TEST_URL", "http://127.0.0.1:4173").rstrip("/")
    if not os.environ.get("OLYMP_TEST_URL"):
        assert (ROOT / "dist/index.html").exists(), "Run npm run build before the tests"
        server_log = (ARTIFACTS / "server.log").open("w")
        server = subprocess.Popen(["npm", "run", "preview", "--", "--host", "127.0.0.1", "--port", "4173", "--strictPort"],
                                  cwd=ROOT, stdout=server_log, stderr=subprocess.STDOUT, start_new_session=True)
    try:
        for _ in range(60):
            if server and server.poll() is not None:
                raise RuntimeError("Preview failed; inspect test-results/server.log")
            try:
                urllib.request.urlopen(url + "/", timeout=1)
                break
            except OSError:
                time.sleep(0.25)
        else:
            raise RuntimeError("App server did not start")
        with sync_playwright() as p:
            executable = os.environ.get("BROWSER_PATH") or shutil.which("chromium")
            browser = p.chromium.launch(**({"executable_path": executable} if executable else {}),
                                        headless=True, args=["--no-sandbox"])
            context = browser.new_context(viewport={"width": 1440, "height": 1000})
            page = context.new_page()
            errors = []
            external = []
            page.on("pageerror", lambda error: errors.append(str(error)))
            page.on("request", lambda request: external.append(request.url) if request.url.startswith("http") and not request.url.startswith(url) else None)
            page.goto(url + "/", wait_until="networkidle")
            expect(page.get_by_role("heading", name="Всё начинается с тебя.")).to_be_visible()
            page.screenshot(path=str(ARTIFACTS / "dashboard-desktop.png"), full_page=True)
            assert not page.get_by_role("button", name="Открыть меню").is_visible()
            page.get_by_role("link", name="Начать первый урок").click()

            def edit(code):
                editor = page.locator(".cm-content")
                expect(editor).to_be_visible()
                editor.fill(code)

            def run(code, mode="run"):
                edit(code)
                page.get_by_role("button", name="Проверить" if mode == "check" else "Запустить", exact=True).click()
                page.wait_for_function("document.querySelector('.output-panel')?.getAttribute('aria-busy') === 'false'", timeout=100000)

            # Wrong output must fail and must not advance progress.
            run('print("Не тот ответ")', "check")
            expect(page.locator(".test-failure")).to_contain_text("Ответ пока не совпал")
            assert page.evaluate("Object.keys(JSON.parse(localStorage.getItem('olymp-learning-v1')).solved).length") == 0
            # Friendly syntax error and empty-program handling.
            run('print("Привет"')
            expect(page.locator(".error-feedback")).to_contain_text("Проверь парные скобки")
            run('')
            expect(page.locator(".error-feedback")).to_contain_text("Напиши команду")
            # Real execution, including arbitrary input, not canned answers.
            page.locator(".input-panel textarea").fill("123\n456")
            run('a = int(input())\nb = int(input())\nprint(a * b)')
            expect(page.locator(".console-output")).to_have_text("56088\n")
            page.locator(".input-panel textarea").fill("")
            run('n = int(input())\nprint(n)')
            expect(page.locator(".error-feedback")).to_contain_text("Не хватает входных данных")
            page.locator(".input-panel textarea").fill("текст")
            run('print(int(input()))')
            expect(page.locator(".error-feedback")).to_contain_text("Не удалось превратить текст в число")
            # A new run has a new globals dictionary.
            run('my_secret_number = 999')
            run('print(my_secret_number)')
            expect(page.locator(".error-feedback")).to_contain_text("Использовано неизвестное имя")
            # Both automatic timeout and explicit stop must leave a working runner.
            run('while True:\n    pass')
            expect(page.locator(".error-feedback")).to_contain_text("не завершилась за 5 секунд")
            edit('while True:\n    pass')
            page.get_by_role("button", name="Запустить", exact=True).click()
            expect(page.get_by_role("button", name="Остановить", exact=True)).to_be_visible()
            page.get_by_role("button", name="Остановить", exact=True).click()
            expect(page.locator(".error-feedback")).to_contain_text("Выполнение остановлено")
            run('print("x" * 30000)')
            expect(page.locator(".error-feedback")).to_contain_text("Слишком много вывода")
            run('print("Всё снова работает")')
            expect(page.locator(".console-output")).to_contain_text("Всё снова работает")
            print("PASS: wrong answers, errors, input, fresh globals, timeout, stop, output cap, recovery", flush=True)

            # Verify every supplied solution in the real browser, then persistence.
            case_count = 0
            for lesson in lessons:
                page.goto(f"{url}/#/lesson/{lesson['id']}")
                page.get_by_role("tab", name="Разобраться").click()
                wrong = (lesson["quiz"]["answer"] + 1) % len(lesson["quiz"]["options"])
                page.locator(".quiz-options button").nth(wrong).click()
                expect(page.locator(".quiz-feedback")).to_contain_text("Давай разберёмся")
                page.locator(".quiz-options button").nth(lesson["quiz"]["answer"]).click()
                expect(page.locator(".quiz-feedback")).to_contain_text("Верно!")
                for i, task in enumerate(lesson["exercises"]):
                    page.locator(".exercise-switcher button").nth(i).click()
                    if task["id"] == "variables-1":
                        page.get_by_role("button", name="Небольшая подсказка").click()
                        expect(page.locator(".hint")).to_have_count(1)
                    run(task["solution"], "check")
                    expect(page.locator(".test-success")).to_contain_text("Все проверки пройдены")
                    case_count += len(task["tests"])
                expect(page.locator(".lesson-finish")).to_contain_text("Ещё один шаг к вершине!")
                print(f"PASS: lesson {lesson['id']}, quiz and three exercises", flush=True)
            data = page.evaluate("JSON.parse(localStorage.getItem('olymp-learning-v1'))")
            assert len(data["solved"]) == 15
            assert len(data["quizzes"]) == 5
            assert data["solved"]["variables-1"]["helped"] is True
            assert sum(item["helped"] for item in data["solved"].values()) == 1
            assert data["drafts"]["checkpoint-3"] == lessons[-1]["exercises"][-1]["solution"]
            page.reload(wait_until="networkidle")
            expect(page.locator(".cm-content")).to_contain_text("hundreds = n // 100")
            expect(page.locator(".exercise-switcher button").nth(2)).to_have_attribute("aria-pressed", "true")
            page.goto(f"{url}/#/progress")
            expect(page.locator(".progress-ring")).to_contain_text("100")
            expect(page.get_by_role("heading", name="Первая неделя пройдена!")).to_be_visible()
            with page.expect_download() as download_info:
                page.get_by_role("button", name="Скачать прогресс").click()
            download = download_info.value
            download.save_as(str(ARTIFACTS / "export.json"))
            exported = json.loads((ARTIFACTS / "export.json").read_text())
            assert len(exported["solved"]) == 15
            page.screenshot(path=str(ARTIFACTS / "progress-desktop.png"), full_page=True)
            print(f"PASS: {case_count} browser cases, mastery, help attribution, reload/resume and export", flush=True)

            # Sample-only hardcoding cannot pass a variable-input task.
            page.goto(f"{url}/#/lesson/input")
            page.locator(".exercise-switcher button").nth(1).click()
            run('print(21)', "check")
            expect(page.locator(".test-failure")).to_contain_text("Проверка 2")
            edit('print("черновик")')
            expect(page.locator(".stale-notice")).to_be_visible()
            page.get_by_role("button", name="Вернуть начальный код").click()
            page.get_by_role("button", name="Отменить сброс").click()
            expect(page.locator(".cm-content")).to_contain_text("черновик")
            page.get_by_role("button", name="Вернуть начальный код").click()
            page.get_by_role("button", name="Заменить", exact=True).click()
            expect(page.locator(".cm-content")).to_contain_text("Прочитай два числа")
            page.get_by_role("button", name="Небольшая подсказка").click()
            page.get_by_role("button", name="Следующая подсказка").click()
            page.get_by_role("button", name="Следующая подсказка").click()
            page.get_by_role("button", name="Показать решение и объяснение").click()
            expect(page.locator(".solution-box")).to_contain_text("Преобразование в int")
            page.screenshot(path=str(ARTIFACTS / "lesson-desktop.png"), full_page=True)
            for week in range(2, 9):
                page.goto(f"{url}/#/week/{week}")
                expect(page.get_by_role("heading", name="Этот раздел пока в плане")).to_be_visible()
            page.goto(f"{url}/#/guide")
            expect(page.get_by_role("heading", name="Памятка Python")).to_be_visible()
            print("PASS: additional cases reject hardcoding, reset, solution reveal, all planned weeks and guide", flush=True)

            # Phone navigation and layout must have no horizontal page overflow.
            mobile = context.new_page()
            mobile.set_viewport_size({"width": 390, "height": 844})
            mobile.goto(url + "/", wait_until="networkidle")
            mobile.get_by_role("button", name="Открыть меню").click()
            expect(mobile.locator(".sidebar")).to_have_class("sidebar open")
            mobile.locator(".main-nav").get_by_role("link", name="Мой прогресс").click()
            expect(mobile.locator(".sidebar")).to_have_class("sidebar ")
            for path, screenshot in [("/", "dashboard-mobile.png"), ("/lesson/input", "lesson-mobile.png"), ("/guide", "guide-mobile.png")]:
                mobile.goto(f"{url}/#{path}", wait_until="networkidle")
                assert mobile.evaluate("document.documentElement.scrollWidth <= innerWidth"), path
                mobile.screenshot(path=str(ARTIFACTS / screenshot), full_page=True, animations="disabled")
            mobile.close()
            # Runtime download error is actionable and retry works.
            fresh = browser.new_context(viewport={"width": 1100, "height": 900})
            blocked = fresh.new_page()
            blocked.route("**/python/pyodide.mjs", lambda route: route.abort())
            blocked.goto(f"{url}/#/lesson/hello")
            blocked.locator(".cm-content").fill('print("Привет, Олимп!")')
            blocked.get_by_role("button", name="Проверить", exact=True).click()
            expect(blocked.locator(".error-feedback")).to_contain_text("Не удалось загрузить Python", timeout=20000)
            blocked.unroute("**/python/pyodide.mjs")
            blocked.get_by_role("button", name="Проверить", exact=True).click()
            expect(blocked.locator(".test-success")).to_contain_text("Все проверки пройдены", timeout=90000)
            # Bad stored JSON must not crash the app.
            blocked.evaluate("localStorage.setItem('olymp-learning-v1', '{bad json')")
            blocked.reload(wait_until="networkidle")
            expect(blocked.locator(".storage-warning")).to_contain_text("Не удалось прочитать")
            fresh.close()
            assert not external, external
            assert not errors, errors
            print("PASS: mobile layout/navigation, runtime download failure/retry, corrupt storage, no external requests or page errors", flush=True)
            browser.close()
    finally:
        if server:
            import signal
            os.killpg(server.pid, signal.SIGTERM)
            server.wait(timeout=10)
        if server_log:
            server_log.close()


if __name__ == "__main__":
    main()
