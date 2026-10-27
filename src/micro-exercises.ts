export type MicroExercise = {
  id: string;
  lessonId: string;
  afterSection: number;
  title: string;
  prompt: string;
  code?: string;
  tip: string;
  explanation: string;
} & (
  | { kind: "fill"; fields: { label: string; answers: string[] }[] }
  | { kind: "order"; steps: string[]; initial: number[] }
);
export const microExercises: MicroExercise[] = [
  {
    id: "value-change",
    lessonId: "variables",
    afterSection: 2,
    kind: "fill",
    title: "Что хранится сейчас?",
    prompt: "Впиши значение points после каждой указанной строки.",
    code: "points = 4\npoints = points + 3\npoints = points * 2",
    fields: [
      {
        label: "После строки 1",
        answers: ["4"],
      },
      {
        label: "После строки 2",
        answers: ["7"],
      },
      {
        label: "После строки 3",
        answers: ["14"],
      },
    ],
    tip: "Вычисляй строки сверху вниз: следующая строка получает уже изменённое значение.",
    explanation:
      "Сначала 4, затем 4 + 3 = 7, затем 7 × 2 = 14. Присваивание заменяет прежнее значение, а не хранит формулу.",
  },
  {
    id: "input-convert",
    lessonId: "input",
    afterSection: 1,
    kind: "fill",
    title: "Число или текст?",
    prompt:
      "На входе в обоих случаях строка 8. Впиши вывод каждой программы без кавычек.",
    code: 'a = input()\nprint(a + "2")\n\n# Другая программа с тем же вводом:\na = int(input())\nprint(a + 2)',
    fields: [
      {
        label: "Первая программа",
        answers: ["82"],
      },
      {
        label: "Вторая программа",
        answers: ["10"],
      },
    ],
    tip: "Посмотри, где текст превращается в число.",
    explanation:
      'input возвращает текст: "8" + "2" даёт "82". int превращает 8 в число, поэтому во второй программе получается 10.',
  },
  {
    id: "division-parts",
    lessonId: "division",
    afterSection: 1,
    kind: "fill",
    title: "Разложи на группы",
    prompt: "Есть 17 предметов, в группе 5. Впиши два числа.",
    code: "n = 17\nk = 5",
    fields: [
      {
        label: "n // k",
        answers: ["3"],
      },
      {
        label: "n % k",
        answers: ["2"],
      },
    ],
    tip: "Проверь: число групп × вместимость + остаток должно дать 17.",
    explanation:
      "Три полные группы используют 15 предметов, остаются 2. Проверка: 3 × 5 + 2 = 17.",
  },
  {
    id: "plan-input",
    lessonId: "checkpoint",
    afterSection: 1,
    kind: "order",
    title: "Сначала план",
    prompt:
      "Нужно прочитать цену и количество, затем вывести общую стоимость. Переставь шаги кнопками вверх и вниз.",
    steps: [
      "Прочитать цену и количество",
      "Вычислить цену × количество",
      "Вывести полученную стоимость",
    ],
    initial: [2, 0, 1],
    tip: "Выражение нельзя вычислить, пока его данные не прочитаны.",
    explanation:
      "Порядок: получить исходные данные → вычислить результат → вывести его.",
  },
  {
    id: "if-trace",
    lessonId: "branches",
    afterSection: 2,
    kind: "fill",
    title: "Какая ветка выполнится?",
    prompt: "Впиши вывод для каждого возраста. Одно число в каждом поле.",
    code: "age = int(input())\nif age >= 14:\n    price = 80\nelse:\n    price = 40\nprint(price)",
    fields: [
      {
        label: "age = 13",
        answers: ["40"],
      },
      {
        label: "age = 14",
        answers: ["80"],
      },
      {
        label: "age = 15",
        answers: ["80"],
      },
    ],
    tip: "Знак >= включает саму границу 14. Выполняется только одна ветка.",
    explanation:
      "До 14 лет срабатывает else, с 14 включительно — if. Поэтому ответы: 40, 80, 80.",
  },
  {
    id: "if-vs-elif",
    lessonId: "many-cases",
    afterSection: 2,
    kind: "fill",
    title: "Два отдельных условия",
    prompt:
      "Здесь два if, не цепочка if / elif. Впиши число в каждой строке вывода.",
    code: "score = 90\nif score >= 80:\n    print(1)\nif score >= 50:\n    print(2)",
    fields: [
      {
        label: "Первая строка вывода",
        answers: ["1"],
      },
      {
        label: "Вторая строка вывода",
        answers: ["2"],
      },
    ],
    tip: "После первого if программа продолжает работу и отдельно проверяет второй.",
    explanation:
      "Оба условия истинны. Два if выполняются независимо; elif проверялся бы только после ложного первого условия.",
  },
  {
    id: "range-trace",
    lessonId: "repeat",
    afterSection: 2,
    kind: "fill",
    title: "Проследи три прохода",
    prompt: "Впиши i и напечатанное число для каждого прохода.",
    code: "for i in range(1, 4):\n    print(i * 2)",
    fields: [
      {
        label: "Проход 1: i",
        answers: ["1"],
      },
      {
        label: "Проход 1: вывод",
        answers: ["2"],
      },
      {
        label: "Проход 2: i",
        answers: ["2"],
      },
      {
        label: "Проход 2: вывод",
        answers: ["4"],
      },
      {
        label: "Проход 3: i",
        answers: ["3"],
      },
      {
        label: "Проход 3: вывод",
        answers: ["6"],
      },
    ],
    tip: "Правая граница 4 не входит. В каждом проходе print вычисляется заново.",
    explanation:
      "i принимает 1, 2, 3. Соответствующий вывод: 2, 4, 6. Прохода с i = 4 нет.",
  },
  {
    id: "sum-trace",
    lessonId: "accumulate",
    afterSection: 0,
    kind: "fill",
    title: "Как растёт сумма?",
    prompt: "Впиши total после каждого прибавления.",
    code: "total = 0\nfor i in range(1, 4):\n    total = total + i",
    fields: [
      {
        label: "После i = 1",
        answers: ["1"],
      },
      {
        label: "После i = 2",
        answers: ["3"],
      },
      {
        label: "После i = 3",
        answers: ["6"],
      },
    ],
    tip: "Новое значение складывается из прежней суммы и текущего i. Не начинай каждый шаг с нуля.",
    explanation:
      "Сумма меняется так: 0 → 1 → 3 → 6. Прибавляются 1, затем 2, затем 3.",
  },
  {
    id: "sum-line",
    lessonId: "accumulate",
    afterSection: 2,
    kind: "fill",
    title: "Допиши одно выражение",
    prompt:
      "Вместо ___ запиши выражение из total, value и знака +. Нужно сложить прочитанные значения, а не номера проходов.",
    code: "n = int(input())\ntotal = 0\nfor i in range(n):\n    value = int(input())\n    total = ___\nprint(total)",
    fields: [
      {
        label: "Выражение вместо ___",
        answers: ["total + value", "value + total"],
      },
    ],
    tip: "i — номер прохода, value — число из входных данных.",
    explanation:
      "total + value сохраняет прежнюю сумму и добавляет очередное прочитанное число.",
  },
  {
    id: "sum-order",
    lessonId: "accumulate",
    afterSection: 3,
    kind: "order",
    title: "Где начало, где итог?",
    prompt:
      "Расставь крупные шаги подсчёта суммы. Шаг с циклом обозначает весь цикл целиком.",
    steps: [
      "Прочитать количество чисел n и создать total = 0",
      "В цикле n раз прочитать число и прибавить его к total",
      "После цикла вывести total",
    ],
    initial: [2, 0, 1],
    tip: "Сумму обнуляют один раз до цикла; окончательный результат выводят после него.",
    explanation:
      "Читаем количество → создаём нулевую сумму → обрабатываем все значения → выводим итог.",
  },
  {
    id: "while-trace",
    lessonId: "while",
    afterSection: 1,
    kind: "fill",
    title: "Когда остановится цикл?",
    prompt: "Впиши n после каждого прохода и число выполнений тела.",
    code: "n = 5\nwhile n > 0:\n    n = n - 2",
    fields: [
      {
        label: "После прохода 1",
        answers: ["3"],
      },
      {
        label: "После прохода 2",
        answers: ["1"],
      },
      {
        label: "После прохода 3",
        answers: ["-1"],
      },
      {
        label: "Всего проходов",
        answers: ["3"],
      },
    ],
    tip: "Условие проверяется перед проходом. Отрицательный результат вычитания допустим.",
    explanation:
      "Значения: 5 → 3 → 1 → −1. При −1 условие n > 0 ложно, четвёртого прохода нет.",
  },
  {
    id: "index-trace",
    lessonId: "text",
    afterSection: 2,
    kind: "fill",
    title: "Позиция и фрагмент",
    prompt: "Впиши результат без кавычек.",
    code: 'text = "python"',
    fields: [
      {
        label: "text[0]",
        answers: ["p"],
      },
      {
        label: "text[2]",
        answers: ["t"],
      },
      {
        label: "text[1:4]",
        answers: ["yth"],
      },
    ],
    tip: "Индексы начинаются с 0. Правая граница среза не включается.",
    explanation: "Позиции: p=0, y=1, t=2, h=3. Срез 1:4 берёт y, t, h.",
  },
  {
    id: "list-trace",
    lessonId: "lists",
    afterSection: 2,
    kind: "fill",
    title: "Добавили значение",
    prompt: "Впиши два числа после выполнения кода.",
    code: "values = [7, 2]\nvalues.append(9)",
    fields: [
      {
        label: "len(values)",
        answers: ["3"],
      },
      {
        label: "values[2]",
        answers: ["9"],
      },
    ],
    tip: "append добавляет один элемент в конец, индексы начинаются с 0.",
    explanation:
      "Получился список [7, 2, 9]. Его длина 3, элемент с индексом 2 равен 9.",
  },
  {
    id: "dictionary-update",
    lessonId: "dictionaries",
    afterSection: 2,
    kind: "fill",
    title: "Изменяем значение по ключу",
    prompt:
      "Словарь можно менять: запись counts[key] = ... сохраняет новое значение только для этого ключа. Впиши значения после кода.",
    code: 'counts = {"A": 0, "B": 0}\nkey = "B"\ncounts[key] = counts[key] + 1\ncounts[key] = counts[key] + 1',
    fields: [
      {
        label: 'counts["A"]',
        answers: ["0"],
      },
      {
        label: 'counts["B"]',
        answers: ["2"],
      },
    ],
    tip: 'key равен "B", поэтому каждое обновление касается только B.',
    explanation:
      "Для B выполнены два прибавления: 0 → 1 → 2. Значение A осталось нулём. Так можно считать голоса по именам.",
  },
  {
    id: "nested-count",
    lessonId: "enumeration",
    afterSection: 1,
    kind: "fill",
    title: "Внутренний цикл начинается заново",
    prompt: "Впиши количество выполнений print.",
    code: "for a in range(2):\n    for b in range(3):\n        print(a, b)",
    fields: [
      {
        label: "Количество строк",
        answers: ["6"],
      },
    ],
    tip: "Для каждого a внутренний цикл выполняет все три прохода.",
    explanation: "Два значения a, для каждого три значения b: 2 × 3 = 6 строк.",
  },
  {
    id: "window-starts",
    lessonId: "windows",
    afterSection: 1,
    kind: "fill",
    title: "Не потеряй последнее окно",
    prompt:
      "У строки из пяти букв рассматривают фрагменты длины 3. Впиши допустимые начальные индексы по порядку.",
    code: 'text = "abcde"\nk = 3',
    fields: [
      {
        label: "Первый индекс",
        answers: ["0"],
      },
      {
        label: "Второй индекс",
        answers: ["1"],
      },
      {
        label: "Последний индекс",
        answers: ["2"],
      },
    ],
    tip: "Фрагмент должен целиком поместиться в строке. Индекс начала 2 ещё допустим.",
    explanation: "Окна: abc, bcd, cde. Начала 0, 1, 2; всего 5 − 3 + 1 = 3.",
  },
  {
    id: "seen-trace",
    lessonId: "unique",
    afterSection: 1,
    kind: "fill",
    title: "Что уже встречалось?",
    prompt: "Впиши длину seen после обработки каждого слова.",
    code: 'seen = []\nfor word in ["cat", "dog", "cat"]:\n    if word not in seen:\n        seen.append(word)',
    fields: [
      {
        label: "После первого слова cat",
        answers: ["1"],
      },
      {
        label: "После dog",
        answers: ["2"],
      },
      {
        label: "После второго cat",
        answers: ["2"],
      },
    ],
    tip: "Проверка not in не даёт добавить знакомое слово ещё раз.",
    explanation:
      "После cat список содержит одно слово, после dog — два. Повтор cat не меняет список.",
  },
  {
    id: "neighbor-trace",
    lessonId: "neighbors",
    afterSection: 2,
    kind: "fill",
    title: "Соседние позиции",
    prompt:
      "Впиши 1, если пара одинаковая, иначе 0. Затем общий счётчик нарушений.",
    code: 'text = "AABB"',
    fields: [
      {
        label: "Позиции 0 и 1",
        answers: ["1"],
      },
      {
        label: "Позиции 1 и 2",
        answers: ["0"],
      },
      {
        label: "Позиции 2 и 3",
        answers: ["1"],
      },
      {
        label: "Нарушений всего",
        answers: ["2"],
      },
    ],
    tip: "Соседи — позиции рядом, не все возможные пары.",
    explanation: "Пары AA, AB, BB. Совпадают AA и BB: два нарушения.",
  },
  {
    id: "separator-trace",
    lessonId: "separators",
    afterSection: 2,
    kind: "fill",
    title: "Два ограничения",
    prompt:
      "Есть 7 красных и 2 синих кубика. Впиши границы и максимальную длину цепочки с разными соседями.",
    code: "r = 7\nb = 2",
    fields: [
      {
        label: "Общий запас",
        answers: ["9"],
      },
      {
        label: "Мест для красных вокруг двух синих",
        answers: ["3"],
      },
      {
        label: "Максимальная длина",
        answers: ["5"],
      },
    ],
    tip: "Два синих разделяют три места для красных: R B R B R.",
    explanation:
      "Можно использовать три красных и два синих: длина 5. Общий запас 9, но остальные красные поставить нельзя.",
  },
  {
    id: "prefix-tail",
    lessonId: "prefixes",
    afterSection: 3,
    kind: "fill",
    title: "Достраиваем по одной цифре",
    prompt:
      "Начало 23 уже выбрано. Нужна запись длины 5 без повторов с наименьшим хвостом. Впиши добавляемые цифры по порядку.",
    code: 'candidate = "23"\nsize = 5',
    fields: [
      {
        label: "Первая новая цифра",
        answers: ["0"],
      },
      {
        label: "Вторая новая цифра",
        answers: ["1"],
      },
      {
        label: "Третья новая цифра",
        answers: ["4"],
      },
    ],
    tip: "На каждом шаге бери наименьшую ещё свободную цифру. Цифры 2 и 3 уже заняты.",
    explanation:
      "Получаются 230 → 2301 → 23014. После 0 и 1 цифры 2 и 3 пропускаем.",
  },
  {
    id: "prefix-reject",
    lessonId: "viral",
    afterSection: 1,
    kind: "fill",
    title: "Какое начало допустимо?",
    prompt:
      "Для n = 1223 рассматриваем два места изменения. Впиши префиксы и YES/NO: есть ли в них только разные цифры.",
    code: 'text = "1223"',
    fields: [
      {
        label: "Префикс при pos = 2",
        answers: ["12"],
      },
      {
        label: "Префикс при pos = 2 без повторов?",
        answers: ["YES"],
      },
      {
        label: "Префикс при pos = 3",
        answers: ["122"],
      },
      {
        label: "Префикс при pos = 3 без повторов?",
        answers: ["NO"],
      },
    ],
    tip: "Позиция pos не входит в text[:pos]. Повтор внутри начала уже нельзя исправить продолжением.",
    explanation:
      "При pos = 2 сохраняется 12 — подходит. При pos = 3 сохраняется 122 — две двойки, такой вариант отбрасывается.",
  },
  {
    id: "candidate-order",
    lessonId: "viral",
    afterSection: 2,
    kind: "order",
    title: "Собери одного кандидата",
    prompt:
      "Расставь шаги для одной выбранной позиции изменения. Неподходящий вариант отбрасывается сразу.",
    steps: [
      "Проверить, что сохранённый префикс не содержит повторов",
      "Выбрать большую цифру, которой ещё нет в префиксе",
      "Дополнить запись наименьшими свободными цифрами до нужной длины",
      "Сравнить полученное число с лучшим найденным ответом",
    ],
    initial: [3, 1, 0, 2],
    tip: "Не достраивай хвост, пока начало ещё не прошло проверки.",
    explanation:
      "Сначала допустимое начало, затем увеличение цифры, минимальный хвост и сравнение с лучшим кандидатом.",
  },
  {
    id: "reset-trace",
    lessonId: "debugging",
    afterSection: 2,
    kind: "fill",
    title: "Почему сумма теряется?",
    prompt:
      "Впиши total после каждого прохода ошибочной программы. Пока не исправляй её.",
    code: "for i in range(1, 4):\n    total = 0\n    total = total + i\nprint(total)",
    fields: [
      {
        label: "После i = 1",
        answers: ["1"],
      },
      {
        label: "После i = 2",
        answers: ["2"],
      },
      {
        label: "После i = 3",
        answers: ["3"],
      },
    ],
    tip: "Внутри каждого прохода total снова становится нулём.",
    explanation:
      "Получаются 1, 2, 3 вместо 1, 3, 6. Чтобы сохранять сумму, обнуление нужно вынести перед циклом.",
  },
  {
    id: "choose-position",
    lessonId: "prefixes",
    afterSection: 2,
    kind: "fill",
    title: "Где удастся увеличить цифру?",
    prompt:
      "Для числа 1987 рассмотрим позиции справа налево: 3, 2, 1, 0. На выбранной позиции нужна большая цифра, которой нет в сохранённом префиксе. Найди первую подходящую позицию в этом порядке и наименьшую допустимую новую цифру.",
    code: 'text = "1987"\n# Позиции: 0 1 2 3',
    fields: [
      {
        label: "Подходящая позиция",
        answers: ["0"],
      },
      {
        label: "Новая цифра",
        answers: ["2"],
      },
    ],
    tip: "На позиции 3 цифры 8 и 9 уже есть в префиксе 198. Продолжи проверять более ранние позиции.",
    explanation:
      "При pos = 3 большие 8 и 9 заняты. При pos = 2 единственная большая цифра 9 уже в начале 19. При pos = 1 больше девятки цифр нет. При pos = 0 начало пустое, можно заменить 1 на 2. Маленький хвост даст 2013. В полном алгоритме рассматриваются все допустимые позиции, затем выбирается минимум.",
  },
  {
    id: "build-one-candidate",
    lessonId: "viral",
    afterSection: 1,
    kind: "fill",
    title: "Собери только одного кандидата",
    prompt:
      "Для 1243 выбраны pos = 2 и новая цифра 5. Сохрани префикс, добавь 5 и дострой запись до четырёх цифр наименьшими свободными цифрами. Заполняй шаги по порядку.",
    code: 'text = "1243"\npos = 2\ndigit = "5"',
    fields: [
      {
        label: "Сохранённый префикс",
        answers: ["12"],
      },
      {
        label: "Префикс вместе с новой цифрой",
        answers: ["125"],
      },
      {
        label: "Наименьшая свободная цифра хвоста",
        answers: ["0"],
      },
      {
        label: "Готовый кандидат",
        answers: ["1250"],
      },
    ],
    tip: "text[:pos] не включает позицию 2. После выбора 5 новая запись уже больше исходной, поэтому хвост можно сделать минимальным.",
    explanation:
      "Получаем 12 → 125 → 1250. Цифра 0 ещё свободна. Это допустимый кандидат, но не обязательно окончательный ответ: другие позиции или цифры могут дать меньший результат.",
  },
  {
    id: "compare-candidates",
    lessonId: "viral",
    afterSection: 2,
    kind: "fill",
    title: "Не потеряй лучший ответ",
    prompt:
      "Впиши answer после каждого кандидата. Все кандидаты уже прошли проверки. Ноль в начале означает, что ответа пока нет.",
    code: "answer = 0\nfor value in [1250, 2013, 1245, 1302]:\n    if answer == 0 or value < answer:\n        answer = value",
    fields: [
      {
        label: "После кандидата 1250",
        answers: ["1250"],
      },
      {
        label: "После кандидата 2013",
        answers: ["1250"],
      },
      {
        label: "После кандидата 1245",
        answers: ["1245"],
      },
      {
        label: "После кандидата 1302",
        answers: ["1245"],
      },
    ],
    tip: "Первый кандидат сохраняется. Каждый следующий заменяет ответ только тогда, когда он меньше прежнего.",
    explanation:
      "1250 сохраняем первым. 2013 хуже — оставляем 1250. 1245 лучше — обновляем. 1302 хуже — оставляем 1245. Минимум кандидатов становится ответом для запроса.",
  },
];
export const MICRO_KEY = "olymp-micro-v1";
export type MicroAttempt = {
  answers: string[];
  checked: boolean;
  revealed: boolean;
};
export type MicroProgress = Record<string, MicroAttempt>;
const normal = (value: string) => value.trim().replace(/\s*\+\s*/g, "+");
export function microMatches(task: MicroExercise, answers: string[]) {
  return task.kind === "fill"
    ? task.fields.map((field, i) =>
        field.answers.some(
          (answer) => normal(answer) === normal(answers[i] ?? ""),
        ),
      )
    : task.steps.map((_, i) => answers[i] === String(i));
}
export function microComplete(task: MicroExercise, attempt?: MicroAttempt) {
  return Boolean(
    attempt?.checked && microMatches(task, attempt.answers).every(Boolean),
  );
}
export function initialAnswers(task: MicroExercise) {
  return task.kind === "fill"
    ? task.fields.map(() => "")
    : task.initial.map(String);
}
export function parseMicroProgress(raw: string | null): MicroProgress {
  if (!raw) return {};
  const parsed = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
    throw new Error("Invalid micro progress");
  const result: MicroProgress = {};
  for (const task of microExercises) {
    const value = parsed[task.id];
    const count = task.kind === "fill" ? task.fields.length : task.steps.length;
    if (
      !value ||
      !Array.isArray(value.answers) ||
      value.answers.length !== count ||
      !value.answers.every(
        (x: unknown) => typeof x === "string" && x.length <= 150,
      )
    )
      continue;
    if (
      task.kind === "order" &&
      (new Set(value.answers).size !== count ||
        value.answers.some(
          (x: string) => !task.steps[Number(x)] || String(Number(x)) !== x,
        ))
    )
      continue;
    result[task.id] = {
      answers: value.answers,
      checked: value.checked === true,
      revealed: value.revealed === true,
    };
  }
  return result;
}
