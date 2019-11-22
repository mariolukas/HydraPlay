/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * The styling context acts as a styling manifest (shaped as an array) for determining which
 * styling properties have been assigned via the provided `updateStylingMap`, `updateStyleProp`
 * and `updateClassProp` functions. It also stores the static style/class values that were
 * extracted from the template by the compiler.
 *
 * A context is created by Angular when:
 * 1. An element contains static styling values (like style="..." or class="...")
 * 2. An element contains single property binding values (like [style.prop]="x" or
 * [class.prop]="y")
 * 3. An element contains multi property binding values (like [style]="x" or [class]="y")
 * 4. A directive contains host bindings for static, single or multi styling properties/bindings.
 * 5. An animation player is added to an element via `addPlayer`
 *
 * Note that even if an element contains static styling then this context will be created and
 * attached to it. The reason why this happens (instead of treating styles/classes as regular
 * HTML attributes) is because the style/class bindings must be able to default themselves back
 * to their respective static values when they are set to null.
 *
 * Say for example we have this:
 * ```
 * <!-- when myWidthExp=null then a width of "100px"
 *      will be used a default value for width -->
 * <div style="width:100px" [style.width]="myWidthExp"></div>
 * ```
 *
 * Even in the situation where there are no bindings, the static styling is still placed into the
 * context because there may be another directive on the same element that has styling.
 *
 * When Angular initializes styling data for an element then it will first register the static
 * styling values on the element using one of these two instructions:
 *
 * 1. elementStart or element (within the template function of a component)
 * 2. elementHostAttrs (for directive host bindings)
 *
 * In either case, a styling context will be created and stored within an element's LViewData. Once
 * the styling context is created then single and multi properties can stored within it. For this to
 * happen, the following function needs to be called:
 *
 * `elementStyling` (called with style properties, class properties and a sanitizer + a directive
 * instance).
 *
 * When this instruction is called it will populate the styling context with the provided style
 * and class names into the context.
 *
 * The context itself looks like this:
 *
 * context = [
 *   // 0-8: header values (about 8 entries of configuration data)
 *   // 9+: this is where each entry is stored:
 * ]
 *
 * Let's say we have the following template code:
 *
 * ```
 * <div class="foo bar"
 *      style="width:200px; color:red"
 *      [style.width]="myWidthExp"
 *      [style.height]="myHeightExp"
 *      [class.baz]="myBazExp">
 * ```
 *
 * The context generated from these values will look like this (note that
 * for each binding name (the class and style bindings) the values will
 * be inserted twice into the array (once for single property entries) and
 * another for multi property entries).
 *
 * context = [
 *   // 0-8: header values (about 8 entries of configuration data)
 *   // 9+: this is where each entry is stored:
 *
 *   // SINGLE PROPERTIES
 *   configForWidth,
 *   'width'
 *   myWidthExp, // the binding value not the binding itself
 *   0, // the directive owner
 *
 *   configForHeight,
 *   'height'
 *   myHeightExp, // the binding value not the binding itself
 *   0, // the directive owner
 *
 *   configForBazClass,
 *   'baz
 *   myBazClassExp, // the binding value not the binding itself
 *   0, // the directive owner
 *
 *   // MULTI PROPERTIES
 *   configForWidth,
 *   'width'
 *   myWidthExp, // the binding value not the binding itself
 *   0, // the directive owner
 *
 *   configForHeight,
 *   'height'
 *   myHeightExp, // the binding value not the binding itself
 *   0, // the directive owner
 *
 *   configForBazClass,
 *   'baz
 *   myBazClassExp, // the binding value not the binding itself
 *   0, // the directive owner
 * ]
 *
 * The configuration values are left out of the example above because
 * the ordering of them could change between code patches. Please read the
 * documentation below to get a better understand of what the configuration
 * values are and how they work.
 *
 * Each time a binding property is updated (whether it be through a single
 * property instruction like `elementStyleProp`, `elementClassProp` or
 * `elementStylingMap`) then the values in the context will be updated as
 * well.
 *
 * If for example `[style.width]` updates to `555px` then its value will be reflected
 * in the context as so:
 *
 * context = [
 *   // ...
 *   configForWidth, // this will be marked DIRTY
 *   'width'
 *   '555px',
 *   0,
 *   //..
 * ]
 *
 * The context and directive data will also be marked dirty.
 *
 * Despite the context being updated, nothing has been rendered on screen (not styles or
 * classes have been set on the element). To kick off rendering for an element the following
 * function needs to be run `elementStylingApply`.
 *
 * `elementStylingApply` will run through the context and find each dirty value and render them onto
 * the element. Once complete, all styles/classes will be set to clean. Because of this, the render
 * function will now know not to rerun itself again if called again unless new style/class values
 * have changed.
 *
 * ## Directives
 * Directives style values (which are provided through host bindings) are also supported and
 * housed within the same styling context as are template-level style/class properties/bindings.
 * Both directive-level and template-level styling bindings share the same context.
 *
 * Each of the following instructions supports accepting a directive instance as an input parameter:
 *
 * - `elementHostAttrs`
 * - `elementStyling`
 * - `elementStyleProp`
 * - `elementClassProp`
 * - `elementStylingMap`
 * - `elementStylingApply`
 *
 * Each time a directiveRef is passed in, it will be converted into an index by examining the
 * directive registry (which lives in the context configuration area). The index is then used
 * to help single style properties figure out where a value is located in the context.
 *
 * If two directives or a directive + a template binding both write to the same style/class
 * binding then the styling context code will decide which one wins based on the following
 * rule:
 *
 * 1. If the template binding has a value then it always wins
 * 2. If not then whichever first-registered directive that has that value first will win
 *
 * The code example helps make this clear:
 *
 * ```
 * <div [style.width]="myWidth" [my-width-directive]="'600px">
 * \@Directive({ selector: '[my-width-directive' ]})
 * class MyWidthDirective {
 * \@Input('my-width-directive')
 * \@HostBinding('style.width')
 *   public width = null;
 * }
 * ```
 *
 * Since there is a style binding for width present on the element (`[style.width]`) then
 * it will always win over the width binding that is present as a host binding within
 * the `MyWidthDirective`. However, if `[style.width]` renders as `null` (so `myWidth=null`)
 * then the `MyWidthDirective` will be able to write to the `width` style within the context.
 * Simply put, whichever directive writes to a value ends up having ownership of it.
 *
 * The way in which the ownership is facilitated is through index value. The earliest directives
 * get the smallest index values (with 0 being reserved for the template element bindings). Each
 * time a value is written from a directive or the template bindings, the value itself gets
 * assigned the directive index value in its data. If another directive writes a value again then
 * its directive index gets compared against the directive index that exists on the element. Only
 * when the new value's directive index is less than the existing directive index then the new
 * value will be written to the context.
 *
 * Each directive also has its own sanitizer and dirty flags. These values are consumed within the
 * rendering function.
 * @record
 */
export function StylingContext() { }
if (false) {
    /* Skipping unnamed member:
    [StylingIndex.MasterFlagPosition]: number;*/
    /* Skipping unnamed member:
    [StylingIndex.DirectiveRegistryPosition]: DirectiveRegistryValues;*/
    /* Skipping unnamed member:
    [StylingIndex.InitialStyleValuesPosition]: InitialStylingValues;*/
    /* Skipping unnamed member:
    [StylingIndex.InitialClassValuesPosition]: InitialStylingValues;*/
    /* Skipping unnamed member:
    [StylingIndex.SinglePropOffsetPositions]: SinglePropOffsetValues;*/
    /* Skipping unnamed member:
    [StylingIndex.ElementPosition]: RElement|null;*/
    /* Skipping unnamed member:
    [StylingIndex.CachedClassValueOrInitialClassString]: {[key: string]: any}|string|(string)[]|null;*/
    /* Skipping unnamed member:
    [StylingIndex.CachedStyleValue]: {[key: string]: any}|(string)[]|null;*/
    /* Skipping unnamed member:
    [StylingIndex.PlayerContext]: PlayerContext|null;*/
}
/**
 * Used as a styling array to house static class and style values that were extracted
 * by the compiler and placed in the animation context via `elementStart` and
 * `elementHostAttrs`.
 *
 * See [InitialStylingValuesIndex] for a breakdown of how all this works.
 * @record
 */
export function InitialStylingValues() { }
if (false) {
    /* Skipping unnamed member:
    [0]: null;*/
}
/** @enum {number} */
const InitialStylingValuesIndex = {
    KeyValueStartPosition: 1,
    PropOffset: 0,
    ValueOffset: 1,
    Size: 2,
};
export { InitialStylingValuesIndex };
/**
 * An array located in the StylingContext that houses all directive instances and additional
 * data about them.
 *
 * Each entry in this array represents a source of where style/class binding values could
 * come from. By default, there is always at least one directive here with a null value and
 * that represents bindings that live directly on an element (not host bindings).
 *
 * Each successive entry in the array is an actual instance of an array as well as some
 * additional info.
 *
 * An entry within this array has the following values:
 * [0] = The instance of the directive (or null when it is not a directive, but a template binding
 * source)
 * [1] = The pointer that tells where the single styling (stuff like [class.foo] and [style.prop])
 *       offset values are located. This value will allow for a binding instruction to find exactly
 *       where a style is located.
 * [2] = Whether or not the directive has any styling values that are dirty. This is used as
 *       reference within the renderClassAndStyleBindings function to decide whether to skip
 *       iterating through the context when rendering is executed.
 * [3] = The styleSanitizer instance that is assigned to the directive. Although it's unlikely,
 *       a directive could introduce its own special style sanitizer and for this reach each
 *       directive will get its own space for it (if null then the very first sanitizer is used).
 *
 * Each time a new directive is added it will insert these four values at the end of the array.
 * When this array is examined (using indexOf) then the resulting directiveIndex will be resolved
 * by dividing the index value by the size of the array entries (so if DirA is at spot 8 then its
 * index will be 2).
 * @record
 */
