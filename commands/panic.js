const { runReaction } = require('../utils/reactionHandler.js');
module.exports = {
    name: 'panic', description: '¡Entra en pánico! 😱', category: 'reacción',
    async execute(input) {
        const result = await runReaction(input, 'panic');
        await input.reply(result);
    }
};
