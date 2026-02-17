mod pubsub;
mod handlers;

use axum::{routing::get, Router};
use std::net::SocketAddr;
use tokio::net::TcpListener;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
use dotenvy::dotenv;
use std::env;
use std::sync::Arc;

#[tokio::main]
async fn main() {
    dotenv().ok();
    
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            env::var("RUST_LOG").unwrap_or_else(|_| "realtime=debug,tower_http=debug".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    let redis_uri = env::var("REDIS_URI").expect("REDIS_URI must be set");
    let redis_client = pubsub::get_redis_client(&redis_uri).await.expect("Failed to connect to Redis");
    let redis_client = Arc::new(redis_client);
    tracing::info!("Connected to Redis (Realtime)");

    let app = Router::new()
        .route("/health", get(|| async { "Realtime Service is Healthy" }))
        .route("/ws", get(handlers::ws_handler))
        .with_state(redis_client);

    let port = env::var("REALTIME_PORT").unwrap_or_else(|_| "3003".into());
    let addr: SocketAddr = format!("0.0.0.0:{}", port).parse().expect("Invalid address");
    
    tracing::info!("Listening on {}", addr);
    let listener = TcpListener::bind(&addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
