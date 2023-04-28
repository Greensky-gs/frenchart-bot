import { EmbedBuilder, GuildMember, Role, User } from 'discord.js';
import { content, formatTime, pingChannel, pingRole } from './toolbox';

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
export const staffed = (user: User, staffed: User) =>
    basicEmbed(user)
        .setTitle('Staff ajouté')
        .setDescription(`<@${staffed.id}> a été ajouté en tant que staff`)
        .setColor('#00ff00');
export const notStaff = (user: User, staffed: User) =>
    basicEmbed(user).setTitle('Non-staff').setColor('#ff0000').setDescription(`<@${staffed.id}> n'est pas un staff`);
export const unstaffed = (user: User, staffed: User) =>
    basicEmbed(user)
        .setTitle('Staff retiré')
        .setDescription(`<@${staffed.id}> a été retiré des staff`)
        .setColor('#00ff00');
export const classic = basicEmbed;
export const invalidSubCommands = (...cmds: string[]) => {
    return `:x: | Merci d'utiliser une des sous-commandes valides : ${cmds.map((c) => `\`${c}\``).join(', ')}`;
};
export const invalidNumber = (user: User) =>
    basicEmbed(user).setTitle('Nombre invalide').setDescription(`Ce n'est pas un nombre valide`).setColor('#ff0000');
export const baseLeaderboard = (member: GuildMember) =>
    basicEmbed(member.user)
        .setTitle('Classement')
        .setDescription(`Voici le classement des points du serveur`)
        .setColor(member.guild.members.me.displayHexColor ?? 'Orange');
export const cancel = () => new EmbedBuilder().setTitle('💡 Annulé').setColor('Yellow');
export const stats = (user: GuildMember, data: { voice: number; points: number }) => {
    const embed = basicEmbed(user.user)
        .setTitle('Statistiques')
        .setDescription(`Voici vos statistiques sur le serveur **French Art**`)
        .setFields(
            {
                name: 'Temps en vocal',
                value: formatTime(Math.floor((data.voice ?? 0) / 1000)) ?? '0 secondes',
                inline: true
            },
            {
                name: 'Points',
                value: `**${data.points.toLocaleString()}** points`,
                inline: true
            }
        )
        .setColor(user.guild.members.me.displayHexColor ?? 'Orange');
    return embed;
};
export const interactionNotAllowed = (user: User) => {
    return {
        msg: content(
            'msg',
            basicEmbed(user)
                .setTitle('Interaction refusée')
                .setDescription(`Vous ne pouvez pas interagir avec ce message`)
                .setColor('#ff0000')
        ),
        ctx: content(
            'ctx',
            { ephemeral: true },
            basicEmbed(user)
                .setTitle('Interaction refusée')
                .setDescription(`Vous ne pouvez pas interagir avec ce message`)
                .setColor('#ff0000')
        )
    };
};
export const noRole = (user: User) =>
    basicEmbed(user)
        .setTitle('Pas de rôle')
        .setDescription(`Le rôle est introuvable.\nRéessayez avec une mention ou un identifiant`)
        .setColor('#ff0000');
export const roleList = ({ user, ...member }: GuildMember, roles: { role: Role; points: number }[]) => {
    const embed = basicEmbed(user)
        .setTitle('Rôles de points')
        .setDescription(
            `**${roles.length.toLocaleString()}** rôles sont des rôles de points :\n${roles.map(
                (r) => `${pingRole(r.role)} : ${r.points.toLocaleString()} points`
            )}`
        )
        .setColor(member.guild.members.me.displayHexColor ?? 'Orange');
    return embed;
};
export const noChannel = (user: User) =>
    basicEmbed(user)
        .setTitle('Pas de salon')
        .setDescription(`Aucun salon n'a été trouvé.\nRéessayez avec un nom, une mention ou un identifiant`)
        .setColor('#ff0000');
export const channelMustBeText = (user: User, channel: string) =>
    basicEmbed(user)
        .setTitle('Salon invalide')
        .setDescription(`Le salon ${pingChannel(channel)} n'est pas un salon textuel`)
        .setColor('#ff0000');
export const timeHelp = (user: User) =>
    basicEmbed(user)
        .setTitle('Temps invalide')
        .setDescription(
            `Ce n'est pas une durée valide.\nUtilisez \`s\` pour les secondes, \`m\` pour les minutes, \`h\` pour les heures, \`j\` pour les jours et \`sm\` pour les semaines`
        )
        .setColor('#ff0000');
