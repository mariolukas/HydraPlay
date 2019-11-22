/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { LView } from './interfaces/view';
/** Updates binding and returns the value. */
export declare function updateBinding(lView: LView, bindingIndex: number, value: any): any;
/** Gets the current binding value. */
export declare function getBinding(lView: LView, bindingIndex: number): any;
/** Updates binding if changed, then returns whether it was updated. */
export declare function bindingUpdated(lView: LView, bindingIndex: number, value: any): boolean;
/** Updates 2 bindings if changed, then returns whether either was updated. */
export declare function bindingUpdated2(lView: LView, bindingIndex: number, exp1: any, exp2: any): boolean;
/** Updates 3 bindings if changed, then returns whether any was updated. */
export declare function bindingUpdated3(lView: LView, bindingIndex: number, exp1: any, exp2: any, exp3: any): boolean;
/** Updates 4 bindings if changed, then returns whether any was updated. */
export declare function bindingUpdated4(lView: LView, bindingIndex: number, exp1: any, exp2: any, exp3: any, exp4: any): boolean;
