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
const CARD_PAGE_PATH = 'index.html';
const CARDS_PAGE_PATH = 'cards.html';
const DEFAULT_CARD_AVATAR = './icon/thumb-344733.png';

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

// ----- Nén & giải nén -----
const LZString = (() => {
  const f = String.fromCharCode;
  const keyStrUriSafe = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$';
  const baseReverseDic = {};

  function getBaseValue(alphabet, character) {
    if (!baseReverseDic[alphabet]) {
      baseReverseDic[alphabet] = {};
      for (let i = 0; i < alphabet.length; i += 1) {
        baseReverseDic[alphabet][alphabet.charAt(i)] = i;
      }
    }
    return baseReverseDic[alphabet][character];
  }

  function compress(uncompressed, bitsPerChar, getCharFromInt) {
    if (uncompressed == null) return '';
    let i;
    let value;
    const contextDictionary = new Map();
    const contextDictionaryToCreate = new Map();
    let contextC = '';
    let contextW = '';
    const contextEnlargeIn = { value: 2 };
    let contextDictSize = 3;
    let contextNumBits = 2;
    const contextData = [];
    let contextDataVal = 0;
    let contextDataPosition = 0;

    const produceOutput = (valueToProduce, bits) => {
      for (let j = 0; j < bits; j += 1) {
        contextDataVal <<= 1;
        contextDataVal |= valueToProduce & 1;
        if (contextDataPosition === bitsPerChar - 1) {
          contextDataPosition = 0;
          contextData.push(getCharFromInt(contextDataVal));
          contextDataVal = 0;
        } else {
          contextDataPosition += 1;
        }
        valueToProduce >>= 1;
      }
    };

    const decreaseEnlargeIn = () => {
      contextEnlargeIn.value -= 1;
      if (contextEnlargeIn.value === 0) {
        contextEnlargeIn.value = 2 ** contextNumBits;
        contextNumBits += 1;
      }
    };

    for (i = 0; i < uncompressed.length; i += 1) {
      contextC = uncompressed.charAt(i);
      if (!contextDictionary.has(contextC)) {
        contextDictionary.set(contextC, contextDictSize);
        contextDictSize += 1;
        contextDictionaryToCreate.set(contextC, true);
      }

      const contextWC = contextW + contextC;
      if (contextDictionary.has(contextWC)) {
        contextW = contextWC;
      } else {
        if (contextDictionaryToCreate.has(contextW)) {
          value = contextW.charCodeAt(0);
          if (value < 256) {
            produceOutput(0, contextNumBits);
            produceOutput(value, 8);
          } else {
            produceOutput(1, contextNumBits);
            produceOutput(value, 16);
          }
          decreaseEnlargeIn();
          contextDictionaryToCreate.delete(contextW);
        } else {
          value = contextDictionary.get(contextW);
          produceOutput(value, contextNumBits);
          decreaseEnlargeIn();
        }

        contextDictionary.set(contextWC, contextDictSize);
        contextDictSize += 1;
        contextW = contextC;
      }
    }

    if (contextW !== '') {
      if (contextDictionaryToCreate.has(contextW)) {
        value = contextW.charCodeAt(0);
        if (value < 256) {
          produceOutput(0, contextNumBits);
          produceOutput(value, 8);
        } else {
          produceOutput(1, contextNumBits);
          produceOutput(value, 16);
        }
        decreaseEnlargeIn();
        contextDictionaryToCreate.delete(contextW);
      } else {
        value = contextDictionary.get(contextW);
        produceOutput(value, contextNumBits);
        decreaseEnlargeIn();
      }
    }

    value = 2;
    produceOutput(value, contextNumBits);

    while (true) {
      contextDataVal <<= 1;
      if (contextDataPosition === bitsPerChar - 1) {
        contextData.push(getCharFromInt(contextDataVal));
        break;
      }
      contextDataPosition += 1;
    }

    return contextData.join('');
  }

  function decompress(length, resetValue, getNextValue) {
    const dictionary = [];
    let next;
    let enlargeIn = 4;
    let dictSize = 4;
    let numBits = 3;
    let entry = '';
    const result = [];
    let i;
    let w;
    let bits;
    let resb;
    let maxPower;
    let power;
    let c;

    const data = {
      value: getNextValue(0),
      position: resetValue,
      index: 1,
    };

    for (i = 0; i < 3; i += 1) {
      dictionary[i] = i;
    }

    bits = 0;
    maxPower = 2 ** 2;
    power = 1;
    while (power !== maxPower) {
      resb = data.value & data.position;
      data.position >>= 1;
      if (data.position === 0) {
        data.position = resetValue;
        data.value = getNextValue(data.index);
        data.index += 1;
      }
      bits |= (resb > 0 ? 1 : 0) * power;
      power *= 2;
    }

    switch (bits) {
      case 0:
        bits = 0;
        maxPower = 2 ** 8;
        power = 1;
        while (power !== maxPower) {
          resb = data.value & data.position;
          data.position >>= 1;
          if (data.position === 0) {
            data.position = resetValue;
            data.value = getNextValue(data.index);
            data.index += 1;
          }
          bits |= (resb > 0 ? 1 : 0) * power;
          power *= 2;
        }
        c = f(bits);
        break;
      case 1:
        bits = 0;
        maxPower = 2 ** 16;
        power = 1;
        while (power !== maxPower) {
          resb = data.value & data.position;
          data.position >>= 1;
          if (data.position === 0) {
            data.position = resetValue;
            data.value = getNextValue(data.index);
            data.index += 1;
          }
          bits |= (resb > 0 ? 1 : 0) * power;
          power *= 2;
        }
        c = f(bits);
        break;
      case 2:
        return '';
      default:
        c = '';
        break;
    }

    dictionary[3] = c;
    w = c;
    result.push(c);

    while (true) {
      if (data.index > length) {
        return '';
      }

      bits = 0;
      maxPower = 2 ** numBits;
      power = 1;
      while (power !== maxPower) {
        resb = data.value & data.position;
        data.position >>= 1;
        if (data.position === 0) {
          data.position = resetValue;
          data.value = getNextValue(data.index);
          data.index += 1;
        }
        bits |= (resb > 0 ? 1 : 0) * power;
        power *= 2;
      }

      switch ((next = bits)) {
        case 0:
          bits = 0;
          maxPower = 2 ** 8;
          power = 1;
          while (power !== maxPower) {
            resb = data.value & data.position;
            data.position >>= 1;
            if (data.position === 0) {
              data.position = resetValue;
              data.value = getNextValue(data.index);
              data.index += 1;
            }
            bits |= (resb > 0 ? 1 : 0) * power;
            power *= 2;
          }

          dictionary[dictSize] = f(bits);
          dictSize += 1;
          next = dictSize - 1;
          enlargeIn -= 1;
          break;
        case 1:
          bits = 0;
          maxPower = 2 ** 16;
          power = 1;
          while (power !== maxPower) {
            resb = data.value & data.position;
            data.position >>= 1;
            if (data.position === 0) {
              data.position = resetValue;
              data.value = getNextValue(data.index);
              data.index += 1;
            }
            bits |= (resb > 0 ? 1 : 0) * power;
            power *= 2;
          }

          dictionary[dictSize] = f(bits);
          dictSize += 1;
          next = dictSize - 1;
          enlargeIn -= 1;
          break;
        case 2:
          return result.join('');
        default:
          break;
      }

      if (enlargeIn === 0) {
        enlargeIn = 2 ** numBits;
        numBits += 1;
      }

      if (dictionary[next]) {
        entry = dictionary[next];
      } else if (next === dictSize) {
        entry = w + w.charAt(0);
      } else {
        return '';
      }

      result.push(entry);

      dictionary[dictSize] = w + entry.charAt(0);
      dictSize += 1;
      enlargeIn -= 1;

      w = entry;

      if (enlargeIn === 0) {
        enlargeIn = 2 ** numBits;
        numBits += 1;
      }
    }
  }

  function compressToEncodedURIComponent(input) {
    if (input == null) return '';
    return compress(input, 6, (a) => keyStrUriSafe.charAt(a));
  }

  function decompressFromEncodedURIComponent(input) {
    if (input == null) return '';
    if (input === '') return null;
    input = input.replace(/ /g, '+');

    return decompress(input.length, 32, (index) => getBaseValue(keyStrUriSafe, input.charAt(index)));
  }

  return {
    compressToEncodedURIComponent,
    decompressFromEncodedURIComponent,
  };
})();

