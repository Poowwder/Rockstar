const { SlashCommandBuilder } = require('discord.js');
const { runAction } = require('../utils/actionHandler.js');

module.exports = {
    name: 'glare',
    category: 'acción',
    description: 'Mira con desprecio a alguien.',
    data: new SlashCommandBuilder()
        .setName('glare')
        .setDescription('Mira con desprecio a alguien')
        .addUserOption(option => option.setName('usuario').setDescription('El objetivo de tu mirada').setRequired(true)),

    async execute(input, args) {
        const isSlash = !!input.user;
        const target = isSlash ? input.options.getUser('usuario') : input.mentions.users.first();

        if (!target) {
            return input.reply("╰┈➤ ❌ Debes mencionar a alguien para mirarlo así.");
        }

        const result = await runAction(input, 'glare', target);
        return input.reply(result);
    }
};
