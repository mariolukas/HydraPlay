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
import '../ng_dev_mode';
import { getLContext } from '../context_discovery';
import { HEADER_OFFSET, HOST } from '../interfaces/view';
import { getTNode } from '../util';
import { CorePlayerHandler } from './core_player_handler';
/** @type {?} */
const ANIMATION_PROP_PREFIX = '@';
/**
 * @param {?=} element
 * @param {?=} sanitizer
 * @param {?=} initialStyles
 * @param {?=} initialClasses
 * @return {?}
 */
export function createEmptyStylingContext(element, sanitizer, initialStyles, initialClasses) {
    return [
        0,
        [null, -1, false, sanitizer || null],
        initialStyles || [null],
        initialClasses || [null],
        [0, 0],
        element || null,
        null,
        null,
        null,
    ];
}
/**
 * Used clone a copy of a pre-computed template of a styling context.
 *
 * A pre-computed template is designed to be computed once for a given element
 * (instructions.ts has logic for caching this).
 * @param {?} element
 * @param {?} templateStyleContext
 * @return {?}
 */
export function allocStylingContext(element, templateStyleContext) {
    // each instance gets a copy
    /** @type {?} */
    const context = (/** @type {?} */ ((/** @type {?} */ (templateStyleContext.slice()))));
    context[5 /* ElementPosition */] = element;
    // this will prevent any other directives from extending the context
    context[0 /* MasterFlagPosition */] |= 32 /* BindingAllocationLocked */;
    return context;
}
/**
 * Retrieve the `StylingContext` at a given index.
 *
 * This method lazily creates the `StylingContext`. This is because in most cases
 * we have styling without any bindings. Creating `StylingContext` eagerly would mean that
 * every style declaration such as `<div style="color: red">` would result `StyleContext`
 * which would create unnecessary memory pressure.
 *
 * @param {?} index Index of the style allocation. See: `elementStyling`.
 * @param {?} viewData The view to search for the styling context
 * @return {?}
 */
export function getStylingContext(index, viewData) {
    /** @type {?} */
    let storageIndex = index;
    /** @type {?} */
    let slotValue = viewData[storageIndex];
    /** @type {?} */
    let wrapper = viewData;
    while (Array.isArray(slotValue)) {
        wrapper = slotValue;
        slotValue = (/** @type {?} */ (slotValue[HOST]));
    }
    if (isStylingContext(wrapper)) {
        return (/** @type {?} */ (wrapper));
    }
    else {
        // This is an LView or an LContainer
        /** @type {?} */
        const stylingTemplate = getTNode(index - HEADER_OFFSET, viewData).stylingTemplate;
        if (wrapper !== viewData) {
            storageIndex = HOST;
        }
        return wrapper[storageIndex] = stylingTemplate ?
            allocStylingContext(slotValue, stylingTemplate) :
            createEmptyStylingContext(slotValue);
    }
}
/**
 * @param {?} value
 * @return {?}
 */
export function isStylingContext(value) {
    // Not an LView or an LContainer
    return Array.isArray(value) && typeof value[0 /* MasterFlagPosition */] === 'number' &&
        Array.isArray(value[2 /* InitialStyleValuesPosition */]);
}
/**
 * @param {?} name
 * @return {?}
 */
export function isAnimationProp(name) {
    return name[0] === ANIMATION_PROP_PREFIX;
}
/**
 * @param {?} playerContext
 * @param {?} rootContext
 * @param {?} element
 * @param {?} player
 * @param {?} playerContextIndex
 * @param {?=} ref
 * @return {?}
 */