export function DirectiveRegistryValues() { }
if (false) {
    /* Skipping unnamed member:
    [DirectiveRegistryValuesIndex.DirectiveValueOffset]: null;*/
    /* Skipping unnamed member:
    [DirectiveRegistryValuesIndex.SinglePropValuesIndexOffset]: number;*/
    /* Skipping unnamed member:
    [DirectiveRegistryValuesIndex.DirtyFlagOffset]: boolean;*/
    /* Skipping unnamed member:
    [DirectiveRegistryValuesIndex.StyleSanitizerOffset]: StyleSanitizeFn|null;*/
}
/** @enum {number} */
const DirectiveRegistryValuesIndex = {
    DirectiveValueOffset: 0,
    SinglePropValuesIndexOffset: 1,
    DirtyFlagOffset: 2,
    StyleSanitizerOffset: 3,
    Size: 4,
};
export { DirectiveRegistryValuesIndex };
/**
 * An array that contains the index pointer values for every single styling property
 * that exists in the context and for every directive. It also contains the total
 * single styles and single classes that exists in the context as the first two values.
 *
 * Let's say we have the following template code:
 *
 * <div [style.width]="myWidth"
 *      [style.height]="myHeight"
 *      [class.flipped]="flipClass"
 *      directive-with-opacity>
 *      directive-with-foo-bar-classes>
 *
 * We have two directive and template-binding sources,
 * 2 + 1 styles and 1 + 1 classes. When the bindings are
 * registered the SinglePropOffsets array will look like so:
 *
 * s_0/c_0 = template directive value
 * s_1/c_1 = directive one (directive-with-opacity)
 * s_2/c_2 = directive two (directive-with-foo-bar-classes)
 *
 * [3, 2, 2, 1, s_00, s01, c_01, 1, 0, s_10, 0, 1, c_20
 * @record
 */
