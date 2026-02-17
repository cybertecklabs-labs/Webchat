mod db;
mod auth_utils;
mod handlers;

use axum::{routing::{get, post}, Router};
use std::net::SocketAddr;
use tokio::net::TcpListener;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
use dotenvy::dotenv;
use std::env;

#[tokio::main]
async fn main() {
    dotenv().ok();
    
    // Initialize tracing
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            env::var("RUST_LOG").unwrap_or_else(|_| "auth=debug,tower_http=debug".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    let mongo_uri = env::var("MONGO_URI").expect("MONGO_URI must be set");
    let db_name = env::var("DB_NAME").unwrap_or_else(|_| "webchat".into());
    
    let db = db::init_db(&mongo_uri, &db_name).await.expect("Failed to connect to MongoDB");
    tracing::info!("Connected to MongoDB");

    // Define routes
    let app = Router::new()
        .route("/health", get(|| async { "Auth Service is Healthy" }))
        .route("/register", post(handlers::register))
        .route("/login", post(handlers::login))
        .with_state(db);

    // Start server
    let port = env::var("AUTH_PORT").unwrap_or_else(|_| "3001".into());
    let addr: SocketAddr = format!("0.0.0.0:{}", port).parse().expect("Invalid address");
    
    tracing::info!("Listening on {}", addr);
    let listener = TcpListener::bind(&addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
