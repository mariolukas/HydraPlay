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
import { NgModuleFactory as R3NgModuleFactory } from '../render3/ng_module_ref';
import { stringify } from '../util';
/**
 * Used to load ng module factories.
 *
 * \@publicApi
 * @abstract
 */
export class NgModuleFactoryLoader {
}
if (false) {
    /**
     * @abstract
     * @param {?} path
     * @return {?}
     */
    NgModuleFactoryLoader.prototype.load = function (path) { };
}
/**
 * Map of module-id to the corresponding NgModule.
 * - In pre Ivy we track NgModuleFactory,
 * - In post Ivy we track the NgModuleType
 * @type {?}
 */
const modules = new Map();
/**
 * Registers a loaded module. Should only be called from generated NgModuleFactory code.
 * \@publicApi
 * @param {?} id
 * @param {?} factory
 * @return {?}
 */
export function registerModuleFactory(id, factory) {
    /** @type {?} */
    const existing = (/** @type {?} */ (modules.get(id)));
    assertNotExisting(id, existing && existing.moduleType);
    modules.set(id, factory);
}
/**
 * @param {?} id
 * @param {?} type
 * @return {?}
 */
function assertNotExisting(id, type) {
    if (type) {
        throw new Error(`Duplicate module registered for ${id} - ${stringify(type)} vs ${stringify(type.name)}`);
    }
}
/**
 * @param {?} id
 * @param {?} ngModuleType
 * @return {?}
 */
export function registerNgModuleType(id, ngModuleType) {
    /** @type {?} */
    const existing = (/** @type {?} */ (modules.get(id)));
    assertNotExisting(id, existing);
    modules.set(id, ngModuleType);
}
/**
 * @return {?}
 */
export function clearModulesForTest() {
    modules.clear();
}
/**
 * @param {?} id
 * @return {?}
 */
export function getModuleFactory__PRE_R3__(id) {
    /** @type {?} */
    const factory = (/** @type {?} */ (modules.get(id)));
    if (!factory)
        throw noModuleError(id);
    return factory;
}
/**
 * @param {?} id
 * @return {?}
 */
export function getModuleFactory__POST_R3__(id) {
    /** @type {?} */
    const type = (/** @type {?} */ (modules.get(id)));
    if (!type)
        throw noModuleError(id);
    return new R3NgModuleFactory(type);
}
/**
 * Returns the NgModuleFactory with the given id, if it exists and has been loaded.
 * Factories for modules that do not specify an `id` cannot be retrieved. Throws if the module
 * cannot be found.
 * \@publicApi
 * @type {?}
 */
export const getModuleFactory = getModuleFactory__PRE_R3__;
/**
 * @param {?} id
 * @return {?}
 */
