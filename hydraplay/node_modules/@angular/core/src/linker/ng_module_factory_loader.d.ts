/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgModuleType } from '../render3/ng_module_ref';
import { NgModuleFactory } from './ng_module_factory';
/**
 * Used to load ng module factories.
 *
 * @publicApi
 */
export declare abstract class NgModuleFactoryLoader {
    abstract load(path: string): Promise<NgModuleFactory<any>>;
}
/**
 * Registers a loaded module. Should only be called from generated NgModuleFactory code.
 * @publicApi
 */
export declare function registerModuleFactory(id: string, factory: NgModuleFactory<any>): void;
export declare function registerNgModuleType(id: string, ngModuleType: NgModuleType): void;
export declare function clearModulesForTest(): void;
export declare function getModuleFactory__PRE_R3__(id: string): NgModuleFactory<any>;
export declare function getModuleFactory__POST_R3__(id: string): NgModuleFactory<any>;
/**
 * Returns the NgModuleFactory with the given id, if it exists and has been loaded.
 * Factories for modules that do not specify an `id` cannot be retrieved. Throws if the module
 * cannot be found.
 * @publicApi
 */
export declare const getModuleFactory: (id: string) => NgModuleFactory<any>;
