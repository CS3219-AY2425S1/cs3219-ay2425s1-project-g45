import { CallProvider } from "@/contexts/call-context";
import { ChatProvider } from "@/contexts/chat-context";
import { EditorProvider } from "@/contexts/editor-context";
import { WorkspaceRoomProvider } from "@/contexts/workspaceroom-context";

export default function WorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <WorkspaceRoomProvider>
      <EditorProvider>
        <ChatProvider>
          <CallProvider>{children}</CallProvider>
        </ChatProvider>
      </EditorProvider>
    </WorkspaceRoomProvider>
  );
}
