document.addEventListener("DOMContentLoaded", () => {
  // Select all card-like UI elements across the site
  const selectors = [
    ".problem-content",
    ".feature-card",
    ".step-card",
    ".p-problem-card",
    ".p-feature-card",
    ".p-usecase-card",
    ".operator-card",
    ".mission-banner",
    ".privacy-content"
  ];

  const cards = document.querySelectorAll(selectors.join(", "));
  if (cards.length === 0 || typeof gsap === "undefined") return;

  // Group elements by their parent/container to enable staggered reveal transitions
  const groups = new Map();
  cards.forEach(card => {
    const parent = card.parentElement;
    if (!groups.has(parent)) {
      groups.set(parent, []);
    }
    groups.get(parent).push(card);
  });

  // Set initial hidden state (opacity 0, shifted down by 100px, blurred by 10px)
  cards.forEach(card => {
    gsap.set(card, {
      opacity: 0,
      y: 100,
      filter: "blur(10px)",
      willChange: "transform, opacity, filter"
    });
  });

  // IntersectionObserver to trigger entry animations
  const observerOptions = {
    root: null,
    rootMargin: "0px 0px -8% 0px", // Trigger when the element enters 8% from the bottom of the viewport
    threshold: 0.05
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        const parent = target.parentElement;
        const groupCards = groups.get(parent) || [target];
        
        // Filter out cards that are already animated
        const cardsToAnimate = groupCards.filter(c => !c.classList.contains("mb-animated"));
        
        if (cardsToAnimate.length > 0) {
          // Mark as animated to prevent re-triggering
          cardsToAnimate.forEach(c => c.classList.add("mb-animated"));

          // Staggered reveal animation (bottom-to-top rise + blur-to-focus)
          gsap.to(cardsToAnimate, {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.08,
            clearProps: "filter,willChange" // Clear filter and will-change once complete for rendering stability
          });
        }

        observer.unobserve(target);
      }
    });
  }, observerOptions);

  // Observe each card
  cards.forEach(card => {
    observer.observe(card);
  });
});
