/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ElementRef } from '@angular/core';
import { BaseDirective2, StyleUtils, StyleBuilder, StyleDefinition, MediaMarshaller } from '@angular/flex-layout/core';
export interface GridAlignRowsParent {
    inline: boolean;
}
export declare class GridAlignRowsStyleBuilder extends StyleBuilder {
    buildStyles(input: string, parent: GridAlignRowsParent): StyleDefinition;
}
export declare class GridAlignRowsDirective extends BaseDirective2 {
    protected elementRef: ElementRef;
    protected styleBuilder: GridAlignRowsStyleBuilder;
    protected styler: StyleUtils;
    protected marshal: MediaMarshaller;
    protected DIRECTIVE_KEY: string;
    inline: boolean;
    protected _inline: boolean;
    constructor(elementRef: ElementRef, styleBuilder: GridAlignRowsStyleBuilder, styler: StyleUtils, marshal: MediaMarshaller);
    protected updateWithValue(value: string): void;
}
/**
 * 'row alignment' CSS Grid styling directive
 * Configures the alignment in the row direction
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-18
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-20
 */
export declare class DefaultGridAlignRowsDirective extends GridAlignRowsDirective {
    protected inputs: string[];
}
