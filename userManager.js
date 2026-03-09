const mongoose = require('mongoose');
const { EmbedBuilder } = require('discord.js');

const UserSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    wallet: { type: Number, default: 0 },
    bank: { type: Number, default: 0 },
    health: { type: Number, default: 3 }, 
    deadCount: { type: Number, default: 0 }, 
    premiumType: { type: String, default: 'none' }, 
    premiumUntil: { type: Date, default: null },
    lastMine: { type: Date, default: null },
    lastFish: { type: Date, default: null },
    lastCrime: { type: Date, default: null },
    lastRob: { type: Date, default: null },
    harem: { type: Array, default: [] },
    inventory: { type: Array, default: [] },
    marryId: { type: String, default: null }, // ❤️ Añadido para matrimonios
    
    // --- 📈 NIVELES Y ACTIVIDAD ---
    xp: { type: Number, default: 0 },         // ✨ XP actual
    level: { type: Number, default: 1 },      // 🆙 Nivel actual
    interactionsCount: { type: Number, default: 0 }, 
    messageCount: { type: Number, default: 0 },      
    
    // --- 🐾 NEKOS ---
    nekos: {
        solas: { type: Boolean, default: false },
        nyx: { type: Boolean, default: false },
        mizuki: { type: Boolean, default: false },
        astra: { type: Boolean, default: false },
        koko: { type: Boolean, default: false }
    }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

// --- 📈 FUNCIÓN DE XP Y NIVELES ---
async function addXP(userId, amount, client) {
    let user = await User.findOne({ userId });
    if (!user) user = await User.create({ userId });

    user.xp += amount;
    const nextLevelXP = user.level * 500; // Cada nivel pide 500 más

    if (user.xp >= nextLevelXP) {
        user.level += 1;
        user.xp = 0;
        
        // 🌑 Verificación de Neko Nyx (Nivel 10)
        if (user.level === 10 && !user.nekos.nyx) {
            await grantNeko(userId, 'nyx', client);
        }
        
        await user.save();
        return { leveledUp: true, level: user.level };
    }

    await user.save();
    return { leveledUp: false };
}

// --- 🎀 FUNCIÓN PARA DAR NEKOS CON DM ---
async function grantNeko(userId, nekoId, client) {
    const user = await User.findOne({ userId });
    if (!user || user.nekos[nekoId]) return;

    user.nekos[nekoId] = true;
    await user.save();

    try {
        const discordUser = await client.users.fetch(userId);
        const names = { solas: 'Solas ☁️', nyx: 'Nyx 🌑', mizuki: 'Mizuki 🌸', astra: 'Astra 👑', koko: 'Koko 🍓' };
        const desc = {
            solas: 'tu carisma social (100 interacciones)',
            nyx: 'tu gran dedicación (Nivel 10)',
            mizuki: 'tu increíble actividad (+5,000 mensajes)',
            astra: 'tu estatus de élite (Premium)',
            koko: 'tu buen gusto en la Boutique'
        };

        const embed = new EmbedBuilder()
            .setTitle('✨ ¡𝕽☆𝖈𝖐𝖘𝖙𝖆𝖗 𝕹𝖊𝖐𝖔 𝕬𝖑𝖊𝖗𝖙! ✨')
            .setColor('#E6E6FA')
            .setThumbnail(discordUser.displayAvatarURL())
            .setDescription(
                `*“Un destello de luz ha aparecido en tu perfil...”*\n\n` +
                `Has desbloqueado a **${names[nekoId]}**.\n` +
                `Se ha unido a ti por **${desc[nekoId]}**.\n\n` +
                `🐾 *Ya puedes presumirlo en tu \`/profile\`*`
            );

        await discordUser.send({ embeds: [embed] });
    } catch (e) { console.log(`DM bloqueado para ${userId}`); }
}

async function getUserData(userId) {
    let user = await User.findOne({ userId });
    if (!user) user = await User.create({ userId });
    
    if (user.premiumType !== 'none' && user.premiumUntil && new Date() > user.premiumUntil) {
        user.premiumType = 'none';
        user.premiumUntil = null;
        await user.save();
    }
    return user;
}

async function updateUserData(userId, data) {
    try {
        if (data.health <= 0) {
            data.deadCount = (data.deadCount || 0) + 1;
            data.health = 3; 
            data.wallet = 0; 
        }
        await User.findOneAndUpdate({ userId }, { $set: data }, { upsert: true });
        return true;
    } catch (err) { return false; }
}

// Exportamos todo incluyendo la nueva función addXP
module.exports = { User, getUserData, updateUserData, grantNeko, addXP };