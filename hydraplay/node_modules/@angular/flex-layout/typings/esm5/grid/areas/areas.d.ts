/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ElementRef } from '@angular/core';
import { BaseDirective2, StyleUtils, StyleBuilder, MediaMarshaller } from '@angular/flex-layout/core';
export interface GridAreasParent {
    inline: boolean;
}
export declare class GridAreasStyleBuiler extends StyleBuilder {
    buildStyles(input: string, parent: GridAreasParent): {
        'display': string;
        'grid-template-areas': string;
    };
}
export declare class GridAreasDirective extends BaseDirective2 {
    protected elRef: ElementRef;
    protected styleUtils: StyleUtils;
    protected styleBuilder: GridAreasStyleBuiler;
    protected marshal: MediaMarshaller;
    protected DIRECTIVE_KEY: string;
    inline: boolean;
    protected _inline: boolean;
    constructor(elRef: ElementRef, styleUtils: StyleUtils, styleBuilder: GridAreasStyleBuiler, marshal: MediaMarshaller);
    protected updateWithValue(value: string): void;
}
/**
 * 'grid-template-areas' CSS Grid styling directive
 * Configures the names of elements within the grid
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-14
 */
export declare class DefaultGridAreasDirective extends GridAreasDirective {
    protected inputs: string[];
}
