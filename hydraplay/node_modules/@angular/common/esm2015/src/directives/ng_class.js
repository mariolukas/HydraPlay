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
import { Directive, ElementRef, Input, IterableDiffers, KeyValueDiffers, Renderer2, ɵisListLikeIterable as isListLikeIterable, ɵstringify as stringify } from '@angular/core';
/**
 * \@ngModule CommonModule
 *
 * \@usageNotes
 * ```
 *     <some-element [ngClass]="'first second'">...</some-element>
 *
 *     <some-element [ngClass]="['first', 'second']">...</some-element>
 *
 *     <some-element [ngClass]="{'first': true, 'second': true, 'third': false}">...</some-element>
 *
 *     <some-element [ngClass]="stringExp|arrayExp|objExp">...</some-element>
 *
 *     <some-element [ngClass]="{'class1 class2 class3' : true}">...</some-element>
 * ```
 *
 * \@description
 *
 * Adds and removes CSS classes on an HTML element.
 *
 * The CSS classes are updated as follows, depending on the type of the expression evaluation:
 * - `string` - the CSS classes listed in the string (space delimited) are added,
 * - `Array` - the CSS classes declared as Array elements are added,
 * - `Object` - keys are CSS classes that get added when the expression given in the value
 *              evaluates to a truthy value, otherwise they are removed.
 *
 * \@publicApi
 */
