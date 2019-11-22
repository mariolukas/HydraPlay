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
var unusedValueToPlacateAjd = unused1 + unused2 + unused3 + unused4 + unused5;
/** Retrieves the parent element of a given node. */
export function getParentNative(tNode, currentView) {
    if (tNode.parent == null) {
        return getHostNative(currentView);
    }
    else {
        var parentTNode = getFirstParentNative(tNode);
        return getNativeByTNode(parentTNode, currentView);
    }
}
/**
 * Get the first parent of a node that isn't an IcuContainer TNode
 */
function getFirstParentNative(tNode) {
    var parent = tNode.parent;
    while (parent && parent.type === 5 /* IcuContainer */) {
        parent = parent.parent;
    }
    return parent;
}
/**
 * Gets the host element given a view. Will return null if the current view is an embedded view,
 * which does not have a host element.
 */
export function getHostNative(currentView) {
    var hostTNode = currentView[HOST_NODE];
    return hostTNode && hostTNode.type !== 2 /* View */ ?
        getNativeByTNode(hostTNode, currentView[PARENT]) :
        null;
}
export function getLContainer(tNode, embeddedView) {
    if (tNode.index === -1) {
        // This is a dynamically created view inside a dynamic container.
        // If the host index is -1, the view has not yet been inserted, so it has no parent.
        var containerHostIndex = embeddedView[CONTAINER_INDEX];
        return containerHostIndex > -1 ? embeddedView[PARENT][containerHostIndex] : null;
    }
    else {
        // This is a inline view node (e.g. embeddedViewStart)
        return embeddedView[PARENT][tNode.parent.index];
    }
}
/**
 * Retrieves render parent for a given view.
 * Might be null if a view is not yet attached to any container.
 */
export function getContainerRenderParent(tViewNode, view) {
    var container = getLContainer(tViewNode, view);
    return container ? container[RENDER_PARENT] : null;
}
/**
 * Stack used to keep track of projection nodes in walkTNodeTree.
 *
 * This is deliberately created outside of walkTNodeTree to avoid allocating
 * a new array each time the function is called. Instead the array will be
 * re-used by each invocation. This works because the function is not reentrant.
 */
var projectionNodeStack = [];
/**
 * Walks a tree of TNodes, applying a transformation on the element nodes, either only on the first
 * one found, or on all of them.
 *
 * @param viewToWalk the view to walk
 * @param action identifies the action to be performed on the elements
 * @param renderer the current renderer.
 * @param renderParent Optional the render parent node to be set in all LContainers found,
 * required for action modes Insert and Destroy.
 * @param beforeNode Optional the node before which elements should be added, required for action
 * Insert.
 */
