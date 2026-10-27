"""Content and browser checks for independent work and in-lesson steps.
Run against the production preview with OLYMP_TEST_URL=http://127.0.0.1:4174/olymp.
"""
import contextlib
import io
import itertools
import json
import os
from pathlib import Path
import subprocess
from unittest.mock import patch
from playwright.sync_api import sync_playwright, expect
ROOT=Path(__file__).resolve().parents[1]
def export(name,module):
 return json.loads(subprocess.check_output(['node','--experimental-strip-types','--input-type=module','-e',f'import {{ {name} }} from "./src/{module}.ts"; console.log(JSON.stringify({name}));'],cwd=ROOT,text=True))
assessments=export('assessments','assessments')
micros=export('microExercises','micro-exercises')
tasks={t['exercise']['id']:t['exercise'] for a in assessments for t in a['tasks']}
def run(task_id,source):
 out=io.StringIO();values=iter(source.splitlines())
 with contextlib.redirect_stdout(out),patch('builtins.input',side_effect=lambda:next(values)):
  exec(compile(tasks[task_id]['solution'],'student.py','exec'),{})
 return out.getvalue().rstrip('\n')
def lines(*values):return '\n'.join(map(str,values))
def content():
 total=0
 for id,task in tasks.items():
  for test in task['tests']:
   assert run(id,test['input'])==test['expected'],(id,test,run(id,test['input']))
   total+=1
 # The interval check has to include touching endpoints and point intervals.
 intervals=list(itertools.combinations_with_replacement(range(5),2))
 for (a,b),(c,d) in itertools.product(intervals,repeat=2):
  expected='YES' if set(range(a,b+1))&set(range(c,d+1)) else 'NO'
  assert run('ind-2-2',lines(a,b,c,d))==expected
 # Enumerate every possible ticket count; do not reproduce the three-formula solution.
 for n,a,b in itertools.product(range(12),range(1,7),range(1,7)):
  expected=min(x*a+y*b for x in range(n+1) for y in range(n+1) if x+2*y>=n)
  assert run('ind-6-2',lines(n,a,b))==str(expected)
 # Check streaks against all contiguous ranges, including empty diaries.
 for n in range(7):
  for values in itertools.product([0,1],repeat=n):
   expected=max([0]+[j-i for i in range(n) for j in range(i+1,n+1) if all(values[i:j])])
   assert run('ind-3-1',lines(n,*values))==str(expected)
 # Courier optimum: independently try every partition between neighbouring parcels.
 for k in range(1,5):
  for n in range(5):
   for v in itertools.product(range(1,k+1),repeat=n):
    expected=0 if not v else n
    for cuts in itertools.product([False,True],repeat=max(0,n-1)):
     groups=[];load=0
     for i,w in enumerate(v):
      load+=w
      if i==n-1 or cuts[i]:groups.append(load);load=0
     if all(g<=k for g in groups):expected=min(expected,len(groups))
    assert run('new-final-b',lines(k,n,*v))==str(expected)
 # Full alphabet oracle for every input through length 4.
 for size in range(1,5):
  words=[''.join(v) for v in itertools.product('ABC',repeat=size)]
  valid=[w for w in words if all(w[i]!=w[i-1] for i in range(1,size))]
  for word in words:
   assert run('new-final-f',word)==next((w for w in valid if w>word),'NONE')
 # Day-by-day oracle rather than full-week arithmetic.
 for n in range(30):
  for x,y in [(0,0),(0,7),(5,0),(2,9)]:
   expected=sum(x if day%7<5 else y for day in range(n))
   assert run('new-final-e',lines(n,x,y))==str(expected)
 print(f'PASS: {total} new reference cases; independent exhaustive interval, streak, ticket, parcel, alphabet and calendar oracles',flush=True)
 return total

