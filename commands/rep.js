const { EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../userManager.js'); 
const emojis = require('../utils/emojiHelper.js'); 

module.exports = {
    name: 'rep',
    category: 'economía',
    async execute(message, args) {
        const target = message.mentions.users.first();
        const authorId = message.author.id;

        // 1. Validaciones iniciales
        if (!target) return message.reply(`╰┈➤ ${emojis.exclamation} Menciona a quien deseas otorgar tu reconocimiento.`);
        if (target.id === authorId) return message.reply(`❌ No puedes inflar tu propio carisma, colega.`);
        if (target.bot) return message.reply(`❌ Las máquinas no necesitan carisma.`);

        // 2. Control de Cooldown (24 Horas)
        const authorData = await getUserData(authorId);
        const ahora = Date.now();
        const cooldown = 24 * 60 * 60 * 1000; // 24 horas en ms
        const ultimoRep = authorData.lastRep || 0;

        if (ahora - ultimoRep < cooldown) {
            const tiempoRestante = cooldown - (ahora - ultimoRep);
            const horas = Math.floor(tiempoRestante / (1000 * 60 * 60));
            const minutos = Math.floor((tiempoRestante % (1000 * 60 * 60)) / (1000 * 60));
            
            return message.reply(`⏳ Ya has entregado tu reputación hoy. Vuelve en **${horas}h ${minutos}m**.`);
        }

        // 3. Proceso de Actualización
        const targetData = await getUserData(target.id);
        const nuevaRep = (targetData.rep || 0) + 1;

        // Guardamos la nueva rep al objetivo y el cooldown al autor
        await updateUserData(target.id, { rep: nuevaRep });
        await updateUserData(authorId, { lastRep: ahora });

        // 4. Respuesta Aesthetic
        const embed = new EmbedBuilder()
            .setColor('#E6E6FA')
            .setTitle(`${emojis.star} ‧₊˚ Reputación Otorgada ˚₊‧ ${emojis.star}`)
            .setDescription(
                `> *“El respeto no se pide, se gana en las sombras.”*\n\n` +
                `${emojis.pinkstars} **${message.author.username}** le ha dado un punto de carisma a **${target.username}**.\n\n` +
                `╰┈➤ Ahora tiene \`${nuevaRep}\` puntos de **Carisma** en su \`!!profile\`.`
            )
            .setThumbnail(target.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: 'Rockstar Influence • Carisma System' });

        return message.reply({ embeds: [embed] });
    }
};
