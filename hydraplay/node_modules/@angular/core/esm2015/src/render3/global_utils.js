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
import { global } from '../util';
import { assertDefined } from './assert';
import { getComponent, getContext, getDirectives, getHostElement, getInjector, getListeners, getPlayers, getRootComponents, getViewComponent, markDirty } from './global_utils_api';
/**
 * This value reflects the property on the window where the dev
 * tools are patched (window.ng).
 *
 * @type {?}
 */
export const GLOBAL_PUBLISH_EXPANDO_KEY = 'ng';
/*
 * Publishes a collection of default debug tools onto `window._ng_`.
 *
 * These functions are available globally when Angular is in development
 * mode and are automatically stripped away from prod mode is on.
 */
/** @type {?} */
let _published = false;
/**
 * @return {?}
 */
export function publishDefaultGlobalUtils() {
    if (!_published) {
        _published = true;
        publishGlobalUtil('getComponent', getComponent);
        publishGlobalUtil('getContext', getContext);
        publishGlobalUtil('getListeners', getListeners);
        publishGlobalUtil('getViewComponent', getViewComponent);
        publishGlobalUtil('getHostElement', getHostElement);
        publishGlobalUtil('getInjector', getInjector);
        publishGlobalUtil('getRootComponents', getRootComponents);
        publishGlobalUtil('getDirectives', getDirectives);
        publishGlobalUtil('getPlayers', getPlayers);
        publishGlobalUtil('markDirty', markDirty);
    }
}
/**
 * Publishes the given function to `window.ngDevMode` so that it can be
 * used from the browser console when an application is not in production.
 * @param {?} name
 * @param {?} fn
 * @return {?}
 */
