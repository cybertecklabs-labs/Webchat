# WebChat Deployment Guide

This guide covers deploying WebChat to production on a VPS or dedicated server.

## Prerequisites

- Ubuntu 22.04 LTS or Debian 12
- 4 CPU cores minimum (8 recommended)
- 8GB RAM minimum (16GB recommended)
- 50GB SSD storage minimum
- Docker 24.0+ and Docker Compose 2.20+
- Domain name (optional, for SSL)

---

## Quick Deploy with Docker Compose

### 1. Clone the Repository

```bash
git clone https://github.com/cybertecklabs/WebChat.git
cd WebChat
```

### 2. Configure Environment

```bash
cp .env.example .env
nano .env
```

**Important:** Generate a secure JWT secret:

```bash
openssl rand -base64 32
```

Update `.env` with your values:

```env
JWT_SECRET=<your-generated-secret>
GRAFANA_PASSWORD=<secure-password>
```

### 3. Start All Services

```bash
docker-compose up -d
```

### 4. Verify Services

```bash
docker-compose ps
```

All services should show as "Up".

### 5. Access WebChat

- **Frontend**: http://your-server-ip:3000
- **API**: http://your-server-ip:8080
- **Grafana**: http://your-server-ip:3001

---

## Production Setup with Reverse Proxy

### Using Caddy (Recommended)

Caddy automatically handles SSL certificates via Let's Encrypt.

#### 1. Install Caddy

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy
```

#### 2. Create Caddyfile

```bash
sudo nano /etc/caddy/Caddyfile
```

```caddy
chat.yourdomain.com {
    reverse_proxy localhost:3000
}

api.yourdomain.com {
    reverse_proxy localhost:8080
}

grafana.yourdomain.com {
    reverse_proxy localhost:3001
}
```

#### 3. Reload Caddy

```bash
sudo systemctl reload caddy
```

### Using Nginx

#### 1. Install Nginx

```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx
```

#### 2. Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/webchat
```

```nginx
server {
    listen 80;
    server_name chat.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 3. Enable Site and Get SSL

```bash
sudo ln -s /etc/nginx/sites-available/webchat /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d chat.yourdomain.com -d api.yourdomain.com
```

---

## Monitoring Setup

### Access Grafana

1. Navigate to `http://your-server-ip:3001`
2. Login with username `admin` and password from `.env`
3. Add Prometheus data source:
   - URL: `http://prometheus:9090`
4. Add Loki data source:
   - URL: `http://loki:3100`

### Import Dashboards

Import pre-built dashboards for:
- System metrics (CPU, RAM, disk)
- Application metrics (requests, latency)
- WebSocket connections
- Database performance

---

## Backup Strategy

### Database Backup

```bash
# Backup MongoDB
docker exec webchat-mongo-1 mongodump --out /backup
docker cp webchat-mongo-1:/backup ./mongodb-backup-$(date +%Y%m%d)

# Restore MongoDB
docker cp ./mongodb-backup-20260218 webchat-mongo-1:/backup
docker exec webchat-mongo-1 mongorestore /backup
```

### Volume Backup

```bash
# Backup all Docker volumes
docker run --rm \
  -v webchat_mongo_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/mongo-data-$(date +%Y%m%d).tar.gz /data
```

### Automated Backups

Add to crontab:

```bash
crontab -e
```

```
0 2 * * * /path/to/backup-script.sh
```

---

## Scaling

### Horizontal Scaling

To scale the core service:

```bash
docker-compose up -d --scale core=3
```

Add a load balancer (Nginx/HAProxy) in front of multiple core instances.

### Database Scaling

For production loads:
- Set up MongoDB replica set
- Configure Redis cluster
- Use read replicas for MongoDB

---

## Security Hardening

### Firewall

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Rate Limiting

Add to Nginx config:

```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

location /api {
    limit_req zone=api burst=20;
    proxy_pass http://localhost:8080;
}
```

### Fail2Ban

```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
```

---

## Troubleshooting

### Check Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f core

# Last 100 lines
docker-compose logs --tail=100 auth
```

### Restart Services

```bash
# All services
docker-compose restart

# Specific service
docker-compose restart core
```

### Database Connection Issues

```bash
# Check MongoDB
docker exec -it webchat-mongo-1 mongosh

# Check Redis
docker exec -it webchat-redis-1 redis-cli ping
```

---

## Updates

### Pull Latest Changes

```bash
git pull origin main
docker-compose down
docker-compose build
docker-compose up -d
```

### Database Migrations

Run migrations before starting services:

```bash
# Add migration scripts here
```

---

## Support

For issues and questions:
- GitHub Issues: https://github.com/cybertecklabs/WebChat/issues
- Documentation: https://docs.webchat.dev
- Email: support@cybertecklabs.com
