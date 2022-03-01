// ADD THIS TO YOUR MAIN =>
client.voiceGenerator = new Collection();

// EVENT 
const { VoiceState } = require("discord.js");

module.exports = {
    name: "voiceStateUpdate",
    /**
     * @param {VoiceState} oldState 
     * @param {VoiceState} newState 
     */
    async execute(oldState, newState, client) {
        const { member, guild } = newState;
        const oldChannel = oldState.channel;
        const newChannel = newState.channel;
        const joinToCreate = "947477625360752680"

        if(oldChannel !== newChannel && newChannel && newChannel.id === joinToCreate) {
            const voiceChannel = await guild.channels.create(member.user.tag, {
                type: "GUILD_VOICE",
                parent: newChannel.parent,
                permissionOverwrites: [
                    {id: member.id, allow: ["CONNECT"]},
                    {id: guild.id, deny: ["CONNECT"]}
                ]
            });

            client.voiceGenerator.set(member.id, voiceChannel.id);
            await newChannel.permissionOverwrites.edit(member, {CONNECT: false});
            setTimeout(() => newChannel.permissionOverwrites.delete(member), 30 * 1000);

            return setTimeout(() => member.voice.setChannel(voiceChannel), 500);
        }

        const ownedChannel = client.voiceGenerator.get(member.id)

        if(ownedChannel && oldChannel.id == ownedChannel && (!newChannel || newChannel.id !== ownedChannel)) {
            client.voiceGenerator.set(member.id, null);
            oldChannel.delete().catch(() => {});
        }
    }
}

// COMMAND 
const { CommandInteraction, MessageEmbed } = require("discord.js");

module.exports = {
    name: "voice",
    description: "Control your own channel",
    options: [
        {
            name: "invite",
            type: "SUB_COMMAND",
            description: "Invite a friend to your channel.",
            options: [
                {
                    name: "member",
                    type: "USER",
                    required: true,
                    description: "Select the member."
                }
            ]
        },
        {
            name: "disallow",
            type: "SUB_COMMAND",
            description: "Remove someone's access to the channel.",
            options: [
                {
                    name: "member",
                    type: "USER",
                    required: true,
                    description: "Select the member."
                }
            ]
        },
        {
            name: "name",
            type: "SUB_COMMAND",
            description: "Change the name of your channel.",
            options: [
                {
                    name: "text",
                    type: "STRING",
                    required: true,
                    description: "Provide the name."
                }
            ]
        },
        {
            name: "public",
            type: "SUB_COMMAND",
            description: "Make your channel public to everyone.",
            options: [
                {
                    name: "turn",
                    type: "STRING",
                    required: true,
                    description: "Turn on or off.",
                    choices: [
                        { name: "On", value: "on" },
                        { name: "Off", value: "off"}
                    ]
                }
            ]
        },
    ],
    /**
     * 
     * @param {CommandInteraction} interaction 
     */
    async execute(interaction, client) {
        const { options, member, guild } = interaction;

        const subCommand = options.getSubcommand();
        const voiceChannel = member.voice.channel;
        const Embed = new MessageEmbed().setColor("GREEN");
        const ownedChannel = client.voiceGenerator.get(member.id);

        if(!voiceChannel)
        return interaction.reply({embeds: [Embed.setDescription("You're not in a voice channel.").setColor("RED")], ephemeral: true});

        if(!ownedChannel || voiceChannel.id !== ownedChannel) 
        return interaction.reply({embeds: [Embed.setDescription("You do not own this, or any channel.").setColor("RED")], ephemeral: true});

        switch(subCommand) {
            case "name" : {
                const newName = options.getString("text");
                if(newName.length > 22 || newName.length < 1) 
                return interaction.reply({embeds: [Embed.setDescription("Name cannot exceed the 22 character limit").setColor("RED")], ephemeral: true});

                voiceChannel.edit({ name: newName});
                interaction.reply({embeds: [Embed.setDescription(`Channel name has been set to ${newName}`)], ephemeral: true})
            }
            break;
            case "invite" : {
                const targetMember = options.getMember("member");
                voiceChannel.permissionOverwrites.edit(targetMember, {CONNECT: true});

                await targetMember.send({embeds: [Embed.setDescription(`${member} has invited you to <#${voiceChannel.id}>`)]});
                interaction.reply({embeds: [Embed.setDescription(`${targetMember} has been invited.`)], ephemeral: true});
            }
            break;
            case "disallow" : {
                const targetMember = options.getMember("member");
                voiceChannel.permissionOverwrites.edit(targetMember, {CONNECT: false});

                if(targetMember.voice.channel && targetMember.voice.channel.id == voiceChannel.id)  targetMember.voice.setChannel(null);
                interaction.reply({embeds: [Embed.setDescription(`${targetMember} has been removed from this channel.`)], ephemeral: true});
            }
            break;
            case "public" : {
                const turnChoice = options.getString("turn");
                switch(turnChoice) {
                    case "on" : {
                        voiceChannel.permissionOverwrites.edit(guild.id, {CONNECT: null});
                        interaction.reply({embeds: [Embed.setDescription("The channel is now public")], ephemeral: true})
                    }
                    break;
                    case "off" : {
                        voiceChannel.permissionOverwrites.edit(guild.id, {CONNECT: false});
                        interaction.reply({embeds: [Embed.setDescription("The channel is now closed")], ephemeral: true})
                    }
                    break;
                }
            }
            break;
        }
    }
}
