import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PanelProps = {
  title?: string;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
};

/** The frosted-glass card every widget sits in. */
export default function Panel({
  title,
  icon,
  className,
  children,
}: PanelProps) {
  return (
    <section
      className={cn(
        "glass flex flex-col gap-3 rounded-3xl p-4 sm:p-5",
        className,
      )}
    >
      {title ? (
        <h2 className="eyebrow flex items-center gap-1.5">
          {icon}
          {title}
        </h2>
      ) : null}
      {children}
    </section>
  );
}
