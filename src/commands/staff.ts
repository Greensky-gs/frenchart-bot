import { AmethystCommand, log4js, preconditions } from 'amethystjs';
import owner from '../preconditions/owner';
import { content, pingUser } from '../utils/toolbox';
import { alreadyStaff, classic, invalidSubCommands, noUserEmbed, notStaff, staffed, unstaffed } from '../utils/contents';
import { staffs } from '../utils/query';

export default new AmethystCommand({
    name: 'staff',
    preconditions: [owner, preconditions.GuildOnly],
    description: 'Gère les staffs'
}).setMessageRun(({ message, options }) => {
    const subcommand = options.first?.toLowerCase();

    if (['ajouter', 'add', 'plus'].includes(subcommand)) {
        const user = message.mentions.users.first() || message.guild.members.cache.get(options.second)?.user;
        if (!user) return message.reply(content('msg', noUserEmbed(message.author))).catch(log4js.trace);

        if (staffs.isStaff(user.id))
            return message.reply(content('msg', alreadyStaff(message.author, user))).catch(log4js.trace);
        
        staffs.addStaff(user.id);
        message.reply(content('msg', staffed(message.author, user))).catch(log4js.trace)
    } else if (['retirer', 'supprimer', 'remove', 'rm', 'sup'].includes(subcommand)) {
        const user = message.mentions.users.first() || message.guild.members.cache.get(options.second)?.user;
        if (!user) return message.reply(content('msg', noUserEmbed(message.author))).catch(log4js.trace);

        if (!staffs.isStaff(user.id))
            return message.reply(content('msg', notStaff(message.author, user))).catch(log4js.trace);
        
        staffs.addStaff(user.id);
        message.reply(content('msg', unstaffed(message.author, user))).catch(log4js.trace)
    } else if (['list', 'liste', 'view', 'show', 'all', 'afficher'].includes(subcommand)) {
        if (staffs.cache.length === 0) return message.reply(content('msg', `:x: | Il n'y a aucun staff dans la liste`)).catch(log4js.trace);
        message.reply(content('msg', classic(message.author).setTitle("Liste des staffs").setDescription(`Voici la liste des staffs ( ${staffs.cache.length} ) :\n${staffs.cache.map(pingUser).join('\n')}`).setColor('Orange'))).catch(log4js.trace);
    } else {
        message.reply(invalidSubCommands('ajouter', 'retirer', 'liste')).catch(log4js.trace);
    }
});
