const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'setup-full',
    description: '👑 Configuración total: Canales, Roles de Identidad y Categorías',
    category: 'utilidad',
    data: new SlashCommandBuilder()
        .setName('setup-full')
        .setDescription('👑 Configuración total: Canales, Roles de Identidad y Categorías')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    // --- ESTO ARREGLA EL PREFIJO !! ---
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply("❌ Solo administradores pueden usar este comando.");
        }
        await message.reply("✨ **Diseñando el universo Rockstar... Esto creará muchos roles, paciencia.**");
        return this.runSetup(message);
    },

    // --- ESTO ARREGLA EL / SLASH ---
    async executeSlash(interaction) {
        await interaction.reply("✨ **Diseñando el universo Rockstar... Esto creará muchos roles, paciencia.**");
        return this.runSetup(interaction);
    },

    // --- LÓGICA ORIGINAL (CORREGIDA) ---
    async runSetup(ctx) {
        const guild = ctx.guild;
        const configPath = path.join(process.cwd(), 'welcomeConfig.json');

        try {
            const createRole = (name, color) => guild.roles.create({ name, color, reason: 'Setup Rockstar' });

            // 1. GÉNEROS
            await createRole('━━━━━ GÉNEROS ━━━━━', '#000000');
            await createRole('He/Him ♂️', '#89CFF0');
            await createRole('She/Her ♀️', '#F4C2C2');
            await createRole('They/Them ⚧', '#E0BBE4');

            // 2. EDADES
            await createRole('━━━━━ EDADES ━━━━━', '#000000');
            await createRole('-18', '#FFD1DC');
            await createRole('+18', '#FF6961');

            // 3. SIGNOS (Todos los que pusiste)
            await createRole('━━━━━ SIGNOS ━━━━━', '#000000');
            const signos = ['Aries ♈', 'Tauro ♉', 'Géminis ♊', 'Cáncer ♋', 'Leo ♌', 'Virgo ♍', 'Libra ♎', 'Escorpio ♏', 'Sagitario ♐', 'Capricornio ♑', 'Acuario ♒', 'Piscis ♓'];
            for (const s of signos) await createRole(s, '#FFF9C4');

            // 4. COLORES
            await createRole('━━━━━ COLORES ━━━━━', '#000000');
            const colores = [['Pastel Pink', '#FFB6C1'], ['Sky Blue', '#A2D2FF'], ['Mint Green', '#B5EAD7'], ['Lavender', '#E0BBE4']];
            for (const [n, c] of colores) await createRole(n, c);

            // 5. JUEGOS
            await createRole('━━━━━ JUEGOS ━━━━━', '#000000');
            const juegos = ['Minecraft ⛏️', 'Roblox 🧸', 'Valorant 🔫', 'League of Legends 🐉', 'Free Fire 🔥'];
            for (const j of juegos) await createRole(j, '#B2DFDB');

            // 6. PINGS
            await createRole('━━━━━ PINGS ━━━━━', '#000000');
            const pings = ['Anuncios 📢', 'Sorteos 🎁', 'Eventos ✨', 'Alianzas 🤝'];
            for (const p of pings) await createRole(p, '#FFCCBC');

            // 7. ROLES DEL SISTEMA
            const roleStaff = await createRole('⭐ Staff Rockstar', '#FF0000');
            const roleUser = await createRole('🌸 Miembro', '#FFB6C1');
            const roleBot = await createRole('🤖 Bot Rockstar', '#A2D2FF');

            // 8. CANALES
            const catInfo = await guild.channels.create({ name: '🌸 ‧ Informacion', type: ChannelType.GuildCategory });
            const welcomeChan = await guild.channels.create({ name: '🎀-│-bienvenidas', type: ChannelType.GuildText, parent: catInfo.id });
            const logsChan = await guild.channels.create({ name: '🛠-logs-generales', type: ChannelType.GuildText });

            // 9. GUARDAR EN JSON
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
                .setDescription(`Se han creado los canales y todos los roles organizados.\n\n📌 **Recuerda:** Mueve el rol del bot hasta arriba.`);

            // Responder según el tipo de comando
            if (ctx.editReply) await ctx.editReply({ content: '', embeds: [successEmbed] });
            else await ctx.channel.send({ embeds: [successEmbed] });

        } catch (error) {
            console.error(error);
            const err = "❌ Error al crear los roles. Verifica los permisos del bot.";
            if (ctx.editReply) await ctx.editReply(err);
            else await ctx.channel.send(err);
        }
    }
};