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
import { SANITIZER } from '../render3/interfaces/view';
import { getLView } from '../render3/state';
import { stringify } from '../render3/util';
import { allowSanitizationBypass } from './bypass';
import { _sanitizeHtml as _sanitizeHtml } from './html_sanitizer';
import { SecurityContext } from './security';
import { _sanitizeStyle as _sanitizeStyle } from './style_sanitizer';
import { _sanitizeUrl as _sanitizeUrl } from './url_sanitizer';
/**
 * An `html` sanitizer which converts untrusted `html` **string** into trusted string by removing
 * dangerous content.
 *
 * This method parses the `html` and locates potentially dangerous content (such as urls and
 * javascript) and removes it.
 *
 * It is possible to mark a string as trusted by calling {\@link bypassSanitizationTrustHtml}.
 *
 * @param {?} unsafeHtml untrusted `html`, typically from the user.
 * @return {?} `html` string which is safe to display to user, because all of the dangerous javascript
 * and urls have been removed.
 */
export function sanitizeHtml(unsafeHtml) {
    /** @type {?} */
    const sanitizer = getSanitizer();
    if (sanitizer) {
        return sanitizer.sanitize(SecurityContext.HTML, unsafeHtml) || '';
    }
    if (allowSanitizationBypass(unsafeHtml, "Html" /* Html */)) {
        return unsafeHtml.toString();
    }
    return _sanitizeHtml(document, stringify(unsafeHtml));
}
/**
 * A `style` sanitizer which converts untrusted `style` **string** into trusted string by removing
 * dangerous content.
 *
 * This method parses the `style` and locates potentially dangerous content (such as urls and
 * javascript) and removes it.
 *
 * It is possible to mark a string as trusted by calling {\@link bypassSanitizationTrustStyle}.
 *
 * @param {?} unsafeStyle untrusted `style`, typically from the user.
 * @return {?} `style` string which is safe to bind to the `style` properties, because all of the
 * dangerous javascript and urls have been removed.
 */
export function sanitizeStyle(unsafeStyle) {
    /** @type {?} */
    const sanitizer = getSanitizer();
    if (sanitizer) {
        return sanitizer.sanitize(SecurityContext.STYLE, unsafeStyle) || '';
    }
    if (allowSanitizationBypass(unsafeStyle, "Style" /* Style */)) {
        return unsafeStyle.toString();
    }
    return _sanitizeStyle(stringify(unsafeStyle));
}
/**
 * A `url` sanitizer which converts untrusted `url` **string** into trusted string by removing
 * dangerous
 * content.
 *
 * This method parses the `url` and locates potentially dangerous content (such as javascript) and
 * removes it.
 *
 * It is possible to mark a string as trusted by calling {\@link bypassSanitizationTrustUrl}.
 *
 * @param {?} unsafeUrl untrusted `url`, typically from the user.
 * @return {?} `url` string which is safe to bind to the `src` properties such as `<img src>`, because
 * all of the dangerous javascript has been removed.
 */
export function sanitizeUrl(unsafeUrl) {
    /** @type {?} */
    const sanitizer = getSanitizer();
    if (sanitizer) {
        return sanitizer.sanitize(SecurityContext.URL, unsafeUrl) || '';
    }
    if (allowSanitizationBypass(unsafeUrl, "Url" /* Url */)) {
        return unsafeUrl.toString();
    }
    return _sanitizeUrl(stringify(unsafeUrl));
}
/**
 * A `url` sanitizer which only lets trusted `url`s through.
 *
 * This passes only `url`s marked trusted by calling {\@link bypassSanitizationTrustResourceUrl}.
 *
 * @param {?} unsafeResourceUrl untrusted `url`, typically from the user.
 * @return {?} `url` string which is safe to bind to the `src` properties such as `<img src>`, because
 * only trusted `url`s have been allowed to pass.
 */
