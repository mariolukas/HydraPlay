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
import { SimpleChange } from '../../change_detection/change_detection_util';
/** @type {?} */
const PRIVATE_PREFIX = '__ngOnChanges_';
/**
 * The NgOnChangesFeature decorates a component with support for the ngOnChanges
 * lifecycle hook, so it should be included in any component that implements
 * that hook.
 *
 * If the component or directive uses inheritance, the NgOnChangesFeature MUST
 * be included as a feature AFTER {\@link InheritDefinitionFeature}, otherwise
 * inherited properties will not be propagated to the ngOnChanges lifecycle
 * hook.
 *
 * Example usage:
 *
 * ```
 * static ngComponentDef = defineComponent({
 *   ...
 *   inputs: {name: 'publicName'},
 *   features: [NgOnChangesFeature]
 * });
 * ```
 * @template T
 * @param {?} definition
 * @return {?}
 */
export function NgOnChangesFeature(definition) {
    /** @type {?} */
    const publicToDeclaredInputs = definition.declaredInputs;
    /** @type {?} */
    const publicToMinifiedInputs = definition.inputs;
    /** @type {?} */
    const proto = definition.type.prototype;
    for (const publicName in publicToDeclaredInputs) {
        if (publicToDeclaredInputs.hasOwnProperty(publicName)) {
            /** @type {?} */
            const minifiedKey = publicToMinifiedInputs[publicName];
            /** @type {?} */
            const declaredKey = publicToDeclaredInputs[publicName];
            /** @type {?} */
            const privateMinKey = PRIVATE_PREFIX + minifiedKey;
            // Walk the prototype chain to see if we find a property descriptor
            // That way we can honor setters and getters that were inherited.
            /** @type {?} */
            let originalProperty = undefined;
            /** @type {?} */
            let checkProto = proto;
            while (!originalProperty && checkProto &&
                Object.getPrototypeOf(checkProto) !== Object.getPrototypeOf(Object.prototype)) {
                originalProperty = Object.getOwnPropertyDescriptor(checkProto, minifiedKey);
                checkProto = Object.getPrototypeOf(checkProto);
            }
            /** @type {?} */
            const getter = originalProperty && originalProperty.get;
            /** @type {?} */
            const setter = originalProperty && originalProperty.set;
            // create a getter and setter for property
            Object.defineProperty(proto, minifiedKey, {
                get: getter ||
                    (setter ? undefined : function () { return this[privateMinKey]; }),
                /**
                 * @template T
                 * @this {?}
                 * @param {?} value
                 * @return {?}
                 */
                set(value) {
                    /** @type {?} */
                    let simpleChanges = this[PRIVATE_PREFIX];
                    if (!simpleChanges) {
                        simpleChanges = {};
                        // Place where we will store SimpleChanges if there is a change
                        Object.defineProperty(this, PRIVATE_PREFIX, { value: simpleChanges, writable: true });
                    }
                    /** @type {?} */
                    const isFirstChange = !this.hasOwnProperty(privateMinKey);
                    /** @type {?} */
                    const currentChange = simpleChanges[declaredKey];
                    if (currentChange) {
                        currentChange.currentValue = value;
                    }
                    else {
                        simpleChanges[declaredKey] =
                            new SimpleChange(this[privateMinKey], value, isFirstChange);
                    }
                    if (isFirstChange) {
                        // Create a place where the actual value will be stored and make it non-enumerable
                        Object.defineProperty(this, privateMinKey, { value, writable: true });
                    }
                    else {
                        this[privateMinKey] = value;
                    }
                    if (setter)
                        setter.call(this, value);
                },
                // Make the property configurable in dev mode to allow overriding in tests
                configurable: !!ngDevMode
            });
        }
    }
    // If an onInit hook is defined, it will need to wrap the ngOnChanges call
    // so the call order is changes-init-check in creation mode. In subsequent
    // change detection runs, only the check wrapper will be called.
    if (definition.onInit != null) {
        definition.onInit = onChangesWrapper(definition.onInit);
    }
    definition.doCheck = onChangesWrapper(definition.doCheck);
}
// This option ensures that the ngOnChanges lifecycle hook will be inherited
// from superclasses (in InheritDefinitionFeature).
((/** @type {?} */ (NgOnChangesFeature))).ngInherit = true;
/**
 * @param {?} delegateHook
 * @return {?}
 */
