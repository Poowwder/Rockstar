const { runReaction } = require('../utils/reactionHandler.js');
module.exports = {
    name: 'run', description: '¡Corre! 🏃‍♀️', category: 'reacción',
    async execute(input) {
        const result = await runReaction(input, 'run');
        await input.reply(result);
    }
};
