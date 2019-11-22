/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { bindingUpdated, bindingUpdated2, bindingUpdated3, bindingUpdated4, getBinding, updateBinding } from './bindings';
import { getBindingRoot, getLView, isCreationMode } from './state';
/**
 * Bindings for pure functions are stored after regular bindings.
 *
 * |------consts------|---------vars---------|                 |----- hostVars (dir1) ------|
 * ------------------------------------------------------------------------------------------
 * | nodes/refs/pipes | bindings | fn slots  | injector | dir1 | host bindings | host slots |
 * ------------------------------------------------------------------------------------------
 *                    ^                      ^
 *      TView.bindingStartIndex      TView.expandoStartIndex
 *
 * Pure function instructions are given an offset from the binding root. Adding the offset to the
 * binding root gives the first index where the bindings are stored. In component views, the binding
 * root is the bindingStartIndex. In host bindings, the binding root is the expandoStartIndex +
 * any directive instances + any hostVars in directives evaluated before it.
 *
 * See VIEW_DATA.md for more information about host binding resolution.
 */
/**
 * If the value hasn't been saved, calls the pure function to store and return the
 * value. If it has been saved, returns the saved value.
 *
 * @template T
 * @param {?} slotOffset the offset from binding root to the reserved slot
 * @param {?} pureFn Function that returns a value
 * @param {?=} thisArg Optional calling context of pureFn
 * @return {?} value
 */
export function pureFunction0(slotOffset, pureFn, thisArg) {
    // TODO(kara): use bindingRoot instead of bindingStartIndex when implementing host bindings
    /** @type {?} */
    const bindingIndex = getBindingRoot() + slotOffset;
    /** @type {?} */
    const lView = getLView();
    return isCreationMode() ?
        updateBinding(lView, bindingIndex, thisArg ? pureFn.call(thisArg) : pureFn()) :
        getBinding(lView, bindingIndex);
}
/**
 * If the value of the provided exp has changed, calls the pure function to return
 * an updated value. Or if the value has not changed, returns cached value.
 *
 * @param {?} slotOffset the offset from binding root to the reserved slot
 * @param {?} pureFn Function that returns an updated value
 * @param {?} exp Updated expression value
 * @param {?=} thisArg Optional calling context of pureFn
 * @return {?} Updated or cached value
 */
export function pureFunction1(slotOffset, pureFn, exp, thisArg) {
    // TODO(kara): use bindingRoot instead of bindingStartIndex when implementing host bindings
    /** @type {?} */
    const lView = getLView();
    /** @type {?} */
    const bindingIndex = getBindingRoot() + slotOffset;
    return bindingUpdated(lView, bindingIndex, exp) ?
        updateBinding(lView, bindingIndex + 1, thisArg ? pureFn.call(thisArg, exp) : pureFn(exp)) :
        getBinding(lView, bindingIndex + 1);
}
/**
 * If the value of any provided exp has changed, calls the pure function to return
 * an updated value. Or if no values have changed, returns cached value.
 *
 * @param {?} slotOffset the offset from binding root to the reserved slot
 * @param {?} pureFn
 * @param {?} exp1
 * @param {?} exp2
 * @param {?=} thisArg Optional calling context of pureFn
 * @return {?} Updated or cached value
 */
export function pureFunction2(slotOffset, pureFn, exp1, exp2, thisArg) {
    // TODO(kara): use bindingRoot instead of bindingStartIndex when implementing host bindings
    /** @type {?} */
    const bindingIndex = getBindingRoot() + slotOffset;
    /** @type {?} */
    const lView = getLView();
    return bindingUpdated2(lView, bindingIndex, exp1, exp2) ?
        updateBinding(lView, bindingIndex + 2, thisArg ? pureFn.call(thisArg, exp1, exp2) : pureFn(exp1, exp2)) :
        getBinding(lView, bindingIndex + 2);
}
/**
 * If the value of any provided exp has changed, calls the pure function to return
 * an updated value. Or if no values have changed, returns cached value.
 *
 * @param {?} slotOffset the offset from binding root to the reserved slot
 * @param {?} pureFn
 * @param {?} exp1
 * @param {?} exp2
 * @param {?} exp3
 * @param {?=} thisArg Optional calling context of pureFn
 * @return {?} Updated or cached value
 */
export function pureFunction3(slotOffset, pureFn, exp1, exp2, exp3, thisArg) {
    // TODO(kara): use bindingRoot instead of bindingStartIndex when implementing host bindings
    /** @type {?} */
    const bindingIndex = getBindingRoot() + slotOffset;
    /** @type {?} */
    const lView = getLView();
    return bindingUpdated3(lView, bindingIndex, exp1, exp2, exp3) ?
        updateBinding(lView, bindingIndex + 3, thisArg ? pureFn.call(thisArg, exp1, exp2, exp3) : pureFn(exp1, exp2, exp3)) :
        getBinding(lView, bindingIndex + 3);
}
/**
 * If the value of any provided exp has changed, calls the pure function to return
 * an updated value. Or if no values have changed, returns cached value.
 *
 * @param {?} slotOffset the offset from binding root to the reserved slot
 * @param {?} pureFn
 * @param {?} exp1
 * @param {?} exp2
 * @param {?} exp3
 * @param {?} exp4
 * @param {?=} thisArg Optional calling context of pureFn
 * @return {?} Updated or cached value
 */
export function pureFunction4(slotOffset, pureFn, exp1, exp2, exp3, exp4, thisArg) {
    // TODO(kara): use bindingRoot instead of bindingStartIndex when implementing host bindings
    /** @type {?} */
    const bindingIndex = getBindingRoot() + slotOffset;
    /** @type {?} */
    const lView = getLView();
    return bindingUpdated4(lView, bindingIndex, exp1, exp2, exp3, exp4) ?
        updateBinding(lView, bindingIndex + 4, thisArg ? pureFn.call(thisArg, exp1, exp2, exp3, exp4) : pureFn(exp1, exp2, exp3, exp4)) :
        getBinding(lView, bindingIndex + 4);
}
/**
 * If the value of any provided exp has changed, calls the pure function to return
 * an updated value. Or if no values have changed, returns cached value.
 *
 * @param {?} slotOffset the offset from binding root to the reserved slot
 * @param {?} pureFn
 * @param {?} exp1
 * @param {?} exp2
 * @param {?} exp3
 * @param {?} exp4
 * @param {?} exp5
 * @param {?=} thisArg Optional calling context of pureFn
 * @return {?} Updated or cached value
 */
export function pureFunction5(slotOffset, pureFn, exp1, exp2, exp3, exp4, exp5, thisArg) {
    // TODO(kara): use bindingRoot instead of bindingStartIndex when implementing host bindings
    /** @type {?} */
    const bindingIndex = getBindingRoot() + slotOffset;
    /** @type {?} */
    const lView = getLView();
    /** @type {?} */
    const different = bindingUpdated4(lView, bindingIndex, exp1, exp2, exp3, exp4);
    return bindingUpdated(lView, bindingIndex + 4, exp5) || different ?
        updateBinding(lView, bindingIndex + 5, thisArg ? pureFn.call(thisArg, exp1, exp2, exp3, exp4, exp5) :
            pureFn(exp1, exp2, exp3, exp4, exp5)) :
        getBinding(lView, bindingIndex + 5);
}
/**
 * If the value of any provided exp has changed, calls the pure function to return
 * an updated value. Or if no values have changed, returns cached value.
 *
 * @param {?} slotOffset the offset from binding root to the reserved slot
 * @param {?} pureFn
 * @param {?} exp1
 * @param {?} exp2
 * @param {?} exp3
 * @param {?} exp4
 * @param {?} exp5
 * @param {?} exp6
 * @param {?=} thisArg Optional calling context of pureFn
 * @return {?} Updated or cached value
 */
