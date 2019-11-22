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
import { Directive, Input, IterableDiffers, TemplateRef, ViewContainerRef, isDevMode } from '@angular/core';
/**
 * \@publicApi
 * @template T
 */
export class NgForOfContext {
    /**
     * @param {?} $implicit
     * @param {?} ngForOf
     * @param {?} index
     * @param {?} count
     */
    constructor($implicit, ngForOf, index, count) {
        this.$implicit = $implicit;
        this.ngForOf = ngForOf;
        this.index = index;
        this.count = count;
    }
    /**
     * @return {?}
     */
    get first() { return this.index === 0; }
    /**
     * @return {?}
     */
    get last() { return this.index === this.count - 1; }
    /**
     * @return {?}
     */
    get even() { return this.index % 2 === 0; }
    /**
     * @return {?}
     */
    get odd() { return !this.even; }
}
if (false) {
    /** @type {?} */
    NgForOfContext.prototype.$implicit;
    /** @type {?} */
    NgForOfContext.prototype.ngForOf;
    /** @type {?} */
    NgForOfContext.prototype.index;
    /** @type {?} */
    NgForOfContext.prototype.count;
}
/**
 * A [structural directive](guide/structural-directives) that renders
 * a template for each item in a collection.
 * The directive is placed on an element, which becomes the parent
 * of the cloned templates.
 *
 * The `ngForOf` is generally used in the
 * [shorthand form](guide/structural-directives#the-asterisk--prefix) `*ngFor`.
 * In this form, the template to be rendered for each iteration is the content
 * of an anchor element containing the directive.
 *
 * The following example shows the shorthand syntax with some options,
 * contained in an `<li>` element.
 *
 * ```
 * <li *ngFor="let item of items; index as i; trackBy: trackByFn">...</li>
 * ```
 *
 * The shorthand form expands into a long form that uses the `ngForOf` selector
 * on an `<ng-template>` element.
 * The content of the `<ng-template>` element is the `<li>` element that held the
 * short-form directive.
 *
 * Here is the expanded version of the short-form example.
 *
 * ```
 * <ng-template ngFor let-item [ngForOf]="items" let-i="index" [ngForTrackBy]="trackByFn">
 *   <li>...</li>
 * </ng-template>
 * ```
 *
 * Angular automatically expands the shorthand syntax as it compiles the template.
 * The context for each embedded view is logically merged to the current component
 * context according to its lexical position.
 *
 * When using the shorthand syntax, Angular allows only [one structural directive
 * on an element](guide/structural-directives#one-structural-directive-per-host-element).
 * If you want to iterate conditionally, for example,
 * put the `*ngIf` on a container element that wraps the `*ngFor` element.
 * For futher discussion, see
 * [Structural Directives](guide/structural-directives#one-per-element).
 *
 * \@usageNotes
 *
 * ### Local variables
 *
 * `NgForOf` provides exported values that can be aliased to local variables.
 * For example:
 *
 *  ```
 * <li *ngFor="let user of userObservable | async as users; index as i; first as isFirst">
 *    {{i}}/{{users.length}}. {{user}} <span *ngIf="isFirst">default</span>
 * </li>
 * ```
 *
 * The following exported values can be aliased to local variables:
 *
 * - `$implicit: T`: The value of the individual items in the iterable (`ngForOf`).
 * - `ngForOf: NgIterable<T>`: The value of the iterable expression. Useful when the expression is
 * more complex then a property access, for example when using the async pipe (`userStreams |
 * async`).
 * - `index: number`: The index of the current item in the iterable.
 * - `first: boolean`: True when the item is the first item in the iterable.
 * - `last: boolean`: True when the item is the last item in the iterable.
 * - `even: boolean`: True when the item has an even index in the iterable.
 * - `odd: boolean`: True when the item has an odd index in the iterable.
 *
 * ### Change propagation
 *
 * When the contents of the iterator changes, `NgForOf` makes the corresponding changes to the DOM:
 *
 * * When an item is added, a new instance of the template is added to the DOM.
 * * When an item is removed, its template instance is removed from the DOM.
 * * When items are reordered, their respective templates are reordered in the DOM.
 *
 * Angular uses object identity to track insertions and deletions within the iterator and reproduce
 * those changes in the DOM. This has important implications for animations and any stateful
 * controls that are present, such as `<input>` elements that accept user input. Inserted rows can
 * be animated in, deleted rows can be animated out, and unchanged rows retain any unsaved state
 * such as user input.
 * For more on animations, see [Transitions and Triggers](guide/transition-and-triggers).
 *
 * The identities of elements in the iterator can change while the data does not.
 * This can happen, for example, if the iterator is produced from an RPC to the server, and that
 * RPC is re-run. Even if the data hasn't changed, the second response produces objects with
 * different identities, and Angular must tear down the entire DOM and rebuild it (as if all old
 * elements were deleted and all new elements inserted).
 *
 * To avoid this expensive operation, you can customize the default tracking algorithm.
 * by supplying the `trackBy` option to `NgForOf`.
 * `trackBy` takes a function that has two arguments: `index` and `item`.
 * If `trackBy` is given, Angular tracks changes by the return value of the function.
 *
 * @see [Structural Directives](guide/structural-directives)
 * \@ngModule CommonModule
 * \@publicApi
 * @template T
 */
