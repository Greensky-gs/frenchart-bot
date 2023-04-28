import { AmethystCommand, log4js, preconditions } from 'amethystjs';
import staff from '../preconditions/staff';
import { content } from '../utils/toolbox';
import { classic, invalidNumber, invalidSubCommands, noUserEmbed } from '../utils/contents';
import { coins } from '../utils/query';

export default new AmethystCommand({
    name: 'points',
    description: 'Gère les points',
    preconditions: [staff, preconditions.GuildOnly]
}).setMessageRun(async ({ message, options }) => {
    const subcommand = options.first?.toLowerCase();
    const user = message.mentions.users.first() || message.guild.members.cache.get(options.second)?.user;

    if (!user) return message.reply(content('msg', noUserEmbed(message.author))).catch(log4js.trace);

    if (['ajouter', 'add', 'plus', '+', 'aj'].includes(subcommand)) {
        const points = parseInt(options.args[2]);
        if (isNaN(points) || points < 1)
            return message.reply(content('msg', invalidNumber(message.author))).catch(log4js.trace);

        coins.addCoins({
            user_id: user.id,
            coins: points
        });

        message
            .reply(
                content(
                    'msg',
                    `✅ | **${points.toLocaleString()}** point${points === 1 ? ' a' : 's ont'} été ajouté${
                        points === 1 ? '' : 's'
                    } à **${user.username}**`
                )
            )
            .catch(log4js.trace);
    } else if (['retirer', 'enlever', 'remove', 'rm', '-', 're'].includes(subcommand)) {
        const points = parseInt(options.args[2]);
        if (isNaN(points) || points < 1)
            return message.reply(content('msg', invalidNumber(message.author))).catch(log4js.trace);

        const rs = coins.removeCoins({
            user_id: user.id,
            coins: points
        });
        if (rs === 'not enough coins')
            return message
                .reply(
                    `:x: | **${user.username}** n'a pas assez de points pour en enlever \`${points.toLocaleString()}\``
                )
                .catch(log4js.trace);

        message
            .reply(
                `✅ | **${points.toLocaleString()}** point${points === 1 ? ' a' : 's ont'} été ajouté${
                    points === 1 ? '' : 's'
                } à **${user.username}**`
            )
            .catch(log4js.trace);
    } else if (['voir', 'stats', 'view', 'show', 'display', 'disp'].includes(subcommand)) {
        const stats = coins.getData({
            user_id: user.id
        });
        message
            .reply(
                content(
                    'msg',
                    classic(message.author)
                        .setTitle('Points')
                        .setDescription(
                            `<@${user.id}> a **${stats.coins.toLocaleString()}** point${stats.coins === 1 ? '' : 's'}`
                        )
                        .setColor(message.guild.members.me.displayHexColor ?? 'Orange')
                )
            )
            .catch(log4js.trace);
    } else {
        message.reply(invalidSubCommands('ajouter', 'enlever', 'voir')).catch(log4js.trace);
    }
});
