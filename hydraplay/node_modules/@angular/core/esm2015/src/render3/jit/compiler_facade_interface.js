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
 * A set of interfaces which are shared between `@angular/core` and `@angular/compiler` to allow
 * for late binding of `@angular/compiler` for JIT purposes.
 *
 * This file has two copies. Please ensure that they are in sync:
 *  - packages/compiler/src/compiler_facade_interface.ts             (master)
 *  - packages/core/src/render3/jit/compiler_facade_interface.ts     (copy)
 *
 * Please ensure that the two files are in sync using this command:
 * ```
 * cp packages/compiler/src/compiler_facade_interface.ts \
 *    packages/core/src/render3/jit/compiler_facade_interface.ts
 * ```
 */
/**
 * @record
 */
export function ExportedCompilerFacade() { }
if (false) {
    /** @type {?} */
    ExportedCompilerFacade.prototype.ɵcompilerFacade;
}
/**
 * @record
 */
export function CompilerFacade() { }
if (false) {
    /** @type {?} */
    CompilerFacade.prototype.R3ResolvedDependencyType;
    /**
     * @param {?} angularCoreEnv
     * @param {?} sourceMapUrl
     * @param {?} meta
     * @return {?}
     */
    CompilerFacade.prototype.compilePipe = function (angularCoreEnv, sourceMapUrl, meta) { };
    /**
     * @param {?} angularCoreEnv
     * @param {?} sourceMapUrl
     * @param {?} meta
     * @return {?}
     */
    CompilerFacade.prototype.compileInjectable = function (angularCoreEnv, sourceMapUrl, meta) { };
    /**
     * @param {?} angularCoreEnv
     * @param {?} sourceMapUrl
     * @param {?} meta
     * @return {?}
     */
    CompilerFacade.prototype.compileInjector = function (angularCoreEnv, sourceMapUrl, meta) { };
    /**
     * @param {?} angularCoreEnv
     * @param {?} sourceMapUrl
     * @param {?} meta
     * @return {?}
     */
    CompilerFacade.prototype.compileNgModule = function (angularCoreEnv, sourceMapUrl, meta) { };
    /**
     * @param {?} angularCoreEnv
     * @param {?} sourceMapUrl
     * @param {?} meta
     * @return {?}
     */
    CompilerFacade.prototype.compileDirective = function (angularCoreEnv, sourceMapUrl, meta) { };
    /**
     * @param {?} angularCoreEnv
     * @param {?} sourceMapUrl
     * @param {?} meta
     * @return {?}
     */
    CompilerFacade.prototype.compileComponent = function (angularCoreEnv, sourceMapUrl, meta) { };
}
/**
 * @record
 */
export function CoreEnvironment() { }
/** @enum {number} */
const R3ResolvedDependencyType = {
    Token: 0,
    Attribute: 1,
};
export { R3ResolvedDependencyType };
R3ResolvedDependencyType[R3ResolvedDependencyType.Token] = 'Token';
R3ResolvedDependencyType[R3ResolvedDependencyType.Attribute] = 'Attribute';
/**
 * @record
 */
export function R3DependencyMetadataFacade() { }
if (false) {
    /** @type {?} */
    R3DependencyMetadataFacade.prototype.token;
    /** @type {?} */
    R3DependencyMetadataFacade.prototype.resolved;
    /** @type {?} */
    R3DependencyMetadataFacade.prototype.host;
    /** @type {?} */
    R3DependencyMetadataFacade.prototype.optional;
    /** @type {?} */
    R3DependencyMetadataFacade.prototype.self;
    /** @type {?} */
    R3DependencyMetadataFacade.prototype.skipSelf;
}
/**
 * @record
 */
export function R3PipeMetadataFacade() { }
if (false) {
    /** @type {?} */
    R3PipeMetadataFacade.prototype.name;
    /** @type {?} */
    R3PipeMetadataFacade.prototype.type;
    /** @type {?} */
    R3PipeMetadataFacade.prototype.pipeName;
    /** @type {?} */
    R3PipeMetadataFacade.prototype.deps;
    /** @type {?} */
    R3PipeMetadataFacade.prototype.pure;
}
/**
 * @record
 */
