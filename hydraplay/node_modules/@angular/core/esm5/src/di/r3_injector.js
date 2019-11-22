/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { stringify } from '../util';
import { getInjectableDef, getInjectorDef } from './defs';
import { resolveForwardRef } from './forward_ref';
import { InjectionToken } from './injection_token';
import { INJECTOR, NullInjector, THROW_IF_NOT_FOUND, USE_VALUE } from './injector';
import { InjectFlags, inject, injectArgs, setCurrentInjector } from './injector_compatibility';
import { APP_ROOT } from './scope';
/**
 * Marker which indicates that a value has not yet been created from the factory function.
 */
var NOT_YET = {};
/**
 * Marker which indicates that the factory function for a token is in the process of being called.
 *
 * If the injector is asked to inject a token with its value set to CIRCULAR, that indicates
 * injection of a dependency has recursively attempted to inject the original token, and there is
 * a circular dependency among the providers.
 */
var CIRCULAR = {};
var EMPTY_ARRAY = [];
/**
 * A lazily initialized NullInjector.
 */
var NULL_INJECTOR = undefined;
function getNullInjector() {
    if (NULL_INJECTOR === undefined) {
        NULL_INJECTOR = new NullInjector();
    }
    return NULL_INJECTOR;
}
/**
 * Create a new `Injector` which is configured using a `defType` of `InjectorType<any>`s.
 *
 * @publicApi
 */
export function createInjector(defType, parent, additionalProviders) {
    if (parent === void 0) { parent = null; }
    if (additionalProviders === void 0) { additionalProviders = null; }
    parent = parent || getNullInjector();
    return new R3Injector(defType, additionalProviders, parent);
}
var R3Injector = /** @class */ (function () {
    function R3Injector(def, additionalProviders, parent) {
        var _this = this;
        this.parent = parent;
        /**
         * Map of tokens to records which contain the instances of those tokens.
         */
        this.records = new Map();
        /**
         * The transitive set of `InjectorType`s which define this injector.
         */
        this.injectorDefTypes = new Set();
        /**
         * Set of values instantiated by this injector which contain `ngOnDestroy` lifecycle hooks.
         */
        this.onDestroy = new Set();
        /**
         * Flag indicating that this injector was previously destroyed.
         */
        this.destroyed = false;
        // Start off by creating Records for every provider declared in every InjectorType
        // included transitively in `def`.
        var dedupStack = [];
        deepForEach([def], function (injectorDef) { return _this.processInjectorType(injectorDef, [], dedupStack); });
        additionalProviders && deepForEach(additionalProviders, function (provider) { return _this.processProvider(provider, def, additionalProviders); });
        // Make sure the INJECTOR token provides this injector.
        this.records.set(INJECTOR, makeRecord(undefined, this));
        // Detect whether this injector has the APP_ROOT_SCOPE token and thus should provide
        // any injectable scoped to APP_ROOT_SCOPE.
        this.isRootInjector = this.records.has(APP_ROOT);
        // Eagerly instantiate the InjectorType classes themselves.
        this.injectorDefTypes.forEach(function (defType) { return _this.get(defType); });
    }
    /**
     * Destroy the injector and release references to every instance or provider associated with it.
     *
     * Also calls the `OnDestroy` lifecycle hooks of every instance that was created for which a
     * hook was found.
     */
    R3Injector.prototype.destroy = function () {
        this.assertNotDestroyed();
        // Set destroyed = true first, in case lifecycle hooks re-enter destroy().
        this.destroyed = true;
        try {
            // Call all the lifecycle hooks.
            this.onDestroy.forEach(function (service) { return service.ngOnDestroy(); });
        }
        finally {
            // Release all references.
            this.records.clear();
            this.onDestroy.clear();
            this.injectorDefTypes.clear();
        }
    };
    R3Injector.prototype.get = function (token, notFoundValue, flags) {
        if (notFoundValue === void 0) { notFoundValue = THROW_IF_NOT_FOUND; }
        if (flags === void 0) { flags = InjectFlags.Default; }
        this.assertNotDestroyed();
        // Set the injection context.
        var previousInjector = setCurrentInjector(this);
        try {
            // Check for the SkipSelf flag.
            if (!(flags & InjectFlags.SkipSelf)) {
                // SkipSelf isn't set, check if the record belongs to this injector.
                var record = this.records.get(token);
                if (record === undefined) {
                    // No record, but maybe the token is scoped to this injector. Look for an ngInjectableDef
                    // with a scope matching this injector.
                    var def = couldBeInjectableType(token) && getInjectableDef(token);
                    if (def && this.injectableDefInScope(def)) {
                        // Found an ngInjectableDef and it's scoped to this injector. Pretend as if it was here
                        // all along.
                        record = makeRecord(injectableDefOrInjectorDefFactory(token), NOT_YET);
                        this.records.set(token, record);
                    }
                }
                // If a record was found, get the instance for it and return it.
                if (record !== undefined) {
                    return this.hydrate(token, record);
                }
            }
            // Select the next injector based on the Self flag - if self is set, the next injector is
            // the NullInjector, otherwise it's the parent.
            var nextInjector = !(flags & InjectFlags.Self) ? this.parent : getNullInjector();
            return nextInjector.get(token, notFoundValue);
        }
        finally {
            // Lastly, clean up the state by restoring the previous injector.
            setCurrentInjector(previousInjector);
        }
    };
    R3Injector.prototype.assertNotDestroyed = function () {
        if (this.destroyed) {
            throw new Error('Injector has already been destroyed.');
        }
    };
    /**
     * Add an `InjectorType` or `InjectorDefTypeWithProviders` and all of its transitive providers
     * to this injector.
     */
    R3Injector.prototype.processInjectorType = function (defOrWrappedDef, parents, dedupStack) {
        var _this = this;
        defOrWrappedDef = resolveForwardRef(defOrWrappedDef);
        if (!defOrWrappedDef)
            return;
        // Either the defOrWrappedDef is an InjectorType (with ngInjectorDef) or an
        // InjectorDefTypeWithProviders (aka ModuleWithProviders). Detecting either is a megamorphic
        // read, so care is taken to only do the read once.
        // First attempt to read the ngInjectorDef.
        var def = getInjectorDef(defOrWrappedDef);
        // If that's not present, then attempt to read ngModule from the InjectorDefTypeWithProviders.
        var ngModule = (def == null) && defOrWrappedDef.ngModule || undefined;
        // Determine the InjectorType. In the case where `defOrWrappedDef` is an `InjectorType`,
        // then this is easy. In the case of an InjectorDefTypeWithProviders, then the definition type
        // is the `ngModule`.
        var defType = (ngModule === undefined) ? defOrWrappedDef : ngModule;
        // Check for circular dependencies.
        if (ngDevMode && parents.indexOf(defType) !== -1) {
            var defName = stringify(defType);
            throw new Error("Circular dependency in DI detected for type " + defName + ". Dependency path: " + parents.map(function (defType) { return stringify(defType); }).join(' > ') + " > " + defName + ".");
        }
        // Check for multiple imports of the same module
        var isDuplicate = dedupStack.indexOf(defType) !== -1;
        // If defOrWrappedType was an InjectorDefTypeWithProviders, then .providers may hold some
        // extra providers.
        var providers = (ngModule !== undefined) && defOrWrappedDef.providers ||
            EMPTY_ARRAY;
        // Finally, if defOrWrappedType was an `InjectorDefTypeWithProviders`, then the actual
        // `InjectorDef` is on its `ngModule`.
        if (ngModule !== undefined) {
            def = getInjectorDef(ngModule);
        }
        // If no definition was found, it might be from exports. Remove it.
        if (def == null) {
            return;
        }
        // Track the InjectorType and add a provider for it.
        this.injectorDefTypes.add(defType);
        this.records.set(defType, makeRecord(def.factory, NOT_YET));
        // Add providers in the same way that @NgModule resolution did:
        // First, include providers from any imports.
        if (def.imports != null && !isDuplicate) {
            // Before processing defType's imports, add it to the set of parents. This way, if it ends
            // up deeply importing itself, this can be detected.
            ngDevMode && parents.push(defType);
            // Add it to the set of dedups. This way we can detect multiple imports of the same module
            dedupStack.push(defType);
            try {
                deepForEach(def.imports, function (imported) { return _this.processInjectorType(imported, parents, dedupStack); });
            }
            finally {
                // Remove it from the parents set when finished.
                ngDevMode && parents.pop();
            }
        }
        // Next, include providers listed on the definition itself.
        var defProviders = def.providers;
        if (defProviders != null && !isDuplicate) {
            var injectorType_1 = defOrWrappedDef;
            deepForEach(defProviders, function (provider) { return _this.processProvider(provider, injectorType_1, defProviders); });
        }
        // Finally, include providers from an InjectorDefTypeWithProviders if there was one.
        var ngModuleType = defOrWrappedDef.ngModule;
        deepForEach(providers, function (provider) { return _this.processProvider(provider, ngModuleType, providers); });
    };
    /**
     * Process a `SingleProvider` and add it.
     */
    R3Injector.prototype.processProvider = function (provider, ngModuleType, providers) {
        // Determine the token from the provider. Either it's its own token, or has a {provide: ...}
        // property.
        provider = resolveForwardRef(provider);
        var token = isTypeProvider(provider) ? provider : resolveForwardRef(provider && provider.provide);
        // Construct a `Record` for the provider.
        var record = providerToRecord(provider, ngModuleType, providers);
        if (!isTypeProvider(provider) && provider.multi === true) {
            // If the provider indicates that it's a multi-provider, process it specially.
            // First check whether it's been defined already.
            var multiRecord_1 = this.records.get(token);
            if (multiRecord_1) {
                // It has. Throw a nice error if
                if (multiRecord_1.multi === undefined) {
                    throw new Error("Mixed multi-provider for " + token + ".");
                }
            }
            else {
                multiRecord_1 = makeRecord(undefined, NOT_YET, true);
                multiRecord_1.factory = function () { return injectArgs(multiRecord_1.multi); };
                this.records.set(token, multiRecord_1);
            }
            token = provider;
            multiRecord_1.multi.push(provider);
        }
        else {
            var existing = this.records.get(token);
            if (existing && existing.multi !== undefined) {
                throw new Error("Mixed multi-provider for " + stringify(token));
            }
        }
        this.records.set(token, record);
    };
    R3Injector.prototype.hydrate = function (token, record) {
        if (record.value === CIRCULAR) {
            throw new Error("Cannot instantiate cyclic dependency! " + stringify(token));
        }
        else if (record.value === NOT_YET) {
            record.value = CIRCULAR;
            record.value = record.factory();
        }
        if (typeof record.value === 'object' && record.value && hasOnDestroy(record.value)) {
            this.onDestroy.add(record.value);
        }
        return record.value;
    };
    R3Injector.prototype.injectableDefInScope = function (def) {
        if (!def.providedIn) {
            return false;
        }
        else if (typeof def.providedIn === 'string') {
            return def.providedIn === 'any' || (def.providedIn === 'root' && this.isRootInjector);
        }
        else {
            return this.injectorDefTypes.has(def.providedIn);
        }
    };
    return R3Injector;
}());
export { R3Injector };
function injectableDefOrInjectorDefFactory(token) {
    var injectableDef = getInjectableDef(token);
    if (injectableDef === null) {
        var injectorDef = getInjectorDef(token);
        if (injectorDef !== null) {
            return injectorDef.factory;
        }
        else if (token instanceof InjectionToken) {
            throw new Error("Token " + stringify(token) + " is missing an ngInjectableDef definition.");
        }
        else if (token instanceof Function) {
            var paramLength = token.length;
            if (paramLength > 0) {
                var args = new Array(paramLength).fill('?');
                throw new Error("Can't resolve all parameters for " + stringify(token) + ": (" + args.join(', ') + ").");
            }
            return function () { return new token(); };
        }
        throw new Error('unreachable');
    }
    return injectableDef.factory;
}
function providerToRecord(provider, ngModuleType, providers) {
    var factory = providerToFactory(provider, ngModuleType, providers);
    if (isValueProvider(provider)) {
        return makeRecord(undefined, provider.useValue);
    }
    else {
        return makeRecord(factory, NOT_YET);
    }
}
/**
 * Converts a `SingleProvider` into a factory function.
 *
 * @param provider provider to convert to factory
 */
