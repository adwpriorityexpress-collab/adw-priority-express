import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ADW PriorityExpress",
  description: "Verified same-day courier marketplace — instant quotes, trusted drivers, secure payments.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">{children}</div>
      </body>
    </html>
  );
}