const STORAGE_COMPRESSED_PREFIX = 'c1:';
const STORAGE_JSON_PREFIX = 'j1:';
const STORAGE_LEGACY_PREFIX = 'b1:';

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

function parseStoredCards(raw) {
  if (!raw) return [];
  try {
    if (raw.startsWith(STORAGE_COMPRESSED_PREFIX)) {
      const compressed = raw.slice(STORAGE_COMPRESSED_PREFIX.length);
      let json = '';
      try {
        json = LZString.decompressFromEncodedURIComponent(compressed);
      } catch (error) {
        console.error('Không thể giải nén dữ liệu danh thiếp đã lưu', error);
        return [];
      }
      if (!json) {
        throw new Error('Invalid compressed payload');
      }
      return JSON.parse(json);
    }
    if (raw.startsWith(STORAGE_JSON_PREFIX)) {
      return JSON.parse(raw.slice(STORAGE_JSON_PREFIX.length));
    }
    if (raw.startsWith(STORAGE_LEGACY_PREFIX)) {
      const legacyPayload = raw.slice(STORAGE_LEGACY_PREFIX.length);
      const binary = atob(legacyPayload);
      const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
      const json = textDecoder.decode(bytes);
      return JSON.parse(json);
    }
    return JSON.parse(raw);
  } catch (error) {
    console.error('Không thể giải mã dữ liệu danh thiếp', error);
    return [];
  }
}