export class NgClass {
    /**
     * @param {?} _iterableDiffers
     * @param {?} _keyValueDiffers
     * @param {?} _ngEl
     * @param {?} _renderer
     */
    constructor(_iterableDiffers, _keyValueDiffers, _ngEl, _renderer) {
        this._iterableDiffers = _iterableDiffers;
        this._keyValueDiffers = _keyValueDiffers;
        this._ngEl = _ngEl;
        this._renderer = _renderer;
        this._initialClasses = [];
    }
    /**
     * @param {?} value
     * @return {?}
     */
    set klass(value) {
        this._removeClasses(this._initialClasses);
        this._initialClasses = typeof value === 'string' ? value.split(/\s+/) : [];
        this._applyClasses(this._initialClasses);
        this._applyClasses(this._rawClass);
    }
    /**
     * @param {?} value
     * @return {?}
     */
    set ngClass(value) {
        this._removeClasses(this._rawClass);
        this._applyClasses(this._initialClasses);
        this._iterableDiffer = null;
        this._keyValueDiffer = null;
        this._rawClass = typeof value === 'string' ? value.split(/\s+/) : value;
        if (this._rawClass) {
            if (isListLikeIterable(this._rawClass)) {
                this._iterableDiffer = this._iterableDiffers.find(this._rawClass).create();
            }
            else {
                this._keyValueDiffer = this._keyValueDiffers.find(this._rawClass).create();
            }
        }
    }
    /**
     * @return {?}
     */
    ngDoCheck() {
        if (this._iterableDiffer) {
            /** @type {?} */
            const iterableChanges = this._iterableDiffer.diff((/** @type {?} */ (this._rawClass)));
            if (iterableChanges) {
                this._applyIterableChanges(iterableChanges);
            }
        }
        else if (this._keyValueDiffer) {
            /** @type {?} */
            const keyValueChanges = this._keyValueDiffer.diff((/** @type {?} */ (this._rawClass)));
            if (keyValueChanges) {
                this._applyKeyValueChanges(keyValueChanges);
            }
        }
    }
    /**
     * @private
     * @param {?} changes
     * @return {?}
     */
    _applyKeyValueChanges(changes) {
        changes.forEachAddedItem((record) => this._toggleClass(record.key, record.currentValue));
        changes.forEachChangedItem((record) => this._toggleClass(record.key, record.currentValue));
        changes.forEachRemovedItem((record) => {
            if (record.previousValue) {
                this._toggleClass(record.key, false);
            }
        });
    }
    /**
     * @private
     * @param {?} changes
     * @return {?}
     */
    _applyIterableChanges(changes) {
        changes.forEachAddedItem((record) => {
            if (typeof record.item === 'string') {
                this._toggleClass(record.item, true);
            }
            else {
                throw new Error(`NgClass can only toggle CSS classes expressed as strings, got ${stringify(record.item)}`);
            }
        });
        changes.forEachRemovedItem((record) => this._toggleClass(record.item, false));
    }
    /**
     * Applies a collection of CSS classes to the DOM element.
     *
     * For argument of type Set and Array CSS class names contained in those collections are always
     * added.
     * For argument of type Map CSS class name in the map's key is toggled based on the value (added
     * for truthy and removed for falsy).
     * @private
     * @param {?} rawClassVal
     * @return {?}
     */
    _applyClasses(rawClassVal) {
        if (rawClassVal) {
            if (Array.isArray(rawClassVal) || rawClassVal instanceof Set) {
                ((/** @type {?} */ (rawClassVal))).forEach((klass) => this._toggleClass(klass, true));
            }
            else {
                Object.keys(rawClassVal).forEach(klass => this._toggleClass(klass, !!rawClassVal[klass]));
            }
        }
    }
    /**
     * Removes a collection of CSS classes from the DOM element. This is mostly useful for cleanup
     * purposes.
     * @private
     * @param {?} rawClassVal
     * @return {?}
     */
    _removeClasses(rawClassVal) {
        if (rawClassVal) {
            if (Array.isArray(rawClassVal) || rawClassVal instanceof Set) {
                ((/** @type {?} */ (rawClassVal))).forEach((klass) => this._toggleClass(klass, false));
            }
            else {
                Object.keys(rawClassVal).forEach(klass => this._toggleClass(klass, false));
            }
        }
    }
    /**
     * @private
     * @param {?} klass
     * @param {?} enabled
     * @return {?}
     */
    _toggleClass(klass, enabled) {
        klass = klass.trim();
        if (klass) {
            klass.split(/\s+/g).forEach(klass => {
                if (enabled) {
                    this._renderer.addClass(this._ngEl.nativeElement, klass);
                }
                else {
                    this._renderer.removeClass(this._ngEl.nativeElement, klass);
                }
            });
        }
    }
}
NgClass.decorators = [
    { type: Directive, args: [{ selector: '[ngClass]' },] }
];
/** @nocollapse */
NgClass.ctorParameters = () => [
    { type: IterableDiffers },
    { type: KeyValueDiffers },
    { type: ElementRef },
    { type: Renderer2 }
];
NgClass.propDecorators = {
    klass: [{ type: Input, args: ['class',] }],
    ngClass: [{ type: Input }]
};
if (false) {
    /**
     * @type {?}
     * @private
     */
    NgClass.prototype._iterableDiffer;
    /**
     * @type {?}
     * @private
     */
    NgClass.prototype._keyValueDiffer;
    /**
     * @type {?}
     * @private
     */
    NgClass.prototype._initialClasses;
    /**
     * @type {?}
     * @private
     */
    NgClass.prototype._rawClass;
    /**
     * @type {?}
     * @private
     */
    NgClass.prototype._iterableDiffers;
    /**
     * @type {?}
     * @private
     */
    NgClass.prototype._keyValueDiffers;
    /**
     * @type {?}
     * @private
     */
    NgClass.prototype._ngEl;
    /**
     * @type {?}
     * @private
     */
    NgClass.prototype._renderer;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfY2xhc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2RpcmVjdGl2ZXMvbmdfY2xhc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFRQSxPQUFPLEVBQUMsU0FBUyxFQUFXLFVBQVUsRUFBRSxLQUFLLEVBQW1DLGVBQWUsRUFBbUMsZUFBZSxFQUFFLFNBQVMsRUFBRSxtQkFBbUIsSUFBSSxrQkFBa0IsRUFBRSxVQUFVLElBQUksU0FBUyxFQUFDLE1BQU0sZUFBZSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQStCdlAsTUFBTSxPQUFPLE9BQU87Ozs7Ozs7SUFTbEIsWUFDWSxnQkFBaUMsRUFBVSxnQkFBaUMsRUFDNUUsS0FBaUIsRUFBVSxTQUFvQjtRQUQvQyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWlCO1FBQVUscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFpQjtRQUM1RSxVQUFLLEdBQUwsS0FBSyxDQUFZO1FBQVUsY0FBUyxHQUFULFNBQVMsQ0FBVztRQU5uRCxvQkFBZSxHQUFhLEVBQUUsQ0FBQztJQU11QixDQUFDOzs7OztJQUUvRCxJQUNJLEtBQUssQ0FBQyxLQUFhO1FBQ3JCLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQzFDLElBQUksQ0FBQyxlQUFlLEdBQUcsT0FBTyxLQUFLLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDM0UsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDekMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDckMsQ0FBQzs7Ozs7SUFFRCxJQUNJLE9BQU8sQ0FBQyxLQUF5RDtRQUNuRSxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNwQyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUV6QyxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQztRQUM1QixJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQztRQUU1QixJQUFJLENBQUMsU0FBUyxHQUFHLE9BQU8sS0FBSyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1FBRXhFLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNsQixJQUFJLGtCQUFrQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRTtnQkFDdEMsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQzthQUM1RTtpQkFBTTtnQkFDTCxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO2FBQzVFO1NBQ0Y7SUFDSCxDQUFDOzs7O0lBRUQsU0FBUztRQUNQLElBQUksSUFBSSxDQUFDLGVBQWUsRUFBRTs7a0JBQ2xCLGVBQWUsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxtQkFBQSxJQUFJLENBQUMsU0FBUyxFQUFZLENBQUM7WUFDN0UsSUFBSSxlQUFlLEVBQUU7Z0JBQ25CLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxlQUFlLENBQUMsQ0FBQzthQUM3QztTQUNGO2FBQU0sSUFBSSxJQUFJLENBQUMsZUFBZSxFQUFFOztrQkFDekIsZUFBZSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLG1CQUFBLElBQUksQ0FBQyxTQUFTLEVBQXFCLENBQUM7WUFDdEYsSUFBSSxlQUFlLEVBQUU7Z0JBQ25CLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxlQUFlLENBQUMsQ0FBQzthQUM3QztTQUNGO0lBQ0gsQ0FBQzs7Ozs7O0lBRU8scUJBQXFCLENBQUMsT0FBcUM7UUFDakUsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7UUFDekYsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7UUFDM0YsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUU7WUFDcEMsSUFBSSxNQUFNLENBQUMsYUFBYSxFQUFFO2dCQUN4QixJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7YUFDdEM7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7Ozs7OztJQUVPLHFCQUFxQixDQUFDLE9BQWdDO1FBQzVELE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFO1lBQ2xDLElBQUksT0FBTyxNQUFNLENBQUMsSUFBSSxLQUFLLFFBQVEsRUFBRTtnQkFDbkMsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO2FBQ3RDO2lCQUFNO2dCQUNMLE1BQU0sSUFBSSxLQUFLLENBQ1gsaUVBQWlFLFNBQVMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2FBQ2hHO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFFSCxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ2hGLENBQUM7Ozs7Ozs7Ozs7OztJQVVPLGFBQWEsQ0FBQyxXQUF3RDtRQUM1RSxJQUFJLFdBQVcsRUFBRTtZQUNmLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxXQUFXLFlBQVksR0FBRyxFQUFFO2dCQUM1RCxDQUFDLG1CQUFLLFdBQVcsRUFBQSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBYSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO2FBQy9FO2lCQUFNO2dCQUNMLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDM0Y7U0FDRjtJQUNILENBQUM7Ozs7Ozs7O0lBTU8sY0FBYyxDQUFDLFdBQXdEO1FBQzdFLElBQUksV0FBVyxFQUFFO1lBQ2YsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLFdBQVcsWUFBWSxHQUFHLEVBQUU7Z0JBQzVELENBQUMsbUJBQUssV0FBVyxFQUFBLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFhLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7YUFDaEY7aUJBQU07Z0JBQ0wsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO2FBQzVFO1NBQ0Y7SUFDSCxDQUFDOzs7Ozs7O0lBRU8sWUFBWSxDQUFDLEtBQWEsRUFBRSxPQUFnQjtRQUNsRCxLQUFLLEdBQUcsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3JCLElBQUksS0FBSyxFQUFFO1lBQ1QsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ2xDLElBQUksT0FBTyxFQUFFO29CQUNYLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLEtBQUssQ0FBQyxDQUFDO2lCQUMxRDtxQkFBTTtvQkFDTCxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxLQUFLLENBQUMsQ0FBQztpQkFDN0Q7WUFDSCxDQUFDLENBQUMsQ0FBQztTQUNKO0lBQ0gsQ0FBQzs7O1lBekhGLFNBQVMsU0FBQyxFQUFDLFFBQVEsRUFBRSxXQUFXLEVBQUM7Ozs7WUE5QjhDLGVBQWU7WUFBbUMsZUFBZTtZQUFySCxVQUFVO1lBQTZHLFNBQVM7OztvQkE0Q3pKLEtBQUssU0FBQyxPQUFPO3NCQVFiLEtBQUs7Ozs7Ozs7SUFuQk4sa0NBQXdEOzs7OztJQUV4RCxrQ0FBNkQ7Ozs7O0lBQzdELGtDQUF1Qzs7Ozs7SUFFdkMsNEJBQW9FOzs7OztJQUdoRSxtQ0FBeUM7Ozs7O0lBQUUsbUNBQXlDOzs7OztJQUNwRix3QkFBeUI7Ozs7O0lBQUUsNEJBQTRCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RpcmVjdGl2ZSwgRG9DaGVjaywgRWxlbWVudFJlZiwgSW5wdXQsIEl0ZXJhYmxlQ2hhbmdlcywgSXRlcmFibGVEaWZmZXIsIEl0ZXJhYmxlRGlmZmVycywgS2V5VmFsdWVDaGFuZ2VzLCBLZXlWYWx1ZURpZmZlciwgS2V5VmFsdWVEaWZmZXJzLCBSZW5kZXJlcjIsIMm1aXNMaXN0TGlrZUl0ZXJhYmxlIGFzIGlzTGlzdExpa2VJdGVyYWJsZSwgybVzdHJpbmdpZnkgYXMgc3RyaW5naWZ5fSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuLyoqXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqIGBgYFxuICogICAgIDxzb21lLWVsZW1lbnQgW25nQ2xhc3NdPVwiJ2ZpcnN0IHNlY29uZCdcIj4uLi48L3NvbWUtZWxlbWVudD5cbiAqXG4gKiAgICAgPHNvbWUtZWxlbWVudCBbbmdDbGFzc109XCJbJ2ZpcnN0JywgJ3NlY29uZCddXCI+Li4uPC9zb21lLWVsZW1lbnQ+XG4gKlxuICogICAgIDxzb21lLWVsZW1lbnQgW25nQ2xhc3NdPVwieydmaXJzdCc6IHRydWUsICdzZWNvbmQnOiB0cnVlLCAndGhpcmQnOiBmYWxzZX1cIj4uLi48L3NvbWUtZWxlbWVudD5cbiAqXG4gKiAgICAgPHNvbWUtZWxlbWVudCBbbmdDbGFzc109XCJzdHJpbmdFeHB8YXJyYXlFeHB8b2JqRXhwXCI+Li4uPC9zb21lLWVsZW1lbnQ+XG4gKlxuICogICAgIDxzb21lLWVsZW1lbnQgW25nQ2xhc3NdPVwieydjbGFzczEgY2xhc3MyIGNsYXNzMycgOiB0cnVlfVwiPi4uLjwvc29tZS1lbGVtZW50PlxuICogYGBgXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogQWRkcyBhbmQgcmVtb3ZlcyBDU1MgY2xhc3NlcyBvbiBhbiBIVE1MIGVsZW1lbnQuXG4gKlxuICogVGhlIENTUyBjbGFzc2VzIGFyZSB1cGRhdGVkIGFzIGZvbGxvd3MsIGRlcGVuZGluZyBvbiB0aGUgdHlwZSBvZiB0aGUgZXhwcmVzc2lvbiBldmFsdWF0aW9uOlxuICogLSBgc3RyaW5nYCAtIHRoZSBDU1MgY2xhc3NlcyBsaXN0ZWQgaW4gdGhlIHN0cmluZyAoc3BhY2UgZGVsaW1pdGVkKSBhcmUgYWRkZWQsXG4gKiAtIGBBcnJheWAgLSB0aGUgQ1NTIGNsYXNzZXMgZGVjbGFyZWQgYXMgQXJyYXkgZWxlbWVudHMgYXJlIGFkZGVkLFxuICogLSBgT2JqZWN0YCAtIGtleXMgYXJlIENTUyBjbGFzc2VzIHRoYXQgZ2V0IGFkZGVkIHdoZW4gdGhlIGV4cHJlc3Npb24gZ2l2ZW4gaW4gdGhlIHZhbHVlXG4gKiAgICAgICAgICAgICAgZXZhbHVhdGVzIHRvIGEgdHJ1dGh5IHZhbHVlLCBvdGhlcndpc2UgdGhleSBhcmUgcmVtb3ZlZC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnW25nQ2xhc3NdJ30pXG5leHBvcnQgY2xhc3MgTmdDbGFzcyBpbXBsZW1lbnRzIERvQ2hlY2sge1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBfaXRlcmFibGVEaWZmZXIgITogSXRlcmFibGVEaWZmZXI8c3RyaW5nPnwgbnVsbDtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHByaXZhdGUgX2tleVZhbHVlRGlmZmVyICE6IEtleVZhbHVlRGlmZmVyPHN0cmluZywgYW55PnwgbnVsbDtcbiAgcHJpdmF0ZSBfaW5pdGlhbENsYXNzZXM6IHN0cmluZ1tdID0gW107XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIF9yYXdDbGFzcyAhOiBzdHJpbmdbXSB8IFNldDxzdHJpbmc+fCB7W2tsYXNzOiBzdHJpbmddOiBhbnl9O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBfaXRlcmFibGVEaWZmZXJzOiBJdGVyYWJsZURpZmZlcnMsIHByaXZhdGUgX2tleVZhbHVlRGlmZmVyczogS2V5VmFsdWVEaWZmZXJzLFxuICAgICAgcHJpdmF0ZSBfbmdFbDogRWxlbWVudFJlZiwgcHJpdmF0ZSBfcmVuZGVyZXI6IFJlbmRlcmVyMikge31cblxuICBASW5wdXQoJ2NsYXNzJylcbiAgc2V0IGtsYXNzKHZhbHVlOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9yZW1vdmVDbGFzc2VzKHRoaXMuX2luaXRpYWxDbGFzc2VzKTtcbiAgICB0aGlzLl9pbml0aWFsQ2xhc3NlcyA9IHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgPyB2YWx1ZS5zcGxpdCgvXFxzKy8pIDogW107XG4gICAgdGhpcy5fYXBwbHlDbGFzc2VzKHRoaXMuX2luaXRpYWxDbGFzc2VzKTtcbiAgICB0aGlzLl9hcHBseUNsYXNzZXModGhpcy5fcmF3Q2xhc3MpO1xuICB9XG5cbiAgQElucHV0KClcbiAgc2V0IG5nQ2xhc3ModmFsdWU6IHN0cmluZ3xzdHJpbmdbXXxTZXQ8c3RyaW5nPnx7W2tsYXNzOiBzdHJpbmddOiBhbnl9KSB7XG4gICAgdGhpcy5fcmVtb3ZlQ2xhc3Nlcyh0aGlzLl9yYXdDbGFzcyk7XG4gICAgdGhpcy5fYXBwbHlDbGFzc2VzKHRoaXMuX2luaXRpYWxDbGFzc2VzKTtcblxuICAgIHRoaXMuX2l0ZXJhYmxlRGlmZmVyID0gbnVsbDtcbiAgICB0aGlzLl9rZXlWYWx1ZURpZmZlciA9IG51bGw7XG5cbiAgICB0aGlzLl9yYXdDbGFzcyA9IHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgPyB2YWx1ZS5zcGxpdCgvXFxzKy8pIDogdmFsdWU7XG5cbiAgICBpZiAodGhpcy5fcmF3Q2xhc3MpIHtcbiAgICAgIGlmIChpc0xpc3RMaWtlSXRlcmFibGUodGhpcy5fcmF3Q2xhc3MpKSB7XG4gICAgICAgIHRoaXMuX2l0ZXJhYmxlRGlmZmVyID0gdGhpcy5faXRlcmFibGVEaWZmZXJzLmZpbmQodGhpcy5fcmF3Q2xhc3MpLmNyZWF0ZSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fa2V5VmFsdWVEaWZmZXIgPSB0aGlzLl9rZXlWYWx1ZURpZmZlcnMuZmluZCh0aGlzLl9yYXdDbGFzcykuY3JlYXRlKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgbmdEb0NoZWNrKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9pdGVyYWJsZURpZmZlcikge1xuICAgICAgY29uc3QgaXRlcmFibGVDaGFuZ2VzID0gdGhpcy5faXRlcmFibGVEaWZmZXIuZGlmZih0aGlzLl9yYXdDbGFzcyBhcyBzdHJpbmdbXSk7XG4gICAgICBpZiAoaXRlcmFibGVDaGFuZ2VzKSB7XG4gICAgICAgIHRoaXMuX2FwcGx5SXRlcmFibGVDaGFuZ2VzKGl0ZXJhYmxlQ2hhbmdlcyk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0aGlzLl9rZXlWYWx1ZURpZmZlcikge1xuICAgICAgY29uc3Qga2V5VmFsdWVDaGFuZ2VzID0gdGhpcy5fa2V5VmFsdWVEaWZmZXIuZGlmZih0aGlzLl9yYXdDbGFzcyBhc3tbazogc3RyaW5nXTogYW55fSk7XG4gICAgICBpZiAoa2V5VmFsdWVDaGFuZ2VzKSB7XG4gICAgICAgIHRoaXMuX2FwcGx5S2V5VmFsdWVDaGFuZ2VzKGtleVZhbHVlQ2hhbmdlcyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfYXBwbHlLZXlWYWx1ZUNoYW5nZXMoY2hhbmdlczogS2V5VmFsdWVDaGFuZ2VzPHN0cmluZywgYW55Pik6IHZvaWQge1xuICAgIGNoYW5nZXMuZm9yRWFjaEFkZGVkSXRlbSgocmVjb3JkKSA9PiB0aGlzLl90b2dnbGVDbGFzcyhyZWNvcmQua2V5LCByZWNvcmQuY3VycmVudFZhbHVlKSk7XG4gICAgY2hhbmdlcy5mb3JFYWNoQ2hhbmdlZEl0ZW0oKHJlY29yZCkgPT4gdGhpcy5fdG9nZ2xlQ2xhc3MocmVjb3JkLmtleSwgcmVjb3JkLmN1cnJlbnRWYWx1ZSkpO1xuICAgIGNoYW5nZXMuZm9yRWFjaFJlbW92ZWRJdGVtKChyZWNvcmQpID0+IHtcbiAgICAgIGlmIChyZWNvcmQucHJldmlvdXNWYWx1ZSkge1xuICAgICAgICB0aGlzLl90b2dnbGVDbGFzcyhyZWNvcmQua2V5LCBmYWxzZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9hcHBseUl0ZXJhYmxlQ2hhbmdlcyhjaGFuZ2VzOiBJdGVyYWJsZUNoYW5nZXM8c3RyaW5nPik6IHZvaWQge1xuICAgIGNoYW5nZXMuZm9yRWFjaEFkZGVkSXRlbSgocmVjb3JkKSA9PiB7XG4gICAgICBpZiAodHlwZW9mIHJlY29yZC5pdGVtID09PSAnc3RyaW5nJykge1xuICAgICAgICB0aGlzLl90b2dnbGVDbGFzcyhyZWNvcmQuaXRlbSwgdHJ1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgTmdDbGFzcyBjYW4gb25seSB0b2dnbGUgQ1NTIGNsYXNzZXMgZXhwcmVzc2VkIGFzIHN0cmluZ3MsIGdvdCAke3N0cmluZ2lmeShyZWNvcmQuaXRlbSl9YCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBjaGFuZ2VzLmZvckVhY2hSZW1vdmVkSXRlbSgocmVjb3JkKSA9PiB0aGlzLl90b2dnbGVDbGFzcyhyZWNvcmQuaXRlbSwgZmFsc2UpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBcHBsaWVzIGEgY29sbGVjdGlvbiBvZiBDU1MgY2xhc3NlcyB0byB0aGUgRE9NIGVsZW1lbnQuXG4gICAqXG4gICAqIEZvciBhcmd1bWVudCBvZiB0eXBlIFNldCBhbmQgQXJyYXkgQ1NTIGNsYXNzIG5hbWVzIGNvbnRhaW5lZCBpbiB0aG9zZSBjb2xsZWN0aW9ucyBhcmUgYWx3YXlzXG4gICAqIGFkZGVkLlxuICAgKiBGb3IgYXJndW1lbnQgb2YgdHlwZSBNYXAgQ1NTIGNsYXNzIG5hbWUgaW4gdGhlIG1hcCdzIGtleSBpcyB0b2dnbGVkIGJhc2VkIG9uIHRoZSB2YWx1ZSAoYWRkZWRcbiAgICogZm9yIHRydXRoeSBhbmQgcmVtb3ZlZCBmb3IgZmFsc3kpLlxuICAgKi9cbiAgcHJpdmF0ZSBfYXBwbHlDbGFzc2VzKHJhd0NsYXNzVmFsOiBzdHJpbmdbXXxTZXQ8c3RyaW5nPnx7W2tsYXNzOiBzdHJpbmddOiBhbnl9KSB7XG4gICAgaWYgKHJhd0NsYXNzVmFsKSB7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShyYXdDbGFzc1ZhbCkgfHwgcmF3Q2xhc3NWYWwgaW5zdGFuY2VvZiBTZXQpIHtcbiAgICAgICAgKDxhbnk+cmF3Q2xhc3NWYWwpLmZvckVhY2goKGtsYXNzOiBzdHJpbmcpID0+IHRoaXMuX3RvZ2dsZUNsYXNzKGtsYXNzLCB0cnVlKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBPYmplY3Qua2V5cyhyYXdDbGFzc1ZhbCkuZm9yRWFjaChrbGFzcyA9PiB0aGlzLl90b2dnbGVDbGFzcyhrbGFzcywgISFyYXdDbGFzc1ZhbFtrbGFzc10pKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyBhIGNvbGxlY3Rpb24gb2YgQ1NTIGNsYXNzZXMgZnJvbSB0aGUgRE9NIGVsZW1lbnQuIFRoaXMgaXMgbW9zdGx5IHVzZWZ1bCBmb3IgY2xlYW51cFxuICAgKiBwdXJwb3Nlcy5cbiAgICovXG4gIHByaXZhdGUgX3JlbW92ZUNsYXNzZXMocmF3Q2xhc3NWYWw6IHN0cmluZ1tdfFNldDxzdHJpbmc+fHtba2xhc3M6IHN0cmluZ106IGFueX0pIHtcbiAgICBpZiAocmF3Q2xhc3NWYWwpIHtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHJhd0NsYXNzVmFsKSB8fCByYXdDbGFzc1ZhbCBpbnN0YW5jZW9mIFNldCkge1xuICAgICAgICAoPGFueT5yYXdDbGFzc1ZhbCkuZm9yRWFjaCgoa2xhc3M6IHN0cmluZykgPT4gdGhpcy5fdG9nZ2xlQ2xhc3Moa2xhc3MsIGZhbHNlKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBPYmplY3Qua2V5cyhyYXdDbGFzc1ZhbCkuZm9yRWFjaChrbGFzcyA9PiB0aGlzLl90b2dnbGVDbGFzcyhrbGFzcywgZmFsc2UpKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF90b2dnbGVDbGFzcyhrbGFzczogc3RyaW5nLCBlbmFibGVkOiBib29sZWFuKTogdm9pZCB7XG4gICAga2xhc3MgPSBrbGFzcy50cmltKCk7XG4gICAgaWYgKGtsYXNzKSB7XG4gICAgICBrbGFzcy5zcGxpdCgvXFxzKy9nKS5mb3JFYWNoKGtsYXNzID0+IHtcbiAgICAgICAgaWYgKGVuYWJsZWQpIHtcbiAgICAgICAgICB0aGlzLl9yZW5kZXJlci5hZGRDbGFzcyh0aGlzLl9uZ0VsLm5hdGl2ZUVsZW1lbnQsIGtsYXNzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl9yZW5kZXJlci5yZW1vdmVDbGFzcyh0aGlzLl9uZ0VsLm5hdGl2ZUVsZW1lbnQsIGtsYXNzKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG59XG4iXX0=