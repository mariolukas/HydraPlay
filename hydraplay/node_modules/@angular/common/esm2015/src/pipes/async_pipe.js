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
import { ChangeDetectorRef, Pipe, WrappedValue, ɵisObservable, ɵisPromise } from '@angular/core';
import { invalidPipeArgumentError } from './invalid_pipe_argument_error';
/**
 * @record
 */
function SubscriptionStrategy() { }
if (false) {
    /**
     * @param {?} async
     * @param {?} updateLatestValue
     * @return {?}
     */
    SubscriptionStrategy.prototype.createSubscription = function (async, updateLatestValue) { };
    /**
     * @param {?} subscription
     * @return {?}
     */
    SubscriptionStrategy.prototype.dispose = function (subscription) { };
    /**
     * @param {?} subscription
     * @return {?}
     */
    SubscriptionStrategy.prototype.onDestroy = function (subscription) { };
}
class ObservableStrategy {
    /**
     * @param {?} async
     * @param {?} updateLatestValue
     * @return {?}
     */
    createSubscription(async, updateLatestValue) {
        return async.subscribe({ next: updateLatestValue, error: (e) => { throw e; } });
    }
    /**
     * @param {?} subscription
     * @return {?}
     */
    dispose(subscription) { subscription.unsubscribe(); }
    /**
     * @param {?} subscription
     * @return {?}
     */
    onDestroy(subscription) { subscription.unsubscribe(); }
}
class PromiseStrategy {
    /**
     * @param {?} async
     * @param {?} updateLatestValue
     * @return {?}
     */
    createSubscription(async, updateLatestValue) {
        return async.then(updateLatestValue, e => { throw e; });
    }
    /**
     * @param {?} subscription
     * @return {?}
     */
    dispose(subscription) { }
    /**
     * @param {?} subscription
     * @return {?}
     */
    onDestroy(subscription) { }
}
/** @type {?} */
const _promiseStrategy = new PromiseStrategy();
/** @type {?} */
const _observableStrategy = new ObservableStrategy();
/**
 * \@ngModule CommonModule
 * \@description
 *
 * Unwraps a value from an asynchronous primitive.
 *
 * The `async` pipe subscribes to an `Observable` or `Promise` and returns the latest value it has
 * emitted. When a new value is emitted, the `async` pipe marks the component to be checked for
 * changes. When the component gets destroyed, the `async` pipe unsubscribes automatically to avoid
 * potential memory leaks.
 *
 * \@usageNotes
 *
 * ### Examples
 *
 * This example binds a `Promise` to the view. Clicking the `Resolve` button resolves the
 * promise.
 *
 * {\@example common/pipes/ts/async_pipe.ts region='AsyncPipePromise'}
 *
 * It's also possible to use `async` with Observables. The example below binds the `time` Observable
 * to the view. The Observable continuously updates the view with the current time.
 *
 * {\@example common/pipes/ts/async_pipe.ts region='AsyncPipeObservable'}
 *
 * \@publicApi
 */
