/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ElementRef, OnChanges } from '@angular/core';
import { BaseDirective2, StyleBuilder, StyleDefinition, StyleUtils, MediaMarshaller } from '@angular/flex-layout/core';
export declare class LayoutStyleBuilder extends StyleBuilder {
    buildStyles(input: string): {
        'display': string;
        'box-sizing': string;
        'flex-direction': string;
        'flex-wrap': string | null;
    };
}
/**
 * 'layout' flexbox styling directive
 * Defines the positioning flow direction for the child elements: row or column
 * Optional values: column or row (default)
 * @see https://css-tricks.com/almanac/properties/f/flex-direction/
 *
 */
export declare class LayoutDirective extends BaseDirective2 implements OnChanges {
    protected elRef: ElementRef;
    protected styleUtils: StyleUtils;
    protected styleBuilder: LayoutStyleBuilder;
    protected marshal: MediaMarshaller;
    protected DIRECTIVE_KEY: string;
    constructor(elRef: ElementRef, styleUtils: StyleUtils, styleBuilder: LayoutStyleBuilder, marshal: MediaMarshaller);
    protected styleCache: Map<string, StyleDefinition>;
}
export declare class DefaultLayoutDirective extends LayoutDirective {
    protected inputs: string[];
}
