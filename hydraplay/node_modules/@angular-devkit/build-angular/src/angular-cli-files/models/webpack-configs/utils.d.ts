/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ExtraEntryPoint, ExtraEntryPointObject } from '../../../browser/schema';
import { SourceMapDevToolPlugin } from 'webpack';
export declare const ngAppResolve: (resolvePath: string) => string;
export interface HashFormat {
    chunk: string;
    extract: string;
    file: string;
    script: string;
}
export declare function getOutputHashFormat(option: string, length?: number): HashFormat;
export declare type NormalizedEntryPoint = ExtraEntryPointObject & {
    bundleName: string;
};
export declare function normalizeExtraEntryPoints(extraEntryPoints: ExtraEntryPoint[], defaultBundleName: string): NormalizedEntryPoint[];
export declare function getSourceMapDevTool(scriptsSourceMap: boolean, stylesSourceMap: boolean, hiddenSourceMap?: boolean, inlineSourceMap?: boolean): SourceMapDevToolPlugin;
