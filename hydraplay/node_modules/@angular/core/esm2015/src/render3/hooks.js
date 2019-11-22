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
import { assertEqual } from './assert';
import { FLAGS } from './interfaces/view';
/**
 * If this is the first template pass, any ngOnInit or ngDoCheck hooks will be queued into
 * TView.initHooks during directiveCreate.
 *
 * The directive index and hook type are encoded into one number (1st bit: type, remaining bits:
 * directive index), then saved in the even indices of the initHooks array. The odd indices
 * hold the hook functions themselves.
 *
 * @param {?} index The index of the directive in LView
 * @param {?} onInit
 * @param {?} doCheck
 * @param {?} tView The current TView
 * @return {?}
 */
export function queueInitHooks(index, onInit, doCheck, tView) {
    ngDevMode &&
        assertEqual(tView.firstTemplatePass, true, 'Should only be called on first template pass');
    if (onInit) {
        (tView.initHooks || (tView.initHooks = [])).push(index, onInit);
    }
    if (doCheck) {
        (tView.initHooks || (tView.initHooks = [])).push(index, doCheck);
        (tView.checkHooks || (tView.checkHooks = [])).push(index, doCheck);
    }
}
/**
 * Loops through the directives on a node and queues all their hooks except ngOnInit
 * and ngDoCheck, which are queued separately in directiveCreate.
 * @param {?} tView
 * @param {?} tNode
 * @return {?}
 */
export function queueLifecycleHooks(tView, tNode) {
    if (tView.firstTemplatePass) {
        // It's necessary to loop through the directives at elementEnd() (rather than processing in
        // directiveCreate) so we can preserve the current hook order. Content, view, and destroy
        // hooks for projected components and directives must be called *before* their hosts.
        for (let i = tNode.directiveStart, end = tNode.directiveEnd; i < end; i++) {
            /** @type {?} */
            const def = (/** @type {?} */ (tView.data[i]));
            queueContentHooks(def, tView, i);
            queueViewHooks(def, tView, i);
            queueDestroyHooks(def, tView, i);
        }
    }
}
/**
 * Queues afterContentInit and afterContentChecked hooks on TView
 * @param {?} def
 * @param {?} tView
 * @param {?} i
 * @return {?}
 */
function queueContentHooks(def, tView, i) {
    if (def.afterContentInit) {
        (tView.contentHooks || (tView.contentHooks = [])).push(i, def.afterContentInit);
    }
    if (def.afterContentChecked) {
        (tView.contentHooks || (tView.contentHooks = [])).push(i, def.afterContentChecked);
        (tView.contentCheckHooks || (tView.contentCheckHooks = [])).push(i, def.afterContentChecked);
    }
}
/**
 * Queues afterViewInit and afterViewChecked hooks on TView
 * @param {?} def
 * @param {?} tView
 * @param {?} i
 * @return {?}
 */
function queueViewHooks(def, tView, i) {
    if (def.afterViewInit) {
        (tView.viewHooks || (tView.viewHooks = [])).push(i, def.afterViewInit);
    }
    if (def.afterViewChecked) {
        (tView.viewHooks || (tView.viewHooks = [])).push(i, def.afterViewChecked);
        (tView.viewCheckHooks || (tView.viewCheckHooks = [])).push(i, def.afterViewChecked);
    }
}
/**
 * Queues onDestroy hooks on TView
 * @param {?} def
 * @param {?} tView
 * @param {?} i
 * @return {?}
 */
function queueDestroyHooks(def, tView, i) {
    if (def.onDestroy != null) {
        (tView.destroyHooks || (tView.destroyHooks = [])).push(i, def.onDestroy);
    }
}
/**
 * Calls onInit and doCheck calls if they haven't already been called.
 *
 * @param {?} currentView The current view
 * @param {?} tView
 * @param {?} checkNoChangesMode
 * @return {?}
 */
export function executeInitHooks(currentView, tView, checkNoChangesMode) {
    if (!checkNoChangesMode && currentView[FLAGS] & 32 /* RunInit */) {
        executeHooks(currentView, tView.initHooks, tView.checkHooks, checkNoChangesMode);
        currentView[FLAGS] &= ~32 /* RunInit */;
    }
}
/**
 * Iterates over afterViewInit and afterViewChecked functions and calls them.
 *
 * @param {?} currentView The current view
 * @param {?} allHooks
 * @param {?} checkHooks
 * @param {?} checkNoChangesMode
 * @return {?}
 */
