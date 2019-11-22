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
import { attachPatchData } from './context_discovery';
import { callHooks } from './hooks';
import { NATIVE, RENDER_PARENT, VIEWS, unusedValueExportToPlacateAjd as unused1 } from './interfaces/container';
import { unusedValueExportToPlacateAjd as unused2 } from './interfaces/node';
import { unusedValueExportToPlacateAjd as unused3 } from './interfaces/projection';
import { isProceduralRenderer, unusedValueExportToPlacateAjd as unused4 } from './interfaces/renderer';
import { CLEANUP, CONTAINER_INDEX, FLAGS, HEADER_OFFSET, HOST_NODE, NEXT, PARENT, QUERIES, RENDERER, TVIEW, unusedValueExportToPlacateAjd as unused5 } from './interfaces/view';
import { assertNodeType } from './node_assert';
import { findComponentView, getNativeByTNode, isLContainer, isRootView, readElementValue, stringify } from './util';
/** @type {?} */
const unusedValueToPlacateAjd = unused1 + unused2 + unused3 + unused4 + unused5;
/**
 * Retrieves the parent element of a given node.
 * @param {?} tNode
 * @param {?} currentView
 * @return {?}
 */
export function getParentNative(tNode, currentView) {
    if (tNode.parent == null) {
        return getHostNative(currentView);
    }
    else {
        /** @type {?} */
        const parentTNode = getFirstParentNative(tNode);
        return getNativeByTNode(parentTNode, currentView);
    }
}
/**
 * Get the first parent of a node that isn't an IcuContainer TNode
 * @param {?} tNode
 * @return {?}
 */
function getFirstParentNative(tNode) {
    /** @type {?} */
    let parent = tNode.parent;
    while (parent && parent.type === 5 /* IcuContainer */) {
        parent = parent.parent;
    }
    return (/** @type {?} */ (parent));
}
/**
 * Gets the host element given a view. Will return null if the current view is an embedded view,
 * which does not have a host element.
 * @param {?} currentView
 * @return {?}
 */
export function getHostNative(currentView) {
    /** @type {?} */
    const hostTNode = (/** @type {?} */ (currentView[HOST_NODE]));
    return hostTNode && hostTNode.type !== 2 /* View */ ?
        ((/** @type {?} */ (getNativeByTNode(hostTNode, (/** @type {?} */ (currentView[PARENT])))))) :
        null;
}
/**
 * @param {?} tNode
 * @param {?} embeddedView
 * @return {?}
 */
export function getLContainer(tNode, embeddedView) {
    if (tNode.index === -1) {
        // This is a dynamically created view inside a dynamic container.
        // If the host index is -1, the view has not yet been inserted, so it has no parent.
        /** @type {?} */
        const containerHostIndex = embeddedView[CONTAINER_INDEX];
        return containerHostIndex > -1 ? (/** @type {?} */ (embeddedView[PARENT]))[containerHostIndex] : null;
    }
    else {
        // This is a inline view node (e.g. embeddedViewStart)
        return (/** @type {?} */ ((/** @type {?} */ (embeddedView[PARENT]))[(/** @type {?} */ (tNode.parent)).index]));
    }
}
/**
 * Retrieves render parent for a given view.
 * Might be null if a view is not yet attached to any container.
 * @param {?} tViewNode
 * @param {?} view
 * @return {?}
 */
export function getContainerRenderParent(tViewNode, view) {
    /** @type {?} */
    const container = getLContainer(tViewNode, view);
    return container ? container[RENDER_PARENT] : null;
}
/** @enum {number} */
const WalkTNodeTreeAction = {
    /** node insert in the native environment */
    Insert: 0,
    /** node detach from the native environment */
    Detach: 1,
    /** node destruction using the renderer's API */
    Destroy: 2,
};
/**
 * Stack used to keep track of projection nodes in walkTNodeTree.
 *
 * This is deliberately created outside of walkTNodeTree to avoid allocating
 * a new array each time the function is called. Instead the array will be
 * re-used by each invocation. This works because the function is not reentrant.
 * @type {?}
 */
const projectionNodeStack = [];
/**
 * Walks a tree of TNodes, applying a transformation on the element nodes, either only on the first
 * one found, or on all of them.
 *
 * @param {?} viewToWalk the view to walk
 * @param {?} action identifies the action to be performed on the elements
 * @param {?} renderer the current renderer.
 * @param {?} renderParent Optional the render parent node to be set in all LContainers found,
 * required for action modes Insert and Destroy.
 * @param {?=} beforeNode Optional the node before which elements should be added, required for action
 * Insert.
 * @return {?}
 */
function walkTNodeTree(viewToWalk, action, renderer, renderParent, beforeNode) {
    /** @type {?} */
    const rootTNode = (/** @type {?} */ (viewToWalk[TVIEW].node));
    /** @type {?} */
    let projectionNodeIndex = -1;
    /** @type {?} */
    let currentView = viewToWalk;
    /** @type {?} */
    let tNode = (/** @type {?} */ (rootTNode.child));
    while (tNode) {
        /** @type {?} */
        let nextTNode = null;
        if (tNode.type === 3 /* Element */) {
            executeNodeAction(action, renderer, renderParent, getNativeByTNode(tNode, currentView), beforeNode);
            /** @type {?} */
            const nodeOrContainer = currentView[tNode.index];
            if (isLContainer(nodeOrContainer)) {
                // This element has an LContainer, and its comment needs to be handled
                executeNodeAction(action, renderer, renderParent, nodeOrContainer[NATIVE], beforeNode);
            }
        }
        else if (tNode.type === 0 /* Container */) {
            /** @type {?} */
            const lContainer = (/** @type {?} */ ((/** @type {?} */ (currentView))[tNode.index]));
            executeNodeAction(action, renderer, renderParent, lContainer[NATIVE], beforeNode);
            if (renderParent)
                lContainer[RENDER_PARENT] = renderParent;
            if (lContainer[VIEWS].length) {
                currentView = lContainer[VIEWS][0];
                nextTNode = currentView[TVIEW].node;
                // When the walker enters a container, then the beforeNode has to become the local native
                // comment node.
                beforeNode = lContainer[NATIVE];
            }
        }
        else if (tNode.type === 1 /* Projection */) {
            /** @type {?} */
            const componentView = findComponentView((/** @type {?} */ (currentView)));
            /** @type {?} */
            const componentHost = (/** @type {?} */ (componentView[HOST_NODE]));
            /** @type {?} */
            const head = ((/** @type {?} */ (componentHost.projection)))[(/** @type {?} */ (tNode.projection))];
            // Must store both the TNode and the view because this projection node could be nested
            // deeply inside embedded views, and we need to get back down to this particular nested view.
            projectionNodeStack[++projectionNodeIndex] = tNode;
            projectionNodeStack[++projectionNodeIndex] = (/** @type {?} */ (currentView));
            if (head) {
                currentView = (/** @type {?} */ (componentView[PARENT]));
                nextTNode = (/** @type {?} */ (currentView[TVIEW].data[head.index]));
            }
        }
        else {
            // Otherwise, this is a View or an ElementContainer
            nextTNode = tNode.child;
        }
        if (nextTNode === null) {
            // this last node was projected, we need to get back down to its projection node
            if (tNode.next === null && (tNode.flags & 2 /* isProjected */)) {
                currentView = (/** @type {?} */ (projectionNodeStack[projectionNodeIndex--]));
                tNode = (/** @type {?} */ (projectionNodeStack[projectionNodeIndex--]));
            }
            nextTNode = tNode.next;
            /**
             * Find the next node in the TNode tree, taking into account the place where a node is
             * projected (in the shadow DOM) rather than where it comes from (in the light DOM).
             *
             * If there is no sibling node, then it goes to the next sibling of the parent node...
             * until it reaches rootNode (at which point null is returned).
             */
            while (!nextTNode) {
                // If parent is null, we're crossing the view boundary, so we should get the host TNode.
                tNode = tNode.parent || currentView[TVIEW].node;
                if (tNode === null || tNode === rootTNode)
                    return null;
                // When exiting a container, the beforeNode must be restored to the previous value
                if (tNode.type === 0 /* Container */) {
                    currentView = (/** @type {?} */ (currentView[PARENT]));
                    beforeNode = currentView[tNode.index][NATIVE];
                }
                if (tNode.type === 2 /* View */ && currentView[NEXT]) {
                    currentView = (/** @type {?} */ (currentView[NEXT]));
                    nextTNode = currentView[TVIEW].node;
                }
                else {
                    nextTNode = tNode.next;
                }
            }
        }
        tNode = nextTNode;
    }
}
/**
 * NOTE: for performance reasons, the possible actions are inlined within the function instead of
 * being passed as an argument.
 * @param {?} action
 * @param {?} renderer
 * @param {?} parent
 * @param {?} node
 * @param {?=} beforeNode
 * @return {?}
 */
function executeNodeAction(action, renderer, parent, node, beforeNode) {
    if (action === 0 /* Insert */) {
        isProceduralRenderer((/** @type {?} */ (renderer))) ?
            ((/** @type {?} */ (renderer))).insertBefore((/** @type {?} */ (parent)), node, (/** @type {?} */ (beforeNode))) :
            (/** @type {?} */ (parent)).insertBefore(node, (/** @type {?} */ (beforeNode)), true);
    }
    else if (action === 1 /* Detach */) {
        isProceduralRenderer((/** @type {?} */ (renderer))) ?
            ((/** @type {?} */ (renderer))).removeChild((/** @type {?} */ (parent)), node) :
            (/** @type {?} */ (parent)).removeChild(node);
    }
    else if (action === 2 /* Destroy */) {
        ngDevMode && ngDevMode.rendererDestroyNode++;
        (/** @type {?} */ (((/** @type {?} */ (renderer))).destroyNode))(node);
    }
}
/**
 * @param {?} value
 * @param {?} renderer
 * @return {?}
 */
export function createTextNode(value, renderer) {
    return isProceduralRenderer(renderer) ? renderer.createText(stringify(value)) :
        renderer.createTextNode(stringify(value));
}
/**
 * @param {?} viewToWalk
 * @param {?} insertMode
 * @param {?=} beforeNode
 * @return {?}
 */
export function addRemoveViewFromContainer(viewToWalk, insertMode, beforeNode) {
    /** @type {?} */
    const renderParent = getContainerRenderParent((/** @type {?} */ (viewToWalk[TVIEW].node)), viewToWalk);
    ngDevMode && assertNodeType((/** @type {?} */ (viewToWalk[TVIEW].node)), 2 /* View */);
    if (renderParent) {
        /** @type {?} */
        const renderer = viewToWalk[RENDERER];
        walkTNodeTree(viewToWalk, insertMode ? 0 /* Insert */ : 1 /* Detach */, renderer, renderParent, beforeNode);
    }
}
/**
 * Traverses down and up the tree of views and containers to remove listeners and
 * call onDestroy callbacks.
 *
 * Notes:
 *  - Because it's used for onDestroy calls, it needs to be bottom-up.
 *  - Must process containers instead of their views to avoid splicing
 *  when views are destroyed and re-added.
 *  - Using a while loop because it's faster than recursion
 *  - Destroy only called on movement to sibling or movement to parent (laterally or up)
 *
 * @param {?} rootView The view to destroy
 * @return {?}
 */
export function destroyViewTree(rootView) {
    // If the view has no children, we can clean it up and return early.
    if (rootView[TVIEW].childIndex === -1) {
        return cleanUpView(rootView);
    }
    /** @type {?} */
    let viewOrContainer = getLViewChild(rootView);
    while (viewOrContainer) {
        /** @type {?} */
        let next = null;
        if (viewOrContainer.length >= HEADER_OFFSET) {
            // If LView, traverse down to child.
            /** @type {?} */
            const view = (/** @type {?} */ (viewOrContainer));
            if (view[TVIEW].childIndex > -1)
                next = getLViewChild(view);
        }
        else {
            // If container, traverse down to its first LView.
            /** @type {?} */
            const container = (/** @type {?} */ (viewOrContainer));
            if (container[VIEWS].length)
                next = container[VIEWS][0];
        }
        if (next == null) {
            // Only clean up view when moving to the side or up, as destroy hooks
            // should be called in order from the bottom up.
            while (viewOrContainer && !(/** @type {?} */ (viewOrContainer))[NEXT] && viewOrContainer !== rootView) {
                cleanUpView(viewOrContainer);
                viewOrContainer = getParentState(viewOrContainer, rootView);
            }
            cleanUpView(viewOrContainer || rootView);
            next = viewOrContainer && (/** @type {?} */ (viewOrContainer))[NEXT];
        }
        viewOrContainer = next;
    }
}
/**
 * Inserts a view into a container.
 *
 * This adds the view to the container's array of active views in the correct
 * position. It also adds the view's elements to the DOM if the container isn't a
 * root node of another view (in that case, the view's elements will be added when
 * the container's parent view is added later).
 *
 * @param {?} lView The view to insert
 * @param {?} lContainer The container into which the view should be inserted
 * @param {?} parentView The new parent of the inserted view
 * @param {?} index The index at which to insert the view
 * @param {?} containerIndex The index of the container node, if dynamic
 * @return {?}
 */
export function insertView(lView, lContainer, parentView, index, containerIndex) {
    /** @type {?} */
    const views = lContainer[VIEWS];
    if (index > 0) {
        // This is a new view, we need to add it to the children.
        views[index - 1][NEXT] = lView;
    }
    if (index < views.length) {
        lView[NEXT] = views[index];
        views.splice(index, 0, lView);
    }
    else {
        views.push(lView);
        lView[NEXT] = null;
    }
    // Dynamically inserted views need a reference to their parent container's host so it's
    // possible to jump from a view to its container's next when walking the node tree.
    if (containerIndex > -1) {
        lView[CONTAINER_INDEX] = containerIndex;
        lView[PARENT] = parentView;
    }
    // Notify query that a new view has been added
    if (lView[QUERIES]) {
        (/** @type {?} */ (lView[QUERIES])).insertView(index);
    }
    // Sets the attached flag
    lView[FLAGS] |= 16 /* Attached */;
}
/**
 * Detaches a view from a container.
 *
 * This method splices the view from the container's array of active views. It also
 * removes the view's elements from the DOM.
 *
 * @param {?} lContainer The container from which to detach a view
 * @param {?} removeIndex The index of the view to detach
 * @param {?} detached Whether or not this view is already detached.
 * @return {?} Detached LView instance.
 */
export function detachView(lContainer, removeIndex, detached) {
    /** @type {?} */
    const views = lContainer[VIEWS];
    /** @type {?} */
    const viewToDetach = views[removeIndex];
    if (removeIndex > 0) {
        views[removeIndex - 1][NEXT] = (/** @type {?} */ (viewToDetach[NEXT]));
    }
    views.splice(removeIndex, 1);
    if (!detached) {
        addRemoveViewFromContainer(viewToDetach, false);
    }
    if (viewToDetach[QUERIES]) {
        (/** @type {?} */ (viewToDetach[QUERIES])).removeView();
    }
    viewToDetach[CONTAINER_INDEX] = -1;
    viewToDetach[PARENT] = null;
    // Unsets the attached flag
    viewToDetach[FLAGS] &= ~16 /* Attached */;
    return viewToDetach;
}
/**
 * Removes a view from a container, i.e. detaches it and then destroys the underlying LView.
 *
 * @param {?} lContainer The container from which to remove a view
 * @param {?} containerHost
 * @param {?} removeIndex The index of the view to remove
 * @return {?}
 */
export function removeView(lContainer, containerHost, removeIndex) {
    /** @type {?} */
    const view = lContainer[VIEWS][removeIndex];
    detachView(lContainer, removeIndex, !!containerHost.detached);
    destroyLView(view);
}
/**
 * Gets the child of the given LView
 * @param {?} lView
 * @return {?}
 */
export function getLViewChild(lView) {
    /** @type {?} */
    const childIndex = lView[TVIEW].childIndex;
    return childIndex === -1 ? null : lView[childIndex];
}
/**
 * A standalone function which destroys an LView,
 * conducting cleanup (e.g. removing listeners, calling onDestroys).
 *
 * @param {?} view The view to be destroyed.
 * @return {?}
 */
