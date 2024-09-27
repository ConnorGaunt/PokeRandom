import WheelItem from "../Types/WheelItem.ts";

export type CanvasType = {
    element: HTMLCanvasElement;
    parent_element: HTMLElement;
    width: number;
    height: number;
    context: CanvasRenderingContext2D | null;
    loop: number | null;
    last_frame_time: number;
    items: WheelItem[];
    set_size: () => void;
    setup_event_listeners: () => void;
    get_delta_time: () => number;
    add_item: (item: WheelItem) => void;
    stop: () => void;
    update: () => void;
}

export default class CanvasWheel implements CanvasType {

    element: HTMLCanvasElement;
    parent_element: HTMLElement = document.createElement('div');
    width: number = 0;
    height: number = 0;
    context: CanvasRenderingContext2D | null = null;

    loop: number | null = null;
    last_frame_time: number = 0;
    items: WheelItem[] = [];
    total_number_of_wheels: number = 1
    wheel_number: number = 1;
    move_speed: number = 8500;
    base_speed_multiplier: number = 2;
    speed_multiplier: number = 1;
    is_spinning: 0|1 = 0;
    featured_item: WheelItem | null = null;
    private is_currently_moving: boolean = false;
    ready:boolean = false;
    loop_length: number = 1500;

    spinning_interval: number | undefined;
    featured_item_index: number | null = null;
    number_selector: HTMLElement | null;

    constructor(
        parent: HTMLElement,
        total_number_of_wheels: number = 1,
        wheel_number: number = 1
    ) {

        this.parent_element = parent;
        this.element = document.createElement('canvas');
        this.parent_element.append(this.element);
        this.context = this.element.getContext('2d');
        this.last_frame_time = performance.now();

        this.total_number_of_wheels = total_number_of_wheels;
        this.wheel_number = wheel_number;

        this.number_selector = document.querySelector('.sidebar .number-selector');
        this.set_size();
        this.setup_event_listeners();
    }

    reset_wheel_position(){
        if(this.featured_item !== null) {
            this.featured_item.setFeatured(false);
        }
        this.scrollTo(this.items.length - 3, true);
    }

    loop_wheel(){
        clearInterval(this.spinning_interval);
        this.reset_wheel_position();
        this.scrollTo(3)
        this.spinning_interval = setInterval(() => {
            this.loop_wheel();
        }, 500);
    }

    spin(random_selected_item_index: number) {
        this.reset_wheel_position();
        this.is_spinning = 1;


        this.featured_item_index = random_selected_item_index;
        this.featured_item = this.items[random_selected_item_index];

        if(!this.is_currently_moving) {
            this.loop_wheel()

            setTimeout(() => {

                let target_index = random_selected_item_index + 3
                if(target_index >= this.items.length - 3) {
                   target_index = this.items.length - 3;
                }
                clearInterval(this.spinning_interval);
                this.scrollTo(target_index, true);
                this.scrollTo(random_selected_item_index);
                // console.log(random_selected_item);
                setTimeout(() => {
                    requestAnimationFrame(this.do_after_move.bind(this, () => {
                        console.log('finished');
                        this.is_spinning = 0;
                        if (this.featured_item !== null){
                            this.featured_item.setFeatured(true);
                        }
                    }));
                }, 500);
            }, this.loop_length);

        }

    }

    setup_event_listeners() {
        window.addEventListener('resize',
            () => {
                this.set_size.bind(this);
                this.items.forEach((item) => {
                    item.set_size();
                });
                if(this.featured_item !== null && this.featured_item_index !== null) {
                   this.scrollTo(this.featured_item_index, true)
                }
            });
    }

    set_size(has_border = true) {

        const offset = has_border ? 4 : 0;

        this.width = (this.parent_element.clientWidth / this.total_number_of_wheels) - offset;
        this.height = this.parent_element.clientHeight;

        this.element.width = this.width;
        this.element.height = this.height;

    }

    get_delta_time() {
        const now = performance.now();
        const delta = (now - this.last_frame_time) / 1000;
        this.last_frame_time = now;
        return delta;
    }

    calc_speed_multiplier() {

        if(this.items.length <= 500){
            this.speed_multiplier = this.base_speed_multiplier;
            return
        }

        const max = 1000;
        let percent = Math.floor((100 / max) * this.items.length);
        if(percent > 100) {
            percent = 100;
        }
        this.speed_multiplier = this.base_speed_multiplier * (percent / 100);

    }

    add_item(item: WheelItem) {
        this.items.push(item);
        this.calc_speed_multiplier();
    }


    init() {
        this.reset_wheel_position();
        this.check_ready();
        this.loop = requestAnimationFrame(this.update.bind(this));
    }
    stop() {
        if(this.loop) {
            cancelAnimationFrame(this.loop);
        }
    }

    update() {
        // const delta = this.get_delta_time();

        if(this.ready) {
            this.context?.clearRect(0, 0, this.width, this.height);
            this.context!.imageSmoothingEnabled = true;
            let items_finished_moving = 0;

            for(let i = 0; i < this.items.length; i++) {
                const item = this.items[i];
                item.move();
                if(item.target_y === null) {
                    items_finished_moving++;
                }
                item.draw(this.context);
            }

            this.is_currently_moving = items_finished_moving !== this.items.length;
            // console.log(this.is_currently_moving, items_finished_moving, this.items.length);
        }


        this.loop = requestAnimationFrame(this.update.bind(this));
    }


    scrollTo(target: number, instant: boolean = false) {
        const item_gap = this.items[0].gap;
        const item_height = this.items[0].height;
        const distance_to_move = item_height + item_gap;
        const middle_of_screen = (this.height / 2) - (item_height / 2);


        // Works backwards from the target to the top of the list
        for(let i = target -1; i >= 0; i--) {
            let temp = target - i;
            let target_y = middle_of_screen - (distance_to_move * temp);
            this.items[i].target_y = target_y;
        }

        // Sets the target to the middle of the screen
        this.items[target].target_y = middle_of_screen;

        // Resets the counter
        // Works forwards from the target to the bottom of the list using the new counter
        // as the base index for the positioning
        let counter = 0;
        for(let i = target + 1; i < this.items.length; i++) {
            counter++;
            let target_y = middle_of_screen + (distance_to_move * counter);
            this.items[i].target_y = target_y;
        }

        if(instant) {
            for(let i = 0; i < this.items.length; i++) {
                this.items[i].updatePosition();
            }
        }
    }

    do_after_move(func_when_done: Function) {
        if(!this.is_currently_moving) {
            func_when_done();
        }
        else {
            requestAnimationFrame(this.do_after_move.bind(this, func_when_done));
        }
    }

    set_spin_length(length: number){
        this.loop_length = length;
    }

    check_ready() {
        if(!this.ready){
            let amount_ready = 0;
            for(let i = 0; i < this.items.length; i++) {
                if(this.items[i].loaded){
                    amount_ready++;
                }
            }
            // const percent_ready = Math.floor((100 / this.items.length) * amount_ready);
            // console.log( percent_ready + '%');
            if(amount_ready === this.items.length){
                this.ready = true;
            }else{
                requestAnimationFrame(this.check_ready.bind(this));
            }
        }
    }

}