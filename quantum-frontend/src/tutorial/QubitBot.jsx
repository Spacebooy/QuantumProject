export default function QubitBot({mood='neutral',message}) {
  return <div className={`qubit-bot bot-${mood}`}>
    <svg viewBox="0 0 100 100" role="img" aria-label={`Qubit Bot, ${mood}`}>
      <ellipse cx="50" cy="91" rx="24" ry="4" fill="currentColor" opacity=".12" />
      <path d="M50 22V12" stroke="currentColor" strokeWidth="3" />
      <circle cx="50" cy="10" r="5" fill="var(--accent-blue)" />
      <rect x="20" y="24" width="60" height="53" rx="20" fill="var(--card-bg)" stroke="currentColor" strokeWidth="3" />
      <rect x="29" y="35" width="42" height="22" rx="10" fill="var(--accent-blue)" opacity=".16" />
      <path d={['happy','success'].includes(mood)?'M34 47q5-9 10 0 M56 47q5-9 10 0':'M39 42v7 M61 42v7'} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <circle cx="50" cy="67" r="8" fill="none" stroke="var(--accent-blue)" />
      <ellipse cx="50" cy="67" rx="8" ry="3" fill="none" stroke="var(--accent-blue)" />
      <path d="M50 67l4-6M20 53l-8 7M80 53l8-7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
    {message && <p>{message}</p>}
  </div>;
}
