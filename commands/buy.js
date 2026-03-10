const { getTiendaHoy } = require('../data/items.js');
const { getUserData, updateUserData } = require('../userManager.js'); 
const { UserProfile } = require('../data/mongodb.js'); // Nueva DB
const { checkNekos, NEKO_DATA } = require('../functions/checkNekos.js'); // Lógica de desbloqueo
const emojis = require('../utils/emojiHelper.js'); 

module.exports = {
    name: 'buy',
    async execute(input, args) {
        const isSlash = !!input.user;
        const user = isSlash ? input.user : input.author;
        const guild = input.guild;
        const query = isSlash ? (input.options.getString('objeto') || "").toLowerCase() : args?.join(' ').toLowerCase();

        // 1. Emojis Aleatorios para el estilo Rockstar ✨
        const botEmojis = guild.emojis.cache.filter(e => e.available);
        const rnd = () => botEmojis.size > 0 ? botEmojis.random().toString() : '✨';
        const e1 = rnd();

        if (!query) return input.reply(`╰┈➤ ${e1} ¿Qué te gustaría adquirir hoy?`);

        const tienda = getTiendaHoy();
        const item = tienda.find(i => i.name.toLowerCase().includes(query) || i.id.includes(query));

        if (!item) return input.reply(`❌ Ese objeto no se encuentra en vitrina por ahora.`);

        let data = await getUserData(user.id);
        if (item.premium && data.premiumType === 'none') return input.reply(`🚫 Este ítem es exclusivo para integrantes VIP.`);
        
        const wallet = data.wallet || 0;
        if (wallet < item.price) return input.reply(`❌ No cuentas con suficientes flores para adquirir **${item.name}**.`);

        // --- 🛒 PROCESO DE PAGO ---
        const nuevaCartera = wallet - item.price;
        let updates = { wallet: nuevaCartera };

        // --- 🎀 LÓGICA ESPECIAL PARA ASTRA (NEKO #4) ---
        if (item.id.toLowerCase() === 'astra') {
            let profile = await UserProfile.findOne({ UserID: user.id, GuildID: guild.id });
            if (!profile) profile = new UserProfile({ UserID: user.id, GuildID: guild.id });

            if (profile.Nekos.includes(NEKO_DATA.TIENDA.img)) {
                return input.reply(`✨ Ya posees a **Astra** en tu colección personal.`);
            }

            // Guardamos a Astra en la DB y disparamos el mensaje aesthetic
            profile.Nekos.push(NEKO_DATA.TIENDA.img);
            await profile.save();
            await updateUserData(user.id, updates);

            // Llamamos a la función para que mande el mensaje bonito que configuramos
            return await checkNekos(input, 'tienda_manual'); 
        }

        // --- 🍓 LÓGICA PARA KOKO (PREMIUM) ---
        if (item.id.toLowerCase() === 'koko') {
            let profile = await UserProfile.findOne({ UserID: user.id, GuildID: guild.id });
            if (!profile) profile = new UserProfile({ UserID: user.id, GuildID: guild.id });

            profile.Nekos.push(NEKO_DATA.PREMIUM.img);
            await profile.save();
            await updateUserData(user.id, updates);
            
            return input.reply(`🍓 **¡Trato hecho!** Has desbloqueado la insignia de **Koko**. Se ha integrado a tu \`/profile\`. ${rnd()}`);
        }

        // --- LÓGICA PARA OBJETOS NORMALES ---
        if (item.tipo === "rol") {
            try { 
                const member = isSlash ? input.member : guild.members.cache.get(user.id);
                await member.roles.add(item.idRol); 
            } catch(e) { console.log("Error al asignar rol:", e); }
        } else {
            let inventarioActual = data.inventory || [];
            inventarioActual.push(item.name);
            updates.inventory = inventarioActual;
        }

        await updateUserData(user.id, updates);
        return input.reply(`🛍️ **¡Adquisición exitosa!** **${item.name}** ahora es de tu propiedad. ${rnd()}`);
    }
};