function walkTNodeTree(viewToWalk, action, renderer, renderParent, beforeNode) {
    var rootTNode = viewToWalk[TVIEW].node;
    var projectionNodeIndex = -1;
    var currentView = viewToWalk;
    var tNode = rootTNode.child;
    while (tNode) {
        var nextTNode = null;
        if (tNode.type === 3 /* Element */) {
            executeNodeAction(action, renderer, renderParent, getNativeByTNode(tNode, currentView), beforeNode);
            var nodeOrContainer = currentView[tNode.index];
            if (isLContainer(nodeOrContainer)) {
                // This element has an LContainer, and its comment needs to be handled
                executeNodeAction(action, renderer, renderParent, nodeOrContainer[NATIVE], beforeNode);
            }
        }
        else if (tNode.type === 0 /* Container */) {
            var lContainer = currentView[tNode.index];
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
            var componentView = findComponentView(currentView);
            var componentHost = componentView[HOST_NODE];
            var head = componentHost.projection[tNode.projection];
            // Must store both the TNode and the view because this projection node could be nested
            // deeply inside embedded views, and we need to get back down to this particular nested view.
            projectionNodeStack[++projectionNodeIndex] = tNode;
            projectionNodeStack[++projectionNodeIndex] = currentView;
            if (head) {
                currentView = componentView[PARENT];
                nextTNode = currentView[TVIEW].data[head.index];
            }
        }
        else {
            // Otherwise, this is a View or an ElementContainer
            nextTNode = tNode.child;
        }
        if (nextTNode === null) {
            // this last node was projected, we need to get back down to its projection node
            if (tNode.next === null && (tNode.flags & 2 /* isProjected */)) {
                currentView = projectionNodeStack[projectionNodeIndex--];
                tNode = projectionNodeStack[projectionNodeIndex--];
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
                    currentView = currentView[PARENT];
                    beforeNode = currentView[tNode.index][NATIVE];
                }
                if (tNode.type === 2 /* View */ && currentView[NEXT]) {
                    currentView = currentView[NEXT];
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
 */
function executeNodeAction(action, renderer, parent, node, beforeNode) {
    if (action === 0 /* Insert */) {
        isProceduralRenderer(renderer) ?
            renderer.insertBefore(parent, node, beforeNode) :
            parent.insertBefore(node, beforeNode, true);
    }
    else if (action === 1 /* Detach */) {
        isProceduralRenderer(renderer) ?
            renderer.removeChild(parent, node) :
            parent.removeChild(node);
    }
    else if (action === 2 /* Destroy */) {
        ngDevMode && ngDevMode.rendererDestroyNode++;
        renderer.destroyNode(node);
    }
}
export function createTextNode(value, renderer) {
    return isProceduralRenderer(renderer) ? renderer.createText(stringify(value)) :
        renderer.createTextNode(stringify(value));
}
export function addRemoveViewFromContainer(viewToWalk, insertMode, beforeNode) {
    var renderParent = getContainerRenderParent(viewToWalk[TVIEW].node, viewToWalk);
    ngDevMode && assertNodeType(viewToWalk[TVIEW].node, 2 /* View */);
    if (renderParent) {
        var renderer = viewToWalk[RENDERER];
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
 *  @param rootView The view to destroy
 */
export function destroyViewTree(rootView) {
    // If the view has no children, we can clean it up and return early.
    if (rootView[TVIEW].childIndex === -1) {
        return cleanUpView(rootView);
    }
    var viewOrContainer = getLViewChild(rootView);
    while (viewOrContainer) {
        var next = null;
        if (viewOrContainer.length >= HEADER_OFFSET) {
            // If LView, traverse down to child.
            var view = viewOrContainer;
            if (view[TVIEW].childIndex > -1)
                next = getLViewChild(view);
        }
        else {
            // If container, traverse down to its first LView.
            var container = viewOrContainer;
            if (container[VIEWS].length)
                next = container[VIEWS][0];
        }
        if (next == null) {
            // Only clean up view when moving to the side or up, as destroy hooks
            // should be called in order from the bottom up.
            while (viewOrContainer && !viewOrContainer[NEXT] && viewOrContainer !== rootView) {
                cleanUpView(viewOrContainer);
                viewOrContainer = getParentState(viewOrContainer, rootView);
            }
            cleanUpView(viewOrContainer || rootView);
            next = viewOrContainer && viewOrContainer[NEXT];
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
 * @param lView The view to insert
 * @param lContainer The container into which the view should be inserted
 * @param parentView The new parent of the inserted view
 * @param index The index at which to insert the view
 * @param containerIndex The index of the container node, if dynamic
 */
export function insertView(lView, lContainer, parentView, index, containerIndex) {
    var views = lContainer[VIEWS];
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
        lView[QUERIES].insertView(index);
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
 * @param lContainer The container from which to detach a view
 * @param removeIndex The index of the view to detach
 * @param detached Whether or not this view is already detached.
 * @returns Detached LView instance.
 */
export function detachView(lContainer, removeIndex, detached) {
    var views = lContainer[VIEWS];
    var viewToDetach = views[removeIndex];
    if (removeIndex > 0) {
        views[removeIndex - 1][NEXT] = viewToDetach[NEXT];
    }
    views.splice(removeIndex, 1);
    if (!detached) {
        addRemoveViewFromContainer(viewToDetach, false);
    }
    if (viewToDetach[QUERIES]) {
        viewToDetach[QUERIES].removeView();
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
 * @param lContainer The container from which to remove a view
 * @param tContainer The TContainer node associated with the LContainer
 * @param removeIndex The index of the view to remove
 */
export function removeView(lContainer, containerHost, removeIndex) {
    var view = lContainer[VIEWS][removeIndex];
    detachView(lContainer, removeIndex, !!containerHost.detached);
    destroyLView(view);
}
/** Gets the child of the given LView */
export function getLViewChild(lView) {
    var childIndex = lView[TVIEW].childIndex;
    return childIndex === -1 ? null : lView[childIndex];
}
/**
 * A standalone function which destroys an LView,
 * conducting cleanup (e.g. removing listeners, calling onDestroys).
 *
 * @param view The view to be destroyed.
 */
export function destroyLView(view) {
    var renderer = view[RENDERER];
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
 * @param state The LViewOrLContainer for which we need a parent state
 * @param rootView The rootView, so we don't propagate too far up the view tree
 * @returns The correct parent LViewOrLContainer
 */
export function getParentState(state, rootView) {
    var tNode;
    if (state.length >= HEADER_OFFSET && (tNode = state[HOST_NODE]) &&
        tNode.type === 2 /* View */) {
        // if it's an embedded view, the state needs to go up to the container, in case the
        // container has a next
        return getLContainer(tNode, state);
    }
    else {
        // otherwise, use parent view for containers or component views
        return state[PARENT] === rootView ? null : state[PARENT];
    }
}
/**
 * Calls onDestroys hooks for all directives and pipes in a given view and then removes all
 * listeners. Listeners are removed as the last step so events delivered in the onDestroys hooks
 * can be propagated to @Output listeners.
 *
 * @param view The LView to clean up
 */
function cleanUpView(viewOrContainer) {
    if (viewOrContainer.length >= HEADER_OFFSET) {
        var view = viewOrContainer;
        executeOnDestroys(view);
        executePipeOnDestroys(view);
        removeListeners(view);
        var hostTNode = view[HOST_NODE];
        // For component views only, the local renderer is destroyed as clean up time.
        if (hostTNode && hostTNode.type === 3 /* Element */ && isProceduralRenderer(view[RENDERER])) {
            ngDevMode && ngDevMode.rendererDestroy++;
            view[RENDERER].destroy();
        }
    }
}
/** Removes listeners and unsubscribes from output subscriptions */
function removeListeners(lView) {
    var tCleanup = lView[TVIEW].cleanup;
    if (tCleanup != null) {
        var lCleanup = lView[CLEANUP];
        for (var i = 0; i < tCleanup.length - 1; i += 2) {
            if (typeof tCleanup[i] === 'string') {
                // This is a listener with the native renderer
                var idx = tCleanup[i + 1];
                var listener = lCleanup[tCleanup[i + 2]];
                var native = readElementValue(lView[idx]);
                var useCaptureOrSubIdx = tCleanup[i + 3];
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
                var cleanupFn = lCleanup[tCleanup[i]];
                cleanupFn();
            }
            else {
                // This is a cleanup function that is grouped with the index of its context
                var context = lCleanup[tCleanup[i + 1]];
                tCleanup[i].call(context);
            }
        }
        lView[CLEANUP] = null;
    }
}
/** Calls onDestroy hooks for this view */
function executeOnDestroys(view) {
    var tView = view[TVIEW];
    var destroyHooks;
    if (tView != null && (destroyHooks = tView.destroyHooks) != null) {
        callHooks(view, destroyHooks);
    }
}
/** Calls pipe destroy hooks for this view */
function executePipeOnDestroys(lView) {
    var pipeDestroyHooks = lView[TVIEW] && lView[TVIEW].pipeDestroyHooks;
    if (pipeDestroyHooks) {
        callHooks(lView, pipeDestroyHooks);
    }
}
export function getRenderParent(tNode, currentView) {
    if (canInsertNativeNode(tNode, currentView)) {
        // If we are asked for a render parent of the root component we need to do low-level DOM
        // operation as LTree doesn't exist above the topmost host node. We might need to find a render
        // parent of the topmost host node if the root component injects ViewContainerRef.
        if (isRootView(currentView)) {
            return nativeParentNode(currentView[RENDERER], getNativeByTNode(tNode, currentView));
        }
        var hostTNode = currentView[HOST_NODE];
        var tNodeParent = tNode.parent;
        if (tNodeParent != null && tNodeParent.type === 4 /* ElementContainer */) {
            tNode = getHighestElementContainer(tNodeParent);
        }
        return tNode.parent == null && hostTNode.type === 2 /* View */ ?
            getContainerRenderParent(hostTNode, currentView) :
            getParentNative(tNode, currentView);
    }
    return null;
}
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
 */
function canInsertNativeChildOfView(viewTNode, view) {
    // Because we are inserting into a `View` the `View` may be disconnected.
    var container = getLContainer(viewTNode, view);
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
 * @param tNode The tNode of the node that we want to insert.
 * @param currentView Current LView being processed.
 * @return boolean Whether the node should be inserted now (or delayed until later).
 */
export function canInsertNativeNode(tNode, currentView) {
    var currentNode = tNode;
    var parent = tNode.parent;
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
        return canInsertNativeChildOfView(parent, currentView);
    }
    else {
        // Parent is a regular element or a component
        return canInsertNativeChildOfElement(currentNode);
    }
}
/**
 * Inserts a native node before another native node for a given parent using {@link Renderer3}.
 * This is a utility function that can be used when native nodes were determined - it abstracts an
 * actual renderer being used.
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
 */
export function nativeParentNode(renderer, node) {
    return (isProceduralRenderer(renderer) ? renderer.parentNode(node) : node.parentNode);
}
/**
 * Returns a native sibling of a given native node.
 */
export function nativeNextSibling(renderer, node) {
    return isProceduralRenderer(renderer) ? renderer.nextSibling(node) : node.nextSibling;
}
/**
 * Appends the `child` element to the `parent`.
 *
 * The element insertion might be delayed {@link canInsertNativeNode}.
 *
 * @param childEl The child that should be appended
 * @param childTNode The TNode of the child element
 * @param currentView The current LView
 * @returns Whether or not the child was appended
 */
export function appendChild(childEl, childTNode, currentView) {
    if (childEl === void 0) { childEl = null; }
    if (childEl !== null && canInsertNativeNode(childTNode, currentView)) {
        var renderer = currentView[RENDERER];
        var parentEl = getParentNative(childTNode, currentView);
        var parentTNode = childTNode.parent || currentView[HOST_NODE];
        if (parentTNode.type === 2 /* View */) {
            var lContainer = getLContainer(parentTNode, currentView);
            var views = lContainer[VIEWS];
            var index = views.indexOf(currentView);
            nativeInsertBefore(renderer, lContainer[RENDER_PARENT], childEl, getBeforeNodeForView(index, views, lContainer[NATIVE]));
        }
        else if (parentTNode.type === 4 /* ElementContainer */) {
            var renderParent = getRenderParent(childTNode, currentView);
            nativeInsertBefore(renderer, renderParent, childEl, parentEl);
        }
        else if (parentTNode.type === 5 /* IcuContainer */) {
            var icuAnchorNode = getNativeByTNode(childTNode.parent, currentView);
            nativeInsertBefore(renderer, parentEl, childEl, icuAnchorNode);
        }
        else {
            isProceduralRenderer(renderer) ? renderer.appendChild(parentEl, childEl) :
                parentEl.appendChild(childEl);
        }
        return true;
    }
    return false;
}
/**
 * Gets the top-level ng-container if ng-containers are nested.
 *
 * @param ngContainer The TNode of the starting ng-container
 * @returns tNode The TNode of the highest level ng-container
 */
function getHighestElementContainer(ngContainer) {
    while (ngContainer.parent != null && ngContainer.parent.type === 4 /* ElementContainer */) {
        ngContainer = ngContainer.parent;
    }
    return ngContainer;
}
export function getBeforeNodeForView(index, views, containerNative) {
    if (index + 1 < views.length) {
        var view = views[index + 1];
        var viewTNode = view[HOST_NODE];
        return viewTNode.child ? getNativeByTNode(viewTNode.child, view) : containerNative;
    }
    else {
        return containerNative;
    }
}
/**
 * Removes the `child` element from the DOM if not in view and not projected.
 *
 * @param childTNode The TNode of the child to remove
 * @param childEl The child that should be removed
 * @param currentView The current LView
 * @returns Whether or not the child was removed
 */
export function removeChild(childTNode, childEl, currentView) {
    // We only remove the element if not in View or not projected.
    if (childEl !== null && canInsertNativeNode(childTNode, currentView)) {
        var parentNative = getParentNative(childTNode, currentView);
        var renderer = currentView[RENDERER];
        isProceduralRenderer(renderer) ? renderer.removeChild(parentNative, childEl) :
            parentNative.removeChild(childEl);
        return true;
    }
    return false;
}
/**
 * Appends a projected node to the DOM, or in the case of a projected container,
 * appends the nodes from all of the container's active views to the DOM.
 *
 * @param projectedTNode The TNode to be projected
 * @param tProjectionNode The projection (ng-content) TNode
 * @param currentView Current LView
 * @param projectionView Projection view (view above current)
 */
export function appendProjectedNode(projectedTNode, tProjectionNode, currentView, projectionView) {
    var native = getNativeByTNode(projectedTNode, projectionView);
    appendChild(native, tProjectionNode, currentView);
    // the projected contents are processed while in the shadow view (which is the currentView)
    // therefore we need to extract the view where the host element lives since it's the
    // logical container of the content projected views
    attachPatchData(native, projectionView);
    var renderParent = getRenderParent(tProjectionNode, currentView);
    var nodeOrContainer = projectionView[projectedTNode.index];
    if (projectedTNode.type === 0 /* Container */) {
        // The node we are adding is a container and we are adding it to an element which
        // is not a component (no more re-projection).
        // Alternatively a container is projected at the root of a component's template
        // and can't be re-projected (as not content of any component).
        // Assign the final projection location in those cases.
        nodeOrContainer[RENDER_PARENT] = renderParent;
        var views = nodeOrContainer[VIEWS];
        for (var i = 0; i < views.length; i++) {
            addRemoveViewFromContainer(views[i], true, nodeOrContainer[NATIVE]);
        }
    }
    else {
        if (projectedTNode.type === 4 /* ElementContainer */) {
            var ngContainerChildTNode = projectedTNode.child;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZV9tYW5pcHVsYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9yZW5kZXIzL25vZGVfbWFuaXB1bGF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUdILE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUNwRCxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sU0FBUyxDQUFDO0FBQ2xDLE9BQU8sRUFBYSxNQUFNLEVBQUUsYUFBYSxFQUFFLEtBQUssRUFBRSw2QkFBNkIsSUFBSSxPQUFPLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUMxSCxPQUFPLEVBQStGLDZCQUE2QixJQUFJLE9BQU8sRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ3pLLE9BQU8sRUFBQyw2QkFBNkIsSUFBSSxPQUFPLEVBQUMsTUFBTSx5QkFBeUIsQ0FBQztBQUNqRixPQUFPLEVBQW1FLG9CQUFvQixFQUFFLDZCQUE2QixJQUFJLE9BQU8sRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQ3ZLLE9BQU8sRUFBQyxPQUFPLEVBQUUsZUFBZSxFQUFFLEtBQUssRUFBRSxhQUFhLEVBQUUsU0FBUyxFQUErQixJQUFJLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLDZCQUE2QixJQUFJLE9BQU8sRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQzNNLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDN0MsT0FBTyxFQUFDLGlCQUFpQixFQUFFLGdCQUFnQixFQUFFLFlBQVksRUFBRSxVQUFVLEVBQUUsZ0JBQWdCLEVBQUUsU0FBUyxFQUFDLE1BQU0sUUFBUSxDQUFDO0FBRWxILElBQU0sdUJBQXVCLEdBQUcsT0FBTyxHQUFHLE9BQU8sR0FBRyxPQUFPLEdBQUcsT0FBTyxHQUFHLE9BQU8sQ0FB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RyxZQUFZLENBQUM7UUFDOUMsSUFBTSxLQUFLLEdBQUcsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3JDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3JDLDBCQUEwQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7U0FDckU7S0FDRjtTQUFNO1FBQ0wsSUFBSSxjQUFjLENBQUMsSUFBSSw2QkFBK0IsRUFBRTtZQUN0RCxJQUFJLHFCQUFxQixHQUFlLGNBQWMsQ0FBQyxLQUFjLENBQUM7WUFDdEUsT0FBTyxxQkFBcUIsRUFBRTtnQkFDNUIsbUJBQW1CLENBQUMscUJBQXFCLEVBQUUsZUFBZSxFQUFFLFdBQVcsRUFBRSxjQUFjLENBQUMsQ0FBQztnQkFDekYscUJBQXFCLEdBQUcscUJBQXFCLENBQUMsSUFBSSxDQUFDO2FBQ3BEO1NBQ0Y7UUFFRCxJQUFJLFlBQVksQ0FBQyxlQUFlLENBQUMsRUFBRTtZQUNqQyxlQUFlLENBQUMsYUFBYSxDQUFDLEdBQUcsWUFBWSxDQUFDO1lBQzlDLFdBQVcsQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLEVBQUUsZUFBZSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1NBQ3BFO0tBQ0Y7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2Fzc2VydERlZmluZWR9IGZyb20gJy4vYXNzZXJ0JztcbmltcG9ydCB7YXR0YWNoUGF0Y2hEYXRhfSBmcm9tICcuL2NvbnRleHRfZGlzY292ZXJ5JztcbmltcG9ydCB7Y2FsbEhvb2tzfSBmcm9tICcuL2hvb2tzJztcbmltcG9ydCB7TENvbnRhaW5lciwgTkFUSVZFLCBSRU5ERVJfUEFSRU5ULCBWSUVXUywgdW51c2VkVmFsdWVFeHBvcnRUb1BsYWNhdGVBamQgYXMgdW51c2VkMX0gZnJvbSAnLi9pbnRlcmZhY2VzL2NvbnRhaW5lcic7XG5pbXBvcnQge1RDb250YWluZXJOb2RlLCBURWxlbWVudENvbnRhaW5lck5vZGUsIFRFbGVtZW50Tm9kZSwgVE5vZGUsIFROb2RlRmxhZ3MsIFROb2RlVHlwZSwgVFZpZXdOb2RlLCB1bnVzZWRWYWx1ZUV4cG9ydFRvUGxhY2F0ZUFqZCBhcyB1bnVzZWQyfSBmcm9tICcuL2ludGVyZmFjZXMvbm9kZSc7XG5pbXBvcnQge3VudXNlZFZhbHVlRXhwb3J0VG9QbGFjYXRlQWpkIGFzIHVudXNlZDN9IGZyb20gJy4vaW50ZXJmYWNlcy9wcm9qZWN0aW9uJztcbmltcG9ydCB7UHJvY2VkdXJhbFJlbmRlcmVyMywgUkNvbW1lbnQsIFJFbGVtZW50LCBSTm9kZSwgUlRleHQsIFJlbmRlcmVyMywgaXNQcm9jZWR1cmFsUmVuZGVyZXIsIHVudXNlZFZhbHVlRXhwb3J0VG9QbGFjYXRlQWpkIGFzIHVudXNlZDR9IGZyb20gJy4vaW50ZXJmYWNlcy9yZW5kZXJlcic7XG5pbXBvcnQge0NMRUFOVVAsIENPTlRBSU5FUl9JTkRFWCwgRkxBR1MsIEhFQURFUl9PRkZTRVQsIEhPU1RfTk9ERSwgSG9va0RhdGEsIExWaWV3LCBMVmlld0ZsYWdzLCBORVhULCBQQVJFTlQsIFFVRVJJRVMsIFJFTkRFUkVSLCBUVklFVywgdW51c2VkVmFsdWVFeHBvcnRUb1BsYWNhdGVBamQgYXMgdW51c2VkNX0gZnJvbSAnLi9pbnRlcmZhY2VzL3ZpZXcnO1xuaW1wb3J0IHthc3NlcnROb2RlVHlwZX0gZnJvbSAnLi9ub2RlX2Fzc2VydCc7XG5pbXBvcnQge2ZpbmRDb21wb25lbnRWaWV3LCBnZXROYXRpdmVCeVROb2RlLCBpc0xDb250YWluZXIsIGlzUm9vdFZpZXcsIHJlYWRFbGVtZW50VmFsdWUsIHN0cmluZ2lmeX0gZnJvbSAnLi91dGlsJztcblxuY29uc3QgdW51c2VkVmFsdWVUb1BsYWNhdGVBamQgPSB1bnVzZWQxICsgdW51c2VkMiArIHVudXNlZDMgKyB1bnVzZWQ0ICsgdW51c2VkNTtcblxuLyoqIFJldHJpZXZlcyB0aGUgcGFyZW50IGVsZW1lbnQgb2YgYSBnaXZlbiBub2RlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFBhcmVudE5hdGl2ZSh0Tm9kZTogVE5vZGUsIGN1cnJlbnRWaWV3OiBMVmlldyk6IFJFbGVtZW50fFJDb21tZW50fG51bGwge1xuICBpZiAodE5vZGUucGFyZW50ID09IG51bGwpIHtcbiAgICByZXR1cm4gZ2V0SG9zdE5hdGl2ZShjdXJyZW50Vmlldyk7XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgcGFyZW50VE5vZGUgPSBnZXRGaXJzdFBhcmVudE5hdGl2ZSh0Tm9kZSk7XG4gICAgcmV0dXJuIGdldE5hdGl2ZUJ5VE5vZGUocGFyZW50VE5vZGUsIGN1cnJlbnRWaWV3KTtcbiAgfVxufVxuXG4vKipcbiAqIEdldCB0aGUgZmlyc3QgcGFyZW50IG9mIGEgbm9kZSB0aGF0IGlzbid0IGFuIEljdUNvbnRhaW5lciBUTm9kZVxuICovXG5mdW5jdGlvbiBnZXRGaXJzdFBhcmVudE5hdGl2ZSh0Tm9kZTogVE5vZGUpOiBUTm9kZSB7XG4gIGxldCBwYXJlbnQgPSB0Tm9kZS5wYXJlbnQ7XG4gIHdoaWxlIChwYXJlbnQgJiYgcGFyZW50LnR5cGUgPT09IFROb2RlVHlwZS5JY3VDb250YWluZXIpIHtcbiAgICBwYXJlbnQgPSBwYXJlbnQucGFyZW50O1xuICB9XG4gIHJldHVybiBwYXJlbnQgITtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBob3N0IGVsZW1lbnQgZ2l2ZW4gYSB2aWV3LiBXaWxsIHJldHVybiBudWxsIGlmIHRoZSBjdXJyZW50IHZpZXcgaXMgYW4gZW1iZWRkZWQgdmlldyxcbiAqIHdoaWNoIGRvZXMgbm90IGhhdmUgYSBob3N0IGVsZW1lbnQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRIb3N0TmF0aXZlKGN1cnJlbnRWaWV3OiBMVmlldyk6IFJFbGVtZW50fG51bGwge1xuICBjb25zdCBob3N0VE5vZGUgPSBjdXJyZW50Vmlld1tIT1NUX05PREVdIGFzIFRFbGVtZW50Tm9kZTtcbiAgcmV0dXJuIGhvc3RUTm9kZSAmJiBob3N0VE5vZGUudHlwZSAhPT0gVE5vZGVUeXBlLlZpZXcgP1xuICAgICAgKGdldE5hdGl2ZUJ5VE5vZGUoaG9zdFROb2RlLCBjdXJyZW50Vmlld1tQQVJFTlRdICEpIGFzIFJFbGVtZW50KSA6XG4gICAgICBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0TENvbnRhaW5lcih0Tm9kZTogVFZpZXdOb2RlLCBlbWJlZGRlZFZpZXc6IExWaWV3KTogTENvbnRhaW5lcnxudWxsIHtcbiAgaWYgKHROb2RlLmluZGV4ID09PSAtMSkge1xuICAgIC8vIFRoaXMgaXMgYSBkeW5hbWljYWxseSBjcmVhdGVkIHZpZXcgaW5zaWRlIGEgZHluYW1pYyBjb250YWluZXIuXG4gICAgLy8gSWYgdGhlIGhvc3QgaW5kZXggaXMgLTEsIHRoZSB2aWV3IGhhcyBub3QgeWV0IGJlZW4gaW5zZXJ0ZWQsIHNvIGl0IGhhcyBubyBwYXJlbnQuXG4gICAgY29uc3QgY29udGFpbmVySG9zdEluZGV4ID0gZW1iZWRkZWRWaWV3W0NPTlRBSU5FUl9JTkRFWF07XG4gICAgcmV0dXJuIGNvbnRhaW5lckhvc3RJbmRleCA+IC0xID8gZW1iZWRkZWRWaWV3W1BBUkVOVF0gIVtjb250YWluZXJIb3N0SW5kZXhdIDogbnVsbDtcbiAgfSBlbHNlIHtcbiAgICAvLyBUaGlzIGlzIGEgaW5saW5lIHZpZXcgbm9kZSAoZS5nLiBlbWJlZGRlZFZpZXdTdGFydClcbiAgICByZXR1cm4gZW1iZWRkZWRWaWV3W1BBUkVOVF0gIVt0Tm9kZS5wYXJlbnQgIS5pbmRleF0gYXMgTENvbnRhaW5lcjtcbiAgfVxufVxuXG5cbi8qKlxuICogUmV0cmlldmVzIHJlbmRlciBwYXJlbnQgZm9yIGEgZ2l2ZW4gdmlldy5cbiAqIE1pZ2h0IGJlIG51bGwgaWYgYSB2aWV3IGlzIG5vdCB5ZXQgYXR0YWNoZWQgdG8gYW55IGNvbnRhaW5lci5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldENvbnRhaW5lclJlbmRlclBhcmVudCh0Vmlld05vZGU6IFRWaWV3Tm9kZSwgdmlldzogTFZpZXcpOiBSRWxlbWVudHxudWxsIHtcbiAgY29uc3QgY29udGFpbmVyID0gZ2V0TENvbnRhaW5lcih0Vmlld05vZGUsIHZpZXcpO1xuICByZXR1cm4gY29udGFpbmVyID8gY29udGFpbmVyW1JFTkRFUl9QQVJFTlRdIDogbnVsbDtcbn1cblxuY29uc3QgZW51bSBXYWxrVE5vZGVUcmVlQWN0aW9uIHtcbiAgLyoqIG5vZGUgaW5zZXJ0IGluIHRoZSBuYXRpdmUgZW52aXJvbm1lbnQgKi9cbiAgSW5zZXJ0ID0gMCxcblxuICAvKiogbm9kZSBkZXRhY2ggZnJvbSB0aGUgbmF0aXZlIGVudmlyb25tZW50ICovXG4gIERldGFjaCA9IDEsXG5cbiAgLyoqIG5vZGUgZGVzdHJ1Y3Rpb24gdXNpbmcgdGhlIHJlbmRlcmVyJ3MgQVBJICovXG4gIERlc3Ryb3kgPSAyLFxufVxuXG5cbi8qKlxuICogU3RhY2sgdXNlZCB0byBrZWVwIHRyYWNrIG9mIHByb2plY3Rpb24gbm9kZXMgaW4gd2Fsa1ROb2RlVHJlZS5cbiAqXG4gKiBUaGlzIGlzIGRlbGliZXJhdGVseSBjcmVhdGVkIG91dHNpZGUgb2Ygd2Fsa1ROb2RlVHJlZSB0byBhdm9pZCBhbGxvY2F0aW5nXG4gKiBhIG5ldyBhcnJheSBlYWNoIHRpbWUgdGhlIGZ1bmN0aW9uIGlzIGNhbGxlZC4gSW5zdGVhZCB0aGUgYXJyYXkgd2lsbCBiZVxuICogcmUtdXNlZCBieSBlYWNoIGludm9jYXRpb24uIFRoaXMgd29ya3MgYmVjYXVzZSB0aGUgZnVuY3Rpb24gaXMgbm90IHJlZW50cmFudC5cbiAqL1xuY29uc3QgcHJvamVjdGlvbk5vZGVTdGFjazogKExWaWV3IHwgVE5vZGUpW10gPSBbXTtcblxuLyoqXG4gKiBXYWxrcyBhIHRyZWUgb2YgVE5vZGVzLCBhcHBseWluZyBhIHRyYW5zZm9ybWF0aW9uIG9uIHRoZSBlbGVtZW50IG5vZGVzLCBlaXRoZXIgb25seSBvbiB0aGUgZmlyc3RcbiAqIG9uZSBmb3VuZCwgb3Igb24gYWxsIG9mIHRoZW0uXG4gKlxuICogQHBhcmFtIHZpZXdUb1dhbGsgdGhlIHZpZXcgdG8gd2Fsa1xuICogQHBhcmFtIGFjdGlvbiBpZGVudGlmaWVzIHRoZSBhY3Rpb24gdG8gYmUgcGVyZm9ybWVkIG9uIHRoZSBlbGVtZW50c1xuICogQHBhcmFtIHJlbmRlcmVyIHRoZSBjdXJyZW50IHJlbmRlcmVyLlxuICogQHBhcmFtIHJlbmRlclBhcmVudCBPcHRpb25hbCB0aGUgcmVuZGVyIHBhcmVudCBub2RlIHRvIGJlIHNldCBpbiBhbGwgTENvbnRhaW5lcnMgZm91bmQsXG4gKiByZXF1aXJlZCBmb3IgYWN0aW9uIG1vZGVzIEluc2VydCBhbmQgRGVzdHJveS5cbiAqIEBwYXJhbSBiZWZvcmVOb2RlIE9wdGlvbmFsIHRoZSBub2RlIGJlZm9yZSB3aGljaCBlbGVtZW50cyBzaG91bGQgYmUgYWRkZWQsIHJlcXVpcmVkIGZvciBhY3Rpb25cbiAqIEluc2VydC5cbiAqL1xuZnVuY3Rpb24gd2Fsa1ROb2RlVHJlZShcbiAgICB2aWV3VG9XYWxrOiBMVmlldywgYWN0aW9uOiBXYWxrVE5vZGVUcmVlQWN0aW9uLCByZW5kZXJlcjogUmVuZGVyZXIzLFxuICAgIHJlbmRlclBhcmVudDogUkVsZW1lbnQgfCBudWxsLCBiZWZvcmVOb2RlPzogUk5vZGUgfCBudWxsKSB7XG4gIGNvbnN0IHJvb3RUTm9kZSA9IHZpZXdUb1dhbGtbVFZJRVddLm5vZGUgYXMgVFZpZXdOb2RlO1xuICBsZXQgcHJvamVjdGlvbk5vZGVJbmRleCA9IC0xO1xuICBsZXQgY3VycmVudFZpZXcgPSB2aWV3VG9XYWxrO1xuICBsZXQgdE5vZGU6IFROb2RlfG51bGwgPSByb290VE5vZGUuY2hpbGQgYXMgVE5vZGU7XG4gIHdoaWxlICh0Tm9kZSkge1xuICAgIGxldCBuZXh0VE5vZGU6IFROb2RlfG51bGwgPSBudWxsO1xuICAgIGlmICh0Tm9kZS50eXBlID09PSBUTm9kZVR5cGUuRWxlbWVudCkge1xuICAgICAgZXhlY3V0ZU5vZGVBY3Rpb24oXG4gICAgICAgICAgYWN0aW9uLCByZW5kZXJlciwgcmVuZGVyUGFyZW50LCBnZXROYXRpdmVCeVROb2RlKHROb2RlLCBjdXJyZW50VmlldyksIGJlZm9yZU5vZGUpO1xuICAgICAgY29uc3Qgbm9kZU9yQ29udGFpbmVyID0gY3VycmVudFZpZXdbdE5vZGUuaW5kZXhdO1xuICAgICAgaWYgKGlzTENvbnRhaW5lcihub2RlT3JDb250YWluZXIpKSB7XG4gICAgICAgIC8vIFRoaXMgZWxlbWVudCBoYXMgYW4gTENvbnRhaW5lciwgYW5kIGl0cyBjb21tZW50IG5lZWRzIHRvIGJlIGhhbmRsZWRcbiAgICAgICAgZXhlY3V0ZU5vZGVBY3Rpb24oYWN0aW9uLCByZW5kZXJlciwgcmVuZGVyUGFyZW50LCBub2RlT3JDb250YWluZXJbTkFUSVZFXSwgYmVmb3JlTm9kZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0Tm9kZS50eXBlID09PSBUTm9kZVR5cGUuQ29udGFpbmVyKSB7XG4gICAgICBjb25zdCBsQ29udGFpbmVyID0gY3VycmVudFZpZXcgIVt0Tm9kZS5pbmRleF0gYXMgTENvbnRhaW5lcjtcbiAgICAgIGV4ZWN1dGVOb2RlQWN0aW9uKGFjdGlvbiwgcmVuZGVyZXIsIHJlbmRlclBhcmVudCwgbENvbnRhaW5lcltOQVRJVkVdLCBiZWZvcmVOb2RlKTtcblxuICAgICAgaWYgKHJlbmRlclBhcmVudCkgbENvbnRhaW5lcltSRU5ERVJfUEFSRU5UXSA9IHJlbmRlclBhcmVudDtcblxuICAgICAgaWYgKGxDb250YWluZXJbVklFV1NdLmxlbmd0aCkge1xuICAgICAgICBjdXJyZW50VmlldyA9IGxDb250YWluZXJbVklFV1NdWzBdO1xuICAgICAgICBuZXh0VE5vZGUgPSBjdXJyZW50Vmlld1tUVklFV10ubm9kZTtcblxuICAgICAgICAvLyBXaGVuIHRoZSB3YWxrZXIgZW50ZXJzIGEgY29udGFpbmVyLCB0aGVuIHRoZSBiZWZvcmVOb2RlIGhhcyB0byBiZWNvbWUgdGhlIGxvY2FsIG5hdGl2ZVxuICAgICAgICAvLyBjb21tZW50IG5vZGUuXG4gICAgICAgIGJlZm9yZU5vZGUgPSBsQ29udGFpbmVyW05BVElWRV07XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0Tm9kZS50eXBlID09PSBUTm9kZVR5cGUuUHJvamVjdGlvbikge1xuICAgICAgY29uc3QgY29tcG9uZW50VmlldyA9IGZpbmRDb21wb25lbnRWaWV3KGN1cnJlbnRWaWV3ICEpO1xuICAgICAgY29uc3QgY29tcG9uZW50SG9zdCA9IGNvbXBvbmVudFZpZXdbSE9TVF9OT0RFXSBhcyBURWxlbWVudE5vZGU7XG4gICAgICBjb25zdCBoZWFkOiBUTm9kZXxudWxsID1cbiAgICAgICAgICAoY29tcG9uZW50SG9zdC5wcm9qZWN0aW9uIGFzKFROb2RlIHwgbnVsbClbXSlbdE5vZGUucHJvamVjdGlvbiBhcyBudW1iZXJdO1xuXG4gICAgICAvLyBNdXN0IHN0b3JlIGJvdGggdGhlIFROb2RlIGFuZCB0aGUgdmlldyBiZWNhdXNlIHRoaXMgcHJvamVjdGlvbiBub2RlIGNvdWxkIGJlIG5lc3RlZFxuICAgICAgLy8gZGVlcGx5IGluc2lkZSBlbWJlZGRlZCB2aWV3cywgYW5kIHdlIG5lZWQgdG8gZ2V0IGJhY2sgZG93biB0byB0aGlzIHBhcnRpY3VsYXIgbmVzdGVkIHZpZXcuXG4gICAgICBwcm9qZWN0aW9uTm9kZVN0YWNrWysrcHJvamVjdGlvbk5vZGVJbmRleF0gPSB0Tm9kZTtcbiAgICAgIHByb2plY3Rpb25Ob2RlU3RhY2tbKytwcm9qZWN0aW9uTm9kZUluZGV4XSA9IGN1cnJlbnRWaWV3ICE7XG4gICAgICBpZiAoaGVhZCkge1xuICAgICAgICBjdXJyZW50VmlldyA9IGNvbXBvbmVudFZpZXdbUEFSRU5UXSAhO1xuICAgICAgICBuZXh0VE5vZGUgPSBjdXJyZW50Vmlld1tUVklFV10uZGF0YVtoZWFkLmluZGV4XSBhcyBUTm9kZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gT3RoZXJ3aXNlLCB0aGlzIGlzIGEgVmlldyBvciBhbiBFbGVtZW50Q29udGFpbmVyXG4gICAgICBuZXh0VE5vZGUgPSB0Tm9kZS5jaGlsZDtcbiAgICB9XG5cbiAgICBpZiAobmV4dFROb2RlID09PSBudWxsKSB7XG4gICAgICAvLyB0aGlzIGxhc3Qgbm9kZSB3YXMgcHJvamVjdGVkLCB3ZSBuZWVkIHRvIGdldCBiYWNrIGRvd24gdG8gaXRzIHByb2plY3Rpb24gbm9kZVxuICAgICAgaWYgKHROb2RlLm5leHQgPT09IG51bGwgJiYgKHROb2RlLmZsYWdzICYgVE5vZGVGbGFncy5pc1Byb2plY3RlZCkpIHtcbiAgICAgICAgY3VycmVudFZpZXcgPSBwcm9qZWN0aW9uTm9kZVN0YWNrW3Byb2plY3Rpb25Ob2RlSW5kZXgtLV0gYXMgTFZpZXc7XG4gICAgICAgIHROb2RlID0gcHJvamVjdGlvbk5vZGVTdGFja1twcm9qZWN0aW9uTm9kZUluZGV4LS1dIGFzIFROb2RlO1xuICAgICAgfVxuICAgICAgbmV4dFROb2RlID0gdE5vZGUubmV4dDtcblxuICAgICAgLyoqXG4gICAgICAgKiBGaW5kIHRoZSBuZXh0IG5vZGUgaW4gdGhlIFROb2RlIHRyZWUsIHRha2luZyBpbnRvIGFjY291bnQgdGhlIHBsYWNlIHdoZXJlIGEgbm9kZSBpc1xuICAgICAgICogcHJvamVjdGVkIChpbiB0aGUgc2hhZG93IERPTSkgcmF0aGVyIHRoYW4gd2hlcmUgaXQgY29tZXMgZnJvbSAoaW4gdGhlIGxpZ2h0IERPTSkuXG4gICAgICAgKlxuICAgICAgICogSWYgdGhlcmUgaXMgbm8gc2libGluZyBub2RlLCB0aGVuIGl0IGdvZXMgdG8gdGhlIG5leHQgc2libGluZyBvZiB0aGUgcGFyZW50IG5vZGUuLi5cbiAgICAgICAqIHVudGlsIGl0IHJlYWNoZXMgcm9vdE5vZGUgKGF0IHdoaWNoIHBvaW50IG51bGwgaXMgcmV0dXJuZWQpLlxuICAgICAgICovXG4gICAgICB3aGlsZSAoIW5leHRUTm9kZSkge1xuICAgICAgICAvLyBJZiBwYXJlbnQgaXMgbnVsbCwgd2UncmUgY3Jvc3NpbmcgdGhlIHZpZXcgYm91bmRhcnksIHNvIHdlIHNob3VsZCBnZXQgdGhlIGhvc3QgVE5vZGUuXG4gICAgICAgIHROb2RlID0gdE5vZGUucGFyZW50IHx8IGN1cnJlbnRWaWV3W1RWSUVXXS5ub2RlO1xuXG4gICAgICAgIGlmICh0Tm9kZSA9PT0gbnVsbCB8fCB0Tm9kZSA9PT0gcm9vdFROb2RlKSByZXR1cm4gbnVsbDtcblxuICAgICAgICAvLyBXaGVuIGV4aXRpbmcgYSBjb250YWluZXIsIHRoZSBiZWZvcmVOb2RlIG11c3QgYmUgcmVzdG9yZWQgdG8gdGhlIHByZXZpb3VzIHZhbHVlXG4gICAgICAgIGlmICh0Tm9kZS50eXBlID09PSBUTm9kZVR5cGUuQ29udGFpbmVyKSB7XG4gICAgICAgICAgY3VycmVudFZpZXcgPSBjdXJyZW50Vmlld1tQQVJFTlRdICE7XG4gICAgICAgICAgYmVmb3JlTm9kZSA9IGN1cnJlbnRWaWV3W3ROb2RlLmluZGV4XVtOQVRJVkVdO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHROb2RlLnR5cGUgPT09IFROb2RlVHlwZS5WaWV3ICYmIGN1cnJlbnRWaWV3W05FWFRdKSB7XG4gICAgICAgICAgY3VycmVudFZpZXcgPSBjdXJyZW50Vmlld1tORVhUXSBhcyBMVmlldztcbiAgICAgICAgICBuZXh0VE5vZGUgPSBjdXJyZW50Vmlld1tUVklFV10ubm9kZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBuZXh0VE5vZGUgPSB0Tm9kZS5uZXh0O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHROb2RlID0gbmV4dFROb2RlO1xuICB9XG59XG5cbi8qKlxuICogTk9URTogZm9yIHBlcmZvcm1hbmNlIHJlYXNvbnMsIHRoZSBwb3NzaWJsZSBhY3Rpb25zIGFyZSBpbmxpbmVkIHdpdGhpbiB0aGUgZnVuY3Rpb24gaW5zdGVhZCBvZlxuICogYmVpbmcgcGFzc2VkIGFzIGFuIGFyZ3VtZW50LlxuICovXG5mdW5jdGlvbiBleGVjdXRlTm9kZUFjdGlvbihcbiAgICBhY3Rpb246IFdhbGtUTm9kZVRyZWVBY3Rpb24sIHJlbmRlcmVyOiBSZW5kZXJlcjMsIHBhcmVudDogUkVsZW1lbnQgfCBudWxsLFxuICAgIG5vZGU6IFJDb21tZW50IHwgUkVsZW1lbnQgfCBSVGV4dCwgYmVmb3JlTm9kZT86IFJOb2RlIHwgbnVsbCkge1xuICBpZiAoYWN0aW9uID09PSBXYWxrVE5vZGVUcmVlQWN0aW9uLkluc2VydCkge1xuICAgIGlzUHJvY2VkdXJhbFJlbmRlcmVyKHJlbmRlcmVyICEpID9cbiAgICAgICAgKHJlbmRlcmVyIGFzIFByb2NlZHVyYWxSZW5kZXJlcjMpLmluc2VydEJlZm9yZShwYXJlbnQgISwgbm9kZSwgYmVmb3JlTm9kZSBhcyBSTm9kZSB8IG51bGwpIDpcbiAgICAgICAgcGFyZW50ICEuaW5zZXJ0QmVmb3JlKG5vZGUsIGJlZm9yZU5vZGUgYXMgUk5vZGUgfCBudWxsLCB0cnVlKTtcbiAgfSBlbHNlIGlmIChhY3Rpb24gPT09IFdhbGtUTm9kZVRyZWVBY3Rpb24uRGV0YWNoKSB7XG4gICAgaXNQcm9jZWR1cmFsUmVuZGVyZXIocmVuZGVyZXIgISkgP1xuICAgICAgICAocmVuZGVyZXIgYXMgUHJvY2VkdXJhbFJlbmRlcmVyMykucmVtb3ZlQ2hpbGQocGFyZW50ICEsIG5vZGUpIDpcbiAgICAgICAgcGFyZW50ICEucmVtb3ZlQ2hpbGQobm9kZSk7XG4gIH0gZWxzZSBpZiAoYWN0aW9uID09PSBXYWxrVE5vZGVUcmVlQWN0aW9uLkRlc3Ryb3kpIHtcbiAgICBuZ0Rldk1vZGUgJiYgbmdEZXZNb2RlLnJlbmRlcmVyRGVzdHJveU5vZGUrKztcbiAgICAocmVuZGVyZXIgYXMgUHJvY2VkdXJhbFJlbmRlcmVyMykuZGVzdHJveU5vZGUgIShub2RlKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlVGV4dE5vZGUodmFsdWU6IGFueSwgcmVuZGVyZXI6IFJlbmRlcmVyMyk6IFJUZXh0IHtcbiAgcmV0dXJuIGlzUHJvY2VkdXJhbFJlbmRlcmVyKHJlbmRlcmVyKSA/IHJlbmRlcmVyLmNyZWF0ZVRleHQoc3RyaW5naWZ5KHZhbHVlKSkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVuZGVyZXIuY3JlYXRlVGV4dE5vZGUoc3RyaW5naWZ5KHZhbHVlKSk7XG59XG5cbi8qKlxuICogQWRkcyBvciByZW1vdmVzIGFsbCBET00gZWxlbWVudHMgYXNzb2NpYXRlZCB3aXRoIGEgdmlldy5cbiAqXG4gKiBCZWNhdXNlIHNvbWUgcm9vdCBub2RlcyBvZiB0aGUgdmlldyBtYXkgYmUgY29udGFpbmVycywgd2Ugc29tZXRpbWVzIG5lZWRcbiAqIHRvIHByb3BhZ2F0ZSBkZWVwbHkgaW50byB0aGUgbmVzdGVkIGNvbnRhaW5lcnMgdG8gcmVtb3ZlIGFsbCBlbGVtZW50cyBpbiB0aGVcbiAqIHZpZXdzIGJlbmVhdGggaXQuXG4gKlxuICogQHBhcmFtIHZpZXdUb1dhbGsgVGhlIHZpZXcgZnJvbSB3aGljaCBlbGVtZW50cyBzaG91bGQgYmUgYWRkZWQgb3IgcmVtb3ZlZFxuICogQHBhcmFtIGluc2VydE1vZGUgV2hldGhlciBvciBub3QgZWxlbWVudHMgc2hvdWxkIGJlIGFkZGVkIChpZiBmYWxzZSwgcmVtb3ZpbmcpXG4gKiBAcGFyYW0gYmVmb3JlTm9kZSBUaGUgbm9kZSBiZWZvcmUgd2hpY2ggZWxlbWVudHMgc2hvdWxkIGJlIGFkZGVkLCBpZiBpbnNlcnQgbW9kZVxuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkUmVtb3ZlVmlld0Zyb21Db250YWluZXIoXG4gICAgdmlld1RvV2FsazogTFZpZXcsIGluc2VydE1vZGU6IHRydWUsIGJlZm9yZU5vZGU6IFJOb2RlIHwgbnVsbCk6IHZvaWQ7XG5leHBvcnQgZnVuY3Rpb24gYWRkUmVtb3ZlVmlld0Zyb21Db250YWluZXIodmlld1RvV2FsazogTFZpZXcsIGluc2VydE1vZGU6IGZhbHNlKTogdm9pZDtcbmV4cG9ydCBmdW5jdGlvbiBhZGRSZW1vdmVWaWV3RnJvbUNvbnRhaW5lcihcbiAgICB2aWV3VG9XYWxrOiBMVmlldywgaW5zZXJ0TW9kZTogYm9vbGVhbiwgYmVmb3JlTm9kZT86IFJOb2RlIHwgbnVsbCk6IHZvaWQge1xuICBjb25zdCByZW5kZXJQYXJlbnQgPSBnZXRDb250YWluZXJSZW5kZXJQYXJlbnQodmlld1RvV2Fsa1tUVklFV10ubm9kZSBhcyBUVmlld05vZGUsIHZpZXdUb1dhbGspO1xuICBuZ0Rldk1vZGUgJiYgYXNzZXJ0Tm9kZVR5cGUodmlld1RvV2Fsa1tUVklFV10ubm9kZSBhcyBUTm9kZSwgVE5vZGVUeXBlLlZpZXcpO1xuICBpZiAocmVuZGVyUGFyZW50KSB7XG4gICAgY29uc3QgcmVuZGVyZXIgPSB2aWV3VG9XYWxrW1JFTkRFUkVSXTtcbiAgICB3YWxrVE5vZGVUcmVlKFxuICAgICAgICB2aWV3VG9XYWxrLCBpbnNlcnRNb2RlID8gV2Fsa1ROb2RlVHJlZUFjdGlvbi5JbnNlcnQgOiBXYWxrVE5vZGVUcmVlQWN0aW9uLkRldGFjaCwgcmVuZGVyZXIsXG4gICAgICAgIHJlbmRlclBhcmVudCwgYmVmb3JlTm9kZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBUcmF2ZXJzZXMgZG93biBhbmQgdXAgdGhlIHRyZWUgb2Ygdmlld3MgYW5kIGNvbnRhaW5lcnMgdG8gcmVtb3ZlIGxpc3RlbmVycyBhbmRcbiAqIGNhbGwgb25EZXN0cm95IGNhbGxiYWNrcy5cbiAqXG4gKiBOb3RlczpcbiAqICAtIEJlY2F1c2UgaXQncyB1c2VkIGZvciBvbkRlc3Ryb3kgY2FsbHMsIGl0IG5lZWRzIHRvIGJlIGJvdHRvbS11cC5cbiAqICAtIE11c3QgcHJvY2VzcyBjb250YWluZXJzIGluc3RlYWQgb2YgdGhlaXIgdmlld3MgdG8gYXZvaWQgc3BsaWNpbmdcbiAqICB3aGVuIHZpZXdzIGFyZSBkZXN0cm95ZWQgYW5kIHJlLWFkZGVkLlxuICogIC0gVXNpbmcgYSB3aGlsZSBsb29wIGJlY2F1c2UgaXQncyBmYXN0ZXIgdGhhbiByZWN1cnNpb25cbiAqICAtIERlc3Ryb3kgb25seSBjYWxsZWQgb24gbW92ZW1lbnQgdG8gc2libGluZyBvciBtb3ZlbWVudCB0byBwYXJlbnQgKGxhdGVyYWxseSBvciB1cClcbiAqXG4gKiAgQHBhcmFtIHJvb3RWaWV3IFRoZSB2aWV3IHRvIGRlc3Ryb3lcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlc3Ryb3lWaWV3VHJlZShyb290VmlldzogTFZpZXcpOiB2b2lkIHtcbiAgLy8gSWYgdGhlIHZpZXcgaGFzIG5vIGNoaWxkcmVuLCB3ZSBjYW4gY2xlYW4gaXQgdXAgYW5kIHJldHVybiBlYXJseS5cbiAgaWYgKHJvb3RWaWV3W1RWSUVXXS5jaGlsZEluZGV4ID09PSAtMSkge1xuICAgIHJldHVybiBjbGVhblVwVmlldyhyb290Vmlldyk7XG4gIH1cbiAgbGV0IHZpZXdPckNvbnRhaW5lcjogTFZpZXd8TENvbnRhaW5lcnxudWxsID0gZ2V0TFZpZXdDaGlsZChyb290Vmlldyk7XG5cbiAgd2hpbGUgKHZpZXdPckNvbnRhaW5lcikge1xuICAgIGxldCBuZXh0OiBMVmlld3xMQ29udGFpbmVyfG51bGwgPSBudWxsO1xuXG4gICAgaWYgKHZpZXdPckNvbnRhaW5lci5sZW5ndGggPj0gSEVBREVSX09GRlNFVCkge1xuICAgICAgLy8gSWYgTFZpZXcsIHRyYXZlcnNlIGRvd24gdG8gY2hpbGQuXG4gICAgICBjb25zdCB2aWV3ID0gdmlld09yQ29udGFpbmVyIGFzIExWaWV3O1xuICAgICAgaWYgKHZpZXdbVFZJRVddLmNoaWxkSW5kZXggPiAtMSkgbmV4dCA9IGdldExWaWV3Q2hpbGQodmlldyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIElmIGNvbnRhaW5lciwgdHJhdmVyc2UgZG93biB0byBpdHMgZmlyc3QgTFZpZXcuXG4gICAgICBjb25zdCBjb250YWluZXIgPSB2aWV3T3JDb250YWluZXIgYXMgTENvbnRhaW5lcjtcbiAgICAgIGlmIChjb250YWluZXJbVklFV1NdLmxlbmd0aCkgbmV4dCA9IGNvbnRhaW5lcltWSUVXU11bMF07XG4gICAgfVxuXG4gICAgaWYgKG5leHQgPT0gbnVsbCkge1xuICAgICAgLy8gT25seSBjbGVhbiB1cCB2aWV3IHdoZW4gbW92aW5nIHRvIHRoZSBzaWRlIG9yIHVwLCBhcyBkZXN0cm95IGhvb2tzXG4gICAgICAvLyBzaG91bGQgYmUgY2FsbGVkIGluIG9yZGVyIGZyb20gdGhlIGJvdHRvbSB1cC5cbiAgICAgIHdoaWxlICh2aWV3T3JDb250YWluZXIgJiYgIXZpZXdPckNvbnRhaW5lciAhW05FWFRdICYmIHZpZXdPckNvbnRhaW5lciAhPT0gcm9vdFZpZXcpIHtcbiAgICAgICAgY2xlYW5VcFZpZXcodmlld09yQ29udGFpbmVyKTtcbiAgICAgICAgdmlld09yQ29udGFpbmVyID0gZ2V0UGFyZW50U3RhdGUodmlld09yQ29udGFpbmVyLCByb290Vmlldyk7XG4gICAgICB9XG4gICAgICBjbGVhblVwVmlldyh2aWV3T3JDb250YWluZXIgfHwgcm9vdFZpZXcpO1xuICAgICAgbmV4dCA9IHZpZXdPckNvbnRhaW5lciAmJiB2aWV3T3JDb250YWluZXIgIVtORVhUXTtcbiAgICB9XG4gICAgdmlld09yQ29udGFpbmVyID0gbmV4dDtcbiAgfVxufVxuXG4vKipcbiAqIEluc2VydHMgYSB2aWV3IGludG8gYSBjb250YWluZXIuXG4gKlxuICogVGhpcyBhZGRzIHRoZSB2aWV3IHRvIHRoZSBjb250YWluZXIncyBhcnJheSBvZiBhY3RpdmUgdmlld3MgaW4gdGhlIGNvcnJlY3RcbiAqIHBvc2l0aW9uLiBJdCBhbHNvIGFkZHMgdGhlIHZpZXcncyBlbGVtZW50cyB0byB0aGUgRE9NIGlmIHRoZSBjb250YWluZXIgaXNuJ3QgYVxuICogcm9vdCBub2RlIG9mIGFub3RoZXIgdmlldyAoaW4gdGhhdCBjYXNlLCB0aGUgdmlldydzIGVsZW1lbnRzIHdpbGwgYmUgYWRkZWQgd2hlblxuICogdGhlIGNvbnRhaW5lcidzIHBhcmVudCB2aWV3IGlzIGFkZGVkIGxhdGVyKS5cbiAqXG4gKiBAcGFyYW0gbFZpZXcgVGhlIHZpZXcgdG8gaW5zZXJ0XG4gKiBAcGFyYW0gbENvbnRhaW5lciBUaGUgY29udGFpbmVyIGludG8gd2hpY2ggdGhlIHZpZXcgc2hvdWxkIGJlIGluc2VydGVkXG4gKiBAcGFyYW0gcGFyZW50VmlldyBUaGUgbmV3IHBhcmVudCBvZiB0aGUgaW5zZXJ0ZWQgdmlld1xuICogQHBhcmFtIGluZGV4IFRoZSBpbmRleCBhdCB3aGljaCB0byBpbnNlcnQgdGhlIHZpZXdcbiAqIEBwYXJhbSBjb250YWluZXJJbmRleCBUaGUgaW5kZXggb2YgdGhlIGNvbnRhaW5lciBub2RlLCBpZiBkeW5hbWljXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnNlcnRWaWV3KFxuICAgIGxWaWV3OiBMVmlldywgbENvbnRhaW5lcjogTENvbnRhaW5lciwgcGFyZW50VmlldzogTFZpZXcsIGluZGV4OiBudW1iZXIsXG4gICAgY29udGFpbmVySW5kZXg6IG51bWJlcikge1xuICBjb25zdCB2aWV3cyA9IGxDb250YWluZXJbVklFV1NdO1xuXG4gIGlmIChpbmRleCA+IDApIHtcbiAgICAvLyBUaGlzIGlzIGEgbmV3IHZpZXcsIHdlIG5lZWQgdG8gYWRkIGl0IHRvIHRoZSBjaGlsZHJlbi5cbiAgICB2aWV3c1tpbmRleCAtIDFdW05FWFRdID0gbFZpZXc7XG4gIH1cblxuICBpZiAoaW5kZXggPCB2aWV3cy5sZW5ndGgpIHtcbiAgICBsVmlld1tORVhUXSA9IHZpZXdzW2luZGV4XTtcbiAgICB2aWV3cy5zcGxpY2UoaW5kZXgsIDAsIGxWaWV3KTtcbiAgfSBlbHNlIHtcbiAgICB2aWV3cy5wdXNoKGxWaWV3KTtcbiAgICBsVmlld1tORVhUXSA9IG51bGw7XG4gIH1cblxuICAvLyBEeW5hbWljYWxseSBpbnNlcnRlZCB2aWV3cyBuZWVkIGEgcmVmZXJlbmNlIHRvIHRoZWlyIHBhcmVudCBjb250YWluZXIncyBob3N0IHNvIGl0J3NcbiAgLy8gcG9zc2libGUgdG8ganVtcCBmcm9tIGEgdmlldyB0byBpdHMgY29udGFpbmVyJ3MgbmV4dCB3aGVuIHdhbGtpbmcgdGhlIG5vZGUgdHJlZS5cbiAgaWYgKGNvbnRhaW5lckluZGV4ID4gLTEpIHtcbiAgICBsVmlld1tDT05UQUlORVJfSU5ERVhdID0gY29udGFpbmVySW5kZXg7XG4gICAgbFZpZXdbUEFSRU5UXSA9IHBhcmVudFZpZXc7XG4gIH1cblxuICAvLyBOb3RpZnkgcXVlcnkgdGhhdCBhIG5ldyB2aWV3IGhhcyBiZWVuIGFkZGVkXG4gIGlmIChsVmlld1tRVUVSSUVTXSkge1xuICAgIGxWaWV3W1FVRVJJRVNdICEuaW5zZXJ0VmlldyhpbmRleCk7XG4gIH1cblxuICAvLyBTZXRzIHRoZSBhdHRhY2hlZCBmbGFnXG4gIGxWaWV3W0ZMQUdTXSB8PSBMVmlld0ZsYWdzLkF0dGFjaGVkO1xufVxuXG4vKipcbiAqIERldGFjaGVzIGEgdmlldyBmcm9tIGEgY29udGFpbmVyLlxuICpcbiAqIFRoaXMgbWV0aG9kIHNwbGljZXMgdGhlIHZpZXcgZnJvbSB0aGUgY29udGFpbmVyJ3MgYXJyYXkgb2YgYWN0aXZlIHZpZXdzLiBJdCBhbHNvXG4gKiByZW1vdmVzIHRoZSB2aWV3J3MgZWxlbWVudHMgZnJvbSB0aGUgRE9NLlxuICpcbiAqIEBwYXJhbSBsQ29udGFpbmVyIFRoZSBjb250YWluZXIgZnJvbSB3aGljaCB0byBkZXRhY2ggYSB2aWV3XG4gKiBAcGFyYW0gcmVtb3ZlSW5kZXggVGhlIGluZGV4IG9mIHRoZSB2aWV3IHRvIGRldGFjaFxuICogQHBhcmFtIGRldGFjaGVkIFdoZXRoZXIgb3Igbm90IHRoaXMgdmlldyBpcyBhbHJlYWR5IGRldGFjaGVkLlxuICogQHJldHVybnMgRGV0YWNoZWQgTFZpZXcgaW5zdGFuY2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZXRhY2hWaWV3KGxDb250YWluZXI6IExDb250YWluZXIsIHJlbW92ZUluZGV4OiBudW1iZXIsIGRldGFjaGVkOiBib29sZWFuKTogTFZpZXcge1xuICBjb25zdCB2aWV3cyA9IGxDb250YWluZXJbVklFV1NdO1xuICBjb25zdCB2aWV3VG9EZXRhY2ggPSB2aWV3c1tyZW1vdmVJbmRleF07XG4gIGlmIChyZW1vdmVJbmRleCA+IDApIHtcbiAgICB2aWV3c1tyZW1vdmVJbmRleCAtIDFdW05FWFRdID0gdmlld1RvRGV0YWNoW05FWFRdIGFzIExWaWV3O1xuICB9XG4gIHZpZXdzLnNwbGljZShyZW1vdmVJbmRleCwgMSk7XG4gIGlmICghZGV0YWNoZWQpIHtcbiAgICBhZGRSZW1vdmVWaWV3RnJvbUNvbnRhaW5lcih2aWV3VG9EZXRhY2gsIGZhbHNlKTtcbiAgfVxuXG4gIGlmICh2aWV3VG9EZXRhY2hbUVVFUklFU10pIHtcbiAgICB2aWV3VG9EZXRhY2hbUVVFUklFU10gIS5yZW1vdmVWaWV3KCk7XG4gIH1cbiAgdmlld1RvRGV0YWNoW0NPTlRBSU5FUl9JTkRFWF0gPSAtMTtcbiAgdmlld1RvRGV0YWNoW1BBUkVOVF0gPSBudWxsO1xuICAvLyBVbnNldHMgdGhlIGF0dGFjaGVkIGZsYWdcbiAgdmlld1RvRGV0YWNoW0ZMQUdTXSAmPSB+TFZpZXdGbGFncy5BdHRhY2hlZDtcbiAgcmV0dXJuIHZpZXdUb0RldGFjaDtcbn1cblxuLyoqXG4gKiBSZW1vdmVzIGEgdmlldyBmcm9tIGEgY29udGFpbmVyLCBpLmUuIGRldGFjaGVzIGl0IGFuZCB0aGVuIGRlc3Ryb3lzIHRoZSB1bmRlcmx5aW5nIExWaWV3LlxuICpcbiAqIEBwYXJhbSBsQ29udGFpbmVyIFRoZSBjb250YWluZXIgZnJvbSB3aGljaCB0byByZW1vdmUgYSB2aWV3XG4gKiBAcGFyYW0gdENvbnRhaW5lciBUaGUgVENvbnRhaW5lciBub2RlIGFzc29jaWF0ZWQgd2l0aCB0aGUgTENvbnRhaW5lclxuICogQHBhcmFtIHJlbW92ZUluZGV4IFRoZSBpbmRleCBvZiB0aGUgdmlldyB0byByZW1vdmVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZVZpZXcoXG4gICAgbENvbnRhaW5lcjogTENvbnRhaW5lciwgY29udGFpbmVySG9zdDogVEVsZW1lbnROb2RlIHwgVENvbnRhaW5lck5vZGUgfCBURWxlbWVudENvbnRhaW5lck5vZGUsXG4gICAgcmVtb3ZlSW5kZXg6IG51bWJlcikge1xuICBjb25zdCB2aWV3ID0gbENvbnRhaW5lcltWSUVXU11bcmVtb3ZlSW5kZXhdO1xuICBkZXRhY2hWaWV3KGxDb250YWluZXIsIHJlbW92ZUluZGV4LCAhIWNvbnRhaW5lckhvc3QuZGV0YWNoZWQpO1xuICBkZXN0cm95TFZpZXcodmlldyk7XG59XG5cbi8qKiBHZXRzIHRoZSBjaGlsZCBvZiB0aGUgZ2l2ZW4gTFZpZXcgKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMVmlld0NoaWxkKGxWaWV3OiBMVmlldyk6IExWaWV3fExDb250YWluZXJ8bnVsbCB7XG4gIGNvbnN0IGNoaWxkSW5kZXggPSBsVmlld1tUVklFV10uY2hpbGRJbmRleDtcbiAgcmV0dXJuIGNoaWxkSW5kZXggPT09IC0xID8gbnVsbCA6IGxWaWV3W2NoaWxkSW5kZXhdO1xufVxuXG4vKipcbiAqIEEgc3RhbmRhbG9uZSBmdW5jdGlvbiB3aGljaCBkZXN0cm95cyBhbiBMVmlldyxcbiAqIGNvbmR1Y3RpbmcgY2xlYW51cCAoZS5nLiByZW1vdmluZyBsaXN0ZW5lcnMsIGNhbGxpbmcgb25EZXN0cm95cykuXG4gKlxuICogQHBhcmFtIHZpZXcgVGhlIHZpZXcgdG8gYmUgZGVzdHJveWVkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVzdHJveUxWaWV3KHZpZXc6IExWaWV3KSB7XG4gIGNvbnN0IHJlbmRlcmVyID0gdmlld1tSRU5ERVJFUl07XG4gIGlmIChpc1Byb2NlZHVyYWxSZW5kZXJlcihyZW5kZXJlcikgJiYgcmVuZGVyZXIuZGVzdHJveU5vZGUpIHtcbiAgICB3YWxrVE5vZGVUcmVlKHZpZXcsIFdhbGtUTm9kZVRyZWVBY3Rpb24uRGVzdHJveSwgcmVuZGVyZXIsIG51bGwpO1xuICB9XG4gIGRlc3Ryb3lWaWV3VHJlZSh2aWV3KTtcbiAgLy8gU2V0cyB0aGUgZGVzdHJveWVkIGZsYWdcbiAgdmlld1tGTEFHU10gfD0gTFZpZXdGbGFncy5EZXN0cm95ZWQ7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lcyB3aGljaCBMVmlld09yTENvbnRhaW5lciB0byBqdW1wIHRvIHdoZW4gdHJhdmVyc2luZyBiYWNrIHVwIHRoZVxuICogdHJlZSBpbiBkZXN0cm95Vmlld1RyZWUuXG4gKlxuICogTm9ybWFsbHksIHRoZSB2aWV3J3MgcGFyZW50IExWaWV3IHNob3VsZCBiZSBjaGVja2VkLCBidXQgaW4gdGhlIGNhc2Ugb2ZcbiAqIGVtYmVkZGVkIHZpZXdzLCB0aGUgY29udGFpbmVyICh3aGljaCBpcyB0aGUgdmlldyBub2RlJ3MgcGFyZW50LCBidXQgbm90IHRoZVxuICogTFZpZXcncyBwYXJlbnQpIG5lZWRzIHRvIGJlIGNoZWNrZWQgZm9yIGEgcG9zc2libGUgbmV4dCBwcm9wZXJ0eS5cbiAqXG4gKiBAcGFyYW0gc3RhdGUgVGhlIExWaWV3T3JMQ29udGFpbmVyIGZvciB3aGljaCB3ZSBuZWVkIGEgcGFyZW50IHN0YXRlXG4gKiBAcGFyYW0gcm9vdFZpZXcgVGhlIHJvb3RWaWV3LCBzbyB3ZSBkb24ndCBwcm9wYWdhdGUgdG9vIGZhciB1cCB0aGUgdmlldyB0cmVlXG4gKiBAcmV0dXJucyBUaGUgY29ycmVjdCBwYXJlbnQgTFZpZXdPckxDb250YWluZXJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFBhcmVudFN0YXRlKHN0YXRlOiBMVmlldyB8IExDb250YWluZXIsIHJvb3RWaWV3OiBMVmlldyk6IExWaWV3fExDb250YWluZXJ8bnVsbCB7XG4gIGxldCB0Tm9kZTtcbiAgaWYgKHN0YXRlLmxlbmd0aCA+PSBIRUFERVJfT0ZGU0VUICYmICh0Tm9kZSA9IChzdGF0ZSBhcyBMVmlldykgIVtIT1NUX05PREVdKSAmJlxuICAgICAgdE5vZGUudHlwZSA9PT0gVE5vZGVUeXBlLlZpZXcpIHtcbiAgICAvLyBpZiBpdCdzIGFuIGVtYmVkZGVkIHZpZXcsIHRoZSBzdGF0ZSBuZWVkcyB0byBnbyB1cCB0byB0aGUgY29udGFpbmVyLCBpbiBjYXNlIHRoZVxuICAgIC8vIGNvbnRhaW5lciBoYXMgYSBuZXh0XG4gICAgcmV0dXJuIGdldExDb250YWluZXIodE5vZGUgYXMgVFZpZXdOb2RlLCBzdGF0ZSBhcyBMVmlldykgYXMgTENvbnRhaW5lcjtcbiAgfSBlbHNlIHtcbiAgICAvLyBvdGhlcndpc2UsIHVzZSBwYXJlbnQgdmlldyBmb3IgY29udGFpbmVycyBvciBjb21wb25lbnQgdmlld3NcbiAgICByZXR1cm4gc3RhdGVbUEFSRU5UXSA9PT0gcm9vdFZpZXcgPyBudWxsIDogc3RhdGVbUEFSRU5UXTtcbiAgfVxufVxuXG4vKipcbiAqIENhbGxzIG9uRGVzdHJveXMgaG9va3MgZm9yIGFsbCBkaXJlY3RpdmVzIGFuZCBwaXBlcyBpbiBhIGdpdmVuIHZpZXcgYW5kIHRoZW4gcmVtb3ZlcyBhbGxcbiAqIGxpc3RlbmVycy4gTGlzdGVuZXJzIGFyZSByZW1vdmVkIGFzIHRoZSBsYXN0IHN0ZXAgc28gZXZlbnRzIGRlbGl2ZXJlZCBpbiB0aGUgb25EZXN0cm95cyBob29rc1xuICogY2FuIGJlIHByb3BhZ2F0ZWQgdG8gQE91dHB1dCBsaXN0ZW5lcnMuXG4gKlxuICogQHBhcmFtIHZpZXcgVGhlIExWaWV3IHRvIGNsZWFuIHVwXG4gKi9cbmZ1bmN0aW9uIGNsZWFuVXBWaWV3KHZpZXdPckNvbnRhaW5lcjogTFZpZXcgfCBMQ29udGFpbmVyKTogdm9pZCB7XG4gIGlmICgodmlld09yQ29udGFpbmVyIGFzIExWaWV3KS5sZW5ndGggPj0gSEVBREVSX09GRlNFVCkge1xuICAgIGNvbnN0IHZpZXcgPSB2aWV3T3JDb250YWluZXIgYXMgTFZpZXc7XG4gICAgZXhlY3V0ZU9uRGVzdHJveXModmlldyk7XG4gICAgZXhlY3V0ZVBpcGVPbkRlc3Ryb3lzKHZpZXcpO1xuICAgIHJlbW92ZUxpc3RlbmVycyh2aWV3KTtcbiAgICBjb25zdCBob3N0VE5vZGUgPSB2aWV3W0hPU1RfTk9ERV07XG4gICAgLy8gRm9yIGNvbXBvbmVudCB2aWV3cyBvbmx5LCB0aGUgbG9jYWwgcmVuZGVyZXIgaXMgZGVzdHJveWVkIGFzIGNsZWFuIHVwIHRpbWUuXG4gICAgaWYgKGhvc3RUTm9kZSAmJiBob3N0VE5vZGUudHlwZSA9PT0gVE5vZGVUeXBlLkVsZW1lbnQgJiYgaXNQcm9jZWR1cmFsUmVuZGVyZXIodmlld1tSRU5ERVJFUl0pKSB7XG4gICAgICBuZ0Rldk1vZGUgJiYgbmdEZXZNb2RlLnJlbmRlcmVyRGVzdHJveSsrO1xuICAgICAgKHZpZXdbUkVOREVSRVJdIGFzIFByb2NlZHVyYWxSZW5kZXJlcjMpLmRlc3Ryb3koKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqIFJlbW92ZXMgbGlzdGVuZXJzIGFuZCB1bnN1YnNjcmliZXMgZnJvbSBvdXRwdXQgc3Vic2NyaXB0aW9ucyAqL1xuZnVuY3Rpb24gcmVtb3ZlTGlzdGVuZXJzKGxWaWV3OiBMVmlldyk6IHZvaWQge1xuICBjb25zdCB0Q2xlYW51cCA9IGxWaWV3W1RWSUVXXS5jbGVhbnVwICE7XG4gIGlmICh0Q2xlYW51cCAhPSBudWxsKSB7XG4gICAgY29uc3QgbENsZWFudXAgPSBsVmlld1tDTEVBTlVQXSAhO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdENsZWFudXAubGVuZ3RoIC0gMTsgaSArPSAyKSB7XG4gICAgICBpZiAodHlwZW9mIHRDbGVhbnVwW2ldID09PSAnc3RyaW5nJykge1xuICAgICAgICAvLyBUaGlzIGlzIGEgbGlzdGVuZXIgd2l0aCB0aGUgbmF0aXZlIHJlbmRlcmVyXG4gICAgICAgIGNvbnN0IGlkeCA9IHRDbGVhbnVwW2kgKyAxXTtcbiAgICAgICAgY29uc3QgbGlzdGVuZXIgPSBsQ2xlYW51cFt0Q2xlYW51cFtpICsgMl1dO1xuICAgICAgICBjb25zdCBuYXRpdmUgPSByZWFkRWxlbWVudFZhbHVlKGxWaWV3W2lkeF0pO1xuICAgICAgICBjb25zdCB1c2VDYXB0dXJlT3JTdWJJZHggPSB0Q2xlYW51cFtpICsgM107XG4gICAgICAgIGlmICh0eXBlb2YgdXNlQ2FwdHVyZU9yU3ViSWR4ID09PSAnYm9vbGVhbicpIHtcbiAgICAgICAgICAvLyBET00gbGlzdGVuZXJcbiAgICAgICAgICBuYXRpdmUucmVtb3ZlRXZlbnRMaXN0ZW5lcih0Q2xlYW51cFtpXSwgbGlzdGVuZXIsIHVzZUNhcHR1cmVPclN1YklkeCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKHVzZUNhcHR1cmVPclN1YklkeCA+PSAwKSB7XG4gICAgICAgICAgICAvLyB1bnJlZ2lzdGVyXG4gICAgICAgICAgICBsQ2xlYW51cFt1c2VDYXB0dXJlT3JTdWJJZHhdKCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFN1YnNjcmlwdGlvblxuICAgICAgICAgICAgbENsZWFudXBbLXVzZUNhcHR1cmVPclN1YklkeF0udW5zdWJzY3JpYmUoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaSArPSAyO1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdENsZWFudXBbaV0gPT09ICdudW1iZXInKSB7XG4gICAgICAgIC8vIFRoaXMgaXMgYSBsaXN0ZW5lciB3aXRoIHJlbmRlcmVyMiAoY2xlYW51cCBmbiBjYW4gYmUgZm91bmQgYnkgaW5kZXgpXG4gICAgICAgIGNvbnN0IGNsZWFudXBGbiA9IGxDbGVhbnVwW3RDbGVhbnVwW2ldXTtcbiAgICAgICAgY2xlYW51cEZuKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBUaGlzIGlzIGEgY2xlYW51cCBmdW5jdGlvbiB0aGF0IGlzIGdyb3VwZWQgd2l0aCB0aGUgaW5kZXggb2YgaXRzIGNvbnRleHRcbiAgICAgICAgY29uc3QgY29udGV4dCA9IGxDbGVhbnVwW3RDbGVhbnVwW2kgKyAxXV07XG4gICAgICAgIHRDbGVhbnVwW2ldLmNhbGwoY29udGV4dCk7XG4gICAgICB9XG4gICAgfVxuICAgIGxWaWV3W0NMRUFOVVBdID0gbnVsbDtcbiAgfVxufVxuXG4vKiogQ2FsbHMgb25EZXN0cm95IGhvb2tzIGZvciB0aGlzIHZpZXcgKi9cbmZ1bmN0aW9uIGV4ZWN1dGVPbkRlc3Ryb3lzKHZpZXc6IExWaWV3KTogdm9pZCB7XG4gIGNvbnN0IHRWaWV3ID0gdmlld1tUVklFV107XG4gIGxldCBkZXN0cm95SG9va3M6IEhvb2tEYXRhfG51bGw7XG4gIGlmICh0VmlldyAhPSBudWxsICYmIChkZXN0cm95SG9va3MgPSB0Vmlldy5kZXN0cm95SG9va3MpICE9IG51bGwpIHtcbiAgICBjYWxsSG9va3ModmlldywgZGVzdHJveUhvb2tzKTtcbiAgfVxufVxuXG4vKiogQ2FsbHMgcGlwZSBkZXN0cm95IGhvb2tzIGZvciB0aGlzIHZpZXcgKi9cbmZ1bmN0aW9uIGV4ZWN1dGVQaXBlT25EZXN0cm95cyhsVmlldzogTFZpZXcpOiB2b2lkIHtcbiAgY29uc3QgcGlwZURlc3Ryb3lIb29rcyA9IGxWaWV3W1RWSUVXXSAmJiBsVmlld1tUVklFV10ucGlwZURlc3Ryb3lIb29rcztcbiAgaWYgKHBpcGVEZXN0cm95SG9va3MpIHtcbiAgICBjYWxsSG9va3MobFZpZXcgISwgcGlwZURlc3Ryb3lIb29rcyk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFJlbmRlclBhcmVudCh0Tm9kZTogVE5vZGUsIGN1cnJlbnRWaWV3OiBMVmlldyk6IFJFbGVtZW50fG51bGwge1xuICBpZiAoY2FuSW5zZXJ0TmF0aXZlTm9kZSh0Tm9kZSwgY3VycmVudFZpZXcpKSB7XG4gICAgLy8gSWYgd2UgYXJlIGFza2VkIGZvciBhIHJlbmRlciBwYXJlbnQgb2YgdGhlIHJvb3QgY29tcG9uZW50IHdlIG5lZWQgdG8gZG8gbG93LWxldmVsIERPTVxuICAgIC8vIG9wZXJhdGlvbiBhcyBMVHJlZSBkb2Vzbid0IGV4aXN0IGFib3ZlIHRoZSB0b3Btb3N0IGhvc3Qgbm9kZS4gV2UgbWlnaHQgbmVlZCB0byBmaW5kIGEgcmVuZGVyXG4gICAgLy8gcGFyZW50IG9mIHRoZSB0b3Btb3N0IGhvc3Qgbm9kZSBpZiB0aGUgcm9vdCBjb21wb25lbnQgaW5qZWN0cyBWaWV3Q29udGFpbmVyUmVmLlxuICAgIGlmIChpc1Jvb3RWaWV3KGN1cnJlbnRWaWV3KSkge1xuICAgICAgcmV0dXJuIG5hdGl2ZVBhcmVudE5vZGUoY3VycmVudFZpZXdbUkVOREVSRVJdLCBnZXROYXRpdmVCeVROb2RlKHROb2RlLCBjdXJyZW50VmlldykpO1xuICAgIH1cblxuICAgIGNvbnN0IGhvc3RUTm9kZSA9IGN1cnJlbnRWaWV3W0hPU1RfTk9ERV07XG5cbiAgICBjb25zdCB0Tm9kZVBhcmVudCA9IHROb2RlLnBhcmVudDtcbiAgICBpZiAodE5vZGVQYXJlbnQgIT0gbnVsbCAmJiB0Tm9kZVBhcmVudC50eXBlID09PSBUTm9kZVR5cGUuRWxlbWVudENvbnRhaW5lcikge1xuICAgICAgdE5vZGUgPSBnZXRIaWdoZXN0RWxlbWVudENvbnRhaW5lcih0Tm9kZVBhcmVudCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHROb2RlLnBhcmVudCA9PSBudWxsICYmIGhvc3RUTm9kZSAhLnR5cGUgPT09IFROb2RlVHlwZS5WaWV3ID9cbiAgICAgICAgZ2V0Q29udGFpbmVyUmVuZGVyUGFyZW50KGhvc3RUTm9kZSBhcyBUVmlld05vZGUsIGN1cnJlbnRWaWV3KSA6XG4gICAgICAgIGdldFBhcmVudE5hdGl2ZSh0Tm9kZSwgY3VycmVudFZpZXcpIGFzIFJFbGVtZW50O1xuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG5mdW5jdGlvbiBjYW5JbnNlcnROYXRpdmVDaGlsZE9mRWxlbWVudCh0Tm9kZTogVE5vZGUpOiBib29sZWFuIHtcbiAgLy8gSWYgdGhlIHBhcmVudCBpcyBudWxsLCB0aGVuIHdlIGFyZSBpbnNlcnRpbmcgYWNyb3NzIHZpZXdzLiBUaGlzIGhhcHBlbnMgd2hlbiB3ZVxuICAvLyBpbnNlcnQgYSByb290IGVsZW1lbnQgb2YgdGhlIGNvbXBvbmVudCB2aWV3IGludG8gdGhlIGNvbXBvbmVudCBob3N0IGVsZW1lbnQgYW5kIGl0XG4gIC8vIHNob3VsZCBhbHdheXMgYmUgZWFnZXIuXG4gIGlmICh0Tm9kZS5wYXJlbnQgPT0gbnVsbCB8fFxuICAgICAgLy8gV2Ugc2hvdWxkIGFsc28gZWFnZXJseSBpbnNlcnQgaWYgdGhlIHBhcmVudCBpcyBhIHJlZ3VsYXIsIG5vbi1jb21wb25lbnQgZWxlbWVudFxuICAgICAgLy8gc2luY2Ugd2Uga25vdyB0aGF0IHRoaXMgcmVsYXRpb25zaGlwIHdpbGwgbmV2ZXIgYmUgYnJva2VuLlxuICAgICAgdE5vZGUucGFyZW50LnR5cGUgPT09IFROb2RlVHlwZS5FbGVtZW50ICYmICEodE5vZGUucGFyZW50LmZsYWdzICYgVE5vZGVGbGFncy5pc0NvbXBvbmVudCkpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8vIFBhcmVudCBpcyBhIENvbXBvbmVudC4gQ29tcG9uZW50J3MgY29udGVudCBub2RlcyBhcmUgbm90IGluc2VydGVkIGltbWVkaWF0ZWx5XG4gIC8vIGJlY2F1c2UgdGhleSB3aWxsIGJlIHByb2plY3RlZCwgYW5kIHNvIGRvaW5nIGluc2VydCBhdCB0aGlzIHBvaW50IHdvdWxkIGJlIHdhc3RlZnVsLlxuICAvLyBTaW5jZSB0aGUgcHJvamVjdGlvbiB3b3VsZCB0aGFuIG1vdmUgaXQgdG8gaXRzIGZpbmFsIGRlc3RpbmF0aW9uLlxuICByZXR1cm4gZmFsc2U7XG59XG5cbi8qKlxuICogV2UgbWlnaHQgZGVsYXkgaW5zZXJ0aW9uIG9mIGNoaWxkcmVuIGZvciBhIGdpdmVuIHZpZXcgaWYgaXQgaXMgZGlzY29ubmVjdGVkLlxuICogVGhpcyBtaWdodCBoYXBwZW4gZm9yIDIgbWFpbiByZWFzb25zOlxuICogLSB2aWV3IGlzIG5vdCBpbnNlcnRlZCBpbnRvIGFueSBjb250YWluZXIgKHZpZXcgd2FzIGNyZWF0ZWQgYnV0IG5vdCBpbnNlcnRlZCB5ZXQpXG4gKiAtIHZpZXcgaXMgaW5zZXJ0ZWQgaW50byBhIGNvbnRhaW5lciBidXQgdGhlIGNvbnRhaW5lciBpdHNlbGYgaXMgbm90IGluc2VydGVkIGludG8gdGhlIERPTVxuICogKGNvbnRhaW5lciBtaWdodCBiZSBwYXJ0IG9mIHByb2plY3Rpb24gb3IgY2hpbGQgb2YgYSB2aWV3IHRoYXQgaXMgbm90IGluc2VydGVkIHlldCkuXG4gKlxuICogSW4gb3RoZXIgd29yZHMgd2UgY2FuIGluc2VydCBjaGlsZHJlbiBvZiBhIGdpdmVuIHZpZXcgaWYgdGhpcyB2aWV3IHdhcyBpbnNlcnRlZCBpbnRvIGEgY29udGFpbmVyXG4gKiBhbmRcbiAqIHRoZSBjb250YWluZXIgaXRzZWxmIGhhcyBpdHMgcmVuZGVyIHBhcmVudCBkZXRlcm1pbmVkLlxuICovXG5mdW5jdGlvbiBjYW5JbnNlcnROYXRpdmVDaGlsZE9mVmlldyh2aWV3VE5vZGU6IFRWaWV3Tm9kZSwgdmlldzogTFZpZXcpOiBib29sZWFuIHtcbiAgLy8gQmVjYXVzZSB3ZSBhcmUgaW5zZXJ0aW5nIGludG8gYSBgVmlld2AgdGhlIGBWaWV3YCBtYXkgYmUgZGlzY29ubmVjdGVkLlxuICBjb25zdCBjb250YWluZXIgPSBnZXRMQ29udGFpbmVyKHZpZXdUTm9kZSwgdmlldykgITtcbiAgaWYgKGNvbnRhaW5lciA9PSBudWxsIHx8IGNvbnRhaW5lcltSRU5ERVJfUEFSRU5UXSA9PSBudWxsKSB7XG4gICAgLy8gVGhlIGBWaWV3YCBpcyBub3QgaW5zZXJ0ZWQgaW50byBhIGBDb250YWluZXJgIG9yIHRoZSBwYXJlbnQgYENvbnRhaW5lcmBcbiAgICAvLyBpdHNlbGYgaXMgZGlzY29ubmVjdGVkLiBTbyB3ZSBoYXZlIHRvIGRlbGF5LlxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIFRoZSBwYXJlbnQgYENvbnRhaW5lcmAgaXMgaW4gaW5zZXJ0ZWQgc3RhdGUsIHNvIHdlIGNhbiBlYWdlcmx5IGluc2VydCBpbnRvXG4gIC8vIHRoaXMgbG9jYXRpb24uXG4gIHJldHVybiB0cnVlO1xufVxuXG4vKipcbiAqIFJldHVybnMgd2hldGhlciBhIG5hdGl2ZSBlbGVtZW50IGNhbiBiZSBpbnNlcnRlZCBpbnRvIHRoZSBnaXZlbiBwYXJlbnQuXG4gKlxuICogVGhlcmUgYXJlIHR3byByZWFzb25zIHdoeSB3ZSBtYXkgbm90IGJlIGFibGUgdG8gaW5zZXJ0IGEgZWxlbWVudCBpbW1lZGlhdGVseS5cbiAqIC0gUHJvamVjdGlvbjogV2hlbiBjcmVhdGluZyBhIGNoaWxkIGNvbnRlbnQgZWxlbWVudCBvZiBhIGNvbXBvbmVudCwgd2UgaGF2ZSB0byBza2lwIHRoZVxuICogICBpbnNlcnRpb24gYmVjYXVzZSB0aGUgY29udGVudCBvZiBhIGNvbXBvbmVudCB3aWxsIGJlIHByb2plY3RlZC5cbiAqICAgYDxjb21wb25lbnQ+PGNvbnRlbnQ+ZGVsYXllZCBkdWUgdG8gcHJvamVjdGlvbjwvY29udGVudD48L2NvbXBvbmVudD5gXG4gKiAtIFBhcmVudCBjb250YWluZXIgaXMgZGlzY29ubmVjdGVkOiBUaGlzIGNhbiBoYXBwZW4gd2hlbiB3ZSBhcmUgaW5zZXJ0aW5nIGEgdmlldyBpbnRvXG4gKiAgIHBhcmVudCBjb250YWluZXIsIHdoaWNoIGl0c2VsZiBpcyBkaXNjb25uZWN0ZWQuIEZvciBleGFtcGxlIHRoZSBwYXJlbnQgY29udGFpbmVyIGlzIHBhcnRcbiAqICAgb2YgYSBWaWV3IHdoaWNoIGhhcyBub3QgYmUgaW5zZXJ0ZWQgb3IgaXMgbWFyZSBmb3IgcHJvamVjdGlvbiBidXQgaGFzIG5vdCBiZWVuIGluc2VydGVkXG4gKiAgIGludG8gZGVzdGluYXRpb24uXG4gKlxuXG4gKlxuICogQHBhcmFtIHROb2RlIFRoZSB0Tm9kZSBvZiB0aGUgbm9kZSB0aGF0IHdlIHdhbnQgdG8gaW5zZXJ0LlxuICogQHBhcmFtIGN1cnJlbnRWaWV3IEN1cnJlbnQgTFZpZXcgYmVpbmcgcHJvY2Vzc2VkLlxuICogQHJldHVybiBib29sZWFuIFdoZXRoZXIgdGhlIG5vZGUgc2hvdWxkIGJlIGluc2VydGVkIG5vdyAob3IgZGVsYXllZCB1bnRpbCBsYXRlcikuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjYW5JbnNlcnROYXRpdmVOb2RlKHROb2RlOiBUTm9kZSwgY3VycmVudFZpZXc6IExWaWV3KTogYm9vbGVhbiB7XG4gIGxldCBjdXJyZW50Tm9kZSA9IHROb2RlO1xuICBsZXQgcGFyZW50OiBUTm9kZXxudWxsID0gdE5vZGUucGFyZW50O1xuXG4gIGlmICh0Tm9kZS5wYXJlbnQpIHtcbiAgICBpZiAodE5vZGUucGFyZW50LnR5cGUgPT09IFROb2RlVHlwZS5FbGVtZW50Q29udGFpbmVyKSB7XG4gICAgICBjdXJyZW50Tm9kZSA9IGdldEhpZ2hlc3RFbGVtZW50Q29udGFpbmVyKHROb2RlKTtcbiAgICAgIHBhcmVudCA9IGN1cnJlbnROb2RlLnBhcmVudDtcbiAgICB9IGVsc2UgaWYgKHROb2RlLnBhcmVudC50eXBlID09PSBUTm9kZVR5cGUuSWN1Q29udGFpbmVyKSB7XG4gICAgICBjdXJyZW50Tm9kZSA9IGdldEZpcnN0UGFyZW50TmF0aXZlKGN1cnJlbnROb2RlKTtcbiAgICAgIHBhcmVudCA9IGN1cnJlbnROb2RlLnBhcmVudDtcbiAgICB9XG4gIH1cbiAgaWYgKHBhcmVudCA9PT0gbnVsbCkgcGFyZW50ID0gY3VycmVudFZpZXdbSE9TVF9OT0RFXTtcblxuICBpZiAocGFyZW50ICYmIHBhcmVudC50eXBlID09PSBUTm9kZVR5cGUuVmlldykge1xuICAgIHJldHVybiBjYW5JbnNlcnROYXRpdmVDaGlsZE9mVmlldyhwYXJlbnQgYXMgVFZpZXdOb2RlLCBjdXJyZW50Vmlldyk7XG4gIH0gZWxzZSB7XG4gICAgLy8gUGFyZW50IGlzIGEgcmVndWxhciBlbGVtZW50IG9yIGEgY29tcG9uZW50XG4gICAgcmV0dXJuIGNhbkluc2VydE5hdGl2ZUNoaWxkT2ZFbGVtZW50KGN1cnJlbnROb2RlKTtcbiAgfVxufVxuXG4vKipcbiAqIEluc2VydHMgYSBuYXRpdmUgbm9kZSBiZWZvcmUgYW5vdGhlciBuYXRpdmUgbm9kZSBmb3IgYSBnaXZlbiBwYXJlbnQgdXNpbmcge0BsaW5rIFJlbmRlcmVyM30uXG4gKiBUaGlzIGlzIGEgdXRpbGl0eSBmdW5jdGlvbiB0aGF0IGNhbiBiZSB1c2VkIHdoZW4gbmF0aXZlIG5vZGVzIHdlcmUgZGV0ZXJtaW5lZCAtIGl0IGFic3RyYWN0cyBhblxuICogYWN0dWFsIHJlbmRlcmVyIGJlaW5nIHVzZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBuYXRpdmVJbnNlcnRCZWZvcmUoXG4gICAgcmVuZGVyZXI6IFJlbmRlcmVyMywgcGFyZW50OiBSRWxlbWVudCwgY2hpbGQ6IFJOb2RlLCBiZWZvcmVOb2RlOiBSTm9kZSB8IG51bGwpOiB2b2lkIHtcbiAgaWYgKGlzUHJvY2VkdXJhbFJlbmRlcmVyKHJlbmRlcmVyKSkge1xuICAgIHJlbmRlcmVyLmluc2VydEJlZm9yZShwYXJlbnQsIGNoaWxkLCBiZWZvcmVOb2RlKTtcbiAgfSBlbHNlIHtcbiAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKGNoaWxkLCBiZWZvcmVOb2RlLCB0cnVlKTtcbiAgfVxufVxuXG4vKipcbiAqIFJldHVybnMgYSBuYXRpdmUgcGFyZW50IG9mIGEgZ2l2ZW4gbmF0aXZlIG5vZGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBuYXRpdmVQYXJlbnROb2RlKHJlbmRlcmVyOiBSZW5kZXJlcjMsIG5vZGU6IFJOb2RlKTogUkVsZW1lbnR8bnVsbCB7XG4gIHJldHVybiAoaXNQcm9jZWR1cmFsUmVuZGVyZXIocmVuZGVyZXIpID8gcmVuZGVyZXIucGFyZW50Tm9kZShub2RlKSA6IG5vZGUucGFyZW50Tm9kZSkgYXMgUkVsZW1lbnQ7XG59XG5cbi8qKlxuICogUmV0dXJucyBhIG5hdGl2ZSBzaWJsaW5nIG9mIGEgZ2l2ZW4gbmF0aXZlIG5vZGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBuYXRpdmVOZXh0U2libGluZyhyZW5kZXJlcjogUmVuZGVyZXIzLCBub2RlOiBSTm9kZSk6IFJOb2RlfG51bGwge1xuICByZXR1cm4gaXNQcm9jZWR1cmFsUmVuZGVyZXIocmVuZGVyZXIpID8gcmVuZGVyZXIubmV4dFNpYmxpbmcobm9kZSkgOiBub2RlLm5leHRTaWJsaW5nO1xufVxuXG4vKipcbiAqIEFwcGVuZHMgdGhlIGBjaGlsZGAgZWxlbWVudCB0byB0aGUgYHBhcmVudGAuXG4gKlxuICogVGhlIGVsZW1lbnQgaW5zZXJ0aW9uIG1pZ2h0IGJlIGRlbGF5ZWQge0BsaW5rIGNhbkluc2VydE5hdGl2ZU5vZGV9LlxuICpcbiAqIEBwYXJhbSBjaGlsZEVsIFRoZSBjaGlsZCB0aGF0IHNob3VsZCBiZSBhcHBlbmRlZFxuICogQHBhcmFtIGNoaWxkVE5vZGUgVGhlIFROb2RlIG9mIHRoZSBjaGlsZCBlbGVtZW50XG4gKiBAcGFyYW0gY3VycmVudFZpZXcgVGhlIGN1cnJlbnQgTFZpZXdcbiAqIEByZXR1cm5zIFdoZXRoZXIgb3Igbm90IHRoZSBjaGlsZCB3YXMgYXBwZW5kZWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFwcGVuZENoaWxkKFxuICAgIGNoaWxkRWw6IFJOb2RlIHwgbnVsbCA9IG51bGwsIGNoaWxkVE5vZGU6IFROb2RlLCBjdXJyZW50VmlldzogTFZpZXcpOiBib29sZWFuIHtcbiAgaWYgKGNoaWxkRWwgIT09IG51bGwgJiYgY2FuSW5zZXJ0TmF0aXZlTm9kZShjaGlsZFROb2RlLCBjdXJyZW50VmlldykpIHtcbiAgICBjb25zdCByZW5kZXJlciA9IGN1cnJlbnRWaWV3W1JFTkRFUkVSXTtcbiAgICBjb25zdCBwYXJlbnRFbCA9IGdldFBhcmVudE5hdGl2ZShjaGlsZFROb2RlLCBjdXJyZW50Vmlldyk7XG4gICAgY29uc3QgcGFyZW50VE5vZGU6IFROb2RlID0gY2hpbGRUTm9kZS5wYXJlbnQgfHwgY3VycmVudFZpZXdbSE9TVF9OT0RFXSAhO1xuXG4gICAgaWYgKHBhcmVudFROb2RlLnR5cGUgPT09IFROb2RlVHlwZS5WaWV3KSB7XG4gICAgICBjb25zdCBsQ29udGFpbmVyID0gZ2V0TENvbnRhaW5lcihwYXJlbnRUTm9kZSBhcyBUVmlld05vZGUsIGN1cnJlbnRWaWV3KSBhcyBMQ29udGFpbmVyO1xuICAgICAgY29uc3Qgdmlld3MgPSBsQ29udGFpbmVyW1ZJRVdTXTtcbiAgICAgIGNvbnN0IGluZGV4ID0gdmlld3MuaW5kZXhPZihjdXJyZW50Vmlldyk7XG4gICAgICBuYXRpdmVJbnNlcnRCZWZvcmUoXG4gICAgICAgICAgcmVuZGVyZXIsIGxDb250YWluZXJbUkVOREVSX1BBUkVOVF0gISwgY2hpbGRFbCxcbiAgICAgICAgICBnZXRCZWZvcmVOb2RlRm9yVmlldyhpbmRleCwgdmlld3MsIGxDb250YWluZXJbTkFUSVZFXSkpO1xuICAgIH0gZWxzZSBpZiAocGFyZW50VE5vZGUudHlwZSA9PT0gVE5vZGVUeXBlLkVsZW1lbnRDb250YWluZXIpIHtcbiAgICAgIGNvbnN0IHJlbmRlclBhcmVudCA9IGdldFJlbmRlclBhcmVudChjaGlsZFROb2RlLCBjdXJyZW50VmlldykgITtcbiAgICAgIG5hdGl2ZUluc2VydEJlZm9yZShyZW5kZXJlciwgcmVuZGVyUGFyZW50LCBjaGlsZEVsLCBwYXJlbnRFbCk7XG4gICAgfSBlbHNlIGlmIChwYXJlbnRUTm9kZS50eXBlID09PSBUTm9kZVR5cGUuSWN1Q29udGFpbmVyKSB7XG4gICAgICBjb25zdCBpY3VBbmNob3JOb2RlID0gZ2V0TmF0aXZlQnlUTm9kZShjaGlsZFROb2RlLnBhcmVudCAhLCBjdXJyZW50VmlldykgIWFzIFJFbGVtZW50O1xuICAgICAgbmF0aXZlSW5zZXJ0QmVmb3JlKHJlbmRlcmVyLCBwYXJlbnRFbCBhcyBSRWxlbWVudCwgY2hpbGRFbCwgaWN1QW5jaG9yTm9kZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlzUHJvY2VkdXJhbFJlbmRlcmVyKHJlbmRlcmVyKSA/IHJlbmRlcmVyLmFwcGVuZENoaWxkKHBhcmVudEVsICFhcyBSRWxlbWVudCwgY2hpbGRFbCkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50RWwgIS5hcHBlbmRDaGlsZChjaGlsZEVsKTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqIEdldHMgdGhlIHRvcC1sZXZlbCBuZy1jb250YWluZXIgaWYgbmctY29udGFpbmVycyBhcmUgbmVzdGVkLlxuICpcbiAqIEBwYXJhbSBuZ0NvbnRhaW5lciBUaGUgVE5vZGUgb2YgdGhlIHN0YXJ0aW5nIG5nLWNvbnRhaW5lclxuICogQHJldHVybnMgdE5vZGUgVGhlIFROb2RlIG9mIHRoZSBoaWdoZXN0IGxldmVsIG5nLWNvbnRhaW5lclxuICovXG5mdW5jdGlvbiBnZXRIaWdoZXN0RWxlbWVudENvbnRhaW5lcihuZ0NvbnRhaW5lcjogVE5vZGUpOiBUTm9kZSB7XG4gIHdoaWxlIChuZ0NvbnRhaW5lci5wYXJlbnQgIT0gbnVsbCAmJiBuZ0NvbnRhaW5lci5wYXJlbnQudHlwZSA9PT0gVE5vZGVUeXBlLkVsZW1lbnRDb250YWluZXIpIHtcbiAgICBuZ0NvbnRhaW5lciA9IG5nQ29udGFpbmVyLnBhcmVudDtcbiAgfVxuICByZXR1cm4gbmdDb250YWluZXI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRCZWZvcmVOb2RlRm9yVmlldyhpbmRleDogbnVtYmVyLCB2aWV3czogTFZpZXdbXSwgY29udGFpbmVyTmF0aXZlOiBSQ29tbWVudCkge1xuICBpZiAoaW5kZXggKyAxIDwgdmlld3MubGVuZ3RoKSB7XG4gICAgY29uc3QgdmlldyA9IHZpZXdzW2luZGV4ICsgMV0gYXMgTFZpZXc7XG4gICAgY29uc3Qgdmlld1ROb2RlID0gdmlld1tIT1NUX05PREVdIGFzIFRWaWV3Tm9kZTtcbiAgICByZXR1cm4gdmlld1ROb2RlLmNoaWxkID8gZ2V0TmF0aXZlQnlUTm9kZSh2aWV3VE5vZGUuY2hpbGQsIHZpZXcpIDogY29udGFpbmVyTmF0aXZlO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBjb250YWluZXJOYXRpdmU7XG4gIH1cbn1cblxuLyoqXG4gKiBSZW1vdmVzIHRoZSBgY2hpbGRgIGVsZW1lbnQgZnJvbSB0aGUgRE9NIGlmIG5vdCBpbiB2aWV3IGFuZCBub3QgcHJvamVjdGVkLlxuICpcbiAqIEBwYXJhbSBjaGlsZFROb2RlIFRoZSBUTm9kZSBvZiB0aGUgY2hpbGQgdG8gcmVtb3ZlXG4gKiBAcGFyYW0gY2hpbGRFbCBUaGUgY2hpbGQgdGhhdCBzaG91bGQgYmUgcmVtb3ZlZFxuICogQHBhcmFtIGN1cnJlbnRWaWV3IFRoZSBjdXJyZW50IExWaWV3XG4gKiBAcmV0dXJucyBXaGV0aGVyIG9yIG5vdCB0aGUgY2hpbGQgd2FzIHJlbW92ZWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZUNoaWxkKGNoaWxkVE5vZGU6IFROb2RlLCBjaGlsZEVsOiBSTm9kZSB8IG51bGwsIGN1cnJlbnRWaWV3OiBMVmlldyk6IGJvb2xlYW4ge1xuICAvLyBXZSBvbmx5IHJlbW92ZSB0aGUgZWxlbWVudCBpZiBub3QgaW4gVmlldyBvciBub3QgcHJvamVjdGVkLlxuICBpZiAoY2hpbGRFbCAhPT0gbnVsbCAmJiBjYW5JbnNlcnROYXRpdmVOb2RlKGNoaWxkVE5vZGUsIGN1cnJlbnRWaWV3KSkge1xuICAgIGNvbnN0IHBhcmVudE5hdGl2ZSA9IGdldFBhcmVudE5hdGl2ZShjaGlsZFROb2RlLCBjdXJyZW50VmlldykgIWFzIFJFbGVtZW50O1xuICAgIGNvbnN0IHJlbmRlcmVyID0gY3VycmVudFZpZXdbUkVOREVSRVJdO1xuICAgIGlzUHJvY2VkdXJhbFJlbmRlcmVyKHJlbmRlcmVyKSA/IHJlbmRlcmVyLnJlbW92ZUNoaWxkKHBhcmVudE5hdGl2ZSBhcyBSRWxlbWVudCwgY2hpbGRFbCkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudE5hdGl2ZSAhLnJlbW92ZUNoaWxkKGNoaWxkRWwpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBBcHBlbmRzIGEgcHJvamVjdGVkIG5vZGUgdG8gdGhlIERPTSwgb3IgaW4gdGhlIGNhc2Ugb2YgYSBwcm9qZWN0ZWQgY29udGFpbmVyLFxuICogYXBwZW5kcyB0aGUgbm9kZXMgZnJvbSBhbGwgb2YgdGhlIGNvbnRhaW5lcidzIGFjdGl2ZSB2aWV3cyB0byB0aGUgRE9NLlxuICpcbiAqIEBwYXJhbSBwcm9qZWN0ZWRUTm9kZSBUaGUgVE5vZGUgdG8gYmUgcHJvamVjdGVkXG4gKiBAcGFyYW0gdFByb2plY3Rpb25Ob2RlIFRoZSBwcm9qZWN0aW9uIChuZy1jb250ZW50KSBUTm9kZVxuICogQHBhcmFtIGN1cnJlbnRWaWV3IEN1cnJlbnQgTFZpZXdcbiAqIEBwYXJhbSBwcm9qZWN0aW9uVmlldyBQcm9qZWN0aW9uIHZpZXcgKHZpZXcgYWJvdmUgY3VycmVudClcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFwcGVuZFByb2plY3RlZE5vZGUoXG4gICAgcHJvamVjdGVkVE5vZGU6IFROb2RlLCB0UHJvamVjdGlvbk5vZGU6IFROb2RlLCBjdXJyZW50VmlldzogTFZpZXcsXG4gICAgcHJvamVjdGlvblZpZXc6IExWaWV3KTogdm9pZCB7XG4gIGNvbnN0IG5hdGl2ZSA9IGdldE5hdGl2ZUJ5VE5vZGUocHJvamVjdGVkVE5vZGUsIHByb2plY3Rpb25WaWV3KTtcbiAgYXBwZW5kQ2hpbGQobmF0aXZlLCB0UHJvamVjdGlvbk5vZGUsIGN1cnJlbnRWaWV3KTtcblxuICAvLyB0aGUgcHJvamVjdGVkIGNvbnRlbnRzIGFyZSBwcm9jZXNzZWQgd2hpbGUgaW4gdGhlIHNoYWRvdyB2aWV3ICh3aGljaCBpcyB0aGUgY3VycmVudFZpZXcpXG4gIC8vIHRoZXJlZm9yZSB3ZSBuZWVkIHRvIGV4dHJhY3QgdGhlIHZpZXcgd2hlcmUgdGhlIGhvc3QgZWxlbWVudCBsaXZlcyBzaW5jZSBpdCdzIHRoZVxuICAvLyBsb2dpY2FsIGNvbnRhaW5lciBvZiB0aGUgY29udGVudCBwcm9qZWN0ZWQgdmlld3NcbiAgYXR0YWNoUGF0Y2hEYXRhKG5hdGl2ZSwgcHJvamVjdGlvblZpZXcpO1xuXG4gIGNvbnN0IHJlbmRlclBhcmVudCA9IGdldFJlbmRlclBhcmVudCh0UHJvamVjdGlvbk5vZGUsIGN1cnJlbnRWaWV3KTtcblxuICBjb25zdCBub2RlT3JDb250YWluZXIgPSBwcm9qZWN0aW9uVmlld1twcm9qZWN0ZWRUTm9kZS5pbmRleF07XG4gIGlmIChwcm9qZWN0ZWRUTm9kZS50eXBlID09PSBUTm9kZVR5cGUuQ29udGFpbmVyKSB7XG4gICAgLy8gVGhlIG5vZGUgd2UgYXJlIGFkZGluZyBpcyBhIGNvbnRhaW5lciBhbmQgd2UgYXJlIGFkZGluZyBpdCB0byBhbiBlbGVtZW50IHdoaWNoXG4gICAgLy8gaXMgbm90IGEgY29tcG9uZW50IChubyBtb3JlIHJlLXByb2plY3Rpb24pLlxuICAgIC8vIEFsdGVybmF0aXZlbHkgYSBjb250YWluZXIgaXMgcHJvamVjdGVkIGF0IHRoZSByb290IG9mIGEgY29tcG9uZW50J3MgdGVtcGxhdGVcbiAgICAvLyBhbmQgY2FuJ3QgYmUgcmUtcHJvamVjdGVkIChhcyBub3QgY29udGVudCBvZiBhbnkgY29tcG9uZW50KS5cbiAgICAvLyBBc3NpZ24gdGhlIGZpbmFsIHByb2plY3Rpb24gbG9jYXRpb24gaW4gdGhvc2UgY2FzZXMuXG4gICAgbm9kZU9yQ29udGFpbmVyW1JFTkRFUl9QQVJFTlRdID0gcmVuZGVyUGFyZW50O1xuICAgIGNvbnN0IHZpZXdzID0gbm9kZU9yQ29udGFpbmVyW1ZJRVdTXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHZpZXdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhZGRSZW1vdmVWaWV3RnJvbUNvbnRhaW5lcih2aWV3c1tpXSwgdHJ1ZSwgbm9kZU9yQ29udGFpbmVyW05BVElWRV0pO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAocHJvamVjdGVkVE5vZGUudHlwZSA9PT0gVE5vZGVUeXBlLkVsZW1lbnRDb250YWluZXIpIHtcbiAgICAgIGxldCBuZ0NvbnRhaW5lckNoaWxkVE5vZGU6IFROb2RlfG51bGwgPSBwcm9qZWN0ZWRUTm9kZS5jaGlsZCBhcyBUTm9kZTtcbiAgICAgIHdoaWxlIChuZ0NvbnRhaW5lckNoaWxkVE5vZGUpIHtcbiAgICAgICAgYXBwZW5kUHJvamVjdGVkTm9kZShuZ0NvbnRhaW5lckNoaWxkVE5vZGUsIHRQcm9qZWN0aW9uTm9kZSwgY3VycmVudFZpZXcsIHByb2plY3Rpb25WaWV3KTtcbiAgICAgICAgbmdDb250YWluZXJDaGlsZFROb2RlID0gbmdDb250YWluZXJDaGlsZFROb2RlLm5leHQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGlzTENvbnRhaW5lcihub2RlT3JDb250YWluZXIpKSB7XG4gICAgICBub2RlT3JDb250YWluZXJbUkVOREVSX1BBUkVOVF0gPSByZW5kZXJQYXJlbnQ7XG4gICAgICBhcHBlbmRDaGlsZChub2RlT3JDb250YWluZXJbTkFUSVZFXSwgdFByb2plY3Rpb25Ob2RlLCBjdXJyZW50Vmlldyk7XG4gICAgfVxuICB9XG59XG4iXX0=