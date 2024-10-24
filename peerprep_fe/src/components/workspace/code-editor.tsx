import { Editor } from "@monaco-editor/react";
import React, { useRef, useState } from "react";

const CODE_SNIPPETS = {
  javascript: `\nfunction greet(name) {\n\tconsole.log("Hello, " + name + "!");\n}\n\ngreet("Alex");\n`,
  typescript: `\ntype Params = {\n\tname: string;\n}\n\nfunction greet(data: Params) {\n\tconsole.log("Hello, " + data.name + "!");\n}\n\ngreet({ name: "Alex" });\n`,
  python: `\ndef greet(name):\n\tprint("Hello, " + name + "!")\n\ngreet("Alex")\n`,
  java: `\npublic class HelloWorld {\n\tpublic static void main(String[] args) {\n\t\tSystem.out.println("Hello World");\n\t}\n}\n`,
};

export enum Language {
  javascript = "javascript",
  python = "python",
  java = "java",
  typescript = "typescript",
}

type CodeEditorProps = {
  sharedCode: string;
  handleCodeChange: (sharedCode: string) => void;
  language: Language;
  setLanguage: (language: Language) => void;
};

const CodeEditor: React.FC<CodeEditorProps> = ({
  sharedCode,
  handleCodeChange,
  language,
  setLanguage,
}) => {
  const editorRef = useRef();

  const onMount = (editor: any) => {
    editorRef.current = editor;
    editor.focus();
  };

  const onSelect = (language: Language) => {
    setLanguage(language);
    handleCodeChange(CODE_SNIPPETS[language]);
  };

  return (
    <div>
      {/* Title bar for the problem */}
      <div className="workspacecomponent">
        <h2 className="text-xl font-semibold text-gray-800">Code Editor</h2>
      </div>
      {/* Problem content */}
      <div className=" p-6 bg-slate-800 rounded-b-lg shadow-sm">
        <select
          name="difficultyLevel"
          className="bg-slate-200 dark:bg-slate-700 rounded-lg w-full h-16 p-4 my-3 focus:outline-none"
          value={language}
          onChange={(e) => onSelect(e.target.value as Language)}
        >
          {Object.values(Language).map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
        <Editor
          options={{
            minimap: {
              enabled: false,
            },
          }}
          height="50vh"
          theme="vs-dark"
          language={language}
          defaultValue={CODE_SNIPPETS[language]}
          onMount={onMount}
          value={sharedCode}
          onChange={(sharedCode) => {
            if (sharedCode) {
              handleCodeChange(sharedCode);
            }
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
