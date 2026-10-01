export default function Loading() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-7xl flex-col gap-6 bg-[linear-gradient(180deg,#0f1b33,#1e2f4f)] px-4 pt-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <div className="size-9 animate-pulse rounded-full bg-white/10" />
        <div className="h-10 flex-1 animate-pulse rounded-full bg-white/10 sm:max-w-80" />
      </div>
      <div className="grid gap-4 lg:grid-cols-[22rem_1fr]">
        <div className="flex flex-col gap-4">
          <div className="h-72 animate-pulse rounded-3xl bg-white/5" />
          <div className="h-96 animate-pulse rounded-3xl bg-white/5" />
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="col-span-full h-56 animate-pulse rounded-3xl bg-white/5" />
          {["a", "b", "c", "d", "e", "f"].map((key) => (
            <div
              key={key}
              className="h-40 animate-pulse rounded-3xl bg-white/5"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
