use serde::{Deserialize, Serialize};
use bson::oid::ObjectId;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct User {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub username: String,
    pub email: String,
    pub password_hash: String,
    pub servers: Vec<ObjectId>,
    pub created_at: DateTime<Utc>,
    pub last_seen: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AuthResponse {
    pub access_token: String,
    pub refresh_token: String,
    pub user: UserResponse,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UserResponse {
    pub id: String,
    pub username: String,
    pub email: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Server {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub name: String,
    pub icon_url: Option<String>,
    pub owner_id: ObjectId,
    pub roles: Vec<Role>,
    pub channels: Vec<ObjectId>,
    pub members: Vec<Member>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Role {
    pub role_id: ObjectId,
    pub name: String,
    pub permissions: u64, // Bitfield
    pub color: String,
    pub position: i32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Member {
    pub user_id: ObjectId,
    pub roles: Vec<ObjectId>,
    pub joined_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Channel {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub server_id: ObjectId,
    pub name: String,
    pub channel_type: ChannelType,
    pub topic: Option<String>,
    pub position: i32,
    pub permissions: Vec<PermissionOverride>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum ChannelType {
    Text,
    Voice,
    Announcement,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PermissionOverride {
    pub role_id: ObjectId,
    pub allow: u64,
    pub deny: u64,
}

pub const PERMISSIONS: u64 = 0xFF; // Simple placeholder for all permissions
