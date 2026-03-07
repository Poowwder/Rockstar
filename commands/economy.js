const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { getUserData, updateUserData, checkAndSetCooldown, getEconomyData, addItemToInventory, removeItemFromInventory } = require('../economy.js');
const fs = require('fs');
const path = require('path');
const ms = require('ms');

// -------------------
// CONFIG & HELPERS
// -------------------
const ICONS = {
    money: '🌸',
    wallet: '👛',
    bank: '🏦',
    success: '✅',
    error: '❌',
    cooldown: '⏳',
    work: '💼',
    daily: '🎁',
    leaderboard: '🏆',
    pay: '💸',
    beg: '🙏',
    rob: '⚔️',
    inventory: '📦',
    shop: '🏪',
    slots: '🎰',
    coinflip: '🪙',
    mine: '⛏️',
    fish: '🎣',
    craft: '🛠️',
    item: '✨'
};
const COLORS = {
    primary: '#FFB6C1', // Light Pink
    success: '#A7D7C5', // Mint Green
    warning: '#F7DBA7', // Pastel Yellow
    error: '#FF6961',   // Pastel Red
    info: '#C8A2C8'     // Lilac
};

const THUMBNAILS = {
    work: 'https://media.tenor.com/2b1_1-1_1-1/anime-working.gif',
    money: 'https://media.tenor.com/images/2b1_1-1_1-1/anime-money.gif',
    shop: 'https://media.tenor.com/images/2b1_1-1_1-1/anime-shop.gif',
    gamble: 'https://media.tenor.com/images/2b1_1-1_1-1/anime-gamble.gif',
    crime: 'https://media.tenor.com/images/2b1_1-1_1-1/anime-police.gif',
    inventory: 'https://media.tenor.com/images/2b1_1-1_1-1/anime-bag.gif'
};

const formatMoney = (amount) => `${ICONS.money} ${amount.toLocaleString()}`;
const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const shopItems = () => {
    const p = path.join(__dirname, '..', 'shop.json');
    return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : {};
};
const recipes = () => {
    const p = path.join(__dirname, '..', 'recipes.json');
    return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : {};
};

function saveShopItems(data) {
    fs.writeFileSync(path.join(__dirname, '..', 'shop.json'), JSON.stringify(data, null, 4));
}

function userHasItem(userId, itemId, quantity = 1) {
    const data = getUserData(userId);
    const item = data.inventory.find(i => i.id === itemId);
    return item && item.quantity >= quantity;
}

async function createEconomyEmbed(ctx, title, description, color, thumbnailType = 'money') {
    const guildName = ctx.guild ? ctx.guild.name : 'R☆ckstar';
    const guildIcon = ctx.guild ? ctx.guild.iconURL() : null;
    const embed = new EmbedBuilder()
        .setColor(color)
        .setTitle(title)
        .setDescription(description)
        .setThumbnail(THUMBNAILS[thumbnailType] || THUMBNAILS.money)
        .setFooter({ text: guildName, iconURL: guildIcon })
        .setTimestamp();
    return embed;
}

