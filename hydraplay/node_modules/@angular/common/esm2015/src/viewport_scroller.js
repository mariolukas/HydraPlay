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
import { defineInjectable, inject } from '@angular/core';
import { DOCUMENT } from './dom_tokens';
/**
 * Defines a scroll position manager. Implemented by `BrowserViewportScroller`.
 *
 * \@publicApi
 * @abstract
 */
export class ViewportScroller {
}
// De-sugared tree-shakable injection
// See #23917
/** @nocollapse */
/** @nocollapse */ ViewportScroller.ngInjectableDef = defineInjectable({ providedIn: 'root', factory: () => new BrowserViewportScroller(inject(DOCUMENT), window) });
if (false) {
    /**
     * @nocollapse
     * @type {?}
     */
    ViewportScroller.ngInjectableDef;
    /**
     * Configures the top offset used when scrolling to an anchor.
     * @abstract
     * @param {?} offset A position in screen coordinates (a tuple with x and y values)
     * or a function that returns the top offset position.
     *
     * @return {?}
     */
    ViewportScroller.prototype.setOffset = function (offset) { };
    /**
     * Retrieves the current scroll position.
     * @abstract
     * @return {?} A position in screen coordinates (a tuple with x and y values).
     */
    ViewportScroller.prototype.getScrollPosition = function () { };
    /**
     * Scrolls to a specified position.
     * @abstract
     * @param {?} position A position in screen coordinates (a tuple with x and y values).
     * @return {?}
     */
    ViewportScroller.prototype.scrollToPosition = function (position) { };
    /**
     * Scrolls to an anchor element.
     * @abstract
     * @param {?} anchor The ID of the anchor element.
     * @return {?}
     */
    ViewportScroller.prototype.scrollToAnchor = function (anchor) { };
    /**
     * Disables automatic scroll restoration provided by the browser.
     * See also [window.history.scrollRestoration
     * info](https://developers.google.com/web/updates/2015/09/history-api-scroll-restoration).
     * @abstract
     * @param {?} scrollRestoration
     * @return {?}
     */
    ViewportScroller.prototype.setHistoryScrollRestoration = function (scrollRestoration) { };
}
/**
 * Manages the scroll position for a browser window.
 */
