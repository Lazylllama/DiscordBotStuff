/// TicketSetup Schema /// 
const { model, Schema } = require("mongoose");

module.exports = model(
  "TicketSetup",
  new Schema({
    GuildID: String,
    Channel: String,
    Category: String,
    Transcripts: String,
    Handlers: String,
    Everyone: String,
    Description: String,
    Buttons: [String],
  })
);
/// Ticket Schema ///
const { model, Schema } = require("mongoose");

module.exports = model(
  "Tickets",
  new Schema({
    GuildID: String,
    MembersID: [String],
    TicketID: String,
    ChannelID: String,
    Closed: Boolean,
    Locked: Boolean,
    Type: String,
    Claimed: Boolean,
    ClaimedBy: String,
  })
);
/// Ticket Options Command ///
const { MessageEmbed, CommandInteraction, Message } = require("discord.js");
const DB = require("../../Structures/Schemas/Ticket");

module.exports = {
  name: "ticket",
  description: "Ticket Actions.",
  permission: "ADMINISTRATOR",
  options: [
    {
      name: "action",
      type: "STRING",
      description: "Add or Remove a member from this ticket.",
      required: true,
      choices: [
        { name: "Add", value: "add" },
        { name: "Remove", value: "remove" },
      ],
    },
    {
      name: "member",
      description: "Select a member",
      type: "USER",
      required: true,
    },
  ],
  /**
   *
   * @param {CommandInteraction} interaction
   */
  async execute(interaction) {
    const { guildId, options, channel } = interaction;

    const Action = options.getString("action");
    const Member = options.getMember("member");

    const Embed = new MessageEmbed();

    switch (Action) {
      case "add":
        DB.findOne(
          { GuildID: guildId, ChannelID: channel.id },
          async (err, docs) => {
            if (err) throw err;
            if (!docs)
              return interaction.reply({
                embeds: [
                  Embed.setColor("RED").setDescription(
                    "⛔ | This channel is not tied with a ticket."
                  ),
                ],
                ephemeral: true,
              });
            if (docs.MembersID.includes(Member.id))
              return interaction.reply({
                embeds: [
                  Embed.setColor("RED").setDescription(
                    "⛔ | This member is already added to this ticket."
                  ),
                ],
                ephemeral: true,
              });
            docs.MembersID.push(Member.id);

            channel.permissionOverwrites.edit(Member.id, {
              SEND_MESSAGES: true,
              VIEW_CHANNEL: true,
              READ_MESSAGE_HISTORY: true,
            });

            interaction.reply({
              embeds: [
                Embed.setColor("GREEN").setDescription(
                  `✅ | ${Member} has been added to this ticket.`
                ),
              ],
            });
            docs.save();
          }
        );
        break;
      case "remove":
        DB.findOne(
          { GuildID: guildId, ChannelID: channel.id },
          async (err, docs) => {
            if (err) throw err;
            if (!docs)
              return interaction.reply({
                embeds: [
                  Embed.setColor("RED").setDescription(
                    "⛔ | This channel is not tied with a ticket."
                  ),
                ],
                ephemeral: true,
              });
            if (!docs.MembersID.includes(Member.id))
              return interaction.reply({
                embeds: [
                  Embed.setColor("RED").setDescription(
                    "⛔ | This member is not in this ticket."
                  ),
                ],
                ephemeral: true,
              });
            docs.MembersID.remove(Member.id);

            channel.permissionOverwrites.edit(Member.id, {
              VIEW_CHANNEL: false,
            });

            interaction.reply({
              embeds: [
                Embed.setColor("GREEN").setDescription(
                  `✅ | ${Member} has been removed from this ticket.`
                ),
              ],
            });
            docs.save();
          }
        );
        break;
    }
  },
};
/// Ticket Setup Command ///
const {
  MessageEmbed,
  CommandInteraction,
  MessageActionRow,
  MessageButton,
} = require("discord.js");
const DB = require("../../Structures/Schemas/TicketSetup");

