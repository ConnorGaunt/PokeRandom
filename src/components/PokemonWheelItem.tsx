import {
    format_name,
    get_national_dex_number,
    get_pokemon_artwork
} from "../extras/utils.tsx";

export function PokemonWheelItem(props: { pokemon: any; }) {

    const {pokemon} = props;

    return (
        <div key={get_national_dex_number(pokemon)} className={'pokemon-grid__item'}>
            <img src={get_pokemon_artwork(get_national_dex_number(pokemon))}
                 alt={pokemon.pokemon_species.name}/>
            <div className={'pokemon-grid__item__info'}>
                <p className={'pokemon-grid__item__info__dex'}>Dex: #{pokemon.entry_number} - National Dex: #{get_national_dex_number(pokemon)}</p>
                <p className={'pokemon-grid__item__info__name'}>{format_name(pokemon.pokemon_species.name)}</p>
            </div>
        </div>
    );
}