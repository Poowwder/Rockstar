const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { ITEMS_FIJOS, BOLSA_ROTATIVA } = require('../data/items.js');
const { getShopItemsDB, getUserData, updateUserData } = require('../userManager.js'); 
const { UserProfile } = require('../data/mongodb.js'); 
const { NEKO_DATA } = require('../functions/checkNekos.js'); 

// --- ✨ EMOJIS AL AZAR DEL SERVIDOR ---
const getRndEmoji = (guild) => {
    if (!guild) return '✨';
    const emojis = guild.emojis.cache.filter(e => e.available);
    return emojis.size > 0 ? emojis.random().toString() : '🛍️';
};

module.exports = {
    name: 'buy',
    description: '🛍️ Adquiere objetos del Mercado de las Sombras.',
    category: 'economía',
    data: new SlashCommandBuilder()
        .setName('buy')
        .setDescription('🛍️ Compra un objeto del mercado')
        .addStringOption(opt => opt.setName('objeto').setDescription('Nombre o ID del objeto a comprar').setRequired(true)),

    async execute(input, args) {
        const isSlash = !!input.user;
        const user = isSlash ? input.user : input.author;
        const guild = input.guild;
        const query = isSlash ? input.options.getString('objeto').toLowerCase() : args?.join(' ').toLowerCase();
        const e = () => getRndEmoji(guild);

        if (!query) return input.reply(`╰┈➤ ${e()} ¿Qué pieza del catálogo deseas reclamar hoy? \`!!buy <nombre>\``);

        // --- 📂 CONSTRUCCIÓN DE LA TIENDA ---
        let fijosDB = [];
        try { fijosDB = await getShopItemsDB(); } catch(err) {}
        
        let fijosFinales = [...(ITEMS_FIJOS || [])];
        fijosDB.forEach(dbItem => {
            const index = fijosFinales.findIndex(i => i.id === dbItem.id);
            if (index !== -1) fijosFinales[index] = dbItem; 
            else fijosFinales.push(dbItem);
        });

        const tiendaTotal = [...fijosFinales, ...(BOLSA_ROTATIVA || [])];
        const item = tiendaTotal.find(i => i.name.toLowerCase().includes(query) || i.id.toLowerCase() === query);

        if (!item) return input.reply(`╰┈➤ ❌ ${e()} Ese objeto no se encuentra en vitrina por ahora.`);

        let data = await getUserData(user.id);
        const wallet = data.wallet || 0;

        // --- 🛡️ VALIDACIONES ---
        if (item.premium && (!data.premiumType || data.premiumType === 'none')) {
            return input.reply(`╰┈➤ 🚫 ${e()} Este ítem es exclusivo para integrantes con pase VIP.`);
        }
        
        if (wallet < item.price) {
            return input.reply(`╰┈➤ 💸 ${e()} No cuentas con suficientes flores. Costo: \`${item.price.toLocaleString()}\`.`);
        }

        let updates = { wallet: wallet - item.price };

        // --- 🍓 LÓGICA ESPECIAL: KOKO ---
        if (item.id === 'koko') {
            let profile = await UserProfile.findOne({ UserID: user.id, GuildID: guild.id });
            if (!profile) profile = new UserProfile({ UserID: user.id, GuildID: guild.id });

            if (profile.Nekos && profile.Nekos.includes(NEKO_DATA.PREMIUM.img)) {
                return input.reply(`╰┈➤ 🍓 Ya has reclamado la insignia de **Koko** anteriormente.`);
            }
            if (!profile.Nekos) profile.Nekos = [];
            profile.Nekos.push(NEKO_DATA.PREMIUM.img);
            await profile.save();
        } 
        
        // --- 📦 LÓGICA PARA ROLES ---
        else if (item.tipo === "rol") {
            try { 
                const member = isSlash ? input.member : guild.members.cache.get(user.id);
                if (!item.idRol) return input.reply("╰┈➤ ❌ Este rol no tiene un ID configurado.");
                if (member.roles.cache.has(item.idRol)) return input.reply("╰┈➤ ⚠️ Ya posees este rango.");
                await member.roles.add(item.idRol); 
            } catch(err) { 
                return input.reply("╰┈➤ ❌ Error de permisos al asignar el rol.");
            }
        } 
        
        // --- 🔥 LÓGICA DE INVENTARIO (FIX MONGODB) ---
        else {
            let currentInventory = data.inventory ? { ...data.inventory } : {};
            currentInventory[item.id] = (currentInventory[item.id] || 0) + 1;
            updates.inventory = currentInventory;
        }

        // --- ✅ FINALIZAR ---
        await updateUserData(user.id, updates);

        const successEmbed = new EmbedBuilder()
            .setTitle(`${e()} TRANSACCIÓN EXITOSA ${e()}`)
            .setColor('#1a1a1a')
            .setThumbnail('https://i.pinimg.com/originals/30/85/6a/30856a9080b06b0b009e86749fcb186b.gif')
            .setDescription(
                `> 🛍️ *Has cerrado un trato con el mercado de las sombras.*\n\n` +
                `╰┈➤ **Adquiriste:** ${item.emoji || '📦'} **${item.name}**\n` +
                `╰┈➤ **Costo:** \`-${item.price.toLocaleString()} 🌸\`\n` +
                `╰┈➤ **Balance:** \`${updates.wallet.toLocaleString()} 🌸\``
            )
            .setFooter({ text: `Mercado Nightfall • Rockstar System`, iconURL: user.displayAvatarURL() });

        return input.reply({ embeds: [successEmbed] });
    }
};
