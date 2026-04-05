# WOFES SFF Browser - Configuration Guide

## Configuration Files

### Location

- **Linux**: `~/.config/wofes-sff/config.json`
- **macOS**: `~/Library/Application Support/wofes-sff/config.json`
- **Windows**: `%APPDATA%\wofes-sff\config.json`
- **Android**: `/data/data/com.wofes.sff/files/config.json`
- **iOS**: `~/Library/Application Support/wofes-sff/config.json`

### Configuration Schema

```json
{
  "browser": {
    "homepage": "about:home",
    "search_engine": "DuckDuckGo",
    "new_tab_behavior": "HomePage",
    "download_directory": "/home/user/Downloads",
    "enable_javascript": true,
    "enable_cookies": true,
    "enable_images": true
  },
  "privacy": {
    "do_not_track": true,
    "block_third_party_cookies": true,
    "block_tracking_scripts": true,
    "clear_on_exit": {
      "history": true,
      "cookies": false,
      "cache": true,
      "downloads": false,
      "form_data": true
    },
    "fingerprint_protection": {
      "canvas": true,
      "webgl": true,
      "audio": true,
      "fonts": true,
      "screen_resolution": true
    }
  },
  "network": {
    "proxy": null,
    "dns": {
      "use_custom_dns": false,
      "primary_dns": null,
      "secondary_dns": null,
      "dns_over_https": true,
      "dns_over_tls": false,
      "block_dns_leaks": true
    },
    "vpn": {
      "enabled": false,
      "auto_connect": false,
      "server": null,
      "protocol": "WireGuard",
      "kill_switch": true
    },
    "tor": {
      "enabled": true,
      "use_bridges": false,
      "bridge_type": null,
      "isolate_streams": true,
      "auto_circuit_rotation": true,
      "circuit_rotation_interval": 600
    }
  },
  "appearance": {
    "theme": "Dark",
    "font_size": 14,
    "font_family": "system-ui",
    "show_bookmarks_bar": true,
    "compact_mode": false,
    "animations_enabled": true
  },
  "advanced": {
    "hardware_acceleration": true,
    "webrtc_policy": "DisableNonProxied",
    "referrer_policy": "NoReferrer",
    "user_agent": null,
    "content_security_policy": true,
    "experimental_features": false
  }
}
```

## Privacy Settings

### Anti-Screenshot Configuration

```json
{
  "privacy": {
    "anti_screenshot": true,
    "anti_screen_capture": true
  }
}
```

**Platform Support:**
- Windows: Full support via DWM API
- Linux: Limited support (depends on compositor)
- macOS: Limited support
- Android: Full support via FLAG_SECURE
- iOS: Full support via secure overlay

### WebRTC Blocking

```json
{
  "privacy": {
    "block_webrtc": true
  }
}
```

Prevents IP leaks through WebRTC.

### Canvas Fingerprinting Protection

```json
{
  "fingerprint_protection": {
    "canvas": true
  }
}
```

Adds noise to canvas API to prevent fingerprinting.

## Network Configuration

### Tor Settings

#### Basic Configuration

```json
{
  "tor": {
    "enabled": true,
    "socks_port": 9050,
    "control_port": 9051,
    "auto_circuit_change": true,
    "circuit_change_interval_seconds": 600
  }
}
```

#### Using Bridges (For Censored Networks)

```json
{
  "tor": {
    "use_bridges": true,
    "bridge_type": "Obfs4",
    "bridges": [
      "obfs4 192.0.2.1:443 cert=AAAA fingerprint=BBBB",
      "obfs4 198.51.100.1:443 cert=CCCC fingerprint=DDDD"
    ]
  }
}
```

**Bridge Types:**
- `Obfs4`: Obfuscates Tor traffic
- `Meek`: Uses cloud services (Azure, Amazon)
- `Snowflake`: Uses temporary proxies

### VPN Configuration

#### WireGuard

```json
{
  "vpn": {
    "enabled": true,
    "protocol": "WireGuard",
    "server": "vpn.example.com",
    "config_file": "/path/to/wg0.conf"
  }
}
```

**WireGuard Config Example:**
```ini
[Interface]
PrivateKey = YOUR_PRIVATE_KEY
Address = 10.0.0.2/24
DNS = 1.1.1.1, 1.0.0.1

[Peer]
PublicKey = SERVER_PUBLIC_KEY
Endpoint = vpn.example.com:51820
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 25
```

#### OpenVPN

