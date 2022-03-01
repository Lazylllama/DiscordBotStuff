// COMMAND

const { CommandInteraction, MessageEmbed } = require("discord.js");
const DB = require("../../Structures/Schemas/AFKSystem");

module.exports = {
    name: "afk",
    description: "A multi-guild AFK system.",
    options: [
        {
            name: "set",
            type: "SUB_COMMAND",
            description: "Set your AFK status",
            options: [
                {
                    name: "status",
                    description: "Set your status",
                    type: "STRING",
                    required: true
                }
            ]
        },
        {
            name: "return",
            type: "SUB_COMMAND",
            description: "Return from being AFK.",
        }
    ],
    /**
     * 
     * @param {CommandInteraction} interaction 
     */
    async execute(interaction) {
        const { guild, options, user, createdTimestamp } = interaction;

        const Embed = new MessageEmbed()
        .setAuthor(user.tag, user.displayAvatarURL({dynamic: true}));

        const afkStatus = options.getString("status");

        try {

            switch(options.getSubcommand()) {
                case "set" : {
                    await DB.findOneAndUpdate(
                        {GuildID: guild.id, UserID: user.id},
                        {Status: afkStatus, Time: parseInt(createdTimestamp / 1000)},
                        {new: true, upsert: true}
                    )
                    
                    Embed.setColor("GREEN").setDescription(`Your AFK status has been updated to: ${afkStatus}`);
                    return interaction.reply({embeds: [Embed], ephemeral: true})
                }
                case "return" : {
                    await DB.deleteOne({GuildID: guild.id, UserID: user.id});

                    Embed.setColor("RED").setDescription(`Your AFK status has been removed.`);
                    return interaction.reply({embeds: [Embed], ephemeral: true})
                }
            }
        } catch (err) {
            console.log(err)
        }
    }
}

// SCHEMA 

const { model, Schema } = require("mongoose");

module.exports = model("AFK", new Schema({
    GuildID: String,
    UserID: String,
    Status: String,
    Time: String
}))

// EVENT

const { Message, MessageEmbed } = require("discord.js");
const DB = require("../../Structures/Schemas/AFKSystem");

module.exports = {
    name: "messageCreate",
    /**
     * 
     * @param {Message} message 
     */
    async execute(message) {
        if(message.author.bot) return;

        // await DB.deleteOne({GuildID: message.guild.id, UserID: message.author.id});

        if(message.mentions.members.size) {
            const Embed = new MessageEmbed()
            .setColor("RED");
            message.mentions.members.forEach((m) => {
                DB.findOne({GuildID: message.guild.id, UserID: m.id}, async (err, data) => {
                    if(err) throw err;
                    if(data) 
                    return message.reply({embeds: [Embed.setDescription(`${m} went AFK <t:${data.Time}:R>\n **Status**: ${data.Status}`)]});
                } )
            })
        }
    }
}
