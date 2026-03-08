const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../economyManager.js');

module.exports = {
    name: 'gift',
    data: new SlashCommandBuilder()
        .setName('gift')
        .setDescription('🎁 Regala un objeto de tu inventario')
        .addUserOption(o => o.setName('usuario').setDescription('¿Para quién es?').setRequired(true))
        .addStringOption(o => o.setName('item').setDescription('Nombre del objeto').setRequired(true)),

    async execute(input) {
        const isSlash = !!input.user;
        const author = isSlash ? input.user : input.author;
        const target = isSlash ? input.options.getUser('usuario') : input.mentions.users.first();
        const itemName = isSlash ? input.options.getString('item').toLowerCase() : input.content.split(/ +/).slice(2).join(' ');

        let senderData = await getUserData(author.id);
        const itemIndex = senderData.inventory?.findIndex(i => i.toLowerCase() === itemName);

        if (itemIndex === -1 || itemIndex === undefined) return input.reply("❌ No tienes ese objeto en tu inventario.");
        
        let targetData = await getUserData(target.id);
        if (!targetData.inventory) targetData.inventory = [];

        const itemRealName = senderData.inventory.splice(itemIndex, 1)[0];
        targetData.inventory.push(itemRealName);

        await updateUserData(author.id, senderData);
        await updateUserData(target.id, targetData);

        return input.reply(`🎁 **${input.member.displayName}** le regaló un **${itemRealName}** a **${input.guild.members.cache.get(target.id).displayName}**! ✨`);
    }
};