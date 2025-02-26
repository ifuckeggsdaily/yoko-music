const { REST, Routes, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();

const commands = [
    new SlashCommandBuilder().setName('play').setDescription('Play a song').addStringOption(option => option.setName('query').setDescription('Song name or URL').setRequired(true)),
    new SlashCommandBuilder().setName('queue').setDescription('Show the song queue'),
    new SlashCommandBuilder().setName('nowplaying').setDescription('Show current playing song'),
    new SlashCommandBuilder().setName('top').setDescription('Show top 10 songs worldwide'),
    new SlashCommandBuilder().setName('topartist').setDescription('Show top 10 artists worldwide'),
    new SlashCommandBuilder().setName('info').setDescription('Show info about the current song'),
    new SlashCommandBuilder().setName('lyrics').setDescription('Get lyrics of a song').addStringOption(option => option.setName('query').setDescription('Song name')),
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);


(async () => {
    try {
        console.log('Refreshing commands...');
        await rest.put(Routes.applicationCommands(process.env.BOT_ID), { body: commands });
        console.log('Commands registered!');
    } catch (error) {
        console.error(error);
    }
})();
