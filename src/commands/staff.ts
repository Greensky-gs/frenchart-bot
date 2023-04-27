import { AmethystCommand } from "amethystjs";
import owner from "../preconditions/owner";

export default new AmethystCommand({
    name: 'staff',
    preconditions: [owner],
    description: "Gère les staffs"
}).setMessageRun(({ message, options }) => {
    const subcommand = options.first?.toLowerCase();
    
    if (['ajouter', 'add', 'plus'].includes(subcommand)) {
        const user = message.mentions.users.first() || message.guild.members.cache.get(options.second) ||;
        if (!user) 
    }
})