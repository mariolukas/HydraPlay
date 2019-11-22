/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { SimpleChange } from '../../change_detection/change_detection_util';
var PRIVATE_PREFIX = '__ngOnChanges_';
/**
 * The NgOnChangesFeature decorates a component with support for the ngOnChanges
 * lifecycle hook, so it should be included in any component that implements
 * that hook.
 *
 * If the component or directive uses inheritance, the NgOnChangesFeature MUST
 * be included as a feature AFTER {@link InheritDefinitionFeature}, otherwise
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
 */
export function NgOnChangesFeature(definition) {
    var publicToDeclaredInputs = definition.declaredInputs;
    var publicToMinifiedInputs = definition.inputs;
    var proto = definition.type.prototype;
    var _loop_1 = function (publicName) {
        if (publicToDeclaredInputs.hasOwnProperty(publicName)) {
            var minifiedKey = publicToMinifiedInputs[publicName];
            var declaredKey_1 = publicToDeclaredInputs[publicName];
            var privateMinKey_1 = PRIVATE_PREFIX + minifiedKey;
            // Walk the prototype chain to see if we find a property descriptor
            // That way we can honor setters and getters that were inherited.
            var originalProperty = undefined;
            var checkProto = proto;
            while (!originalProperty && checkProto &&
                Object.getPrototypeOf(checkProto) !== Object.getPrototypeOf(Object.prototype)) {
                originalProperty = Object.getOwnPropertyDescriptor(checkProto, minifiedKey);
                checkProto = Object.getPrototypeOf(checkProto);
            }
            var getter = originalProperty && originalProperty.get;
            var setter_1 = originalProperty && originalProperty.set;
            // create a getter and setter for property
            Object.defineProperty(proto, minifiedKey, {
                get: getter ||
                    (setter_1 ? undefined : function () { return this[privateMinKey_1]; }),
                set: function (value) {
                    var simpleChanges = this[PRIVATE_PREFIX];
                    if (!simpleChanges) {
                        simpleChanges = {};
                        // Place where we will store SimpleChanges if there is a change
                        Object.defineProperty(this, PRIVATE_PREFIX, { value: simpleChanges, writable: true });
                    }
                    var isFirstChange = !this.hasOwnProperty(privateMinKey_1);
                    var currentChange = simpleChanges[declaredKey_1];
                    if (currentChange) {
                        currentChange.currentValue = value;
                    }
                    else {
                        simpleChanges[declaredKey_1] =
                            new SimpleChange(this[privateMinKey_1], value, isFirstChange);
                    }
                    if (isFirstChange) {
                        // Create a place where the actual value will be stored and make it non-enumerable
                        Object.defineProperty(this, privateMinKey_1, { value: value, writable: true });
                    }
                    else {
                        this[privateMinKey_1] = value;
                    }
                    if (setter_1)
                        setter_1.call(this, value);
                },
                // Make the property configurable in dev mode to allow overriding in tests
                configurable: !!ngDevMode
            });
        }
    };
    for (var publicName in publicToDeclaredInputs) {
        _loop_1(publicName);
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
NgOnChangesFeature.ngInherit = true;
function onChangesWrapper(delegateHook) {
    return function () {
        var simpleChanges = this[PRIVATE_PREFIX];
        if (simpleChanges != null) {
            this.ngOnChanges(simpleChanges);
            this[PRIVATE_PREFIX] = null;
        }
        if (delegateHook)
            delegateHook.apply(this);
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfb25jaGFuZ2VzX2ZlYXR1cmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9yZW5kZXIzL2ZlYXR1cmVzL25nX29uY2hhbmdlc19mZWF0dXJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSw4Q0FBOEMsQ0FBQztBQUkxRSxJQUFNLGNBQWMsR0FBRyxnQkFBZ0IsQ0FBQztBQVF4Qzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQW1CRztBQUNILE1BQU0sVUFBVSxrQkFBa0IsQ0FBSSxVQUEyQjtJQUMvRCxJQUFNLHNCQUFzQixHQUFHLFVBQVUsQ0FBQyxjQUFjLENBQUM7SUFDekQsSUFBTSxzQkFBc0IsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDO0lBQ2pELElBQU0sS0FBSyxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDOzRCQUM3QixVQUFVO1FBQ25CLElBQUksc0JBQXNCLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQ3JELElBQU0sV0FBVyxHQUFHLHNCQUFzQixDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3ZELElBQU0sYUFBVyxHQUFHLHNCQUFzQixDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3ZELElBQU0sZUFBYSxHQUFHLGNBQWMsR0FBRyxXQUFXLENBQUM7WUFFbkQsbUVBQW1FO1lBQ25FLGlFQUFpRTtZQUNqRSxJQUFJLGdCQUFnQixHQUFpQyxTQUFTLENBQUM7WUFDL0QsSUFBSSxVQUFVLEdBQUcsS0FBSyxDQUFDO1lBQ3ZCLE9BQU8sQ0FBQyxnQkFBZ0IsSUFBSSxVQUFVO2dCQUMvQixNQUFNLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxLQUFLLE1BQU0sQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxFQUFFO2dCQUNwRixnQkFB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R0FBRyxJQUFJLENBQUM7U0FDN0I7UUFDRCxJQUFJLFlBQVk7WUFBRSxZQUFZLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzdDLENBQUMsQ0FBQztBQUNKLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7U2ltcGxlQ2hhbmdlfSBmcm9tICcuLi8uLi9jaGFuZ2VfZGV0ZWN0aW9uL2NoYW5nZV9kZXRlY3Rpb25fdXRpbCc7XG5pbXBvcnQge09uQ2hhbmdlcywgU2ltcGxlQ2hhbmdlc30gZnJvbSAnLi4vLi4vbWV0YWRhdGEvbGlmZWN5Y2xlX2hvb2tzJztcbmltcG9ydCB7RGlyZWN0aXZlRGVmLCBEaXJlY3RpdmVEZWZGZWF0dXJlfSBmcm9tICcuLi9pbnRlcmZhY2VzL2RlZmluaXRpb24nO1xuXG5jb25zdCBQUklWQVRFX1BSRUZJWCA9ICdfX25nT25DaGFuZ2VzXyc7XG5cbnR5cGUgT25DaGFuZ2VzRXhwYW5kbyA9IE9uQ2hhbmdlcyAmIHtcbiAgX19uZ09uQ2hhbmdlc186IFNpbXBsZUNoYW5nZXN8bnVsbHx1bmRlZmluZWQ7XG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1hbnkgQ2FuIGhvbGQgYW55IHZhbHVlXG4gIFtrZXk6IHN0cmluZ106IGFueTtcbn07XG5cbi8qKlxuICogVGhlIE5nT25DaGFuZ2VzRmVhdHVyZSBkZWNvcmF0ZXMgYSBjb21wb25lbnQgd2l0aCBzdXBwb3J0IGZvciB0aGUgbmdPbkNoYW5nZXNcbiAqIGxpZmVjeWNsZSBob29rLCBzbyBpdCBzaG91bGQgYmUgaW5jbHVkZWQgaW4gYW55IGNvbXBvbmVudCB0aGF0IGltcGxlbWVudHNcbiAqIHRoYXQgaG9vay5cbiAqXG4gKiBJZiB0aGUgY29tcG9uZW50IG9yIGRpcmVjdGl2ZSB1c2VzIGluaGVyaXRhbmNlLCB0aGUgTmdPbkNoYW5nZXNGZWF0dXJlIE1VU1RcbiAqIGJlIGluY2x1ZGVkIGFzIGEgZmVhdHVyZSBBRlRFUiB7QGxpbmsgSW5oZXJpdERlZmluaXRpb25GZWF0dXJlfSwgb3RoZXJ3aXNlXG4gKiBpbmhlcml0ZWQgcHJvcGVydGllcyB3aWxsIG5vdCBiZSBwcm9wYWdhdGVkIHRvIHRoZSBuZ09uQ2hhbmdlcyBsaWZlY3ljbGVcbiAqIGhvb2suXG4gKlxuICogRXhhbXBsZSB1c2FnZTpcbiAqXG4gKiBgYGBcbiAqIHN0YXRpYyBuZ0NvbXBvbmVudERlZiA9IGRlZmluZUNvbXBvbmVudCh7XG4gKiAgIC4uLlxuICogICBpbnB1dHM6IHtuYW1lOiAncHVibGljTmFtZSd9LFxuICogICBmZWF0dXJlczogW05nT25DaGFuZ2VzRmVhdHVyZV1cbiAqIH0pO1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBOZ09uQ2hhbmdlc0ZlYXR1cmU8VD4oZGVmaW5pdGlvbjogRGlyZWN0aXZlRGVmPFQ+KTogdm9pZCB7XG4gIGNvbnN0IHB1YmxpY1RvRGVjbGFyZWRJbnB1dHMgPSBkZWZpbml0aW9uLmRlY2xhcmVkSW5wdXRzO1xuICBjb25zdCBwdWJsaWNUb01pbmlmaWVkSW5wdXRzID0gZGVmaW5pdGlvbi5pbnB1dHM7XG4gIGNvbnN0IHByb3RvID0gZGVmaW5pdGlvbi50eXBlLnByb3RvdHlwZTtcbiAgZm9yIChjb25zdCBwdWJsaWNOYW1lIGluIHB1YmxpY1RvRGVjbGFyZWRJbnB1dHMpIHtcbiAgICBpZiAocHVibGljVG9EZWNsYXJlZElucHV0cy5oYXNPd25Qcm9wZXJ0eShwdWJsaWNOYW1lKSkge1xuICAgICAgY29uc3QgbWluaWZpZWRLZXkgPSBwdWJsaWNUb01pbmlmaWVkSW5wdXRzW3B1YmxpY05hbWVdO1xuICAgICAgY29uc3QgZGVjbGFyZWRLZXkgPSBwdWJsaWNUb0RlY2xhcmVkSW5wdXRzW3B1YmxpY05hbWVdO1xuICAgICAgY29uc3QgcHJpdmF0ZU1pbktleSA9IFBSSVZBVEVfUFJFRklYICsgbWluaWZpZWRLZXk7XG5cbiAgICAgIC8vIFdhbGsgdGhlIHByb3RvdHlwZSBjaGFpbiB0byBzZWUgaWYgd2UgZmluZCBhIHByb3BlcnR5IGRlc2NyaXB0b3JcbiAgICAgIC8vIFRoYXQgd2F5IHdlIGNhbiBob25vciBzZXR0ZXJzIGFuZCBnZXR0ZXJzIHRoYXQgd2VyZSBpbmhlcml0ZWQuXG4gICAgICBsZXQgb3JpZ2luYWxQcm9wZXJ0eTogUHJvcGVydHlEZXNjcmlwdG9yfHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAgIGxldCBjaGVja1Byb3RvID0gcHJvdG87XG4gICAgICB3aGlsZSAoIW9yaWdpbmFsUHJvcGVydHkgJiYgY2hlY2tQcm90byAmJlxuICAgICAgICAgICAgIE9iamVjdC5nZXRQcm90b3R5cGVPZihjaGVja1Byb3RvKSAhPT0gT2JqZWN0LmdldFByb3RvdHlwZU9mKE9iamVjdC5wcm90b3R5cGUpKSB7XG4gICAgICAgIG9yaWdpbmFsUHJvcGVydHkgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGNoZWNrUHJvdG8sIG1pbmlmaWVkS2V5KTtcbiAgICAgICAgY2hlY2tQcm90byA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihjaGVja1Byb3RvKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgZ2V0dGVyID0gb3JpZ2luYWxQcm9wZXJ0eSAmJiBvcmlnaW5hbFByb3BlcnR5LmdldDtcbiAgICAgIGNvbnN0IHNldHRlciA9IG9yaWdpbmFsUHJvcGVydHkgJiYgb3JpZ2luYWxQcm9wZXJ0eS5zZXQ7XG5cbiAgICAgIC8vIGNyZWF0ZSBhIGdldHRlciBhbmQgc2V0dGVyIGZvciBwcm9wZXJ0eVxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHByb3RvLCBtaW5pZmllZEtleSwge1xuICAgICAgICBnZXQ6IGdldHRlciB8fFxuICAgICAgICAgICAgKHNldHRlciA/IHVuZGVmaW5lZCA6IGZ1bmN0aW9uKHRoaXM6IE9uQ2hhbmdlc0V4cGFuZG8pIHsgcmV0dXJuIHRoaXNbcHJpdmF0ZU1pbktleV07IH0pLFxuICAgICAgICBzZXQ8VD4odGhpczogT25DaGFuZ2VzRXhwYW5kbywgdmFsdWU6IFQpIHtcbiAgICAgICAgICBsZXQgc2ltcGxlQ2hhbmdlcyA9IHRoaXNbUFJJVkFURV9QUkVGSVhdO1xuICAgICAgICAgIGlmICghc2ltcGxlQ2hhbmdlcykge1xuICAgICAgICAgICAgc2ltcGxlQ2hhbmdlcyA9IHt9O1xuICAgICAgICAgICAgLy8gUGxhY2Ugd2hlcmUgd2Ugd2lsbCBzdG9yZSBTaW1wbGVDaGFuZ2VzIGlmIHRoZXJlIGlzIGEgY2hhbmdlXG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgUFJJVkFURV9QUkVGSVgsIHt2YWx1ZTogc2ltcGxlQ2hhbmdlcywgd3JpdGFibGU6IHRydWV9KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCBpc0ZpcnN0Q2hhbmdlID0gIXRoaXMuaGFzT3duUHJvcGVydHkocHJpdmF0ZU1pbktleSk7XG4gICAgICAgICAgY29uc3QgY3VycmVudENoYW5nZSA9IHNpbXBsZUNoYW5nZXNbZGVjbGFyZWRLZXldO1xuXG4gICAgICAgICAgaWYgKGN1cnJlbnRDaGFuZ2UpIHtcbiAgICAgICAgICAgIGN1cnJlbnRDaGFuZ2UuY3VycmVudFZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNpbXBsZUNoYW5nZXNbZGVjbGFyZWRLZXldID1cbiAgICAgICAgICAgICAgICBuZXcgU2ltcGxlQ2hhbmdlKHRoaXNbcHJpdmF0ZU1pbktleV0sIHZhbHVlLCBpc0ZpcnN0Q2hhbmdlKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoaXNGaXJzdENoYW5nZSkge1xuICAgICAgICAgICAgLy8gQ3JlYXRlIGEgcGxhY2Ugd2hlcmUgdGhlIGFjdHVhbCB2YWx1ZSB3aWxsIGJlIHN0b3JlZCBhbmQgbWFrZSBpdCBub24tZW51bWVyYWJsZVxuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIHByaXZhdGVNaW5LZXksIHt2YWx1ZSwgd3JpdGFibGU6IHRydWV9KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpc1twcml2YXRlTWluS2V5XSA9IHZhbHVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChzZXR0ZXIpIHNldHRlci5jYWxsKHRoaXMsIHZhbHVlKTtcbiAgICAgICAgfSxcbiAgICAgICAgLy8gTWFrZSB0aGUgcHJvcGVydHkgY29uZmlndXJhYmxlIGluIGRldiBtb2RlIHRvIGFsbG93IG92ZXJyaWRpbmcgaW4gdGVzdHNcbiAgICAgICAgY29uZmlndXJhYmxlOiAhIW5nRGV2TW9kZVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLy8gSWYgYW4gb25Jbml0IGhvb2sgaXMgZGVmaW5lZCwgaXQgd2lsbCBuZWVkIHRvIHdyYXAgdGhlIG5nT25DaGFuZ2VzIGNhbGxcbiAgLy8gc28gdGhlIGNhbGwgb3JkZXIgaXMgY2hhbmdlcy1pbml0LWNoZWNrIGluIGNyZWF0aW9uIG1vZGUuIEluIHN1YnNlcXVlbnRcbiAgLy8gY2hhbmdlIGRldGVjdGlvbiBydW5zLCBvbmx5IHRoZSBjaGVjayB3cmFwcGVyIHdpbGwgYmUgY2FsbGVkLlxuICBpZiAoZGVmaW5pdGlvbi5vbkluaXQgIT0gbnVsbCkge1xuICAgIGRlZmluaXRpb24ub25Jbml0ID0gb25DaGFuZ2VzV3JhcHBlcihkZWZpbml0aW9uLm9uSW5pdCk7XG4gIH1cblxuICBkZWZpbml0aW9uLmRvQ2hlY2sgPSBvbkNoYW5nZXNXcmFwcGVyKGRlZmluaXRpb24uZG9DaGVjayk7XG59XG5cbi8vIFRoaXMgb3B0aW9uIGVuc3VyZXMgdGhhdCB0aGUgbmdPbkNoYW5nZXMgbGlmZWN5Y2xlIGhvb2sgd2lsbCBiZSBpbmhlcml0ZWRcbi8vIGZyb20gc3VwZXJjbGFzc2VzIChpbiBJbmhlcml0RGVmaW5pdGlvbkZlYXR1cmUpLlxuKE5nT25DaGFuZ2VzRmVhdHVyZSBhcyBEaXJlY3RpdmVEZWZGZWF0dXJlKS5uZ0luaGVyaXQgPSB0cnVlO1xuXG5mdW5jdGlvbiBvbkNoYW5nZXNXcmFwcGVyKGRlbGVnYXRlSG9vazogKCgpID0+IHZvaWQpIHwgbnVsbCkge1xuICByZXR1cm4gZnVuY3Rpb24odGhpczogT25DaGFuZ2VzRXhwYW5kbykge1xuICAgIGNvbnN0IHNpbXBsZUNoYW5nZXMgPSB0aGlzW1BSSVZBVEVfUFJFRklYXTtcbiAgICBpZiAoc2ltcGxlQ2hhbmdlcyAhPSBudWxsKSB7XG4gICAgICB0aGlzLm5nT25DaGFuZ2VzKHNpbXBsZUNoYW5nZXMpO1xuICAgICAgdGhpc1tQUklWQVRFX1BSRUZJWF0gPSBudWxsO1xuICAgIH1cbiAgICBpZiAoZGVsZWdhdGVIb29rKSBkZWxlZ2F0ZUhvb2suYXBwbHkodGhpcyk7XG4gIH07XG59XG4iXX0=