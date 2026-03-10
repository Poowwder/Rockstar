const { ITEMS_FIJOS, BOLSA_ROTATIVA } = require('../data/items.js');
const { getShopItemsDB, getUserData, updateUserData } = require('../userManager.js'); 
const { UserProfile } = require('../data/mongodb.js'); 
const { NEKO_DATA } = require('../functions/checkNekos.js'); 

module.exports = {
    name: 'buy',
    async execute(input, args) {
        const isSlash = !!input.user;
        const user = isSlash ? input.user : input.author;
        const guild = input.guild;
        const query = isSlash ? (input.options.getString('objeto') || "").toLowerCase() : args?.join(' ').toLowerCase();

        // --- ✨ ESTILO ROCKSTAR: Emojis Aleatorios del Servidor ---
        const botEmojis = guild.emojis.cache.filter(e => e.available);
        const rnd = () => botEmojis.size > 0 ? botEmojis.random().toString() : '✨';
        const e1 = rnd();

        if (!query) return input.reply(`╰┈➤ ${e1} ¿Qué pieza del catálogo deseas reclamar hoy?`);

        // --- 📂 CONSTRUCCIÓN DE LA TIENDA HÍBRIDA ---
        const fijosDB = await getShopItemsDB(); 
        let fijosFinales = [...ITEMS_FIJOS];
        fijosDB.forEach(dbItem => {
            const index = fijosFinales.findIndex(i => i.id === dbItem.id);
            if (index !== -1) fijosFinales[index] = dbItem; 
            else fijosFinales.push(dbItem);
        });

        // Tienda total: Fijos personalizados + Bolsa Rotativa (Vidas, Anillos, Koko)
        const tiendaTotal = [...fijosFinales, ...BOLSA_ROTATIVA];
        const item = tiendaTotal.find(i => i.name.toLowerCase().includes(query) || i.id.toLowerCase() === query);

        if (!item) return input.reply(`❌ Ese objeto no se encuentra en vitrina por ahora.`);

        let data = await getUserData(user.id);
        const wallet = data.wallet || 0;

        // --- 🛡️ VALIDACIONES DE RANGO ---
        if (item.premium && data.premiumType === 'none') {
            return input.reply(`🚫 Este ítem es exclusivo para integrantes con pase VIP.`);
        }
        
        if (wallet < item.price) {
            return input.reply(`❌ No cuentas con suficientes flores para adquirir **${item.name}**. Costo: \`${item.price.toLocaleString()}\``);
        }

        // --- 🛒 PROCESO DE PAGO ---
        let updates = { wallet: wallet - item.price };
        let profile = await UserProfile.findOne({ UserID: user.id, GuildID: guild.id });
        if (!profile) profile = new UserProfile({ UserID: user.id, GuildID: guild.id });

        // --- 🍓 LÓGICA ESPECIAL: KOKO (Insignia Premium) ---
        if (item.id === 'koko') {
            if (profile.Nekos.includes(NEKO_DATA.PREMIUM.img)) {
                return input.reply(`🍓 Ya has reclamado la insignia de **Koko** anteriormente.`);
            }
            profile.Nekos.push(NEKO_DATA.PREMIUM.img);
            await profile.save();
            await updateUserData(user.id, updates);
            return input.reply(`🍓 **Trato hecho.** La insignia de **Koko** ha sido grabada en tu perfil. ${rnd()}`);
        }

        // --- 📦 LÓGICA PARA OBJETOS / ROLES PERSONALIZADOS ---
        if (item.tipo === "rol") {
            try { 
                const member = isSlash ? input.member : guild.members.cache.get(user.id);
                if (!item.idRol) return input.reply("❌ Este rol no tiene un ID configurado.");
                if (member.roles.cache.has(item.idRol)) return input.reply("⚠️ Ya posees este rango en el servidor.");
                
                await member.roles.add(item.idRol); 
            } catch(e) { 
                console.log("Error de Rol:", e);
                return input.reply("❌ Hubo un problema al asignarte el rol.");
            }
        } else {
            // Guardar en inventario
            if (!data.inventory) data.inventory = {};
            data.inventory[item.id] = (data.inventory[item.id] || 0) + 1;
            updates.inventory = data.inventory;
        }

        // --- ✅ FINALIZAR ---
        await updateUserData(user.id, updates);
        return input.reply({
            embeds: [{
                color: 0x1a1a1a,
                description: `🛍️ **Adquisición exitosa.**\nHas obtenido **${item.name}** ${item.emoji || ''} por \`${item.price.toLocaleString()}\` flores. ${rnd()}`
            }]
        });
    }
};
