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
/**
 * @record
 */
function TypeWithMetadata() { }
if (false) {
    /** @type {?|undefined} */
    TypeWithMetadata.prototype.decorators;
    /** @type {?|undefined} */
    TypeWithMetadata.prototype.ctorParameters;
    /** @type {?|undefined} */
    TypeWithMetadata.prototype.propDecorators;
}
/**
 * Adds decorator, constructor, and property metadata to a given type via static metadata fields
 * on the type.
 *
 * These metadata fields can later be read with Angular's `ReflectionCapabilities` API.
 *
 * Calls to `setClassMetadata` can be marked as pure, resulting in the metadata assignments being
 * tree-shaken away during production builds.
 * @param {?} type
 * @param {?} decorators
 * @param {?} ctorParameters
 * @param {?} propDecorators
 * @return {?}
 */
export function setClassMetadata(type, decorators, ctorParameters, propDecorators) {
    /** @type {?} */
    const clazz = (/** @type {?} */ (type));
    if (decorators !== null) {
        if (clazz.decorators !== undefined) {
            clazz.decorators.push(...decorators);
        }
        else {
            clazz.decorators = decorators;
        }
    }
    if (ctorParameters !== null) {
        // Rather than merging, clobber the existing parameters. If other projects exist which use
        // tsickle-style annotations and reflect over them in the same way, this could cause issues,
        // but that is vanishingly unlikely.
        clazz.ctorParameters = ctorParameters;
    }
    if (propDecorators !== null) {
        // The property decorator objects are merged as it is possible different fields have different
        // decorator types. Decorators on individual fields are not merged, as it's also incredibly
        // unlikely that a field will be decorated both with an Angular decorator and a non-Angular
        // decorator that's also been downleveled.
        if (clazz.propDecorators !== undefined) {
            clazz.propDecorators = Object.assign({}, clazz.propDecorators, propDecorators);
        }
        else {
            clazz.propDecorators = propDecorators;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YWRhdGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9yZW5kZXIzL21ldGFkYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBVUEsK0JBSUM7OztJQUhDLHNDQUFtQjs7SUFDbkIsMENBQTZCOztJQUM3QiwwQ0FBd0M7Ozs7Ozs7Ozs7Ozs7Ozs7QUFZMUMsTUFBTSxVQUFVLGdCQUFnQixDQUM1QixJQUFlLEVBQUUsVUFBd0IsRUFBRSxjQUFvQyxFQUMvRSxjQUE2Qzs7VUFDekMsS0FBSyxHQUFHLG1CQUFBLElBQUksRUFBb0I7SUFDdEMsSUFBSSxVQUFVLEtBQUssSUFBSSxFQUFFO1FBQ3ZCLElBQUksS0FBSyxDQUFDLFVBQVUsS0FBSyxTQUFTLEVBQUU7WUFDbEMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxVQUFVLENBQUMsQ0FBQztTQUN0QzthQUFNO1lBQ0wsS0FBSyxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7U0FDL0I7S0FDRjtJQUNELElBQUksY0FBYyxLQUFLLElBQUksRUFBRTtRQUMzQiwwRkFBMEY7UUFDMUYsNEZBQTRGO1FBQzVGLG9DQUFvQztRQUNwQyxLQUFLLENBQUMsY0FBYyxHQUFHLGNBQWMsQ0FBQztLQUN2QztJQUNELElBQUksY0FBYyxLQUFLLElBQUksRUFBRTtRQUMzQiw4RkFBOEY7UUFDOUYsMkZBQTJGO1FBQzNGLDJGQUEyRjtRQUMzRiwwQ0FBMEM7UUFDMUMsSUFBSSxLQUFLLENBQUMsY0FBYyxLQUFLLFNBQVMsRUFBRTtZQUN0QyxLQUFLLENBQUMsY0FBYyxxQkFBTyxLQUFLLENBQUMsY0FBYyxFQUFLLGNBQWMsQ0FBQyxDQUFDO1NBQ3JFO2FBQU07WUFDTCxLQUFLLENBQUMsY0FBYyxHQUFHLGNBQWMsQ0FBQztTQUN2QztLQUNGO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtUeXBlfSBmcm9tICcuLi90eXBlJztcblxuaW50ZXJmYWNlIFR5cGVXaXRoTWV0YWRhdGEgZXh0ZW5kcyBUeXBlPGFueT4ge1xuICBkZWNvcmF0b3JzPzogYW55W107XG4gIGN0b3JQYXJhbWV0ZXJzPzogKCkgPT4gYW55W107XG4gIHByb3BEZWNvcmF0b3JzPzoge1tmaWVsZDogc3RyaW5nXTogYW55fTtcbn1cblxuLyoqXG4gKiBBZGRzIGRlY29yYXRvciwgY29uc3RydWN0b3IsIGFuZCBwcm9wZXJ0eSBtZXRhZGF0YSB0byBhIGdpdmVuIHR5cGUgdmlhIHN0YXRpYyBtZXRhZGF0YSBmaWVsZHNcbiAqIG9uIHRoZSB0eXBlLlxuICpcbiAqIFRoZXNlIG1ldGFkYXRhIGZpZWxkcyBjYW4gbGF0ZXIgYmUgcmVhZCB3aXRoIEFuZ3VsYXIncyBgUmVmbGVjdGlvbkNhcGFiaWxpdGllc2AgQVBJLlxuICpcbiAqIENhbGxzIHRvIGBzZXRDbGFzc01ldGFkYXRhYCBjYW4gYmUgbWFya2VkIGFzIHB1cmUsIHJlc3VsdGluZyBpbiB0aGUgbWV0YWRhdGEgYXNzaWdubWVudHMgYmVpbmdcbiAqIHRyZWUtc2hha2VuIGF3YXkgZHVyaW5nIHByb2R1Y3Rpb24gYnVpbGRzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0Q2xhc3NNZXRhZGF0YShcbiAgICB0eXBlOiBUeXBlPGFueT4sIGRlY29yYXRvcnM6IGFueVtdIHwgbnVsbCwgY3RvclBhcmFtZXRlcnM6ICgoKSA9PiBhbnlbXSkgfCBudWxsLFxuICAgIHByb3BEZWNvcmF0b3JzOiB7W2ZpZWxkOiBzdHJpbmddOiBhbnl9IHwgbnVsbCk6IHZvaWQge1xuICBjb25zdCBjbGF6eiA9IHR5cGUgYXMgVHlwZVdpdGhNZXRhZGF0YTtcbiAgaWYgKGRlY29yYXRvcnMgIT09IG51bGwpIHtcbiAgICBpZiAoY2xhenouZGVjb3JhdG9ycyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBjbGF6ei5kZWNvcmF0b3JzLnB1c2goLi4uZGVjb3JhdG9ycyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNsYXp6LmRlY29yYXRvcnMgPSBkZWNvcmF0b3JzO1xuICAgIH1cbiAgfVxuICBpZiAoY3RvclBhcmFtZXRlcnMgIT09IG51bGwpIHtcbiAgICAvLyBSYXRoZXIgdGhhbiBtZXJnaW5nLCBjbG9iYmVyIHRoZSBleGlzdGluZyBwYXJhbWV0ZXJzLiBJZiBvdGhlciBwcm9qZWN0cyBleGlzdCB3aGljaCB1c2VcbiAgICAvLyB0c2lja2xlLXN0eWxlIGFubm90YXRpb25zIGFuZCByZWZsZWN0IG92ZXIgdGhlbSBpbiB0aGUgc2FtZSB3YXksIHRoaXMgY291bGQgY2F1c2UgaXNzdWVzLFxuICAgIC8vIGJ1dCB0aGF0IGlzIHZhbmlzaGluZ2x5IHVubGlrZWx5LlxuICAgIGNsYXp6LmN0b3JQYXJhbWV0ZXJzID0gY3RvclBhcmFtZXRlcnM7XG4gIH1cbiAgaWYgKHByb3BEZWNvcmF0b3JzICE9PSBudWxsKSB7XG4gICAgLy8gVGhlIHByb3BlcnR5IGRlY29yYXRvciBvYmplY3RzIGFyZSBtZXJnZWQgYXMgaXQgaXMgcG9zc2libGUgZGlmZmVyZW50IGZpZWxkcyBoYXZlIGRpZmZlcmVudFxuICAgIC8vIGRlY29yYXRvciB0eXBlcy4gRGVjb3JhdG9ycyBvbiBpbmRpdmlkdWFsIGZpZWxkcyBhcmUgbm90IG1lcmdlZCwgYXMgaXQncyBhbHNvIGluY3JlZGlibHlcbiAgICAvLyB1bmxpa2VseSB0aGF0IGEgZmllbGQgd2lsbCBiZSBkZWNvcmF0ZWQgYm90aCB3aXRoIGFuIEFuZ3VsYXIgZGVjb3JhdG9yIGFuZCBhIG5vbi1Bbmd1bGFyXG4gICAgLy8gZGVjb3JhdG9yIHRoYXQncyBhbHNvIGJlZW4gZG93bmxldmVsZWQuXG4gICAgaWYgKGNsYXp6LnByb3BEZWNvcmF0b3JzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGNsYXp6LnByb3BEZWNvcmF0b3JzID0gey4uLmNsYXp6LnByb3BEZWNvcmF0b3JzLCAuLi5wcm9wRGVjb3JhdG9yc307XG4gICAgfSBlbHNlIHtcbiAgICAgIGNsYXp6LnByb3BEZWNvcmF0b3JzID0gcHJvcERlY29yYXRvcnM7XG4gICAgfVxuICB9XG59XG4iXX0=