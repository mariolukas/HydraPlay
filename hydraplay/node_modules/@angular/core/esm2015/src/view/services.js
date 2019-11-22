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
import { DebugElement__PRE_R3__, DebugNode__PRE_R3__, EventListener, getDebugNode, indexDebugNode, removeDebugNodeFromIndex } from '../debug/debug_node';
import { getInjectableDef } from '../di/defs';
import { ErrorHandler } from '../error_handler';
import { isDevMode } from '../is_dev_mode';
import { RendererFactory2 } from '../render/api';
import { Sanitizer } from '../sanitization/security';
import { normalizeDebugBindingName, normalizeDebugBindingValue } from '../util/ng_reflect';
import { isViewDebugError, viewDestroyedError, viewWrappedDebugError } from './errors';
import { resolveDep } from './provider';
import { dirtyParentQueries, getQueryValue } from './query';
import { createInjector, createNgModuleRef, getComponentViewDefinitionFactory } from './refs';
import { Services, asElementData, asPureExpressionData } from './types';
import { NOOP, isComponentView, renderNode, resolveDefinition, splitDepsDsl, tokenKey, viewParentEl } from './util';
import { checkAndUpdateNode, checkAndUpdateView, checkNoChangesNode, checkNoChangesView, createComponentView, createEmbeddedView, createRootView, destroyView } from './view';
/** @type {?} */
let initialized = false;
/**
 * @return {?}
 */
export function initServicesIfNeeded() {
    if (initialized) {
        return;
    }
    initialized = true;
    /** @type {?} */
    const services = isDevMode() ? createDebugServices() : createProdServices();
    Services.setCurrentNode = services.setCurrentNode;
    Services.createRootView = services.createRootView;
    Services.createEmbeddedView = services.createEmbeddedView;
    Services.createComponentView = services.createComponentView;
    Services.createNgModuleRef = services.createNgModuleRef;
    Services.overrideProvider = services.overrideProvider;
    Services.overrideComponentView = services.overrideComponentView;
    Services.clearOverrides = services.clearOverrides;
    Services.checkAndUpdateView = services.checkAndUpdateView;
    Services.checkNoChangesView = services.checkNoChangesView;
    Services.destroyView = services.destroyView;
    Services.resolveDep = resolveDep;
    Services.createDebugContext = services.createDebugContext;
    Services.handleEvent = services.handleEvent;
    Services.updateDirectives = services.updateDirectives;
    Services.updateRenderer = services.updateRenderer;
    Services.dirtyParentQueries = dirtyParentQueries;
}
/**
 * @return {?}
 */
function createProdServices() {
    return {
        setCurrentNode: () => { },
        createRootView: createProdRootView,
        createEmbeddedView: createEmbeddedView,
        createComponentView: createComponentView,
        createNgModuleRef: createNgModuleRef,
        overrideProvider: NOOP,
        overrideComponentView: NOOP,
        clearOverrides: NOOP,
        checkAndUpdateView: checkAndUpdateView,
        checkNoChangesView: checkNoChangesView,
        destroyView: destroyView,
        createDebugContext: (view, nodeIndex) => new DebugContext_(view, nodeIndex),
        handleEvent: (view, nodeIndex, eventName, event) => view.def.handleEvent(view, nodeIndex, eventName, event),
        updateDirectives: (view, checkType) => view.def.updateDirectives(checkType === 0 /* CheckAndUpdate */ ? prodCheckAndUpdateNode :
            prodCheckNoChangesNode, view),
        updateRenderer: (view, checkType) => view.def.updateRenderer(checkType === 0 /* CheckAndUpdate */ ? prodCheckAndUpdateNode :
            prodCheckNoChangesNode, view),
    };
}
/**
 * @return {?}
 */
function createDebugServices() {
    return {
        setCurrentNode: debugSetCurrentNode,
        createRootView: debugCreateRootView,
        createEmbeddedView: debugCreateEmbeddedView,
        createComponentView: debugCreateComponentView,
        createNgModuleRef: debugCreateNgModuleRef,
        overrideProvider: debugOverrideProvider,
        overrideComponentView: debugOverrideComponentView,
        clearOverrides: debugClearOverrides,
        checkAndUpdateView: debugCheckAndUpdateView,
        checkNoChangesView: debugCheckNoChangesView,
        destroyView: debugDestroyView,
        createDebugContext: (view, nodeIndex) => new DebugContext_(view, nodeIndex),
        handleEvent: debugHandleEvent,
        updateDirectives: debugUpdateDirectives,
        updateRenderer: debugUpdateRenderer,
    };
}
/**
 * @param {?} elInjector
 * @param {?} projectableNodes
 * @param {?} rootSelectorOrNode
 * @param {?} def
 * @param {?} ngModule
 * @param {?=} context
 * @return {?}
 */
function createProdRootView(elInjector, projectableNodes, rootSelectorOrNode, def, ngModule, context) {
    /** @type {?} */
    const rendererFactory = ngModule.injector.get(RendererFactory2);
    return createRootView(createRootData(elInjector, ngModule, rendererFactory, projectableNodes, rootSelectorOrNode), def, context);
}
/**
 * @param {?} elInjector
 * @param {?} projectableNodes
 * @param {?} rootSelectorOrNode
 * @param {?} def
 * @param {?} ngModule
 * @param {?=} context
 * @return {?}
 */
function debugCreateRootView(elInjector, projectableNodes, rootSelectorOrNode, def, ngModule, context) {
    /** @type {?} */
    const rendererFactory = ngModule.injector.get(RendererFactory2);
    /** @type {?} */
    const root = createRootData(elInjector, ngModule, new DebugRendererFactory2(rendererFactory), projectableNodes, rootSelectorOrNode);
    /** @type {?} */
    const defWithOverride = applyProviderOverridesToView(def);
    return callWithDebugContext(DebugAction.create, createRootView, null, [root, defWithOverride, context]);
}
/**
 * @param {?} elInjector
 * @param {?} ngModule
 * @param {?} rendererFactory
 * @param {?} projectableNodes
 * @param {?} rootSelectorOrNode
 * @return {?}
 */
function createRootData(elInjector, ngModule, rendererFactory, projectableNodes, rootSelectorOrNode) {
    /** @type {?} */
    const sanitizer = ngModule.injector.get(Sanitizer);
    /** @type {?} */
    const errorHandler = ngModule.injector.get(ErrorHandler);
    /** @type {?} */
    const renderer = rendererFactory.createRenderer(null, null);
    return {
        ngModule,
        injector: elInjector, projectableNodes,
        selectorOrNode: rootSelectorOrNode, sanitizer, rendererFactory, renderer, errorHandler
    };
}
/**
 * @param {?} parentView
 * @param {?} anchorDef
 * @param {?} viewDef
 * @param {?=} context
 * @return {?}
 */
function debugCreateEmbeddedView(parentView, anchorDef, viewDef, context) {
    /** @type {?} */
    const defWithOverride = applyProviderOverridesToView(viewDef);
    return callWithDebugContext(DebugAction.create, createEmbeddedView, null, [parentView, anchorDef, defWithOverride, context]);
}
/**
 * @param {?} parentView
 * @param {?} nodeDef
 * @param {?} viewDef
 * @param {?} hostElement
 * @return {?}
 */
function debugCreateComponentView(parentView, nodeDef, viewDef, hostElement) {
    /** @type {?} */
    const overrideComponentView = viewDefOverrides.get((/** @type {?} */ ((/** @type {?} */ ((/** @type {?} */ (nodeDef.element)).componentProvider)).provider)).token);
    if (overrideComponentView) {
        viewDef = overrideComponentView;
    }
    else {
        viewDef = applyProviderOverridesToView(viewDef);
    }
    return callWithDebugContext(DebugAction.create, createComponentView, null, [parentView, nodeDef, viewDef, hostElement]);
}
/**
 * @param {?} moduleType
 * @param {?} parentInjector
 * @param {?} bootstrapComponents
 * @param {?} def
 * @return {?}
 */
function debugCreateNgModuleRef(moduleType, parentInjector, bootstrapComponents, def) {
    /** @type {?} */
    const defWithOverride = applyProviderOverridesToNgModule(def);
    return createNgModuleRef(moduleType, parentInjector, bootstrapComponents, defWithOverride);
}
/** @type {?} */
const providerOverrides = new Map();
/** @type {?} */
const providerOverridesWithScope = new Map();
/** @type {?} */
const viewDefOverrides = new Map();
/**
 * @param {?} override
 * @return {?}
 */
function debugOverrideProvider(override) {
    providerOverrides.set(override.token, override);
    /** @type {?} */
    let injectableDef;
    if (typeof override.token === 'function' && (injectableDef = getInjectableDef(override.token)) &&
        typeof injectableDef.providedIn === 'function') {
        providerOverridesWithScope.set((/** @type {?} */ (override.token)), override);
    }
}
/**
 * @param {?} comp
 * @param {?} compFactory
 * @return {?}
 */
function debugOverrideComponentView(comp, compFactory) {
    /** @type {?} */
    const hostViewDef = resolveDefinition(getComponentViewDefinitionFactory(compFactory));
    /** @type {?} */
    const compViewDef = resolveDefinition((/** @type {?} */ ((/** @type {?} */ (hostViewDef.nodes[0].element)).componentView)));
    viewDefOverrides.set(comp, compViewDef);
}
/**
 * @return {?}
 */
function debugClearOverrides() {
    providerOverrides.clear();
    providerOverridesWithScope.clear();
    viewDefOverrides.clear();
}
// Notes about the algorithm:
// 1) Locate the providers of an element and check if one of them was overwritten
// 2) Change the providers of that element
//
// We only create new datastructures if we need to, to keep perf impact
// reasonable.
/**
 * @param {?} def
 * @return {?}
 */
function applyProviderOverridesToView(def) {
    if (providerOverrides.size === 0) {
        return def;
    }
    /** @type {?} */
    const elementIndicesWithOverwrittenProviders = findElementIndicesWithOverwrittenProviders(def);
    if (elementIndicesWithOverwrittenProviders.length === 0) {
        return def;
    }
    // clone the whole view definition,
    // as it maintains references between the nodes that are hard to update.
    def = (/** @type {?} */ (def.factory))(() => NOOP);
    for (let i = 0; i < elementIndicesWithOverwrittenProviders.length; i++) {
        applyProviderOverridesToElement(def, elementIndicesWithOverwrittenProviders[i]);
    }
    return def;
    /**
     * @param {?} def
     * @return {?}
     */
    function findElementIndicesWithOverwrittenProviders(def) {
        /** @type {?} */
        const elIndicesWithOverwrittenProviders = [];
        /** @type {?} */
        let lastElementDef = null;
        for (let i = 0; i < def.nodes.length; i++) {
            /** @type {?} */
            const nodeDef = def.nodes[i];
            if (nodeDef.flags & 1 /* TypeElement */) {
                lastElementDef = nodeDef;
            }
            if (lastElementDef && nodeDef.flags & 3840 /* CatProviderNoDirective */ &&
                providerOverrides.has((/** @type {?} */ (nodeDef.provider)).token)) {
                elIndicesWithOverwrittenProviders.push((/** @type {?} */ (lastElementDef)).nodeIndex);
                lastElementDef = null;
            }
        }
        return elIndicesWithOverwrittenProviders;
    }
    /**
     * @param {?} viewDef
     * @param {?} elIndex
     * @return {?}
     */
    function applyProviderOverridesToElement(viewDef, elIndex) {
        for (let i = elIndex + 1; i < viewDef.nodes.length; i++) {
            /** @type {?} */
            const nodeDef = viewDef.nodes[i];
            if (nodeDef.flags & 1 /* TypeElement */) {
                // stop at the next element
                return;
            }
            if (nodeDef.flags & 3840 /* CatProviderNoDirective */) {
                /** @type {?} */
                const provider = (/** @type {?} */ (nodeDef.provider));
                /** @type {?} */
                const override = providerOverrides.get(provider.token);
                if (override) {
                    nodeDef.flags = (nodeDef.flags & ~3840 /* CatProviderNoDirective */) | override.flags;
                    provider.deps = splitDepsDsl(override.deps);
                    provider.value = override.value;
                }
            }
        }
    }
}
// Notes about the algorithm:
// We only create new datastructures if we need to, to keep perf impact
// reasonable.
/**
 * @param {?} def
 * @return {?}
 */
function applyProviderOverridesToNgModule(def) {
    const { hasOverrides, hasDeprecatedOverrides } = calcHasOverrides(def);
    if (!hasOverrides) {
        return def;
    }
    // clone the whole view definition,
    // as it maintains references between the nodes that are hard to update.
    def = (/** @type {?} */ (def.factory))(() => NOOP);
    applyProviderOverrides(def);
    return def;
    /**
     * @param {?} def
     * @return {?}
     */
    function calcHasOverrides(def) {
        /** @type {?} */
        let hasOverrides = false;
        /** @type {?} */
        let hasDeprecatedOverrides = false;
        if (providerOverrides.size === 0) {
            return { hasOverrides, hasDeprecatedOverrides };
        }
        def.providers.forEach(node => {
            /** @type {?} */
            const override = providerOverrides.get(node.token);
            if ((node.flags & 3840 /* CatProviderNoDirective */) && override) {
                hasOverrides = true;
                hasDeprecatedOverrides = hasDeprecatedOverrides || override.deprecatedBehavior;
            }
        });
        def.modules.forEach(module => {
            providerOverridesWithScope.forEach((override, token) => {
                if ((/** @type {?} */ (getInjectableDef(token))).providedIn === module) {
                    hasOverrides = true;
                    hasDeprecatedOverrides = hasDeprecatedOverrides || override.deprecatedBehavior;
                }
            });
        });
        return { hasOverrides, hasDeprecatedOverrides };
    }
    /**
     * @param {?} def
     * @return {?}
     */
    function applyProviderOverrides(def) {
        for (let i = 0; i < def.providers.length; i++) {
            /** @type {?} */
            const provider = def.providers[i];
            if (hasDeprecatedOverrides) {
                // We had a bug where me made
                // all providers lazy. Keep this logic behind a flag
                // for migrating existing users.
                provider.flags |= 4096 /* LazyProvider */;
            }
            /** @type {?} */
            const override = providerOverrides.get(provider.token);
            if (override) {
                provider.flags = (provider.flags & ~3840 /* CatProviderNoDirective */) | override.flags;
                provider.deps = splitDepsDsl(override.deps);
                provider.value = override.value;
            }
        }
        if (providerOverridesWithScope.size > 0) {
            /** @type {?} */
            let moduleSet = new Set(def.modules);
            providerOverridesWithScope.forEach((override, token) => {
                if (moduleSet.has((/** @type {?} */ (getInjectableDef(token))).providedIn)) {
                    /** @type {?} */
                    let provider = {
                        token: token,
                        flags: override.flags | (hasDeprecatedOverrides ? 4096 /* LazyProvider */ : 0 /* None */),
                        deps: splitDepsDsl(override.deps),
                        value: override.value,
                        index: def.providers.length,
                    };
                    def.providers.push(provider);
                    def.providersByKey[tokenKey(token)] = provider;
                }
            });
        }
    }
}
/**
 * @param {?} view
 * @param {?} checkIndex
 * @param {?} argStyle
 * @param {?=} v0
 * @param {?=} v1
 * @param {?=} v2
 * @param {?=} v3
 * @param {?=} v4
 * @param {?=} v5
 * @param {?=} v6
 * @param {?=} v7
 * @param {?=} v8
 * @param {?=} v9
 * @return {?}
 */
function prodCheckAndUpdateNode(view, checkIndex, argStyle, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9) {
    /** @type {?} */
    const nodeDef = view.def.nodes[checkIndex];
    checkAndUpdateNode(view, nodeDef, argStyle, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9);
    return (nodeDef.flags & 224 /* CatPureExpression */) ?
        asPureExpressionData(view, checkIndex).value :
        undefined;
}
/**
 * @param {?} view
 * @param {?} checkIndex
 * @param {?} argStyle
 * @param {?=} v0
 * @param {?=} v1
 * @param {?=} v2
 * @param {?=} v3
 * @param {?=} v4
 * @param {?=} v5
 * @param {?=} v6
 * @param {?=} v7
 * @param {?=} v8
 * @param {?=} v9
 * @return {?}
 */
function prodCheckNoChangesNode(view, checkIndex, argStyle, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9) {
    /** @type {?} */
    const nodeDef = view.def.nodes[checkIndex];
    checkNoChangesNode(view, nodeDef, argStyle, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9);
    return (nodeDef.flags & 224 /* CatPureExpression */) ?
        asPureExpressionData(view, checkIndex).value :
        undefined;
}
/**
 * @param {?} view
 * @return {?}
 */
function debugCheckAndUpdateView(view) {
    return callWithDebugContext(DebugAction.detectChanges, checkAndUpdateView, null, [view]);
}
/**
 * @param {?} view
 * @return {?}
 */
