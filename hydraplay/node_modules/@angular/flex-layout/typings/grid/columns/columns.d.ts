/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ElementRef } from '@angular/core';
import { MediaMarshaller, BaseDirective2, StyleBuilder, StyleUtils } from '@angular/flex-layout/core';
export interface GridColumnsParent {
    inline: boolean;
}
export declare class GridColumnsStyleBuilder extends StyleBuilder {
    buildStyles(input: string, parent: GridColumnsParent): {
        'display': string;
        'grid-auto-columns': string;
        'grid-template-columns': string;
    };
}
export declare class GridColumnsDirective extends BaseDirective2 {
    protected elementRef: ElementRef;
    protected styleBuilder: GridColumnsStyleBuilder;
    protected styler: StyleUtils;
    protected marshal: MediaMarshaller;
    protected DIRECTIVE_KEY: string;
    inline: boolean;
    protected _inline: boolean;
    constructor(elementRef: ElementRef, styleBuilder: GridColumnsStyleBuilder, styler: StyleUtils, marshal: MediaMarshaller);
    protected updateWithValue(value: string): void;
}
/**
 * 'grid-template-columns' CSS Grid styling directive
 * Configures the sizing for the columns in the grid
 * Syntax: <column value> [auto]
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-13
 */
export declare class DefaultGridColumnsDirective extends GridColumnsDirective {
    protected inputs: string[];
}
