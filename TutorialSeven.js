const { CommandInteraction, MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const DB = require("../../Structures/Schemas/SuggestDB");

module.exports = {
    name: "suggest",
    description: "Make a suggestion for Lyxcode.",
    permission: "ADMINISTRATOR",
    options: [
        {
            name: "type",
            description: "Select the type of the suggestion",
            type: "STRING",
            required: true,
            choices: [
                {name: "Command", value: "Command"},
                {name: "Event Listener", value: "Event Listener"},
                {name: "System", value: "System"},
                {name: "Other", value: "Other"}
            ]
        },
        {
            name: "suggestion",
            description: "Describe the functionality of the suggestion.",
            type: "STRING",
            required: true
        },
    ],
    /**
     * @param {CommandInteraction} interaction 
     */
    async execute(interaction) {
        const { options, guildId, member, user } = interaction;

        const cType = options.getString("type");
        const cSuggestion = options.getString("suggestion");

        const Embed = new MessageEmbed()
        .setColor("NAVY")
        .setAuthor(user.tag, user.displayAvatarURL({dynamic: true}))
        .addFields(
            {name: "Suggestion:", value: cSuggestion, inline: false},
            {name: "Type:", value: cType, inline: true},
            {name: "Status:", value: "Pending", inline: true},
        )

        const cButtons = new MessageActionRow();
        cButtons.addComponents(
            new MessageButton().setCustomId("suggest-accept").setLabel("✅ Accept").setStyle("PRIMARY"),
            new MessageButton().setCustomId("suggest-decline").setLabel("⛔ Decline").setStyle("SECONDARY"),
        );

        try {
            await interaction.reply({embeds: [Embed], components: [cButtons], fetchReply: true}).then(async (m) => {
                await DB.create({GuildID: guildId, MessageID: m.id, Details: [
                    {   
                        MemberID: member.id,
                        Type: cType,
                        Suggestion: cSuggestion
                    }
                ]}).catch((err) => console.log(err));

            })

        } catch(err) {
            console.log(err)
        }
    }
}

// SCHEMA ///
const { model, Schema } = require("mongoose");

module.exports = model("SuggestDB", new Schema({
    GuildID: String,
    MessageID: String,
    Details: Array
}))

