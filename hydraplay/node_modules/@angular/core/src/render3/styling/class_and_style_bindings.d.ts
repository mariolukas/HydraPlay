/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import { StyleSanitizeFn } from '../../sanitization/style_sanitizer';
import { TAttributes } from '../interfaces/node';
import { BindingStore, BindingType, Player, PlayerBuilder, PlayerFactory } from '../interfaces/player';
import { RElement, Renderer3 } from '../interfaces/renderer';
import { StylingContext } from '../interfaces/styling';
import { LView, RootContext } from '../interfaces/view';
import { NO_CHANGE } from '../tokens';
import { BoundPlayerFactory } from './player_factory';
/**
 * This file includes the code to power all styling-binding operations in Angular.
 *
 * These include:
 * [style]="myStyleObj"
 * [class]="myClassObj"
 * [style.prop]="myPropValue"
 * [class.name]="myClassValue"
 *
 * There are many different ways in which these functions below are called. Please see
 * `interfaces/styles.ts` to get a better idea of how the styling algorithm works.
 */
/**
 * Creates a new StylingContext an fills it with the provided static styling attribute values.
 */
export declare function initializeStaticContext(attrs: TAttributes): StylingContext;
/**
 * Designed to update an existing styling context with new static styling
 * data (classes and styles).
 *
 * @param context the existing styling context
 * @param attrs an array of new static styling attributes that will be
 *              assigned to the context
 * @param directive the directive instance with which static data is associated with.
 */
export declare function patchContextWithStaticAttrs(context: StylingContext, attrs: TAttributes, directive: any): void;
/**
 * Runs through the initial styling data present in the context and renders
 * them via the renderer on the element.
 */
export declare function renderInitialStylesAndClasses(element: RElement, context: StylingContext, renderer: Renderer3): void;
export declare function allowNewBindingsForStylingContext(context: StylingContext): boolean;
/**
 * Adds in new binding values to a styling context.
 *
 * If a directive value is provided then all provided class/style binding names will
 * reference the provided directive.
 *
 * @param context the existing styling context
 * @param directiveRef the directive that the new bindings will reference
 * @param classBindingNames an array of class binding names that will be added to the context
 * @param styleBindingNames an array of style binding names that will be added to the context
 * @param styleSanitizer an optional sanitizer that handle all sanitization on for each of
 *    the bindings added to the context. Note that if a directive is provided then the sanitizer
 *    instance will only be active if and when the directive updates the bindings that it owns.
 */
export declare function updateContextWithBindings(context: StylingContext, directiveRef: any | null, classBindingNames?: string[] | null, styleBindingNames?: string[] | null, styleSanitizer?: StyleSanitizeFn | null, onlyProcessSingleClasses?: boolean): void;
/**
 * Sets and resolves all `multi` styling on an `StylingContext` so that they can be
 * applied to the element once `renderStyling` is called.
 *
 * All missing styles/class (any values that are not provided in the new `styles`
 * or `classes` params) will resolve to `null` within their respective positions
 * in the context.
 *
 * @param context The styling context that will be updated with the
 *    newly provided style values.
 * @param classesInput The key/value map of CSS class names that will be used for the update.
 * @param stylesInput The key/value map of CSS styles that will be used for the update.
 */
export declare function updateStylingMap(context: StylingContext, classesInput: {
    [key: string]: any;
} | string | BoundPlayerFactory<null | string | {
    [key: string]: any;
}> | NO_CHANGE | null, stylesInput?: {
    [key: string]: any;
} | BoundPlayerFactory<null | {
    [key: string]: any;
}> | NO_CHANGE | null, directiveRef?: any): void;
/**
 * This method will toggle the referenced CSS class (by the provided index)
 * within the given context.
 *
 * @param context The styling context that will be updated with the
 *    newly provided class value.
 * @param offset The index of the CSS class which is being updated.
 * @param addOrRemove Whether or not to add or remove the CSS class
 */
export declare function updateClassProp(context: StylingContext, offset: number, addOrRemove: boolean | BoundPlayerFactory<boolean>, directiveRef?: any): void;
/**
 * Sets and resolves a single style value on the provided `StylingContext` so
 * that they can be applied to the element once `renderStyling` is called.
 *
 * Note that prop-level styling values are considered higher priority than any styling that
 * has been applied using `updateStylingMap`, therefore, when styling values are rendered
 * then any styles/classes that have been applied using this function will be considered first
 * (then multi values second and then initial values as a backup).
 *
 * @param context The styling context that will be updated with the
 *    newly provided style value.
 * @param offset The index of the property which is being updated.
 * @param value The CSS style value that will be assigned
 * @param directiveRef an optional reference to the directive responsible
 *    for this binding change. If present then style binding will only
 *    actualize if the directive has ownership over this binding
 *    (see styling.ts#directives for more information about the algorithm).
 */