function debugCheckNoChangesView(view) {
    return callWithDebugContext(DebugAction.checkNoChanges, checkNoChangesView, null, [view]);
}
/**
 * @param {?} view
 * @return {?}
 */
function debugDestroyView(view) {
    return callWithDebugContext(DebugAction.destroy, destroyView, null, [view]);
}
/** @enum {number} */
const DebugAction = {
    create: 0,
    detectChanges: 1,
    checkNoChanges: 2,
    destroy: 3,
    handleEvent: 4,
};
DebugAction[DebugAction.create] = 'create';
DebugAction[DebugAction.detectChanges] = 'detectChanges';
DebugAction[DebugAction.checkNoChanges] = 'checkNoChanges';
DebugAction[DebugAction.destroy] = 'destroy';
DebugAction[DebugAction.handleEvent] = 'handleEvent';
/** @type {?} */
let _currentAction;
/** @type {?} */
let _currentView;
/** @type {?} */
let _currentNodeIndex;
/**
 * @param {?} view
 * @param {?} nodeIndex
 * @return {?}
 */
function debugSetCurrentNode(view, nodeIndex) {
    _currentView = view;
    _currentNodeIndex = nodeIndex;
}
/**
 * @param {?} view
 * @param {?} nodeIndex
 * @param {?} eventName
 * @param {?} event
 * @return {?}
 */
function debugHandleEvent(view, nodeIndex, eventName, event) {
    debugSetCurrentNode(view, nodeIndex);
    return callWithDebugContext(DebugAction.handleEvent, view.def.handleEvent, null, [view, nodeIndex, eventName, event]);
}
/**
 * @param {?} view
 * @param {?} checkType
 * @return {?}
 */
function debugUpdateDirectives(view, checkType) {
    if (view.state & 128 /* Destroyed */) {
        throw viewDestroyedError(DebugAction[_currentAction]);
    }
    debugSetCurrentNode(view, nextDirectiveWithBinding(view, 0));
    return view.def.updateDirectives(debugCheckDirectivesFn, view);
    /**
     * @param {?} view
     * @param {?} nodeIndex
     * @param {?} argStyle
     * @param {...?} values
     * @return {?}
     */
    function debugCheckDirectivesFn(view, nodeIndex, argStyle, ...values) {
        /** @type {?} */
        const nodeDef = view.def.nodes[nodeIndex];
        if (checkType === 0 /* CheckAndUpdate */) {
            debugCheckAndUpdateNode(view, nodeDef, argStyle, values);
        }
        else {
            debugCheckNoChangesNode(view, nodeDef, argStyle, values);
        }
        if (nodeDef.flags & 16384 /* TypeDirective */) {
            debugSetCurrentNode(view, nextDirectiveWithBinding(view, nodeIndex));
        }
        return (nodeDef.flags & 224 /* CatPureExpression */) ?
            asPureExpressionData(view, nodeDef.nodeIndex).value :
            undefined;
    }
}
/**
 * @param {?} view
 * @param {?} checkType
 * @return {?}
 */
function debugUpdateRenderer(view, checkType) {
    if (view.state & 128 /* Destroyed */) {
        throw viewDestroyedError(DebugAction[_currentAction]);
    }
    debugSetCurrentNode(view, nextRenderNodeWithBinding(view, 0));
    return view.def.updateRenderer(debugCheckRenderNodeFn, view);
    /**
     * @param {?} view
     * @param {?} nodeIndex
     * @param {?} argStyle
     * @param {...?} values
     * @return {?}
     */
    function debugCheckRenderNodeFn(view, nodeIndex, argStyle, ...values) {
        /** @type {?} */
        const nodeDef = view.def.nodes[nodeIndex];
        if (checkType === 0 /* CheckAndUpdate */) {
            debugCheckAndUpdateNode(view, nodeDef, argStyle, values);
        }
        else {
            debugCheckNoChangesNode(view, nodeDef, argStyle, values);
        }
        if (nodeDef.flags & 3 /* CatRenderNode */) {
            debugSetCurrentNode(view, nextRenderNodeWithBinding(view, nodeIndex));
        }
        return (nodeDef.flags & 224 /* CatPureExpression */) ?
            asPureExpressionData(view, nodeDef.nodeIndex).value :
            undefined;
    }
}
/**
 * @param {?} view
 * @param {?} nodeDef
 * @param {?} argStyle
 * @param {?} givenValues
 * @return {?}
 */
function debugCheckAndUpdateNode(view, nodeDef, argStyle, givenValues) {
    /** @type {?} */
    const changed = ((/** @type {?} */ (checkAndUpdateNode)))(view, nodeDef, argStyle, ...givenValues);
    if (changed) {
        /** @type {?} */
        const values = argStyle === 1 /* Dynamic */ ? givenValues[0] : givenValues;
        if (nodeDef.flags & 16384 /* TypeDirective */) {
            /** @type {?} */
            const bindingValues = {};
            for (let i = 0; i < nodeDef.bindings.length; i++) {
                /** @type {?} */
                const binding = nodeDef.bindings[i];
                /** @type {?} */
                const value = values[i];
                if (binding.flags & 8 /* TypeProperty */) {
                    bindingValues[normalizeDebugBindingName((/** @type {?} */ (binding.nonMinifiedName)))] =
                        normalizeDebugBindingValue(value);
                }
            }
            /** @type {?} */
            const elDef = (/** @type {?} */ (nodeDef.parent));
            /** @type {?} */
            const el = asElementData(view, elDef.nodeIndex).renderElement;
            if (!(/** @type {?} */ (elDef.element)).name) {
                // a comment.
                view.renderer.setValue(el, `bindings=${JSON.stringify(bindingValues, null, 2)}`);
            }
            else {
                // a regular element.
                for (let attr in bindingValues) {
                    /** @type {?} */
                    const value = bindingValues[attr];
                    if (value != null) {
                        view.renderer.setAttribute(el, attr, value);
                    }
                    else {
                        view.renderer.removeAttribute(el, attr);
                    }
                }
            }
        }
    }
}
/**
 * @param {?} view
 * @param {?} nodeDef
 * @param {?} argStyle
 * @param {?} values
 * @return {?}
 */
function debugCheckNoChangesNode(view, nodeDef, argStyle, values) {
    ((/** @type {?} */ (checkNoChangesNode)))(view, nodeDef, argStyle, ...values);
}
/**
 * @param {?} view
 * @param {?} nodeIndex
 * @return {?}
 */
function nextDirectiveWithBinding(view, nodeIndex) {
    for (let i = nodeIndex; i < view.def.nodes.length; i++) {
        /** @type {?} */
        const nodeDef = view.def.nodes[i];
        if (nodeDef.flags & 16384 /* TypeDirective */ && nodeDef.bindings && nodeDef.bindings.length) {
            return i;
        }
    }
    return null;
}
/**
 * @param {?} view
 * @param {?} nodeIndex
 * @return {?}
 */
function nextRenderNodeWithBinding(view, nodeIndex) {
    for (let i = nodeIndex; i < view.def.nodes.length; i++) {
        /** @type {?} */
        const nodeDef = view.def.nodes[i];
        if ((nodeDef.flags & 3 /* CatRenderNode */) && nodeDef.bindings && nodeDef.bindings.length) {
            return i;
        }
    }
    return null;
}
class DebugContext_ {
    /**
     * @param {?} view
     * @param {?} nodeIndex
     */
    constructor(view, nodeIndex) {
        this.view = view;
        this.nodeIndex = nodeIndex;
        if (nodeIndex == null) {
            this.nodeIndex = nodeIndex = 0;
        }
        this.nodeDef = view.def.nodes[nodeIndex];
        /** @type {?} */
        let elDef = this.nodeDef;
        /** @type {?} */
        let elView = view;
        while (elDef && (elDef.flags & 1 /* TypeElement */) === 0) {
            elDef = (/** @type {?} */ (elDef.parent));
        }
        if (!elDef) {
            while (!elDef && elView) {
                elDef = (/** @type {?} */ (viewParentEl(elView)));
                elView = (/** @type {?} */ (elView.parent));
            }
        }
        this.elDef = elDef;
        this.elView = elView;
    }
    /**
     * @private
     * @return {?}
     */
    get elOrCompView() {
        // Has to be done lazily as we use the DebugContext also during creation of elements...
        return asElementData(this.elView, this.elDef.nodeIndex).componentView || this.view;
    }
    /**
     * @return {?}
     */
    get injector() { return createInjector(this.elView, this.elDef); }
    /**
     * @return {?}
     */
    get component() { return this.elOrCompView.component; }
    /**
     * @return {?}
     */
    get context() { return this.elOrCompView.context; }
    /**
     * @return {?}
     */
    get providerTokens() {
        /** @type {?} */
        const tokens = [];
        if (this.elDef) {
            for (let i = this.elDef.nodeIndex + 1; i <= this.elDef.nodeIndex + this.elDef.childCount; i++) {
                /** @type {?} */
                const childDef = this.elView.def.nodes[i];
                if (childDef.flags & 20224 /* CatProvider */) {
                    tokens.push((/** @type {?} */ (childDef.provider)).token);
                }
                i += childDef.childCount;
            }
        }
        return tokens;
    }
    /**
     * @return {?}
     */
    get references() {
        /** @type {?} */
        const references = {};
        if (this.elDef) {
            collectReferences(this.elView, this.elDef, references);
            for (let i = this.elDef.nodeIndex + 1; i <= this.elDef.nodeIndex + this.elDef.childCount; i++) {
                /** @type {?} */
                const childDef = this.elView.def.nodes[i];
                if (childDef.flags & 20224 /* CatProvider */) {
                    collectReferences(this.elView, childDef, references);
                }
                i += childDef.childCount;
            }
        }
        return references;
    }
    /**
     * @return {?}
     */
    get componentRenderElement() {
        /** @type {?} */
        const elData = findHostElement(this.elOrCompView);
        return elData ? elData.renderElement : undefined;
    }
    /**
     * @return {?}
     */
    get renderNode() {
        return this.nodeDef.flags & 2 /* TypeText */ ? renderNode(this.view, this.nodeDef) :
            renderNode(this.elView, this.elDef);
    }
    /**
     * @param {?} console
     * @param {...?} values
     * @return {?}
     */
    logError(console, ...values) {
        /** @type {?} */
        let logViewDef;
        /** @type {?} */
        let logNodeIndex;
        if (this.nodeDef.flags & 2 /* TypeText */) {
            logViewDef = this.view.def;
            logNodeIndex = this.nodeDef.nodeIndex;
        }
        else {
            logViewDef = this.elView.def;
            logNodeIndex = this.elDef.nodeIndex;
        }
        // Note: we only generate a log function for text and element nodes
        // to make the generated code as small as possible.
        /** @type {?} */
        const renderNodeIndex = getRenderNodeIndex(logViewDef, logNodeIndex);
        /** @type {?} */
        let currRenderNodeIndex = -1;
        /** @type {?} */
        let nodeLogger = () => {
            currRenderNodeIndex++;
            if (currRenderNodeIndex === renderNodeIndex) {
                return console.error.bind(console, ...values);
            }
            else {
                return NOOP;
            }
        };
        (/** @type {?} */ (logViewDef.factory))(nodeLogger);
        if (currRenderNodeIndex < renderNodeIndex) {
            console.error('Illegal state: the ViewDefinitionFactory did not call the logger!');
            ((/** @type {?} */ (console.error)))(...values);
        }
    }
}
if (false) {
    /**
     * @type {?}
     * @private
     */
    DebugContext_.prototype.nodeDef;
    /**
     * @type {?}
     * @private
     */
    DebugContext_.prototype.elView;
    /**
     * @type {?}
     * @private
     */
    DebugContext_.prototype.elDef;
    /** @type {?} */
    DebugContext_.prototype.view;
    /** @type {?} */
    DebugContext_.prototype.nodeIndex;
}
/**
 * @param {?} viewDef
 * @param {?} nodeIndex
 * @return {?}
 */
function getRenderNodeIndex(viewDef, nodeIndex) {
    /** @type {?} */
    let renderNodeIndex = -1;
    for (let i = 0; i <= nodeIndex; i++) {
        /** @type {?} */
        const nodeDef = viewDef.nodes[i];
        if (nodeDef.flags & 3 /* CatRenderNode */) {
            renderNodeIndex++;
        }
    }
    return renderNodeIndex;
}
/**
 * @param {?} view
 * @return {?}
 */
function findHostElement(view) {
    while (view && !isComponentView(view)) {
        view = (/** @type {?} */ (view.parent));
    }
    if (view.parent) {
        return asElementData(view.parent, (/** @type {?} */ (viewParentEl(view))).nodeIndex);
    }
    return null;
}
/**
 * @param {?} view
 * @param {?} nodeDef
 * @param {?} references
 * @return {?}
 */
function collectReferences(view, nodeDef, references) {
    for (let refName in nodeDef.references) {
        references[refName] = getQueryValue(view, nodeDef, nodeDef.references[refName]);
    }
}
/**
 * @param {?} action
 * @param {?} fn
 * @param {?} self
 * @param {?} args
 * @return {?}
 */
function callWithDebugContext(action, fn, self, args) {
    /** @type {?} */
    const oldAction = _currentAction;
    /** @type {?} */
    const oldView = _currentView;
    /** @type {?} */
    const oldNodeIndex = _currentNodeIndex;
    try {
        _currentAction = action;
        /** @type {?} */
        const result = fn.apply(self, args);
        _currentView = oldView;
        _currentNodeIndex = oldNodeIndex;
        _currentAction = oldAction;
        return result;
    }
    catch (e) {
        if (isViewDebugError(e) || !_currentView) {
            throw e;
        }
        throw viewWrappedDebugError(e, (/** @type {?} */ (getCurrentDebugContext())));
    }
}
/**
 * @return {?}
 */
