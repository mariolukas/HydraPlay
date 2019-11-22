/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/// <reference types="rxjs" />
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <reference types="rxjs" />
import { Subject, Subscription } from 'rxjs';
/**
 * Use in directives and components to emit custom events synchronously
 * or asynchronously, and register handlers for those events by subscribing
 * to an instance.
 *
 * \@usageNotes
 *
 * In the following example, a component defines two output properties
 * that create event emitters. When the title is clicked, the emitter
 * emits an open or close event to toggle the current visibility state.
 *
 * ```
 * \@Component({
 *   selector: 'zippy',
 *   template: `
 *   <div class="zippy">
 *     <div (click)="toggle()">Toggle</div>
 *     <div [hidden]="!visible">
 *       <ng-content></ng-content>
 *     </div>
 *  </div>`})
 * export class Zippy {
 *   visible: boolean = true;
 * \@Output() open: EventEmitter<any> = new EventEmitter();
 * \@Output() close: EventEmitter<any> = new EventEmitter();
 *
 *   toggle() {
 *     this.visible = !this.visible;
 *     if (this.visible) {
 *       this.open.emit(null);
 *     } else {
 *       this.close.emit(null);
 *     }
 *   }
 * }
 * ```
 *
 * Access the event object with the `$event` argument passed to the output event
 * handler:
 *
 * ```
 * <zippy (open)="onOpen($event)" (close)="onClose($event)"></zippy>
 * ```
 *
 * ### Notes
 *
 * Uses Rx.Observable but provides an adapter to make it work as specified here:
 * https://github.com/jhusain/observable-spec
 *
 * Once a reference implementation of the spec is available, switch to it.
 *
 * \@publicApi
 * @template T
 */
