# LiveKit Voice Chat Integration Guide

## Overview

This guide covers the complete integration of LiveKit for real-time voice chat in WebChat v1.0.

---

## 1. LiveKit Server Deployment

### Docker Compose Integration

Add to `docker-compose.yml`:

```yaml
  # LiveKit Server
  livekit:
    image: livekit/livekit-server:latest
    command: --config /etc/livekit.yaml
    volumes:
      - ./livekit/livekit.yaml:/etc/livekit.yaml
    ports:
      - "7880:7880"   # WebSocket
      - "7881:7881"   # TCP
      - "3478:3478/udp"  # TURN
      - "50000-60000:50000-60000/udp"  # WebRTC media
    environment:
      - LIVEKIT_KEYS=${LIVEKIT_API_KEY}:${LIVEKIT_API_SECRET}
    depends_on:
      - redis
    restart: unless-stopped
    networks:
      - webchat

  # LiveKit Egress (for recording)
  livekit-egress:
    image: livekit/egress:latest
    volumes:
      - ./livekit/egress.yaml:/out/egress.yaml
      - ./recordings:/out/recordings
    environment:
      - EGRESS_CONFIG_FILE=/out/egress.yaml
    cap_add:
      - SYS_ADMIN
    depends_on:
      - livekit
      - redis
    restart: unless-stopped
    networks:
      - webchat
```

### LiveKit Configuration

Create `livekit/livekit.yaml`:

```yaml
port: 7880
bind: 0.0.0.0

rtc:
  port_range_start: 50000
  port_range_end: 60000
  tcp_port: 7881
  use_external_ip: true

redis:
  address: redis:6379

keys:
  ${LIVEKIT_API_KEY}: ${LIVEKIT_API_SECRET}

turn:
  enabled: true
  domain: turn.yourdomain.com
  tls_port: 5349
  udp_port: 3478

room:
  auto_create: true
  empty_timeout: 300  # 5 minutes
  max_participants: 50

logging:
  level: info
  sample: false
```

### Environment Variables

Add to `.env`:

```bash
# LiveKit Configuration
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret
LIVEKIT_WS_URL=ws://localhost:7880
```

### Firewall Configuration

Open these ports on your server:

```bash
# WebSocket
sudo ufw allow 7880/tcp

# WebRTC TCP fallback
sudo ufw allow 7881/tcp

# TURN
sudo ufw allow 3478/udp

# WebRTC media ports
sudo ufw allow 50000:60000/udp
```

---

## 2. Backend Integration (Rust)

### Add Dependencies

Update `backend/core-service/Cargo.toml`:

```toml
[dependencies]
# ... existing dependencies ...
jsonwebtoken = "9"
serde = { version = "1", features = ["derive"] }
```

### LiveKit Token Generation

Create `backend/core-service/src/livekit.rs`:

```rust
use jsonwebtoken::{encode, Header, EncodingKey};
use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Serialize, Deserialize)]
struct LiveKitClaims {
    exp: usize,
    iss: String,
    nbf: usize,
    sub: String,
    video: LiveKitVideoGrant,
}

#[derive(Debug, Serialize, Deserialize)]
struct LiveKitVideoGrant {
    #[serde(skip_serializing_if = "Option::is_none")]
    room: Option<String>,
    #[serde(rename = "roomJoin")]
    room_join: bool,
    #[serde(rename = "canPublish")]
    can_publish: bool,
    #[serde(rename = "canSubscribe")]
    can_subscribe: bool,
}

pub fn generate_token(
    api_key: &str,
    api_secret: &str,
    room: &str,
    identity: &str,
) -> Result<String, jsonwebtoken::errors::Error> {
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs() as usize;

    let claims = LiveKitClaims {
        exp: now + 3600, // 1 hour expiry
        iss: api_key.to_string(),
        nbf: now - 60,
        sub: identity.to_string(),
        video: LiveKitVideoGrant {
            room: Some(room.to_string()),
            room_join: true,
            can_publish: true,
            can_subscribe: true,
        },
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(api_secret.as_ref()),
    )
}
```

### Voice Routes

Create `backend/core-service/src/routes/voice.rs`:

