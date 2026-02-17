use redis::{Client, AsyncCommands};
use redis::aio::PubSub;
use std::error::Error;

pub async fn get_redis_client(uri: &str) -> Result<Client, Box<dyn Error>> {
    let client = Client::open(uri)?;
    Ok(client)
}

pub async fn subscribe(client: &Client, channel: &str) -> Result<PubSub, Box<dyn Error>> {
    let mut pubsub = client.get_async_pubsub().await?;
    pubsub.subscribe(channel).await?;
    Ok(pubsub)
}

pub async fn publish(client: &Client, channel: &str, message: &str) -> Result<(), Box<dyn Error>> {
    let mut conn = client.get_async_connection().await?;
    conn.publish(channel, message).await?;
    Ok(())
}
