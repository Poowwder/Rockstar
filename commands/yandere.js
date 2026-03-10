const { runReaction } = require('../utils/reactionHandler.js');
module.exports = {
    name: 'yandere', description: 'Modo yandere activado 🔪', category: 'reacción',
    async execute(input) {
        const result = await runReaction(input, 'yandere');
        await input.reply(result);
    }
};
