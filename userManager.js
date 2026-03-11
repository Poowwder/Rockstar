async function addXP(userId, amount, client) {
    let user = await User.findOne({ userId });
    if (!user) user = await User.create({ userId });

    // --- 💎 SISTEMA DE MULTIPLICADORES VIP ---
    let multiplicador = 1; // Base para usuarios normales
    
    // Convertimos a minúsculas por seguridad
    const rango = (user.premiumType || 'none').toLowerCase();

    if (rango === 'pro' || rango === 'mensual') {
        multiplicador = 1.5; // 50% extra de XP
    } else if (rango === 'ultra' || rango === 'bimestral') {
        multiplicador = 2.0; // Doble XP
    }

    // Calculamos la XP final y la sumamos
    const xpFinal = Math.floor(amount * multiplicador);
    user.xp += xpFinal;

    const nextLevelXP = user.level * 500;

    if (user.xp >= nextLevelXP) {
        user.level += 1;
        // Restamos lo que costó el nivel en lugar de ponerlo en 0, 
        // así no pierden la XP sobrante del último mensaje.
        user.xp -= nextLevelXP; 
        
        // Si llega a nivel 10, desbloquea a Nyx automáticamente
        if (user.level === 10 && !user.nekos.nyx) {
            await grantNeko(userId, 'nyx', client);
        }
        await user.save();
        return { leveledUp: true, level: user.level };
    }
    
    await user.save();
    return { leveledUp: false };
}
