const Neko = require('../models/nekoSchema');

async function checkNekos(message, type) {
    const userId = message.author ? message.author.id : message.user.id;
    const guildId = message.guild.id;

    try {
        // Usamos returnDocument: 'after' para cumplir con las nuevas versiones de Mongoose
        let userNeko = await Neko.findOneAndUpdate(
            { userId, guildId },
            { $setOnInsert: { userId, guildId } },
            { upsert: true, returnDocument: 'after' }
        );

        if (type === 'message') {
            userNeko.activityPoints += 1;
        } else if (type === 'action') {
            userNeko.actionPoints += 1;
        }

        // Sistema de niveles simple (ejemplo)
        const nextLevel = userNeko.level * 50;
        if (userNeko.activityPoints >= nextLevel) {
            userNeko.level += 1;
        }

        await userNeko.save();
    } catch (error) {
        console.error('❌ Error en checkNekos:', error);
    }
}

module.exports = { checkNekos };