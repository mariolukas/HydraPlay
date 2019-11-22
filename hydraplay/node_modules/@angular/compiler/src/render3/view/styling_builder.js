(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler/src/render3/view/styling_builder", ["require", "exports", "tslib", "@angular/compiler/src/output/output_ast", "@angular/compiler/src/render3/r3_identifiers", "@angular/compiler/src/render3/view/style_parser"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var o = require("@angular/compiler/src/output/output_ast");
    var r3_identifiers_1 = require("@angular/compiler/src/render3/r3_identifiers");
    var style_parser_1 = require("@angular/compiler/src/render3/view/style_parser");
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
    var StylingBuilder = /** @class */ (function () {
        function StylingBuilder(_elementIndexExpr, _directiveExpr) {
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
        StylingBuilder.prototype.hasBindingsOrInitialValues = function () { return this._hasBindings || this._hasInitialValues; };
        /**
         * Registers a given input to the styling builder to be later used when producing AOT code.
         *
         * The code below will only accept the input if it is somehow tied to styling (whether it be
         * style/class bindings or static style/class attributes).
         */
        StylingBuilder.prototype.registerBoundInput = function (input) {
            // [attr.style] or [attr.class] are skipped in the code below,
            // they should not be treated as styling-based bindings since
            // they are intended to be written directly to the attr and
            // will therefore skip all style/class resolution that is present
            // with style="", [style]="" and [style.prop]="", class="",
            // [class.prop]="". [class]="" assignments
            var name = input.name;
            var binding = null;
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
        };
        StylingBuilder.prototype.registerStyleInput = function (propertyName, value, unit, sourceSpan) {
            var entry = { name: propertyName, unit: unit, value: value, sourceSpan: sourceSpan };
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
        };
        StylingBuilder.prototype.registerClassInput = function (className, value, sourceSpan) {
            var entry = { name: className, value: value, sourceSpan: sourceSpan };
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
        };
        /**
         * Registers the element's static style string value to the builder.
         *
         * @param value the style string (e.g. `width:100px; height:200px;`)
         */
        StylingBuilder.prototype.registerStyleAttr = function (value) {
            this._initialStyleValues = style_parser_1.parse(value);
            this._hasInitialValues = true;
        };
        /**
         * Registers the element's static class string value to the builder.
         *
         * @param value the className string (e.g. `disabled gold zoom`)
         */
        StylingBuilder.prototype.registerClassAttr = function (value) {
            this._initialClassValues = value.trim().split(/\s+/g);
            this._hasInitialValues = true;
        };
        /**
         * Appends all styling-related expressions to the provided attrs array.
         *
         * @param attrs an existing array where each of the styling expressions
         * will be inserted into.
         */
        StylingBuilder.prototype.populateInitialStylingAttrs = function (attrs) {
            // [CLASS_MARKER, 'foo', 'bar', 'baz' ...]
            if (this._initialClassValues.length) {
                attrs.push(o.literal(1 /* Classes */));
                for (var i = 0; i < this._initialClassValues.length; i++) {
                    attrs.push(o.literal(this._initialClassValues[i]));
                }
            }
            // [STYLE_MARKER, 'width', '200px', 'height', '100px', ...]
            if (this._initialStyleValues.length) {
                attrs.push(o.literal(2 /* Styles */));
                for (var i = 0; i < this._initialStyleValues.length; i += 2) {
                    attrs.push(o.literal(this._initialStyleValues[i]), o.literal(this._initialStyleValues[i + 1]));
                }
            }
        };
        /**
         * Builds an instruction with all the expressions and parameters for `elementHostAttrs`.
         *
         * The instruction generation code below is used for producing the AOT statement code which is
         * responsible for registering initial styles (within a directive hostBindings' creation block)
         * to the directive host element.
         */
        StylingBuilder.prototype.buildDirectiveHostAttrsInstruction = function (sourceSpan, constantPool) {
            var _this = this;
            if (this._hasInitialValues && this._directiveExpr) {
                return {
                    sourceSpan: sourceSpan,
                    reference: r3_identifiers_1.Identifiers.elementHostAttrs,
                    buildParams: function () {
                        var attrs = [];
                        _this.populateInitialStylingAttrs(attrs);
                        return [_this._directiveExpr, getConstantLiteralFromArray(constantPool, attrs)];
                    }
                };
            }
            return null;
        };
        /**
         * Builds an instruction with all the expressions and parameters for `elementStyling`.
         *
         * The instruction generation code below is used for producing the AOT statement code which is
         * responsible for registering style/class bindings to an element.
         */
        StylingBuilder.prototype.buildElementStylingInstruction = function (sourceSpan, constantPool) {
            var _this = this;
            if (this._hasBindings) {
                return {
                    sourceSpan: sourceSpan,
                    reference: r3_identifiers_1.Identifiers.elementStyling,
                    buildParams: function () {
                        // a string array of every style-based binding
                        var styleBindingProps = _this._singleStyleInputs ? _this._singleStyleInputs.map(function (i) { return o.literal(i.name); }) : [];
                        // a string array of every class-based binding
                        var classBindingNames = _this._singleClassInputs ? _this._singleClassInputs.map(function (i) { return o.literal(i.name); }) : [];
                        // to salvage space in the AOT generated code, there is no point in passing
                        // in `null` into a param if any follow-up params are not used. Therefore,
                        // only when a trailing param is used then it will be filled with nulls in between
                        // (otherwise a shorter amount of params will be filled). The code below helps
                        // determine how many params are required in the expression code.
                        //
                        // min params => elementStyling()
                        // max params => elementStyling(classBindings, styleBindings, sanitizer, directive)
                        var expectedNumberOfArgs = 0;
                        if (_this._directiveExpr) {
                            expectedNumberOfArgs = 4;
                        }
                        else if (_this._useDefaultSanitizer) {
                            expectedNumberOfArgs = 3;
                        }
                        else if (styleBindingProps.length) {
                            expectedNumberOfArgs = 2;
                        }
                        else if (classBindingNames.length) {
                            expectedNumberOfArgs = 1;
                        }
                        var params = [];
                        addParam(params, classBindingNames.length > 0, getConstantLiteralFromArray(constantPool, classBindingNames), 1, expectedNumberOfArgs);
                        addParam(params, styleBindingProps.length > 0, getConstantLiteralFromArray(constantPool, styleBindingProps), 2, expectedNumberOfArgs);
                        addParam(params, _this._useDefaultSanitizer, o.importExpr(r3_identifiers_1.Identifiers.defaultStyleSanitizer), 3, expectedNumberOfArgs);
                        if (_this._directiveExpr) {
                            params.push(_this._directiveExpr);
                        }
                        return params;
                    }
                };
            }
            return null;
        };
        /**
         * Builds an instruction with all the expressions and parameters for `elementStylingMap`.
         *
         * The instruction data will contain all expressions for `elementStylingMap` to function
         * which include the `[style]` and `[class]` expression params (if they exist) as well as
         * the sanitizer and directive reference expression.
         */
        StylingBuilder.prototype.buildElementStylingMapInstruction = function (valueConverter) {
            var _this = this;
            if (this._classMapInput || this._styleMapInput) {
                var stylingInput = this._classMapInput || this._styleMapInput;
                // these values must be outside of the update block so that they can
                // be evaluted (the AST visit call) during creation time so that any
                // pipes can be picked up in time before the template is built
                var mapBasedClassValue_1 = this._classMapInput ? this._classMapInput.value.visit(valueConverter) : null;
                var mapBasedStyleValue_1 = this._styleMapInput ? this._styleMapInput.value.visit(valueConverter) : null;
                return {
                    sourceSpan: stylingInput.sourceSpan,
                    reference: r3_identifiers_1.Identifiers.elementStylingMap,
                    buildParams: function (convertFn) {
                        var params = [_this._elementIndexExpr];
                        if (mapBasedClassValue_1) {
                            params.push(convertFn(mapBasedClassValue_1));
                        }
                        else if (_this._styleMapInput) {
                            params.push(o.NULL_EXPR);
                        }
                        if (mapBasedStyleValue_1) {
                            params.push(convertFn(mapBasedStyleValue_1));
                        }
                        else if (_this._directiveExpr) {
                            params.push(o.NULL_EXPR);
                        }
                        if (_this._directiveExpr) {
                            params.push(_this._directiveExpr);
                        }
                        return params;
                    }
                };
            }
            return null;
        };
        StylingBuilder.prototype._buildSingleInputs = function (reference, inputs, mapIndex, allowUnits, valueConverter) {
            var _this = this;
            return inputs.map(function (input) {
                var bindingIndex = mapIndex.get(input.name);
                var value = input.value.visit(valueConverter);
                return {
                    sourceSpan: input.sourceSpan,
                    reference: reference,
                    buildParams: function (convertFn) {
                        var params = [_this._elementIndexExpr, o.literal(bindingIndex), convertFn(value)];
                        if (allowUnits) {
                            if (input.unit) {
                                params.push(o.literal(input.unit));
                            }
                            else if (_this._directiveExpr) {
                                params.push(o.NULL_EXPR);
                            }
                        }
                        if (_this._directiveExpr) {
                            params.push(_this._directiveExpr);
                        }
                        return params;
                    }
                };
            });
        };
        StylingBuilder.prototype._buildClassInputs = function (valueConverter) {
            if (this._singleClassInputs) {
                return this._buildSingleInputs(r3_identifiers_1.Identifiers.elementClassProp, this._singleClassInputs, this._classesIndex, false, valueConverter);
            }
            return [];
        };
        StylingBuilder.prototype._buildStyleInputs = function (valueConverter) {
            if (this._singleStyleInputs) {
                return this._buildSingleInputs(r3_identifiers_1.Identifiers.elementStyleProp, this._singleStyleInputs, this._stylesIndex, true, valueConverter);
            }
            return [];
        };
        StylingBuilder.prototype._buildApplyFn = function () {
            var _this = this;
            return {
                sourceSpan: this._lastStylingInput ? this._lastStylingInput.sourceSpan : null,
                reference: r3_identifiers_1.Identifiers.elementStylingApply,
                buildParams: function () {
                    var params = [_this._elementIndexExpr];
                    if (_this._directiveExpr) {
                        params.push(_this._directiveExpr);
                    }
                    return params;
                }
            };
        };
        /**
         * Constructs all instructions which contain the expressions that will be placed
         * into the update block of a template function or a directive hostBindings function.
         */
        StylingBuilder.prototype.buildUpdateLevelInstructions = function (valueConverter) {
            var instructions = [];
            if (this._hasBindings) {
                var mapInstruction = this.buildElementStylingMapInstruction(valueConverter);
                if (mapInstruction) {
                    instructions.push(mapInstruction);
                }
                instructions.push.apply(instructions, tslib_1.__spread(this._buildStyleInputs(valueConverter)));
                instructions.push.apply(instructions, tslib_1.__spread(this._buildClassInputs(valueConverter)));
                instructions.push(this._buildApplyFn());
            }
            return instructions;
        };
        return StylingBuilder;
    }());
    exports.StylingBuilder = StylingBuilder;
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
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3R5bGluZ19idWlsZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3JlbmRlcjMvdmlldy9zdHlsaW5nX2J1aWxkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBVUEsMkRBQTZDO0lBRzdDLCtFQUFvRDtJQUVwRCxnRkFBbUQ7SUF3Qm5EOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09BNEJHO0lBQ0g7UUEwQ0Usd0JBQW9CLGlCQUErQixFQUFVLGNBQWlDO1lBQTFFLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBYztZQUFVLG1CQUFjLEdBQWQsY0FBYyxDQUFtQjtZQXpDOUYsaUVBQWlFO1lBQ3pELHNCQUFpQixHQUFHLEtBQUssQ0FBQztZQUNsQzs7O2VBR0c7WUFDSyxpQkFBWSxHQUFHLEtBQUssQ0FBQztZQUU3QiwyQ0FBMkM7WUFDbkMsbUJBQWMsR0FBMkIsSUFBSSxDQUFDO1lBQ3RELDJDQUEyQztZQUNuQyxtQkFBYyxHQUEyQixJQUFJLENBQUM7WUFDdEQsMENBQTBDO1lBQ2xDLHVCQUFrQixHQUE2QixJQUFJLENBQUM7WUFDNUQsMENBQTBDO1lBQ2xDLHVCQUFrQixHQUE2QixJQUFJLENBQUM7WUFDcEQsc0JBQWlCLEdBQTJCLElBQUksQ0FBQztZQUV6RCx3REFBd0Q7WUFDeEQsa0NBQWtDO1lBRWxDOzs7O2VBSUc7WUFDSyxpQkFBWSxHQUFHLElBQUksR0FBRyxFQUFrQixDQUFDO1lBRWpEOzs7O2VBSUc7WUFDSyxrQkFBYSxHQUFHLElBQUksR0FBRyxFQUFrQixDQUFDO1lBQzFDLHdCQUFtQixHQUFhLEVBQUUsQ0FBQztZQUNuQyx3QkFBbUIsR0FBYSxFQUFFLENBQUM7WUFFM0Msb0RBQW9EO1lBQ3BELHVEQUF1RDtZQUMvQyx5QkFBb0IsR0FBRyxLQUFLLENBQUM7UUFFNEQsQ0FBQztRQUVsRyxtREFBMEIsR0FBMUIsY0FBK0IsT0FBTyxJQUFJLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7UUFFcEY7Ozs7O1dBS0c7UUFDSCwyQ0FBa0IsR0FBbEIsVUFBbUIsS0FBdUI7WUFDeEMsOERBQThEO1lBQzlELDZEQUE2RDtZQUM3RCwyREFBMkQ7WUFDM0QsaUVBQWlFO1lBQ2pFLDJEQUEyRDtZQUMzRCwwQ0FBMEM7WUFDMUMsSUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQztZQUN4QixJQUFJLE9BQU8sR0FBMkIsSUFBSSxDQUFDO1lBQzNDLFFBQVEsS0FBSyxDQUFDLElBQUksRUFBRTtnQkFDbEI7b0JBQ0UsSUFBSSxJQUFJLElBQUksT0FBTyxFQUFFO3dCQUNuQixPQUFPLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7cUJBQzVFO3lCQUFNLElBQUksY0FBYyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRTt3QkFDckMsT0FBTyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7cUJBQ3hFO29CQUNELE1BQU07Z0JBQ1I7b0JBQ0UsT0FBTyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7b0JBQ3pGLE1BQU07Z0JBQ1I7b0JBQ0UsT0FBTyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO29CQUM3RSxNQUFNO2FBQ1Q7WUFDRCxPQUFPLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDaEMsQ0FBQztRQUVELDJDQUFrQixHQUFsQixVQUNJLFlBQXlCLEVBQUUsS0FBVSxFQUFFLElBQWlCLEVBQ3hELFVBQTJCO1lBQzdCLElBQU0sS0FBSyxHQUFHLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxJQUFJLE1BQUEsRUFBRSxLQUFLLE9BQUEsRUFBRSxVQUFVLFlBQUEsRUFBdUIsQ0FBQztZQUNuRixJQUFJLFlBQVksRUFBRTtnQkFDaEIsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDdEUsSUFBSSxDQUFDLG9CQUFvQixHQUFHLElBQUksQ0FBQyxvQkFBb0IsSUFBSSxrQkFBa0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDMUYsZUFBZSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsWUFBWSxDQUFDLENBQUM7YUFDbEQ7aUJBQU07Z0JBQ0wsSUFBSSxDQUFDLG9CQUFvQixHQUFHLElBQUksQ0FBQztnQkFDakMsSUFBSSxDQUFDLGNBQWMsR0FBRyxLQUFLLENBQUM7YUFDN0I7WUFDRCxJQUFJLENBQUMsaUJBQWlCLEdBQUcsS0FBSyxDQUFDO1lBQy9CLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO1lBQ3pCLE9BQU8sS0FBSyxDQUFDO1FBQ2YsQ0FBQztRQUVELDJDQUFrQixHQUFsQixVQUFtQixTQUFzQixFQUFFLEtBQVUsRUFBRSxVQUEyQjtZQUVoRixJQUFNLEtBQUssR0FBRyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsS0FBSyxPQUFBLEVBQUUsVUFBVSxZQUFBLEVBQXVCLENBQUM7WUFDMUUsSUFBSSxTQUFTLEVBQUU7Z0JBQ2IsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDdEUsZUFBZSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsU0FBUyxDQUFDLENBQUM7YUFDaEQ7aUJBQU07Z0JBQ0wsSUFBSSxDQUFDLGNBQWMsR0FBRyxLQUFLLENBQUM7YUFDN0I7WUFDRCxJQUFJLENBQUMsaUJBQWlCLEdBQUcsS0FBSyxDQUFDO1lBQy9CLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO1lBQ3pCLE9BQU8sS0FBSyxDQUFDO1FBQ2YsQ0FBQztRQUVEOzs7O1dBSUc7UUFDSCwwQ0FBaUIsR0FBakIsVUFBa0IsS0FBYTtZQUM3QixJQUFJLENBQUMsbUJBQW1CLEdBQUcsb0JBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM3QyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDO1FBQ2hDLENBQUM7UUFFRDs7OztXQUlHO1FBQ0gsMENBQWlCLEdBQWpCLFVBQWtCLEtBQWE7WUFDN0IsSUFBSSxDQUFDLG1CQUFtQixHQUFHLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDdEQsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQztRQUNoQyxDQUFDO1FBRUQ7Ozs7O1dBS0c7UUFDSCxvREFBMkIsR0FBM0IsVUFBNEIsS0FBcUI7WUFDL0MsMENBQTBDO1lBQzFDLElBQUksSUFBSSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sRUFBRTtnQkFDbkMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxpQkFBeUIsQ0FBQyxDQUFDO2dCQUMvQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtvQkFDeEQsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ3BEO2FBQ0Y7WUFFRCwyREFBMkQ7WUFDM0QsSUFBSSxJQUFJLENBQUMsbUJBQW1CLENBQUMsTUFBTSxFQUFFO2dCQUNuQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLGdCQUF3QixDQUFDLENBQUM7Z0JBQzlDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQzNELEtBQUssQ0FBQyxJQUFJLENBQ04sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUN6RjthQUNGO1FBQ0gsQ0FBQztRQUVEOzs7Ozs7V0FNRztRQUNILDJEQUFrQyxHQUFsQyxVQUFtQyxVQUFnQyxFQUFFLFlBQTBCO1lBQS9GLGlCQWNDO1lBWkMsSUFBSSxJQUFJLENBQUMsaUJBQWlCLElBQUksSUFBSSxDQUFDLGNBQWMsRUFBRTtnQkFDakQsT0FBTztvQkFDTCxVQUFVLFlBQUE7b0JBQ1YsU0FBUyxFQUFFLDRCQUFFLENBQUMsZ0JBQWdCO29CQUM5QixXQUFXLEVBQUU7d0JBQ1gsSUFBTSxLQUFLLEdBQW1CLEVBQUUsQ0FBQzt3QkFDakMsS0FBSSxDQUFDLDJCQUEyQixDQUFDLEtBQUssQ0FBQyxDQUFDO3dCQUN4QyxPQUFPLENBQUMsS0FBSSxDQUFDLGNBQWdCLEVBQUUsMkJBQTJCLENBQUMsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7b0JBQ25GLENBQUM7aUJBQ0YsQ0FBQzthQUNIO1lBQ0QsT0FBTyxJQUFJLENBQUM7UUFDZCxDQUFDO1FBRUQ7Ozs7O1dBS0c7UUFDSCx1REFBOEIsR0FBOUIsVUFBK0IsVUFBZ0MsRUFBRSxZQUEwQjtZQUEzRixpQkFxREM7WUFuREMsSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFO2dCQUNyQixPQUFPO29CQUNMLFVBQVUsWUFBQTtvQkFDVixTQUFTLEVBQUUsNEJBQUUsQ0FBQyxjQUFjO29CQUM1QixXQUFXLEVBQUU7d0JBQ1gsOENBQThDO3dCQUM5QyxJQUFNLGlCQUFpQixHQUNuQixLQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLEtBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBakIsQ0FBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7d0JBQ3ZGLDhDQUE4Qzt3QkFDOUMsSUFBTSxpQkFBaUIsR0FDbkIsS0FBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxLQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQWpCLENBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO3dCQUV2RiwyRUFBMkU7d0JBQzNFLDBFQUEwRTt3QkFDMUUsa0ZBQWtGO3dCQUNsRiw4RUFBOEU7d0JBQzlFLGlFQUFpRTt3QkFDakUsRUFBRTt3QkFDRixpQ0FBaUM7d0JBQ2pDLG1GQUFtRjt3QkFDbkYsSUFBSSxvQkFBb0IsR0FBRyxDQUFDLENBQUM7d0JBQzdCLElBQUksS0FBSSxDQUFDLGNBQWMsRUFBRTs0QkFDdkIsb0JBQW9CLEdBQUcsQ0FBQyxDQUFDO3lCQUMxQjs2QkFBTSxJQUFJLEtBQUksQ0FBQyxvQkFBb0IsRUFBRTs0QkFDcEMsb0JBQW9CLEdBQUcsQ0FBQyxDQUFDO3lCQUMxQjs2QkFBTSxJQUFJLGlCQUFpQixDQUFDLE1BQU0sRUFBRTs0QkFDbkMsb0JBQW9CLEdBQUcsQ0FBQyxDQUFDO3lCQUMxQjs2QkFBTSxJQUFJLGlCQUFpQixDQUFDLE1BQU0sRUFBRTs0QkFDbkMsb0JBQW9CLEdBQUcsQ0FBQyxDQUFDO3lCQUMxQjt3QkFFRCxJQUFNLE1BQU0sR0FBbUIsRUFBRSxDQUFDO3dCQUNsQyxRQUFRLENBQ0osTUFBTSxFQUFFLGlCQUFpQixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQ3BDLDJCQUEyQixDQUFDLFlBQVksRUFBRSxpQkFBaUIsQ0FBQyxFQUFFLENBQUMsRUFDL0Qsb0JBQW9CLENBQUMsQ0FBQzt3QkFDMUIsUUFBUSxDQUNKLE1BQU0sRUFBRSxpQkFBaUIsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUNwQywyQkFBMkIsQ0FBQyxZQUFZLEVBQUUsaUJBQWlCLENBQUMsRUFBRSxDQUFDLEVBQy9ELG9CQUFvQixDQUFDLENBQUM7d0JBQzFCLFFBQVEsQ0FDSixNQUFNLEVBQUUsS0FBSSxDQUFDLG9CQUFvQixFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsNEJBQUUsQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFLENBQUMsRUFDNUUsb0JBQW9CLENBQUMsQ0FBQzt3QkFDMUIsSUFBSSxLQUFJLENBQUMsY0FBYyxFQUFFOzRCQUN2QixNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQzt5QkFDbEM7d0JBQ0QsT0FBTyxNQUFNLENBQUM7b0JBQ2hCLENBQUM7aUJBQ0YsQ0FBQzthQUNIO1lBQ0QsT0FBTyxJQUFJLENBQUM7UUFDZCxDQUFDO1FBRUQ7Ozs7OztXQU1HO1FBQ0gsMERBQWlDLEdBQWpDLFVBQWtDLGNBQThCO1lBQWhFLGlCQXVDQztZQXRDQyxJQUFJLElBQUksQ0FBQyxjQUFjLElBQUksSUFBSSxDQUFDLGNBQWMsRUFBRTtnQkFDOUMsSUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLGNBQWdCLElBQUksSUFBSSxDQUFDLGNBQWdCLENBQUM7Z0JBRXBFLG9FQUFvRTtnQkFDcEUsb0VBQW9FO2dCQUNwRSw4REFBOEQ7Z0JBQzlELElBQU0sb0JBQWtCLEdBQ3BCLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO2dCQUNqRixJQUFNLG9CQUFrQixHQUNwQixJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztnQkFFakYsT0FBTztvQkFDTCxVQUFVLEVBQUUsWUFBWSxDQUFDLFVBQVU7b0JBQ25DLFNBQVMsRUFBRSw0QkFBRSxDQUFDLGlCQUFpQjtvQkFDL0IsV0FBVyxFQUFFLFVBQUMsU0FBdUM7d0JBQ25ELElBQU0sTUFBTSxHQUFtQixDQUFDLEtBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO3dCQUV4RCxJQUFJLG9CQUFrQixFQUFFOzRCQUN0QixNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxvQkFBa0IsQ0FBQyxDQUFDLENBQUM7eUJBQzVDOzZCQUFNLElBQUksS0FBSSxDQUFDLGNBQWMsRUFBRTs0QkFDOUIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7eUJBQzFCO3dCQUVELElBQUksb0JBQWtCLEVBQUU7NEJBQ3RCLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLG9CQUFrQixDQUFDLENBQUMsQ0FBQzt5QkFDNUM7NkJBQU0sSUFBSSxLQUFJLENBQUMsY0FBYyxFQUFFOzRCQUM5QixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQzt5QkFDMUI7d0JBRUQsSUFBSSxLQUFJLENBQUMsY0FBYyxFQUFFOzRCQUN2QixNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQzt5QkFDbEM7d0JBRUQsT0FBTyxNQUFNLENBQUM7b0JBQ2hCLENBQUM7aUJBQ0YsQ0FBQzthQUNIO1lBQ0QsT0FBTyxJQUFJLENBQUM7UUFDZCxDQUFDO1FBRU8sMkNBQWtCLEdBQTFCLFVBQ0ksU0FBOEIsRUFBRSxNQUEyQixFQUFFLFFBQTZCLEVBQzFGLFVBQW1CLEVBQUUsY0FBOEI7WUFGdkQsaUJBMEJDO1lBdkJDLE9BQU8sTUFBTSxDQUFDLEdBQUcsQ0FBQyxVQUFBLEtBQUs7Z0JBQ3JCLElBQU0sWUFBWSxHQUFXLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBRyxDQUFDO2dCQUN4RCxJQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQztnQkFDaEQsT0FBTztvQkFDTCxVQUFVLEVBQUUsS0FBSyxDQUFDLFVBQVU7b0JBQzVCLFNBQVMsV0FBQTtvQkFDVCxXQUFXLEVBQUUsVUFBQyxTQUF1Qzt3QkFDbkQsSUFBTSxNQUFNLEdBQUcsQ0FBQyxLQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsRUFBRSxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQzt3QkFDbkYsSUFBSSxVQUFVLEVBQUU7NEJBQ2QsSUFBSSxLQUFLLENBQUMsSUFBSSxFQUFFO2dDQUNkLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzs2QkFDcEM7aUNBQU0sSUFBSSxLQUFJLENBQUMsY0FBYyxFQUFFO2dDQUM5QixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQzs2QkFDMUI7eUJBQ0Y7d0JBRUQsSUFBSSxLQUFJLENBQUMsY0FBYyxFQUFFOzRCQUN2QixNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQzt5QkFDbEM7d0JBQ0QsT0FBTyxNQUFNLENBQUM7b0JBQ2hCLENBQUM7aUJBQ0YsQ0FBQztZQUNKLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUVPLDBDQUFpQixHQUF6QixVQUEwQixjQUE4QjtZQUN0RCxJQUFJLElBQUksQ0FBQyxrQkFBa0IsRUFBRTtnQkFDM0IsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQzFCLDRCQUFFLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsS0FBSyxFQUFFLGNBQWMsQ0FBQyxDQUFDO2FBQzlGO1lBQ0QsT0FBTyxFQUFFLENBQUM7UUFDWixDQUFDO1FBRU8sMENBQWlCLEdBQXpCLFVBQTBCLGNBQThCO1lBQ3RELElBQUksSUFBSSxDQUFDLGtCQUFrQixFQUFFO2dCQUMzQixPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FDMUIsNEJBQUUsQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLEVBQUUsY0FBYyxDQUFDLENBQUM7YUFDNUY7WUFDRCxPQUFPLEVBQUUsQ0FBQztRQUNaLENBQUM7UUFFTyxzQ0FBYSxHQUFyQjtZQUFBLGlCQVlDO1lBWEMsT0FBTztnQkFDTCxVQUFVLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJO2dCQUM3RSxTQUFTLEVBQUUsNEJBQUUsQ0FBQyxtQkFBbUI7Z0JBQ2pDLFdBQVcsRUFBRTtvQkFDWCxJQUFNLE1BQU0sR0FBbUIsQ0FBQyxLQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztvQkFDeEQsSUFBSSxLQUFJLENBQUMsY0FBYyxFQUFFO3dCQUN2QixNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztxQkFDbEM7b0JBQ0QsT0FBTyxNQUFNLENBQUM7Z0JBQ2hCLENBQUM7YUFDRixDQUFDO1FBQ0osQ0FBQztRQUVEOzs7V0FHRztRQUNILHFEQUE0QixHQUE1QixVQUE2QixjQUE4QjtZQUN6RCxJQUFNLFlBQVksR0FBeUIsRUFBRSxDQUFDO1lBQzlDLElBQUksSUFBSSxDQUFDLFlBQVksRUFBRTtnQkFDckIsSUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGlDQUFpQyxDQUFDLGNBQWMsQ0FBQyxDQUFDO2dCQUM5RSxJQUFJLGNBQWMsRUFBRTtvQkFDbEIsWUFBWSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztpQkFDbkM7Z0JBQ0QsWUFBWSxDQUFDLElBQUksT0FBakIsWUFBWSxtQkFBUyxJQUFJLENBQUMsaUJBQWlCLENBQUMsY0FBYyxDQUFDLEdBQUU7Z0JBQzdELFlBQVksQ0FBQyxJQUFJLE9BQWpCLFlBQVksbUJBQVMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLGNBQWMsQ0FBQyxHQUFFO2dCQUM3RCxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDO2FBQ3pDO1lBQ0QsT0FBTyxZQUFZLENBQUM7UUFDdEIsQ0FBQztRQUNILHFCQUFDO0lBQUQsQ0FBQyxBQTFXRCxJQTBXQztJQTFXWSx3Q0FBYztJQTRXM0IsU0FBUyxjQUFjLENBQUMsSUFBWTtRQUNsQyxPQUFPLElBQUksSUFBSSxXQUFXLElBQUksSUFBSSxJQUFJLE9BQU8sQ0FBQztJQUNoRCxDQUFDO0lBRUQsU0FBUyxlQUFlLENBQUMsR0FBd0IsRUFBRSxHQUFXO1FBQzVELElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ2pCLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN4QjtJQUNILENBQUM7SUFFRCxTQUFTLGtCQUFrQixDQUFDLElBQVk7UUFDdEMsT0FBTyxJQUFJLEtBQUssa0JBQWtCLElBQUksSUFBSSxLQUFLLFlBQVksSUFBSSxJQUFJLEtBQUssY0FBYztZQUNsRixJQUFJLEtBQUssUUFBUSxJQUFJLElBQUksS0FBSyxZQUFZLElBQUksSUFBSSxLQUFLLGtCQUFrQixDQUFDO0lBQ2hGLENBQUM7SUFFRDs7O09BR0c7SUFDSCxTQUFTLDJCQUEyQixDQUNoQyxZQUEwQixFQUFFLE1BQXNCO1FBQ3BELE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO0lBQ2hHLENBQUM7SUFFRDs7O09BR0c7SUFDSCxTQUFTLFFBQVEsQ0FDYixNQUFzQixFQUFFLFNBQWtCLEVBQUUsS0FBbUIsRUFBRSxTQUFpQixFQUNsRixpQkFBeUI7UUFDM0IsSUFBSSxTQUFTLEVBQUU7WUFDYixNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ3BCO2FBQU0sSUFBSSxTQUFTLEdBQUcsaUJBQWlCLEVBQUU7WUFDeEMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDMUI7SUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtDb25zdGFudFBvb2x9IGZyb20gJy4uLy4uL2NvbnN0YW50X3Bvb2wnO1xuaW1wb3J0IHtBdHRyaWJ1dGVNYXJrZXJ9IGZyb20gJy4uLy4uL2NvcmUnO1xuaW1wb3J0IHtBU1QsIEJpbmRpbmdUeXBlfSBmcm9tICcuLi8uLi9leHByZXNzaW9uX3BhcnNlci9hc3QnO1xuaW1wb3J0ICogYXMgbyBmcm9tICcuLi8uLi9vdXRwdXQvb3V0cHV0X2FzdCc7XG5pbXBvcnQge1BhcnNlU291cmNlU3Bhbn0gZnJvbSAnLi4vLi4vcGFyc2VfdXRpbCc7XG5pbXBvcnQgKiBhcyB0IGZyb20gJy4uL3IzX2FzdCc7XG5pbXBvcnQge0lkZW50aWZpZXJzIGFzIFIzfSBmcm9tICcuLi9yM19pZGVudGlmaWVycyc7XG5cbmltcG9ydCB7cGFyc2UgYXMgcGFyc2VTdHlsZX0gZnJvbSAnLi9zdHlsZV9wYXJzZXInO1xuaW1wb3J0IHtWYWx1ZUNvbnZlcnRlcn0gZnJvbSAnLi90ZW1wbGF0ZSc7XG5cblxuLyoqXG4gKiBBIHN0eWxpbmcgZXhwcmVzc2lvbiBzdW1tYXJ5IHRoYXQgaXMgdG8gYmUgcHJvY2Vzc2VkIGJ5IHRoZSBjb21waWxlclxuICovXG5leHBvcnQgaW50ZXJmYWNlIFN0eWxpbmdJbnN0cnVjdGlvbiB7XG4gIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbnxudWxsO1xuICByZWZlcmVuY2U6IG8uRXh0ZXJuYWxSZWZlcmVuY2U7XG4gIGJ1aWxkUGFyYW1zKGNvbnZlcnRGbjogKHZhbHVlOiBhbnkpID0+IG8uRXhwcmVzc2lvbik6IG8uRXhwcmVzc2lvbltdO1xufVxuXG4vKipcbiAqIEFuIGludGVybmFsIHJlY29yZCBvZiB0aGUgaW5wdXQgZGF0YSBmb3IgYSBzdHlsaW5nIGJpbmRpbmdcbiAqL1xuaW50ZXJmYWNlIEJvdW5kU3R5bGluZ0VudHJ5IHtcbiAgbmFtZTogc3RyaW5nO1xuICB1bml0OiBzdHJpbmd8bnVsbDtcbiAgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuO1xuICB2YWx1ZTogQVNUO1xufVxuXG5cbi8qKlxuICogUHJvZHVjZXMgY3JlYXRpb24vdXBkYXRlIGluc3RydWN0aW9ucyBmb3IgYWxsIHN0eWxpbmcgYmluZGluZ3MgKGNsYXNzIGFuZCBzdHlsZSlcbiAqXG4gKiBJdCBhbHNvIHByb2R1Y2VzIHRoZSBjcmVhdGlvbiBpbnN0cnVjdGlvbiB0byByZWdpc3RlciBhbGwgaW5pdGlhbCBzdHlsaW5nIHZhbHVlc1xuICogKHdoaWNoIGFyZSBhbGwgdGhlIHN0YXRpYyBjbGFzcz1cIi4uLlwiIGFuZCBzdHlsZT1cIi4uLlwiIGF0dHJpYnV0ZSB2YWx1ZXMgdGhhdCBleGlzdFxuICogb24gYW4gZWxlbWVudCB3aXRoaW4gYSB0ZW1wbGF0ZSkuXG4gKlxuICogVGhlIGJ1aWxkZXIgY2xhc3MgYmVsb3cgaGFuZGxlcyBwcm9kdWNpbmcgaW5zdHJ1Y3Rpb25zIGZvciB0aGUgZm9sbG93aW5nIGNhc2VzOlxuICpcbiAqIC0gU3RhdGljIHN0eWxlL2NsYXNzIGF0dHJpYnV0ZXMgKHN0eWxlPVwiLi4uXCIgYW5kIGNsYXNzPVwiLi4uXCIpXG4gKiAtIER5bmFtaWMgc3R5bGUvY2xhc3MgbWFwIGJpbmRpbmdzIChbc3R5bGVdPVwibWFwXCIgYW5kIFtjbGFzc109XCJtYXB8c3RyaW5nXCIpXG4gKiAtIER5bmFtaWMgc3R5bGUvY2xhc3MgcHJvcGVydHkgYmluZGluZ3MgKFtzdHlsZS5wcm9wXT1cImV4cFwiIGFuZCBbY2xhc3MubmFtZV09XCJleHBcIilcbiAqXG4gKiBEdWUgdG8gdGhlIGNvbXBsZXggcmVsYXRpb25zaGlwIG9mIGFsbCBvZiB0aGVzZSBjYXNlcywgdGhlIGluc3RydWN0aW9ucyBnZW5lcmF0ZWRcbiAqIGZvciB0aGVzZSBhdHRyaWJ1dGVzL3Byb3BlcnRpZXMvYmluZGluZ3MgbXVzdCBiZSBkb25lIHNvIGluIHRoZSBjb3JyZWN0IG9yZGVyLiBUaGVcbiAqIG9yZGVyIHdoaWNoIHRoZXNlIG11c3QgYmUgZ2VuZXJhdGVkIGlzIGFzIGZvbGxvd3M6XG4gKlxuICogaWYgKGNyZWF0ZU1vZGUpIHtcbiAqICAgZWxlbWVudFN0eWxpbmcoLi4uKVxuICogfVxuICogaWYgKHVwZGF0ZU1vZGUpIHtcbiAqICAgZWxlbWVudFN0eWxpbmdNYXAoLi4uKVxuICogICBlbGVtZW50U3R5bGVQcm9wKC4uLilcbiAqICAgZWxlbWVudENsYXNzUHJvcCguLi4pXG4gKiAgIGVsZW1lbnRTdHlsaW5nQXBwKC4uLilcbiAqIH1cbiAqXG4gKiBUaGUgY3JlYXRpb24vdXBkYXRlIG1ldGhvZHMgd2l0aGluIHRoZSBidWlsZGVyIGNsYXNzIHByb2R1Y2UgdGhlc2UgaW5zdHJ1Y3Rpb25zLlxuICovXG5leHBvcnQgY2xhc3MgU3R5bGluZ0J1aWxkZXIge1xuICAvKiogV2hldGhlciBvciBub3QgdGhlcmUgYXJlIGFueSBzdGF0aWMgc3R5bGluZyB2YWx1ZXMgcHJlc2VudCAqL1xuICBwcml2YXRlIF9oYXNJbml0aWFsVmFsdWVzID0gZmFsc2U7XG4gIC8qKlxuICAgKiAgV2hldGhlciBvciBub3QgdGhlcmUgYXJlIGFueSBzdHlsaW5nIGJpbmRpbmdzIHByZXNlbnRcbiAgICogIChpLmUuIGBbc3R5bGVdYCwgYFtjbGFzc11gLCBgW3N0eWxlLnByb3BdYCBvciBgW2NsYXNzLm5hbWVdYClcbiAgICovXG4gIHByaXZhdGUgX2hhc0JpbmRpbmdzID0gZmFsc2U7XG5cbiAgLyoqIHRoZSBpbnB1dCBmb3IgW2NsYXNzXSAoaWYgaXQgZXhpc3RzKSAqL1xuICBwcml2YXRlIF9jbGFzc01hcElucHV0OiBCb3VuZFN0eWxpbmdFbnRyeXxudWxsID0gbnVsbDtcbiAgLyoqIHRoZSBpbnB1dCBmb3IgW3N0eWxlXSAoaWYgaXQgZXhpc3RzKSAqL1xuICBwcml2YXRlIF9zdHlsZU1hcElucHV0OiBCb3VuZFN0eWxpbmdFbnRyeXxudWxsID0gbnVsbDtcbiAgLyoqIGFuIGFycmF5IG9mIGVhY2ggW3N0eWxlLnByb3BdIGlucHV0ICovXG4gIHByaXZhdGUgX3NpbmdsZVN0eWxlSW5wdXRzOiBCb3VuZFN0eWxpbmdFbnRyeVtdfG51bGwgPSBudWxsO1xuICAvKiogYW4gYXJyYXkgb2YgZWFjaCBbY2xhc3MubmFtZV0gaW5wdXQgKi9cbiAgcHJpdmF0ZSBfc2luZ2xlQ2xhc3NJbnB1dHM6IEJvdW5kU3R5bGluZ0VudHJ5W118bnVsbCA9IG51bGw7XG4gIHByaXZhdGUgX2xhc3RTdHlsaW5nSW5wdXQ6IEJvdW5kU3R5bGluZ0VudHJ5fG51bGwgPSBudWxsO1xuXG4gIC8vIG1hcHMgYXJlIHVzZWQgaW5zdGVhZCBvZiBoYXNoIG1hcHMgYmVjYXVzZSBhIE1hcCB3aWxsXG4gIC8vIHJldGFpbiB0aGUgb3JkZXJpbmcgb2YgdGhlIGtleXNcblxuICAvKipcbiAgICogUmVwcmVzZW50cyB0aGUgbG9jYXRpb24gb2YgZWFjaCBzdHlsZSBiaW5kaW5nIGluIHRoZSB0ZW1wbGF0ZVxuICAgKiAoZS5nLiBgPGRpdiBbc3R5bGUud2lkdGhdPVwid1wiIFtzdHlsZS5oZWlnaHRdPVwiaFwiPmAgaW1wbGllc1xuICAgKiB0aGF0IGB3aWR0aD0wYCBhbmQgYGhlaWdodD0xYClcbiAgICovXG4gIHByaXZhdGUgX3N0eWxlc0luZGV4ID0gbmV3IE1hcDxzdHJpbmcsIG51bWJlcj4oKTtcblxuICAvKipcbiAgICogUmVwcmVzZW50cyB0aGUgbG9jYXRpb24gb2YgZWFjaCBjbGFzcyBiaW5kaW5nIGluIHRoZSB0ZW1wbGF0ZVxuICAgKiAoZS5nLiBgPGRpdiBbY2xhc3MuYmlnXT1cImJcIiBbY2xhc3MuaGlkZGVuXT1cImhcIj5gIGltcGxpZXNcbiAgICogdGhhdCBgYmlnPTBgIGFuZCBgaGlkZGVuPTFgKVxuICAgKi9cbiAgcHJpdmF0ZSBfY2xhc3Nlc0luZGV4ID0gbmV3IE1hcDxzdHJpbmcsIG51bWJlcj4oKTtcbiAgcHJpdmF0ZSBfaW5pdGlhbFN0eWxlVmFsdWVzOiBzdHJpbmdbXSA9IFtdO1xuICBwcml2YXRlIF9pbml0aWFsQ2xhc3NWYWx1ZXM6IHN0cmluZ1tdID0gW107XG5cbiAgLy8gY2VydGFpbiBzdHlsZSBwcm9wZXJ0aWVzIEFMV0FZUyBuZWVkIHNhbml0aXphdGlvblxuICAvLyB0aGlzIGlzIGNoZWNrZWQgZWFjaCB0aW1lIG5ldyBzdHlsZXMgYXJlIGVuY291bnRlcmVkXG4gIHByaXZhdGUgX3VzZURlZmF1bHRTYW5pdGl6ZXIgPSBmYWxzZTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9lbGVtZW50SW5kZXhFeHByOiBvLkV4cHJlc3Npb24sIHByaXZhdGUgX2RpcmVjdGl2ZUV4cHI6IG8uRXhwcmVzc2lvbnxudWxsKSB7fVxuXG4gIGhhc0JpbmRpbmdzT3JJbml0aWFsVmFsdWVzKCkgeyByZXR1cm4gdGhpcy5faGFzQmluZGluZ3MgfHwgdGhpcy5faGFzSW5pdGlhbFZhbHVlczsgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgYSBnaXZlbiBpbnB1dCB0byB0aGUgc3R5bGluZyBidWlsZGVyIHRvIGJlIGxhdGVyIHVzZWQgd2hlbiBwcm9kdWNpbmcgQU9UIGNvZGUuXG4gICAqXG4gICAqIFRoZSBjb2RlIGJlbG93IHdpbGwgb25seSBhY2NlcHQgdGhlIGlucHV0IGlmIGl0IGlzIHNvbWVob3cgdGllZCB0byBzdHlsaW5nICh3aGV0aGVyIGl0IGJlXG4gICAqIHN0eWxlL2NsYXNzIGJpbmRpbmdzIG9yIHN0YXRpYyBzdHlsZS9jbGFzcyBhdHRyaWJ1dGVzKS5cbiAgICovXG4gIHJlZ2lzdGVyQm91bmRJbnB1dChpbnB1dDogdC5Cb3VuZEF0dHJpYnV0ZSk6IGJvb2xlYW4ge1xuICAgIC8vIFthdHRyLnN0eWxlXSBvciBbYXR0ci5jbGFzc10gYXJlIHNraXBwZWQgaW4gdGhlIGNvZGUgYmVsb3csXG4gICAgLy8gdGhleSBzaG91bGQgbm90IGJlIHRyZWF0ZWQgYXMgc3R5bGluZy1iYXNlZCBiaW5kaW5ncyBzaW5jZVxuICAgIC8vIHRoZXkgYXJlIGludGVuZGVkIHRvIGJlIHdyaXR0ZW4gZGlyZWN0bHkgdG8gdGhlIGF0dHIgYW5kXG4gICAgLy8gd2lsbCB0aGVyZWZvcmUgc2tpcCBhbGwgc3R5bGUvY2xhc3MgcmVzb2x1dGlvbiB0aGF0IGlzIHByZXNlbnRcbiAgICAvLyB3aXRoIHN0eWxlPVwiXCIsIFtzdHlsZV09XCJcIiBhbmQgW3N0eWxlLnByb3BdPVwiXCIsIGNsYXNzPVwiXCIsXG4gICAgLy8gW2NsYXNzLnByb3BdPVwiXCIuIFtjbGFzc109XCJcIiBhc3NpZ25tZW50c1xuICAgIGNvbnN0IG5hbWUgPSBpbnB1dC5uYW1lO1xuICAgIGxldCBiaW5kaW5nOiBCb3VuZFN0eWxpbmdFbnRyeXxudWxsID0gbnVsbDtcbiAgICBzd2l0Y2ggKGlucHV0LnR5cGUpIHtcbiAgICAgIGNhc2UgQmluZGluZ1R5cGUuUHJvcGVydHk6XG4gICAgICAgIGlmIChuYW1lID09ICdzdHlsZScpIHtcbiAgICAgICAgICBiaW5kaW5nID0gdGhpcy5yZWdpc3RlclN0eWxlSW5wdXQobnVsbCwgaW5wdXQudmFsdWUsICcnLCBpbnB1dC5zb3VyY2VTcGFuKTtcbiAgICAgICAgfSBlbHNlIGlmIChpc0NsYXNzQmluZGluZyhpbnB1dC5uYW1lKSkge1xuICAgICAgICAgIGJpbmRpbmcgPSB0aGlzLnJlZ2lzdGVyQ2xhc3NJbnB1dChudWxsLCBpbnB1dC52YWx1ZSwgaW5wdXQuc291cmNlU3Bhbik7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEJpbmRpbmdUeXBlLlN0eWxlOlxuICAgICAgICBiaW5kaW5nID0gdGhpcy5yZWdpc3RlclN0eWxlSW5wdXQoaW5wdXQubmFtZSwgaW5wdXQudmFsdWUsIGlucHV0LnVuaXQsIGlucHV0LnNvdXJjZVNwYW4pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQmluZGluZ1R5cGUuQ2xhc3M6XG4gICAgICAgIGJpbmRpbmcgPSB0aGlzLnJlZ2lzdGVyQ2xhc3NJbnB1dChpbnB1dC5uYW1lLCBpbnB1dC52YWx1ZSwgaW5wdXQuc291cmNlU3Bhbik7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICByZXR1cm4gYmluZGluZyA/IHRydWUgOiBmYWxzZTtcbiAgfVxuXG4gIHJlZ2lzdGVyU3R5bGVJbnB1dChcbiAgICAgIHByb3BlcnR5TmFtZTogc3RyaW5nfG51bGwsIHZhbHVlOiBBU1QsIHVuaXQ6IHN0cmluZ3xudWxsLFxuICAgICAgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuKTogQm91bmRTdHlsaW5nRW50cnkge1xuICAgIGNvbnN0IGVudHJ5ID0geyBuYW1lOiBwcm9wZXJ0eU5hbWUsIHVuaXQsIHZhbHVlLCBzb3VyY2VTcGFuIH0gYXMgQm91bmRTdHlsaW5nRW50cnk7XG4gICAgaWYgKHByb3BlcnR5TmFtZSkge1xuICAgICAgKHRoaXMuX3NpbmdsZVN0eWxlSW5wdXRzID0gdGhpcy5fc2luZ2xlU3R5bGVJbnB1dHMgfHwgW10pLnB1c2goZW50cnkpO1xuICAgICAgdGhpcy5fdXNlRGVmYXVsdFNhbml0aXplciA9IHRoaXMuX3VzZURlZmF1bHRTYW5pdGl6ZXIgfHwgaXNTdHlsZVNhbml0aXphYmxlKHByb3BlcnR5TmFtZSk7XG4gICAgICByZWdpc3RlckludG9NYXAodGhpcy5fc3R5bGVzSW5kZXgsIHByb3BlcnR5TmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3VzZURlZmF1bHRTYW5pdGl6ZXIgPSB0cnVlO1xuICAgICAgdGhpcy5fc3R5bGVNYXBJbnB1dCA9IGVudHJ5O1xuICAgIH1cbiAgICB0aGlzLl9sYXN0U3R5bGluZ0lucHV0ID0gZW50cnk7XG4gICAgdGhpcy5faGFzQmluZGluZ3MgPSB0cnVlO1xuICAgIHJldHVybiBlbnRyeTtcbiAgfVxuXG4gIHJlZ2lzdGVyQ2xhc3NJbnB1dChjbGFzc05hbWU6IHN0cmluZ3xudWxsLCB2YWx1ZTogQVNULCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4pOlxuICAgICAgQm91bmRTdHlsaW5nRW50cnkge1xuICAgIGNvbnN0IGVudHJ5ID0geyBuYW1lOiBjbGFzc05hbWUsIHZhbHVlLCBzb3VyY2VTcGFuIH0gYXMgQm91bmRTdHlsaW5nRW50cnk7XG4gICAgaWYgKGNsYXNzTmFtZSkge1xuICAgICAgKHRoaXMuX3NpbmdsZUNsYXNzSW5wdXRzID0gdGhpcy5fc2luZ2xlQ2xhc3NJbnB1dHMgfHwgW10pLnB1c2goZW50cnkpO1xuICAgICAgcmVnaXN0ZXJJbnRvTWFwKHRoaXMuX2NsYXNzZXNJbmRleCwgY2xhc3NOYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fY2xhc3NNYXBJbnB1dCA9IGVudHJ5O1xuICAgIH1cbiAgICB0aGlzLl9sYXN0U3R5bGluZ0lucHV0ID0gZW50cnk7XG4gICAgdGhpcy5faGFzQmluZGluZ3MgPSB0cnVlO1xuICAgIHJldHVybiBlbnRyeTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgdGhlIGVsZW1lbnQncyBzdGF0aWMgc3R5bGUgc3RyaW5nIHZhbHVlIHRvIHRoZSBidWlsZGVyLlxuICAgKlxuICAgKiBAcGFyYW0gdmFsdWUgdGhlIHN0eWxlIHN0cmluZyAoZS5nLiBgd2lkdGg6MTAwcHg7IGhlaWdodDoyMDBweDtgKVxuICAgKi9cbiAgcmVnaXN0ZXJTdHlsZUF0dHIodmFsdWU6IHN0cmluZykge1xuICAgIHRoaXMuX2luaXRpYWxTdHlsZVZhbHVlcyA9IHBhcnNlU3R5bGUodmFsdWUpO1xuICAgIHRoaXMuX2hhc0luaXRpYWxWYWx1ZXMgPSB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyB0aGUgZWxlbWVudCdzIHN0YXRpYyBjbGFzcyBzdHJpbmcgdmFsdWUgdG8gdGhlIGJ1aWxkZXIuXG4gICAqXG4gICAqIEBwYXJhbSB2YWx1ZSB0aGUgY2xhc3NOYW1lIHN0cmluZyAoZS5nLiBgZGlzYWJsZWQgZ29sZCB6b29tYClcbiAgICovXG4gIHJlZ2lzdGVyQ2xhc3NBdHRyKHZhbHVlOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9pbml0aWFsQ2xhc3NWYWx1ZXMgPSB2YWx1ZS50cmltKCkuc3BsaXQoL1xccysvZyk7XG4gICAgdGhpcy5faGFzSW5pdGlhbFZhbHVlcyA9IHRydWU7XG4gIH1cblxuICAvKipcbiAgICogQXBwZW5kcyBhbGwgc3R5bGluZy1yZWxhdGVkIGV4cHJlc3Npb25zIHRvIHRoZSBwcm92aWRlZCBhdHRycyBhcnJheS5cbiAgICpcbiAgICogQHBhcmFtIGF0dHJzIGFuIGV4aXN0aW5nIGFycmF5IHdoZXJlIGVhY2ggb2YgdGhlIHN0eWxpbmcgZXhwcmVzc2lvbnNcbiAgICogd2lsbCBiZSBpbnNlcnRlZCBpbnRvLlxuICAgKi9cbiAgcG9wdWxhdGVJbml0aWFsU3R5bGluZ0F0dHJzKGF0dHJzOiBvLkV4cHJlc3Npb25bXSk6IHZvaWQge1xuICAgIC8vIFtDTEFTU19NQVJLRVIsICdmb28nLCAnYmFyJywgJ2JheicgLi4uXVxuICAgIGlmICh0aGlzLl9pbml0aWFsQ2xhc3NWYWx1ZXMubGVuZ3RoKSB7XG4gICAgICBhdHRycy5wdXNoKG8ubGl0ZXJhbChBdHRyaWJ1dGVNYXJrZXIuQ2xhc3NlcykpO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLl9pbml0aWFsQ2xhc3NWYWx1ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgYXR0cnMucHVzaChvLmxpdGVyYWwodGhpcy5faW5pdGlhbENsYXNzVmFsdWVzW2ldKSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gW1NUWUxFX01BUktFUiwgJ3dpZHRoJywgJzIwMHB4JywgJ2hlaWdodCcsICcxMDBweCcsIC4uLl1cbiAgICBpZiAodGhpcy5faW5pdGlhbFN0eWxlVmFsdWVzLmxlbmd0aCkge1xuICAgICAgYXR0cnMucHVzaChvLmxpdGVyYWwoQXR0cmlidXRlTWFya2VyLlN0eWxlcykpO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLl9pbml0aWFsU3R5bGVWYWx1ZXMubGVuZ3RoOyBpICs9IDIpIHtcbiAgICAgICAgYXR0cnMucHVzaChcbiAgICAgICAgICAgIG8ubGl0ZXJhbCh0aGlzLl9pbml0aWFsU3R5bGVWYWx1ZXNbaV0pLCBvLmxpdGVyYWwodGhpcy5faW5pdGlhbFN0eWxlVmFsdWVzW2kgKyAxXSkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBCdWlsZHMgYW4gaW5zdHJ1Y3Rpb24gd2l0aCBhbGwgdGhlIGV4cHJlc3Npb25zIGFuZCBwYXJhbWV0ZXJzIGZvciBgZWxlbWVudEhvc3RBdHRyc2AuXG4gICAqXG4gICAqIFRoZSBpbnN0cnVjdGlvbiBnZW5lcmF0aW9uIGNvZGUgYmVsb3cgaXMgdXNlZCBmb3IgcHJvZHVjaW5nIHRoZSBBT1Qgc3RhdGVtZW50IGNvZGUgd2hpY2ggaXNcbiAgICogcmVzcG9uc2libGUgZm9yIHJlZ2lzdGVyaW5nIGluaXRpYWwgc3R5bGVzICh3aXRoaW4gYSBkaXJlY3RpdmUgaG9zdEJpbmRpbmdzJyBjcmVhdGlvbiBibG9jaylcbiAgICogdG8gdGhlIGRpcmVjdGl2ZSBob3N0IGVsZW1lbnQuXG4gICAqL1xuICBidWlsZERpcmVjdGl2ZUhvc3RBdHRyc0luc3RydWN0aW9uKHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbnxudWxsLCBjb25zdGFudFBvb2w6IENvbnN0YW50UG9vbCk6XG4gICAgICBTdHlsaW5nSW5zdHJ1Y3Rpb258bnVsbCB7XG4gICAgaWYgKHRoaXMuX2hhc0luaXRpYWxWYWx1ZXMgJiYgdGhpcy5fZGlyZWN0aXZlRXhwcikge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc291cmNlU3BhbixcbiAgICAgICAgcmVmZXJlbmNlOiBSMy5lbGVtZW50SG9zdEF0dHJzLFxuICAgICAgICBidWlsZFBhcmFtczogKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IGF0dHJzOiBvLkV4cHJlc3Npb25bXSA9IFtdO1xuICAgICAgICAgIHRoaXMucG9wdWxhdGVJbml0aWFsU3R5bGluZ0F0dHJzKGF0dHJzKTtcbiAgICAgICAgICByZXR1cm4gW3RoaXMuX2RpcmVjdGl2ZUV4cHIgISwgZ2V0Q29uc3RhbnRMaXRlcmFsRnJvbUFycmF5KGNvbnN0YW50UG9vbCwgYXR0cnMpXTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKipcbiAgICogQnVpbGRzIGFuIGluc3RydWN0aW9uIHdpdGggYWxsIHRoZSBleHByZXNzaW9ucyBhbmQgcGFyYW1ldGVycyBmb3IgYGVsZW1lbnRTdHlsaW5nYC5cbiAgICpcbiAgICogVGhlIGluc3RydWN0aW9uIGdlbmVyYXRpb24gY29kZSBiZWxvdyBpcyB1c2VkIGZvciBwcm9kdWNpbmcgdGhlIEFPVCBzdGF0ZW1lbnQgY29kZSB3aGljaCBpc1xuICAgKiByZXNwb25zaWJsZSBmb3IgcmVnaXN0ZXJpbmcgc3R5bGUvY2xhc3MgYmluZGluZ3MgdG8gYW4gZWxlbWVudC5cbiAgICovXG4gIGJ1aWxkRWxlbWVudFN0eWxpbmdJbnN0cnVjdGlvbihzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW58bnVsbCwgY29uc3RhbnRQb29sOiBDb25zdGFudFBvb2wpOlxuICAgICAgU3R5bGluZ0luc3RydWN0aW9ufG51bGwge1xuICAgIGlmICh0aGlzLl9oYXNCaW5kaW5ncykge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc291cmNlU3BhbixcbiAgICAgICAgcmVmZXJlbmNlOiBSMy5lbGVtZW50U3R5bGluZyxcbiAgICAgICAgYnVpbGRQYXJhbXM6ICgpID0+IHtcbiAgICAgICAgICAvLyBhIHN0cmluZyBhcnJheSBvZiBldmVyeSBzdHlsZS1iYXNlZCBiaW5kaW5nXG4gICAgICAgICAgY29uc3Qgc3R5bGVCaW5kaW5nUHJvcHMgPVxuICAgICAgICAgICAgICB0aGlzLl9zaW5nbGVTdHlsZUlucHV0cyA/IHRoaXMuX3NpbmdsZVN0eWxlSW5wdXRzLm1hcChpID0+IG8ubGl0ZXJhbChpLm5hbWUpKSA6IFtdO1xuICAgICAgICAgIC8vIGEgc3RyaW5nIGFycmF5IG9mIGV2ZXJ5IGNsYXNzLWJhc2VkIGJpbmRpbmdcbiAgICAgICAgICBjb25zdCBjbGFzc0JpbmRpbmdOYW1lcyA9XG4gICAgICAgICAgICAgIHRoaXMuX3NpbmdsZUNsYXNzSW5wdXRzID8gdGhpcy5fc2luZ2xlQ2xhc3NJbnB1dHMubWFwKGkgPT4gby5saXRlcmFsKGkubmFtZSkpIDogW107XG5cbiAgICAgICAgICAvLyB0byBzYWx2YWdlIHNwYWNlIGluIHRoZSBBT1QgZ2VuZXJhdGVkIGNvZGUsIHRoZXJlIGlzIG5vIHBvaW50IGluIHBhc3NpbmdcbiAgICAgICAgICAvLyBpbiBgbnVsbGAgaW50byBhIHBhcmFtIGlmIGFueSBmb2xsb3ctdXAgcGFyYW1zIGFyZSBub3QgdXNlZC4gVGhlcmVmb3JlLFxuICAgICAgICAgIC8vIG9ubHkgd2hlbiBhIHRyYWlsaW5nIHBhcmFtIGlzIHVzZWQgdGhlbiBpdCB3aWxsIGJlIGZpbGxlZCB3aXRoIG51bGxzIGluIGJldHdlZW5cbiAgICAgICAgICAvLyAob3RoZXJ3aXNlIGEgc2hvcnRlciBhbW91bnQgb2YgcGFyYW1zIHdpbGwgYmUgZmlsbGVkKS4gVGhlIGNvZGUgYmVsb3cgaGVscHNcbiAgICAgICAgICAvLyBkZXRlcm1pbmUgaG93IG1hbnkgcGFyYW1zIGFyZSByZXF1aXJlZCBpbiB0aGUgZXhwcmVzc2lvbiBjb2RlLlxuICAgICAgICAgIC8vXG4gICAgICAgICAgLy8gbWluIHBhcmFtcyA9PiBlbGVtZW50U3R5bGluZygpXG4gICAgICAgICAgLy8gbWF4IHBhcmFtcyA9PiBlbGVtZW50U3R5bGluZyhjbGFzc0JpbmRpbmdzLCBzdHlsZUJpbmRpbmdzLCBzYW5pdGl6ZXIsIGRpcmVjdGl2ZSlcbiAgICAgICAgICBsZXQgZXhwZWN0ZWROdW1iZXJPZkFyZ3MgPSAwO1xuICAgICAgICAgIGlmICh0aGlzLl9kaXJlY3RpdmVFeHByKSB7XG4gICAgICAgICAgICBleHBlY3RlZE51bWJlck9mQXJncyA9IDQ7XG4gICAgICAgICAgfSBlbHNlIGlmICh0aGlzLl91c2VEZWZhdWx0U2FuaXRpemVyKSB7XG4gICAgICAgICAgICBleHBlY3RlZE51bWJlck9mQXJncyA9IDM7XG4gICAgICAgICAgfSBlbHNlIGlmIChzdHlsZUJpbmRpbmdQcm9wcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGV4cGVjdGVkTnVtYmVyT2ZBcmdzID0gMjtcbiAgICAgICAgICB9IGVsc2UgaWYgKGNsYXNzQmluZGluZ05hbWVzLmxlbmd0aCkge1xuICAgICAgICAgICAgZXhwZWN0ZWROdW1iZXJPZkFyZ3MgPSAxO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IHBhcmFtczogby5FeHByZXNzaW9uW10gPSBbXTtcbiAgICAgICAgICBhZGRQYXJhbShcbiAgICAgICAgICAgICAgcGFyYW1zLCBjbGFzc0JpbmRpbmdOYW1lcy5sZW5ndGggPiAwLFxuICAgICAgICAgICAgICBnZXRDb25zdGFudExpdGVyYWxGcm9tQXJyYXkoY29uc3RhbnRQb29sLCBjbGFzc0JpbmRpbmdOYW1lcyksIDEsXG4gICAgICAgICAgICAgIGV4cGVjdGVkTnVtYmVyT2ZBcmdzKTtcbiAgICAgICAgICBhZGRQYXJhbShcbiAgICAgICAgICAgICAgcGFyYW1zLCBzdHlsZUJpbmRpbmdQcm9wcy5sZW5ndGggPiAwLFxuICAgICAgICAgICAgICBnZXRDb25zdGFudExpdGVyYWxGcm9tQXJyYXkoY29uc3RhbnRQb29sLCBzdHlsZUJpbmRpbmdQcm9wcyksIDIsXG4gICAgICAgICAgICAgIGV4cGVjdGVkTnVtYmVyT2ZBcmdzKTtcbiAgICAgICAgICBhZGRQYXJhbShcbiAgICAgICAgICAgICAgcGFyYW1zLCB0aGlzLl91c2VEZWZhdWx0U2FuaXRpemVyLCBvLmltcG9ydEV4cHIoUjMuZGVmYXVsdFN0eWxlU2FuaXRpemVyKSwgMyxcbiAgICAgICAgICAgICAgZXhwZWN0ZWROdW1iZXJPZkFyZ3MpO1xuICAgICAgICAgIGlmICh0aGlzLl9kaXJlY3RpdmVFeHByKSB7XG4gICAgICAgICAgICBwYXJhbXMucHVzaCh0aGlzLl9kaXJlY3RpdmVFeHByKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHBhcmFtcztcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKipcbiAgICogQnVpbGRzIGFuIGluc3RydWN0aW9uIHdpdGggYWxsIHRoZSBleHByZXNzaW9ucyBhbmQgcGFyYW1ldGVycyBmb3IgYGVsZW1lbnRTdHlsaW5nTWFwYC5cbiAgICpcbiAgICogVGhlIGluc3RydWN0aW9uIGRhdGEgd2lsbCBjb250YWluIGFsbCBleHByZXNzaW9ucyBmb3IgYGVsZW1lbnRTdHlsaW5nTWFwYCB0byBmdW5jdGlvblxuICAgKiB3aGljaCBpbmNsdWRlIHRoZSBgW3N0eWxlXWAgYW5kIGBbY2xhc3NdYCBleHByZXNzaW9uIHBhcmFtcyAoaWYgdGhleSBleGlzdCkgYXMgd2VsbCBhc1xuICAgKiB0aGUgc2FuaXRpemVyIGFuZCBkaXJlY3RpdmUgcmVmZXJlbmNlIGV4cHJlc3Npb24uXG4gICAqL1xuICBidWlsZEVsZW1lbnRTdHlsaW5nTWFwSW5zdHJ1Y3Rpb24odmFsdWVDb252ZXJ0ZXI6IFZhbHVlQ29udmVydGVyKTogU3R5bGluZ0luc3RydWN0aW9ufG51bGwge1xuICAgIGlmICh0aGlzLl9jbGFzc01hcElucHV0IHx8IHRoaXMuX3N0eWxlTWFwSW5wdXQpIHtcbiAgICAgIGNvbnN0IHN0eWxpbmdJbnB1dCA9IHRoaXMuX2NsYXNzTWFwSW5wdXQgISB8fCB0aGlzLl9zdHlsZU1hcElucHV0ICE7XG5cbiAgICAgIC8vIHRoZXNlIHZhbHVlcyBtdXN0IGJlIG91dHNpZGUgb2YgdGhlIHVwZGF0ZSBibG9jayBzbyB0aGF0IHRoZXkgY2FuXG4gICAgICAvLyBiZSBldmFsdXRlZCAodGhlIEFTVCB2aXNpdCBjYWxsKSBkdXJpbmcgY3JlYXRpb24gdGltZSBzbyB0aGF0IGFueVxuICAgICAgLy8gcGlwZXMgY2FuIGJlIHBpY2tlZCB1cCBpbiB0aW1lIGJlZm9yZSB0aGUgdGVtcGxhdGUgaXMgYnVpbHRcbiAgICAgIGNvbnN0IG1hcEJhc2VkQ2xhc3NWYWx1ZSA9XG4gICAgICAgICAgdGhpcy5fY2xhc3NNYXBJbnB1dCA/IHRoaXMuX2NsYXNzTWFwSW5wdXQudmFsdWUudmlzaXQodmFsdWVDb252ZXJ0ZXIpIDogbnVsbDtcbiAgICAgIGNvbnN0IG1hcEJhc2VkU3R5bGVWYWx1ZSA9XG4gICAgICAgICAgdGhpcy5fc3R5bGVNYXBJbnB1dCA/IHRoaXMuX3N0eWxlTWFwSW5wdXQudmFsdWUudmlzaXQodmFsdWVDb252ZXJ0ZXIpIDogbnVsbDtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc291cmNlU3Bhbjogc3R5bGluZ0lucHV0LnNvdXJjZVNwYW4sXG4gICAgICAgIHJlZmVyZW5jZTogUjMuZWxlbWVudFN0eWxpbmdNYXAsXG4gICAgICAgIGJ1aWxkUGFyYW1zOiAoY29udmVydEZuOiAodmFsdWU6IGFueSkgPT4gby5FeHByZXNzaW9uKSA9PiB7XG4gICAgICAgICAgY29uc3QgcGFyYW1zOiBvLkV4cHJlc3Npb25bXSA9IFt0aGlzLl9lbGVtZW50SW5kZXhFeHByXTtcblxuICAgICAgICAgIGlmIChtYXBCYXNlZENsYXNzVmFsdWUpIHtcbiAgICAgICAgICAgIHBhcmFtcy5wdXNoKGNvbnZlcnRGbihtYXBCYXNlZENsYXNzVmFsdWUpKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX3N0eWxlTWFwSW5wdXQpIHtcbiAgICAgICAgICAgIHBhcmFtcy5wdXNoKG8uTlVMTF9FWFBSKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAobWFwQmFzZWRTdHlsZVZhbHVlKSB7XG4gICAgICAgICAgICBwYXJhbXMucHVzaChjb252ZXJ0Rm4obWFwQmFzZWRTdHlsZVZhbHVlKSk7XG4gICAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9kaXJlY3RpdmVFeHByKSB7XG4gICAgICAgICAgICBwYXJhbXMucHVzaChvLk5VTExfRVhQUik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHRoaXMuX2RpcmVjdGl2ZUV4cHIpIHtcbiAgICAgICAgICAgIHBhcmFtcy5wdXNoKHRoaXMuX2RpcmVjdGl2ZUV4cHIpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiBwYXJhbXM7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcHJpdmF0ZSBfYnVpbGRTaW5nbGVJbnB1dHMoXG4gICAgICByZWZlcmVuY2U6IG8uRXh0ZXJuYWxSZWZlcmVuY2UsIGlucHV0czogQm91bmRTdHlsaW5nRW50cnlbXSwgbWFwSW5kZXg6IE1hcDxzdHJpbmcsIG51bWJlcj4sXG4gICAgICBhbGxvd1VuaXRzOiBib29sZWFuLCB2YWx1ZUNvbnZlcnRlcjogVmFsdWVDb252ZXJ0ZXIpOiBTdHlsaW5nSW5zdHJ1Y3Rpb25bXSB7XG4gICAgcmV0dXJuIGlucHV0cy5tYXAoaW5wdXQgPT4ge1xuICAgICAgY29uc3QgYmluZGluZ0luZGV4OiBudW1iZXIgPSBtYXBJbmRleC5nZXQoaW5wdXQubmFtZSkgITtcbiAgICAgIGNvbnN0IHZhbHVlID0gaW5wdXQudmFsdWUudmlzaXQodmFsdWVDb252ZXJ0ZXIpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc291cmNlU3BhbjogaW5wdXQuc291cmNlU3BhbixcbiAgICAgICAgcmVmZXJlbmNlLFxuICAgICAgICBidWlsZFBhcmFtczogKGNvbnZlcnRGbjogKHZhbHVlOiBhbnkpID0+IG8uRXhwcmVzc2lvbikgPT4ge1xuICAgICAgICAgIGNvbnN0IHBhcmFtcyA9IFt0aGlzLl9lbGVtZW50SW5kZXhFeHByLCBvLmxpdGVyYWwoYmluZGluZ0luZGV4KSwgY29udmVydEZuKHZhbHVlKV07XG4gICAgICAgICAgaWYgKGFsbG93VW5pdHMpIHtcbiAgICAgICAgICAgIGlmIChpbnB1dC51bml0KSB7XG4gICAgICAgICAgICAgIHBhcmFtcy5wdXNoKG8ubGl0ZXJhbChpbnB1dC51bml0KSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2RpcmVjdGl2ZUV4cHIpIHtcbiAgICAgICAgICAgICAgcGFyYW1zLnB1c2goby5OVUxMX0VYUFIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh0aGlzLl9kaXJlY3RpdmVFeHByKSB7XG4gICAgICAgICAgICBwYXJhbXMucHVzaCh0aGlzLl9kaXJlY3RpdmVFeHByKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHBhcmFtcztcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2J1aWxkQ2xhc3NJbnB1dHModmFsdWVDb252ZXJ0ZXI6IFZhbHVlQ29udmVydGVyKTogU3R5bGluZ0luc3RydWN0aW9uW10ge1xuICAgIGlmICh0aGlzLl9zaW5nbGVDbGFzc0lucHV0cykge1xuICAgICAgcmV0dXJuIHRoaXMuX2J1aWxkU2luZ2xlSW5wdXRzKFxuICAgICAgICAgIFIzLmVsZW1lbnRDbGFzc1Byb3AsIHRoaXMuX3NpbmdsZUNsYXNzSW5wdXRzLCB0aGlzLl9jbGFzc2VzSW5kZXgsIGZhbHNlLCB2YWx1ZUNvbnZlcnRlcik7XG4gICAgfVxuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIHByaXZhdGUgX2J1aWxkU3R5bGVJbnB1dHModmFsdWVDb252ZXJ0ZXI6IFZhbHVlQ29udmVydGVyKTogU3R5bGluZ0luc3RydWN0aW9uW10ge1xuICAgIGlmICh0aGlzLl9zaW5nbGVTdHlsZUlucHV0cykge1xuICAgICAgcmV0dXJuIHRoaXMuX2J1aWxkU2luZ2xlSW5wdXRzKFxuICAgICAgICAgIFIzLmVsZW1lbnRTdHlsZVByb3AsIHRoaXMuX3NpbmdsZVN0eWxlSW5wdXRzLCB0aGlzLl9zdHlsZXNJbmRleCwgdHJ1ZSwgdmFsdWVDb252ZXJ0ZXIpO1xuICAgIH1cbiAgICByZXR1cm4gW107XG4gIH1cblxuICBwcml2YXRlIF9idWlsZEFwcGx5Rm4oKTogU3R5bGluZ0luc3RydWN0aW9uIHtcbiAgICByZXR1cm4ge1xuICAgICAgc291cmNlU3BhbjogdGhpcy5fbGFzdFN0eWxpbmdJbnB1dCA/IHRoaXMuX2xhc3RTdHlsaW5nSW5wdXQuc291cmNlU3BhbiA6IG51bGwsXG4gICAgICByZWZlcmVuY2U6IFIzLmVsZW1lbnRTdHlsaW5nQXBwbHksXG4gICAgICBidWlsZFBhcmFtczogKCkgPT4ge1xuICAgICAgICBjb25zdCBwYXJhbXM6IG8uRXhwcmVzc2lvbltdID0gW3RoaXMuX2VsZW1lbnRJbmRleEV4cHJdO1xuICAgICAgICBpZiAodGhpcy5fZGlyZWN0aXZlRXhwcikge1xuICAgICAgICAgIHBhcmFtcy5wdXNoKHRoaXMuX2RpcmVjdGl2ZUV4cHIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwYXJhbXM7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb25zdHJ1Y3RzIGFsbCBpbnN0cnVjdGlvbnMgd2hpY2ggY29udGFpbiB0aGUgZXhwcmVzc2lvbnMgdGhhdCB3aWxsIGJlIHBsYWNlZFxuICAgKiBpbnRvIHRoZSB1cGRhdGUgYmxvY2sgb2YgYSB0ZW1wbGF0ZSBmdW5jdGlvbiBvciBhIGRpcmVjdGl2ZSBob3N0QmluZGluZ3MgZnVuY3Rpb24uXG4gICAqL1xuICBidWlsZFVwZGF0ZUxldmVsSW5zdHJ1Y3Rpb25zKHZhbHVlQ29udmVydGVyOiBWYWx1ZUNvbnZlcnRlcikge1xuICAgIGNvbnN0IGluc3RydWN0aW9uczogU3R5bGluZ0luc3RydWN0aW9uW10gPSBbXTtcbiAgICBpZiAodGhpcy5faGFzQmluZGluZ3MpIHtcbiAgICAgIGNvbnN0IG1hcEluc3RydWN0aW9uID0gdGhpcy5idWlsZEVsZW1lbnRTdHlsaW5nTWFwSW5zdHJ1Y3Rpb24odmFsdWVDb252ZXJ0ZXIpO1xuICAgICAgaWYgKG1hcEluc3RydWN0aW9uKSB7XG4gICAgICAgIGluc3RydWN0aW9ucy5wdXNoKG1hcEluc3RydWN0aW9uKTtcbiAgICAgIH1cbiAgICAgIGluc3RydWN0aW9ucy5wdXNoKC4uLnRoaXMuX2J1aWxkU3R5bGVJbnB1dHModmFsdWVDb252ZXJ0ZXIpKTtcbiAgICAgIGluc3RydWN0aW9ucy5wdXNoKC4uLnRoaXMuX2J1aWxkQ2xhc3NJbnB1dHModmFsdWVDb252ZXJ0ZXIpKTtcbiAgICAgIGluc3RydWN0aW9ucy5wdXNoKHRoaXMuX2J1aWxkQXBwbHlGbigpKTtcbiAgICB9XG4gICAgcmV0dXJuIGluc3RydWN0aW9ucztcbiAgfVxufVxuXG5mdW5jdGlvbiBpc0NsYXNzQmluZGluZyhuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIG5hbWUgPT0gJ2NsYXNzTmFtZScgfHwgbmFtZSA9PSAnY2xhc3MnO1xufVxuXG5mdW5jdGlvbiByZWdpc3RlckludG9NYXAobWFwOiBNYXA8c3RyaW5nLCBudW1iZXI+LCBrZXk6IHN0cmluZykge1xuICBpZiAoIW1hcC5oYXMoa2V5KSkge1xuICAgIG1hcC5zZXQoa2V5LCBtYXAuc2l6ZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNTdHlsZVNhbml0aXphYmxlKHByb3A6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gcHJvcCA9PT0gJ2JhY2tncm91bmQtaW1hZ2UnIHx8IHByb3AgPT09ICdiYWNrZ3JvdW5kJyB8fCBwcm9wID09PSAnYm9yZGVyLWltYWdlJyB8fFxuICAgICAgcHJvcCA9PT0gJ2ZpbHRlcicgfHwgcHJvcCA9PT0gJ2xpc3Qtc3R5bGUnIHx8IHByb3AgPT09ICdsaXN0LXN0eWxlLWltYWdlJztcbn1cblxuLyoqXG4gKiBTaW1wbGUgaGVscGVyIGZ1bmN0aW9uIHRvIGVpdGhlciBwcm92aWRlIHRoZSBjb25zdGFudCBsaXRlcmFsIHRoYXQgd2lsbCBob3VzZSB0aGUgdmFsdWVcbiAqIGhlcmUgb3IgYSBudWxsIHZhbHVlIGlmIHRoZSBwcm92aWRlZCB2YWx1ZXMgYXJlIGVtcHR5LlxuICovXG5mdW5jdGlvbiBnZXRDb25zdGFudExpdGVyYWxGcm9tQXJyYXkoXG4gICAgY29uc3RhbnRQb29sOiBDb25zdGFudFBvb2wsIHZhbHVlczogby5FeHByZXNzaW9uW10pOiBvLkV4cHJlc3Npb24ge1xuICByZXR1cm4gdmFsdWVzLmxlbmd0aCA/IGNvbnN0YW50UG9vbC5nZXRDb25zdExpdGVyYWwoby5saXRlcmFsQXJyKHZhbHVlcyksIHRydWUpIDogby5OVUxMX0VYUFI7XG59XG5cbi8qKlxuICogU2ltcGxlIGhlbHBlciBmdW5jdGlvbiB0aGF0IGFkZHMgYSBwYXJhbWV0ZXIgb3IgZG9lcyBub3RoaW5nIGF0IGFsbCBkZXBlbmRpbmcgb24gdGhlIHByb3ZpZGVkXG4gKiBwcmVkaWNhdGUgYW5kIHRvdGFsRXhwZWN0ZWRBcmdzIHZhbHVlc1xuICovXG5mdW5jdGlvbiBhZGRQYXJhbShcbiAgICBwYXJhbXM6IG8uRXhwcmVzc2lvbltdLCBwcmVkaWNhdGU6IGJvb2xlYW4sIHZhbHVlOiBvLkV4cHJlc3Npb24sIGFyZ051bWJlcjogbnVtYmVyLFxuICAgIHRvdGFsRXhwZWN0ZWRBcmdzOiBudW1iZXIpIHtcbiAgaWYgKHByZWRpY2F0ZSkge1xuICAgIHBhcmFtcy5wdXNoKHZhbHVlKTtcbiAgfSBlbHNlIGlmIChhcmdOdW1iZXIgPCB0b3RhbEV4cGVjdGVkQXJncykge1xuICAgIHBhcmFtcy5wdXNoKG8uTlVMTF9FWFBSKTtcbiAgfVxufVxuIl19