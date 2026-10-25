"""Check new teaching data against independently expressed task specifications."""


def check_week_two(lessons):
    tasks = {task['id']: task for lesson in lessons for task in lesson['exercises']}
    # Segments read from the original PDF diagram, rather than the string templates.
    segments = {
        'T': [(0, c) for c in range(5)],
        'M': [(4, c) for c in range(5)],
        'B': [(8, c) for c in range(5)],
        'L': [(r, 0) for r in range(5)],
        'R': [(r, 4) for r in range(5)],
        'l': [(r, 0) for r in range(4, 9)],
        'r': [(r, 4) for r in range(4, 9)],
        'D': [(r, 4-r) for r in range(5)],
        'd': [(r, 8-r) for r in range(4, 9)],
    }
    masks = ['TLRlrB', 'DRr', 'TRdB', 'TDMd', 'LRMr', 'TLMrB', 'DMlrB', 'TDl', 'TLMRlrB', 'TLMRd']
    patterns = {}
    for digit, mask in enumerate(masks):
        cells = {point for segment in mask for point in segments[segment]}
        patterns[str(digit)] = '\n'.join(''.join('#' if (r, c) in cells else '.' for c in range(5)) for r in range(9))
    lesson = next(item for item in lessons if item['id'] == 'font')
    assert lesson['referencePatterns'] == patterns, 'Font differs from PDF segment diagram'
    assert {case['input'] for case in tasks['font-3']['tests']} == set(patterns)
    assert len(set(patterns.values())) == 10

    expected = {
        'comparisons-1': lambda n: str(n >= 50),
        'comparisons-2': lambda a, b: str(a == b),
        'comparisons-3': lambda n: str(n in range(0, 1001, 3)),
        'branches-1': lambda n: ['EVEN', 'ODD'][n % 2],
        'branches-2': lambda a, b: str(max(a, b)),
        'branches-3': lambda age: 'Подожди' if age < 14 else 'Доступ открыт',
        'many-cases-1': lambda n: {-1: 'Отрицательное', 0: 'Ноль', 1: 'Положительное'}[(n > 0) - (n < 0)],
        'many-cases-2': lambda age: str(40 * ((age >= 7) + (age >= 18))),
        'many-cases-3': lambda score: ['Пока без медали', 'Бронза', 'Серебро', 'Золото'][sum(score >= threshold for threshold in [50, 80, 95])],
        'logic-1': lambda n: 'YES' if n in range(10, 21) else 'NO',
        'logic-2': lambda day: 'Выходной' if day in (6, 7) else 'Учебный день',
        'logic-3': lambda age, blocked: 'Нельзя' if age < 14 or blocked else 'Можно',
        'font-1': lambda: '###\n#.#\n###',
        'font-2': lambda digit: patterns[str(digit)],
        'font-3': lambda digit: patterns[str(digit)],
    }
    for task_id, evaluate in expected.items():
        task = tasks[task_id]
        for case in [task['sample'], *task['tests']]:
            assert case['expected'] == evaluate(*map(int, case['input'].split())), (task_id, case)
    all_ids = [task['id'] for lesson in lessons for task in lesson['exercises']]
    assert len(all_ids) == len(set(all_ids))
    assert [lesson['number'] for lesson in lessons] == [f'{i:02d}' for i in range(1, len(lessons) + 1)]
    print('PASS: all new sample/test expectations independently checked, including 10 PDF digit geometries', flush=True)


