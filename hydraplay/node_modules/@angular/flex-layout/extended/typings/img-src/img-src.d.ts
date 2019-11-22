/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ElementRef } from '@angular/core';
import { MediaMarshaller, BaseDirective2, StyleBuilder, StyleDefinition, StyleUtils } from '@angular/flex-layout/core';
export declare class ImgSrcStyleBuilder extends StyleBuilder {
    buildStyles(url: string): {
        'content': string;
    };
}
export declare class ImgSrcDirective extends BaseDirective2 {
    protected elementRef: ElementRef;
    protected styleBuilder: ImgSrcStyleBuilder;
    protected styler: StyleUtils;
    protected marshal: MediaMarshaller;
    protected platformId: Object;
    protected serverModuleLoaded: boolean;
    protected DIRECTIVE_KEY: string;
    protected defaultSrc: string;
    src: string;
    constructor(elementRef: ElementRef, styleBuilder: ImgSrcStyleBuilder, styler: StyleUtils, marshal: MediaMarshaller, platformId: Object, serverModuleLoaded: boolean);
    /**
     * Use the [responsively] activated input value to update
     * the host img src attribute or assign a default `img.src=''`
     * if the src has not been defined.
     *
     * Do nothing to standard `<img src="">` usages, only when responsive
     * keys are present do we actually call `setAttribute()`
     */
    protected updateWithValue(value?: string): void;
    protected styleCache: Map<string, StyleDefinition>;
}
/**
 * This directive provides a responsive API for the HTML <img> 'src' attribute
 * and will update the img.src property upon each responsive activation.
 *
 * e.g.
 *      <img src="defaultScene.jpg" src.xs="mobileScene.jpg"></img>
 *
 * @see https://css-tricks.com/responsive-images-youre-just-changing-resolutions-use-src/
 */
export declare class DefaultImgSrcDirective extends ImgSrcDirective {
    protected inputs: string[];
}
