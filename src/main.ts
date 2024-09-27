import './styles/index.scss'
import PokeApi from "./Classes/PokeApi.ts";
import PokemonCard from "./Classes/PokemonCard.ts";
import CanvasWheel from "./Classes/CanvasWheel.ts";
import u from 'umbrellajs';
import {
    format_name,
    get_random_int
} from "./extras/utils.ts";
import {PokemonEntry} from "pokeapi-js-wrapper";

window.addEventListener('DOMContentLoaded', async () => {
    console.clear();

    const wheels_container = u('#pokemon-wheel').first() as HTMLElement;
    const random_button = u('#randomize-button');
    const pokedex_select = u('#pokedex-selector');
    const number_of_wheels_buttons = u('.number-selector span');
    const use_green_screen = u('#green-screen');
    const hide_columns = u('#hide-columns');
    const spin_length = u('#spin-length');
    const spin_length_text = u('span.spin-length-text');
    let number_of_wheels = 6;
    let wheels: CanvasWheel[] = [];

    const poke_api = new PokeApi();
    await poke_api.get_pokedexs();
    let pokemon_entries: PokemonEntry[] | undefined;
    let loading_interval: any = null;
    const loader_anim_length = 300;
    const loader_spin_length = 1100;

    // const randomly_selected_pokemon = [];
    // for (let i = 0; i < 6; i++) {
    //     const random_index = Math.floor(Math.random() * pokemon_entries!.length);
    //     const random_pokemon = pokemon_entries![random_index];
    //     randomly_selected_pokemon.push(random_pokemon);
    // }


    const show_loader = () => {
        wheels_container.classList.add('is-loading');
        setTimeout(() => {
            wheels_container.classList.add('spin');
            loading_interval = setInterval(() => {
                wheels_container.classList.remove('spin');
                setTimeout(() => {
                    wheels_container.classList.add('spin');
                }, 100);
            }, loader_spin_length);
        }, loader_anim_length);
    }

    const hide_loader = () => {
        clearInterval(loading_interval)
        setTimeout(() => {
            wheels_container.classList.remove('is-loading');
            wheels_container.classList.remove('spin');
        }, loader_spin_length);
    }


    function generate_wheels(){
        wheels_container.querySelectorAll('canvas').forEach(w => {
            w.remove();
        })
        wheels = [];
        if(pokemon_entries !== undefined && pokemon_entries.length > 0) {
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

    pokedex_select.html('<option value="">Select a Pokedex</option>');
    for (let i = 0; i < poke_api.pokedexs.length; i++) {
        const pokedex = poke_api.pokedexs[i];
        const option = document.createElement('option');
        option.value = pokedex.name;
        option.innerText = format_name(pokedex.name);
        pokedex_select.append(option);
    }

    pokedex_select.on('change', async () => {
        show_loader();
        setTimeout(async () => {
            // @ts-ignore
            const selected_pokedex_name = pokedex_select.first().value;
            if(selected_pokedex_name !== ''){
                await poke_api.get_pokedex(selected_pokedex_name);
                pokemon_entries = poke_api.get_pokemon_from_pokedex();
            } else {
                pokemon_entries = [];
            }
            generate_wheels();
            requestAnimationFrame(should_hide_loader);
        }, loader_anim_length)
    });

    number_of_wheels_buttons.each((button) => {
        const b = button as HTMLElement;
        if(b.dataset.activeNumber === number_of_wheels.toString()) {
            b.classList.add('active');
        }
        b.addEventListener('click', () => {
            show_loader();
            setTimeout(async () => {
                requestAnimationFrame(should_hide_loader);
                number_of_wheels_buttons.each((_button) => {
                    _button.classList.remove('active');
                });
                b.classList.add('active');
                number_of_wheels = parseInt(b.dataset.activeNumber!.toString());
                generate_wheels();
            }, loader_anim_length)
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


    use_green_screen.on('change', (e)=> {
        const target = e.target as HTMLInputElement;
        if(target.checked){
            wheels_container.classList.add('green-screen');
        } else {
            wheels_container.classList.remove('green-screen');
        }
    });
    hide_columns.on('change', (e) => {
        const target = e.target as HTMLInputElement;
        if(target.checked){
            wheels_container.classList.add('hide-cols');
            wheels.forEach(wheel => {
                wheel.set_size(false)
            })
        } else {
            wheels_container.classList.remove('hide-cols');
            wheels.forEach(wheel => {
                wheel.set_size()
            })
        }
    });


    spin_length.on(['change', 'input'], (e) => {
        const target = e.target as HTMLInputElement;
        const value = parseInt(target.value);
        spin_length_text.text((value / 1000).toFixed(1).replace('.0', ''));
        wheels.forEach(wheel => {
            wheel.set_spin_length(value);
        })
    })


    function should_hide_loader(){

        console.log('checking should_hide_loader');

        if(pokemon_entries?.length === 0){
            wheels_container.classList.remove('spin');
            clearInterval(loading_interval);
            requestAnimationFrame(should_hide_loader);
            return;
        }

        if(loading_interval !== null){
            const ready_wheels = wheels.map(r=>r).filter(w => w.ready).length;
            if(ready_wheels !== number_of_wheels){
                requestAnimationFrame(should_hide_loader);
                return;
            }
            hide_loader();
        }
    }

    requestAnimationFrame(should_hide_loader);



    // console.log(randomly_selected_pokemon);
    generate_wheels();

});



