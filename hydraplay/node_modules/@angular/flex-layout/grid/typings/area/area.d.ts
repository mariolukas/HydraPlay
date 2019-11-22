/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ElementRef } from '@angular/core';
import { BaseDirective2, StyleUtils, MediaMarshaller, StyleBuilder, StyleDefinition } from '@angular/flex-layout/core';
export declare class GridAreaStyleBuilder extends StyleBuilder {
    buildStyles(input: string): {
        'grid-area': string;
    };
}
export declare class GridAreaDirective extends BaseDirective2 {
    protected elRef: ElementRef;
    protected styleUtils: StyleUtils;
    protected styleBuilder: GridAreaStyleBuilder;
    protected marshal: MediaMarshaller;
    protected DIRECTIVE_KEY: string;
    constructor(elRef: ElementRef, styleUtils: StyleUtils, styleBuilder: GridAreaStyleBuilder, marshal: MediaMarshaller);
    protected styleCache: Map<string, StyleDefinition>;
}
/**
 * 'grid-area' CSS Grid styling directive
 * Configures the name or position of an element within the grid
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-27
 */
export declare class DefaultGridAreaDirective extends GridAreaDirective {
    protected inputs: string[];
}
