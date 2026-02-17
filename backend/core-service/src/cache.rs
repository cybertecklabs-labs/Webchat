use redis::{aio::ConnectionManager, AsyncCommands, Client};
use serde::{Deserialize, Serialize};
use std::time::Duration;

pub struct CacheManager {
    conn: ConnectionManager,
}

impl CacheManager {
    pub async fn new(redis_url: &str) -> redis::RedisResult<Self> {
        let client = Client::open(redis_url)?;
        let conn = ConnectionManager::new(client).await?;
        Ok(Self { conn })
    }

    // Cache server data
    pub async fn cache_server<T: Serialize>(
        &mut self,
        server_id: &str,
        data: &T,
        ttl_seconds: u64,
    ) -> redis::RedisResult<()> {
        let key = format!("server:{}", server_id);
        let value = serde_json::to_string(data).unwrap();
        self.conn.set_ex(&key, value, ttl_seconds).await
    }

    pub async fn get_server<T: for<'de> Deserialize<'de>>(
        &mut self,
        server_id: &str,
    ) -> redis::RedisResult<Option<T>> {
        let key = format!("server:{}", server_id);
        let value: Option<String> = self.conn.get(&key).await?;
        Ok(value.and_then(|v| serde_json::from_str(&v).ok()))
    }

    // Cache channel data
    pub async fn cache_channels<T: Serialize>(
        &mut self,
        server_id: &str,
        channels: &T,
        ttl_seconds: u64,
    ) -> redis::RedisResult<()> {
        let key = format!("channels:{}", server_id);
        let value = serde_json::to_string(channels).unwrap();
        self.conn.set_ex(&key, value, ttl_seconds).await
    }

    pub async fn get_channels<T: for<'de> Deserialize<'de>>(
        &mut self,
        server_id: &str,
    ) -> redis::RedisResult<Option<T>> {
        let key = format!("channels:{}", server_id);
        let value: Option<String> = self.conn.get(&key).await?;
        Ok(value.and_then(|v| serde_json::from_str(&v).ok()))
    }

    // Invalidate cache
    pub async fn invalidate(&mut self, pattern: &str) -> redis::RedisResult<()> {
        self.conn.del(pattern).await
    }

    // Cache user session
    pub async fn cache_session(
        &mut self,
        user_id: &str,
        session_data: &str,
        ttl_seconds: u64,
    ) -> redis::RedisResult<()> {
        let key = format!("session:{}", user_id);
        self.conn.set_ex(&key, session_data, ttl_seconds).await
    }

    pub async fn get_session(&mut self, user_id: &str) -> redis::RedisResult<Option<String>> {
        let key = format!("session:{}", user_id);
        self.conn.get(&key).await
    }
}
