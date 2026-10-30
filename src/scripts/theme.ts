// Theme toggle: System → Light → Dark. The inline <head> script has already applied the saved value.
const ORDER = ['system', 'light', 'dark'] as const;
type Pref = (typeof ORDER)[number];
const root = document.documentElement;

const current = (): Pref => (ORDER.find((p) => p === root.dataset.pref) ?? 'system') as Pref;

function apply(pref: Pref) {
  root.dataset.pref = pref;
  if (pref === 'system') delete root.dataset.theme;
  else root.dataset.theme = pref;
  document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach((btn) => {
    const label = `${btn.dataset.label}: ${btn.dataset[pref]}`;
    btn.setAttribute('aria-label', label);
    btn.title = label;
  });
}

apply(current());
document.querySelectorAll('[data-theme-toggle]').forEach((btn) =>
  btn.addEventListener('click', () => {
    const next = ORDER[(ORDER.indexOf(current()) + 1) % ORDER.length];
    try {
      localStorage.setItem('theme', next);
    } catch {
      /* storage unavailable: the choice still applies for this page view */
    }
    apply(next);
  }),
);
export {};
