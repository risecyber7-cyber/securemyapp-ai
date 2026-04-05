import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata = {
  title: "SecureMyApp AI Web",
  description: "Frontend workspace scaffold under apps/web",
};

export default function WebRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