function serializeCards(cards) {
  const json = JSON.stringify(cards);
  try {
    const compressed = LZString.compressToEncodedURIComponent(json);
    if (compressed) {
      return `${STORAGE_COMPRESSED_PREFIX}${compressed}`;
    }
  } catch (error) {
    console.warn('Không thể nén danh thiếp, sử dụng JSON thuần', error);
  }
  return `${STORAGE_JSON_PREFIX}${json}`;
}

function loadCards(username) {
  try {
    const raw = localStorage.getItem(`${CARDS_KEY_PREFIX}${username}`);
    return parseStoredCards(raw);
  } catch (error) {
    console.error('Không thể đọc danh thiếp đã lưu', error);
    return [];
  }
}

function saveCards(username, cards) {
  const storageKey = `${CARDS_KEY_PREFIX}${username}`;
  const payload = serializeCards(cards);
  try {
    localStorage.setItem(storageKey, payload);
  } catch (error) {
    if (error && (error.name === 'QuotaExceededError' || error.code === 22 || error.code === 1014)) {
      const quotaError = new Error('STORAGE_QUOTA_EXCEEDED');
      quotaError.cause = error;
      throw quotaError;
    }
    throw error;
  }
}

function encodeCardData(card) {
  const json = JSON.stringify(card);
  try {
    const compressed = LZString.compressToEncodedURIComponent(json);
    if (compressed) {
      return `${STORAGE_COMPRESSED_PREFIX}${compressed}`;
    }
  } catch (error) {
    console.warn('Không thể nén dữ liệu chia sẻ, fallback sang định dạng cũ', error);
  }

  const bytes = textEncoder.encode(json);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return `${STORAGE_LEGACY_PREFIX}${btoa(binary)}`;
}

function decodeCardData(encoded) {
  if (!encoded) {
    throw new Error('Thiếu dữ liệu danh thiếp.');
  }

  try {
    let payload = encoded;
    if (payload.includes('%')) {
      try {
        payload = decodeURIComponent(payload);
      } catch (error) {
        console.warn('Không thể giải mã phần trăm của dữ liệu chia sẻ', error);
      }
    }

    if (payload.startsWith(STORAGE_COMPRESSED_PREFIX)) {
      const compressed = payload.slice(STORAGE_COMPRESSED_PREFIX.length);
      const json = LZString.decompressFromEncodedURIComponent(compressed);
      if (!json) throw new Error('Không thể giải nén dữ liệu.');
      return JSON.parse(json);
    }

    if (payload.startsWith(STORAGE_JSON_PREFIX)) {
      return JSON.parse(payload.slice(STORAGE_JSON_PREFIX.length));
    }

    if (payload.startsWith(STORAGE_LEGACY_PREFIX)) {
      const legacyPayload = payload.slice(STORAGE_LEGACY_PREFIX.length);
      const binary = atob(legacyPayload);
      const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
      const json = textDecoder.decode(bytes);
      return JSON.parse(json);
    }

    let maybeCompressed = null;
    try {
      maybeCompressed = LZString.decompressFromEncodedURIComponent(payload);
    } catch (lzError) {
      console.warn('Không thể giải nén dữ liệu chia sẻ bằng thuật toán mới', lzError);
    }
    if (maybeCompressed) {
      return JSON.parse(maybeCompressed);
    }

    const binary = atob(payload);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const json = textDecoder.decode(bytes);
    return JSON.parse(json);
  } catch (error) {
    console.error('Không thể giải mã dữ liệu danh thiếp', error);
    throw error;
  }
}