export function publishGlobalUtil(name, fn) {
    /** @type {?} */
    const w = (/** @type {?} */ ((/** @type {?} */ (global))));
    ngDevMode && assertDefined(fn, 'function not defined');
    if (w) {
        /** @type {?} */
        let container = w[GLOBAL_PUBLISH_EXPANDO_KEY];
        if (!container) {
            container = w[GLOBAL_PUBLISH_EXPANDO_KEY] = {};
        }
        container[name] = fn;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xvYmFsX3V0aWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvcmVuZGVyMy9nbG9iYWxfdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFPQSxPQUFPLEVBQUMsTUFBTSxFQUFDLE1BQU0sU0FBUyxDQUFDO0FBRS9CLE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFDdkMsT0FBTyxFQUFDLFlBQVksRUFBRSxVQUFVLEVBQUUsYUFBYSxFQUFFLGNBQWMsRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLFVBQVUsRUFBRSxpQkFBaUIsRUFBRSxnQkFBZ0IsRUFBRSxTQUFTLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQzs7Ozs7OztBQW9CbEwsTUFBTSxPQUFPLDBCQUEwQixHQUFHLElBQUk7Ozs7Ozs7O0lBUTFDLFVBQVUsR0FBRyxLQUFLOzs7O0FBQ3RCLE1BQU0sVUFBVSx5QkFBeUI7SUFDdkMsSUFBSSxDQUFDLFVBQVUsRUFBRTtRQUNmLFVBQVUsR0FBRyxJQUFJLENBQUM7UUFDbEIsaUJBQWlCLENBQUMsY0FBYyxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQ2hELGlCQUFpQixDQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztRQUM1QyxpQkFBaUIsQ0FBQyxjQUFjLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDaEQsaUJBQWlCLENBQUMsa0JBQWtCLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztRQUN4RCxpQkFBaUIsQ0FBQyxnQkFBZ0IsRUFBRSxjQUFjLENBQUMsQ0FBQztRQUNwRCxpQkFBaUIsQ0FBQyxhQUFhLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDOUMsaUJBQWlCLENBQUMsbUJBQW1CLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztRQUMxRCxpQkFBaUIsQ0FBQyxlQUFlLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFDbEQsaUJBQWlCLENBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQzVDLGlCQUFpQixDQUFDLFdBQVcsRUFBRSxTQUFTLENBQUMsQ0FBQztLQUMzQztBQUNILENBQUM7Ozs7Ozs7O0FBVUQsTUFBTSxVQUFVLGlCQUFpQixDQUFDLElBQVksRUFBRSxFQUFZOztVQUNwRCxDQUFDLEdBQUcsbUJBQUEsbUJBQUEsTUFBTSxFQUFPLEVBQTBCO0lBQ2pELFNBQVMsSUFBSSxhQUFhLENBQUMsRUFBRSxFQUFFLHNCQUFzQixDQUFDLENBQUM7SUFDdkQsSUFBSSxDQUFDLEVBQUU7O1lBQ0QsU0FBUyxHQUFHLENBQUMsQ0FBQywwQkFBMEIsQ0FBQztRQUM3QyxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQ2QsU0FBUyxHQUFHLENBQUMsQ0FBQywwQkFBMEIsQ0FBQyxHQUFHLEVBQUUsQ0FBQztTQUNoRDtRQUNELFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7S0FDdEI7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtnbG9iYWx9IGZyb20gJy4uL3V0aWwnO1xuXG5pbXBvcnQge2Fzc2VydERlZmluZWR9IGZyb20gJy4vYXNzZXJ0JztcbmltcG9ydCB7Z2V0Q29tcG9uZW50LCBnZXRDb250ZXh0LCBnZXREaXJlY3RpdmVzLCBnZXRIb3N0RWxlbWVudCwgZ2V0SW5qZWN0b3IsIGdldExpc3RlbmVycywgZ2V0UGxheWVycywgZ2V0Um9vdENvbXBvbmVudHMsIGdldFZpZXdDb21wb25lbnQsIG1hcmtEaXJ0eX0gZnJvbSAnLi9nbG9iYWxfdXRpbHNfYXBpJztcblxuXG5cbi8qKlxuICogVGhpcyBmaWxlIGludHJvZHVjZXMgc2VyaWVzIG9mIGdsb2JhbGx5IGFjY2Vzc2libGUgZGVidWcgdG9vbHNcbiAqIHRvIGFsbG93IGZvciB0aGUgQW5ndWxhciBkZWJ1Z2dpbmcgc3RvcnkgdG8gZnVuY3Rpb24uXG4gKlxuICogVG8gc2VlIHRoaXMgaW4gYWN0aW9uIHJ1biB0aGUgZm9sbG93aW5nIGNvbW1hbmQ6XG4gKlxuICogICBiYXplbCBydW4gLS1kZWZpbmU9Y29tcGlsZT1hb3RcbiAqICAgLy9wYWNrYWdlcy9jb3JlL3Rlc3QvYnVuZGxpbmcvdG9kbzpkZXZzZXJ2ZXJcbiAqXG4gKiAgVGhlbiBsb2FkIGBsb2NhbGhvc3Q6NTQzMmAgYW5kIHN0YXJ0IHVzaW5nIHRoZSBjb25zb2xlIHRvb2xzLlxuICovXG5cbi8qKlxuICogVGhpcyB2YWx1ZSByZWZsZWN0cyB0aGUgcHJvcGVydHkgb24gdGhlIHdpbmRvdyB3aGVyZSB0aGUgZGV2XG4gKiB0b29scyBhcmUgcGF0Y2hlZCAod2luZG93Lm5nKS5cbiAqICovXG5leHBvcnQgY29uc3QgR0xPQkFMX1BVQkxJU0hfRVhQQU5ET19LRVkgPSAnbmcnO1xuXG4vKlxuICogUHVibGlzaGVzIGEgY29sbGVjdGlvbiBvZiBkZWZhdWx0IGRlYnVnIHRvb2xzIG9udG8gYHdpbmRvdy5fbmdfYC5cbiAqXG4gKiBUaGVzZSBmdW5jdGlvbnMgYXJlIGF2YWlsYWJsZSBnbG9iYWxseSB3aGVuIEFuZ3VsYXIgaXMgaW4gZGV2ZWxvcG1lbnRcbiAqIG1vZGUgYW5kIGFyZSBhdXRvbWF0aWNhbGx5IHN0cmlwcGVkIGF3YXkgZnJvbSBwcm9kIG1vZGUgaXMgb24uXG4gKi9cbmxldCBfcHVibGlzaGVkID0gZmFsc2U7XG5leHBvcnQgZnVuY3Rpb24gcHVibGlzaERlZmF1bHRHbG9iYWxVdGlscygpIHtcbiAgaWYgKCFfcHVibGlzaGVkKSB7XG4gICAgX3B1Ymxpc2hlZCA9IHRydWU7XG4gICAgcHVibGlzaEdsb2JhbFV0aWwoJ2dldENvbXBvbmVudCcsIGdldENvbXBvbmVudCk7XG4gICAgcHVibGlzaEdsb2JhbFV0aWwoJ2dldENvbnRleHQnLCBnZXRDb250ZXh0KTtcbiAgICBwdWJsaXNoR2xvYmFsVXRpbCgnZ2V0TGlzdGVuZXJzJywgZ2V0TGlzdGVuZXJzKTtcbiAgICBwdWJsaXNoR2xvYmFsVXRpbCgnZ2V0Vmlld0NvbXBvbmVudCcsIGdldFZpZXdDb21wb25lbnQpO1xuICAgIHB1Ymxpc2hHbG9iYWxVdGlsKCdnZXRIb3N0RWxlbWVudCcsIGdldEhvc3RFbGVtZW50KTtcbiAgICBwdWJsaXNoR2xvYmFsVXRpbCgnZ2V0SW5qZWN0b3InLCBnZXRJbmplY3Rvcik7XG4gICAgcHVibGlzaEdsb2JhbFV0aWwoJ2dldFJvb3RDb21wb25lbnRzJywgZ2V0Um9vdENvbXBvbmVudHMpO1xuICAgIHB1Ymxpc2hHbG9iYWxVdGlsKCdnZXREaXJlY3RpdmVzJywgZ2V0RGlyZWN0aXZlcyk7XG4gICAgcHVibGlzaEdsb2JhbFV0aWwoJ2dldFBsYXllcnMnLCBnZXRQbGF5ZXJzKTtcbiAgICBwdWJsaXNoR2xvYmFsVXRpbCgnbWFya0RpcnR5JywgbWFya0RpcnR5KTtcbiAgfVxufVxuXG5leHBvcnQgZGVjbGFyZSB0eXBlIEdsb2JhbERldk1vZGVDb250YWluZXIgPSB7XG4gIFtHTE9CQUxfUFVCTElTSF9FWFBBTkRPX0tFWV06IHtbZm5OYW1lOiBzdHJpbmddOiBGdW5jdGlvbn07XG59O1xuXG4vKipcbiAqIFB1Ymxpc2hlcyB0aGUgZ2l2ZW4gZnVuY3Rpb24gdG8gYHdpbmRvdy5uZ0Rldk1vZGVgIHNvIHRoYXQgaXQgY2FuIGJlXG4gKiB1c2VkIGZyb20gdGhlIGJyb3dzZXIgY29uc29sZSB3aGVuIGFuIGFwcGxpY2F0aW9uIGlzIG5vdCBpbiBwcm9kdWN0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcHVibGlzaEdsb2JhbFV0aWwobmFtZTogc3RyaW5nLCBmbjogRnVuY3Rpb24pOiB2b2lkIHtcbiAgY29uc3QgdyA9IGdsb2JhbCBhcyBhbnkgYXMgR2xvYmFsRGV2TW9kZUNvbnRhaW5lcjtcbiAgbmdEZXZNb2RlICYmIGFzc2VydERlZmluZWQoZm4sICdmdW5jdGlvbiBub3QgZGVmaW5lZCcpO1xuICBpZiAodykge1xuICAgIGxldCBjb250YWluZXIgPSB3W0dMT0JBTF9QVUJMSVNIX0VYUEFORE9fS0VZXTtcbiAgICBpZiAoIWNvbnRhaW5lcikge1xuICAgICAgY29udGFpbmVyID0gd1tHTE9CQUxfUFVCTElTSF9FWFBBTkRPX0tFWV0gPSB7fTtcbiAgICB9XG4gICAgY29udGFpbmVyW25hbWVdID0gZm47XG4gIH1cbn1cbiJdfQ==