# WebChat Production Hardening Guide

## Security Enhancements

### ✅ Implemented Security Features

#### 1. Input Validation
- **Auth Service**: Email validation, password length (8-128 chars), username length (3-30 chars)
- **Core Service**: Request payload validation using `validator` crate
- **Error Messages**: Descriptive validation errors returned to client

#### 2. Rate Limiting & Request Controls
- **Request Body Limit**: 1MB maximum payload size
- **Request Timeout**: 30-second timeout on all requests
- **Tower Middleware**: Layered rate limiting and timeout protection

#### 3. CORS Configuration
- Permissive CORS for development
- **Production**: Configure specific origins in environment variables

#### 4. Database Security
- **Unique Indexes**: Email addresses, invite codes
- **Connection Pooling**: MongoDB connection manager with automatic pooling
- **Prepared Queries**: Using MongoDB's BSON document queries

---

## Performance Optimizations

### ✅ Database Indexing

Automatic index creation on startup:

```rust
// Users
email: unique index

// Servers
owner_id: index
invite_code: unique index

// Channels
server_id: index

// Messages
(channel_id, created_at): compound index (descending)
user_id: index
```

**Benefits**:
- Fast user lookups by email
- Efficient server queries by owner
- Quick channel filtering by server
- Optimized message pagination

### ✅ Redis Caching Strategy

Implemented `CacheManager` with TTL-based caching:

```rust
// Server data: 5 minutes TTL
cache.cache_server(server_id, &server, 300)

// Channel list: 5 minutes TTL
cache.cache_channels(server_id, &channels, 300)

// User sessions: 1 hour TTL
cache.cache_session(user_id, session_data, 3600)
```

**Cache Invalidation**:
- Automatic expiry via TTL
- Manual invalidation on updates
- Pattern-based cache clearing

### ✅ Frontend Optimizations

**Next.js Configuration**:
- `output: 'standalone'` - Optimized Docker builds
- `swcMinify: true` - Fast JavaScript minification
- `optimizeCss: true` - CSS optimization
- `productionBrowserSourceMaps: false` - Reduced bundle size

**Code Splitting**:
- Automatic route-based splitting
- Dynamic imports for heavy components
- Lazy loading for non-critical features

---

## Monitoring & Alerts

### ✅ Grafana Alert Rules

**Critical Alerts** (2-minute threshold):
- Service down (auth-service, core-service)
- Database connection loss (MongoDB)
- Redis connection loss
- High error rate (>10 req/s with 5xx errors)

**Warning Alerts** (5-minute threshold):
- High CPU usage (>80%)
- High memory usage (>1GB)
- Low disk space (<10%)

### ✅ Notification Channels

**Email**:
```yaml
addresses: "alerts@yourdomain.com"
frequency: 5m
```

**Slack**:
```yaml
webhook: ${SLACK_WEBHOOK_URL}
channel: "#webchat-alerts"
mention: "@here"
```

**Webhook**:
```yaml
url: ${WEBHOOK_URL}
method: POST
```

### ✅ Log Retention

**Loki Configuration**:
- **Retention Period**: 31 days (744 hours)
- **Compaction Interval**: 10 minutes
- **Max Ingestion Rate**: 10MB/s
- **Burst Size**: 20MB

---

## Environment Variables

### Required for Production

```bash
# Security
JWT_SECRET=<generate-with-openssl-rand-base64-32>

# Database
MONGO_URI=mongodb://mongo:27017
MONGO_DATABASE=webchat

# Redis
REDIS_URL=redis://redis:6379

# Monitoring
GRAFANA_PASSWORD=<secure-password>
SLACK_WEBHOOK_URL=<your-slack-webhook>
WEBHOOK_URL=<custom-webhook-endpoint>

# Frontend
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_AUTH_URL=https://auth.yourdomain.com
NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com/ws
NEXT_PUBLIC_SENTRY_DSN=<sentry-dsn-for-error-tracking>
```

---

## Production Deployment Checklist

### Pre-Deployment

- [ ] Generate secure `JWT_SECRET`
- [ ] Configure production CORS origins
- [ ] Set up SSL certificates (Let's Encrypt)
- [ ] Configure Grafana notification channels
- [ ] Set up Sentry for error tracking
- [ ] Review and adjust rate limits
- [ ] Configure log retention policies

### Database

- [x] Indexes created automatically on startup
- [ ] Set up MongoDB replica set (for HA)
- [ ] Configure MongoDB authentication
- [ ] Set up automated backups
- [ ] Test backup restoration

### Caching

- [x] Redis caching manager implemented
- [ ] Configure Redis persistence (AOF/RDB)
- [ ] Set up Redis Sentinel (for HA)
- [ ] Monitor cache hit rates

### Monitoring

- [x] Prometheus metrics collection
- [x] Grafana dashboards configured
- [x] Loki log aggregation
- [x] Alert rules defined
- [ ] Test alert notifications
- [ ] Set up uptime monitoring (external)

### Security

- [x] Input validation on all endpoints
- [x] Rate limiting configured
- [x] Request timeouts set
- [ ] Enable HTTPS only
- [ ] Configure firewall rules
- [ ] Set up fail2ban
- [ ] Regular security audits

---

## Performance Benchmarks

### Expected Performance

**API Response Times**:
- Authentication: <100ms
- Server list: <50ms (with cache)
- Channel list: <50ms (with cache)
- Message fetch: <100ms
- Message send: <150ms

**WebSocket**:
- Connection time: <200ms
- Message delivery: <50ms
- Concurrent connections: 10,000+ per instance

**Database Queries**:
- User lookup (indexed): <10ms
- Server query (indexed): <10ms
- Message pagination (indexed): <20ms

---

## Scaling Guidelines

### Horizontal Scaling

**Core Service**:
```bash
docker-compose up -d --scale core=3
```

Add load balancer (Nginx/HAProxy):
```nginx
upstream core_backend {
    server core-1:8080;
    server core-2:8080;
    server core-3:8080;
}
```

**Redis Pub/Sub**:
- Supports multiple core-service instances
- Messages broadcast to all connected clients
- No single point of failure

### Vertical Scaling

**Recommended Resources per Service**:
- Auth Service: 512MB RAM, 0.5 CPU
- Core Service: 1GB RAM, 1 CPU
- MongoDB: 2GB RAM, 1 CPU
- Redis: 512MB RAM, 0.5 CPU
- Frontend: 512MB RAM, 0.5 CPU

---

## Troubleshooting

### High CPU Usage
1. Check Prometheus metrics
2. Review slow database queries
3. Analyze WebSocket connection count
4. Consider horizontal scaling

### Memory Leaks
1. Monitor Grafana memory graphs
2. Check for unclosed connections
3. Review Redis memory usage
4. Restart affected services

### Database Performance
1. Verify indexes are created
2. Check query execution plans
3. Monitor connection pool size
4. Consider read replicas

### Cache Issues
1. Check Redis connection
2. Monitor cache hit/miss rates
3. Verify TTL settings
4. Review cache invalidation logic

---

## Next Steps

1. **Testing**: Run load tests with k6 or Apache Bench
2. **Security Audit**: Penetration testing
3. **Backup Testing**: Verify backup/restore procedures
4. **Documentation**: Update API docs with rate limits
5. **Monitoring**: Fine-tune alert thresholds based on real traffic
