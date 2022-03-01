// main.js add =>
client.filters = new Collection();
client.filtersLog = new Collection();

// ready.js add =>
    require("../../Systems/ChatFilterSys")(client);


// SCHEMA //
const { model, Schema } = require("mongoose");

module.exports = model(
  "Filter",
  new Schema({
    Guild: String,
    Log: String,
    Words: [String],
  })
);

// SYSTEM 
const Schema = require("../Structures/Schemas/FIlterDB");

module.exports = (client) => {
  Schema.find().then((documents) => {
    documents.forEach((doc) => {
      client.filters.set(doc.Guild, doc.Words);
      client.filtersLog.set(doc.Guild, doc.Log);
    });
  });
};

// DETECTION 
const { Message, Client, MessageEmbed } = require("discord.js");

module.exports = {
  name: "messageCreate",
  /**
   * @param {Message} message
   * @param {Client} client
   */
  async execute(message, client) {
    if (message.author.bot) return;

    const { content, guild, author, channel } = message;
    const messageContent = content.toLowerCase().split(" ");

    const Filter = client.filters.get(guild.id);
    if (!Filter) return;

    const wordsUsed = [];
    let shouldDelete = false;

    messageContent.forEach((word) => {
      if (Filter.includes(word)) {
        wordsUsed.push(word);
        shouldDelete = true;
      }
    });

    if (shouldDelete) message.delete().catch(() => {});

    if (wordsUsed.length) {
      const channelID = client.filtersLog.get(guild.id);
      if (!channelID) return;
      const channelObject = guild.channels.cache.get(channelID);
      if (!channelObject) return;

      const Embed = new MessageEmbed()
        .setColor("RED")
        .setAuthor({
          name: author.tag,
          iconURL: author.displayAvatarURL({ dynamic: true }),
        })
        .setDescription(
          [
            `Used ${wordsUsed.length} blacklisted word(s) in ${channel} =>`,
            `\`${wordsUsed.map((w) => w)}\``,
          ].join("\n")
        );

      channelObject.send({ embeds: [Embed] });
    }
  },
};


// COMMAND 
const { CommandInteraction, Client } = require("discord.js");
const Schema = require("../../Structures/Schemas/FIlterDB");

module.exports = {
  name: "filter",
  description: "A simple chat filtering system.",
  permission: "MANAGE_MESSAGES",
  options: [
    {
      name: "settings",
      description: "Setup your filtering system.",
      type: "SUB_COMMAND",
      options: [
        {
          name: "logging",
          description: "Select the logging channel.",
          type: "CHANNEL",
          channelTypes: ["GUILD_TEXT"],
          required: true,
        },
      ],
    },
    {
      name: "configure",
      description: "Add or remove words from the blacklist.",
      type: "SUB_COMMAND",
      options: [
        {
          name: "options",
          description: "Select an option.",
          type: "STRING",
          required: true,
          choices: [
            { name: "Add", value: "add" },
            { name: "Remove", value: "remove" },
          ],
        },
        {
          name: "word",
          description:
            "Provide the word, add multiple words by placeing a comma in between (word,anotherword)",
          type: "STRING",
          required: true,
        },
      ],
    },
  ],
  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const { guild, options } = interaction;

    const subCommand = options.getSubcommand();

    switch (subCommand) {
      case "settings":
        const loggingChannel = options.getChannel("logging").id;

        await Schema.findOneAndUpdate(
          { Guild: guild.id },
          { Log: loggingChannel },
          { new: true, upsert: true }
        );

        client.filtersLog.set(guild.id, loggingChannel);

        interaction.reply({
          content: `Added <#${loggingChannel}> as the logging channel for the filtering system.`,
          ephemeral: true,
        });
        break;
      case "configure":
        const Choice = options.getString("options");
        const Words = options.getString("word").toLowerCase().split(",");

        switch (Choice) {
          case "add":
            Schema.findOne({ Guild: guild.id }, async (err, data) => {
              if (err) throw err;
              if (!data) {
                await Schema.create({
                  Guild: guild.id,
                  Log: null,
                  Words: Words,
                });

                client.filters.set(guild.id, Words);

                return interaction.reply({
                  content: `Added ${Words.length} new word(s) to the blacklist.`,
                });
              }

              const newWords = [];

              Words.forEach((w) => {
                if (data.Words.includes(w)) return;
                newWords.push(w);
                data.Words.push(w);
                client.filters.get(guild.id).push(w);
              });

              interaction.reply({
                content: `Added ${newWords.length} new word(s) to the blacklist.`,
              });

              data.save();
            });
            break;
          case "remove":
            Schema.findOne({ Guild: guild.id }, async (err, data) => {
              if (err) throw err;
              if (!data) {
                return interaction.reply({
                  content: "There is no data to remove!",
                });
              }

              const removedWords = [];

              Words.forEach((w) => {
                if (!data.Words.includes(w)) return;
                data.Words.remove(w);
                removedWords.push(w);
              });

              const newArray = await client.filters
                .get(guild.id)
                .filter((word) => !removedWords.includes(word));

              client.filters.set(guild.id, newArray);

              interaction.reply({
                content: `Removed ${removedWords.length} word(s) from the blacklist.`,
              });
              data.save();
            });
            break;
        }
        break;
    }
  },
};
