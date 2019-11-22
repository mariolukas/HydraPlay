/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler/src/injectable_compiler_2", ["require", "exports", "tslib", "@angular/compiler/src/identifiers", "@angular/compiler/src/output/output_ast", "@angular/compiler/src/render3/r3_factory", "@angular/compiler/src/render3/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var identifiers_1 = require("@angular/compiler/src/identifiers");
    var o = require("@angular/compiler/src/output/output_ast");
    var r3_factory_1 = require("@angular/compiler/src/render3/r3_factory");
    var util_1 = require("@angular/compiler/src/render3/util");
    function compileInjectable(meta) {
        var result = null;
        var factoryMeta = {
            name: meta.name,
            type: meta.type,
            deps: meta.ctorDeps,
            injectFn: identifiers_1.Identifiers.inject,
        };
        if (meta.useClass !== undefined) {
            // meta.useClass has two modes of operation. Either deps are specified, in which case `new` is
            // used to instantiate the class with dependencies injected, or deps are not specified and
            // the factory of the class is used to instantiate it.
            //
            // A special case exists for useClass: Type where Type is the injectable type itself, in which
            // case omitting deps just uses the constructor dependencies instead.
            var useClassOnSelf = meta.useClass.isEquivalent(meta.type);
            var deps = meta.userDeps || (useClassOnSelf && meta.ctorDeps) || undefined;
            if (deps !== undefined) {
                // factory: () => new meta.useClass(...deps)
                result = r3_factory_1.compileFactoryFunction(tslib_1.__assign({}, factoryMeta, { delegate: meta.useClass, delegateDeps: deps, delegateType: r3_factory_1.R3FactoryDelegateType.Class }));
            }
            else {
                result = r3_factory_1.compileFactoryFunction(tslib_1.__assign({}, factoryMeta, { delegate: meta.useClass, delegateType: r3_factory_1.R3FactoryDelegateType.Factory }));
            }
        }
        else if (meta.useFactory !== undefined) {
            result = r3_factory_1.compileFactoryFunction(tslib_1.__assign({}, factoryMeta, { delegate: meta.useFactory, delegateDeps: meta.userDeps || [], delegateType: r3_factory_1.R3FactoryDelegateType.Function }));
        }
        else if (meta.useValue !== undefined) {
            // Note: it's safe to use `meta.useValue` instead of the `USE_VALUE in meta` check used for
            // client code because meta.useValue is an Expression which will be defined even if the actual
            // value is undefined.
            result = r3_factory_1.compileFactoryFunction(tslib_1.__assign({}, factoryMeta, { expression: meta.useValue }));
        }
        else if (meta.useExisting !== undefined) {
            // useExisting is an `inject` call on the existing token.
            result = r3_factory_1.compileFactoryFunction(tslib_1.__assign({}, factoryMeta, { expression: o.importExpr(identifiers_1.Identifiers.inject).callFn([meta.useExisting]) }));
        }
        else {
            result = r3_factory_1.compileFactoryFunction(factoryMeta);
        }
        var token = meta.type;
        var providedIn = meta.providedIn;
        var expression = o.importExpr(identifiers_1.Identifiers.defineInjectable).callFn([util_1.mapToMapExpression({ token: token, factory: result.factory, providedIn: providedIn })]);
        var type = new o.ExpressionType(o.importExpr(identifiers_1.Identifiers.InjectableDef, [util_1.typeWithParameters(meta.type, meta.typeArgumentCount)]));
        return {
            expression: expression,
            type: type,
            statements: result.statements,
        };
    }
    exports.compileInjectable = compileInjectable;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5qZWN0YWJsZV9jb21waWxlcl8yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL2luamVjdGFibGVfY29tcGlsZXJfMi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFHSCxpRUFBMEM7SUFDMUMsMkRBQXlDO0lBQ3pDLHVFQUE0SDtJQUM1SCwyREFBc0U7SUFxQnRFLFNBQWdCLGlCQUFpQixDQUFDLElBQTBCO1FBQzFELElBQUksTUFBTSxHQUE0RCxJQUFJLENBQUM7UUFFM0UsSUFBTSxXQUFXLEdBQUc7WUFDbEIsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO1lBQ2YsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO1lBQ2YsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRO1lBQ25CLFFBQVEsRUFBRSx5QkFBVyxDQUFDLE1BQU07U0FDN0IsQ0FBQztRQUVGLElBQUksSUFBSSxDQUFDLFFBQVEsS0FBSyxTQUFTLEVBQUU7WUFDL0IsOEZBQThGO1lBQzlGLDBGQUEwRjtZQUMxRixzREFBc0Q7WUFDdEQsRUFBRTtZQUNGLDhGQUE4RjtZQUM5RixxRUFBcUU7WUFFckUsSUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzdELElBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLElBQUksQ0FBQyxjQUFjLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLFNBQVMsQ0FBQztZQUU3RSxJQUFJLElBQUksS0FBSyxTQUFTLEVBQUU7Z0JBQ3RCLDRDQUE0QztnQkFDNUMsTUFBTSxHQUFHLG1DQUFzQixzQkFDMUIsV0FBVyxJQUNkLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUN2QixZQUFZLEVBQUUsSUFBSSxFQUNsQixZQUFZLEVBQUUsa0NBQXFCLENBQUMsS0FBSyxJQUN6QyxDQUFDO2FBQ0o7aUJBQU07Z0JBQ0wsTUFBTSxHQUFHLG1DQUFzQixzQkFDMUIsV0FBVyxJQUNkLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUN2QixZQUFZLEVBQUUsa0NBQXFCLENBQUMsT0FBTyxJQUMzQyxDQUFDO2FBQ0o7U0FDRjthQUFNLElBQUksSUFBSSxDQUFDLFVBQVUsS0FBSyxTQUFTLEVBQUU7WUFDeEMsTUFBTSxHQUFHLG1DQUFzQixzQkFDMUIsV0FBVyxJQUNkLFFBQVEsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUN6QixZQUFZLEVBQUUsSUFBSSxDQUFDLFFBQVEsSUFBSSxFQUFFLEVBQ2pDLFlBQVksRUFBRSxrQ0FBcUIsQ0FBQyxRQUFRLElBQzVDLENBQUM7U0FDSjthQUFNLElBQUksSUFBSSxDQUFDLFFBQVEsS0FBSyxTQUFTLEVBQUU7WUFDdEMsMkZBQTJGO1lBQzNGLDhGQUE4RjtZQUM5RixzQkFBc0I7WUFDdEIsTUFBTSxHQUFHLG1DQUFzQixzQkFDMUIsV0FBVyxJQUNkLFVBQVUsRUFBRSxJQUFJLENBQUMsUUFBUSxJQUN6QixDQUFDO1NBQ0o7YUFBTSxJQUFJLElBQUksQ0FBQyxXQUFXLEtBQUssU0FBUyxFQUFFO1lBQ3pDLHlEQUF5RDtZQUN6RCxNQUFNLEdBQUcsbUNBQXNCLHNCQUMxQixXQUFXLElBQ2QsVUFBVSxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMseUJBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsSUFDdkUsQ0FBQztTQUNKO2FBQU07WUFDTCxNQUFNLEdBQUcsbUNBQXNCLENBQUMsV0FBVyxDQUFDLENBQUM7U0FDOUM7UUFFRCxJQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3hCLElBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7UUFFbkMsSUFBTSxVQUFVLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyx5QkFBVyxDQUFDLGdCQUFnQixDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMseUJBQWtCLENBQ3BGLEVBQUMsS0FBSyxPQUFBLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLEVBQUUsVUFBVSxZQUFBLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNwRCxJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FDMUMseUJBQVcsQ0FBQyxhQUFhLEVBQUUsQ0FBQyx5QkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRXpGLE9BQU87WUFDTCxVQUFVLFlBQUE7WUFDVixJQUFJLE1BQUE7WUFDSixVQUFVLEVBQUUsTUFBTSxDQUFDLFVBQVU7U0FDOUIsQ0FBQztJQUNKLENBQUM7SUExRUQsOENBMEVDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdEZsYWdzfSBmcm9tICcuL2NvcmUnO1xuaW1wb3J0IHtJZGVudGlmaWVyc30gZnJvbSAnLi9pZGVudGlmaWVycyc7XG5pbXBvcnQgKiBhcyBvIGZyb20gJy4vb3V0cHV0L291dHB1dF9hc3QnO1xuaW1wb3J0IHtSM0RlcGVuZGVuY3lNZXRhZGF0YSwgUjNGYWN0b3J5RGVsZWdhdGVUeXBlLCBSM0ZhY3RvcnlNZXRhZGF0YSwgY29tcGlsZUZhY3RvcnlGdW5jdGlvbn0gZnJvbSAnLi9yZW5kZXIzL3IzX2ZhY3RvcnknO1xuaW1wb3J0IHttYXBUb01hcEV4cHJlc3Npb24sIHR5cGVXaXRoUGFyYW1ldGVyc30gZnJvbSAnLi9yZW5kZXIzL3V0aWwnO1xuXG5leHBvcnQgaW50ZXJmYWNlIEluamVjdGFibGVEZWYge1xuICBleHByZXNzaW9uOiBvLkV4cHJlc3Npb247XG4gIHR5cGU6IG8uVHlwZTtcbiAgc3RhdGVtZW50czogby5TdGF0ZW1lbnRbXTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSM0luamVjdGFibGVNZXRhZGF0YSB7XG4gIG5hbWU6IHN0cmluZztcbiAgdHlwZTogby5FeHByZXNzaW9uO1xuICB0eXBlQXJndW1lbnRDb3VudDogbnVtYmVyO1xuICBjdG9yRGVwczogUjNEZXBlbmRlbmN5TWV0YWRhdGFbXXxudWxsO1xuICBwcm92aWRlZEluOiBvLkV4cHJlc3Npb247XG4gIHVzZUNsYXNzPzogby5FeHByZXNzaW9uO1xuICB1c2VGYWN0b3J5Pzogby5FeHByZXNzaW9uO1xuICB1c2VFeGlzdGluZz86IG8uRXhwcmVzc2lvbjtcbiAgdXNlVmFsdWU/OiBvLkV4cHJlc3Npb247XG4gIHVzZXJEZXBzPzogUjNEZXBlbmRlbmN5TWV0YWRhdGFbXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbXBpbGVJbmplY3RhYmxlKG1ldGE6IFIzSW5qZWN0YWJsZU1ldGFkYXRhKTogSW5qZWN0YWJsZURlZiB7XG4gIGxldCByZXN1bHQ6IHtmYWN0b3J5OiBvLkV4cHJlc3Npb24sIHN0YXRlbWVudHM6IG8uU3RhdGVtZW50W119fG51bGwgPSBudWxsO1xuXG4gIGNvbnN0IGZhY3RvcnlNZXRhID0ge1xuICAgIG5hbWU6IG1ldGEubmFtZSxcbiAgICB0eXBlOiBtZXRhLnR5cGUsXG4gICAgZGVwczogbWV0YS5jdG9yRGVwcyxcbiAgICBpbmplY3RGbjogSWRlbnRpZmllcnMuaW5qZWN0LFxuICB9O1xuXG4gIGlmIChtZXRhLnVzZUNsYXNzICE9PSB1bmRlZmluZWQpIHtcbiAgICAvLyBtZXRhLnVzZUNsYXNzIGhhcyB0d28gbW9kZXMgb2Ygb3BlcmF0aW9uLiBFaXRoZXIgZGVwcyBhcmUgc3BlY2lmaWVkLCBpbiB3aGljaCBjYXNlIGBuZXdgIGlzXG4gICAgLy8gdXNlZCB0byBpbnN0YW50aWF0ZSB0aGUgY2xhc3Mgd2l0aCBkZXBlbmRlbmNpZXMgaW5qZWN0ZWQsIG9yIGRlcHMgYXJlIG5vdCBzcGVjaWZpZWQgYW5kXG4gICAgLy8gdGhlIGZhY3Rvcnkgb2YgdGhlIGNsYXNzIGlzIHVzZWQgdG8gaW5zdGFudGlhdGUgaXQuXG4gICAgLy9cbiAgICAvLyBBIHNwZWNpYWwgY2FzZSBleGlzdHMgZm9yIHVzZUNsYXNzOiBUeXBlIHdoZXJlIFR5cGUgaXMgdGhlIGluamVjdGFibGUgdHlwZSBpdHNlbGYsIGluIHdoaWNoXG4gICAgLy8gY2FzZSBvbWl0dGluZyBkZXBzIGp1c3QgdXNlcyB0aGUgY29uc3RydWN0b3IgZGVwZW5kZW5jaWVzIGluc3RlYWQuXG5cbiAgICBjb25zdCB1c2VDbGFzc09uU2VsZiA9IG1ldGEudXNlQ2xhc3MuaXNFcXVpdmFsZW50KG1ldGEudHlwZSk7XG4gICAgY29uc3QgZGVwcyA9IG1ldGEudXNlckRlcHMgfHwgKHVzZUNsYXNzT25TZWxmICYmIG1ldGEuY3RvckRlcHMpIHx8IHVuZGVmaW5lZDtcblxuICAgIGlmIChkZXBzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIGZhY3Rvcnk6ICgpID0+IG5ldyBtZXRhLnVzZUNsYXNzKC4uLmRlcHMpXG4gICAgICByZXN1bHQgPSBjb21waWxlRmFjdG9yeUZ1bmN0aW9uKHtcbiAgICAgICAgLi4uZmFjdG9yeU1ldGEsXG4gICAgICAgIGRlbGVnYXRlOiBtZXRhLnVzZUNsYXNzLFxuICAgICAgICBkZWxlZ2F0ZURlcHM6IGRlcHMsXG4gICAgICAgIGRlbGVnYXRlVHlwZTogUjNGYWN0b3J5RGVsZWdhdGVUeXBlLkNsYXNzLFxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdCA9IGNvbXBpbGVGYWN0b3J5RnVuY3Rpb24oe1xuICAgICAgICAuLi5mYWN0b3J5TWV0YSxcbiAgICAgICAgZGVsZWdhdGU6IG1ldGEudXNlQ2xhc3MsXG4gICAgICAgIGRlbGVnYXRlVHlwZTogUjNGYWN0b3J5RGVsZWdhdGVUeXBlLkZhY3RvcnksXG4gICAgICB9KTtcbiAgICB9XG4gIH0gZWxzZSBpZiAobWV0YS51c2VGYWN0b3J5ICE9PSB1bmRlZmluZWQpIHtcbiAgICByZXN1bHQgPSBjb21waWxlRmFjdG9yeUZ1bmN0aW9uKHtcbiAgICAgIC4uLmZhY3RvcnlNZXRhLFxuICAgICAgZGVsZWdhdGU6IG1ldGEudXNlRmFjdG9yeSxcbiAgICAgIGRlbGVnYXRlRGVwczogbWV0YS51c2VyRGVwcyB8fCBbXSxcbiAgICAgIGRlbGVnYXRlVHlwZTogUjNGYWN0b3J5RGVsZWdhdGVUeXBlLkZ1bmN0aW9uLFxuICAgIH0pO1xuICB9IGVsc2UgaWYgKG1ldGEudXNlVmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgIC8vIE5vdGU6IGl0J3Mgc2FmZSB0byB1c2UgYG1ldGEudXNlVmFsdWVgIGluc3RlYWQgb2YgdGhlIGBVU0VfVkFMVUUgaW4gbWV0YWAgY2hlY2sgdXNlZCBmb3JcbiAgICAvLyBjbGllbnQgY29kZSBiZWNhdXNlIG1ldGEudXNlVmFsdWUgaXMgYW4gRXhwcmVzc2lvbiB3aGljaCB3aWxsIGJlIGRlZmluZWQgZXZlbiBpZiB0aGUgYWN0dWFsXG4gICAgLy8gdmFsdWUgaXMgdW5kZWZpbmVkLlxuICAgIHJlc3VsdCA9IGNvbXBpbGVGYWN0b3J5RnVuY3Rpb24oe1xuICAgICAgLi4uZmFjdG9yeU1ldGEsXG4gICAgICBleHByZXNzaW9uOiBtZXRhLnVzZVZhbHVlLFxuICAgIH0pO1xuICB9IGVsc2UgaWYgKG1ldGEudXNlRXhpc3RpbmcgIT09IHVuZGVmaW5lZCkge1xuICAgIC8vIHVzZUV4aXN0aW5nIGlzIGFuIGBpbmplY3RgIGNhbGwgb24gdGhlIGV4aXN0aW5nIHRva2VuLlxuICAgIHJlc3VsdCA9IGNvbXBpbGVGYWN0b3J5RnVuY3Rpb24oe1xuICAgICAgLi4uZmFjdG9yeU1ldGEsXG4gICAgICBleHByZXNzaW9uOiBvLmltcG9ydEV4cHIoSWRlbnRpZmllcnMuaW5qZWN0KS5jYWxsRm4oW21ldGEudXNlRXhpc3RpbmddKSxcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICByZXN1bHQgPSBjb21waWxlRmFjdG9yeUZ1bmN0aW9uKGZhY3RvcnlNZXRhKTtcbiAgfVxuXG4gIGNvbnN0IHRva2VuID0gbWV0YS50eXBlO1xuICBjb25zdCBwcm92aWRlZEluID0gbWV0YS5wcm92aWRlZEluO1xuXG4gIGNvbnN0IGV4cHJlc3Npb24gPSBvLmltcG9ydEV4cHIoSWRlbnRpZmllcnMuZGVmaW5lSW5qZWN0YWJsZSkuY2FsbEZuKFttYXBUb01hcEV4cHJlc3Npb24oXG4gICAgICB7dG9rZW4sIGZhY3Rvcnk6IHJlc3VsdC5mYWN0b3J5LCBwcm92aWRlZElufSldKTtcbiAgY29uc3QgdHlwZSA9IG5ldyBvLkV4cHJlc3Npb25UeXBlKG8uaW1wb3J0RXhwcihcbiAgICAgIElkZW50aWZpZXJzLkluamVjdGFibGVEZWYsIFt0eXBlV2l0aFBhcmFtZXRlcnMobWV0YS50eXBlLCBtZXRhLnR5cGVBcmd1bWVudENvdW50KV0pKTtcblxuICByZXR1cm4ge1xuICAgIGV4cHJlc3Npb24sXG4gICAgdHlwZSxcbiAgICBzdGF0ZW1lbnRzOiByZXN1bHQuc3RhdGVtZW50cyxcbiAgfTtcbn1cbiJdfQ==