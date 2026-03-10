const { runReaction } = require('../utils/reactionHandler.js');
module.exports = {
    name: 'dere', description: '¡Estás muy enamorada! 💕', category: 'reacción',
    async execute(input) {
        const result = await runReaction(input, 'dere');
        await input.reply(result);
    }
};
