const { runReaction } = require('../utils/reactionHandler.js');
module.exports = {
    name: 'grafitti', description: 'Haz un graffiti 🎨', category: 'reacción',
    async execute(input) {
        const result = await runReaction(input, 'grafitti');
        await input.reply(result);
    }
};
