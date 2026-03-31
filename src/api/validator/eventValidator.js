const { z } = require("zod");

const eventSchema = z.object({
  type: z.string().min(1, "Event type is required"),

  channels: z
    .array(z.enum(["email", "webhook"]))
    .min(1, "At least one channel is required"),

  payload: z
    .object({})
    .passthrough(), // allow flexible payload
});

module.exports = { eventSchema };