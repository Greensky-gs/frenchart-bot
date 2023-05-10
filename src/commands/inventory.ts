import { AmethystCommand, log4js, preconditions } from 'amethystjs';
import { inventories } from '../utils/query';
import { item } from '../typings/database';
import { baseInventory, cancel, classic, interactionNotAllowed } from '../utils/contents';
import { EmbedBuilder, GuildMember } from 'discord.js';
import { content, pingRole } from '../utils/toolbox';
import { Paginator } from 'dsc-pagination';

export default new AmethystCommand({
    name: 'inventaire',
    description: 'Affiche votre inventaire',
    preconditions: [preconditions.GuildOnly]
}).setChatInputRun(async ({ interaction, options }) => {
    const inventory = inventories.getInventory(interaction.user.id);
    if (!inventory || inventory.items.length === 0)
        return interaction.reply(`Vous n'avez rien dans votre inventaire`).catch(log4js.trace);

    const reduce = (array: item[]) => {
        const items: (item & { count: number })[] = [];
        const findItem = (template: item) => {
            return items.find(
                (x) =>
                    x.name === template.name &&
                    x.quantity === template.quantity &&
                    x.price === template.price &&
                    x.role_id === template.role_id &&
                    x.type === template.type
            );
        };
        array.forEach((i) => {
            if (!findItem(i)) {
                items.push({
                    ...i,
                    count: 1
                });
            } else {
                items[items.indexOf(findItem(i))].count++;
            }
        });

        return items;
    };
    const items = reduce(inventory.items);

    const addField = (embed: EmbedBuilder, item: item & { count: number }) => {
        embed.addFields({
            name: `${item.name} (x${item.count.toLocaleString()})`,
            value: `${item.name} acheté pour ${item.price.toLocaleString()} points${
                item.type === 'role' ? `\n> ${pingRole(item.role_id)}` : ''
            }`,
            inline: true
        });

        const pushEmpty = embed.data.fields.length % 3 === 0;
        if (pushEmpty) {
            embed.addFields({
                name: '\u200b',
                value: '\u200b',
                inline: false
            });
        }
    };
    if (items.length <= 6) {
        const embed = baseInventory(interaction.member as GuildMember);

        items.forEach((i) => addField(embed, i));
        interaction.reply(content('ctx', embed)).catch(log4js.trace);
    } else {
        const embeds = [baseInventory(interaction.member as GuildMember)];

        items.forEach((item, index) => {
            if (index % 6 === 0 && index > 0) embeds.push(baseInventory(interaction.member as GuildMember));

            addField(embeds[embeds.length - 1], item);
        });

        new Paginator({
            cancelContent: content('ctx', cancel()),
            embeds,
            user: interaction.user,
            invalidPageContent: (max) => ({
                content: `Veuillez choisir un numéro de page entre **1** et **${max.toLocaleString()}**`,
                ephemeral: true
            }),
            interaction,
            interactionNotAllowedContent: content('ctx', interactionNotAllowed(interaction.user).ctx),
            displayPages: 'footer',
            numeriseLocale: 'fr'
        });
    }
});
