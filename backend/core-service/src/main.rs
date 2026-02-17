mod auth;
mod db;
mod models;
mod routes;
mod websocket;

use axum::{routing::{get, post}, Router};
use dotenv::dotenv;
use std::net::SocketAddr;
use tower_http::{cors::CorsLayer, trace::TraceLayer};

#[tokio::main]
async fn main() {
    dotenv().ok();
    
    let db = db::get_database().await.expect("DB connection failed");
    let redis_client = redis::Client::open("redis://redis:6379").expect("Redis connection failed");

    let cors = CorsLayer::permissive();

    let app = Router::new()
        .route("/servers", get(routes::servers::list_servers).post(routes::servers::create_server))
        .route("/servers/:server_id/channels", get(routes::channels::list_channels).post(routes::channels::create_channel))
        .route("/channels/:channel_id/messages", get(routes::messages::get_messages).post(routes::messages::send_message))
        .route("/ws", get(websocket::ws_handler))
        .layer(cors)
        .layer(TraceLayer::new_for_http())
        .with_state((db, redis_client));

    let addr = SocketAddr::from(([0, 0, 0, 0], 8080));
    println!("🚀 Core service running on {}", addr);
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}
