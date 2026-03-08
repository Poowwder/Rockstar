const { EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../economyManager.js');
const zones = require('../data/fish_zones.json');

module.exports = {
    name: 'fish',
    aliases: ['pescar', 'p'],
    async execute(message, args) {
        const userId = message.author.id;
        let data = await getUserData(userId);

        if (!data) return message.reply("❌ Error al conectar con tu perfil de Rockstar.");

        const chosenZoneKey = args[0]?.toLowerCase();
        
        // 1. Mostrar Menú si no hay argumentos o la zona no existe
        if (!chosenZoneKey || !zones[chosenZoneKey]) {
            let menu = "";
            for (const key in zones) {
                const z = zones[key];
                const status = z.premium ? " [⭐ VIP]" : "";
                menu += `**${z.emoji} ${key.toUpperCase()}** - ${z.name}${status}\n`;
            }
            
            const menuEmbed = new EmbedBuilder()
                .setTitle("🎣 ¿Dónde quieres lanzar la caña?")
                .setDescription(`Usa \`!!fish [zona]\` para comenzar.\n\n${menu}`)
                .setColor("#FFB6C1")
                .setThumbnail('https://i.pinimg.com/originals/a1/39/33/a139333918f0f00f0732e92c3008889b.gif')
                .setFooter({ text: "¡Las zonas VIP tienen jefes legendarios!" });

            return message.reply({ embeds: [menuEmbed] });
        }

        const zone = zones[chosenZoneKey];

        // 2. Verificación Premium para zonas VIP
        if (zone.premium && data.premiumType === 'none') {
            return message.reply({
                embeds: [new EmbedBuilder()
                    .setTitle("🔒 Zona Restringida")
                    .setDescription("¡Lo siento, linda! Esta zona mágica es solo para **Miembros Premium**. ✨")
                    .setColor("#FF0000")
                    .setThumbnail('https://i.pinimg.com/originals/82/01/9a/82019adb656911f93e9a18017e810a9c.gif')]
            });
        }

        // 3. Lógica de JEFE (Boss)
        const bossRoll = Math.random() * 100;
        if (bossRoll <= zone.boss.chance) {
            data.wallet += zone.boss.reward;
            await updateUserData(userId, data);

            return message.reply({
                embeds: [new EmbedBuilder()
                    .setTitle(`🔱 ¡HA APARECIDO UN JEFE: ${zone.boss.name.toUpperCase()}!`)
                    .setDescription(`¡Increíble! Has logrado domar a la criatura y has encontrado un tesoro oculto de **${zone.boss.reward.toLocaleString()}** flores. 🌸`)
                    .setThumbnail('https://i.pinimg.com/originals/0f/b1/70/0fb17019192ba8cf37119da45046059c.gif') // GIF de jefe/marino
                    .setColor("#00fbff")
                    .setFooter({ text: `Nueva Cartera: ${data.wallet.toLocaleString()} flores` })]
            });
        }

        // 4. Lógica de Pesca Normal
        const pez = zone.fish[Math.floor(Math.random() * zone.fish.length)];
        const ganancia = Math.floor(Math.random() * (zone.max_reward - zone.min_reward + 1)) + zone.min_reward;

        data.wallet += ganancia;
        await updateUserData(userId, data);

        const successEmbed = new EmbedBuilder()
            .setAuthor({ 
                name: `🎣 Pesca en ${zone.name}`, 
                iconURL: message.author.displayAvatarURL({ dynamic: true }) 
            })
            .setDescription(`¡Has atrapado un **${pez}**!\n\n✨ Lo vendiste en el mercado por **${ganancia.toLocaleString()}** flores.`)
            .setColor(zone.premium ? "#E1ADFF" : "#FFB6C1")
            .setThumbnail('https://i.pinimg.com/originals/11/be/f3/11bef32f170ef563391786c5f782c58a.gif')
            .setFooter({ text: `Cartera: ${data.wallet.toLocaleString()} flores` })
            .setTimestamp();

        message.reply({ embeds: [successEmbed] });
    }
};