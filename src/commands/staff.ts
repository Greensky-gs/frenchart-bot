import { AmethystCommand, log4js } from 'amethystjs';
import owner from '../preconditions/owner';
import { content } from '../utils/toolbox';
import { alreadyStaff, noUserEmbed } from '../utils/contents';
import { staffs } from '../utils/query';

export default new AmethystCommand({
    name: 'staff',
    preconditions: [owner],
    description: 'Gère les staffs'
}).setMessageRun(({ message, options }) => {
    const subcommand = options.first?.toLowerCase();

    if (['ajouter', 'add', 'plus'].includes(subcommand)) {
        const user = message.mentions.users.first() || message.guild.members.cache.get(options.second)?.user;
        if (!user) return message.reply(content('msg', noUserEmbed(message.author))).catch(log4js.trace);

        if (staffs.isStaff(user.id))
            return message.reply(content('msg', alreadyStaff(message.author, user))).catch(log4js.trace);
    }
});
