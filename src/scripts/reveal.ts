// Scroll reveal (spec §5.6) and the nav hairline that appears after 8px of scroll.
const nav = document.querySelector<HTMLElement>('[data-nav]');
const onScroll = () => nav?.toggleAttribute('data-scrolled', window.scrollY > 8);
onScroll();
addEventListener('scroll', onScroll, { passive: true });

const items = document.querySelectorAll<HTMLElement>('[data-reveal]');
if (items.length && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        // Tall elements can never be 15% visible, so also accept 15% of the viewport.
        const seen = e.intersectionRatio >= 0.15 || e.intersectionRect.height >= innerHeight * 0.15;
        if (!e.isIntersecting || !seen) continue;
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    },
    { threshold: [0, 0.15] },
  );
  items.forEach((el) => io.observe(el));
} else {
  items.forEach((el) => el.classList.add('is-visible'));
}
export {};
