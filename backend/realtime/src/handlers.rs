use axum::{
    extract::{ws::{Message, WebSocket, WebSocketUpgrade}, State},
    response::IntoResponse,
};
use futures_util::{sink::SinkExt, stream::StreamExt};
use crate::pubsub;
use redis::Client;
use std::sync::Arc;

pub async fn ws_handler(
    ws: WebSocketUpgrade,
    State(redis): State<Arc<Client>>,
) -> impl IntoResponse {
    ws.on_upgrade(move |socket| handle_socket(socket, redis))
}

async fn handle_socket(socket: WebSocket, redis: Arc<Client>) {
    let (mut sender, mut receiver) = socket.split();
    let mut pubsub = pubsub::subscribe(&redis, "chat_messages").await.expect("Failed to subscribe");

    // Task for receiving messages from Redis and sending to WebSocket
    let mut send_task = tokio::spawn(async move {
        let mut msg_stream = pubsub.on_message();
        while let Some(msg) = msg_stream.next().await {
            let payload: String = msg.get_payload().expect("Failed to get payload");
            if sender.send(Message::Text(payload)).await.is_err() {
                break;
            }
        }
    });

    // Task for receiving messages from WebSocket and publishing to Redis
    let mut recv_task = tokio::spawn(async move {
        while let Some(Ok(Message::Text(text))) = receiver.next().await {
            let _ = pubsub::publish(&redis, "chat_messages", &text).await;
        }
    });

    // Wait for either task to finish
    tokio::select! {
        _ = (&mut send_task) => recv_task.abort(),
        _ = (&mut recv_task) => send_task.abort(),
    };
}
