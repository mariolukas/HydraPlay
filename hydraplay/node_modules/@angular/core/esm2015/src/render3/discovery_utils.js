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
import { assertDefined } from './assert';
import { discoverLocalRefs, getComponentAtNodeIndex, getDirectivesAtNodeIndex, getLContext } from './context_discovery';
import { NodeInjector } from './di';
import { CLEANUP, CONTEXT, FLAGS, HOST, PARENT, TVIEW } from './interfaces/view';
import { readElementValue, readPatchedLView, stringify } from './util';
/**
 * Returns the component instance associated with a given DOM host element.
 * Elements which don't represent components return `null`.
 *
 * \@publicApi
 * @template T
 * @param {?} element Host DOM element from which the component should be retrieved.
 *
 * ```
 * <my-app>
 *   #VIEW
 *     <div>
 *       <child-comp></child-comp>
 *     </div>
 * </mp-app>
 *
 * expect(getComponent(<child-comp>) instanceof ChildComponent).toBeTruthy();
 * expect(getComponent(<my-app>) instanceof MyApp).toBeTruthy();
 * ```
 *
 * @return {?}
 */
export function getComponent(element) {
    /** @type {?} */
    const context = loadLContextFromNode(element);
    if (context.component === undefined) {
        context.component = getComponentAtNodeIndex(context.nodeIndex, context.lView);
    }
    return (/** @type {?} */ (context.component));
}
/**
 * Returns the component instance associated with a given DOM host element.
 * Elements which don't represent components return `null`.
 *
 * \@publicApi
 * @template T
 * @param {?} element Host DOM element from which the component should be retrieved.
 *
 * ```
 * <my-app>
 *   #VIEW
 *     <div>
 *       <child-comp></child-comp>
 *     </div>
 * </mp-app>
 *
 * expect(getComponent(<child-comp>) instanceof ChildComponent).toBeTruthy();
 * expect(getComponent(<my-app>) instanceof MyApp).toBeTruthy();
 * ```
 *
 * @return {?}
 */
export function getContext(element) {
    /** @type {?} */
    const context = (/** @type {?} */ (loadLContextFromNode(element)));
    return (/** @type {?} */ (context.lView[CONTEXT]));
}
/**
 * Returns the component instance associated with view which owns the DOM element (`null`
 * otherwise).
 *
 * \@publicApi
 * @template T
 * @param {?} element DOM element which is owned by an existing component's view.
 *
 * ```
 * <my-app>
 *   #VIEW
 *     <div>
 *       <child-comp></child-comp>
 *     </div>
 * </mp-app>
 *
 * expect(getViewComponent(<child-comp>) instanceof MyApp).toBeTruthy();
 * expect(getViewComponent(<my-app>)).toEqual(null);
 * ```
 *
 * @return {?}
 */
export function getViewComponent(element) {
    /** @type {?} */
    const context = (/** @type {?} */ (loadLContext(element)));
    /** @type {?} */
    let lView = context.lView;
    while (lView[PARENT] && lView[HOST] === null) {
        // As long as lView[HOST] is null we know we are part of sub-template such as `*ngIf`
        lView = (/** @type {?} */ (lView[PARENT]));
    }
    return lView[FLAGS] & 128 /* IsRoot */ ? null : (/** @type {?} */ (lView[CONTEXT]));
}
/**
 * Returns the `RootContext` instance that is associated with
 * the application where the target is situated.
 *
 * @param {?} target
 * @return {?}
 */
export function getRootContext(target) {
    /** @type {?} */
    const lViewData = Array.isArray(target) ? target : (/** @type {?} */ (loadLContext(target))).lView;
    /** @type {?} */
    const rootLView = getRootView(lViewData);
    return (/** @type {?} */ (rootLView[CONTEXT]));
}
/**
 * Retrieve all root components.
 *
 * Root components are those which have been bootstrapped by Angular.
 *
 * \@publicApi
 * @param {?} target A DOM element, component or directive instance.
 *
 * @return {?}
 */
export function getRootComponents(target) {
    return [...getRootContext(target).components];
}
/**
 * Retrieves an `Injector` associated with the element, component or directive.
 *
 * \@publicApi
 * @param {?} target A DOM element, component or directive instance.
 *
 * @return {?}
 */
export function getInjector(target) {
    /** @type {?} */
    const context = loadLContext(target);
    /** @type {?} */
    const tNode = (/** @type {?} */ (context.lView[TVIEW].data[context.nodeIndex]));
    return new NodeInjector(tNode, context.lView);
}
/**
 * Retrieve a set of injection tokens at a given DOM node.
 *
 * \@publicApi
 * @param {?} element Element for which the injection tokens should be retrieved.
 * @return {?}
 */
export function getInjectionTokens(element) {
    /** @type {?} */
    const context = loadLContext(element, false);
    if (!context)
        return [];
    /** @type {?} */
    const lView = context.lView;
    /** @type {?} */
    const tView = lView[TVIEW];
    /** @type {?} */
    const tNode = (/** @type {?} */ (tView.data[context.nodeIndex]));
    /** @type {?} */
    const providerTokens = [];
    /** @type {?} */
    const startIndex = tNode.providerIndexes & 65535 /* ProvidersStartIndexMask */;
    /** @type {?} */
    const endIndex = tNode.directiveEnd;
    for (let i = startIndex; i < endIndex; i++) {
        /** @type {?} */
        let value = tView.data[i];
        if (isDirectiveDefHack(value)) {
            // The fact that we sometimes store Type and sometimes DirectiveDef in this location is a
            // design flaw.  We should always store same type so that we can be monomorphic. The issue
            // is that for Components/Directives we store the def instead the type. The correct behavior
            // is that we should always be storing injectable type in this location.
            value = value.type;
        }
        providerTokens.push(value);
    }
    return providerTokens;
}
/**
 * Retrieves directives associated with a given DOM host element.
 *
 * \@publicApi
 * @param {?} target A DOM element, component or directive instance.
 *
 * @return {?}
 */
