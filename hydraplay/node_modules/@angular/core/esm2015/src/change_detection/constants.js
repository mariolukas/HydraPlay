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
/** @enum {number} */
const ChangeDetectionStrategy = {
    /**
     * Use the `CheckOnce` strategy, meaning that automatic change detection is deactivated
     * until reactivated by setting the strategy to `Default` (`CheckAlways`).
     * Change detection can still be explicitly invoked.
     */
    OnPush: 0,
    /**
     * Use the default `CheckAlways` strategy, in which change detection is automatic until
     * explicitly deactivated.
     */
    Default: 1,
};
export { ChangeDetectionStrategy };
ChangeDetectionStrategy[ChangeDetectionStrategy.OnPush] = 'OnPush';
ChangeDetectionStrategy[ChangeDetectionStrategy.Default] = 'Default';
/** @enum {number} */
const ChangeDetectorStatus = {
    /**
     * A state in which, after calling `detectChanges()`, the change detector
     * state becomes `Checked`, and must be explicitly invoked or reactivated.
     */
    CheckOnce: 0,
    /**
     * A state in which change detection is skipped until the change detector mode
     * becomes `CheckOnce`.
     */
    Checked: 1,
    /**
     * A state in which change detection continues automatically until explicitly
     * deactivated.
     */
    CheckAlways: 2,
    /**
     * A state in which a change detector sub tree is not a part of the main tree and
     * should be skipped.
     */
    Detached: 3,
    /**
     * Indicates that the change detector encountered an error checking a binding
     * or calling a directive lifecycle method and is now in an inconsistent state. Change
     * detectors in this state do not detect changes.
     */
    Errored: 4,
    /**
     * Indicates that the change detector has been destroyed.
     */
    Destroyed: 5,
};
export { ChangeDetectorStatus };
ChangeDetectorStatus[ChangeDetectorStatus.CheckOnce] = 'CheckOnce';
ChangeDetectorStatus[ChangeDetectorStatus.Checked] = 'Checked';
ChangeDetectorStatus[ChangeDetectorStatus.CheckAlways] = 'CheckAlways';
ChangeDetectorStatus[ChangeDetectorStatus.Detached] = 'Detached';
ChangeDetectorStatus[ChangeDetectorStatus.Errored] = 'Errored';
ChangeDetectorStatus[ChangeDetectorStatus.Destroyed] = 'Destroyed';
/**
 * Reports whether a given strategy is currently the default for change detection.
 * @see `ChangeDetectorStatus` / `ChangeDetectorRef`
 * @param {?} changeDetectionStrategy The strategy to check.
 * @return {?} True if the given strategy is the current default, false otherwise.
 */
