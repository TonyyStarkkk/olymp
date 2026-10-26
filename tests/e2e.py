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
from contest_checks import check_contest
from content_checks import check_week_two, check_week_three, check_week_four, check_week_five, check_week_six, check_week_seven

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
    check_week_two(lessons)
    check_week_three(lessons)
    check_week_four(lessons)
    check_week_five(lessons)
    check_week_six(lessons)
    check_week_seven(lessons)
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
            assert len(data["solved"]) == sum(len(lesson["exercises"]) for lesson in lessons)
            assert len(data["quizzes"]) == len(lessons)
            assert data["solved"]["variables-1"]["helped"] is True
            assert sum(item["helped"] for item in data["solved"].values()) == 1
            assert data["drafts"][lessons[-1]["exercises"][-1]["id"]] == lessons[-1]["exercises"][-1]["solution"]
            page.reload(wait_until="networkidle")
            expect(page.locator(".cm-content")).to_contain_text(lessons[-1]["exercises"][-1]["solution"].splitlines()[0])
            expect(page.locator(".exercise-switcher button").nth(2)).to_have_attribute("aria-pressed", "true")
            page.goto(f"{url}/#/progress")
            expect(page.locator(".progress-ring")).to_contain_text("100")
            expect(page.get_by_role("heading", name="Все доступные уроки пройдены!")).to_be_visible()
            with page.expect_download() as download_info:
                page.get_by_role("button", name="Скачать прогресс").click()
            download = download_info.value
            download.save_as(str(ARTIFACTS / "export.json"))
            exported = json.loads((ARTIFACTS / "export.json").read_text())
            assert len(exported["solved"]) == sum(len(lesson["exercises"]) for lesson in lessons)
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
            for week in range(max(lesson["week"] for lesson in lessons) + 1, 9):
                page.goto(f"{url}/#/week/{week}")
                expect(page.get_by_role("heading", name="Этот раздел пока в плане")).to_be_visible()
            page.goto(f"{url}/#/guide")
            expect(page.get_by_role("heading", name="Памятка Python")).to_be_visible()
            print("PASS: additional cases reject hardcoding, reset, solution reveal, all planned weeks and guide", flush=True)

            # Week two is available, and mistakes in boundaries/indentation/font fail.
            page.goto(f"{url}/#/week/2")
            expect(page.locator(".lesson-card")).to_have_count(5)
            page.screenshot(path=str(ARTIFACTS / "week-two-desktop.png"), full_page=True)
            page.goto(f"{url}/#/lesson/logic")
            run('n = int(input())\nif n > 10 and n < 20:\n    print("YES")\nelse:\n    print("NO")', "check")
            expect(page.locator(".test-failure")).to_contain_text("Ответ пока не совпал")
            page.goto(f"{url}/#/lesson/branches")
            page.locator(".exercise-switcher button").nth(2).click()
            task = next(item for item in lessons if item['id'] == 'branches')['exercises'][2]
            run(task['starter'])
            expect(page.locator(".error-feedback")).to_contain_text("четыре пробела")
            page.goto(f"{url}/#/lesson/font")
            expect(page.locator(".font-grid figure")).to_have_count(10)
            page.locator(".font-reference").screenshot(path=str(ARTIFACTS / "font-reference.png"))
            page.locator(".exercise-switcher button").nth(2).click()
            font_task = next(lesson for lesson in lessons if lesson['id'] == 'font')['exercises'][-1]
            run(font_task['solution'].replace('print("#####")', 'print("....#")', 1), "check")
            expect(page.locator(".test-failure")).to_contain_text("Ответ пока не совпал")
            print("PASS: available week two, strict boundary checks, indentation guidance and font errors", flush=True)

            # Existing version-1 saves retain all week-one progress and resume week two.
            old_context = browser.new_context()
            old = old_context.new_page()
            old.goto(url + "/")
            week_one = [lesson for lesson in lessons if lesson['week'] == 1]
            old_save = {
                'version': 1, 'lastExercise': 'checkpoint-3',
                'drafts': {'checkpoint-3': '# мой сохранённый код'}, 'inputs': {'checkpoint-3': '582'},
                'hints': {'variables-1': 2}, 'solutions': ['variables-1'],
                'solved': {task['id']: {'helped': task['id'] == 'variables-1', 'at': '2026-10-24T00:00:00Z'} for lesson in week_one for task in lesson['exercises']},
                'quizzes': {lesson['id']: True for lesson in week_one},
            }
            old.evaluate("data => localStorage.setItem('olymp-learning-v1', JSON.stringify(data))", old_save)
            old.reload(wait_until="networkidle")
            expect(old.get_by_role('link', name='Продолжить обучение')).to_have_attribute('href', '#/lesson/comparisons')
            assert old.evaluate("JSON.parse(localStorage.getItem('olymp-learning-v1'))") == old_save
            old.goto(f"{url}/#/progress")
            expect(old.locator('.week-progress-card').nth(0)).to_contain_text('15 из 15 задач')
            expect(old.locator('.week-progress-card').nth(0)).to_contain_text('Неделя пройдена')
            expect(old.locator('.week-progress-card').nth(1)).to_contain_text('0 из 15 задач')
            old.goto(f"{url}/#/lesson/checkpoint")
            expect(old.locator('.cm-content')).to_contain_text('# мой сохранённый код')
            # A saved learner who completed both released weeks resumes the new one.
            previous = [lesson for lesson in lessons if lesson['week'] <= 2]
            old_save['solved'] = {task['id']: {'helped': False, 'at': '2026-10-24T00:00:00Z'} for lesson in previous for task in lesson['exercises']}
            old_save['quizzes'] = {lesson['id']: True for lesson in previous}
            old_save['lastExercise'] = 'font-3'
            old_save['drafts']['font-3'] = '# мой рисунок'
            old.goto(url + "/")
            old.evaluate("data => localStorage.setItem('olymp-learning-v1', JSON.stringify(data))", old_save)
            old.reload(wait_until="networkidle")
            expect(old.get_by_role('link', name='Продолжить обучение')).to_have_attribute('href', '#/lesson/repeat')
            assert old.evaluate("JSON.parse(localStorage.getItem('olymp-learning-v1'))") == old_save
            old.goto(f"{url}/#/progress")
            expect(old.locator('.week-progress-card').nth(1)).to_contain_text('15 из 15 задач')
            expect(old.locator('.week-progress-card').nth(2)).to_contain_text('0 из 15 задач')
            previous = [lesson for lesson in lessons if lesson['week'] <= 3]
            old_save['solved'] = {task['id']: {'helped': False, 'at': '2026-10-25T00:00:00Z'} for lesson in previous for task in lesson['exercises']}
            old_save['quizzes'] = {lesson['id']: True for lesson in previous}
            old_save['lastExercise'] = 'bytes-3'
            old_save['drafts']['bytes-3'] = '# мои расчёты памяти'
            old.goto(url + "/")
            old.evaluate("data => localStorage.setItem('olymp-learning-v1', JSON.stringify(data))", old_save)
            old.reload(wait_until="networkidle")
            expect(old.get_by_role('link', name='Продолжить обучение')).to_have_attribute('href', '#/lesson/text')
            assert old.evaluate("JSON.parse(localStorage.getItem('olymp-learning-v1'))") == old_save
            old.goto(f"{url}/#/progress")
            expect(old.locator('.week-progress-card').nth(2)).to_contain_text('15 из 15 задач')
            expect(old.locator('.week-progress-card').nth(3)).to_contain_text('0 из 15 задач')
            old.goto(f"{url}/#/lesson/bytes")
            expect(old.locator('.cm-content')).to_contain_text('# мои расчёты памяти')
            previous = [lesson for lesson in lessons if lesson['week'] <= 4]
            old_save['solved'] = {task['id']: {'helped': False, 'at': '2026-10-25T00:00:00Z'} for lesson in previous for task in lesson['exercises']}
            old_save['quizzes'] = {lesson['id']: True for lesson in previous}
            old_save['lastExercise'] = 'years-3'
            old_save['drafts']['years-3'] = '# мой перевод года'
            old.goto(url + "/")
            old.evaluate("data => localStorage.setItem('olymp-learning-v1', JSON.stringify(data))", old_save)
            old.reload(wait_until="networkidle")
            expect(old.get_by_role('link', name='Продолжить обучение')).to_have_attribute('href', '#/lesson/enumeration')
            assert old.evaluate("JSON.parse(localStorage.getItem('olymp-learning-v1'))") == old_save
            old.goto(f"{url}/#/progress")
            expect(old.locator('.week-progress-card').nth(3)).to_contain_text('15 из 15 задач')
            expect(old.locator('.week-progress-card').nth(4)).to_contain_text('0 из 15 задач')
            old.goto(f"{url}/#/lesson/years")
            expect(old.locator('.cm-content')).to_contain_text('# мой перевод года')
            previous = [lesson for lesson in lessons if lesson['week'] <= 5]
            old_save['solved'] = {task['id']: {'helped': False, 'at': '2026-10-25T00:00:00Z'} for lesson in previous for task in lesson['exercises']}
            old_save['quizzes'] = {lesson['id']: True for lesson in previous}
            old_save['lastExercise'] = 'passwords-3'
            old_save['drafts']['passwords-3'] = '# мои пароли'
            old.goto(url + "/")
            old.evaluate("data => localStorage.setItem('olymp-learning-v1', JSON.stringify(data))", old_save)
            old.reload(wait_until="networkidle")
            expect(old.get_by_role('link', name='Продолжить обучение')).to_have_attribute('href', '#/lesson/extremes')
            assert old.evaluate("JSON.parse(localStorage.getItem('olymp-learning-v1'))") == old_save
            old.goto(f"{url}/#/progress")
            expect(old.locator('.week-progress-card').nth(4)).to_contain_text('15 из 15 задач')
            expect(old.locator('.week-progress-card').nth(5)).to_contain_text('0 из 15 задач')
            old.goto(f"{url}/#/lesson/passwords")
            expect(old.locator('.cm-content')).to_contain_text('# мои пароли')
            previous = [lesson for lesson in lessons if lesson['week'] <= 6]
            old_save['solved'] = {task['id']: {'helped': False, 'at': '2026-10-26T00:00:00Z'} for lesson in previous for task in lesson['exercises']}
            old_save['quizzes'] = {lesson['id']: True for lesson in previous}
            old_save['lastExercise'] = 'cubes-3'
            old_save['drafts']['cubes-3'] = '# моя цепочка'
            old.goto(url + "/")
            old.evaluate("data => localStorage.setItem('olymp-learning-v1', JSON.stringify(data))", old_save)
            old.reload(wait_until="networkidle")
            expect(old.get_by_role('link', name='Продолжить обучение')).to_have_attribute('href', '#/lesson/sets')
            assert old.evaluate("JSON.parse(localStorage.getItem('olymp-learning-v1'))") == old_save
            old.goto(f"{url}/#/progress")
            expect(old.locator('.week-progress-card').nth(5)).to_contain_text('15 из 15 задач')
            expect(old.locator('.week-progress-card').nth(6)).to_contain_text('0 из 15 задач')
            old.goto(f"{url}/#/lesson/cubes")
            expect(old.locator('.cm-content')).to_contain_text('# моя цепочка')
            old_context.close()
            print("PASS: original week-one saves, drafts, help history and resume into week two", flush=True)

            page.goto(f"{url}/#/week/3")
            expect(page.locator('.lesson-card')).to_have_count(5)
            page.screenshot(path=str(ARTIFACTS / 'week-three-desktop.png'), full_page=True)
            page.goto(f"{url}/#/lesson/repeat")
            page.locator('.input-panel textarea').fill('0')
            repeat_task = next(lesson for lesson in lessons if lesson['id'] == 'repeat')['exercises'][0]
            run(repeat_task['solution'])
            expect(page.locator('.error-feedback')).to_have_count(0)
            run('for i in range(1, 4, 0):\n    print(i)')
            expect(page.locator('.error-feedback')).to_contain_text('Шаг range не может быть нулём')
            page.goto(f"{url}/#/lesson/bytes")
            page.locator('.exercise-switcher button').nth(1).click()
            bytes_lesson = next(lesson for lesson in lessons if lesson['id'] == 'bytes')
            run(bytes_lesson['exercises'][1]['starter'], 'check')
            expect(page.locator('.test-failure')).to_contain_text('Ответ пока не совпал')
            page.locator('.exercise-switcher button').nth(2).click()
            run(bytes_lesson['exercises'][2]['solution'].replace('1000', '1024'), 'check')
            expect(page.locator('.test-failure')).to_contain_text('Ответ пока не совпал')
            run(bytes_lesson['exercises'][2]['solution'], 'check')
            expect(page.locator('.test-success')).to_contain_text('Все проверки пройдены')
            page.screenshot(path=str(ARTIFACTS / 'bytes-desktop.png'), full_page=True)
            print('PASS: week-three navigation, week-two saves/resume, empty loop output, range error, task-B mistakes/recovery', flush=True)

            page.goto(f"{url}/#/week/4")
            expect(page.locator('.lesson-card')).to_have_count(5)
            page.screenshot(path=str(ARTIFACTS / 'week-four-desktop.png'), full_page=True)
            page.goto(f"{url}/#/lesson/lists")
            page.locator('.exercise-switcher button').nth(2).click()
            list_task = next(lesson for lesson in lessons if lesson['id'] == 'lists')['exercises'][2]
            run(list_task['starter'])
            expect(page.locator('.error-feedback')).to_contain_text('Такой позиции нет')
            run('words = {20: "twenty"}\nprint(words["20"])')
            expect(page.locator('.error-feedback')).to_contain_text('Такого ключа нет')
            for lesson_id in ('number-words', 'years'):
                page.goto(f"{url}/#/lesson/{lesson_id}")
                page.locator('.word-reference summary').click()
                expect(page.locator('.word-reference tbody tr')).to_have_count(29)
                expect(page.locator('.word-reference')).to_contain_text('forty')
            page.locator('.word-reference').screenshot(path=str(ARTIFACTS / 'english-reference.png'))
            page.locator('.exercise-switcher button').nth(2).click()
            year_task = next(lesson for lesson in lessons if lesson['id'] == 'years')['exercises'][2]
            run(year_task['solution'].replace('"-"', '" "'), 'check')
            expect(page.locator('.test-failure')).to_contain_text('Ответ пока не совпал')
            run(year_task['solution'], 'check')
            expect(page.locator('.test-success')).to_contain_text('127 из 127')
            page.screenshot(path=str(ARTIFACTS / 'years-desktop.png'), full_page=True)
            print('PASS: week-four navigation, previous saves/resume, index/key errors, vocabulary and year formatting', flush=True)

            page.goto(f"{url}/#/week/5")
            expect(page.locator('.lesson-card')).to_have_count(5)
            page.screenshot(path=str(ARTIFACTS / 'week-five-desktop.png'), full_page=True)
            page.goto(f"{url}/#/lesson/keyboard")
            page.get_by_label('Пример маршрута').select_option('tgb')
            expect(page.locator('.keyboard-explanation')).to_contain_text('Можно по условию')
            expect(page.locator('.keyboard-explanation')).to_contain_text('вниз вправо')
            page.get_by_label('Пример маршрута').select_option('rdx')
            expect(page.locator('.keyboard-explanation')).to_contain_text('вниз влево')
            page.get_by_label('Пример маршрута').select_option('edfv')
            expect(page.locator('.keyboard-explanation')).to_contain_text('Не подходит по условию')
            page.locator('.keyboard-paths').screenshot(path=str(ARTIFACTS / 'keyboard-paths.png'))
            page.goto(f"{url}/#/lesson/passwords")
            page.locator('.exercise-switcher button').nth(1).click()
            password_tasks = next(lesson for lesson in lessons if lesson['id'] == 'passwords')['exercises']
            run(password_tasks[1]['starter'], 'check')
            expect(page.locator('.test-failure')).to_contain_text('Ответ пока не совпал')
            page.locator('.exercise-switcher button').nth(2).click()
            run(password_tasks[2]['solution'], 'check')
            expect(page.locator('.test-success')).to_contain_text('10 из 10')
            page.screenshot(path=str(ARTIFACTS / 'passwords-desktop.png'), full_page=True)
            print('PASS: week-five navigation, retained progress, interactive routes and duplicate-count rejection', flush=True)

            page.goto(f"{url}/#/lesson/neighbors")
            page.locator('.exercise-switcher button').nth(1).click()
            neighbor_task = next(lesson for lesson in lessons if lesson['id'] == 'neighbors')['exercises'][1]
            page.locator('.input-panel textarea').fill('\n')
            run(neighbor_task['solution'])
            expect(page.locator('.console-output')).to_have_text('YES\n')
            page.goto(f"{url}/#/week/6")
            expect(page.locator('.lesson-card')).to_have_count(5)
            page.screenshot(path=str(ARTIFACTS / 'week-six-desktop.png'), full_page=True)
            page.goto(f"{url}/#/lesson/cubes")
            for preset, length in [('0 / 2 / 2', 4), ('5 / 3 / 4', 12), ('1 / 0 / 4', 3), ('0 / 0 / 0', 0)]:
                page.get_by_role('button', name=preset, exact=True).click()
                expect(page.locator('.cube-result')).to_contain_text(f'Максимальная длина: {length}')
                expect(page.locator('.cube-piece')).to_have_count(length)
            expect(page.locator('.cube-result')).to_contain_text('цепочка пустая')
            page.get_by_role('slider', name='R — красные').press('End')
            expect(page.locator('.cube-result')).to_contain_text('Максимальная длина: 1')
            expect(page.locator('.cube-remaining')).to_contain_text('R — 5')
            page.get_by_role('slider', name='G — зелёные').press('ArrowRight')
            page.get_by_role('slider', name='G — зелёные').press('ArrowRight')
            page.get_by_role('slider', name='B — синие').press('ArrowRight')
            expect(page.locator('.cube-result')).to_contain_text('Максимальная длина: 7')
            page.locator('.cube-explorer').screenshot(path=str(ARTIFACTS / 'cube-explorer.png'))
            page.locator('.exercise-switcher button').nth(1).click()
            cube_tasks = next(lesson for lesson in lessons if lesson['id'] == 'cubes')['exercises']
            run(cube_tasks[1]['starter'], 'check')
            expect(page.locator('.test-failure')).to_contain_text('Ответ пока не совпал')
            page.locator('.exercise-switcher button').nth(2).click()
            run(cube_tasks[2]['solution'], 'check')
            expect(page.locator('.test-success')).to_contain_text('Все проверки пройдены')
            page.screenshot(path=str(ARTIFACTS / 'cubes-desktop.png'), full_page=True)
            print('PASS: week-six navigation, five-week saves, cube explorer and missing-stock-bound rejection', flush=True)

            page.goto(f"{url}/#/week/7")
            expect(page.locator('.lesson-card')).to_have_count(5)
            expect(page.get_by_role('link', name='Открыть тренировочный тур')).to_have_attribute('href', '#/contest')
            page.screenshot(path=str(ARTIFACTS / 'week-seven-desktop.png'), full_page=True)
            page.goto(f"{url}/#/lesson/viral")
            page.locator('.exercise-switcher button').nth(1).click()
            viral = next(lesson for lesson in lessons if lesson['id'] == 'viral')['exercises']
            run(viral[1]['starter'], 'check')
            expect(page.locator('.test-failure')).to_contain_text('Ответ пока не совпал')
            page.locator('.exercise-switcher button').nth(2).click()
            run(viral[2]['solution'], 'check')
            expect(page.locator('.test-success')).to_contain_text('Все проверки пройдены')
            check_contest(browser, url, lessons, ARTIFACTS)

            # Phone navigation and layout must have no horizontal page overflow.
            mobile = context.new_page()
            mobile.set_viewport_size({"width": 390, "height": 844})
            mobile.goto(url + "/", wait_until="networkidle")
            mobile.get_by_role("button", name="Открыть меню").click()
            expect(mobile.locator(".sidebar")).to_have_class("sidebar open")
            mobile.locator(".main-nav").get_by_role("link", name="Мой прогресс").click()
            expect(mobile.locator(".sidebar")).to_have_class("sidebar ")
            for path, screenshot in [("/", "dashboard-mobile.png"), ("/lesson/input", "lesson-mobile.png"), ("/guide", "guide-mobile.png"), ("/week/2", "week-two-mobile.png"), ("/lesson/font", "font-mobile.png"), ("/week/3", "week-three-mobile.png"), ("/lesson/bytes", "bytes-mobile.png"), ("/week/4", "week-four-mobile.png"), ("/lesson/years", "years-mobile.png"), ("/week/5", "week-five-mobile.png"), ("/lesson/passwords", "passwords-mobile.png"), ("/week/6", "week-six-mobile.png"), ("/lesson/cubes", "cubes-mobile.png"), ("/week/7", "week-seven-mobile.png"), ("/lesson/viral", "viral-mobile.png")]:
                mobile.goto(f"{url}/#{path}", wait_until="networkidle")
                assert mobile.evaluate("document.documentElement.scrollWidth <= innerWidth"), path
                if path == '/lesson/cubes':
                    mobile.get_by_role('button', name='5 / 3 / 4', exact=True).click()
                    expect(mobile.locator('.cube-piece')).to_have_count(12)
                    assert mobile.evaluate("document.documentElement.scrollWidth <= innerWidth"), 'cube chain'
                if path == '/lesson/passwords':
                    mobile.get_by_label('Пример маршрута').select_option('ytrewq')
                    expect(mobile.locator('.keyboard-explanation')).to_contain_text('Не подходит по условию')
                if path == '/lesson/years':
                    mobile.locator('.word-reference summary').click()
                    assert mobile.evaluate("document.documentElement.scrollWidth <= innerWidth"), 'open reference table'
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