module.exports = {
  name: "ticketsetup",
  description: "Setup your ticketing message.",
  permission: "ADMINISTRATOR",
  options: [
    {
      name: "channel",
      description: "Select the ticket creation channel",
      required: true,
      type: "CHANNEL",
      channelTypes: ["GUILD_TEXT"],
    },
    {
      name: "category",
      description: "Select the ticket channels's creation category.",
      required: true,
      type: "CHANNEL",
      channelTypes: ["GUILD_CATEGORY"],
    },
    {
      name: "transcripts",
      description: "Select the transcripts channel.",
      required: true,
      type: "CHANNEL",
      channelTypes: ["GUILD_TEXT"],
    },
    {
      name: "handlers",
      description: "Select the ticket handler's role.",
      required: true,
      type: "ROLE",
    },
    {
      name: "everyone",
      description: "Provide the @everyone role. ITS IMPORTANT!",
      required: true,
      type: "ROLE",
    },
    {
      name: "description",
      description: "Set the description of the ticket creation channel.",
      required: true,
      type: "STRING",
    },
    {
      name: "firstbutton",
      description:
        "Give your first button a name and add an emoji by adding a comma followed by the emoji.",
      required: true,
      type: "STRING",
    },
    {
      name: "secondbutton",
      description:
        "Give your second button a name and add an emoji by adding a comma followed by the emoji.",
      required: true,
      type: "STRING",
    },
    {
      name: "thirdbutton",
      description:
        "Give your third button a name and add an emoji by adding a comma followed by the emoji.",
      required: true,
      type: "STRING",
    },
  ],

  /**
   *
   * @param {CommandInteraction} interaction
   */
  async execute(interaction) {
    const { guild, options } = interaction;

    try {
      const Channel = options.getChannel("channel");
      const Category = options.getChannel("category");
      const Transcripts = options.getChannel("transcripts");
      const Handlers = options.getRole("handlers");
      const Everyone = options.getRole("everyone");

      const Description = options.getString("description");

      const Button1 = options.getString("firstbutton").split(",");
      const Button2 = options.getString("secondbutton").split(",");
      const Button3 = options.getString("thirdbutton").split(",");

      const Emoji1 = Button1[1];
      const Emoji2 = Button2[1];
      const Emoji3 = Button3[1];

      await DB.findOneAndUpdate(
        { GuildID: guild.id },
        {
          Channel: Channel.id,
          Category: Category.id,
          Transcripts: Transcripts.id,
          Handlers: Handlers.id,
          Everyone: Everyone.id,
          Description: Description,
          Buttons: [Button1[0], Button2[0], Button3[0]],
        },
        {
          new: true,
          upsert: true,
        }
      );

      const Buttons = new MessageActionRow();
      Buttons.addComponents(
        new MessageButton()
          .setCustomId(Button1[0])
          .setLabel(Button1[0])
          .setStyle("PRIMARY")
          .setEmoji(Emoji1),
        new MessageButton()
          .setCustomId(Button2[0])
          .setLabel(Button2[0])
          .setStyle("SECONDARY")
          .setEmoji(Emoji2),
        new MessageButton()
          .setCustomId(Button3[0])
          .setLabel(Button3[0])
          .setStyle("SUCCESS")
          .setEmoji(Emoji3)
      );

      const Embed = new MessageEmbed()
        .setAuthor({
          name: guild.name + " | Ticketing System",
          iconURL: guild.iconURL({ dynamic: true }),
        })
        .setDescription(Description)
        .setColor("#36393f");

      await guild.channels.cache
        .get(Channel.id)
        .send({ embeds: [Embed], components: [Buttons] });

      interaction.reply({ content: "Done", ephemeral: true });
    } catch (err) {
      const errEmbed = new MessageEmbed().setColor("RED").setDescription(
        `⛔ | An error occured while setting up your ticket system\n**what to make sure of?**
          1. Make sure none of your buttons' names are duplicated
          2. Make sure you use this format for your buttons => Name,Emoji
          3. Make sure your button names do not exceed 200 characters
          4. Make sure your button emojis, are actually emojis, not ids.`
      );
      console.log(err);
      interaction.reply({ embeds: [errEmbed] });
    }
  },
};
/// INITIAL TICKET /// 
const {
  ButtonInteraction,
  MessageEmbed,
  MessageActionRow,
  MessageButton,
} = require("discord.js");
const DB = require("../../Structures/Schemas/Ticket");
const TicketSetupData = require("../../Structures/Schemas/TicketSetup");
module.exports = {
  name: "interactionCreate",
  /**
   *
   * @param {ButtonInteraction} interaction
   */
  async execute(interaction) {
    if (!interaction.isButton()) return;
    const { guild, member, customId } = interaction;

    const Data = await TicketSetupData.findOne({ GuildID: guild.id });
    if (!Data) return;

    if (!Data.Buttons.includes(customId)) return;

    const ID = Math.floor(Math.random() * 90000) + 10000;

    await guild.channels
      .create(`${customId + "-" + ID}`, {
        type: "GUILD_TEXT",
        parent: Data.Category,
        permissionOverwrites: [
          {
            id: member.id,
            allow: ["SEND_MESSAGES", "VIEW_CHANNEL", "READ_MESSAGE_HISTORY"],
          },
          {
            id: Data.Everyone,
            deny: ["SEND_MESSAGES", "VIEW_CHANNEL", "READ_MESSAGE_HISTORY"],
          },
        ],
      })
      .then(async (channel) => {
        await DB.create({
          GuildID: guild.id,
          MembersID: member.id,
          TicketID: ID,
          ChannelID: channel.id,
          Closed: false,
          Locked: false,
          Type: customId,
          Claimed: false,
        });

        const Embed = new MessageEmbed()
          .setAuthor({
            name: `${guild.name} | Ticket: ${ID}`,
            iconURL: guild.iconURL({ dynamic: true }),
          })
          .setDescription(
            `Ticket Opened By: ${member}
            Please wait patiently for a response from the Staff team, in the mean while, describe your issue in as much detail as possible.`
          )
          .setFooter({ text: "The buttons below are Staff Only Buttons." });

        const Buttons = new MessageActionRow();
        Buttons.addComponents(
          new MessageButton()
            .setCustomId("close")
            .setLabel("Save & Close Ticket")
            .setStyle("PRIMARY")
            .setEmoji("💾"),
          new MessageButton()
            .setCustomId("lock")
            .setLabel("Lock")
            .setStyle("SECONDARY")
            .setEmoji("🔒"),
          new MessageButton()
            .setCustomId("unlock")
            .setLabel("Unlock")
            .setStyle("SUCCESS")
            .setEmoji("🔓"),
          new MessageButton()
            .setCustomId("claim")
            .setLabel("Claim")
            .setStyle("PRIMARY")
            .setEmoji("🛄")
        );

        channel.send({
          embeds: [Embed],
          components: [Buttons],
        });
        await channel
          .send({ content: `${member} here is your ticket` })
          .then((m) => {
            setTimeout(() => {
              m.delete().catch(() => {});
            }, 1 * 5000);
          });

        interaction.reply({
          content: `${member} your ticket has been created: ${channel}`,
          ephemeral: true,
        });
      });
  },
};
/// TICKET OPTIONS BUTTONS ///
const { ButtonInteraction, MessageEmbed } = require("discord.js");
const { createTranscript } = require("discord-html-transcripts");

