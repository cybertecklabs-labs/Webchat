use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use futures_util::TryStreamExt;
use mongodb::{bson::doc, Collection};

use crate::{auth::AuthUser, models::*};

pub async fn list_channels(
    State((db, _redis)): State<(mongodb::Database, redis::Client)>,
    Path(server_id): Path<String>,
    _user: AuthUser,
) -> Result<Json<Vec<Channel>>, StatusCode> {
    let server_oid = mongodb::bson::oid::ObjectId::parse_str(&server_id)
        .map_err(|_| StatusCode::BAD_REQUEST)?;
    
    let channels: Collection<Channel> = db.collection("channels");
    let cursor = channels
        .find(doc! { "server_id": server_oid })
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    let results: Vec<Channel> = cursor
        .try_collect()
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    Ok(Json(results))
}

pub async fn create_channel(
    State((db, _redis)): State<(mongodb::Database, redis::Client)>,
    Path(server_id): Path<String>,
    _user: AuthUser,
    Json(payload): Json<CreateChannelRequest>,
) -> Result<Json<Channel>, StatusCode> {
    let server_oid = mongodb::bson::oid::ObjectId::parse_str(&server_id)
        .map_err(|_| StatusCode::BAD_REQUEST)?;
    
    let channel = Channel {
        id: None,
        server_id: server_oid,
        name: payload.name,
        channel_type: payload.channel_type,
        topic: payload.topic,
        created_at: chrono::Utc::now(),
    };
    
    let channels: Collection<Channel> = db.collection("channels");
    let result = channels
        .insert_one(&channel)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    let mut channel = channel;
    channel.id = Some(result.inserted_id.as_object_id().unwrap());
    
    Ok(Json(channel))
}
