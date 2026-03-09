const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../userManager.js');

module.exports = {
    name: 'fish',
    data: new SlashCommandBuilder().setName('fish').setDescription('🎣 Pesca Estelar'),
    async execute(input) {
        const user = input.user || input.author;
        let data = await getUserData(user.id);
        if (data.health <= 0) return input.reply("💀 Estás agotada. Ve a descansar.");

        const tieneCana = data.inventory?.some(i => i.toLowerCase().includes('caña'));
        if (!tieneCana) return input.reply("🎣 No tienes una caña.");

        let cooldown = 300000, riesgo = 0.15, multa = 0.10, vidasP = 2, boost = 1;
        if (data.premiumType === 'mensual') { cooldown = 120000; riesgo = 0.10; multa = 0.05; vidasP = 1; boost = 5; }
        if (data.premiumType === 'bimestral') { cooldown = 0; riesgo = 0.05; multa = 0; vidasP = 0.5; boost = 8; }

        if (cooldown > 0 && Date.now() - (data.lastFish || 0) < cooldown) return input.reply("⏳ El mar está picado, espera.");

        if (Math.random() < riesgo) {
            data.health -= vidasP;
            const perdida = Math.floor(data.wallet * multa);
            data.wallet -= perdida;
            await updateUserData(user.id, data);
            return input.reply("🌊 ¡Una ola te golpeó! Perdiste salud y dinero.");
        }

        let gana = Math.floor(Math.random() * 500 + 700) * boost;
        data.wallet += gana;
        data.lastFish = Date.now();
        await updateUserData(user.id, data);
        input.reply(`🎣 Pescaste un pez de **${gana}** flores. ❤️ Vidas: ${data.health.toFixed(1)}`);
    }
};