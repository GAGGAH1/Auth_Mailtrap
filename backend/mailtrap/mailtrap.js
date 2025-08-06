const { MailtrapClient } = require("mailtrap");
const dotenv = require("dotenv");

dotenv.config();


const mailtrapClient = new MailtrapClient({
  token: process.env.MAILTRAP_API_KEY,
  endpoint: process.env.MAILTRAP_ENDPOINT,
});

const sender = {
  email: "hello@demomailtrap.co",
  name: "Destroyer Of Worlds",
};

// const recipient = [{ email: "beard7158@gmail.com" }];

module.exports = {
  mailtrapClient,
  sender,
  // recipient,
};



