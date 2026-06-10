document.addEventListener('DOMContentLoaded', () => {
  const pinContainer = document.querySelector('.process-pin-container');
  const cards = document.querySelectorAll('.process-card');
  
  if (!pinContainer || cards.length === 0) return;

  // Listen for scroll events to trigger cards sequentially
  window.addEventListener('scroll', () => {
    const rect = pinContainer.getBoundingClientRect();
    
    // totalScroll is the amount of scrollable space for the pin container
    // It's the total height minus the viewport height
    const totalScroll = rect.height - window.innerHeight;
    
    // Calculate progress from 0 to 1
    // rect.top is 0 when the container hits the top of the viewport
    let progress = -rect.top / totalScroll;
    
    // Clamp progress between 0 and 1
    progress = Math.max(0, Math.min(1, progress));
    
    // Card 1 appears early
    if (progress > 0.1) {
      cards[0].classList.add('visible');
    } else {
      cards[0].classList.remove('visible');
    }
    
    // Card 2 appears at 40% scroll
    if (progress > 0.4) {
      cards[1].classList.add('visible');
    } else {
      cards[1].classList.remove('visible');
    }
    
    // Card 3 appears at 70% scroll, leaving 70%-100% as a pause
    if (progress > 0.7) {
      cards[2].classList.add('visible');
    } else {
      cards[2].classList.remove('visible');
    }
  });
});
