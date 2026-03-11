const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../userManager.js');
const fs = require('fs');
const path = require('path');

// --- ⚙️ CONFIGURACIÓN ---
const questsPath = path.join(__dirname, '../data/quests.json');
const ICONS = { quest: '📜', money: '🌸', reward: '🎁', complete: '✅', error: '❌', progress: '⏳' };
const COLORS = { primary: '#1a1a1a', success: '#A7D7C5', error: '#FF6961' };

const getQuests = () => {
    return fs.existsSync(questsPath) ? JSON.parse(fs.readFileSync(questsPath, 'utf8')) : {};
};

module.exports = {
    name: 'quest',
    aliases: ['misiones', 'mision', 'q'],
    description: '📜 Gestiona tus misiones diarias.',
    category: 'economía',
    data: new SlashCommandBuilder()
        .setName('quest')
        .setDescription('Gestiona tus misiones diarias.')
        .addSubcommand(sub => sub.setName('view').setDescription('Muestra tu misión diaria actual.'))
        .addSubcommand(sub => sub.setName('complete').setDescription('Reclama tu recompensa.')),

    async execute(input, args) {
        // Soporte para prefijo !!quest view / !!quest complete
        const sub = args[0]?.toLowerCase();
        if (sub === 'view') return this.viewQuest(input);
        if (sub === 'complete') return this.completeQuest(input);
        return input.reply(`╰┈➤ Usar: \`!!quest view\` o \`!!quest complete\``);
    },

    async executeSlash(interaction) {
        const sub = interaction.options.getSubcommand();
        if (sub === 'view') return this.viewQuest(interaction);
        if (sub === 'complete') return this.completeQuest(interaction);
    },

    async viewQuest(ctx) {
        const user = ctx.user || ctx.author;
        let data = await getUserData(user.id);
        const quests = getQuests();
        const today = new Date().toLocaleDateString();

        // Si no hay misiones en el JSON
        if (Object.keys(quests).length === 0) return ctx.reply("❌ No hay misiones configuradas en `quests.json`.");

        // Generar o recuperar misión
        if (!data.dailyQuest || data.dailyQuest.date !== today) {
            const questKeys = Object.keys(quests);
            const randomId = questKeys[Math.floor(Math.random() * questKeys.length)];
            
            data.dailyQuest = {
                id: randomId,
                date: today,
                progress: 0,
                completed: false
            };
            await updateUserData(user.id, data);
        }

        const quest = quests[data.dailyQuest.id];
        const estaCompletada = data.dailyQuest.progress >= quest.goal;

        const embed = new EmbedBuilder()
            .setTitle(`${ICONS.quest} Misión de Hoy`)
            .setColor(estaCompletada ? COLORS.success : COLORS.primary)
            .setThumbnail('https://i.pinimg.com/originals/82/30/9b/82309b858e723525565349f481c0f065.gif')
            .setDescription(
                `**${quest.name}**\n` +
                `*“${quest.description}”*\n\n` +
                `${ICONS.progress} **Progreso:** \`[${data.dailyQuest.progress} / ${quest.goal}]\`\n` +
                `**Recompensa:** \`${quest.reward.money} 🌸\` y \`${quest.reward.quantity}x ${quest.reward.item}\``
            )
            .setFooter({ text: data.dailyQuest.completed ? '✅ Ya reclamaste esta recompensa.' : 'Usa /quest complete cuando termines.' });

        await ctx.reply({ embeds: [embed] });
    },

    async completeQuest(ctx) {
        const user = ctx.user || ctx.author;
        let data = await getUserData(user.id);
        const quests = getQuests();
        const today = new Date().toLocaleDateString();

        if (!data.dailyQuest || data.dailyQuest.date !== today) {
            return ctx.reply(`${ICONS.error} No tienes una misión activa hoy. Usa \`/quest view\`.`);
        }

        if (data.dailyQuest.completed) {
            return ctx.reply(`${ICONS.error} Ya reclamaste los premios de hoy.`);
        }

        const quest = quests[data.dailyQuest.id];

        if (data.dailyQuest.progress < quest.goal) {
            return ctx.reply(`${ICONS.error} Aún te falta progreso. \`[${data.dailyQuest.progress}/${quest.goal}]\``);
        }

        // --- 🎁 ENTREGAR PREMIOS ---
        data.wallet = (data.wallet || 0) + quest.reward.money;
        
        if (!data.inventory) data.inventory = {};
        data.inventory[quest.reward.item] = (data.inventory[quest.reward.item] || 0) + quest.reward.quantity;
        
        data.dailyQuest.completed = true;
        await updateUserData(user.id, data);

        const embed = new EmbedBuilder()
            .setTitle(`${ICONS.complete} ¡Misión Cumplida!`)
            .setColor(COLORS.success)
            .setDescription(
                `Has demostrado tu valía, **${user.username}**.\n\n` +
                `**Has recibido:**\n` +
                `╰┈➤ \`${quest.reward.money} 🌸\` flores.\n` +
                `╰┈➤ \`${quest.reward.quantity}x ${quest.reward.item}\` para tu mochila.`
            );

        await ctx.reply({ embeds: [embed] });
    }
};
