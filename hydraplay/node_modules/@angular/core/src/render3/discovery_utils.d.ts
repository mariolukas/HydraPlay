/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injector } from '../di/injector';
import { LContext } from './interfaces/context';
import { LView, RootContext } from './interfaces/view';
/**
 * Returns the component instance associated with a given DOM host element.
 * Elements which don't represent components return `null`.
 *
 * @param element Host DOM element from which the component should be retrieved.
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
 * @publicApi
 */
export declare function getComponent<T = {}>(element: Element): T | null;
/**
 * Returns the component instance associated with a given DOM host element.
 * Elements which don't represent components return `null`.
 *
 * @param element Host DOM element from which the component should be retrieved.
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
 * @publicApi
 */
export declare function getContext<T = {}>(element: Element): T | null;
/**
 * Returns the component instance associated with view which owns the DOM element (`null`
 * otherwise).
 *
 * @param element DOM element which is owned by an existing component's view.
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
 * @publicApi
 */
export declare function getViewComponent<T = {}>(element: Element | {}): T | null;
/**
 * Returns the `RootContext` instance that is associated with
 * the application where the target is situated.
 *
 */
export declare function getRootContext(target: LView | {}): RootContext;
/**
 * Retrieve all root components.
 *
 * Root components are those which have been bootstrapped by Angular.
 *
 * @param target A DOM element, component or directive instance.
 *
 * @publicApi
 */
export declare function getRootComponents(target: {}): any[];
/**
 * Retrieves an `Injector` associated with the element, component or directive.
 *
 * @param target A DOM element, component or directive instance.
 *
 * @publicApi
 */
export declare function getInjector(target: {}): Injector;
/**
 * Retrieve a set of injection tokens at a given DOM node.
 *
 * @param element Element for which the injection tokens should be retrieved.
 * @publicApi
 */
export declare function getInjectionTokens(element: Element): any[];
/**
 * Retrieves directives associated with a given DOM host element.
 *
 * @param target A DOM element, component or directive instance.
 *
 * @publicApi
 */
export declare function getDirectives(target: {}): Array<{}>;
/**
 * Returns LContext associated with a target passed as an argument.
 * Throws if a given target doesn't have associated LContext.
 *
 */
export declare function loadLContext(target: {}): LContext;
export declare function loadLContext(target: {}, throwOnNotFound: false): LContext | null;
/**
 * Retrieve the root view from any component by walking the parent `LView` until
 * reaching the root `LView`.
 *
 * @param componentOrView any component or view
 *
 */
export declare function getRootView(componentOrView: LView | {}): LView;
/**
 * Retrieve map of local references.
 *
 * The references are retrieved as a map of local reference name to element or directive instance.
 *
 * @param target A DOM element, component or directive instance.
 *
 * @publicApi
 */
export declare function getLocalRefs(target: {}): {
    [key: string]: any;
};
/**
 * Retrieve the host element of the component.
 *
 * Use this function to retrieve the host element of the component. The host
 * element is the element which the component is associated with.
 *
 * @param directive Component or Directive for which the host element should be retrieved.
 *
 * @publicApi
 */
export declare function getHostElement<T>(directive: T): Element;
/**
 * Retrieves the rendered text for a given component.
 *
 * This function retrieves the host element of a component and
 * and then returns the `textContent` for that element. This implies
 * that the text returned will include re-projected content of
 * the component as well.
 *
 * @param component The component to return the content text for.
 */
export declare function getRenderedText(component: any): string;
export declare function loadLContextFromNode(node: Node): LContext;
export interface Listener {
    name: string;
    element: Element;
    callback: (value: any) => any;
    useCapture: boolean | null;
}
export declare function isBrowserEvents(listener: Listener): boolean;
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
 * @param element Element for which the DOM listeners should be retrieved.
 * @publicApi
 */
export declare function getListeners(element: Element): Listener[];
