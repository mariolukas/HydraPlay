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
/** @enum {number} */
const RenderFlags = {
    /* Whether to run the creation block (e.g. create elements and directives) */
    Create: 1,
    /* Whether to run the update block (e.g. refresh bindings) */
    Update: 2,
};
export { RenderFlags };
/**
 * A subclass of `Type` which has a static `ngComponentDef`:`ComponentDef` field making it
 * consumable for rendering.
 * @record
 * @template T
 */
export function ComponentType() { }
if (false) {
    /** @type {?} */
    ComponentType.prototype.ngComponentDef;
}
/**
 * A subclass of `Type` which has a static `ngDirectiveDef`:`DirectiveDef` field making it
 * consumable for rendering.
 * @record
 * @template T
 */
export function DirectiveType() { }
if (false) {
    /** @type {?} */
    DirectiveType.prototype.ngDirectiveDef;
}
/** @enum {number} */
const DirectiveDefFlags = {
    ContentQuery: 2,
};
export { DirectiveDefFlags };
/**
 * A subclass of `Type` which has a static `ngPipeDef`:`PipeDef` field making it
 * consumable for rendering.
 * @record
 * @template T
 */
export function PipeType() { }
if (false) {
    /** @type {?} */
    PipeType.prototype.ngPipeDef;
}
/**
 * Runtime information for classes that are inherited by components or directives
 * that aren't defined as components or directives.
 *
 * This is an internal data structure used by the render to determine what inputs
 * and outputs should be inherited.
 *
 * See: {\@link defineBase}
 * @record
 * @template T
 */
export function BaseDef() { }
if (false) {
    /**
     * A dictionary mapping the inputs' minified property names to their public API names, which
     * are their aliases if any, or their original unminified property names
     * (as in `\@Input('alias') propertyName: any;`).
     * @type {?}
     */
    BaseDef.prototype.inputs;
    /**
     * @deprecated This is only here because `NgOnChanges` incorrectly uses declared name instead of
     * public or minified name.
     * @type {?}
     */
    BaseDef.prototype.declaredInputs;
    /**
     * A dictionary mapping the outputs' minified property names to their public API names, which
     * are their aliases if any, or their original unminified property names
     * (as in `\@Output('alias') propertyName: any;`).
     * @type {?}
     */
    BaseDef.prototype.outputs;
}
/**
 * Runtime link information for Directives.
 *
 * This is internal data structure used by the render to link
 * directives into templates.
 *
 * NOTE: Always use `defineDirective` function to create this object,
 * never create the object directly since the shape of this object
 * can change between versions.
 *
 * @param Selector type metadata specifying the selector of the directive or component
 *
 * See: {\@link defineDirective}
 * @record
 * @template T
 */
export function DirectiveDef() { }
if (false) {
    /**
     * Token representing the directive. Used by DI.
     * @type {?}
     */
    DirectiveDef.prototype.type;
    /**
     * Function that resolves providers and publishes them into the DI system.
     * @type {?}
     */
    DirectiveDef.prototype.providersResolver;
    /**
     * The selectors that will be used to match nodes to this directive.
     * @type {?}
     */
    DirectiveDef.prototype.selectors;
    /**
     * Name under which the directive is exported (for use with local references in template)
     * @type {?}
     */
    DirectiveDef.prototype.exportAs;
    /**
     * Factory function used to create a new directive instance.
     * @type {?}
     */
    DirectiveDef.prototype.factory;
    /**
     * Function to create instances of content queries associated with a given directive.
     * @type {?}
     */
    DirectiveDef.prototype.contentQueries;
    /**
     * Refreshes content queries associated with directives in a given view
     * @type {?}
     */
    DirectiveDef.prototype.contentQueriesRefresh;
    /**
     * Refreshes host bindings on the associated directive.
     * @type {?}
     */
    DirectiveDef.prototype.hostBindings;
    /**
     * Static attributes to set on host element.
     *
     * Even indices: attribute name
     * Odd indices: attribute value
     * @type {?}
     */
    DirectiveDef.prototype.attributes;
    /** @type {?} */
    DirectiveDef.prototype.onInit;
    /** @type {?} */
    DirectiveDef.prototype.doCheck;
    /** @type {?} */
    DirectiveDef.prototype.afterContentInit;
    /** @type {?} */
    DirectiveDef.prototype.afterContentChecked;
    /** @type {?} */
    DirectiveDef.prototype.afterViewInit;
    /** @type {?} */
    DirectiveDef.prototype.afterViewChecked;
    /** @type {?} */
    DirectiveDef.prototype.onDestroy;
    /**
     * The features applied to this directive
     * @type {?}
     */
    DirectiveDef.prototype.features;
}
/**
 * Runtime link information for Components.
 *
 * This is internal data structure used by the render to link
 * components into templates.
 *
 * NOTE: Always use `defineComponent` function to create this object,
 * never create the object directly since the shape of this object
 * can change between versions.
 *
 * See: {\@link defineComponent}
 * @record
 * @template T
 */
