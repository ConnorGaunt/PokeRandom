import {PokemonEntry} from "pokeapi-js-wrapper";
import {
    get_national_dex_number,
    get_pokemon_artwork,
    lerp,
    normalize
} from "../extras/utils.ts";
import WheelItem from "../Types/WheelItem.ts";
import { easeOutExpo } from "easing-utils";

export interface PokemonCardType extends WheelItem {
    pokemon: PokemonEntry | null;
    national_dex_number: number;
    regional_dex_number: number;
    name: string;
    canvas: HTMLCanvasElement;
    offset: number;
    img: HTMLImageElement;

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

    loaded: boolean = false;

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
            ctx!.drawImage(this.img, this.x, this.y, this.width, this.height);
        }
    }

    private set_image()
    {
        this.img.src = get_pokemon_artwork(this.national_dex_number);
        this.img.onload = () => {
            this.loaded = true;
        };
    }

    set_size()
    {
        const percentage = 90;
        let size = this.canvas.width * (percentage / 100);
        const max_size = 400;

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
}



export default PokemonCard;