const { runReaction } = require('../utils/reactionHandler.js');
module.exports = {
    name: 'shrug', description: 'Encógete de hombros 🤷‍♀️', category: 'reacción',
    async execute(input) {
        const result = await runReaction(input, 'shrug');
        await input.reply(result);
    }
};