export declare function updateStyleProp(context: StylingContext, offset: number, input: string | boolean | null | BoundPlayerFactory<string | boolean | null>, directiveRef?: any): void;
/**
 * Renders all queued styling using a renderer onto the given element.
 *
 * This function works by rendering any styles (that have been applied
 * using `updateStylingMap`) and any classes (that have been applied using
 * `updateStyleProp`) onto the provided element using the provided renderer.
 * Just before the styles/classes are rendered a final key/value style map
 * will be assembled (if `styleStore` or `classStore` are provided).
 *
 * @param lElement the element that the styles will be rendered on
 * @param context The styling context that will be used to determine
 *      what styles will be rendered
 * @param renderer the renderer that will be used to apply the styling
 * @param classesStore if provided, the updated class values will be applied
 *    to this key/value map instead of being renderered via the renderer.
 * @param stylesStore if provided, the updated style values will be applied
 *    to this key/value map instead of being renderered via the renderer.
 * @param directiveRef an optional directive that will be used to target which
 *    styling values are rendered. If left empty, only the bindings that are
 *    registered on the template will be rendered.
 * @returns number the total amount of players that got queued for animation (if any)
 */
export declare function renderStyling(context: StylingContext, renderer: Renderer3, rootOrView: RootContext | LView, isFirstRender: boolean, classesStore?: BindingStore | null, stylesStore?: BindingStore | null, directiveRef?: any): number;
/**
 * This function renders a given CSS prop/value entry using the
 * provided renderer. If a `store` value is provided then
 * that will be used a render context instead of the provided
 * renderer.
 *
 * @param native the DOM Element
 * @param prop the CSS style property that will be rendered
 * @param value the CSS style value that will be rendered
 * @param renderer
 * @param store an optional key/value map that will be used as a context to render styles on
 */
export declare function setStyle(native: any, prop: string, value: string | null, renderer: Renderer3, sanitizer: StyleSanitizeFn | null, store?: BindingStore | null, playerBuilder?: ClassAndStylePlayerBuilder<any> | null): void;
export declare function isClassBasedValue(context: StylingContext, index: number): boolean;
export declare function directiveOwnerPointers(directiveIndex: number, playerIndex: number): number;
export declare function getValue(context: StylingContext, index: number): string | boolean | null;
export declare function getProp(context: StylingContext, index: number): string;
export declare function isContextDirty(context: StylingContext): boolean;
export declare function limitToSingleClasses(context: StylingContext): number;
export declare function setContextDirty(context: StylingContext, isDirtyYes: boolean): void;
export declare function setContextPlayersDirty(context: StylingContext, isDirtyYes: boolean): void;
export declare class ClassAndStylePlayerBuilder<T> implements PlayerBuilder {
    private _element;
    private _type;
    private _values;
    private _dirty;
    private _factory;
    constructor(factory: PlayerFactory, _element: HTMLElement, _type: BindingType);
    setValue(prop: string, value: any): void;
    buildPlayer(currentPlayer: Player | null, isFirstRender: boolean): Player | undefined | null;
}
/**
 * Used to provide a summary of the state of the styling context.
 *
 * This is an internal interface that is only used inside of test tooling to
 * help summarize what's going on within the styling context. None of this code
 * is designed to be exported publicly and will, therefore, be tree-shaken away
 * during runtime.
 */
export interface LogSummary {
    name: string;
    staticIndex: number;
    dynamicIndex: number;
    value: number;
    flags: {
        dirty: boolean;
        class: boolean;
        sanitize: boolean;
        playerBuildersDirty: boolean;
        onlyProcessSingleClasses: boolean;
        bindingAllocationLocked: boolean;
    };
}
/**
 * This function is not designed to be used in production.
 * It is a utility tool for debugging and testing and it
 * will automatically be tree-shaken away during production.
 */
export declare function generateConfigSummary(source: number): LogSummary;
export declare function generateConfigSummary(source: StylingContext): LogSummary;
export declare function generateConfigSummary(source: StylingContext, index: number): LogSummary;
export declare function getDirectiveIndexFromEntry(context: StylingContext, index: number): number;
export declare function compareLogSummaries(a: LogSummary, b: LogSummary): string[];
/**
 * This function is only designed to be called for `[class]` bindings when
 * `[ngClass]` (or something that uses `class` as an input) is present. Once
 * directive host bindings fully work for `[class]` and `[style]` inputs
 * then this can be deleted.
 */
export declare function getInitialClassNameValue(context: StylingContext): string;
