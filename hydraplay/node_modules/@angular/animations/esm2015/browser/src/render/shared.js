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
import { AUTO_STYLE, NoopAnimationPlayer, ɵAnimationGroupPlayer, ɵPRE_STYLE as PRE_STYLE } from '@angular/animations';
/**
 * @return {?}
 */
export function isBrowser() {
    return (typeof window !== 'undefined' && typeof window.document !== 'undefined');
}
/**
 * @return {?}
 */
export function isNode() {
    return (typeof process !== 'undefined');
}
/**
 * @param {?} players
 * @return {?}
 */
export function optimizeGroupPlayer(players) {
    switch (players.length) {
        case 0:
            return new NoopAnimationPlayer();
        case 1:
            return players[0];
        default:
            return new ɵAnimationGroupPlayer(players);
    }
}
/**
 * @param {?} driver
 * @param {?} normalizer
 * @param {?} element
 * @param {?} keyframes
 * @param {?=} preStyles
 * @param {?=} postStyles
 * @return {?}
 */
export function normalizeKeyframes(driver, normalizer, element, keyframes, preStyles = {}, postStyles = {}) {
    /** @type {?} */
    const errors = [];
    /** @type {?} */
    const normalizedKeyframes = [];
    /** @type {?} */
    let previousOffset = -1;
    /** @type {?} */
    let previousKeyframe = null;
    keyframes.forEach(kf => {
        /** @type {?} */
        const offset = (/** @type {?} */ (kf['offset']));
        /** @type {?} */
        const isSameOffset = offset == previousOffset;
        /** @type {?} */
        const normalizedKeyframe = (isSameOffset && previousKeyframe) || {};
        Object.keys(kf).forEach(prop => {
            /** @type {?} */
            let normalizedProp = prop;
            /** @type {?} */
            let normalizedValue = kf[prop];
            if (prop !== 'offset') {
                normalizedProp = normalizer.normalizePropertyName(normalizedProp, errors);
                switch (normalizedValue) {
                    case PRE_STYLE:
                        normalizedValue = preStyles[prop];
                        break;
                    case AUTO_STYLE:
                        normalizedValue = postStyles[prop];
                        break;
                    default:
                        normalizedValue =
                            normalizer.normalizeStyleValue(prop, normalizedProp, normalizedValue, errors);
                        break;
                }
            }
            normalizedKeyframe[normalizedProp] = normalizedValue;
        });
        if (!isSameOffset) {
            normalizedKeyframes.push(normalizedKeyframe);
        }
        previousKeyframe = normalizedKeyframe;
        previousOffset = offset;
    });
    if (errors.length) {
        /** @type {?} */
        const LINE_START = '\n - ';
        throw new Error(`Unable to animate due to the following errors:${LINE_START}${errors.join(LINE_START)}`);
    }
    return normalizedKeyframes;
}
/**
 * @param {?} player
 * @param {?} eventName
 * @param {?} event
 * @param {?} callback
 * @return {?}
 */
export function listenOnPlayer(player, eventName, event, callback) {
    switch (eventName) {
        case 'start':
            player.onStart(() => callback(event && copyAnimationEvent(event, 'start', player)));
            break;
        case 'done':
            player.onDone(() => callback(event && copyAnimationEvent(event, 'done', player)));
            break;
        case 'destroy':
            player.onDestroy(() => callback(event && copyAnimationEvent(event, 'destroy', player)));
            break;
    }
}
/**
 * @param {?} e
 * @param {?} phaseName
 * @param {?} player
 * @return {?}
 */
export function copyAnimationEvent(e, phaseName, player) {
    /** @type {?} */
    const totalTime = player.totalTime;
    /** @type {?} */
    const disabled = ((/** @type {?} */ (player))).disabled ? true : false;
    /** @type {?} */
    const event = makeAnimationEvent(e.element, e.triggerName, e.fromState, e.toState, phaseName || e.phaseName, totalTime == undefined ? e.totalTime : totalTime, disabled);
    /** @type {?} */
    const data = ((/** @type {?} */ (e)))['_data'];
    if (data != null) {
        ((/** @type {?} */ (event)))['_data'] = data;
    }
    return event;
}
/**
 * @param {?} element
 * @param {?} triggerName
 * @param {?} fromState
 * @param {?} toState
 * @param {?=} phaseName
 * @param {?=} totalTime
 * @param {?=} disabled
 * @return {?}
 */
