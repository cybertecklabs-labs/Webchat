use axum::{
    extract::{State, Json},
    http::StatusCode,
    response::IntoResponse,
};
use common::models::{User, UserResponse};
use crate::auth_utils::hash_password;
use mongodb::{Database, bson::doc, bson::oid::ObjectId};
use chrono::Utc;
use serde::Deserialize;

#[derive(Deserialize)]
pub struct RegisterRequest {
    pub username: String,
    pub email: String,
    pub password: String,
}

pub async fn register(
    State(db): State<Database>,
    Json(payload): Json<RegisterRequest>,
) -> impl IntoResponse {
    let users = db.collection::<User>("users");

    // Check if user exists
    let filter = doc! { "$or": [ { "username": &payload.username }, { "email": &payload.email } ] };
    if let Ok(Some(_)) = users.find_one(filter, None).await {
        return (StatusCode::CONFLICT, "Username or email already exists").into_response();
    }

    let new_user = User {
        id: None,
        username: payload.username,
        email: payload.email,
        password_hash: hash_password(&payload.password),
        servers: vec![],
        created_at: Utc::now(),
        last_seen: None,
    };

    match users.insert_one(new_user, None).await {
        Ok(result) => {
            let id = result.inserted_id.as_object_id().unwrap();
            (StatusCode::CREATED, Json(UserResponse {
                id: id.to_hex(),
                username: payload.username,
                email: payload.email,
            })).into_response()
        }
        Err(_) => (StatusCode::INTERNAL_SERVER_ERROR, "Failed to create user").into_response(),
    }
}

#[derive(Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

pub async fn login(
    State(db): State<Database>,
    Json(payload): Json<LoginRequest>,
) -> impl IntoResponse {
    let users = db.collection::<User>("users");
    let secret = std::env::var("JWT_SECRET").expect("JWT_SECRET must be set");

    let filter = doc! { "email": &payload.email };
    match users.find_one(filter, None).await {
        Ok(Some(user)) => {
            if crate::auth_utils::verify_password(&payload.password, &user.password_hash) {
                let user_id = user.id.unwrap().to_hex();
                let token = crate::auth_utils::create_jwt(&user_id, &secret, 3600).unwrap();

                (StatusCode::OK, Json(serde_json::json!({
                    "access_token": token,
                    "user": {
                        "id": user_id,
                        "username": user.username,
                        "email": user.email
                    }
                }))).into_response()
            } else {
                (StatusCode::UNAUTHORIZED, "Invalid credentials").into_response()
            }
        }
        _ => (StatusCode::UNAUTHORIZED, "Invalid credentials").into_response(),
    }
}
