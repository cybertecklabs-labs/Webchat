use axum::{extract::State, http::StatusCode, Json};
use futures_util::TryStreamExt;
use mongodb::{bson::doc, Collection};

use crate::{auth::AuthUser, models::*};

pub async fn list_servers(
    State((db, _redis)): State<(mongodb::Database, redis::Client)>,
    _user: AuthUser,
) -> Result<Json<Vec<Server>>, StatusCode> {
    let servers: Collection<Server> = db.collection("servers");
    let cursor = servers
        .find(doc! {})
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    let results: Vec<Server> = cursor
        .try_collect()
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    Ok(Json(results))
}

pub async fn create_server(
    State((db, _redis)): State<(mongodb::Database, redis::Client)>,
    user: AuthUser,
    Json(payload): Json<CreateServerRequest>,
) -> Result<Json<Server>, StatusCode> {
    let owner_id = mongodb::bson::oid::ObjectId::parse_str(&user.0)
        .map_err(|_| StatusCode::BAD_REQUEST)?;
    
    let server = Server {
        id: None,
        name: payload.name,
        owner_id,
        invite_code: nanoid::nanoid!(10),
        created_at: chrono::Utc::now(),
    };
    
    let servers: Collection<Server> = db.collection("servers");
    let result = servers
        .insert_one(&server)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    let mut server = server;
    server.id = Some(result.inserted_id.as_object_id().unwrap());
    
    Ok(Json(server))
}
