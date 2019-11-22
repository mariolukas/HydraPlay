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
import { checkNoChanges, checkNoChangesInRootView, detectChangesInRootView, detectChangesInternal, markViewDirty, storeCleanupFn } from './instructions';
import { FLAGS, HOST, HOST_NODE, PARENT } from './interfaces/view';
import { destroyLView } from './node_manipulation';
import { getNativeByTNode } from './util';
/**
 * @record
 */
export function viewEngine_ChangeDetectorRef_interface() { }
/**
 * @template T
 */
export class ViewRef {
    /**
     * @param {?} _lView
     * @param {?} _context
     * @param {?} _componentIndex
     */
    constructor(_lView, _context, _componentIndex) {
        this._context = _context;
        this._componentIndex = _componentIndex;
        this._appRef = null;
        this._viewContainerRef = null;
        /**
         * \@internal
         */
        this._tViewNode = null;
        this._lView = _lView;
    }
    /**
     * @return {?}
     */
    get rootNodes() {
        if (this._lView[HOST] == null) {
            /** @type {?} */
            const tView = (/** @type {?} */ (this._lView[HOST_NODE]));
            return collectNativeNodes(this._lView, tView, []);
        }
        return [];
    }
    /**
     * @return {?}
     */
    get context() { return this._context ? this._context : this._lookUpContext(); }
    /**
     * @return {?}
     */
    get destroyed() {
        return (this._lView[FLAGS] & 64 /* Destroyed */) === 64 /* Destroyed */;
    }
    /**
     * @return {?}
     */
    destroy() {
        if (this._appRef) {
            this._appRef.detachView(this);
        }
        else if (this._viewContainerRef) {
            /** @type {?} */
            const index = this._viewContainerRef.indexOf(this);
            if (index > -1) {
                this._viewContainerRef.detach(index);
            }
            this._viewContainerRef = null;
        }
        destroyLView(this._lView);
    }
    /**
     * @param {?} callback
     * @return {?}
     */
    onDestroy(callback) { storeCleanupFn(this._lView, callback); }
    /**
     * Marks a view and all of its ancestors dirty.
     *
     * It also triggers change detection by calling `scheduleTick` internally, which coalesces
     * multiple `markForCheck` calls to into one change detection run.
     *
     * This can be used to ensure an {\@link ChangeDetectionStrategy#OnPush OnPush} component is
     * checked when it needs to be re-rendered but the two normal triggers haven't marked it
     * dirty (i.e. inputs haven't changed and events haven't fired in the view).
     *
     * <!-- TODO: Add a link to a chapter on OnPush components -->
     *
     * \@usageNotes
     * ### Example
     *
     * ```typescript
     * \@Component({
     *   selector: 'my-app',
     *   template: `Number of ticks: {{numberOfTicks}}`
     *   changeDetection: ChangeDetectionStrategy.OnPush,
     * })
     * class AppComponent {
     *   numberOfTicks = 0;
     *
     *   constructor(private ref: ChangeDetectorRef) {
     *     setInterval(() => {
     *       this.numberOfTicks++;
     *       // the following is required, otherwise the view will not be updated
     *       this.ref.markForCheck();
     *     }, 1000);
     *   }
     * }
     * ```
     * @return {?}
     */
    markForCheck() { markViewDirty(this._lView); }
    /**
     * Detaches the view from the change detection tree.
     *
     * Detached views will not be checked during change detection runs until they are
     * re-attached, even if they are dirty. `detach` can be used in combination with
     * {\@link ChangeDetectorRef#detectChanges detectChanges} to implement local change
     * detection checks.
     *
     * <!-- TODO: Add a link to a chapter on detach/reattach/local digest -->
     * <!-- TODO: Add a live demo once ref.detectChanges is merged into master -->
     *
     * \@usageNotes
     * ### Example
     *
     * The following example defines a component with a large list of readonly data.
     * Imagine the data changes constantly, many times per second. For performance reasons,
     * we want to check and update the list every five seconds. We can do that by detaching
     * the component's change detector and doing a local check every five seconds.
     *
     * ```typescript
     * class DataProvider {
     *   // in a real application the returned data will be different every time
     *   get data() {
     *     return [1,2,3,4,5];
     *   }
     * }
     *
     * \@Component({
     *   selector: 'giant-list',
     *   template: `
     *     <li *ngFor="let d of dataProvider.data">Data {{d}}</li>
     *   `,
     * })
     * class GiantList {
     *   constructor(private ref: ChangeDetectorRef, private dataProvider: DataProvider) {
     *     ref.detach();
     *     setInterval(() => {
     *       this.ref.detectChanges();
     *     }, 5000);
     *   }
     * }
     *  /
     *   selector: 'app',
     *   providers: [DataProvider],
     *   template: `
     *     <giant-list><giant-list>
     *   `,
     * })
     * class App {
     * }
     * ```
     * @return {?}
     */
    detach() { this._lView[FLAGS] &= ~16 /* Attached */; }
    /**
     * Re-attaches a view to the change detection tree.
     *
     * This can be used to re-attach views that were previously detached from the tree
     * using {\@link ChangeDetectorRef#detach detach}. Views are attached to the tree by default.
     *
     * <!-- TODO: Add a link to a chapter on detach/reattach/local digest -->
     *
     * \@usageNotes
     * ### Example
     *
     * The following example creates a component displaying `live` data. The component will detach
     * its change detector from the main change detector tree when the component's live property
     * is set to false.
     *
     * ```typescript
     * class DataProvider {
     *   data = 1;
     *
     *   constructor() {
     *     setInterval(() => {
     *       this.data = this.data * 2;
     *     }, 500);
     *   }
     * }
     *
     * \@Component({
     *   selector: 'live-data',
     *   inputs: ['live'],
     *   template: 'Data: {{dataProvider.data}}'
     * })
     * class LiveData {
     *   constructor(private ref: ChangeDetectorRef, private dataProvider: DataProvider) {}
     *
     *   set live(value) {
     *     if (value) {
     *       this.ref.reattach();
     *     } else {
     *       this.ref.detach();
     *     }
     *   }
     * }
     *  /
     *   selector: 'my-app',
     *   providers: [DataProvider],
     *   template: `
     *     Live Update: <input type="checkbox" [(ngModel)]="live">
     *     <live-data [live]="live"><live-data>
     *   `,
     * })
     * class AppComponent {
     *   live = true;
     * }
     * ```
     * @return {?}
     */
    reattach() { this._lView[FLAGS] |= 16 /* Attached */; }
    /**
     * Checks the view and its children.
     *
     * This can also be used in combination with {\@link ChangeDetectorRef#detach detach} to implement
     * local change detection checks.
     *
     * <!-- TODO: Add a link to a chapter on detach/reattach/local digest -->
     * <!-- TODO: Add a live demo once ref.detectChanges is merged into master -->
     *
     * \@usageNotes
     * ### Example
     *
     * The following example defines a component with a large list of readonly data.
     * Imagine, the data changes constantly, many times per second. For performance reasons,
     * we want to check and update the list every five seconds.
     *
     * We can do that by detaching the component's change detector and doing a local change detection
     * check every five seconds.
     *
     * See {\@link ChangeDetectorRef#detach detach} for more information.
     * @return {?}
     */
    detectChanges() { detectChangesInternal(this._lView, this.context); }
    /**
     * Checks the change detector and its children, and throws if any changes are detected.
     *
     * This is used in development mode to verify that running change detection doesn't
     * introduce other changes.
     * @return {?}
     */
    checkNoChanges() { checkNoChanges(this.context); }
    /**
     * @param {?} vcRef
     * @return {?}
     */
    attachToViewContainerRef(vcRef) {
        if (this._appRef) {
            throw new Error('This view is already attached directly to the ApplicationRef!');
        }
        this._viewContainerRef = vcRef;
    }
    /**
     * @return {?}
     */
    detachFromAppRef() { this._appRef = null; }
    /**
     * @param {?} appRef
     * @return {?}
     */
    attachToAppRef(appRef) {
        if (this._viewContainerRef) {
            throw new Error('This view is already attached to a ViewContainer!');
        }
        this._appRef = appRef;
    }
    /**
     * @private
     * @return {?}
     */
    _lookUpContext() {
        return this._context = (/** @type {?} */ ((/** @type {?} */ (this._lView[PARENT]))[this._componentIndex]));
    }
}
if (false) {
    /**
     * @type {?}
     * @private
     */
    ViewRef.prototype._appRef;
    /**
     * @type {?}
     * @private
     */
    ViewRef.prototype._viewContainerRef;
    /**
     * \@internal
     * @type {?}
     */
    ViewRef.prototype._tViewNode;
    /**
     * \@internal
     * @type {?}
     */
    ViewRef.prototype._lView;
    /**
     * @type {?}
     * @private
     */
    ViewRef.prototype._context;
    /**
     * @type {?}
     * @private
     */
    ViewRef.prototype._componentIndex;
}
/**
 * \@internal
 * @template T
 */
