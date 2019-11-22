/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { INJECTOR, Injector } from '../di/injector';
import { InjectFlags } from '../di/injector_compatibility';
import { createInjector } from '../di/r3_injector';
import { ComponentFactoryResolver as viewEngine_ComponentFactoryResolver } from '../linker/component_factory_resolver';
import { NgModuleFactory as viewEngine_NgModuleFactory, NgModuleRef as viewEngine_NgModuleRef } from '../linker/ng_module_factory';
import { stringify } from '../util';
import { assertDefined } from './assert';
import { ComponentFactoryResolver } from './component_ref';
import { getNgModuleDef } from './definition';
var COMPONENT_FACTORY_RESOLVER = {
    provide: viewEngine_ComponentFactoryResolver,
    useClass: ComponentFactoryResolver,
    deps: [viewEngine_NgModuleRef],
};
var NgModuleRef = /** @class */ (function (_super) {
    tslib_1.__extends(NgModuleRef, _super);
    function NgModuleRef(ngModuleType, _parent) {
        var _this = _super.call(this) || this;
        _this._parent = _parent;
        // tslint:disable-next-line:require-internal-with-underscore
        _this._bootstrapComponents = [];
        _this.injector = _this;
        _this.destroyCbs = [];
        var ngModuleDef = getNgModuleDef(ngModuleType);
        ngDevMode && assertDefined(ngModuleDef, "NgModule '" + stringify(ngModuleType) + "' is not a subtype of 'NgModuleType'.");
        _this._bootstrapComponents = ngModuleDef.bootstrap;
        var additionalProviders = [
            {
                provide: viewEngine_NgModuleRef,
                useValue: _this,
            },
            COMPONENT_FACTORY_RESOLVER
        ];
        _this._r3Injector = createInjector(ngModuleType, _parent, additionalProviders);
        _this.instance = _this.get(ngModuleType);
        return _this;
    }
    NgModuleRef.prototype.get = function (token, notFoundValue, injectFlags) {
        if (notFoundValue === void 0) { notFoundValue = Injector.THROW_IF_NOT_FOUND; }
        if (injectFlags === void 0) { injectFlags = InjectFlags.Default; }
        if (token === Injector || token === viewEngine_NgModuleRef || token === INJECTOR) {
            return this;
        }
        return this._r3Injector.get(token, notFoundValue, injectFlags);
    };
    Object.defineProperty(NgModuleRef.prototype, "componentFactoryResolver", {
        get: function () {
            return this.get(viewEngine_ComponentFactoryResolver);
        },
        enumerable: true,
        configurable: true
    });
    NgModuleRef.prototype.destroy = function () {
        ngDevMode && assertDefined(this.destroyCbs, 'NgModule already destroyed');
        this.destroyCbs.forEach(function (fn) { return fn(); });
        this.destroyCbs = null;
    };
    NgModuleRef.prototype.onDestroy = function (callback) {
        ngDevMode && assertDefined(this.destroyCbs, 'NgModule already destroyed');
        this.destroyCbs.push(callback);
    };
    return NgModuleRef;
}(viewEngine_NgModuleRef));
export { NgModuleRef };
var NgModuleFactory = /** @class */ (function (_super) {
    tslib_1.__extends(NgModuleFactory, _super);
    function NgModuleFactory(moduleType) {
        var _this = _super.call(this) || this;
        _this.moduleType = moduleType;
        return _this;
    }
    NgModuleFactory.prototype.create = function (parentInjector) {
        return new NgModuleRef(this.moduleType, parentInjector);
    };
    return NgModuleFactory;
}(viewEngine_NgModuleFactory));
export { NgModuleFactory };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfbW9kdWxlX3JlZi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL3JlbmRlcjMvbmdfbW9kdWxlX3JlZi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxFQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUNsRCxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sOEJBQThCLENBQUM7QUFFekQsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ2pELE9BQU8sRUFBQyx3QkFBd0IsSUFBSSxtQ0FBbUMsRUFBQyxNQUFNLHNDQUFzQyxDQUFDO0FBQ3JILE9BQU8sRUFBc0IsZUFBZSxJQUFJLDBCQUEwQixFQUFFLFdBQVcsSUFBSSxzQkFBc0IsRUFBQyxNQUFNLDZCQUE2QixDQUFDO0FBR3RKLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFFbEMsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUN2QyxPQUFPLEVBQUMsd0JBQXdCLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUN6RCxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sY0FBYyxDQUFDO0FBSTVDLElBQU0sMEJBQTBCLEdBQW1CO0lBQ2pELE9BQU8sRUFBRSxtQ0FBbUM7SUFDNUMsUUFBUSxFQUFFLHdCQUF3QjtJQUNsQyxJQUFJLEVBQUUsQ0FBQyxzQkFBc0IsQ0FBQztDQUMvQixDQUFDO0FBRUY7SUFBb0MsdUNBQXlCO0lBUzNELHFCQUFZLFlBQXFCLEVBQVMsT0FBc0I7UUFBaEUsWUFDRSxpQkFBTyxTQWdCUjtRQWpCeUMsYUFBTyxHQUFQLE9BQU8sQ0FBZTtRQVJoRSw0REFBNEQ7UUFDNUQsMEJBQW9CLEdBQWdCLEVBQUUsQ0FBQztRQUd2QyxjQUFRLEdBQWEsS0FBSSxDQUFDO1FBRTFCLGdCQUFVLEdBQXdCLEVBQUUsQ0FBQztRQUluQyxJQUFNLFdBQVcsR0FBRyxjQUFjLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDakQsU0FBUyxJQUFJLGFBQWEsQ0FDVCxXQUFXLEVBQ1gsZUFBYSxTQUFTLENBQUMsWUFBWSxDQUFDLDBDQUF1QyxDQUFDLENBQUM7UUFFOUYsS0FBSSxDQUFDLG9CQUFvQixHQUFHLFdBQWEsQ0FBQyxTQUFTLENBQUM7UUFDcEQsSUFBTSxtQkFBbUIsR0FBcUI7WUFDNUM7Z0JBQ0UsT0FBTyxFQUFFLHNCQUFzQjtnQkFDL0IsUUFBUSxFQUFFLEtBQUk7YUFDZjtZQUNELDBCQUEwQjtTQUMzQixDQUFDO1FBQ0YsS0FBSSxDQUFDLFdBQVcsR0FBRyxjQUFjLENBQUMsWUFBWSxFQUFFLE9BQU8sRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO1FBQzlFLEtBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQzs7SUFDekMsQ0FBQztJQUVELHlCQUFHLEdBQUgsVUFBSSxLQUFVLEVBQUUsYUFBZ0QsRUFDNUQsV0FBOEM7UUFEbEMsOEJBQUEsRUFBQSxnQkFBcUIsUUFBUSxDQUFDLGtCQUFrQjtRQUM1RCw0QkFBQSxFQUFBLGNBQTJCLFdBQVcsQ0FBQyxPQUFPO1FBQ2hELElBQUksS0FBSyxLQUFLLFFBQVEsSUFBSSxLQUFLLEtBQUssc0JBQXNCLElBQUksS0FBSyxLQUFLLFFBQVEsRUFBRTtZQUNoRixPQUFPLElBQUksQ0FBQztTQUNiO1FBQ0QsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsYUFBYSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQ2pFLENBQUM7SUFFRCxzQkFBSSxpREFBd0I7YUFBNUI7WUFDRSxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsbUNBQW1DLENBQUMsQ0FBQztRQUN2RCxDQUFDOzs7T0FBQTtJQUVELDZCQUFPLEdBQVA7UUFDRSxTQUFTLElBQUksYUFBYSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsNEJBQTRCLENBQUMsQ0FBQztRQUMxRSxJQUFJLENBQUMsVUFBWSxDQUFDLE9BQU8sQ0FBQyxVQUFBLEVBQUUsSUFBSSxPQUFBLEVBQUUsRUFBRSxFQUFKLENBQUksQ0FBQyxDQUFDO1FBQ3RDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO0lBQ3pCLENBQUM7SUFDRCwrQkFBUyxHQUFULFVBQVUsUUFBb0I7UUFDNUIsU0FBUyxJQUFJLGFBQWEsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLDRCQUE0QixDQUFDLENBQUM7UUFDMUUsSUFBSSxDQUFDLFVBQVksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDbkMsQ0FBQztJQUNILGtCQUFDO0FBQUQsQ0FBQyxBQWpERCxDQUFvQyxzQkFBc0IsR0FpRHpEOztBQUVEO0lBQXdDLDJDQUE2QjtJQUNuRSx5QkFBbUIsVUFBbUI7UUFBdEMsWUFBMEMsaUJBQU8sU0FBRztRQUFqQyxnQkFBVSxHQUFWLFVBQVUsQ0FBUzs7SUFBYSxDQUFDO0lBRXBELGdDQUFNLEdBQU4sVUFBTyxjQUE2QjtRQUNsQyxPQUFPLElBQUksV0FBVyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFDMUQsQ0FBQztJQUNILHNCQUFDO0FBQUQsQ0FBQyxBQU5ELENBQXdDLDBCQUEwQixHQU1qRSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJTkpFQ1RPUiwgSW5qZWN0b3J9IGZyb20gJy4uL2RpL2luamVjdG9yJztcbmltcG9ydCB7SW5qZWN0RmxhZ3N9IGZyb20gJy4uL2RpL2luamVjdG9yX2NvbXBhdGliaWxpdHknO1xuaW1wb3J0IHtTdGF0aWNQcm92aWRlcn0gZnJvbSAnLi4vZGkvcHJvdmlkZXInO1xuaW1wb3J0IHtjcmVhdGVJbmplY3Rvcn0gZnJvbSAnLi4vZGkvcjNfaW5qZWN0b3InO1xuaW1wb3J0IHtDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIgYXMgdmlld0VuZ2luZV9Db21wb25lbnRGYWN0b3J5UmVzb2x2ZXJ9IGZyb20gJy4uL2xpbmtlci9jb21wb25lbnRfZmFjdG9yeV9yZXNvbHZlcic7XG5pbXBvcnQge0ludGVybmFsTmdNb2R1bGVSZWYsIE5nTW9kdWxlRmFjdG9yeSBhcyB2aWV3RW5naW5lX05nTW9kdWxlRmFjdG9yeSwgTmdNb2R1bGVSZWYgYXMgdmlld0VuZ2luZV9OZ01vZHVsZVJlZn0gZnJvbSAnLi4vbGlua2VyL25nX21vZHVsZV9mYWN0b3J5JztcbmltcG9ydCB7TmdNb2R1bGVEZWZ9IGZyb20gJy4uL21ldGFkYXRhL25nX21vZHVsZSc7XG5pbXBvcnQge1R5cGV9IGZyb20gJy4uL3R5cGUnO1xuaW1wb3J0IHtzdHJpbmdpZnl9IGZyb20gJy4uL3V0aWwnO1xuXG5pbXBvcnQge2Fzc2VydERlZmluZWR9IGZyb20gJy4vYXNzZXJ0JztcbmltcG9ydCB7Q29tcG9uZW50RmFjdG9yeVJlc29sdmVyfSBmcm9tICcuL2NvbXBvbmVudF9yZWYnO1xuaW1wb3J0IHtnZXROZ01vZHVsZURlZn0gZnJvbSAnLi9kZWZpbml0aW9uJztcblxuZXhwb3J0IGludGVyZmFjZSBOZ01vZHVsZVR5cGU8VCA9IGFueT4gZXh0ZW5kcyBUeXBlPFQ+IHsgbmdNb2R1bGVEZWY6IE5nTW9kdWxlRGVmPFQ+OyB9XG5cbmNvbnN0IENPTVBPTkVOVF9GQUNUT1JZX1JFU09MVkVSOiBTdGF0aWNQcm92aWRlciA9IHtcbiAgcHJvdmlkZTogdmlld0VuZ2luZV9Db21wb25lbnRGYWN0b3J5UmVzb2x2ZXIsXG4gIHVzZUNsYXNzOiBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIsXG4gIGRlcHM6IFt2aWV3RW5naW5lX05nTW9kdWxlUmVmXSxcbn07XG5cbmV4cG9ydCBjbGFzcyBOZ01vZHVsZVJlZjxUPiBleHRlbmRzIHZpZXdFbmdpbmVfTmdNb2R1bGVSZWY8VD4gaW1wbGVtZW50cyBJbnRlcm5hbE5nTW9kdWxlUmVmPFQ+IHtcbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOnJlcXVpcmUtaW50ZXJuYWwtd2l0aC11bmRlcnNjb3JlXG4gIF9ib290c3RyYXBDb21wb25lbnRzOiBUeXBlPGFueT5bXSA9IFtdO1xuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6cmVxdWlyZS1pbnRlcm5hbC13aXRoLXVuZGVyc2NvcmVcbiAgX3IzSW5qZWN0b3I6IEluamVjdG9yO1xuICBpbmplY3RvcjogSW5qZWN0b3IgPSB0aGlzO1xuICBpbnN0YW5jZTogVDtcbiAgZGVzdHJveUNiczogKCgpID0+IHZvaWQpW118bnVsbCA9IFtdO1xuXG4gIGNvbnN0cnVjdG9yKG5nTW9kdWxlVHlwZTogVHlwZTxUPiwgcHVibGljIF9wYXJlbnQ6IEluamVjdG9yfG51bGwpIHtcbiAgICBzdXBlcigpO1xuICAgIGNvbnN0IG5nTW9kdWxlRGVmID0gZ2V0TmdNb2R1bGVEZWYobmdNb2R1bGVUeXBlKTtcbiAgICBuZ0Rldk1vZGUgJiYgYXNzZXJ0RGVmaW5lZChcbiAgICAgICAgICAgICAgICAgICAgIG5nTW9kdWxlRGVmLFxuICAgICAgICAgICAgICAgICAgICAgYE5nTW9kdWxlICcke3N0cmluZ2lmeShuZ01vZHVsZVR5cGUpfScgaXMgbm90IGEgc3VidHlwZSBvZiAnTmdNb2R1bGVUeXBlJy5gKTtcblxuICAgIHRoaXMuX2Jvb3RzdHJhcENvbXBvbmVudHMgPSBuZ01vZHVsZURlZiAhLmJvb3RzdHJhcDtcbiAgICBjb25zdCBhZGRpdGlvbmFsUHJvdmlkZXJzOiBTdGF0aWNQcm92aWRlcltdID0gW1xuICAgICAge1xuICAgICAgICBwcm92aWRlOiB2aWV3RW5naW5lX05nTW9kdWxlUmVmLFxuICAgICAgICB1c2VWYWx1ZTogdGhpcyxcbiAgICAgIH0sXG4gICAgICBDT01QT05FTlRfRkFDVE9SWV9SRVNPTFZFUlxuICAgIF07XG4gICAgdGhpcy5fcjNJbmplY3RvciA9IGNyZWF0ZUluamVjdG9yKG5nTW9kdWxlVHlwZSwgX3BhcmVudCwgYWRkaXRpb25hbFByb3ZpZGVycyk7XG4gICAgdGhpcy5pbnN0YW5jZSA9IHRoaXMuZ2V0KG5nTW9kdWxlVHlwZSk7XG4gIH1cblxuICBnZXQodG9rZW46IGFueSwgbm90Rm91bmRWYWx1ZTogYW55ID0gSW5qZWN0b3IuVEhST1dfSUZfTk9UX0ZPVU5ELFxuICAgICAgaW5qZWN0RmxhZ3M6IEluamVjdEZsYWdzID0gSW5qZWN0RmxhZ3MuRGVmYXVsdCk6IGFueSB7XG4gICAgaWYgKHRva2VuID09PSBJbmplY3RvciB8fCB0b2tlbiA9PT0gdmlld0VuZ2luZV9OZ01vZHVsZVJlZiB8fCB0b2tlbiA9PT0gSU5KRUNUT1IpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fcjNJbmplY3Rvci5nZXQodG9rZW4sIG5vdEZvdW5kVmFsdWUsIGluamVjdEZsYWdzKTtcbiAgfVxuXG4gIGdldCBjb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIoKTogdmlld0VuZ2luZV9Db21wb25lbnRGYWN0b3J5UmVzb2x2ZXIge1xuICAgIHJldHVybiB0aGlzLmdldCh2aWV3RW5naW5lX0NvbXBvbmVudEZhY3RvcnlSZXNvbHZlcik7XG4gIH1cblxuICBkZXN0cm95KCk6IHZvaWQge1xuICAgIG5nRGV2TW9kZSAmJiBhc3NlcnREZWZpbmVkKHRoaXMuZGVzdHJveUNicywgJ05nTW9kdWxlIGFscmVhZHkgZGVzdHJveWVkJyk7XG4gICAgdGhpcy5kZXN0cm95Q2JzICEuZm9yRWFjaChmbiA9PiBmbigpKTtcbiAgICB0aGlzLmRlc3Ryb3lDYnMgPSBudWxsO1xuICB9XG4gIG9uRGVzdHJveShjYWxsYmFjazogKCkgPT4gdm9pZCk6IHZvaWQge1xuICAgIG5nRGV2TW9kZSAmJiBhc3NlcnREZWZpbmVkKHRoaXMuZGVzdHJveUNicywgJ05nTW9kdWxlIGFscmVhZHkgZGVzdHJveWVkJyk7XG4gICAgdGhpcy5kZXN0cm95Q2JzICEucHVzaChjYWxsYmFjayk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIE5nTW9kdWxlRmFjdG9yeTxUPiBleHRlbmRzIHZpZXdFbmdpbmVfTmdNb2R1bGVGYWN0b3J5PFQ+IHtcbiAgY29uc3RydWN0b3IocHVibGljIG1vZHVsZVR5cGU6IFR5cGU8VD4pIHsgc3VwZXIoKTsgfVxuXG4gIGNyZWF0ZShwYXJlbnRJbmplY3RvcjogSW5qZWN0b3J8bnVsbCk6IHZpZXdFbmdpbmVfTmdNb2R1bGVSZWY8VD4ge1xuICAgIHJldHVybiBuZXcgTmdNb2R1bGVSZWYodGhpcy5tb2R1bGVUeXBlLCBwYXJlbnRJbmplY3Rvcik7XG4gIH1cbn1cbiJdfQ==