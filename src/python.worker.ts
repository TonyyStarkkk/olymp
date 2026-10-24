import type { PyodideInterface } from "pyodide";

type Job = { code: string; inputs: string[] };
let python: PyodideInterface;

async function run(job: Job) {
  const results: { output: string; error: string | null }[] = [];
  for (let index = 0; index < job.inputs.length; index++) {
    self.postMessage({ type: "started", index });
    let output = "";
    let errors = "";
    let exceeded = false;
    let bytes = 0;
    const decoder = new TextDecoder();
    const input = job.inputs[index].replace(/\r\n/g, "\n");
    const lines = input === "" ? [] : input.replace(/\n$/, "").split("\n");
    python.setStdin({ stdin: () => lines.shift() ?? null, isatty: false });
    const capture = (buffer: Uint8Array, stderr = false) => {
      bytes += buffer.length;
      if (bytes > 24000) {
        exceeded = true;
        throw new Error("Output limit");
      }
      const text = decoder.decode(buffer, { stream: true });
      if (stderr) errors += text;
      else output += text;
      return buffer.length;
    };
    python.setStdout({ write: (buffer) => capture(buffer) });
    python.setStderr({ write: (buffer) => capture(buffer, true) });
    const globals = python.toPy({ __name__: "__main__" });
    try {
      const value = await python.runPythonAsync(job.code, {
        globals,
        filename: "solution.py",
      });
      if (value && typeof value.destroy === "function") value.destroy();
      python.runPython("import sys; sys.stdout.flush(); sys.stderr.flush()");
      results.push({
        output,
        error: exceeded
          ? "OutputLimit: программа вывела слишком много текста."
          : errors || null,
      });
    } catch (error) {
      results.push({
        output,
        error: exceeded
          ? "OutputLimit: программа вывела слишком много текста."
          : String(error),
      });
    } finally {
      globals.destroy();
    }
    if (results.at(-1)?.error) break;
  }
  self.postMessage({ type: "result", results });
}

self.onmessage = async (event: MessageEvent) => {
  try {
    if (event.data.type === "init") {
      const { loadPyodide } = await import(
        /* @vite-ignore */ `${event.data.baseUrl}pyodide.mjs`
      );
      python = await loadPyodide({ indexURL: event.data.baseUrl });
      self.postMessage({
        type: "ready",
        version: python.runPython("import sys; sys.version.split()[0]"),
      });
    } else if (event.data.type === "run") {
      await run(event.data.job);
    }
  } catch (error) {
    self.postMessage({ type: "fatal", error: String(error) });
  }
};
