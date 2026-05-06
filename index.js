require('dotenv').config();

const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Events
} = require('discord.js');

// =====================
// CLIENT
// =====================
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

// =====================
// ROLE IDS (REPLACE THESE)
// =====================
const roles = {
    // pronouns
    sheher: '1480656321559924822',
    hehim: '1480656319936463082',
    theythem: '1480656322155249857',
    askme: '1480656322818216160',

    // timezones
    est: '1501443665061740627',
    cst: '1501443700507545739',
    pst: '1501443725232963796',
    gmt: '15014437574536069838',
    jtc: '1501443783148044308',
    cet: '1501443809333088346',
    hst: '1501443831558836286',

    // social "ping roles"
    twitch: '1481704630261121074',
    youtube: '1481704711596933130',
    twitter: '1501444260271095840',
    tiktok: '1501444260271095840',
    instagram: '1501444291594031124',

    xolianews: '1501428411221147648',
    servernews: '1501428656763834418',

    movieNight: '1501428342199681045',
    gameNight: '1501428384771604592'
};

// =====================
// READY EVENT
// =====================
client.once(Events.ClientReady, async () => {
    console.log(`${client.user.tag} is online!`);

    try {
        const channelIds = process.env.CHANNEL_IDS?.split(",");
        if (!channelIds) return console.log("Missing CHANNEL_IDS in .env");

        // =====================
        // EMBEDS
        // =====================
        const socialEmbed = new EmbedBuilder()
            .setColor('#6c63ff')
            .setTitle('Social Pings')
            .setDescription('Click to toggle notification roles!');

        const pronounEmbed = new EmbedBuilder()
            .setColor('#6c63ff')
            .setTitle('Pronouns')
            .setDescription('Pick your pronouns!');

        const timezoneEmbed = new EmbedBuilder()
            .setColor('#6c63ff')
            .setTitle('Timezone')
            .setDescription('Select your timezone!');

        const newsEmbed = new EmbedBuilder()
            .setColor('#ffcc00')
            .setTitle('News Ping Roles')
            .setDescription('Get notified when updates drop!');

        const eventEmbed = new EmbedBuilder()
            .setColor('#ff66cc')
            .setTitle('Event Ping Roles')
            .setDescription('Get notified for Movie Nights & Game Nights!');

        // =====================
        // SOCIAL BUTTONS (NOW ROLES)
        // =====================
        const socialButtons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('twitch').setLabel('Twitch').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('youtube').setLabel('YouTube').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('twitter').setLabel('Twitter').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('tiktok').setLabel('TikTok').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('instagram').setLabel('Instagram').setStyle(ButtonStyle.Primary)
        );

        // =====================
        // PRONOUN BUTTONS
        // =====================
        const pronounButtons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('sheher').setLabel('She/Her').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('hehim').setLabel('He/Him').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('theythem').setLabel('They/Them').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('askme').setLabel('Ask Me').setStyle(ButtonStyle.Primary)
        );

        // =====================
        // TIMEZONE BUTTONS
        // =====================
        const timezoneButtons1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('est').setLabel('EST').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('cst').setLabel('CST').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('pst').setLabel('PST').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('gmt').setLabel('GMT').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('jtc').setLabel('JTC').setStyle(ButtonStyle.Primary)
        );

        const timezoneButtons2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('cet').setLabel('CET').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('hst').setLabel('HST').setStyle(ButtonStyle.Primary)
        );

        const newsButtons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('xolianews').setLabel('📰 Xolia News').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('servernews').setLabel('📢 Server News').setStyle(ButtonStyle.Success)
        );

          const eventButtons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('movieNight').setLabel('🎬 Movie Night').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('gameNight').setLabel('🎮 Game Night').setStyle(ButtonStyle.Success)
        );

        // =====================
        // SEND TO CHANNELS
        // =====================
        for (const id of channelIds) {
            try {
                const channel = await client.channels.fetch(id.trim());
                if (!channel) continue;

                await channel.send({ embeds: [socialEmbed], components: [socialButtons] });
                await channel.send({ embeds: [pronounEmbed], components: [pronounButtons] });
                await channel.send({ embeds: [timezoneEmbed], components: [timezoneButtons1, timezoneButtons2] });
                await channel.send({ embeds: [newsEmbed], components: [newsButtons] });
                await channel.send({ embeds: [eventEmbed], components: [eventButtons] });

            } catch (err) {
                console.error(`Channel error (${id}):`, err);
            }
        }

    } catch (err) {
        console.error("Startup error:", err);
    }
});

// =====================
// BUTTON HANDLER
// =====================
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isButton()) return;

    const roleId = roles[interaction.customId];
    if (!roleId) return;

    try {
        const member = interaction.member;
        const role = interaction.guild.roles.cache.get(roleId);

        if (!role) {
            return interaction.reply({ content: "Role not found.", ephemeral: true });
        }

        // toggle role
        if (member.roles.cache.has(roleId)) {
            await member.roles.remove(roleId);
            return interaction.reply({
                content: `❌ Removed <@&${roleId}>`,
                ephemeral: true
            });
        } else {
            await member.roles.add(roleId);
            return interaction.reply({
                content: `✅ Added <@&${roleId}>`,
                ephemeral: true
            });
        }

    } catch (err) {
        console.error("Interaction error:", err);

        if (!interaction.replied) {
            interaction.reply({
                content: "Error processing role.",
                ephemeral: true
            });
        }
    }
});

// =====================
// LOGIN
// =====================
client.login(process.env.TOKEN);