function noModuleError(id) {
    return new Error(`No module with ID ${id} loaded`);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfbW9kdWxlX2ZhY3RvcnlfbG9hZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvbGlua2VyL25nX21vZHVsZV9mYWN0b3J5X2xvYWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBQyxlQUFlLElBQUksaUJBQWlCLEVBQWUsTUFBTSwwQkFBMEIsQ0FBQztBQUU1RixPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sU0FBUyxDQUFDOzs7Ozs7O0FBUWxDLE1BQU0sT0FBZ0IscUJBQXFCO0NBRTFDOzs7Ozs7O0lBREMsMkRBQTJEOzs7Ozs7OztNQVF2RCxPQUFPLEdBQUcsSUFBSSxHQUFHLEVBQTZDOzs7Ozs7OztBQU1wRSxNQUFNLFVBQVUscUJBQXFCLENBQUMsRUFBVSxFQUFFLE9BQTZCOztVQUN2RSxRQUFRLEdBQUcsbUJBQUEsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBd0I7SUFDeEQsaUJBQWlCLENBQUMsRUFBRSxFQUFFLFFBQVEsSUFBSSxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDdkQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDM0IsQ0FBQzs7Ozs7O0FBRUQsU0FBUyxpQkFBaUIsQ0FBQyxFQUFVLEVBQUUsSUFBcUI7SUFDMUQsSUFBSSxJQUFJLEVBQUU7UUFDUixNQUFNLElBQUksS0FBSyxDQUNYLG1DQUFtQyxFQUFFLE1BQU0sU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQzlGO0FBQ0gsQ0FBQzs7Ozs7O0FBRUQsTUFBTSxVQUFVLG9CQUFvQixDQUFDLEVBQVUsRUFBRSxZQUEwQjs7VUFDbkUsUUFBUSxHQUFHLG1CQUFBLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQXVCO0lBQ3ZELGlCQUFpQixDQUFDLEVBQUUsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUNoQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxZQUFZLENBQUMsQ0FBQztBQUNoQyxDQUFDOzs7O0FBRUQsTUFBTSxVQUFVLG1CQUFtQjtJQUNqQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDbEIsQ0FBQzs7Ozs7QUFFRCxNQUFNLFVBQVUsMEJBQTBCLENBQUMsRUFBVTs7VUFDN0MsT0FBTyxHQUFHLG1CQUFBLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQThCO0lBQzdELElBQUksQ0FBQyxPQUFPO1FBQUUsTUFBTSxhQUFhLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDdEMsT0FBTyxPQUFPLENBQUM7QUFDakIsQ0FBQzs7Ozs7QUFFRCxNQUFNLFVBQVUsMkJBQTJCLENBQUMsRUFBVTs7VUFDOUMsSUFBSSxHQUFHLG1CQUFBLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQXVCO0lBQ25ELElBQUksQ0FBQyxJQUFJO1FBQUUsTUFBTSxhQUFhLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDbkMsT0FBTyxJQUFJLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3JDLENBQUM7Ozs7Ozs7O0FBUUQsTUFBTSxPQUFPLGdCQUFnQixHQUF5QywwQkFBMEI7Ozs7O0FBRWhHLFNBQVMsYUFBYSxDQUFDLEVBQVU7SUFDL0IsT0FBTyxJQUFJLEtBQUssQ0FBQyxxQkFBcUIsRUFBRSxTQUFTLENBQUMsQ0FBQztBQUNyRCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge05nTW9kdWxlRmFjdG9yeSBhcyBSM05nTW9kdWxlRmFjdG9yeSwgTmdNb2R1bGVUeXBlfSBmcm9tICcuLi9yZW5kZXIzL25nX21vZHVsZV9yZWYnO1xuaW1wb3J0IHtUeXBlfSBmcm9tICcuLi90eXBlJztcbmltcG9ydCB7c3RyaW5naWZ5fSBmcm9tICcuLi91dGlsJztcbmltcG9ydCB7TmdNb2R1bGVGYWN0b3J5fSBmcm9tICcuL25nX21vZHVsZV9mYWN0b3J5JztcblxuLyoqXG4gKiBVc2VkIHRvIGxvYWQgbmcgbW9kdWxlIGZhY3Rvcmllcy5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBOZ01vZHVsZUZhY3RvcnlMb2FkZXIge1xuICBhYnN0cmFjdCBsb2FkKHBhdGg6IHN0cmluZyk6IFByb21pc2U8TmdNb2R1bGVGYWN0b3J5PGFueT4+O1xufVxuXG4vKipcbiAqIE1hcCBvZiBtb2R1bGUtaWQgdG8gdGhlIGNvcnJlc3BvbmRpbmcgTmdNb2R1bGUuXG4gKiAtIEluIHByZSBJdnkgd2UgdHJhY2sgTmdNb2R1bGVGYWN0b3J5LFxuICogLSBJbiBwb3N0IEl2eSB3ZSB0cmFjayB0aGUgTmdNb2R1bGVUeXBlXG4gKi9cbmNvbnN0IG1vZHVsZXMgPSBuZXcgTWFwPHN0cmluZywgTmdNb2R1bGVGYWN0b3J5PGFueT58TmdNb2R1bGVUeXBlPigpO1xuXG4vKipcbiAqIFJlZ2lzdGVycyBhIGxvYWRlZCBtb2R1bGUuIFNob3VsZCBvbmx5IGJlIGNhbGxlZCBmcm9tIGdlbmVyYXRlZCBOZ01vZHVsZUZhY3RvcnkgY29kZS5cbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyTW9kdWxlRmFjdG9yeShpZDogc3RyaW5nLCBmYWN0b3J5OiBOZ01vZHVsZUZhY3Rvcnk8YW55Pikge1xuICBjb25zdCBleGlzdGluZyA9IG1vZHVsZXMuZ2V0KGlkKSBhcyBOZ01vZHVsZUZhY3Rvcnk8YW55PjtcbiAgYXNzZXJ0Tm90RXhpc3RpbmcoaWQsIGV4aXN0aW5nICYmIGV4aXN0aW5nLm1vZHVsZVR5cGUpO1xuICBtb2R1bGVzLnNldChpZCwgZmFjdG9yeSk7XG59XG5cbmZ1bmN0aW9uIGFzc2VydE5vdEV4aXN0aW5nKGlkOiBzdHJpbmcsIHR5cGU6IFR5cGU8YW55PnwgbnVsbCk6IHZvaWQge1xuICBpZiAodHlwZSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYER1cGxpY2F0ZSBtb2R1bGUgcmVnaXN0ZXJlZCBmb3IgJHtpZH0gLSAke3N0cmluZ2lmeSh0eXBlKX0gdnMgJHtzdHJpbmdpZnkodHlwZS5uYW1lKX1gKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJOZ01vZHVsZVR5cGUoaWQ6IHN0cmluZywgbmdNb2R1bGVUeXBlOiBOZ01vZHVsZVR5cGUpIHtcbiAgY29uc3QgZXhpc3RpbmcgPSBtb2R1bGVzLmdldChpZCkgYXMgTmdNb2R1bGVUeXBlIHwgbnVsbDtcbiAgYXNzZXJ0Tm90RXhpc3RpbmcoaWQsIGV4aXN0aW5nKTtcbiAgbW9kdWxlcy5zZXQoaWQsIG5nTW9kdWxlVHlwZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjbGVhck1vZHVsZXNGb3JUZXN0KCk6IHZvaWQge1xuICBtb2R1bGVzLmNsZWFyKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRNb2R1bGVGYWN0b3J5X19QUkVfUjNfXyhpZDogc3RyaW5nKTogTmdNb2R1bGVGYWN0b3J5PGFueT4ge1xuICBjb25zdCBmYWN0b3J5ID0gbW9kdWxlcy5nZXQoaWQpIGFzIE5nTW9kdWxlRmFjdG9yeTxhbnk+fCBudWxsO1xuICBpZiAoIWZhY3RvcnkpIHRocm93IG5vTW9kdWxlRXJyb3IoaWQpO1xuICByZXR1cm4gZmFjdG9yeTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldE1vZHVsZUZhY3RvcnlfX1BPU1RfUjNfXyhpZDogc3RyaW5nKTogTmdNb2R1bGVGYWN0b3J5PGFueT4ge1xuICBjb25zdCB0eXBlID0gbW9kdWxlcy5nZXQoaWQpIGFzIE5nTW9kdWxlVHlwZSB8IG51bGw7XG4gIGlmICghdHlwZSkgdGhyb3cgbm9Nb2R1bGVFcnJvcihpZCk7XG4gIHJldHVybiBuZXcgUjNOZ01vZHVsZUZhY3RvcnkodHlwZSk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgTmdNb2R1bGVGYWN0b3J5IHdpdGggdGhlIGdpdmVuIGlkLCBpZiBpdCBleGlzdHMgYW5kIGhhcyBiZWVuIGxvYWRlZC5cbiAqIEZhY3RvcmllcyBmb3IgbW9kdWxlcyB0aGF0IGRvIG5vdCBzcGVjaWZ5IGFuIGBpZGAgY2Fubm90IGJlIHJldHJpZXZlZC4gVGhyb3dzIGlmIHRoZSBtb2R1bGVcbiAqIGNhbm5vdCBiZSBmb3VuZC5cbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNvbnN0IGdldE1vZHVsZUZhY3Rvcnk6IChpZDogc3RyaW5nKSA9PiBOZ01vZHVsZUZhY3Rvcnk8YW55PiA9IGdldE1vZHVsZUZhY3RvcnlfX1BSRV9SM19fO1xuXG5mdW5jdGlvbiBub01vZHVsZUVycm9yKGlkOiBzdHJpbmcsICk6IEVycm9yIHtcbiAgcmV0dXJuIG5ldyBFcnJvcihgTm8gbW9kdWxlIHdpdGggSUQgJHtpZH0gbG9hZGVkYCk7XG59XG4iXX0=