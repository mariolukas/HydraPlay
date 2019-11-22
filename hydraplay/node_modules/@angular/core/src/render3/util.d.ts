/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { LContainer } from './interfaces/container';
import { LContext } from './interfaces/context';
import { ComponentDef, DirectiveDef } from './interfaces/definition';
import { RelativeInjectorLocation } from './interfaces/injector';
import { TContainerNode, TElementNode, TNode } from './interfaces/node';
import { RComment, RElement, RText } from './interfaces/renderer';
import { StylingContext } from './interfaces/styling';
import { LView, RootContext, TData } from './interfaces/view';
/**
 * Returns whether the values are different from a change detection stand point.
 *
 * Constraints are relaxed in checkNoChanges mode. See `devModeEqual` for details.
 */
export declare function isDifferent(a: any, b: any): boolean;
export declare function stringify(value: any): string;
/**
 * Flattens an array in non-recursive way. Input arrays are not modified.
 */
export declare function flatten(list: any[]): any[];
/** Retrieves a value from any `LView` or `TData`. */
export declare function loadInternal<T>(view: LView | TData, index: number): T;
/**
 * Takes the value of a slot in `LView` and returns the element node.
 *
 * Normally, element nodes are stored flat, but if the node has styles/classes on it,
 * it might be wrapped in a styling context. Or if that node has a directive that injects
 * ViewContainerRef, it may be wrapped in an LContainer. Or if that node is a component,
 * it will be wrapped in LView. It could even have all three, so we keep looping
 * until we find something that isn't an array.
 *
 * @param value The initial value in `LView`
 */
export declare function readElementValue(value: RElement | StylingContext | LContainer | LView): RElement;
/**
 * Retrieves an element value from the provided `viewData`, by unwrapping
 * from any containers, component views, or style contexts.
 */
export declare function getNativeByIndex(index: number, lView: LView): RElement;
export declare function getNativeByTNode(tNode: TNode, hostView: LView): RElement | RText | RComment;
export declare function getTNode(index: number, view: LView): TNode;
export declare function getComponentViewByIndex(nodeIndex: number, hostView: LView): LView;
export declare function isContentQueryHost(tNode: TNode): boolean;
export declare function isComponent(tNode: TNode): boolean;
export declare function isComponentDef<T>(def: DirectiveDef<T>): def is ComponentDef<T>;
export declare function isLContainer(value: RElement | RComment | LContainer | StylingContext): boolean;
export declare function isRootView(target: LView): boolean;
/**
 * Retrieve the root view from any component by walking the parent `LView` until
 * reaching the root `LView`.
 *
 * @param component any component
 */
export declare function getRootView(target: LView | {}): LView;
export declare function getRootContext(viewOrComponent: LView | {}): RootContext;
/**
 * Returns the monkey-patch value data present on the target (which could be
 * a component, directive or a DOM node).
 */
export declare function readPatchedData(target: any): LView | LContext | null;
export declare function readPatchedLView(target: any): LView | null;
export declare function hasParentInjector(parentLocation: RelativeInjectorLocation): boolean;
export declare function getParentInjectorIndex(parentLocation: RelativeInjectorLocation): number;
export declare function getParentInjectorViewOffset(parentLocation: RelativeInjectorLocation): number;
/**
 * Unwraps a parent injector location number to find the view offset from the current injector,
 * then walks up the declaration view tree until the view is found that contains the parent
 * injector.
 *
 * @param location The location of the parent injector, which contains the view offset
 * @param startView The LView instance from which to start walking up the view tree
 * @returns The LView instance that contains the parent injector
 */
export declare function getParentInjectorView(location: RelativeInjectorLocation, startView: LView): LView;
/**
 * Unwraps a parent injector location number to find the view offset from the current injector,
 * then walks up the declaration view tree until the TNode of the parent injector is found.
 *
 * @param location The location of the parent injector, which contains the view offset
 * @param startView The LView instance from which to start walking up the view tree
 * @param startTNode The TNode instance of the starting element
 * @returns The TNode of the parent injector
 */
export declare function getParentInjectorTNode(location: RelativeInjectorLocation, startView: LView, startTNode: TNode): TElementNode | TContainerNode | null;
export declare const defaultScheduler: any;
/**
 * Equivalent to ES6 spread, add each item to an array.
 *
 * @param items The items to add
 * @param arr The array to which you want to add the items
 */
export declare function addAllToArray(items: any[], arr: any[]): void;
/**
 * Given a current view, finds the nearest component's host (LElement).
 *
 * @param lView LView for which we want a host element node
 * @returns The host node
 */
export declare function findComponentView(lView: LView): LView;
