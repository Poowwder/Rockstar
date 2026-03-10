const { runReaction } = require('../utils/reactionHandler.js');
module.exports = {
    name: 'boonk', description: '¡Boonk! 💥', category: 'reacción',
    async execute(input) {
        const result = await runReaction(input, 'boonk');
        await input.reply(result);
    }
};