```rust
use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use serde::{Deserialize, Serialize};

use crate::{auth::AuthUser, livekit};

#[derive(Debug, Serialize)]
pub struct VoiceConnectionResponse {
    pub url: String,
    pub token: String,
    pub room: String,
}

pub async fn join_voice_channel(
    Path(channel_id): Path<String>,
    user: AuthUser,
    State((db, _redis)): State<(mongodb::Database, redis::Client)>,
) -> Result<Json<VoiceConnectionResponse>, (StatusCode, String)> {
    // Verify channel exists
    let channels: mongodb::Collection<crate::models::Channel> = db.collection("channels");
    let channel = channels
        .find_one(mongodb::bson::doc! { "_id": mongodb::bson::oid::ObjectId::parse_str(&channel_id).unwrap() })
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
        .ok_or((StatusCode::NOT_FOUND, "Channel not found".to_string()))?;

    // Verify it's a voice channel
    if channel.channel_type != "voice" {
        return Err((
            StatusCode::BAD_REQUEST,
            "Not a voice channel".to_string(),
        ));
    }

    // Generate LiveKit token
    let api_key = std::env::var("LIVEKIT_API_KEY").expect("LIVEKIT_API_KEY must be set");
    let api_secret = std::env::var("LIVEKIT_API_SECRET").expect("LIVEKIT_API_SECRET must be set");
    let ws_url = std::env::var("LIVEKIT_WS_URL").expect("LIVEKIT_WS_URL must be set");

    let token = livekit::generate_token(&api_key, &api_secret, &channel_id, &user.0)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(Json(VoiceConnectionResponse {
        url: ws_url,
        token,
        room: channel_id,
    }))
}
```

### Update Main Router

In `backend/core-service/src/main.rs`:

```rust
mod livekit;
mod routes;

// ... in main() ...
let app = Router::new()
    // ... existing routes ...
    .route("/channels/:channel_id/voice/join", post(routes::voice::join_voice_channel))
    // ... rest of routes ...
```

---

## 3. Frontend Integration (Next.js)

### Install Dependencies

```bash
cd frontend/web
npm install @livekit/components-react livekit-client
```

### Voice Store

Create `frontend/web/src/store/voiceStore.ts`:

```typescript
import { create } from "zustand";

interface VoiceConnection {
  url: string;
  token: string;
  room: string;
}

interface VoiceState {
  currentVoiceChannel: string | null;
  connection: VoiceConnection | null;
  isMuted: boolean;
  isDeafened: boolean;
  setCurrentVoiceChannel: (channelId: string | null) => void;
  setConnection: (connection: VoiceConnection | null) => void;
  toggleMute: () => void;
  toggleDeafen: () => void;
}

export const useVoiceStore = create<VoiceState>((set) => ({
  currentVoiceChannel: null,
  connection: null,
  isMuted: false,
  isDeafened: false,
  
  setCurrentVoiceChannel: (channelId) => set({ currentVoiceChannel: channelId }),
  setConnection: (connection) => set({ connection }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  toggleDeafen: () => set((state) => ({ isDeafened: !state.isDeafened })),
}));
```

### Voice Panel Component

Create `frontend/web/src/components/VoicePanel.tsx`:

```typescript
"use client";

import { useEffect, useState } from "react";
import { LiveKitRoom, ParticipantTile, RoomAudioRenderer } from "@livekit/components-react";
import { Track } from "livekit-client";
import { useVoiceStore } from "@/store/voiceStore";
import { api } from "@/lib/api";
import "@livekit/components-styles";

export function VoicePanel() {
  const { connection, setConnection, currentVoiceChannel } = useVoiceStore();
  const [participants, setParticipants] = useState<any[]>([]);

  const handleJoinVoice = async (channelId: string) => {
    try {
      const response = await api(`/channels/${channelId}/voice/join`, {
        method: "POST",
      });
      setConnection(response);
    } catch (error) {
      console.error("Failed to join voice:", error);
    }
  };

  const handleLeaveVoice = () => {
    setConnection(null);
  };

  if (!connection) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 p-4 z-50">
      <LiveKitRoom
        serverUrl={connection.url}
        token={connection.token}
        connect={true}
        audio={true}
        video={false}
        onDisconnected={handleLeaveVoice}
        onParticipantConnected={(participant) => {
          console.log("Participant connected:", participant.identity);
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-white">
              Voice Channel: {connection.room}
            </span>
            <div className="flex gap-2">
              {participants.map((p) => (
                <div key={p.sid} className="flex items-center gap-2 bg-gray-800 px-3 py-1 rounded">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm text-gray-300">{p.identity}</span>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={handleLeaveVoice}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
          >
            Leave Voice
          </button>
        </div>
        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  );
}
```

### Update VoiceFooter

Update `frontend/web/src/components/VoiceFooter.tsx`:

