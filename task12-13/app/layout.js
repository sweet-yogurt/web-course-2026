import Link from "next/link";
import "./globals.css";
import ThemeToggle from "@/components/ThemeToggle";
import { LogoIcon } from "@/components/Icons";

export const metadata = {
  title: "Zen-Money — учёт финансов",
  description: "Учёт доходов и расходов на Next.js со своим API",
};

const themeScript = `
  try {
    var saved = JSON.parse(localStorage.getItem("zen-money-settings") || "{}");
    if (saved && saved.theme === "dark") {
      document.body.classList.add("dark");
    }
  } catch (error) {}
`;

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <header className="app-header">
          <Link href="/" className="brand">
            <LogoIcon />
            Zen-Money
          </Link>
          <nav className="main-nav" aria-label="Основная навигация">
            <Link href="/">Операции</Link>
            <Link href="/add">Добавить</Link>
          </nav>
          <ThemeToggle />
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
