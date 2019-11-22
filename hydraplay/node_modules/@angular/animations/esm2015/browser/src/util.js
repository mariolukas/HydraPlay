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
import { sequence } from '@angular/animations';
import { isNode } from './render/shared';
/** @type {?} */
export const ONE_SECOND = 1000;
/** @type {?} */
export const SUBSTITUTION_EXPR_START = '{{';
/** @type {?} */
export const SUBSTITUTION_EXPR_END = '}}';
/** @type {?} */
export const ENTER_CLASSNAME = 'ng-enter';
/** @type {?} */
export const LEAVE_CLASSNAME = 'ng-leave';
/** @type {?} */
export const ENTER_SELECTOR = '.ng-enter';
/** @type {?} */
export const LEAVE_SELECTOR = '.ng-leave';
/** @type {?} */
export const NG_TRIGGER_CLASSNAME = 'ng-trigger';
/** @type {?} */
export const NG_TRIGGER_SELECTOR = '.ng-trigger';
/** @type {?} */
export const NG_ANIMATING_CLASSNAME = 'ng-animating';
/** @type {?} */
export const NG_ANIMATING_SELECTOR = '.ng-animating';
/**
 * @param {?} value
 * @return {?}
 */
export function resolveTimingValue(value) {
    if (typeof value == 'number')
        return value;
    /** @type {?} */
    const matches = ((/** @type {?} */ (value))).match(/^(-?[\.\d]+)(m?s)/);
    if (!matches || matches.length < 2)
        return 0;
    return _convertTimeValueToMS(parseFloat(matches[1]), matches[2]);
}
/**
 * @param {?} value
 * @param {?} unit
 * @return {?}
 */
function _convertTimeValueToMS(value, unit) {
    switch (unit) {
        case 's':
            return value * ONE_SECOND;
        default: // ms or something else
            return value;
    }
}
/**
 * @param {?} timings
 * @param {?} errors
 * @param {?=} allowNegativeValues
 * @return {?}
 */
export function resolveTiming(timings, errors, allowNegativeValues) {
    return timings.hasOwnProperty('duration') ?
        (/** @type {?} */ (timings)) :
        parseTimeExpression((/** @type {?} */ (timings)), errors, allowNegativeValues);
}
/**
 * @param {?} exp
 * @param {?} errors
 * @param {?=} allowNegativeValues
 * @return {?}
 */
function parseTimeExpression(exp, errors, allowNegativeValues) {
    /** @type {?} */
    const regex = /^(-?[\.\d]+)(m?s)(?:\s+(-?[\.\d]+)(m?s))?(?:\s+([-a-z]+(?:\(.+?\))?))?$/i;
    /** @type {?} */
    let duration;
    /** @type {?} */
    let delay = 0;
    /** @type {?} */
    let easing = '';
    if (typeof exp === 'string') {
        /** @type {?} */
        const matches = exp.match(regex);
        if (matches === null) {
            errors.push(`The provided timing value "${exp}" is invalid.`);
            return { duration: 0, delay: 0, easing: '' };
        }
        duration = _convertTimeValueToMS(parseFloat(matches[1]), matches[2]);
        /** @type {?} */
        const delayMatch = matches[3];
        if (delayMatch != null) {
            delay = _convertTimeValueToMS(parseFloat(delayMatch), matches[4]);
        }
        /** @type {?} */
        const easingVal = matches[5];
        if (easingVal) {
            easing = easingVal;
        }
    }
    else {
        duration = (/** @type {?} */ (exp));
    }
    if (!allowNegativeValues) {
        /** @type {?} */
        let containsErrors = false;
        /** @type {?} */
        let startIndex = errors.length;
        if (duration < 0) {
            errors.push(`Duration values below 0 are not allowed for this animation step.`);
            containsErrors = true;
        }
        if (delay < 0) {
            errors.push(`Delay values below 0 are not allowed for this animation step.`);
            containsErrors = true;
        }
        if (containsErrors) {
            errors.splice(startIndex, 0, `The provided timing value "${exp}" is invalid.`);
        }
    }
    return { duration, delay, easing };
}
/**
 * @param {?} obj
 * @param {?=} destination
 * @return {?}
 */
export function copyObj(obj, destination = {}) {
    Object.keys(obj).forEach(prop => { destination[prop] = obj[prop]; });
    return destination;
}
/**
 * @param {?} styles
 * @return {?}
 */
export function normalizeStyles(styles) {
    /** @type {?} */
    const normalizedStyles = {};
    if (Array.isArray(styles)) {
        styles.forEach(data => copyStyles(data, false, normalizedStyles));
    }
    else {
        copyStyles(styles, false, normalizedStyles);
    }
    return normalizedStyles;
}
/**
 * @param {?} styles
 * @param {?} readPrototype
 * @param {?=} destination
 * @return {?}
 */
export function copyStyles(styles, readPrototype, destination = {}) {
    if (readPrototype) {
        // we make use of a for-in loop so that the
        // prototypically inherited properties are
        // revealed from the backFill map
        for (let prop in styles) {
            destination[prop] = styles[prop];
        }
    }
    else {
        copyObj(styles, destination);
    }
    return destination;
}
/**
 * @param {?} element
 * @param {?} key
 * @param {?} value
 * @return {?}
 */
function getStyleAttributeString(element, key, value) {
    // Return the key-value pair string to be added to the style attribute for the
    // given CSS style key.
    if (value) {
        return key + ':' + value + ';';
    }
    else {
        return '';
    }
}
/**
 * @param {?} element
 * @return {?}
 */
function writeStyleAttribute(element) {
    // Read the style property of the element and manually reflect it to the
    // style attribute. This is needed because Domino on platform-server doesn't
    // understand the full set of allowed CSS properties and doesn't reflect some
    // of them automatically.
    /** @type {?} */
    let styleAttrValue = '';
    for (let i = 0; i < element.style.length; i++) {
        /** @type {?} */
        const key = element.style.item(i);
        styleAttrValue += getStyleAttributeString(element, key, element.style.getPropertyValue(key));
    }
    for (const key in element.style) {
        // Skip internal Domino properties that don't need to be reflected.
        if (!element.style.hasOwnProperty(key) || key.startsWith('_')) {
            continue;
        }
        /** @type {?} */
        const dashKey = camelCaseToDashCase(key);
        styleAttrValue += getStyleAttributeString(element, dashKey, element.style[key]);
    }
    element.setAttribute('style', styleAttrValue);
}
/**
 * @param {?} element
 * @param {?} styles
 * @param {?=} formerStyles
 * @return {?}
 */
