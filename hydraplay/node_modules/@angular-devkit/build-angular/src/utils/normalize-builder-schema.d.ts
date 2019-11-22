/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { BuilderConfiguration } from '@angular-devkit/architect';
import { Path, virtualFs } from '@angular-devkit/core';
import { BrowserBuilderSchema, NormalizedBrowserBuilderSchema } from '../browser/schema';
import { KarmaBuilderSchema, NormalizedKarmaBuilderSchema } from '../karma/schema';
import { BuildWebpackServerSchema, NormalizedServerBuilderServerSchema } from '../server/schema';
export declare function normalizeBuilderSchema<BuilderConfigurationT extends BuilderConfiguration<BrowserBuilderSchema | BuildWebpackServerSchema | KarmaBuilderSchema>, OptionsT = BuilderConfigurationT['options']>(host: virtualFs.Host<{}>, root: Path, builderConfig: BuilderConfigurationT): OptionsT extends BrowserBuilderSchema ? NormalizedBrowserBuilderSchema : OptionsT extends BuildWebpackServerSchema ? NormalizedServerBuilderServerSchema : OptionsT extends KarmaBuilderSchema ? NormalizedKarmaBuilderSchema : any;
