import { AmethystCommand, log4js, preconditions } from 'amethystjs';
import { coins } from '../utils/query';
import { account } from 'coins-manager';
import { EmbedBuilder, GuildMember } from 'discord.js';
import { baseLeaderboard, cancel } from '../utils/contents';
import { content } from '../utils/toolbox';
import { Paginator } from 'dsc-pagination';

export default new AmethystCommand({
    name: 'classement',
    description: 'Affiche le classement des points du serveur',
    preconditions: [preconditions.GuildOnly]
}).setChatInputRun(async ({ interaction }) => {
    const leaderboard = coins.getLeaderboard(null);
    if (leaderboard.length === 0)
        return interaction.reply(`:x: | Personne n'est classé dans le serveur`).catch(log4js.trace);

    const map = (embed: EmbedBuilder, index: number, item: account<'global'>) => {
        embed.setDescription(
            `${embed.data.description}\n${index + 1}. <@${item.user_id}> : **${item.coins.toLocaleString()} points**`
        );
        return embed;
    };
    if (leaderboard.length < 10) {
        const embed = baseLeaderboard(interaction.member as GuildMember);
        leaderboard.forEach((item, index) => {
            map(embed, index, item);
        });

        interaction.reply(content('ctx', embed)).catch(log4js.trace);
    } else {
        const embeds = [baseLeaderboard(interaction.member as GuildMember)];

        leaderboard.forEach((item, index) => {
            if (index % 10 === 0 && index > 0) embeds.push(baseLeaderboard(interaction.member as GuildMember));

            map(embeds[embeds.length - 1], index, item);
        });

        new Paginator({
            embeds,
            displayPages: 'footer',
            interaction,
            interactionNotAllowedContent: content(
                'ctx',
                { ephemeral: true },
                ":x: | Vous n'êtes pas autorisé à interagir avec ce message"
            ),
            invalidPageContent: (max) => ({
                content: `:x: | Veuillez choisir un nombre entre **1** et **${max.toLocaleString()}**`,
                ephemeral: true
            }),
            modal: {
                title: 'Page',
                fieldName: 'Numéro de page'
            },
            numeriseLocale: 'fr',
            cancelContent: content('ctx', cancel()),
            user: interaction.user
        });
    }
});
