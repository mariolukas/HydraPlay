/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ElementRef, OnChanges } from '@angular/core';
import { BaseDirective2, StyleBuilder, StyleDefinition, StyleUtils, MediaMarshaller } from '@angular/flex-layout/core';
export declare class FlexOrderStyleBuilder extends StyleBuilder {
    buildStyles(value: string): {
        order: string | number;
    };
}
/**
 * 'flex-order' flexbox styling directive
 * Configures the positional ordering of the element in a sorted layout container
 * @see https://css-tricks.com/almanac/properties/o/order/
 */
export declare class FlexOrderDirective extends BaseDirective2 implements OnChanges {
    protected elRef: ElementRef;
    protected styleUtils: StyleUtils;
    protected styleBuilder: FlexOrderStyleBuilder;
    protected marshal: MediaMarshaller;
    protected DIRECTIVE_KEY: string;
    constructor(elRef: ElementRef, styleUtils: StyleUtils, styleBuilder: FlexOrderStyleBuilder, marshal: MediaMarshaller);
    protected styleCache: Map<string, StyleDefinition>;
}
export declare class DefaultFlexOrderDirective extends FlexOrderDirective {
    protected inputs: string[];
}
