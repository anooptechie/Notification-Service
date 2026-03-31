# Notification Service — Project Context

---

## 🧠 Purpose

This project is designed to explore **consumer-side system design**, specifically:

- how events are processed after being produced
- how to handle multi-channel delivery
- how to design systems with failure isolation

---

## 🔍 Background

Previous projects already implemented:

- robust API design (validation, idempotency, rate limiting)
- background job processing (BullMQ)
- retry handling and DLQ
- outbox pattern

---

## ❗ Identified Gap

What was missing:

- meaningful event consumption
- fan-out processing
- multi-channel delivery
- delivery guarantees

---

## 🎯 Design Goal

> Build a system that focuses on **what happens after an event is produced**

---

## 🧱 Key Design Decisions

---

### 1. Thin Publisher API

The API is intentionally minimal:

- accepts event
- enqueues job
- returns response

**Reason:**
Producer complexity was already demonstrated in previous projects.

---

### 2. Consumer-Centric Architecture

All meaningful logic is placed in the worker:

- routing
- fan-out
- delivery

---

### 3. Event-Driven Design

Communication is based on events, not direct service calls.

---

### 4. Fan-out Strategy (IMPORTANT)

**Chosen approach: Channel-level jobs**  
1 event → multiple child jobs

**Reason:**
- failure isolation
- independent retries
- cleaner system design

---

### 5. Multi-Queue Architecture

Separate queues per channel:

- notification-queue (parent)
- email-queue
- webhook-queue

**Reason:**
- workload isolation
- scalability
- independent processing

---

### 6. Independent Workers

Each channel has its own worker.

**Benefits:**
- horizontal scaling
- fault isolation
- extensibility

---

### 7. Modular Delivery Handlers 

Delivery logic is separated from workers into dedicated handlers:

- emailHandler.js
- webhookHandler.js

**Flow:**
Worker → Handler → Delivery Logic

**Reason:**
- separation of concerns
- clean architecture
- easy integration of real providers later
- avoids tight coupling between orchestration and execution

---

### 8. Retry & Failure Handling

Retry behavior is handled by BullMQ:

- automatic retries with exponential backoff
- no custom retry logic required
- failures propagated from handlers

**Reason:**
- leverages queue guarantees
- simplifies system design
- ensures resilience without complexity

### 9. Dead Letter Queue (DLQ) 

Failed jobs are retained after exhausting retries:

- accessible via queue.getFailed()
- inspectable using a custom DLQ inspector
- supports manual retry

**Reason:**
- enables operational visibility
- prevents silent failures
- supports recovery workflows

### 10. Correlation & Traceability 

Parent job metadata is propagated to child jobs:

- parentJobId passed to all channel jobs
- logs include correlation context

**Reason:**
- improves debugging
- enables tracing across distributed flow
- aligns with real-world observability patterns

### 11. Idempotency

The API enforces idempotent request handling:

- requires Idempotency-Key header
- checks Redis before enqueueing
- prevents duplicate job creation
- uses TTL to expire stored keys

**Reason:**
- ensures consistency under retries
- prevents duplicate side effects
- aligns with real-world API design patterns

### 12. Containerized Deployment (NEW)

The system is fully containerized using Docker:

- API, workers, and Redis run as separate services
- orchestrated via docker-compose
- system can be started with a single command

**Reason:**
- ensures reproducibility across environments
- simplifies local development and testing
- aligns with real-world deployment practices

### 13. Real External Integration (Email via SMTP)
The system integrates with a real email provider using Nodemailer:

- uses SMTP (Gmail) with App Password authentication
- integrated at the handler layer
- leverages existing retry + DLQ system for failure handling

**Reason:**
- demonstrates real-world dependency handling
- validates system behavior under external failures
- avoids over-engineering while adding realism

### 14. Webhook Delivery Implementation
The system supports webhook-based notification delivery using HTTP POST requests.

- implemented at the handler layer using Axios
- configurable via environment variable (WEBHOOK_URL)

**Design Considerations:**
- webhook delivery is treated as an external dependency
- handler-level integration keeps business logic decoupled from transport concerns
- timeout ensures system stability under slow or unresponsive endpoints

### 15. Failure Isolation Across Channels
Each notification channel operates independently:

- email and webhook jobs are separate
- failure in one channel does not impact others
- retries handled per-channel

**Reason:**
- aligns with real-world distributed systems
- prevents cascading failures
- improves system resilience

### 16. Retry Behavior with External Systems
Retries are designed to handle transient external failures:

- simulated and real failures tested
- exponential backoff applied
- success on retry does not duplicate side effects

**Reason:**
- external systems are unreliable by nature
- ensures eventual success without duplication

### 17. Observability & Monitoring 

The system includes basic observability features across all services:

- structured logging using Pino
- traceId propagation across API, workers, and handlers
- Prometheus-compatible metrics using prom-client

Each service exposes its own `/metrics` endpoint:

- API
- email worker
- webhook worker

**Design Considerations:**

- metrics are maintained per-process (no shared state)
- aligns with distributed system architecture
- avoids incorrect aggregation of metrics across services

**Benefits:**

- enables debugging using structured logs
- allows tracing of requests across system boundaries
- provides visibility into system behavior (failures, retries, throughput)

## 🔄 Current System Flow

Client
  ↓
Idempotent API
  ↓
Notification Queue
  ↓
Fan-out Worker
  ↓
Email Queue        Webhook Queue
  ↓                  ↓
Email Worker     Webhook Worker
  ↓                  ↓
SMTP (Gmail)     HTTP Call (Webhook.site)
  ↓                  ↓
Retry → DLQ       Retry → DLQ

---

## ⚖️ Trade-offs

---

### ✔ Simplicity over completeness

- no idempotency yet
- no complex retry strategies
- no validation layer
- handlers use console-based delivery (no real integrations yet)

**Reason:**
Focus on core system behavior first.

---

### ✔ Explicit over implicit logic

- channels defined in event
- no hidden routing rules

---

## 🚀 What This System Demonstrates

### System Design

- event-driven architecture
- decoupling via queues
- fan-out processing
- multi-channel delivery

---

### Backend Engineering

- async workflows
- worker-based processing
- multi-queue systems
- modular execution layer (handlers)

---

### Engineering Judgment

- avoids repetition of solved problems
- focuses on new learning areas
- balances simplicity with correctness

---

## 🧠 Key Insight

> This project is not about building more APIs —  
> it is about designing how systems behave under asynchronous, distributed conditions.

---

## 🎯 Final Positioning

This project represents:

> A transition from API-centric backend development to **system-oriented backend engineering**