def browser_checks(total):
 url=os.environ.get('OLYMP_TEST_URL','http://127.0.0.1:4174/olymp').rstrip('/')
 artifacts=ROOT/'test-results';artifacts.mkdir(exist_ok=True)
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path=os.environ.get('BROWSER_PATH','/usr/bin/chromium'),headless=True,args=['--no-sandbox'])
  ctx=browser.new_context(viewport={'width':1440,'height':1000},accept_downloads=True)
  page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(url+'/#/assessments',wait_until='networkidle')
  expect(page.locator('.assessment-card')).to_have_count(9)
  for task in micros:
   page.goto(url+'/#/lesson/'+task['lessonId'])
   card=page.locator(f'[data-micro-id="{task["id"]}"]')
   expect(card).to_be_visible()
   card.get_by_role('button',name='Проверить шаг',exact=True).click()
   expect(card.locator('[role="status"]')).to_contain_text('Пока не всё совпало')
   if task['id']=='value-change':
    card.get_by_role('button',name='Разобрать этот шаг').click()
    expect(card).to_contain_text('Исправь свои ответы')
   if task['kind']=='fill':
    for field in task['fields']:card.get_by_role('textbox',name=field['label'],exact=True).fill(field['answers'][0])
   else:
    order=task['initial'][:]
    for target in range(len(order)):
     at=order.index(target)
     while at>target:
      card.get_by_role('button',name=f'Шаг {at+1} вверх',exact=True).click()
      order[at],order[at-1]=order[at-1],order[at];at-=1
   card.get_by_role('button',name='Проверить шаг',exact=True).click()
   expect(card.locator('[role="status"]')).to_contain_text('Шаг понятен.')
  page.reload()
  expect(page.locator(f'[data-micro-id="{micros[-1]["id"]}"] [role="status"]')).to_contain_text('Шаг понятен.')
  page.goto(url+'/#/assessments')
  expect(page.locator('.outcome-card')).to_contain_text(f'Выполнено {len(micros)} из {len(micros)}')
  page.screenshot(path=str(artifacts/'assessment-hub-desktop.png'),full_page=True)
  learning=page.evaluate('localStorage.getItem("olymp-learning-v1")')
  micro_saved=page.evaluate('localStorage.getItem("olymp-micro-v1")')
  # Existing tour states must survive work in every new assessment.
  old_tours=page.evaluate('''() => {
    const state={version:1,startedAt:Date.now()-1000,finishedAt:null,selected:0,drafts:{"passwords-3":"# мой старый код"},inputs:{},accepted:{}};
    for(const key of ["olymp-contest-v1","olymp-final-contest-v1"]) localStorage.setItem(key,JSON.stringify(state));
    return JSON.stringify(state);
  }''')
  for assessment in assessments:
   page.goto(url+'/#/assessment/'+assessment['id'])
   expect(page.get_by_role('heading',name=assessment['title'],exact=True)).to_be_visible()
   assert not page.locator('.contest-review').count()
   page.get_by_role('button',name=f'Начать работу · {assessment["minutes"]} минут',exact=True).click()
   expect(page.locator('.contest-clock')).to_contain_text('02:59' if assessment['minutes']==180 else '00:29')
   if assessment['id']=='week-1':
    page.get_by_role('button',name='Проверить',exact=True).click()
    expect(page.locator('.contest-feedback')).to_contain_text('Напиши хотя бы одну команду')
    page.locator('.cm-content').fill('print(-999)')
    page.get_by_role('button',name='Проверить',exact=True).click()
    expect(page.locator('.contest-feedback')).to_contain_text('ответ пока не совпал',timeout=120000)
    expect(page.locator('.contest-score')).to_have_text('Зачтено: 0 из 2')
   for i,item in enumerate(assessment['tasks']):
    task=item['exercise']
    page.locator('.contest-task-nav button').nth(i).click()
    if not (assessment['id']=='week-1' and i==0):expect(page.locator('.cm-content')).to_have_text('')
    page.locator('.cm-content').fill(task['solution'])
    page.get_by_role('button',name='Проверить',exact=True).click()
    expect(page.locator('.contest-feedback')).to_contain_text('Все проверки пройдены',timeout=120000)
    assert not page.locator('.contest-review').count()
   n=len(assessment['tasks'])
   expect(page.locator('.contest-score')).to_have_text(f'Зачтено: {n} из {n}')
   key='olymp-assessment-'+assessment['id']+'-v1'
   started=page.evaluate('(key)=>JSON.parse(localStorage.getItem(key)).startedAt',key)
   page.reload()
   expect(page.locator('.contest-score')).to_have_text(f'Зачтено: {n} из {n}')
   assert page.evaluate('(key)=>JSON.parse(localStorage.getItem(key)).startedAt',key)==started
   page.get_by_role('button',name='Завершить работу',exact=True).click()
   page.get_by_role('button',name='Отмена',exact=True).click()
   assert not page.locator('.contest-review').count()
   page.get_by_role('button',name='Завершить работу',exact=True).click()
   page.get_by_role('button',name='Да, завершить',exact=True).click()
   expect(page.get_by_role('heading',name='Разбор после работы',exact=True)).to_be_visible()
   expect(page.get_by_role('button',name='Проверить',exact=True)).to_be_disabled()
   page.get_by_text('Посмотреть решение',exact=True).click()
   expect(page.locator('.contest-review')).to_contain_text(assessment['tasks'][-1]['exercise']['explanation'])
   if assessment['id']=='week-1':
    with page.expect_download() as info:page.get_by_role('button',name='Скачать результат работы').click()
    download=info.value
    assert download.suggested_filename=='olymp-week-1.json'
    exported=json.loads(Path(download.path()).read_text())
    assert len(exported['accepted'])==2
    page.get_by_role('button',name='Новая попытка',exact=True).click()
    page.get_by_role('button',name='Заменить попытку',exact=True).click()
    expect(page.locator('.assessment-note')).to_contain_text('Повторная попытка')
    expect(page.locator('.contest-score')).to_have_text('Зачтено: 0 из 2')
    expect(page.locator('.cm-content')).to_have_text('')
    page.reload()
    expect(page.locator('.assessment-note')).to_contain_text('Повторная попытка')
   print('PASS: real browser solutions, hidden review, reload and finish:',assessment['id'],flush=True)
  assert page.evaluate('localStorage.getItem("olymp-learning-v1")')==learning
  assert page.evaluate('localStorage.getItem("olymp-micro-v1")')==micro_saved
  for key in ['olymp-contest-v1','olymp-final-contest-v1']:assert page.evaluate('(key)=>localStorage.getItem(key)',key)==old_tours
  # Reload after deadline expires at the work-specific 30-minute limit.
  page.evaluate('''() => {let s=JSON.parse(localStorage.getItem('olymp-assessment-week-1-v1'));s.startedAt=Date.now()-31*60000;s.accepted={};s.finishedAt=null;localStorage.setItem('olymp-assessment-week-1-v1',JSON.stringify(s));}''')
  page.goto(url+'/#/assessment/week-1')
  expect(page.locator('.contest-clock')).to_have_text('Работа завершена')
  expect(page.get_by_role('button',name='Проверить',exact=True)).to_be_disabled()
  page.goto(url+'/#/assessments')
  expect(page.locator('.assessment-card').nth(0)).to_contain_text('Завершена')
  # Each week exposes its own work; no problem conditions shown by the hub.
  for week in range(1,9):
   page.goto(url+f'/#/week/{week}')
   expect(page.get_by_role('link',name='Самостоятельная работа недели',exact=True)).to_have_attribute('href',f'#/assessment/week-{week}')
  mobile=ctx.new_page()
  mobile.set_viewport_size({'width':390,'height':844})
  for route,name in [('lesson/accumulate','micro-mobile'),('assessments','assessments-mobile'),('assessment/new-final','new-final-mobile')]:
   mobile.goto(url+'/#/'+route,wait_until='networkidle')
   if route.startswith('lesson/'):
    expect(mobile.locator('[data-micro-id="sum-trace"]')).to_be_visible()
   elif route == 'assessments':
    expect(mobile.locator('.assessment-card')).to_have_count(9)
   else:
    expect(mobile.get_by_role('heading',name='Новый итоговый вариант',exact=True)).to_be_visible()
    expect(mobile.locator('.contest-review')).to_be_visible()
    expect(mobile.locator('.cm-content')).to_be_visible()
   assert mobile.evaluate('document.documentElement.scrollWidth <= innerWidth'),route
   mobile.screenshot(path=str(artifacts/(name+'.png')),full_page=True,animations='disabled')
  # Visiting a lesson in the mobile page legitimately changes lastExercise.
  learning_after_mobile=page.evaluate('localStorage.getItem("olymp-learning-v1")')
  # Corrupt new data must not discard existing course progress.
  page.evaluate('localStorage.setItem("olymp-assessment-week-2-v1", "broken")')
  page.goto(url+'/#/assessment/week-2')
  expect(page.locator('.storage-warning')).to_contain_text('Не удалось прочитать')
  assert page.evaluate('localStorage.getItem("olymp-learning-v1")')==learning_after_mobile
  assert errors==[],errors
  print(f'PASS: {len(micros)} interactive steps and {total} new cases in Pyodide; persistence, isolated saves, export, expiry, repeat warning and mobile layouts',flush=True)
  browser.close()

if __name__=='__main__':browser_checks(content())
