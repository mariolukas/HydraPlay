/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ElementRef } from '@angular/core';
import { BaseDirective2, StyleBuilder, StyleDefinition, StyleUtils, MediaMarshaller } from '@angular/flex-layout/core';
export declare class FlexFillStyleBuilder extends StyleBuilder {
    buildStyles(_input: string): {
        'margin': number;
        'width': string;
        'height': string;
        'min-width': string;
        'min-height': string;
    };
}
/**
 * 'fxFill' flexbox styling directive
 *  Maximizes width and height of element in a layout container
 *
 *  NOTE: fxFill is NOT responsive API!!
 */
export declare class FlexFillDirective extends BaseDirective2 {
    protected elRef: ElementRef;
    protected styleUtils: StyleUtils;
    protected styleBuilder: FlexFillStyleBuilder;
    protected marshal: MediaMarshaller;
    constructor(elRef: ElementRef, styleUtils: StyleUtils, styleBuilder: FlexFillStyleBuilder, marshal: MediaMarshaller);
    protected styleCache: Map<string, StyleDefinition>;
}
