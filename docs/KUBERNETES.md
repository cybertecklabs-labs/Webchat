# Kubernetes Deployment Guide

## Overview

Production-grade Kubernetes deployment for WebChat v1.0 with autoscaling, high availability, and monitoring.

---

## 1. Prerequisites

- Kubernetes cluster (1.25+)
- kubectl configured
- Helm 3.x installed
- Container registry access

---

## 2. Namespace and Secrets

### Create Namespace

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: webchat
  labels:
    name: webchat
```

### Secrets

```yaml
# k8s/secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: webchat-secrets
  namespace: webchat
type: Opaque
stringData:
  JWT_SECRET: "your-jwt-secret-here"
  MONGO_URI: "mongodb://mongo:27017"
  LIVEKIT_API_KEY: "your-livekit-api-key"
  LIVEKIT_API_SECRET: "your-livekit-api-secret"
  GRAFANA_PASSWORD: "your-grafana-password"
```

Apply:

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secrets.yaml
```

---

## 3. StatefulSets for Databases

### MongoDB StatefulSet

```yaml
# k8s/mongodb-statefulset.yaml
apiVersion: v1
kind: Service
metadata:
  name: mongo
  namespace: webchat
spec:
  ports:
  - port: 27017
    targetPort: 27017
  clusterIP: None
  selector:
    app: mongo
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mongo
  namespace: webchat
spec:
  serviceName: mongo
  replicas: 3
  selector:
    matchLabels:
      app: mongo
  template:
    metadata:
      labels:
        app: mongo
    spec:
      containers:
      - name: mongo
        image: mongo:6
        ports:
        - containerPort: 27017
        volumeMounts:
        - name: mongo-data
          mountPath: /data/db
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
  volumeClaimTemplates:
  - metadata:
      name: mongo-data
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 20Gi
```

### Redis Deployment

```yaml
# k8s/redis-deployment.yaml
apiVersion: v1
kind: Service
metadata:
  name: redis
  namespace: webchat
spec:
  ports:
  - port: 6379
    targetPort: 6379
  selector:
    app: redis
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
  namespace: webchat
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
      - name: redis
        image: redis:7-alpine
        ports:
        - containerPort: 6379
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

---

## 4. Application Deployments

### Auth Service

```yaml
# k8s/auth-deployment.yaml
apiVersion: v1
kind: Service
metadata:
  name: auth-service
  namespace: webchat
spec:
  selector:
    app: auth-service
  ports:
  - port: 8081
    targetPort: 8081
  type: ClusterIP
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service
  namespace: webchat
spec:
  replicas: 2
  selector:
    matchLabels:
      app: auth-service
  template:
    metadata:
      labels:
        app: auth-service
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "8081"
        prometheus.io/path: "/metrics"
    spec:
      containers:
      - name: auth
        image: your-registry/webchat-auth:latest
        ports:
        - containerPort: 8081
        env:
        - name: MONGO_URI
          valueFrom:
            secretKeyRef:
              name: webchat-secrets
              key: MONGO_URI
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: webchat-secrets
              key: JWT_SECRET
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "250m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8081
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8081
          initialDelaySeconds: 5
          periodSeconds: 5
```

### Core Service

```yaml
# k8s/core-deployment.yaml
apiVersion: v1
kind: Service
metadata:
  name: core-service
  namespace: webchat
spec:
  selector:
    app: core-service
  ports:
  - name: http
    port: 8080
    targetPort: 8080
  - name: websocket
    port: 8081
    targetPort: 8081
  type: ClusterIP
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: core-service
  namespace: webchat
spec:
  replicas: 3
  selector:
    matchLabels:
      app: core-service
  template:
    metadata:
      labels:
        app: core-service
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "8080"
    spec:
      containers:
      - name: core
        image: your-registry/webchat-core:latest
        ports:
        - containerPort: 8080
          name: http
        - containerPort: 8081
          name: websocket
        env:
        - name: MONGO_URI
          valueFrom:
            secretKeyRef:
              name: webchat-secrets
              key: MONGO_URI
        - name: REDIS_URL
          value: "redis://redis:6379"
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: webchat-secrets
              key: JWT_SECRET
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
      terminationGracePeriodSeconds: 30