export class NgForOf {
    /**
     * @param {?} _viewContainer
     * @param {?} _template
     * @param {?} _differs
     */
    constructor(_viewContainer, _template, _differs) {
        this._viewContainer = _viewContainer;
        this._template = _template;
        this._differs = _differs;
        this._ngForOfDirty = true;
        this._differ = null;
    }
    /**
     * @param {?} ngForOf
     * @return {?}
     */
    set ngForOf(ngForOf) {
        this._ngForOf = ngForOf;
        this._ngForOfDirty = true;
    }
    /**
     * @param {?} fn
     * @return {?}
     */
    set ngForTrackBy(fn) {
        if (isDevMode() && fn != null && typeof fn !== 'function') {
            // TODO(vicb): use a log service once there is a public one available
            if ((/** @type {?} */ (console)) && (/** @type {?} */ (console.warn))) {
                console.warn(`trackBy must be a function, but received ${JSON.stringify(fn)}. ` +
                    `See https://angular.io/docs/ts/latest/api/common/index/NgFor-directive.html#!#change-propagation for more information.`);
            }
        }
        this._trackByFn = fn;
    }
    /**
     * @return {?}
     */
    get ngForTrackBy() { return this._trackByFn; }
    /**
     * @param {?} value
     * @return {?}
     */
    set ngForTemplate(value) {
        // TODO(TS2.1): make TemplateRef<Partial<NgForRowOf<T>>> once we move to TS v2.1
        // The current type is too restrictive; a template that just uses index, for example,
        // should be acceptable.
        if (value) {
            this._template = value;
        }
    }
    /**
     * @return {?}
     */
    ngDoCheck() {
        if (this._ngForOfDirty) {
            this._ngForOfDirty = false;
            // React on ngForOf changes only once all inputs have been initialized
            /** @type {?} */
            const value = this._ngForOf;
            if (!this._differ && value) {
                try {
                    this._differ = this._differs.find(value).create(this.ngForTrackBy);
                }
                catch (_a) {
                    throw new Error(`Cannot find a differ supporting object '${value}' of type '${getTypeNameForDebugging(value)}'. NgFor only supports binding to Iterables such as Arrays.`);
                }
            }
        }
        if (this._differ) {
            /** @type {?} */
            const changes = this._differ.diff(this._ngForOf);
            if (changes)
                this._applyChanges(changes);
        }
    }
    /**
     * @private
     * @param {?} changes
     * @return {?}
     */
    _applyChanges(changes) {
        /** @type {?} */
        const insertTuples = [];
        changes.forEachOperation((item, adjustedPreviousIndex, currentIndex) => {
            if (item.previousIndex == null) {
                /** @type {?} */
                const view = this._viewContainer.createEmbeddedView(this._template, new NgForOfContext((/** @type {?} */ (null)), this._ngForOf, -1, -1), currentIndex);
                /** @type {?} */
                const tuple = new RecordViewTuple(item, view);
                insertTuples.push(tuple);
            }
            else if (currentIndex == null) {
                this._viewContainer.remove(adjustedPreviousIndex);
            }
            else {
                /** @type {?} */
                const view = (/** @type {?} */ (this._viewContainer.get(adjustedPreviousIndex)));
                this._viewContainer.move(view, currentIndex);
                /** @type {?} */
                const tuple = new RecordViewTuple(item, (/** @type {?} */ (view)));
                insertTuples.push(tuple);
            }
        });
        for (let i = 0; i < insertTuples.length; i++) {
            this._perViewChange(insertTuples[i].view, insertTuples[i].record);
        }
        for (let i = 0, ilen = this._viewContainer.length; i < ilen; i++) {
            /** @type {?} */
            const viewRef = (/** @type {?} */ (this._viewContainer.get(i)));
            viewRef.context.index = i;
            viewRef.context.count = ilen;
            viewRef.context.ngForOf = this._ngForOf;
        }
        changes.forEachIdentityChange((record) => {
            /** @type {?} */
            const viewRef = (/** @type {?} */ (this._viewContainer.get(record.currentIndex)));
            viewRef.context.$implicit = record.item;
        });
    }
    /**
     * @private
     * @param {?} view
     * @param {?} record
     * @return {?}
     */
    _perViewChange(view, record) {
        view.context.$implicit = record.item;
    }
    /**
     * Asserts the correct type of the context for the template that `NgForOf` will render.
     *
     * The presence of this method is a signal to the Ivy template type-check compiler that the
     * `NgForOf` structural directive renders its template with a specific context type.
     * @template T
     * @param {?} dir
     * @param {?} ctx
     * @return {?}
     */
    static ngTemplateContextGuard(dir, ctx) {
        return true;
    }
}
NgForOf.decorators = [
    { type: Directive, args: [{ selector: '[ngFor][ngForOf]' },] }
];
/** @nocollapse */
NgForOf.ctorParameters = () => [
    { type: ViewContainerRef },
    { type: TemplateRef },
    { type: IterableDiffers }
];
NgForOf.propDecorators = {
    ngForOf: [{ type: Input }],
    ngForTrackBy: [{ type: Input }],
    ngForTemplate: [{ type: Input }]
};
if (false) {
    /**
     * @type {?}
     * @private
     */
    NgForOf.prototype._ngForOf;
    /**
     * @type {?}
     * @private
     */
    NgForOf.prototype._ngForOfDirty;
    /**
     * @type {?}
     * @private
     */
    NgForOf.prototype._differ;
    /**
     * @type {?}
     * @private
     */
    NgForOf.prototype._trackByFn;
    /**
     * @type {?}
     * @private
     */
    NgForOf.prototype._viewContainer;
    /**
     * @type {?}
     * @private
     */
    NgForOf.prototype._template;
    /**
     * @type {?}
     * @private
     */
    NgForOf.prototype._differs;
}
/**
 * @template T
 */
class RecordViewTuple {
    /**
     * @param {?} record
     * @param {?} view
     */
    constructor(record, view) {
        this.record = record;
        this.view = view;
    }
}
if (false) {
    /** @type {?} */
    RecordViewTuple.prototype.record;
    /** @type {?} */
    RecordViewTuple.prototype.view;
}
/**
 * @param {?} type
 * @return {?}
 */
