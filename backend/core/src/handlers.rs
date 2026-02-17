use axum::{
    extract::{State, Json},
    http::StatusCode,
    response::IntoResponse,
};
use common::models::{Server, Role, Member};
use mongodb::{Database, bson::doc, bson::oid::ObjectId};
use chrono::Utc;
use serde::Deserialize;

#[derive(Deserialize)]
pub struct CreateServerRequest {
    pub name: String,
    pub owner_id: String, // In reality, this would come from the JWT claims
}

pub async fn create_server(
    State(db): State<Database>,
    Json(payload): Json<CreateServerRequest>,
) -> impl IntoResponse {
    let servers = db.collection::<Server>("servers");
    let owner_id = ObjectId::parse_str(&payload.owner_id).unwrap();

    let new_server = Server {
        id: None,
        name: payload.name,
        icon_url: None,
        owner_id,
        roles: vec![
            Role {
                role_id: ObjectId::new(),
                name: "@everyone".to_string(),
                permissions: 0x1, // Placeholder
                color: "#ffffff".to_string(),
                position: 0,
            }
        ],
        channels: vec![],
        members: vec![
            Member {
                user_id: owner_id,
                roles: vec![],
                joined_at: Utc::now(),
            }
        ],
        created_at: Utc::now(),
    };

    match servers.insert_one(new_server, None).await {
        Ok(result) => {
            let id = result.inserted_id.as_object_id().unwrap();
            (StatusCode::CREATED, Json(serde_json::json!({ "id": id.to_hex() }))).into_response()
        }
        Err(_) => (StatusCode::INTERNAL_SERVER_ERROR, "Failed to create server").into_response(),
    }
}
