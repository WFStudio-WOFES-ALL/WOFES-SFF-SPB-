use axum::{
    extract::{State, Json},
    routing::{get, post},
    Router,
    response::{Html, IntoResponse},
    http::StatusCode,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tower_http::services::ServeDir;
use wofes_core::BrowserEngine;
use wofes_tor::TorManager;
use wofes_vpn::VpnManager;

pub struct AppState {
    browser: Arc<BrowserEngine>,
    tor: Arc<TorManager>,
    vpn: Arc<VpnManager>,
}

pub async fn start_server() -> anyhow::Result<()> {
    let browser = Arc::new(BrowserEngine::new()?);
    let tor = Arc::new(TorManager::new(wofes_tor::TorConfig::default()));
    let vpn = Arc::new(VpnManager::new());

    tor.start().await?;

    let state = Arc::new(AppState { browser, tor, vpn });

    let app = Router::new()
        .route("/", get(serve_index))
        .route("/api/config", get(get_config).post(update_config))
        .route("/api/tor/status", get(tor_status))
        .route("/api/tor/start", post(tor_start))
        .route("/api/tor/stop", post(tor_stop))
        .route("/api/tor/new-circuit", post(tor_new_circuit))
        .route("/api/vpn/connect", post(vpn_connect))
        .route("/api/vpn/disconnect", post(vpn_disconnect))
        .route("/api/vpn/status", get(vpn_status))
        .route("/api/network/ip", get(get_current_ip))
        .route("/api/network/dns", post(set_dns))
        .route("/api/privacy/anti-screenshot", post(set_anti_screenshot))
        .route("/api/privacy/anti-capture", post(set_anti_capture))
        .route("/api/history/clear", post(clear_history))
        .route("/api/data/delete-all", post(delete_all_data))
        .route("/api/news", get(get_news))
        .nest_service("/assets", ServeDir::new("ui/static/assets"))
        .nest_service("/static", ServeDir::new("ui/static"))
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("127.0.0.1:8080").await?;
    tracing::info!("WOFES SFF Browser running on http://127.0.0.1:8080");
    
    axum::serve(listener, app).await?;
    Ok(())
}

async fn serve_index() -> Html<String> {
    let html = tokio::fs::read_to_string("ui/static/index.html")
        .await
        .unwrap_or_else(|_| "<h1>Error loading page</h1>".to_string());
    Html(html)
}

async fn get_config(State(state): State<Arc<AppState>>) -> Json<wofes_core::BrowserConfig> {
    Json(state.browser.get_config())
}

async fn update_config(
    State(state): State<Arc<AppState>>,
    Json(config): Json<wofes_core::BrowserConfig>,
) -> StatusCode {
    match state.browser.update_config(config) {
        Ok(_) => StatusCode::OK,
        Err(_) => StatusCode::INTERNAL_SERVER_ERROR,
    }
}

#[derive(Serialize)]
struct TorStatus {
    enabled: bool,
    running: bool,
}

async fn tor_status(State(state): State<Arc<AppState>>) -> Json<TorStatus> {
    Json(TorStatus {
        enabled: state.browser.get_config().tor.enabled,
        running: state.tor.is_running(),
    })
}

async fn tor_start(State(state): State<Arc<AppState>>) -> StatusCode {
    match state.tor.start().await {
        Ok(_) => StatusCode::OK,
        Err(_) => StatusCode::INTERNAL_SERVER_ERROR,
    }
}

async fn tor_stop(State(state): State<Arc<AppState>>) -> StatusCode {
    match state.tor.stop().await {
        Ok(_) => StatusCode::OK,
        Err(_) => StatusCode::INTERNAL_SERVER_ERROR,
    }
}

async fn tor_new_circuit(State(state): State<Arc<AppState>>) -> StatusCode {
    match state.tor.new_circuit().await {
        Ok(_) => StatusCode::OK,
        Err(_) => StatusCode::INTERNAL_SERVER_ERROR,
    }
}

#[derive(Deserialize)]
struct VpnConnectRequest {
    server: String,
    protocol: String,
}

async fn vpn_connect(
    State(state): State<Arc<AppState>>,
    Json(req): Json<VpnConnectRequest>,
) -> StatusCode {
    let protocol = match req.protocol.as_str() {
        "wireguard" => wofes_vpn::VpnProtocol::WireGuard,
        "openvpn" => wofes_vpn::VpnProtocol::OpenVPN,
        _ => return StatusCode::BAD_REQUEST,
    };

    let server = wofes_vpn::VpnServer {
        id: uuid::Uuid::new_v4().to_string(),
        name: req.server.clone(),
        country: "Unknown".to_string(),
        city: None,
        host: req.server,
        port: 1194,
        protocol,
        config: None,
    };

    match state.vpn.connect(server).await {
        Ok(_) => StatusCode::OK,
        Err(_) => StatusCode::INTERNAL_SERVER_ERROR,
    }
}

async fn vpn_disconnect(State(state): State<Arc<AppState>>) -> StatusCode {
    match state.vpn.disconnect().await {
        Ok(_) => StatusCode::OK,
        Err(_) => StatusCode::INTERNAL_SERVER_ERROR,
    }
}

#[derive(Serialize)]
struct VpnStatus {
    connected: bool,
    server: Option<String>,
}

async fn vpn_status(State(state): State<Arc<AppState>>) -> Json<VpnStatus> {
    let server = state.vpn.get_current_server().map(|s| s.name);
    Json(VpnStatus {
        connected: state.vpn.is_connected(),
        server,
    })
}

#[derive(Serialize)]
struct IpResponse {
    ip: String,
}

async fn get_current_ip() -> Json<IpResponse> {
    let ip = reqwest::get("https://api.ipify.org")
        .await
        .ok()
        .and_then(|r| r.text().await.ok())
        .unwrap_or_else(|| "Unknown".to_string());
    
    Json(IpResponse { ip })
}

#[derive(Deserialize)]
struct DnsRequest {
    dns: Vec<String>,
}

async fn set_dns(
    State(_state): State<Arc<AppState>>,
    Json(_req): Json<DnsRequest>,
) -> StatusCode {
    StatusCode::OK
}

#[derive(Deserialize)]
struct PrivacyRequest {
    enabled: bool,
}

async fn set_anti_screenshot(
    State(_state): State<Arc<AppState>>,
    Json(_req): Json<PrivacyRequest>,
) -> StatusCode {
    StatusCode::OK
}

async fn set_anti_capture(
    State(_state): State<Arc<AppState>>,
    Json(_req): Json<PrivacyRequest>,
) -> StatusCode {
    StatusCode::OK
}

async fn clear_history(State(state): State<Arc<AppState>>) -> StatusCode {
    match state.browser.clear_history() {
        Ok(_) => StatusCode::OK,
        Err(_) => StatusCode::INTERNAL_SERVER_ERROR,
    }
}

async fn delete_all_data(State(state): State<Arc<AppState>>) -> StatusCode {
    match state.browser.delete_all_data() {
        Ok(_) => StatusCode::OK,
        Err(_) => StatusCode::INTERNAL_SERVER_ERROR,
    }
}

#[derive(Serialize)]
struct NewsItem {
    time: String,
    title: String,
    url: String,
}

async fn get_news() -> Json<Vec<NewsItem>> {
    let news = vec![
        NewsItem {
            time: "2h ago".to_string(),
            title: "Example news article 1".to_string(),
            url: "https://example.com/1".to_string(),
        },
        NewsItem {
            time: "4h ago".to_string(),
            title: "Example news article 2".to_string(),
            url: "https://example.com/2".to_string(),
        },
        NewsItem {
            time: "6h ago".to_string(),
            title: "Example news article 3".to_string(),
            url: "https://example.com/3".to_string(),
        },
    ];
    
    Json(news)
}
