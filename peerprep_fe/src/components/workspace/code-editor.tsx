"use client";
import { handleRunCode } from "../../app/actions/editor";
import { getQuestion } from "../../app/actions/questions";
import { handleSaveAttempt } from "../../app/actions/editor";
import { useAuth } from "../../contexts/auth-context";
import { Language, useEditor } from "../../contexts/editor-context";
import { Editor } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { QuestionDto } from "peerprep-shared-types";
import { useWorkspaceRoom } from "@/contexts/workspaceroom-context";
import { MonacoBinding } from "y-monaco";

type IStandaloneCodeEditor = editor.IStandaloneCodeEditor;

const CODE_SNIPPETS = {
  javascript: `\nfunction greet(name) {\n\tconsole.log("Hello, " + name + "!");\n}\n\ngreet("Alex");\n`,
  typescript: `\ntype Params = {\n\tname: string;\n}\n\nfunction greet(data: Params) {\n\tconsole.log("Hello, " + data.name + "!");\n}\n\ngreet({ name: "Alex" });\n`,
  python: `\ndef greet(name):\n\tprint("Hello, " + name + "!")\n\ngreet("Alex")\n`,
  java: `\npublic class HelloWorld {\n\tpublic static void main(String[] args) {\n\t\tSystem.out.println("Hello World");\n\t}\n}\n`,
};

type CodeEditorProps = {};

const CodeEditor: React.FC<CodeEditorProps> = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorRef = useRef<IStandaloneCodeEditor>();
  const [output, setOutput] = useState<string>("");
  const { token, username } = useAuth();
  const { doc, yProvider, language, setLanguage } = useEditor();
  const [question, setQuestion] = useState<QuestionDto>();
  const { room } = useWorkspaceRoom();

  useEffect(() => {
    if (token) {
      getQuestion(room.question, token).then((data) => {
        setQuestion(data?.message);
      });
    }
  }, [token, room.question]);

  useEffect(() => {
    if (!yProvider || !doc || !editorRef.current) {
      return;
    }
    console.log("Creating MonacoBinding");
    const binding = new MonacoBinding(
      doc.getText(),
      editorRef.current?.getModel(),
      new Set([editorRef.current]),
      yProvider.awareness
    );

    return () => {
      binding.destroy();
    };
  }, [yProvider, doc, editorRef.current]);

  const onMount = useCallback((editor: IStandaloneCodeEditor) => {
    console.log("Editor mounted");
    editorRef.current = editor;
    editor.focus();
    const monacoModel = editor.getModel();
    monacoModel?.setEOL(0);
  }, []);

  const onSelect = (language: Language) => {
    setLanguage(language);
  };

  const runCode = async () => {
    const code = editorRef?.current?.getValue();
    try {
      const result = await handleRunCode(code, language, token);
      if (!result.error) {
        setOutput(result.output);
        const newCode = "Saved Code:" + "\n" + code + "\n" + "Compiler Output:" + "\n" + result.output;
        saveAttempt(newCode);
      } else {
        setOutput(`Error: ${result.error}`);
      }
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    }
  };

  const saveAttempt = async (newCode) => {
    const code = newCode;
    const title = question?.title;
    const datetime = new Date().toISOString(); // Ensure proper string format

    try {
      const result = await handleSaveAttempt(
        username,
        title,
        datetime,
        code,
        token
      );
    } catch (error) {
      console.log(`Error: ${error.message}`);
    }
  };

  return (
    <div className="inline-flex flex-col p-2 bg-slate-800 rounded-lg shadow-sm h-full w-full">
      <select
        name="language"
        className="bg-slate-200 dark:bg-slate-700 rounded-lg w-full py-2 px-4 mb-2 focus:outline-none"
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
        options={{ minimap: { enabled: false } }}
        theme="vs-dark"
        language={language}
        onMount={onMount}
      />

      <button
        onClick={runCode}
        className="mt-2 bg-blue-500 text-white py-2 px-4 rounded"
      >
        Run Code
      </button>

      {/* <button
        onClick={saveAttempt}
        className="mt-2 bg-blue-500 text-white py-2 px-4 rounded"
      >
        Save Code
      </button> */}

      {output && (
        <div className="mt-2 bg-gray-900 text-white p-2 rounded">
          <pre>{output}</pre>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;
