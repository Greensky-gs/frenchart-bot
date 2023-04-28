import { AmethystCommand, log4js, preconditions, waitForInteraction } from 'amethystjs';
import staff from '../preconditions/staff';
import { content, yesNoRow } from '../utils/toolbox';
import { cancel, interactionNotAllowed, invalidNumber, invalidSubCommands, noRole, roleList } from '../utils/contents';
import { roles } from '../utils/query';
import { ComponentType, Message } from 'discord.js';

export default new AmethystCommand({
    name: 'roles',
    description: 'Gère les rôles attribués aux membres',
    preconditions: [staff, preconditions.GuildOnly]
}).setMessageRun(async ({ message, options }) => {
    const subcommand = options.first?.toLowerCase();

    if (['ajouter', 'add', 'a'].includes(subcommand)) {
        const role = message.mentions.roles.first() || (await message.guild.roles.fetch(options.second));
        if (!role) return message.reply(content('msg', noRole(message.author))).catch(log4js.trace);

        const points = parseInt(options.args[2]);
        if (isNaN(points) || points < 1)
            return message.reply(content('msg', invalidNumber(message.author))).catch(log4js.trace);

        if (roles.isRoleIncluded(role.id)) {
            const msg = (await message
                .reply(
                    content(
                        'msg',
                        `:x: | Le rôle **${role.name}** est déjà un rôle de points. Voulez-vous modifier sa valeur ?`,
                        yesNoRow()
                    )
                )
                .catch(log4js.trace)) as Message<true>;
            if (!msg) {
                msg.edit({
                    components: []
                }).catch(log4js.trace);
                log4js.trace('Message not found on roles add inputing');
                return;
            }

            const rep = await waitForInteraction({
                componentType: ComponentType.Button,
                user: message.author,
                replies: {
                    everyone: interactionNotAllowed(message.author).ctx
                },
                message: msg
            }).catch(log4js.trace);

            if (!rep || rep.customId === 'no') {
                return msg
                    .edit({
                        embeds: [cancel()],
                        content: '',
                        components: []
                    })
                    .catch(log4js.trace);
            }

            rep.deferUpdate().catch(log4js.trace);
        }
        const rs = roles.addRole(role.id, points);
        if (rs === 'unknown role')
            return message
                .reply({
                    embeds: [noRole(message.author)],
                    components: []
                })
                .catch(log4js.trace);
        message
            .reply({
                content: `✅ | Le rôle **${role.name}** est désormais attribué à **${points.toLocaleString()}**`,
                components: []
            })
            .catch(log4js.trace);
    } else if (['retirer', 'supprimer', 'supp', 'sup', 'rm', 'del', 'r'].includes(subcommand)) {
        const role = message.mentions.roles.first() || (await message.guild.roles.fetch(options.second));
        if (!role) return message.reply(content('msg', noRole(message.author))).catch(log4js.trace);

        if (!roles.isRoleIncluded(role.id))
            return message.reply(`:x: | Le rôle **${role.name}** n'est pas un rôle de points`).catch(log4js.trace);
        roles.removeRole(role.id);

        message.reply(content('msg', `✅ | Le rôle **${role.name}** n'est plus un rôle de points`)).catch(log4js.trace);
    } else if (['view', 'voir', 'liste', 'list', 'ls', 'vw', 'v'].includes(subcommand)) {
        if (roles.roles.length === 0)
            return message.reply(content('msg', `:x: | Aucun rôle n'est définit comme un rôle de points`));
        message.reply(content('msg', roleList(message.member, roles.roles))).catch(log4js.trace);
    } else {
        message.reply(content('msg', invalidSubCommands('ajouter', 'retirer', 'voir'))).catch(log4js.trace);
    }
});
