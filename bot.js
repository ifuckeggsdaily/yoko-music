require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { DisTube } = require('distube');
const ytSearch = require('yt-search');
const lyricsFinder = require('lyrics-finder');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent
    ]
});

const distube = new DisTube(client, { searchSongs: 0, leaveOnStop: false });
client.on('ready', () => {
    console.log(`${client.user.tag} is online!`);
    client.user.setActivity('Shadow Haven 🎵', { type: 'LISTENING' });
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    const { commandName } = interaction;

    if (commandName === 'play') {
        const song = interaction.options.getString('query');
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) return interaction.reply('Join a voice channel first!');
        
        await distube.play(voiceChannel, song, { member: interaction.member, textChannel: interaction.channel });
        interaction.reply(`🎶 Playing: **${song}**`);
    }

    if (commandName === 'queue') {
        const queue = distube.getQueue(interaction.guildId);
        if (!queue || !queue.songs.length) return interaction.reply('The queue is empty.');
        
        const queueEmbed = new EmbedBuilder()
            .setTitle('「🎶」 Song Queue')
            .setDescription(queue.songs.map((song, index) => `**${index + 1}.** ${song.name}`).join('\n'))
            .setColor('#ff2050');
        
        interaction.reply({ embeds: [queueEmbed] });
    }

    if (commandName === 'nowplaying') {
        const queue = distube.getQueue(interaction.guildId);
        if (!queue) return interaction.reply('No song is currently playing.');
        
        const song = queue.songs[0];
        const embed = new EmbedBuilder()
            .setTitle('Now Playing')
            .setDescription(`🎵 **${song.name}** - ${song.uploader.name}`)
            .setThumbnail(client.user.displayAvatarURL())
            .setImage(song.thumbnail)
            .setColor('#ff2050');
        
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder().setCustomId('pause').setLabel('⏸ Pause').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('resume').setLabel('▶ Resume').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('skip').setLabel('⏭ Skip').setStyle(ButtonStyle.Danger)
            );
        
        interaction.reply({ embeds: [embed], components: [row] });
    }

    if (commandName === 'top') {
        const results = await ytSearch('top 10 songs worldwide');
        const topSongs = results.videos.slice(0, 10).map((video, index) => `**${index + 1}.** [${video.title}](${video.url})`).join('\n');
        
        const embed = new EmbedBuilder()
            .setTitle('「🌍」 Top 10 Songs Worldwide')
            .setDescription(topSongs)
            .setColor('#ff2050');
        
        interaction.reply({ embeds: [embed] });
    }

    if (commandName === 'topartist') {
        const results = await ytSearch('top 10 music artists worldwide');
        const topArtists = results.videos.slice(0, 10).map((video, index) => `**${index + 1}.** ${video.title}`).join('\n');
        
        const embed = new EmbedBuilder()
            .setTitle('「🌍」 Top 10 Artists Worldwide')
            .setDescription(topArtists)
            .setColor('#ff2050');
        
        interaction.reply({ embeds: [embed] });
    }

    if (commandName === 'info') {
        const queue = distube.getQueue(interaction.guildId);
        if (!queue) return interaction.reply('No song is currently playing.');
        
        const song = queue.songs[0];
        const embed = new EmbedBuilder()
            .setTitle('🎵 Song Info')
            .setDescription(`**Title:** ${song.name}\n**Uploader:** ${song.uploader.name}\n**Duration:** ${song.formattedDuration}\n[Listen on YouTube](${song.url})`)
            .setThumbnail(song.thumbnail)
            .setColor('#ff2050');
        
        interaction.reply({ embeds: [embed] });
    }

    if (commandName === 'lyrics') {
        let songName = interaction.options.getString('query');
        if (!songName) {
            const queue = distube.getQueue(interaction.guildId);
            if (!queue) return interaction.reply('No song is currently playing and no song name was provided.');
            songName = queue.songs[0].name;
        }
        
        let lyrics = await lyricsFinder(songName, "");
        if (!lyrics) lyrics = "Lyrics not found.";
        
        const embed = new EmbedBuilder()
            .setTitle(`「📜」 Lyrics for ${songName}`)
            .setDescription(lyrics.length > 4096 ? `${lyrics.slice(0, 4093)}...` : lyrics)
            .setColor('#ff2050');
        
        interaction.reply({ embeds: [embed] });
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;
    const queue = distube.getQueue(interaction.guildId);
    if (!queue) return interaction.reply('No song is currently playing.');

    if (interaction.customId === 'pause') {
        queue.pause();
        interaction.reply('⏸ Song paused.');
    }
    if (interaction.customId === 'resume') {
        queue.resume();
        interaction.reply('▶ Song resumed.');
    }
    if (interaction.customId === 'skip') {
        queue.skip();
        interaction.reply('⏭ Skipped to the next song.');
    }
});

client.login(process.env.DISCORD_TOKEN);