export function sanitizeResourceUrl(unsafeResourceUrl) {
    /** @type {?} */
    const sanitizer = getSanitizer();
    if (sanitizer) {
        return sanitizer.sanitize(SecurityContext.RESOURCE_URL, unsafeResourceUrl) || '';
    }
    if (allowSanitizationBypass(unsafeResourceUrl, "ResourceUrl" /* ResourceUrl */)) {
        return unsafeResourceUrl.toString();
    }
    throw new Error('unsafe value used in a resource URL context (see http://g.co/ng/security#xss)');
}
/**
 * A `script` sanitizer which only lets trusted javascript through.
 *
 * This passes only `script`s marked trusted by calling {\@link
 * bypassSanitizationTrustScript}.
 *
 * @param {?} unsafeScript untrusted `script`, typically from the user.
 * @return {?} `url` string which is safe to bind to the `<script>` element such as `<img src>`,
 * because only trusted `scripts` have been allowed to pass.
 */
export function sanitizeScript(unsafeScript) {
    /** @type {?} */
    const sanitizer = getSanitizer();
    if (sanitizer) {
        return sanitizer.sanitize(SecurityContext.SCRIPT, unsafeScript) || '';
    }
    if (allowSanitizationBypass(unsafeScript, "Script" /* Script */)) {
        return unsafeScript.toString();
    }
    throw new Error('unsafe value used in a script context');
}
/**
 * The default style sanitizer will handle sanitization for style properties by
 * sanitizing any CSS property that can include a `url` value (usually image-based properties)
 * @type {?}
 */
export const defaultStyleSanitizer = ((/** @type {?} */ (function (prop, value) {
    if (value === undefined) {
        return prop === 'background-image' || prop === 'background' || prop === 'border-image' ||
            prop === 'filter' || prop === 'list-style' || prop === 'list-style-image';
    }
    return sanitizeStyle(value);
})));
/**
 * @return {?}
 */