```

### Frontend

```yaml
# k8s/frontend-deployment.yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend
  namespace: webchat
spec:
  selector:
    app: frontend
  ports:
  - port: 80
    targetPort: 3000
  type: ClusterIP
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: webchat
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: your-registry/webchat-frontend:latest
        ports:
        - containerPort: 3000
        env:
        - name: NEXT_PUBLIC_API_URL
          value: "https://api.yourdomain.com"
        - name: NEXT_PUBLIC_WS_URL
          value: "wss://api.yourdomain.com/ws"
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "250m"
```

---

## 5. Horizontal Pod Autoscaling

### Core Service HPA

```yaml
# k8s/core-hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: core-service-hpa
  namespace: webchat
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: core-service
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 10
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
      - type: Percent
        value: 100
        periodSeconds: 15
      - type: Pods
        value: 4
        periodSeconds: 15
      selectPolicy: Max
```

### Auth Service HPA

```yaml
# k8s/auth-hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: auth-service-hpa
  namespace: webchat
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: auth-service
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

---

## 6. Ingress Configuration

### Nginx Ingress

```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: webchat-ingress
  namespace: webchat
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/websocket-services: "core-service"
    nginx.ingress.kubernetes.io/proxy-read-timeout: "3600"
    nginx.ingress.kubernetes.io/proxy-send-timeout: "3600"
    nginx.ingress.kubernetes.io/proxy-connect-timeout: "3600"
    nginx.ingress.kubernetes.io/proxy-body-size: "10m"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - chat.yourdomain.com
    - api.yourdomain.com
    secretName: webchat-tls
  rules:
  - host: chat.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend
            port:
              number: 80
  - host: api.yourdomain.com
    http:
      paths:
      - path: /ws
        pathType: Prefix
        backend:
          service:
            name: core-service
            port:
              number: 8081
      - path: /auth
        pathType: Prefix
        backend:
          service:
            name: auth-service
            port:
              number: 8081
      - path: /
        pathType: Prefix
        backend:
          service:
            name: core-service
            port:
              number: 8080
```

---

## 7. Pod Disruption Budget

```yaml
# k8s/pdb.yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: core-service-pdb
  namespace: webchat
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app: core-service
---
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: auth-service-pdb
  namespace: webchat
spec:
  minAvailable: 1
  selector:
    matchLabels:
      app: auth-service
```

---

## 8. Monitoring Stack

### Prometheus Operator

```bash
# Install kube-prometheus-stack
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace webchat \
  --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false
```

### ServiceMonitor for WebChat

```yaml
# k8s/servicemonitor.yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: webchat-metrics
  namespace: webchat
spec:
  selector:
    matchLabels:
      app: core-service
  endpoints:
  - port: http
    path: /metrics
    interval: 30s
---
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: auth-metrics
  namespace: webchat
spec:
  selector:
    matchLabels:
      app: auth-service
  endpoints:
  - port: http
    path: /metrics
    interval: 30s
```

---

## 9. Deployment Commands

### Apply All Manifests

```bash
# Create namespace and secrets
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secrets.yaml

# Deploy databases
kubectl apply -f k8s/mongodb-statefulset.yaml
kubectl apply -f k8s/redis-deployment.yaml

# Wait for databases
kubectl wait --for=condition=ready pod -l app=mongo -n webchat --timeout=300s
kubectl wait --for=condition=ready pod -l app=redis -n webchat --timeout=60s

# Deploy applications
kubectl apply -f k8s/auth-deployment.yaml
kubectl apply -f k8s/core-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml

# Apply autoscaling
kubectl apply -f k8s/core-hpa.yaml
kubectl apply -f k8s/auth-hpa.yaml

# Apply PDB
kubectl apply -f k8s/pdb.yaml

# Apply ingress
kubectl apply -f k8s/ingress.yaml

# Apply monitoring
kubectl apply -f k8s/servicemonitor.yaml
```

### Verify Deployment

```bash
# Check pods
kubectl get pods -n webchat

# Check services
kubectl get svc -n webchat

# Check HPA
kubectl get hpa -n webchat

# Check ingress
kubectl get ingress -n webchat

# View logs
kubectl logs -f deployment/core-service -n webchat
```

---

## 10. Helm Chart (Optional)

### Chart Structure

