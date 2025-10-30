window.addEventListener('load', function() {
            const loadingPage = document.querySelector('.loading-page');
            const contentContainer = document.querySelector('.container');

            loadingPage.classList.add('hidden');
            contentContainer.classList.remove('hidden');
        });

        document.addEventListener('DOMContentLoaded', function() {
            const darkModeToggle = document.getElementById('dark-mode-toggle');
            const body = document.body;
            function setTheme(isDarkMode) {
                if (isDarkMode) {
                    body.classList.add('dark-mode');
                    darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
                    document.getElementById('avatar-img').src = './icon/350083.png';
                } else {
                    body.classList.remove('dark-mode');
                    darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
                    document.getElementById('avatar-img').src = './icon/thumb-344733.png';
                }
            }

            const prefersDarkQuery = window.matchMedia('(prefers-color-scheme: dark)');
            prefersDarkQuery.addEventListener('change', (e) => {
                if (!localStorage.getItem('theme')) {
                    setTheme(e.matches);
                }
            });

            let curruentTheme = localStorage.getItem('theme');

            if (curruentTheme === null) {
                curruentTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            }

            setTheme(curruentTheme === 'dark');

            darkModeToggle.addEventListener('click', () => {
                body.classList.toggle('dark-mode');
                darkModeToggle.classList.toggle('dark-mode');
                darkModeToggle.innerHTML = body.classList.contains('dark-mode') ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
                const isDarkModeEnabled = body.classList.contains('dark-mode');
                localStorage.setItem('darkMode', isDarkModeEnabled);
                document.getElementById('avatar-img').src = isDarkModeEnabled ? './icon/350083.png' : './icon/thumb-344733.png';
            });
        });