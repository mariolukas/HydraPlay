/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { DoCheck, ElementRef, IterableDiffers, KeyValueDiffers, Renderer2 } from '@angular/core';
import { NgClass } from '@angular/common';
import { BaseDirective2, StyleUtils, MediaMarshaller } from '@angular/flex-layout/core';
export declare class ClassDirective extends BaseDirective2 implements DoCheck {
    protected elementRef: ElementRef;
    protected styler: StyleUtils;
    protected marshal: MediaMarshaller;
    protected iterableDiffers: IterableDiffers;
    protected keyValueDiffers: KeyValueDiffers;
    protected renderer: Renderer2;
    protected readonly ngClassInstance: NgClass;
    protected DIRECTIVE_KEY: string;
    /**
     * Capture class assignments so we cache the default classes
     * which are merged with activated styles and used as fallbacks.
     */
    klass: string;
    constructor(elementRef: ElementRef, styler: StyleUtils, marshal: MediaMarshaller, iterableDiffers: IterableDiffers, keyValueDiffers: KeyValueDiffers, renderer: Renderer2, ngClassInstance: NgClass);
    protected updateWithValue(value: any): void;
    /**
     * For ChangeDetectionStrategy.onPush and ngOnChanges() updates
     */
    ngDoCheck(): void;
}
/**
 * Directive to add responsive support for ngClass.
 * This maintains the core functionality of 'ngClass' and adds responsive API
 * Note: this class is a no-op when rendered on the server
 */
export declare class DefaultClassDirective extends ClassDirective {
    protected inputs: string[];
}
