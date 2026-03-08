const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: 'ping',
    category: 'información',
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Mira la latencia del bot'),
    async execute(input) {
        const msg = `📡 Pong! Latencia: **${input.client.ws.ping}ms**`;
        if (input.reply && input.user) return input.reply({ content: msg, ephemeral: true });
        return input.reply(msg);
    }
};