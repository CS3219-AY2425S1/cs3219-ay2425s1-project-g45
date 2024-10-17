import React from 'react';

type CodeEditorProps = {};

const CodeEditor: React.FC<CodeEditorProps> = () => {
    return (
        <div>
        {/* Title bar for the problem */}
        <div className="workspacecomponent">
            <h2 className="text-xl font-semibold text-gray-800">Code Editor</h2>
        </div>
        {/* Problem content */}
        <div className="flex-grow p-6 bg-white rounded-b-lg shadow-sm">
            <p className="text-gray-700">Editor will go here...</p>
        </div>
    </div>
    );
};

export default CodeEditor;
