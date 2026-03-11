const { runReaction } = require('../utils/acctionHandler.js');
module.exports = {
    name: 'paint', description: 'Le pinto la cara a 🖌️', category: 'interacción',
    async execute(input) {
        const result = await runReaction(input, 'paint');
        await input.reply(result);
    }
};
