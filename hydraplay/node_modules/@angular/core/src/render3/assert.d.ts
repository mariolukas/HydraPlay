/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { TNode } from './interfaces/node';
import { LView } from './interfaces/view';
export declare function assertNumber(actual: any, msg: string): void;
export declare function assertEqual<T>(actual: T, expected: T, msg: string): void;
export declare function assertNotEqual<T>(actual: T, expected: T, msg: string): void;
export declare function assertSame<T>(actual: T, expected: T, msg: string): void;
export declare function assertLessThan<T>(actual: T, expected: T, msg: string): void;
export declare function assertGreaterThan<T>(actual: T, expected: T, msg: string): void;
export declare function assertNotDefined<T>(actual: T, msg: string): void;
export declare function assertDefined<T>(actual: T, msg: string): void;
export declare function assertComponentType(actual: any, msg?: string): void;
export declare function assertNgModuleType(actual: any, msg?: string): void;
export declare function assertDomNode(node: any): void;
export declare function assertPreviousIsParent(isParent: boolean): void;
export declare function assertHasParent(tNode: TNode): void;
export declare function assertDataNext(lView: LView, index: number, arr?: any[]): void;
export declare function assertDataInRange(arr: any[], index: number): void;
