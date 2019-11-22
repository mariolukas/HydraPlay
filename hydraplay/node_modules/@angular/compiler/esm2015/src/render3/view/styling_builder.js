import * as o from '../../output/output_ast';
import { Identifiers as R3 } from '../r3_identifiers';
import { parse as parseStyle } from './style_parser';
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
export class StylingBuilder {
    constructor(_elementIndexExpr, _directiveExpr) {
        this._elementIndexExpr = _elementIndexExpr;
        this._directiveExpr = _directiveExpr;
        /** Whether or not there are any static styling values present */
        this._hasInitialValues = false;
        /**
         *  Whether or not there are any styling bindings present
         *  (i.e. `[style]`, `[class]`, `[style.prop]` or `[class.name]`)
         */
        this._hasBindings = false;
        /** the input for [class] (if it exists) */
        this._classMapInput = null;
        /** the input for [style] (if it exists) */
        this._styleMapInput = null;
        /** an array of each [style.prop] input */
        this._singleStyleInputs = null;
        /** an array of each [class.name] input */
        this._singleClassInputs = null;
        this._lastStylingInput = null;
        // maps are used instead of hash maps because a Map will
        // retain the ordering of the keys
        /**
         * Represents the location of each style binding in the template
         * (e.g. `<div [style.width]="w" [style.height]="h">` implies
         * that `width=0` and `height=1`)
         */
        this._stylesIndex = new Map();
        /**
         * Represents the location of each class binding in the template
         * (e.g. `<div [class.big]="b" [class.hidden]="h">` implies
         * that `big=0` and `hidden=1`)
         */
        this._classesIndex = new Map();
        this._initialStyleValues = [];
        this._initialClassValues = [];
        // certain style properties ALWAYS need sanitization
        // this is checked each time new styles are encountered
        this._useDefaultSanitizer = false;
    }
    hasBindingsOrInitialValues() { return this._hasBindings || this._hasInitialValues; }
    /**
     * Registers a given input to the styling builder to be later used when producing AOT code.
     *
     * The code below will only accept the input if it is somehow tied to styling (whether it be
     * style/class bindings or static style/class attributes).
     */
    registerBoundInput(input) {
        // [attr.style] or [attr.class] are skipped in the code below,
        // they should not be treated as styling-based bindings since
        // they are intended to be written directly to the attr and
        // will therefore skip all style/class resolution that is present
        // with style="", [style]="" and [style.prop]="", class="",
        // [class.prop]="". [class]="" assignments
        const name = input.name;
        let binding = null;
        switch (input.type) {
            case 0 /* Property */:
                if (name == 'style') {
                    binding = this.registerStyleInput(null, input.value, '', input.sourceSpan);
                }
                else if (isClassBinding(input.name)) {
                    binding = this.registerClassInput(null, input.value, input.sourceSpan);
                }
                break;
            case 3 /* Style */:
                binding = this.registerStyleInput(input.name, input.value, input.unit, input.sourceSpan);
                break;
            case 2 /* Class */:
                binding = this.registerClassInput(input.name, input.value, input.sourceSpan);
                break;
        }
        return binding ? true : false;
    }
    registerStyleInput(propertyName, value, unit, sourceSpan) {
        const entry = { name: propertyName, unit, value, sourceSpan };
        if (propertyName) {
            (this._singleStyleInputs = this._singleStyleInputs || []).push(entry);
            this._useDefaultSanitizer = this._useDefaultSanitizer || isStyleSanitizable(propertyName);
            registerIntoMap(this._stylesIndex, propertyName);
        }
        else {
            this._useDefaultSanitizer = true;
            this._styleMapInput = entry;
        }
        this._lastStylingInput = entry;
        this._hasBindings = true;
        return entry;
    }
    registerClassInput(className, value, sourceSpan) {
        const entry = { name: className, value, sourceSpan };
        if (className) {
            (this._singleClassInputs = this._singleClassInputs || []).push(entry);
            registerIntoMap(this._classesIndex, className);
        }
        else {
            this._classMapInput = entry;
        }
        this._lastStylingInput = entry;
        this._hasBindings = true;
        return entry;
    }
    /**
     * Registers the element's static style string value to the builder.
     *
     * @param value the style string (e.g. `width:100px; height:200px;`)
     */
    registerStyleAttr(value) {
        this._initialStyleValues = parseStyle(value);
        this._hasInitialValues = true;
    }
    /**
     * Registers the element's static class string value to the builder.
     *
     * @param value the className string (e.g. `disabled gold zoom`)
     */
    registerClassAttr(value) {
        this._initialClassValues = value.trim().split(/\s+/g);
        this._hasInitialValues = true;
    }
    /**
     * Appends all styling-related expressions to the provided attrs array.
     *
     * @param attrs an existing array where each of the styling expressions
     * will be inserted into.
     */
    populateInitialStylingAttrs(attrs) {
        // [CLASS_MARKER, 'foo', 'bar', 'baz' ...]
        if (this._initialClassValues.length) {
            attrs.push(o.literal(1 /* Classes */));
            for (let i = 0; i < this._initialClassValues.length; i++) {
                attrs.push(o.literal(this._initialClassValues[i]));
            }
        }
        // [STYLE_MARKER, 'width', '200px', 'height', '100px', ...]
        if (this._initialStyleValues.length) {
            attrs.push(o.literal(2 /* Styles */));
            for (let i = 0; i < this._initialStyleValues.length; i += 2) {
                attrs.push(o.literal(this._initialStyleValues[i]), o.literal(this._initialStyleValues[i + 1]));
            }
        }
    }
    /**
     * Builds an instruction with all the expressions and parameters for `elementHostAttrs`.
     *
     * The instruction generation code below is used for producing the AOT statement code which is
     * responsible for registering initial styles (within a directive hostBindings' creation block)
     * to the directive host element.
     */
    buildDirectiveHostAttrsInstruction(sourceSpan, constantPool) {
        if (this._hasInitialValues && this._directiveExpr) {
            return {
                sourceSpan,
                reference: R3.elementHostAttrs,
                buildParams: () => {
                    const attrs = [];
                    this.populateInitialStylingAttrs(attrs);
                    return [this._directiveExpr, getConstantLiteralFromArray(constantPool, attrs)];
                }
            };
        }
        return null;
    }
    /**
     * Builds an instruction with all the expressions and parameters for `elementStyling`.
     *
     * The instruction generation code below is used for producing the AOT statement code which is
     * responsible for registering style/class bindings to an element.
     */
    buildElementStylingInstruction(sourceSpan, constantPool) {
        if (this._hasBindings) {
            return {
                sourceSpan,
                reference: R3.elementStyling,
                buildParams: () => {
                    // a string array of every style-based binding
                    const styleBindingProps = this._singleStyleInputs ? this._singleStyleInputs.map(i => o.literal(i.name)) : [];
                    // a string array of every class-based binding
                    const classBindingNames = this._singleClassInputs ? this._singleClassInputs.map(i => o.literal(i.name)) : [];
                    // to salvage space in the AOT generated code, there is no point in passing
                    // in `null` into a param if any follow-up params are not used. Therefore,
                    // only when a trailing param is used then it will be filled with nulls in between
                    // (otherwise a shorter amount of params will be filled). The code below helps
                    // determine how many params are required in the expression code.
                    //
                    // min params => elementStyling()
                    // max params => elementStyling(classBindings, styleBindings, sanitizer, directive)
                    let expectedNumberOfArgs = 0;
                    if (this._directiveExpr) {
                        expectedNumberOfArgs = 4;
                    }
                    else if (this._useDefaultSanitizer) {
                        expectedNumberOfArgs = 3;
                    }
                    else if (styleBindingProps.length) {
                        expectedNumberOfArgs = 2;
                    }
                    else if (classBindingNames.length) {
                        expectedNumberOfArgs = 1;
                    }
                    const params = [];
                    addParam(params, classBindingNames.length > 0, getConstantLiteralFromArray(constantPool, classBindingNames), 1, expectedNumberOfArgs);
                    addParam(params, styleBindingProps.length > 0, getConstantLiteralFromArray(constantPool, styleBindingProps), 2, expectedNumberOfArgs);
                    addParam(params, this._useDefaultSanitizer, o.importExpr(R3.defaultStyleSanitizer), 3, expectedNumberOfArgs);
                    if (this._directiveExpr) {
                        params.push(this._directiveExpr);
                    }
                    return params;
                }
            };
        }
        return null;
    }
    /**
     * Builds an instruction with all the expressions and parameters for `elementStylingMap`.
     *
     * The instruction data will contain all expressions for `elementStylingMap` to function
     * which include the `[style]` and `[class]` expression params (if they exist) as well as
     * the sanitizer and directive reference expression.
     */
    buildElementStylingMapInstruction(valueConverter) {
        if (this._classMapInput || this._styleMapInput) {
            const stylingInput = this._classMapInput || this._styleMapInput;
            // these values must be outside of the update block so that they can
            // be evaluted (the AST visit call) during creation time so that any
            // pipes can be picked up in time before the template is built
            const mapBasedClassValue = this._classMapInput ? this._classMapInput.value.visit(valueConverter) : null;
            const mapBasedStyleValue = this._styleMapInput ? this._styleMapInput.value.visit(valueConverter) : null;
            return {
                sourceSpan: stylingInput.sourceSpan,
                reference: R3.elementStylingMap,
                buildParams: (convertFn) => {
                    const params = [this._elementIndexExpr];
                    if (mapBasedClassValue) {
                        params.push(convertFn(mapBasedClassValue));
                    }
                    else if (this._styleMapInput) {
                        params.push(o.NULL_EXPR);
                    }
                    if (mapBasedStyleValue) {
                        params.push(convertFn(mapBasedStyleValue));
                    }
                    else if (this._directiveExpr) {
                        params.push(o.NULL_EXPR);
                    }
                    if (this._directiveExpr) {
                        params.push(this._directiveExpr);
                    }
                    return params;
                }
            };
        }
        return null;
    }
    _buildSingleInputs(reference, inputs, mapIndex, allowUnits, valueConverter) {
        return inputs.map(input => {
            const bindingIndex = mapIndex.get(input.name);
            const value = input.value.visit(valueConverter);
            return {
                sourceSpan: input.sourceSpan,
                reference,
                buildParams: (convertFn) => {
                    const params = [this._elementIndexExpr, o.literal(bindingIndex), convertFn(value)];
                    if (allowUnits) {
                        if (input.unit) {
                            params.push(o.literal(input.unit));
                        }
                        else if (this._directiveExpr) {
                            params.push(o.NULL_EXPR);
                        }
                    }
                    if (this._directiveExpr) {
                        params.push(this._directiveExpr);
                    }
                    return params;
                }
            };
        });
    }
    _buildClassInputs(valueConverter) {
        if (this._singleClassInputs) {
            return this._buildSingleInputs(R3.elementClassProp, this._singleClassInputs, this._classesIndex, false, valueConverter);
        }
        return [];
    }
    _buildStyleInputs(valueConverter) {
        if (this._singleStyleInputs) {
            return this._buildSingleInputs(R3.elementStyleProp, this._singleStyleInputs, this._stylesIndex, true, valueConverter);
        }
        return [];
    }
    _buildApplyFn() {
        return {
            sourceSpan: this._lastStylingInput ? this._lastStylingInput.sourceSpan : null,
            reference: R3.elementStylingApply,
            buildParams: () => {
                const params = [this._elementIndexExpr];
                if (this._directiveExpr) {
                    params.push(this._directiveExpr);
                }
                return params;
            }
        };
    }
    /**
     * Constructs all instructions which contain the expressions that will be placed
     * into the update block of a template function or a directive hostBindings function.
     */
    buildUpdateLevelInstructions(valueConverter) {
        const instructions = [];
        if (this._hasBindings) {
            const mapInstruction = this.buildElementStylingMapInstruction(valueConverter);
            if (mapInstruction) {
                instructions.push(mapInstruction);
            }
            instructions.push(...this._buildStyleInputs(valueConverter));
            instructions.push(...this._buildClassInputs(valueConverter));
            instructions.push(this._buildApplyFn());
        }
        return instructions;
    }
}
function isClassBinding(name) {
    return name == 'className' || name == 'class';
}
function registerIntoMap(map, key) {
    if (!map.has(key)) {
        map.set(key, map.size);
    }
}
function isStyleSanitizable(prop) {
    return prop === 'background-image' || prop === 'background' || prop === 'border-image' ||
        prop === 'filter' || prop === 'list-style' || prop === 'list-style-image';
}
/**
 * Simple helper function to either provide the constant literal that will house the value
 * here or a null value if the provided values are empty.
 */
