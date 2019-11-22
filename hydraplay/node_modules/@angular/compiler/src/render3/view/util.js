/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler/src/render3/view/util", ["require", "exports", "tslib", "@angular/compiler/src/output/output_ast", "@angular/compiler/src/util", "@angular/compiler/src/render3/view/i18n/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var o = require("@angular/compiler/src/output/output_ast");
    var util_1 = require("@angular/compiler/src/util");
    var util_2 = require("@angular/compiler/src/render3/view/i18n/util");
    /** Name of the temporary to use during data binding */
    exports.TEMPORARY_NAME = '_t';
    /** Name of the context parameter passed into a template function */
    exports.CONTEXT_NAME = 'ctx';
    /** Name of the RenderFlag passed into a template function */
    exports.RENDER_FLAGS = 'rf';
    /** The prefix reference variables */
    exports.REFERENCE_PREFIX = '_r';
    /** The name of the implicit context reference */
    exports.IMPLICIT_REFERENCE = '$implicit';
    /** Non bindable attribute name **/
    exports.NON_BINDABLE_ATTR = 'ngNonBindable';
    /**
     * Creates an allocator for a temporary variable.
     *
     * A variable declaration is added to the statements the first time the allocator is invoked.
     */
    function temporaryAllocator(statements, name) {
        var temp = null;
        return function () {
            if (!temp) {
                statements.push(new o.DeclareVarStmt(exports.TEMPORARY_NAME, undefined, o.DYNAMIC_TYPE));
                temp = o.variable(name);
            }
            return temp;
        };
    }
    exports.temporaryAllocator = temporaryAllocator;
    function unsupported(feature) {
        if (this) {
            throw new Error("Builder " + this.constructor.name + " doesn't support " + feature + " yet");
        }
        throw new Error("Feature " + feature + " is not supported yet");
    }
    exports.unsupported = unsupported;
    function invalid(arg) {
        throw new Error("Invalid state: Visitor " + this.constructor.name + " doesn't handle " + o.constructor.name);
    }
    exports.invalid = invalid;
    function asLiteral(value) {
        if (Array.isArray(value)) {
            return o.literalArr(value.map(asLiteral));
        }
        return o.literal(value, o.INFERRED_TYPE);
    }
    exports.asLiteral = asLiteral;
    function conditionallyCreateMapObjectLiteral(keys, keepDeclared) {
        if (Object.getOwnPropertyNames(keys).length > 0) {
            return mapToExpression(keys, keepDeclared);
        }
        return null;
    }
    exports.conditionallyCreateMapObjectLiteral = conditionallyCreateMapObjectLiteral;
    function mapToExpression(map, keepDeclared) {
        return o.literalMap(Object.getOwnPropertyNames(map).map(function (key) {
            var _a, _b;
            // canonical syntax: `dirProp: publicProp`
            // if there is no `:`, use dirProp = elProp
            var value = map[key];
            var declaredName;
            var publicName;
            var minifiedName;
            if (Array.isArray(value)) {
                _a = tslib_1.__read(value, 2), publicName = _a[0], declaredName = _a[1];
            }
            else {
                _b = tslib_1.__read(util_1.splitAtColon(key, [key, value]), 2), declaredName = _b[0], publicName = _b[1];
            }
            minifiedName = declaredName;
            return {
                key: minifiedName,
                quoted: false,
                value: (keepDeclared && publicName !== declaredName) ?
                    o.literalArr([asLiteral(publicName), asLiteral(declaredName)]) :
                    asLiteral(publicName)
            };
        }));
    }
    /**
     *  Remove trailing null nodes as they are implied.
     */
    function trimTrailingNulls(parameters) {
        while (o.isNull(parameters[parameters.length - 1])) {
            parameters.pop();
        }
        return parameters;
    }
    exports.trimTrailingNulls = trimTrailingNulls;
    function getQueryPredicate(query, constantPool) {
        if (Array.isArray(query.predicate)) {
            var predicate_1 = [];
            query.predicate.forEach(function (selector) {
                // Each item in predicates array may contain strings with comma-separated refs
                // (for ex. 'ref, ref1, ..., refN'), thus we extract individual refs and store them
                // as separate array entities
                var selectors = selector.split(',').map(function (token) { return o.literal(token.trim()); });
                predicate_1.push.apply(predicate_1, tslib_1.__spread(selectors));
            });
            return constantPool.getConstLiteral(o.literalArr(predicate_1), true);
        }
        else {
            return query.predicate;
        }
    }
    exports.getQueryPredicate = getQueryPredicate;
    function noop() { }
    exports.noop = noop;
    var DefinitionMap = /** @class */ (function () {
        function DefinitionMap() {
            this.values = [];
        }
        DefinitionMap.prototype.set = function (key, value) {
            if (value) {
                this.values.push({ key: key, value: value, quoted: false });
            }
        };
        DefinitionMap.prototype.toLiteralMap = function () { return o.literalMap(this.values); };
        return DefinitionMap;
    }());
    exports.DefinitionMap = DefinitionMap;
    /**
     * Extract a map of properties to values for a given element or template node, which can be used
     * by the directive matching machinery.
     *
     * @param elOrTpl the element or template in question
     * @return an object set up for directive matching. For attributes on the element/template, this
     * object maps a property name to its (static) value. For any bindings, this map simply maps the
     * property name to an empty string.
     */
    function getAttrsForDirectiveMatching(elOrTpl) {
        var attributesMap = {};
        elOrTpl.attributes.forEach(function (a) {
            if (!util_2.isI18nAttribute(a.name)) {
                attributesMap[a.name] = a.value;
            }
        });
        elOrTpl.inputs.forEach(function (i) { attributesMap[i.name] = ''; });
        elOrTpl.outputs.forEach(function (o) { attributesMap[o.name] = ''; });
        return attributesMap;
    }
    exports.getAttrsForDirectiveMatching = getAttrsForDirectiveMatching;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9yZW5kZXIzL3ZpZXcvdXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFHSCwyREFBNkM7SUFDN0MsbURBQXdDO0lBR3hDLHFFQUE0QztJQUU1Qyx1REFBdUQ7SUFDMUMsUUFBQSxjQUFjLEdBQUcsSUFBSSxDQUFDO0lBRW5DLG9FQUFvRTtJQUN2RCxRQUFBLFlBQVksR0FBRyxLQUFLLENBQUM7SUFFbEMsNkRBQTZEO0lBQ2hELFFBQUEsWUFBWSxHQUFHLElBQUksQ0FBQztJQUVqQyxxQ0FBcUM7SUFDeEIsUUFBQSxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7SUFFckMsaURBQWlEO0lBQ3BDLFFBQUEsa0JBQWtCLEdBQUcsV0FBVyxDQUFDO0lBRTlDLG1DQUFtQztJQUN0QixRQUFBLGlCQUFpQixHQUFHLGVBQWUsQ0FBQztJQUVqRDs7OztPQUlHO0lBQ0gsU0FBZ0Isa0JBQWtCLENBQUMsVUFBeUIsRUFBRSxJQUFZO1FBQ3hFLElBQUksSUFBSSxHQUF1QixJQUFJLENBQUM7UUFDcEMsT0FBTztZQUNMLElBQUksQ0FBQyxJQUFJLEVBQUU7Z0JBQ1QsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxjQUFjLENBQUMsc0JBQWMsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7Z0JBQ2pGLElBQUksR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ3pCO1lBQ0QsT0FBTyxJQUFJLENBQUM7UUFDZCxDQUFDLENBQUM7SUFDSixDQUFDO0lBVEQsZ0RBU0M7SUFHRCxTQUFnQixXQUFXLENBQUMsT0FBZTtRQUN6QyxJQUFJLElBQUksRUFBRTtZQUNSLE1BQU0sSUFBSSxLQUFLLENBQUMsYUFBVyxJ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RCxPQUFPLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxVQUFBLENBQUM7WUFDMUIsSUFBSSxDQUFDLHNCQUFlLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUM1QixhQUFhLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUM7YUFDakM7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUNILE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQUEsQ0FBQyxJQUFNLGFBQWEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDN0QsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBQSxDQUFDLElBQU0sYUFBYSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUU5RCxPQUFPLGFBQWEsQ0FBQztJQUN2QixDQUFDO0lBYkQsb0VBYUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q29uc3RhbnRQb29sfSBmcm9tICcuLi8uLi9jb25zdGFudF9wb29sJztcbmltcG9ydCAqIGFzIG8gZnJvbSAnLi4vLi4vb3V0cHV0L291dHB1dF9hc3QnO1xuaW1wb3J0IHtzcGxpdEF0Q29sb259IGZyb20gJy4uLy4uL3V0aWwnO1xuaW1wb3J0ICogYXMgdCBmcm9tICcuLi9yM19hc3QnO1xuaW1wb3J0IHtSM1F1ZXJ5TWV0YWRhdGF9IGZyb20gJy4vYXBpJztcbmltcG9ydCB7aXNJMThuQXR0cmlidXRlfSBmcm9tICcuL2kxOG4vdXRpbCc7XG5cbi8qKiBOYW1lIG9mIHRoZSB0ZW1wb3JhcnkgdG8gdXNlIGR1cmluZyBkYXRhIGJpbmRpbmcgKi9cbmV4cG9ydCBjb25zdCBURU1QT1JBUllfTkFNRSA9ICdfdCc7XG5cbi8qKiBOYW1lIG9mIHRoZSBjb250ZXh0IHBhcmFtZXRlciBwYXNzZWQgaW50byBhIHRlbXBsYXRlIGZ1bmN0aW9uICovXG5leHBvcnQgY29uc3QgQ09OVEVYVF9OQU1FID0gJ2N0eCc7XG5cbi8qKiBOYW1lIG9mIHRoZSBSZW5kZXJGbGFnIHBhc3NlZCBpbnRvIGEgdGVtcGxhdGUgZnVuY3Rpb24gKi9cbmV4cG9ydCBjb25zdCBSRU5ERVJfRkxBR1MgPSAncmYnO1xuXG4vKiogVGhlIHByZWZpeCByZWZlcmVuY2UgdmFyaWFibGVzICovXG5leHBvcnQgY29uc3QgUkVGRVJFTkNFX1BSRUZJWCA9ICdfcic7XG5cbi8qKiBUaGUgbmFtZSBvZiB0aGUgaW1wbGljaXQgY29udGV4dCByZWZlcmVuY2UgKi9cbmV4cG9ydCBjb25zdCBJTVBMSUNJVF9SRUZFUkVOQ0UgPSAnJGltcGxpY2l0JztcblxuLyoqIE5vbiBiaW5kYWJsZSBhdHRyaWJ1dGUgbmFtZSAqKi9cbmV4cG9ydCBjb25zdCBOT05fQklOREFCTEVfQVRUUiA9ICduZ05vbkJpbmRhYmxlJztcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGFsbG9jYXRvciBmb3IgYSB0ZW1wb3JhcnkgdmFyaWFibGUuXG4gKlxuICogQSB2YXJpYWJsZSBkZWNsYXJhdGlvbiBpcyBhZGRlZCB0byB0aGUgc3RhdGVtZW50cyB0aGUgZmlyc3QgdGltZSB0aGUgYWxsb2NhdG9yIGlzIGludm9rZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0ZW1wb3JhcnlBbGxvY2F0b3Ioc3RhdGVtZW50czogby5TdGF0ZW1lbnRbXSwgbmFtZTogc3RyaW5nKTogKCkgPT4gby5SZWFkVmFyRXhwciB7XG4gIGxldCB0ZW1wOiBvLlJlYWRWYXJFeHByfG51bGwgPSBudWxsO1xuICByZXR1cm4gKCkgPT4ge1xuICAgIGlmICghdGVtcCkge1xuICAgICAgc3RhdGVtZW50cy5wdXNoKG5ldyBvLkRlY2xhcmVWYXJTdG10KFRFTVBPUkFSWV9OQU1FLCB1bmRlZmluZWQsIG8uRFlOQU1JQ19UWVBFKSk7XG4gICAgICB0ZW1wID0gby52YXJpYWJsZShuYW1lKTtcbiAgICB9XG4gICAgcmV0dXJuIHRlbXA7XG4gIH07XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHVuc3VwcG9ydGVkKGZlYXR1cmU6IHN0cmluZyk6IG5ldmVyIHtcbiAgaWYgKHRoaXMpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEJ1aWxkZXIgJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9IGRvZXNuJ3Qgc3VwcG9ydCAke2ZlYXR1cmV9IHlldGApO1xuICB9XG4gIHRocm93IG5ldyBFcnJvcihgRmVhdHVyZSAke2ZlYXR1cmV9IGlzIG5vdCBzdXBwb3J0ZWQgeWV0YCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbnZhbGlkPFQ+KGFyZzogby5FeHByZXNzaW9uIHwgby5TdGF0ZW1lbnQgfCB0Lk5vZGUpOiBuZXZlciB7XG4gIHRocm93IG5ldyBFcnJvcihcbiAgICAgIGBJbnZhbGlkIHN0YXRlOiBWaXNpdG9yICR7dGhpcy5jb25zdHJ1Y3Rvci5uYW1lfSBkb2Vzbid0IGhhbmRsZSAke28uY29uc3RydWN0b3IubmFtZX1gKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFzTGl0ZXJhbCh2YWx1ZTogYW55KTogby5FeHByZXNzaW9uIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgcmV0dXJuIG8ubGl0ZXJhbEFycih2YWx1ZS5tYXAoYXNMaXRlcmFsKSk7XG4gIH1cbiAgcmV0dXJuIG8ubGl0ZXJhbCh2YWx1ZSwgby5JTkZFUlJFRF9UWVBFKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbmRpdGlvbmFsbHlDcmVhdGVNYXBPYmplY3RMaXRlcmFsKFxuICAgIGtleXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmcgfCBzdHJpbmdbXX0sIGtlZXBEZWNsYXJlZD86IGJvb2xlYW4pOiBvLkV4cHJlc3Npb258bnVsbCB7XG4gIGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhrZXlzKS5sZW5ndGggPiAwKSB7XG4gICAgcmV0dXJuIG1hcFRvRXhwcmVzc2lvbihrZXlzLCBrZWVwRGVjbGFyZWQpO1xuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG5mdW5jdGlvbiBtYXBUb0V4cHJlc3Npb24oXG4gICAgbWFwOiB7W2tleTogc3RyaW5nXTogc3RyaW5nIHwgc3RyaW5nW119LCBrZWVwRGVjbGFyZWQ/OiBib29sZWFuKTogby5FeHByZXNzaW9uIHtcbiAgcmV0dXJuIG8ubGl0ZXJhbE1hcChPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhtYXApLm1hcChrZXkgPT4ge1xuICAgIC8vIGNhbm9uaWNhbCBzeW50YXg6IGBkaXJQcm9wOiBwdWJsaWNQcm9wYFxuICAgIC8vIGlmIHRoZXJlIGlzIG5vIGA6YCwgdXNlIGRpclByb3AgPSBlbFByb3BcbiAgICBjb25zdCB2YWx1ZSA9IG1hcFtrZXldO1xuICAgIGxldCBkZWNsYXJlZE5hbWU6IHN0cmluZztcbiAgICBsZXQgcHVibGljTmFtZTogc3RyaW5nO1xuICAgIGxldCBtaW5pZmllZE5hbWU6IHN0cmluZztcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgIFtwdWJsaWNOYW1lLCBkZWNsYXJlZE5hbWVdID0gdmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIFtkZWNsYXJlZE5hbWUsIHB1YmxpY05hbWVdID0gc3BsaXRBdENvbG9uKGtleSwgW2tleSwgdmFsdWVdKTtcbiAgICB9XG4gICAgbWluaWZpZWROYW1lID0gZGVjbGFyZWROYW1lO1xuICAgIHJldHVybiB7XG4gICAgICBrZXk6IG1pbmlmaWVkTmFtZSxcbiAgICAgIHF1b3RlZDogZmFsc2UsXG4gICAgICB2YWx1ZTogKGtlZXBEZWNsYXJlZCAmJiBwdWJsaWNOYW1lICE9PSBkZWNsYXJlZE5hbWUpID9cbiAgICAgICAgICBvLmxpdGVyYWxBcnIoW2FzTGl0ZXJhbChwdWJsaWNOYW1lKSwgYXNMaXRlcmFsKGRlY2xhcmVkTmFtZSldKSA6XG4gICAgICAgICAgYXNMaXRlcmFsKHB1YmxpY05hbWUpXG4gICAgfTtcbiAgfSkpO1xufVxuXG4vKipcbiAqICBSZW1vdmUgdHJhaWxpbmcgbnVsbCBub2RlcyBhcyB0aGV5IGFyZSBpbXBsaWVkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJpbVRyYWlsaW5nTnVsbHMocGFyYW1ldGVyczogby5FeHByZXNzaW9uW10pOiBvLkV4cHJlc3Npb25bXSB7XG4gIHdoaWxlIChvLmlzTnVsbChwYXJhbWV0ZXJzW3BhcmFtZXRlcnMubGVuZ3RoIC0gMV0pKSB7XG4gICAgcGFyYW1ldGVycy5wb3AoKTtcbiAgfVxuICByZXR1cm4gcGFyYW1ldGVycztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFF1ZXJ5UHJlZGljYXRlKFxuICAgIHF1ZXJ5OiBSM1F1ZXJ5TWV0YWRhdGEsIGNvbnN0YW50UG9vbDogQ29uc3RhbnRQb29sKTogby5FeHByZXNzaW9uIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkocXVlcnkucHJlZGljYXRlKSkge1xuICAgIGxldCBwcmVkaWNhdGU6IG8uRXhwcmVzc2lvbltdID0gW107XG4gICAgcXVlcnkucHJlZGljYXRlLmZvckVhY2goKHNlbGVjdG9yOiBzdHJpbmcpOiB2b2lkID0+IHtcbiAgICAgIC8vIEVhY2ggaXRlbSBpbiBwcmVkaWNhdGVzIGFycmF5IG1heSBjb250YWluIHN0cmluZ3Mgd2l0aCBjb21tYS1zZXBhcmF0ZWQgcmVmc1xuICAgICAgLy8gKGZvciBleC4gJ3JlZiwgcmVmMSwgLi4uLCByZWZOJyksIHRodXMgd2UgZXh0cmFjdCBpbmRpdmlkdWFsIHJlZnMgYW5kIHN0b3JlIHRoZW1cbiAgICAgIC8vIGFzIHNlcGFyYXRlIGFycmF5IGVudGl0aWVzXG4gICAgICBjb25zdCBzZWxlY3RvcnMgPSBzZWxlY3Rvci5zcGxpdCgnLCcpLm1hcCh0b2tlbiA9PiBvLmxpdGVyYWwodG9rZW4udHJpbSgpKSk7XG4gICAgICBwcmVkaWNhdGUucHVzaCguLi5zZWxlY3RvcnMpO1xuICAgIH0pO1xuICAgIHJldHVybiBjb25zdGFudFBvb2wuZ2V0Q29uc3RMaXRlcmFsKG8ubGl0ZXJhbEFycihwcmVkaWNhdGUpLCB0cnVlKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gcXVlcnkucHJlZGljYXRlO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBub29wKCkge31cblxuZXhwb3J0IGNsYXNzIERlZmluaXRpb25NYXAge1xuICB2YWx1ZXM6IHtrZXk6IHN0cmluZywgcXVvdGVkOiBib29sZWFuLCB2YWx1ZTogby5FeHByZXNzaW9ufVtdID0gW107XG5cbiAgc2V0KGtleTogc3RyaW5nLCB2YWx1ZTogby5FeHByZXNzaW9ufG51bGwpOiB2b2lkIHtcbiAgICBpZiAodmFsdWUpIHtcbiAgICAgIHRoaXMudmFsdWVzLnB1c2goe2tleSwgdmFsdWUsIHF1b3RlZDogZmFsc2V9KTtcbiAgICB9XG4gIH1cblxuICB0b0xpdGVyYWxNYXAoKTogby5MaXRlcmFsTWFwRXhwciB7IHJldHVybiBvLmxpdGVyYWxNYXAodGhpcy52YWx1ZXMpOyB9XG59XG5cbi8qKlxuICogRXh0cmFjdCBhIG1hcCBvZiBwcm9wZXJ0aWVzIHRvIHZhbHVlcyBmb3IgYSBnaXZlbiBlbGVtZW50IG9yIHRlbXBsYXRlIG5vZGUsIHdoaWNoIGNhbiBiZSB1c2VkXG4gKiBieSB0aGUgZGlyZWN0aXZlIG1hdGNoaW5nIG1hY2hpbmVyeS5cbiAqXG4gKiBAcGFyYW0gZWxPclRwbCB0aGUgZWxlbWVudCBvciB0ZW1wbGF0ZSBpbiBxdWVzdGlvblxuICogQHJldHVybiBhbiBvYmplY3Qgc2V0IHVwIGZvciBkaXJlY3RpdmUgbWF0Y2hpbmcuIEZvciBhdHRyaWJ1dGVzIG9uIHRoZSBlbGVtZW50L3RlbXBsYXRlLCB0aGlzXG4gKiBvYmplY3QgbWFwcyBhIHByb3BlcnR5IG5hbWUgdG8gaXRzIChzdGF0aWMpIHZhbHVlLiBGb3IgYW55IGJpbmRpbmdzLCB0aGlzIG1hcCBzaW1wbHkgbWFwcyB0aGVcbiAqIHByb3BlcnR5IG5hbWUgdG8gYW4gZW1wdHkgc3RyaW5nLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QXR0cnNGb3JEaXJlY3RpdmVNYXRjaGluZyhlbE9yVHBsOiB0LkVsZW1lbnQgfCB0LlRlbXBsYXRlKTpcbiAgICB7W25hbWU6IHN0cmluZ106IHN0cmluZ30ge1xuICBjb25zdCBhdHRyaWJ1dGVzTWFwOiB7W25hbWU6IHN0cmluZ106IHN0cmluZ30gPSB7fTtcblxuICBlbE9yVHBsLmF0dHJpYnV0ZXMuZm9yRWFjaChhID0+IHtcbiAgICBpZiAoIWlzSTE4bkF0dHJpYnV0ZShhLm5hbWUpKSB7XG4gICAgICBhdHRyaWJ1dGVzTWFwW2EubmFtZV0gPSBhLnZhbHVlO1xuICAgIH1cbiAgfSk7XG4gIGVsT3JUcGwuaW5wdXRzLmZvckVhY2goaSA9PiB7IGF0dHJpYnV0ZXNNYXBbaS5uYW1lXSA9ICcnOyB9KTtcbiAgZWxPclRwbC5vdXRwdXRzLmZvckVhY2gobyA9PiB7IGF0dHJpYnV0ZXNNYXBbby5uYW1lXSA9ICcnOyB9KTtcblxuICByZXR1cm4gYXR0cmlidXRlc01hcDtcbn1cbiJdfQ==