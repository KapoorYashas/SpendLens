export function LogoIcon() {
  return (
    <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]" aria-hidden="true">
      <div className="absolute inset-[1px] bg-[#0a0a0f] rounded-[11px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-pink-500/20" />
      </div>
      <svg className="relative w-5 h-5 drop-shadow-[0_0_8px_rgba(236,72,153,0.6)]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="50%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#f472b6" />
          </linearGradient>
        </defs>
        <path d="M15 8.5C15 6.567 13.433 5 11.5 5C9.567 5 8 6.567 8 8.5C8 10.433 9.567 12 11.5 12C13.433 12 15 13.567 15 15.5C15 17.433 13.433 19 11.5 19C9.567 19 8 17.433 8 15.5" stroke="url(#logo-gradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="16" cy="6" r="1.5" fill="#60a5fa" />
        <circle cx="7" cy="18" r="1" fill="#f472b6" />
      </svg>
    </div>
  )
}
