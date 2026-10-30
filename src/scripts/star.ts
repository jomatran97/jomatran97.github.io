// STAR page: competency filter (?c=), Expand/Collapse all.
const stories = [...document.querySelectorAll<HTMLElement>('[data-story]')];
const buttons = [
  ...document.querySelectorAll<HTMLButtonElement>('[data-competency-filter] [data-c]'),
];
const empty = document.getElementById('star-empty');

const current = () => new URLSearchParams(location.search).get('c') ?? 'all';

function apply(c: string) {
  let shown = 0;
  for (const s of stories) {
    const match = c === 'all' || (s.dataset.competencies ?? '').split(' ').includes(c);
    s.hidden = !match;
    if (match) shown++;
  }
  buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.c === c)));
  if (empty) empty.hidden = shown > 0;
}

buttons.forEach((b) =>
  b.addEventListener('click', () => {
    const c = b.dataset.c ?? 'all';
    const url = new URL(location.href);
    if (c === 'all') url.searchParams.delete('c');
    else url.searchParams.set('c', c);
    history.pushState(null, '', url);
    apply(c);
  }),
);
addEventListener('popstate', () => apply(current()));
document
  .querySelectorAll<HTMLElement>('[data-expand]')
  .forEach((b) =>
    b.addEventListener('click', () =>
      stories
        .filter((s) => !s.hidden)
        .forEach((s) =>
          s.querySelector(':scope > details')?.toggleAttribute('open', b.dataset.expand === 'all'),
        ),
    ),
  );
apply(current());
export {};
