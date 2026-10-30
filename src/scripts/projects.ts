// Projects page: kind filter (?kind=), Expand/Collapse all and #slug deep links.
const cards = [...document.querySelectorAll<HTMLElement>('[data-project]')];
const buttons = [...document.querySelectorAll<HTMLButtonElement>('[data-kind-filter] [data-kind]')];
const empty = document.getElementById('projects-empty');

const kindFromUrl = () => new URLSearchParams(location.search).get('kind') ?? 'all';

function apply(kind: string) {
  let shown = 0;
  for (const card of cards) {
    const visible = kind === 'all' || card.dataset.kind === kind;
    card.hidden = !visible;
    if (visible) shown++;
  }
  buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.kind === kind)));
  if (empty) empty.hidden = shown > 0;
}

function setKind(kind: string, mode: 'push' | 'replace' = 'push') {
  const url = new URL(location.href);
  if (kind === 'all') url.searchParams.delete('kind');
  else url.searchParams.set('kind', kind);
  history[mode === 'push' ? 'pushState' : 'replaceState'](null, '', url);
  apply(kind);
}

function openHash() {
  const card = document
    .getElementById(location.hash.slice(1))
    ?.closest<HTMLElement>('[data-project]');
  if (!card) return;
  if (card.hidden) setKind('all', 'replace');
  card.querySelector('details')?.setAttribute('open', '');
  card.querySelector('h2')?.scrollIntoView();
}

// An unknown ?kind= (hand-edited URL) matches nothing and shows the empty state.
apply(kindFromUrl());
buttons.forEach((b) => b.addEventListener('click', () => setKind(b.dataset.kind ?? 'all')));
addEventListener('popstate', () => apply(kindFromUrl()));
document
  .querySelectorAll<HTMLElement>('[data-expand]')
  .forEach((b) =>
    b.addEventListener('click', () =>
      cards
        .filter((c) => !c.hidden)
        .forEach((c) =>
          c.querySelector('details')?.toggleAttribute('open', b.dataset.expand === 'all'),
        ),
    ),
  );
document.querySelector('[data-reset]')?.addEventListener('click', () => setKind('all'));
addEventListener('hashchange', openHash);
openHash();
export {};