export function isDefaultChangeDetectionStrategy(changeDetectionStrategy) {
    return changeDetectionStrategy == null ||
        changeDetectionStrategy === ChangeDetectionStrategy.Default;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RhbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvY2hhbmdlX2RldGVjdGlvbi9jb25zdGFudHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztJQWdCRTs7OztPQUlHO0lBQ0gsU0FBVTtJQUVWOzs7T0FHRztJQUNILFVBQVc7Ozs7Ozs7SUFRWDs7O09BR0c7SUFDSCxZQUFTO0lBRVQ7OztPQUdHO0lBQ0gsVUFBTztJQUVQOzs7T0FHRztJQUNILGNBQVc7SUFFWDs7O09BR0c7SUFDSCxXQUFRO0lBRVI7Ozs7T0FJRztJQUNILFVBQU87SUFFUDs7T0FFRztJQUNILFlBQVM7Ozs7Ozs7Ozs7Ozs7OztBQVVYLE1BQU0sVUFBVSxnQ0FBZ0MsQ0FBQyx1QkFBZ0Q7SUFFL0YsT0FBTyx1QkFBdUIsSUFBSSxJQUFJO1FBQ2xDLHVCQUF1QixLQUFLLHVCQUF1QixDQUFDLE9BQU8sQ0FBQztBQUNsRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5cbi8qKlxuICogVGhlIHN0cmF0ZWd5IHRoYXQgdGhlIGRlZmF1bHQgY2hhbmdlIGRldGVjdG9yIHVzZXMgdG8gZGV0ZWN0IGNoYW5nZXMuXG4gKiBXaGVuIHNldCwgdGFrZXMgZWZmZWN0IHRoZSBuZXh0IHRpbWUgY2hhbmdlIGRldGVjdGlvbiBpcyB0cmlnZ2VyZWQuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZW51bSBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSB7XG4gIC8qKlxuICAgKiBVc2UgdGhlIGBDaGVja09uY2VgIHN0cmF0ZWd5LCBtZWFuaW5nIHRoYXQgYXV0b21hdGljIGNoYW5nZSBkZXRlY3Rpb24gaXMgZGVhY3RpdmF0ZWRcbiAgICogdW50aWwgcmVhY3RpdmF0ZWQgYnkgc2V0dGluZyB0aGUgc3RyYXRlZ3kgdG8gYERlZmF1bHRgIChgQ2hlY2tBbHdheXNgKS5cbiAgICogQ2hhbmdlIGRldGVjdGlvbiBjYW4gc3RpbGwgYmUgZXhwbGljaXRseSBpbnZva2VkLlxuICAgKi9cbiAgT25QdXNoID0gMCxcblxuICAvKipcbiAgICogVXNlIHRoZSBkZWZhdWx0IGBDaGVja0Fsd2F5c2Agc3RyYXRlZ3ksIGluIHdoaWNoIGNoYW5nZSBkZXRlY3Rpb24gaXMgYXV0b21hdGljIHVudGlsXG4gICAqIGV4cGxpY2l0bHkgZGVhY3RpdmF0ZWQuXG4gICAqL1xuICBEZWZhdWx0ID0gMSxcbn1cblxuLyoqXG4gKiBEZWZpbmVzIHRoZSBwb3NzaWJsZSBzdGF0ZXMgb2YgdGhlIGRlZmF1bHQgY2hhbmdlIGRldGVjdG9yLlxuICogQHNlZSBgQ2hhbmdlRGV0ZWN0b3JSZWZgXG4gKi9cbmV4cG9ydCBlbnVtIENoYW5nZURldGVjdG9yU3RhdHVzIHtcbiAgLyoqXG4gICAqIEEgc3RhdGUgaW4gd2hpY2gsIGFmdGVyIGNhbGxpbmcgYGRldGVjdENoYW5nZXMoKWAsIHRoZSBjaGFuZ2UgZGV0ZWN0b3JcbiAgICogc3RhdGUgYmVjb21lcyBgQ2hlY2tlZGAsIGFuZCBtdXN0IGJlIGV4cGxpY2l0bHkgaW52b2tlZCBvciByZWFjdGl2YXRlZC5cbiAgICovXG4gIENoZWNrT25jZSxcblxuICAvKipcbiAgICogQSBzdGF0ZSBpbiB3aGljaCBjaGFuZ2UgZGV0ZWN0aW9uIGlzIHNraXBwZWQgdW50aWwgdGhlIGNoYW5nZSBkZXRlY3RvciBtb2RlXG4gICAqIGJlY29tZXMgYENoZWNrT25jZWAuXG4gICAqL1xuICBDaGVja2VkLFxuXG4gIC8qKlxuICAgKiBBIHN0YXRlIGluIHdoaWNoIGNoYW5nZSBkZXRlY3Rpb24gY29udGludWVzIGF1dG9tYXRpY2FsbHkgdW50aWwgZXhwbGljaXRseVxuICAgKiBkZWFjdGl2YXRlZC5cbiAgICovXG4gIENoZWNrQWx3YXlzLFxuXG4gIC8qKlxuICAgKiBBIHN0YXRlIGluIHdoaWNoIGEgY2hhbmdlIGRldGVjdG9yIHN1YiB0cmVlIGlzIG5vdCBhIHBhcnQgb2YgdGhlIG1haW4gdHJlZSBhbmRcbiAgICogc2hvdWxkIGJlIHNraXBwZWQuXG4gICAqL1xuICBEZXRhY2hlZCxcblxuICAvKipcbiAgICogSW5kaWNhdGVzIHRoYXQgdGhlIGNoYW5nZSBkZXRlY3RvciBlbmNvdW50ZXJlZCBhbiBlcnJvciBjaGVja2luZyBhIGJpbmRpbmdcbiAgICogb3IgY2FsbGluZyBhIGRpcmVjdGl2ZSBsaWZlY3ljbGUgbWV0aG9kIGFuZCBpcyBub3cgaW4gYW4gaW5jb25zaXN0ZW50IHN0YXRlLiBDaGFuZ2VcbiAgICogZGV0ZWN0b3JzIGluIHRoaXMgc3RhdGUgZG8gbm90IGRldGVjdCBjaGFuZ2VzLlxuICAgKi9cbiAgRXJyb3JlZCxcblxuICAvKipcbiAgICogSW5kaWNhdGVzIHRoYXQgdGhlIGNoYW5nZSBkZXRlY3RvciBoYXMgYmVlbiBkZXN0cm95ZWQuXG4gICAqL1xuICBEZXN0cm95ZWQsXG59XG5cbi8qKlxuICogUmVwb3J0cyB3aGV0aGVyIGEgZ2l2ZW4gc3RyYXRlZ3kgaXMgY3VycmVudGx5IHRoZSBkZWZhdWx0IGZvciBjaGFuZ2UgZGV0ZWN0aW9uLlxuICogQHBhcmFtIGNoYW5nZURldGVjdGlvblN0cmF0ZWd5IFRoZSBzdHJhdGVneSB0byBjaGVjay5cbiAqIEByZXR1cm5zIFRydWUgaWYgdGhlIGdpdmVuIHN0cmF0ZWd5IGlzIHRoZSBjdXJyZW50IGRlZmF1bHQsIGZhbHNlIG90aGVyd2lzZS5cbiAqIEBzZWUgYENoYW5nZURldGVjdG9yU3RhdHVzYFxuICogQHNlZSBgQ2hhbmdlRGV0ZWN0b3JSZWZgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0RlZmF1bHRDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneShjaGFuZ2VEZXRlY3Rpb25TdHJhdGVneTogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kpOlxuICAgIGJvb2xlYW4ge1xuICByZXR1cm4gY2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kgPT0gbnVsbCB8fFxuICAgICAgY2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kgPT09IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkRlZmF1bHQ7XG59XG4iXX0=