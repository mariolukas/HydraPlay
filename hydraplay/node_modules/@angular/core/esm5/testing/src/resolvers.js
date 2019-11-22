/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { Component, Directive, NgModule, Pipe, ɵReflectionCapabilities as ReflectionCapabilities } from '@angular/core';
import { MetadataOverrider } from './metadata_overrider';
var reflection = new ReflectionCapabilities();
/**
 * Allows to override ivy metadata for tests (via the `TestBed`).
 */
var OverrideResolver = /** @class */ (function () {
    function OverrideResolver() {
        this.overrides = new Map();
        this.resolved = new Map();
    }
    OverrideResolver.prototype.setOverrides = function (overrides) {
        var _this = this;
        this.overrides.clear();
        overrides.forEach(function (_a) {
            var _b = tslib_1.__read(_a, 2), type = _b[0], override = _b[1];
            var overrides = _this.overrides.get(type) || [];
            overrides.push(override);
            _this.overrides.set(type, overrides);
        });
    };
    OverrideResolver.prototype.getAnnotation = function (type) {
        var _this = this;
        return reflection.annotations(type).find(function (a) { return a instanceof _this.type; }) || null;
    };
    OverrideResolver.prototype.resolve = function (type) {
        var _this = this;
        var resolved = this.resolved.get(type) || null;
        if (!resolved) {
            resolved = this.getAnnotation(type);
            if (resolved) {
                var overrides = this.overrides.get(type);
                if (overrides) {
                    var overrider_1 = new MetadataOverrider();
                    overrides.forEach(function (override) {
                        resolved = overrider_1.overrideMetadata(_this.type, resolved, override);
                    });
                }
            }
            this.resolved.set(type, resolved);
        }
        return resolved;
    };
    return OverrideResolver;
}());
var DirectiveResolver = /** @class */ (function (_super) {
    tslib_1.__extends(DirectiveResolver, _super);
    function DirectiveResolver() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(DirectiveResolver.prototype, "type", {
        get: function () { return Directive; },
        enumerable: true,
        configurable: true
    });
    return DirectiveResolver;
}(OverrideResolver));
export { DirectiveResolver };
var ComponentResolver = /** @class */ (function (_super) {
    tslib_1.__extends(ComponentResolver, _super);
    function ComponentResolver() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(ComponentResolver.prototype, "type", {
        get: function () { return Component; },
        enumerable: true,
        configurable: true
    });
    return ComponentResolver;
}(OverrideResolver));
export { ComponentResolver };
var PipeResolver = /** @class */ (function (_super) {
    tslib_1.__extends(PipeResolver, _super);
    function PipeResolver() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(PipeResolver.prototype, "type", {
        get: function () { return Pipe; },
        enumerable: true,
        configurable: true
    });
    return PipeResolver;
}(OverrideResolver));
export { PipeResolver };
var NgModuleResolver = /** @class */ (function (_super) {
    tslib_1.__extends(NgModuleResolver, _super);
    function NgModuleResolver() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(NgModuleResolver.prototype, "type", {
        get: function () { return NgModule; },
        enumerable: true,
        configurable: true
    });
    return NgModuleResolver;
}(OverrideResolver));
export { NgModuleResolver };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb2x2ZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS90ZXN0aW5nL3NyYy9yZXNvbHZlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQVEsdUJBQXVCLElBQUksc0JBQXNCLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFHNUgsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFFdkQsSUFBTSxVQUFVLEdBQUcsSUFBSSxzQkFBc0IsRUFBRSxDQUFDO0FBT2hEOztHQUVHO0FBQ0g7SUFBQTtRQUNVLGNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBb0MsQ0FBQztRQUN4RCxhQUFRLEdBQUcsSUFBSSxHQUFHLEVBQXFCLENBQUM7SUFvQ2xELENBQUM7SUFoQ0MsdUNBQVksR0FBWixVQUFhLFNBQWtEO1FBQS9ELGlCQU9DO1FBTkMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUN2QixTQUFTLENBQUMsT0FBTyxDQUFDLFVBQUMsRUFBZ0I7Z0JBQWhCLDBCQUFnQixFQUFmLFlBQUksRUFBRSxnQkFBUTtZQUNoQyxJQUFNLFNBQVMsR0FBRyxLQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDakQsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN6QixLQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDdEMsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsd0NBQWEsR0FBYixVQUFjLElBQWU7UUFBN0IsaUJBRUM7UUFEQyxPQUFPLFVBQVUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxZQUFZLEtBQUksQ0FBQyxJQUFJLEVBQXRCLENBQXNCLENBQUMsSUFBSSxJQUFJLENBQUM7SUFDaEYsQ0FBQztJQUVELGtDQUFPLEdBQVAsVUFBUSxJQUFlO1FBQXZCLGlCQWtCQztRQWpCQyxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUM7UUFFL0MsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNiLFFBQVEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3BDLElBQUksUUFBUSxFQUFFO2dCQUNaLElBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUMzQyxJQUFJLFNBQVMsRUFBRTtvQkFDYixJQUFNLFdBQVMsR0FBRyxJQUFJLGlCQUFpQixFQUFFLENBQUM7b0JBQzFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsVUFBQSxRQUFRO3dCQUN4QixRQUFRLEdBQUcsV0FBUyxDQUFDLGdCQUFnQixDQUFDLEtBQUksQ0FBQyxJQUFJLEVBQUUsUUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFDO29CQUN6RSxDQUFDLENBQUMsQ0FBQztpQkFDSjthQUNGO1lBQ0QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1NBQ25DO1FBRUQsT0FBTyxRQUFRLENBQUM7SUFDbEIsQ0FBQztJQUNILHVCQUFDO0FBQUQsQ0FBQyxBQXRDRCxJQXNDQztBQUdEO0lBQXVDLDZDQUEyQjtJQUFsRTs7SUFFQSxDQUFDO0lBREMsc0JBQUksbUNBQUk7YUFBUixjQUFhLE9BQU8sU0FBUyxDQUFDLENBQUMsQ0FBQzs7O09BQUE7SUFDbEMsd0JBQUM7QUFBRCxDQUFDLEFBRkQsQ0FBdUMsZ0JBQWdCLEdBRXREOztBQUVEO0lBQXVDLDZDQUEyQjtJQUFsRTs7SUFFQSxDQUFDO0lBREMsc0JBQUksbUNBQUk7YUFBUixjQUFhLE9BQU8sU0FBUyxDQUFDLENBQUMsQ0FBQzs7O09BQUE7SUFDbEMsd0JBQUM7QUFBRCxDQUFDLEFBRkQsQ0FBdUMsZ0JBQWdCLEdBRXREOztBQUVEO0lBQWtDLHdDQUFzQjtJQUF4RDs7SUFFQSxDQUFDO0lBREMsc0JBQUksOEJBQUk7YUFBUixjQUFhLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQzs7O09BQUE7SUFDN0IsbUJBQUM7QUFBRCxDQUFDLEFBRkQsQ0FBa0MsZ0JBQWdCLEdBRWpEOztBQUVEO0lBQXNDLDRDQUEwQjtJQUFoRTs7SUFFQSxDQUFDO0lBREMsc0JBQUksa0NBQUk7YUFBUixjQUFhLE9BQU8sUUFBUSxDQUFDLENBQUMsQ0FBQzs7O09BQUE7SUFDakMsdUJBQUM7QUFBRCxDQUFDLEFBRkQsQ0FBc0MsZ0JBQWdCLEdBRXJEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbXBvbmVudCwgRGlyZWN0aXZlLCBOZ01vZHVsZSwgUGlwZSwgVHlwZSwgybVSZWZsZWN0aW9uQ2FwYWJpbGl0aWVzIGFzIFJlZmxlY3Rpb25DYXBhYmlsaXRpZXN9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge01ldGFkYXRhT3ZlcnJpZGV9IGZyb20gJy4vbWV0YWRhdGFfb3ZlcnJpZGUnO1xuaW1wb3J0IHtNZXRhZGF0YU92ZXJyaWRlcn0gZnJvbSAnLi9tZXRhZGF0YV9vdmVycmlkZXInO1xuXG5jb25zdCByZWZsZWN0aW9uID0gbmV3IFJlZmxlY3Rpb25DYXBhYmlsaXRpZXMoKTtcblxuLyoqXG4gKiBCYXNlIGludGVyZmFjZSB0byByZXNvbHZlIGBAQ29tcG9uZW50YCwgYEBEaXJlY3RpdmVgLCBgQFBpcGVgIGFuZCBgQE5nTW9kdWxlYC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBSZXNvbHZlcjxUPiB7IHJlc29sdmUodHlwZTogVHlwZTxhbnk+KTogVHxudWxsOyB9XG5cbi8qKlxuICogQWxsb3dzIHRvIG92ZXJyaWRlIGl2eSBtZXRhZGF0YSBmb3IgdGVzdHMgKHZpYSB0aGUgYFRlc3RCZWRgKS5cbiAqL1xuYWJzdHJhY3QgY2xhc3MgT3ZlcnJpZGVSZXNvbHZlcjxUPiBpbXBsZW1lbnRzIFJlc29sdmVyPFQ+IHtcbiAgcHJpdmF0ZSBvdmVycmlkZXMgPSBuZXcgTWFwPFR5cGU8YW55PiwgTWV0YWRhdGFPdmVycmlkZTxUPltdPigpO1xuICBwcml2YXRlIHJlc29sdmVkID0gbmV3IE1hcDxUeXBlPGFueT4sIFR8bnVsbD4oKTtcblxuICBhYnN0cmFjdCBnZXQgdHlwZSgpOiBhbnk7XG5cbiAgc2V0T3ZlcnJpZGVzKG92ZXJyaWRlczogQXJyYXk8W1R5cGU8YW55PiwgTWV0YWRhdGFPdmVycmlkZTxUPl0+KSB7XG4gICAgdGhpcy5vdmVycmlkZXMuY2xlYXIoKTtcbiAgICBvdmVycmlkZXMuZm9yRWFjaCgoW3R5cGUsIG92ZXJyaWRlXSkgPT4ge1xuICAgICAgY29uc3Qgb3ZlcnJpZGVzID0gdGhpcy5vdmVycmlkZXMuZ2V0KHR5cGUpIHx8IFtdO1xuICAgICAgb3ZlcnJpZGVzLnB1c2gob3ZlcnJpZGUpO1xuICAgICAgdGhpcy5vdmVycmlkZXMuc2V0KHR5cGUsIG92ZXJyaWRlcyk7XG4gICAgfSk7XG4gIH1cblxuICBnZXRBbm5vdGF0aW9uKHR5cGU6IFR5cGU8YW55Pik6IFR8bnVsbCB7XG4gICAgcmV0dXJuIHJlZmxlY3Rpb24uYW5ub3RhdGlvbnModHlwZSkuZmluZChhID0+IGEgaW5zdGFuY2VvZiB0aGlzLnR5cGUpIHx8IG51bGw7XG4gIH1cblxuICByZXNvbHZlKHR5cGU6IFR5cGU8YW55Pik6IFR8bnVsbCB7XG4gICAgbGV0IHJlc29sdmVkID0gdGhpcy5yZXNvbHZlZC5nZXQodHlwZSkgfHwgbnVsbDtcblxuICAgIGlmICghcmVzb2x2ZWQpIHtcbiAgICAgIHJlc29sdmVkID0gdGhpcy5nZXRBbm5vdGF0aW9uKHR5cGUpO1xuICAgICAgaWYgKHJlc29sdmVkKSB7XG4gICAgICAgIGNvbnN0IG92ZXJyaWRlcyA9IHRoaXMub3ZlcnJpZGVzLmdldCh0eXBlKTtcbiAgICAgICAgaWYgKG92ZXJyaWRlcykge1xuICAgICAgICAgIGNvbnN0IG92ZXJyaWRlciA9IG5ldyBNZXRhZGF0YU92ZXJyaWRlcigpO1xuICAgICAgICAgIG92ZXJyaWRlcy5mb3JFYWNoKG92ZXJyaWRlID0+IHtcbiAgICAgICAgICAgIHJlc29sdmVkID0gb3ZlcnJpZGVyLm92ZXJyaWRlTWV0YWRhdGEodGhpcy50eXBlLCByZXNvbHZlZCAhLCBvdmVycmlkZSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMucmVzb2x2ZWQuc2V0KHR5cGUsIHJlc29sdmVkKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzb2x2ZWQ7XG4gIH1cbn1cblxuXG5leHBvcnQgY2xhc3MgRGlyZWN0aXZlUmVzb2x2ZXIgZXh0ZW5kcyBPdmVycmlkZVJlc29sdmVyPERpcmVjdGl2ZT4ge1xuICBnZXQgdHlwZSgpIHsgcmV0dXJuIERpcmVjdGl2ZTsgfVxufVxuXG5leHBvcnQgY2xhc3MgQ29tcG9uZW50UmVzb2x2ZXIgZXh0ZW5kcyBPdmVycmlkZVJlc29sdmVyPENvbXBvbmVudD4ge1xuICBnZXQgdHlwZSgpIHsgcmV0dXJuIENvbXBvbmVudDsgfVxufVxuXG5leHBvcnQgY2xhc3MgUGlwZVJlc29sdmVyIGV4dGVuZHMgT3ZlcnJpZGVSZXNvbHZlcjxQaXBlPiB7XG4gIGdldCB0eXBlKCkgeyByZXR1cm4gUGlwZTsgfVxufVxuXG5leHBvcnQgY2xhc3MgTmdNb2R1bGVSZXNvbHZlciBleHRlbmRzIE92ZXJyaWRlUmVzb2x2ZXI8TmdNb2R1bGU+IHtcbiAgZ2V0IHR5cGUoKSB7IHJldHVybiBOZ01vZHVsZTsgfVxufVxuIl19