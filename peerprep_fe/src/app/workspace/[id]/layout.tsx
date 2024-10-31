import { CallProvider } from "@/contexts/call-context";

export default function WorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <CallProvider>{children}</CallProvider>;
}
