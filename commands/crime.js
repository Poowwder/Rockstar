const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, updateUserData } = require('../userManager.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'crime',
    description: 'Comete un crimen en las sombras.',
    category: 'economía',
    data: new SlashCommandBuilder()
        .setName('crime')
        .setDescription('Comete un acto ilícito bajo tu propio riesgo.'),

    async execute(input) {
        const isSlash = !!input.user;
        const user = isSlash ? input.user : input.author;
        const client = input.client;
        const guild = input.guild;
        
        const getE = () => {
            const source = guild ? guild.emojis.cache : client.emojis.cache;
            const available = source.filter(e => e.available);
            return available.size > 0 ? available.random().toString() : '🌑';
        };

        let data = await getUserData(user.id);
        const premium = (data.premiumType || 'none').toLowerCase();
        const carteraActual = data.wallet || 0;

        // --- 🌍 INTEGRACIÓN DE EVENTOS GLOBALES ---
        const activePath = path.join(__dirname, '../data/activeEvent.json');
        let multiEvento = 1;

        if (fs.existsSync(activePath)) {
            const ev = JSON.parse(fs.readFileSync(activePath, 'utf8'));
            if (ev.type === 'money') multiEvento = ev.multiplier;
        }

        // --- 🎭 NARRATIVAS DEL ABISMO ---
        const crimenesExitosos = [
            "Hackeaste la terminal del banco central y desviaste fondos sin dejar rastro digital.",
            "Interceptaste un cargamento clandestino en los muelles bajo el amparo de la niebla.",
            "Vaciaste la caja fuerte de un magnate corrupto mientras dormía.",
            "Vendiste expedientes clasificados del gobierno en la dark web al mejor postor.",
            "Asaltaste un convoy blindado en la carretera secundaria y desapareciste en la noche."
        ];

        const crimenesFallidos = [
            "Las autoridades te acorralaron. Lograste escapar, pero dejaste caer parte del dinero en la persecución.",
            "Alguien te vendió a los federales. Tuviste que sobornar a un oficial corrupto para no terminar en una celda.",
            "Pisaste una alarma láser silenciosa. Tuviste que pagarle a un conductor de fuga para salvar tu pellejo.",
            "El trato salió mal. Hubo fuego cruzado y tu maletín con dinero quedó destrozado en el caos."
        ];

        const crimenesFatales = [
            "Un francotirador corporativo te alcanzó antes de que pudieras abrir la bóveda. Tu cuerpo y tus cuentas han desaparecido.",
            "El callejón no estaba vacío. Una emboscada rival terminó con tu vida. Las sombras te devoran, llevándose todo lo que tenías.",
            "Calculaste mal la carga explosiva. Volaste por los aires junto con el botín. Tu fortuna es ahora cenizas.",
            "El sindicato te descubrió robando de su territorio. Te arrojaron al río con zapatos de cemento."
        ];

        // --- 🎲 LÓGICA DE DESTINO ---
        const roll = Math.random(); // Número entre 0.0 y 1.0

        if (roll <= 0.50) {
            // ❌ FRACASO: 50% de las veces falla. Dentro de ese fallo, hay un 15% de probabilidad de morir.
            const isMuerte = Math.random() <= 0.15;

            if (isMuerte) {
                // ☠️ MUERTE: Pierde TODO
                data.wallet = 0;
                await updateUserData(user.id, data);

                const narrativaFatal = crimenesFatales[Math.floor(Math.random() * crimenesFatales.length)];
                const embedDeath = new EmbedBuilder()
                    .setColor('#1a1a1a')
                    .setAuthor({ name: `⊹ Eliminación Confirmada: ${user.username} ⊹`, iconURL: user.displayAvatarURL({ dynamic: true }) })
                    .setDescription(
                        `> *“${narrativaFatal}”*\n\n` +
                        `╰┈➤ 🥀 **Has Muerto.** Las calles no perdonan. Tu patrimonio ha sido reiniciado a \`0\` Flores.`
                    )
                    .setFooter({ text: `Nadie escapa de Nightfall.` })
                    .setTimestamp();

                return input.reply({ embeds: [embedDeath] });

            } else {
                // 🚨 MULTA: Pierde un porcentaje según su rango
                let porcentajeMulta = 0.15; // Normal: 15%
                if (premium === 'pro') porcentajeMulta = 0.10; // Pro: 10%
                if (premium === 'ultra') porcentajeMulta = 0.05; // Ultra: 5%

                // Calculamos la pérdida. Si su cartera es 0, no pierde nada (no hay números negativos)
                const perdida = Math.floor(carteraActual * porcentajeMulta);
                data.wallet = Math.max(0, carteraActual - perdida);
                await updateUserData(user.id, data);

                const narrativaFallo = crimenesFallidos[Math.floor(Math.random() * crimenesFallidos.length)];
                const embedFail = new EmbedBuilder()
                    .setColor('#1a1a1a')
                    .setAuthor({ name: `⊹ Operación Fallida: ${user.username} ⊹`, iconURL: user.displayAvatarURL({ dynamic: true }) })
                    .setDescription(
                        `> *“${narrativaFallo}”*\n\n` +
                        `╰┈➤ 🚨 **Daños / Sobornos:** Perdiste \`${perdida.toLocaleString()} 🌸\` (\`${porcentajeMulta * 100}%\`).\n` +
                        `╰┈➤ 💼 **Patrimonio restante:** \`${data.wallet.toLocaleString()} 🌸\`.`
                    )
                    .setFooter({ text: `Rockstar ⊹ Nightfall` })
                    .setTimestamp();

                return input.reply({ embeds: [embedFail] });
            }
        }

        // --- 💰 ÉXITO (El 50% restante) ---
        let bonoRango = 1.03; 
        if (premium === 'pro') bonoRango = 1.07; 
        if (premium === 'ultra') bonoRango = 1.10; 

        const base = Math.floor(Math.random() * 200) + 100;
        const finalReward = Math.floor((base * multiEvento) * bonoRango);

        data.wallet = carteraActual + finalReward;
        await updateUserData(user.id, data);

        const narrativaExito = crimenesExitosos[Math.floor(Math.random() * crimenesExitosos.length)];
        const embedWin = new EmbedBuilder()
            .setColor('#1a1a1a')
            .setAuthor({ name: `⊹ Operación Exitosa: ${user.username} ⊹`, iconURL: user.displayAvatarURL({ dynamic: true }) })
            .setDescription(
                `> *“${narrativaExito}”*\n\n` +
                `${getE()} **Botín asegurado:** \`${finalReward.toLocaleString()} 🌸\`\n` +
                `${getE()} **Patrimonio actual:** \`${data.wallet.toLocaleString()} 🌸\`\n` +
                (multiEvento > 1 ? `\n-# ${getE()} Bono global de evento (x${multiEvento}) activo.` : "")
            )
            .setFooter({ text: `Rockstar ⊹ Nightfall` })
            .setTimestamp();

        return input.reply({ embeds: [embedWin] });
    }
};
