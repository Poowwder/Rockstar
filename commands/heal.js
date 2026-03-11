const { PermissionFlagsBits } = require('discord.js');
const { updateUserData, getUserData } = require('../userManager.js');

module.exports = {
    name: 'heal',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;

        const target = message.mentions.users.first() || message.author;
        let data = await getUserData(target.id);

        data.health = 3; // Reset manual a 3
        await updateUserData(target.id, data);

        message.reply(`✨ El aura de **${target.username}** ha sido restaurada. Corazones: ❤️ **3 / 3**`);
    }
};