```json
{
  "vpn": {
    "enabled": true,
    "protocol": "OpenVPN",
    "config_file": "/path/to/client.ovpn"
  }
}
```

### DNS Configuration

#### Custom DNS Servers

```json
{
  "dns": {
    "use_custom_dns": true,
    "primary_dns": "1.1.1.1",
    "secondary_dns": "1.0.0.1",
    "block_dns_leaks": true
  }
}
```

**Recommended DNS Providers:**

| Provider | Primary | Secondary | Features |
|----------|---------|-----------|----------|
| Cloudflare | 1.1.1.1 | 1.0.0.1 | Fast, privacy-focused |
| Quad9 | 9.9.9.9 | 149.112.112.112 | Security filtering |
| OpenDNS | 208.67.222.222 | 208.67.220.220 | Content filtering |
| AdGuard | 94.140.14.14 | 94.140.15.15 | Ad blocking |

#### DNS over HTTPS (DoH)

```json
{
  "dns": {
    "dns_over_https": true,
    "doh_server": "https://1.1.1.1/dns-query"
  }
}
```

#### DNS over TLS (DoT)

```json
{
  "dns": {
    "dns_over_tls": true,
    "dot_server": "1.1.1.1",
    "dot_port": 853
  }
}
```

### Proxy Configuration

#### SOCKS5 Proxy

```json
{
  "proxy": {
    "protocol": "SOCKS5",
    "host": "127.0.0.1",
    "port": 9050,
    "username": null,
    "password": null
  }
}
```

#### HTTP/HTTPS Proxy

```json
{
  "proxy": {
    "protocol": "HTTPS",
    "host": "proxy.example.com",
    "port": 8080,
    "username": "user",
    "password": "pass"
  }
}
```

## Appearance Customization

### Theme Configuration

#### Dark Theme (Default)

```json
{
  "appearance": {
    "theme": {
      "name": "Dark",
      "colors": {
        "primary": "#1a1a1a",
        "secondary": "#2a2a2a",
        "background": "#0a0a0a",
        "text": "#ffffff",
        "accent": "#4a9eff"
      }
    }
  }
}
```

#### Light Theme

```json
{
  "appearance": {
    "theme": {
      "name": "Light",
      "colors": {
        "primary": "#ffffff",
        "secondary": "#f5f5f5",
        "background": "#fafafa",
        "text": "#000000",
        "accent": "#0066cc"
      }
    }
  }
}
```

#### Custom Theme

```json
{
  "appearance": {
    "theme": {
      "name": "Custom",
      "colors": {
        "primary": "#2d2d2d",
        "secondary": "#3d3d3d",
        "background": "#1d1d1d",
        "text": "#e0e0e0",
        "accent": "#ff6b6b"
      },
      "transparency": 0.95
    }
  }
}
```

### Wallpaper Settings

```json
{
  "appearance": {
    "wallpaper": {
      "type": "image",
      "path": "/path/to/wallpaper.jpg",
      "blur": 0,
      "brightness": 1.0
    }
  }
}
```

**Built-in Wallpapers:**
- `raindrops.jpg` (default)
- `abstract.jpg`
- `gradient.jpg`
- `minimal.jpg`

### Widget Configuration

```json
{
  "ui": {
    "widgets": [
      {
        "id": "clock-1",
        "type": "Clock",
        "position": { "x": 0.5, "y": 0.3 },
        "size": { "width": 200, "height": 100 },
        "config": {
          "format": "24h",
          "show_date": true
        }
      },
      {
        "id": "news-1",
        "type": "News",
        "position": { "x": 0.5, "y": 0.7 },
        "size": { "width": 600, "height": 200 },
        "config": {
          "update_interval": 21600,
          "sources": ["https://news.ycombinator.com/rss"]
        }
      }
    ]
  }
}
```

## Advanced Settings

### User Agent Spoofing

```json
{
  "advanced": {
    "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  }
}
```

**Common User Agents:**

```javascript
// Chrome on Windows
"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

// Firefox on Linux
"Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/121.0"

// Safari on macOS
"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15"

// Generic/Private
"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
```

### Content Security Policy

```json
{
  "advanced": {
    "content_security_policy": true,
    "csp_rules": [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "connect-src 'self' wss: https:"
    ]
  }
}
```

### Cache Settings

```json
{
  "browser": {
    "cache": {
      "enabled": true,
      "max_size_mb": 500,
      "clear_on_exit": true
    }
  }
}
```

