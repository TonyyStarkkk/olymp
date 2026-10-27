import type { Exercise, Lesson } from "./course";
export type AssessmentTask = { lessonId: string; exercise: Exercise };
export type Assessment = {
  id: string;
  week: number;
  title: string;
  minutes: number;
  tasks: AssessmentTask[];
};
export type ContestTask = {
  letter: string;
  lesson: Pick<Lesson, "id" | "referenceTable" | "referencePatterns">;
  exercise: Exercise;
};
export const assessments: Assessment[] = [
  {
    id: "week-1",
    week: 1,
    title: "Самостоятельная работа · неделя 1",
    minutes: 30,
    tasks: [
      {
        lessonId: "division",
        exercise: {
          id: "ind-1-1",
          title: "Место на трибуне",
          prompt:
            "Места пронумерованы от 1. В каждом ряду k мест. Зрителю досталось место p. Выведи номер ряда, затем номер места внутри этого ряда. Нумерация рядов и мест в ряду начинается с 1. 1 ≤ p ≤ 1000000, 1 ≤ k ≤ 1000.",
          inputHelp: "p и k, каждое на отдельной строке.",
          starter: "",
          sample: {
            input: "17\n8",
            expected: "3\n1",
          },
          tests: [
            {
              input: "17\n8",
              expected: "3\n1",
            },
            {
              input: "1\n8",
              expected: "1\n1",
            },
            {
              input: "8\n8",
              expected: "1\n8",
            },
            {
              input: "9\n8",
              expected: "2\n1",
            },
            {
              input: "1\n1",
              expected: "1\n1",
            },
            {
              input: "1000000\n1000",
              expected: "1000\n1000",
            },
            {
              input: "999999\n37",
              expected: "27027\n37",
            },
          ],
          solution:
            "p = int(input())\nk = int(input())\nprint((p - 1) // k + 1)\nprint((p - 1) % k + 1)",
          explanation:
            "Перед местом p находятся p − 1 мест. Полные ряды перед ним дают номер ряда минус один, остаток — номер места минус один. Для p = k остаёмся в первом ряду, для p = k + 1 переходим во второй.",
          hints: [
            "Посчитай места до зрителя.",
            "Раздели p − 1 на вместимость ряда.",
            "К частному и остатку прибавь 1.",
          ],
        },
      },
      {
        lessonId: "checkpoint",
        exercise: {
          id: "ind-1-2",
          title: "После полуночи",
          prompt:
            "Электронные часы показывают h часов и m минут. Через d минут будильник зазвонит. Какие часы и минуты будут на табло? Выведи их на двух строках, обычными числами без ведущих нулей. 0 ≤ h ≤ 23, 0 ≤ m ≤ 59, 0 ≤ d ≤ 100000.",
          inputHelp: "h, m, d на трёх строках.",
          starter: "",
          sample: {
            input: "23\n50\n25",
            expected: "0\n15",
          },
          tests: [
            {
              input: "23\n50\n25",
              expected: "0\n15",
            },
            {
              input: "0\n0\n0",
              expected: "0\n0",
            },
            {
              input: "12\n59\n1",
              expected: "13\n0",
            },
            {
              input: "23\n59\n1",
              expected: "0\n0",
            },
            {
              input: "7\n3\n2880",
              expected: "7\n3",
            },
            {
              input: "23\n59\n100000",
              expected: "10\n39",
            },
          ],
          solution:
            "h = int(input())\nm = int(input())\nd = int(input())\ntotal = h * 60 + m + d\nprint(total // 60 % 24)\nprint(total % 60)",
          explanation:
            "Переведи начало в минуты и добавь ожидание. Часы повторяются через 24, минуты — через 60. Даже несколько прошедших суток не меняют способ расчёта.",
          hints: [
            "Сначала вырази всё время в минутах.",
            "На табло нет часов 24 и больше.",
            "Часы: total // 60 % 24; минуты: total % 60.",
          ],
        },
      },
    ],
  },
  {
    id: "week-2",
    week: 2,
    title: "Самостоятельная работа · неделя 2",
    minutes: 30,
    tasks: [
      {
        lessonId: "many-cases",
        exercise: {
          id: "ind-2-1",
          title: "Доставка заказа",
          prompt:
            "Стоимость заказа s сомов. При s ≥ 1000 доставка бесплатная в любую зону. Для меньшего заказа доставка в зону 1 стоит 100 сомов, в зону 2 — 180. Выведи общую сумму к оплате вместе с доставкой. 0 ≤ s ≤ 100000; зона z равна 1 или 2.",
          inputHelp: "s, затем z на отдельной строке.",
          starter: "",
          sample: {
            input: "999\n1",
            expected: "1099",
          },
          tests: [
            {
              input: "999\n1",
              expected: "1099",
            },
            {
              input: "999\n2",
              expected: "1179",
            },
            {
              input: "0\n1",
              expected: "100",
            },
            {
              input: "0\n2",
              expected: "180",
            },
            {
              input: "1\n1",
              expected: "101",
            },
            {
              input: "1\n2",
              expected: "181",
            },
            {
              input: "1000\n1",
              expected: "1000",
            },
            {
              input: "1000\n2",
              expected: "1000",
            },
            {
              input: "1001\n1",
              expected: "1001",
            },
            {
              input: "1001\n2",
              expected: "1001",
            },
            {
              input: "100000\n1",
              expected: "100000",
            },
            {
              input: "100000\n2",
              expected: "100000",
            },
          ],
          solution:
            "s = int(input())\nz = int(input())\nif s >= 1000:\n    fee = 0\nelif z == 1:\n    fee = 100\nelse:\n    fee = 180\nprint(s + fee)",
          explanation:
            "Бесплатная доставка имеет приоритет над зоной. Сначала исключи этот случай, затем выбери тариф. Выводится стоимость заказа вместе с тарифом.",
          hints: [
            "Отдели бесплатные заказы.",
            "Для остальных тариф зависит от зоны.",
            "Сначала s >= 1000, затем z == 1, иначе зона 2.",
          ],
        },
      },
      {
        lessonId: "logic",
        exercise: {
          id: "ind-2-2",
          title: "Общее время",
          prompt:
            "Первый кружок занимает кабинет с минуты a до минуты b включительно. Второй — с c до d включительно. Выведи YES, если есть хотя бы одна минута, которая нужна обоим, иначе NO. 0 ≤ a ≤ b ≤ 1440, 0 ≤ c ≤ d ≤ 1440.",
          inputHelp: "a, b, c, d на четырёх строках.",
          starter: "",
          sample: {
            input: "10\n20\n20\n30",
            expected: "YES",
          },
          tests: [
            {
              input: "10\n20\n20\n30",
              expected: "YES",
            },
            {
              input: "0\n1\n2\n3",
              expected: "NO",
            },
            {
              input: "10\n40\n20\n30",
              expected: "YES",
            },
            {
              input: "30\n40\n10\n20",
              expected: "NO",
            },
            {
              input: "7\n7\n7\n7",
              expected: "YES",
            },
            {
              input: "0\n1440\n0\n1440",
              expected: "YES",
            },
            {
              input: "9\n10\n0\n9",
              expected: "YES",
            },
          ],
          solution:
            'a = int(input())\nb = int(input())\nc = int(input())\nd = int(input())\nif a <= d and c <= b:\n    print("YES")\nelse:\n    print("NO")',
          explanation:
            "Пересечения нет, когда один промежуток целиком раньше другого. Совпавшая граничная минута считается общей, поэтому равенство разрешено.",
          hints: [
            "Нарисуй два отрезка времени.",
            "Когда один закончился раньше начала другого, пересечения нет.",
            "Пересечение: a <= d and c <= b.",
          ],
        },
      },
    ],
  },
  {
    id: "week-3",
    week: 3,
    title: "Самостоятельная работа · неделя 3",
    minutes: 30,
    tasks: [
      {
        lessonId: "accumulate",
        exercise: {
          id: "ind-3-1",
          title: "Серия тренировок",
          prompt:
            "В дневнике n дней. Для каждого дня записана 1, если ученик тренировался, и 0, если отдыхал. Найди наибольшее количество тренировочных дней подряд. При n = 0 ответ 0. 0 ≤ n ≤ 30.",
          inputHelp: "n, затем n строк с 0 или 1.",
          starter: "",
          sample: {
            input: "6\n1\n1\n0\n1\n1\n1",
            expected: "3",
          },
          tests: [
            {
              input: "6\n1\n1\n0\n1\n1\n1",
              expected: "3",
            },
            {
              input: "0",
              expected: "0",
            },
            {
              input: "1\n0",
              expected: "0",
            },
            {
              input: "1\n1",
              expected: "1",
            },
            {
              input: "8\n0\n0\n0\n0\n0\n0\n0\n0",
              expected: "0",
            },
            {
              input:
                "30\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1",
              expected: "30",
            },
            {
              input: "5\n1\n1\n1\n0\n1",
              expected: "3",
            },
            {
              input: "4\n1\n0\n1\n0",
              expected: "1",
            },
          ],
          solution:
            "n = int(input())\ncurrent = 0\nbest = 0\nfor i in range(n):\n    day = int(input())\n    if day == 1:\n        current = current + 1\n    else:\n        current = 0\n    if current > best:\n        best = current\nprint(best)",
          explanation:
            "current хранит длину серии, которая заканчивается сегодня. Отдых обнуляет её. best сохраняет самую длинную встреченную серию; его нельзя обнулять вместе с current.",
          hints: [
            "Отдых прерывает текущую серию.",
            "Храни отдельно текущую длину и лучший результат.",
            "После каждого дня сравни current с best.",
          ],
        },
      },
      {
        lessonId: "accumulate",
        exercise: {
          id: "ind-3-2",
          title: "Лифт на нулевом этаже",
          prompt:
            "Лифт начинает на этаже f. Каждая из n команд равна 1 (вверх на этаж) или −1 (вниз). Подземные этажи разрешены. Выведи конечный этаж и количество команд, после которых лифт оказался на этаже 0. Начальное положение само по себе не считается командой. −20 ≤ f ≤ 20, 0 ≤ n ≤ 30.",
          inputHelp: "f, затем n, затем n команд, всё на отдельных строках.",
          starter: "",
          sample: {
            input: "1\n3\n-1\n1\n-1",
            expected: "0\n2",
          },
          tests: [
            {
              input: "1\n3\n-1\n1\n-1",
              expected: "0\n2",
            },
            {
              input: "0\n0",
              expected: "0\n0",
            },
            {
              input: "0\n2\n1\n-1",
              expected: "0\n1",
            },
            {
              input: "-2\n3\n1\n1\n1",
              expected: "1\n1",
            },
            {
              input: "5\n10\n-1\n-1\n-1\n-1\n-1\n-1\n-1\n-1\n-1\n-1",
              expected: "-5\n1",
            },
            {
              input: "0\n4\n-1\n1\n-1\n1",
              expected: "0\n2",
            },
          ],
          solution:
            "floor = int(input())\nn = int(input())\nvisits = 0\nfor i in range(n):\n    floor = floor + int(input())\n    if floor == 0:\n        visits = visits + 1\nprint(floor)\nprint(visits)",
          explanation:
            "Сначала выполняем команду, затем проверяем новый этаж. Счётчик посещений и номер этажа — разные переменные. При отсутствии команд посещений ноль.",
          hints: [
            "Изменяй этаж по одной команде.",
            "Проверяй этаж после изменения.",
            "Если floor == 0, увеличь visits на 1.",
          ],
        },
      },
    ],
  },
  {
    id: "week-4",
    week: 4,
    title: "Самостоятельная работа · неделя 4",
    minutes: 30,
    tasks: [
      {
        lessonId: "text",
        exercise: {
          id: "ind-4-1",
          title: "Название команды",
          prompt:
            "Команда придумала название из n слов. Короткое название получается из первых букв этих слов в исходном порядке. Выведи его одной строкой. 1 ≤ n ≤ 20, каждое слово состоит из 1…20 строчных латинских букв.",
          inputHelp: "n, затем n слов, каждое на своей строке.",
          starter: "",
          sample: {
            input: "3\nyoung\npython\nteam",
            expected: "ypt",
          },
          tests: [
            {
              input: "3\nyoung\npython\nteam",
              expected: "ypt",
            },
            {
              input: "1\na",
              expected: "a",
            },
            {
              input: "3\nred\nred\nblue",
              expected: "rrb",
            },
            {
              input:
                "20\nz\nz\nz\nz\nz\nz\nz\nz\nz\nz\nz\nz\nz\nz\nz\nz\nz\nz\nz\nz",
              expected: "zzzzzzzzzzzzzzzzzzzz",
            },
            {
              input: "3\nhello\na\nworld",
              expected: "haw",
            },
          ],
          solution:
            'n = int(input())\nshort = ""\nfor i in range(n):\n    word = input()\n    short = short + word[0]\nprint(short)',
          explanation:
            "Все слова непустые, поэтому первый символ существует. Добавляй по одной букве к общей строке, сохраняя порядок.",
          hints: [
            "Нужен один символ от каждого слова.",
            "Первый символ имеет индекс 0.",
            "Добавляй word[0] к строке результата.",
          ],
        },
      },
      {
        lessonId: "dictionaries",
        exercise: {
          id: "ind-4-2",
          title: "Голосование",
          prompt:
            "Каждый из n учеников голосует за A, B или C. Выведи количество голосов за A, затем за B, затем за C — на отдельных строках. 0 ≤ n ≤ 30. Если за кандидата никто не голосовал, выведи 0.",
          inputHelp: "n, затем n букв A, B или C, по одной на строке.",
          starter: "",
          sample: {
            input: "5\nC\nB\nA\nC\nA",
            expected: "2\n1\n2",
          },
          tests: [
            {
              input: "5\nC\nB\nA\nC\nA",
              expected: "2\n1\n2",
            },
            {
              input: "0",
              expected: "0\n0\n0",
            },
            {
              input: "1\nA",
              expected: "1\n0\n0",
            },
            {
              input:
                "30\nC\nC\nC\nC\nC\nC\nC\nC\nC\nC\nC\nC\nC\nC\nC\nC\nC\nC\nC\nC\nC\nC\nC\nC\nC\nC\nC\nC\nC\nC",
              expected: "0\n0\n30",
            },
            {
              input: "3\nB\nA\nC",
              expected: "1\n1\n1",
            },
            {
              input: "4\nB\nB\nB\nA",
              expected: "1\n3\n0",
            },
          ],
          solution:
            'n = int(input())\nvotes = {"A": 0, "B": 0, "C": 0}\nfor i in range(n):\n    name = input()\n    votes[name] = votes[name] + 1\nprint(votes["A"])\nprint(votes["B"])\nprint(votes["C"])',
          explanation:
            "Сохраняй отдельный счётчик для каждого кандидата. При очередном голосе меняется только соответствующий счётчик. Порядок вывода задан условием, а не порядком получения голосов.",
          hints: [
            "Нужны три независимых счётчика.",
            "Можно хранить их по ключам A, B, C.",
            "Увеличивай votes[name], затем выведи значения в заданном порядке.",
          ],
        },
      },
    ],
  },
  {
    id: "week-5",
    week: 5,
    title: "Самостоятельная работа · неделя 5",
    minutes: 30,
    tasks: [
      {
        lessonId: "unique",
        exercise: {
          id: "ind-5-1",
          title: "Фрагменты с меткой",
          prompt:
            "Дана строка text из строчных латинских букв и число k. Сколько различных непрерывных фрагментов длины k содержат букву a? Совпадающие фрагменты считаются один раз, даже если находятся в разных местах. 1 ≤ длина text ≤ 30, 1 ≤ k ≤ длина text.",
          inputHelp: "text, затем k на второй строке.",
          starter: "",
          sample: {
            input: "ababa\n2",
            expected: "2",
          },
          tests: [
            {
              input: "ababa\n2",
              expected: "2",
            },
            {
              input: "aaaa\n2",
              expected: "1",
            },
            {
              input: "bbb\n1",
              expected: "0",
            },
            {
              input: "a\n1",
              expected: "1",
            },
            {
              input: "zaz\n3",
              expected: "1",
            },
            {
              input: "abca\n1",
              expected: "1",
            },
            {
              input: "baa\n2",
              expected: "2",
            },
            {
              input: "abcabc\n3",
              expected: "3",
            },
          ],
          solution:
            'text = input()\nk = int(input())\nseen = []\nfor start in range(len(text) - k + 1):\n    part = text[start:start + k]\n    if "a" in part and part not in seen:\n        seen.append(part)\nprint(len(seen))',
          explanation:
            "Перебери все допустимые начала, включая последнее. Сохраняй только фрагменты с a, которые ещё не встречались. Число сохранённых строк и есть ответ.",
          hints: [
            "Фрагмент не может выйти за конец строки.",
            "Нужны одновременно наличие a и отсутствие повтора.",
            "Добавляй подходящий part в seen только при part not in seen.",
          ],
        },
      },
      {
        lessonId: "enumeration",
        exercise: {
          id: "ind-5-2",
          title: "Две карточки",
          prompt:
            "Есть по одной карточке с числами от 1 до n. Сколько способов выбрать две разные карточки, чтобы сумма их чисел равнялась s? Порядок выбора не важен: карточки 2 и 5 — тот же способ, что 5 и 2. 1 ≤ n ≤ 30, 0 ≤ s ≤ 60.",
          inputHelp: "n, затем s на второй строке.",
          starter: "",
          sample: {
            input: "6\n7",
            expected: "3",
          },
          tests: [
            {
              input: "6\n7",
              expected: "3",
            },
            {
              input: "1\n2",
              expected: "0",
            },
            {
              input: "2\n3",
              expected: "1",
            },
            {
              input: "5\n4",
              expected: "1",
            },
            {
              input: "30\n60",
              expected: "0",
            },
            {
              input: "30\n31",
              expected: "15",
            },
            {
              input: "8\n0",
              expected: "0",
            },
            {
              input: "5\n10",
              expected: "0",
            },
          ],
          solution:
            "n = int(input())\ns = int(input())\ncount = 0\nfor a in range(1, n + 1):\n    for b in range(a + 1, n + 1):\n        if a + b == s:\n            count = count + 1\nprint(count)",
          explanation:
            "Упорядочь выбранные числа: первое меньше второго. Тогда одинаковую карточку нельзя взять дважды и каждый способ встретится ровно один раз.",
          hints: [
            "Перебери две карточки.",
            "Одинаковые карточки запрещены, порядок не важен.",
            "Пусть b всегда больше a.",
          ],
        },
      },
    ],
  },
  {
    id: "week-6",
    week: 6,
    title: "Самостоятельная работа · неделя 6",
    minutes: 30,
    tasks: [
      {
        lessonId: "extremes",
        exercise: {
          id: "ind-6-1",
          title: "Одинаковые башни",
          prompt:
            "Высоты трёх башен равны a, b и c. За одно действие можно добавить один кубик к любой башне. Убирать кубики нельзя. Какое наименьшее число действий сделает высоты одинаковыми? 0 ≤ a, b, c ≤ 1000000000.",
          inputHelp: "a, b, c на трёх строках.",
          starter: "",
          sample: {
            input: "2\n5\n3",
            expected: "5",
          },
          tests: [
            {
              input: "2\n5\n3",
              expected: "5",
            },
            {
              input: "0\n0\n0",
              expected: "0",
            },
            {
              input: "7\n7\n7",
              expected: "0",
            },
            {
              input: "1000000000\n0\n0",
              expected: "2000000000",
            },
            {
              input: "1\n9\n1",
              expected: "16",
            },
            {
              input: "1\n1\n9",
              expected: "16",
            },
            {
              input: "4\n2\n4",
              expected: "2",
            },
          ],
          solution:
            "a = int(input())\nb = int(input())\nc = int(input())\nheight = max(a, b, c)\nprint(3 * height - a - b - c)",
          explanation:
            "Итоговая высота не меньше самой высокой башни: убирать кубики нельзя. Выше поднимать незачем. До максимальной высоты каждой башне не хватает height минус её текущая высота.",
          hints: [
            "Какая минимальная общая высота возможна?",
            "Самая высокая башня уже задаёт нижнюю границу.",
            "Сложи недостающие кубики для трёх башен.",
          ],
        },
      },
      {
        lessonId: "efficiency",
        exercise: {
          id: "ind-6-2",
          title: "Проездные",
          prompt:
            "Нужно совершить n поездок. Разовый билет стоит a сомов, проездной на две поездки — b сомов. Можно покупать сколько угодно билетов обоих типов; неиспользованная поездка в проездном допустима. Найди минимальную стоимость. 0 ≤ n ≤ 1000000000, 1 ≤ a, b ≤ 1000000000.",
          inputHelp: "n, a, b на трёх строках.",
          starter: "",
          sample: {
            input: "5\n10\n15",
            expected: "40",
          },
          tests: [
            {
              input: "5\n10\n15",
              expected: "40",
            },
            {
              input: "0\n10\n15",
              expected: "0",
            },
            {
              input: "1\n10\n3",
              expected: "3",
            },
            {
              input: "3\n10\n25",
              expected: "30",
            },
            {
              input: "4\n10\n20",
              expected: "40",
            },
            {
              input: "5\n10\n3",
              expected: "9",
            },
            {
              input: "1000000000\n1000000000\n1",
              expected: "500000000",
            },
            {
              input: "999999999\n7\n10",
              expected: "4999999997",
            },
          ],
          solution:
            "n = int(input())\na = int(input())\nb = int(input())\nprint(min(n * a, n // 2 * b + n % 2 * a, (n + 1) // 2 * b))",
          explanation:
            "Если проездной не дешевле двух разовых, выгодны разовые. Иначе бери проездные на пары; для нечётного остатка сравни разовый и ещё один проездной. Три выражения покрывают эти варианты.",
          hints: [
            "Сравни цену двух разовых и проездного.",
            "Для нечётного n последняя поездка может оказаться дешевле в новом проездном.",
            "Сравни все разовые, пары плюс разовый и только проездные с запасом.",
          ],
        },
      },
    ],
  },
  {
    id: "week-7",
    week: 7,
    title: "Самостоятельная работа · неделя 7",
    minutes: 30,
    tasks: [
      {
        lessonId: "sets",
        exercise: {
          id: "ind-7-1",
          title: "Общие цифры",
          prompt:
            "Даны два неотрицательных целых числа a и b, не больше 9999999999. Сколько различных цифр встречаются в записи обоих чисел? Каждую цифру учитывай один раз. Ноль записывается одной цифрой 0.",
          inputHelp: "a и b на двух строках.",
          starter: "",
          sample: {
            input: "1012\n2203",
            expected: "2",
          },
          tests: [
            {
              input: "1012\n2203",
              expected: "2",
            },
            {
              input: "0\n0",
              expected: "1",
            },
            {
              input: "0\n123",
              expected: "0",
            },
            {
              input: "111\n1",
              expected: "1",
            },
            {
              input: "123\n456",
              expected: "0",
            },
            {
              input: "9876543210\n1023456789",
              expected: "10",
            },
            {
              input: "909\n90",
              expected: "2",
            },
          ],
          solution:
            'a = str(int(input()))\nb = str(int(input()))\ncount = 0\nfor digit in "0123456789":\n    if digit in a and digit in b:\n        count = count + 1\nprint(count)',
          explanation:
            "Перебираем десять возможных цифр, а не позиции в числах. Поэтому повторы внутри числа не увеличивают ответ.",
          hints: [
            "Возможных цифр всего десять.",
            "Цифра должна встречаться в обеих записях.",
            "Для каждой digit проверь digit in a and digit in b.",
          ],
        },
      },
      {
        lessonId: "next-small",
        exercise: {
          id: "ind-7-2",
          title: "Номер пропуска",
          prompt:
            "Выбирают четырёхзначный номер от 1000 до 9999. Все его цифры должны быть различны, а запрещённая цифра d не должна встречаться. Найди наименьший такой номер строго больше n. Если подходящего номера нет, выведи 0. 0 ≤ n ≤ 9999, 0 ≤ d ≤ 9.",
          inputHelp: "n, затем d на второй строке.",
          starter: "",
          sample: {
            input: "1023\n4",
            expected: "1025",
          },
          tests: [
            {
              input: "1023\n4",
              expected: "1025",
            },
            {
              input: "0\n0",
              expected: "1234",
            },
            {
              input: "0\n9",
              expected: "1023",
            },
            {
              input: "9876\n0",
              expected: "0",
            },
            {
              input: "9999\n1",
              expected: "0",
            },
            {
              input: "1023\n9",
              expected: "1024",
            },
            {
              input: "999\n1",
              expected: "2034",
            },
            {
              input: "9000\n9",
              expected: "0",
            },
          ],
          solution:
            "n = int(input())\nd = input()\nanswer = 0\nfor value in range(max(1000, n + 1), 10000):\n    text = str(value)\n    if answer == 0 and len(set(text)) == 4 and d not in text:\n        answer = value\nprint(answer)",
          explanation:
            "Диапазон небольшой: меньше 9000 кандидатов. Идём по возрастанию и сохраняем первый подходящий. Проверяем три требования: четыре цифры, отсутствие повторов и запрещённой цифры.",
          hints: [
            "Начинай не раньше 1000 и строго после n.",
            "У номера должны одновременно выполняться два ограничения на цифры.",
            "Сохрани первый подходящий value; дальше не заменяй answer.",
          ],
        },
      },
    ],
  },
  {
    id: "week-8",
    week: 8,
    title: "Самостоятельная работа · неделя 8",
    minutes: 30,
    tasks: [
      {
        lessonId: "test-design",
        exercise: {
          id: "ind-8-1",
          title: "Когда закончился бюджет",
          prompt:
            "На покупки выделено b сомов. За n дней потрачены суммы x, по одной за каждый день. Найди номер первого дня, после которого общие расходы стали строго больше b. Дни нумеруются с 1. Если бюджет ни разу не превышен, выведи 0. 0 ≤ b ≤ 100000, 0 ≤ n ≤ 30, 0 ≤ x ≤ 10000.",
          inputHelp:
            "b, затем n, затем n расходов, каждое число на отдельной строке.",
          starter: "",
          sample: {
            input: "10\n4\n4\n6\n1\n20",
            expected: "3",
          },
          tests: [
            {
              input: "10\n4\n4\n6\n1\n20",
              expected: "3",
            },
            {
              input: "0\n0",
              expected: "0",
            },
            {
              input: "0\n2\n0\n0",
              expected: "0",
            },
            {
              input: "0\n2\n0\n1",
              expected: "2",
            },
            {
              input: "10\n1\n10",
              expected: "0",
            },
            {
              input: "5\n3\n6\n1\n1",
              expected: "1",
            },
            {
              input: "100\n3\n1\n2\n3",
              expected: "0",
            },
          ],
          solution:
            "budget = int(input())\nn = int(input())\ntotal = 0\nanswer = 0\nfor day in range(1, n + 1):\n    total = total + int(input())\n    if answer == 0 and total > budget:\n        answer = day\nprint(answer)",
          explanation:
            "Общий расход накапливается. Как только он впервые стал больше бюджета, запоминаем день. Остальные входные строки читаем, но ответ больше не меняем. Равенство бюджету ещё не превышение.",
          hints: [
            "Следи за суммой расходов после каждого дня.",
            "Первый найденный день нельзя перезаписывать.",
            "Условие: answer == 0 and total > budget.",
          ],
        },
      },
      {
        lessonId: "ready",
        exercise: {
          id: "ind-8-2",
          title: "Записи в журнале",
          prompt:
            "В журнале n строк из заглавных латинских букв. Оставляют строки, у которых первая и последняя буквы совпадают. Одинаковые оставшиеся строки учитываются один раз. Сколько записей останется? 0 ≤ n ≤ 30, длина каждой строки от 1 до 20. Строка из одной буквы подходит.",
          inputHelp: "n, затем n строк.",
          starter: "",
          sample: {
            input: "4\nABA\nAB\nABA\nC",
            expected: "2",
          },
          tests: [
            {
              input: "4\nABA\nAB\nABA\nC",
              expected: "2",
            },
            {
              input: "0",
              expected: "0",
            },
            {
              input: "1\nA",
              expected: "1",
            },
            {
              input: "2\nABC\nAB",
              expected: "0",
            },
            {
              input: "4\nABCA\nAAA\nA\nABCA",
              expected: "3",
            },
            {
              input:
                "30\nZ\nZ\nZ\nZ\nZ\nZ\nZ\nZ\nZ\nZ\nZ\nZ\nZ\nZ\nZ\nZ\nZ\nZ\nZ\nZ\nZ\nZ\nZ\nZ\nZ\nZ\nZ\nZ\nZ\nZ",
              expected: "1",
            },
          ],
          solution:
            "n = int(input())\nseen = set()\nfor i in range(n):\n    text = input()\n    if text[0] == text[len(text) - 1]:\n        seen.add(text)\nprint(len(seen))",
          explanation:
            "Сначала проверяем свойство каждой строки, затем устраняем повторы целых строк. Сравнивать нужно первый и последний символ, а не все буквы между ними.",
          hints: [
            "Какие два символа определяют пригодность строки?",
            "Повторяется запись целиком, а не отдельная буква.",
            "Добавляй подходящую строку в множество.",
          ],
        },
      },
    ],
  },
  {
    id: "new-final",
    week: 8,
    title: "Новый итоговый вариант",
    minutes: 180,
    tasks: [
      {
        lessonId: "division",
        exercise: {
          id: "new-final-a",
          title: "Смена на станции",
          prompt:
            "До смены часы показывают h часов и m минут. Смена длится d минут. Выведи, сколько раз наступит полночь до конца смены включительно, затем час и минуту окончания. Начальный момент не считается наступлением полуночи. 0 ≤ h ≤ 23, 0 ≤ m ≤ 59, 0 ≤ d ≤ 1000000.",
          inputHelp: "h, m, d на трёх строках.",
          starter: "",
          sample: {
            input: "22\n40\n100",
            expected: "1\n0\n20",
          },
          tests: [
            {
              input: "22\n40\n100",
              expected: "1\n0\n20",
            },
            {
              input: "0\n0\n0",
              expected: "0\n0\n0",
            },
            {
              input: "0\n0\n1440",
              expected: "1\n0\n0",
            },
            {
              input: "23\n59\n1",
              expected: "1\n0\n0",
            },
            {
              input: "1\n2\n1000000",
              expected: "694\n11\n42",
            },
            {
              input: "12\n30\n20",
              expected: "0\n12\n50",
            },
          ],
          solution:
            "h = int(input())\nm = int(input())\nd = int(input())\ntotal = h * 60 + m + d\nprint(total // 1440)\nprint(total // 60 % 24)\nprint(total % 60)",
          explanation:
            "Время с начала исходного дня равно h * 60 + m + d. Полные сутки — число наступлений полуночи, остаток задаёт новое время. При начале 00:00 и нулевой длительности ответ по суткам нулевой.",
          hints: [
            "Считай минуты от начала исходного дня.",
            "Полные сутки определяют число полуночей.",
            "Используй 1440 минут в сутках и 60 минут в часе.",
          ],
        },
      },
      {
        lessonId: "accumulate",
        exercise: {
          id: "new-final-b",
          title: "Посылки по порядку",
          prompt:
            "Курьер перевозит n посылок в заданном порядке. За одну поездку можно взять несколько следующих подряд посылок суммарным весом не более k. Переставлять и делить посылки нельзя. Все посылки нужно перевезти. Найди минимальное число поездок. При n = 0 ответ 0. 1 ≤ k ≤ 100, 0 ≤ n ≤ 30, вес каждой посылки от 1 до k.",
          inputHelp: "k, затем n, затем n весов, каждый на отдельной строке.",
          starter: "",
          sample: {
            input: "5\n5\n2\n3\n1\n4\n2",
            expected: "3",
          },
          tests: [
            {
              input: "5\n5\n2\n3\n1\n4\n2",
              expected: "3",
            },
            {
              input: "5\n0",
              expected: "0",
            },
            {
              input:
                "1\n30\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1",
              expected: "30",
            },
            {
              input: "10\n1\n10",
              expected: "1",
            },
            {
              input: "10\n4\n6\n4\n6\n4",
              expected: "2",
            },
            {
              input: "5\n3\n3\n3\n2",
              expected: "2",
            },
            {
              input: "7\n4\n1\n1\n1\n1",
              expected: "1",
            },
            {
              input: "10\n3\n6\n6\n4",
              expected: "2",
            },
          ],
          solution:
            "k = int(input())\nn = int(input())\ntrips = 0\nload = 0\nfor i in range(n):\n    weight = int(input())\n    if trips == 0 or load + weight > k:\n        trips = trips + 1\n        load = 0\n    load = load + weight\nprint(trips)",
          explanation:
            "Заполняй поездку, пока очередная посылка помещается. Если не помещается, начинай следующую. Первая поездка так увозит максимально возможный начальный отрезок. Любой другой выбор оставит не меньше работы; то же рассуждение повторяется для оставшихся посылок. Равенство k допустимо.",
          hints: [
            "Отслеживай загрузку текущей поездки.",
            "Новая поездка нужна, только если очередная посылка уже не помещается.",
            "Проверяй load + weight > k, затем добавляй посылку.",
          ],
        },
      },
      {
        lessonId: "dictionaries",
        exercise: {
          id: "new-final-c",
          title: "Прокат коньков",
          prompt:
            "В прокате есть s, m и l пар размеров S, M и L. Приходит n покупателей по очереди. Каждый просит один размер; если пара этого размера есть, её выдают и уменьшают запас на одну. Иначе покупатель уходит без пары. Замены размера и возвратов нет. Сколько покупателей получат коньки? 0 ≤ s, m, l ≤ 30, 0 ≤ n ≤ 30.",
          inputHelp:
            "s, m, l, n на первых четырёх строках, затем n букв S, M или L на отдельных строках.",
          starter: "",
          sample: {
            input: "1\n2\n0\n6\nS\nM\nL\nS\nM\nM",
            expected: "3",
          },
          tests: [
            {
              input: "1\n2\n0\n6\nS\nM\nL\nS\nM\nM",
              expected: "3",
            },
            {
              input: "0\n0\n0\n3\nS\nM\nL",
              expected: "0",
            },
            {
              input: "3\n4\n5\n0",
              expected: "0",
            },
            {
              input: "1\n0\n0\n3\nS\nS\nS",
              expected: "1",
            },
            {
              input:
                "30\n30\n30\n30\nS\nM\nL\nS\nM\nL\nS\nM\nL\nS\nM\nL\nS\nM\nL\nS\nM\nL\nS\nM\nL\nS\nM\nL\nS\nM\nL\nS\nM\nL",
              expected: "30",
            },
            {
              input: "0\n1\n0\n3\nS\nM\nS",
              expected: "1",
            },
          ],
          solution:
            'stock = {}\nstock["S"] = int(input())\nstock["M"] = int(input())\nstock["L"] = int(input())\nn = int(input())\nserved = 0\nfor i in range(n):\n    size = input()\n    if stock[size] > 0:\n        stock[size] = stock[size] - 1\n        served = served + 1\nprint(served)',
          explanation:
            "У каждого размера собственный запас. Уменьшай его только при выдаче. Запас не должен стать отрицательным, а отказ не меняет другие размеры.",
          hints: [
            "Храни оставшиеся пары отдельно по размерам.",
            "Можно выдать пару, только если её запас положителен.",
            "При выдаче уменьши stock[size] и увеличь served.",
          ],
        },
      },
      {
        lessonId: "neighbors",
        exercise: {
          id: "new-final-d",
          title: "Симметричные узоры",
          prompt:
            "Дана строка из строчных латинских букв и число k. Рассматриваются непрерывные фрагменты длины k, которые одинаково читаются слева направо и справа налево. Сколько различных таких фрагментов есть в строке? Совпадающие фрагменты считаются один раз. 1 ≤ длина строки ≤ 30, 1 ≤ k ≤ длина строки.",
          inputHelp: "Строка, затем k на второй строке.",
          starter: "",
          sample: {
            input: "abacaba\n3",
            expected: "2",
          },
          tests: [
            {
              input: "abacaba\n3",
              expected: "2",
            },
            {
              input: "aaaaa\n2",
              expected: "1",
            },
            {
              input: "abc\n2",
              expected: "0",
            },
            {
              input: "abc\n1",
              expected: "3",
            },
            {
              input: "abba\n4",
              expected: "1",
            },
            {
              input: "abba\n3",
              expected: "0",
            },
            {
              input: "a\n1",
              expected: "1",
            },
            {
              input: "abccba\n6",
              expected: "1",
            },
          ],
          solution:
            "text = input()\nk = int(input())\nseen = set()\nfor start in range(len(text) - k + 1):\n    part = text[start:start + k]\n    same = True\n    for i in range(k):\n        if part[i] != part[k - 1 - i]:\n            same = False\n    if same:\n        seen.add(part)\nprint(len(seen))",
          explanation:
            "Для каждого фрагмента сравни символы на равном расстоянии от краёв. Одного несовпадения достаточно, чтобы отвергнуть его. Множество убирает повторы уже подходящих фрагментов.",
          hints: [
            "Перебери фрагменты нужной длины.",
            "Символу i с другого края соответствует k − 1 − i.",
            "Сохраняй симметричные фрагменты в множестве.",
          ],
        },
      },
      {
        lessonId: "efficiency",
        exercise: {
          id: "new-final-e",
          title: "Запас корма",
          prompt:
            "В приюте расходуют x порций корма в каждый будний день и y порций в каждый выходной. Наблюдение начинается в понедельник и длится n дней. Сколько всего порций понадобится? Будни — понедельник–пятница, выходные — суббота и воскресенье. 0 ≤ n ≤ 1000000000, 0 ≤ x, y ≤ 1000000000.",
          inputHelp: "n, x, y на трёх строках.",
          starter: "",
          sample: {
            input: "8\n3\n1",
            expected: "20",
          },
          tests: [
            {
              input: "8\n3\n1",
              expected: "20",
            },
            {
              input: "0\n9\n2",
              expected: "0",
            },
            {
              input: "5\n2\n10",
              expected: "10",
            },
            {
              input: "6\n2\n10",
              expected: "20",
            },
            {
              input: "7\n2\n10",
              expected: "30",
            },
            {
              input: "14\n0\n4",
              expected: "16",
            },
            {
              input: "1000000000\n1000000000\n1000000000",
              expected: "1000000000000000000",
            },
            {
              input: "999999999\n4\n9",
              expected: "5428571416",
            },
          ],
          solution:
            "n = int(input())\nx = int(input())\ny = int(input())\nweeks = n // 7\nrest = n % 7\nprint(weeks * (5 * x + 2 * y) + min(rest, 5) * x + max(0, rest - 5) * y)",
          explanation:
            "В каждой полной неделе одинаковый расход. Остаётся меньше семи дней, начиная с понедельника: сначала до пяти будних, затем выходные. Число действий не зависит от n.",
          hints: [
            "Сначала отдели полные недели.",
            "Остаток начинается с понедельника.",
            "В остатке min(rest, 5) будних и max(0, rest − 5) выходных дней.",
          ],
        },
      },
      {
        lessonId: "enumeration",
        exercise: {
          id: "new-final-f",
          title: "Следующая табличка",
          prompt:
            "Табличка содержит от 1 до 8 букв A, B, C. Нужна следующая по алфавиту табличка той же длины, у которой никакие две соседние буквы не совпадают. Она должна быть строго больше исходной. Порядок букв A < B < C; при сравнении одинаковых по длине строк всё решает первая различающаяся буква. Выведи наименьшую подходящую строку или NONE, если её нет. Исходная строка может содержать одинаковых соседей.",
          inputHelp: "Одна непустая строка из A, B, C.",
          starter: "",
          sample: {
            input: "ABAC",
            expected: "ABCA",
          },
          tests: [
            {
              input: "ABAC",
              expected: "ABCA",
            },
            {
              input: "A",
              expected: "B",
            },
            {
              input: "C",
              expected: "NONE",
            },
            {
              input: "AA",
              expected: "AB",
            },
            {
              input: "AB",
              expected: "AC",
            },
            {
              input: "CC",
              expected: "NONE",
            },
            {
              input: "AAAA",
              expected: "ABAB",
            },
            {
              input: "CBCB",
              expected: "NONE",
            },
            {
              input: "ABCABCAB",
              expected: "ABCABCAC",
            },
            {
              input: "CCCCCCCC",
              expected: "NONE",
            },
          ],
          solution:
            'text = input()\nsize = len(text)\nletters = "ABC"\nanswer = ""\nfor number in range(3 ** size):\n    value = number\n    candidate = ""\n    for i in range(size):\n        candidate = letters[value % 3] + candidate\n        value = value // 3\n    valid = True\n    for i in range(1, size):\n        if candidate[i] == candidate[i - 1]:\n            valid = False\n    if valid and candidate > text:\n        if answer == "" or candidate < answer:\n            answer = candidate\nif answer == "":\n    print("NONE")\nelse:\n    print(answer)',
          explanation:
            "Длина не больше восьми: всего не более 3 ** 8 = 6561 строк. Номер варианта переводим в буквы остатками от деления на 3: 0 → A, 1 → B, 2 → C, каждый раз добавляя букву слева. Проверяем соседей и строгое сравнение, сохраняем наименьший вариант. Это ограниченный перебор, а не копирование алгоритма вирусных чисел.",
          hints: [
            "Оцени число возможных строк при длине 8.",
            "Перебери варианты, затем проверь соседей и сравнение с исходной строкой.",
            "Номер от 0 до 3 ** size − 1 можно превратить в size букв через % 3 и // 3.",
          ],
        },
      },
    ],
  },
];
export const assessmentKey = (id: string) => `olymp-assessment-${id}-v1`;
export function assessmentTasks(assessment: Assessment): ContestTask[] {
  return assessment.tasks.map((task, index) => ({
    letter: "ABCDEF"[index],
    lesson: { id: task.lessonId },
    exercise: task.exercise,
  }));
}
