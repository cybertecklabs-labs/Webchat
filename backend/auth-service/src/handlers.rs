use axum::{extract::State, http::StatusCode, Json};
use mongodb::{bson::doc, Collection};
use validator::Validate;

use crate::{
    auth::{create_jwt, hash_password, verify_password},
    models::*,
};

pub async fn register(
    State(db): State<mongodb::Database>,
    Json(payload): Json<RegisterRequest>,
) -> Result<Json<&'static str>, (StatusCode, String)> {
    // Validate input
    payload.validate()
        .map_err(|e| (StatusCode::BAD_REQUEST, format!("Validation error: {}", e)))?;

    let users: Collection<User> = db.collection("users");

    // Check if user exists
    if users
        .find_one(doc! { "email": &payload.email })
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
        .is_some()
    {
        return Err((StatusCode::CONFLICT, "Email already exists".to_string()));
    }

    let password_hash = hash_password(&payload.password)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let user = User {
        id: None,
        username: payload.username,
        email: payload.email,
        password_hash,
        created_at: chrono::Utc::now(),
    };

    users
        .insert_one(user)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(Json("User registered successfully"))
}

pub async fn login(
    State(db): State<mongodb::Database>,
    Json(payload): Json<LoginRequest>,
) -> Result<Json<AuthResponse>, (StatusCode, String)> {
    // Validate input
    payload.validate()
        .map_err(|e| (StatusCode::BAD_REQUEST, format!("Validation error: {}", e)))?;

    let users: Collection<User> = db.collection("users");

    let user = users
        .find_one(doc! { "email": &payload.email })
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
        .ok_or((StatusCode::UNAUTHORIZED, "Invalid credentials".to_string()))?;

    if !verify_password(&payload.password, &user.password_hash)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
    {
        return Err((StatusCode::UNAUTHORIZED, "Invalid credentials".to_string()));
    }

    let token = create_jwt(&user.id.unwrap().to_string())
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(Json(AuthResponse {
        token,
        user: UserResponse {
            id: user.id.unwrap().to_string(),
            username: user.username,
            email: user.email,
        },
    }))
}
