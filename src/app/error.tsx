"use client";

import Link from "next/link";

export default function ErrorPage({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="grid min-h-dvh place-items-center bg-background px-6 text-center">
      <div className="flex flex-col items-center gap-4">
        <img
          src="/icons/wx/not-available.svg"
          alt=""
          width={120}
          height={120}
          className="size-28"
        />
        <h1 className="font-mono text-xl font-semibold">
          The forecast didn’t come through.
        </h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          The weather service didn’t answer in time. It’s usually back within a
          minute.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-foreground px-5 py-2 font-mono text-sm text-background"
          >
            Try again
          </button>
          <Link
            href="/"
            className="surface rounded-full font-mono px-5 py-2 text-sm"
          >
            Kuala Lumpur
          </Link>
        </div>
      </div>
    </div>
  );
}
