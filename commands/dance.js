const { runReaction } = require('../utils/reactionHandler.js');

module.exports = {
    name: 'dance',
    description: 'Déjate llevar por el ritmo 💃',
    category: 'reacción',
    async execute(input) {
        const result = await runReaction(input, 'dance');
        await input.reply(result);
    }
};
