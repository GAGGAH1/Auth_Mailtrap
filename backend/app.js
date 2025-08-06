const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require("./routes/authRoute")

const connectDB = require('./config/db');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());// Middleware to parse JSON bodies
app.use(cookieParser()); // Middleware to parse cookies


app.use("/api/auth", authRoutes);

connectDB().then(() => {
  app.listen(PORT, () => {
  console.log('Server is running on port:', PORT);
  });
});