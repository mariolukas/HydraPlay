/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ElementRef } from '@angular/core';
import { MediaMarshaller, BaseDirective2, StyleBuilder, StyleDefinition, StyleUtils } from '@angular/flex-layout/core';
export declare class GridAlignStyleBuilder extends StyleBuilder {
    buildStyles(input: string): {
        [key: string]: string;
    };
}
export declare class GridAlignDirective extends BaseDirective2 {
    protected elementRef: ElementRef;
    protected styleBuilder: GridAlignStyleBuilder;
    protected styler: StyleUtils;
    protected marshal: MediaMarshaller;
    protected DIRECTIVE_KEY: string;
    constructor(elementRef: ElementRef, styleBuilder: GridAlignStyleBuilder, styler: StyleUtils, marshal: MediaMarshaller);
    protected styleCache: Map<string, StyleDefinition>;
}
/**
 * 'align' CSS Grid styling directive for grid children
 *  Defines positioning of child elements along row and column axis in a grid container
 *  Optional values: {row-axis} values or {row-axis column-axis} value pairs
 *
 *  @see https://css-tricks.com/snippets/css/complete-guide-grid/#prop-justify-self
 *  @see https://css-tricks.com/snippets/css/complete-guide-grid/#prop-align-self
 */
export declare class DefaultGridAlignDirective extends GridAlignDirective {
    protected inputs: string[];
}