export class EventEmitter extends Subject {
    // tslint:disable-line
    /**
     * Creates an instance of this class that can
     * deliver events synchronously or asynchronously.
     *
     * @param {?=} isAsync When true, deliver events asynchronously.
     *
     */
    constructor(isAsync = false) {
        super();
        this.__isAsync = isAsync;
    }
    /**
     * Emits an event containing a given value.
     * @param {?=} value The value to emit.
     * @return {?}
     */
    emit(value) { super.next(value); }
    /**
     * Registers handlers for events emitted by this instance.
     * @param {?=} generatorOrNext When supplied, a custom handler for emitted events.
     * @param {?=} error When supplied, a custom handler for an error notification
     * from this emitter.
     * @param {?=} complete When supplied, a custom handler for a completion
     * notification from this emitter.
     * @return {?}
     */
    subscribe(generatorOrNext, error, complete) {
        /** @type {?} */
        let schedulerFn;
        /** @type {?} */
        let errorFn = (err) => null;
        /** @type {?} */
        let completeFn = () => null;
        if (generatorOrNext && typeof generatorOrNext === 'object') {
            schedulerFn = this.__isAsync ? (value) => {
                setTimeout(() => generatorOrNext.next(value));
            } : (value) => { generatorOrNext.next(value); };
            if (generatorOrNext.error) {
                errorFn = this.__isAsync ? (err) => { setTimeout(() => generatorOrNext.error(err)); } :
                    (err) => { generatorOrNext.error(err); };
            }
            if (generatorOrNext.complete) {
                completeFn = this.__isAsync ? () => { setTimeout(() => generatorOrNext.complete()); } :
                    () => { generatorOrNext.complete(); };
            }
        }
        else {
            schedulerFn = this.__isAsync ? (value) => { setTimeout(() => generatorOrNext(value)); } :
                (value) => { generatorOrNext(value); };
            if (error) {
                errorFn =
                    this.__isAsync ? (err) => { setTimeout(() => error(err)); } : (err) => { error(err); };
            }
            if (complete) {
                completeFn =
                    this.__isAsync ? () => { setTimeout(() => complete()); } : () => { complete(); };
            }
        }
        /** @type {?} */
        const sink = super.subscribe(schedulerFn, errorFn, completeFn);
        if (generatorOrNext instanceof Subscription) {
            generatorOrNext.add(sink);
        }
        return sink;
    }
}
if (false) {
    /**
     * Internal
     * @type {?}
     */
    EventEmitter.prototype.__isAsync;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnRfZW1pdHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL2V2ZW50X2VtaXR0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQVFBLDhCQUE4Qjs7Ozs7Ozs7O0FBRTlCLE9BQU8sRUFBQyxPQUFPLEVBQUUsWUFBWSxFQUFDLE1BQU0sTUFBTSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBdUQzQyxNQUFNLE9BQU8sWUFBZ0IsU0FBUSxPQUFVOzs7Ozs7Ozs7SUFpQjdDLFlBQVksVUFBbUIsS0FBSztRQUNsQyxLQUFLLEVBQUUsQ0FBQztRQUNSLElBQUksQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDO0lBQzNCLENBQUM7Ozs7OztJQU1ELElBQUksQ0FBQyxLQUFTLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7Ozs7Ozs7SUFVdEMsU0FBUyxDQUFDLGVBQXFCLEVBQUUsS0FBVyxFQUFFLFFBQWM7O1lBQ3RELFdBQTRCOztZQUM1QixPQUFPLEdBQUcsQ0FBQyxHQUFRLEVBQU8sRUFBRSxDQUFDLElBQUk7O1lBQ2pDLFVBQVUsR0FBRyxHQUFRLEVBQUUsQ0FBQyxJQUFJO1FBRWhDLElBQUksZUFBZSxJQUFJLE9BQU8sZUFBZSxLQUFLLFFBQVEsRUFBRTtZQUMxRCxXQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFVLEVBQUUsRUFBRTtnQkFDNUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUNoRCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBVSxFQUFFLEVBQUUsR0FBRyxlQUFlLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRXJELElBQUksZUFBZSxDQUFDLEtBQUssRUFBRTtnQkFDekIsT0FBTyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzVELENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxlQUFlLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3JFO1lBRUQsSUFBSSxlQUFlLENBQUMsUUFBUSxFQUFFO2dCQUM1QixVQUFVLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLGVBQWUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3pELEdBQUcsRUFBRSxHQUFHLGVBQWUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNyRTtTQUNGO2FBQU07WUFDTCxXQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFVLEVBQUUsRUFBRSxHQUFHLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMvRCxDQUFDLEtBQVUsRUFBRSxFQUFFLEdBQUcsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRTNFLElBQUksS0FBSyxFQUFFO2dCQUNULE9BQU87b0JBQ0gsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUM1RjtZQUVELElBQUksUUFBUSxFQUFFO2dCQUNaLFVBQVU7b0JBQ04sSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3RGO1NBQ0Y7O2NBRUssSUFBSSxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLE9BQU8sRUFBRSxVQUFVLENBQUM7UUFFOUQsSUFBSSxlQUFlLFlBQVksWUFBWSxFQUFFO1lBQzNDLGVBQWUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDM0I7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7Q0FDRjs7Ozs7O0lBdEVDLGlDQUFtQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLy8vIDxyZWZlcmVuY2UgdHlwZXM9XCJyeGpzXCIgLz5cblxuaW1wb3J0IHtTdWJqZWN0LCBTdWJzY3JpcHRpb259IGZyb20gJ3J4anMnO1xuXG4vKipcbiAqIFVzZSBpbiBkaXJlY3RpdmVzIGFuZCBjb21wb25lbnRzIHRvIGVtaXQgY3VzdG9tIGV2ZW50cyBzeW5jaHJvbm91c2x5XG4gKiBvciBhc3luY2hyb25vdXNseSwgYW5kIHJlZ2lzdGVyIGhhbmRsZXJzIGZvciB0aG9zZSBldmVudHMgYnkgc3Vic2NyaWJpbmdcbiAqIHRvIGFuIGluc3RhbmNlLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogSW4gdGhlIGZvbGxvd2luZyBleGFtcGxlLCBhIGNvbXBvbmVudCBkZWZpbmVzIHR3byBvdXRwdXQgcHJvcGVydGllc1xuICogdGhhdCBjcmVhdGUgZXZlbnQgZW1pdHRlcnMuIFdoZW4gdGhlIHRpdGxlIGlzIGNsaWNrZWQsIHRoZSBlbWl0dGVyXG4gKiBlbWl0cyBhbiBvcGVuIG9yIGNsb3NlIGV2ZW50IHRvIHRvZ2dsZSB0aGUgY3VycmVudCB2aXNpYmlsaXR5IHN0YXRlLlxuICpcbiAqIGBgYFxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnemlwcHknLFxuICogICB0ZW1wbGF0ZTogYFxuICogICA8ZGl2IGNsYXNzPVwiemlwcHlcIj5cbiAqICAgICA8ZGl2IChjbGljayk9XCJ0b2dnbGUoKVwiPlRvZ2dsZTwvZGl2PlxuICogICAgIDxkaXYgW2hpZGRlbl09XCIhdmlzaWJsZVwiPlxuICogICAgICAgPG5nLWNvbnRlbnQ+PC9uZy1jb250ZW50PlxuICogICAgIDwvZGl2PlxuICogIDwvZGl2PmB9KVxuICogZXhwb3J0IGNsYXNzIFppcHB5IHtcbiAqICAgdmlzaWJsZTogYm9vbGVhbiA9IHRydWU7XG4gKiAgIEBPdXRwdXQoKSBvcGVuOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAqICAgQE91dHB1dCgpIGNsb3NlOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAqXG4gKiAgIHRvZ2dsZSgpIHtcbiAqICAgICB0aGlzLnZpc2libGUgPSAhdGhpcy52aXNpYmxlO1xuICogICAgIGlmICh0aGlzLnZpc2libGUpIHtcbiAqICAgICAgIHRoaXMub3Blbi5lbWl0KG51bGwpO1xuICogICAgIH0gZWxzZSB7XG4gKiAgICAgICB0aGlzLmNsb3NlLmVtaXQobnVsbCk7XG4gKiAgICAgfVxuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBBY2Nlc3MgdGhlIGV2ZW50IG9iamVjdCB3aXRoIHRoZSBgJGV2ZW50YCBhcmd1bWVudCBwYXNzZWQgdG8gdGhlIG91dHB1dCBldmVudFxuICogaGFuZGxlcjpcbiAqXG4gKiBgYGBcbiAqIDx6aXBweSAob3Blbik9XCJvbk9wZW4oJGV2ZW50KVwiIChjbG9zZSk9XCJvbkNsb3NlKCRldmVudClcIj48L3ppcHB5PlxuICogYGBgXG4gKlxuICogIyMjIE5vdGVzXG4gKlxuICogVXNlcyBSeC5PYnNlcnZhYmxlIGJ1dCBwcm92aWRlcyBhbiBhZGFwdGVyIHRvIG1ha2UgaXQgd29yayBhcyBzcGVjaWZpZWQgaGVyZTpcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9qaHVzYWluL29ic2VydmFibGUtc3BlY1xuICpcbiAqIE9uY2UgYSByZWZlcmVuY2UgaW1wbGVtZW50YXRpb24gb2YgdGhlIHNwZWMgaXMgYXZhaWxhYmxlLCBzd2l0Y2ggdG8gaXQuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgRXZlbnRFbWl0dGVyPFQ+IGV4dGVuZHMgU3ViamVjdDxUPiB7XG4gIC8vIFRPRE86IG1hcmsgdGhpcyBhcyBpbnRlcm5hbCBvbmNlIGFsbCB0aGUgZmFjYWRlcyBhcmUgZ29uZVxuICAvLyB3ZSBjYW4ndCBtYXJrIGl0IGFzIGludGVybmFsIG5vdyBiZWNhdXNlIEV2ZW50RW1pdHRlciBleHBvcnRlZCB2aWEgQGFuZ3VsYXIvY29yZSB3b3VsZCBub3RcbiAgLy8gY29udGFpbiB0aGlzIHByb3BlcnR5IG1ha2luZyBpdCBpbmNvbXBhdGlibGUgd2l0aCBhbGwgdGhlIGNvZGUgdGhhdCB1c2VzIEV2ZW50RW1pdHRlciB2aWFcbiAgLy8gZmFjYWRlcywgd2hpY2ggYXJlIGxvY2FsIHRvIHRoZSBjb2RlIGFuZCBkbyBub3QgaGF2ZSB0aGlzIHByb3BlcnR5IHN0cmlwcGVkLlxuICAvKipcbiAgICogSW50ZXJuYWxcbiAgICovXG4gIF9faXNBc3luYzogYm9vbGVhbjsgIC8vIHRzbGludDpkaXNhYmxlLWxpbmVcblxuICAvKipcbiAgICogQ3JlYXRlcyBhbiBpbnN0YW5jZSBvZiB0aGlzIGNsYXNzIHRoYXQgY2FuXG4gICAqIGRlbGl2ZXIgZXZlbnRzIHN5bmNocm9ub3VzbHkgb3IgYXN5bmNocm9ub3VzbHkuXG4gICAqXG4gICAqIEBwYXJhbSBpc0FzeW5jIFdoZW4gdHJ1ZSwgZGVsaXZlciBldmVudHMgYXN5bmNocm9ub3VzbHkuXG4gICAqXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihpc0FzeW5jOiBib29sZWFuID0gZmFsc2UpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuX19pc0FzeW5jID0gaXNBc3luYztcbiAgfVxuXG4gIC8qKlxuICAgKiBFbWl0cyBhbiBldmVudCBjb250YWluaW5nIGEgZ2l2ZW4gdmFsdWUuXG4gICAqIEBwYXJhbSB2YWx1ZSBUaGUgdmFsdWUgdG8gZW1pdC5cbiAgICovXG4gIGVtaXQodmFsdWU/OiBUKSB7IHN1cGVyLm5leHQodmFsdWUpOyB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyBoYW5kbGVycyBmb3IgZXZlbnRzIGVtaXR0ZWQgYnkgdGhpcyBpbnN0YW5jZS5cbiAgICogQHBhcmFtIGdlbmVyYXRvck9yTmV4dCBXaGVuIHN1cHBsaWVkLCBhIGN1c3RvbSBoYW5kbGVyIGZvciBlbWl0dGVkIGV2ZW50cy5cbiAgICogQHBhcmFtIGVycm9yIFdoZW4gc3VwcGxpZWQsIGEgY3VzdG9tIGhhbmRsZXIgZm9yIGFuIGVycm9yIG5vdGlmaWNhdGlvblxuICAgKiBmcm9tIHRoaXMgZW1pdHRlci5cbiAgICogQHBhcmFtIGNvbXBsZXRlIFdoZW4gc3VwcGxpZWQsIGEgY3VzdG9tIGhhbmRsZXIgZm9yIGEgY29tcGxldGlvblxuICAgKiBub3RpZmljYXRpb24gZnJvbSB0aGlzIGVtaXR0ZXIuXG4gICAqL1xuICBzdWJzY3JpYmUoZ2VuZXJhdG9yT3JOZXh0PzogYW55LCBlcnJvcj86IGFueSwgY29tcGxldGU/OiBhbnkpOiBTdWJzY3JpcHRpb24ge1xuICAgIGxldCBzY2hlZHVsZXJGbjogKHQ6IGFueSkgPT4gYW55O1xuICAgIGxldCBlcnJvckZuID0gKGVycjogYW55KTogYW55ID0+IG51bGw7XG4gICAgbGV0IGNvbXBsZXRlRm4gPSAoKTogYW55ID0+IG51bGw7XG5cbiAgICBpZiAoZ2VuZXJhdG9yT3JOZXh0ICYmIHR5cGVvZiBnZW5lcmF0b3JPck5leHQgPT09ICdvYmplY3QnKSB7XG4gICAgICBzY2hlZHVsZXJGbiA9IHRoaXMuX19pc0FzeW5jID8gKHZhbHVlOiBhbnkpID0+IHtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiBnZW5lcmF0b3JPck5leHQubmV4dCh2YWx1ZSkpO1xuICAgICAgfSA6ICh2YWx1ZTogYW55KSA9PiB7IGdlbmVyYXRvck9yTmV4dC5uZXh0KHZhbHVlKTsgfTtcblxuICAgICAgaWYgKGdlbmVyYXRvck9yTmV4dC5lcnJvcikge1xuICAgICAgICBlcnJvckZuID0gdGhpcy5fX2lzQXN5bmMgPyAoZXJyKSA9PiB7IHNldFRpbWVvdXQoKCkgPT4gZ2VuZXJhdG9yT3JOZXh0LmVycm9yKGVycikpOyB9IDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKGVycikgPT4geyBnZW5lcmF0b3JPck5leHQuZXJyb3IoZXJyKTsgfTtcbiAgICAgIH1cblxuICAgICAgaWYgKGdlbmVyYXRvck9yTmV4dC5jb21wbGV0ZSkge1xuICAgICAgICBjb21wbGV0ZUZuID0gdGhpcy5fX2lzQXN5bmMgPyAoKSA9PiB7IHNldFRpbWVvdXQoKCkgPT4gZ2VuZXJhdG9yT3JOZXh0LmNvbXBsZXRlKCkpOyB9IDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCkgPT4geyBnZW5lcmF0b3JPck5leHQuY29tcGxldGUoKTsgfTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgc2NoZWR1bGVyRm4gPSB0aGlzLl9faXNBc3luYyA/ICh2YWx1ZTogYW55KSA9PiB7IHNldFRpbWVvdXQoKCkgPT4gZ2VuZXJhdG9yT3JOZXh0KHZhbHVlKSk7IH0gOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICh2YWx1ZTogYW55KSA9PiB7IGdlbmVyYXRvck9yTmV4dCh2YWx1ZSk7IH07XG5cbiAgICAgIGlmIChlcnJvcikge1xuICAgICAgICBlcnJvckZuID1cbiAgICAgICAgICAgIHRoaXMuX19pc0FzeW5jID8gKGVycikgPT4geyBzZXRUaW1lb3V0KCgpID0+IGVycm9yKGVycikpOyB9IDogKGVycikgPT4geyBlcnJvcihlcnIpOyB9O1xuICAgICAgfVxuXG4gICAgICBpZiAoY29tcGxldGUpIHtcbiAgICAgICAgY29tcGxldGVGbiA9XG4gICAgICAgICAgICB0aGlzLl9faXNBc3luYyA/ICgpID0+IHsgc2V0VGltZW91dCgoKSA9PiBjb21wbGV0ZSgpKTsgfSA6ICgpID0+IHsgY29tcGxldGUoKTsgfTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBzaW5rID0gc3VwZXIuc3Vic2NyaWJlKHNjaGVkdWxlckZuLCBlcnJvckZuLCBjb21wbGV0ZUZuKTtcblxuICAgIGlmIChnZW5lcmF0b3JPck5leHQgaW5zdGFuY2VvZiBTdWJzY3JpcHRpb24pIHtcbiAgICAgIGdlbmVyYXRvck9yTmV4dC5hZGQoc2luayk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHNpbms7XG4gIH1cbn1cbiJdfQ==