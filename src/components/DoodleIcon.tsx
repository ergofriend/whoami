export type DoodleIconKind = "globe" | "location" | "browser";

export function DoodleIcon({ kind }: { kind: DoodleIconKind }) {
  return (
    <svg
      aria-hidden="true"
      className={`doodle-icon doodle-icon--${kind}`}
      focusable="false"
      viewBox="0 0 24 24"
    >
      {kind === "globe" ? (
        <>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M3.6 12c4 .8 12.8.8 16.8 0M12 3.5c-3 3.5-3 13.5 0 17M12 3.5c3 3.5 3 13.5 0 17" />
          <path className="doodle-icon-echo" d="M4 11.7c4.3.6 12.5.7 16.1-.1" />
        </>
      ) : kind === "location" ? (
        <>
          <path d="M12 21s6-5.7 6-11a6 6 0 0 0-12 0c0 5.3 6 11 6 11Z" />
          <circle cx="12" cy="10" r="2.2" />
          <path className="doodle-icon-echo" d="M11.7 21.2s6.6-5.9 6.3-11.4" />
        </>
      ) : (
        <>
          <path d="M3 5.5c4-.5 13-.4 18 0v13c-5 .4-14 .5-18 0v-13Z" />
          <path d="M3.5 9c5 .3 12.8.2 17 0" />
          <circle cx="6" cy="7.2" r="0.65" />
          <circle cx="8.6" cy="7.2" r="0.65" />
        </>
      )}
    </svg>
  );
}
