const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    // --- IMPORTANTE: Sin guion para que coincida con el nombre del archivo si prefieres ---
    name: 'setupfull', 
    description: '👑 Configuración total de canales y roles Rockstar',
    category: 'utilidad',

    // Configuración para el menú de Slash Commands /
    data: new SlashCommandBuilder()
        .setName('setupfull')
        .setDescription('👑 Configuración total de servidor')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    // Ejecución con prefijo !!setupfull
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply("❌ Necesitas permisos de Administrador para usar esto.");
        }
        await message.reply("🚀 **Iniciando el despliegue del imperio Rockstar...**");
        return this.runSetup(message);
    },

    // Ejecución con Slash /setupfull
    async executeSlash(interaction) {
        await interaction.reply("🚀 **Iniciando el despliegue del imperio Rockstar...**");
        return this.runSetup(interaction);
    },

    async runSetup(ctx) {
        const { guild } = ctx;
        const configPath = path.join(process.cwd(), 'welcomeConfig.json');

        try {
            // Función para crear roles con pausa (evita que Discord bloquee al bot)
            const createRole = async (name, color) => {
                await new Promise(r => setTimeout(r, 800)); 
                return guild.roles.create({ name, color, reason: 'Setup Rockstar' });
            };

            // --- 1. CREACIÓN DE ROLES (ORDENADOS) ---
            await createRole('━━━━━ GÉNEROS ━━━━━', '#000000');
            await createRole('He/Him ♂️', '#89CFF0');
            await createRole('She/Her ♀️', '#F4C2C2');
            await createRole('They/Them ⚧', '#E0BBE4');

            await createRole('━━━━━ EDADES ━━━━━', '#000000');
            await createRole('-18', '#FFD1DC');
            await createRole('+18', '#FF6961');

            await createRole('━━━━━ SIGNOS ━━━━━', '#000000');
            const signos = ['Aries ♈', 'Tauro ♉', 'Géminis ♊', 'Cáncer ♋', 'Leo ♌', 'Virgo ♍', 'Libra ♎', 'Escorpio ♏', 'Sagitario ♐', 'Capricornio ♑', 'Acuario ♒', 'Piscis ♓'];
            for (const s of signos) await createRole(s, '#FFF9C4');

            const roleUser = await createRole('🌸 Miembro', '#FFB6C1');
            const roleBot = await createRole('🤖 Bot Rockstar', '#A2D2FF');

            // --- 2. CREACIÓN DE CANALES ---
            const category = await guild.channels.create({ 
                name: '🌸 Rockstar System', 
                type: ChannelType.GuildCategory 
            });

            const welcomeChannel = await guild.channels.create({ 
                name: '🎀-bienvenidas', 
                type: ChannelType.GuildText, 
                parent: category.id 
            });

            // --- 3. GUARDADO DE CONFIGURACIÓN ---
            let config = {};
            if (fs.existsSync(configPath)) {
                config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            }
            config[guild.id] = { 
                welcomeChannel: welcomeChannel.id, 
                memberRole: roleUser.id 
            };
            fs.writeFileSync(configPath, JSON.stringify(config, null, 4));

            const successEmbed = new EmbedBuilder()
                .setTitle("✅ ¡Setup Rockstar Finalizado!")
                .setColor("#B5EAD7")
                .setDescription("Se han creado todos los roles y el canal de bienvenidas.\n\n⚠️ **Nota:** Sube el rol del bot al principio de la lista de roles.");

            // Responder según el tipo de contexto (Slash o Mensaje)
            if (ctx.editReply) await ctx.editReply({ content: ' ', embeds: [successEmbed] });
            else await ctx.channel.send({ embeds: [successEmbed] });

        } catch (error) {
            console.error(error);
            const errorMsg = "❌ Hubo un error al crear los roles. Verifica que tenga permisos de Administrador.";
            if (ctx.editReply) await ctx.editReply(errorMsg);
            else await ctx.channel.send(errorMsg);
        }
    }
};