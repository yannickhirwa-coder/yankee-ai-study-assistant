
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/theme-toggle";

const navigationLinks = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Study Planner", href: "/study-planner" },
  { name: "Materials", href: "/materials" },
  { name: "Flashcards", href: "/flashcards" },
  { name: "Progress", href: "/progress" },
  { name: "Certifications", href: "/certifications" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-5 py-4">
        <Link
          href="/dashboard"
          className="shrink-0 text-xl font-bold text-slate-900 dark:text-white"
        >
          Yankee<span className="text-blue-600 dark:text-blue-400">AI</span>
        </Link>

        <div className="flex flex-1 items-center gap-5 overflow-x-auto whitespace-nowrap">
          {navigationLinks.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`shrink-0 text-sm font-medium transition ${
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        <div className="shrink-0">
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