function createShareUrl(card) {
  const encoded = encodeCardData(card);
  const baseUrl = new URL('index.html', window.location.href);
  baseUrl.searchParams.set('card', encoded);
  return baseUrl.toString();
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

function setFeedback(element, message, tone = 'info') {
  if (!element) return;
  if (!message) {
    element.textContent = '';
    element.removeAttribute('data-tone');
    return;
  }
  element.textContent = message;
  element.dataset.tone = tone;
}

function resolveCardAvatar(avatar) {
  return avatar || DEFAULT_CARD_AVATAR;
}

function buildPreviewStructure() {
  const wrapper = document.createElement('div');
  wrapper.className = 'live-preview-card';

  const avatarWrapper = document.createElement('div');
  avatarWrapper.className = 'preview-avatar';
  const avatarImg = document.createElement('img');
  avatarImg.alt = 'Ảnh đại diện danh thiếp';
  avatarWrapper.appendChild(avatarImg);
  wrapper.appendChild(avatarWrapper);

  const content = document.createElement('div');
  content.className = 'preview-content';

  const titleEl = document.createElement('h3');
  titleEl.setAttribute('data-preview', 'title');
  content.appendChild(titleEl);

  const roleEl = document.createElement('p');
  roleEl.className = 'preview-role';
  roleEl.setAttribute('data-preview', 'role');
  content.appendChild(roleEl);

  const summaryEl = document.createElement('p');
  summaryEl.className = 'preview-summary';
  summaryEl.setAttribute('data-preview', 'summary');
  content.appendChild(summaryEl);

  const linksEl = document.createElement('ul');
  linksEl.className = 'preview-links';
  linksEl.setAttribute('data-preview', 'links');
  content.appendChild(linksEl);

  const socialsEl = document.createElement('ul');
  socialsEl.className = 'preview-socials';
  socialsEl.setAttribute('data-preview', 'socials');
  content.appendChild(socialsEl);

  wrapper.appendChild(content);

  return wrapper;
}

function updatePreviewContent(previewRoot, card) {
  if (!previewRoot) return;
  const avatarImg = previewRoot.querySelector('.preview-avatar img');
  if (avatarImg) {
    avatarImg.src = resolveCardAvatar(card.avatar);
    avatarImg.alt = card.title ? `Ảnh đại diện của ${card.title}` : 'Ảnh đại diện danh thiếp';
  }

  const titleEl = previewRoot.querySelector('[data-preview="title"]');
  if (titleEl) {
    titleEl.textContent = card.title?.trim() || 'Tên của bạn';
  }

  const roleEl = previewRoot.querySelector('[data-preview="role"]');
  if (roleEl) {
    const role = card.role?.trim() || 'Vị trí công việc';
    const location = card.location?.trim() || 'Địa điểm';
    roleEl.textContent = `${role} • ${location}`;
  }

  const summaryEl = previewRoot.querySelector('[data-preview="summary"]');
  if (summaryEl) {
    summaryEl.textContent = card.summary?.trim() || 'Giới thiệu về bạn sẽ hiển thị tại đây.';
  }

  const linksEl = previewRoot.querySelector('[data-preview="links"]');
  if (linksEl) {
    linksEl.innerHTML = '';

    if (card.email?.trim()) {
      const emailItem = document.createElement('li');
      emailItem.textContent = `📧 ${card.email.trim()}`;
      linksEl.appendChild(emailItem);
    }

    if (card.phone?.trim()) {
      const phoneItem = document.createElement('li');
      phoneItem.textContent = `📞 ${card.phone.trim()}`;
      linksEl.appendChild(phoneItem);
    }

    if (card.website?.trim()) {
      const websiteItem = document.createElement('li');
      websiteItem.innerHTML = '';
      const link = document.createElement('a');
      link.href = card.website.trim();
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = card.website.trim();
      websiteItem.textContent = '🌐 ';
      websiteItem.appendChild(link);
      linksEl.appendChild(websiteItem);
    }

    linksEl.classList.toggle('hidden', !linksEl.children.length);
  }

  const socialsEl = previewRoot.querySelector('[data-preview="socials"]');
  if (socialsEl) {
    socialsEl.innerHTML = '';
    const socials = Array.isArray(card.socials) ? card.socials : [];
    socials.forEach((profile) => {
      const item = document.createElement('li');
      const icon = document.createElement('i');
      icon.className = profile.icon || SOCIAL_OPTIONS[profile.platform]?.icon || 'fas fa-link';
      icon.setAttribute('aria-hidden', 'true');
      const link = document.createElement('a');
      link.href = profile.url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = profile.label || SOCIAL_OPTIONS[profile.platform]?.label || 'Liên kết';
      item.appendChild(icon);
      item.appendChild(link);
      socialsEl.appendChild(item);
    });

    socialsEl.classList.toggle('hidden', !socialsEl.children.length);
  }
}

function createPreviewElement(card, { append = true } = {}) {
  const preview = buildPreviewStructure();
  preview.classList.add('exportable-preview');
  if (append) {
    preview.style.position = 'fixed';
    preview.style.left = '-10000px';
    preview.style.top = '0';
    preview.style.opacity = '0';
    preview.style.pointerEvents = 'none';
    document.body.appendChild(preview);
  }
  updatePreviewContent(preview, card);
  return preview;
}

async function downloadCardAsImage(card, sourceElement) {
  if (typeof window.html2canvas !== 'function') {
    throw new Error('html2canvas chưa được tải.');
  }

  const element = sourceElement || createPreviewElement(card);
  let cleanup = null;
  if (!sourceElement) {
    cleanup = () => {
      element.remove();
    };
  }

  try {
    const canvas = await window.html2canvas(element, {
      backgroundColor: null,
      scale: window.devicePixelRatio > 1 ? 2 : 1.5,
    });
    const link = document.createElement('a');
    const safeTitle = card.title?.trim() || 'danh-thiep';
    link.href = canvas.toDataURL('image/png');
    link.download = `${safeTitle.replace(/\s+/g, '-').toLowerCase()}-card.png`;
    link.click();
  } finally {
    if (cleanup) cleanup();
  }
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
  const restrictedPages = new Set(['card', 'cards']);

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
    if (restrictedPages.has(pageContext)) {
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

    if (!authCard && restrictedPages.has(pageContext) && !username) {
      window.location.href = LOGIN_PAGE_PATH;
    }
  });
}

