const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { getUserData, updateUserData, addItemToInventory, removeItemFromInventory } = require('./economyManager.js');
const fs = require('fs');
const path = require('path');

const ICONS = {
	pet: '🐶',
    money: '🌸',
	error: '❌'
}
const COLORS = {
    primary: '#FFB6C1',
	error: '#FF6961'
};

function readJSON(filePath) {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify({}, null, 2));
        return {};
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJSON(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

const getPets = () => {
    const p = path.join(__dirname, 'data', 'pets.json');
    return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : {};
};

module.exports = {
    data: new SlashCommandBuilder()
		.setName('pet')
        .setDescription('Gestiona tus mascotas.')
        .addSubcommand(sub => sub.setName('list').setDescription('Lista tus mascotas.'))
        .addSubcommand(sub => sub.setName('equip').setDescription('Equipa una mascota.').addStringOption(o => o.setName('id').setDescription('ID de la mascota').setRequired(true)))
        .addSubcommand(sub => sub.setName('info').setDescription('Información de tu mascota equipada.')),
    category: 'currency',
    description: 'Gestiona tus mascotas.',
    usage: '!!pet <list|equip|info>',
    aliases: ['pets'],
    async execute(message, args) {
        const sub = args[0];
        if (sub === 'list') return this.listPets(message);
        if (sub === 'equip') return this.equipPet(message, args[1]);
        if (sub === 'info') return this.petInfo(message);
        return message.reply('Uso: `!!pet <list|equip|info>`');
    },
    async executeSlash(interaction) {
        const sub = interaction.options.getSubcommand();
        if (sub === 'list') return this.listPets(interaction);
        if (sub === 'equip') return this.equipPet(interaction, interaction.options.getString('id'));
        if (sub === 'info') return this.petInfo(interaction);
    },

    async listPets(ctx) {
        const user = ctx.user || ctx.author;
        const data = getUserData(user.id);
        const items = getPets()

        if (!data.inventory || data.inventory.length === 0) {
            return ctx.reply('🐶 No tienes mascotas. ¡Consigue una en cajas de botín o eventos!');
        }
		const petList = data.inventory.filter(item => items[item.id])


        if (!petList || petList.length === 0) {
            return ctx.reply('🐶 No tienes mascotas. ¡Consigue una en cajas de botín o eventos!');
        }

        const description = petList.map(pet => {
            const info = items[pet.id];
            return `**${info.name}** - ID: \`${pet.id}\``;
        }).join('\n');

        const embed = new EmbedBuilder()
            .setTitle(`Mascotas de ${user.username}`)
            .setDescription(description)
            .setColor('#FFD700');
        
        await ctx.reply({ embeds: [embed] });
    },

    async equipPet(ctx, petId) {
        const user = ctx.user || ctx.author;
        const data = getUserData(user.id);
        const items = getPets()

        const petToEquip = data.inventory.find(item => item.id === petId);
        if (!petToEquip) return ctx.reply(`${ICONS.error} No tienes esa mascota en el inventario.`);

		const pet = items[petId]
        if (!pet) return ctx.reply(`${ICONS.error} Esa mascota no existe en el inventario.`);

        data.pet = petId;
        updateUserData(user.id, data);

        const info = getPets()[petId];
        await ctx.reply(`✅ Has equipado a **${info.name}**.`);
    },

    async petInfo(ctx) {
        const user = ctx.user || ctx.author;
        const data = getUserData(user.id);

        if (!data.pet) return ctx.reply('❌ No tienes ninguna mascota equipada.');

        const items = getPets()
        const pet = items[data.pet]
		if (!pet) return ctx.reply('❌ No tienes ninguna mascota equipada.');

        const info = getPets()[data.pet];
        const embed = new EmbedBuilder()
            .setTitle(`🐶 ${info.name}`)
            .setDescription(info.description)
            .addFields(
                { name: 'Tipo', value: info.type, inline: true },
                { name: 'Rareza', value: info.rarity, inline: true },
                { name: 'Bonus Suerte', value: `+${info.bonus.luck}%`, inline: true },
                { name: 'Bonus Recolección', value: `+${info.bonus.yield}%`, inline: true }
            )
            .setColor('#FFA500')
            .setThumbnail('https://i.imgur.com/sB02t2v.gif'); // Placeholder aesthetic

        await ctx.reply({ embeds: [embed] });
    }
};