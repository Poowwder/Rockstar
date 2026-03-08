const { EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../economyManager.js');
const zones = require('../data/mine_zones.json');

module.exports = {
    name: 'mine',
    aliases: ['minar', 'm'],
    async execute(message, args) {
        const userId = message.author.id;
        let data = await getUserData(userId);
        const chosenKey = args[0]?.toLowerCase();

        if (!chosenKey || !zones[chosenKey]) {
            let menu = Object.keys(zones).map(k => `**${zones[k].emoji} ${k.toUpperCase()}** - ${zones[k].name}${zones[k].premium ? " [⭐ VIP]" : ""}`).join("\n");
            return message.reply({ embeds: [new EmbedBuilder().setTitle("⛏️ ¿A dónde irás a minar?").setDescription(menu).setColor("#FFB6C1")] });
        }

        const zone = zones[chosenKey];
        if (zone.premium && data.premiumType === 'none') return message.reply("🔒 ¡Esta cueva es solo para **Usuarios Premium**! ✨");

        // Lógica de JEFE
        const bossChance = Math.random() * 100;
        if (bossChance <= zone.boss.chance) {
            data.wallet += zone.boss.reward;
            await updateUserData(userId, data);
            return message.reply({
                embeds: [new EmbedBuilder()
                    .setTitle(`⚔️ ¡APARECIÓ UN JEFE: ${zone.boss.name}!`)
                    .setDescription(`¡${message.member.displayName}, lograste derrotarlo y saqueaste **${zone.boss.reward.toLocaleString()}** flores! 🌸`)
                    .setThumbnail('https://i.pinimg.com/originals/91/91/36/91913612d35272a0833215f9392e22f2.gif') // GIF de batalla cute
                    .setColor("#FF0000")]
            });
        }

        // Lógica Normal
        const item = zone.items[Math.floor(Math.random() * zone.items.length)];
        const ganancia = Math.floor(Math.random() * (zone.max_reward - zone.min_reward + 1)) + zone.min_reward;
        data.wallet += ganancia;
        await updateUserData(userId, data);

        message.reply({
            embeds: [new EmbedBuilder()
                .setAuthor({ name: `⛏️ Minando en ${zone.name}`, iconURL: message.author.displayAvatarURL() })
                .setDescription(`¡Picaste un **${item}** y ganaste **${ganancia.toLocaleString()}** flores! ✨`)
                .setThumbnail('https://i.pinimg.com/originals/47/34/00/47340078869c9780074215f769493f0b.gif')
                .setColor("#FFB6C1")]
        });
    }
};