import { AmethystEvent } from "amethystjs";
import msgs from "../maps/msgs";
import { coins } from "../utils/query";

export default new AmethystEvent('messageCreate', (message) => {
    if (!message.guild || message.author.bot) return;

    if (msgs.get(message.author.id) === 4) return;
    if (!msgs.has(message.author.id)) {
        msgs.set(message.author.id, 1);
        setTimeout(() => {
            msgs.delete(message.author.id)
        }, 60000);
    } else {
        msgs.set(message.author.id, msgs.get(message.author.id) + 1);
    }

    coins.addCoins({
        user_id: message.author.id,
        coins: 1
    });
})