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
import './ng_dev_mode';
import { getLContext } from './context_discovery';
import { getRootContext } from './discovery_utils';
import { scheduleTick } from './instructions';
import { addPlayerInternal, getOrCreatePlayerContext, getPlayerContext, getPlayersInternal, getStylingContext, throwInvalidRefError } from './styling/util';
/**
 * Adds a player to an element, directive or component instance that will later be
 * animated once change detection has passed.
 *
 * When a player is added to a reference it will stay active until `player.destroy()`
 * is called. Once called then the player will be removed from the active players
 * present on the associated ref instance.
 *
 * To get a list of all the active players on an element see [getPlayers].
 *
 * @param {?} ref The element, directive or component that the player will be placed on.
 * @param {?} player The player that will be triggered to play once change detection has run.
 * @return {?}
 */
export function addPlayer(ref, player) {
    /** @type {?} */
    const context = getLContext(ref);
    if (!context) {
        ngDevMode && throwInvalidRefError();
        return;
    }
    /** @type {?} */
    const element = (/** @type {?} */ (context.native));
    /** @type {?} */
    const lView = context.lView;
    /** @type {?} */
    const playerContext = (/** @type {?} */ (getOrCreatePlayerContext(element, context)));
    /** @type {?} */
    const rootContext = getRootContext(lView);
    addPlayerInternal(playerContext, rootContext, element, player, 0, ref);
    scheduleTick(rootContext, 2 /* FlushPlayers */);
}
/**
 * Returns a list of all the active players present on the provided ref instance (which can
 * be an instance of a directive, component or element).
 *
 * This function will only return players that have been added to the ref instance using
 * `addPlayer` or any players that are active through any template styling bindings
 * (`[style]`, `[style.prop]`, `[class]` and `[class.name]`).
 *
 * \@publicApi
 * @param {?} ref
 * @return {?}
 */
