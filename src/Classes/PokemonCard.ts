import {PokemonEntry} from "pokeapi-js-wrapper";
import {
    capitalize,
    get_national_dex_number,
    get_pokemon_artwork,
    lerp,
} from "../extras/utils.ts";
import WheelItem from "../Types/WheelItem.ts";

export interface PokemonCardType extends WheelItem {
    pokemon: PokemonEntry | null;
    national_dex_number: number;
    regional_dex_number: number;
    name: string;
    canvas: HTMLCanvasElement;
    offset: number;
    img: HTMLImageElement;
    is_featured: boolean;

}

type BoxBounds = {
    x: number;
    y: number;
    width: number;
    height: number;
}

class PokemonCard implements PokemonCardType {

    x: number = 400;
    y: number = 0;
    target_x: number|null = null;
    target_y: number|null = null;
    width: number = 100;
    height: number = 100;
    offset: number = 0;
    gap: number = 100;
    img: HTMLImageElement = new Image(this.width, this.height);
    pokemon: PokemonEntry | null = null;
    national_dex_number: number = 0;
    regional_dex_number: number = 0;
    name: string = '';
    canvas: HTMLCanvasElement;
    is_featured: boolean = false;

    loaded: boolean = false;
    featured_opacity: number = 0;

    number_selector: HTMLElement | null;
    hide_dex: HTMLInputElement;
    hide_name: HTMLInputElement;
    hide_bg: HTMLInputElement;

    constructor(pokemon: PokemonEntry, canvas: HTMLCanvasElement, offset: number = 0) {
        this.offset = offset;
        this.pokemon = pokemon;
        this.canvas = canvas;

        this.national_dex_number = get_national_dex_number(pokemon);
        this.regional_dex_number = pokemon.entry_number;
        this.name = pokemon.pokemon_species.name;
        this.set_size();
        this.initial_position();
        this.set_image();

        this.number_selector = document.querySelector('.sidebar .number-selector');
        this.hide_dex = document.getElementById('hide-dex') as HTMLInputElement;
        this.hide_name = document.getElementById('hide-name') as HTMLInputElement;
        this.hide_bg = document.getElementById('hide-pokemon-bg') as HTMLInputElement;
    }

    is_on_screen(ctx: CanvasRenderingContext2D | null): boolean {
        const height_buffer = this.height * 2;
        const width_buffer = this.width * 2;

        const top_offset = this.y + height_buffer;
        const bottom_offset = this.y - height_buffer;
        const left_offset = this.x + width_buffer;
        const right_offset = this.x - width_buffer;

        const y_ok =
            (top_offset >= 0) &&
            (bottom_offset <= ctx!.canvas.height);

        const x_ok =
            (right_offset <= ctx!.canvas.width) &&
            (left_offset >= 0);


        return y_ok && x_ok;
    }

    draw(
        ctx: CanvasRenderingContext2D | null,
    ): void
    {

        if(this.is_on_screen(ctx)){
            this.set_featured_opacity();
            if(this.is_featured){
                const offset = 0;
                const bounds = this.get_offset_bounds(offset);
                this.daw_featured_box(ctx, bounds);
                this.draw_name(ctx, bounds);
                this.draw_pokedex_number(ctx, bounds);
            }
            this.draw_image(ctx);
        }
    }

    create_bg_gradient(ctx: CanvasRenderingContext2D | null){
        const center_x = this.x + this.width / 2;
        const center_y = this.y + this.height / 2;
        const gradient = ctx!.createRadialGradient(
            center_x, center_y, 175,
            center_x, center_y, 250
        );

// Add three color stops
        gradient.addColorStop(0, `rgba(6,15,51, ${this.featured_opacity})`);
        gradient.addColorStop(1, `rgba(20,34,93, ${this.featured_opacity})`);
        return gradient;
    }



    get_offset_bounds(offset: number) : BoxBounds {
        return {
            x: this.x - offset,
            y: this.y - offset,
            width: this.width + offset * 2,
            height: this.height + offset * 2,
        }

    }

    daw_featured_box(
        ctx: CanvasRenderingContext2D | null,
        bounds: BoxBounds
    ){

        if(this.hide_bg && this.hide_bg.checked){
            return;
        }

        ctx!.fillStyle = `rgba(255, 255, 255, ${this.featured_opacity})`;
        ctx!.fillStyle = this.create_bg_gradient(ctx);
        ctx!.beginPath()
        ctx!.roundRect(
            bounds.x,
            bounds.y,
            bounds.width,
            bounds.height,
            25
        );
        ctx!.fill();
        ctx!.closePath();
    }

