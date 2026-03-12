const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');

// 👑 TU ID DE DISCORD (Solo tú podrás usar el comando)
const CREATOR_ID = '1428164600091902055'; 

module.exports = {
    name: 'setupfull',
    description: 'Comando clasificado. Despliegue masivo de infraestructura.',
    category: 'oculto',

    data: new SlashCommandBuilder()
        .setName('setupfull')
        .setDescription('Comando clasificado. Despliegue masivo de infraestructura.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(input) {
        const isSlash = !!input.user;
        const author = isSlash ? input.user : input.author;
        const guild = input.guild;

        // --- 🔒 SEGURIDAD DE NIVEL DIOS ---
        if (author.id !== CREATOR_ID) {
            const errorMsg = '╰┈➤ ❌ **Acceso denegado.** Comando encriptado. Solo la creadora del sistema posee los privilegios para terraformar el servidor.';
            return isSlash ? input.reply({ content: errorMsg, ephemeral: true }) : input.reply(errorMsg);
        }

        const initMsg = '╰┈➤ ⏳ **Iniciando despliegue masivo... El abismo está construyendo categorías, canales, contadores y más de 40 roles. Esto tomará aproximadamente un minuto.**';
        
        let loadingMsg;
        if (isSlash) {
            loadingMsg = await input.reply({ content: initMsg, fetchReply: true });
        } else {
            loadingMsg = await input.reply(initMsg);
        }

        const configPath = path.join(process.cwd(), 'welcomeConfig.json');

        try {
            // --- ⏱️ FUNCIONES DE APOYO (Anti-Bloqueo de Discord) ---
            const wait = (ms) => new Promise(r => setTimeout(r, ms));
            
            const createRole = async (name, color) => {
                await wait(800);
                return guild.roles.create({ name, color, reason: 'Terraformación Rockstar' });
            };

            // Mejorada para aceptar límites de usuarios y permisos
            const createChan = async (name, type, parent = null, extraOpts = {}) => {
                await wait(1000); 
                return guild.channels.create({ name, type, parent, ...extraOpts });
            };

            const everyoneRole = guild.roles.everyone;

            // --- 1. CONTADORES (Estadísticas Intocables) ---
            const catStats = await createChan('📊 ‧ Estadísticas', ChannelType.GuildCategory);
            
            const totalMembers = guild.memberCount;
            const humanMembers = guild.members.cache.filter(m => !m.user.bot).size;

            await createChan(`🌍 Totales: ${totalMembers}`, ChannelType.GuildVoice, catStats.id, {
                permissionOverwrites: [{ id: everyoneRole.id, deny: [PermissionFlagsBits.Connect] }]
            });
            await createChan(`👤 Humanos: ${humanMembers}`, ChannelType.GuildVoice, catStats.id, {
                permissionOverwrites: [{ id: everyoneRole.id, deny: [PermissionFlagsBits.Connect] }]
            });

            // --- 2. CATEGORÍAS Y CANALES DE TEXTO ---
            // Información
            const catInfo = await createChan('🌸 ‧ Información', ChannelType.GuildCategory);
            const welcome = await createChan('🎀-│-bienvenidas', ChannelType.GuildText, catInfo.id);
            await createChan('📜-│-reglas', ChannelType.GuildText, catInfo.id);
            await createChan('📢-│-anuncios', ChannelType.GuildText, catInfo.id);
            await createChan('💡-│-sugerencias', ChannelType.GuildText, catInfo.id);
            await createChan('🎫-│-tickets', ChannelType.GuildText, catInfo.id);

            // Social
            const catSocial = await createChan('💬 ‧ Social', ChannelType.GuildCategory);
            await createChan('🍵-│-chat-general', ChannelType.GuildText, catSocial.id);
            await createChan('📸-│-galeria', ChannelType.GuildText, catSocial.id);
            await createChan('🎵-│-peticiones-dj', ChannelType.GuildText, catSocial.id);
            await createChan('🧸-│-comandos', ChannelType.GuildText, catSocial.id);

            // --- 3. CANALES DE VOZ (Públicos y Privados) ---
            const catVoz = await createChan('🔊 ‧ Canales de Voz', ChannelType.GuildCategory);
            await createChan('☁️ Lounge Principal', ChannelType.GuildVoice, catVoz.id);
            await createChan('🎵 Zona de Música', ChannelType.GuildVoice, catVoz.id);
            
            // Canales con Límite
            await createChan('🔒 Refugio Dúo (2)', ChannelType.GuildVoice, catVoz.id, { userLimit: 2 });
            await createChan('🔒 Charla Íntima (3)', ChannelType.GuildVoice, catVoz.id, { userLimit: 3 });
            await createChan('🎮 Escuadrón (6)', ChannelType.GuildVoice, catVoz.id, { userLimit: 6 });
            
            // Canal AFK
            await createChan('💤 AFK / Silencio', ChannelType.GuildVoice, catVoz.id);

            // --- 4. ROLES DE IDENTIDAD MASIVOS ---
            
            // Edades
            await createRole('━━━━━ EDADES ━━━━━', '#000000');
            const roleMinor = await createRole('-18', '#FFD1DC');
            const roleAdult = await createRole('+18', '#FF6961');

            // Géneros
            await createRole('━━━━━ GÉNEROS ━━━━━', '#000000');
            await createRole('He/Him ♂️', '#89CFF0');
            await createRole('She/Her ♀️', '#F4C2C2');
            await createRole('They/Them ⚧', '#E0BBE4');

            // Continentes
            await createRole('━━━━ CONTINENTES ━━━━', '#000000');
            const continentes = ['América 🌎', 'Europa 🌍', 'Asia 🌏', 'Oceanía 🏄', 'África 🦁'];
            for (const c of continentes) await createRole(c, '#95A5A6');

            // Hobbies
            await createRole('━━━━━ HOBBIES ━━━━━', '#000000');
            const hobbies = ['Gaming 🎮', 'Arte & Dibujo 🎨', 'Música 🎧', 'Deportes ⚽', 'Lectura 📚', 'Programación 💻', 'Anime & Manga 🍥', 'Cine & Series 🎬'];
            for (const h of hobbies) await createRole(h, '#D3D3D3');

            // Signos
            await createRole('━━━━━ SIGNOS ━━━━━', '#000000');
            const signos = ['Aries ♈', 'Tauro ♉', 'Géminis ♊', 'Cáncer ♋', 'Leo ♌', 'Virgo ♍', 'Libra ♎', 'Escorpio ♏', 'Sagitario ♐', 'Capricornio ♑', 'Acuario ♒', 'Piscis ♓'];
            for (const s of signos) await createRole(s, '#FFF9C4');

            // Colores
            await createRole('━━━━━ COLORES ━━━━━', '#000000');
            const colores = [
                { n: 'Rojo Carmesí', c: '#DC143C' }, { n: 'Azul Océano', c: '#1E90FF' }, 
                { n: 'Verde Esmeralda', c: '#50C878' }, { n: 'Amarillo Sol', c: '#FFD700' }, 
                { n: 'Rosa Pastel', c: '#FFB6C1' }, { n: 'Morado Amatista', c: '#9966CC' }, 
                { n: 'Naranja Fuego', c: '#FF8C00' }, { n: 'Blanco Puro', c: '#FFFFFF' }, 
                { n: 'Negro Abismo', c: '#1A1A1A' }
            ];
            for (const col of colores) await createRole(col.n, col.c);

            // Roles de Jerarquía Base
            const roleUser = await createRole('🌸 Miembro', '#FFB6C1');
            const roleBot = await createRole('🤖 Bot Rockstar', '#A2D2FF');

            // --- 5. GUARDADO DE CONFIGURACIÓN ---
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

            // --- 6. MANIFIESTO DE FINALIZACIÓN ---
            const successEmbed = new EmbedBuilder()
                .setTitle('⊹ IMPERIO ESTABLECIDO ⊹')
                .setColor('#1a1a1a') // Negro Rockstar
                .setDescription(
                    `El abismo ha completado la construcción masiva.\n\n` +
                    `> **Contadores de Red:** \`Activos\`\n` +
                    `> **Nuevos Sectores:** \`17 Canales\`\n` +
                    `> **Roles Inyectados:** \`+45 Identidades\`\n\n` +
                    `-# ⚠️ **Importante:** Recuerda mover el rol del bot (Nightfall/Rockstar) hacia lo más alto de la jerarquía de roles en los ajustes del servidor para que pueda administrarlos todos.`
                )
                .setFooter({ text: 'Terraformación Absoluta ⊹ Rockstar Nova', iconURL: author.displayAvatarURL() })
                .setTimestamp();

            if (isSlash) {
                await input.editReply({ content: '╰┈➤ ✅ **Proceso finalizado con éxito.**', embeds: [successEmbed] });
            } else {
                await loadingMsg.edit({ content: '╰┈➤ ✅ **Proceso finalizado con éxito.**', embeds: [successEmbed] });
            }

        } catch (error) {
            console.error(error);
            const errorEmbed = new EmbedBuilder()
                .setTitle('❌ FALLO CRÍTICO EN LA TERRAFORMACIÓN')
                .setColor('#ff4d4d')
                .setDescription(`\`\`\`js\n${error.message}\n\`\`\``);
            
            if (isSlash) {
                await input.editReply({ content: ' ', embeds: [errorEmbed] });
            } else {
                await loadingMsg.edit({ content: ' ', embeds: [errorEmbed] });
            }
        }
    }
};
