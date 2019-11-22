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
import { Pipe } from '@angular/core';
import { invalidPipeArgumentError } from './invalid_pipe_argument_error';
/**
 * \@ngModule CommonModule
 * \@description
 *
 * Creates a new `Array` or `String` containing a subset (slice) of the elements.
 *
 * \@usageNotes
 *
 * All behavior is based on the expected behavior of the JavaScript API `Array.prototype.slice()`
 * and `String.prototype.slice()`.
 *
 * When operating on an `Array`, the returned `Array` is always a copy even when all
 * the elements are being returned.
 *
 * When operating on a blank value, the pipe returns the blank value.
 *
 * ### List Example
 *
 * This `ngFor` example:
 *
 * {\@example common/pipes/ts/slice_pipe.ts region='SlicePipe_list'}
 *
 * produces the following:
 *
 * ```html
 * <li>b</li>
 * <li>c</li>
 * ```
 *
 * ### String Examples
 *
 * {\@example common/pipes/ts/slice_pipe.ts region='SlicePipe_string'}
 *
 * \@publicApi
 */
export class SlicePipe {
    /**
     * @param {?} value a list or a string to be sliced.
     * @param {?} start the starting index of the subset to return:
     *   - **a positive integer**: return the item at `start` index and all items after
     *     in the list or string expression.
     *   - **a negative integer**: return the item at `start` index from the end and all items after
     *     in the list or string expression.
     *   - **if positive and greater than the size of the expression**: return an empty list or
     * string.
     *   - **if negative and greater than the size of the expression**: return entire list or string.
     * @param {?=} end the ending index of the subset to return:
     *   - **omitted**: return all items until the end.
     *   - **if positive**: return all items before `end` index of the list or string.
     *   - **if negative**: return all items before `end` index from the end of the list or string.
     * @return {?}
     */
    transform(value, start, end) {
        if (value == null)
            return value;
        if (!this.supports(value)) {
            throw invalidPipeArgumentError(SlicePipe, value);
        }
        return value.slice(start, end);
    }
    /**
     * @private
     * @param {?} obj
     * @return {?}
     */
    supports(obj) { return typeof obj === 'string' || Array.isArray(obj); }
}
SlicePipe.decorators = [
    { type: Pipe, args: [{ name: 'slice', pure: false },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2xpY2VfcGlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9zcmMvcGlwZXMvc2xpY2VfcGlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBQyxJQUFJLEVBQWdCLE1BQU0sZUFBZSxDQUFDO0FBQ2xELE9BQU8sRUFBQyx3QkFBd0IsRUFBQyxNQUFNLCtCQUErQixDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFzQ3ZFLE1BQU0sT0FBTyxTQUFTOzs7Ozs7Ozs7Ozs7Ozs7OztJQWdCcEIsU0FBUyxDQUFDLEtBQVUsRUFBRSxLQUFhLEVBQUUsR0FBWTtRQUMvQyxJQUFJLEtBQUssSUFBSSxJQUFJO1lBQUUsT0FBTyxLQUFLLENBQUM7UUFFaEMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDekIsTUFBTSx3QkFBd0IsQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7U0FDbEQ7UUFFRCxPQUFPLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ2pDLENBQUM7Ozs7OztJQUVPLFFBQVEsQ0FBQyxHQUFRLElBQWEsT0FBTyxPQUFPLEdBQUcsS0FBSyxRQUFRLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7OztZQTNCOUYsSUFBSSxTQUFDLEVBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1BpcGUsIFBpcGVUcmFuc2Zvcm19IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtpbnZhbGlkUGlwZUFyZ3VtZW50RXJyb3J9IGZyb20gJy4vaW52YWxpZF9waXBlX2FyZ3VtZW50X2Vycm9yJztcblxuLyoqXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBDcmVhdGVzIGEgbmV3IGBBcnJheWAgb3IgYFN0cmluZ2AgY29udGFpbmluZyBhIHN1YnNldCAoc2xpY2UpIG9mIHRoZSBlbGVtZW50cy5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqIEFsbCBiZWhhdmlvciBpcyBiYXNlZCBvbiB0aGUgZXhwZWN0ZWQgYmVoYXZpb3Igb2YgdGhlIEphdmFTY3JpcHQgQVBJIGBBcnJheS5wcm90b3R5cGUuc2xpY2UoKWBcbiAqIGFuZCBgU3RyaW5nLnByb3RvdHlwZS5zbGljZSgpYC5cbiAqXG4gKiBXaGVuIG9wZXJhdGluZyBvbiBhbiBgQXJyYXlgLCB0aGUgcmV0dXJuZWQgYEFycmF5YCBpcyBhbHdheXMgYSBjb3B5IGV2ZW4gd2hlbiBhbGxcbiAqIHRoZSBlbGVtZW50cyBhcmUgYmVpbmcgcmV0dXJuZWQuXG4gKlxuICogV2hlbiBvcGVyYXRpbmcgb24gYSBibGFuayB2YWx1ZSwgdGhlIHBpcGUgcmV0dXJucyB0aGUgYmxhbmsgdmFsdWUuXG4gKlxuICogIyMjIExpc3QgRXhhbXBsZVxuICpcbiAqIFRoaXMgYG5nRm9yYCBleGFtcGxlOlxuICpcbiAqIHtAZXhhbXBsZSBjb21tb24vcGlwZXMvdHMvc2xpY2VfcGlwZS50cyByZWdpb249J1NsaWNlUGlwZV9saXN0J31cbiAqXG4gKiBwcm9kdWNlcyB0aGUgZm9sbG93aW5nOlxuICpcbiAqIGBgYGh0bWxcbiAqIDxsaT5iPC9saT5cbiAqIDxsaT5jPC9saT5cbiAqIGBgYFxuICpcbiAqICMjIyBTdHJpbmcgRXhhbXBsZXNcbiAqXG4gKiB7QGV4YW1wbGUgY29tbW9uL3BpcGVzL3RzL3NsaWNlX3BpcGUudHMgcmVnaW9uPSdTbGljZVBpcGVfc3RyaW5nJ31cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBQaXBlKHtuYW1lOiAnc2xpY2UnLCBwdXJlOiBmYWxzZX0pXG5leHBvcnQgY2xhc3MgU2xpY2VQaXBlIGltcGxlbWVudHMgUGlwZVRyYW5zZm9ybSB7XG4gIC8qKlxuICAgKiBAcGFyYW0gdmFsdWUgYSBsaXN0IG9yIGEgc3RyaW5nIHRvIGJlIHNsaWNlZC5cbiAgICogQHBhcmFtIHN0YXJ0IHRoZSBzdGFydGluZyBpbmRleCBvZiB0aGUgc3Vic2V0IHRvIHJldHVybjpcbiAgICogICAtICoqYSBwb3NpdGl2ZSBpbnRlZ2VyKio6IHJldHVybiB0aGUgaXRlbSBhdCBgc3RhcnRgIGluZGV4IGFuZCBhbGwgaXRlbXMgYWZ0ZXJcbiAgICogICAgIGluIHRoZSBsaXN0IG9yIHN0cmluZyBleHByZXNzaW9uLlxuICAgKiAgIC0gKiphIG5lZ2F0aXZlIGludGVnZXIqKjogcmV0dXJuIHRoZSBpdGVtIGF0IGBzdGFydGAgaW5kZXggZnJvbSB0aGUgZW5kIGFuZCBhbGwgaXRlbXMgYWZ0ZXJcbiAgICogICAgIGluIHRoZSBsaXN0IG9yIHN0cmluZyBleHByZXNzaW9uLlxuICAgKiAgIC0gKippZiBwb3NpdGl2ZSBhbmQgZ3JlYXRlciB0aGFuIHRoZSBzaXplIG9mIHRoZSBleHByZXNzaW9uKio6IHJldHVybiBhbiBlbXB0eSBsaXN0IG9yXG4gICAqIHN0cmluZy5cbiAgICogICAtICoqaWYgbmVnYXRpdmUgYW5kIGdyZWF0ZXIgdGhhbiB0aGUgc2l6ZSBvZiB0aGUgZXhwcmVzc2lvbioqOiByZXR1cm4gZW50aXJlIGxpc3Qgb3Igc3RyaW5nLlxuICAgKiBAcGFyYW0gZW5kIHRoZSBlbmRpbmcgaW5kZXggb2YgdGhlIHN1YnNldCB0byByZXR1cm46XG4gICAqICAgLSAqKm9taXR0ZWQqKjogcmV0dXJuIGFsbCBpdGVtcyB1bnRpbCB0aGUgZW5kLlxuICAgKiAgIC0gKippZiBwb3NpdGl2ZSoqOiByZXR1cm4gYWxsIGl0ZW1zIGJlZm9yZSBgZW5kYCBpbmRleCBvZiB0aGUgbGlzdCBvciBzdHJpbmcuXG4gICAqICAgLSAqKmlmIG5lZ2F0aXZlKio6IHJldHVybiBhbGwgaXRlbXMgYmVmb3JlIGBlbmRgIGluZGV4IGZyb20gdGhlIGVuZCBvZiB0aGUgbGlzdCBvciBzdHJpbmcuXG4gICAqL1xuICB0cmFuc2Zvcm0odmFsdWU6IGFueSwgc3RhcnQ6IG51bWJlciwgZW5kPzogbnVtYmVyKTogYW55IHtcbiAgICBpZiAodmFsdWUgPT0gbnVsbCkgcmV0dXJuIHZhbHVlO1xuXG4gICAgaWYgKCF0aGlzLnN1cHBvcnRzKHZhbHVlKSkge1xuICAgICAgdGhyb3cgaW52YWxpZFBpcGVBcmd1bWVudEVycm9yKFNsaWNlUGlwZSwgdmFsdWUpO1xuICAgIH1cblxuICAgIHJldHVybiB2YWx1ZS5zbGljZShzdGFydCwgZW5kKTtcbiAgfVxuXG4gIHByaXZhdGUgc3VwcG9ydHMob2JqOiBhbnkpOiBib29sZWFuIHsgcmV0dXJuIHR5cGVvZiBvYmogPT09ICdzdHJpbmcnIHx8IEFycmF5LmlzQXJyYXkob2JqKTsgfVxufVxuIl19