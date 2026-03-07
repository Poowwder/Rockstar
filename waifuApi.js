const nekosBestCategories = [
    'baka', 'bite', 'blush', 'bored', 'cry', 'cuddle', 'dance', 'facepalm', 'feed', 'happy', 
    'highfive', 'hug', 'kick', 'kiss', 'laugh', 'neko', 'nod', 'nom', 'nope', 'pat', 'poke', 
    'pout', 'protect', 'punch', 'shoot', 'shrug', 'slap', 'sleep', 'smile', 'smug', 'stare', 
    'think', 'thumbsup', 'tickle', 'wave', 'wink', 'yeet'
];

async function getAnimeImage(category) {
    let nbCategory = category;
    if (category === 'kill') nbCategory = 'shoot';

    if (nekosBestCategories.includes(nbCategory)) {
        try {
            const response = await fetch(`https://nekos.best/api/v2/${nbCategory}`);
            if (response.ok) {
                const data = await response.json();
                return { url: data.results[0].url, footer: data.results[0].anime_name };
            }
        } catch (e) {}
    }

    try {
        const response = await fetch(`https://api.waifu.pics/sfw/${category}`);
        if (!response.ok) throw new Error('API Error');
        const data = await response.json();
        return { url: data.url, footer: null };
    } catch (error) {
        console.error(`Error al obtener imagen de anime (${category}):`, error);
        return { url: null, footer: null };
    }
}

module.exports = { getAnimeImage };