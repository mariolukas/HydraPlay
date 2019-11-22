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
import { Component, Directive, NgModule, Pipe, ɵReflectionCapabilities as ReflectionCapabilities } from '@angular/core';
import { MetadataOverrider } from './metadata_overrider';
/** @type {?} */
const reflection = new ReflectionCapabilities();
/**
 * Base interface to resolve `\@Component`, `\@Directive`, `\@Pipe` and `\@NgModule`.
 * @record
 * @template T
 */
export function Resolver() { }
if (false) {
    /**
     * @param {?} type
     * @return {?}
     */
    Resolver.prototype.resolve = function (type) { };
}
/**
 * Allows to override ivy metadata for tests (via the `TestBed`).
 * @abstract
 * @template T
 */
class OverrideResolver {
    constructor() {
        this.overrides = new Map();
        this.resolved = new Map();
    }
    /**
     * @param {?} overrides
     * @return {?}
     */
    setOverrides(overrides) {
        this.overrides.clear();
        overrides.forEach(([type, override]) => {
            /** @type {?} */
            const overrides = this.overrides.get(type) || [];
            overrides.push(override);
            this.overrides.set(type, overrides);
        });
    }
    /**
     * @param {?} type
     * @return {?}
     */
    getAnnotation(type) {
        return reflection.annotations(type).find(a => a instanceof this.type) || null;
    }
    /**
     * @param {?} type
     * @return {?}
     */
    resolve(type) {
        /** @type {?} */
        let resolved = this.resolved.get(type) || null;
        if (!resolved) {
            resolved = this.getAnnotation(type);
            if (resolved) {
                /** @type {?} */
                const overrides = this.overrides.get(type);
                if (overrides) {
                    /** @type {?} */
                    const overrider = new MetadataOverrider();
                    overrides.forEach(override => {
                        resolved = overrider.overrideMetadata(this.type, (/** @type {?} */ (resolved)), override);
                    });
                }
            }
            this.resolved.set(type, resolved);
        }
        return resolved;
    }
}
if (false) {
    /**
     * @type {?}
     * @private
     */
    OverrideResolver.prototype.overrides;
    /**
     * @type {?}
     * @private
     */
    OverrideResolver.prototype.resolved;
    /**
     * @abstract
     * @return {?}
     */
    OverrideResolver.prototype.type = function () { };
}
export class DirectiveResolver extends OverrideResolver {
    /**
     * @return {?}
     */
    get type() { return Directive; }
}
export class ComponentResolver extends OverrideResolver {
    /**
     * @return {?}
     */
    get type() { return Component; }
}
export class PipeResolver extends OverrideResolver {
    /**
     * @return {?}
     */
    get type() { return Pipe; }
}
export class NgModuleResolver extends OverrideResolver {
    /**
     * @return {?}
     */
    get type() { return NgModule; }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb2x2ZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS90ZXN0aW5nL3NyYy9yZXNvbHZlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFRQSxPQUFPLEVBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFRLHVCQUF1QixJQUFJLHNCQUFzQixFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRzVILE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLHNCQUFzQixDQUFDOztNQUVqRCxVQUFVLEdBQUcsSUFBSSxzQkFBc0IsRUFBRTs7Ozs7O0FBSy9DLDhCQUFrRTs7Ozs7O0lBQW5DLGlEQUFpQzs7Ozs7OztBQUtoRSxNQUFlLGdCQUFnQjtJQUEvQjtRQUNVLGNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBb0MsQ0FBQztRQUN4RCxhQUFRLEdBQUcsSUFBSSxHQUFHLEVBQXFCLENBQUM7SUFvQ2xELENBQUM7Ozs7O0lBaENDLFlBQVksQ0FBQyxTQUFrRDtRQUM3RCxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3ZCLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsRUFBRSxFQUFFOztrQkFDL0IsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDaEQsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN6QixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDdEMsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDOzs7OztJQUVELGFBQWEsQ0FBQyxJQUFlO1FBQzNCLE9BQU8sVUFBVSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFlBQVksSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQztJQUNoRixDQUFDOzs7OztJQUVELE9BQU8sQ0FBQyxJQUFlOztZQUNqQixRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSTtRQUU5QyxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ2IsUUFBUSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDcEMsSUFBSSxRQUFRLEVBQUU7O3NCQUNOLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUM7Z0JBQzFDLElBQUksU0FBUyxFQUFFOzswQkFDUCxTQUFTLEdBQUcsSUFBSSxpQkFBaUIsRUFBRTtvQkFDekMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRTt3QkFDM0IsUUFBUSxHQUFHLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLG1CQUFBLFFBQVEsRUFBRSxFQUFFLFFBQVEsQ0FBQyxDQUFDO29CQUN6RSxDQUFDLENBQUMsQ0FBQztpQkFDSjthQUNGO1lBQ0QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1NBQ25DO1FBRUQsT0FBTyxRQUFRLENBQUM7SUFDbEIsQ0FBQztDQUNGOzs7Ozs7SUFyQ0MscUNBQWdFOzs7OztJQUNoRSxvQ0FBZ0Q7Ozs7O0lBRWhELGtEQUF5Qjs7QUFxQzNCLE1BQU0sT0FBTyxpQkFBa0IsU0FBUSxnQkFBMkI7Ozs7SUFDaEUsSUFBSSxJQUFJLEtBQUssT0FBTyxTQUFTLENBQUMsQ0FBQyxDQUFDO0NBQ2pDO0FBRUQsTUFBTSxPQUFPLGlCQUFrQixTQUFRLGdCQUEyQjs7OztJQUNoRSxJQUFJLElBQUksS0FBSyxPQUFPLFNBQVMsQ0FBQyxDQUFDLENBQUM7Q0FDakM7QUFFRCxNQUFNLE9BQU8sWUFBYSxTQUFRLGdCQUFzQjs7OztJQUN0RCxJQUFJLElBQUksS0FBSyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUM7Q0FDNUI7QUFFRCxNQUFNLE9BQU8sZ0JBQWlCLFNBQVEsZ0JBQTBCOzs7O0lBQzlELElBQUksSUFBSSxLQUFLLE9BQU8sUUFBUSxDQUFDLENBQUMsQ0FBQztDQUNoQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtDb21wb25lbnQsIERpcmVjdGl2ZSwgTmdNb2R1bGUsIFBpcGUsIFR5cGUsIMm1UmVmbGVjdGlvbkNhcGFiaWxpdGllcyBhcyBSZWZsZWN0aW9uQ2FwYWJpbGl0aWVzfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtNZXRhZGF0YU92ZXJyaWRlfSBmcm9tICcuL21ldGFkYXRhX292ZXJyaWRlJztcbmltcG9ydCB7TWV0YWRhdGFPdmVycmlkZXJ9IGZyb20gJy4vbWV0YWRhdGFfb3ZlcnJpZGVyJztcblxuY29uc3QgcmVmbGVjdGlvbiA9IG5ldyBSZWZsZWN0aW9uQ2FwYWJpbGl0aWVzKCk7XG5cbi8qKlxuICogQmFzZSBpbnRlcmZhY2UgdG8gcmVzb2x2ZSBgQENvbXBvbmVudGAsIGBARGlyZWN0aXZlYCwgYEBQaXBlYCBhbmQgYEBOZ01vZHVsZWAuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmVzb2x2ZXI8VD4geyByZXNvbHZlKHR5cGU6IFR5cGU8YW55Pik6IFR8bnVsbDsgfVxuXG4vKipcbiAqIEFsbG93cyB0byBvdmVycmlkZSBpdnkgbWV0YWRhdGEgZm9yIHRlc3RzICh2aWEgdGhlIGBUZXN0QmVkYCkuXG4gKi9cbmFic3RyYWN0IGNsYXNzIE92ZXJyaWRlUmVzb2x2ZXI8VD4gaW1wbGVtZW50cyBSZXNvbHZlcjxUPiB7XG4gIHByaXZhdGUgb3ZlcnJpZGVzID0gbmV3IE1hcDxUeXBlPGFueT4sIE1ldGFkYXRhT3ZlcnJpZGU8VD5bXT4oKTtcbiAgcHJpdmF0ZSByZXNvbHZlZCA9IG5ldyBNYXA8VHlwZTxhbnk+LCBUfG51bGw+KCk7XG5cbiAgYWJzdHJhY3QgZ2V0IHR5cGUoKTogYW55O1xuXG4gIHNldE92ZXJyaWRlcyhvdmVycmlkZXM6IEFycmF5PFtUeXBlPGFueT4sIE1ldGFkYXRhT3ZlcnJpZGU8VD5dPikge1xuICAgIHRoaXMub3ZlcnJpZGVzLmNsZWFyKCk7XG4gICAgb3ZlcnJpZGVzLmZvckVhY2goKFt0eXBlLCBvdmVycmlkZV0pID0+IHtcbiAgICAgIGNvbnN0IG92ZXJyaWRlcyA9IHRoaXMub3ZlcnJpZGVzLmdldCh0eXBlKSB8fCBbXTtcbiAgICAgIG92ZXJyaWRlcy5wdXNoKG92ZXJyaWRlKTtcbiAgICAgIHRoaXMub3ZlcnJpZGVzLnNldCh0eXBlLCBvdmVycmlkZXMpO1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0QW5ub3RhdGlvbih0eXBlOiBUeXBlPGFueT4pOiBUfG51bGwge1xuICAgIHJldHVybiByZWZsZWN0aW9uLmFubm90YXRpb25zKHR5cGUpLmZpbmQoYSA9PiBhIGluc3RhbmNlb2YgdGhpcy50eXBlKSB8fCBudWxsO1xuICB9XG5cbiAgcmVzb2x2ZSh0eXBlOiBUeXBlPGFueT4pOiBUfG51bGwge1xuICAgIGxldCByZXNvbHZlZCA9IHRoaXMucmVzb2x2ZWQuZ2V0KHR5cGUpIHx8IG51bGw7XG5cbiAgICBpZiAoIXJlc29sdmVkKSB7XG4gICAgICByZXNvbHZlZCA9IHRoaXMuZ2V0QW5ub3RhdGlvbih0eXBlKTtcbiAgICAgIGlmIChyZXNvbHZlZCkge1xuICAgICAgICBjb25zdCBvdmVycmlkZXMgPSB0aGlzLm92ZXJyaWRlcy5nZXQodHlwZSk7XG4gICAgICAgIGlmIChvdmVycmlkZXMpIHtcbiAgICAgICAgICBjb25zdCBvdmVycmlkZXIgPSBuZXcgTWV0YWRhdGFPdmVycmlkZXIoKTtcbiAgICAgICAgICBvdmVycmlkZXMuZm9yRWFjaChvdmVycmlkZSA9PiB7XG4gICAgICAgICAgICByZXNvbHZlZCA9IG92ZXJyaWRlci5vdmVycmlkZU1ldGFkYXRhKHRoaXMudHlwZSwgcmVzb2x2ZWQgISwgb3ZlcnJpZGUpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLnJlc29sdmVkLnNldCh0eXBlLCByZXNvbHZlZCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc29sdmVkO1xuICB9XG59XG5cblxuZXhwb3J0IGNsYXNzIERpcmVjdGl2ZVJlc29sdmVyIGV4dGVuZHMgT3ZlcnJpZGVSZXNvbHZlcjxEaXJlY3RpdmU+IHtcbiAgZ2V0IHR5cGUoKSB7IHJldHVybiBEaXJlY3RpdmU7IH1cbn1cblxuZXhwb3J0IGNsYXNzIENvbXBvbmVudFJlc29sdmVyIGV4dGVuZHMgT3ZlcnJpZGVSZXNvbHZlcjxDb21wb25lbnQ+IHtcbiAgZ2V0IHR5cGUoKSB7IHJldHVybiBDb21wb25lbnQ7IH1cbn1cblxuZXhwb3J0IGNsYXNzIFBpcGVSZXNvbHZlciBleHRlbmRzIE92ZXJyaWRlUmVzb2x2ZXI8UGlwZT4ge1xuICBnZXQgdHlwZSgpIHsgcmV0dXJuIFBpcGU7IH1cbn1cblxuZXhwb3J0IGNsYXNzIE5nTW9kdWxlUmVzb2x2ZXIgZXh0ZW5kcyBPdmVycmlkZVJlc29sdmVyPE5nTW9kdWxlPiB7XG4gIGdldCB0eXBlKCkgeyByZXR1cm4gTmdNb2R1bGU7IH1cbn1cbiJdfQ==