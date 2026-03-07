const { SlashCommandBuilder, EmbedBuilder, MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

const commands = [
    {
        name: '8ball',
        description: 'Pregúntale algo a la bola 8 mágica.',
        builder: (builder) => builder.addStringOption(opt => opt.setName('pregunta').setDescription('La pregunta que quieres hacer.').setRequired(true)),
        async execute(ctx, question) {
            const responses = ['Es cierto.', 'Sin duda.', 'Sí, definitivamente.', 'Puedes contar con ello.', 'Como yo lo veo, sí.', 'Lo más probable.', 'Las perspectivas son buenas.', 'Sí.', 'Los signos apuntan a que sí.', 'Respuesta confusa, intenta de nuevo.', 'Pregunta de nuevo más tarde.', 'Mejor no decírtelo ahora.', 'No se puede predecir ahora.', 'Concéntrate y pregunta de nuevo.', 'No cuentes con ello.', 'Mi respuesta es no.', 'Mis fuentes dicen que no.', 'Las perspectivas no son tan buenas.', 'Muy dudoso.'];
            const response = responses[Math.floor(Math.random() * responses.length)];
            const embed = new EmbedBuilder()
                .setTitle('🎱 Bola 8 Mágica')
                .addFields(
                    { name: 'Tu Pregunta', value: question },
                    { name: 'Mi Respuesta', value: response }
                )
                .setColor('#AEC6CF');
            await ctx.reply({ embeds: [embed] });
        }
    },
    {
        name: 'say',
        description: 'Haz que el bot diga algo.',
        builder: b => b.addStringOption(o => o.setName('texto').setDescription('El texto que dirá el bot.').setRequired(true)),
        async execute(ctx, text) {
            // En un bot público, es importante sanitizar este input para evitar abusos como @everyone.
            // Por simplicidad, aquí se envía directamente.
            if (ctx.isChatInputCommand?.()) {
                await ctx.reply({ content: '✅ Mensaje enviado.', ephemeral: true });
                await ctx.channel.send(text);
            } else {
                await ctx.delete();
                await ctx.channel.send(text);
            }
        }
    },
    {
        name: 'ship',
        description: 'Calcula la compatibilidad entre dos usuarios.',
        builder: b => b.addUserOption(o => o.setName('usuario1').setDescription('El primer usuario.').setRequired(true)).addUserOption(o => o.setName('usuario2').setDescription('El segundo usuario (opcional).')),
        async execute(ctx, user1, user2) {
            const userTwo = user2 || (ctx.user || ctx.author);
            const percentage = Math.floor(Math.random() * 101);
            let message;
            if (percentage < 10) message = 'Casi nula. 😬';
            else if (percentage < 40) message = 'No está mal, podría haber algo. 🤔';
            else if (percentage < 75) message = '¡Una gran compatibilidad! ❤️';
            else message = '¡Son almas gemelas! 💖';

            const embed = new EmbedBuilder()
                .setTitle('💕 Medidor de Ship')
                .setDescription(`La compatibilidad entre **${user1.username}** y **${userTwo.username}** es del... **${percentage}%**!\n\n${message}`)
                .setColor('#FF69B4');
            await ctx.reply({ embeds: [embed] });
        }
    },
    {
        name: 'roll',
        description: 'Lanza un dado.',
        builder: b => b.addIntegerOption(o => o.setName('caras').setDescription('Número de caras del dado (defecto: 6).')),
        async execute(ctx, sides = 6) {
            const result = Math.floor(Math.random() * sides) + 1;
            await ctx.reply(`🎲 Has lanzado un dado de ${sides} caras y ha salido... **${result}**!`);
        }
    },
    {
        name: 'confess',
        description: 'Envía una confesión anónima.',
        builder: b => b.addStringOption(o => o.setName('confesion').setDescription('Tu confesión.').setRequired(true)),
        async execute(ctx, confession) {
            // Intenta buscar un canal llamado "confesiones"
            const channel = ctx.guild.channels.cache.find(c => c.name.includes('confesiones'));
            if (!channel) return ctx.reply({ content: '❌ No encontré un canal llamado "confesiones".', flags: MessageFlags.Ephemeral });

            const embed = new EmbedBuilder()
                .setTitle('🤫 Confesión Anónima')
                .setDescription(confession)
                .setColor('#FF69B4')
                .setTimestamp();
            
            await channel.send({ embeds: [embed] });
            await ctx.reply({ content: '✅ Confesión enviada.', flags: MessageFlags.Ephemeral });
        }
    },
    {
        name: 'banana',
        description: 'Mide el tamaño de tu banana.',
        async execute(ctx) {
            const size = Math.floor(Math.random() * 30);
            await ctx.reply(`🍌 Tu banana mide **${size} cm**. ¡Impresionante!`);
        }
    },
    {
        name: 'lucky',
        description: 'Descubre tu porcentaje de suerte hoy.',
        async execute(ctx) {
            const luck = Math.floor(Math.random() * 101);
            await ctx.reply(`🍀 Tu suerte hoy es del **${luck}%**.`);
        }
    },
    {
        name: 'tweet',
        description: 'Crea un tweet falso.',
        builder: b => b.addStringOption(o => o.setName('texto').setDescription('Contenido del tweet.').setRequired(true)),
        async execute(ctx, text) {
            const user = ctx.user || ctx.author;
            // Usamos una API pública para generar la imagen (nekobot)
            const url = `https://nekobot.xyz/api/imagegen?type=tweet&username=${user.username}&text=${encodeURIComponent(text)}`;
            try {
                const res = await fetch(url);
                const json = await res.json();
                if (json.success) {
                    const embed = new EmbedBuilder().setImage(json.message).setColor('#1DA1F2');
                    await ctx.reply({ embeds: [embed] });
                } else {
                    await ctx.reply('❌ Error al generar el tweet.');
                }
            } catch (e) {
                await ctx.reply('❌ Error de conexión con la API.');
            }
        }
    },
    {
        name: 'rps',
        description: 'Juega Piedra, Papel o Tijera.',
        builder: b => b.addStringOption(o => o.setName('eleccion').setDescription('Piedra, papel o tijera.').setRequired(true).addChoices({ name: 'Piedra', value: 'rock' }, { name: 'Papel', value: 'paper' }, { name: 'Tijera', value: 'scissors' })),
        async execute(ctx, choice) {
            const options = ['rock', 'paper', 'scissors'];
            const botChoice = options[Math.floor(Math.random() * options.length)];
            const map = { rock: '🪨', paper: '📄', scissors: '✂️' };
            
            let result;
            if (choice === botChoice) result = '¡Empate!';
            else if (
                (choice === 'rock' && botChoice === 'scissors') ||
                (choice === 'paper' && botChoice === 'rock') ||
                (choice === 'scissors' && botChoice === 'paper')
            ) result = '¡Ganaste!';
            else result = '¡Perdiste!';

            await ctx.reply(`Tú: ${map[choice]} vs Bot: ${map[botChoice]}\n**${result}**`);
        }
    },
    {
        name: 'guess-game',
        description: 'Adivina el número del 1 al 10.',
        builder: b => b.addIntegerOption(o => o.setName('numero').setDescription('Tu número.').setRequired(true)),
        async execute(ctx, number) {
            const target = Math.floor(Math.random() * 10) + 1;
            if (number === target) await ctx.reply(`🎉 ¡Correcto! El número era ${target}.`);
            else await ctx.reply(`❌ Incorrecto. El número era ${target}.`);
        }
    },
    {
        name: 'reputation',
        description: 'Da reputación a un usuario.',
        builder: b => b.addUserOption(o => o.setName('usuario').setDescription('Usuario.').setRequired(true)),
        async execute(ctx, target) {
            if (target.id === (ctx.user || ctx.author).id) return ctx.reply('❌ No puedes darte reputación a ti mismo.');
            await ctx.reply(`🌟 Has dado +1 punto de reputación a **${target.username}**.`);
        }
    },
    {
        name: 'trivia',
        description: 'Responde una pregunta de trivia.',
        async execute(ctx) {
            const questions = [
                { q: '¿Cuál es la capital de Francia?', a: 'paris' },
                { q: '¿Cuántos planetas hay en el sistema solar?', a: '8' },
                { q: '¿De qué color es el caballo blanco de Santiago?', a: 'blanco' }
            ];
            const q = questions[Math.floor(Math.random() * questions.length)];
            await ctx.reply(`❓ **Trivia:** ${q.q}\n*(Responde mentalmente, no puedo verificar tu respuesta aún)*\nRespuesta: ||${q.a}||`);
        }
    },
    // Juegos simplificados
    {
        name: 'tictactoe',
        description: 'Juega al tres en raya (simplificado).',
        async execute(ctx) {
            const board = ['⬜', '⬜', '⬜', '⬜', '⬜', '⬜', '⬜', '⬜', '⬜'];
            // Simulación simple: Bot hace un movimiento random
            const botMove = Math.floor(Math.random() * 9);
            board[botMove] = '⭕';
            
            let boardStr = '';
            for (let i = 0; i < 9; i++) {
                boardStr += board[i];
                if ((i + 1) % 3 === 0) boardStr += '\n';
            }
            
            await ctx.reply(`🎮 **Tic Tac Toe** (Demo)\nEl bot ha movido:\n${boardStr}\n*Versión completa requiere interactividad avanzada.*`);
        }
    },
    {
        name: 'hangman',
        description: 'Juego del ahorcado (simplificado).',
        async execute(ctx) {
            const words = ['discord', 'bot', 'javascript', 'rockstar'];
            const word = words[Math.floor(Math.random() * words.length)];
            const hidden = word.replace(/./g, '_ ');
            await ctx.reply(`😵 **Ahorcado**\nPalabra: \`${hidden}\`\n*Intenta adivinar la palabra completa!* (Solución: ||${word}||)`);
        }
    },
    {
        name: 'unscramble',
        description: 'Ordena la palabra.',
        async execute(ctx) {
            const words = ['banana', 'apple', 'cherry', 'orange'];
            const word = words[Math.floor(Math.random() * words.length)];
            const scrambled = word.split('').sort(() => 0.5 - Math.random()).join('');
            await ctx.reply(`🔠 Ordena: **${scrambled}**\nSolución: ||${word}||`);
        }
    }
];

// Mapear comandos individuales (para prefijo !!)
const individualCommands = commands.map(cmdConfig => {
    const command = {
        data: new SlashCommandBuilder()
            .setName(cmdConfig.name)
            .setDescription(cmdConfig.description),
        skipSlash: true, // No registrar individualmente
        category: 'fun',
        description: cmdConfig.description,
        usage: cmdConfig.usage || `!!${cmdConfig.name}`,
        aliases: cmdConfig.aliases || [],
        
        async execute(message, args) {
            switch(cmdConfig.name) {
                case '8ball':
                    return cmdConfig.execute(message, args.join(' '));
                case 'say':
                    return cmdConfig.execute(message, args.join(' '));
                case 'ship':
                    const user1 = message.mentions.users.first();
                    const user2 = message.mentions.users.last();
                    if (!user1) return message.reply('Debes mencionar al menos a un usuario.');
                    return cmdConfig.execute(message, user1, user2 === user1 ? null : user2);
                case 'roll':
                    return cmdConfig.execute(message, parseInt(args[0]) || 6);
                case 'confess':
                case 'tweet':
                    return cmdConfig.execute(message, args.join(' '));
                case 'rps':
                case 'guess-game':
                    return cmdConfig.execute(message, args[0]);
                case 'reputation':
                    return cmdConfig.execute(message, message.mentions.users.first());
                default:
                    return cmdConfig.execute(message);
            }
        }
    };
    if (cmdConfig.builder) {
        cmdConfig.builder(command.data);
    }
    return command;
});

// Comando Maestro /fun
const masterFunCommand = {
    data: new SlashCommandBuilder()
        .setName('fun')
        .setDescription('Comandos de diversión y minijuegos.'),
    category: 'fun',
    description: 'Colección de juegos y diversión.',
    async executeSlash(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const cmdConfig = commands.find(c => c.name === subcommand);

        if (!cmdConfig) return;

        // Lógica de enrutamiento idéntica a la anterior, pero usando el config encontrado
        switch(cmdConfig.name) {
            case '8ball':
                return cmdConfig.execute(interaction, interaction.options.getString('pregunta'));
            case 'say':
                return cmdConfig.execute(interaction, interaction.options.getString('texto'));
            case 'ship':
                return cmdConfig.execute(interaction, interaction.options.getUser('usuario1'), interaction.options.getUser('usuario2'));
            case 'roll':
                return cmdConfig.execute(interaction, interaction.options.getInteger('caras') || 6);
            case 'confess':
                return cmdConfig.execute(interaction, interaction.options.getString('confesion'));
            case 'tweet':
                return cmdConfig.execute(interaction, interaction.options.getString('texto'));
            case 'rps':
                return cmdConfig.execute(interaction, interaction.options.getString('eleccion'));
            case 'guess-game':
                return cmdConfig.execute(interaction, interaction.options.getInteger('numero'));
            case 'reputation':
                return cmdConfig.execute(interaction, interaction.options.getUser('usuario'));
            default:
                if (cmdConfig.executeSlash) return cmdConfig.executeSlash(interaction);
                return cmdConfig.execute(interaction);
        }
    }
};

// Construir subcomandos dinámicamente
commands.forEach(cmd => {
    masterFunCommand.data.addSubcommand(sub => {
        sub.setName(cmd.name).setDescription(cmd.description);
        if (cmd.builder) cmd.builder(sub); // Reutilizamos el builder original
        return sub;
    });
});

module.exports = [...individualCommands, masterFunCommand];