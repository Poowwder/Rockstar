const { SlashCommandBuilder, EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder, ComponentType } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Muestra la lista de comandos disponibles 🌸'),

    async execute(interaction) {
        const userId = interaction.user.id;
        const member = interaction.guild.members.cache.get(userId);
        const apodo = member?.nickname || interaction.user.username;
        const guildIcon = interaction.guild.iconURL({ dynamic: true });

        // --- 1. LEER COMANDOS AUTOMÁTICAMENTE ---
        const commandsPath = path.join(__dirname, '../commands');
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        
        const categorias = {
            Economía: ['work', 'daily', 'pay', 'rob', 'shop', 'inventory', 'bal'],
            Social: ['profile', 'marry', 'setcolor', 'gift'],
            Config: ['setlogs', 'setup'], // Ajusta según tus nombres de archivos
            Otros: []
        };

        const todosLosComandos = [];
        for (const file of commandFiles) {
            const cmd = require(path.join(commandsPath, file));
            if (cmd.data) {
                todosLosComandos.push({
                    name: cmd.data.name,
                    description: cmd.data.description
                });
            }
        }

        // --- 2. EMBED PRINCIPAL (PORTADA) ---
        const embedPrincipal = new EmbedBuilder()
            .setAuthor({ name: `🌸 Guía de Comandos: ${apodo}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setTitle('✨ Centro de Ayuda Rockstar')
            .setColor('#FFB6C1')
            .setThumbnail("https://i.pinimg.com/originals/94/f9/0b/94f90b9b3f3a8b4b7b2b8d0a4f5f5f5f.gif")
            .setDescription(`Hola **${apodo}**, ¡bienvenido/a al menú de ayuda!\n Usa el menú de abajo para explorar las categorías.\n\n୨୧┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈୨୧\n> **Prefijo:** \`!!\`\n> **Comandos totales:** \`${todosLosComandos.length}\`\n୨୧┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈୨୧`)
            .setFooter({ text: `${interaction.guild.name} • Rockstar Sakura`, iconURL: guildIcon })
            .setTimestamp();

        // --- 3. MENÚ DE SELECCIÓN ---
        const menu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('select_help')
                .setPlaceholder('Selecciona una categoría...')
                .addOptions([
                    { label: 'Economía', description: 'Trabajos, robos y dinero.', value: 'eco', emoji: '💰' },
                    { label: 'Social', description: 'Perfil, bodas y colores.', value: 'soc', emoji: '🌸' },
                    { label: 'Todos los Comandos', description: 'Lista completa alfabética.', value: 'all', emoji: '📚' }
                ])
        );

        const response = await interaction.reply({ embeds: [embedPrincipal], components: [menu] });

        // --- 4. COLECTOR INTERACTIVO ---
        const collector = response.createMessageComponentCollector({ 
            componentType: ComponentType.StringSelect, 
            time: 60000 
        });

        collector.on('collect', async i => {
            if (i.user.id !== interaction.user.id) return i.reply({ content: "❌ No puedes usar este menú.", ephemeral: true });

            let embedCategoria = new EmbedBuilder()
                .setColor('#FFB6C1')
                .setFooter({ text: `${interaction.guild.name} • Rockstar Sakura`, iconURL: guildIcon })
                .setTimestamp();

            let filteredCommands = [];
            let titulo = "";

            if (i.values[0] === 'eco') {
                titulo = "💰 Categoría: Economía";
                filteredCommands = todosLosComandos.filter(c => categorias.Economía.includes(c.name));
            } else if (i.values[0] === 'soc') {
                titulo = "🌸 Categoría: Social";
                filteredCommands = todosLosComandos.filter(c => categorias.Social.includes(c.name));
            } else if (i.values[0] === 'all') {
                titulo = "📚 Todos los Comandos";
                filteredCommands = todosLosComandos;
            }

            const listaFormateada = filteredCommands.map(c => `\`!!${c.name}\`\n> ${c.description}`).join('\n\n');
            
            embedCategoria.setTitle(titulo)
                .setDescription(`୨୧┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈୨୧\n\n${listaFormateada || "No hay comandos en esta sección."}\n\n୨୧┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈୨୧`);

            await i.update({ embeds: [embedCategoria] });
        });

        collector.on('end', () => {
            interaction.editReply({ components: [] }).catch(() => null);
        });
    }
};