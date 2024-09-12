import './styles/index.scss'
import PokeApi from "./Classes/PokeApi.ts";
import PokemonCard from "./Classes/PokemonCard.ts";
import CanvasWheel from "./Classes/CanvasWheel.ts";
import u from 'umbrellajs';
import {
    format_name,
    get_random_int
} from "./extras/utils.ts";

window.addEventListener('DOMContentLoaded', async () => {
    console.clear();

    const wheels_container = u('#pokemon-wheel').first() as HTMLElement;
    const random_button = u('#randomize-button');
    const pokedex_select = u('#pokedex-selector');
    const number_of_wheels_buttons = u('.number-selector span');
    let number_of_wheels = 3;
    let wheels: CanvasWheel[] = [];

    const poke_api = new PokeApi();
    await poke_api.get_pokedexs();
    await poke_api.get_pokedex('paldea');
    let pokemon_entries = poke_api.get_pokemon_from_pokedex();

    // const randomly_selected_pokemon = [];
    // for (let i = 0; i < 6; i++) {
    //     const random_index = Math.floor(Math.random() * pokemon_entries!.length);
    //     const random_pokemon = pokemon_entries![random_index];
    //     randomly_selected_pokemon.push(random_pokemon);
    // }


    // console.log(randomly_selected_pokemon);
    generate_wheels();

    function generate_wheels(){
        wheels_container.innerHTML = '';
        wheels = [];
        if(pokemon_entries !== undefined) {
            for(let i = 0; i < number_of_wheels; i++) {
                const wheel = new CanvasWheel(
                    wheels_container,
                    number_of_wheels,
                    i
                );
                let start_offset = 0;
                for (let j = pokemon_entries.length - 3; j < pokemon_entries.length; j++) {
                    const pokemon_card = new PokemonCard(pokemon_entries[j], wheel.element, start_offset);
                    wheel.add_item(pokemon_card);
                    start_offset++;
                }
                for(let j = 0; j < pokemon_entries.length; j++) {
                    const pokemon_card = new PokemonCard(pokemon_entries[j], wheel.element, j + start_offset);
                    wheel.add_item(pokemon_card);
                }
                for(let j = 0; j < 3; j++) {
                    const pokemon_card = new PokemonCard(pokemon_entries[j], wheel.element, wheel.items.length + j);
                    wheel.add_item(pokemon_card);
                }
                wheel.init();
                wheels.push(wheel);
            }
        }
    }

    pokedex_select.html('');
    for (let i = 0; i < poke_api.pokedexs.length; i++) {
        const pokedex = poke_api.pokedexs[i];
        const option = document.createElement('option');
        option.value = pokedex.name;
        option.innerText = format_name(pokedex.name);
        pokedex_select.append(option);
    }

    pokedex_select.on('change', async () => {
        const selected_pokedex_name = pokedex_select.first().value;
        await poke_api.get_pokedex(selected_pokedex_name);
        pokemon_entries = poke_api.get_pokemon_from_pokedex();
        generate_wheels();
    });

    number_of_wheels_buttons.each((button) => {
        const b = button as HTMLElement;
        if(b.dataset.activeNumber === number_of_wheels.toString()) {
            b.classList.add('active');
        }
        b.addEventListener('click', () => {
            number_of_wheels_buttons.each((_button) => {
                _button.classList.remove('active');
            });
            b.classList.add('active');
            number_of_wheels = parseInt(b.dataset.activeNumber!.toString());
            generate_wheels();
        });
    })


    random_button.on('click', () => {

        let selected : Array<number> = [];
        for(let i = 0; i < wheels.length; i++) {
            let random_index = 0;
            do {
                random_index = get_random_int(0, pokemon_entries!.length) + 3;
            } while(selected.includes(random_index));
            selected.push(random_index);
        }
        selected = selected.sort((a, b) => b - a);
        wheels.forEach((wheel, index) => {
            setTimeout(() => {
                wheel.spin(selected[index]);
            }, wheel.wheel_number * 200);
        });
    })

});



