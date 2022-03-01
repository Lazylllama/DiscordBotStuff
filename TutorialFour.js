add 
require("./Handlers/Commands")(client);
to index.js


File Name: ping.js
Code: 

const { CommandInteraction } = require("discord.js");

module.exports = {
  name: "ping",
  description: "Pong",
  permission: "ADMINISTRATOR",
  /**
   * 
   * @param {CommandInteraction} interaction 
   */
  execute(interaction) {
    interaction.reply({content: "POING"});
  }
}



ile Name: interactionCreate.js
Code: 

const { Client, CommandInteraction, MessageEmbed } = require("discord.js");

module.exports = {
  name: "interactionCreate",
  /**
   * @param {CommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    if (interaction.isCommand() || interaction.isContextMenu()) {
      const command = client.commands.get(interaction.commandName);
      if (!command)
        return (
          interaction.reply({
            embeds: [
              new MessageEmbed()
                .setColor("RED")
                .setDescription("An error occured while running this command"),
            ],
          }) && client.commands.delete(interaction.commandName)
        );

      command.execute(interaction, client);
    }
  },
};




File Name: Perms.js
Code: 

module.exports = {
    Perms: [
        "CREATE_INSTANT_INVITE",
        "KICK_MEMBERS", 
        "BAN_MEMBERS",
        "ADMINISTRATOR",
        "MANAGE_CHANNELS", 
        "MANAGE_GUILD", 
        "ADD_REACTIONS",
        "VIEW_AUDIT_LOG",
        "PRIORITY_SPEAKER",
        "STREAM",	
        "VIEW_CHANNEL",
        "SEND_MESSAGES",
        "SEND_TTS_MESSAGES",	
        "MANAGE_MESSAGES",
        "EMBED_LINKS",
        "ATTACH_FILES",
        "READ_MESSAGE_HISTORY",
        "MENTION_EVERYONE",
        "USE_EXTERNAL_EMOJIS",
        "VIEW_GUILD_INSIGHTS",	
        "CONNECT",
        "SPEAK",
        "MUTE_MEMBERS",
        "DEAFEN_MEMBERS",
        "MOVE_MEMBERS",
        "USE_VAD",
        "CHANGE_NICKNAME",
        "MANAGE_NICKNAMES",	
        "MANAGE_ROLES",
        "MANAGE_WEBHOOKS",
        "MANAGE_EMOJIS_AND_STICKERS",
        "USE_APPLICATION_COMMANDS",
        "REQUEST_TO_SPEAK",
        "MANAGE_THREADS",
        "USE_PUBLIC_THREADS",
        "USE_PRIVATE_THREADS",
        "USE_EXTERNAL_STICKERS"
    ]   
}


File Name: Commands.js
Code: 

const { promisify } = require("util");
const { glob } = require("glob");
const PG = promisify(glob);
const Ascii = require("ascii-table");
const { Perms } = require('../Validation/Permissions');
const { Client } = require("discord.js");

/**
 * @param {Client} client 
 */
module.exports = async (client) => {
    const Table = new Ascii("Commands Loaded");

    CommandsArray = [];

    (await PG(`${process.cwd()}/Commands/*/*.js`)).map(async (file) => {
        const command = require(file);

        if (!command.name) 
        return Table.addRow(`${file.split("/")[7]}`, "🔸 FAILED" ,`missing a name.`);

        if (!command.description) 
        return Table.addRow(command.name, "🔸 FAILED", "missing a description.");

        if (command.permission) {
            if(Perms.includes(command.permission))
            command.defaultPermission = false;
            else 
            return Table.addRow(command.name, "🔸 FAILED", `permission is invalid.`);
        }

        client.commands.set(command.name, command);
        CommandsArray.push(command);

        await Table.addRow(command.name, "🔹 SUCCESSFUL") ;
    });

    console.log(Table.toString());
    
    /// /// /// /// /// PERMISSIONS HANDLER /// /// /// /// /// 

    client.on("ready", async () => {
        const MainGuild = await client.guilds.cache.get("YOUR_GUILD_ID");

        MainGuild.commands.set(CommandsArray).then(async (command) => {
            const Roles = (commandName) => {
                const cmdPerms = CommandsArray.find((c) => c.name === commandName).permission;
                if(!cmdPerms) return null
    
                return MainGuild.roles.cache.filter((r) => r.permissions.has(cmdPerms));
            }

            const fullPermissions = command.reduce((accumulator, r) => {
                const roles = Roles(r.name);
                
                if (!roles) return accumulator;

                const permissions = roles.reduce((a, r) => {
                    return [...a, {id: r.id, type: "ROLE", permission: true}]
                }, []);

                return [...accumulator, {id: r.id, permissions}];
            }, []);

            await MainGuild.commands.permissions.set({ fullPermissions });
        });
    });
};
