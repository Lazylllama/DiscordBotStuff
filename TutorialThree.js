File Name: config.json
Code: 

{
  "Token": "YOUR_TOKEN",
  "Database": "YOUR_DATABASE_URL"
}

File Name: ready.js
Code: 

const { Client } = require("discord.js");
const { Database } = require("../../config.json");
module.exports = {
  name: "ready",
  once: true,
  /**
   * @param {Client} client
   */
  execute(client) {
    console.log("The client is now ready!");
    client.user.setActivity("HELLO!", { type: "WATCHING" });

    if(!Database) return;
    mongoose.connect(Database, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }).then(() => {
      console.log("The client is now connected to the database!")
    }).catch((ee) => {
      console.log(err);
    })
  },
};
