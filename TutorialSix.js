/// WELCOME EVENT ///
const { MessageEmbed, WebhookClient, GuildMember } = require("discord.js");

module.exports = {
    name: "guildMemberAdd",
    /**
     * 
     * @param {GuildMember} member 
     */
    execute(member) {
       
        const { user, guild } = member;

        member.roles.add("ROLEID");

        const Welcomer = new WebhookClient({
            id: "ID",
            token: "TOKEN"
        });

        const Welcome = new MessageEmbed()
        .setColor("AQUA")
        .setAuthor(user.tag, user.avatarURL({dynamic: true, size: 512}))
        .setThumbnail(user.avatarURL({dynamic: true, size: 512}))
        .setDescription(`
        Welcome ${member} to the **${guild.name}**!\n
        Account Created: <t:${parseInt(user.createdTimestamp / 1000)}:R>\nLatest Member Count: **${guild.memberCount}**`)
        .setFooter(`ID: ${user.id}`)

        Welcomer.send({embeds: [Welcome]})
    }
}

/// LEAVE LOGS ///

const { MessageEmbed, WebhookClient, GuildMember } = require("discord.js");

module.exports = {
    name: "guildMemberRemove",
    /**
     * 
     * @param {GuildMember} member 
     */
    execute(member) {
        const { user, guild } = member;

        const Loger = new WebhookClient({
            id: "ID",
            token: "TOKEN"
        });

        const Welcome = new MessageEmbed()
        .setColor("RED")
        .setAuthor(user.tag, user.avatarURL({dynamic: true, size: 512}))
        .setThumbnail(user.avatarURL({dynamic: true, size: 512}))
        .setDescription(`
        ${member} has left the community\n
        Joined: <t:${parseInt(member.joinedTimestamp / 1000)}:R>\nLatest Member Count: **${guild.memberCount}**`)
        .setFooter(`ID: ${user.id}`)

        Loger.send({embeds: [Welcome]})
    }
}

/// EMIT COMMAND ///

const { CommandInteraction, Client} = require('discord.js');

module.exports = {
    name: "emitt",
    description: "Event emitter",
    permission: "ADMINISTRATOR",
    options: [
        {
            name: "member",
            description: "Guild Member Events.",
            type: "STRING",
            required: true,
            choices: [
                {
                    name: "guildMemberAdd",
                    value: "guildMemberAdd"
                },
                {
                    name: "guildMemberRemove",
                    value: "guildMemberRemove"
                }
            ]
        }
    ],
    /**
     * 
     * @param {CommandInteraction} interaction 
     * @param {Client} client 
     */
    execute(interaction, client) {
        const choices = interaction.options.getString("member");

        switch(choices) {
            case "guildMemberAdd" : {
                client.emit("guildMemberAdd", interaction.member);
                interaction.reply({content: "Emitted the event.", ephemeral: true})
            }
            break;
            case "guildMemberRemove" : {
                client.emit("guildMemberRemove", interaction.member);
                interaction.reply({content: "Emitted the event.", ephemeral: true})
            }
            break;
        }
    }
}
