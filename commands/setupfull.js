const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'setupfull',
    description: '👑 Despliegue total: Categorías, Canales y Roles de Identidad.',
    category: 'utilidad',

    data: new SlashCommandBuilder()
        .setName('setupfull')
        .setDescription('👑 Configuración total de servidor (Rockstar Edition)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply("❌ Necesitas ser Administrador.");
        }
        await message.reply("✨ **Diseñando el imperio... Esto tomará un momento para evitar bloqueos.**");
        return this.runSetup(message);
    },

    async executeSlash(interaction) {
        await interaction.reply("✨ **Diseñando el imperio... Esto tomará un momento para evitar bloqueos.**");
        return this.runSetup(interaction);
    },

    async runSetup(ctx) {
        const { guild } = ctx;
        const configPath = path.join(process.cwd(), 'welcomeConfig.json');

        try {
            // --- ⏱️ FUNCIONES DE APOYO ---
            const wait = (ms) => new Promise(r => setTimeout(r, ms));
            
            const createRole = async (name, color) => {
                await wait(800);
                return guild.roles.create({ name, color, reason: 'Setup Rockstar' });
            };

            const createChan = async (name, type, parent = null) => {
                await wait(1000); // 1 segundo para canales
                return guild.channels.create({ name, type, parent });
            };

            // --- 1. CATEGORÍAS Y CANALES ---
            // Información
            const catInfo = await createChan('🌸 ‧ Informacion', ChannelType.GuildCategory);
            const welcome = await createChan('🎀-│-bienvenidas', ChannelType.GuildText, catInfo.id);
            await createChan('📜-│-reglas', ChannelType.GuildText, catInfo.id);
            await createChan('📢-│-anuncios', ChannelType.GuildText, catInfo.id);

            // Social
            const catSocial = await createChan('💬 ‧ Social', ChannelType.GuildCategory);
            await createChan('🍵-│-chat-general', ChannelType.GuildText, catSocial.id);
            await createChan('📸-│-galeria', ChannelType.GuildText, catSocial.id);
            await createChan('🧸-│-comandos', ChannelType.GuildText, catSocial.id);

            // Voz
            const catVoz = await createChan('🔊 ‧ Canales de Voz', ChannelType.GuildCategory);
            await createChan('☁️ Chat de Voz', ChannelType.GuildVoice, catVoz.id);
            await createChan('🎵 Música', ChannelType.GuildVoice, catVoz.id);

            // --- 2. ROLES DE IDENTIDAD ---
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

            const roleUser = await createRole('🌸 Miembro', '#FFB6C1');
            const roleBot = await createRole('🤖 Bot Rockstar', '#A2D2FF');

            // --- 3. GUARDADO DE CONFIGURACIÓN ---
            let allConfigs = {};
            if (fs.existsSync(configPath)) {
                allConfigs = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            }

            allConfigs[guild.id] = {
                welcomeChannel: welcome.id,
                memberRole: roleUser.id,
                botRole: roleBot.id
            };

            fs.writeFileSync(configPath, JSON.stringify(allConfigs, null, 4));

            const successEmbed = new EmbedBuilder()
                .setTitle('👑 ¡Configuración Rockstar Completada!')
                .setColor('#FFB6C1')
                .setDescription(`Se han creado:\n• **3 Categorías**\n• **9 Canales**\n• **Más de 20 Roles**\n\n📌 **Acción requerida:** Mueve el rol del bot arriba de todo en la lista de roles.`);

            if (ctx.editReply) await ctx.editReply({ content: ' ', embeds: [successEmbed] });
            else await ctx.channel.send({ embeds: [successEmbed] });

        } catch (error) {
            console.error(error);
            const errMsg = "❌ Ocurrió un error. Revisa que el bot sea Administrador.";
            if (ctx.editReply) await ctx.editReply(errMsg);
            else await ctx.channel.send(errMsg);
        }
    }
};