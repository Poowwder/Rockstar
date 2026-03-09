const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData, addXP } = require('../userManager.js'); // ✅ Importación corregida
const fs = require('fs');
const path = require('path');
const emojis = require('../utils/emojiHelper.js'); 

const recipesPath = path.join(__dirname, '../data/recipes.json');

module.exports = {
    name: 'craft',
    data: new SlashCommandBuilder()
        .setName('craft')
        .setDescription('🛠️ Fabrica herramientas mágicas (Cuidado: puede fallar)')
        .addStringOption(opt => opt.setName('item').setDescription('ID del objeto').setRequired(false)),

    async execute(interaction) {
        const userId = interaction.user.id;
        const member = interaction.member;
        
        // Verificamos que el archivo de recetas exista para evitar crashes
        if (!fs.existsSync(recipesPath)) {
            return interaction.reply({ content: "⚠️ No se encontró el libro de recetas (`recipes.json`).", ephemeral: true });
        }

        const recipes = JSON.parse(fs.readFileSync(recipesPath, 'utf8'));
        const itemToCraft = interaction.options.getString('item')?.toLowerCase();
        const data = await getUserData(userId);

        // --- 🎀 MENÚ DE RECETAS AESTHETIC ---
        if (!itemToCraft) {
            let listaRecetas = "";
            for (const id in recipes) {
                const r = recipes[id];
                const mats = Object.entries(r.materials).map(([m, c]) => `\`${c}x ${m}\``).join(' 🌸 ');
                listaRecetas += `╰┈➤ **${r.name}** \`(${id})\`\n 🎀 *Materiales:* ${mats}\n\n`;
            }

            const listEmbed = new EmbedBuilder()
                .setTitle('🛠️ ‧₊˚ Taller Artesanal Rockstar ˚₊‧ 🛠️')
                .setColor('#FFB6C1')
                .setThumbnail('https://i.pinimg.com/originals/de/13/8d/de138d68962534575975d4f7c975a5c5.gif')
                .setDescription(
                    `*“Creando tesoros con manos de seda...”* ✨\n\n` +
                    `୨୧ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ୨୧\n\n` +
                    `${listaRecetas}` +
                    `୨୧ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ୨୧\n\n` +
                    `💡 **Tip:** Usa \`/craft [id]\` para fabricar un item.`
                )
                .setTimestamp()
                .setFooter({ text: `Consultado por: ${member.displayName} ♡`, iconURL: interaction.user.displayAvatarURL() });

            return interaction.reply({ embeds: [listEmbed] });
        }

        const recipe = recipes[itemToCraft];
        if (!recipe) return interaction.reply({ content: "╰┈➤ 🌸 **¡Oh no!** Esa receta no existe en mi librito rosa.", ephemeral: true });

        // --- 🛡️ VERIFICAR MATERIALES ---
        // Aseguramos que data.inventory sea un objeto
        if (!data.inventory) data.inventory = []; 
        
        // Nota: Si tu inventario es un Array de objetos, esta lógica cambia, 
        // pero asumiendo que es un objeto de cantidades:
        for (const mat in recipe.materials) {
            const cantidadPoseida = data.inventory[mat] || 0;
            if (cantidadPoseida < recipe.materials[mat]) {
                return interaction.reply({ content: `╰┈➤ ❌ **${member.displayName}**, te falta un poquito de **${mat}** para completar esto.`, ephemeral: true });
            }
        }

        // --- 🎲 LÓGICA DE FALLO ---
        const isPremium = data.premiumType !== 'none';
        const failChance = isPremium ? 0.10 : 0.30; 
        const random = Math.random();

        // Consumir materiales
        for (const mat in recipe.materials) {
            data.inventory[mat] -= recipe.materials[mat];
        }

        // --- 💥 RESULTADO: FALLO ---
        if (random < failChance) {
            await updateUserData(userId, { inventory: data.inventory });
            const failEmbed = new EmbedBuilder()
                .setTitle('💥 ‧₊˚ ¡Algo salió mal! ˚₊‧ 💥')
                .setColor('#FF9AA2')
                .setThumbnail('https://i.pinimg.com/originals/f3/f5/63/f3f56363a0336215707a276856037e81.gif')
                .setDescription(
                    `*“Un pequeño error en el taller...”* 🌸\n\n` +
                    `୨୧ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ୨୧\n\n` +
                    `╰┈➤ Lo siento, **${member.displayName}**, el crafteo falló.\n` +
                    `╰┈➤ Los materiales se han perdido en el proceso.\n\n` +
                    `🎀 *${isPremium ? 'Tu seguro Premium redujo el riesgo, ¡no te rindas!' : '¡Los usuarios Premium tienen menos riesgo de fallo!'}*\n\n` +
                    `୨୧ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ୨୧`
                )
                .setFooter({ text: `Intento de: ${member.displayName} ♡` });

            return interaction.reply({ embeds: [failEmbed] });
        }

        // --- ✨ RESULTADO: ÉXITO ---
        data.inventory[itemToCraft] = (data.inventory[itemToCraft] || 0) + 1;
        
        // Guardamos cambios
        await updateUserData(userId, { inventory: data.inventory });
        
        // Sistema de XP (Usando la nueva función de userManager)
        const xpResult = await addXP(userId, 150, interaction.client);

        const successEmbed = new EmbedBuilder()
            .setTitle('✨ ‧₊˚ ¡Creación Exitosa! ˚₊‧ ✨')
            .setColor('#B5EAD7')
            .setThumbnail('https://i.pinimg.com/originals/6d/6d/0a/6d6d0a7a37936a2818619623c21a147a.gif')
            .setDescription(
                `*“¡Ha quedado precioso!”* ⚒️🎀\n\n` +
                `୨୧ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ୨୧\n\n` +
                `🌸 **Objeto:** \`${recipe.name}\`\n` +
                `💎 **Bonus:** \`+150 XP\`\n` +
                `✨ **Estado:** \`¡Listo para usar!\`${xpResult.leveledUp ? `\n\n${emojis.pinkstars || '⭐'} **¡LEVEL UP!** Ahora eres nivel **${xpResult.level}**` : ''}\n\n` +
                `୨୧ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ୨୧\n\n` +
                `╰┈➤ *¡Eres una artesana Rockstar increíble!*`
            )
            .setFooter({ text: `Creado por: ${member.displayName} ♡` });

        return interaction.reply({ embeds: [successEmbed] });
    }
};