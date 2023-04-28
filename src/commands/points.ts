import { AmethystCommand, log4js, preconditions } from "amethystjs";
import staff from "../preconditions/staff";
import { content } from "../utils/toolbox";
import { invalidNumber, noUserEmbed } from "../utils/contents";
import { coins } from "../utils/query";

export default new AmethystCommand({
    name: 'points',
    description: "Gère les points",
    preconditions: [staff, preconditions.GuildOnly]
}).setMessageRun(async({ message, options }) => {
    const subcommand = options.first?.toLowerCase();
    const user = message.mentions.users.first() || message.guild.members.cache.get(options.second)?.user;
    
    if (!user) return message.reply(content('msg', noUserEmbed(message.author))).catch(log4js.trace);

    if (['ajouter', 'add', 'plus', '+', 'aj'].includes(subcommand)) {
        const points = parseInt(options.args[2]);
        if (isNaN(points) || points < 1) return message.reply(content('msg', invalidNumber(message.author))).catch(log4js.trace);

        coins
    }
})