export function pureFunction6(slotOffset, pureFn, exp1, exp2, exp3, exp4, exp5, exp6, thisArg) {
    // TODO(kara): use bindingRoot instead of bindingStartIndex when implementing host bindings
    /** @type {?} */
    const bindingIndex = getBindingRoot() + slotOffset;
    /** @type {?} */
    const lView = getLView();
    /** @type {?} */
    const different = bindingUpdated4(lView, bindingIndex, exp1, exp2, exp3, exp4);
    return bindingUpdated2(lView, bindingIndex + 4, exp5, exp6) || different ?
        updateBinding(lView, bindingIndex + 6, thisArg ?
            pureFn.call(thisArg, exp1, exp2, exp3, exp4, exp5, exp6) :
            pureFn(exp1, exp2, exp3, exp4, exp5, exp6)) :
        getBinding(lView, bindingIndex + 6);
}
/**
 * If the value of any provided exp has changed, calls the pure function to return
 * an updated value. Or if no values have changed, returns cached value.
 *
 * @param {?} slotOffset the offset from binding root to the reserved slot
 * @param {?} pureFn
 * @param {?} exp1
 * @param {?} exp2
 * @param {?} exp3
 * @param {?} exp4
 * @param {?} exp5
 * @param {?} exp6
 * @param {?} exp7
 * @param {?=} thisArg Optional calling context of pureFn
 * @return {?} Updated or cached value
 */
export function pureFunction7(slotOffset, pureFn, exp1, exp2, exp3, exp4, exp5, exp6, exp7, thisArg) {
    // TODO(kara): use bindingRoot instead of bindingStartIndex when implementing host bindings
    /** @type {?} */
    const bindingIndex = getBindingRoot() + slotOffset;
    /** @type {?} */
    const lView = getLView();
    /** @type {?} */
    let different = bindingUpdated4(lView, bindingIndex, exp1, exp2, exp3, exp4);
    return bindingUpdated3(lView, bindingIndex + 4, exp5, exp6, exp7) || different ?
        updateBinding(lView, bindingIndex + 7, thisArg ?
            pureFn.call(thisArg, exp1, exp2, exp3, exp4, exp5, exp6, exp7) :
            pureFn(exp1, exp2, exp3, exp4, exp5, exp6, exp7)) :
        getBinding(lView, bindingIndex + 7);
}
/**
 * If the value of any provided exp has changed, calls the pure function to return
 * an updated value. Or if no values have changed, returns cached value.
 *
 * @param {?} slotOffset the offset from binding root to the reserved slot
 * @param {?} pureFn
 * @param {?} exp1
 * @param {?} exp2
 * @param {?} exp3
 * @param {?} exp4
 * @param {?} exp5
 * @param {?} exp6
 * @param {?} exp7
 * @param {?} exp8
 * @param {?=} thisArg Optional calling context of pureFn
 * @return {?} Updated or cached value
 */
export function pureFunction8(slotOffset, pureFn, exp1, exp2, exp3, exp4, exp5, exp6, exp7, exp8, thisArg) {
    // TODO(kara): use bindingRoot instead of bindingStartIndex when implementing host bindings
    /** @type {?} */
    const bindingIndex = getBindingRoot() + slotOffset;
    /** @type {?} */
    const lView = getLView();
    /** @type {?} */
    const different = bindingUpdated4(lView, bindingIndex, exp1, exp2, exp3, exp4);
    return bindingUpdated4(lView, bindingIndex + 4, exp5, exp6, exp7, exp8) || different ?
        updateBinding(lView, bindingIndex + 8, thisArg ?
            pureFn.call(thisArg, exp1, exp2, exp3, exp4, exp5, exp6, exp7, exp8) :
            pureFn(exp1, exp2, exp3, exp4, exp5, exp6, exp7, exp8)) :
        getBinding(lView, bindingIndex + 8);
}
/**
 * pureFunction instruction that can support any number of bindings.
 *
 * If the value of any provided exp has changed, calls the pure function to return
 * an updated value. Or if no values have changed, returns cached value.
 *
 * @param {?} slotOffset the offset from binding root to the reserved slot
 * @param {?} pureFn A pure function that takes binding values and builds an object or array
 * containing those values.
 * @param {?} exps An array of binding values
 * @param {?=} thisArg Optional calling context of pureFn
 * @return {?} Updated or cached value
 */
