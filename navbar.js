document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  const checkNavbarInversion = () => {
    const navbarRect = navbar.getBoundingClientRect();
    const navbarCenterY = navbarRect.top + navbarRect.height / 2;
    
    const yellowSections = document.querySelectorAll('.bg-yellow');
    let isOverYellow = false;
    
    yellowSections.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (navbarCenterY >= rect.top && navbarCenterY <= rect.bottom) {
        isOverYellow = true;
      }
    });
    
    if (isOverYellow) {
      navbar.classList.add('inverted');
    } else {
      navbar.classList.remove('inverted');
    }
  };

  window.addEventListener('scroll', checkNavbarInversion, { passive: true });
  window.addEventListener('resize', checkNavbarInversion, { passive: true });
  
  // Initial check
  checkNavbarInversion();
});
