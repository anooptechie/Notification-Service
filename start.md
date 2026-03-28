1. redis-server
2. node src/api/server.js 
3. node src/worker/notificationWorker.js
> Start these servers in three different tabs.

4. Test request
curl -X POST http://localhost:4000/events \
  -H "Content-Type: application/json" \
  -d '{
    "type": "test.event",
    "message": "Hello Notification Service"
  }'

5. Expected Behaviour 
{
  "status": "accepted",
  "jobId": "1"
}

6. Worker output:
📩 Processing job: 1
Payload: { type: 'test.event', message: 'Hello Notification Service' }
✅ Job 1 completed

7. 