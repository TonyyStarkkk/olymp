import type { Lesson } from "./course";

// Task A: source PDF pages 10 and 12; straight paths only, lowercase letters.
export const fifthWeekLessons: Lesson[] = [
  {
    id: "enumeration",
    week: 5,
    number: "21",
    title: "Перебираем варианты",
    subtitle: "Проверяем кандидатов в понятном порядке.",
    duration: 45,
    goals: [
      "Отделять перебор от проверки",
      "Использовать два вложенных цикла",
      "Не путать упорядоченные пары",
    ],
    sections: [
      {
        title: "Кандидат и проверка",
        body: "Перебрать — значит рассмотреть каждый возможный вариант. Для чисел от 1 до n подходит for i in range(1, n + 1). Внутри условие проверяет кандидата. Например, число d — делитель n, если n % d == 0. Ноль в кандидаты не включаем: на него делить нельзя.",
        code: "n = 6\nfor d in range(1, n + 1):\n    if n % d == 0:\n        print(d)",
        caption:
          "Ответ: 1, 2, 3, 6 — каждый с новой строки. Мы рассмотрели все числа от 1 до 6, но напечатали только подходящие.",
      },
      {
        title: "Два выбора — два цикла",
        body: "Пусть выбираем сначала a, затем b. Для каждого a нужно рассмотреть все b. Внутренний цикл полностью выполняется заново на каждом шаге внешнего. Четыре пробела вводят внутренний for, восемь — действие внутри него.",
        code: "for a in range(1, 3):\n    for b in range(1, 4):\n        print(a, b)",
        caption:
          "Порядок: 1 1, 1 2, 1 3, затем 2 1, 2 2, 2 3. Всего 2 × 3 = 6 пар.",
      },
      {
        title: "Порядок иногда важен",
        body: "Пары (1, 2) и (2, 1) различаются, если первая позиция и вторая играют разные роли. Например, числа 12 и 21 — разные. Если условие разрешает только разные цифры, добавь проверку a != b; не заменяй её на a < b, иначе пропустишь половину порядков. Число из двух цифр a и b получается как 10 * a + b.",
      },
      {
        title: "Считаем вместо печати",
        body: "Если нужен только ответ «сколько», подготовь count = 0 до циклов. За каждый подходящий вариант увеличивай count на 1. Печатай итог после обоих циклов. Сброс count внутри внешнего цикла потеряет результаты предыдущих a.",
      },
      {
        title: "Перебор должен быть посильным",
        body: "Для n вариантов снаружи и m внутри проверок будет n × m. В задачах этого урока границы маленькие. Не перебирай миллиард кандидатов, если ответ можно получить короткой формулой. Сначала выпиши варианты вручную для маленького входа и сравни с программой.",
      },
    ],
    takeaway:
      "Перебор создаёт кандидатов, условие отбирает нужные, счётчик считает их. Во вложенных циклах внутренний перебирается заново для каждого внешнего значения.",
    quiz: {
      question: "Сколько строк выведется?",
      options: ["2", "3", "6"],
      answer: 2,
      explanation:
        "Для каждого из двух a внутренний цикл даёт три b: 2 × 3 = 6.",
      code: "for a in range(2):\n    for b in range(3):\n        print(a, b)",
    },
    exercises: [
      {
        id: "enumeration-1",
        title: "Все делители",
        prompt:
          "Дано целое n от 1 до 1000. Выведи все положительные делители n в возрастающем порядке, по одному на строке.",
        starter: "n = int(input())\n",
        inputHelp: "Одно число от 1 до 1000.",
        sample: {
          input: "6",
          expected: "1\n2\n3\n6",
        },
        tests: [
          {
            input: "6",
            expected: "1\n2\n3\n6",
          },
          {
            input: "1",
            expected: "1",
          },
          {
            input: "2",
            expected: "1\n2",
          },
          {
            input: "13",
            expected: "1\n13",
          },
          {
            input: "36",
            expected: "1\n2\n3\n4\n6\n9\n12\n18\n36",
          },
          {
            input: "1000",
            expected:
              "1\n2\n4\n5\n8\n10\n20\n25\n40\n50\n100\n125\n200\n250\n500\n1000",
          },
        ],
        hints: [
          "Проверь d от 1 до n включительно.",
          "Делитель подходит, если n % d == 0.",
          "Напечатай d внутри подходящего if. Возрастающий range уже даёт нужный порядок.",
        ],
        solution:
          "n = int(input())\nfor d in range(1, n + 1):\n    if n % d == 0:\n        print(d)",
        explanation:
          "1 и само n обязательно входят. При n = 1 число печатается один раз.",
      },
      {
        id: "enumeration-2",
        title: "Пары с нужной суммой",
        prompt:
          "Даны n и m от 1 до 20, затем s от 2 до 40 — три строки. Сколько упорядоченных пар (a, b) удовлетворяют 1 ≤ a ≤ n, 1 ≤ b ≤ m и a + b = s? Выведи количество.",
        starter: "n = int(input())\nm = int(input())\ns = int(input())\n",
        inputHelp: "n, m, s на отдельных строках.",
        sample: {
          input: "3\n4\n5",
          expected: "3",
        },
        tests: [
          {
            input: "3\n4\n5",
            expected: "3",
          },
          {
            input: "1\n1\n2",
            expected: "1",
          },
          {
            input: "1\n1\n3",
            expected: "0",
          },
          {
            input: "2\n3\n3",
            expected: "2",
          },
          {
            input: "20\n20\n21",
            expected: "20",
          },
          {
            input: "20\n20\n40",
            expected: "1",
          },
          {
            input: "2\n5\n2",
            expected: "1",
          },
        ],
        hints: [
          "Внешний цикл выбирает a, внутренний — b.",
          "Счётчик начинается с нуля до обоих циклов.",
          "Внутри внутреннего цикла проверь a + b == s и увеличь count.",
        ],
        solution:
          "n = int(input())\nm = int(input())\ns = int(input())\ncount = 0\nfor a in range(1, n + 1):\n    for b in range(1, m + 1):\n        if a + b == s:\n            count = count + 1\nprint(count)",
        explanation:
          "Для 3, 4, 5 подходят (1,4), (2,3), (3,2): три пары. Каждая пара рассматривается ровно один раз.",
      },
      {
        id: "enumeration-3",
        title: "Разные цифры, разные числа",
        prompt:
          "Дано n от 1 до 9. Составь все двузначные числа из цифр 1…n, у которых цифры различны. Выведи их в возрастающем порядке, по одному на строке. Если вариантов нет, вывод пустой.",
        starter: "n = int(input())\n",
        inputHelp: "Одна цифра от 1 до 9.",
        sample: {
          input: "3",
          expected: "12\n13\n21\n23\n31\n32",
        },
        tests: [
          {
            input: "3",
            expected: "12\n13\n21\n23\n31\n32",
          },
          {
            input: "1",
            expected: "",
          },
          {
            input: "2",
            expected: "12\n21",
          },
          {
            input: "5",
            expected:
              "12\n13\n14\n15\n21\n23\n24\n25\n31\n32\n34\n35\n41\n42\n43\n45\n51\n52\n53\n54",
          },
          {
            input: "9",
            expected:
              "12\n13\n14\n15\n16\n17\n18\n19\n21\n23\n24\n25\n26\n27\n28\n29\n31\n32\n34\n35\n36\n37\n38\n39\n41\n42\n43\n45\n46\n47\n48\n49\n51\n52\n53\n54\n56\n57\n58\n59\n61\n62\n63\n64\n65\n67\n68\n69\n71\n72\n73\n74\n75\n76\n78\n79\n81\n82\n83\n84\n85\n86\n87\n89\n91\n92\n93\n94\n95\n96\n97\n98",
          },
        ],
        hints: [
          "Сначала перебирай десятки a, затем единицы b.",
          "Условие a != b исключает 11, 22 и подобные числа.",
          "Выводи 10 * a + b. Пары (1,2) и (2,1) дают разные числа.",
        ],
        solution:
          "n = int(input())\nfor a in range(1, n + 1):\n    for b in range(1, n + 1):\n        if a != b:\n            print(10 * a + b)",
        explanation:
          "При n = 1 вариантов нет. Два возрастающих цикла сразу создают возрастающий порядок чисел.",
      },
    ],
  },
  {
    id: "windows",
    week: 5,
    number: "22",
    title: "Окна в строке",
    subtitle: "Считаем подряд идущие фрагменты.",
    duration: 45,
    goals: [
      "Выделять фрагмент фиксированной длины",
      "Находить последнее допустимое начало",
      "Различать число позиций и число разных текстов",
    ],
    sections: [
      {
        title: "Что такое окно",
        body: 'Окном длины k назовём k соседних символов строки. Для text = "abcde" и k = 3 окна: abc, bcd, cde. Пропускать символы нельзя: ace не окно. Начало start перемещается на одну позицию, конец среза равен start + k и не включается.',
        code: 'text = "abcde"\nk = 3\nfor start in range(len(text) - k + 1):\n    print(text[start:start + k])',
        caption: "Три строки: abc, bcd, cde. Окна могут перекрываться.",
      },
      {
        title: "Почему плюс один",
        body: "Для строки длиной n последнее допустимое начало — n − k: фрагмент заканчивается ровно у края. Начала идут от 0 до n − k включительно, поэтому их n − k + 1. Если k = n, есть одно окно, а не ноль. Если k > n, окон нет. В Python range с отрицательной конечной границей пуст, но формула количества без проверки могла бы дать отрицательный ответ.",
      },
      {
        title: "Срез не сообщает об ошибке длины",
        body: "Срез text[start:start + k] у правого края может вернуть меньше k символов и не вызвать ошибку. Поэтому нельзя перебирать все start до len(text): нужно ограничить начало так, чтобы окно помещалось целиком.",
        code: 'text = "abc"\nprint(text[2:5])',
        caption:
          "Напечатается только c, а не фрагмент длины 3. Проверять границы должен наш цикл.",
      },
      {
        title: "Ищем вхождения",
        body: "Если ищем образец pattern, длина окна равна len(pattern). Сравни каждое окно с pattern и посчитай совпадения. Для текста aaaa образец aa встречается в позициях 0, 1, 2: три вхождения. Перекрывающиеся вхождения здесь тоже считаются. Не перескакивай сразу на длину образца.",
      },
      {
        title: "Позиции и разные слова",
        body: "В строке aaaa три окна длины 2, но текст у всех один: aa. В этом уроке считаем позиции. В следующем научимся считать разные значения. На клавиатурной строке с неповторяющимися буквами разные начала дают разные слова — это пригодится в задаче A.",
      },
    ],
    takeaway:
      "Окно длины k начинается в позициях 0…n − k. При k ≤ n количество равно n − k + 1, иначе 0. Перекрытие окон разрешено.",
    quiz: {
      question: "Сколько окон длины 2 в строке aaaa, если считаем позиции?",
      options: ["1", "2", "3"],
      answer: 2,
      explanation:
        "Начала 0, 1, 2. Текст всех окон совпадает, но позиции различаются.",
    },
    exercises: [
      {
        id: "windows-1",
        title: "Покажи все окна",
        prompt:
          "Дана строка text из 1–30 строчных латинских букв, затем k от 1 до 35. Выведи все её подряд идущие фрагменты длины k слева направо, по одному на строке. Одинаковые фрагменты не удаляй. Если k больше длины, ничего не печатай.",
        starter: "text = input()\nk = int(input())\n",
        inputHelp: "Строка, затем длина окна.",
        sample: {
          input: "abcde\n3",
          expected: "abc\nbcd\ncde",
        },
        tests: [
          {
            input: "abcde\n3",
            expected: "abc\nbcd\ncde",
          },
          {
            input: "a\n1",
            expected: "a",
          },
          {
            input: "abc\n3",
            expected: "abc",
          },
          {
            input: "abc\n4",
            expected: "",
          },
          {
            input: "aaaa\n2",
            expected: "aa\naa\naa",
          },
          {
            input: "abc\n1",
            expected: "a\nb\nc",
          },
          {
            input: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\n35",
            expected: "",
          },
        ],
        hints: [
          "Срез начинается в start и заканчивается перед start + k.",
          "Начала перебираются через range(len(text) - k + 1).",
          "В цикле выведи text[start:start + k].",
        ],
        solution:
          "text = input()\nk = int(input())\nfor start in range(len(text) - k + 1):\n    print(text[start:start + k])",
        explanation:
          "Правильная граница включает последнее полное окно и исключает обрезанные фрагменты.",
      },
      {
        id: "windows-2",
        title: "Посчитай без перебора",
        prompt:
          "Даны n от 0 до 1000000000 — длина строки — и k от 1 до 1000000000. Выведи количество позиций для полного окна длины k. Сам текст не дан: используй формулу и условие.",
        starter: "n = int(input())\nk = int(input())\n",
        inputHelp: "n и k на отдельных строках.",
        sample: {
          input: "5\n3",
          expected: "3",
        },
        tests: [
          {
            input: "5\n3",
            expected: "3",
          },
          {
            input: "0\n1",
            expected: "0",
          },
          {
            input: "1\n1",
            expected: "1",
          },
          {
            input: "3\n4",
            expected: "0",
          },
          {
            input: "10\n10",
            expected: "1",
          },
          {
            input: "1000000000\n1",
            expected: "1000000000",
          },
          {
            input: "1000000000\n1000000000",
            expected: "1",
          },
          {
            input: "1\n1000000000",
            expected: "0",
          },
        ],
        hints: [
          "Если k > n, ответ 0.",
          "В остальных случаях число начал — n - k + 1.",
          "Не создавай саму строку и не запускай миллиард повторений.",
        ],
        solution:
          "n = int(input())\nk = int(input())\nif k > n:\n    print(0)\nelse:\n    print(n - k + 1)",
        explanation:
          "Количество получено за несколько действий даже для большой длины. Отдельное условие защищает от отрицательного ответа.",
      },
      {
        id: "windows-3",
        title: "Вхождения с перекрытием",
        prompt:
          "Дан text из 1–100 строчных латинских букв и pattern из 1–20 таких букв на следующей строке. Выведи число вхождений pattern в text, включая перекрывающиеся.",
        starter: "text = input()\npattern = input()\n",
        inputHelp: "Текст, затем образец.",
        sample: {
          input: "aaaa\naa",
          expected: "3",
        },
        tests: [
          {
            input: "aaaa\naa",
            expected: "3",
          },
          {
            input: "ababa\naba",
            expected: "2",
          },
          {
            input: "abc\nd",
            expected: "0",
          },
          {
            input: "a\na",
            expected: "1",
          },
          {
            input: "ab\nabc",
            expected: "0",
          },
          {
            input: "abcabc\nabc",
            expected: "2",
          },
          {
            input:
              "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\nxxxxxxxxxxxxxxxxxxxx",
            expected: "81",
          },
        ],
        hints: [
          "Размер окна равен len(pattern).",
          "Сравнивай каждое окно с pattern; при совпадении прибавляй 1.",
          "Начала сдвигаются на один символ, даже если предыдущее окно совпало.",
        ],
        solution:
          "text = input()\npattern = input()\nk = len(pattern)\ncount = 0\nfor start in range(len(text) - k + 1):\n    if text[start:start + k] == pattern:\n        count = count + 1\nprint(count)",
        explanation:
          "Для ababa образец aba начинается в 0 и 2, поэтому ответ 2. Оба перекрывающихся вхождения важны.",
      },
    ],
  },
  {
    id: "unique",
    week: 5,
    number: "23",
    title: "Считаем без повторений",
    subtitle: "Одинаковый результат учитываем один раз.",
    duration: 45,
    goals: [
      "Различать путь получения и итоговое значение",
      "Хранить уже встреченные значения",
      "Проверять пересечение групп",
    ],
    sections: [
      {
        title: "Что именно считаем",
        body: "Три окна aa в строке aaaa — три позиции, но одно различное слово. Если задача просит разные слова, каждый текст учитываем один раз. Аналогично один ученик может попасть в два списка, но от этого не станет двумя учениками. Сначала сформулируй, что считается одним вариантом.",
      },
      {
        title: "Список уже встреченных",
        body: "Создай seen = []. Для каждого кандидата value проверь value not in seen. Если его ещё не было, добавь через seen.append(value). В конце len(seen) покажет число различных значений. in у списка проверяет наличие значения, а у словаря из прошлого урока — наличие ключа.",
        code: 'seen = []\nfor letter in "abaca":\n    if letter not in seen:\n        seen.append(letter)\nprint(len(seen))',
        caption: "Ответ 3: a, b, c. Повторные a не добавляются.",
      },
      {
        title: "Когда можно просто сложить",
        body: "Количество в двух группах можно сложить, если один вариант не встречается в обеих. Например, двузначное число не может одновременно начинаться с 1 и с 2. Но слово a может быть фрагментом нескольких разных линий. Если группы пересекаются, простая сумма завысит результат.",
      },
      {
        title: "Проверяем маленький пример",
        body: "У линий abc и ad окна длины 1 дают a, b, c и a, d. Всего пять появлений, но четыре различные буквы. Окна длины 2 дают ab, bc, ad — уже три разных слова без повторений. Особые короткие случаи часто ломают общую формулу.",
      },
      {
        title: "Для небольших данных",
        body: "Поиск в списке просматривает значения по очереди. В упражнениях вариантов мало, поэтому этого достаточно. В дальнейшем изучим множества для более удобной работы с уникальными элементами. Сейчас важнее понять, почему один результат нельзя считать несколько раз.",
      },
    ],
    takeaway:
      "Считай разные значения, а не способы их получить. Список seen и проверка not in помогают убрать повторы; складывать группы можно только без пересечений.",
    quiz: {
      question: "В линиях abc и ad сколько различных букв?",
      options: ["5", "4", "3"],
      answer: 1,
      explanation:
        "Буква a встречается в обеих линиях. Различные буквы: a, b, c, d.",
    },
    exercises: [
      {
        id: "unique-1",
        title: "Разные буквы",
        prompt:
          "Дана непустая строка из 1–100 строчных латинских букв. Выведи количество различных букв.",
        starter: "text = input()\nseen = []\n",
        inputHelp: "Одна строка.",
        sample: {
          input: "abaca",
          expected: "3",
        },
        tests: [
          {
            input: "abaca",
            expected: "3",
          },
          {
            input: "a",
            expected: "1",
          },
          {
            input: "aaaa",
            expected: "1",
          },
          {
            input: "abc",
            expected: "3",
          },
          {
            input: "abcdefghijklmnopqrstuvwxyz",
            expected: "26",
          },
          {
            input:
              "abcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabc",
            expected: "3",
          },
        ],
        hints: [
          "Перебери символы через for letter in text.",
          "Добавляй letter в seen только если letter not in seen.",
          "В конце выведи len(seen).",
        ],
        solution:
          "text = input()\nseen = []\nfor letter in text:\n    if letter not in seen:\n        seen.append(letter)\nprint(len(seen))",
        explanation:
          "Сколько бы раз ни встретилась буква, в seen она появится один раз.",
      },
      {
        id: "unique-2",
        title: "Список без дублей",
        prompt:
          "Дано n от 0 до 20, затем n непустых слов из строчных латинских букв, каждое до 20 символов, на отдельных строках. Выведи число различных слов.",
        starter: "n = int(input())\nseen = []\n",
        inputHelp: "Количество, затем слова.",
        sample: {
          input: "3\ncat\ndog\ncat",
          expected: "2",
        },
        tests: [
          {
            input: "3\ncat\ndog\ncat",
            expected: "2",
          },
          {
            input: "0",
            expected: "0",
          },
          {
            input: "1\na",
            expected: "1",
          },
          {
            input: "3\na\na\na",
            expected: "1",
          },
          {
            input: "2\nab\nba",
            expected: "2",
          },
          {
            input:
              "20\nx\nxa\nxaa\nxaaa\nxaaaa\nxaaaaa\nxaaaaaa\nxaaaaaaa\nxaaaaaaaa\nxaaaaaaaaa\nxaaaaaaaaaa\nxaaaaaaaaaaa\nxaaaaaaaaaaaa\nxaaaaaaaaaaaaa\nxaaaaaaaaaaaaaa\nxaaaaaaaaaaaaaaa\nxaaaaaaaaaaaaaaaa\nxaaaaaaaaaaaaaaaaa\nxaaaaaaaaaaaaaaaaaa\nxaaaaaaaaaaaaaaaaaaa",
            expected: "20",
          },
        ],
        hints: [
          "Читай очередное слово внутри цикла n раз.",
          "Сравнивай целое слово со значениями списка.",
          "if word not in seen: затем seen.append(word); итог — len(seen).",
        ],
        solution:
          "n = int(input())\nseen = []\nfor i in range(n):\n    word = input()\n    if word not in seen:\n        seen.append(word)\nprint(len(seen))",
        explanation:
          "При n = 0 список остаётся пустым, ответ 0. Слова ab и ba различаются порядком букв.",
      },
      {
        id: "unique-3",
        title: "Различные окна",
        prompt:
          "Дана строка text из 1–30 строчных латинских букв и k от 1 до 35. Сколько различных текстов встречается среди её полных окон длины k? Если окон нет, ответ 0.",
        starter: "text = input()\nk = int(input())\nseen = []\n",
        inputHelp: "Строка, затем k.",
        sample: {
          input: "aaaa\n2",
          expected: "1",
        },
        tests: [
          {
            input: "aaaa\n2",
            expected: "1",
          },
          {
            input: "ababa\n2",
            expected: "2",
          },
          {
            input: "abc\n1",
            expected: "3",
          },
          {
            input: "abc\n3",
            expected: "1",
          },
          {
            input: "abc\n4",
            expected: "0",
          },
          {
            input: "a\n1",
            expected: "1",
          },
          {
            input: "ababab\n3",
            expected: "2",
          },
          {
            input: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\n35",
            expected: "0",
          },
        ],
        hints: [
          "Перебери окна точно так же, как в предыдущем уроке.",
          "Сохрани window = text[start:start + k].",
          "Добавляй window только при window not in seen, затем выведи len(seen).",
        ],
        solution:
          "text = input()\nk = int(input())\nseen = []\nfor start in range(len(text) - k + 1):\n    window = text[start:start + k]\n    if window not in seen:\n        seen.append(window)\nprint(len(seen))",
        explanation:
          "В ababa четыре окна длины 2, но только два разных текста: ab и ba.",
      },
    ],
  },
  {
    id: "keyboard",
    week: 5,
    number: "24",
    title: "Маршруты на клавиатуре",
    subtitle: "Превращаем рисунок из условия в строки.",
    duration: 50,
    goals: [
      "Различать разрешённые направления",
      "Представлять прямую линию строкой",
      "Считать фрагменты клавиатурных линий",
    ],
    sections: [
      {
        title: "Правила задачи A",
        body: "В PDF разрешены строчные латинские буквы клавиатуры QWERTY. Пароль набирается подряд по одной прямой: горизонтально слева направо или по диагонали сверху вниз. Направление внутри пароля не меняется. Нельзя идти вверх, справа налево, поворачивать, пропускать клавиши или использовать знаки препинания. Схема выше показывает примеры.",
      },
      {
        title: "Три горизонтальные линии",
        body: "Ряды букв: qwertyuiop (10), asdfghjkl (9), zxcvbnm (7). Пароль qwe — окно первого ряда, dfgh — второго. Слово ytrewq запрещено: оно идёт в обратном направлении. Для k = 7 ряд длины 10 даёт 4 варианта, длины 9 — 3, длины 7 — 1; всего 8.",
        code: 'lines = ["qwertyuiop", "asdfghjkl", "zxcvbnm"]',
        caption:
          "В этих строках нет повторяющихся букв, поэтому разные начала дают разные слова.",
      },
      {
        title: "Два наклона диагоналей",
        body: "Ряды клавиатуры сдвинуты. Например, q → a → z и t → g → b идут вниз вправо, а r → d → x и i → j → n — вниз влево. Все длинные диагонали состоят максимум из трёх букв: рядов всего три. Ниже выписаны все диагонали, содержащие хотя бы две буквы.",
        code: 'lines = [\n    "qaz", "wsx", "edc", "rfv", "tgb", "yhn", "ujm", "ik", "ol",\n    "wa", "esz", "rdx", "tfc", "ygv", "uhb", "ijn", "okm", "pl"\n]',
        caption:
          "14 линий длины 3 и четыре длины 2: ik, ol, wa, pl. Клавиши со знаками останавливают буквенную линию.",
      },
      {
        title: "Короткие фрагменты тоже подходят",
        body: "Из tgb получаются tg, gb и tgb. Начинать можно не только в верхнем ряду. Поэтому для k = 2 каждая диагональ длины 3 даёт два пароля. Всего 14 × 2 + 4 = 32 диагональных пары. Для k = 3 есть 14 диагональных троек. Более длинных диагональных паролей нет.",
      },
      {
        title: "Проверяем слово по линиям",
        body: 'Выражение word in line для строк означает: word является непрерывным фрагментом line. В отличие от списка это проверка подстроки. Например, "gb" in "tgb" верно, а "tg" in "tgb" тоже верно. Но "tb" in "tgb" неверно: пропуск буквы запрещён. Чтобы проверить пароль, достаточно проверить его во всех 21 линиях.',
      },
      {
        title: "Сверяем с исходным рисунком",
        body: "В условии разрешены qwerty, tgb, ok, az, rdx, dfgh. Запрещены wasd, ytrewq, bgt, jmk, rtx, edfv. У edfv направление меняется, поэтому даже соседства отдельных клавиш недостаточно. В наших проверках эти примеры сохранены. Один символ разрешён: это одна из 26 букв.",
      },
    ],
    takeaway:
      "Разрешённый пароль — непрерывный фрагмент одной из трёх строк или одной диагонали. Для длины 2 диагонали дают 32 варианта, для длины 3 — 14.",
    quiz: {
      question: "Почему edfv не подходит?",
      options: [
        "В нём четыре символа, а любые пароли короче четырёх",
        "Он меняет направление и не лежит на одной прямой",
        "Буква v запрещена",
      ],
      answer: 1,
      explanation:
        "Горизонтальные пароли могут быть длиннее трёх, и v разрешена. Но edfv поворачивает между направлениями.",
    },
    exercises: [
      {
        id: "keyboard-1",
        title: "Только горизонталь",
        prompt:
          "Дано k от 1 до 10. Посчитай слова длины k, получаемые только движением слева направо по одному из трёх буквенных рядов QWERTY. Диагонали пока не учитывай.",
        starter:
          'k = int(input())\nlines = ["qwertyuiop", "asdfghjkl", "zxcvbnm"]\n',
        inputHelp: "Одна длина от 1 до 10.",
        sample: {
          input: "7",
          expected: "8",
        },
        tests: [
          {
            input: "7",
            expected: "8",
          },
          {
            input: "1",
            expected: "26",
          },
          {
            input: "2",
            expected: "23",
          },
          {
            input: "3",
            expected: "20",
          },
          {
            input: "4",
            expected: "17",
          },
          {
            input: "5",
            expected: "14",
          },
          {
            input: "6",
            expected: "11",
          },
          {
            input: "8",
            expected: "5",
          },
          {
            input: "9",
            expected: "3",
          },
          {
            input: "10",
            expected: "1",
          },
        ],
        hints: [
          "Обойди все три строки циклом.",
          "Если len(line) >= k, строка даёт len(line) - k + 1 вариантов.",
          "Сложи вклады подходящих строк; короткая строка даёт 0.",
        ],
        solution:
          'k = int(input())\nlines = ["qwertyuiop", "asdfghjkl", "zxcvbnm"]\ncount = 0\nfor line in lines:\n    if len(line) >= k:\n        count = count + len(line) - k + 1\nprint(count)',
        explanation:
          "Для k = 7 получается 4 + 3 + 1 = 8. При k = 1 каждый ряд содержит свои буквы, суммарно 26.",
      },
      {
        id: "keyboard-2",
        title: "Только диагонали",
        prompt:
          "Дано k, равное 2 или 3. Посчитай пароли длины k, идущие по прямой диагонали сверху вниз. Список всех диагональных линий дан в шаблоне.",
        starter:
          'k = int(input())\nlines = [\n    "qaz", "wsx", "edc", "rfv", "tgb", "yhn", "ujm", "ik", "ol",\n    "wa", "esz", "rdx", "tfc", "ygv", "uhb", "ijn", "okm", "pl"\n]\n',
        inputHelp: "Число 2 или 3.",
        sample: {
          input: "2",
          expected: "32",
        },
        tests: [
          {
            input: "2",
            expected: "32",
          },
          {
            input: "3",
            expected: "14",
          },
        ],
        hints: [
          "Одна линия длины 3 содержит два окна длины 2.",
          "Применяй формулу к каждой линии, если она не короче k.",
          "Сложи len(line) - k + 1 для подходящих линий.",
        ],
        solution:
          'k = int(input())\nlines = [\n    "qaz", "wsx", "edc", "rfv", "tgb", "yhn", "ujm", "ik", "ol",\n    "wa", "esz", "rdx", "tfc", "ygv", "uhb", "ijn", "okm", "pl"\n]\ncount = 0\nfor line in lines:\n    if len(line) >= k:\n        count = count + len(line) - k + 1\nprint(count)',
        explanation:
          "Для двух букв: 14 × 2 + 4 = 32. Для трёх: 14 × 1 = 14. Слово каждой линии читается только сверху вниз.",
      },
      {
        id: "keyboard-3",
        title: "Разрешён ли маршрут?",
        prompt:
          "Дано слово из 1–10 строчных латинских букв. Выведи YES, если его можно набрать подряд по одной прямой слева направо по ряду или сверху вниз по диагонали QWERTY, иначе NO. Линии даны в шаблоне.",
        starter:
          'word = input()\nlines = [\n    "qwertyuiop", "asdfghjkl", "zxcvbnm",\n    "qaz", "wsx", "edc", "rfv", "tgb", "yhn", "ujm", "ik", "ol",\n    "wa", "esz", "rdx", "tfc", "ygv", "uhb", "ijn", "okm", "pl"\n]\n',
        inputHelp: "Одно слово из строчных латинских букв.",
        sample: {
          input: "qwerty",
          expected: "YES",
        },
        tests: [
          {
            input: "qwerty",
            expected: "YES",
          },
          {
            input: "tgb",
            expected: "YES",
          },
          {
            input: "ok",
            expected: "YES",
          },
          {
            input: "az",
            expected: "YES",
          },
          {
            input: "rdx",
            expected: "YES",
          },
          {
            input: "dfgh",
            expected: "YES",
          },
          {
            input: "wasd",
            expected: "NO",
          },
          {
            input: "ytrewq",
            expected: "NO",
          },
          {
            input: "bgt",
            expected: "NO",
          },
          {
            input: "jmk",
            expected: "NO",
          },
          {
            input: "rtx",
            expected: "NO",
          },
          {
            input: "edfv",
            expected: "NO",
          },
          {
            input: "ijn",
            expected: "YES",
          },
          {
            input: "gb",
            expected: "YES",
          },
          {
            input: "tb",
            expected: "NO",
          },
          {
            input: "a",
            expected: "YES",
          },
          {
            input: "p",
            expected: "YES",
          },
          {
            input: "pl",
            expected: "YES",
          },
          {
            input: "qaz",
            expected: "YES",
          },
          {
            input: "qsz",
            expected: "NO",
          },
          {
            input: "aa",
            expected: "NO",
          },
          {
            input: "zxcvbnm",
            expected: "YES",
          },
          {
            input: "qwertyuiop",
            expected: "YES",
          },
        ],
        hints: [
          "Начни с found = False.",
          "Для каждой line проверь word in line. Если нашёл, установи found = True.",
          "Не возвращай found в False на следующих линиях. В конце выбери YES или NO.",
        ],
        solution:
          'word = input()\nlines = [\n    "qwertyuiop", "asdfghjkl", "zxcvbnm",\n    "qaz", "wsx", "edc", "rfv", "tgb", "yhn", "ujm", "ik", "ol",\n    "wa", "esz", "rdx", "tfc", "ygv", "uhb", "ijn", "okm", "pl"\n]\nfound = False\nfor line in lines:\n    if word in line:\n        found = True\nif found:\n    print("YES")\nelse:\n    print("NO")',
        explanation:
          "Мы проверяем целый непрерывный фрагмент, поэтому повороты, прыжки и обратный ход не принимаются. Для одного символа достаточно найти букву в любом ряду.",
      },
    ],
    showKeyboard: true,
  },
  {
    id: "passwords",
    week: 5,
    number: "25",
    title: "Олимпиадная задача A",
    subtitle: "Считаем все ленивые пароли и не считаем лишние.",
    duration: 60,
    goals: [
      "Обосновать полноту перебора линий",
      "Отдельно обработать один символ",
      "Решить задачу A для всех длин от 1 до 10",
    ],
    sections: [
      {
        title: "Полное условие",
        body: "В задаче A «Ленивые пароли» дано целое k от 1 до 10. Нужно вывести количество различных строк длины k из строчных латинских букв, набираемых подряд по одному горизонтальному ряду слева направо или по одной прямой диагонали сверху вниз на QWERTY. Только буквы, без поворотов и пропусков. В ответе одно целое число, а не список паролей.",
      },
      {
        title: "Почему наши линии покрывают всё",
        body: "Горизонтальный пароль находится в одном из трёх рядов. Диагональный пароль находится в одной из 18 диагоналей из прошлого урока. Мы выписали все диагонали с двумя и более буквами, включая короткие у краёв. Старт в середине линии учитывается как обычное окно. Значит, разрешённый пароль нигде не потеряется.",
      },
      {
        title: "Когда можно сложить вклады",
        body: "Для k ≥ 2 первые две буквы определяют линию и направление. Одна и та же пара букв не лежит одновременно на разных выписанных линиях. Внутри линии все буквы различны, поэтому разные начала тоже не повторяют слово. Следовательно, для k ≥ 2 можно просто сложить количества окон всех линий. Не нужно генерировать все возможные сочетания букв алфавита.",
      },
      {
        title: "Почему k = 1 — исключение",
        body: "Одна буква может находиться и в своём ряду, и в нескольких диагоналях. Если посчитать её в каждой линии, результат завысится. При k = 1 ответ — 26, по числу строчных латинских букв. Этот случай обработай до суммирования. Специальная ветвь здесь заменяет удаление повторов и делает решение проще.",
      },
      {
        title: "От рисунка к короткой программе",
        body: "Шаг 1: прочитай k. Шаг 2: при k = 1 выведи 26. Шаг 3: иначе начни count = 0 и для каждой линии достаточной длины прибавь len(line) - k + 1. Шаг 4: выведи count. Строки линий уже даны в стартовом коде; их полезно сверить со схемой. На каждый вход достаточно пройти 21 линию.",
      },
      {
        title: "Проверки из PDF и края",
        body: "В PDF k = 3 даёт 34: горизонтально 8 + 7 + 5 = 20, диагонально 14. Для k = 7 ответ 8: диагоналей такой длины нет, остаются 4 + 3 + 1 окна рядов. Ещё проверь k = 1, 2 и 10: одну букву, короткие диагонали и самый длинный ряд. Тренажёр проверяет все 10 допустимых длин по условию; это учебные проверки, а не официальная система олимпиады.",
      },
    ],
    takeaway:
      "Для k = 1 ответ 26. Для k ≥ 2 вклады линий не пересекаются: суммируй len(line) − k + 1 там, где окно помещается.",
    quiz: {
      question: "Почему нельзя применить сумму по всем линиям при k = 1?",
      options: [
        "У одиночной буквы нет индекса",
        "Одна буква встречается в нескольких линиях и посчитается несколько раз",
        "На клавиатуре разрешены только пароли из двух букв",
      ],
      answer: 1,
      explanation:
        "Один символ разрешён, но считается один раз, независимо от числа линий, проходящих через его клавишу.",
    },
    exercises: [
      {
        id: "passwords-1",
        title: "Длинный пароль",
        prompt:
          "Дано k от 4 до 10. Выведи количество допустимых ленивых паролей длины k по правилам задачи A. Подумай, почему здесь достаточно трёх горизонтальных рядов.",
        starter:
          'k = int(input())\nlines = ["qwertyuiop", "asdfghjkl", "zxcvbnm"]\n',
        inputHelp: "Одна длина от 4 до 10.",
        sample: {
          input: "7",
          expected: "8",
        },
        tests: [
          {
            input: "7",
            expected: "8",
          },
          {
            input: "4",
            expected: "17",
          },
          {
            input: "5",
            expected: "14",
          },
          {
            input: "6",
            expected: "11",
          },
          {
            input: "8",
            expected: "5",
          },
          {
            input: "9",
            expected: "3",
          },
          {
            input: "10",
            expected: "1",
          },
        ],
        hints: [
          "Диагональ проходит максимум через три буквенных ряда.",
          "Для k >= 4 диагональных паролей нет.",
          "Сложи вклады подходящих горизонтальных строк.",
        ],
        solution:
          'k = int(input())\nlines = ["qwertyuiop", "asdfghjkl", "zxcvbnm"]\ncount = 0\nfor line in lines:\n    if len(line) >= k:\n        count = count + len(line) - k + 1\nprint(count)',
        explanation:
          "При k = 10 подходит только весь верхний ряд qwertyuiop. При k = 7 получаются восемь вариантов, как в PDF.",
      },
      {
        id: "passwords-2",
        title: "Исправь повторный счёт",
        prompt:
          "Шаблон считает все полные окна всех клавиатурных линий. Для k = 1 он повторно учитывает одни и те же буквы. Исправь его, чтобы для любого k от 1 до 10 получалось количество различных паролей по правилам задачи A.",
        starter:
          'k = int(input())\nlines = [\n    "qwertyuiop", "asdfghjkl", "zxcvbnm",\n    "qaz", "wsx", "edc", "rfv", "tgb", "yhn", "ujm", "ik", "ol",\n    "wa", "esz", "rdx", "tfc", "ygv", "uhb", "ijn", "okm", "pl"\n]\ncount = 0\nfor line in lines:\n    if len(line) >= k:\n        count = count + len(line) - k + 1\nprint(count)',
        inputHelp: "Одна длина от 1 до 10.",
        sample: {
          input: "1",
          expected: "26",
        },
        tests: [
          {
            input: "1",
            expected: "26",
          },
          {
            input: "2",
            expected: "55",
          },
          {
            input: "3",
            expected: "34",
          },
          {
            input: "4",
            expected: "17",
          },
          {
            input: "5",
            expected: "14",
          },
          {
            input: "6",
            expected: "11",
          },
          {
            input: "7",
            expected: "8",
          },
          {
            input: "8",
            expected: "5",
          },
          {
            input: "9",
            expected: "3",
          },
          {
            input: "10",
            expected: "1",
          },
        ],
        hints: [
          "При одной букве ответ 26 независимо от количества линий.",
          "Добавь отдельный if k == 1 перед подсчётом.",
          "Существующий подсчёт помести в else, сдвинув его на четыре пробела.",
        ],
        solution:
          'k = int(input())\nlines = [\n    "qwertyuiop", "asdfghjkl", "zxcvbnm",\n    "qaz", "wsx", "edc", "rfv", "tgb", "yhn", "ujm", "ik", "ol",\n    "wa", "esz", "rdx", "tfc", "ygv", "uhb", "ijn", "okm", "pl"\n]\nif k == 1:\n    print(26)\nelse:\n    count = 0\n    for line in lines:\n        if len(line) >= k:\n            count = count + len(line) - k + 1\n    print(count)',
        explanation:
          "Ошибку создавали пересекающиеся группы для длины 1. Для большей длины старый подсчёт верен, поэтому меняем только разбор случаев.",
      },
      {
        id: "passwords-3",
        title: "A. Ленивые пароли",
        prompt:
          "Полная задача A из PDF. Дан k (1 ≤ k ≤ 10). Посчитай различные строки из k строчных латинских букв QWERTY, которые можно набрать подряд по одной прямой: по ряду слева направо или по диагонали сверху вниз. Поворачивать, пропускать клавиши, идти вверх или справа налево нельзя. Используются только буквы. Выведи одно целое число. Все буквенные ряды и диагонали длины хотя бы 2 даны в шаблоне.",
        starter:
          'k = int(input())\nlines = [\n    "qwertyuiop", "asdfghjkl", "zxcvbnm",\n    "qaz", "wsx", "edc", "rfv", "tgb", "yhn", "ujm", "ik", "ol",\n    "wa", "esz", "rdx", "tfc", "ygv", "uhb", "ijn", "okm", "pl"\n]\n# Учти особый случай одной буквы\n# Посчитай окна подходящих линий\n',
        inputHelp: "Одно целое число от 1 до 10.",
        sample: {
          input: "3",
          expected: "34",
        },
        tests: [
          {
            input: "3",
            expected: "34",
          },
          {
            input: "7",
            expected: "8",
          },
          {
            input: "1",
            expected: "26",
          },
          {
            input: "2",
            expected: "55",
          },
          {
            input: "4",
            expected: "17",
          },
          {
            input: "5",
            expected: "14",
          },
          {
            input: "6",
            expected: "11",
          },
          {
            input: "8",
            expected: "5",
          },
          {
            input: "9",
            expected: "3",
          },
          {
            input: "10",
            expected: "1",
          },
        ],
        hints: [
          "Не перебирай 26 ** k строк. Разрешены только фрагменты указанных линий.",
          "При k == 1 ответ 26; иначе начни count = 0.",
          "Каждая линия длины хотя бы k даёт len(line) - k + 1 разных паролей. Сложи их и выведи count.",
        ],
        solution:
          'k = int(input())\nlines = [\n    "qwertyuiop", "asdfghjkl", "zxcvbnm",\n    "qaz", "wsx", "edc", "rfv", "tgb", "yhn", "ujm", "ik", "ol",\n    "wa", "esz", "rdx", "tfc", "ygv", "uhb", "ijn", "okm", "pl"\n]\nif k == 1:\n    print(26)\nelse:\n    count = 0\n    for line in lines:\n        if len(line) >= k:\n            count = count + len(line) - k + 1\n    print(count)',
        explanation:
          "Каждый пароль длины хотя бы 2 принадлежит одной выписанной линии и одному началу. Поэтому простая сумма точна. Отдельная ветвь для k = 1 предотвращает повторный счёт. Примеры PDF: 3 → 34 и 7 → 8.",
      },
    ],
    showKeyboard: true,
  },
];
