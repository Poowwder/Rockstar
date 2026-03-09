const { getTiendaHoy } = require('../data/items.js');
const { getUserData, updateUserData, grantNeko } = require('../userManager.js'); 

module.exports = {
    name: 'buy',
    async execute(input, args) {
        const isSlash = !!input.user;
        const user = isSlash ? input.user : input.author;
        const query = isSlash ? (input.options.getString('objeto') || "").toLowerCase() : args?.join(' ').toLowerCase();

        if (!query) return input.reply("╰┈➤ 🌸 ¿Qué quieres comprar hoy?");

        const tienda = getTiendaHoy();
        const item = tienda.find(i => i.name.toLowerCase().includes(query) || i.id.includes(query));

        if (!item) return input.reply("❌ Ese objeto no está en vitrina hoy, Rockstar.");

        let data = await getUserData(user.id);
        if (item.premium && data.premiumType === 'none') return input.reply("🚫 Este ítem es exclusivo para VIPs.");
        
        const wallet = data.wallet || 0;
        if (wallet < item.price) return input.reply(`❌ No tienes suficientes flores para **${item.name}**.`);

        // --- 🛒 PROCESO DE COMPRA ---
        const nuevaCartera = wallet - item.price;
        let updates = { wallet: nuevaCartera };

        // --- 🍓 LÓGICA DE INSIGNIA (BADGE) KOKO ---
        if (item.id === 'koko' || item.name.toLowerCase().includes('koko')) {
            // Se activa como insignia en el perfil y manda DM
            await grantNeko(user.id, 'koko', input.client);
            
            await updateUserData(user.id, updates);
            return input.reply(`🍓 **¡Increíble!** Has desbloqueado la insignia de **Koko**. Mírala en tu \`/profile\`. ✨`);
        }

        // --- LÓGICA PARA OBJETOS NORMALES (ROLES O INVENTARIO) ---
        if (item.tipo === "rol") {
            try { 
                const member = isSlash ? input.member : input.guild.members.cache.get(user.id);
                await member.roles.add(item.idRol); 
            } catch(e) { console.log("Error al dar rol:", e); }
        } else {
            let inventarioActual = data.inventory || [];
            inventarioActual.push(item.name);
            updates.inventory = inventarioActual;
        }

        await updateUserData(user.id, updates);
        return input.reply(`🛍️ **¡Compra exitosa!** Ya tienes tu **${item.name}**. ✨`);
    }
};