const { runReaction } = require('../utils/reactionHandler.js');
module.exports = {
    name: 'laugh', description: 'Ríete un poco 😂', category: 'reacción',
    async execute(input) {
        const result = await runReaction(input, 'laugh');
        await input.reply(result);
    }
};
