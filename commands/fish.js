const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../userManager.js');
const emojis = require('../utils/emojiHelper.js'); 

module.exports = {
    name: 'fish',
    data: new SlashCommandBuilder().setName('fish').setDescription('🎣 Pesca Estelar Rockstar'),
    async execute(input) {
        const user = input.user || input.author;
        let data = await getUserData(user.id);

        // --- 🛡️ VERIFICACIÓN DE SALUD ---
        if (data.health <= 0) return input.reply("💀 **Estás agotada, linda.** Ve a descansar o compra vidas.");

        // --- 🎣 VERIFICACIÓN DE HERRAMIENTA (Compatible con Recipes/Craft) ---
        // Buscamos las IDs que definiste en tu recipes.json
        const inventory = data.inventory || {};
        const tieneCanaNormal = (inventory['fishing_rod'] || 0) > 0;
        const tieneCanaPro = (inventory['fishing_rod_iron'] || 0) > 0; // Por si craftean la de hierro

        if (!tieneCanaNormal && !tieneCanaPro) {
            return input.reply(`${emojis.exclamation || '⚠️'} **No tienes una caña.** Cómprala en la tienda o fabrica una con \`/craft fishing_rod\`.`);
        }

        // --- ⚙️ CONFIGURACIÓN DE RIESGOS ---
        let cooldown = 300000; // 5 min
        let riesgo = 0.15;
        let multa = 0.10;
        let vidasP = 2;
        let boost = 1;

        if (data.premiumType === 'mensual') { 
            cooldown = 120000; riesgo = 0.10; multa = 0.05; vidasP = 1; boost = 5; 
        } else if (data.premiumType === 'bimestral') { 
            cooldown = 0; riesgo = 0.05; multa = 0; vidasP = 0.5; boost = 8; 
        }

        // --- ⏳ COOLDOWN ---
        const tiempoPasado = Date.now() - (data.lastFish || 0);
        if (cooldown > 0 && tiempoPasado < cooldown) {
            const faltan = Math.ceil((cooldown - tiempoPasado) / 1000);
            return input.reply(`⏳ **El mar está picado.** Vuelve en **${faltan}** segundos, reina.`);
        }

        // --- 🌊 EVENTO: PELIGRO (FALLO) ---
        if (Math.random() < riesgo) {
            const perdida = Math.floor((data.wallet || 0) * multa);
            
            await updateUserData(user.id, {
                health: Math.max(0, data.health - vidasP),
                wallet: Math.max(0, (data.wallet || 0) - perdida),
                lastFish: Date.now()
            });

            return input.reply({ 
                embeds: [
                    new EmbedBuilder()
                        .setTitle('🌊 ¡Ola Gigante!')
                        .setColor('#FF4B4B')
                        .setDescription(`¡Una ola te golpeó! Perdiste **${vidasP}** vidas y **${perdida}** flores.`)
                ] 
            });
        }

        // --- ✨ EVENTO: ÉXITO ---
        let gana = Math.floor(Math.random() * 500 + 700) * boost;
        let mensajeExtra = "";

        // 🛠️ Probabilidad de que la caña se rompa (Desgaste)
        // Solo se rompe la caña normal (la de madera) con más frecuencia
        if (Math.random() < 0.10) { 
            if (tieneCanaNormal) {
                inventory['fishing_rod'] -= 1;
                mensajeExtra = "\n💔 **¡Tu caña se rompió!** Necesitas craftear otra.";
            }
        }

        // Guardamos todo en MongoDB
        await updateUserData(user.id, {
            wallet: (data.wallet || 0) + gana,
            inventory: inventory,
            lastFish: Date.now()
        });

        const embed = new EmbedBuilder()
            .setTitle('🎣 Pesca Exitosa')
            .setColor('#A2D2FF')
            .setThumbnail('https://i.pinimg.com/originals/82/33/83/823383419022630f5b9020942501a5e1.gif')
            .setDescription(
                `¡Pescaste un pez estelar de **${gana}** flores! 🌸\n` +
                `💖 **Vidas:** \`${data.health.toFixed(1)}\`` +
                `${mensajeExtra}`
            )
            .setFooter({ text: `Rockstar Fishing ✨` });

        return input.reply({ embeds: [embed] });
    }
};