export function destroyLView(view) {
    /** @type {?} */
    const renderer = view[RENDERER];
    if (isProceduralRenderer(renderer) && renderer.destroyNode) {
        walkTNodeTree(view, 2 /* Destroy */, renderer, null);
    }
    destroyViewTree(view);
    // Sets the destroyed flag
    view[FLAGS] |= 64 /* Destroyed */;
}
/**
 * Determines which LViewOrLContainer to jump to when traversing back up the
 * tree in destroyViewTree.
 *
 * Normally, the view's parent LView should be checked, but in the case of
 * embedded views, the container (which is the view node's parent, but not the
 * LView's parent) needs to be checked for a possible next property.
 *
 * @param {?} state The LViewOrLContainer for which we need a parent state
 * @param {?} rootView The rootView, so we don't propagate too far up the view tree
 * @return {?} The correct parent LViewOrLContainer
 */
export function getParentState(state, rootView) {
    /** @type {?} */
    let tNode;
    if (state.length >= HEADER_OFFSET && (tNode = (/** @type {?} */ (((/** @type {?} */ (state)))))[HOST_NODE]) &&
        tNode.type === 2 /* View */) {
        // if it's an embedded view, the state needs to go up to the container, in case the
        // container has a next
        return (/** @type {?} */ (getLContainer((/** @type {?} */ (tNode)), (/** @type {?} */ (state)))));
    }
    else {
        // otherwise, use parent view for containers or component views
        return state[PARENT] === rootView ? null : state[PARENT];
    }
}
/**
 * Calls onDestroys hooks for all directives and pipes in a given view and then removes all
 * listeners. Listeners are removed as the last step so events delivered in the onDestroys hooks
 * can be propagated to \@Output listeners.
 *
 * @param {?} viewOrContainer
 * @return {?}
 */
function cleanUpView(viewOrContainer) {
    if (((/** @type {?} */ (viewOrContainer))).length >= HEADER_OFFSET) {
        /** @type {?} */
        const view = (/** @type {?} */ (viewOrContainer));
        executeOnDestroys(view);
        executePipeOnDestroys(view);
        removeListeners(view);
        /** @type {?} */
        const hostTNode = view[HOST_NODE];
        // For component views only, the local renderer is destroyed as clean up time.
        if (hostTNode && hostTNode.type === 3 /* Element */ && isProceduralRenderer(view[RENDERER])) {
            ngDevMode && ngDevMode.rendererDestroy++;
            ((/** @type {?} */ (view[RENDERER]))).destroy();
        }
    }
}
/**
 * Removes listeners and unsubscribes from output subscriptions
 * @param {?} lView
 * @return {?}
 */
function removeListeners(lView) {
    /** @type {?} */
    const tCleanup = (/** @type {?} */ (lView[TVIEW].cleanup));
    if (tCleanup != null) {
        /** @type {?} */
        const lCleanup = (/** @type {?} */ (lView[CLEANUP]));
        for (let i = 0; i < tCleanup.length - 1; i += 2) {
            if (typeof tCleanup[i] === 'string') {
                // This is a listener with the native renderer
                /** @type {?} */
                const idx = tCleanup[i + 1];
                /** @type {?} */
                const listener = lCleanup[tCleanup[i + 2]];
                /** @type {?} */
                const native = readElementValue(lView[idx]);
                /** @type {?} */
                const useCaptureOrSubIdx = tCleanup[i + 3];
                if (typeof useCaptureOrSubIdx === 'boolean') {
                    // DOM listener
                    native.removeEventListener(tCleanup[i], listener, useCaptureOrSubIdx);
                }
                else {
                    if (useCaptureOrSubIdx >= 0) {
                        // unregister
                        lCleanup[useCaptureOrSubIdx]();
                    }
                    else {
                        // Subscription
                        lCleanup[-useCaptureOrSubIdx].unsubscribe();
                    }
                }
                i += 2;
            }
            else if (typeof tCleanup[i] === 'number') {
                // This is a listener with renderer2 (cleanup fn can be found by index)
                /** @type {?} */
                const cleanupFn = lCleanup[tCleanup[i]];
                cleanupFn();
            }
            else {
                // This is a cleanup function that is grouped with the index of its context
                /** @type {?} */
                const context = lCleanup[tCleanup[i + 1]];
                tCleanup[i].call(context);
            }
        }
        lView[CLEANUP] = null;
    }
}
/**
 * Calls onDestroy hooks for this view
 * @param {?} view
 * @return {?}
 */
function executeOnDestroys(view) {
    /** @type {?} */
    const tView = view[TVIEW];
    /** @type {?} */
    let destroyHooks;
    if (tView != null && (destroyHooks = tView.destroyHooks) != null) {
        callHooks(view, destroyHooks);
    }
}
/**
 * Calls pipe destroy hooks for this view
 * @param {?} lView
 * @return {?}
 */
function executePipeOnDestroys(lView) {
    /** @type {?} */
    const pipeDestroyHooks = lView[TVIEW] && lView[TVIEW].pipeDestroyHooks;
    if (pipeDestroyHooks) {
        callHooks((/** @type {?} */ (lView)), pipeDestroyHooks);
    }
}
/**
 * @param {?} tNode
 * @param {?} currentView
 * @return {?}
 */
export function getRenderParent(tNode, currentView) {
    if (canInsertNativeNode(tNode, currentView)) {
        // If we are asked for a render parent of the root component we need to do low-level DOM
        // operation as LTree doesn't exist above the topmost host node. We might need to find a render
        // parent of the topmost host node if the root component injects ViewContainerRef.
        if (isRootView(currentView)) {
            return nativeParentNode(currentView[RENDERER], getNativeByTNode(tNode, currentView));
        }
        /** @type {?} */
        const hostTNode = currentView[HOST_NODE];
        /** @type {?} */
        const tNodeParent = tNode.parent;
        if (tNodeParent != null && tNodeParent.type === 4 /* ElementContainer */) {
            tNode = getHighestElementContainer(tNodeParent);
        }
        return tNode.parent == null && (/** @type {?} */ (hostTNode)).type === 2 /* View */ ?
            getContainerRenderParent((/** @type {?} */ (hostTNode)), currentView) :
            (/** @type {?} */ (getParentNative(tNode, currentView)));
    }
    return null;
}
/**
 * @param {?} tNode
 * @return {?}
 */
function canInsertNativeChildOfElement(tNode) {
    // If the parent is null, then we are inserting across views. This happens when we
    // insert a root element of the component view into the component host element and it
    // should always be eager.
    if (tNode.parent == null ||
        // We should also eagerly insert if the parent is a regular, non-component element
        // since we know that this relationship will never be broken.
        tNode.parent.type === 3 /* Element */ && !(tNode.parent.flags & 1 /* isComponent */)) {
        return true;
    }
    // Parent is a Component. Component's content nodes are not inserted immediately
    // because they will be projected, and so doing insert at this point would be wasteful.
    // Since the projection would than move it to its final destination.
    return false;
}
/**
 * We might delay insertion of children for a given view if it is disconnected.
 * This might happen for 2 main reasons:
 * - view is not inserted into any container (view was created but not inserted yet)
 * - view is inserted into a container but the container itself is not inserted into the DOM
 * (container might be part of projection or child of a view that is not inserted yet).
 *
 * In other words we can insert children of a given view if this view was inserted into a container
 * and
 * the container itself has its render parent determined.
 * @param {?} viewTNode
 * @param {?} view
 * @return {?}
 */
function canInsertNativeChildOfView(viewTNode, view) {
    // Because we are inserting into a `View` the `View` may be disconnected.
    /** @type {?} */
    const container = (/** @type {?} */ (getLContainer(viewTNode, view)));
    if (container == null || container[RENDER_PARENT] == null) {
        // The `View` is not inserted into a `Container` or the parent `Container`
        // itself is disconnected. So we have to delay.
        return false;
    }
    // The parent `Container` is in inserted state, so we can eagerly insert into
    // this location.
    return true;
}
/**
 * Returns whether a native element can be inserted into the given parent.
 *
 * There are two reasons why we may not be able to insert a element immediately.
 * - Projection: When creating a child content element of a component, we have to skip the
 *   insertion because the content of a component will be projected.
 *   `<component><content>delayed due to projection</content></component>`
 * - Parent container is disconnected: This can happen when we are inserting a view into
 *   parent container, which itself is disconnected. For example the parent container is part
 *   of a View which has not be inserted or is mare for projection but has not been inserted
 *   into destination.
 *
 *
 * @param {?} tNode The tNode of the node that we want to insert.
 * @param {?} currentView Current LView being processed.
 * @return {?} boolean Whether the node should be inserted now (or delayed until later).
 */
export function canInsertNativeNode(tNode, currentView) {
    /** @type {?} */
    let currentNode = tNode;
    /** @type {?} */
    let parent = tNode.parent;
    if (tNode.parent) {
        if (tNode.parent.type === 4 /* ElementContainer */) {
            currentNode = getHighestElementContainer(tNode);
            parent = currentNode.parent;
        }
        else if (tNode.parent.type === 5 /* IcuContainer */) {
            currentNode = getFirstParentNative(currentNode);
            parent = currentNode.parent;
        }
    }
    if (parent === null)
        parent = currentView[HOST_NODE];
    if (parent && parent.type === 2 /* View */) {
        return canInsertNativeChildOfView((/** @type {?} */ (parent)), currentView);
    }
    else {
        // Parent is a regular element or a component
        return canInsertNativeChildOfElement(currentNode);
    }
}
/**
 * Inserts a native node before another native node for a given parent using {\@link Renderer3}.
 * This is a utility function that can be used when native nodes were determined - it abstracts an
 * actual renderer being used.
 * @param {?} renderer
 * @param {?} parent
 * @param {?} child
 * @param {?} beforeNode
 * @return {?}
 */
export function nativeInsertBefore(renderer, parent, child, beforeNode) {
    if (isProceduralRenderer(renderer)) {
        renderer.insertBefore(parent, child, beforeNode);
    }
    else {
        parent.insertBefore(child, beforeNode, true);
    }
}
/**
 * Returns a native parent of a given native node.
 * @param {?} renderer
 * @param {?} node
 * @return {?}
 */
export function nativeParentNode(renderer, node) {
    return (/** @type {?} */ ((isProceduralRenderer(renderer) ? renderer.parentNode(node) : node.parentNode)));
}
/**
 * Returns a native sibling of a given native node.
 * @param {?} renderer
 * @param {?} node
 * @return {?}
 */
export function nativeNextSibling(renderer, node) {
    return isProceduralRenderer(renderer) ? renderer.nextSibling(node) : node.nextSibling;
}
/**
 * Appends the `child` element to the `parent`.
 *
 * The element insertion might be delayed {\@link canInsertNativeNode}.
 *
 * @param {?=} childEl The child that should be appended
 * @param {?=} childTNode The TNode of the child element
 * @param {?=} currentView The current LView
 * @return {?} Whether or not the child was appended
 */
export function appendChild(childEl = null, childTNode, currentView) {
    if (childEl !== null && canInsertNativeNode(childTNode, currentView)) {
        /** @type {?} */
        const renderer = currentView[RENDERER];
        /** @type {?} */
        const parentEl = getParentNative(childTNode, currentView);
        /** @type {?} */
        const parentTNode = childTNode.parent || (/** @type {?} */ (currentView[HOST_NODE]));
        if (parentTNode.type === 2 /* View */) {
            /** @type {?} */
            const lContainer = (/** @type {?} */ (getLContainer((/** @type {?} */ (parentTNode)), currentView)));
            /** @type {?} */
            const views = lContainer[VIEWS];
            /** @type {?} */
            const index = views.indexOf(currentView);
            nativeInsertBefore(renderer, (/** @type {?} */ (lContainer[RENDER_PARENT])), childEl, getBeforeNodeForView(index, views, lContainer[NATIVE]));
        }
        else if (parentTNode.type === 4 /* ElementContainer */) {
            /** @type {?} */
            const renderParent = (/** @type {?} */ (getRenderParent(childTNode, currentView)));
            nativeInsertBefore(renderer, renderParent, childEl, parentEl);
        }
        else if (parentTNode.type === 5 /* IcuContainer */) {
            /** @type {?} */
            const icuAnchorNode = (/** @type {?} */ ((/** @type {?} */ (getNativeByTNode((/** @type {?} */ (childTNode.parent)), currentView)))));
            nativeInsertBefore(renderer, (/** @type {?} */ (parentEl)), childEl, icuAnchorNode);
        }
        else {
            isProceduralRenderer(renderer) ? renderer.appendChild((/** @type {?} */ ((/** @type {?} */ (parentEl)))), childEl) :
                (/** @type {?} */ (parentEl)).appendChild(childEl);
        }
        return true;
    }
    return false;
}
/**
 * Gets the top-level ng-container if ng-containers are nested.
 *
 * @param {?} ngContainer The TNode of the starting ng-container
 * @return {?} tNode The TNode of the highest level ng-container
 */
function getHighestElementContainer(ngContainer) {
    while (ngContainer.parent != null && ngContainer.parent.type === 4 /* ElementContainer */) {
        ngContainer = ngContainer.parent;
    }
    return ngContainer;
}
/**
 * @param {?} index
 * @param {?} views
 * @param {?} containerNative
 * @return {?}
 */
export function getBeforeNodeForView(index, views, containerNative) {
    if (index + 1 < views.length) {
        /** @type {?} */
        const view = (/** @type {?} */ (views[index + 1]));
        /** @type {?} */
        const viewTNode = (/** @type {?} */ (view[HOST_NODE]));
        return viewTNode.child ? getNativeByTNode(viewTNode.child, view) : containerNative;
    }
    else {
        return containerNative;
    }
}
/**
 * Removes the `child` element from the DOM if not in view and not projected.
 *
 * @param {?} childTNode The TNode of the child to remove
 * @param {?} childEl The child that should be removed
 * @param {?} currentView The current LView
 * @return {?} Whether or not the child was removed
 */
export function removeChild(childTNode, childEl, currentView) {
    // We only remove the element if not in View or not projected.
    if (childEl !== null && canInsertNativeNode(childTNode, currentView)) {
        /** @type {?} */
        const parentNative = (/** @type {?} */ ((/** @type {?} */ (getParentNative(childTNode, currentView)))));
        /** @type {?} */
        const renderer = currentView[RENDERER];
        isProceduralRenderer(renderer) ? renderer.removeChild((/** @type {?} */ (parentNative)), childEl) :
            (/** @type {?} */ (parentNative)).removeChild(childEl);
        return true;
    }
    return false;
}
/**
 * Appends a projected node to the DOM, or in the case of a projected container,
 * appends the nodes from all of the container's active views to the DOM.
 *
 * @param {?} projectedTNode The TNode to be projected
 * @param {?} tProjectionNode The projection (ng-content) TNode
 * @param {?} currentView Current LView
 * @param {?} projectionView Projection view (view above current)
 * @return {?}
 */
