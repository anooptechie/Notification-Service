# Notification Service

A standalone, event-driven notification system designed to process and deliver notifications asynchronously using a queue-based architecture.

---

## 🧠 Overview

This service demonstrates how to build a **consumer-focused backend system** that handles:

- Event ingestion via a thin API
- Asynchronous processing using Redis + BullMQ
- Fan-out architecture for multi-channel delivery
- Independent workers per notification channel

---

## 🚀 Current Features (Phase 1 - Phase 5)

### ✅ Thin Publisher API

- Accepts events via `POST /events`
- Enqueues jobs into Redis queue
- Responds immediately with `202 Accepted`

### ✅ Asynchronous Processing

- Jobs are processed independently of API lifecycle
- Decoupled producer and consumer

### ✅ Fan-out Architecture

- One event can trigger multiple notification channels
- Parent job splits into multiple child jobs

### ✅ Multi-Queue System

- `notification-queue` → parent jobs
- `email-queue` → email jobs
- `webhook-queue` → webhook jobs

### ✅ Independent Workers

- Email worker processes email jobs
- Webhook worker processes webhook jobs

### ✅ Modular Delivery Handlers

Workers delegate delivery logic to handlers:

Worker → Handler → Delivery Logic

---

Handlers:

- `emailHandler.js`
- `webhookHandler.js`

---

### ✅ Retry Strategy

- Automatic retries using BullMQ
- Exponential backoff applied
- No manual retry logic required

---

### ✅ Retry Strategy

- Automatic retries using BullMQ
- Exponential backoff applied
- No manual retry logic required

---

### ✅ Dead Letter Queue (DLQ)

- Failed jobs are stored after exhausting retries
- Inspectable via DLQ inspector
- Supports manual retry of failed jobs

---

### ✅ Idempotency

- Prevents duplicate job creation
- Uses Idempotency-Key header
- Ensures safe retries from clients
- Backed by Redis key storage with TTL

## 🐳 Docker Support

Run the entire system with a single command:

```bash
docker compose up --build

---

## 🧩 Architecture

POST /events
↓
notification-queue
↓
Fan-out Worker
↓
email-queue webhook-queue
↓ ↓
email-worker webhook-worker
↓ ↓
email-Handler webhook-Handler

---

## 📡 API

### POST /events

#### Request

```json
{
  "type": "inventory.low_stock",
  "channels": ["email", "webhook"],
  "payload": {
    "itemId": "123"
  }
}
Response
{
  "status": "accepted",
  "jobId": "1"
}
⚙️ Tech Stack
Node.js
Express.js
BullMQ
Redis
ioredis

🧪 How to Run
1. Start Redis
redis-server
2. Start API
node src/api/server.js
3. Start Workers (separate terminals)
node src/worker/notificationWorker.js
node src/worker/emailWorker.js
node src/worker/webhookWorker.js

🧪 Test with curl
curl -X POST http://localhost:4000/events \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: test-key-123" \
  -d '{
    "type": "inventory.low_stock",
    "channels": ["email", "webhook"],
    "payload": { "itemId": "123" }
  }'


```
