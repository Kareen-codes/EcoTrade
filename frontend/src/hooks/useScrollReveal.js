import { useEffect } from "react";

/**
 * Reveals elements carrying the `.reveal` class as they scroll into view
 * (adds the `.active` class via IntersectionObserver).
 *
 * Ported from EcoMate (Next.js) — identical observer options and behaviour;
 * CSS counterparts live in index.css (.reveal / .reveal.active).
 */
export function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    const elements = document.querySelectorAll(".reveal");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
}

export default useScrollReveal;
