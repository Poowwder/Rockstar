const { runAction } = require('../utils/actionHandler.js');
module.exports = {
    name: 'spank', description: 'Dale una nalgada a alguien', category: 'interacción',
    async execute(input) {
        const target = input.mentions.users.first();
        if (!target) return input.reply({ content: "❌ Las sombras exigen que menciones a un objetivo.", ephemeral: true });
        const result = await runAction(input, 'spank', target);
        await input.reply(result);
    }
};
