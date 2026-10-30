import type { ShikiConfig } from 'astro';
import type { Element } from 'hast';

type ShikiTransformer = NonNullable<ShikiConfig['transformers']>[number];

const SHELL = new Set(['sh', 'shell', 'bash', 'zsh', 'console']);

/** Parses a meta string such as `title="lua/lazy.lua" {3-5,8}`. */
export function parseCodeMeta(meta = ''): { title?: string; highlight: Set<number> } {
  const title = /title="([^"]*)"/.exec(meta)?.[1];
  const highlight = new Set<number>();
  for (const part of /\{([\d,\s-]+)\}/.exec(meta)?.[1].split(',') ?? []) {
    const [from, to = from] = part.split('-').map((n) => parseInt(n, 10));
    for (let i = from; i <= to; i++) if (Number.isFinite(i)) highlight.add(i);
  }
  return { title, highlight };
}

const el = (
  tagName: string,
  properties: Element['properties'],
  children: Element['children'],
): Element => ({
  type: 'element',
  tagName,
  properties,
  children,
});
const text = (value: string) => ({ type: 'text' as const, value });

/**
 * Adds a header bar (filename title, language label, Copy button), `{3-5}` line highlights and a
 * non-copyable `$` prompt for shell blocks. The Copy button script ignores `.prompt` elements.
 */
export function codeBlockTransformer(): ShikiTransformer {
  return {
    name: 'code-block',
    preprocess(code, options) {
      const { title, highlight } = parseCodeMeta(options.meta?.__raw);
      const prompts = new Set<number>();
      let out = code;
      if (SHELL.has(options.lang)) {
        out = code
          .split('\n')
          .map((l, i) => {
            if (!l.startsWith('$ ')) return l;
            prompts.add(i + 1);
            return l.slice(2);
          })
          .join('\n');
      }
      Object.assign(this.meta, { title, highlight, prompts });
      return out;
    },
    line(node, line) {
      const { highlight, prompts } = this.meta as unknown as {
        highlight: Set<number>;
        prompts: Set<number>;
      };
      if (highlight.has(line)) this.addClassToHast(node, 'highlighted');
      if (prompts.has(line)) {
        node.children.unshift(el('span', { class: 'prompt', 'aria-hidden': 'true' }, [text('$ ')]));
      }
    },
    root(root) {
      const { title } = this.meta as unknown as { title?: string };
      const lang = this.options.lang;
      const header = el('div', { class: 'code-header' }, [
        el('span', { class: 'code-title' }, title ? [text(title)] : []),
        el('span', { class: 'code-lang' }, [text(lang)]),
        el('button', { type: 'button', class: 'copy-btn', 'data-copy': '' }, [text('Copy')]),
      ]);
      root.children = [
        el('div', { class: 'code-block' }, [header, ...(root.children as Element[])]),
      ];
    },
  };
}
