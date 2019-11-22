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
import { assertComponentType, assertDefined } from './assert';
import { getComponentDef } from './definition';
import { diPublicInInjector, getOrCreateNodeInjectorForNode } from './di';
import { publishDefaultGlobalUtils } from './global_utils';
import { queueInitHooks, queueLifecycleHooks } from './hooks';
import { CLEAN_PROMISE, createLView, createNodeAtIndex, createTView, getOrCreateTView, initNodeFlags, instantiateRootComponent, locateHostElement, queueComponentIndexForCheck, refreshDescendantViews } from './instructions';
import { domRendererFactory3 } from './interfaces/renderer';
import { CONTEXT, FLAGS, HEADER_OFFSET, HOST, HOST_NODE, TVIEW } from './interfaces/view';
import { enterView, getPreviousOrParentTNode, leaveView, resetComponentState, setCurrentDirectiveDef } from './state';
import { defaultScheduler, getRootView, readPatchedLView, stringify } from './util';
/**
 * Options that control how the component should be bootstrapped.
 * @record
 */
export function CreateComponentOptions() { }
if (false) {
    /**
     * Which renderer factory to use.
     * @type {?|undefined}
     */
    CreateComponentOptions.prototype.rendererFactory;
    /**
     * A custom sanitizer instance
     * @type {?|undefined}
     */
    CreateComponentOptions.prototype.sanitizer;
    /**
     * A custom animation player handler
     * @type {?|undefined}
     */
    CreateComponentOptions.prototype.playerHandler;
    /**
     * Host element on which the component will be bootstrapped. If not specified,
     * the component definition's `tag` is used to query the existing DOM for the
     * element to bootstrap.
     * @type {?|undefined}
     */
    CreateComponentOptions.prototype.host;
    /**
     * Module injector for the component. If unspecified, the injector will be NULL_INJECTOR.
     * @type {?|undefined}
     */
    CreateComponentOptions.prototype.injector;
    /**
     * List of features to be applied to the created component. Features are simply
     * functions that decorate a component with a certain behavior.
     *
     * Typically, the features in this list are features that cannot be added to the
     * other features list in the component definition because they rely on other factors.
     *
     * Example: `RootLifecycleHooks` is a function that adds lifecycle hook capabilities
     * to root components in a tree-shakable way. It cannot be added to the component
     * features list because there's no way of knowing when the component will be used as
     * a root component.
     * @type {?|undefined}
     */
    CreateComponentOptions.prototype.hostFeatures;
    /**
     * A function which is used to schedule change detection work in the future.
     *
     * When marking components as dirty, it is necessary to schedule the work of
     * change detection in the future. This is done to coalesce multiple
     * {\@link markDirty} calls into a single changed detection processing.
     *
     * The default value of the scheduler is the `requestAnimationFrame` function.
     *
     * It is also useful to override this function for testing purposes.
     * @type {?|undefined}
     */
    CreateComponentOptions.prototype.scheduler;
}
// TODO: A hack to not pull in the NullInjector from @angular/core.
/** @type {?} */
export const NULL_INJECTOR = {
    get: (token, notFoundValue) => {
        throw new Error('NullInjector: Not found: ' + stringify(token));
    }
};
/**
 * Bootstraps a Component into an existing host element and returns an instance
 * of the component.
 *
 * Use this function to bootstrap a component into the DOM tree. Each invocation
 * of this function will create a separate tree of components, injectors and
 * change detection cycles and lifetimes. To dynamically insert a new component
 * into an existing tree such that it shares the same injection, change detection
 * and object lifetime, use {\@link ViewContainer#createComponent}.
 *
 * @template T
 * @param {?} componentType Component to bootstrap
 * @param {?=} opts
 * @return {?}
 */
export function renderComponent(componentType /* Type as workaround for: Microsoft/TypeScript/issues/4881 */, opts = {}) {
    ngDevMode && publishDefaultGlobalUtils();
    ngDevMode && assertComponentType(componentType);
    /** @type {?} */
    const rendererFactory = opts.rendererFactory || domRendererFactory3;
    /** @type {?} */
    const sanitizer = opts.sanitizer || null;
    /** @type {?} */
    const componentDef = (/** @type {?} */ (getComponentDef(componentType)));
    if (componentDef.type != componentType)
        componentDef.type = componentType;
    // The first index of the first selector is the tag name.
    /** @type {?} */
    const componentTag = (/** @type {?} */ ((/** @type {?} */ ((/** @type {?} */ (componentDef.selectors))[0]))[0]));
    /** @type {?} */
    const hostRNode = locateHostElement(rendererFactory, opts.host || componentTag);
    /** @type {?} */
    const rootFlags = componentDef.onPush ? 8 /* Dirty */ | 128 /* IsRoot */ :
        4 /* CheckAlways */ | 128 /* IsRoot */;
    /** @type {?} */
    const rootContext = createRootContext(opts.scheduler, opts.playerHandler);
    /** @type {?} */
    const renderer = rendererFactory.createRenderer(hostRNode, componentDef);
    /** @type {?} */
    const rootView = createLView(null, createTView(-1, null, 1, 0, null, null, null), rootContext, rootFlags, rendererFactory, renderer, undefined, opts.injector || null);
    /** @type {?} */
    const oldView = enterView(rootView, null);
    /** @type {?} */
    let component;
    try {
        if (rendererFactory.begin)
            rendererFactory.begin();
        /** @type {?} */
        const componentView = createRootComponentView(hostRNode, componentDef, rootView, rendererFactory, renderer, sanitizer);
        component = createRootComponent(componentView, componentDef, rootView, rootContext, opts.hostFeatures || null);
        refreshDescendantViews(rootView); // creation mode pass
        rootView[FLAGS] &= ~1 /* CreationMode */;
        refreshDescendantViews(rootView); // update mode pass
    }
    finally {
        leaveView(oldView);
        if (rendererFactory.end)
            rendererFactory.end();
    }
    return component;
}
/**
 * Creates the root component view and the root component node.
 *
 * @param {?} rNode Render host element.
 * @param {?} def ComponentDef
 * @param {?} rootView The parent view where the host node is stored
 * @param {?} rendererFactory
 * @param {?} renderer The current renderer
 * @param {?=} sanitizer The sanitizer, if provided
 *
 * @return {?} Component view created
 */
