/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <reference types="node" />
import { BuildEvent, Builder, BuilderConfiguration, BuilderContext } from '@angular-devkit/architect';
import { Path, virtualFs } from '@angular-devkit/core';
import * as fs from 'fs';
import { Observable } from 'rxjs';
import { KarmaBuilderSchema, NormalizedKarmaBuilderSchema } from './schema';
export declare class KarmaBuilder implements Builder<KarmaBuilderSchema> {
    context: BuilderContext;
    constructor(context: BuilderContext);
    run(builderConfig: BuilderConfiguration<KarmaBuilderSchema>): Observable<BuildEvent>;
    buildWebpackConfig(root: Path, projectRoot: Path, sourceRoot: Path | undefined, host: virtualFs.Host<fs.Stats>, options: NormalizedKarmaBuilderSchema): any;
}
export default KarmaBuilder;
