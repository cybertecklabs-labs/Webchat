# WebChat Testing Strategy

## Overview

Comprehensive testing strategy covering unit tests, integration tests, WebSocket conformance, load testing, and end-to-end testing.

---

## 1. Unit Tests (Rust)

### Auth Service Tests

Create `backend/auth-service/src/tests/mod.rs`:

```rust
#[cfg(test)]
mod auth_tests {
    use crate::auth::{hash_password, verify_password, create_jwt};

    #[test]
    fn test_password_hashing() {
        let password = "secure_password_123";
        let hash = hash_password(password).unwrap();
        
        assert!(verify_password(password, &hash).unwrap());
        assert!(!verify_password("wrong_password", &hash).unwrap());
    }

    #[test]
    fn test_password_hash_uniqueness() {
        let password = "same_password";
        let hash1 = hash_password(password).unwrap();
        let hash2 = hash_password(password).unwrap();
        
        // Hashes should be different due to salt
        assert_ne!(hash1, hash2);
    }

    #[test]
    fn test_jwt_creation() {
        let user_id = "507f1f77bcf86cd799439011";
        let token = create_jwt(user_id).unwrap();
        
        assert!(!token.is_empty());
        assert!(token.contains('.'));  // JWT format
    }
}

#[cfg(test)]
mod validation_tests {
    use crate::models::RegisterRequest;
    use validator::Validate;

    #[test]
    fn test_valid_registration() {
        let req = RegisterRequest {
            username: "testuser".to_string(),
            email: "test@example.com".to_string(),
            password: "password123".to_string(),
        };
        assert!(req.validate().is_ok());
    }

    #[test]
    fn test_invalid_email() {
        let req = RegisterRequest {
            username: "testuser".to_string(),
            email: "invalid-email".to_string(),
            password: "password123".to_string(),
        };
        assert!(req.validate().is_err());
    }

    #[test]
    fn test_short_password() {
        let req = RegisterRequest {
            username: "testuser".to_string(),
            email: "test@example.com".to_string(),
            password: "short".to_string(),
        };
        assert!(req.validate().is_err());
    }

    #[test]
    fn test_short_username() {
        let req = RegisterRequest {
            username: "ab".to_string(),
            email: "test@example.com".to_string(),
            password: "password123".to_string(),
        };
        assert!(req.validate().is_err());
    }
}
```

### Core Service Tests

Create `backend/core-service/src/tests/mod.rs`:

```rust
#[cfg(test)]
mod server_tests {
    use crate::models::*;
    use mongodb::bson::oid::ObjectId;

    #[test]
    fn test_server_creation() {
        let server = Server {
            id: Some(ObjectId::new()),
            name: "Test Server".to_string(),
            owner_id: ObjectId::new(),
            invite_code: "ABC123".to_string(),
            created_at: chrono::Utc::now(),
        };
        
        assert_eq!(server.name, "Test Server");
        assert_eq!(server.invite_code.len(), 6);
    }
}

#[cfg(test)]
mod cache_tests {
    use crate::cache::CacheManager;

    #[tokio::test]
    async fn test_cache_set_get() {
        let mut cache = CacheManager::new("redis://localhost:6379")
            .await
            .unwrap();
        
        let test_data = serde_json::json!({"name": "Test Server"});
        cache.cache_server("test_id", &test_data, 60).await.unwrap();
        
        let retrieved: Option<serde_json::Value> = cache.get_server("test_id").await.unwrap();
        assert!(retrieved.is_some());
        assert_eq!(retrieved.unwrap()["name"], "Test Server");
    }

    #[tokio::test]
    async fn test_cache_expiry() {
        let mut cache = CacheManager::new("redis://localhost:6379")
            .await
            .unwrap();
        
        let test_data = serde_json::json!({"name": "Expiring Server"});
        cache.cache_server("expiry_test", &test_data, 1).await.unwrap();
        
        tokio::time::sleep(tokio::time::Duration::from_secs(2)).await;
        
        let retrieved: Option<serde_json::Value> = cache.get_server("expiry_test").await.unwrap();
        assert!(retrieved.is_none());
    }
}
```

### Run Tests

```bash
# Auth service
cd backend/auth-service
cargo test

# Core service
cd backend/core-service
cargo test

# With output
cargo test -- --nocapture
```

---

## 2. Integration Tests

### Database Integration Tests

Create `backend/core-service/tests/integration_test.rs`:

