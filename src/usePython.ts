import { useCallback, useEffect, useRef, useState } from "react";

export type RunResult = { output: string; error: string | null };
export type Job = { code: string; inputs: string[] };
export function usePython() {
  const [status, setStatus] = useState<"idle" | "loading" | "running">("idle");
  const [version, setVersion] = useState("");
  const worker = useRef<Worker | null>(null);
  const ready = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<{
    job: Job;
    resolve: (results: RunResult[]) => void;
  } | null>(null);

  const clearTimer = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
  const finish = useCallback(
    (results: RunResult[]) => {
      clearTimer();
      pending.current?.resolve(results);
      pending.current = null;
      setStatus("idle");
    },
    [clearTimer],
  );
  const stop = useCallback(
    (
      error = "Stopped: выполнение остановлено. Код сохранён, можно попробовать снова.",
    ) => {
      worker.current?.terminate();
      worker.current = null;
      ready.current = false;
      finish([{ output: "", error }]);
    },
    [finish],
  );
  const armTimer = useCallback(
    (loading = false) => {
      clearTimer();
      timer.current = setTimeout(
        () =>
          stop(
            loading
              ? "LoadError: Python не успел загрузиться. Проверь соединение с приложением и повтори запуск."
              : "Timeout: программа работает дольше 5 секунд. Проверь, завершается ли цикл, и попробуй снова.",
          ),
        loading ? 90000 : 5000,
      );
    },
    [clearTimer, stop],
  );

  const execute = useCallback(
    (job: Job): Promise<RunResult[]> => {
      if (pending.current)
        return Promise.resolve([
          { output: "", error: "Сначала дождись текущего запуска." },
        ]);
      return new Promise((resolve) => {
        pending.current = { job, resolve };
        if (worker.current && ready.current) {
          setStatus("running");
          armTimer();
          worker.current.postMessage({ type: "run", job });
          return;
        }
        setStatus("loading");
        armTimer(true);
        try {
          const instance = new Worker(
            new URL("./python.worker.ts", import.meta.url),
            { type: "module" },
          );
          worker.current = instance;
          instance.onmessage = (event) => {
            if (event.data.type === "ready") {
              ready.current = true;
              setVersion(event.data.version);
              setStatus("running");
              armTimer();
              instance.postMessage({ type: "run", job: pending.current?.job });
            } else if (event.data.type === "started") {
              armTimer();
            } else if (event.data.type === "result") {
              // An interrupted write can leave Python's stream buffer in an error
              // state. Recreate the worker after failures instead of reusing it.
              if (
                event.data.results.some((result: RunResult) => result.error)
              ) {
                instance.terminate();
                worker.current = null;
                ready.current = false;
              }
              finish(event.data.results);
            } else if (event.data.type === "fatal") {
              stop(
                `LoadError: не удалось подготовить Python. Попробуй запустить ещё раз. ${event.data.error}`,
              );
            }
          };
          instance.onerror = () =>
            stop(
              "LoadError: не удалось запустить Python. Обнови страницу и попробуй снова.",
            );
          instance.postMessage({
            type: "init",
            baseUrl: new URL(
              `${import.meta.env.BASE_URL}python/`,
              window.location.href,
            ).href,
          });
        } catch {
          stop(
            "LoadError: этот браузер не смог запустить Python. Попробуй актуальную версию Chrome, Firefox или Edge.",
          );
        }
      });
    },
    [armTimer, finish, stop],
  );

  useEffect(
    () => () => {
      clearTimer();
      worker.current?.terminate();
      worker.current = null;
      ready.current = false;
      pending.current?.resolve([
        { output: "", error: "Stopped: урок закрыт." },
      ]);
      pending.current = null;
    },
    [clearTimer],
  );
  return { execute, stop, status, version };
}

export function normalizeOutput(value: string) {
  // Ignore only final line endings, not spaces or missing blank lines inside the answer.
  return value.replace(/\r\n/g, "\n").replace(/\n+$/, "");
}

export function explainError(error: string) {
  if (error.startsWith("LoadError:"))
    return "Не удалось загрузить Python. Проверь соединение с приложением и повтори запуск. Код остаётся в редакторе.";
  if (error.startsWith("OutputLimit:"))
    return "Слишком много вывода. Проверь повторяющиеся print. Лимит тренажёра — 24 КБ на запуск.";
  if (error.startsWith("Timeout:"))
    return "Программа не завершилась за 5 секунд. Проверь, не повторяется ли действие бесконечно. Можно исправить код и запустить снова.";
  if (error.startsWith("Stopped:"))
    return "Выполнение остановлено. Твой код сохранён в редакторе.";
  // The final traceback exception is authoritative. Exception names inside a
  // student's string literal or an earlier chained exception are not the cause.
  const kind = [...error.matchAll(/^(\w+Error):/gm)].at(-1)?.[1];
  if (kind === "IndentationError" || kind === "TabError")
    return "Проверь отступы в начале строк. Внутри if, elif, else, for и while нужен отступ на четыре пробела относительно начала блока. Вложенный блок добавляет ещё четыре. Сами if, elif и else одной цепочки стоят на одном уровне. Не смешивай пробелы и табуляцию.";
  if (kind === "SyntaxError")
    return "Python не смог прочитать команду. Проверь парные скобки, кавычки и написание команды в указанной строке.";
  if (kind === "NameError")
    return "Использовано неизвестное имя. Проверь название переменной: она должна получить значение до использования.";
  if (
    kind === "ValueError" &&
    /ValueError: range\(\) arg 3 must not be zero/.test(error)
  )
    return "Шаг range не может быть нулём. Для движения вперёд используй положительный шаг, для обратного отсчёта — отрицательный.";
  if (kind === "ValueError")
    return "Не удалось превратить текст в число. В поле ввода нужны цифры, например 15, без кавычек и пояснений.";
  if (kind === "EOFError")
    return "Не хватает входных данных. Каждый input() читает одну строку. Добавь нужные строки в поле ввода.";
  if (kind === "IndexError")
    return "Такой позиции нет в строке или списке. Индексы начинаются с 0; последний неотрицательный индекс равен длине минус 1. У пустой строки или списка нет элементов.";
  if (kind === "KeyError")
    return 'Такого ключа нет в словаре. Проверь написание и тип ключа: число 20 и строка "20" различаются. Если неизвестный ключ допустим, сначала проверь key in table.';
  if (kind === "TypeError")
    return "В одном действии встретились несовместимые типы данных. Для вычислений преобразуй ввод через int(), для соединения числа с текстом — через str().";
  if (kind === "ZeroDivisionError")
    return "Произошло деление на ноль. Проверь число справа от /, // или %.";
  return "Во время выполнения возникла ошибка. Посмотри сообщение Python ниже и проверь соответствующую строку.";
}
