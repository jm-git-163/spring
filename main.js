document.addEventListener('DOMContentLoaded', () => {
  const generateBtn = document.getElementById('generate-btn');
  const lottoDisplay = document.getElementById('lotto-display');
  const historyList = document.getElementById('history-list');
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;

  // 로또 번호 생성 함수
  function generateLottoNumbers() {
    const numbers = [];
    while (numbers.length < 6) {
      const num = Math.floor(Math.random() * 45) + 1;
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    }
    return numbers.sort((a, b) => a - b);
  }

  // 공 색상 클래스 결정
  function getColorClass(num) {
    if (num <= 10) return 'color-1';
    if (num <= 20) return 'color-2';
    if (num <= 30) return 'color-3';
    if (num <= 40) return 'color-4';
    return 'color-5';
  }

  // UI 업데이트
  function updateUI(numbers) {
    lottoDisplay.innerHTML = '';
    numbers.forEach((num, index) => {
      setTimeout(() => {
        const ball = document.createElement('span');
        ball.classList.add('ball', getColorClass(num));
        ball.textContent = num;
        lottoDisplay.appendChild(ball);
      }, index * 100);
    });

    // 히스토리 추가
    const historyItem = document.createElement('li');
    historyItem.classList.add('history-item');
    historyItem.textContent = `[${new Date().toLocaleTimeString()}] ${numbers.join(', ')}`;
    historyList.prepend(historyItem);
    
    if (historyList.children.length > 5) {
      historyList.removeChild(historyList.lastChild);
    }
  }

  // 버튼 클릭 이벤트
  generateBtn.addEventListener('click', () => {
    const numbers = generateLottoNumbers();
    updateUI(numbers);
  });

  // 테마 토글 이벤트
  themeToggle.addEventListener('click', () => {
    if (body.classList.contains('light-mode')) {
      body.classList.replace('light-mode', 'dark-mode');
      localStorage.setItem('theme', 'dark-mode');
    } else {
      body.classList.replace('dark-mode', 'light-mode');
      localStorage.setItem('theme', 'light-mode');
    }
  });

  // 저장된 테마 불러오기
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    body.className = savedTheme;
  }
});
