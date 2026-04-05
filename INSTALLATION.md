# WOFES SFF Browser - Installation Guide

## Quick Start

### Option 1: Docker (Recommended for Testing)

```bash
# Clone repository
git clone https://github.com/wofes/sff-browser.git
cd sff-browser

# Start with Docker Compose
docker-compose up -d

# Access browser at http://localhost:8080
```

### Option 2: Native Installation

#### Windows

1. **Download and Install Rust**
   ```powershell
   # Download from https://rustup.rs/
   # Run the installer and follow prompts
   ```

2. **Install Visual Studio Build Tools**
   - Download from https://visualstudio.microsoft.com/downloads/
   - Install "Desktop development with C++"

3. **Build WOFES SFF**
   ```powershell
   git clone https://github.com/wofes/sff-browser.git
   cd sff-browser
   cargo build --release
   ```

4. **Run**
   ```powershell
   .\target\release\wofes-sff-browser.exe
   ```

#### Linux (Ubuntu/Debian)

```bash
# Install dependencies
sudo apt update
sudo apt install -y build-essential curl wget git \
    libssl-dev pkg-config libsqlite3-dev \
    libwebkit2gtk-4.0-dev libgtk-3-dev \
    libayatana-appindicator3-dev librsvg2-dev

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Clone and build
git clone https://github.com/wofes/sff-browser.git
cd sff-browser
cargo build --release

# Run
./target/release/wofes-sff-browser
```

#### Linux (Fedora)

```bash
# Install dependencies
sudo dnf install -y gcc openssl-devel sqlite-devel \
    webkit2gtk3-devel gtk3-devel \
    libappindicator-gtk3-devel librsvg2-devel

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Clone and build
git clone https://github.com/wofes/sff-browser.git
cd sff-browser
cargo build --release

# Run
./target/release/wofes-sff-browser
```

#### macOS

```bash
# Install Xcode Command Line Tools
xcode-select --install

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Clone and build
git clone https://github.com/wofes/sff-browser.git
cd sff-browser
cargo build --release

# Run
./target/release/wofes-sff-browser
```

## Android Installation

### Prerequisites
- Android Studio with SDK and NDK
- Java Development Kit (JDK) 11+

### Build Steps

```bash
# Set environment variables
export ANDROID_HOME=$HOME/Android/Sdk
export NDK_HOME=$ANDROID_HOME/ndk/25.2.9519653

# Install cargo-ndk
cargo install cargo-ndk

# Add Android targets
rustup target add aarch64-linux-android
rustup target add armv7-linux-androideabi
rustup target add x86_64-linux-android
rustup target add i686-linux-android

# Build
./build.sh android

# Install APK
adb install platform-mobile/android/app/build/outputs/apk/release/app-release.apk
```

## iOS Installation

### Prerequisites
- macOS with Xcode 14+
- iOS Developer Account (for device deployment)

### Build Steps

```bash
# Install cargo-lipo
cargo install cargo-lipo

# Add iOS targets
rustup target add aarch64-apple-ios
rustup target add x86_64-apple-ios

# Build
./build.sh ios

# Open in Xcode
open platform-mobile/ios/WOFESSFF.xcodeproj
```

## Web/PWA Deployment

### Local Development

```bash
# Build web version
./build.sh web

# Serve with any static server
cd ui/static
python3 -m http.server 8080

# Or use Node.js
npx serve
```

### Production Deployment

#### Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        root /var/www/wofes-sff/ui/static;
        try_files $uri $uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### Apache Configuration

```apache
<VirtualHost *:80>
    ServerName yourdomain.com
    DocumentRoot /var/www/wofes-sff/ui/static
    
    <Directory /var/www/wofes-sff/ui/static>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    ProxyPass /api/ http://127.0.0.1:8080/api/
    ProxyPassReverse /api/ http://127.0.0.1:8080/api/
</VirtualHost>
```

## Tor Setup

WOFES SFF uses embedded Tor by default. For custom Tor configuration:

### Linux

```bash
# Install Tor
sudo apt install tor

# Configure Tor
sudo nano /etc/tor/torrc

# Add:
SocksPort 9050
ControlPort 9051
CookieAuthentication 1

# Restart Tor
sudo systemctl restart tor
```

### Windows

1. Download Tor Expert Bundle from https://www.torproject.org/download/tor/
2. Extract to `C:\Tor`
3. Create `torrc` file with:
   ```
   SocksPort 9050
   ControlPort 9051
   ```
4. Run `tor.exe -f torrc`

### macOS

```bash
# Install via Homebrew
brew install tor

# Configure
nano /usr/local/etc/tor/torrc

# Add:
SocksPort 9050
ControlPort 9051

# Start Tor
brew services start tor
```

## VPN Setup

### WireGuard Configuration

Create `wg0.conf`:

```ini
[Interface]
PrivateKey = YOUR_PRIVATE_KEY
Address = 10.0.0.2/24
DNS = 1.1.1.1

[Peer]
PublicKey = SERVER_PUBLIC_KEY
Endpoint = vpn.example.com:51820
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 25
```

Import via WOFES SFF settings.

### OpenVPN Configuration

Use standard `.ovpn` configuration files. Import via settings panel.

## Troubleshooting

### Build Errors

**"linker 'cc' not found"**
```bash
# Linux
sudo apt install build-essential

# macOS
xcode-select --install
```

**"openssl not found"**
```bash
# Linux
sudo apt install libssl-dev

# macOS
brew install openssl
```

### Runtime Errors

**"Port 8080 already in use"**
```bash
# Kill process using port
lsof -ti:8080 | xargs kill -9

# Or change port in config
export WOFES_PORT=8081
```

**"Tor connection failed"**
```bash
# Check Tor status
systemctl status tor

# Restart Tor
sudo systemctl restart tor
```

### Permission Errors

**Linux: "Permission denied" for VPN**
```bash
# Add user to required groups
sudo usermod -aG netdev $USER

# Or run with sudo (not recommended for daily use)
sudo ./wofes-sff-browser
```

**macOS: "Network extension not permitted"**
- Go to System Preferences > Security & Privacy
- Allow WOFES SFF to modify network settings

## Updating

### From Source

```bash
cd wofes-sff-browser
git pull origin main
cargo build --release
```

### Docker

```bash
docker-compose pull
docker-compose up -d
```

## Uninstallation

### Linux/macOS

```bash
# Remove binary
rm -rf wofes-sff-browser

# Remove data
rm -rf ~/.local/share/wofes-sff
rm -rf ~/.config/wofes-sff
```

### Windows

```powershell
# Remove installation directory
Remove-Item -Recurse -Force "C:\Program Files\WOFES SFF"

# Remove data
Remove-Item -Recurse -Force "$env:APPDATA\wofes-sff"
```

### Android

```bash
adb uninstall com.wofes.sff
```

### iOS

Delete app from device.

## Next Steps

- [Configuration Guide](CONFIGURATION.md)
- [User Manual](USER_MANUAL.md)
- [Developer Documentation](DEVELOPMENT.md)
- [Security Best Practices](SECURITY.md)
