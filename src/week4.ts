import type { Lesson } from "./course";

// Task E: original PDF pages 4–5; all year rules and spellings follow that statement.
export const fourthWeekLessons: Lesson[] = [
  {
    id: "text",
    week: 4,
    number: "16",
    title: "Строки: текст как данные",
    subtitle: "Находим символы и собираем слова.",
    duration: 40,
    goals: [
      "Измерять длину строки",
      "Обращаться к символу по индексу",
      "Соединять строки без лишних пробелов",
    ],
    sections: [
      {
        title: "Текст отличается от числа",
        body: 'input() возвращает строку — последовательность символов. Строка "12" состоит из двух символов, а число 12 можно использовать в арифметике. len(text) возвращает количество символов. Пробел тоже считается. В упражнениях используем обычные буквы, цифры и пробелы без сложных составных символов.',
        code: 'text = "Python"\nprint(len(text))\nprint("12" + "3")\nprint(12 + 3)',
        caption:
          "Получится 6, затем 123, затем 15. Для текста + означает склеивание.",
      },
      {
        title: "У каждого символа есть номер",
        body: 'Нумерация начинается с нуля, как в range. Для строки "кот" индексы 0, 1, 2 означают к, о, т. Квадратные скобки выбирают символ: text[0]. Последний индекс равен len(text) − 1. text[-1] — удобная запись последнего символа. У пустой строки нет ни первого, ни последнего символа.',
        code: 'text = "кот"\nprint(text[0])\nprint(text[2])\nprint(text[-1])',
        caption:
          "к, т, т на отдельных строках. Обращение text[3] вызовет IndexError: такого номера нет.",
      },
      {
        title: "Часть строки — срез",
        body: "text[a:b] берёт символы начиная с a, но не включая b. Если начало пропущено, берём с первого символа; если конец пропущен — до конца строки. Похоже на границы range. Исходная строка не меняется.",
        code: 'year = "2026"\nprint(year[:2])\nprint(year[2:])',
        caption:
          "Получится 20 и 26. Это пока строки; для вычислений их можно преобразовать через int.",
      },
      {
        title: "Соединяем с нужным разделителем",
        body: 'Оператор + ничего не добавляет сам. Если нужен пробел или дефис, поставь его отдельной строкой в кавычках. print(a, b) автоматически вставляет пробел между аргументами, а print(a + "-" + b) печатает дефис без пробелов. Строку и число напрямую складывать нельзя: str(number) превращает число в текст.',
        code: 'first = "twenty"\nlast = "one"\nprint(first + "-" + last)\nprint("Год: " + str(2026))',
        caption:
          "twenty-one и Год: 2026. Символ - в кавычках — текст, а не вычитание.",
      },
      {
        title: "Строка неизменяема",
        body: 'Нельзя заменить символ командой text[0] = "К". Нужно создать новую строку, например text = "К" + text[1:]. Можно также пройти строку циклом for letter in text: переменная letter получит каждый символ по очереди. Позже это поможет считать буквы и искать совпадения.',
      },
    ],
    takeaway:
      "len считает символы, индексы начинаются с 0, [-1] выбирает последний символ. Пробелы и дефисы при склеивании добавляй явно.",
    quiz: {
      question: "Что напечатает программа?",
      options: ["o", "l", "Ошибка"],
      answer: 1,
      explanation: "В Hello индексы 0…4. Индекс 2 выбирает букву l.",
      code: 'text = "Hello"\nprint(text[2])',
    },
    exercises: [
      {
        id: "text-1",
        title: "Длина сообщения",
        prompt:
          "Дана непустая строка из обычных русских или латинских букв, цифр и пробелов, длиной не более 100 символов. Выведи её длину, считая пробелы.",
        starter: "text = input()\n",
        inputHelp: "Одна непустая строка. Пробелы внутри строки сохраняй.",
        sample: {
          input: "Привет",
          expected: "6",
        },
        tests: [
          {
            input: "Привет",
            expected: "6",
          },
          {
            input: "a",
            expected: "1",
          },
          {
            input: "два слова",
            expected: "9",
          },
          {
            input: "Python 3",
            expected: "8",
          },
          {
            input: "0123456789",
            expected: "10",
          },
          {
            input:
              "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
            expected: "100",
          },
        ],
        hints: [
          "Не превращай ввод в int: это текст.",
          "Длину вычисляет len(text).",
          "Выведи print(len(text)).",
        ],
        solution: "text = input()\nprint(len(text))",
        explanation:
          "Пробел внутри сообщения тоже занимает позицию. len возвращает целое число.",
      },
      {
        id: "text-2",
        title: "Первый и последний",
        prompt:
          "Дано непустое слово из 1–50 русских или латинских букв. На первой строке выведи первый символ, на второй — последний. Если буква одна, выведи её дважды.",
        starter: "text = input()\n",
        inputHelp: "Одно непустое слово.",
        sample: {
          input: "Python",
          expected: "P\nn",
        },
        tests: [
          {
            input: "Python",
            expected: "P\nn",
          },
          {
            input: "Я",
            expected: "Я\nЯ",
          },
          {
            input: "кот",
            expected: "к\nт",
          },
          {
            input: "ab",
            expected: "a\nb",
          },
          {
            input: "ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ",
            expected: "Z\nZ",
          },
        ],
        hints: [
          "Первый индекс — 0.",
          "Последний символ доступен через text[-1].",
          "Используй два print: сначала text[0], затем text[-1].",
        ],
        solution: "text = input()\nprint(text[0])\nprint(text[-1])",
        explanation:
          "Для слова из одной буквы первый и последний символ совпадают. Пустой ввод в этой задаче не допускается.",
      },
      {
        id: "text-3",
        title: "Склей слова",
        prompt:
          "На двух строках даны два непустых слова из строчных латинских букв, каждое длиной не более 20. Соедини их одним дефисом без пробелов.",
        starter: "first = input()\nsecond = input()\n",
        inputHelp: "Два слова на отдельных строках.",
        sample: {
          input: "twenty\none",
          expected: "twenty-one",
        },
        tests: [
          {
            input: "twenty\none",
            expected: "twenty-one",
          },
          {
            input: "forty\ntwo",
            expected: "forty-two",
          },
          {
            input: "a\nb",
            expected: "a-b",
          },
          {
            input: "ninety\nnine",
            expected: "ninety-nine",
          },
          {
            input: "xxxxxxxxxxxxxxxxxxxx\nyyyyyyyyyyyyyyyyyyyy",
            expected: "xxxxxxxxxxxxxxxxxxxx-yyyyyyyyyyyyyyyyyyyy",
          },
        ],
        hints: [
          'Дефис — отдельная строка "-".',
          "Нужно соединить три строки оператором +.",
          'Выведи first + "-" + second одним print.',
        ],
        solution:
          'first = input()\nsecond = input()\nprint(first + "-" + second)',
        explanation:
          "Запятая между аргументами print добавила бы пробелы. Для точного формата собираем одну строку.",
      },
    ],
  },
  {
    id: "lists",
    week: 4,
    number: "17",
    title: "Списки: храним несколько значений",
    subtitle: "Одна переменная — целая последовательность.",
    duration: 45,
    goals: [
      "Создавать список и читать элемент",
      "Добавлять значения через append",
      "Использовать список вместе с циклом",
    ],
    sections: [
      {
        title: "Вместо десятка переменных",
        body: "Список хранит несколько значений в заданном порядке. Запиши элементы в квадратных скобках через запятую. В наших списках будут либо строки, либо числа. len(values) возвращает количество элементов, а не сумму и не длину текста внутри них.",
        code: 'words = ["one", "two", "three"]\nprint(len(words))\nprint(words[0])',
        caption:
          "3 и one. У списка, как у строки, нумерация начинается с нуля.",
      },
      {
        title: "Выбираем элемент",
        body: "values[0] — первый элемент, values[-1] — последний. Индекс должен существовать. Если в списке три элемента, допустимы неотрицательные индексы 0, 1, 2, но не 3. Поэтому values[len(values)] ошибочен. Перед обращением проверь, что список не пуст.",
        code: "scores = [7, 4, 9]\nprint(scores[0] + scores[-1])",
        caption:
          "Ответ 16: складываются первый и последний баллы, а не их индексы.",
      },
      {
        title: "Наполняем список",
        body: "Пустой список записывается как []. Команда values.append(value) добавляет один элемент в конец. Точка означает, что мы вызываем действие именно этого списка. Не пиши values = values.append(value): append меняет список, а результатом вызова будет None, то есть отсутствие возвращаемого значения.",
        code: "values = []\nvalues.append(5)\nvalues.append(8)\nprint(values[1])",
        caption: "Получится 8. После двух добавлений длина списка равна 2.",
      },
      {
        title: "Читаем и обходим",
        body: "Если сначала дано n, а затем n чисел на отдельных строках, читай их в цикле и добавляй в список. Затем можно пройти значения через for value in values или индексы через range(len(values)). Для обратного порядка индексы идут от len(values) − 1 до 0.",
        code: "values = [5, 8, 2]\nfor i in range(len(values) - 1, -1, -1):\n    print(values[i])",
        caption:
          "2, 8, 5. У пустого списка диапазон будет пустым и ничего не напечатается.",
      },
      {
        title: "Таблица вместо длинного if",
        body: "Если вход — цифра от 0 до 9, можно хранить десять английских названий в списке: позиция 0 — zero, позиция 1 — one и так далее. Тогда words[d] сразу выбирает слово. Следи, чтобы позиция совпадала с числом. В заданиях таблица уже дана: английский наизусть не требуется.",
      },
    ],
    takeaway:
      "Список хранит порядок. append добавляет в конец. Индекс len(values) уже за пределами списка; последний — len(values) − 1 или −1.",
    quiz: {
      question: "Что напечатает программа?",
      options: ["2", "5", "8"],
      answer: 2,
      explanation:
        "append добавляет 8 в конец, а [-1] выбирает последний элемент.",
      code: "values = [2, 5]\nvalues.append(8)\nprint(values[-1])",
    },
    exercises: [
      {
        id: "lists-1",
        title: "Название цифры",
        prompt:
          "Дана цифра d от 0 до 9. Используя готовый список, выведи её английское название.",
        starter:
          'd = int(input())\nwords = [\n    "zero", "one", "two", "three", "four",\n    "five", "six", "seven", "eight", "nine"\n]\n# Выбери слово по индексу\n',
        inputHelp: "Одна цифра от 0 до 9.",
        sample: {
          input: "5",
          expected: "five",
        },
        tests: [
          {
            input: "5",
            expected: "five",
          },
          {
            input: "0",
            expected: "zero",
          },
          {
            input: "1",
            expected: "one",
          },
          {
            input: "2",
            expected: "two",
          },
          {
            input: "3",
            expected: "three",
          },
          {
            input: "4",
            expected: "four",
          },
          {
            input: "6",
            expected: "six",
          },
          {
            input: "7",
            expected: "seven",
          },
          {
            input: "8",
            expected: "eight",
          },
          {
            input: "9",
            expected: "nine",
          },
        ],
        hints: [
          "Номер элемента уже совпадает с цифрой.",
          "Не прибавляй к d единицу.",
          "Выведи words[d].",
        ],
        solution:
          'd = int(input())\nwords = [\n    "zero", "one", "two", "three", "four",\n    "five", "six", "seven", "eight", "nine"\n]\nprint(words[d])',
        explanation:
          "Список содержит десять элементов. Последний индекс 9, поэтому nine доступно напрямую.",
      },
      {
        id: "lists-2",
        title: "Порядок наоборот",
        prompt:
          "Дано n от 0 до 20, затем n целых чисел от −100 до 100 на отдельных строках. Сохрани их в список и выведи в обратном порядке, по одному на строке. При n = 0 вывод пустой.",
        starter: "n = int(input())\nvalues = []\n",
        inputHelp: "Количество, затем ровно n строк с числами.",
        sample: {
          input: "3\n5\n8\n2",
          expected: "2\n8\n5",
        },
        tests: [
          {
            input: "3\n5\n8\n2",
            expected: "2\n8\n5",
          },
          {
            input: "0",
            expected: "",
          },
          {
            input: "1\n7",
            expected: "7",
          },
          {
            input: "3\n-2\n0\n3",
            expected: "3\n0\n-2",
          },
          {
            input: "3\n1\n1\n2",
            expected: "2\n1\n1",
          },
          {
            input:
              "20\n0\n1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n11\n12\n13\n14\n15\n16\n17\n18\n19",
            expected:
              "19\n18\n17\n16\n15\n14\n13\n12\n11\n10\n9\n8\n7\n6\n5\n4\n3\n2\n1\n0",
          },
        ],
        hints: [
          "Сначала прочитай все числа и добавь через append.",
          "Начни обратный цикл с len(values) - 1.",
          "Для индексов нужен range(len(values) - 1, -1, -1).",
        ],
        solution:
          "n = int(input())\nvalues = []\nfor i in range(n):\n    value = int(input())\n    values.append(value)\nfor i in range(len(values) - 1, -1, -1):\n    print(values[i])",
        explanation:
          "Здесь хранение оправдано: последний введённый элемент нужно вывести первым. При нуле оба цикла пусты.",
      },
      {
        id: "lists-3",
        title: "Исправь последний индекс",
        prompt:
          "Дано n от 2 до 20, затем n целых чисел от −100 до 100 на отдельных строках. Нужно вывести сумму первого и последнего элементов. Шаблон обращается к несуществующему индексу. Исправь последнюю строку.",
        starter:
          "n = int(input())\nvalues = []\nfor i in range(n):\n    value = int(input())\n    values.append(value)\nprint(values[0] + values[len(values)])",
        inputHelp: "Количество и числа на отдельных строках.",
        sample: {
          input: "3\n7\n4\n9",
          expected: "16",
        },
        tests: [
          {
            input: "3\n7\n4\n9",
            expected: "16",
          },
          {
            input: "2\n1\n2",
            expected: "3",
          },
          {
            input: "3\n-5\n7\n-2",
            expected: "-7",
          },
          {
            input: "3\n0\n100\n0",
            expected: "0",
          },
          {
            input:
              "20\n100\n100\n100\n100\n100\n100\n100\n100\n100\n100\n100\n100\n100\n100\n100\n100\n100\n100\n100\n100",
            expected: "200",
          },
        ],
        hints: [
          "len(values) — количество, а не последний индекс.",
          "Последний индекс меньше длины на 1.",
          "Замени values[len(values)] на values[-1] или values[len(values) - 1].",
        ],
        solution:
          "n = int(input())\nvalues = []\nfor i in range(n):\n    value = int(input())\n    values.append(value)\nprint(values[0] + values[-1])",
        explanation:
          "При n = 2 складываются оба элемента. Условие гарантирует минимум два элемента, поэтому список не пуст.",
      },
    ],
  },
  {
    id: "dictionaries",
    week: 4,
    number: "18",
    title: "Словари: значение по ключу",
    subtitle: "Находим нужное слово по коду или числу.",
    duration: 45,
    goals: [
      "Отличать ключ словаря от индекса списка",
      "Создавать пары ключ — значение",
      "Проверять наличие ключа через in",
    ],
    sections: [
      {
        title: "Если искать нужно не по позиции",
        body: 'Список выбирает значение по номеру. Словарь выбирает по ключу: например, по коду языка "ru". Для создания нужны фигурные скобки. Пары разделяются запятыми, ключ и значение — двоеточием.',
        code: 'greetings = {"ru": "Привет", "en": "Hello"}\nprint(greetings["en"])',
        caption:
          'Ответ Hello. Квадратные скобки здесь ищут ключ "en", а не позицию.',
      },
      {
        title: "Ключи бывают числами",
        body: 'В таблице десятков удобно хранить 20: "twenty", 30: "thirty" и так далее. Ключ 20 — число, а "20" — строка: они различаются. Если словарь использует числовые ключи, вход нужно прочитать через int(input()). Каждый ключ в словаре уникален; повторная запись того же ключа заменит значение.',
      },
      {
        title: "Проверяем наличие",
        body: "Если ключа нет, обращение table[key] вызовет KeyError. Выражение key in table проверяет наличие ключа и возвращает True или False. Обратись к значению только после успешной проверки.",
        code: 'words = {"cat": "кот", "dog": "собака"}\nkey = "bird"\nif key in words:\n    print(words[key])\nelse:\n    print("Нет перевода")',
        caption:
          "Вывод «Нет перевода». Проверка in смотрит ключи, а не значения словаря.",
      },
      {
        title: "Как выбрать структуру",
        body: "Когда нужны подряд идущие позиции 0, 1, 2 — подойдёт список. Когда нужны коды или отдельные значения вроде 20, 30, 40 — удобен словарь. Оба варианта могут хранить строки. Для задачи E используем список коротких названий и словарь десятков.",
      },
      {
        title: "Точность записи",
        body: 'Кавычки в коде обрамляют строку и не входят в неё. Большие и маленькие буквы различаются: "cat" и "Cat" — разные ключи. Не исправляй вход автоматически, если условие этого не просит. Для проверки попробуй первый ключ, последний и неизвестный, если он разрешён.',
      },
    ],
    takeaway:
      'Словарь — пары ключ: значение. table[key] ищет ключ, а key in table проверяет, есть ли он. Число 20 и строка "20" — разные ключи.',
    quiz: {
      question: "Что напечатает программа?",
      options: ["True", "False", "twenty"],
      answer: 1,
      explanation: 'В словаре ключ — число 20. Строки "20" среди ключей нет.',
      code: 'words = {20: "twenty"}\nprint("20" in words)',
    },
    exercises: [
      {
        id: "dictionaries-1",
        title: "Приветствие по коду",
        prompt:
          "Дан один из кодов ru, en, ky. Выведи соответственно Привет, Hello, Салам. Используй готовый словарь.",
        starter:
          'code = input()\ngreetings = {"ru": "Привет", "en": "Hello", "ky": "Салам"}\n',
        inputHelp: "Один код: ru, en или ky.",
        sample: {
          input: "en",
          expected: "Hello",
        },
        tests: [
          {
            input: "en",
            expected: "Hello",
          },
          {
            input: "ru",
            expected: "Привет",
          },
          {
            input: "ky",
            expected: "Салам",
          },
        ],
        hints: [
          "code — строка с ключом.",
          "В условии гарантирован известный код.",
          "Выведи greetings[code].",
        ],
        solution:
          'code = input()\ngreetings = {"ru": "Привет", "en": "Hello", "ky": "Салам"}\nprint(greetings[code])',
        explanation:
          "Вместо трёх ветвей достаточно обращения по ключу. Здесь проверка отсутствия ключа не нужна.",
      },
      {
        id: "dictionaries-2",
        title: "Десятки по-английски",
        prompt:
          "Дано одно из чисел 20, 30, 40, 50, 60, 70, 80, 90. Выведи его название из готового словаря.",
        starter:
          'n = int(input())\ntens = {\n    20: "twenty", 30: "thirty", 40: "forty", 50: "fifty",\n    60: "sixty", 70: "seventy", 80: "eighty", 90: "ninety"\n}\n',
        inputHelp: "Один целый десяток от 20 до 90.",
        sample: {
          input: "20",
          expected: "twenty",
        },
        tests: [
          {
            input: "20",
            expected: "twenty",
          },
          {
            input: "30",
            expected: "thirty",
          },
          {
            input: "40",
            expected: "forty",
          },
          {
            input: "50",
            expected: "fifty",
          },
          {
            input: "60",
            expected: "sixty",
          },
          {
            input: "70",
            expected: "seventy",
          },
          {
            input: "80",
            expected: "eighty",
          },
          {
            input: "90",
            expected: "ninety",
          },
        ],
        hints: [
          "Ключи в таблице — целые числа.",
          "input без int дал бы строку и другой ключ.",
          "Выведи tens[n].",
        ],
        solution:
          'n = int(input())\ntens = {\n    20: "twenty", 30: "thirty", 40: "forty", 50: "fifty",\n    60: "sixty", 70: "seventy", 80: "eighty", 90: "ninety"\n}\nprint(tens[n])',
        explanation:
          "Написания forty, eighty и ninety важно сохранить точно. Названия уже даны, их не нужно угадывать.",
      },
      {
        id: "dictionaries-3",
        title: "Неизвестное слово",
        prompt:
          "На входе одно непустое слово из латинских букв длиной до 20. В словаре есть cat → кот, dog → собака, bird → птица. Выведи перевод, если ключ существует, иначе «Неизвестно». Регистр учитывается.",
        starter:
          'key = input()\nwords = {"cat": "кот", "dog": "собака", "bird": "птица"}\n',
        inputHelp: "Одно слово без пробелов.",
        sample: {
          input: "cat",
          expected: "кот",
        },
        tests: [
          {
            input: "cat",
            expected: "кот",
          },
          {
            input: "dog",
            expected: "собака",
          },
          {
            input: "bird",
            expected: "птица",
          },
          {
            input: "fish",
            expected: "Неизвестно",
          },
          {
            input: "Cat",
            expected: "Неизвестно",
          },
          {
            input: "xxxxxxxxxxxxxxxxxxxx",
            expected: "Неизвестно",
          },
        ],
        hints: [
          "Сначала проверь key in words.",
          "Обращение words[key] должно быть только внутри подходящей ветви.",
          "В else напечатай «Неизвестно».",
        ],
        solution:
          'key = input()\nwords = {"cat": "кот", "dog": "собака", "bird": "птица"}\nif key in words:\n    print(words[key])\nelse:\n    print("Неизвестно")',
        explanation:
          "Неизвестный ключ не вызывает ошибку, потому что обращение к словарю защищено условием.",
      },
    ],
  },
  {
    id: "number-words",
    week: 4,
    number: "19",
    title: "Превращаем числа в слова",
    subtitle: "Список и словарь работают вместе.",
    duration: 50,
    goals: [
      "Называть числа от 1 до 99",
      "Отделять особые числа от составных",
      "Ставить дефис только там, где он нужен",
    ],
    sections: [
      {
        title: "Правила из условия задачи E",
        body: "Английский заранее знать не нужно: все названия даны в справочнике ниже и в стартовом коде. Числа от 1 до 19 имеют отдельные названия. Десятки 20, 30, …, 90 тоже имеют отдельные названия. Остальные числа от 21 до 99 собираются через дефис: forty-two, sixty-seven. Круглый десяток пишется без дефиса и без слова zero.",
      },
      {
        title: "Выбираем короткое название",
        body: 'В списке small позиция совпадает с числом. На позиции 0 оставим пустую строку "", чтобы one находилось на позиции 1, ten — на позиции 10. Ноль в этой задаче не вводится; пустой элемент нужен только для удобной нумерации.',
        code: 'small = ["", "one", "two", "three"]\nn = 2\nprint(small[n])',
        caption:
          "Ответ two. В заданиях список полный — до nineteen включительно.",
      },
      {
        title: "Отделяем десяток от единицы",
        body: "Для 42 целый десяток — 42 // 10 * 10 = 40, единица — 42 % 10 = 2. В словаре десятков ключ 40 даст forty, в списке small индекс 2 даст two. Получится forty-two. Для 40 единица равна нулю: ничего добавлять не нужно.",
        code: "n = 42\nprint(n // 10 * 10)\nprint(n % 10)",
        caption:
          "40 и 2. Выражение n // 10 даёт 4, но ключи нашего словаря — 20, 30, 40 и так далее.",
      },
      {
        title: "Три случая вместо множества ветвей",
        body: "Сначала проверь n < 20: готовое слово из списка. Иначе возьми название целого десятка. Если остаток n % 10 не равен нулю, допиши дефис и название единицы. Итоговый print должен быть один. Так не появятся отдельные строки для частей слова.",
      },
      {
        title: "Формат — часть ответа",
        body: "Внутри составного числа нужен обычный дефис -, без пробелов. Вспомни, что print(a, b) вставляет пробел: он здесь не подходит. Проверь 19, 20, 21, 40 и 99 — отдельное название, круглый десяток, составное число и верхнюю границу. Правильно forty, а не fourty. Таблицы помогают избежать опечаток.",
      },
    ],
    takeaway:
      "До 20 — слово из списка. Начиная с 20 — слово десятка и, только при ненулевой единице, дефис с её названием.",
    quiz: {
      question: "Какой ответ соответствует правилам для 40?",
      options: ["forty-zero", "forty", "fourty"],
      answer: 1,
      explanation:
        "У круглого десятка нет единицы, поэтому не нужны ни дефис, ни zero. Правильное написание — forty.",
    },
    exercises: [
      {
        id: "number-words-1",
        title: "Числа от десяти до девятнадцати",
        prompt:
          "Дано n от 10 до 19. Выведи его английское название из готового списка.",
        starter:
          'n = int(input())\nsmall = [\n    "", "one", "two", "three", "four",\n    "five", "six", "seven", "eight", "nine",\n    "ten", "eleven", "twelve", "thirteen", "fourteen",\n    "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"\n]\n',
        inputHelp: "Одно число от 10 до 19.",
        sample: {
          input: "13",
          expected: "thirteen",
        },
        tests: [
          {
            input: "13",
            expected: "thirteen",
          },
          {
            input: "10",
            expected: "ten",
          },
          {
            input: "11",
            expected: "eleven",
          },
          {
            input: "12",
            expected: "twelve",
          },
          {
            input: "14",
            expected: "fourteen",
          },
          {
            input: "15",
            expected: "fifteen",
          },
          {
            input: "16",
            expected: "sixteen",
          },
          {
            input: "17",
            expected: "seventeen",
          },
          {
            input: "18",
            expected: "eighteen",
          },
          {
            input: "19",
            expected: "nineteen",
          },
        ],
        hints: [
          "Позиция в small совпадает с числом.",
          "В начале списка есть пустой элемент для нуля.",
          "Выведи small[n], не вычитая 10.",
        ],
        solution:
          'n = int(input())\nsmall = [\n    "", "one", "two", "three", "four",\n    "five", "six", "seven", "eight", "nine",\n    "ten", "eleven", "twelve", "thirteen", "fourteen",\n    "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"\n]\nprint(small[n])',
        explanation:
          "Названия 10…19 не собираются из десятка и единицы. Например, 13 — thirteen.",
      },
      {
        id: "number-words-2",
        title: "Десяток и единица",
        prompt:
          "Дано n от 20 до 99. Выведи английское название: круглый десяток одним словом, остальные через дефис без пробелов. Таблицы уже есть в шаблоне.",
        starter:
          'n = int(input())\nsmall = [\n    "", "one", "two", "three", "four",\n    "five", "six", "seven", "eight", "nine",\n    "ten", "eleven", "twelve", "thirteen", "fourteen",\n    "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"\n]\ntens = {\n    20: "twenty", 30: "thirty", 40: "forty", 50: "fifty",\n    60: "sixty", 70: "seventy", 80: "eighty", 90: "ninety"\n}\n# Собери одно слово или составное название\n',
        inputHelp: "Одно число от 20 до 99.",
        sample: {
          input: "42",
          expected: "forty-two",
        },
        tests: [
          {
            input: "42",
            expected: "forty-two",
          },
          {
            input: "20",
            expected: "twenty",
          },
          {
            input: "21",
            expected: "twenty-one",
          },
          {
            input: "22",
            expected: "twenty-two",
          },
          {
            input: "23",
            expected: "twenty-three",
          },
          {
            input: "24",
            expected: "twenty-four",
          },
          {
            input: "25",
            expected: "twenty-five",
          },
          {
            input: "26",
            expected: "twenty-six",
          },
          {
            input: "27",
            expected: "twenty-seven",
          },
          {
            input: "28",
            expected: "twenty-eight",
          },
          {
            input: "29",
            expected: "twenty-nine",
          },
          {
            input: "30",
            expected: "thirty",
          },
          {
            input: "31",
            expected: "thirty-one",
          },
          {
            input: "32",
            expected: "thirty-two",
          },
          {
            input: "33",
            expected: "thirty-three",
          },
          {
            input: "34",
            expected: "thirty-four",
          },
          {
            input: "35",
            expected: "thirty-five",
          },
          {
            input: "36",
            expected: "thirty-six",
          },
          {
            input: "37",
            expected: "thirty-seven",
          },
          {
            input: "38",
            expected: "thirty-eight",
          },
          {
            input: "39",
            expected: "thirty-nine",
          },
          {
            input: "40",
            expected: "forty",
          },
          {
            input: "41",
            expected: "forty-one",
          },
          {
            input: "43",
            expected: "forty-three",
          },
          {
            input: "44",
            expected: "forty-four",
          },
          {
            input: "45",
            expected: "forty-five",
          },
          {
            input: "46",
            expected: "forty-six",
          },
          {
            input: "47",
            expected: "forty-seven",
          },
          {
            input: "48",
            expected: "forty-eight",
          },
          {
            input: "49",
            expected: "forty-nine",
          },
          {
            input: "50",
            expected: "fifty",
          },
          {
            input: "51",
            expected: "fifty-one",
          },
          {
            input: "52",
            expected: "fifty-two",
          },
          {
            input: "53",
            expected: "fifty-three",
          },
          {
            input: "54",
            expected: "fifty-four",
          },
          {
            input: "55",
            expected: "fifty-five",
          },
          {
            input: "56",
            expected: "fifty-six",
          },
          {
            input: "57",
            expected: "fifty-seven",
          },
          {
            input: "58",
            expected: "fifty-eight",
          },
          {
            input: "59",
            expected: "fifty-nine",
          },
          {
            input: "60",
            expected: "sixty",
          },
          {
            input: "61",
            expected: "sixty-one",
          },
          {
            input: "62",
            expected: "sixty-two",
          },
          {
            input: "63",
            expected: "sixty-three",
          },
          {
            input: "64",
            expected: "sixty-four",
          },
          {
            input: "65",
            expected: "sixty-five",
          },
          {
            input: "66",
            expected: "sixty-six",
          },
          {
            input: "67",
            expected: "sixty-seven",
          },
          {
            input: "68",
            expected: "sixty-eight",
          },
          {
            input: "69",
            expected: "sixty-nine",
          },
          {
            input: "70",
            expected: "seventy",
          },
          {
            input: "71",
            expected: "seventy-one",
          },
          {
            input: "72",
            expected: "seventy-two",
          },
          {
            input: "73",
            expected: "seventy-three",
          },
          {
            input: "74",
            expected: "seventy-four",
          },
          {
            input: "75",
            expected: "seventy-five",
          },
          {
            input: "76",
            expected: "seventy-six",
          },
          {
            input: "77",
            expected: "seventy-seven",
          },
          {
            input: "78",
            expected: "seventy-eight",
          },
          {
            input: "79",
            expected: "seventy-nine",
          },
          {
            input: "80",
            expected: "eighty",
          },
          {
            input: "81",
            expected: "eighty-one",
          },
          {
            input: "82",
            expected: "eighty-two",
          },
          {
            input: "83",
            expected: "eighty-three",
          },
          {
            input: "84",
            expected: "eighty-four",
          },
          {
            input: "85",
            expected: "eighty-five",
          },
          {
            input: "86",
            expected: "eighty-six",
          },
          {
            input: "87",
            expected: "eighty-seven",
          },
          {
            input: "88",
            expected: "eighty-eight",
          },
          {
            input: "89",
            expected: "eighty-nine",
          },
          {
            input: "90",
            expected: "ninety",
          },
          {
            input: "91",
            expected: "ninety-one",
          },
          {
            input: "92",
            expected: "ninety-two",
          },
          {
            input: "93",
            expected: "ninety-three",
          },
          {
            input: "94",
            expected: "ninety-four",
          },
          {
            input: "95",
            expected: "ninety-five",
          },
          {
            input: "96",
            expected: "ninety-six",
          },
          {
            input: "97",
            expected: "ninety-seven",
          },
          {
            input: "98",
            expected: "ninety-eight",
          },
          {
            input: "99",
            expected: "ninety-nine",
          },
        ],
        hints: [
          "Ключ десятка — n // 10 * 10.",
          "Сначала word = tens[n // 10 * 10].",
          'Если n % 10 != 0, добавь "-" + small[n % 10]. В конце напечатай word.',
        ],
        solution:
          'n = int(input())\nsmall = [\n    "", "one", "two", "three", "four",\n    "five", "six", "seven", "eight", "nine",\n    "ten", "eleven", "twelve", "thirteen", "fourteen",\n    "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"\n]\ntens = {\n    20: "twenty", 30: "thirty", 40: "forty", 50: "fifty",\n    60: "sixty", 70: "seventy", 80: "eighty", 90: "ninety"\n}\nword = tens[n // 10 * 10]\nif n % 10 != 0:\n    word = word + "-" + small[n % 10]\nprint(word)',
        explanation:
          "Проверяются все 80 допустимых чисел. При остатке 0 слово остаётся названием десятка.",
      },
      {
        id: "number-words-3",
        title: "Любое число от 1 до 99",
        prompt:
          "Дано n от 1 до 99. Напечатай название по правилам: 1…19 — отдельное слово; круглые десятки — отдельное слово; остальные — десяток, дефис, единица.",
        starter:
          'n = int(input())\nsmall = [\n    "", "one", "two", "three", "four",\n    "five", "six", "seven", "eight", "nine",\n    "ten", "eleven", "twelve", "thirteen", "fourteen",\n    "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"\n]\ntens = {\n    20: "twenty", 30: "thirty", 40: "forty", 50: "fifty",\n    60: "sixty", 70: "seventy", 80: "eighty", 90: "ninety"\n}\n# Раздели числа на случаи\n',
        inputHelp: "Одно число от 1 до 99.",
        sample: {
          input: "19",
          expected: "nineteen",
        },
        tests: [
          {
            input: "19",
            expected: "nineteen",
          },
          {
            input: "1",
            expected: "one",
          },
          {
            input: "2",
            expected: "two",
          },
          {
            input: "3",
            expected: "three",
          },
          {
            input: "4",
            expected: "four",
          },
          {
            input: "5",
            expected: "five",
          },
          {
            input: "6",
            expected: "six",
          },
          {
            input: "7",
            expected: "seven",
          },
          {
            input: "8",
            expected: "eight",
          },
          {
            input: "9",
            expected: "nine",
          },
          {
            input: "10",
            expected: "ten",
          },
          {
            input: "11",
            expected: "eleven",
          },
          {
            input: "12",
            expected: "twelve",
          },
          {
            input: "13",
            expected: "thirteen",
          },
          {
            input: "14",
            expected: "fourteen",
          },
          {
            input: "15",
            expected: "fifteen",
          },
          {
            input: "16",
            expected: "sixteen",
          },
          {
            input: "17",
            expected: "seventeen",
          },
          {
            input: "18",
            expected: "eighteen",
          },
          {
            input: "20",
            expected: "twenty",
          },
          {
            input: "21",
            expected: "twenty-one",
          },
          {
            input: "22",
            expected: "twenty-two",
          },
          {
            input: "23",
            expected: "twenty-three",
          },
          {
            input: "24",
            expected: "twenty-four",
          },
          {
            input: "25",
            expected: "twenty-five",
          },
          {
            input: "26",
            expected: "twenty-six",
          },
          {
            input: "27",
            expected: "twenty-seven",
          },
          {
            input: "28",
            expected: "twenty-eight",
          },
          {
            input: "29",
            expected: "twenty-nine",
          },
          {
            input: "30",
            expected: "thirty",
          },
          {
            input: "31",
            expected: "thirty-one",
          },
          {
            input: "32",
            expected: "thirty-two",
          },
          {
            input: "33",
            expected: "thirty-three",
          },
          {
            input: "34",
            expected: "thirty-four",
          },
          {
            input: "35",
            expected: "thirty-five",
          },
          {
            input: "36",
            expected: "thirty-six",
          },
          {
            input: "37",
            expected: "thirty-seven",
          },
          {
            input: "38",
            expected: "thirty-eight",
          },
          {
            input: "39",
            expected: "thirty-nine",
          },
          {
            input: "40",
            expected: "forty",
          },
          {
            input: "41",
            expected: "forty-one",
          },
          {
            input: "42",
            expected: "forty-two",
          },
          {
            input: "43",
            expected: "forty-three",
          },
          {
            input: "44",
            expected: "forty-four",
          },
          {
            input: "45",
            expected: "forty-five",
          },
          {
            input: "46",
            expected: "forty-six",
          },
          {
            input: "47",
            expected: "forty-seven",
          },
          {
            input: "48",
            expected: "forty-eight",
          },
          {
            input: "49",
            expected: "forty-nine",
          },
          {
            input: "50",
            expected: "fifty",
          },
          {
            input: "51",
            expected: "fifty-one",
          },
          {
            input: "52",
            expected: "fifty-two",
          },
          {
            input: "53",
            expected: "fifty-three",
          },
          {
            input: "54",
            expected: "fifty-four",
          },
          {
            input: "55",
            expected: "fifty-five",
          },
          {
            input: "56",
            expected: "fifty-six",
          },
          {
            input: "57",
            expected: "fifty-seven",
          },
          {
            input: "58",
            expected: "fifty-eight",
          },
          {
            input: "59",
            expected: "fifty-nine",
          },
          {
            input: "60",
            expected: "sixty",
          },
          {
            input: "61",
            expected: "sixty-one",
          },
          {
            input: "62",
            expected: "sixty-two",
          },
          {
            input: "63",
            expected: "sixty-three",
          },
          {
            input: "64",
            expected: "sixty-four",
          },
          {
            input: "65",
            expected: "sixty-five",
          },
          {
            input: "66",
            expected: "sixty-six",
          },
          {
            input: "67",
            expected: "sixty-seven",
          },
          {
            input: "68",
            expected: "sixty-eight",
          },
          {
            input: "69",
            expected: "sixty-nine",
          },
          {
            input: "70",
            expected: "seventy",
          },
          {
            input: "71",
            expected: "seventy-one",
          },
          {
            input: "72",
            expected: "seventy-two",
          },
          {
            input: "73",
            expected: "seventy-three",
          },
          {
            input: "74",
            expected: "seventy-four",
          },
          {
            input: "75",
            expected: "seventy-five",
          },
          {
            input: "76",
            expected: "seventy-six",
          },
          {
            input: "77",
            expected: "seventy-seven",
          },
          {
            input: "78",
            expected: "seventy-eight",
          },
          {
            input: "79",
            expected: "seventy-nine",
          },
          {
            input: "80",
            expected: "eighty",
          },
          {
            input: "81",
            expected: "eighty-one",
          },
          {
            input: "82",
            expected: "eighty-two",
          },
          {
            input: "83",
            expected: "eighty-three",
          },
          {
            input: "84",
            expected: "eighty-four",
          },
          {
            input: "85",
            expected: "eighty-five",
          },
          {
            input: "86",
            expected: "eighty-six",
          },
          {
            input: "87",
            expected: "eighty-seven",
          },
          {
            input: "88",
            expected: "eighty-eight",
          },
          {
            input: "89",
            expected: "eighty-nine",
          },
          {
            input: "90",
            expected: "ninety",
          },
          {
            input: "91",
            expected: "ninety-one",
          },
          {
            input: "92",
            expected: "ninety-two",
          },
          {
            input: "93",
            expected: "ninety-three",
          },
          {
            input: "94",
            expected: "ninety-four",
          },
          {
            input: "95",
            expected: "ninety-five",
          },
          {
            input: "96",
            expected: "ninety-six",
          },
          {
            input: "97",
            expected: "ninety-seven",
          },
          {
            input: "98",
            expected: "ninety-eight",
          },
          {
            input: "99",
            expected: "ninety-nine",
          },
        ],
        hints: [
          "Для n < 20 не обращайся к tens — нужного ключа там нет.",
          "В else используй способ из предыдущего задания.",
          "Сначала выбери word, затем выведи его одним print после всех условий.",
        ],
        solution:
          'n = int(input())\nsmall = [\n    "", "one", "two", "three", "four",\n    "five", "six", "seven", "eight", "nine",\n    "ten", "eleven", "twelve", "thirteen", "fourteen",\n    "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"\n]\ntens = {\n    20: "twenty", 30: "thirty", 40: "forty", 50: "fifty",\n    60: "sixty", 70: "seventy", 80: "eighty", 90: "ninety"\n}\nif n < 20:\n    word = small[n]\nelse:\n    word = tens[n // 10 * 10]\n    if n % 10 != 0:\n        word = word + "-" + small[n % 10]\nprint(word)',
        explanation:
          "Один алгоритм покрывает все 99 значений. Вложенный if в ветви else нужен только для добавления ненулевой единицы.",
      },
    ],
    referenceTable: {
      title: "Справочник английских чисел",
      headers: ["Число", "Название"],
      rows: [
        ["1", "one"],
        ["2", "two"],
        ["3", "three"],
        ["4", "four"],
        ["5", "five"],
        ["6", "six"],
        ["7", "seven"],
        ["8", "eight"],
        ["9", "nine"],
        ["10", "ten"],
        ["11", "eleven"],
        ["12", "twelve"],
        ["13", "thirteen"],
        ["14", "fourteen"],
        ["15", "fifteen"],
        ["16", "sixteen"],
        ["17", "seventeen"],
        ["18", "eighteen"],
        ["19", "nineteen"],
        ["20", "twenty"],
        ["30", "thirty"],
        ["40", "forty"],
        ["50", "fifty"],
        ["60", "sixty"],
        ["70", "seventy"],
        ["80", "eighty"],
        ["90", "ninety"],
        ["100", "hundred"],
        ["1000", "thousand"],
      ],
    },
  },
  {
    id: "years",
    week: 4,
    number: "20",
    title: "Олимпиадная задача E",
    subtitle: "Произносим год строго по правилам условия.",
    duration: 60,
    goals: [
      "Разделить 1900…2026 на шесть случаев",
      "Использовать названия чисел в новой задаче",
      "Проверить пробелы, дефисы и границы",
    ],
    sections: [
      {
        title: "Что требуется в задаче E",
        body: "На входе один целый год Y от 1900 до 2026 включительно. Нужно вывести на одной строке его английское произношение по правилам из PDF. Это точные правила задачи, а не все возможные варианты разговорной речи. Верхняя граница 2026 задана условием и не меняется автоматически с календарём.",
      },
      {
        title: "Шесть случаев",
        body: "1900: nineteen hundred. 1901…1909: nineteen oh и название последней цифры. 1910…1999: nineteen и название последних двух цифр. 2000: two thousand. 2001…2009: two thousand и название последней цифры. 2010…2026: twenty и название последних двух цифр. Между частями — один пробел. Внутри составного числа — дефис.",
        code: "1900 → nineteen hundred\n1905 → nineteen oh five\n1940 → nineteen forty\n2000 → two thousand\n2007 → two thousand seven\n2026 → twenty twenty-six",
        caption:
          "Все шесть примеров взяты из PDF. Это образцы ответа, а не команды Python.",
      },
      {
        title: "Сначала исключения",
        body: "Годы 1900 и 2000 выдели отдельными ветвями. Иначе остаток Y % 100 будет равен нулю, а правила для него другие. Во всех остальных случаях остаток от 1 до 99. Его можно превратить в word тем же способом, что в прошлом уроке. Справочник и таблицы в стартовом коде помогут со всеми написаниями.",
      },
      {
        title: "Выбираем начало фразы",
        body: 'После исключений год меньше 1910 получает начало "nineteen oh ". Год меньше 2000 — "nineteen ". Год меньше 2010 — "two thousand ". Остальные — "twenty ". Здесь в конце каждой строки-начала есть ровно один пробел. Добавь word оператором + и выведи готовую фразу. Слово oh пишется буквами o и h: это не цифра 0 и не zero.',
      },
      {
        title: "Следим за отступами",
        body: "Разбор остатка находится внутри внешнего else. Проверка n < 20 имеет отступ четыре пробела. Её действия — восемь, а действие внутри ещё одного if — двенадцать. Каждый новый вложенный блок добавляет четыре пробела. Итоговый print(answer) стоит без отступа после всех ветвей, чтобы работать и для 1900, и для 2000.",
      },
      {
        title: "Проверяем переходы",
        body: "Полезные пары: 1900/1901, 1909/1910, 1999/2000, 2009/2010, 2019/2020/2021. В 1909 нужно oh, в 1910 уже нет. В 2009 — two thousand, в 2010 — twenty. В 2020 нет дефиса после последнего twenty, а в 2021 нужен twenty-one. В тренажёре полная задача проверяется на всех 127 допустимых годах. Это учебные проверки по условию, а не подключение к официальному жюри.",
      },
    ],
    takeaway:
      "Особые 1900 и 2000 — отдельно. Остальным годам нужны правильное начало фразы и название Y % 100. Пробелы и дефисы строго по условию.",
    quiz: {
      question: "Как по правилам задачи произносится 2010?",
      options: ["two thousand ten", "twenty ten", "twenty oh ten"],
      answer: 1,
      explanation:
        "Начиная с 2010 условие требует twenty и название последних двух цифр. Даже понятный другой вариант не соответствует задаче.",
    },
    exercises: [
      {
        id: "years-1",
        title: "Начало прошлого века",
        prompt:
          "Дан год Y от 1900 до 1909. Выведи nineteen hundred для 1900, иначе nineteen oh и английское название последней цифры через пробел. Это первый фрагмент задачи E.",
        starter:
          'y = int(input())\nsmall = [\n    "", "one", "two", "three", "four",\n    "five", "six", "seven", "eight", "nine",\n    "ten", "eleven", "twelve", "thirteen", "fourteen",\n    "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"\n]\n',
        inputHelp: "Один год от 1900 до 1909.",
        sample: {
          input: "1905",
          expected: "nineteen oh five",
        },
        tests: [
          {
            input: "1905",
            expected: "nineteen oh five",
          },
          {
            input: "1900",
            expected: "nineteen hundred",
          },
          {
            input: "1901",
            expected: "nineteen oh one",
          },
          {
            input: "1902",
            expected: "nineteen oh two",
          },
          {
            input: "1903",
            expected: "nineteen oh three",
          },
          {
            input: "1904",
            expected: "nineteen oh four",
          },
          {
            input: "1906",
            expected: "nineteen oh six",
          },
          {
            input: "1907",
            expected: "nineteen oh seven",
          },
          {
            input: "1908",
            expected: "nineteen oh eight",
          },
          {
            input: "1909",
            expected: "nineteen oh nine",
          },
        ],
        hints: [
          "Выдели y == 1900 отдельно.",
          "Иначе последняя цифра равна y % 10.",
          'Добавь small[y % 10] к строке "nineteen oh ".',
        ],
        solution:
          'y = int(input())\nsmall = [\n    "", "one", "two", "three", "four",\n    "five", "six", "seven", "eight", "nine",\n    "ten", "eleven", "twelve", "thirteen", "fourteen",\n    "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"\n]\nif y == 1900:\n    print("nineteen hundred")\nelse:\n    print("nineteen oh " + small[y % 10])',
        explanation:
          "Нельзя произносить 1900 как nineteen oh: у него собственное правило.",
      },
      {
        id: "years-2",
        title: "Начало нового тысячелетия",
        prompt:
          "Дан год Y от 2000 до 2009. Для 2000 выведи two thousand. Для остальных добавь через один пробел название последней цифры. Слово oh здесь не используется.",
        starter:
          'y = int(input())\nsmall = [\n    "", "one", "two", "three", "four",\n    "five", "six", "seven", "eight", "nine",\n    "ten", "eleven", "twelve", "thirteen", "fourteen",\n    "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"\n]\n',
        inputHelp: "Один год от 2000 до 2009.",
        sample: {
          input: "2007",
          expected: "two thousand seven",
        },
        tests: [
          {
            input: "2007",
            expected: "two thousand seven",
          },
          {
            input: "2000",
            expected: "two thousand",
          },
          {
            input: "2001",
            expected: "two thousand one",
          },
          {
            input: "2002",
            expected: "two thousand two",
          },
          {
            input: "2003",
            expected: "two thousand three",
          },
          {
            input: "2004",
            expected: "two thousand four",
          },
          {
            input: "2005",
            expected: "two thousand five",
          },
          {
            input: "2006",
            expected: "two thousand six",
          },
          {
            input: "2008",
            expected: "two thousand eight",
          },
          {
            input: "2009",
            expected: "two thousand nine",
          },
        ],
        hints: [
          "Рассмотри y == 2000 отдельно, чтобы не добавлять пробел в конце.",
          "В остальных случаях нужна small[y % 10].",
          'Собери "two thousand " + small[y % 10].',
        ],
        solution:
          'y = int(input())\nsmall = [\n    "", "one", "two", "three", "four",\n    "five", "six", "seven", "eight", "nine",\n    "ten", "eleven", "twelve", "thirteen", "fourteen",\n    "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"\n]\nif y == 2000:\n    print("two thousand")\nelse:\n    print("two thousand " + small[y % 10])',
        explanation:
          "В отличие от 1901…1909, начало 2000-х не требует oh. За фразой для 2000 нет лишнего пробела.",
      },
      {
        id: "years-3",
        title: "E. Произношение года",
        prompt:
          "Полная задача E из PDF. Дан Y от 1900 до 2026. Выведи одну строку: 1900 — nineteen hundred; 1901…1909 — nineteen oh + название цифры; 1910…1999 — nineteen + название последних двух цифр; 2000 — two thousand; 2001…2009 — two thousand + название цифры; 2010…2026 — twenty + название последних двух цифр. Части соединяются одним пробелом; внутри составных чисел 21…99 (кроме круглых десятков) нужен дефис. Все буквы строчные, без пояснений и лишних пробелов. Знаки + в этом описании обозначают соединение частей и в ответ не входят.",
        starter:
          'y = int(input())\nsmall = [\n    "", "one", "two", "three", "four",\n    "five", "six", "seven", "eight", "nine",\n    "ten", "eleven", "twelve", "thirteen", "fourteen",\n    "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"\n]\ntens = {\n    20: "twenty", 30: "thirty", 40: "forty", 50: "fifty",\n    60: "sixty", 70: "seventy", 80: "eighty", 90: "ninety"\n}\n# Сначала выдели 1900 и 2000\n# Для остальных собери начало и название последних двух цифр\n',
        inputHelp: "Один целый год от 1900 до 2026.",
        sample: {
          input: "2026",
          expected: "twenty twenty-six",
        },
        tests: [
          {
            input: "2026",
            expected: "twenty twenty-six",
          },
          {
            input: "1900",
            expected: "nineteen hundred",
          },
          {
            input: "1901",
            expected: "nineteen oh one",
          },
          {
            input: "1902",
            expected: "nineteen oh two",
          },
          {
            input: "1903",
            expected: "nineteen oh three",
          },
          {
            input: "1904",
            expected: "nineteen oh four",
          },
          {
            input: "1905",
            expected: "nineteen oh five",
          },
          {
            input: "1906",
            expected: "nineteen oh six",
          },
          {
            input: "1907",
            expected: "nineteen oh seven",
          },
          {
            input: "1908",
            expected: "nineteen oh eight",
          },
          {
            input: "1909",
            expected: "nineteen oh nine",
          },
          {
            input: "1910",
            expected: "nineteen ten",
          },
          {
            input: "1911",
            expected: "nineteen eleven",
          },
          {
            input: "1912",
            expected: "nineteen twelve",
          },
          {
            input: "1913",
            expected: "nineteen thirteen",
          },
          {
            input: "1914",
            expected: "nineteen fourteen",
          },
          {
            input: "1915",
            expected: "nineteen fifteen",
          },
          {
            input: "1916",
            expected: "nineteen sixteen",
          },
          {
            input: "1917",
            expected: "nineteen seventeen",
          },
          {
            input: "1918",
            expected: "nineteen eighteen",
          },
          {
            input: "1919",
            expected: "nineteen nineteen",
          },
          {
            input: "1920",
            expected: "nineteen twenty",
          },
          {
            input: "1921",
            expected: "nineteen twenty-one",
          },
          {
            input: "1922",
            expected: "nineteen twenty-two",
          },
          {
            input: "1923",
            expected: "nineteen twenty-three",
          },
          {
            input: "1924",
            expected: "nineteen twenty-four",
          },
          {
            input: "1925",
            expected: "nineteen twenty-five",
          },
          {
            input: "1926",
            expected: "nineteen twenty-six",
          },
          {
            input: "1927",
            expected: "nineteen twenty-seven",
          },
          {
            input: "1928",
            expected: "nineteen twenty-eight",
          },
          {
            input: "1929",
            expected: "nineteen twenty-nine",
          },
          {
            input: "1930",
            expected: "nineteen thirty",
          },
          {
            input: "1931",
            expected: "nineteen thirty-one",
          },
          {
            input: "1932",
            expected: "nineteen thirty-two",
          },
          {
            input: "1933",
            expected: "nineteen thirty-three",
          },
          {
            input: "1934",
            expected: "nineteen thirty-four",
          },
          {
            input: "1935",
            expected: "nineteen thirty-five",
          },
          {
            input: "1936",
            expected: "nineteen thirty-six",
          },
          {
            input: "1937",
            expected: "nineteen thirty-seven",
          },
          {
            input: "1938",
            expected: "nineteen thirty-eight",
          },
          {
            input: "1939",
            expected: "nineteen thirty-nine",
          },
          {
            input: "1940",
            expected: "nineteen forty",
          },
          {
            input: "1941",
            expected: "nineteen forty-one",
          },
          {
            input: "1942",
            expected: "nineteen forty-two",
          },
          {
            input: "1943",
            expected: "nineteen forty-three",
          },
          {
            input: "1944",
            expected: "nineteen forty-four",
          },
          {
            input: "1945",
            expected: "nineteen forty-five",
          },
          {
            input: "1946",
            expected: "nineteen forty-six",
          },
          {
            input: "1947",
            expected: "nineteen forty-seven",
          },
          {
            input: "1948",
            expected: "nineteen forty-eight",
          },
          {
            input: "1949",
            expected: "nineteen forty-nine",
          },
          {
            input: "1950",
            expected: "nineteen fifty",
          },
          {
            input: "1951",
            expected: "nineteen fifty-one",
          },
          {
            input: "1952",
            expected: "nineteen fifty-two",
          },
          {
            input: "1953",
            expected: "nineteen fifty-three",
          },
          {
            input: "1954",
            expected: "nineteen fifty-four",
          },
          {
            input: "1955",
            expected: "nineteen fifty-five",
          },
          {
            input: "1956",
            expected: "nineteen fifty-six",
          },
          {
            input: "1957",
            expected: "nineteen fifty-seven",
          },
          {
            input: "1958",
            expected: "nineteen fifty-eight",
          },
          {
            input: "1959",
            expected: "nineteen fifty-nine",
          },
          {
            input: "1960",
            expected: "nineteen sixty",
          },
          {
            input: "1961",
            expected: "nineteen sixty-one",
          },
          {
            input: "1962",
            expected: "nineteen sixty-two",
          },
          {
            input: "1963",
            expected: "nineteen sixty-three",
          },
          {
            input: "1964",
            expected: "nineteen sixty-four",
          },
          {
            input: "1965",
            expected: "nineteen sixty-five",
          },
          {
            input: "1966",
            expected: "nineteen sixty-six",
          },
          {
            input: "1967",
            expected: "nineteen sixty-seven",
          },
          {
            input: "1968",
            expected: "nineteen sixty-eight",
          },
          {
            input: "1969",
            expected: "nineteen sixty-nine",
          },
          {
            input: "1970",
            expected: "nineteen seventy",
          },
          {
            input: "1971",
            expected: "nineteen seventy-one",
          },
          {
            input: "1972",
            expected: "nineteen seventy-two",
          },
          {
            input: "1973",
            expected: "nineteen seventy-three",
          },
          {
            input: "1974",
            expected: "nineteen seventy-four",
          },
          {
            input: "1975",
            expected: "nineteen seventy-five",
          },
          {
            input: "1976",
            expected: "nineteen seventy-six",
          },
          {
            input: "1977",
            expected: "nineteen seventy-seven",
          },
          {
            input: "1978",
            expected: "nineteen seventy-eight",
          },
          {
            input: "1979",
            expected: "nineteen seventy-nine",
          },
          {
            input: "1980",
            expected: "nineteen eighty",
          },
          {
            input: "1981",
            expected: "nineteen eighty-one",
          },
          {
            input: "1982",
            expected: "nineteen eighty-two",
          },
          {
            input: "1983",
            expected: "nineteen eighty-three",
          },
          {
            input: "1984",
            expected: "nineteen eighty-four",
          },
          {
            input: "1985",
            expected: "nineteen eighty-five",
          },
          {
            input: "1986",
            expected: "nineteen eighty-six",
          },
          {
            input: "1987",
            expected: "nineteen eighty-seven",
          },
          {
            input: "1988",
            expected: "nineteen eighty-eight",
          },
          {
            input: "1989",
            expected: "nineteen eighty-nine",
          },
          {
            input: "1990",
            expected: "nineteen ninety",
          },
          {
            input: "1991",
            expected: "nineteen ninety-one",
          },
          {
            input: "1992",
            expected: "nineteen ninety-two",
          },
          {
            input: "1993",
            expected: "nineteen ninety-three",
          },
          {
            input: "1994",
            expected: "nineteen ninety-four",
          },
          {
            input: "1995",
            expected: "nineteen ninety-five",
          },
          {
            input: "1996",
            expected: "nineteen ninety-six",
          },
          {
            input: "1997",
            expected: "nineteen ninety-seven",
          },
          {
            input: "1998",
            expected: "nineteen ninety-eight",
          },
          {
            input: "1999",
            expected: "nineteen ninety-nine",
          },
          {
            input: "2000",
            expected: "two thousand",
          },
          {
            input: "2001",
            expected: "two thousand one",
          },
          {
            input: "2002",
            expected: "two thousand two",
          },
          {
            input: "2003",
            expected: "two thousand three",
          },
          {
            input: "2004",
            expected: "two thousand four",
          },
          {
            input: "2005",
            expected: "two thousand five",
          },
          {
            input: "2006",
            expected: "two thousand six",
          },
          {
            input: "2007",
            expected: "two thousand seven",
          },
          {
            input: "2008",
            expected: "two thousand eight",
          },
          {
            input: "2009",
            expected: "two thousand nine",
          },
          {
            input: "2010",
            expected: "twenty ten",
          },
          {
            input: "2011",
            expected: "twenty eleven",
          },
          {
            input: "2012",
            expected: "twenty twelve",
          },
          {
            input: "2013",
            expected: "twenty thirteen",
          },
          {
            input: "2014",
            expected: "twenty fourteen",
          },
          {
            input: "2015",
            expected: "twenty fifteen",
          },
          {
            input: "2016",
            expected: "twenty sixteen",
          },
          {
            input: "2017",
            expected: "twenty seventeen",
          },
          {
            input: "2018",
            expected: "twenty eighteen",
          },
          {
            input: "2019",
            expected: "twenty nineteen",
          },
          {
            input: "2020",
            expected: "twenty twenty",
          },
          {
            input: "2021",
            expected: "twenty twenty-one",
          },
          {
            input: "2022",
            expected: "twenty twenty-two",
          },
          {
            input: "2023",
            expected: "twenty twenty-three",
          },
          {
            input: "2024",
            expected: "twenty twenty-four",
          },
          {
            input: "2025",
            expected: "twenty twenty-five",
          },
        ],
        hints: [
          "Начни с исключений y == 1900 и y == 2000. В else вычисли n = y % 100.",
          "Преврати n в word способом из «Любое число от 1 до 99». Затем выбери prefix по границам 1910, 2000 и 2010.",
          "Во внешнем else собери answer = prefix + word. Один print(answer) после всех ветвей выведет результат.",
        ],
        solution:
          'y = int(input())\nsmall = [\n    "", "one", "two", "three", "four",\n    "five", "six", "seven", "eight", "nine",\n    "ten", "eleven", "twelve", "thirteen", "fourteen",\n    "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"\n]\ntens = {\n    20: "twenty", 30: "thirty", 40: "forty", 50: "fifty",\n    60: "sixty", 70: "seventy", 80: "eighty", 90: "ninety"\n}\nif y == 1900:\n    answer = "nineteen hundred"\nelif y == 2000:\n    answer = "two thousand"\nelse:\n    n = y % 100\n    if n < 20:\n        word = small[n]\n    else:\n        word = tens[n // 10 * 10]\n        if n % 10 != 0:\n            word = word + "-" + small[n % 10]\n    if y < 1910:\n        prefix = "nineteen oh "\n    elif y < 2000:\n        prefix = "nineteen "\n    elif y < 2010:\n        prefix = "two thousand "\n    else:\n        prefix = "twenty "\n    answer = prefix + word\nprint(answer)',
        explanation:
          "Особые годы обрабатываются до разбора остатка. Остальным выбираются название числа и одно из четырёх начал. Проверяются все 127 годов, включая переходы и шесть примеров PDF.",
      },
    ],
    referenceTable: {
      title: "Справочник английских чисел",
      headers: ["Число", "Название"],
      rows: [
        ["1", "one"],
        ["2", "two"],
        ["3", "three"],
        ["4", "four"],
        ["5", "five"],
        ["6", "six"],
        ["7", "seven"],
        ["8", "eight"],
        ["9", "nine"],
        ["10", "ten"],
        ["11", "eleven"],
        ["12", "twelve"],
        ["13", "thirteen"],
        ["14", "fourteen"],
        ["15", "fifteen"],
        ["16", "sixteen"],
        ["17", "seventeen"],
        ["18", "eighteen"],
        ["19", "nineteen"],
        ["20", "twenty"],
        ["30", "thirty"],
        ["40", "forty"],
        ["50", "fifty"],
        ["60", "sixty"],
        ["70", "seventy"],
        ["80", "eighty"],
        ["90", "ninety"],
        ["100", "hundred"],
        ["1000", "thousand"],
      ],
    },
  },
];
