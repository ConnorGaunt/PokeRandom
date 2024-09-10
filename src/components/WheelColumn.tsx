
import {PokemonWheelItem} from "./PokemonWheelItem.tsx";
import {get_national_dex_number} from "../extras/utils.tsx";
import {
    useAnimate
} from "framer-motion";
import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useLayoutEffect,
    useState
} from "react";
import classNames from "classnames";

interface WheelProps {
    items: Array<any>;
    // onFinished: (bool: boolean) => void;
    delay: number;
}

const WheelColumn = forwardRef(({
    items,
    // onFinished,
    delay = 0
} : WheelProps, ref) =>
{
    const [wheel_column, animate] = useAnimate();
    const [selected_item, setSelectedItem] = useState<number|null>(null);
    const [items_to_show, setItemsToShow] = useState<Array<any>>([]);
    const [has_span, setHasSpan] = useState(false);

    useImperativeHandle(ref, () => ({
        spin_wheel() {
            console.log('spinning_wheel', delay);
            setHasSpan(true);
            setSelectedItem(null);
            setTimeout(() => {
                void start_spin_wheel();
            }, delay);
        }
    }), []);

    const get_item_offset_from_top = (item : HTMLElement) => {
        if (!wheel_column?.current) return 0;
        const wheel_height = window.innerHeight;

        console.dir(item);
        console.log(item.offsetTop);
        return item.offsetTop
            - (wheel_height * 0.5)
            + (item.clientHeight * 0.5)
            - 16;
    }

    const set_items_to_show = (random_index : number) => {

        if(random_index === items.length){
            random_index -= 1;
        }

        console.log(items[random_index]);

        const amount_on_each_side = 15;
        let current_item_index =  amount_on_each_side;

        const _items_to_show = [];
        let _number_to_prepend = 0;
        let _number_to_append = 0;
        for (let i = amount_on_each_side; i > 0; i--)
        {
            if(
                items[random_index - i] === undefined
            ){
                _number_to_prepend++;
                continue;
            }
            _items_to_show.push(items[random_index - i]);
        }
        _items_to_show.push(items[random_index]);
        for (let i = 1; i < amount_on_each_side; i++)
        {
            if(
                items[random_index + i] === undefined
            ){
                _number_to_append++;
                continue;
            }
            _items_to_show.push(items[random_index + i]);
        }

        for (let i = _number_to_prepend; i > 0; i--){
            _items_to_show.unshift(items[(items.length - 1) - _number_to_prepend + i]);
        }

        for (let i = _number_to_append; i > 0 ; i--){
            _items_to_show.push(items[_number_to_append - i]);
        }

        setItemsToShow(_items_to_show);
        setSelectedItem(current_item_index);
    }

    const get_loop_points = (wheel_element: HTMLElement) => {
        const end_loop_point = get_item_offset_from_top(wheel_element.children[3] as HTMLElement) * -1;
        const start_loop_point = get_item_offset_from_top(wheel_element.children[wheel_element.children.length - 3] as HTMLElement) * -1;
        return [start_loop_point, end_loop_point];
    }


    const remove_all_display_classes = () => {
        if(!wheel_column.current) return;
        const wheel_element = wheel_column.current;
        wheel_element.querySelector('.pokemon-grid__item.show')?.classList.remove('show');
        wheel_element.classList.remove('finished');
    }

    const start_spin_wheel = async function(){
        console.clear();
        console.log('starting wheel spin');
        // wheel_column.current.classList.add('is-spinning');
        const wheel_element = wheel_column.current;
        const random_item = Math.floor(Math.random() * items.length);
        remove_all_display_classes();
        const [start_loop_point, end_loop_point] = get_loop_points(wheel_element);
        //
        // await new Promise<void>((resolve) => {
        //     setTimeout(() => {
        //         resolve()
        //     },1000)
        // })

        await animate(wheel_element, {
            y: start_loop_point,
        }, {
            duration: 0,
        })


        animate(wheel_element, {
            y: [
                start_loop_point,
                end_loop_point,
            ],
        }, {
            duration: 1.5,
            ease: 'linear',
            repeat: 2,
        })

        set_items_to_show(random_item);


    }

    const finish_spin_wheel = async () => {
        console.log('finishing wheel spin');
        const wheel_element = wheel_column.current;

        const selected_random_item = wheel_element.children[15];
        // console.log(selected_random_item);
        wheel_element.classList.remove('is-spinning');

        console.dir(wheel_element.children[0].clientHeight);

        await animate(wheel_element, {
            y: get_item_offset_from_top(selected_random_item) * -1,
        }, {
            duration: 1.5,
            ease: 'circOut'
        });

        selected_random_item.classList.add('show');
        wheel_element.classList.add('finished');
        console.log(selected_random_item)
    }


    //
    // useEffect(() =>
    // {
    //     // remove_all_display_classes(wheel_element);
    //     // void go_to_selected_item(0);
    // });
    useEffect(() =>
    {
        console.clear();
        remove_all_display_classes();
        set_items_to_show(0);
    }, []);

    useLayoutEffect(() =>
    {
        console.log('items_to_show', items_to_show);
        if(has_span && items_to_show.length > 0){
            setTimeout(() => {
                setHasSpan(false);
                void finish_spin_wheel();
            }, 1000);
        }
    }, [items_to_show]);

    // const go_to_selected_item = async (duration:number = 0) => {
    //     if(!wheel_column.current) return;
    //     await animate(wheel_column.current, {
    //         y: get_item_offset_from_top(wheel_column.current.children[15]) * -1
    //     }, {
    //         duration,
    //         ease: 'circOut'
    //     })
    // }

    return (
        <div className={classNames('wheel-column')} ref={wheel_column}>
            {items_to_show.map((pokemon: any) => (
                <PokemonWheelItem key={get_national_dex_number(pokemon)} pokemon={pokemon}/>
            ))}
        </div>
    );
});



export default WheelColumn;