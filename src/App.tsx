import {
    Pokedex,
    PokedexObject,
    PokemonEntry
} from 'pokeapi-js-wrapper'
import {
    useEffect,
    useState
} from 'react'
import {
    format_name
} from "./extras/utils.tsx";
import WheelColumn from "./components/WheelColumn.tsx";
import {useAnimate} from "framer-motion";
import classnames from "classnames";


function App() {

    const [loader, loader_anim] = useAnimate();
    const [poke_api, setPokeApi] = useState<Pokedex>();
    const [pokedexes, setPokedexes] = useState<Array<PokedexObject>>();
    const [selected_pokedex, setSelectedPokedex] = useState<PokedexObject|null>(null);
    const [all_pokemon, setPokemon] = useState([]);
    const [number_of_pokemon, setNumberOfPokemon] = useState(1);
    const [wheel_spinning, setWheelSpinning] = useState(false);
    const [wheel_columns, setWheelColumns] = useState<Array<any>>([]);
    const [show_wheel, setShowWheel] = useState(false);
    const [show_loader, setShowLoader] = useState(false);
    const [green_screen, setGreenScreen] = useState(false);

    const [hide_columns, setHideColumns] = useState(false);
    const [hide_dex, setHideDex] = useState(false);
    const [hide_name, setHideName] = useState(false);
    const [hide_pokemone_bg, setHidePokemonBg] = useState(false);

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
        const cols = [];
        for (let i = 0; i < number_of_pokemon; i++)
        {
            cols.push(i);
        }
        setWheelColumns(cols);
    }, [number_of_pokemon]);

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
            close_loader_anim()
             .then(r => r);
        } else {
            show_loader_anim()
             .then(r => r);
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
                        <span>Podedex:</span>
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

                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <path stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="m6 9 6 6 6-6"/>
                            </svg>
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

            <button onClick={() =>
            {
                setWheelSpinning(true);
                setWheelColumns(wheel_columns.map(r => r));
            }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M454.608 111.204 280.557 6.804C272.992 2.268 264.504 0 256 0c-8.507 0-16.996 2.268-24.557 6.797L57.392 111.204c-5.346 3.203-9.916 7.37-13.555 12.192l207.902 124.707c2.622 1.575 5.896 1.575 8.518 0L468.16 123.396c-3.639-4.822-8.205-8.989-13.552-12.192zM177.16 131.738c-12.056 8.371-31.302 8.16-42.984-.49-11.684-8.65-11.382-22.463.678-30.842 12.056-8.386 31.304-8.16 42.992.482 11.679 8.651 11.374 22.456-.686 30.85zm199.143 2.388c-12.056 8.38-31.306 8.16-42.992-.49-11.68-8.65-11.378-22.462.685-30.841 12.053-8.38 31.302-8.168 42.985.482 11.683 8.651 11.378 22.455-.678 30.849zm-130.167 124.24L38.004 133.523c-2.457 5.802-3.794 12.116-3.794 18.62v208.084c0 16.773 8.801 32.311 23.182 40.946l174.051 104.392c5.828 3.496 12.203 5.629 18.714 6.435V265.464c-.001-2.908-1.526-5.606-4.021-7.098zM75.845 369.736c-12.052-6.571-21.829-21.671-21.829-33.728 0-12.056 9.777-16.502 21.829-9.931 12.056 6.57 21.826 21.671 21.826 33.728 0 12.056-9.769 16.501-21.826 9.931zm0-121.867c-12.052-6.578-21.829-21.678-21.829-33.728 0-12.056 9.777-16.501 21.829-9.931 12.056 6.571 21.826 21.671 21.826 33.728 0 12.048-9.769 16.502-21.826 9.931zm60.934 94.145c-12.056-6.571-21.826-21.671-21.826-33.728s9.769-16.502 21.826-9.931c12.056 6.571 21.829 21.671 21.829 33.728 0 12.048-9.773 16.502-21.829 9.931zm60.937 94.144c-12.056-6.571-21.83-21.671-21.83-33.727 0-12.049 9.773-16.495 21.83-9.924 12.056 6.57 21.826 21.67 21.826 33.72-.001 12.057-9.77 16.502-21.826 9.931zm0-121.866c-12.056-6.57-21.83-21.671-21.83-33.727 0-12.056 9.773-16.502 21.83-9.931 12.056 6.571 21.826 21.671 21.826 33.727-.001 12.056-9.77 16.502-21.826 9.931zm276.276-180.769L265.864 258.366c-2.494 1.492-4.02 4.19-4.02 7.098V512c6.506-.806 12.889-2.939 18.714-6.435l174.051-104.392c14.381-8.635 23.182-24.172 23.182-40.946V152.143c-.001-6.503-1.338-12.817-3.799-18.62zm-152.76 129.409c12.053-6.571 21.826-2.125 21.826 9.931 0 12.049-9.773 27.149-21.826 33.72-12.06 6.571-21.83 2.125-21.83-9.924 0-12.055 9.77-27.156 21.83-33.727zm0 185.803c-12.06 6.57-21.83 2.125-21.83-9.931s9.77-27.15 21.83-33.728c12.053-6.571 21.826-2.118 21.826 9.931 0 12.057-9.773 27.157-21.826 33.728zm1.304-71.072c-12.056 6.571-21.83 2.117-21.83-9.939 0-12.048 9.773-27.149 21.83-33.72 12.056-6.57 21.826-2.125 21.826 9.931s-9.77 27.15-21.826 33.728zm104.784 8.74c-12.056 6.571-21.826 2.125-21.826-9.931s9.769-27.156 21.826-33.72c12.056-6.578 21.829-2.133 21.829 9.924 0 12.056-9.773 27.157-21.829 33.727zm0-71.071c-12.056 6.563-21.826 2.125-21.826-9.931s9.769-27.157 21.826-33.728c12.056-6.571 21.829-2.125 21.829 9.931 0 12.049-9.773 27.157-21.829 33.728zm0-71.079c-12.056 6.57-21.826 2.125-21.826-9.924 0-12.056 9.769-27.157 21.826-33.728 12.056-6.571 21.829-2.125 21.829 9.931 0 12.05-9.773 27.15-21.829 33.721z"/></svg>
                <span>Randomize</span>
            </button>
        </div>
        <div className={classnames('pokemon-wheel', {
            'green-screen': green_screen,
            'hide-columns': hide_columns,
            'hide-dex': hide_dex,
            'hide-name': hide_name,
            'hide-pokemon-bg': hide_pokemone_bg
        })}>
            {
                show_wheel &&
                selected_pokedex &&
                all_pokemon.length > 0 &&
                wheel_columns.length > 0 &&
                wheel_columns.map(col_index => (
                    <WheelColumn
                        key={`wheel-column-${col_index}`}
                        items={all_pokemon}
                        is_spinning={wheel_spinning}
                        delay={col_index * 200}
                        onFinished={setWheelSpinning}
                    />
                ))
            }
            <span className={'loader'} ref={loader}>
                <div className={'loader__top'}>
                    <svg xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" viewBox="0 0 1324.2 1318.92">
                        <path
                            d="M803.3 109.43c5.51 1.25 11.15.8 16.72 1.14q33.21 2.09 66 7.37a644.69 644.69 0 0 1 90.86 21.31A663.14 663.14 0 0 1 1424 618.05a651.3 651.3 0 0 1 15 90.54c1.9 20.22 3.38 40.5 2.81 60.81-.68 23.92-1.81 47.81-4.48 71.63a659.21 659.21 0 0 1-176.67 380 658.77 658.77 0 0 1-224.36 155.68 645.56 645.56 0 0 1-125.58 38.68A659.24 659.24 0 0 1 822 1427a673.91 673.91 0 0 1-90-.31 659.33 659.33 0 0 1-382.35-157.16Q218 1156.34 157.8 993.51a636.93 636.93 0 0 1-32.59-127.7c-6.29-42.44-8.93-85.12-6.69-128A662.25 662.25 0 0 1 641.31 124a676.56 676.56 0 0 1 92.23-13c7.05-.51 14.11-.68 21.16-1a26.47 26.47 0 0 0 2.9-.46Z"
                            style={{'fill': '#383838'}} transform="translate(-117.73 -109.43)"/>
                        <path
                            d="M1183.84 708.21H968.58c-2.31 0-3.58-.35-4.61-2.86-25.48-61.87-70.43-101.56-136-115.61-55.94-12-107.15.65-152.53 35.49-27.1 20.82-46.66 47.52-58.95 79.46-1 2.63-2.2 3.56-5.15 3.56q-224.7-.13-449.4-.08c-5 0-5 0-4.51-4.94a575.62 575.62 0 0 1 12.84-75.74 626.83 626.83 0 0 1 490.27-470.88c19.12-3.73 38.41-6.39 57.81-8.25a620 620 0 0 1 68.39-3 670 670 0 0 1 67.26 4.35 615 615 0 0 1 130.6 29.88 627.82 627.82 0 0 1 382 372.81 613.51 613.51 0 0 1 30.74 114.47c2.09 12.58 3.46 25.29 5.35 37.91.5 3.32-1 3.48-3.58 3.48q-107.65-.09-215.27-.05Z"
                            style={{'fill':'#ee3f3e'}} transform="translate(-117.73 -109.43)"/>
                        <path
                            d="M390.83 850.62q113.76 0 227.51-.07c2.43 0 3.63.68 4.67 2.85a186.36 186.36 0 0 0 169.47 104.47c38.46-.8 73.61-12 105.09-34.32A184.83 184.83 0 0 0 957.45 853a3.61 3.61 0 0 1 3.87-2.43q217.9.07 435.83 0c4 0 2.62 1.8 2.36 4-1.59 13.45-4 26.76-6.8 40a630.78 630.78 0 0 1-23.57 83.26 623.08 623.08 0 0 1-87.93 163.53 616.51 616.51 0 0 1-72.85 81.49 625.3 625.3 0 0 1-165.72 112 617.25 617.25 0 0 1-122.12 41.81c-15.62 3.57-31.32 6.7-47.15 9.07-11.91 1.78-23.9 3-35.9 4.2-24.73 2.52-49.52 2.87-74.32 2.48-13.54-.21-27-1.2-40.55-2.42-10.71-1-21.41-2.06-32-3.58A624 624 0 0 1 386.86 1254a623.85 623.85 0 0 1-73.86-70.07c-56.14-63.08-98.3-134.38-125.71-214.31a595.45 595.45 0 0 1-22-82c-2.12-11.15-3.8-22.37-5.83-33.53-.48-2.59.19-3.5 3.14-3.5q114.14.1 228.23.03Z"
                            style={{'fill':'#fdfcfc'}} transform="translate(-117.73 -109.43)"/>
                        <path
                            d="M789.8 620.78c84.38.39 151.66 68.08 151.17 151.92a150.91 150.91 0 0 1-301.81-1.15c.16-84.23 68.01-150.18 150.64-150.77Z"
                            style={{'fill':'#fff'}} transform="translate(-117.73 -109.43)"/>
                    </svg>
                </div>
                <div className={'loader__bottom'}></div>
            </span>
        </div>
    </main>
    )
}

export default App
