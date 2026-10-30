// Home section index: highlights the canvas section being read.
// "Current" is the last section whose top has passed a reading line. The line starts at 30% of the
// viewport height and slides down towards the bottom edge as the page is scrolled (30% + 40% of
// the scroll progress), so a section near the end still gets a turn on tall viewports where the
// page barely scrolls. At the very bottom the last section is current. A clicked item stays
// current until the user scrolls (wheel, touch or keys), because short pages cannot scroll the
// target up to the reading line.
const links = [...document.querySelectorAll<HTMLAnchorElement>('[data-section-index] a')];
const sections = links
  .map((a) => document.getElementById(a.hash.slice(1)))
  .filter((el): el is HTMLElement => !!el);

if (sections.length) {
  let locked: string | undefined;
  const mark = (id: string) =>
    links.forEach((a) =>
      a.hash === `#${id}`
        ? a.setAttribute('aria-current', 'location')
        : a.removeAttribute('aria-current'),
    );
  const update = () => {
    if (locked) return mark(locked);
    const max = document.documentElement.scrollHeight - innerHeight;
    const progress = max > 0 ? Math.min(Math.max(scrollY / max, 0), 1) : 0;
    const line = innerHeight * (0.3 + 0.4 * progress);
    const atBottom = scrollY > 0 && progress >= 1 - 2 / max;
    const past = sections.filter((s) => s.getBoundingClientRect().top <= line);
    const current = atBottom ? sections[sections.length - 1] : (past.pop() ?? sections[0]);
    mark(current.id);
  };
  const unlock = () => {
    locked = undefined;
    update();
  };
  links.forEach((a) =>
    a.addEventListener('click', () => {
      locked = a.hash.slice(1);
      mark(locked);
    }),
  );
  for (const type of ['wheel', 'touchmove'] as const)
    addEventListener(type, unlock, { passive: true });
  addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(e.key))
      unlock();
  });
  addEventListener('scroll', update, { passive: true });
  update();
}
export {};