export function pureFunctionV(slotOffset, pureFn, exps, thisArg) {
    // TODO(kara): use bindingRoot instead of bindingStartIndex when implementing host bindings
    /** @type {?} */
    let bindingIndex = getBindingRoot() + slotOffset;
    /** @type {?} */
    let different = false;
    /** @type {?} */
    const lView = getLView();
    for (let i = 0; i < exps.length; i++) {
        bindingUpdated(lView, bindingIndex++, exps[i]) && (different = true);
    }
    return different ? updateBinding(lView, bindingIndex, pureFn.apply(thisArg, exps)) :
        getBinding(lView, bindingIndex);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVyZV9mdW5jdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL3JlbmRlcjMvcHVyZV9mdW5jdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBQyxjQUFjLEVBQUUsZUFBZSxFQUFFLGVBQWUsRUFBRSxlQUFlLEVBQUUsVUFBVSxFQUFFLGFBQWEsRUFBQyxNQUFNLFlBQVksQ0FBQztBQUN4SCxPQUFPLEVBQUMsY0FBYyxFQUFFLFFBQVEsRUFBRSxjQUFjLEVBQUMsTUFBTSxTQUFTLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUErQmpFLE1BQU0sVUFBVSxhQUFhLENBQUksVUFBa0IsRUFBRSxNQUFlLEVBQUUsT0FBYTs7O1VBRTNFLFlBQVksR0FBRyxjQUFjLEVBQUUsR0FBRyxVQUFVOztVQUM1QyxLQUFLLEdBQUcsUUFBUSxFQUFFO0lBQ3hCLE9BQU8sY0FBYyxFQUFFLENBQUMsQ0FBQztRQUNyQixhQUFhLENBQUMsS0FBSyxFQUFFLFlBQVksRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMvRSxVQUFVLENBQUMsS0FBSyxFQUFFLFlBQVksQ0FBQyxDQUFDO0FBQ3RDLENBQUM7Ozs7Ozs7Ozs7O0FBWUQsTUFBTSxVQUFVLGFBQWEsQ0FDekIsVUFBa0IsRUFBRSxNQUF1QixFQUFFLEdBQVEsRUFBRSxPQUFhOzs7VUFFaEUsS0FBSyxHQUFHLFFBQVEsRUFBRTs7VUFDbEIsWUFBWSxHQUFHLGNBQWMsRUFBRSxHQUFHLFVBQVU7SUFDbEQsT0FBTyxjQUFjLENBQUMsS0FBSyxFQUFFLFlBQVksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzdDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsWUFBWSxHQUFHLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzNGLFVBQVUsQ0FBQyxLQUFLLEVBQUUsWUFBWSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQzFDLENBQUM7Ozs7Ozs7Ozs7OztBQWFELE1BQU0sVUFBVSxhQUFhLENBQ3pCLFVBQWtCLEVBQUUsTUFBaUMsRUFBRSxJQUFTLEVBQUUsSUFBUyxFQUMzRSxPQUFhOzs7VUFFVCxZQUFZLEdBQUcsY0FBYyxFQUFFLEdBQUcsVUFBVTs7VUFDNUMsS0FBSyxHQUFHLFFBQVEsRUFBRTtJQUN4QixPQUFPLGVBQWUsQ0FBQyxLQUFLLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3JELGFBQWEsQ0FDVCxLQUFLLEVBQUUsWUFBWSxHQUFHLENBQUMsRUFDdkIsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3RFLFVBQVUsQ0FBQyxLQUFLLEVBQUUsWUFBWSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQzFDLENBQUM7Ozs7Ozs7Ozs7Ozs7QUFjRCxNQUFNLFVBQVUsYUFBYSxDQUN6QixVQUFrQixFQUFFLE1BQTBDLEVBQUUsSUFBUyxFQUFFLElBQVMsRUFBRSxJQUFTLEVBQy9GLE9BQWE7OztVQUVULFlBQVksR0FBRyxjQUFjLEVBQUUsR0FBRyxVQUFVOztVQUM1QyxLQUFLLEdBQUcsUUFBUSxFQUFFO0lBQ3hCLE9BQU8sZUFBZSxDQUFDLEtBQUssRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQzNELGFBQWEsQ0FDVCxLQUFLLEVBQUUsWUFBWSxHQUFHLENBQUMsRUFDdkIsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbEYsVUFBVSxDQUFDLEtBQUssRUFBRSxZQUFZLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDMUMsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7QUFlRCxNQUFNLFVBQVUsYUFBYSxDQUN6QixVQUFrQixFQUFFLE1BQW1ELEVBQUUsSUFBUyxFQUFFLElBQVMsRUFDN0YsSUFBUyxFQUFFLElBQVMsRUFBRSxPQUFhOzs7VUFFL0IsWUFBWSxHQUFHLGNBQWMsRUFBRSxHQUFHLFVBQVU7O1VBQzVDLEtBQUssR0FBRyxRQUFRLEVBQUU7SUFDeEIsT0FBTyxlQUFlLENBQUMsS0FBSyxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ2pFLGFBQWEsQ0FDVCxLQUFLLEVBQUUsWUFBWSxHQUFHLENBQUMsRUFDdkIsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM5RixVQUFVLENBQUMsS0FBSyxFQUFFLFlBQVksR0FBRyxDQUFDLENBQUMsQ0FBQztBQUMxQyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7QUFnQkQsTUFBTSxVQUFVLGFBQWEsQ0FDekIsVUFBa0IsRUFBRSxNQUE0RCxFQUFFLElBQVMsRUFDM0YsSUFBUyxFQUFFLElBQVMsRUFBRSxJQUFTLEVBQUUsSUFBUyxFQUFFLE9BQWE7OztVQUVyRCxZQUFZLEdBQUcsY0FBYyxFQUFFLEdBQUcsVUFBVTs7VUFDNUMsS0FBSyxHQUFHLFFBQVEsRUFBRTs7VUFDbEIsU0FBUyxHQUFHLGVBQWUsQ0FBQyxLQUFLLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQztJQUM5RSxPQUFPLGNBQWMsQ0FBQyxLQUFLLEVBQUUsWUFBWSxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsSUFBSSxTQUFTLENBQUMsQ0FBQztRQUMvRCxhQUFhLENBQ1QsS0FBSyxFQUFFLFlBQVksR0FBRyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNwRCxNQUFNLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM5RSxVQUFVLENBQUMsS0FBSyxFQUFFLFlBQVksR0FBRyxDQUFDLENBQUMsQ0FBQztBQUMxQyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7O0FBaUJELE1BQU0sVUFBVSxhQUFhLENBQ3pCLFVBQWtCLEVBQUUsTUFBcUUsRUFDekYsSUFBUyxFQUFFLElBQVMsRUFBRSxJQUFTLEVBQUUsSUFBUyxFQUFFLElBQVMsRUFBRSxJQUFTLEVBQUUsT0FBYTs7O1VBRTNFLFlBQVksR0FBRyxjQUFjLEVBQUUsR0FBRyxVQUFVOztVQUM1QyxLQUFLLEdBQUcsUUFBUSxFQUFFOztVQUNsQixTQUFTLEdBQUcsZUFBZSxDQUFDLEtBQUssRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDO0lBQzlFLE9BQU8sZUFBZSxDQUFDLEtBQUssRUFBRSxZQUFZLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxTQUFTLENBQUMsQ0FBQztRQUN0RSxhQUFhLENBQ1QsS0FBSyxFQUFFLFlBQVksR0FBRyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDOUIsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQzFELE1BQU0sQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyRCxVQUFVLENBQUMsS0FBSyxFQUFFLFlBQVksR0FBRyxDQUFDLENBQUMsQ0FBQztBQUMxQyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7OztBQWtCRCxNQUFNLFVBQVUsYUFBYSxDQUN6QixVQUFrQixFQUNsQixNQUE4RSxFQUFFLElBQVMsRUFDekYsSUFBUyxFQUFFLElBQVMsRUFBRSxJQUFTLEVBQUUsSUFBUyxFQUFFLElBQVMsRUFBRSxJQUFTLEVBQUUsT0FBYTs7O1VBRTNFLFlBQVksR0FBRyxjQUFjLEVBQUUsR0FBRyxVQUFVOztVQUM1QyxLQUFLLEdBQUcsUUFBUSxFQUFFOztRQUNwQixTQUFTLEdBQUcsZUFBZSxDQUFDLEtBQUssRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDO0lBQzVFLE9BQU8sZUFBZSxDQUFDLEtBQUssRUFBRSxZQUFZLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksU0FBUyxDQUFDLENBQUM7UUFDNUUsYUFBYSxDQUNULEtBQUssRUFBRSxZQUFZLEdBQUcsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQzlCLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDaEUsTUFBTSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMzRCxVQUFVLENBQUMsS0FBSyxFQUFFLFlBQVksR0FBRyxDQUFDLENBQUMsQ0FBQztBQUMxQyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFtQkQsTUFBTSxVQUFVLGFBQWEsQ0FDekIsVUFBa0IsRUFDbEIsTUFBdUYsRUFDdkYsSUFBUyxFQUFFLElBQVMsRUFBRSxJQUFTLEVBQUUsSUFBUyxFQUFFLElBQVMsRUFBRSxJQUFTLEVBQUUsSUFBUyxFQUFFLElBQVMsRUFDdEYsT0FBYTs7O1VBRVQsWUFBWSxHQUFHLGNBQWMsRUFBRSxHQUFHLFVBQVU7O1VBQzVDLEtBQUssR0FBRyxRQUFRLEVBQUU7O1VBQ2xCLFNBQVMsR0FBRyxlQUFlLENBQUMsS0FBSyxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUM7SUFDOUUsT0FBTyxlQUFlLENBQUMsS0FBSyxFQUFFLFlBQVksR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksU0FBUyxDQUFDLENBQUM7UUFDbEYsYUFBYSxDQUNULEtBQUssRUFBRSxZQUFZLEdBQUcsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQzlCLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3RFLE1BQU0sQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2pFLFVBQVUsQ0FBQyxLQUFLLEVBQUUsWUFBWSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQzFDLENBQUM7Ozs7Ozs7Ozs7Ozs7O0FBZUQsTUFBTSxVQUFVLGFBQWEsQ0FDekIsVUFBa0IsRUFBRSxNQUE0QixFQUFFLElBQVcsRUFBRSxPQUFhOzs7UUFFMUUsWUFBWSxHQUFHLGNBQWMsRUFBRSxHQUFHLFVBQVU7O1FBQzVDLFNBQVMsR0FBRyxLQUFLOztVQUNmLEtBQUssR0FBRyxRQUFRLEVBQUU7SUFDeEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDcEMsY0FBYyxDQUFDLEtBQUssRUFBRSxZQUFZLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsQ0FBQztLQUN0RTtJQUNELE9BQU8sU0FBUyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLFlBQVksRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDakUsVUFBVSxDQUFDLEtBQUssRUFBRSxZQUFZLENBQUMsQ0FBQztBQUNyRCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2JpbmRpbmdVcGRhdGVkLCBiaW5kaW5nVXBkYXRlZDIsIGJpbmRpbmdVcGRhdGVkMywgYmluZGluZ1VwZGF0ZWQ0LCBnZXRCaW5kaW5nLCB1cGRhdGVCaW5kaW5nfSBmcm9tICcuL2JpbmRpbmdzJztcbmltcG9ydCB7Z2V0QmluZGluZ1Jvb3QsIGdldExWaWV3LCBpc0NyZWF0aW9uTW9kZX0gZnJvbSAnLi9zdGF0ZSc7XG5cblxuXG4vKipcbiAqIEJpbmRpbmdzIGZvciBwdXJlIGZ1bmN0aW9ucyBhcmUgc3RvcmVkIGFmdGVyIHJlZ3VsYXIgYmluZGluZ3MuXG4gKlxuICogfC0tLS0tLWNvbnN0cy0tLS0tLXwtLS0tLS0tLS12YXJzLS0tLS0tLS0tfCAgICAgICAgICAgICAgICAgfC0tLS0tIGhvc3RWYXJzIChkaXIxKSAtLS0tLS18XG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAqIHwgbm9kZXMvcmVmcy9waXBlcyB8IGJpbmRpbmdzIHwgZm4gc2xvdHMgIHwgaW5qZWN0b3IgfCBkaXIxIHwgaG9zdCBiaW5kaW5ncyB8IGhvc3Qgc2xvdHMgfFxuICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gKiAgICAgICAgICAgICAgICAgICAgXiAgICAgICAgICAgICAgICAgICAgICBeXG4gKiAgICAgIFRWaWV3LmJpbmRpbmdTdGFydEluZGV4ICAgICAgVFZpZXcuZXhwYW5kb1N0YXJ0SW5kZXhcbiAqXG4gKiBQdXJlIGZ1bmN0aW9uIGluc3RydWN0aW9ucyBhcmUgZ2l2ZW4gYW4gb2Zmc2V0IGZyb20gdGhlIGJpbmRpbmcgcm9vdC4gQWRkaW5nIHRoZSBvZmZzZXQgdG8gdGhlXG4gKiBiaW5kaW5nIHJvb3QgZ2l2ZXMgdGhlIGZpcnN0IGluZGV4IHdoZXJlIHRoZSBiaW5kaW5ncyBhcmUgc3RvcmVkLiBJbiBjb21wb25lbnQgdmlld3MsIHRoZSBiaW5kaW5nXG4gKiByb290IGlzIHRoZSBiaW5kaW5nU3RhcnRJbmRleC4gSW4gaG9zdCBiaW5kaW5ncywgdGhlIGJpbmRpbmcgcm9vdCBpcyB0aGUgZXhwYW5kb1N0YXJ0SW5kZXggK1xuICogYW55IGRpcmVjdGl2ZSBpbnN0YW5jZXMgKyBhbnkgaG9zdFZhcnMgaW4gZGlyZWN0aXZlcyBldmFsdWF0ZWQgYmVmb3JlIGl0LlxuICpcbiAqIFNlZSBWSUVXX0RBVEEubWQgZm9yIG1vcmUgaW5mb3JtYXRpb24gYWJvdXQgaG9zdCBiaW5kaW5nIHJlc29sdXRpb24uXG4gKi9cblxuLyoqXG4gKiBJZiB0aGUgdmFsdWUgaGFzbid0IGJlZW4gc2F2ZWQsIGNhbGxzIHRoZSBwdXJlIGZ1bmN0aW9uIHRvIHN0b3JlIGFuZCByZXR1cm4gdGhlXG4gKiB2YWx1ZS4gSWYgaXQgaGFzIGJlZW4gc2F2ZWQsIHJldHVybnMgdGhlIHNhdmVkIHZhbHVlLlxuICpcbiAqIEBwYXJhbSBzbG90T2Zmc2V0IHRoZSBvZmZzZXQgZnJvbSBiaW5kaW5nIHJvb3QgdG8gdGhlIHJlc2VydmVkIHNsb3RcbiAqIEBwYXJhbSBwdXJlRm4gRnVuY3Rpb24gdGhhdCByZXR1cm5zIGEgdmFsdWVcbiAqIEBwYXJhbSB0aGlzQXJnIE9wdGlvbmFsIGNhbGxpbmcgY29udGV4dCBvZiBwdXJlRm5cbiAqIEByZXR1cm5zIHZhbHVlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwdXJlRnVuY3Rpb24wPFQ+KHNsb3RPZmZzZXQ6IG51bWJlciwgcHVyZUZuOiAoKSA9PiBULCB0aGlzQXJnPzogYW55KTogVCB7XG4gIC8vIFRPRE8oa2FyYSk6IHVzZSBiaW5kaW5nUm9vdCBpbnN0ZWFkIG9mIGJpbmRpbmdTdGFydEluZGV4IHdoZW4gaW1wbGVtZW50aW5nIGhvc3QgYmluZGluZ3NcbiAgY29uc3QgYmluZGluZ0luZGV4ID0gZ2V0QmluZGluZ1Jvb3QoKSArIHNsb3RPZmZzZXQ7XG4gIGNvbnN0IGxWaWV3ID0gZ2V0TFZpZXcoKTtcbiAgcmV0dXJuIGlzQ3JlYXRpb25Nb2RlKCkgP1xuICAgICAgdXBkYXRlQmluZGluZyhsVmlldywgYmluZGluZ0luZGV4LCB0aGlzQXJnID8gcHVyZUZuLmNhbGwodGhpc0FyZykgOiBwdXJlRm4oKSkgOlxuICAgICAgZ2V0QmluZGluZyhsVmlldywgYmluZGluZ0luZGV4KTtcbn1cblxuLyoqXG4gKiBJZiB0aGUgdmFsdWUgb2YgdGhlIHByb3ZpZGVkIGV4cCBoYXMgY2hhbmdlZCwgY2FsbHMgdGhlIHB1cmUgZnVuY3Rpb24gdG8gcmV0dXJuXG4gKiBhbiB1cGRhdGVkIHZhbHVlLiBPciBpZiB0aGUgdmFsdWUgaGFzIG5vdCBjaGFuZ2VkLCByZXR1cm5zIGNhY2hlZCB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0gc2xvdE9mZnNldCB0aGUgb2Zmc2V0IGZyb20gYmluZGluZyByb290IHRvIHRoZSByZXNlcnZlZCBzbG90XG4gKiBAcGFyYW0gcHVyZUZuIEZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhbiB1cGRhdGVkIHZhbHVlXG4gKiBAcGFyYW0gZXhwIFVwZGF0ZWQgZXhwcmVzc2lvbiB2YWx1ZVxuICogQHBhcmFtIHRoaXNBcmcgT3B0aW9uYWwgY2FsbGluZyBjb250ZXh0IG9mIHB1cmVGblxuICogQHJldHVybnMgVXBkYXRlZCBvciBjYWNoZWQgdmFsdWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHB1cmVGdW5jdGlvbjEoXG4gICAgc2xvdE9mZnNldDogbnVtYmVyLCBwdXJlRm46ICh2OiBhbnkpID0+IGFueSwgZXhwOiBhbnksIHRoaXNBcmc/OiBhbnkpOiBhbnkge1xuICAvLyBUT0RPKGthcmEpOiB1c2UgYmluZGluZ1Jvb3QgaW5zdGVhZCBvZiBiaW5kaW5nU3RhcnRJbmRleCB3aGVuIGltcGxlbWVudGluZyBob3N0IGJpbmRpbmdzXG4gIGNvbnN0IGxWaWV3ID0gZ2V0TFZpZXcoKTtcbiAgY29uc3QgYmluZGluZ0luZGV4ID0gZ2V0QmluZGluZ1Jvb3QoKSArIHNsb3RPZmZzZXQ7XG4gIHJldHVybiBiaW5kaW5nVXBkYXRlZChsVmlldywgYmluZGluZ0luZGV4LCBleHApID9cbiAgICAgIHVwZGF0ZUJpbmRpbmcobFZpZXcsIGJpbmRpbmdJbmRleCArIDEsIHRoaXNBcmcgPyBwdXJlRm4uY2FsbCh0aGlzQXJnLCBleHApIDogcHVyZUZuKGV4cCkpIDpcbiAgICAgIGdldEJpbmRpbmcobFZpZXcsIGJpbmRpbmdJbmRleCArIDEpO1xufVxuXG4vKipcbiAqIElmIHRoZSB2YWx1ZSBvZiBhbnkgcHJvdmlkZWQgZXhwIGhhcyBjaGFuZ2VkLCBjYWxscyB0aGUgcHVyZSBmdW5jdGlvbiB0byByZXR1cm5cbiAqIGFuIHVwZGF0ZWQgdmFsdWUuIE9yIGlmIG5vIHZhbHVlcyBoYXZlIGNoYW5nZWQsIHJldHVybnMgY2FjaGVkIHZhbHVlLlxuICpcbiAqIEBwYXJhbSBzbG90T2Zmc2V0IHRoZSBvZmZzZXQgZnJvbSBiaW5kaW5nIHJvb3QgdG8gdGhlIHJlc2VydmVkIHNsb3RcbiAqIEBwYXJhbSBwdXJlRm5cbiAqIEBwYXJhbSBleHAxXG4gKiBAcGFyYW0gZXhwMlxuICogQHBhcmFtIHRoaXNBcmcgT3B0aW9uYWwgY2FsbGluZyBjb250ZXh0IG9mIHB1cmVGblxuICogQHJldHVybnMgVXBkYXRlZCBvciBjYWNoZWQgdmFsdWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHB1cmVGdW5jdGlvbjIoXG4gICAgc2xvdE9mZnNldDogbnVtYmVyLCBwdXJlRm46ICh2MTogYW55LCB2MjogYW55KSA9PiBhbnksIGV4cDE6IGFueSwgZXhwMjogYW55LFxuICAgIHRoaXNBcmc/OiBhbnkpOiBhbnkge1xuICAvLyBUT0RPKGthcmEpOiB1c2UgYmluZGluZ1Jvb3QgaW5zdGVhZCBvZiBiaW5kaW5nU3RhcnRJbmRleCB3aGVuIGltcGxlbWVudGluZyBob3N0IGJpbmRpbmdzXG4gIGNvbnN0IGJpbmRpbmdJbmRleCA9IGdldEJpbmRpbmdSb290KCkgKyBzbG90T2Zmc2V0O1xuICBjb25zdCBsVmlldyA9IGdldExWaWV3KCk7XG4gIHJldHVybiBiaW5kaW5nVXBkYXRlZDIobFZpZXcsIGJpbmRpbmdJbmRleCwgZXhwMSwgZXhwMikgP1xuICAgICAgdXBkYXRlQmluZGluZyhcbiAgICAgICAgICBsVmlldywgYmluZGluZ0luZGV4ICsgMixcbiAgICAgICAgICB0aGlzQXJnID8gcHVyZUZuLmNhbGwodGhpc0FyZywgZXhwMSwgZXhwMikgOiBwdXJlRm4oZXhwMSwgZXhwMikpIDpcbiAgICAgIGdldEJpbmRpbmcobFZpZXcsIGJpbmRpbmdJbmRleCArIDIpO1xufVxuXG4vKipcbiAqIElmIHRoZSB2YWx1ZSBvZiBhbnkgcHJvdmlkZWQgZXhwIGhhcyBjaGFuZ2VkLCBjYWxscyB0aGUgcHVyZSBmdW5jdGlvbiB0byByZXR1cm5cbiAqIGFuIHVwZGF0ZWQgdmFsdWUuIE9yIGlmIG5vIHZhbHVlcyBoYXZlIGNoYW5nZWQsIHJldHVybnMgY2FjaGVkIHZhbHVlLlxuICpcbiAqIEBwYXJhbSBzbG90T2Zmc2V0IHRoZSBvZmZzZXQgZnJvbSBiaW5kaW5nIHJvb3QgdG8gdGhlIHJlc2VydmVkIHNsb3RcbiAqIEBwYXJhbSBwdXJlRm5cbiAqIEBwYXJhbSBleHAxXG4gKiBAcGFyYW0gZXhwMlxuICogQHBhcmFtIGV4cDNcbiAqIEBwYXJhbSB0aGlzQXJnIE9wdGlvbmFsIGNhbGxpbmcgY29udGV4dCBvZiBwdXJlRm5cbiAqIEByZXR1cm5zIFVwZGF0ZWQgb3IgY2FjaGVkIHZhbHVlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwdXJlRnVuY3Rpb24zKFxuICAgIHNsb3RPZmZzZXQ6IG51bWJlciwgcHVyZUZuOiAodjE6IGFueSwgdjI6IGFueSwgdjM6IGFueSkgPT4gYW55LCBleHAxOiBhbnksIGV4cDI6IGFueSwgZXhwMzogYW55LFxuICAgIHRoaXNBcmc/OiBhbnkpOiBhbnkge1xuICAvLyBUT0RPKGthcmEpOiB1c2UgYmluZGluZ1Jvb3QgaW5zdGVhZCBvZiBiaW5kaW5nU3RhcnRJbmRleCB3aGVuIGltcGxlbWVudGluZyBob3N0IGJpbmRpbmdzXG4gIGNvbnN0IGJpbmRpbmdJbmRleCA9IGdldEJpbmRpbmdSb290KCkgKyBzbG90T2Zmc2V0O1xuICBjb25zdCBsVmlldyA9IGdldExWaWV3KCk7XG4gIHJldHVybiBiaW5kaW5nVXBkYXRlZDMobFZpZXcsIGJpbmRpbmdJbmRleCwgZXhwMSwgZXhwMiwgZXhwMykgP1xuICAgICAgdXBkYXRlQmluZGluZyhcbiAgICAgICAgICBsVmlldywgYmluZGluZ0luZGV4ICsgMyxcbiAgICAgICAgICB0aGlzQXJnID8gcHVyZUZuLmNhbGwodGhpc0FyZywgZXhwMSwgZXhwMiwgZXhwMykgOiBwdXJlRm4oZXhwMSwgZXhwMiwgZXhwMykpIDpcbiAgICAgIGdldEJpbmRpbmcobFZpZXcsIGJpbmRpbmdJbmRleCArIDMpO1xufVxuXG4vKipcbiAqIElmIHRoZSB2YWx1ZSBvZiBhbnkgcHJvdmlkZWQgZXhwIGhhcyBjaGFuZ2VkLCBjYWxscyB0aGUgcHVyZSBmdW5jdGlvbiB0byByZXR1cm5cbiAqIGFuIHVwZGF0ZWQgdmFsdWUuIE9yIGlmIG5vIHZhbHVlcyBoYXZlIGNoYW5nZWQsIHJldHVybnMgY2FjaGVkIHZhbHVlLlxuICpcbiAqIEBwYXJhbSBzbG90T2Zmc2V0IHRoZSBvZmZzZXQgZnJvbSBiaW5kaW5nIHJvb3QgdG8gdGhlIHJlc2VydmVkIHNsb3RcbiAqIEBwYXJhbSBwdXJlRm5cbiAqIEBwYXJhbSBleHAxXG4gKiBAcGFyYW0gZXhwMlxuICogQHBhcmFtIGV4cDNcbiAqIEBwYXJhbSBleHA0XG4gKiBAcGFyYW0gdGhpc0FyZyBPcHRpb25hbCBjYWxsaW5nIGNvbnRleHQgb2YgcHVyZUZuXG4gKiBAcmV0dXJucyBVcGRhdGVkIG9yIGNhY2hlZCB2YWx1ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gcHVyZUZ1bmN0aW9uNChcbiAgICBzbG90T2Zmc2V0OiBudW1iZXIsIHB1cmVGbjogKHYxOiBhbnksIHYyOiBhbnksIHYzOiBhbnksIHY0OiBhbnkpID0+IGFueSwgZXhwMTogYW55LCBleHAyOiBhbnksXG4gICAgZXhwMzogYW55LCBleHA0OiBhbnksIHRoaXNBcmc/OiBhbnkpOiBhbnkge1xuICAvLyBUT0RPKGthcmEpOiB1c2UgYmluZGluZ1Jvb3QgaW5zdGVhZCBvZiBiaW5kaW5nU3RhcnRJbmRleCB3aGVuIGltcGxlbWVudGluZyBob3N0IGJpbmRpbmdzXG4gIGNvbnN0IGJpbmRpbmdJbmRleCA9IGdldEJpbmRpbmdSb290KCkgKyBzbG90T2Zmc2V0O1xuICBjb25zdCBsVmlldyA9IGdldExWaWV3KCk7XG4gIHJldHVybiBiaW5kaW5nVXBkYXRlZDQobFZpZXcsIGJpbmRpbmdJbmRleCwgZXhwMSwgZXhwMiwgZXhwMywgZXhwNCkgP1xuICAgICAgdXBkYXRlQmluZGluZyhcbiAgICAgICAgICBsVmlldywgYmluZGluZ0luZGV4ICsgNCxcbiAgICAgICAgICB0aGlzQXJnID8gcHVyZUZuLmNhbGwodGhpc0FyZywgZXhwMSwgZXhwMiwgZXhwMywgZXhwNCkgOiBwdXJlRm4oZXhwMSwgZXhwMiwgZXhwMywgZXhwNCkpIDpcbiAgICAgIGdldEJpbmRpbmcobFZpZXcsIGJpbmRpbmdJbmRleCArIDQpO1xufVxuXG4vKipcbiAqIElmIHRoZSB2YWx1ZSBvZiBhbnkgcHJvdmlkZWQgZXhwIGhhcyBjaGFuZ2VkLCBjYWxscyB0aGUgcHVyZSBmdW5jdGlvbiB0byByZXR1cm5cbiAqIGFuIHVwZGF0ZWQgdmFsdWUuIE9yIGlmIG5vIHZhbHVlcyBoYXZlIGNoYW5nZWQsIHJldHVybnMgY2FjaGVkIHZhbHVlLlxuICpcbiAqIEBwYXJhbSBzbG90T2Zmc2V0IHRoZSBvZmZzZXQgZnJvbSBiaW5kaW5nIHJvb3QgdG8gdGhlIHJlc2VydmVkIHNsb3RcbiAqIEBwYXJhbSBwdXJlRm5cbiAqIEBwYXJhbSBleHAxXG4gKiBAcGFyYW0gZXhwMlxuICogQHBhcmFtIGV4cDNcbiAqIEBwYXJhbSBleHA0XG4gKiBAcGFyYW0gZXhwNVxuICogQHBhcmFtIHRoaXNBcmcgT3B0aW9uYWwgY2FsbGluZyBjb250ZXh0IG9mIHB1cmVGblxuICogQHJldHVybnMgVXBkYXRlZCBvciBjYWNoZWQgdmFsdWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHB1cmVGdW5jdGlvbjUoXG4gICAgc2xvdE9mZnNldDogbnVtYmVyLCBwdXJlRm46ICh2MTogYW55LCB2MjogYW55LCB2MzogYW55LCB2NDogYW55LCB2NTogYW55KSA9PiBhbnksIGV4cDE6IGFueSxcbiAgICBleHAyOiBhbnksIGV4cDM6IGFueSwgZXhwNDogYW55LCBleHA1OiBhbnksIHRoaXNBcmc/OiBhbnkpOiBhbnkge1xuICAvLyBUT0RPKGthcmEpOiB1c2UgYmluZGluZ1Jvb3QgaW5zdGVhZCBvZiBiaW5kaW5nU3RhcnRJbmRleCB3aGVuIGltcGxlbWVudGluZyBob3N0IGJpbmRpbmdzXG4gIGNvbnN0IGJpbmRpbmdJbmRleCA9IGdldEJpbmRpbmdSb290KCkgKyBzbG90T2Zmc2V0O1xuICBjb25zdCBsVmlldyA9IGdldExWaWV3KCk7XG4gIGNvbnN0IGRpZmZlcmVudCA9IGJpbmRpbmdVcGRhdGVkNChsVmlldywgYmluZGluZ0luZGV4LCBleHAxLCBleHAyLCBleHAzLCBleHA0KTtcbiAgcmV0dXJuIGJpbmRpbmdVcGRhdGVkKGxWaWV3LCBiaW5kaW5nSW5kZXggKyA0LCBleHA1KSB8fCBkaWZmZXJlbnQgP1xuICAgICAgdXBkYXRlQmluZGluZyhcbiAgICAgICAgICBsVmlldywgYmluZGluZ0luZGV4ICsgNSwgdGhpc0FyZyA/IHB1cmVGbi5jYWxsKHRoaXNBcmcsIGV4cDEsIGV4cDIsIGV4cDMsIGV4cDQsIGV4cDUpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHB1cmVGbihleHAxLCBleHAyLCBleHAzLCBleHA0LCBleHA1KSkgOlxuICAgICAgZ2V0QmluZGluZyhsVmlldywgYmluZGluZ0luZGV4ICsgNSk7XG59XG5cbi8qKlxuICogSWYgdGhlIHZhbHVlIG9mIGFueSBwcm92aWRlZCBleHAgaGFzIGNoYW5nZWQsIGNhbGxzIHRoZSBwdXJlIGZ1bmN0aW9uIHRvIHJldHVyblxuICogYW4gdXBkYXRlZCB2YWx1ZS4gT3IgaWYgbm8gdmFsdWVzIGhhdmUgY2hhbmdlZCwgcmV0dXJucyBjYWNoZWQgdmFsdWUuXG4gKlxuICogQHBhcmFtIHNsb3RPZmZzZXQgdGhlIG9mZnNldCBmcm9tIGJpbmRpbmcgcm9vdCB0byB0aGUgcmVzZXJ2ZWQgc2xvdFxuICogQHBhcmFtIHB1cmVGblxuICogQHBhcmFtIGV4cDFcbiAqIEBwYXJhbSBleHAyXG4gKiBAcGFyYW0gZXhwM1xuICogQHBhcmFtIGV4cDRcbiAqIEBwYXJhbSBleHA1XG4gKiBAcGFyYW0gZXhwNlxuICogQHBhcmFtIHRoaXNBcmcgT3B0aW9uYWwgY2FsbGluZyBjb250ZXh0IG9mIHB1cmVGblxuICogQHJldHVybnMgVXBkYXRlZCBvciBjYWNoZWQgdmFsdWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHB1cmVGdW5jdGlvbjYoXG4gICAgc2xvdE9mZnNldDogbnVtYmVyLCBwdXJlRm46ICh2MTogYW55LCB2MjogYW55LCB2MzogYW55LCB2NDogYW55LCB2NTogYW55LCB2NjogYW55KSA9PiBhbnksXG4gICAgZXhwMTogYW55LCBleHAyOiBhbnksIGV4cDM6IGFueSwgZXhwNDogYW55LCBleHA1OiBhbnksIGV4cDY6IGFueSwgdGhpc0FyZz86IGFueSk6IGFueSB7XG4gIC8vIFRPRE8oa2FyYSk6IHVzZSBiaW5kaW5nUm9vdCBpbnN0ZWFkIG9mIGJpbmRpbmdTdGFydEluZGV4IHdoZW4gaW1wbGVtZW50aW5nIGhvc3QgYmluZGluZ3NcbiAgY29uc3QgYmluZGluZ0luZGV4ID0gZ2V0QmluZGluZ1Jvb3QoKSArIHNsb3RPZmZzZXQ7XG4gIGNvbnN0IGxWaWV3ID0gZ2V0TFZpZXcoKTtcbiAgY29uc3QgZGlmZmVyZW50ID0gYmluZGluZ1VwZGF0ZWQ0KGxWaWV3LCBiaW5kaW5nSW5kZXgsIGV4cDEsIGV4cDIsIGV4cDMsIGV4cDQpO1xuICByZXR1cm4gYmluZGluZ1VwZGF0ZWQyKGxWaWV3LCBiaW5kaW5nSW5kZXggKyA0LCBleHA1LCBleHA2KSB8fCBkaWZmZXJlbnQgP1xuICAgICAgdXBkYXRlQmluZGluZyhcbiAgICAgICAgICBsVmlldywgYmluZGluZ0luZGV4ICsgNiwgdGhpc0FyZyA/XG4gICAgICAgICAgICAgIHB1cmVGbi5jYWxsKHRoaXNBcmcsIGV4cDEsIGV4cDIsIGV4cDMsIGV4cDQsIGV4cDUsIGV4cDYpIDpcbiAgICAgICAgICAgICAgcHVyZUZuKGV4cDEsIGV4cDIsIGV4cDMsIGV4cDQsIGV4cDUsIGV4cDYpKSA6XG4gICAgICBnZXRCaW5kaW5nKGxWaWV3LCBiaW5kaW5nSW5kZXggKyA2KTtcbn1cblxuLyoqXG4gKiBJZiB0aGUgdmFsdWUgb2YgYW55IHByb3ZpZGVkIGV4cCBoYXMgY2hhbmdlZCwgY2FsbHMgdGhlIHB1cmUgZnVuY3Rpb24gdG8gcmV0dXJuXG4gKiBhbiB1cGRhdGVkIHZhbHVlLiBPciBpZiBubyB2YWx1ZXMgaGF2ZSBjaGFuZ2VkLCByZXR1cm5zIGNhY2hlZCB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0gc2xvdE9mZnNldCB0aGUgb2Zmc2V0IGZyb20gYmluZGluZyByb290IHRvIHRoZSByZXNlcnZlZCBzbG90XG4gKiBAcGFyYW0gcHVyZUZuXG4gKiBAcGFyYW0gZXhwMVxuICogQHBhcmFtIGV4cDJcbiAqIEBwYXJhbSBleHAzXG4gKiBAcGFyYW0gZXhwNFxuICogQHBhcmFtIGV4cDVcbiAqIEBwYXJhbSBleHA2XG4gKiBAcGFyYW0gZXhwN1xuICogQHBhcmFtIHRoaXNBcmcgT3B0aW9uYWwgY2FsbGluZyBjb250ZXh0IG9mIHB1cmVGblxuICogQHJldHVybnMgVXBkYXRlZCBvciBjYWNoZWQgdmFsdWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHB1cmVGdW5jdGlvbjcoXG4gICAgc2xvdE9mZnNldDogbnVtYmVyLFxuICAgIHB1cmVGbjogKHYxOiBhbnksIHYyOiBhbnksIHYzOiBhbnksIHY0OiBhbnksIHY1OiBhbnksIHY2OiBhbnksIHY3OiBhbnkpID0+IGFueSwgZXhwMTogYW55LFxuICAgIGV4cDI6IGFueSwgZXhwMzogYW55LCBleHA0OiBhbnksIGV4cDU6IGFueSwgZXhwNjogYW55LCBleHA3OiBhbnksIHRoaXNBcmc/OiBhbnkpOiBhbnkge1xuICAvLyBUT0RPKGthcmEpOiB1c2UgYmluZGluZ1Jvb3QgaW5zdGVhZCBvZiBiaW5kaW5nU3RhcnRJbmRleCB3aGVuIGltcGxlbWVudGluZyBob3N0IGJpbmRpbmdzXG4gIGNvbnN0IGJpbmRpbmdJbmRleCA9IGdldEJpbmRpbmdSb290KCkgKyBzbG90T2Zmc2V0O1xuICBjb25zdCBsVmlldyA9IGdldExWaWV3KCk7XG4gIGxldCBkaWZmZXJlbnQgPSBiaW5kaW5nVXBkYXRlZDQobFZpZXcsIGJpbmRpbmdJbmRleCwgZXhwMSwgZXhwMiwgZXhwMywgZXhwNCk7XG4gIHJldHVybiBiaW5kaW5nVXBkYXRlZDMobFZpZXcsIGJpbmRpbmdJbmRleCArIDQsIGV4cDUsIGV4cDYsIGV4cDcpIHx8IGRpZmZlcmVudCA/XG4gICAgICB1cGRhdGVCaW5kaW5nKFxuICAgICAgICAgIGxWaWV3LCBiaW5kaW5nSW5kZXggKyA3LCB0aGlzQXJnID9cbiAgICAgICAgICAgICAgcHVyZUZuLmNhbGwodGhpc0FyZywgZXhwMSwgZXhwMiwgZXhwMywgZXhwNCwgZXhwNSwgZXhwNiwgZXhwNykgOlxuICAgICAgICAgICAgICBwdXJlRm4oZXhwMSwgZXhwMiwgZXhwMywgZXhwNCwgZXhwNSwgZXhwNiwgZXhwNykpIDpcbiAgICAgIGdldEJpbmRpbmcobFZpZXcsIGJpbmRpbmdJbmRleCArIDcpO1xufVxuXG4vKipcbiAqIElmIHRoZSB2YWx1ZSBvZiBhbnkgcHJvdmlkZWQgZXhwIGhhcyBjaGFuZ2VkLCBjYWxscyB0aGUgcHVyZSBmdW5jdGlvbiB0byByZXR1cm5cbiAqIGFuIHVwZGF0ZWQgdmFsdWUuIE9yIGlmIG5vIHZhbHVlcyBoYXZlIGNoYW5nZWQsIHJldHVybnMgY2FjaGVkIHZhbHVlLlxuICpcbiAqIEBwYXJhbSBzbG90T2Zmc2V0IHRoZSBvZmZzZXQgZnJvbSBiaW5kaW5nIHJvb3QgdG8gdGhlIHJlc2VydmVkIHNsb3RcbiAqIEBwYXJhbSBwdXJlRm5cbiAqIEBwYXJhbSBleHAxXG4gKiBAcGFyYW0gZXhwMlxuICogQHBhcmFtIGV4cDNcbiAqIEBwYXJhbSBleHA0XG4gKiBAcGFyYW0gZXhwNVxuICogQHBhcmFtIGV4cDZcbiAqIEBwYXJhbSBleHA3XG4gKiBAcGFyYW0gZXhwOFxuICogQHBhcmFtIHRoaXNBcmcgT3B0aW9uYWwgY2FsbGluZyBjb250ZXh0IG9mIHB1cmVGblxuICogQHJldHVybnMgVXBkYXRlZCBvciBjYWNoZWQgdmFsdWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHB1cmVGdW5jdGlvbjgoXG4gICAgc2xvdE9mZnNldDogbnVtYmVyLFxuICAgIHB1cmVGbjogKHYxOiBhbnksIHYyOiBhbnksIHYzOiBhbnksIHY0OiBhbnksIHY1OiBhbnksIHY2OiBhbnksIHY3OiBhbnksIHY4OiBhbnkpID0+IGFueSxcbiAgICBleHAxOiBhbnksIGV4cDI6IGFueSwgZXhwMzogYW55LCBleHA0OiBhbnksIGV4cDU6IGFueSwgZXhwNjogYW55LCBleHA3OiBhbnksIGV4cDg6IGFueSxcbiAgICB0aGlzQXJnPzogYW55KTogYW55IHtcbiAgLy8gVE9ETyhrYXJhKTogdXNlIGJpbmRpbmdSb290IGluc3RlYWQgb2YgYmluZGluZ1N0YXJ0SW5kZXggd2hlbiBpbXBsZW1lbnRpbmcgaG9zdCBiaW5kaW5nc1xuICBjb25zdCBiaW5kaW5nSW5kZXggPSBnZXRCaW5kaW5nUm9vdCgpICsgc2xvdE9mZnNldDtcbiAgY29uc3QgbFZpZXcgPSBnZXRMVmlldygpO1xuICBjb25zdCBkaWZmZXJlbnQgPSBiaW5kaW5nVXBkYXRlZDQobFZpZXcsIGJpbmRpbmdJbmRleCwgZXhwMSwgZXhwMiwgZXhwMywgZXhwNCk7XG4gIHJldHVybiBiaW5kaW5nVXBkYXRlZDQobFZpZXcsIGJpbmRpbmdJbmRleCArIDQsIGV4cDUsIGV4cDYsIGV4cDcsIGV4cDgpIHx8IGRpZmZlcmVudCA/XG4gICAgICB1cGRhdGVCaW5kaW5nKFxuICAgICAgICAgIGxWaWV3LCBiaW5kaW5nSW5kZXggKyA4LCB0aGlzQXJnID9cbiAgICAgICAgICAgICAgcHVyZUZuLmNhbGwodGhpc0FyZywgZXhwMSwgZXhwMiwgZXhwMywgZXhwNCwgZXhwNSwgZXhwNiwgZXhwNywgZXhwOCkgOlxuICAgICAgICAgICAgICBwdXJlRm4oZXhwMSwgZXhwMiwgZXhwMywgZXhwNCwgZXhwNSwgZXhwNiwgZXhwNywgZXhwOCkpIDpcbiAgICAgIGdldEJpbmRpbmcobFZpZXcsIGJpbmRpbmdJbmRleCArIDgpO1xufVxuXG4vKipcbiAqIHB1cmVGdW5jdGlvbiBpbnN0cnVjdGlvbiB0aGF0IGNhbiBzdXBwb3J0IGFueSBudW1iZXIgb2YgYmluZGluZ3MuXG4gKlxuICogSWYgdGhlIHZhbHVlIG9mIGFueSBwcm92aWRlZCBleHAgaGFzIGNoYW5nZWQsIGNhbGxzIHRoZSBwdXJlIGZ1bmN0aW9uIHRvIHJldHVyblxuICogYW4gdXBkYXRlZCB2YWx1ZS4gT3IgaWYgbm8gdmFsdWVzIGhhdmUgY2hhbmdlZCwgcmV0dXJucyBjYWNoZWQgdmFsdWUuXG4gKlxuICogQHBhcmFtIHNsb3RPZmZzZXQgdGhlIG9mZnNldCBmcm9tIGJpbmRpbmcgcm9vdCB0byB0aGUgcmVzZXJ2ZWQgc2xvdFxuICogQHBhcmFtIHB1cmVGbiBBIHB1cmUgZnVuY3Rpb24gdGhhdCB0YWtlcyBiaW5kaW5nIHZhbHVlcyBhbmQgYnVpbGRzIGFuIG9iamVjdCBvciBhcnJheVxuICogY29udGFpbmluZyB0aG9zZSB2YWx1ZXMuXG4gKiBAcGFyYW0gZXhwcyBBbiBhcnJheSBvZiBiaW5kaW5nIHZhbHVlc1xuICogQHBhcmFtIHRoaXNBcmcgT3B0aW9uYWwgY2FsbGluZyBjb250ZXh0IG9mIHB1cmVGblxuICogQHJldHVybnMgVXBkYXRlZCBvciBjYWNoZWQgdmFsdWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHB1cmVGdW5jdGlvblYoXG4gICAgc2xvdE9mZnNldDogbnVtYmVyLCBwdXJlRm46ICguLi52OiBhbnlbXSkgPT4gYW55LCBleHBzOiBhbnlbXSwgdGhpc0FyZz86IGFueSk6IGFueSB7XG4gIC8vIFRPRE8oa2FyYSk6IHVzZSBiaW5kaW5nUm9vdCBpbnN0ZWFkIG9mIGJpbmRpbmdTdGFydEluZGV4IHdoZW4gaW1wbGVtZW50aW5nIGhvc3QgYmluZGluZ3NcbiAgbGV0IGJpbmRpbmdJbmRleCA9IGdldEJpbmRpbmdSb290KCkgKyBzbG90T2Zmc2V0O1xuICBsZXQgZGlmZmVyZW50ID0gZmFsc2U7XG4gIGNvbnN0IGxWaWV3ID0gZ2V0TFZpZXcoKTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBleHBzLmxlbmd0aDsgaSsrKSB7XG4gICAgYmluZGluZ1VwZGF0ZWQobFZpZXcsIGJpbmRpbmdJbmRleCsrLCBleHBzW2ldKSAmJiAoZGlmZmVyZW50ID0gdHJ1ZSk7XG4gIH1cbiAgcmV0dXJuIGRpZmZlcmVudCA/IHVwZGF0ZUJpbmRpbmcobFZpZXcsIGJpbmRpbmdJbmRleCwgcHVyZUZuLmFwcGx5KHRoaXNBcmcsIGV4cHMpKSA6XG4gICAgICAgICAgICAgICAgICAgICBnZXRCaW5kaW5nKGxWaWV3LCBiaW5kaW5nSW5kZXgpO1xufVxuIl19