const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../userManager.js');

module.exports = {
    name: 'fish',
    category: 'economia',
    async execute(input) {
        const isSlash = !input.author;
        const user = isSlash ? input.user : input.author;
        let data = await getUserData(user.id);

        if (data.health === undefined || data.health <= 0) data.health = 3;

        let riesgo = 0.15; 
        let daño = 1; 

        if (data.premiumType === 'pro') { 
            riesgo = 0.10; 
            daño = 0.5; 
        } else if (data.premiumType === 'ultra') { 
            riesgo = 0.05; 
            daño = 0.3; 
        }

        // --- 🌊 LÓGICA DE MUERTE ---
        if (Math.random() < riesgo) {
            data.health -= daño;
            let mensajeMuerte = `Las olas te han restado **${daño}** vida(s). ❤️ Restantes: \`${data.health.toFixed(1)}\``;

            if (data.health <= 0) {
                data.health = 3;
                mensajeMuerte = "💀 **Te has ahogado en el abismo.** Las corrientes te devuelven a la orilla con una nueva existencia.";
            }

            await updateUserData(user.id, { health: data.health, lastFish: Date.now() });
            return input.reply({
                embeds: [new EmbedBuilder()
                    .setTitle('🌊 ¡Marea Letal!')
                    .setColor('#1a1a1a')
                    .setDescription(mensajeMuerte)]
            });
        }
        
        // --- ✨ PESCA EXITOSA ---
        // (Resto del código de recompensas...)
    }
};
