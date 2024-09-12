import {
    NamedAPIResource,
    Pokedex,
    PokedexObject
} from "pokeapi-js-wrapper";
import {PokeApiOptions} from "../Types/PokeApiOptions.ts";

export default class PokeApi {

    poke_api: Pokedex;
    pokedexs: NamedAPIResource[] = [];
    selected_pokedex: PokedexObject | null = null;


    constructor(options : PokeApiOptions = {
        protocol: 'https',
        hostName: 'pokeapi.co',
        versionPath: '/api/v2/',
        cache: true,
        timeout: 5 * 1000, // 5s
        cacheImages: true
    })
    {
        this.poke_api = new Pokedex(options);
    }

    async get_pokedexs() {
        const resp = await this.poke_api.getPokedexsList();
        this.pokedexs = resp.results;
    }

    async get_pokedex(name: string) {
        const resp = await this.poke_api.getPokedexByName(name);
        this.selected_pokedex = resp;
    }

    get_pokemon_from_pokedex() {
        if(this.selected_pokedex === null) {
            console.error('No pokedex selected');
            return;
        }
        console.log(this.selected_pokedex.pokemon_entries);
        return this.selected_pokedex.pokemon_entries;
    }

}