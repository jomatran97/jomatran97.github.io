import type { Root, RootContent } from 'mdast';
import type { Lang } from '../i18n';

export const STAR_HEADINGS: Record<Lang, readonly string[]> = {
  en: ['Situation', 'Task', 'Action', 'Result'],
  vi: ['Bối cảnh', 'Nhiệm vụ', 'Hành động', 'Kết quả'],
};

/** Returns an error message, or `null` when the H2 headings are exactly S, T, A, R in order. */
export function checkStarHeadings(headings: string[], lang: Lang): string | null {
  const expected = STAR_HEADINGS[lang];
  if (headings.length === expected.length && headings.every((h, i) => h === expected[i]))
    return null;
  return `must contain exactly four H2 headings (${expected.join(', ')}) in that order, found: ${
    headings.length ? headings.join(', ') : 'none'
  }`;
}

const textOf = (node: RootContent | Root): string =>
  'value' in node
    ? node.value
    : 'children' in node
      ? (node.children as RootContent[]).map(textOf).join('')
      : '';

export const starLang = (path: string): Lang => (/[\\/]star[\\/]vi[\\/]/.test(path) ? 'vi' : 'en');

/** Remark plugin: fails the build, naming the file, when a STAR story lacks the four H2 sections. */
export function remarkStarSections() {
  return (tree: Root, file: { path?: string }) => {
    const path = file.path ?? '';
    if (!/[\\/]content[\\/]star[\\/]/.test(path)) return;
    const headings = tree.children
      .filter((n) => n.type === 'heading' && n.depth === 2)
      .map((n) => textOf(n).trim());
    const error = checkStarHeadings(headings, starLang(path));
    if (error) throw new Error(`STAR story ${path} ${error}.`);
  };
}