```rust
use mongodb::{Client, Database};
use webchat_core::*;

async fn setup_test_db() -> Database {
    let client = Client::with_uri_str("mongodb://localhost:27017")
        .await
        .unwrap();
    let db = client.database("webchat_test");
    
    // Clean slate
    db.drop().await.unwrap();
    
    db
}

#[tokio::test]
async fn test_server_crud() {
    let db = setup_test_db().await;
    let servers: mongodb::Collection<models::Server> = db.collection("servers");
    
    // Create
    let server = models::Server {
        id: None,
        name: "Integration Test Server".to_string(),
        owner_id: mongodb::bson::oid::ObjectId::new(),
        invite_code: nanoid::nanoid!(10),
        created_at: chrono::Utc::now(),
    };
    
    let result = servers.insert_one(&server).await.unwrap();
    let server_id = result.inserted_id.as_object_id().unwrap();
    
    // Read
    let found = servers
        .find_one(mongodb::bson::doc! { "_id": server_id })
        .await
        .unwrap();
    
    assert!(found.is_some());
    assert_eq!(found.unwrap().name, "Integration Test Server");
    
    // Update
    servers
        .update_one(
            mongodb::bson::doc! { "_id": server_id },
            mongodb::bson::doc! { "$set": { "name": "Updated Server" } },
        )
        .await
        .unwrap();
    
    // Delete
    servers
        .delete_one(mongodb::bson::doc! { "_id": server_id })
        .await
        .unwrap();
    
    let deleted = servers
        .find_one(mongodb::bson::doc! { "_id": server_id })
        .await
        .unwrap();
    
    assert!(deleted.is_none());
}
```

### Redis Integration Tests

```rust
#[tokio::test]
async fn test_redis_pubsub() {
    let client = redis::Client::open("redis://localhost:6379").unwrap();
    let mut conn = client.get_async_connection().await.unwrap();
    
    // Subscribe
    let mut pubsub = conn.as_pubsub();
    pubsub.subscribe("test_channel").await.unwrap();
    
    // Publish in background
    let client_clone = client.clone();
    tokio::spawn(async move {
        tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
        let mut pub_conn = client_clone.get_async_connection().await.unwrap();
        redis::cmd("PUBLISH")
            .arg("test_channel")
            .arg("test_message")
            .query_async::<_, ()>(&mut pub_conn)
            .await
            .unwrap();
    });
    
    // Receive
    let msg = pubsub.on_message().next().await.unwrap();
    assert_eq!(msg.get_payload::<String>().unwrap(), "test_message");
}
```

---

## 3. WebSocket Conformance Testing

### Autobahn TestSuite

Install Autobahn:

```bash
pip install autobahntestsuite
```

Create `autobahn/config.json`:

```json
{
  "url": "ws://localhost:8080/ws",
  "outdir": "./autobahn-reports",
  "cases": ["*"],
  "exclude-cases": [],
  "exclude-agent-cases": {}
}
```

Run tests:

```bash
# Start your WebSocket server
docker-compose up -d core

# Run Autobahn fuzzing client
wstest -m fuzzingclient -s autobahn/config.json

# View results
open autobahn-reports/index.html
```

### Custom WebSocket Tests

Create `tests/websocket_test.rs`:

```rust
use tokio_tungstenite::{connect_async, tungstenite::Message};
use futures_util::{SinkExt, StreamExt};

#[tokio::test]
async fn test_websocket_connection() {
    let (ws_stream, _) = connect_async("ws://localhost:8080/ws")
        .await
        .expect("Failed to connect");
    
    let (mut write, mut read) = ws_stream.split();
    
    // Send message
    write.send(Message::Text("Hello".into())).await.unwrap();
    
    // Receive echo
    if let Some(Ok(Message::Text(text))) = read.next().await {
        assert_eq!(text, "Hello");
    }
}

#[tokio::test]
async fn test_websocket_reconnection() {
    let (ws_stream, _) = connect_async("ws://localhost:8080/ws")
        .await
        .unwrap();
    
    drop(ws_stream);  // Disconnect
    
    // Reconnect
    let (ws_stream2, _) = connect_async("ws://localhost:8080/ws")
        .await
        .unwrap();
    
    assert!(ws_stream2.get_ref().is_active());
}
```

---

## 4. Load Testing

### K6 WebSocket Load Test

Create `tests/load/websocket_load.js`:

```javascript
import ws from 'k6/ws';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 100 },   // Ramp up to 100 users
    { duration: '2m', target: 100 },    // Stay at 100 users
    { duration: '30s', target: 500 },   // Spike to 500 users
    { duration: '1m', target: 500 },    // Stay at 500 users
    { duration: '30s', target: 0 },     // Ramp down
  ],
  thresholds: {
    'ws_connecting': ['avg<1000'],      // Connection time < 1s
    'ws_msgs_received': ['count>1000'], // Received messages
  },
};

export default function () {
  const url = 'ws://localhost:8080/ws';
  const token = __ENV.JWT_TOKEN;
  
  const response = ws.connect(`${url}?token=${token}`, {}, function (socket) {
    socket.on('open', () => {
      console.log('Connected');
      
      // Send auth
      socket.send(JSON.stringify({
        type: 'auth',
        token: token,
      }));
      
      // Send messages
      for (let i = 0; i < 10; i++) {
        socket.send(JSON.stringify({
          type: 'message',
          channel_id: 'test_channel',
          content: `Message ${i}`,
        }));
        sleep(1);
      }
    });

    socket.on('message', (data) => {
      const msg = JSON.parse(data);
      check(msg, {
        'message received': (m) => m.type === 'message',
      });
    });

    socket.on('close', () => {
      console.log('Disconnected');
    });

    socket.on('error', (e) => {
      console.error('WebSocket error:', e);
    });

    socket.setTimeout(() => {
      socket.close();
    }, 60000);  // Close after 60s
  });

  check(response, {
    'connected successfully': (r) => r && r.status === 101,
  });
}
```

