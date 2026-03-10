const { runReaction } = require('../utils/reactionHandler.js');

module.exports = {
    name: 'dodge',
    description: 'Esquiva la situación con estilo 💨',
    category: 'reacción',
    async execute(input) {
        const result = await runReaction(input, 'dodge');
        await input.reply(result);
    }
};
