const emojis = ['🍎', '🍎', '🍇', '🍇', '🍊', '🍊', '🍓', '🍓', '🥕', '🥕', '🥦', '🥦', '🌽', '🌽', '🍄', '🍄'];
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let isBusy = false;

const cardGrid = document.getElementById('card-grid');
const movesDisplay = document.getElementById('moves');
const pairsDisplay = document.getElementById('pairs');

// Web Audio API를 이용한 효과음 생성기
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  const now = audioCtx.currentTime;

  if (type === 'match') {
    // 맞았을 때: 밝은 딩동댕 소리
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(523.25, now); // C5
    oscillator.frequency.exponentialRampToValueAtTime(880, now + 0.1); // A5
    gainNode.gain.setValueAtTime(0.1, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    oscillator.start(now);
    oscillator.stop(now + 0.3);
  } else if (type === 'error') {
    // 틀렸을 때: 짧은 저음 삑
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(220, now); // A3
    oscillator.frequency.linearRampToValueAtTime(110, now + 0.1);
    gainNode.gain.setValueAtTime(0.1, now);
    gainNode.gain.linearRampToValueAtTime(0.01, now + 0.2);
    oscillator.start(now);
    oscillator.stop(now + 0.2);
  } else if (type === 'success') {
    // 성공했을 때: 화려한 팡파르
    const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    frequencies.forEach((f, i) => {
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.connect(g);
      g.connect(audioCtx.destination);
      osc.type = 'square';
      osc.frequency.setValueAtTime(f, now + i * 0.1);
      g.gain.setValueAtTime(0.05, now + i * 0.1);
      g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.5);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.5);
    });
  }
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function createCard(emoji) {
  const card = document.createElement('div');
  card.classList.add('card');
  card.dataset.emoji = emoji;
  card.innerText = '?';
  card.addEventListener('click', () => {
    // 사운드 컨텍스트 재개 (브라우저 정책 대응)
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    flipCard(card);
  });
  return card;
}

function flipCard(card) {
  if (isBusy || card.classList.contains('flipped') || card.classList.contains('matched')) return;

  card.innerText = card.dataset.emoji;
  card.classList.add('flipped');
  flippedCards.push(card);

  if (flippedCards.length === 2) {
    checkMatch();
  }
}

function checkMatch() {
  isBusy = true;
  moves++;
  movesDisplay.innerText = moves;

  const [card1, card2] = flippedCards;
  const isMatch = card1.dataset.emoji === card2.dataset.emoji;

  if (isMatch) {
    playSound('match');
    card1.classList.add('matched');
    card2.classList.add('matched');
    matchedPairs++;
    pairsDisplay.innerText = 8 - matchedPairs;
    flippedCards = [];
    isBusy = false;

    if (matchedPairs === 8) {
      setTimeout(celebrate, 500);
    }
  } else {
    playSound('error');
    setTimeout(() => {
      card1.innerText = '?';
      card2.innerText = '?';
      card1.classList.remove('flipped');
      card2.classList.remove('flipped');
      flippedCards = [];
      isBusy = false;
    }, 1000);
  }
}

function celebrate() {
  playSound('success');
  const overlay = document.getElementById('celebration-overlay');
  overlay.classList.add('active');
  
  // 꽃가루 효과 대신 간단한 애니메이션 효과 등 추가 가능
  console.log("Celebration Event Triggered");
}

function closeCelebration() {
  document.getElementById('celebration-overlay').classList.remove('active');
  resetGame();
}

function resetGame() {
  cardGrid.innerHTML = '';
  cards = shuffle([...emojis]);
  matchedPairs = 0;
  moves = 0;
  movesDisplay.innerText = 0;
  pairsDisplay.innerText = 8;
  flippedCards = [];
  isBusy = false;

  cards.forEach(emoji => {
    cardGrid.appendChild(createCard(emoji));
  });
  
  const overlay = document.getElementById('celebration-overlay');
  if (overlay) overlay.classList.remove('active');
}

// Initialize on Load
document.addEventListener('DOMContentLoaded', resetGame);