export function getDirectives(target) {
    /** @type {?} */
    const context = (/** @type {?} */ (loadLContext(target)));
    if (context.directives === undefined) {
        context.directives = getDirectivesAtNodeIndex(context.nodeIndex, context.lView, false);
    }
    return context.directives || [];
}
/**
 * @param {?} target
 * @param {?=} throwOnNotFound
 * @return {?}
 */
export function loadLContext(target, throwOnNotFound = true) {
    /** @type {?} */
    const context = getLContext(target);
    if (!context && throwOnNotFound) {
        throw new Error(ngDevMode ? `Unable to find context associated with ${stringify(target)}` :
            'Invalid ng target');
    }
    return context;
}
/**
 * Retrieve the root view from any component by walking the parent `LView` until
 * reaching the root `LView`.
 *
 * @param {?} componentOrView any component or view
 *
 * @return {?}
 */
export function getRootView(componentOrView) {
    /** @type {?} */
    let lView;
    if (Array.isArray(componentOrView)) {
        ngDevMode && assertDefined(componentOrView, 'lView');
        lView = (/** @type {?} */ (componentOrView));
    }
    else {
        ngDevMode && assertDefined(componentOrView, 'component');
        lView = (/** @type {?} */ (readPatchedLView(componentOrView)));
    }
    while (lView && !(lView[FLAGS] & 128 /* IsRoot */)) {
        lView = (/** @type {?} */ (lView[PARENT]));
    }
    return lView;
}
/**
 * Retrieve map of local references.
 *
 * The references are retrieved as a map of local reference name to element or directive instance.
 *
 * \@publicApi
 * @param {?} target A DOM element, component or directive instance.
 *
 * @return {?}
 */
export function getLocalRefs(target) {
    /** @type {?} */
    const context = (/** @type {?} */ (loadLContext(target)));
    if (context.localRefs === undefined) {
        context.localRefs = discoverLocalRefs(context.lView, context.nodeIndex);
    }
    return context.localRefs || {};
}
/**
 * Retrieve the host element of the component.
 *
 * Use this function to retrieve the host element of the component. The host
 * element is the element which the component is associated with.
 *
 * \@publicApi
 * @template T
 * @param {?} directive Component or Directive for which the host element should be retrieved.
 *
 * @return {?}
 */
export function getHostElement(directive) {
    return (/** @type {?} */ ((/** @type {?} */ ((/** @type {?} */ (getLContext(directive))).native))));
}
/**
 * Retrieves the rendered text for a given component.
 *
 * This function retrieves the host element of a component and
 * and then returns the `textContent` for that element. This implies
 * that the text returned will include re-projected content of
 * the component as well.
 *
 * @param {?} component The component to return the content text for.
 * @return {?}
 */
export function getRenderedText(component) {
    /** @type {?} */
    const hostElement = getHostElement(component);
    return hostElement.textContent || '';
}
/**
 * @param {?} node
 * @return {?}
 */
export function loadLContextFromNode(node) {
    if (!(node instanceof Node))
        throw new Error('Expecting instance of DOM Node');
    return (/** @type {?} */ (loadLContext(node)));
}
/**
 * @record
 */
export function Listener() { }
if (false) {
    /** @type {?} */
    Listener.prototype.name;
    /** @type {?} */
    Listener.prototype.element;
    /** @type {?} */
    Listener.prototype.callback;
    /** @type {?} */
    Listener.prototype.useCapture;
}
/**
 * @param {?} listener
 * @return {?}
 */
export function isBrowserEvents(listener) {
    // Browser events are those which don't have `useCapture` as boolean.
    return typeof listener.useCapture === 'boolean';
}
/**
 * Retrieves a list of DOM listeners.
 *
 * ```
 * <my-app>
 *   #VIEW
 *     <div (click)="doSomething()">
 *     </div>
 * </mp-app>
 *
 * expect(getListeners(<div>)).toEqual({
 *   name: 'click',
 *   element: <div>,
 *   callback: () => doSomething(),
 *   useCapture: false
 * });
 * ```
 *
 * \@publicApi
 * @param {?} element Element for which the DOM listeners should be retrieved.
 * @return {?}
 */
export function getListeners(element) {
    /** @type {?} */
    const lContext = loadLContextFromNode(element);
    /** @type {?} */
    const lView = lContext.lView;
    /** @type {?} */
    const tView = lView[TVIEW];
    /** @type {?} */
    const lCleanup = lView[CLEANUP];
    /** @type {?} */
    const tCleanup = tView.cleanup;
    /** @type {?} */
    const listeners = [];
    if (tCleanup && lCleanup) {
        for (let i = 0; i < tCleanup.length;) {
            /** @type {?} */
            const firstParam = tCleanup[i++];
            /** @type {?} */
            const secondParam = tCleanup[i++];
            if (typeof firstParam === 'string') {
                /** @type {?} */
                const name = firstParam;
                /** @type {?} */
                const listenerElement = (/** @type {?} */ ((/** @type {?} */ (readElementValue(lView[secondParam])))));
                /** @type {?} */
                const callback = lCleanup[tCleanup[i++]];
                /** @type {?} */
                const useCaptureOrIndx = tCleanup[i++];
                // if useCaptureOrIndx is boolean then report it as is.
                // if useCaptureOrIndx is positive number then it in unsubscribe method
                // if useCaptureOrIndx is negative number then it is a Subscription
                /** @type {?} */
                const useCapture = typeof useCaptureOrIndx === 'boolean' ?
                    useCaptureOrIndx :
                    (useCaptureOrIndx >= 0 ? false : null);
                if (element == listenerElement) {
                    listeners.push({ element, name, callback, useCapture });
                }
            }
        }
    }
    listeners.sort(sortListeners);
    return listeners;
}
/**
 * @param {?} a
 * @param {?} b
 * @return {?}
 */
