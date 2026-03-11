const { runAction } = require('../utils/actionHandler.js');
module.exports = {
    name: 'sape', description: 'Dale un buen sape a alguien', category: 'interacción',
    async execute(input) {
        const target = input.mentions.users.first();
        if (!target) return input.reply({ content: "❌ Las sombras exigen que menciones a un objetivo.", ephemeral: true });
        
        // ✅ Corregido: ahora dice 'sape' y no 'bully'
        const result = await runAction(input, 'sape', target);
        await input.reply(result);
    }
};
