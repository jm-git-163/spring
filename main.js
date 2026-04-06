// v1.0.1: Updated Teachable Machine Model URL
const MODEL_URL = "https://teachablemachine.withgoogle.com/models/n3n2ylBwS/";
let model, labelContainer, maxPredictions;

// 테마 관리
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

themeToggle.addEventListener('click', () => {
  if (body.classList.contains('light-mode')) {
    body.classList.replace('light-mode', 'dark-mode');
    localStorage.setItem('theme', 'dark-mode');
  } else {
    body.classList.replace('dark-mode', 'light-mode');
    localStorage.setItem('theme', 'light-mode');
  }
});

const savedTheme = localStorage.getItem('theme');
if (savedTheme) body.className = savedTheme;

// 모델 로드
async function init() {
  const modelURL = MODEL_URL + "model.json";
  const metadataURL = MODEL_URL + "metadata.json";
  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();
  console.log("모델 로드 완료");
}

init();

// 이미지 업로드 및 분석
const imageUpload = document.getElementById('image-upload');
const imagePreview = document.getElementById('image-preview');
const uploadContainer = document.getElementById('upload-container');
const uploadPlaceholder = document.getElementById('upload-placeholder');
const loading = document.getElementById('loading');
const resultSection = document.getElementById('result-section');
const resultTitle = document.getElementById('result-title');
const labelContainerUI = document.getElementById('label-container');
const retryBtn = document.getElementById('retry-btn');

uploadContainer.addEventListener('click', () => imageUpload.click());

imageUpload.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (event) => {
    imagePreview.src = event.target.result;
    imagePreview.hidden = false;
    uploadPlaceholder.hidden = true;
    
    // 분석 시작
    loading.hidden = false;
    resultSection.hidden = true;
    
    const image = new Image();
    image.src = event.target.result;
    image.onload = async () => {
      const prediction = await model.predict(image);
      displayResults(prediction);
    };
  };
  reader.readAsDataURL(file);
});

function displayResults(prediction) {
  loading.hidden = true;
  resultSection.hidden = false;
  labelContainerUI.innerHTML = '';
  
  // 정렬: 확률이 높은 순서대로
  prediction.sort((a, b) => b.probability - a.probability);
  
  const topResult = prediction[0];
  resultTitle.innerText = `당신은 '${topResult.className}'상 입니다!`;

  prediction.forEach(p => {
    const probability = (p.probability * 100).toFixed(2);
    const barClass = p.className === '강아지' ? 'dog-bar' : (p.className === '고양이' ? 'cat-bar' : 'others-bar');
    
    const barHTML = `
      <div class="bar-container">
        <div class="bar-label">
          <span>${p.className}</span>
          <span>${probability}%</span>
        </div>
        <div class="bar-outer">
          <div class="bar-inner ${barClass}" style="width: ${probability}%"></div>
        </div>
      </div>
    `;
    labelContainerUI.insertAdjacentHTML('beforeend', barHTML);
  });
}

retryBtn.addEventListener('click', () => {
  imageUpload.value = '';
  imagePreview.src = '';
  imagePreview.hidden = true;
  uploadPlaceholder.hidden = false;
  resultSection.hidden = true;
});
