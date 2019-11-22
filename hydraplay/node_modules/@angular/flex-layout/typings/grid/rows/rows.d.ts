/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ElementRef } from '@angular/core';
import { MediaMarshaller, BaseDirective2, StyleBuilder, StyleUtils } from '@angular/flex-layout/core';
export interface GridRowsParent {
    inline: boolean;
}
export declare class GridRowsStyleBuilder extends StyleBuilder {
    buildStyles(input: string, parent: GridRowsParent): {
        'display': string;
        'grid-auto-rows': string;
        'grid-template-rows': string;
    };
}
export declare class GridRowsDirective extends BaseDirective2 {
    protected elementRef: ElementRef;
    protected styleBuilder: GridRowsStyleBuilder;
    protected styler: StyleUtils;
    protected marshal: MediaMarshaller;
    protected DIRECTIVE_KEY: string;
    inline: boolean;
    protected _inline: boolean;
    constructor(elementRef: ElementRef, styleBuilder: GridRowsStyleBuilder, styler: StyleUtils, marshal: MediaMarshaller);
    protected updateWithValue(value: string): void;
}
/**
 * 'grid-template-rows' CSS Grid styling directive
 * Configures the sizing for the rows in the grid
 * Syntax: <column value> [auto]
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-13
 */
export declare class DefaultGridRowsDirective extends GridRowsDirective {
    protected inputs: string[];
}
