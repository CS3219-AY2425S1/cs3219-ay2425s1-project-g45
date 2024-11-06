"use client";
import { handleRunCode } from "../../app/actions/editor";
import { getQuestion } from "../../app/actions/questions";
import { handleSaveAttempt } from "../../app/actions/editor";
import { useAuth } from "../../contexts/auth-context";
import { Language, useEditor } from "../../contexts/editor-context";
import { Editor } from "@monaco-editor/react";
import React, { useEffect,useRef, useState } from "react";
import { QuestionDto } from "peerprep-shared-types";

const CODE_SNIPPETS = {
  javascript: `\nfunction greet(name) {\n\tconsole.log("Hello, " + name + "!");\n}\n\ngreet("Alex");\n`,
  typescript: `\ntype Params = {\n\tname: string;\n}\n\nfunction greet(data: Params) {\n\tconsole.log("Hello, " + data.name + "!");\n}\n\ngreet({ name: "Alex" });\n`,
  python: `\ndef greet(name):\n\tprint("Hello, " + name + "!")\n\ngreet("Alex")\n`,
  java: `\npublic class HelloWorld {\n\tpublic static void main(String[] args) {\n\t\tSystem.out.println("Hello World");\n\t}\n}\n`,
};

type CodeEditorProps = {questionId: string;};

const CodeEditor: React.FC<CodeEditorProps> = ({questionId}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorRef = useRef<any>();
  const [output, setOutput] = useState<string>("");
  const { token, username } = useAuth();
  const { code, setCode, language, setLanguage } = useEditor();
  const [question, setQuestion] = useState<QuestionDto>();

  useEffect(() => {
    if (token) {
      getQuestion(questionId, token).then((data) => {
        setQuestion(data?.message);
      });
    }
  }, [token, questionId]);

  const onMount = (editor: any) => {
    editorRef.current = editor;
    editor.focus();
  };

  const onSelect = (language: Language) => {
    setLanguage(language);
    setCode(CODE_SNIPPETS[language]);
  };

  const runCode = async () => {
    const code = editorRef.current.getValue();
    try {
      const result = await handleRunCode(code, language, token);
      if (!result.error) {
        setOutput(result.output);
      } else {
        setOutput(`Error: ${result.error}`);
      }
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    }
  };

  const saveAttempt = async () => {
    const code = editorRef.current.getValue();
    const title = question?.title;
    const datetime = new Date().toISOString();
    try {
      const result = await handleSaveAttempt(username, title, datetime, code, token);
      
      // Ensure the result is a plain object
      const plainResult = {
        output: result.output || '',
        error: result.error || null
      };
  
      if (!plainResult.error) {
        setOutput(plainResult.output);
      } else {
        setOutput(`Error: ${plainResult.error}`);
      }
    } catch (error) {
      setOutput(`Error: ${error.message}`);
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
        value={code}
        onMount={onMount}
        onChange={(value) => {
          if (value !== undefined) {
            setCode(value);
          }
        }}
      />

      <button
        onClick={runCode}
        className="mt-2 bg-blue-500 text-white py-2 px-4 rounded"
      >
        Run Code
      </button>
      
      <button
        onClick={saveAttempt}
        className="mt-2 bg-blue-500 text-white py-2 px-4 rounded"
      >
        Save Code
      </button>

      {output && (
        <div className="mt-2 bg-gray-900 text-white p-2 rounded">
          <pre>{output}</pre>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;