export function addPlayerInternal(playerContext, rootContext, element, player, playerContextIndex, ref) {
    ref = ref || element;
    if (playerContextIndex) {
        playerContext[playerContextIndex] = player;
    }
    else {
        playerContext.push(player);
    }
    if (player) {
        player.addEventListener(200 /* Destroyed */, () => {
            /** @type {?} */
            const index = playerContext.indexOf(player);
            /** @type {?} */
            const nonFactoryPlayerIndex = playerContext[0 /* NonBuilderPlayersStart */];
            // if the player is being removed from the factory side of the context
            // (which is where the [style] and [class] bindings do their thing) then
            // that side of the array cannot be resized since the respective bindings
            // have pointer index values that point to the associated factory instance
            if (index) {
                if (index < nonFactoryPlayerIndex) {
                    playerContext[index] = null;
                }
                else {
                    playerContext.splice(index, 1);
                }
            }
            player.destroy();
        });
        /** @type {?} */
        const playerHandler = rootContext.playerHandler || (rootContext.playerHandler = new CorePlayerHandler());
        playerHandler.queuePlayer(player, ref);
        return true;
    }
    return false;
}
/**
 * @param {?} playerContext
 * @return {?}
 */
export function getPlayersInternal(playerContext) {
    /** @type {?} */
    const players = [];
    /** @type {?} */
    const nonFactoryPlayersStart = playerContext[0 /* NonBuilderPlayersStart */];
    // add all factory-based players (which are apart of [style] and [class] bindings)
    for (let i = 1 /* PlayerBuildersStartPosition */ + 1 /* PlayerOffsetPosition */; i < nonFactoryPlayersStart; i += 2 /* PlayerAndPlayerBuildersTupleSize */) {
        /** @type {?} */
        const player = (/** @type {?} */ (playerContext[i]));
        if (player) {
            players.push(player);
        }
    }
    // add all custom players (not apart of [style] and [class] bindings)
    for (let i = nonFactoryPlayersStart; i < playerContext.length; i++) {
        players.push((/** @type {?} */ (playerContext[i])));
    }
    return players;
}
/**
 * @param {?} target
 * @param {?=} context
 * @return {?}
 */
export function getOrCreatePlayerContext(target, context) {
    context = context || (/** @type {?} */ (getLContext(target)));
    if (!context) {
        ngDevMode && throwInvalidRefError();
        return null;
    }
    const { lView, nodeIndex } = context;
    /** @type {?} */
    const stylingContext = getStylingContext(nodeIndex, lView);
    return getPlayerContext(stylingContext) || allocPlayerContext(stylingContext);
}
/**
 * @param {?} stylingContext
 * @return {?}
 */
export function getPlayerContext(stylingContext) {
    return stylingContext[8 /* PlayerContext */];
}
/**
 * @param {?} data
 * @return {?}
 */
export function allocPlayerContext(data) {
    return data[8 /* PlayerContext */] =
        [5 /* SinglePlayerBuildersStartPosition */, null, null, null, null];
}
/**
 * @return {?}
 */
export function throwInvalidRefError() {
    throw new Error('Only elements that exist in an Angular application can be used for animations');
}
/**
 * @param {?} attrs
 * @return {?}
 */
export function hasStyling(attrs) {
    for (let i = 0; i < attrs.length; i++) {
        /** @type {?} */
        const attr = attrs[i];
        if (attr == 1 /* Classes */ || attr == 2 /* Styles */)
            return true;
    }
    return false;
}
/**
 * @param {?} tNode
 * @return {?}
 */
