import Link from "next/link";

export default function Logo() {
  return (
    <Link
      href="/"
      aria-label="METEO home"
      className="flex shrink-0 items-center gap-2"
    >
      <img
        src="/icons/wx/partly-cloudy-day.svg"
        alt=""
        width={36}
        height={36}
        className="size-9"
      />
      <span className="hidden font-mono text-sm font-semibold tracking-[0.3em] sm:inline">
        METEO
      </span>
    </Link>
  );
}