```typescript
"use client";

import { Mic, MicOff, Headphones, Settings, PhoneOff } from "lucide-react";
import { useVoiceStore } from "@/store/voiceStore";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";

export function VoiceFooter() {
  const { user } = useAuthStore();
  const { isMuted, isDeafened, toggleMute, toggleDeafen, connection, setConnection } = useVoiceStore();

  const handleLeaveVoice = () => {
    setConnection(null);
  };

  return (
    <div className="h-14 bg-gray-900 border-t border-gray-800 px-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gaming-green flex items-center justify-center text-gray-900 font-semibold text-sm">
          {user?.username?.[0]?.toUpperCase() || "U"}
        </div>
        <div>
          <div className="text-sm font-semibold text-white">{user?.username || "Username"}</div>
          <div className="text-xs text-gray-400">
            {connection ? `In ${connection.room}` : "Not in voice"}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {connection && (
          <button
            onClick={handleLeaveVoice}
            className="p-2 rounded hover:bg-gray-700 transition-colors text-red-500"
            title="Leave Voice"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        )}
        <button
          onClick={toggleMute}
          className={`p-2 rounded hover:bg-gray-700 transition-colors ${
            isMuted ? "text-red-500" : "text-gray-300"
          }`}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>
        <button
          onClick={toggleDeafen}
          className={`p-2 rounded hover:bg-gray-700 transition-colors ${
            isDeafened ? "text-red-500" : "text-gray-300"
          }`}
          title={isDeafened ? "Undeafen" : "Deafen"}
        >
          <Headphones className="w-5 h-5" />
        </button>
        <button
          className="p-2 rounded hover:bg-gray-700 transition-colors text-gray-300"
          title="User Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
```

### Update SidebarChannels for Voice Join

In `frontend/web/src/components/SidebarChannels.tsx`, add click handler for voice channels:

```typescript
import { useVoiceStore } from "@/store/voiceStore";
import { api } from "@/lib/api";

// ... in component ...
const { setConnection, setCurrentVoiceChannel } = useVoiceStore();

const handleVoiceChannelClick = async (channel: Channel) => {
  if (channel.channel_type === "voice") {
    try {
      const response = await api(`/channels/${channel.id}/voice/join`, {
        method: "POST",
      });
      setConnection(response);
      setCurrentVoiceChannel(channel.id);
    } catch (error) {
      console.error("Failed to join voice:", error);
    }
  }
};

// In the render for voice channels:
<div
  key={channel.id}
  onClick={() => handleVoiceChannelClick(channel)}
  className="px-2 py-1.5 rounded flex items-center gap-2 cursor-pointer text-gray-400 hover:bg-gray-700/50 hover:text-gray-200"
>
  <Volume2 className="w-4 h-4" />
  <span className="text-sm">{channel.name}</span>
</div>
```

---

## 4. Production Considerations

### Resource Requirements

- **LiveKit Server**: 4 cores, 8GB RAM for 10-25 concurrent users
- **Scaling**: Add more LiveKit instances behind load balancer for >50 users
- **Network**: Ensure UDP ports 50000-60000 are open

### SSL/TLS Configuration

For production, use HTTPS and WSS:

```yaml
# In livekit.yaml
turn:
  enabled: true
  domain: turn.yourdomain.com
  cert_file: /etc/letsencrypt/live/turn.yourdomain.com/fullchain.pem
  key_file: /etc/letsencrypt/live/turn.yourdomain.com/privkey.pem
  tls_port: 5349
```

### Monitoring

Add LiveKit metrics to Prometheus:

```yaml
# In prometheus.yml
scrape_configs:
  - job_name: 'livekit'
    static_configs:
      - targets: ['livekit:7880']
    metrics_path: '/metrics'
```

### Recording Configuration

Create `livekit/egress.yaml`:

```yaml
api_key: ${LIVEKIT_API_KEY}
api_secret: ${LIVEKIT_API_SECRET}
ws_url: ws://livekit:7880

file_output:
  local:
    directory: /out/recordings

logging:
  level: info
```

---

## 5. Testing

### Test Voice Connection

```bash
# Start services
docker-compose up -d

# Check LiveKit health
curl http://localhost:7880/

# Test token generation
curl -X POST http://localhost:8080/channels/CHANNEL_ID/voice/join \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Browser Testing

1. Open two browser windows
2. Join the same voice channel in both
3. Speak in one window, verify audio in the other
4. Test mute/unmute functionality
5. Test leaving and rejoining

---

## Summary

LiveKit integration provides:
- ✅ Real-time voice chat with WebRTC
- ✅ Automatic room creation
- ✅ Scalable architecture with Redis
- ✅ Recording capabilities
- ✅ Production-ready with SSL/TLS

Next steps: Test thoroughly, configure TURN for NAT traversal, and monitor resource usage.
