export default function Loading() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-7xl flex-col gap-6 bg-background px-4 pt-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <div className="size-9 animate-pulse rounded-full bg-muted" />
        <div className="h-10 flex-1 animate-pulse rounded-full bg-muted sm:max-w-80" />
      </div>
      <div className="grid gap-4 lg:grid-cols-[22rem_1fr]">
        <div className="flex flex-col gap-4">
          <div className="h-72 animate-pulse rounded-2xl bg-muted" />
          <div className="h-96 animate-pulse rounded-2xl bg-muted" />
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="col-span-full h-56 animate-pulse rounded-2xl bg-muted" />
          {["a", "b", "c", "d", "e", "f"].map((key) => (
            <div
              key={key}
              className="h-40 animate-pulse rounded-2xl bg-muted"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
