import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata = {
  title: "SecureMyApp AI",
  description: "Security detection and remediation cockpit",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
