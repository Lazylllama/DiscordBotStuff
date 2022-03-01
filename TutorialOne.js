File Name: index.js
Code: 

const { Client } = require("discord.js");
const client = new Client({ intents: 3 });
const { Token } = require("./config.json");

client.once("ready", () => {
  console.log("The bot is now online!");
  client.user.setActivity("Hello!", { type: "WATCHING" });
});

client.log(Token);

File Name: config.json
Code:

{
  "Token": "YOUR_TOKEN"
}