export function makeAnimationEvent(element, triggerName, fromState, toState, phaseName = '', totalTime = 0, disabled) {
    return { element, triggerName, fromState, toState, phaseName, totalTime, disabled: !!disabled };
}
/**
 * @param {?} map
 * @param {?} key
 * @param {?} defaultValue
 * @return {?}
 */
export function getOrSetAsInMap(map, key, defaultValue) {
    /** @type {?} */
    let value;
    if (map instanceof Map) {
        value = map.get(key);
        if (!value) {
            map.set(key, value = defaultValue);
        }
    }
    else {
        value = map[key];
        if (!value) {
            value = map[key] = defaultValue;
        }
    }
    return value;
}
/**
 * @param {?} command
 * @return {?}
 */
export function parseTimelineCommand(command) {
    /** @type {?} */
    const separatorPos = command.indexOf(':');
    /** @type {?} */
    const id = command.substring(1, separatorPos);
    /** @type {?} */
    const action = command.substr(separatorPos + 1);
    return [id, action];
}
/** @type {?} */
let _contains = (elm1, elm2) => false;
const ɵ0 = _contains;
/** @type {?} */
let _matches = (element, selector) => false;
const ɵ1 = _matches;
/** @type {?} */
let _query = (element, selector, multi) => {
    return [];
};
const ɵ2 = _query;
// Define utility methods for browsers and platform-server(domino) where Element
// and utility methods exist.
/** @type {?} */
const _isNode = isNode();
if (_isNode || typeof Element !== 'undefined') {
    // this is well supported in all browsers
    _contains = (elm1, elm2) => { return (/** @type {?} */ (elm1.contains(elm2))); };
    if (_isNode || Element.prototype.matches) {
        _matches = (element, selector) => element.matches(selector);
    }
    else {
        /** @type {?} */
        const proto = (/** @type {?} */ (Element.prototype));
        /** @type {?} */
        const fn = proto.matchesSelector || proto.mozMatchesSelector || proto.msMatchesSelector ||
            proto.oMatchesSelector || proto.webkitMatchesSelector;
        if (fn) {
            _matches = (element, selector) => fn.apply(element, [selector]);
        }
    }
    _query = (element, selector, multi) => {
        /** @type {?} */
        let results = [];
        if (multi) {
            results.push(...element.querySelectorAll(selector));
        }
        else {
            /** @type {?} */
            const elm = element.querySelector(selector);
            if (elm) {
                results.push(elm);
            }
        }
        return results;
    };
}
/**
 * @param {?} prop
 * @return {?}
 */
function containsVendorPrefix(prop) {
    // Webkit is the only real popular vendor prefix nowadays
    // cc: http://shouldiprefix.com/
    return prop.substring(1, 6) == 'ebkit'; // webkit or Webkit
}
/** @type {?} */
let _CACHED_BODY = null;
/** @type {?} */
let _IS_WEBKIT = false;
/**
 * @param {?} prop
 * @return {?}
 */
export function validateStyleProperty(prop) {
    if (!_CACHED_BODY) {
        _CACHED_BODY = getBodyNode() || {};
        _IS_WEBKIT = (/** @type {?} */ (_CACHED_BODY)).style ? ('WebkitAppearance' in (/** @type {?} */ (_CACHED_BODY)).style) : false;
    }
    /** @type {?} */
    let result = true;
    if ((/** @type {?} */ (_CACHED_BODY)).style && !containsVendorPrefix(prop)) {
        result = prop in (/** @type {?} */ (_CACHED_BODY)).style;
        if (!result && _IS_WEBKIT) {
            /** @type {?} */
            const camelProp = 'Webkit' + prop.charAt(0).toUpperCase() + prop.substr(1);
            result = camelProp in (/** @type {?} */ (_CACHED_BODY)).style;
        }
    }
    return result;
}
/**
 * @return {?}
 */
