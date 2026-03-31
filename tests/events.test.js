// 🔥 Ensure test environment
process.env.NODE_ENV = "test";

// 🔥 Mock BullMQ globally (THIS is the real fix)
jest.mock("bullmq", () => ({
    Queue: jest.fn().mockImplementation(() => ({
        add: jest.fn().mockResolvedValue({ id: "test-job-id" }),
    })),
    Worker: jest.fn(),
}));

// 🔥 Mock queue BEFORE imports
jest.mock("../src/queue/notificationQueue", () => ({
    add: jest.fn().mockResolvedValue({ id: "test-job-id" }),
}));

const request = require("supertest");
const app = require("../src/api/server");

describe("POST /events", () => {
    it("should accept a valid event", async () => {
        const res = await request(app)
            .post("/events")
            .set("Idempotency-Key", "test-1")
            .send({
                type: "inventory.low_stock",
                channels: ["email"],
                payload: { itemId: "123" },
            });

        expect(res.statusCode).toBe(202);
        expect(res.body.status).toBe("accepted");
    });

    it("should reject invalid payload", async () => {
        const res = await request(app)
            .post("/events")
            .set("Idempotency-Key", "test-2")
            .send({
                type: "",
                channels: ["invalid"],
                payload: {},
            });

        expect(res.statusCode).toBe(400);
    });

    it("should reject missing idempotency key", async () => {
        const res = await request(app)
            .post("/events")
            .send({
                type: "inventory.low_stock",
                channels: ["email"],
                payload: {},
            });

        expect(res.statusCode).toBe(400);
    });

    it("should detect duplicate request", async () => {
        const payload = {
            type: "inventory.low_stock",
            channels: ["email"],
            payload: {},
        };

        await request(app)
            .post("/events")
            .set("Idempotency-Key", "dup-test")
            .send(payload);

        const res = await request(app)
            .post("/events")
            .set("Idempotency-Key", "dup-test")
            .send(payload);

        expect(res.body.status).toBe("duplicate");
    });

    it("should NOT mark as duplicate if job enqueue fails", async () => {
        const payload = {
            type: "inventory.low_stock",
            channels: ["email"],
            payload: {},
        };

        // 🔥 Force queue to fail
        const notificationQueue = require("../src/queue/notificationQueue");
        notificationQueue.add.mockRejectedValueOnce(new Error("Queue failure"));

        // First request → should fail
        const res1 = await request(app)
            .post("/events")
            .set("Idempotency-Key", "fail-test")
            .send(payload);

        expect(res1.statusCode).toBe(500);

        // Second request → should NOT be duplicate
        const res2 = await request(app)
            .post("/events")
            .set("Idempotency-Key", "fail-test")
            .send(payload);

        expect(res2.body.status).toBe("accepted"); // ✅ important
    });
});