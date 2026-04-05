# WOFES SFF Browser

**Fully Anonymous Browser with Tor Support**

A complete privacy-focused browser built in Rust with cross-platform support for Windows, Linux, macOS, Android, iOS, and Web (PWA).

## Features

### Privacy & Security
- **Anti-Screenshot Protection** (platform-dependent)
- **Anti-Screen Capture** 
- **WebRTC Blocking**
- **Canvas Fingerprinting Protection**
- **Custom User-Agent**
- **Tor Integration** for .onion sites
- **Automatic Circuit Rotation**
- **VPN Support** (WireGuard, OpenVPN)
- **Custom DNS** with leak protection
- **Encrypted Local Storage** (AES-256-GCM)

### Network Features
- **Tor Browser Integration** - Native .onion support
- **VPN Manager** - WireGuard and OpenVPN protocols
- **Custom DNS** - Set your own DNS servers
- **DNS Leak Protection**
- **Proxy Support** - HTTP, HTTPS, SOCKS5
- **Network Isolation** per tab

### User Interface
- **Adaptive Design** - Works on all screen sizes
- **Customizable Theme** - Change colors, transparency, wallpapers
- **Animated Search Bar** - Dynamic placeholder text
- **Quick Links** - 5 customizable bookmark slots
- **News Widget** - Updates every 6 hours
- **Drag-and-Drop Widgets**
- **Smart Action Buttons**
- **Developer Panel** - View source, edit pages, inspect

### Cross-Platform
- Windows (7, 8, 10, 11)
- Linux (Ubuntu, Debian, Fedora, Arch)
- macOS (Intel & Apple Silicon)
- Android (5.0+)
- iOS (12.0+)
- Web/PWA (Progressive Web App)

## Installation

### Prerequisites

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install build dependencies
./build.sh setup
```

### Desktop Platforms

#### Linux
```bash
# Ubuntu/Debian
sudo apt install libwebkit2gtk-4.0-dev build-essential curl wget libssl-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev

# Fedora
sudo dnf install webkit2gtk3-devel openssl-devel gtk3-devel libappindicator-gtk3-devel librsvg2-devel

# Build
./build.sh desktop
```

#### macOS
```bash
# Install Xcode Command Line Tools
xcode-select --install

# Build
./build.sh desktop
```

#### Windows
```bash
# Install Visual Studio Build Tools
# Download from: https://visualstudio.microsoft.com/downloads/

# Build
build.bat
```

### Android

```bash
# Install Android SDK and NDK
# Set ANDROID_HOME and NDK_HOME environment variables

./build.sh android
```

Output: `platform-mobile/android/app/build/outputs/apk/release/app-release.apk`

### iOS

```bash
# Requires macOS with Xcode
# Install Xcode from App Store

./build.sh ios
```

Output: `platform-mobile/ios/build/ipa/WOFESSFF.ipa`

### Web/PWA

```bash
./build.sh web
```

Then serve the `ui/static/` directory with any web server.

## Usage

### Desktop

```bash
# Run from source
cargo run --release

# Or run the built binary
./target/release/wofes-sff-browser
```

The browser will start on `http://127.0.0.1:8080`

### Configuration

All settings are stored in:
- **Linux**: `~/.config/wofes-sff/`
- **macOS**: `~/Library/Application Support/wofes-sff/`
- **Windows**: `%APPDATA%\wofes-sff\`
- **Android/iOS**: App private storage
- **Web**: Browser LocalStorage + IndexedDB

### Tor Configuration

Tor is enabled by default. To access .onion sites:

1. Ensure Tor is running (auto-starts with browser)
2. Type or paste a .onion URL in the address bar
3. The browser automatically routes through Tor

**Manual Tor control:**
```bash
# New circuit
POST http://127.0.0.1:8080/api/tor/new-circuit

# Stop Tor
POST http://127.0.0.1:8080/api/tor/stop

