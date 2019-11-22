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
/**
 * The goal here is to make sure that the browser DOM API is the Renderer.
 * We do this by defining a subset of DOM API to be the renderer and than
 * use that time for rendering.
 *
 * At runtime we can than use the DOM api directly, in server or web-worker
 * it will be easy to implement such API.
 */
/** @enum {number} */
const RendererStyleFlags3 = {
    Important: 1,
    DashCase: 2,
};
export { RendererStyleFlags3 };
RendererStyleFlags3[RendererStyleFlags3.Important] = 'Important';
RendererStyleFlags3[RendererStyleFlags3.DashCase] = 'DashCase';
/**
 * Object Oriented style of API needed to create elements and text nodes.
 *
 * This is the native browser API style, e.g. operations are methods on individual objects
 * like HTMLElement. With this style, no additional code is needed as a facade
 * (reducing payload size).
 *
 * @record
 */
export function ObjectOrientedRenderer3() { }
if (false) {
    /**
     * @param {?} data
     * @return {?}
     */
    ObjectOrientedRenderer3.prototype.createComment = function (data) { };
    /**
     * @param {?} tagName
     * @return {?}
     */
    ObjectOrientedRenderer3.prototype.createElement = function (tagName) { };
    /**
     * @param {?} namespace
     * @param {?} tagName
     * @return {?}
     */
    ObjectOrientedRenderer3.prototype.createElementNS = function (namespace, tagName) { };
    /**
     * @param {?} data
     * @return {?}
     */
    ObjectOrientedRenderer3.prototype.createTextNode = function (data) { };
    /**
     * @param {?} selectors
     * @return {?}
     */
    ObjectOrientedRenderer3.prototype.querySelector = function (selectors) { };
}
/**
 * Returns whether the `renderer` is a `ProceduralRenderer3`
 * @param {?} renderer
 * @return {?}
 */
export function isProceduralRenderer(renderer) {
    return !!(((/** @type {?} */ (renderer))).listen);
}
/**
 * Procedural style of API needed to create elements and text nodes.
 *
 * In non-native browser environments (e.g. platforms such as web-workers), this is the
 * facade that enables element manipulation. This also facilitates backwards compatibility
 * with Renderer2.
 * @record
 */
export function ProceduralRenderer3() { }
if (false) {
    /**
     * This property is allowed to be null / undefined,
     * in which case the view engine won't call it.
     * This is used as a performance optimization for production mode.
     * @type {?|undefined}
     */
    ProceduralRenderer3.prototype.destroyNode;
    /**
     * @return {?}
     */
    ProceduralRenderer3.prototype.destroy = function () { };
    /**
     * @param {?} value
     * @return {?}
     */
    ProceduralRenderer3.prototype.createComment = function (value) { };
    /**
     * @param {?} name
     * @param {?=} namespace
     * @return {?}
     */
    ProceduralRenderer3.prototype.createElement = function (name, namespace) { };
    /**
     * @param {?} value
     * @return {?}
     */
    ProceduralRenderer3.prototype.createText = function (value) { };
    /**
     * @param {?} parent
     * @param {?} newChild
     * @return {?}
     */
    ProceduralRenderer3.prototype.appendChild = function (parent, newChild) { };
    /**
     * @param {?} parent
     * @param {?} newChild
     * @param {?} refChild
     * @return {?}
     */
    ProceduralRenderer3.prototype.insertBefore = function (parent, newChild, refChild) { };
    /**
     * @param {?} parent
     * @param {?} oldChild
     * @return {?}
     */
    ProceduralRenderer3.prototype.removeChild = function (parent, oldChild) { };
    /**
     * @param {?} selectorOrNode
     * @return {?}
     */
    ProceduralRenderer3.prototype.selectRootElement = function (selectorOrNode) { };
    /**
     * @param {?} node
     * @return {?}
     */
    ProceduralRenderer3.prototype.parentNode = function (node) { };
    /**
     * @param {?} node
     * @return {?}
     */
    ProceduralRenderer3.prototype.nextSibling = function (node) { };
    /**
     * @param {?} el
     * @param {?} name
     * @param {?} value
     * @param {?=} namespace
     * @return {?}
     */
    ProceduralRenderer3.prototype.setAttribute = function (el, name, value, namespace) { };
    /**
     * @param {?} el
     * @param {?} name
     * @param {?=} namespace
     * @return {?}
     */
    ProceduralRenderer3.prototype.removeAttribute = function (el, name, namespace) { };
    /**
     * @param {?} el
     * @param {?} name
     * @return {?}
     */
    ProceduralRenderer3.prototype.addClass = function (el, name) { };
    /**
     * @param {?} el
     * @param {?} name
     * @return {?}
     */
    ProceduralRenderer3.prototype.removeClass = function (el, name) { };
    /**
     * @param {?} el
     * @param {?} style
     * @param {?} value
     * @param {?=} flags
     * @return {?}
     */
    ProceduralRenderer3.prototype.setStyle = function (el, style, value, flags) { };
    /**
     * @param {?} el
     * @param {?} style
     * @param {?=} flags
     * @return {?}
     */
    ProceduralRenderer3.prototype.removeStyle = function (el, style, flags) { };
    /**
     * @param {?} el
     * @param {?} name
     * @param {?} value
     * @return {?}
     */
    ProceduralRenderer3.prototype.setProperty = function (el, name, value) { };
    /**
     * @param {?} node
     * @param {?} value
     * @return {?}
     */
    ProceduralRenderer3.prototype.setValue = function (node, value) { };
    /**
     * @param {?} target
     * @param {?} eventName
     * @param {?} callback
     * @return {?}
     */
    ProceduralRenderer3.prototype.listen = function (target, eventName, callback) { };
}
/**
 * @record
 */
