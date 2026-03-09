const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'setup-full',
    data: new SlashCommandBuilder()
        .setName('setup-full')
        .setDescription('👑 Configuración total: Canales, Roles de Identidad y Categorías')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const { guild } = interaction;
        const configPath = path.join(process.cwd(), 'welcomeConfig.json');

        await interaction.reply("✨ **Diseñando el universo Rockstar... Esto creará muchos roles, paciencia.**");

        try {
            // --- 1. FUNCIÓN PARA CREAR ROLES RÁPIDAMENTE ---
            const createRole = (name, color) => guild.roles.create({ name, color, reason: 'Setup Rockstar' });

            // --- 2. SEPARADORES (Estética) ---
            await createRole('━━━━━ GÉNEROS ━━━━━', '#000000');
            const roleMasc = await createRole('He/Him ♂️', '#89CFF0');
            const roleFem = await createRole('She/Her ♀️', '#F4C2C2');
            const roleNon = await createRole('They/Them ⚧', '#E0BBE4');

            await createRole('━━━━━ EDADES ━━━━━', '#000000');
            const roleMinor = await createRole('-18', '#FFD1DC');
            const roleAdult = await createRole('+18', '#FF6961');

            await createRole('━━━━━ SIGNOS ━━━━━', '#000000');
            const signos = ['Aries ♈', 'Tauro ♉', 'Géminis ♊', 'Cáncer ♋', 'Leo ♌', 'Virgo ♍', 'Libra ♎', 'Escorpio ♏', 'Sagitario ♐', 'Capricornio ♑', 'Acuario ♒', 'Piscis ♓'];
            for (const s of signos) await createRole(s, '#FFF9C4');

            await createRole('━━━━━ COLORES ━━━━━', '#000000');
            const colores = [['Pastel Pink', '#FFB6C1'], ['Sky Blue', '#A2D2FF'], ['Mint Green', '#B5EAD7'], ['Lavender', '#E0BBE4']];
            for (const [n, c] of colores) await createRole(n, c);

            await createRole('━━━━━ JUEGOS ━━━━━', '#000000');
            const juegos = ['Minecraft ⛏️', 'Roblox 🧸', 'Valorant 🔫', 'League of Legends 🐉', 'Free Fire 🔥'];
            for (const j of juegos) await createRole(j, '#B2DFDB');

            await createRole('━━━━━ PINGS ━━━━━', '#000000');
            const pings = ['Anuncios 📢', 'Sorteos 🎁', 'Eventos ✨', 'Alianzas 🤝'];
            for (const p of pings) await createRole(p, '#FFCCBC');

            // --- 3. ROLES DEL SISTEMA (Para el JSON) ---
            const roleStaff = await createRole('⭐ Staff Rockstar', '#FF0000');
            const roleUser = await createRole('🌸 Miembro', '#FFB6C1');
            const roleBot = await createRole('🤖 Bot Rockstar', '#A2D2FF');

            // --- 4. CANALES BÁSICOS ---
            const catInfo = await guild.channels.create({ name: '🌸 ‧ Informacion', type: ChannelType.GuildCategory });
            const welcomeChan = await guild.channels.create({ name: '🎀-│-bienvenidas', type: ChannelType.GuildText, parent: catInfo.id });
            const logsChan = await guild.channels.create({ name: '🛠-logs-generales', type: ChannelType.GuildText });

            // --- 5. GUARDAR EN JSON ---
            let allConfigs = {};
            if (fs.existsSync(configPath)) allConfigs = JSON.parse(fs.readFileSync(configPath, 'utf8'));

            allConfigs[guild.id] = {
                channelId: welcomeChan.id,
                logsId: logsChan.id,
                userRoleId: roleUser.id,
                botRoleId: roleBot.id
            };

            fs.writeFileSync(configPath, JSON.stringify(allConfigs, null, 4));

            const successEmbed = new EmbedBuilder()
                .setTitle('👑 ¡Imperio Rockstar Creado!')
                .setColor('#FFB6C1')
                .setDescription(`Se han creado los canales y **más de 30 roles** organizados por categorías.\n\n📌 **Recuerda:** Mueve el rol del bot hasta arriba de todo para que pueda gestionar estos nuevos roles.`);

            await interaction.editReply({ content: '', embeds: [successEmbed] });

        } catch (error) {
            console.error(error);
            await interaction.editReply("❌ Error al crear los roles. Verifica que el bot tenga permisos de Administrador.");
        }
    }
};