export function getCurrentDebugContext() {
    return _currentView ? new DebugContext_(_currentView, _currentNodeIndex) : null;
}
export class DebugRendererFactory2 {
    /**
     * @param {?} delegate
     */
    constructor(delegate) {
        this.delegate = delegate;
    }
    /**
     * @param {?} element
     * @param {?} renderData
     * @return {?}
     */
    createRenderer(element, renderData) {
        return new DebugRenderer2(this.delegate.createRenderer(element, renderData));
    }
    /**
     * @return {?}
     */
    begin() {
        if (this.delegate.begin) {
            this.delegate.begin();
        }
    }
    /**
     * @return {?}
     */
    end() {
        if (this.delegate.end) {
            this.delegate.end();
        }
    }
    /**
     * @return {?}
     */
    whenRenderingDone() {
        if (this.delegate.whenRenderingDone) {
            return this.delegate.whenRenderingDone();
        }
        return Promise.resolve(null);
    }
}
if (false) {
    /**
     * @type {?}
     * @private
     */
    DebugRendererFactory2.prototype.delegate;
}
export class DebugRenderer2 {
    /**
     * @param {?} delegate
     */
    constructor(delegate) {
        this.delegate = delegate;
        /**
         * Factory function used to create a `DebugContext` when a node is created.
         *
         * The `DebugContext` allows to retrieve information about the nodes that are useful in tests.
         *
         * The factory is configurable so that the `DebugRenderer2` could instantiate either a View Engine
         * or a Render context.
         */
        this.debugContextFactory = getCurrentDebugContext;
        this.data = this.delegate.data;
    }
    /**
     * @private
     * @param {?} nativeElement
     * @return {?}
     */
    createDebugContext(nativeElement) { return this.debugContextFactory(nativeElement); }
    /**
     * @param {?} node
     * @return {?}
     */
    destroyNode(node) {
        removeDebugNodeFromIndex((/** @type {?} */ (getDebugNode(node))));
        if (this.delegate.destroyNode) {
            this.delegate.destroyNode(node);
        }
    }
    /**
     * @return {?}
     */
    destroy() { this.delegate.destroy(); }
    /**
     * @param {?} name
     * @param {?=} namespace
     * @return {?}
     */
    createElement(name, namespace) {
        /** @type {?} */
        const el = this.delegate.createElement(name, namespace);
        /** @type {?} */
        const debugCtx = this.createDebugContext(el);
        if (debugCtx) {
            /** @type {?} */
            const debugEl = new DebugElement__PRE_R3__(el, null, debugCtx);
            ((/** @type {?} */ (debugEl))).name = name;
            indexDebugNode(debugEl);
        }
        return el;
    }
    /**
     * @param {?} value
     * @return {?}
     */
    createComment(value) {
        /** @type {?} */
        const comment = this.delegate.createComment(value);
        /** @type {?} */
        const debugCtx = this.createDebugContext(comment);
        if (debugCtx) {
            indexDebugNode(new DebugNode__PRE_R3__(comment, null, debugCtx));
        }
        return comment;
    }
    /**
     * @param {?} value
     * @return {?}
     */
    createText(value) {
        /** @type {?} */
        const text = this.delegate.createText(value);
        /** @type {?} */
        const debugCtx = this.createDebugContext(text);
        if (debugCtx) {
            indexDebugNode(new DebugNode__PRE_R3__(text, null, debugCtx));
        }
        return text;
    }
    /**
     * @param {?} parent
     * @param {?} newChild
     * @return {?}
     */
    appendChild(parent, newChild) {
        /** @type {?} */
        const debugEl = getDebugNode(parent);
        /** @type {?} */
        const debugChildEl = getDebugNode(newChild);
        if (debugEl && debugChildEl && debugEl instanceof DebugElement__PRE_R3__) {
            debugEl.addChild(debugChildEl);
        }
        this.delegate.appendChild(parent, newChild);
    }
    /**
     * @param {?} parent
     * @param {?} newChild
     * @param {?} refChild
     * @return {?}
     */
    insertBefore(parent, newChild, refChild) {
        /** @type {?} */
        const debugEl = getDebugNode(parent);
        /** @type {?} */
        const debugChildEl = getDebugNode(newChild);
        /** @type {?} */
        const debugRefEl = (/** @type {?} */ (getDebugNode(refChild)));
        if (debugEl && debugChildEl && debugEl instanceof DebugElement__PRE_R3__) {
            debugEl.insertBefore(debugRefEl, debugChildEl);
        }
        this.delegate.insertBefore(parent, newChild, refChild);
    }
    /**
     * @param {?} parent
     * @param {?} oldChild
     * @return {?}
     */
    removeChild(parent, oldChild) {
        /** @type {?} */
        const debugEl = getDebugNode(parent);
        /** @type {?} */
        const debugChildEl = getDebugNode(oldChild);
        if (debugEl && debugChildEl && debugEl instanceof DebugElement__PRE_R3__) {
            debugEl.removeChild(debugChildEl);
        }
        this.delegate.removeChild(parent, oldChild);
    }
    /**
     * @param {?} selectorOrNode
     * @param {?=} preserveContent
     * @return {?}
     */
    selectRootElement(selectorOrNode, preserveContent) {
        /** @type {?} */
        const el = this.delegate.selectRootElement(selectorOrNode, preserveContent);
        /** @type {?} */
        const debugCtx = getCurrentDebugContext();
        if (debugCtx) {
            indexDebugNode(new DebugElement__PRE_R3__(el, null, debugCtx));
        }
        return el;
    }
    /**
     * @param {?} el
     * @param {?} name
     * @param {?} value
     * @param {?=} namespace
     * @return {?}
     */
    setAttribute(el, name, value, namespace) {
        /** @type {?} */
        const debugEl = getDebugNode(el);
        if (debugEl && debugEl instanceof DebugElement__PRE_R3__) {
            /** @type {?} */
            const fullName = namespace ? namespace + ':' + name : name;
            debugEl.attributes[fullName] = value;
        }
        this.delegate.setAttribute(el, name, value, namespace);
    }
    /**
     * @param {?} el
     * @param {?} name
     * @param {?=} namespace
     * @return {?}
     */
    removeAttribute(el, name, namespace) {
        /** @type {?} */
        const debugEl = getDebugNode(el);
        if (debugEl && debugEl instanceof DebugElement__PRE_R3__) {
            /** @type {?} */
            const fullName = namespace ? namespace + ':' + name : name;
            debugEl.attributes[fullName] = null;
        }
        this.delegate.removeAttribute(el, name, namespace);
    }
    /**
     * @param {?} el
     * @param {?} name
     * @return {?}
     */
    addClass(el, name) {
        /** @type {?} */
        const debugEl = getDebugNode(el);
        if (debugEl && debugEl instanceof DebugElement__PRE_R3__) {
            debugEl.classes[name] = true;
        }
        this.delegate.addClass(el, name);
    }
    /**
     * @param {?} el
     * @param {?} name
     * @return {?}
     */
    removeClass(el, name) {
        /** @type {?} */
        const debugEl = getDebugNode(el);
        if (debugEl && debugEl instanceof DebugElement__PRE_R3__) {
            debugEl.classes[name] = false;
        }
        this.delegate.removeClass(el, name);
    }
    /**
     * @param {?} el
     * @param {?} style
     * @param {?} value
     * @param {?} flags
     * @return {?}
     */
    setStyle(el, style, value, flags) {
        /** @type {?} */
        const debugEl = getDebugNode(el);
        if (debugEl && debugEl instanceof DebugElement__PRE_R3__) {
            debugEl.styles[style] = value;
        }
        this.delegate.setStyle(el, style, value, flags);
    }
    /**
     * @param {?} el
     * @param {?} style
     * @param {?} flags
     * @return {?}
     */
    removeStyle(el, style, flags) {
        /** @type {?} */
        const debugEl = getDebugNode(el);
        if (debugEl && debugEl instanceof DebugElement__PRE_R3__) {
            debugEl.styles[style] = null;
        }
        this.delegate.removeStyle(el, style, flags);
    }
    /**
     * @param {?} el
     * @param {?} name
     * @param {?} value
     * @return {?}
     */
    setProperty(el, name, value) {
        /** @type {?} */
        const debugEl = getDebugNode(el);
        if (debugEl && debugEl instanceof DebugElement__PRE_R3__) {
            debugEl.properties[name] = value;
        }
        this.delegate.setProperty(el, name, value);
    }
    /**
     * @param {?} target
     * @param {?} eventName
     * @param {?} callback
     * @return {?}
     */
    listen(target, eventName, callback) {
        if (typeof target !== 'string') {
            /** @type {?} */
            const debugEl = getDebugNode(target);
            if (debugEl) {
                debugEl.listeners.push(new EventListener(eventName, callback));
            }
        }
        return this.delegate.listen(target, eventName, callback);
    }
    /**
     * @param {?} node
     * @return {?}
     */
    parentNode(node) { return this.delegate.parentNode(node); }
    /**
     * @param {?} node
     * @return {?}
     */
    nextSibling(node) { return this.delegate.nextSibling(node); }
    /**
     * @param {?} node
     * @param {?} value
     * @return {?}
     */
    setValue(node, value) { return this.delegate.setValue(node, value); }
}
if (false) {
    /** @type {?} */
    DebugRenderer2.prototype.data;
    /**
     * Factory function used to create a `DebugContext` when a node is created.
     *
     * The `DebugContext` allows to retrieve information about the nodes that are useful in tests.
     *
     * The factory is configurable so that the `DebugRenderer2` could instantiate either a View Engine
     * or a Render context.
     * @type {?}
     */
    DebugRenderer2.prototype.debugContextFactory;
    /**
     * @type {?}
     * @private
     */
    DebugRenderer2.prototype.delegate;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy92aWV3L3NlcnZpY2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBUUEsT0FBTyxFQUFDLHNCQUFzQixFQUFFLG1CQUFtQixFQUFFLGFBQWEsRUFBRSxZQUFZLEVBQUUsY0FBYyxFQUFFLHdCQUF3QixFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFFdkosT0FBTyxFQUFnQixnQkFBZ0IsRUFBQyxNQUFNLFlBQVksQ0FBQztBQUUzRCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFDOUMsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBR3pDLE9BQU8sRUFBWSxnQkFBZ0IsRUFBcUMsTUFBTSxlQUFlLENBQUM7QUFDOUYsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLDBCQUEwQixDQUFDO0FBRW5ELE9BQU8sRUFBQyx5QkFBeUIsRUFBRSwwQkFBMEIsRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBQ3pGLE9BQU8sRUFBQyxnQkFBZ0IsRUFBRSxrQkFBa0IsRUFBRSxxQkFBcUIsRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUNyRixPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sWUFBWSxDQUFDO0FBQ3RDLE9BQU8sRUFBQyxrQkFBa0IsRUFBRSxhQUFhLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFDMUQsT0FBTyxFQUFDLGNBQWMsRUFBRSxpQkFBaUIsRUFBRSxpQ0FBaUMsRUFBQyxNQUFNLFFBQVEsQ0FBQztBQUM1RixPQUFPLEVBQW1KLFFBQVEsRUFBdUMsYUFBYSxFQUFFLG9CQUFvQixFQUFDLE1BQU0sU0FBUyxDQUFDO0FBQzdQLE9BQU8sRUFBQyxJQUFJLEVBQUUsZUFBZSxFQUFFLFVBQVUsRUFBRSxpQkFBaUIsRUFBRSxZQUFZLEVBQUUsUUFBUSxFQUFFLFlBQVks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QUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLGFBQWEsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQzthQUNoRTtTQUNGO1FBRUQsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQzNELENBQUM7Ozs7O0lBRUQsVUFBVSxDQUFDLElBQVMsSUFBUyxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzs7Ozs7SUFDckUsV0FBVyxDQUFDLElBQVMsSUFBUyxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzs7Ozs7O0lBQ3ZFLFFBQVEsQ0FBQyxJQUFTLEVBQUUsS0FBYSxJQUFVLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUN6Rjs7O0lBdEtDLDhCQUFvQzs7Ozs7Ozs7OztJQVlwQyw2Q0FBMkY7Ozs7O0lBRS9FLGtDQUEyQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtEZWJ1Z0VsZW1lbnRfX1BSRV9SM19fLCBEZWJ1Z05vZGVfX1BSRV9SM19fLCBFdmVudExpc3RlbmVyLCBnZXREZWJ1Z05vZGUsIGluZGV4RGVidWdOb2RlLCByZW1vdmVEZWJ1Z05vZGVGcm9tSW5kZXh9IGZyb20gJy4uL2RlYnVnL2RlYnVnX25vZGUnO1xuaW1wb3J0IHtJbmplY3Rvcn0gZnJvbSAnLi4vZGknO1xuaW1wb3J0IHtJbmplY3RhYmxlRGVmLCBnZXRJbmplY3RhYmxlRGVmfSBmcm9tICcuLi9kaS9kZWZzJztcbmltcG9ydCB7SW5qZWN0YWJsZVR5cGV9IGZyb20gJy4uL2RpL2luamVjdGFibGUnO1xuaW1wb3J0IHtFcnJvckhhbmRsZXJ9IGZyb20gJy4uL2Vycm9yX2hhbmRsZXInO1xuaW1wb3J0IHtpc0Rldk1vZGV9IGZyb20gJy4uL2lzX2Rldl9tb2RlJztcbmltcG9ydCB7Q29tcG9uZW50RmFjdG9yeX0gZnJvbSAnLi4vbGlua2VyL2NvbXBvbmVudF9mYWN0b3J5JztcbmltcG9ydCB7TmdNb2R1bGVSZWZ9IGZyb20gJy4uL2xpbmtlci9uZ19tb2R1bGVfZmFjdG9yeSc7XG5pbXBvcnQge1JlbmRlcmVyMiwgUmVuZGVyZXJGYWN0b3J5MiwgUmVuZGVyZXJTdHlsZUZsYWdzMiwgUmVuZGVyZXJUeXBlMn0gZnJvbSAnLi4vcmVuZGVyL2FwaSc7XG5pbXBvcnQge1Nhbml0aXplcn0gZnJvbSAnLi4vc2FuaXRpemF0aW9uL3NlY3VyaXR5JztcbmltcG9ydCB7VHlwZX0gZnJvbSAnLi4vdHlwZSc7XG5pbXBvcnQge25vcm1hbGl6ZURlYnVnQmluZGluZ05hbWUsIG5vcm1hbGl6ZURlYnVnQmluZGluZ1ZhbHVlfSBmcm9tICcuLi91dGlsL25nX3JlZmxlY3QnO1xuaW1wb3J0IHtpc1ZpZXdEZWJ1Z0Vycm9yLCB2aWV3RGVzdHJveWVkRXJyb3IsIHZpZXdXcmFwcGVkRGVidWdFcnJvcn0gZnJvbSAnLi9lcnJvcnMnO1xuaW1wb3J0IHtyZXNvbHZlRGVwfSBmcm9tICcuL3Byb3ZpZGVyJztcbmltcG9ydCB7ZGlydHlQYXJlbnRRdWVyaWVzLCBnZXRRdWVyeVZhbHVlfSBmcm9tICcuL3F1ZXJ5JztcbmltcG9ydCB7Y3JlYXRlSW5qZWN0b3IsIGNyZWF0ZU5nTW9kdWxlUmVmLCBnZXRDb21wb25lbnRWaWV3RGVmaW5pdGlvbkZhY3Rvcnl9IGZyb20gJy4vcmVmcyc7XG5pbXBvcnQge0FyZ3VtZW50VHlwZSwgQmluZGluZ0ZsYWdzLCBDaGVja1R5cGUsIERlYnVnQ29udGV4dCwgRWxlbWVudERhdGEsIE5nTW9kdWxlRGVmaW5pdGlvbiwgTm9kZURlZiwgTm9kZUZsYWdzLCBOb2RlTG9nZ2VyLCBQcm92aWRlck92ZXJyaWRlLCBSb290RGF0YSwgU2VydmljZXMsIFZpZXdEYXRhLCBWaWV3RGVmaW5pdGlvbiwgVmlld1N0YXRlLCBhc0VsZW1lbnREYXRhLCBhc1B1cmVFeHByZXNzaW9uRGF0YX0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQge05PT1AsIGlzQ29tcG9uZW50VmlldywgcmVuZGVyTm9kZSwgcmVzb2x2ZURlZmluaXRpb24sIHNwbGl0RGVwc0RzbCwgdG9rZW5LZXksIHZpZXdQYXJlbnRFbH0gZnJvbSAnLi91dGlsJztcbmltcG9ydCB7Y2hlY2tBbmRVcGRhdGVOb2RlLCBjaGVja0FuZFVwZGF0ZVZpZXcsIGNoZWNrTm9DaGFuZ2VzTm9kZSwgY2hlY2tOb0NoYW5nZXNWaWV3LCBjcmVhdGVDb21wb25lbnRWaWV3LCBjcmVhdGVFbWJlZGRlZFZpZXcsIGNyZWF0ZVJvb3RWaWV3LCBkZXN0cm95Vmlld30gZnJvbSAnLi92aWV3JztcblxuXG5sZXQgaW5pdGlhbGl6ZWQgPSBmYWxzZTtcblxuZXhwb3J0IGZ1bmN0aW9uIGluaXRTZXJ2aWNlc0lmTmVlZGVkKCkge1xuICBpZiAoaW5pdGlhbGl6ZWQpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgaW5pdGlhbGl6ZWQgPSB0cnVlO1xuICBjb25zdCBzZXJ2aWNlcyA9IGlzRGV2TW9kZSgpID8gY3JlYXRlRGVidWdTZXJ2aWNlcygpIDogY3JlYXRlUHJvZFNlcnZpY2VzKCk7XG4gIFNlcnZpY2VzLnNldEN1cnJlbnROb2RlID0gc2VydmljZXMuc2V0Q3VycmVudE5vZGU7XG4gIFNlcnZpY2VzLmNyZWF0ZVJvb3RWaWV3ID0gc2VydmljZXMuY3JlYXRlUm9vdFZpZXc7XG4gIFNlcnZpY2VzLmNyZWF0ZUVtYmVkZGVkVmlldyA9IHNlcnZpY2VzLmNyZWF0ZUVtYmVkZGVkVmlldztcbiAgU2VydmljZXMuY3JlYXRlQ29tcG9uZW50VmlldyA9IHNlcnZpY2VzLmNyZWF0ZUNvbXBvbmVudFZpZXc7XG4gIFNlcnZpY2VzLmNyZWF0ZU5nTW9kdWxlUmVmID0gc2VydmljZXMuY3JlYXRlTmdNb2R1bGVSZWY7XG4gIFNlcnZpY2VzLm92ZXJyaWRlUHJvdmlkZXIgPSBzZXJ2aWNlcy5vdmVycmlkZVByb3ZpZGVyO1xuICBTZXJ2aWNlcy5vdmVycmlkZUNvbXBvbmVudFZpZXcgPSBzZXJ2aWNlcy5vdmVycmlkZUNvbXBvbmVudFZpZXc7XG4gIFNlcnZpY2VzLmNsZWFyT3ZlcnJpZGVzID0gc2VydmljZXMuY2xlYXJPdmVycmlkZXM7XG4gIFNlcnZpY2VzLmNoZWNrQW5kVXBkYXRlVmlldyA9IHNlcnZpY2VzLmNoZWNrQW5kVXBkYXRlVmlldztcbiAgU2VydmljZXMuY2hlY2tOb0NoYW5nZXNWaWV3ID0gc2VydmljZXMuY2hlY2tOb0NoYW5nZXNWaWV3O1xuICBTZXJ2aWNlcy5kZXN0cm95VmlldyA9IHNlcnZpY2VzLmRlc3Ryb3lWaWV3O1xuICBTZXJ2aWNlcy5yZXNvbHZlRGVwID0gcmVzb2x2ZURlcDtcbiAgU2VydmljZXMuY3JlYXRlRGVidWdDb250ZXh0ID0gc2VydmljZXMuY3JlYXRlRGVidWdDb250ZXh0O1xuICBTZXJ2aWNlcy5oYW5kbGVFdmVudCA9IHNlcnZpY2VzLmhhbmRsZUV2ZW50O1xuICBTZXJ2aWNlcy51cGRhdGVEaXJlY3RpdmVzID0gc2VydmljZXMudXBkYXRlRGlyZWN0aXZlcztcbiAgU2VydmljZXMudXBkYXRlUmVuZGVyZXIgPSBzZXJ2aWNlcy51cGRhdGVSZW5kZXJlcjtcbiAgU2VydmljZXMuZGlydHlQYXJlbnRRdWVyaWVzID0gZGlydHlQYXJlbnRRdWVyaWVzO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVQcm9kU2VydmljZXMoKSB7XG4gIHJldHVybiB7XG4gICAgc2V0Q3VycmVudE5vZGU6ICgpID0+IHt9LFxuICAgIGNyZWF0ZVJvb3RWaWV3OiBjcmVhdGVQcm9kUm9vdFZpZXcsXG4gICAgY3JlYXRlRW1iZWRkZWRWaWV3OiBjcmVhdGVFbWJlZGRlZFZpZXcsXG4gICAgY3JlYXRlQ29tcG9uZW50VmlldzogY3JlYXRlQ29tcG9uZW50VmlldyxcbiAgICBjcmVhdGVOZ01vZHVsZVJlZjogY3JlYXRlTmdNb2R1bGVSZWYsXG4gICAgb3ZlcnJpZGVQcm92aWRlcjogTk9PUCxcbiAgICBvdmVycmlkZUNvbXBvbmVudFZpZXc6IE5PT1AsXG4gICAgY2xlYXJPdmVycmlkZXM6IE5PT1AsXG4gICAgY2hlY2tBbmRVcGRhdGVWaWV3OiBjaGVja0FuZFVwZGF0ZVZpZXcsXG4gICAgY2hlY2tOb0NoYW5nZXNWaWV3OiBjaGVja05vQ2hhbmdlc1ZpZXcsXG4gICAgZGVzdHJveVZpZXc6IGRlc3Ryb3lWaWV3LFxuICAgIGNyZWF0ZURlYnVnQ29udGV4dDogKHZpZXc6IFZpZXdEYXRhLCBub2RlSW5kZXg6IG51bWJlcikgPT4gbmV3IERlYnVnQ29udGV4dF8odmlldywgbm9kZUluZGV4KSxcbiAgICBoYW5kbGVFdmVudDogKHZpZXc6IFZpZXdEYXRhLCBub2RlSW5kZXg6IG51bWJlciwgZXZlbnROYW1lOiBzdHJpbmcsIGV2ZW50OiBhbnkpID0+XG4gICAgICAgICAgICAgICAgICAgICB2aWV3LmRlZi5oYW5kbGVFdmVudCh2aWV3LCBub2RlSW5kZXgsIGV2ZW50TmFtZSwgZXZlbnQpLFxuICAgIHVwZGF0ZURpcmVjdGl2ZXM6ICh2aWV3OiBWaWV3RGF0YSwgY2hlY2tUeXBlOiBDaGVja1R5cGUpID0+IHZpZXcuZGVmLnVwZGF0ZURpcmVjdGl2ZXMoXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrVHlwZSA9PT0gQ2hlY2tUeXBlLkNoZWNrQW5kVXBkYXRlID8gcHJvZENoZWNrQW5kVXBkYXRlTm9kZSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvZENoZWNrTm9DaGFuZ2VzTm9kZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdmlldyksXG4gICAgdXBkYXRlUmVuZGVyZXI6ICh2aWV3OiBWaWV3RGF0YSwgY2hlY2tUeXBlOiBDaGVja1R5cGUpID0+IHZpZXcuZGVmLnVwZGF0ZVJlbmRlcmVyKFxuICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tUeXBlID09PSBDaGVja1R5cGUuQ2hlY2tBbmRVcGRhdGUgPyBwcm9kQ2hlY2tBbmRVcGRhdGVOb2RlIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvZENoZWNrTm9DaGFuZ2VzTm9kZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZpZXcpLFxuICB9O1xufVxuXG5mdW5jdGlvbiBjcmVhdGVEZWJ1Z1NlcnZpY2VzKCkge1xuICByZXR1cm4ge1xuICAgIHNldEN1cnJlbnROb2RlOiBkZWJ1Z1NldEN1cnJlbnROb2RlLFxuICAgIGNyZWF0ZVJvb3RWaWV3OiBkZWJ1Z0NyZWF0ZVJvb3RWaWV3LFxuICAgIGNyZWF0ZUVtYmVkZGVkVmlldzogZGVidWdDcmVhdGVFbWJlZGRlZFZpZXcsXG4gICAgY3JlYXRlQ29tcG9uZW50VmlldzogZGVidWdDcmVhdGVDb21wb25lbnRWaWV3LFxuICAgIGNyZWF0ZU5nTW9kdWxlUmVmOiBkZWJ1Z0NyZWF0ZU5nTW9kdWxlUmVmLFxuICAgIG92ZXJyaWRlUHJvdmlkZXI6IGRlYnVnT3ZlcnJpZGVQcm92aWRlcixcbiAgICBvdmVycmlkZUNvbXBvbmVudFZpZXc6IGRlYnVnT3ZlcnJpZGVDb21wb25lbnRWaWV3LFxuICAgIGNsZWFyT3ZlcnJpZGVzOiBkZWJ1Z0NsZWFyT3ZlcnJpZGVzLFxuICAgIGNoZWNrQW5kVXBkYXRlVmlldzogZGVidWdDaGVja0FuZFVwZGF0ZVZpZXcsXG4gICAgY2hlY2tOb0NoYW5nZXNWaWV3OiBkZWJ1Z0NoZWNrTm9DaGFuZ2VzVmlldyxcbiAgICBkZXN0cm95VmlldzogZGVidWdEZXN0cm95VmlldyxcbiAgICBjcmVhdGVEZWJ1Z0NvbnRleHQ6ICh2aWV3OiBWaWV3RGF0YSwgbm9kZUluZGV4OiBudW1iZXIpID0+IG5ldyBEZWJ1Z0NvbnRleHRfKHZpZXcsIG5vZGVJbmRleCksXG4gICAgaGFuZGxlRXZlbnQ6IGRlYnVnSGFuZGxlRXZlbnQsXG4gICAgdXBkYXRlRGlyZWN0aXZlczogZGVidWdVcGRhdGVEaXJlY3RpdmVzLFxuICAgIHVwZGF0ZVJlbmRlcmVyOiBkZWJ1Z1VwZGF0ZVJlbmRlcmVyLFxuICB9O1xufVxuXG5mdW5jdGlvbiBjcmVhdGVQcm9kUm9vdFZpZXcoXG4gICAgZWxJbmplY3RvcjogSW5qZWN0b3IsIHByb2plY3RhYmxlTm9kZXM6IGFueVtdW10sIHJvb3RTZWxlY3Rvck9yTm9kZTogc3RyaW5nIHwgYW55LFxuICAgIGRlZjogVmlld0RlZmluaXRpb24sIG5nTW9kdWxlOiBOZ01vZHVsZVJlZjxhbnk+LCBjb250ZXh0PzogYW55KTogVmlld0RhdGEge1xuICBjb25zdCByZW5kZXJlckZhY3Rvcnk6IFJlbmRlcmVyRmFjdG9yeTIgPSBuZ01vZHVsZS5pbmplY3Rvci5nZXQoUmVuZGVyZXJGYWN0b3J5Mik7XG4gIHJldHVybiBjcmVhdGVSb290VmlldyhcbiAgICAgIGNyZWF0ZVJvb3REYXRhKGVsSW5qZWN0b3IsIG5nTW9kdWxlLCByZW5kZXJlckZhY3RvcnksIHByb2plY3RhYmxlTm9kZXMsIHJvb3RTZWxlY3Rvck9yTm9kZSksXG4gICAgICBkZWYsIGNvbnRleHQpO1xufVxuXG5mdW5jdGlvbiBkZWJ1Z0NyZWF0ZVJvb3RWaWV3KFxuICAgIGVsSW5qZWN0b3I6IEluamVjdG9yLCBwcm9qZWN0YWJsZU5vZGVzOiBhbnlbXVtdLCByb290U2VsZWN0b3JPck5vZGU6IHN0cmluZyB8IGFueSxcbiAgICBkZWY6IFZpZXdEZWZpbml0aW9uLCBuZ01vZHVsZTogTmdNb2R1bGVSZWY8YW55PiwgY29udGV4dD86IGFueSk6IFZpZXdEYXRhIHtcbiAgY29uc3QgcmVuZGVyZXJGYWN0b3J5OiBSZW5kZXJlckZhY3RvcnkyID0gbmdNb2R1bGUuaW5qZWN0b3IuZ2V0KFJlbmRlcmVyRmFjdG9yeTIpO1xuICBjb25zdCByb290ID0gY3JlYXRlUm9vdERhdGEoXG4gICAgICBlbEluamVjdG9yLCBuZ01vZHVsZSwgbmV3IERlYnVnUmVuZGVyZXJGYWN0b3J5MihyZW5kZXJlckZhY3RvcnkpLCBwcm9qZWN0YWJsZU5vZGVzLFxuICAgICAgcm9vdFNlbGVjdG9yT3JOb2RlKTtcbiAgY29uc3QgZGVmV2l0aE92ZXJyaWRlID0gYXBwbHlQcm92aWRlck92ZXJyaWRlc1RvVmlldyhkZWYpO1xuICByZXR1cm4gY2FsbFdpdGhEZWJ1Z0NvbnRleHQoXG4gICAgICBEZWJ1Z0FjdGlvbi5jcmVhdGUsIGNyZWF0ZVJvb3RWaWV3LCBudWxsLCBbcm9vdCwgZGVmV2l0aE92ZXJyaWRlLCBjb250ZXh0XSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVJvb3REYXRhKFxuICAgIGVsSW5qZWN0b3I6IEluamVjdG9yLCBuZ01vZHVsZTogTmdNb2R1bGVSZWY8YW55PiwgcmVuZGVyZXJGYWN0b3J5OiBSZW5kZXJlckZhY3RvcnkyLFxuICAgIHByb2plY3RhYmxlTm9kZXM6IGFueVtdW10sIHJvb3RTZWxlY3Rvck9yTm9kZTogYW55KTogUm9vdERhdGEge1xuICBjb25zdCBzYW5pdGl6ZXIgPSBuZ01vZHVsZS5pbmplY3Rvci5nZXQoU2FuaXRpemVyKTtcbiAgY29uc3QgZXJyb3JIYW5kbGVyID0gbmdNb2R1bGUuaW5qZWN0b3IuZ2V0KEVycm9ySGFuZGxlcik7XG4gIGNvbnN0IHJlbmRlcmVyID0gcmVuZGVyZXJGYWN0b3J5LmNyZWF0ZVJlbmRlcmVyKG51bGwsIG51bGwpO1xuICByZXR1cm4ge1xuICAgIG5nTW9kdWxlLFxuICAgIGluamVjdG9yOiBlbEluamVjdG9yLCBwcm9qZWN0YWJsZU5vZGVzLFxuICAgIHNlbGVjdG9yT3JOb2RlOiByb290U2VsZWN0b3JPck5vZGUsIHNhbml0aXplciwgcmVuZGVyZXJGYWN0b3J5LCByZW5kZXJlciwgZXJyb3JIYW5kbGVyXG4gIH07XG59XG5cbmZ1bmN0aW9uIGRlYnVnQ3JlYXRlRW1iZWRkZWRWaWV3KFxuICAgIHBhcmVudFZpZXc6IFZpZXdEYXRhLCBhbmNob3JEZWY6IE5vZGVEZWYsIHZpZXdEZWY6IFZpZXdEZWZpbml0aW9uLCBjb250ZXh0PzogYW55KTogVmlld0RhdGEge1xuICBjb25zdCBkZWZXaXRoT3ZlcnJpZGUgPSBhcHBseVByb3ZpZGVyT3ZlcnJpZGVzVG9WaWV3KHZpZXdEZWYpO1xuICByZXR1cm4gY2FsbFdpdGhEZWJ1Z0NvbnRleHQoXG4gICAgICBEZWJ1Z0FjdGlvbi5jcmVhdGUsIGNyZWF0ZUVtYmVkZGVkVmlldywgbnVsbCxcbiAgICAgIFtwYXJlbnRWaWV3LCBhbmNob3JEZWYsIGRlZldpdGhPdmVycmlkZSwgY29udGV4dF0pO1xufVxuXG5mdW5jdGlvbiBkZWJ1Z0NyZWF0ZUNvbXBvbmVudFZpZXcoXG4gICAgcGFyZW50VmlldzogVmlld0RhdGEsIG5vZGVEZWY6IE5vZGVEZWYsIHZpZXdEZWY6IFZpZXdEZWZpbml0aW9uLCBob3N0RWxlbWVudDogYW55KTogVmlld0RhdGEge1xuICBjb25zdCBvdmVycmlkZUNvbXBvbmVudFZpZXcgPVxuICAgICAgdmlld0RlZk92ZXJyaWRlcy5nZXQobm9kZURlZi5lbGVtZW50ICEuY29tcG9uZW50UHJvdmlkZXIgIS5wcm92aWRlciAhLnRva2VuKTtcbiAgaWYgKG92ZXJyaWRlQ29tcG9uZW50Vmlldykge1xuICAgIHZpZXdEZWYgPSBvdmVycmlkZUNvbXBvbmVudFZpZXc7XG4gIH0gZWxzZSB7XG4gICAgdmlld0RlZiA9IGFwcGx5UHJvdmlkZXJPdmVycmlkZXNUb1ZpZXcodmlld0RlZik7XG4gIH1cbiAgcmV0dXJuIGNhbGxXaXRoRGVidWdDb250ZXh0KFxuICAgICAgRGVidWdBY3Rpb24uY3JlYXRlLCBjcmVhdGVDb21wb25lbnRWaWV3LCBudWxsLCBbcGFyZW50Vmlldywgbm9kZURlZiwgdmlld0RlZiwgaG9zdEVsZW1lbnRdKTtcbn1cblxuZnVuY3Rpb24gZGVidWdDcmVhdGVOZ01vZHVsZVJlZihcbiAgICBtb2R1bGVUeXBlOiBUeXBlPGFueT4sIHBhcmVudEluamVjdG9yOiBJbmplY3RvciwgYm9vdHN0cmFwQ29tcG9uZW50czogVHlwZTxhbnk+W10sXG4gICAgZGVmOiBOZ01vZHVsZURlZmluaXRpb24pOiBOZ01vZHVsZVJlZjxhbnk+IHtcbiAgY29uc3QgZGVmV2l0aE92ZXJyaWRlID0gYXBwbHlQcm92aWRlck92ZXJyaWRlc1RvTmdNb2R1bGUoZGVmKTtcbiAgcmV0dXJuIGNyZWF0ZU5nTW9kdWxlUmVmKG1vZHVsZVR5cGUsIHBhcmVudEluamVjdG9yLCBib290c3RyYXBDb21wb25lbnRzLCBkZWZXaXRoT3ZlcnJpZGUpO1xufVxuXG5jb25zdCBwcm92aWRlck92ZXJyaWRlcyA9IG5ldyBNYXA8YW55LCBQcm92aWRlck92ZXJyaWRlPigpO1xuY29uc3QgcHJvdmlkZXJPdmVycmlkZXNXaXRoU2NvcGUgPSBuZXcgTWFwPEluamVjdGFibGVUeXBlPGFueT4sIFByb3ZpZGVyT3ZlcnJpZGU+KCk7XG5jb25zdCB2aWV3RGVmT3ZlcnJpZGVzID0gbmV3IE1hcDxhbnksIFZpZXdEZWZpbml0aW9uPigpO1xuXG5mdW5jdGlvbiBkZWJ1Z092ZXJyaWRlUHJvdmlkZXIob3ZlcnJpZGU6IFByb3ZpZGVyT3ZlcnJpZGUpIHtcbiAgcHJvdmlkZXJPdmVycmlkZXMuc2V0KG92ZXJyaWRlLnRva2VuLCBvdmVycmlkZSk7XG4gIGxldCBpbmplY3RhYmxlRGVmOiBJbmplY3RhYmxlRGVmPGFueT58bnVsbDtcbiAgaWYgKHR5cGVvZiBvdmVycmlkZS50b2tlbiA9PT0gJ2Z1bmN0aW9uJyAmJiAoaW5qZWN0YWJsZURlZiA9IGdldEluamVjdGFibGVEZWYob3ZlcnJpZGUudG9rZW4pKSAmJlxuICAgICAgdHlwZW9mIGluamVjdGFibGVEZWYucHJvdmlkZWRJbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHByb3ZpZGVyT3ZlcnJpZGVzV2l0aFNjb3BlLnNldChvdmVycmlkZS50b2tlbiBhcyBJbmplY3RhYmxlVHlwZTxhbnk+LCBvdmVycmlkZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZGVidWdPdmVycmlkZUNvbXBvbmVudFZpZXcoY29tcDogYW55LCBjb21wRmFjdG9yeTogQ29tcG9uZW50RmFjdG9yeTxhbnk+KSB7XG4gIGNvbnN0IGhvc3RWaWV3RGVmID0gcmVzb2x2ZURlZmluaXRpb24oZ2V0Q29tcG9uZW50Vmlld0RlZmluaXRpb25GYWN0b3J5KGNvbXBGYWN0b3J5KSk7XG4gIGNvbnN0IGNvbXBWaWV3RGVmID0gcmVzb2x2ZURlZmluaXRpb24oaG9zdFZpZXdEZWYubm9kZXNbMF0uZWxlbWVudCAhLmNvbXBvbmVudFZpZXcgISk7XG4gIHZpZXdEZWZPdmVycmlkZXMuc2V0KGNvbXAsIGNvbXBWaWV3RGVmKTtcbn1cblxuZnVuY3Rpb24gZGVidWdDbGVhck92ZXJyaWRlcygpIHtcbiAgcHJvdmlkZXJPdmVycmlkZXMuY2xlYXIoKTtcbiAgcHJvdmlkZXJPdmVycmlkZXNXaXRoU2NvcGUuY2xlYXIoKTtcbiAgdmlld0RlZk92ZXJyaWRlcy5jbGVhcigpO1xufVxuXG4vLyBOb3RlcyBhYm91dCB0aGUgYWxnb3JpdGhtOlxuLy8gMSkgTG9jYXRlIHRoZSBwcm92aWRlcnMgb2YgYW4gZWxlbWVudCBhbmQgY2hlY2sgaWYgb25lIG9mIHRoZW0gd2FzIG92ZXJ3cml0dGVuXG4vLyAyKSBDaGFuZ2UgdGhlIHByb3ZpZGVycyBvZiB0aGF0IGVsZW1lbnRcbi8vXG4vLyBXZSBvbmx5IGNyZWF0ZSBuZXcgZGF0YXN0cnVjdHVyZXMgaWYgd2UgbmVlZCB0bywgdG8ga2VlcCBwZXJmIGltcGFjdFxuLy8gcmVhc29uYWJsZS5cbmZ1bmN0aW9uIGFwcGx5UHJvdmlkZXJPdmVycmlkZXNUb1ZpZXcoZGVmOiBWaWV3RGVmaW5pdGlvbik6IFZpZXdEZWZpbml0aW9uIHtcbiAgaWYgKHByb3ZpZGVyT3ZlcnJpZGVzLnNpemUgPT09IDApIHtcbiAgICByZXR1cm4gZGVmO1xuICB9XG4gIGNvbnN0IGVsZW1lbnRJbmRpY2VzV2l0aE92ZXJ3cml0dGVuUHJvdmlkZXJzID0gZmluZEVsZW1lbnRJbmRpY2VzV2l0aE92ZXJ3cml0dGVuUHJvdmlkZXJzKGRlZik7XG4gIGlmIChlbGVtZW50SW5kaWNlc1dpdGhPdmVyd3JpdHRlblByb3ZpZGVycy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gZGVmO1xuICB9XG4gIC8vIGNsb25lIHRoZSB3aG9sZSB2aWV3IGRlZmluaXRpb24sXG4gIC8vIGFzIGl0IG1haW50YWlucyByZWZlcmVuY2VzIGJldHdlZW4gdGhlIG5vZGVzIHRoYXQgYXJlIGhhcmQgdG8gdXBkYXRlLlxuICBkZWYgPSBkZWYuZmFjdG9yeSAhKCgpID0+IE5PT1ApO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGVsZW1lbnRJbmRpY2VzV2l0aE92ZXJ3cml0dGVuUHJvdmlkZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgYXBwbHlQcm92aWRlck92ZXJyaWRlc1RvRWxlbWVudChkZWYsIGVsZW1lbnRJbmRpY2VzV2l0aE92ZXJ3cml0dGVuUHJvdmlkZXJzW2ldKTtcbiAgfVxuICByZXR1cm4gZGVmO1xuXG4gIGZ1bmN0aW9uIGZpbmRFbGVtZW50SW5kaWNlc1dpdGhPdmVyd3JpdHRlblByb3ZpZGVycyhkZWY6IFZpZXdEZWZpbml0aW9uKTogbnVtYmVyW10ge1xuICAgIGNvbnN0IGVsSW5kaWNlc1dpdGhPdmVyd3JpdHRlblByb3ZpZGVyczogbnVtYmVyW10gPSBbXTtcbiAgICBsZXQgbGFzdEVsZW1lbnREZWY6IE5vZGVEZWZ8bnVsbCA9IG51bGw7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkZWYubm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IG5vZGVEZWYgPSBkZWYubm9kZXNbaV07XG4gICAgICBpZiAobm9kZURlZi5mbGFncyAmIE5vZGVGbGFncy5UeXBlRWxlbWVudCkge1xuICAgICAgICBsYXN0RWxlbWVudERlZiA9IG5vZGVEZWY7XG4gICAgICB9XG4gICAgICBpZiAobGFzdEVsZW1lbnREZWYgJiYgbm9kZURlZi5mbGFncyAmIE5vZGVGbGFncy5DYXRQcm92aWRlck5vRGlyZWN0aXZlICYmXG4gICAgICAgICAgcHJvdmlkZXJPdmVycmlkZXMuaGFzKG5vZGVEZWYucHJvdmlkZXIgIS50b2tlbikpIHtcbiAgICAgICAgZWxJbmRpY2VzV2l0aE92ZXJ3cml0dGVuUHJvdmlkZXJzLnB1c2gobGFzdEVsZW1lbnREZWYgIS5ub2RlSW5kZXgpO1xuICAgICAgICBsYXN0RWxlbWVudERlZiA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBlbEluZGljZXNXaXRoT3ZlcndyaXR0ZW5Qcm92aWRlcnM7XG4gIH1cblxuICBmdW5jdGlvbiBhcHBseVByb3ZpZGVyT3ZlcnJpZGVzVG9FbGVtZW50KHZpZXdEZWY6IFZpZXdEZWZpbml0aW9uLCBlbEluZGV4OiBudW1iZXIpIHtcbiAgICBmb3IgKGxldCBpID0gZWxJbmRleCArIDE7IGkgPCB2aWV3RGVmLm5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBub2RlRGVmID0gdmlld0RlZi5ub2Rlc1tpXTtcbiAgICAgIGlmIChub2RlRGVmLmZsYWdzICYgTm9kZUZsYWdzLlR5cGVFbGVtZW50KSB7XG4gICAgICAgIC8vIHN0b3AgYXQgdGhlIG5leHQgZWxlbWVudFxuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAobm9kZURlZi5mbGFncyAmIE5vZGVGbGFncy5DYXRQcm92aWRlck5vRGlyZWN0aXZlKSB7XG4gICAgICAgIGNvbnN0IHByb3ZpZGVyID0gbm9kZURlZi5wcm92aWRlciAhO1xuICAgICAgICBjb25zdCBvdmVycmlkZSA9IHByb3ZpZGVyT3ZlcnJpZGVzLmdldChwcm92aWRlci50b2tlbik7XG4gICAgICAgIGlmIChvdmVycmlkZSkge1xuICAgICAgICAgIG5vZGVEZWYuZmxhZ3MgPSAobm9kZURlZi5mbGFncyAmIH5Ob2RlRmxhZ3MuQ2F0UHJvdmlkZXJOb0RpcmVjdGl2ZSkgfCBvdmVycmlkZS5mbGFncztcbiAgICAgICAgICBwcm92aWRlci5kZXBzID0gc3BsaXREZXBzRHNsKG92ZXJyaWRlLmRlcHMpO1xuICAgICAgICAgIHByb3ZpZGVyLnZhbHVlID0gb3ZlcnJpZGUudmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLy8gTm90ZXMgYWJvdXQgdGhlIGFsZ29yaXRobTpcbi8vIFdlIG9ubHkgY3JlYXRlIG5ldyBkYXRhc3RydWN0dXJlcyBpZiB3ZSBuZWVkIHRvLCB0byBrZWVwIHBlcmYgaW1wYWN0XG4vLyByZWFzb25hYmxlLlxuZnVuY3Rpb24gYXBwbHlQcm92aWRlck92ZXJyaWRlc1RvTmdNb2R1bGUoZGVmOiBOZ01vZHVsZURlZmluaXRpb24pOiBOZ01vZHVsZURlZmluaXRpb24ge1xuICBjb25zdCB7aGFzT3ZlcnJpZGVzLCBoYXNEZXByZWNhdGVkT3ZlcnJpZGVzfSA9IGNhbGNIYXNPdmVycmlkZXMoZGVmKTtcbiAgaWYgKCFoYXNPdmVycmlkZXMpIHtcbiAgICByZXR1cm4gZGVmO1xuICB9XG4gIC8vIGNsb25lIHRoZSB3aG9sZSB2aWV3IGRlZmluaXRpb24sXG4gIC8vIGFzIGl0IG1haW50YWlucyByZWZlcmVuY2VzIGJldHdlZW4gdGhlIG5vZGVzIHRoYXQgYXJlIGhhcmQgdG8gdXBkYXRlLlxuICBkZWYgPSBkZWYuZmFjdG9yeSAhKCgpID0+IE5PT1ApO1xuICBhcHBseVByb3ZpZGVyT3ZlcnJpZGVzKGRlZik7XG4gIHJldHVybiBkZWY7XG5cbiAgZnVuY3Rpb24gY2FsY0hhc092ZXJyaWRlcyhkZWY6IE5nTW9kdWxlRGVmaW5pdGlvbik6XG4gICAgICB7aGFzT3ZlcnJpZGVzOiBib29sZWFuLCBoYXNEZXByZWNhdGVkT3ZlcnJpZGVzOiBib29sZWFufSB7XG4gICAgbGV0IGhhc092ZXJyaWRlcyA9IGZhbHNlO1xuICAgIGxldCBoYXNEZXByZWNhdGVkT3ZlcnJpZGVzID0gZmFsc2U7XG4gICAgaWYgKHByb3ZpZGVyT3ZlcnJpZGVzLnNpemUgPT09IDApIHtcbiAgICAgIHJldHVybiB7aGFzT3ZlcnJpZGVzLCBoYXNEZXByZWNhdGVkT3ZlcnJpZGVzfTtcbiAgICB9XG4gICAgZGVmLnByb3ZpZGVycy5mb3JFYWNoKG5vZGUgPT4ge1xuICAgICAgY29uc3Qgb3ZlcnJpZGUgPSBwcm92aWRlck92ZXJyaWRlcy5nZXQobm9kZS50b2tlbik7XG4gICAgICBpZiAoKG5vZGUuZmxhZ3MgJiBOb2RlRmxhZ3MuQ2F0UHJvdmlkZXJOb0RpcmVjdGl2ZSkgJiYgb3ZlcnJpZGUpIHtcbiAgICAgICAgaGFzT3ZlcnJpZGVzID0gdHJ1ZTtcbiAgICAgICAgaGFzRGVwcmVjYXRlZE92ZXJyaWRlcyA9IGhhc0RlcHJlY2F0ZWRPdmVycmlkZXMgfHwgb3ZlcnJpZGUuZGVwcmVjYXRlZEJlaGF2aW9yO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGRlZi5tb2R1bGVzLmZvckVhY2gobW9kdWxlID0+IHtcbiAgICAgIHByb3ZpZGVyT3ZlcnJpZGVzV2l0aFNjb3BlLmZvckVhY2goKG92ZXJyaWRlLCB0b2tlbikgPT4ge1xuICAgICAgICBpZiAoZ2V0SW5qZWN0YWJsZURlZih0b2tlbikgIS5wcm92aWRlZEluID09PSBtb2R1bGUpIHtcbiAgICAgICAgICBoYXNPdmVycmlkZXMgPSB0cnVlO1xuICAgICAgICAgIGhhc0RlcHJlY2F0ZWRPdmVycmlkZXMgPSBoYXNEZXByZWNhdGVkT3ZlcnJpZGVzIHx8IG92ZXJyaWRlLmRlcHJlY2F0ZWRCZWhhdmlvcjtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHtoYXNPdmVycmlkZXMsIGhhc0RlcHJlY2F0ZWRPdmVycmlkZXN9O1xuICB9XG5cbiAgZnVuY3Rpb24gYXBwbHlQcm92aWRlck92ZXJyaWRlcyhkZWY6IE5nTW9kdWxlRGVmaW5pdGlvbikge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZGVmLnByb3ZpZGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgcHJvdmlkZXIgPSBkZWYucHJvdmlkZXJzW2ldO1xuICAgICAgaWYgKGhhc0RlcHJlY2F0ZWRPdmVycmlkZXMpIHtcbiAgICAgICAgLy8gV2UgaGFkIGEgYnVnIHdoZXJlIG1lIG1hZGVcbiAgICAgICAgLy8gYWxsIHByb3ZpZGVycyBsYXp5LiBLZWVwIHRoaXMgbG9naWMgYmVoaW5kIGEgZmxhZ1xuICAgICAgICAvLyBmb3IgbWlncmF0aW5nIGV4aXN0aW5nIHVzZXJzLlxuICAgICAgICBwcm92aWRlci5mbGFncyB8PSBOb2RlRmxhZ3MuTGF6eVByb3ZpZGVyO1xuICAgICAgfVxuICAgICAgY29uc3Qgb3ZlcnJpZGUgPSBwcm92aWRlck92ZXJyaWRlcy5nZXQocHJvdmlkZXIudG9rZW4pO1xuICAgICAgaWYgKG92ZXJyaWRlKSB7XG4gICAgICAgIHByb3ZpZGVyLmZsYWdzID0gKHByb3ZpZGVyLmZsYWdzICYgfk5vZGVGbGFncy5DYXRQcm92aWRlck5vRGlyZWN0aXZlKSB8IG92ZXJyaWRlLmZsYWdzO1xuICAgICAgICBwcm92aWRlci5kZXBzID0gc3BsaXREZXBzRHNsKG92ZXJyaWRlLmRlcHMpO1xuICAgICAgICBwcm92aWRlci52YWx1ZSA9IG92ZXJyaWRlLnZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAocHJvdmlkZXJPdmVycmlkZXNXaXRoU2NvcGUuc2l6ZSA+IDApIHtcbiAgICAgIGxldCBtb2R1bGVTZXQgPSBuZXcgU2V0PGFueT4oZGVmLm1vZHVsZXMpO1xuICAgICAgcHJvdmlkZXJPdmVycmlkZXNXaXRoU2NvcGUuZm9yRWFjaCgob3ZlcnJpZGUsIHRva2VuKSA9PiB7XG4gICAgICAgIGlmIChtb2R1bGVTZXQuaGFzKGdldEluamVjdGFibGVEZWYodG9rZW4pICEucHJvdmlkZWRJbikpIHtcbiAgICAgICAgICBsZXQgcHJvdmlkZXIgPSB7XG4gICAgICAgICAgICB0b2tlbjogdG9rZW4sXG4gICAgICAgICAgICBmbGFnczpcbiAgICAgICAgICAgICAgICBvdmVycmlkZS5mbGFncyB8IChoYXNEZXByZWNhdGVkT3ZlcnJpZGVzID8gTm9kZUZsYWdzLkxhenlQcm92aWRlciA6IE5vZGVGbGFncy5Ob25lKSxcbiAgICAgICAgICAgIGRlcHM6IHNwbGl0RGVwc0RzbChvdmVycmlkZS5kZXBzKSxcbiAgICAgICAgICAgIHZhbHVlOiBvdmVycmlkZS52YWx1ZSxcbiAgICAgICAgICAgIGluZGV4OiBkZWYucHJvdmlkZXJzLmxlbmd0aCxcbiAgICAgICAgICB9O1xuICAgICAgICAgIGRlZi5wcm92aWRlcnMucHVzaChwcm92aWRlcik7XG4gICAgICAgICAgZGVmLnByb3ZpZGVyc0J5S2V5W3Rva2VuS2V5KHRva2VuKV0gPSBwcm92aWRlcjtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHByb2RDaGVja0FuZFVwZGF0ZU5vZGUoXG4gICAgdmlldzogVmlld0RhdGEsIGNoZWNrSW5kZXg6IG51bWJlciwgYXJnU3R5bGU6IEFyZ3VtZW50VHlwZSwgdjA/OiBhbnksIHYxPzogYW55LCB2Mj86IGFueSxcbiAgICB2Mz86IGFueSwgdjQ/OiBhbnksIHY1PzogYW55LCB2Nj86IGFueSwgdjc/OiBhbnksIHY4PzogYW55LCB2OT86IGFueSk6IGFueSB7XG4gIGNvbnN0IG5vZGVEZWYgPSB2aWV3LmRlZi5ub2Rlc1tjaGVja0luZGV4XTtcbiAgY2hlY2tBbmRVcGRhdGVOb2RlKHZpZXcsIG5vZGVEZWYsIGFyZ1N0eWxlLCB2MCwgdjEsIHYyLCB2MywgdjQsIHY1LCB2NiwgdjcsIHY4LCB2OSk7XG4gIHJldHVybiAobm9kZURlZi5mbGFncyAmIE5vZGVGbGFncy5DYXRQdXJlRXhwcmVzc2lvbikgP1xuICAgICAgYXNQdXJlRXhwcmVzc2lvbkRhdGEodmlldywgY2hlY2tJbmRleCkudmFsdWUgOlxuICAgICAgdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiBwcm9kQ2hlY2tOb0NoYW5nZXNOb2RlKFxuICAgIHZpZXc6IFZpZXdEYXRhLCBjaGVja0luZGV4OiBudW1iZXIsIGFyZ1N0eWxlOiBBcmd1bWVudFR5cGUsIHYwPzogYW55LCB2MT86IGFueSwgdjI/OiBhbnksXG4gICAgdjM/OiBhbnksIHY0PzogYW55LCB2NT86IGFueSwgdjY/OiBhbnksIHY3PzogYW55LCB2OD86IGFueSwgdjk/OiBhbnkpOiBhbnkge1xuICBjb25zdCBub2RlRGVmID0gdmlldy5kZWYubm9kZXNbY2hlY2tJbmRleF07XG4gIGNoZWNrTm9DaGFuZ2VzTm9kZSh2aWV3LCBub2RlRGVmLCBhcmdTdHlsZSwgdjAsIHYxLCB2MiwgdjMsIHY0LCB2NSwgdjYsIHY3LCB2OCwgdjkpO1xuICByZXR1cm4gKG5vZGVEZWYuZmxhZ3MgJiBOb2RlRmxhZ3MuQ2F0UHVyZUV4cHJlc3Npb24pID9cbiAgICAgIGFzUHVyZUV4cHJlc3Npb25EYXRhKHZpZXcsIGNoZWNrSW5kZXgpLnZhbHVlIDpcbiAgICAgIHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gZGVidWdDaGVja0FuZFVwZGF0ZVZpZXcodmlldzogVmlld0RhdGEpIHtcbiAgcmV0dXJuIGNhbGxXaXRoRGVidWdDb250ZXh0KERlYnVnQWN0aW9uLmRldGVjdENoYW5nZXMsIGNoZWNrQW5kVXBkYXRlVmlldywgbnVsbCwgW3ZpZXddKTtcbn1cblxuZnVuY3Rpb24gZGVidWdDaGVja05vQ2hhbmdlc1ZpZXcodmlldzogVmlld0RhdGEpIHtcbiAgcmV0dXJuIGNhbGxXaXRoRGVidWdDb250ZXh0KERlYnVnQWN0aW9uLmNoZWNrTm9DaGFuZ2VzLCBjaGVja05vQ2hhbmdlc1ZpZXcsIG51bGwsIFt2aWV3XSk7XG59XG5cbmZ1bmN0aW9uIGRlYnVnRGVzdHJveVZpZXcodmlldzogVmlld0RhdGEpIHtcbiAgcmV0dXJuIGNhbGxXaXRoRGVidWdDb250ZXh0KERlYnVnQWN0aW9uLmRlc3Ryb3ksIGRlc3Ryb3lWaWV3LCBudWxsLCBbdmlld10pO1xufVxuXG5lbnVtIERlYnVnQWN0aW9uIHtcbiAgY3JlYXRlLFxuICBkZXRlY3RDaGFuZ2VzLFxuICBjaGVja05vQ2hhbmdlcyxcbiAgZGVzdHJveSxcbiAgaGFuZGxlRXZlbnRcbn1cblxubGV0IF9jdXJyZW50QWN0aW9uOiBEZWJ1Z0FjdGlvbjtcbmxldCBfY3VycmVudFZpZXc6IFZpZXdEYXRhO1xubGV0IF9jdXJyZW50Tm9kZUluZGV4OiBudW1iZXJ8bnVsbDtcblxuZnVuY3Rpb24gZGVidWdTZXRDdXJyZW50Tm9kZSh2aWV3OiBWaWV3RGF0YSwgbm9kZUluZGV4OiBudW1iZXIgfCBudWxsKSB7XG4gIF9jdXJyZW50VmlldyA9IHZpZXc7XG4gIF9jdXJyZW50Tm9kZUluZGV4ID0gbm9kZUluZGV4O1xufVxuXG5mdW5jdGlvbiBkZWJ1Z0hhbmRsZUV2ZW50KHZpZXc6IFZpZXdEYXRhLCBub2RlSW5kZXg6IG51bWJlciwgZXZlbnROYW1lOiBzdHJpbmcsIGV2ZW50OiBhbnkpIHtcbiAgZGVidWdTZXRDdXJyZW50Tm9kZSh2aWV3LCBub2RlSW5kZXgpO1xuICByZXR1cm4gY2FsbFdpdGhEZWJ1Z0NvbnRleHQoXG4gICAgICBEZWJ1Z0FjdGlvbi5oYW5kbGVFdmVudCwgdmlldy5kZWYuaGFuZGxlRXZlbnQsIG51bGwsIFt2aWV3LCBub2RlSW5kZXgsIGV2ZW50TmFtZSwgZXZlbnRdKTtcbn1cblxuZnVuY3Rpb24gZGVidWdVcGRhdGVEaXJlY3RpdmVzKHZpZXc6IFZpZXdEYXRhLCBjaGVja1R5cGU6IENoZWNrVHlwZSkge1xuICBpZiAodmlldy5zdGF0ZSAmIFZpZXdTdGF0ZS5EZXN0cm95ZWQpIHtcbiAgICB0aHJvdyB2aWV3RGVzdHJveWVkRXJyb3IoRGVidWdBY3Rpb25bX2N1cnJlbnRBY3Rpb25dKTtcbiAgfVxuICBkZWJ1Z1NldEN1cnJlbnROb2RlKHZpZXcsIG5leHREaXJlY3RpdmVXaXRoQmluZGluZyh2aWV3LCAwKSk7XG4gIHJldHVybiB2aWV3LmRlZi51cGRhdGVEaXJlY3RpdmVzKGRlYnVnQ2hlY2tEaXJlY3RpdmVzRm4sIHZpZXcpO1xuXG4gIGZ1bmN0aW9uIGRlYnVnQ2hlY2tEaXJlY3RpdmVzRm4oXG4gICAgICB2aWV3OiBWaWV3RGF0YSwgbm9kZUluZGV4OiBudW1iZXIsIGFyZ1N0eWxlOiBBcmd1bWVudFR5cGUsIC4uLnZhbHVlczogYW55W10pIHtcbiAgICBjb25zdCBub2RlRGVmID0gdmlldy5kZWYubm9kZXNbbm9kZUluZGV4XTtcbiAgICBpZiAoY2hlY2tUeXBlID09PSBDaGVja1R5cGUuQ2hlY2tBbmRVcGRhdGUpIHtcbiAgICAgIGRlYnVnQ2hlY2tBbmRVcGRhdGVOb2RlKHZpZXcsIG5vZGVEZWYsIGFyZ1N0eWxlLCB2YWx1ZXMpO1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWJ1Z0NoZWNrTm9DaGFuZ2VzTm9kZSh2aWV3LCBub2RlRGVmLCBhcmdTdHlsZSwgdmFsdWVzKTtcbiAgICB9XG4gICAgaWYgKG5vZGVEZWYuZmxhZ3MgJiBOb2RlRmxhZ3MuVHlwZURpcmVjdGl2ZSkge1xuICAgICAgZGVidWdTZXRDdXJyZW50Tm9kZSh2aWV3LCBuZXh0RGlyZWN0aXZlV2l0aEJpbmRpbmcodmlldywgbm9kZUluZGV4KSk7XG4gICAgfVxuICAgIHJldHVybiAobm9kZURlZi5mbGFncyAmIE5vZGVGbGFncy5DYXRQdXJlRXhwcmVzc2lvbikgP1xuICAgICAgICBhc1B1cmVFeHByZXNzaW9uRGF0YSh2aWV3LCBub2RlRGVmLm5vZGVJbmRleCkudmFsdWUgOlxuICAgICAgICB1bmRlZmluZWQ7XG4gIH1cbn1cblxuZnVuY3Rpb24gZGVidWdVcGRhdGVSZW5kZXJlcih2aWV3OiBWaWV3RGF0YSwgY2hlY2tUeXBlOiBDaGVja1R5cGUpIHtcbiAgaWYgKHZpZXcuc3RhdGUgJiBWaWV3U3RhdGUuRGVzdHJveWVkKSB7XG4gICAgdGhyb3cgdmlld0Rlc3Ryb3llZEVycm9yKERlYnVnQWN0aW9uW19jdXJyZW50QWN0aW9uXSk7XG4gIH1cbiAgZGVidWdTZXRDdXJyZW50Tm9kZSh2aWV3LCBuZXh0UmVuZGVyTm9kZVdpdGhCaW5kaW5nKHZpZXcsIDApKTtcbiAgcmV0dXJuIHZpZXcuZGVmLnVwZGF0ZVJlbmRlcmVyKGRlYnVnQ2hlY2tSZW5kZXJOb2RlRm4sIHZpZXcpO1xuXG4gIGZ1bmN0aW9uIGRlYnVnQ2hlY2tSZW5kZXJOb2RlRm4oXG4gICAgICB2aWV3OiBWaWV3RGF0YSwgbm9kZUluZGV4OiBudW1iZXIsIGFyZ1N0eWxlOiBBcmd1bWVudFR5cGUsIC4uLnZhbHVlczogYW55W10pIHtcbiAgICBjb25zdCBub2RlRGVmID0gdmlldy5kZWYubm9kZXNbbm9kZUluZGV4XTtcbiAgICBpZiAoY2hlY2tUeXBlID09PSBDaGVja1R5cGUuQ2hlY2tBbmRVcGRhdGUpIHtcbiAgICAgIGRlYnVnQ2hlY2tBbmRVcGRhdGVOb2RlKHZpZXcsIG5vZGVEZWYsIGFyZ1N0eWxlLCB2YWx1ZXMpO1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWJ1Z0NoZWNrTm9DaGFuZ2VzTm9kZSh2aWV3LCBub2RlRGVmLCBhcmdTdHlsZSwgdmFsdWVzKTtcbiAgICB9XG4gICAgaWYgKG5vZGVEZWYuZmxhZ3MgJiBOb2RlRmxhZ3MuQ2F0UmVuZGVyTm9kZSkge1xuICAgICAgZGVidWdTZXRDdXJyZW50Tm9kZSh2aWV3LCBuZXh0UmVuZGVyTm9kZVdpdGhCaW5kaW5nKHZpZXcsIG5vZGVJbmRleCkpO1xuICAgIH1cbiAgICByZXR1cm4gKG5vZGVEZWYuZmxhZ3MgJiBOb2RlRmxhZ3MuQ2F0UHVyZUV4cHJlc3Npb24pID9cbiAgICAgICAgYXNQdXJlRXhwcmVzc2lvbkRhdGEodmlldywgbm9kZURlZi5ub2RlSW5kZXgpLnZhbHVlIDpcbiAgICAgICAgdW5kZWZpbmVkO1xuICB9XG59XG5cbmZ1bmN0aW9uIGRlYnVnQ2hlY2tBbmRVcGRhdGVOb2RlKFxuICAgIHZpZXc6IFZpZXdEYXRhLCBub2RlRGVmOiBOb2RlRGVmLCBhcmdTdHlsZTogQXJndW1lbnRUeXBlLCBnaXZlblZhbHVlczogYW55W10pOiB2b2lkIHtcbiAgY29uc3QgY2hhbmdlZCA9ICg8YW55PmNoZWNrQW5kVXBkYXRlTm9kZSkodmlldywgbm9kZURlZiwgYXJnU3R5bGUsIC4uLmdpdmVuVmFsdWVzKTtcbiAgaWYgKGNoYW5nZWQpIHtcbiAgICBjb25zdCB2YWx1ZXMgPSBhcmdTdHlsZSA9PT0gQXJndW1lbnRUeXBlLkR5bmFtaWMgPyBnaXZlblZhbHVlc1swXSA6IGdpdmVuVmFsdWVzO1xuICAgIGlmIChub2RlRGVmLmZsYWdzICYgTm9kZUZsYWdzLlR5cGVEaXJlY3RpdmUpIHtcbiAgICAgIGNvbnN0IGJpbmRpbmdWYWx1ZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5vZGVEZWYuYmluZGluZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgYmluZGluZyA9IG5vZGVEZWYuYmluZGluZ3NbaV07XG4gICAgICAgIGNvbnN0IHZhbHVlID0gdmFsdWVzW2ldO1xuICAgICAgICBpZiAoYmluZGluZy5mbGFncyAmIEJpbmRpbmdGbGFncy5UeXBlUHJvcGVydHkpIHtcbiAgICAgICAgICBiaW5kaW5nVmFsdWVzW25vcm1hbGl6ZURlYnVnQmluZGluZ05hbWUoYmluZGluZy5ub25NaW5pZmllZE5hbWUgISldID1cbiAgICAgICAgICAgICAgbm9ybWFsaXplRGVidWdCaW5kaW5nVmFsdWUodmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBjb25zdCBlbERlZiA9IG5vZGVEZWYucGFyZW50ICE7XG4gICAgICBjb25zdCBlbCA9IGFzRWxlbWVudERhdGEodmlldywgZWxEZWYubm9kZUluZGV4KS5yZW5kZXJFbGVtZW50O1xuICAgICAgaWYgKCFlbERlZi5lbGVtZW50ICEubmFtZSkge1xuICAgICAgICAvLyBhIGNvbW1lbnQuXG4gICAgICAgIHZpZXcucmVuZGVyZXIuc2V0VmFsdWUoZWwsIGBiaW5kaW5ncz0ke0pTT04uc3RyaW5naWZ5KGJpbmRpbmdWYWx1ZXMsIG51bGwsIDIpfWApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gYSByZWd1bGFyIGVsZW1lbnQuXG4gICAgICAgIGZvciAobGV0IGF0dHIgaW4gYmluZGluZ1ZhbHVlcykge1xuICAgICAgICAgIGNvbnN0IHZhbHVlID0gYmluZGluZ1ZhbHVlc1thdHRyXTtcbiAgICAgICAgICBpZiAodmFsdWUgIT0gbnVsbCkge1xuICAgICAgICAgICAgdmlldy5yZW5kZXJlci5zZXRBdHRyaWJ1dGUoZWwsIGF0dHIsIHZhbHVlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmlldy5yZW5kZXJlci5yZW1vdmVBdHRyaWJ1dGUoZWwsIGF0dHIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBkZWJ1Z0NoZWNrTm9DaGFuZ2VzTm9kZShcbiAgICB2aWV3OiBWaWV3RGF0YSwgbm9kZURlZjogTm9kZURlZiwgYXJnU3R5bGU6IEFyZ3VtZW50VHlwZSwgdmFsdWVzOiBhbnlbXSk6IHZvaWQge1xuICAoPGFueT5jaGVja05vQ2hhbmdlc05vZGUpKHZpZXcsIG5vZGVEZWYsIGFyZ1N0eWxlLCAuLi52YWx1ZXMpO1xufVxuXG5mdW5jdGlvbiBuZXh0RGlyZWN0aXZlV2l0aEJpbmRpbmcodmlldzogVmlld0RhdGEsIG5vZGVJbmRleDogbnVtYmVyKTogbnVtYmVyfG51bGwge1xuICBmb3IgKGxldCBpID0gbm9kZUluZGV4OyBpIDwgdmlldy5kZWYubm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBub2RlRGVmID0gdmlldy5kZWYubm9kZXNbaV07XG4gICAgaWYgKG5vZGVEZWYuZmxhZ3MgJiBOb2RlRmxhZ3MuVHlwZURpcmVjdGl2ZSAmJiBub2RlRGVmLmJpbmRpbmdzICYmIG5vZGVEZWYuYmluZGluZ3MubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gaTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG5cbmZ1bmN0aW9uIG5leHRSZW5kZXJOb2RlV2l0aEJpbmRpbmcodmlldzogVmlld0RhdGEsIG5vZGVJbmRleDogbnVtYmVyKTogbnVtYmVyfG51bGwge1xuICBmb3IgKGxldCBpID0gbm9kZUluZGV4OyBpIDwgdmlldy5kZWYubm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBub2RlRGVmID0gdmlldy5kZWYubm9kZXNbaV07XG4gICAgaWYgKChub2RlRGVmLmZsYWdzICYgTm9kZUZsYWdzLkNhdFJlbmRlck5vZGUpICYmIG5vZGVEZWYuYmluZGluZ3MgJiYgbm9kZURlZi5iaW5kaW5ncy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuY2xhc3MgRGVidWdDb250ZXh0XyBpbXBsZW1lbnRzIERlYnVnQ29udGV4dCB7XG4gIHByaXZhdGUgbm9kZURlZjogTm9kZURlZjtcbiAgcHJpdmF0ZSBlbFZpZXc6IFZpZXdEYXRhO1xuICBwcml2YXRlIGVsRGVmOiBOb2RlRGVmO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB2aWV3OiBWaWV3RGF0YSwgcHVibGljIG5vZGVJbmRleDogbnVtYmVyfG51bGwpIHtcbiAgICBpZiAobm9kZUluZGV4ID09IG51bGwpIHtcbiAgICAgIHRoaXMubm9kZUluZGV4ID0gbm9kZUluZGV4ID0gMDtcbiAgICB9XG4gICAgdGhpcy5ub2RlRGVmID0gdmlldy5kZWYubm9kZXNbbm9kZUluZGV4XTtcbiAgICBsZXQgZWxEZWYgPSB0aGlzLm5vZGVEZWY7XG4gICAgbGV0IGVsVmlldyA9IHZpZXc7XG4gICAgd2hpbGUgKGVsRGVmICYmIChlbERlZi5mbGFncyAmIE5vZGVGbGFncy5UeXBlRWxlbWVudCkgPT09IDApIHtcbiAgICAgIGVsRGVmID0gZWxEZWYucGFyZW50ICE7XG4gICAgfVxuICAgIGlmICghZWxEZWYpIHtcbiAgICAgIHdoaWxlICghZWxEZWYgJiYgZWxWaWV3KSB7XG4gICAgICAgIGVsRGVmID0gdmlld1BhcmVudEVsKGVsVmlldykgITtcbiAgICAgICAgZWxWaWV3ID0gZWxWaWV3LnBhcmVudCAhO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmVsRGVmID0gZWxEZWY7XG4gICAgdGhpcy5lbFZpZXcgPSBlbFZpZXc7XG4gIH1cblxuICBwcml2YXRlIGdldCBlbE9yQ29tcFZpZXcoKSB7XG4gICAgLy8gSGFzIHRvIGJlIGRvbmUgbGF6aWx5IGFzIHdlIHVzZSB0aGUgRGVidWdDb250ZXh0IGFsc28gZHVyaW5nIGNyZWF0aW9uIG9mIGVsZW1lbnRzLi4uXG4gICAgcmV0dXJuIGFzRWxlbWVudERhdGEodGhpcy5lbFZpZXcsIHRoaXMuZWxEZWYubm9kZUluZGV4KS5jb21wb25lbnRWaWV3IHx8IHRoaXMudmlldztcbiAgfVxuXG4gIGdldCBpbmplY3RvcigpOiBJbmplY3RvciB7IHJldHVybiBjcmVhdGVJbmplY3Rvcih0aGlzLmVsVmlldywgdGhpcy5lbERlZik7IH1cblxuICBnZXQgY29tcG9uZW50KCk6IGFueSB7IHJldHVybiB0aGlzLmVsT3JDb21wVmlldy5jb21wb25lbnQ7IH1cblxuICBnZXQgY29udGV4dCgpOiBhbnkgeyByZXR1cm4gdGhpcy5lbE9yQ29tcFZpZXcuY29udGV4dDsgfVxuXG4gIGdldCBwcm92aWRlclRva2VucygpOiBhbnlbXSB7XG4gICAgY29uc3QgdG9rZW5zOiBhbnlbXSA9IFtdO1xuICAgIGlmICh0aGlzLmVsRGVmKSB7XG4gICAgICBmb3IgKGxldCBpID0gdGhpcy5lbERlZi5ub2RlSW5kZXggKyAxOyBpIDw9IHRoaXMuZWxEZWYubm9kZUluZGV4ICsgdGhpcy5lbERlZi5jaGlsZENvdW50O1xuICAgICAgICAgICBpKyspIHtcbiAgICAgICAgY29uc3QgY2hpbGREZWYgPSB0aGlzLmVsVmlldy5kZWYubm9kZXNbaV07XG4gICAgICAgIGlmIChjaGlsZERlZi5mbGFncyAmIE5vZGVGbGFncy5DYXRQcm92aWRlcikge1xuICAgICAgICAgIHRva2Vucy5wdXNoKGNoaWxkRGVmLnByb3ZpZGVyICEudG9rZW4pO1xuICAgICAgICB9XG4gICAgICAgIGkgKz0gY2hpbGREZWYuY2hpbGRDb3VudDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRva2VucztcbiAgfVxuXG4gIGdldCByZWZlcmVuY2VzKCk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgICBjb25zdCByZWZlcmVuY2VzOiB7W2tleTogc3RyaW5nXTogYW55fSA9IHt9O1xuICAgIGlmICh0aGlzLmVsRGVmKSB7XG4gICAgICBjb2xsZWN0UmVmZXJlbmNlcyh0aGlzLmVsVmlldywgdGhpcy5lbERlZiwgcmVmZXJlbmNlcyk7XG5cbiAgICAgIGZvciAobGV0IGkgPSB0aGlzLmVsRGVmLm5vZGVJbmRleCArIDE7IGkgPD0gdGhpcy5lbERlZi5ub2RlSW5kZXggKyB0aGlzLmVsRGVmLmNoaWxkQ291bnQ7XG4gICAgICAgICAgIGkrKykge1xuICAgICAgICBjb25zdCBjaGlsZERlZiA9IHRoaXMuZWxWaWV3LmRlZi5ub2Rlc1tpXTtcbiAgICAgICAgaWYgKGNoaWxkRGVmLmZsYWdzICYgTm9kZUZsYWdzLkNhdFByb3ZpZGVyKSB7XG4gICAgICAgICAgY29sbGVjdFJlZmVyZW5jZXModGhpcy5lbFZpZXcsIGNoaWxkRGVmLCByZWZlcmVuY2VzKTtcbiAgICAgICAgfVxuICAgICAgICBpICs9IGNoaWxkRGVmLmNoaWxkQ291bnQ7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZWZlcmVuY2VzO1xuICB9XG5cbiAgZ2V0IGNvbXBvbmVudFJlbmRlckVsZW1lbnQoKSB7XG4gICAgY29uc3QgZWxEYXRhID0gZmluZEhvc3RFbGVtZW50KHRoaXMuZWxPckNvbXBWaWV3KTtcbiAgICByZXR1cm4gZWxEYXRhID8gZWxEYXRhLnJlbmRlckVsZW1lbnQgOiB1bmRlZmluZWQ7XG4gIH1cblxuICBnZXQgcmVuZGVyTm9kZSgpOiBhbnkge1xuICAgIHJldHVybiB0aGlzLm5vZGVEZWYuZmxhZ3MgJiBOb2RlRmxhZ3MuVHlwZVRleHQgPyByZW5kZXJOb2RlKHRoaXMudmlldywgdGhpcy5ub2RlRGVmKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlck5vZGUodGhpcy5lbFZpZXcsIHRoaXMuZWxEZWYpO1xuICB9XG5cbiAgbG9nRXJyb3IoY29uc29sZTogQ29uc29sZSwgLi4udmFsdWVzOiBhbnlbXSkge1xuICAgIGxldCBsb2dWaWV3RGVmOiBWaWV3RGVmaW5pdGlvbjtcbiAgICBsZXQgbG9nTm9kZUluZGV4OiBudW1iZXI7XG4gICAgaWYgKHRoaXMubm9kZURlZi5mbGFncyAmIE5vZGVGbGFncy5UeXBlVGV4dCkge1xuICAgICAgbG9nVmlld0RlZiA9IHRoaXMudmlldy5kZWY7XG4gICAgICBsb2dOb2RlSW5kZXggPSB0aGlzLm5vZGVEZWYubm9kZUluZGV4O1xuICAgIH0gZWxzZSB7XG4gICAgICBsb2dWaWV3RGVmID0gdGhpcy5lbFZpZXcuZGVmO1xuICAgICAgbG9nTm9kZUluZGV4ID0gdGhpcy5lbERlZi5ub2RlSW5kZXg7XG4gICAgfVxuICAgIC8vIE5vdGU6IHdlIG9ubHkgZ2VuZXJhdGUgYSBsb2cgZnVuY3Rpb24gZm9yIHRleHQgYW5kIGVsZW1lbnQgbm9kZXNcbiAgICAvLyB0byBtYWtlIHRoZSBnZW5lcmF0ZWQgY29kZSBhcyBzbWFsbCBhcyBwb3NzaWJsZS5cbiAgICBjb25zdCByZW5kZXJOb2RlSW5kZXggPSBnZXRSZW5kZXJOb2RlSW5kZXgobG9nVmlld0RlZiwgbG9nTm9kZUluZGV4KTtcbiAgICBsZXQgY3VyclJlbmRlck5vZGVJbmRleCA9IC0xO1xuICAgIGxldCBub2RlTG9nZ2VyOiBOb2RlTG9nZ2VyID0gKCkgPT4ge1xuICAgICAgY3VyclJlbmRlck5vZGVJbmRleCsrO1xuICAgICAgaWYgKGN1cnJSZW5kZXJOb2RlSW5kZXggPT09IHJlbmRlck5vZGVJbmRleCkge1xuICAgICAgICByZXR1cm4gY29uc29sZS5lcnJvci5iaW5kKGNvbnNvbGUsIC4uLnZhbHVlcyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gTk9PUDtcbiAgICAgIH1cbiAgICB9O1xuICAgIGxvZ1ZpZXdEZWYuZmFjdG9yeSAhKG5vZGVMb2dnZXIpO1xuICAgIGlmIChjdXJyUmVuZGVyTm9kZUluZGV4IDwgcmVuZGVyTm9kZUluZGV4KSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdJbGxlZ2FsIHN0YXRlOiB0aGUgVmlld0RlZmluaXRpb25GYWN0b3J5IGRpZCBub3QgY2FsbCB0aGUgbG9nZ2VyIScpO1xuICAgICAgKDxhbnk+Y29uc29sZS5lcnJvcikoLi4udmFsdWVzKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0UmVuZGVyTm9kZUluZGV4KHZpZXdEZWY6IFZpZXdEZWZpbml0aW9uLCBub2RlSW5kZXg6IG51bWJlcik6IG51bWJlciB7XG4gIGxldCByZW5kZXJOb2RlSW5kZXggPSAtMTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPD0gbm9kZUluZGV4OyBpKyspIHtcbiAgICBjb25zdCBub2RlRGVmID0gdmlld0RlZi5ub2Rlc1tpXTtcbiAgICBpZiAobm9kZURlZi5mbGFncyAmIE5vZGVGbGFncy5DYXRSZW5kZXJOb2RlKSB7XG4gICAgICByZW5kZXJOb2RlSW5kZXgrKztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlbmRlck5vZGVJbmRleDtcbn1cblxuZnVuY3Rpb24gZmluZEhvc3RFbGVtZW50KHZpZXc6IFZpZXdEYXRhKTogRWxlbWVudERhdGF8bnVsbCB7XG4gIHdoaWxlICh2aWV3ICYmICFpc0NvbXBvbmVudFZpZXcodmlldykpIHtcbiAgICB2aWV3ID0gdmlldy5wYXJlbnQgITtcbiAgfVxuICBpZiAodmlldy5wYXJlbnQpIHtcbiAgICByZXR1cm4gYXNFbGVtZW50RGF0YSh2aWV3LnBhcmVudCwgdmlld1BhcmVudEVsKHZpZXcpICEubm9kZUluZGV4KTtcbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuZnVuY3Rpb24gY29sbGVjdFJlZmVyZW5jZXModmlldzogVmlld0RhdGEsIG5vZGVEZWY6IE5vZGVEZWYsIHJlZmVyZW5jZXM6IHtba2V5OiBzdHJpbmddOiBhbnl9KSB7XG4gIGZvciAobGV0IHJlZk5hbWUgaW4gbm9kZURlZi5yZWZlcmVuY2VzKSB7XG4gICAgcmVmZXJlbmNlc1tyZWZOYW1lXSA9IGdldFF1ZXJ5VmFsdWUodmlldywgbm9kZURlZiwgbm9kZURlZi5yZWZlcmVuY2VzW3JlZk5hbWVdKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjYWxsV2l0aERlYnVnQ29udGV4dChhY3Rpb246IERlYnVnQWN0aW9uLCBmbjogYW55LCBzZWxmOiBhbnksIGFyZ3M6IGFueVtdKSB7XG4gIGNvbnN0IG9sZEFjdGlvbiA9IF9jdXJyZW50QWN0aW9uO1xuICBjb25zdCBvbGRWaWV3ID0gX2N1cnJlbnRWaWV3O1xuICBjb25zdCBvbGROb2RlSW5kZXggPSBfY3VycmVudE5vZGVJbmRleDtcbiAgdHJ5IHtcbiAgICBfY3VycmVudEFjdGlvbiA9IGFjdGlvbjtcbiAgICBjb25zdCByZXN1bHQgPSBmbi5hcHBseShzZWxmLCBhcmdzKTtcbiAgICBfY3VycmVudFZpZXcgPSBvbGRWaWV3O1xuICAgIF9jdXJyZW50Tm9kZUluZGV4ID0gb2xkTm9kZUluZGV4O1xuICAgIF9jdXJyZW50QWN0aW9uID0gb2xkQWN0aW9uO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBpZiAoaXNWaWV3RGVidWdFcnJvcihlKSB8fCAhX2N1cnJlbnRWaWV3KSB7XG4gICAgICB0aHJvdyBlO1xuICAgIH1cbiAgICB0aHJvdyB2aWV3V3JhcHBlZERlYnVnRXJyb3IoZSwgZ2V0Q3VycmVudERlYnVnQ29udGV4dCgpICEpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRDdXJyZW50RGVidWdDb250ZXh0KCk6IERlYnVnQ29udGV4dHxudWxsIHtcbiAgcmV0dXJuIF9jdXJyZW50VmlldyA/IG5ldyBEZWJ1Z0NvbnRleHRfKF9jdXJyZW50VmlldywgX2N1cnJlbnROb2RlSW5kZXgpIDogbnVsbDtcbn1cblxuZXhwb3J0IGNsYXNzIERlYnVnUmVuZGVyZXJGYWN0b3J5MiBpbXBsZW1lbnRzIFJlbmRlcmVyRmFjdG9yeTIge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGRlbGVnYXRlOiBSZW5kZXJlckZhY3RvcnkyKSB7fVxuXG4gIGNyZWF0ZVJlbmRlcmVyKGVsZW1lbnQ6IGFueSwgcmVuZGVyRGF0YTogUmVuZGVyZXJUeXBlMnxudWxsKTogUmVuZGVyZXIyIHtcbiAgICByZXR1cm4gbmV3IERlYnVnUmVuZGVyZXIyKHRoaXMuZGVsZWdhdGUuY3JlYXRlUmVuZGVyZXIoZWxlbWVudCwgcmVuZGVyRGF0YSkpO1xuICB9XG5cbiAgYmVnaW4oKSB7XG4gICAgaWYgKHRoaXMuZGVsZWdhdGUuYmVnaW4pIHtcbiAgICAgIHRoaXMuZGVsZWdhdGUuYmVnaW4oKTtcbiAgICB9XG4gIH1cbiAgZW5kKCkge1xuICAgIGlmICh0aGlzLmRlbGVnYXRlLmVuZCkge1xuICAgICAgdGhpcy5kZWxlZ2F0ZS5lbmQoKTtcbiAgICB9XG4gIH1cblxuICB3aGVuUmVuZGVyaW5nRG9uZSgpOiBQcm9taXNlPGFueT4ge1xuICAgIGlmICh0aGlzLmRlbGVnYXRlLndoZW5SZW5kZXJpbmdEb25lKSB7XG4gICAgICByZXR1cm4gdGhpcy5kZWxlZ2F0ZS53aGVuUmVuZGVyaW5nRG9uZSgpO1xuICAgIH1cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG51bGwpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBEZWJ1Z1JlbmRlcmVyMiBpbXBsZW1lbnRzIFJlbmRlcmVyMiB7XG4gIHJlYWRvbmx5IGRhdGE6IHtba2V5OiBzdHJpbmddOiBhbnl9O1xuXG4gIHByaXZhdGUgY3JlYXRlRGVidWdDb250ZXh0KG5hdGl2ZUVsZW1lbnQ6IGFueSkgeyByZXR1cm4gdGhpcy5kZWJ1Z0NvbnRleHRGYWN0b3J5KG5hdGl2ZUVsZW1lbnQpOyB9XG5cbiAgLyoqXG4gICAqIEZhY3RvcnkgZnVuY3Rpb24gdXNlZCB0byBjcmVhdGUgYSBgRGVidWdDb250ZXh0YCB3aGVuIGEgbm9kZSBpcyBjcmVhdGVkLlxuICAgKlxuICAgKiBUaGUgYERlYnVnQ29udGV4dGAgYWxsb3dzIHRvIHJldHJpZXZlIGluZm9ybWF0aW9uIGFib3V0IHRoZSBub2RlcyB0aGF0IGFyZSB1c2VmdWwgaW4gdGVzdHMuXG4gICAqXG4gICAqIFRoZSBmYWN0b3J5IGlzIGNvbmZpZ3VyYWJsZSBzbyB0aGF0IHRoZSBgRGVidWdSZW5kZXJlcjJgIGNvdWxkIGluc3RhbnRpYXRlIGVpdGhlciBhIFZpZXcgRW5naW5lXG4gICAqIG9yIGEgUmVuZGVyIGNvbnRleHQuXG4gICAqL1xuICBkZWJ1Z0NvbnRleHRGYWN0b3J5OiAobmF0aXZlRWxlbWVudD86IGFueSkgPT4gRGVidWdDb250ZXh0IHwgbnVsbCA9IGdldEN1cnJlbnREZWJ1Z0NvbnRleHQ7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBkZWxlZ2F0ZTogUmVuZGVyZXIyKSB7IHRoaXMuZGF0YSA9IHRoaXMuZGVsZWdhdGUuZGF0YTsgfVxuXG4gIGRlc3Ryb3lOb2RlKG5vZGU6IGFueSkge1xuICAgIHJlbW92ZURlYnVnTm9kZUZyb21JbmRleChnZXREZWJ1Z05vZGUobm9kZSkgISk7XG4gICAgaWYgKHRoaXMuZGVsZWdhdGUuZGVzdHJveU5vZGUpIHtcbiAgICAgIHRoaXMuZGVsZWdhdGUuZGVzdHJveU5vZGUobm9kZSk7XG4gICAgfVxuICB9XG5cbiAgZGVzdHJveSgpIHsgdGhpcy5kZWxlZ2F0ZS5kZXN0cm95KCk7IH1cblxuICBjcmVhdGVFbGVtZW50KG5hbWU6IHN0cmluZywgbmFtZXNwYWNlPzogc3RyaW5nKTogYW55IHtcbiAgICBjb25zdCBlbCA9IHRoaXMuZGVsZWdhdGUuY3JlYXRlRWxlbWVudChuYW1lLCBuYW1lc3BhY2UpO1xuICAgIGNvbnN0IGRlYnVnQ3R4ID0gdGhpcy5jcmVhdGVEZWJ1Z0NvbnRleHQoZWwpO1xuICAgIGlmIChkZWJ1Z0N0eCkge1xuICAgICAgY29uc3QgZGVidWdFbCA9IG5ldyBEZWJ1Z0VsZW1lbnRfX1BSRV9SM19fKGVsLCBudWxsLCBkZWJ1Z0N0eCk7XG4gICAgICAoZGVidWdFbCBhc3tuYW1lOiBzdHJpbmd9KS5uYW1lID0gbmFtZTtcbiAgICAgIGluZGV4RGVidWdOb2RlKGRlYnVnRWwpO1xuICAgIH1cbiAgICByZXR1cm4gZWw7XG4gIH1cblxuICBjcmVhdGVDb21tZW50KHZhbHVlOiBzdHJpbmcpOiBhbnkge1xuICAgIGNvbnN0IGNvbW1lbnQgPSB0aGlzLmRlbGVnYXRlLmNyZWF0ZUNvbW1lbnQodmFsdWUpO1xuICAgIGNvbnN0IGRlYnVnQ3R4ID0gdGhpcy5jcmVhdGVEZWJ1Z0NvbnRleHQoY29tbWVudCk7XG4gICAgaWYgKGRlYnVnQ3R4KSB7XG4gICAgICBpbmRleERlYnVnTm9kZShuZXcgRGVidWdOb2RlX19QUkVfUjNfXyhjb21tZW50LCBudWxsLCBkZWJ1Z0N0eCkpO1xuICAgIH1cbiAgICByZXR1cm4gY29tbWVudDtcbiAgfVxuXG4gIGNyZWF0ZVRleHQodmFsdWU6IHN0cmluZyk6IGFueSB7XG4gICAgY29uc3QgdGV4dCA9IHRoaXMuZGVsZWdhdGUuY3JlYXRlVGV4dCh2YWx1ZSk7XG4gICAgY29uc3QgZGVidWdDdHggPSB0aGlzLmNyZWF0ZURlYnVnQ29udGV4dCh0ZXh0KTtcbiAgICBpZiAoZGVidWdDdHgpIHtcbiAgICAgIGluZGV4RGVidWdOb2RlKG5ldyBEZWJ1Z05vZGVfX1BSRV9SM19fKHRleHQsIG51bGwsIGRlYnVnQ3R4KSk7XG4gICAgfVxuICAgIHJldHVybiB0ZXh0O1xuICB9XG5cbiAgYXBwZW5kQ2hpbGQocGFyZW50OiBhbnksIG5ld0NoaWxkOiBhbnkpOiB2b2lkIHtcbiAgICBjb25zdCBkZWJ1Z0VsID0gZ2V0RGVidWdOb2RlKHBhcmVudCk7XG4gICAgY29uc3QgZGVidWdDaGlsZEVsID0gZ2V0RGVidWdOb2RlKG5ld0NoaWxkKTtcbiAgICBpZiAoZGVidWdFbCAmJiBkZWJ1Z0NoaWxkRWwgJiYgZGVidWdFbCBpbnN0YW5jZW9mIERlYnVnRWxlbWVudF9fUFJFX1IzX18pIHtcbiAgICAgIGRlYnVnRWwuYWRkQ2hpbGQoZGVidWdDaGlsZEVsKTtcbiAgICB9XG4gICAgdGhpcy5kZWxlZ2F0ZS5hcHBlbmRDaGlsZChwYXJlbnQsIG5ld0NoaWxkKTtcbiAgfVxuXG4gIGluc2VydEJlZm9yZShwYXJlbnQ6IGFueSwgbmV3Q2hpbGQ6IGFueSwgcmVmQ2hpbGQ6IGFueSk6IHZvaWQge1xuICAgIGNvbnN0IGRlYnVnRWwgPSBnZXREZWJ1Z05vZGUocGFyZW50KTtcbiAgICBjb25zdCBkZWJ1Z0NoaWxkRWwgPSBnZXREZWJ1Z05vZGUobmV3Q2hpbGQpO1xuICAgIGNvbnN0IGRlYnVnUmVmRWwgPSBnZXREZWJ1Z05vZGUocmVmQ2hpbGQpICE7XG4gICAgaWYgKGRlYnVnRWwgJiYgZGVidWdDaGlsZEVsICYmIGRlYnVnRWwgaW5zdGFuY2VvZiBEZWJ1Z0VsZW1lbnRfX1BSRV9SM19fKSB7XG4gICAgICBkZWJ1Z0VsLmluc2VydEJlZm9yZShkZWJ1Z1JlZkVsLCBkZWJ1Z0NoaWxkRWwpO1xuICAgIH1cblxuICAgIHRoaXMuZGVsZWdhdGUuaW5zZXJ0QmVmb3JlKHBhcmVudCwgbmV3Q2hpbGQsIHJlZkNoaWxkKTtcbiAgfVxuXG4gIHJlbW92ZUNoaWxkKHBhcmVudDogYW55LCBvbGRDaGlsZDogYW55KTogdm9pZCB7XG4gICAgY29uc3QgZGVidWdFbCA9IGdldERlYnVnTm9kZShwYXJlbnQpO1xuICAgIGNvbnN0IGRlYnVnQ2hpbGRFbCA9IGdldERlYnVnTm9kZShvbGRDaGlsZCk7XG4gICAgaWYgKGRlYnVnRWwgJiYgZGVidWdDaGlsZEVsICYmIGRlYnVnRWwgaW5zdGFuY2VvZiBEZWJ1Z0VsZW1lbnRfX1BSRV9SM19fKSB7XG4gICAgICBkZWJ1Z0VsLnJlbW92ZUNoaWxkKGRlYnVnQ2hpbGRFbCk7XG4gICAgfVxuICAgIHRoaXMuZGVsZWdhdGUucmVtb3ZlQ2hpbGQocGFyZW50LCBvbGRDaGlsZCk7XG4gIH1cblxuICBzZWxlY3RSb290RWxlbWVudChzZWxlY3Rvck9yTm9kZTogc3RyaW5nfGFueSwgcHJlc2VydmVDb250ZW50PzogYm9vbGVhbik6IGFueSB7XG4gICAgY29uc3QgZWwgPSB0aGlzLmRlbGVnYXRlLnNlbGVjdFJvb3RFbGVtZW50KHNlbGVjdG9yT3JOb2RlLCBwcmVzZXJ2ZUNvbnRlbnQpO1xuICAgIGNvbnN0IGRlYnVnQ3R4ID0gZ2V0Q3VycmVudERlYnVnQ29udGV4dCgpO1xuICAgIGlmIChkZWJ1Z0N0eCkge1xuICAgICAgaW5kZXhEZWJ1Z05vZGUobmV3IERlYnVnRWxlbWVudF9fUFJFX1IzX18oZWwsIG51bGwsIGRlYnVnQ3R4KSk7XG4gICAgfVxuICAgIHJldHVybiBlbDtcbiAgfVxuXG4gIHNldEF0dHJpYnV0ZShlbDogYW55LCBuYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcsIG5hbWVzcGFjZT86IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IGRlYnVnRWwgPSBnZXREZWJ1Z05vZGUoZWwpO1xuICAgIGlmIChkZWJ1Z0VsICYmIGRlYnVnRWwgaW5zdGFuY2VvZiBEZWJ1Z0VsZW1lbnRfX1BSRV9SM19fKSB7XG4gICAgICBjb25zdCBmdWxsTmFtZSA9IG5hbWVzcGFjZSA/IG5hbWVzcGFjZSArICc6JyArIG5hbWUgOiBuYW1lO1xuICAgICAgZGVidWdFbC5hdHRyaWJ1dGVzW2Z1bGxOYW1lXSA9IHZhbHVlO1xuICAgIH1cbiAgICB0aGlzLmRlbGVnYXRlLnNldEF0dHJpYnV0ZShlbCwgbmFtZSwgdmFsdWUsIG5hbWVzcGFjZSk7XG4gIH1cblxuICByZW1vdmVBdHRyaWJ1dGUoZWw6IGFueSwgbmFtZTogc3RyaW5nLCBuYW1lc3BhY2U/OiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBkZWJ1Z0VsID0gZ2V0RGVidWdOb2RlKGVsKTtcbiAgICBpZiAoZGVidWdFbCAmJiBkZWJ1Z0VsIGluc3RhbmNlb2YgRGVidWdFbGVtZW50X19QUkVfUjNfXykge1xuICAgICAgY29uc3QgZnVsbE5hbWUgPSBuYW1lc3BhY2UgPyBuYW1lc3BhY2UgKyAnOicgKyBuYW1lIDogbmFtZTtcbiAgICAgIGRlYnVnRWwuYXR0cmlidXRlc1tmdWxsTmFtZV0gPSBudWxsO1xuICAgIH1cbiAgICB0aGlzLmRlbGVnYXRlLnJlbW92ZUF0dHJpYnV0ZShlbCwgbmFtZSwgbmFtZXNwYWNlKTtcbiAgfVxuXG4gIGFkZENsYXNzKGVsOiBhbnksIG5hbWU6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IGRlYnVnRWwgPSBnZXREZWJ1Z05vZGUoZWwpO1xuICAgIGlmIChkZWJ1Z0VsICYmIGRlYnVnRWwgaW5zdGFuY2VvZiBEZWJ1Z0VsZW1lbnRfX1BSRV9SM19fKSB7XG4gICAgICBkZWJ1Z0VsLmNsYXNzZXNbbmFtZV0gPSB0cnVlO1xuICAgIH1cbiAgICB0aGlzLmRlbGVnYXRlLmFkZENsYXNzKGVsLCBuYW1lKTtcbiAgfVxuXG4gIHJlbW92ZUNsYXNzKGVsOiBhbnksIG5hbWU6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IGRlYnVnRWwgPSBnZXREZWJ1Z05vZGUoZWwpO1xuICAgIGlmIChkZWJ1Z0VsICYmIGRlYnVnRWwgaW5zdGFuY2VvZiBEZWJ1Z0VsZW1lbnRfX1BSRV9SM19fKSB7XG4gICAgICBkZWJ1Z0VsLmNsYXNzZXNbbmFtZV0gPSBmYWxzZTtcbiAgICB9XG4gICAgdGhpcy5kZWxlZ2F0ZS5yZW1vdmVDbGFzcyhlbCwgbmFtZSk7XG4gIH1cblxuICBzZXRTdHlsZShlbDogYW55LCBzdHlsZTogc3RyaW5nLCB2YWx1ZTogYW55LCBmbGFnczogUmVuZGVyZXJTdHlsZUZsYWdzMik6IHZvaWQge1xuICAgIGNvbnN0IGRlYnVnRWwgPSBnZXREZWJ1Z05vZGUoZWwpO1xuICAgIGlmIChkZWJ1Z0VsICYmIGRlYnVnRWwgaW5zdGFuY2VvZiBEZWJ1Z0VsZW1lbnRfX1BSRV9SM19fKSB7XG4gICAgICBkZWJ1Z0VsLnN0eWxlc1tzdHlsZV0gPSB2YWx1ZTtcbiAgICB9XG4gICAgdGhpcy5kZWxlZ2F0ZS5zZXRTdHlsZShlbCwgc3R5bGUsIHZhbHVlLCBmbGFncyk7XG4gIH1cblxuICByZW1vdmVTdHlsZShlbDogYW55LCBzdHlsZTogc3RyaW5nLCBmbGFnczogUmVuZGVyZXJTdHlsZUZsYWdzMik6IHZvaWQge1xuICAgIGNvbnN0IGRlYnVnRWwgPSBnZXREZWJ1Z05vZGUoZWwpO1xuICAgIGlmIChkZWJ1Z0VsICYmIGRlYnVnRWwgaW5zdGFuY2VvZiBEZWJ1Z0VsZW1lbnRfX1BSRV9SM19fKSB7XG4gICAgICBkZWJ1Z0VsLnN0eWxlc1tzdHlsZV0gPSBudWxsO1xuICAgIH1cbiAgICB0aGlzLmRlbGVnYXRlLnJlbW92ZVN0eWxlKGVsLCBzdHlsZSwgZmxhZ3MpO1xuICB9XG5cbiAgc2V0UHJvcGVydHkoZWw6IGFueSwgbmFtZTogc3RyaW5nLCB2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgY29uc3QgZGVidWdFbCA9IGdldERlYnVnTm9kZShlbCk7XG4gICAgaWYgKGRlYnVnRWwgJiYgZGVidWdFbCBpbnN0YW5jZW9mIERlYnVnRWxlbWVudF9fUFJFX1IzX18pIHtcbiAgICAgIGRlYnVnRWwucHJvcGVydGllc1tuYW1lXSA9IHZhbHVlO1xuICAgIH1cbiAgICB0aGlzLmRlbGVnYXRlLnNldFByb3BlcnR5KGVsLCBuYW1lLCB2YWx1ZSk7XG4gIH1cblxuICBsaXN0ZW4oXG4gICAgICB0YXJnZXQ6ICdkb2N1bWVudCd8J3dpbmRvd3MnfCdib2R5J3xhbnksIGV2ZW50TmFtZTogc3RyaW5nLFxuICAgICAgY2FsbGJhY2s6IChldmVudDogYW55KSA9PiBib29sZWFuKTogKCkgPT4gdm9pZCB7XG4gICAgaWYgKHR5cGVvZiB0YXJnZXQgIT09ICdzdHJpbmcnKSB7XG4gICAgICBjb25zdCBkZWJ1Z0VsID0gZ2V0RGVidWdOb2RlKHRhcmdldCk7XG4gICAgICBpZiAoZGVidWdFbCkge1xuICAgICAgICBkZWJ1Z0VsLmxpc3RlbmVycy5wdXNoKG5ldyBFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgY2FsbGJhY2spKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5kZWxlZ2F0ZS5saXN0ZW4odGFyZ2V0LCBldmVudE5hbWUsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIHBhcmVudE5vZGUobm9kZTogYW55KTogYW55IHsgcmV0dXJuIHRoaXMuZGVsZWdhdGUucGFyZW50Tm9kZShub2RlKTsgfVxuICBuZXh0U2libGluZyhub2RlOiBhbnkpOiBhbnkgeyByZXR1cm4gdGhpcy5kZWxlZ2F0ZS5uZXh0U2libGluZyhub2RlKTsgfVxuICBzZXRWYWx1ZShub2RlOiBhbnksIHZhbHVlOiBzdHJpbmcpOiB2b2lkIHsgcmV0dXJuIHRoaXMuZGVsZWdhdGUuc2V0VmFsdWUobm9kZSwgdmFsdWUpOyB9XG59XG4iXX0=