export function RendererFactory3() { }
if (false) {
    /**
     * @param {?} hostElement
     * @param {?} rendererType
     * @return {?}
     */
    RendererFactory3.prototype.createRenderer = function (hostElement, rendererType) { };
    /**
     * @return {?}
     */
    RendererFactory3.prototype.begin = function () { };
    /**
     * @return {?}
     */
    RendererFactory3.prototype.end = function () { };
}
/** @type {?} */
export const domRendererFactory3 = {
    createRenderer: (hostElement, rendererType) => { return document; }
};
/**
 * Subset of API needed for appending elements and text nodes.
 * @record
 */
export function RNode() { }
if (false) {
    /** @type {?} */
    RNode.prototype.parentNode;
    /** @type {?} */
    RNode.prototype.nextSibling;
    /**
     * @param {?} oldChild
     * @return {?}
     */
    RNode.prototype.removeChild = function (oldChild) { };
    /**
     * Insert a child node.
     *
     * Used exclusively for adding View root nodes into ViewAnchor location.
     * @param {?} newChild
     * @param {?} refChild
     * @param {?} isViewRoot
     * @return {?}
     */
    RNode.prototype.insertBefore = function (newChild, refChild, isViewRoot) { };
    /**
     * Append a child node.
     *
     * Used exclusively for building up DOM which are static (ie not View roots)
     * @param {?} newChild
     * @return {?}
     */
    RNode.prototype.appendChild = function (newChild) { };
}
/**
 * Subset of API needed for writing attributes, properties, and setting up
 * listeners on Element.
 * @record
 */
export function RElement() { }
if (false) {
    /** @type {?} */
    RElement.prototype.style;
    /** @type {?} */
    RElement.prototype.classList;
    /** @type {?} */
    RElement.prototype.className;
    /**
     * @param {?} name
     * @param {?} value
     * @return {?}
     */
    RElement.prototype.setAttribute = function (name, value) { };
    /**
     * @param {?} name
     * @return {?}
     */
    RElement.prototype.removeAttribute = function (name) { };
    /**
     * @param {?} namespaceURI
     * @param {?} qualifiedName
     * @param {?} value
     * @return {?}
     */
    RElement.prototype.setAttributeNS = function (namespaceURI, qualifiedName, value) { };
    /**
     * @param {?} type
     * @param {?} listener
     * @param {?=} useCapture
     * @return {?}
     */
    RElement.prototype.addEventListener = function (type, listener, useCapture) { };
    /**
     * @param {?} type
     * @param {?=} listener
     * @param {?=} options
     * @return {?}
     */
    RElement.prototype.removeEventListener = function (type, listener, options) { };
    /**
     * @param {?} name
     * @param {?} value
     * @return {?}
     */
    RElement.prototype.setProperty = function (name, value) { };
}
/**
 * @record
 */
