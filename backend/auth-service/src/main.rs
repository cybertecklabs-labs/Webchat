mod handlers;
mod models;
mod auth;

use axum::{
    routing::post,
    Router,
};
use dotenv::dotenv;
use mongodb::Client;
use std::net::SocketAddr;
use tower_http::cors::{Any, CorsLayer};

#[tokio::main]
async fn main() {
    dotenv().ok();
    let mongo_uri = std::env::var("MONGO_URI").expect("MONGO_URI must be set");
    let client = Client::with_uri_str(&mongo_uri).await.expect("Failed to connect to MongoDB");
    let db = client.database("webchat");

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/register", post(handlers::register))
        .route("/login", post(handlers::login))
        .layer(cors)
        .with_state(db);

    let addr = SocketAddr::from(([0, 0, 0, 0], 8081));
    println!("🔐 Auth service running on {}", addr);
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}