export function setStyles(element, styles, formerStyles) {
    if (element['style']) {
        Object.keys(styles).forEach(prop => {
            /** @type {?} */
            const camelProp = dashCaseToCamelCase(prop);
            if (formerStyles && !formerStyles.hasOwnProperty(prop)) {
                formerStyles[prop] = element.style[camelProp];
            }
            element.style[camelProp] = styles[prop];
        });
        // On the server set the 'style' attribute since it's not automatically reflected.
        if (isNode()) {
            writeStyleAttribute(element);
        }
    }
}
/**
 * @param {?} element
 * @param {?} styles
 * @return {?}
 */
export function eraseStyles(element, styles) {
    if (element['style']) {
        Object.keys(styles).forEach(prop => {
            /** @type {?} */
            const camelProp = dashCaseToCamelCase(prop);
            element.style[camelProp] = '';
        });
        // On the server set the 'style' attribute since it's not automatically reflected.
        if (isNode()) {
            writeStyleAttribute(element);
        }
    }
}
/**
 * @param {?} steps
 * @return {?}
 */
export function normalizeAnimationEntry(steps) {
    if (Array.isArray(steps)) {
        if (steps.length == 1)
            return steps[0];
        return sequence(steps);
    }
    return (/** @type {?} */ (steps));
}
/**
 * @param {?} value
 * @param {?} options
 * @param {?} errors
 * @return {?}
 */
export function validateStyleParams(value, options, errors) {
    /** @type {?} */
    const params = options.params || {};
    /** @type {?} */
    const matches = extractStyleParams(value);
    if (matches.length) {
        matches.forEach(varName => {
            if (!params.hasOwnProperty(varName)) {
                errors.push(`Unable to resolve the local animation param ${varName} in the given list of values`);
            }
        });
    }
}
/** @type {?} */
const PARAM_REGEX = new RegExp(`${SUBSTITUTION_EXPR_START}\\s*(.+?)\\s*${SUBSTITUTION_EXPR_END}`, 'g');
/**
 * @param {?} value
 * @return {?}
 */
export function extractStyleParams(value) {
    /** @type {?} */
    let params = [];
    if (typeof value === 'string') {
        /** @type {?} */
        const val = value.toString();
        /** @type {?} */
        let match;
        while (match = PARAM_REGEX.exec(val)) {
            params.push((/** @type {?} */ (match[1])));
        }
        PARAM_REGEX.lastIndex = 0;
    }
    return params;
}
/**
 * @param {?} value
 * @param {?} params
 * @param {?} errors
 * @return {?}
 */
export function interpolateParams(value, params, errors) {
    /** @type {?} */
    const original = value.toString();
    /** @type {?} */
    const str = original.replace(PARAM_REGEX, (_, varName) => {
        /** @type {?} */
        let localVal = params[varName];
        // this means that the value was never overridden by the data passed in by the user
        if (!params.hasOwnProperty(varName)) {
            errors.push(`Please provide a value for the animation param ${varName}`);
            localVal = '';
        }
        return localVal.toString();
    });
    // we do this to assert that numeric values stay as they are
    return str == original ? value : str;
}
/**
 * @param {?} iterator
 * @return {?}
 */
export function iteratorToArray(iterator) {
    /** @type {?} */
    const arr = [];
    /** @type {?} */
    let item = iterator.next();
    while (!item.done) {
        arr.push(item.value);
        item = iterator.next();
    }
    return arr;
}
/**
 * @param {?} source
 * @param {?} destination
 * @return {?}
 */
export function mergeAnimationOptions(source, destination) {
    if (source.params) {
        /** @type {?} */
        const p0 = source.params;
        if (!destination.params) {
            destination.params = {};
        }
        /** @type {?} */
        const p1 = destination.params;
        Object.keys(p0).forEach(param => {
            if (!p1.hasOwnProperty(param)) {
                p1[param] = p0[param];
            }
        });
    }
    return destination;
}
/** @type {?} */
const DASH_CASE_REGEXP = /-+([a-z0-9])/g;
/**
 * @param {?} input
 * @return {?}
 */
export function dashCaseToCamelCase(input) {
    return input.replace(DASH_CASE_REGEXP, (...m) => m[1].toUpperCase());
}
/**
 * @param {?} input
 * @return {?}
 */
function camelCaseToDashCase(input) {
    return input.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}
/**
 * @param {?} duration
 * @param {?} delay
 * @return {?}
 */
export function allowPreviousPlayerStylesMerge(duration, delay) {
    return duration === 0 || delay === 0;
}
/**
 * @param {?} element
 * @param {?} keyframes
 * @param {?} previousStyles
 * @return {?}
 */
export function balancePreviousStylesIntoKeyframes(element, keyframes, previousStyles) {
    /** @type {?} */
    const previousStyleProps = Object.keys(previousStyles);
    if (previousStyleProps.length && keyframes.length) {
        /** @type {?} */
        let startingKeyframe = keyframes[0];
        /** @type {?} */
        let missingStyleProps = [];
        previousStyleProps.forEach(prop => {
            if (!startingKeyframe.hasOwnProperty(prop)) {
                missingStyleProps.push(prop);
            }
            startingKeyframe[prop] = previousStyles[prop];
        });
        if (missingStyleProps.length) {
            // tslint:disable-next-line
            for (var i = 1; i < keyframes.length; i++) {
                /** @type {?} */
                let kf = keyframes[i];
                missingStyleProps.forEach(function (prop) { kf[prop] = computeStyle(element, prop); });
            }
        }
    }
    return keyframes;
}
/**
 * @param {?} visitor
 * @param {?} node
 * @param {?} context
 * @return {?}
 */
