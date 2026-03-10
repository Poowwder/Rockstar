const { runReaction } = require('../utils/reactionHandler.js');
module.exports = {
    name: 'hi', description: 'Dí hola! 👋', category: 'reacción',
    async execute(input) {
        const result = await runReaction(input, 'hi');
        await input.reply(result);
    }
};
