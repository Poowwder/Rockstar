const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    // --- Configuración para !! (Prefijo) ---
    name: 'setup-full',
    description: '👑 Configuración total: Canales, Roles de Identidad y Categorías',
    category: 'utilidad',

    // --- Configuración para / (Slash) ---
    data: new SlashCommandBuilder()
        .setName('setup-full')
        .setDescription('👑 Configuración total: Canales, Roles de Identidad y Categorías')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    // --- Ejecución por mensaje (!!) ---
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply("❌ Solo los administradores pueden usar este comando.");
        }
        await message.reply("✨ **Diseñando el universo Rockstar... Esto creará muchos roles, paciencia.**");
        return this.runSetup(message);
    },

    // --- Ejecución por Slash (/) ---
    async executeSlash(interaction) {
        await interaction.reply("✨ **Diseñando el universo Rockstar... Esto creará muchos roles, paciencia.**");
        return this.runSetup(interaction);
    },

    // --- LÓGICA PRINCIPAL (TU CÓDIGO ORIGINAL CON MEJORAS) ---
    async runSetup(ctx) {
        const { guild } = ctx;
        const configPath = path.join(process.cwd(), 'welcomeConfig.json');

        try {
            // Función para crear roles con un pequeño retraso para evitar bloqueos
            const createRole = async (name, color) => {
                await new Promise(resolve => setTimeout(resolve, 600)); // 0.6 segundos de espera entre roles
                return guild.roles.create({ name, color, reason: 'Setup Rockstar' });
            };

            // --- 1. SEPARADORES Y ROLES (TU LISTA COMPLETA) ---
            
            // GÉNEROS
            await createRole('━━━━━ GÉNEROS ━━━━━', '#000000');
            const roleMasc = await createRole('He/Him ♂️', '#89CFF0');
            const roleFem = await createRole('She/Her ♀️', '#F4C2C2');
            const roleNon = await createRole('They/Them ⚧', '#E0BBE4');

            // EDADES
            await createRole('━━━━━ EDADES ━━━━━', '#000000');
            const roleMinor = await createRole('-18', '#FFD1DC');
            const roleAdult = await createRole('+18', '#FF6961');

            // SIGNOS
            await createRole('━━━━━ SIGNOS ━━━━━', '#000000');
            const signos = ['Aries ♈', 'Tauro ♉', 'Géminis ♊', 'Cáncer ♋', 'Leo ♌', 'Virgo ♍', 'Libra ♎', 'Escorpio ♏', 'Sagitario ♐', 'Capricornio ♑', 'Acuario ♒', 'Piscis ♓'];
            for (const s of signos) await createRole(s, '#FFF9C4');

            // COLORES
            await createRole('━━━━━ COLORES ━━━━━', '#000000');
            const colores = [['Pastel Pink', '#FFB6C1'], ['Sky Blue', '#A2D2FF'], ['Mint Green', '#B5EAD7'], ['Lavender', '#E0BBE4']];
            for (const [n, c] of colores) await createRole(n, c);

            // JUEGOS
            await createRole('━━━━━ JUEGOS ━━━━━', '#000000');
            const juegos = ['Minecraft ⛏️', 'Roblox 🧸', 'Valorant 🔫', 'League of Legends 🐉', 'Free Fire 🔥'];
            for (const j of juegos) await createRole(j, '#B2DFDB');

            // PINGS
            await createRole('━━━━━ PINGS ━━━━━', '#000000');
            const pings = ['Anuncios 📢', 'Sorteos 🎁', 'Eventos ✨', 'Alianzas 🤝'];
            for (const p of pings) await createRole(p, '#FFCCBC');

            // ROLES DEL SISTEMA
            const roleStaff = await createRole('⭐ Staff Rockstar', '#FF0000');
            const roleUser = await createRole('🌸 Miembro', '#FFB6C1');
            const roleBot = await createRole('🤖 Bot Rockstar', '#A2D2FF');

            // --- 2. CANALES BÁSICOS ---
            const catInfo = await guild.channels.create({ name: '🌸 ‧ Informacion', type: ChannelType.GuildCategory });
            const welcomeChan = await guild.channels.create({ name: '🎀-│-bienvenidas', type: ChannelType.GuildText, parent: catInfo.id });
            const logsChan = await guild.channels.create({ name: '🛠-logs-generales', type: ChannelType.GuildText });

            // --- 3. GUARDAR EN JSON ---
            let allConfigs = {};
            if (fs.existsSync(configPath)) {
                allConfigs = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            }

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

            // Respuesta final dependiendo de cómo se llamó al comando
            if (ctx.editReply) {
                await ctx.editReply({ content: '', embeds: [successEmbed] });
            } else {
                await ctx.channel.send({ embeds: [successEmbed] });
            }

        } catch (error) {
            console.error(error);
            const errorMsg = "❌ Error al crear los roles. Verifica que el bot tenga permisos de Administrador.";
            if (ctx.editReply) await ctx.editReply(errorMsg);
            else await ctx.channel.send(errorMsg);
        }
    }
};