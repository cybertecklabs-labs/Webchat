use axum::{
    extract::{
        ws::{Message, WebSocket, WebSocketUpgrade},
        State,
    },
    response::IntoResponse,
};
use futures_util::{SinkExt, StreamExt};
use redis::AsyncCommands;

pub async fn ws_handler(
    ws: WebSocketUpgrade,
    State((_db, redis_client)): State<(mongodb::Database, redis::Client)>,
) -> impl IntoResponse {
    ws.on_upgrade(|socket| handle_socket(socket, redis_client))
}

async fn handle_socket(socket: WebSocket, redis_client: redis::Client) {
    let (mut sender, mut receiver) = socket.split();

    // Subscribe to Redis channel for real-time messages
    let mut pubsub_conn = redis_client
        .get_async_connection()
        .await
        .unwrap()
        .into_pubsub();
    pubsub_conn.subscribe("chat:messages").await.unwrap();
    let mut pubsub_stream = pubsub_conn.on_message();

    // Task to forward Redis messages to WebSocket
    let mut send_task = tokio::spawn(async move {
        while let Some(msg) = pubsub_stream.next().await {
            let payload: String = msg.get_payload().unwrap();
            if sender.send(Message::Text(payload)).await.is_err() {
                break;
            }
        }
    });

    // Task to receive WebSocket messages and publish to Redis
    let mut recv_task = tokio::spawn(async move {
        let mut conn = redis_client.get_async_connection().await.unwrap();
        while let Some(Ok(Message::Text(text))) = receiver.next().await {
            // Publish message to Redis for all connected clients
            let _: () = conn.publish("chat:messages", text).await.unwrap();
        }
    });

    // Wait for either task to finish
    tokio::select! {
        _ = (&mut send_task) => recv_task.abort(),
        _ = (&mut recv_task) => send_task.abort(),
    }
}
