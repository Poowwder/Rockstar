const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../economyManager.js');
const { addXP } = require('../levelManager.js');
const fs = require('fs');
const path = require('path');

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
        const recipes = JSON.parse(fs.readFileSync(recipesPath, 'utf8'));
        const itemToCraft = interaction.options.getString('item')?.toLowerCase();
        const data = await getUserData(userId);

        // --- MENÚ DE RECETAS AESTHETIC ---
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

        // --- VERIFICAR MATERIALES ---
        for (const mat in recipe.materials) {
            if ((data.inventory[mat] || 0) < recipe.materials[mat]) {
                return interaction.reply({ content: `╰┈➤ ❌ **${member.displayName}**, te falta un poquito de **${mat}** para completar esto.`, ephemeral: true });
            }
        }

        // --- LÓGICA DE FALLO ---
        const isPremium = data.premiumType === 'mensual' || data.premiumType === 'bimestral';
        const failChance = isPremium ? 0.10 : 0.30; // 10% VIP vs 30% Normal
        const random = Math.random();

        // Consumir materiales siempre
        for (const mat in recipe.materials) {
            data.inventory[mat] -= recipe.materials[mat];
        }

        // --- RESULTADO: FALLO ---
        if (random < failChance) {
            await updateUserData(userId, data);
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

        // --- RESULTADO: ÉXITO ---
        data.inventory[itemToCraft] = (data.inventory[itemToCraft] || 0) + 1;
        await updateUserData(userId, data);
        await addXP(userId, 150, interaction, { getUserData, updateUserData });

        const successEmbed = new EmbedBuilder()
            .setTitle('✨ ‧₊˚ ¡Creación Exitosa! ˚₊‧ ✨')
            .setColor('#B5EAD7')
            .setThumbnail('https://i.pinimg.com/originals/6d/6d/0a/6d6d0a7a37936a2818619623c21a147a.gif')
            .setDescription(
                `*“¡Ha quedado precioso!”* ⚒️🎀\n\n` +
                `୨୧ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ୨୧\n\n` +
                `🌸 **Objeto:** \`${recipe.name}\`\n` +
                `💎 **Bonus:** \`+150 XP\`\n` +
                `✨ **Estado:** \`¡Listo para usar!\`\n\n` +
                `୨୧ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ ୨୧\n\n` +
                `╰┈➤ *¡Eres una artesana Rockstar increíble!*`
            )
            .setFooter({ text: `Creado por: ${member.displayName} ♡` });

        return interaction.reply({ embeds: [successEmbed] });
    }
};