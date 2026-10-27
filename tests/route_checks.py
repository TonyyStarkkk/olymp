"""Browser checks for core/advanced routing and resumable task-D stages."""
import json,os,subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[1]
def data(name,module):return json.loads(subprocess.check_output(['node','--experimental-strip-types','--input-type=module','-e',f'import {{{name}}} from "./src/{module}.ts";console.log(JSON.stringify({name}));'],cwd=ROOT,text=True))
lessons=data('lessons','course');patterns=data('digitPatterns','font-patterns');stages=data('fontStages','font-stages');micros=data('microExercises','micro-exercises')
def code_for(digits,broken=None):
 code='d = int(input())\n'
 for i,digit in enumerate(digits):
  code+=('if' if i==0 else 'elif')+f' d == {digit}:\n'
  for row in patterns[digit].splitlines():code+='    print('+json.dumps('broken' if digit==broken else row)+')\n'
 return code

def main():
 url=os.environ.get('OLYMP_TEST_URL','http://127.0.0.1:4174/olymp').rstrip('/')
 with sync_playwright() as p:
  b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox']);ctx=b.new_context(viewport={'width':1440,'height':1000});page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(url+'/#/lesson/font')
  page.locator('.exercise-switcher button').nth(2).click()
  panel=page.get_by_role('region',name='Этапы задачи D')
  expect(panel).to_be_visible()
  page.locator('.cm-content').fill('print("wrong")')
  panel.get_by_role('button',name='Проверить этап 1',exact=True).click()
  expect(page.locator('.test-failure')).to_be_visible(timeout=120000)
  assert page.locator('.comparison pre').nth(0).inner_text()=='1'
  assert page.locator('.comparison pre').nth(1).inner_text()==patterns['1']
  assert not page.evaluate('JSON.parse(localStorage.getItem("olymp-font-stages-v1") || "{}")').get('passed')
  for i,stage in enumerate(stages):
   panel.get_by_role('button',name=f'Этап {i+1}',exact=True).click()
   code=code_for(stage['digits']);page.locator('.cm-content').fill(code)
   if i==1:
    page.locator('.cm-content').fill(code_for(stage['digits'],broken='1'))
    panel.get_by_role('button',name='Проверить этап 2',exact=True).click()
    expect(page.locator('.test-failure')).to_be_visible(timeout=30000)
    assert page.locator('.comparison pre').nth(0).inner_text()=='1'
    assert page.locator('.comparison pre').nth(1).inner_text()==patterns['1']
    page.locator('.cm-content').fill(code)
   panel.get_by_role('button',name=f'Проверить этап {i+1}',exact=True).click()
   expect(page.locator('.test-success')).to_contain_text(f'{2*(i+1)} из {2*(i+1)}',timeout=120000)
   state=page.evaluate('JSON.parse(localStorage.getItem("olymp-font-stages-v1"))')
   assert len(state['passed'])==i+1
   saved=page.evaluate('JSON.parse(localStorage.getItem("olymp-learning-v1"))')
   assert bool(saved['solved'].get('font-3'))==(i==4)
   if i==0:
    page.get_by_role('button',name='Проверить',exact=True).click()
    expect(page.locator('.test-failure')).to_be_visible(timeout=30000)
    assert 'font-3' not in page.evaluate('JSON.parse(localStorage.getItem("olymp-learning-v1")).solved')
    page.reload()
    expect(panel.get_by_role('button',name='Этап 1 ✓',exact=True)).to_have_attribute('aria-pressed','true')
    assert page.locator('.cm-content').inner_text().strip()==code.strip()
    page.locator('.cm-content').fill(code+'# новый черновик')
    expect(panel).to_contain_text('Код после проверки изменён')
  page.reload()
  expect(panel.get_by_role('button',name='Этап 5 ✓',exact=True)).to_have_attribute('aria-pressed','true')
  assert len(page.evaluate('JSON.parse(localStorage.getItem("olymp-font-stages-v1")).passed'))==5
  print('PASS: D stage subsets, correct failing digit, cumulative regression, draft/reload, code snapshots and full credit only for ten digits',flush=True)
  # Existing full credit remains visible when revisiting only a partial stage.
  expect(panel.locator('.font-complete-note')).to_contain_text('Полная D уже зачтена')
  panel.get_by_role('button',name='Этап 1 ✓',exact=True).click()
  page.locator('.cm-content').fill(code_for(['1','9']))
  panel.get_by_role('button',name='Проверить этап 1',exact=True).click()
  expect(page.locator('.test-success')).to_contain_text('Полная D была зачтена ранее',timeout=30000)
  assert 'font-3' in page.evaluate('JSON.parse(localStorage.getItem("olymp-learning-v1")).solved')
  # Finished core route without any advanced task, preserving the old schema.
  core=[l for l in lessons if l['id'] not in ['prefixes','viral']]
  saved={'version':1,'drafts':{'viral-1':'# вернусь к F позже'},'inputs':{},'hints':{},'solutions':[],
    'solved':{e['id']:{'helped':False,'at':'2026-10-27T00:00:00Z'} for l in core for e in l['exercises'] if e['id']!='review-olympiad-3'},
    'quizzes':{l['id']:True for l in core},'lastExercise':'review-olympiad-3'}
  page.evaluate('(s)=>localStorage.setItem("olymp-learning-v1",JSON.stringify(s))',saved)
  page.goto(url+'/#/progress');page.reload()
  expect(page.get_by_role('heading',name='Основной маршрут пройден!',exact=True)).to_be_visible()
  expect(page.locator('.progress-ring')).to_contain_text('100')
  assert page.evaluate('JSON.parse(localStorage.getItem("olymp-learning-v1"))')==saved
  page.goto(url+'/#/')
  expect(page.get_by_role('link',name='Перейти к итоговой проверке',exact=True)).to_have_attribute('href','#/assessment/new-final')
  page.goto(url+'/#/lesson/next-small')
  expect(page.get_by_role('link',name='Следующее занятие',exact=True)).to_have_attribute('href','#/lesson/tour-plan')
  page.goto(url+'/#/lesson/prefixes')
  expect(page.get_by_role('link',name='Продолжить основной маршрут',exact=True)).to_have_attribute('href','#/lesson/tour-plan')
  expect(page.get_by_role('link',name='перейти к полной F',exact=True)).to_have_attribute('href','#/lesson/viral')
  for task in [m for m in micros if m['id'] in ['choose-position','build-one-candidate','compare-candidates']]:
   page.goto(url+'/#/lesson/'+task['lessonId']);card=page.locator(f'[data-micro-id="{task["id"]}"]')
   card.get_by_role('button',name='Проверить шаг',exact=True).click();expect(card.locator('[role="status"]')).to_contain_text('Пока не всё совпало')
   for field in task['fields']:card.get_by_role('textbox',name=field['label'],exact=True).fill(field['answers'][0])
   card.get_by_role('button',name='Проверить шаг',exact=True).click();expect(card.locator('[role="status"]')).to_contain_text('Шаг понятен')
  assert page.evaluate('JSON.parse(localStorage.getItem("olymp-learning-v1")).drafts["viral-1"]')=='# вернусь к F позже'
  page.goto(url+'/#/lesson/review-olympiad');expect(page.locator('.lesson-finish')).to_contain_text('Основная часть пройдена')
  expect(page.locator('.quiz-card')).to_contain_text('Почему при обработке нескольких наборов чисел')
  page.goto(url+'/#/plan');expect(page.get_by_role('heading',name='Маршрут и ритм',exact=True)).to_be_visible()
  expect(page.locator('.assessment-card')).to_have_count(8)
  page.screenshot(path=str(ROOT/'test-results/route-desktop.png'),full_page=True)
  # Same layout with rendered components on a phone.
  page.set_viewport_size({'width':390,'height':844})
  for route,name in [('plan','route-mobile'),('lesson/font','font-stages-mobile'),('lesson/viral','viral-route-mobile')]:
   page.goto(url+'/#/'+route)
   if route=='plan':expect(page.get_by_role('heading',name='Маршрут и ритм',exact=True)).to_be_visible()
   elif route=='lesson/font':page.locator('.exercise-switcher button').nth(2).click();expect(panel).to_be_visible()
   else:expect(page.locator('[data-micro-id="compare-candidates"]')).to_be_visible()
   assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'),route
   if route=='lesson/font':panel.screenshot(path=str(ROOT/'test-results'/f'{name}.png'),animations='disabled')
   else:page.screenshot(path=str(ROOT/'test-results'/f'{name}.png'),full_page=True,animations='disabled')
  assert errors==[],errors
  print('PASS: base 100% without F, existing saves untouched, core navigation, three F bridges, weekly plan and mobile layouts',flush=True)
  b.close()
if __name__=='__main__':main()
