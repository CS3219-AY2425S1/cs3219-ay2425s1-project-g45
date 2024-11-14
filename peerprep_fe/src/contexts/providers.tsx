import { ThemeProvider } from "./theme-context";
import { AuthProvider } from "./auth-context";
import { CookiesProvider } from "next-client-cookies/server";
import { SocketProvider } from "./socket-context";

export function Providers({ children }: React.PropsWithChildren) {
  return (
    <CookiesProvider>
      <AuthProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SocketProvider>{children}</SocketProvider>
        </ThemeProvider>
      </AuthProvider>
    </CookiesProvider>
  );
}
