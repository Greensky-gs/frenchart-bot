import { AmethystEvent, commandDeniedCode, log4js } from "amethystjs";
import { content, formatTime } from "../utils/toolbox";

export default new AmethystEvent('commandDenied', (cmd, reason) => {
    if (cmd.isMessage) {
        if (reason.code === commandDeniedCode.GuildOnly) {
            cmd.message.reply(content('msg', `:x: | Cette commande n'est pas utilisable en messages privés`)).catch(log4js.trace)
        }
        if (reason.code === commandDeniedCode.UnderCooldown) {
            cmd.message.reply(content('msg', `:x: | Veuillez patienter ${Math.floor(reason.metadata.remainingCooldownTime / 1000) < 1 ? '1 seconde' : formatTime(Math.floor(reason.metadata.remainingCooldownTime / 1000))} avant de réutiliser cette commande`)).catch(log4js.trace)
        }
    } else {
        if (reason.code === commandDeniedCode.GuildOnly) {
            cmd.interaction.reply(content('ctx', `:x: | Cette commande n'est pas utilisable en messages privés`)).catch(log4js.trace)
        } 
        if (reason.code === commandDeniedCode.UnderCooldown) {
            cmd.interaction.reply(content('ctx', `:x: | Veuillez patienter ${Math.floor(reason.metadata.remainingCooldownTime / 1000) < 1 ? '1 seconde' : formatTime(Math.floor(reason.metadata.remainingCooldownTime / 1000))} avant de réutiliser cette commande`, { ephemeral: true })).catch(log4js.trace)
        }
    }
})