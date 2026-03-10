const { runReaction } = require('../utils/reactionHandler.js');
module.exports = {
    name: 'paint', description: 'Ponte a pintar 🖌️', category: 'reacción',
    async execute(input) {
        const result = await runReaction(input, 'paint');
        await input.reply(result);
    }
};
