/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { BaseException, JsonObject, Path, experimental, logging, virtualFs } from '@angular-devkit/core';
import { Observable } from 'rxjs';
/**
 * @deprecated
 */
export declare class ProjectNotFoundException extends BaseException {
    constructor(projectName: string);
}
/**
 * @deprecated
 */
export declare class TargetNotFoundException extends BaseException {
    constructor(projectName: string, targetName: string);
}
/**
 * @deprecated
 */
export declare class ConfigurationNotFoundException extends BaseException {
    constructor(projectName: string, configurationName: string);
}
/**
 * @deprecated
 */
export declare class BuilderCannotBeResolvedException extends BaseException {
    constructor(builder: string);
}
/**
 * @deprecated
 */
export declare class ArchitectNotYetLoadedException extends BaseException {
    constructor();
}
/**
 * @deprecated
 */
export declare class BuilderNotFoundException extends BaseException {
    constructor(builder: string);
}
/**
 * @deprecated
 */
export interface BuilderContext {
    logger: logging.Logger;
    host: virtualFs.Host<{}>;
    workspace: experimental.workspace.Workspace;
    architect: Architect;
    targetSpecifier?: TargetSpecifier;
}
/**
 * TODO: use unknown
 * @deprecated
 */
export interface BuildEvent<BuildResultT = any> {
    success: boolean;
    result?: BuildResultT;
}
/**
 * @deprecated
 */
export interface Builder<OptionsT> {
    run(builderConfig: BuilderConfiguration<Partial<OptionsT>>): Observable<BuildEvent>;
}
/**
 * @deprecated
 */
export interface BuilderPathsMap {
    builders: {
        [k: string]: BuilderPaths;
    };
}
/**
 * @deprecated
 */
export interface BuilderPaths {
    class: Path;
    schema: Path;
    description: string;
}
/**
 * @deprecated
 */
export interface BuilderDescription {
    name: string;
    schema: JsonObject;
    description: string;
}
/**
 * @deprecated
 */
export interface BuilderConstructor<OptionsT> {
    new (context: BuilderContext): Builder<OptionsT>;
}
/**
 * @deprecated
 */
export interface BuilderConfiguration<OptionsT = {}> {
    root: Path;
    sourceRoot?: Path;
    projectType: string;
    builder: string;
    options: OptionsT;
}
/**
 * @deprecated
 */
export interface TargetSpecifier<OptionsT = {}> {
    project: string;
    target: string;
    configuration?: string;
    overrides?: Partial<OptionsT>;
}
/**
 * @deprecated
 */
export interface TargetMap {
    [k: string]: Target;
}
export declare type TargetOptions<T = JsonObject> = T;
export declare type TargetConfiguration<T = JsonObject> = Partial<T>;
/**
 * @deprecated
 */
export interface Target<T = JsonObject> {
    builder: string;
    options: TargetOptions<T>;
    configurations?: {
        [k: string]: TargetConfiguration<T>;
    };
}
/**
 * @deprecated
 */
export declare class Architect {
    private _workspace;
    private readonly _targetsSchemaPath;
    private readonly _buildersSchemaPath;
    private _targetsSchema;
    private _buildersSchema;
    private _architectSchemasLoaded;
    private _targetMapMap;
    private _builderPathsMap;
    private _builderDescriptionMap;
    private _builderConstructorMap;
    constructor(_workspace: experimental.workspace.Workspace);
    loadArchitect(): Observable<this>;
    listProjectTargets(projectName: string): string[];
    private _getProjectTargetMap;
    private _getProjectTarget;
    getBuilderConfiguration<OptionsT>(targetSpec: TargetSpecifier): BuilderConfiguration<OptionsT>;
    run<OptionsT>(builderConfig: BuilderConfiguration<OptionsT>, partialContext?: Partial<BuilderContext>): Observable<BuildEvent>;
    getBuilderDescription<OptionsT>(builderConfig: BuilderConfiguration<OptionsT>): Observable<BuilderDescription>;
    validateBuilderOptions<OptionsT>(builderConfig: BuilderConfiguration<OptionsT>, builderDescription: BuilderDescription): Observable<BuilderConfiguration<OptionsT>>;
    getBuilder<OptionsT>(builderDescription: BuilderDescription, context: BuilderContext): Builder<OptionsT>;
    private _loadJsonFile;
}