// -------------------
// COMMAND DEFINITIONS
// -------------------
const commands = [
    // BALANCE
    {
        name: 'balance',
        aliases: ['bal'],
        description: 'Muestra tu balance o el de otro usuario.',
        builder: (builder) => builder.addUserOption(opt => opt.setName('usuario').setDescription('El usuario a consultar.')),
        async execute(ctx, targetUser) {
            const user = targetUser || (ctx.user || ctx.author);
            const member = ctx.guild.members.cache.get(user.id);
            const name = member ? member.displayName : user.username;
            const data = getUserData(user.id);
            
            const embed = await createEconomyEmbed(ctx, `Balance de ${name}`, '', COLORS.primary, 'money');
            embed.setAuthor({ name: name, iconURL: user.displayAvatarURL() });
            embed.addFields(
                { name: `${ICONS.wallet} Cartera`, value: formatMoney(data.wallet), inline: true },
                { name: `${ICONS.bank} Banco`, value: formatMoney(data.bank), inline: true },
                { name: '💰 Total', value: formatMoney(data.wallet + data.bank), inline: true }
            );
            await ctx.reply({ embeds: [embed] });
        }
    },
    // WORK
    {
        name: 'work',
        description: 'Trabaja cada hora para ganar dinero.',
        cooldown: 3600, // 1 hour
        async execute(ctx) {
            if (ctx.isChatInputCommand?.() && !ctx.deferred && !ctx.replied) await ctx.deferReply();

            const jobs = [
                { name: 'Barista', text: 'preparaste cafés deliciosos', min: 300, max: 600 },
                { name: 'Programador', text: 'arreglaste unos bugs críticos', min: 500, max: 900 },
                { name: 'Artista', text: 'vendiste un dibujo digital', min: 400, max: 800 },
                { name: 'Streamer', text: 'hiciste un stream de 12 horas', min: 600, max: 1000 },
                { name: 'Cocinero', text: 'cocinaste para un banquete', min: 350, max: 700 }
            ];
            
            const job = jobs[Math.floor(Math.random() * jobs.length)];
            const earnings = random(job.min, job.max);
            const userId = ctx.user?.id || ctx.author?.id;
            const data = getUserData(userId);
            data.wallet += earnings;
            updateUserData(userId, data);

            const embed = await createEconomyEmbed(ctx, `${ICONS.work} ¡A trabajar!`, `Trabajaste como **${job.name}**, ${job.text} y ganaste ${formatMoney(earnings)}.`, COLORS.success, 'work');
            
            if (ctx.isChatInputCommand?.()) await ctx.editReply({ embeds: [embed] });
            else await ctx.reply({ embeds: [embed] });
        }
    },
    // DAILY
    {
        name: 'daily',
        description: 'Reclama tu recompensa diaria.',
        cooldown: 86400, // 24 hours
        async execute(ctx) {
            if (ctx.isChatInputCommand?.() && !ctx.deferred && !ctx.replied) await ctx.deferReply();

            const earnings = 2500;
            const userId = ctx.user?.id || ctx.author?.id;
            const data = getUserData(userId);
            data.wallet += earnings;
            updateUserData(userId, data);
            
            const embed = await createEconomyEmbed(ctx, `${ICONS.daily} Recompensa Diaria`, `¡Has reclamado tu recompensa diaria de ${formatMoney(earnings)}! Vuelve mañana.`, COLORS.warning, 'money');
            
            if (ctx.isChatInputCommand?.()) await ctx.editReply({ embeds: [embed] });
            else await ctx.reply({ embeds: [embed] });
        }
    },
    // LEADERBOARD
    {
        name: 'leaderboard',
        aliases: ['lb', 'top'],
        description: 'Muestra a los más ricos del servidor.',
        async execute(ctx) {
            // Diferir respuesta porque fetch puede tardar
            if (ctx.isChatInputCommand?.() && !ctx.deferred && !ctx.replied) await ctx.deferReply();

            if (ctx.guild) await ctx.guild.members.fetch(); // Asegurar caché

            const allData = getEconomyData();
            const users = Object.entries(allData)
                .map(([userId, data]) => ({ userId, total: data.wallet + data.bank }))
                .filter(u => ctx.guild ? ctx.guild.members.cache.has(u.userId) : true)
                .sort((a, b) => b.total - a.total)
                .slice(0, 10);

            if (users.length === 0) return ctx.reply({ content: 'Nadie tiene dinero aún. ¡Sé el primero!', flags: MessageFlags.Ephemeral });

            const description = users.map((user, index) => {
                const member = ctx.guild ? ctx.guild.members.cache.get(user.userId) : null;
                const name = member ? member.displayName : 'Usuario Desconocido';
                return `**${index + 1}.** ${name} - ${formatMoney(user.total)}`;
            }).join('\n');

            const embed = await createEconomyEmbed(ctx, `${ICONS.leaderboard} Tabla de Líderes`, description, COLORS.info, 'money');
            
            if (ctx.isChatInputCommand?.()) await ctx.editReply({ embeds: [embed] });
            else await ctx.reply({ embeds: [embed] });
        }
    },
    // DEPOSIT
    {
        name: 'deposit',
        aliases: ['dep'],
        description: 'Deposita dinero en tu banco.',
        builder: (builder) => builder.addStringOption(opt => opt.setName('cantidad').setDescription('La cantidad a depositar (o "all").').setRequired(true)),
        async execute(ctx, amountStr) {
            const userId = ctx.user?.id || ctx.author?.id;
            const data = getUserData(userId);
            const amount = amountStr.toLowerCase() === 'all' ? data.wallet : parseInt(amountStr);

            if (isNaN(amount) || amount <= 0) return ctx.reply({ content: `${ICONS.error} Cantidad inválida.`, flags: MessageFlags.Ephemeral });
            if (amount > data.wallet) return ctx.reply({ content: `${ICONS.error} No tienes tanto dinero en tu cartera.`, flags: MessageFlags.Ephemeral });

            data.wallet -= amount;
            data.bank += amount;
            updateUserData(userId, data);

            const embed = await createEconomyEmbed(ctx, `${ICONS.bank} Depósito Exitoso`, `Has depositado ${formatMoney(amount)} en tu banco.`, COLORS.primary, 'money');
            await ctx.reply({ embeds: [embed] });
        }
    },
    // WITHDRAW
    {
        name: 'withdraw',
        aliases: ['with'],
        description: 'Retira dinero de tu banco.',
        builder: (builder) => builder.addStringOption(opt => opt.setName('cantidad').setDescription('La cantidad a retirar (o "all").').setRequired(true)),
        async execute(ctx, amountStr) {
            const userId = ctx.user?.id || ctx.author?.id;
            const data = getUserData(userId);
            const amount = amountStr.toLowerCase() === 'all' ? data.bank : parseInt(amountStr);

            if (isNaN(amount) || amount <= 0) return ctx.reply({ content: `${ICONS.error} Cantidad inválida.`, flags: MessageFlags.Ephemeral });
            if (amount > data.bank) return ctx.reply({ content: `${ICONS.error} No tienes tanto dinero en tu banco.`, flags: MessageFlags.Ephemeral });

            data.bank -= amount;
            data.wallet += amount;
            updateUserData(userId, data);

            const embed = await createEconomyEmbed(ctx, `${ICONS.bank} Retiro Exitoso`, `Has retirado ${formatMoney(amount)} de tu banco.`, COLORS.primary, 'money');
            await ctx.reply({ embeds: [embed] });
        }
    },
    // PAY
    {
        name: 'pay',
        aliases: ['give'],
        description: 'Págale dinero a otro usuario.',
        builder: (builder) => builder
            .addUserOption(opt => opt.setName('usuario').setDescription('El usuario al que quieres pagar.').setRequired(true))
            .addIntegerOption(opt => opt.setName('cantidad').setDescription('La cantidad a pagar.').setRequired(true).setMinValue(1)),
        async execute(ctx, targetUser, amount) {
            const authorId = ctx.user?.id || ctx.author?.id;
            if (targetUser.id === authorId) return ctx.reply({ content: `${ICONS.error} No puedes pagarte a ti mismo.`, flags: MessageFlags.Ephemeral });
            if (targetUser.bot) return ctx.reply({ content: `${ICONS.error} No puedes pagarle a un bot.`, flags: MessageFlags.Ephemeral });

            const authorData = getUserData(authorId);
            if (authorData.wallet < amount) return ctx.reply({ content: `${ICONS.error} No tienes suficiente dinero en tu cartera.`, flags: MessageFlags.Ephemeral });

            const targetData = getUserData(targetUser.id);
            authorData.wallet -= amount;
            targetData.wallet += amount;
            updateUserData(authorId, authorData);
            updateUserData(targetUser.id, targetData);

            const targetMember = ctx.guild.members.cache.get(targetUser.id);
            const targetName = targetMember ? targetMember.displayName : targetUser.username;

            const embed = await createEconomyEmbed(ctx, `${ICONS.pay} Pago Enviado`, `Has transferido ${formatMoney(amount)} a **${targetName}**.`, COLORS.success, 'money');
            await ctx.reply({ embeds: [embed] });
        }
    },
    // BEG
    {
        name: 'beg',
        description: 'Ruega por algo de dinero.',
        cooldown: 60, // 1 minute
        async execute(ctx) {
            if (ctx.isChatInputCommand?.() && !ctx.deferred && !ctx.replied) await ctx.deferReply();

            const success = Math.random() < 0.4; // 40% chance of success
            if (!success) {
                return ctx.reply({ content: 'Nadie te dio nada. ¡Mejor suerte la próxima!', flags: MessageFlags.Ephemeral });
            }
            const earnings = random(10, 100);
            const userId = ctx.user?.id || ctx.author?.id;
            const data = getUserData(userId);
            data.wallet += earnings;
            updateUserData(userId, data);
            const embed = await createEconomyEmbed(ctx, `${ICONS.beg} ¡Alguien se apiadó de ti!`, `Recibiste ${formatMoney(earnings)} de un alma caritativa.`, COLORS.primary, 'money');
            
            if (ctx.isChatInputCommand?.()) await ctx.editReply({ embeds: [embed] });
            else await ctx.reply({ embeds: [embed] });
        }
    },
    // ROB
    {
        name: 'rob',
        aliases: ['steal'],
        description: 'Intenta robarle a otro usuario.',
        cooldown: 1800, // 30 minutes
        builder: (builder) => builder.addUserOption(opt => opt.setName('usuario').setDescription('El usuario al que intentarás robar.').setRequired(true)),
        async execute(ctx, targetUser) {
            const authorId = ctx.user?.id || ctx.author?.id;
            if (targetUser.id === authorId) return ctx.reply({ content: `${ICONS.error} No puedes robarte a ti mismo.`, flags: MessageFlags.Ephemeral });
            if (targetUser.bot) return ctx.reply({ content: `${ICONS.error} Los bots no tienen bolsillos.`, flags: MessageFlags.Ephemeral });

            const authorData = getUserData(authorId);
            const targetData = getUserData(targetUser.id);

            const targetMember = ctx.guild.members.cache.get(targetUser.id);
            const targetName = targetMember ? targetMember.displayName : targetUser.username;

            if (targetData.wallet < 200) return ctx.reply({ content: `${ICONS.error} **${targetUser.username}** no tiene suficiente dinero para que valga la pena el riesgo.`, flags: MessageFlags.Ephemeral });

            const success = Math.random() < 0.35; // 35% chance of success
            if (!success) {
                const fine = random(50, 250);
                authorData.wallet -= fine;
                updateUserData(authorId, authorData);
                const embed = await createEconomyEmbed(ctx, `${ICONS.rob} ¡Te atraparon!`, `Intentaste robar a **${targetName}** y fallaste. Perdiste ${formatMoney(fine)} como multa.`, COLORS.error, 'crime');
                return ctx.reply({ embeds: [embed] });
            }

            const stolenAmount = Math.floor(targetData.wallet * random(10, 40) / 100);
            authorData.wallet += stolenAmount;
            targetData.wallet -= stolenAmount;
            updateUserData(authorId, authorData);
            updateUserData(targetUser.id, targetData);

            const embed = await createEconomyEmbed(ctx, `${ICONS.rob} ¡Robo Exitoso!`, `Le robaste ${formatMoney(stolenAmount)} a **${targetName}**. ¡Qué sigilo!`, COLORS.success, 'crime');
            await ctx.reply({ embeds: [embed] });
        }
    },
    // INVENTORY
    {
        name: 'inventory',
        aliases: ['inv'],
        description: 'Muestra los ítems que posees.',
        async execute(ctx) {
            if (ctx.isChatInputCommand?.() && !ctx.deferred && !ctx.replied) await ctx.deferReply();

            const userId = ctx.user?.id || ctx.author?.id;
            const member = ctx.guild.members.cache.get(userId);
            const name = member ? member.displayName : (ctx.user || ctx.author).username;
            const data = getUserData(userId);
            const items = shopItems();

            if (data.inventory.length === 0) {
                return ctx.reply({ content: 'Tu inventario está vacío.', flags: MessageFlags.Ephemeral });
            }

            const description = data.inventory.map(item => {
                const itemInfo = items[item.id];
                return `${itemInfo.icon} **${itemInfo.name}** - Cantidad: ${item.quantity}`;
            }).join('\n');

            const embed = await createEconomyEmbed(ctx, `${ICONS.inventory} Inventario de ${name}`, description, COLORS.primary, 'inventory');
            
            if (ctx.isChatInputCommand?.()) await ctx.editReply({ embeds: [embed] });
            else await ctx.reply({ embeds: [embed] });
        }
    },
    // SHOP
    {
        name: 'shop',
        description: 'Muestra los ítems disponibles para comprar.',
        async execute(ctx) {
            if (ctx.isChatInputCommand?.() && !ctx.deferred && !ctx.replied) await ctx.deferReply();

            const items = shopItems();
            const buyableItems = Object.values(items).filter(item => item.buyPrice !== null);

            const description = buyableItems.map(item => {
                return `${item.icon} **${item.name}** - ${formatMoney(item.buyPrice)}\n*${item.description}*`;
            }).join('\n\n');

            const embed = await createEconomyEmbed(ctx, `${ICONS.shop} Tienda del Servidor`, description || 'La tienda está vacía en este momento.', COLORS.info, 'shop');
            
            if (ctx.isChatInputCommand?.()) await ctx.editReply({ embeds: [embed] });
            else await ctx.reply({ embeds: [embed] });
        }
    },
    // BUY
    {
        name: 'buy',
        description: 'Compra un ítem de la tienda.',
        builder: (builder) => builder
            .addStringOption(opt => opt.setName('item').setDescription('El ID del ítem a comprar.').setRequired(true))
            .addIntegerOption(opt => opt.setName('cantidad').setDescription('La cantidad a comprar (defecto: 1).').setMinValue(1)),
        async execute(ctx, itemId, quantity = 1) {
            const items = shopItems();
            let itemToBuy = items[itemId.toLowerCase()];

            if (!itemToBuy) {
                itemToBuy = Object.values(items).find(i => i.name.toLowerCase() === itemId.toLowerCase());
            }

            if (!itemToBuy || itemToBuy.buyPrice === null) return ctx.reply({ content: `${ICONS.error} Ese ítem no existe o no se puede comprar.`, flags: MessageFlags.Ephemeral });

            const userId = ctx.user?.id || ctx.author?.id;
            const data = getUserData(userId);
            const totalCost = itemToBuy.buyPrice * quantity;

            if (data.wallet < totalCost) return ctx.reply({ content: `${ICONS.error} No tienes suficiente dinero en tu cartera. Necesitas ${formatMoney(totalCost)}.`, flags: MessageFlags.Ephemeral });

            data.wallet -= totalCost;
            updateUserData(userId, data);
            addItemToInventory(userId, itemToBuy.id, quantity);

            const embed = await createEconomyEmbed(ctx, `${ICONS.shop} Compra Exitosa`, `Compraste **${quantity}x ${itemToBuy.name}** por ${formatMoney(totalCost)}.`, COLORS.success, 'shop');
            await ctx.reply({ embeds: [embed] });
        }
    },
    // SELL
    {
        name: 'sell',
        description: 'Vende un ítem de tu inventario.',
        builder: (builder) => builder
            .addStringOption(opt => opt.setName('item').setDescription('El ID del ítem a vender.').setRequired(true))
            .addStringOption(opt => opt.setName('cantidad').setDescription('La cantidad a vender (o "all", defecto: 1).')),
        async execute(ctx, itemId, quantityStr = '1') {
            const items = shopItems();
            let itemToSell = items[itemId.toLowerCase()];

            if (!itemToSell) {
                itemToSell = Object.values(items).find(i => i.name.toLowerCase() === itemId.toLowerCase());
            }

            const userId = ctx.user?.id || ctx.author?.id;
            const userData = getUserData(userId);
            
            if (!itemToSell) return ctx.reply({ content: `${ICONS.error} Ese ítem no existe.`, flags: MessageFlags.Ephemeral });

            const userItem = userData.inventory.find(i => i.id === itemToSell.id);

            if (!itemToSell || itemToSell.sellPrice === null) return ctx.reply({ content: `${ICONS.error} Ese ítem no se puede vender.`, flags: MessageFlags.Ephemeral });
            if (!userItem) return ctx.reply({ content: `${ICONS.error} No tienes ese ítem en tu inventario.`, flags: MessageFlags.Ephemeral });

            const quantity = quantityStr.toLowerCase() === 'all' ? userItem.quantity : parseInt(quantityStr);

            if (isNaN(quantity) || quantity <= 0) return ctx.reply({ content: `${ICONS.error} Cantidad inválida.`, flags: MessageFlags.Ephemeral });
            if (quantity > userItem.quantity) return ctx.reply({ content: `${ICONS.error} No tienes tantos ítems de ese tipo.`, flags: MessageFlags.Ephemeral });

            const totalGain = itemToSell.sellPrice * quantity;
            userData.wallet += totalGain;
            updateUserData(userId, userData);
            removeItemFromInventory(userId, itemToSell.id, quantity);

            const embed = await createEconomyEmbed(ctx, `${ICONS.shop} Venta Exitosa`, `Vendiste **${quantity}x ${itemToSell.name}** por ${formatMoney(totalGain)}.`, COLORS.success, 'shop');
            await ctx.reply({ embeds: [embed] });
        }
    },
    // SLOTS
    {
        name: 'slots',
        description: 'Juega a las tragamonedas.',
        cooldown: 10,
        builder: (builder) => builder.addIntegerOption(opt => opt.setName('apuesta').setDescription('La cantidad a apostar.').setRequired(true).setMinValue(10)),
        async execute(ctx, bet) {
            const userId = ctx.user?.id || ctx.author?.id;
            const data = getUserData(userId);

            if (data.wallet < bet) return ctx.reply({ content: `${ICONS.error} No tienes suficiente dinero para esa apuesta.`, flags: MessageFlags.Ephemeral });

            const symbols = ['🍒', '🍋', '🍊', '🍉', '⭐', '💎'];
            const reels = [random(0, 5), random(0, 5), random(0, 5)].map(i => symbols[i]);
            const resultText = `[ ${reels.join(' | ')} ]`;
            let winnings = 0;
            let message = "¡Mala suerte! Has perdido tu apuesta.";

            if (reels[0] === reels[1] && reels[1] === reels[2]) {
                winnings = bet * 5;
                message = `¡JACKPOT! ¡Has ganado ${formatMoney(winnings)}!`;
            } else if (reels[0] === reels[1] || reels[1] === reels[2]) {
                winnings = bet * 2;
                message = `¡Dos iguales! ¡Has ganado ${formatMoney(winnings)}!`;
            }

            data.wallet += winnings - bet;
            updateUserData(userId, data);

            const embed = await createEconomyEmbed(ctx, `${ICONS.slots} Tragamonedas`, `${resultText}\n\n${message}`, winnings > 0 ? COLORS.success : COLORS.error, 'gamble');
            await ctx.reply({ embeds: [embed] });
        }
    },
    // COINFLIP
    {
        name: 'coinflip',
        aliases: ['cf'],
        description: 'Apuesta en un cara o cruz.',
        builder: (builder) => builder
            .addIntegerOption(opt => opt.setName('apuesta').setDescription('La cantidad a apostar.').setRequired(true).setMinValue(1))
            .addStringOption(opt => opt.setName('lado').setDescription('Elige cara o cruz.').setRequired(true).addChoices({ name: 'Cara', value: 'cara' }, { name: 'Cruz', value: 'cruz' })),
        async execute(ctx, bet, choice) {
            const userId = ctx.user?.id || ctx.author?.id;
            const data = getUserData(userId);

            if (data.wallet < bet) return ctx.reply({ content: `${ICONS.error} No tienes suficiente dinero para esa apuesta.`, flags: MessageFlags.Ephemeral });

            const result = Math.random() < 0.5 ? 'cara' : 'cruz';
            const won = result === choice.toLowerCase();

            let description;
            if (won) {
                data.wallet += bet;
                description = `¡Ha salido **${result}**! Has ganado ${formatMoney(bet)}.`;
            } else {
                data.wallet -= bet;
                description = `Ha salido **${result}**. Has perdido ${formatMoney(bet)}.`;
            }
            updateUserData(userId, data);

            const embed = await createEconomyEmbed(ctx, `${ICONS.coinflip} Cara o Cruz`, description, won ? COLORS.success : COLORS.error, 'gamble');
            await ctx.reply({ embeds: [embed] });
        }
    },
    // MINE
    {
        name: 'mine',
        description: 'Usa tu pico para encontrar minerales.',
        cooldown: 300, // 5 minutes
        async execute(ctx) {
            const userId = ctx.user?.id || ctx.author?.id;
            if (!userHasItem(userId, 'pickaxe')) {
                return ctx.reply({ content: `${ICONS.error} Necesitas un pico para minar. Puedes comprarlo en la tienda (\`/buy item:pickaxe\`).`, flags: MessageFlags.Ephemeral });
            }

            const found = { id: 'stone', quantity: random(1, 5) };
            if (Math.random() < 0.2) found.id = 'iron_ore'; // 20% chance for iron
            if (Math.random() < 0.01) found.id = 'diamond'; // 1% chance for diamond
            
            addItemToInventory(userId, found.id, found.quantity);
            const itemInfo = shopItems()[found.id];

            const embed = await createEconomyEmbed(ctx, `${ICONS.mine} ¡Minería!`, `Has minado y encontraste **${found.quantity}x ${itemInfo.name}** ${itemInfo.icon}.`, COLORS.primary, 'work');
            
            if (ctx.isChatInputCommand?.() && (ctx.deferred || ctx.replied)) await ctx.editReply({ embeds: [embed] });
            else await ctx.reply({ embeds: [embed] });
        }
    }
];

