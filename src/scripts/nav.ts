// Mobile menu sheet: toggle, Esc to close, close on link click, lock page scroll while open.
const btn = document.querySelector<HTMLButtonElement>('[data-menu-button]');
const sheet = document.getElementById('mobile-sheet');

function setOpen(open: boolean) {
  if (!btn || !sheet) return;
  sheet.hidden = !open;
  btn.setAttribute('aria-expanded', String(open));
  document.documentElement.style.overflow = open ? 'hidden' : '';
  if (open) sheet.querySelector<HTMLElement>('a')?.focus();
}

btn?.addEventListener('click', () => setOpen(btn.getAttribute('aria-expanded') !== 'true'));
sheet?.addEventListener('click', (e) => {
  if ((e.target as Element).closest('a')) setOpen(false);
});
addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && btn?.getAttribute('aria-expanded') === 'true') {
    setOpen(false);
    btn.focus();
  }
});
matchMedia('(min-width: 768px)').addEventListener('change', (e) => e.matches && setOpen(false));
export {};
