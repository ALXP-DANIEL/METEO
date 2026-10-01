import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PanelProps = {
  title?: string;
  id?: string;
  className?: string;
  children: ReactNode;
};

/** The card every widget sits in. */
export default function Panel({ title, id, className, children }: PanelProps) {
  return (
    <section
      id={id}
      className={cn(
        "surface flex flex-col gap-3 rounded-2xl p-4 sm:p-5",
        className,
      )}
    >
      {title ? <h2 className="eyebrow">{title}</h2> : null}
      {children}
    </section>
  );
}