export function ComponentDef() { }
if (false) {
    /**
     * Runtime unique component ID.
     * @type {?}
     */
    ComponentDef.prototype.id;
    /**
     * The View template of the component.
     * @type {?}
     */
    ComponentDef.prototype.template;
    /**
     * A set of styles that the component needs to be present for component to render correctly.
     * @type {?}
     */
    ComponentDef.prototype.styles;
    /**
     * The number of nodes, local refs, and pipes in this component template.
     *
     * Used to calculate the length of the component's LView array, so we
     * can pre-fill the array and set the binding start index.
     * @type {?}
     */
    ComponentDef.prototype.consts;
    /**
     * The number of bindings in this component template (including pure fn bindings).
     *
     * Used to calculate the length of the component's LView array, so we
     * can pre-fill the array and set the host binding start index.
     * @type {?}
     */
    ComponentDef.prototype.vars;
    /**
     * Query-related instructions for a component.
     * @type {?}
     */
    ComponentDef.prototype.viewQuery;
    /**
     * The view encapsulation type, which determines how styles are applied to
     * DOM elements. One of
     * - `Emulated` (default): Emulate native scoping of styles.
     * - `Native`: Use the native encapsulation mechanism of the renderer.
     * - `ShadowDom`: Use modern [ShadowDOM](https://w3c.github.io/webcomponents/spec/shadow/) and
     *   create a ShadowRoot for component's host element.
     * - `None`: Do not provide any template or style encapsulation.
     * @type {?}
     */
    ComponentDef.prototype.encapsulation;
    /**
     * Defines arbitrary developer-defined data to be stored on a renderer instance.
     * This is useful for renderers that delegate to other renderers.
     * @type {?}
     */
    ComponentDef.prototype.data;
    /**
     * Whether or not this component's ChangeDetectionStrategy is OnPush
     * @type {?}
     */
    ComponentDef.prototype.onPush;
    /**
     * Registry of directives and components that may be found in this view.
     *
     * The property is either an array of `DirectiveDef`s or a function which returns the array of
     * `DirectiveDef`s. The function is necessary to be able to support forward declarations.
     * @type {?}
     */
    ComponentDef.prototype.directiveDefs;
    /**
     * Registry of pipes that may be found in this view.
     *
     * The property is either an array of `PipeDefs`s or a function which returns the array of
     * `PipeDefs`s. The function is necessary to be able to support forward declarations.
     * @type {?}
     */
    ComponentDef.prototype.pipeDefs;
    /**
     * Used to store the result of `noSideEffects` function so that it is not removed by closure
     * compiler. The property should never be read.
     * @type {?|undefined}
     */
    ComponentDef.prototype._;
}
/**
 * Runtime link information for Pipes.
 *
 * This is internal data structure used by the renderer to link
 * pipes into templates.
 *
 * NOTE: Always use `definePipe` function to create this object,
 * never create the object directly since the shape of this object
 * can change between versions.
 *
 * See: {\@link definePipe}
 * @record
 * @template T
 */
export function PipeDef() { }
if (false) {
    /**
     * Pipe name.
     *
     * Used to resolve pipe in templates.
     * @type {?}
     */
    PipeDef.prototype.name;
    /**
     * Factory function used to create a new pipe instance.
     * @type {?}
     */
    PipeDef.prototype.factory;
    /**
     * Whether or not the pipe is pure.
     *
     * Pure pipes result only depends on the pipe input and not on internal
     * state of the pipe.
     * @type {?}
     */
    PipeDef.prototype.pure;
    /** @type {?} */
    PipeDef.prototype.onDestroy;
}
/**
 * @record
 */
export function DirectiveDefFeature() { }
if (false) {
    /** @type {?|undefined} */
    DirectiveDefFeature.prototype.ngInherit;
    /* Skipping unhandled member: <T>(directiveDef: DirectiveDef<T>): void;*/
}
/**
 * @record
 */
