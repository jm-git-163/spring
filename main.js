// 게임 이모지 풀 (다양한 난이도를 위해 넉넉히 준비)
const emojiPool = ['🍎', '🍇', '🍊', '🍓', '🥕', '🥦', '🌽', '🍄', '🥝', '🫐', '🍍', '🍑', '🍋', '🍉', '🥑', '🍆', '🍔', '🍕', '🎾', '⚽', '🎨', '🎬', '🚗', '🚲'];

let currentLevel = 1;
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let isBusy = false;
let totalPairs = 8; // 레벨 1 기본값

const cardGrid = document.getElementById('card-grid');
const movesDisplay = document.getElementById('moves');
const pairsDisplay = document.getElementById('pairs');
const levelDisplay = document.getElementById('current-level');

// Web Audio API를 이용한 효과음 생성기
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  const now = audioCtx.currentTime;

  if (type === 'match') {
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(523.25, now);
    oscillator.frequency.exponentialRampToValueAtTime(880, now + 0.1);
    gainNode.gain.setValueAtTime(0.1, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    oscillator.start(now);
    oscillator.stop(now + 0.3);
  } else if (type === 'error') {
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(220, now);
    oscillator.frequency.linearRampToValueAtTime(110, now + 0.1);
    gainNode.gain.setValueAtTime(0.1, now);
    gainNode.gain.linearRampToValueAtTime(0.01, now + 0.2);
    oscillator.start(now);
    oscillator.stop(now + 0.2);
  } else if (type === 'success') {
    const frequencies = [523.25, 659.25, 783.99, 1046.50];
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
    if (audioCtx.state === 'suspended') audioCtx.resume();
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
    pairsDisplay.innerText = totalPairs - matchedPairs;
    flippedCards = [];
    isBusy = false;

    if (matchedPairs === totalPairs) {
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
  const levelMsg = document.getElementById('level-complete-msg');
  levelMsg.innerText = `레벨 ${currentLevel}을 완료하셨습니다!`;
  overlay.classList.add('active');
}

function nextLevel() {
  currentLevel++;
  document.getElementById('celebration-overlay').classList.remove('active');
  resetGame();
}

function resetGame(isFullReset = false) {
  if (isFullReset) currentLevel = 1;
  
  cardGrid.innerHTML = '';
  levelDisplay.innerText = currentLevel;
  
  // 레벨에 따른 카드 수 조정
  // Level 1: 4x4 (8 pairs)
  // Level 2: 4x5 (10 pairs)
  // Level 3: 4x6 (12 pairs)
  // Level 4+: 4x8 (16 pairs)
  if (currentLevel === 1) totalPairs = 8;
  else if (currentLevel === 2) totalPairs = 10;
  else if (currentLevel === 3) totalPairs = 12;
  else totalPairs = 16;

  // 카드 그리드 열 수 조정
  if (currentLevel === 2) cardGrid.style.gridTemplateColumns = 'repeat(5, 1fr)';
  else if (currentLevel >= 3) cardGrid.style.gridTemplateColumns = 'repeat(4, 1fr)';
  else cardGrid.style.gridTemplateColumns = 'repeat(4, 1fr)';

  // 랜덤 이모지 선택
  const selectedEmojis = shuffle([...emojiPool]).slice(0, totalPairs);
  const gameEmojis = shuffle([...selectedEmojis, ...selectedEmojis]);

  matchedPairs = 0;
  moves = 0;
  movesDisplay.innerText = 0;
  pairsDisplay.innerText = totalPairs;
  flippedCards = [];
  isBusy = false;

  gameEmojis.forEach(emoji => {
    cardGrid.appendChild(createCard(emoji));
  });
  
  const overlay = document.getElementById('celebration-overlay');
  if (overlay) overlay.classList.remove('active');
}

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => resetGame(true));
