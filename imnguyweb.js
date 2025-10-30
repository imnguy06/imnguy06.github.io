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

// ----- Hồ sơ cơ bản -----
const AVATAR_KEY = 'profile.avatar';
const BIO_KEY = 'profile.bio';
const LOCATION_KEY = 'profile.location';
const JOB_KEY = 'profile.job';

// ----- Nền tảng danh thiếp -----
const USERS_KEY = 'businessCard.users';
const SESSION_KEY = 'businessCard.session';
const CARDS_KEY_PREFIX = 'businessCard.cards.';

const SOCIAL_OPTIONS = {
  facebook: { label: 'Facebook', icon: 'fab fa-facebook-f' },
  instagram: { label: 'Instagram', icon: 'fab fa-instagram' },
  tiktok: { label: 'TikTok', icon: 'fab fa-tiktok' },
  youtube: { label: 'YouTube', icon: 'fab fa-youtube' },
  twitter: { label: 'X (Twitter)', icon: 'fab fa-twitter' },
  linkedin: { label: 'LinkedIn', icon: 'fab fa-linkedin-in' },
  github: { label: 'GitHub', icon: 'fab fa-github' },
  discord: { label: 'Discord', icon: 'fab fa-discord' },
};

const pageContext = document.body?.dataset?.page || '';
const LOGIN_PAGE_PATH = 'login.html';
const CARD_PAGE_PATH = 'index.html#card-builder';

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

let currentUsername = localStorage.getItem(SESSION_KEY) || null;
const sessionListeners = [];

function onSessionChange(listener) {
  sessionListeners.push(listener);
  listener(currentUsername);
}

function setCurrentUsername(username) {
  currentUsername = username;
  if (username) {
    localStorage.setItem(SESSION_KEY, username);
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
  sessionListeners.forEach((fn) => fn(currentUsername));
}

function getUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Không thể đọc danh sách người dùng', error);
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function findUser(username) {
  const normalized = username.trim().toLowerCase();
  return getUsers().find((user) => user.username.toLowerCase() === normalized) || null;
}

function loadCards(username) {
  try {
    const raw = localStorage.getItem(`${CARDS_KEY_PREFIX}${username}`);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Không thể đọc danh thiếp đã lưu', error);
    return [];
  }
}

function saveCards(username, cards) {
  localStorage.setItem(`${CARDS_KEY_PREFIX}${username}`, JSON.stringify(cards));
}

function encodeCardData(card) {
  const json = JSON.stringify(card);
  const bytes = textEncoder.encode(json);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return encodeURIComponent(btoa(binary));
}

function decodeCardData(encoded) {
  const binary = atob(decodeURIComponent(encoded));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  const json = textDecoder.decode(bytes);
  return JSON.parse(json);
}

function createShareUrl(card) {
  const encoded = encodeCardData(card);
  return `${window.location.origin}${window.location.pathname}?card=${encoded}`;
}

function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }
  return new Promise((resolve, reject) => {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'absolute';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      if (successful) {
        resolve();
      } else {
        reject(new Error('Không thể sao chép vào clipboard'));
      }
    } catch (error) {
      reject(error);
    }
  });
}

function updateProfileFromStorage() {
  const avatarImg = document.getElementById('avatar-img');
  const bioText = document.getElementById('bio-text');
  const locationSpan = document.getElementById('profile-location');
  const jobSpan = document.getElementById('profile-job');
  const jobContainer = document.getElementById('profile-job-container');

  const savedAvatar = localStorage.getItem(AVATAR_KEY);
  if (savedAvatar && avatarImg) {
    avatarImg.src = savedAvatar;
    avatarImg.classList.add('custom-avatar');
  }

  const savedBio = localStorage.getItem(BIO_KEY);
  if (savedBio && bioText) {
    bioText.textContent = savedBio;
  }

  if (jobContainer) {
    const defaultLocation = jobContainer.dataset.defaultLocation || 'VietNam 🇻🇳';
    const defaultJob = jobContainer.dataset.defaultJob || 'Student 👨‍🎓';

    const savedLocation = localStorage.getItem(LOCATION_KEY) || defaultLocation;
    const savedJob = localStorage.getItem(JOB_KEY) || defaultJob;

    if (locationSpan) {
      locationSpan.textContent = `Location: ${savedLocation}`;
    }
    if (jobSpan) {
      jobSpan.textContent = `Job: ${savedJob}`;
    }
  }
}