export function getTypeNameForDebugging(type) {
    return type['name'] || typeof type;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfZm9yX29mLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX2Zvcl9vZi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBb0IsU0FBUyxFQUE0QixLQUFLLEVBQXlELGVBQWUsRUFBYyxXQUFXLEVBQW1CLGdCQUFnQixFQUFjLFNBQVMsRUFBQyxNQUFNLGVBQWUsQ0FBQzs7Ozs7QUFLdlAsTUFBTSxPQUFPLGNBQWM7Ozs7Ozs7SUFDekIsWUFDVyxTQUFZLEVBQVMsT0FBc0IsRUFBUyxLQUFhLEVBQ2pFLEtBQWE7UUFEYixjQUFTLEdBQVQsU0FBUyxDQUFHO1FBQVMsWUFBTyxHQUFQLE9BQU8sQ0FBZTtRQUFTLFVBQUssR0FBTCxLQUFLLENBQVE7UUFDakUsVUFBSyxHQUFMLEtBQUssQ0FBUTtJQUFHLENBQUM7Ozs7SUFFNUIsSUFBSSxLQUFLLEtBQWMsT0FBTyxJQUFJLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7SUFFakQsSUFBSSxJQUFJLEtBQWMsT0FBTyxJQUFJLENBQUMsS0FBSyxLQUFLLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7OztJQUU3RCxJQUFJLElBQUksS0FBYyxPQUFPLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7SUFFcEQsSUFBSSxHQUFHLEtBQWMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0NBQzFDOzs7SUFWSyxtQ0FBbUI7O0lBQUUsaUNBQTZCOztJQUFFLCtCQUFvQjs7SUFDeEUsK0JBQW9COzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBNkcxQixNQUFNLE9BQU8sT0FBTzs7Ozs7O0lBNEJsQixZQUNZLGNBQWdDLEVBQVUsU0FBeUMsRUFDbkYsUUFBeUI7UUFEekIsbUJBQWMsR0FBZCxjQUFjLENBQWtCO1FBQVUsY0FBUyxHQUFULFNBQVMsQ0FBZ0M7UUFDbkYsYUFBUSxHQUFSLFFBQVEsQ0FBaUI7UUFQN0Isa0JBQWEsR0FBWSxJQUFJLENBQUM7UUFDOUIsWUFBTyxHQUEyQixJQUFJLENBQUM7SUFNUCxDQUFDOzs7OztJQTdCekMsSUFDSSxPQUFPLENBQUMsT0FBc0I7UUFDaEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7UUFDeEIsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7SUFDNUIsQ0FBQzs7Ozs7SUFDRCxJQUNJLFlBQVksQ0FBQyxFQUFzQjtRQUNyQyxJQUFJLFNBQVMsRUFBRSxJQUFJLEVBQUUsSUFBSSxJQUFJLElBQUksT0FBTyxFQUFFLEtBQUssVUFBVSxFQUFFO1lBQ3pELHFFQUFxRTtZQUNyRSxJQUFJLG1CQUFLLE9BQU8sRUFBQSxJQUFJLG1CQUFLLE9BQU8sQ0FBQyxJQUFJLEVBQUEsRUFBRTtnQkFDckMsT0FBTyxDQUFDLElBQUksQ0FDUiw0Q0FBNEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSTtvQkFDbEUsd0hBQXdILENBQUMsQ0FBQzthQUMvSDtTQUNGO1FBQ0QsSUFBSSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUM7SUFDdkIsQ0FBQzs7OztJQUVELElBQUksWUFBWSxLQUF5QixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDOzs7OztJQWFsRSxJQUNJLGFBQWEsQ0FBQyxLQUFxQztRQUNyRCxnRkFBZ0Y7UUFDaEYscUZBQXFGO1FBQ3JGLHdCQUF3QjtRQUN4QixJQUFJLEtBQUssRUFBRTtZQUNULElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1NBQ3hCO0lBQ0gsQ0FBQzs7OztJQUVELFNBQVM7UUFDUCxJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUU7WUFDdEIsSUFBSSxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUM7OztrQkFFckIsS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRO1lBQzNCLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxJQUFJLEtBQUssRUFBRTtnQkFDMUIsSUFBSTtvQkFDRixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7aUJBQ3BFO2dCQUFDLFdBQU07b0JBQ04sTUFBTSxJQUFJLEtBQUssQ0FDWCwyQ0FBMkMsS0FBSyxjQUFjLHVCQUF1QixDQUFDLEtBQUssQ0FBQyw2REFBNkQsQ0FBQyxDQUFDO2lCQUNoSzthQUNGO1NBQ0Y7UUFDRCxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7O2tCQUNWLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO1lBQ2hELElBQUksT0FBTztnQkFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQzFDO0lBQ0gsQ0FBQzs7Ozs7O0lBRU8sYUFBYSxDQUFDLE9BQTJCOztjQUN6QyxZQUFZLEdBQXlCLEVBQUU7UUFDN0MsT0FBTyxDQUFDLGdCQUFnQixDQUNwQixDQUFDLElBQStCLEVBQUUscUJBQTZCLEVBQUUsWUFBb0IsRUFBRSxFQUFFO1lBQ3ZGLElBQUksSUFBSSxDQUFDLGFBQWEsSUFBSSxJQUFJLEVBQUU7O3NCQUN4QixJQUFJLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsQ0FDL0MsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLGNBQWMsQ0FBSSxtQkFBQSxJQUFJLEVBQUUsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsWUFBWSxDQUFDOztzQkFDakYsS0FBSyxHQUFHLElBQUksZUFBZSxDQUFJLElBQUksRUFBRSxJQUFJLENBQUM7Z0JBQ2hELFlBQVksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDMUI7aUJBQU0sSUFBSSxZQUFZLElBQUksSUFBSSxFQUFFO2dCQUMvQixJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO2FBQ25EO2lCQUFNOztzQkFDQyxJQUFJLEdBQUcsbUJBQUEsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsRUFBRTtnQkFDN0QsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQyxDQUFDOztzQkFDdkMsS0FBSyxHQUFHLElBQUksZUFBZSxDQUFDLElBQUksRUFBRSxtQkFBb0MsSUFBSSxFQUFBLENBQUM7Z0JBQ2pGLFlBQVksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDMUI7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUVQLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzVDLElBQUksQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDbkU7UUFFRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRTs7a0JBQzFELE9BQU8sR0FBRyxtQkFBb0MsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUE7WUFDOUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO1lBQzFCLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztZQUM3QixPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1NBQ3pDO1FBRUQsT0FBTyxDQUFDLHFCQUFxQixDQUFDLENBQUMsTUFBVyxFQUFFLEVBQUU7O2tCQUN0QyxPQUFPLEdBQ1QsbUJBQW9DLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsRUFBQTtZQUNwRixPQUFPLENBQUMsT0FBTyxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQzFDLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQzs7Ozs7OztJQUVPLGNBQWMsQ0FDbEIsSUFBd0MsRUFBRSxNQUFpQztRQUM3RSxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ3ZDLENBQUM7Ozs7Ozs7Ozs7O0lBUUQsTUFBTSxDQUFDLHNCQUFzQixDQUFJLEdBQWUsRUFBRSxHQUFRO1FBQ3hELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQzs7O1lBakhGLFNBQVMsU0FBQyxFQUFDLFFBQVEsRUFBRSxrQkFBa0IsRUFBQzs7OztZQXBIZ0osZ0JBQWdCO1lBQTlDLFdBQVc7WUFBeEMsZUFBZTs7O3NCQXNIMUksS0FBSzsyQkFLTCxLQUFLOzRCQTBCTCxLQUFLOzs7Ozs7O0lBVk4sMkJBQWtDOzs7OztJQUNsQyxnQ0FBc0M7Ozs7O0lBQ3RDLDBCQUErQzs7Ozs7SUFFL0MsNkJBQXlDOzs7OztJQUdyQyxpQ0FBd0M7Ozs7O0lBQUUsNEJBQWlEOzs7OztJQUMzRiwyQkFBaUM7Ozs7O0FBcUZ2QyxNQUFNLGVBQWU7Ozs7O0lBQ25CLFlBQW1CLE1BQVcsRUFBUyxJQUF3QztRQUE1RCxXQUFNLEdBQU4sTUFBTSxDQUFLO1FBQVMsU0FBSSxHQUFKLElBQUksQ0FBb0M7SUFBRyxDQUFDO0NBQ3BGOzs7SUFEYSxpQ0FBa0I7O0lBQUUsK0JBQStDOzs7Ozs7QUFHakYsTUFBTSxVQUFVLHVCQUF1QixDQUFDLElBQVM7SUFDL0MsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksT0FBTyxJQUFJLENBQUM7QUFDckMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtDaGFuZ2VEZXRlY3RvclJlZiwgRGlyZWN0aXZlLCBEb0NoZWNrLCBFbWJlZGRlZFZpZXdSZWYsIElucHV0LCBJdGVyYWJsZUNoYW5nZVJlY29yZCwgSXRlcmFibGVDaGFuZ2VzLCBJdGVyYWJsZURpZmZlciwgSXRlcmFibGVEaWZmZXJzLCBOZ0l0ZXJhYmxlLCBUZW1wbGF0ZVJlZiwgVHJhY2tCeUZ1bmN0aW9uLCBWaWV3Q29udGFpbmVyUmVmLCBmb3J3YXJkUmVmLCBpc0Rldk1vZGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG4vKipcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIE5nRm9yT2ZDb250ZXh0PFQ+IHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgJGltcGxpY2l0OiBULCBwdWJsaWMgbmdGb3JPZjogTmdJdGVyYWJsZTxUPiwgcHVibGljIGluZGV4OiBudW1iZXIsXG4gICAgICBwdWJsaWMgY291bnQ6IG51bWJlcikge31cblxuICBnZXQgZmlyc3QoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLmluZGV4ID09PSAwOyB9XG5cbiAgZ2V0IGxhc3QoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLmluZGV4ID09PSB0aGlzLmNvdW50IC0gMTsgfVxuXG4gIGdldCBldmVuKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5pbmRleCAlIDIgPT09IDA7IH1cblxuICBnZXQgb2RkKCk6IGJvb2xlYW4geyByZXR1cm4gIXRoaXMuZXZlbjsgfVxufVxuXG4vKipcbiAqIEEgW3N0cnVjdHVyYWwgZGlyZWN0aXZlXShndWlkZS9zdHJ1Y3R1cmFsLWRpcmVjdGl2ZXMpIHRoYXQgcmVuZGVyc1xuICogYSB0ZW1wbGF0ZSBmb3IgZWFjaCBpdGVtIGluIGEgY29sbGVjdGlvbi5cbiAqIFRoZSBkaXJlY3RpdmUgaXMgcGxhY2VkIG9uIGFuIGVsZW1lbnQsIHdoaWNoIGJlY29tZXMgdGhlIHBhcmVudFxuICogb2YgdGhlIGNsb25lZCB0ZW1wbGF0ZXMuXG4gKlxuICogVGhlIGBuZ0Zvck9mYCBpcyBnZW5lcmFsbHkgdXNlZCBpbiB0aGVcbiAqIFtzaG9ydGhhbmQgZm9ybV0oZ3VpZGUvc3RydWN0dXJhbC1kaXJlY3RpdmVzI3RoZS1hc3Rlcmlzay0tcHJlZml4KSBgKm5nRm9yYC5cbiAqIEluIHRoaXMgZm9ybSwgdGhlIHRlbXBsYXRlIHRvIGJlIHJlbmRlcmVkIGZvciBlYWNoIGl0ZXJhdGlvbiBpcyB0aGUgY29udGVudFxuICogb2YgYW4gYW5jaG9yIGVsZW1lbnQgY29udGFpbmluZyB0aGUgZGlyZWN0aXZlLlxuICpcbiAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBzaG93cyB0aGUgc2hvcnRoYW5kIHN5bnRheCB3aXRoIHNvbWUgb3B0aW9ucyxcbiAqIGNvbnRhaW5lZCBpbiBhbiBgPGxpPmAgZWxlbWVudC5cbiAqXG4gKiBgYGBcbiAqIDxsaSAqbmdGb3I9XCJsZXQgaXRlbSBvZiBpdGVtczsgaW5kZXggYXMgaTsgdHJhY2tCeTogdHJhY2tCeUZuXCI+Li4uPC9saT5cbiAqIGBgYFxuICpcbiAqIFRoZSBzaG9ydGhhbmQgZm9ybSBleHBhbmRzIGludG8gYSBsb25nIGZvcm0gdGhhdCB1c2VzIHRoZSBgbmdGb3JPZmAgc2VsZWN0b3JcbiAqIG9uIGFuIGA8bmctdGVtcGxhdGU+YCBlbGVtZW50LlxuICogVGhlIGNvbnRlbnQgb2YgdGhlIGA8bmctdGVtcGxhdGU+YCBlbGVtZW50IGlzIHRoZSBgPGxpPmAgZWxlbWVudCB0aGF0IGhlbGQgdGhlXG4gKiBzaG9ydC1mb3JtIGRpcmVjdGl2ZS5cbiAqXG4gKiBIZXJlIGlzIHRoZSBleHBhbmRlZCB2ZXJzaW9uIG9mIHRoZSBzaG9ydC1mb3JtIGV4YW1wbGUuXG4gKlxuICogYGBgXG4gKiA8bmctdGVtcGxhdGUgbmdGb3IgbGV0LWl0ZW0gW25nRm9yT2ZdPVwiaXRlbXNcIiBsZXQtaT1cImluZGV4XCIgW25nRm9yVHJhY2tCeV09XCJ0cmFja0J5Rm5cIj5cbiAqICAgPGxpPi4uLjwvbGk+XG4gKiA8L25nLXRlbXBsYXRlPlxuICogYGBgXG4gKlxuICogQW5ndWxhciBhdXRvbWF0aWNhbGx5IGV4cGFuZHMgdGhlIHNob3J0aGFuZCBzeW50YXggYXMgaXQgY29tcGlsZXMgdGhlIHRlbXBsYXRlLlxuICogVGhlIGNvbnRleHQgZm9yIGVhY2ggZW1iZWRkZWQgdmlldyBpcyBsb2dpY2FsbHkgbWVyZ2VkIHRvIHRoZSBjdXJyZW50IGNvbXBvbmVudFxuICogY29udGV4dCBhY2NvcmRpbmcgdG8gaXRzIGxleGljYWwgcG9zaXRpb24uXG4gKlxuICogV2hlbiB1c2luZyB0aGUgc2hvcnRoYW5kIHN5bnRheCwgQW5ndWxhciBhbGxvd3Mgb25seSBbb25lIHN0cnVjdHVyYWwgZGlyZWN0aXZlXG4gKiBvbiBhbiBlbGVtZW50XShndWlkZS9zdHJ1Y3R1cmFsLWRpcmVjdGl2ZXMjb25lLXN0cnVjdHVyYWwtZGlyZWN0aXZlLXBlci1ob3N0LWVsZW1lbnQpLlxuICogSWYgeW91IHdhbnQgdG8gaXRlcmF0ZSBjb25kaXRpb25hbGx5LCBmb3IgZXhhbXBsZSxcbiAqIHB1dCB0aGUgYCpuZ0lmYCBvbiBhIGNvbnRhaW5lciBlbGVtZW50IHRoYXQgd3JhcHMgdGhlIGAqbmdGb3JgIGVsZW1lbnQuXG4gKiBGb3IgZnV0aGVyIGRpc2N1c3Npb24sIHNlZVxuICogW1N0cnVjdHVyYWwgRGlyZWN0aXZlc10oZ3VpZGUvc3RydWN0dXJhbC1kaXJlY3RpdmVzI29uZS1wZXItZWxlbWVudCkuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiAjIyMgTG9jYWwgdmFyaWFibGVzXG4gKlxuICogYE5nRm9yT2ZgIHByb3ZpZGVzIGV4cG9ydGVkIHZhbHVlcyB0aGF0IGNhbiBiZSBhbGlhc2VkIHRvIGxvY2FsIHZhcmlhYmxlcy5cbiAqIEZvciBleGFtcGxlOlxuICpcbiAqICBgYGBcbiAqIDxsaSAqbmdGb3I9XCJsZXQgdXNlciBvZiB1c2VyT2JzZXJ2YWJsZSB8IGFzeW5jIGFzIHVzZXJzOyBpbmRleCBhcyBpOyBmaXJzdCBhcyBpc0ZpcnN0XCI+XG4gKiAgICB7e2l9fS97e3VzZXJzLmxlbmd0aH19LiB7e3VzZXJ9fSA8c3BhbiAqbmdJZj1cImlzRmlyc3RcIj5kZWZhdWx0PC9zcGFuPlxuICogPC9saT5cbiAqIGBgYFxuICpcbiAqIFRoZSBmb2xsb3dpbmcgZXhwb3J0ZWQgdmFsdWVzIGNhbiBiZSBhbGlhc2VkIHRvIGxvY2FsIHZhcmlhYmxlczpcbiAqXG4gKiAtIGAkaW1wbGljaXQ6IFRgOiBUaGUgdmFsdWUgb2YgdGhlIGluZGl2aWR1YWwgaXRlbXMgaW4gdGhlIGl0ZXJhYmxlIChgbmdGb3JPZmApLlxuICogLSBgbmdGb3JPZjogTmdJdGVyYWJsZTxUPmA6IFRoZSB2YWx1ZSBvZiB0aGUgaXRlcmFibGUgZXhwcmVzc2lvbi4gVXNlZnVsIHdoZW4gdGhlIGV4cHJlc3Npb24gaXNcbiAqIG1vcmUgY29tcGxleCB0aGVuIGEgcHJvcGVydHkgYWNjZXNzLCBmb3IgZXhhbXBsZSB3aGVuIHVzaW5nIHRoZSBhc3luYyBwaXBlIChgdXNlclN0cmVhbXMgfFxuICogYXN5bmNgKS5cbiAqIC0gYGluZGV4OiBudW1iZXJgOiBUaGUgaW5kZXggb2YgdGhlIGN1cnJlbnQgaXRlbSBpbiB0aGUgaXRlcmFibGUuXG4gKiAtIGBmaXJzdDogYm9vbGVhbmA6IFRydWUgd2hlbiB0aGUgaXRlbSBpcyB0aGUgZmlyc3QgaXRlbSBpbiB0aGUgaXRlcmFibGUuXG4gKiAtIGBsYXN0OiBib29sZWFuYDogVHJ1ZSB3aGVuIHRoZSBpdGVtIGlzIHRoZSBsYXN0IGl0ZW0gaW4gdGhlIGl0ZXJhYmxlLlxuICogLSBgZXZlbjogYm9vbGVhbmA6IFRydWUgd2hlbiB0aGUgaXRlbSBoYXMgYW4gZXZlbiBpbmRleCBpbiB0aGUgaXRlcmFibGUuXG4gKiAtIGBvZGQ6IGJvb2xlYW5gOiBUcnVlIHdoZW4gdGhlIGl0ZW0gaGFzIGFuIG9kZCBpbmRleCBpbiB0aGUgaXRlcmFibGUuXG4gKlxuICogIyMjIENoYW5nZSBwcm9wYWdhdGlvblxuICpcbiAqIFdoZW4gdGhlIGNvbnRlbnRzIG9mIHRoZSBpdGVyYXRvciBjaGFuZ2VzLCBgTmdGb3JPZmAgbWFrZXMgdGhlIGNvcnJlc3BvbmRpbmcgY2hhbmdlcyB0byB0aGUgRE9NOlxuICpcbiAqICogV2hlbiBhbiBpdGVtIGlzIGFkZGVkLCBhIG5ldyBpbnN0YW5jZSBvZiB0aGUgdGVtcGxhdGUgaXMgYWRkZWQgdG8gdGhlIERPTS5cbiAqICogV2hlbiBhbiBpdGVtIGlzIHJlbW92ZWQsIGl0cyB0ZW1wbGF0ZSBpbnN0YW5jZSBpcyByZW1vdmVkIGZyb20gdGhlIERPTS5cbiAqICogV2hlbiBpdGVtcyBhcmUgcmVvcmRlcmVkLCB0aGVpciByZXNwZWN0aXZlIHRlbXBsYXRlcyBhcmUgcmVvcmRlcmVkIGluIHRoZSBET00uXG4gKlxuICogQW5ndWxhciB1c2VzIG9iamVjdCBpZGVudGl0eSB0byB0cmFjayBpbnNlcnRpb25zIGFuZCBkZWxldGlvbnMgd2l0aGluIHRoZSBpdGVyYXRvciBhbmQgcmVwcm9kdWNlXG4gKiB0aG9zZSBjaGFuZ2VzIGluIHRoZSBET00uIFRoaXMgaGFzIGltcG9ydGFudCBpbXBsaWNhdGlvbnMgZm9yIGFuaW1hdGlvbnMgYW5kIGFueSBzdGF0ZWZ1bFxuICogY29udHJvbHMgdGhhdCBhcmUgcHJlc2VudCwgc3VjaCBhcyBgPGlucHV0PmAgZWxlbWVudHMgdGhhdCBhY2NlcHQgdXNlciBpbnB1dC4gSW5zZXJ0ZWQgcm93cyBjYW5cbiAqIGJlIGFuaW1hdGVkIGluLCBkZWxldGVkIHJvd3MgY2FuIGJlIGFuaW1hdGVkIG91dCwgYW5kIHVuY2hhbmdlZCByb3dzIHJldGFpbiBhbnkgdW5zYXZlZCBzdGF0ZVxuICogc3VjaCBhcyB1c2VyIGlucHV0LlxuICogRm9yIG1vcmUgb24gYW5pbWF0aW9ucywgc2VlIFtUcmFuc2l0aW9ucyBhbmQgVHJpZ2dlcnNdKGd1aWRlL3RyYW5zaXRpb24tYW5kLXRyaWdnZXJzKS5cbiAqXG4gKiBUaGUgaWRlbnRpdGllcyBvZiBlbGVtZW50cyBpbiB0aGUgaXRlcmF0b3IgY2FuIGNoYW5nZSB3aGlsZSB0aGUgZGF0YSBkb2VzIG5vdC5cbiAqIFRoaXMgY2FuIGhhcHBlbiwgZm9yIGV4YW1wbGUsIGlmIHRoZSBpdGVyYXRvciBpcyBwcm9kdWNlZCBmcm9tIGFuIFJQQyB0byB0aGUgc2VydmVyLCBhbmQgdGhhdFxuICogUlBDIGlzIHJlLXJ1bi4gRXZlbiBpZiB0aGUgZGF0YSBoYXNuJ3QgY2hhbmdlZCwgdGhlIHNlY29uZCByZXNwb25zZSBwcm9kdWNlcyBvYmplY3RzIHdpdGhcbiAqIGRpZmZlcmVudCBpZGVudGl0aWVzLCBhbmQgQW5ndWxhciBtdXN0IHRlYXIgZG93biB0aGUgZW50aXJlIERPTSBhbmQgcmVidWlsZCBpdCAoYXMgaWYgYWxsIG9sZFxuICogZWxlbWVudHMgd2VyZSBkZWxldGVkIGFuZCBhbGwgbmV3IGVsZW1lbnRzIGluc2VydGVkKS5cbiAqXG4gKiBUbyBhdm9pZCB0aGlzIGV4cGVuc2l2ZSBvcGVyYXRpb24sIHlvdSBjYW4gY3VzdG9taXplIHRoZSBkZWZhdWx0IHRyYWNraW5nIGFsZ29yaXRobS5cbiAqIGJ5IHN1cHBseWluZyB0aGUgYHRyYWNrQnlgIG9wdGlvbiB0byBgTmdGb3JPZmAuXG4gKiBgdHJhY2tCeWAgdGFrZXMgYSBmdW5jdGlvbiB0aGF0IGhhcyB0d28gYXJndW1lbnRzOiBgaW5kZXhgIGFuZCBgaXRlbWAuXG4gKiBJZiBgdHJhY2tCeWAgaXMgZ2l2ZW4sIEFuZ3VsYXIgdHJhY2tzIGNoYW5nZXMgYnkgdGhlIHJldHVybiB2YWx1ZSBvZiB0aGUgZnVuY3Rpb24uXG4gKlxuICogQHNlZSBbU3RydWN0dXJhbCBEaXJlY3RpdmVzXShndWlkZS9zdHJ1Y3R1cmFsLWRpcmVjdGl2ZXMpXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKiBAcHVibGljQXBpXG4gKi9cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnW25nRm9yXVtuZ0Zvck9mXSd9KVxuZXhwb3J0IGNsYXNzIE5nRm9yT2Y8VD4gaW1wbGVtZW50cyBEb0NoZWNrIHtcbiAgQElucHV0KClcbiAgc2V0IG5nRm9yT2YobmdGb3JPZjogTmdJdGVyYWJsZTxUPikge1xuICAgIHRoaXMuX25nRm9yT2YgPSBuZ0Zvck9mO1xuICAgIHRoaXMuX25nRm9yT2ZEaXJ0eSA9IHRydWU7XG4gIH1cbiAgQElucHV0KClcbiAgc2V0IG5nRm9yVHJhY2tCeShmbjogVHJhY2tCeUZ1bmN0aW9uPFQ+KSB7XG4gICAgaWYgKGlzRGV2TW9kZSgpICYmIGZuICE9IG51bGwgJiYgdHlwZW9mIGZuICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAvLyBUT0RPKHZpY2IpOiB1c2UgYSBsb2cgc2VydmljZSBvbmNlIHRoZXJlIGlzIGEgcHVibGljIG9uZSBhdmFpbGFibGVcbiAgICAgIGlmICg8YW55PmNvbnNvbGUgJiYgPGFueT5jb25zb2xlLndhcm4pIHtcbiAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgICAgYHRyYWNrQnkgbXVzdCBiZSBhIGZ1bmN0aW9uLCBidXQgcmVjZWl2ZWQgJHtKU09OLnN0cmluZ2lmeShmbil9LiBgICtcbiAgICAgICAgICAgIGBTZWUgaHR0cHM6Ly9hbmd1bGFyLmlvL2RvY3MvdHMvbGF0ZXN0L2FwaS9jb21tb24vaW5kZXgvTmdGb3ItZGlyZWN0aXZlLmh0bWwjISNjaGFuZ2UtcHJvcGFnYXRpb24gZm9yIG1vcmUgaW5mb3JtYXRpb24uYCk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuX3RyYWNrQnlGbiA9IGZuO1xuICB9XG5cbiAgZ2V0IG5nRm9yVHJhY2tCeSgpOiBUcmFja0J5RnVuY3Rpb248VD4geyByZXR1cm4gdGhpcy5fdHJhY2tCeUZuOyB9XG5cbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHByaXZhdGUgX25nRm9yT2YgITogTmdJdGVyYWJsZTxUPjtcbiAgcHJpdmF0ZSBfbmdGb3JPZkRpcnR5OiBib29sZWFuID0gdHJ1ZTtcbiAgcHJpdmF0ZSBfZGlmZmVyOiBJdGVyYWJsZURpZmZlcjxUPnxudWxsID0gbnVsbDtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHByaXZhdGUgX3RyYWNrQnlGbiAhOiBUcmFja0J5RnVuY3Rpb248VD47XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIF92aWV3Q29udGFpbmVyOiBWaWV3Q29udGFpbmVyUmVmLCBwcml2YXRlIF90ZW1wbGF0ZTogVGVtcGxhdGVSZWY8TmdGb3JPZkNvbnRleHQ8VD4+LFxuICAgICAgcHJpdmF0ZSBfZGlmZmVyczogSXRlcmFibGVEaWZmZXJzKSB7fVxuXG4gIEBJbnB1dCgpXG4gIHNldCBuZ0ZvclRlbXBsYXRlKHZhbHVlOiBUZW1wbGF0ZVJlZjxOZ0Zvck9mQ29udGV4dDxUPj4pIHtcbiAgICAvLyBUT0RPKFRTMi4xKTogbWFrZSBUZW1wbGF0ZVJlZjxQYXJ0aWFsPE5nRm9yUm93T2Y8VD4+PiBvbmNlIHdlIG1vdmUgdG8gVFMgdjIuMVxuICAgIC8vIFRoZSBjdXJyZW50IHR5cGUgaXMgdG9vIHJlc3RyaWN0aXZlOyBhIHRlbXBsYXRlIHRoYXQganVzdCB1c2VzIGluZGV4LCBmb3IgZXhhbXBsZSxcbiAgICAvLyBzaG91bGQgYmUgYWNjZXB0YWJsZS5cbiAgICBpZiAodmFsdWUpIHtcbiAgICAgIHRoaXMuX3RlbXBsYXRlID0gdmFsdWU7XG4gICAgfVxuICB9XG5cbiAgbmdEb0NoZWNrKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9uZ0Zvck9mRGlydHkpIHtcbiAgICAgIHRoaXMuX25nRm9yT2ZEaXJ0eSA9IGZhbHNlO1xuICAgICAgLy8gUmVhY3Qgb24gbmdGb3JPZiBjaGFuZ2VzIG9ubHkgb25jZSBhbGwgaW5wdXRzIGhhdmUgYmVlbiBpbml0aWFsaXplZFxuICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLl9uZ0Zvck9mO1xuICAgICAgaWYgKCF0aGlzLl9kaWZmZXIgJiYgdmFsdWUpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB0aGlzLl9kaWZmZXIgPSB0aGlzLl9kaWZmZXJzLmZpbmQodmFsdWUpLmNyZWF0ZSh0aGlzLm5nRm9yVHJhY2tCeSk7XG4gICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgYENhbm5vdCBmaW5kIGEgZGlmZmVyIHN1cHBvcnRpbmcgb2JqZWN0ICcke3ZhbHVlfScgb2YgdHlwZSAnJHtnZXRUeXBlTmFtZUZvckRlYnVnZ2luZyh2YWx1ZSl9Jy4gTmdGb3Igb25seSBzdXBwb3J0cyBiaW5kaW5nIHRvIEl0ZXJhYmxlcyBzdWNoIGFzIEFycmF5cy5gKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAodGhpcy5fZGlmZmVyKSB7XG4gICAgICBjb25zdCBjaGFuZ2VzID0gdGhpcy5fZGlmZmVyLmRpZmYodGhpcy5fbmdGb3JPZik7XG4gICAgICBpZiAoY2hhbmdlcykgdGhpcy5fYXBwbHlDaGFuZ2VzKGNoYW5nZXMpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2FwcGx5Q2hhbmdlcyhjaGFuZ2VzOiBJdGVyYWJsZUNoYW5nZXM8VD4pIHtcbiAgICBjb25zdCBpbnNlcnRUdXBsZXM6IFJlY29yZFZpZXdUdXBsZTxUPltdID0gW107XG4gICAgY2hhbmdlcy5mb3JFYWNoT3BlcmF0aW9uKFxuICAgICAgICAoaXRlbTogSXRlcmFibGVDaGFuZ2VSZWNvcmQ8YW55PiwgYWRqdXN0ZWRQcmV2aW91c0luZGV4OiBudW1iZXIsIGN1cnJlbnRJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICAgICAgaWYgKGl0ZW0ucHJldmlvdXNJbmRleCA9PSBudWxsKSB7XG4gICAgICAgICAgICBjb25zdCB2aWV3ID0gdGhpcy5fdmlld0NvbnRhaW5lci5jcmVhdGVFbWJlZGRlZFZpZXcoXG4gICAgICAgICAgICAgICAgdGhpcy5fdGVtcGxhdGUsIG5ldyBOZ0Zvck9mQ29udGV4dDxUPihudWxsICEsIHRoaXMuX25nRm9yT2YsIC0xLCAtMSksIGN1cnJlbnRJbmRleCk7XG4gICAgICAgICAgICBjb25zdCB0dXBsZSA9IG5ldyBSZWNvcmRWaWV3VHVwbGU8VD4oaXRlbSwgdmlldyk7XG4gICAgICAgICAgICBpbnNlcnRUdXBsZXMucHVzaCh0dXBsZSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChjdXJyZW50SW5kZXggPT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5fdmlld0NvbnRhaW5lci5yZW1vdmUoYWRqdXN0ZWRQcmV2aW91c0luZGV4KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgdmlldyA9IHRoaXMuX3ZpZXdDb250YWluZXIuZ2V0KGFkanVzdGVkUHJldmlvdXNJbmRleCkgITtcbiAgICAgICAgICAgIHRoaXMuX3ZpZXdDb250YWluZXIubW92ZSh2aWV3LCBjdXJyZW50SW5kZXgpO1xuICAgICAgICAgICAgY29uc3QgdHVwbGUgPSBuZXcgUmVjb3JkVmlld1R1cGxlKGl0ZW0sIDxFbWJlZGRlZFZpZXdSZWY8TmdGb3JPZkNvbnRleHQ8VD4+PnZpZXcpO1xuICAgICAgICAgICAgaW5zZXJ0VHVwbGVzLnB1c2godHVwbGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGluc2VydFR1cGxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgdGhpcy5fcGVyVmlld0NoYW5nZShpbnNlcnRUdXBsZXNbaV0udmlldywgaW5zZXJ0VHVwbGVzW2ldLnJlY29yZCk7XG4gICAgfVxuXG4gICAgZm9yIChsZXQgaSA9IDAsIGlsZW4gPSB0aGlzLl92aWV3Q29udGFpbmVyLmxlbmd0aDsgaSA8IGlsZW47IGkrKykge1xuICAgICAgY29uc3Qgdmlld1JlZiA9IDxFbWJlZGRlZFZpZXdSZWY8TmdGb3JPZkNvbnRleHQ8VD4+PnRoaXMuX3ZpZXdDb250YWluZXIuZ2V0KGkpO1xuICAgICAgdmlld1JlZi5jb250ZXh0LmluZGV4ID0gaTtcbiAgICAgIHZpZXdSZWYuY29udGV4dC5jb3VudCA9IGlsZW47XG4gICAgICB2aWV3UmVmLmNvbnRleHQubmdGb3JPZiA9IHRoaXMuX25nRm9yT2Y7XG4gICAgfVxuXG4gICAgY2hhbmdlcy5mb3JFYWNoSWRlbnRpdHlDaGFuZ2UoKHJlY29yZDogYW55KSA9PiB7XG4gICAgICBjb25zdCB2aWV3UmVmID1cbiAgICAgICAgICA8RW1iZWRkZWRWaWV3UmVmPE5nRm9yT2ZDb250ZXh0PFQ+Pj50aGlzLl92aWV3Q29udGFpbmVyLmdldChyZWNvcmQuY3VycmVudEluZGV4KTtcbiAgICAgIHZpZXdSZWYuY29udGV4dC4kaW1wbGljaXQgPSByZWNvcmQuaXRlbTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX3BlclZpZXdDaGFuZ2UoXG4gICAgICB2aWV3OiBFbWJlZGRlZFZpZXdSZWY8TmdGb3JPZkNvbnRleHQ8VD4+LCByZWNvcmQ6IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkPGFueT4pIHtcbiAgICB2aWV3LmNvbnRleHQuJGltcGxpY2l0ID0gcmVjb3JkLml0ZW07XG4gIH1cblxuICAvKipcbiAgICogQXNzZXJ0cyB0aGUgY29ycmVjdCB0eXBlIG9mIHRoZSBjb250ZXh0IGZvciB0aGUgdGVtcGxhdGUgdGhhdCBgTmdGb3JPZmAgd2lsbCByZW5kZXIuXG4gICAqXG4gICAqIFRoZSBwcmVzZW5jZSBvZiB0aGlzIG1ldGhvZCBpcyBhIHNpZ25hbCB0byB0aGUgSXZ5IHRlbXBsYXRlIHR5cGUtY2hlY2sgY29tcGlsZXIgdGhhdCB0aGVcbiAgICogYE5nRm9yT2ZgIHN0cnVjdHVyYWwgZGlyZWN0aXZlIHJlbmRlcnMgaXRzIHRlbXBsYXRlIHdpdGggYSBzcGVjaWZpYyBjb250ZXh0IHR5cGUuXG4gICAqL1xuICBzdGF0aWMgbmdUZW1wbGF0ZUNvbnRleHRHdWFyZDxUPihkaXI6IE5nRm9yT2Y8VD4sIGN0eDogYW55KTogY3R4IGlzIE5nRm9yT2ZDb250ZXh0PFQ+IHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufVxuXG5jbGFzcyBSZWNvcmRWaWV3VHVwbGU8VD4ge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgcmVjb3JkOiBhbnksIHB1YmxpYyB2aWV3OiBFbWJlZGRlZFZpZXdSZWY8TmdGb3JPZkNvbnRleHQ8VD4+KSB7fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VHlwZU5hbWVGb3JEZWJ1Z2dpbmcodHlwZTogYW55KTogc3RyaW5nIHtcbiAgcmV0dXJuIHR5cGVbJ25hbWUnXSB8fCB0eXBlb2YgdHlwZTtcbn1cbiJdfQ==