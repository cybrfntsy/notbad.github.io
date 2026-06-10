document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  const checkNavbarInversion = () => {
    const navbarRect = navbar.getBoundingClientRect();
    const navbarCenterY = navbarRect.top + navbarRect.height / 2;
    const navbarCenterX = window.innerWidth / 2;
    
    // Temporarily disable pointer events on navbar to check what's underneath
    const originalPointerEvents = navbar.style.pointerEvents;
    navbar.style.pointerEvents = 'none';
    
    const elementUnderNavbar = document.elementFromPoint(navbarCenterX, navbarCenterY);
    
    // Restore pointer events
    navbar.style.pointerEvents = originalPointerEvents;
    
    if (elementUnderNavbar) {
      if (elementUnderNavbar.closest('.bg-yellow')) {
        navbar.classList.add('inverted');
      } else {
        navbar.classList.remove('inverted');
      }
    }
  };

  window.addEventListener('scroll', checkNavbarInversion, { passive: true });
  window.addEventListener('resize', checkNavbarInversion, { passive: true });
  
  // Initial check
  checkNavbarInversion();
});