export function R3InjectableMetadataFacade() { }
if (false) {
    /** @type {?} */
    R3InjectableMetadataFacade.prototype.name;
    /** @type {?} */
    R3InjectableMetadataFacade.prototype.type;
    /** @type {?} */
    R3InjectableMetadataFacade.prototype.typeArgumentCount;
    /** @type {?} */
    R3InjectableMetadataFacade.prototype.ctorDeps;
    /** @type {?} */
    R3InjectableMetadataFacade.prototype.providedIn;
    /** @type {?|undefined} */
    R3InjectableMetadataFacade.prototype.useClass;
    /** @type {?|undefined} */
    R3InjectableMetadataFacade.prototype.useFactory;
    /** @type {?|undefined} */
    R3InjectableMetadataFacade.prototype.useExisting;
    /** @type {?|undefined} */
    R3InjectableMetadataFacade.prototype.useValue;
    /** @type {?|undefined} */
    R3InjectableMetadataFacade.prototype.userDeps;
}
/**
 * @record
 */
export function R3NgModuleMetadataFacade() { }
if (false) {
    /** @type {?} */
    R3NgModuleMetadataFacade.prototype.type;
    /** @type {?} */
    R3NgModuleMetadataFacade.prototype.bootstrap;
    /** @type {?} */
    R3NgModuleMetadataFacade.prototype.declarations;
    /** @type {?} */
    R3NgModuleMetadataFacade.prototype.imports;
    /** @type {?} */
    R3NgModuleMetadataFacade.prototype.exports;
    /** @type {?} */
    R3NgModuleMetadataFacade.prototype.emitInline;
}
/**
 * @record
 */
export function R3InjectorMetadataFacade() { }
if (false) {
    /** @type {?} */
    R3InjectorMetadataFacade.prototype.name;
    /** @type {?} */
    R3InjectorMetadataFacade.prototype.type;
    /** @type {?} */
    R3InjectorMetadataFacade.prototype.deps;
    /** @type {?} */
    R3InjectorMetadataFacade.prototype.providers;
    /** @type {?} */
    R3InjectorMetadataFacade.prototype.imports;
}
/**
 * @record
 */
export function R3DirectiveMetadataFacade() { }
if (false) {
    /** @type {?} */
    R3DirectiveMetadataFacade.prototype.name;
    /** @type {?} */
    R3DirectiveMetadataFacade.prototype.type;
    /** @type {?} */
    R3DirectiveMetadataFacade.prototype.typeArgumentCount;
    /** @type {?} */
    R3DirectiveMetadataFacade.prototype.typeSourceSpan;
    /** @type {?} */
    R3DirectiveMetadataFacade.prototype.deps;
    /** @type {?} */
    R3DirectiveMetadataFacade.prototype.selector;
    /** @type {?} */
    R3DirectiveMetadataFacade.prototype.queries;
    /** @type {?} */
    R3DirectiveMetadataFacade.prototype.host;
    /** @type {?} */
    R3DirectiveMetadataFacade.prototype.propMetadata;
    /** @type {?} */
    R3DirectiveMetadataFacade.prototype.lifecycle;
    /** @type {?} */
    R3DirectiveMetadataFacade.prototype.inputs;
    /** @type {?} */
    R3DirectiveMetadataFacade.prototype.outputs;
    /** @type {?} */
    R3DirectiveMetadataFacade.prototype.usesInheritance;
    /** @type {?} */
    R3DirectiveMetadataFacade.prototype.exportAs;
    /** @type {?} */
    R3DirectiveMetadataFacade.prototype.providers;
}
/**
 * @record
 */
export function R3ComponentMetadataFacade() { }
if (false) {
    /** @type {?} */
    R3ComponentMetadataFacade.prototype.template;
    /** @type {?} */
    R3ComponentMetadataFacade.prototype.preserveWhitespaces;
    /** @type {?} */
    R3ComponentMetadataFacade.prototype.animations;
    /** @type {?} */
    R3ComponentMetadataFacade.prototype.viewQueries;
    /** @type {?} */
    R3ComponentMetadataFacade.prototype.pipes;
    /** @type {?} */
    R3ComponentMetadataFacade.prototype.directives;
    /** @type {?} */
    R3ComponentMetadataFacade.prototype.styles;
    /** @type {?} */
    R3ComponentMetadataFacade.prototype.encapsulation;
    /** @type {?} */
    R3ComponentMetadataFacade.prototype.viewProviders;
    /** @type {?|undefined} */
    R3ComponentMetadataFacade.prototype.interpolation;
    /** @type {?|undefined} */
    R3ComponentMetadataFacade.prototype.changeDetection;
}
/**
 * @record
 */
