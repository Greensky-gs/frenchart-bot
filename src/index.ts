import { AmethystClient } from 'amethystjs';
import { Partials } from 'discord.js';
import { config } from 'dotenv';

config();

const client = new AmethystClient(
    {
        intents: ['Guilds', 'GuildMessages', 'GuildVoiceStates'],
        partials: [Partials.Channel, Partials.Message]
    },
    {
        token: process.env.token,
        debug: true,
        commandsFolder: './dist/commands',
        eventsFolder: './dist/events',
        autocompleteListenersFolder: './dist/autocompletes',
        buttonsFolder: './dist/buttons',
        botName: 'frenchart',
        preconditionsFolder: './dist/preconditions',
        botNameWorksAsPrefix: true,
        strictPrefix: false,
        prefix: '!!'
    }
);

client.start({});
