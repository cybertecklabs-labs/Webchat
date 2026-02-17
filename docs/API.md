# WebChat API Documentation

## Base URLs

- **Auth Service**: `http://localhost:8081`
- **Core Service**: `http://localhost:8080`
- **WebSocket**: `ws://localhost:8080/ws`

## Authentication

All protected endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

---

## Auth Service Endpoints

### POST /register

Register a new user account.

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Response:** `200 OK`
```json
"User registered successfully"
```

**Errors:**
- `409 Conflict` - Email already exists
- `500 Internal Server Error` - Database error

---

### POST /login

Authenticate and receive a JWT token.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:** `200 OK`
```json
{
  "token": "string",
  "user": {
    "id": "string",
    "username": "string",
    "email": "string"
  }
}
```

**Errors:**
- `401 Unauthorized` - Invalid credentials
- `500 Internal Server Error` - Database error

---

## Core Service Endpoints

### GET /servers

List all servers (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
[
  {
    "id": "string",
    "name": "string",
    "owner_id": "string",
    "invite_code": "string",
    "created_at": "string (ISO 8601)"
  }
]
```

---

### POST /servers

Create a new server (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "string",
  "description": "string (optional)"
}
```

**Response:** `201 Created`
```json
{
  "id": "string",
  "name": "string",
  "owner_id": "string",
  "invite_code": "string",
  "created_at": "string (ISO 8601)"
}
```

---

### GET /servers/:server_id/channels

List all channels in a server (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
[
  {
    "id": "string",
    "server_id": "string",
    "name": "string",
    "channel_type": "text | voice",
    "topic": "string (optional)",
    "created_at": "string (ISO 8601)"
  }
]
```

---

### POST /servers/:server_id/channels

Create a new channel in a server (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "string",
  "channel_type": "text | voice",
  "topic": "string (optional)"
}
```

**Response:** `201 Created`
```json
{
  "id": "string",
  "server_id": "string",
  "name": "string",
  "channel_type": "text | voice",
  "topic": "string (optional)",
  "created_at": "string (ISO 8601)"
}
```

---

### GET /channels/:channel_id/messages

Get messages from a channel (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` (optional, default: 50) - Number of messages to retrieve
- `before` (optional) - Message ID to fetch messages before

**Response:** `200 OK`
```json
[
  {
    "id": "string",
    "channel_id": "string",
    "user_id": "string",
    "content": "string",
    "attachments": ["string"],
    "created_at": "string (ISO 8601)"
  }
]
```

---

### POST /channels/:channel_id/messages

Send a message to a channel (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "content": "string",
  "attachments": ["string"] (optional)
}
```

**Response:** `201 Created`
```json
{
  "id": "string",
  "channel_id": "string",
  "user_id": "string",
  "content": "string",
  "attachments": ["string"],
  "created_at": "string (ISO 8601)"
}
```

---

## WebSocket API

### Connection

Connect to the WebSocket endpoint with your JWT token:

```
ws://localhost:8080/ws?token=<your-jwt-token>
```

### Events

#### MESSAGE_CREATE

Sent when a new message is created.

```json
{
  "type": "MESSAGE_CREATE",
  "data": {
    "id": "string",
    "channel_id": "string",
    "user_id": "string",
    "content": "string",
    "attachments": ["string"],
    "created_at": "string (ISO 8601)"
  }
}
```

#### TYPING_START

Sent when a user starts typing.

```json
{
  "type": "TYPING_START",
  "data": {
    "user_id": "string",
    "channel_id": "string"
  }
}
```

#### PRESENCE_UPDATE

Sent when a user's presence changes.

```json
{
  "type": "PRESENCE_UPDATE",
  "data": {
    "user_id": "string",
    "status": "online | offline | away | dnd",
    "activity": "string (optional)"
  }
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Invalid request parameters"
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```
