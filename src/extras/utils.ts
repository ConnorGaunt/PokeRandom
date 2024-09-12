
export const capitalize = (word: string) => {
    return word.charAt(0).toUpperCase() + word.slice(1);
}
export const format_name = (name: string) => {
    const words = name.split('-');
    return words.map(word => capitalize(word)).join(' ');
}

export const get_national_dex_number = (pokemon: any) => {
    const national_dex_number = pokemon.pokemon_species.url.match(/pokemon-species\/([0-9]+)\//g).pop().split('/').filter((r:any) => r != '').pop();
    return parseInt(national_dex_number);
}

export const get_pokemon_artwork = (national_dex_number:number) => {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${national_dex_number}.png`
}

export function get_random_int(min:number, max:number) {
    const min_ceiled = Math.ceil(min);
    const max_floored = Math.floor(max);
    return Math.floor(Math.random() * (max_floored - min_ceiled) + min_ceiled);
    // The maximum is exclusive and the minimum is inclusive
}

// export function easeOutExpo (t: number,
//     b: number,
//     c: number,
//     d: number) {
//     return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
// }

export function normalize(min: number, max: number) {
    const delta = max - min;
    return function (val:number) {
        return (val - min) / delta;
    };
}

export function lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
}