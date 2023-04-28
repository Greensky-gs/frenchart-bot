import { AmethystEvent, log4js } from 'amethystjs';
import voice from '../maps/voice';
import { coins, roles, voiceStats } from '../utils/query';

export default new AmethystEvent('voiceStateUpdate', (o, n) => {
    if (o.member.user.bot) return;

    if (!o.channel && n.channel) {
        voice.set(o.member.id, Date.now());
    }
    if (o.channel && !n.channel) {
        const data = voice.get(o.member.id);
        if (!data) return log4js.trace(`No voice data found for user ${o.member.user.tag} ${o.member.id}`);

        const time = Date.now() - data;
        voice.delete(o.member.id);

        const minutes = Math.floor(time / 1000);
        roles.addPoints(o.member.id, minutes * 1);
        voiceStats.addTime(o.member.id, time);
    }
});
