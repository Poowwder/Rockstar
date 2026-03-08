// No necesitamos importar fs aquí porque usaremos el objeto 'data' que viene de MongoDB
function getRequiredXP(level) {
    return 100 * (level ** 2); // Ejemplo: Level 1 = 100xp, Level 2 = 400xp
}

async function addXP(userId, amount, messageInfo, { getUserData, updateUserData }) {
    let data = await getUserData(userId);
    
    data.xp += amount;
    const nextLevelXP = getRequiredXP(data.level);

    if (data.xp >= nextLevelXP) {
        data.level += 1;
        data.xp = 0; // Opcional: puedes dejar el sobrante restando nextLevelXP
        
        // Mensaje de Level Up Aesthetic
        if (messageInfo.channel) {
            messageInfo.channel.send({
                content: `✨ ¡Increíble **${messageInfo.user.username}**! Has subido al **Nivel ${data.level}** 🌸`
            });
        }
    }

    // Guardar cambios en MongoDB
    await updateUserData(userId, data);
}

module.exports = { addXP, getRequiredXP };