export function providerToFactory(provider, ngModuleType, providers) {
    var factory = undefined;
    if (isTypeProvider(provider)) {
        return injectableDefOrInjectorDefFactory(resolveForwardRef(provider));
    }
    else {
        if (isValueProvider(provider)) {
            factory = function () { return resolveForwardRef(provider.useValue); };
        }
        else if (isExistingProvider(provider)) {
            factory = function () { return inject(resolveForwardRef(provider.useExisting)); };
        }
        else if (isFactoryProvider(provider)) {
            factory = function () { return provider.useFactory.apply(provider, tslib_1.__spread(injectArgs(provider.deps || []))); };
        }
        else {
            var classRef_1 = resolveForwardRef(provider &&
                (provider.useClass || provider.provide));
            if (!classRef_1) {
                var ngModuleDetail = '';
                if (ngModuleType && providers) {
                    var providerDetail = providers.map(function (v) { return v == provider ? '?' + provider + '?' : '...'; });
                    ngModuleDetail =
                        " - only instances of Provider and Type are allowed, got: [" + providerDetail.join(', ') + "]";
                }
                throw new Error("Invalid provider for the NgModule '" + stringify(ngModuleType) + "'" + ngModuleDetail);
            }
            if (hasDeps(provider)) {
                factory = function () { return new ((classRef_1).bind.apply((classRef_1), tslib_1.__spread([void 0], injectArgs(provider.deps))))(); };
            }
            else {
                return injectableDefOrInjectorDefFactory(classRef_1);
            }
        }
    }
    return factory;
}
function makeRecord(factory, value, multi) {
    if (multi === void 0) { multi = false; }
    return {
        factory: factory,
        value: value,
        multi: multi ? [] : undefined,
    };
}
function deepForEach(input, fn) {
    input.forEach(function (value) { return Array.isArray(value) ? deepForEach(value, fn) : fn(value); });
}
function isValueProvider(value) {
    return value && typeof value == 'object' && USE_VALUE in value;
}
function isExistingProvider(value) {
    return !!(value && value.useExisting);
}
function isFactoryProvider(value) {
    return !!(value && value.useFactory);
}
export function isTypeProvider(value) {
    return typeof value === 'function';
}
function hasDeps(value) {
    return !!value.deps;
}
function hasOnDestroy(value) {
    return typeof value === 'object' && value != null && value.ngOnDestroy &&
        typeof value.ngOnDestroy === 'function';
}
function couldBeInjectableType(value) {
    return (typeof value === 'function') ||
        (typeof value === 'object' && value instanceof InjectionToken);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicjNfaW5qZWN0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9kaS9yM19pbmplY3Rvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBSUgsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLFNBQVMsQ0FBQztBQUVsQyxPQUFPLEVBQXlFLGdCQUFnQixFQUFFLGNBQWMsRUFBQyxNQUFNLFFBQVEsQ0FBQztBQUNoSSxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDaEQsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ2pELE9BQU8sRUFBQyxRQUFRLEVBQVksWUFBWSxFQUFFLGtCQUFrQixFQUFFLFNBQVMsRUFBQyxNQUFNLFlBQVksQ0FBQztBQUMzRixPQUFPLEVBQUMsV0FBVyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsa0JBQWtCLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUU3RixPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sU0FBUyxDQUFDO0FBVWpDOztHQUVHO0FBQ0gsSUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDO0FBRW5COzs7Ozs7R0FNRztBQUNILElBQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQztBQUVwQixJQUFNLFdBQVcsR0FBRyxFQUFXLENBQUM7QUFFaEM7O0dBRUc7QUFDSCxJQUFJLGFBQWEsR0FBdUIsU0FBUyxDQUFDO0FBRWxELFNBQVMsZUFBZTtJQUN0QixJQUFJLGFBQWEsS0FBSyxTQUFTLEVBQUU7UUFDL0IsYUFBYSxHQUFHLElBQUksWUFBWSxFQUFFLENBQUM7S0FDcEM7SUFDRCxPQUFPLGFBQWEsQ0FBQztBQUN2QixDQUFDO0FBWUQ7Ozs7R0FJRztBQUNILE1BQU0sVUFBVSxjQUFjLENBQzFCLE9BQW9DLEVBQUUsTUFBOEIsRUFDcEUsbUJBQW1EO0lBRGIsdUJBQUEsRUFBQSxhQUE4QjtJQUNwRSxvQ0FBQSxFQUFBLDBCQUFtRDtJQUNyRCxNQUFNLEdBQUcsTUFBTSxJQUFJLGVBQWUsRUFBRSxDQUFDO0lBQ3JDLE9BQU8sSUFBSSxVQUFVLENBQUMsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQzlELENBQUM7QUFFRDtJQTJCRSxvQkFDSSxHQUFzQixFQUFFLG1CQUEwQyxFQUN6RCxNQUFnQjtRQUY3QixpQkFzQkM7UUFwQlksV0FBTSxHQUFOLE1BQU0sQ0FBVTtRQTVCN0I7O1dBRUc7UUFDSyxZQUFPLEdBQUcsSUFBSSxHQUFHLEVBQThDLENBQUM7UUFFeEU7O1dBRUc7UUFDSyxxQkFBZ0IsR0FBRyxJQUFJLEdBQUcsRUFBcUIsQ0FBQztRQUV4RDs7V0FFRztRQUNLLGNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBYSxDQUFDO1FBUXpDOztXQUVHO1FBQ0ssY0FBUyxHQUFHLEtBQUssQ0FBQztRQUt4QixrRkFBa0Y7UUFDbEYsa0NBQWtDO1FBQ2xDLElBQU0sVUFBVSxHQUF3QixFQUFFLENBQUM7UUFDM0MsV0FBVyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsVUFBQSxXQUFXLElBQUksT0FBQSxLQUFJLENBQUMsbUJBQW1CLENBQUMsV0FBVyxFQUFFLEVBQUUsRUFBRSxVQUFVLENBQUMsRUFBckQsQ0FBcUQsQ0FBQyxDQUFDO1FBRXpGLG1CQUFtQixJQUFJLFdBQVcsQ0FDUCxtQkFBbUIsRUFBRSxVQUFBLFFBQVEsSUFBSSxPQUFBLEtBQUksQ0FBQyxlQUFlLENBQzVCLFFBQVEsRUFBRSxHQUFHLEVBQUUsbUJBQW1CLENBQUMsRUFEM0IsQ0FDMkIsQ0FBQyxDQUFDO1FBR3pGLHVEQUF1RDtRQUN2RCxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBRXhELG9GQUFvRjtRQUNwRiwyQ0FBMkM7UUFDM0MsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUVqRCwyREFBMkQ7UUFDM0QsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxVQUFBLE9BQU8sSUFBSSxPQUFBLEtBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQWpCLENBQWlCLENBQUMsQ0FBQztJQUM5RCxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCw0QkFBTyxHQUFQO1FBQ0UsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFFMUIsMEVBQTBFO1FBQzFFLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1FBQ3RCLElBQUk7WUFDRixnQ0FBZ0M7WUFDaEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsVUFBQSxPQUFPLElBQUksT0FBQSxPQUFPLENBQUMsV0FBVyxFQUFFLEVBQXJCLENBQXFCLENBQUMsQ0FBQztTQUMxRDtnQkFBUztZQUNSLDBCQUEwQjtZQUMxQixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ3JCLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDdkIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssRUFBRSxDQUFDO1NBQy9CO0lBQ0gsQ0FBQztJQUVELHdCQUFHLEdBQUgsVUFDSSxLQUFnQyxFQUFFLGFBQXVDLEVBQ3pFLEtBQTJCO1FBRE8sOEJBQUEsRUFBQSxrQ0FBdUM7UUFDekUsc0JBQUEsRUFBQSxRQUFRLFdBQVcsQ0FBQyxPQUFPO1FBQzdCLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQzFCLDZCQUE2QjtRQUM3QixJQUFNLGdCQUFnQixHQUFHLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xELElBQUk7WUFDRiwrQkFBK0I7WUFDL0IsSUFBSSxDQUFDLENBQUMsS0FBSyxHQUFHLFdBQVcsQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDbkMsb0VBQW9FO2dCQUNwRSxJQUFJLE1BQU0sR0FBd0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzFELElBQUksTUFBTSxLQUFLLFNBQVMsRUFBRTtvQkFDeEIseUZBQXlGO29CQUN6Rix1Q0FBdUM7b0JBQ3ZDLElBQU0sR0FBRyxHQUFHLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxJQUFJLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUNwRSxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLEVBQUU7d0JBQ3pDLHVGQUF1Rjt3QkFDdkYsYUFBYTt3QkFDYixNQUFNLEdBQUcsVUFBVSxDQUFDLGlDQUFpQyxDQUFDLEtBQUssQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO3dCQUN2RSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7cUJBQ2pDO2lCQUNGO2dCQUNELGdFQUFnRTtnQkFDaEUsSUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFO29CQUN4QixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO2lCQUNwQzthQUNGO1lBRUQseUZBQXlGO1lBQ3pGLCtDQUErQztZQUMvQyxJQUFNLFlBQVksR0FBRyxDQUFDLENBQUMsS0FBSyxHQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsZUFBZSxFQUFFLENBQUM7WUFDbkYsT0FBTyxZQUFZLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxhQUFhLENBQUMsQ0FBQztTQUMvQztnQkFBUztZQUNSLGlFQUFpRTtZQUNqRSxrQkFBa0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1NBQ3RDO0lBQ0gsQ0FBQztJQUVPLHVDQUFrQixHQUExQjtRQUNFLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNsQixNQUFNLElBQUksS0FBSyxDQUFDLHNDQUFzQyxDQUFDLENBQUM7U0FDekQ7SUFDSCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0ssd0NBQW1CLEdBQTNCLFVBQ0ksZUFBaUUsRUFDakUsT0FBNEIsRUFBRSxVQUErQjtRQUZqRSxpQkFvRkM7UUFqRkMsZUFBZSxHQUFHLGlCQUFpQixDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ3JELElBQUksQ0FBQyxlQUFlO1lBQUUsT0FBTztRQUU3QiwyRUFBMkU7UUFDM0UsNEZBQTRGO1FBQzVGLG1EQUFtRDtRQUVuRCwyQ0FBMkM7UUFDM0MsSUFBSSxHQUFHLEdBQUcsY0FBYyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBRTFDLDhGQUE4RjtRQUM5RixJQUFNLFFBQVEsR0FDVixDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsSUFBSyxlQUFrRCxDQUFDLFFBQVEsSUFBSSxTQUFTLENBQUM7UUFFL0Ysd0ZBQXdGO1FBQ3hGLDhGQUE4RjtRQUM5RixxQkFBcUI7UUFDckIsSUFBTSxPQUFPLEdBQ1QsQ0FBQyxRQUFRLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFFLGVBQXFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztRQUVqRixtQ0FBbUM7UUFDbkMsSUFBSSxTQUFTLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtZQUNoRCxJQUFNLE9BQU8sR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDbkMsTUFBTSxJQUFJLEtBQUssQ0FDWCxpREFBK0MsT0FBTywyQkFBc0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFBLE9BQU8sSUFBSSxPQUFBLFNBQVMsQ0FBQyxPQUFPLENBQUMsRUFBbEIsQ0FBa0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBTSxPQUFPLE1BQUcsQ0FBQyxDQUFDO1NBQ3pKO1FBRUQsZ0RBQWdEO1FBQ2hELElBQU0sV0FBVyxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFFdkQseUZBQXlGO1FBQ3pGLG1CQUFtQjtRQUNuQixJQUFNLFNBQVMsR0FDWCxDQUFDLFFBQVEsS0FBSyxTQUFTLENBQUMsSUFBSyxlQUFrRCxDQUFDLFNBQVM7WUFDekYsV0FBVyxDQUFDO1FBRWhCLHNGQUFzRjtRQUN0RixzQ0FBc0M7UUFDdEMsSUFBSSxRQUFRLEtBQUssU0FBUyxFQUFFO1lBQzFCLEdBQUcsR0FBRyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDaEM7UUFFRCxtRUFBbUU7UUFDbkUsSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFO1lBQ2YsT0FBTztTQUNSO1FBRUQsb0RBQW9EO1FBQ3BELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDbkMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFFNUQsK0RBQStEO1FBRS9ELDZDQUE2QztRQUM3QyxJQUFJLEdBQUcsQ0FBQyxPQUFPLElBQUksSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ3ZDLDBGQUEwRjtZQUMxRixvREFBb0Q7WUFDcEQsU0FBUyxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDbkMsMEZBQTBGO1lBQzFGLFVBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFekIsSUFBSTtnQkFDRixXQUFXLENBQ1AsR0FBRyxDQUFDLE9BQU8sRUFBRSxVQUFBLFFBQVEsSUFBSSxPQUFBLEtBQUksQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLFVBQVUsQ0FBQyxFQUF2RCxDQUF1RCxDQUFDLENBQUM7YUFDdkY7b0JBQVM7Z0JBQ1IsZ0RBQWdEO2dCQUNoRCxTQUFTLElBQUksT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDO2FBQzVCO1NBQ0Y7UUFFRCwyREFBMkQ7UUFDM0QsSUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQztRQUNuQyxJQUFJLFlBQVksSUFBSSxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDeEMsSUFBTSxjQUFZLEdBQUcsZUFBb0MsQ0FBQztZQUMxRCxXQUFXLENBQ1AsWUFBWSxFQUFFLFVBQUEsUUFBUSxJQUFJLE9BQUEsS0FBSSxDQUFDLGVBQWUsQ0FBQyxRQUFRLEVBQUUsY0FBWSxFQUFFLFlBQVksQ0FBQyxFQUExRCxDQUEwRCxDQUFDLENBQUM7U0FDM0Y7UUFFRCxvRkFBb0Y7UUFDcEYsSUFBTSxZQUFZLEdBQUksZUFBa0QsQ0FBQyxRQUFRLENBQUM7UUFDbEYsV0FBVyxDQUFDLFNBQVMsRUFBRSxVQUFBLFFBQVEsSUFBSSxPQUFBLEtBQUksQ0FBQyxlQUFlLENBQUMsUUFBUSxFQUFFLFlBQVksRUFBRSxTQUFTLENBQUMsRUFBdkQsQ0FBdUQsQ0FBQyxDQUFDO0lBQzlGLENBQUM7SUFFRDs7T0FFRztJQUNLLG9DQUFlLEdBQXZCLFVBQ0ksUUFBd0IsRUFBRSxZQUErQixFQUFFLFNBQWdCO1FBQzdFLDRGQUE0RjtRQUM1RixZQUFZO1FBQ1osUUFBUSxHQUFHLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3ZDLElBQUksS0FBSyxHQUNMLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLElBQUksUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRTFGLHlDQUF5QztRQUN6QyxJQUFNLE1BQU0sR0FBRyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsWUFBWSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBRW5FLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLElBQUksUUFBUSxDQUFDLEtBQUssS0FBSyxJQUFJLEVBQUU7WUFDeEQsOEVBQThFO1lBQzlFLGlEQUFpRDtZQUNqRCxJQUFJLGFBQVcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMxQyxJQUFJLGFBQVcsRUFBRTtnQkFDZixnQ0FBZ0M7Z0JBQ2hDLElBQUksYUFBVyxDQUFDLEtBQUssS0FBSyxTQUFTLEVBQUU7b0JBQ25DLE1BQU0sSUFBSSxLQUFLLENBQUMsOEJBQTRCLEtBQUssTUFBRyxDQUFDLENBQUM7aUJBQ3ZEO2FBQ0Y7aUJBQU07Z0JBQ0wsYUFBVyxHQUFHLFVBQVUsQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUNuRCxhQUFXLENBQUMsT0FBTyxHQUFHLGNBQU0sT0FBQSxVQUFVLENBQUMsYUFBYSxDQUFDLEtBQU8sQ0FBQyxFQUFqQyxDQUFpQyxDQUFDO2dCQUM5RCxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsYUFBVyxDQUFDLENBQUM7YUFDdEM7WUFDRCxLQUFLLEdBQUcsUUFBUSxDQUFDO1lBQ2pCLGFBQVcsQ0FBQyxLQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQ3BDO2FBQU07WUFDTCxJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN6QyxJQUFJLFFBQVEsSUFBSSxRQUFRLENBQUMsS0FBSyxLQUFLLFNBQVMsRUFBRTtnQkFDNUMsTUFBTSxJQUFJLEtBQUssQ0FBQyw4QkFBNEIsU0FBUyxDQUFDLEtBQUssQ0FBRyxDQUFDLENBQUM7YUFDakU7U0FDRjtRQUNELElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBRU8sNEJBQU8sR0FBZixVQUFtQixLQUFnQyxFQUFFLE1BQWlCO1FBQ3BFLElBQUksTUFBTSxDQUFDLEtBQUssS0FBSyxRQUFRLEVBQUU7WUFDN0IsTUFBTSxJQUFJLEtBQUssQ0FBQywyQ0FBeUMsU0FBUyxDQUFDLEtBQUssQ0FBRyxDQUFDLENBQUM7U0FDOUU7YUFBTSxJQUFJLE1BQU0sQ0FBQyxLQUFLLEtBQUssT0FBTyxFQUFFO1lBQ25DLE1BQU0sQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDO1lBQ3hCLE1BQU0sQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLE9BQVMsRUFBRSxDQUFDO1NBQ25DO1FBQ0QsSUFBSSxPQUFPLE1BQU0sQ0FBQyxLQUFLLEtBQUssUUFBUSxJQUFJLE1BQU0sQ0FBQyxLQUFLLElBQUksWUFBWSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUNsRixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDbEM7UUFDRCxPQUFPLE1BQU0sQ0FBQyxLQUFVLENBQUM7SUFDM0IsQ0FBQztJQUVPLHlDQUFvQixHQUE1QixVQUE2QixHQUF1QjtRQUNsRCxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRTtZQUNuQixPQUFPLEtBQUssQ0FBQztTQUNkO2FBQU0sSUFBSSxPQUFPLEdBQUcsQ0FBQyxVQUFVLEtBQUssUUFBUSxFQUFFO1lBQzdDLE9BQU8sR0FBRyxDQUFDLFVBQVUsS0FBSyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxLQUFLLE1BQU0sSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7U0FDdkY7YUFBTTtZQUNMLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7U0FDbEQ7SUFDSCxDQUFDO0lBQ0gsaUJBQUM7QUFBRCxDQUFDLEFBNVFELElBNFFDOztBQUVELFNBQVMsaUNBQWlDLENBQUMsS0FBcUM7SUFDOUUsSUFBTSxhQUFhLEdBQUcsZ0JBQWdCLENBQUMsS0FBNEIsQ0FBQyxDQUFDO0lBQ3JFLElBQUksYUFBYSxLQUFLLElBQUksRUFBRTtRQUMxQixJQUFNLFdBQVcsR0FBRyxjQUFjLENBQUMsS0FBMEIsQ0FBQyxDQUFDO1FBQy9ELElBQUksV0FBVyxLQUFLLElBQUksRUFBRTtZQUN4QixPQUFPLFdBQVcsQ0FBQyxPQUFPLENBQUM7U0FDNUI7YUFBTSxJQUFJLEtBQUssWUFBWSxjQUFjLEVBQUU7WUFDMUMsTUFBTSxJQUFJLEtBQUssQ0FBQyxXQUFTLFNBQVMsQ0FBQyxLQUFLLENBQUMsK0NBQTRDLENBQUMsQ0FBQztTQUN4RjthQUFNLElBQUksS0FBSyxZQUFZLFFBQVEsRUFBRTtZQUNwQyxJQUFNLFdBQVcsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO1lBQ2pDLElBQUksV0FBVyxHQUFHLENBQUMsRUFBRTtnQkFDbkIsSUFBTSxJQUFJLEdBQWEsSUFBSSxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUN4RCxNQUFNLElBQUksS0FBSyxDQUNYLHNDQUFvQyxTQUFTLENBQUMsS0FBSyxDQUFDLFdBQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBSSxDQUFDLENBQUM7YUFDcEY7WUFDRCxPQUFPLGNBQU0sT0FBQSxJQUFLLEtBQW1CLEVBQUUsRUFBMUIsQ0FBMEIsQ0FBQztTQUN6QztRQUNELE1BQU0sSUFBSSxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUM7S0FDaEM7SUFDRCxPQUFPLGFBQWEsQ0FBQyxPQUFPLENBQUM7QUFDL0IsQ0FBQztBQUVELFNBQVMsZ0JBQWdCLENBQ3JCLFFBQXdCLEVBQUUsWUFBK0IsRUFBRSxTQUFnQjtJQUM3RSxJQUFJLE9BQU8sR0FBMEIsaUJBQWlCLENBQUMsUUFBUSxFQUFFLFlBQVksRUFBRSxTQUFTLENBQUMsQ0FBQztJQUMxRixJQUFJLGVBQWUsQ0FBQyxRQUFRLENBQUMsRUFBRTtRQUM3QixPQUFPLFVBQVUsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQ2pEO1NBQU07UUFDTCxPQUFPLFVBQVUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7S0FDckM7QUFDSCxDQUFDO0FBRUQ7Ozs7R0FJRztBQUNILE1BQU0sVUFBVSxpQkFBaUIsQ0FDN0IsUUFBd0IsRUFBRSxZQUFnQyxFQUFFLFNBQWlCO0lBQy9FLElBQUksT0FBTyxHQUEwQixTQUFTLENBQUM7SUFDL0MsSUFBSSxjQUFjLENBQUMsUUFBUSxDQUFDLEVBQUU7UUFDNUIsT0FBTyxpQ0FBaUMsQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0tBQ3ZFO1NBQU07UUFDTCxJQUFJLGVBQWUsQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUM3QixPQUFPLEdBQUcsY0FBTSxPQUFBLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBcEMsQ0FBb0MsQ0FBQztTQUN0RDthQUFNLElBQUksa0JBQWtCLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDdkMsT0FBTyxHQUFHLGNBQU0sT0FBQSxNQUFNLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQS9DLENBQStDLENBQUM7U0FDakU7YUFBTSxJQUFJLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQ3RDLE9BQU8sR0FBRyxjQUFNLE9BQUEsUUFBUSxDQUFDLFVBQVUsT0FBbkIsUUFBUSxtQkFBZSxVQUFVLENBQUMsUUFBUSxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsSUFBdEQsQ0FBdUQsQ0FBQztTQUN6RTthQUFNO1lBQ0wsSUFBTSxVQUFRLEdBQUcsaUJBQWlCLENBQzlCLFFBQVE7Z0JBQ1IsQ0FBRSxRQUFnRCxDQUFDLFFBQVEsSUFBSSxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUN0RixJQUFJLENBQUMsVUFBUSxFQUFFO2dCQUNiLElBQUksY0FBYyxHQUFHLEVBQUUsQ0FBQztnQkFDeEIsSUFBSSxZQUFZLElBQUksU0FBUyxFQUFFO29CQUM3QixJQUFNLGNBQWMsR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLFFBQVEsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBNUMsQ0FBNEMsQ0FBQyxDQUFDO29CQUN4RixjQUFjO3dCQUNWLCtEQUE2RCxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFHLENBQUM7aUJBQy9GO2dCQUNELE1BQU0sSUFBSSxLQUFLLENBQ1gsd0NBQXNDLFNBQVMsQ0FBQyxZQUFZLENBQUMsTUFBRyxHQUFHLGNBQWMsQ0FBQyxDQUFDO2FBQ3hGO1lBQ0QsSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUU7Z0JBQ3JCLE9BQU8sR0FBRyxjQUFNLFlBQUksQ0FBQyxVQUFRLENBQUMsWUFBVixDQUFDLFVBQVEsQ0FBQyw2QkFBSSxVQUFVLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUEzQyxDQUE0QyxDQUFDO2FBQzlEO2lCQUFNO2dCQUNMLE9BQU8saUNBQWlDLENBQUMsVUFBUSxDQUFDLENBQUM7YUFDcEQ7U0FDRjtLQUNGO0lBQ0QsT0FBTyxPQUFPLENBQUM7QUFDakIsQ0FBQztBQUVELFNBQVMsVUFBVSxDQUNmLE9BQThCLEVBQUUsS0FBYSxFQUFFLEtBQXNCO0lBQXRCLHNCQUFBLEVBQUEsYUFBc0I7SUFDdkUsT0FBTztRQUNMLE9BQU8sRUFBRSxPQUFPO1FBQ2hCLEtBQUssRUFBRSxLQUFLO1FBQ1osS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTO0tBQzlCLENBQUM7QUFDSixDQUFDO0FBRUQsU0FBUyxXQUFXLENBQUksS0FBb0IsRUFBRSxFQUFzQjtJQUNsRSxLQUFLLENBQUMsT0FBTyxDQUFDLFVBQUEsS0FBSyxJQUFJLE9BQUEsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUF6RCxDQUF5RCxDQUFDLENBQUM7QUFDcEYsQ0FBQztBQUVELFNBQVMsZUFBZSxDQUFDLEtBQXFCO0lBQzVDLE9BQU8sS0FBSyxJQUFJLE9BQU8sS0FBSyxJQUFJLFFBQVEsSUFBSSxTQUFTLElBQUksS0FBSyxDQUFDO0FBQ2pFLENBQUM7QUFFRCxTQUFTLGtCQUFrQixDQUFDLEtBQXFCO0lBQy9DLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFLLEtBQTBCLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDOUQsQ0FBQztBQUVELFNBQVMsaUJBQWlCLENBQUMsS0FBcUI7SUFDOUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUssS0FBeUIsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUM1RCxDQUFDO0FBRUQsTUFBTSxVQUFVLGNBQWMsQ0FBQyxLQUFxQjtJQUNsRCxPQUFPLE9BQU8sS0FBSyxLQUFLLFVBQVUsQ0FBQztBQUNyQyxDQUFDO0FBRUQsU0FBUyxPQUFPLENBQUMsS0FBZ0U7SUFFL0UsT0FBTyxDQUFDLENBQUUsS0FBYSxDQUFDLElBQUksQ0FBQztBQUMvQixDQUFDO0FBRUQsU0FBUyxZQUFZLENBQUMsS0FBVTtJQUM5QixPQUFPLE9BQU8sS0FBSyxLQUFLLFFBQVEsSUFBSSxLQUFLLElBQUksSUFBSSxJQUFLLEtBQW1CLENBQUMsV0FBVztRQUNqRixPQUFPLEtBQW1CLENBQUMsV0FBVyxLQUFLLFVBQVUsQ0FBQztBQUM1RCxDQUFDO0FBRUQsU0FBUyxxQkFBcUIsQ0FBQyxLQUFVO0lBQ3ZDLE9BQU8sQ0FBQyxPQUFPLEtBQUssS0FBSyxVQUFVLENBQUM7UUFDaEMsQ0FBQyxPQUFPLEtBQUssS0FBSyxRQUFRLElBQUksS0FBSyxZQUFZLGNBQWMsQ0FBQyxDQUFDO0FBQ3JFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7T25EZXN0cm95fSBmcm9tICcuLi9tZXRhZGF0YS9saWZlY3ljbGVfaG9va3MnO1xuaW1wb3J0IHtUeXBlfSBmcm9tICcuLi90eXBlJztcbmltcG9ydCB7c3RyaW5naWZ5fSBmcm9tICcuLi91dGlsJztcblxuaW1wb3J0IHtJbmplY3RhYmxlRGVmLCBJbmplY3RhYmxlVHlwZSwgSW5qZWN0b3JUeXBlLCBJbmplY3RvclR5cGVXaXRoUHJvdmlkZXJzLCBnZXRJbmplY3RhYmxlRGVmLCBnZXRJbmplY3RvckRlZn0gZnJvbSAnLi9kZWZzJztcbmltcG9ydCB7cmVzb2x2ZUZvcndhcmRSZWZ9IGZyb20gJy4vZm9yd2FyZF9yZWYnO1xuaW1wb3J0IHtJbmplY3Rpb25Ub2tlbn0gZnJvbSAnLi9pbmplY3Rpb25fdG9rZW4nO1xuaW1wb3J0IHtJTkpFQ1RPUiwgSW5qZWN0b3IsIE51bGxJbmplY3RvciwgVEhST1dfSUZfTk9UX0ZPVU5ELCBVU0VfVkFMVUV9IGZyb20gJy4vaW5qZWN0b3InO1xuaW1wb3J0IHtJbmplY3RGbGFncywgaW5qZWN0LCBpbmplY3RBcmdzLCBzZXRDdXJyZW50SW5qZWN0b3J9IGZyb20gJy4vaW5qZWN0b3JfY29tcGF0aWJpbGl0eSc7XG5pbXBvcnQge0NsYXNzUHJvdmlkZXIsIENvbnN0cnVjdG9yUHJvdmlkZXIsIEV4aXN0aW5nUHJvdmlkZXIsIEZhY3RvcnlQcm92aWRlciwgUHJvdmlkZXIsIFN0YXRpY0NsYXNzUHJvdmlkZXIsIFN0YXRpY1Byb3ZpZGVyLCBUeXBlUHJvdmlkZXIsIFZhbHVlUHJvdmlkZXJ9IGZyb20gJy4vcHJvdmlkZXInO1xuaW1wb3J0IHtBUFBfUk9PVH0gZnJvbSAnLi9zY29wZSc7XG5cblxuXG4vKipcbiAqIEludGVybmFsIHR5cGUgZm9yIGEgc2luZ2xlIHByb3ZpZGVyIGluIGEgZGVlcCBwcm92aWRlciBhcnJheS5cbiAqL1xudHlwZSBTaW5nbGVQcm92aWRlciA9IFR5cGVQcm92aWRlciB8IFZhbHVlUHJvdmlkZXIgfCBDbGFzc1Byb3ZpZGVyIHwgQ29uc3RydWN0b3JQcm92aWRlciB8XG4gICAgRXhpc3RpbmdQcm92aWRlciB8IEZhY3RvcnlQcm92aWRlciB8IFN0YXRpY0NsYXNzUHJvdmlkZXI7XG5cbi8qKlxuICogTWFya2VyIHdoaWNoIGluZGljYXRlcyB0aGF0IGEgdmFsdWUgaGFzIG5vdCB5ZXQgYmVlbiBjcmVhdGVkIGZyb20gdGhlIGZhY3RvcnkgZnVuY3Rpb24uXG4gKi9cbmNvbnN0IE5PVF9ZRVQgPSB7fTtcblxuLyoqXG4gKiBNYXJrZXIgd2hpY2ggaW5kaWNhdGVzIHRoYXQgdGhlIGZhY3RvcnkgZnVuY3Rpb24gZm9yIGEgdG9rZW4gaXMgaW4gdGhlIHByb2Nlc3Mgb2YgYmVpbmcgY2FsbGVkLlxuICpcbiAqIElmIHRoZSBpbmplY3RvciBpcyBhc2tlZCB0byBpbmplY3QgYSB0b2tlbiB3aXRoIGl0cyB2YWx1ZSBzZXQgdG8gQ0lSQ1VMQVIsIHRoYXQgaW5kaWNhdGVzXG4gKiBpbmplY3Rpb24gb2YgYSBkZXBlbmRlbmN5IGhhcyByZWN1cnNpdmVseSBhdHRlbXB0ZWQgdG8gaW5qZWN0IHRoZSBvcmlnaW5hbCB0b2tlbiwgYW5kIHRoZXJlIGlzXG4gKiBhIGNpcmN1bGFyIGRlcGVuZGVuY3kgYW1vbmcgdGhlIHByb3ZpZGVycy5cbiAqL1xuY29uc3QgQ0lSQ1VMQVIgPSB7fTtcblxuY29uc3QgRU1QVFlfQVJSQVkgPSBbXSBhcyBhbnlbXTtcblxuLyoqXG4gKiBBIGxhemlseSBpbml0aWFsaXplZCBOdWxsSW5qZWN0b3IuXG4gKi9cbmxldCBOVUxMX0lOSkVDVE9SOiBJbmplY3Rvcnx1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGdldE51bGxJbmplY3RvcigpOiBJbmplY3RvciB7XG4gIGlmIChOVUxMX0lOSkVDVE9SID09PSB1bmRlZmluZWQpIHtcbiAgICBOVUxMX0lOSkVDVE9SID0gbmV3IE51bGxJbmplY3RvcigpO1xuICB9XG4gIHJldHVybiBOVUxMX0lOSkVDVE9SO1xufVxuXG4vKipcbiAqIEFuIGVudHJ5IGluIHRoZSBpbmplY3RvciB3aGljaCB0cmFja3MgaW5mb3JtYXRpb24gYWJvdXQgdGhlIGdpdmVuIHRva2VuLCBpbmNsdWRpbmcgYSBwb3NzaWJsZVxuICogY3VycmVudCB2YWx1ZS5cbiAqL1xuaW50ZXJmYWNlIFJlY29yZDxUPiB7XG4gIGZhY3Rvcnk6ICgoKSA9PiBUKXx1bmRlZmluZWQ7XG4gIHZhbHVlOiBUfHt9O1xuICBtdWx0aTogYW55W118dW5kZWZpbmVkO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIG5ldyBgSW5qZWN0b3JgIHdoaWNoIGlzIGNvbmZpZ3VyZWQgdXNpbmcgYSBgZGVmVHlwZWAgb2YgYEluamVjdG9yVHlwZTxhbnk+YHMuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlSW5qZWN0b3IoXG4gICAgZGVmVHlwZTogLyogSW5qZWN0b3JUeXBlPGFueT4gKi8gYW55LCBwYXJlbnQ6IEluamVjdG9yIHwgbnVsbCA9IG51bGwsXG4gICAgYWRkaXRpb25hbFByb3ZpZGVyczogU3RhdGljUHJvdmlkZXJbXSB8IG51bGwgPSBudWxsKTogSW5qZWN0b3Ige1xuICBwYXJlbnQgPSBwYXJlbnQgfHwgZ2V0TnVsbEluamVjdG9yKCk7XG4gIHJldHVybiBuZXcgUjNJbmplY3RvcihkZWZUeXBlLCBhZGRpdGlvbmFsUHJvdmlkZXJzLCBwYXJlbnQpO1xufVxuXG5leHBvcnQgY2xhc3MgUjNJbmplY3RvciB7XG4gIC8qKlxuICAgKiBNYXAgb2YgdG9rZW5zIHRvIHJlY29yZHMgd2hpY2ggY29udGFpbiB0aGUgaW5zdGFuY2VzIG9mIHRob3NlIHRva2Vucy5cbiAgICovXG4gIHByaXZhdGUgcmVjb3JkcyA9IG5ldyBNYXA8VHlwZTxhbnk+fEluamVjdGlvblRva2VuPGFueT4sIFJlY29yZDxhbnk+PigpO1xuXG4gIC8qKlxuICAgKiBUaGUgdHJhbnNpdGl2ZSBzZXQgb2YgYEluamVjdG9yVHlwZWBzIHdoaWNoIGRlZmluZSB0aGlzIGluamVjdG9yLlxuICAgKi9cbiAgcHJpdmF0ZSBpbmplY3RvckRlZlR5cGVzID0gbmV3IFNldDxJbmplY3RvclR5cGU8YW55Pj4oKTtcblxuICAvKipcbiAgICogU2V0IG9mIHZhbHVlcyBpbnN0YW50aWF0ZWQgYnkgdGhpcyBpbmplY3RvciB3aGljaCBjb250YWluIGBuZ09uRGVzdHJveWAgbGlmZWN5Y2xlIGhvb2tzLlxuICAgKi9cbiAgcHJpdmF0ZSBvbkRlc3Ryb3kgPSBuZXcgU2V0PE9uRGVzdHJveT4oKTtcblxuICAvKipcbiAgICogRmxhZyBpbmRpY2F0aW5nIHRoaXMgaW5qZWN0b3IgcHJvdmlkZXMgdGhlIEFQUF9ST09UX1NDT1BFIHRva2VuLCBhbmQgdGh1cyBjb3VudHMgYXMgdGhlXG4gICAqIHJvb3Qgc2NvcGUuXG4gICAqL1xuICBwcml2YXRlIHJlYWRvbmx5IGlzUm9vdEluamVjdG9yOiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBGbGFnIGluZGljYXRpbmcgdGhhdCB0aGlzIGluamVjdG9yIHdhcyBwcmV2aW91c2x5IGRlc3Ryb3llZC5cbiAgICovXG4gIHByaXZhdGUgZGVzdHJveWVkID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBkZWY6IEluamVjdG9yVHlwZTxhbnk+LCBhZGRpdGlvbmFsUHJvdmlkZXJzOiBTdGF0aWNQcm92aWRlcltdfG51bGwsXG4gICAgICByZWFkb25seSBwYXJlbnQ6IEluamVjdG9yKSB7XG4gICAgLy8gU3RhcnQgb2ZmIGJ5IGNyZWF0aW5nIFJlY29yZHMgZm9yIGV2ZXJ5IHByb3ZpZGVyIGRlY2xhcmVkIGluIGV2ZXJ5IEluamVjdG9yVHlwZVxuICAgIC8vIGluY2x1ZGVkIHRyYW5zaXRpdmVseSBpbiBgZGVmYC5cbiAgICBjb25zdCBkZWR1cFN0YWNrOiBJbmplY3RvclR5cGU8YW55PltdID0gW107XG4gICAgZGVlcEZvckVhY2goW2RlZl0sIGluamVjdG9yRGVmID0+IHRoaXMucHJvY2Vzc0luamVjdG9yVHlwZShpbmplY3RvckRlZiwgW10sIGRlZHVwU3RhY2spKTtcblxuICAgIGFkZGl0aW9uYWxQcm92aWRlcnMgJiYgZGVlcEZvckVhY2goXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkaXRpb25hbFByb3ZpZGVycywgcHJvdmlkZXIgPT4gdGhpcy5wcm9jZXNzUHJvdmlkZXIoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVyLCBkZWYsIGFkZGl0aW9uYWxQcm92aWRlcnMpKTtcblxuXG4gICAgLy8gTWFrZSBzdXJlIHRoZSBJTkpFQ1RPUiB0b2tlbiBwcm92aWRlcyB0aGlzIGluamVjdG9yLlxuICAgIHRoaXMucmVjb3Jkcy5zZXQoSU5KRUNUT1IsIG1ha2VSZWNvcmQodW5kZWZpbmVkLCB0aGlzKSk7XG5cbiAgICAvLyBEZXRlY3Qgd2hldGhlciB0aGlzIGluamVjdG9yIGhhcyB0aGUgQVBQX1JPT1RfU0NPUEUgdG9rZW4gYW5kIHRodXMgc2hvdWxkIHByb3ZpZGVcbiAgICAvLyBhbnkgaW5qZWN0YWJsZSBzY29wZWQgdG8gQVBQX1JPT1RfU0NPUEUuXG4gICAgdGhpcy5pc1Jvb3RJbmplY3RvciA9IHRoaXMucmVjb3Jkcy5oYXMoQVBQX1JPT1QpO1xuXG4gICAgLy8gRWFnZXJseSBpbnN0YW50aWF0ZSB0aGUgSW5qZWN0b3JUeXBlIGNsYXNzZXMgdGhlbXNlbHZlcy5cbiAgICB0aGlzLmluamVjdG9yRGVmVHlwZXMuZm9yRWFjaChkZWZUeXBlID0+IHRoaXMuZ2V0KGRlZlR5cGUpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXN0cm95IHRoZSBpbmplY3RvciBhbmQgcmVsZWFzZSByZWZlcmVuY2VzIHRvIGV2ZXJ5IGluc3RhbmNlIG9yIHByb3ZpZGVyIGFzc29jaWF0ZWQgd2l0aCBpdC5cbiAgICpcbiAgICogQWxzbyBjYWxscyB0aGUgYE9uRGVzdHJveWAgbGlmZWN5Y2xlIGhvb2tzIG9mIGV2ZXJ5IGluc3RhbmNlIHRoYXQgd2FzIGNyZWF0ZWQgZm9yIHdoaWNoIGFcbiAgICogaG9vayB3YXMgZm91bmQuXG4gICAqL1xuICBkZXN0cm95KCk6IHZvaWQge1xuICAgIHRoaXMuYXNzZXJ0Tm90RGVzdHJveWVkKCk7XG5cbiAgICAvLyBTZXQgZGVzdHJveWVkID0gdHJ1ZSBmaXJzdCwgaW4gY2FzZSBsaWZlY3ljbGUgaG9va3MgcmUtZW50ZXIgZGVzdHJveSgpLlxuICAgIHRoaXMuZGVzdHJveWVkID0gdHJ1ZTtcbiAgICB0cnkge1xuICAgICAgLy8gQ2FsbCBhbGwgdGhlIGxpZmVjeWNsZSBob29rcy5cbiAgICAgIHRoaXMub25EZXN0cm95LmZvckVhY2goc2VydmljZSA9PiBzZXJ2aWNlLm5nT25EZXN0cm95KCkpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICAvLyBSZWxlYXNlIGFsbCByZWZlcmVuY2VzLlxuICAgICAgdGhpcy5yZWNvcmRzLmNsZWFyKCk7XG4gICAgICB0aGlzLm9uRGVzdHJveS5jbGVhcigpO1xuICAgICAgdGhpcy5pbmplY3RvckRlZlR5cGVzLmNsZWFyKCk7XG4gICAgfVxuICB9XG5cbiAgZ2V0PFQ+KFxuICAgICAgdG9rZW46IFR5cGU8VD58SW5qZWN0aW9uVG9rZW48VD4sIG5vdEZvdW5kVmFsdWU6IGFueSA9IFRIUk9XX0lGX05PVF9GT1VORCxcbiAgICAgIGZsYWdzID0gSW5qZWN0RmxhZ3MuRGVmYXVsdCk6IFQge1xuICAgIHRoaXMuYXNzZXJ0Tm90RGVzdHJveWVkKCk7XG4gICAgLy8gU2V0IHRoZSBpbmplY3Rpb24gY29udGV4dC5cbiAgICBjb25zdCBwcmV2aW91c0luamVjdG9yID0gc2V0Q3VycmVudEluamVjdG9yKHRoaXMpO1xuICAgIHRyeSB7XG4gICAgICAvLyBDaGVjayBmb3IgdGhlIFNraXBTZWxmIGZsYWcuXG4gICAgICBpZiAoIShmbGFncyAmIEluamVjdEZsYWdzLlNraXBTZWxmKSkge1xuICAgICAgICAvLyBTa2lwU2VsZiBpc24ndCBzZXQsIGNoZWNrIGlmIHRoZSByZWNvcmQgYmVsb25ncyB0byB0aGlzIGluamVjdG9yLlxuICAgICAgICBsZXQgcmVjb3JkOiBSZWNvcmQ8VD58dW5kZWZpbmVkID0gdGhpcy5yZWNvcmRzLmdldCh0b2tlbik7XG4gICAgICAgIGlmIChyZWNvcmQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIC8vIE5vIHJlY29yZCwgYnV0IG1heWJlIHRoZSB0b2tlbiBpcyBzY29wZWQgdG8gdGhpcyBpbmplY3Rvci4gTG9vayBmb3IgYW4gbmdJbmplY3RhYmxlRGVmXG4gICAgICAgICAgLy8gd2l0aCBhIHNjb3BlIG1hdGNoaW5nIHRoaXMgaW5qZWN0b3IuXG4gICAgICAgICAgY29uc3QgZGVmID0gY291bGRCZUluamVjdGFibGVUeXBlKHRva2VuKSAmJiBnZXRJbmplY3RhYmxlRGVmKHRva2VuKTtcbiAgICAgICAgICBpZiAoZGVmICYmIHRoaXMuaW5qZWN0YWJsZURlZkluU2NvcGUoZGVmKSkge1xuICAgICAgICAgICAgLy8gRm91bmQgYW4gbmdJbmplY3RhYmxlRGVmIGFuZCBpdCdzIHNjb3BlZCB0byB0aGlzIGluamVjdG9yLiBQcmV0ZW5kIGFzIGlmIGl0IHdhcyBoZXJlXG4gICAgICAgICAgICAvLyBhbGwgYWxvbmcuXG4gICAgICAgICAgICByZWNvcmQgPSBtYWtlUmVjb3JkKGluamVjdGFibGVEZWZPckluamVjdG9yRGVmRmFjdG9yeSh0b2tlbiksIE5PVF9ZRVQpO1xuICAgICAgICAgICAgdGhpcy5yZWNvcmRzLnNldCh0b2tlbiwgcmVjb3JkKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gSWYgYSByZWNvcmQgd2FzIGZvdW5kLCBnZXQgdGhlIGluc3RhbmNlIGZvciBpdCBhbmQgcmV0dXJuIGl0LlxuICAgICAgICBpZiAocmVjb3JkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5oeWRyYXRlKHRva2VuLCByZWNvcmQpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFNlbGVjdCB0aGUgbmV4dCBpbmplY3RvciBiYXNlZCBvbiB0aGUgU2VsZiBmbGFnIC0gaWYgc2VsZiBpcyBzZXQsIHRoZSBuZXh0IGluamVjdG9yIGlzXG4gICAgICAvLyB0aGUgTnVsbEluamVjdG9yLCBvdGhlcndpc2UgaXQncyB0aGUgcGFyZW50LlxuICAgICAgY29uc3QgbmV4dEluamVjdG9yID0gIShmbGFncyAmIEluamVjdEZsYWdzLlNlbGYpID8gdGhpcy5wYXJlbnQgOiBnZXROdWxsSW5qZWN0b3IoKTtcbiAgICAgIHJldHVybiBuZXh0SW5qZWN0b3IuZ2V0KHRva2VuLCBub3RGb3VuZFZhbHVlKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgLy8gTGFzdGx5LCBjbGVhbiB1cCB0aGUgc3RhdGUgYnkgcmVzdG9yaW5nIHRoZSBwcmV2aW91cyBpbmplY3Rvci5cbiAgICAgIHNldEN1cnJlbnRJbmplY3RvcihwcmV2aW91c0luamVjdG9yKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGFzc2VydE5vdERlc3Ryb3llZCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5kZXN0cm95ZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW5qZWN0b3IgaGFzIGFscmVhZHkgYmVlbiBkZXN0cm95ZWQuJyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhbiBgSW5qZWN0b3JUeXBlYCBvciBgSW5qZWN0b3JEZWZUeXBlV2l0aFByb3ZpZGVyc2AgYW5kIGFsbCBvZiBpdHMgdHJhbnNpdGl2ZSBwcm92aWRlcnNcbiAgICogdG8gdGhpcyBpbmplY3Rvci5cbiAgICovXG4gIHByaXZhdGUgcHJvY2Vzc0luamVjdG9yVHlwZShcbiAgICAgIGRlZk9yV3JhcHBlZERlZjogSW5qZWN0b3JUeXBlPGFueT58SW5qZWN0b3JUeXBlV2l0aFByb3ZpZGVyczxhbnk+LFxuICAgICAgcGFyZW50czogSW5qZWN0b3JUeXBlPGFueT5bXSwgZGVkdXBTdGFjazogSW5qZWN0b3JUeXBlPGFueT5bXSkge1xuICAgIGRlZk9yV3JhcHBlZERlZiA9IHJlc29sdmVGb3J3YXJkUmVmKGRlZk9yV3JhcHBlZERlZik7XG4gICAgaWYgKCFkZWZPcldyYXBwZWREZWYpIHJldHVybjtcblxuICAgIC8vIEVpdGhlciB0aGUgZGVmT3JXcmFwcGVkRGVmIGlzIGFuIEluamVjdG9yVHlwZSAod2l0aCBuZ0luamVjdG9yRGVmKSBvciBhblxuICAgIC8vIEluamVjdG9yRGVmVHlwZVdpdGhQcm92aWRlcnMgKGFrYSBNb2R1bGVXaXRoUHJvdmlkZXJzKS4gRGV0ZWN0aW5nIGVpdGhlciBpcyBhIG1lZ2Ftb3JwaGljXG4gICAgLy8gcmVhZCwgc28gY2FyZSBpcyB0YWtlbiB0byBvbmx5IGRvIHRoZSByZWFkIG9uY2UuXG5cbiAgICAvLyBGaXJzdCBhdHRlbXB0IHRvIHJlYWQgdGhlIG5nSW5qZWN0b3JEZWYuXG4gICAgbGV0IGRlZiA9IGdldEluamVjdG9yRGVmKGRlZk9yV3JhcHBlZERlZik7XG5cbiAgICAvLyBJZiB0aGF0J3Mgbm90IHByZXNlbnQsIHRoZW4gYXR0ZW1wdCB0byByZWFkIG5nTW9kdWxlIGZyb20gdGhlIEluamVjdG9yRGVmVHlwZVdpdGhQcm92aWRlcnMuXG4gICAgY29uc3QgbmdNb2R1bGUgPVxuICAgICAgICAoZGVmID09IG51bGwpICYmIChkZWZPcldyYXBwZWREZWYgYXMgSW5qZWN0b3JUeXBlV2l0aFByb3ZpZGVyczxhbnk+KS5uZ01vZHVsZSB8fCB1bmRlZmluZWQ7XG5cbiAgICAvLyBEZXRlcm1pbmUgdGhlIEluamVjdG9yVHlwZS4gSW4gdGhlIGNhc2Ugd2hlcmUgYGRlZk9yV3JhcHBlZERlZmAgaXMgYW4gYEluamVjdG9yVHlwZWAsXG4gICAgLy8gdGhlbiB0aGlzIGlzIGVhc3kuIEluIHRoZSBjYXNlIG9mIGFuIEluamVjdG9yRGVmVHlwZVdpdGhQcm92aWRlcnMsIHRoZW4gdGhlIGRlZmluaXRpb24gdHlwZVxuICAgIC8vIGlzIHRoZSBgbmdNb2R1bGVgLlxuICAgIGNvbnN0IGRlZlR5cGU6IEluamVjdG9yVHlwZTxhbnk+ID1cbiAgICAgICAgKG5nTW9kdWxlID09PSB1bmRlZmluZWQpID8gKGRlZk9yV3JhcHBlZERlZiBhcyBJbmplY3RvclR5cGU8YW55PikgOiBuZ01vZHVsZTtcblxuICAgIC8vIENoZWNrIGZvciBjaXJjdWxhciBkZXBlbmRlbmNpZXMuXG4gICAgaWYgKG5nRGV2TW9kZSAmJiBwYXJlbnRzLmluZGV4T2YoZGVmVHlwZSkgIT09IC0xKSB7XG4gICAgICBjb25zdCBkZWZOYW1lID0gc3RyaW5naWZ5KGRlZlR5cGUpO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBDaXJjdWxhciBkZXBlbmRlbmN5IGluIERJIGRldGVjdGVkIGZvciB0eXBlICR7ZGVmTmFtZX0uIERlcGVuZGVuY3kgcGF0aDogJHtwYXJlbnRzLm1hcChkZWZUeXBlID0+IHN0cmluZ2lmeShkZWZUeXBlKSkuam9pbignID4gJyl9ID4gJHtkZWZOYW1lfS5gKTtcbiAgICB9XG5cbiAgICAvLyBDaGVjayBmb3IgbXVsdGlwbGUgaW1wb3J0cyBvZiB0aGUgc2FtZSBtb2R1bGVcbiAgICBjb25zdCBpc0R1cGxpY2F0ZSA9IGRlZHVwU3RhY2suaW5kZXhPZihkZWZUeXBlKSAhPT0gLTE7XG5cbiAgICAvLyBJZiBkZWZPcldyYXBwZWRUeXBlIHdhcyBhbiBJbmplY3RvckRlZlR5cGVXaXRoUHJvdmlkZXJzLCB0aGVuIC5wcm92aWRlcnMgbWF5IGhvbGQgc29tZVxuICAgIC8vIGV4dHJhIHByb3ZpZGVycy5cbiAgICBjb25zdCBwcm92aWRlcnMgPVxuICAgICAgICAobmdNb2R1bGUgIT09IHVuZGVmaW5lZCkgJiYgKGRlZk9yV3JhcHBlZERlZiBhcyBJbmplY3RvclR5cGVXaXRoUHJvdmlkZXJzPGFueT4pLnByb3ZpZGVycyB8fFxuICAgICAgICBFTVBUWV9BUlJBWTtcblxuICAgIC8vIEZpbmFsbHksIGlmIGRlZk9yV3JhcHBlZFR5cGUgd2FzIGFuIGBJbmplY3RvckRlZlR5cGVXaXRoUHJvdmlkZXJzYCwgdGhlbiB0aGUgYWN0dWFsXG4gICAgLy8gYEluamVjdG9yRGVmYCBpcyBvbiBpdHMgYG5nTW9kdWxlYC5cbiAgICBpZiAobmdNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgZGVmID0gZ2V0SW5qZWN0b3JEZWYobmdNb2R1bGUpO1xuICAgIH1cblxuICAgIC8vIElmIG5vIGRlZmluaXRpb24gd2FzIGZvdW5kLCBpdCBtaWdodCBiZSBmcm9tIGV4cG9ydHMuIFJlbW92ZSBpdC5cbiAgICBpZiAoZGVmID09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBUcmFjayB0aGUgSW5qZWN0b3JUeXBlIGFuZCBhZGQgYSBwcm92aWRlciBmb3IgaXQuXG4gICAgdGhpcy5pbmplY3RvckRlZlR5cGVzLmFkZChkZWZUeXBlKTtcbiAgICB0aGlzLnJlY29yZHMuc2V0KGRlZlR5cGUsIG1ha2VSZWNvcmQoZGVmLmZhY3RvcnksIE5PVF9ZRVQpKTtcblxuICAgIC8vIEFkZCBwcm92aWRlcnMgaW4gdGhlIHNhbWUgd2F5IHRoYXQgQE5nTW9kdWxlIHJlc29sdXRpb24gZGlkOlxuXG4gICAgLy8gRmlyc3QsIGluY2x1ZGUgcHJvdmlkZXJzIGZyb20gYW55IGltcG9ydHMuXG4gICAgaWYgKGRlZi5pbXBvcnRzICE9IG51bGwgJiYgIWlzRHVwbGljYXRlKSB7XG4gICAgICAvLyBCZWZvcmUgcHJvY2Vzc2luZyBkZWZUeXBlJ3MgaW1wb3J0cywgYWRkIGl0IHRvIHRoZSBzZXQgb2YgcGFyZW50cy4gVGhpcyB3YXksIGlmIGl0IGVuZHNcbiAgICAgIC8vIHVwIGRlZXBseSBpbXBvcnRpbmcgaXRzZWxmLCB0aGlzIGNhbiBiZSBkZXRlY3RlZC5cbiAgICAgIG5nRGV2TW9kZSAmJiBwYXJlbnRzLnB1c2goZGVmVHlwZSk7XG4gICAgICAvLyBBZGQgaXQgdG8gdGhlIHNldCBvZiBkZWR1cHMuIFRoaXMgd2F5IHdlIGNhbiBkZXRlY3QgbXVsdGlwbGUgaW1wb3J0cyBvZiB0aGUgc2FtZSBtb2R1bGVcbiAgICAgIGRlZHVwU3RhY2sucHVzaChkZWZUeXBlKTtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgZGVlcEZvckVhY2goXG4gICAgICAgICAgICBkZWYuaW1wb3J0cywgaW1wb3J0ZWQgPT4gdGhpcy5wcm9jZXNzSW5qZWN0b3JUeXBlKGltcG9ydGVkLCBwYXJlbnRzLCBkZWR1cFN0YWNrKSk7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICAvLyBSZW1vdmUgaXQgZnJvbSB0aGUgcGFyZW50cyBzZXQgd2hlbiBmaW5pc2hlZC5cbiAgICAgICAgbmdEZXZNb2RlICYmIHBhcmVudHMucG9wKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gTmV4dCwgaW5jbHVkZSBwcm92aWRlcnMgbGlzdGVkIG9uIHRoZSBkZWZpbml0aW9uIGl0c2VsZi5cbiAgICBjb25zdCBkZWZQcm92aWRlcnMgPSBkZWYucHJvdmlkZXJzO1xuICAgIGlmIChkZWZQcm92aWRlcnMgIT0gbnVsbCAmJiAhaXNEdXBsaWNhdGUpIHtcbiAgICAgIGNvbnN0IGluamVjdG9yVHlwZSA9IGRlZk9yV3JhcHBlZERlZiBhcyBJbmplY3RvclR5cGU8YW55PjtcbiAgICAgIGRlZXBGb3JFYWNoKFxuICAgICAgICAgIGRlZlByb3ZpZGVycywgcHJvdmlkZXIgPT4gdGhpcy5wcm9jZXNzUHJvdmlkZXIocHJvdmlkZXIsIGluamVjdG9yVHlwZSwgZGVmUHJvdmlkZXJzKSk7XG4gICAgfVxuXG4gICAgLy8gRmluYWxseSwgaW5jbHVkZSBwcm92aWRlcnMgZnJvbSBhbiBJbmplY3RvckRlZlR5cGVXaXRoUHJvdmlkZXJzIGlmIHRoZXJlIHdhcyBvbmUuXG4gICAgY29uc3QgbmdNb2R1bGVUeXBlID0gKGRlZk9yV3JhcHBlZERlZiBhcyBJbmplY3RvclR5cGVXaXRoUHJvdmlkZXJzPGFueT4pLm5nTW9kdWxlO1xuICAgIGRlZXBGb3JFYWNoKHByb3ZpZGVycywgcHJvdmlkZXIgPT4gdGhpcy5wcm9jZXNzUHJvdmlkZXIocHJvdmlkZXIsIG5nTW9kdWxlVHlwZSwgcHJvdmlkZXJzKSk7XG4gIH1cblxuICAvKipcbiAgICogUHJvY2VzcyBhIGBTaW5nbGVQcm92aWRlcmAgYW5kIGFkZCBpdC5cbiAgICovXG4gIHByaXZhdGUgcHJvY2Vzc1Byb3ZpZGVyKFxuICAgICAgcHJvdmlkZXI6IFNpbmdsZVByb3ZpZGVyLCBuZ01vZHVsZVR5cGU6IEluamVjdG9yVHlwZTxhbnk+LCBwcm92aWRlcnM6IGFueVtdKTogdm9pZCB7XG4gICAgLy8gRGV0ZXJtaW5lIHRoZSB0b2tlbiBmcm9tIHRoZSBwcm92aWRlci4gRWl0aGVyIGl0J3MgaXRzIG93biB0b2tlbiwgb3IgaGFzIGEge3Byb3ZpZGU6IC4uLn1cbiAgICAvLyBwcm9wZXJ0eS5cbiAgICBwcm92aWRlciA9IHJlc29sdmVGb3J3YXJkUmVmKHByb3ZpZGVyKTtcbiAgICBsZXQgdG9rZW46IGFueSA9XG4gICAgICAgIGlzVHlwZVByb3ZpZGVyKHByb3ZpZGVyKSA/IHByb3ZpZGVyIDogcmVzb2x2ZUZvcndhcmRSZWYocHJvdmlkZXIgJiYgcHJvdmlkZXIucHJvdmlkZSk7XG5cbiAgICAvLyBDb25zdHJ1Y3QgYSBgUmVjb3JkYCBmb3IgdGhlIHByb3ZpZGVyLlxuICAgIGNvbnN0IHJlY29yZCA9IHByb3ZpZGVyVG9SZWNvcmQocHJvdmlkZXIsIG5nTW9kdWxlVHlwZSwgcHJvdmlkZXJzKTtcblxuICAgIGlmICghaXNUeXBlUHJvdmlkZXIocHJvdmlkZXIpICYmIHByb3ZpZGVyLm11bHRpID09PSB0cnVlKSB7XG4gICAgICAvLyBJZiB0aGUgcHJvdmlkZXIgaW5kaWNhdGVzIHRoYXQgaXQncyBhIG11bHRpLXByb3ZpZGVyLCBwcm9jZXNzIGl0IHNwZWNpYWxseS5cbiAgICAgIC8vIEZpcnN0IGNoZWNrIHdoZXRoZXIgaXQncyBiZWVuIGRlZmluZWQgYWxyZWFkeS5cbiAgICAgIGxldCBtdWx0aVJlY29yZCA9IHRoaXMucmVjb3Jkcy5nZXQodG9rZW4pO1xuICAgICAgaWYgKG11bHRpUmVjb3JkKSB7XG4gICAgICAgIC8vIEl0IGhhcy4gVGhyb3cgYSBuaWNlIGVycm9yIGlmXG4gICAgICAgIGlmIChtdWx0aVJlY29yZC5tdWx0aSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBNaXhlZCBtdWx0aS1wcm92aWRlciBmb3IgJHt0b2tlbn0uYCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG11bHRpUmVjb3JkID0gbWFrZVJlY29yZCh1bmRlZmluZWQsIE5PVF9ZRVQsIHRydWUpO1xuICAgICAgICBtdWx0aVJlY29yZC5mYWN0b3J5ID0gKCkgPT4gaW5qZWN0QXJncyhtdWx0aVJlY29yZCAhLm11bHRpICEpO1xuICAgICAgICB0aGlzLnJlY29yZHMuc2V0KHRva2VuLCBtdWx0aVJlY29yZCk7XG4gICAgICB9XG4gICAgICB0b2tlbiA9IHByb3ZpZGVyO1xuICAgICAgbXVsdGlSZWNvcmQubXVsdGkgIS5wdXNoKHByb3ZpZGVyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgZXhpc3RpbmcgPSB0aGlzLnJlY29yZHMuZ2V0KHRva2VuKTtcbiAgICAgIGlmIChleGlzdGluZyAmJiBleGlzdGluZy5tdWx0aSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgTWl4ZWQgbXVsdGktcHJvdmlkZXIgZm9yICR7c3RyaW5naWZ5KHRva2VuKX1gKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5yZWNvcmRzLnNldCh0b2tlbiwgcmVjb3JkKTtcbiAgfVxuXG4gIHByaXZhdGUgaHlkcmF0ZTxUPih0b2tlbjogVHlwZTxUPnxJbmplY3Rpb25Ub2tlbjxUPiwgcmVjb3JkOiBSZWNvcmQ8VD4pOiBUIHtcbiAgICBpZiAocmVjb3JkLnZhbHVlID09PSBDSVJDVUxBUikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW5ub3QgaW5zdGFudGlhdGUgY3ljbGljIGRlcGVuZGVuY3khICR7c3RyaW5naWZ5KHRva2VuKX1gKTtcbiAgICB9IGVsc2UgaWYgKHJlY29yZC52YWx1ZSA9PT0gTk9UX1lFVCkge1xuICAgICAgcmVjb3JkLnZhbHVlID0gQ0lSQ1VMQVI7XG4gICAgICByZWNvcmQudmFsdWUgPSByZWNvcmQuZmFjdG9yeSAhKCk7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgcmVjb3JkLnZhbHVlID09PSAnb2JqZWN0JyAmJiByZWNvcmQudmFsdWUgJiYgaGFzT25EZXN0cm95KHJlY29yZC52YWx1ZSkpIHtcbiAgICAgIHRoaXMub25EZXN0cm95LmFkZChyZWNvcmQudmFsdWUpO1xuICAgIH1cbiAgICByZXR1cm4gcmVjb3JkLnZhbHVlIGFzIFQ7XG4gIH1cblxuICBwcml2YXRlIGluamVjdGFibGVEZWZJblNjb3BlKGRlZjogSW5qZWN0YWJsZURlZjxhbnk+KTogYm9vbGVhbiB7XG4gICAgaWYgKCFkZWYucHJvdmlkZWRJbikge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGRlZi5wcm92aWRlZEluID09PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIGRlZi5wcm92aWRlZEluID09PSAnYW55JyB8fCAoZGVmLnByb3ZpZGVkSW4gPT09ICdyb290JyAmJiB0aGlzLmlzUm9vdEluamVjdG9yKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuaW5qZWN0b3JEZWZUeXBlcy5oYXMoZGVmLnByb3ZpZGVkSW4pO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBpbmplY3RhYmxlRGVmT3JJbmplY3RvckRlZkZhY3RvcnkodG9rZW46IFR5cGU8YW55PnwgSW5qZWN0aW9uVG9rZW48YW55Pik6ICgpID0+IGFueSB7XG4gIGNvbnN0IGluamVjdGFibGVEZWYgPSBnZXRJbmplY3RhYmxlRGVmKHRva2VuIGFzIEluamVjdGFibGVUeXBlPGFueT4pO1xuICBpZiAoaW5qZWN0YWJsZURlZiA9PT0gbnVsbCkge1xuICAgIGNvbnN0IGluamVjdG9yRGVmID0gZ2V0SW5qZWN0b3JEZWYodG9rZW4gYXMgSW5qZWN0b3JUeXBlPGFueT4pO1xuICAgIGlmIChpbmplY3RvckRlZiAhPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGluamVjdG9yRGVmLmZhY3Rvcnk7XG4gICAgfSBlbHNlIGlmICh0b2tlbiBpbnN0YW5jZW9mIEluamVjdGlvblRva2VuKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFRva2VuICR7c3RyaW5naWZ5KHRva2VuKX0gaXMgbWlzc2luZyBhbiBuZ0luamVjdGFibGVEZWYgZGVmaW5pdGlvbi5gKTtcbiAgICB9IGVsc2UgaWYgKHRva2VuIGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcbiAgICAgIGNvbnN0IHBhcmFtTGVuZ3RoID0gdG9rZW4ubGVuZ3RoO1xuICAgICAgaWYgKHBhcmFtTGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBhcmdzOiBzdHJpbmdbXSA9IG5ldyBBcnJheShwYXJhbUxlbmd0aCkuZmlsbCgnPycpO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgQ2FuJ3QgcmVzb2x2ZSBhbGwgcGFyYW1ldGVycyBmb3IgJHtzdHJpbmdpZnkodG9rZW4pfTogKCR7YXJncy5qb2luKCcsICcpfSkuYCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gKCkgPT4gbmV3ICh0b2tlbiBhcyBUeXBlPGFueT4pKCk7XG4gICAgfVxuICAgIHRocm93IG5ldyBFcnJvcigndW5yZWFjaGFibGUnKTtcbiAgfVxuICByZXR1cm4gaW5qZWN0YWJsZURlZi5mYWN0b3J5O1xufVxuXG5mdW5jdGlvbiBwcm92aWRlclRvUmVjb3JkKFxuICAgIHByb3ZpZGVyOiBTaW5nbGVQcm92aWRlciwgbmdNb2R1bGVUeXBlOiBJbmplY3RvclR5cGU8YW55PiwgcHJvdmlkZXJzOiBhbnlbXSk6IFJlY29yZDxhbnk+IHtcbiAgbGV0IGZhY3Rvcnk6ICgoKSA9PiBhbnkpfHVuZGVmaW5lZCA9IHByb3ZpZGVyVG9GYWN0b3J5KHByb3ZpZGVyLCBuZ01vZHVsZVR5cGUsIHByb3ZpZGVycyk7XG4gIGlmIChpc1ZhbHVlUHJvdmlkZXIocHJvdmlkZXIpKSB7XG4gICAgcmV0dXJuIG1ha2VSZWNvcmQodW5kZWZpbmVkLCBwcm92aWRlci51c2VWYWx1ZSk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG1ha2VSZWNvcmQoZmFjdG9yeSwgTk9UX1lFVCk7XG4gIH1cbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBhIGBTaW5nbGVQcm92aWRlcmAgaW50byBhIGZhY3RvcnkgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHByb3ZpZGVyIHByb3ZpZGVyIHRvIGNvbnZlcnQgdG8gZmFjdG9yeVxuICovXG5leHBvcnQgZnVuY3Rpb24gcHJvdmlkZXJUb0ZhY3RvcnkoXG4gICAgcHJvdmlkZXI6IFNpbmdsZVByb3ZpZGVyLCBuZ01vZHVsZVR5cGU/OiBJbmplY3RvclR5cGU8YW55PiwgcHJvdmlkZXJzPzogYW55W10pOiAoKSA9PiBhbnkge1xuICBsZXQgZmFjdG9yeTogKCgpID0+IGFueSl8dW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICBpZiAoaXNUeXBlUHJvdmlkZXIocHJvdmlkZXIpKSB7XG4gICAgcmV0dXJuIGluamVjdGFibGVEZWZPckluamVjdG9yRGVmRmFjdG9yeShyZXNvbHZlRm9yd2FyZFJlZihwcm92aWRlcikpO1xuICB9IGVsc2Uge1xuICAgIGlmIChpc1ZhbHVlUHJvdmlkZXIocHJvdmlkZXIpKSB7XG4gICAgICBmYWN0b3J5ID0gKCkgPT4gcmVzb2x2ZUZvcndhcmRSZWYocHJvdmlkZXIudXNlVmFsdWUpO1xuICAgIH0gZWxzZSBpZiAoaXNFeGlzdGluZ1Byb3ZpZGVyKHByb3ZpZGVyKSkge1xuICAgICAgZmFjdG9yeSA9ICgpID0+IGluamVjdChyZXNvbHZlRm9yd2FyZFJlZihwcm92aWRlci51c2VFeGlzdGluZykpO1xuICAgIH0gZWxzZSBpZiAoaXNGYWN0b3J5UHJvdmlkZXIocHJvdmlkZXIpKSB7XG4gICAgICBmYWN0b3J5ID0gKCkgPT4gcHJvdmlkZXIudXNlRmFjdG9yeSguLi5pbmplY3RBcmdzKHByb3ZpZGVyLmRlcHMgfHwgW10pKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgY2xhc3NSZWYgPSByZXNvbHZlRm9yd2FyZFJlZihcbiAgICAgICAgICBwcm92aWRlciAmJlxuICAgICAgICAgICgocHJvdmlkZXIgYXMgU3RhdGljQ2xhc3NQcm92aWRlciB8IENsYXNzUHJvdmlkZXIpLnVzZUNsYXNzIHx8IHByb3ZpZGVyLnByb3ZpZGUpKTtcbiAgICAgIGlmICghY2xhc3NSZWYpIHtcbiAgICAgICAgbGV0IG5nTW9kdWxlRGV0YWlsID0gJyc7XG4gICAgICAgIGlmIChuZ01vZHVsZVR5cGUgJiYgcHJvdmlkZXJzKSB7XG4gICAgICAgICAgY29uc3QgcHJvdmlkZXJEZXRhaWwgPSBwcm92aWRlcnMubWFwKHYgPT4gdiA9PSBwcm92aWRlciA/ICc/JyArIHByb3ZpZGVyICsgJz8nIDogJy4uLicpO1xuICAgICAgICAgIG5nTW9kdWxlRGV0YWlsID1cbiAgICAgICAgICAgICAgYCAtIG9ubHkgaW5zdGFuY2VzIG9mIFByb3ZpZGVyIGFuZCBUeXBlIGFyZSBhbGxvd2VkLCBnb3Q6IFske3Byb3ZpZGVyRGV0YWlsLmpvaW4oJywgJyl9XWA7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYEludmFsaWQgcHJvdmlkZXIgZm9yIHRoZSBOZ01vZHVsZSAnJHtzdHJpbmdpZnkobmdNb2R1bGVUeXBlKX0nYCArIG5nTW9kdWxlRGV0YWlsKTtcbiAgICAgIH1cbiAgICAgIGlmIChoYXNEZXBzKHByb3ZpZGVyKSkge1xuICAgICAgICBmYWN0b3J5ID0gKCkgPT4gbmV3IChjbGFzc1JlZikoLi4uaW5qZWN0QXJncyhwcm92aWRlci5kZXBzKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gaW5qZWN0YWJsZURlZk9ySW5qZWN0b3JEZWZGYWN0b3J5KGNsYXNzUmVmKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhY3Rvcnk7XG59XG5cbmZ1bmN0aW9uIG1ha2VSZWNvcmQ8VD4oXG4gICAgZmFjdG9yeTogKCgpID0+IFQpIHwgdW5kZWZpbmVkLCB2YWx1ZTogVCB8IHt9LCBtdWx0aTogYm9vbGVhbiA9IGZhbHNlKTogUmVjb3JkPFQ+IHtcbiAgcmV0dXJuIHtcbiAgICBmYWN0b3J5OiBmYWN0b3J5LFxuICAgIHZhbHVlOiB2YWx1ZSxcbiAgICBtdWx0aTogbXVsdGkgPyBbXSA6IHVuZGVmaW5lZCxcbiAgfTtcbn1cblxuZnVuY3Rpb24gZGVlcEZvckVhY2g8VD4oaW5wdXQ6IChUIHwgYW55W10pW10sIGZuOiAodmFsdWU6IFQpID0+IHZvaWQpOiB2b2lkIHtcbiAgaW5wdXQuZm9yRWFjaCh2YWx1ZSA9PiBBcnJheS5pc0FycmF5KHZhbHVlKSA/IGRlZXBGb3JFYWNoKHZhbHVlLCBmbikgOiBmbih2YWx1ZSkpO1xufVxuXG5mdW5jdGlvbiBpc1ZhbHVlUHJvdmlkZXIodmFsdWU6IFNpbmdsZVByb3ZpZGVyKTogdmFsdWUgaXMgVmFsdWVQcm92aWRlciB7XG4gIHJldHVybiB2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCcgJiYgVVNFX1ZBTFVFIGluIHZhbHVlO1xufVxuXG5mdW5jdGlvbiBpc0V4aXN0aW5nUHJvdmlkZXIodmFsdWU6IFNpbmdsZVByb3ZpZGVyKTogdmFsdWUgaXMgRXhpc3RpbmdQcm92aWRlciB7XG4gIHJldHVybiAhISh2YWx1ZSAmJiAodmFsdWUgYXMgRXhpc3RpbmdQcm92aWRlcikudXNlRXhpc3RpbmcpO1xufVxuXG5mdW5jdGlvbiBpc0ZhY3RvcnlQcm92aWRlcih2YWx1ZTogU2luZ2xlUHJvdmlkZXIpOiB2YWx1ZSBpcyBGYWN0b3J5UHJvdmlkZXIge1xuICByZXR1cm4gISEodmFsdWUgJiYgKHZhbHVlIGFzIEZhY3RvcnlQcm92aWRlcikudXNlRmFjdG9yeSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1R5cGVQcm92aWRlcih2YWx1ZTogU2luZ2xlUHJvdmlkZXIpOiB2YWx1ZSBpcyBUeXBlUHJvdmlkZXIge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nO1xufVxuXG5mdW5jdGlvbiBoYXNEZXBzKHZhbHVlOiBDbGFzc1Byb3ZpZGVyIHwgQ29uc3RydWN0b3JQcm92aWRlciB8IFN0YXRpY0NsYXNzUHJvdmlkZXIpOlxuICAgIHZhbHVlIGlzIENsYXNzUHJvdmlkZXIme2RlcHM6IGFueVtdfSB7XG4gIHJldHVybiAhISh2YWx1ZSBhcyBhbnkpLmRlcHM7XG59XG5cbmZ1bmN0aW9uIGhhc09uRGVzdHJveSh2YWx1ZTogYW55KTogdmFsdWUgaXMgT25EZXN0cm95IHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgIT0gbnVsbCAmJiAodmFsdWUgYXMgT25EZXN0cm95KS5uZ09uRGVzdHJveSAmJlxuICAgICAgdHlwZW9mKHZhbHVlIGFzIE9uRGVzdHJveSkubmdPbkRlc3Ryb3kgPT09ICdmdW5jdGlvbic7XG59XG5cbmZ1bmN0aW9uIGNvdWxkQmVJbmplY3RhYmxlVHlwZSh2YWx1ZTogYW55KTogdmFsdWUgaXMgVHlwZTxhbnk+fEluamVjdGlvblRva2VuPGFueT4ge1xuICByZXR1cm4gKHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJykgfHxcbiAgICAgICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlIGluc3RhbmNlb2YgSW5qZWN0aW9uVG9rZW4pO1xufVxuIl19