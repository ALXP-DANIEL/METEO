import { GithubLogoIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import Mark from "./mark";
import { ThemeToggle } from "./theme";

const iconButton =
  "grid size-9 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";

/** QR-Pixel-style chrome: a brand chip top-left, a small tool cluster top-right. */
export default function Header() {
  return (
    <header className="flex items-start justify-between gap-3">
      <Link
        href="/"
        className="surface flex items-center gap-3 rounded-2xl py-2.5 pr-4 pl-2.5"
      >
        <span className="grid size-9 place-items-center rounded-xl bg-foreground text-background">
          <Mark className="size-6" />
        </span>
        <span className="flex flex-col">
          <span className="font-mono text-sm leading-tight font-semibold">
            METEO
          </span>
          <span className="font-mono text-[11px] leading-tight text-muted-foreground">
            The sky, decrypted
          </span>
        </span>
      </Link>
      <div className="surface flex items-center gap-0.5 rounded-2xl p-1">
        <a
          href="https://github.com/ALXP-DANIEL/METEO"
          target="_blank"
          rel="noreferrer"
          aria-label="Source on GitHub"
          className={iconButton}
        >
          <GithubLogoIcon weight="bold" className="size-4" />
        </a>
        <ThemeToggle className={iconButton} />
      </div>
    </header>
  );
}
