import { Precondition } from 'amethystjs';
import { staffs } from '../utils/query';

export default new Precondition('staff').setMessageRun(({ message }) => {
    if (!staffs.isStaff(message.author.id)) {
        return {
            ok: false,
            type: 'message',
            channelMessage: message,
            metadata: {
                silent: true
            }
        };
    }
    return {
        ok: true,
        isChatInput: false,
        isButton: false,
        channelMessage: message,
        type: 'message'
    };
});
