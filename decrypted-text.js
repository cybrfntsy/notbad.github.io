// decrypted-text.js

class DecryptedText {
  constructor(element) {
    this.element = element;
    // data-text 속성에서 원본 텍스트를 가져오거나, 없으면 태그 안의 텍스트를 사용합니다.
    this.originalText = element.getAttribute('data-text') || element.innerText.trim();
    this.element.innerText = this.originalText;
    
    this.speed = 40; // 글자가 변하는 속도 (밀리초)
    this.maxIterations = 15; // 몇 번만에 원래 글자로 다 돌아올지 결정
    this.characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+'; // 외계어 기호들
    this.availableChars = this.characters.split('');
    
    this.isAnimating = false;
    this.intervalId = null;
    this.revealedIndices = new Set();
    
    // CSS 세팅: 글자 크기나 정렬이 깨지지 않게 구조를 잡아줍니다.
    this.element.style.display = 'inline-block';
    this.element.style.whiteSpace = 'pre-wrap';
    
    // 처음에 등장할 때 애니메이션을 한 번만 실행합니다.
    // 레이아웃이 완전히 잡힌 뒤에 크기를 측정하기 위해 약간의 지연을 줍니다.
    setTimeout(() => {
      this.startAnimation();
    }, 100);
  }

  shuffleText(currentRevealed) {
    return this.originalText
      .split('')
      .map((char, i) => {
        if (char === ' ' || char === '\n') return char;
        if (currentRevealed.has(i)) return this.originalText[i];
        return this.availableChars[Math.floor(Math.random() * this.availableChars.length)];
      })
      .join('');
  }

  startAnimation() {
    if (this.isAnimating) return;
    
    // 가로세로 길이를 강제로 고정시켜서, 글자가 바뀔 때 옆으로 밀리는 현상을 완벽히 차단합니다.
    const rect = this.element.getBoundingClientRect();
    this.element.style.width = `${rect.width}px`;
    this.element.style.height = `${rect.height}px`;
    
    this.isAnimating = true;
    this.revealedIndices = new Set();
    
    let currentIteration = 0;
    const textLength = this.originalText.length;
    const charsToRevealPerStep = Math.max(1, Math.ceil(textLength / this.maxIterations));

    this.intervalId = setInterval(() => {
      // 아직 안 바뀐 글자들 찾기
      let unrevealed = [];
      for (let i = 0; i < textLength; i++) {
        if (!this.revealedIndices.has(i) && this.originalText[i] !== ' ' && this.originalText[i] !== '\n') {
          unrevealed.push(i);
        }
      }
      
      // 랜덤으로 섞기
      unrevealed.sort(() => Math.random() - 0.5);
      
      // 조금씩 원래 글자로 복구하기
      for (let i = 0; i < charsToRevealPerStep && i < unrevealed.length; i++) {
        this.revealedIndices.add(unrevealed[i]);
      }
      
      this.element.innerText = this.shuffleText(this.revealedIndices);
      
      currentIteration++;
      if (unrevealed.length <= charsToRevealPerStep || currentIteration >= this.maxIterations * 2) {
        this.resetText();
      }
    }, this.speed);
  }

  resetText() {
    clearInterval(this.intervalId);
    this.isAnimating = false;
    this.revealedIndices = new Set();
    this.element.innerText = this.originalText;
    
    // 고정했던 가로세로 길이 풀기
    this.element.style.width = '';
    this.element.style.height = '';
  }
}

// HTML 로딩이 끝나면 'decrypted-text' 클래스를 가진 모든 요소에 효과를 줍니다.
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.decrypted-text').forEach(el => {
    new DecryptedText(el);
  });
});
