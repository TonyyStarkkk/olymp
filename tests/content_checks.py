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


def check_week_five(lessons):
    import ast
    import contextlib
    import io
    from itertools import product
    # Independent geometry: rows are staggered by half a key. No authored
    # diagonal strings or count formulas are used to enumerate allowed words.
    board = {(row, 2 * column + row): letter
             for row, text in enumerate(['qwertyuiop', 'asdfghjkl', 'zxcvbnm'])
             for column, letter in enumerate(text)}
    directions = [(0, 2), (1, 1), (1, -1)]
    def geometric_words(k, chosen=directions):
        words = set()
        for row, column in board:
            for dr, dc in chosen:
                positions = [(row + i * dr, column + i * dc) for i in range(k)]
                if all(position in board for position in positions):
                    words.add(''.join(board[position] for position in positions))
        return words
    allowed = {k: geometric_words(k) for k in range(1, 11)}
    assert [len(allowed[k]) for k in range(1,11)] == [26,55,34,17,14,11,8,5,3,1]
    assert allowed[7] == {'asdfghj','dfghjkl','ertyuio','qwertyu','rtyuiop','sdfghjk','wertyui','zxcvbnm'}
    for word in ['qwerty','tgb','ok','az','rdx','dfgh','ijn']:
        assert word in allowed[len(word)]
    for word in ['wasd','ytrewq','bgt','jmk','rtx','edfv']:
        assert word not in allowed[len(word)]
    tasks = {task['id']: task for lesson in lessons for task in lesson['exercises']}
    def expected(task_id, raw):
        lines = raw.splitlines()
        if task_id == 'enumeration-1':
            n = int(raw)
            return '\n'.join(str(i) for i in range(1,n+1) if n % i == 0)
        if task_id == 'enumeration-2':
            n,m,s = map(int, lines)
            return str(sum(1 <= s-a <= m for a in range(1,n+1)))
        if task_id == 'enumeration-3':
            n = int(raw)
            return '\n'.join(str(x) for x in range(10,100) if 1<=x//10<=n and 1<=x%10<=n and x//10!=x%10)
        if task_id == 'windows-1':
            text,k = lines[0],int(lines[1])
            return '\n'.join(text[start:end] for start in range(len(text)) for end in range(start+1,len(text)+1) if end-start==k)
        if task_id == 'windows-2':
            n,k = map(int, lines)
            return str(max(0,n-k+1))
        if task_id == 'windows-3':
            text, pattern = lines
            return str(sum(text.startswith(pattern, i) for i in range(len(text))))
        if task_id == 'unique-1': return str(len(set(raw)))
        if task_id == 'unique-2': return str(len(set(lines[1:])))
        if task_id == 'unique-3':
            text,k = lines[0],int(lines[1])
            return str(len({text[start:end] for start in range(len(text)) for end in range(start+1,len(text)+1) if end-start==k}))
        if task_id == 'keyboard-1': return str(len(geometric_words(int(raw), [(0,2)])))
        if task_id == 'keyboard-2': return str(len(geometric_words(int(raw), [(1,1),(1,-1)])))
        if task_id == 'keyboard-3': return 'YES' if raw in allowed[len(raw)] else 'NO'
        if task_id.startswith('passwords-'): return str(len(allowed[int(raw)]))
        raise AssertionError(task_id)
    for lesson in lessons:
        if lesson['week'] != 5: continue
        for task in lesson['exercises']:
            for case in [task['sample'], *task['tests']]:
                assert case['expected'] == expected(task['id'], case['input']), (task['id'], case)
    nodes = ast.parse(tasks['keyboard-3']['starter']).body
    lines = next(ast.literal_eval(node.value) for node in nodes if isinstance(node,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='lines' for t in node.targets))
    for k in range(1,11):
        authored = {line[i:i+k] for line in lines for i in range(len(line)-k+1)}
        assert authored == allowed[k], (k, authored ^ allowed[k])
    final = tasks['passwords-3']
    assert {int(case['input']) for case in final['tests']} == set(range(1,11))
    assert {'input':'3','expected':'34'} in final['tests']
    assert {'input':'7','expected':'8'} in final['tests']
    def run(code, raw):
        data = iter(raw.splitlines())
        output = io.StringIO()
        with contextlib.redirect_stdout(output):
            exec(code, {'input': lambda: next(data)})
        return output.getvalue().rstrip('\n')
    for k in range(1,11):
        assert run(final['solution'], str(k)) == str(len(allowed[k]))
    mutants = [tasks['passwords-2']['starter'],
               final['solution'].replace('len(line) - k + 1','len(line) - k'),
               final['solution'].replace('"ik", "ol"','"ik"'),
               final['solution'].replace('len(line) >= k','len(line) > k')]
    for mutant in mutants:
        assert any(run(mutant, case['input']) != case['expected'] for case in final['tests'])
    # Repeated-character strings exercise overlap and deduplication separately.
    for length in range(1,6):
        for letters in product('ab', repeat=length):
            text = ''.join(letters)
            for k in range(1,length+2):
                raw = f'{text}\n{k}'
                assert run(tasks['unique-3']['solution'],raw) == expected('unique-3',raw)
    print('PASS: week-five answers, complete keyboard geometry, PDF examples, all ten lengths and overlapping/unique windows', flush=True)


def check_week_six(lessons):
    import contextlib
    from functools import lru_cache
    from itertools import product
    import io
    import json
    import subprocess

    tasks = {task['id']: task for lesson in lessons for task in lesson['exercises']}

    @lru_cache(None)
    def longest(r, g, b, previous=-1):
        counts = (r, g, b)
        best = 0
        for color, count in enumerate(counts):
            if count and color != previous:
                remaining = list(counts)
                remaining[color] -= 1
                best = max(best, 1 + longest(*remaining, color))
        return best

    def run(code, raw):
        data = iter(raw.split('\n'))
        output = io.StringIO()
        with contextlib.redirect_stdout(output):
            exec(code, {'input': lambda: next(data)})
        return output.getvalue().rstrip('\n')

    def expected(task_id, raw):
        if task_id.startswith('neighbors-'):
            raw = raw.rstrip('\n')
            bad = sum(left == right for left, right in zip(raw, raw[1:]))
            return ('YES' if bad == 0 else 'NO') if task_id == 'neighbors-2' else str(bad)
        ns = list(map(int, raw.splitlines()))
        if task_id == 'extremes-1': return str(sorted(ns)[-1])
        if task_id == 'extremes-2': return str(sum(sorted(ns)[:2]))
        if task_id == 'extremes-3': return str(sorted(ns)[0])
        if task_id == 'separators-1': return str(ns[0] + 1)
        if task_id == 'efficiency-1': return str(ns[0] ** 2)
        if task_id == 'efficiency-2': return str(ns[0] * (ns[0] + 1) // 2)
        if task_id == 'separators-2': ns.append(0)
        if max(ns) <= 8:
            size = longest(*ns)
        else:
            a, b, c = sorted(ns)
            # Discard only the excess of the last group; independent form of the bound.
            size = a + b + c - max(0, c - a - b - 1)
        if task_id == 'separators-3': return 'YES' if size == sum(ns) else 'NO'
        if task_id == 'efficiency-3': return str(sum(ns) - size)
        if task_id == 'separators-2' or task_id.startswith('cubes-'): return str(size)
        raise AssertionError(task_id)

    for lesson in lessons:
        if lesson['week'] != 6: continue
        assert len(lesson['exercises']) == 3
        for task in lesson['exercises']:
            assert len(task['hints']) == 3
            for case in [task['sample'], *task['tests']]:
                assert case['expected'] == expected(task['id'], case['input']), (task['id'], case)

    # Exact state search tries every legal next cube, without using the teaching formula.
    for counts in product(range(7), repeat=3):
        raw = '\n'.join(map(str, counts))
        size = longest(*counts)
        assert run(tasks['cubes-3']['solution'], raw) == str(size), counts
        assert run(tasks['separators-3']['solution'], raw) == ('YES' if size == sum(counts) else 'NO')
        assert run(tasks['efficiency-3']['solution'], raw) == str(sum(counts) - size)

    # The visual must display a genuinely maximal chain with the right inventories.
    chains = json.loads(subprocess.check_output([
        'node', '--experimental-strip-types', '-e',
        "import {buildCubeChain} from './src/cube-chain.ts'; const result=[]; for(let r=0;r<=6;r++) for(let g=0;g<=6;g++) for(let b=0;b<=6;b++) result.push({counts:[r,g,b],chain:buildCubeChain([r,g,b])}); console.log(JSON.stringify(result));"
    ], text=True))
    for item in chains:
        counts, chain = item['counts'], item['chain']
        assert all(color in (0, 1, 2) for color in chain)
        assert all(a != b for a, b in zip(chain, chain[1:])), item
        assert all(chain.count(color) <= counts[color] for color in range(3)), item
        assert len(chain) == longest(*counts), item

    final = tasks['cubes-3']
    explicit = {
        '0\n2\n2': '4', '5\n3\n4': '12', '1\n0\n4': '3',
        '0\n0\n0': '0', '3\n1\n1': '5', '4\n1\n1': '5',
        '1000000000\n1000000000\n1000000000': '3000000000',
        '1000000000\n499999999\n500000000': '1999999999',
        '1000000000\n499999999\n499999999': '1999999997',
    }
    indexed = {case['input']: case['expected'] for case in final['tests']}
    for raw, result in explicit.items():
        assert indexed[raw] == result
        assert run(final['solution'], raw) == result
    mutants = [tasks['cubes-2']['starter'],
               final['solution'].replace('2 * others + 1', '2 * others'),
               final['solution'].replace('max(r, g, b)', 'r'),
               final['solution'].replace('min(total, 2 * others + 1)', 'total'),
               final['solution'].replace('min(total, 2 * others + 1)', 'max(total, 2 * others + 1)')]
    for mutant in mutants:
        assert any(run(mutant, case['input']) != case['expected'] for case in final['tests'])
    for n in range(7):
        for chars in product('RG', repeat=n):
            raw = ''.join(chars)
            assert run(tasks['neighbors-2']['solution'], raw) == expected('neighbors-2', raw)
    assert 'RGBGRBRBRGBR'.count('R') == 5
    assert 'RGBGRBRBRGBR'.count('G') == 3
    assert 'RGBGRBRBRGBR'.count('B') == 4
    print('PASS: week-six answers, 343 exhaustive cube inventories and visual chains, PDF samples, billion-scale boundaries and incorrect-solution rejection', flush=True)


def check_week_seven(lessons):
    from bisect import bisect_right
    import contextlib
    from functools import lru_cache
    import io
    import random

    tasks = {task['id']: task for lesson in lessons for task in lesson['exercises']}
    compiled = {key: compile(task['solution'], key, 'exec') for key, task in tasks.items() if key.startswith(('sets-', 'next-small-', 'prefixes-', 'viral-', 'tour-plan-'))}
    def run(task_id, raw, code=None):
        data = iter(raw.split('\n'))
        output = io.StringIO()
        with contextlib.redirect_stdout(output):
            exec(code or compiled[task_id], {'input': lambda: next(data)})
        return output.getvalue().rstrip('\n')

    def unique(n):
        mask = 0
        while True:
            n, d = divmod(n, 10)
            if mask & (1 << d): return False
            mask |= 1 << d
            if n == 0: return True

    # Independent search by length and digit-mask state, with a lower bound n+1.
    # It does not use prefix replacements or the reference solution's fallback string.
    def successor(n):
        for length in range(len(str(n + 1)), 11):
            digits = list(map(int, str(n + 1).zfill(length)))
            @lru_cache(None)
            def visit(pos, mask, tight):
                if pos == length: return ''
                lower = digits[pos] if tight else 0
                for d in range(max(lower, int(pos == 0)), 10):
                    if mask & (1 << d): continue
                    tail = visit(pos + 1, mask | (1 << d), tight and d == digits[pos])
                    if tail is not None: return str(d) + tail
                return None
            value = visit(0, 0, True)
            if value is not None: return int(value)
        return 0

    def expected(task_id, raw):
        lines = raw.splitlines()
        if task_id == 'sets-1': return str(len({int(d) for d in str(int(raw))}))
        if task_id == 'sets-2': return 'YES' if unique(int(raw)) else 'NO'
        if task_id == 'sets-3': return str(len(set(lines[1:])))
        if task_id == 'next-small-1': return str(successor(int(raw)))
        if task_id == 'next-small-2':
            candidate = successor(int(raw))
            return str(candidate if candidate <= 9999 else 0)
        if task_id in ('next-small-3', 'viral-3'):
            assert len(lines) == 10
            return '\n'.join(str(successor(int(n))) for n in lines)
        if task_id in ('viral-1', 'viral-2'): return str(successor(int(raw)))
        if task_id == 'prefixes-1':
            prefix = str(int(lines[0]))[:int(lines[1])]
            return 'YES' if all(prefix.count(d) == 1 for d in prefix) else 'NO'
        if task_id == 'prefixes-2':
            prefix, length = lines[0], int(lines[1])
            available = sorted(set('0123456789').difference(prefix))
            return prefix + ''.join(available[:length-len(prefix)])
        if task_id == 'prefixes-3':
            k = int(raw)
            return '1' if k == 1 else '10' + ''.join(map(str, range(2, k)))
        if task_id == 'tour-plan-1': return str(max(0, 180-int(raw)))
        if task_id == 'tour-plan-2': return 'YES' if sum(map(int, lines)) <= 180 else 'NO'
        if task_id == 'tour-plan-3': return str(sum(unique(n) for n in range(int(lines[0]), int(lines[1])+1)))
        raise AssertionError(task_id)

    for lesson in lessons:
        if lesson['week'] != 7: continue
        for task in lesson['exercises']:
            assert len(task['hints']) == 3
            for case in [task['sample'], *task['tests']]:
                assert case['expected'] == expected(task['id'], case['input']), (task['id'], case)

    small = [n for n in range(10235) if unique(n)]
    for n in range(10000):
        want = small[bisect_right(small, n)]
        assert successor(n) == want, n
        assert run('viral-1', str(n)) == str(want), n
    rng = random.Random(20261026)
    cases = [rng.randrange(10**10) for _ in range(400)] + [10**k-1 for k in range(1,11)] + [9876543208,9876543209,9876543210,9876543211,8999999999]
    for n in cases:
        want = successor(n)
        assert run('viral-1', str(n)) == str(want), n
        assert want == 0 or (want > n and unique(want)), (n, want)
    # Check all lengths and the mathematical last possible permutation.
    assert successor(0) == 1
    assert successor(98) == 102
    assert successor(9876543209) == 9876543210
    assert successor(9876543210) == successor(9999999999) == 0
    final = tasks['viral-3']
    mutants = [final['solution'].replace('digit > text[pos]', 'digit >= text[pos]'),
               final['solution'].replace('range(10):', 'range(9):', 1),
               final['solution'].replace('if answer == 0 and len(text) < 10:', 'if False:'),
               final['solution'].replace('if len(set(prefix)) == len(prefix):', 'if True:')]
    for mutant in mutants:
        assert any(run('viral-3', case['input'], mutant) != case['expected'] for case in final['tests'])
    print('PASS: week-seven answers, all 10000 small successors, 415 large/boundary searches, ten-query format and common F mistakes', flush=True)


def check_week_eight(lessons):
    import contextlib
    import io
    from itertools import product
    tasks = {task['id']: task for lesson in lessons for task in lesson['exercises']}
    def expected(task_id, raw):
        lines = raw.splitlines()
        if task_id == 'review-basics-1':
            n, k = map(int, lines)
            whole, rest = divmod(n, k)
            return str(whole + bool(rest))
        if task_id == 'review-basics-2': return str(sum(int(v) in range(50,101) for v in lines[1:]))
        if task_id == 'review-basics-3': return str(sum(range(3,int(raw)+1,3)))
        if task_id == 'debugging-1': return str(sum(range(1,int(raw)+1)))
        if task_id == 'debugging-2': return str(len([d for d in range(1,int(raw)+1) if int(raw)%d==0]))
        if task_id == 'debugging-3': return str(sorted(map(int,lines[1:]))[-1]) if int(lines[0]) else 'EMPTY'
        if task_id == 'test-design-1':
            values=list(map(int,lines[1:]))
            return str(next((i//2+1 for i in range(0,len(values),2) if values[i]!=values[i+1]),0))
        if task_id == 'test-design-2':
            r,g,b=map(int,lines[:3])
            text=lines[3]
            valid=all(text.count(color)<=stock for color,stock in zip('RGB',(r,g,b))) and all(a!=b for a,b in zip(text,text[1:]))
            return 'YES' if valid else 'NO'
        if task_id == 'test-design-3':
            n,v=map(int,lines)
            chars=str(v)
            return 'YES' if v>n and all(chars.count(d)==1 for d in chars) else 'NO'
        if task_id == 'review-olympiad-1':
            # Already verified against the independent keyboard geometry in week five.
            counts={case['input']:case['expected'] for case in tasks['passwords-3']['tests']}
            assert len(lines)==int(lines[0])+1
            return '\n'.join(counts[k] for k in lines[1:])
        if task_id == 'review-olympiad-2':
            a,b,c=sorted(map(int,lines))
            return str(a+b+c-max(0,c-a-b-1))
        if task_id == 'review-olympiad-3':
            return next(c['expected'] for c in tasks['viral-3']['tests'] if c['input']==raw)
        if task_id == 'ready-1': return str(sum(int(v)==0 for v in lines[1:]))
        if task_id == 'ready-2':
            ns=list(map(int,lines));remaining=ns[-1];count=0
            for duration in ns[:-1]:
                if duration>remaining: break
                remaining-=duration;count+=1
            return str(count)
        if task_id == 'ready-3': return str(sum(d for d in range(10) if str(d) in str(int(raw))))
        raise AssertionError(task_id)
    def run(code, raw):
        data=iter(raw.split('\n'));output=io.StringIO()
        with contextlib.redirect_stdout(output): exec(code,{'input':lambda:next(data)})
        return output.getvalue().rstrip('\n')
    new=[lesson for lesson in lessons if lesson['week']==8]
    assert len(new)==5
    assert len(lessons)==40
    assert len({lesson['id'] for lesson in lessons})==40
    assert len(tasks)==120
    for lesson in new:
        assert len(lesson['exercises'])==3
        for task in lesson['exercises']:
            assert len(task['hints'])==3
            for case in [task['sample'],*task['tests']]:
                assert case['expected']==expected(task['id'],case['input']),(task['id'],case)
    # Exhaust short stock/chain combinations, including the empty line in real stdin form.
    for stocks in product(range(3), repeat=3):
        for size in range(4):
            for letters in product('RGB',repeat=size):
                word=''.join(letters)
                raw='\n'.join(map(str,stocks))+'\n'+word+('\n' if not word else '')
                assert run(tasks['test-design-2']['solution'],raw)==expected('test-design-2',raw),(stocks,word)
    for ns in product(range(3),repeat=6):
        for budget in (0,3,6):
            raw='\n'.join(map(str,(*ns,budget)))
            assert run(tasks['ready-2']['solution'],raw)==expected('ready-2',raw)
    for task_id in ['debugging-1','debugging-2','debugging-3','review-olympiad-2','review-olympiad-3']:
        task=tasks[task_id];rejected=False
        for case in task['tests']:
            try: rejected |= run(task['starter'],case['input'])!=case['expected']
            except (NameError,ZeroDivisionError,IndexError): rejected=True
        assert rejected,task_id
    # These examples deliberately demonstrate necessary properties, not optimality.
    assert run(tasks['test-design-2']['solution'],'5\n1\n0\nR')=='YES'
    assert run(tasks['test-design-3']['solution'],'99\n123')=='YES'
    print('PASS: week-eight expectations, all 40 lessons/120 tasks, 1080 stock/chain checks, 2187 ordered budgets, empty input and faulty-starter rejection',flush=True)
