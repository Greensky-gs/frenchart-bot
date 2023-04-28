import { AmethystCommand, log4js, preconditions, waitForInteraction } from 'amethystjs';
import staff from '../preconditions/staff';
import { content, yesNoRow } from '../utils/toolbox';
import { cancel, classic, interactionNotAllowed, invalidNumber, invalidSubCommands, noUserEmbed } from '../utils/contents';
import { coins } from '../utils/query';
import { ComponentType, Message } from 'discord.js';

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
                `✅ | **${points.toLocaleString()}** point${points === 1 ? ' a' : 's ont'} été retiré${
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
    } else if (['reset', 'réinitialiser', 'rs'].includes(subcommand)) {
        const data = coins.getData({
            user_id: user.id
        });
        if (data.coins === 0) return message.reply(`:x: | **${user.username}** n'a aucun points à réinitialiser`).catch(log4js.trace);
        const msg = await message.reply(content('msg', `Êtes-vous sûr de retirer les **${data.coins.toLocaleString()}** point${data.coins === 1 ? '' : 's'} de ${user.username} ?`, yesNoRow())).catch(log4js.trace) as Message<true>;


        if (!msg) return log4js.trace({ msg: `Message not found in points reset command`, author: message.author.id });
        const rep = await waitForInteraction({
            componentType: ComponentType.Button,
            message: msg,
            replies: {
                everyone: interactionNotAllowed(message.author).ctx
            },
            user: message.author
        }).catch(log4js.trace);

        if (!rep || rep.customId === 'no') {
            return msg.edit({
                components: [],
                embeds:[ cancel() ],
                content: ''
            }).catch(log4js.trace);
        }
        coins.removeCoins({
            user_id: user.id,
            coins: coins.getData({ user_id: user.id }).coins
        });
        msg.edit({
            components: [],
            embeds: [],
            content: `✅ | Les points de **${user.username}** ont été réinitialisés`
        }).catch(log4js.trace);
    } else {
        message.reply(invalidSubCommands('ajouter', 'enlever', 'réinitialiser', 'voir')).catch(log4js.trace);
    }
});
