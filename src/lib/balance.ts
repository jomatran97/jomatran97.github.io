/** A skill card as far as layout is concerned. */
export interface SkillLike {
  /** Number of chips (parent and child chips). */
  chips: number;
  /** Description length in characters. */
  descriptionLength: number;
  /** `2x1` / `2x2` cards span two columns on wide screens. */
  wide: boolean;
}

export type Band<T> =
  /** Narrow cards the browser balances into columns (CSS multi-column). */
  | { kind: 'flow'; items: T[] }
  /** A wide card with the narrow cards that follow it stacked beside it. */
  | { kind: 'wide'; wide: T; side: T[]; flip: boolean };

/** Estimated card height in px: `120 + 22 x chip rows + 20 x description lines` (spec §4.1.3). */
export const estimateHeight = (c: SkillLike): number =>
  120 + 22 * Math.ceil(c.chips / 4) + 20 * Math.ceil(c.descriptionLength / 60);

/**
 * Splits skill cards (already in `order`) into layout bands at build time. A wide card starts a
 * band and takes the narrow cards that follow it as a side stack until the stack is about as tall
 * as the wide card (by estimated height); every other run of narrow cards is a flow band. The
 * original order is preserved: concatenating the bands gives the input order, so the DOM order
 * (and keyboard and screen-reader order) matches `order`. Deterministic, no client JavaScript.
 */
export function layoutSkills<T extends SkillLike>(cards: T[]): Band<T>[] {
  const bands: Band<T>[] = [];
  let flow: T[] = [];
  const flush = () => {
    if (flow.length) bands.push({ kind: 'flow', items: flow });
    flow = [];
  };
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    if (!card.wide) {
      flow.push(card);
      continue;
    }
    flush();
    const side: T[] = [];
    let height = 0;
    while (i + 1 < cards.length && !cards[i + 1].wide && height < estimateHeight(card)) {
      side.push(cards[++i]);
      height += estimateHeight(cards[i]);
    }
    // Alternate the side the wide card sits on, so the grid does not look like a list.
    bands.push({
      kind: 'wide',
      wide: card,
      side,
      flip: bands.filter((b) => b.kind === 'wide').length % 2 === 1,
    });
  }
  flush();
  return bands;
}

/** The cards of the bands in DOM order (equals the input order). */
export const flattenBands = <T>(bands: Band<T>[]): T[] =>
  bands.flatMap((b) => (b.kind === 'flow' ? b.items : [b.wide, ...b.side]));
