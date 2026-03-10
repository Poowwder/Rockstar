const { runReaction } = require('../utils/reactionHandler.js');
module.exports = {
    name: 'happy', description: 'Estás feliz ✨', category: 'reacción',
    async execute(input) {
        const result = await runReaction(input, 'happy');
        await input.reply(result);
    }
};
