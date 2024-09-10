import {
    Pokedex,
    PokedexObject,
    PokemonEntry
} from 'pokeapi-js-wrapper'
import {
    useEffect,
    useRef,
    useState
} from 'react'
import {
    format_name
} from "./extras/utils.tsx";
import WheelColumn from "./components/WheelColumn.tsx";
import {useAnimate} from "framer-motion";
import classnames from "classnames";
import {Dice} from "./components/Icons/Dice.tsx";
import {Pokeball} from "./components/Icons/Pokeball.tsx";
import {ChevDown} from "./components/Icons/ChevDown.tsx";


function App() {

    const [loader, loader_anim] = useAnimate();
    const [poke_api, setPokeApi] = useState<Pokedex>();
    const [pokedexes, setPokedexes] = useState<Array<PokedexObject>>();
    const [selected_pokedex, setSelectedPokedex] = useState<PokedexObject|null>(null);
    const [all_pokemon, setPokemon] = useState([]);
    const [number_of_pokemon, setNumberOfPokemon] = useState(1);
    const [wheel_columns, setWheelColumns] = useState<Array<any>>([]);
    const wheel_refs = useRef([]);
    const [show_wheel, setShowWheel] = useState(false);
    const [show_loader, setShowLoader] = useState(false);
    const [green_screen, setGreenScreen] = useState(false);

    const [hide_columns, setHideColumns] = useState(false);
    const [hide_dex, setHideDex] = useState(false);
    const [hide_name, setHideName] = useState(false);
    const [hide_pokemon_bg, setHidePokemonBg] = useState(false);

    const get_pokemon_from_pokedex = async (selected_pokedex: PokedexObject) : Promise<Array< PokemonEntry>> => {
        const pokemon = await poke_api?.resource([selected_pokedex.url]);
        setPokemon(pokemon[0].pokemon_entries);
        setShowLoader(false);
        return pokemon[0].pokemon_entries;
    }

    const get_pokedexes = async () : Promise<Array<Pokedex>> => {
        const pokedexes = await poke_api?.resource(['/api/v2/pokedex/?limit=100']);
        setPokedexes(pokedexes[0].results);
        return pokedexes[0].results;
    }

    useEffect(() => {
        const p = new Pokedex({
            protocol: 'https',
            hostName: 'pokeapi.co',
            versionPath: '/api/v2/',
            cache: true,
            timeout: 5 * 1000, // 5s
            cacheImages: true
        });
        setPokeApi(p);
    }, []);

    useEffect(() => {
        if (poke_api) {
            get_pokedexes()
             .then(r => r);
        }
    }, [poke_api]);

    useEffect(() => {
        if (selected_pokedex) {
            get_pokemon_from_pokedex(selected_pokedex)
             .then(r => r);
        }
    }, [selected_pokedex]);

    useEffect(() =>
    {
        if(all_pokemon.length> 0){
            const cols = [];
            for (let i = 0; i < number_of_pokemon; i++)
            {
                const wheel_column = (
                    <WheelColumn
                        key={i}
                        delay={i * 200}
                        items={all_pokemon}
                        // @ts-ignore
                        ref={el => wheel_refs.current[i] = el}
                    />
                )
                cols.push(wheel_column);
            }
            setWheelColumns(cols);
        }
    }, [all_pokemon, number_of_pokemon]);

    useEffect(() =>
    {
        if(!loader.current) return;
        const loader_top = loader.current.querySelector('.loader__top');
        // const loader_top_svg = loader_top.querySelector('svg');
        const loader_bottom = loader.current.querySelector('.loader__bottom');

        const close_loader_anim = async () => {
            loader_anim(loader_top, {
                translateY: 'calc(-100% - 50px)'
            }, {
                duration: 0.3,
                ease: 'easeInOut'
            });
            loader_anim(loader_bottom, {
                // @ts-ignore
                translateY: 'calc(100% + 50px)'
            }, {
                duration: 0.3,
                ease: 'easeInOut'
            });
        }

        const show_loader_anim = async () => {
            loader_anim(loader_top, {
                translateY: 0
            }, {
                duration: 0.3,
                ease: 'easeInOut'
            });
            loader_anim(loader_bottom, {
                // @ts-ignore
                translateY: 0
            }, {
                duration: 0.3,
                ease: 'easeInOut'
            });
        }

        if(!show_loader && show_wheel && all_pokemon.length > 0)
        {
            void close_loader_anim();
        } else {
            void show_loader_anim();
        }

    }, [all_pokemon, show_wheel, show_loader]);

    const select_pokedex = (e: { target: { value: string; }; }) => {
        setShowLoader(true);
        setTimeout(() => {
            setPokemon([]);
            const value = e.target.value.trim();
            const index = parseInt(value);
            if(value === '' || isNaN(index)) {
                setSelectedPokedex(null);
                return;
            }
            if (pokedexes){
                setSelectedPokedex(pokedexes[index]);
                setShowLoader(false);
                setShowWheel(true);
            }
        }, 300);
    }

    function select_number_of_pokemon(number: number)
    {
        setShowLoader(true);
        setTimeout(() => {
            setNumberOfPokemon(number);
            setShowWheel(false);
        }, 300);
        setTimeout(() => {
            setShowWheel(true);
            setShowLoader(false);
        }, 600);

    }

    return (
    <main className={'content'}>
        <div className={'sidebar'}>
            <div className={'sidebar__top'}>
                <h1>PokeRandom</h1>
                {pokedexes &&
                    <>
                        <span>Pokedex:</span>
                        <div className={'select-container'}>
                            <select onChange={select_pokedex}>
                                <option value={''}>Select a Pokedex</option>
                                {pokedexes.map((
                                    pokedex: PokedexObject,
                                    index: number
                                ) =>
                                {
                                    return <option key={pokedex.name} value={index}>{format_name(pokedex.name)}</option>
                                })}
                            </select>

                            <ChevDown />
                        </div>
                    </>
                }
                <div className={'num-of-pokemon'}>
                    <span>Number of Pokemon</span>
                    <div className={'number-selector'}>
                        <span className={number_of_pokemon === 1
                                         ? 'active'
                                         : ''} onClick={() => select_number_of_pokemon(1)}>1</span>
                        <span className={number_of_pokemon === 2
                                         ? 'active'
                                         : ''} onClick={() => select_number_of_pokemon(2)}>2</span>
                        <span className={number_of_pokemon === 3
                                         ? 'active'
                                         : ''} onClick={() => select_number_of_pokemon(3)}>3</span>
                        <span className={number_of_pokemon === 4
                                         ? 'active'
                                         : ''} onClick={() => select_number_of_pokemon(4)}>4</span>
                        <span className={number_of_pokemon === 5 ? 'active' : ''} onClick={() => select_number_of_pokemon(5)}>5</span>
                        <span className={number_of_pokemon === 6 ? 'active' : ''} onClick={() => select_number_of_pokemon(6)}>6</span>
                    </div>
                </div>
                <div className={'settings-container'}>
                    <span>Settings:</span>
                    <div className={'settings'}>
                        <div className={'checkbox-container'}>
                            <input type="checkbox" id="green-screen" onChange={(e) => setGreenScreen(e.target.checked)}/>
                            <label htmlFor="green-screen">
                                <span className={'checkbox-container__toggle'}></span>
                                <span>Green Screen</span>
                            </label>
                        </div>
                        <div className={'checkbox-container'}>
                            <input type="checkbox" id="show-columns" onChange={(e) => setHideColumns(e.target.checked)}/>
                            <label htmlFor="show-columns">
                                <span className={'checkbox-container__toggle'}></span>
                                <span>Hide Columns</span>
                            </label>
                        </div>
                        <div className={'checkbox-container'}>
                            <input type="checkbox" id="show-dex" onChange={(e) => setHideDex(e.target.checked)}/>
                            <label htmlFor="show-dex">
                                <span className={'checkbox-container__toggle'}></span>
                                <span>Hide Dex</span>
                            </label>
                        </div>
                        <div className={'checkbox-container'}>
                            <input type="checkbox" id="show-name" onChange={(e) => setHideName(e.target.checked)}/>
                            <label htmlFor="show-name">
                                <span className={'checkbox-container__toggle'}></span>
                                <span>Hide Name</span>
                            </label>
                        </div>
                        <div className={'checkbox-container'}>
                            <input type="checkbox" id="show-pokemon-bg" onChange={(e) => setHidePokemonBg(e.target.checked)}/>
                            <label htmlFor="show-pokemon-bg">
                                <span className={'checkbox-container__toggle'}></span>
                                <span>Hide Pokemon Background</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {
                show_wheel &&
                selected_pokedex &&
                all_pokemon.length > 0 &&
                wheel_columns.length > 0 && (
                    <button onClick={() =>
                    {
                        console.log('SPIN THAT WHEEL!');
                        wheel_refs.current.forEach(wheel => {
                            // @ts-ignore
                            wheel.spin_wheel();
                        });
                    }}>
                        <Dice/>
                        <span>Randomize</span>
                    </button>
                )
            }

        </div>
        <div className={classnames('pokemon-wheel', {
            'green-screen': green_screen,
            'hide-columns': hide_columns,
            'hide-dex': hide_dex,
            'hide-name': hide_name,
            'hide-pokemon-bg': hide_pokemon_bg
        })}>
            {
                show_wheel &&
                selected_pokedex &&
                all_pokemon.length > 0 &&
                wheel_columns.length > 0 && (
                    <>
                        {wheel_columns}
                    </>
                )
            }
            <span className={'loader'} ref={loader}>
                <div className={'loader__top'}>
                    <Pokeball />
                </div>
                <div className={'loader__bottom'}></div>
            </span>
        </div>
    </main>
    )
}

export default App
