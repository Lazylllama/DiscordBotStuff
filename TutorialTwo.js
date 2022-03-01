File Name: index.js
Code : 

const { Client } = require("discord.js");
const client = new Client({ intents: 32767 });
const { Token } = require("./config.json");

client.log(Token);

File Name: EventNames.js
Code: 

module.exports = {
    Events: [
        "applicationCommandCreate",
        "applicationCommandDelete",
        "applicationCommandUpdate",
        "channelCreate",
        "channelDelete",
        "channelPinsUpdate",
        "channelUpdate",
        "debug",
        "emojiCreate",
        "emojiDelete",
        "emojiUpdate",
        "error",
        "guildBanAdd",
        "guildBanRemove",
        "guildCreate",
        "guildDelete",
        "guildIntegrationsUpdate",
        "guildMemberAdd",
        "guildMemberAvailable",
        'guildMemberRemove',
        'guildMembersChunk',
        'guildMemberUpdate',
        'guildUnavailable',
        'guildUpdate',
        'interaction',
        'interactionCreate',
        'invalidated',
        'invalidRequestWarning',
        'inviteCreate',
        'inviteDelete',
        "message",
        'messageCreate',
        'messageDelete',
        'messageDeleteBulk',
        'messageReactionAdd',
        'messageReactionRemove',
        'messageReactionRemoveAll',
        'messageReactionRemoveEmoji',
        'messageUpdate',
        'presenceUpdate',
        'rateLimit',
        'ready',
        'roleCreate',
        'roleDelete',
        'roleUpdate',
        'shardDisconnect',
        "shardError",
        'shardReady',
        "shardReconnecting",
        'shardResume',
        'stageInstanceCreate',
        'stageInstanceDelete',
        'stageInstanceUpdate',
        'stickerCreate',
        'stickerDelete',
        "stickerUpdate",
        "threadCreate",
        "threadDelete",
        "threadListSync",
        "threadMembersUpdate",
        "threadMemberUpdate",
        "threadUpdate",
        "typingStart",
        'userUpdate',
        "voiceStateUpdate",
        "warn",
        "webhookUpdate",
    ]
}

File Name: Events.js
Code: 

const { Events } = require("../Validation/Events");
const { promisify } = require("util");
const { glob } = require("glob");
const PG = promisify(glob);
const Ascii = require("ascii-table");

module.exports = async (client) => {
    const Table = new Ascii("Events Loaded");

    (await PG(`${process.cwd()}/Events/*/*.js`)).map(async (file) => {
        const event = require(file);

        if (event.name) {
            if(!Events.includes(event.name))
            const L = file.split("/");
            return Table.addRow(`${event.name || "MISSING"}`, `⛔ Event name is either invalid or missing ${L[6] + `/` + L[7]}`);
        }

        if(event.once)
        client.once(event.name, (...args) => event.execute(...args, client));
        else
        client.on(event.name, (...args) => event.execute(...args, client));
        
        await Table.addRow(event.name, "✔️ SUCCESSFUL")
    });
    
    console.log(Table.toString());
}

File Name: ready.js
Code: 

const { Client } = require("discord.js");

module.exports = {
    name: "ready",
    once: true,
    /**
     * @param {Client} client
     */
    execute(client) {
        console.log("The client is now ready!")
        client.user.setActivity("HELLO!", {type: "WATCHING"});
    }
}