export function RCssStyleDeclaration() { }
if (false) {
    /**
     * @param {?} propertyName
     * @return {?}
     */
    RCssStyleDeclaration.prototype.removeProperty = function (propertyName) { };
    /**
     * @param {?} propertyName
     * @param {?} value
     * @param {?=} priority
     * @return {?}
     */
    RCssStyleDeclaration.prototype.setProperty = function (propertyName, value, priority) { };
}
/**
 * @record
 */
export function RDomTokenList() { }
if (false) {
    /**
     * @param {?} token
     * @return {?}
     */
    RDomTokenList.prototype.add = function (token) { };
    /**
     * @param {?} token
     * @return {?}
     */
    RDomTokenList.prototype.remove = function (token) { };
}
/**
 * @record
 */
export function RText() { }
if (false) {
    /** @type {?} */
    RText.prototype.textContent;
}
/**
 * @record
 */
export function RComment() { }
if (false) {
    /** @type {?} */
    RComment.prototype.textContent;
}
// Note: This hack is necessary so we don't erroneously get a circular dependency
// failure based on types.
/** @type {?} */
export const unusedValueExportToPlacateAjd = 1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9yZW5kZXIzL2ludGVyZmFjZXMvcmVuZGVyZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBc0JFLFlBQWtCO0lBQ2xCLFdBQWlCOzs7Ozs7Ozs7Ozs7OztBQVluQiw2Q0FPQzs7Ozs7O0lBTkMsc0VBQXNDOzs7OztJQUN0Qyx5RUFBeUM7Ozs7OztJQUN6QyxzRkFBOEQ7Ozs7O0lBQzlELHVFQUFvQzs7Ozs7SUFFcEMsMkVBQWdEOzs7Ozs7O0FBSWxELE1BQU0sVUFBVSxvQkFBb0IsQ0FBQyxRQUF1RDtJQUUxRixPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsbUJBQUEsUUFBUSxFQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUN0QyxDQUFDOzs7Ozs7Ozs7QUFTRCx5Q0FnQ0M7Ozs7Ozs7O0lBdEJDLDBDQUEyQzs7OztJQVQzQyx3REFBZ0I7Ozs7O0lBQ2hCLG1FQUF1Qzs7Ozs7O0lBQ3ZDLDZFQUErRDs7Ozs7SUFDL0QsZ0VBQWlDOzs7Ozs7SUFPakMsNEVBQXFEOzs7Ozs7O0lBQ3JELHVGQUF5RTs7Ozs7O0lBQ3pFLDRFQUFxRDs7Ozs7SUFDckQsZ0ZBQXdEOzs7OztJQUV4RCwrREFBdUM7Ozs7O0lBQ3ZDLGdFQUFxQzs7Ozs7Ozs7SUFFckMsdUZBQXVGOzs7Ozs7O0lBQ3ZGLG1GQUEyRTs7Ozs7O0lBQzNFLGlFQUEyQzs7Ozs7O0lBQzNDLG9FQUE4Qzs7Ozs7Ozs7SUFDOUMsZ0ZBRTJEOzs7Ozs7O0lBQzNELDRFQUFnRzs7Ozs7OztJQUNoRywyRUFBMEQ7Ozs7OztJQUMxRCxvRUFBb0Q7Ozs7Ozs7SUFHcEQsa0ZBQStGOzs7OztBQUdqRyxzQ0FJQzs7Ozs7OztJQUhDLHFGQUF3Rjs7OztJQUN4RixtREFBZTs7OztJQUNmLGlEQUFhOzs7QUFHZixNQUFNLE9BQU8sbUJBQW1CLEdBQXFCO0lBQ25ELGNBQWMsRUFBRSxDQUFDLFdBQTRCLEVBQUUsWUFBa0MsRUFDbkQsRUFBRSxHQUFHLE9BQU8sUUFBUSxDQUFDLENBQUEsQ0FBQztDQUNyRDs7Ozs7QUFHRCwyQkFvQkM7OztJQW5CQywyQkFBdUI7O0lBRXZCLDRCQUF3Qjs7Ozs7SUFFeEIsc0RBQW1DOzs7Ozs7Ozs7O0lBT25DLDZFQUErRTs7Ozs7Ozs7SUFPL0Usc0RBQW9DOzs7Ozs7O0FBT3RDLDhCQVdDOzs7SUFWQyx5QkFBNEI7O0lBQzVCLDZCQUF5Qjs7SUFDekIsNkJBQWtCOzs7Ozs7SUFDbEIsNkRBQWdEOzs7OztJQUNoRCx5REFBb0M7Ozs7Ozs7SUFDcEMsc0ZBQWlGOzs7Ozs7O0lBQ2pGLGdGQUFvRjs7Ozs7OztJQUNwRixnRkFBcUY7Ozs7OztJQUVyRiw0REFBNkM7Ozs7O0FBRy9DLDBDQUdDOzs7Ozs7SUFGQyw0RUFBNkM7Ozs7Ozs7SUFDN0MsMEZBQStFOzs7OztBQUdqRixtQ0FHQzs7Ozs7O0lBRkMsbURBQXlCOzs7OztJQUN6QixzREFBNEI7Ozs7O0FBRzlCLDJCQUFrRTs7O0lBQTNCLDRCQUF5Qjs7Ozs7QUFFaEUsOEJBQXFFOzs7SUFBM0IsK0JBQXlCOzs7OztBQUluRSxNQUFNLE9BQU8sNkJBQTZCLEdBQUcsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLyoqXG4gKiBUaGUgZ29hbCBoZXJlIGlzIHRvIG1ha2Ugc3VyZSB0aGF0IHRoZSBicm93c2VyIERPTSBBUEkgaXMgdGhlIFJlbmRlcmVyLlxuICogV2UgZG8gdGhpcyBieSBkZWZpbmluZyBhIHN1YnNldCBvZiBET00gQVBJIHRvIGJlIHRoZSByZW5kZXJlciBhbmQgdGhhblxuICogdXNlIHRoYXQgdGltZSBmb3IgcmVuZGVyaW5nLlxuICpcbiAqIEF0IHJ1bnRpbWUgd2UgY2FuIHRoYW4gdXNlIHRoZSBET00gYXBpIGRpcmVjdGx5LCBpbiBzZXJ2ZXIgb3Igd2ViLXdvcmtlclxuICogaXQgd2lsbCBiZSBlYXN5IHRvIGltcGxlbWVudCBzdWNoIEFQSS5cbiAqL1xuXG5pbXBvcnQge1JlbmRlcmVyU3R5bGVGbGFnczIsIFJlbmRlcmVyVHlwZTJ9IGZyb20gJy4uLy4uL3JlbmRlci9hcGknO1xuXG5cbi8vIFRPRE86IGNsZWFudXAgb25jZSB0aGUgY29kZSBpcyBtZXJnZWQgaW4gYW5ndWxhci9hbmd1bGFyXG5leHBvcnQgZW51bSBSZW5kZXJlclN0eWxlRmxhZ3MzIHtcbiAgSW1wb3J0YW50ID0gMSA8PCAwLFxuICBEYXNoQ2FzZSA9IDEgPDwgMVxufVxuXG5leHBvcnQgdHlwZSBSZW5kZXJlcjMgPSBPYmplY3RPcmllbnRlZFJlbmRlcmVyMyB8IFByb2NlZHVyYWxSZW5kZXJlcjM7XG5cbi8qKlxuICogT2JqZWN0IE9yaWVudGVkIHN0eWxlIG9mIEFQSSBuZWVkZWQgdG8gY3JlYXRlIGVsZW1lbnRzIGFuZCB0ZXh0IG5vZGVzLlxuICpcbiAqIFRoaXMgaXMgdGhlIG5hdGl2ZSBicm93c2VyIEFQSSBzdHlsZSwgZS5nLiBvcGVyYXRpb25zIGFyZSBtZXRob2RzIG9uIGluZGl2aWR1YWwgb2JqZWN0c1xuICogbGlrZSBIVE1MRWxlbWVudC4gV2l0aCB0aGlzIHN0eWxlLCBubyBhZGRpdGlvbmFsIGNvZGUgaXMgbmVlZGVkIGFzIGEgZmFjYWRlXG4gKiAocmVkdWNpbmcgcGF5bG9hZCBzaXplKS5cbiAqICovXG5leHBvcnQgaW50ZXJmYWNlIE9iamVjdE9yaWVudGVkUmVuZGVyZXIzIHtcbiAgY3JlYXRlQ29tbWVudChkYXRhOiBzdHJpbmcpOiBSQ29tbWVudDtcbiAgY3JlYXRlRWxlbWVudCh0YWdOYW1lOiBzdHJpbmcpOiBSRWxlbWVudDtcbiAgY3JlYXRlRWxlbWVudE5TKG5hbWVzcGFjZTogc3RyaW5nLCB0YWdOYW1lOiBzdHJpbmcpOiBSRWxlbWVudDtcbiAgY3JlYXRlVGV4dE5vZGUoZGF0YTogc3RyaW5nKTogUlRleHQ7XG5cbiAgcXVlcnlTZWxlY3RvcihzZWxlY3RvcnM6IHN0cmluZyk6IFJFbGVtZW50fG51bGw7XG59XG5cbi8qKiBSZXR1cm5zIHdoZXRoZXIgdGhlIGByZW5kZXJlcmAgaXMgYSBgUHJvY2VkdXJhbFJlbmRlcmVyM2AgKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1Byb2NlZHVyYWxSZW5kZXJlcihyZW5kZXJlcjogUHJvY2VkdXJhbFJlbmRlcmVyMyB8IE9iamVjdE9yaWVudGVkUmVuZGVyZXIzKTpcbiAgICByZW5kZXJlciBpcyBQcm9jZWR1cmFsUmVuZGVyZXIzIHtcbiAgcmV0dXJuICEhKChyZW5kZXJlciBhcyBhbnkpLmxpc3Rlbik7XG59XG5cbi8qKlxuICogUHJvY2VkdXJhbCBzdHlsZSBvZiBBUEkgbmVlZGVkIHRvIGNyZWF0ZSBlbGVtZW50cyBhbmQgdGV4dCBub2Rlcy5cbiAqXG4gKiBJbiBub24tbmF0aXZlIGJyb3dzZXIgZW52aXJvbm1lbnRzIChlLmcuIHBsYXRmb3JtcyBzdWNoIGFzIHdlYi13b3JrZXJzKSwgdGhpcyBpcyB0aGVcbiAqIGZhY2FkZSB0aGF0IGVuYWJsZXMgZWxlbWVudCBtYW5pcHVsYXRpb24uIFRoaXMgYWxzbyBmYWNpbGl0YXRlcyBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eVxuICogd2l0aCBSZW5kZXJlcjIuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUHJvY2VkdXJhbFJlbmRlcmVyMyB7XG4gIGRlc3Ryb3koKTogdm9pZDtcbiAgY3JlYXRlQ29tbWVudCh2YWx1ZTogc3RyaW5nKTogUkNvbW1lbnQ7XG4gIGNyZWF0ZUVsZW1lbnQobmFtZTogc3RyaW5nLCBuYW1lc3BhY2U/OiBzdHJpbmd8bnVsbCk6IFJFbGVtZW50O1xuICBjcmVhdGVUZXh0KHZhbHVlOiBzdHJpbmcpOiBSVGV4dDtcbiAgLyoqXG4gICAqIFRoaXMgcHJvcGVydHkgaXMgYWxsb3dlZCB0byBiZSBudWxsIC8gdW5kZWZpbmVkLFxuICAgKiBpbiB3aGljaCBjYXNlIHRoZSB2aWV3IGVuZ2luZSB3b24ndCBjYWxsIGl0LlxuICAgKiBUaGlzIGlzIHVzZWQgYXMgYSBwZXJmb3JtYW5jZSBvcHRpbWl6YXRpb24gZm9yIHByb2R1Y3Rpb24gbW9kZS5cbiAgICovXG4gIGRlc3Ryb3lOb2RlPzogKChub2RlOiBSTm9kZSkgPT4gdm9pZCl8bnVsbDtcbiAgYXBwZW5kQ2hpbGQocGFyZW50OiBSRWxlbWVudCwgbmV3Q2hpbGQ6IFJOb2RlKTogdm9pZDtcbiAgaW5zZXJ0QmVmb3JlKHBhcmVudDogUk5vZGUsIG5ld0NoaWxkOiBSTm9kZSwgcmVmQ2hpbGQ6IFJOb2RlfG51bGwpOiB2b2lkO1xuICByZW1vdmVDaGlsZChwYXJlbnQ6IFJFbGVtZW50LCBvbGRDaGlsZDogUk5vZGUpOiB2b2lkO1xuICBzZWxlY3RSb290RWxlbWVudChzZWxlY3Rvck9yTm9kZTogc3RyaW5nfGFueSk6IFJFbGVtZW50O1xuXG4gIHBhcmVudE5vZGUobm9kZTogUk5vZGUpOiBSRWxlbWVudHxudWxsO1xuICBuZXh0U2libGluZyhub2RlOiBSTm9kZSk6IFJOb2RlfG51bGw7XG5cbiAgc2V0QXR0cmlidXRlKGVsOiBSRWxlbWVudCwgbmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nLCBuYW1lc3BhY2U/OiBzdHJpbmd8bnVsbCk6IHZvaWQ7XG4gIHJlbW92ZUF0dHJpYnV0ZShlbDogUkVsZW1lbnQsIG5hbWU6IHN0cmluZywgbmFtZXNwYWNlPzogc3RyaW5nfG51bGwpOiB2b2lkO1xuICBhZGRDbGFzcyhlbDogUkVsZW1lbnQsIG5hbWU6IHN0cmluZyk6IHZvaWQ7XG4gIHJlbW92ZUNsYXNzKGVsOiBSRWxlbWVudCwgbmFtZTogc3RyaW5nKTogdm9pZDtcbiAgc2V0U3R5bGUoXG4gICAgICBlbDogUkVsZW1lbnQsIHN0eWxlOiBzdHJpbmcsIHZhbHVlOiBhbnksXG4gICAgICBmbGFncz86IFJlbmRlcmVyU3R5bGVGbGFnczJ8UmVuZGVyZXJTdHlsZUZsYWdzMyk6IHZvaWQ7XG4gIHJlbW92ZVN0eWxlKGVsOiBSRWxlbWVudCwgc3R5bGU6IHN0cmluZywgZmxhZ3M/OiBSZW5kZXJlclN0eWxlRmxhZ3MyfFJlbmRlcmVyU3R5bGVGbGFnczMpOiB2b2lkO1xuICBzZXRQcm9wZXJ0eShlbDogUkVsZW1lbnQsIG5hbWU6IHN0cmluZywgdmFsdWU6IGFueSk6IHZvaWQ7XG4gIHNldFZhbHVlKG5vZGU6IFJUZXh0fFJDb21tZW50LCB2YWx1ZTogc3RyaW5nKTogdm9pZDtcblxuICAvLyBUT0RPKG1pc2tvKTogRGVwcmVjYXRlIGluIGZhdm9yIG9mIGFkZEV2ZW50TGlzdGVuZXIvcmVtb3ZlRXZlbnRMaXN0ZW5lclxuICBsaXN0ZW4odGFyZ2V0OiBSTm9kZSwgZXZlbnROYW1lOiBzdHJpbmcsIGNhbGxiYWNrOiAoZXZlbnQ6IGFueSkgPT4gYm9vbGVhbiB8IHZvaWQpOiAoKSA9PiB2b2lkO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJlbmRlcmVyRmFjdG9yeTMge1xuICBjcmVhdGVSZW5kZXJlcihob3N0RWxlbWVudDogUkVsZW1lbnR8bnVsbCwgcmVuZGVyZXJUeXBlOiBSZW5kZXJlclR5cGUyfG51bGwpOiBSZW5kZXJlcjM7XG4gIGJlZ2luPygpOiB2b2lkO1xuICBlbmQ/KCk6IHZvaWQ7XG59XG5cbmV4cG9ydCBjb25zdCBkb21SZW5kZXJlckZhY3RvcnkzOiBSZW5kZXJlckZhY3RvcnkzID0ge1xuICBjcmVhdGVSZW5kZXJlcjogKGhvc3RFbGVtZW50OiBSRWxlbWVudCB8IG51bGwsIHJlbmRlcmVyVHlwZTogUmVuZGVyZXJUeXBlMiB8IG51bGwpOlxuICAgICAgICAgICAgICAgICAgICAgIFJlbmRlcmVyMyA9PiB7IHJldHVybiBkb2N1bWVudDt9XG59O1xuXG4vKiogU3Vic2V0IG9mIEFQSSBuZWVkZWQgZm9yIGFwcGVuZGluZyBlbGVtZW50cyBhbmQgdGV4dCBub2Rlcy4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUk5vZGUge1xuICBwYXJlbnROb2RlOiBSTm9kZXxudWxsO1xuXG4gIG5leHRTaWJsaW5nOiBSTm9kZXxudWxsO1xuXG4gIHJlbW92ZUNoaWxkKG9sZENoaWxkOiBSTm9kZSk6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIEluc2VydCBhIGNoaWxkIG5vZGUuXG4gICAqXG4gICAqIFVzZWQgZXhjbHVzaXZlbHkgZm9yIGFkZGluZyBWaWV3IHJvb3Qgbm9kZXMgaW50byBWaWV3QW5jaG9yIGxvY2F0aW9uLlxuICAgKi9cbiAgaW5zZXJ0QmVmb3JlKG5ld0NoaWxkOiBSTm9kZSwgcmVmQ2hpbGQ6IFJOb2RlfG51bGwsIGlzVmlld1Jvb3Q6IGJvb2xlYW4pOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBBcHBlbmQgYSBjaGlsZCBub2RlLlxuICAgKlxuICAgKiBVc2VkIGV4Y2x1c2l2ZWx5IGZvciBidWlsZGluZyB1cCBET00gd2hpY2ggYXJlIHN0YXRpYyAoaWUgbm90IFZpZXcgcm9vdHMpXG4gICAqL1xuICBhcHBlbmRDaGlsZChuZXdDaGlsZDogUk5vZGUpOiBSTm9kZTtcbn1cblxuLyoqXG4gKiBTdWJzZXQgb2YgQVBJIG5lZWRlZCBmb3Igd3JpdGluZyBhdHRyaWJ1dGVzLCBwcm9wZXJ0aWVzLCBhbmQgc2V0dGluZyB1cFxuICogbGlzdGVuZXJzIG9uIEVsZW1lbnQuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUkVsZW1lbnQgZXh0ZW5kcyBSTm9kZSB7XG4gIHN0eWxlOiBSQ3NzU3R5bGVEZWNsYXJhdGlvbjtcbiAgY2xhc3NMaXN0OiBSRG9tVG9rZW5MaXN0O1xuICBjbGFzc05hbWU6IHN0cmluZztcbiAgc2V0QXR0cmlidXRlKG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZyk6IHZvaWQ7XG4gIHJlbW92ZUF0dHJpYnV0ZShuYW1lOiBzdHJpbmcpOiB2b2lkO1xuICBzZXRBdHRyaWJ1dGVOUyhuYW1lc3BhY2VVUkk6IHN0cmluZywgcXVhbGlmaWVkTmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogdm9pZDtcbiAgYWRkRXZlbnRMaXN0ZW5lcih0eXBlOiBzdHJpbmcsIGxpc3RlbmVyOiBFdmVudExpc3RlbmVyLCB1c2VDYXB0dXJlPzogYm9vbGVhbik6IHZvaWQ7XG4gIHJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZTogc3RyaW5nLCBsaXN0ZW5lcj86IEV2ZW50TGlzdGVuZXIsIG9wdGlvbnM/OiBib29sZWFuKTogdm9pZDtcblxuICBzZXRQcm9wZXJ0eT8obmFtZTogc3RyaW5nLCB2YWx1ZTogYW55KTogdm9pZDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSQ3NzU3R5bGVEZWNsYXJhdGlvbiB7XG4gIHJlbW92ZVByb3BlcnR5KHByb3BlcnR5TmFtZTogc3RyaW5nKTogc3RyaW5nO1xuICBzZXRQcm9wZXJ0eShwcm9wZXJ0eU5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZ3xudWxsLCBwcmlvcml0eT86IHN0cmluZyk6IHZvaWQ7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUkRvbVRva2VuTGlzdCB7XG4gIGFkZCh0b2tlbjogc3RyaW5nKTogdm9pZDtcbiAgcmVtb3ZlKHRva2VuOiBzdHJpbmcpOiB2b2lkO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJUZXh0IGV4dGVuZHMgUk5vZGUgeyB0ZXh0Q29udGVudDogc3RyaW5nfG51bGw7IH1cblxuZXhwb3J0IGludGVyZmFjZSBSQ29tbWVudCBleHRlbmRzIFJOb2RlIHsgdGV4dENvbnRlbnQ6IHN0cmluZ3xudWxsOyB9XG5cbi8vIE5vdGU6IFRoaXMgaGFjayBpcyBuZWNlc3Nhcnkgc28gd2UgZG9uJ3QgZXJyb25lb3VzbHkgZ2V0IGEgY2lyY3VsYXIgZGVwZW5kZW5jeVxuLy8gZmFpbHVyZSBiYXNlZCBvbiB0eXBlcy5cbmV4cG9ydCBjb25zdCB1bnVzZWRWYWx1ZUV4cG9ydFRvUGxhY2F0ZUFqZCA9IDE7XG4iXX0=