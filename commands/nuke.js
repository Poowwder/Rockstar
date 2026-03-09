const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'nuke',
    async execute(message) {
        if (!message.member.permissions.has('ManageChannels')) return message.reply('🌸 No puedes hacer eso.');
        const pos = message.channel.position;
        const newChan = await message.channel.clone();
        await message.channel.delete();
        await newChan.setPosition(pos);
        await newChan.send({ embeds: [new EmbedBuilder().setColor('#FFB6C1').setTitle('💥 Canal Reconstruido').setImage('https://i.imgur.com/8N7An9V.gif')] });
    }
};