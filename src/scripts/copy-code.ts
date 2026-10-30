// Copy button for Shiki code blocks. `$` shell prompts live in `.prompt` spans and are skipped.
document.addEventListener('click', async (e) => {
  const btn = (e.target as Element).closest<HTMLButtonElement>('[data-copy]');
  if (!btn) return;
  const code = btn.closest('.code-block')?.querySelector('code')?.cloneNode(true) as HTMLElement;
  code?.querySelectorAll('.prompt').forEach((p) => p.remove());
  try {
    await navigator.clipboard.writeText(code?.textContent ?? '');
    btn.textContent = 'Copied';
    setTimeout(() => (btn.textContent = 'Copy'), 1500);
  } catch {
    btn.textContent = 'Press Ctrl+C';
  }
});
export {};