export function getPlayers(ref) {
    /** @type {?} */
    const context = getLContext(ref);
    if (!context) {
        ngDevMode && throwInvalidRefError();
        return [];
    }
    /** @type {?} */
    const stylingContext = getStylingContext(context.nodeIndex, context.lView);
    /** @type {?} */
    const playerContext = stylingContext ? getPlayerContext(stylingContext) : null;
    return playerContext ? getPlayersInternal(playerContext) : [];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxheWVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL3JlbmRlcjMvcGxheWVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQU9BLE9BQU8sZUFBZSxDQUFDO0FBRXZCLE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUNoRCxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDakQsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBRzVDLE9BQU8sRUFBQyxpQkFBaUIsRUFBRSx3QkFBd0IsRUFBRSxnQkFBZ0IsRUFBRSxrQkFBa0IsRUFBRSxpQkFBaUIsRUFBRSxvQkFBb0IsRUFBQyxNQUFNLGdCQUFnQixDQUFDOzs7Ozs7Ozs7Ozs7Ozs7QUFlMUosTUFBTSxVQUFVLFNBQVMsQ0FDckIsR0FBd0QsRUFBRSxNQUFjOztVQUNwRSxPQUFPLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQztJQUNoQyxJQUFJLENBQUMsT0FBTyxFQUFFO1FBQ1osU0FBUyxJQUFJLG9CQUFvQixFQUFFLENBQUM7UUFDcEMsT0FBTztLQUNSOztVQUVLLE9BQU8sR0FBRyxtQkFBQSxPQUFPLENBQUMsTUFBTSxFQUFlOztVQUN2QyxLQUFLLEdBQUcsT0FBTyxDQUFDLEtBQUs7O1VBQ3JCLGFBQWEsR0FBRyxtQkFBQSx3QkFBd0IsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLEVBQUU7O1VBQzVELFdBQVcsR0FBRyxjQUFjLENBQUMsS0FBSyxDQUFDO0lBQ3pDLGlCQUFpQixDQUFDLGFBQWEsRUFBRSxXQUFXLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDdkUsWUFBWSxDQUFDLFdBQVcsdUJBQWdDLENBQUM7QUFDM0QsQ0FBQzs7Ozs7Ozs7Ozs7OztBQVlELE1BQU0sVUFBVSxVQUFVLENBQUMsR0FBd0Q7O1VBQzNFLE9BQU8sR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDO0lBQ2hDLElBQUksQ0FBQyxPQUFPLEVBQUU7UUFDWixTQUFTLElBQUksb0JBQW9CLEVBQUUsQ0FBQztRQUNwQyxPQUFPLEVBQUUsQ0FBQztLQUNYOztVQUVLLGNBQWMsR0FBRyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUM7O1VBQ3BFLGFBQWEsR0FBRyxjQUFjLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJO0lBQzlFLE9BQU8sYUFBYSxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ2hFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgJy4vbmdfZGV2X21vZGUnO1xuXG5pbXBvcnQge2dldExDb250ZXh0fSBmcm9tICcuL2NvbnRleHRfZGlzY292ZXJ5JztcbmltcG9ydCB7Z2V0Um9vdENvbnRleHR9IGZyb20gJy4vZGlzY292ZXJ5X3V0aWxzJztcbmltcG9ydCB7c2NoZWR1bGVUaWNrfSBmcm9tICcuL2luc3RydWN0aW9ucyc7XG5pbXBvcnQge0NvbXBvbmVudEluc3RhbmNlLCBEaXJlY3RpdmVJbnN0YW5jZSwgUGxheWVyfSBmcm9tICcuL2ludGVyZmFjZXMvcGxheWVyJztcbmltcG9ydCB7SEVBREVSX09GRlNFVCwgUm9vdENvbnRleHRGbGFnc30gZnJvbSAnLi9pbnRlcmZhY2VzL3ZpZXcnO1xuaW1wb3J0IHthZGRQbGF5ZXJJbnRlcm5hbCwgZ2V0T3JDcmVhdGVQbGF5ZXJDb250ZXh0LCBnZXRQbGF5ZXJDb250ZXh0LCBnZXRQbGF5ZXJzSW50ZXJuYWwsIGdldFN0eWxpbmdDb250ZXh0LCB0aHJvd0ludmFsaWRSZWZFcnJvcn0gZnJvbSAnLi9zdHlsaW5nL3V0aWwnO1xuXG4vKipcbiAqIEFkZHMgYSBwbGF5ZXIgdG8gYW4gZWxlbWVudCwgZGlyZWN0aXZlIG9yIGNvbXBvbmVudCBpbnN0YW5jZSB0aGF0IHdpbGwgbGF0ZXIgYmVcbiAqIGFuaW1hdGVkIG9uY2UgY2hhbmdlIGRldGVjdGlvbiBoYXMgcGFzc2VkLlxuICpcbiAqIFdoZW4gYSBwbGF5ZXIgaXMgYWRkZWQgdG8gYSByZWZlcmVuY2UgaXQgd2lsbCBzdGF5IGFjdGl2ZSB1bnRpbCBgcGxheWVyLmRlc3Ryb3koKWBcbiAqIGlzIGNhbGxlZC4gT25jZSBjYWxsZWQgdGhlbiB0aGUgcGxheWVyIHdpbGwgYmUgcmVtb3ZlZCBmcm9tIHRoZSBhY3RpdmUgcGxheWVyc1xuICogcHJlc2VudCBvbiB0aGUgYXNzb2NpYXRlZCByZWYgaW5zdGFuY2UuXG4gKlxuICogVG8gZ2V0IGEgbGlzdCBvZiBhbGwgdGhlIGFjdGl2ZSBwbGF5ZXJzIG9uIGFuIGVsZW1lbnQgc2VlIFtnZXRQbGF5ZXJzXS5cbiAqXG4gKiBAcGFyYW0gcmVmIFRoZSBlbGVtZW50LCBkaXJlY3RpdmUgb3IgY29tcG9uZW50IHRoYXQgdGhlIHBsYXllciB3aWxsIGJlIHBsYWNlZCBvbi5cbiAqIEBwYXJhbSBwbGF5ZXIgVGhlIHBsYXllciB0aGF0IHdpbGwgYmUgdHJpZ2dlcmVkIHRvIHBsYXkgb25jZSBjaGFuZ2UgZGV0ZWN0aW9uIGhhcyBydW4uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGRQbGF5ZXIoXG4gICAgcmVmOiBDb21wb25lbnRJbnN0YW5jZSB8IERpcmVjdGl2ZUluc3RhbmNlIHwgSFRNTEVsZW1lbnQsIHBsYXllcjogUGxheWVyKTogdm9pZCB7XG4gIGNvbnN0IGNvbnRleHQgPSBnZXRMQ29udGV4dChyZWYpO1xuICBpZiAoIWNvbnRleHQpIHtcbiAgICBuZ0Rldk1vZGUgJiYgdGhyb3dJbnZhbGlkUmVmRXJyb3IoKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCBlbGVtZW50ID0gY29udGV4dC5uYXRpdmUgYXMgSFRNTEVsZW1lbnQ7XG4gIGNvbnN0IGxWaWV3ID0gY29udGV4dC5sVmlldztcbiAgY29uc3QgcGxheWVyQ29udGV4dCA9IGdldE9yQ3JlYXRlUGxheWVyQ29udGV4dChlbGVtZW50LCBjb250ZXh0KSAhO1xuICBjb25zdCByb290Q29udGV4dCA9IGdldFJvb3RDb250ZXh0KGxWaWV3KTtcbiAgYWRkUGxheWVySW50ZXJuYWwocGxheWVyQ29udGV4dCwgcm9vdENvbnRleHQsIGVsZW1lbnQsIHBsYXllciwgMCwgcmVmKTtcbiAgc2NoZWR1bGVUaWNrKHJvb3RDb250ZXh0LCBSb290Q29udGV4dEZsYWdzLkZsdXNoUGxheWVycyk7XG59XG5cbi8qKlxuICogUmV0dXJucyBhIGxpc3Qgb2YgYWxsIHRoZSBhY3RpdmUgcGxheWVycyBwcmVzZW50IG9uIHRoZSBwcm92aWRlZCByZWYgaW5zdGFuY2UgKHdoaWNoIGNhblxuICogYmUgYW4gaW5zdGFuY2Ugb2YgYSBkaXJlY3RpdmUsIGNvbXBvbmVudCBvciBlbGVtZW50KS5cbiAqXG4gKiBUaGlzIGZ1bmN0aW9uIHdpbGwgb25seSByZXR1cm4gcGxheWVycyB0aGF0IGhhdmUgYmVlbiBhZGRlZCB0byB0aGUgcmVmIGluc3RhbmNlIHVzaW5nXG4gKiBgYWRkUGxheWVyYCBvciBhbnkgcGxheWVycyB0aGF0IGFyZSBhY3RpdmUgdGhyb3VnaCBhbnkgdGVtcGxhdGUgc3R5bGluZyBiaW5kaW5nc1xuICogKGBbc3R5bGVdYCwgYFtzdHlsZS5wcm9wXWAsIGBbY2xhc3NdYCBhbmQgYFtjbGFzcy5uYW1lXWApLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFBsYXllcnMocmVmOiBDb21wb25lbnRJbnN0YW5jZSB8IERpcmVjdGl2ZUluc3RhbmNlIHwgSFRNTEVsZW1lbnQpOiBQbGF5ZXJbXSB7XG4gIGNvbnN0IGNvbnRleHQgPSBnZXRMQ29udGV4dChyZWYpO1xuICBpZiAoIWNvbnRleHQpIHtcbiAgICBuZ0Rldk1vZGUgJiYgdGhyb3dJbnZhbGlkUmVmRXJyb3IoKTtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICBjb25zdCBzdHlsaW5nQ29udGV4dCA9IGdldFN0eWxpbmdDb250ZXh0KGNvbnRleHQubm9kZUluZGV4LCBjb250ZXh0LmxWaWV3KTtcbiAgY29uc3QgcGxheWVyQ29udGV4dCA9IHN0eWxpbmdDb250ZXh0ID8gZ2V0UGxheWVyQ29udGV4dChzdHlsaW5nQ29udGV4dCkgOiBudWxsO1xuICByZXR1cm4gcGxheWVyQ29udGV4dCA/IGdldFBsYXllcnNJbnRlcm5hbChwbGF5ZXJDb250ZXh0KSA6IFtdO1xufVxuIl19