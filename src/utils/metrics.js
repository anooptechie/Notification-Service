const client = require("prom-client");

const register = new client.Registry();

client.collectDefaultMetrics({ register });

const jobsProcessed = new client.Counter({
  name: "jobs_processed_total",
  help: "Total processed jobs",
  labelNames: ["queue"],
});

const jobsFailed = new client.Counter({
  name: "jobs_failed_total",
  help: "Total failed jobs",
  labelNames: ["queue"],
});

register.registerMetric(jobsProcessed);
register.registerMetric(jobsFailed);

module.exports = {
  register,
  jobsProcessed,
  jobsFailed,
};