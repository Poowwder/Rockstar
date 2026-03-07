const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    MessageFlags, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle 
} = require('discord.js');
const { getUserData, updateUserData, checkAndSetCooldown, addItemToInventory } = require('../economyManager.js');

const ICONS = { mine: '⛏️', money: '🌸', boss: '💀', heart: '❤️', sword: '⚔️', shield: '🛡️', flash: '⚡', miss: '💨', loot: '🎁' };

// Configuración de Jefes con sus materiales raros
const BOSSES = {
    comun: { 
        name: 'Gólem de Piedra', hp: 120, dmg: 15, reward: 1500, special: 'Aplastamiento',
        rareLoot: { id: 'fragmento_piedra_antigua', name: 'Fragmento de Piedra Antigua', chance: 0.10 } 
    },
    profunda: { 
        name: 'Espíritu de la Mina', hp: 250, dmg: 28, reward: 4500, special: 'Drenaje de Alma',
        rareLoot: { id: 'esencia_oscura', name: 'Esencia Oscura', chance: 0.15 } 
    },
    volcan: { 
        name: 'Guardián Volcánico', hp: 600, dmg: 50, reward: 15000, special: 'Erupción Solar',
        rareLoot: { id: 'nucleo_magma', name: 'Núcleo de Magma', chance: 0.20 } 
    }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('minar')
        .setDescription('Mina recursos, lucha contra jefes y obtén materiales míticos'),
    
    async execute(interaction) {
        const userId = interaction.user.id;
        const data = getUserData(userId);

        const cooldown = checkAndSetCooldown(userId, 'mine', 60);
        if (cooldown > 0) return interaction.reply({ content: `⏱️ Espera ${cooldown}s.`, flags: MessageFlags.Ephemeral });
        if (!data.equippedPick) return interaction.reply({ content: `❌ No tienes un pico equipado.`, flags: MessageFlags.Ephemeral });

        const isPremium = data.subscription?.active || false;
        const subTier = data.subscription?.tier || 'none';
        
        // Multiplicadores Premium (x5 o x8)
        const moneyMult = isPremium ? (subTier === 'ultra' ? 8 : 5) : 1;
        const luckMult = isPremium ? (subTier === 'ultra' ? 8 : 5) : 1;

        // Selección de zona
        const zoneId = data.equippedPick.level >= 20 ? 'volcan' : (data.equippedPick.level >= 10 ? 'profunda' : 'comun');
        
        // Probabilidad de encuentro con Jefe
        if (Math.random() < (0.08 * luckMult)) {
            return await startBossFight(interaction, data, BOSSES[zoneId], moneyMult, luckMult, isPremium);
        }

        // Minería estándar
        const gain = Math.floor((Math.random() * 50 + 20) * moneyMult);
        data.wallet += gain;
        updateUserData(userId, data);
        return interaction.reply(`⛏️ Has minado en la zona **${zoneId}** y ganaste **${gain}** ${ICONS.money}`);
    }
};

async function startBossFight(interaction, userData, boss, moneyMult, luckMult, isPremium) {
    let userHp = 100 + (userData.level * 10);
    let bossHp = boss.hp;
    let turnCount = 0;
    const userId = interaction.user.id;

    const getEmbed = (log, color = '#e74c3c') => new EmbedBuilder()
        .setTitle(`${ICONS.boss} COMBATE: ${boss.name}`)
        .setColor(color)
        .setDescription(`${log}\n\n${ICONS.heart} **Tu Vida:** \`${userHp}\`\n${ICONS.boss} **Vida Jefe:** \`${bossHp}\``)
        .setFooter({ text: `Turno: ${turnCount} | ${isPremium ? '✨ Beneficios Premium Activos' : 'Suerte normal'}` });

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('atk').setLabel('Atacar').setEmoji('⚔️').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('def').setLabel('Defender').setEmoji('🛡️').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('run').setLabel('Huir').setStyle(ButtonStyle.Secondary)
    );

    const message = await interaction.reply({ embeds: [getEmbed('¡El jefe protege los materiales raros!')], components: [row], fetchReply: true });

    const collector = message.createMessageComponentCollector({ filter: i => i.user.id === userId, time: 120000 });

    collector.on('collect', async i => {
        turnCount++;
        let log = '';
        let userDmg = Math.floor(Math.random() * 15) + (userData.equippedPick.level * 3);
        let bossDmg = boss.dmg;
        
        // Probabilidad de fallo
        const didMiss = Math.random() < (isPremium ? 0.05 : 0.20);
        
        // Ataque Especial cada 3 turnos
        if (turnCount % 3 === 0) {
            bossDmg = Math.floor(bossDmg * 1.8);
            log += `${ICONS.flash} **¡ATAQUE ESPECIAL: ${boss.special}!**\n`;
        }

        if (i.customId === 'atk') {
            if (didMiss) {
                userHp -= bossDmg;
                log += `${ICONS.miss} ¡Fallaste! El jefe te golpeó por **${bossDmg}**.`;
            } else {
                if (isPremium && userData.activePet) userDmg += Math.floor(userDmg * 0.3);
                bossHp -= userDmg;
                userHp -= bossDmg;
                log += `💥 Hiciste **${userDmg}** dmg.\n🥊 Recibiste **${bossDmg}** dmg.`;
            }
        } 
        else if (i.customId === 'def') {
            const block = turnCount % 3 === 0 ? 0.4 : 0.8;
            const blocked = Math.floor(bossDmg * block);
            userHp -= (bossDmg - blocked);
            log += `🛡️ Bloqueaste **${blocked}** dmg. Recibiste **${bossDmg - blocked}**.`;
        } 
        else if (i.customId === 'run') {
            await i.update({ embeds: [getEmbed('🏃 Huiste del combate...', '#95a5a6')], components: [] });
            return collector.stop();
        }

        // --- Resultado de la pelea ---
        if (bossHp <= 0) {
            const finalMoney = Math.floor(boss.reward * moneyMult);
            userData.wallet += finalMoney;
            
            let lootLog = `🏆 **¡VICTORIA!** Ganaste **${finalMoney}** ${ICONS.money}`;
            
            // Lógica de Loot Raro (Afectado por LuckMult)
            const dropChance = boss.rareLoot.chance * (isPremium ? (luckMult / 2) : 1);
            if (Math.random() < dropChance) {
                addItemToInventory(userId, boss.rareLoot.id, 1);
                lootLog += `\n${ICONS.loot} **¡BOTÍN RARO!** Obtuviste: \`${boss.rareLoot.name}\` (Material Mítico)`;
            }

            updateUserData(userId, userData);
            await i.update({ embeds: [getEmbed(lootLog, '#2ecc71')], components: [] });
            return collector.stop();
        }

        if (userHp <= 0) {
            await i.update({ embeds: [getEmbed(`💀 **DERROTA.** El jefe te ha vencido.`, '#000000')], components: [] });
            return collector.stop();
        }

        await i.update({ embeds: [getEmbed(log)] });
    });
}