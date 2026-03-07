const { SlashCommandBuilder, EmbedBuilder, Collection, MessageFlags } = require('discord.js');
const { getUserData, updateUserData, addItemToInventory } = require('../../economyManager.js');
const fs = require('fs');
const path = require('path');
const ms = require('ms');

const questsDataPath = path.join(__dirname, '../../data/quests.json');
const ICONS = {
    quest: '📜',
    money: '🌸',
    gem: '💎',
    boost: '🚀',
    reward: '🎁',
    complete: '✅',
    error: '❌',
};
const COLORS = {
    primary: '#FFB6C1',
    success: '#A7D7C5',
    warning: '#F7DBA7',
    error: '#FF6961',
    info: '#C8A2C8',
};

function readJSON(filePath) {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify({}, null, 2));
        return {};
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJSON(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

const getQuests = () => {
    const p = path.join(__dirname, '..', '..', 'data/quests.json');
    return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : {};
};


async function createEconomyEmbed(ctx, title, description, color, thumbnailType = 'default') {
    const guildName = ctx.guild ? ctx.guild.name : 'R☆ckstar';
    const guildIcon = ctx.guild ? ctx.guild.iconURL() : null;
    const embed = new EmbedBuilder()
        .setColor(color)
        .setTitle(title)
        .setDescription(description)
        .setThumbnail(THUMBNAILS[thumbnailType] || THUMBNAILS.default)
        .setFooter({ text: guildName, iconURL: guildIcon })
        .setTimestamp();
    return embed;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quest')
        .setDescription('Gestiona tus misiones diarias.')
        .addSubcommand(sub => sub.setName('view').setDescription('Muestra tu misión diaria actual.'))
        .addSubcommand(sub => sub.setName('complete').setDescription('Reclama tu recompensa al completar la misión.')),
    category: 'currency',
    description: 'Gestiona misiones diarias.',
    usage: '!!quest <view|complete>',
    aliases: ['misiones'],
    async execute(message, args) {
        message.reply('Por favor usa los comandos de barra `/quest` para las misiones.');
    },
    async executeSlash(interaction) {
        const sub = interaction.options.getSubcommand();
        if (sub === 'view') return this.viewQuest(interaction);
        if (sub === 'complete') return this.completeQuest(interaction);
    },

    async viewQuest(ctx) {
        const user = ctx.user || ctx.author;
        const data = getUserData(user.id);
        const quests = getQuests();
        const today = new Date().toLocaleDateString();

        if (data.dailyQuest && data.dailyQuest.date === today) {
            // Quest already generated for today
            const quest = quests[data.dailyQuest.id];
            const embed = new EmbedBuilder()
                .setTitle(`${ICONS.quest} Misión Diaria`)
                .setDescription(`**${quest.name}**\n${quest.description}\n\nProgreso: ${data.dailyQuest.progress}/${quest.goal}`)
                .setColor(COLORS.primary)
                .setFooter({ text: 'Vuelve mañana para una nueva misión.' });
            await ctx.reply({ embeds: [embed] });
        } else {
            // Generate a new quest
            const questKeys = Object.keys(quests);
            const randomQuestId = questKeys[Math.floor(Math.random() * questKeys.length)];
            const quest = quests[randomQuestId];

            data.dailyQuest = {
                id: randomQuestId,
                date: today,
                progress: 0,
                completed: false
            };
            updateUserData(user.id, data);

            const embed = new EmbedBuilder()
                .setTitle(`${ICONS.quest} Nueva Misión Diaria`)
                .setDescription(`**${quest.name}**\n${quest.description}\n\nProgreso: 0/${quest.goal}`)
                .setColor(COLORS.primary)
                .setFooter({ text: '¡Empieza hoy mismo!' });
            await ctx.reply({ embeds: [embed] });
        }
    },

    async completeQuest(ctx) {
        const user = ctx.user || ctx.author;
        const data = getUserData(user.id);
        const quests = getQuests();
        const today = new Date().toLocaleDateString();

        if (!data.dailyQuest || data.dailyQuest.date !== today) {
            return ctx.reply({ content: `${ICONS.error} No tienes una misión diaria activa. Usa \`/quest view\` para obtener una.` });
        }

        if (data.dailyQuest.completed) {
            return ctx.reply({ content: `${ICONS.error} Ya has completado tu misión diaria de hoy.` });
        }

        const quest = quests[data.dailyQuest.id];
        if (data.dailyQuest.progress < quest.goal) {
            return ctx.reply({ content: `${ICONS.error} Aún no has completado tu misión. Progreso: ${data.dailyQuest.progress}/${quest.goal}` });
        }

        // Give reward
        data.wallet += quest.reward.money || 0;
        addItemToInventory(user.id, quest.reward.item, quest.reward.quantity || 1);
        data.dailyQuest.completed = true;
        updateUserData(user.id, data);

        let rewardText = `Has recibido tu recompensa:\n`;
        if (quest.reward.money) rewardText += `» ${ICONS.money} ${quest.reward.money}\n`;
        if (quest.reward.item) rewardText += `» ${ICONS.reward} ${quest.reward.quantity || 1}x ${quest.reward.item}\n`;

        const embed = new EmbedBuilder()
            .setTitle(`${ICONS.complete} ¡Misión Diaria Completada!`)
            .setDescription(rewardText)
            .setColor(COLORS.success)
            .setFooter({ text: '¡Bien hecho!' });

        await ctx.reply({ embeds: [embed] });
    }
};