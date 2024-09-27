import Moveable from "./Moveable.ts";

export default interface WheelItem extends Moveable {
    loaded: boolean;

    set_size(): void;

    setFeatured(b: boolean): void;
}