import { AmethystCommand, log4js, preconditions, waitForInteraction, waitForMessage } from 'amethystjs';
import staff from '../preconditions/staff';
import { button, content, pingRole, row, yesNoRow } from '../utils/toolbox';
import {
    adminShopMapper,
    baseShopAdminList,
    baseShopUser,
    cancel,
    cancelButton,
    classic,
    emptyShop,
    interactionNotAllowed,
    invalidNumber,
    noRole,
    notEnoughPoints,
    shopMapper,
    unkonwnItem
} from '../utils/contents';
import { itemType } from '../typings/database';
import {
    ApplicationCommandOptionType,
    ComponentType,
    EmbedBuilder,
    GuildMember,
    Message,
    StringSelectMenuBuilder,
    TextChannel
} from 'discord.js';
import { coins, inventories, roles, shop } from '../utils/query';
import { Paginator } from 'dsc-pagination';

export default new AmethystCommand({
    name: 'magasin',
    aliases: ['shop'],
    description: 'Affiche le magasin',
    preconditions: [staff, preconditions.GuildOnly],
    options: [
        {
            name: 'acheter',
            description: 'Achète un article du magasin',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'article',
                    description: 'Article à acheter',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    autocomplete: true
                }
            ]
        },
        {
            name: 'afficher',
            description: 'Affiche le magasin',
            type: ApplicationCommandOptionType.Subcommand
        }
    ]
})
    .setMessageRun(async ({ message, options }) => {
        const subcommand = options.first?.toLowerCase();

        if (['ajouter', 'add', 'a', 'aj'].includes(subcommand)) {
            const item: { name: string; type: itemType; price: number; quantity: number; roleId: string | null } = {
                name: message.author.username,
                type: 'text',
                price: 500,
                quantity: 10,
                roleId: null
            };
            const embed = () => {
                return classic(message.author)
                    .setTitle('Article')
                    .setDescription(`Configurez l'article ici`)
                    .setColor(message.guild.members.me.displayHexColor ?? 'Orange')
                    .setFields(
                        {
                            name: 'Nom',
                            value: item.name,
                            inline: true
                        },
                        {
                            name: 'Prix',
                            value: `${item.price.toLocaleString()} points`,
                            inline: true
                        },
                        {
                            name: 'Quantité',
                            value: item.quantity === 0 ? 'Infinie' : item.quantity.toLocaleString(),
                            inline: true
                        },
                        {
                            name: '\u200b',
                            value: '\u200b',
                            inline: false
                        },
                        {
                            name: 'Type',
                            value: item.type === 'role' ? 'Rôle' : 'Texte',
                            inline: true
                        },
                        {
                            name: 'Rôle',
                            value: item.roleId === null ? `Pas de rôle` : pingRole(item.roleId),
                            inline: true
                        }
                    );
            };
            const components = (fullDisabled = false) => {
                return [
                    row(
                        button({ label: 'Nom', style: 'Primary', id: 'name', disabled: fullDisabled }),
                        button({ label: 'Type', style: 'Secondary', id: 'type', disabled: fullDisabled }),
                        button({ label: 'Prix', style: 'Secondary', id: 'price', disabled: fullDisabled }),
                        button({ label: 'Quantité', style: 'Secondary', id: 'quantity', disabled: fullDisabled }),
                        button({
                            label: 'Rôle',
                            style: 'Secondary',
                            id: 'role',
                            disabled: item.type !== 'role' || fullDisabled
                        })
                    ),
                    row(
                        button({
                            label: 'Valider',
                            style: 'Success',
                            id: 'validate',
                            disabled: (item.type === 'role' && item.roleId === null) || fullDisabled
                        }),
                        button({ label: 'Annuler', style: 'Danger', id: 'cancel', disabled: fullDisabled })
                    )
                ];
            };
            const msg = (await message
                .reply(content('msg', embed(), ...components()))
                .catch(log4js.trace)) as Message<true>;
            if (!msg) return log4js.trace('Message not sent to add item');

            const collector = msg.createMessageComponentCollector({
                time: 300000
            });
            collector.on('collect', async (ctx) => {
                if (ctx.user.id !== message.author.id) {
                    ctx.reply(interactionNotAllowed(ctx.user).ctx).catch(log4js.trace);
                    return;
                }
                if (ctx.customId === 'cancel') {
                    msg.edit({
                        embeds: [cancel()],
                        components: []
                    }).catch(log4js.trace);
                    return;
                }
                if (ctx.customId === 'validate') {
                    collector.stop('validate');
                    return;
                }
                if (ctx.customId === 'name') {
                    msg.edit(content('edit', ...components(true))).catch(log4js.trace);
                    const prompt = (await ctx
                        .reply({
                            content: `Quel est le nom de l'article ? Répondez dans le chat\nRépondez par \`cancel\` pour annuler`,
                            fetchReply: true
                        })
                        .catch(log4js.trace)) as Message<true>;
                    if (!prompt) {
                        msg.edit(content('edit', ...components(false))).catch(log4js.trace);
                        ctx.deferUpdate().catch(log4js.trace);
                        return;
                    }
                    const resp = await waitForMessage({
                        channel: message.channel as TextChannel,
                        user: message.author,
                        time: 30000
                    }).catch(() => {});
                    prompt.delete().catch(() => {});
                    if (resp) resp.delete().catch(() => {});

                    if (!resp || resp.content?.toLowerCase() === 'cancel') {
                        msg.edit(content('edit', ...components(false))).catch(log4js.trace);
                        return;
                    }

                    item.name = resp.content;
                    msg.edit(content('edit', ...components(false), embed())).catch(log4js.trace);
                }
                if (ctx.customId === 'type') {
                    msg.edit(content('edit', ...components(true))).catch(log4js.trace);
                    const prompt = (await ctx
                        .reply({
                            content: `De quel type l'article doit-il être ?`,
                            fetchReply: true,
                            components: [
                                row(
                                    button({ label: 'Rôle', id: 'role', style: 'Primary' }),
                                    button({ label: 'Texte', id: 'text', style: 'Secondary' }),
                                    cancelButton()
                                )
                            ]
                        })
                        .catch(log4js.trace)) as Message<true>;
                    if (!prompt) {
                        msg.edit(content('edit', ...components(false))).catch(log4js.trace);
                        ctx.deferUpdate().catch(log4js.trace);
                        return;
                    }

                    const rep = await waitForInteraction({
                        componentType: ComponentType.Button,
                        message: prompt,
                        user: ctx.user,
                        replies: { everyone: interactionNotAllowed(message.author).ctx }
                    }).catch(() => {});
                    prompt.delete().catch(() => {});
                    if (!rep || rep.customId === 'cancel') {
                        msg.edit(content('edit', ...components(false))).catch(log4js.trace);
                        return;
                    }

                    item.type = rep.customId === 'role' ? 'role' : 'text';
                    msg.edit(content('edit', ...components(false), embed())).catch(log4js.trace);
                }
                if (['quantity', 'price'].includes(ctx.customId)) {
                    msg.edit(content('edit', ...components(true))).catch(log4js.trace);
                    const prompt = (await ctx
                        .reply({
                            content: `Quel est ${
                                ctx.customId === 'quantity' ? 'la quantité' : 'le prix'
                            } de l'article ? Répondez dans le chat${
                                ctx.customId === 'quantity'
                                    ? `\nRépondez par \`infini\` pour donner une quantité infinie`
                                    : ''
                            }\nRépondez par \`cancel\` pour annuler`,
                            fetchReply: true
                        })
                        .catch(log4js.trace)) as Message<true>;
                    if (!prompt) {
                        msg.edit(content('edit', ...components(false))).catch(log4js.trace);
                        ctx.deferUpdate().catch(log4js.trace);
                        return;
                    }
                    const resp = await waitForMessage({
                        channel: message.channel as TextChannel,
                        user: message.author,
                        time: 30000
                    }).catch(() => {});

                    if (resp) resp.delete().catch(log4js.trace);
                    if (!resp || resp.content?.toLowerCase() === 'cancel') {
                        msg.edit(content('edit', ...components(false))).catch(log4js.trace);
                        if (resp) resp.delete().catch(() => {});
                        prompt.delete().catch(() => {});
                        return;
                    }
                    const price = parseInt(resp.content);
                    if (ctx.customId === 'quantity') {
                        if ((isNaN(price) || price < 1) && resp.content?.toLowerCase() !== 'infini') {
                            prompt
                                .edit({
                                    content: '',
                                    embeds: [invalidNumber(message.author)]
                                })
                                .catch(log4js.trace);
                            msg.edit(content('edit', ...components(false))).catch(log4js.trace);
                            setTimeout(() => {
                                prompt.delete().catch(() => {});
                            }, 5000);
                            return;
                        }
                    } else {
                        if (isNaN(price) || price < 1) {
                            prompt
                                .edit({
                                    content: '',
                                    embeds: [invalidNumber(message.author)]
                                })
                                .catch(log4js.trace);
                            msg.edit(content('edit', ...components(false))).catch(log4js.trace);
                            setTimeout(() => {
                                prompt.delete().catch(() => {});
                            }, 5000);
                            return;
                        }
                    }
                    prompt.delete().catch(() => {});

                    item[ctx.customId] = resp.content?.toLowerCase() === 'infini' ? 0 : price;
                    msg.edit(content('edit', ...components(false), embed())).catch(log4js.trace);
                }
                if (ctx.customId === 'role') {
                    msg.edit(content('edit', ...components(true))).catch(log4js.trace);
                    const prompt = (await ctx
                        .reply({
                            content: `Quel est le rôle que vous voulez donner ? Répondez par un nom, un identifiant ou une mention. Répondez par \`cancel\` pour annuler`,
                            fetchReply: true
                        })
                        .catch(log4js.trace)) as Message<true>;
                    if (!prompt) {
                        ctx.deferUpdate().catch(() => {});
                        msg.edit(content('edit', ...components(false))).catch(log4js.trace);
                        return;
                    }
                    const resp = await waitForMessage({
                        channel: message.channel as TextChannel,
                        user: message.author,
                        time: 30000
                    }).catch(() => {});
                    if (resp) resp.delete().catch(log4js.trace);
                    if (!resp || resp.content?.toLowerCase() === 'cancel') {
                        msg.edit(content('edit', ...components(false))).catch(log4js.trace);
                        prompt.delete().catch(() => {});
                        return;
                    }
                    await message.guild.roles.fetch().catch(log4js.trace);
                    let roles = (
                        [resp.mentions.roles.first()] || [message.guild.roles.cache.get(msg.content)] ||
                        message.guild.roles.cache
                            .filter(
                                (r) =>
                                    r.name.toLowerCase().includes(resp.content?.toLowerCase()) ||
                                    resp.content?.toLowerCase().includes(r.name.toLowerCase())
                            )
                            .toJSON()
                    ).filter((x) => ![undefined, null].includes(x));

                    if (roles.length === 0) {
                        prompt
                            .edit({
                                content: '',
                                embeds: [noRole(message.author)]
                            })
                            .catch(log4js.trace);
                        setTimeout(() => {
                            prompt.delete().catch(() => {});
                        }, 5000);
                        msg.edit(content('edit', ...components(false))).catch(log4js.trace);
                        return;
                    }
                    if (roles.length > 1) {
                        const selector = new StringSelectMenuBuilder()
                            .setMaxValues(1)
                            .setCustomId('role-select')
                            .setOptions(
                                roles.splice(0, 24).map((r) => ({
                                    label: r.name,
                                    value: r.id,
                                    description: `Rôle ${r.name}`,
                                    emoji: r.icon
                                }))
                            );
                        await prompt
                            .edit({
                                components: [row(selector)],
                                content: `Plusieurs rôles ont été trouvés, veuillez choisir le bon`
                            })
                            .catch(log4js.trace);
                        const roleSelect = await waitForInteraction({
                            componentType: ComponentType.StringSelect,
                            message: prompt,
                            user: message.author,
                            replies: {
                                everyone: interactionNotAllowed(message.author).ctx
                            },
                            time: 60000
                        }).catch(() => {});
                        if (!roleSelect) {
                            prompt.delete().catch(() => {});
                            msg.edit(content('edit', ...components(false))).catch(log4js.trace);
                            return;
                        }
                        roles = roles.filter((r) => r.id === roleSelect.id);
                    }
                    item.roleId = roles[0].id;
                    msg.edit(content('edit', ...components(false), embed())).catch(log4js.trace);
                    prompt.delete().catch(() => {});
                }
            });
            collector.on('end', (c, reason) => {
                if (reason === 'validate') {
                    shop.addItem(item);
                    msg.edit({
                        components: [],
                        embeds: [
                            classic(message.author)
                                .setTitle('Article ajouté')
                                .setDescription(`L'article **${item.name}** a été ajouté sur le marché`)
                                .setColor(message.guild.members.me.displayHexColor ?? 'Orange')
                        ]
                    }).catch(log4js.trace);
                }
            });
        }
        if (['retirer', 'supprimer', 'rm', 'r', 's'].includes(subcommand)) {
            if (shop.items.size === 0)
                return message.reply(content('msg', emptyShop(message.author))).catch(log4js.trace);
            const base = (i: number) => {
                return new StringSelectMenuBuilder().setMaxValues(1).setCustomId('deleteitems' + i);
            };

            const selectors = [];
            shop.items.forEach((item, i) => {
                if (i % 25 === 0) selectors.push(base(i));

                selectors[selectors.length - 1].addOptions({
                    label: item.name,
                    description: `${item.type} ${item.name} (${item.price.toLocaleString()} points)`,
                    value: item.id.toString()
                });
            });

            const prompt = (await message
                .reply(
                    content('msg', `Quel est l'item que vous souhaitez supprimer ?`, ...selectors.map((s) => row(s)))
                )
                .catch(log4js.trace)) as Message<true>;
            if (!prompt) return log4js.trace('Message not sent');

            const id = await waitForInteraction({
                componentType: ComponentType.StringSelect,
                user: message.author,
                replies: { everyone: interactionNotAllowed(message.author).ctx },
                message: prompt
            }).catch(() => {});
            if (!id)
                return prompt
                    .edit({
                        components: [],
                        embeds: [cancel()],
                        content: ''
                    })
                    .catch(log4js.trace);

            const rs = shop.removeItem(id.values[0]);
            if (rs === 'unknown')
                return prompt
                    .edit({
                        content: `Une erreur a eu lieu, l'article n'a pas pu être supprimé`,
                        components: []
                    })
                    .catch(log4js.trace);
            prompt
                .edit({
                    content: `L'article ${rs.name} a été supprimé`,
                    components: []
                })
                .catch(log4js.trace);
        }
        if (['liste', 'list', 'l', 'ls', 'view', 'voir'].includes(subcommand)) {
            if (shop.items.size === 0)
                return message.reply(content('msg', emptyShop(message.author))).catch(log4js.trace);

            if (shop.items.size <= 5) {
                const embed = baseShopAdminList(message.member, shop.items.size);
                shop.items.forEach((i) => {
                    adminShopMapper(embed, i);
                });

                message.reply(content('msg', embed)).catch(log4js.trace);
            } else {
                const embeds = [baseShopAdminList(message.member, shop.items.size)];

                shop.items.forEach((item, i) => {
                    if (i % 5 === 0 && i > 0) embeds.push(baseShopAdminList(message.member, shop.items.size));

                    adminShopMapper(embeds[embeds.length - 1], item);
                });
                if (embeds.length <= 10) {
                    message.reply(content('msg', ...embeds)).catch(log4js.trace);
                } else {
                    message.reply(content('msg', ':x: | La liste est trop grande pour pouvoir être affichée'));
                }
            }
        }
    })
    .setChatInputRun(async ({ interaction, options }) => {
        const subcommand = options.getSubcommand();

        if (subcommand === 'acheter') {
            const item = shop.getItem(options.getString('article'));
            if (!item)
                return interaction
                    .reply({
                        embeds: [unkonwnItem(interaction.user)],
                        ephemeral: true
                    })
                    .catch(log4js.trace);

            if (item.price > coins.getData({ user_id: interaction.user.id }).coins)
                return interaction.reply({ embeds: [notEnoughPoints(interaction.user)], ephemeral: true });
            const confirmation = (await interaction
                .reply({
                    content: `Êtes-vous sûr de vouloir acheter **${
                        item.name
                    }** pour **${item.price.toLocaleString()}** points ?`,
                    components: [yesNoRow()],
                    fetchReply: true
                })
                .catch(log4js.trace)) as Message<true>;
            if (!confirmation) return log4js.trace('Cannot get reply of interaction');

            const decision = await waitForInteraction({
                componentType: ComponentType.Button,
                message: confirmation,
                user: interaction.user,
                replies: { everyone: interactionNotAllowed(interaction.user).ctx }
            }).catch(() => {});
            if (!decision || decision.customId === 'no') {
                if (decision) decision.deferUpdate().catch(log4js.trace);
                return interaction
                    .editReply({
                        embeds: [cancel()],
                        content: '',
                        components: []
                    })
                    .catch(log4js.trace);
            }
            const rs = shop.buy(item.id);
            if (rs === 'not buyable')
                return interaction
                    .editReply({
                        content: `:x: | L'objet n'a pas pu être acheté car il ne reste plus d'exemplaires disponibles`,
                        components: []
                    })
                    .catch(log4js.trace);

            if (item.type === 'role') {
                const role = await interaction.guild.roles.fetch(item.role_id).catch(log4js.trace);
                if (!role) {
                    return interaction
                        .editReply({
                            content: `:x: | Le rôle n'a pas pu vous être ajouté car il n'a pas été trouvé`,
                            components: []
                        })
                        .catch(log4js.trace);
                }
                (interaction.member as GuildMember).roles.add(role).catch(log4js.trace);
            }
            roles.removePoints(interaction.user.id, item.price);
            inventories.pushItem(interaction.user.id, item);

            interaction
                .editReply({
                    content: `Vous avez acheté **${item.name}** pour ${item.price.toLocaleString()} points`,
                    components: []
                })
                .catch(log4js.trace);
        }
        if (subcommand === 'afficher') {
            const items = shop.items;
            if (items.size === 0)
                return interaction
                    .reply({
                        embeds: [emptyShop(interaction.user)],
                        ephemeral: true
                    })
                    .catch(log4js.trace);

            const buildEmbed = (embed: EmbedBuilder) => {
                const fields = embed.data.fields.map((x) => ({ ...x, inline: true }));
                const empty = {
                    name: '\u200b',
                    value: '\u200b',
                    inline: false
                };
                const mapped = [fields[0], fields[1], empty, fields[2], fields[3], empty, fields[4], fields[5]].filter(
                    (x) => x !== undefined
                );
                if (mapped[mapped.length - 1].name === '\u200b') mapped.pop();
                return embed.setFields(mapped);
            };
            if (items.size <= 5) {
                const embed = baseShopUser(interaction.member as GuildMember);
                shop.items.forEach((item) => {
                    shopMapper(embed, item);
                });

                buildEmbed(embed);
                interaction.reply(content('ctx', embed)).catch(log4js.trace);
            } else {
                const embeds = [baseShopUser(interaction.member as GuildMember)];
                shop.items.forEach((item, i) => {
                    if (i % 6 === 0 && i > 0) embeds.push(baseShopUser(interaction.member as GuildMember));

                    shopMapper(embeds[embeds.length - 1], item);
                });
                new Paginator({
                    user: interaction.user,
                    interaction,
                    embeds: embeds.map((e) => buildEmbed(e)),
                    cancelContent: content('ctx', { ephemeral: true }, cancel()),
                    invalidPageContent: (max) =>
                        content('ctx', { ephemeral: true }, `Veuillez choisir une page entre **1** et **${max}**`),
                    interactionNotAllowedContent: interactionNotAllowed(interaction.user).ctx,
                    modal: { title: 'Page', fieldName: 'numéro de page' },
                    displayPages: 'footer'
                });
            }
        }
    });
