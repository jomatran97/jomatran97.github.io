// Safety net for the sticky profile rail: if its content is taller than the space it has, hide
// the lowest-priority blocks (data-fit = 1 first) until nothing is clipped. CSS height breakpoints
// cover the usual cases; this handles fonts, zoom and longer translations.
const rail = document.querySelector<HTMLElement>('aside.rail');
const wide = matchMedia('(min-width: 1280px)');
const blocks = rail
  ? [...rail.querySelectorAll<HTMLElement>('[data-fit]')].sort(
      (a, b) => Number(a.dataset.fit) - Number(b.dataset.fit),
    )
  : [];

function fit() {
  if (!rail) return;
  blocks.forEach((b) => (b.hidden = false));
  if (!wide.matches) return;
  for (const block of blocks) {
    if (rail.scrollHeight <= rail.clientHeight) break;
    block.hidden = true;
  }
}

if (rail && blocks.length) {
  fit();
  addEventListener('resize', fit);
  void document.fonts?.ready.then(fit);
}
export {};
