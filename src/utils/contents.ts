import { EmbedBuilder, User } from 'discord.js';

const basicEmbed = (user?: User) => {
    const embed = new EmbedBuilder().setTimestamp();
    if (user) embed.setFooter({ text: user.username, iconURL: user.displayAvatarURL({ forceStatic: false }) });

    return embed;
};

export const noUserEmbed = (user: User) =>
    basicEmbed(user)
        .setTitle("Pas d'utilisateur")
        .setColor('#ff0000')
        .setDescription(`Aucun utilisateur n'a été trouvé.\nUtilisez une mention ou un identifiant`);
export const alreadyStaff = (user: User, staffed: User) =>
    basicEmbed(user).setTitle('Déjà staff').setColor('#ff0000').setDescription(`<@${staffed.id}> est déjà staff`);
