const { useState, useEffect, useRef } = React;

const WOFESBrowser = () => {
    const [config, setConfig] = useState({
        wallpaper: 'raindrop_glass',
        primaryColor: '#1a1a2e',
        textColor: '#eaeaea',
        cornerText: 'WOFES SFF',
        antiScreenshot: false,
        vpnEnabled: false,
        torEnabled: true,
        customDns: false,
        dnsServers: ['1.1.1.1', '1.0.0.1'],
    });

    const [tabs, setTabs] = useState([
        { id: 1, title: 'New Tab', url: '', active: true }
    ]);

    const [quickLinks, setQuickLinks] = useState([
        { id: 1, name: '', url: '', icon: '' },
        { id: 2, name: '', url: '', icon: '' },
        { id: 3, name: '', url: '', icon: '' },
        { id: 4, name: '', url: '', icon: '' },
        { id: 5, name: '', url: '', icon: '' },
    ]);

    const [time, setTime] = useState(new Date());
    const [searchPlaceholder, setSearchPlaceholder] = useState(0);
    const [showDevPanel, setShowDevPanel] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showVpnPanel, setShowVpnPanel] = useState(false);
    const [customizeMode, setCustomizeMode] = useState(false);
    const [currentIp, setCurrentIp] = useState('Loading...');
    const [news, setNews] = useState([]);

    const placeholders = [
        "Write something down...",
        "Search the web...",
        "Type a command...",
        "Enter .onion address...",
        "Browse anonymously..."
    ];

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const placeholderTimer = setInterval(() => {
            setSearchPlaceholder((prev) => (prev + 1) % placeholders.length);
        }, 3000);
        return () => clearInterval(placeholderTimer);
    }, []);

    useEffect(() => {
        if (config.antiScreenshot) {
            document.body.style.userSelect = 'none';
            document.body.style.webkitUserSelect = 'none';
        } else {
            document.body.style.userSelect = 'auto';
            document.body.style.webkitUserSelect = 'auto';
        }
    }, [config.antiScreenshot]);

    const formatTime = () => {
        return time.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        });
    };

    const formatDate = () => {
        return time.toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric',
            year: 'numeric'
        });
    };

    const handleSearch = (query) => {
        if (!query.trim()) return;
        
        let url = query;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            if (url.includes('.onion')) {
                url = 'http://' + url;
            } else if (url.includes('.')) {
                url = 'https://' + url;
            } else {
                url = 'https://duckduckgo.com/?q=' + encodeURIComponent(query);
            }
        }

        const activeTab = tabs.find(t => t.active);
        if (activeTab) {
            setTabs(tabs.map(t => 
                t.id === activeTab.id ? { ...t, url, title: query } : t
            ));
        }
    };

    const createNewTab = () => {
        const newTab = {
            id: Date.now(),
            title: 'New Tab',
            url: '',
            active: false
        };
        setTabs([...tabs.map(t => ({ ...t, active: false })), { ...newTab, active: true }]);
    };

    const closeTab = (tabId) => {
        if (tabs.length === 1) return;
        const tabIndex = tabs.findIndex(t => t.id === tabId);
        const newTabs = tabs.filter(t => t.id !== tabId);
        
        if (tabs[tabIndex].active && newTabs.length > 0) {
            const newActiveIndex = Math.min(tabIndex, newTabs.length - 1);
            newTabs[newActiveIndex].active = true;
        }
        
        setTabs(newTabs);
    };

    const switchTab = (tabId) => {
        setTabs(tabs.map(t => ({ ...t, active: t.id === tabId })));
    };

    const toggleVpn = () => {
        setConfig({ ...config, vpnEnabled: !config.vpnEnabled });
    };

    const toggleDns = () => {
        setConfig({ ...config, customDns: !config.customDns });
    };

    const toggleAntiScreenshot = () => {
        setConfig({ ...config, antiScreenshot: !config.antiScreenshot });
    };

    const clearHistory = () => {
        if (confirm('Are you sure you want to clear all browsing history?')) {
            console.log('History cleared');
        }
    };

    return (
        <div style={styles.container}>
            <div 
                style={{
                    ...styles.wallpaper,
                    backgroundImage: config.wallpaper === 'raindrop_glass' 
                        ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
                        : `url(${config.wallpaper})`
                }}
            />
            
            <div style={styles.cornerText}>{config.cornerText}</div>

            <div style={styles.tabBar}>
                {tabs.map(tab => (
                    <div 
                        key={tab.id}
                        style={{
                            ...styles.tab,
                            ...(tab.active ? styles.tabActive : {})
                        }}
                        onClick={() => switchTab(tab.id)}
                    >
                        <span style={styles.tabTitle}>{tab.title}</span>
                        {tabs.length > 1 && (
                            <button 
                                style={styles.tabClose}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    closeTab(tab.id);
                                }}
                            >
                                ×
                            </button>
                        )}
                    </div>
                ))}
                <button style={styles.newTabButton} onClick={createNewTab}>+</button>
            </div>

            {tabs.find(t => t.active)?.url ? (
                <div style={styles.browserView}>
                    <div style={styles.addressBar}>
                        <input
                            type="text"
                            value={tabs.find(t => t.active)?.url || ''}
                            onChange={(e) => {
                                const activeTab = tabs.find(t => t.active);
                                setTabs(tabs.map(t => 
                                    t.id === activeTab.id ? { ...t, url: e.target.value } : t
                                ));
                            }}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleSearch(e.target.value);
                                }
                            }}
                            style={styles.addressInput}
                        />
                    </div>
                    <iframe
                        src={tabs.find(t => t.active)?.url}
                        style={styles.iframe}
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                    />
                </div>
            ) : (
                <div style={styles.homeScreen}>
                    <div style={styles.clockContainer}>
                        <div style={styles.clock}>{formatTime()}</div>
                        <div style={styles.date}>{formatDate()}</div>
                    </div>

                    <div style={styles.searchContainer}>
                        <div style={styles.searchBox}>
                            <span style={styles.searchIcon}>W</span>
                            <input
                                type="text"
                                style={styles.searchInput}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSearch(e.target.value);
                                    }
                                }}
                            />
                            <span style={styles.placeholderAnimated}>
                                {placeholders[searchPlaceholder]}
                            </span>
                        </div>
                    </div>

                    <div style={styles.quickLinks}>
                        {quickLinks.map(link => (
                            <div key={link.id} style={styles.quickLink}>
                                <div style={styles.quickLinkIcon}>
                                    {link.icon || '+'}
                                </div>
                                <div style={styles.quickLinkName}>
                                    {link.name || 'Add site'}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={styles.newsSection}>
                        <div style={styles.newsHeader}>
                            <span>Latest News</span>
                            <button style={styles.refreshButton}>⟳</button>
                        </div>
                        <div style={styles.newsContent}>
                            {news.length === 0 ? (
                                <p style={styles.newsPlaceholder}>No news loaded yet</p>
                            ) : (
                                news.map((item, index) => (
                                    <div key={index} style={styles.newsItem}>
                                        {item.title}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            <button 
                style={styles.devButton}
                onClick={() => setShowDevPanel(!showDevPanel)}
            >
                Developer Panel
            </button>

            {showDevPanel && (
                <div style={styles.devPanel}>
                    <button style={styles.devPanelButton}>View page source</button>
                    <button style={styles.devPanelButton}>Edit page temporarily</button>
                    <button style={styles.devPanelButton}>View actions</button>
                    <div style={styles.devPanelDivider} />
                    <button style={styles.devPanelButton}>Additional actions ▼</button>
                    <button style={styles.devPanelButton} onClick={clearHistory}>
                        Clear history
                    </button>
                    <button style={styles.devPanelButton}>Reset all interface changes</button>
                </div>
            )}

            <button 
                style={styles.vpnButton}
                onClick={() => setShowVpnPanel(!showVpnPanel)}
            >
                {config.vpnEnabled ? '🔒 VPN ON' : '🔓 VPN OFF'}
            </button>

            {showVpnPanel && (
                <div style={styles.vpnPanel}>
                    <div style={styles.vpnPanelHeader}>VPN & DNS Settings</div>
                    <div style={styles.vpnPanelItem}>
                        <span>VPN Status</span>
                        <button 
                            style={styles.toggleButton}
                            onClick={toggleVpn}
                        >
                            {config.vpnEnabled ? 'ON' : 'OFF'}
                        </button>
                    </div>
                    <div style={styles.vpnPanelItem}>
                        <span>Tor Network</span>
                        <button style={styles.toggleButton}>
                            {config.torEnabled ? 'ON' : 'OFF'}
                        </button>
                    </div>
                    <div style={styles.vpnPanelItem}>
                        <span>Custom DNS</span>
                        <button 
                            style={styles.toggleButton}
                            onClick={toggleDns}
                        >
                            {config.customDns ? 'ON' : 'OFF'}
                        </button>
                    </div>
                    <div style={styles.vpnPanelItem}>
                        <span>Current IP</span>
                        <span style={styles.ipAddress}>{currentIp}</span>
                    </div>
                    <button style={styles.vpnPanelButton}>Full VPN Settings</button>
                </div>
            )}

            <div 
                style={styles.settingsButton}
                onClick={() => setShowSettings(!showSettings)}
            >
                ⚙
            </div>

            {showSettings && (
                <div style={styles.settingsPanel}>
                    <div style={styles.settingsPanelHeader}>Account & Privacy</div>
                    <button style={styles.settingsItem}>Sign in with Google</button>
                    <button style={styles.settingsItem}>Sign in with GitHub</button>
                    <div style={styles.settingsDivider} />
                    <div style={styles.settingsItem}>
                        <span>Anti-screenshot</span>
                        <button 
                            style={styles.toggleButton}
                            onClick={toggleAntiScreenshot}
                        >
                            {config.antiScreenshot ? 'ON' : 'OFF'}
                        </button>
                    </div>
                    <div style={styles.settingsItem}>
                        <span>Anti-screen capture</span>
                        <button style={styles.toggleButton}>OFF</button>
                    </div>
                    <div style={styles.settingsDivider} />
                    <button style={styles.settingsItem} onClick={clearHistory}>
                        Delete browser history
                    </button>
                    <button style={styles.settingsItem}>Delete account</button>
                    <button style={styles.settingsItem}>Sign out</button>
                </div>
            )}

            <button 
                style={styles.customizeButton}
                onClick={() => setCustomizeMode(!customizeMode)}
            >
                Customize
            </button>

            {customizeMode && (
                <div style={styles.customizePanel}>
                    <div style={styles.customizePanelHeader}>Customization Mode</div>
                    <p style={styles.customizeInfo}>
                        Drag and drop elements, change colors, create widgets
                    </p>
                    <button style={styles.customizeOption}>Change wallpaper</button>
                    <button style={styles.customizeOption}>Edit corner text</button>
                    <button style={styles.customizeOption}>Customize colors</button>
                    <button style={styles.customizeOption}>Add widgets</button>
                    <button style={styles.customizeOption}>Edit quick links</button>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        width: '100vw',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
    },
    wallpaper: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        zIndex: -1,
    },
    cornerText: {
        position: 'fixed',
        top: '20px',
        left: '20px',
        fontSize: '24px',
        fontWeight: '800',
        color: 'rgba(255, 255, 255, 0.9)',
        letterSpacing: '3px',
        zIndex: 100,
        textShadow: '2px 2px 8px rgba(0, 0, 0, 0.5)',
    },
    tabBar: {
        display: 'flex',
        gap: '4px',
        padding: '8px',
        background: 'rgba(26, 26, 46, 0.7)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    },
    tab: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '8px 8px 0 0',
        cursor: 'pointer',
        transition: 'all 0.2s',
        minWidth: '150px',
        maxWidth: '200px',
    },
    tabActive: {
        background: 'rgba(255, 255, 255, 0.1)',
        borderBottom: '2px solid #4a5e7a',
    },
    tabTitle: {
        flex: 1,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        fontSize: '14px',
    },
    tabClose: {
        background: 'none',
        border: 'none',
        color: '#eaeaea',
        fontSize: '20px',
        cursor: 'pointer',
        padding: '0 4px',
        opacity: 0.7,
    },
    newTabButton: {
        padding: '8px 16px',
        background: 'rgba(255, 255, 255, 0.05)',
        border: 'none',
        borderRadius: '8px 8px 0 0',
        color: '#eaeaea',
        fontSize: '18px',
        cursor: 'pointer',
    },
    homeScreen: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '80px',
        height: 'calc(100vh - 60px)',
        overflow: 'auto',
    },
    clockContainer: {
        textAlign: 'center',
        marginBottom: '30px',
    },
    clock: {
        fontSize: '72px',
        fontWeight: '300',
        letterSpacing: '2px',
        textShadow: '2px 2px 12px rgba(0, 0, 0, 0.5)',
    },
    date: {
        fontSize: '16px',
        color: 'rgba(234, 234, 234, 0.7)',
        marginTop: '8px',
    },
    searchContainer: {
        width: '100%',
        maxWidth: '600px',
        marginBottom: '50px',
        padding: '0 20px',
    },
    searchBox: {
        position: 'relative',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '50px',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    searchIcon: {
        fontSize: '24px',
        fontWeight: '900',
        color: '#eaeaea',
    },
    searchInput: {
        flex: 1,
        background: 'none',
        border: 'none',
        outline: 'none',
        color: '#eaeaea',
        fontSize: '16px',
        zIndex: 2,
    },
    placeholderAnimated: {
        position: 'absolute',
        left: '60px',
        color: 'rgba(234, 234, 234, 0.4)',
        fontSize: '16px',
        pointerEvents: 'none',
        animation: 'fadeInOut 3s ease-in-out infinite',
    },
    quickLinks: {
        display: 'flex',
        gap: '30px',
        marginBottom: '50px',
    },
    quickLink: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
        transition: 'transform 0.2s',
    },
    quickLinkIcon: {
        width: '60px',
        height: '60px',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        marginBottom: '8px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    quickLinkName: {
        fontSize: '12px',
        color: 'rgba(234, 234, 234, 0.7)',
    },
    newsSection: {
        width: '100%',
        maxWidth: '800px',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '20px',
        margin: '0 20px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
    },
    newsHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        fontSize: '18px',
        fontWeight: '600',
    },
    refreshButton: {
        background: 'none',
        border: 'none',
        color: '#eaeaea',
        fontSize: '20px',
        cursor: 'pointer',
    },
    newsContent: {
        minHeight: '100px',
    },
    newsPlaceholder: {
        color: 'rgba(234, 234, 234, 0.5)',
        textAlign: 'center',
        padding: '20px',
    },
    newsItem: {
        padding: '12px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    },
    browserView: {
        height: 'calc(100vh - 60px)',
        display: 'flex',
        flexDirection: 'column',
    },
    addressBar: {
        padding: '12px',
        background: 'rgba(26, 26, 46, 0.9)',
        backdropFilter: 'blur(10px)',
    },
    addressInput: {
        width: '100%',
        padding: '12px 20px',
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '8px',
        color: '#eaeaea',
        fontSize: '14px',
        outline: 'none',
    },
    iframe: {
        flex: 1,
        border: 'none',
        width: '100%',
    },
    devButton: {
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        padding: '12px 20px',
        background: 'rgba(74, 94, 122, 0.9)',
        backdropFilter: 'blur(10px)',
        border: 'none',
        borderRadius: '8px',
        color: '#eaeaea',
        cursor: 'pointer',
        fontSize: '14px',
    },
    devPanel: {
        position: 'fixed',
        bottom: '70px',
        left: '20px',
        background: 'rgba(26, 26, 46, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '12px',
        padding: '12px',
        minWidth: '250px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    devPanelButton: {
        width: '100%',
        padding: '10px',
        background: 'none',
        border: 'none',
        color: '#eaeaea',
        textAlign: 'left',
        cursor: 'pointer',
        borderRadius: '6px',
        fontSize: '14px',
    },
    devPanelDivider: {
        height: '1px',
        background: 'rgba(255, 255, 255, 0.1)',
        margin: '8px 0',
    },
    vpnButton: {
        position: 'fixed',
        top: '70px',
        right: '20px',
        padding: '12px 20px',
        background: 'rgba(74, 94, 122, 0.9)',
        backdropFilter: 'blur(10px)',
        border: 'none',
        borderRadius: '8px',
        color: '#eaeaea',
        cursor: 'pointer',
        fontSize: '14px',
    },
    vpnPanel: {
        position: 'fixed',
        top: '120px',
        right: '20px',
        background: 'rgba(26, 26, 46, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '12px',
        padding: '16px',
        minWidth: '300px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    vpnPanelHeader: {
        fontSize: '16px',
        fontWeight: '600',
        marginBottom: '16px',
    },
    vpnPanelItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 0',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    },
    toggleButton: {
        padding: '6px 16px',
        background: 'rgba(74, 94, 122, 0.8)',
        border: 'none',
        borderRadius: '6px',
        color: '#eaeaea',
        cursor: 'pointer',
        fontSize: '12px',
    },
    ipAddress: {
        fontSize: '12px',
        color: 'rgba(234, 234, 234, 0.7)',
    },
    vpnPanelButton: {
        width: '100%',
        padding: '10px',
        background: 'rgba(74, 94, 122, 0.8)',
        border: 'none',
        borderRadius: '8px',
        color: '#eaeaea',
        cursor: 'pointer',
        marginTop: '12px',
    },
    settingsButton: {
        position: 'fixed',
        top: '20px',
        right: '20px',
        width: '40px',
        height: '40px',
        background: 'rgba(74, 94, 122, 0.9)',
        backdropFilter: 'blur(10px)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        fontSize: '20px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    settingsPanel: {
        position: 'fixed',
        top: '70px',
        right: '20px',
        background: 'rgba(26, 26, 46, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '12px',
        padding: '16px',
        minWidth: '280px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    settingsPanelHeader: {
        fontSize: '16px',
        fontWeight: '600',
        marginBottom: '16px',
    },
    settingsItem: {
        width: '100%',
        padding: '10px',
        background: 'none',
        border: 'none',
        color: '#eaeaea',
        textAlign: 'left',
        cursor: 'pointer',
        borderRadius: '6px',
        fontSize: '14px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    settingsDivider: {
        height: '1px',
        background: 'rgba(255, 255, 255, 0.1)',
        margin: '12px 0',
    },
    customizeButton: {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '12px 20px',
        background: 'rgba(74, 94, 122, 0.9)',
        backdropFilter: 'blur(10px)',
        border: 'none',
        borderRadius: '8px',
        color: '#eaeaea',
        cursor: 'pointer',
        fontSize: '14px',
    },
    customizePanel: {
        position: 'fixed',
        bottom: '70px',
        right: '20px',
        background: 'rgba(26, 26, 46, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '12px',
        padding: '16px',
        minWidth: '280px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    customizePanelHeader: {
        fontSize: '16px',
        fontWeight: '600',
        marginBottom: '8px',
    },
    customizeInfo: {
        fontSize: '12px',
        color: 'rgba(234, 234, 234, 0.6)',
        marginBottom: '16px',
    },
    customizeOption: {
        width: '100%',
        padding: '10px',
        background: 'rgba(74, 94, 122, 0.6)',
        border: 'none',
        borderRadius: '6px',
        color: '#eaeaea',
        cursor: 'pointer',
        marginBottom: '8px',
        textAlign: 'left',
    },
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<WOFESBrowser />);
