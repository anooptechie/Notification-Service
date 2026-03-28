require("dotenv").config();
const express = require("express");
const eventsRoute = require("./routes/eventsRoute");

const app = express();

app.use(express.json());
app.use("/events", eventsRoute);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});