export class RootViewRef extends ViewRef {
    /**
     * @param {?} _view
     */
    constructor(_view) {
        super(_view, null, -1);
        this._view = _view;
    }
    /**
     * @return {?}
     */
    detectChanges() { detectChangesInRootView(this._view); }
    /**
     * @return {?}
     */
    checkNoChanges() { checkNoChangesInRootView(this._view); }
    /**
     * @return {?}
     */
    get context() { return (/** @type {?} */ (null)); }
}
if (false) {
    /** @type {?} */
    RootViewRef.prototype._view;
}
/**
 * @param {?} lView
 * @param {?} parentTNode
 * @param {?} result
 * @return {?}
 */
function collectNativeNodes(lView, parentTNode, result) {
    /** @type {?} */
    let tNodeChild = parentTNode.child;
    while (tNodeChild) {
        result.push(getNativeByTNode(tNodeChild, lView));
        if (tNodeChild.type === 4 /* ElementContainer */) {
            collectNativeNodes(lView, tNodeChild, result);
        }
        tNodeChild = tNodeChild.next;
    }
    return result;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld19yZWYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9yZW5kZXIzL3ZpZXdfcmVmLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBYUEsT0FBTyxFQUFDLGNBQWMsRUFBRSx3QkFBd0IsRUFBYSx1QkFBdUIsRUFBRSxxQkFBcUIsRUFBRSxhQUFhLEVBQUUsY0FBYyxFQUFlLE1BQU0sZ0JBQWdCLENBQUM7QUFFaEwsT0FBTyxFQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFxQixNQUFNLEVBQW1CLE1BQU0sbUJBQW1CLENBQUM7QUFDdEcsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ2pELE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLFFBQVEsQ0FBQzs7OztBQU94Qyw0REFBK0Y7Ozs7QUFFL0YsTUFBTSxPQUFPLE9BQU87Ozs7OztJQXVCbEIsWUFBWSxNQUFhLEVBQVUsUUFBZ0IsRUFBVSxlQUF1QjtRQUFqRCxhQUFRLEdBQVIsUUFBUSxDQUFRO1FBQVUsb0JBQWUsR0FBZixlQUFlLENBQVE7UUFyQjVFLFlBQU8sR0FBd0IsSUFBSSxDQUFDO1FBQ3BDLHNCQUFpQixHQUFxQyxJQUFJLENBQUM7Ozs7UUFLNUQsZUFBVSxHQUFtQixJQUFJLENBQUM7UUFnQnZDLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0lBQ3ZCLENBQUM7Ozs7SUFWRCxJQUFJLFNBQVM7UUFDWCxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxFQUFFOztrQkFDdkIsS0FBSyxHQUFHLG1CQUFBLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEVBQWE7WUFDakQsT0FBTyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztTQUNuRDtRQUNELE9B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Ozs7SUFLekMseUJBQXFCOzs7OztJQVVNLDJCQUF3Qjs7Ozs7SUFBRSxrQ0FBK0I7Ozs7OztBQXFPdEYsTUFBTSxPQUFPLFdBQWUsU0FBUSxPQUFVOzs7O0lBQzVDLFlBQW1CLEtBQVk7UUFBSSxLQUFLLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQXZDLFVBQUssR0FBTCxLQUFLLENBQU87SUFBNEIsQ0FBQzs7OztJQUU1RCxhQUFhLEtBQVcsdUJBQXVCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQzs7OztJQUU5RCxjQUFjLEtBQVcsd0JBQXdCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQzs7OztJQUVoRSxJQUFJLE9BQU8sS0FBUSxPQUFPLG1CQUFBLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztDQUNwQzs7O0lBUGEsNEJBQW1COzs7Ozs7OztBQVNqQyxTQUFTLGtCQUFrQixDQUFDLEtBQVksRUFBRSxXQUFrQixFQUFFLE1BQWE7O1FBQ3JFLFVBQVUsR0FBRyxXQUFXLENBQUMsS0FBSztJQUVsQyxPQUFPLFVBQVUsRUFBRTtRQUNqQixNQUFNLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ2pELElBQUksVUFBVSxDQUFDLElBQUksNkJBQStCLEVBQUU7WUFDbEQsa0JBQWtCLENBQUMsS0FBSyxFQUFFLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQztTQUMvQztRQUNELFVBQVUsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDO0tBQzlCO0lBRUQsT0FBTyxNQUFNLENBQUM7QUFDaEIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtBcHBsaWNhdGlvblJlZn0gZnJvbSAnLi4vYXBwbGljYXRpb25fcmVmJztcbmltcG9ydCB7Q2hhbmdlRGV0ZWN0b3JSZWYgYXMgdmlld0VuZ2luZV9DaGFuZ2VEZXRlY3RvclJlZn0gZnJvbSAnLi4vY2hhbmdlX2RldGVjdGlvbi9jaGFuZ2VfZGV0ZWN0b3JfcmVmJztcbmltcG9ydCB7Vmlld0NvbnRhaW5lclJlZiBhcyB2aWV3RW5naW5lX1ZpZXdDb250YWluZXJSZWZ9IGZyb20gJy4uL2xpbmtlci92aWV3X2NvbnRhaW5lcl9yZWYnO1xuaW1wb3J0IHtFbWJlZGRlZFZpZXdSZWYgYXMgdmlld0VuZ2luZV9FbWJlZGRlZFZpZXdSZWYsIEludGVybmFsVmlld1JlZiBhcyB2aWV3RW5naW5lX0ludGVybmFsVmlld1JlZn0gZnJvbSAnLi4vbGlua2VyL3ZpZXdfcmVmJztcblxuaW1wb3J0IHtjaGVja05vQ2hhbmdlcywgY2hlY2tOb0NoYW5nZXNJblJvb3RWaWV3LCBjaGVja1ZpZXcsIGRldGVjdENoYW5nZXNJblJvb3RWaWV3LCBkZXRlY3RDaGFuZ2VzSW50ZXJuYWwsIG1hcmtWaWV3RGlydHksIHN0b3JlQ2xlYW51cEZuLCB2aWV3QXR0YWNoZWR9IGZyb20gJy4vaW5zdHJ1Y3Rpb25zJztcbmltcG9ydCB7VE5vZGUsIFROb2RlVHlwZSwgVFZpZXdOb2RlfSBmcm9tICcuL2ludGVyZmFjZXMvbm9kZSc7XG5pbXBvcnQge0ZMQUdTLCBIT1NULCBIT1NUX05PREUsIExWaWV3LCBMVmlld0ZsYWdzLCBQQVJFTlQsIFJFTkRFUkVSX0ZBQ1RPUll9IGZyb20gJy4vaW50ZXJmYWNlcy92aWV3JztcbmltcG9ydCB7ZGVzdHJveUxWaWV3fSBmcm9tICcuL25vZGVfbWFuaXB1bGF0aW9uJztcbmltcG9ydCB7Z2V0TmF0aXZlQnlUTm9kZX0gZnJvbSAnLi91dGlsJztcblxuXG5cbi8vIE5lZWRlZCBkdWUgdG8gdHNpY2tsZSBkb3dubGV2ZWxpbmcgd2hlcmUgbXVsdGlwbGUgYGltcGxlbWVudHNgIHdpdGggY2xhc3NlcyBjcmVhdGVzXG4vLyBtdWx0aXBsZSBAZXh0ZW5kcyBpbiBDbG9zdXJlIGFubm90YXRpb25zLCB3aGljaCBpcyBpbGxlZ2FsLiBUaGlzIHdvcmthcm91bmQgZml4ZXNcbi8vIHRoZSBtdWx0aXBsZSBAZXh0ZW5kcyBieSBtYWtpbmcgdGhlIGFubm90YXRpb24gQGltcGxlbWVudHMgaW5zdGVhZFxuZXhwb3J0IGludGVyZmFjZSB2aWV3RW5naW5lX0NoYW5nZURldGVjdG9yUmVmX2ludGVyZmFjZSBleHRlbmRzIHZpZXdFbmdpbmVfQ2hhbmdlRGV0ZWN0b3JSZWYge31cblxuZXhwb3J0IGNsYXNzIFZpZXdSZWY8VD4gaW1wbGVtZW50cyB2aWV3RW5naW5lX0VtYmVkZGVkVmlld1JlZjxUPiwgdmlld0VuZ2luZV9JbnRlcm5hbFZpZXdSZWYsXG4gICAgdmlld0VuZ2luZV9DaGFuZ2VEZXRlY3RvclJlZl9pbnRlcmZhY2Uge1xuICBwcml2YXRlIF9hcHBSZWY6IEFwcGxpY2F0aW9uUmVmfG51bGwgPSBudWxsO1xuICBwcml2YXRlIF92aWV3Q29udGFpbmVyUmVmOiB2aWV3RW5naW5lX1ZpZXdDb250YWluZXJSZWZ8bnVsbCA9IG51bGw7XG5cbiAgLyoqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgcHVibGljIF90Vmlld05vZGU6IFRWaWV3Tm9kZXxudWxsID0gbnVsbDtcblxuICAvKipcbiAgICogQGludGVybmFsXG4gICAqL1xuICBwdWJsaWMgX2xWaWV3OiBMVmlldztcblxuICBnZXQgcm9vdE5vZGVzKCk6IGFueVtdIHtcbiAgICBpZiAodGhpcy5fbFZpZXdbSE9TVF0gPT0gbnVsbCkge1xuICAgICAgY29uc3QgdFZpZXcgPSB0aGlzLl9sVmlld1tIT1NUX05PREVdIGFzIFRWaWV3Tm9kZTtcbiAgICAgIHJldHVybiBjb2xsZWN0TmF0aXZlTm9kZXModGhpcy5fbFZpZXcsIHRWaWV3LCBbXSk7XG4gICAgfVxuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKF9sVmlldzogTFZpZXcsIHByaXZhdGUgX2NvbnRleHQ6IFR8bnVsbCwgcHJpdmF0ZSBfY29tcG9uZW50SW5kZXg6IG51bWJlcikge1xuICAgIHRoaXMuX2xWaWV3ID0gX2xWaWV3O1xuICB9XG5cbiAgZ2V0IGNvbnRleHQoKTogVCB7IHJldHVybiB0aGlzLl9jb250ZXh0ID8gdGhpcy5fY29udGV4dCA6IHRoaXMuX2xvb2tVcENvbnRleHQoKTsgfVxuXG4gIGdldCBkZXN0cm95ZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICh0aGlzLl9sVmlld1tGTEFHU10gJiBMVmlld0ZsYWdzLkRlc3Ryb3llZCkgPT09IExWaWV3RmxhZ3MuRGVzdHJveWVkO1xuICB9XG5cbiAgZGVzdHJveSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fYXBwUmVmKSB7XG4gICAgICB0aGlzLl9hcHBSZWYuZGV0YWNoVmlldyh0aGlzKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuX3ZpZXdDb250YWluZXJSZWYpIHtcbiAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5fdmlld0NvbnRhaW5lclJlZi5pbmRleE9mKHRoaXMpO1xuXG4gICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICB0aGlzLl92aWV3Q29udGFpbmVyUmVmLmRldGFjaChpbmRleCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX3ZpZXdDb250YWluZXJSZWYgPSBudWxsO1xuICAgIH1cbiAgICBkZXN0cm95TFZpZXcodGhpcy5fbFZpZXcpO1xuICB9XG5cbiAgb25EZXN0cm95KGNhbGxiYWNrOiBGdW5jdGlvbikgeyBzdG9yZUNsZWFudXBGbih0aGlzLl9sVmlldywgY2FsbGJhY2spOyB9XG5cbiAgLyoqXG4gICAqIE1hcmtzIGEgdmlldyBhbmQgYWxsIG9mIGl0cyBhbmNlc3RvcnMgZGlydHkuXG4gICAqXG4gICAqIEl0IGFsc28gdHJpZ2dlcnMgY2hhbmdlIGRldGVjdGlvbiBieSBjYWxsaW5nIGBzY2hlZHVsZVRpY2tgIGludGVybmFsbHksIHdoaWNoIGNvYWxlc2Nlc1xuICAgKiBtdWx0aXBsZSBgbWFya0ZvckNoZWNrYCBjYWxscyB0byBpbnRvIG9uZSBjaGFuZ2UgZGV0ZWN0aW9uIHJ1bi5cbiAgICpcbiAgICogVGhpcyBjYW4gYmUgdXNlZCB0byBlbnN1cmUgYW4ge0BsaW5rIENoYW5nZURldGVjdGlvblN0cmF0ZWd5I09uUHVzaCBPblB1c2h9IGNvbXBvbmVudCBpc1xuICAgKiBjaGVja2VkIHdoZW4gaXQgbmVlZHMgdG8gYmUgcmUtcmVuZGVyZWQgYnV0IHRoZSB0d28gbm9ybWFsIHRyaWdnZXJzIGhhdmVuJ3QgbWFya2VkIGl0XG4gICAqIGRpcnR5IChpLmUuIGlucHV0cyBoYXZlbid0IGNoYW5nZWQgYW5kIGV2ZW50cyBoYXZlbid0IGZpcmVkIGluIHRoZSB2aWV3KS5cbiAgICpcbiAgICogPCEtLSBUT0RPOiBBZGQgYSBsaW5rIHRvIGEgY2hhcHRlciBvbiBPblB1c2ggY29tcG9uZW50cyAtLT5cbiAgICpcbiAgICogQHVzYWdlTm90ZXNcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiBAQ29tcG9uZW50KHtcbiAgICogICBzZWxlY3RvcjogJ215LWFwcCcsXG4gICAqICAgdGVtcGxhdGU6IGBOdW1iZXIgb2YgdGlja3M6IHt7bnVtYmVyT2ZUaWNrc319YFxuICAgKiAgIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxuICAgKiB9KVxuICAgKiBjbGFzcyBBcHBDb21wb25lbnQge1xuICAgKiAgIG51bWJlck9mVGlja3MgPSAwO1xuICAgKlxuICAgKiAgIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVmOiBDaGFuZ2VEZXRlY3RvclJlZikge1xuICAgKiAgICAgc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgKiAgICAgICB0aGlzLm51bWJlck9mVGlja3MrKztcbiAgICogICAgICAgLy8gdGhlIGZvbGxvd2luZyBpcyByZXF1aXJlZCwgb3RoZXJ3aXNlIHRoZSB2aWV3IHdpbGwgbm90IGJlIHVwZGF0ZWRcbiAgICogICAgICAgdGhpcy5yZWYubWFya0ZvckNoZWNrKCk7XG4gICAqICAgICB9LCAxMDAwKTtcbiAgICogICB9XG4gICAqIH1cbiAgICogYGBgXG4gICAqL1xuICBtYXJrRm9yQ2hlY2soKTogdm9pZCB7IG1hcmtWaWV3RGlydHkodGhpcy5fbFZpZXcpOyB9XG5cbiAgLyoqXG4gICAqIERldGFjaGVzIHRoZSB2aWV3IGZyb20gdGhlIGNoYW5nZSBkZXRlY3Rpb24gdHJlZS5cbiAgICpcbiAgICogRGV0YWNoZWQgdmlld3Mgd2lsbCBub3QgYmUgY2hlY2tlZCBkdXJpbmcgY2hhbmdlIGRldGVjdGlvbiBydW5zIHVudGlsIHRoZXkgYXJlXG4gICAqIHJlLWF0dGFjaGVkLCBldmVuIGlmIHRoZXkgYXJlIGRpcnR5LiBgZGV0YWNoYCBjYW4gYmUgdXNlZCBpbiBjb21iaW5hdGlvbiB3aXRoXG4gICAqIHtAbGluayBDaGFuZ2VEZXRlY3RvclJlZiNkZXRlY3RDaGFuZ2VzIGRldGVjdENoYW5nZXN9IHRvIGltcGxlbWVudCBsb2NhbCBjaGFuZ2VcbiAgICogZGV0ZWN0aW9uIGNoZWNrcy5cbiAgICpcbiAgICogPCEtLSBUT0RPOiBBZGQgYSBsaW5rIHRvIGEgY2hhcHRlciBvbiBkZXRhY2gvcmVhdHRhY2gvbG9jYWwgZGlnZXN0IC0tPlxuICAgKiA8IS0tIFRPRE86IEFkZCBhIGxpdmUgZGVtbyBvbmNlIHJlZi5kZXRlY3RDaGFuZ2VzIGlzIG1lcmdlZCBpbnRvIG1hc3RlciAtLT5cbiAgICpcbiAgICogQHVzYWdlTm90ZXNcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICogVGhlIGZvbGxvd2luZyBleGFtcGxlIGRlZmluZXMgYSBjb21wb25lbnQgd2l0aCBhIGxhcmdlIGxpc3Qgb2YgcmVhZG9ubHkgZGF0YS5cbiAgICogSW1hZ2luZSB0aGUgZGF0YSBjaGFuZ2VzIGNvbnN0YW50bHksIG1hbnkgdGltZXMgcGVyIHNlY29uZC4gRm9yIHBlcmZvcm1hbmNlIHJlYXNvbnMsXG4gICAqIHdlIHdhbnQgdG8gY2hlY2sgYW5kIHVwZGF0ZSB0aGUgbGlzdCBldmVyeSBmaXZlIHNlY29uZHMuIFdlIGNhbiBkbyB0aGF0IGJ5IGRldGFjaGluZ1xuICAgKiB0aGUgY29tcG9uZW50J3MgY2hhbmdlIGRldGVjdG9yIGFuZCBkb2luZyBhIGxvY2FsIGNoZWNrIGV2ZXJ5IGZpdmUgc2Vjb25kcy5cbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiBjbGFzcyBEYXRhUHJvdmlkZXIge1xuICAgKiAgIC8vIGluIGEgcmVhbCBhcHBsaWNhdGlvbiB0aGUgcmV0dXJuZWQgZGF0YSB3aWxsIGJlIGRpZmZlcmVudCBldmVyeSB0aW1lXG4gICAqICAgZ2V0IGRhdGEoKSB7XG4gICAqICAgICByZXR1cm4gWzEsMiwzLDQsNV07XG4gICAqICAgfVxuICAgKiB9XG4gICAqXG4gICAqIEBDb21wb25lbnQoe1xuICAgKiAgIHNlbGVjdG9yOiAnZ2lhbnQtbGlzdCcsXG4gICAqICAgdGVtcGxhdGU6IGBcbiAgICogICAgIDxsaSAqbmdGb3I9XCJsZXQgZCBvZiBkYXRhUHJvdmlkZXIuZGF0YVwiPkRhdGEge3tkfX08L2xpPlxuICAgKiAgIGAsXG4gICAqIH0pXG4gICAqIGNsYXNzIEdpYW50TGlzdCB7XG4gICAqICAgY29uc3RydWN0b3IocHJpdmF0ZSByZWY6IENoYW5nZURldGVjdG9yUmVmLCBwcml2YXRlIGRhdGFQcm92aWRlcjogRGF0YVByb3ZpZGVyKSB7XG4gICAqICAgICByZWYuZGV0YWNoKCk7XG4gICAqICAgICBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAqICAgICAgIHRoaXMucmVmLmRldGVjdENoYW5nZXMoKTtcbiAgICogICAgIH0sIDUwMDApO1xuICAgKiAgIH1cbiAgICogfVxuICAgKlxuICAgKiBAQ29tcG9uZW50KHtcbiAgICogICBzZWxlY3RvcjogJ2FwcCcsXG4gICAqICAgcHJvdmlkZXJzOiBbRGF0YVByb3ZpZGVyXSxcbiAgICogICB0ZW1wbGF0ZTogYFxuICAgKiAgICAgPGdpYW50LWxpc3Q+PGdpYW50LWxpc3Q+XG4gICAqICAgYCxcbiAgICogfSlcbiAgICogY2xhc3MgQXBwIHtcbiAgICogfVxuICAgKiBgYGBcbiAgICovXG4gIGRldGFjaCgpOiB2b2lkIHsgdGhpcy5fbFZpZXdbRkxBR1NdICY9IH5MVmlld0ZsYWdzLkF0dGFjaGVkOyB9XG5cbiAgLyoqXG4gICAqIFJlLWF0dGFjaGVzIGEgdmlldyB0byB0aGUgY2hhbmdlIGRldGVjdGlvbiB0cmVlLlxuICAgKlxuICAgKiBUaGlzIGNhbiBiZSB1c2VkIHRvIHJlLWF0dGFjaCB2aWV3cyB0aGF0IHdlcmUgcHJldmlvdXNseSBkZXRhY2hlZCBmcm9tIHRoZSB0cmVlXG4gICAqIHVzaW5nIHtAbGluayBDaGFuZ2VEZXRlY3RvclJlZiNkZXRhY2ggZGV0YWNofS4gVmlld3MgYXJlIGF0dGFjaGVkIHRvIHRoZSB0cmVlIGJ5IGRlZmF1bHQuXG4gICAqXG4gICAqIDwhLS0gVE9ETzogQWRkIGEgbGluayB0byBhIGNoYXB0ZXIgb24gZGV0YWNoL3JlYXR0YWNoL2xvY2FsIGRpZ2VzdCAtLT5cbiAgICpcbiAgICogQHVzYWdlTm90ZXNcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICogVGhlIGZvbGxvd2luZyBleGFtcGxlIGNyZWF0ZXMgYSBjb21wb25lbnQgZGlzcGxheWluZyBgbGl2ZWAgZGF0YS4gVGhlIGNvbXBvbmVudCB3aWxsIGRldGFjaFxuICAgKiBpdHMgY2hhbmdlIGRldGVjdG9yIGZyb20gdGhlIG1haW4gY2hhbmdlIGRldGVjdG9yIHRyZWUgd2hlbiB0aGUgY29tcG9uZW50J3MgbGl2ZSBwcm9wZXJ0eVxuICAgKiBpcyBzZXQgdG8gZmFsc2UuXG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogY2xhc3MgRGF0YVByb3ZpZGVyIHtcbiAgICogICBkYXRhID0gMTtcbiAgICpcbiAgICogICBjb25zdHJ1Y3RvcigpIHtcbiAgICogICAgIHNldEludGVydmFsKCgpID0+IHtcbiAgICogICAgICAgdGhpcy5kYXRhID0gdGhpcy5kYXRhICogMjtcbiAgICogICAgIH0sIDUwMCk7XG4gICAqICAgfVxuICAgKiB9XG4gICAqXG4gICAqIEBDb21wb25lbnQoe1xuICAgKiAgIHNlbGVjdG9yOiAnbGl2ZS1kYXRhJyxcbiAgICogICBpbnB1dHM6IFsnbGl2ZSddLFxuICAgKiAgIHRlbXBsYXRlOiAnRGF0YToge3tkYXRhUHJvdmlkZXIuZGF0YX19J1xuICAgKiB9KVxuICAgKiBjbGFzcyBMaXZlRGF0YSB7XG4gICAqICAgY29uc3RydWN0b3IocHJpdmF0ZSByZWY6IENoYW5nZURldGVjdG9yUmVmLCBwcml2YXRlIGRhdGFQcm92aWRlcjogRGF0YVByb3ZpZGVyKSB7fVxuICAgKlxuICAgKiAgIHNldCBsaXZlKHZhbHVlKSB7XG4gICAqICAgICBpZiAodmFsdWUpIHtcbiAgICogICAgICAgdGhpcy5yZWYucmVhdHRhY2goKTtcbiAgICogICAgIH0gZWxzZSB7XG4gICAqICAgICAgIHRoaXMucmVmLmRldGFjaCgpO1xuICAgKiAgICAgfVxuICAgKiAgIH1cbiAgICogfVxuICAgKlxuICAgKiBAQ29tcG9uZW50KHtcbiAgICogICBzZWxlY3RvcjogJ215LWFwcCcsXG4gICAqICAgcHJvdmlkZXJzOiBbRGF0YVByb3ZpZGVyXSxcbiAgICogICB0ZW1wbGF0ZTogYFxuICAgKiAgICAgTGl2ZSBVcGRhdGU6IDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBbKG5nTW9kZWwpXT1cImxpdmVcIj5cbiAgICogICAgIDxsaXZlLWRhdGEgW2xpdmVdPVwibGl2ZVwiPjxsaXZlLWRhdGE+XG4gICAqICAgYCxcbiAgICogfSlcbiAgICogY2xhc3MgQXBwQ29tcG9uZW50IHtcbiAgICogICBsaXZlID0gdHJ1ZTtcbiAgICogfVxuICAgKiBgYGBcbiAgICovXG4gIHJlYXR0YWNoKCk6IHZvaWQgeyB0aGlzLl9sVmlld1tGTEFHU10gfD0gTFZpZXdGbGFncy5BdHRhY2hlZDsgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgdGhlIHZpZXcgYW5kIGl0cyBjaGlsZHJlbi5cbiAgICpcbiAgICogVGhpcyBjYW4gYWxzbyBiZSB1c2VkIGluIGNvbWJpbmF0aW9uIHdpdGgge0BsaW5rIENoYW5nZURldGVjdG9yUmVmI2RldGFjaCBkZXRhY2h9IHRvIGltcGxlbWVudFxuICAgKiBsb2NhbCBjaGFuZ2UgZGV0ZWN0aW9uIGNoZWNrcy5cbiAgICpcbiAgICogPCEtLSBUT0RPOiBBZGQgYSBsaW5rIHRvIGEgY2hhcHRlciBvbiBkZXRhY2gvcmVhdHRhY2gvbG9jYWwgZGlnZXN0IC0tPlxuICAgKiA8IS0tIFRPRE86IEFkZCBhIGxpdmUgZGVtbyBvbmNlIHJlZi5kZXRlY3RDaGFuZ2VzIGlzIG1lcmdlZCBpbnRvIG1hc3RlciAtLT5cbiAgICpcbiAgICogQHVzYWdlTm90ZXNcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICogVGhlIGZvbGxvd2luZyBleGFtcGxlIGRlZmluZXMgYSBjb21wb25lbnQgd2l0aCBhIGxhcmdlIGxpc3Qgb2YgcmVhZG9ubHkgZGF0YS5cbiAgICogSW1hZ2luZSwgdGhlIGRhdGEgY2hhbmdlcyBjb25zdGFudGx5LCBtYW55IHRpbWVzIHBlciBzZWNvbmQuIEZvciBwZXJmb3JtYW5jZSByZWFzb25zLFxuICAgKiB3ZSB3YW50IHRvIGNoZWNrIGFuZCB1cGRhdGUgdGhlIGxpc3QgZXZlcnkgZml2ZSBzZWNvbmRzLlxuICAgKlxuICAgKiBXZSBjYW4gZG8gdGhhdCBieSBkZXRhY2hpbmcgdGhlIGNvbXBvbmVudCdzIGNoYW5nZSBkZXRlY3RvciBhbmQgZG9pbmcgYSBsb2NhbCBjaGFuZ2UgZGV0ZWN0aW9uXG4gICAqIGNoZWNrIGV2ZXJ5IGZpdmUgc2Vjb25kcy5cbiAgICpcbiAgICogU2VlIHtAbGluayBDaGFuZ2VEZXRlY3RvclJlZiNkZXRhY2ggZGV0YWNofSBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAgICovXG4gIGRldGVjdENoYW5nZXMoKTogdm9pZCB7IGRldGVjdENoYW5nZXNJbnRlcm5hbCh0aGlzLl9sVmlldywgdGhpcy5jb250ZXh0KTsgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgdGhlIGNoYW5nZSBkZXRlY3RvciBhbmQgaXRzIGNoaWxkcmVuLCBhbmQgdGhyb3dzIGlmIGFueSBjaGFuZ2VzIGFyZSBkZXRlY3RlZC5cbiAgICpcbiAgICogVGhpcyBpcyB1c2VkIGluIGRldmVsb3BtZW50IG1vZGUgdG8gdmVyaWZ5IHRoYXQgcnVubmluZyBjaGFuZ2UgZGV0ZWN0aW9uIGRvZXNuJ3RcbiAgICogaW50cm9kdWNlIG90aGVyIGNoYW5nZXMuXG4gICAqL1xuICBjaGVja05vQ2hhbmdlcygpOiB2b2lkIHsgY2hlY2tOb0NoYW5nZXModGhpcy5jb250ZXh0KTsgfVxuXG4gIGF0dGFjaFRvVmlld0NvbnRhaW5lclJlZih2Y1JlZjogdmlld0VuZ2luZV9WaWV3Q29udGFpbmVyUmVmKSB7XG4gICAgaWYgKHRoaXMuX2FwcFJlZikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGlzIHZpZXcgaXMgYWxyZWFkeSBhdHRhY2hlZCBkaXJlY3RseSB0byB0aGUgQXBwbGljYXRpb25SZWYhJyk7XG4gICAgfVxuICAgIHRoaXMuX3ZpZXdDb250YWluZXJSZWYgPSB2Y1JlZjtcbiAgfVxuXG4gIGRldGFjaEZyb21BcHBSZWYoKSB7IHRoaXMuX2FwcFJlZiA9IG51bGw7IH1cblxuICBhdHRhY2hUb0FwcFJlZihhcHBSZWY6IEFwcGxpY2F0aW9uUmVmKSB7XG4gICAgaWYgKHRoaXMuX3ZpZXdDb250YWluZXJSZWYpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVGhpcyB2aWV3IGlzIGFscmVhZHkgYXR0YWNoZWQgdG8gYSBWaWV3Q29udGFpbmVyIScpO1xuICAgIH1cbiAgICB0aGlzLl9hcHBSZWYgPSBhcHBSZWY7XG4gIH1cblxuICBwcml2YXRlIF9sb29rVXBDb250ZXh0KCk6IFQge1xuICAgIHJldHVybiB0aGlzLl9jb250ZXh0ID0gdGhpcy5fbFZpZXdbUEFSRU5UXSAhW3RoaXMuX2NvbXBvbmVudEluZGV4XSBhcyBUO1xuICB9XG59XG5cbi8qKiBAaW50ZXJuYWwgKi9cbmV4cG9ydCBjbGFzcyBSb290Vmlld1JlZjxUPiBleHRlbmRzIFZpZXdSZWY8VD4ge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgX3ZpZXc6IExWaWV3KSB7IHN1cGVyKF92aWV3LCBudWxsLCAtMSk7IH1cblxuICBkZXRlY3RDaGFuZ2VzKCk6IHZvaWQgeyBkZXRlY3RDaGFuZ2VzSW5Sb290Vmlldyh0aGlzLl92aWV3KTsgfVxuXG4gIGNoZWNrTm9DaGFuZ2VzKCk6IHZvaWQgeyBjaGVja05vQ2hhbmdlc0luUm9vdFZpZXcodGhpcy5fdmlldyk7IH1cblxuICBnZXQgY29udGV4dCgpOiBUIHsgcmV0dXJuIG51bGwgITsgfVxufVxuXG5mdW5jdGlvbiBjb2xsZWN0TmF0aXZlTm9kZXMobFZpZXc6IExWaWV3LCBwYXJlbnRUTm9kZTogVE5vZGUsIHJlc3VsdDogYW55W10pOiBhbnlbXSB7XG4gIGxldCB0Tm9kZUNoaWxkID0gcGFyZW50VE5vZGUuY2hpbGQ7XG5cbiAgd2hpbGUgKHROb2RlQ2hpbGQpIHtcbiAgICByZXN1bHQucHVzaChnZXROYXRpdmVCeVROb2RlKHROb2RlQ2hpbGQsIGxWaWV3KSk7XG4gICAgaWYgKHROb2RlQ2hpbGQudHlwZSA9PT0gVE5vZGVUeXBlLkVsZW1lbnRDb250YWluZXIpIHtcbiAgICAgIGNvbGxlY3ROYXRpdmVOb2RlcyhsVmlldywgdE5vZGVDaGlsZCwgcmVzdWx0KTtcbiAgICB9XG4gICAgdE5vZGVDaGlsZCA9IHROb2RlQ2hpbGQubmV4dDtcbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59XG4iXX0=