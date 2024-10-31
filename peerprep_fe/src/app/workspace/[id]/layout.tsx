import { CallProvider } from "@/contexts/call-context";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <CallProvider>{children}</CallProvider>
      </body>
    </html>
  );
}