export function visitDslNode(visitor, node, context) {
    switch (node.type) {
        case 7 /* Trigger */:
            return visitor.visitTrigger(node, context);
        case 0 /* State */:
            return visitor.visitState(node, context);
        case 1 /* Transition */:
            return visitor.visitTransition(node, context);
        case 2 /* Sequence */:
            return visitor.visitSequence(node, context);
        case 3 /* Group */:
            return visitor.visitGroup(node, context);
        case 4 /* Animate */:
            return visitor.visitAnimate(node, context);
        case 5 /* Keyframes */:
            return visitor.visitKeyframes(node, context);
        case 6 /* Style */:
            return visitor.visitStyle(node, context);
        case 8 /* Reference */:
            return visitor.visitReference(node, context);
        case 9 /* AnimateChild */:
            return visitor.visitAnimateChild(node, context);
        case 10 /* AnimateRef */:
            return visitor.visitAnimateRef(node, context);
        case 11 /* Query */:
            return visitor.visitQuery(node, context);
        case 12 /* Stagger */:
            return visitor.visitStagger(node, context);
        default:
            throw new Error(`Unable to resolve animation metadata node #${node.type}`);
    }
}
/**
 * @param {?} element
 * @param {?} prop
 * @return {?}
 */
export function computeStyle(element, prop) {
    return ((/** @type {?} */ (window.getComputedStyle(element))))[prop];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuaW1hdGlvbnMvYnJvd3Nlci9zcmMvdXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQU9BLE9BQU8sRUFBNkUsUUFBUSxFQUFhLE1BQU0scUJBQXFCLENBQUM7QUFHckksT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLGlCQUFpQixDQUFDOztBQUV2QyxNQUFNLE9BQU8sVUFBVSxHQUFHLElBQUk7O0FBRTlCLE1BQU0sT0FBTyx1QkFBdUIsR0FBRyxJQUFJOztBQUMzQyxNQUFNLE9BQU8scUJBQXFCLEdBQUcsSUFBSTs7QUFDekMsTUFBTSxPQUFPLGVBQWUsR0FBRyxVQUFVOztBQUN6QyxNQUFNLE9BQU8sZUFBZSxHQUFHLFVBQVU7O0FBQ3pDLE1BQU0sT0FBTyxjQUFjLEdBQUcsV0FBVzs7QUFDekMsTUFBTSxPQUFPLGNBQWMsR0FBRyxXQUFXOztBQUN6QyxNQUFNLE9BQU8sb0JBQW9CLEdBQUcsWUFBWTs7QUFDaEQsTUFBTSxPQUFPLG1CQUFtQixHQUFHLGFBQWE7O0FBQ2hELE1BQU0sT0FBTyxzQkFBc0IsR0FBRyxjQUFjOztBQUNwRCxNQUFNLE9BQU8scUJBQXFCLEdBQUcsZUFBZTs7Ozs7QUFFcEQsTUFBTSxVQUFVLGtCQUFrQixDQUFDLEtBQXNCO0lBQ3ZELElBQUksT0FBTyxLQUFLLElBQUksUUFBUTtRQUFFLE9BQU8sS0FBSyxDQUFDOztVQUVyQyxPQUFPLEdBQUcsQ0FBQyxtQkFBQSxLQUFLLEVBQVUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQztJQUM1RCxJQUFJLENBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQztRQUFFLE9BQU8sQ0FBQyxDQUFDO0lBRTdDLE9BQU8scUJBQXFCLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLE9B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QVksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDN0M7WUFDRSxPQUFPLE9BQU8sQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQy9DO1lBQ0UsT0FBTyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUMzQztZQUNFLE9BQU8sT0FBTyxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDL0M7WUFDRSxPQUFPLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDbEQ7WUFDRSxPQUFPLE9BQU8sQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ2hEO1lBQ0UsT0FBTyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUMzQztZQUNFLE9BQU8sT0FBTyxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDN0M7WUFDRSxNQUFNLElBQUksS0FBSyxDQUFDLDhDQUE4QyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztLQUM5RTtBQUNILENBQUM7Ozs7OztBQUVELE1BQU0sVUFBVSxZQUFZLENBQUMsT0FBWSxFQUFFLElBQVk7SUFDckQsT0FBTyxDQUFDLG1CQUFLLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsRUFBQSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDdkQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7QW5pbWF0ZVRpbWluZ3MsIEFuaW1hdGlvbk1ldGFkYXRhLCBBbmltYXRpb25NZXRhZGF0YVR5cGUsIEFuaW1hdGlvbk9wdGlvbnMsIHNlcXVlbmNlLCDJtVN0eWxlRGF0YX0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG5pbXBvcnQge0FzdCBhcyBBbmltYXRpb25Bc3QsIEFzdFZpc2l0b3IgYXMgQW5pbWF0aW9uQXN0VmlzaXRvcn0gZnJvbSAnLi9kc2wvYW5pbWF0aW9uX2FzdCc7XG5pbXBvcnQge0FuaW1hdGlvbkRzbFZpc2l0b3J9IGZyb20gJy4vZHNsL2FuaW1hdGlvbl9kc2xfdmlzaXRvcic7XG5pbXBvcnQge2lzTm9kZX0gZnJvbSAnLi9yZW5kZXIvc2hhcmVkJztcblxuZXhwb3J0IGNvbnN0IE9ORV9TRUNPTkQgPSAxMDAwO1xuXG5leHBvcnQgY29uc3QgU1VCU1RJVFVUSU9OX0VYUFJfU1RBUlQgPSAne3snO1xuZXhwb3J0IGNvbnN0IFNVQlNUSVRVVElPTl9FWFBSX0VORCA9ICd9fSc7XG5leHBvcnQgY29uc3QgRU5URVJfQ0xBU1NOQU1FID0gJ25nLWVudGVyJztcbmV4cG9ydCBjb25zdCBMRUFWRV9DTEFTU05BTUUgPSAnbmctbGVhdmUnO1xuZXhwb3J0IGNvbnN0IEVOVEVSX1NFTEVDVE9SID0gJy5uZy1lbnRlcic7XG5leHBvcnQgY29uc3QgTEVBVkVfU0VMRUNUT1IgPSAnLm5nLWxlYXZlJztcbmV4cG9ydCBjb25zdCBOR19UUklHR0VSX0NMQVNTTkFNRSA9ICduZy10cmlnZ2VyJztcbmV4cG9ydCBjb25zdCBOR19UUklHR0VSX1NFTEVDVE9SID0gJy5uZy10cmlnZ2VyJztcbmV4cG9ydCBjb25zdCBOR19BTklNQVRJTkdfQ0xBU1NOQU1FID0gJ25nLWFuaW1hdGluZyc7XG5leHBvcnQgY29uc3QgTkdfQU5JTUFUSU5HX1NFTEVDVE9SID0gJy5uZy1hbmltYXRpbmcnO1xuXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZVRpbWluZ1ZhbHVlKHZhbHVlOiBzdHJpbmcgfCBudW1iZXIpIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PSAnbnVtYmVyJykgcmV0dXJuIHZhbHVlO1xuXG4gIGNvbnN0IG1hdGNoZXMgPSAodmFsdWUgYXMgc3RyaW5nKS5tYXRjaCgvXigtP1tcXC5cXGRdKykobT9zKS8pO1xuICBpZiAoIW1hdGNoZXMgfHwgbWF0Y2hlcy5sZW5ndGggPCAyKSByZXR1cm4gMDtcblxuICByZXR1cm4gX2NvbnZlcnRUaW1lVmFsdWVUb01TKHBhcnNlRmxvYXQobWF0Y2hlc1sxXSksIG1hdGNoZXNbMl0pO1xufVxuXG5mdW5jdGlvbiBfY29udmVydFRpbWVWYWx1ZVRvTVModmFsdWU6IG51bWJlciwgdW5pdDogc3RyaW5nKTogbnVtYmVyIHtcbiAgc3dpdGNoICh1bml0KSB7XG4gICAgY2FzZSAncyc6XG4gICAgICByZXR1cm4gdmFsdWUgKiBPTkVfU0VDT05EO1xuICAgIGRlZmF1bHQ6ICAvLyBtcyBvciBzb21ldGhpbmcgZWxzZVxuICAgICAgcmV0dXJuIHZhbHVlO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlVGltaW5nKFxuICAgIHRpbWluZ3M6IHN0cmluZyB8IG51bWJlciB8IEFuaW1hdGVUaW1pbmdzLCBlcnJvcnM6IGFueVtdLCBhbGxvd05lZ2F0aXZlVmFsdWVzPzogYm9vbGVhbikge1xuICByZXR1cm4gdGltaW5ncy5oYXNPd25Qcm9wZXJ0eSgnZHVyYXRpb24nKSA/XG4gICAgICA8QW5pbWF0ZVRpbWluZ3M+dGltaW5ncyA6XG4gICAgICBwYXJzZVRpbWVFeHByZXNzaW9uKDxzdHJpbmd8bnVtYmVyPnRpbWluZ3MsIGVycm9ycywgYWxsb3dOZWdhdGl2ZVZhbHVlcyk7XG59XG5cbmZ1bmN0aW9uIHBhcnNlVGltZUV4cHJlc3Npb24oXG4gICAgZXhwOiBzdHJpbmcgfCBudW1iZXIsIGVycm9yczogc3RyaW5nW10sIGFsbG93TmVnYXRpdmVWYWx1ZXM/OiBib29sZWFuKTogQW5pbWF0ZVRpbWluZ3Mge1xuICBjb25zdCByZWdleCA9IC9eKC0/W1xcLlxcZF0rKShtP3MpKD86XFxzKygtP1tcXC5cXGRdKykobT9zKSk/KD86XFxzKyhbLWEtel0rKD86XFwoLis/XFwpKT8pKT8kL2k7XG4gIGxldCBkdXJhdGlvbjogbnVtYmVyO1xuICBsZXQgZGVsYXk6IG51bWJlciA9IDA7XG4gIGxldCBlYXNpbmc6IHN0cmluZyA9ICcnO1xuICBpZiAodHlwZW9mIGV4cCA9PT0gJ3N0cmluZycpIHtcbiAgICBjb25zdCBtYXRjaGVzID0gZXhwLm1hdGNoKHJlZ2V4KTtcbiAgICBpZiAobWF0Y2hlcyA9PT0gbnVsbCkge1xuICAgICAgZXJyb3JzLnB1c2goYFRoZSBwcm92aWRlZCB0aW1pbmcgdmFsdWUgXCIke2V4cH1cIiBpcyBpbnZhbGlkLmApO1xuICAgICAgcmV0dXJuIHtkdXJhdGlvbjogMCwgZGVsYXk6IDAsIGVhc2luZzogJyd9O1xuICAgIH1cblxuICAgIGR1cmF0aW9uID0gX2NvbnZlcnRUaW1lVmFsdWVUb01TKHBhcnNlRmxvYXQobWF0Y2hlc1sxXSksIG1hdGNoZXNbMl0pO1xuXG4gICAgY29uc3QgZGVsYXlNYXRjaCA9IG1hdGNoZXNbM107XG4gICAgaWYgKGRlbGF5TWF0Y2ggIT0gbnVsbCkge1xuICAgICAgZGVsYXkgPSBfY29udmVydFRpbWVWYWx1ZVRvTVMocGFyc2VGbG9hdChkZWxheU1hdGNoKSwgbWF0Y2hlc1s0XSk7XG4gICAgfVxuXG4gICAgY29uc3QgZWFzaW5nVmFsID0gbWF0Y2hlc1s1XTtcbiAgICBpZiAoZWFzaW5nVmFsKSB7XG4gICAgICBlYXNpbmcgPSBlYXNpbmdWYWw7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGR1cmF0aW9uID0gPG51bWJlcj5leHA7XG4gIH1cblxuICBpZiAoIWFsbG93TmVnYXRpdmVWYWx1ZXMpIHtcbiAgICBsZXQgY29udGFpbnNFcnJvcnMgPSBmYWxzZTtcbiAgICBsZXQgc3RhcnRJbmRleCA9IGVycm9ycy5sZW5ndGg7XG4gICAgaWYgKGR1cmF0aW9uIDwgMCkge1xuICAgICAgZXJyb3JzLnB1c2goYER1cmF0aW9uIHZhbHVlcyBiZWxvdyAwIGFyZSBub3QgYWxsb3dlZCBmb3IgdGhpcyBhbmltYXRpb24gc3RlcC5gKTtcbiAgICAgIGNvbnRhaW5zRXJyb3JzID0gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKGRlbGF5IDwgMCkge1xuICAgICAgZXJyb3JzLnB1c2goYERlbGF5IHZhbHVlcyBiZWxvdyAwIGFyZSBub3QgYWxsb3dlZCBmb3IgdGhpcyBhbmltYXRpb24gc3RlcC5gKTtcbiAgICAgIGNvbnRhaW5zRXJyb3JzID0gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKGNvbnRhaW5zRXJyb3JzKSB7XG4gICAgICBlcnJvcnMuc3BsaWNlKHN0YXJ0SW5kZXgsIDAsIGBUaGUgcHJvdmlkZWQgdGltaW5nIHZhbHVlIFwiJHtleHB9XCIgaXMgaW52YWxpZC5gKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4ge2R1cmF0aW9uLCBkZWxheSwgZWFzaW5nfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvcHlPYmooXG4gICAgb2JqOiB7W2tleTogc3RyaW5nXTogYW55fSwgZGVzdGluYXRpb246IHtba2V5OiBzdHJpbmddOiBhbnl9ID0ge30pOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gIE9iamVjdC5rZXlzKG9iaikuZm9yRWFjaChwcm9wID0+IHsgZGVzdGluYXRpb25bcHJvcF0gPSBvYmpbcHJvcF07IH0pO1xuICByZXR1cm4gZGVzdGluYXRpb247XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVTdHlsZXMoc3R5bGVzOiDJtVN0eWxlRGF0YSB8IMm1U3R5bGVEYXRhW10pOiDJtVN0eWxlRGF0YSB7XG4gIGNvbnN0IG5vcm1hbGl6ZWRTdHlsZXM6IMm1U3R5bGVEYXRhID0ge307XG4gIGlmIChBcnJheS5pc0FycmF5KHN0eWxlcykpIHtcbiAgICBzdHlsZXMuZm9yRWFjaChkYXRhID0+IGNvcHlTdHlsZXMoZGF0YSwgZmFsc2UsIG5vcm1hbGl6ZWRTdHlsZXMpKTtcbiAgfSBlbHNlIHtcbiAgICBjb3B5U3R5bGVzKHN0eWxlcywgZmFsc2UsIG5vcm1hbGl6ZWRTdHlsZXMpO1xuICB9XG4gIHJldHVybiBub3JtYWxpemVkU3R5bGVzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29weVN0eWxlcyhcbiAgICBzdHlsZXM6IMm1U3R5bGVEYXRhLCByZWFkUHJvdG90eXBlOiBib29sZWFuLCBkZXN0aW5hdGlvbjogybVTdHlsZURhdGEgPSB7fSk6IMm1U3R5bGVEYXRhIHtcbiAgaWYgKHJlYWRQcm90b3R5cGUpIHtcbiAgICAvLyB3ZSBtYWtlIHVzZSBvZiBhIGZvci1pbiBsb29wIHNvIHRoYXQgdGhlXG4gICAgLy8gcHJvdG90eXBpY2FsbHkgaW5oZXJpdGVkIHByb3BlcnRpZXMgYXJlXG4gICAgLy8gcmV2ZWFsZWQgZnJvbSB0aGUgYmFja0ZpbGwgbWFwXG4gICAgZm9yIChsZXQgcHJvcCBpbiBzdHlsZXMpIHtcbiAgICAgIGRlc3RpbmF0aW9uW3Byb3BdID0gc3R5bGVzW3Byb3BdO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBjb3B5T2JqKHN0eWxlcywgZGVzdGluYXRpb24pO1xuICB9XG4gIHJldHVybiBkZXN0aW5hdGlvbjtcbn1cblxuZnVuY3Rpb24gZ2V0U3R5bGVBdHRyaWJ1dGVTdHJpbmcoZWxlbWVudDogYW55LCBrZXk6IHN0cmluZywgdmFsdWU6IHN0cmluZykge1xuICAvLyBSZXR1cm4gdGhlIGtleS12YWx1ZSBwYWlyIHN0cmluZyB0byBiZSBhZGRlZCB0byB0aGUgc3R5bGUgYXR0cmlidXRlIGZvciB0aGVcbiAgLy8gZ2l2ZW4gQ1NTIHN0eWxlIGtleS5cbiAgaWYgKHZhbHVlKSB7XG4gICAgcmV0dXJuIGtleSArICc6JyArIHZhbHVlICsgJzsnO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiAnJztcbiAgfVxufVxuXG5mdW5jdGlvbiB3cml0ZVN0eWxlQXR0cmlidXRlKGVsZW1lbnQ6IGFueSkge1xuICAvLyBSZWFkIHRoZSBzdHlsZSBwcm9wZXJ0eSBvZiB0aGUgZWxlbWVudCBhbmQgbWFudWFsbHkgcmVmbGVjdCBpdCB0byB0aGVcbiAgLy8gc3R5bGUgYXR0cmlidXRlLiBUaGlzIGlzIG5lZWRlZCBiZWNhdXNlIERvbWlubyBvbiBwbGF0Zm9ybS1zZXJ2ZXIgZG9lc24ndFxuICAvLyB1bmRlcnN0YW5kIHRoZSBmdWxsIHNldCBvZiBhbGxvd2VkIENTUyBwcm9wZXJ0aWVzIGFuZCBkb2Vzbid0IHJlZmxlY3Qgc29tZVxuICAvLyBvZiB0aGVtIGF1dG9tYXRpY2FsbHkuXG4gIGxldCBzdHlsZUF0dHJWYWx1ZSA9ICcnO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGVsZW1lbnQuc3R5bGUubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBrZXkgPSBlbGVtZW50LnN0eWxlLml0ZW0oaSk7XG4gICAgc3R5bGVBdHRyVmFsdWUgKz0gZ2V0U3R5bGVBdHRyaWJ1dGVTdHJpbmcoZWxlbWVudCwga2V5LCBlbGVtZW50LnN0eWxlLmdldFByb3BlcnR5VmFsdWUoa2V5KSk7XG4gIH1cbiAgZm9yIChjb25zdCBrZXkgaW4gZWxlbWVudC5zdHlsZSkge1xuICAgIC8vIFNraXAgaW50ZXJuYWwgRG9taW5vIHByb3BlcnRpZXMgdGhhdCBkb24ndCBuZWVkIHRvIGJlIHJlZmxlY3RlZC5cbiAgICBpZiAoIWVsZW1lbnQuc3R5bGUuaGFzT3duUHJvcGVydHkoa2V5KSB8fCBrZXkuc3RhcnRzV2l0aCgnXycpKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgY29uc3QgZGFzaEtleSA9IGNhbWVsQ2FzZVRvRGFzaENhc2Uoa2V5KTtcbiAgICBzdHlsZUF0dHJWYWx1ZSArPSBnZXRTdHlsZUF0dHJpYnV0ZVN0cmluZyhlbGVtZW50LCBkYXNoS2V5LCBlbGVtZW50LnN0eWxlW2tleV0pO1xuICB9XG4gIGVsZW1lbnQuc2V0QXR0cmlidXRlKCdzdHlsZScsIHN0eWxlQXR0clZhbHVlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldFN0eWxlcyhlbGVtZW50OiBhbnksIHN0eWxlczogybVTdHlsZURhdGEsIGZvcm1lclN0eWxlcz86IHtba2V5OiBzdHJpbmddOiBhbnl9KSB7XG4gIGlmIChlbGVtZW50WydzdHlsZSddKSB7XG4gICAgT2JqZWN0LmtleXMoc3R5bGVzKS5mb3JFYWNoKHByb3AgPT4ge1xuICAgICAgY29uc3QgY2FtZWxQcm9wID0gZGFzaENhc2VUb0NhbWVsQ2FzZShwcm9wKTtcbiAgICAgIGlmIChmb3JtZXJTdHlsZXMgJiYgIWZvcm1lclN0eWxlcy5oYXNPd25Qcm9wZXJ0eShwcm9wKSkge1xuICAgICAgICBmb3JtZXJTdHlsZXNbcHJvcF0gPSBlbGVtZW50LnN0eWxlW2NhbWVsUHJvcF07XG4gICAgICB9XG4gICAgICBlbGVtZW50LnN0eWxlW2NhbWVsUHJvcF0gPSBzdHlsZXNbcHJvcF07XG4gICAgfSk7XG4gICAgLy8gT24gdGhlIHNlcnZlciBzZXQgdGhlICdzdHlsZScgYXR0cmlidXRlIHNpbmNlIGl0J3Mgbm90IGF1dG9tYXRpY2FsbHkgcmVmbGVjdGVkLlxuICAgIGlmIChpc05vZGUoKSkge1xuICAgICAgd3JpdGVTdHlsZUF0dHJpYnV0ZShlbGVtZW50KTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVyYXNlU3R5bGVzKGVsZW1lbnQ6IGFueSwgc3R5bGVzOiDJtVN0eWxlRGF0YSkge1xuICBpZiAoZWxlbWVudFsnc3R5bGUnXSkge1xuICAgIE9iamVjdC5rZXlzKHN0eWxlcykuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgIGNvbnN0IGNhbWVsUHJvcCA9IGRhc2hDYXNlVG9DYW1lbENhc2UocHJvcCk7XG4gICAgICBlbGVtZW50LnN0eWxlW2NhbWVsUHJvcF0gPSAnJztcbiAgICB9KTtcbiAgICAvLyBPbiB0aGUgc2VydmVyIHNldCB0aGUgJ3N0eWxlJyBhdHRyaWJ1dGUgc2luY2UgaXQncyBub3QgYXV0b21hdGljYWxseSByZWZsZWN0ZWQuXG4gICAgaWYgKGlzTm9kZSgpKSB7XG4gICAgICB3cml0ZVN0eWxlQXR0cmlidXRlKGVsZW1lbnQpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplQW5pbWF0aW9uRW50cnkoc3RlcHM6IEFuaW1hdGlvbk1ldGFkYXRhIHwgQW5pbWF0aW9uTWV0YWRhdGFbXSk6XG4gICAgQW5pbWF0aW9uTWV0YWRhdGEge1xuICBpZiAoQXJyYXkuaXNBcnJheShzdGVwcykpIHtcbiAgICBpZiAoc3RlcHMubGVuZ3RoID09IDEpIHJldHVybiBzdGVwc1swXTtcbiAgICByZXR1cm4gc2VxdWVuY2Uoc3RlcHMpO1xuICB9XG4gIHJldHVybiBzdGVwcyBhcyBBbmltYXRpb25NZXRhZGF0YTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlU3R5bGVQYXJhbXMoXG4gICAgdmFsdWU6IHN0cmluZyB8IG51bWJlciwgb3B0aW9uczogQW5pbWF0aW9uT3B0aW9ucywgZXJyb3JzOiBhbnlbXSkge1xuICBjb25zdCBwYXJhbXMgPSBvcHRpb25zLnBhcmFtcyB8fCB7fTtcbiAgY29uc3QgbWF0Y2hlcyA9IGV4dHJhY3RTdHlsZVBhcmFtcyh2YWx1ZSk7XG4gIGlmIChtYXRjaGVzLmxlbmd0aCkge1xuICAgIG1hdGNoZXMuZm9yRWFjaCh2YXJOYW1lID0+IHtcbiAgICAgIGlmICghcGFyYW1zLmhhc093blByb3BlcnR5KHZhck5hbWUpKSB7XG4gICAgICAgIGVycm9ycy5wdXNoKFxuICAgICAgICAgICAgYFVuYWJsZSB0byByZXNvbHZlIHRoZSBsb2NhbCBhbmltYXRpb24gcGFyYW0gJHt2YXJOYW1lfSBpbiB0aGUgZ2l2ZW4gbGlzdCBvZiB2YWx1ZXNgKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuXG5jb25zdCBQQVJBTV9SRUdFWCA9XG4gICAgbmV3IFJlZ0V4cChgJHtTVUJTVElUVVRJT05fRVhQUl9TVEFSVH1cXFxccyooLis/KVxcXFxzKiR7U1VCU1RJVFVUSU9OX0VYUFJfRU5EfWAsICdnJyk7XG5leHBvcnQgZnVuY3Rpb24gZXh0cmFjdFN0eWxlUGFyYW1zKHZhbHVlOiBzdHJpbmcgfCBudW1iZXIpOiBzdHJpbmdbXSB7XG4gIGxldCBwYXJhbXM6IHN0cmluZ1tdID0gW107XG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgY29uc3QgdmFsID0gdmFsdWUudG9TdHJpbmcoKTtcblxuICAgIGxldCBtYXRjaDogYW55O1xuICAgIHdoaWxlIChtYXRjaCA9IFBBUkFNX1JFR0VYLmV4ZWModmFsKSkge1xuICAgICAgcGFyYW1zLnB1c2gobWF0Y2hbMV0gYXMgc3RyaW5nKTtcbiAgICB9XG4gICAgUEFSQU1fUkVHRVgubGFzdEluZGV4ID0gMDtcbiAgfVxuICByZXR1cm4gcGFyYW1zO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW50ZXJwb2xhdGVQYXJhbXMoXG4gICAgdmFsdWU6IHN0cmluZyB8IG51bWJlciwgcGFyYW1zOiB7W25hbWU6IHN0cmluZ106IGFueX0sIGVycm9yczogYW55W10pOiBzdHJpbmd8bnVtYmVyIHtcbiAgY29uc3Qgb3JpZ2luYWwgPSB2YWx1ZS50b1N0cmluZygpO1xuICBjb25zdCBzdHIgPSBvcmlnaW5hbC5yZXBsYWNlKFBBUkFNX1JFR0VYLCAoXywgdmFyTmFtZSkgPT4ge1xuICAgIGxldCBsb2NhbFZhbCA9IHBhcmFtc1t2YXJOYW1lXTtcbiAgICAvLyB0aGlzIG1lYW5zIHRoYXQgdGhlIHZhbHVlIHdhcyBuZXZlciBvdmVycmlkZGVuIGJ5IHRoZSBkYXRhIHBhc3NlZCBpbiBieSB0aGUgdXNlclxuICAgIGlmICghcGFyYW1zLmhhc093blByb3BlcnR5KHZhck5hbWUpKSB7XG4gICAgICBlcnJvcnMucHVzaChgUGxlYXNlIHByb3ZpZGUgYSB2YWx1ZSBmb3IgdGhlIGFuaW1hdGlvbiBwYXJhbSAke3Zhck5hbWV9YCk7XG4gICAgICBsb2NhbFZhbCA9ICcnO1xuICAgIH1cbiAgICByZXR1cm4gbG9jYWxWYWwudG9TdHJpbmcoKTtcbiAgfSk7XG5cbiAgLy8gd2UgZG8gdGhpcyB0byBhc3NlcnQgdGhhdCBudW1lcmljIHZhbHVlcyBzdGF5IGFzIHRoZXkgYXJlXG4gIHJldHVybiBzdHIgPT0gb3JpZ2luYWwgPyB2YWx1ZSA6IHN0cjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGl0ZXJhdG9yVG9BcnJheShpdGVyYXRvcjogYW55KTogYW55W10ge1xuICBjb25zdCBhcnI6IGFueVtdID0gW107XG4gIGxldCBpdGVtID0gaXRlcmF0b3IubmV4dCgpO1xuICB3aGlsZSAoIWl0ZW0uZG9uZSkge1xuICAgIGFyci5wdXNoKGl0ZW0udmFsdWUpO1xuICAgIGl0ZW0gPSBpdGVyYXRvci5uZXh0KCk7XG4gIH1cbiAgcmV0dXJuIGFycjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlQW5pbWF0aW9uT3B0aW9ucyhcbiAgICBzb3VyY2U6IEFuaW1hdGlvbk9wdGlvbnMsIGRlc3RpbmF0aW9uOiBBbmltYXRpb25PcHRpb25zKTogQW5pbWF0aW9uT3B0aW9ucyB7XG4gIGlmIChzb3VyY2UucGFyYW1zKSB7XG4gICAgY29uc3QgcDAgPSBzb3VyY2UucGFyYW1zO1xuICAgIGlmICghZGVzdGluYXRpb24ucGFyYW1zKSB7XG4gICAgICBkZXN0aW5hdGlvbi5wYXJhbXMgPSB7fTtcbiAgICB9XG4gICAgY29uc3QgcDEgPSBkZXN0aW5hdGlvbi5wYXJhbXM7XG4gICAgT2JqZWN0LmtleXMocDApLmZvckVhY2gocGFyYW0gPT4ge1xuICAgICAgaWYgKCFwMS5oYXNPd25Qcm9wZXJ0eShwYXJhbSkpIHtcbiAgICAgICAgcDFbcGFyYW1dID0gcDBbcGFyYW1dO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIHJldHVybiBkZXN0aW5hdGlvbjtcbn1cblxuY29uc3QgREFTSF9DQVNFX1JFR0VYUCA9IC8tKyhbYS16MC05XSkvZztcbmV4cG9ydCBmdW5jdGlvbiBkYXNoQ2FzZVRvQ2FtZWxDYXNlKGlucHV0OiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gaW5wdXQucmVwbGFjZShEQVNIX0NBU0VfUkVHRVhQLCAoLi4ubTogYW55W10pID0+IG1bMV0udG9VcHBlckNhc2UoKSk7XG59XG5cbmZ1bmN0aW9uIGNhbWVsQ2FzZVRvRGFzaENhc2UoaW5wdXQ6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBpbnB1dC5yZXBsYWNlKC8oW2Etel0pKFtBLVpdKS9nLCAnJDEtJDInKS50b0xvd2VyQ2FzZSgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYWxsb3dQcmV2aW91c1BsYXllclN0eWxlc01lcmdlKGR1cmF0aW9uOiBudW1iZXIsIGRlbGF5OiBudW1iZXIpIHtcbiAgcmV0dXJuIGR1cmF0aW9uID09PSAwIHx8IGRlbGF5ID09PSAwO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmFsYW5jZVByZXZpb3VzU3R5bGVzSW50b0tleWZyYW1lcyhcbiAgICBlbGVtZW50OiBhbnksIGtleWZyYW1lczoge1trZXk6IHN0cmluZ106IGFueX1bXSwgcHJldmlvdXNTdHlsZXM6IHtba2V5OiBzdHJpbmddOiBhbnl9KSB7XG4gIGNvbnN0IHByZXZpb3VzU3R5bGVQcm9wcyA9IE9iamVjdC5rZXlzKHByZXZpb3VzU3R5bGVzKTtcbiAgaWYgKHByZXZpb3VzU3R5bGVQcm9wcy5sZW5ndGggJiYga2V5ZnJhbWVzLmxlbmd0aCkge1xuICAgIGxldCBzdGFydGluZ0tleWZyYW1lID0ga2V5ZnJhbWVzWzBdO1xuICAgIGxldCBtaXNzaW5nU3R5bGVQcm9wczogc3RyaW5nW10gPSBbXTtcbiAgICBwcmV2aW91c1N0eWxlUHJvcHMuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgIGlmICghc3RhcnRpbmdLZXlmcmFtZS5oYXNPd25Qcm9wZXJ0eShwcm9wKSkge1xuICAgICAgICBtaXNzaW5nU3R5bGVQcm9wcy5wdXNoKHByb3ApO1xuICAgICAgfVxuICAgICAgc3RhcnRpbmdLZXlmcmFtZVtwcm9wXSA9IHByZXZpb3VzU3R5bGVzW3Byb3BdO1xuICAgIH0pO1xuXG4gICAgaWYgKG1pc3NpbmdTdHlsZVByb3BzLmxlbmd0aCkge1xuICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lXG4gICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGtleWZyYW1lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBsZXQga2YgPSBrZXlmcmFtZXNbaV07XG4gICAgICAgIG1pc3NpbmdTdHlsZVByb3BzLmZvckVhY2goZnVuY3Rpb24ocHJvcCkgeyBrZltwcm9wXSA9IGNvbXB1dGVTdHlsZShlbGVtZW50LCBwcm9wKTsgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBrZXlmcmFtZXM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2aXNpdERzbE5vZGUoXG4gICAgdmlzaXRvcjogQW5pbWF0aW9uRHNsVmlzaXRvciwgbm9kZTogQW5pbWF0aW9uTWV0YWRhdGEsIGNvbnRleHQ6IGFueSk6IGFueTtcbmV4cG9ydCBmdW5jdGlvbiB2aXNpdERzbE5vZGUoXG4gICAgdmlzaXRvcjogQW5pbWF0aW9uQXN0VmlzaXRvciwgbm9kZTogQW5pbWF0aW9uQXN0PEFuaW1hdGlvbk1ldGFkYXRhVHlwZT4sIGNvbnRleHQ6IGFueSk6IGFueTtcbmV4cG9ydCBmdW5jdGlvbiB2aXNpdERzbE5vZGUodmlzaXRvcjogYW55LCBub2RlOiBhbnksIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gIHN3aXRjaCAobm9kZS50eXBlKSB7XG4gICAgY2FzZSBBbmltYXRpb25NZXRhZGF0YVR5cGUuVHJpZ2dlcjpcbiAgICAgIHJldHVybiB2aXNpdG9yLnZpc2l0VHJpZ2dlcihub2RlLCBjb250ZXh0KTtcbiAgICBjYXNlIEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5TdGF0ZTpcbiAgICAgIHJldHVybiB2aXNpdG9yLnZpc2l0U3RhdGUobm9kZSwgY29udGV4dCk7XG4gICAgY2FzZSBBbmltYXRpb25NZXRhZGF0YVR5cGUuVHJhbnNpdGlvbjpcbiAgICAgIHJldHVybiB2aXNpdG9yLnZpc2l0VHJhbnNpdGlvbihub2RlLCBjb250ZXh0KTtcbiAgICBjYXNlIEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5TZXF1ZW5jZTpcbiAgICAgIHJldHVybiB2aXNpdG9yLnZpc2l0U2VxdWVuY2Uobm9kZSwgY29udGV4dCk7XG4gICAgY2FzZSBBbmltYXRpb25NZXRhZGF0YVR5cGUuR3JvdXA6XG4gICAgICByZXR1cm4gdmlzaXRvci52aXNpdEdyb3VwKG5vZGUsIGNvbnRleHQpO1xuICAgIGNhc2UgQW5pbWF0aW9uTWV0YWRhdGFUeXBlLkFuaW1hdGU6XG4gICAgICByZXR1cm4gdmlzaXRvci52aXNpdEFuaW1hdGUobm9kZSwgY29udGV4dCk7XG4gICAgY2FzZSBBbmltYXRpb25NZXRhZGF0YVR5cGUuS2V5ZnJhbWVzOlxuICAgICAgcmV0dXJuIHZpc2l0b3IudmlzaXRLZXlmcmFtZXMobm9kZSwgY29udGV4dCk7XG4gICAgY2FzZSBBbmltYXRpb25NZXRhZGF0YVR5cGUuU3R5bGU6XG4gICAgICByZXR1cm4gdmlzaXRvci52aXNpdFN0eWxlKG5vZGUsIGNvbnRleHQpO1xuICAgIGNhc2UgQW5pbWF0aW9uTWV0YWRhdGFUeXBlLlJlZmVyZW5jZTpcbiAgICAgIHJldHVybiB2aXNpdG9yLnZpc2l0UmVmZXJlbmNlKG5vZGUsIGNvbnRleHQpO1xuICAgIGNhc2UgQW5pbWF0aW9uTWV0YWRhdGFUeXBlLkFuaW1hdGVDaGlsZDpcbiAgICAgIHJldHVybiB2aXNpdG9yLnZpc2l0QW5pbWF0ZUNoaWxkKG5vZGUsIGNvbnRleHQpO1xuICAgIGNhc2UgQW5pbWF0aW9uTWV0YWRhdGFUeXBlLkFuaW1hdGVSZWY6XG4gICAgICByZXR1cm4gdmlzaXRvci52aXNpdEFuaW1hdGVSZWYobm9kZSwgY29udGV4dCk7XG4gICAgY2FzZSBBbmltYXRpb25NZXRhZGF0YVR5cGUuUXVlcnk6XG4gICAgICByZXR1cm4gdmlzaXRvci52aXNpdFF1ZXJ5KG5vZGUsIGNvbnRleHQpO1xuICAgIGNhc2UgQW5pbWF0aW9uTWV0YWRhdGFUeXBlLlN0YWdnZXI6XG4gICAgICByZXR1cm4gdmlzaXRvci52aXNpdFN0YWdnZXIobm9kZSwgY29udGV4dCk7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVW5hYmxlIHRvIHJlc29sdmUgYW5pbWF0aW9uIG1ldGFkYXRhIG5vZGUgIyR7bm9kZS50eXBlfWApO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb21wdXRlU3R5bGUoZWxlbWVudDogYW55LCBwcm9wOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gKDxhbnk+d2luZG93LmdldENvbXB1dGVkU3R5bGUoZWxlbWVudCkpW3Byb3BdO1xufVxuIl19