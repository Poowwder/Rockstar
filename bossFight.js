const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { getUserData, updateUserData, checkAndSetCooldown, addItemToInventory, hasActiveBoost} = require('../../economyManager.js');
const fs = require('fs');
const path = require('path');
const ICONS = {
    mine: '⛏️',
    money: '🌸',
    error: '❌',
	premium: '⭐'
};

const COLORS = {
    primary: '#FFB6C1',
    success: '#A7D7C5',
    warning: '#F7DBA7',
    error: '#FF6961'
};

const getFishingRods = () => {
    const p = path.join(__dirname, '../data/fishing_bosses.json');
    return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : {};
};

const getFishingRods = () => {
    const p = path.join(__dirname, '../data/fishing_rods.json');
    return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : {};
};

    data: new SlashCommandBuilder()
        .setName('boss_fight')
        .setDescription('Pelea contra el boss.'),
    category: 'currency',
    async execute(interaction) {

        const user = interaction.user;
        const userId = user.id;



		

        const fishingRods = getFishingRods();

		const data = getUserData(userId);





        const fishingRods = getFishingRods();

        await interaction.followUp('testing');
   }