function initConfigForm() {
  const configForm = document.getElementById('config-form');
  if (!configForm) return;

  const avatarInput = document.getElementById('avatar-input');
  const avatarPreview = document.getElementById('avatar-preview');
  const bioInput = document.getElementById('bio-input');
  const locationInput = document.getElementById('location-input');
  const jobInput = document.getElementById('job-input');
  const statusEl = document.getElementById('config-status');
  const resetBtn = document.getElementById('reset-config');

  const savedAvatar = localStorage.getItem(AVATAR_KEY);
  const savedBio = localStorage.getItem(BIO_KEY);
  const savedLocation = localStorage.getItem(LOCATION_KEY);
  const savedJob = localStorage.getItem(JOB_KEY);

  if (savedAvatar) {
    avatarPreview.src = savedAvatar;
    avatarPreview.classList.add('custom-avatar');
  }
  if (savedBio) bioInput.value = savedBio;
  if (savedLocation) locationInput.value = savedLocation;
  if (savedJob) jobInput.value = savedJob;

  avatarInput.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      avatarPreview.src = reader.result;
      avatarPreview.classList.add('custom-avatar');
    };
    reader.readAsDataURL(file);
  });

  configForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (avatarPreview.src.startsWith('data:image')) {
      localStorage.setItem(AVATAR_KEY, avatarPreview.src);
    }
    localStorage.setItem(BIO_KEY, bioInput.value);
    localStorage.setItem(LOCATION_KEY, locationInput.value);
    localStorage.setItem(JOB_KEY, jobInput.value);
    statusEl.textContent = 'Đã lưu thành công!';
    statusEl.style.color = 'green';
  });

  resetBtn.addEventListener('click', () => {
    localStorage.removeItem(AVATAR_KEY);
    localStorage.removeItem(BIO_KEY);
    localStorage.removeItem(LOCATION_KEY);
    localStorage.removeItem(JOB_KEY);
    avatarPreview.src = './icon/thumb-344733.png';
    avatarPreview.classList.remove('custom-avatar');
    bioInput.value = '';
    locationInput.value = '';
    jobInput.value = '';
    statusEl.textContent = 'Đã đặt lại mặc định.';
    statusEl.style.color = 'orange';
  });
}

function initAuthPlatform() {
  const authCard = document.getElementById('auth-card');
  const logoutBtn = document.getElementById('logout-button');
  const sessionInfo = document.getElementById('session-info');
  const sessionUsername = document.getElementById('session-username');
  const showLoginBtn = document.getElementById('show-login');
  const showRegisterBtn = document.getElementById('show-register');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const authStatus = document.getElementById('auth-status');
  const authMessage = document.getElementById('auth-message');

  if (!authCard && !logoutBtn && !sessionInfo) return;

  function setAuthMessage(message, tone = 'neutral') {
    if (!authMessage) return;
    authMessage.textContent = message;
    authMessage.dataset.tone = tone;
  }

  function toggleForms(mode = 'login') {
    if (!loginForm || !registerForm) return;
    if (mode === 'register') {
      registerForm.classList.remove('hidden');
      loginForm.classList.add('hidden');
      setAuthMessage('Tạo tài khoản mới để bắt đầu tạo danh thiếp.', 'info');
    } else {
      loginForm.classList.remove('hidden');
      registerForm.classList.add('hidden');
      if (authMessage) {
        setAuthMessage('Nhập thông tin để đăng nhập.', 'info');
      }
    }
  }

  showLoginBtn?.addEventListener('click', () => toggleForms('login'));
  showRegisterBtn?.addEventListener('click', () => toggleForms('register'));

  logoutBtn?.addEventListener('click', () => {
    setCurrentUsername(null);
    if (authMessage) {
      setAuthMessage('Bạn đã đăng xuất.', 'info');
    }
    if (pageContext === 'card') {
      window.location.href = LOGIN_PAGE_PATH;
    }
  });

  loginForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    if (!username || !password) {
      setAuthMessage('Vui lòng nhập đầy đủ thông tin.', 'error');
      return;
    }

    const user = findUser(username);
    if (!user || user.password !== password) {
      setAuthMessage('Tên đăng nhập hoặc mật khẩu không chính xác.', 'error');
      return;
    }

    setCurrentUsername(user.username);
    loginForm.reset();
    setAuthMessage(`Chào mừng trở lại, ${user.username}!`, 'success');
  });

  registerForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('register-username').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;

    if (!username || !email || !password || !confirmPassword) {
      setAuthMessage('Hãy điền đầy đủ các trường thông tin.', 'error');
      return;
    }

    if (password !== confirmPassword) {
      setAuthMessage('Mật khẩu xác nhận không khớp.', 'error');
      return;
    }

    if (findUser(username)) {
      setAuthMessage('Tên đăng nhập đã tồn tại, vui lòng chọn tên khác.', 'error');
      return;
    }

    const users = getUsers();
    users.push({ username, email, password, createdAt: new Date().toISOString() });
    saveUsers(users);
    setCurrentUsername(username);
    registerForm.reset();
    setAuthMessage('Đăng ký thành công! Đang chuyển hướng...', 'success');
  });

  onSessionChange((username) => {
    if (sessionInfo) {
      if (username) {
        sessionInfo.classList.remove('hidden');
        if (sessionUsername) {
          sessionUsername.textContent = `Xin chào, ${username}`;
        }
      } else {
        sessionInfo.classList.add('hidden');
        if (sessionUsername) {
          sessionUsername.textContent = '';
        }
      }
    }

    if (authStatus) {
      if (username) {
        authStatus.textContent = `Đang đăng nhập dưới tên: ${username}`;
      } else {
        authStatus.textContent = 'Đăng nhập hoặc đăng ký để tiếp tục.';
        if (loginForm && registerForm) {
          toggleForms('login');
        }
      }
    }

    if (authCard && username) {
      window.location.href = CARD_PAGE_PATH;
    }

    if (!authCard && pageContext === 'card' && !username) {
      window.location.href = LOGIN_PAGE_PATH;
    }
  });
}

