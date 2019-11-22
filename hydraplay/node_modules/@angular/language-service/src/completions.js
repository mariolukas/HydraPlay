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
        define("@angular/language-service/src/completions", ["require", "exports", "tslib", "@angular/compiler", "@angular/compiler-cli/src/language_services", "@angular/language-service/src/expressions", "@angular/language-service/src/html_info", "@angular/language-service/src/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var compiler_1 = require("@angular/compiler");
    var language_services_1 = require("@angular/compiler-cli/src/language_services");
    var expressions_1 = require("@angular/language-service/src/expressions");
    var html_info_1 = require("@angular/language-service/src/html_info");
    var utils_1 = require("@angular/language-service/src/utils");
    var TEMPLATE_ATTR_PREFIX = '*';
    var hiddenHtmlElements = {
        html: true,
        script: true,
        noscript: true,
        base: true,
        body: true,
        title: true,
        head: true,
        link: true,
    };
    function getTemplateCompletions(templateInfo) {
        var result = undefined;
        var htmlAst = templateInfo.htmlAst, templateAst = templateInfo.templateAst, template = templateInfo.template;
        // The templateNode starts at the delimiter character so we add 1 to skip it.
        if (templateInfo.position != null) {
            var templatePosition_1 = templateInfo.position - template.span.start;
            var path_1 = compiler_1.findNode(htmlAst, templatePosition_1);
            var mostSpecific = path_1.tail;
            if (path_1.empty || !mostSpecific) {
                result = elementCompletions(templateInfo, path_1);
            }
            else {
                var astPosition_1 = templatePosition_1 - mostSpecific.sourceSpan.start.offset;
                mostSpecific.visit({
                    visitElement: function (ast) {
                        var startTagSpan = utils_1.spanOf(ast.sourceSpan);
                        var tagLen = ast.name.length;
                        if (templatePosition_1 <=
                            startTagSpan.start + tagLen + 1 /* 1 for the opening angle bracked */) {
                            // If we are in the tag then return the element completions.
                            result = elementCompletions(templateInfo, path_1);
                        }
                        else if (templatePosition_1 < startTagSpan.end) {
                            // We are in the attribute section of the element (but not in an attribute).
                            // Return the attribute completions.
                            result = attributeCompletions(templateInfo, path_1);
                        }
                    },
                    visitAttribute: function (ast) {
                        if (!ast.valueSpan || !utils_1.inSpan(templatePosition_1, utils_1.spanOf(ast.valueSpan))) {
                            // We are in the name of an attribute. Show attribute completions.
                            result = attributeCompletions(templateInfo, path_1);
                        }
                        else if (ast.valueSpan && utils_1.inSpan(templatePosition_1, utils_1.spanOf(ast.valueSpan))) {
                            result = attributeValueCompletions(templateInfo, templatePosition_1, ast);
                        }
                    },
                    visitText: function (ast) {
                        // Check if we are in a entity.
                        result = entityCompletions(getSourceText(template, utils_1.spanOf(ast)), astPosition_1);
                        if (result)
                            return result;
                        result = interpolationCompletions(templateInfo, templatePosition_1);
                        if (result)
                            return result;
                        var element = path_1.first(compiler_1.Element);
                        if (element) {
                            var definition = compiler_1.getHtmlTagDefinition(element.name);
                            if (definition.contentType === compiler_1.TagContentType.PARSABLE_DATA) {
                                result = voidElementAttributeCompletions(templateInfo, path_1);
                                if (!result) {
                                    // If the element can hold content Show element completions.
                                    result = elementCompletions(templateInfo, path_1);
                                }
                            }
                        }
                        else {
                            // If no element container, implies parsable data so show elements.
                            result = voidElementAttributeCompletions(templateInfo, path_1);
                            if (!result) {
                                result = elementCompletions(templateInfo, path_1);
                            }
                        }
                    },
                    visitComment: function (ast) { },
                    visitExpansion: function (ast) { },
                    visitExpansionCase: function (ast) { }
                }, null);
            }
        }
        return result;
    }
    exports.getTemplateCompletions = getTemplateCompletions;
    function attributeCompletions(info, path) {
        var item = path.tail instanceof compiler_1.Element ? path.tail : path.parentOf(path.tail);
        if (item instanceof compiler_1.Element) {
            return attributeCompletionsForElement(info, item.name, item);
        }
        return undefined;
    }
    function attributeCompletionsForElement(info, elementName, element) {
        var attributes = getAttributeInfosForElement(info, elementName, element);
        // Map all the attributes to a completion
        return attributes.map(function (attr) { return ({
            kind: attr.fromHtml ? 'html attribute' : 'attribute',
            name: nameOfAttr(attr),
            sort: attr.name
        }); });
    }
    function getAttributeInfosForElement(info, elementName, element) {
        var attributes = [];
        // Add html attributes
        var htmlAttributes = html_info_1.attributeNames(elementName) || [];
        if (htmlAttributes) {
            attributes.push.apply(attributes, tslib_1.__spread(htmlAttributes.map(function (name) { return ({ name: name, fromHtml: true }); })));
        }
        // Add html properties
        var htmlProperties = html_info_1.propertyNames(elementName);
        if (htmlProperties) {
            attributes.push.apply(attributes, tslib_1.__spread(htmlProperties.map(function (name) { return ({ name: name, input: true }); })));
        }
        // Add html events
        var htmlEvents = html_info_1.eventNames(elementName);
        if (htmlEvents) {
            attributes.push.apply(attributes, tslib_1.__spread(htmlEvents.map(function (name) { return ({ name: name, output: true }); })));
        }
        var _a = utils_1.getSelectors(info), selectors = _a.selectors, selectorMap = _a.map;
        if (selectors && selectors.length) {
            // All the attributes that are selectable should be shown.
            var applicableSelectors = selectors.filter(function (selector) { return !selector.element || selector.element == elementName; });
            var selectorAndAttributeNames = applicableSelectors.map(function (selector) { return ({ selector: selector, attrs: selector.attrs.filter(function (a) { return !!a; }) }); });
            var attrs_1 = utils_1.flatten(selectorAndAttributeNames.map(function (selectorAndAttr) {
                var directive = selectorMap.get(selectorAndAttr.selector);
                var result = selectorAndAttr.attrs.map(function (name) { return ({ name: name, input: name in directive.inputs, output: name in directive.outputs }); });
                return result;
            }));
            // Add template attribute if a directive contains a template reference
            selectorAndAttributeNames.forEach(function (selectorAndAttr) {
                var selector = selectorAndAttr.selector;
                var directive = selectorMap.get(selector);
                if (directive && utils_1.hasTemplateReference(directive.type) && selector.attrs.length &&
                    selector.attrs[0]) {
                    attrs_1.push({ name: selector.attrs[0], template: true });
                }
            });
            // All input and output properties of the matching directives should be added.
            var elementSelector = element ?
                createElementCssSelector(element) :
                createElementCssSelector(new compiler_1.Element(elementName, [], [], null, null, null));
            var matcher = new compiler_1.SelectorMatcher();
            matcher.addSelectables(selectors);
            matcher.match(elementSelector, function (selector) {
                var directive = selectorMap.get(selector);
                if (directive) {
                    var inputs_1 = directive.inputs, outputs_1 = directive.outputs;
                    attrs_1.push.apply(attrs_1, tslib_1.__spread(Object.keys(inputs_1).map(function (name) { return ({ name: inputs_1[name], input: true }); })));
                    attrs_1.push.apply(attrs_1, tslib_1.__spread(Object.keys(outputs_1).map(function (name) { return ({ name: outputs_1[name], output: true }); })));
                }
            });
            // If a name shows up twice, fold it into a single value.
            attrs_1 = foldAttrs(attrs_1);
            // Now expand them back out to ensure that input/output shows up as well as input and
            // output.
            attributes.push.apply(attributes, tslib_1.__spread(utils_1.flatten(attrs_1.map(expandedAttr))));
        }
        return attributes;
    }
    function attributeValueCompletions(info, position, attr) {
        var path = utils_1.findTemplateAstAt(info.templateAst, position);
        var mostSpecific = path.tail;
        var dinfo = utils_1.diagnosticInfoFromTemplateInfo(info);
        if (mostSpecific) {
            var visitor = new ExpressionVisitor(info, position, attr, function () { return language_services_1.getExpressionScope(dinfo, path, false); });
            mostSpecific.visit(visitor, null);
            if (!visitor.result || !visitor.result.length) {
                // Try allwoing widening the path
                var widerPath_1 = utils_1.findTemplateAstAt(info.templateAst, position, /* allowWidening */ true);
                if (widerPath_1.tail) {
                    var widerVisitor = new ExpressionVisitor(info, position, attr, function () { return language_services_1.getExpressionScope(dinfo, widerPath_1, false); });
                    widerPath_1.tail.visit(widerVisitor, null);
                    return widerVisitor.result;
                }
            }
            return visitor.result;
        }
    }
    function elementCompletions(info, path) {
        var htmlNames = html_info_1.elementNames().filter(function (name) { return !(name in hiddenHtmlElements); });
        // Collect the elements referenced by the selectors
        var directiveElements = utils_1.getSelectors(info)
            .selectors.map(function (selector) { return selector.element; })
            .filter(function (name) { return !!name; });
        var components = directiveElements.map(function (name) { return ({ kind: 'component', name: name, sort: name }); });
        var htmlElements = htmlNames.map(function (name) { return ({ kind: 'element', name: name, sort: name }); });
        // Return components and html elements
        return utils_1.uniqueByName(htmlElements.concat(components));
    }
    function entityCompletions(value, position) {
        // Look for entity completions
        var re = /&[A-Za-z]*;?(?!\d)/g;
        var found;
        var result = undefined;
        while (found = re.exec(value)) {
            var len = found[0].length;
            if (position >= found.index && position < (found.index + len)) {
                result = Object.keys(compiler_1.NAMED_ENTITIES)
                    .map(function (name) { return ({ kind: 'entity', name: "&" + name + ";", sort: name }); });
                break;
            }
        }
        return result;
    }
    function interpolationCompletions(info, position) {
        // Look for an interpolation in at the position.
        var templatePath = utils_1.findTemplateAstAt(info.templateAst, position);
        var mostSpecific = templatePath.tail;
        if (mostSpecific) {
            var visitor = new ExpressionVisitor(info, position, undefined, function () { return language_services_1.getExpressionScope(utils_1.diagnosticInfoFromTemplateInfo(info), templatePath, false); });
            mostSpecific.visit(visitor, null);
            return utils_1.uniqueByName(visitor.result);
        }
    }
    // There is a special case of HTML where text that contains a unclosed tag is treated as
    // text. For exaple '<h1> Some <a text </h1>' produces a text nodes inside of the H1
    // element "Some <a text". We, however, want to treat this as if the user was requesting
    // the attributes of an "a" element, not requesting completion in the a text element. This
    // code checks for this case and returns element completions if it is detected or undefined
    // if it is not.
    function voidElementAttributeCompletions(info, path) {
        var tail = path.tail;
        if (tail instanceof compiler_1.Text) {
            var match = tail.value.match(/<(\w(\w|\d|-)*:)?(\w(\w|\d|-)*)\s/);
            // The position must be after the match, otherwise we are still in a place where elements
            // are expected (such as `<|a` or `<a|`; we only want attributes for `<a |` or after).
            if (match &&
                path.position >= (match.index || 0) + match[0].length + tail.sourceSpan.start.offset) {
                return attributeCompletionsForElement(info, match[3]);
            }
        }
    }
    var ExpressionVisitor = /** @class */ (function (_super) {
        tslib_1.__extends(ExpressionVisitor, _super);
        function ExpressionVisitor(info, position, attr, getExpressionScope) {
            var _this = _super.call(this) || this;
            _this.info = info;
            _this.position = position;
            _this.attr = attr;
            _this.getExpressionScope = getExpressionScope || (function () { return info.template.members; });
            return _this;
        }
        ExpressionVisitor.prototype.visitDirectiveProperty = function (ast) {
            this.attributeValueCompletions(ast.value);
        };
        ExpressionVisitor.prototype.visitElementProperty = function (ast) {
            this.attributeValueCompletions(ast.value);
        };
        ExpressionVisitor.prototype.visitEvent = function (ast) { this.attributeValueCompletions(ast.handler); };
        ExpressionVisitor.prototype.visitElement = function (ast) {
            var _this = this;
            if (this.attr && utils_1.getSelectors(this.info) && this.attr.name.startsWith(TEMPLATE_ATTR_PREFIX)) {
                // The value is a template expression but the expression AST was not produced when the
                // TemplateAst was produce so
                // do that now.
                var key_1 = this.attr.name.substr(TEMPLATE_ATTR_PREFIX.length);
                // Find the selector
                var selectorInfo = utils_1.getSelectors(this.info);
                var selectors = selectorInfo.selectors;
                var selector_1 = selectors.filter(function (s) { return s.attrs.some(function (attr, i) { return i % 2 == 0 && attr == key_1; }); })[0];
                var templateBindingResult = this.info.expressionParser.parseTemplateBindings(key_1, this.attr.value, null);
                // find the template binding that contains the position
                if (!this.attr.valueSpan)
                    return;
                var valueRelativePosition_1 = this.position - this.attr.valueSpan.start.offset - 1;
                var bindings = templateBindingResult.templateBindings;
                var binding = bindings.find(function (binding) { return utils_1.inSpan(valueRelativePosition_1, binding.span, /* exclusive */ true); }) ||
                    bindings.find(function (binding) { return utils_1.inSpan(valueRelativePosition_1, binding.span); });
                var keyCompletions = function () {
                    var keys = [];
                    if (selector_1) {
                        var attrNames = selector_1.attrs.filter(function (_, i) { return i % 2 == 0; });
                        keys = attrNames.filter(function (name) { return name.startsWith(key_1) && name != key_1; })
                            .map(function (name) { return lowerName(name.substr(key_1.length)); });
                    }
                    keys.push('let');
                    _this.result = keys.map(function (key) { return ({ kind: 'key', name: key, sort: key }); });
                };
                if (!binding || (binding.key == key_1 && !binding.expression)) {
                    // We are in the root binding. We should return `let` and keys that are left in the
                    // selector.
                    keyCompletions();
                }
                else if (binding.keyIsVar) {
                    var equalLocation = this.attr.value.indexOf('=');
                    this.result = [];
                    if (equalLocation >= 0 && valueRelativePosition_1 >= equalLocation) {
                        // We are after the '=' in a let clause. The valid values here are the members of the
                        // template reference's type parameter.
                        var directiveMetadata = selectorInfo.map.get(selector_1);
                        if (directiveMetadata) {
                            var contextTable = this.info.template.query.getTemplateContext(directiveMetadata.type.reference);
                            if (contextTable) {
                                this.result = this.symbolsToCompletions(contextTable.values());
                            }
                        }
                    }
                    else if (binding.key && valueRelativePosition_1 <= (binding.key.length - key_1.length)) {
                        keyCompletions();
                    }
                }
                else {
                    // If the position is in the expression or after the key or there is no key, return the
                    // expression completions
                    if ((binding.expression && utils_1.inSpan(valueRelativePosition_1, binding.expression.ast.span)) ||
                        (binding.key &&
                            valueRelativePosition_1 > binding.span.start + (binding.key.length - key_1.length)) ||
                        !binding.key) {
                        var span = new compiler_1.ParseSpan(0, this.attr.value.length);
                        this.attributeValueCompletions(binding.expression ? binding.expression.ast :
                            new compiler_1.PropertyRead(span, new compiler_1.ImplicitReceiver(span), ''), valueRelativePosition_1);
                    }
                    else {
                        keyCompletions();
                    }
                }
            }
        };
        ExpressionVisitor.prototype.visitBoundText = function (ast) {
            var expressionPosition = this.position - ast.sourceSpan.start.offset;
            if (utils_1.inSpan(expressionPosition, ast.value.span)) {
                var completions = expressions_1.getExpressionCompletions(this.getExpressionScope(), ast.value, expressionPosition, this.info.template.query);
                if (completions) {
                    this.result = this.symbolsToCompletions(completions);
                }
            }
        };
        ExpressionVisitor.prototype.attributeValueCompletions = function (value, position) {
            var symbols = expressions_1.getExpressionCompletions(this.getExpressionScope(), value, position == null ? this.attributeValuePosition : position, this.info.template.query);
            if (symbols) {
                this.result = this.symbolsToCompletions(symbols);
            }
        };
        ExpressionVisitor.prototype.symbolsToCompletions = function (symbols) {
            return symbols.filter(function (s) { return !s.name.startsWith('__') && s.public; })
                .map(function (symbol) { return ({ kind: symbol.kind, name: symbol.name, sort: symbol.name }); });
        };
        Object.defineProperty(ExpressionVisitor.prototype, "attributeValuePosition", {
            get: function () {
                if (this.attr && this.attr.valueSpan) {
                    return this.position - this.attr.valueSpan.start.offset - 1;
                }
                return 0;
            },
            enumerable: true,
            configurable: true
        });
        return ExpressionVisitor;
    }(compiler_1.NullTemplateVisitor));
    function getSourceText(template, span) {
        return template.source.substring(span.start, span.end);
    }
    function nameOfAttr(attr) {
        var name = attr.name;
        if (attr.output) {
            name = utils_1.removeSuffix(name, 'Events');
            name = utils_1.removeSuffix(name, 'Changed');
        }
        var result = [name];
        if (attr.input) {
            result.unshift('[');
            result.push(']');
        }
        if (attr.output) {
            result.unshift('(');
            result.push(')');
        }
        if (attr.template) {
            result.unshift('*');
        }
        return result.join('');
    }
    var templateAttr = /^(\w+:)?(template$|^\*)/;
    function createElementCssSelector(element) {
        var e_1, _a;
        var cssSelector = new compiler_1.CssSelector();
        var elNameNoNs = compiler_1.splitNsName(element.name)[1];
        cssSelector.setElement(elNameNoNs);
        try {
            for (var _b = tslib_1.__values(element.attrs), _c = _b.next(); !_c.done; _c = _b.next()) {
                var attr = _c.value;
                if (!attr.name.match(templateAttr)) {
                    var _d = tslib_1.__read(compiler_1.splitNsName(attr.name), 2), _ = _d[0], attrNameNoNs = _d[1];
                    cssSelector.addAttribute(attrNameNoNs, attr.value);
                    if (attr.name.toLowerCase() == 'class') {
                        var classes = attr.value.split(/s+/g);
                        classes.forEach(function (className) { return cssSelector.addClassName(className); });
                    }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return cssSelector;
    }
    function foldAttrs(attrs) {
        var inputOutput = new Map();
        var templates = new Map();
        var result = [];
        attrs.forEach(function (attr) {
            if (attr.fromHtml) {
                return attr;
            }
            if (attr.template) {
                var duplicate = templates.get(attr.name);
                if (!duplicate) {
                    result.push({ name: attr.name, template: true });
                    templates.set(attr.name, attr);
                }
            }
            if (attr.input || attr.output) {
                var duplicate = inputOutput.get(attr.name);
                if (duplicate) {
                    duplicate.input = duplicate.input || attr.input;
                    duplicate.output = duplicate.output || attr.output;
                }
                else {
                    var cloneAttr = { name: attr.name };
                    if (attr.input)
                        cloneAttr.input = true;
                    if (attr.output)
                        cloneAttr.output = true;
                    result.push(cloneAttr);
                    inputOutput.set(attr.name, cloneAttr);
                }
            }
        });
        return result;
    }
    function expandedAttr(attr) {
        if (attr.input && attr.output) {
            return [
                attr, { name: attr.name, input: true, output: false },
                { name: attr.name, input: false, output: true }
            ];
        }
        return [attr];
    }
    function lowerName(name) {
        return name && (name[0].toLowerCase() + name.substr(1));
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGxldGlvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9sYW5ndWFnZS1zZXJ2aWNlL3NyYy9jb21wbGV0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCw4Q0FBa1c7SUFDbFcsaUZBQStFO0lBRy9FLHlFQUF1RDtJQUN2RCxxRUFBb0Y7SUFFcEYsNkRBQW1LO0lBRW5LLElBQU0sb0JBQW9CLEdBQUcsR0FBRyxDQUFDO0lBRWpDLElBQU0sa0JBQWtCLEdBQUc7UUFDekIsSUFBSSxFQUFFLElBQUk7UUFDVixNQUFNLEVBQUUsSUFBSTtRQUNaLFFBQVEsRUFBRSxJQUFJO1FBQ2QsSUFBSSxFQUFFLElBQUk7UUFDVixJQUFJLEVBQUUsSUFBSTtRQUNWLEtBQUssRUFBRSxJQUFJO1FBQ1gsSUFBSSxFQUFFLElBQUk7UUFDVixJQUFJLEVBQUUsSUFBSTtLQUNYLENBQUM7SUFFRixTQUFnQixzQkFBc0IsQ0FBQyxZQUEwQjtRQUMvRCxJQUFJLE1BQU0sR0FBMEIsU0FBUyxDQUFDO1FBQ3pDLElBQUEsOEJBQU8sRUFBRSxzQ0FBVyxFQUFFLGdDQUFRLENBQWlCO1FBQ3BELDZFQUE2RTtRQUM3RSxJQUFJLFlBQVksQ0FBQyxRQUFRLElBQUksSUFBSSxFQUFFO1lBQ2pDLElBQUksa0JBQWdCLEdBQUcsWUFBWSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztZQUNuRSxJQUFJLE1BQUksR0FBRyxtQkFBUSxDQUFDLE9BQU8sRUFBRSxrQkFBZ0IsQ0FBQyxDQUFDO1lBQy9DLElBQUksWUFBWSxHQUFHLE1BQUksQ0FBQyxJQUFJLENBQUM7WUFDN0IsSUFBSSxNQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsWUFBWSxFQUFFO2dCQUMvQixNQUFNLEdBQUcsa0JBQWtCLENBQUMsWUFBWSxFQUFFLE1BQUksQ0FBQyxD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QUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUM7YUFDOUMsQ0FBQztTQUNIO1FBQ0QsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2hCLENBQUM7SUFFRCxTQUFTLFNBQVMsQ0FBQyxJQUFZO1FBQzdCLE9BQU8sSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMxRCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FTVCwgQXN0UGF0aCwgQXR0cmlidXRlLCBCb3VuZERpcmVjdGl2ZVByb3BlcnR5QXN0LCBCb3VuZEVsZW1lbnRQcm9wZXJ0eUFzdCwgQm91bmRFdmVudEFzdCwgQm91bmRUZXh0QXN0LCBDc3NTZWxlY3RvciwgRWxlbWVudCwgRWxlbWVudEFzdCwgSW1wbGljaXRSZWNlaXZlciwgTkFNRURfRU5USVRJRVMsIE5vZGUgYXMgSHRtbEFzdCwgTnVsbFRlbXBsYXRlVmlzaXRvciwgUGFyc2VTcGFuLCBQcm9wZXJ0eVJlYWQsIFNlbGVjdG9yTWF0Y2hlciwgVGFnQ29udGVudFR5cGUsIFRleHQsIGZpbmROb2RlLCBnZXRIdG1sVGFnRGVmaW5pdGlvbiwgc3BsaXROc05hbWV9IGZyb20gJ0Bhbmd1bGFyL2NvbXBpbGVyJztcbmltcG9ydCB7Z2V0RXhwcmVzc2lvblNjb3BlfSBmcm9tICdAYW5ndWxhci9jb21waWxlci1jbGkvc3JjL2xhbmd1YWdlX3NlcnZpY2VzJztcblxuaW1wb3J0IHtBdHRySW5mbywgVGVtcGxhdGVJbmZvfSBmcm9tICcuL2NvbW1vbic7XG5pbXBvcnQge2dldEV4cHJlc3Npb25Db21wbGV0aW9uc30gZnJvbSAnLi9leHByZXNzaW9ucyc7XG5pbXBvcnQge2F0dHJpYnV0ZU5hbWVzLCBlbGVtZW50TmFtZXMsIGV2ZW50TmFtZXMsIHByb3BlcnR5TmFtZXN9IGZyb20gJy4vaHRtbF9pbmZvJztcbmltcG9ydCB7Q29tcGxldGlvbiwgQ29tcGxldGlvbnMsIFNwYW4sIFN5bWJvbCwgU3ltYm9sVGFibGUsIFRlbXBsYXRlU291cmNlfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB7ZGlhZ25vc3RpY0luZm9Gcm9tVGVtcGxhdGVJbmZvLCBmaW5kVGVtcGxhdGVBc3RBdCwgZmxhdHRlbiwgZ2V0U2VsZWN0b3JzLCBoYXNUZW1wbGF0ZVJlZmVyZW5jZSwgaW5TcGFuLCByZW1vdmVTdWZmaXgsIHNwYW5PZiwgdW5pcXVlQnlOYW1lfSBmcm9tICcuL3V0aWxzJztcblxuY29uc3QgVEVNUExBVEVfQVRUUl9QUkVGSVggPSAnKic7XG5cbmNvbnN0IGhpZGRlbkh0bWxFbGVtZW50cyA9IHtcbiAgaHRtbDogdHJ1ZSxcbiAgc2NyaXB0OiB0cnVlLFxuICBub3NjcmlwdDogdHJ1ZSxcbiAgYmFzZTogdHJ1ZSxcbiAgYm9keTogdHJ1ZSxcbiAgdGl0bGU6IHRydWUsXG4gIGhlYWQ6IHRydWUsXG4gIGxpbms6IHRydWUsXG59O1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGVtcGxhdGVDb21wbGV0aW9ucyh0ZW1wbGF0ZUluZm86IFRlbXBsYXRlSW5mbyk6IENvbXBsZXRpb25zfHVuZGVmaW5lZCB7XG4gIGxldCByZXN1bHQ6IENvbXBsZXRpb25zfHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgbGV0IHtodG1sQXN0LCB0ZW1wbGF0ZUFzdCwgdGVtcGxhdGV9ID0gdGVtcGxhdGVJbmZvO1xuICAvLyBUaGUgdGVtcGxhdGVOb2RlIHN0YXJ0cyBhdCB0aGUgZGVsaW1pdGVyIGNoYXJhY3RlciBzbyB3ZSBhZGQgMSB0byBza2lwIGl0LlxuICBpZiAodGVtcGxhdGVJbmZvLnBvc2l0aW9uICE9IG51bGwpIHtcbiAgICBsZXQgdGVtcGxhdGVQb3NpdGlvbiA9IHRlbXBsYXRlSW5mby5wb3NpdGlvbiAtIHRlbXBsYXRlLnNwYW4uc3RhcnQ7XG4gICAgbGV0IHBhdGggPSBmaW5kTm9kZShodG1sQXN0LCB0ZW1wbGF0ZVBvc2l0aW9uKTtcbiAgICBsZXQgbW9zdFNwZWNpZmljID0gcGF0aC50YWlsO1xuICAgIGlmIChwYXRoLmVtcHR5IHx8ICFtb3N0U3BlY2lmaWMpIHtcbiAgICAgIHJlc3VsdCA9IGVsZW1lbnRDb21wbGV0aW9ucyh0ZW1wbGF0ZUluZm8sIHBhdGgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgYXN0UG9zaXRpb24gPSB0ZW1wbGF0ZVBvc2l0aW9uIC0gbW9zdFNwZWNpZmljLnNvdXJjZVNwYW4uc3RhcnQub2Zmc2V0O1xuICAgICAgbW9zdFNwZWNpZmljLnZpc2l0KFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHZpc2l0RWxlbWVudChhc3QpIHtcbiAgICAgICAgICAgICAgbGV0IHN0YXJ0VGFnU3BhbiA9IHNwYW5PZihhc3Quc291cmNlU3Bhbik7XG4gICAgICAgICAgICAgIGxldCB0YWdMZW4gPSBhc3QubmFtZS5sZW5ndGg7XG4gICAgICAgICAgICAgIGlmICh0ZW1wbGF0ZVBvc2l0aW9uIDw9XG4gICAgICAgICAgICAgICAgICBzdGFydFRhZ1NwYW4uc3RhcnQgKyB0YWdMZW4gKyAxIC8qIDEgZm9yIHRoZSBvcGVuaW5nIGFuZ2xlIGJyYWNrZWQgKi8pIHtcbiAgICAgICAgICAgICAgICAvLyBJZiB3ZSBhcmUgaW4gdGhlIHRhZyB0aGVuIHJldHVybiB0aGUgZWxlbWVudCBjb21wbGV0aW9ucy5cbiAgICAgICAgICAgICAgICByZXN1bHQgPSBlbGVtZW50Q29tcGxldGlvbnModGVtcGxhdGVJbmZvLCBwYXRoKTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmICh0ZW1wbGF0ZVBvc2l0aW9uIDwgc3RhcnRUYWdTcGFuLmVuZCkge1xuICAgICAgICAgICAgICAgIC8vIFdlIGFyZSBpbiB0aGUgYXR0cmlidXRlIHNlY3Rpb24gb2YgdGhlIGVsZW1lbnQgKGJ1dCBub3QgaW4gYW4gYXR0cmlidXRlKS5cbiAgICAgICAgICAgICAgICAvLyBSZXR1cm4gdGhlIGF0dHJpYnV0ZSBjb21wbGV0aW9ucy5cbiAgICAgICAgICAgICAgICByZXN1bHQgPSBhdHRyaWJ1dGVDb21wbGV0aW9ucyh0ZW1wbGF0ZUluZm8sIHBhdGgpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdmlzaXRBdHRyaWJ1dGUoYXN0KSB7XG4gICAgICAgICAgICAgIGlmICghYXN0LnZhbHVlU3BhbiB8fCAhaW5TcGFuKHRlbXBsYXRlUG9zaXRpb24sIHNwYW5PZihhc3QudmFsdWVTcGFuKSkpIHtcbiAgICAgICAgICAgICAgICAvLyBXZSBhcmUgaW4gdGhlIG5hbWUgb2YgYW4gYXR0cmlidXRlLiBTaG93IGF0dHJpYnV0ZSBjb21wbGV0aW9ucy5cbiAgICAgICAgICAgICAgICByZXN1bHQgPSBhdHRyaWJ1dGVDb21wbGV0aW9ucyh0ZW1wbGF0ZUluZm8sIHBhdGgpO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKGFzdC52YWx1ZVNwYW4gJiYgaW5TcGFuKHRlbXBsYXRlUG9zaXRpb24sIHNwYW5PZihhc3QudmFsdWVTcGFuKSkpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBhdHRyaWJ1dGVWYWx1ZUNvbXBsZXRpb25zKHRlbXBsYXRlSW5mbywgdGVtcGxhdGVQb3NpdGlvbiwgYXN0KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHZpc2l0VGV4dChhc3QpIHtcbiAgICAgICAgICAgICAgLy8gQ2hlY2sgaWYgd2UgYXJlIGluIGEgZW50aXR5LlxuICAgICAgICAgICAgICByZXN1bHQgPSBlbnRpdHlDb21wbGV0aW9ucyhnZXRTb3VyY2VUZXh0KHRlbXBsYXRlLCBzcGFuT2YoYXN0KSksIGFzdFBvc2l0aW9uKTtcbiAgICAgICAgICAgICAgaWYgKHJlc3VsdCkgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgICAgcmVzdWx0ID0gaW50ZXJwb2xhdGlvbkNvbXBsZXRpb25zKHRlbXBsYXRlSW5mbywgdGVtcGxhdGVQb3NpdGlvbik7XG4gICAgICAgICAgICAgIGlmIChyZXN1bHQpIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICAgIGxldCBlbGVtZW50ID0gcGF0aC5maXJzdChFbGVtZW50KTtcbiAgICAgICAgICAgICAgaWYgKGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICBsZXQgZGVmaW5pdGlvbiA9IGdldEh0bWxUYWdEZWZpbml0aW9uKGVsZW1lbnQubmFtZSk7XG4gICAgICAgICAgICAgICAgaWYgKGRlZmluaXRpb24uY29udGVudFR5cGUgPT09IFRhZ0NvbnRlbnRUeXBlLlBBUlNBQkxFX0RBVEEpIHtcbiAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHZvaWRFbGVtZW50QXR0cmlidXRlQ29tcGxldGlvbnModGVtcGxhdGVJbmZvLCBwYXRoKTtcbiAgICAgICAgICAgICAgICAgIGlmICghcmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHRoZSBlbGVtZW50IGNhbiBob2xkIGNvbnRlbnQgU2hvdyBlbGVtZW50IGNvbXBsZXRpb25zLlxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBlbGVtZW50Q29tcGxldGlvbnModGVtcGxhdGVJbmZvLCBwYXRoKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgbm8gZWxlbWVudCBjb250YWluZXIsIGltcGxpZXMgcGFyc2FibGUgZGF0YSBzbyBzaG93IGVsZW1lbnRzLlxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHZvaWRFbGVtZW50QXR0cmlidXRlQ29tcGxldGlvbnModGVtcGxhdGVJbmZvLCBwYXRoKTtcbiAgICAgICAgICAgICAgICBpZiAoIXJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gZWxlbWVudENvbXBsZXRpb25zKHRlbXBsYXRlSW5mbywgcGF0aCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdmlzaXRDb21tZW50KGFzdCkge30sXG4gICAgICAgICAgICB2aXNpdEV4cGFuc2lvbihhc3QpIHt9LFxuICAgICAgICAgICAgdmlzaXRFeHBhbnNpb25DYXNlKGFzdCkge31cbiAgICAgICAgICB9LFxuICAgICAgICAgIG51bGwpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBhdHRyaWJ1dGVDb21wbGV0aW9ucyhpbmZvOiBUZW1wbGF0ZUluZm8sIHBhdGg6IEFzdFBhdGg8SHRtbEFzdD4pOiBDb21wbGV0aW9uc3x1bmRlZmluZWQge1xuICBsZXQgaXRlbSA9IHBhdGgudGFpbCBpbnN0YW5jZW9mIEVsZW1lbnQgPyBwYXRoLnRhaWwgOiBwYXRoLnBhcmVudE9mKHBhdGgudGFpbCk7XG4gIGlmIChpdGVtIGluc3RhbmNlb2YgRWxlbWVudCkge1xuICAgIHJldHVybiBhdHRyaWJ1dGVDb21wbGV0aW9uc0ZvckVsZW1lbnQoaW5mbywgaXRlbS5uYW1lLCBpdGVtKTtcbiAgfVxuICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiBhdHRyaWJ1dGVDb21wbGV0aW9uc0ZvckVsZW1lbnQoXG4gICAgaW5mbzogVGVtcGxhdGVJbmZvLCBlbGVtZW50TmFtZTogc3RyaW5nLCBlbGVtZW50PzogRWxlbWVudCk6IENvbXBsZXRpb25zIHtcbiAgY29uc3QgYXR0cmlidXRlcyA9IGdldEF0dHJpYnV0ZUluZm9zRm9yRWxlbWVudChpbmZvLCBlbGVtZW50TmFtZSwgZWxlbWVudCk7XG5cbiAgLy8gTWFwIGFsbCB0aGUgYXR0cmlidXRlcyB0byBhIGNvbXBsZXRpb25cbiAgcmV0dXJuIGF0dHJpYnV0ZXMubWFwPENvbXBsZXRpb24+KGF0dHIgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2luZDogYXR0ci5mcm9tSHRtbCA/ICdodG1sIGF0dHJpYnV0ZScgOiAnYXR0cmlidXRlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogbmFtZU9mQXR0cihhdHRyKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc29ydDogYXR0ci5uYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSk7XG59XG5cbmZ1bmN0aW9uIGdldEF0dHJpYnV0ZUluZm9zRm9yRWxlbWVudChcbiAgICBpbmZvOiBUZW1wbGF0ZUluZm8sIGVsZW1lbnROYW1lOiBzdHJpbmcsIGVsZW1lbnQ/OiBFbGVtZW50KTogQXR0ckluZm9bXSB7XG4gIGxldCBhdHRyaWJ1dGVzOiBBdHRySW5mb1tdID0gW107XG5cbiAgLy8gQWRkIGh0bWwgYXR0cmlidXRlc1xuICBsZXQgaHRtbEF0dHJpYnV0ZXMgPSBhdHRyaWJ1dGVOYW1lcyhlbGVtZW50TmFtZSkgfHwgW107XG4gIGlmIChodG1sQXR0cmlidXRlcykge1xuICAgIGF0dHJpYnV0ZXMucHVzaCguLi5odG1sQXR0cmlidXRlcy5tYXA8QXR0ckluZm8+KG5hbWUgPT4gKHtuYW1lLCBmcm9tSHRtbDogdHJ1ZX0pKSk7XG4gIH1cblxuICAvLyBBZGQgaHRtbCBwcm9wZXJ0aWVzXG4gIGxldCBodG1sUHJvcGVydGllcyA9IHByb3BlcnR5TmFtZXMoZWxlbWVudE5hbWUpO1xuICBpZiAoaHRtbFByb3BlcnRpZXMpIHtcbiAgICBhdHRyaWJ1dGVzLnB1c2goLi4uaHRtbFByb3BlcnRpZXMubWFwPEF0dHJJbmZvPihuYW1lID0+ICh7bmFtZSwgaW5wdXQ6IHRydWV9KSkpO1xuICB9XG5cbiAgLy8gQWRkIGh0bWwgZXZlbnRzXG4gIGxldCBodG1sRXZlbnRzID0gZXZlbnROYW1lcyhlbGVtZW50TmFtZSk7XG4gIGlmIChodG1sRXZlbnRzKSB7XG4gICAgYXR0cmlidXRlcy5wdXNoKC4uLmh0bWxFdmVudHMubWFwPEF0dHJJbmZvPihuYW1lID0+ICh7bmFtZSwgb3V0cHV0OiB0cnVlfSkpKTtcbiAgfVxuXG4gIGxldCB7c2VsZWN0b3JzLCBtYXA6IHNlbGVjdG9yTWFwfSA9IGdldFNlbGVjdG9ycyhpbmZvKTtcbiAgaWYgKHNlbGVjdG9ycyAmJiBzZWxlY3RvcnMubGVuZ3RoKSB7XG4gICAgLy8gQWxsIHRoZSBhdHRyaWJ1dGVzIHRoYXQgYXJlIHNlbGVjdGFibGUgc2hvdWxkIGJlIHNob3duLlxuICAgIGNvbnN0IGFwcGxpY2FibGVTZWxlY3RvcnMgPVxuICAgICAgICBzZWxlY3RvcnMuZmlsdGVyKHNlbGVjdG9yID0+ICFzZWxlY3Rvci5lbGVtZW50IHx8IHNlbGVjdG9yLmVsZW1lbnQgPT0gZWxlbWVudE5hbWUpO1xuICAgIGNvbnN0IHNlbGVjdG9yQW5kQXR0cmlidXRlTmFtZXMgPVxuICAgICAgICBhcHBsaWNhYmxlU2VsZWN0b3JzLm1hcChzZWxlY3RvciA9PiAoe3NlbGVjdG9yLCBhdHRyczogc2VsZWN0b3IuYXR0cnMuZmlsdGVyKGEgPT4gISFhKX0pKTtcbiAgICBsZXQgYXR0cnMgPSBmbGF0dGVuKHNlbGVjdG9yQW5kQXR0cmlidXRlTmFtZXMubWFwPEF0dHJJbmZvW10+KHNlbGVjdG9yQW5kQXR0ciA9PiB7XG4gICAgICBjb25zdCBkaXJlY3RpdmUgPSBzZWxlY3Rvck1hcC5nZXQoc2VsZWN0b3JBbmRBdHRyLnNlbGVjdG9yKSAhO1xuICAgICAgY29uc3QgcmVzdWx0ID0gc2VsZWN0b3JBbmRBdHRyLmF0dHJzLm1hcDxBdHRySW5mbz4oXG4gICAgICAgICAgbmFtZSA9PiAoe25hbWUsIGlucHV0OiBuYW1lIGluIGRpcmVjdGl2ZS5pbnB1dHMsIG91dHB1dDogbmFtZSBpbiBkaXJlY3RpdmUub3V0cHV0c30pKTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSkpO1xuXG4gICAgLy8gQWRkIHRlbXBsYXRlIGF0dHJpYnV0ZSBpZiBhIGRpcmVjdGl2ZSBjb250YWlucyBhIHRlbXBsYXRlIHJlZmVyZW5jZVxuICAgIHNlbGVjdG9yQW5kQXR0cmlidXRlTmFtZXMuZm9yRWFjaChzZWxlY3RvckFuZEF0dHIgPT4ge1xuICAgICAgY29uc3Qgc2VsZWN0b3IgPSBzZWxlY3RvckFuZEF0dHIuc2VsZWN0b3I7XG4gICAgICBjb25zdCBkaXJlY3RpdmUgPSBzZWxlY3Rvck1hcC5nZXQoc2VsZWN0b3IpO1xuICAgICAgaWYgKGRpcmVjdGl2ZSAmJiBoYXNUZW1wbGF0ZVJlZmVyZW5jZShkaXJlY3RpdmUudHlwZSkgJiYgc2VsZWN0b3IuYXR0cnMubGVuZ3RoICYmXG4gICAgICAgICAgc2VsZWN0b3IuYXR0cnNbMF0pIHtcbiAgICAgICAgYXR0cnMucHVzaCh7bmFtZTogc2VsZWN0b3IuYXR0cnNbMF0sIHRlbXBsYXRlOiB0cnVlfSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBBbGwgaW5wdXQgYW5kIG91dHB1dCBwcm9wZXJ0aWVzIG9mIHRoZSBtYXRjaGluZyBkaXJlY3RpdmVzIHNob3VsZCBiZSBhZGRlZC5cbiAgICBsZXQgZWxlbWVudFNlbGVjdG9yID0gZWxlbWVudCA/XG4gICAgICAgIGNyZWF0ZUVsZW1lbnRDc3NTZWxlY3RvcihlbGVtZW50KSA6XG4gICAgICAgIGNyZWF0ZUVsZW1lbnRDc3NTZWxlY3RvcihuZXcgRWxlbWVudChlbGVtZW50TmFtZSwgW10sIFtdLCBudWxsICEsIG51bGwsIG51bGwpKTtcblxuICAgIGxldCBtYXRjaGVyID0gbmV3IFNlbGVjdG9yTWF0Y2hlcigpO1xuICAgIG1hdGNoZXIuYWRkU2VsZWN0YWJsZXMoc2VsZWN0b3JzKTtcbiAgICBtYXRjaGVyLm1hdGNoKGVsZW1lbnRTZWxlY3Rvciwgc2VsZWN0b3IgPT4ge1xuICAgICAgbGV0IGRpcmVjdGl2ZSA9IHNlbGVjdG9yTWFwLmdldChzZWxlY3Rvcik7XG4gICAgICBpZiAoZGlyZWN0aXZlKSB7XG4gICAgICAgIGNvbnN0IHtpbnB1dHMsIG91dHB1dHN9ID0gZGlyZWN0aXZlO1xuICAgICAgICBhdHRycy5wdXNoKC4uLk9iamVjdC5rZXlzKGlucHV0cykubWFwKG5hbWUgPT4gKHtuYW1lOiBpbnB1dHNbbmFtZV0sIGlucHV0OiB0cnVlfSkpKTtcbiAgICAgICAgYXR0cnMucHVzaCguLi5PYmplY3Qua2V5cyhvdXRwdXRzKS5tYXAobmFtZSA9PiAoe25hbWU6IG91dHB1dHNbbmFtZV0sIG91dHB1dDogdHJ1ZX0pKSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBJZiBhIG5hbWUgc2hvd3MgdXAgdHdpY2UsIGZvbGQgaXQgaW50byBhIHNpbmdsZSB2YWx1ZS5cbiAgICBhdHRycyA9IGZvbGRBdHRycyhhdHRycyk7XG5cbiAgICAvLyBOb3cgZXhwYW5kIHRoZW0gYmFjayBvdXQgdG8gZW5zdXJlIHRoYXQgaW5wdXQvb3V0cHV0IHNob3dzIHVwIGFzIHdlbGwgYXMgaW5wdXQgYW5kXG4gICAgLy8gb3V0cHV0LlxuICAgIGF0dHJpYnV0ZXMucHVzaCguLi5mbGF0dGVuKGF0dHJzLm1hcChleHBhbmRlZEF0dHIpKSk7XG4gIH1cbiAgcmV0dXJuIGF0dHJpYnV0ZXM7XG59XG5cbmZ1bmN0aW9uIGF0dHJpYnV0ZVZhbHVlQ29tcGxldGlvbnMoXG4gICAgaW5mbzogVGVtcGxhdGVJbmZvLCBwb3NpdGlvbjogbnVtYmVyLCBhdHRyOiBBdHRyaWJ1dGUpOiBDb21wbGV0aW9uc3x1bmRlZmluZWQge1xuICBjb25zdCBwYXRoID0gZmluZFRlbXBsYXRlQXN0QXQoaW5mby50ZW1wbGF0ZUFzdCwgcG9zaXRpb24pO1xuICBjb25zdCBtb3N0U3BlY2lmaWMgPSBwYXRoLnRhaWw7XG4gIGNvbnN0IGRpbmZvID0gZGlhZ25vc3RpY0luZm9Gcm9tVGVtcGxhdGVJbmZvKGluZm8pO1xuICBpZiAobW9zdFNwZWNpZmljKSB7XG4gICAgY29uc3QgdmlzaXRvciA9XG4gICAgICAgIG5ldyBFeHByZXNzaW9uVmlzaXRvcihpbmZvLCBwb3NpdGlvbiwgYXR0ciwgKCkgPT4gZ2V0RXhwcmVzc2lvblNjb3BlKGRpbmZvLCBwYXRoLCBmYWxzZSkpO1xuICAgIG1vc3RTcGVjaWZpYy52aXNpdCh2aXNpdG9yLCBudWxsKTtcbiAgICBpZiAoIXZpc2l0b3IucmVzdWx0IHx8ICF2aXNpdG9yLnJlc3VsdC5sZW5ndGgpIHtcbiAgICAgIC8vIFRyeSBhbGx3b2luZyB3aWRlbmluZyB0aGUgcGF0aFxuICAgICAgY29uc3Qgd2lkZXJQYXRoID0gZmluZFRlbXBsYXRlQXN0QXQoaW5mby50ZW1wbGF0ZUFzdCwgcG9zaXRpb24sIC8qIGFsbG93V2lkZW5pbmcgKi8gdHJ1ZSk7XG4gICAgICBpZiAod2lkZXJQYXRoLnRhaWwpIHtcbiAgICAgICAgY29uc3Qgd2lkZXJWaXNpdG9yID0gbmV3IEV4cHJlc3Npb25WaXNpdG9yKFxuICAgICAgICAgICAgaW5mbywgcG9zaXRpb24sIGF0dHIsICgpID0+IGdldEV4cHJlc3Npb25TY29wZShkaW5mbywgd2lkZXJQYXRoLCBmYWxzZSkpO1xuICAgICAgICB3aWRlclBhdGgudGFpbC52aXNpdCh3aWRlclZpc2l0b3IsIG51bGwpO1xuICAgICAgICByZXR1cm4gd2lkZXJWaXNpdG9yLnJlc3VsdDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHZpc2l0b3IucmVzdWx0O1xuICB9XG59XG5cbmZ1bmN0aW9uIGVsZW1lbnRDb21wbGV0aW9ucyhpbmZvOiBUZW1wbGF0ZUluZm8sIHBhdGg6IEFzdFBhdGg8SHRtbEFzdD4pOiBDb21wbGV0aW9uc3x1bmRlZmluZWQge1xuICBsZXQgaHRtbE5hbWVzID0gZWxlbWVudE5hbWVzKCkuZmlsdGVyKG5hbWUgPT4gIShuYW1lIGluIGhpZGRlbkh0bWxFbGVtZW50cykpO1xuXG4gIC8vIENvbGxlY3QgdGhlIGVsZW1lbnRzIHJlZmVyZW5jZWQgYnkgdGhlIHNlbGVjdG9yc1xuICBsZXQgZGlyZWN0aXZlRWxlbWVudHMgPSBnZXRTZWxlY3RvcnMoaW5mbylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zZWxlY3RvcnMubWFwKHNlbGVjdG9yID0+IHNlbGVjdG9yLmVsZW1lbnQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKG5hbWUgPT4gISFuYW1lKSBhcyBzdHJpbmdbXTtcblxuICBsZXQgY29tcG9uZW50cyA9XG4gICAgICBkaXJlY3RpdmVFbGVtZW50cy5tYXA8Q29tcGxldGlvbj4obmFtZSA9PiAoe2tpbmQ6ICdjb21wb25lbnQnLCBuYW1lLCBzb3J0OiBuYW1lfSkpO1xuICBsZXQgaHRtbEVsZW1lbnRzID0gaHRtbE5hbWVzLm1hcDxDb21wbGV0aW9uPihuYW1lID0+ICh7a2luZDogJ2VsZW1lbnQnLCBuYW1lOiBuYW1lLCBzb3J0OiBuYW1lfSkpO1xuXG4gIC8vIFJldHVybiBjb21wb25lbnRzIGFuZCBodG1sIGVsZW1lbnRzXG4gIHJldHVybiB1bmlxdWVCeU5hbWUoaHRtbEVsZW1lbnRzLmNvbmNhdChjb21wb25lbnRzKSk7XG59XG5cbmZ1bmN0aW9uIGVudGl0eUNvbXBsZXRpb25zKHZhbHVlOiBzdHJpbmcsIHBvc2l0aW9uOiBudW1iZXIpOiBDb21wbGV0aW9uc3x1bmRlZmluZWQge1xuICAvLyBMb29rIGZvciBlbnRpdHkgY29tcGxldGlvbnNcbiAgY29uc3QgcmUgPSAvJltBLVphLXpdKjs/KD8hXFxkKS9nO1xuICBsZXQgZm91bmQ6IFJlZ0V4cEV4ZWNBcnJheXxudWxsO1xuICBsZXQgcmVzdWx0OiBDb21wbGV0aW9uc3x1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gIHdoaWxlIChmb3VuZCA9IHJlLmV4ZWModmFsdWUpKSB7XG4gICAgbGV0IGxlbiA9IGZvdW5kWzBdLmxlbmd0aDtcbiAgICBpZiAocG9zaXRpb24gPj0gZm91bmQuaW5kZXggJiYgcG9zaXRpb24gPCAoZm91bmQuaW5kZXggKyBsZW4pKSB7XG4gICAgICByZXN1bHQgPSBPYmplY3Qua2V5cyhOQU1FRF9FTlRJVElFUylcbiAgICAgICAgICAgICAgICAgICAubWFwPENvbXBsZXRpb24+KG5hbWUgPT4gKHtraW5kOiAnZW50aXR5JywgbmFtZTogYCYke25hbWV9O2AsIHNvcnQ6IG5hbWV9KSk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gaW50ZXJwb2xhdGlvbkNvbXBsZXRpb25zKGluZm86IFRlbXBsYXRlSW5mbywgcG9zaXRpb246IG51bWJlcik6IENvbXBsZXRpb25zfHVuZGVmaW5lZCB7XG4gIC8vIExvb2sgZm9yIGFuIGludGVycG9sYXRpb24gaW4gYXQgdGhlIHBvc2l0aW9uLlxuICBjb25zdCB0ZW1wbGF0ZVBhdGggPSBmaW5kVGVtcGxhdGVBc3RBdChpbmZvLnRlbXBsYXRlQXN0LCBwb3NpdGlvbik7XG4gIGNvbnN0IG1vc3RTcGVjaWZpYyA9IHRlbXBsYXRlUGF0aC50YWlsO1xuICBpZiAobW9zdFNwZWNpZmljKSB7XG4gICAgbGV0IHZpc2l0b3IgPSBuZXcgRXhwcmVzc2lvblZpc2l0b3IoXG4gICAgICAgIGluZm8sIHBvc2l0aW9uLCB1bmRlZmluZWQsXG4gICAgICAgICgpID0+IGdldEV4cHJlc3Npb25TY29wZShkaWFnbm9zdGljSW5mb0Zyb21UZW1wbGF0ZUluZm8oaW5mbyksIHRlbXBsYXRlUGF0aCwgZmFsc2UpKTtcbiAgICBtb3N0U3BlY2lmaWMudmlzaXQodmlzaXRvciwgbnVsbCk7XG4gICAgcmV0dXJuIHVuaXF1ZUJ5TmFtZSh2aXNpdG9yLnJlc3VsdCk7XG4gIH1cbn1cblxuLy8gVGhlcmUgaXMgYSBzcGVjaWFsIGNhc2Ugb2YgSFRNTCB3aGVyZSB0ZXh0IHRoYXQgY29udGFpbnMgYSB1bmNsb3NlZCB0YWcgaXMgdHJlYXRlZCBhc1xuLy8gdGV4dC4gRm9yIGV4YXBsZSAnPGgxPiBTb21lIDxhIHRleHQgPC9oMT4nIHByb2R1Y2VzIGEgdGV4dCBub2RlcyBpbnNpZGUgb2YgdGhlIEgxXG4vLyBlbGVtZW50IFwiU29tZSA8YSB0ZXh0XCIuIFdlLCBob3dldmVyLCB3YW50IHRvIHRyZWF0IHRoaXMgYXMgaWYgdGhlIHVzZXIgd2FzIHJlcXVlc3Rpbmdcbi8vIHRoZSBhdHRyaWJ1dGVzIG9mIGFuIFwiYVwiIGVsZW1lbnQsIG5vdCByZXF1ZXN0aW5nIGNvbXBsZXRpb24gaW4gdGhlIGEgdGV4dCBlbGVtZW50LiBUaGlzXG4vLyBjb2RlIGNoZWNrcyBmb3IgdGhpcyBjYXNlIGFuZCByZXR1cm5zIGVsZW1lbnQgY29tcGxldGlvbnMgaWYgaXQgaXMgZGV0ZWN0ZWQgb3IgdW5kZWZpbmVkXG4vLyBpZiBpdCBpcyBub3QuXG5mdW5jdGlvbiB2b2lkRWxlbWVudEF0dHJpYnV0ZUNvbXBsZXRpb25zKGluZm86IFRlbXBsYXRlSW5mbywgcGF0aDogQXN0UGF0aDxIdG1sQXN0Pik6IENvbXBsZXRpb25zfFxuICAgIHVuZGVmaW5lZCB7XG4gIGxldCB0YWlsID0gcGF0aC50YWlsO1xuICBpZiAodGFpbCBpbnN0YW5jZW9mIFRleHQpIHtcbiAgICBsZXQgbWF0Y2ggPSB0YWlsLnZhbHVlLm1hdGNoKC88KFxcdyhcXHd8XFxkfC0pKjopPyhcXHcoXFx3fFxcZHwtKSopXFxzLyk7XG4gICAgLy8gVGhlIHBvc2l0aW9uIG11c3QgYmUgYWZ0ZXIgdGhlIG1hdGNoLCBvdGhlcndpc2Ugd2UgYXJlIHN0aWxsIGluIGEgcGxhY2Ugd2hlcmUgZWxlbWVudHNcbiAgICAvLyBhcmUgZXhwZWN0ZWQgKHN1Y2ggYXMgYDx8YWAgb3IgYDxhfGA7IHdlIG9ubHkgd2FudCBhdHRyaWJ1dGVzIGZvciBgPGEgfGAgb3IgYWZ0ZXIpLlxuICAgIGlmIChtYXRjaCAmJlxuICAgICAgICBwYXRoLnBvc2l0aW9uID49IChtYXRjaC5pbmRleCB8fCAwKSArIG1hdGNoWzBdLmxlbmd0aCArIHRhaWwuc291cmNlU3Bhbi5zdGFydC5vZmZzZXQpIHtcbiAgICAgIHJldHVybiBhdHRyaWJ1dGVDb21wbGV0aW9uc0ZvckVsZW1lbnQoaW5mbywgbWF0Y2hbM10pO1xuICAgIH1cbiAgfVxufVxuXG5jbGFzcyBFeHByZXNzaW9uVmlzaXRvciBleHRlbmRzIE51bGxUZW1wbGF0ZVZpc2l0b3Ige1xuICBwcml2YXRlIGdldEV4cHJlc3Npb25TY29wZTogKCkgPT4gU3ltYm9sVGFibGU7XG4gIHJlc3VsdDogQ29tcGxldGlvbnM7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIGluZm86IFRlbXBsYXRlSW5mbywgcHJpdmF0ZSBwb3NpdGlvbjogbnVtYmVyLCBwcml2YXRlIGF0dHI/OiBBdHRyaWJ1dGUsXG4gICAgICBnZXRFeHByZXNzaW9uU2NvcGU/OiAoKSA9PiBTeW1ib2xUYWJsZSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5nZXRFeHByZXNzaW9uU2NvcGUgPSBnZXRFeHByZXNzaW9uU2NvcGUgfHwgKCgpID0+IGluZm8udGVtcGxhdGUubWVtYmVycyk7XG4gIH1cblxuICB2aXNpdERpcmVjdGl2ZVByb3BlcnR5KGFzdDogQm91bmREaXJlY3RpdmVQcm9wZXJ0eUFzdCk6IHZvaWQge1xuICAgIHRoaXMuYXR0cmlidXRlVmFsdWVDb21wbGV0aW9ucyhhc3QudmFsdWUpO1xuICB9XG5cbiAgdmlzaXRFbGVtZW50UHJvcGVydHkoYXN0OiBCb3VuZEVsZW1lbnRQcm9wZXJ0eUFzdCk6IHZvaWQge1xuICAgIHRoaXMuYXR0cmlidXRlVmFsdWVDb21wbGV0aW9ucyhhc3QudmFsdWUpO1xuICB9XG5cbiAgdmlzaXRFdmVudChhc3Q6IEJvdW5kRXZlbnRBc3QpOiB2b2lkIHsgdGhpcy5hdHRyaWJ1dGVWYWx1ZUNvbXBsZXRpb25zKGFzdC5oYW5kbGVyKTsgfVxuXG4gIHZpc2l0RWxlbWVudChhc3Q6IEVsZW1lbnRBc3QpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5hdHRyICYmIGdldFNlbGVjdG9ycyh0aGlzLmluZm8pICYmIHRoaXMuYXR0ci5uYW1lLnN0YXJ0c1dpdGgoVEVNUExBVEVfQVRUUl9QUkVGSVgpKSB7XG4gICAgICAvLyBUaGUgdmFsdWUgaXMgYSB0ZW1wbGF0ZSBleHByZXNzaW9uIGJ1dCB0aGUgZXhwcmVzc2lvbiBBU1Qgd2FzIG5vdCBwcm9kdWNlZCB3aGVuIHRoZVxuICAgICAgLy8gVGVtcGxhdGVBc3Qgd2FzIHByb2R1Y2Ugc29cbiAgICAgIC8vIGRvIHRoYXQgbm93LlxuXG4gICAgICBjb25zdCBrZXkgPSB0aGlzLmF0dHIubmFtZS5zdWJzdHIoVEVNUExBVEVfQVRUUl9QUkVGSVgubGVuZ3RoKTtcblxuICAgICAgLy8gRmluZCB0aGUgc2VsZWN0b3JcbiAgICAgIGNvbnN0IHNlbGVjdG9ySW5mbyA9IGdldFNlbGVjdG9ycyh0aGlzLmluZm8pO1xuICAgICAgY29uc3Qgc2VsZWN0b3JzID0gc2VsZWN0b3JJbmZvLnNlbGVjdG9ycztcbiAgICAgIGNvbnN0IHNlbGVjdG9yID1cbiAgICAgICAgICBzZWxlY3RvcnMuZmlsdGVyKHMgPT4gcy5hdHRycy5zb21lKChhdHRyLCBpKSA9PiBpICUgMiA9PSAwICYmIGF0dHIgPT0ga2V5KSlbMF07XG5cbiAgICAgIGNvbnN0IHRlbXBsYXRlQmluZGluZ1Jlc3VsdCA9XG4gICAgICAgICAgdGhpcy5pbmZvLmV4cHJlc3Npb25QYXJzZXIucGFyc2VUZW1wbGF0ZUJpbmRpbmdzKGtleSwgdGhpcy5hdHRyLnZhbHVlLCBudWxsKTtcblxuICAgICAgLy8gZmluZCB0aGUgdGVtcGxhdGUgYmluZGluZyB0aGF0IGNvbnRhaW5zIHRoZSBwb3NpdGlvblxuICAgICAgaWYgKCF0aGlzLmF0dHIudmFsdWVTcGFuKSByZXR1cm47XG4gICAgICBjb25zdCB2YWx1ZVJlbGF0aXZlUG9zaXRpb24gPSB0aGlzLnBvc2l0aW9uIC0gdGhpcy5hdHRyLnZhbHVlU3Bhbi5zdGFydC5vZmZzZXQgLSAxO1xuICAgICAgY29uc3QgYmluZGluZ3MgPSB0ZW1wbGF0ZUJpbmRpbmdSZXN1bHQudGVtcGxhdGVCaW5kaW5ncztcbiAgICAgIGNvbnN0IGJpbmRpbmcgPVxuICAgICAgICAgIGJpbmRpbmdzLmZpbmQoXG4gICAgICAgICAgICAgIGJpbmRpbmcgPT4gaW5TcGFuKHZhbHVlUmVsYXRpdmVQb3NpdGlvbiwgYmluZGluZy5zcGFuLCAvKiBleGNsdXNpdmUgKi8gdHJ1ZSkpIHx8XG4gICAgICAgICAgYmluZGluZ3MuZmluZChiaW5kaW5nID0+IGluU3Bhbih2YWx1ZVJlbGF0aXZlUG9zaXRpb24sIGJpbmRpbmcuc3BhbikpO1xuXG4gICAgICBjb25zdCBrZXlDb21wbGV0aW9ucyA9ICgpID0+IHtcbiAgICAgICAgbGV0IGtleXM6IHN0cmluZ1tdID0gW107XG4gICAgICAgIGlmIChzZWxlY3Rvcikge1xuICAgICAgICAgIGNvbnN0IGF0dHJOYW1lcyA9IHNlbGVjdG9yLmF0dHJzLmZpbHRlcigoXywgaSkgPT4gaSAlIDIgPT0gMCk7XG4gICAgICAgICAga2V5cyA9IGF0dHJOYW1lcy5maWx0ZXIobmFtZSA9PiBuYW1lLnN0YXJ0c1dpdGgoa2V5KSAmJiBuYW1lICE9IGtleSlcbiAgICAgICAgICAgICAgICAgICAgIC5tYXAobmFtZSA9PiBsb3dlck5hbWUobmFtZS5zdWJzdHIoa2V5Lmxlbmd0aCkpKTtcbiAgICAgICAgfVxuICAgICAgICBrZXlzLnB1c2goJ2xldCcpO1xuICAgICAgICB0aGlzLnJlc3VsdCA9IGtleXMubWFwKGtleSA9PiA8Q29tcGxldGlvbj57a2luZDogJ2tleScsIG5hbWU6IGtleSwgc29ydDoga2V5fSk7XG4gICAgICB9O1xuXG4gICAgICBpZiAoIWJpbmRpbmcgfHwgKGJpbmRpbmcua2V5ID09IGtleSAmJiAhYmluZGluZy5leHByZXNzaW9uKSkge1xuICAgICAgICAvLyBXZSBhcmUgaW4gdGhlIHJvb3QgYmluZGluZy4gV2Ugc2hvdWxkIHJldHVybiBgbGV0YCBhbmQga2V5cyB0aGF0IGFyZSBsZWZ0IGluIHRoZVxuICAgICAgICAvLyBzZWxlY3Rvci5cbiAgICAgICAga2V5Q29tcGxldGlvbnMoKTtcbiAgICAgIH0gZWxzZSBpZiAoYmluZGluZy5rZXlJc1Zhcikge1xuICAgICAgICBjb25zdCBlcXVhbExvY2F0aW9uID0gdGhpcy5hdHRyLnZhbHVlLmluZGV4T2YoJz0nKTtcbiAgICAgICAgdGhpcy5yZXN1bHQgPSBbXTtcbiAgICAgICAgaWYgKGVxdWFsTG9jYXRpb24gPj0gMCAmJiB2YWx1ZVJlbGF0aXZlUG9zaXRpb24gPj0gZXF1YWxMb2NhdGlvbikge1xuICAgICAgICAgIC8vIFdlIGFyZSBhZnRlciB0aGUgJz0nIGluIGEgbGV0IGNsYXVzZS4gVGhlIHZhbGlkIHZhbHVlcyBoZXJlIGFyZSB0aGUgbWVtYmVycyBvZiB0aGVcbiAgICAgICAgICAvLyB0ZW1wbGF0ZSByZWZlcmVuY2UncyB0eXBlIHBhcmFtZXRlci5cbiAgICAgICAgICBjb25zdCBkaXJlY3RpdmVNZXRhZGF0YSA9IHNlbGVjdG9ySW5mby5tYXAuZ2V0KHNlbGVjdG9yKTtcbiAgICAgICAgICBpZiAoZGlyZWN0aXZlTWV0YWRhdGEpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbnRleHRUYWJsZSA9XG4gICAgICAgICAgICAgICAgdGhpcy5pbmZvLnRlbXBsYXRlLnF1ZXJ5LmdldFRlbXBsYXRlQ29udGV4dChkaXJlY3RpdmVNZXRhZGF0YS50eXBlLnJlZmVyZW5jZSk7XG4gICAgICAgICAgICBpZiAoY29udGV4dFRhYmxlKSB7XG4gICAgICAgICAgICAgIHRoaXMucmVzdWx0ID0gdGhpcy5zeW1ib2xzVG9Db21wbGV0aW9ucyhjb250ZXh0VGFibGUudmFsdWVzKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChiaW5kaW5nLmtleSAmJiB2YWx1ZVJlbGF0aXZlUG9zaXRpb24gPD0gKGJpbmRpbmcua2V5Lmxlbmd0aCAtIGtleS5sZW5ndGgpKSB7XG4gICAgICAgICAga2V5Q29tcGxldGlvbnMoKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gSWYgdGhlIHBvc2l0aW9uIGlzIGluIHRoZSBleHByZXNzaW9uIG9yIGFmdGVyIHRoZSBrZXkgb3IgdGhlcmUgaXMgbm8ga2V5LCByZXR1cm4gdGhlXG4gICAgICAgIC8vIGV4cHJlc3Npb24gY29tcGxldGlvbnNcbiAgICAgICAgaWYgKChiaW5kaW5nLmV4cHJlc3Npb24gJiYgaW5TcGFuKHZhbHVlUmVsYXRpdmVQb3NpdGlvbiwgYmluZGluZy5leHByZXNzaW9uLmFzdC5zcGFuKSkgfHxcbiAgICAgICAgICAgIChiaW5kaW5nLmtleSAmJlxuICAgICAgICAgICAgIHZhbHVlUmVsYXRpdmVQb3NpdGlvbiA+IGJpbmRpbmcuc3Bhbi5zdGFydCArIChiaW5kaW5nLmtleS5sZW5ndGggLSBrZXkubGVuZ3RoKSkgfHxcbiAgICAgICAgICAgICFiaW5kaW5nLmtleSkge1xuICAgICAgICAgIGNvbnN0IHNwYW4gPSBuZXcgUGFyc2VTcGFuKDAsIHRoaXMuYXR0ci52YWx1ZS5sZW5ndGgpO1xuICAgICAgICAgIHRoaXMuYXR0cmlidXRlVmFsdWVDb21wbGV0aW9ucyhcbiAgICAgICAgICAgICAgYmluZGluZy5leHByZXNzaW9uID8gYmluZGluZy5leHByZXNzaW9uLmFzdCA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBQcm9wZXJ0eVJlYWQoc3BhbiwgbmV3IEltcGxpY2l0UmVjZWl2ZXIoc3BhbiksICcnKSxcbiAgICAgICAgICAgICAgdmFsdWVSZWxhdGl2ZVBvc2l0aW9uKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBrZXlDb21wbGV0aW9ucygpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgdmlzaXRCb3VuZFRleHQoYXN0OiBCb3VuZFRleHRBc3QpIHtcbiAgICBjb25zdCBleHByZXNzaW9uUG9zaXRpb24gPSB0aGlzLnBvc2l0aW9uIC0gYXN0LnNvdXJjZVNwYW4uc3RhcnQub2Zmc2V0O1xuICAgIGlmIChpblNwYW4oZXhwcmVzc2lvblBvc2l0aW9uLCBhc3QudmFsdWUuc3BhbikpIHtcbiAgICAgIGNvbnN0IGNvbXBsZXRpb25zID0gZ2V0RXhwcmVzc2lvbkNvbXBsZXRpb25zKFxuICAgICAgICAgIHRoaXMuZ2V0RXhwcmVzc2lvblNjb3BlKCksIGFzdC52YWx1ZSwgZXhwcmVzc2lvblBvc2l0aW9uLCB0aGlzLmluZm8udGVtcGxhdGUucXVlcnkpO1xuICAgICAgaWYgKGNvbXBsZXRpb25zKSB7XG4gICAgICAgIHRoaXMucmVzdWx0ID0gdGhpcy5zeW1ib2xzVG9Db21wbGV0aW9ucyhjb21wbGV0aW9ucyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhdHRyaWJ1dGVWYWx1ZUNvbXBsZXRpb25zKHZhbHVlOiBBU1QsIHBvc2l0aW9uPzogbnVtYmVyKSB7XG4gICAgY29uc3Qgc3ltYm9scyA9IGdldEV4cHJlc3Npb25Db21wbGV0aW9ucyhcbiAgICAgICAgdGhpcy5nZXRFeHByZXNzaW9uU2NvcGUoKSwgdmFsdWUsIHBvc2l0aW9uID09IG51bGwgPyB0aGlzLmF0dHJpYnV0ZVZhbHVlUG9zaXRpb24gOiBwb3NpdGlvbixcbiAgICAgICAgdGhpcy5pbmZvLnRlbXBsYXRlLnF1ZXJ5KTtcbiAgICBpZiAoc3ltYm9scykge1xuICAgICAgdGhpcy5yZXN1bHQgPSB0aGlzLnN5bWJvbHNUb0NvbXBsZXRpb25zKHN5bWJvbHMpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgc3ltYm9sc1RvQ29tcGxldGlvbnMoc3ltYm9sczogU3ltYm9sW10pOiBDb21wbGV0aW9ucyB7XG4gICAgcmV0dXJuIHN5bWJvbHMuZmlsdGVyKHMgPT4gIXMubmFtZS5zdGFydHNXaXRoKCdfXycpICYmIHMucHVibGljKVxuICAgICAgICAubWFwKHN5bWJvbCA9PiA8Q29tcGxldGlvbj57a2luZDogc3ltYm9sLmtpbmQsIG5hbWU6IHN5bWJvbC5uYW1lLCBzb3J0OiBzeW1ib2wubmFtZX0pO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXQgYXR0cmlidXRlVmFsdWVQb3NpdGlvbigpIHtcbiAgICBpZiAodGhpcy5hdHRyICYmIHRoaXMuYXR0ci52YWx1ZVNwYW4pIHtcbiAgICAgIHJldHVybiB0aGlzLnBvc2l0aW9uIC0gdGhpcy5hdHRyLnZhbHVlU3Bhbi5zdGFydC5vZmZzZXQgLSAxO1xuICAgIH1cbiAgICByZXR1cm4gMDtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRTb3VyY2VUZXh0KHRlbXBsYXRlOiBUZW1wbGF0ZVNvdXJjZSwgc3BhbjogU3Bhbik6IHN0cmluZyB7XG4gIHJldHVybiB0ZW1wbGF0ZS5zb3VyY2Uuc3Vic3RyaW5nKHNwYW4uc3RhcnQsIHNwYW4uZW5kKTtcbn1cblxuZnVuY3Rpb24gbmFtZU9mQXR0cihhdHRyOiBBdHRySW5mbyk6IHN0cmluZyB7XG4gIGxldCBuYW1lID0gYXR0ci5uYW1lO1xuICBpZiAoYXR0ci5vdXRwdXQpIHtcbiAgICBuYW1lID0gcmVtb3ZlU3VmZml4KG5hbWUsICdFdmVudHMnKTtcbiAgICBuYW1lID0gcmVtb3ZlU3VmZml4KG5hbWUsICdDaGFuZ2VkJyk7XG4gIH1cbiAgbGV0IHJlc3VsdCA9IFtuYW1lXTtcbiAgaWYgKGF0dHIuaW5wdXQpIHtcbiAgICByZXN1bHQudW5zaGlmdCgnWycpO1xuICAgIHJlc3VsdC5wdXNoKCddJyk7XG4gIH1cbiAgaWYgKGF0dHIub3V0cHV0KSB7XG4gICAgcmVzdWx0LnVuc2hpZnQoJygnKTtcbiAgICByZXN1bHQucHVzaCgnKScpO1xuICB9XG4gIGlmIChhdHRyLnRlbXBsYXRlKSB7XG4gICAgcmVzdWx0LnVuc2hpZnQoJyonKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0LmpvaW4oJycpO1xufVxuXG5jb25zdCB0ZW1wbGF0ZUF0dHIgPSAvXihcXHcrOik/KHRlbXBsYXRlJHxeXFwqKS87XG5mdW5jdGlvbiBjcmVhdGVFbGVtZW50Q3NzU2VsZWN0b3IoZWxlbWVudDogRWxlbWVudCk6IENzc1NlbGVjdG9yIHtcbiAgY29uc3QgY3NzU2VsZWN0b3IgPSBuZXcgQ3NzU2VsZWN0b3IoKTtcbiAgbGV0IGVsTmFtZU5vTnMgPSBzcGxpdE5zTmFtZShlbGVtZW50Lm5hbWUpWzFdO1xuXG4gIGNzc1NlbGVjdG9yLnNldEVsZW1lbnQoZWxOYW1lTm9Ocyk7XG5cbiAgZm9yIChsZXQgYXR0ciBvZiBlbGVtZW50LmF0dHJzKSB7XG4gICAgaWYgKCFhdHRyLm5hbWUubWF0Y2godGVtcGxhdGVBdHRyKSkge1xuICAgICAgbGV0IFtfLCBhdHRyTmFtZU5vTnNdID0gc3BsaXROc05hbWUoYXR0ci5uYW1lKTtcbiAgICAgIGNzc1NlbGVjdG9yLmFkZEF0dHJpYnV0ZShhdHRyTmFtZU5vTnMsIGF0dHIudmFsdWUpO1xuICAgICAgaWYgKGF0dHIubmFtZS50b0xvd2VyQ2FzZSgpID09ICdjbGFzcycpIHtcbiAgICAgICAgY29uc3QgY2xhc3NlcyA9IGF0dHIudmFsdWUuc3BsaXQoL3MrL2cpO1xuICAgICAgICBjbGFzc2VzLmZvckVhY2goY2xhc3NOYW1lID0+IGNzc1NlbGVjdG9yLmFkZENsYXNzTmFtZShjbGFzc05hbWUpKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIGNzc1NlbGVjdG9yO1xufVxuXG5mdW5jdGlvbiBmb2xkQXR0cnMoYXR0cnM6IEF0dHJJbmZvW10pOiBBdHRySW5mb1tdIHtcbiAgbGV0IGlucHV0T3V0cHV0ID0gbmV3IE1hcDxzdHJpbmcsIEF0dHJJbmZvPigpO1xuICBsZXQgdGVtcGxhdGVzID0gbmV3IE1hcDxzdHJpbmcsIEF0dHJJbmZvPigpO1xuICBsZXQgcmVzdWx0OiBBdHRySW5mb1tdID0gW107XG4gIGF0dHJzLmZvckVhY2goYXR0ciA9PiB7XG4gICAgaWYgKGF0dHIuZnJvbUh0bWwpIHtcbiAgICAgIHJldHVybiBhdHRyO1xuICAgIH1cbiAgICBpZiAoYXR0ci50ZW1wbGF0ZSkge1xuICAgICAgbGV0IGR1cGxpY2F0ZSA9IHRlbXBsYXRlcy5nZXQoYXR0ci5uYW1lKTtcbiAgICAgIGlmICghZHVwbGljYXRlKSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKHtuYW1lOiBhdHRyLm5hbWUsIHRlbXBsYXRlOiB0cnVlfSk7XG4gICAgICAgIHRlbXBsYXRlcy5zZXQoYXR0ci5uYW1lLCBhdHRyKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGF0dHIuaW5wdXQgfHwgYXR0ci5vdXRwdXQpIHtcbiAgICAgIGxldCBkdXBsaWNhdGUgPSBpbnB1dE91dHB1dC5nZXQoYXR0ci5uYW1lKTtcbiAgICAgIGlmIChkdXBsaWNhdGUpIHtcbiAgICAgICAgZHVwbGljYXRlLmlucHV0ID0gZHVwbGljYXRlLmlucHV0IHx8IGF0dHIuaW5wdXQ7XG4gICAgICAgIGR1cGxpY2F0ZS5vdXRwdXQgPSBkdXBsaWNhdGUub3V0cHV0IHx8IGF0dHIub3V0cHV0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IGNsb25lQXR0cjogQXR0ckluZm8gPSB7bmFtZTogYXR0ci5uYW1lfTtcbiAgICAgICAgaWYgKGF0dHIuaW5wdXQpIGNsb25lQXR0ci5pbnB1dCA9IHRydWU7XG4gICAgICAgIGlmIChhdHRyLm91dHB1dCkgY2xvbmVBdHRyLm91dHB1dCA9IHRydWU7XG4gICAgICAgIHJlc3VsdC5wdXNoKGNsb25lQXR0cik7XG4gICAgICAgIGlucHV0T3V0cHV0LnNldChhdHRyLm5hbWUsIGNsb25lQXR0cik7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gZXhwYW5kZWRBdHRyKGF0dHI6IEF0dHJJbmZvKTogQXR0ckluZm9bXSB7XG4gIGlmIChhdHRyLmlucHV0ICYmIGF0dHIub3V0cHV0KSB7XG4gICAgcmV0dXJuIFtcbiAgICAgIGF0dHIsIHtuYW1lOiBhdHRyLm5hbWUsIGlucHV0OiB0cnVlLCBvdXRwdXQ6IGZhbHNlfSxcbiAgICAgIHtuYW1lOiBhdHRyLm5hbWUsIGlucHV0OiBmYWxzZSwgb3V0cHV0OiB0cnVlfVxuICAgIF07XG4gIH1cbiAgcmV0dXJuIFthdHRyXTtcbn1cblxuZnVuY3Rpb24gbG93ZXJOYW1lKG5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBuYW1lICYmIChuYW1lWzBdLnRvTG93ZXJDYXNlKCkgKyBuYW1lLnN1YnN0cigxKSk7XG59XG4iXX0=