function initCardBuilder() {
  const cardBuilder = document.getElementById('card-builder');
  const cardForm = document.getElementById('card-form');
  const previewCard = document.getElementById('live-preview-card');
  if (!cardBuilder || !cardForm || !previewCard) return;

  const feedbackEl = document.getElementById('card-feedback');
  const previewFeedbackEl = document.getElementById('preview-feedback');
  const sharePreviewBtn = document.getElementById('share-preview');
  const downloadPreviewBtn = document.getElementById('download-preview');
  const cancelEditBtn = document.getElementById('cancel-edit');
  const submitBtn = document.getElementById('submit-card');

  const avatarInput = document.getElementById('card-avatar');
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

  let socialProfiles = [];
  let avatarDataUrl = '';
  let editingCardId = null;
  let pendingEditId = (() => {
    const params = new URLSearchParams(window.location.search);
    const editParam = params.get('edit');
    const parsed = editParam ? Number.parseInt(editParam, 10) : null;
    return Number.isFinite(parsed) ? parsed : null;
  })();

  function clearEditParam() {
    const params = new URLSearchParams(window.location.search);
    if (params.has('edit')) {
      params.delete('edit');
      const newQuery = params.toString();
      const newUrl = `${window.location.pathname}${newQuery ? `?${newQuery}` : ''}${window.location.hash}`;
      window.history.replaceState({}, document.title, newUrl);
    }
  }

  function getCurrentCardData() {
    return {
      avatar: avatarDataUrl,
      title: titleInput?.value || '',
      role: roleInput?.value || '',
      location: locationInput?.value || '',
      summary: summaryInput?.value || '',
      email: emailInput?.value || '',
      phone: phoneInput?.value || '',
      website: websiteInput?.value || '',
      socials: socialProfiles.map((profile) => ({ ...profile })),
    };
  }

  function applyCurrentPreview() {
    updatePreviewContent(previewCard, getCurrentCardData());
  }

  function renderSocialList() {
    if (socialList) {
      socialList.innerHTML = '';

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
    }

    applyCurrentPreview();
  }

  function resetFormState(options = { clearMessages: true }) {
    editingCardId = null;
    avatarDataUrl = '';
    cardForm.reset();
    socialProfiles = [];
    renderSocialList();
    if (cancelEditBtn) cancelEditBtn.classList.add('hidden');
    if (submitBtn) submitBtn.textContent = 'Lưu danh thiếp';
    applyCurrentPreview();
    if (options.clearMessages) {
      setFeedback(feedbackEl, '');
      setFeedback(previewFeedbackEl, '');
    }
    clearEditParam();
  }

  function loadCardForEditing(username, cardId) {
    const cards = loadCards(username);
    const card = cards.find((item) => item.id === cardId);
    if (!card) {
      setFeedback(feedbackEl, 'Không tìm thấy danh thiếp cần chỉnh sửa.', 'error');
      clearEditParam();
      pendingEditId = null;
      return;
    }

    editingCardId = card.id;
    avatarDataUrl = card.avatar || '';
    if (titleInput) titleInput.value = card.title || '';
    if (roleInput) roleInput.value = card.role || '';
    if (locationInput) locationInput.value = card.location || '';
    if (summaryInput) summaryInput.value = card.summary || '';
    if (emailInput) emailInput.value = card.email || '';
    if (phoneInput) phoneInput.value = card.phone || '';
    if (websiteInput) websiteInput.value = card.website || '';
    if (avatarInput) avatarInput.value = '';
    socialProfiles = Array.isArray(card.socials) ? card.socials.map((profile) => ({ ...profile })) : [];
    renderSocialList();
    applyCurrentPreview();
    if (cancelEditBtn) cancelEditBtn.classList.remove('hidden');
    if (submitBtn) submitBtn.textContent = 'Cập nhật danh thiếp';
    setFeedback(feedbackEl, 'Bạn đang chỉnh sửa danh thiếp đã lưu.', 'info');
    pendingEditId = null;
  }

  if (addSocialBtn) {
    addSocialBtn.addEventListener('click', () => {
      if (!socialSelect || !socialLinkInput) return;

      const platform = socialSelect.value;
      const linkValue = socialLinkInput.value.trim();

      if (!platform || !linkValue) {
        setFeedback(feedbackEl, 'Chọn nền tảng và nhập liên kết hợp lệ.', 'error');
        return;
      }

      const option = SOCIAL_OPTIONS[platform];
      if (!option) return;

      let parsedUrl;
      try {
        parsedUrl = new URL(linkValue);
      } catch (error) {
        setFeedback(feedbackEl, 'Liên kết không hợp lệ, vui lòng kiểm tra lại.', 'error');
        return;
      }

      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        setFeedback(feedbackEl, 'Liên kết mạng xã hội cần bắt đầu bằng http hoặc https.', 'error');
        return;
      }

      const normalizedUrl = parsedUrl.toString();
      const profileData = {
        platform,
        label: option.label,
        icon: option.icon,
        url: normalizedUrl,
      };

      const existingIndex = socialProfiles.findIndex((profile) => profile.platform === platform);
      if (existingIndex >= 0) {
        socialProfiles[existingIndex] = profileData;
      } else {
        socialProfiles.push(profileData);
      }

      socialSelect.value = '';
      socialLinkInput.value = '';
      setFeedback(feedbackEl, 'Đã cập nhật mạng xã hội.', 'info');
      renderSocialList();
    });
  }

  if (avatarInput) {
    avatarInput.addEventListener('change', () => {
      const [file] = avatarInput.files || [];
      if (!file) {
        avatarDataUrl = editingCardId ? avatarDataUrl : '';
        applyCurrentPreview();
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        setFeedback(feedbackEl, 'Ảnh đại diện vượt quá 2MB, vui lòng chọn ảnh nhỏ hơn.', 'error');
        avatarInput.value = '';
        return;
      }

      if (!file.type.startsWith('image/')) {
        setFeedback(feedbackEl, 'Vui lòng chọn tập tin ảnh hợp lệ.', 'error');
        avatarInput.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        avatarDataUrl = event.target?.result || '';
        applyCurrentPreview();
      };
      reader.onerror = () => {
        setFeedback(feedbackEl, 'Không thể đọc ảnh, vui lòng thử lại.', 'error');
        avatarInput.value = '';
      };
      reader.readAsDataURL(file);
    });
  }

  cardForm.addEventListener('input', (event) => {
    if (event.target === avatarInput) return;
    applyCurrentPreview();
  });

  if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', () => {
      resetFormState({ clearMessages: false });
      setFeedback(feedbackEl, 'Đã hủy chỉnh sửa. Bạn đang tạo danh thiếp mới.', 'info');
    });
  }

  if (sharePreviewBtn) {
    sharePreviewBtn.addEventListener('click', async () => {
      const cardData = getCurrentCardData();
      try {
        const shareUrl = createShareUrl(cardData);
        if (navigator.share) {
          try {
            await navigator.share({
              title: cardData.title || 'Danh thiếp',
              text: 'Xem danh thiếp của tôi nhé!',
              url: shareUrl,
            });
            setFeedback(previewFeedbackEl, 'Đã chia sẻ danh thiếp của bạn.', 'success');
            return;
          } catch (error) {
            if (error.name === 'AbortError') {
              setFeedback(previewFeedbackEl, 'Đã hủy chia sẻ.', 'info');
              return;
            }
          }
        }

        await copyToClipboard(shareUrl);
        setFeedback(previewFeedbackEl, 'Đã sao chép liên kết chia sẻ vào clipboard!', 'success');
      } catch (error) {
        console.error(error);
        setFeedback(previewFeedbackEl, 'Không thể chia sẻ danh thiếp, vui lòng thử lại.', 'error');
      }
    });
  }

  if (downloadPreviewBtn) {
    downloadPreviewBtn.addEventListener('click', async () => {
      try {
        await downloadCardAsImage(getCurrentCardData(), previewCard);
        setFeedback(previewFeedbackEl, 'Ảnh danh thiếp đã được tải xuống.', 'success');
      } catch (error) {
        console.error(error);
        setFeedback(previewFeedbackEl, 'Không thể tải ảnh danh thiếp. Kiểm tra kết nối hoặc thử lại.', 'error');
      }
    });
  }

  cardForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!currentUsername) {
      setFeedback(feedbackEl, 'Bạn cần đăng nhập để lưu danh thiếp.', 'error');
      return;
    }

    const now = new Date().toISOString();
    const baseCard = getCurrentCardData();
    const cards = loadCards(currentUsername);

    if (editingCardId) {
      const index = cards.findIndex((item) => item.id === editingCardId);
      if (index === -1) {
        setFeedback(feedbackEl, 'Không tìm thấy danh thiếp cần cập nhật.', 'error');
        resetFormState({ clearMessages: false });
        return;
      }

      cards[index] = {
        ...cards[index],
        ...baseCard,
        id: editingCardId,
        updatedAt: now,
      };
      try {
        saveCards(currentUsername, cards);
      } catch (error) {
        if (error?.message === 'STORAGE_QUOTA_EXCEEDED') {
          setFeedback(feedbackEl, 'Bộ nhớ trình duyệt đã đầy, không thể lưu danh thiếp. Hãy xóa bớt hoặc giảm kích thước ảnh.', 'error');
        } else {
          setFeedback(feedbackEl, 'Không thể lưu danh thiếp, vui lòng thử lại.', 'error');
        }
        console.error('Không thể cập nhật danh thiếp', error);
        return;
      }
      setFeedback(feedbackEl, 'Danh thiếp đã được cập nhật! Đang chuyển tới trang quản lý...', 'success');
      window.location.href = `${CARDS_PAGE_PATH}?highlight=${editingCardId}`;
      return;
    }

    const newCard = {
      id: Date.now(),
      createdAt: now,
      ...baseCard,
    };
    cards.push(newCard);
    try {
      saveCards(currentUsername, cards);
    } catch (error) {
      if (error?.message === 'STORAGE_QUOTA_EXCEEDED') {
        setFeedback(feedbackEl, 'Bộ nhớ trình duyệt đã đầy, không thể lưu danh thiếp mới. Hãy xóa bớt hoặc giảm kích thước ảnh.', 'error');
      } else {
        setFeedback(feedbackEl, 'Không thể lưu danh thiếp, vui lòng thử lại.', 'error');
      }
      console.error('Không thể lưu danh thiếp mới', error);
      return;
    }
    setFeedback(feedbackEl, 'Danh thiếp của bạn đã được lưu! Đang chuyển tới trang quản lý...', 'success');
    window.location.href = `${CARDS_PAGE_PATH}?highlight=${newCard.id}`;
  });

  onSessionChange((username) => {
    if (username) {
      cardBuilder.classList.remove('hidden');
      if (pendingEditId) {
        loadCardForEditing(username, pendingEditId);
      } else if (!editingCardId) {
        applyCurrentPreview();
      }
    } else {
      cardBuilder.classList.add('hidden');
      resetFormState();
      setFeedback(previewFeedbackEl, 'Đăng nhập để tạo danh thiếp của riêng bạn.', 'info');
    }
  });

  renderSocialList();
  applyCurrentPreview();
}

