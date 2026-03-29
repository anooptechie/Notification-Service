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

## 🔄 Current System Flow

Event → Idempotency Check → Queue → Fan-out → Channel Queues → Workers → Handlers → Delivery
                                   ↓
                              Retry / Failure
                                   ↓
                                   DLQ
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

## 📈 Evolution Plan

### Phase 6
- Observability

---

## 🧠 Key Insight

> This project is not about building more APIs —  
> it is about designing how systems behave under asynchronous, distributed conditions.

---

## 🎯 Final Positioning

This project represents:

> A transition from API-centric backend development to **system-oriented backend engineering**