# Start Tor
POST http://127.0.0.1:8080/api/tor/start
```

### VPN Setup

1. Click the VPN button in the top-right
2. Select server and protocol (WireGuard/OpenVPN)
3. Click "Enable VPN"
4. Current IP is displayed

**Supported VPN Protocols:**
- WireGuard (recommended)
- OpenVPN

### Custom DNS

1. Open VPN/DNS panel
2. Toggle "Custom DNS"
3. Enter DNS server address (e.g., 1.1.1.1)
4. Enable "Block DNS Leaks"

**Recommended DNS Servers:**
- Cloudflare: `1.1.1.1`, `1.0.0.1`
- Quad9: `9.9.9.9`, `149.112.112.112`
- OpenDNS: `208.67.222.222`, `208.67.220.220`

### Anti-Screenshot

**Desktop (Windows):**
Automatically enabled using Windows DWM API

**Android:**
Uses FLAG_SECURE window flag

**iOS:**
Uses secure text field overlay technique

**Note:** Some platforms may have limitations

### Keyboard Shortcuts

- **Ctrl+T**: New Tab
- **Ctrl+W**: Close Tab
- **Ctrl+Shift+P**: New Private Tab
- **Ctrl+R**: Reload
- **Ctrl+Shift+R**: Force Reload
- **F11**: Fullscreen
- **F12**: Developer Tools
- **Ctrl+,**: Settings

## API Reference

### REST API Endpoints

```
GET  /api/config              - Get browser configuration
POST /api/config              - Update configuration

GET  /api/tor/status          - Get Tor status
POST /api/tor/start           - Start Tor service
POST /api/tor/stop            - Stop Tor service
POST /api/tor/new-circuit     - Request new Tor circuit

POST /api/vpn/connect         - Connect to VPN
POST /api/vpn/disconnect      - Disconnect VPN
GET  /api/vpn/status          - Get VPN status

GET  /api/network/ip          - Get current IP address
POST /api/network/dns         - Set custom DNS

POST /api/privacy/anti-screenshot  - Toggle anti-screenshot
POST /api/privacy/anti-capture     - Toggle anti-capture

POST /api/history/clear       - Clear browsing history
POST /api/data/delete-all     - Delete all browser data

GET  /api/news                - Get latest news
```

### JavaScript API (Mobile & Web)

```javascript
// Anti-screenshot
window.WOFES.enableAntiScreenshot();
window.WOFES.disableAntiScreenshot();

// Device info
const info = window.WOFES.getDeviceInfo();
```

## Architecture

```
wofes-sff-browser/
├── core/              # Browser engine, storage, crypto
├── ui/                # Web interface & API server
├── tor-integration/   # Tor daemon integration
├── vpn-manager/       # VPN connection manager
├── platform-desktop/  # Desktop platforms (Windows/Linux/macOS)
├── platform-mobile/   # Mobile platforms (Android/iOS)
└── platform-web/      # Web/PWA version
```

## Security Considerations

1. **Data Encryption**: All local data is encrypted with AES-256-GCM
2. **No Telemetry**: Zero data collection, no analytics
3. **Tor Integration**: Full .onion support via embedded Tor
4. **Memory Safety**: Written in Rust for memory safety
5. **Sandboxing**: Each tab runs in isolated context

## Development

### Building from Source

```bash
git clone https://github.com/wofes/sff-browser.git
cd sff-browser
cargo build --release
```

### Running Tests

```bash
cargo test --all
```

### Code Structure

- `core/src/lib.rs` - Main browser engine
- `core/src/privacy.rs` - Privacy protection features
- `core/src/storage.rs` - Encrypted storage layer
- `core/src/network.rs` - Network management
- `tor-integration/src/lib.rs` - Tor integration
- `vpn-manager/src/lib.rs` - VPN management
- `ui/src/lib.rs` - Web server & API
- `ui/static/` - Frontend (HTML/CSS/JS)

## Troubleshooting

### Tor not connecting
```bash
# Check Tor status
curl http://127.0.0.1:8080/api/tor/status

# Restart Tor
curl -X POST http://127.0.0.1:8080/api/tor/stop
curl -X POST http://127.0.0.1:8080/api/tor/start
```

### VPN connection fails
- Ensure you have root/admin privileges
- Check VPN configuration file format
- Verify network connectivity

### Anti-screenshot not working
- Feature is platform-dependent
- Requires appropriate system permissions
- May not work in virtual machines

## License

MIT License - See LICENSE file for details

## Contributing

Contributions welcome! Please read CONTRIBUTING.md first.

## Credits

Built with:
- Rust
- Tauri (Desktop)
- Tor Project
- WireGuard
- OpenVPN

---

**WOFES SFF** - Privacy is not a crime
