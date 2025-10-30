const DEFAULT_PROFILE = {
    bio: "Hi! My name's Uy, or you can also call me Jerry. I'm a student specializing in Biology and I'm a junior coder. And now, in 2024, I learn Traditional Medicine at University of Health Sciences.",
    avatars: {
        light: './icon/thumb-344733.png',
        dark: './icon/350083.png'
    }
};

const STORAGE_KEYS = {
    theme: 'theme',
    avatar: 'profileAvatar',
    bio: 'profileBio'
};

window.addEventListener('load', function () {
    const loadingPage = document.querySelector('.loading-page');
    const contentContainer = document.querySelector('.container');

    if (loadingPage) {
        loadingPage.classList.add('hidden');
    }

    if (contentContainer) {
        contentContainer.classList.remove('hidden');
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const isConfigPage = document.body.classList.contains('config-page');

    if (isConfigPage) {
        initializeConfigPage();
    } else {
        initializeMainPage();
    }
});

function initializeMainPage() {
    const avatarImg = document.getElementById('avatar-img');
    const bioText = document.getElementById('bio-text');
    const darkModeToggle = document.getElementById('dark-mode-toggle');

    applyProfileBio(bioText);

    const initialTheme = loadStoredTheme();
    applyTheme(initialTheme);
    applyProfileAvatar(avatarImg, initialTheme);

    const prefersDarkQuery = window.matchMedia('(prefers-color-scheme: dark)');
    prefersDarkQuery.addEventListener('change', (event) => {
        if (!localStorage.getItem(STORAGE_KEYS.theme)) {
            const theme = event.matches ? 'dark' : 'light';
            applyTheme(theme);
            applyProfileAvatar(avatarImg, theme);
        }
    });

    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            const isCurrentlyDark = document.body.classList.contains('dark-mode');
            const newTheme = isCurrentlyDark ? 'light' : 'dark';
            applyTheme(newTheme);
            localStorage.setItem(STORAGE_KEYS.theme, newTheme);
            applyProfileAvatar(avatarImg, newTheme);
        });
    }
}

function initializeConfigPage() {
    const form = document.getElementById('config-form');
    const avatarPreview = document.getElementById('avatar-preview');
    const avatarInput = document.getElementById('avatar-input');
    const bioInput = document.getElementById('bio-input');
    const resetButton = document.getElementById('reset-config');
    const statusMessage = document.getElementById('config-status');

    if (!form || !avatarPreview || !avatarInput || !bioInput || !resetButton || !statusMessage) {
        return;
    }

    let pendingAvatar = localStorage.getItem(STORAGE_KEYS.avatar);
    let pendingBio = localStorage.getItem(STORAGE_KEYS.bio) || '';

    avatarPreview.src = pendingAvatar || DEFAULT_PROFILE.avatars.light;
    bioInput.value = pendingBio || DEFAULT_PROFILE.bio;

    avatarInput.addEventListener('change', (event) => {
        const file = event.target.files && event.target.files[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith('image/')) {
            statusMessage.textContent = 'Please choose an image file for your avatar.';
            avatarInput.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (loadEvent) => {
            pendingAvatar = loadEvent.target?.result;
            if (typeof pendingAvatar === 'string') {
                avatarPreview.src = pendingAvatar;
                statusMessage.textContent = 'Avatar ready to be saved.';
            }
        };
        reader.readAsDataURL(file);
    });

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const bioValue = bioInput.value.trim();

        if (bioValue && bioValue !== DEFAULT_PROFILE.bio) {
            localStorage.setItem(STORAGE_KEYS.bio, bioValue);
            pendingBio = bioValue;
        } else {
            localStorage.removeItem(STORAGE_KEYS.bio);
            pendingBio = '';
            bioInput.value = DEFAULT_PROFILE.bio;
        }

        if (pendingAvatar) {
            localStorage.setItem(STORAGE_KEYS.avatar, pendingAvatar);
        } else {
            localStorage.removeItem(STORAGE_KEYS.avatar);
            avatarPreview.src = DEFAULT_PROFILE.avatars.light;
        }

        avatarInput.value = '';
        statusMessage.textContent = 'Profile updated! Visit the profile page to see your changes.';
    });

    resetButton.addEventListener('click', () => {
        pendingAvatar = null;
        pendingBio = '';
        localStorage.removeItem(STORAGE_KEYS.avatar);
        localStorage.removeItem(STORAGE_KEYS.bio);

        avatarPreview.src = DEFAULT_PROFILE.avatars.light;
        bioInput.value = DEFAULT_PROFILE.bio;
        avatarInput.value = '';
        statusMessage.textContent = 'All settings restored to their defaults.';
    });
}

function applyTheme(theme) {
    const body = document.body;
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const isDark = theme === 'dark';

    body.classList.toggle('dark-mode', isDark);

    if (darkModeToggle) {
        darkModeToggle.classList.toggle('dark-mode', isDark);
        darkModeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        darkModeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    }
}

function applyProfileAvatar(avatarImg, theme) {
    if (!avatarImg) {
        return;
    }

    const storedAvatar = localStorage.getItem(STORAGE_KEYS.avatar);

    if (storedAvatar) {
        avatarImg.src = storedAvatar;
        avatarImg.classList.add('custom-avatar');
    } else {
        const defaultAvatar = theme === 'dark' ? DEFAULT_PROFILE.avatars.dark : DEFAULT_PROFILE.avatars.light;
        avatarImg.src = defaultAvatar;
        avatarImg.classList.remove('custom-avatar');
    }
}

function applyProfileBio(bioElement) {
    if (!bioElement) {
        return;
    }

    const storedBio = localStorage.getItem(STORAGE_KEYS.bio);
    const defaultBio = bioElement.dataset.defaultBio || DEFAULT_PROFILE.bio;

    if (storedBio && storedBio.length) {
        bioElement.textContent = storedBio;
    } else {
        bioElement.textContent = defaultBio;
    }
}

function loadStoredTheme() {
    const storedTheme = localStorage.getItem(STORAGE_KEYS.theme);

    if (storedTheme === 'dark' || storedTheme === 'light') {
        return storedTheme;
    }

    const legacyDarkMode = localStorage.getItem('darkMode');
    if (legacyDarkMode !== null) {
        localStorage.removeItem('darkMode');
        return legacyDarkMode === 'true' ? 'dark' : 'light';
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
