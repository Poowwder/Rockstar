const { runReaction } = require('../utils/reactionHandler.js');

module.exports = {
    name: 'angry',
    description: 'Arde de furia 💢',
    category: 'reacción',
    async execute(input) {
        const result = await runReaction(input, 'angry');
        await input.reply(result);
    }
};