export function getBodyNode() {
    if (typeof document != 'undefined') {
        return document.body;
    }
    return null;
}
/** @type {?} */
export const matchesElement = _matches;
/** @type {?} */
export const containsElement = _contains;
/** @type {?} */
export const invokeQuery = _query;
/**
 * @param {?} object
 * @return {?}
 */
export function hypenatePropsObject(object) {
    /** @type {?} */
    const newObj = {};
    Object.keys(object).forEach(prop => {
        /** @type {?} */
        const newProp = prop.replace(/([a-z])([A-Z])/g, '$1-$2');
        newObj[newProp] = object[prop];
    });
    return newObj;
}
export { ɵ0, ɵ1, ɵ2 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhcmVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5pbWF0aW9ucy9icm93c2VyL3NyYy9yZW5kZXIvc2hhcmVkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBT0EsT0FBTyxFQUFDLFVBQVUsRUFBbUMsbUJBQW1CLEVBQUUscUJBQXFCLEVBQUUsVUFBVSxJQUFJLFNBQVMsRUFBYSxNQUFNLHFCQUFxQixDQUFDOzs7O0FBVWpLLE1BQU0sVUFBVSxTQUFTO0lBQ3ZCLE9BQU8sQ0FBQyxPQUFPLE1BQU0sS0FBSyxXQUFXLElBQUksT0FBTyxNQUFNLENBQUMsUUFBUSxLQUFLLFdBQVcsQ0FBQyxDQUFDO0FBQ25GLENBQUM7Ozs7QUFFRCxNQUFNLFVBQVUsTUFBTTtJQUNwQixPQUFPLENBQUMsT0FBTyxPQUFPLEtBQUssV0FBVyxDQUFDLENBQUM7QUFDMUMsQ0FBQzs7Ozs7QUFFRCxNQUFNLFVBQVUsbUJBQW1CLENBQUMsT0FBMEI7SUFDNUQsUUFBUSxPQUFPLENBQUMsTUFBTSxFQUFFO1FBQ3RCLEtBQUssQ0FBQztZQUNKLE9BQU8sSUFBSSxtQkFBbUIsRUFBRSxDQUFDO1FBQ25DLEtBQUssQ0FBQztZQUNKLE9BQU8sT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3BCO1lBQ0UsT0FBTyxJQUFJLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQzdDO0FBQ0gsQ0FBQzs7Ozs7Ozs7OztBQUVELE1BQU0sVUFBVSxrQkFBa0IsQ0FDOUIsTUFBdUIsRUFBRSxVQUFvQyxFQUFFLE9BQVksRUFDM0UsU0FBdUIsRUFBRSxZQUF3QixFQUFFLEVBQ25ELGFBQXlCLEVBQUU7O1VBQ3ZCLE1BQU0sR0FBYSxFQUFFOztVQUNyQixtQkFBbUIsR0FBaUIsRUFBRTs7UUFDeEMsY0FBYyxHQUFHLENBQUMsQ0FBQzs7UUFDbkIsZ0JBQWdCLEdBQW9CLElBQUk7SUFDNUMsU0FB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QUU7SUFDdkMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7O2NBQzNCLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixFQUFFLE9BQU8sQ0FBQztRQUN4RCxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2pDLENBQUMsQ0FBQyxDQUFDO0lBQ0gsT0FBTyxNQUFNLENBQUM7QUFDaEIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7QVVUT19TVFlMRSwgQW5pbWF0aW9uRXZlbnQsIEFuaW1hdGlvblBsYXllciwgTm9vcEFuaW1hdGlvblBsYXllciwgybVBbmltYXRpb25Hcm91cFBsYXllciwgybVQUkVfU1RZTEUgYXMgUFJFX1NUWUxFLCDJtVN0eWxlRGF0YX0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG5cbmltcG9ydCB7QW5pbWF0aW9uU3R5bGVOb3JtYWxpemVyfSBmcm9tICcuLi8uLi9zcmMvZHNsL3N0eWxlX25vcm1hbGl6YXRpb24vYW5pbWF0aW9uX3N0eWxlX25vcm1hbGl6ZXInO1xuaW1wb3J0IHtBbmltYXRpb25Ecml2ZXJ9IGZyb20gJy4uLy4uL3NyYy9yZW5kZXIvYW5pbWF0aW9uX2RyaXZlcic7XG5cbi8vIFdlIGRvbid0IGluY2x1ZGUgYW1iaWVudCBub2RlIHR5cGVzIGhlcmUgc2luY2UgQGFuZ3VsYXIvYW5pbWF0aW9ucy9icm93c2VyXG4vLyBpcyBtZWFudCB0byB0YXJnZXQgdGhlIGJyb3dzZXIgc28gdGVjaG5pY2FsbHkgaXQgc2hvdWxkIG5vdCBkZXBlbmQgb24gbm9kZVxuLy8gdHlwZXMuIGBwcm9jZXNzYCBpcyBqdXN0IGRlY2xhcmVkIGxvY2FsbHkgaGVyZSBhcyBhIHJlc3VsdC5cbmRlY2xhcmUgY29uc3QgcHJvY2VzczogYW55O1xuXG5leHBvcnQgZnVuY3Rpb24gaXNCcm93c2VyKCkge1xuICByZXR1cm4gKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiB3aW5kb3cuZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzTm9kZSgpIHtcbiAgcmV0dXJuICh0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gb3B0aW1pemVHcm91cFBsYXllcihwbGF5ZXJzOiBBbmltYXRpb25QbGF5ZXJbXSk6IEFuaW1hdGlvblBsYXllciB7XG4gIHN3aXRjaCAocGxheWVycy5sZW5ndGgpIHtcbiAgICBjYXNlIDA6XG4gICAgICByZXR1cm4gbmV3IE5vb3BBbmltYXRpb25QbGF5ZXIoKTtcbiAgICBjYXNlIDE6XG4gICAgICByZXR1cm4gcGxheWVyc1swXTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIG5ldyDJtUFuaW1hdGlvbkdyb3VwUGxheWVyKHBsYXllcnMpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVLZXlmcmFtZXMoXG4gICAgZHJpdmVyOiBBbmltYXRpb25Ecml2ZXIsIG5vcm1hbGl6ZXI6IEFuaW1hdGlvblN0eWxlTm9ybWFsaXplciwgZWxlbWVudDogYW55LFxuICAgIGtleWZyYW1lczogybVTdHlsZURhdGFbXSwgcHJlU3R5bGVzOiDJtVN0eWxlRGF0YSA9IHt9LFxuICAgIHBvc3RTdHlsZXM6IMm1U3R5bGVEYXRhID0ge30pOiDJtVN0eWxlRGF0YVtdIHtcbiAgY29uc3QgZXJyb3JzOiBzdHJpbmdbXSA9IFtdO1xuICBjb25zdCBub3JtYWxpemVkS2V5ZnJhbWVzOiDJtVN0eWxlRGF0YVtdID0gW107XG4gIGxldCBwcmV2aW91c09mZnNldCA9IC0xO1xuICBsZXQgcHJldmlvdXNLZXlmcmFtZTogybVTdHlsZURhdGF8bnVsbCA9IG51bGw7XG4gIGtleWZyYW1lcy5mb3JFYWNoKGtmID0+IHtcbiAgICBjb25zdCBvZmZzZXQgPSBrZlsnb2Zmc2V0J10gYXMgbnVtYmVyO1xuICAgIGNvbnN0IGlzU2FtZU9mZnNldCA9IG9mZnNldCA9PSBwcmV2aW91c09mZnNldDtcbiAgICBjb25zdCBub3JtYWxpemVkS2V5ZnJhbWU6IMm1U3R5bGVEYXRhID0gKGlzU2FtZU9mZnNldCAmJiBwcmV2aW91c0tleWZyYW1lKSB8fCB7fTtcbiAgICBPYmplY3Qua2V5cyhrZikuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgIGxldCBub3JtYWxpemVkUHJvcCA9IHByb3A7XG4gICAgICBsZXQgbm9ybWFsaXplZFZhbHVlID0ga2ZbcHJvcF07XG4gICAgICBpZiAocHJvcCAhPT0gJ29mZnNldCcpIHtcbiAgICAgICAgbm9ybWFsaXplZFByb3AgPSBub3JtYWxpemVyLm5vcm1hbGl6ZVByb3BlcnR5TmFtZShub3JtYWxpemVkUHJvcCwgZXJyb3JzKTtcbiAgICAgICAgc3dpdGNoIChub3JtYWxpemVkVmFsdWUpIHtcbiAgICAgICAgICBjYXNlIFBSRV9TVFlMRTpcbiAgICAgICAgICAgIG5vcm1hbGl6ZWRWYWx1ZSA9IHByZVN0eWxlc1twcm9wXTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgY2FzZSBBVVRPX1NUWUxFOlxuICAgICAgICAgICAgbm9ybWFsaXplZFZhbHVlID0gcG9zdFN0eWxlc1twcm9wXTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIG5vcm1hbGl6ZWRWYWx1ZSA9XG4gICAgICAgICAgICAgICAgbm9ybWFsaXplci5ub3JtYWxpemVTdHlsZVZhbHVlKHByb3AsIG5vcm1hbGl6ZWRQcm9wLCBub3JtYWxpemVkVmFsdWUsIGVycm9ycyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbm9ybWFsaXplZEtleWZyYW1lW25vcm1hbGl6ZWRQcm9wXSA9IG5vcm1hbGl6ZWRWYWx1ZTtcbiAgICB9KTtcbiAgICBpZiAoIWlzU2FtZU9mZnNldCkge1xuICAgICAgbm9ybWFsaXplZEtleWZyYW1lcy5wdXNoKG5vcm1hbGl6ZWRLZXlmcmFtZSk7XG4gICAgfVxuICAgIHByZXZpb3VzS2V5ZnJhbWUgPSBub3JtYWxpemVkS2V5ZnJhbWU7XG4gICAgcHJldmlvdXNPZmZzZXQgPSBvZmZzZXQ7XG4gIH0pO1xuICBpZiAoZXJyb3JzLmxlbmd0aCkge1xuICAgIGNvbnN0IExJTkVfU1RBUlQgPSAnXFxuIC0gJztcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBVbmFibGUgdG8gYW5pbWF0ZSBkdWUgdG8gdGhlIGZvbGxvd2luZyBlcnJvcnM6JHtMSU5FX1NUQVJUfSR7ZXJyb3JzLmpvaW4oTElORV9TVEFSVCl9YCk7XG4gIH1cblxuICByZXR1cm4gbm9ybWFsaXplZEtleWZyYW1lcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxpc3Rlbk9uUGxheWVyKFxuICAgIHBsYXllcjogQW5pbWF0aW9uUGxheWVyLCBldmVudE5hbWU6IHN0cmluZywgZXZlbnQ6IEFuaW1hdGlvbkV2ZW50IHwgdW5kZWZpbmVkLFxuICAgIGNhbGxiYWNrOiAoZXZlbnQ6IGFueSkgPT4gYW55KSB7XG4gIHN3aXRjaCAoZXZlbnROYW1lKSB7XG4gICAgY2FzZSAnc3RhcnQnOlxuICAgICAgcGxheWVyLm9uU3RhcnQoKCkgPT4gY2FsbGJhY2soZXZlbnQgJiYgY29weUFuaW1hdGlvbkV2ZW50KGV2ZW50LCAnc3RhcnQnLCBwbGF5ZXIpKSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdkb25lJzpcbiAgICAgIHBsYXllci5vbkRvbmUoKCkgPT4gY2FsbGJhY2soZXZlbnQgJiYgY29weUFuaW1hdGlvbkV2ZW50KGV2ZW50LCAnZG9uZScsIHBsYXllcikpKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2Rlc3Ryb3knOlxuICAgICAgcGxheWVyLm9uRGVzdHJveSgoKSA9PiBjYWxsYmFjayhldmVudCAmJiBjb3B5QW5pbWF0aW9uRXZlbnQoZXZlbnQsICdkZXN0cm95JywgcGxheWVyKSkpO1xuICAgICAgYnJlYWs7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvcHlBbmltYXRpb25FdmVudChcbiAgICBlOiBBbmltYXRpb25FdmVudCwgcGhhc2VOYW1lOiBzdHJpbmcsIHBsYXllcjogQW5pbWF0aW9uUGxheWVyKTogQW5pbWF0aW9uRXZlbnQge1xuICBjb25zdCB0b3RhbFRpbWUgPSBwbGF5ZXIudG90YWxUaW1lO1xuICBjb25zdCBkaXNhYmxlZCA9IChwbGF5ZXIgYXMgYW55KS5kaXNhYmxlZCA/IHRydWUgOiBmYWxzZTtcbiAgY29uc3QgZXZlbnQgPSBtYWtlQW5pbWF0aW9uRXZlbnQoXG4gICAgICBlLmVsZW1lbnQsIGUudHJpZ2dlck5hbWUsIGUuZnJvbVN0YXRlLCBlLnRvU3RhdGUsIHBoYXNlTmFtZSB8fCBlLnBoYXNlTmFtZSxcbiAgICAgIHRvdGFsVGltZSA9PSB1bmRlZmluZWQgPyBlLnRvdGFsVGltZSA6IHRvdGFsVGltZSwgZGlzYWJsZWQpO1xuICBjb25zdCBkYXRhID0gKGUgYXMgYW55KVsnX2RhdGEnXTtcbiAgaWYgKGRhdGEgIT0gbnVsbCkge1xuICAgIChldmVudCBhcyBhbnkpWydfZGF0YSddID0gZGF0YTtcbiAgfVxuICByZXR1cm4gZXZlbnQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYWtlQW5pbWF0aW9uRXZlbnQoXG4gICAgZWxlbWVudDogYW55LCB0cmlnZ2VyTmFtZTogc3RyaW5nLCBmcm9tU3RhdGU6IHN0cmluZywgdG9TdGF0ZTogc3RyaW5nLCBwaGFzZU5hbWU6IHN0cmluZyA9ICcnLFxuICAgIHRvdGFsVGltZTogbnVtYmVyID0gMCwgZGlzYWJsZWQ/OiBib29sZWFuKTogQW5pbWF0aW9uRXZlbnQge1xuICByZXR1cm4ge2VsZW1lbnQsIHRyaWdnZXJOYW1lLCBmcm9tU3RhdGUsIHRvU3RhdGUsIHBoYXNlTmFtZSwgdG90YWxUaW1lLCBkaXNhYmxlZDogISFkaXNhYmxlZH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRPclNldEFzSW5NYXAoXG4gICAgbWFwOiBNYXA8YW55LCBhbnk+fCB7W2tleTogc3RyaW5nXTogYW55fSwga2V5OiBhbnksIGRlZmF1bHRWYWx1ZTogYW55KSB7XG4gIGxldCB2YWx1ZTogYW55O1xuICBpZiAobWFwIGluc3RhbmNlb2YgTWFwKSB7XG4gICAgdmFsdWUgPSBtYXAuZ2V0KGtleSk7XG4gICAgaWYgKCF2YWx1ZSkge1xuICAgICAgbWFwLnNldChrZXksIHZhbHVlID0gZGVmYXVsdFZhbHVlKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdmFsdWUgPSBtYXBba2V5XTtcbiAgICBpZiAoIXZhbHVlKSB7XG4gICAgICB2YWx1ZSA9IG1hcFtrZXldID0gZGVmYXVsdFZhbHVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdmFsdWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVRpbWVsaW5lQ29tbWFuZChjb21tYW5kOiBzdHJpbmcpOiBbc3RyaW5nLCBzdHJpbmddIHtcbiAgY29uc3Qgc2VwYXJhdG9yUG9zID0gY29tbWFuZC5pbmRleE9mKCc6Jyk7XG4gIGNvbnN0IGlkID0gY29tbWFuZC5zdWJzdHJpbmcoMSwgc2VwYXJhdG9yUG9zKTtcbiAgY29uc3QgYWN0aW9uID0gY29tbWFuZC5zdWJzdHIoc2VwYXJhdG9yUG9zICsgMSk7XG4gIHJldHVybiBbaWQsIGFjdGlvbl07XG59XG5cbmxldCBfY29udGFpbnM6IChlbG0xOiBhbnksIGVsbTI6IGFueSkgPT4gYm9vbGVhbiA9IChlbG0xOiBhbnksIGVsbTI6IGFueSkgPT4gZmFsc2U7XG5sZXQgX21hdGNoZXM6IChlbGVtZW50OiBhbnksIHNlbGVjdG9yOiBzdHJpbmcpID0+IGJvb2xlYW4gPSAoZWxlbWVudDogYW55LCBzZWxlY3Rvcjogc3RyaW5nKSA9PlxuICAgIGZhbHNlO1xubGV0IF9xdWVyeTogKGVsZW1lbnQ6IGFueSwgc2VsZWN0b3I6IHN0cmluZywgbXVsdGk6IGJvb2xlYW4pID0+IGFueVtdID1cbiAgICAoZWxlbWVudDogYW55LCBzZWxlY3Rvcjogc3RyaW5nLCBtdWx0aTogYm9vbGVhbikgPT4ge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH07XG5cbi8vIERlZmluZSB1dGlsaXR5IG1ldGhvZHMgZm9yIGJyb3dzZXJzIGFuZCBwbGF0Zm9ybS1zZXJ2ZXIoZG9taW5vKSB3aGVyZSBFbGVtZW50XG4vLyBhbmQgdXRpbGl0eSBtZXRob2RzIGV4aXN0LlxuY29uc3QgX2lzTm9kZSA9IGlzTm9kZSgpO1xuaWYgKF9pc05vZGUgfHwgdHlwZW9mIEVsZW1lbnQgIT09ICd1bmRlZmluZWQnKSB7XG4gIC8vIHRoaXMgaXMgd2VsbCBzdXBwb3J0ZWQgaW4gYWxsIGJyb3dzZXJzXG4gIF9jb250YWlucyA9IChlbG0xOiBhbnksIGVsbTI6IGFueSkgPT4geyByZXR1cm4gZWxtMS5jb250YWlucyhlbG0yKSBhcyBib29sZWFuOyB9O1xuXG4gIGlmIChfaXNOb2RlIHx8IEVsZW1lbnQucHJvdG90eXBlLm1hdGNoZXMpIHtcbiAgICBfbWF0Y2hlcyA9IChlbGVtZW50OiBhbnksIHNlbGVjdG9yOiBzdHJpbmcpID0+IGVsZW1lbnQubWF0Y2hlcyhzZWxlY3Rvcik7XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgcHJvdG8gPSBFbGVtZW50LnByb3RvdHlwZSBhcyBhbnk7XG4gICAgY29uc3QgZm4gPSBwcm90by5tYXRjaGVzU2VsZWN0b3IgfHwgcHJvdG8ubW96TWF0Y2hlc1NlbGVjdG9yIHx8IHByb3RvLm1zTWF0Y2hlc1NlbGVjdG9yIHx8XG4gICAgICAgIHByb3RvLm9NYXRjaGVzU2VsZWN0b3IgfHwgcHJvdG8ud2Via2l0TWF0Y2hlc1NlbGVjdG9yO1xuICAgIGlmIChmbikge1xuICAgICAgX21hdGNoZXMgPSAoZWxlbWVudDogYW55LCBzZWxlY3Rvcjogc3RyaW5nKSA9PiBmbi5hcHBseShlbGVtZW50LCBbc2VsZWN0b3JdKTtcbiAgICB9XG4gIH1cblxuICBfcXVlcnkgPSAoZWxlbWVudDogYW55LCBzZWxlY3Rvcjogc3RyaW5nLCBtdWx0aTogYm9vbGVhbik6IGFueVtdID0+IHtcbiAgICBsZXQgcmVzdWx0czogYW55W10gPSBbXTtcbiAgICBpZiAobXVsdGkpIHtcbiAgICAgIHJlc3VsdHMucHVzaCguLi5lbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgZWxtID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICAgIGlmIChlbG0pIHtcbiAgICAgICAgcmVzdWx0cy5wdXNoKGVsbSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9O1xufVxuXG5mdW5jdGlvbiBjb250YWluc1ZlbmRvclByZWZpeChwcm9wOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgLy8gV2Via2l0IGlzIHRoZSBvbmx5IHJlYWwgcG9wdWxhciB2ZW5kb3IgcHJlZml4IG5vd2FkYXlzXG4gIC8vIGNjOiBodHRwOi8vc2hvdWxkaXByZWZpeC5jb20vXG4gIHJldHVybiBwcm9wLnN1YnN0cmluZygxLCA2KSA9PSAnZWJraXQnOyAgLy8gd2Via2l0IG9yIFdlYmtpdFxufVxuXG5sZXQgX0NBQ0hFRF9CT0RZOiB7c3R5bGU6IGFueX18bnVsbCA9IG51bGw7XG5sZXQgX0lTX1dFQktJVCA9IGZhbHNlO1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlU3R5bGVQcm9wZXJ0eShwcm9wOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgaWYgKCFfQ0FDSEVEX0JPRFkpIHtcbiAgICBfQ0FDSEVEX0JPRFkgPSBnZXRCb2R5Tm9kZSgpIHx8IHt9O1xuICAgIF9JU19XRUJLSVQgPSBfQ0FDSEVEX0JPRFkgIS5zdHlsZSA/ICgnV2Via2l0QXBwZWFyYW5jZScgaW4gX0NBQ0hFRF9CT0RZICEuc3R5bGUpIDogZmFsc2U7XG4gIH1cblxuICBsZXQgcmVzdWx0ID0gdHJ1ZTtcbiAgaWYgKF9DQUNIRURfQk9EWSAhLnN0eWxlICYmICFjb250YWluc1ZlbmRvclByZWZpeChwcm9wKSkge1xuICAgIHJlc3VsdCA9IHByb3AgaW4gX0NBQ0hFRF9CT0RZICEuc3R5bGU7XG4gICAgaWYgKCFyZXN1bHQgJiYgX0lTX1dFQktJVCkge1xuICAgICAgY29uc3QgY2FtZWxQcm9wID0gJ1dlYmtpdCcgKyBwcm9wLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcHJvcC5zdWJzdHIoMSk7XG4gICAgICByZXN1bHQgPSBjYW1lbFByb3AgaW4gX0NBQ0hFRF9CT0RZICEuc3R5bGU7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEJvZHlOb2RlKCk6IGFueXxudWxsIHtcbiAgaWYgKHR5cGVvZiBkb2N1bWVudCAhPSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybiBkb2N1bWVudC5ib2R5O1xuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG5leHBvcnQgY29uc3QgbWF0Y2hlc0VsZW1lbnQgPSBfbWF0Y2hlcztcbmV4cG9ydCBjb25zdCBjb250YWluc0VsZW1lbnQgPSBfY29udGFpbnM7XG5leHBvcnQgY29uc3QgaW52b2tlUXVlcnkgPSBfcXVlcnk7XG5cbmV4cG9ydCBmdW5jdGlvbiBoeXBlbmF0ZVByb3BzT2JqZWN0KG9iamVjdDoge1trZXk6IHN0cmluZ106IGFueX0pOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gIGNvbnN0IG5ld09iajoge1trZXk6IHN0cmluZ106IGFueX0gPSB7fTtcbiAgT2JqZWN0LmtleXMob2JqZWN0KS5mb3JFYWNoKHByb3AgPT4ge1xuICAgIGNvbnN0IG5ld1Byb3AgPSBwcm9wLnJlcGxhY2UoLyhbYS16XSkoW0EtWl0pL2csICckMS0kMicpO1xuICAgIG5ld09ialtuZXdQcm9wXSA9IG9iamVjdFtwcm9wXTtcbiAgfSk7XG4gIHJldHVybiBuZXdPYmo7XG59XG4iXX0=