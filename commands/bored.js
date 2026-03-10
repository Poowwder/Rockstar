const { runReaction } = require('../utils/reactionHandler.js');
module.exports = {
    name: 'bored', description: 'Estás aburrida 😑', category: 'reacción',
    async execute(input) {
        const result = await runReaction(input, 'bored');
        await input.reply(result);
    }
};
