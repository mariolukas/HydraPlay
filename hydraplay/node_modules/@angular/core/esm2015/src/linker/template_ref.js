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
import { injectTemplateRef as render3InjectTemplateRef } from '../render3/view_engine_compatibility';
import { noop } from '../util/noop';
import { ElementRef } from './element_ref';
/**
 * Represents an embedded template that can be used to instantiate embedded views.
 * To instantiate embedded views based on a template, use the `ViewContainerRef`
 * method `createEmbeddedView()`.
 *
 * Access a `TemplateRef` instance by placing a directive on an `<ng-template>`
 * element (or directive prefixed with `*`). The `TemplateRef` for the embedded view
 * is injected into the constructor of the directive,
 * using the `TemplateRef` token.
 *
 * You can also use a `Query` to find a `TemplateRef` associated with
 * a component or a directive.
 *
 * @see `ViewContainerRef`
 * @see [Navigate the Component Tree with DI](guide/dependency-injection-navtree)
 *
 * \@publicApi
 * @abstract
 * @template C
 */
export class TemplateRef {
}
/**
 * \@internal
 */
TemplateRef.__NG_ELEMENT_ID__ = () => SWITCH_TEMPLATE_REF_FACTORY(TemplateRef, ElementRef);
if (false) {
    /**
     * \@internal
     * @type {?}
     */
    TemplateRef.__NG_ELEMENT_ID__;
    /**
     * The anchor element in the parent view for this embedded view.
     *
     * The data-binding and injection contexts of embedded views created from this `TemplateRef`
     * inherit from the contexts of this location.
     *
     * Typically new embedded views are attached to the view container of this location, but in
     * advanced use-cases, the view can be attached to a different container while keeping the
     * data-binding and injection context from the original location.
     *
     * @abstract
     * @return {?}
     */
    TemplateRef.prototype.elementRef = function () { };
    /**
     * Instantiates an embedded view based on this template,
     * and attaches it to the view container.
     * @abstract
     * @param {?} context The data-binding context of the embedded view, as declared
     * in the `<ng-template>` usage.
     * @return {?} The new embedded view object.
     */
    TemplateRef.prototype.createEmbeddedView = function (context) { };
}
/** @type {?} */
export const SWITCH_TEMPLATE_REF_FACTORY__POST_R3__ = render3InjectTemplateRef;
/** @type {?} */
const SWITCH_TEMPLATE_REF_FACTORY__PRE_R3__ = noop;
/** @type {?} */
const SWITCH_TEMPLATE_REF_FACTORY = SWITCH_TEMPLATE_REF_FACTORY__PRE_R3__;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVtcGxhdGVfcmVmLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvbGlua2VyL3RlbXBsYXRlX3JlZi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBQyxpQkFBaUIsSUFBSSx3QkFBd0IsRUFBQyxNQUFNLHNDQUFzQyxDQUFDO0FBQ25HLE9BQU8sRUFBQyxJQUFJLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFFbEMsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLGVBQWUsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBc0J6QyxNQUFNLE9BQWdCLFdBQVc7Ozs7O0FBeUJ4Qiw2QkFBaUIsR0FDVyxHQUFHLEVBQUUsQ0FBQywyQkFBMkIsQ0FBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUE7Ozs7OztJQUQ3Riw4QkFDNkY7Ozs7Ozs7Ozs7Ozs7O0lBYjdGLG1EQUFzQzs7Ozs7Ozs7O0lBU3RDLGtFQUE0RDs7O0FBTzlELE1BQU0sT0FBTyxzQ0FBc0MsR0FBRyx3QkFBd0I7O01BQ3hFLHFDQUFxQyxHQUFHLElBQUk7O01BQzVDLDJCQUEyQixHQUM3QixxQ0FBcUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7aW5qZWN0VGVtcGxhdGVSZWYgYXMgcmVuZGVyM0luamVjdFRlbXBsYXRlUmVmfSBmcm9tICcuLi9yZW5kZXIzL3ZpZXdfZW5naW5lX2NvbXBhdGliaWxpdHknO1xuaW1wb3J0IHtub29wfSBmcm9tICcuLi91dGlsL25vb3AnO1xuXG5pbXBvcnQge0VsZW1lbnRSZWZ9IGZyb20gJy4vZWxlbWVudF9yZWYnO1xuaW1wb3J0IHtFbWJlZGRlZFZpZXdSZWZ9IGZyb20gJy4vdmlld19yZWYnO1xuXG5cbi8qKlxuICogUmVwcmVzZW50cyBhbiBlbWJlZGRlZCB0ZW1wbGF0ZSB0aGF0IGNhbiBiZSB1c2VkIHRvIGluc3RhbnRpYXRlIGVtYmVkZGVkIHZpZXdzLlxuICogVG8gaW5zdGFudGlhdGUgZW1iZWRkZWQgdmlld3MgYmFzZWQgb24gYSB0ZW1wbGF0ZSwgdXNlIHRoZSBgVmlld0NvbnRhaW5lclJlZmBcbiAqIG1ldGhvZCBgY3JlYXRlRW1iZWRkZWRWaWV3KClgLlxuICpcbiAqIEFjY2VzcyBhIGBUZW1wbGF0ZVJlZmAgaW5zdGFuY2UgYnkgcGxhY2luZyBhIGRpcmVjdGl2ZSBvbiBhbiBgPG5nLXRlbXBsYXRlPmBcbiAqIGVsZW1lbnQgKG9yIGRpcmVjdGl2ZSBwcmVmaXhlZCB3aXRoIGAqYCkuIFRoZSBgVGVtcGxhdGVSZWZgIGZvciB0aGUgZW1iZWRkZWQgdmlld1xuICogaXMgaW5qZWN0ZWQgaW50byB0aGUgY29uc3RydWN0b3Igb2YgdGhlIGRpcmVjdGl2ZSxcbiAqIHVzaW5nIHRoZSBgVGVtcGxhdGVSZWZgIHRva2VuLlxuICpcbiAqIFlvdSBjYW4gYWxzbyB1c2UgYSBgUXVlcnlgIHRvIGZpbmQgYSBgVGVtcGxhdGVSZWZgIGFzc29jaWF0ZWQgd2l0aFxuICogYSBjb21wb25lbnQgb3IgYSBkaXJlY3RpdmUuXG4gKlxuICogQHNlZSBgVmlld0NvbnRhaW5lclJlZmBcbiAqIEBzZWUgW05hdmlnYXRlIHRoZSBDb21wb25lbnQgVHJlZSB3aXRoIERJXShndWlkZS9kZXBlbmRlbmN5LWluamVjdGlvbi1uYXZ0cmVlKVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFRlbXBsYXRlUmVmPEM+IHtcbiAgLyoqXG4gICAqIFRoZSBhbmNob3IgZWxlbWVudCBpbiB0aGUgcGFyZW50IHZpZXcgZm9yIHRoaXMgZW1iZWRkZWQgdmlldy5cbiAgICpcbiAgICogVGhlIGRhdGEtYmluZGluZyBhbmQgaW5qZWN0aW9uIGNvbnRleHRzIG9mIGVtYmVkZGVkIHZpZXdzIGNyZWF0ZWQgZnJvbSB0aGlzIGBUZW1wbGF0ZVJlZmBcbiAgICogaW5oZXJpdCBmcm9tIHRoZSBjb250ZXh0cyBvZiB0aGlzIGxvY2F0aW9uLlxuICAgKlxuICAgKiBUeXBpY2FsbHkgbmV3IGVtYmVkZGVkIHZpZXdzIGFyZSBhdHRhY2hlZCB0byB0aGUgdmlldyBjb250YWluZXIgb2YgdGhpcyBsb2NhdGlvbiwgYnV0IGluXG4gICAqIGFkdmFuY2VkIHVzZS1jYXNlcywgdGhlIHZpZXcgY2FuIGJlIGF0dGFjaGVkIHRvIGEgZGlmZmVyZW50IGNvbnRhaW5lciB3aGlsZSBrZWVwaW5nIHRoZVxuICAgKiBkYXRhLWJpbmRpbmcgYW5kIGluamVjdGlvbiBjb250ZXh0IGZyb20gdGhlIG9yaWdpbmFsIGxvY2F0aW9uLlxuICAgKlxuICAgKi9cbiAgLy8gVE9ETyhpKTogcmVuYW1lIHRvIGFuY2hvciBvciBsb2NhdGlvblxuICBhYnN0cmFjdCBnZXQgZWxlbWVudFJlZigpOiBFbGVtZW50UmVmO1xuXG4gIC8qKlxuICAgKiBJbnN0YW50aWF0ZXMgYW4gZW1iZWRkZWQgdmlldyBiYXNlZCBvbiB0aGlzIHRlbXBsYXRlLFxuICAgKiBhbmQgYXR0YWNoZXMgaXQgdG8gdGhlIHZpZXcgY29udGFpbmVyLlxuICAgKiBAcGFyYW0gY29udGV4dCBUaGUgZGF0YS1iaW5kaW5nIGNvbnRleHQgb2YgdGhlIGVtYmVkZGVkIHZpZXcsIGFzIGRlY2xhcmVkXG4gICAqIGluIHRoZSBgPG5nLXRlbXBsYXRlPmAgdXNhZ2UuXG4gICAqIEByZXR1cm5zIFRoZSBuZXcgZW1iZWRkZWQgdmlldyBvYmplY3QuXG4gICAqL1xuICBhYnN0cmFjdCBjcmVhdGVFbWJlZGRlZFZpZXcoY29udGV4dDogQyk6IEVtYmVkZGVkVmlld1JlZjxDPjtcblxuICAvKiogQGludGVybmFsICovXG4gIHN0YXRpYyBfX05HX0VMRU1FTlRfSURfXzpcbiAgICAgICgpID0+IFRlbXBsYXRlUmVmPGFueT58IG51bGwgPSAoKSA9PiBTV0lUQ0hfVEVNUExBVEVfUkVGX0ZBQ1RPUlkoVGVtcGxhdGVSZWYsIEVsZW1lbnRSZWYpXG59XG5cbmV4cG9ydCBjb25zdCBTV0lUQ0hfVEVNUExBVEVfUkVGX0ZBQ1RPUllfX1BPU1RfUjNfXyA9IHJlbmRlcjNJbmplY3RUZW1wbGF0ZVJlZjtcbmNvbnN0IFNXSVRDSF9URU1QTEFURV9SRUZfRkFDVE9SWV9fUFJFX1IzX18gPSBub29wO1xuY29uc3QgU1dJVENIX1RFTVBMQVRFX1JFRl9GQUNUT1JZOiB0eXBlb2YgcmVuZGVyM0luamVjdFRlbXBsYXRlUmVmID1cbiAgICBTV0lUQ0hfVEVNUExBVEVfUkVGX0ZBQ1RPUllfX1BSRV9SM19fO1xuIl19