export function executeHooks(currentView, allHooks, checkHooks, checkNoChangesMode) {
    if (checkNoChangesMode)
        return;
    /** @type {?} */
    const hooksToCall = currentView[FLAGS] & 2 /* FirstLViewPass */ ? allHooks : checkHooks;
    if (hooksToCall) {
        callHooks(currentView, hooksToCall);
    }
}
/**
 * Calls lifecycle hooks with their contexts, skipping init hooks if it's not
 * the first LView pass.
 *
 * @param {?} currentView The current view
 * @param {?} arr The array in which the hooks are found
 * @return {?}
 */
export function callHooks(currentView, arr) {
    for (let i = 0; i < arr.length; i += 2) {
        ((/** @type {?} */ (arr[i + 1]))).call(currentView[(/** @type {?} */ (arr[i]))]);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG9va3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9yZW5kZXIzL2hvb2tzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBUUEsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUdyQyxPQUFPLEVBQUMsS0FBSyxFQUFxQyxNQUFNLG1CQUFtQixDQUFDOzs7Ozs7Ozs7Ozs7Ozs7QUFnQjVFLE1BQU0sVUFBVSxjQUFjLENBQzFCLEtBQWEsRUFBRSxNQUEyQixFQUFFLE9BQTRCLEVBQUUsS0FBWTtJQUN4RixTQUFTO1FBQ0wsV0FBVyxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLEVBQUUsOENBQThDLENBQUMsQ0FBQztJQUMvRixJQUFJLE1BQU0sRUFBRTtRQUNWLENBQUMsS0FBSyxDQUFDLFNBQVMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0tBQ2pFO0lBRUQsSUFBSSxPQUFPLEVBQUU7UUFDWCxDQUFDLEtBQUssQ0FBQyxTQUFTLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNqRSxDQUFDLEtBQUssQ0FBQyxVQUFVLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztLQUNwRTtBQUNILENBQUM7Ozs7Ozs7O0FBTUQsTUFBTSxVQUFVLG1CQUFtQixDQUFDLEtBQVksRUFBRSxLQUFZO0lBQzVELElBQUksS0FBSyxDQUFDLGlCQUFpQixFQUFFO1FBQzNCLDJGQUEyRjtRQUMzRix5RkFBeUY7UUFDekYscUZB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a0IsQ0FBQyxDQUFDO1FBQ2pGLFdBQVcsQ0FBQyxLQUFLLENBQUMsSUFBSSxpQkFBbUIsQ0FBQztLQUMzQztBQUNILENBQUM7Ozs7Ozs7Ozs7QUFPRCxNQUFNLFVBQVUsWUFBWSxDQUN4QixXQUFrQixFQUFFLFFBQXlCLEVBQUUsVUFBMkIsRUFDMUUsa0JBQTJCO0lBQzdCLElBQUksa0JBQWtCO1FBQUUsT0FBTzs7VUFFekIsV0FBVyxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMseUJBQTRCLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsVUFBVTtJQUMxRixJQUFJLFdBQVcsRUFBRTtRQUNmLFNBQVMsQ0FBQyxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7S0FDckM7QUFDSCxDQUFDOzs7Ozs7Ozs7QUFTRCxNQUFNLFVBQVUsU0FBUyxDQUFDLFdBQWtCLEVBQUUsR0FBYTtJQUN6RCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQ3RDLENBQUMsbUJBQUEsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBYSxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxtQkFBQSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQVUsQ0FBQyxDQUFDLENBQUM7S0FDL0Q7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2Fzc2VydEVxdWFsfSBmcm9tICcuL2Fzc2VydCc7XG5pbXBvcnQge0RpcmVjdGl2ZURlZn0gZnJvbSAnLi9pbnRlcmZhY2VzL2RlZmluaXRpb24nO1xuaW1wb3J0IHtUTm9kZX0gZnJvbSAnLi9pbnRlcmZhY2VzL25vZGUnO1xuaW1wb3J0IHtGTEFHUywgSG9va0RhdGEsIExWaWV3LCBMVmlld0ZsYWdzLCBUVmlld30gZnJvbSAnLi9pbnRlcmZhY2VzL3ZpZXcnO1xuXG5cblxuLyoqXG4gKiBJZiB0aGlzIGlzIHRoZSBmaXJzdCB0ZW1wbGF0ZSBwYXNzLCBhbnkgbmdPbkluaXQgb3IgbmdEb0NoZWNrIGhvb2tzIHdpbGwgYmUgcXVldWVkIGludG9cbiAqIFRWaWV3LmluaXRIb29rcyBkdXJpbmcgZGlyZWN0aXZlQ3JlYXRlLlxuICpcbiAqIFRoZSBkaXJlY3RpdmUgaW5kZXggYW5kIGhvb2sgdHlwZSBhcmUgZW5jb2RlZCBpbnRvIG9uZSBudW1iZXIgKDFzdCBiaXQ6IHR5cGUsIHJlbWFpbmluZyBiaXRzOlxuICogZGlyZWN0aXZlIGluZGV4KSwgdGhlbiBzYXZlZCBpbiB0aGUgZXZlbiBpbmRpY2VzIG9mIHRoZSBpbml0SG9va3MgYXJyYXkuIFRoZSBvZGQgaW5kaWNlc1xuICogaG9sZCB0aGUgaG9vayBmdW5jdGlvbnMgdGhlbXNlbHZlcy5cbiAqXG4gKiBAcGFyYW0gaW5kZXggVGhlIGluZGV4IG9mIHRoZSBkaXJlY3RpdmUgaW4gTFZpZXdcbiAqIEBwYXJhbSBob29rcyBUaGUgc3RhdGljIGhvb2tzIG1hcCBvbiB0aGUgZGlyZWN0aXZlIGRlZlxuICogQHBhcmFtIHRWaWV3IFRoZSBjdXJyZW50IFRWaWV3XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBxdWV1ZUluaXRIb29rcyhcbiAgICBpbmRleDogbnVtYmVyLCBvbkluaXQ6ICgoKSA9PiB2b2lkKSB8IG51bGwsIGRvQ2hlY2s6ICgoKSA9PiB2b2lkKSB8IG51bGwsIHRWaWV3OiBUVmlldyk6IHZvaWQge1xuICBuZ0Rldk1vZGUgJiZcbiAgICAgIGFzc2VydEVxdWFsKHRWaWV3LmZpcnN0VGVtcGxhdGVQYXNzLCB0cnVlLCAnU2hvdWxkIG9ubHkgYmUgY2FsbGVkIG9uIGZpcnN0IHRlbXBsYXRlIHBhc3MnKTtcbiAgaWYgKG9uSW5pdCkge1xuICAgICh0Vmlldy5pbml0SG9va3MgfHwgKHRWaWV3LmluaXRIb29rcyA9IFtdKSkucHVzaChpbmRleCwgb25Jbml0KTtcbiAgfVxuXG4gIGlmIChkb0NoZWNrKSB7XG4gICAgKHRWaWV3LmluaXRIb29rcyB8fCAodFZpZXcuaW5pdEhvb2tzID0gW10pKS5wdXNoKGluZGV4LCBkb0NoZWNrKTtcbiAgICAodFZpZXcuY2hlY2tIb29rcyB8fCAodFZpZXcuY2hlY2tIb29rcyA9IFtdKSkucHVzaChpbmRleCwgZG9DaGVjayk7XG4gIH1cbn1cblxuLyoqXG4gKiBMb29wcyB0aHJvdWdoIHRoZSBkaXJlY3RpdmVzIG9uIGEgbm9kZSBhbmQgcXVldWVzIGFsbCB0aGVpciBob29rcyBleGNlcHQgbmdPbkluaXRcbiAqIGFuZCBuZ0RvQ2hlY2ssIHdoaWNoIGFyZSBxdWV1ZWQgc2VwYXJhdGVseSBpbiBkaXJlY3RpdmVDcmVhdGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBxdWV1ZUxpZmVjeWNsZUhvb2tzKHRWaWV3OiBUVmlldywgdE5vZGU6IFROb2RlKTogdm9pZCB7XG4gIGlmICh0Vmlldy5maXJzdFRlbXBsYXRlUGFzcykge1xuICAgIC8vIEl0J3MgbmVjZXNzYXJ5IHRvIGxvb3AgdGhyb3VnaCB0aGUgZGlyZWN0aXZlcyBhdCBlbGVtZW50RW5kKCkgKHJhdGhlciB0aGFuIHByb2Nlc3NpbmcgaW5cbiAgICAvLyBkaXJlY3RpdmVDcmVhdGUpIHNvIHdlIGNhbiBwcmVzZXJ2ZSB0aGUgY3VycmVudCBob29rIG9yZGVyLiBDb250ZW50LCB2aWV3LCBhbmQgZGVzdHJveVxuICAgIC8vIGhvb2tzIGZvciBwcm9qZWN0ZWQgY29tcG9uZW50cyBhbmQgZGlyZWN0aXZlcyBtdXN0IGJlIGNhbGxlZCAqYmVmb3JlKiB0aGVpciBob3N0cy5cbiAgICBmb3IgKGxldCBpID0gdE5vZGUuZGlyZWN0aXZlU3RhcnQsIGVuZCA9IHROb2RlLmRpcmVjdGl2ZUVuZDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgICBjb25zdCBkZWYgPSB0Vmlldy5kYXRhW2ldIGFzIERpcmVjdGl2ZURlZjxhbnk+O1xuICAgICAgcXVldWVDb250ZW50SG9va3MoZGVmLCB0VmlldywgaSk7XG4gICAgICBxdWV1ZVZpZXdIb29rcyhkZWYsIHRWaWV3LCBpKTtcbiAgICAgIHF1ZXVlRGVzdHJveUhvb2tzKGRlZiwgdFZpZXcsIGkpO1xuICAgIH1cbiAgfVxufVxuXG4vKiogUXVldWVzIGFmdGVyQ29udGVudEluaXQgYW5kIGFmdGVyQ29udGVudENoZWNrZWQgaG9va3Mgb24gVFZpZXcgKi9cbmZ1bmN0aW9uIHF1ZXVlQ29udGVudEhvb2tzKGRlZjogRGlyZWN0aXZlRGVmPGFueT4sIHRWaWV3OiBUVmlldywgaTogbnVtYmVyKTogdm9pZCB7XG4gIGlmIChkZWYuYWZ0ZXJDb250ZW50SW5pdCkge1xuICAgICh0Vmlldy5jb250ZW50SG9va3MgfHwgKHRWaWV3LmNvbnRlbnRIb29rcyA9IFtdKSkucHVzaChpLCBkZWYuYWZ0ZXJDb250ZW50SW5pdCk7XG4gIH1cblxuICBpZiAoZGVmLmFmdGVyQ29udGVudENoZWNrZWQpIHtcbiAgICAodFZpZXcuY29udGVudEhvb2tzIHx8ICh0Vmlldy5jb250ZW50SG9va3MgPSBbXSkpLnB1c2goaSwgZGVmLmFmdGVyQ29udGVudENoZWNrZWQpO1xuICAgICh0Vmlldy5jb250ZW50Q2hlY2tIb29rcyB8fCAodFZpZXcuY29udGVudENoZWNrSG9va3MgPSBbXSkpLnB1c2goaSwgZGVmLmFmdGVyQ29udGVudENoZWNrZWQpO1xuICB9XG59XG5cbi8qKiBRdWV1ZXMgYWZ0ZXJWaWV3SW5pdCBhbmQgYWZ0ZXJWaWV3Q2hlY2tlZCBob29rcyBvbiBUVmlldyAqL1xuZnVuY3Rpb24gcXVldWVWaWV3SG9va3MoZGVmOiBEaXJlY3RpdmVEZWY8YW55PiwgdFZpZXc6IFRWaWV3LCBpOiBudW1iZXIpOiB2b2lkIHtcbiAgaWYgKGRlZi5hZnRlclZpZXdJbml0KSB7XG4gICAgKHRWaWV3LnZpZXdIb29rcyB8fCAodFZpZXcudmlld0hvb2tzID0gW10pKS5wdXNoKGksIGRlZi5hZnRlclZpZXdJbml0KTtcbiAgfVxuXG4gIGlmIChkZWYuYWZ0ZXJWaWV3Q2hlY2tlZCkge1xuICAgICh0Vmlldy52aWV3SG9va3MgfHwgKHRWaWV3LnZpZXdIb29rcyA9IFtdKSkucHVzaChpLCBkZWYuYWZ0ZXJWaWV3Q2hlY2tlZCk7XG4gICAgKHRWaWV3LnZpZXdDaGVja0hvb2tzIHx8ICh0Vmlldy52aWV3Q2hlY2tIb29rcyA9IFtdKSkucHVzaChpLCBkZWYuYWZ0ZXJWaWV3Q2hlY2tlZCk7XG4gIH1cbn1cblxuLyoqIFF1ZXVlcyBvbkRlc3Ryb3kgaG9va3Mgb24gVFZpZXcgKi9cbmZ1bmN0aW9uIHF1ZXVlRGVzdHJveUhvb2tzKGRlZjogRGlyZWN0aXZlRGVmPGFueT4sIHRWaWV3OiBUVmlldywgaTogbnVtYmVyKTogdm9pZCB7XG4gIGlmIChkZWYub25EZXN0cm95ICE9IG51bGwpIHtcbiAgICAodFZpZXcuZGVzdHJveUhvb2tzIHx8ICh0Vmlldy5kZXN0cm95SG9va3MgPSBbXSkpLnB1c2goaSwgZGVmLm9uRGVzdHJveSk7XG4gIH1cbn1cblxuLyoqXG4gKiBDYWxscyBvbkluaXQgYW5kIGRvQ2hlY2sgY2FsbHMgaWYgdGhleSBoYXZlbid0IGFscmVhZHkgYmVlbiBjYWxsZWQuXG4gKlxuICogQHBhcmFtIGN1cnJlbnRWaWV3IFRoZSBjdXJyZW50IHZpZXdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4ZWN1dGVJbml0SG9va3MoXG4gICAgY3VycmVudFZpZXc6IExWaWV3LCB0VmlldzogVFZpZXcsIGNoZWNrTm9DaGFuZ2VzTW9kZTogYm9vbGVhbik6IHZvaWQge1xuICBpZiAoIWNoZWNrTm9DaGFuZ2VzTW9kZSAmJiBjdXJyZW50Vmlld1tGTEFHU10gJiBMVmlld0ZsYWdzLlJ1bkluaXQpIHtcbiAgICBleGVjdXRlSG9va3MoY3VycmVudFZpZXcsIHRWaWV3LmluaXRIb29rcywgdFZpZXcuY2hlY2tIb29rcywgY2hlY2tOb0NoYW5nZXNNb2RlKTtcbiAgICBjdXJyZW50Vmlld1tGTEFHU10gJj0gfkxWaWV3RmxhZ3MuUnVuSW5pdDtcbiAgfVxufVxuXG4vKipcbiAqIEl0ZXJhdGVzIG92ZXIgYWZ0ZXJWaWV3SW5pdCBhbmQgYWZ0ZXJWaWV3Q2hlY2tlZCBmdW5jdGlvbnMgYW5kIGNhbGxzIHRoZW0uXG4gKlxuICogQHBhcmFtIGN1cnJlbnRWaWV3IFRoZSBjdXJyZW50IHZpZXdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4ZWN1dGVIb29rcyhcbiAgICBjdXJyZW50VmlldzogTFZpZXcsIGFsbEhvb2tzOiBIb29rRGF0YSB8IG51bGwsIGNoZWNrSG9va3M6IEhvb2tEYXRhIHwgbnVsbCxcbiAgICBjaGVja05vQ2hhbmdlc01vZGU6IGJvb2xlYW4pOiB2b2lkIHtcbiAgaWYgKGNoZWNrTm9DaGFuZ2VzTW9kZSkgcmV0dXJuO1xuXG4gIGNvbnN0IGhvb2tzVG9DYWxsID0gY3VycmVudFZpZXdbRkxBR1NdICYgTFZpZXdGbGFncy5GaXJzdExWaWV3UGFzcyA/IGFsbEhvb2tzIDogY2hlY2tIb29rcztcbiAgaWYgKGhvb2tzVG9DYWxsKSB7XG4gICAgY2FsbEhvb2tzKGN1cnJlbnRWaWV3LCBob29rc1RvQ2FsbCk7XG4gIH1cbn1cblxuLyoqXG4gKiBDYWxscyBsaWZlY3ljbGUgaG9va3Mgd2l0aCB0aGVpciBjb250ZXh0cywgc2tpcHBpbmcgaW5pdCBob29rcyBpZiBpdCdzIG5vdFxuICogdGhlIGZpcnN0IExWaWV3IHBhc3MuXG4gKlxuICogQHBhcmFtIGN1cnJlbnRWaWV3IFRoZSBjdXJyZW50IHZpZXdcbiAqIEBwYXJhbSBhcnIgVGhlIGFycmF5IGluIHdoaWNoIHRoZSBob29rcyBhcmUgZm91bmRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNhbGxIb29rcyhjdXJyZW50VmlldzogYW55W10sIGFycjogSG9va0RhdGEpOiB2b2lkIHtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpICs9IDIpIHtcbiAgICAoYXJyW2kgKyAxXSBhcygpID0+IHZvaWQpLmNhbGwoY3VycmVudFZpZXdbYXJyW2ldIGFzIG51bWJlcl0pO1xuICB9XG59XG4iXX0=