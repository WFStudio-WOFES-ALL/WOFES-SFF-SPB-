use anyhow::{Result, Context};
use serde::{Deserialize, Serialize};
use std::net::{IpAddr, SocketAddr};
use reqwest::{Client, Proxy};

#[derive(Debug, Clone)]
pub struct NetworkManager {
    pub tor_proxy: Option<SocketAddr>,
    pub custom_proxy: Option<ProxySettings>,
    pub dns_servers: Vec<IpAddr>,
    client: Option<Client>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProxySettings {
    pub proxy_type: String,
    pub host: String,
    pub port: u16,
    pub username: Option<String>,
    pub password: Option<String>,
}

impl NetworkManager {
    pub fn new() -> Self {
        Self {
            tor_proxy: Some(SocketAddr::from(([127, 0, 0, 1], 9050))),
            custom_proxy: None,
            dns_servers: vec![
                "1.1.1.1".parse().unwrap(),
                "1.0.0.1".parse().unwrap(),
            ],
            client: None,
        }
    }

    pub fn enable_tor(&mut self) -> Result<()> {
        log::info!("Enabling Tor proxy connection");
        self.tor_proxy = Some(SocketAddr::from(([127, 0, 0, 1], 9050)));
        self.rebuild_client()?;
        Ok(())
    }

    pub fn disable_tor(&mut self) {
        log::info!("Disabling Tor proxy connection");
        self.tor_proxy = None;
        let _ = self.rebuild_client();
    }

    pub fn set_custom_proxy(&mut self, proxy: ProxySettings) -> Result<()> {
        log::info!("Setting custom proxy: {}:{}", proxy.host, proxy.port);
        self.custom_proxy = Some(proxy);
        self.rebuild_client()?;
        Ok(())
    }

    pub fn clear_proxy(&mut self) {
        log::info!("Clearing custom proxy");
        self.custom_proxy = None;
        let _ = self.rebuild_client();
    }

    pub fn set_dns_servers(&mut self, servers: Vec<String>) -> Result<()> {
        self.dns_servers = servers
            .iter()
            .filter_map(|s| s.parse().ok())
            .collect();
        
        if self.dns_servers.is_empty() {
            anyhow::bail!("No valid DNS servers provided");
        }
        
        log::info!("DNS servers updated: {:?}", self.dns_servers);
        Ok(())
    }

    fn rebuild_client(&mut self) -> Result<()> {
        let mut client_builder = Client::builder()
            .danger_accept_invalid_certs(false)
            .timeout(std::time::Duration::from_secs(30));

        if let Some(tor_addr) = self.tor_proxy {
            let proxy_url = format!("socks5://{}:{}", tor_addr.ip(), tor_addr.port());
            let proxy = Proxy::all(&proxy_url)
                .context("Failed to create Tor proxy")?;
            client_builder = client_builder.proxy(proxy);
            log::info!("HTTP client configured with Tor proxy");
        } else if let Some(custom) = &self.custom_proxy {
            let proxy_url = match custom.proxy_type.as_str() {
                "socks5" => format!("socks5://{}:{}", custom.host, custom.port),
                "http" => format!("http://{}:{}", custom.host, custom.port),
                "https" => format!("https://{}:{}", custom.host, custom.port),
                _ => return Err(anyhow::anyhow!("Unsupported proxy type")),
            };
            
            let mut proxy = Proxy::all(&proxy_url)
                .context("Failed to create custom proxy")?;
            
            if let (Some(username), Some(password)) = (&custom.username, &custom.password) {
                proxy = proxy.basic_auth(username, password);
            }
            
            client_builder = client_builder.proxy(proxy);
            log::info!("HTTP client configured with custom proxy");
        }

        self.client = Some(client_builder.build()?);
        Ok(())
    }

    pub fn get_client(&mut self) -> Result<&Client> {
        if self.client.is_none() {
            self.rebuild_client()?;
        }
        
        self.client.as_ref()
            .ok_or_else(|| anyhow::anyhow!("Failed to get HTTP client"))
    }

    pub async fn check_connection(&mut self) -> Result<bool> {
        let client = self.get_client()?;
        
        let test_url = if self.tor_proxy.is_some() {
            "https://check.torproject.org/api/ip"
        } else {
            "https://api.ipify.org?format=json"
        };

        match client.get(test_url).send().await {
            Ok(response) => {
                if response.status().is_success() {
                    log::info!("Network connection verified");
                    Ok(true)
                } else {
                    log::warn!("Network check returned non-success status");
                    Ok(false)
                }
            }
            Err(e) => {
                log::error!("Network connection check failed: {}", e);
                Ok(false)
            }
        }
    }

    pub async fn get_current_ip(&mut self) -> Result<String> {
        let client = self.get_client()?;
        
        let url = if self.tor_proxy.is_some() {
            "https://check.torproject.org/api/ip"
        } else {
            "https://api.ipify.org?format=json"
        };

        let response = client.get(url)
            .send()
            .await?
            .json::<serde_json::Value>()
            .await?;

        let ip = if self.tor_proxy.is_some() {
            response["IP"].as_str()
        } else {
            response["ip"].as_str()
        };

        ip.map(|s| s.to_string())
            .ok_or_else(|| anyhow::anyhow!("Failed to parse IP address"))
    }

    pub fn is_tor_enabled(&self) -> bool {
        self.tor_proxy.is_some()
    }

    pub fn is_proxy_enabled(&self) -> bool {
        self.custom_proxy.is_some()
    }
}

impl Default for NetworkManager {
    fn default() -> Self {
        Self::new()
    }
}

pub fn is_onion_url(url: &str) -> bool {
    url.contains(".onion")
}

pub fn validate_url(url: &str) -> Result<url::Url> {
    url::Url::parse(url).context("Invalid URL format")
}
