document.addEventListener('DOMContentLoaded', () => {
    const USERNAME = 'Trifalic47';
    
    // --- Language Colors ---
    const LANG_COLORS = {
        'C': '#555599',
        'Python': '#3572A5',
        'JavaScript': '#f1e05a',
        'TypeScript': '#2b7489',
        'Shell': '#89e051',
        'Rust': '#dea584',
        'HTML': '#e34c26',
        'CSS': '#563d7c',
        'Go': '#00ADD8'
    };

    // --- Boot Sequence ---
    const bootScreen = document.getElementById('boot-screen');
    const bootLines = [
        { text: '[  OK  ] Initializing kernel...', delay: 100 },
        { text: '[  OK  ] Setting up environment...', delay: 250 },
        { text: '[  OK  ] Mounting /proc and /sys...', delay: 400 },
        { text: '[  OK  ] Starting network protocol...', delay: 550 },
        { text: '[ WARN ] Human detected in proximity...', delay: 800 },
        { text: '[  OK  ] Bypassing bio-security...', delay: 1000 },
        { text: '[  OK  ] Loading user profile: ' + USERNAME, delay: 1200 },
        { text: '[  OK  ] Access granted. Welcome back.', delay: 1400 }
    ];

    bootLines.forEach((line, index) => {
        const el = document.createElement('div');
        el.className = 'boot-line';
        el.innerHTML = line.text
            .replace('[  OK  ]', '<span class="ok">[  OK  ]</span>')
            .replace('[ WARN ]', '<span class="warn">[ WARN ]</span>');
        bootScreen.appendChild(el);
        setTimeout(() => el.classList.add('visible'), line.delay);
    });

    setTimeout(() => {
        bootScreen.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        bootScreen.style.opacity = '0';
        bootScreen.style.transform = 'scale(1.1)';
        setTimeout(() => bootScreen.style.display = 'none', 600);
    }, 1800);

    // --- Typewriter Effect ---
    async function typewriter(element, text, speed = 50) {
        if (!element) return;
        element.innerHTML = '';
        for (let i = 0; i < text.length; i++) {
            element.innerHTML += text.charAt(i);
            await new Promise(r => setTimeout(r, speed));
        }
    }

    // --- Fetch GitHub Data ---
    async function fetchGitHub() {
        try {
            const profileRes = await fetch(`https://api.github.com/users/${USERNAME}`);
            if (!profileRes.ok) throw new Error('GitHub Profile Failed');
            const profile = await profileRes.json();

            // Update UI
            const profileImg = document.getElementById('profile-img');
            if (profileImg) profileImg.src = profile.avatar_url;
            
            const ghLink = document.getElementById('gh-link');
            if (ghLink) {
                ghLink.innerText = `github.com/${USERNAME}`;
                ghLink.href = profile.html_url;
            }

            const contactList = document.getElementById('contact-list');
            
            function addContactLink(provider, url) {
                if (!contactList) return;
                const li = document.createElement('li');
                li.className = 'contact-item reveal';
                const displayUrl = url.replace(/https?:\/\//, '').replace(/\/$/, '');
                li.innerHTML = `
                    <span class="cmd-prefix">$</span>connect --${provider.toLowerCase()} <span class="arrow">→</span>
                    <a href="${url}" target="_blank">${displayUrl}</a>
                `;
                contactList.appendChild(li);
            }

            // Fetch additional social accounts
            try {
                const socialRes = await fetch(`https://api.github.com/users/${USERNAME}/social_accounts`);
                if (socialRes.ok) {
                    const socials = await socialRes.json();
                    socials.forEach(s => {
                        // Skip if it's already rendered or redundant (like github link)
                        if (s.provider === 'github') return;
                        
                        let providerName = s.provider;
                        if (s.provider === 'generic') {
                            if (s.url.includes('dev.to')) providerName = 'dev.to';
                            else if (s.url.includes('linkedin')) providerName = 'linkedin';
                            else providerName = 'web';
                        }
                        addContactLink(providerName, s.url);
                    });
                }
            } catch (e) { console.error('Socials failed', e); }

            if (profile.blog && !Array.from(contactList.querySelectorAll('a')).some(a => a.href.includes(profile.blog))) {
                addContactLink('blog', profile.blog.startsWith('http') ? profile.blog : `https://${profile.blog}`);
            }

            if (profile.twitter_username) {
                addContactLink('twitter', `https://twitter.com/${profile.twitter_username}`);
            }

            // Hero Stats
            const motd = document.getElementById('motd-content');
            const uptime = document.getElementById('uptime-content');
            if (motd) motd.innerText = profile.bio || 'Security Researcher & Developer';
            if (uptime) uptime.innerHTML = `${profile.public_repos} repos · ${profile.followers} followers · online <span class="cursor"></span>`;
            
            // Type tagline
            typewriter(document.getElementById('hero-tagline'), profile.bio || 'Binary exploitation and memory corruption specialist.', 40);

            // Bio Typewriter (Slower for bio)
            const bioText = document.getElementById('bio-text');
            const bioObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !entry.target.dataset.typed) {
                        typewriter(entry.target, profile.bio || 'Hacker at heart, building secure systems and breaking insecure ones.', 60);
                        entry.target.dataset.typed = 'true';
                    }
                });
            }, { threshold: 0.5 });
            if (bioText) bioObserver.observe(bioText);

            // Repos
            const reposRes = await fetch(`https://api.github.com/users/${USERNAME}/repos?sort=updated&per_page=100`);
            if (!reposRes.ok) throw new Error('GitHub Repos Failed');
            const repos = await reposRes.json();
            
            const filteredRepos = repos
                .filter(r => !r.fork)
                .sort((a, b) => b.stargazers_count - a.stargazers_count);

            const reposContainer = document.getElementById('repos-container');
            if (reposContainer) {
                reposContainer.innerHTML = '';
                filteredRepos.forEach(repo => {
                    const card = document.createElement('div');
                    card.className = 'terminal-card reveal';
                    
                    const langColor = LANG_COLORS[repo.language] || '#888';
                    
                    card.innerHTML = `
                        <div class="terminal-header">
                            <div class="terminal-dots">
                                <div class="dot red"></div>
                                <div class="dot yellow"></div>
                                <div class="dot green"></div>
                            </div>
                            <div class="terminal-title">bash — ~/projects/${repo.name}</div>
                        </div>
                        <div class="terminal-body">
                            <h3>${repo.name}</h3>
                            <p>${repo.description || 'No description provided.'}</p>
                            <div class="repo-meta">
                                <div class="lang-badge">
                                    <span class="lang-dot" style="background-color: ${langColor}"></span>
                                    <span>${repo.language || 'Unknown'}</span>
                                </div>
                                <span>★ ${repo.stargazers_count}</span>
                                <a href="${repo.html_url}" target="_blank" class="repo-link">[visit &rarr;]</a>
                            </div>
                        </div>
                    `;
                    reposContainer.appendChild(card);
                });
            }

            refreshReveals();

        } catch (err) {
            console.error(err);
            const container = document.getElementById('repos-container');
            if (container) container.innerHTML = `<p style="color:var(--accent-red)">[ERROR] Failed to fetch data from GitHub. Signals lost.</p>`;
        }
    }

    // --- Reveal on Scroll ---
    function refreshReveals() {
        const reveals = document.querySelectorAll('.reveal');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, { threshold: 0.1 });
        
        reveals.forEach(el => observer.observe(el));
    }

    // --- Init ---
    fetchGitHub();
    
    // Debounce scroll
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(refreshReveals, 100);
    });
});