export function createRootComponentView(rNode, def, rootView, rendererFactory, renderer, sanitizer) {
    resetComponentState();
    /** @type {?} */
    const tView = rootView[TVIEW];
    /** @type {?} */
    const componentView = createLView(rootView, getOrCreateTView(def.template, def.consts, def.vars, def.directiveDefs, def.pipeDefs, def.viewQuery), null, def.onPush ? 8 /* Dirty */ : 4 /* CheckAlways */, rendererFactory, renderer, sanitizer);
    /** @type {?} */
    const tNode = createNodeAtIndex(0, 3 /* Element */, rNode, null, null);
    if (tView.firstTemplatePass) {
        diPublicInInjector(getOrCreateNodeInjectorForNode(tNode, rootView), rootView, def.type);
        tNode.flags = 1 /* isComponent */;
        initNodeFlags(tNode, rootView.length, 1);
        queueComponentIndexForCheck(tNode);
    }
    // Store component view at node index, with node as the HOST
    componentView[HOST] = rootView[HEADER_OFFSET];
    componentView[HOST_NODE] = (/** @type {?} */ (tNode));
    return rootView[HEADER_OFFSET] = componentView;
}
/**
 * Creates a root component and sets it up with features and host bindings. Shared by
 * renderComponent() and ViewContainerRef.createComponent().
 * @template T
 * @param {?} componentView
 * @param {?} componentDef
 * @param {?} rootView
 * @param {?} rootContext
 * @param {?} hostFeatures
 * @return {?}
 */
export function createRootComponent(componentView, componentDef, rootView, rootContext, hostFeatures) {
    /** @type {?} */
    const tView = rootView[TVIEW];
    // Create directive instance with factory() and store at next index in viewData
    /** @type {?} */
    const component = instantiateRootComponent(tView, rootView, componentDef);
    rootContext.components.push(component);
    componentView[CONTEXT] = component;
    hostFeatures && hostFeatures.forEach((feature) => feature(component, componentDef));
    if (tView.firstTemplatePass && componentDef.hostBindings) {
        /** @type {?} */
        const rootTNode = getPreviousOrParentTNode();
        setCurrentDirectiveDef(componentDef);
        componentDef.hostBindings(1 /* Create */, component, rootTNode.index - HEADER_OFFSET);
        setCurrentDirectiveDef(null);
    }
    return component;
}
/**
 * @param {?=} scheduler
 * @param {?=} playerHandler
 * @return {?}
 */
export function createRootContext(scheduler, playerHandler) {
    return {
        components: [],
        scheduler: scheduler || defaultScheduler,
        clean: CLEAN_PROMISE,
        playerHandler: playerHandler || null,
        flags: 0 /* Empty */
    };
}
/**
 * Used to enable lifecycle hooks on the root component.
 *
 * Include this feature when calling `renderComponent` if the root component
 * you are rendering has lifecycle hooks defined. Otherwise, the hooks won't
 * be called properly.
 *
 * Example:
 *
 * ```
 * renderComponent(AppComponent, {features: [RootLifecycleHooks]});
 * ```
 * @param {?} component
 * @param {?} def
 * @return {?}
 */
export function LifecycleHooksFeature(component, def) {
    /** @type {?} */
    const rootTView = (/** @type {?} */ (readPatchedLView(component)))[TVIEW];
    /** @type {?} */
    const dirIndex = rootTView.data.length - 1;
    queueInitHooks(dirIndex, def.onInit, def.doCheck, rootTView);
    // TODO(misko): replace `as TNode` with createTNode call. (needs refactoring to lose dep on
    // LNode).
    queueLifecycleHooks(rootTView, (/** @type {?} */ ({ directiveStart: dirIndex, directiveEnd: dirIndex + 1 })));
}
/**
 * Retrieve the root context for any component by walking the parent `LView` until
 * reaching the root `LView`.
 *
 * @param {?} component any component
 * @return {?}
 */
function getRootContext(component) {
    /** @type {?} */
    const rootContext = (/** @type {?} */ (getRootView(component)[CONTEXT]));
    ngDevMode && assertDefined(rootContext, 'rootContext');
    return rootContext;
}
/**
 * Wait on component until it is rendered.
 *
 * This function returns a `Promise` which is resolved when the component's
 * change detection is executed. This is determined by finding the scheduler
 * associated with the `component`'s render tree and waiting until the scheduler
 * flushes. If nothing is scheduled, the function returns a resolved promise.
 *
 * Example:
 * ```
 * await whenRendered(myComponent);
 * ```
 *
 * @param {?} component Component to wait upon
 * @return {?} Promise which resolves when the component is rendered.
 */