export function R3QueryMetadataFacade() { }
if (false) {
    /** @type {?} */
    R3QueryMetadataFacade.prototype.propertyName;
    /** @type {?} */
    R3QueryMetadataFacade.prototype.first;
    /** @type {?} */
    R3QueryMetadataFacade.prototype.predicate;
    /** @type {?} */
    R3QueryMetadataFacade.prototype.descendants;
    /** @type {?} */
    R3QueryMetadataFacade.prototype.read;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGlsZXJfZmFjYWRlX2ludGVyZmFjZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL3JlbmRlcjMvaml0L2NvbXBpbGVyX2ZhY2FkZV9pbnRlcmZhY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXdCQSw0Q0FBNEU7OztJQUFsQyxpREFBZ0M7Ozs7O0FBRTFFLG9DQWVDOzs7SUFEQyxrREFBMEQ7Ozs7Ozs7SUFiMUQseUZBQ1E7Ozs7Ozs7SUFDUiwrRkFDa0c7Ozs7Ozs7SUFDbEcsNkZBQ2dHOzs7Ozs7O0lBQ2hHLDZGQUNnRzs7Ozs7OztJQUNoRyw4RkFDaUc7Ozs7Ozs7SUFDakcsOEZBQ2lHOzs7OztBQUtuRyxxQ0FBOEQ7OztJQWE1RCxRQUFTO0lBQ1QsWUFBYTs7Ozs7Ozs7QUFHZixnREFPQzs7O0lBTkMsMkNBQVc7O0lBQ1gsOENBQW1DOztJQUNuQywwQ0FBYzs7SUFDZCw4Q0FBa0I7O0lBQ2xCLDBDQUFjOztJQUNkLDhDQUFrQjs7Ozs7QUFHcEIsMENBTUM7OztJQUxDLG9DQUFhOztJQUNiLG9DQUFVOztJQUNWLHdDQUFpQjs7SUFDakIsb0NBQXdDOztJQUN4QyxvQ0FBYzs7Ozs7QUFHaEIsZ0RBV0M7OztJQVZDLDBDQUFhOztJQUNiLDBDQUFVOztJQUNWLHVEQUEwQjs7SUFDMUIsOENBQTRDOztJQUM1QyxnREFBZ0I7O0lBQ2hCLDhDQUFlOztJQUNmLGdEQUFpQjs7SUFDakIsaURBQWtCOztJQUNsQiw4Q0FBZTs7SUFDZiw4Q0FBd0M7Ozs7O0FBRzFDLDhDQU9DOzs7SUFOQyx3Q0FBVTs7SUFDViw2Q0FBc0I7O0lBQ3RCLGdEQUF5Qjs7SUFDekIsMkNBQW9COztJQUNwQiwyQ0FBb0I7O0lBQ3BCLDhDQUFvQjs7Ozs7QUFHdEIsOENBTUM7OztJQUxDLHdDQUFhOztJQUNiLHdDQUFVOztJQUNWLHdDQUF3Qzs7SUFDeEMsNkNBQWlCOztJQUNqQiwyQ0FBZTs7Ozs7QUFHakIsK0NBZ0JDOzs7SUFmQyx5Q0FBYTs7SUFDYix5Q0FBVTs7SUFDVixzREFBMEI7O0lBQzFCLG1EQUFxQjs7SUFDckIseUNBQXdDOztJQUN4Qyw2Q0FBc0I7O0lBQ3RCLDRDQUFpQzs7SUFDakMseUNBQThCOztJQUM5QixpREFBcUM7O0lBQ3JDLDhDQUFxQzs7SUFDckMsMkNBQWlCOztJQUNqQiw0Q0FBa0I7O0lBQ2xCLG9EQUF5Qjs7SUFDekIsNkNBQXNCOztJQUN0Qiw4Q0FBMkI7Ozs7O0FBRzdCLCtDQVlDOzs7SUFYQyw2Q0FBaUI7O0lBQ2pCLHdEQUE2Qjs7SUFDN0IsK0NBQTRCOztJQUM1QixnREFBcUM7O0lBQ3JDLDBDQUF3Qjs7SUFDeEIsK0NBQWtEOztJQUNsRCwyQ0FBaUI7O0lBQ2pCLGtEQUFpQzs7SUFDakMsa0RBQStCOztJQUMvQixrREFBaUM7O0lBQ2pDLG9EQUEwQzs7Ozs7QUFPNUMsMkNBTUM7OztJQUxDLDZDQUFxQjs7SUFDckIsc0NBQWU7O0lBQ2YsMENBQXdCOztJQUN4Qiw0Q0FBcUI7O0lBQ3JCLHFDQUFlIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5cbi8qKlxuICogQSBzZXQgb2YgaW50ZXJmYWNlcyB3aGljaCBhcmUgc2hhcmVkIGJldHdlZW4gYEBhbmd1bGFyL2NvcmVgIGFuZCBgQGFuZ3VsYXIvY29tcGlsZXJgIHRvIGFsbG93XG4gKiBmb3IgbGF0ZSBiaW5kaW5nIG9mIGBAYW5ndWxhci9jb21waWxlcmAgZm9yIEpJVCBwdXJwb3Nlcy5cbiAqXG4gKiBUaGlzIGZpbGUgaGFzIHR3byBjb3BpZXMuIFBsZWFzZSBlbnN1cmUgdGhhdCB0aGV5IGFyZSBpbiBzeW5jOlxuICogIC0gcGFja2FnZXMvY29tcGlsZXIvc3JjL2NvbXBpbGVyX2ZhY2FkZV9pbnRlcmZhY2UudHMgICAgICAgICAgICAgKG1hc3RlcilcbiAqICAtIHBhY2thZ2VzL2NvcmUvc3JjL3JlbmRlcjMvaml0L2NvbXBpbGVyX2ZhY2FkZV9pbnRlcmZhY2UudHMgICAgIChjb3B5KVxuICpcbiAqIFBsZWFzZSBlbnN1cmUgdGhhdCB0aGUgdHdvIGZpbGVzIGFyZSBpbiBzeW5jIHVzaW5nIHRoaXMgY29tbWFuZDpcbiAqIGBgYFxuICogY3AgcGFja2FnZXMvY29tcGlsZXIvc3JjL2NvbXBpbGVyX2ZhY2FkZV9pbnRlcmZhY2UudHMgXFxcbiAqICAgIHBhY2thZ2VzL2NvcmUvc3JjL3JlbmRlcjMvaml0L2NvbXBpbGVyX2ZhY2FkZV9pbnRlcmZhY2UudHNcbiAqIGBgYFxuICovXG5cbmV4cG9ydCBpbnRlcmZhY2UgRXhwb3J0ZWRDb21waWxlckZhY2FkZSB7IMm1Y29tcGlsZXJGYWNhZGU6IENvbXBpbGVyRmFjYWRlOyB9XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29tcGlsZXJGYWNhZGUge1xuICBjb21waWxlUGlwZShhbmd1bGFyQ29yZUVudjogQ29yZUVudmlyb25tZW50LCBzb3VyY2VNYXBVcmw6IHN0cmluZywgbWV0YTogUjNQaXBlTWV0YWRhdGFGYWNhZGUpOlxuICAgICAgYW55O1xuICBjb21waWxlSW5qZWN0YWJsZShcbiAgICAgIGFuZ3VsYXJDb3JlRW52OiBDb3JlRW52aXJvbm1lbnQsIHNvdXJjZU1hcFVybDogc3RyaW5nLCBtZXRhOiBSM0luamVjdGFibGVNZXRhZGF0YUZhY2FkZSk6IGFueTtcbiAgY29tcGlsZUluamVjdG9yKFxuICAgICAgYW5ndWxhckNvcmVFbnY6IENvcmVFbnZpcm9ubWVudCwgc291cmNlTWFwVXJsOiBzdHJpbmcsIG1ldGE6IFIzSW5qZWN0b3JNZXRhZGF0YUZhY2FkZSk6IGFueTtcbiAgY29tcGlsZU5nTW9kdWxlKFxuICAgICAgYW5ndWxhckNvcmVFbnY6IENvcmVFbnZpcm9ubWVudCwgc291cmNlTWFwVXJsOiBzdHJpbmcsIG1ldGE6IFIzTmdNb2R1bGVNZXRhZGF0YUZhY2FkZSk6IGFueTtcbiAgY29tcGlsZURpcmVjdGl2ZShcbiAgICAgIGFuZ3VsYXJDb3JlRW52OiBDb3JlRW52aXJvbm1lbnQsIHNvdXJjZU1hcFVybDogc3RyaW5nLCBtZXRhOiBSM0RpcmVjdGl2ZU1ldGFkYXRhRmFjYWRlKTogYW55O1xuICBjb21waWxlQ29tcG9uZW50KFxuICAgICAgYW5ndWxhckNvcmVFbnY6IENvcmVFbnZpcm9ubWVudCwgc291cmNlTWFwVXJsOiBzdHJpbmcsIG1ldGE6IFIzQ29tcG9uZW50TWV0YWRhdGFGYWNhZGUpOiBhbnk7XG5cbiAgUjNSZXNvbHZlZERlcGVuZGVuY3lUeXBlOiB0eXBlb2YgUjNSZXNvbHZlZERlcGVuZGVuY3lUeXBlO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIENvcmVFbnZpcm9ubWVudCB7IFtuYW1lOiBzdHJpbmddOiBGdW5jdGlvbjsgfVxuXG5leHBvcnQgdHlwZSBTdHJpbmdNYXAgPSB7XG4gIFtrZXk6IHN0cmluZ106IHN0cmluZztcbn07XG5cbmV4cG9ydCB0eXBlIFN0cmluZ01hcFdpdGhSZW5hbWUgPSB7XG4gIFtrZXk6IHN0cmluZ106IHN0cmluZyB8IFtzdHJpbmcsIHN0cmluZ107XG59O1xuXG5leHBvcnQgdHlwZSBQcm92aWRlciA9IGFueTtcblxuZXhwb3J0IGVudW0gUjNSZXNvbHZlZERlcGVuZGVuY3lUeXBlIHtcbiAgVG9rZW4gPSAwLFxuICBBdHRyaWJ1dGUgPSAxLFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFIzRGVwZW5kZW5jeU1ldGFkYXRhRmFjYWRlIHtcbiAgdG9rZW46IGFueTtcbiAgcmVzb2x2ZWQ6IFIzUmVzb2x2ZWREZXBlbmRlbmN5VHlwZTtcbiAgaG9zdDogYm9vbGVhbjtcbiAgb3B0aW9uYWw6IGJvb2xlYW47XG4gIHNlbGY6IGJvb2xlYW47XG4gIHNraXBTZWxmOiBib29sZWFuO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFIzUGlwZU1ldGFkYXRhRmFjYWRlIHtcbiAgbmFtZTogc3RyaW5nO1xuICB0eXBlOiBhbnk7XG4gIHBpcGVOYW1lOiBzdHJpbmc7XG4gIGRlcHM6IFIzRGVwZW5kZW5jeU1ldGFkYXRhRmFjYWRlW118bnVsbDtcbiAgcHVyZTogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSM0luamVjdGFibGVNZXRhZGF0YUZhY2FkZSB7XG4gIG5hbWU6IHN0cmluZztcbiAgdHlwZTogYW55O1xuICB0eXBlQXJndW1lbnRDb3VudDogbnVtYmVyO1xuICBjdG9yRGVwczogUjNEZXBlbmRlbmN5TWV0YWRhdGFGYWNhZGVbXXxudWxsO1xuICBwcm92aWRlZEluOiBhbnk7XG4gIHVzZUNsYXNzPzogYW55O1xuICB1c2VGYWN0b3J5PzogYW55O1xuICB1c2VFeGlzdGluZz86IGFueTtcbiAgdXNlVmFsdWU/OiBhbnk7XG4gIHVzZXJEZXBzPzogUjNEZXBlbmRlbmN5TWV0YWRhdGFGYWNhZGVbXTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSM05nTW9kdWxlTWV0YWRhdGFGYWNhZGUge1xuICB0eXBlOiBhbnk7XG4gIGJvb3RzdHJhcDogRnVuY3Rpb25bXTtcbiAgZGVjbGFyYXRpb25zOiBGdW5jdGlvbltdO1xuICBpbXBvcnRzOiBGdW5jdGlvbltdO1xuICBleHBvcnRzOiBGdW5jdGlvbltdO1xuICBlbWl0SW5saW5lOiBib29sZWFuO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFIzSW5qZWN0b3JNZXRhZGF0YUZhY2FkZSB7XG4gIG5hbWU6IHN0cmluZztcbiAgdHlwZTogYW55O1xuICBkZXBzOiBSM0RlcGVuZGVuY3lNZXRhZGF0YUZhY2FkZVtdfG51bGw7XG4gIHByb3ZpZGVyczogYW55W107XG4gIGltcG9ydHM6IGFueVtdO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFIzRGlyZWN0aXZlTWV0YWRhdGFGYWNhZGUge1xuICBuYW1lOiBzdHJpbmc7XG4gIHR5cGU6IGFueTtcbiAgdHlwZUFyZ3VtZW50Q291bnQ6IG51bWJlcjtcbiAgdHlwZVNvdXJjZVNwYW46IG51bGw7XG4gIGRlcHM6IFIzRGVwZW5kZW5jeU1ldGFkYXRhRmFjYWRlW118bnVsbDtcbiAgc2VsZWN0b3I6IHN0cmluZ3xudWxsO1xuICBxdWVyaWVzOiBSM1F1ZXJ5TWV0YWRhdGFGYWNhZGVbXTtcbiAgaG9zdDoge1trZXk6IHN0cmluZ106IHN0cmluZ307XG4gIHByb3BNZXRhZGF0YToge1trZXk6IHN0cmluZ106IGFueVtdfTtcbiAgbGlmZWN5Y2xlOiB7dXNlc09uQ2hhbmdlczogYm9vbGVhbjt9O1xuICBpbnB1dHM6IHN0cmluZ1tdO1xuICBvdXRwdXRzOiBzdHJpbmdbXTtcbiAgdXNlc0luaGVyaXRhbmNlOiBib29sZWFuO1xuICBleHBvcnRBczogc3RyaW5nfG51bGw7XG4gIHByb3ZpZGVyczogUHJvdmlkZXJbXXxudWxsO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFIzQ29tcG9uZW50TWV0YWRhdGFGYWNhZGUgZXh0ZW5kcyBSM0RpcmVjdGl2ZU1ldGFkYXRhRmFjYWRlIHtcbiAgdGVtcGxhdGU6IHN0cmluZztcbiAgcHJlc2VydmVXaGl0ZXNwYWNlczogYm9vbGVhbjtcbiAgYW5pbWF0aW9uczogYW55W118dW5kZWZpbmVkO1xuICB2aWV3UXVlcmllczogUjNRdWVyeU1ldGFkYXRhRmFjYWRlW107XG4gIHBpcGVzOiBNYXA8c3RyaW5nLCBhbnk+O1xuICBkaXJlY3RpdmVzOiB7c2VsZWN0b3I6IHN0cmluZywgZXhwcmVzc2lvbjogYW55fVtdO1xuICBzdHlsZXM6IHN0cmluZ1tdO1xuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbjtcbiAgdmlld1Byb3ZpZGVyczogUHJvdmlkZXJbXXxudWxsO1xuICBpbnRlcnBvbGF0aW9uPzogW3N0cmluZywgc3RyaW5nXTtcbiAgY2hhbmdlRGV0ZWN0aW9uPzogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3k7XG59XG5cbmV4cG9ydCB0eXBlIFZpZXdFbmNhcHN1bGF0aW9uID0gbnVtYmVyO1xuXG5leHBvcnQgdHlwZSBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSA9IG51bWJlcjtcblxuZXhwb3J0IGludGVyZmFjZSBSM1F1ZXJ5TWV0YWRhdGFGYWNhZGUge1xuICBwcm9wZXJ0eU5hbWU6IHN0cmluZztcbiAgZmlyc3Q6IGJvb2xlYW47XG4gIHByZWRpY2F0ZTogYW55fHN0cmluZ1tdO1xuICBkZXNjZW5kYW50czogYm9vbGVhbjtcbiAgcmVhZDogYW55fG51bGw7XG59XG4iXX0=