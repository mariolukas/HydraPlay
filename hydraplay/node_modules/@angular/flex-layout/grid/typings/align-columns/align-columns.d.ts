/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ElementRef } from '@angular/core';
import { BaseDirective2, StyleUtils, StyleBuilder, StyleDefinition, MediaMarshaller } from '@angular/flex-layout/core';
export interface GridAlignColumnsParent {
    inline: boolean;
}
export declare class GridAlignColumnsStyleBuilder extends StyleBuilder {
    buildStyles(input: string, parent: GridAlignColumnsParent): StyleDefinition;
}
export declare class GridAlignColumnsDirective extends BaseDirective2 {
    protected elementRef: ElementRef;
    protected styleBuilder: GridAlignColumnsStyleBuilder;
    protected styler: StyleUtils;
    protected marshal: MediaMarshaller;
    protected DIRECTIVE_KEY: string;
    inline: boolean;
    protected _inline: boolean;
    constructor(elementRef: ElementRef, styleBuilder: GridAlignColumnsStyleBuilder, styler: StyleUtils, marshal: MediaMarshaller);
    protected updateWithValue(value: string): void;
}
/**
 * 'column alignment' CSS Grid styling directive
 * Configures the alignment in the column direction
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-19
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-21
 */
export declare class DefaultGridAlignColumnsDirective extends GridAlignColumnsDirective {
    protected inputs: string[];
}
