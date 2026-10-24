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
