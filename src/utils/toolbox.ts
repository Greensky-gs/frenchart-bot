import { log4js } from 'amethystjs';
import {
    ActionRowBuilder, AnyComponentBuilder, ButtonBuilder,
    ButtonStyle,
    ChannelSelectMenuBuilder,
    EmbedBuilder,
    GuildMember,
    InteractionReplyOptions, MessageReplyOptions,
    RoleSelectMenuBuilder,
    StringSelectMenuBuilder,
    User,
    UserSelectMenuBuilder
} from 'discord.js';

type contentType =
    | string
    | ActionRowBuilder<
          | ButtonBuilder
          | StringSelectMenuBuilder
          | UserSelectMenuBuilder
          | RoleSelectMenuBuilder
          | ChannelSelectMenuBuilder
      >
    | EmbedBuilder
    | { fetchReply?: boolean; ephemeral?: boolean };

type returnName = 'msg' | 'ctx'
type returnType<Name extends returnName> = Name extends 'msg' ? MessageReplyOptions : InteractionReplyOptions;
export const content = <ReturnName extends returnName>(type: ReturnName, ...contents: contentType[]): returnType<ReturnName> => {
    const ctx = {} as returnType<returnName>;
    contents.forEach((ct) => {
        if (ct instanceof EmbedBuilder) {
            if (!ctx.embeds) ctx.embeds = [];
            if (ctx.embeds.length < 10) {
                ctx.embeds.push(ct);
            } else {
                log4js.trace(`Embed list is superior to 10`);
            }
        }
        if (typeof ct === 'string') {
            if (ctx.content.length > 0) {
                ctx.content = ct;
            } else {
                log4js.trace('Content is null');
            }
        }
        if (ct instanceof ActionRowBuilder) {
            if (!ctx.components) ctx.components = [];
            if (ctx.components.length < 5) {
                ctx.components.push(ct);
            } else {
                log4js.trace(`Component list is superior to 5`);
            }
        }
        if (ct instanceof Object) {
            Object.assign(ctx, ct);
        }
    });

    return ctx as returnType<ReturnName>;
};
export const row = <Component extends AnyComponentBuilder>(...components: Component[]): ActionRowBuilder<Component> => {
    const row = new ActionRowBuilder<Component>().setComponents(components)
    return row;
}
export const button = ({ style, label, emoji, disabled = false, url, id }: { label?: string; emoji?: string; disabled?: boolean; url?: string; style: keyof typeof ButtonStyle; id?: string; }) => {
    const btn = new ButtonBuilder()
        .setDisabled(disabled)
        .setStyle(ButtonStyle[style])
    if (label) btn.setLabel(label)
    if (emoji) btn.setEmoji(emoji)
    if (url) btn.setURL(url)
    if (id) btn.setCustomId(id)

    return btn;
}
export const yesNoRow = () => {
    return row(
        button({ id: 'yes', label: 'Oui', style: "Success" }),
        button({ id: 'no', label: 'Non', style: 'Danger' })
    )
}
export const pingUser = (user: string | User | GuildMember) => {
    if (typeof user === 'string') return `<@${user}>`;
    return `<@${user.id}>`
}