import { AmethystCommand, log4js, waitForMessage } from 'amethystjs';
import { content, formatMSTime, pingChannel } from '../utils/toolbox';
import { TextChannel } from 'discord.js';
import { cancel, channelMustBeText, invalidNumber, noChannel, timeHelp } from '../utils/contents';
import ms from 'ms';
import { Drop } from '../structures/Drop';

export default new AmethystCommand({
    name: 'drop',
    description: 'Drop des points'
}).setMessageRun(async ({ message }) => {
    const msg = await message
        .reply(
            content(
                'msg',
                `Dans quel salon voulez-vous lancer le drop ? Répondez par une mention, un nom ou un identifiant. Répondez par \`cancel\` pour annuler`
            )
        )
        .catch(log4js.trace);
    if (!msg) return log4js.trace('Message not found for drop');
    type stepType = 'channel' | 'time' | 'amount';
    let step: stepType = 'channel';

    const data = {
        channel: null,
        time: 120000,
        points: null
    };

    const collector = message.channel.createMessageCollector({
        time: 300000,
        filter: (x) => x.author.id === message.author.id
    });
    collector.on('collect', async (inp) => {
        inp.delete().catch(log4js.trace);
        if (inp.content.toLowerCase() === 'cancel') {
            collector.stop('cancel');
            return;
        }
        if (step === 'channel') {
            const channel =
                inp.mentions.channels.first() ||
                (await message.guild.channels.cache.get(inp.content)) ||
                message.guild.channels.cache.find((x) => x.name.toLowerCase().includes(inp.content));
            if (!channel) {
                msg.edit({
                    embeds: [noChannel(message.author)]
                }).catch(log4js.trace);
                return;
            }
            if (!channel.isTextBased()) {
                msg.edit({
                    embeds: [channelMustBeText(message.author, channel.id)]
                }).catch(log4js.trace);
                return;
            }

            data.channel = channel;
            step = 'time';
            msg.edit({
                content: `Combien de temps le drop doit-il durer ?\n`,
                embeds: []
            }).catch(log4js.trace);
            return;
        } else if (step === 'time') {
            const time = ms(formatMSTime(inp.content));
            if (!time) {
                msg.edit({
                    embeds: [timeHelp(message.author)]
                }).catch(log4js.trace);
                return;
            }

            data.time = time;
            msg.edit({
                content: `Combien de points doivent être donnés au gagnant ?`,
                embeds: []
            }).catch(log4js.trace);
            step = 'amount';
            return;
        } else if (step === 'amount') {
            const amount = parseInt(inp.content);
            if (!amount || isNaN(amount)) {
                msg.edit({
                    embeds: [invalidNumber(message.author)]
                }).catch(log4js.trace);
                return;
            }
            data.points = Math.abs(amount);
            collector.stop('end');
        }
    });
    collector.on('end', (c, reason) => {
        if (reason === 'end') {
            const drop = new Drop({
                channel: data.channel as TextChannel,
                time: data.time,
                hoster: message.author,
                points: data.points
            });
            msg.edit({
                content: `Drop lancé dans ${pingChannel(data.channel)}`,
                embeds: []
            }).catch(log4js.trace);
        } else {
            msg.edit({
                content: '',
                embeds: [cancel()]
            }).catch(log4js.trace);
        }
    });
});
