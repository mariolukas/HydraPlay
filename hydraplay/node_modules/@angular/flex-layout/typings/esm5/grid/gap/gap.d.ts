/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ElementRef } from '@angular/core';
import { BaseDirective2, StyleUtils, MediaMarshaller, StyleBuilder } from '@angular/flex-layout/core';
export interface GridGapParent {
    inline: boolean;
}
export declare class GridGapStyleBuilder extends StyleBuilder {
    buildStyles(input: string, parent: GridGapParent): {
        'display': string;
        'grid-gap': string;
    };
}
export declare class GridGapDirective extends BaseDirective2 {
    protected elRef: ElementRef;
    protected styleUtils: StyleUtils;
    protected styleBuilder: GridGapStyleBuilder;
    protected marshal: MediaMarshaller;
    protected DIRECTIVE_KEY: string;
    inline: boolean;
    protected _inline: boolean;
    constructor(elRef: ElementRef, styleUtils: StyleUtils, styleBuilder: GridGapStyleBuilder, marshal: MediaMarshaller);
    protected updateWithValue(value: string): void;
}
/**
 * 'grid-gap' CSS Grid styling directive
 * Configures the gap between items in the grid
 * Syntax: <row gap> [<column-gap>]
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-17
 */
export declare class DefaultGridGapDirective extends GridGapDirective {
    protected inputs: string[];
}
