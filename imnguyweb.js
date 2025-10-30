// ===============================
// imnguyweb.js — Cập nhật 2025-10-30
// ===============================

// ----- Dark mode -----
const darkModeToggle = document.getElementById('dark-mode-toggle');
if (darkModeToggle) {
  darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('dark-mode', isDark ? 'enabled' : 'disabled');
    document.getElementById('dark-icon').className = isDark ? 'fas fa-sun' : 'fas fa-moon';
  });

  if (localStorage.getItem('dark-mode') === 'enabled') {
    document.body.classList.add('dark-mode');
    document.getElementById('dark-icon').className = 'fas fa-sun';
  }
}

// ----- Avatar & Bio -----
const AVATAR_KEY = 'profile.avatar';
const BIO_KEY = 'profile.bio';

// Trang index.html — Hiển thị avatar & bio đã lưu
window.addEventListener('DOMContentLoaded', () => {
  const avatarImg = document.getElementById('avatar-img');
  const bioText = document.getElementById('bio-text');

  const savedAvatar = localStorage.getItem(AVATAR_KEY);
  const savedBio = localStorage.getItem(BIO_KEY);

  if (savedAvatar && avatarImg) avatarImg.src = savedAvatar;
  if (savedBio && bioText) bioText.textContent = savedBio;
});

// Trang config.html — Form lưu avatar & bio
const configForm = document.getElementById('config-form');
if (configForm) {
  const avatarInput = document.getElementById('avatar-input');
  const avatarPreview = document.getElementById('avatar-preview');
  const bioInput = document.getElementById('bio-input');
  const statusEl = document.getElementById('config-status');
  const resetBtn = document.getElementById('reset-config');

  // Hiển thị sẵn dữ liệu đã lưu
  const savedAvatar = localStorage.getItem(AVATAR_KEY);
  const savedBio = localStorage.getItem(BIO_KEY);
  if (savedAvatar) avatarPreview.src = savedAvatar;
  if (savedBio) bioInput.value = savedBio;

  // Khi chọn ảnh mới
  avatarInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => (avatarPreview.src = reader.result);
    reader.readAsDataURL(file);
  });

  // Khi nhấn “Save changes”
  configForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (avatarPreview.src.startsWith('data:image')) {
      localStorage.setItem(AVATAR_KEY, avatarPreview.src);
    }
    localStorage.setItem(BIO_KEY, bioInput.value);
    statusEl.textContent = 'Đã lưu thành công!';
    statusEl.style.color = 'green';
  });

  // Khi nhấn “Reset to defaults”
  resetBtn.addEventListener('click', () => {
    localStorage.removeItem(AVATAR_KEY);
    localStorage.removeItem(BIO_KEY);
    avatarPreview.src = './icon/thumb-344733.png';
    bioInput.value = '';
    statusEl.textContent = 'Đã đặt lại mặc định.';
    statusEl.style.color = 'orange';
  });
}

// ----- Loading animation -----
window.addEventListener('load', () => {
  const loadingPage = document.querySelector('.loading-page');
  const container = document.querySelector('.container');
  if (loadingPage && container) {
    setTimeout(() => {
      loadingPage.classList.add('hidden');
      container.classList.remove('hidden');
    }, 500);
  }
});
