/** METEO's mark: a sun rising behind a cloud, drawn in one colour. */
export default function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      aria-hidden
      fill="currentColor"
    >
      <path d="M13 6.5a1.25 1.25 0 0 1 1.25 1.25v1.5a1.25 1.25 0 1 1-2.5 0v-1.5A1.25 1.25 0 0 1 13 6.5Zm-7.07 2.93a1.25 1.25 0 0 1 1.77 0l1.06 1.06a1.25 1.25 0 1 1-1.77 1.77l-1.06-1.06a1.25 1.25 0 0 1 0-1.77Zm14.14 0a1.25 1.25 0 0 1 0 1.77l-1.06 1.06a1.25 1.25 0 1 1-1.77-1.77l1.06-1.06a1.25 1.25 0 0 1 1.77 0ZM3 16.5a1.25 1.25 0 0 1 1.25-1.25h1.5a1.25 1.25 0 1 1 0 2.5h-1.5A1.25 1.25 0 0 1 3 16.5Z" />
      <path
        d="M13 11.5a5 5 0 0 1 4.6 3.03A6.5 6.5 0 0 0 9.4 19.6 5 5 0 0 1 13 11.5Z"
        opacity="0.55"
      />
      <path d="M17.5 14a6 6 0 0 1 5.85 4.67A4.5 4.5 0 0 1 22.5 27.5h-11a4.5 4.5 0 0 1-.4-8.98A6 6 0 0 1 17.5 14Z" />
    </svg>
  );
}
