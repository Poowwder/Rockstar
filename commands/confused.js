const { runReaction } = require('../utils/reactionHandler.js');
module.exports = {
    name: 'confused', description: 'Estás confundida ❓', category: 'reacción',
    async execute(input) {
        const result = await runReaction(input, 'confused');
        await input.reply(result);
    }
};