function sortListeners(a, b) {
    if (a.name == b.name)
        return 0;
    return a.name < b.name ? -1 : 1;
}
/**
 * This function should not exist because it is megamorphic and only mostly correct.
 *
 * See call site for more info.
 * @param {?} obj
 * @return {?}
 */
function isDirectiveDefHack(obj) {
    return obj.type !== undefined && obj.template !== undefined && obj.declaredInputs !== undefined;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlzY292ZXJ5X3V0aWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvcmVuZGVyMy9kaXNjb3ZlcnlfdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFVQSxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sVUFBVSxDQUFDO0FBQ3ZDLE9BQU8sRUFBQyxpQkFBaUIsRUFBRSx1QkFBdUIsRUFBRSx3QkFBd0IsRUFBRSxXQUFXLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUN0SCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBSWxDLE9BQU8sRUFBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQXFCLE1BQU0sRUFBZSxLQUFLLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUMvRyxPQUFPLEVBQUMsZ0JBQWdCLEVBQUUsZ0JBQWdCLEVBQUUsU0FBUyxFQUFDLE1BQU0sUUFBUSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXdCckUsTUFBTSxVQUFVLFlBQVksQ0FBUyxPQUFnQjs7VUFDN0MsT0FBTyxHQUFHLG9CQUFvQixDQUFDLE9BQU8sQ0FBQztJQUU3QyxJQUFJLE9BQU8sQ0FBQyxTQUFTLEtBQUssU0FBUyxFQUFFO1FBQ25DLE9BQU8sQ0FBQyxTQUFTLEdBQUcsdUJBQXVCLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDL0U7SUFFRCxPQUFPLG1CQUFBLE9BQU8sQ0FBQyxTQUFTLEVBQUssQ0FBQztBQUNoQyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXNCRCxNQUFNLFVBQVUsVUFBVSxDQUFTLE9BQWdCOztVQUMzQyxPQUFPLEdBQUcsbUJBQUEsb0JBQW9CLENBQUMsT0FBTyxDQUFDLEVBQUU7SUFDL0MsT0FBTyxtQkFBQSxPQUFPLENBQUMsS0FB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LElBQUksQ0FBQyxFQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBQyxDQUFDLENBQUM7aUJBQ3ZEO2FBQ0Y7U0FDRjtLQUNGO0lBQ0QsU0FBUyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUM5QixPQUFPLFNBQVMsQ0FBQztBQUNuQixDQUFDOzs7Ozs7QUFFRCxTQUFTLGFBQWEsQ0FBQyxDQUFXLEVBQUUsQ0FBVztJQUM3QyxJQUFJLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLElBQUk7UUFBRSxPQUFPLENBQUMsQ0FBQztJQUMvQixPQUFPLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNsQyxDQUFDOzs7Ozs7OztBQU9ELFNBQVMsa0JBQWtCLENBQUMsR0FBUTtJQUNsQyxPQUFPLEdBQUcsQ0FBQyxJQUFJLEtBQUssU0FBUyxJQUFJLEdBQUcsQ0FBQyxRQUFRLEtBQUssU0FBUyxJQUFJLEdBQUcsQ0FBQyxjQUFjLEtBQUssU0FBUyxDQUFDO0FBQ2xHLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0b3J9IGZyb20gJy4uL2RpL2luamVjdG9yJztcblxuaW1wb3J0IHthc3NlcnREZWZpbmVkfSBmcm9tICcuL2Fzc2VydCc7XG5pbXBvcnQge2Rpc2NvdmVyTG9jYWxSZWZzLCBnZXRDb21wb25lbnRBdE5vZGVJbmRleCwgZ2V0RGlyZWN0aXZlc0F0Tm9kZUluZGV4LCBnZXRMQ29udGV4dH0gZnJvbSAnLi9jb250ZXh0X2Rpc2NvdmVyeSc7XG5pbXBvcnQge05vZGVJbmplY3Rvcn0gZnJvbSAnLi9kaSc7XG5pbXBvcnQge0xDb250ZXh0fSBmcm9tICcuL2ludGVyZmFjZXMvY29udGV4dCc7XG5pbXBvcnQge0RpcmVjdGl2ZURlZn0gZnJvbSAnLi9pbnRlcmZhY2VzL2RlZmluaXRpb24nO1xuaW1wb3J0IHtURWxlbWVudE5vZGUsIFROb2RlLCBUTm9kZVByb3ZpZGVySW5kZXhlc30gZnJvbSAnLi9pbnRlcmZhY2VzL25vZGUnO1xuaW1wb3J0IHtDTEVBTlVQLCBDT05URVhULCBGTEFHUywgSE9TVCwgTFZpZXcsIExWaWV3RmxhZ3MsIFBBUkVOVCwgUm9vdENvbnRleHQsIFRWSUVXfSBmcm9tICcuL2ludGVyZmFjZXMvdmlldyc7XG5pbXBvcnQge3JlYWRFbGVtZW50VmFsdWUsIHJlYWRQYXRjaGVkTFZpZXcsIHN0cmluZ2lmeX0gZnJvbSAnLi91dGlsJztcblxuXG5cbi8qKlxuICogUmV0dXJucyB0aGUgY29tcG9uZW50IGluc3RhbmNlIGFzc29jaWF0ZWQgd2l0aCBhIGdpdmVuIERPTSBob3N0IGVsZW1lbnQuXG4gKiBFbGVtZW50cyB3aGljaCBkb24ndCByZXByZXNlbnQgY29tcG9uZW50cyByZXR1cm4gYG51bGxgLlxuICpcbiAqIEBwYXJhbSBlbGVtZW50IEhvc3QgRE9NIGVsZW1lbnQgZnJvbSB3aGljaCB0aGUgY29tcG9uZW50IHNob3VsZCBiZSByZXRyaWV2ZWQuXG4gKlxuICogYGBgXG4gKiA8bXktYXBwPlxuICogICAjVklFV1xuICogICAgIDxkaXY+XG4gKiAgICAgICA8Y2hpbGQtY29tcD48L2NoaWxkLWNvbXA+XG4gKiAgICAgPC9kaXY+XG4gKiA8L21wLWFwcD5cbiAqXG4gKiBleHBlY3QoZ2V0Q29tcG9uZW50KDxjaGlsZC1jb21wPikgaW5zdGFuY2VvZiBDaGlsZENvbXBvbmVudCkudG9CZVRydXRoeSgpO1xuICogZXhwZWN0KGdldENvbXBvbmVudCg8bXktYXBwPikgaW5zdGFuY2VvZiBNeUFwcCkudG9CZVRydXRoeSgpO1xuICogYGBgXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29tcG9uZW50PFQgPSB7fT4oZWxlbWVudDogRWxlbWVudCk6IFR8bnVsbCB7XG4gIGNvbnN0IGNvbnRleHQgPSBsb2FkTENvbnRleHRGcm9tTm9kZShlbGVtZW50KTtcblxuICBpZiAoY29udGV4dC5jb21wb25lbnQgPT09IHVuZGVmaW5lZCkge1xuICAgIGNvbnRleHQuY29tcG9uZW50ID0gZ2V0Q29tcG9uZW50QXROb2RlSW5kZXgoY29udGV4dC5ub2RlSW5kZXgsIGNvbnRleHQubFZpZXcpO1xuICB9XG5cbiAgcmV0dXJuIGNvbnRleHQuY29tcG9uZW50IGFzIFQ7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgY29tcG9uZW50IGluc3RhbmNlIGFzc29jaWF0ZWQgd2l0aCBhIGdpdmVuIERPTSBob3N0IGVsZW1lbnQuXG4gKiBFbGVtZW50cyB3aGljaCBkb24ndCByZXByZXNlbnQgY29tcG9uZW50cyByZXR1cm4gYG51bGxgLlxuICpcbiAqIEBwYXJhbSBlbGVtZW50IEhvc3QgRE9NIGVsZW1lbnQgZnJvbSB3aGljaCB0aGUgY29tcG9uZW50IHNob3VsZCBiZSByZXRyaWV2ZWQuXG4gKlxuICogYGBgXG4gKiA8bXktYXBwPlxuICogICAjVklFV1xuICogICAgIDxkaXY+XG4gKiAgICAgICA8Y2hpbGQtY29tcD48L2NoaWxkLWNvbXA+XG4gKiAgICAgPC9kaXY+XG4gKiA8L21wLWFwcD5cbiAqXG4gKiBleHBlY3QoZ2V0Q29tcG9uZW50KDxjaGlsZC1jb21wPikgaW5zdGFuY2VvZiBDaGlsZENvbXBvbmVudCkudG9CZVRydXRoeSgpO1xuICogZXhwZWN0KGdldENvbXBvbmVudCg8bXktYXBwPikgaW5zdGFuY2VvZiBNeUFwcCkudG9CZVRydXRoeSgpO1xuICogYGBgXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29udGV4dDxUID0ge30+KGVsZW1lbnQ6IEVsZW1lbnQpOiBUfG51bGwge1xuICBjb25zdCBjb250ZXh0ID0gbG9hZExDb250ZXh0RnJvbU5vZGUoZWxlbWVudCkgITtcbiAgcmV0dXJuIGNvbnRleHQubFZpZXdbQ09OVEVYVF0gYXMgVDtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBjb21wb25lbnQgaW5zdGFuY2UgYXNzb2NpYXRlZCB3aXRoIHZpZXcgd2hpY2ggb3ducyB0aGUgRE9NIGVsZW1lbnQgKGBudWxsYFxuICogb3RoZXJ3aXNlKS5cbiAqXG4gKiBAcGFyYW0gZWxlbWVudCBET00gZWxlbWVudCB3aGljaCBpcyBvd25lZCBieSBhbiBleGlzdGluZyBjb21wb25lbnQncyB2aWV3LlxuICpcbiAqIGBgYFxuICogPG15LWFwcD5cbiAqICAgI1ZJRVdcbiAqICAgICA8ZGl2PlxuICogICAgICAgPGNoaWxkLWNvbXA+PC9jaGlsZC1jb21wPlxuICogICAgIDwvZGl2PlxuICogPC9tcC1hcHA+XG4gKlxuICogZXhwZWN0KGdldFZpZXdDb21wb25lbnQoPGNoaWxkLWNvbXA+KSBpbnN0YW5jZW9mIE15QXBwKS50b0JlVHJ1dGh5KCk7XG4gKiBleHBlY3QoZ2V0Vmlld0NvbXBvbmVudCg8bXktYXBwPikpLnRvRXF1YWwobnVsbCk7XG4gKiBgYGBcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRWaWV3Q29tcG9uZW50PFQgPSB7fT4oZWxlbWVudDogRWxlbWVudCB8IHt9KTogVHxudWxsIHtcbiAgY29uc3QgY29udGV4dCA9IGxvYWRMQ29udGV4dChlbGVtZW50KSAhO1xuICBsZXQgbFZpZXc6IExWaWV3ID0gY29udGV4dC5sVmlldztcbiAgd2hpbGUgKGxWaWV3W1BBUkVOVF0gJiYgbFZpZXdbSE9TVF0gPT09IG51bGwpIHtcbiAgICAvLyBBcyBsb25nIGFzIGxWaWV3W0hPU1RdIGlzIG51bGwgd2Uga25vdyB3ZSBhcmUgcGFydCBvZiBzdWItdGVtcGxhdGUgc3VjaCBhcyBgKm5nSWZgXG4gICAgbFZpZXcgPSBsVmlld1tQQVJFTlRdICE7XG4gIH1cblxuICByZXR1cm4gbFZpZXdbRkxBR1NdICYgTFZpZXdGbGFncy5Jc1Jvb3QgPyBudWxsIDogbFZpZXdbQ09OVEVYVF0gYXMgVDtcbn1cblxuXG5cbi8qKlxuICogUmV0dXJucyB0aGUgYFJvb3RDb250ZXh0YCBpbnN0YW5jZSB0aGF0IGlzIGFzc29jaWF0ZWQgd2l0aFxuICogdGhlIGFwcGxpY2F0aW9uIHdoZXJlIHRoZSB0YXJnZXQgaXMgc2l0dWF0ZWQuXG4gKlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Um9vdENvbnRleHQodGFyZ2V0OiBMVmlldyB8IHt9KTogUm9vdENvbnRleHQge1xuICBjb25zdCBsVmlld0RhdGEgPSBBcnJheS5pc0FycmF5KHRhcmdldCkgPyB0YXJnZXQgOiBsb2FkTENvbnRleHQodGFyZ2V0KSAhLmxWaWV3O1xuICBjb25zdCByb290TFZpZXcgPSBnZXRSb290VmlldyhsVmlld0RhdGEpO1xuICByZXR1cm4gcm9vdExWaWV3W0NPTlRFWFRdIGFzIFJvb3RDb250ZXh0O1xufVxuXG4vKipcbiAqIFJldHJpZXZlIGFsbCByb290IGNvbXBvbmVudHMuXG4gKlxuICogUm9vdCBjb21wb25lbnRzIGFyZSB0aG9zZSB3aGljaCBoYXZlIGJlZW4gYm9vdHN0cmFwcGVkIGJ5IEFuZ3VsYXIuXG4gKlxuICogQHBhcmFtIHRhcmdldCBBIERPTSBlbGVtZW50LCBjb21wb25lbnQgb3IgZGlyZWN0aXZlIGluc3RhbmNlLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFJvb3RDb21wb25lbnRzKHRhcmdldDoge30pOiBhbnlbXSB7XG4gIHJldHVybiBbLi4uZ2V0Um9vdENvbnRleHQodGFyZ2V0KS5jb21wb25lbnRzXTtcbn1cblxuLyoqXG4gKiBSZXRyaWV2ZXMgYW4gYEluamVjdG9yYCBhc3NvY2lhdGVkIHdpdGggdGhlIGVsZW1lbnQsIGNvbXBvbmVudCBvciBkaXJlY3RpdmUuXG4gKlxuICogQHBhcmFtIHRhcmdldCBBIERPTSBlbGVtZW50LCBjb21wb25lbnQgb3IgZGlyZWN0aXZlIGluc3RhbmNlLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEluamVjdG9yKHRhcmdldDoge30pOiBJbmplY3RvciB7XG4gIGNvbnN0IGNvbnRleHQgPSBsb2FkTENvbnRleHQodGFyZ2V0KTtcbiAgY29uc3QgdE5vZGUgPSBjb250ZXh0LmxWaWV3W1RWSUVXXS5kYXRhW2NvbnRleHQubm9kZUluZGV4XSBhcyBURWxlbWVudE5vZGU7XG4gIHJldHVybiBuZXcgTm9kZUluamVjdG9yKHROb2RlLCBjb250ZXh0LmxWaWV3KTtcbn1cblxuLyoqXG4gKiBSZXRyaWV2ZSBhIHNldCBvZiBpbmplY3Rpb24gdG9rZW5zIGF0IGEgZ2l2ZW4gRE9NIG5vZGUuXG4gKlxuICogQHBhcmFtIGVsZW1lbnQgRWxlbWVudCBmb3Igd2hpY2ggdGhlIGluamVjdGlvbiB0b2tlbnMgc2hvdWxkIGJlIHJldHJpZXZlZC5cbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEluamVjdGlvblRva2VucyhlbGVtZW50OiBFbGVtZW50KTogYW55W10ge1xuICBjb25zdCBjb250ZXh0ID0gbG9hZExDb250ZXh0KGVsZW1lbnQsIGZhbHNlKTtcbiAgaWYgKCFjb250ZXh0KSByZXR1cm4gW107XG4gIGNvbnN0IGxWaWV3ID0gY29udGV4dC5sVmlldztcbiAgY29uc3QgdFZpZXcgPSBsVmlld1tUVklFV107XG4gIGNvbnN0IHROb2RlID0gdFZpZXcuZGF0YVtjb250ZXh0Lm5vZGVJbmRleF0gYXMgVE5vZGU7XG4gIGNvbnN0IHByb3ZpZGVyVG9rZW5zOiBhbnlbXSA9IFtdO1xuICBjb25zdCBzdGFydEluZGV4ID0gdE5vZGUucHJvdmlkZXJJbmRleGVzICYgVE5vZGVQcm92aWRlckluZGV4ZXMuUHJvdmlkZXJzU3RhcnRJbmRleE1hc2s7XG4gIGNvbnN0IGVuZEluZGV4ID0gdE5vZGUuZGlyZWN0aXZlRW5kO1xuICBmb3IgKGxldCBpID0gc3RhcnRJbmRleDsgaSA8IGVuZEluZGV4OyBpKyspIHtcbiAgICBsZXQgdmFsdWUgPSB0Vmlldy5kYXRhW2ldO1xuICAgIGlmIChpc0RpcmVjdGl2ZURlZkhhY2sodmFsdWUpKSB7XG4gICAgICAvLyBUaGUgZmFjdCB0aGF0IHdlIHNvbWV0aW1lcyBzdG9yZSBUeXBlIGFuZCBzb21ldGltZXMgRGlyZWN0aXZlRGVmIGluIHRoaXMgbG9jYXRpb24gaXMgYVxuICAgICAgLy8gZGVzaWduIGZsYXcuICBXZSBzaG91bGQgYWx3YXlzIHN0b3JlIHNhbWUgdHlwZSBzbyB0aGF0IHdlIGNhbiBiZSBtb25vbW9ycGhpYy4gVGhlIGlzc3VlXG4gICAgICAvLyBpcyB0aGF0IGZvciBDb21wb25lbnRzL0RpcmVjdGl2ZXMgd2Ugc3RvcmUgdGhlIGRlZiBpbnN0ZWFkIHRoZSB0eXBlLiBUaGUgY29ycmVjdCBiZWhhdmlvclxuICAgICAgLy8gaXMgdGhhdCB3ZSBzaG91bGQgYWx3YXlzIGJlIHN0b3JpbmcgaW5qZWN0YWJsZSB0eXBlIGluIHRoaXMgbG9jYXRpb24uXG4gICAgICB2YWx1ZSA9IHZhbHVlLnR5cGU7XG4gICAgfVxuICAgIHByb3ZpZGVyVG9rZW5zLnB1c2godmFsdWUpO1xuICB9XG4gIHJldHVybiBwcm92aWRlclRva2Vucztcbn1cblxuLyoqXG4gKiBSZXRyaWV2ZXMgZGlyZWN0aXZlcyBhc3NvY2lhdGVkIHdpdGggYSBnaXZlbiBET00gaG9zdCBlbGVtZW50LlxuICpcbiAqIEBwYXJhbSB0YXJnZXQgQSBET00gZWxlbWVudCwgY29tcG9uZW50IG9yIGRpcmVjdGl2ZSBpbnN0YW5jZS5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXREaXJlY3RpdmVzKHRhcmdldDoge30pOiBBcnJheTx7fT4ge1xuICBjb25zdCBjb250ZXh0ID0gbG9hZExDb250ZXh0KHRhcmdldCkgITtcblxuICBpZiAoY29udGV4dC5kaXJlY3RpdmVzID09PSB1bmRlZmluZWQpIHtcbiAgICBjb250ZXh0LmRpcmVjdGl2ZXMgPSBnZXREaXJlY3RpdmVzQXROb2RlSW5kZXgoY29udGV4dC5ub2RlSW5kZXgsIGNvbnRleHQubFZpZXcsIGZhbHNlKTtcbiAgfVxuXG4gIHJldHVybiBjb250ZXh0LmRpcmVjdGl2ZXMgfHwgW107XG59XG5cbi8qKlxuICogUmV0dXJucyBMQ29udGV4dCBhc3NvY2lhdGVkIHdpdGggYSB0YXJnZXQgcGFzc2VkIGFzIGFuIGFyZ3VtZW50LlxuICogVGhyb3dzIGlmIGEgZ2l2ZW4gdGFyZ2V0IGRvZXNuJ3QgaGF2ZSBhc3NvY2lhdGVkIExDb250ZXh0LlxuICpcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxvYWRMQ29udGV4dCh0YXJnZXQ6IHt9KTogTENvbnRleHQ7XG5leHBvcnQgZnVuY3Rpb24gbG9hZExDb250ZXh0KHRhcmdldDoge30sIHRocm93T25Ob3RGb3VuZDogZmFsc2UpOiBMQ29udGV4dHxudWxsO1xuZXhwb3J0IGZ1bmN0aW9uIGxvYWRMQ29udGV4dCh0YXJnZXQ6IHt9LCB0aHJvd09uTm90Rm91bmQ6IGJvb2xlYW4gPSB0cnVlKTogTENvbnRleHR8bnVsbCB7XG4gIGNvbnN0IGNvbnRleHQgPSBnZXRMQ29udGV4dCh0YXJnZXQpO1xuICBpZiAoIWNvbnRleHQgJiYgdGhyb3dPbk5vdEZvdW5kKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBuZ0Rldk1vZGUgPyBgVW5hYmxlIHRvIGZpbmQgY29udGV4dCBhc3NvY2lhdGVkIHdpdGggJHtzdHJpbmdpZnkodGFyZ2V0KX1gIDpcbiAgICAgICAgICAgICAgICAgICAgJ0ludmFsaWQgbmcgdGFyZ2V0Jyk7XG4gIH1cbiAgcmV0dXJuIGNvbnRleHQ7XG59XG5cbi8qKlxuICogUmV0cmlldmUgdGhlIHJvb3QgdmlldyBmcm9tIGFueSBjb21wb25lbnQgYnkgd2Fsa2luZyB0aGUgcGFyZW50IGBMVmlld2AgdW50aWxcbiAqIHJlYWNoaW5nIHRoZSByb290IGBMVmlld2AuXG4gKlxuICogQHBhcmFtIGNvbXBvbmVudE9yVmlldyBhbnkgY29tcG9uZW50IG9yIHZpZXdcbiAqXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRSb290Vmlldyhjb21wb25lbnRPclZpZXc6IExWaWV3IHwge30pOiBMVmlldyB7XG4gIGxldCBsVmlldzogTFZpZXc7XG4gIGlmIChBcnJheS5pc0FycmF5KGNvbXBvbmVudE9yVmlldykpIHtcbiAgICBuZ0Rldk1vZGUgJiYgYXNzZXJ0RGVmaW5lZChjb21wb25lbnRPclZpZXcsICdsVmlldycpO1xuICAgIGxWaWV3ID0gY29tcG9uZW50T3JWaWV3IGFzIExWaWV3O1xuICB9IGVsc2Uge1xuICAgIG5nRGV2TW9kZSAmJiBhc3NlcnREZWZpbmVkKGNvbXBvbmVudE9yVmlldywgJ2NvbXBvbmVudCcpO1xuICAgIGxWaWV3ID0gcmVhZFBhdGNoZWRMVmlldyhjb21wb25lbnRPclZpZXcpICE7XG4gIH1cbiAgd2hpbGUgKGxWaWV3ICYmICEobFZpZXdbRkxBR1NdICYgTFZpZXdGbGFncy5Jc1Jvb3QpKSB7XG4gICAgbFZpZXcgPSBsVmlld1tQQVJFTlRdICE7XG4gIH1cbiAgcmV0dXJuIGxWaWV3O1xufVxuXG4vKipcbiAqIFJldHJpZXZlIG1hcCBvZiBsb2NhbCByZWZlcmVuY2VzLlxuICpcbiAqIFRoZSByZWZlcmVuY2VzIGFyZSByZXRyaWV2ZWQgYXMgYSBtYXAgb2YgbG9jYWwgcmVmZXJlbmNlIG5hbWUgdG8gZWxlbWVudCBvciBkaXJlY3RpdmUgaW5zdGFuY2UuXG4gKlxuICogQHBhcmFtIHRhcmdldCBBIERPTSBlbGVtZW50LCBjb21wb25lbnQgb3IgZGlyZWN0aXZlIGluc3RhbmNlLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExvY2FsUmVmcyh0YXJnZXQ6IHt9KToge1trZXk6IHN0cmluZ106IGFueX0ge1xuICBjb25zdCBjb250ZXh0ID0gbG9hZExDb250ZXh0KHRhcmdldCkgITtcblxuICBpZiAoY29udGV4dC5sb2NhbFJlZnMgPT09IHVuZGVmaW5lZCkge1xuICAgIGNvbnRleHQubG9jYWxSZWZzID0gZGlzY292ZXJMb2NhbFJlZnMoY29udGV4dC5sVmlldywgY29udGV4dC5ub2RlSW5kZXgpO1xuICB9XG5cbiAgcmV0dXJuIGNvbnRleHQubG9jYWxSZWZzIHx8IHt9O1xufVxuXG4vKipcbiAqIFJldHJpZXZlIHRoZSBob3N0IGVsZW1lbnQgb2YgdGhlIGNvbXBvbmVudC5cbiAqXG4gKiBVc2UgdGhpcyBmdW5jdGlvbiB0byByZXRyaWV2ZSB0aGUgaG9zdCBlbGVtZW50IG9mIHRoZSBjb21wb25lbnQuIFRoZSBob3N0XG4gKiBlbGVtZW50IGlzIHRoZSBlbGVtZW50IHdoaWNoIHRoZSBjb21wb25lbnQgaXMgYXNzb2NpYXRlZCB3aXRoLlxuICpcbiAqIEBwYXJhbSBkaXJlY3RpdmUgQ29tcG9uZW50IG9yIERpcmVjdGl2ZSBmb3Igd2hpY2ggdGhlIGhvc3QgZWxlbWVudCBzaG91bGQgYmUgcmV0cmlldmVkLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEhvc3RFbGVtZW50PFQ+KGRpcmVjdGl2ZTogVCk6IEVsZW1lbnQge1xuICByZXR1cm4gZ2V0TENvbnRleHQoZGlyZWN0aXZlKSAhLm5hdGl2ZSBhcyBuZXZlciBhcyBFbGVtZW50O1xufVxuXG4vKipcbiAqIFJldHJpZXZlcyB0aGUgcmVuZGVyZWQgdGV4dCBmb3IgYSBnaXZlbiBjb21wb25lbnQuXG4gKlxuICogVGhpcyBmdW5jdGlvbiByZXRyaWV2ZXMgdGhlIGhvc3QgZWxlbWVudCBvZiBhIGNvbXBvbmVudCBhbmRcbiAqIGFuZCB0aGVuIHJldHVybnMgdGhlIGB0ZXh0Q29udGVudGAgZm9yIHRoYXQgZWxlbWVudC4gVGhpcyBpbXBsaWVzXG4gKiB0aGF0IHRoZSB0ZXh0IHJldHVybmVkIHdpbGwgaW5jbHVkZSByZS1wcm9qZWN0ZWQgY29udGVudCBvZlxuICogdGhlIGNvbXBvbmVudCBhcyB3ZWxsLlxuICpcbiAqIEBwYXJhbSBjb21wb25lbnQgVGhlIGNvbXBvbmVudCB0byByZXR1cm4gdGhlIGNvbnRlbnQgdGV4dCBmb3IuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRSZW5kZXJlZFRleHQoY29tcG9uZW50OiBhbnkpOiBzdHJpbmcge1xuICBjb25zdCBob3N0RWxlbWVudCA9IGdldEhvc3RFbGVtZW50KGNvbXBvbmVudCk7XG4gIHJldHVybiBob3N0RWxlbWVudC50ZXh0Q29udGVudCB8fCAnJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxvYWRMQ29udGV4dEZyb21Ob2RlKG5vZGU6IE5vZGUpOiBMQ29udGV4dCB7XG4gIGlmICghKG5vZGUgaW5zdGFuY2VvZiBOb2RlKSkgdGhyb3cgbmV3IEVycm9yKCdFeHBlY3RpbmcgaW5zdGFuY2Ugb2YgRE9NIE5vZGUnKTtcbiAgcmV0dXJuIGxvYWRMQ29udGV4dChub2RlKSAhO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIExpc3RlbmVyIHtcbiAgbmFtZTogc3RyaW5nO1xuICBlbGVtZW50OiBFbGVtZW50O1xuICBjYWxsYmFjazogKHZhbHVlOiBhbnkpID0+IGFueTtcbiAgdXNlQ2FwdHVyZTogYm9vbGVhbnxudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNCcm93c2VyRXZlbnRzKGxpc3RlbmVyOiBMaXN0ZW5lcik6IGJvb2xlYW4ge1xuICAvLyBCcm93c2VyIGV2ZW50cyBhcmUgdGhvc2Ugd2hpY2ggZG9uJ3QgaGF2ZSBgdXNlQ2FwdHVyZWAgYXMgYm9vbGVhbi5cbiAgcmV0dXJuIHR5cGVvZiBsaXN0ZW5lci51c2VDYXB0dXJlID09PSAnYm9vbGVhbic7XG59XG5cblxuLyoqXG4gKiBSZXRyaWV2ZXMgYSBsaXN0IG9mIERPTSBsaXN0ZW5lcnMuXG4gKlxuICogYGBgXG4gKiA8bXktYXBwPlxuICogICAjVklFV1xuICogICAgIDxkaXYgKGNsaWNrKT1cImRvU29tZXRoaW5nKClcIj5cbiAqICAgICA8L2Rpdj5cbiAqIDwvbXAtYXBwPlxuICpcbiAqIGV4cGVjdChnZXRMaXN0ZW5lcnMoPGRpdj4pKS50b0VxdWFsKHtcbiAqICAgbmFtZTogJ2NsaWNrJyxcbiAqICAgZWxlbWVudDogPGRpdj4sXG4gKiAgIGNhbGxiYWNrOiAoKSA9PiBkb1NvbWV0aGluZygpLFxuICogICB1c2VDYXB0dXJlOiBmYWxzZVxuICogfSk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gZWxlbWVudCBFbGVtZW50IGZvciB3aGljaCB0aGUgRE9NIGxpc3RlbmVycyBzaG91bGQgYmUgcmV0cmlldmVkLlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TGlzdGVuZXJzKGVsZW1lbnQ6IEVsZW1lbnQpOiBMaXN0ZW5lcltdIHtcbiAgY29uc3QgbENvbnRleHQgPSBsb2FkTENvbnRleHRGcm9tTm9kZShlbGVtZW50KTtcbiAgY29uc3QgbFZpZXcgPSBsQ29udGV4dC5sVmlldztcbiAgY29uc3QgdFZpZXcgPSBsVmlld1tUVklFV107XG4gIGNvbnN0IGxDbGVhbnVwID0gbFZpZXdbQ0xFQU5VUF07XG4gIGNvbnN0IHRDbGVhbnVwID0gdFZpZXcuY2xlYW51cDtcbiAgY29uc3QgbGlzdGVuZXJzOiBMaXN0ZW5lcltdID0gW107XG4gIGlmICh0Q2xlYW51cCAmJiBsQ2xlYW51cCkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdENsZWFudXAubGVuZ3RoOykge1xuICAgICAgY29uc3QgZmlyc3RQYXJhbSA9IHRDbGVhbnVwW2krK107XG4gICAgICBjb25zdCBzZWNvbmRQYXJhbSA9IHRDbGVhbnVwW2krK107XG4gICAgICBpZiAodHlwZW9mIGZpcnN0UGFyYW0gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGNvbnN0IG5hbWU6IHN0cmluZyA9IGZpcnN0UGFyYW07XG4gICAgICAgIGNvbnN0IGxpc3RlbmVyRWxlbWVudCA9IHJlYWRFbGVtZW50VmFsdWUobFZpZXdbc2Vjb25kUGFyYW1dKSBhcyBhbnkgYXMgRWxlbWVudDtcbiAgICAgICAgY29uc3QgY2FsbGJhY2s6ICh2YWx1ZTogYW55KSA9PiBhbnkgPSBsQ2xlYW51cFt0Q2xlYW51cFtpKytdXTtcbiAgICAgICAgY29uc3QgdXNlQ2FwdHVyZU9ySW5keCA9IHRDbGVhbnVwW2krK107XG4gICAgICAgIC8vIGlmIHVzZUNhcHR1cmVPckluZHggaXMgYm9vbGVhbiB0aGVuIHJlcG9ydCBpdCBhcyBpcy5cbiAgICAgICAgLy8gaWYgdXNlQ2FwdHVyZU9ySW5keCBpcyBwb3NpdGl2ZSBudW1iZXIgdGhlbiBpdCBpbiB1bnN1YnNjcmliZSBtZXRob2RcbiAgICAgICAgLy8gaWYgdXNlQ2FwdHVyZU9ySW5keCBpcyBuZWdhdGl2ZSBudW1iZXIgdGhlbiBpdCBpcyBhIFN1YnNjcmlwdGlvblxuICAgICAgICBjb25zdCB1c2VDYXB0dXJlID0gdHlwZW9mIHVzZUNhcHR1cmVPckluZHggPT09ICdib29sZWFuJyA/XG4gICAgICAgICAgICB1c2VDYXB0dXJlT3JJbmR4IDpcbiAgICAgICAgICAgICh1c2VDYXB0dXJlT3JJbmR4ID49IDAgPyBmYWxzZSA6IG51bGwpO1xuICAgICAgICBpZiAoZWxlbWVudCA9PSBsaXN0ZW5lckVsZW1lbnQpIHtcbiAgICAgICAgICBsaXN0ZW5lcnMucHVzaCh7ZWxlbWVudCwgbmFtZSwgY2FsbGJhY2ssIHVzZUNhcHR1cmV9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICBsaXN0ZW5lcnMuc29ydChzb3J0TGlzdGVuZXJzKTtcbiAgcmV0dXJuIGxpc3RlbmVycztcbn1cblxuZnVuY3Rpb24gc29ydExpc3RlbmVycyhhOiBMaXN0ZW5lciwgYjogTGlzdGVuZXIpIHtcbiAgaWYgKGEubmFtZSA9PSBiLm5hbWUpIHJldHVybiAwO1xuICByZXR1cm4gYS5uYW1lIDwgYi5uYW1lID8gLTEgOiAxO1xufVxuXG4vKipcbiAqIFRoaXMgZnVuY3Rpb24gc2hvdWxkIG5vdCBleGlzdCBiZWNhdXNlIGl0IGlzIG1lZ2Ftb3JwaGljIGFuZCBvbmx5IG1vc3RseSBjb3JyZWN0LlxuICpcbiAqIFNlZSBjYWxsIHNpdGUgZm9yIG1vcmUgaW5mby5cbiAqL1xuZnVuY3Rpb24gaXNEaXJlY3RpdmVEZWZIYWNrKG9iajogYW55KTogb2JqIGlzIERpcmVjdGl2ZURlZjxhbnk+IHtcbiAgcmV0dXJuIG9iai50eXBlICE9PSB1bmRlZmluZWQgJiYgb2JqLnRlbXBsYXRlICE9PSB1bmRlZmluZWQgJiYgb2JqLmRlY2xhcmVkSW5wdXRzICE9PSB1bmRlZmluZWQ7XG59XG4iXX0=