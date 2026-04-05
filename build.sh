#!/bin/bash

set -e

echo "WOFES SFF Browser - Multi-Platform Build Script"
echo "================================================"

PLATFORM=${1:-all}

build_desktop() {
    echo "Building Desktop platforms..."
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "Building for Linux..."
        cargo build --release --target x86_64-unknown-linux-gnu
        echo "Linux build complete: target/x86_64-unknown-linux-gnu/release/wofes-sff-browser"
    fi
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "Building for macOS..."
        cargo build --release --target x86_64-apple-darwin
        cargo build --release --target aarch64-apple-darwin
        echo "macOS builds complete"
    fi
    
    if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
        echo "Building for Windows..."
        cargo build --release --target x86_64-pc-windows-msvc
        echo "Windows build complete: target/x86_64-pc-windows-msvc/release/wofes-sff-browser.exe"
    fi
}

build_android() {
    echo "Building for Android..."
    
    if ! command -v cargo-ndk &> /dev/null; then
        echo "Installing cargo-ndk..."
        cargo install cargo-ndk
    fi
    
    cd platform-mobile/android
    
    cargo ndk -t armeabi-v7a -t arm64-v8a -t x86 -t x86_64 -o app/src/main/jniLibs build --release
    
    ./gradlew assembleRelease
    
    echo "Android build complete: platform-mobile/android/app/build/outputs/apk/release/app-release.apk"
    cd ../..
}

build_ios() {
    echo "Building for iOS..."
    
    if [[ "$OSTYPE" != "darwin"* ]]; then
        echo "iOS builds require macOS"
        exit 1
    fi
    
    if ! command -v cargo-lipo &> /dev/null; then
        echo "Installing cargo-lipo..."
        cargo install cargo-lipo
    fi
    
    cargo lipo --release --targets aarch64-apple-ios
    
    cd platform-mobile/ios
    xcodebuild -scheme WOFESSFF -configuration Release -archivePath build/WOFESSFF.xcarchive archive
    xcodebuild -exportArchive -archivePath build/WOFESSFF.xcarchive -exportPath build/ipa -exportOptionsPlist ExportOptions.plist
    
    echo "iOS build complete: platform-mobile/ios/build/ipa/WOFESSFF.ipa"
    cd ../..
}

build_web() {
    echo "Building Web/PWA version..."
    
    cargo build --release --target wasm32-unknown-unknown
    
    if ! command -v wasm-bindgen &> /dev/null; then
        echo "Installing wasm-bindgen..."
        cargo install wasm-bindgen-cli
    fi
    
    wasm-bindgen target/wasm32-unknown-unknown/release/wofes_sff_browser.wasm \
        --out-dir ui/static/wasm \
        --target web \
        --no-typescript
    
    echo "Web/PWA build complete: ui/static/wasm/"
}

setup_dependencies() {
    echo "Setting up build dependencies..."
    
    rustup target add x86_64-unknown-linux-gnu
    rustup target add x86_64-apple-darwin
    rustup target add aarch64-apple-darwin
    rustup target add x86_64-pc-windows-msvc
    rustup target add aarch64-linux-android
    rustup target add armv7-linux-androideabi
    rustup target add i686-linux-android
    rustup target add x86_64-linux-android
    rustup target add aarch64-apple-ios
    rustup target add wasm32-unknown-unknown
    
    echo "Dependencies setup complete"
}

case $PLATFORM in
    desktop)
        build_desktop
        ;;
    android)
        build_android
        ;;
    ios)
        build_ios
        ;;
    web)
        build_web
        ;;
    setup)
        setup_dependencies
        ;;
    all)
        build_desktop
        build_android
        build_ios
        build_web
        ;;
    *)
        echo "Usage: $0 {desktop|android|ios|web|setup|all}"
        exit 1
        ;;
esac

echo ""
echo "Build complete!"
echo "================================================"