export class BrowserViewportScroller {
    /**
     * @param {?} document
     * @param {?} window
     */
    constructor(document, window) {
        this.document = document;
        this.window = window;
        this.offset = () => [0, 0];
    }
    /**
     * Configures the top offset used when scrolling to an anchor.
     * @param {?} offset A position in screen coordinates (a tuple with x and y values)
     * or a function that returns the top offset position.
     *
     * @return {?}
     */
    setOffset(offset) {
        if (Array.isArray(offset)) {
            this.offset = () => offset;
        }
        else {
            this.offset = offset;
        }
    }
    /**
     * Retrieves the current scroll position.
     * @return {?} The position in screen coordinates.
     */
    getScrollPosition() {
        if (this.supportScrollRestoration()) {
            return [this.window.scrollX, this.window.scrollY];
        }
        else {
            return [0, 0];
        }
    }
    /**
     * Sets the scroll position.
     * @param {?} position The new position in screen coordinates.
     * @return {?}
     */
    scrollToPosition(position) {
        if (this.supportScrollRestoration()) {
            this.window.scrollTo(position[0], position[1]);
        }
    }
    /**
     * Scrolls to an anchor element.
     * @param {?} anchor The ID of the anchor element.
     * @return {?}
     */
    scrollToAnchor(anchor) {
        if (this.supportScrollRestoration()) {
            /** @type {?} */
            const elSelectedById = this.document.querySelector(`#${anchor}`);
            if (elSelectedById) {
                this.scrollToElement(elSelectedById);
                return;
            }
            /** @type {?} */
            const elSelectedByName = this.document.querySelector(`[name='${anchor}']`);
            if (elSelectedByName) {
                this.scrollToElement(elSelectedByName);
                return;
            }
        }
    }
    /**
     * Disables automatic scroll restoration provided by the browser.
     * @param {?} scrollRestoration
     * @return {?}
     */
    setHistoryScrollRestoration(scrollRestoration) {
        if (this.supportScrollRestoration()) {
            /** @type {?} */
            const history = this.window.history;
            if (history && history.scrollRestoration) {
                history.scrollRestoration = scrollRestoration;
            }
        }
    }
    /**
     * @private
     * @param {?} el
     * @return {?}
     */
    scrollToElement(el) {
        /** @type {?} */
        const rect = el.getBoundingClientRect();
        /** @type {?} */
        const left = rect.left + this.window.pageXOffset;
        /** @type {?} */
        const top = rect.top + this.window.pageYOffset;
        /** @type {?} */
        const offset = this.offset();
        this.window.scrollTo(left - offset[0], top - offset[1]);
    }
    /**
     * We only support scroll restoration when we can get a hold of window.
     * This means that we do not support this behavior when running in a web worker.
     *
     * Lifting this restriction right now would require more changes in the dom adapter.
     * Since webworkers aren't widely used, we will lift it once RouterScroller is
     * battle-tested.
     * @private
     * @return {?}
     */
    supportScrollRestoration() {
        try {
            return !!this.window && !!this.window.scrollTo;
        }
        catch (_a) {
            return false;
        }
    }
}
if (false) {
    /**
     * @type {?}
     * @private
     */
    BrowserViewportScroller.prototype.offset;
    /**
     * @type {?}
     * @private
     */
    BrowserViewportScroller.prototype.document;
    /**
     * @type {?}
     * @private
     */
    BrowserViewportScroller.prototype.window;
}
/**
 * Provides an empty implementation of the viewport scroller. This will
 * live in \@angular/common as it will be used by both platform-server and platform-webworker.
 */
