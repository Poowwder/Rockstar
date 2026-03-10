const { runReaction } = require('../utils/reactionHandler.js');
module.exports = {
    name: 'scared', description: 'Tienes miedo 😨', category: 'reacción',
    async execute(input) {
        const result = await runReaction(input, 'scared');
        await input.reply(result);
    }
};
