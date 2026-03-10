const { runReaction } = require('../utils/reactionHandler.js');
module.exports = {
    name: 'sleep', description: 'Tengo sueño 💤', category: 'reacción',
    async execute(input) {
        const result = await runReaction(input, 'sleep');
        await input.reply(result);
    }
};
