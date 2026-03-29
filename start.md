1. redis-server
2. node src/api/server.js 
3. node src/worker/notificationWorker
4. node src/worker/emailWorker.js
5. node src/worker/webhookWorker.js
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

7. curl -X POST http://localhost:4000/events \
  -H "Content-Type: application/json" \
  -d '{
    "type": "inventory.low_stock",
    "channels": ["email", "webhook"],
    "payload": { "itemId": "123" }
  }'

8. Modern Startup 
docker compose run 

This command works inside VS Code Terminal
node src/utils/dlqInspector.js | to check dlq emails and webhooks | this works in vscode terminal

This command works inside Github CodeSpaces Terminal
docker exec -it <container_name> node src/utils/dlqInspector.js | docker exec -it notification-service-email-worker-1 node src/utils/dlqInspector.js

in dlqInspector.js we have retryAllFailedJobs function. Make sure you uncomment and run, node src/utils/dlqInspector.js in the terminal.


9. curl -X POST http://localhost:4000/events \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: email-test-1" \
  -d '{
    "type": "inventory.low_stock",
    "channels": ["email"],
    "payload": { "itemId": "123" }
  }'


