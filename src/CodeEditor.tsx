import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";

const extensions = [python()];
export default function CodeEditor({
  code,
  onChange,
  editable,
}: {
  code: string;
  onChange: (code: string) => void;
  editable: boolean;
}) {
  return (
    <CodeMirror
      value={code}
      height="260px"
      theme={oneDark}
      extensions={extensions}
      onChange={onChange}
      editable={editable}
      aria-label="Код Python"
      basicSetup={{
        foldGutter: false,
        autocompletion: false,
        highlightActiveLine: true,
        lineNumbers: true,
      }}
    />
  );
}
