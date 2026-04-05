FROM rust:1.75-slim as builder

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    pkg-config \
    libssl-dev \
    libsqlite3-dev \
    wget \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY Cargo.toml Cargo.lock ./
COPY core ./core
COPY ui ./ui
COPY tor-integration ./tor-integration
COPY vpn-manager ./vpn-manager
COPY src ./src

RUN cargo build --release

FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y \
    tor \
    openvpn \
    wireguard-tools \
    ca-certificates \
    libssl3 \
    libsqlite3-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/target/release/wofes-sff-browser /app/
COPY ui/static /app/ui/static

RUN useradd -m -s /bin/bash wofes && \
    chown -R wofes:wofes /app && \
    mkdir -p /home/wofes/.local/share/wofes-sff && \
    chown -R wofes:wofes /home/wofes

USER wofes

EXPOSE 8080

ENV RUST_LOG=info
ENV WOFES_DATA_DIR=/home/wofes/.local/share/wofes-sff

CMD ["/app/wofes-sff-browser"]
