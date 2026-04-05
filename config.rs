use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BrowserConfig {
    pub user_id: Option<Uuid>,
    pub theme: ThemeConfig,
    pub privacy: PrivacyConfig,
    pub network: NetworkConfig,
    pub widgets: Vec<Widget>,
    pub quick_links: Vec<QuickLink>,
    pub home_screen: HomeScreenConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThemeConfig {
    pub wallpaper: String,
    pub primary_color: String,
    pub secondary_color: String,
    pub text_color: String,
    pub background_opacity: f32,
    pub corner_text: String,
    pub custom_colors: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PrivacyConfig {
    pub anti_screenshot: bool,
    pub anti_screen_capture: bool,
    pub block_webrtc: bool,
    pub custom_user_agent: Option<String>,
    pub disable_cookies: bool,
    pub disable_history: bool,
    pub auto_clear_on_exit: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkConfig {
    pub vpn_enabled: bool,
    pub vpn_protocol: VpnProtocol,
    pub vpn_server: Option<String>,
    pub vpn_country: Option<String>,
    pub custom_dns_enabled: bool,
    pub custom_dns_servers: Vec<String>,
    pub proxy_config: Option<ProxyConfig>,
    pub tor_enabled: bool,
    pub dns_leak_protection: bool,
    pub auto_connect_vpn: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum VpnProtocol {
    OpenVPN,
    WireGuard,
    Tor,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProxyConfig {
    pub proxy_type: ProxyType,
    pub host: String,
    pub port: u16,
    pub username: Option<String>,
    pub password: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ProxyType {
    HTTP,
    HTTPS,
    SOCKS5,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Widget {
    pub id: Uuid,
    pub widget_type: WidgetType,
    pub position: Position,
    pub size: Size,
    pub config: serde_json::Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum WidgetType {
    Clock,
    Weather,
    News,
    QuickLinks,
    CustomText,
    CustomButton,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Position {
    pub x: f32,
    pub y: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Size {
    pub width: f32,
    pub height: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QuickLink {
    pub id: Uuid,
    pub name: String,
    pub url: String,
    pub icon: Option<String>,
    pub position: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HomeScreenConfig {
    pub show_clock: bool,
    pub show_date: bool,
    pub show_news: bool,
    pub news_update_interval_hours: u32,
    pub search_placeholder_animations: Vec<String>,
}

impl Default for BrowserConfig {
    fn default() -> Self {
        Self {
            user_id: None,
            theme: ThemeConfig::default(),
            privacy: PrivacyConfig::default(),
            network: NetworkConfig::default(),
            widgets: Vec::new(),
            quick_links: Vec::new(),
            home_screen: HomeScreenConfig::default(),
        }
    }
}

impl Default for ThemeConfig {
    fn default() -> Self {
        Self {
            wallpaper: "raindrop_glass".to_string(),
            primary_color: "#1a1a2e".to_string(),
            secondary_color: "#16213e".to_string(),
            text_color: "#eaeaea".to_string(),
            background_opacity: 0.85,
            corner_text: "WOFES SFF".to_string(),
            custom_colors: HashMap::new(),
        }
    }
}

impl Default for PrivacyConfig {
    fn default() -> Self {
        Self {
            anti_screenshot: false,
            anti_screen_capture: false,
            block_webrtc: true,
            custom_user_agent: None,
            disable_cookies: false,
            disable_history: false,
            auto_clear_on_exit: true,
        }
    }
}

impl Default for NetworkConfig {
    fn default() -> Self {
        Self {
            vpn_enabled: false,
            vpn_protocol: VpnProtocol::Tor,
            vpn_server: None,
            vpn_country: None,
            custom_dns_enabled: false,
            custom_dns_servers: vec!["1.1.1.1".to_string(), "1.0.0.1".to_string()],
            proxy_config: None,
            tor_enabled: true,
            dns_leak_protection: true,
            auto_connect_vpn: false,
        }
    }
}

impl Default for HomeScreenConfig {
    fn default() -> Self {
        Self {
            show_clock: true,
            show_date: true,
            show_news: true,
            news_update_interval_hours: 6,
            search_placeholder_animations: vec![
                "Write something down...".to_string(),
                "Search the web...".to_string(),
                "Type a command...".to_string(),
                "Enter .onion address...".to_string(),
                "Browse anonymously...".to_string(),
            ],
        }
    }
}
