export type IconName = "home" | "receipt" | "basket" | "leaf" | "flag" | "tag" | "settings" | "plus";

export function Icon({ name }: { name: IconName }) {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
      {name === "home" && (
        <>
          <path d="M4 10.5 12 4l8 6.5" />
          <path d="M7 10.5V20h10v-9.5" />
        </>
      )}
      {name === "receipt" && (
        <>
          <path d="M7 3.5h10v17l-2-1.2-3 1.2-3-1.2-2 1.2v-17z" />
          <path d="M9.5 8h5M9.5 12h5M9.5 16h3" />
        </>
      )}
      {name === "basket" && (
        <>
          <path d="M6.5 9h11l-1 10.2a2 2 0 0 1-2 1.8H9.5a2 2 0 0 1-2-1.8L6.5 9z" />
          <path d="M9 9c.2-2.4 1.5-4 3-4s2.8 1.6 3 4" />
        </>
      )}
      {name === "leaf" && <path d="M5 19s1-8 7.5-11.5S20 4 20 4s-.5 6-4 10.5S5 19 5 19z" />}
      {name === "flag" && (
        <>
          <path d="M6 21V4" />
          <path d="M6 5h11l-1.8 3.2L17 11.5H6" />
        </>
      )}
      {name === "tag" && (
        <>
          <path d="M12 4h7v7l-8.5 8.5L3.5 12.5 12 4z" />
          <path d="M16.2 7.8h.1" />
        </>
      )}
      {name === "settings" && (
        <>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 3.5v2.2M12 18.3v2.2M4.8 6.3l1.6 1.6M17.6 16.1l1.6 1.6M3.5 12h2.2M18.3 12h2.2M4.8 17.7l1.6-1.6M17.6 7.9l1.6-1.6" />
        </>
      )}
      {name === "plus" && <path d="M12 6v12M6 12h12" />}
    </svg>
  );
}

export function Logo() {
  return (
    <span className="logo">
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="10" fill="currentColor" />
        <path d="M8 13.2h16l-1.35 8.6a3 3 0 0 1-3 2.5H12.3a3 3 0 0 1-3-2.5L8 13.2z" fill="#f6f1e7" />
        <path d="M12.2 13.2c.2-2.8 1.8-4.7 3.8-4.7s3.6 1.9 3.8 4.7" fill="none" stroke="#f0c56a" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      <span>Canasta</span>
    </span>
  );
}
