const { runAction } = require('../utils/actionHandler.js');
module.exports = {
    name: 'paint', description: 'Pinta un retrato de alguien', category: 'interacción',
    async execute(input) {
        const target = input.mentions.users.first();
        if (!target) return input.reply({ content: "❌ Las sombras exigen que menciones a un objetivo.", ephemeral: true });
        
        const result = await runAction(input, 'paint', target);
        await input.reply(result);
    }
};
