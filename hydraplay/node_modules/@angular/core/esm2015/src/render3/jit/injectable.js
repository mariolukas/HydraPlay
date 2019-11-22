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
import { getClosureSafeProperty } from '../../util/property';
import { NG_INJECTABLE_DEF } from '../fields';
import { getCompilerFacade } from './compiler_facade';
import { angularCoreEnv } from './environment';
import { convertDependencies, reflectDependencies } from './util';
/**
 * Compile an Angular injectable according to its `Injectable` metadata, and patch the resulting
 * `ngInjectableDef` onto the injectable type.
 * @param {?} type
 * @param {?=} srcMeta
 * @return {?}
 */
export function compileInjectable(type, srcMeta) {
    /** @type {?} */
    let def = null;
    // if NG_INJECTABLE_DEF is already defined on this class then don't overwrite it
    if (type.hasOwnProperty(NG_INJECTABLE_DEF))
        return;
    Object.defineProperty(type, NG_INJECTABLE_DEF, {
        get: () => {
            if (def === null) {
                // Allow the compilation of a class with a `@Injectable()` decorator without parameters
                /** @type {?} */
                const meta = srcMeta || { providedIn: null };
                /** @type {?} */
                const hasAProvider = isUseClassProvider(meta) || isUseFactoryProvider(meta) ||
                    isUseValueProvider(meta) || isUseExistingProvider(meta);
                /** @type {?} */
                const compilerMeta = {
                    name: type.name,
                    type: type,
                    typeArgumentCount: 0,
                    providedIn: meta.providedIn,
                    ctorDeps: reflectDependencies(type),
                    userDeps: undefined
                };
                if ((isUseClassProvider(meta) || isUseFactoryProvider(meta)) && meta.deps !== undefined) {
                    compilerMeta.userDeps = convertDependencies(meta.deps);
                }
                if (!hasAProvider) {
                    // In the case the user specifies a type provider, treat it as {provide: X, useClass: X}.
                    // The deps will have been reflected above, causing the factory to create the class by
                    // calling
                    // its constructor with injected deps.
                    compilerMeta.useClass = type;
                }
                else if (isUseClassProvider(meta)) {
                    // The user explicitly specified useClass, and may or may not have provided deps.
                    compilerMeta.useClass = meta.useClass;
                }
                else if (isUseValueProvider(meta)) {
                    // The user explicitly specified useValue.
                    compilerMeta.useValue = meta.useValue;
                }
                else if (isUseFactoryProvider(meta)) {
                    // The user explicitly specified useFactory.
                    compilerMeta.useFactory = meta.useFactory;
                }
                else if (isUseExistingProvider(meta)) {
                    // The user explicitly specified useExisting.
                    compilerMeta.useExisting = meta.useExisting;
                }
                else {
                    // Can't happen - either hasAProvider will be false, or one of the providers will be set.
                    throw new Error(`Unreachable state.`);
                }
                def = getCompilerFacade().compileInjectable(angularCoreEnv, `ng://${type.name}/ngInjectableDef.js`, compilerMeta);
            }
            return def;
        },
    });
}
const ɵ0 = getClosureSafeProperty;
/** @type {?} */
const USE_VALUE = getClosureSafeProperty({ provide: String, useValue: ɵ0 });
/**
 * @param {?} meta
 * @return {?}
 */
function isUseClassProvider(meta) {
    return ((/** @type {?} */ (meta))).useClass !== undefined;
}
/**
 * @param {?} meta
 * @return {?}
 */
function isUseValueProvider(meta) {
    return USE_VALUE in meta;
}
/**
 * @param {?} meta
 * @return {?}
 */
function isUseFactoryProvider(meta) {
    return ((/** @type {?} */ (meta))).useFactory !== undefined;
}
/**
 * @param {?} meta
 * @return {?}
 */
