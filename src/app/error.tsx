"use client";

import Link from "next/link";

export default function ErrorPage({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="grid min-h-dvh place-items-center bg-[linear-gradient(180deg,#0b1220,#1e2f4f)] px-6 text-center">
      <div className="flex flex-col items-center gap-4">
        <img
          src="/icons/wx/not-available.svg"
          alt=""
          width={120}
          height={120}
          className="size-28"
        />
        <h1 className="text-2xl font-semibold">
          The forecast didn’t come through.
        </h1>
        <p className="max-w-sm text-sm text-ink-soft">
          The weather service didn’t answer in time. It’s usually back within a
          minute.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900"
          >
            Try again
          </button>
          <Link href="/" className="glass rounded-full px-5 py-2 text-sm">
            Kuala Lumpur
          </Link>
        </div>
      </div>
    </div>
  );
}
