use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    Json,
};
use futures_util::TryStreamExt;
use mongodb::{bson::doc, options::FindOptions, Collection};
use redis::AsyncCommands;
use serde::Deserialize;

use crate::{auth::AuthUser, models::*};

#[derive(Debug, Deserialize)]
pub struct MessageQuery {
    limit: Option<i64>,
    before: Option<String>,
}

pub async fn get_messages(
    State((db, _redis)): State<(mongodb::Database, redis::Client)>,
    Path(channel_id): Path<String>,
    Query(query): Query<MessageQuery>,
    _user: AuthUser,
) -> Result<Json<Vec<Message>>, StatusCode> {
    let channel_oid = mongodb::bson::oid::ObjectId::parse_str(&channel_id)
        .map_err(|_| StatusCode::BAD_REQUEST)?;
    
    let mut filter = doc! { "channel_id": channel_oid };
    
    if let Some(before_id) = query.before {
        let before_oid = mongodb::bson::oid::ObjectId::parse_str(&before_id)
            .map_err(|_| StatusCode::BAD_REQUEST)?;
        filter.insert("_id", doc! { "$lt": before_oid });
    }
    
    let options = FindOptions::builder()
        .limit(query.limit.unwrap_or(50))
        .sort(doc! { "created_at": -1 })
        .build();
    
    let messages: Collection<Message> = db.collection("messages");
    let cursor = messages
        .find(filter)
        .with_options(options)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    let results: Vec<Message> = cursor
        .try_collect()
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    Ok(Json(results))
}

pub async fn send_message(
    State((db, redis)): State<(mongodb::Database, redis::Client)>,
    Path(channel_id): Path<String>,
    user: AuthUser,
    Json(payload): Json<SendMessageRequest>,
) -> Result<Json<Message>, StatusCode> {
    let channel_oid = mongodb::bson::oid::ObjectId::parse_str(&channel_id)
        .map_err(|_| StatusCode::BAD_REQUEST)?;
    let user_oid = mongodb::bson::oid::ObjectId::parse_str(&user.0)
        .map_err(|_| StatusCode::BAD_REQUEST)?;
    
    let message = Message {
        id: None,
        channel_id: channel_oid,
        user_id: user_oid,
        content: payload.content,
        attachments: payload.attachments.unwrap_or_default(),
        created_at: chrono::Utc::now(),
    };
    
    let messages: Collection<Message> = db.collection("messages");
    let result = messages
        .insert_one(&message)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    let mut message = message;
    message.id = Some(result.inserted_id.as_object_id().unwrap());
    
    // Publish to Redis for real-time delivery
    let mut conn = redis.get_async_connection().await.unwrap();
    let message_json = serde_json::to_string(&message).unwrap();
    let _: () = conn.publish("chat:messages", message_json).await.unwrap();
    
    Ok(Json(message))
}