// -------------------
    // DYNAMIC COMMAND BUILDER
// -------------------
module.exports = commands.map(cmdConfig => {
    const command = {
        data: new SlashCommandBuilder()
            .setName(cmdConfig.name)
            .setDescription(cmdConfig.description),
        category: 'currency',
        description: cmdConfig.description, // Keep this for help command
        usage: `!!${cmdConfig.name}`,
        aliases: cmdConfig.aliases || [],
        
        async execute(message, args) {
            const userId = message.author.id;
            if (cmdConfig.cooldown) {
                const timeLeft = checkAndSetCooldown(userId, cmdConfig.name, cmdConfig.cooldown);
                if (timeLeft > 0) {
                    return message.reply({ content: `${ICONS.cooldown} Debes esperar **${ms(timeLeft * 1000, { long: true })}** para usar este comando de nuevo.` });
                }
            }
            // Argument parsing for prefix commands
            if (cmdConfig.name === 'balance') {
                const target = message.mentions.users.first();
                return cmdConfig.execute(message, target);
            }
            if (['deposit', 'withdraw'].includes(cmdConfig.name)) {
                if (!args[0]) return message.reply({ content: `${ICONS.error} Debes especificar una cantidad.` });
                return cmdConfig.execute(message, args[0]);
            }
            if (cmdConfig.name === 'pay') {
                const target = message.mentions.users.first();
                const amount = parseInt(args[1]);
                if (!target || !amount) return message.reply({ content: `${ICONS.error} Uso: \`!!pay @usuario <cantidad>\`` });
                return cmdConfig.execute(message, target, amount);
            }
            if (cmdConfig.name === 'rob') {
                const target = message.mentions.users.first();
                if (!target) return message.reply({ content: `${ICONS.error} Debes mencionar a quién quieres robar.` });
                return cmdConfig.execute(message, target);
            }
            if (cmdConfig.name === 'slots') {
                const bet = parseInt(args[0]);
                if (!bet) return message.reply({ content: `${ICONS.error} Debes especificar una apuesta.` });
                return cmdConfig.execute(message, bet);
            }
            if (cmdConfig.name === 'coinflip') {
                const bet = parseInt(args[0]);
                const choice = args[1];
                if (!bet || !choice) return message.reply({ content: `${ICONS.error} Uso: \`!!coinflip <apuesta> <cara|cruz>\`` });
                return cmdConfig.execute(message, bet, choice);
            }
            if (cmdConfig.name === 'buy') {
                if (!args[0]) return message.reply({ content: `${ICONS.error} Debes especificar un ítem.` });
                return cmdConfig.execute(message, args[0], parseInt(args[1]) || 1);
            }
            if (cmdConfig.name === 'sell') {
                if (!args[0]) return message.reply({ content: `${ICONS.error} Debes especificar un ítem.` });
                return cmdConfig.execute(message, args[0], args[1] || '1');
            }
            return cmdConfig.execute(message);
        },

        async executeSlash(interaction) {
            const userId = interaction.user.id;
            if (cmdConfig.cooldown) {
                const timeLeft = checkAndSetCooldown(userId, cmdConfig.name, cmdConfig.cooldown);
                if (timeLeft > 0) {
                    return interaction.reply({ content: `${ICONS.cooldown} Debes esperar **${ms(timeLeft * 1000, { long: true })}** para usar este comando de nuevo.`, flags: MessageFlags.Ephemeral });
                }
            }
            // Argument parsing for slash commands
            if (cmdConfig.name === 'balance') {
                return cmdConfig.execute(interaction, interaction.options.getUser('usuario'));
            }
            if (['deposit', 'withdraw'].includes(cmdConfig.name)) {
                return cmdConfig.execute(interaction, interaction.options.getString('cantidad'));
            }
            if (cmdConfig.name === 'pay') {
                return cmdConfig.execute(interaction, interaction.options.getUser('usuario'), interaction.options.getInteger('cantidad'));
            }
            if (cmdConfig.name === 'rob') {
                return cmdConfig.execute(interaction, interaction.options.getUser('usuario'));
            }
            if (cmdConfig.name === 'slots') {
                return cmdConfig.execute(interaction, interaction.options.getInteger('apuesta'));
            }
            if (cmdConfig.name === 'coinflip') {
                return cmdConfig.execute(interaction, interaction.options.getInteger('apuesta'), interaction.options.getString('lado'));
            }
            if (cmdConfig.name === 'buy') {
                return cmdConfig.execute(interaction, interaction.options.getString('item'), interaction.options.getInteger('cantidad') || 1);
            }
            if (cmdConfig.name === 'sell') {
                return cmdConfig.execute(interaction, interaction.options.getString('item'), interaction.options.getString('cantidad') || '1');
            }
            return cmdConfig.execute(interaction);
        }
    };
    // Apply specific builder if it exists
    if (cmdConfig.builder) {
        cmdConfig.builder(command.data);
    }
    return command;
});