export function appendProjectedNode(projectedTNode, tProjectionNode, currentView, projectionView) {
    /** @type {?} */
    const native = getNativeByTNode(projectedTNode, projectionView);
    appendChild(native, tProjectionNode, currentView);
    // the projected contents are processed while in the shadow view (which is the currentView)
    // therefore we need to extract the view where the host element lives since it's the
    // logical container of the content projected views
    attachPatchData(native, projectionView);
    /** @type {?} */
    const renderParent = getRenderParent(tProjectionNode, currentView);
    /** @type {?} */
    const nodeOrContainer = projectionView[projectedTNode.index];
    if (projectedTNode.type === 0 /* Container */) {
        // The node we are adding is a container and we are adding it to an element which
        // is not a component (no more re-projection).
        // Alternatively a container is projected at the root of a component's template
        // and can't be re-projected (as not content of any component).
        // Assign the final projection location in those cases.
        nodeOrContainer[RENDER_PARENT] = renderParent;
        /** @type {?} */
        const views = nodeOrContainer[VIEWS];
        for (let i = 0; i < views.length; i++) {
            addRemoveViewFromContainer(views[i], true, nodeOrContainer[NATIVE]);
        }
    }
    else {
        if (projectedTNode.type === 4 /* ElementContainer */) {
            /** @type {?} */
            let ngContainerChildTNode = (/** @type {?} */ (projectedTNode.child));
            while (ngContainerChildTNode) {
                appendProjectedNode(ngContainerChildTNode, tProjectionNode, currentView, projectionView);
                ngContainerChildTNode = ngContainerChildTNode.next;
            }
        }
        if (isLContainer(nodeOrContainer)) {
            nodeOrContainer[RENDER_PARENT] = renderParent;
            appendChild(nodeOrContainer[NATIVE], tProjectionNode, currentView);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZV9tYW5pcHVsYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9yZW5kZXIzL25vZGVfbWFuaXB1bGF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBU0EsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ3BELE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFDbEMsT0FBTyxFQUFhLE1BQU0sRUFBRSxhQUFhLEVBQUUsS0FBSyxFQUFFLDZCQUE2QixJQUFJLE9BQU8sRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBQzFILE9BQU8sRUFBK0YsNkJBQTZCLElBQUksT0FBTyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDekssT0FBTyxFQUFDLDZCQUE2QixJQUFJLE9BQU8sRUFBQyxNQUFNLHlCQUF5QixDQUFDO0FBQ2pGLE9BQU8sRUFBbUUsb0JBQW9CLEVBQUUsNkJBQTZCLElBQUksT0FBTyxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDdkssT0FBTyxFQUFDLE9BQU8sRUFBRSxlQUFlLEVBQUUsS0FBSyxFQUFFLGFBQWEsRUFBRSxTQUFTLEVBQStCLElBQUksRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsNkJBQTZCLElBQUksT0FBTyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDM00sT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUM3QyxPQUFPLEVBQUMsaUJBQWlCLEVBQUUsZ0JBQWdCLEVBQUUsWUFBWSxFQUFFLFVBQVUsRUFBRSxnQkFBZ0IsRUFBRSxTQUFTLEVBQUMsTUFBTSxRQUFRLENBQUM7O01BRTVHLHVCQUF1QixHQUFHLE9BQU8sR0FBRyxPQUFPLEdBQUcsT0FBTyxHQUFHLE9BQU8sR0FBRyxPQUFPOzs7Ozs7O0FBRy9FLE1BQU0sVUFB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QUFHLGNBQWMsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDO0lBQzVELElBQUksY0FBYyxDQUFDLElBQUksc0JBQXdCLEVBQUU7UUFDL0MsaUZBQWlGO1FBQ2pGLDhDQUE4QztRQUM5QywrRUFBK0U7UUFDL0UsK0RBQStEO1FBQy9ELHVEQUF1RDtRQUN2RCxlQUFlLENBQUMsYUFBYSxDQUFDLEdBQUcsWUFBWSxDQUFDOztjQUN4QyxLQUFLLEdBQUcsZUFBZSxDQUFDLEtBQUssQ0FBQztRQUNwQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNyQywwQkFBMEIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1NBQ3JFO0tBQ0Y7U0FBTTtRQUNMLElBQUksY0FBYyxDQUFDLElBQUksNkJBQStCLEVBQUU7O2dCQUNsRCxxQkFBcUIsR0FBZSxtQkFBQSxjQUFjLENBQUMsS0FBSyxFQUFTO1lBQ3JFLE9BQU8scUJBQXFCLEVBQUU7Z0JBQzVCLG1CQUFtQixDQUFDLHFCQUFxQixFQUFFLGVBQWUsRUFBRSxXQUFXLEVBQUUsY0FBYyxDQUFDLENBQUM7Z0JBQ3pGLHFCQUFxQixHQUFHLHFCQUFxQixDQUFDLElBQUksQ0FBQzthQUNwRDtTQUNGO1FBRUQsSUFBSSxZQUFZLENBQUMsZUFBZSxDQUFDLEVBQUU7WUFDakMsZUFBZSxDQUFDLGFBQWEsQ0FBQyxHQUFHLFlBQVksQ0FBQztZQUM5QyxXQUFXLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxFQUFFLGVBQWUsRUFBRSxXQUFXLENBQUMsQ0FBQztTQUNwRTtLQUNGO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHthc3NlcnREZWZpbmVkfSBmcm9tICcuL2Fzc2VydCc7XG5pbXBvcnQge2F0dGFjaFBhdGNoRGF0YX0gZnJvbSAnLi9jb250ZXh0X2Rpc2NvdmVyeSc7XG5pbXBvcnQge2NhbGxIb29rc30gZnJvbSAnLi9ob29rcyc7XG5pbXBvcnQge0xDb250YWluZXIsIE5BVElWRSwgUkVOREVSX1BBUkVOVCwgVklFV1MsIHVudXNlZFZhbHVlRXhwb3J0VG9QbGFjYXRlQWpkIGFzIHVudXNlZDF9IGZyb20gJy4vaW50ZXJmYWNlcy9jb250YWluZXInO1xuaW1wb3J0IHtUQ29udGFpbmVyTm9kZSwgVEVsZW1lbnRDb250YWluZXJOb2RlLCBURWxlbWVudE5vZGUsIFROb2RlLCBUTm9kZUZsYWdzLCBUTm9kZVR5cGUsIFRWaWV3Tm9kZSwgdW51c2VkVmFsdWVFeHBvcnRUb1BsYWNhdGVBamQgYXMgdW51c2VkMn0gZnJvbSAnLi9pbnRlcmZhY2VzL25vZGUnO1xuaW1wb3J0IHt1bnVzZWRWYWx1ZUV4cG9ydFRvUGxhY2F0ZUFqZCBhcyB1bnVzZWQzfSBmcm9tICcuL2ludGVyZmFjZXMvcHJvamVjdGlvbic7XG5pbXBvcnQge1Byb2NlZHVyYWxSZW5kZXJlcjMsIFJDb21tZW50LCBSRWxlbWVudCwgUk5vZGUsIFJUZXh0LCBSZW5kZXJlcjMsIGlzUHJvY2VkdXJhbFJlbmRlcmVyLCB1bnVzZWRWYWx1ZUV4cG9ydFRvUGxhY2F0ZUFqZCBhcyB1bnVzZWQ0fSBmcm9tICcuL2ludGVyZmFjZXMvcmVuZGVyZXInO1xuaW1wb3J0IHtDTEVBTlVQLCBDT05UQUlORVJfSU5ERVgsIEZMQUdTLCBIRUFERVJfT0ZGU0VULCBIT1NUX05PREUsIEhvb2tEYXRhLCBMVmlldywgTFZpZXdGbGFncywgTkVYVCwgUEFSRU5ULCBRVUVSSUVTLCBSRU5ERVJFUiwgVFZJRVcsIHVudXNlZFZhbHVlRXhwb3J0VG9QbGFjYXRlQWpkIGFzIHVudXNlZDV9IGZyb20gJy4vaW50ZXJmYWNlcy92aWV3JztcbmltcG9ydCB7YXNzZXJ0Tm9kZVR5cGV9IGZyb20gJy4vbm9kZV9hc3NlcnQnO1xuaW1wb3J0IHtmaW5kQ29tcG9uZW50VmlldywgZ2V0TmF0aXZlQnlUTm9kZSwgaXNMQ29udGFpbmVyLCBpc1Jvb3RWaWV3LCByZWFkRWxlbWVudFZhbHVlLCBzdHJpbmdpZnl9IGZyb20gJy4vdXRpbCc7XG5cbmNvbnN0IHVudXNlZFZhbHVlVG9QbGFjYXRlQWpkID0gdW51c2VkMSArIHVudXNlZDIgKyB1bnVzZWQzICsgdW51c2VkNCArIHVudXNlZDU7XG5cbi8qKiBSZXRyaWV2ZXMgdGhlIHBhcmVudCBlbGVtZW50IG9mIGEgZ2l2ZW4gbm9kZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRQYXJlbnROYXRpdmUodE5vZGU6IFROb2RlLCBjdXJyZW50VmlldzogTFZpZXcpOiBSRWxlbWVudHxSQ29tbWVudHxudWxsIHtcbiAgaWYgKHROb2RlLnBhcmVudCA9PSBudWxsKSB7XG4gICAgcmV0dXJuIGdldEhvc3ROYXRpdmUoY3VycmVudFZpZXcpO1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IHBhcmVudFROb2RlID0gZ2V0Rmlyc3RQYXJlbnROYXRpdmUodE5vZGUpO1xuICAgIHJldHVybiBnZXROYXRpdmVCeVROb2RlKHBhcmVudFROb2RlLCBjdXJyZW50Vmlldyk7XG4gIH1cbn1cblxuLyoqXG4gKiBHZXQgdGhlIGZpcnN0IHBhcmVudCBvZiBhIG5vZGUgdGhhdCBpc24ndCBhbiBJY3VDb250YWluZXIgVE5vZGVcbiAqL1xuZnVuY3Rpb24gZ2V0Rmlyc3RQYXJlbnROYXRpdmUodE5vZGU6IFROb2RlKTogVE5vZGUge1xuICBsZXQgcGFyZW50ID0gdE5vZGUucGFyZW50O1xuICB3aGlsZSAocGFyZW50ICYmIHBhcmVudC50eXBlID09PSBUTm9kZVR5cGUuSWN1Q29udGFpbmVyKSB7XG4gICAgcGFyZW50ID0gcGFyZW50LnBhcmVudDtcbiAgfVxuICByZXR1cm4gcGFyZW50ICE7XG59XG5cbi8qKlxuICogR2V0cyB0aGUgaG9zdCBlbGVtZW50IGdpdmVuIGEgdmlldy4gV2lsbCByZXR1cm4gbnVsbCBpZiB0aGUgY3VycmVudCB2aWV3IGlzIGFuIGVtYmVkZGVkIHZpZXcsXG4gKiB3aGljaCBkb2VzIG5vdCBoYXZlIGEgaG9zdCBlbGVtZW50LlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0SG9zdE5hdGl2ZShjdXJyZW50VmlldzogTFZpZXcpOiBSRWxlbWVudHxudWxsIHtcbiAgY29uc3QgaG9zdFROb2RlID0gY3VycmVudFZpZXdbSE9TVF9OT0RFXSBhcyBURWxlbWVudE5vZGU7XG4gIHJldHVybiBob3N0VE5vZGUgJiYgaG9zdFROb2RlLnR5cGUgIT09IFROb2RlVHlwZS5WaWV3ID9cbiAgICAgIChnZXROYXRpdmVCeVROb2RlKGhvc3RUTm9kZSwgY3VycmVudFZpZXdbUEFSRU5UXSAhKSBhcyBSRWxlbWVudCkgOlxuICAgICAgbnVsbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldExDb250YWluZXIodE5vZGU6IFRWaWV3Tm9kZSwgZW1iZWRkZWRWaWV3OiBMVmlldyk6IExDb250YWluZXJ8bnVsbCB7XG4gIGlmICh0Tm9kZS5pbmRleCA9PT0gLTEpIHtcbiAgICAvLyBUaGlzIGlzIGEgZHluYW1pY2FsbHkgY3JlYXRlZCB2aWV3IGluc2lkZSBhIGR5bmFtaWMgY29udGFpbmVyLlxuICAgIC8vIElmIHRoZSBob3N0IGluZGV4IGlzIC0xLCB0aGUgdmlldyBoYXMgbm90IHlldCBiZWVuIGluc2VydGVkLCBzbyBpdCBoYXMgbm8gcGFyZW50LlxuICAgIGNvbnN0IGNvbnRhaW5lckhvc3RJbmRleCA9IGVtYmVkZGVkVmlld1tDT05UQUlORVJfSU5ERVhdO1xuICAgIHJldHVybiBjb250YWluZXJIb3N0SW5kZXggPiAtMSA/IGVtYmVkZGVkVmlld1tQQVJFTlRdICFbY29udGFpbmVySG9zdEluZGV4XSA6IG51bGw7XG4gIH0gZWxzZSB7XG4gICAgLy8gVGhpcyBpcyBhIGlubGluZSB2aWV3IG5vZGUgKGUuZy4gZW1iZWRkZWRWaWV3U3RhcnQpXG4gICAgcmV0dXJuIGVtYmVkZGVkVmlld1tQQVJFTlRdICFbdE5vZGUucGFyZW50ICEuaW5kZXhdIGFzIExDb250YWluZXI7XG4gIH1cbn1cblxuXG4vKipcbiAqIFJldHJpZXZlcyByZW5kZXIgcGFyZW50IGZvciBhIGdpdmVuIHZpZXcuXG4gKiBNaWdodCBiZSBudWxsIGlmIGEgdmlldyBpcyBub3QgeWV0IGF0dGFjaGVkIHRvIGFueSBjb250YWluZXIuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRDb250YWluZXJSZW5kZXJQYXJlbnQodFZpZXdOb2RlOiBUVmlld05vZGUsIHZpZXc6IExWaWV3KTogUkVsZW1lbnR8bnVsbCB7XG4gIGNvbnN0IGNvbnRhaW5lciA9IGdldExDb250YWluZXIodFZpZXdOb2RlLCB2aWV3KTtcbiAgcmV0dXJuIGNvbnRhaW5lciA/IGNvbnRhaW5lcltSRU5ERVJfUEFSRU5UXSA6IG51bGw7XG59XG5cbmNvbnN0IGVudW0gV2Fsa1ROb2RlVHJlZUFjdGlvbiB7XG4gIC8qKiBub2RlIGluc2VydCBpbiB0aGUgbmF0aXZlIGVudmlyb25tZW50ICovXG4gIEluc2VydCA9IDAsXG5cbiAgLyoqIG5vZGUgZGV0YWNoIGZyb20gdGhlIG5hdGl2ZSBlbnZpcm9ubWVudCAqL1xuICBEZXRhY2ggPSAxLFxuXG4gIC8qKiBub2RlIGRlc3RydWN0aW9uIHVzaW5nIHRoZSByZW5kZXJlcidzIEFQSSAqL1xuICBEZXN0cm95ID0gMixcbn1cblxuXG4vKipcbiAqIFN0YWNrIHVzZWQgdG8ga2VlcCB0cmFjayBvZiBwcm9qZWN0aW9uIG5vZGVzIGluIHdhbGtUTm9kZVRyZWUuXG4gKlxuICogVGhpcyBpcyBkZWxpYmVyYXRlbHkgY3JlYXRlZCBvdXRzaWRlIG9mIHdhbGtUTm9kZVRyZWUgdG8gYXZvaWQgYWxsb2NhdGluZ1xuICogYSBuZXcgYXJyYXkgZWFjaCB0aW1lIHRoZSBmdW5jdGlvbiBpcyBjYWxsZWQuIEluc3RlYWQgdGhlIGFycmF5IHdpbGwgYmVcbiAqIHJlLXVzZWQgYnkgZWFjaCBpbnZvY2F0aW9uLiBUaGlzIHdvcmtzIGJlY2F1c2UgdGhlIGZ1bmN0aW9uIGlzIG5vdCByZWVudHJhbnQuXG4gKi9cbmNvbnN0IHByb2plY3Rpb25Ob2RlU3RhY2s6IChMVmlldyB8IFROb2RlKVtdID0gW107XG5cbi8qKlxuICogV2Fsa3MgYSB0cmVlIG9mIFROb2RlcywgYXBwbHlpbmcgYSB0cmFuc2Zvcm1hdGlvbiBvbiB0aGUgZWxlbWVudCBub2RlcywgZWl0aGVyIG9ubHkgb24gdGhlIGZpcnN0XG4gKiBvbmUgZm91bmQsIG9yIG9uIGFsbCBvZiB0aGVtLlxuICpcbiAqIEBwYXJhbSB2aWV3VG9XYWxrIHRoZSB2aWV3IHRvIHdhbGtcbiAqIEBwYXJhbSBhY3Rpb24gaWRlbnRpZmllcyB0aGUgYWN0aW9uIHRvIGJlIHBlcmZvcm1lZCBvbiB0aGUgZWxlbWVudHNcbiAqIEBwYXJhbSByZW5kZXJlciB0aGUgY3VycmVudCByZW5kZXJlci5cbiAqIEBwYXJhbSByZW5kZXJQYXJlbnQgT3B0aW9uYWwgdGhlIHJlbmRlciBwYXJlbnQgbm9kZSB0byBiZSBzZXQgaW4gYWxsIExDb250YWluZXJzIGZvdW5kLFxuICogcmVxdWlyZWQgZm9yIGFjdGlvbiBtb2RlcyBJbnNlcnQgYW5kIERlc3Ryb3kuXG4gKiBAcGFyYW0gYmVmb3JlTm9kZSBPcHRpb25hbCB0aGUgbm9kZSBiZWZvcmUgd2hpY2ggZWxlbWVudHMgc2hvdWxkIGJlIGFkZGVkLCByZXF1aXJlZCBmb3IgYWN0aW9uXG4gKiBJbnNlcnQuXG4gKi9cbmZ1bmN0aW9uIHdhbGtUTm9kZVRyZWUoXG4gICAgdmlld1RvV2FsazogTFZpZXcsIGFjdGlvbjogV2Fsa1ROb2RlVHJlZUFjdGlvbiwgcmVuZGVyZXI6IFJlbmRlcmVyMyxcbiAgICByZW5kZXJQYXJlbnQ6IFJFbGVtZW50IHwgbnVsbCwgYmVmb3JlTm9kZT86IFJOb2RlIHwgbnVsbCkge1xuICBjb25zdCByb290VE5vZGUgPSB2aWV3VG9XYWxrW1RWSUVXXS5ub2RlIGFzIFRWaWV3Tm9kZTtcbiAgbGV0IHByb2plY3Rpb25Ob2RlSW5kZXggPSAtMTtcbiAgbGV0IGN1cnJlbnRWaWV3ID0gdmlld1RvV2FsaztcbiAgbGV0IHROb2RlOiBUTm9kZXxudWxsID0gcm9vdFROb2RlLmNoaWxkIGFzIFROb2RlO1xuICB3aGlsZSAodE5vZGUpIHtcbiAgICBsZXQgbmV4dFROb2RlOiBUTm9kZXxudWxsID0gbnVsbDtcbiAgICBpZiAodE5vZGUudHlwZSA9PT0gVE5vZGVUeXBlLkVsZW1lbnQpIHtcbiAgICAgIGV4ZWN1dGVOb2RlQWN0aW9uKFxuICAgICAgICAgIGFjdGlvbiwgcmVuZGVyZXIsIHJlbmRlclBhcmVudCwgZ2V0TmF0aXZlQnlUTm9kZSh0Tm9kZSwgY3VycmVudFZpZXcpLCBiZWZvcmVOb2RlKTtcbiAgICAgIGNvbnN0IG5vZGVPckNvbnRhaW5lciA9IGN1cnJlbnRWaWV3W3ROb2RlLmluZGV4XTtcbiAgICAgIGlmIChpc0xDb250YWluZXIobm9kZU9yQ29udGFpbmVyKSkge1xuICAgICAgICAvLyBUaGlzIGVsZW1lbnQgaGFzIGFuIExDb250YWluZXIsIGFuZCBpdHMgY29tbWVudCBuZWVkcyB0byBiZSBoYW5kbGVkXG4gICAgICAgIGV4ZWN1dGVOb2RlQWN0aW9uKGFjdGlvbiwgcmVuZGVyZXIsIHJlbmRlclBhcmVudCwgbm9kZU9yQ29udGFpbmVyW05BVElWRV0sIGJlZm9yZU5vZGUpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodE5vZGUudHlwZSA9PT0gVE5vZGVUeXBlLkNvbnRhaW5lcikge1xuICAgICAgY29uc3QgbENvbnRhaW5lciA9IGN1cnJlbnRWaWV3ICFbdE5vZGUuaW5kZXhdIGFzIExDb250YWluZXI7XG4gICAgICBleGVjdXRlTm9kZUFjdGlvbihhY3Rpb24sIHJlbmRlcmVyLCByZW5kZXJQYXJlbnQsIGxDb250YWluZXJbTkFUSVZFXSwgYmVmb3JlTm9kZSk7XG5cbiAgICAgIGlmIChyZW5kZXJQYXJlbnQpIGxDb250YWluZXJbUkVOREVSX1BBUkVOVF0gPSByZW5kZXJQYXJlbnQ7XG5cbiAgICAgIGlmIChsQ29udGFpbmVyW1ZJRVdTXS5sZW5ndGgpIHtcbiAgICAgICAgY3VycmVudFZpZXcgPSBsQ29udGFpbmVyW1ZJRVdTXVswXTtcbiAgICAgICAgbmV4dFROb2RlID0gY3VycmVudFZpZXdbVFZJRVddLm5vZGU7XG5cbiAgICAgICAgLy8gV2hlbiB0aGUgd2Fsa2VyIGVudGVycyBhIGNvbnRhaW5lciwgdGhlbiB0aGUgYmVmb3JlTm9kZSBoYXMgdG8gYmVjb21lIHRoZSBsb2NhbCBuYXRpdmVcbiAgICAgICAgLy8gY29tbWVudCBub2RlLlxuICAgICAgICBiZWZvcmVOb2RlID0gbENvbnRhaW5lcltOQVRJVkVdO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodE5vZGUudHlwZSA9PT0gVE5vZGVUeXBlLlByb2plY3Rpb24pIHtcbiAgICAgIGNvbnN0IGNvbXBvbmVudFZpZXcgPSBmaW5kQ29tcG9uZW50VmlldyhjdXJyZW50VmlldyAhKTtcbiAgICAgIGNvbnN0IGNvbXBvbmVudEhvc3QgPSBjb21wb25lbnRWaWV3W0hPU1RfTk9ERV0gYXMgVEVsZW1lbnROb2RlO1xuICAgICAgY29uc3QgaGVhZDogVE5vZGV8bnVsbCA9XG4gICAgICAgICAgKGNvbXBvbmVudEhvc3QucHJvamVjdGlvbiBhcyhUTm9kZSB8IG51bGwpW10pW3ROb2RlLnByb2plY3Rpb24gYXMgbnVtYmVyXTtcblxuICAgICAgLy8gTXVzdCBzdG9yZSBib3RoIHRoZSBUTm9kZSBhbmQgdGhlIHZpZXcgYmVjYXVzZSB0aGlzIHByb2plY3Rpb24gbm9kZSBjb3VsZCBiZSBuZXN0ZWRcbiAgICAgIC8vIGRlZXBseSBpbnNpZGUgZW1iZWRkZWQgdmlld3MsIGFuZCB3ZSBuZWVkIHRvIGdldCBiYWNrIGRvd24gdG8gdGhpcyBwYXJ0aWN1bGFyIG5lc3RlZCB2aWV3LlxuICAgICAgcHJvamVjdGlvbk5vZGVTdGFja1srK3Byb2plY3Rpb25Ob2RlSW5kZXhdID0gdE5vZGU7XG4gICAgICBwcm9qZWN0aW9uTm9kZVN0YWNrWysrcHJvamVjdGlvbk5vZGVJbmRleF0gPSBjdXJyZW50VmlldyAhO1xuICAgICAgaWYgKGhlYWQpIHtcbiAgICAgICAgY3VycmVudFZpZXcgPSBjb21wb25lbnRWaWV3W1BBUkVOVF0gITtcbiAgICAgICAgbmV4dFROb2RlID0gY3VycmVudFZpZXdbVFZJRVddLmRhdGFbaGVhZC5pbmRleF0gYXMgVE5vZGU7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIE90aGVyd2lzZSwgdGhpcyBpcyBhIFZpZXcgb3IgYW4gRWxlbWVudENvbnRhaW5lclxuICAgICAgbmV4dFROb2RlID0gdE5vZGUuY2hpbGQ7XG4gICAgfVxuXG4gICAgaWYgKG5leHRUTm9kZSA9PT0gbnVsbCkge1xuICAgICAgLy8gdGhpcyBsYXN0IG5vZGUgd2FzIHByb2plY3RlZCwgd2UgbmVlZCB0byBnZXQgYmFjayBkb3duIHRvIGl0cyBwcm9qZWN0aW9uIG5vZGVcbiAgICAgIGlmICh0Tm9kZS5uZXh0ID09PSBudWxsICYmICh0Tm9kZS5mbGFncyAmIFROb2RlRmxhZ3MuaXNQcm9qZWN0ZWQpKSB7XG4gICAgICAgIGN1cnJlbnRWaWV3ID0gcHJvamVjdGlvbk5vZGVTdGFja1twcm9qZWN0aW9uTm9kZUluZGV4LS1dIGFzIExWaWV3O1xuICAgICAgICB0Tm9kZSA9IHByb2plY3Rpb25Ob2RlU3RhY2tbcHJvamVjdGlvbk5vZGVJbmRleC0tXSBhcyBUTm9kZTtcbiAgICAgIH1cbiAgICAgIG5leHRUTm9kZSA9IHROb2RlLm5leHQ7XG5cbiAgICAgIC8qKlxuICAgICAgICogRmluZCB0aGUgbmV4dCBub2RlIGluIHRoZSBUTm9kZSB0cmVlLCB0YWtpbmcgaW50byBhY2NvdW50IHRoZSBwbGFjZSB3aGVyZSBhIG5vZGUgaXNcbiAgICAgICAqIHByb2plY3RlZCAoaW4gdGhlIHNoYWRvdyBET00pIHJhdGhlciB0aGFuIHdoZXJlIGl0IGNvbWVzIGZyb20gKGluIHRoZSBsaWdodCBET00pLlxuICAgICAgICpcbiAgICAgICAqIElmIHRoZXJlIGlzIG5vIHNpYmxpbmcgbm9kZSwgdGhlbiBpdCBnb2VzIHRvIHRoZSBuZXh0IHNpYmxpbmcgb2YgdGhlIHBhcmVudCBub2RlLi4uXG4gICAgICAgKiB1bnRpbCBpdCByZWFjaGVzIHJvb3ROb2RlIChhdCB3aGljaCBwb2ludCBudWxsIGlzIHJldHVybmVkKS5cbiAgICAgICAqL1xuICAgICAgd2hpbGUgKCFuZXh0VE5vZGUpIHtcbiAgICAgICAgLy8gSWYgcGFyZW50IGlzIG51bGwsIHdlJ3JlIGNyb3NzaW5nIHRoZSB2aWV3IGJvdW5kYXJ5LCBzbyB3ZSBzaG91bGQgZ2V0IHRoZSBob3N0IFROb2RlLlxuICAgICAgICB0Tm9kZSA9IHROb2RlLnBhcmVudCB8fCBjdXJyZW50Vmlld1tUVklFV10ubm9kZTtcblxuICAgICAgICBpZiAodE5vZGUgPT09IG51bGwgfHwgdE5vZGUgPT09IHJvb3RUTm9kZSkgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgLy8gV2hlbiBleGl0aW5nIGEgY29udGFpbmVyLCB0aGUgYmVmb3JlTm9kZSBtdXN0IGJlIHJlc3RvcmVkIHRvIHRoZSBwcmV2aW91cyB2YWx1ZVxuICAgICAgICBpZiAodE5vZGUudHlwZSA9PT0gVE5vZGVUeXBlLkNvbnRhaW5lcikge1xuICAgICAgICAgIGN1cnJlbnRWaWV3ID0gY3VycmVudFZpZXdbUEFSRU5UXSAhO1xuICAgICAgICAgIGJlZm9yZU5vZGUgPSBjdXJyZW50Vmlld1t0Tm9kZS5pbmRleF1bTkFUSVZFXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0Tm9kZS50eXBlID09PSBUTm9kZVR5cGUuVmlldyAmJiBjdXJyZW50Vmlld1tORVhUXSkge1xuICAgICAgICAgIGN1cnJlbnRWaWV3ID0gY3VycmVudFZpZXdbTkVYVF0gYXMgTFZpZXc7XG4gICAgICAgICAgbmV4dFROb2RlID0gY3VycmVudFZpZXdbVFZJRVddLm5vZGU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbmV4dFROb2RlID0gdE5vZGUubmV4dDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICB0Tm9kZSA9IG5leHRUTm9kZTtcbiAgfVxufVxuXG4vKipcbiAqIE5PVEU6IGZvciBwZXJmb3JtYW5jZSByZWFzb25zLCB0aGUgcG9zc2libGUgYWN0aW9ucyBhcmUgaW5saW5lZCB3aXRoaW4gdGhlIGZ1bmN0aW9uIGluc3RlYWQgb2ZcbiAqIGJlaW5nIHBhc3NlZCBhcyBhbiBhcmd1bWVudC5cbiAqL1xuZnVuY3Rpb24gZXhlY3V0ZU5vZGVBY3Rpb24oXG4gICAgYWN0aW9uOiBXYWxrVE5vZGVUcmVlQWN0aW9uLCByZW5kZXJlcjogUmVuZGVyZXIzLCBwYXJlbnQ6IFJFbGVtZW50IHwgbnVsbCxcbiAgICBub2RlOiBSQ29tbWVudCB8IFJFbGVtZW50IHwgUlRleHQsIGJlZm9yZU5vZGU/OiBSTm9kZSB8IG51bGwpIHtcbiAgaWYgKGFjdGlvbiA9PT0gV2Fsa1ROb2RlVHJlZUFjdGlvbi5JbnNlcnQpIHtcbiAgICBpc1Byb2NlZHVyYWxSZW5kZXJlcihyZW5kZXJlciAhKSA/XG4gICAgICAgIChyZW5kZXJlciBhcyBQcm9jZWR1cmFsUmVuZGVyZXIzKS5pbnNlcnRCZWZvcmUocGFyZW50ICEsIG5vZGUsIGJlZm9yZU5vZGUgYXMgUk5vZGUgfCBudWxsKSA6XG4gICAgICAgIHBhcmVudCAhLmluc2VydEJlZm9yZShub2RlLCBiZWZvcmVOb2RlIGFzIFJOb2RlIHwgbnVsbCwgdHJ1ZSk7XG4gIH0gZWxzZSBpZiAoYWN0aW9uID09PSBXYWxrVE5vZGVUcmVlQWN0aW9uLkRldGFjaCkge1xuICAgIGlzUHJvY2VkdXJhbFJlbmRlcmVyKHJlbmRlcmVyICEpID9cbiAgICAgICAgKHJlbmRlcmVyIGFzIFByb2NlZHVyYWxSZW5kZXJlcjMpLnJlbW92ZUNoaWxkKHBhcmVudCAhLCBub2RlKSA6XG4gICAgICAgIHBhcmVudCAhLnJlbW92ZUNoaWxkKG5vZGUpO1xuICB9IGVsc2UgaWYgKGFjdGlvbiA9PT0gV2Fsa1ROb2RlVHJlZUFjdGlvbi5EZXN0cm95KSB7XG4gICAgbmdEZXZNb2RlICYmIG5nRGV2TW9kZS5yZW5kZXJlckRlc3Ryb3lOb2RlKys7XG4gICAgKHJlbmRlcmVyIGFzIFByb2NlZHVyYWxSZW5kZXJlcjMpLmRlc3Ryb3lOb2RlICEobm9kZSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVRleHROb2RlKHZhbHVlOiBhbnksIHJlbmRlcmVyOiBSZW5kZXJlcjMpOiBSVGV4dCB7XG4gIHJldHVybiBpc1Byb2NlZHVyYWxSZW5kZXJlcihyZW5kZXJlcikgPyByZW5kZXJlci5jcmVhdGVUZXh0KHN0cmluZ2lmeSh2YWx1ZSkpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlcmVyLmNyZWF0ZVRleHROb2RlKHN0cmluZ2lmeSh2YWx1ZSkpO1xufVxuXG4vKipcbiAqIEFkZHMgb3IgcmVtb3ZlcyBhbGwgRE9NIGVsZW1lbnRzIGFzc29jaWF0ZWQgd2l0aCBhIHZpZXcuXG4gKlxuICogQmVjYXVzZSBzb21lIHJvb3Qgbm9kZXMgb2YgdGhlIHZpZXcgbWF5IGJlIGNvbnRhaW5lcnMsIHdlIHNvbWV0aW1lcyBuZWVkXG4gKiB0byBwcm9wYWdhdGUgZGVlcGx5IGludG8gdGhlIG5lc3RlZCBjb250YWluZXJzIHRvIHJlbW92ZSBhbGwgZWxlbWVudHMgaW4gdGhlXG4gKiB2aWV3cyBiZW5lYXRoIGl0LlxuICpcbiAqIEBwYXJhbSB2aWV3VG9XYWxrIFRoZSB2aWV3IGZyb20gd2hpY2ggZWxlbWVudHMgc2hvdWxkIGJlIGFkZGVkIG9yIHJlbW92ZWRcbiAqIEBwYXJhbSBpbnNlcnRNb2RlIFdoZXRoZXIgb3Igbm90IGVsZW1lbnRzIHNob3VsZCBiZSBhZGRlZCAoaWYgZmFsc2UsIHJlbW92aW5nKVxuICogQHBhcmFtIGJlZm9yZU5vZGUgVGhlIG5vZGUgYmVmb3JlIHdoaWNoIGVsZW1lbnRzIHNob3VsZCBiZSBhZGRlZCwgaWYgaW5zZXJ0IG1vZGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZFJlbW92ZVZpZXdGcm9tQ29udGFpbmVyKFxuICAgIHZpZXdUb1dhbGs6IExWaWV3LCBpbnNlcnRNb2RlOiB0cnVlLCBiZWZvcmVOb2RlOiBSTm9kZSB8IG51bGwpOiB2b2lkO1xuZXhwb3J0IGZ1bmN0aW9uIGFkZFJlbW92ZVZpZXdGcm9tQ29udGFpbmVyKHZpZXdUb1dhbGs6IExWaWV3LCBpbnNlcnRNb2RlOiBmYWxzZSk6IHZvaWQ7XG5leHBvcnQgZnVuY3Rpb24gYWRkUmVtb3ZlVmlld0Zyb21Db250YWluZXIoXG4gICAgdmlld1RvV2FsazogTFZpZXcsIGluc2VydE1vZGU6IGJvb2xlYW4sIGJlZm9yZU5vZGU/OiBSTm9kZSB8IG51bGwpOiB2b2lkIHtcbiAgY29uc3QgcmVuZGVyUGFyZW50ID0gZ2V0Q29udGFpbmVyUmVuZGVyUGFyZW50KHZpZXdUb1dhbGtbVFZJRVddLm5vZGUgYXMgVFZpZXdOb2RlLCB2aWV3VG9XYWxrKTtcbiAgbmdEZXZNb2RlICYmIGFzc2VydE5vZGVUeXBlKHZpZXdUb1dhbGtbVFZJRVddLm5vZGUgYXMgVE5vZGUsIFROb2RlVHlwZS5WaWV3KTtcbiAgaWYgKHJlbmRlclBhcmVudCkge1xuICAgIGNvbnN0IHJlbmRlcmVyID0gdmlld1RvV2Fsa1tSRU5ERVJFUl07XG4gICAgd2Fsa1ROb2RlVHJlZShcbiAgICAgICAgdmlld1RvV2FsaywgaW5zZXJ0TW9kZSA/IFdhbGtUTm9kZVRyZWVBY3Rpb24uSW5zZXJ0IDogV2Fsa1ROb2RlVHJlZUFjdGlvbi5EZXRhY2gsIHJlbmRlcmVyLFxuICAgICAgICByZW5kZXJQYXJlbnQsIGJlZm9yZU5vZGUpO1xuICB9XG59XG5cbi8qKlxuICogVHJhdmVyc2VzIGRvd24gYW5kIHVwIHRoZSB0cmVlIG9mIHZpZXdzIGFuZCBjb250YWluZXJzIHRvIHJlbW92ZSBsaXN0ZW5lcnMgYW5kXG4gKiBjYWxsIG9uRGVzdHJveSBjYWxsYmFja3MuXG4gKlxuICogTm90ZXM6XG4gKiAgLSBCZWNhdXNlIGl0J3MgdXNlZCBmb3Igb25EZXN0cm95IGNhbGxzLCBpdCBuZWVkcyB0byBiZSBib3R0b20tdXAuXG4gKiAgLSBNdXN0IHByb2Nlc3MgY29udGFpbmVycyBpbnN0ZWFkIG9mIHRoZWlyIHZpZXdzIHRvIGF2b2lkIHNwbGljaW5nXG4gKiAgd2hlbiB2aWV3cyBhcmUgZGVzdHJveWVkIGFuZCByZS1hZGRlZC5cbiAqICAtIFVzaW5nIGEgd2hpbGUgbG9vcCBiZWNhdXNlIGl0J3MgZmFzdGVyIHRoYW4gcmVjdXJzaW9uXG4gKiAgLSBEZXN0cm95IG9ubHkgY2FsbGVkIG9uIG1vdmVtZW50IHRvIHNpYmxpbmcgb3IgbW92ZW1lbnQgdG8gcGFyZW50IChsYXRlcmFsbHkgb3IgdXApXG4gKlxuICogIEBwYXJhbSByb290VmlldyBUaGUgdmlldyB0byBkZXN0cm95XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZXN0cm95Vmlld1RyZWUocm9vdFZpZXc6IExWaWV3KTogdm9pZCB7XG4gIC8vIElmIHRoZSB2aWV3IGhhcyBubyBjaGlsZHJlbiwgd2UgY2FuIGNsZWFuIGl0IHVwIGFuZCByZXR1cm4gZWFybHkuXG4gIGlmIChyb290Vmlld1tUVklFV10uY2hpbGRJbmRleCA9PT0gLTEpIHtcbiAgICByZXR1cm4gY2xlYW5VcFZpZXcocm9vdFZpZXcpO1xuICB9XG4gIGxldCB2aWV3T3JDb250YWluZXI6IExWaWV3fExDb250YWluZXJ8bnVsbCA9IGdldExWaWV3Q2hpbGQocm9vdFZpZXcpO1xuXG4gIHdoaWxlICh2aWV3T3JDb250YWluZXIpIHtcbiAgICBsZXQgbmV4dDogTFZpZXd8TENvbnRhaW5lcnxudWxsID0gbnVsbDtcblxuICAgIGlmICh2aWV3T3JDb250YWluZXIubGVuZ3RoID49IEhFQURFUl9PRkZTRVQpIHtcbiAgICAgIC8vIElmIExWaWV3LCB0cmF2ZXJzZSBkb3duIHRvIGNoaWxkLlxuICAgICAgY29uc3QgdmlldyA9IHZpZXdPckNvbnRhaW5lciBhcyBMVmlldztcbiAgICAgIGlmICh2aWV3W1RWSUVXXS5jaGlsZEluZGV4ID4gLTEpIG5leHQgPSBnZXRMVmlld0NoaWxkKHZpZXcpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJZiBjb250YWluZXIsIHRyYXZlcnNlIGRvd24gdG8gaXRzIGZpcnN0IExWaWV3LlxuICAgICAgY29uc3QgY29udGFpbmVyID0gdmlld09yQ29udGFpbmVyIGFzIExDb250YWluZXI7XG4gICAgICBpZiAoY29udGFpbmVyW1ZJRVdTXS5sZW5ndGgpIG5leHQgPSBjb250YWluZXJbVklFV1NdWzBdO1xuICAgIH1cblxuICAgIGlmIChuZXh0ID09IG51bGwpIHtcbiAgICAgIC8vIE9ubHkgY2xlYW4gdXAgdmlldyB3aGVuIG1vdmluZyB0byB0aGUgc2lkZSBvciB1cCwgYXMgZGVzdHJveSBob29rc1xuICAgICAgLy8gc2hvdWxkIGJlIGNhbGxlZCBpbiBvcmRlciBmcm9tIHRoZSBib3R0b20gdXAuXG4gICAgICB3aGlsZSAodmlld09yQ29udGFpbmVyICYmICF2aWV3T3JDb250YWluZXIgIVtORVhUXSAmJiB2aWV3T3JDb250YWluZXIgIT09IHJvb3RWaWV3KSB7XG4gICAgICAgIGNsZWFuVXBWaWV3KHZpZXdPckNvbnRhaW5lcik7XG4gICAgICAgIHZpZXdPckNvbnRhaW5lciA9IGdldFBhcmVudFN0YXRlKHZpZXdPckNvbnRhaW5lciwgcm9vdFZpZXcpO1xuICAgICAgfVxuICAgICAgY2xlYW5VcFZpZXcodmlld09yQ29udGFpbmVyIHx8IHJvb3RWaWV3KTtcbiAgICAgIG5leHQgPSB2aWV3T3JDb250YWluZXIgJiYgdmlld09yQ29udGFpbmVyICFbTkVYVF07XG4gICAgfVxuICAgIHZpZXdPckNvbnRhaW5lciA9IG5leHQ7XG4gIH1cbn1cblxuLyoqXG4gKiBJbnNlcnRzIGEgdmlldyBpbnRvIGEgY29udGFpbmVyLlxuICpcbiAqIFRoaXMgYWRkcyB0aGUgdmlldyB0byB0aGUgY29udGFpbmVyJ3MgYXJyYXkgb2YgYWN0aXZlIHZpZXdzIGluIHRoZSBjb3JyZWN0XG4gKiBwb3NpdGlvbi4gSXQgYWxzbyBhZGRzIHRoZSB2aWV3J3MgZWxlbWVudHMgdG8gdGhlIERPTSBpZiB0aGUgY29udGFpbmVyIGlzbid0IGFcbiAqIHJvb3Qgbm9kZSBvZiBhbm90aGVyIHZpZXcgKGluIHRoYXQgY2FzZSwgdGhlIHZpZXcncyBlbGVtZW50cyB3aWxsIGJlIGFkZGVkIHdoZW5cbiAqIHRoZSBjb250YWluZXIncyBwYXJlbnQgdmlldyBpcyBhZGRlZCBsYXRlcikuXG4gKlxuICogQHBhcmFtIGxWaWV3IFRoZSB2aWV3IHRvIGluc2VydFxuICogQHBhcmFtIGxDb250YWluZXIgVGhlIGNvbnRhaW5lciBpbnRvIHdoaWNoIHRoZSB2aWV3IHNob3VsZCBiZSBpbnNlcnRlZFxuICogQHBhcmFtIHBhcmVudFZpZXcgVGhlIG5ldyBwYXJlbnQgb2YgdGhlIGluc2VydGVkIHZpZXdcbiAqIEBwYXJhbSBpbmRleCBUaGUgaW5kZXggYXQgd2hpY2ggdG8gaW5zZXJ0IHRoZSB2aWV3XG4gKiBAcGFyYW0gY29udGFpbmVySW5kZXggVGhlIGluZGV4IG9mIHRoZSBjb250YWluZXIgbm9kZSwgaWYgZHluYW1pY1xuICovXG5leHBvcnQgZnVuY3Rpb24gaW5zZXJ0VmlldyhcbiAgICBsVmlldzogTFZpZXcsIGxDb250YWluZXI6IExDb250YWluZXIsIHBhcmVudFZpZXc6IExWaWV3LCBpbmRleDogbnVtYmVyLFxuICAgIGNvbnRhaW5lckluZGV4OiBudW1iZXIpIHtcbiAgY29uc3Qgdmlld3MgPSBsQ29udGFpbmVyW1ZJRVdTXTtcblxuICBpZiAoaW5kZXggPiAwKSB7XG4gICAgLy8gVGhpcyBpcyBhIG5ldyB2aWV3LCB3ZSBuZWVkIHRvIGFkZCBpdCB0byB0aGUgY2hpbGRyZW4uXG4gICAgdmlld3NbaW5kZXggLSAxXVtORVhUXSA9IGxWaWV3O1xuICB9XG5cbiAgaWYgKGluZGV4IDwgdmlld3MubGVuZ3RoKSB7XG4gICAgbFZpZXdbTkVYVF0gPSB2aWV3c1tpbmRleF07XG4gICAgdmlld3Muc3BsaWNlKGluZGV4LCAwLCBsVmlldyk7XG4gIH0gZWxzZSB7XG4gICAgdmlld3MucHVzaChsVmlldyk7XG4gICAgbFZpZXdbTkVYVF0gPSBudWxsO1xuICB9XG5cbiAgLy8gRHluYW1pY2FsbHkgaW5zZXJ0ZWQgdmlld3MgbmVlZCBhIHJlZmVyZW5jZSB0byB0aGVpciBwYXJlbnQgY29udGFpbmVyJ3MgaG9zdCBzbyBpdCdzXG4gIC8vIHBvc3NpYmxlIHRvIGp1bXAgZnJvbSBhIHZpZXcgdG8gaXRzIGNvbnRhaW5lcidzIG5leHQgd2hlbiB3YWxraW5nIHRoZSBub2RlIHRyZWUuXG4gIGlmIChjb250YWluZXJJbmRleCA+IC0xKSB7XG4gICAgbFZpZXdbQ09OVEFJTkVSX0lOREVYXSA9IGNvbnRhaW5lckluZGV4O1xuICAgIGxWaWV3W1BBUkVOVF0gPSBwYXJlbnRWaWV3O1xuICB9XG5cbiAgLy8gTm90aWZ5IHF1ZXJ5IHRoYXQgYSBuZXcgdmlldyBoYXMgYmVlbiBhZGRlZFxuICBpZiAobFZpZXdbUVVFUklFU10pIHtcbiAgICBsVmlld1tRVUVSSUVTXSAhLmluc2VydFZpZXcoaW5kZXgpO1xuICB9XG5cbiAgLy8gU2V0cyB0aGUgYXR0YWNoZWQgZmxhZ1xuICBsVmlld1tGTEFHU10gfD0gTFZpZXdGbGFncy5BdHRhY2hlZDtcbn1cblxuLyoqXG4gKiBEZXRhY2hlcyBhIHZpZXcgZnJvbSBhIGNvbnRhaW5lci5cbiAqXG4gKiBUaGlzIG1ldGhvZCBzcGxpY2VzIHRoZSB2aWV3IGZyb20gdGhlIGNvbnRhaW5lcidzIGFycmF5IG9mIGFjdGl2ZSB2aWV3cy4gSXQgYWxzb1xuICogcmVtb3ZlcyB0aGUgdmlldydzIGVsZW1lbnRzIGZyb20gdGhlIERPTS5cbiAqXG4gKiBAcGFyYW0gbENvbnRhaW5lciBUaGUgY29udGFpbmVyIGZyb20gd2hpY2ggdG8gZGV0YWNoIGEgdmlld1xuICogQHBhcmFtIHJlbW92ZUluZGV4IFRoZSBpbmRleCBvZiB0aGUgdmlldyB0byBkZXRhY2hcbiAqIEBwYXJhbSBkZXRhY2hlZCBXaGV0aGVyIG9yIG5vdCB0aGlzIHZpZXcgaXMgYWxyZWFkeSBkZXRhY2hlZC5cbiAqIEByZXR1cm5zIERldGFjaGVkIExWaWV3IGluc3RhbmNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZGV0YWNoVmlldyhsQ29udGFpbmVyOiBMQ29udGFpbmVyLCByZW1vdmVJbmRleDogbnVtYmVyLCBkZXRhY2hlZDogYm9vbGVhbik6IExWaWV3IHtcbiAgY29uc3Qgdmlld3MgPSBsQ29udGFpbmVyW1ZJRVdTXTtcbiAgY29uc3Qgdmlld1RvRGV0YWNoID0gdmlld3NbcmVtb3ZlSW5kZXhdO1xuICBpZiAocmVtb3ZlSW5kZXggPiAwKSB7XG4gICAgdmlld3NbcmVtb3ZlSW5kZXggLSAxXVtORVhUXSA9IHZpZXdUb0RldGFjaFtORVhUXSBhcyBMVmlldztcbiAgfVxuICB2aWV3cy5zcGxpY2UocmVtb3ZlSW5kZXgsIDEpO1xuICBpZiAoIWRldGFjaGVkKSB7XG4gICAgYWRkUmVtb3ZlVmlld0Zyb21Db250YWluZXIodmlld1RvRGV0YWNoLCBmYWxzZSk7XG4gIH1cblxuICBpZiAodmlld1RvRGV0YWNoW1FVRVJJRVNdKSB7XG4gICAgdmlld1RvRGV0YWNoW1FVRVJJRVNdICEucmVtb3ZlVmlldygpO1xuICB9XG4gIHZpZXdUb0RldGFjaFtDT05UQUlORVJfSU5ERVhdID0gLTE7XG4gIHZpZXdUb0RldGFjaFtQQVJFTlRdID0gbnVsbDtcbiAgLy8gVW5zZXRzIHRoZSBhdHRhY2hlZCBmbGFnXG4gIHZpZXdUb0RldGFjaFtGTEFHU10gJj0gfkxWaWV3RmxhZ3MuQXR0YWNoZWQ7XG4gIHJldHVybiB2aWV3VG9EZXRhY2g7XG59XG5cbi8qKlxuICogUmVtb3ZlcyBhIHZpZXcgZnJvbSBhIGNvbnRhaW5lciwgaS5lLiBkZXRhY2hlcyBpdCBhbmQgdGhlbiBkZXN0cm95cyB0aGUgdW5kZXJseWluZyBMVmlldy5cbiAqXG4gKiBAcGFyYW0gbENvbnRhaW5lciBUaGUgY29udGFpbmVyIGZyb20gd2hpY2ggdG8gcmVtb3ZlIGEgdmlld1xuICogQHBhcmFtIHRDb250YWluZXIgVGhlIFRDb250YWluZXIgbm9kZSBhc3NvY2lhdGVkIHdpdGggdGhlIExDb250YWluZXJcbiAqIEBwYXJhbSByZW1vdmVJbmRleCBUaGUgaW5kZXggb2YgdGhlIHZpZXcgdG8gcmVtb3ZlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVWaWV3KFxuICAgIGxDb250YWluZXI6IExDb250YWluZXIsIGNvbnRhaW5lckhvc3Q6IFRFbGVtZW50Tm9kZSB8IFRDb250YWluZXJOb2RlIHwgVEVsZW1lbnRDb250YWluZXJOb2RlLFxuICAgIHJlbW92ZUluZGV4OiBudW1iZXIpIHtcbiAgY29uc3QgdmlldyA9IGxDb250YWluZXJbVklFV1NdW3JlbW92ZUluZGV4XTtcbiAgZGV0YWNoVmlldyhsQ29udGFpbmVyLCByZW1vdmVJbmRleCwgISFjb250YWluZXJIb3N0LmRldGFjaGVkKTtcbiAgZGVzdHJveUxWaWV3KHZpZXcpO1xufVxuXG4vKiogR2V0cyB0aGUgY2hpbGQgb2YgdGhlIGdpdmVuIExWaWV3ICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TFZpZXdDaGlsZChsVmlldzogTFZpZXcpOiBMVmlld3xMQ29udGFpbmVyfG51bGwge1xuICBjb25zdCBjaGlsZEluZGV4ID0gbFZpZXdbVFZJRVddLmNoaWxkSW5kZXg7XG4gIHJldHVybiBjaGlsZEluZGV4ID09PSAtMSA/IG51bGwgOiBsVmlld1tjaGlsZEluZGV4XTtcbn1cblxuLyoqXG4gKiBBIHN0YW5kYWxvbmUgZnVuY3Rpb24gd2hpY2ggZGVzdHJveXMgYW4gTFZpZXcsXG4gKiBjb25kdWN0aW5nIGNsZWFudXAgKGUuZy4gcmVtb3ZpbmcgbGlzdGVuZXJzLCBjYWxsaW5nIG9uRGVzdHJveXMpLlxuICpcbiAqIEBwYXJhbSB2aWV3IFRoZSB2aWV3IHRvIGJlIGRlc3Ryb3llZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlc3Ryb3lMVmlldyh2aWV3OiBMVmlldykge1xuICBjb25zdCByZW5kZXJlciA9IHZpZXdbUkVOREVSRVJdO1xuICBpZiAoaXNQcm9jZWR1cmFsUmVuZGVyZXIocmVuZGVyZXIpICYmIHJlbmRlcmVyLmRlc3Ryb3lOb2RlKSB7XG4gICAgd2Fsa1ROb2RlVHJlZSh2aWV3LCBXYWxrVE5vZGVUcmVlQWN0aW9uLkRlc3Ryb3ksIHJlbmRlcmVyLCBudWxsKTtcbiAgfVxuICBkZXN0cm95Vmlld1RyZWUodmlldyk7XG4gIC8vIFNldHMgdGhlIGRlc3Ryb3llZCBmbGFnXG4gIHZpZXdbRkxBR1NdIHw9IExWaWV3RmxhZ3MuRGVzdHJveWVkO1xufVxuXG4vKipcbiAqIERldGVybWluZXMgd2hpY2ggTFZpZXdPckxDb250YWluZXIgdG8ganVtcCB0byB3aGVuIHRyYXZlcnNpbmcgYmFjayB1cCB0aGVcbiAqIHRyZWUgaW4gZGVzdHJveVZpZXdUcmVlLlxuICpcbiAqIE5vcm1hbGx5LCB0aGUgdmlldydzIHBhcmVudCBMVmlldyBzaG91bGQgYmUgY2hlY2tlZCwgYnV0IGluIHRoZSBjYXNlIG9mXG4gKiBlbWJlZGRlZCB2aWV3cywgdGhlIGNvbnRhaW5lciAod2hpY2ggaXMgdGhlIHZpZXcgbm9kZSdzIHBhcmVudCwgYnV0IG5vdCB0aGVcbiAqIExWaWV3J3MgcGFyZW50KSBuZWVkcyB0byBiZSBjaGVja2VkIGZvciBhIHBvc3NpYmxlIG5leHQgcHJvcGVydHkuXG4gKlxuICogQHBhcmFtIHN0YXRlIFRoZSBMVmlld09yTENvbnRhaW5lciBmb3Igd2hpY2ggd2UgbmVlZCBhIHBhcmVudCBzdGF0ZVxuICogQHBhcmFtIHJvb3RWaWV3IFRoZSByb290Vmlldywgc28gd2UgZG9uJ3QgcHJvcGFnYXRlIHRvbyBmYXIgdXAgdGhlIHZpZXcgdHJlZVxuICogQHJldHVybnMgVGhlIGNvcnJlY3QgcGFyZW50IExWaWV3T3JMQ29udGFpbmVyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRQYXJlbnRTdGF0ZShzdGF0ZTogTFZpZXcgfCBMQ29udGFpbmVyLCByb290VmlldzogTFZpZXcpOiBMVmlld3xMQ29udGFpbmVyfG51bGwge1xuICBsZXQgdE5vZGU7XG4gIGlmIChzdGF0ZS5sZW5ndGggPj0gSEVBREVSX09GRlNFVCAmJiAodE5vZGUgPSAoc3RhdGUgYXMgTFZpZXcpICFbSE9TVF9OT0RFXSkgJiZcbiAgICAgIHROb2RlLnR5cGUgPT09IFROb2RlVHlwZS5WaWV3KSB7XG4gICAgLy8gaWYgaXQncyBhbiBlbWJlZGRlZCB2aWV3LCB0aGUgc3RhdGUgbmVlZHMgdG8gZ28gdXAgdG8gdGhlIGNvbnRhaW5lciwgaW4gY2FzZSB0aGVcbiAgICAvLyBjb250YWluZXIgaGFzIGEgbmV4dFxuICAgIHJldHVybiBnZXRMQ29udGFpbmVyKHROb2RlIGFzIFRWaWV3Tm9kZSwgc3RhdGUgYXMgTFZpZXcpIGFzIExDb250YWluZXI7XG4gIH0gZWxzZSB7XG4gICAgLy8gb3RoZXJ3aXNlLCB1c2UgcGFyZW50IHZpZXcgZm9yIGNvbnRhaW5lcnMgb3IgY29tcG9uZW50IHZpZXdzXG4gICAgcmV0dXJuIHN0YXRlW1BBUkVOVF0gPT09IHJvb3RWaWV3ID8gbnVsbCA6IHN0YXRlW1BBUkVOVF07XG4gIH1cbn1cblxuLyoqXG4gKiBDYWxscyBvbkRlc3Ryb3lzIGhvb2tzIGZvciBhbGwgZGlyZWN0aXZlcyBhbmQgcGlwZXMgaW4gYSBnaXZlbiB2aWV3IGFuZCB0aGVuIHJlbW92ZXMgYWxsXG4gKiBsaXN0ZW5lcnMuIExpc3RlbmVycyBhcmUgcmVtb3ZlZCBhcyB0aGUgbGFzdCBzdGVwIHNvIGV2ZW50cyBkZWxpdmVyZWQgaW4gdGhlIG9uRGVzdHJveXMgaG9va3NcbiAqIGNhbiBiZSBwcm9wYWdhdGVkIHRvIEBPdXRwdXQgbGlzdGVuZXJzLlxuICpcbiAqIEBwYXJhbSB2aWV3IFRoZSBMVmlldyB0byBjbGVhbiB1cFxuICovXG5mdW5jdGlvbiBjbGVhblVwVmlldyh2aWV3T3JDb250YWluZXI6IExWaWV3IHwgTENvbnRhaW5lcik6IHZvaWQge1xuICBpZiAoKHZpZXdPckNvbnRhaW5lciBhcyBMVmlldykubGVuZ3RoID49IEhFQURFUl9PRkZTRVQpIHtcbiAgICBjb25zdCB2aWV3ID0gdmlld09yQ29udGFpbmVyIGFzIExWaWV3O1xuICAgIGV4ZWN1dGVPbkRlc3Ryb3lzKHZpZXcpO1xuICAgIGV4ZWN1dGVQaXBlT25EZXN0cm95cyh2aWV3KTtcbiAgICByZW1vdmVMaXN0ZW5lcnModmlldyk7XG4gICAgY29uc3QgaG9zdFROb2RlID0gdmlld1tIT1NUX05PREVdO1xuICAgIC8vIEZvciBjb21wb25lbnQgdmlld3Mgb25seSwgdGhlIGxvY2FsIHJlbmRlcmVyIGlzIGRlc3Ryb3llZCBhcyBjbGVhbiB1cCB0aW1lLlxuICAgIGlmIChob3N0VE5vZGUgJiYgaG9zdFROb2RlLnR5cGUgPT09IFROb2RlVHlwZS5FbGVtZW50ICYmIGlzUHJvY2VkdXJhbFJlbmRlcmVyKHZpZXdbUkVOREVSRVJdKSkge1xuICAgICAgbmdEZXZNb2RlICYmIG5nRGV2TW9kZS5yZW5kZXJlckRlc3Ryb3krKztcbiAgICAgICh2aWV3W1JFTkRFUkVSXSBhcyBQcm9jZWR1cmFsUmVuZGVyZXIzKS5kZXN0cm95KCk7XG4gICAgfVxuICB9XG59XG5cbi8qKiBSZW1vdmVzIGxpc3RlbmVycyBhbmQgdW5zdWJzY3JpYmVzIGZyb20gb3V0cHV0IHN1YnNjcmlwdGlvbnMgKi9cbmZ1bmN0aW9uIHJlbW92ZUxpc3RlbmVycyhsVmlldzogTFZpZXcpOiB2b2lkIHtcbiAgY29uc3QgdENsZWFudXAgPSBsVmlld1tUVklFV10uY2xlYW51cCAhO1xuICBpZiAodENsZWFudXAgIT0gbnVsbCkge1xuICAgIGNvbnN0IGxDbGVhbnVwID0gbFZpZXdbQ0xFQU5VUF0gITtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRDbGVhbnVwLmxlbmd0aCAtIDE7IGkgKz0gMikge1xuICAgICAgaWYgKHR5cGVvZiB0Q2xlYW51cFtpXSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgLy8gVGhpcyBpcyBhIGxpc3RlbmVyIHdpdGggdGhlIG5hdGl2ZSByZW5kZXJlclxuICAgICAgICBjb25zdCBpZHggPSB0Q2xlYW51cFtpICsgMV07XG4gICAgICAgIGNvbnN0IGxpc3RlbmVyID0gbENsZWFudXBbdENsZWFudXBbaSArIDJdXTtcbiAgICAgICAgY29uc3QgbmF0aXZlID0gcmVhZEVsZW1lbnRWYWx1ZShsVmlld1tpZHhdKTtcbiAgICAgICAgY29uc3QgdXNlQ2FwdHVyZU9yU3ViSWR4ID0gdENsZWFudXBbaSArIDNdO1xuICAgICAgICBpZiAodHlwZW9mIHVzZUNhcHR1cmVPclN1YklkeCA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgICAgLy8gRE9NIGxpc3RlbmVyXG4gICAgICAgICAgbmF0aXZlLnJlbW92ZUV2ZW50TGlzdGVuZXIodENsZWFudXBbaV0sIGxpc3RlbmVyLCB1c2VDYXB0dXJlT3JTdWJJZHgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmICh1c2VDYXB0dXJlT3JTdWJJZHggPj0gMCkge1xuICAgICAgICAgICAgLy8gdW5yZWdpc3RlclxuICAgICAgICAgICAgbENsZWFudXBbdXNlQ2FwdHVyZU9yU3ViSWR4XSgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBTdWJzY3JpcHRpb25cbiAgICAgICAgICAgIGxDbGVhbnVwWy11c2VDYXB0dXJlT3JTdWJJZHhdLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGkgKz0gMjtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRDbGVhbnVwW2ldID09PSAnbnVtYmVyJykge1xuICAgICAgICAvLyBUaGlzIGlzIGEgbGlzdGVuZXIgd2l0aCByZW5kZXJlcjIgKGNsZWFudXAgZm4gY2FuIGJlIGZvdW5kIGJ5IGluZGV4KVxuICAgICAgICBjb25zdCBjbGVhbnVwRm4gPSBsQ2xlYW51cFt0Q2xlYW51cFtpXV07XG4gICAgICAgIGNsZWFudXBGbigpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gVGhpcyBpcyBhIGNsZWFudXAgZnVuY3Rpb24gdGhhdCBpcyBncm91cGVkIHdpdGggdGhlIGluZGV4IG9mIGl0cyBjb250ZXh0XG4gICAgICAgIGNvbnN0IGNvbnRleHQgPSBsQ2xlYW51cFt0Q2xlYW51cFtpICsgMV1dO1xuICAgICAgICB0Q2xlYW51cFtpXS5jYWxsKGNvbnRleHQpO1xuICAgICAgfVxuICAgIH1cbiAgICBsVmlld1tDTEVBTlVQXSA9IG51bGw7XG4gIH1cbn1cblxuLyoqIENhbGxzIG9uRGVzdHJveSBob29rcyBmb3IgdGhpcyB2aWV3ICovXG5mdW5jdGlvbiBleGVjdXRlT25EZXN0cm95cyh2aWV3OiBMVmlldyk6IHZvaWQge1xuICBjb25zdCB0VmlldyA9IHZpZXdbVFZJRVddO1xuICBsZXQgZGVzdHJveUhvb2tzOiBIb29rRGF0YXxudWxsO1xuICBpZiAodFZpZXcgIT0gbnVsbCAmJiAoZGVzdHJveUhvb2tzID0gdFZpZXcuZGVzdHJveUhvb2tzKSAhPSBudWxsKSB7XG4gICAgY2FsbEhvb2tzKHZpZXcsIGRlc3Ryb3lIb29rcyk7XG4gIH1cbn1cblxuLyoqIENhbGxzIHBpcGUgZGVzdHJveSBob29rcyBmb3IgdGhpcyB2aWV3ICovXG5mdW5jdGlvbiBleGVjdXRlUGlwZU9uRGVzdHJveXMobFZpZXc6IExWaWV3KTogdm9pZCB7XG4gIGNvbnN0IHBpcGVEZXN0cm95SG9va3MgPSBsVmlld1tUVklFV10gJiYgbFZpZXdbVFZJRVddLnBpcGVEZXN0cm95SG9va3M7XG4gIGlmIChwaXBlRGVzdHJveUhvb2tzKSB7XG4gICAgY2FsbEhvb2tzKGxWaWV3ICEsIHBpcGVEZXN0cm95SG9va3MpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRSZW5kZXJQYXJlbnQodE5vZGU6IFROb2RlLCBjdXJyZW50VmlldzogTFZpZXcpOiBSRWxlbWVudHxudWxsIHtcbiAgaWYgKGNhbkluc2VydE5hdGl2ZU5vZGUodE5vZGUsIGN1cnJlbnRWaWV3KSkge1xuICAgIC8vIElmIHdlIGFyZSBhc2tlZCBmb3IgYSByZW5kZXIgcGFyZW50IG9mIHRoZSByb290IGNvbXBvbmVudCB3ZSBuZWVkIHRvIGRvIGxvdy1sZXZlbCBET01cbiAgICAvLyBvcGVyYXRpb24gYXMgTFRyZWUgZG9lc24ndCBleGlzdCBhYm92ZSB0aGUgdG9wbW9zdCBob3N0IG5vZGUuIFdlIG1pZ2h0IG5lZWQgdG8gZmluZCBhIHJlbmRlclxuICAgIC8vIHBhcmVudCBvZiB0aGUgdG9wbW9zdCBob3N0IG5vZGUgaWYgdGhlIHJvb3QgY29tcG9uZW50IGluamVjdHMgVmlld0NvbnRhaW5lclJlZi5cbiAgICBpZiAoaXNSb290VmlldyhjdXJyZW50VmlldykpIHtcbiAgICAgIHJldHVybiBuYXRpdmVQYXJlbnROb2RlKGN1cnJlbnRWaWV3W1JFTkRFUkVSXSwgZ2V0TmF0aXZlQnlUTm9kZSh0Tm9kZSwgY3VycmVudFZpZXcpKTtcbiAgICB9XG5cbiAgICBjb25zdCBob3N0VE5vZGUgPSBjdXJyZW50Vmlld1tIT1NUX05PREVdO1xuXG4gICAgY29uc3QgdE5vZGVQYXJlbnQgPSB0Tm9kZS5wYXJlbnQ7XG4gICAgaWYgKHROb2RlUGFyZW50ICE9IG51bGwgJiYgdE5vZGVQYXJlbnQudHlwZSA9PT0gVE5vZGVUeXBlLkVsZW1lbnRDb250YWluZXIpIHtcbiAgICAgIHROb2RlID0gZ2V0SGlnaGVzdEVsZW1lbnRDb250YWluZXIodE5vZGVQYXJlbnQpO1xuICAgIH1cblxuICAgIHJldHVybiB0Tm9kZS5wYXJlbnQgPT0gbnVsbCAmJiBob3N0VE5vZGUgIS50eXBlID09PSBUTm9kZVR5cGUuVmlldyA/XG4gICAgICAgIGdldENvbnRhaW5lclJlbmRlclBhcmVudChob3N0VE5vZGUgYXMgVFZpZXdOb2RlLCBjdXJyZW50VmlldykgOlxuICAgICAgICBnZXRQYXJlbnROYXRpdmUodE5vZGUsIGN1cnJlbnRWaWV3KSBhcyBSRWxlbWVudDtcbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuZnVuY3Rpb24gY2FuSW5zZXJ0TmF0aXZlQ2hpbGRPZkVsZW1lbnQodE5vZGU6IFROb2RlKTogYm9vbGVhbiB7XG4gIC8vIElmIHRoZSBwYXJlbnQgaXMgbnVsbCwgdGhlbiB3ZSBhcmUgaW5zZXJ0aW5nIGFjcm9zcyB2aWV3cy4gVGhpcyBoYXBwZW5zIHdoZW4gd2VcbiAgLy8gaW5zZXJ0IGEgcm9vdCBlbGVtZW50IG9mIHRoZSBjb21wb25lbnQgdmlldyBpbnRvIHRoZSBjb21wb25lbnQgaG9zdCBlbGVtZW50IGFuZCBpdFxuICAvLyBzaG91bGQgYWx3YXlzIGJlIGVhZ2VyLlxuICBpZiAodE5vZGUucGFyZW50ID09IG51bGwgfHxcbiAgICAgIC8vIFdlIHNob3VsZCBhbHNvIGVhZ2VybHkgaW5zZXJ0IGlmIHRoZSBwYXJlbnQgaXMgYSByZWd1bGFyLCBub24tY29tcG9uZW50IGVsZW1lbnRcbiAgICAgIC8vIHNpbmNlIHdlIGtub3cgdGhhdCB0aGlzIHJlbGF0aW9uc2hpcCB3aWxsIG5ldmVyIGJlIGJyb2tlbi5cbiAgICAgIHROb2RlLnBhcmVudC50eXBlID09PSBUTm9kZVR5cGUuRWxlbWVudCAmJiAhKHROb2RlLnBhcmVudC5mbGFncyAmIFROb2RlRmxhZ3MuaXNDb21wb25lbnQpKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvLyBQYXJlbnQgaXMgYSBDb21wb25lbnQuIENvbXBvbmVudCdzIGNvbnRlbnQgbm9kZXMgYXJlIG5vdCBpbnNlcnRlZCBpbW1lZGlhdGVseVxuICAvLyBiZWNhdXNlIHRoZXkgd2lsbCBiZSBwcm9qZWN0ZWQsIGFuZCBzbyBkb2luZyBpbnNlcnQgYXQgdGhpcyBwb2ludCB3b3VsZCBiZSB3YXN0ZWZ1bC5cbiAgLy8gU2luY2UgdGhlIHByb2plY3Rpb24gd291bGQgdGhhbiBtb3ZlIGl0IHRvIGl0cyBmaW5hbCBkZXN0aW5hdGlvbi5cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqIFdlIG1pZ2h0IGRlbGF5IGluc2VydGlvbiBvZiBjaGlsZHJlbiBmb3IgYSBnaXZlbiB2aWV3IGlmIGl0IGlzIGRpc2Nvbm5lY3RlZC5cbiAqIFRoaXMgbWlnaHQgaGFwcGVuIGZvciAyIG1haW4gcmVhc29uczpcbiAqIC0gdmlldyBpcyBub3QgaW5zZXJ0ZWQgaW50byBhbnkgY29udGFpbmVyICh2aWV3IHdhcyBjcmVhdGVkIGJ1dCBub3QgaW5zZXJ0ZWQgeWV0KVxuICogLSB2aWV3IGlzIGluc2VydGVkIGludG8gYSBjb250YWluZXIgYnV0IHRoZSBjb250YWluZXIgaXRzZWxmIGlzIG5vdCBpbnNlcnRlZCBpbnRvIHRoZSBET01cbiAqIChjb250YWluZXIgbWlnaHQgYmUgcGFydCBvZiBwcm9qZWN0aW9uIG9yIGNoaWxkIG9mIGEgdmlldyB0aGF0IGlzIG5vdCBpbnNlcnRlZCB5ZXQpLlxuICpcbiAqIEluIG90aGVyIHdvcmRzIHdlIGNhbiBpbnNlcnQgY2hpbGRyZW4gb2YgYSBnaXZlbiB2aWV3IGlmIHRoaXMgdmlldyB3YXMgaW5zZXJ0ZWQgaW50byBhIGNvbnRhaW5lclxuICogYW5kXG4gKiB0aGUgY29udGFpbmVyIGl0c2VsZiBoYXMgaXRzIHJlbmRlciBwYXJlbnQgZGV0ZXJtaW5lZC5cbiAqL1xuZnVuY3Rpb24gY2FuSW5zZXJ0TmF0aXZlQ2hpbGRPZlZpZXcodmlld1ROb2RlOiBUVmlld05vZGUsIHZpZXc6IExWaWV3KTogYm9vbGVhbiB7XG4gIC8vIEJlY2F1c2Ugd2UgYXJlIGluc2VydGluZyBpbnRvIGEgYFZpZXdgIHRoZSBgVmlld2AgbWF5IGJlIGRpc2Nvbm5lY3RlZC5cbiAgY29uc3QgY29udGFpbmVyID0gZ2V0TENvbnRhaW5lcih2aWV3VE5vZGUsIHZpZXcpICE7XG4gIGlmIChjb250YWluZXIgPT0gbnVsbCB8fCBjb250YWluZXJbUkVOREVSX1BBUkVOVF0gPT0gbnVsbCkge1xuICAgIC8vIFRoZSBgVmlld2AgaXMgbm90IGluc2VydGVkIGludG8gYSBgQ29udGFpbmVyYCBvciB0aGUgcGFyZW50IGBDb250YWluZXJgXG4gICAgLy8gaXRzZWxmIGlzIGRpc2Nvbm5lY3RlZC4gU28gd2UgaGF2ZSB0byBkZWxheS5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBUaGUgcGFyZW50IGBDb250YWluZXJgIGlzIGluIGluc2VydGVkIHN0YXRlLCBzbyB3ZSBjYW4gZWFnZXJseSBpbnNlcnQgaW50b1xuICAvLyB0aGlzIGxvY2F0aW9uLlxuICByZXR1cm4gdHJ1ZTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHdoZXRoZXIgYSBuYXRpdmUgZWxlbWVudCBjYW4gYmUgaW5zZXJ0ZWQgaW50byB0aGUgZ2l2ZW4gcGFyZW50LlxuICpcbiAqIFRoZXJlIGFyZSB0d28gcmVhc29ucyB3aHkgd2UgbWF5IG5vdCBiZSBhYmxlIHRvIGluc2VydCBhIGVsZW1lbnQgaW1tZWRpYXRlbHkuXG4gKiAtIFByb2plY3Rpb246IFdoZW4gY3JlYXRpbmcgYSBjaGlsZCBjb250ZW50IGVsZW1lbnQgb2YgYSBjb21wb25lbnQsIHdlIGhhdmUgdG8gc2tpcCB0aGVcbiAqICAgaW5zZXJ0aW9uIGJlY2F1c2UgdGhlIGNvbnRlbnQgb2YgYSBjb21wb25lbnQgd2lsbCBiZSBwcm9qZWN0ZWQuXG4gKiAgIGA8Y29tcG9uZW50Pjxjb250ZW50PmRlbGF5ZWQgZHVlIHRvIHByb2plY3Rpb248L2NvbnRlbnQ+PC9jb21wb25lbnQ+YFxuICogLSBQYXJlbnQgY29udGFpbmVyIGlzIGRpc2Nvbm5lY3RlZDogVGhpcyBjYW4gaGFwcGVuIHdoZW4gd2UgYXJlIGluc2VydGluZyBhIHZpZXcgaW50b1xuICogICBwYXJlbnQgY29udGFpbmVyLCB3aGljaCBpdHNlbGYgaXMgZGlzY29ubmVjdGVkLiBGb3IgZXhhbXBsZSB0aGUgcGFyZW50IGNvbnRhaW5lciBpcyBwYXJ0XG4gKiAgIG9mIGEgVmlldyB3aGljaCBoYXMgbm90IGJlIGluc2VydGVkIG9yIGlzIG1hcmUgZm9yIHByb2plY3Rpb24gYnV0IGhhcyBub3QgYmVlbiBpbnNlcnRlZFxuICogICBpbnRvIGRlc3RpbmF0aW9uLlxuICpcblxuICpcbiAqIEBwYXJhbSB0Tm9kZSBUaGUgdE5vZGUgb2YgdGhlIG5vZGUgdGhhdCB3ZSB3YW50IHRvIGluc2VydC5cbiAqIEBwYXJhbSBjdXJyZW50VmlldyBDdXJyZW50IExWaWV3IGJlaW5nIHByb2Nlc3NlZC5cbiAqIEByZXR1cm4gYm9vbGVhbiBXaGV0aGVyIHRoZSBub2RlIHNob3VsZCBiZSBpbnNlcnRlZCBub3cgKG9yIGRlbGF5ZWQgdW50aWwgbGF0ZXIpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY2FuSW5zZXJ0TmF0aXZlTm9kZSh0Tm9kZTogVE5vZGUsIGN1cnJlbnRWaWV3OiBMVmlldyk6IGJvb2xlYW4ge1xuICBsZXQgY3VycmVudE5vZGUgPSB0Tm9kZTtcbiAgbGV0IHBhcmVudDogVE5vZGV8bnVsbCA9IHROb2RlLnBhcmVudDtcblxuICBpZiAodE5vZGUucGFyZW50KSB7XG4gICAgaWYgKHROb2RlLnBhcmVudC50eXBlID09PSBUTm9kZVR5cGUuRWxlbWVudENvbnRhaW5lcikge1xuICAgICAgY3VycmVudE5vZGUgPSBnZXRIaWdoZXN0RWxlbWVudENvbnRhaW5lcih0Tm9kZSk7XG4gICAgICBwYXJlbnQgPSBjdXJyZW50Tm9kZS5wYXJlbnQ7XG4gICAgfSBlbHNlIGlmICh0Tm9kZS5wYXJlbnQudHlwZSA9PT0gVE5vZGVUeXBlLkljdUNvbnRhaW5lcikge1xuICAgICAgY3VycmVudE5vZGUgPSBnZXRGaXJzdFBhcmVudE5hdGl2ZShjdXJyZW50Tm9kZSk7XG4gICAgICBwYXJlbnQgPSBjdXJyZW50Tm9kZS5wYXJlbnQ7XG4gICAgfVxuICB9XG4gIGlmIChwYXJlbnQgPT09IG51bGwpIHBhcmVudCA9IGN1cnJlbnRWaWV3W0hPU1RfTk9ERV07XG5cbiAgaWYgKHBhcmVudCAmJiBwYXJlbnQudHlwZSA9PT0gVE5vZGVUeXBlLlZpZXcpIHtcbiAgICByZXR1cm4gY2FuSW5zZXJ0TmF0aXZlQ2hpbGRPZlZpZXcocGFyZW50IGFzIFRWaWV3Tm9kZSwgY3VycmVudFZpZXcpO1xuICB9IGVsc2Uge1xuICAgIC8vIFBhcmVudCBpcyBhIHJlZ3VsYXIgZWxlbWVudCBvciBhIGNvbXBvbmVudFxuICAgIHJldHVybiBjYW5JbnNlcnROYXRpdmVDaGlsZE9mRWxlbWVudChjdXJyZW50Tm9kZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBJbnNlcnRzIGEgbmF0aXZlIG5vZGUgYmVmb3JlIGFub3RoZXIgbmF0aXZlIG5vZGUgZm9yIGEgZ2l2ZW4gcGFyZW50IHVzaW5nIHtAbGluayBSZW5kZXJlcjN9LlxuICogVGhpcyBpcyBhIHV0aWxpdHkgZnVuY3Rpb24gdGhhdCBjYW4gYmUgdXNlZCB3aGVuIG5hdGl2ZSBub2RlcyB3ZXJlIGRldGVybWluZWQgLSBpdCBhYnN0cmFjdHMgYW5cbiAqIGFjdHVhbCByZW5kZXJlciBiZWluZyB1c2VkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbmF0aXZlSW5zZXJ0QmVmb3JlKFxuICAgIHJlbmRlcmVyOiBSZW5kZXJlcjMsIHBhcmVudDogUkVsZW1lbnQsIGNoaWxkOiBSTm9kZSwgYmVmb3JlTm9kZTogUk5vZGUgfCBudWxsKTogdm9pZCB7XG4gIGlmIChpc1Byb2NlZHVyYWxSZW5kZXJlcihyZW5kZXJlcikpIHtcbiAgICByZW5kZXJlci5pbnNlcnRCZWZvcmUocGFyZW50LCBjaGlsZCwgYmVmb3JlTm9kZSk7XG4gIH0gZWxzZSB7XG4gICAgcGFyZW50Lmluc2VydEJlZm9yZShjaGlsZCwgYmVmb3JlTm9kZSwgdHJ1ZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgbmF0aXZlIHBhcmVudCBvZiBhIGdpdmVuIG5hdGl2ZSBub2RlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbmF0aXZlUGFyZW50Tm9kZShyZW5kZXJlcjogUmVuZGVyZXIzLCBub2RlOiBSTm9kZSk6IFJFbGVtZW50fG51bGwge1xuICByZXR1cm4gKGlzUHJvY2VkdXJhbFJlbmRlcmVyKHJlbmRlcmVyKSA/IHJlbmRlcmVyLnBhcmVudE5vZGUobm9kZSkgOiBub2RlLnBhcmVudE5vZGUpIGFzIFJFbGVtZW50O1xufVxuXG4vKipcbiAqIFJldHVybnMgYSBuYXRpdmUgc2libGluZyBvZiBhIGdpdmVuIG5hdGl2ZSBub2RlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbmF0aXZlTmV4dFNpYmxpbmcocmVuZGVyZXI6IFJlbmRlcmVyMywgbm9kZTogUk5vZGUpOiBSTm9kZXxudWxsIHtcbiAgcmV0dXJuIGlzUHJvY2VkdXJhbFJlbmRlcmVyKHJlbmRlcmVyKSA/IHJlbmRlcmVyLm5leHRTaWJsaW5nKG5vZGUpIDogbm9kZS5uZXh0U2libGluZztcbn1cblxuLyoqXG4gKiBBcHBlbmRzIHRoZSBgY2hpbGRgIGVsZW1lbnQgdG8gdGhlIGBwYXJlbnRgLlxuICpcbiAqIFRoZSBlbGVtZW50IGluc2VydGlvbiBtaWdodCBiZSBkZWxheWVkIHtAbGluayBjYW5JbnNlcnROYXRpdmVOb2RlfS5cbiAqXG4gKiBAcGFyYW0gY2hpbGRFbCBUaGUgY2hpbGQgdGhhdCBzaG91bGQgYmUgYXBwZW5kZWRcbiAqIEBwYXJhbSBjaGlsZFROb2RlIFRoZSBUTm9kZSBvZiB0aGUgY2hpbGQgZWxlbWVudFxuICogQHBhcmFtIGN1cnJlbnRWaWV3IFRoZSBjdXJyZW50IExWaWV3XG4gKiBAcmV0dXJucyBXaGV0aGVyIG9yIG5vdCB0aGUgY2hpbGQgd2FzIGFwcGVuZGVkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhcHBlbmRDaGlsZChcbiAgICBjaGlsZEVsOiBSTm9kZSB8IG51bGwgPSBudWxsLCBjaGlsZFROb2RlOiBUTm9kZSwgY3VycmVudFZpZXc6IExWaWV3KTogYm9vbGVhbiB7XG4gIGlmIChjaGlsZEVsICE9PSBudWxsICYmIGNhbkluc2VydE5hdGl2ZU5vZGUoY2hpbGRUTm9kZSwgY3VycmVudFZpZXcpKSB7XG4gICAgY29uc3QgcmVuZGVyZXIgPSBjdXJyZW50Vmlld1tSRU5ERVJFUl07XG4gICAgY29uc3QgcGFyZW50RWwgPSBnZXRQYXJlbnROYXRpdmUoY2hpbGRUTm9kZSwgY3VycmVudFZpZXcpO1xuICAgIGNvbnN0IHBhcmVudFROb2RlOiBUTm9kZSA9IGNoaWxkVE5vZGUucGFyZW50IHx8IGN1cnJlbnRWaWV3W0hPU1RfTk9ERV0gITtcblxuICAgIGlmIChwYXJlbnRUTm9kZS50eXBlID09PSBUTm9kZVR5cGUuVmlldykge1xuICAgICAgY29uc3QgbENvbnRhaW5lciA9IGdldExDb250YWluZXIocGFyZW50VE5vZGUgYXMgVFZpZXdOb2RlLCBjdXJyZW50VmlldykgYXMgTENvbnRhaW5lcjtcbiAgICAgIGNvbnN0IHZpZXdzID0gbENvbnRhaW5lcltWSUVXU107XG4gICAgICBjb25zdCBpbmRleCA9IHZpZXdzLmluZGV4T2YoY3VycmVudFZpZXcpO1xuICAgICAgbmF0aXZlSW5zZXJ0QmVmb3JlKFxuICAgICAgICAgIHJlbmRlcmVyLCBsQ29udGFpbmVyW1JFTkRFUl9QQVJFTlRdICEsIGNoaWxkRWwsXG4gICAgICAgICAgZ2V0QmVmb3JlTm9kZUZvclZpZXcoaW5kZXgsIHZpZXdzLCBsQ29udGFpbmVyW05BVElWRV0pKTtcbiAgICB9IGVsc2UgaWYgKHBhcmVudFROb2RlLnR5cGUgPT09IFROb2RlVHlwZS5FbGVtZW50Q29udGFpbmVyKSB7XG4gICAgICBjb25zdCByZW5kZXJQYXJlbnQgPSBnZXRSZW5kZXJQYXJlbnQoY2hpbGRUTm9kZSwgY3VycmVudFZpZXcpICE7XG4gICAgICBuYXRpdmVJbnNlcnRCZWZvcmUocmVuZGVyZXIsIHJlbmRlclBhcmVudCwgY2hpbGRFbCwgcGFyZW50RWwpO1xuICAgIH0gZWxzZSBpZiAocGFyZW50VE5vZGUudHlwZSA9PT0gVE5vZGVUeXBlLkljdUNvbnRhaW5lcikge1xuICAgICAgY29uc3QgaWN1QW5jaG9yTm9kZSA9IGdldE5hdGl2ZUJ5VE5vZGUoY2hpbGRUTm9kZS5wYXJlbnQgISwgY3VycmVudFZpZXcpICFhcyBSRWxlbWVudDtcbiAgICAgIG5hdGl2ZUluc2VydEJlZm9yZShyZW5kZXJlciwgcGFyZW50RWwgYXMgUkVsZW1lbnQsIGNoaWxkRWwsIGljdUFuY2hvck5vZGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpc1Byb2NlZHVyYWxSZW5kZXJlcihyZW5kZXJlcikgPyByZW5kZXJlci5hcHBlbmRDaGlsZChwYXJlbnRFbCAhYXMgUkVsZW1lbnQsIGNoaWxkRWwpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudEVsICEuYXBwZW5kQ2hpbGQoY2hpbGRFbCk7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSB0b3AtbGV2ZWwgbmctY29udGFpbmVyIGlmIG5nLWNvbnRhaW5lcnMgYXJlIG5lc3RlZC5cbiAqXG4gKiBAcGFyYW0gbmdDb250YWluZXIgVGhlIFROb2RlIG9mIHRoZSBzdGFydGluZyBuZy1jb250YWluZXJcbiAqIEByZXR1cm5zIHROb2RlIFRoZSBUTm9kZSBvZiB0aGUgaGlnaGVzdCBsZXZlbCBuZy1jb250YWluZXJcbiAqL1xuZnVuY3Rpb24gZ2V0SGlnaGVzdEVsZW1lbnRDb250YWluZXIobmdDb250YWluZXI6IFROb2RlKTogVE5vZGUge1xuICB3aGlsZSAobmdDb250YWluZXIucGFyZW50ICE9IG51bGwgJiYgbmdDb250YWluZXIucGFyZW50LnR5cGUgPT09IFROb2RlVHlwZS5FbGVtZW50Q29udGFpbmVyKSB7XG4gICAgbmdDb250YWluZXIgPSBuZ0NvbnRhaW5lci5wYXJlbnQ7XG4gIH1cbiAgcmV0dXJuIG5nQ29udGFpbmVyO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0QmVmb3JlTm9kZUZvclZpZXcoaW5kZXg6IG51bWJlciwgdmlld3M6IExWaWV3W10sIGNvbnRhaW5lck5hdGl2ZTogUkNvbW1lbnQpIHtcbiAgaWYgKGluZGV4ICsgMSA8IHZpZXdzLmxlbmd0aCkge1xuICAgIGNvbnN0IHZpZXcgPSB2aWV3c1tpbmRleCArIDFdIGFzIExWaWV3O1xuICAgIGNvbnN0IHZpZXdUTm9kZSA9IHZpZXdbSE9TVF9OT0RFXSBhcyBUVmlld05vZGU7XG4gICAgcmV0dXJuIHZpZXdUTm9kZS5jaGlsZCA/IGdldE5hdGl2ZUJ5VE5vZGUodmlld1ROb2RlLmNoaWxkLCB2aWV3KSA6IGNvbnRhaW5lck5hdGl2ZTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gY29udGFpbmVyTmF0aXZlO1xuICB9XG59XG5cbi8qKlxuICogUmVtb3ZlcyB0aGUgYGNoaWxkYCBlbGVtZW50IGZyb20gdGhlIERPTSBpZiBub3QgaW4gdmlldyBhbmQgbm90IHByb2plY3RlZC5cbiAqXG4gKiBAcGFyYW0gY2hpbGRUTm9kZSBUaGUgVE5vZGUgb2YgdGhlIGNoaWxkIHRvIHJlbW92ZVxuICogQHBhcmFtIGNoaWxkRWwgVGhlIGNoaWxkIHRoYXQgc2hvdWxkIGJlIHJlbW92ZWRcbiAqIEBwYXJhbSBjdXJyZW50VmlldyBUaGUgY3VycmVudCBMVmlld1xuICogQHJldHVybnMgV2hldGhlciBvciBub3QgdGhlIGNoaWxkIHdhcyByZW1vdmVkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVDaGlsZChjaGlsZFROb2RlOiBUTm9kZSwgY2hpbGRFbDogUk5vZGUgfCBudWxsLCBjdXJyZW50VmlldzogTFZpZXcpOiBib29sZWFuIHtcbiAgLy8gV2Ugb25seSByZW1vdmUgdGhlIGVsZW1lbnQgaWYgbm90IGluIFZpZXcgb3Igbm90IHByb2plY3RlZC5cbiAgaWYgKGNoaWxkRWwgIT09IG51bGwgJiYgY2FuSW5zZXJ0TmF0aXZlTm9kZShjaGlsZFROb2RlLCBjdXJyZW50VmlldykpIHtcbiAgICBjb25zdCBwYXJlbnROYXRpdmUgPSBnZXRQYXJlbnROYXRpdmUoY2hpbGRUTm9kZSwgY3VycmVudFZpZXcpICFhcyBSRWxlbWVudDtcbiAgICBjb25zdCByZW5kZXJlciA9IGN1cnJlbnRWaWV3W1JFTkRFUkVSXTtcbiAgICBpc1Byb2NlZHVyYWxSZW5kZXJlcihyZW5kZXJlcikgPyByZW5kZXJlci5yZW1vdmVDaGlsZChwYXJlbnROYXRpdmUgYXMgUkVsZW1lbnQsIGNoaWxkRWwpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnROYXRpdmUgIS5yZW1vdmVDaGlsZChjaGlsZEVsKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbi8qKlxuICogQXBwZW5kcyBhIHByb2plY3RlZCBub2RlIHRvIHRoZSBET00sIG9yIGluIHRoZSBjYXNlIG9mIGEgcHJvamVjdGVkIGNvbnRhaW5lcixcbiAqIGFwcGVuZHMgdGhlIG5vZGVzIGZyb20gYWxsIG9mIHRoZSBjb250YWluZXIncyBhY3RpdmUgdmlld3MgdG8gdGhlIERPTS5cbiAqXG4gKiBAcGFyYW0gcHJvamVjdGVkVE5vZGUgVGhlIFROb2RlIHRvIGJlIHByb2plY3RlZFxuICogQHBhcmFtIHRQcm9qZWN0aW9uTm9kZSBUaGUgcHJvamVjdGlvbiAobmctY29udGVudCkgVE5vZGVcbiAqIEBwYXJhbSBjdXJyZW50VmlldyBDdXJyZW50IExWaWV3XG4gKiBAcGFyYW0gcHJvamVjdGlvblZpZXcgUHJvamVjdGlvbiB2aWV3ICh2aWV3IGFib3ZlIGN1cnJlbnQpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhcHBlbmRQcm9qZWN0ZWROb2RlKFxuICAgIHByb2plY3RlZFROb2RlOiBUTm9kZSwgdFByb2plY3Rpb25Ob2RlOiBUTm9kZSwgY3VycmVudFZpZXc6IExWaWV3LFxuICAgIHByb2plY3Rpb25WaWV3OiBMVmlldyk6IHZvaWQge1xuICBjb25zdCBuYXRpdmUgPSBnZXROYXRpdmVCeVROb2RlKHByb2plY3RlZFROb2RlLCBwcm9qZWN0aW9uVmlldyk7XG4gIGFwcGVuZENoaWxkKG5hdGl2ZSwgdFByb2plY3Rpb25Ob2RlLCBjdXJyZW50Vmlldyk7XG5cbiAgLy8gdGhlIHByb2plY3RlZCBjb250ZW50cyBhcmUgcHJvY2Vzc2VkIHdoaWxlIGluIHRoZSBzaGFkb3cgdmlldyAod2hpY2ggaXMgdGhlIGN1cnJlbnRWaWV3KVxuICAvLyB0aGVyZWZvcmUgd2UgbmVlZCB0byBleHRyYWN0IHRoZSB2aWV3IHdoZXJlIHRoZSBob3N0IGVsZW1lbnQgbGl2ZXMgc2luY2UgaXQncyB0aGVcbiAgLy8gbG9naWNhbCBjb250YWluZXIgb2YgdGhlIGNvbnRlbnQgcHJvamVjdGVkIHZpZXdzXG4gIGF0dGFjaFBhdGNoRGF0YShuYXRpdmUsIHByb2plY3Rpb25WaWV3KTtcblxuICBjb25zdCByZW5kZXJQYXJlbnQgPSBnZXRSZW5kZXJQYXJlbnQodFByb2plY3Rpb25Ob2RlLCBjdXJyZW50Vmlldyk7XG5cbiAgY29uc3Qgbm9kZU9yQ29udGFpbmVyID0gcHJvamVjdGlvblZpZXdbcHJvamVjdGVkVE5vZGUuaW5kZXhdO1xuICBpZiAocHJvamVjdGVkVE5vZGUudHlwZSA9PT0gVE5vZGVUeXBlLkNvbnRhaW5lcikge1xuICAgIC8vIFRoZSBub2RlIHdlIGFyZSBhZGRpbmcgaXMgYSBjb250YWluZXIgYW5kIHdlIGFyZSBhZGRpbmcgaXQgdG8gYW4gZWxlbWVudCB3aGljaFxuICAgIC8vIGlzIG5vdCBhIGNvbXBvbmVudCAobm8gbW9yZSByZS1wcm9qZWN0aW9uKS5cbiAgICAvLyBBbHRlcm5hdGl2ZWx5IGEgY29udGFpbmVyIGlzIHByb2plY3RlZCBhdCB0aGUgcm9vdCBvZiBhIGNvbXBvbmVudCdzIHRlbXBsYXRlXG4gICAgLy8gYW5kIGNhbid0IGJlIHJlLXByb2plY3RlZCAoYXMgbm90IGNvbnRlbnQgb2YgYW55IGNvbXBvbmVudCkuXG4gICAgLy8gQXNzaWduIHRoZSBmaW5hbCBwcm9qZWN0aW9uIGxvY2F0aW9uIGluIHRob3NlIGNhc2VzLlxuICAgIG5vZGVPckNvbnRhaW5lcltSRU5ERVJfUEFSRU5UXSA9IHJlbmRlclBhcmVudDtcbiAgICBjb25zdCB2aWV3cyA9IG5vZGVPckNvbnRhaW5lcltWSUVXU107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB2aWV3cy5sZW5ndGg7IGkrKykge1xuICAgICAgYWRkUmVtb3ZlVmlld0Zyb21Db250YWluZXIodmlld3NbaV0sIHRydWUsIG5vZGVPckNvbnRhaW5lcltOQVRJVkVdKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKHByb2plY3RlZFROb2RlLnR5cGUgPT09IFROb2RlVHlwZS5FbGVtZW50Q29udGFpbmVyKSB7XG4gICAgICBsZXQgbmdDb250YWluZXJDaGlsZFROb2RlOiBUTm9kZXxudWxsID0gcHJvamVjdGVkVE5vZGUuY2hpbGQgYXMgVE5vZGU7XG4gICAgICB3aGlsZSAobmdDb250YWluZXJDaGlsZFROb2RlKSB7XG4gICAgICAgIGFwcGVuZFByb2plY3RlZE5vZGUobmdDb250YWluZXJDaGlsZFROb2RlLCB0UHJvamVjdGlvbk5vZGUsIGN1cnJlbnRWaWV3LCBwcm9qZWN0aW9uVmlldyk7XG4gICAgICAgIG5nQ29udGFpbmVyQ2hpbGRUTm9kZSA9IG5nQ29udGFpbmVyQ2hpbGRUTm9kZS5uZXh0O1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChpc0xDb250YWluZXIobm9kZU9yQ29udGFpbmVyKSkge1xuICAgICAgbm9kZU9yQ29udGFpbmVyW1JFTkRFUl9QQVJFTlRdID0gcmVuZGVyUGFyZW50O1xuICAgICAgYXBwZW5kQ2hpbGQobm9kZU9yQ29udGFpbmVyW05BVElWRV0sIHRQcm9qZWN0aW9uTm9kZSwgY3VycmVudFZpZXcpO1xuICAgIH1cbiAgfVxufVxuIl19