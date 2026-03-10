const { runAction } = require('../utils/actionHandler.js');
module.exports = {
    name: 'cuddle', description: 'Acurrúcate con alguien', category: 'interacción',
    async execute(input) {
        const target = input.mentions.users.first();
        if (!target) return input.reply({ content: "❌ Las sombras exigen que menciones a un objetivo.", ephemeral: true });
        const result = await runAction(input, 'cuddle', target);
        await input.reply(result);
    }
};
