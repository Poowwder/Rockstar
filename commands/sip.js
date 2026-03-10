const { runReaction } = require('../utils/reactionHandler.js');
module.exports = {
    name: 'sip', description: 'Bebe algo 🥤', category: 'reacción',
    async execute(input) {
        const result = await runReaction(input, 'sip');
        await input.reply(result);
    }
};