export function hasClassInput(tNode) {
    return tNode.flags & 8 /* hasClassInput */ ? true : false;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL3JlbmRlcjMvc3R5bGluZy91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBT0EsT0FBTyxnQkFBZ0IsQ0FBQztBQUd4QixPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFPakQsT0FBTyxFQUFDLGFBQWEsRUFBRSxJQUFJLEVBQXFCLE1BQU0sb0JBQW9CLENBQUM7QUFDM0UsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLFNBQVMsQ0FBQztBQUVqQyxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQzs7TUFFbEQscUJBQXFCLEdBQUcsR0FBRzs7Ozs7Ozs7QUFFakMsTUFBTSxVQUFVLHlCQUF5QixDQUNyQyxPQUF5QixFQUFFLFNBQWtDLEVBQzdELGFBQTJDLEVBQzNDLGNBQTRDO0lBQzlDLE9BQU87UUFDTCxDQUFDO1FBQ0QsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLFNBQVMsSUFBSSxJQUFJLENBQUM7UUFDcEMsYUFBYSxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3ZCLGNBQWMsSUFBSSxDQUFDLElBQUksQ0FBQztRQUN4QixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDTixPQUFPLElBQUksSUFBSTtRQUNmLElBQUk7UUFDSixJQUFJO1FBQ0osSUFBSTtLQUNMLENBQUM7QUFDSixDQUFDOzs7Ozs7Ozs7O0FBUUQsTUFBTSxVQUFVLG1CQUFtQixDQUMvQixPQUF3QixFQUFFLG9CQUFvQzs7O1VBRTFELE9BQU8sR0FBRyxtQkFBQSxtQkFBQSxvQkFBb0IsQ0FBQyxLQUFLLEVBQUUsRUFBTyxFQUFrQjtJQUNyRSxPQUFPLHlCQUE4QixHQUFHLE9BQU8sQ0FBQztJQUVoRCxvRUFBb0U7SUFDcEUsT0FBTyw0QkFBaUMsb0NB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SUFDN0QsT0FBTyxjQUFjLHVCQUE0QixDQUFDO0FBQ3BELENBQUM7Ozs7O0FBRUQsTUFBTSxVQUFVLGtCQUFrQixDQUFDLElBQW9CO0lBQ3JELE9BQU8sSUFBSSx1QkFBNEI7UUFDNUIsNENBQWdELElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3JGLENBQUM7Ozs7QUFFRCxNQUFNLFVBQVUsb0JBQW9CO0lBQ2xDLE1BQU0sSUFBSSxLQUFLLENBQUMsK0VBQStFLENBQUMsQ0FBQztBQUNuRyxDQUFDOzs7OztBQUVELE1BQU0sVUFBVSxVQUFVLENBQUMsS0FBa0I7SUFDM0MsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7O2NBQy9CLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ3JCLElBQUksSUFBSSxtQkFBMkIsSUFBSSxJQUFJLGtCQUEwQjtZQUFFLE9BQU8sSUFBSSxDQUFDO0tBQ3BGO0lBQ0QsT0FBTyxLQUFLLENBQUM7QUFDZixDQUFDOzs7OztBQUVELE1BQU0sVUFBVSxhQUFhLENBQUMsS0FBWTtJQUN4QyxPQUFPLEtBQUssQ0FBQyxLQUFLLHdCQUEyQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztBQUMvRCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0ICcuLi9uZ19kZXZfbW9kZSc7XG5cbmltcG9ydCB7U3R5bGVTYW5pdGl6ZUZufSBmcm9tICcuLi8uLi9zYW5pdGl6YXRpb24vc3R5bGVfc2FuaXRpemVyJztcbmltcG9ydCB7Z2V0TENvbnRleHR9IGZyb20gJy4uL2NvbnRleHRfZGlzY292ZXJ5JztcbmltcG9ydCB7TENvbnRhaW5lcn0gZnJvbSAnLi4vaW50ZXJmYWNlcy9jb250YWluZXInO1xuaW1wb3J0IHtMQ29udGV4dH0gZnJvbSAnLi4vaW50ZXJmYWNlcy9jb250ZXh0JztcbmltcG9ydCB7QXR0cmlidXRlTWFya2VyLCBUQXR0cmlidXRlcywgVE5vZGUsIFROb2RlRmxhZ3N9IGZyb20gJy4uL2ludGVyZmFjZXMvbm9kZSc7XG5pbXBvcnQge1BsYXlTdGF0ZSwgUGxheWVyLCBQbGF5ZXJDb250ZXh0LCBQbGF5ZXJJbmRleH0gZnJvbSAnLi4vaW50ZXJmYWNlcy9wbGF5ZXInO1xuaW1wb3J0IHtSRWxlbWVudH0gZnJvbSAnLi4vaW50ZXJmYWNlcy9yZW5kZXJlcic7XG5pbXBvcnQge0luaXRpYWxTdHlsaW5nVmFsdWVzLCBTdHlsaW5nQ29udGV4dCwgU3R5bGluZ0ZsYWdzLCBTdHlsaW5nSW5kZXh9IGZyb20gJy4uL2ludGVyZmFjZXMvc3R5bGluZyc7XG5pbXBvcnQge0hFQURFUl9PRkZTRVQsIEhPU1QsIExWaWV3LCBSb290Q29udGV4dH0gZnJvbSAnLi4vaW50ZXJmYWNlcy92aWV3JztcbmltcG9ydCB7Z2V0VE5vZGV9IGZyb20gJy4uL3V0aWwnO1xuXG5pbXBvcnQge0NvcmVQbGF5ZXJIYW5kbGVyfSBmcm9tICcuL2NvcmVfcGxheWVyX2hhbmRsZXInO1xuXG5jb25zdCBBTklNQVRJT05fUFJPUF9QUkVGSVggPSAnQCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVFbXB0eVN0eWxpbmdDb250ZXh0KFxuICAgIGVsZW1lbnQ/OiBSRWxlbWVudCB8IG51bGwsIHNhbml0aXplcj86IFN0eWxlU2FuaXRpemVGbiB8IG51bGwsXG4gICAgaW5pdGlhbFN0eWxlcz86IEluaXRpYWxTdHlsaW5nVmFsdWVzIHwgbnVsbCxcbiAgICBpbml0aWFsQ2xhc3Nlcz86IEluaXRpYWxTdHlsaW5nVmFsdWVzIHwgbnVsbCk6IFN0eWxpbmdDb250ZXh0IHtcbiAgcmV0dXJuIFtcbiAgICAwLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBNYXN0ZXJGbGFnc1xuICAgIFtudWxsLCAtMSwgZmFsc2UsIHNhbml0aXplciB8fCBudWxsXSwgIC8vIERpcmVjdGl2ZVJlZnNcbiAgICBpbml0aWFsU3R5bGVzIHx8IFtudWxsXSwgICAgICAgICAgICAgICAvLyBJbml0aWFsU3R5bGVzXG4gICAgaW5pdGlhbENsYXNzZXMgfHwgW251bGxdLCAgICAgICAgICAgICAgLy8gSW5pdGlhbENsYXNzZXNcbiAgICBbMCwgMF0sICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTaW5nbGVQcm9wT2Zmc2V0c1xuICAgIGVsZW1lbnQgfHwgbnVsbCwgICAgICAgICAgICAgICAgICAgICAgIC8vIEVsZW1lbnRcbiAgICBudWxsLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBQcmV2aW91c011bHRpQ2xhc3NWYWx1ZVxuICAgIG51bGwsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFByZXZpb3VzTXVsdGlTdHlsZVZhbHVlXG4gICAgbnVsbCwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUGxheWVyQ29udGV4dFxuICBdO1xufVxuXG4vKipcbiAqIFVzZWQgY2xvbmUgYSBjb3B5IG9mIGEgcHJlLWNvbXB1dGVkIHRlbXBsYXRlIG9mIGEgc3R5bGluZyBjb250ZXh0LlxuICpcbiAqIEEgcHJlLWNvbXB1dGVkIHRlbXBsYXRlIGlzIGRlc2lnbmVkIHRvIGJlIGNvbXB1dGVkIG9uY2UgZm9yIGEgZ2l2ZW4gZWxlbWVudFxuICogKGluc3RydWN0aW9ucy50cyBoYXMgbG9naWMgZm9yIGNhY2hpbmcgdGhpcykuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhbGxvY1N0eWxpbmdDb250ZXh0KFxuICAgIGVsZW1lbnQ6IFJFbGVtZW50IHwgbnVsbCwgdGVtcGxhdGVTdHlsZUNvbnRleHQ6IFN0eWxpbmdDb250ZXh0KTogU3R5bGluZ0NvbnRleHQge1xuICAvLyBlYWNoIGluc3RhbmNlIGdldHMgYSBjb3B5XG4gIGNvbnN0IGNvbnRleHQgPSB0ZW1wbGF0ZVN0eWxlQ29udGV4dC5zbGljZSgpIGFzIGFueSBhcyBTdHlsaW5nQ29udGV4dDtcbiAgY29udGV4dFtTdHlsaW5nSW5kZXguRWxlbWVudFBvc2l0aW9uXSA9IGVsZW1lbnQ7XG5cbiAgLy8gdGhpcyB3aWxsIHByZXZlbnQgYW55IG90aGVyIGRpcmVjdGl2ZXMgZnJvbSBleHRlbmRpbmcgdGhlIGNvbnRleHRcbiAgY29udGV4dFtTdHlsaW5nSW5kZXguTWFzdGVyRmxhZ1Bvc2l0aW9uXSB8PSBTdHlsaW5nRmxhZ3MuQmluZGluZ0FsbG9jYXRpb25Mb2NrZWQ7XG4gIHJldHVybiBjb250ZXh0O1xufVxuXG4vKipcbiAqIFJldHJpZXZlIHRoZSBgU3R5bGluZ0NvbnRleHRgIGF0IGEgZ2l2ZW4gaW5kZXguXG4gKlxuICogVGhpcyBtZXRob2QgbGF6aWx5IGNyZWF0ZXMgdGhlIGBTdHlsaW5nQ29udGV4dGAuIFRoaXMgaXMgYmVjYXVzZSBpbiBtb3N0IGNhc2VzXG4gKiB3ZSBoYXZlIHN0eWxpbmcgd2l0aG91dCBhbnkgYmluZGluZ3MuIENyZWF0aW5nIGBTdHlsaW5nQ29udGV4dGAgZWFnZXJseSB3b3VsZCBtZWFuIHRoYXRcbiAqIGV2ZXJ5IHN0eWxlIGRlY2xhcmF0aW9uIHN1Y2ggYXMgYDxkaXYgc3R5bGU9XCJjb2xvcjogcmVkXCI+YCB3b3VsZCByZXN1bHQgYFN0eWxlQ29udGV4dGBcbiAqIHdoaWNoIHdvdWxkIGNyZWF0ZSB1bm5lY2Vzc2FyeSBtZW1vcnkgcHJlc3N1cmUuXG4gKlxuICogQHBhcmFtIGluZGV4IEluZGV4IG9mIHRoZSBzdHlsZSBhbGxvY2F0aW9uLiBTZWU6IGBlbGVtZW50U3R5bGluZ2AuXG4gKiBAcGFyYW0gdmlld0RhdGEgVGhlIHZpZXcgdG8gc2VhcmNoIGZvciB0aGUgc3R5bGluZyBjb250ZXh0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRTdHlsaW5nQ29udGV4dChpbmRleDogbnVtYmVyLCB2aWV3RGF0YTogTFZpZXcpOiBTdHlsaW5nQ29udGV4dCB7XG4gIGxldCBzdG9yYWdlSW5kZXggPSBpbmRleDtcbiAgbGV0IHNsb3RWYWx1ZTogTENvbnRhaW5lcnxMVmlld3xTdHlsaW5nQ29udGV4dHxSRWxlbWVudCA9IHZpZXdEYXRhW3N0b3JhZ2VJbmRleF07XG4gIGxldCB3cmFwcGVyOiBMQ29udGFpbmVyfExWaWV3fFN0eWxpbmdDb250ZXh0ID0gdmlld0RhdGE7XG5cbiAgd2hpbGUgKEFycmF5LmlzQXJyYXkoc2xvdFZhbHVlKSkge1xuICAgIHdyYXBwZXIgPSBzbG90VmFsdWU7XG4gICAgc2xvdFZhbHVlID0gc2xvdFZhbHVlW0hPU1RdIGFzIExWaWV3IHwgU3R5bGluZ0NvbnRleHQgfCBSRWxlbWVudDtcbiAgfVxuXG4gIGlmIChpc1N0eWxpbmdDb250ZXh0KHdyYXBwZXIpKSB7XG4gICAgcmV0dXJuIHdyYXBwZXIgYXMgU3R5bGluZ0NvbnRleHQ7XG4gIH0gZWxzZSB7XG4gICAgLy8gVGhpcyBpcyBhbiBMVmlldyBvciBhbiBMQ29udGFpbmVyXG4gICAgY29uc3Qgc3R5bGluZ1RlbXBsYXRlID0gZ2V0VE5vZGUoaW5kZXggLSBIRUFERVJfT0ZGU0VULCB2aWV3RGF0YSkuc3R5bGluZ1RlbXBsYXRlO1xuXG4gICAgaWYgKHdyYXBwZXIgIT09IHZpZXdEYXRhKSB7XG4gICAgICBzdG9yYWdlSW5kZXggPSBIT1NUO1xuICAgIH1cblxuICAgIHJldHVybiB3cmFwcGVyW3N0b3JhZ2VJbmRleF0gPSBzdHlsaW5nVGVtcGxhdGUgP1xuICAgICAgICBhbGxvY1N0eWxpbmdDb250ZXh0KHNsb3RWYWx1ZSwgc3R5bGluZ1RlbXBsYXRlKSA6XG4gICAgICAgIGNyZWF0ZUVtcHR5U3R5bGluZ0NvbnRleHQoc2xvdFZhbHVlKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNTdHlsaW5nQ29udGV4dCh2YWx1ZTogYW55KTogdmFsdWUgaXMgU3R5bGluZ0NvbnRleHQge1xuICAvLyBOb3QgYW4gTFZpZXcgb3IgYW4gTENvbnRhaW5lclxuICByZXR1cm4gQXJyYXkuaXNBcnJheSh2YWx1ZSkgJiYgdHlwZW9mIHZhbHVlW1N0eWxpbmdJbmRleC5NYXN0ZXJGbGFnUG9zaXRpb25dID09PSAnbnVtYmVyJyAmJlxuICAgICAgQXJyYXkuaXNBcnJheSh2YWx1ZVtTdHlsaW5nSW5kZXguSW5pdGlhbFN0eWxlVmFsdWVzUG9zaXRpb25dKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzQW5pbWF0aW9uUHJvcChuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIG5hbWVbMF0gPT09IEFOSU1BVElPTl9QUk9QX1BSRUZJWDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFkZFBsYXllckludGVybmFsKFxuICAgIHBsYXllckNvbnRleHQ6IFBsYXllckNvbnRleHQsIHJvb3RDb250ZXh0OiBSb290Q29udGV4dCwgZWxlbWVudDogSFRNTEVsZW1lbnQsXG4gICAgcGxheWVyOiBQbGF5ZXIgfCBudWxsLCBwbGF5ZXJDb250ZXh0SW5kZXg6IG51bWJlciwgcmVmPzogYW55KTogYm9vbGVhbiB7XG4gIHJlZiA9IHJlZiB8fCBlbGVtZW50O1xuICBpZiAocGxheWVyQ29udGV4dEluZGV4KSB7XG4gICAgcGxheWVyQ29udGV4dFtwbGF5ZXJDb250ZXh0SW5kZXhdID0gcGxheWVyO1xuICB9IGVsc2Uge1xuICAgIHBsYXllckNvbnRleHQucHVzaChwbGF5ZXIpO1xuICB9XG5cbiAgaWYgKHBsYXllcikge1xuICAgIHBsYXllci5hZGRFdmVudExpc3RlbmVyKFBsYXlTdGF0ZS5EZXN0cm95ZWQsICgpID0+IHtcbiAgICAgIGNvbnN0IGluZGV4ID0gcGxheWVyQ29udGV4dC5pbmRleE9mKHBsYXllcik7XG4gICAgICBjb25zdCBub25GYWN0b3J5UGxheWVySW5kZXggPSBwbGF5ZXJDb250ZXh0W1BsYXllckluZGV4Lk5vbkJ1aWxkZXJQbGF5ZXJzU3RhcnRdO1xuXG4gICAgICAvLyBpZiB0aGUgcGxheWVyIGlzIGJlaW5nIHJlbW92ZWQgZnJvbSB0aGUgZmFjdG9yeSBzaWRlIG9mIHRoZSBjb250ZXh0XG4gICAgICAvLyAod2hpY2ggaXMgd2hlcmUgdGhlIFtzdHlsZV0gYW5kIFtjbGFzc10gYmluZGluZ3MgZG8gdGhlaXIgdGhpbmcpIHRoZW5cbiAgICAgIC8vIHRoYXQgc2lkZSBvZiB0aGUgYXJyYXkgY2Fubm90IGJlIHJlc2l6ZWQgc2luY2UgdGhlIHJlc3BlY3RpdmUgYmluZGluZ3NcbiAgICAgIC8vIGhhdmUgcG9pbnRlciBpbmRleCB2YWx1ZXMgdGhhdCBwb2ludCB0byB0aGUgYXNzb2NpYXRlZCBmYWN0b3J5IGluc3RhbmNlXG4gICAgICBpZiAoaW5kZXgpIHtcbiAgICAgICAgaWYgKGluZGV4IDwgbm9uRmFjdG9yeVBsYXllckluZGV4KSB7XG4gICAgICAgICAgcGxheWVyQ29udGV4dFtpbmRleF0gPSBudWxsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHBsYXllckNvbnRleHQuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcGxheWVyLmRlc3Ryb3koKTtcbiAgICB9KTtcblxuICAgIGNvbnN0IHBsYXllckhhbmRsZXIgPVxuICAgICAgICByb290Q29udGV4dC5wbGF5ZXJIYW5kbGVyIHx8IChyb290Q29udGV4dC5wbGF5ZXJIYW5kbGVyID0gbmV3IENvcmVQbGF5ZXJIYW5kbGVyKCkpO1xuICAgIHBsYXllckhhbmRsZXIucXVldWVQbGF5ZXIocGxheWVyLCByZWYpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UGxheWVyc0ludGVybmFsKHBsYXllckNvbnRleHQ6IFBsYXllckNvbnRleHQpOiBQbGF5ZXJbXSB7XG4gIGNvbnN0IHBsYXllcnM6IFBsYXllcltdID0gW107XG4gIGNvbnN0IG5vbkZhY3RvcnlQbGF5ZXJzU3RhcnQgPSBwbGF5ZXJDb250ZXh0W1BsYXllckluZGV4Lk5vbkJ1aWxkZXJQbGF5ZXJzU3RhcnRdO1xuXG4gIC8vIGFkZCBhbGwgZmFjdG9yeS1iYXNlZCBwbGF5ZXJzICh3aGljaCBhcmUgYXBhcnQgb2YgW3N0eWxlXSBhbmQgW2NsYXNzXSBiaW5kaW5ncylcbiAgZm9yIChsZXQgaSA9IFBsYXllckluZGV4LlBsYXllckJ1aWxkZXJzU3RhcnRQb3NpdGlvbiArIFBsYXllckluZGV4LlBsYXllck9mZnNldFBvc2l0aW9uO1xuICAgICAgIGkgPCBub25GYWN0b3J5UGxheWVyc1N0YXJ0OyBpICs9IFBsYXllckluZGV4LlBsYXllckFuZFBsYXllckJ1aWxkZXJzVHVwbGVTaXplKSB7XG4gICAgY29uc3QgcGxheWVyID0gcGxheWVyQ29udGV4dFtpXSBhcyBQbGF5ZXIgfCBudWxsO1xuICAgIGlmIChwbGF5ZXIpIHtcbiAgICAgIHBsYXllcnMucHVzaChwbGF5ZXIpO1xuICAgIH1cbiAgfVxuXG4gIC8vIGFkZCBhbGwgY3VzdG9tIHBsYXllcnMgKG5vdCBhcGFydCBvZiBbc3R5bGVdIGFuZCBbY2xhc3NdIGJpbmRpbmdzKVxuICBmb3IgKGxldCBpID0gbm9uRmFjdG9yeVBsYXllcnNTdGFydDsgaSA8IHBsYXllckNvbnRleHQubGVuZ3RoOyBpKyspIHtcbiAgICBwbGF5ZXJzLnB1c2gocGxheWVyQ29udGV4dFtpXSBhcyBQbGF5ZXIpO1xuICB9XG5cbiAgcmV0dXJuIHBsYXllcnM7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGdldE9yQ3JlYXRlUGxheWVyQ29udGV4dCh0YXJnZXQ6IHt9LCBjb250ZXh0PzogTENvbnRleHQgfCBudWxsKTogUGxheWVyQ29udGV4dHxcbiAgICBudWxsIHtcbiAgY29udGV4dCA9IGNvbnRleHQgfHwgZ2V0TENvbnRleHQodGFyZ2V0KSAhO1xuICBpZiAoIWNvbnRleHQpIHtcbiAgICBuZ0Rldk1vZGUgJiYgdGhyb3dJbnZhbGlkUmVmRXJyb3IoKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGNvbnN0IHtsVmlldywgbm9kZUluZGV4fSA9IGNvbnRleHQ7XG4gIGNvbnN0IHN0eWxpbmdDb250ZXh0ID0gZ2V0U3R5bGluZ0NvbnRleHQobm9kZUluZGV4LCBsVmlldyk7XG4gIHJldHVybiBnZXRQbGF5ZXJDb250ZXh0KHN0eWxpbmdDb250ZXh0KSB8fCBhbGxvY1BsYXllckNvbnRleHQoc3R5bGluZ0NvbnRleHQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UGxheWVyQ29udGV4dChzdHlsaW5nQ29udGV4dDogU3R5bGluZ0NvbnRleHQpOiBQbGF5ZXJDb250ZXh0fG51bGwge1xuICByZXR1cm4gc3R5bGluZ0NvbnRleHRbU3R5bGluZ0luZGV4LlBsYXllckNvbnRleHRdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYWxsb2NQbGF5ZXJDb250ZXh0KGRhdGE6IFN0eWxpbmdDb250ZXh0KTogUGxheWVyQ29udGV4dCB7XG4gIHJldHVybiBkYXRhW1N0eWxpbmdJbmRleC5QbGF5ZXJDb250ZXh0XSA9XG4gICAgICAgICAgICAgW1BsYXllckluZGV4LlNpbmdsZVBsYXllckJ1aWxkZXJzU3RhcnRQb3NpdGlvbiwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbF07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0aHJvd0ludmFsaWRSZWZFcnJvcigpIHtcbiAgdGhyb3cgbmV3IEVycm9yKCdPbmx5IGVsZW1lbnRzIHRoYXQgZXhpc3QgaW4gYW4gQW5ndWxhciBhcHBsaWNhdGlvbiBjYW4gYmUgdXNlZCBmb3IgYW5pbWF0aW9ucycpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFzU3R5bGluZyhhdHRyczogVEF0dHJpYnV0ZXMpOiBib29sZWFuIHtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBhdHRycy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IGF0dHIgPSBhdHRyc1tpXTtcbiAgICBpZiAoYXR0ciA9PSBBdHRyaWJ1dGVNYXJrZXIuQ2xhc3NlcyB8fCBhdHRyID09IEF0dHJpYnV0ZU1hcmtlci5TdHlsZXMpIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhc0NsYXNzSW5wdXQodE5vZGU6IFROb2RlKSB7XG4gIHJldHVybiB0Tm9kZS5mbGFncyAmIFROb2RlRmxhZ3MuaGFzQ2xhc3NJbnB1dCA/IHRydWUgOiBmYWxzZTtcbn1cbiJdfQ==