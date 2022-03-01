const { MessageEmbed} = require("discord.js");
const { connection } = require("mongoose");
require("../../Events/Client/ready");

module.exports = {
    name: "status",
    description: "Displays the status of the client and database connection",
    permission: "ADMINISTRATOR",
    async execute(interaction, client) {

        await interaction.reply({
                embeds: [
                new MessageEmbed()
                .setColor("#2f3136")
                .setDescription(`**Client**: \`🟢 ONLINE\` - \`${client.ws.ping}ms\`\n - **Uptime**: <t:${parseInt(client.readyTimestamp / 1000)}:R>\n
                **Database**: \`${switchTo(connection.readyState)}\`\n - **Uptime**: <t:${parseInt(client.readyTimestamp / 1000)}:R> `)
            ]
        });
    }
};

function switchTo(val) {
    var status = " ";
    switch(val){
        case 0 : status = `🔴 DISCONNCTED`
        break;
        case 1 : status = `🟢 CONNECTED`
        break;
        case 2 : status = `🟢 CONNECTING`
        break;
        case 3 : status = `🟢 DISCONNECTING`
        break;
    }
    return status;
}