const DB = require("../../Structures/Schemas/Ticket");
const TicketSetupData = require("../../Structures/Schemas/TicketSetup");

module.exports = {
  name: "interactionCreate",
  /**
   *
   * @param {ButtonInteraction} interaction
   */
  async execute(interaction) {
    if (!interaction.isButton()) return;
    const { guild, customId, channel, member } = interaction;
    if (!["close", "lock", "unlock", "claim"].includes(customId)) return;

    const TicketSetup = await TicketSetupData.findOne({ GuildID: guild.id });
    if (!TicketSetup)
      return interaction.reply({
        content: "The data for this system is outdated.",
      });

    if (!member.roles.cache.find((r) => r.id === TicketSetup.Handlers))
      return interaction.reply({
        content: "You cannot use these buttons.",
        ephemeral: true,
      });

    const Embed = new MessageEmbed().setColor("BLUE");

    DB.findOne({ ChannelID: channel.id }, async (err, docs) => {
      if (err) throw err;
      if (!docs)
        return interaction.reply({
          content:
            "No data was found related to this ticket, please delete manual.",
          ephemeral: true,
        });
      switch (customId) {
        case "lock":
          if (docs.Locked == true)
            return interaction.reply({
              content: "The ticket is already locked",
              ephemeral: true,
            });
          await DB.updateOne({ ChannelID: channel.id }, { Locked: true });
          Embed.setDescription("🔒 | This ticket is now locked for reviewing.");

          docs.MembersID.forEach((m) => {
            channel.permissionOverwrites.edit(m, {
              SEND_MESSAGES: false,
            });
          });

          interaction.reply({ embeds: [Embed] });
          break;
        case "unlock":
          if (docs.Locked == false)
            return interaction.reply({
              content: "The ticket is already unlocked",
              ephemeral: true,
            });
          await DB.updateOne({ ChannelID: channel.id }, { Locked: false });
          Embed.setDescription("🔓 | This ticket is now unlocked.");

          docs.MembersID.forEach((m) => {
            channel.permissionOverwrites.edit(m, {
              SEND_MESSAGES: true,
            });
          });

          interaction.reply({ embeds: [Embed] });
          break;
        case "close":
          if (docs.Closed == true)
            return interaction.reply({
              content:
                "Ticket is already closed, please wait for it to get deleted",
              ephemeral: true,
            });
          const attachment = await createTranscript(channel, {
            limit: -1,
            returnBuffer: false,
            fileName: `${docs.Type} - ${docs.TicketID}.html`,
          });
          await DB.updateOne({ ChannelID: channel.id }, { Closed: true });

          const Message = await guild.channels.cache
            .get(TicketSetup.Transcripts)
            .send({
              embeds: [
                Embed.setTitle(
                  `Transcript Type: ${docs.Type}\nID: ${docs.TicketID}`
                ),
              ],
              files: [attachment],
            });

          interaction.reply({
            embeds: [
              Embed.setDescription(
                `The transcript is now saved [TRANSCRIPT](${Message.url})`
              ),
            ],
          });

          setTimeout(() => {
            channel.delete();
          }, 10 * 1000);
          break;
        case "claim":
          if (docs.Claimed == true)
            return interaction.reply({
              content: `This ticket has already been claimed by <@${docs.ClaimedBy}>`,
              ephemeral: true,
            });

          await DB.updateOne(
            { ChannelID: channel.id },
            { Claimed: true, ClaimedBy: member.id }
          );

          Embed.setDescription(`🛄 | This ticket is now claimed by ${member}`);
          interaction.reply({ embeds: [Embed] });

          break;
      }
    });
  },
};