export function ComponentDefFeature() { }
if (false) {
    /** @type {?|undefined} */
    ComponentDefFeature.prototype.ngInherit;
    /* Skipping unhandled member: <T>(componentDef: ComponentDef<T>): void;*/
}
// Note: This hack is necessary so we don't erroneously get a circular dependency
// failure based on types.
/** @type {?} */
export const unusedValueExportToPlacateAjd = 1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmaW5pdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL3JlbmRlcjMvaW50ZXJmYWNlcy9kZWZpbml0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7SUFrQ0UsNkVBQTZFO0lBQzdFLFNBQWE7SUFFYiw2REFBNkQ7SUFDN0QsU0FBYTs7Ozs7Ozs7O0FBT2YsbUNBQTRFOzs7SUFBeEIsdUNBQXNCOzs7Ozs7OztBQU0xRSxtQ0FBNEU7OztJQUF4Qix1Q0FBc0I7Ozs7SUFFckMsZUFBbUI7Ozs7Ozs7OztBQU14RCw4QkFBa0U7OztJQUFuQiw2QkFBaUI7Ozs7Ozs7Ozs7Ozs7QUFlaEUsNkJBb0JDOzs7Ozs7OztJQWRDLHlCQUEwQzs7Ozs7O0lBTTFDLGlDQUE2Qzs7Ozs7OztJQU83QywwQkFBc0M7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWlCeEMsa0NBb0RDOzs7Ozs7SUFsREMsNEJBQWM7Ozs7O0lBR2QseUNBQXlEOzs7OztJQUd6RCxpQ0FBb0M7Ozs7O0lBS3BDLGdDQUErQjs7Ozs7SUFLL0IsK0JBQWdDOzs7OztJQUtoQyxzQ0FBd0Q7Ozs7O0lBR3hELDZDQUFtRjs7Ozs7SUFHbkYsb0NBQTJDOzs7Ozs7OztJQVEzQyxrQ0FBbUM7O0lBR25DLDhCQUEwQjs7SUFDMUIsK0JBQTJCOztJQUMzQix3Q0FBb0M7O0lBQ3BDLDJDQUF1Qzs7SUFDdkMscUNBQWlDOztJQUNqQyx3Q0FBb0M7O0lBQ3BDLGlDQUE2Qjs7Ozs7SUFLN0IsZ0NBQThDOzs7Ozs7Ozs7Ozs7Ozs7O0FBbUJoRCxrQ0FnRkM7Ozs7OztJQTVFQywwQkFBb0I7Ozs7O0lBS3BCLGdDQUF3Qzs7Ozs7SUFLeEMsOEJBQTBCOzs7Ozs7OztJQVMxQiw4QkFBd0I7Ozs7Ozs7O0lBUXhCLDRCQUFzQjs7Ozs7SUFLdEIsaUNBQWtDOzs7Ozs7Ozs7OztJQVdsQyxxQ0FBMEM7Ozs7OztJQU0xQyw0QkFBcUM7Ozs7O0lBR3JDLDhCQUF5Qjs7Ozs7Ozs7SUFTekIscUNBQThDOzs7Ozs7OztJQVE5QyxnQ0FBb0M7Ozs7OztJQU1wQyx5QkFBbUI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFlckIsNkJBdUJDOzs7Ozs7OztJQWpCQyx1QkFBc0I7Ozs7O0lBS3RCLDBCQUFnQzs7Ozs7Ozs7SUFRaEMsdUJBQXVCOztJQUd2Qiw0QkFBNkI7Ozs7O0FBSy9CLHlDQUdDOzs7SUFEQyx3Q0FBaUI7Ozs7OztBQUduQix5Q0FHQzs7O0lBREMsd0NBQWlCOzs7Ozs7QUFzQ25CLE1BQU0sT0FBTyw2QkFBNkIsR0FBRyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1ZpZXdFbmNhcHN1bGF0aW9ufSBmcm9tICcuLi8uLi9jb3JlJztcbmltcG9ydCB7VHlwZX0gZnJvbSAnLi4vLi4vdHlwZSc7XG5pbXBvcnQge0Nzc1NlbGVjdG9yTGlzdH0gZnJvbSAnLi9wcm9qZWN0aW9uJztcblxuXG4vKipcbiAqIERlZmluaXRpb24gb2Ygd2hhdCBhIHRlbXBsYXRlIHJlbmRlcmluZyBmdW5jdGlvbiBzaG91bGQgbG9vayBsaWtlIGZvciBhIGNvbXBvbmVudC5cbiAqL1xuZXhwb3J0IHR5cGUgQ29tcG9uZW50VGVtcGxhdGU8VD4gPSB7XG4gIChyZjogUmVuZGVyRmxhZ3MsIGN0eDogVCk6IHZvaWQ7IG5nUHJpdmF0ZURhdGE/OiBuZXZlcjtcbn07XG5cbi8qKlxuICogRGVmaW5pdGlvbiBvZiB3aGF0IGEgcXVlcnkgZnVuY3Rpb24gc2hvdWxkIGxvb2sgbGlrZS5cbiAqL1xuZXhwb3J0IHR5cGUgQ29tcG9uZW50UXVlcnk8VD4gPSBDb21wb25lbnRUZW1wbGF0ZTxUPjtcblxuLyoqXG4gKiBGbGFncyBwYXNzZWQgaW50byB0ZW1wbGF0ZSBmdW5jdGlvbnMgdG8gZGV0ZXJtaW5lIHdoaWNoIGJsb2NrcyAoaS5lLiBjcmVhdGlvbiwgdXBkYXRlKVxuICogc2hvdWxkIGJlIGV4ZWN1dGVkLlxuICpcbiAqIFR5cGljYWxseSwgYSB0ZW1wbGF0ZSBydW5zIGJvdGggdGhlIGNyZWF0aW9uIGJsb2NrIGFuZCB0aGUgdXBkYXRlIGJsb2NrIG9uIGluaXRpYWxpemF0aW9uIGFuZFxuICogc3Vic2VxdWVudCBydW5zIG9ubHkgZXhlY3V0ZSB0aGUgdXBkYXRlIGJsb2NrLiBIb3dldmVyLCBkeW5hbWljYWxseSBjcmVhdGVkIHZpZXdzIHJlcXVpcmUgdGhhdFxuICogdGhlIGNyZWF0aW9uIGJsb2NrIGJlIGV4ZWN1dGVkIHNlcGFyYXRlbHkgZnJvbSB0aGUgdXBkYXRlIGJsb2NrIChmb3IgYmFja3dhcmRzIGNvbXBhdCkuXG4gKi9cbmV4cG9ydCBjb25zdCBlbnVtIFJlbmRlckZsYWdzIHtcbiAgLyogV2hldGhlciB0byBydW4gdGhlIGNyZWF0aW9uIGJsb2NrIChlLmcuIGNyZWF0ZSBlbGVtZW50cyBhbmQgZGlyZWN0aXZlcykgKi9cbiAgQ3JlYXRlID0gMGIwMSxcblxuICAvKiBXaGV0aGVyIHRvIHJ1biB0aGUgdXBkYXRlIGJsb2NrIChlLmcuIHJlZnJlc2ggYmluZGluZ3MpICovXG4gIFVwZGF0ZSA9IDBiMTBcbn1cblxuLyoqXG4gKiBBIHN1YmNsYXNzIG9mIGBUeXBlYCB3aGljaCBoYXMgYSBzdGF0aWMgYG5nQ29tcG9uZW50RGVmYDpgQ29tcG9uZW50RGVmYCBmaWVsZCBtYWtpbmcgaXRcbiAqIGNvbnN1bWFibGUgZm9yIHJlbmRlcmluZy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb21wb25lbnRUeXBlPFQ+IGV4dGVuZHMgVHlwZTxUPiB7IG5nQ29tcG9uZW50RGVmOiBuZXZlcjsgfVxuXG4vKipcbiAqIEEgc3ViY2xhc3Mgb2YgYFR5cGVgIHdoaWNoIGhhcyBhIHN0YXRpYyBgbmdEaXJlY3RpdmVEZWZgOmBEaXJlY3RpdmVEZWZgIGZpZWxkIG1ha2luZyBpdFxuICogY29uc3VtYWJsZSBmb3IgcmVuZGVyaW5nLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIERpcmVjdGl2ZVR5cGU8VD4gZXh0ZW5kcyBUeXBlPFQ+IHsgbmdEaXJlY3RpdmVEZWY6IG5ldmVyOyB9XG5cbmV4cG9ydCBjb25zdCBlbnVtIERpcmVjdGl2ZURlZkZsYWdzIHtDb250ZW50UXVlcnkgPSAwYjEwfVxuXG4vKipcbiAqIEEgc3ViY2xhc3Mgb2YgYFR5cGVgIHdoaWNoIGhhcyBhIHN0YXRpYyBgbmdQaXBlRGVmYDpgUGlwZURlZmAgZmllbGQgbWFraW5nIGl0XG4gKiBjb25zdW1hYmxlIGZvciByZW5kZXJpbmcuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUGlwZVR5cGU8VD4gZXh0ZW5kcyBUeXBlPFQ+IHsgbmdQaXBlRGVmOiBuZXZlcjsgfVxuXG5leHBvcnQgdHlwZSBEaXJlY3RpdmVEZWZXaXRoTWV0YTxcbiAgICBULCBTZWxlY3RvciBleHRlbmRzIHN0cmluZywgRXhwb3J0QXMgZXh0ZW5kcyBzdHJpbmcsIElucHV0TWFwIGV4dGVuZHN7W2tleTogc3RyaW5nXTogc3RyaW5nfSxcbiAgICBPdXRwdXRNYXAgZXh0ZW5kc3tba2V5OiBzdHJpbmddOiBzdHJpbmd9LCBRdWVyeUZpZWxkcyBleHRlbmRzIHN0cmluZ1tdPiA9IERpcmVjdGl2ZURlZjxUPjtcblxuLyoqXG4gKiBSdW50aW1lIGluZm9ybWF0aW9uIGZvciBjbGFzc2VzIHRoYXQgYXJlIGluaGVyaXRlZCBieSBjb21wb25lbnRzIG9yIGRpcmVjdGl2ZXNcbiAqIHRoYXQgYXJlbid0IGRlZmluZWQgYXMgY29tcG9uZW50cyBvciBkaXJlY3RpdmVzLlxuICpcbiAqIFRoaXMgaXMgYW4gaW50ZXJuYWwgZGF0YSBzdHJ1Y3R1cmUgdXNlZCBieSB0aGUgcmVuZGVyIHRvIGRldGVybWluZSB3aGF0IGlucHV0c1xuICogYW5kIG91dHB1dHMgc2hvdWxkIGJlIGluaGVyaXRlZC5cbiAqXG4gKiBTZWU6IHtAbGluayBkZWZpbmVCYXNlfVxuICovXG5leHBvcnQgaW50ZXJmYWNlIEJhc2VEZWY8VD4ge1xuICAvKipcbiAgICogQSBkaWN0aW9uYXJ5IG1hcHBpbmcgdGhlIGlucHV0cycgbWluaWZpZWQgcHJvcGVydHkgbmFtZXMgdG8gdGhlaXIgcHVibGljIEFQSSBuYW1lcywgd2hpY2hcbiAgICogYXJlIHRoZWlyIGFsaWFzZXMgaWYgYW55LCBvciB0aGVpciBvcmlnaW5hbCB1bm1pbmlmaWVkIHByb3BlcnR5IG5hbWVzXG4gICAqIChhcyBpbiBgQElucHV0KCdhbGlhcycpIHByb3BlcnR5TmFtZTogYW55O2ApLlxuICAgKi9cbiAgcmVhZG9ubHkgaW5wdXRzOiB7W1AgaW4ga2V5b2YgVF06IHN0cmluZ307XG5cbiAgLyoqXG4gICAqIEBkZXByZWNhdGVkIFRoaXMgaXMgb25seSBoZXJlIGJlY2F1c2UgYE5nT25DaGFuZ2VzYCBpbmNvcnJlY3RseSB1c2VzIGRlY2xhcmVkIG5hbWUgaW5zdGVhZCBvZlxuICAgKiBwdWJsaWMgb3IgbWluaWZpZWQgbmFtZS5cbiAgICovXG4gIHJlYWRvbmx5IGRlY2xhcmVkSW5wdXRzOiB7W1AgaW4ga2V5b2YgVF06IFB9O1xuXG4gIC8qKlxuICAgKiBBIGRpY3Rpb25hcnkgbWFwcGluZyB0aGUgb3V0cHV0cycgbWluaWZpZWQgcHJvcGVydHkgbmFtZXMgdG8gdGhlaXIgcHVibGljIEFQSSBuYW1lcywgd2hpY2hcbiAgICogYXJlIHRoZWlyIGFsaWFzZXMgaWYgYW55LCBvciB0aGVpciBvcmlnaW5hbCB1bm1pbmlmaWVkIHByb3BlcnR5IG5hbWVzXG4gICAqIChhcyBpbiBgQE91dHB1dCgnYWxpYXMnKSBwcm9wZXJ0eU5hbWU6IGFueTtgKS5cbiAgICovXG4gIHJlYWRvbmx5IG91dHB1dHM6IHtbUCBpbiBrZXlvZiBUXTogUH07XG59XG5cbi8qKlxuICogUnVudGltZSBsaW5rIGluZm9ybWF0aW9uIGZvciBEaXJlY3RpdmVzLlxuICpcbiAqIFRoaXMgaXMgaW50ZXJuYWwgZGF0YSBzdHJ1Y3R1cmUgdXNlZCBieSB0aGUgcmVuZGVyIHRvIGxpbmtcbiAqIGRpcmVjdGl2ZXMgaW50byB0ZW1wbGF0ZXMuXG4gKlxuICogTk9URTogQWx3YXlzIHVzZSBgZGVmaW5lRGlyZWN0aXZlYCBmdW5jdGlvbiB0byBjcmVhdGUgdGhpcyBvYmplY3QsXG4gKiBuZXZlciBjcmVhdGUgdGhlIG9iamVjdCBkaXJlY3RseSBzaW5jZSB0aGUgc2hhcGUgb2YgdGhpcyBvYmplY3RcbiAqIGNhbiBjaGFuZ2UgYmV0d2VlbiB2ZXJzaW9ucy5cbiAqXG4gKiBAcGFyYW0gU2VsZWN0b3IgdHlwZSBtZXRhZGF0YSBzcGVjaWZ5aW5nIHRoZSBzZWxlY3RvciBvZiB0aGUgZGlyZWN0aXZlIG9yIGNvbXBvbmVudFxuICpcbiAqIFNlZToge0BsaW5rIGRlZmluZURpcmVjdGl2ZX1cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBEaXJlY3RpdmVEZWY8VD4gZXh0ZW5kcyBCYXNlRGVmPFQ+IHtcbiAgLyoqIFRva2VuIHJlcHJlc2VudGluZyB0aGUgZGlyZWN0aXZlLiBVc2VkIGJ5IERJLiAqL1xuICB0eXBlOiBUeXBlPFQ+O1xuXG4gIC8qKiBGdW5jdGlvbiB0aGF0IHJlc29sdmVzIHByb3ZpZGVycyBhbmQgcHVibGlzaGVzIHRoZW0gaW50byB0aGUgREkgc3lzdGVtLiAqL1xuICBwcm92aWRlcnNSZXNvbHZlcjogKChkZWY6IERpcmVjdGl2ZURlZjxUPikgPT4gdm9pZCl8bnVsbDtcblxuICAvKiogVGhlIHNlbGVjdG9ycyB0aGF0IHdpbGwgYmUgdXNlZCB0byBtYXRjaCBub2RlcyB0byB0aGlzIGRpcmVjdGl2ZS4gKi9cbiAgcmVhZG9ubHkgc2VsZWN0b3JzOiBDc3NTZWxlY3Rvckxpc3Q7XG5cbiAgLyoqXG4gICAqIE5hbWUgdW5kZXIgd2hpY2ggdGhlIGRpcmVjdGl2ZSBpcyBleHBvcnRlZCAoZm9yIHVzZSB3aXRoIGxvY2FsIHJlZmVyZW5jZXMgaW4gdGVtcGxhdGUpXG4gICAqL1xuICByZWFkb25seSBleHBvcnRBczogc3RyaW5nfG51bGw7XG5cbiAgLyoqXG4gICAqIEZhY3RvcnkgZnVuY3Rpb24gdXNlZCB0byBjcmVhdGUgYSBuZXcgZGlyZWN0aXZlIGluc3RhbmNlLlxuICAgKi9cbiAgZmFjdG9yeTogKHQ6IFR5cGU8VD58bnVsbCkgPT4gVDtcblxuICAvKipcbiAgICogRnVuY3Rpb24gdG8gY3JlYXRlIGluc3RhbmNlcyBvZiBjb250ZW50IHF1ZXJpZXMgYXNzb2NpYXRlZCB3aXRoIGEgZ2l2ZW4gZGlyZWN0aXZlLlxuICAgKi9cbiAgY29udGVudFF1ZXJpZXM6ICgoZGlyZWN0aXZlSW5kZXg6IG51bWJlcikgPT4gdm9pZCl8bnVsbDtcblxuICAvKiogUmVmcmVzaGVzIGNvbnRlbnQgcXVlcmllcyBhc3NvY2lhdGVkIHdpdGggZGlyZWN0aXZlcyBpbiBhIGdpdmVuIHZpZXcgKi9cbiAgY29udGVudFF1ZXJpZXNSZWZyZXNoOiAoKGRpcmVjdGl2ZUluZGV4OiBudW1iZXIsIHF1ZXJ5SW5kZXg6IG51bWJlcikgPT4gdm9pZCl8bnVsbDtcblxuICAvKiogUmVmcmVzaGVzIGhvc3QgYmluZGluZ3Mgb24gdGhlIGFzc29jaWF0ZWQgZGlyZWN0aXZlLiAqL1xuICBob3N0QmluZGluZ3M6IEhvc3RCaW5kaW5nc0Z1bmN0aW9uPFQ+fG51bGw7XG5cbiAgLyoqXG4gICAqIFN0YXRpYyBhdHRyaWJ1dGVzIHRvIHNldCBvbiBob3N0IGVsZW1lbnQuXG4gICAqXG4gICAqIEV2ZW4gaW5kaWNlczogYXR0cmlidXRlIG5hbWVcbiAgICogT2RkIGluZGljZXM6IGF0dHJpYnV0ZSB2YWx1ZVxuICAgKi9cbiAgcmVhZG9ubHkgYXR0cmlidXRlczogc3RyaW5nW118bnVsbDtcblxuICAvKiBUaGUgZm9sbG93aW5nIGFyZSBsaWZlY3ljbGUgaG9va3MgZm9yIHRoaXMgY29tcG9uZW50ICovXG4gIG9uSW5pdDogKCgpID0+IHZvaWQpfG51bGw7XG4gIGRvQ2hlY2s6ICgoKSA9PiB2b2lkKXxudWxsO1xuICBhZnRlckNvbnRlbnRJbml0OiAoKCkgPT4gdm9pZCl8bnVsbDtcbiAgYWZ0ZXJDb250ZW50Q2hlY2tlZDogKCgpID0+IHZvaWQpfG51bGw7XG4gIGFmdGVyVmlld0luaXQ6ICgoKSA9PiB2b2lkKXxudWxsO1xuICBhZnRlclZpZXdDaGVja2VkOiAoKCkgPT4gdm9pZCl8bnVsbDtcbiAgb25EZXN0cm95OiAoKCkgPT4gdm9pZCl8bnVsbDtcblxuICAvKipcbiAgICogVGhlIGZlYXR1cmVzIGFwcGxpZWQgdG8gdGhpcyBkaXJlY3RpdmVcbiAgICovXG4gIHJlYWRvbmx5IGZlYXR1cmVzOiBEaXJlY3RpdmVEZWZGZWF0dXJlW118bnVsbDtcbn1cblxuZXhwb3J0IHR5cGUgQ29tcG9uZW50RGVmV2l0aE1ldGE8XG4gICAgVCwgU2VsZWN0b3IgZXh0ZW5kcyBTdHJpbmcsIEV4cG9ydEFzIGV4dGVuZHMgc3RyaW5nLCBJbnB1dE1hcCBleHRlbmRze1trZXk6IHN0cmluZ106IHN0cmluZ30sXG4gICAgT3V0cHV0TWFwIGV4dGVuZHN7W2tleTogc3RyaW5nXTogc3RyaW5nfSwgUXVlcnlGaWVsZHMgZXh0ZW5kcyBzdHJpbmdbXT4gPSBDb21wb25lbnREZWY8VD47XG5cbi8qKlxuICogUnVudGltZSBsaW5rIGluZm9ybWF0aW9uIGZvciBDb21wb25lbnRzLlxuICpcbiAqIFRoaXMgaXMgaW50ZXJuYWwgZGF0YSBzdHJ1Y3R1cmUgdXNlZCBieSB0aGUgcmVuZGVyIHRvIGxpbmtcbiAqIGNvbXBvbmVudHMgaW50byB0ZW1wbGF0ZXMuXG4gKlxuICogTk9URTogQWx3YXlzIHVzZSBgZGVmaW5lQ29tcG9uZW50YCBmdW5jdGlvbiB0byBjcmVhdGUgdGhpcyBvYmplY3QsXG4gKiBuZXZlciBjcmVhdGUgdGhlIG9iamVjdCBkaXJlY3RseSBzaW5jZSB0aGUgc2hhcGUgb2YgdGhpcyBvYmplY3RcbiAqIGNhbiBjaGFuZ2UgYmV0d2VlbiB2ZXJzaW9ucy5cbiAqXG4gKiBTZWU6IHtAbGluayBkZWZpbmVDb21wb25lbnR9XG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ29tcG9uZW50RGVmPFQ+IGV4dGVuZHMgRGlyZWN0aXZlRGVmPFQ+IHtcbiAgLyoqXG4gICAqIFJ1bnRpbWUgdW5pcXVlIGNvbXBvbmVudCBJRC5cbiAgICovXG4gIHJlYWRvbmx5IGlkOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFRoZSBWaWV3IHRlbXBsYXRlIG9mIHRoZSBjb21wb25lbnQuXG4gICAqL1xuICByZWFkb25seSB0ZW1wbGF0ZTogQ29tcG9uZW50VGVtcGxhdGU8VD47XG5cbiAgLyoqXG4gICAqIEEgc2V0IG9mIHN0eWxlcyB0aGF0IHRoZSBjb21wb25lbnQgbmVlZHMgdG8gYmUgcHJlc2VudCBmb3IgY29tcG9uZW50IHRvIHJlbmRlciBjb3JyZWN0bHkuXG4gICAqL1xuICByZWFkb25seSBzdHlsZXM6IHN0cmluZ1tdO1xuXG4gIC8qKlxuICAgKiBUaGUgbnVtYmVyIG9mIG5vZGVzLCBsb2NhbCByZWZzLCBhbmQgcGlwZXMgaW4gdGhpcyBjb21wb25lbnQgdGVtcGxhdGUuXG4gICAqXG4gICAqIFVzZWQgdG8gY2FsY3VsYXRlIHRoZSBsZW5ndGggb2YgdGhlIGNvbXBvbmVudCdzIExWaWV3IGFycmF5LCBzbyB3ZVxuICAgKiBjYW4gcHJlLWZpbGwgdGhlIGFycmF5IGFuZCBzZXQgdGhlIGJpbmRpbmcgc3RhcnQgaW5kZXguXG4gICAqL1xuICAvLyBUT0RPKGthcmEpOiByZW1vdmUgcXVlcmllcyBmcm9tIHRoaXMgY291bnRcbiAgcmVhZG9ubHkgY29uc3RzOiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIFRoZSBudW1iZXIgb2YgYmluZGluZ3MgaW4gdGhpcyBjb21wb25lbnQgdGVtcGxhdGUgKGluY2x1ZGluZyBwdXJlIGZuIGJpbmRpbmdzKS5cbiAgICpcbiAgICogVXNlZCB0byBjYWxjdWxhdGUgdGhlIGxlbmd0aCBvZiB0aGUgY29tcG9uZW50J3MgTFZpZXcgYXJyYXksIHNvIHdlXG4gICAqIGNhbiBwcmUtZmlsbCB0aGUgYXJyYXkgYW5kIHNldCB0aGUgaG9zdCBiaW5kaW5nIHN0YXJ0IGluZGV4LlxuICAgKi9cbiAgcmVhZG9ubHkgdmFyczogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBRdWVyeS1yZWxhdGVkIGluc3RydWN0aW9ucyBmb3IgYSBjb21wb25lbnQuXG4gICAqL1xuICB2aWV3UXVlcnk6IENvbXBvbmVudFF1ZXJ5PFQ+fG51bGw7XG5cbiAgLyoqXG4gICAqIFRoZSB2aWV3IGVuY2Fwc3VsYXRpb24gdHlwZSwgd2hpY2ggZGV0ZXJtaW5lcyBob3cgc3R5bGVzIGFyZSBhcHBsaWVkIHRvXG4gICAqIERPTSBlbGVtZW50cy4gT25lIG9mXG4gICAqIC0gYEVtdWxhdGVkYCAoZGVmYXVsdCk6IEVtdWxhdGUgbmF0aXZlIHNjb3Bpbmcgb2Ygc3R5bGVzLlxuICAgKiAtIGBOYXRpdmVgOiBVc2UgdGhlIG5hdGl2ZSBlbmNhcHN1bGF0aW9uIG1lY2hhbmlzbSBvZiB0aGUgcmVuZGVyZXIuXG4gICAqIC0gYFNoYWRvd0RvbWA6IFVzZSBtb2Rlcm4gW1NoYWRvd0RPTV0oaHR0cHM6Ly93M2MuZ2l0aHViLmlvL3dlYmNvbXBvbmVudHMvc3BlYy9zaGFkb3cvKSBhbmRcbiAgICogICBjcmVhdGUgYSBTaGFkb3dSb290IGZvciBjb21wb25lbnQncyBob3N0IGVsZW1lbnQuXG4gICAqIC0gYE5vbmVgOiBEbyBub3QgcHJvdmlkZSBhbnkgdGVtcGxhdGUgb3Igc3R5bGUgZW5jYXBzdWxhdGlvbi5cbiAgICovXG4gIHJlYWRvbmx5IGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uO1xuXG4gIC8qKlxuICAgKiBEZWZpbmVzIGFyYml0cmFyeSBkZXZlbG9wZXItZGVmaW5lZCBkYXRhIHRvIGJlIHN0b3JlZCBvbiBhIHJlbmRlcmVyIGluc3RhbmNlLlxuICAgKiBUaGlzIGlzIHVzZWZ1bCBmb3IgcmVuZGVyZXJzIHRoYXQgZGVsZWdhdGUgdG8gb3RoZXIgcmVuZGVyZXJzLlxuICAgKi9cbiAgcmVhZG9ubHkgZGF0YToge1traW5kOiBzdHJpbmddOiBhbnl9O1xuXG4gIC8qKiBXaGV0aGVyIG9yIG5vdCB0aGlzIGNvbXBvbmVudCdzIENoYW5nZURldGVjdGlvblN0cmF0ZWd5IGlzIE9uUHVzaCAqL1xuICByZWFkb25seSBvblB1c2g6IGJvb2xlYW47XG5cbiAgLyoqXG5cbiAgICogUmVnaXN0cnkgb2YgZGlyZWN0aXZlcyBhbmQgY29tcG9uZW50cyB0aGF0IG1heSBiZSBmb3VuZCBpbiB0aGlzIHZpZXcuXG4gICAqXG4gICAqIFRoZSBwcm9wZXJ0eSBpcyBlaXRoZXIgYW4gYXJyYXkgb2YgYERpcmVjdGl2ZURlZmBzIG9yIGEgZnVuY3Rpb24gd2hpY2ggcmV0dXJucyB0aGUgYXJyYXkgb2ZcbiAgICogYERpcmVjdGl2ZURlZmBzLiBUaGUgZnVuY3Rpb24gaXMgbmVjZXNzYXJ5IHRvIGJlIGFibGUgdG8gc3VwcG9ydCBmb3J3YXJkIGRlY2xhcmF0aW9ucy5cbiAgICovXG4gIGRpcmVjdGl2ZURlZnM6IERpcmVjdGl2ZURlZkxpc3RPckZhY3Rvcnl8bnVsbDtcblxuICAvKipcbiAgICogUmVnaXN0cnkgb2YgcGlwZXMgdGhhdCBtYXkgYmUgZm91bmQgaW4gdGhpcyB2aWV3LlxuICAgKlxuICAgKiBUaGUgcHJvcGVydHkgaXMgZWl0aGVyIGFuIGFycmF5IG9mIGBQaXBlRGVmc2BzIG9yIGEgZnVuY3Rpb24gd2hpY2ggcmV0dXJucyB0aGUgYXJyYXkgb2ZcbiAgICogYFBpcGVEZWZzYHMuIFRoZSBmdW5jdGlvbiBpcyBuZWNlc3NhcnkgdG8gYmUgYWJsZSB0byBzdXBwb3J0IGZvcndhcmQgZGVjbGFyYXRpb25zLlxuICAgKi9cbiAgcGlwZURlZnM6IFBpcGVEZWZMaXN0T3JGYWN0b3J5fG51bGw7XG5cbiAgLyoqXG4gICAqIFVzZWQgdG8gc3RvcmUgdGhlIHJlc3VsdCBvZiBgbm9TaWRlRWZmZWN0c2AgZnVuY3Rpb24gc28gdGhhdCBpdCBpcyBub3QgcmVtb3ZlZCBieSBjbG9zdXJlXG4gICAqIGNvbXBpbGVyLiBUaGUgcHJvcGVydHkgc2hvdWxkIG5ldmVyIGJlIHJlYWQuXG4gICAqL1xuICByZWFkb25seSBfPzogbmV2ZXI7XG59XG5cbi8qKlxuICogUnVudGltZSBsaW5rIGluZm9ybWF0aW9uIGZvciBQaXBlcy5cbiAqXG4gKiBUaGlzIGlzIGludGVybmFsIGRhdGEgc3RydWN0dXJlIHVzZWQgYnkgdGhlIHJlbmRlcmVyIHRvIGxpbmtcbiAqIHBpcGVzIGludG8gdGVtcGxhdGVzLlxuICpcbiAqIE5PVEU6IEFsd2F5cyB1c2UgYGRlZmluZVBpcGVgIGZ1bmN0aW9uIHRvIGNyZWF0ZSB0aGlzIG9iamVjdCxcbiAqIG5ldmVyIGNyZWF0ZSB0aGUgb2JqZWN0IGRpcmVjdGx5IHNpbmNlIHRoZSBzaGFwZSBvZiB0aGlzIG9iamVjdFxuICogY2FuIGNoYW5nZSBiZXR3ZWVuIHZlcnNpb25zLlxuICpcbiAqIFNlZToge0BsaW5rIGRlZmluZVBpcGV9XG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUGlwZURlZjxUPiB7XG4gIC8qKlxuICAgKiBQaXBlIG5hbWUuXG4gICAqXG4gICAqIFVzZWQgdG8gcmVzb2x2ZSBwaXBlIGluIHRlbXBsYXRlcy5cbiAgICovXG4gIHJlYWRvbmx5IG5hbWU6IHN0cmluZztcblxuICAvKipcbiAgICogRmFjdG9yeSBmdW5jdGlvbiB1c2VkIHRvIGNyZWF0ZSBhIG5ldyBwaXBlIGluc3RhbmNlLlxuICAgKi9cbiAgZmFjdG9yeTogKHQ6IFR5cGU8VD58bnVsbCkgPT4gVDtcblxuICAvKipcbiAgICogV2hldGhlciBvciBub3QgdGhlIHBpcGUgaXMgcHVyZS5cbiAgICpcbiAgICogUHVyZSBwaXBlcyByZXN1bHQgb25seSBkZXBlbmRzIG9uIHRoZSBwaXBlIGlucHV0IGFuZCBub3Qgb24gaW50ZXJuYWxcbiAgICogc3RhdGUgb2YgdGhlIHBpcGUuXG4gICAqL1xuICByZWFkb25seSBwdXJlOiBib29sZWFuO1xuXG4gIC8qIFRoZSBmb2xsb3dpbmcgYXJlIGxpZmVjeWNsZSBob29rcyBmb3IgdGhpcyBwaXBlICovXG4gIG9uRGVzdHJveTogKCgpID0+IHZvaWQpfG51bGw7XG59XG5cbmV4cG9ydCB0eXBlIFBpcGVEZWZXaXRoTWV0YTxULCBOYW1lIGV4dGVuZHMgc3RyaW5nPiA9IFBpcGVEZWY8VD47XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGlyZWN0aXZlRGVmRmVhdHVyZSB7XG4gIDxUPihkaXJlY3RpdmVEZWY6IERpcmVjdGl2ZURlZjxUPik6IHZvaWQ7XG4gIG5nSW5oZXJpdD86IHRydWU7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29tcG9uZW50RGVmRmVhdHVyZSB7XG4gIDxUPihjb21wb25lbnREZWY6IENvbXBvbmVudERlZjxUPik6IHZvaWQ7XG4gIG5nSW5oZXJpdD86IHRydWU7XG59XG5cblxuLyoqXG4gKiBUeXBlIHVzZWQgZm9yIGRpcmVjdGl2ZURlZnMgb24gY29tcG9uZW50IGRlZmluaXRpb24uXG4gKlxuICogVGhlIGZ1bmN0aW9uIGlzIG5lY2Vzc2FyeSB0byBiZSBhYmxlIHRvIHN1cHBvcnQgZm9yd2FyZCBkZWNsYXJhdGlvbnMuXG4gKi9cbmV4cG9ydCB0eXBlIERpcmVjdGl2ZURlZkxpc3RPckZhY3RvcnkgPSAoKCkgPT4gRGlyZWN0aXZlRGVmTGlzdCkgfCBEaXJlY3RpdmVEZWZMaXN0O1xuXG5leHBvcnQgdHlwZSBEaXJlY3RpdmVEZWZMaXN0ID0gKERpcmVjdGl2ZURlZjxhbnk+fCBDb21wb25lbnREZWY8YW55PilbXTtcblxuZXhwb3J0IHR5cGUgRGlyZWN0aXZlVHlwZXNPckZhY3RvcnkgPSAoKCkgPT4gRGlyZWN0aXZlVHlwZUxpc3QpIHwgRGlyZWN0aXZlVHlwZUxpc3Q7XG5cbmV4cG9ydCB0eXBlIERpcmVjdGl2ZVR5cGVMaXN0ID1cbiAgICAoRGlyZWN0aXZlRGVmPGFueT58IENvbXBvbmVudERlZjxhbnk+fFxuICAgICBUeXBlPGFueT4vKiBUeXBlIGFzIHdvcmthcm91bmQgZm9yOiBNaWNyb3NvZnQvVHlwZVNjcmlwdC9pc3N1ZXMvNDg4MSAqLylbXTtcblxuZXhwb3J0IHR5cGUgSG9zdEJpbmRpbmdzRnVuY3Rpb248VD4gPSAocmY6IFJlbmRlckZsYWdzLCBjdHg6IFQsIGVsZW1lbnRJbmRleDogbnVtYmVyKSA9PiB2b2lkO1xuXG4vKipcbiAqIFR5cGUgdXNlZCBmb3IgUGlwZURlZnMgb24gY29tcG9uZW50IGRlZmluaXRpb24uXG4gKlxuICogVGhlIGZ1bmN0aW9uIGlzIG5lY2Vzc2FyeSB0byBiZSBhYmxlIHRvIHN1cHBvcnQgZm9yd2FyZCBkZWNsYXJhdGlvbnMuXG4gKi9cbmV4cG9ydCB0eXBlIFBpcGVEZWZMaXN0T3JGYWN0b3J5ID0gKCgpID0+IFBpcGVEZWZMaXN0KSB8IFBpcGVEZWZMaXN0O1xuXG5leHBvcnQgdHlwZSBQaXBlRGVmTGlzdCA9IFBpcGVEZWY8YW55PltdO1xuXG5leHBvcnQgdHlwZSBQaXBlVHlwZXNPckZhY3RvcnkgPSAoKCkgPT4gRGlyZWN0aXZlVHlwZUxpc3QpIHwgRGlyZWN0aXZlVHlwZUxpc3Q7XG5cbmV4cG9ydCB0eXBlIFBpcGVUeXBlTGlzdCA9XG4gICAgKFBpcGVEZWY8YW55PnwgVHlwZTxhbnk+LyogVHlwZSBhcyB3b3JrYXJvdW5kIGZvcjogTWljcm9zb2Z0L1R5cGVTY3JpcHQvaXNzdWVzLzQ4ODEgKi8pW107XG5cblxuLy8gTm90ZTogVGhpcyBoYWNrIGlzIG5lY2Vzc2FyeSBzbyB3ZSBkb24ndCBlcnJvbmVvdXNseSBnZXQgYSBjaXJjdWxhciBkZXBlbmRlbmN5XG4vLyBmYWlsdXJlIGJhc2VkIG9uIHR5cGVzLlxuZXhwb3J0IGNvbnN0IHVudXNlZFZhbHVlRXhwb3J0VG9QbGFjYXRlQWpkID0gMTsiXX0=