function initCardBuilder() {
  const cardBuilder = document.getElementById('card-builder');
  const cardForm = document.getElementById('card-form');
  const feedbackEl = document.getElementById('card-feedback');
  const savedCardsWrapper = document.getElementById('saved-cards');
  const savedCardsList = document.getElementById('saved-cards-list');
  if (!cardForm || !cardBuilder || !savedCardsWrapper || !savedCardsList) return;

  const titleInput = document.getElementById('card-title');
  const roleInput = document.getElementById('card-role');
  const locationInput = document.getElementById('card-location');
  const summaryInput = document.getElementById('card-summary');
  const emailInput = document.getElementById('card-email');
  const phoneInput = document.getElementById('card-phone');
  const websiteInput = document.getElementById('card-website');
  const socialSelect = document.getElementById('social-select');
  const socialLinkInput = document.getElementById('social-link');
  const addSocialBtn = document.getElementById('add-social');
  const socialList = document.getElementById('social-list');

  const previewTitle = document.getElementById('preview-title');
  const previewRole = document.getElementById('preview-role');
  const previewSummary = document.getElementById('preview-summary');
  const previewEmail = document.getElementById('preview-email');
  const previewPhone = document.getElementById('preview-phone');
  const previewWebsite = document.getElementById('preview-website');
  const previewSocials = document.getElementById('preview-socials');

  let socialProfiles = [];

  function renderPreviewSocials() {
    if (!previewSocials) return;
    previewSocials.innerHTML = '';

    socialProfiles.forEach((profile) => {
      const previewItem = document.createElement('li');
      const icon = document.createElement('i');
      icon.className = profile.icon;
      icon.setAttribute('aria-hidden', 'true');

      const link = document.createElement('a');
      link.href = profile.url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = profile.label;

      previewItem.appendChild(icon);
      previewItem.appendChild(link);
      previewSocials.appendChild(previewItem);
    });
  }

  function renderSocialList() {
    if (!socialList) {
      renderPreviewSocials();
      return;
    }

    socialList.innerHTML = '';

    if (!socialProfiles.length) {
      renderPreviewSocials();
      return;
    }

    socialProfiles.forEach((profile) => {
      const item = document.createElement('li');

      const info = document.createElement('div');
      info.className = 'social-item-info';

      const icon = document.createElement('i');
      icon.className = profile.icon;
      icon.setAttribute('aria-hidden', 'true');

      const link = document.createElement('a');
      link.href = profile.url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = profile.label;

      info.appendChild(icon);
      info.appendChild(link);

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'social-remove';
      removeBtn.textContent = 'Xóa';
      removeBtn.addEventListener('click', () => {
        socialProfiles = socialProfiles.filter((itemProfile) => itemProfile.platform !== profile.platform);
        renderSocialList();
      });

      item.appendChild(info);
      item.appendChild(removeBtn);
      socialList.appendChild(item);
    });

    renderPreviewSocials();
  }

  addSocialBtn?.addEventListener('click', () => {
    if (!socialSelect || !socialLinkInput) return;

    const platform = socialSelect.value;
    const linkValue = socialLinkInput.value.trim();

    if (!platform || !linkValue) {
      if (feedbackEl) {
        feedbackEl.textContent = 'Chọn nền tảng và nhập liên kết hợp lệ.';
        feedbackEl.dataset.tone = 'error';
      }
      return;
    }

    const option = SOCIAL_OPTIONS[platform];
    if (!option) return;

    let parsedUrl;
    try {
      parsedUrl = new URL(linkValue);
    } catch (error) {
      if (feedbackEl) {
        feedbackEl.textContent = 'Liên kết không hợp lệ, vui lòng kiểm tra lại.';
        feedbackEl.dataset.tone = 'error';
      }
      return;
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      if (feedbackEl) {
        feedbackEl.textContent = 'Liên kết mạng xã hội cần bắt đầu bằng http hoặc https.';
        feedbackEl.dataset.tone = 'error';
      }
      return;
    }

    const normalizedUrl = parsedUrl.toString();
    const existingIndex = socialProfiles.findIndex((profile) => profile.platform === platform);
    const profileData = {
      platform,
      label: option.label,
      icon: option.icon,
      url: normalizedUrl,
    };

    if (existingIndex >= 0) {
      socialProfiles[existingIndex] = profileData;
    } else {
      socialProfiles.push(profileData);
    }

    socialSelect.value = '';
    socialLinkInput.value = '';
    renderSocialList();

    if (feedbackEl) {
      feedbackEl.textContent = 'Đã cập nhật mạng xã hội.';
      feedbackEl.dataset.tone = 'info';
    }
  });

  function updatePreview() {
    const title = titleInput.value.trim() || 'Tên của bạn';
    const role = roleInput.value.trim() || 'Vị trí công việc';
    const location = locationInput.value.trim() || 'Địa điểm';
    const summary = summaryInput.value.trim() || 'Giới thiệu về bạn sẽ hiển thị tại đây.';
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    const website = websiteInput.value.trim();

    previewTitle.textContent = title;
    previewRole.textContent = `${role} • ${location}`;
    previewSummary.textContent = summary;

    if (email) {
      previewEmail.textContent = `📧 ${email}`;
      previewEmail.classList.remove('hidden');
    } else {
      previewEmail.classList.add('hidden');
    }

    if (phone) {
      previewPhone.textContent = `📞 ${phone}`;
      previewPhone.classList.remove('hidden');
    } else {
      previewPhone.classList.add('hidden');
    }

    if (website) {
      previewWebsite.innerHTML = `🌐 <a href="${website}" target="_blank" rel="noopener">${website}</a>`;
      previewWebsite.classList.remove('hidden');
    } else {
      previewWebsite.classList.add('hidden');
      previewWebsite.innerHTML = '';
    }

    renderPreviewSocials();
  }

  cardForm.addEventListener('input', updatePreview);
  updatePreview();
  renderSocialList();

  function renderCards(username) {
    savedCardsList.innerHTML = '';
    const cards = loadCards(username);
    if (!cards.length) {
      const empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = 'Bạn chưa lưu danh thiếp nào.';
      savedCardsList.appendChild(empty);
      return;
    }

    cards
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .forEach((card) => {
        const item = document.createElement('article');
        item.className = 'card-item';

        const titleEl = document.createElement('h3');
        titleEl.textContent = card.title;
        item.appendChild(titleEl);

        const roleEl = document.createElement('p');
        roleEl.className = 'card-item-role';
        roleEl.textContent = `${card.role} • ${card.location}`;
        item.appendChild(roleEl);

        if (card.summary) {
          const summaryEl = document.createElement('p');
          summaryEl.className = 'card-item-summary';
          summaryEl.textContent = card.summary;
          item.appendChild(summaryEl);
        }

        const linkList = document.createElement('ul');
        linkList.className = 'card-item-links';

        if (card.email) {
          const emailEl = document.createElement('li');
          emailEl.textContent = `📧 ${card.email}`;
          linkList.appendChild(emailEl);
        }

        if (card.phone) {
          const phoneEl = document.createElement('li');
          phoneEl.textContent = `📞 ${card.phone}`;
          linkList.appendChild(phoneEl);
        }

        if (card.website) {
          const websiteEl = document.createElement('li');
          const link = document.createElement('a');
          link.href = card.website;
          link.target = '_blank';
          link.rel = 'noopener';
          link.textContent = card.website;
          websiteEl.textContent = '🌐 ';
          websiteEl.appendChild(link);
          linkList.appendChild(websiteEl);
        }

        if (linkList.children.length) {
          item.appendChild(linkList);
        }

        const socialItems = Array.isArray(card.socials) ? card.socials : [];
        if (socialItems.length) {
          const socialListEl = document.createElement('ul');
          socialListEl.className = 'card-item-socials';
          socialItems.forEach((social) => {
            const socialItem = document.createElement('li');
            const icon = document.createElement('i');
            icon.className = social.icon || SOCIAL_OPTIONS[social.platform]?.icon || 'fas fa-link';
            icon.setAttribute('aria-hidden', 'true');

            const link = document.createElement('a');
            link.href = social.url;
            link.target = '_blank';
            link.rel = 'noopener';
            link.textContent = social.label || SOCIAL_OPTIONS[social.platform]?.label || 'Liên kết';

            socialItem.appendChild(icon);
            socialItem.appendChild(link);
            socialListEl.appendChild(socialItem);
          });
          item.appendChild(socialListEl);
        }

        const actions = document.createElement('div');
        actions.className = 'card-actions';

        const shareBtn = document.createElement('button');
        shareBtn.type = 'button';
        shareBtn.className = 'action-button share-button';
        shareBtn.textContent = 'Chia sẻ';
        shareBtn.addEventListener('click', async () => {
          const shareUrl = createShareUrl(card);
          try {
            await copyToClipboard(shareUrl);
            feedbackEl.textContent = 'Đã sao chép liên kết chia sẻ vào clipboard!';
            feedbackEl.dataset.tone = 'success';
          } catch (error) {
            console.error(error);
            feedbackEl.textContent = 'Không thể sao chép liên kết, vui lòng thử lại.';
            feedbackEl.dataset.tone = 'error';
          }
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'action-button delete-button';
        deleteBtn.textContent = 'Xóa';
        deleteBtn.addEventListener('click', () => {
          const updatedCards = loadCards(username).filter((itemCard) => itemCard.id !== card.id);
          saveCards(username, updatedCards);
          renderCards(username);
          feedbackEl.textContent = 'Đã xóa danh thiếp.';
          feedbackEl.dataset.tone = 'info';
        });

        actions.appendChild(shareBtn);
        actions.appendChild(deleteBtn);
        item.appendChild(actions);

        savedCardsList.appendChild(item);
      });
  }

  cardForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!currentUsername) {
      feedbackEl.textContent = 'Bạn cần đăng nhập để lưu danh thiếp.';
      feedbackEl.dataset.tone = 'error';
      return;
    }

    const newCard = {
      id: Date.now(),
      title: titleInput.value.trim() || 'Tên của bạn',
      role: roleInput.value.trim() || 'Vị trí công việc',
      location: locationInput.value.trim() || 'Địa điểm',
      summary: summaryInput.value.trim(),
      email: emailInput.value.trim(),
      phone: phoneInput.value.trim(),
      website: websiteInput.value.trim(),
      socials: socialProfiles.map((profile) => ({
        platform: profile.platform,
        label: profile.label,
        icon: profile.icon,
        url: profile.url,
      })),
      createdAt: new Date().toISOString(),
    };

    const cards = loadCards(currentUsername);
    cards.push(newCard);
    saveCards(currentUsername, cards);

    feedbackEl.textContent = 'Danh thiếp của bạn đã được lưu! Chia sẻ ngay với bạn bè.';
    feedbackEl.dataset.tone = 'success';
    cardForm.reset();
    socialProfiles = [];
    updatePreview();
    renderSocialList();
    renderCards(currentUsername);
  });

  onSessionChange((username) => {
    if (username) {
      cardBuilder.classList.remove('hidden');
      savedCardsWrapper.classList.remove('hidden');
      renderCards(username);
    } else {
      cardBuilder.classList.add('hidden');
      savedCardsWrapper.classList.add('hidden');
      feedbackEl.textContent = '';
      socialProfiles = [];
      cardForm.reset();
      renderSocialList();
      updatePreview();
    }
  });
}

