document.addEventListener("DOMContentLoaded", () => {
  const targets = document.querySelectorAll('.cta-text, .typewriter');
  if (targets.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        observer.unobserve(entry.target); // Only type once
        typeText(entry.target, entry.target._lines);
      }
    });
  }, { threshold: 0.3 });

  targets.forEach(target => {
    const htmlContent = target.innerHTML;
    const lines = htmlContent.split(/<br\s*\/?>/i);
    target._lines = lines;
    
    // Initial state: hide text but keep the container height so layout doesn't jump
    target.innerHTML = '&nbsp;'; 
    observer.observe(target);
  });
  
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
