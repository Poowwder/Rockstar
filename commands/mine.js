const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../userManager.js');

module.exports = {
    name: 'mine',
    async execute(input) {
        const user = input.author || input.user;
        let data = await getUserData(user.id);

        // --- ⚙️ CONFIGURACIÓN DE RANGOS ---
        if (data.health === undefined) data.health = 3;
        let riesgo = 0.15, daño = 1, pctPerdida = 0.15, pctVidas = 0.60, cooldown = 300000;

        if (data.premiumType === 'pro') { 
            riesgo = 0.10; daño = 0.5; pctPerdida = 0.10; pctVidas = 0.50; cooldown = 120000; 
        } else if (data.premiumType === 'ultra') { 
            riesgo = 0.05; daño = 0.3; pctPerdida = 0.05; pctVidas = 0.20; cooldown = 0; 
        }

        if (cooldown > 0 && Date.now() - (data.lastMine || 0) < cooldown) {
            return input.reply({ content: `⏳ Cooldown activo. Reintenta en \`${Math.ceil((cooldown - (Date.now() - data.lastMine)) / 1000)}s\`.`, ephemeral: true });
        }

        // --- 💀 LÓGICA DE MUERTE ---
        if (Math.random() < riesgo) {
            data.health -= daño;
            if (data.health <= 0) {
                const perdidaDinero = Math.floor((data.wallet || 0) * pctPerdida);
                const vidasPerdidasInv = Math.ceil((data.inventory?.['vidas'] || 0) * pctVidas);
                
                data.wallet -= perdidaDinero;
                data.health = 3;
                if (data.inventory?.['vidas']) data.inventory['vidas'] -= vidasPerdidasInv;

                // Pérdida de materiales
                const mats = ['wood', 'stone', 'iron_ore'];
                mats.forEach(m => { if(data.inventory?.[m]) data.inventory[m] -= Math.ceil(data.inventory[m] * pctPerdida); });

                await updateUserData(user.id, data);
                return input.reply({ embeds: [new EmbedBuilder().setTitle('💀 Muerte en la Mina').setColor('#1a1a1a').setDescription(`Has sucumbido. Perdiste \`${perdidaDinero}\` flores y \`${vidasPerdidasInv}\` vidas del inventario.`)] });
            }
            await updateUserData(user.id, { health: data.health, lastMine: Date.now() });
            return input.reply(`⚠️ **Derrumbe:** Perdiste \`${daño}\` vida. ❤️: \`${data.health.toFixed(1)}/3\``);
        }

        // --- 📂 ZONAS Y PICO ---
        const inv = data.inventory || {};
        const zonas = [
            { id: 'pico_mitico', zona: 'Abismo Eterno', multis: 4 },
            { id: 'pico_hierro', zona: 'Venas de Acero', multis: 1.8 },
            { id: 'pico_madera', zona: 'Gruta Superficial', multis: 1 }
        ];
        if (data.premiumType === 'pro' || data.premiumType === 'ultra') zonas.unshift({ id: 'pico_mitico', zona: '✨ Void Haven', multis: 6, secret: true });

        const mejorPico = zonas.find(z => inv[z.id] > 0 || inv[`${z.id}_repaired`] > 0);
        if (!mejorPico) return input.reply("No tienes herramientas.");

        const flores = Math.floor(Math.random() * 500 + 500) * mejorPico.multis;
        data.wallet = (data.wallet || 0) + flores;
        data.lastMine = Date.now();

        await updateUserData(user.id, data);

        const embed = new EmbedBuilder()
            .setColor('#1a1a1a')
            .setAuthor({ name: `Exploración: ${mejorPico.zona}`, iconURL: user.displayAvatarURL() })
            .setThumbnail(mejorPico.secret ? 'https://i.pinimg.com/originals/7b/0a/61/7b0a61833503b414f6b0f1a91e3e7f91.gif' : 'https://i.pinimg.com/originals/30/85/6a/30856a9080b06b0b009e86749fcb186b.gif')
            .setDescription(`> *“El silencio de la piedra es tu único aliado.”*\n\n💰 **Ganancia:** \`${flores.toFixed(0)}\` flores\n❤️ **Vitalidad:** \`${data.health.toFixed(1)}/3\``);

        return input.reply({ embeds: [embed] });
    }
};