function initSharedCardModal() {
  const modal = document.getElementById('shared-card-modal');
  const closeBtn = document.getElementById('close-shared-card');
  const content = document.getElementById('shared-card-content');
  if (!modal || !closeBtn || !content) return;

  function hideModal() {
    modal.classList.add('hidden');
    content.innerHTML = '';
  }

  closeBtn.addEventListener('click', hideModal);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) hideModal();
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
      hideModal();
    }
  });

  const params = new URLSearchParams(window.location.search);
  const cardParam = params.get('card');
  if (cardParam) {
    try {
      const sharedCard = decodeCardData(cardParam);

      const titleEl = document.createElement('h3');
      titleEl.textContent = sharedCard.title || 'Danh thiếp';

      const roleEl = document.createElement('p');
      roleEl.className = 'card-item-role';
      roleEl.textContent = `${sharedCard.role || 'Vị trí'} • ${sharedCard.location || 'Địa điểm'}`;

      const summaryEl = document.createElement('p');
      summaryEl.className = 'card-item-summary';
      summaryEl.textContent = sharedCard.summary || 'Chưa có mô tả.';

      const linkList = document.createElement('ul');
      linkList.className = 'card-item-links';

      if (sharedCard.email) {
        const emailEl = document.createElement('li');
        emailEl.textContent = `📧 ${sharedCard.email}`;
        linkList.appendChild(emailEl);
      }

      if (sharedCard.phone) {
        const phoneEl = document.createElement('li');
        phoneEl.textContent = `📞 ${sharedCard.phone}`;
        linkList.appendChild(phoneEl);
      }

      if (sharedCard.website) {
        const websiteEl = document.createElement('li');
        const link = document.createElement('a');
        link.href = sharedCard.website;
        link.target = '_blank';
        link.rel = 'noopener';
        link.textContent = sharedCard.website;
        websiteEl.textContent = '🌐 ';
        websiteEl.appendChild(link);
        linkList.appendChild(websiteEl);
      }

      content.appendChild(titleEl);
      content.appendChild(roleEl);
      content.appendChild(summaryEl);
      if (linkList.children.length) {
        content.appendChild(linkList);
      }

      const socialItems = Array.isArray(sharedCard.socials) ? sharedCard.socials : [];
      if (socialItems.length) {
        const socialList = document.createElement('ul');
        socialList.className = 'card-item-socials';
        socialItems.forEach((social) => {
          const socialItem = document.createElement('li');
          const icon = document.createElement('i');
          icon.className = social.icon || SOCIAL_OPTIONS[social.platform]?.icon || 'fas fa-link';
          icon.setAttribute('aria-hidden', 'true');

          const link = document.createElement('a');
          link.href = social.url;
          link.target = '_blank';
          link.rel = 'noopener';
          link.textContent = social.label || SOCIAL_OPTIONS[social.platform]?.label || 'Liên kết';

          socialItem.appendChild(icon);
          socialItem.appendChild(link);
          socialList.appendChild(socialItem);
        });
        content.appendChild(socialList);
      }

      modal.classList.remove('hidden');

      params.delete('card');
      const newQuery = params.toString();
      const newUrl = `${window.location.pathname}${newQuery ? `?${newQuery}` : ''}${window.location.hash}`;
      window.history.replaceState({}, document.title, newUrl);
    } catch (error) {
      console.error('Không thể đọc danh thiếp được chia sẻ', error);
    }
  }
}

function initLoadingAnimation() {
  window.addEventListener('load', () => {
    const loadingPage = document.querySelector('.loading-page');
    const container = document.querySelector('.container');
    const authWrapper = document.querySelector('.auth-wrapper');
    const target = container || authWrapper;
    if (loadingPage && target) {
      setTimeout(() => {
        loadingPage.classList.add('hidden');
        target.classList.remove('hidden');
      }, 500);
    }
  });
}

updateProfileFromStorage();
initConfigForm();
window.addEventListener('DOMContentLoaded', () => {
  initAuthPlatform();
  initCardBuilder();
  initSharedCardModal();
});
initLoadingAnimation();
