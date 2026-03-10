const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../userManager.js');

module.exports = {
    name: 'mine',
    category: 'economia',
    async execute(input) {
        const isSlash = !input.author;
        const user = isSlash ? input.user : input.author;
        let data = await getUserData(user.id);

        // --- ⚙️ LÓGICA DE VIDAS Y RIESGOS ---
        if (data.health === undefined || data.health <= 0) data.health = 3;
        
        let riesgo = 0.15; // 15% Normal
        let daño = 1;      // Pierde 1 vida entera
        
        if (data.premiumType === 'pro') { 
            riesgo = 0.10; 
            daño = 0.5; 
        } else if (data.premiumType === 'ultra') { 
            riesgo = 0.05; 
            daño = 0.3; 
        }

        // --- 💥 LÓGICA DE MUERTE ---
        if (Math.random() < riesgo) {
            data.health -= daño;
            let mensajeMuerte = `Has perdido **${daño}** vida(s). ❤️ Restantes: \`${data.health.toFixed(1)}\``;
            
            if (data.health <= 0) {
                data.health = 3; // Revive automáticamente
                mensajeMuerte = "💀 **Has muerto en las profundidades.** Tus pertenencias se han perdido entre los escombros y has renacido en el nexo.";
            }

            await updateUserData(user.id, { health: data.health, lastMine: Date.now() });
            return input.reply({
                embeds: [new EmbedBuilder()
                    .setTitle('💥 ¡Derrumbe Fatal!')
                    .setColor('#1a1a1a')
                    .setDescription(mensajeMuerte)]
            });
        }

        // --- ✨ EXTRACCIÓN EXITOSA ---
        // (Aquí iría el resto del código de recompensas que ya tenemos...)
        // Al final del éxito, solo asegúrate de mostrar las vidas actuales:
        // .setDescription(`... \n\n ❤️ **Vidas:** \`${data.health.toFixed(1)}/3\``)
    }
};