Run load test:

```bash
k6 run -e JWT_TOKEN=your_test_token tests/load/websocket_load.js
```

### HTTP API Load Test

Create `tests/load/api_load.js`:

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '1m', target: 50 },
    { duration: '3m', target: 50 },
    { duration: '1m', target: 100 },
    { duration: '3m', target: 100 },
    { duration: '1m', target: 0 },
  ],
};

const BASE_URL = 'http://localhost:8080';

export default function () {
  // Login
  let loginRes = http.post(`${BASE_URL}/login`, JSON.stringify({
    email: 'test@example.com',
    password: 'password123',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(loginRes, {
    'login successful': (r) => r.status === 200,
  });

  const token = JSON.parse(loginRes.body).token;

  // Get servers
  let serversRes = http.get(`${BASE_URL}/servers`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  check(serversRes, {
    'servers retrieved': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });

  sleep(1);
}
```

---

## 5. End-to-End Tests (Cypress)

### Setup

```bash
cd frontend/web
npm install --save-dev cypress
npx cypress open
```

### E2E Test Suite

Create `frontend/web/cypress/e2e/chat.cy.ts`:

```typescript
describe('WebChat E2E', () => {
  beforeEach(() => {
    // Clear database and seed test data
    cy.task('db:seed');
  });

  it('complete user flow: register, login, send message', () => {
    // Register
    cy.visit('/register');
    cy.get('input[name=username]').type('testuser');
    cy.get('input[name=email]').type('test@example.com');
    cy.get('input[name=password]').type('password123');
    cy.get('input[name=confirmPassword]').type('password123');
    cy.get('button[type=submit]').click();
    
    // Should redirect to login
    cy.url().should('include', '/login');
    
    // Login
    cy.get('input[name=email]').type('test@example.com');
    cy.get('input[name=password]').type('password123');
    cy.get('button[type=submit]').click();
    
    // Should redirect to chat
    cy.url().should('eq', Cypress.config().baseUrl + '/');
    
    // Select server
    cy.get('[data-testid=server-icon]').first().click();
    
    // Select channel
    cy.get('[data-testid=channel]').contains('general').click();
    
    // Send message
    cy.get('[data-testid=message-input]').type('Hello, World!{enter}');
    
    // Verify message appears
    cy.get('[data-testid=message]').should('contain', 'Hello, World!');
  });

  it('real-time message delivery across tabs', () => {
    // Login in first tab
    cy.visit('/login');
    cy.get('input[name=email]').type('user1@example.com');
    cy.get('input[name=password]').type('password123');
    cy.get('button[type=submit]').click();
    
    // Open second tab
    cy.window().then((win) => {
      win.open('/login', '_blank');
    });
    
    // Login in second tab (switch context)
    cy.get('@secondTab').within(() => {
      cy.get('input[name=email]').type('user2@example.com');
      cy.get('input[name=password]').type('password123');
      cy.get('button[type=submit]').click();
    });
    
    // Send message from first tab
    cy.get('[data-testid=message-input]').type('Cross-tab message{enter}');
    
    // Verify in second tab
    cy.get('@secondTab').within(() => {
      cy.get('[data-testid=message]').should('contain', 'Cross-tab message');
    });
  });

  it('voice channel join', () => {
    cy.login('test@example.com', 'password123');
    
    // Navigate to voice channel
    cy.get('[data-testid=server-icon]').first().click();
    cy.get('[data-testid=voice-channel]').first().click();
    
    // Verify voice connection
    cy.get('[data-testid=voice-footer]').should('contain', 'Connected');
    
    // Leave voice
    cy.get('[data-testid=leave-voice]').click();
    cy.get('[data-testid=voice-footer]').should('not.contain', 'Connected');
  });
});
```

---

## 6. CI/CD Integration

### GitHub Actions Workflow

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    services:
      mongodb:
        image: mongo:6
        ports:
          - 27017:27017
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Rust
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
      
      - name: Run auth-service tests
        run: |
          cd backend/auth-service
          cargo test
      
      - name: Run core-service tests
        run: |
          cd backend/core-service
          cargo test

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: |
          cd frontend/web
          npm ci
      
      - name: Run tests
        run: |
          cd frontend/web
          npm test

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Start services
        run: docker-compose up -d
      
      - name: Run Cypress
        uses: cypress-io/github-action@v5
        with:
          working-directory: frontend/web
          wait-on: 'http://localhost:3000'
```

---

## Summary

Comprehensive testing coverage:

- ✅ **Unit Tests**: Auth logic, validation, caching
- ✅ **Integration Tests**: Database, Redis, full CRUD
- ✅ **WebSocket Tests**: Conformance, reconnection, load
- ✅ **Load Tests**: 500+ concurrent users, API performance
- ✅ **E2E Tests**: Complete user flows, real-time features
- ✅ **CI/CD**: Automated testing on every commit

Run all tests:

```bash
# Backend
cargo test --all

# Frontend
npm test

# Load tests
k6 run tests/load/websocket_load.js

# E2E
npx cypress run
```
