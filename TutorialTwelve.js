// COMMAND
const { CommandInteraction, MessageEmbed, Client } = require("discord.js");
const ms = require("ms");

module.exports = {
    name: "giveaway",
    description: "A complete giveaway system.",
    // permission: "ADMINISTRATOR",
    options: [
        {
            name: "start",
            description: "Start a giveaway.",
            type: "SUB_COMMAND",
            options: [
                {
                    name: "duration",
                    description: "Provide a duration for this giveaway (1m, 1h, 1d)",
                    type: "STRING",
                    required: true
                },
                {
                    name: "winners",
                    description: "Select the amount of winners for this giveaway.",
                    type: "INTEGER",
                    required: true
                },
                {
                    name: "prize",
                    description: "Provide the name of the prize",
                    type: "STRING",
                    required: true
                },
                {
                    name: "channel",
                    description: "Select a channel to send the giveaway to.",
                    type: "CHANNEL",
                    channelTypes: ["GUILD_TEXT"]
                }
            ]
        },
        {
            name: "actions",
            description: "Options for giveaways.",
            type: "SUB_COMMAND",
            options: [
                {
                    name: "options",
                    description: "Select an option.",
                    type: "STRING",
                    required: true,
                    choices: [
                        {
                            name: "end",
                            value: "end"
                        },
                        {
                            name: "pause",
                            value: "pause"
                        },
                        {
                            name: "unpause",
                            value: "unpause"
                        },
                        {
                            name: "reroll",
                            value: "reroll"
                        },
                        {
                            name: "delete",
                            value: "delete"
                        },
                    ]
                },
                {
                    name: "message-id",
                    description: "Provide the message id of the giveaway.",
                    type: "STRING",
                    required: true
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
        const { options } = interaction;

        const Sub = options.getSubcommand();

        const errorEmbed = new MessageEmbed()
        .setColor("RED");

        const successEmbed = new MessageEmbed()
        .setColor("GREEN");

        switch(Sub) {
            case "start" : {

                const gchannel = options.getChannel("channel") || interaction.channel;
                const duration = options.getString("duration");
                const winnerCount = options.getInteger("winners");
                const prize = options.getString("prize");

                client.giveawaysManager.start(gchannel, {
                    duration: ms(duration),
                    winnerCount,
                    prize,
                    messages : {
                        giveaway: "🎉 **GIVEAWAY STARTED** 🎉",
                        giveawayEnded: "🎊 **GIVEAWAY ENDED** 🎊",
                        winMessage: 'Congratulations, {winners}! You won **{this.prize}**!'
                    }
                }).then(async () => {
                    successEmbed.setDescription("Giveaway was successfully started.")
                    return interaction.reply({embeds: [successEmbed], ephemeral: true});
                }).catch((err) => {
                    errorEmbed.setDescription(`An error has occurred\n\`${err}\``)
                    return interaction.reply({embeds: [errorEmbed], ephemeral: true});
                })
            }
            break;

            case "actions" : {
                const choice = options.getString("options");
                const messageId = options.getString("message-id");

                const giveaway = client.giveawaysManager.giveaways.find((g) => g.guildId === interaction.guildId && g.messageId === messageId);
                
                if (!giveaway) {
                    errorEmbed.setDescription(`Unable to find the giveaway with the message id : ${messageId} in this guild.`);
                    return interaction.reply({embeds: [errorEmbed], ephemeral: true});
                }

                switch(choice) {
                    case "end" : {
                        client.giveawaysManager.end(messageId).then(() => {
                            successEmbed.setDescription("Giveaway has been ended.");
                            return interaction.reply({embeds: [successEmbed], ephemeral: true})
                        }).catch((err) => {
                            errorEmbed.setDescription(`An error has occurred\n\`${err}\``)
                            return interaction.reply({embeds: [errorEmbed], ephemeral: true});
                        });
                    }
                    break;

                    case "pause" : {
                        client.giveawaysManager.pause(messageId).then(() => {
                            successEmbed.setDescription("Giveaway has been paused.");
                            return interaction.reply({embeds: [successEmbed], ephemeral: true})
                        }).catch((err) => {
                            errorEmbed.setDescription(`An error has occurred\n\`${err}\``)
                            return interaction.reply({embeds: [errorEmbed], ephemeral: true});
                        });
                    }
                    break;

                    case "unpause" : {
                        client.giveawaysManager.unpause(messageId).then(() => {
                            successEmbed.setDescription("Giveaway has been unpaused.");
                            return interaction.reply({embeds: [successEmbed], ephemeral: true})
                        }).catch((err) => {
                            errorEmbed.setDescription(`An error has occurred\n\`${err}\``)
                            return interaction.reply({embeds: [errorEmbed], ephemeral: true});
                        });
                    }
                    break;

                    case "reroll" : {
                        client.giveawaysManager.reroll(messageId).then(() => {
                            successEmbed.setDescription("Giveaway has been rerolled.");
                            return interaction.reply({embeds: [successEmbed], ephemeral: true})
                        }).catch((err) => {
                            errorEmbed.setDescription(`An error has occurred\n\`${err}\``)
                            return interaction.reply({embeds: [errorEmbed], ephemeral: true});
                        });
                    }
                    break;

                    case "delete" : {
                        client.giveawaysManager.delete(messageId).then(() => {
                            successEmbed.setDescription("Giveaway has been deleted.");
                            return interaction.reply({embeds: [successEmbed], ephemeral: true})
                        }).catch((err) => {
                            errorEmbed.setDescription(`An error has occurred\n\`${err}\``)
                            return interaction.reply({embeds: [errorEmbed], ephemeral: true});
                        });
                    }
                    break;
                }
            }
            break;

            default : {
                console.log("Error in giveaway command.")
            }
        }

    }
}

// SYSTEM

const { GiveawaysManager } = require('discord-giveaways');
const giveawayModel = require("../Structures/Schemas/GiveawayDB");

module.exports = (client) => {
    const GiveawayManagerWithOwnDatabase = class extends GiveawaysManager {
        async getAllGiveaways() {
            return await giveawayModel.find().lean().exec();
        }
    
        async saveGiveaway(messageId, giveawayData) {
            await giveawayModel.create(giveawayData);
            return true;
        }
    
        async editGiveaway(messageId, giveawayData) {
            await giveawayModel.updateOne({ messageId }, giveawayData, { omitUndefined: true }).exec();
            return true;
        }
    
        async deleteGiveaway(messageId) {
            await giveawayModel.deleteOne({ messageId }).exec();
            return true;
        }
    };
    
    const manager = new GiveawayManagerWithOwnDatabase(client, {
        default: {
            botsCanWin: false,
            embedColor: '#FF0000',
            embedColorEnd: '#000000',
            reaction: '🎉'
        }
    });
    client.giveawaysManager = manager;
}

// SCHEMA

const mongoose = require("mongoose");

const giveawaySchema = new mongoose.Schema({
    messageId: String,
    channelId: String,
    guildId: String,
    startAt: Number,
    endAt: Number,
    ended: Boolean,
    winnerCount: Number,
    prize: String,
    messages: {
        giveaway: String,
        giveawayEnded: String,
        inviteToParticipate: String,
        drawing: String,
        dropMessage: String,
        winMessage: mongoose.Mixed,
        embedFooter: mongoose.Mixed,
        noWinner: String,
        winners: String,
        endedAt: String,
        hostedBy: String
    },
    thumbnail: String,
    hostedBy: String,
    winnerIds: { type: [String], default: undefined },
    reaction: mongoose.Mixed,
    botsCanWin: Boolean,
    embedColor: mongoose.Mixed,
    embedColorEnd: mongoose.Mixed,
    exemptPermissions: { type: [], default: undefined },
    exemptMembers: String,
    bonusEntries: String,
    extraData: mongoose.Mixed,
    lastChance: {
        enabled: Boolean,
        content: String,
        threshold: Number,
        embedColor: mongoose.Mixed
    },
    pauseOptions: {
        isPaused: Boolean,
        content: String,
        unPauseAfter: Number,
        embedColor: mongoose.Mixed,
        durationAfterPause: Number
    },
    isDrop: Boolean,
    allowedMentions: {
        parse: { type: [String], default: undefined },
        users: { type: [String], default: undefined },
        roles: { type: [String], default: undefined }
    }
}, { id: false });

const giveawayModel = mongoose.model('giveaways', giveawaySchema);

module.exports = giveawayModel;
