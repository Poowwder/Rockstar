const { EmbedBuilder } = require('discord.js');
const { GuildConfig } = require('../data/mongodb.js');
const { sendAuditLog } = require('../functions/auditLogger.js');

module.exports = {
    name: 'guildMemberUpdate',
    async execute(oldMember, newMember) {
        const guild = newMember.guild;

        // --- 💎 DETECTOR DE BOOST ---
        if (!oldMember.premiumSince && newMember.premiumSince) {
            
            // 1. Buscamos el formulario guardado en la Base de Datos
            const config = await GuildConfig.findOne({ GuildID: guild.id });
            const b = config?.BoostConfig;
            
            // Si el servidor no ha configurado el comando !!boosts, el bot se queda en silencio
            if (!b || !b.channelId) return;

            const canalAnuncio = guild.channels.cache.get(b.channelId);
            if (!canalAnuncio) return;

            // --- 2. TRADUCTOR DE VARIABLES ---
            const replaceVars = (text) => {
                if (!text) return null;
                return text
                    .replace(/{user}/g, `<@${newMember.id}>`)
                    .replace(/{server}/g, guild.name)
                    .replace(/{membercount}/g, guild.memberCount)
                    .replace(/{boosts}/g, guild.premiumSubscriptionCount || 1)
                    .replace(/{tier}/g, guild.premiumTier || 0);
            };

            const contentText = replaceVars(b.content);
            const titleText = replaceVars(b.title);
            const descText = replaceVars(b.description);
            const footerText = replaceVars(b.footer);

            // --- 3. ARMADO DEL EMBED Y VALIDACIÓN DE COLOR ---
            // Validamos que sea un código HEX válido, si no, usamos el Rosa Nitro por defecto
            let finalColor = '#ff73fa'; 
            if (b.color && /^#[0-9A-F]{6}$/i.test(b.color.trim())) {
                finalColor = b.color.trim();
            }

            const boostEmbed = new EmbedBuilder().setColor(finalColor);

            // Agregamos solo las piezas que rellenaste en el formulario
            if (titleText) boostEmbed.setTitle(titleText);
            if (descText) boostEmbed.setDescription(descText);
            if (footerText) boostEmbed.setFooter({ text: footerText });
            if (b.timestamp) boostEmbed.setTimestamp();

            // Verificamos enlaces de imagen para no romper el bot si pones algo inválido
            if (b.thumbnail && b.thumbnail.startsWith('http')) boostEmbed.setThumbnail(b.thumbnail);
            if (b.image && b.image.startsWith('http')) boostEmbed.setImage(b.image);

            // Comprobamos si hay algún dato en el embed
            const hasEmbed = titleText || descText || footerText || b.image || b.thumbnail;

            // --- 4. MANIFIESTO FINAL ---
            await canalAnuncio.send({ 
                content: contentText || null, 
                embeds: hasEmbed ? [boostEmbed] : [] 
            }).catch(() => {});

            // --- 5. REGISTRO SILENCIOSO (LOGS) ---
            await sendAuditLog(guild, {
                title: '⊹ Inyección de Poder (Boost) ⊹',
                description: `**Sujeto:** ${newMember.user.tag}\n> *El individuo ha mejorado el servidor usando Nitro.*`,
                color: finalColor,
                icon: newMember.user.displayAvatarURL()
            });
        }
    }
};
