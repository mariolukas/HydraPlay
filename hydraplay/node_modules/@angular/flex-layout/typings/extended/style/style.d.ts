/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { DoCheck, ElementRef, KeyValueDiffers, Renderer2 } from '@angular/core';
import { NgStyle } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { BaseDirective2, StyleUtils, MediaMarshaller } from '@angular/flex-layout/core';
import { NgStyleType, NgStyleMap } from './style-transforms';
export declare class StyleDirective extends BaseDirective2 implements DoCheck {
    protected elementRef: ElementRef;
    protected styler: StyleUtils;
    protected marshal: MediaMarshaller;
    protected keyValueDiffers: KeyValueDiffers;
    protected renderer: Renderer2;
    protected sanitizer: DomSanitizer;
    private readonly ngStyleInstance;
    protected DIRECTIVE_KEY: string;
    protected fallbackStyles: NgStyleMap;
    protected isServer: boolean;
    constructor(elementRef: ElementRef, styler: StyleUtils, marshal: MediaMarshaller, keyValueDiffers: KeyValueDiffers, renderer: Renderer2, sanitizer: DomSanitizer, ngStyleInstance: NgStyle, serverLoaded: boolean, platformId: Object);
    /** Add generated styles */
    protected updateWithValue(value: any): void;
    /** Remove generated styles */
    protected clearStyles(): void;
    /**
     * Convert raw strings to ngStyleMap; which is required by ngStyle
     * NOTE: Raw string key-value pairs MUST be delimited by `;`
     *       Comma-delimiters are not supported due to complexities of
     *       possible style values such as `rgba(x,x,x,x)` and others
     */
    protected buildStyleMap(styles: NgStyleType): NgStyleMap;
    /** For ChangeDetectionStrategy.onPush and ngOnChanges() updates */
    ngDoCheck(): void;
}
/**
 * Directive to add responsive support for ngStyle.
 *
 */
export declare class DefaultStyleDirective extends StyleDirective implements DoCheck {
    protected inputs: string[];
}
