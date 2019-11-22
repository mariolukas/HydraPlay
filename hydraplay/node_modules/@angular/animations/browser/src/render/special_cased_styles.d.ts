/**
 * Returns an instance of `SpecialCasedStyles` if and when any special (non animateable) styles are
 * detected.
 *
 * In CSS there exist properties that cannot be animated within a keyframe animation
 * (whether it be via CSS keyframes or web-animations) and the animation implementation
 * will ignore them. This function is designed to detect those special cased styles and
 * return a container that will be executed at the start and end of the animation.
 *
 * @returns an instance of `SpecialCasedStyles` if any special styles are detected otherwise `null`
 */
export declare function packageNonAnimatableStyles(element: any, styles: {
    [key: string]: any;
} | {
    [key: string]: any;
}[]): SpecialCasedStyles | null;
/**
 * Designed to be executed during a keyframe-based animation to apply any special-cased styles.
 *
 * When started (when the `start()` method is run) then the provided `startStyles`
 * will be applied. When finished (when the `finish()` method is called) the
 * `endStyles` will be applied as well any any starting styles. Finally when
 * `destroy()` is called then all styles will be removed.
 */
export declare class SpecialCasedStyles {
    private _element;
    private _startStyles;
    private _endStyles;
    static initialStylesByElement: WeakMap<any, {
        [key: string]: any;
    }>;
    private _state;
    private _initialStyles;
    constructor(_element: any, _startStyles: {
        [key: string]: any;
    } | null, _endStyles: {
        [key: string]: any;
    } | null);
    start(): void;
    finish(): void;
    destroy(): void;
}