    private set_image()
    {
        this.img.src = get_pokemon_artwork(this.national_dex_number);
        this.img.onload = () => {
            this.loaded = true;
        };
    }

    draw_image(
        ctx: CanvasRenderingContext2D | null
    ){
        const scale = this.workout_img_scale_from_number_selected();
        let percent = 0.90 - scale;

        if(
            this.hide_dex && this.hide_dex.checked &&
            this.hide_name && this.hide_name.checked
        ){
            percent = 1
        }

        const x = this.x + ((this.width * (1 - percent)) / 2) ;
        const y = this.y + ((this.height * (1 - percent)) / 2) ;
        const width = this.width * percent;
        const height = this.height * percent;
        ctx!.drawImage(this.img, x, y, width, height);

    }

    set_size()
    {
        const percentage = 90;
        let size = this.canvas.width * (percentage / 100);
        const max_size = 500;

        if(size > max_size){
            size = max_size;
        }

        this.width = size;
        this.height = size;

        this.center_in_wheel()
    }

    move(){

        const move_buffer_point = 1
        if(this.target_y !== null)
        {
            if(
                this.target_y < this.y - move_buffer_point ||
                this.target_y > this.y + move_buffer_point
            ){
                this.y = lerp(this.y, this.target_y, 0.05);
            } else if (this.target_y !== null){
                this.y = this.target_y;
                this.target_y = null;
            }

        }
    }

    center_in_wheel(){
        this.x = this.canvas.width / 2 - this.width / 2;
    }

    private initial_position()
    {
        this.y = (this.offset * (this.height + this.gap));
    }

    updatePosition(){
        if (this.target_y !== null) {
            this.y = this.target_y;
            this.target_y = null;
        }
        if (this.target_x !== null) {
            this.x = this.target_x;
            this.target_x = null;
        }
    }

    setFeatured(b: boolean)
    {
        this.is_featured = b;
    }

    private set_featured_opacity(forced_value: number | null = null)
    {
        const opacity_speed = 0.05;

        if(forced_value !== null){
            this.featured_opacity = forced_value;
        } else {
            if(this.is_featured && this.featured_opacity < 1){
                this.featured_opacity += opacity_speed;
            } else if (this.is_featured && this.featured_opacity > 1 && this.featured_opacity !== 1){
                this.featured_opacity = 1;
            } else if (!this.is_featured && this.featured_opacity > 0){
                this.featured_opacity -= opacity_speed;
            } else if (!this.is_featured && this.featured_opacity < 0 && this.featured_opacity !== 0){
                this.featured_opacity = 0;
            }
        }
    }

    private draw_pokedex_number(
        ctx: CanvasRenderingContext2D | null,
        bounds: BoxBounds
    )
    {
        if(this.hide_dex && this.hide_dex.checked){
            return
        }
        const offset = 20;
        ctx!.fillStyle = `rgba(255, 255, 255, ${this.featured_opacity})`;
        ctx!.font = 'bold 16px Helvetica';
        ctx!.textAlign = 'left';
        ctx!.textBaseline = 'bottom';
        ctx!.fillText(
            `Dex: #${this.regional_dex_number} National: #${this.national_dex_number}`,
            bounds.x + offset,
            bounds.y + bounds.height - (offset / 1.5)
        );
    }

    private draw_name(
        ctx: CanvasRenderingContext2D | null,
        bounds: BoxBounds
    )
    {
        if(this.hide_name && this.hide_name.checked){
            return
        }
        const offset = 20;
        ctx!.fillStyle = `rgba(255, 255, 255, ${this.featured_opacity})`;
        ctx!.font = 'bold 20px Helvetica';
        ctx!.textAlign = 'left';
        ctx!.textBaseline = 'top';
        ctx!.fillText(
            capitalize(this.name),
            bounds.x + offset,
            bounds.y + offset
        );
    }

    private workout_img_scale_from_number_selected()
    {
        const number_selected_span = this.number_selector?.querySelector('.active') as HTMLElement;
        let number_selected = -1 + parseInt(
        // @ts-ignore
            number_selected_span.dataset!.activeNumber
        );

        if(number_selected <= 0){
            return 0;
        } else {
            return 0.045 * number_selected;
        }


    }
}



export default PokemonCard;