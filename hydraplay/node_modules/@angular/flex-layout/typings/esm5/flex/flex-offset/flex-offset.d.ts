/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ElementRef, OnChanges } from '@angular/core';
import { Directionality } from '@angular/cdk/bidi';
import { MediaMarshaller, BaseDirective2, StyleBuilder, StyleDefinition, StyleUtils } from '@angular/flex-layout/core';
export interface FlexOffsetParent {
    layout: string;
    isRtl: boolean;
}
export declare class FlexOffsetStyleBuilder extends StyleBuilder {
    buildStyles(offset: string, parent: FlexOffsetParent): StyleDefinition;
}
/**
 * 'flex-offset' flexbox styling directive
 * Configures the 'margin-left' of the element in a layout container
 */
export declare class FlexOffsetDirective extends BaseDirective2 implements OnChanges {
    protected elRef: ElementRef;
    protected directionality: Directionality;
    protected styleBuilder: FlexOffsetStyleBuilder;
    protected marshal: MediaMarshaller;
    protected styler: StyleUtils;
    protected DIRECTIVE_KEY: string;
    constructor(elRef: ElementRef, directionality: Directionality, styleBuilder: FlexOffsetStyleBuilder, marshal: MediaMarshaller, styler: StyleUtils);
    /**
     * Using the current fxFlexOffset value, update the inline CSS
     * NOTE: this will assign `margin-left` if the parent flex-direction == 'row',
     *       otherwise `margin-top` is used for the offset.
     */
    protected updateWithValue(value?: string | number): void;
}
export declare class DefaultFlexOffsetDirective extends FlexOffsetDirective {
    protected inputs: string[];
}