export function SinglePropOffsetValues() { }
if (false) {
    /* Skipping unnamed member:
    [SinglePropOffsetValuesIndex.StylesCountPosition]: number;*/
    /* Skipping unnamed member:
    [SinglePropOffsetValuesIndex.ClassesCountPosition]: number;*/
}
/** @enum {number} */
const SinglePropOffsetValuesIndex = {
    StylesCountPosition: 0,
    ClassesCountPosition: 1,
    ValueStartPosition: 2,
};
export { SinglePropOffsetValuesIndex };
/** @enum {number} */
const StylingFlags = {
    // Implies no configurations
    None: 0,
    // Whether or not the entry or context itself is dirty
    Dirty: 1,
    // Whether or not this is a class-based assignment
    Class: 2,
    // Whether or not a sanitizer was applied to this property
    Sanitize: 4,
    // Whether or not any player builders within need to produce new players
    PlayerBuildersDirty: 8,
    // If NgClass is present (or some other class handler) then it will handle the map expressions and
    // initial classes
    OnlyProcessSingleClasses: 16,
    // The max amount of bits used to represent these configuration values
    BindingAllocationLocked: 32,
    BitCountSize: 6,
    // There are only six bits here
    BitMask: 63,
};
export { StylingFlags };
/** @enum {number} */
const StylingIndex = {
    // Index of location where the start of single properties are stored. (`updateStyleProp`)
    MasterFlagPosition: 0,
    // Position of where the registered directives exist for this styling context
    DirectiveRegistryPosition: 1,
    // Position of where the initial styles are stored in the styling context
    InitialStyleValuesPosition: 2,
    InitialClassValuesPosition: 3,
    // Index of location where the class index offset value is located
    SinglePropOffsetPositions: 4,
    // Position of where the initial styles are stored in the styling context
    // This index must align with HOST, see interfaces/view.ts
    ElementPosition: 5,
    // Position of where the last string-based CSS class value was stored (or a cached version of the
    // initial styles when a [class] directive is present)
    CachedClassValueOrInitialClassString: 6,
    // Position of where the last string-based CSS class value was stored
    CachedStyleValue: 7,
    // Multi and single entries are stored in `StylingContext` as: Flag; PropertyName;  PropertyValue
    // Position of where the initial styles are stored in the styling context
    PlayerContext: 8,
    // Location of single (prop) value entries are stored within the context
    SingleStylesStartPosition: 9,
    FlagsOffset: 0,
    PropertyOffset: 1,
    ValueOffset: 2,
    PlayerBuilderIndexOffset: 3,
    // Size of each multi or single entry (flag + prop + value + playerBuilderIndex)
    Size: 4,
    // Each flag has a binary digit length of this value
    BitCountSize: 14,
    // The binary digit value as a mask
    BitMask: 16383,
};
export { StylingIndex };
/** @enum {number} */
const DirectiveOwnerAndPlayerBuilderIndex = {
    BitCountSize: 16,
    BitMask: 65535,
};
export { DirectiveOwnerAndPlayerBuilderIndex };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3R5bGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL3JlbmRlcjMvaW50ZXJmYWNlcy9zdHlsaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUEwTUEsb0NBcURDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQVNELDBDQUF1Rjs7Ozs7OztJQXVGckYsd0JBQXlCO0lBQ3pCLGFBQWM7SUFDZCxjQUFlO0lBQ2YsT0FBUTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBZ0NWLDZDQUtDOzs7Ozs7Ozs7Ozs7O0lBT0MsdUJBQXdCO0lBQ3hCLDhCQUErQjtJQUMvQixrQkFBbUI7SUFDbkIsdUJBQXdCO0lBQ3hCLE9BQVE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTBCViw0Q0FHQzs7Ozs7Ozs7O0lBT0Msc0JBQXVCO0lBQ3ZCLHVCQUF3QjtJQUN4QixxQkFBc0I7Ozs7O0lBUXRCLDRCQUE0QjtJQUM1QixPQUFlO0lBQ2Ysc0RBQXNEO0lBQ3RELFFBQWdCO0lBQ2hCLGtEQUFrRDtJQUNsRCxRQUFnQjtJQUNoQiwwREFBMEQ7SUFDMUQsV0FBbUI7SUFDbkIsd0VBQXdFO0lBQ3hFLHNCQUE4QjtJQUM5QixrR0FBa0c7SUFDbEcsa0JBQWtCO0lBQ2xCLDRCQUFtQztJQUNuQyxzRUFBc0U7SUFDdEUsMkJBQWtDO0lBQ2xDLGVBQWdCO0lBQ2hCLCtCQUErQjtJQUMvQixXQUFrQjs7Ozs7SUFLbEIseUZBQXlGO0lBQ3pGLHFCQUFzQjtJQUN0Qiw2RUFBNkU7SUFDN0UsNEJBQTZCO0lBQzdCLHlFQUF5RTtJQUN6RSw2QkFBOEI7SUFDOUIsNkJBQThCO0lBQzlCLGtFQUFrRTtJQUNsRSw0QkFBNkI7SUFDN0IseUVBQXlFO0lBQ3pFLDBEQUEwRDtJQUMxRCxrQkFBbUI7SUFDbkIsaUdBQWlHO0lBQ2pHLHNEQUFzRDtJQUN0RCx1Q0FBd0M7SUFDeEMscUVBQXFFO0lBQ3JFLG1CQUFvQjtJQUNwQixpR0FBaUc7SUFDakcseUVBQXlFO0lBQ3pFLGdCQUFpQjtJQUNqQix3RUFBd0U7SUFDeEUsNEJBQTZCO0lBQzdCLGNBQWU7SUFDZixpQkFBa0I7SUFDbEIsY0FBZTtJQUNmLDJCQUE0QjtJQUM1QixnRkFBZ0Y7SUFDaEYsT0FBUTtJQUNSLG9EQUFvRDtJQUNwRCxnQkFBaUI7SUFDakIsbUNBQW1DO0lBQ25DLGNBQTBCOzs7OztJQVkxQixnQkFBaUI7SUFDakIsY0FBNEIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge1N0eWxlU2FuaXRpemVGbn0gZnJvbSAnLi4vLi4vc2FuaXRpemF0aW9uL3N0eWxlX3Nhbml0aXplcic7XG5pbXBvcnQge1JFbGVtZW50fSBmcm9tICcuLi9pbnRlcmZhY2VzL3JlbmRlcmVyJztcbmltcG9ydCB7UGxheWVyQ29udGV4dH0gZnJvbSAnLi9wbGF5ZXInO1xuXG4vKipcbiAqIFRoZSBzdHlsaW5nIGNvbnRleHQgYWN0cyBhcyBhIHN0eWxpbmcgbWFuaWZlc3QgKHNoYXBlZCBhcyBhbiBhcnJheSkgZm9yIGRldGVybWluaW5nIHdoaWNoXG4gKiBzdHlsaW5nIHByb3BlcnRpZXMgaGF2ZSBiZWVuIGFzc2lnbmVkIHZpYSB0aGUgcHJvdmlkZWQgYHVwZGF0ZVN0eWxpbmdNYXBgLCBgdXBkYXRlU3R5bGVQcm9wYFxuICogYW5kIGB1cGRhdGVDbGFzc1Byb3BgIGZ1bmN0aW9ucy4gSXQgYWxzbyBzdG9yZXMgdGhlIHN0YXRpYyBzdHlsZS9jbGFzcyB2YWx1ZXMgdGhhdCB3ZXJlXG4gKiBleHRyYWN0ZWQgZnJvbSB0aGUgdGVtcGxhdGUgYnkgdGhlIGNvbXBpbGVyLlxuICpcbiAqIEEgY29udGV4dCBpcyBjcmVhdGVkIGJ5IEFuZ3VsYXIgd2hlbjpcbiAqIDEuIEFuIGVsZW1lbnQgY29udGFpbnMgc3RhdGljIHN0eWxpbmcgdmFsdWVzIChsaWtlIHN0eWxlPVwiLi4uXCIgb3IgY2xhc3M9XCIuLi5cIilcbiAqIDIuIEFuIGVsZW1lbnQgY29udGFpbnMgc2luZ2xlIHByb3BlcnR5IGJpbmRpbmcgdmFsdWVzIChsaWtlIFtzdHlsZS5wcm9wXT1cInhcIiBvclxuICogW2NsYXNzLnByb3BdPVwieVwiKVxuICogMy4gQW4gZWxlbWVudCBjb250YWlucyBtdWx0aSBwcm9wZXJ0eSBiaW5kaW5nIHZhbHVlcyAobGlrZSBbc3R5bGVdPVwieFwiIG9yIFtjbGFzc109XCJ5XCIpXG4gKiA0LiBBIGRpcmVjdGl2ZSBjb250YWlucyBob3N0IGJpbmRpbmdzIGZvciBzdGF0aWMsIHNpbmdsZSBvciBtdWx0aSBzdHlsaW5nIHByb3BlcnRpZXMvYmluZGluZ3MuXG4gKiA1LiBBbiBhbmltYXRpb24gcGxheWVyIGlzIGFkZGVkIHRvIGFuIGVsZW1lbnQgdmlhIGBhZGRQbGF5ZXJgXG4gKlxuICogTm90ZSB0aGF0IGV2ZW4gaWYgYW4gZWxlbWVudCBjb250YWlucyBzdGF0aWMgc3R5bGluZyB0aGVuIHRoaXMgY29udGV4dCB3aWxsIGJlIGNyZWF0ZWQgYW5kXG4gKiBhdHRhY2hlZCB0byBpdC4gVGhlIHJlYXNvbiB3aHkgdGhpcyBoYXBwZW5zIChpbnN0ZWFkIG9mIHRyZWF0aW5nIHN0eWxlcy9jbGFzc2VzIGFzIHJlZ3VsYXJcbiAqIEhUTUwgYXR0cmlidXRlcykgaXMgYmVjYXVzZSB0aGUgc3R5bGUvY2xhc3MgYmluZGluZ3MgbXVzdCBiZSBhYmxlIHRvIGRlZmF1bHQgdGhlbXNlbHZlcyBiYWNrXG4gKiB0byB0aGVpciByZXNwZWN0aXZlIHN0YXRpYyB2YWx1ZXMgd2hlbiB0aGV5IGFyZSBzZXQgdG8gbnVsbC5cbiAqXG4gKiBTYXkgZm9yIGV4YW1wbGUgd2UgaGF2ZSB0aGlzOlxuICogYGBgXG4gKiA8IS0tIHdoZW4gbXlXaWR0aEV4cD1udWxsIHRoZW4gYSB3aWR0aCBvZiBcIjEwMHB4XCJcbiAqICAgICAgd2lsbCBiZSB1c2VkIGEgZGVmYXVsdCB2YWx1ZSBmb3Igd2lkdGggLS0+XG4gKiA8ZGl2IHN0eWxlPVwid2lkdGg6MTAwcHhcIiBbc3R5bGUud2lkdGhdPVwibXlXaWR0aEV4cFwiPjwvZGl2PlxuICogYGBgXG4gKlxuICogRXZlbiBpbiB0aGUgc2l0dWF0aW9uIHdoZXJlIHRoZXJlIGFyZSBubyBiaW5kaW5ncywgdGhlIHN0YXRpYyBzdHlsaW5nIGlzIHN0aWxsIHBsYWNlZCBpbnRvIHRoZVxuICogY29udGV4dCBiZWNhdXNlIHRoZXJlIG1heSBiZSBhbm90aGVyIGRpcmVjdGl2ZSBvbiB0aGUgc2FtZSBlbGVtZW50IHRoYXQgaGFzIHN0eWxpbmcuXG4gKlxuICogV2hlbiBBbmd1bGFyIGluaXRpYWxpemVzIHN0eWxpbmcgZGF0YSBmb3IgYW4gZWxlbWVudCB0aGVuIGl0IHdpbGwgZmlyc3QgcmVnaXN0ZXIgdGhlIHN0YXRpY1xuICogc3R5bGluZyB2YWx1ZXMgb24gdGhlIGVsZW1lbnQgdXNpbmcgb25lIG9mIHRoZXNlIHR3byBpbnN0cnVjdGlvbnM6XG4gKlxuICogMS4gZWxlbWVudFN0YXJ0IG9yIGVsZW1lbnQgKHdpdGhpbiB0aGUgdGVtcGxhdGUgZnVuY3Rpb24gb2YgYSBjb21wb25lbnQpXG4gKiAyLiBlbGVtZW50SG9zdEF0dHJzIChmb3IgZGlyZWN0aXZlIGhvc3QgYmluZGluZ3MpXG4gKlxuICogSW4gZWl0aGVyIGNhc2UsIGEgc3R5bGluZyBjb250ZXh0IHdpbGwgYmUgY3JlYXRlZCBhbmQgc3RvcmVkIHdpdGhpbiBhbiBlbGVtZW50J3MgTFZpZXdEYXRhLiBPbmNlXG4gKiB0aGUgc3R5bGluZyBjb250ZXh0IGlzIGNyZWF0ZWQgdGhlbiBzaW5nbGUgYW5kIG11bHRpIHByb3BlcnRpZXMgY2FuIHN0b3JlZCB3aXRoaW4gaXQuIEZvciB0aGlzIHRvXG4gKiBoYXBwZW4sIHRoZSBmb2xsb3dpbmcgZnVuY3Rpb24gbmVlZHMgdG8gYmUgY2FsbGVkOlxuICpcbiAqIGBlbGVtZW50U3R5bGluZ2AgKGNhbGxlZCB3aXRoIHN0eWxlIHByb3BlcnRpZXMsIGNsYXNzIHByb3BlcnRpZXMgYW5kIGEgc2FuaXRpemVyICsgYSBkaXJlY3RpdmVcbiAqIGluc3RhbmNlKS5cbiAqXG4gKiBXaGVuIHRoaXMgaW5zdHJ1Y3Rpb24gaXMgY2FsbGVkIGl0IHdpbGwgcG9wdWxhdGUgdGhlIHN0eWxpbmcgY29udGV4dCB3aXRoIHRoZSBwcm92aWRlZCBzdHlsZVxuICogYW5kIGNsYXNzIG5hbWVzIGludG8gdGhlIGNvbnRleHQuXG4gKlxuICogVGhlIGNvbnRleHQgaXRzZWxmIGxvb2tzIGxpa2UgdGhpczpcbiAqXG4gKiBjb250ZXh0ID0gW1xuICogICAvLyAwLTg6IGhlYWRlciB2YWx1ZXMgKGFib3V0IDggZW50cmllcyBvZiBjb25maWd1cmF0aW9uIGRhdGEpXG4gKiAgIC8vIDkrOiB0aGlzIGlzIHdoZXJlIGVhY2ggZW50cnkgaXMgc3RvcmVkOlxuICogXVxuICpcbiAqIExldCdzIHNheSB3ZSBoYXZlIHRoZSBmb2xsb3dpbmcgdGVtcGxhdGUgY29kZTpcbiAqXG4gKiBgYGBcbiAqIDxkaXYgY2xhc3M9XCJmb28gYmFyXCJcbiAqICAgICAgc3R5bGU9XCJ3aWR0aDoyMDBweDsgY29sb3I6cmVkXCJcbiAqICAgICAgW3N0eWxlLndpZHRoXT1cIm15V2lkdGhFeHBcIlxuICogICAgICBbc3R5bGUuaGVpZ2h0XT1cIm15SGVpZ2h0RXhwXCJcbiAqICAgICAgW2NsYXNzLmJhel09XCJteUJhekV4cFwiPlxuICogYGBgXG4gKlxuICogVGhlIGNvbnRleHQgZ2VuZXJhdGVkIGZyb20gdGhlc2UgdmFsdWVzIHdpbGwgbG9vayBsaWtlIHRoaXMgKG5vdGUgdGhhdFxuICogZm9yIGVhY2ggYmluZGluZyBuYW1lICh0aGUgY2xhc3MgYW5kIHN0eWxlIGJpbmRpbmdzKSB0aGUgdmFsdWVzIHdpbGxcbiAqIGJlIGluc2VydGVkIHR3aWNlIGludG8gdGhlIGFycmF5IChvbmNlIGZvciBzaW5nbGUgcHJvcGVydHkgZW50cmllcykgYW5kXG4gKiBhbm90aGVyIGZvciBtdWx0aSBwcm9wZXJ0eSBlbnRyaWVzKS5cbiAqXG4gKiBjb250ZXh0ID0gW1xuICogICAvLyAwLTg6IGhlYWRlciB2YWx1ZXMgKGFib3V0IDggZW50cmllcyBvZiBjb25maWd1cmF0aW9uIGRhdGEpXG4gKiAgIC8vIDkrOiB0aGlzIGlzIHdoZXJlIGVhY2ggZW50cnkgaXMgc3RvcmVkOlxuICpcbiAqICAgLy8gU0lOR0xFIFBST1BFUlRJRVNcbiAqICAgY29uZmlnRm9yV2lkdGgsXG4gKiAgICd3aWR0aCdcbiAqICAgbXlXaWR0aEV4cCwgLy8gdGhlIGJpbmRpbmcgdmFsdWUgbm90IHRoZSBiaW5kaW5nIGl0c2VsZlxuICogICAwLCAvLyB0aGUgZGlyZWN0aXZlIG93bmVyXG4gKlxuICogICBjb25maWdGb3JIZWlnaHQsXG4gKiAgICdoZWlnaHQnXG4gKiAgIG15SGVpZ2h0RXhwLCAvLyB0aGUgYmluZGluZyB2YWx1ZSBub3QgdGhlIGJpbmRpbmcgaXRzZWxmXG4gKiAgIDAsIC8vIHRoZSBkaXJlY3RpdmUgb3duZXJcbiAqXG4gKiAgIGNvbmZpZ0ZvckJhekNsYXNzLFxuICogICAnYmF6XG4gKiAgIG15QmF6Q2xhc3NFeHAsIC8vIHRoZSBiaW5kaW5nIHZhbHVlIG5vdCB0aGUgYmluZGluZyBpdHNlbGZcbiAqICAgMCwgLy8gdGhlIGRpcmVjdGl2ZSBvd25lclxuICpcbiAqICAgLy8gTVVMVEkgUFJPUEVSVElFU1xuICogICBjb25maWdGb3JXaWR0aCxcbiAqICAgJ3dpZHRoJ1xuICogICBteVdpZHRoRXhwLCAvLyB0aGUgYmluZGluZyB2YWx1ZSBub3QgdGhlIGJpbmRpbmcgaXRzZWxmXG4gKiAgIDAsIC8vIHRoZSBkaXJlY3RpdmUgb3duZXJcbiAqXG4gKiAgIGNvbmZpZ0ZvckhlaWdodCxcbiAqICAgJ2hlaWdodCdcbiAqICAgbXlIZWlnaHRFeHAsIC8vIHRoZSBiaW5kaW5nIHZhbHVlIG5vdCB0aGUgYmluZGluZyBpdHNlbGZcbiAqICAgMCwgLy8gdGhlIGRpcmVjdGl2ZSBvd25lclxuICpcbiAqICAgY29uZmlnRm9yQmF6Q2xhc3MsXG4gKiAgICdiYXpcbiAqICAgbXlCYXpDbGFzc0V4cCwgLy8gdGhlIGJpbmRpbmcgdmFsdWUgbm90IHRoZSBiaW5kaW5nIGl0c2VsZlxuICogICAwLCAvLyB0aGUgZGlyZWN0aXZlIG93bmVyXG4gKiBdXG4gKlxuICogVGhlIGNvbmZpZ3VyYXRpb24gdmFsdWVzIGFyZSBsZWZ0IG91dCBvZiB0aGUgZXhhbXBsZSBhYm92ZSBiZWNhdXNlXG4gKiB0aGUgb3JkZXJpbmcgb2YgdGhlbSBjb3VsZCBjaGFuZ2UgYmV0d2VlbiBjb2RlIHBhdGNoZXMuIFBsZWFzZSByZWFkIHRoZVxuICogZG9jdW1lbnRhdGlvbiBiZWxvdyB0byBnZXQgYSBiZXR0ZXIgdW5kZXJzdGFuZCBvZiB3aGF0IHRoZSBjb25maWd1cmF0aW9uXG4gKiB2YWx1ZXMgYXJlIGFuZCBob3cgdGhleSB3b3JrLlxuICpcbiAqIEVhY2ggdGltZSBhIGJpbmRpbmcgcHJvcGVydHkgaXMgdXBkYXRlZCAod2hldGhlciBpdCBiZSB0aHJvdWdoIGEgc2luZ2xlXG4gKiBwcm9wZXJ0eSBpbnN0cnVjdGlvbiBsaWtlIGBlbGVtZW50U3R5bGVQcm9wYCwgYGVsZW1lbnRDbGFzc1Byb3BgIG9yXG4gKiBgZWxlbWVudFN0eWxpbmdNYXBgKSB0aGVuIHRoZSB2YWx1ZXMgaW4gdGhlIGNvbnRleHQgd2lsbCBiZSB1cGRhdGVkIGFzXG4gKiB3ZWxsLlxuICpcbiAqIElmIGZvciBleGFtcGxlIGBbc3R5bGUud2lkdGhdYCB1cGRhdGVzIHRvIGA1NTVweGAgdGhlbiBpdHMgdmFsdWUgd2lsbCBiZSByZWZsZWN0ZWRcbiAqIGluIHRoZSBjb250ZXh0IGFzIHNvOlxuICpcbiAqIGNvbnRleHQgPSBbXG4gKiAgIC8vIC4uLlxuICogICBjb25maWdGb3JXaWR0aCwgLy8gdGhpcyB3aWxsIGJlIG1hcmtlZCBESVJUWVxuICogICAnd2lkdGgnXG4gKiAgICc1NTVweCcsXG4gKiAgIDAsXG4gKiAgIC8vLi5cbiAqIF1cbiAqXG4gKiBUaGUgY29udGV4dCBhbmQgZGlyZWN0aXZlIGRhdGEgd2lsbCBhbHNvIGJlIG1hcmtlZCBkaXJ0eS5cbiAqXG4gKiBEZXNwaXRlIHRoZSBjb250ZXh0IGJlaW5nIHVwZGF0ZWQsIG5vdGhpbmcgaGFzIGJlZW4gcmVuZGVyZWQgb24gc2NyZWVuIChub3Qgc3R5bGVzIG9yXG4gKiBjbGFzc2VzIGhhdmUgYmVlbiBzZXQgb24gdGhlIGVsZW1lbnQpLiBUbyBraWNrIG9mZiByZW5kZXJpbmcgZm9yIGFuIGVsZW1lbnQgdGhlIGZvbGxvd2luZ1xuICogZnVuY3Rpb24gbmVlZHMgdG8gYmUgcnVuIGBlbGVtZW50U3R5bGluZ0FwcGx5YC5cbiAqXG4gKiBgZWxlbWVudFN0eWxpbmdBcHBseWAgd2lsbCBydW4gdGhyb3VnaCB0aGUgY29udGV4dCBhbmQgZmluZCBlYWNoIGRpcnR5IHZhbHVlIGFuZCByZW5kZXIgdGhlbSBvbnRvXG4gKiB0aGUgZWxlbWVudC4gT25jZSBjb21wbGV0ZSwgYWxsIHN0eWxlcy9jbGFzc2VzIHdpbGwgYmUgc2V0IHRvIGNsZWFuLiBCZWNhdXNlIG9mIHRoaXMsIHRoZSByZW5kZXJcbiAqIGZ1bmN0aW9uIHdpbGwgbm93IGtub3cgbm90IHRvIHJlcnVuIGl0c2VsZiBhZ2FpbiBpZiBjYWxsZWQgYWdhaW4gdW5sZXNzIG5ldyBzdHlsZS9jbGFzcyB2YWx1ZXNcbiAqIGhhdmUgY2hhbmdlZC5cbiAqXG4gKiAjIyBEaXJlY3RpdmVzXG4gKiBEaXJlY3RpdmVzIHN0eWxlIHZhbHVlcyAod2hpY2ggYXJlIHByb3ZpZGVkIHRocm91Z2ggaG9zdCBiaW5kaW5ncykgYXJlIGFsc28gc3VwcG9ydGVkIGFuZFxuICogaG91c2VkIHdpdGhpbiB0aGUgc2FtZSBzdHlsaW5nIGNvbnRleHQgYXMgYXJlIHRlbXBsYXRlLWxldmVsIHN0eWxlL2NsYXNzIHByb3BlcnRpZXMvYmluZGluZ3MuXG4gKiBCb3RoIGRpcmVjdGl2ZS1sZXZlbCBhbmQgdGVtcGxhdGUtbGV2ZWwgc3R5bGluZyBiaW5kaW5ncyBzaGFyZSB0aGUgc2FtZSBjb250ZXh0LlxuICpcbiAqIEVhY2ggb2YgdGhlIGZvbGxvd2luZyBpbnN0cnVjdGlvbnMgc3VwcG9ydHMgYWNjZXB0aW5nIGEgZGlyZWN0aXZlIGluc3RhbmNlIGFzIGFuIGlucHV0IHBhcmFtZXRlcjpcbiAqXG4gKiAtIGBlbGVtZW50SG9zdEF0dHJzYFxuICogLSBgZWxlbWVudFN0eWxpbmdgXG4gKiAtIGBlbGVtZW50U3R5bGVQcm9wYFxuICogLSBgZWxlbWVudENsYXNzUHJvcGBcbiAqIC0gYGVsZW1lbnRTdHlsaW5nTWFwYFxuICogLSBgZWxlbWVudFN0eWxpbmdBcHBseWBcbiAqXG4gKiBFYWNoIHRpbWUgYSBkaXJlY3RpdmVSZWYgaXMgcGFzc2VkIGluLCBpdCB3aWxsIGJlIGNvbnZlcnRlZCBpbnRvIGFuIGluZGV4IGJ5IGV4YW1pbmluZyB0aGVcbiAqIGRpcmVjdGl2ZSByZWdpc3RyeSAod2hpY2ggbGl2ZXMgaW4gdGhlIGNvbnRleHQgY29uZmlndXJhdGlvbiBhcmVhKS4gVGhlIGluZGV4IGlzIHRoZW4gdXNlZFxuICogdG8gaGVscCBzaW5nbGUgc3R5bGUgcHJvcGVydGllcyBmaWd1cmUgb3V0IHdoZXJlIGEgdmFsdWUgaXMgbG9jYXRlZCBpbiB0aGUgY29udGV4dC5cbiAqXG4gKiBJZiB0d28gZGlyZWN0aXZlcyBvciBhIGRpcmVjdGl2ZSArIGEgdGVtcGxhdGUgYmluZGluZyBib3RoIHdyaXRlIHRvIHRoZSBzYW1lIHN0eWxlL2NsYXNzXG4gKiBiaW5kaW5nIHRoZW4gdGhlIHN0eWxpbmcgY29udGV4dCBjb2RlIHdpbGwgZGVjaWRlIHdoaWNoIG9uZSB3aW5zIGJhc2VkIG9uIHRoZSBmb2xsb3dpbmdcbiAqIHJ1bGU6XG4gKlxuICogMS4gSWYgdGhlIHRlbXBsYXRlIGJpbmRpbmcgaGFzIGEgdmFsdWUgdGhlbiBpdCBhbHdheXMgd2luc1xuICogMi4gSWYgbm90IHRoZW4gd2hpY2hldmVyIGZpcnN0LXJlZ2lzdGVyZWQgZGlyZWN0aXZlIHRoYXQgaGFzIHRoYXQgdmFsdWUgZmlyc3Qgd2lsbCB3aW5cbiAqXG4gKiBUaGUgY29kZSBleGFtcGxlIGhlbHBzIG1ha2UgdGhpcyBjbGVhcjpcbiAqXG4gKiBgYGBcbiAqIDxkaXYgW3N0eWxlLndpZHRoXT1cIm15V2lkdGhcIiBbbXktd2lkdGgtZGlyZWN0aXZlXT1cIic2MDBweFwiPlxuICogQERpcmVjdGl2ZSh7IHNlbGVjdG9yOiAnW215LXdpZHRoLWRpcmVjdGl2ZScgXX0pXG4gKiBjbGFzcyBNeVdpZHRoRGlyZWN0aXZlIHtcbiAqICAgQElucHV0KCdteS13aWR0aC1kaXJlY3RpdmUnKVxuICogICBASG9zdEJpbmRpbmcoJ3N0eWxlLndpZHRoJylcbiAqICAgcHVibGljIHdpZHRoID0gbnVsbDtcbiAqIH1cbiAqIGBgYFxuICpcbiAqIFNpbmNlIHRoZXJlIGlzIGEgc3R5bGUgYmluZGluZyBmb3Igd2lkdGggcHJlc2VudCBvbiB0aGUgZWxlbWVudCAoYFtzdHlsZS53aWR0aF1gKSB0aGVuXG4gKiBpdCB3aWxsIGFsd2F5cyB3aW4gb3ZlciB0aGUgd2lkdGggYmluZGluZyB0aGF0IGlzIHByZXNlbnQgYXMgYSBob3N0IGJpbmRpbmcgd2l0aGluXG4gKiB0aGUgYE15V2lkdGhEaXJlY3RpdmVgLiBIb3dldmVyLCBpZiBgW3N0eWxlLndpZHRoXWAgcmVuZGVycyBhcyBgbnVsbGAgKHNvIGBteVdpZHRoPW51bGxgKVxuICogdGhlbiB0aGUgYE15V2lkdGhEaXJlY3RpdmVgIHdpbGwgYmUgYWJsZSB0byB3cml0ZSB0byB0aGUgYHdpZHRoYCBzdHlsZSB3aXRoaW4gdGhlIGNvbnRleHQuXG4gKiBTaW1wbHkgcHV0LCB3aGljaGV2ZXIgZGlyZWN0aXZlIHdyaXRlcyB0byBhIHZhbHVlIGVuZHMgdXAgaGF2aW5nIG93bmVyc2hpcCBvZiBpdC5cbiAqXG4gKiBUaGUgd2F5IGluIHdoaWNoIHRoZSBvd25lcnNoaXAgaXMgZmFjaWxpdGF0ZWQgaXMgdGhyb3VnaCBpbmRleCB2YWx1ZS4gVGhlIGVhcmxpZXN0IGRpcmVjdGl2ZXNcbiAqIGdldCB0aGUgc21hbGxlc3QgaW5kZXggdmFsdWVzICh3aXRoIDAgYmVpbmcgcmVzZXJ2ZWQgZm9yIHRoZSB0ZW1wbGF0ZSBlbGVtZW50IGJpbmRpbmdzKS4gRWFjaFxuICogdGltZSBhIHZhbHVlIGlzIHdyaXR0ZW4gZnJvbSBhIGRpcmVjdGl2ZSBvciB0aGUgdGVtcGxhdGUgYmluZGluZ3MsIHRoZSB2YWx1ZSBpdHNlbGYgZ2V0c1xuICogYXNzaWduZWQgdGhlIGRpcmVjdGl2ZSBpbmRleCB2YWx1ZSBpbiBpdHMgZGF0YS4gSWYgYW5vdGhlciBkaXJlY3RpdmUgd3JpdGVzIGEgdmFsdWUgYWdhaW4gdGhlblxuICogaXRzIGRpcmVjdGl2ZSBpbmRleCBnZXRzIGNvbXBhcmVkIGFnYWluc3QgdGhlIGRpcmVjdGl2ZSBpbmRleCB0aGF0IGV4aXN0cyBvbiB0aGUgZWxlbWVudC4gT25seVxuICogd2hlbiB0aGUgbmV3IHZhbHVlJ3MgZGlyZWN0aXZlIGluZGV4IGlzIGxlc3MgdGhhbiB0aGUgZXhpc3RpbmcgZGlyZWN0aXZlIGluZGV4IHRoZW4gdGhlIG5ld1xuICogdmFsdWUgd2lsbCBiZSB3cml0dGVuIHRvIHRoZSBjb250ZXh0LlxuICpcbiAqIEVhY2ggZGlyZWN0aXZlIGFsc28gaGFzIGl0cyBvd24gc2FuaXRpemVyIGFuZCBkaXJ0eSBmbGFncy4gVGhlc2UgdmFsdWVzIGFyZSBjb25zdW1lZCB3aXRoaW4gdGhlXG4gKiByZW5kZXJpbmcgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU3R5bGluZ0NvbnRleHQgZXh0ZW5kc1xuICAgIEFycmF5PHtba2V5OiBzdHJpbmddOiBhbnl9fG51bWJlcnxzdHJpbmd8Ym9vbGVhbnxSRWxlbWVudHxTdHlsZVNhbml0aXplRm58UGxheWVyQ29udGV4dHxudWxsPiB7XG4gIC8qKlxuICAgKiBBIG51bWVyaWMgdmFsdWUgcmVwcmVzZW50aW5nIHRoZSBjb25maWd1cmF0aW9uIHN0YXR1cyAod2hldGhlciB0aGUgY29udGV4dCBpcyBkaXJ0eSBvciBub3QpXG4gICAqIG1peGVkIHRvZ2V0aGVyICh1c2luZyBiaXQgc2hpZnRpbmcpIHdpdGggYSBpbmRleCB2YWx1ZSB3aGljaCB0ZWxscyB0aGUgc3RhcnRpbmcgaW5kZXggdmFsdWVcbiAgICogb2Ygd2hlcmUgdGhlIG11bHRpIHN0eWxlIGVudHJpZXMgYmVnaW4uXG4gICAqL1xuICBbU3R5bGluZ0luZGV4Lk1hc3RlckZsYWdQb3NpdGlvbl06IG51bWJlcjtcblxuICAvKipcbiAgICogTG9jYXRpb24gb2YgdGhlIGNvbGxlY3Rpb24gb2YgZGlyZWN0aXZlcyBmb3IgdGhpcyBjb250ZXh0XG4gICAqL1xuICBbU3R5bGluZ0luZGV4LkRpcmVjdGl2ZVJlZ2lzdHJ5UG9zaXRpb25dOiBEaXJlY3RpdmVSZWdpc3RyeVZhbHVlcztcblxuICAvKipcbiAgICogTG9jYXRpb24gb2YgYWxsIHN0YXRpYyBzdHlsZXMgdmFsdWVzXG4gICAqL1xuICBbU3R5bGluZ0luZGV4LkluaXRpYWxTdHlsZVZhbHVlc1Bvc2l0aW9uXTogSW5pdGlhbFN0eWxpbmdWYWx1ZXM7XG5cbiAgLyoqXG4gICAqIExvY2F0aW9uIG9mIGFsbCBzdGF0aWMgY2xhc3MgdmFsdWVzXG4gICAqL1xuICBbU3R5bGluZ0luZGV4LkluaXRpYWxDbGFzc1ZhbHVlc1Bvc2l0aW9uXTogSW5pdGlhbFN0eWxpbmdWYWx1ZXM7XG5cbiAgLyoqXG4gICAqIEEgbnVtZXJpYyB2YWx1ZSByZXByZXNlbnRpbmcgdGhlIGNsYXNzIGluZGV4IG9mZnNldCB2YWx1ZS4gV2hlbmV2ZXIgYSBzaW5nbGUgY2xhc3MgaXNcbiAgICogYXBwbGllZCAodXNpbmcgYGVsZW1lbnRDbGFzc1Byb3BgKSBpdCBzaG91bGQgaGF2ZSBhbiBzdHlsaW5nIGluZGV4IHZhbHVlIHRoYXQgZG9lc24ndFxuICAgKiBuZWVkIHRvIHRha2UgaW50byBhY2NvdW50IGFueSBzdHlsZSB2YWx1ZXMgdGhhdCBleGlzdCBpbiB0aGUgY29udGV4dC5cbiAgICovXG4gIFtTdHlsaW5nSW5kZXguU2luZ2xlUHJvcE9mZnNldFBvc2l0aW9uc106IFNpbmdsZVByb3BPZmZzZXRWYWx1ZXM7XG5cbiAgLyoqXG4gICAqIExvY2F0aW9uIG9mIGVsZW1lbnQgdGhhdCBpcyB1c2VkIGFzIGEgdGFyZ2V0IGZvciB0aGlzIGNvbnRleHQuXG4gICAqL1xuICBbU3R5bGluZ0luZGV4LkVsZW1lbnRQb3NpdGlvbl06IFJFbGVtZW50fG51bGw7XG5cbiAgLyoqXG4gICAqIFRoZSBsYXN0IGNsYXNzIHZhbHVlIHRoYXQgd2FzIGludGVycHJldGVkIGJ5IGVsZW1lbnRTdHlsaW5nTWFwLiBUaGlzIGlzIGNhY2hlZFxuICAgKiBTbyB0aGF0IHRoZSBhbGdvcml0aG0gY2FuIGV4aXQgZWFybHkgaW5jYXNlIHRoZSB2YWx1ZSBoYXMgbm90IGNoYW5nZWQuXG4gICAqL1xuICBbU3R5bGluZ0luZGV4LkNhY2hlZENsYXNzVmFsdWVPckluaXRpYWxDbGFzc1N0cmluZ106IHtba2V5OiBzdHJpbmddOiBhbnl9fHN0cmluZ3woc3RyaW5nKVtdfG51bGw7XG5cbiAgLyoqXG4gICAqIFRoZSBsYXN0IHN0eWxlIHZhbHVlIHRoYXQgd2FzIGludGVycHJldGVkIGJ5IGVsZW1lbnRTdHlsaW5nTWFwLiBUaGlzIGlzIGNhY2hlZFxuICAgKiBTbyB0aGF0IHRoZSBhbGdvcml0aG0gY2FuIGV4aXQgZWFybHkgaW5jYXNlIHRoZSB2YWx1ZSBoYXMgbm90IGNoYW5nZWQuXG4gICAqL1xuICBbU3R5bGluZ0luZGV4LkNhY2hlZFN0eWxlVmFsdWVdOiB7W2tleTogc3RyaW5nXTogYW55fXwoc3RyaW5nKVtdfG51bGw7XG5cbiAgLyoqXG4gICAqIExvY2F0aW9uIG9mIGFuaW1hdGlvbiBjb250ZXh0ICh3aGljaCBjb250YWlucyB0aGUgYWN0aXZlIHBsYXllcnMpIGZvciB0aGlzIGVsZW1lbnQgc3R5bGluZ1xuICAgKiBjb250ZXh0LlxuICAgKi9cbiAgW1N0eWxpbmdJbmRleC5QbGF5ZXJDb250ZXh0XTogUGxheWVyQ29udGV4dHxudWxsO1xufVxuXG4vKipcbiAqIFVzZWQgYXMgYSBzdHlsaW5nIGFycmF5IHRvIGhvdXNlIHN0YXRpYyBjbGFzcyBhbmQgc3R5bGUgdmFsdWVzIHRoYXQgd2VyZSBleHRyYWN0ZWRcbiAqIGJ5IHRoZSBjb21waWxlciBhbmQgcGxhY2VkIGluIHRoZSBhbmltYXRpb24gY29udGV4dCB2aWEgYGVsZW1lbnRTdGFydGAgYW5kXG4gKiBgZWxlbWVudEhvc3RBdHRyc2AuXG4gKlxuICogU2VlIFtJbml0aWFsU3R5bGluZ1ZhbHVlc0luZGV4XSBmb3IgYSBicmVha2Rvd24gb2YgaG93IGFsbCB0aGlzIHdvcmtzLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEluaXRpYWxTdHlsaW5nVmFsdWVzIGV4dGVuZHMgQXJyYXk8c3RyaW5nfGJvb2xlYW58bnVsbD4geyBbMF06IG51bGw7IH1cblxuLyoqXG4gKiBVc2VkIGFzIGFuIG9mZnNldC9wb3NpdGlvbiBpbmRleCB0byBmaWd1cmUgb3V0IHdoZXJlIGluaXRpYWwgc3R5bGluZ1xuICogdmFsdWVzIGFyZSBsb2NhdGVkLlxuICpcbiAqIFVzZWQgYXMgYSByZWZlcmVuY2UgcG9pbnQgdG8gcHJvdmlkZSBtYXJrZXJzIHRvIGFsbCBzdGF0aWMgc3R5bGluZ1xuICogdmFsdWVzICh0aGUgaW5pdGlhbCBzdHlsZSBhbmQgY2xhc3MgdmFsdWVzIG9uIGFuIGVsZW1lbnQpIHdpdGhpbiBhblxuICogYXJyYXkgd2l0aGluIHRoZSBTdHlsaW5nQ29udGV4dC4gVGhpcyBhcnJheSBjb250YWlucyBrZXkvdmFsdWUgcGFpcnNcbiAqIHdoZXJlIHRoZSBrZXkgaXMgdGhlIHN0eWxlIHByb3BlcnR5IG5hbWUgb3IgY2xhc3NOYW1lIGFuZCB0aGUgdmFsdWUgaXNcbiAqIHRoZSBzdHlsZSB2YWx1ZSBvciB3aGV0aGVyIG9yIG5vdCBhIGNsYXNzIGlzIHByZXNlbnQgb24gdGhlIGVsbWVudC5cbiAqXG4gKiBUaGUgZmlyc3QgdmFsdWUgaXMgYWxzbyBhbHdheXMgbnVsbCBzbyB0aGF0IGEgaW5pdGlhbCBpbmRleCB2YWx1ZSBvZlxuICogYDBgIHdpbGwgYWx3YXlzIHBvaW50IHRvIGEgbnVsbCB2YWx1ZS5cbiAqXG4gKiBJZiBhIDxkaXY+IGVsZW1lbnRzIGNvbnRhaW5zIGEgbGlzdCBvZiBzdGF0aWMgc3R5bGluZyB2YWx1ZXMgbGlrZSBzbzpcbiAqXG4gKiA8ZGl2IGNsYXNzPVwiZm9vIGJhciBiYXpcIiBzdHlsZT1cIndpZHRoOjEwMHB4OyBoZWlnaHQ6MjAwcHg7XCI+XG4gKlxuICogVGhlbiB0aGUgaW5pdGlhbCBzdHlsZXMgZm9yIHRoYXQgd2lsbCBsb29rIGxpa2Ugc286XG4gKlxuICogU3R5bGVzOlxuICogU3R5bGluZ0NvbnRleHRbSW5pdGlhbFN0eWxlc0luZGV4XSA9IFtcbiAqICAgbnVsbCwgJ3dpZHRoJywgJzEwMHB4JywgaGVpZ2h0LCAnMjAwcHgnXG4gKiBdXG4gKlxuICogQ2xhc3NlczpcbiAqIFN0eWxpbmdDb250ZXh0W0luaXRpYWxTdHlsZXNJbmRleF0gPSBbXG4gKiAgIG51bGwsICdmb28nLCB0cnVlLCAnYmFyJywgdHJ1ZSwgJ2JheicsIHRydWVcbiAqIF1cbiAqXG4gKiBJbml0aWFsIHN0eWxlIGFuZCBjbGFzcyBlbnRyaWVzIGhhdmUgdGhlaXIgb3duIGFycmF5cy4gVGhpcyBpcyBiZWNhdXNlXG4gKiBpdCdzIGVhc2llciB0byBhZGQgdG8gdGhlIGVuZCBvZiBvbmUgYXJyYXkgYW5kIG5vdCB0aGVuIGhhdmUgdG8gdXBkYXRlXG4gKiBldmVyeSBjb250ZXh0IGVudHJpZXMnIHBvaW50ZXIgaW5kZXggdG8gdGhlIG5ld2x5IG9mZnNldGVkIHZhbHVlcy5cbiAqXG4gKiBXaGVuIHByb3BlcnR5IGJpbmRpbmRzIGFyZSBhZGRlZCB0byBhIGNvbnRleHQgdGhlbiBpbml0aWFsIHN0eWxlL2NsYXNzXG4gKiB2YWx1ZXMgd2lsbCBhbHNvIGJlIGluc2VydGVkIGludG8gdGhlIGFycmF5LiBUaGlzIGlzIHRvIGNyZWF0ZSBhIHNwYWNlXG4gKiBpbiB0aGUgc2l0dWF0aW9uIHdoZW4gYSBmb2xsb3ctdXAgZGlyZWN0aXZlIGluc2VydHMgc3RhdGljIHN0eWxpbmcgaW50b1xuICogdGhlIGFycmF5LiBCeSBkZWZhdWx0IHN0eWxlIHZhbHVlcyBhcmUgYG51bGxgIGFuZCBjbGFzcyB2YWx1ZXMgYXJlXG4gKiBgZmFsc2VgIHdoZW4gaW5zZXJ0ZWQgYnkgcHJvcGVydHkgYmluZGluZ3MuXG4gKlxuICogRm9yIGV4YW1wbGU6XG4gKiA8ZGl2IGNsYXNzPVwiZm9vIGJhciBiYXpcIlxuICogICAgICBbY2xhc3MuY2FyXT1cIm15Q2FyRXhwXCJcbiAqICAgICAgc3R5bGU9XCJ3aWR0aDoxMDBweDsgaGVpZ2h0OjIwMHB4O1wiXG4gKiAgICAgIFtzdHlsZS5vcGFjaXR5XT1cIm15T3BhY2l0eUV4cFwiPlxuICpcbiAqIFdpbGwgY29uc3RydWN0IGluaXRpYWwgc3R5bGluZyB2YWx1ZXMgdGhhdCBsb29rIGxpa2U6XG4gKlxuICogU3R5bGVzOlxuICogU3R5bGluZ0NvbnRleHRbSW5pdGlhbFN0eWxlc0luZGV4XSA9IFtcbiAqICAgbnVsbCwgJ3dpZHRoJywgJzEwMHB4JywgaGVpZ2h0LCAnMjAwcHgnLCAnb3BhY2l0eScsIG51bGxcbiAqIF1cbiAqXG4gKiBDbGFzc2VzOlxuICogU3R5bGluZ0NvbnRleHRbSW5pdGlhbFN0eWxlc0luZGV4XSA9IFtcbiAqICAgbnVsbCwgJ2ZvbycsIHRydWUsICdiYXInLCB0cnVlLCAnYmF6JywgdHJ1ZSwgJ2NhcicsIGZhbHNlXG4gKiBdXG4gKlxuICogTm93IGlmIGEgZGlyZWN0aXZlIGNvbWVzIGFsb25nIGFuZCBpbnRyb2R1Y2VzIGBjYXJgIGFzIGEgc3RhdGljXG4gKiBjbGFzcyB2YWx1ZSBvciBgb3BhY2l0eWAgdGhlbiB0aG9zZSB2YWx1ZXMgd2lsbCBiZSBmaWxsZWQgaW50b1xuICogdGhlIGluaXRpYWwgc3R5bGVzIGFycmF5LlxuICpcbiAqIEZvciBleGFtcGxlOlxuICpcbiAqIEBEaXJlY3RpdmUoe1xuICogICBzZWxlY3RvcjogJ29wYWNpdHktY2FyLWRpcmVjdGl2ZScsXG4gKiAgIGhvc3Q6IHtcbiAqICAgICAnc3R5bGUnOiAnb3BhY2l0eTowLjUnLFxuICogICAgICdjbGFzcyc6ICdjYXInXG4gKiAgIH1cbiAqIH0pXG4gKiBjbGFzcyBPcGFjaXR5Q2FyRGlyZWN0aXZlIHt9XG4gKlxuICogVGhpcyB3aWxsIHJlbmRlciBpdHNlbGYgYXM6XG4gKlxuICogU3R5bGVzOlxuICogU3R5bGluZ0NvbnRleHRbSW5pdGlhbFN0eWxlc0luZGV4XSA9IFtcbiAqICAgbnVsbCwgJ3dpZHRoJywgJzEwMHB4JywgaGVpZ2h0LCAnMjAwcHgnLCAnb3BhY2l0eScsIG51bGxcbiAqIF1cbiAqXG4gKiBDbGFzc2VzOlxuICogU3R5bGluZ0NvbnRleHRbSW5pdGlhbFN0eWxlc0luZGV4XSA9IFtcbiAqICAgbnVsbCwgJ2ZvbycsIHRydWUsICdiYXInLCB0cnVlLCAnYmF6JywgdHJ1ZSwgJ2NhcicsIGZhbHNlXG4gKiBdXG4gKi9cbmV4cG9ydCBjb25zdCBlbnVtIEluaXRpYWxTdHlsaW5nVmFsdWVzSW5kZXgge1xuICBLZXlWYWx1ZVN0YXJ0UG9zaXRpb24gPSAxLFxuICBQcm9wT2Zmc2V0ID0gMCxcbiAgVmFsdWVPZmZzZXQgPSAxLFxuICBTaXplID0gMlxufVxuXG4vKipcbiAqIEFuIGFycmF5IGxvY2F0ZWQgaW4gdGhlIFN0eWxpbmdDb250ZXh0IHRoYXQgaG91c2VzIGFsbCBkaXJlY3RpdmUgaW5zdGFuY2VzIGFuZCBhZGRpdGlvbmFsXG4gKiBkYXRhIGFib3V0IHRoZW0uXG4gKlxuICogRWFjaCBlbnRyeSBpbiB0aGlzIGFycmF5IHJlcHJlc2VudHMgYSBzb3VyY2Ugb2Ygd2hlcmUgc3R5bGUvY2xhc3MgYmluZGluZyB2YWx1ZXMgY291bGRcbiAqIGNvbWUgZnJvbS4gQnkgZGVmYXVsdCwgdGhlcmUgaXMgYWx3YXlzIGF0IGxlYXN0IG9uZSBkaXJlY3RpdmUgaGVyZSB3aXRoIGEgbnVsbCB2YWx1ZSBhbmRcbiAqIHRoYXQgcmVwcmVzZW50cyBiaW5kaW5ncyB0aGF0IGxpdmUgZGlyZWN0bHkgb24gYW4gZWxlbWVudCAobm90IGhvc3QgYmluZGluZ3MpLlxuICpcbiAqIEVhY2ggc3VjY2Vzc2l2ZSBlbnRyeSBpbiB0aGUgYXJyYXkgaXMgYW4gYWN0dWFsIGluc3RhbmNlIG9mIGFuIGFycmF5IGFzIHdlbGwgYXMgc29tZVxuICogYWRkaXRpb25hbCBpbmZvLlxuICpcbiAqIEFuIGVudHJ5IHdpdGhpbiB0aGlzIGFycmF5IGhhcyB0aGUgZm9sbG93aW5nIHZhbHVlczpcbiAqIFswXSA9IFRoZSBpbnN0YW5jZSBvZiB0aGUgZGlyZWN0aXZlIChvciBudWxsIHdoZW4gaXQgaXMgbm90IGEgZGlyZWN0aXZlLCBidXQgYSB0ZW1wbGF0ZSBiaW5kaW5nXG4gKiBzb3VyY2UpXG4gKiBbMV0gPSBUaGUgcG9pbnRlciB0aGF0IHRlbGxzIHdoZXJlIHRoZSBzaW5nbGUgc3R5bGluZyAoc3R1ZmYgbGlrZSBbY2xhc3MuZm9vXSBhbmQgW3N0eWxlLnByb3BdKVxuICogICAgICAgb2Zmc2V0IHZhbHVlcyBhcmUgbG9jYXRlZC4gVGhpcyB2YWx1ZSB3aWxsIGFsbG93IGZvciBhIGJpbmRpbmcgaW5zdHJ1Y3Rpb24gdG8gZmluZCBleGFjdGx5XG4gKiAgICAgICB3aGVyZSBhIHN0eWxlIGlzIGxvY2F0ZWQuXG4gKiBbMl0gPSBXaGV0aGVyIG9yIG5vdCB0aGUgZGlyZWN0aXZlIGhhcyBhbnkgc3R5bGluZyB2YWx1ZXMgdGhhdCBhcmUgZGlydHkuIFRoaXMgaXMgdXNlZCBhc1xuICogICAgICAgcmVmZXJlbmNlIHdpdGhpbiB0aGUgcmVuZGVyQ2xhc3NBbmRTdHlsZUJpbmRpbmdzIGZ1bmN0aW9uIHRvIGRlY2lkZSB3aGV0aGVyIHRvIHNraXBcbiAqICAgICAgIGl0ZXJhdGluZyB0aHJvdWdoIHRoZSBjb250ZXh0IHdoZW4gcmVuZGVyaW5nIGlzIGV4ZWN1dGVkLlxuICogWzNdID0gVGhlIHN0eWxlU2FuaXRpemVyIGluc3RhbmNlIHRoYXQgaXMgYXNzaWduZWQgdG8gdGhlIGRpcmVjdGl2ZS4gQWx0aG91Z2ggaXQncyB1bmxpa2VseSxcbiAqICAgICAgIGEgZGlyZWN0aXZlIGNvdWxkIGludHJvZHVjZSBpdHMgb3duIHNwZWNpYWwgc3R5bGUgc2FuaXRpemVyIGFuZCBmb3IgdGhpcyByZWFjaCBlYWNoXG4gKiAgICAgICBkaXJlY3RpdmUgd2lsbCBnZXQgaXRzIG93biBzcGFjZSBmb3IgaXQgKGlmIG51bGwgdGhlbiB0aGUgdmVyeSBmaXJzdCBzYW5pdGl6ZXIgaXMgdXNlZCkuXG4gKlxuICogRWFjaCB0aW1lIGEgbmV3IGRpcmVjdGl2ZSBpcyBhZGRlZCBpdCB3aWxsIGluc2VydCB0aGVzZSBmb3VyIHZhbHVlcyBhdCB0aGUgZW5kIG9mIHRoZSBhcnJheS5cbiAqIFdoZW4gdGhpcyBhcnJheSBpcyBleGFtaW5lZCAodXNpbmcgaW5kZXhPZikgdGhlbiB0aGUgcmVzdWx0aW5nIGRpcmVjdGl2ZUluZGV4IHdpbGwgYmUgcmVzb2x2ZWRcbiAqIGJ5IGRpdmlkaW5nIHRoZSBpbmRleCB2YWx1ZSBieSB0aGUgc2l6ZSBvZiB0aGUgYXJyYXkgZW50cmllcyAoc28gaWYgRGlyQSBpcyBhdCBzcG90IDggdGhlbiBpdHNcbiAqIGluZGV4IHdpbGwgYmUgMikuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRGlyZWN0aXZlUmVnaXN0cnlWYWx1ZXMgZXh0ZW5kcyBBcnJheTxudWxsfHt9fGJvb2xlYW58bnVtYmVyfFN0eWxlU2FuaXRpemVGbj4ge1xuICBbRGlyZWN0aXZlUmVnaXN0cnlWYWx1ZXNJbmRleC5EaXJlY3RpdmVWYWx1ZU9mZnNldF06IG51bGw7XG4gIFtEaXJlY3RpdmVSZWdpc3RyeVZhbHVlc0luZGV4LlNpbmdsZVByb3BWYWx1ZXNJbmRleE9mZnNldF06IG51bWJlcjtcbiAgW0RpcmVjdGl2ZVJlZ2lzdHJ5VmFsdWVzSW5kZXguRGlydHlGbGFnT2Zmc2V0XTogYm9vbGVhbjtcbiAgW0RpcmVjdGl2ZVJlZ2lzdHJ5VmFsdWVzSW5kZXguU3R5bGVTYW5pdGl6ZXJPZmZzZXRdOiBTdHlsZVNhbml0aXplRm58bnVsbDtcbn1cblxuLyoqXG4gKiBBbiBlbnVtIHRoYXQgb3V0bGluZXMgdGhlIG9mZnNldC9wb3NpdGlvbiB2YWx1ZXMgZm9yIGVhY2ggZGlyZWN0aXZlIGVudHJ5IGFuZCBpdHMgZGF0YVxuICogdGhhdCBhcmUgaG91c2VkIGluc2lkZSBvZiBbRGlyZWN0aXZlUmVnaXN0cnlWYWx1ZXNdLlxuICovXG5leHBvcnQgY29uc3QgZW51bSBEaXJlY3RpdmVSZWdpc3RyeVZhbHVlc0luZGV4IHtcbiAgRGlyZWN0aXZlVmFsdWVPZmZzZXQgPSAwLFxuICBTaW5nbGVQcm9wVmFsdWVzSW5kZXhPZmZzZXQgPSAxLFxuICBEaXJ0eUZsYWdPZmZzZXQgPSAyLFxuICBTdHlsZVNhbml0aXplck9mZnNldCA9IDMsXG4gIFNpemUgPSA0XG59XG5cbi8qKlxuICogQW4gYXJyYXkgdGhhdCBjb250YWlucyB0aGUgaW5kZXggcG9pbnRlciB2YWx1ZXMgZm9yIGV2ZXJ5IHNpbmdsZSBzdHlsaW5nIHByb3BlcnR5XG4gKiB0aGF0IGV4aXN0cyBpbiB0aGUgY29udGV4dCBhbmQgZm9yIGV2ZXJ5IGRpcmVjdGl2ZS4gSXQgYWxzbyBjb250YWlucyB0aGUgdG90YWxcbiAqIHNpbmdsZSBzdHlsZXMgYW5kIHNpbmdsZSBjbGFzc2VzIHRoYXQgZXhpc3RzIGluIHRoZSBjb250ZXh0IGFzIHRoZSBmaXJzdCB0d28gdmFsdWVzLlxuICpcbiAqIExldCdzIHNheSB3ZSBoYXZlIHRoZSBmb2xsb3dpbmcgdGVtcGxhdGUgY29kZTpcbiAqXG4gKiA8ZGl2IFtzdHlsZS53aWR0aF09XCJteVdpZHRoXCJcbiAqICAgICAgW3N0eWxlLmhlaWdodF09XCJteUhlaWdodFwiXG4gKiAgICAgIFtjbGFzcy5mbGlwcGVkXT1cImZsaXBDbGFzc1wiXG4gKiAgICAgIGRpcmVjdGl2ZS13aXRoLW9wYWNpdHk+XG4gKiAgICAgIGRpcmVjdGl2ZS13aXRoLWZvby1iYXItY2xhc3Nlcz5cbiAqXG4gKiBXZSBoYXZlIHR3byBkaXJlY3RpdmUgYW5kIHRlbXBsYXRlLWJpbmRpbmcgc291cmNlcyxcbiAqIDIgKyAxIHN0eWxlcyBhbmQgMSArIDEgY2xhc3Nlcy4gV2hlbiB0aGUgYmluZGluZ3MgYXJlXG4gKiByZWdpc3RlcmVkIHRoZSBTaW5nbGVQcm9wT2Zmc2V0cyBhcnJheSB3aWxsIGxvb2sgbGlrZSBzbzpcbiAqXG4gKiBzXzAvY18wID0gdGVtcGxhdGUgZGlyZWN0aXZlIHZhbHVlXG4gKiBzXzEvY18xID0gZGlyZWN0aXZlIG9uZSAoZGlyZWN0aXZlLXdpdGgtb3BhY2l0eSlcbiAqIHNfMi9jXzIgPSBkaXJlY3RpdmUgdHdvIChkaXJlY3RpdmUtd2l0aC1mb28tYmFyLWNsYXNzZXMpXG4gKlxuICogWzMsIDIsIDIsIDEsIHNfMDAsIHMwMSwgY18wMSwgMSwgMCwgc18xMCwgMCwgMSwgY18yMFxuICovXG5leHBvcnQgaW50ZXJmYWNlIFNpbmdsZVByb3BPZmZzZXRWYWx1ZXMgZXh0ZW5kcyBBcnJheTxudW1iZXI+IHtcbiAgW1NpbmdsZVByb3BPZmZzZXRWYWx1ZXNJbmRleC5TdHlsZXNDb3VudFBvc2l0aW9uXTogbnVtYmVyO1xuICBbU2luZ2xlUHJvcE9mZnNldFZhbHVlc0luZGV4LkNsYXNzZXNDb3VudFBvc2l0aW9uXTogbnVtYmVyO1xufVxuXG4vKipcbiAqIEFuIGVudW0gdGhhdCBvdXRsaW5lcyB0aGUgb2Zmc2V0L3Bvc2l0aW9uIHZhbHVlcyBmb3IgZWFjaCBzaW5nbGUgcHJvcC9jbGFzcyBlbnRyeVxuICogdGhhdCBhcmUgaG91c2VkIGluc2lkZSBvZiBbU2luZ2xlUHJvcE9mZnNldFZhbHVlc10uXG4gKi9cbmV4cG9ydCBjb25zdCBlbnVtIFNpbmdsZVByb3BPZmZzZXRWYWx1ZXNJbmRleCB7XG4gIFN0eWxlc0NvdW50UG9zaXRpb24gPSAwLFxuICBDbGFzc2VzQ291bnRQb3NpdGlvbiA9IDEsXG4gIFZhbHVlU3RhcnRQb3NpdGlvbiA9IDJcbn1cblxuLyoqXG4gKiBVc2VkIHRvIHNldCB0aGUgY29udGV4dCB0byBiZSBkaXJ0eSBvciBub3QgYm90aCBvbiB0aGUgbWFzdGVyIGZsYWcgKHBvc2l0aW9uIDEpXG4gKiBvciBmb3IgZWFjaCBzaW5nbGUvbXVsdGkgcHJvcGVydHkgdGhhdCBleGlzdHMgaW4gdGhlIGNvbnRleHQuXG4gKi9cbmV4cG9ydCBjb25zdCBlbnVtIFN0eWxpbmdGbGFncyB7XG4gIC8vIEltcGxpZXMgbm8gY29uZmlndXJhdGlvbnNcbiAgTm9uZSA9IDBiMDAwMDAwLFxuICAvLyBXaGV0aGVyIG9yIG5vdCB0aGUgZW50cnkgb3IgY29udGV4dCBpdHNlbGYgaXMgZGlydHlcbiAgRGlydHkgPSAwYjAwMDAwMSxcbiAgLy8gV2hldGhlciBvciBub3QgdGhpcyBpcyBhIGNsYXNzLWJhc2VkIGFzc2lnbm1lbnRcbiAgQ2xhc3MgPSAwYjAwMDAxMCxcbiAgLy8gV2hldGhlciBvciBub3QgYSBzYW5pdGl6ZXIgd2FzIGFwcGxpZWQgdG8gdGhpcyBwcm9wZXJ0eVxuICBTYW5pdGl6ZSA9IDBiMDAwMTAwLFxuICAvLyBXaGV0aGVyIG9yIG5vdCBhbnkgcGxheWVyIGJ1aWxkZXJzIHdpdGhpbiBuZWVkIHRvIHByb2R1Y2UgbmV3IHBsYXllcnNcbiAgUGxheWVyQnVpbGRlcnNEaXJ0eSA9IDBiMDAxMDAwLFxuICAvLyBJZiBOZ0NsYXNzIGlzIHByZXNlbnQgKG9yIHNvbWUgb3RoZXIgY2xhc3MgaGFuZGxlcikgdGhlbiBpdCB3aWxsIGhhbmRsZSB0aGUgbWFwIGV4cHJlc3Npb25zIGFuZFxuICAvLyBpbml0aWFsIGNsYXNzZXNcbiAgT25seVByb2Nlc3NTaW5nbGVDbGFzc2VzID0gMGIwMTAwMDAsXG4gIC8vIFRoZSBtYXggYW1vdW50IG9mIGJpdHMgdXNlZCB0byByZXByZXNlbnQgdGhlc2UgY29uZmlndXJhdGlvbiB2YWx1ZXNcbiAgQmluZGluZ0FsbG9jYXRpb25Mb2NrZWQgPSAwYjEwMDAwMCxcbiAgQml0Q291bnRTaXplID0gNixcbiAgLy8gVGhlcmUgYXJlIG9ubHkgc2l4IGJpdHMgaGVyZVxuICBCaXRNYXNrID0gMGIxMTExMTFcbn1cblxuLyoqIFVzZWQgYXMgbnVtZXJpYyBwb2ludGVyIHZhbHVlcyB0byBkZXRlcm1pbmUgd2hhdCBjZWxscyB0byB1cGRhdGUgaW4gdGhlIGBTdHlsaW5nQ29udGV4dGAgKi9cbmV4cG9ydCBjb25zdCBlbnVtIFN0eWxpbmdJbmRleCB7XG4gIC8vIEluZGV4IG9mIGxvY2F0aW9uIHdoZXJlIHRoZSBzdGFydCBvZiBzaW5nbGUgcHJvcGVydGllcyBhcmUgc3RvcmVkLiAoYHVwZGF0ZVN0eWxlUHJvcGApXG4gIE1hc3RlckZsYWdQb3NpdGlvbiA9IDAsXG4gIC8vIFBvc2l0aW9uIG9mIHdoZXJlIHRoZSByZWdpc3RlcmVkIGRpcmVjdGl2ZXMgZXhpc3QgZm9yIHRoaXMgc3R5bGluZyBjb250ZXh0XG4gIERpcmVjdGl2ZVJlZ2lzdHJ5UG9zaXRpb24gPSAxLFxuICAvLyBQb3NpdGlvbiBvZiB3aGVyZSB0aGUgaW5pdGlhbCBzdHlsZXMgYXJlIHN0b3JlZCBpbiB0aGUgc3R5bGluZyBjb250ZXh0XG4gIEluaXRpYWxTdHlsZVZhbHVlc1Bvc2l0aW9uID0gMixcbiAgSW5pdGlhbENsYXNzVmFsdWVzUG9zaXRpb24gPSAzLFxuICAvLyBJbmRleCBvZiBsb2NhdGlvbiB3aGVyZSB0aGUgY2xhc3MgaW5kZXggb2Zmc2V0IHZhbHVlIGlzIGxvY2F0ZWRcbiAgU2luZ2xlUHJvcE9mZnNldFBvc2l0aW9ucyA9IDQsXG4gIC8vIFBvc2l0aW9uIG9mIHdoZXJlIHRoZSBpbml0aWFsIHN0eWxlcyBhcmUgc3RvcmVkIGluIHRoZSBzdHlsaW5nIGNvbnRleHRcbiAgLy8gVGhpcyBpbmRleCBtdXN0IGFsaWduIHdpdGggSE9TVCwgc2VlIGludGVyZmFjZXMvdmlldy50c1xuICBFbGVtZW50UG9zaXRpb24gPSA1LFxuICAvLyBQb3NpdGlvbiBvZiB3aGVyZSB0aGUgbGFzdCBzdHJpbmctYmFzZWQgQ1NTIGNsYXNzIHZhbHVlIHdhcyBzdG9yZWQgKG9yIGEgY2FjaGVkIHZlcnNpb24gb2YgdGhlXG4gIC8vIGluaXRpYWwgc3R5bGVzIHdoZW4gYSBbY2xhc3NdIGRpcmVjdGl2ZSBpcyBwcmVzZW50KVxuICBDYWNoZWRDbGFzc1ZhbHVlT3JJbml0aWFsQ2xhc3NTdHJpbmcgPSA2LFxuICAvLyBQb3NpdGlvbiBvZiB3aGVyZSB0aGUgbGFzdCBzdHJpbmctYmFzZWQgQ1NTIGNsYXNzIHZhbHVlIHdhcyBzdG9yZWRcbiAgQ2FjaGVkU3R5bGVWYWx1ZSA9IDcsXG4gIC8vIE11bHRpIGFuZCBzaW5nbGUgZW50cmllcyBhcmUgc3RvcmVkIGluIGBTdHlsaW5nQ29udGV4dGAgYXM6IEZsYWc7IFByb3BlcnR5TmFtZTsgIFByb3BlcnR5VmFsdWVcbiAgLy8gUG9zaXRpb24gb2Ygd2hlcmUgdGhlIGluaXRpYWwgc3R5bGVzIGFyZSBzdG9yZWQgaW4gdGhlIHN0eWxpbmcgY29udGV4dFxuICBQbGF5ZXJDb250ZXh0ID0gOCxcbiAgLy8gTG9jYXRpb24gb2Ygc2luZ2xlIChwcm9wKSB2YWx1ZSBlbnRyaWVzIGFyZSBzdG9yZWQgd2l0aGluIHRoZSBjb250ZXh0XG4gIFNpbmdsZVN0eWxlc1N0YXJ0UG9zaXRpb24gPSA5LFxuICBGbGFnc09mZnNldCA9IDAsXG4gIFByb3BlcnR5T2Zmc2V0ID0gMSxcbiAgVmFsdWVPZmZzZXQgPSAyLFxuICBQbGF5ZXJCdWlsZGVySW5kZXhPZmZzZXQgPSAzLFxuICAvLyBTaXplIG9mIGVhY2ggbXVsdGkgb3Igc2luZ2xlIGVudHJ5IChmbGFnICsgcHJvcCArIHZhbHVlICsgcGxheWVyQnVpbGRlckluZGV4KVxuICBTaXplID0gNCxcbiAgLy8gRWFjaCBmbGFnIGhhcyBhIGJpbmFyeSBkaWdpdCBsZW5ndGggb2YgdGhpcyB2YWx1ZVxuICBCaXRDb3VudFNpemUgPSAxNCwgIC8vICgzMiAtIDQpIC8gMiA9IH4xNFxuICAvLyBUaGUgYmluYXJ5IGRpZ2l0IHZhbHVlIGFzIGEgbWFza1xuICBCaXRNYXNrID0gMGIxMTExMTExMTExMTExMSwgIC8vIDE0IGJpdHNcbn1cblxuLyoqXG4gKiBBbiBlbnVtIHRoYXQgb3V0bGluZXMgdGhlIGJpdCBmbGFnIGRhdGEgZm9yIGRpcmVjdGl2ZSBvd25lciBhbmQgcGxheWVyIGluZGV4XG4gKiB2YWx1ZXMgdGhhdCBleGlzdCB3aXRoaW4gZW4gZW50cnkgdGhhdCBsaXZlcyBpbiB0aGUgU3R5bGluZ0NvbnRleHQuXG4gKlxuICogVGhlIHZhbHVlcyBoZXJlIHNwbGl0IGEgbnVtYmVyIHZhbHVlIGludG8gdHdvIHNldHMgb2YgYml0czpcbiAqICAtIFRoZSBmaXJzdCAxNiBiaXRzIGFyZSB1c2VkIHRvIHN0b3JlIHRoZSBkaXJlY3RpdmVJbmRleCB0aGF0IG93bnMgdGhpcyBzdHlsZSB2YWx1ZVxuICogIC0gVGhlIG90aGVyIDE2IGJpdHMgYXJlIHVzZWQgdG8gc3RvcmUgdGhlIHBsYXllckJ1aWxkZXJJbmRleCB0aGF0IGlzIGF0dGFjaGVkIHRvIHRoaXMgc3R5bGVcbiAqL1xuZXhwb3J0IGNvbnN0IGVudW0gRGlyZWN0aXZlT3duZXJBbmRQbGF5ZXJCdWlsZGVySW5kZXgge1xuICBCaXRDb3VudFNpemUgPSAxNixcbiAgQml0TWFzayA9IDBiMTExMTExMTExMTExMTExMVxufVxuIl19