export function whenRendered(component) {
    return getRootContext(component).clean;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvcmVuZGVyMy9jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFjQSxPQUFPLEVBQUMsbUJBQW1CLEVBQUUsYUFBYSxFQUFDLE1BQU0sVUFBVSxDQUFDO0FBQzVELE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFDN0MsT0FBTyxFQUFDLGtCQUFrQixFQUFFLDhCQUE4QixFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQ3hFLE9BQU8sRUFBQyx5QkFBeUIsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQ3pELE9BQU8sRUFBQyxjQUFjLEVBQUUsbUJBQW1CLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFDNUQsT0FBTyxFQUFDLGFBQWEsRUFBRSxXQUFXLEVBQUUsaUJBQWlCLEVBQWUsV0FBVyxFQUFFLGdCQUFnQixFQUFFLGFBQWEsRUFBRSx3QkFBd0IsRUFBRSxpQkFBaUIsRUFBRSwyQkFBMkIsRUFBRSxzQkFBc0IsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBSTFPLE9BQU8sRUFBd0MsbUJBQW1CLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUNqRyxPQUFPLEVBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBb0QsS0FBSyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDMUksT0FBTyxFQUFDLFNBQVMsRUFBRSx3QkFBd0IsRUFBRSxTQUFTLEVBQUUsbUJBQW1CLEVBQUUsc0JBQXNCLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFDcEgsT0FBTyxFQUFDLGdCQUFnQixFQUFFLFdBQVcsRUFBRSxnQkFBZ0IsRUFBRSxTQUFTLEVBQUMsTUFBTSxRQUFRLENBQUM7Ozs7O0FBS2xGLDRDQThDQzs7Ozs7O0lBNUNDLGlEQUFtQzs7Ozs7SUFHbkMsMkNB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U0FBYyxFQUFFLEdBQXNCOztVQUNwRSxTQUFTLEdBQUcsbUJBQUEsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUM7O1VBQ2hELFFBQVEsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDO0lBRTFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQzdELDJGQUEyRjtJQUMzRixVQUFVO0lBQ1YsbUJBQW1CLENBQUMsU0FBUyxFQUFFLG1CQUFBLEVBQUUsY0FBYyxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsUUFBUSxHQUFHLENBQUMsRUFBRSxFQUFTLENBQUMsQ0FBQztBQUNwRyxDQUFDOzs7Ozs7OztBQVFELFNBQVMsY0FBYyxDQUFDLFNBQWM7O1VBQzlCLFdBQVcsR0FBRyxtQkFBQSxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQWU7SUFDbEUsU0FBUyxJQUFJLGFBQWEsQ0FBQyxXQUFXLEVBQUUsYUFBYSxDQUFDLENBQUM7SUFDdkQsT0FBTyxXQUFXLENBQUM7QUFDckIsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFtQkQsTUFBTSxVQUFVLFlBQVksQ0FBQyxTQUFjO0lBQ3pDLE9BQU8sY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEtBQUssQ0FBQztBQUN6QyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vLyBXZSBhcmUgdGVtcG9yYXJpbHkgaW1wb3J0aW5nIHRoZSBleGlzdGluZyB2aWV3RW5naW5lIGZyb20gY29yZSBzbyB3ZSBjYW4gYmUgc3VyZSB3ZSBhcmVcbi8vIGNvcnJlY3RseSBpbXBsZW1lbnRpbmcgaXRzIGludGVyZmFjZXMgZm9yIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5LlxuaW1wb3J0IHtUeXBlfSBmcm9tICcuLi9jb3JlJztcbmltcG9ydCB7SW5qZWN0b3J9IGZyb20gJy4uL2RpL2luamVjdG9yJztcbmltcG9ydCB7U2FuaXRpemVyfSBmcm9tICcuLi9zYW5pdGl6YXRpb24vc2VjdXJpdHknO1xuXG5pbXBvcnQge2Fzc2VydENvbXBvbmVudFR5cGUsIGFzc2VydERlZmluZWR9IGZyb20gJy4vYXNzZXJ0JztcbmltcG9ydCB7Z2V0Q29tcG9uZW50RGVmfSBmcm9tICcuL2RlZmluaXRpb24nO1xuaW1wb3J0IHtkaVB1YmxpY0luSW5qZWN0b3IsIGdldE9yQ3JlYXRlTm9kZUluamVjdG9yRm9yTm9kZX0gZnJvbSAnLi9kaSc7XG5pbXBvcnQge3B1Ymxpc2hEZWZhdWx0R2xvYmFsVXRpbHN9IGZyb20gJy4vZ2xvYmFsX3V0aWxzJztcbmltcG9ydCB7cXVldWVJbml0SG9va3MsIHF1ZXVlTGlmZWN5Y2xlSG9va3N9IGZyb20gJy4vaG9va3MnO1xuaW1wb3J0IHtDTEVBTl9QUk9NSVNFLCBjcmVhdGVMVmlldywgY3JlYXRlTm9kZUF0SW5kZXgsIGNyZWF0ZVROb2RlLCBjcmVhdGVUVmlldywgZ2V0T3JDcmVhdGVUVmlldywgaW5pdE5vZGVGbGFncywgaW5zdGFudGlhdGVSb290Q29tcG9uZW50LCBsb2NhdGVIb3N0RWxlbWVudCwgcXVldWVDb21wb25lbnRJbmRleEZvckNoZWNrLCByZWZyZXNoRGVzY2VuZGFudFZpZXdzfSBmcm9tICcuL2luc3RydWN0aW9ucyc7XG5pbXBvcnQge0NvbXBvbmVudERlZiwgQ29tcG9uZW50VHlwZSwgUmVuZGVyRmxhZ3N9IGZyb20gJy4vaW50ZXJmYWNlcy9kZWZpbml0aW9uJztcbmltcG9ydCB7VEVsZW1lbnROb2RlLCBUTm9kZSwgVE5vZGVGbGFncywgVE5vZGVUeXBlfSBmcm9tICcuL2ludGVyZmFjZXMvbm9kZSc7XG5pbXBvcnQge1BsYXllckhhbmRsZXJ9IGZyb20gJy4vaW50ZXJmYWNlcy9wbGF5ZXInO1xuaW1wb3J0IHtSRWxlbWVudCwgUmVuZGVyZXIzLCBSZW5kZXJlckZhY3RvcnkzLCBkb21SZW5kZXJlckZhY3RvcnkzfSBmcm9tICcuL2ludGVyZmFjZXMvcmVuZGVyZXInO1xuaW1wb3J0IHtDT05URVhULCBGTEFHUywgSEVBREVSX09GRlNFVCwgSE9TVCwgSE9TVF9OT0RFLCBMVmlldywgTFZpZXdGbGFncywgUm9vdENvbnRleHQsIFJvb3RDb250ZXh0RmxhZ3MsIFRWSUVXfSBmcm9tICcuL2ludGVyZmFjZXMvdmlldyc7XG5pbXBvcnQge2VudGVyVmlldywgZ2V0UHJldmlvdXNPclBhcmVudFROb2RlLCBsZWF2ZVZpZXcsIHJlc2V0Q29tcG9uZW50U3RhdGUsIHNldEN1cnJlbnREaXJlY3RpdmVEZWZ9IGZyb20gJy4vc3RhdGUnO1xuaW1wb3J0IHtkZWZhdWx0U2NoZWR1bGVyLCBnZXRSb290VmlldywgcmVhZFBhdGNoZWRMVmlldywgc3RyaW5naWZ5fSBmcm9tICcuL3V0aWwnO1xuXG5cblxuLyoqIE9wdGlvbnMgdGhhdCBjb250cm9sIGhvdyB0aGUgY29tcG9uZW50IHNob3VsZCBiZSBib290c3RyYXBwZWQuICovXG5leHBvcnQgaW50ZXJmYWNlIENyZWF0ZUNvbXBvbmVudE9wdGlvbnMge1xuICAvKiogV2hpY2ggcmVuZGVyZXIgZmFjdG9yeSB0byB1c2UuICovXG4gIHJlbmRlcmVyRmFjdG9yeT86IFJlbmRlcmVyRmFjdG9yeTM7XG5cbiAgLyoqIEEgY3VzdG9tIHNhbml0aXplciBpbnN0YW5jZSAqL1xuICBzYW5pdGl6ZXI/OiBTYW5pdGl6ZXI7XG5cbiAgLyoqIEEgY3VzdG9tIGFuaW1hdGlvbiBwbGF5ZXIgaGFuZGxlciAqL1xuICBwbGF5ZXJIYW5kbGVyPzogUGxheWVySGFuZGxlcjtcblxuICAvKipcbiAgICogSG9zdCBlbGVtZW50IG9uIHdoaWNoIHRoZSBjb21wb25lbnQgd2lsbCBiZSBib290c3RyYXBwZWQuIElmIG5vdCBzcGVjaWZpZWQsXG4gICAqIHRoZSBjb21wb25lbnQgZGVmaW5pdGlvbidzIGB0YWdgIGlzIHVzZWQgdG8gcXVlcnkgdGhlIGV4aXN0aW5nIERPTSBmb3IgdGhlXG4gICAqIGVsZW1lbnQgdG8gYm9vdHN0cmFwLlxuICAgKi9cbiAgaG9zdD86IFJFbGVtZW50fHN0cmluZztcblxuICAvKiogTW9kdWxlIGluamVjdG9yIGZvciB0aGUgY29tcG9uZW50LiBJZiB1bnNwZWNpZmllZCwgdGhlIGluamVjdG9yIHdpbGwgYmUgTlVMTF9JTkpFQ1RPUi4gKi9cbiAgaW5qZWN0b3I/OiBJbmplY3RvcjtcblxuICAvKipcbiAgICogTGlzdCBvZiBmZWF0dXJlcyB0byBiZSBhcHBsaWVkIHRvIHRoZSBjcmVhdGVkIGNvbXBvbmVudC4gRmVhdHVyZXMgYXJlIHNpbXBseVxuICAgKiBmdW5jdGlvbnMgdGhhdCBkZWNvcmF0ZSBhIGNvbXBvbmVudCB3aXRoIGEgY2VydGFpbiBiZWhhdmlvci5cbiAgICpcbiAgICogVHlwaWNhbGx5LCB0aGUgZmVhdHVyZXMgaW4gdGhpcyBsaXN0IGFyZSBmZWF0dXJlcyB0aGF0IGNhbm5vdCBiZSBhZGRlZCB0byB0aGVcbiAgICogb3RoZXIgZmVhdHVyZXMgbGlzdCBpbiB0aGUgY29tcG9uZW50IGRlZmluaXRpb24gYmVjYXVzZSB0aGV5IHJlbHkgb24gb3RoZXIgZmFjdG9ycy5cbiAgICpcbiAgICogRXhhbXBsZTogYFJvb3RMaWZlY3ljbGVIb29rc2AgaXMgYSBmdW5jdGlvbiB0aGF0IGFkZHMgbGlmZWN5Y2xlIGhvb2sgY2FwYWJpbGl0aWVzXG4gICAqIHRvIHJvb3QgY29tcG9uZW50cyBpbiBhIHRyZWUtc2hha2FibGUgd2F5LiBJdCBjYW5ub3QgYmUgYWRkZWQgdG8gdGhlIGNvbXBvbmVudFxuICAgKiBmZWF0dXJlcyBsaXN0IGJlY2F1c2UgdGhlcmUncyBubyB3YXkgb2Yga25vd2luZyB3aGVuIHRoZSBjb21wb25lbnQgd2lsbCBiZSB1c2VkIGFzXG4gICAqIGEgcm9vdCBjb21wb25lbnQuXG4gICAqL1xuICBob3N0RmVhdHVyZXM/OiBIb3N0RmVhdHVyZVtdO1xuXG4gIC8qKlxuICAgKiBBIGZ1bmN0aW9uIHdoaWNoIGlzIHVzZWQgdG8gc2NoZWR1bGUgY2hhbmdlIGRldGVjdGlvbiB3b3JrIGluIHRoZSBmdXR1cmUuXG4gICAqXG4gICAqIFdoZW4gbWFya2luZyBjb21wb25lbnRzIGFzIGRpcnR5LCBpdCBpcyBuZWNlc3NhcnkgdG8gc2NoZWR1bGUgdGhlIHdvcmsgb2ZcbiAgICogY2hhbmdlIGRldGVjdGlvbiBpbiB0aGUgZnV0dXJlLiBUaGlzIGlzIGRvbmUgdG8gY29hbGVzY2UgbXVsdGlwbGVcbiAgICoge0BsaW5rIG1hcmtEaXJ0eX0gY2FsbHMgaW50byBhIHNpbmdsZSBjaGFuZ2VkIGRldGVjdGlvbiBwcm9jZXNzaW5nLlxuICAgKlxuICAgKiBUaGUgZGVmYXVsdCB2YWx1ZSBvZiB0aGUgc2NoZWR1bGVyIGlzIHRoZSBgcmVxdWVzdEFuaW1hdGlvbkZyYW1lYCBmdW5jdGlvbi5cbiAgICpcbiAgICogSXQgaXMgYWxzbyB1c2VmdWwgdG8gb3ZlcnJpZGUgdGhpcyBmdW5jdGlvbiBmb3IgdGVzdGluZyBwdXJwb3Nlcy5cbiAgICovXG4gIHNjaGVkdWxlcj86ICh3b3JrOiAoKSA9PiB2b2lkKSA9PiB2b2lkO1xufVxuXG4vKiogU2VlIENyZWF0ZUNvbXBvbmVudE9wdGlvbnMuaG9zdEZlYXR1cmVzICovXG50eXBlIEhvc3RGZWF0dXJlID0gKDxUPihjb21wb25lbnQ6IFQsIGNvbXBvbmVudERlZjogQ29tcG9uZW50RGVmPFQ+KSA9PiB2b2lkKTtcblxuLy8gVE9ETzogQSBoYWNrIHRvIG5vdCBwdWxsIGluIHRoZSBOdWxsSW5qZWN0b3IgZnJvbSBAYW5ndWxhci9jb3JlLlxuZXhwb3J0IGNvbnN0IE5VTExfSU5KRUNUT1I6IEluamVjdG9yID0ge1xuICBnZXQ6ICh0b2tlbjogYW55LCBub3RGb3VuZFZhbHVlPzogYW55KSA9PiB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdOdWxsSW5qZWN0b3I6IE5vdCBmb3VuZDogJyArIHN0cmluZ2lmeSh0b2tlbikpO1xuICB9XG59O1xuXG4vKipcbiAqIEJvb3RzdHJhcHMgYSBDb21wb25lbnQgaW50byBhbiBleGlzdGluZyBob3N0IGVsZW1lbnQgYW5kIHJldHVybnMgYW4gaW5zdGFuY2VcbiAqIG9mIHRoZSBjb21wb25lbnQuXG4gKlxuICogVXNlIHRoaXMgZnVuY3Rpb24gdG8gYm9vdHN0cmFwIGEgY29tcG9uZW50IGludG8gdGhlIERPTSB0cmVlLiBFYWNoIGludm9jYXRpb25cbiAqIG9mIHRoaXMgZnVuY3Rpb24gd2lsbCBjcmVhdGUgYSBzZXBhcmF0ZSB0cmVlIG9mIGNvbXBvbmVudHMsIGluamVjdG9ycyBhbmRcbiAqIGNoYW5nZSBkZXRlY3Rpb24gY3ljbGVzIGFuZCBsaWZldGltZXMuIFRvIGR5bmFtaWNhbGx5IGluc2VydCBhIG5ldyBjb21wb25lbnRcbiAqIGludG8gYW4gZXhpc3RpbmcgdHJlZSBzdWNoIHRoYXQgaXQgc2hhcmVzIHRoZSBzYW1lIGluamVjdGlvbiwgY2hhbmdlIGRldGVjdGlvblxuICogYW5kIG9iamVjdCBsaWZldGltZSwgdXNlIHtAbGluayBWaWV3Q29udGFpbmVyI2NyZWF0ZUNvbXBvbmVudH0uXG4gKlxuICogQHBhcmFtIGNvbXBvbmVudFR5cGUgQ29tcG9uZW50IHRvIGJvb3RzdHJhcFxuICogQHBhcmFtIG9wdGlvbnMgT3B0aW9uYWwgcGFyYW1ldGVycyB3aGljaCBjb250cm9sIGJvb3RzdHJhcHBpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlckNvbXBvbmVudDxUPihcbiAgICBjb21wb25lbnRUeXBlOiBDb21wb25lbnRUeXBlPFQ+fFxuICAgICAgICBUeXBlPFQ+LyogVHlwZSBhcyB3b3JrYXJvdW5kIGZvcjogTWljcm9zb2Z0L1R5cGVTY3JpcHQvaXNzdWVzLzQ4ODEgKi9cbiAgICAsXG4gICAgb3B0czogQ3JlYXRlQ29tcG9uZW50T3B0aW9ucyA9IHt9KTogVCB7XG4gIG5nRGV2TW9kZSAmJiBwdWJsaXNoRGVmYXVsdEdsb2JhbFV0aWxzKCk7XG4gIG5nRGV2TW9kZSAmJiBhc3NlcnRDb21wb25lbnRUeXBlKGNvbXBvbmVudFR5cGUpO1xuICBjb25zdCByZW5kZXJlckZhY3RvcnkgPSBvcHRzLnJlbmRlcmVyRmFjdG9yeSB8fCBkb21SZW5kZXJlckZhY3RvcnkzO1xuICBjb25zdCBzYW5pdGl6ZXIgPSBvcHRzLnNhbml0aXplciB8fCBudWxsO1xuICBjb25zdCBjb21wb25lbnREZWYgPSBnZXRDb21wb25lbnREZWY8VD4oY29tcG9uZW50VHlwZSkgITtcbiAgaWYgKGNvbXBvbmVudERlZi50eXBlICE9IGNvbXBvbmVudFR5cGUpIGNvbXBvbmVudERlZi50eXBlID0gY29tcG9uZW50VHlwZTtcblxuICAvLyBUaGUgZmlyc3QgaW5kZXggb2YgdGhlIGZpcnN0IHNlbGVjdG9yIGlzIHRoZSB0YWcgbmFtZS5cbiAgY29uc3QgY29tcG9uZW50VGFnID0gY29tcG9uZW50RGVmLnNlbGVjdG9ycyAhWzBdICFbMF0gYXMgc3RyaW5nO1xuICBjb25zdCBob3N0Uk5vZGUgPSBsb2NhdGVIb3N0RWxlbWVudChyZW5kZXJlckZhY3RvcnksIG9wdHMuaG9zdCB8fCBjb21wb25lbnRUYWcpO1xuICBjb25zdCByb290RmxhZ3MgPSBjb21wb25lbnREZWYub25QdXNoID8gTFZpZXdGbGFncy5EaXJ0eSB8IExWaWV3RmxhZ3MuSXNSb290IDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIExWaWV3RmxhZ3MuQ2hlY2tBbHdheXMgfCBMVmlld0ZsYWdzLklzUm9vdDtcbiAgY29uc3Qgcm9vdENvbnRleHQgPSBjcmVhdGVSb290Q29udGV4dChvcHRzLnNjaGVkdWxlciwgb3B0cy5wbGF5ZXJIYW5kbGVyKTtcblxuICBjb25zdCByZW5kZXJlciA9IHJlbmRlcmVyRmFjdG9yeS5jcmVhdGVSZW5kZXJlcihob3N0Uk5vZGUsIGNvbXBvbmVudERlZik7XG4gIGNvbnN0IHJvb3RWaWV3OiBMVmlldyA9IGNyZWF0ZUxWaWV3KFxuICAgICAgbnVsbCwgY3JlYXRlVFZpZXcoLTEsIG51bGwsIDEsIDAsIG51bGwsIG51bGwsIG51bGwpLCByb290Q29udGV4dCwgcm9vdEZsYWdzLCByZW5kZXJlckZhY3RvcnksXG4gICAgICByZW5kZXJlciwgdW5kZWZpbmVkLCBvcHRzLmluamVjdG9yIHx8IG51bGwpO1xuXG4gIGNvbnN0IG9sZFZpZXcgPSBlbnRlclZpZXcocm9vdFZpZXcsIG51bGwpO1xuICBsZXQgY29tcG9uZW50OiBUO1xuICB0cnkge1xuICAgIGlmIChyZW5kZXJlckZhY3RvcnkuYmVnaW4pIHJlbmRlcmVyRmFjdG9yeS5iZWdpbigpO1xuICAgIGNvbnN0IGNvbXBvbmVudFZpZXcgPSBjcmVhdGVSb290Q29tcG9uZW50VmlldyhcbiAgICAgICAgaG9zdFJOb2RlLCBjb21wb25lbnREZWYsIHJvb3RWaWV3LCByZW5kZXJlckZhY3RvcnksIHJlbmRlcmVyLCBzYW5pdGl6ZXIpO1xuICAgIGNvbXBvbmVudCA9IGNyZWF0ZVJvb3RDb21wb25lbnQoXG4gICAgICAgIGNvbXBvbmVudFZpZXcsIGNvbXBvbmVudERlZiwgcm9vdFZpZXcsIHJvb3RDb250ZXh0LCBvcHRzLmhvc3RGZWF0dXJlcyB8fCBudWxsKTtcblxuICAgIHJlZnJlc2hEZXNjZW5kYW50Vmlld3Mocm9vdFZpZXcpOyAgLy8gY3JlYXRpb24gbW9kZSBwYXNzXG4gICAgcm9vdFZpZXdbRkxBR1NdICY9IH5MVmlld0ZsYWdzLkNyZWF0aW9uTW9kZTtcbiAgICByZWZyZXNoRGVzY2VuZGFudFZpZXdzKHJvb3RWaWV3KTsgIC8vIHVwZGF0ZSBtb2RlIHBhc3NcbiAgfSBmaW5hbGx5IHtcbiAgICBsZWF2ZVZpZXcob2xkVmlldyk7XG4gICAgaWYgKHJlbmRlcmVyRmFjdG9yeS5lbmQpIHJlbmRlcmVyRmFjdG9yeS5lbmQoKTtcbiAgfVxuXG4gIHJldHVybiBjb21wb25lbnQ7XG59XG5cbi8qKlxuICogQ3JlYXRlcyB0aGUgcm9vdCBjb21wb25lbnQgdmlldyBhbmQgdGhlIHJvb3QgY29tcG9uZW50IG5vZGUuXG4gKlxuICogQHBhcmFtIHJOb2RlIFJlbmRlciBob3N0IGVsZW1lbnQuXG4gKiBAcGFyYW0gZGVmIENvbXBvbmVudERlZlxuICogQHBhcmFtIHJvb3RWaWV3IFRoZSBwYXJlbnQgdmlldyB3aGVyZSB0aGUgaG9zdCBub2RlIGlzIHN0b3JlZFxuICogQHBhcmFtIHJlbmRlcmVyIFRoZSBjdXJyZW50IHJlbmRlcmVyXG4gKiBAcGFyYW0gc2FuaXRpemVyIFRoZSBzYW5pdGl6ZXIsIGlmIHByb3ZpZGVkXG4gKlxuICogQHJldHVybnMgQ29tcG9uZW50IHZpZXcgY3JlYXRlZFxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUm9vdENvbXBvbmVudFZpZXcoXG4gICAgck5vZGU6IFJFbGVtZW50IHwgbnVsbCwgZGVmOiBDb21wb25lbnREZWY8YW55Piwgcm9vdFZpZXc6IExWaWV3LFxuICAgIHJlbmRlcmVyRmFjdG9yeTogUmVuZGVyZXJGYWN0b3J5MywgcmVuZGVyZXI6IFJlbmRlcmVyMywgc2FuaXRpemVyPzogU2FuaXRpemVyIHwgbnVsbCk6IExWaWV3IHtcbiAgcmVzZXRDb21wb25lbnRTdGF0ZSgpO1xuICBjb25zdCB0VmlldyA9IHJvb3RWaWV3W1RWSUVXXTtcbiAgY29uc3QgY29tcG9uZW50VmlldyA9IGNyZWF0ZUxWaWV3KFxuICAgICAgcm9vdFZpZXcsXG4gICAgICBnZXRPckNyZWF0ZVRWaWV3KFxuICAgICAgICAgIGRlZi50ZW1wbGF0ZSwgZGVmLmNvbnN0cywgZGVmLnZhcnMsIGRlZi5kaXJlY3RpdmVEZWZzLCBkZWYucGlwZURlZnMsIGRlZi52aWV3UXVlcnkpLFxuICAgICAgbnVsbCwgZGVmLm9uUHVzaCA/IExWaWV3RmxhZ3MuRGlydHkgOiBMVmlld0ZsYWdzLkNoZWNrQWx3YXlzLCByZW5kZXJlckZhY3RvcnksIHJlbmRlcmVyLFxuICAgICAgc2FuaXRpemVyKTtcbiAgY29uc3QgdE5vZGUgPSBjcmVhdGVOb2RlQXRJbmRleCgwLCBUTm9kZVR5cGUuRWxlbWVudCwgck5vZGUsIG51bGwsIG51bGwpO1xuXG4gIGlmICh0Vmlldy5maXJzdFRlbXBsYXRlUGFzcykge1xuICAgIGRpUHVibGljSW5JbmplY3RvcihnZXRPckNyZWF0ZU5vZGVJbmplY3RvckZvck5vZGUodE5vZGUsIHJvb3RWaWV3KSwgcm9vdFZpZXcsIGRlZi50eXBlKTtcbiAgICB0Tm9kZS5mbGFncyA9IFROb2RlRmxhZ3MuaXNDb21wb25lbnQ7XG4gICAgaW5pdE5vZGVGbGFncyh0Tm9kZSwgcm9vdFZpZXcubGVuZ3RoLCAxKTtcbiAgICBxdWV1ZUNvbXBvbmVudEluZGV4Rm9yQ2hlY2sodE5vZGUpO1xuICB9XG5cbiAgLy8gU3RvcmUgY29tcG9uZW50IHZpZXcgYXQgbm9kZSBpbmRleCwgd2l0aCBub2RlIGFzIHRoZSBIT1NUXG4gIGNvbXBvbmVudFZpZXdbSE9TVF0gPSByb290Vmlld1tIRUFERVJfT0ZGU0VUXTtcbiAgY29tcG9uZW50Vmlld1tIT1NUX05PREVdID0gdE5vZGUgYXMgVEVsZW1lbnROb2RlO1xuICByZXR1cm4gcm9vdFZpZXdbSEVBREVSX09GRlNFVF0gPSBjb21wb25lbnRWaWV3O1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSByb290IGNvbXBvbmVudCBhbmQgc2V0cyBpdCB1cCB3aXRoIGZlYXR1cmVzIGFuZCBob3N0IGJpbmRpbmdzLiBTaGFyZWQgYnlcbiAqIHJlbmRlckNvbXBvbmVudCgpIGFuZCBWaWV3Q29udGFpbmVyUmVmLmNyZWF0ZUNvbXBvbmVudCgpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUm9vdENvbXBvbmVudDxUPihcbiAgICBjb21wb25lbnRWaWV3OiBMVmlldywgY29tcG9uZW50RGVmOiBDb21wb25lbnREZWY8VD4sIHJvb3RWaWV3OiBMVmlldywgcm9vdENvbnRleHQ6IFJvb3RDb250ZXh0LFxuICAgIGhvc3RGZWF0dXJlczogSG9zdEZlYXR1cmVbXSB8IG51bGwpOiBhbnkge1xuICBjb25zdCB0VmlldyA9IHJvb3RWaWV3W1RWSUVXXTtcbiAgLy8gQ3JlYXRlIGRpcmVjdGl2ZSBpbnN0YW5jZSB3aXRoIGZhY3RvcnkoKSBhbmQgc3RvcmUgYXQgbmV4dCBpbmRleCBpbiB2aWV3RGF0YVxuICBjb25zdCBjb21wb25lbnQgPSBpbnN0YW50aWF0ZVJvb3RDb21wb25lbnQodFZpZXcsIHJvb3RWaWV3LCBjb21wb25lbnREZWYpO1xuXG4gIHJvb3RDb250ZXh0LmNvbXBvbmVudHMucHVzaChjb21wb25lbnQpO1xuICBjb21wb25lbnRWaWV3W0NPTlRFWFRdID0gY29tcG9uZW50O1xuXG4gIGhvc3RGZWF0dXJlcyAmJiBob3N0RmVhdHVyZXMuZm9yRWFjaCgoZmVhdHVyZSkgPT4gZmVhdHVyZShjb21wb25lbnQsIGNvbXBvbmVudERlZikpO1xuXG4gIGlmICh0Vmlldy5maXJzdFRlbXBsYXRlUGFzcyAmJiBjb21wb25lbnREZWYuaG9zdEJpbmRpbmdzKSB7XG4gICAgY29uc3Qgcm9vdFROb2RlID0gZ2V0UHJldmlvdXNPclBhcmVudFROb2RlKCk7XG4gICAgc2V0Q3VycmVudERpcmVjdGl2ZURlZihjb21wb25lbnREZWYpO1xuICAgIGNvbXBvbmVudERlZi5ob3N0QmluZGluZ3MoUmVuZGVyRmxhZ3MuQ3JlYXRlLCBjb21wb25lbnQsIHJvb3RUTm9kZS5pbmRleCAtIEhFQURFUl9PRkZTRVQpO1xuICAgIHNldEN1cnJlbnREaXJlY3RpdmVEZWYobnVsbCk7XG4gIH1cblxuICByZXR1cm4gY29tcG9uZW50O1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVSb290Q29udGV4dChcbiAgICBzY2hlZHVsZXI/OiAod29ya0ZuOiAoKSA9PiB2b2lkKSA9PiB2b2lkLCBwbGF5ZXJIYW5kbGVyPzogUGxheWVySGFuZGxlcnxudWxsKTogUm9vdENvbnRleHQge1xuICByZXR1cm4ge1xuICAgIGNvbXBvbmVudHM6IFtdLFxuICAgIHNjaGVkdWxlcjogc2NoZWR1bGVyIHx8IGRlZmF1bHRTY2hlZHVsZXIsXG4gICAgY2xlYW46IENMRUFOX1BST01JU0UsXG4gICAgcGxheWVySGFuZGxlcjogcGxheWVySGFuZGxlciB8fCBudWxsLFxuICAgIGZsYWdzOiBSb290Q29udGV4dEZsYWdzLkVtcHR5XG4gIH07XG59XG5cbi8qKlxuICogVXNlZCB0byBlbmFibGUgbGlmZWN5Y2xlIGhvb2tzIG9uIHRoZSByb290IGNvbXBvbmVudC5cbiAqXG4gKiBJbmNsdWRlIHRoaXMgZmVhdHVyZSB3aGVuIGNhbGxpbmcgYHJlbmRlckNvbXBvbmVudGAgaWYgdGhlIHJvb3QgY29tcG9uZW50XG4gKiB5b3UgYXJlIHJlbmRlcmluZyBoYXMgbGlmZWN5Y2xlIGhvb2tzIGRlZmluZWQuIE90aGVyd2lzZSwgdGhlIGhvb2tzIHdvbid0XG4gKiBiZSBjYWxsZWQgcHJvcGVybHkuXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiBgYGBcbiAqIHJlbmRlckNvbXBvbmVudChBcHBDb21wb25lbnQsIHtmZWF0dXJlczogW1Jvb3RMaWZlY3ljbGVIb29rc119KTtcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gTGlmZWN5Y2xlSG9va3NGZWF0dXJlKGNvbXBvbmVudDogYW55LCBkZWY6IENvbXBvbmVudERlZjxhbnk+KTogdm9pZCB7XG4gIGNvbnN0IHJvb3RUVmlldyA9IHJlYWRQYXRjaGVkTFZpZXcoY29tcG9uZW50KSAhW1RWSUVXXTtcbiAgY29uc3QgZGlySW5kZXggPSByb290VFZpZXcuZGF0YS5sZW5ndGggLSAxO1xuXG4gIHF1ZXVlSW5pdEhvb2tzKGRpckluZGV4LCBkZWYub25Jbml0LCBkZWYuZG9DaGVjaywgcm9vdFRWaWV3KTtcbiAgLy8gVE9ETyhtaXNrbyk6IHJlcGxhY2UgYGFzIFROb2RlYCB3aXRoIGNyZWF0ZVROb2RlIGNhbGwuIChuZWVkcyByZWZhY3RvcmluZyB0byBsb3NlIGRlcCBvblxuICAvLyBMTm9kZSkuXG4gIHF1ZXVlTGlmZWN5Y2xlSG9va3Mocm9vdFRWaWV3LCB7IGRpcmVjdGl2ZVN0YXJ0OiBkaXJJbmRleCwgZGlyZWN0aXZlRW5kOiBkaXJJbmRleCArIDEgfSBhcyBUTm9kZSk7XG59XG5cbi8qKlxuICogUmV0cmlldmUgdGhlIHJvb3QgY29udGV4dCBmb3IgYW55IGNvbXBvbmVudCBieSB3YWxraW5nIHRoZSBwYXJlbnQgYExWaWV3YCB1bnRpbFxuICogcmVhY2hpbmcgdGhlIHJvb3QgYExWaWV3YC5cbiAqXG4gKiBAcGFyYW0gY29tcG9uZW50IGFueSBjb21wb25lbnRcbiAqL1xuZnVuY3Rpb24gZ2V0Um9vdENvbnRleHQoY29tcG9uZW50OiBhbnkpOiBSb290Q29udGV4dCB7XG4gIGNvbnN0IHJvb3RDb250ZXh0ID0gZ2V0Um9vdFZpZXcoY29tcG9uZW50KVtDT05URVhUXSBhcyBSb290Q29udGV4dDtcbiAgbmdEZXZNb2RlICYmIGFzc2VydERlZmluZWQocm9vdENvbnRleHQsICdyb290Q29udGV4dCcpO1xuICByZXR1cm4gcm9vdENvbnRleHQ7XG59XG5cblxuLyoqXG4gKiBXYWl0IG9uIGNvbXBvbmVudCB1bnRpbCBpdCBpcyByZW5kZXJlZC5cbiAqXG4gKiBUaGlzIGZ1bmN0aW9uIHJldHVybnMgYSBgUHJvbWlzZWAgd2hpY2ggaXMgcmVzb2x2ZWQgd2hlbiB0aGUgY29tcG9uZW50J3NcbiAqIGNoYW5nZSBkZXRlY3Rpb24gaXMgZXhlY3V0ZWQuIFRoaXMgaXMgZGV0ZXJtaW5lZCBieSBmaW5kaW5nIHRoZSBzY2hlZHVsZXJcbiAqIGFzc29jaWF0ZWQgd2l0aCB0aGUgYGNvbXBvbmVudGAncyByZW5kZXIgdHJlZSBhbmQgd2FpdGluZyB1bnRpbCB0aGUgc2NoZWR1bGVyXG4gKiBmbHVzaGVzLiBJZiBub3RoaW5nIGlzIHNjaGVkdWxlZCwgdGhlIGZ1bmN0aW9uIHJldHVybnMgYSByZXNvbHZlZCBwcm9taXNlLlxuICpcbiAqIEV4YW1wbGU6XG4gKiBgYGBcbiAqIGF3YWl0IHdoZW5SZW5kZXJlZChteUNvbXBvbmVudCk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gY29tcG9uZW50IENvbXBvbmVudCB0byB3YWl0IHVwb25cbiAqIEByZXR1cm5zIFByb21pc2Ugd2hpY2ggcmVzb2x2ZXMgd2hlbiB0aGUgY29tcG9uZW50IGlzIHJlbmRlcmVkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gd2hlblJlbmRlcmVkKGNvbXBvbmVudDogYW55KTogUHJvbWlzZTxudWxsPiB7XG4gIHJldHVybiBnZXRSb290Q29udGV4dChjb21wb25lbnQpLmNsZWFuO1xufVxuIl19