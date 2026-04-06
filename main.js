const emojis = ['🍎', '🍎', '🍇', '🍇', '🍊', '🍊', '🍓', '🍓', '🥕', '🥕', '🥦', '🥦', '🌽', '🌽', '🍄', '🍄'];
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let isBusy = false;

const cardGrid = document.getElementById('card-grid');
const movesDisplay = document.getElementById('moves');
const pairsDisplay = document.getElementById('pairs');

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
  card.addEventListener('click', () => flipCard(card));
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
    card1.classList.add('matched');
    card2.classList.add('matched');
    matchedPairs++;
    pairsDisplay.innerText = 8 - matchedPairs;
    flippedCards = [];
    isBusy = false;

    if (matchedPairs === 8) {
      setTimeout(() => {
        alert('🎉 대단하십니다! 모든 카드를 맞추셨습니다.\n오늘의 두뇌 훈련이 성공적으로 완료되었습니다.');
      }, 500);
    }
  } else {
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
  
  console.log("Game Reset Complete");
}

// Initialize on Load
document.addEventListener('DOMContentLoaded', resetGame);