def check_week_three(lessons):
    import contextlib
    import io
    tasks = {task['id']: task for lesson in lessons for task in lesson['exercises']}
    def lines(values):
        return '\n'.join(map(str, values))
    def expected(task_id, raw):
        parts = raw.split()
        n = int(parts[0])
        if task_id == 'repeat-1': return '\n'.join(['Я могу!'] * n)
        if task_id == 'repeat-2': return lines(range(1, n + 1))
        if task_id == 'repeat-3': return lines(i ** 2 for i in range(1, n + 1))
        if task_id == 'accumulate-1': return str(n * (n + 1) // 2)
        if task_id == 'accumulate-2': return str(sum(map(int, parts[1:])))
        if task_id == 'accumulate-3': return str(sum(int(x) >= 60 for x in parts[1:]))
        if task_id == 'while-1': return lines([*reversed(range(n + 1)), 'Старт!'])
        if task_id == 'while-2': return str((n - 1).bit_length())
        if task_id == 'while-3': return str(sum(map(int, str(n))))
        if task_id == 'memory-1': return str(n * 1000)
        if task_id == 'memory-2': return lines([n >> 10, n & 1023])
        if task_id in ('memory-3', 'bytes-3'):
            power = ['KB', 'MB', 'GB', 'TB', 'PB'].index(parts[1]) + 1
            n *= 10 ** (3 * power)
            if task_id == 'memory-3': return str(n)
        # Independent oracle: fixed-width binary groups, not repeated division.
        highest = 2 if task_id == 'bytes-1' else 5
        return lines((n >> (10 * i)) & 1023 for i in range(highest, -1, -1))
    for lesson in lessons:
        if lesson['week'] != 3: continue
        for task in lesson['exercises']:
            for case in [task['sample'], *task['tests']]:
                assert expected(task['id'], case['input']) == case['expected'], (task['id'], case)
    final = tasks['bytes-3']
    pdf_samples = [('2\nGB', '0\n0\n1\n883\n357\n0'),
                   ('512\nKB', '0\n0\n0\n0\n500\n0'),
                   ('42\nMB', '0\n0\n0\n40\n55\n640')]
    for raw, result in pdf_samples:
        assert {'input': raw, 'expected': result} in final['tests']
    compiled = compile(final['solution'], 'task-b.py', 'exec')
    for unit in ['KB', 'MB', 'GB', 'TB', 'PB']:
        for volume in range(1, 1025):
            raw = f'{volume}\n{unit}'
            data = iter(raw.splitlines())
            output = io.StringIO()
            with contextlib.redirect_stdout(output):
                exec(compiled, {'input': lambda: next(data)})
            actual = output.getvalue().rstrip('\n')
            assert actual == expected('bytes-3', raw), (raw, actual)
    # The published checks reject common plausible mistakes, not just syntax errors.
    mutants = [final['solution'].replace('1000', '1024'),
               final['solution'].replace('    n = n % unit', ''),
               final['solution'].replace('range(5, -1, -1)', 'range(5, 0, -1)')]
    for mutant in mutants:
        rejected = False
        for case in final['tests']:
            data = iter(case['input'].splitlines())
            output = io.StringIO()
            with contextlib.redirect_stdout(output):
                exec(mutant, {'input': lambda: next(data)})
            rejected |= output.getvalue().rstrip('\n') != case['expected']
        assert rejected, 'Task B checks missed a common mistake'
    print('PASS: week-three expectations, 3 PDF samples, all 5120 task-B inputs and common wrong solutions', flush=True)


def check_week_four(lessons):
    # Independently transcribed names from PDF p. 5; decade groups build an oracle
    # without reusing the student solution's numeric-key lookup or branch chain.
    ones = 'one two three four five six seven eight nine'.split()
    teens = 'ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen'.split()
    decades = 'twenty thirty forty fifty sixty seventy eighty ninety'.split()
    names = ['', *ones, *teens]
    for decade in decades:
        names.extend([decade, *[f'{decade}-{one}' for one in ones]])
    years = {1900: 'nineteen hundred', 2000: 'two thousand'}
    years.update({1900+i: 'nineteen oh '+word for i, word in enumerate(ones, 1)})
    years.update({1900+i: 'nineteen '+names[i] for i in range(10, 100)})
    years.update({2000+i: 'two thousand '+word for i, word in enumerate(ones, 1)})
    years.update({2000+i: 'twenty '+names[i] for i in range(10, 27)})
    assert len(years) == 127
    tasks = {task['id']: task for lesson in lessons for task in lesson['exercises']}
    def expected(task_id, raw):
        lines = raw.splitlines()
        if task_id == 'text-1': return str(len(raw))
        if task_id == 'text-2': return raw[0] + '\n' + raw[-1]
        if task_id == 'text-3': return '-'.join(lines)
        if task_id == 'lists-1': return (['zero'] + ones)[int(raw)]
        if task_id == 'lists-2': return '\n'.join(reversed(lines[1:]))
        if task_id == 'lists-3': return str(int(lines[1]) + int(lines[-1]))
        if task_id == 'dictionaries-1': return {'ru':'Привет','en':'Hello','ky':'Салам'}[raw]
        if task_id == 'dictionaries-2': return names[int(raw)]
        if task_id == 'dictionaries-3': return {'cat':'кот','dog':'собака','bird':'птица'}.get(raw, 'Неизвестно')
        if task_id.startswith('number-words-'): return names[int(raw)]
        if task_id.startswith('years-'): return years[int(raw)]
        raise AssertionError(task_id)
    for lesson in lessons:
        if lesson['week'] != 4: continue
        for task in lesson['exercises']:
            for case in [task['sample'], *task['tests']]:
                assert case['expected'] == expected(task['id'], case['input']), (task['id'], case)
    final = tasks['years-3']
    assert {int(case['input']) for case in final['tests']} == set(range(1900, 2027))
    pdf_samples = {2026:'twenty twenty-six', 1900:'nineteen hundred', 2000:'two thousand',
                   1905:'nineteen oh five', 2007:'two thousand seven', 1940:'nineteen forty'}
    for year, answer in pdf_samples.items():
        assert {'input': str(year), 'expected': answer} in final['tests']
    import contextlib
    import io
    def run(code, raw):
        data = iter(raw.splitlines())
        output = io.StringIO()
        with contextlib.redirect_stdout(output):
            exec(code, {'input': lambda: next(data)})
        return output.getvalue().rstrip('\n')
    for raw, expected_output in years.items():
        assert run(final['solution'], str(raw)) == expected_output, raw
    mutants = [final['solution'].replace('nineteen oh ', 'nineteen zero '),
               final['solution'].replace('elif y < 2010:', 'elif y < 2027:'),
               final['solution'].replace('"-"', '" "'),
               final['solution'].replace('if n % 10 != 0:', 'if n % 10 >= 0:')]
    for mutant in mutants:
        assert any(run(mutant, case['input']) != case['expected'] for case in final['tests'])
    for lesson_id in ('number-words', 'years'):
        table = next(lesson for lesson in lessons if lesson['id'] == lesson_id)['referenceTable']
        assert dict(table['rows']) == {**{str(i):names[i] for i in range(1,20)},
                                      **{str(i):names[i] for i in range(20,100,10)},
                                      '100':'hundred', '1000':'thousand'}
    print('PASS: week-four answers, vocabulary, all 127 years, six PDF samples and common pronunciation mistakes', flush=True)
