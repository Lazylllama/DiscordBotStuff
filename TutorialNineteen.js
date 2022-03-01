// DATABASE // 
const { model, Schema } = require("mongoose");

module.exports = model(
  "Lockdown",
  new Schema({
    GuildID: String,
    ChannelID: String,
    Time: String,
  })
);

// LOCKDOWN COMMAND //
const { CommandInteraction, MessageEmbed } = require("discord.js");
const DB = require("../../Structures/Schemas/LockDown");
const ms = require("ms");

module.exports = {
  name: "lock",
  description: "Lockdown this channel",
  permission: "MANAGE_CHANNELS",
  options: [
    {
      name: "time",
      description: "Expire date for this lockdown (1m, 1h, 1d)",
      type: "STRING",
    },
    {
      name: "reason",
      description: "Provide a reason for this lockdown.",
      type: "STRING",
    },
  ],
  /**
   *
   * @param {CommandInteraction} interaction
   */
  async execute(interaction) {
    const { guild, channel, options } = interaction;

    const Reason = options.getString("reason") || "no specified reason";

    const Embed = new MessageEmbed();

    if (!channel.permissionsFor(guild.id).has("SEND_MESSAGES"))
      return interaction.reply({
        embeds: [
          Embed.setColor("RED").setDescription(
            "⛔ | This channel is already locked."
          ),
        ],
        ephemeral: true,
      });

    channel.permissionOverwrites.edit(guild.id, {
      SEND_MESSAGES: false,
    });

    interaction.reply({
      embeds: [
        Embed.setColor("RED").setDescription(
          `🔒 | This channel is now under lockdown for: ${Reason}`
        ),
      ],
    });
    const Time = options.getString("time");
    if (Time) {
      const ExpireDate = Date.now() + ms(Time);
      DB.create({ GuildID: guild.id, ChannelID: channel.id, Time: ExpireDate });

      setTimeout(async () => {
        channel.permissionOverwrites.edit(guild.id, {
          SEND_MESSAGES: null,
        });
        interaction
          .editReply({
            embeds: [
              Embed.setDescription(
                "🔓 | The lockdown has been lifted"
              ).setColor("GREEN"),
            ],
          })
          .catch(() => {});
        await DB.deleteOne({ ChannelID: channel.id });
      }, ms(Time));
    }
  },
};

// UNLOCK COMMAND //
const { CommandInteraction, MessageEmbed } = require("discord.js");
const DB = require("../../Structures/Schemas/LockDown");

module.exports = {
  name: "unlock",
  description: "Lift a lockdown from a channel",
  permission: "MANAGE_CHANNELS",
  /**
   *
   * @param {CommandInteraction} interaction
   */
  async execute(interaction) {
    const { guild, channel } = interaction;

    const Embed = new MessageEmbed();

    if (channel.permissionsFor(guild.id).has("SEND_MESSAGES"))
      return interaction.reply({
        embeds: [
          Embed.setColor("RED").setDescription(
            "⛔ | This channel is not locked"
          ),
        ],
        ephemeral: true,
      });

    channel.permissionOverwrites.edit(guild.id, {
      SEND_MESSAGES: null,
    });

    await DB.deleteOne({ ChannelID: channel.id });

    interaction.reply({
      embeds: [
        Embed.setColor("GREEN").setDescription(
          "🔓 | Lockdown has been lifted."
        ),
      ],
    });
  },
};

// SYSTEM //
const { Client } = require("discord.js");
const DB = require("../Structures/Schemas/LockDown");
/**
 * @param {Client} client
 */
module.exports = async (client) => {
  DB.find().then(async (documentsArray) => {
    documentsArray.forEach(async (d) => {
      const Channel = client.guilds.cache
        .get(d.GuildID)
        .channels.cache.get(d.ChannelID);
      if (!Channel) return;

      const TimeNow = Date.now();
      if (d.Time < TimeNow) {
        Channel.permissionOverwrites.edit(d.GuildID, {
          SEND_MESSAGES: null,
        });
        return await DB.deleteOne({ ChannelID: Channel.id });
      }

      const ExpireDate = d.Time - Date.now();

      setTimeout(async () => {
        Channel.permissionOverwrites.edit(d.GuildID, {
          SEND_MESSAGES: null,
        });
        await DB.deleteOne({ ChannelID: Channel.id });
      }, ExpireDate);
    });
  });
};

/// IN YOUR READY EVENT FILE ///
    require("../../Systems/LockdownSys")(client);