function isUseExistingProvider(meta) {
    return ((/** @type {?} */ (meta))).useExisting !== undefined;
}
export { ɵ0 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5qZWN0YWJsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL3JlbmRlcjMvaml0L2luamVjdGFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFXQSxPQUFPLEVBQUMsc0JBQXNCLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUMzRCxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSxXQUFXLENBQUM7QUFFNUMsT0FBTyxFQUE2QixpQkFBaUIsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ2hGLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDN0MsT0FBTyxFQUFDLG1CQUFtQixFQUFFLG1CQUFtQixFQUFDLE1BQU0sUUFBUSxDQUFDOzs7Ozs7OztBQVFoRSxNQUFNLFVBQVUsaUJBQWlCLENBQUMsSUFBZSxFQUFFLE9BQW9COztRQUNqRSxHQUFHLEdBQVEsSUFBSTtJQUVuQixnRkFBZ0Y7SUFDaEYsSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLGlCQUFpQixDQUFDO1FBQUUsT0FBTztJQUVuRCxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxpQkFBaUIsRUFBRTtRQUM3QyxHQUFHLEVBQUUsR0FBRyxFQUFFO1lBQ1IsSUFBSSxHQUFHLEtBQUssSUFBSSxFQUFFOzs7c0JBRVYsSUFBSSxHQUFlLE9BQU8sSUFBSSxFQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUM7O3NCQUNoRCxZQUFZLEdBQUcsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksb0JBQW9CLENBQUMsSUFBSSxDQUFDO29CQUN2RSxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxxQkFBcUIsQ0FBQyxJQUFJLENBQUM7O3NCQUdyRCxZQUFZLEdBQStCO29CQUMvQyxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7b0JBQ2YsSUFBSSxFQUFFLElBQUk7b0JBQ1YsaUJBQWlCLEVBQUUsQ0FBQztvQkFDcEIsVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVO29CQUMzQixRQUFRLEVBQUUsbUJBQW1CLENBQUMsSUFBSSxDQUFDO29CQUNuQyxRQUFRLEVBQUUsU0FBUztpQkFDcEI7Z0JBQ0QsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxJQUFJLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxTQUFTLEVBQUU7b0JBQ3ZGLFlBQVksQ0FBQyxRQUFRLEdBQUcsbUJBQW1CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUN4RDtnQkFDRCxJQUFJLENBQUMsWUFBWSxFQUFFO29CQUNqQix5RkFBeUY7b0JBQ3pGLHNGQUFzRjtvQkFDdEYsVUFBVTtvQkFDVixzQ0FBc0M7b0JBQ3RDLFlBQVksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO2lCQUM5QjtxQkFBTSxJQUFJLGtCQUFrQixDQUFDLElBQUksQ0FBQyxFQUFFO29CQUNuQyxpRkFBaUY7b0JBQ2pGLFlBQVksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztpQkFDdkM7cUJBQU0sSUFBSSxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFDbkMsMENBQTBDO29CQUMxQyxZQUFZLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7aUJBQ3ZDO3FCQUFNLElBQUksb0JBQW9CLENBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQ3JDLDRDQUE0QztvQkFDNUMsWUFBWSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO2lCQUMzQztxQkFBTSxJQUFJLHFCQUFxQixDQUFDLElBQUksQ0FBQyxFQUFFO29CQUN0Qyw2Q0FBNkM7b0JBQzdDLFlBQVksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztpQkFDN0M7cUJBQU07b0JBQ0wseUZBQXlGO29CQUN6RixNQUFNLElBQUksS0FBSyxDQUFDLG9CQUFvQixDQUFDLENBQUM7aUJBQ3ZDO2dCQUNELEdBQUcsR0FBRyxpQkFBaUIsRUFBRSxDQUFDLGlCQUFpQixDQUN2QyxjQUFjLEVBQUUsUUFBUSxJQUFJLENBQUMsSUFBSSxxQkFBcUIsRUFBRSxZQUFZLENBQUMsQ0FBQzthQUMzRTtZQUNELE9BQU8sR0FBRyxDQUFDO1FBQ2IsQ0FBQztLQUNGLENBQUMsQ0FBQztBQUNMLENBQUM7V0FLcUUsc0JBQXNCOztNQUR0RixTQUFTLEdBQ1gsc0JBQXNCLENBQWdCLEVBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxRQUFRLElBQXdCLEVBQUMsQ0FBQzs7Ozs7QUFFOUYsU0FBUyxrQkFBa0IsQ0FBQyxJQUFnQjtJQUMxQyxPQUFPLENBQUMsbUJBQUEsSUFBSSxFQUFvQixDQUFDLENBQUMsUUFBUSxLQUFLLFNBQVMsQ0FBQztBQUMzRCxDQUFDOzs7OztBQUVELFNBQVMsa0JBQWtCLENBQUMsSUFBZ0I7SUFDMUMsT0FBTyxTQUFTLElBQUksSUFBSSxDQUFDO0FBQzNCLENBQUM7Ozs7O0FBRUQsU0FBUyxvQkFBb0IsQ0FBQyxJQUFnQjtJQUM1QyxPQUFPLENBQUMsbUJBQUEsSUFBSSxFQUF1QixDQUFDLENBQUMsVUFBVSxLQUFLLFNBQVMsQ0FBQztBQUNoRSxDQUFDOzs7OztBQUVELFNBQVMscUJBQXFCLENBQUMsSUFBZ0I7SUFDN0MsT0FBTyxDQUFDLG1CQUFBLElBQUksRUFBd0IsQ0FBQyxDQUFDLFdBQVcsS0FBSyxTQUFTLENBQUM7QUFDbEUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICcuLi8uLi9kaS9pbmplY3RhYmxlJztcbmltcG9ydCB7Q2xhc3NTYW5zUHJvdmlkZXIsIEV4aXN0aW5nU2Fuc1Byb3ZpZGVyLCBGYWN0b3J5U2Fuc1Byb3ZpZGVyLCBWYWx1ZVByb3ZpZGVyLCBWYWx1ZVNhbnNQcm92aWRlcn0gZnJvbSAnLi4vLi4vZGkvcHJvdmlkZXInO1xuaW1wb3J0IHtUeXBlfSBmcm9tICcuLi8uLi90eXBlJztcbmltcG9ydCB7Z2V0Q2xvc3VyZVNhZmVQcm9wZXJ0eX0gZnJvbSAnLi4vLi4vdXRpbC9wcm9wZXJ0eSc7XG5pbXBvcnQge05HX0lOSkVDVEFCTEVfREVGfSBmcm9tICcuLi9maWVsZHMnO1xuXG5pbXBvcnQge1IzSW5qZWN0YWJsZU1ldGFkYXRhRmFjYWRlLCBnZXRDb21waWxlckZhY2FkZX0gZnJvbSAnLi9jb21waWxlcl9mYWNhZGUnO1xuaW1wb3J0IHthbmd1bGFyQ29yZUVudn0gZnJvbSAnLi9lbnZpcm9ubWVudCc7XG5pbXBvcnQge2NvbnZlcnREZXBlbmRlbmNpZXMsIHJlZmxlY3REZXBlbmRlbmNpZXN9IGZyb20gJy4vdXRpbCc7XG5cblxuXG4vKipcbiAqIENvbXBpbGUgYW4gQW5ndWxhciBpbmplY3RhYmxlIGFjY29yZGluZyB0byBpdHMgYEluamVjdGFibGVgIG1ldGFkYXRhLCBhbmQgcGF0Y2ggdGhlIHJlc3VsdGluZ1xuICogYG5nSW5qZWN0YWJsZURlZmAgb250byB0aGUgaW5qZWN0YWJsZSB0eXBlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY29tcGlsZUluamVjdGFibGUodHlwZTogVHlwZTxhbnk+LCBzcmNNZXRhPzogSW5qZWN0YWJsZSk6IHZvaWQge1xuICBsZXQgZGVmOiBhbnkgPSBudWxsO1xuXG4gIC8vIGlmIE5HX0lOSkVDVEFCTEVfREVGIGlzIGFscmVhZHkgZGVmaW5lZCBvbiB0aGlzIGNsYXNzIHRoZW4gZG9uJ3Qgb3ZlcndyaXRlIGl0XG4gIGlmICh0eXBlLmhhc093blByb3BlcnR5KE5HX0lOSkVDVEFCTEVfREVGKSkgcmV0dXJuO1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0eXBlLCBOR19JTkpFQ1RBQkxFX0RFRiwge1xuICAgIGdldDogKCkgPT4ge1xuICAgICAgaWYgKGRlZiA9PT0gbnVsbCkge1xuICAgICAgICAvLyBBbGxvdyB0aGUgY29tcGlsYXRpb24gb2YgYSBjbGFzcyB3aXRoIGEgYEBJbmplY3RhYmxlKClgIGRlY29yYXRvciB3aXRob3V0IHBhcmFtZXRlcnNcbiAgICAgICAgY29uc3QgbWV0YTogSW5qZWN0YWJsZSA9IHNyY01ldGEgfHwge3Byb3ZpZGVkSW46IG51bGx9O1xuICAgICAgICBjb25zdCBoYXNBUHJvdmlkZXIgPSBpc1VzZUNsYXNzUHJvdmlkZXIobWV0YSkgfHwgaXNVc2VGYWN0b3J5UHJvdmlkZXIobWV0YSkgfHxcbiAgICAgICAgICAgIGlzVXNlVmFsdWVQcm92aWRlcihtZXRhKSB8fCBpc1VzZUV4aXN0aW5nUHJvdmlkZXIobWV0YSk7XG5cblxuICAgICAgICBjb25zdCBjb21waWxlck1ldGE6IFIzSW5qZWN0YWJsZU1ldGFkYXRhRmFjYWRlID0ge1xuICAgICAgICAgIG5hbWU6IHR5cGUubmFtZSxcbiAgICAgICAgICB0eXBlOiB0eXBlLFxuICAgICAgICAgIHR5cGVBcmd1bWVudENvdW50OiAwLFxuICAgICAgICAgIHByb3ZpZGVkSW46IG1ldGEucHJvdmlkZWRJbixcbiAgICAgICAgICBjdG9yRGVwczogcmVmbGVjdERlcGVuZGVuY2llcyh0eXBlKSxcbiAgICAgICAgICB1c2VyRGVwczogdW5kZWZpbmVkXG4gICAgICAgIH07XG4gICAgICAgIGlmICgoaXNVc2VDbGFzc1Byb3ZpZGVyKG1ldGEpIHx8IGlzVXNlRmFjdG9yeVByb3ZpZGVyKG1ldGEpKSAmJiBtZXRhLmRlcHMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGNvbXBpbGVyTWV0YS51c2VyRGVwcyA9IGNvbnZlcnREZXBlbmRlbmNpZXMobWV0YS5kZXBzKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWhhc0FQcm92aWRlcikge1xuICAgICAgICAgIC8vIEluIHRoZSBjYXNlIHRoZSB1c2VyIHNwZWNpZmllcyBhIHR5cGUgcHJvdmlkZXIsIHRyZWF0IGl0IGFzIHtwcm92aWRlOiBYLCB1c2VDbGFzczogWH0uXG4gICAgICAgICAgLy8gVGhlIGRlcHMgd2lsbCBoYXZlIGJlZW4gcmVmbGVjdGVkIGFib3ZlLCBjYXVzaW5nIHRoZSBmYWN0b3J5IHRvIGNyZWF0ZSB0aGUgY2xhc3MgYnlcbiAgICAgICAgICAvLyBjYWxsaW5nXG4gICAgICAgICAgLy8gaXRzIGNvbnN0cnVjdG9yIHdpdGggaW5qZWN0ZWQgZGVwcy5cbiAgICAgICAgICBjb21waWxlck1ldGEudXNlQ2xhc3MgPSB0eXBlO1xuICAgICAgICB9IGVsc2UgaWYgKGlzVXNlQ2xhc3NQcm92aWRlcihtZXRhKSkge1xuICAgICAgICAgIC8vIFRoZSB1c2VyIGV4cGxpY2l0bHkgc3BlY2lmaWVkIHVzZUNsYXNzLCBhbmQgbWF5IG9yIG1heSBub3QgaGF2ZSBwcm92aWRlZCBkZXBzLlxuICAgICAgICAgIGNvbXBpbGVyTWV0YS51c2VDbGFzcyA9IG1ldGEudXNlQ2xhc3M7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNVc2VWYWx1ZVByb3ZpZGVyKG1ldGEpKSB7XG4gICAgICAgICAgLy8gVGhlIHVzZXIgZXhwbGljaXRseSBzcGVjaWZpZWQgdXNlVmFsdWUuXG4gICAgICAgICAgY29tcGlsZXJNZXRhLnVzZVZhbHVlID0gbWV0YS51c2VWYWx1ZTtcbiAgICAgICAgfSBlbHNlIGlmIChpc1VzZUZhY3RvcnlQcm92aWRlcihtZXRhKSkge1xuICAgICAgICAgIC8vIFRoZSB1c2VyIGV4cGxpY2l0bHkgc3BlY2lmaWVkIHVzZUZhY3RvcnkuXG4gICAgICAgICAgY29tcGlsZXJNZXRhLnVzZUZhY3RvcnkgPSBtZXRhLnVzZUZhY3Rvcnk7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNVc2VFeGlzdGluZ1Byb3ZpZGVyKG1ldGEpKSB7XG4gICAgICAgICAgLy8gVGhlIHVzZXIgZXhwbGljaXRseSBzcGVjaWZpZWQgdXNlRXhpc3RpbmcuXG4gICAgICAgICAgY29tcGlsZXJNZXRhLnVzZUV4aXN0aW5nID0gbWV0YS51c2VFeGlzdGluZztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBDYW4ndCBoYXBwZW4gLSBlaXRoZXIgaGFzQVByb3ZpZGVyIHdpbGwgYmUgZmFsc2UsIG9yIG9uZSBvZiB0aGUgcHJvdmlkZXJzIHdpbGwgYmUgc2V0LlxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5yZWFjaGFibGUgc3RhdGUuYCk7XG4gICAgICAgIH1cbiAgICAgICAgZGVmID0gZ2V0Q29tcGlsZXJGYWNhZGUoKS5jb21waWxlSW5qZWN0YWJsZShcbiAgICAgICAgICAgIGFuZ3VsYXJDb3JlRW52LCBgbmc6Ly8ke3R5cGUubmFtZX0vbmdJbmplY3RhYmxlRGVmLmpzYCwgY29tcGlsZXJNZXRhKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBkZWY7XG4gICAgfSxcbiAgfSk7XG59XG5cbnR5cGUgVXNlQ2xhc3NQcm92aWRlciA9IEluamVjdGFibGUgJiBDbGFzc1NhbnNQcm92aWRlciAmIHtkZXBzPzogYW55W119O1xuXG5jb25zdCBVU0VfVkFMVUUgPVxuICAgIGdldENsb3N1cmVTYWZlUHJvcGVydHk8VmFsdWVQcm92aWRlcj4oe3Byb3ZpZGU6IFN0cmluZywgdXNlVmFsdWU6IGdldENsb3N1cmVTYWZlUHJvcGVydHl9KTtcblxuZnVuY3Rpb24gaXNVc2VDbGFzc1Byb3ZpZGVyKG1ldGE6IEluamVjdGFibGUpOiBtZXRhIGlzIFVzZUNsYXNzUHJvdmlkZXIge1xuICByZXR1cm4gKG1ldGEgYXMgVXNlQ2xhc3NQcm92aWRlcikudXNlQ2xhc3MgIT09IHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gaXNVc2VWYWx1ZVByb3ZpZGVyKG1ldGE6IEluamVjdGFibGUpOiBtZXRhIGlzIEluamVjdGFibGUmVmFsdWVTYW5zUHJvdmlkZXIge1xuICByZXR1cm4gVVNFX1ZBTFVFIGluIG1ldGE7XG59XG5cbmZ1bmN0aW9uIGlzVXNlRmFjdG9yeVByb3ZpZGVyKG1ldGE6IEluamVjdGFibGUpOiBtZXRhIGlzIEluamVjdGFibGUmRmFjdG9yeVNhbnNQcm92aWRlciB7XG4gIHJldHVybiAobWV0YSBhcyBGYWN0b3J5U2Fuc1Byb3ZpZGVyKS51c2VGYWN0b3J5ICE9PSB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIGlzVXNlRXhpc3RpbmdQcm92aWRlcihtZXRhOiBJbmplY3RhYmxlKTogbWV0YSBpcyBJbmplY3RhYmxlJkV4aXN0aW5nU2Fuc1Byb3ZpZGVyIHtcbiAgcmV0dXJuIChtZXRhIGFzIEV4aXN0aW5nU2Fuc1Byb3ZpZGVyKS51c2VFeGlzdGluZyAhPT0gdW5kZWZpbmVkO1xufVxuIl19