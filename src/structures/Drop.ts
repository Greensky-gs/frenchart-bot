import { ComponentType, Message, TextChannel, User } from "discord.js";
import { classic } from "../utils/contents";
import { button, content, pingChannel, pingUser, row } from "../utils/toolbox";
import { log4js, waitForInteraction } from "amethystjs";
import { roles } from "../utils/query";

export class Drop {
    private _channel: TextChannel;
    private _time: number;
    private _points: number;
    private _hoster: User;
    private endsAt: number;
    private message: Message<true>
    private timeout: NodeJS.Timeout;
    private interval: NodeJS.Timer
    private _winner: User;
    private _ended = false;

    public get ended() {
        return this._ended
    }
    public get winner() {
        return this._winner
    }
    public get hoster() {
        return this._hoster
    }
    public get points() {
        return this._points
    }
    public get time() {
        return this._time
    }
    public get channel() {
        return this._channel
    }

    constructor({ channel, time, hoster, points }: { channel: TextChannel; time: number; points: number; hoster: User; }) {
        this._channel = channel;
        this._time = time;
        this._hoster = hoster;
        this._points = points;
        this.endsAt = Date.now() + time;
    
        this.start();
    }
    public end() {
        if (this._ended) return;
        this._ended = true;

        clearInterval(this.interval)
        clearTimeout(this.timeout)

        if (!this._winner) {
            this.message.edit({
                components: [],
                embeds: [ classic(this._hoster).setTitle("Pas de gagnant").setDescription(`Personne n'a appuyé sur le bouton`).setColor(this._channel.guild.members.me.displayHexColor ?? 'Orange') ]
            })    .catch(log4js.trace)
            return
        } else {
            this.message.edit({
                components: [row(button({
                    emoji: '🎉',
                    id: 'claim',
                    style: 'Primary',
                    disabled: true
                }))],
                embeds:[ classic(this._hoster).setTitle("Drop").setDescription(`${pingUser(this._winner)} a gagné **${this._points.toLocaleString()}** points !`).setColor('#00ff00') ]
            }).catch(log4js.trace);

            this._channel.send({
                reply: {
                    messageReference: this.message
                },
                content: `${pingUser(this._winner)} vient de remporter le drop`
            }).catch(log4js.trace);
            roles.addPoints(this._winner.id, this._points);
        }
    }

    private edit() {
        console.log(this.message)
        this.message.edit({
            embeds: [
                this.embed
            ]
        }).catch(log4js.trace);
    }
    private get embed() {
        const embed = classic(this._hoster)
            .setTitle("DROP")
            .setDescription(`${pingUser(this._hoster)} offre **${this._points.toLocaleString()}** points ! Appuyez sur le bouton pour les obtenir !\nFin <t:${Math.floor(this.endsAt / 1000)}:R>`)
            .setColor(this.endsAt - Date.now() >= 10000 ? '#ff0000' : this._channel.guild.members.me.displayHexColor ?? 'Orange')
        return embed;
    }
    private async start() {
        const msg = await this._channel.send({
            embeds: [ this.embed ],
            components: [ row(button({
                emoji: '🎉',
                id: 'claim',
                style: 'Primary'
            })) ]
        }).catch(log4js.trace);
        if (!msg) return this._channel.send(content('msg', `Le drop n'a pas pu être lancé dans ${pingChannel(this._channel)}`)).catch(log4js.trace);
        
        this.message = msg;
        const timeout = setTimeout(() => {
            this.end()
        }, this._time);
        const interval = setInterval(() => {
            this.edit()
        }, 5000);
        
        this.timeout = timeout;
        this.interval = interval;

        const resp = await waitForInteraction({
            componentType: ComponentType.Button,
            whoCanReact: 'everyone',
            user: this._hoster,
            message: msg,
            time: this._time
        }).catch(log4js.trace)
        if (resp) {
            resp.deferUpdate().catch(log4js.trace);
            this._winner = resp.user;
        }
        this.end();
    }
}