function getSanitizer() {
    /** @type {?} */
    const lView = getLView();
    return lView && lView[SANITIZER];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2FuaXRpemF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvc2FuaXRpemF0aW9uL3Nhbml0aXphdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSw0QkFBNEIsQ0FBQztBQUNyRCxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFDMUMsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBRTFDLE9BQU8sRUFBYSx1QkFBdUIsRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUM3RCxPQUFPLEVBQUMsYUFBYSxJQUFJLGFBQWEsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBQ2hFLE9BQU8sRUFBWSxlQUFlLEVBQUMsTUFBTSxZQUFZLENBQUM7QUFDdEQsT0FBTyxFQUFrQixjQUFjLElBQUksY0FBYyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDcEYsT0FBTyxFQUFDLFlBQVksSUFBSSxZQUFZLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7QUFpQjdELE1BQU0sVUFBVSxZQUFZLENBQUMsVUFBZTs7VUFDcEMsU0FBUyxHQUFHLFlBQVksRUFBRTtJQUNoQyxJQUFJLFNBQVMsRUFBRTtRQUNiLE9BQU8sU0FBUyxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztLQUNuRTtJQUNELElBQUksdUJBQXVCLENBQUMsVUFBVSxvQkFBa0IsRUFBRTtRQUN4RCxPQUFPLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztLQUM5QjtJQUNELE9BQU8sYUFBYSxDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztBQUN4RCxDQUFDOzs7Ozs7Ozs7Ozs7OztBQWVELE1BQU0sVUFBVSxhQUFhLENBQUMsV0FBZ0I7O1VBQ3RDLFNBQVMsR0FBRyxZQUFZLEVBQUU7SUFDaEMsSUFBSSxTQUFTLEVBQUU7UUFDYixPQUFPLFNBQVMsQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLEtBQUssRUFBRSxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUM7S0FDckU7SUFDRCxJQUFJLHVCQUF1QixDQUFDLFdBQVcsc0JBQW1CLEVBQUU7UUFDMUQsT0FBTyxXQUFXLENBQUMsUUFBUSxFQUFFLENBQUM7S0FDL0I7SUFDRCxPQUFPLGNBQWMsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztBQUNoRCxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7QUFnQkQsTUFBTSxVQUFVLFdBQVcsQ0FBQyxTQUFjOztVQUNsQyxTQUFTLEdBQUcsWUFBWSxFQUFFO0lBQ2hDLElBQUksU0FBUyxFQUFFO1FBQ2IsT0FBTyxTQUFTLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxHQUFHLEVBQUUsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDO0tBQ2pFO0lBQ0QsSUFBSSx1QkFBdUIsQ0FBQyxTQUFTLGtCQUFpQixFQUFFO1FBQ3RELE9BQU8sU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDO0tBQzdCO0lBQ0QsT0FBTyxZQUFZLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7QUFDNUMsQ0FBQzs7Ozs7Ozs7OztBQVdELE1BQU0sVUFBVSxtQkFBbUIsQ0FBQyxpQkFBc0I7O1VBQ2xELFNBQVMsR0FBRyxZQUFZLEVBQUU7SUFDaEMsSUFBSSxTQUFTLEVBQUU7UUFDYixPQUFPLFNBQVMsQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLFlBQVksRUFBRSxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsQ0FBQztLQUNsRjtJQUNELElBQUksdUJBQXVCLENBQUMsaUJBQWlCLGtDQUF5QixFQUFFO1FBQ3RFLE9BQU8saUJBQWlCLENBQUMsUUFBUSxFQUFFLENBQUM7S0FDckM7SUFDRCxNQUFNLElBQUksS0FBSyxDQUFDLCtFQUErRSxDQUFDLENBQUM7QUFDbkcsQ0FBQzs7Ozs7Ozs7Ozs7QUFZRCxNQUFNLFVBQVUsY0FBYyxDQUFDLFlBQWlCOztVQUN4QyxTQUFTLEdBQUcsWUFBWSxFQUFFO0lBQ2hDLElBQUksU0FBUyxFQUFFO1FBQ2IsT0FBTyxTQUFTLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsWUFBWSxDQUFDLElBQUksRUFBRSxDQUFDO0tBQ3ZFO0lBQ0QsSUFBSSx1QkFBdUIsQ0FBQyxZQUFZLHdCQUFvQixFQUFFO1FBQzVELE9BQU8sWUFBWSxDQUFDLFFBQVEsRUFBRSxDQUFDO0tBQ2hDO0lBQ0QsTUFBTSxJQUFJLEtBQUssQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO0FBQzNELENBQUM7Ozs7OztBQU1ELE1BQU0sT0FBTyxxQkFBcUIsR0FBRyxDQUFDLG1CQUFBLFVBQVMsSUFBWSxFQUFFLEtBQWM7SUFDekUsSUFBSSxLQUFLLEtBQUssU0FBUyxFQUFFO1FBQ3ZCLE9BQU8sSUFBSSxLQUFLLGtCQUFrQixJQUFJLElBQUksS0FBSyxZQUFZLElBQUksSUFBSSxLQUFLLGNBQWM7WUFDbEYsSUFBSSxLQUFLLFFBQVEsSUFBSSxJQUFJLEtBQUssWUFBWSxJQUFJLElBQUksS0FBSyxrQkFBa0IsQ0FBQztLQUMvRTtJQUVELE9BQU8sYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzlCLENBQUMsRUFBbUIsQ0FBQzs7OztBQUVyQixTQUFTLFlBQVk7O1VBQ2IsS0FBSyxHQUFHLFFBQVEsRUFBRTtJQUN4QixPQUFPLEtBQUssSUFBSSxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDbkMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtTQU5JVElaRVJ9IGZyb20gJy4uL3JlbmRlcjMvaW50ZXJmYWNlcy92aWV3JztcbmltcG9ydCB7Z2V0TFZpZXd9IGZyb20gJy4uL3JlbmRlcjMvc3RhdGUnO1xuaW1wb3J0IHtzdHJpbmdpZnl9IGZyb20gJy4uL3JlbmRlcjMvdXRpbCc7XG5cbmltcG9ydCB7QnlwYXNzVHlwZSwgYWxsb3dTYW5pdGl6YXRpb25CeXBhc3N9IGZyb20gJy4vYnlwYXNzJztcbmltcG9ydCB7X3Nhbml0aXplSHRtbCBhcyBfc2FuaXRpemVIdG1sfSBmcm9tICcuL2h0bWxfc2FuaXRpemVyJztcbmltcG9ydCB7U2FuaXRpemVyLCBTZWN1cml0eUNvbnRleHR9IGZyb20gJy4vc2VjdXJpdHknO1xuaW1wb3J0IHtTdHlsZVNhbml0aXplRm4sIF9zYW5pdGl6ZVN0eWxlIGFzIF9zYW5pdGl6ZVN0eWxlfSBmcm9tICcuL3N0eWxlX3Nhbml0aXplcic7XG5pbXBvcnQge19zYW5pdGl6ZVVybCBhcyBfc2FuaXRpemVVcmx9IGZyb20gJy4vdXJsX3Nhbml0aXplcic7XG5cblxuXG4vKipcbiAqIEFuIGBodG1sYCBzYW5pdGl6ZXIgd2hpY2ggY29udmVydHMgdW50cnVzdGVkIGBodG1sYCAqKnN0cmluZyoqIGludG8gdHJ1c3RlZCBzdHJpbmcgYnkgcmVtb3ZpbmdcbiAqIGRhbmdlcm91cyBjb250ZW50LlxuICpcbiAqIFRoaXMgbWV0aG9kIHBhcnNlcyB0aGUgYGh0bWxgIGFuZCBsb2NhdGVzIHBvdGVudGlhbGx5IGRhbmdlcm91cyBjb250ZW50IChzdWNoIGFzIHVybHMgYW5kXG4gKiBqYXZhc2NyaXB0KSBhbmQgcmVtb3ZlcyBpdC5cbiAqXG4gKiBJdCBpcyBwb3NzaWJsZSB0byBtYXJrIGEgc3RyaW5nIGFzIHRydXN0ZWQgYnkgY2FsbGluZyB7QGxpbmsgYnlwYXNzU2FuaXRpemF0aW9uVHJ1c3RIdG1sfS5cbiAqXG4gKiBAcGFyYW0gdW5zYWZlSHRtbCB1bnRydXN0ZWQgYGh0bWxgLCB0eXBpY2FsbHkgZnJvbSB0aGUgdXNlci5cbiAqIEByZXR1cm5zIGBodG1sYCBzdHJpbmcgd2hpY2ggaXMgc2FmZSB0byBkaXNwbGF5IHRvIHVzZXIsIGJlY2F1c2UgYWxsIG9mIHRoZSBkYW5nZXJvdXMgamF2YXNjcmlwdFxuICogYW5kIHVybHMgaGF2ZSBiZWVuIHJlbW92ZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzYW5pdGl6ZUh0bWwodW5zYWZlSHRtbDogYW55KTogc3RyaW5nIHtcbiAgY29uc3Qgc2FuaXRpemVyID0gZ2V0U2FuaXRpemVyKCk7XG4gIGlmIChzYW5pdGl6ZXIpIHtcbiAgICByZXR1cm4gc2FuaXRpemVyLnNhbml0aXplKFNlY3VyaXR5Q29udGV4dC5IVE1MLCB1bnNhZmVIdG1sKSB8fCAnJztcbiAgfVxuICBpZiAoYWxsb3dTYW5pdGl6YXRpb25CeXBhc3ModW5zYWZlSHRtbCwgQnlwYXNzVHlwZS5IdG1sKSkge1xuICAgIHJldHVybiB1bnNhZmVIdG1sLnRvU3RyaW5nKCk7XG4gIH1cbiAgcmV0dXJuIF9zYW5pdGl6ZUh0bWwoZG9jdW1lbnQsIHN0cmluZ2lmeSh1bnNhZmVIdG1sKSk7XG59XG5cbi8qKlxuICogQSBgc3R5bGVgIHNhbml0aXplciB3aGljaCBjb252ZXJ0cyB1bnRydXN0ZWQgYHN0eWxlYCAqKnN0cmluZyoqIGludG8gdHJ1c3RlZCBzdHJpbmcgYnkgcmVtb3ZpbmdcbiAqIGRhbmdlcm91cyBjb250ZW50LlxuICpcbiAqIFRoaXMgbWV0aG9kIHBhcnNlcyB0aGUgYHN0eWxlYCBhbmQgbG9jYXRlcyBwb3RlbnRpYWxseSBkYW5nZXJvdXMgY29udGVudCAoc3VjaCBhcyB1cmxzIGFuZFxuICogamF2YXNjcmlwdCkgYW5kIHJlbW92ZXMgaXQuXG4gKlxuICogSXQgaXMgcG9zc2libGUgdG8gbWFyayBhIHN0cmluZyBhcyB0cnVzdGVkIGJ5IGNhbGxpbmcge0BsaW5rIGJ5cGFzc1Nhbml0aXphdGlvblRydXN0U3R5bGV9LlxuICpcbiAqIEBwYXJhbSB1bnNhZmVTdHlsZSB1bnRydXN0ZWQgYHN0eWxlYCwgdHlwaWNhbGx5IGZyb20gdGhlIHVzZXIuXG4gKiBAcmV0dXJucyBgc3R5bGVgIHN0cmluZyB3aGljaCBpcyBzYWZlIHRvIGJpbmQgdG8gdGhlIGBzdHlsZWAgcHJvcGVydGllcywgYmVjYXVzZSBhbGwgb2YgdGhlXG4gKiBkYW5nZXJvdXMgamF2YXNjcmlwdCBhbmQgdXJscyBoYXZlIGJlZW4gcmVtb3ZlZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNhbml0aXplU3R5bGUodW5zYWZlU3R5bGU6IGFueSk6IHN0cmluZyB7XG4gIGNvbnN0IHNhbml0aXplciA9IGdldFNhbml0aXplcigpO1xuICBpZiAoc2FuaXRpemVyKSB7XG4gICAgcmV0dXJuIHNhbml0aXplci5zYW5pdGl6ZShTZWN1cml0eUNvbnRleHQuU1RZTEUsIHVuc2FmZVN0eWxlKSB8fCAnJztcbiAgfVxuICBpZiAoYWxsb3dTYW5pdGl6YXRpb25CeXBhc3ModW5zYWZlU3R5bGUsIEJ5cGFzc1R5cGUuU3R5bGUpKSB7XG4gICAgcmV0dXJuIHVuc2FmZVN0eWxlLnRvU3RyaW5nKCk7XG4gIH1cbiAgcmV0dXJuIF9zYW5pdGl6ZVN0eWxlKHN0cmluZ2lmeSh1bnNhZmVTdHlsZSkpO1xufVxuXG4vKipcbiAqIEEgYHVybGAgc2FuaXRpemVyIHdoaWNoIGNvbnZlcnRzIHVudHJ1c3RlZCBgdXJsYCAqKnN0cmluZyoqIGludG8gdHJ1c3RlZCBzdHJpbmcgYnkgcmVtb3ZpbmdcbiAqIGRhbmdlcm91c1xuICogY29udGVudC5cbiAqXG4gKiBUaGlzIG1ldGhvZCBwYXJzZXMgdGhlIGB1cmxgIGFuZCBsb2NhdGVzIHBvdGVudGlhbGx5IGRhbmdlcm91cyBjb250ZW50IChzdWNoIGFzIGphdmFzY3JpcHQpIGFuZFxuICogcmVtb3ZlcyBpdC5cbiAqXG4gKiBJdCBpcyBwb3NzaWJsZSB0byBtYXJrIGEgc3RyaW5nIGFzIHRydXN0ZWQgYnkgY2FsbGluZyB7QGxpbmsgYnlwYXNzU2FuaXRpemF0aW9uVHJ1c3RVcmx9LlxuICpcbiAqIEBwYXJhbSB1bnNhZmVVcmwgdW50cnVzdGVkIGB1cmxgLCB0eXBpY2FsbHkgZnJvbSB0aGUgdXNlci5cbiAqIEByZXR1cm5zIGB1cmxgIHN0cmluZyB3aGljaCBpcyBzYWZlIHRvIGJpbmQgdG8gdGhlIGBzcmNgIHByb3BlcnRpZXMgc3VjaCBhcyBgPGltZyBzcmM+YCwgYmVjYXVzZVxuICogYWxsIG9mIHRoZSBkYW5nZXJvdXMgamF2YXNjcmlwdCBoYXMgYmVlbiByZW1vdmVkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2FuaXRpemVVcmwodW5zYWZlVXJsOiBhbnkpOiBzdHJpbmcge1xuICBjb25zdCBzYW5pdGl6ZXIgPSBnZXRTYW5pdGl6ZXIoKTtcbiAgaWYgKHNhbml0aXplcikge1xuICAgIHJldHVybiBzYW5pdGl6ZXIuc2FuaXRpemUoU2VjdXJpdHlDb250ZXh0LlVSTCwgdW5zYWZlVXJsKSB8fCAnJztcbiAgfVxuICBpZiAoYWxsb3dTYW5pdGl6YXRpb25CeXBhc3ModW5zYWZlVXJsLCBCeXBhc3NUeXBlLlVybCkpIHtcbiAgICByZXR1cm4gdW5zYWZlVXJsLnRvU3RyaW5nKCk7XG4gIH1cbiAgcmV0dXJuIF9zYW5pdGl6ZVVybChzdHJpbmdpZnkodW5zYWZlVXJsKSk7XG59XG5cbi8qKlxuICogQSBgdXJsYCBzYW5pdGl6ZXIgd2hpY2ggb25seSBsZXRzIHRydXN0ZWQgYHVybGBzIHRocm91Z2guXG4gKlxuICogVGhpcyBwYXNzZXMgb25seSBgdXJsYHMgbWFya2VkIHRydXN0ZWQgYnkgY2FsbGluZyB7QGxpbmsgYnlwYXNzU2FuaXRpemF0aW9uVHJ1c3RSZXNvdXJjZVVybH0uXG4gKlxuICogQHBhcmFtIHVuc2FmZVJlc291cmNlVXJsIHVudHJ1c3RlZCBgdXJsYCwgdHlwaWNhbGx5IGZyb20gdGhlIHVzZXIuXG4gKiBAcmV0dXJucyBgdXJsYCBzdHJpbmcgd2hpY2ggaXMgc2FmZSB0byBiaW5kIHRvIHRoZSBgc3JjYCBwcm9wZXJ0aWVzIHN1Y2ggYXMgYDxpbWcgc3JjPmAsIGJlY2F1c2VcbiAqIG9ubHkgdHJ1c3RlZCBgdXJsYHMgaGF2ZSBiZWVuIGFsbG93ZWQgdG8gcGFzcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNhbml0aXplUmVzb3VyY2VVcmwodW5zYWZlUmVzb3VyY2VVcmw6IGFueSk6IHN0cmluZyB7XG4gIGNvbnN0IHNhbml0aXplciA9IGdldFNhbml0aXplcigpO1xuICBpZiAoc2FuaXRpemVyKSB7XG4gICAgcmV0dXJuIHNhbml0aXplci5zYW5pdGl6ZShTZWN1cml0eUNvbnRleHQuUkVTT1VSQ0VfVVJMLCB1bnNhZmVSZXNvdXJjZVVybCkgfHwgJyc7XG4gIH1cbiAgaWYgKGFsbG93U2FuaXRpemF0aW9uQnlwYXNzKHVuc2FmZVJlc291cmNlVXJsLCBCeXBhc3NUeXBlLlJlc291cmNlVXJsKSkge1xuICAgIHJldHVybiB1bnNhZmVSZXNvdXJjZVVybC50b1N0cmluZygpO1xuICB9XG4gIHRocm93IG5ldyBFcnJvcigndW5zYWZlIHZhbHVlIHVzZWQgaW4gYSByZXNvdXJjZSBVUkwgY29udGV4dCAoc2VlIGh0dHA6Ly9nLmNvL25nL3NlY3VyaXR5I3hzcyknKTtcbn1cblxuLyoqXG4gKiBBIGBzY3JpcHRgIHNhbml0aXplciB3aGljaCBvbmx5IGxldHMgdHJ1c3RlZCBqYXZhc2NyaXB0IHRocm91Z2guXG4gKlxuICogVGhpcyBwYXNzZXMgb25seSBgc2NyaXB0YHMgbWFya2VkIHRydXN0ZWQgYnkgY2FsbGluZyB7QGxpbmtcbiAqIGJ5cGFzc1Nhbml0aXphdGlvblRydXN0U2NyaXB0fS5cbiAqXG4gKiBAcGFyYW0gdW5zYWZlU2NyaXB0IHVudHJ1c3RlZCBgc2NyaXB0YCwgdHlwaWNhbGx5IGZyb20gdGhlIHVzZXIuXG4gKiBAcmV0dXJucyBgdXJsYCBzdHJpbmcgd2hpY2ggaXMgc2FmZSB0byBiaW5kIHRvIHRoZSBgPHNjcmlwdD5gIGVsZW1lbnQgc3VjaCBhcyBgPGltZyBzcmM+YCxcbiAqIGJlY2F1c2Ugb25seSB0cnVzdGVkIGBzY3JpcHRzYCBoYXZlIGJlZW4gYWxsb3dlZCB0byBwYXNzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2FuaXRpemVTY3JpcHQodW5zYWZlU2NyaXB0OiBhbnkpOiBzdHJpbmcge1xuICBjb25zdCBzYW5pdGl6ZXIgPSBnZXRTYW5pdGl6ZXIoKTtcbiAgaWYgKHNhbml0aXplcikge1xuICAgIHJldHVybiBzYW5pdGl6ZXIuc2FuaXRpemUoU2VjdXJpdHlDb250ZXh0LlNDUklQVCwgdW5zYWZlU2NyaXB0KSB8fCAnJztcbiAgfVxuICBpZiAoYWxsb3dTYW5pdGl6YXRpb25CeXBhc3ModW5zYWZlU2NyaXB0LCBCeXBhc3NUeXBlLlNjcmlwdCkpIHtcbiAgICByZXR1cm4gdW5zYWZlU2NyaXB0LnRvU3RyaW5nKCk7XG4gIH1cbiAgdGhyb3cgbmV3IEVycm9yKCd1bnNhZmUgdmFsdWUgdXNlZCBpbiBhIHNjcmlwdCBjb250ZXh0Jyk7XG59XG5cbi8qKlxuICogVGhlIGRlZmF1bHQgc3R5bGUgc2FuaXRpemVyIHdpbGwgaGFuZGxlIHNhbml0aXphdGlvbiBmb3Igc3R5bGUgcHJvcGVydGllcyBieVxuICogc2FuaXRpemluZyBhbnkgQ1NTIHByb3BlcnR5IHRoYXQgY2FuIGluY2x1ZGUgYSBgdXJsYCB2YWx1ZSAodXN1YWxseSBpbWFnZS1iYXNlZCBwcm9wZXJ0aWVzKVxuICovXG5leHBvcnQgY29uc3QgZGVmYXVsdFN0eWxlU2FuaXRpemVyID0gKGZ1bmN0aW9uKHByb3A6IHN0cmluZywgdmFsdWU/OiBzdHJpbmcpOiBzdHJpbmcgfCBib29sZWFuIHtcbiAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gcHJvcCA9PT0gJ2JhY2tncm91bmQtaW1hZ2UnIHx8IHByb3AgPT09ICdiYWNrZ3JvdW5kJyB8fCBwcm9wID09PSAnYm9yZGVyLWltYWdlJyB8fFxuICAgICAgICBwcm9wID09PSAnZmlsdGVyJyB8fCBwcm9wID09PSAnbGlzdC1zdHlsZScgfHwgcHJvcCA9PT0gJ2xpc3Qtc3R5bGUtaW1hZ2UnO1xuICB9XG5cbiAgcmV0dXJuIHNhbml0aXplU3R5bGUodmFsdWUpO1xufSBhcyBTdHlsZVNhbml0aXplRm4pO1xuXG5mdW5jdGlvbiBnZXRTYW5pdGl6ZXIoKTogU2FuaXRpemVyfG51bGwge1xuICBjb25zdCBsVmlldyA9IGdldExWaWV3KCk7XG4gIHJldHVybiBsVmlldyAmJiBsVmlld1tTQU5JVElaRVJdO1xufVxuIl19