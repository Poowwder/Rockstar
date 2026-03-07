const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { getUserData, updateUserData, addItemToInventory, removeItemFromInventory, applyFishingBonus, applyMiningBonus } = require('../../economyManager.js');
const fs = require('fs');
const path = require('path');
const ms = require('ms');

const petsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../../pets.json'), 'utf8'));
const ICONS = {
    pet: '🐶',
    money: '🌸',
    error: '❌'
};
const COLORS = {
    primary: '#FFB6C1',
    error: '#FF6961'
};

async function createEconomyEmbed(ctx, title, description, color, thumbnailType = 'default') {
    const user = ctx.user || ctx.author;
    const member = ctx.member || ctx.guild.members.cache.get(user.id);
    const name = member ? member.displayName : user.username;
    const embed = new EmbedBuilder()
        .setColor(COLORS.primary);
        return embed
}






module.exports = {
    data: new SlashCommandBuilder()
        .setName('pet')
        .setDescription('Interactúa con tu mascota.')
        .addSubcommand(sub => sub.setName('list').setDescription('Lista tus mascotas.'))
        .addSubcommand(sub => sub.setName('equip').setDescription('Equipa una mascota.').addStringOption(o => o.setName('id').setDescription('ID de la mascota a equipar.').setRequired(true)))
        .addSubcommand(sub => sub.setName('info').setDescription('Muestra información de tu mascota equipada.')),
		 skipSlash: true, // No registrar individualmente
        category: 'currency',
    description: 'list, equip or get info from your pet',
    usage: 'pet < list | equip | info>',
    async execute(message, args) {
        const sub = args[0];
    },
	

        async executeSlash(interaction) {
        const { options, user } = interaction;
        const sub = interaction.options.getSubcommand();
		    if (sub === 'list') {
				return this.list(interaction);
			}

            if (sub === 'equip') {
				return this.equip(interaction, interaction.options.getString('id'))
			}
            if (sub === 'info') {
			}
    return embed;
}

			this.info(interaction)
    },

    async list(ctx) {
        const user = ctx.user || ctx.author
        const data = getUserData(user.id);

        if (!data.inventory || data.inventory.length === 0) {
            return ctx.reply({ content: '🐶 No tienes mascotas. ¡Consigue una en cajas de botín o eventos!', flags: MessageFlags.Ephemeral });
        }

		const petList = data.inventory.filter(item => items[item.id])
        if (!petList || petList.length === 0) {
            return ctx.reply({ content: '🐶 No tienes mascotas. ¡Consigue una en cajas de botín o eventos!', flags: MessageFlags.Ephemeral });
        }

            // Construct the embed with the pet list
            // Reply to the user with the embed
        }
    },
    async equip(ctx, petId) {
		
        const user = ctx.user || ctx.author
        const data = getUserData(user.id);
		const item = items[data.pet]
		
        // Verify if user have a pet

            if (data.inventory && data.inventory === petId){
                return ctx.reply({ content: `${ICONS.error} El pet no es valido`, flags: MessageFlags.Ephemeral });

           
		else return
		 petToEquip = items[petId];
	 if (!petToEquip) return ctx.reply({ content: `${ICONS.error} No existe una pet con ese nombre en la tienda.`, flags: MessageFlags.Ephemeral });


           const msg = await ctx.reply({ content:`equipaste ${item.name} exitosamente`, flags: MessageFlags.Ephemeral })
            updateUserData(user.id, data)
        return ctx.reply({ content:`no tienes este pet en tu inventario. para poder equiparlo, primero compralo`, flags: MessageFlags.Ephemeral })
    }
        
        
        let message = ""
  //      let itemToEquip = findShopItem(itemName)
   //     if (message.isChatInputCommand?.() && (message.deferred || message.replied)) await message.editReply('esto tardara un momento');
     
        

    },
    async petInfo(ctx) {
    if (ctx.isChatInputCommand?.() && !ctx.deferred && !ctx.replied) await ctx.deferReply();

	 const user = ctx.user?.id || ctx.author?.id;
    const data = getUserData(user);

            if (hasPet){
          let message = "no tienes ninguna pet equipada"
            if (ctx.isChatInputCommand?.() && (ctx.deferred || ctx.replied)) await ctx.editReply("no tienes pet equipada")
            else await ctx.reply("no tienes ninguna pet equipada")
            } else {
          const hasPet = data.pet
           const embed = await createEconomyEmbed(ctx, "mira las caracteristicas de tu pet", "si", COLORS.primary, 'level');
            }

        data.pet = petId;

     const embed = await createEconomyEmbed(ctx, `${ICONS.shop} Tienda del Servidor`, description || 'La tienda está vacía en este momento.', COLORS.info, 'shop');

    if (ctx.isChatInputCommand?.() && (ctx.deferred || ctx.replied)) await ctx.editReply({ embeds: [embed] });
            else await ctx.reply({ embeds: [embed] });
};
}