import { Precondition } from "amethystjs";
import { staffs } from "../utils/query";

export default new Precondition('owner')
    .setMessageRun(({ message }) => {
        if (!staffs.isOwner(message.author.id)) return {
            ok: false,
            channelMessage: message,
            metadata: {
                silent: true
            },
            isChatInput: false,
            isButton: false
        }
        return {
            ok: true,
            channelMessage: message,
            metadata: {
                silent: true
            },
            isChatInput: false,
            isButton: false
        }
    })