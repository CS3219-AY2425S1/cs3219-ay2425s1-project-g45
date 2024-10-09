import { ThemeProvider } from "./theme-context";
import { AuthProvider } from "./auth-context";
import { CookiesProvider } from "next-client-cookies/server";

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
          {children}
        </ThemeProvider>
      </AuthProvider>
    </CookiesProvider>
  );
}
