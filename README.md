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

### ✅ Handlers:

- `emailHandler.js`
- `webhookHandler.js`

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

### ✅ Real Email Delivery 

- Email delivery implemented using Nodemailer (SMTP)
- Integrated with Gmail using App Password authentication
- Works with retry + DLQ mechanism
- Demonstrates handling of real external dependencies

---

### 🌐 Webhook Delivery (Test-based)

- Webhook delivery implemented via HTTP POST requests
- Uses external endpoint (Webhook.site) for request inspection
- Integrated with retry + DLQ mechanism
- Demonstrates handling of external HTTP-based integrations

---

### 💡 Behavior:

- Temporary failures → retried automatically  
- Persistent failures → moved to DLQ  
- Successful retry → no duplicate emails (idempotent system)

---

### ✅ Structured Logging 

- Implemented structured logging using Pino
- Replaced console logs with JSON-based logs
- Logs include contextual metadata:
  - traceId
  - jobId
  - parentJobId
- Enables easier debugging and log aggregation

---

### ✅ End-to-End Traceability

- Each request is assigned a unique `traceId`
- `traceId` is propagated across:
  - API → notification worker → channel workers → handlers
- Enables tracking a request across the entire system

---

### ✅ Prometheus Metrics 

- Integrated `prom-client` for metrics collection
- Tracks:
  - `jobs_processed_total`
  - `jobs_failed_total`
- Metrics are exposed via `/metrics` endpoints

---

### ✅ Per-Service Metrics Exposure 

- Metrics are exposed independently per service:
  - API → `localhost:4000/metrics`
  - Email Worker → `localhost:4001/metrics`
  - Webhook Worker → `localhost:4002/metrics`
- Aligns with distributed system design (no shared in-memory metrics)

---

### ✅ Observability Across System 

- Combines:
  - structured logging (debugging)
  - traceId propagation (request tracking)
  - metrics (system behavior)
- Provides visibility into:
  - retries
  - failures
  - processing flow

---

### ✅ Queue Monitoring UI (Bull Board) (NEW)

- Integrated Bull Board for visual queue inspection
- Accessible via: `/admin/queues`
- Supports:
  - viewing jobs (waiting, active, completed, failed)
  - inspecting job payload and metadata
  - retrying failed jobs manually
- Covers all queues:
  - notification-queue
  - email-queue
  - webhook-queue

---

### ✅ Operational Visibility 

- Provides real-time visibility into queue state
- Complements logs and metrics with UI-based debugging
- Enables manual intervention (retry failed jobs)
- Useful for debugging retries and DLQ scenarios

--- 

## 🧪 Testing

The system includes integration tests that validate the correctness, safety, and reliability of the event ingestion layer.

Tests are implemented using Jest and Supertest, with external dependencies (BullMQ, Redis) mocked to ensure deterministic behavior.

---

### ✅ Test Coverage

#### 1. Event Acceptance

- Verifies that valid events are accepted
- Ensures jobs are successfully enqueued
- Confirms API responds with `202 Accepted`

---

#### 2. Payload Validation

- Rejects malformed or invalid requests
- Prevents invalid data from entering the system

---

#### 3. Idempotency Key Enforcement

- Ensures requests without `Idempotency-Key` are rejected
- Guarantees safe retry behavior from clients

---

#### 4. Duplicate Request Handling

- Detects repeated requests with the same idempotency key
- Prevents duplicate job creation

---

#### 5. Failure Safety (Critical)

- Simulates queue failure during job enqueue
- Ensures idempotency key is NOT stored on failure
- Allows safe retry of failed requests

---

### 🧠 Testing Strategy

- Uses **integration-style tests** (not unit tests)
- Tests full request flow:
  - API → validation → idempotency → queue interaction
- Mocks:
  - BullMQ queues
  - Redis (via in-memory store for tests)

---

### 🎯 Guarantees Provided

The test suite ensures:

- Correct request validation
- Duplicate-safe event ingestion
- No data loss during failures
- Deterministic and isolated test execution

---

### 🧪 Run Tests

```bash
npm test

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

## 🧠 System Capabilities

- Fault-tolerant job processing  
- Per-channel failure isolation  
- Retry with exponential backoff  
- Dead Letter Queue (DLQ) with replay  
- Idempotent API (duplicate-safe)  
- Real external integration (SMTP email)  
- Uses external endpoint (Webhook.site) for request inspection
- Containerized deployment (Docker)  

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