## Quick Actions

Create smart buttons for common tasks:

```json
{
  "quick_actions": [
    {
      "id": "new-circuit",
      "label": "New Tor Circuit",
      "action": "tor.new_circuit",
      "icon": "refresh"
    },
    {
      "id": "toggle-vpn",
      "label": "Toggle VPN",
      "action": "vpn.toggle",
      "icon": "shield"
    },
    {
      "id": "clear-history",
      "label": "Clear History",
      "action": "browser.clear_history",
      "icon": "trash"
    },
    {
      "id": "anti-screenshot",
      "label": "Anti-Screenshot",
      "action": "privacy.toggle_anti_screenshot",
      "icon": "eye-off"
    }
  ]
}
```

## Environment Variables

Alternative configuration via environment variables:

```bash
# Server settings
export WOFES_PORT=8080
export WOFES_HOST=127.0.0.1

# Tor settings
export WOFES_TOR_ENABLED=true
export WOFES_TOR_SOCKS_PORT=9050
export WOFES_TOR_CONTROL_PORT=9051

# Privacy settings
export WOFES_ANTI_SCREENSHOT=true
export WOFES_BLOCK_WEBRTC=true

# Data directory
export WOFES_DATA_DIR=/custom/path

# Logging
export RUST_LOG=info
```

## Configuration Examples

### Maximum Privacy Setup

```json
{
  "privacy": {
    "do_not_track": true,
    "block_third_party_cookies": true,
    "block_tracking_scripts": true,
    "anti_screenshot": true,
    "anti_screen_capture": true,
    "clear_on_exit": {
      "history": true,
      "cookies": true,
      "cache": true,
      "downloads": true,
      "form_data": true
    },
    "fingerprint_protection": {
      "canvas": true,
      "webgl": true,
      "audio": true,
      "fonts": true,
      "screen_resolution": true
    }
  },
  "network": {
    "tor": {
      "enabled": true,
      "use_bridges": true,
      "isolate_streams": true
    },
    "vpn": {
      "enabled": true,
      "kill_switch": true
    },
    "dns": {
      "use_custom_dns": true,
      "dns_over_https": true,
      "block_dns_leaks": true
    }
  },
  "advanced": {
    "webrtc_policy": "DisableAll",
    "referrer_policy": "NoReferrer"
  }
}
```

### Performance Optimized Setup

```json
{
  "browser": {
    "enable_javascript": true,
    "enable_cookies": true,
    "cache": {
      "enabled": true,
      "max_size_mb": 1000
    }
  },
  "privacy": {
    "fingerprint_protection": {
      "canvas": false,
      "webgl": false
    }
  },
  "advanced": {
    "hardware_acceleration": true,
    "webrtc_policy": "Default"
  },
  "appearance": {
    "animations_enabled": false
  }
}
```

### Tor-Only Configuration

```json
{
  "network": {
    "tor": {
      "enabled": true,
      "use_bridges": false,
      "auto_circuit_rotation": true,
      "circuit_rotation_interval": 300
    },
    "vpn": {
      "enabled": false
    },
    "proxy": null
  },
  "privacy": {
    "block_third_party_cookies": true,
    "fingerprint_protection": {
      "canvas": true,
      "webgl": true,
      "audio": true,
      "fonts": true,
      "screen_resolution": true
    }
  }
}
```

## Import/Export Configuration

### Export Configuration

```bash
# Via API
curl http://localhost:8080/api/config > config.json

# Or from file
cp ~/.config/wofes-sff/config.json ~/backup/config.json
```

### Import Configuration

```bash
# Via API
curl -X POST http://localhost:8080/api/config \
  -H "Content-Type: application/json" \
  -d @config.json

# Or copy file
cp ~/backup/config.json ~/.config/wofes-sff/config.json
```

## Troubleshooting Configuration

### Reset to Defaults

```bash
# Delete config file
rm ~/.config/wofes-sff/config.json

# Restart browser to regenerate
```

### Validate Configuration

```bash
# Check syntax
jq . ~/.config/wofes-sff/config.json

# Validate via API
curl http://localhost:8080/api/config/validate
```

### Configuration Conflicts

If settings don't apply:
1. Check file permissions
2. Verify JSON syntax
3. Check environment variables (override config file)
4. Review browser logs

## Next Steps

- [User Manual](USER_MANUAL.md)
- [Security Best Practices](SECURITY.md)
- [API Documentation](API.md)