function getConstantLiteralFromArray(constantPool, values) {
    return values.length ? constantPool.getConstLiteral(o.literalArr(values), true) : o.NULL_EXPR;
}
/**
 * Simple helper function that adds a parameter or does nothing at all depending on the provided
 * predicate and totalExpectedArgs values
 */
function addParam(params, predicate, value, argNumber, totalExpectedArgs) {
    if (predicate) {
        params.push(value);
    }
    else if (argNumber < totalExpectedArgs) {
        params.push(o.NULL_EXPR);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3R5bGluZ19idWlsZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3JlbmRlcjMvdmlldy9zdHlsaW5nX2J1aWxkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBVUEsT0FBTyxLQUFLLENBQUMsTUFBTSx5QkFBeUIsQ0FBQztBQUc3QyxPQUFPLEVBQUMsV0FBVyxJQUFJLEVBQUUsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBRXBELE9BQU8sRUFBQyxLQUFLLElBQUksVUFBVSxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUF3Qm5EOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBNEJHO0FBQ0gsTUFBTSxPQUFPLGNBQWM7SUEwQ3pCLFlBQW9CLGlCQUErQixFQUFVLGNBQWlDO1FBQTFFLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBYztRQUFVLG1CQUFjLEdBQWQsY0FBYyxDQUFtQjtRQXpDOUYsaUVBQWlFO1FBQ3pELHNCQUFpQixHQUFHLEtBQUssQ0FBQztRQUNsQzs7O1dBR0c7UUFDSyxpQkFBWSxHQUFHLEtBQUssQ0FBQztRQUU3QiwyQ0FBMkM7UUFDbkMsbUJBQWMsR0FBMkIsSUFBSSxDQUFDO1FBQ3RELDJDQUEyQztRQUNuQyxtQkFBYyxHQUEyQixJQUFJLENBQUM7UUFDdEQsMENBQTBDO1FBQ2xDLHVCQUFrQixHQUE2QixJQUFJLENBQUM7UUFDNUQsMENBQTBDO1FBQ2xDLHVCQUFrQixHQUE2QixJQUFJLENBQUM7UUFDcEQsc0JBQWlCLEdBQTJCLElBQUksQ0FBQztRQUV6RCx3REFBd0Q7UUFDeEQsa0NBQWtDO1FBRWxDOzs7O1dBSUc7UUFDSyxpQkFBWSxHQUFHLElBQUksR0FBRyxFQUFrQixDQUFDO1FBRWpEOzs7O1dBSUc7UUFDSyxrQkFBYSxHQUFHLElBQUksR0FBRyxFQUFrQixDQUFDO1FBQzFDLHdCQUFtQixHQUFhLEVBQUUsQ0FBQztRQUNu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O0lBQzNCLElBQUksU0FBUyxFQUFFO1FBQ2IsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUNwQjtTQUFNLElBQUksU0FBUyxHQUFHLGlCQUFpQixFQUFFO1FBQ3hDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0tBQzFCO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7Q29uc3RhbnRQb29sfSBmcm9tICcuLi8uLi9jb25zdGFudF9wb29sJztcbmltcG9ydCB7QXR0cmlidXRlTWFya2VyfSBmcm9tICcuLi8uLi9jb3JlJztcbmltcG9ydCB7QVNULCBCaW5kaW5nVHlwZX0gZnJvbSAnLi4vLi4vZXhwcmVzc2lvbl9wYXJzZXIvYXN0JztcbmltcG9ydCAqIGFzIG8gZnJvbSAnLi4vLi4vb3V0cHV0L291dHB1dF9hc3QnO1xuaW1wb3J0IHtQYXJzZVNvdXJjZVNwYW59IGZyb20gJy4uLy4uL3BhcnNlX3V0aWwnO1xuaW1wb3J0ICogYXMgdCBmcm9tICcuLi9yM19hc3QnO1xuaW1wb3J0IHtJZGVudGlmaWVycyBhcyBSM30gZnJvbSAnLi4vcjNfaWRlbnRpZmllcnMnO1xuXG5pbXBvcnQge3BhcnNlIGFzIHBhcnNlU3R5bGV9IGZyb20gJy4vc3R5bGVfcGFyc2VyJztcbmltcG9ydCB7VmFsdWVDb252ZXJ0ZXJ9IGZyb20gJy4vdGVtcGxhdGUnO1xuXG5cbi8qKlxuICogQSBzdHlsaW5nIGV4cHJlc3Npb24gc3VtbWFyeSB0aGF0IGlzIHRvIGJlIHByb2Nlc3NlZCBieSB0aGUgY29tcGlsZXJcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTdHlsaW5nSW5zdHJ1Y3Rpb24ge1xuICBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW58bnVsbDtcbiAgcmVmZXJlbmNlOiBvLkV4dGVybmFsUmVmZXJlbmNlO1xuICBidWlsZFBhcmFtcyhjb252ZXJ0Rm46ICh2YWx1ZTogYW55KSA9PiBvLkV4cHJlc3Npb24pOiBvLkV4cHJlc3Npb25bXTtcbn1cblxuLyoqXG4gKiBBbiBpbnRlcm5hbCByZWNvcmQgb2YgdGhlIGlucHV0IGRhdGEgZm9yIGEgc3R5bGluZyBiaW5kaW5nXG4gKi9cbmludGVyZmFjZSBCb3VuZFN0eWxpbmdFbnRyeSB7XG4gIG5hbWU6IHN0cmluZztcbiAgdW5pdDogc3RyaW5nfG51bGw7XG4gIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbjtcbiAgdmFsdWU6IEFTVDtcbn1cblxuXG4vKipcbiAqIFByb2R1Y2VzIGNyZWF0aW9uL3VwZGF0ZSBpbnN0cnVjdGlvbnMgZm9yIGFsbCBzdHlsaW5nIGJpbmRpbmdzIChjbGFzcyBhbmQgc3R5bGUpXG4gKlxuICogSXQgYWxzbyBwcm9kdWNlcyB0aGUgY3JlYXRpb24gaW5zdHJ1Y3Rpb24gdG8gcmVnaXN0ZXIgYWxsIGluaXRpYWwgc3R5bGluZyB2YWx1ZXNcbiAqICh3aGljaCBhcmUgYWxsIHRoZSBzdGF0aWMgY2xhc3M9XCIuLi5cIiBhbmQgc3R5bGU9XCIuLi5cIiBhdHRyaWJ1dGUgdmFsdWVzIHRoYXQgZXhpc3RcbiAqIG9uIGFuIGVsZW1lbnQgd2l0aGluIGEgdGVtcGxhdGUpLlxuICpcbiAqIFRoZSBidWlsZGVyIGNsYXNzIGJlbG93IGhhbmRsZXMgcHJvZHVjaW5nIGluc3RydWN0aW9ucyBmb3IgdGhlIGZvbGxvd2luZyBjYXNlczpcbiAqXG4gKiAtIFN0YXRpYyBzdHlsZS9jbGFzcyBhdHRyaWJ1dGVzIChzdHlsZT1cIi4uLlwiIGFuZCBjbGFzcz1cIi4uLlwiKVxuICogLSBEeW5hbWljIHN0eWxlL2NsYXNzIG1hcCBiaW5kaW5ncyAoW3N0eWxlXT1cIm1hcFwiIGFuZCBbY2xhc3NdPVwibWFwfHN0cmluZ1wiKVxuICogLSBEeW5hbWljIHN0eWxlL2NsYXNzIHByb3BlcnR5IGJpbmRpbmdzIChbc3R5bGUucHJvcF09XCJleHBcIiBhbmQgW2NsYXNzLm5hbWVdPVwiZXhwXCIpXG4gKlxuICogRHVlIHRvIHRoZSBjb21wbGV4IHJlbGF0aW9uc2hpcCBvZiBhbGwgb2YgdGhlc2UgY2FzZXMsIHRoZSBpbnN0cnVjdGlvbnMgZ2VuZXJhdGVkXG4gKiBmb3IgdGhlc2UgYXR0cmlidXRlcy9wcm9wZXJ0aWVzL2JpbmRpbmdzIG11c3QgYmUgZG9uZSBzbyBpbiB0aGUgY29ycmVjdCBvcmRlci4gVGhlXG4gKiBvcmRlciB3aGljaCB0aGVzZSBtdXN0IGJlIGdlbmVyYXRlZCBpcyBhcyBmb2xsb3dzOlxuICpcbiAqIGlmIChjcmVhdGVNb2RlKSB7XG4gKiAgIGVsZW1lbnRTdHlsaW5nKC4uLilcbiAqIH1cbiAqIGlmICh1cGRhdGVNb2RlKSB7XG4gKiAgIGVsZW1lbnRTdHlsaW5nTWFwKC4uLilcbiAqICAgZWxlbWVudFN0eWxlUHJvcCguLi4pXG4gKiAgIGVsZW1lbnRDbGFzc1Byb3AoLi4uKVxuICogICBlbGVtZW50U3R5bGluZ0FwcCguLi4pXG4gKiB9XG4gKlxuICogVGhlIGNyZWF0aW9uL3VwZGF0ZSBtZXRob2RzIHdpdGhpbiB0aGUgYnVpbGRlciBjbGFzcyBwcm9kdWNlIHRoZXNlIGluc3RydWN0aW9ucy5cbiAqL1xuZXhwb3J0IGNsYXNzIFN0eWxpbmdCdWlsZGVyIHtcbiAgLyoqIFdoZXRoZXIgb3Igbm90IHRoZXJlIGFyZSBhbnkgc3RhdGljIHN0eWxpbmcgdmFsdWVzIHByZXNlbnQgKi9cbiAgcHJpdmF0ZSBfaGFzSW5pdGlhbFZhbHVlcyA9IGZhbHNlO1xuICAvKipcbiAgICogIFdoZXRoZXIgb3Igbm90IHRoZXJlIGFyZSBhbnkgc3R5bGluZyBiaW5kaW5ncyBwcmVzZW50XG4gICAqICAoaS5lLiBgW3N0eWxlXWAsIGBbY2xhc3NdYCwgYFtzdHlsZS5wcm9wXWAgb3IgYFtjbGFzcy5uYW1lXWApXG4gICAqL1xuICBwcml2YXRlIF9oYXNCaW5kaW5ncyA9IGZhbHNlO1xuXG4gIC8qKiB0aGUgaW5wdXQgZm9yIFtjbGFzc10gKGlmIGl0IGV4aXN0cykgKi9cbiAgcHJpdmF0ZSBfY2xhc3NNYXBJbnB1dDogQm91bmRTdHlsaW5nRW50cnl8bnVsbCA9IG51bGw7XG4gIC8qKiB0aGUgaW5wdXQgZm9yIFtzdHlsZV0gKGlmIGl0IGV4aXN0cykgKi9cbiAgcHJpdmF0ZSBfc3R5bGVNYXBJbnB1dDogQm91bmRTdHlsaW5nRW50cnl8bnVsbCA9IG51bGw7XG4gIC8qKiBhbiBhcnJheSBvZiBlYWNoIFtzdHlsZS5wcm9wXSBpbnB1dCAqL1xuICBwcml2YXRlIF9zaW5nbGVTdHlsZUlucHV0czogQm91bmRTdHlsaW5nRW50cnlbXXxudWxsID0gbnVsbDtcbiAgLyoqIGFuIGFycmF5IG9mIGVhY2ggW2NsYXNzLm5hbWVdIGlucHV0ICovXG4gIHByaXZhdGUgX3NpbmdsZUNsYXNzSW5wdXRzOiBCb3VuZFN0eWxpbmdFbnRyeVtdfG51bGwgPSBudWxsO1xuICBwcml2YXRlIF9sYXN0U3R5bGluZ0lucHV0OiBCb3VuZFN0eWxpbmdFbnRyeXxudWxsID0gbnVsbDtcblxuICAvLyBtYXBzIGFyZSB1c2VkIGluc3RlYWQgb2YgaGFzaCBtYXBzIGJlY2F1c2UgYSBNYXAgd2lsbFxuICAvLyByZXRhaW4gdGhlIG9yZGVyaW5nIG9mIHRoZSBrZXlzXG5cbiAgLyoqXG4gICAqIFJlcHJlc2VudHMgdGhlIGxvY2F0aW9uIG9mIGVhY2ggc3R5bGUgYmluZGluZyBpbiB0aGUgdGVtcGxhdGVcbiAgICogKGUuZy4gYDxkaXYgW3N0eWxlLndpZHRoXT1cIndcIiBbc3R5bGUuaGVpZ2h0XT1cImhcIj5gIGltcGxpZXNcbiAgICogdGhhdCBgd2lkdGg9MGAgYW5kIGBoZWlnaHQ9MWApXG4gICAqL1xuICBwcml2YXRlIF9zdHlsZXNJbmRleCA9IG5ldyBNYXA8c3RyaW5nLCBudW1iZXI+KCk7XG5cbiAgLyoqXG4gICAqIFJlcHJlc2VudHMgdGhlIGxvY2F0aW9uIG9mIGVhY2ggY2xhc3MgYmluZGluZyBpbiB0aGUgdGVtcGxhdGVcbiAgICogKGUuZy4gYDxkaXYgW2NsYXNzLmJpZ109XCJiXCIgW2NsYXNzLmhpZGRlbl09XCJoXCI+YCBpbXBsaWVzXG4gICAqIHRoYXQgYGJpZz0wYCBhbmQgYGhpZGRlbj0xYClcbiAgICovXG4gIHByaXZhdGUgX2NsYXNzZXNJbmRleCA9IG5ldyBNYXA8c3RyaW5nLCBudW1iZXI+KCk7XG4gIHByaXZhdGUgX2luaXRpYWxTdHlsZVZhbHVlczogc3RyaW5nW10gPSBbXTtcbiAgcHJpdmF0ZSBfaW5pdGlhbENsYXNzVmFsdWVzOiBzdHJpbmdbXSA9IFtdO1xuXG4gIC8vIGNlcnRhaW4gc3R5bGUgcHJvcGVydGllcyBBTFdBWVMgbmVlZCBzYW5pdGl6YXRpb25cbiAgLy8gdGhpcyBpcyBjaGVja2VkIGVhY2ggdGltZSBuZXcgc3R5bGVzIGFyZSBlbmNvdW50ZXJlZFxuICBwcml2YXRlIF91c2VEZWZhdWx0U2FuaXRpemVyID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfZWxlbWVudEluZGV4RXhwcjogby5FeHByZXNzaW9uLCBwcml2YXRlIF9kaXJlY3RpdmVFeHByOiBvLkV4cHJlc3Npb258bnVsbCkge31cblxuICBoYXNCaW5kaW5nc09ySW5pdGlhbFZhbHVlcygpIHsgcmV0dXJuIHRoaXMuX2hhc0JpbmRpbmdzIHx8IHRoaXMuX2hhc0luaXRpYWxWYWx1ZXM7IH1cblxuICAvKipcbiAgICogUmVnaXN0ZXJzIGEgZ2l2ZW4gaW5wdXQgdG8gdGhlIHN0eWxpbmcgYnVpbGRlciB0byBiZSBsYXRlciB1c2VkIHdoZW4gcHJvZHVjaW5nIEFPVCBjb2RlLlxuICAgKlxuICAgKiBUaGUgY29kZSBiZWxvdyB3aWxsIG9ubHkgYWNjZXB0IHRoZSBpbnB1dCBpZiBpdCBpcyBzb21laG93IHRpZWQgdG8gc3R5bGluZyAod2hldGhlciBpdCBiZVxuICAgKiBzdHlsZS9jbGFzcyBiaW5kaW5ncyBvciBzdGF0aWMgc3R5bGUvY2xhc3MgYXR0cmlidXRlcykuXG4gICAqL1xuICByZWdpc3RlckJvdW5kSW5wdXQoaW5wdXQ6IHQuQm91bmRBdHRyaWJ1dGUpOiBib29sZWFuIHtcbiAgICAvLyBbYXR0ci5zdHlsZV0gb3IgW2F0dHIuY2xhc3NdIGFyZSBza2lwcGVkIGluIHRoZSBjb2RlIGJlbG93LFxuICAgIC8vIHRoZXkgc2hvdWxkIG5vdCBiZSB0cmVhdGVkIGFzIHN0eWxpbmctYmFzZWQgYmluZGluZ3Mgc2luY2VcbiAgICAvLyB0aGV5IGFyZSBpbnRlbmRlZCB0byBiZSB3cml0dGVuIGRpcmVjdGx5IHRvIHRoZSBhdHRyIGFuZFxuICAgIC8vIHdpbGwgdGhlcmVmb3JlIHNraXAgYWxsIHN0eWxlL2NsYXNzIHJlc29sdXRpb24gdGhhdCBpcyBwcmVzZW50XG4gICAgLy8gd2l0aCBzdHlsZT1cIlwiLCBbc3R5bGVdPVwiXCIgYW5kIFtzdHlsZS5wcm9wXT1cIlwiLCBjbGFzcz1cIlwiLFxuICAgIC8vIFtjbGFzcy5wcm9wXT1cIlwiLiBbY2xhc3NdPVwiXCIgYXNzaWdubWVudHNcbiAgICBjb25zdCBuYW1lID0gaW5wdXQubmFtZTtcbiAgICBsZXQgYmluZGluZzogQm91bmRTdHlsaW5nRW50cnl8bnVsbCA9IG51bGw7XG4gICAgc3dpdGNoIChpbnB1dC50eXBlKSB7XG4gICAgICBjYXNlIEJpbmRpbmdUeXBlLlByb3BlcnR5OlxuICAgICAgICBpZiAobmFtZSA9PSAnc3R5bGUnKSB7XG4gICAgICAgICAgYmluZGluZyA9IHRoaXMucmVnaXN0ZXJTdHlsZUlucHV0KG51bGwsIGlucHV0LnZhbHVlLCAnJywgaW5wdXQuc291cmNlU3Bhbik7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNDbGFzc0JpbmRpbmcoaW5wdXQubmFtZSkpIHtcbiAgICAgICAgICBiaW5kaW5nID0gdGhpcy5yZWdpc3RlckNsYXNzSW5wdXQobnVsbCwgaW5wdXQudmFsdWUsIGlucHV0LnNvdXJjZVNwYW4pO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBCaW5kaW5nVHlwZS5TdHlsZTpcbiAgICAgICAgYmluZGluZyA9IHRoaXMucmVnaXN0ZXJTdHlsZUlucHV0KGlucHV0Lm5hbWUsIGlucHV0LnZhbHVlLCBpbnB1dC51bml0LCBpbnB1dC5zb3VyY2VTcGFuKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEJpbmRpbmdUeXBlLkNsYXNzOlxuICAgICAgICBiaW5kaW5nID0gdGhpcy5yZWdpc3RlckNsYXNzSW5wdXQoaW5wdXQubmFtZSwgaW5wdXQudmFsdWUsIGlucHV0LnNvdXJjZVNwYW4pO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgcmV0dXJuIGJpbmRpbmcgPyB0cnVlIDogZmFsc2U7XG4gIH1cblxuICByZWdpc3RlclN0eWxlSW5wdXQoXG4gICAgICBwcm9wZXJ0eU5hbWU6IHN0cmluZ3xudWxsLCB2YWx1ZTogQVNULCB1bml0OiBzdHJpbmd8bnVsbCxcbiAgICAgIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3Bhbik6IEJvdW5kU3R5bGluZ0VudHJ5IHtcbiAgICBjb25zdCBlbnRyeSA9IHsgbmFtZTogcHJvcGVydHlOYW1lLCB1bml0LCB2YWx1ZSwgc291cmNlU3BhbiB9IGFzIEJvdW5kU3R5bGluZ0VudHJ5O1xuICAgIGlmIChwcm9wZXJ0eU5hbWUpIHtcbiAgICAgICh0aGlzLl9zaW5nbGVTdHlsZUlucHV0cyA9IHRoaXMuX3NpbmdsZVN0eWxlSW5wdXRzIHx8IFtdKS5wdXNoKGVudHJ5KTtcbiAgICAgIHRoaXMuX3VzZURlZmF1bHRTYW5pdGl6ZXIgPSB0aGlzLl91c2VEZWZhdWx0U2FuaXRpemVyIHx8IGlzU3R5bGVTYW5pdGl6YWJsZShwcm9wZXJ0eU5hbWUpO1xuICAgICAgcmVnaXN0ZXJJbnRvTWFwKHRoaXMuX3N0eWxlc0luZGV4LCBwcm9wZXJ0eU5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl91c2VEZWZhdWx0U2FuaXRpemVyID0gdHJ1ZTtcbiAgICAgIHRoaXMuX3N0eWxlTWFwSW5wdXQgPSBlbnRyeTtcbiAgICB9XG4gICAgdGhpcy5fbGFzdFN0eWxpbmdJbnB1dCA9IGVudHJ5O1xuICAgIHRoaXMuX2hhc0JpbmRpbmdzID0gdHJ1ZTtcbiAgICByZXR1cm4gZW50cnk7XG4gIH1cblxuICByZWdpc3RlckNsYXNzSW5wdXQoY2xhc3NOYW1lOiBzdHJpbmd8bnVsbCwgdmFsdWU6IEFTVCwgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuKTpcbiAgICAgIEJvdW5kU3R5bGluZ0VudHJ5IHtcbiAgICBjb25zdCBlbnRyeSA9IHsgbmFtZTogY2xhc3NOYW1lLCB2YWx1ZSwgc291cmNlU3BhbiB9IGFzIEJvdW5kU3R5bGluZ0VudHJ5O1xuICAgIGlmIChjbGFzc05hbWUpIHtcbiAgICAgICh0aGlzLl9zaW5nbGVDbGFzc0lucHV0cyA9IHRoaXMuX3NpbmdsZUNsYXNzSW5wdXRzIHx8IFtdKS5wdXNoKGVudHJ5KTtcbiAgICAgIHJlZ2lzdGVySW50b01hcCh0aGlzLl9jbGFzc2VzSW5kZXgsIGNsYXNzTmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2NsYXNzTWFwSW5wdXQgPSBlbnRyeTtcbiAgICB9XG4gICAgdGhpcy5fbGFzdFN0eWxpbmdJbnB1dCA9IGVudHJ5O1xuICAgIHRoaXMuX2hhc0JpbmRpbmdzID0gdHJ1ZTtcbiAgICByZXR1cm4gZW50cnk7XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXJzIHRoZSBlbGVtZW50J3Mgc3RhdGljIHN0eWxlIHN0cmluZyB2YWx1ZSB0byB0aGUgYnVpbGRlci5cbiAgICpcbiAgICogQHBhcmFtIHZhbHVlIHRoZSBzdHlsZSBzdHJpbmcgKGUuZy4gYHdpZHRoOjEwMHB4OyBoZWlnaHQ6MjAwcHg7YClcbiAgICovXG4gIHJlZ2lzdGVyU3R5bGVBdHRyKHZhbHVlOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9pbml0aWFsU3R5bGVWYWx1ZXMgPSBwYXJzZVN0eWxlKHZhbHVlKTtcbiAgICB0aGlzLl9oYXNJbml0aWFsVmFsdWVzID0gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgdGhlIGVsZW1lbnQncyBzdGF0aWMgY2xhc3Mgc3RyaW5nIHZhbHVlIHRvIHRoZSBidWlsZGVyLlxuICAgKlxuICAgKiBAcGFyYW0gdmFsdWUgdGhlIGNsYXNzTmFtZSBzdHJpbmcgKGUuZy4gYGRpc2FibGVkIGdvbGQgem9vbWApXG4gICAqL1xuICByZWdpc3RlckNsYXNzQXR0cih2YWx1ZTogc3RyaW5nKSB7XG4gICAgdGhpcy5faW5pdGlhbENsYXNzVmFsdWVzID0gdmFsdWUudHJpbSgpLnNwbGl0KC9cXHMrL2cpO1xuICAgIHRoaXMuX2hhc0luaXRpYWxWYWx1ZXMgPSB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIEFwcGVuZHMgYWxsIHN0eWxpbmctcmVsYXRlZCBleHByZXNzaW9ucyB0byB0aGUgcHJvdmlkZWQgYXR0cnMgYXJyYXkuXG4gICAqXG4gICAqIEBwYXJhbSBhdHRycyBhbiBleGlzdGluZyBhcnJheSB3aGVyZSBlYWNoIG9mIHRoZSBzdHlsaW5nIGV4cHJlc3Npb25zXG4gICAqIHdpbGwgYmUgaW5zZXJ0ZWQgaW50by5cbiAgICovXG4gIHBvcHVsYXRlSW5pdGlhbFN0eWxpbmdBdHRycyhhdHRyczogby5FeHByZXNzaW9uW10pOiB2b2lkIHtcbiAgICAvLyBbQ0xBU1NfTUFSS0VSLCAnZm9vJywgJ2JhcicsICdiYXonIC4uLl1cbiAgICBpZiAodGhpcy5faW5pdGlhbENsYXNzVmFsdWVzLmxlbmd0aCkge1xuICAgICAgYXR0cnMucHVzaChvLmxpdGVyYWwoQXR0cmlidXRlTWFya2VyLkNsYXNzZXMpKTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5faW5pdGlhbENsYXNzVmFsdWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGF0dHJzLnB1c2goby5saXRlcmFsKHRoaXMuX2luaXRpYWxDbGFzc1ZhbHVlc1tpXSkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFtTVFlMRV9NQVJLRVIsICd3aWR0aCcsICcyMDBweCcsICdoZWlnaHQnLCAnMTAwcHgnLCAuLi5dXG4gICAgaWYgKHRoaXMuX2luaXRpYWxTdHlsZVZhbHVlcy5sZW5ndGgpIHtcbiAgICAgIGF0dHJzLnB1c2goby5saXRlcmFsKEF0dHJpYnV0ZU1hcmtlci5TdHlsZXMpKTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5faW5pdGlhbFN0eWxlVmFsdWVzLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgICAgIGF0dHJzLnB1c2goXG4gICAgICAgICAgICBvLmxpdGVyYWwodGhpcy5faW5pdGlhbFN0eWxlVmFsdWVzW2ldKSwgby5saXRlcmFsKHRoaXMuX2luaXRpYWxTdHlsZVZhbHVlc1tpICsgMV0pKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQnVpbGRzIGFuIGluc3RydWN0aW9uIHdpdGggYWxsIHRoZSBleHByZXNzaW9ucyBhbmQgcGFyYW1ldGVycyBmb3IgYGVsZW1lbnRIb3N0QXR0cnNgLlxuICAgKlxuICAgKiBUaGUgaW5zdHJ1Y3Rpb24gZ2VuZXJhdGlvbiBjb2RlIGJlbG93IGlzIHVzZWQgZm9yIHByb2R1Y2luZyB0aGUgQU9UIHN0YXRlbWVudCBjb2RlIHdoaWNoIGlzXG4gICAqIHJlc3BvbnNpYmxlIGZvciByZWdpc3RlcmluZyBpbml0aWFsIHN0eWxlcyAod2l0aGluIGEgZGlyZWN0aXZlIGhvc3RCaW5kaW5ncycgY3JlYXRpb24gYmxvY2spXG4gICAqIHRvIHRoZSBkaXJlY3RpdmUgaG9zdCBlbGVtZW50LlxuICAgKi9cbiAgYnVpbGREaXJlY3RpdmVIb3N0QXR0cnNJbnN0cnVjdGlvbihzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW58bnVsbCwgY29uc3RhbnRQb29sOiBDb25zdGFudFBvb2wpOlxuICAgICAgU3R5bGluZ0luc3RydWN0aW9ufG51bGwge1xuICAgIGlmICh0aGlzLl9oYXNJbml0aWFsVmFsdWVzICYmIHRoaXMuX2RpcmVjdGl2ZUV4cHIpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHNvdXJjZVNwYW4sXG4gICAgICAgIHJlZmVyZW5jZTogUjMuZWxlbWVudEhvc3RBdHRycyxcbiAgICAgICAgYnVpbGRQYXJhbXM6ICgpID0+IHtcbiAgICAgICAgICBjb25zdCBhdHRyczogby5FeHByZXNzaW9uW10gPSBbXTtcbiAgICAgICAgICB0aGlzLnBvcHVsYXRlSW5pdGlhbFN0eWxpbmdBdHRycyhhdHRycyk7XG4gICAgICAgICAgcmV0dXJuIFt0aGlzLl9kaXJlY3RpdmVFeHByICEsIGdldENvbnN0YW50TGl0ZXJhbEZyb21BcnJheShjb25zdGFudFBvb2wsIGF0dHJzKV07XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEJ1aWxkcyBhbiBpbnN0cnVjdGlvbiB3aXRoIGFsbCB0aGUgZXhwcmVzc2lvbnMgYW5kIHBhcmFtZXRlcnMgZm9yIGBlbGVtZW50U3R5bGluZ2AuXG4gICAqXG4gICAqIFRoZSBpbnN0cnVjdGlvbiBnZW5lcmF0aW9uIGNvZGUgYmVsb3cgaXMgdXNlZCBmb3IgcHJvZHVjaW5nIHRoZSBBT1Qgc3RhdGVtZW50IGNvZGUgd2hpY2ggaXNcbiAgICogcmVzcG9uc2libGUgZm9yIHJlZ2lzdGVyaW5nIHN0eWxlL2NsYXNzIGJpbmRpbmdzIHRvIGFuIGVsZW1lbnQuXG4gICAqL1xuICBidWlsZEVsZW1lbnRTdHlsaW5nSW5zdHJ1Y3Rpb24oc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFufG51bGwsIGNvbnN0YW50UG9vbDogQ29uc3RhbnRQb29sKTpcbiAgICAgIFN0eWxpbmdJbnN0cnVjdGlvbnxudWxsIHtcbiAgICBpZiAodGhpcy5faGFzQmluZGluZ3MpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHNvdXJjZVNwYW4sXG4gICAgICAgIHJlZmVyZW5jZTogUjMuZWxlbWVudFN0eWxpbmcsXG4gICAgICAgIGJ1aWxkUGFyYW1zOiAoKSA9PiB7XG4gICAgICAgICAgLy8gYSBzdHJpbmcgYXJyYXkgb2YgZXZlcnkgc3R5bGUtYmFzZWQgYmluZGluZ1xuICAgICAgICAgIGNvbnN0IHN0eWxlQmluZGluZ1Byb3BzID1cbiAgICAgICAgICAgICAgdGhpcy5fc2luZ2xlU3R5bGVJbnB1dHMgPyB0aGlzLl9zaW5nbGVTdHlsZUlucHV0cy5tYXAoaSA9PiBvLmxpdGVyYWwoaS5uYW1lKSkgOiBbXTtcbiAgICAgICAgICAvLyBhIHN0cmluZyBhcnJheSBvZiBldmVyeSBjbGFzcy1iYXNlZCBiaW5kaW5nXG4gICAgICAgICAgY29uc3QgY2xhc3NCaW5kaW5nTmFtZXMgPVxuICAgICAgICAgICAgICB0aGlzLl9zaW5nbGVDbGFzc0lucHV0cyA/IHRoaXMuX3NpbmdsZUNsYXNzSW5wdXRzLm1hcChpID0+IG8ubGl0ZXJhbChpLm5hbWUpKSA6IFtdO1xuXG4gICAgICAgICAgLy8gdG8gc2FsdmFnZSBzcGFjZSBpbiB0aGUgQU9UIGdlbmVyYXRlZCBjb2RlLCB0aGVyZSBpcyBubyBwb2ludCBpbiBwYXNzaW5nXG4gICAgICAgICAgLy8gaW4gYG51bGxgIGludG8gYSBwYXJhbSBpZiBhbnkgZm9sbG93LXVwIHBhcmFtcyBhcmUgbm90IHVzZWQuIFRoZXJlZm9yZSxcbiAgICAgICAgICAvLyBvbmx5IHdoZW4gYSB0cmFpbGluZyBwYXJhbSBpcyB1c2VkIHRoZW4gaXQgd2lsbCBiZSBmaWxsZWQgd2l0aCBudWxscyBpbiBiZXR3ZWVuXG4gICAgICAgICAgLy8gKG90aGVyd2lzZSBhIHNob3J0ZXIgYW1vdW50IG9mIHBhcmFtcyB3aWxsIGJlIGZpbGxlZCkuIFRoZSBjb2RlIGJlbG93IGhlbHBzXG4gICAgICAgICAgLy8gZGV0ZXJtaW5lIGhvdyBtYW55IHBhcmFtcyBhcmUgcmVxdWlyZWQgaW4gdGhlIGV4cHJlc3Npb24gY29kZS5cbiAgICAgICAgICAvL1xuICAgICAgICAgIC8vIG1pbiBwYXJhbXMgPT4gZWxlbWVudFN0eWxpbmcoKVxuICAgICAgICAgIC8vIG1heCBwYXJhbXMgPT4gZWxlbWVudFN0eWxpbmcoY2xhc3NCaW5kaW5ncywgc3R5bGVCaW5kaW5ncywgc2FuaXRpemVyLCBkaXJlY3RpdmUpXG4gICAgICAgICAgbGV0IGV4cGVjdGVkTnVtYmVyT2ZBcmdzID0gMDtcbiAgICAgICAgICBpZiAodGhpcy5fZGlyZWN0aXZlRXhwcikge1xuICAgICAgICAgICAgZXhwZWN0ZWROdW1iZXJPZkFyZ3MgPSA0O1xuICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5fdXNlRGVmYXVsdFNhbml0aXplcikge1xuICAgICAgICAgICAgZXhwZWN0ZWROdW1iZXJPZkFyZ3MgPSAzO1xuICAgICAgICAgIH0gZWxzZSBpZiAoc3R5bGVCaW5kaW5nUHJvcHMubGVuZ3RoKSB7XG4gICAgICAgICAgICBleHBlY3RlZE51bWJlck9mQXJncyA9IDI7XG4gICAgICAgICAgfSBlbHNlIGlmIChjbGFzc0JpbmRpbmdOYW1lcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGV4cGVjdGVkTnVtYmVyT2ZBcmdzID0gMTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCBwYXJhbXM6IG8uRXhwcmVzc2lvbltdID0gW107XG4gICAgICAgICAgYWRkUGFyYW0oXG4gICAgICAgICAgICAgIHBhcmFtcywgY2xhc3NCaW5kaW5nTmFtZXMubGVuZ3RoID4gMCxcbiAgICAgICAgICAgICAgZ2V0Q29uc3RhbnRMaXRlcmFsRnJvbUFycmF5KGNvbnN0YW50UG9vbCwgY2xhc3NCaW5kaW5nTmFtZXMpLCAxLFxuICAgICAgICAgICAgICBleHBlY3RlZE51bWJlck9mQXJncyk7XG4gICAgICAgICAgYWRkUGFyYW0oXG4gICAgICAgICAgICAgIHBhcmFtcywgc3R5bGVCaW5kaW5nUHJvcHMubGVuZ3RoID4gMCxcbiAgICAgICAgICAgICAgZ2V0Q29uc3RhbnRMaXRlcmFsRnJvbUFycmF5KGNvbnN0YW50UG9vbCwgc3R5bGVCaW5kaW5nUHJvcHMpLCAyLFxuICAgICAgICAgICAgICBleHBlY3RlZE51bWJlck9mQXJncyk7XG4gICAgICAgICAgYWRkUGFyYW0oXG4gICAgICAgICAgICAgIHBhcmFtcywgdGhpcy5fdXNlRGVmYXVsdFNhbml0aXplciwgby5pbXBvcnRFeHByKFIzLmRlZmF1bHRTdHlsZVNhbml0aXplciksIDMsXG4gICAgICAgICAgICAgIGV4cGVjdGVkTnVtYmVyT2ZBcmdzKTtcbiAgICAgICAgICBpZiAodGhpcy5fZGlyZWN0aXZlRXhwcikge1xuICAgICAgICAgICAgcGFyYW1zLnB1c2godGhpcy5fZGlyZWN0aXZlRXhwcik7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBwYXJhbXM7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEJ1aWxkcyBhbiBpbnN0cnVjdGlvbiB3aXRoIGFsbCB0aGUgZXhwcmVzc2lvbnMgYW5kIHBhcmFtZXRlcnMgZm9yIGBlbGVtZW50U3R5bGluZ01hcGAuXG4gICAqXG4gICAqIFRoZSBpbnN0cnVjdGlvbiBkYXRhIHdpbGwgY29udGFpbiBhbGwgZXhwcmVzc2lvbnMgZm9yIGBlbGVtZW50U3R5bGluZ01hcGAgdG8gZnVuY3Rpb25cbiAgICogd2hpY2ggaW5jbHVkZSB0aGUgYFtzdHlsZV1gIGFuZCBgW2NsYXNzXWAgZXhwcmVzc2lvbiBwYXJhbXMgKGlmIHRoZXkgZXhpc3QpIGFzIHdlbGwgYXNcbiAgICogdGhlIHNhbml0aXplciBhbmQgZGlyZWN0aXZlIHJlZmVyZW5jZSBleHByZXNzaW9uLlxuICAgKi9cbiAgYnVpbGRFbGVtZW50U3R5bGluZ01hcEluc3RydWN0aW9uKHZhbHVlQ29udmVydGVyOiBWYWx1ZUNvbnZlcnRlcik6IFN0eWxpbmdJbnN0cnVjdGlvbnxudWxsIHtcbiAgICBpZiAodGhpcy5fY2xhc3NNYXBJbnB1dCB8fCB0aGlzLl9zdHlsZU1hcElucHV0KSB7XG4gICAgICBjb25zdCBzdHlsaW5nSW5wdXQgPSB0aGlzLl9jbGFzc01hcElucHV0ICEgfHwgdGhpcy5fc3R5bGVNYXBJbnB1dCAhO1xuXG4gICAgICAvLyB0aGVzZSB2YWx1ZXMgbXVzdCBiZSBvdXRzaWRlIG9mIHRoZSB1cGRhdGUgYmxvY2sgc28gdGhhdCB0aGV5IGNhblxuICAgICAgLy8gYmUgZXZhbHV0ZWQgKHRoZSBBU1QgdmlzaXQgY2FsbCkgZHVyaW5nIGNyZWF0aW9uIHRpbWUgc28gdGhhdCBhbnlcbiAgICAgIC8vIHBpcGVzIGNhbiBiZSBwaWNrZWQgdXAgaW4gdGltZSBiZWZvcmUgdGhlIHRlbXBsYXRlIGlzIGJ1aWx0XG4gICAgICBjb25zdCBtYXBCYXNlZENsYXNzVmFsdWUgPVxuICAgICAgICAgIHRoaXMuX2NsYXNzTWFwSW5wdXQgPyB0aGlzLl9jbGFzc01hcElucHV0LnZhbHVlLnZpc2l0KHZhbHVlQ29udmVydGVyKSA6IG51bGw7XG4gICAgICBjb25zdCBtYXBCYXNlZFN0eWxlVmFsdWUgPVxuICAgICAgICAgIHRoaXMuX3N0eWxlTWFwSW5wdXQgPyB0aGlzLl9zdHlsZU1hcElucHV0LnZhbHVlLnZpc2l0KHZhbHVlQ29udmVydGVyKSA6IG51bGw7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHNvdXJjZVNwYW46IHN0eWxpbmdJbnB1dC5zb3VyY2VTcGFuLFxuICAgICAgICByZWZlcmVuY2U6IFIzLmVsZW1lbnRTdHlsaW5nTWFwLFxuICAgICAgICBidWlsZFBhcmFtczogKGNvbnZlcnRGbjogKHZhbHVlOiBhbnkpID0+IG8uRXhwcmVzc2lvbikgPT4ge1xuICAgICAgICAgIGNvbnN0IHBhcmFtczogby5FeHByZXNzaW9uW10gPSBbdGhpcy5fZWxlbWVudEluZGV4RXhwcl07XG5cbiAgICAgICAgICBpZiAobWFwQmFzZWRDbGFzc1ZhbHVlKSB7XG4gICAgICAgICAgICBwYXJhbXMucHVzaChjb252ZXJ0Rm4obWFwQmFzZWRDbGFzc1ZhbHVlKSk7XG4gICAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9zdHlsZU1hcElucHV0KSB7XG4gICAgICAgICAgICBwYXJhbXMucHVzaChvLk5VTExfRVhQUik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKG1hcEJhc2VkU3R5bGVWYWx1ZSkge1xuICAgICAgICAgICAgcGFyYW1zLnB1c2goY29udmVydEZuKG1hcEJhc2VkU3R5bGVWYWx1ZSkpO1xuICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5fZGlyZWN0aXZlRXhwcikge1xuICAgICAgICAgICAgcGFyYW1zLnB1c2goby5OVUxMX0VYUFIpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh0aGlzLl9kaXJlY3RpdmVFeHByKSB7XG4gICAgICAgICAgICBwYXJhbXMucHVzaCh0aGlzLl9kaXJlY3RpdmVFeHByKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gcGFyYW1zO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHByaXZhdGUgX2J1aWxkU2luZ2xlSW5wdXRzKFxuICAgICAgcmVmZXJlbmNlOiBvLkV4dGVybmFsUmVmZXJlbmNlLCBpbnB1dHM6IEJvdW5kU3R5bGluZ0VudHJ5W10sIG1hcEluZGV4OiBNYXA8c3RyaW5nLCBudW1iZXI+LFxuICAgICAgYWxsb3dVbml0czogYm9vbGVhbiwgdmFsdWVDb252ZXJ0ZXI6IFZhbHVlQ29udmVydGVyKTogU3R5bGluZ0luc3RydWN0aW9uW10ge1xuICAgIHJldHVybiBpbnB1dHMubWFwKGlucHV0ID0+IHtcbiAgICAgIGNvbnN0IGJpbmRpbmdJbmRleDogbnVtYmVyID0gbWFwSW5kZXguZ2V0KGlucHV0Lm5hbWUpICE7XG4gICAgICBjb25zdCB2YWx1ZSA9IGlucHV0LnZhbHVlLnZpc2l0KHZhbHVlQ29udmVydGVyKTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHNvdXJjZVNwYW46IGlucHV0LnNvdXJjZVNwYW4sXG4gICAgICAgIHJlZmVyZW5jZSxcbiAgICAgICAgYnVpbGRQYXJhbXM6IChjb252ZXJ0Rm46ICh2YWx1ZTogYW55KSA9PiBvLkV4cHJlc3Npb24pID0+IHtcbiAgICAgICAgICBjb25zdCBwYXJhbXMgPSBbdGhpcy5fZWxlbWVudEluZGV4RXhwciwgby5saXRlcmFsKGJpbmRpbmdJbmRleCksIGNvbnZlcnRGbih2YWx1ZSldO1xuICAgICAgICAgIGlmIChhbGxvd1VuaXRzKSB7XG4gICAgICAgICAgICBpZiAoaW5wdXQudW5pdCkge1xuICAgICAgICAgICAgICBwYXJhbXMucHVzaChvLmxpdGVyYWwoaW5wdXQudW5pdCkpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9kaXJlY3RpdmVFeHByKSB7XG4gICAgICAgICAgICAgIHBhcmFtcy5wdXNoKG8uTlVMTF9FWFBSKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAodGhpcy5fZGlyZWN0aXZlRXhwcikge1xuICAgICAgICAgICAgcGFyYW1zLnB1c2godGhpcy5fZGlyZWN0aXZlRXhwcik7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBwYXJhbXM7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9idWlsZENsYXNzSW5wdXRzKHZhbHVlQ29udmVydGVyOiBWYWx1ZUNvbnZlcnRlcik6IFN0eWxpbmdJbnN0cnVjdGlvbltdIHtcbiAgICBpZiAodGhpcy5fc2luZ2xlQ2xhc3NJbnB1dHMpIHtcbiAgICAgIHJldHVybiB0aGlzLl9idWlsZFNpbmdsZUlucHV0cyhcbiAgICAgICAgICBSMy5lbGVtZW50Q2xhc3NQcm9wLCB0aGlzLl9zaW5nbGVDbGFzc0lucHV0cywgdGhpcy5fY2xhc3Nlc0luZGV4LCBmYWxzZSwgdmFsdWVDb252ZXJ0ZXIpO1xuICAgIH1cbiAgICByZXR1cm4gW107XG4gIH1cblxuICBwcml2YXRlIF9idWlsZFN0eWxlSW5wdXRzKHZhbHVlQ29udmVydGVyOiBWYWx1ZUNvbnZlcnRlcik6IFN0eWxpbmdJbnN0cnVjdGlvbltdIHtcbiAgICBpZiAodGhpcy5fc2luZ2xlU3R5bGVJbnB1dHMpIHtcbiAgICAgIHJldHVybiB0aGlzLl9idWlsZFNpbmdsZUlucHV0cyhcbiAgICAgICAgICBSMy5lbGVtZW50U3R5bGVQcm9wLCB0aGlzLl9zaW5nbGVTdHlsZUlucHV0cywgdGhpcy5fc3R5bGVzSW5kZXgsIHRydWUsIHZhbHVlQ29udmVydGVyKTtcbiAgICB9XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgcHJpdmF0ZSBfYnVpbGRBcHBseUZuKCk6IFN0eWxpbmdJbnN0cnVjdGlvbiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHNvdXJjZVNwYW46IHRoaXMuX2xhc3RTdHlsaW5nSW5wdXQgPyB0aGlzLl9sYXN0U3R5bGluZ0lucHV0LnNvdXJjZVNwYW4gOiBudWxsLFxuICAgICAgcmVmZXJlbmNlOiBSMy5lbGVtZW50U3R5bGluZ0FwcGx5LFxuICAgICAgYnVpbGRQYXJhbXM6ICgpID0+IHtcbiAgICAgICAgY29uc3QgcGFyYW1zOiBvLkV4cHJlc3Npb25bXSA9IFt0aGlzLl9lbGVtZW50SW5kZXhFeHByXTtcbiAgICAgICAgaWYgKHRoaXMuX2RpcmVjdGl2ZUV4cHIpIHtcbiAgICAgICAgICBwYXJhbXMucHVzaCh0aGlzLl9kaXJlY3RpdmVFeHByKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcGFyYW1zO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogQ29uc3RydWN0cyBhbGwgaW5zdHJ1Y3Rpb25zIHdoaWNoIGNvbnRhaW4gdGhlIGV4cHJlc3Npb25zIHRoYXQgd2lsbCBiZSBwbGFjZWRcbiAgICogaW50byB0aGUgdXBkYXRlIGJsb2NrIG9mIGEgdGVtcGxhdGUgZnVuY3Rpb24gb3IgYSBkaXJlY3RpdmUgaG9zdEJpbmRpbmdzIGZ1bmN0aW9uLlxuICAgKi9cbiAgYnVpbGRVcGRhdGVMZXZlbEluc3RydWN0aW9ucyh2YWx1ZUNvbnZlcnRlcjogVmFsdWVDb252ZXJ0ZXIpIHtcbiAgICBjb25zdCBpbnN0cnVjdGlvbnM6IFN0eWxpbmdJbnN0cnVjdGlvbltdID0gW107XG4gICAgaWYgKHRoaXMuX2hhc0JpbmRpbmdzKSB7XG4gICAgICBjb25zdCBtYXBJbnN0cnVjdGlvbiA9IHRoaXMuYnVpbGRFbGVtZW50U3R5bGluZ01hcEluc3RydWN0aW9uKHZhbHVlQ29udmVydGVyKTtcbiAgICAgIGlmIChtYXBJbnN0cnVjdGlvbikge1xuICAgICAgICBpbnN0cnVjdGlvbnMucHVzaChtYXBJbnN0cnVjdGlvbik7XG4gICAgICB9XG4gICAgICBpbnN0cnVjdGlvbnMucHVzaCguLi50aGlzLl9idWlsZFN0eWxlSW5wdXRzKHZhbHVlQ29udmVydGVyKSk7XG4gICAgICBpbnN0cnVjdGlvbnMucHVzaCguLi50aGlzLl9idWlsZENsYXNzSW5wdXRzKHZhbHVlQ29udmVydGVyKSk7XG4gICAgICBpbnN0cnVjdGlvbnMucHVzaCh0aGlzLl9idWlsZEFwcGx5Rm4oKSk7XG4gICAgfVxuICAgIHJldHVybiBpbnN0cnVjdGlvbnM7XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNDbGFzc0JpbmRpbmcobmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBuYW1lID09ICdjbGFzc05hbWUnIHx8IG5hbWUgPT0gJ2NsYXNzJztcbn1cblxuZnVuY3Rpb24gcmVnaXN0ZXJJbnRvTWFwKG1hcDogTWFwPHN0cmluZywgbnVtYmVyPiwga2V5OiBzdHJpbmcpIHtcbiAgaWYgKCFtYXAuaGFzKGtleSkpIHtcbiAgICBtYXAuc2V0KGtleSwgbWFwLnNpemUpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzU3R5bGVTYW5pdGl6YWJsZShwcm9wOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIHByb3AgPT09ICdiYWNrZ3JvdW5kLWltYWdlJyB8fCBwcm9wID09PSAnYmFja2dyb3VuZCcgfHwgcHJvcCA9PT0gJ2JvcmRlci1pbWFnZScgfHxcbiAgICAgIHByb3AgPT09ICdmaWx0ZXInIHx8IHByb3AgPT09ICdsaXN0LXN0eWxlJyB8fCBwcm9wID09PSAnbGlzdC1zdHlsZS1pbWFnZSc7XG59XG5cbi8qKlxuICogU2ltcGxlIGhlbHBlciBmdW5jdGlvbiB0byBlaXRoZXIgcHJvdmlkZSB0aGUgY29uc3RhbnQgbGl0ZXJhbCB0aGF0IHdpbGwgaG91c2UgdGhlIHZhbHVlXG4gKiBoZXJlIG9yIGEgbnVsbCB2YWx1ZSBpZiB0aGUgcHJvdmlkZWQgdmFsdWVzIGFyZSBlbXB0eS5cbiAqL1xuZnVuY3Rpb24gZ2V0Q29uc3RhbnRMaXRlcmFsRnJvbUFycmF5KFxuICAgIGNvbnN0YW50UG9vbDogQ29uc3RhbnRQb29sLCB2YWx1ZXM6IG8uRXhwcmVzc2lvbltdKTogby5FeHByZXNzaW9uIHtcbiAgcmV0dXJuIHZhbHVlcy5sZW5ndGggPyBjb25zdGFudFBvb2wuZ2V0Q29uc3RMaXRlcmFsKG8ubGl0ZXJhbEFycih2YWx1ZXMpLCB0cnVlKSA6IG8uTlVMTF9FWFBSO1xufVxuXG4vKipcbiAqIFNpbXBsZSBoZWxwZXIgZnVuY3Rpb24gdGhhdCBhZGRzIGEgcGFyYW1ldGVyIG9yIGRvZXMgbm90aGluZyBhdCBhbGwgZGVwZW5kaW5nIG9uIHRoZSBwcm92aWRlZFxuICogcHJlZGljYXRlIGFuZCB0b3RhbEV4cGVjdGVkQXJncyB2YWx1ZXNcbiAqL1xuZnVuY3Rpb24gYWRkUGFyYW0oXG4gICAgcGFyYW1zOiBvLkV4cHJlc3Npb25bXSwgcHJlZGljYXRlOiBib29sZWFuLCB2YWx1ZTogby5FeHByZXNzaW9uLCBhcmdOdW1iZXI6IG51bWJlcixcbiAgICB0b3RhbEV4cGVjdGVkQXJnczogbnVtYmVyKSB7XG4gIGlmIChwcmVkaWNhdGUpIHtcbiAgICBwYXJhbXMucHVzaCh2YWx1ZSk7XG4gIH0gZWxzZSBpZiAoYXJnTnVtYmVyIDwgdG90YWxFeHBlY3RlZEFyZ3MpIHtcbiAgICBwYXJhbXMucHVzaChvLk5VTExfRVhQUik7XG4gIH1cbn1cbiJdfQ==