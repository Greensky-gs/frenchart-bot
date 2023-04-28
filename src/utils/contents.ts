import { EmbedBuilder, GuildMember, User } from 'discord.js';

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
export const staffed = (user: User, staffed: User) => basicEmbed(user).setTitle("Staff ajouté").setDescription(`<@${staffed.id}> a été ajouté en tant que staff`).setColor('#00ff00')
export const notStaff = (user: User, staffed: User) => basicEmbed(user).setTitle('Non-staff').setColor('#ff0000').setDescription(`<@${staffed.id}> n'est pas un staff`);
export const unstaffed = (user: User, staffed: User) => basicEmbed(user).setTitle("Staff retiré").setDescription(`<@${staffed.id}> a été retiré des staff`).setColor('#00ff00')
export const classic = basicEmbed;
export const invalidSubCommands = (...cmds: string[]) => {
    return `:x: | Merci d'utiliser une des sous-commandes valides : ${cmds.map(c => `\`${c}\``).join(', ')}`
}
export const invalidNumber = (user: User) => basicEmbed(user).setTitle("Nombre invalide").setDescription(`Ce n'est pas un nombre valide`).setColor('#ff0000')
export const baseLeaderboard = (member: GuildMember) => basicEmbed(member.user).setTitle("Classement").setDescription(`Voici le classement des points du serveur`).setColor(member.guild.members.me.displayHexColor ?? 'Orange')
export const cancel = () => new EmbedBuilder().setTitle("💡 Annulé").setColor('Yellow')
