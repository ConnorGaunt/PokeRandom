import Drawable from "./Drawable.ts";

export default interface Moveable extends Drawable {
    x: number;
    y: number;
    gap: number;
    target_y: number | null;
    target_x: number | null;
    width: number;
    height: number;
    move: () => void;
    updatePosition: () => void;
}