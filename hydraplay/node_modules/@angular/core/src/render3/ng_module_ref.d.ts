/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injector } from '../di/injector';
import { InjectFlags } from '../di/injector_compatibility';
import { ComponentFactoryResolver as viewEngine_ComponentFactoryResolver } from '../linker/component_factory_resolver';
import { InternalNgModuleRef, NgModuleFactory as viewEngine_NgModuleFactory, NgModuleRef as viewEngine_NgModuleRef } from '../linker/ng_module_factory';
import { NgModuleDef } from '../metadata/ng_module';
import { Type } from '../type';
export interface NgModuleType<T = any> extends Type<T> {
    ngModuleDef: NgModuleDef<T>;
}
export declare class NgModuleRef<T> extends viewEngine_NgModuleRef<T> implements InternalNgModuleRef<T> {
    _parent: Injector | null;
    _bootstrapComponents: Type<any>[];
    _r3Injector: Injector;
    injector: Injector;
    instance: T;
    destroyCbs: (() => void)[] | null;
    constructor(ngModuleType: Type<T>, _parent: Injector | null);
    get(token: any, notFoundValue?: any, injectFlags?: InjectFlags): any;
    readonly componentFactoryResolver: viewEngine_ComponentFactoryResolver;
    destroy(): void;
    onDestroy(callback: () => void): void;
}
export declare class NgModuleFactory<T> extends viewEngine_NgModuleFactory<T> {
    moduleType: Type<T>;
    constructor(moduleType: Type<T>);
    create(parentInjector: Injector | null): viewEngine_NgModuleRef<T>;
}