export class NullViewportScroller {
    /**
     * Empty implementation
     * @param {?} offset
     * @return {?}
     */
    setOffset(offset) { }
    /**
     * Empty implementation
     * @return {?}
     */
    getScrollPosition() { return [0, 0]; }
    /**
     * Empty implementation
     * @param {?} position
     * @return {?}
     */
    scrollToPosition(position) { }
    /**
     * Empty implementation
     * @param {?} anchor
     * @return {?}
     */
    scrollToAnchor(anchor) { }
    /**
     * Empty implementation
     * @param {?} scrollRestoration
     * @return {?}
     */
    setHistoryScrollRestoration(scrollRestoration) { }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld3BvcnRfc2Nyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL3ZpZXdwb3J0X3Njcm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBUUEsT0FBTyxFQUFDLGdCQUFnQixFQUFFLE1BQU0sRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUV2RCxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sY0FBYyxDQUFDOzs7Ozs7O0FBT3RDLE1BQU0sT0FBZ0IsZ0JBQWdCOzs7OztBQUk3QixnQ0FBZSxHQUFHLGdCQUFnQixDQUNyQyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksdUJBQXVCLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxFQUFDLENBQUMsQ0FBQzs7Ozs7O0lBRGhHLGlDQUNnRzs7Ozs7Ozs7O0lBUWhHLDZEQUE0RTs7Ozs7O0lBTTVFLCtEQUErQzs7Ozs7OztJQU0vQyxzRUFBNEQ7Ozs7Ozs7SUFNNUQsa0VBQThDOzs7Ozs7Ozs7SUFPOUMsMEZBQStFOzs7OztBQU1qRixNQUFNLE9BQU8sdUJBQXVCOzs7OztJQUdsQyxZQUFvQixRQUFhLEVBQVUsTUFBVztRQUFsQyxhQUFRLEdBQVIsUUFBUSxDQUFLO1FBQVUsV0FBTSxHQUFOLE1BQU0sQ0FBSztRQUY5QyxXQUFNLEdBQTJCLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBRUcsQ0FBQzs7Ozs7Ozs7SUFRMUQsU0FBUyxDQUFDLE1BQWlEO1FBQ3pELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUN6QixJQUFJLENBQUMsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQztTQUM1QjthQUFNO1lBQ0wsSUFBSSxDQUFDLE1BQU0sR0FBRyxN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QVMsQ0FBQztDQUN6RSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtkZWZpbmVJbmplY3RhYmxlLCBpbmplY3R9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICcuL2RvbV90b2tlbnMnO1xuXG4vKipcbiAqIERlZmluZXMgYSBzY3JvbGwgcG9zaXRpb24gbWFuYWdlci4gSW1wbGVtZW50ZWQgYnkgYEJyb3dzZXJWaWV3cG9ydFNjcm9sbGVyYC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBWaWV3cG9ydFNjcm9sbGVyIHtcbiAgLy8gRGUtc3VnYXJlZCB0cmVlLXNoYWthYmxlIGluamVjdGlvblxuICAvLyBTZWUgIzIzOTE3XG4gIC8qKiBAbm9jb2xsYXBzZSAqL1xuICBzdGF0aWMgbmdJbmplY3RhYmxlRGVmID0gZGVmaW5lSW5qZWN0YWJsZShcbiAgICAgIHtwcm92aWRlZEluOiAncm9vdCcsIGZhY3Rvcnk6ICgpID0+IG5ldyBCcm93c2VyVmlld3BvcnRTY3JvbGxlcihpbmplY3QoRE9DVU1FTlQpLCB3aW5kb3cpfSk7XG5cbiAgLyoqXG4gICAqIENvbmZpZ3VyZXMgdGhlIHRvcCBvZmZzZXQgdXNlZCB3aGVuIHNjcm9sbGluZyB0byBhbiBhbmNob3IuXG4gICAqIEBwYXJhbSBvZmZzZXQgQSBwb3NpdGlvbiBpbiBzY3JlZW4gY29vcmRpbmF0ZXMgKGEgdHVwbGUgd2l0aCB4IGFuZCB5IHZhbHVlcylcbiAgICogb3IgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgdGhlIHRvcCBvZmZzZXQgcG9zaXRpb24uXG4gICAqXG4gICAqL1xuICBhYnN0cmFjdCBzZXRPZmZzZXQob2Zmc2V0OiBbbnVtYmVyLCBudW1iZXJdfCgoKSA9PiBbbnVtYmVyLCBudW1iZXJdKSk6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlcyB0aGUgY3VycmVudCBzY3JvbGwgcG9zaXRpb24uXG4gICAqIEByZXR1cm5zIEEgcG9zaXRpb24gaW4gc2NyZWVuIGNvb3JkaW5hdGVzIChhIHR1cGxlIHdpdGggeCBhbmQgeSB2YWx1ZXMpLlxuICAgKi9cbiAgYWJzdHJhY3QgZ2V0U2Nyb2xsUG9zaXRpb24oKTogW251bWJlciwgbnVtYmVyXTtcblxuICAvKipcbiAgICogU2Nyb2xscyB0byBhIHNwZWNpZmllZCBwb3NpdGlvbi5cbiAgICogQHBhcmFtIHBvc2l0aW9uIEEgcG9zaXRpb24gaW4gc2NyZWVuIGNvb3JkaW5hdGVzIChhIHR1cGxlIHdpdGggeCBhbmQgeSB2YWx1ZXMpLlxuICAgKi9cbiAgYWJzdHJhY3Qgc2Nyb2xsVG9Qb3NpdGlvbihwb3NpdGlvbjogW251bWJlciwgbnVtYmVyXSk6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIFNjcm9sbHMgdG8gYW4gYW5jaG9yIGVsZW1lbnQuXG4gICAqIEBwYXJhbSBhbmNob3IgVGhlIElEIG9mIHRoZSBhbmNob3IgZWxlbWVudC5cbiAgICovXG4gIGFic3RyYWN0IHNjcm9sbFRvQW5jaG9yKGFuY2hvcjogc3RyaW5nKTogdm9pZDtcblxuICAvKipcbiAgICogRGlzYWJsZXMgYXV0b21hdGljIHNjcm9sbCByZXN0b3JhdGlvbiBwcm92aWRlZCBieSB0aGUgYnJvd3Nlci5cbiAgICogU2VlIGFsc28gW3dpbmRvdy5oaXN0b3J5LnNjcm9sbFJlc3RvcmF0aW9uXG4gICAqIGluZm9dKGh0dHBzOi8vZGV2ZWxvcGVycy5nb29nbGUuY29tL3dlYi91cGRhdGVzLzIwMTUvMDkvaGlzdG9yeS1hcGktc2Nyb2xsLXJlc3RvcmF0aW9uKS5cbiAgICovXG4gIGFic3RyYWN0IHNldEhpc3RvcnlTY3JvbGxSZXN0b3JhdGlvbihzY3JvbGxSZXN0b3JhdGlvbjogJ2F1dG8nfCdtYW51YWwnKTogdm9pZDtcbn1cblxuLyoqXG4gKiBNYW5hZ2VzIHRoZSBzY3JvbGwgcG9zaXRpb24gZm9yIGEgYnJvd3NlciB3aW5kb3cuXG4gKi9cbmV4cG9ydCBjbGFzcyBCcm93c2VyVmlld3BvcnRTY3JvbGxlciBpbXBsZW1lbnRzIFZpZXdwb3J0U2Nyb2xsZXIge1xuICBwcml2YXRlIG9mZnNldDogKCkgPT4gW251bWJlciwgbnVtYmVyXSA9ICgpID0+IFswLCAwXTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGRvY3VtZW50OiBhbnksIHByaXZhdGUgd2luZG93OiBhbnkpIHt9XG5cbiAgLyoqXG4gICAqIENvbmZpZ3VyZXMgdGhlIHRvcCBvZmZzZXQgdXNlZCB3aGVuIHNjcm9sbGluZyB0byBhbiBhbmNob3IuXG4gICAqIEBwYXJhbSBvZmZzZXQgQSBwb3NpdGlvbiBpbiBzY3JlZW4gY29vcmRpbmF0ZXMgKGEgdHVwbGUgd2l0aCB4IGFuZCB5IHZhbHVlcylcbiAgICogb3IgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgdGhlIHRvcCBvZmZzZXQgcG9zaXRpb24uXG4gICAqXG4gICAqL1xuICBzZXRPZmZzZXQob2Zmc2V0OiBbbnVtYmVyLCBudW1iZXJdfCgoKSA9PiBbbnVtYmVyLCBudW1iZXJdKSk6IHZvaWQge1xuICAgIGlmIChBcnJheS5pc0FycmF5KG9mZnNldCkpIHtcbiAgICAgIHRoaXMub2Zmc2V0ID0gKCkgPT4gb2Zmc2V0O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm9mZnNldCA9IG9mZnNldDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0cmlldmVzIHRoZSBjdXJyZW50IHNjcm9sbCBwb3NpdGlvbi5cbiAgICogQHJldHVybnMgVGhlIHBvc2l0aW9uIGluIHNjcmVlbiBjb29yZGluYXRlcy5cbiAgICovXG4gIGdldFNjcm9sbFBvc2l0aW9uKCk6IFtudW1iZXIsIG51bWJlcl0ge1xuICAgIGlmICh0aGlzLnN1cHBvcnRTY3JvbGxSZXN0b3JhdGlvbigpKSB7XG4gICAgICByZXR1cm4gW3RoaXMud2luZG93LnNjcm9sbFgsIHRoaXMud2luZG93LnNjcm9sbFldO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gWzAsIDBdO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBzY3JvbGwgcG9zaXRpb24uXG4gICAqIEBwYXJhbSBwb3NpdGlvbiBUaGUgbmV3IHBvc2l0aW9uIGluIHNjcmVlbiBjb29yZGluYXRlcy5cbiAgICovXG4gIHNjcm9sbFRvUG9zaXRpb24ocG9zaXRpb246IFtudW1iZXIsIG51bWJlcl0pOiB2b2lkIHtcbiAgICBpZiAodGhpcy5zdXBwb3J0U2Nyb2xsUmVzdG9yYXRpb24oKSkge1xuICAgICAgdGhpcy53aW5kb3cuc2Nyb2xsVG8ocG9zaXRpb25bMF0sIHBvc2l0aW9uWzFdKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2Nyb2xscyB0byBhbiBhbmNob3IgZWxlbWVudC5cbiAgICogQHBhcmFtIGFuY2hvciBUaGUgSUQgb2YgdGhlIGFuY2hvciBlbGVtZW50LlxuICAgKi9cbiAgc2Nyb2xsVG9BbmNob3IoYW5jaG9yOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5zdXBwb3J0U2Nyb2xsUmVzdG9yYXRpb24oKSkge1xuICAgICAgY29uc3QgZWxTZWxlY3RlZEJ5SWQgPSB0aGlzLmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCMke2FuY2hvcn1gKTtcbiAgICAgIGlmIChlbFNlbGVjdGVkQnlJZCkge1xuICAgICAgICB0aGlzLnNjcm9sbFRvRWxlbWVudChlbFNlbGVjdGVkQnlJZCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGVsU2VsZWN0ZWRCeU5hbWUgPSB0aGlzLmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtuYW1lPScke2FuY2hvcn0nXWApO1xuICAgICAgaWYgKGVsU2VsZWN0ZWRCeU5hbWUpIHtcbiAgICAgICAgdGhpcy5zY3JvbGxUb0VsZW1lbnQoZWxTZWxlY3RlZEJ5TmFtZSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRGlzYWJsZXMgYXV0b21hdGljIHNjcm9sbCByZXN0b3JhdGlvbiBwcm92aWRlZCBieSB0aGUgYnJvd3Nlci5cbiAgICovXG4gIHNldEhpc3RvcnlTY3JvbGxSZXN0b3JhdGlvbihzY3JvbGxSZXN0b3JhdGlvbjogJ2F1dG8nfCdtYW51YWwnKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuc3VwcG9ydFNjcm9sbFJlc3RvcmF0aW9uKCkpIHtcbiAgICAgIGNvbnN0IGhpc3RvcnkgPSB0aGlzLndpbmRvdy5oaXN0b3J5O1xuICAgICAgaWYgKGhpc3RvcnkgJiYgaGlzdG9yeS5zY3JvbGxSZXN0b3JhdGlvbikge1xuICAgICAgICBoaXN0b3J5LnNjcm9sbFJlc3RvcmF0aW9uID0gc2Nyb2xsUmVzdG9yYXRpb247XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBzY3JvbGxUb0VsZW1lbnQoZWw6IGFueSk6IHZvaWQge1xuICAgIGNvbnN0IHJlY3QgPSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBjb25zdCBsZWZ0ID0gcmVjdC5sZWZ0ICsgdGhpcy53aW5kb3cucGFnZVhPZmZzZXQ7XG4gICAgY29uc3QgdG9wID0gcmVjdC50b3AgKyB0aGlzLndpbmRvdy5wYWdlWU9mZnNldDtcbiAgICBjb25zdCBvZmZzZXQgPSB0aGlzLm9mZnNldCgpO1xuICAgIHRoaXMud2luZG93LnNjcm9sbFRvKGxlZnQgLSBvZmZzZXRbMF0sIHRvcCAtIG9mZnNldFsxXSk7XG4gIH1cblxuICAvKipcbiAgICogV2Ugb25seSBzdXBwb3J0IHNjcm9sbCByZXN0b3JhdGlvbiB3aGVuIHdlIGNhbiBnZXQgYSBob2xkIG9mIHdpbmRvdy5cbiAgICogVGhpcyBtZWFucyB0aGF0IHdlIGRvIG5vdCBzdXBwb3J0IHRoaXMgYmVoYXZpb3Igd2hlbiBydW5uaW5nIGluIGEgd2ViIHdvcmtlci5cbiAgICpcbiAgICogTGlmdGluZyB0aGlzIHJlc3RyaWN0aW9uIHJpZ2h0IG5vdyB3b3VsZCByZXF1aXJlIG1vcmUgY2hhbmdlcyBpbiB0aGUgZG9tIGFkYXB0ZXIuXG4gICAqIFNpbmNlIHdlYndvcmtlcnMgYXJlbid0IHdpZGVseSB1c2VkLCB3ZSB3aWxsIGxpZnQgaXQgb25jZSBSb3V0ZXJTY3JvbGxlciBpc1xuICAgKiBiYXR0bGUtdGVzdGVkLlxuICAgKi9cbiAgcHJpdmF0ZSBzdXBwb3J0U2Nyb2xsUmVzdG9yYXRpb24oKTogYm9vbGVhbiB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiAhIXRoaXMud2luZG93ICYmICEhdGhpcy53aW5kb3cuc2Nyb2xsVG87XG4gICAgfSBjYXRjaCB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG59XG5cblxuLyoqXG4gKiBQcm92aWRlcyBhbiBlbXB0eSBpbXBsZW1lbnRhdGlvbiBvZiB0aGUgdmlld3BvcnQgc2Nyb2xsZXIuIFRoaXMgd2lsbFxuICogbGl2ZSBpbiBAYW5ndWxhci9jb21tb24gYXMgaXQgd2lsbCBiZSB1c2VkIGJ5IGJvdGggcGxhdGZvcm0tc2VydmVyIGFuZCBwbGF0Zm9ybS13ZWJ3b3JrZXIuXG4gKi9cbmV4cG9ydCBjbGFzcyBOdWxsVmlld3BvcnRTY3JvbGxlciBpbXBsZW1lbnRzIFZpZXdwb3J0U2Nyb2xsZXIge1xuICAvKipcbiAgICogRW1wdHkgaW1wbGVtZW50YXRpb25cbiAgICovXG4gIHNldE9mZnNldChvZmZzZXQ6IFtudW1iZXIsIG51bWJlcl18KCgpID0+IFtudW1iZXIsIG51bWJlcl0pKTogdm9pZCB7fVxuXG4gIC8qKlxuICAgKiBFbXB0eSBpbXBsZW1lbnRhdGlvblxuICAgKi9cbiAgZ2V0U2Nyb2xsUG9zaXRpb24oKTogW251bWJlciwgbnVtYmVyXSB7IHJldHVybiBbMCwgMF07IH1cblxuICAvKipcbiAgICogRW1wdHkgaW1wbGVtZW50YXRpb25cbiAgICovXG4gIHNjcm9sbFRvUG9zaXRpb24ocG9zaXRpb246IFtudW1iZXIsIG51bWJlcl0pOiB2b2lkIHt9XG5cbiAgLyoqXG4gICAqIEVtcHR5IGltcGxlbWVudGF0aW9uXG4gICAqL1xuICBzY3JvbGxUb0FuY2hvcihhbmNob3I6IHN0cmluZyk6IHZvaWQge31cblxuICAvKipcbiAgICogRW1wdHkgaW1wbGVtZW50YXRpb25cbiAgICovXG4gIHNldEhpc3RvcnlTY3JvbGxSZXN0b3JhdGlvbihzY3JvbGxSZXN0b3JhdGlvbjogJ2F1dG8nfCdtYW51YWwnKTogdm9pZCB7fVxufSJdfQ==