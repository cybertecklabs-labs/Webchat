use axum::{extract::State, http::StatusCode, Json};
use mongodb::{bson::doc, Collection};

use crate::{auth, models::*};

pub async fn register(
    State(db): State<mongodb::Database>,
    Json(payload): Json<RegisterRequest>,
) -> Result<Json<String>, StatusCode> {
    let users: Collection<User> = db.collection("users");
    
    // Check if user already exists
    if users
        .find_one(doc! { "email": &payload.email })
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .is_some()
    {
        return Err(StatusCode::CONFLICT);
    }
    
    let password_hash = auth::hash_password(&payload.password);
    let user = User {
        id: None,
        username: payload.username,
        email: payload.email,
        password_hash,
    };
    
    users
        .insert_one(user)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    Ok(Json("User registered successfully".to_string()))
}

pub async fn login(
    State(db): State<mongodb::Database>,
    Json(payload): Json<LoginRequest>,
) -> Result<Json<LoginResponse>, StatusCode> {
    let users: Collection<User> = db.collection("users");
    
    let user = users
        .find_one(doc! { "email": &payload.email })
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::UNAUTHORIZED)?;
    
    if !auth::verify_password(&payload.password, &user.password_hash) {
        return Err(StatusCode::UNAUTHORIZED);
    }
    
    let user_id = user.id.unwrap().to_hex();
    let token = auth::create_jwt(&user_id);
    
    Ok(Json(LoginResponse {
        token,
        user: UserResponse {
            id: user_id,
            username: user.username,
            email: user.email,
        },
    }))
}
