document.addEventListener("DOMContentLoaded", () => {
  const target = document.querySelector('.cta-text');
  if (!target) return;

  const htmlContent = target.innerHTML;
  const lines = htmlContent.split(/<br\s*\/?>/i);
  
  // Initial state: hide text but keep the container height so layout doesn't jump
  target.innerHTML = '&nbsp;'; 
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        observer.unobserve(target); // Only type once
        typeText(target, lines);
      }
    });
  }, { threshold: 0.3 });
  
  observer.observe(target);
  
  async function typeText(element, linesArray) {
    element.innerHTML = ''; // Clear initial spacer
    
    for (let i = 0; i < linesArray.length; i++) {
      let lineText = linesArray[i].trim();
      if (!lineText) continue; // Skip empty lines if any
      
      let lineSpan = document.createElement('span');
      element.appendChild(lineSpan);
      
      for (let j = 0; j < lineText.length; j++) {
        lineSpan.textContent += lineText[j];
        await new Promise(r => setTimeout(r, 40)); // Typing speed
      }
      
      // Add <br> after each line except the last if we aren't at the end
      if (i < linesArray.length - 1) {
        element.appendChild(document.createElement('br'));
      }
    }
    
    // Optional: add a blinking cursor effect
    const cursor = document.createElement('span');
    cursor.textContent = '_';
    cursor.style.animation = 'blink 1s step-end infinite';
    element.appendChild(cursor);
  }
});
