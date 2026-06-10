document.addEventListener('DOMContentLoaded', () => {
  const pinContainer = document.querySelector('.notes-pin-container');
  const notes = document.querySelectorAll('.note');
  
  if (!pinContainer || notes.length === 0) return;

  // Listen for scroll events to trigger notes sequentially
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
    
    // Note 1 appears early
    if (progress > 0.1) {
      notes[0].classList.add('visible');
    } else {
      notes[0].classList.remove('visible');
    }
    
    // Note 2 appears at 40% scroll
    if (progress > 0.4) {
      notes[1].classList.add('visible');
    } else {
      notes[1].classList.remove('visible');
    }
    
    // Note 3 appears at 70% scroll, leaving 70%-100% as a pause
    if (progress > 0.7) {
      notes[2].classList.add('visible');
    } else {
      notes[2].classList.remove('visible');
    }
  });

  // Footer Opacity Scrub Interaction
  const footerCta = document.querySelector('.footer-cta');
  const footerTitle = document.querySelector('.footer-cta .prod-huge-title');
  
  if (footerCta && footerTitle) {
    window.addEventListener('scroll', () => {
      const fRect = footerCta.getBoundingClientRect();
      
      // Calculate progress from 0 (just entering) to 1 (fully covering screen)
      let fProgress = (window.innerHeight - fRect.top) / window.innerHeight;
      fProgress = Math.max(0, Math.min(1, fProgress));
      
      // Map progress 0-1 to opacity 0.5-1.0
      const newOpacity = 0.5 + (0.5 * fProgress);
      footerTitle.style.opacity = newOpacity.toString();
    });
  }
});
