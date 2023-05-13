import { AmethystCommand, log4js, preconditions } from "amethystjs";
import { classic } from "../utils/contents";
import { content } from "../utils/toolbox";
import staff from "../preconditions/staff";

export default new AmethystCommand({
    name: 'aide',
    description: "Affiche la page d'aide",
    preconditions: [preconditions.GuildOnly, staff],
    aliases: ['help']
}).setChatInputRun(async({ interaction }) => {
    const commands = interaction.client.chatInputCommands;

    const help = classic(interaction.user)
        .setTitle("Page d'aide")
        .setDescription(`Voici la liste de mes commandes :\n${commands.map(cmd => `\`/${cmd.options.name}\` : ${cmd.options.description}`).join('\n')}`)
        .setColor(interaction.guild.members.me.displayHexColor ?? 'Orange')
    interaction.reply(content('ctx', help)).catch(log4js.trace);
}).setMessageRun(({ message }) => {
    const commands = message.client.messageCommands;

    const help = classic(message.author)
        .setTitle("Page d'aide")
        .setDescription(`Voici la liste de mes commandes :\n${commands.map(cmd => `\`${message.client.configs.prefix}${cmd.options.name}\` : ${cmd.options.description}`).join('\n')}`)
        .setColor(message.guild.members.me.displayHexColor ?? 'Orange')
    message.reply(content('msg', help)).catch(log4js.trace);
})