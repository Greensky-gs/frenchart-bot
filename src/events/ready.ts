import { AmethystEvent } from "amethystjs";
import { ActivityType } from "discord.js";

export default new AmethystEvent('ready', async (client) => {
    client.user.setActivity({
        name: 'des artistes',
        type: ActivityType.Watching
    });
    
})