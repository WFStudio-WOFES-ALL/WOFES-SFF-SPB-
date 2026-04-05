class WOFESBrowser {
    constructor() {
        this.config = this.loadConfig();
        this.tabs = new Map();
        this.currentTab = null;
        this.widgets = [];
        this.quickLinks = [];
        this.smartButtons = [];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateClock();
        this.loadQuickLinks();
        this.loadNews();
        this.checkVPNStatus();
        this.applyTheme();
        this.startAnimatedPlaceholder();
        
        setInterval(() => this.updateClock(), 1000);
        setInterval(() => this.loadNews(), 6 * 60 * 60 * 1000);
    }

    setupEventListeners() {
        const searchInput = document.getElementById('search-input');
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch(e.target.value);
            }
        });

        searchInput.addEventListener('focus', () => {
            document.getElementById('animated-placeholder').style.display = 'none';
        });

        searchInput.addEventListener('blur', () => {
            if (!searchInput.value) {
                document.getElementById('animated-placeholder').style.display = 'block';
            }
        });

        document.getElementById('vpn-toggle').addEventListener('click', () => {
            document.getElementById('vpn-dropdown').classList.toggle('active');
        });

        document.querySelector('.account-avatar').addEventListener('click', () => {
            document.getElementById('account-dropdown').classList.toggle('active');
        });

        document.getElementById('dev-toggle').addEventListener('click', () => {
            document.getElementById('dev-dropdown').classList.toggle('active');
        });

        document.getElementById('additional-actions').addEventListener('click', () => {
            document.getElementById('additional-menu').classList.toggle('active');
        });

        document.getElementById('new-tab').addEventListener('click', () => {
            this.createTab();
        });

        document.getElementById('refresh-news').addEventListener('click', () => {
            this.loadNews();
        });

        document.getElementById('vpn-enabled').addEventListener('change', (e) => {
            this.toggleVPN(e.target.checked);
        });

        document.getElementById('custom-dns').addEventListener('change', (e) => {
            document.getElementById('dns-address').disabled = !e.target.checked;
            if (e.target.checked) {
                this.setCustomDNS(document.getElementById('dns-address').value);
            }
        });

        document.getElementById('anti-screenshot').addEventListener('change', (e) => {
            this.setAntiScreenshot(e.target.checked);
        });

        document.getElementById('anti-capture').addEventListener('change', (e) => {
            this.setAntiCapture(e.target.checked);
        });

        document.getElementById('view-source').addEventListener('click', () => {
            this.viewPageSource();
        });

        document.getElementById('edit-page').addEventListener('click', () => {
            this.editPageTemporarily();
        });

        document.getElementById('reset-interface').addEventListener('click', () => {
            if (confirm('Reset all interface changes? This cannot be undone.')) {
                this.resetInterface();
            }
        });

        document.getElementById('delete-all').addEventListener('click', () => {
            if (confirm('Delete all data? This cannot be undone.')) {
                this.deleteAllData();
            }
        });

        document.getElementById('clear-history-dev').addEventListener('click', () => {
            this.clearHistory();
        });

        document.querySelectorAll('.quick-link').forEach(link => {
            link.addEventListener('click', (e) => {
                this.handleQuickLink(e.currentTarget);
            });
            
            link.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.editQuickLink(e.currentTarget);
            });
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.account-menu')) {
                document.getElementById('account-dropdown').classList.remove('active');
            }
            if (!e.target.closest('.vpn-panel')) {
                document.getElementById('vpn-dropdown').classList.remove('active');
            }
            if (!e.target.closest('.dev-panel')) {
                document.getElementById('dev-dropdown').classList.remove('active');
            }
        });

        this.setupCustomizationListeners();
    }

    setupCustomizationListeners() {
        document.getElementById('color-primary').addEventListener('change', (e) => {
            document.documentElement.style.setProperty('--primary-color', e.target.value);
            this.saveConfig();
        });

        document.getElementById('color-background').addEventListener('change', (e) => {
            document.documentElement.style.setProperty('--background-color', e.target.value);
            this.saveConfig();
        });

        document.getElementById('color-text').addEventListener('change', (e) => {
            document.documentElement.style.setProperty('--text-color', e.target.value);
            this.saveConfig();
        });

        document.getElementById('transparency').addEventListener('input', (e) => {
            const value = e.target.value / 100;
            document.documentElement.style.setProperty('--transparency', value);
            this.saveConfig();
        });

        document.getElementById('corner-text-input').addEventListener('input', (e) => {
            document.getElementById('corner-text').textContent = e.target.value;
            this.saveConfig();
        });

        document.getElementById('wallpaper-upload').addEventListener('change', (e) => {
            this.handleWallpaperUpload(e.target.files[0]);
        });

        document.getElementById('default-wallpaper').addEventListener('click', () => {
            document.body.style.backgroundImage = "url('assets/raindrops.jpg')";
            this.saveConfig();
        });
    }

    updateClock() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        });
        const dateStr = now.toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric' 
        });

        document.getElementById('current-time').textContent = timeStr;
        document.getElementById('current-date').textContent = dateStr;
    }

    startAnimatedPlaceholder() {
        const placeholders = [
            'Write something down...',
            'Search the web...',
            'Type a command...'
        ];
        let index = 0;
        
        setInterval(() => {
            const placeholder = document.getElementById('animated-placeholder');
            placeholder.style.opacity = '0';
            
            setTimeout(() => {
                index = (index + 1) % placeholders.length;
                placeholder.textContent = placeholders[index];
                placeholder.style.opacity = '0.5';
            }, 500);
        }, 3000);
    }

    handleSearch(query) {
        if (!query.trim()) return;

        let url = query;
        
        if (!query.includes('.') && !query.startsWith('http')) {
            url = 'https://duckduckgo.com/?q=' + encodeURIComponent(query);
        } else if (!query.startsWith('http')) {
            url = 'https://' + query;
        }

        if (query.endsWith('.onion')) {
            this.ensureTorEnabled();
        }

        this.navigate(url);
    }

    navigate(url) {
        const homeScreen = document.getElementById('home-screen');
        const browserContent = document.getElementById('browser-content');
        const contentFrame = document.getElementById('content-frame');

        homeScreen.style.display = 'none';
        browserContent.classList.add('active');

        if (this.config.privacy.anti_screenshot) {
            contentFrame.style.filter = 'blur(0px)';
        }

        contentFrame.src = this.processURL(url);

        if (this.currentTab) {
            this.tabs.get(this.currentTab).url = url;
            this.tabs.get(this.currentTab).title = new URL(url).hostname;
            this.updateTabDisplay(this.currentTab);
        }
    }

    processURL(url) {
        if (url.includes('.onion')) {
            return this.routeThroughTor(url);
        }
        
        if (this.config.network.vpn_enabled) {
            return this.routeThroughVPN(url);
        }

        return url;
    }

    routeThroughTor(url) {
        return '/proxy/tor/' + encodeURIComponent(url);
    }

    routeThroughVPN(url) {
        return '/proxy/vpn/' + encodeURIComponent(url);
    }

    ensureTorEnabled() {
        fetch('/api/tor/status')
            .then(r => r.json())
            .then(data => {
                if (!data.enabled) {
                    fetch('/api/tor/start', { method: 'POST' });
                }
            });
    }

    createTab(url = null) {
        const tabId = 'tab-' + Date.now();
        const tab = {
            id: tabId,
            url: url || 'about:blank',
            title: 'New Tab',
            created: new Date()
        };

        this.tabs.set(tabId, tab);
        this.addTabToUI(tab);
        this.switchTab(tabId);
    }

    addTabToUI(tab) {
        const container = document.getElementById('tabs-container');
        const tabEl = document.createElement('div');
        tabEl.className = 'tab';
        tabEl.dataset.tabId = tab.id;
        
        tabEl.innerHTML = `
            <span class="tab-icon">W</span>
            <span class="tab-title">${tab.title}</span>
            <button class="tab-close">×</button>
        `;

        tabEl.addEventListener('click', (e) => {
            if (!e.target.classList.contains('tab-close')) {
                this.switchTab(tab.id);
            }
        });

        tabEl.querySelector('.tab-close').addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeTab(tab.id);
        });

        container.appendChild(tabEl);
    }

    switchTab(tabId) {
        this.currentTab = tabId;
        
        document.querySelectorAll('.tab').forEach(t => {
            t.classList.remove('active');
        });
        
        const tabEl = document.querySelector(`[data-tab-id="${tabId}"]`);
        if (tabEl) {
            tabEl.classList.add('active');
        }

        const tab = this.tabs.get(tabId);
        if (tab && tab.url !== 'about:blank') {
            this.navigate(tab.url);
        } else {
            document.getElementById('home-screen').style.display = 'flex';
            document.getElementById('browser-content').classList.remove('active');
        }
    }

    closeTab(tabId) {
        this.tabs.delete(tabId);
        const tabEl = document.querySelector(`[data-tab-id="${tabId}"]`);
        if (tabEl) {
            tabEl.remove();
        }

        if (this.currentTab === tabId) {
            const remainingTabs = Array.from(this.tabs.keys());
            if (remainingTabs.length > 0) {
                this.switchTab(remainingTabs[0]);
            } else {
                this.createTab();
            }
        }
    }

    updateTabDisplay(tabId) {
        const tab = this.tabs.get(tabId);
        const tabEl = document.querySelector(`[data-tab-id="${tabId}"]`);
        
        if (tab && tabEl) {
            tabEl.querySelector('.tab-title').textContent = tab.title;
        }
    }

    loadQuickLinks() {
        const saved = localStorage.getItem('quickLinks');
        if (saved) {
            this.quickLinks = JSON.parse(saved);
            this.renderQuickLinks();
        }
    }

    renderQuickLinks() {
        const container = document.getElementById('quick-links');
        container.innerHTML = '';

        this.quickLinks.forEach((link, index) => {
            const linkEl = document.createElement('div');
            linkEl.className = 'quick-link';
            linkEl.dataset.id = link.id;
            
            linkEl.innerHTML = `
                <div class="link-icon">${link.icon || link.name[0]}</div>
                <div class="link-name">${link.name}</div>
            `;

            linkEl.addEventListener('click', () => {
                this.navigate(link.url);
            });

            container.appendChild(linkEl);
        });

        for (let i = this.quickLinks.length; i < 5; i++) {
            const linkEl = document.createElement('div');
            linkEl.className = 'quick-link';
            linkEl.innerHTML = `
                <div class="link-icon">+</div>
                <div class="link-name">Add</div>
            `;
            linkEl.addEventListener('click', () => this.addQuickLink());
            container.appendChild(linkEl);
        }
    }

    addQuickLink() {
        const name = prompt('Enter link name:');
        if (!name) return;
        
        const url = prompt('Enter URL:');
        if (!url) return;

        const link = {
            id: Date.now().toString(),
            name: name,
            url: url,
            icon: name[0].toUpperCase()
        };

        this.quickLinks.push(link);
        localStorage.setItem('quickLinks', JSON.stringify(this.quickLinks));
        this.renderQuickLinks();
    }

    async loadNews() {
        const newsItems = document.getElementById('news-items');
        newsItems.innerHTML = '<div class="news-item"><span class="news-title">Loading news...</span></div>';

        try {
            const response = await fetch('/api/news');
            const news = await response.json();
            
            newsItems.innerHTML = '';
            news.forEach(item => {
                const newsEl = document.createElement('div');
                newsEl.className = 'news-item';
                newsEl.innerHTML = `
                    <span class="news-time">${item.time}</span>
                    <span class="news-title">${item.title}</span>
                `;
                newsEl.addEventListener('click', () => this.navigate(item.url));
                newsItems.appendChild(newsEl);
            });
        } catch (error) {
            newsItems.innerHTML = '<div class="news-item"><span class="news-title">Failed to load news</span></div>';
        }
    }

    async checkVPNStatus() {
        try {
            const response = await fetch('/api/network/ip');
            const data = await response.json();
            document.getElementById('current-ip').textContent = data.ip;
        } catch (error) {
            document.getElementById('current-ip').textContent = 'Unknown';
        }
    }

    async toggleVPN(enabled) {
        const server = document.getElementById('vpn-server').value;
        const protocol = document.getElementById('vpn-protocol').value;

        if (enabled && !server) {
            alert('Please select a VPN server');
            document.getElementById('vpn-enabled').checked = false;
            return;
        }

        try {
            const response = await fetch('/api/vpn/' + (enabled ? 'connect' : 'disconnect'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ server, protocol })
            });

            if (response.ok) {
                this.config.network.vpn_enabled = enabled;
                this.saveConfig();
                this.checkVPNStatus();
            }
        } catch (error) {
            alert('VPN operation failed');
        }
    }

    async setCustomDNS(dns) {
        try {
            await fetch('/api/network/dns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dns: dns.split(',').map(s => s.trim()) })
            });
        } catch (error) {
            console.error('Failed to set DNS:', error);
        }
    }

    setAntiScreenshot(enabled) {
        this.config.privacy.anti_screenshot = enabled;
        this.saveConfig();
        
        fetch('/api/privacy/anti-screenshot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ enabled })
        });
    }

    setAntiCapture(enabled) {
        this.config.privacy.anti_capture = enabled;
        this.saveConfig();
        
        fetch('/api/privacy/anti-capture', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ enabled })
        });
    }

    viewPageSource() {
        const iframe = document.getElementById('content-frame');
        try {
            const source = iframe.contentDocument.documentElement.outerHTML;
            const newWindow = window.open();
            newWindow.document.write('<pre>' + this.escapeHtml(source) + '</pre>');
        } catch (error) {
            alert('Cannot view source for this page due to security restrictions');
        }
    }

    editPageTemporarily() {
        const iframe = document.getElementById('content-frame');
        try {
            iframe.contentDocument.designMode = 'on';
        } catch (error) {
            alert('Cannot edit this page due to security restrictions');
        }
    }

    clearHistory() {
        if (confirm('Clear all browsing history?')) {
            fetch('/api/history/clear', { method: 'POST' })
                .then(() => alert('History cleared'));
        }
    }

    resetInterface() {
        localStorage.clear();
        location.reload();
    }

    deleteAllData() {
        fetch('/api/data/delete-all', { method: 'POST' })
            .then(() => {
                localStorage.clear();
                location.reload();
            });
    }

    handleWallpaperUpload(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            document.body.style.backgroundImage = `url(${e.target.result})`;
            localStorage.setItem('wallpaper', e.target.result);
        };
        reader.readAsDataURL(file);
    }

    loadConfig() {
        const saved = localStorage.getItem('config');
        if (saved) {
            return JSON.parse(saved);
        }
        
        return {
            privacy: {
                anti_screenshot: true,
                anti_capture: true,
                block_webrtc: true
            },
            network: {
                vpn_enabled: false,
                custom_dns: null
            },
            ui: {
                theme: {
                    primary: '#1a1a1a',
                    background: '#0a0a0a',
                    text: '#ffffff'
                }
            }
        };
    }

    saveConfig() {
        localStorage.setItem('config', JSON.stringify(this.config));
    }

    applyTheme() {
        const wallpaper = localStorage.getItem('wallpaper');
        if (wallpaper) {
            document.body.style.backgroundImage = `url(${wallpaper})`;
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

const browser = new WOFESBrowser();

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
}
