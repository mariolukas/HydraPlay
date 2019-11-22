/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ElementRef } from '@angular/core';
import { BaseDirective2, StyleUtils, MediaMarshaller, StyleBuilder, StyleDefinition } from '@angular/flex-layout/core';
export declare class GridColumnStyleBuilder extends StyleBuilder {
    buildStyles(input: string): {
        'grid-column': string;
    };
}
export declare class GridColumnDirective extends BaseDirective2 {
    protected elementRef: ElementRef;
    protected styleBuilder: GridColumnStyleBuilder;
    protected styler: StyleUtils;
    protected marshal: MediaMarshaller;
    protected DIRECTIVE_KEY: string;
    constructor(elementRef: ElementRef, styleBuilder: GridColumnStyleBuilder, styler: StyleUtils, marshal: MediaMarshaller);
    protected styleCache: Map<string, StyleDefinition>;
}
/**
 * 'grid-column' CSS Grid styling directive
 * Configures the name or position of an element within the grid
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-26
 */
export declare class DefaultGridColumnDirective extends GridColumnDirective {
    protected inputs: string[];
}
