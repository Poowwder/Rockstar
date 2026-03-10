const { runAction } = require('../utils/actionHandler.js');
module.exports = {
    name: 'spray', description: 'Rocía a alguien', category: 'interacción',
    async execute(input) {
        const target = input.mentions.users.first();
        if (!target) return input.reply({ content: "❌ Las sombras exigen que menciones a un objetivo.", ephemeral: true });
        const result = await runAction(input, 'spray', target);
        await input.reply(result);
    }
};
