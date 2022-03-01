const { MessageEmbed, Message, WebhookClient } = require("discord.js");

module.exports = {
    name: "messageDelete",
    /**
     * @param {Message} message 
     */
    execute(message) {
        if(message.author.bot) return;

        const Log = new MessageEmbed()
        .setColor("#36393f")
        .setDescription(`📕 A [message](${message.url}) by ${message.author.tag} was **deleted**.\n
        **Deleted Message:**\n ${message.content ? message.content : "None"}`.slice(0, 4096))
        
        if(message.attachments.size >= 1){
            Log.addField(`Attachments:`, `${message.attachments.map(a => a.url)}`, true)
        }
        
        new WebhookClient({url: "https://discord.com/api/webhooks/905845346020761650/6KlfV3sA1JrEpGN_KMVW5FR2tLDRi96tVcu_A5P1dyNX3fo9K7W_LYAMl5riVFgYZku1"}
        ).send({embeds: [Log]}).catch((err) => { console.log(err)});

    }
}

const { MessageEmbed, Message, WebhookClient } = require("discord.js");

module.exports = {
    name: "messageUpdate",
    /**
     * @param {Message} oldMessage 
     * @param {Message} newMessage 
     */
    execute(oldMessage, newMessage) {
        if(oldMessage.author.bot) return;

        if(oldMessage.content === newMessage.content) return;

        const Count = 1950;

        const Original = oldMessage.content.slice(0, Count) + (oldMessage.content.length > 1950 ? " ..." : "");
        const Edited = newMessage.content.slice(0, Count) + (newMessage.content.length > 1950 ? " ..." : "");

        const Log = new MessageEmbed()
        .setColor("#36393f")
        .setDescription(`📘 A [message](${newMessage.url}) by ${newMessage.author} was **edited** in ${newMessage.channel}.\n
        **Original**:\n ${Original} \n**Edited**:\n ${Edited}`.slice("0", "4096"))
        .setFooter(`Member: ${newMessage.author.tag} | ID: ${newMessage.author.id}`);

        new WebhookClient({url: "https://discord.com/api/webhooks/905845346020761650/6KlfV3sA1JrEpGN_KMVW5FR2tLDRi96tVcu_A5P1dyNX3fo9K7W_LYAMl5riVFgYZku1"}
        ).send({embeds: [Log]}).catch((err) => console.log(err));
    }
}
