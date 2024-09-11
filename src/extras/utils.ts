
export const capitalize = (word: string) => {
    return word.charAt(0).toUpperCase() + word.slice(1);
}
export const format_name = (name: string) => {
    const words = name.split('-');
    return words.map(word => capitalize(word)).join(' ');
}

export const get_national_dex_number = (pokemon: any) => {
    const national_dex_number = pokemon.pokemon_species.url.match(/pokemon-species\/([0-9]+)\//g).pop().split('/').filter(r => r != '').pop();
    return parseInt(national_dex_number);
}

export const get_pokemon_artwork = (national_dex_number:number) => {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${national_dex_number}.png`
}