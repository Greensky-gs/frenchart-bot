import { AmethystEvent, commandDeniedCode } from "amethystjs";
import { content } from "../utils/toolbox";

export default new AmethystEvent('commandDenied', (cmd, reason) => {
    if (cmd.isMessage) {
        if (reason.code === commandDeniedCode.GuildOnly) {
            cmd.message.reply(content('msg', `:x: | Cette commande n'est pas utilisable en messages privés`))   
        }
    }
})