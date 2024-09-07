
import {PokemonWheelItem} from "./PokemonWheelItem.tsx";
import {get_national_dex_number} from "../extras/utils.tsx";
import {
    AnimationSequence,
    useAnimate
} from "framer-motion";
import {
    useEffect,
    useState
} from "react";

interface WheelProps {
    items: Array<any>;
    is_spinning: boolean;
    onFinished: (bool: boolean) => void;
    delay: number;
}

export default function WheelColumn({
    items,
    is_spinning,
    onFinished,
    delay = 0
} : WheelProps)
{
    const [wheel_column, animate] = useAnimate();
    const [selected_item, setSelectedItem] = useState(null);

    const get_item_offset_from_top = (item : HTMLElement) => {
        if (!wheel_column?.current) return 0;
        const wheel_height = window.innerHeight;
        return item.offsetTop
            - (wheel_height * 0.5)
            + (item.clientHeight * 0.5)
            - 16;
    }

    const spin_wheel = async () => {
        console.clear()

        const wheel_element = wheel_column.current;
        const random_item = Math.floor(Math.random() * items.length);
        // const selected_random_item = items[random_item];
        const random_position = get_item_offset_from_top(wheel_element.children[random_item]);
        const end_loop_point = get_item_offset_from_top(wheel_element.children[3]) * -1;
        const start_loop_point = get_item_offset_from_top(wheel_element.children[wheel_element.children.length - 3]) * -1;

        console.log({end_loop_point, start_loop_point});

        wheel_element.querySelector('.pokemon-grid__item.show')?.classList.remove('show');
        wheel_element.classList.remove('finished');

        const sequence : AnimationSequence = [
            [wheel_element, {
                // @ts-ignore
                translateY: `${start_loop_point}px`,
            }, {
                duration: 0,
            }],
            [wheel_element, {
                // @ts-ignore
                translateY: [
                    `${start_loop_point}px`,
                    `${end_loop_point}px`,
                ],
            }, {
                duration: 1.5,
                ease: 'easeIn'
            }],
            [wheel_element, {
                // @ts-ignore
                translateY: [
                    `${start_loop_point}px`,
                    `-${random_position}px`
                ]
            }, {
                duration: 3,
                ease: 'circOut',
            }]
        ]

        await animate(sequence);

        wheel_element.children[random_item].classList.add('show');
        wheel_element.classList.add('finished');

        onFinished(false);
        setSelectedItem(wheel_element.children[random_item]);
    }

    useEffect(() =>
    {
        if (is_spinning)
        {
            setTimeout(() => {
                spin_wheel().then(r => r);
            }, delay);
        }
    }, [is_spinning]);

    useEffect(() =>
    {
        go_to_selected_item();
    });

    useEffect(() =>
    {
        if (wheel_column.current)
        {
            if(selected_item){
                go_to_selected_item();
            } else {
                animate(wheel_column.current, {
                    translateY: get_item_offset_from_top(wheel_column.current.children[wheel_column.current.children.length - 3]) * -1
                }, {
                    duration: 0,
                    ease: 'easeInOut'
                })
            }
        }
    }, []);

    const go_to_selected_item = () => {
        if (selected_item)
        {
            wheel_column.current.style.transform = `translateY(-${get_item_offset_from_top(selected_item)}px)`;

        }
    }

    return (
        <div className={'wheel-column'} ref={wheel_column}>
            <PokemonWheelItem pokemon={items[items.length - 3]}/>
            <PokemonWheelItem pokemon={items[items.length - 2]}/>
            <PokemonWheelItem pokemon={items[items.length - 1]}/>
            {items.map((pokemon: any) => (
                <PokemonWheelItem key={get_national_dex_number(pokemon)} pokemon={pokemon}/>
            ))}
            <PokemonWheelItem pokemon={items[0]}/>
            <PokemonWheelItem pokemon={items[1]}/>
            <PokemonWheelItem pokemon={items[3]}/>
        </div>
    );
}