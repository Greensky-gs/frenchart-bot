import { log4js } from 'amethystjs';
import {
    ActionRowBuilder,
    AnyComponentBuilder,
    BaseSelectMenuBuilder,
    ButtonBuilder,
    ChannelSelectMenuBuilder,
    EmbedBuilder,
    InteractionReplyOptions,
    MessagePayload,
    MessageReplyOptions,
    RoleSelectMenuBuilder,
    StringSelectMenuBuilder,
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

export const content = (...contents: contentType[]) => {
    const ctx = {} as MessageReplyOptions;
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

    return ctx;
};
content();
