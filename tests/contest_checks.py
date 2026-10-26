"""Browser checks for independent timed attempts; exercises real Pyodide."""
import json
import re
from playwright.sync_api import expect


def check_contest(browser, url, lessons, artifacts):
    context = browser.new_context(viewport={'width': 1280, 'height': 960})
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(url + '/', wait_until='networkidle')
    learning = page.evaluate("localStorage.getItem('olymp-learning-v1')")
    page.goto(url + '/#/contest', wait_until='networkidle')
    expect(page.get_by_role('heading', name='Перед стартом')).to_be_visible()
    assert page.evaluate("localStorage.getItem('olymp-contest-v1')") is None
    page.get_by_role('button', name='Начать тур · 180 минут').click()
    expect(page.get_by_role('timer')).to_contain_text('03:00:00')
    expect(page.locator('.contest-review')).to_have_count(0)
    initial = page.evaluate("JSON.parse(localStorage.getItem('olymp-contest-v1'))")
    nav = page.get_by_role('navigation', name='Задачи тура')
    def select(letter):
        nav.get_by_role('button', name=re.compile('^' + letter + r'( ·|$)')).click()
    def check(code):
        page.locator('.cm-content').fill(code)
        page.get_by_role('button', name='Проверить', exact=True).click()
        expect(page.locator('.contest-feedback')).to_have_attribute('aria-busy', 'false', timeout=100000)
    for letter, lesson_id in zip('ABCDEF', ['passwords','bytes','cubes','font','years','viral']):
        select(letter)
        lesson = next(item for item in lessons if item['id'] == lesson_id)
        if letter == 'D':
            page.get_by_text('Шаблоны цифр из условия', exact=True).click()
            expect(page.locator('.font-grid figure')).to_have_count(10)
        if letter == 'E':
            page.get_by_text('Английские названия из условия', exact=True).click()
            expect(page.locator('.word-reference')).to_contain_text('forty')
        print('Checking timed task', letter, flush=True)
        check(lesson['exercises'][2]['solution'])
        expect(page.locator('.contest-feedback')).to_contain_text('Задача зачтена')
    expect(page.locator('.contest-score')).to_have_text('Зачтено: 6 из 6')
    select('C')
    check('print(0)')
    expect(page.locator('.contest-feedback')).to_contain_text('ответ пока не совпал')
    expect(page.locator('.contest-score')).to_have_text('Зачтено: 6 из 6')
    page.get_by_label('Входные данные', exact=True).fill('5\n3\n4')
    select('A')
    select('C')
    expect(page.locator('.cm-content')).to_contain_text('print(0)')
    expect(page.get_by_label('Входные данные', exact=True)).to_have_value('5\n3\n4')
    page.reload(wait_until='networkidle')
    saved = page.evaluate("JSON.parse(localStorage.getItem('olymp-contest-v1'))")
    assert saved['startedAt'] == initial['startedAt']
    assert len(saved['accepted']) == 6
    assert saved['accepted']['cubes-3']['code'] != saved['drafts']['cubes-3']
    assert page.evaluate("localStorage.getItem('olymp-learning-v1')") == learning
    expect(page.locator('.cm-content')).to_contain_text('print(0)')
    page.get_by_role('button', name='Завершить тур', exact=True).click()
    page.get_by_role('button', name='Отмена', exact=True).click()
    expect(page.locator('.contest-review')).to_have_count(0)
    page.get_by_role('button', name='Завершить тур', exact=True).click()
    page.get_by_role('button', name='Да, завершить', exact=True).click()
    expect(page.get_by_role('heading', name='Результат: 6 из 6 задач')).to_be_visible()
    expect(page.get_by_role('button', name='Проверить', exact=True)).to_be_disabled()
    expect(page.locator('.cm-content')).to_have_attribute('contenteditable','false')
    page.get_by_text('Посмотреть решение', exact=True).click()
    expect(page.locator('.contest-review')).to_contain_text('max(r, g, b)')
    with page.expect_download() as download_info:
        page.get_by_role('button', name='Скачать результат тура').click()
    download_info.value.save_as(str(artifacts / 'contest-export.json'))
    exported = json.loads((artifacts / 'contest-export.json').read_text())
    assert len(exported['accepted']) == 6 and exported['finishedAt'] is not None
    page.screenshot(path=str(artifacts / 'contest-results-desktop.png'), full_page=True, animations='disabled')
    page.set_viewport_size({'width':390,'height':844})
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    page.screenshot(path=str(artifacts / 'contest-results-mobile.png'), full_page=True, animations='disabled')
    page.get_by_role('button', name='Новая попытка', exact=True).click()
    page.get_by_role('button', name='Отмена', exact=True).click()
    expect(page.locator('.contest-score')).to_have_text('Зачтено: 6 из 6')
    page.get_by_role('button', name='Новая попытка', exact=True).click()
    page.get_by_role('button', name='Заменить попытку', exact=True).click()
    expect(page.locator('.contest-score')).to_have_text('Зачтено: 0 из 6')
    select('F')
    expect(page.locator('.cm-content')).to_contain_text('for case in range(10)')
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    page.screenshot(path=str(artifacts / 'contest-active-mobile.png'), full_page=True, animations='disabled')
    # Advance the browser wall clock instead of waiting three hours. A late run cannot score.
    page.clock.install()
    page.locator('.cm-content').fill('while True:\n    pass')
    page.get_by_role('button', name='Проверить', exact=True).click()
    expect(page.locator('.contest-feedback')).to_have_attribute('aria-busy','true')
    page.clock.fast_forward(180 * 60 * 1000 + 1000)
    expect(page.get_by_role('timer')).to_have_text('Тур завершён')
    expect(page.get_by_role('button', name='Проверить', exact=True)).to_be_disabled()
    expect(page.locator('.contest-score')).to_have_text('Зачтено: 0 из 6')
    expired = page.evaluate("JSON.parse(localStorage.getItem('olymp-contest-v1'))")
    assert expired['finishedAt'] == expired['startedAt'] + 180 * 60 * 1000
    page.reload(wait_until='networkidle')
    expect(page.get_by_role('timer')).to_have_text('Тур завершён')
    expect(page.locator('.cm-content')).to_contain_text('while True:')
    # A saved attempt that expired while the page was closed also finishes on loading.
    page.evaluate("saved => {saved.startedAt = Date.now() - 180*60*1000 - 100; saved.finishedAt=null; saved.accepted={}; localStorage.setItem('olymp-contest-v1', JSON.stringify(saved));}", expired)
    page.reload(wait_until='networkidle')
    expect(page.get_by_role('timer')).to_have_text('Тур завершён')
    page.evaluate("localStorage.setItem('olymp-contest-v1', '{bad')")
    page.reload(wait_until='networkidle')
    expect(page.locator('.contest-page .storage-warning')).to_contain_text('Не удалось прочитать')
    expect(page.get_by_role('button', name='Начать тур · 180 минут')).to_be_visible()
    assert page.evaluate("localStorage.getItem('olymp-learning-v1')") == learning
    assert not errors, errors
    context.close()
    print('PASS: all six timed tasks, independent drafts/results, reload, accepted-code snapshot, finish/export/restart, live timeout/late run, closed-page expiry, mobile layout and corrupt attempt', flush=True)