```
webchat-helm/
├── Chart.yaml
├── values.yaml
├── templates/
│   ├── _helpers.tpl
│   ├── namespace.yaml
│   ├── secrets.yaml
│   ├── auth-deployment.yaml
│   ├── core-deployment.yaml
│   ├── frontend-deployment.yaml
│   ├── mongodb-statefulset.yaml
│   ├── redis-deployment.yaml
│   ├── hpa.yaml
│   ├── pdb.yaml
│   ├── ingress.yaml
│   └── servicemonitor.yaml
```

### values.yaml

```yaml
replicaCount:
  auth: 2
  core: 3
  frontend: 2

image:
  registry: your-registry
  auth:
    repository: webchat-auth
    tag: latest
  core:
    repository: webchat-core
    tag: latest
  frontend:
    repository: webchat-frontend
    tag: latest
  pullPolicy: Always

resources:
  auth:
    requests:
      memory: "128Mi"
      cpu: "100m"
    limits:
      memory: "256Mi"
      cpu: "250m"
  core:
    requests:
      memory: "256Mi"
      cpu: "250m"
    limits:
      memory: "512Mi"
      cpu: "500m"
  frontend:
    requests:
      memory: "128Mi"
      cpu: "100m"
    limits:
      memory: "256Mi"
      cpu: "250m"

autoscaling:
  core:
    enabled: true
    minReplicas: 3
    maxReplicas: 20
    targetCPU: 70
    targetMemory: 80
  auth:
    enabled: true
    minReplicas: 2
    maxReplicas: 10
    targetCPU: 70

ingress:
  enabled: true
  className: nginx
  hosts:
    - host: chat.yourdomain.com
      paths:
        - path: /
          pathType: Prefix
    - host: api.yourdomain.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: webchat-tls
      hosts:
        - chat.yourdomain.com
        - api.yourdomain.com

mongodb:
  replicas: 3
  storage: 20Gi

redis:
  enabled: true

secrets:
  jwtSecret: "your-jwt-secret"
  mongoUri: "mongodb://mongo:27017"
  livekitApiKey: "your-api-key"
  livekitApiSecret: "your-api-secret"
```

### Install with Helm

```bash
helm install webchat ./webchat-helm \
  --namespace webchat \
  --create-namespace \
  --values values-production.yaml
```

---

## 11. Scaling Strategies

### Vertical Scaling

Increase resources for individual pods:

```bash
kubectl set resources deployment core-service \
  --limits=cpu=1000m,memory=1Gi \
  --requests=cpu=500m,memory=512Mi \
  -n webchat
```

### Horizontal Scaling

Manual scaling:

```bash
kubectl scale deployment core-service --replicas=10 -n webchat
```

### Cluster Autoscaling

Enable cluster autoscaler for node-level scaling:

```yaml
# On GKE
gcloud container clusters update CLUSTER_NAME \
  --enable-autoscaling \
  --min-nodes=3 \
  --max-nodes=20
```

---

## 12. Backup and Disaster Recovery

### MongoDB Backup CronJob

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: mongodb-backup
  namespace: webchat
spec:
  schedule: "0 2 * * *"  # Daily at 2 AM
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: mongo:6
            command:
            - /bin/sh
            - -c
            - mongodump --uri=$MONGO_URI --out=/backup/$(date +%Y%m%d)
            env:
            - name: MONGO_URI
              valueFrom:
                secretKeyRef:
                  name: webchat-secrets
                  key: MONGO_URI
            volumeMounts:
            - name: backup-storage
              mountPath: /backup
          volumes:
          - name: backup-storage
            persistentVolumeClaim:
              claimName: backup-pvc
          restartPolicy: OnFailure
```

---

## Summary

Kubernetes deployment provides:

- ✅ **High Availability**: Multiple replicas, PDB
- ✅ **Auto-scaling**: HPA for CPU/memory
- ✅ **Load Balancing**: Ingress with WebSocket support
- ✅ **Monitoring**: Prometheus + Grafana
- ✅ **Security**: Secrets management, network policies
- ✅ **Disaster Recovery**: Automated backups

Deploy to production:

```bash
# One-command deployment
kubectl apply -k k8s/

# Or with Helm
helm install webchat ./webchat-helm -n webchat
```