function initCardsLibrary() {
  const cardsList = document.getElementById('saved-cards-list');
  const feedbackEl = document.getElementById('cards-feedback');
  if (!cardsList) return;

  const params = new URLSearchParams(window.location.search);
  let highlightParam = params.get('highlight');
  let highlightId = highlightParam ? Number.parseInt(highlightParam, 10) : null;
  if (!Number.isFinite(highlightId)) {
    highlightId = null;
  }

  function clearHighlightParam() {
    if (!params.has('highlight')) return;
    params.delete('highlight');
    const newQuery = params.toString();
    const newUrl = `${window.location.pathname}${newQuery ? `?${newQuery}` : ''}${window.location.hash}`;
    window.history.replaceState({}, document.title, newUrl);
  }

  function renderEmptyState(message) {
    cardsList.innerHTML = '';
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = message;
    cardsList.appendChild(empty);
  }

  function createCardActions(card, username) {
    const actions = document.createElement('div');
    actions.className = 'card-actions';

    const shareBtn = document.createElement('button');
    shareBtn.type = 'button';
    shareBtn.className = 'action-button share-button';
    shareBtn.textContent = 'Chia sẻ';
    shareBtn.addEventListener('click', async () => {
      try {
        const shareUrl = createShareUrl(card);
        if (navigator.share) {
          try {
            await navigator.share({
              title: card.title || 'Danh thiếp',
              text: 'Xem danh thiếp của tôi nhé!',
              url: shareUrl,
            });
            setFeedback(feedbackEl, 'Đã chia sẻ danh thiếp của bạn.', 'success');
            return;
          } catch (error) {
            if (error.name === 'AbortError') {
              setFeedback(feedbackEl, 'Đã hủy chia sẻ.', 'info');
              return;
            }
          }
        }

        await copyToClipboard(shareUrl);
        setFeedback(feedbackEl, 'Đã sao chép liên kết chia sẻ vào clipboard!', 'success');
      } catch (error) {
        console.error(error);
        setFeedback(feedbackEl, 'Không thể chia sẻ danh thiếp, vui lòng thử lại.', 'error');
      }
    });

    const downloadBtn = document.createElement('button');
    downloadBtn.type = 'button';
    downloadBtn.className = 'action-button download-button';
    downloadBtn.textContent = 'Tải ảnh';
    downloadBtn.addEventListener('click', async () => {
      try {
        await downloadCardAsImage(card);
        setFeedback(feedbackEl, 'Ảnh danh thiếp đã được tải xuống.', 'success');
      } catch (error) {
        console.error(error);
        setFeedback(feedbackEl, 'Không thể tải ảnh danh thiếp. Kiểm tra kết nối hoặc thử lại.', 'error');
      }
    });

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'action-button edit-button';
    editBtn.textContent = 'Chỉnh sửa';
    editBtn.addEventListener('click', () => {
      window.location.href = `${CARD_PAGE_PATH}?edit=${card.id}`;
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'action-button delete-button';
    deleteBtn.textContent = 'Xóa';
    deleteBtn.addEventListener('click', () => {
      const confirmed = window.confirm('Bạn có chắc chắn muốn xóa danh thiếp này?');
      if (!confirmed) return;
      const updatedCards = loadCards(username).filter((itemCard) => itemCard.id !== card.id);
      try {
        saveCards(username, updatedCards);
      } catch (error) {
        console.error('Không thể xóa danh thiếp', error);
        setFeedback(feedbackEl, 'Không thể xóa danh thiếp, vui lòng thử lại.', 'error');
        return;
      }
      setFeedback(feedbackEl, 'Đã xóa danh thiếp.', 'info');
      renderCards(username);
    });

    actions.appendChild(shareBtn);
    actions.appendChild(downloadBtn);
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    return actions;
  }

  function renderCards(username) {
    const cards = loadCards(username);
    if (!cards.length) {
      renderEmptyState('Bạn chưa lưu danh thiếp nào. Hãy tạo danh thiếp đầu tiên của bạn!');
      setFeedback(feedbackEl, '');
      clearHighlightParam();
      highlightId = null;
      return;
    }

    const sortedCards = cards
      .slice()
      .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));

    cardsList.innerHTML = '';
    let highlightedElement = null;

    sortedCards.forEach((card) => {
      const item = document.createElement('article');
      item.className = 'card-item';
      if (highlightId && card.id === highlightId) {
        item.classList.add('highlight');
        highlightedElement = item;
      }

      const header = document.createElement('div');
      header.className = 'card-item-header';

      const avatarWrapper = document.createElement('div');
      avatarWrapper.className = 'card-item-avatar';
      const avatarImg = document.createElement('img');
      avatarImg.src = resolveCardAvatar(card.avatar);
      avatarImg.alt = card.title ? `Ảnh đại diện của ${card.title}` : 'Ảnh đại diện danh thiếp';
      avatarWrapper.appendChild(avatarImg);

      const heading = document.createElement('div');
      heading.className = 'card-item-heading';
      const titleEl = document.createElement('h3');
      titleEl.textContent = card.title || 'Danh thiếp';
      const roleEl = document.createElement('p');
      roleEl.className = 'card-item-role';
      roleEl.textContent = `${card.role || 'Vị trí'} • ${card.location || 'Địa điểm'}`;
      heading.appendChild(titleEl);
      heading.appendChild(roleEl);

      header.appendChild(avatarWrapper);
      header.appendChild(heading);
      item.appendChild(header);

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
        websiteEl.textContent = '🌐 ';
        const link = document.createElement('a');
        link.href = card.website;
        link.target = '_blank';
        link.rel = 'noopener';
        link.textContent = card.website;
        websiteEl.appendChild(link);
        linkList.appendChild(websiteEl);
      }
      if (linkList.children.length) {
        item.appendChild(linkList);
      }

      if (Array.isArray(card.socials) && card.socials.length) {
        const socialListEl = document.createElement('ul');
        socialListEl.className = 'card-item-socials';
        card.socials.forEach((social) => {
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

      item.appendChild(createCardActions(card, username));
      cardsList.appendChild(item);
    });

    if (highlightedElement) {
      setFeedback(feedbackEl, 'Danh thiếp của bạn đã được lưu! Bạn có thể chia sẻ hoặc chỉnh sửa ngay tại đây.', 'success');
      highlightedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      clearHighlightParam();
      highlightId = null;
    } else if (highlightId) {
      setFeedback(feedbackEl, 'Danh thiếp đã được tạo nhưng không tìm thấy để làm nổi bật.', 'info');
      clearHighlightParam();
      highlightId = null;
    } else {
      setFeedback(feedbackEl, '');
    }
  }

  onSessionChange((username) => {
    if (username) {
      renderCards(username);
    } else {
      renderEmptyState('Đăng nhập để xem và quản lý danh thiếp của bạn.');
      setFeedback(feedbackEl, '');
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

      const preview = buildPreviewStructure();
      preview.classList.add('shared-card-preview');
      updatePreviewContent(preview, sharedCard);
      content.appendChild(preview);

      const hint = document.createElement('p');
      hint.className = 'shared-card-hint';
      hint.textContent = 'Đăng nhập để lưu danh thiếp này vào tài khoản của bạn.';
      content.appendChild(hint);

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
  initCardsLibrary();
  initSharedCardModal();
});
initLoadingAnimation();