function onChangesWrapper(delegateHook) {
    return function () {
        /** @type {?} */
        const simpleChanges = this[PRIVATE_PREFIX];
        if (simpleChanges != null) {
            this.ngOnChanges(simpleChanges);
            this[PRIVATE_PREFIX] = null;
        }
        if (delegateHook)
            delegateHook.apply(this);
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfb25jaGFuZ2VzX2ZlYXR1cmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9yZW5kZXIzL2ZlYXR1cmVzL25nX29uY2hhbmdlc19mZWF0dXJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBUUEsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLDhDQUE4QyxDQUFDOztNQUlwRSxjQUFjLEdBQUcsZ0JBQWdCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUE0QnZDLE1BQU0sVUFBVSxrQkFBa0IsQ0FBSSxVQUEyQjs7VUFDekQsc0JBQXNCLEdBQUcsVUFBVSxDQUFDLGNBQWM7O1VBQ2xELHNCQUFzQixHQUFHLFVBQVUsQ0FBQyxNQUFNOztVQUMxQyxLQUFLLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTO0lBQ3ZDLEtBQUssTUFBTSxVQUFVLElBQUksc0JBQXNCLEVBQUU7UUFDL0MsSUFBSSxzQkFBc0IsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLEVBQUU7O2tCQUMvQyxXQUFXLEdBQUcsc0JBQXNCLENBQUMsVUFBVSxDQUFDOztrQkFDaEQsV0FBVyxHQUFHLHNCQUFzQixDQUFDLFVBQVUsQ0FBQzs7a0JBQ2hELGFBQWEsR0FBRyxjQUFjLEdBQUcsV0FBVzs7OztnQkFJOUMsZ0JBQWdCLEdBQWlDLFNBQVM7O2dCQUMxRCxVQUFVLEdBQUcsS0FBSztZQUN0QixPQUFPLENBQUMsZ0JBQWdCLElBQUksVUFBVTtnQkFDL0IsTUFBTSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsS0FBSyxNQUFNLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsRUFBRTtnQkFDcEYsZ0JBQWdCLEdBQUcsTUFBTSxDQUFDLHdCQUF3QixDQUFDLFVBQVUsRUFBRSxXQUFXLENBQUMsQ0FBQztnQkFDNUUsVUFBVSxHQUFHLE1BQU0sQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7YUFDaEQ7O2tCQUVLLE1BQU0sR0FBRyxnQkFBZ0IsSUFBSSxnQkFBZ0IsQ0FBQyxHQUFHOztrQkFDakQsTUFBTSxHQUFHLGdCQUFnQixJQUFJLGdCQUFnQixDQUFDLEdBQUc7WUFFdkQsMENBQTBDO1lBQzFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLFdBQVcsRUFBRTtnQkFDeEMsR0FBRyxFQUFFLE1BQU07b0JBQ1AsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsY0FBbUMsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7Ozs7Z0JBQzNGLEdBQUcsQ0FBNEIsS0FBUTs7d0JBQ2pDLGFBQWEsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDO29CQUN4QyxJQUFJLENBQUMsYUFBYSxFQUFFO3dCQUNsQixhQUFhLEdBQUcsRUFBRSxDQUFDO3dCQUNuQiwrREFBK0Q7d0JBQy9ELE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRSxFQUFDLEtBQUssRUFBRSxhQUFhLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7cUJBQ3JGOzswQkFFSyxhQUFhLEdBQUcsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLGFBQWEsQ0FBQzs7MEJBQ25ELGFBQWEsR0FBRyxhQUFhLENBQUMsV0FBVyxDQUFDO29CQUVoRCxJQUFJLGFBQWEsRUFBRTt3QkFDakIsYUFBYSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUM7cUJBQ3BDO3lCQUFNO3dCQUNMLGFBQWEsQ0FBQyxXQUFXLENBQUM7NEJBQ3RCLElBQUksWUFBWSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxLQUFLLEVBQUUsYUFBYSxDQUFDLENBQUM7cUJBQ2pFO29CQUVELElBQUksYUFBYSxFQUFFO3dCQUNqQixrRkFBa0Y7d0JBQ2xGLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRSxFQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztxQkFDckU7eUJBQU07d0JBQ0wsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLEtBQUssQ0FBQztxQkFDN0I7b0JBRUQsSUFBSSxNQUFNO3dCQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUN2QyxDQUFDOztnQkFFRCxZQUFZLEVBQUUsQ0FBQyxDQUFDLFNBQVM7YUFDMUIsQ0FBQyxDQUFDO1NBQ0o7S0FDRjtJQUVELDBFQUEwRTtJQUMxRSwwRUFBMEU7SUFDMUUsZ0VBQWdFO0lBQ2hFLElBQUksVUFBVSxDQUFDLE1BQU0sSUFBSSxJQUFJLEVBQUU7UUFDN0IsVUFBVSxDQUFDLE1BQU0sR0FBRyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDekQ7SUFFRCxVQUFVLENBQUMsT0FBTyxHQUFHLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUM1RCxDQUFDOzs7QUFJRCxDQUFDLG1CQUFBLGtCQUFrQixFQUF1QixDQUFDLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQzs7Ozs7QUFFN0QsU0FBUyxnQkFBZ0IsQ0FBQyxZQUFpQztJQUN6RCxPQUFPOztjQUNDLGFBQWEsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDO1FBQzFDLElBQUksYUFBYSxJQUFJLElBQUksRUFBRTtZQUN6QixJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ2hDLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxJQUFJLENBQUM7U0FDN0I7UUFDRCxJQUFJLFlBQVk7WUFBRSxZQUFZLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzdDLENBQUMsQ0FBQztBQUNKLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7U2ltcGxlQ2hhbmdlfSBmcm9tICcuLi8uLi9jaGFuZ2VfZGV0ZWN0aW9uL2NoYW5nZV9kZXRlY3Rpb25fdXRpbCc7XG5pbXBvcnQge09uQ2hhbmdlcywgU2ltcGxlQ2hhbmdlc30gZnJvbSAnLi4vLi4vbWV0YWRhdGEvbGlmZWN5Y2xlX2hvb2tzJztcbmltcG9ydCB7RGlyZWN0aXZlRGVmLCBEaXJlY3RpdmVEZWZGZWF0dXJlfSBmcm9tICcuLi9pbnRlcmZhY2VzL2RlZmluaXRpb24nO1xuXG5jb25zdCBQUklWQVRFX1BSRUZJWCA9ICdfX25nT25DaGFuZ2VzXyc7XG5cbnR5cGUgT25DaGFuZ2VzRXhwYW5kbyA9IE9uQ2hhbmdlcyAmIHtcbiAgX19uZ09uQ2hhbmdlc186IFNpbXBsZUNoYW5nZXN8bnVsbHx1bmRlZmluZWQ7XG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1hbnkgQ2FuIGhvbGQgYW55IHZhbHVlXG4gIFtrZXk6IHN0cmluZ106IGFueTtcbn07XG5cbi8qKlxuICogVGhlIE5nT25DaGFuZ2VzRmVhdHVyZSBkZWNvcmF0ZXMgYSBjb21wb25lbnQgd2l0aCBzdXBwb3J0IGZvciB0aGUgbmdPbkNoYW5nZXNcbiAqIGxpZmVjeWNsZSBob29rLCBzbyBpdCBzaG91bGQgYmUgaW5jbHVkZWQgaW4gYW55IGNvbXBvbmVudCB0aGF0IGltcGxlbWVudHNcbiAqIHRoYXQgaG9vay5cbiAqXG4gKiBJZiB0aGUgY29tcG9uZW50IG9yIGRpcmVjdGl2ZSB1c2VzIGluaGVyaXRhbmNlLCB0aGUgTmdPbkNoYW5nZXNGZWF0dXJlIE1VU1RcbiAqIGJlIGluY2x1ZGVkIGFzIGEgZmVhdHVyZSBBRlRFUiB7QGxpbmsgSW5oZXJpdERlZmluaXRpb25GZWF0dXJlfSwgb3RoZXJ3aXNlXG4gKiBpbmhlcml0ZWQgcHJvcGVydGllcyB3aWxsIG5vdCBiZSBwcm9wYWdhdGVkIHRvIHRoZSBuZ09uQ2hhbmdlcyBsaWZlY3ljbGVcbiAqIGhvb2suXG4gKlxuICogRXhhbXBsZSB1c2FnZTpcbiAqXG4gKiBgYGBcbiAqIHN0YXRpYyBuZ0NvbXBvbmVudERlZiA9IGRlZmluZUNvbXBvbmVudCh7XG4gKiAgIC4uLlxuICogICBpbnB1dHM6IHtuYW1lOiAncHVibGljTmFtZSd9LFxuICogICBmZWF0dXJlczogW05nT25DaGFuZ2VzRmVhdHVyZV1cbiAqIH0pO1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBOZ09uQ2hhbmdlc0ZlYXR1cmU8VD4oZGVmaW5pdGlvbjogRGlyZWN0aXZlRGVmPFQ+KTogdm9pZCB7XG4gIGNvbnN0IHB1YmxpY1RvRGVjbGFyZWRJbnB1dHMgPSBkZWZpbml0aW9uLmRlY2xhcmVkSW5wdXRzO1xuICBjb25zdCBwdWJsaWNUb01pbmlmaWVkSW5wdXRzID0gZGVmaW5pdGlvbi5pbnB1dHM7XG4gIGNvbnN0IHByb3RvID0gZGVmaW5pdGlvbi50eXBlLnByb3RvdHlwZTtcbiAgZm9yIChjb25zdCBwdWJsaWNOYW1lIGluIHB1YmxpY1RvRGVjbGFyZWRJbnB1dHMpIHtcbiAgICBpZiAocHVibGljVG9EZWNsYXJlZElucHV0cy5oYXNPd25Qcm9wZXJ0eShwdWJsaWNOYW1lKSkge1xuICAgICAgY29uc3QgbWluaWZpZWRLZXkgPSBwdWJsaWNUb01pbmlmaWVkSW5wdXRzW3B1YmxpY05hbWVdO1xuICAgICAgY29uc3QgZGVjbGFyZWRLZXkgPSBwdWJsaWNUb0RlY2xhcmVkSW5wdXRzW3B1YmxpY05hbWVdO1xuICAgICAgY29uc3QgcHJpdmF0ZU1pbktleSA9IFBSSVZBVEVfUFJFRklYICsgbWluaWZpZWRLZXk7XG5cbiAgICAgIC8vIFdhbGsgdGhlIHByb3RvdHlwZSBjaGFpbiB0byBzZWUgaWYgd2UgZmluZCBhIHByb3BlcnR5IGRlc2NyaXB0b3JcbiAgICAgIC8vIFRoYXQgd2F5IHdlIGNhbiBob25vciBzZXR0ZXJzIGFuZCBnZXR0ZXJzIHRoYXQgd2VyZSBpbmhlcml0ZWQuXG4gICAgICBsZXQgb3JpZ2luYWxQcm9wZXJ0eTogUHJvcGVydHlEZXNjcmlwdG9yfHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAgIGxldCBjaGVja1Byb3RvID0gcHJvdG87XG4gICAgICB3aGlsZSAoIW9yaWdpbmFsUHJvcGVydHkgJiYgY2hlY2tQcm90byAmJlxuICAgICAgICAgICAgIE9iamVjdC5nZXRQcm90b3R5cGVPZihjaGVja1Byb3RvKSAhPT0gT2JqZWN0LmdldFByb3RvdHlwZU9mKE9iamVjdC5wcm90b3R5cGUpKSB7XG4gICAgICAgIG9yaWdpbmFsUHJvcGVydHkgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGNoZWNrUHJvdG8sIG1pbmlmaWVkS2V5KTtcbiAgICAgICAgY2hlY2tQcm90byA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihjaGVja1Byb3RvKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgZ2V0dGVyID0gb3JpZ2luYWxQcm9wZXJ0eSAmJiBvcmlnaW5hbFByb3BlcnR5LmdldDtcbiAgICAgIGNvbnN0IHNldHRlciA9IG9yaWdpbmFsUHJvcGVydHkgJiYgb3JpZ2luYWxQcm9wZXJ0eS5zZXQ7XG5cbiAgICAgIC8vIGNyZWF0ZSBhIGdldHRlciBhbmQgc2V0dGVyIGZvciBwcm9wZXJ0eVxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHByb3RvLCBtaW5pZmllZEtleSwge1xuICAgICAgICBnZXQ6IGdldHRlciB8fFxuICAgICAgICAgICAgKHNldHRlciA/IHVuZGVmaW5lZCA6IGZ1bmN0aW9uKHRoaXM6IE9uQ2hhbmdlc0V4cGFuZG8pIHsgcmV0dXJuIHRoaXNbcHJpdmF0ZU1pbktleV07IH0pLFxuICAgICAgICBzZXQ8VD4odGhpczogT25DaGFuZ2VzRXhwYW5kbywgdmFsdWU6IFQpIHtcbiAgICAgICAgICBsZXQgc2ltcGxlQ2hhbmdlcyA9IHRoaXNbUFJJVkFURV9QUkVGSVhdO1xuICAgICAgICAgIGlmICghc2ltcGxlQ2hhbmdlcykge1xuICAgICAgICAgICAgc2ltcGxlQ2hhbmdlcyA9IHt9O1xuICAgICAgICAgICAgLy8gUGxhY2Ugd2hlcmUgd2Ugd2lsbCBzdG9yZSBTaW1wbGVDaGFuZ2VzIGlmIHRoZXJlIGlzIGEgY2hhbmdlXG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgUFJJVkFURV9QUkVGSVgsIHt2YWx1ZTogc2ltcGxlQ2hhbmdlcywgd3JpdGFibGU6IHRydWV9KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCBpc0ZpcnN0Q2hhbmdlID0gIXRoaXMuaGFzT3duUHJvcGVydHkocHJpdmF0ZU1pbktleSk7XG4gICAgICAgICAgY29uc3QgY3VycmVudENoYW5nZSA9IHNpbXBsZUNoYW5nZXNbZGVjbGFyZWRLZXldO1xuXG4gICAgICAgICAgaWYgKGN1cnJlbnRDaGFuZ2UpIHtcbiAgICAgICAgICAgIGN1cnJlbnRDaGFuZ2UuY3VycmVudFZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNpbXBsZUNoYW5nZXNbZGVjbGFyZWRLZXldID1cbiAgICAgICAgICAgICAgICBuZXcgU2ltcGxlQ2hhbmdlKHRoaXNbcHJpdmF0ZU1pbktleV0sIHZhbHVlLCBpc0ZpcnN0Q2hhbmdlKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoaXNGaXJzdENoYW5nZSkge1xuICAgICAgICAgICAgLy8gQ3JlYXRlIGEgcGxhY2Ugd2hlcmUgdGhlIGFjdHVhbCB2YWx1ZSB3aWxsIGJlIHN0b3JlZCBhbmQgbWFrZSBpdCBub24tZW51bWVyYWJsZVxuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIHByaXZhdGVNaW5LZXksIHt2YWx1ZSwgd3JpdGFibGU6IHRydWV9KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpc1twcml2YXRlTWluS2V5XSA9IHZhbHVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChzZXR0ZXIpIHNldHRlci5jYWxsKHRoaXMsIHZhbHVlKTtcbiAgICAgICAgfSxcbiAgICAgICAgLy8gTWFrZSB0aGUgcHJvcGVydHkgY29uZmlndXJhYmxlIGluIGRldiBtb2RlIHRvIGFsbG93IG92ZXJyaWRpbmcgaW4gdGVzdHNcbiAgICAgICAgY29uZmlndXJhYmxlOiAhIW5nRGV2TW9kZVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLy8gSWYgYW4gb25Jbml0IGhvb2sgaXMgZGVmaW5lZCwgaXQgd2lsbCBuZWVkIHRvIHdyYXAgdGhlIG5nT25DaGFuZ2VzIGNhbGxcbiAgLy8gc28gdGhlIGNhbGwgb3JkZXIgaXMgY2hhbmdlcy1pbml0LWNoZWNrIGluIGNyZWF0aW9uIG1vZGUuIEluIHN1YnNlcXVlbnRcbiAgLy8gY2hhbmdlIGRldGVjdGlvbiBydW5zLCBvbmx5IHRoZSBjaGVjayB3cmFwcGVyIHdpbGwgYmUgY2FsbGVkLlxuICBpZiAoZGVmaW5pdGlvbi5vbkluaXQgIT0gbnVsbCkge1xuICAgIGRlZmluaXRpb24ub25Jbml0ID0gb25DaGFuZ2VzV3JhcHBlcihkZWZpbml0aW9uLm9uSW5pdCk7XG4gIH1cblxuICBkZWZpbml0aW9uLmRvQ2hlY2sgPSBvbkNoYW5nZXNXcmFwcGVyKGRlZmluaXRpb24uZG9DaGVjayk7XG59XG5cbi8vIFRoaXMgb3B0aW9uIGVuc3VyZXMgdGhhdCB0aGUgbmdPbkNoYW5nZXMgbGlmZWN5Y2xlIGhvb2sgd2lsbCBiZSBpbmhlcml0ZWRcbi8vIGZyb20gc3VwZXJjbGFzc2VzIChpbiBJbmhlcml0RGVmaW5pdGlvbkZlYXR1cmUpLlxuKE5nT25DaGFuZ2VzRmVhdHVyZSBhcyBEaXJlY3RpdmVEZWZGZWF0dXJlKS5uZ0luaGVyaXQgPSB0cnVlO1xuXG5mdW5jdGlvbiBvbkNoYW5nZXNXcmFwcGVyKGRlbGVnYXRlSG9vazogKCgpID0+IHZvaWQpIHwgbnVsbCkge1xuICByZXR1cm4gZnVuY3Rpb24odGhpczogT25DaGFuZ2VzRXhwYW5kbykge1xuICAgIGNvbnN0IHNpbXBsZUNoYW5nZXMgPSB0aGlzW1BSSVZBVEVfUFJFRklYXTtcbiAgICBpZiAoc2ltcGxlQ2hhbmdlcyAhPSBudWxsKSB7XG4gICAgICB0aGlzLm5nT25DaGFuZ2VzKHNpbXBsZUNoYW5nZXMpO1xuICAgICAgdGhpc1tQUklWQVRFX1BSRUZJWF0gPSBudWxsO1xuICAgIH1cbiAgICBpZiAoZGVsZWdhdGVIb29rKSBkZWxlZ2F0ZUhvb2suYXBwbHkodGhpcyk7XG4gIH07XG59XG4iXX0=