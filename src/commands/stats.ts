import { AmethystCommand, log4js, preconditions } from 'amethystjs';
import { coins, voiceStats } from '../utils/query';
import { content } from '../utils/toolbox';
import { stats } from '../utils/contents';
import { GuildMember } from 'discord.js';

export default new AmethystCommand({
    name: 'statistiques',
    description: 'Affiche vos statistiques',
    preconditions: [preconditions.GuildOnly]
}).setChatInputRun(async ({ interaction }) => {
    const data = {
        voice: voiceStats.getUser(interaction.user.id),
        points: coins.getData({ user_id: interaction.user.id }).coins
    };

    interaction.reply(content('ctx', stats(interaction.member as GuildMember, data))).catch(log4js.trace);
});