export class AsyncPipe {
    /**
     * @param {?} _ref
     */
    constructor(_ref) {
        this._ref = _ref;
        this._latestValue = null;
        this._latestReturnedValue = null;
        this._subscription = null;
        this._obj = null;
        this._strategy = (/** @type {?} */ (null));
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        if (this._subscription) {
            this._dispose();
        }
    }
    /**
     * @param {?} obj
     * @return {?}
     */
    transform(obj) {
        if (!this._obj) {
            if (obj) {
                this._subscribe(obj);
            }
            this._latestReturnedValue = this._latestValue;
            return this._latestValue;
        }
        if (obj !== this._obj) {
            this._dispose();
            return this.transform((/** @type {?} */ (obj)));
        }
        if (this._latestValue === this._latestReturnedValue) {
            return this._latestReturnedValue;
        }
        this._latestReturnedValue = this._latestValue;
        return WrappedValue.wrap(this._latestValue);
    }
    /**
     * @private
     * @param {?} obj
     * @return {?}
     */
    _subscribe(obj) {
        this._obj = obj;
        this._strategy = this._selectStrategy(obj);
        this._subscription = this._strategy.createSubscription(obj, (value) => this._updateLatestValue(obj, value));
    }
    /**
     * @private
     * @param {?} obj
     * @return {?}
     */
    _selectStrategy(obj) {
        if (ɵisPromise(obj)) {
            return _promiseStrategy;
        }
        if (ɵisObservable(obj)) {
            return _observableStrategy;
        }
        throw invalidPipeArgumentError(AsyncPipe, obj);
    }
    /**
     * @private
     * @return {?}
     */
    _dispose() {
        this._strategy.dispose((/** @type {?} */ (this._subscription)));
        this._latestValue = null;
        this._latestReturnedValue = null;
        this._subscription = null;
        this._obj = null;
    }
    /**
     * @private
     * @param {?} async
     * @param {?} value
     * @return {?}
     */
    _updateLatestValue(async, value) {
        if (async === this._obj) {
            this._latestValue = value;
            this._ref.markForCheck();
        }
    }
}
AsyncPipe.decorators = [
    { type: Pipe, args: [{ name: 'async', pure: false },] }
];
/** @nocollapse */
AsyncPipe.ctorParameters = () => [
    { type: ChangeDetectorRef }
];
if (false) {
    /**
     * @type {?}
     * @private
     */
    AsyncPipe.prototype._latestValue;
    /**
     * @type {?}
     * @private
     */
    AsyncPipe.prototype._latestReturnedValue;
    /**
     * @type {?}
     * @private
     */
    AsyncPipe.prototype._subscription;
    /**
     * @type {?}
     * @private
     */
    AsyncPipe.prototype._obj;
    /**
     * @type {?}
     * @private
     */
    AsyncPipe.prototype._strategy;
    /**
     * @type {?}
     * @private
     */
    AsyncPipe.prototype._ref;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXN5bmNfcGlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9zcmMvcGlwZXMvYXN5bmNfcGlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBQyxpQkFBaUIsRUFBMkIsSUFBSSxFQUFpQixZQUFZLEVBQUUsYUFBYSxFQUFFLFVBQVUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUV2SSxPQUFPLEVBQUMsd0JBQXdCLEVBQUMsTUFBTSwrQkFBK0IsQ0FBQzs7OztBQUV2RSxtQ0FLQzs7Ozs7OztJQUpDLDRGQUNrQjs7Ozs7SUFDbEIscUVBQTJEOzs7OztJQUMzRCx1RUFBNkQ7O0FBRy9ELE1BQU0sa0JBQWtCOzs7Ozs7SUFDdEIsa0JBQWtCLENBQUMsS0FBc0IsRUFBRSxpQkFBc0I7UUFDL0QsT0FBTyxLQUFLLENBQUMsU0FBUyxDQUFDLEVBQUMsSUFBSSxFQUFFLGlCQUFpQixFQUFFLEtBQUssRUFBRSxDQUFDLENBQU0sRUFBRSxFQUFFLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO0lBQ3JGLENBQUM7Ozs7O0lBRUQsT0FBTyxDQUFDLFlBQThCLElBQVUsWUFBWSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQzs7Ozs7SUFFN0UsU0FBUyxDQUFDLFlBQThCLElBQVUsWUFBWSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQztDQUNoRjtBQUVELE1BQU0sZUFBZTs7Ozs7O0lBQ25CLGtCQUFrQixDQUFDLEtBQW1CLEVBQUUsaUJBQWtDO1FBQ3hFLE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDMUQsQ0FBQzs7Ozs7SUFFRCxPQUFPLENBQUMsWUFBMEIsSUFBUyxDQUFDOzs7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SUFBSSxDQUFDLElBQUksRUFBRTtZQUN2QixJQUFJLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQztZQUMxQixJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1NBQzFCO0lBQ0gsQ0FBQzs7O1lBM0VGLElBQUksU0FBQyxFQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBQzs7OztZQTdEMUIsaUJBQWlCOzs7Ozs7O0lBK0R2QixpQ0FBaUM7Ozs7O0lBQ2pDLHlDQUF5Qzs7Ozs7SUFFekMsa0NBQWlFOzs7OztJQUNqRSx5QkFBeUU7Ozs7O0lBQ3pFLDhCQUFpRDs7Ozs7SUFFckMseUJBQStCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NoYW5nZURldGVjdG9yUmVmLCBFdmVudEVtaXR0ZXIsIE9uRGVzdHJveSwgUGlwZSwgUGlwZVRyYW5zZm9ybSwgV3JhcHBlZFZhbHVlLCDJtWlzT2JzZXJ2YWJsZSwgybVpc1Byb21pc2V9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtPYnNlcnZhYmxlLCBTdWJzY3JpcHRpb25MaWtlfSBmcm9tICdyeGpzJztcbmltcG9ydCB7aW52YWxpZFBpcGVBcmd1bWVudEVycm9yfSBmcm9tICcuL2ludmFsaWRfcGlwZV9hcmd1bWVudF9lcnJvcic7XG5cbmludGVyZmFjZSBTdWJzY3JpcHRpb25TdHJhdGVneSB7XG4gIGNyZWF0ZVN1YnNjcmlwdGlvbihhc3luYzogT2JzZXJ2YWJsZTxhbnk+fFByb21pc2U8YW55PiwgdXBkYXRlTGF0ZXN0VmFsdWU6IGFueSk6IFN1YnNjcmlwdGlvbkxpa2VcbiAgICAgIHxQcm9taXNlPGFueT47XG4gIGRpc3Bvc2Uoc3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb25MaWtlfFByb21pc2U8YW55Pik6IHZvaWQ7XG4gIG9uRGVzdHJveShzdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbkxpa2V8UHJvbWlzZTxhbnk+KTogdm9pZDtcbn1cblxuY2xhc3MgT2JzZXJ2YWJsZVN0cmF0ZWd5IGltcGxlbWVudHMgU3Vic2NyaXB0aW9uU3RyYXRlZ3kge1xuICBjcmVhdGVTdWJzY3JpcHRpb24oYXN5bmM6IE9ic2VydmFibGU8YW55PiwgdXBkYXRlTGF0ZXN0VmFsdWU6IGFueSk6IFN1YnNjcmlwdGlvbkxpa2Uge1xuICAgIHJldHVybiBhc3luYy5zdWJzY3JpYmUoe25leHQ6IHVwZGF0ZUxhdGVzdFZhbHVlLCBlcnJvcjogKGU6IGFueSkgPT4geyB0aHJvdyBlOyB9fSk7XG4gIH1cblxuICBkaXNwb3NlKHN1YnNjcmlwdGlvbjogU3Vic2NyaXB0aW9uTGlrZSk6IHZvaWQgeyBzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTsgfVxuXG4gIG9uRGVzdHJveShzdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbkxpa2UpOiB2b2lkIHsgc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7IH1cbn1cblxuY2xhc3MgUHJvbWlzZVN0cmF0ZWd5IGltcGxlbWVudHMgU3Vic2NyaXB0aW9uU3RyYXRlZ3kge1xuICBjcmVhdGVTdWJzY3JpcHRpb24oYXN5bmM6IFByb21pc2U8YW55PiwgdXBkYXRlTGF0ZXN0VmFsdWU6ICh2OiBhbnkpID0+IGFueSk6IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuIGFzeW5jLnRoZW4odXBkYXRlTGF0ZXN0VmFsdWUsIGUgPT4geyB0aHJvdyBlOyB9KTtcbiAgfVxuXG4gIGRpc3Bvc2Uoc3Vic2NyaXB0aW9uOiBQcm9taXNlPGFueT4pOiB2b2lkIHt9XG5cbiAgb25EZXN0cm95KHN1YnNjcmlwdGlvbjogUHJvbWlzZTxhbnk+KTogdm9pZCB7fVxufVxuXG5jb25zdCBfcHJvbWlzZVN0cmF0ZWd5ID0gbmV3IFByb21pc2VTdHJhdGVneSgpO1xuY29uc3QgX29ic2VydmFibGVTdHJhdGVneSA9IG5ldyBPYnNlcnZhYmxlU3RyYXRlZ3koKTtcblxuLyoqXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBVbndyYXBzIGEgdmFsdWUgZnJvbSBhbiBhc3luY2hyb25vdXMgcHJpbWl0aXZlLlxuICpcbiAqIFRoZSBgYXN5bmNgIHBpcGUgc3Vic2NyaWJlcyB0byBhbiBgT2JzZXJ2YWJsZWAgb3IgYFByb21pc2VgIGFuZCByZXR1cm5zIHRoZSBsYXRlc3QgdmFsdWUgaXQgaGFzXG4gKiBlbWl0dGVkLiBXaGVuIGEgbmV3IHZhbHVlIGlzIGVtaXR0ZWQsIHRoZSBgYXN5bmNgIHBpcGUgbWFya3MgdGhlIGNvbXBvbmVudCB0byBiZSBjaGVja2VkIGZvclxuICogY2hhbmdlcy4gV2hlbiB0aGUgY29tcG9uZW50IGdldHMgZGVzdHJveWVkLCB0aGUgYGFzeW5jYCBwaXBlIHVuc3Vic2NyaWJlcyBhdXRvbWF0aWNhbGx5IHRvIGF2b2lkXG4gKiBwb3RlbnRpYWwgbWVtb3J5IGxlYWtzLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogIyMjIEV4YW1wbGVzXG4gKlxuICogVGhpcyBleGFtcGxlIGJpbmRzIGEgYFByb21pc2VgIHRvIHRoZSB2aWV3LiBDbGlja2luZyB0aGUgYFJlc29sdmVgIGJ1dHRvbiByZXNvbHZlcyB0aGVcbiAqIHByb21pc2UuXG4gKlxuICoge0BleGFtcGxlIGNvbW1vbi9waXBlcy90cy9hc3luY19waXBlLnRzIHJlZ2lvbj0nQXN5bmNQaXBlUHJvbWlzZSd9XG4gKlxuICogSXQncyBhbHNvIHBvc3NpYmxlIHRvIHVzZSBgYXN5bmNgIHdpdGggT2JzZXJ2YWJsZXMuIFRoZSBleGFtcGxlIGJlbG93IGJpbmRzIHRoZSBgdGltZWAgT2JzZXJ2YWJsZVxuICogdG8gdGhlIHZpZXcuIFRoZSBPYnNlcnZhYmxlIGNvbnRpbnVvdXNseSB1cGRhdGVzIHRoZSB2aWV3IHdpdGggdGhlIGN1cnJlbnQgdGltZS5cbiAqXG4gKiB7QGV4YW1wbGUgY29tbW9uL3BpcGVzL3RzL2FzeW5jX3BpcGUudHMgcmVnaW9uPSdBc3luY1BpcGVPYnNlcnZhYmxlJ31cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBQaXBlKHtuYW1lOiAnYXN5bmMnLCBwdXJlOiBmYWxzZX0pXG5leHBvcnQgY2xhc3MgQXN5bmNQaXBlIGltcGxlbWVudHMgT25EZXN0cm95LCBQaXBlVHJhbnNmb3JtIHtcbiAgcHJpdmF0ZSBfbGF0ZXN0VmFsdWU6IGFueSA9IG51bGw7XG4gIHByaXZhdGUgX2xhdGVzdFJldHVybmVkVmFsdWU6IGFueSA9IG51bGw7XG5cbiAgcHJpdmF0ZSBfc3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb25MaWtlfFByb21pc2U8YW55PnxudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBfb2JqOiBPYnNlcnZhYmxlPGFueT58UHJvbWlzZTxhbnk+fEV2ZW50RW1pdHRlcjxhbnk+fG51bGwgPSBudWxsO1xuICBwcml2YXRlIF9zdHJhdGVneTogU3Vic2NyaXB0aW9uU3RyYXRlZ3kgPSBudWxsICE7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfcmVmOiBDaGFuZ2VEZXRlY3RvclJlZikge31cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fc3Vic2NyaXB0aW9uKSB7XG4gICAgICB0aGlzLl9kaXNwb3NlKCk7XG4gICAgfVxuICB9XG5cbiAgdHJhbnNmb3JtPFQ+KG9iajogbnVsbCk6IG51bGw7XG4gIHRyYW5zZm9ybTxUPihvYmo6IHVuZGVmaW5lZCk6IHVuZGVmaW5lZDtcbiAgdHJhbnNmb3JtPFQ+KG9iajogT2JzZXJ2YWJsZTxUPnxudWxsfHVuZGVmaW5lZCk6IFR8bnVsbDtcbiAgdHJhbnNmb3JtPFQ+KG9iajogUHJvbWlzZTxUPnxudWxsfHVuZGVmaW5lZCk6IFR8bnVsbDtcbiAgdHJhbnNmb3JtKG9iajogT2JzZXJ2YWJsZTxhbnk+fFByb21pc2U8YW55PnxudWxsfHVuZGVmaW5lZCk6IGFueSB7XG4gICAgaWYgKCF0aGlzLl9vYmopIHtcbiAgICAgIGlmIChvYmopIHtcbiAgICAgICAgdGhpcy5fc3Vic2NyaWJlKG9iaik7XG4gICAgICB9XG4gICAgICB0aGlzLl9sYXRlc3RSZXR1cm5lZFZhbHVlID0gdGhpcy5fbGF0ZXN0VmFsdWU7XG4gICAgICByZXR1cm4gdGhpcy5fbGF0ZXN0VmFsdWU7XG4gICAgfVxuXG4gICAgaWYgKG9iaiAhPT0gdGhpcy5fb2JqKSB7XG4gICAgICB0aGlzLl9kaXNwb3NlKCk7XG4gICAgICByZXR1cm4gdGhpcy50cmFuc2Zvcm0ob2JqIGFzIGFueSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2xhdGVzdFZhbHVlID09PSB0aGlzLl9sYXRlc3RSZXR1cm5lZFZhbHVlKSB7XG4gICAgICByZXR1cm4gdGhpcy5fbGF0ZXN0UmV0dXJuZWRWYWx1ZTtcbiAgICB9XG5cbiAgICB0aGlzLl9sYXRlc3RSZXR1cm5lZFZhbHVlID0gdGhpcy5fbGF0ZXN0VmFsdWU7XG4gICAgcmV0dXJuIFdyYXBwZWRWYWx1ZS53cmFwKHRoaXMuX2xhdGVzdFZhbHVlKTtcbiAgfVxuXG4gIHByaXZhdGUgX3N1YnNjcmliZShvYmo6IE9ic2VydmFibGU8YW55PnxQcm9taXNlPGFueT58RXZlbnRFbWl0dGVyPGFueT4pOiB2b2lkIHtcbiAgICB0aGlzLl9vYmogPSBvYmo7XG4gICAgdGhpcy5fc3RyYXRlZ3kgPSB0aGlzLl9zZWxlY3RTdHJhdGVneShvYmopO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbiA9IHRoaXMuX3N0cmF0ZWd5LmNyZWF0ZVN1YnNjcmlwdGlvbihcbiAgICAgICAgb2JqLCAodmFsdWU6IE9iamVjdCkgPT4gdGhpcy5fdXBkYXRlTGF0ZXN0VmFsdWUob2JqLCB2YWx1ZSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBfc2VsZWN0U3RyYXRlZ3kob2JqOiBPYnNlcnZhYmxlPGFueT58UHJvbWlzZTxhbnk+fEV2ZW50RW1pdHRlcjxhbnk+KTogYW55IHtcbiAgICBpZiAoybVpc1Byb21pc2Uob2JqKSkge1xuICAgICAgcmV0dXJuIF9wcm9taXNlU3RyYXRlZ3k7XG4gICAgfVxuXG4gICAgaWYgKMm1aXNPYnNlcnZhYmxlKG9iaikpIHtcbiAgICAgIHJldHVybiBfb2JzZXJ2YWJsZVN0cmF0ZWd5O1xuICAgIH1cblxuICAgIHRocm93IGludmFsaWRQaXBlQXJndW1lbnRFcnJvcihBc3luY1BpcGUsIG9iaik7XG4gIH1cblxuICBwcml2YXRlIF9kaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuX3N0cmF0ZWd5LmRpc3Bvc2UodGhpcy5fc3Vic2NyaXB0aW9uICEpO1xuICAgIHRoaXMuX2xhdGVzdFZhbHVlID0gbnVsbDtcbiAgICB0aGlzLl9sYXRlc3RSZXR1cm5lZFZhbHVlID0gbnVsbDtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb24gPSBudWxsO1xuICAgIHRoaXMuX29iaiA9IG51bGw7XG4gIH1cblxuICBwcml2YXRlIF91cGRhdGVMYXRlc3RWYWx1ZShhc3luYzogYW55LCB2YWx1ZTogT2JqZWN0KTogdm9pZCB7XG4gICAgaWYgKGFzeW5jID09PSB0aGlzLl9vYmopIHtcbiAgICAgIHRoaXMuX2xhdGVzdFZhbHVlID0gdmFsdWU7XG4gICAgICB0aGlzLl9yZWYubWFya0ZvckNoZWNrKCk7XG4gICAgfVxuICB9XG59XG4iXX0=