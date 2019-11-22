/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ConstantPool } from '../../constant_pool';
import { AST } from '../../expression_parser/ast';
import * as o from '../../output/output_ast';
import { ParseSourceSpan } from '../../parse_util';
import * as t from '../r3_ast';
import { ValueConverter } from './template';
/**
 * A styling expression summary that is to be processed by the compiler
 */
export interface StylingInstruction {
    sourceSpan: ParseSourceSpan | null;
    reference: o.ExternalReference;
    buildParams(convertFn: (value: any) => o.Expression): o.Expression[];
}
/**
 * An internal record of the input data for a styling binding
 */
interface BoundStylingEntry {
    name: string;
    unit: string | null;
    sourceSpan: ParseSourceSpan;
    value: AST;
}
/**
 * Produces creation/update instructions for all styling bindings (class and style)
 *
 * It also produces the creation instruction to register all initial styling values
 * (which are all the static class="..." and style="..." attribute values that exist
 * on an element within a template).
 *
 * The builder class below handles producing instructions for the following cases:
 *
 * - Static style/class attributes (style="..." and class="...")
 * - Dynamic style/class map bindings ([style]="map" and [class]="map|string")
 * - Dynamic style/class property bindings ([style.prop]="exp" and [class.name]="exp")
 *
 * Due to the complex relationship of all of these cases, the instructions generated
 * for these attributes/properties/bindings must be done so in the correct order. The
 * order which these must be generated is as follows:
 *
 * if (createMode) {
 *   elementStyling(...)
 * }
 * if (updateMode) {
 *   elementStylingMap(...)
 *   elementStyleProp(...)
 *   elementClassProp(...)
 *   elementStylingApp(...)
 * }
 *
 * The creation/update methods within the builder class produce these instructions.
 */
export declare class StylingBuilder {
    private _elementIndexExpr;
    private _directiveExpr;
    /** Whether or not there are any static styling values present */
    private _hasInitialValues;
    /**
     *  Whether or not there are any styling bindings present
     *  (i.e. `[style]`, `[class]`, `[style.prop]` or `[class.name]`)
     */
    private _hasBindings;
    /** the input for [class] (if it exists) */
    private _classMapInput;
    /** the input for [style] (if it exists) */
    private _styleMapInput;
    /** an array of each [style.prop] input */
    private _singleStyleInputs;
    /** an array of each [class.name] input */
    private _singleClassInputs;
    private _lastStylingInput;
    /**
     * Represents the location of each style binding in the template
     * (e.g. `<div [style.width]="w" [style.height]="h">` implies
     * that `width=0` and `height=1`)
     */
    private _stylesIndex;
    /**
     * Represents the location of each class binding in the template
     * (e.g. `<div [class.big]="b" [class.hidden]="h">` implies
     * that `big=0` and `hidden=1`)
     */
    private _classesIndex;
    private _initialStyleValues;
    private _initialClassValues;
    private _useDefaultSanitizer;
    constructor(_elementIndexExpr: o.Expression, _directiveExpr: o.Expression | null);
    hasBindingsOrInitialValues(): boolean;
    /**
     * Registers a given input to the styling builder to be later used when producing AOT code.
     *
     * The code below will only accept the input if it is somehow tied to styling (whether it be
     * style/class bindings or static style/class attributes).
     */
    registerBoundInput(input: t.BoundAttribute): boolean;
    registerStyleInput(propertyName: string | null, value: AST, unit: string | null, sourceSpan: ParseSourceSpan): BoundStylingEntry;
    registerClassInput(className: string | null, value: AST, sourceSpan: ParseSourceSpan): BoundStylingEntry;
    /**
     * Registers the element's static style string value to the builder.
     *
     * @param value the style string (e.g. `width:100px; height:200px;`)
     */
    registerStyleAttr(value: string): void;
    /**
     * Registers the element's static class string value to the builder.
     *
     * @param value the className string (e.g. `disabled gold zoom`)
     */
    registerClassAttr(value: string): void;
    /**
     * Appends all styling-related expressions to the provided attrs array.
     *
     * @param attrs an existing array where each of the styling expressions
     * will be inserted into.
     */
    populateInitialStylingAttrs(attrs: o.Expression[]): void;
    /**
     * Builds an instruction with all the expressions and parameters for `elementHostAttrs`.
     *
     * The instruction generation code below is used for producing the AOT statement code which is
     * responsible for registering initial styles (within a directive hostBindings' creation block)
     * to the directive host element.
     */
    buildDirectiveHostAttrsInstruction(sourceSpan: ParseSourceSpan | null, constantPool: ConstantPool): StylingInstruction | null;
    /**
     * Builds an instruction with all the expressions and parameters for `elementStyling`.
     *
     * The instruction generation code below is used for producing the AOT statement code which is
     * responsible for registering style/class bindings to an element.
     */
    buildElementStylingInstruction(sourceSpan: ParseSourceSpan | null, constantPool: ConstantPool): StylingInstruction | null;
    /**
     * Builds an instruction with all the expressions and parameters for `elementStylingMap`.
     *
     * The instruction data will contain all expressions for `elementStylingMap` to function
     * which include the `[style]` and `[class]` expression params (if they exist) as well as
     * the sanitizer and directive reference expression.
     */
    buildElementStylingMapInstruction(valueConverter: ValueConverter): StylingInstruction | null;
    private _buildSingleInputs;
    private _buildClassInputs;
    private _buildStyleInputs;
    private _buildApplyFn;
    /**
     * Constructs all instructions which contain the expressions that will be placed
     * into the update block of a template function or a directive hostBindings function.
     */
    buildUpdateLevelInstructions(valueConverter: ValueConverter): StylingInstruction[];
}
export {};
