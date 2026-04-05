use anyhow::{Result, Context};
use serde::{Deserialize, Serialize};
use std::process::{Command, Stdio};
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VpnConfig {
    pub protocol: VpnProtocol,
    pub config_path: Option<PathBuf>,
    pub server: Option<String>,
    pub country: Option<String>,
    pub auto_connect: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum VpnProtocol {
    OpenVPN,
    WireGuard,
    Tor,
}

#[derive(Debug)]
pub struct VpnManager {
    config: VpnConfig,
    is_connected: bool,
}

impl VpnManager {
    pub fn new(config: VpnConfig) -> Self {
        Self {
            config,
            is_connected: false,
        }
    }

    pub async fn connect(&mut self) -> Result<()> {
        match self.config.protocol {
            VpnProtocol::OpenVPN => self.connect_openvpn().await,
            VpnProtocol::WireGuard => self.connect_wireguard().await,
            VpnProtocol::Tor => {
                log::info!("Tor connection is handled by NetworkManager");
                self.is_connected = true;
                Ok(())
            }
        }
    }

    pub async fn disconnect(&mut self) -> Result<()> {
        match self.config.protocol {
            VpnProtocol::OpenVPN => self.disconnect_openvpn().await,
            VpnProtocol::WireGuard => self.disconnect_wireguard().await,
            VpnProtocol::Tor => {
                self.is_connected = false;
                Ok(())
            }
        }
    }

    async fn connect_openvpn(&mut self) -> Result<()> {
        let config_path = self.config.config_path.as_ref()
            .context("OpenVPN config path not set")?;

        log::info!("Connecting to OpenVPN with config: {:?}", config_path);

        #[cfg(target_os = "linux")]
        {
            Command::new("openvpn")
                .arg("--config")
                .arg(config_path)
                .arg("--daemon")
                .stdout(Stdio::null())
                .stderr(Stdio::null())
                .spawn()
                .context("Failed to start OpenVPN")?;
        }

        #[cfg(target_os = "macos")]
        {
            Command::new("openvpn")
                .arg("--config")
                .arg(config_path)
                .arg("--daemon")
                .stdout(Stdio::null())
                .stderr(Stdio::null())
                .spawn()
                .context("Failed to start OpenVPN")?;
        }

        #[cfg(target_os = "windows")]
        {
            Command::new("openvpn")
                .arg("--config")
                .arg(config_path)
                .creation_flags(0x08000000)
                .spawn()
                .context("Failed to start OpenVPN")?;
        }

        self.is_connected = true;
        log::info!("OpenVPN connection initiated");
        Ok(())
    }

    async fn disconnect_openvpn(&mut self) -> Result<()> {
        log::info!("Disconnecting OpenVPN");

        #[cfg(any(target_os = "linux", target_os = "macos"))]
        {
            Command::new("killall")
                .arg("openvpn")
                .output()
                .context("Failed to kill OpenVPN process")?;
        }

        #[cfg(target_os = "windows")]
        {
            Command::new("taskkill")
                .args(&["/IM", "openvpn.exe", "/F"])
                .output()
                .context("Failed to kill OpenVPN process")?;
        }

        self.is_connected = false;
        Ok(())
    }

    async fn connect_wireguard(&mut self) -> Result<()> {
        let config_path = self.config.config_path.as_ref()
            .context("WireGuard config path not set")?;

        log::info!("Connecting to WireGuard with config: {:?}", config_path);

        #[cfg(target_os = "linux")]
        {
            Command::new("wg-quick")
                .arg("up")
                .arg(config_path)
                .output()
                .context("Failed to start WireGuard")?;
        }

        #[cfg(target_os = "macos")]
        {
            Command::new("wg-quick")
                .arg("up")
                .arg(config_path)
                .output()
                .context("Failed to start WireGuard")?;
        }

        #[cfg(target_os = "windows")]
        {
            let interface_name = config_path
                .file_stem()
                .and_then(|s| s.to_str())
                .context("Invalid config filename")?;
            
            Command::new("wireguard")
                .args(&["/installtunnelservice", config_path.to_str().unwrap()])
                .output()
                .context("Failed to install WireGuard tunnel")?;
        }

        self.is_connected = true;
        log::info!("WireGuard connection initiated");
        Ok(())
    }

    async fn disconnect_wireguard(&mut self) -> Result<()> {
        log::info!("Disconnecting WireGuard");

        let config_path = self.config.config_path.as_ref()
            .context("WireGuard config path not set")?;

        #[cfg(any(target_os = "linux", target_os = "macos"))]
        {
            Command::new("wg-quick")
                .arg("down")
                .arg(config_path)
                .output()
                .context("Failed to stop WireGuard")?;
        }

        #[cfg(target_os = "windows")]
        {
            let interface_name = config_path
                .file_stem()
                .and_then(|s| s.to_str())
                .context("Invalid config filename")?;
            
            Command::new("wireguard")
                .args(&["/uninstalltunnelservice", interface_name])
                .output()
                .context("Failed to uninstall WireGuard tunnel")?;
        }

        self.is_connected = false;
        Ok(())
    }

    pub fn is_connected(&self) -> bool {
        self.is_connected
    }

    pub fn get_protocol(&self) -> &VpnProtocol {
        &self.config.protocol
    }

    pub fn set_config(&mut self, config: VpnConfig) {
        self.config = config;
    }

    pub fn get_config(&self) -> &VpnConfig {
        &self.config
    }
}
