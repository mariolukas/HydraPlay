/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ElementRef } from '@angular/core';
import { BaseDirective2, StyleUtils, StyleBuilder, MediaMarshaller } from '@angular/flex-layout/core';
export interface GridAutoParent {
    inline: boolean;
}
export declare class GridAutoStyleBuilder extends StyleBuilder {
    buildStyles(input: string, parent: GridAutoParent): {
        'display': string;
        'grid-auto-flow': string;
    };
}
export declare class GridAutoDirective extends BaseDirective2 {
    protected elementRef: ElementRef;
    protected styleBuilder: GridAutoStyleBuilder;
    protected styler: StyleUtils;
    protected marshal: MediaMarshaller;
    inline: boolean;
    protected _inline: boolean;
    protected DIRECTIVE_KEY: string;
    constructor(elementRef: ElementRef, styleBuilder: GridAutoStyleBuilder, styler: StyleUtils, marshal: MediaMarshaller);
    protected updateWithValue(value: string): void;
}
/**
 * 'grid-auto-flow' CSS Grid styling directive
 * Configures the auto placement algorithm for the grid
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-23
 */
export declare class DefaultGridAutoDirective extends GridAutoDirective {
    protected inputs: string[];
}
