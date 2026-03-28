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

## 🚀 Current Features (Phase 1 - Phase 3)

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

### ✅ Modular Delivery Handlers (NEW)

Workers delegate delivery logic to handlers:

```text
Worker → Handler → Delivery Logic
``` id="s0r9yk"

---

Handlers:

- `emailHandler.js`
- `webhookHandler.js`

---

### 🧠 Why this matters

- clean separation of concerns  
- extensible architecture  
- easy to plug in real providers later  


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
  -d '{
    "type": "inventory.low_stock",
    "channels": ["email", "webhook"],
    "payload": { "itemId": "123" }
  }'


