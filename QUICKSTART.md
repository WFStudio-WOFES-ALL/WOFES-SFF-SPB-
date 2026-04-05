# WOFES SFF Browser - Quick Start

## Download and Extract

```bash
# Extract archive
tar -xzf wofes-sff-browser.tar.gz
cd wofes-sff-browser
```

## Quick Installation

### Linux/macOS (5 minutes)

```bash
# Install Rust (if not installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Build and run
cargo build --release
./target/release/wofes-sff-browser
```

Open browser: http://localhost:8080

### Windows (5 minutes)

```powershell
# Install Rust from https://rustup.rs/
# Then:
cargo build --release
.\target\release\wofes-sff-browser.exe
```

### Docker (1 minute)

```bash
docker-compose up -d
```

Open browser: http://localhost:8080

## First Launch

1. Browser opens on http://localhost:8080
2. Tor automatically starts (may take 30 seconds)
3. You'll see the home screen with animated search bar
4. Type any URL or search query

## Quick Features Test

### Test .onion sites
```
Visit: https://www.bbcnewsd73hkzno2ini43t4gblxvycyac5aw4gnv7t2rccijh7745uqd.onion
```

### Enable VPN
1. Click VPN button (top right)
2. Select server
3. Click "Enable VPN"

### Anti-Screenshot
1. Click account menu (top right)
2. Toggle "Anti-screenshot"
3. Try taking screenshot (should be blocked on Windows/Android)

## Default Settings

- **Tor**: Enabled
- **Anti-Screenshot**: Enabled
- **WebRTC**: Blocked
- **Canvas Fingerprinting**: Protected
- **DNS**: System default
- **Theme**: Dark with raindrops wallpaper

## Keyboard Shortcuts

- Ctrl+T: New tab
- Ctrl+W: Close tab
- F11: Fullscreen
- F12: Developer tools

## Documentation

Full documentation in extracted folder:
- `README.md` - Overview and features
- `INSTALLATION.md` - Detailed installation
- `CONFIGURATION.md` - All settings
- `SECURITY.md` - Security best practices
- `CONTRIBUTING.md` - How to contribute

## Support

- GitHub Issues: https://github.com/wofes/sff-browser/issues
- Documentation: See extracted files
- Security: security@wofes.org

## Customization

Right-click anywhere > "Customize" to change:
- Colors and transparency
- Wallpaper
- Widget positions
- Quick links
- Corner text

## Troubleshooting

**Tor not connecting?**
```bash
# Check status
curl http://localhost:8080/api/tor/status

# Restart
curl -X POST http://localhost:8080/api/tor/stop
curl -X POST http://localhost:8080/api/tor/start
```

**Port 8080 in use?**
```bash
export WOFES_PORT=8081
cargo run --release
```

**Build errors?**
See INSTALLATION.md for platform-specific dependencies.

---

**WOFES SFF** - Complete anonymous browser with Tor support
