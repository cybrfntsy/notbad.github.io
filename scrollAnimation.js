document.addEventListener("DOMContentLoaded", () => {
  const isPretendard = (el) => {
    const font = window.getComputedStyle(el).fontFamily;
    return font.toLowerCase().includes("pretendard");
  };

  const elements = document.querySelectorAll("p, span, h1, h2, h3, h4, h5, h6, div, a, li");
  const targetElements = [];
  
  elements.forEach(el => {
    // Ignore script and style tags, and navigation links to avoid breaking the header
    if (el.tagName.toLowerCase() === 'script' || el.tagName.toLowerCase() === 'style' || el.closest('.navbar')) return;
    
    const hasDirectText = Array.from(el.childNodes).some(node => node.nodeType === Node.TEXT_NODE && node.nodeValue.trim() !== "");
    if (hasDirectText && isPretendard(el)) {
      targetElements.push(el);
    }
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      } else {
        entry.target.classList.remove('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  targetElements.forEach(el => {
    el.classList.add('anim-pretendard');
    observer.observe(el);
  });
});
