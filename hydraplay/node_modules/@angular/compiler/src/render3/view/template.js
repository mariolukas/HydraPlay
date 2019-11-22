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
        define("@angular/compiler/src/render3/view/template", ["require", "exports", "tslib", "@angular/compiler/src/compile_metadata", "@angular/compiler/src/compiler_util/expression_converter", "@angular/compiler/src/core", "@angular/compiler/src/expression_parser/ast", "@angular/compiler/src/expression_parser/lexer", "@angular/compiler/src/expression_parser/parser", "@angular/compiler/src/ml_parser/ast", "@angular/compiler/src/ml_parser/html_parser", "@angular/compiler/src/ml_parser/html_whitespaces", "@angular/compiler/src/ml_parser/interpolation_config", "@angular/compiler/src/ml_parser/tags", "@angular/compiler/src/output/map_util", "@angular/compiler/src/output/output_ast", "@angular/compiler/src/schema/dom_element_schema_registry", "@angular/compiler/src/selector", "@angular/compiler/src/template_parser/binding_parser", "@angular/compiler/src/util", "@angular/compiler/src/render3/r3_ast", "@angular/compiler/src/render3/r3_identifiers", "@angular/compiler/src/render3/r3_template_transform", "@angular/compiler/src/render3/util", "@angular/compiler/src/render3/view/i18n/context", "@angular/compiler/src/render3/view/i18n/meta", "@angular/compiler/src/render3/view/i18n/serializer", "@angular/compiler/src/render3/view/i18n/util", "@angular/compiler/src/render3/view/styling_builder", "@angular/compiler/src/render3/view/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var compile_metadata_1 = require("@angular/compiler/src/compile_metadata");
    var expression_converter_1 = require("@angular/compiler/src/compiler_util/expression_converter");
    var core = require("@angular/compiler/src/core");
    var ast_1 = require("@angular/compiler/src/expression_parser/ast");
    var lexer_1 = require("@angular/compiler/src/expression_parser/lexer");
    var parser_1 = require("@angular/compiler/src/expression_parser/parser");
    var html = require("@angular/compiler/src/ml_parser/ast");
    var html_parser_1 = require("@angular/compiler/src/ml_parser/html_parser");
    var html_whitespaces_1 = require("@angular/compiler/src/ml_parser/html_whitespaces");
    var interpolation_config_1 = require("@angular/compiler/src/ml_parser/interpolation_config");
    var tags_1 = require("@angular/compiler/src/ml_parser/tags");
    var map_util_1 = require("@angular/compiler/src/output/map_util");
    var o = require("@angular/compiler/src/output/output_ast");
    var dom_element_schema_registry_1 = require("@angular/compiler/src/schema/dom_element_schema_registry");
    var selector_1 = require("@angular/compiler/src/selector");
    var binding_parser_1 = require("@angular/compiler/src/template_parser/binding_parser");
    var util_1 = require("@angular/compiler/src/util");
    var t = require("@angular/compiler/src/render3/r3_ast");
    var r3_identifiers_1 = require("@angular/compiler/src/render3/r3_identifiers");
    var r3_template_transform_1 = require("@angular/compiler/src/render3/r3_template_transform");
    var util_2 = require("@angular/compiler/src/render3/util");
    var context_1 = require("@angular/compiler/src/render3/view/i18n/context");
    var meta_1 = require("@angular/compiler/src/render3/view/i18n/meta");
    var serializer_1 = require("@angular/compiler/src/render3/view/i18n/serializer");
    var util_3 = require("@angular/compiler/src/render3/view/i18n/util");
    var styling_builder_1 = require("@angular/compiler/src/render3/view/styling_builder");
    var util_4 = require("@angular/compiler/src/render3/view/util");
    function mapBindingToInstruction(type) {
        switch (type) {
            case 0 /* Property */:
            case 4 /* Animation */:
                return r3_identifiers_1.Identifiers.elementProperty;
            case 2 /* Class */:
                return r3_identifiers_1.Identifiers.elementClassProp;
            case 1 /* Attribute */:
                return r3_identifiers_1.Identifiers.elementAttribute;
            default:
                return undefined;
        }
    }
    //  if (rf & flags) { .. }
    function renderFlagCheckIfStmt(flags, statements) {
        return o.ifStmt(o.variable(util_4.RENDER_FLAGS).bitwiseAnd(o.literal(flags), null, false), statements);
    }
    exports.renderFlagCheckIfStmt = renderFlagCheckIfStmt;
    // Default selector used by `<ng-content>` if none specified
    var DEFAULT_NG_CONTENT_SELECTOR = '*';
    // Selector attribute name of `<ng-content>`
    var NG_CONTENT_SELECT_ATTR = 'select';
    var TemplateDefinitionBuilder = /** @class */ (function () {
        function TemplateDefinitionBuilder(constantPool, parentBindingScope, level, contextName, i18nContext, templateIndex, templateName, viewQueries, directiveMatcher, directives, pipeTypeByName, pipes, _namespace, relativeContextFilePath, i18nUseExternalIds) {
            if (level === void 0) { level = 0; }
            var _this = this;
            this.constantPool = constantPool;
            this.level = level;
            this.contextName = contextName;
            this.i18nContext = i18nContext;
            this.templateIndex = templateIndex;
            this.templateName = templateName;
            this.viewQueries = viewQueries;
            this.directiveMatcher = directiveMatcher;
            this.directives = directives;
            this.pipeTypeByName = pipeTypeByName;
            this.pipes = pipes;
            this._namespace = _namespace;
            this.relativeContextFilePath = relativeContextFilePath;
            this.i18nUseExternalIds = i18nUseExternalIds;
            this._dataIndex = 0;
            this._bindingContext = 0;
            this._prefixCode = [];
            /**
             * List of callbacks to generate creation mode instructions. We store them here as we process
             * the template so bindings in listeners are resolved only once all nodes have been visited.
             * This ensures all local refs and context variables are available for matching.
             */
            this._creationCodeFns = [];
            /**
             * List of callbacks to generate update mode instructions. We store them here as we process
             * the template so bindings are resolved only once all nodes have been visited. This ensures
             * all local refs and context variables are available for matching.
             */
            this._updateCodeFns = [];
            /** Temporary variable declarations generated from visiting pipes, literals, etc. */
            this._tempVariables = [];
            /**
             * List of callbacks to build nested templates. Nested templates must not be visited until
             * after the parent template has finished visiting all of its nodes. This ensures that all
             * local ref bindings in nested templates are able to find local ref values if the refs
             * are defined after the template declaration.
             */
            this._nestedTemplateFns = [];
            this._unsupported = util_4.unsupported;
            // i18n context local to this template
            this.i18n = null;
            // Number of slots to reserve for pureFunctions
            this._pureFunctionSlots = 0;
            // Number of binding slots
            this._bindingSlots = 0;
            // Whether the template includes <ng-content> tags.
            this._hasNgContent = false;
            // Selectors found in the <ng-content> tags in the template.
            this._ngContentSelectors = [];
            // Number of non-default selectors found in all parent templates of this template. We need to
            // track it to properly adjust projection bucket index in the `projection` instruction.
            this._ngContentSelectorsOffset = 0;
            // These should be handled in the template or element directly.
            this.visitReference = util_4.invalid;
            this.visitVariable = util_4.invalid;
            this.visitTextAttribute = util_4.invalid;
            this.visitBoundAttribute = util_4.invalid;
            this.visitBoundEvent = util_4.invalid;
            // view queries can take up space in data and allocation happens earlier (in the "viewQuery"
            // function)
            this._dataIndex = viewQueries.length;
            this._bindingScope = parentBindingScope.nestedScope(level);
            // Turn the relative context file path into an identifier by replacing non-alphanumeric
            // characters with underscores.
            this.fileBasedI18nSuffix = relativeContextFilePath.replace(/[^A-Za-z0-9]/g, '_') + '_';
            this._valueConverter = new ValueConverter(constantPool, function () { return _this.allocateDataSlot(); }, function (numSlots) { return _this.allocatePureFunctionSlots(numSlots); }, function (name, localName, slot, value) {
                var pipeType = pipeTypeByName.get(name);
                if (pipeType) {
                    _this.pipes.add(pipeType);
                }
                _this._bindingScope.set(_this.level, localName, value);
                _this.creationInstruction(null, r3_identifiers_1.Identifiers.pipe, [o.literal(slot), o.literal(name)]);
            });
        }
        TemplateDefinitionBuilder.prototype.registerContextVariables = function (variable) {
            var scopedName = this._bindingScope.freshReferenceName();
            var retrievalLevel = this.level;
            var lhs = o.variable(variable.name + scopedName);
            this._bindingScope.set(retrievalLevel, variable.name, lhs, 1 /* CONTEXT */, function (scope, relativeLevel) {
                var rhs;
                if (scope.bindingLevel === retrievalLevel) {
                    // e.g. ctx
                    rhs = o.variable(util_4.CONTEXT_NAME);
                }
                else {
                    var sharedCtxVar = scope.getSharedContextName(retrievalLevel);
                    // e.g. ctx_r0   OR  x(2);
                    rhs = sharedCtxVar ? sharedCtxVar : generateNextContextExpr(relativeLevel);
                }
                // e.g. const $item$ = x(2).$implicit;
                return [lhs.set(rhs.prop(variable.value || util_4.IMPLICIT_REFERENCE)).toConstDecl()];
            });
        };
        TemplateDefinitionBuilder.prototype.buildTemplateFunction = function (nodes, variables, ngContentSelectorsOffset, i18n) {
            var _this = this;
            if (ngContentSelectorsOffset === void 0) { ngContentSelectorsOffset = 0; }
            this._ngContentSelectorsOffset = ngContentSelectorsOffset;
            if (this._namespace !== r3_identifiers_1.Identifiers.namespaceHTML) {
                this.creationInstruction(null, this._namespace);
            }
            // Create variable bindings
            variables.forEach(function (v) { return _this.registerContextVariables(v); });
            // Initiate i18n context in case:
            // - this template has parent i18n context
            // - or the template has i18n meta associated with it,
            //   but it's not initiated by the Element (e.g. <ng-template i18n>)
            var initI18nContext = this.i18nContext || (util_3.isI18nRootNode(i18n) && !util_3.isSingleI18nIcu(i18n) &&
                !(isSingleElementTemplate(nodes) && nodes[0].i18n === i18n));
            var selfClosingI18nInstruction = hasTextChildrenOnly(nodes);
            if (initI18nContext) {
                this.i18nStart(null, i18n, selfClosingI18nInstruction);
            }
            // This is the initial pass through the nodes of this template. In this pass, we
            // queue all creation mode and update mode instructions for generation in the second
            // pass. It's necessary to separate the passes to ensure local refs are defined before
            // resolving bindings. We also count bindings in this pass as we walk bound expressions.
            t.visitAll(this, nodes);
            // Add total binding count to pure function count so pure function instructions are
            // generated with the correct slot offset when update instructions are processed.
            this._pureFunctionSlots += this._bindingSlots;
            // Pipes are walked in the first pass (to enqueue `pipe()` creation instructions and
            // `pipeBind` update instructions), so we have to update the slot offsets manually
            // to account for bindings.
            this._valueConverter.updatePipeSlotOffsets(this._bindingSlots);
            // Nested templates must be processed before creation instructions so template()
            // instructions can be generated with the correct internal const count.
            this._nestedTemplateFns.forEach(function (buildTemplateFn) { return buildTemplateFn(); });
            // Output the `projectionDef` instruction when some `<ng-content>` are present.
            // The `projectionDef` instruction only emitted for the component template and it is skipped for
            // nested templates (<ng-template> tags).
            if (this.level === 0 && this._hasNgContent) {
                var parameters = [];
                // Only selectors with a non-default value are generated
                if (this._ngContentSelectors.length) {
                    var r3Selectors = this._ngContentSelectors.map(function (s) { return core.parseSelectorToR3Selector(s); });
                    // `projectionDef` needs both the parsed and raw value of the selectors
                    var parsed = this.constantPool.getConstLiteral(util_4.asLiteral(r3Selectors), true);
                    var unParsed = this.constantPool.getConstLiteral(util_4.asLiteral(this._ngContentSelectors), true);
                    parameters.push(parsed, unParsed);
                }
                // Since we accumulate ngContent selectors while processing template elements,
                // we *prepend* `projectionDef` to creation instructions block, to put it before
                // any `projection` instructions
                this.creationInstruction(null, r3_identifiers_1.Identifiers.projectionDef, parameters, /* prepend */ true);
            }
            if (initI18nContext) {
                this.i18nEnd(null, selfClosingI18nInstruction);
            }
            // Generate all the creation mode instructions (e.g. resolve bindings in listeners)
            var creationStatements = this._creationCodeFns.map(function (fn) { return fn(); });
            // Generate all the update mode instructions (e.g. resolve property or text bindings)
            var updateStatements = this._updateCodeFns.map(function (fn) { return fn(); });
            //  Variable declaration must occur after binding resolution so we can generate context
            //  instructions that build on each other.
            // e.g. const b = nextContext().$implicit(); const b = nextContext();
            var creationVariables = this._bindingScope.viewSnapshotStatements();
            var updateVariables = this._bindingScope.variableDeclarations().concat(this._tempVariables);
            var creationBlock = creationStatements.length > 0 ?
                [renderFlagCheckIfStmt(1 /* Create */, creationVariables.concat(creationStatements))] :
                [];
            var updateBlock = updateStatements.length > 0 ?
                [renderFlagCheckIfStmt(2 /* Update */, updateVariables.concat(updateStatements))] :
                [];
            return o.fn(
            // i.e. (rf: RenderFlags, ctx: any)
            [new o.FnParam(util_4.RENDER_FLAGS, o.NUMBER_TYPE), new o.FnParam(util_4.CONTEXT_NAME, null)], tslib_1.__spread(this._prefixCode, creationBlock, updateBlock), o.INFERRED_TYPE, null, this.templateName);
        };
        // LocalResolver
        TemplateDefinitionBuilder.prototype.getLocal = function (name) { return this._bindingScope.get(name); };
        TemplateDefinitionBuilder.prototype.i18nTranslate = function (message, params, ref, transformFn) {
            if (params === void 0) { params = {}; }
            var _a;
            var _ref = ref || this.i18nAllocateRef(message.id);
            var _params = {};
            if (params && Object.keys(params).length) {
                Object.keys(params).forEach(function (key) { return _params[util_3.formatI18nPlaceholderName(key)] = params[key]; });
            }
            var meta = util_3.metaFromI18nMessage(message);
            var content = serializer_1.getSerializedI18nContent(message);
            var statements = util_3.getTranslationDeclStmts(_ref, content, meta, _params, transformFn);
            (_a = this.constantPool.statements).push.apply(_a, tslib_1.__spread(statements));
            return _ref;
        };
        TemplateDefinitionBuilder.prototype.i18nAppendBindings = function (expressions) {
            var _this = this;
            if (!this.i18n || !expressions.length)
                return;
            var implicit = o.variable(util_4.CONTEXT_NAME);
            expressions.forEach(function (expression) {
                var binding = _this.convertExpressionBinding(implicit, expression);
                _this.i18n.appendBinding(binding);
            });
        };
        TemplateDefinitionBuilder.prototype.i18nBindProps = function (props) {
            var _this = this;
            var bound = {};
            Object.keys(props).forEach(function (key) {
                var prop = props[key];
                if (prop instanceof t.Text) {
                    bound[key] = o.literal(prop.value);
                }
                else {
                    var value = prop.value.visit(_this._valueConverter);
                    _this.allocateBindingSlots(value);
                    if (value instanceof ast_1.Interpolation) {
                        var strings = value.strings, expressions = value.expressions;
                        var _a = _this.i18n, id = _a.id, bindings = _a.bindings;
                        var label = util_3.assembleI18nBoundString(strings, bindings.size, id);
                        _this.i18nAppendBindings(expressions);
                        bound[key] = o.literal(label);
                    }
                }
            });
            return bound;
        };
        TemplateDefinitionBuilder.prototype.i18nAllocateRef = function (messageId) {
            var name;
            var suffix = this.fileBasedI18nSuffix.toUpperCase();
            if (this.i18nUseExternalIds) {
                var prefix = util_3.getTranslationConstPrefix("EXTERNAL_");
                var uniqueSuffix = this.constantPool.uniqueName(suffix);
                name = "" + prefix + messageId + "$$" + uniqueSuffix;
            }
            else {
                var prefix = util_3.getTranslationConstPrefix(suffix);
                name = this.constantPool.uniqueName(prefix);
            }
            return o.variable(name);
        };
        TemplateDefinitionBuilder.prototype.i18nUpdateRef = function (context) {
            var icus = context.icus, meta = context.meta, isRoot = context.isRoot, isResolved = context.isResolved;
            if (isRoot && isResolved && !util_3.isSingleI18nIcu(meta)) {
                var placeholders = context.getSerializedPlaceholders();
                var icuMapping_1 = {};
                var params_1 = placeholders.size ? util_3.placeholdersToParams(placeholders) : {};
                if (icus.size) {
                    icus.forEach(function (refs, key) {
                        if (refs.length === 1) {
                            // if we have one ICU defined for a given
                            // placeholder - just output its reference
                            params_1[key] = refs[0];
                        }
                        else {
                            // ... otherwise we need to activate post-processing
                            // to replace ICU placeholders with proper values
                            var placeholder = util_3.wrapI18nPlaceholder("" + util_3.I18N_ICU_MAPPING_PREFIX + key);
                            params_1[key] = o.literal(placeholder);
                            icuMapping_1[key] = o.literalArr(refs);
                        }
                    });
                }
                // translation requires post processing in 2 cases:
                // - if we have placeholders with multiple values (ex. `START_DIV`: [�#1�, �#2�, ...])
                // - if we have multiple ICUs that refer to the same placeholder name
                var needsPostprocessing = Array.from(placeholders.values()).some(function (value) { return value.length > 1; }) ||
                    Object.keys(icuMapping_1).length;
                var transformFn = void 0;
                if (needsPostprocessing) {
                    transformFn = function (raw) {
                        var args = [raw];
                        if (Object.keys(icuMapping_1).length) {
                            args.push(map_util_1.mapLiteral(icuMapping_1, true));
                        }
                        return instruction(null, r3_identifiers_1.Identifiers.i18nPostprocess, args);
                    };
                }
                this.i18nTranslate(meta, params_1, context.ref, transformFn);
            }
        };
        TemplateDefinitionBuilder.prototype.i18nStart = function (span, meta, selfClosing) {
            if (span === void 0) { span = null; }
            var index = this.allocateDataSlot();
            if (this.i18nContext) {
                this.i18n = this.i18nContext.forkChildContext(index, this.templateIndex, meta);
            }
            else {
                var ref_1 = this.i18nAllocateRef(meta.id);
                this.i18n = new context_1.I18nContext(index, ref_1, 0, this.templateIndex, meta);
            }
            // generate i18nStart instruction
            var _a = this.i18n, id = _a.id, ref = _a.ref;
            var params = [o.literal(index), ref];
            if (id > 0) {
                // do not push 3rd argument (sub-block id)
                // into i18nStart call for top level i18n context
                params.push(o.literal(id));
            }
            this.creationInstruction(span, selfClosing ? r3_identifiers_1.Identifiers.i18n : r3_identifiers_1.Identifiers.i18nStart, params);
        };
        TemplateDefinitionBuilder.prototype.i18nEnd = function (span, selfClosing) {
            var _this = this;
            if (span === void 0) { span = null; }
            if (!this.i18n) {
                throw new Error('i18nEnd is executed with no i18n context present');
            }
            if (this.i18nContext) {
                this.i18nContext.reconcileChildContext(this.i18n);
                this.i18nUpdateRef(this.i18nContext);
            }
            else {
                this.i18nUpdateRef(this.i18n);
            }
            // setup accumulated bindings
            var _a = this.i18n, index = _a.index, bindings = _a.bindings;
            if (bindings.size) {
                bindings.forEach(function (binding) { return _this.updateInstruction(span, r3_identifiers_1.Identifiers.i18nExp, [binding]); });
                this.updateInstruction(span, r3_identifiers_1.Identifiers.i18nApply, [o.literal(index)]);
            }
            if (!selfClosing) {
                this.creationInstruction(span, r3_identifiers_1.Identifiers.i18nEnd);
            }
            this.i18n = null; // reset local i18n context
        };
        TemplateDefinitionBuilder.prototype.visitContent = function (ngContent) {
            this._hasNgContent = true;
            var slot = this.allocateDataSlot();
            var selectorIndex = ngContent.selector === DEFAULT_NG_CONTENT_SELECTOR ?
                0 :
                this._ngContentSelectors.push(ngContent.selector) + this._ngContentSelectorsOffset;
            var parameters = [o.literal(slot)];
            var attributeAsList = [];
            ngContent.attributes.forEach(function (attribute) {
                var name = attribute.name, value = attribute.value;
                if (name.toLowerCase() !== NG_CONTENT_SELECT_ATTR) {
                    attributeAsList.push(name, value);
                }
            });
            if (attributeAsList.length > 0) {
                parameters.push(o.literal(selectorIndex), util_4.asLiteral(attributeAsList));
            }
            else if (selectorIndex !== 0) {
                parameters.push(o.literal(selectorIndex));
            }
            this.creationInstruction(ngContent.sourceSpan, r3_identifiers_1.Identifiers.projection, parameters);
        };
        TemplateDefinitionBuilder.prototype.getNamespaceInstruction = function (namespaceKey) {
            switch (namespaceKey) {
                case 'math':
                    return r3_identifiers_1.Identifiers.namespaceMathML;
                case 'svg':
                    return r3_identifiers_1.Identifiers.namespaceSVG;
                default:
                    return r3_identifiers_1.Identifiers.namespaceHTML;
            }
        };
        TemplateDefinitionBuilder.prototype.addNamespaceInstruction = function (nsInstruction, element) {
            this._namespace = nsInstruction;
            this.creationInstruction(element.sourceSpan, nsInstruction);
        };
        TemplateDefinitionBuilder.prototype.visitElement = function (element) {
            var _this = this;
            var e_1, _a;
            var elementIndex = this.allocateDataSlot();
            var stylingBuilder = new styling_builder_1.StylingBuilder(o.literal(elementIndex), null);
            var isNonBindableMode = false;
            var isI18nRootElement = util_3.isI18nRootNode(element.i18n) && !util_3.isSingleI18nIcu(element.i18n);
            if (isI18nRootElement && this.i18n) {
                throw new Error("Could not mark an element as translatable inside of a translatable section");
            }
            var i18nAttrs = [];
            var outputAttrs = [];
            var _b = tslib_1.__read(tags_1.splitNsName(element.name), 2), namespaceKey = _b[0], elementName = _b[1];
            var isNgContainer = tags_1.isNgContainer(element.name);
            try {
                // Handle styling, i18n, ngNonBindable attributes
                for (var _c = tslib_1.__values(element.attributes), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var attr = _d.value;
                    var name_1 = attr.name, value = attr.value;
                    if (name_1 === util_4.NON_BINDABLE_ATTR) {
                        isNonBindableMode = true;
                    }
                    else if (name_1 === 'style') {
                        stylingBuilder.registerStyleAttr(value);
                    }
                    else if (name_1 === 'class') {
                        stylingBuilder.registerClassAttr(value);
                    }
                    else if (attr.i18n) {
                        i18nAttrs.push(attr);
                    }
                    else {
                        outputAttrs.push(attr);
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_1) throw e_1.error; }
            }
            // Match directives on non i18n attributes
            this.matchDirectives(element.name, element);
            // Regular element or ng-container creation mode
            var parameters = [o.literal(elementIndex)];
            if (!isNgContainer) {
                parameters.push(o.literal(elementName));
            }
            // Add the attributes
            var attributes = [];
            var allOtherInputs = [];
            element.inputs.forEach(function (input) {
                if (!stylingBuilder.registerBoundInput(input)) {
                    if (input.type === 0 /* Property */) {
                        if (input.i18n) {
                            i18nAttrs.push(input);
                        }
                        else {
                            allOtherInputs.push(input);
                        }
                    }
                    else {
                        allOtherInputs.push(input);
                    }
                }
            });
            outputAttrs.forEach(function (attr) { return attributes.push(o.literal(attr.name), o.literal(attr.value)); });
            // this will build the instructions so that they fall into the following syntax
            // add attributes for directive matching purposes
            attributes.push.apply(attributes, tslib_1.__spread(this.prepareSyntheticAndSelectOnlyAttrs(allOtherInputs, element.outputs, stylingBuilder)));
            parameters.push(this.toAttrsParam(attributes));
            // local refs (ex.: <div #foo #bar="baz">)
            parameters.push(this.prepareRefsParameter(element.references));
            var wasInNamespace = this._namespace;
            var currentNamespace = this.getNamespaceInstruction(namespaceKey);
            // If the namespace is changing now, include an instruction to change it
            // during element creation.
            if (currentNamespace !== wasInNamespace) {
                this.addNamespaceInstruction(currentNamespace, element);
            }
            var implicit = o.variable(util_4.CONTEXT_NAME);
            if (this.i18n) {
                this.i18n.appendElement(element.i18n, elementIndex);
            }
            var hasChildren = function () {
                if (!isI18nRootElement && _this.i18n) {
                    // we do not append text node instructions and ICUs inside i18n section,
                    // so we exclude them while calculating whether current element has children
                    return !hasTextChildrenOnly(element.children);
                }
                return element.children.length > 0;
            };
            var createSelfClosingInstruction = !stylingBuilder.hasBindingsOrInitialValues() &&
                !isNgContainer && element.outputs.length === 0 && i18nAttrs.length === 0 && !hasChildren();
            var createSelfClosingI18nInstruction = !createSelfClosingInstruction &&
                !stylingBuilder.hasBindingsOrInitialValues() && hasTextChildrenOnly(element.children);
            if (createSelfClosingInstruction) {
                this.creationInstruction(element.sourceSpan, r3_identifiers_1.Identifiers.element, util_4.trimTrailingNulls(parameters));
            }
            else {
                this.creationInstruction(element.sourceSpan, isNgContainer ? r3_identifiers_1.Identifiers.elementContainerStart : r3_identifiers_1.Identifiers.elementStart, util_4.trimTrailingNulls(parameters));
                if (isNonBindableMode) {
                    this.creationInstruction(element.sourceSpan, r3_identifiers_1.Identifiers.disableBindings);
                }
                if (isI18nRootElement) {
                    this.i18nStart(element.sourceSpan, element.i18n, createSelfClosingI18nInstruction);
                }
                // process i18n element attributes
                if (i18nAttrs.length) {
                    var hasBindings_1 = false;
                    var i18nAttrArgs_1 = [];
                    i18nAttrs.forEach(function (attr) {
                        var message = attr.i18n;
                        if (attr instanceof t.TextAttribute) {
                            i18nAttrArgs_1.push(o.literal(attr.name), _this.i18nTranslate(message));
                        }
                        else {
                            var converted = attr.value.visit(_this._valueConverter);
                            _this.allocateBindingSlots(converted);
                            if (converted instanceof ast_1.Interpolation) {
                                var placeholders = util_3.assembleBoundTextPlaceholders(message);
                                var params = util_3.placeholdersToParams(placeholders);
                                i18nAttrArgs_1.push(o.literal(attr.name), _this.i18nTranslate(message, params));
                                converted.expressions.forEach(function (expression) {
                                    hasBindings_1 = true;
                                    var binding = _this.convertExpressionBinding(implicit, expression);
                                    _this.updateInstruction(element.sourceSpan, r3_identifiers_1.Identifiers.i18nExp, [binding]);
                                });
                            }
                        }
                    });
                    if (i18nAttrArgs_1.length) {
                        var index = o.literal(this.allocateDataSlot());
                        var args = this.constantPool.getConstLiteral(o.literalArr(i18nAttrArgs_1), true);
                        this.creationInstruction(element.sourceSpan, r3_identifiers_1.Identifiers.i18nAttributes, [index, args]);
                        if (hasBindings_1) {
                            this.updateInstruction(element.sourceSpan, r3_identifiers_1.Identifiers.i18nApply, [index]);
                        }
                    }
                }
                // The style bindings code is placed into two distinct blocks within the template function AOT
                // code: creation and update. The creation code contains the `elementStyling` instructions
                // which will apply the collected binding values to the element. `elementStyling` is
                // designed to run inside of `elementStart` and `elementEnd`. The update instructions
                // (things like `elementStyleProp`, `elementClassProp`, etc..) are applied later on in this
                // file
                this.processStylingInstruction(implicit, stylingBuilder.buildElementStylingInstruction(element.sourceSpan, this.constantPool), true);
                // Generate Listeners (outputs)
                element.outputs.forEach(function (outputAst) {
                    _this.creationInstruction(outputAst.sourceSpan, r3_identifiers_1.Identifiers.listener, _this.prepareListenerParameter(element.name, outputAst, elementIndex));
                });
            }
            // the code here will collect all update-level styling instructions and add them to the
            // update block of the template function AOT code. Instructions like `elementStyleProp`,
            // `elementStylingMap`, `elementClassProp` and `elementStylingApply` are all generated
            // and assign in the code below.
            stylingBuilder.buildUpdateLevelInstructions(this._valueConverter).forEach(function (instruction) {
                _this.processStylingInstruction(implicit, instruction, false);
            });
            // Generate element input bindings
            allOtherInputs.forEach(function (input) {
                var instruction = mapBindingToInstruction(input.type);
                if (input.type === 4 /* Animation */) {
                    var value_1 = input.value.visit(_this._valueConverter);
                    // setProperty without a value doesn't make any sense
                    if (value_1.name || value_1.value) {
                        var bindingName_1 = util_2.prepareSyntheticPropertyName(input.name);
                        _this.allocateBindingSlots(value_1);
                        _this.updateInstruction(input.sourceSpan, r3_identifiers_1.Identifiers.elementProperty, function () {
                            return [
                                o.literal(elementIndex), o.literal(bindingName_1),
                                _this.convertPropertyBinding(implicit, value_1)
                            ];
                        });
                    }
                }
                else if (instruction) {
                    var params_2 = [];
                    var sanitizationRef = resolveSanitizationFn(input, input.securityContext);
                    if (sanitizationRef)
                        params_2.push(sanitizationRef);
                    // TODO(chuckj): runtime: security context
                    var value_2 = input.value.visit(_this._valueConverter);
                    _this.allocateBindingSlots(value_2);
                    _this.updateInstruction(input.sourceSpan, instruction, function () {
                        return tslib_1.__spread([
                            o.literal(elementIndex), o.literal(input.name),
                            _this.convertPropertyBinding(implicit, value_2)
                        ], params_2);
                    });
                }
                else {
                    _this._unsupported("binding type " + input.type);
                }
            });
            // Traverse element child nodes
            t.visitAll(this, element.children);
            if (!isI18nRootElement && this.i18n) {
                this.i18n.appendElement(element.i18n, elementIndex, true);
            }
            if (!createSelfClosingInstruction) {
                // Finish element construction mode.
                var span = element.endSourceSpan || element.sourceSpan;
                if (isI18nRootElement) {
                    this.i18nEnd(span, createSelfClosingI18nInstruction);
                }
                if (isNonBindableMode) {
                    this.creationInstruction(span, r3_identifiers_1.Identifiers.enableBindings);
                }
                this.creationInstruction(span, isNgContainer ? r3_identifiers_1.Identifiers.elementContainerEnd : r3_identifiers_1.Identifiers.elementEnd);
            }
        };
        TemplateDefinitionBuilder.prototype.visitTemplate = function (template) {
            var _this = this;
            var templateIndex = this.allocateDataSlot();
            if (this.i18n) {
                this.i18n.appendTemplate(template.i18n, templateIndex);
            }
            var tagName = compile_metadata_1.sanitizeIdentifier(template.tagName || '');
            var contextName = (tagName ? this.contextName + '_' + tagName : '') + "_" + templateIndex;
            var templateName = contextName + "_Template";
            var parameters = [
                o.literal(templateIndex),
                o.variable(templateName),
                o.literal(template.tagName),
            ];
            // find directives matching on a given <ng-template> node
            this.matchDirectives('ng-template', template);
            // prepare attributes parameter (including attributes used for directive matching)
            var attrsExprs = [];
            template.attributes.forEach(function (a) { attrsExprs.push(util_4.asLiteral(a.name), util_4.asLiteral(a.value)); });
            attrsExprs.push.apply(attrsExprs, tslib_1.__spread(this.prepareSyntheticAndSelectOnlyAttrs(template.inputs, template.outputs)));
            parameters.push(this.toAttrsParam(attrsExprs));
            // local refs (ex.: <ng-template #foo>)
            if (template.references && template.references.length) {
                parameters.push(this.prepareRefsParameter(template.references));
                parameters.push(o.importExpr(r3_identifiers_1.Identifiers.templateRefExtractor));
            }
            // handle property bindings e.g. p(1, 'ngForOf', ɵbind(ctx.items));
            var context = o.variable(util_4.CONTEXT_NAME);
            template.inputs.forEach(function (input) {
                var value = input.value.visit(_this._valueConverter);
                _this.allocateBindingSlots(value);
                _this.updateInstruction(template.sourceSpan, r3_identifiers_1.Identifiers.elementProperty, function () {
                    return [
                        o.literal(templateIndex), o.literal(input.name),
                        _this.convertPropertyBinding(context, value)
                    ];
                });
            });
            // Create the template function
            var templateVisitor = new TemplateDefinitionBuilder(this.constantPool, this._bindingScope, this.level + 1, contextName, this.i18n, templateIndex, templateName, [], this.directiveMatcher, this.directives, this.pipeTypeByName, this.pipes, this._namespace, this.fileBasedI18nSuffix, this.i18nUseExternalIds);
            // Nested templates must not be visited until after their parent templates have completed
            // processing, so they are queued here until after the initial pass. Otherwise, we wouldn't
            // be able to support bindings in nested templates to local refs that occur after the
            // template definition. e.g. <div *ngIf="showing">{{ foo }}</div>  <div #foo></div>
            this._nestedTemplateFns.push(function () {
                var _a;
                var templateFunctionExpr = templateVisitor.buildTemplateFunction(template.children, template.variables, _this._ngContentSelectors.length + _this._ngContentSelectorsOffset, template.i18n);
                _this.constantPool.statements.push(templateFunctionExpr.toDeclStmt(templateName, null));
                if (templateVisitor._hasNgContent) {
                    _this._hasNgContent = true;
                    (_a = _this._ngContentSelectors).push.apply(_a, tslib_1.__spread(templateVisitor._ngContentSelectors));
                }
            });
            // e.g. template(1, MyComp_Template_1)
            this.creationInstruction(template.sourceSpan, r3_identifiers_1.Identifiers.templateCreate, function () {
                parameters.splice(2, 0, o.literal(templateVisitor.getConstCount()), o.literal(templateVisitor.getVarCount()));
                return util_4.trimTrailingNulls(parameters);
            });
            // Generate listeners for directive output
            template.outputs.forEach(function (outputAst) {
                _this.creationInstruction(outputAst.sourceSpan, r3_identifiers_1.Identifiers.listener, _this.prepareListenerParameter('ng_template', outputAst, templateIndex));
            });
        };
        TemplateDefinitionBuilder.prototype.visitBoundText = function (text) {
            var _this = this;
            if (this.i18n) {
                var value_3 = text.value.visit(this._valueConverter);
                this.allocateBindingSlots(value_3);
                if (value_3 instanceof ast_1.Interpolation) {
                    this.i18n.appendBoundText(text.i18n);
                    this.i18nAppendBindings(value_3.expressions);
                }
                return;
            }
            var nodeIndex = this.allocateDataSlot();
            this.creationInstruction(text.sourceSpan, r3_identifiers_1.Identifiers.text, [o.literal(nodeIndex)]);
            var value = text.value.visit(this._valueConverter);
            this.allocateBindingSlots(value);
            this.updateInstruction(text.sourceSpan, r3_identifiers_1.Identifiers.textBinding, function () { return [o.literal(nodeIndex), _this.convertPropertyBinding(o.variable(util_4.CONTEXT_NAME), value)]; });
        };
        TemplateDefinitionBuilder.prototype.visitText = function (text) {
            // when a text element is located within a translatable
            // block, we exclude this text element from instructions set,
            // since it will be captured in i18n content and processed at runtime
            if (!this.i18n) {
                this.creationInstruction(text.sourceSpan, r3_identifiers_1.Identifiers.text, [o.literal(this.allocateDataSlot()), o.literal(text.value)]);
            }
        };
        TemplateDefinitionBuilder.prototype.visitIcu = function (icu) {
            var initWasInvoked = false;
            // if an ICU was created outside of i18n block, we still treat
            // it as a translatable entity and invoke i18nStart and i18nEnd
            // to generate i18n context and the necessary instructions
            if (!this.i18n) {
                initWasInvoked = true;
                this.i18nStart(null, icu.i18n, true);
            }
            var i18n = this.i18n;
            var vars = this.i18nBindProps(icu.vars);
            var placeholders = this.i18nBindProps(icu.placeholders);
            // output ICU directly and keep ICU reference in context
            var message = icu.i18n;
            var transformFn = function (raw) {
                return instruction(null, r3_identifiers_1.Identifiers.i18nPostprocess, [raw, map_util_1.mapLiteral(vars, true)]);
            };
            // in case the whole i18n message is a single ICU - we do not need to
            // create a separate top-level translation, we can use the root ref instead
            // and make this ICU a top-level translation
            if (util_3.isSingleI18nIcu(i18n.meta)) {
                this.i18nTranslate(message, placeholders, i18n.ref, transformFn);
            }
            else {
                // output ICU directly and keep ICU reference in context
                var ref = this.i18nTranslate(message, placeholders, undefined, transformFn);
                i18n.appendIcu(util_3.icuFromI18nMessage(message).name, ref);
            }
            if (initWasInvoked) {
                this.i18nEnd(null, true);
            }
            return null;
        };
        TemplateDefinitionBuilder.prototype.allocateDataSlot = function () { return this._dataIndex++; };
        TemplateDefinitionBuilder.prototype.getConstCount = function () { return this._dataIndex; };
        TemplateDefinitionBuilder.prototype.getVarCount = function () { return this._pureFunctionSlots; };
        TemplateDefinitionBuilder.prototype.bindingContext = function () { return "" + this._bindingContext++; };
        // Bindings must only be resolved after all local refs have been visited, so all
        // instructions are queued in callbacks that execute once the initial pass has completed.
        // Otherwise, we wouldn't be able to support local refs that are defined after their
        // bindings. e.g. {{ foo }} <div #foo></div>
        TemplateDefinitionBuilder.prototype.instructionFn = function (fns, span, reference, paramsOrFn, prepend) {
            if (prepend === void 0) { prepend = false; }
            fns[prepend ? 'unshift' : 'push'](function () {
                var params = Array.isArray(paramsOrFn) ? paramsOrFn : paramsOrFn();
                return instruction(span, reference, params).toStmt();
            });
        };
        TemplateDefinitionBuilder.prototype.processStylingInstruction = function (implicit, instruction, createMode) {
            var _this = this;
            if (instruction) {
                var paramsFn = function () {
                    return instruction.buildParams(function (value) { return _this.convertPropertyBinding(implicit, value, true); });
                };
                if (createMode) {
                    this.creationInstruction(instruction.sourceSpan, instruction.reference, paramsFn);
                }
                else {
                    this.updateInstruction(instruction.sourceSpan, instruction.reference, paramsFn);
                }
            }
        };
        TemplateDefinitionBuilder.prototype.creationInstruction = function (span, reference, paramsOrFn, prepend) {
            this.instructionFn(this._creationCodeFns, span, reference, paramsOrFn || [], prepend);
        };
        TemplateDefinitionBuilder.prototype.updateInstruction = function (span, reference, paramsOrFn) {
            this.instructionFn(this._updateCodeFns, span, reference, paramsOrFn || []);
        };
        TemplateDefinitionBuilder.prototype.allocatePureFunctionSlots = function (numSlots) {
            var originalSlots = this._pureFunctionSlots;
            this._pureFunctionSlots += numSlots;
            return originalSlots;
        };
        TemplateDefinitionBuilder.prototype.allocateBindingSlots = function (value) {
            this._bindingSlots += value instanceof ast_1.Interpolation ? value.expressions.length : 1;
        };
        TemplateDefinitionBuilder.prototype.convertExpressionBinding = function (implicit, value) {
            var convertedPropertyBinding = expression_converter_1.convertPropertyBinding(this, implicit, value, this.bindingContext(), expression_converter_1.BindingForm.TrySimple);
            var valExpr = convertedPropertyBinding.currValExpr;
            return o.importExpr(r3_identifiers_1.Identifiers.bind).callFn([valExpr]);
        };
        TemplateDefinitionBuilder.prototype.convertPropertyBinding = function (implicit, value, skipBindFn) {
            var _a;
            var interpolationFn = value instanceof ast_1.Interpolation ? interpolate : function () { return util_1.error('Unexpected interpolation'); };
            var convertedPropertyBinding = expression_converter_1.convertPropertyBinding(this, implicit, value, this.bindingContext(), expression_converter_1.BindingForm.TrySimple, interpolationFn);
            (_a = this._tempVariables).push.apply(_a, tslib_1.__spread(convertedPropertyBinding.stmts));
            var valExpr = convertedPropertyBinding.currValExpr;
            return value instanceof ast_1.Interpolation || skipBindFn ? valExpr :
                o.importExpr(r3_identifiers_1.Identifiers.bind).callFn([valExpr]);
        };
        TemplateDefinitionBuilder.prototype.matchDirectives = function (tagName, elOrTpl) {
            var _this = this;
            if (this.directiveMatcher) {
                var selector = createCssSelector(tagName, util_4.getAttrsForDirectiveMatching(elOrTpl));
                this.directiveMatcher.match(selector, function (cssSelector, staticType) { _this.directives.add(staticType); });
            }
        };
        /**
         * Prepares all attribute expression values for the `TAttributes` array.
         *
         * The purpose of this function is to properly construct an attributes array that
         * is passed into the `elementStart` (or just `element`) functions. Because there
         * are many different types of attributes, the array needs to be constructed in a
         * special way so that `elementStart` can properly evaluate them.
         *
         * The format looks like this:
         *
         * ```
         * attrs = [prop, value, prop2, value2,
         *   CLASSES, class1, class2,
         *   STYLES, style1, value1, style2, value2,
         *   SELECT_ONLY, name1, name2, name2, ...]
         * ```
         */
        TemplateDefinitionBuilder.prototype.prepareSyntheticAndSelectOnlyAttrs = function (inputs, outputs, styles) {
            var attrExprs = [];
            var nonSyntheticInputs = [];
            var alreadySeen = new Set();
            function isASTWithSource(ast) {
                return ast instanceof ast_1.ASTWithSource;
            }
            function isLiteralPrimitive(ast) {
                return ast instanceof ast_1.LiteralPrimitive;
            }
            function addAttrExpr(key, value) {
                if (typeof key === 'string') {
                    if (!alreadySeen.has(key)) {
                        attrExprs.push(o.literal(key));
                        if (value !== undefined) {
                            attrExprs.push(value);
                        }
                        alreadySeen.add(key);
                    }
                }
                else {
                    attrExprs.push(o.literal(key));
                }
            }
            if (inputs.length) {
                var EMPTY_STRING_EXPR_1 = util_4.asLiteral('');
                inputs.forEach(function (input) {
                    if (input.type === 4 /* Animation */) {
                        // @attributes are for Renderer2 animation @triggers, but this feature
                        // may be supported differently in future versions of angular. However,
                        // @triggers should always just be treated as regular attributes (it's up
                        // to the renderer to detect and use them in a special way).
                        var valueExp = input.value;
                        if (isASTWithSource(valueExp)) {
                            var literal = valueExp.ast;
                            if (isLiteralPrimitive(literal) && literal.value === undefined) {
                                addAttrExpr(util_2.prepareSyntheticPropertyName(input.name), EMPTY_STRING_EXPR_1);
                            }
                        }
                    }
                    else {
                        nonSyntheticInputs.push(input);
                    }
                });
            }
            // it's important that this occurs before SelectOnly because once `elementStart`
            // comes across the SelectOnly marker then it will continue reading each value as
            // as single property value cell by cell.
            if (styles) {
                styles.populateInitialStylingAttrs(attrExprs);
            }
            if (nonSyntheticInputs.length || outputs.length) {
                addAttrExpr(3 /* SelectOnly */);
                nonSyntheticInputs.forEach(function (i) { return addAttrExpr(i.name); });
                outputs.forEach(function (o) {
                    var name = o.type === 1 /* Animation */ ? util_2.getSyntheticPropertyName(o.name) : o.name;
                    addAttrExpr(name);
                });
            }
            return attrExprs;
        };
        TemplateDefinitionBuilder.prototype.toAttrsParam = function (attrsExprs) {
            return attrsExprs.length > 0 ?
                this.constantPool.getConstLiteral(o.literalArr(attrsExprs), true) :
                o.TYPED_NULL_EXPR;
        };
        TemplateDefinitionBuilder.prototype.prepareRefsParameter = function (references) {
            var _this = this;
            if (!references || references.length === 0) {
                return o.TYPED_NULL_EXPR;
            }
            var refsParam = compile_metadata_1.flatten(references.map(function (reference) {
                var slot = _this.allocateDataSlot();
                // Generate the update temporary.
                var variableName = _this._bindingScope.freshReferenceName();
                var retrievalLevel = _this.level;
                var lhs = o.variable(variableName);
                _this._bindingScope.set(retrievalLevel, reference.name, lhs, 0 /* DEFAULT */, function (scope, relativeLevel) {
                    // e.g. nextContext(2);
                    var nextContextStmt = relativeLevel > 0 ? [generateNextContextExpr(relativeLevel).toStmt()] : [];
                    // e.g. const $foo$ = reference(1);
                    var refExpr = lhs.set(o.importExpr(r3_identifiers_1.Identifiers.reference).callFn([o.literal(slot)]));
                    return nextContextStmt.concat(refExpr.toConstDecl());
                }, true);
                return [reference.name, reference.value];
            }));
            return this.constantPool.getConstLiteral(util_4.asLiteral(refsParam), true);
        };
        TemplateDefinitionBuilder.prototype.prepareListenerParameter = function (tagName, outputAst, index) {
            var _this = this;
            var eventName = outputAst.name;
            var bindingFnName;
            if (outputAst.type === 1 /* Animation */) {
                // synthetic @listener.foo values are treated the exact same as are standard listeners
                bindingFnName = util_2.prepareSyntheticListenerFunctionName(eventName, outputAst.phase);
                eventName = util_2.prepareSyntheticListenerName(eventName, outputAst.phase);
            }
            else {
                bindingFnName = compile_metadata_1.sanitizeIdentifier(eventName);
            }
            var tagNameSanitized = compile_metadata_1.sanitizeIdentifier(tagName);
            var functionName = this.templateName + "_" + tagNameSanitized + "_" + bindingFnName + "_" + index + "_listener";
            return function () {
                var listenerScope = _this._bindingScope.nestedScope(_this._bindingScope.bindingLevel);
                var bindingExpr = expression_converter_1.convertActionBinding(listenerScope, o.variable(util_4.CONTEXT_NAME), outputAst.handler, 'b', function () { return util_1.error('Unexpected interpolation'); });
                var statements = tslib_1.__spread(listenerScope.restoreViewStatement(), listenerScope.variableDeclarations(), bindingExpr.render3Stmts);
                var handler = o.fn([new o.FnParam('$event', o.DYNAMIC_TYPE)], statements, o.INFERRED_TYPE, null, functionName);
                return [o.literal(eventName), handler];
            };
        };
        return TemplateDefinitionBuilder;
    }());
    exports.TemplateDefinitionBuilder = TemplateDefinitionBuilder;
    var ValueConverter = /** @class */ (function (_super) {
        tslib_1.__extends(ValueConverter, _super);
        function ValueConverter(constantPool, allocateSlot, allocatePureFunctionSlots, definePipe) {
            var _this = _super.call(this) || this;
            _this.constantPool = constantPool;
            _this.allocateSlot = allocateSlot;
            _this.allocatePureFunctionSlots = allocatePureFunctionSlots;
            _this.definePipe = definePipe;
            _this._pipeBindExprs = [];
            return _this;
        }
        // AstMemoryEfficientTransformer
        ValueConverter.prototype.visitPipe = function (pipe, context) {
            // Allocate a slot to create the pipe
            var slot = this.allocateSlot();
            var slotPseudoLocal = "PIPE:" + slot;
            // Allocate one slot for the result plus one slot per pipe argument
            var pureFunctionSlot = this.allocatePureFunctionSlots(2 + pipe.args.length);
            var target = new ast_1.PropertyRead(pipe.span, new ast_1.ImplicitReceiver(pipe.span), slotPseudoLocal);
            var _a = pipeBindingCallInfo(pipe.args), identifier = _a.identifier, isVarLength = _a.isVarLength;
            this.definePipe(pipe.name, slotPseudoLocal, slot, o.importExpr(identifier));
            var args = tslib_1.__spread([pipe.exp], pipe.args);
            var convertedArgs = isVarLength ? this.visitAll([new ast_1.LiteralArray(pipe.span, args)]) : this.visitAll(args);
            var pipeBindExpr = new ast_1.FunctionCall(pipe.span, target, tslib_1.__spread([
                new ast_1.LiteralPrimitive(pipe.span, slot),
                new ast_1.LiteralPrimitive(pipe.span, pureFunctionSlot)
            ], convertedArgs));
            this._pipeBindExprs.push(pipeBindExpr);
            return pipeBindExpr;
        };
        ValueConverter.prototype.updatePipeSlotOffsets = function (bindingSlots) {
            this._pipeBindExprs.forEach(function (pipe) {
                // update the slot offset arg (index 1) to account for binding slots
                var slotOffset = pipe.args[1];
                slotOffset.value += bindingSlots;
            });
        };
        ValueConverter.prototype.visitLiteralArray = function (array, context) {
            var _this = this;
            return new expression_converter_1.BuiltinFunctionCall(array.span, this.visitAll(array.expressions), function (values) {
                // If the literal has calculated (non-literal) elements transform it into
                // calls to literal factories that compose the literal and will cache intermediate
                // values. Otherwise, just return an literal array that contains the values.
                var literal = o.literalArr(values);
                return values.every(function (a) { return a.isConstant(); }) ?
                    _this.constantPool.getConstLiteral(literal, true) :
                    getLiteralFactory(_this.constantPool, literal, _this.allocatePureFunctionSlots);
            });
        };
        ValueConverter.prototype.visitLiteralMap = function (map, context) {
            var _this = this;
            return new expression_converter_1.BuiltinFunctionCall(map.span, this.visitAll(map.values), function (values) {
                // If the literal has calculated (non-literal) elements  transform it into
                // calls to literal factories that compose the literal and will cache intermediate
                // values. Otherwise, just return an literal array that contains the values.
                var literal = o.literalMap(values.map(function (value, index) { return ({ key: map.keys[index].key, value: value, quoted: map.keys[index].quoted }); }));
                return values.every(function (a) { return a.isConstant(); }) ?
                    _this.constantPool.getConstLiteral(literal, true) :
                    getLiteralFactory(_this.constantPool, literal, _this.allocatePureFunctionSlots);
            });
        };
        return ValueConverter;
    }(ast_1.AstMemoryEfficientTransformer));
    exports.ValueConverter = ValueConverter;
    // Pipes always have at least one parameter, the value they operate on
    var pipeBindingIdentifiers = [r3_identifiers_1.Identifiers.pipeBind1, r3_identifiers_1.Identifiers.pipeBind2, r3_identifiers_1.Identifiers.pipeBind3, r3_identifiers_1.Identifiers.pipeBind4];
    function pipeBindingCallInfo(args) {
        var identifier = pipeBindingIdentifiers[args.length];
        return {
            identifier: identifier || r3_identifiers_1.Identifiers.pipeBindV,
            isVarLength: !identifier,
        };
    }
    var pureFunctionIdentifiers = [
        r3_identifiers_1.Identifiers.pureFunction0, r3_identifiers_1.Identifiers.pureFunction1, r3_identifiers_1.Identifiers.pureFunction2, r3_identifiers_1.Identifiers.pureFunction3, r3_identifiers_1.Identifiers.pureFunction4,
        r3_identifiers_1.Identifiers.pureFunction5, r3_identifiers_1.Identifiers.pureFunction6, r3_identifiers_1.Identifiers.pureFunction7, r3_identifiers_1.Identifiers.pureFunction8
    ];
    function pureFunctionCallInfo(args) {
        var identifier = pureFunctionIdentifiers[args.length];
        return {
            identifier: identifier || r3_identifiers_1.Identifiers.pureFunctionV,
            isVarLength: !identifier,
        };
    }
    function instruction(span, reference, params) {
        return o.importExpr(reference, null, span).callFn(params, span);
    }
    // e.g. x(2);
    function generateNextContextExpr(relativeLevelDiff) {
        return o.importExpr(r3_identifiers_1.Identifiers.nextContext)
            .callFn(relativeLevelDiff > 1 ? [o.literal(relativeLevelDiff)] : []);
    }
    function getLiteralFactory(constantPool, literal, allocateSlots) {
        var _a = constantPool.getLiteralFactory(literal), literalFactory = _a.literalFactory, literalFactoryArguments = _a.literalFactoryArguments;
        // Allocate 1 slot for the result plus 1 per argument
        var startSlot = allocateSlots(1 + literalFactoryArguments.length);
        literalFactoryArguments.length > 0 || util_1.error("Expected arguments to a literal factory function");
        var _b = pureFunctionCallInfo(literalFactoryArguments), identifier = _b.identifier, isVarLength = _b.isVarLength;
        // Literal factories are pure functions that only need to be re-invoked when the parameters
        // change.
        var args = [
            o.literal(startSlot),
            literalFactory,
        ];
        if (isVarLength) {
            args.push(o.literalArr(literalFactoryArguments));
        }
        else {
            args.push.apply(args, tslib_1.__spread(literalFactoryArguments));
        }
        return o.importExpr(identifier).callFn(args);
    }
    /** The prefix used to get a shared context in BindingScope's map. */
    var SHARED_CONTEXT_KEY = '$$shared_ctx$$';
    var BindingScope = /** @class */ (function () {
        function BindingScope(bindingLevel, parent) {
            if (bindingLevel === void 0) { bindingLevel = 0; }
            if (parent === void 0) { parent = null; }
            this.bindingLevel = bindingLevel;
            this.parent = parent;
            /** Keeps a map from local variables to their BindingData. */
            this.map = new Map();
            this.referenceNameIndex = 0;
            this.restoreViewVariable = null;
        }
        Object.defineProperty(BindingScope, "ROOT_SCOPE", {
            get: function () {
                if (!BindingScope._ROOT_SCOPE) {
                    BindingScope._ROOT_SCOPE = new BindingScope().set(0, '$event', o.variable('$event'));
                }
                return BindingScope._ROOT_SCOPE;
            },
            enumerable: true,
            configurable: true
        });
        BindingScope.prototype.get = function (name) {
            var current = this;
            while (current) {
                var value = current.map.get(name);
                if (value != null) {
                    if (current !== this) {
                        // make a local copy and reset the `declare` state
                        value = {
                            retrievalLevel: value.retrievalLevel,
                            lhs: value.lhs,
                            declareLocalCallback: value.declareLocalCallback,
                            declare: false,
                            priority: value.priority,
                            localRef: value.localRef
                        };
                        // Cache the value locally.
                        this.map.set(name, value);
                        // Possibly generate a shared context var
                        this.maybeGenerateSharedContextVar(value);
                        this.maybeRestoreView(value.retrievalLevel, value.localRef);
                    }
                    if (value.declareLocalCallback && !value.declare) {
                        value.declare = true;
                    }
                    return value.lhs;
                }
                current = current.parent;
            }
            // If we get to this point, we are looking for a property on the top level component
            // - If level === 0, we are on the top and don't need to re-declare `ctx`.
            // - If level > 0, we are in an embedded view. We need to retrieve the name of the
            // local var we used to store the component context, e.g. const $comp$ = x();
            return this.bindingLevel === 0 ? null : this.getComponentProperty(name);
        };
        /**
         * Create a local variable for later reference.
         *
         * @param retrievalLevel The level from which this value can be retrieved
         * @param name Name of the variable.
         * @param lhs AST representing the left hand side of the `let lhs = rhs;`.
         * @param priority The sorting priority of this var
         * @param declareLocalCallback The callback to invoke when declaring this local var
         * @param localRef Whether or not this is a local ref
         */
        BindingScope.prototype.set = function (retrievalLevel, name, lhs, priority, declareLocalCallback, localRef) {
            if (priority === void 0) { priority = 0 /* DEFAULT */; }
            !this.map.has(name) ||
                util_1.error("The name " + name + " is already defined in scope to be " + this.map.get(name));
            this.map.set(name, {
                retrievalLevel: retrievalLevel,
                lhs: lhs,
                declare: false,
                declareLocalCallback: declareLocalCallback,
                priority: priority,
                localRef: localRef || false
            });
            return this;
        };
        BindingScope.prototype.getLocal = function (name) { return this.get(name); };
        BindingScope.prototype.nestedScope = function (level) {
            var newScope = new BindingScope(level, this);
            if (level > 0)
                newScope.generateSharedContextVar(0);
            return newScope;
        };
        BindingScope.prototype.getSharedContextName = function (retrievalLevel) {
            var sharedCtxObj = this.map.get(SHARED_CONTEXT_KEY + retrievalLevel);
            return sharedCtxObj && sharedCtxObj.declare ? sharedCtxObj.lhs : null;
        };
        BindingScope.prototype.maybeGenerateSharedContextVar = function (value) {
            if (value.priority === 1 /* CONTEXT */) {
                var sharedCtxObj = this.map.get(SHARED_CONTEXT_KEY + value.retrievalLevel);
                if (sharedCtxObj) {
                    sharedCtxObj.declare = true;
                }
                else {
                    this.generateSharedContextVar(value.retrievalLevel);
                }
            }
        };
        BindingScope.prototype.generateSharedContextVar = function (retrievalLevel) {
            var lhs = o.variable(util_4.CONTEXT_NAME + this.freshReferenceName());
            this.map.set(SHARED_CONTEXT_KEY + retrievalLevel, {
                retrievalLevel: retrievalLevel,
                lhs: lhs,
                declareLocalCallback: function (scope, relativeLevel) {
                    // const ctx_r0 = nextContext(2);
                    return [lhs.set(generateNextContextExpr(relativeLevel)).toConstDecl()];
                },
                declare: false,
                priority: 2 /* SHARED_CONTEXT */,
                localRef: false
            });
        };
        BindingScope.prototype.getComponentProperty = function (name) {
            var componentValue = this.map.get(SHARED_CONTEXT_KEY + 0);
            componentValue.declare = true;
            this.maybeRestoreView(0, false);
            return componentValue.lhs.prop(name);
        };
        BindingScope.prototype.maybeRestoreView = function (retrievalLevel, localRefLookup) {
            // We want to restore the current view in listener fns if:
            // 1 - we are accessing a value in a parent view, which requires walking the view tree rather
            // than using the ctx arg. In this case, the retrieval and binding level will be different.
            // 2 - we are looking up a local ref, which requires restoring the view where the local
            // ref is stored
            if (this.isListenerScope() && (retrievalLevel < this.bindingLevel || localRefLookup)) {
                if (!this.parent.restoreViewVariable) {
                    // parent saves variable to generate a shared `const $s$ = getCurrentView();` instruction
                    this.parent.restoreViewVariable = o.variable(this.parent.freshReferenceName());
                }
                this.restoreViewVariable = this.parent.restoreViewVariable;
            }
        };
        BindingScope.prototype.restoreViewStatement = function () {
            // restoreView($state$);
            return this.restoreViewVariable ?
                [instruction(null, r3_identifiers_1.Identifiers.restoreView, [this.restoreViewVariable]).toStmt()] :
                [];
        };
        BindingScope.prototype.viewSnapshotStatements = function () {
            // const $state$ = getCurrentView();
            var getCurrentViewInstruction = instruction(null, r3_identifiers_1.Identifiers.getCurrentView, []);
            return this.restoreViewVariable ?
                [this.restoreViewVariable.set(getCurrentViewInstruction).toConstDecl()] :
                [];
        };
        BindingScope.prototype.isListenerScope = function () { return this.parent && this.parent.bindingLevel === this.bindingLevel; };
        BindingScope.prototype.variableDeclarations = function () {
            var _this = this;
            var currentContextLevel = 0;
            return Array.from(this.map.values())
                .filter(function (value) { return value.declare; })
                .sort(function (a, b) { return b.retrievalLevel - a.retrievalLevel || b.priority - a.priority; })
                .reduce(function (stmts, value) {
                var levelDiff = _this.bindingLevel - value.retrievalLevel;
                var currStmts = value.declareLocalCallback(_this, levelDiff - currentContextLevel);
                currentContextLevel = levelDiff;
                return stmts.concat(currStmts);
            }, []);
        };
        BindingScope.prototype.freshReferenceName = function () {
            var current = this;
            // Find the top scope as it maintains the global reference count
            while (current.parent)
                current = current.parent;
            var ref = "" + util_4.REFERENCE_PREFIX + current.referenceNameIndex++;
            return ref;
        };
        return BindingScope;
    }());
    exports.BindingScope = BindingScope;
    /**
     * Creates a `CssSelector` given a tag name and a map of attributes
     */
    function createCssSelector(tag, attributes) {
        var cssSelector = new selector_1.CssSelector();
        cssSelector.setElement(tag);
        Object.getOwnPropertyNames(attributes).forEach(function (name) {
            var value = attributes[name];
            cssSelector.addAttribute(name, value);
            if (name.toLowerCase() === 'class') {
                var classes = value.trim().split(/\s+/);
                classes.forEach(function (className) { return cssSelector.addClassName(className); });
            }
        });
        return cssSelector;
    }
    function interpolate(args) {
        args = args.slice(1); // Ignore the length prefix added for render2
        switch (args.length) {
            case 3:
                return o.importExpr(r3_identifiers_1.Identifiers.interpolation1).callFn(args);
            case 5:
                return o.importExpr(r3_identifiers_1.Identifiers.interpolation2).callFn(args);
            case 7:
                return o.importExpr(r3_identifiers_1.Identifiers.interpolation3).callFn(args);
            case 9:
                return o.importExpr(r3_identifiers_1.Identifiers.interpolation4).callFn(args);
            case 11:
                return o.importExpr(r3_identifiers_1.Identifiers.interpolation5).callFn(args);
            case 13:
                return o.importExpr(r3_identifiers_1.Identifiers.interpolation6).callFn(args);
            case 15:
                return o.importExpr(r3_identifiers_1.Identifiers.interpolation7).callFn(args);
            case 17:
                return o.importExpr(r3_identifiers_1.Identifiers.interpolation8).callFn(args);
        }
        (args.length >= 19 && args.length % 2 == 1) ||
            util_1.error("Invalid interpolation argument length " + args.length);
        return o.importExpr(r3_identifiers_1.Identifiers.interpolationV).callFn([o.literalArr(args)]);
    }
    /**
     * Parse a template into render3 `Node`s and additional metadata, with no other dependencies.
     *
     * @param template text of the template to parse
     * @param templateUrl URL to use for source mapping of the parsed template
     * @param options options to modify how the template is parsed
     */
    function parseTemplate(template, templateUrl, options) {
        if (options === void 0) { options = {}; }
        var interpolationConfig = options.interpolationConfig, preserveWhitespaces = options.preserveWhitespaces;
        var bindingParser = makeBindingParser(interpolationConfig);
        var htmlParser = new html_parser_1.HtmlParser();
        var parseResult = htmlParser.parse(template, templateUrl, tslib_1.__assign({}, options, { tokenizeExpansionForms: true }));
        if (parseResult.errors && parseResult.errors.length > 0) {
            return { errors: parseResult.errors, nodes: [] };
        }
        var rootNodes = parseResult.rootNodes;
        // process i18n meta information (scan attributes, generate ids)
        // before we run whitespace removal process, because existing i18n
        // extraction process (ng xi18n) relies on a raw content to generate
        // message ids
        rootNodes =
            html.visitAll(new meta_1.I18nMetaVisitor(interpolationConfig, !preserveWhitespaces), rootNodes);
        if (!preserveWhitespaces) {
            rootNodes = html.visitAll(new html_whitespaces_1.WhitespaceVisitor(), rootNodes);
            // run i18n meta visitor again in case we remove whitespaces, because
            // that might affect generated i18n message content. During this pass
            // i18n IDs generated at the first pass will be preserved, so we can mimic
            // existing extraction process (ng xi18n)
            rootNodes = html.visitAll(new meta_1.I18nMetaVisitor(interpolationConfig, /* keepI18nAttrs */ false), rootNodes);
        }
        var _a = r3_template_transform_1.htmlAstToRender3Ast(rootNodes, bindingParser), nodes = _a.nodes, errors = _a.errors;
        if (errors && errors.length > 0) {
            return { errors: errors, nodes: [] };
        }
        return { nodes: nodes };
    }
    exports.parseTemplate = parseTemplate;
    /**
     * Construct a `BindingParser` with a default configuration.
     */
    function makeBindingParser(interpolationConfig) {
        if (interpolationConfig === void 0) { interpolationConfig = interpolation_config_1.DEFAULT_INTERPOLATION_CONFIG; }
        return new binding_parser_1.BindingParser(new parser_1.Parser(new lexer_1.Lexer()), interpolationConfig, new dom_element_schema_registry_1.DomElementSchemaRegistry(), null, []);
    }
    exports.makeBindingParser = makeBindingParser;
    function resolveSanitizationFn(input, context) {
        switch (context) {
            case core.SecurityContext.HTML:
                return o.importExpr(r3_identifiers_1.Identifiers.sanitizeHtml);
            case core.SecurityContext.SCRIPT:
                return o.importExpr(r3_identifiers_1.Identifiers.sanitizeScript);
            case core.SecurityContext.STYLE:
                // the compiler does not fill in an instruction for [style.prop?] binding
                // values because the style algorithm knows internally what props are subject
                // to sanitization (only [attr.style] values are explicitly sanitized)
                return input.type === 1 /* Attribute */ ? o.importExpr(r3_identifiers_1.Identifiers.sanitizeStyle) : null;
            case core.SecurityContext.URL:
                return o.importExpr(r3_identifiers_1.Identifiers.sanitizeUrl);
            case core.SecurityContext.RESOURCE_URL:
                return o.importExpr(r3_identifiers_1.Identifiers.sanitizeResourceUrl);
            default:
                return null;
        }
    }
    function isSingleElementTemplate(children) {
        return children.length === 1 && children[0] instanceof t.Element;
    }
    function isTextNode(node) {
        return node instanceof t.Text || node instanceof t.BoundText || node instanceof t.Icu;
    }
    function hasTextChildrenOnly(children) {
        return children.every(isTextNode);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVtcGxhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvcmVuZGVyMy92aWV3L3RlbXBsYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUVILDJFQUFtRTtJQUNuRSxpR0FBdUo7SUFFdkosaURBQW1DO0lBQ25DLG1FQUErUDtJQUMvUCx1RUFBb0Q7SUFDcEQseUVBQXNEO0lBRXRELDBEQUE0QztJQUM1QywyRUFBdUQ7SUFDdkQscUZBQW1FO0lBQ25FLDZGQUF1RztJQUN2Ryw2REFBc0Y7SUFDdEYsa0VBQWlEO0lBQ2pELDJEQUE2QztJQUU3Qyx3R0FBa0Y7SUFDbEYsMkRBQTREO0lBQzVELHVGQUFtRTtJQUNuRSxtREFBaUM7SUFDakMsd0RBQStCO0lBQy9CLCtFQUFvRDtJQUNwRCw2RkFBNkQ7SUFDN0QsMkRBQW1KO0lBR25KLDJFQUEyQztJQUMzQyxxRUFBNEM7SUFDNUMsaUZBQTJEO0lBQzNELHFFQUFnVDtJQUNoVCxzRkFBcUU7SUFDckUsZ0VBQTZMO0lBRTdMLFNBQVMsdUJBQXVCLENBQUMsSUFBaUI7UUFDaEQsUUFBUSxJQUFJLEVBQUU7WUFDWixzQkFBMEI7WUFDMUI7Z0JBQ0UsT0FBTyw0QkFBRSxDQUFDLGVBQWUsQ0FBQztZQUM1QjtnQkFDRSxPQUFPLDRCQUFFLENBQUMsZ0JBQWdCLENBQUM7WUFDN0I7Z0JBQ0UsT0FBTyw0QkFBRSxDQUFDLGdCQUFnQixDQUFDO1lBQzdCO2dCQUNFLE9BQU8sU0FBUyxDQUFDO1NBQ3BCO0lBQ0gsQ0FBQztJQUVELDBCQUEwQjtJQUMxQixTQUFnQixxQkFBcUIsQ0FDakMsS0FBdUIsRUFBRSxVQUF5QjtRQUNwRCxPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxtQkFBWSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxP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Q0FBQyxJQUFJLHNCQUEwQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLDRCQUFFLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUN0RixLQUFLLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRztnQkFDM0IsT0FBTyxDQUFDLENBQUMsVUFBVSxDQUFDLDRCQUFFLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDdEMsS0FBSyxJQUFJLENBQUMsZUFBZSxDQUFDLFlBQVk7Z0JBQ3BDLE9BQU8sQ0FBQyxDQUFDLFVBQVUsQ0FBQyw0QkFBRSxDQUFDLG1CQUFtQixDQUFDLENBQUM7WUFDOUM7Z0JBQ0UsT0FBTyxJQUFJLENBQUM7U0FDZjtJQUNILENBQUM7SUFFRCxTQUFTLHVCQUF1QixDQUFDLFFBQWtCO1FBQ2pELE9BQU8sUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxPQUFPLENBQUM7SUFDbkUsQ0FBQztJQUVELFNBQVMsVUFBVSxDQUFDLElBQVk7UUFDOUIsT0FBTyxJQUFJLFlBQVksQ0FBQyxDQUFDLElBQUksSUFBSSxJQUFJLFlBQVksQ0FBQyxDQUFDLFNBQVMsSUFBSSxJQUFJLFlBQVksQ0FBQyxDQUFDLEdBQUcsQ0FBQztJQUN4RixDQUFDO0lBRUQsU0FBUyxtQkFBbUIsQ0FBQyxRQUFrQjtRQUM3QyxPQUFPLFFBQVEsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDcEMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtmbGF0dGVuLCBzYW5pdGl6ZUlkZW50aWZpZXJ9IGZyb20gJy4uLy4uL2NvbXBpbGVfbWV0YWRhdGEnO1xuaW1wb3J0IHtCaW5kaW5nRm9ybSwgQnVpbHRpbkZ1bmN0aW9uQ2FsbCwgTG9jYWxSZXNvbHZlciwgY29udmVydEFjdGlvbkJpbmRpbmcsIGNvbnZlcnRQcm9wZXJ0eUJpbmRpbmd9IGZyb20gJy4uLy4uL2NvbXBpbGVyX3V0aWwvZXhwcmVzc2lvbl9jb252ZXJ0ZXInO1xuaW1wb3J0IHtDb25zdGFudFBvb2x9IGZyb20gJy4uLy4uL2NvbnN0YW50X3Bvb2wnO1xuaW1wb3J0ICogYXMgY29yZSBmcm9tICcuLi8uLi9jb3JlJztcbmltcG9ydCB7QVNULCBBU1RXaXRoU291cmNlLCBBc3RNZW1vcnlFZmZpY2llbnRUcmFuc2Zvcm1lciwgQmluZGluZ1BpcGUsIEJpbmRpbmdUeXBlLCBGdW5jdGlvbkNhbGwsIEltcGxpY2l0UmVjZWl2ZXIsIEludGVycG9sYXRpb24sIExpdGVyYWxBcnJheSwgTGl0ZXJhbE1hcCwgTGl0ZXJhbFByaW1pdGl2ZSwgUGFyc2VkRXZlbnQsIFBhcnNlZEV2ZW50VHlwZSwgUHJvcGVydHlSZWFkfSBmcm9tICcuLi8uLi9leHByZXNzaW9uX3BhcnNlci9hc3QnO1xuaW1wb3J0IHtMZXhlcn0gZnJvbSAnLi4vLi4vZXhwcmVzc2lvbl9wYXJzZXIvbGV4ZXInO1xuaW1wb3J0IHtQYXJzZXJ9IGZyb20gJy4uLy4uL2V4cHJlc3Npb25fcGFyc2VyL3BhcnNlcic7XG5pbXBvcnQgKiBhcyBpMThuIGZyb20gJy4uLy4uL2kxOG4vaTE4bl9hc3QnO1xuaW1wb3J0ICogYXMgaHRtbCBmcm9tICcuLi8uLi9tbF9wYXJzZXIvYXN0JztcbmltcG9ydCB7SHRtbFBhcnNlcn0gZnJvbSAnLi4vLi4vbWxfcGFyc2VyL2h0bWxfcGFyc2VyJztcbmltcG9ydCB7V2hpdGVzcGFjZVZpc2l0b3J9IGZyb20gJy4uLy4uL21sX3BhcnNlci9odG1sX3doaXRlc3BhY2VzJztcbmltcG9ydCB7REVGQVVMVF9JTlRFUlBPTEFUSU9OX0NPTkZJRywgSW50ZXJwb2xhdGlvbkNvbmZpZ30gZnJvbSAnLi4vLi4vbWxfcGFyc2VyL2ludGVycG9sYXRpb25fY29uZmlnJztcbmltcG9ydCB7aXNOZ0NvbnRhaW5lciBhcyBjaGVja0lzTmdDb250YWluZXIsIHNwbGl0TnNOYW1lfSBmcm9tICcuLi8uLi9tbF9wYXJzZXIvdGFncyc7XG5pbXBvcnQge21hcExpdGVyYWx9IGZyb20gJy4uLy4uL291dHB1dC9tYXBfdXRpbCc7XG5pbXBvcnQgKiBhcyBvIGZyb20gJy4uLy4uL291dHB1dC9vdXRwdXRfYXN0JztcbmltcG9ydCB7UGFyc2VFcnJvciwgUGFyc2VTb3VyY2VTcGFufSBmcm9tICcuLi8uLi9wYXJzZV91dGlsJztcbmltcG9ydCB7RG9tRWxlbWVudFNjaGVtYVJlZ2lzdHJ5fSBmcm9tICcuLi8uLi9zY2hlbWEvZG9tX2VsZW1lbnRfc2NoZW1hX3JlZ2lzdHJ5JztcbmltcG9ydCB7Q3NzU2VsZWN0b3IsIFNlbGVjdG9yTWF0Y2hlcn0gZnJvbSAnLi4vLi4vc2VsZWN0b3InO1xuaW1wb3J0IHtCaW5kaW5nUGFyc2VyfSBmcm9tICcuLi8uLi90ZW1wbGF0ZV9wYXJzZXIvYmluZGluZ19wYXJzZXInO1xuaW1wb3J0IHtlcnJvcn0gZnJvbSAnLi4vLi4vdXRpbCc7XG5pbXBvcnQgKiBhcyB0IGZyb20gJy4uL3IzX2FzdCc7XG5pbXBvcnQge0lkZW50aWZpZXJzIGFzIFIzfSBmcm9tICcuLi9yM19pZGVudGlmaWVycyc7XG5pbXBvcnQge2h0bWxBc3RUb1JlbmRlcjNBc3R9IGZyb20gJy4uL3IzX3RlbXBsYXRlX3RyYW5zZm9ybSc7XG5pbXBvcnQge2dldFN5bnRoZXRpY1Byb3BlcnR5TmFtZSwgcHJlcGFyZVN5bnRoZXRpY0xpc3RlbmVyRnVuY3Rpb25OYW1lLCBwcmVwYXJlU3ludGhldGljTGlzdGVuZXJOYW1lLCBwcmVwYXJlU3ludGhldGljUHJvcGVydHlOYW1lfSBmcm9tICcuLi91dGlsJztcblxuaW1wb3J0IHtSM1F1ZXJ5TWV0YWRhdGF9IGZyb20gJy4vYXBpJztcbmltcG9ydCB7STE4bkNvbnRleHR9IGZyb20gJy4vaTE4bi9jb250ZXh0JztcbmltcG9ydCB7STE4bk1ldGFWaXNpdG9yfSBmcm9tICcuL2kxOG4vbWV0YSc7XG5pbXBvcnQge2dldFNlcmlhbGl6ZWRJMThuQ29udGVudH0gZnJvbSAnLi9pMThuL3NlcmlhbGl6ZXInO1xuaW1wb3J0IHtJMThOX0lDVV9NQVBQSU5HX1BSRUZJWCwgYXNzZW1ibGVCb3VuZFRleHRQbGFjZWhvbGRlcnMsIGFzc2VtYmxlSTE4bkJvdW5kU3RyaW5nLCBmb3JtYXRJMThuUGxhY2Vob2xkZXJOYW1lLCBnZXRUcmFuc2xhdGlvbkNvbnN0UHJlZml4LCBnZXRUcmFuc2xhdGlvbkRlY2xTdG10cywgaWN1RnJvbUkxOG5NZXNzYWdlLCBpc0kxOG5Sb290Tm9kZSwgaXNTaW5nbGVJMThuSWN1LCBtZXRhRnJvbUkxOG5NZXNzYWdlLCBwbGFjZWhvbGRlcnNUb1BhcmFtcywgd3JhcEkxOG5QbGFjZWhvbGRlcn0gZnJvbSAnLi9pMThuL3V0aWwnO1xuaW1wb3J0IHtTdHlsaW5nQnVpbGRlciwgU3R5bGluZ0luc3RydWN0aW9ufSBmcm9tICcuL3N0eWxpbmdfYnVpbGRlcic7XG5pbXBvcnQge0NPTlRFWFRfTkFNRSwgSU1QTElDSVRfUkVGRVJFTkNFLCBOT05fQklOREFCTEVfQVRUUiwgUkVGRVJFTkNFX1BSRUZJWCwgUkVOREVSX0ZMQUdTLCBhc0xpdGVyYWwsIGdldEF0dHJzRm9yRGlyZWN0aXZlTWF0Y2hpbmcsIGludmFsaWQsIHRyaW1UcmFpbGluZ051bGxzLCB1bnN1cHBvcnRlZH0gZnJvbSAnLi91dGlsJztcblxuZnVuY3Rpb24gbWFwQmluZGluZ1RvSW5zdHJ1Y3Rpb24odHlwZTogQmluZGluZ1R5cGUpOiBvLkV4dGVybmFsUmVmZXJlbmNlfHVuZGVmaW5lZCB7XG4gIHN3aXRjaCAodHlwZSkge1xuICAgIGNhc2UgQmluZGluZ1R5cGUuUHJvcGVydHk6XG4gICAgY2FzZSBCaW5kaW5nVHlwZS5BbmltYXRpb246XG4gICAgICByZXR1cm4gUjMuZWxlbWVudFByb3BlcnR5O1xuICAgIGNhc2UgQmluZGluZ1R5cGUuQ2xhc3M6XG4gICAgICByZXR1cm4gUjMuZWxlbWVudENsYXNzUHJvcDtcbiAgICBjYXNlIEJpbmRpbmdUeXBlLkF0dHJpYnV0ZTpcbiAgICAgIHJldHVybiBSMy5lbGVtZW50QXR0cmlidXRlO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG59XG5cbi8vICBpZiAocmYgJiBmbGFncykgeyAuLiB9XG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyRmxhZ0NoZWNrSWZTdG10KFxuICAgIGZsYWdzOiBjb3JlLlJlbmRlckZsYWdzLCBzdGF0ZW1lbnRzOiBvLlN0YXRlbWVudFtdKTogby5JZlN0bXQge1xuICByZXR1cm4gby5pZlN0bXQoby52YXJpYWJsZShSRU5ERVJfRkxBR1MpLmJpdHdpc2VBbmQoby5saXRlcmFsKGZsYWdzKSwgbnVsbCwgZmFsc2UpLCBzdGF0ZW1lbnRzKTtcbn1cblxuLy8gRGVmYXVsdCBzZWxlY3RvciB1c2VkIGJ5IGA8bmctY29udGVudD5gIGlmIG5vbmUgc3BlY2lmaWVkXG5jb25zdCBERUZBVUxUX05HX0NPTlRFTlRfU0VMRUNUT1IgPSAnKic7XG5cbi8vIFNlbGVjdG9yIGF0dHJpYnV0ZSBuYW1lIG9mIGA8bmctY29udGVudD5gXG5jb25zdCBOR19DT05URU5UX1NFTEVDVF9BVFRSID0gJ3NlbGVjdCc7XG5cbmV4cG9ydCBjbGFzcyBUZW1wbGF0ZURlZmluaXRpb25CdWlsZGVyIGltcGxlbWVudHMgdC5WaXNpdG9yPHZvaWQ+LCBMb2NhbFJlc29sdmVyIHtcbiAgcHJpdmF0ZSBfZGF0YUluZGV4ID0gMDtcbiAgcHJpdmF0ZSBfYmluZGluZ0NvbnRleHQgPSAwO1xuICBwcml2YXRlIF9wcmVmaXhDb2RlOiBvLlN0YXRlbWVudFtdID0gW107XG4gIC8qKlxuICAgKiBMaXN0IG9mIGNhbGxiYWNrcyB0byBnZW5lcmF0ZSBjcmVhdGlvbiBtb2RlIGluc3RydWN0aW9ucy4gV2Ugc3RvcmUgdGhlbSBoZXJlIGFzIHdlIHByb2Nlc3NcbiAgICogdGhlIHRlbXBsYXRlIHNvIGJpbmRpbmdzIGluIGxpc3RlbmVycyBhcmUgcmVzb2x2ZWQgb25seSBvbmNlIGFsbCBub2RlcyBoYXZlIGJlZW4gdmlzaXRlZC5cbiAgICogVGhpcyBlbnN1cmVzIGFsbCBsb2NhbCByZWZzIGFuZCBjb250ZXh0IHZhcmlhYmxlcyBhcmUgYXZhaWxhYmxlIGZvciBtYXRjaGluZy5cbiAgICovXG4gIHByaXZhdGUgX2NyZWF0aW9uQ29kZUZuczogKCgpID0+IG8uU3RhdGVtZW50KVtdID0gW107XG4gIC8qKlxuICAgKiBMaXN0IG9mIGNhbGxiYWNrcyB0byBnZW5lcmF0ZSB1cGRhdGUgbW9kZSBpbnN0cnVjdGlvbnMuIFdlIHN0b3JlIHRoZW0gaGVyZSBhcyB3ZSBwcm9jZXNzXG4gICAqIHRoZSB0ZW1wbGF0ZSBzbyBiaW5kaW5ncyBhcmUgcmVzb2x2ZWQgb25seSBvbmNlIGFsbCBub2RlcyBoYXZlIGJlZW4gdmlzaXRlZC4gVGhpcyBlbnN1cmVzXG4gICAqIGFsbCBsb2NhbCByZWZzIGFuZCBjb250ZXh0IHZhcmlhYmxlcyBhcmUgYXZhaWxhYmxlIGZvciBtYXRjaGluZy5cbiAgICovXG4gIHByaXZhdGUgX3VwZGF0ZUNvZGVGbnM6ICgoKSA9PiBvLlN0YXRlbWVudClbXSA9IFtdO1xuICAvKiogVGVtcG9yYXJ5IHZhcmlhYmxlIGRlY2xhcmF0aW9ucyBnZW5lcmF0ZWQgZnJvbSB2aXNpdGluZyBwaXBlcywgbGl0ZXJhbHMsIGV0Yy4gKi9cbiAgcHJpdmF0ZSBfdGVtcFZhcmlhYmxlczogby5TdGF0ZW1lbnRbXSA9IFtdO1xuICAvKipcbiAgICogTGlzdCBvZiBjYWxsYmFja3MgdG8gYnVpbGQgbmVzdGVkIHRlbXBsYXRlcy4gTmVzdGVkIHRlbXBsYXRlcyBtdXN0IG5vdCBiZSB2aXNpdGVkIHVudGlsXG4gICAqIGFmdGVyIHRoZSBwYXJlbnQgdGVtcGxhdGUgaGFzIGZpbmlzaGVkIHZpc2l0aW5nIGFsbCBvZiBpdHMgbm9kZXMuIFRoaXMgZW5zdXJlcyB0aGF0IGFsbFxuICAgKiBsb2NhbCByZWYgYmluZGluZ3MgaW4gbmVzdGVkIHRlbXBsYXRlcyBhcmUgYWJsZSB0byBmaW5kIGxvY2FsIHJlZiB2YWx1ZXMgaWYgdGhlIHJlZnNcbiAgICogYXJlIGRlZmluZWQgYWZ0ZXIgdGhlIHRlbXBsYXRlIGRlY2xhcmF0aW9uLlxuICAgKi9cbiAgcHJpdmF0ZSBfbmVzdGVkVGVtcGxhdGVGbnM6ICgoKSA9PiB2b2lkKVtdID0gW107XG4gIC8qKlxuICAgKiBUaGlzIHNjb3BlIGNvbnRhaW5zIGxvY2FsIHZhcmlhYmxlcyBkZWNsYXJlZCBpbiB0aGUgdXBkYXRlIG1vZGUgYmxvY2sgb2YgdGhlIHRlbXBsYXRlLlxuICAgKiAoZS5nLiByZWZzIGFuZCBjb250ZXh0IHZhcnMgaW4gYmluZGluZ3MpXG4gICAqL1xuICBwcml2YXRlIF9iaW5kaW5nU2NvcGU6IEJpbmRpbmdTY29wZTtcbiAgcHJpdmF0ZSBfdmFsdWVDb252ZXJ0ZXI6IFZhbHVlQ29udmVydGVyO1xuICBwcml2YXRlIF91bnN1cHBvcnRlZCA9IHVuc3VwcG9ydGVkO1xuXG4gIC8vIGkxOG4gY29udGV4dCBsb2NhbCB0byB0aGlzIHRlbXBsYXRlXG4gIHByaXZhdGUgaTE4bjogSTE4bkNvbnRleHR8bnVsbCA9IG51bGw7XG5cbiAgLy8gTnVtYmVyIG9mIHNsb3RzIHRvIHJlc2VydmUgZm9yIHB1cmVGdW5jdGlvbnNcbiAgcHJpdmF0ZSBfcHVyZUZ1bmN0aW9uU2xvdHMgPSAwO1xuXG4gIC8vIE51bWJlciBvZiBiaW5kaW5nIHNsb3RzXG4gIHByaXZhdGUgX2JpbmRpbmdTbG90cyA9IDA7XG5cbiAgcHJpdmF0ZSBmaWxlQmFzZWRJMThuU3VmZml4OiBzdHJpbmc7XG5cbiAgLy8gV2hldGhlciB0aGUgdGVtcGxhdGUgaW5jbHVkZXMgPG5nLWNvbnRlbnQ+IHRhZ3MuXG4gIHByaXZhdGUgX2hhc05nQ29udGVudDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIC8vIFNlbGVjdG9ycyBmb3VuZCBpbiB0aGUgPG5nLWNvbnRlbnQ+IHRhZ3MgaW4gdGhlIHRlbXBsYXRlLlxuICBwcml2YXRlIF9uZ0NvbnRlbnRTZWxlY3RvcnM6IHN0cmluZ1tdID0gW107XG5cbiAgLy8gTnVtYmVyIG9mIG5vbi1kZWZhdWx0IHNlbGVjdG9ycyBmb3VuZCBpbiBhbGwgcGFyZW50IHRlbXBsYXRlcyBvZiB0aGlzIHRlbXBsYXRlLiBXZSBuZWVkIHRvXG4gIC8vIHRyYWNrIGl0IHRvIHByb3Blcmx5IGFkanVzdCBwcm9qZWN0aW9uIGJ1Y2tldCBpbmRleCBpbiB0aGUgYHByb2plY3Rpb25gIGluc3RydWN0aW9uLlxuICBwcml2YXRlIF9uZ0NvbnRlbnRTZWxlY3RvcnNPZmZzZXQgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBjb25zdGFudFBvb2w6IENvbnN0YW50UG9vbCwgcGFyZW50QmluZGluZ1Njb3BlOiBCaW5kaW5nU2NvcGUsIHByaXZhdGUgbGV2ZWwgPSAwLFxuICAgICAgcHJpdmF0ZSBjb250ZXh0TmFtZTogc3RyaW5nfG51bGwsIHByaXZhdGUgaTE4bkNvbnRleHQ6IEkxOG5Db250ZXh0fG51bGwsXG4gICAgICBwcml2YXRlIHRlbXBsYXRlSW5kZXg6IG51bWJlcnxudWxsLCBwcml2YXRlIHRlbXBsYXRlTmFtZTogc3RyaW5nfG51bGwsXG4gICAgICBwcml2YXRlIHZpZXdRdWVyaWVzOiBSM1F1ZXJ5TWV0YWRhdGFbXSwgcHJpdmF0ZSBkaXJlY3RpdmVNYXRjaGVyOiBTZWxlY3Rvck1hdGNoZXJ8bnVsbCxcbiAgICAgIHByaXZhdGUgZGlyZWN0aXZlczogU2V0PG8uRXhwcmVzc2lvbj4sIHByaXZhdGUgcGlwZVR5cGVCeU5hbWU6IE1hcDxzdHJpbmcsIG8uRXhwcmVzc2lvbj4sXG4gICAgICBwcml2YXRlIHBpcGVzOiBTZXQ8by5FeHByZXNzaW9uPiwgcHJpdmF0ZSBfbmFtZXNwYWNlOiBvLkV4dGVybmFsUmVmZXJlbmNlLFxuICAgICAgcHJpdmF0ZSByZWxhdGl2ZUNvbnRleHRGaWxlUGF0aDogc3RyaW5nLCBwcml2YXRlIGkxOG5Vc2VFeHRlcm5hbElkczogYm9vbGVhbikge1xuICAgIC8vIHZpZXcgcXVlcmllcyBjYW4gdGFrZSB1cCBzcGFjZSBpbiBkYXRhIGFuZCBhbGxvY2F0aW9uIGhhcHBlbnMgZWFybGllciAoaW4gdGhlIFwidmlld1F1ZXJ5XCJcbiAgICAvLyBmdW5jdGlvbilcbiAgICB0aGlzLl9kYXRhSW5kZXggPSB2aWV3UXVlcmllcy5sZW5ndGg7XG5cbiAgICB0aGlzLl9iaW5kaW5nU2NvcGUgPSBwYXJlbnRCaW5kaW5nU2NvcGUubmVzdGVkU2NvcGUobGV2ZWwpO1xuXG4gICAgLy8gVHVybiB0aGUgcmVsYXRpdmUgY29udGV4dCBmaWxlIHBhdGggaW50byBhbiBpZGVudGlmaWVyIGJ5IHJlcGxhY2luZyBub24tYWxwaGFudW1lcmljXG4gICAgLy8gY2hhcmFjdGVycyB3aXRoIHVuZGVyc2NvcmVzLlxuICAgIHRoaXMuZmlsZUJhc2VkSTE4blN1ZmZpeCA9IHJlbGF0aXZlQ29udGV4dEZpbGVQYXRoLnJlcGxhY2UoL1teQS1aYS16MC05XS9nLCAnXycpICsgJ18nO1xuXG4gICAgdGhpcy5fdmFsdWVDb252ZXJ0ZXIgPSBuZXcgVmFsdWVDb252ZXJ0ZXIoXG4gICAgICAgIGNvbnN0YW50UG9vbCwgKCkgPT4gdGhpcy5hbGxvY2F0ZURhdGFTbG90KCksXG4gICAgICAgIChudW1TbG90czogbnVtYmVyKSA9PiB0aGlzLmFsbG9jYXRlUHVyZUZ1bmN0aW9uU2xvdHMobnVtU2xvdHMpLFxuICAgICAgICAobmFtZSwgbG9jYWxOYW1lLCBzbG90LCB2YWx1ZTogby5SZWFkVmFyRXhwcikgPT4ge1xuICAgICAgICAgIGNvbnN0IHBpcGVUeXBlID0gcGlwZVR5cGVCeU5hbWUuZ2V0KG5hbWUpO1xuICAgICAgICAgIGlmIChwaXBlVHlwZSkge1xuICAgICAgICAgICAgdGhpcy5waXBlcy5hZGQocGlwZVR5cGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLl9iaW5kaW5nU2NvcGUuc2V0KHRoaXMubGV2ZWwsIGxvY2FsTmFtZSwgdmFsdWUpO1xuICAgICAgICAgIHRoaXMuY3JlYXRpb25JbnN0cnVjdGlvbihudWxsLCBSMy5waXBlLCBbby5saXRlcmFsKHNsb3QpLCBvLmxpdGVyYWwobmFtZSldKTtcbiAgICAgICAgfSk7XG4gIH1cblxuICByZWdpc3RlckNvbnRleHRWYXJpYWJsZXModmFyaWFibGU6IHQuVmFyaWFibGUpIHtcbiAgICBjb25zdCBzY29wZWROYW1lID0gdGhpcy5fYmluZGluZ1Njb3BlLmZyZXNoUmVmZXJlbmNlTmFtZSgpO1xuICAgIGNvbnN0IHJldHJpZXZhbExldmVsID0gdGhpcy5sZXZlbDtcbiAgICBjb25zdCBsaHMgPSBvLnZhcmlhYmxlKHZhcmlhYmxlLm5hbWUgKyBzY29wZWROYW1lKTtcbiAgICB0aGlzLl9iaW5kaW5nU2NvcGUuc2V0KFxuICAgICAgICByZXRyaWV2YWxMZXZlbCwgdmFyaWFibGUubmFtZSwgbGhzLCBEZWNsYXJhdGlvblByaW9yaXR5LkNPTlRFWFQsXG4gICAgICAgIChzY29wZTogQmluZGluZ1Njb3BlLCByZWxhdGl2ZUxldmVsOiBudW1iZXIpID0+IHtcbiAgICAgICAgICBsZXQgcmhzOiBvLkV4cHJlc3Npb247XG4gICAgICAgICAgaWYgKHNjb3BlLmJpbmRpbmdMZXZlbCA9PT0gcmV0cmlldmFsTGV2ZWwpIHtcbiAgICAgICAgICAgIC8vIGUuZy4gY3R4XG4gICAgICAgICAgICByaHMgPSBvLnZhcmlhYmxlKENPTlRFWFRfTkFNRSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHNoYXJlZEN0eFZhciA9IHNjb3BlLmdldFNoYXJlZENvbnRleHROYW1lKHJldHJpZXZhbExldmVsKTtcbiAgICAgICAgICAgIC8vIGUuZy4gY3R4X3IwICAgT1IgIHgoMik7XG4gICAgICAgICAgICByaHMgPSBzaGFyZWRDdHhWYXIgPyBzaGFyZWRDdHhWYXIgOiBnZW5lcmF0ZU5leHRDb250ZXh0RXhwcihyZWxhdGl2ZUxldmVsKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gZS5nLiBjb25zdCAkaXRlbSQgPSB4KDIpLiRpbXBsaWNpdDtcbiAgICAgICAgICByZXR1cm4gW2xocy5zZXQocmhzLnByb3AodmFyaWFibGUudmFsdWUgfHwgSU1QTElDSVRfUkVGRVJFTkNFKSkudG9Db25zdERlY2woKV07XG4gICAgICAgIH0pO1xuICB9XG5cbiAgYnVpbGRUZW1wbGF0ZUZ1bmN0aW9uKFxuICAgICAgbm9kZXM6IHQuTm9kZVtdLCB2YXJpYWJsZXM6IHQuVmFyaWFibGVbXSwgbmdDb250ZW50U2VsZWN0b3JzT2Zmc2V0OiBudW1iZXIgPSAwLFxuICAgICAgaTE4bj86IGkxOG4uQVNUKTogby5GdW5jdGlvbkV4cHIge1xuICAgIHRoaXMuX25nQ29udGVudFNlbGVjdG9yc09mZnNldCA9IG5nQ29udGVudFNlbGVjdG9yc09mZnNldDtcblxuICAgIGlmICh0aGlzLl9uYW1lc3BhY2UgIT09IFIzLm5hbWVzcGFjZUhUTUwpIHtcbiAgICAgIHRoaXMuY3JlYXRpb25JbnN0cnVjdGlvbihudWxsLCB0aGlzLl9uYW1lc3BhY2UpO1xuICAgIH1cblxuICAgIC8vIENyZWF0ZSB2YXJpYWJsZSBiaW5kaW5nc1xuICAgIHZhcmlhYmxlcy5mb3JFYWNoKHYgPT4gdGhpcy5yZWdpc3RlckNvbnRleHRWYXJpYWJsZXModikpO1xuXG4gICAgLy8gSW5pdGlhdGUgaTE4biBjb250ZXh0IGluIGNhc2U6XG4gICAgLy8gLSB0aGlzIHRlbXBsYXRlIGhhcyBwYXJlbnQgaTE4biBjb250ZXh0XG4gICAgLy8gLSBvciB0aGUgdGVtcGxhdGUgaGFzIGkxOG4gbWV0YSBhc3NvY2lhdGVkIHdpdGggaXQsXG4gICAgLy8gICBidXQgaXQncyBub3QgaW5pdGlhdGVkIGJ5IHRoZSBFbGVtZW50IChlLmcuIDxuZy10ZW1wbGF0ZSBpMThuPilcbiAgICBjb25zdCBpbml0STE4bkNvbnRleHQgPVxuICAgICAgICB0aGlzLmkxOG5Db250ZXh0IHx8IChpc0kxOG5Sb290Tm9kZShpMThuKSAmJiAhaXNTaW5nbGVJMThuSWN1KGkxOG4pICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICEoaXNTaW5nbGVFbGVtZW50VGVtcGxhdGUobm9kZXMpICYmIG5vZGVzWzBdLmkxOG4gPT09IGkxOG4pKTtcbiAgICBjb25zdCBzZWxmQ2xvc2luZ0kxOG5JbnN0cnVjdGlvbiA9IGhhc1RleHRDaGlsZHJlbk9ubHkobm9kZXMpO1xuICAgIGlmIChpbml0STE4bkNvbnRleHQpIHtcbiAgICAgIHRoaXMuaTE4blN0YXJ0KG51bGwsIGkxOG4gISwgc2VsZkNsb3NpbmdJMThuSW5zdHJ1Y3Rpb24pO1xuICAgIH1cblxuICAgIC8vIFRoaXMgaXMgdGhlIGluaXRpYWwgcGFzcyB0aHJvdWdoIHRoZSBub2RlcyBvZiB0aGlzIHRlbXBsYXRlLiBJbiB0aGlzIHBhc3MsIHdlXG4gICAgLy8gcXVldWUgYWxsIGNyZWF0aW9uIG1vZGUgYW5kIHVwZGF0ZSBtb2RlIGluc3RydWN0aW9ucyBmb3IgZ2VuZXJhdGlvbiBpbiB0aGUgc2Vjb25kXG4gICAgLy8gcGFzcy4gSXQncyBuZWNlc3NhcnkgdG8gc2VwYXJhdGUgdGhlIHBhc3NlcyB0byBlbnN1cmUgbG9jYWwgcmVmcyBhcmUgZGVmaW5lZCBiZWZvcmVcbiAgICAvLyByZXNvbHZpbmcgYmluZGluZ3MuIFdlIGFsc28gY291bnQgYmluZGluZ3MgaW4gdGhpcyBwYXNzIGFzIHdlIHdhbGsgYm91bmQgZXhwcmVzc2lvbnMuXG4gICAgdC52aXNpdEFsbCh0aGlzLCBub2Rlcyk7XG5cbiAgICAvLyBBZGQgdG90YWwgYmluZGluZyBjb3VudCB0byBwdXJlIGZ1bmN0aW9uIGNvdW50IHNvIHB1cmUgZnVuY3Rpb24gaW5zdHJ1Y3Rpb25zIGFyZVxuICAgIC8vIGdlbmVyYXRlZCB3aXRoIHRoZSBjb3JyZWN0IHNsb3Qgb2Zmc2V0IHdoZW4gdXBkYXRlIGluc3RydWN0aW9ucyBhcmUgcHJvY2Vzc2VkLlxuICAgIHRoaXMuX3B1cmVGdW5jdGlvblNsb3RzICs9IHRoaXMuX2JpbmRpbmdTbG90cztcblxuICAgIC8vIFBpcGVzIGFyZSB3YWxrZWQgaW4gdGhlIGZpcnN0IHBhc3MgKHRvIGVucXVldWUgYHBpcGUoKWAgY3JlYXRpb24gaW5zdHJ1Y3Rpb25zIGFuZFxuICAgIC8vIGBwaXBlQmluZGAgdXBkYXRlIGluc3RydWN0aW9ucyksIHNvIHdlIGhhdmUgdG8gdXBkYXRlIHRoZSBzbG90IG9mZnNldHMgbWFudWFsbHlcbiAgICAvLyB0byBhY2NvdW50IGZvciBiaW5kaW5ncy5cbiAgICB0aGlzLl92YWx1ZUNvbnZlcnRlci51cGRhdGVQaXBlU2xvdE9mZnNldHModGhpcy5fYmluZGluZ1Nsb3RzKTtcblxuICAgIC8vIE5lc3RlZCB0ZW1wbGF0ZXMgbXVzdCBiZSBwcm9jZXNzZWQgYmVmb3JlIGNyZWF0aW9uIGluc3RydWN0aW9ucyBzbyB0ZW1wbGF0ZSgpXG4gICAgLy8gaW5zdHJ1Y3Rpb25zIGNhbiBiZSBnZW5lcmF0ZWQgd2l0aCB0aGUgY29ycmVjdCBpbnRlcm5hbCBjb25zdCBjb3VudC5cbiAgICB0aGlzLl9uZXN0ZWRUZW1wbGF0ZUZucy5mb3JFYWNoKGJ1aWxkVGVtcGxhdGVGbiA9PiBidWlsZFRlbXBsYXRlRm4oKSk7XG5cbiAgICAvLyBPdXRwdXQgdGhlIGBwcm9qZWN0aW9uRGVmYCBpbnN0cnVjdGlvbiB3aGVuIHNvbWUgYDxuZy1jb250ZW50PmAgYXJlIHByZXNlbnQuXG4gICAgLy8gVGhlIGBwcm9qZWN0aW9uRGVmYCBpbnN0cnVjdGlvbiBvbmx5IGVtaXR0ZWQgZm9yIHRoZSBjb21wb25lbnQgdGVtcGxhdGUgYW5kIGl0IGlzIHNraXBwZWQgZm9yXG4gICAgLy8gbmVzdGVkIHRlbXBsYXRlcyAoPG5nLXRlbXBsYXRlPiB0YWdzKS5cbiAgICBpZiAodGhpcy5sZXZlbCA9PT0gMCAmJiB0aGlzLl9oYXNOZ0NvbnRlbnQpIHtcbiAgICAgIGNvbnN0IHBhcmFtZXRlcnM6IG8uRXhwcmVzc2lvbltdID0gW107XG5cbiAgICAgIC8vIE9ubHkgc2VsZWN0b3JzIHdpdGggYSBub24tZGVmYXVsdCB2YWx1ZSBhcmUgZ2VuZXJhdGVkXG4gICAgICBpZiAodGhpcy5fbmdDb250ZW50U2VsZWN0b3JzLmxlbmd0aCkge1xuICAgICAgICBjb25zdCByM1NlbGVjdG9ycyA9IHRoaXMuX25nQ29udGVudFNlbGVjdG9ycy5tYXAocyA9PiBjb3JlLnBhcnNlU2VsZWN0b3JUb1IzU2VsZWN0b3IocykpO1xuICAgICAgICAvLyBgcHJvamVjdGlvbkRlZmAgbmVlZHMgYm90aCB0aGUgcGFyc2VkIGFuZCByYXcgdmFsdWUgb2YgdGhlIHNlbGVjdG9yc1xuICAgICAgICBjb25zdCBwYXJzZWQgPSB0aGlzLmNvbnN0YW50UG9vbC5nZXRDb25zdExpdGVyYWwoYXNMaXRlcmFsKHIzU2VsZWN0b3JzKSwgdHJ1ZSk7XG4gICAgICAgIGNvbnN0IHVuUGFyc2VkID1cbiAgICAgICAgICAgIHRoaXMuY29uc3RhbnRQb29sLmdldENvbnN0TGl0ZXJhbChhc0xpdGVyYWwodGhpcy5fbmdDb250ZW50U2VsZWN0b3JzKSwgdHJ1ZSk7XG4gICAgICAgIHBhcmFtZXRlcnMucHVzaChwYXJzZWQsIHVuUGFyc2VkKTtcbiAgICAgIH1cblxuICAgICAgLy8gU2luY2Ugd2UgYWNjdW11bGF0ZSBuZ0NvbnRlbnQgc2VsZWN0b3JzIHdoaWxlIHByb2Nlc3NpbmcgdGVtcGxhdGUgZWxlbWVudHMsXG4gICAgICAvLyB3ZSAqcHJlcGVuZCogYHByb2plY3Rpb25EZWZgIHRvIGNyZWF0aW9uIGluc3RydWN0aW9ucyBibG9jaywgdG8gcHV0IGl0IGJlZm9yZVxuICAgICAgLy8gYW55IGBwcm9qZWN0aW9uYCBpbnN0cnVjdGlvbnNcbiAgICAgIHRoaXMuY3JlYXRpb25JbnN0cnVjdGlvbihudWxsLCBSMy5wcm9qZWN0aW9uRGVmLCBwYXJhbWV0ZXJzLCAvKiBwcmVwZW5kICovIHRydWUpO1xuICAgIH1cblxuICAgIGlmIChpbml0STE4bkNvbnRleHQpIHtcbiAgICAgIHRoaXMuaTE4bkVuZChudWxsLCBzZWxmQ2xvc2luZ0kxOG5JbnN0cnVjdGlvbik7XG4gICAgfVxuXG4gICAgLy8gR2VuZXJhdGUgYWxsIHRoZSBjcmVhdGlvbiBtb2RlIGluc3RydWN0aW9ucyAoZS5nLiByZXNvbHZlIGJpbmRpbmdzIGluIGxpc3RlbmVycylcbiAgICBjb25zdCBjcmVhdGlvblN0YXRlbWVudHMgPSB0aGlzLl9jcmVhdGlvbkNvZGVGbnMubWFwKChmbjogKCkgPT4gby5TdGF0ZW1lbnQpID0+IGZuKCkpO1xuXG4gICAgLy8gR2VuZXJhdGUgYWxsIHRoZSB1cGRhdGUgbW9kZSBpbnN0cnVjdGlvbnMgKGUuZy4gcmVzb2x2ZSBwcm9wZXJ0eSBvciB0ZXh0IGJpbmRpbmdzKVxuICAgIGNvbnN0IHVwZGF0ZVN0YXRlbWVudHMgPSB0aGlzLl91cGRhdGVDb2RlRm5zLm1hcCgoZm46ICgpID0+IG8uU3RhdGVtZW50KSA9PiBmbigpKTtcblxuICAgIC8vICBWYXJpYWJsZSBkZWNsYXJhdGlvbiBtdXN0IG9jY3VyIGFmdGVyIGJpbmRpbmcgcmVzb2x1dGlvbiBzbyB3ZSBjYW4gZ2VuZXJhdGUgY29udGV4dFxuICAgIC8vICBpbnN0cnVjdGlvbnMgdGhhdCBidWlsZCBvbiBlYWNoIG90aGVyLlxuICAgIC8vIGUuZy4gY29uc3QgYiA9IG5leHRDb250ZXh0KCkuJGltcGxpY2l0KCk7IGNvbnN0IGIgPSBuZXh0Q29udGV4dCgpO1xuICAgIGNvbnN0IGNyZWF0aW9uVmFyaWFibGVzID0gdGhpcy5fYmluZGluZ1Njb3BlLnZpZXdTbmFwc2hvdFN0YXRlbWVudHMoKTtcbiAgICBjb25zdCB1cGRhdGVWYXJpYWJsZXMgPSB0aGlzLl9iaW5kaW5nU2NvcGUudmFyaWFibGVEZWNsYXJhdGlvbnMoKS5jb25jYXQodGhpcy5fdGVtcFZhcmlhYmxlcyk7XG5cbiAgICBjb25zdCBjcmVhdGlvbkJsb2NrID0gY3JlYXRpb25TdGF0ZW1lbnRzLmxlbmd0aCA+IDAgP1xuICAgICAgICBbcmVuZGVyRmxhZ0NoZWNrSWZTdG10KFxuICAgICAgICAgICAgY29yZS5SZW5kZXJGbGFncy5DcmVhdGUsIGNyZWF0aW9uVmFyaWFibGVzLmNvbmNhdChjcmVhdGlvblN0YXRlbWVudHMpKV0gOlxuICAgICAgICBbXTtcblxuICAgIGNvbnN0IHVwZGF0ZUJsb2NrID0gdXBkYXRlU3RhdGVtZW50cy5sZW5ndGggPiAwID9cbiAgICAgICAgW3JlbmRlckZsYWdDaGVja0lmU3RtdChjb3JlLlJlbmRlckZsYWdzLlVwZGF0ZSwgdXBkYXRlVmFyaWFibGVzLmNvbmNhdCh1cGRhdGVTdGF0ZW1lbnRzKSldIDpcbiAgICAgICAgW107XG5cbiAgICByZXR1cm4gby5mbihcbiAgICAgICAgLy8gaS5lLiAocmY6IFJlbmRlckZsYWdzLCBjdHg6IGFueSlcbiAgICAgICAgW25ldyBvLkZuUGFyYW0oUkVOREVSX0ZMQUdTLCBvLk5VTUJFUl9UWVBFKSwgbmV3IG8uRm5QYXJhbShDT05URVhUX05BTUUsIG51bGwpXSxcbiAgICAgICAgW1xuICAgICAgICAgIC8vIFRlbXBvcmFyeSB2YXJpYWJsZSBkZWNsYXJhdGlvbnMgZm9yIHF1ZXJ5IHJlZnJlc2ggKGkuZS4gbGV0IF90OiBhbnk7KVxuICAgICAgICAgIC4uLnRoaXMuX3ByZWZpeENvZGUsXG4gICAgICAgICAgLy8gQ3JlYXRpbmcgbW9kZSAoaS5lLiBpZiAocmYgJiBSZW5kZXJGbGFncy5DcmVhdGUpIHsgLi4uIH0pXG4gICAgICAgICAgLi4uY3JlYXRpb25CbG9jayxcbiAgICAgICAgICAvLyBCaW5kaW5nIGFuZCByZWZyZXNoIG1vZGUgKGkuZS4gaWYgKHJmICYgUmVuZGVyRmxhZ3MuVXBkYXRlKSB7Li4ufSlcbiAgICAgICAgICAuLi51cGRhdGVCbG9jayxcbiAgICAgICAgXSxcbiAgICAgICAgby5JTkZFUlJFRF9UWVBFLCBudWxsLCB0aGlzLnRlbXBsYXRlTmFtZSk7XG4gIH1cblxuICAvLyBMb2NhbFJlc29sdmVyXG4gIGdldExvY2FsKG5hbWU6IHN0cmluZyk6IG8uRXhwcmVzc2lvbnxudWxsIHsgcmV0dXJuIHRoaXMuX2JpbmRpbmdTY29wZS5nZXQobmFtZSk7IH1cblxuICBpMThuVHJhbnNsYXRlKFxuICAgICAgbWVzc2FnZTogaTE4bi5NZXNzYWdlLCBwYXJhbXM6IHtbbmFtZTogc3RyaW5nXTogby5FeHByZXNzaW9ufSA9IHt9LCByZWY/OiBvLlJlYWRWYXJFeHByLFxuICAgICAgdHJhbnNmb3JtRm4/OiAocmF3OiBvLlJlYWRWYXJFeHByKSA9PiBvLkV4cHJlc3Npb24pOiBvLlJlYWRWYXJFeHByIHtcbiAgICBjb25zdCBfcmVmID0gcmVmIHx8IHRoaXMuaTE4bkFsbG9jYXRlUmVmKG1lc3NhZ2UuaWQpO1xuICAgIGNvbnN0IF9wYXJhbXM6IHtba2V5OiBzdHJpbmddOiBhbnl9ID0ge307XG4gICAgaWYgKHBhcmFtcyAmJiBPYmplY3Qua2V5cyhwYXJhbXMpLmxlbmd0aCkge1xuICAgICAgT2JqZWN0LmtleXMocGFyYW1zKS5mb3JFYWNoKGtleSA9PiBfcGFyYW1zW2Zvcm1hdEkxOG5QbGFjZWhvbGRlck5hbWUoa2V5KV0gPSBwYXJhbXNba2V5XSk7XG4gICAgfVxuICAgIGNvbnN0IG1ldGEgPSBtZXRhRnJvbUkxOG5NZXNzYWdlKG1lc3NhZ2UpO1xuICAgIGNvbnN0IGNvbnRlbnQgPSBnZXRTZXJpYWxpemVkSTE4bkNvbnRlbnQobWVzc2FnZSk7XG4gICAgY29uc3Qgc3RhdGVtZW50cyA9IGdldFRyYW5zbGF0aW9uRGVjbFN0bXRzKF9yZWYsIGNvbnRlbnQsIG1ldGEsIF9wYXJhbXMsIHRyYW5zZm9ybUZuKTtcbiAgICB0aGlzLmNvbnN0YW50UG9vbC5zdGF0ZW1lbnRzLnB1c2goLi4uc3RhdGVtZW50cyk7XG4gICAgcmV0dXJuIF9yZWY7XG4gIH1cblxuICBpMThuQXBwZW5kQmluZGluZ3MoZXhwcmVzc2lvbnM6IEFTVFtdKSB7XG4gICAgaWYgKCF0aGlzLmkxOG4gfHwgIWV4cHJlc3Npb25zLmxlbmd0aCkgcmV0dXJuO1xuICAgIGNvbnN0IGltcGxpY2l0ID0gby52YXJpYWJsZShDT05URVhUX05BTUUpO1xuICAgIGV4cHJlc3Npb25zLmZvckVhY2goZXhwcmVzc2lvbiA9PiB7XG4gICAgICBjb25zdCBiaW5kaW5nID0gdGhpcy5jb252ZXJ0RXhwcmVzc2lvbkJpbmRpbmcoaW1wbGljaXQsIGV4cHJlc3Npb24pO1xuICAgICAgdGhpcy5pMThuICEuYXBwZW5kQmluZGluZyhiaW5kaW5nKTtcbiAgICB9KTtcbiAgfVxuXG4gIGkxOG5CaW5kUHJvcHMocHJvcHM6IHtba2V5OiBzdHJpbmddOiB0LlRleHQgfCB0LkJvdW5kVGV4dH0pOiB7W2tleTogc3RyaW5nXTogby5FeHByZXNzaW9ufSB7XG4gICAgY29uc3QgYm91bmQ6IHtba2V5OiBzdHJpbmddOiBvLkV4cHJlc3Npb259ID0ge307XG4gICAgT2JqZWN0LmtleXMocHJvcHMpLmZvckVhY2goa2V5ID0+IHtcbiAgICAgIGNvbnN0IHByb3AgPSBwcm9wc1trZXldO1xuICAgICAgaWYgKHByb3AgaW5zdGFuY2VvZiB0LlRleHQpIHtcbiAgICAgICAgYm91bmRba2V5XSA9IG8ubGl0ZXJhbChwcm9wLnZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gcHJvcC52YWx1ZS52aXNpdCh0aGlzLl92YWx1ZUNvbnZlcnRlcik7XG4gICAgICAgIHRoaXMuYWxsb2NhdGVCaW5kaW5nU2xvdHModmFsdWUpO1xuICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBJbnRlcnBvbGF0aW9uKSB7XG4gICAgICAgICAgY29uc3Qge3N0cmluZ3MsIGV4cHJlc3Npb25zfSA9IHZhbHVlO1xuICAgICAgICAgIGNvbnN0IHtpZCwgYmluZGluZ3N9ID0gdGhpcy5pMThuICE7XG4gICAgICAgICAgY29uc3QgbGFiZWwgPSBhc3NlbWJsZUkxOG5Cb3VuZFN0cmluZyhzdHJpbmdzLCBiaW5kaW5ncy5zaXplLCBpZCk7XG4gICAgICAgICAgdGhpcy5pMThuQXBwZW5kQmluZGluZ3MoZXhwcmVzc2lvbnMpO1xuICAgICAgICAgIGJvdW5kW2tleV0gPSBvLmxpdGVyYWwobGFiZWwpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGJvdW5kO1xuICB9XG5cbiAgaTE4bkFsbG9jYXRlUmVmKG1lc3NhZ2VJZDogc3RyaW5nKTogby5SZWFkVmFyRXhwciB7XG4gICAgbGV0IG5hbWU6IHN0cmluZztcbiAgICBjb25zdCBzdWZmaXggPSB0aGlzLmZpbGVCYXNlZEkxOG5TdWZmaXgudG9VcHBlckNhc2UoKTtcbiAgICBpZiAodGhpcy5pMThuVXNlRXh0ZXJuYWxJZHMpIHtcbiAgICAgIGNvbnN0IHByZWZpeCA9IGdldFRyYW5zbGF0aW9uQ29uc3RQcmVmaXgoYEVYVEVSTkFMX2ApO1xuICAgICAgY29uc3QgdW5pcXVlU3VmZml4ID0gdGhpcy5jb25zdGFudFBvb2wudW5pcXVlTmFtZShzdWZmaXgpO1xuICAgICAgbmFtZSA9IGAke3ByZWZpeH0ke21lc3NhZ2VJZH0kJCR7dW5pcXVlU3VmZml4fWA7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHByZWZpeCA9IGdldFRyYW5zbGF0aW9uQ29uc3RQcmVmaXgoc3VmZml4KTtcbiAgICAgIG5hbWUgPSB0aGlzLmNvbnN0YW50UG9vbC51bmlxdWVOYW1lKHByZWZpeCk7XG4gICAgfVxuICAgIHJldHVybiBvLnZhcmlhYmxlKG5hbWUpO1xuICB9XG5cbiAgaTE4blVwZGF0ZVJlZihjb250ZXh0OiBJMThuQ29udGV4dCk6IHZvaWQge1xuICAgIGNvbnN0IHtpY3VzLCBtZXRhLCBpc1Jvb3QsIGlzUmVzb2x2ZWR9ID0gY29udGV4dDtcbiAgICBpZiAoaXNSb290ICYmIGlzUmVzb2x2ZWQgJiYgIWlzU2luZ2xlSTE4bkljdShtZXRhKSkge1xuICAgICAgY29uc3QgcGxhY2Vob2xkZXJzID0gY29udGV4dC5nZXRTZXJpYWxpemVkUGxhY2Vob2xkZXJzKCk7XG4gICAgICBsZXQgaWN1TWFwcGluZzoge1tuYW1lOiBzdHJpbmddOiBvLkV4cHJlc3Npb259ID0ge307XG4gICAgICBsZXQgcGFyYW1zOiB7W25hbWU6IHN0cmluZ106IG8uRXhwcmVzc2lvbn0gPVxuICAgICAgICAgIHBsYWNlaG9sZGVycy5zaXplID8gcGxhY2Vob2xkZXJzVG9QYXJhbXMocGxhY2Vob2xkZXJzKSA6IHt9O1xuICAgICAgaWYgKGljdXMuc2l6ZSkge1xuICAgICAgICBpY3VzLmZvckVhY2goKHJlZnM6IG8uRXhwcmVzc2lvbltdLCBrZXk6IHN0cmluZykgPT4ge1xuICAgICAgICAgIGlmIChyZWZzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgLy8gaWYgd2UgaGF2ZSBvbmUgSUNVIGRlZmluZWQgZm9yIGEgZ2l2ZW5cbiAgICAgICAgICAgIC8vIHBsYWNlaG9sZGVyIC0ganVzdCBvdXRwdXQgaXRzIHJlZmVyZW5jZVxuICAgICAgICAgICAgcGFyYW1zW2tleV0gPSByZWZzWzBdO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyAuLi4gb3RoZXJ3aXNlIHdlIG5lZWQgdG8gYWN0aXZhdGUgcG9zdC1wcm9jZXNzaW5nXG4gICAgICAgICAgICAvLyB0byByZXBsYWNlIElDVSBwbGFjZWhvbGRlcnMgd2l0aCBwcm9wZXIgdmFsdWVzXG4gICAgICAgICAgICBjb25zdCBwbGFjZWhvbGRlcjogc3RyaW5nID0gd3JhcEkxOG5QbGFjZWhvbGRlcihgJHtJMThOX0lDVV9NQVBQSU5HX1BSRUZJWH0ke2tleX1gKTtcbiAgICAgICAgICAgIHBhcmFtc1trZXldID0gby5saXRlcmFsKHBsYWNlaG9sZGVyKTtcbiAgICAgICAgICAgIGljdU1hcHBpbmdba2V5XSA9IG8ubGl0ZXJhbEFycihyZWZzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyB0cmFuc2xhdGlvbiByZXF1aXJlcyBwb3N0IHByb2Nlc3NpbmcgaW4gMiBjYXNlczpcbiAgICAgIC8vIC0gaWYgd2UgaGF2ZSBwbGFjZWhvbGRlcnMgd2l0aCBtdWx0aXBsZSB2YWx1ZXMgKGV4LiBgU1RBUlRfRElWYDogW++/vSMx77+9LCDvv70jMu+/vSwgLi4uXSlcbiAgICAgIC8vIC0gaWYgd2UgaGF2ZSBtdWx0aXBsZSBJQ1VzIHRoYXQgcmVmZXIgdG8gdGhlIHNhbWUgcGxhY2Vob2xkZXIgbmFtZVxuICAgICAgY29uc3QgbmVlZHNQb3N0cHJvY2Vzc2luZyA9XG4gICAgICAgICAgQXJyYXkuZnJvbShwbGFjZWhvbGRlcnMudmFsdWVzKCkpLnNvbWUoKHZhbHVlOiBzdHJpbmdbXSkgPT4gdmFsdWUubGVuZ3RoID4gMSkgfHxcbiAgICAgICAgICBPYmplY3Qua2V5cyhpY3VNYXBwaW5nKS5sZW5ndGg7XG5cbiAgICAgIGxldCB0cmFuc2Zvcm1GbjtcbiAgICAgIGlmIChuZWVkc1Bvc3Rwcm9jZXNzaW5nKSB7XG4gICAgICAgIHRyYW5zZm9ybUZuID0gKHJhdzogby5SZWFkVmFyRXhwcikgPT4ge1xuICAgICAgICAgIGNvbnN0IGFyZ3M6IG8uRXhwcmVzc2lvbltdID0gW3Jhd107XG4gICAgICAgICAgaWYgKE9iamVjdC5rZXlzKGljdU1hcHBpbmcpLmxlbmd0aCkge1xuICAgICAgICAgICAgYXJncy5wdXNoKG1hcExpdGVyYWwoaWN1TWFwcGluZywgdHJ1ZSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gaW5zdHJ1Y3Rpb24obnVsbCwgUjMuaTE4blBvc3Rwcm9jZXNzLCBhcmdzKTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHRoaXMuaTE4blRyYW5zbGF0ZShtZXRhIGFzIGkxOG4uTWVzc2FnZSwgcGFyYW1zLCBjb250ZXh0LnJlZiwgdHJhbnNmb3JtRm4pO1xuICAgIH1cbiAgfVxuXG4gIGkxOG5TdGFydChzcGFuOiBQYXJzZVNvdXJjZVNwYW58bnVsbCA9IG51bGwsIG1ldGE6IGkxOG4uQVNULCBzZWxmQ2xvc2luZz86IGJvb2xlYW4pOiB2b2lkIHtcbiAgICBjb25zdCBpbmRleCA9IHRoaXMuYWxsb2NhdGVEYXRhU2xvdCgpO1xuICAgIGlmICh0aGlzLmkxOG5Db250ZXh0KSB7XG4gICAgICB0aGlzLmkxOG4gPSB0aGlzLmkxOG5Db250ZXh0LmZvcmtDaGlsZENvbnRleHQoaW5kZXgsIHRoaXMudGVtcGxhdGVJbmRleCAhLCBtZXRhKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgcmVmID0gdGhpcy5pMThuQWxsb2NhdGVSZWYoKG1ldGEgYXMgaTE4bi5NZXNzYWdlKS5pZCk7XG4gICAgICB0aGlzLmkxOG4gPSBuZXcgSTE4bkNvbnRleHQoaW5kZXgsIHJlZiwgMCwgdGhpcy50ZW1wbGF0ZUluZGV4LCBtZXRhKTtcbiAgICB9XG5cbiAgICAvLyBnZW5lcmF0ZSBpMThuU3RhcnQgaW5zdHJ1Y3Rpb25cbiAgICBjb25zdCB7aWQsIHJlZn0gPSB0aGlzLmkxOG47XG4gICAgY29uc3QgcGFyYW1zOiBvLkV4cHJlc3Npb25bXSA9IFtvLmxpdGVyYWwoaW5kZXgpLCByZWZdO1xuICAgIGlmIChpZCA+IDApIHtcbiAgICAgIC8vIGRvIG5vdCBwdXNoIDNyZCBhcmd1bWVudCAoc3ViLWJsb2NrIGlkKVxuICAgICAgLy8gaW50byBpMThuU3RhcnQgY2FsbCBmb3IgdG9wIGxldmVsIGkxOG4gY29udGV4dFxuICAgICAgcGFyYW1zLnB1c2goby5saXRlcmFsKGlkKSk7XG4gICAgfVxuICAgIHRoaXMuY3JlYXRpb25JbnN0cnVjdGlvbihzcGFuLCBzZWxmQ2xvc2luZyA/IFIzLmkxOG4gOiBSMy5pMThuU3RhcnQsIHBhcmFtcyk7XG4gIH1cblxuICBpMThuRW5kKHNwYW46IFBhcnNlU291cmNlU3BhbnxudWxsID0gbnVsbCwgc2VsZkNsb3Npbmc/OiBib29sZWFuKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLmkxOG4pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignaTE4bkVuZCBpcyBleGVjdXRlZCB3aXRoIG5vIGkxOG4gY29udGV4dCBwcmVzZW50Jyk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuaTE4bkNvbnRleHQpIHtcbiAgICAgIHRoaXMuaTE4bkNvbnRleHQucmVjb25jaWxlQ2hpbGRDb250ZXh0KHRoaXMuaTE4bik7XG4gICAgICB0aGlzLmkxOG5VcGRhdGVSZWYodGhpcy5pMThuQ29udGV4dCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuaTE4blVwZGF0ZVJlZih0aGlzLmkxOG4pO1xuICAgIH1cblxuICAgIC8vIHNldHVwIGFjY3VtdWxhdGVkIGJpbmRpbmdzXG4gICAgY29uc3Qge2luZGV4LCBiaW5kaW5nc30gPSB0aGlzLmkxOG47XG4gICAgaWYgKGJpbmRpbmdzLnNpemUpIHtcbiAgICAgIGJpbmRpbmdzLmZvckVhY2goYmluZGluZyA9PiB0aGlzLnVwZGF0ZUluc3RydWN0aW9uKHNwYW4sIFIzLmkxOG5FeHAsIFtiaW5kaW5nXSkpO1xuICAgICAgdGhpcy51cGRhdGVJbnN0cnVjdGlvbihzcGFuLCBSMy5pMThuQXBwbHksIFtvLmxpdGVyYWwoaW5kZXgpXSk7XG4gICAgfVxuICAgIGlmICghc2VsZkNsb3NpbmcpIHtcbiAgICAgIHRoaXMuY3JlYXRpb25JbnN0cnVjdGlvbihzcGFuLCBSMy5pMThuRW5kKTtcbiAgICB9XG4gICAgdGhpcy5pMThuID0gbnVsbDsgIC8vIHJlc2V0IGxvY2FsIGkxOG4gY29udGV4dFxuICB9XG5cbiAgdmlzaXRDb250ZW50KG5nQ29udGVudDogdC5Db250ZW50KSB7XG4gICAgdGhpcy5faGFzTmdDb250ZW50ID0gdHJ1ZTtcbiAgICBjb25zdCBzbG90ID0gdGhpcy5hbGxvY2F0ZURhdGFTbG90KCk7XG4gICAgbGV0IHNlbGVjdG9ySW5kZXggPSBuZ0NvbnRlbnQuc2VsZWN0b3IgPT09IERFRkFVTFRfTkdfQ09OVEVOVF9TRUxFQ1RPUiA/XG4gICAgICAgIDAgOlxuICAgICAgICB0aGlzLl9uZ0NvbnRlbnRTZWxlY3RvcnMucHVzaChuZ0NvbnRlbnQuc2VsZWN0b3IpICsgdGhpcy5fbmdDb250ZW50U2VsZWN0b3JzT2Zmc2V0O1xuICAgIGNvbnN0IHBhcmFtZXRlcnM6IG8uRXhwcmVzc2lvbltdID0gW28ubGl0ZXJhbChzbG90KV07XG5cbiAgICBjb25zdCBhdHRyaWJ1dGVBc0xpc3Q6IHN0cmluZ1tdID0gW107XG5cbiAgICBuZ0NvbnRlbnQuYXR0cmlidXRlcy5mb3JFYWNoKChhdHRyaWJ1dGUpID0+IHtcbiAgICAgIGNvbnN0IHtuYW1lLCB2YWx1ZX0gPSBhdHRyaWJ1dGU7XG4gICAgICBpZiAobmFtZS50b0xvd2VyQ2FzZSgpICE9PSBOR19DT05URU5UX1NFTEVDVF9BVFRSKSB7XG4gICAgICAgIGF0dHJpYnV0ZUFzTGlzdC5wdXNoKG5hbWUsIHZhbHVlKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmIChhdHRyaWJ1dGVBc0xpc3QubGVuZ3RoID4gMCkge1xuICAgICAgcGFyYW1ldGVycy5wdXNoKG8ubGl0ZXJhbChzZWxlY3RvckluZGV4KSwgYXNMaXRlcmFsKGF0dHJpYnV0ZUFzTGlzdCkpO1xuICAgIH0gZWxzZSBpZiAoc2VsZWN0b3JJbmRleCAhPT0gMCkge1xuICAgICAgcGFyYW1ldGVycy5wdXNoKG8ubGl0ZXJhbChzZWxlY3RvckluZGV4KSk7XG4gICAgfVxuXG4gICAgdGhpcy5jcmVhdGlvbkluc3RydWN0aW9uKG5nQ29udGVudC5zb3VyY2VTcGFuLCBSMy5wcm9qZWN0aW9uLCBwYXJhbWV0ZXJzKTtcbiAgfVxuXG5cbiAgZ2V0TmFtZXNwYWNlSW5zdHJ1Y3Rpb24obmFtZXNwYWNlS2V5OiBzdHJpbmd8bnVsbCkge1xuICAgIHN3aXRjaCAobmFtZXNwYWNlS2V5KSB7XG4gICAgICBjYXNlICdtYXRoJzpcbiAgICAgICAgcmV0dXJuIFIzLm5hbWVzcGFjZU1hdGhNTDtcbiAgICAgIGNhc2UgJ3N2Zyc6XG4gICAgICAgIHJldHVybiBSMy5uYW1lc3BhY2VTVkc7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gUjMubmFtZXNwYWNlSFRNTDtcbiAgICB9XG4gIH1cblxuICBhZGROYW1lc3BhY2VJbnN0cnVjdGlvbihuc0luc3RydWN0aW9uOiBvLkV4dGVybmFsUmVmZXJlbmNlLCBlbGVtZW50OiB0LkVsZW1lbnQpIHtcbiAgICB0aGlzLl9uYW1lc3BhY2UgPSBuc0luc3RydWN0aW9uO1xuICAgIHRoaXMuY3JlYXRpb25JbnN0cnVjdGlvbihlbGVtZW50LnNvdXJjZVNwYW4sIG5zSW5zdHJ1Y3Rpb24pO1xuICB9XG5cbiAgdmlzaXRFbGVtZW50KGVsZW1lbnQ6IHQuRWxlbWVudCkge1xuICAgIGNvbnN0IGVsZW1lbnRJbmRleCA9IHRoaXMuYWxsb2NhdGVEYXRhU2xvdCgpO1xuICAgIGNvbnN0IHN0eWxpbmdCdWlsZGVyID0gbmV3IFN0eWxpbmdCdWlsZGVyKG8ubGl0ZXJhbChlbGVtZW50SW5kZXgpLCBudWxsKTtcblxuICAgIGxldCBpc05vbkJpbmRhYmxlTW9kZTogYm9vbGVhbiA9IGZhbHNlO1xuICAgIGNvbnN0IGlzSTE4blJvb3RFbGVtZW50OiBib29sZWFuID1cbiAgICAgICAgaXNJMThuUm9vdE5vZGUoZWxlbWVudC5pMThuKSAmJiAhaXNTaW5nbGVJMThuSWN1KGVsZW1lbnQuaTE4bik7XG5cbiAgICBpZiAoaXNJMThuUm9vdEVsZW1lbnQgJiYgdGhpcy5pMThuKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENvdWxkIG5vdCBtYXJrIGFuIGVsZW1lbnQgYXMgdHJhbnNsYXRhYmxlIGluc2lkZSBvZiBhIHRyYW5zbGF0YWJsZSBzZWN0aW9uYCk7XG4gICAgfVxuXG4gICAgY29uc3QgaTE4bkF0dHJzOiAodC5UZXh0QXR0cmlidXRlIHwgdC5Cb3VuZEF0dHJpYnV0ZSlbXSA9IFtdO1xuICAgIGNvbnN0IG91dHB1dEF0dHJzOiB0LlRleHRBdHRyaWJ1dGVbXSA9IFtdO1xuXG4gICAgY29uc3QgW25hbWVzcGFjZUtleSwgZWxlbWVudE5hbWVdID0gc3BsaXROc05hbWUoZWxlbWVudC5uYW1lKTtcbiAgICBjb25zdCBpc05nQ29udGFpbmVyID0gY2hlY2tJc05nQ29udGFpbmVyKGVsZW1lbnQubmFtZSk7XG5cbiAgICAvLyBIYW5kbGUgc3R5bGluZywgaTE4biwgbmdOb25CaW5kYWJsZSBhdHRyaWJ1dGVzXG4gICAgZm9yIChjb25zdCBhdHRyIG9mIGVsZW1lbnQuYXR0cmlidXRlcykge1xuICAgICAgY29uc3Qge25hbWUsIHZhbHVlfSA9IGF0dHI7XG4gICAgICBpZiAobmFtZSA9PT0gTk9OX0JJTkRBQkxFX0FUVFIpIHtcbiAgICAgICAgaXNOb25CaW5kYWJsZU1vZGUgPSB0cnVlO1xuICAgICAgfSBlbHNlIGlmIChuYW1lID09PSAnc3R5bGUnKSB7XG4gICAgICAgIHN0eWxpbmdCdWlsZGVyLnJlZ2lzdGVyU3R5bGVBdHRyKHZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAobmFtZSA9PT0gJ2NsYXNzJykge1xuICAgICAgICBzdHlsaW5nQnVpbGRlci5yZWdpc3RlckNsYXNzQXR0cih2YWx1ZSk7XG4gICAgICB9IGVsc2UgaWYgKGF0dHIuaTE4bikge1xuICAgICAgICBpMThuQXR0cnMucHVzaChhdHRyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG91dHB1dEF0dHJzLnB1c2goYXR0cik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gTWF0Y2ggZGlyZWN0aXZlcyBvbiBub24gaTE4biBhdHRyaWJ1dGVzXG4gICAgdGhpcy5tYXRjaERpcmVjdGl2ZXMoZWxlbWVudC5uYW1lLCBlbGVtZW50KTtcblxuICAgIC8vIFJlZ3VsYXIgZWxlbWVudCBvciBuZy1jb250YWluZXIgY3JlYXRpb24gbW9kZVxuICAgIGNvbnN0IHBhcmFtZXRlcnM6IG8uRXhwcmVzc2lvbltdID0gW28ubGl0ZXJhbChlbGVtZW50SW5kZXgpXTtcbiAgICBpZiAoIWlzTmdDb250YWluZXIpIHtcbiAgICAgIHBhcmFtZXRlcnMucHVzaChvLmxpdGVyYWwoZWxlbWVudE5hbWUpKTtcbiAgICB9XG5cbiAgICAvLyBBZGQgdGhlIGF0dHJpYnV0ZXNcbiAgICBjb25zdCBhdHRyaWJ1dGVzOiBvLkV4cHJlc3Npb25bXSA9IFtdO1xuICAgIGNvbnN0IGFsbE90aGVySW5wdXRzOiB0LkJvdW5kQXR0cmlidXRlW10gPSBbXTtcblxuICAgIGVsZW1lbnQuaW5wdXRzLmZvckVhY2goKGlucHV0OiB0LkJvdW5kQXR0cmlidXRlKSA9PiB7XG4gICAgICBpZiAoIXN0eWxpbmdCdWlsZGVyLnJlZ2lzdGVyQm91bmRJbnB1dChpbnB1dCkpIHtcbiAgICAgICAgaWYgKGlucHV0LnR5cGUgPT09IEJpbmRpbmdUeXBlLlByb3BlcnR5KSB7XG4gICAgICAgICAgaWYgKGlucHV0LmkxOG4pIHtcbiAgICAgICAgICAgIGkxOG5BdHRycy5wdXNoKGlucHV0KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYWxsT3RoZXJJbnB1dHMucHVzaChpbnB1dCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGFsbE90aGVySW5wdXRzLnB1c2goaW5wdXQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBvdXRwdXRBdHRycy5mb3JFYWNoKGF0dHIgPT4gYXR0cmlidXRlcy5wdXNoKG8ubGl0ZXJhbChhdHRyLm5hbWUpLCBvLmxpdGVyYWwoYXR0ci52YWx1ZSkpKTtcblxuICAgIC8vIHRoaXMgd2lsbCBidWlsZCB0aGUgaW5zdHJ1Y3Rpb25zIHNvIHRoYXQgdGhleSBmYWxsIGludG8gdGhlIGZvbGxvd2luZyBzeW50YXhcbiAgICAvLyBhZGQgYXR0cmlidXRlcyBmb3IgZGlyZWN0aXZlIG1hdGNoaW5nIHB1cnBvc2VzXG4gICAgYXR0cmlidXRlcy5wdXNoKC4uLnRoaXMucHJlcGFyZVN5bnRoZXRpY0FuZFNlbGVjdE9ubHlBdHRycyhcbiAgICAgICAgYWxsT3RoZXJJbnB1dHMsIGVsZW1lbnQub3V0cHV0cywgc3R5bGluZ0J1aWxkZXIpKTtcbiAgICBwYXJhbWV0ZXJzLnB1c2godGhpcy50b0F0dHJzUGFyYW0oYXR0cmlidXRlcykpO1xuXG4gICAgLy8gbG9jYWwgcmVmcyAoZXguOiA8ZGl2ICNmb28gI2Jhcj1cImJhelwiPilcbiAgICBwYXJhbWV0ZXJzLnB1c2godGhpcy5wcmVwYXJlUmVmc1BhcmFtZXRlcihlbGVtZW50LnJlZmVyZW5jZXMpKTtcblxuICAgIGNvbnN0IHdhc0luTmFtZXNwYWNlID0gdGhpcy5fbmFtZXNwYWNlO1xuICAgIGNvbnN0IGN1cnJlbnROYW1lc3BhY2UgPSB0aGlzLmdldE5hbWVzcGFjZUluc3RydWN0aW9uKG5hbWVzcGFjZUtleSk7XG5cbiAgICAvLyBJZiB0aGUgbmFtZXNwYWNlIGlzIGNoYW5naW5nIG5vdywgaW5jbHVkZSBhbiBpbnN0cnVjdGlvbiB0byBjaGFuZ2UgaXRcbiAgICAvLyBkdXJpbmcgZWxlbWVudCBjcmVhdGlvbi5cbiAgICBpZiAoY3VycmVudE5hbWVzcGFjZSAhPT0gd2FzSW5OYW1lc3BhY2UpIHtcbiAgICAgIHRoaXMuYWRkTmFtZXNwYWNlSW5zdHJ1Y3Rpb24oY3VycmVudE5hbWVzcGFjZSwgZWxlbWVudCk7XG4gICAgfVxuXG4gICAgY29uc3QgaW1wbGljaXQgPSBvLnZhcmlhYmxlKENPTlRFWFRfTkFNRSk7XG5cbiAgICBpZiAodGhpcy5pMThuKSB7XG4gICAgICB0aGlzLmkxOG4uYXBwZW5kRWxlbWVudChlbGVtZW50LmkxOG4gISwgZWxlbWVudEluZGV4KTtcbiAgICB9XG5cbiAgICBjb25zdCBoYXNDaGlsZHJlbiA9ICgpID0+IHtcbiAgICAgIGlmICghaXNJMThuUm9vdEVsZW1lbnQgJiYgdGhpcy5pMThuKSB7XG4gICAgICAgIC8vIHdlIGRvIG5vdCBhcHBlbmQgdGV4dCBub2RlIGluc3RydWN0aW9ucyBhbmQgSUNVcyBpbnNpZGUgaTE4biBzZWN0aW9uLFxuICAgICAgICAvLyBzbyB3ZSBleGNsdWRlIHRoZW0gd2hpbGUgY2FsY3VsYXRpbmcgd2hldGhlciBjdXJyZW50IGVsZW1lbnQgaGFzIGNoaWxkcmVuXG4gICAgICAgIHJldHVybiAhaGFzVGV4dENoaWxkcmVuT25seShlbGVtZW50LmNoaWxkcmVuKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBlbGVtZW50LmNoaWxkcmVuLmxlbmd0aCA+IDA7XG4gICAgfTtcblxuICAgIGNvbnN0IGNyZWF0ZVNlbGZDbG9zaW5nSW5zdHJ1Y3Rpb24gPSAhc3R5bGluZ0J1aWxkZXIuaGFzQmluZGluZ3NPckluaXRpYWxWYWx1ZXMoKSAmJlxuICAgICAgICAhaXNOZ0NvbnRhaW5lciAmJiBlbGVtZW50Lm91dHB1dHMubGVuZ3RoID09PSAwICYmIGkxOG5BdHRycy5sZW5ndGggPT09IDAgJiYgIWhhc0NoaWxkcmVuKCk7XG5cbiAgICBjb25zdCBjcmVhdGVTZWxmQ2xvc2luZ0kxOG5JbnN0cnVjdGlvbiA9ICFjcmVhdGVTZWxmQ2xvc2luZ0luc3RydWN0aW9uICYmXG4gICAgICAgICFzdHlsaW5nQnVpbGRlci5oYXNCaW5kaW5nc09ySW5pdGlhbFZhbHVlcygpICYmIGhhc1RleHRDaGlsZHJlbk9ubHkoZWxlbWVudC5jaGlsZHJlbik7XG5cbiAgICBpZiAoY3JlYXRlU2VsZkNsb3NpbmdJbnN0cnVjdGlvbikge1xuICAgICAgdGhpcy5jcmVhdGlvbkluc3RydWN0aW9uKGVsZW1lbnQuc291cmNlU3BhbiwgUjMuZWxlbWVudCwgdHJpbVRyYWlsaW5nTnVsbHMocGFyYW1ldGVycykpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNyZWF0aW9uSW5zdHJ1Y3Rpb24oXG4gICAgICAgICAgZWxlbWVudC5zb3VyY2VTcGFuLCBpc05nQ29udGFpbmVyID8gUjMuZWxlbWVudENvbnRhaW5lclN0YXJ0IDogUjMuZWxlbWVudFN0YXJ0LFxuICAgICAgICAgIHRyaW1UcmFpbGluZ051bGxzKHBhcmFtZXRlcnMpKTtcblxuICAgICAgaWYgKGlzTm9uQmluZGFibGVNb2RlKSB7XG4gICAgICAgIHRoaXMuY3JlYXRpb25JbnN0cnVjdGlvbihlbGVtZW50LnNvdXJjZVNwYW4sIFIzLmRpc2FibGVCaW5kaW5ncyk7XG4gICAgICB9XG5cbiAgICAgIGlmIChpc0kxOG5Sb290RWxlbWVudCkge1xuICAgICAgICB0aGlzLmkxOG5TdGFydChlbGVtZW50LnNvdXJjZVNwYW4sIGVsZW1lbnQuaTE4biAhLCBjcmVhdGVTZWxmQ2xvc2luZ0kxOG5JbnN0cnVjdGlvbik7XG4gICAgICB9XG5cbiAgICAgIC8vIHByb2Nlc3MgaTE4biBlbGVtZW50IGF0dHJpYnV0ZXNcbiAgICAgIGlmIChpMThuQXR0cnMubGVuZ3RoKSB7XG4gICAgICAgIGxldCBoYXNCaW5kaW5nczogYm9vbGVhbiA9IGZhbHNlO1xuICAgICAgICBjb25zdCBpMThuQXR0ckFyZ3M6IG8uRXhwcmVzc2lvbltdID0gW107XG4gICAgICAgIGkxOG5BdHRycy5mb3JFYWNoKGF0dHIgPT4ge1xuICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBhdHRyLmkxOG4gIWFzIGkxOG4uTWVzc2FnZTtcbiAgICAgICAgICBpZiAoYXR0ciBpbnN0YW5jZW9mIHQuVGV4dEF0dHJpYnV0ZSkge1xuICAgICAgICAgICAgaTE4bkF0dHJBcmdzLnB1c2goby5saXRlcmFsKGF0dHIubmFtZSksIHRoaXMuaTE4blRyYW5zbGF0ZShtZXNzYWdlKSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbnZlcnRlZCA9IGF0dHIudmFsdWUudmlzaXQodGhpcy5fdmFsdWVDb252ZXJ0ZXIpO1xuICAgICAgICAgICAgdGhpcy5hbGxvY2F0ZUJpbmRpbmdTbG90cyhjb252ZXJ0ZWQpO1xuICAgICAgICAgICAgaWYgKGNvbnZlcnRlZCBpbnN0YW5jZW9mIEludGVycG9sYXRpb24pIHtcbiAgICAgICAgICAgICAgY29uc3QgcGxhY2Vob2xkZXJzID0gYXNzZW1ibGVCb3VuZFRleHRQbGFjZWhvbGRlcnMobWVzc2FnZSk7XG4gICAgICAgICAgICAgIGNvbnN0IHBhcmFtcyA9IHBsYWNlaG9sZGVyc1RvUGFyYW1zKHBsYWNlaG9sZGVycyk7XG4gICAgICAgICAgICAgIGkxOG5BdHRyQXJncy5wdXNoKG8ubGl0ZXJhbChhdHRyLm5hbWUpLCB0aGlzLmkxOG5UcmFuc2xhdGUobWVzc2FnZSwgcGFyYW1zKSk7XG4gICAgICAgICAgICAgIGNvbnZlcnRlZC5leHByZXNzaW9ucy5mb3JFYWNoKGV4cHJlc3Npb24gPT4ge1xuICAgICAgICAgICAgICAgIGhhc0JpbmRpbmdzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBjb25zdCBiaW5kaW5nID0gdGhpcy5jb252ZXJ0RXhwcmVzc2lvbkJpbmRpbmcoaW1wbGljaXQsIGV4cHJlc3Npb24pO1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlSW5zdHJ1Y3Rpb24oZWxlbWVudC5zb3VyY2VTcGFuLCBSMy5pMThuRXhwLCBbYmluZGluZ10pO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoaTE4bkF0dHJBcmdzLmxlbmd0aCkge1xuICAgICAgICAgIGNvbnN0IGluZGV4OiBvLkV4cHJlc3Npb24gPSBvLmxpdGVyYWwodGhpcy5hbGxvY2F0ZURhdGFTbG90KCkpO1xuICAgICAgICAgIGNvbnN0IGFyZ3MgPSB0aGlzLmNvbnN0YW50UG9vbC5nZXRDb25zdExpdGVyYWwoby5saXRlcmFsQXJyKGkxOG5BdHRyQXJncyksIHRydWUpO1xuICAgICAgICAgIHRoaXMuY3JlYXRpb25JbnN0cnVjdGlvbihlbGVtZW50LnNvdXJjZVNwYW4sIFIzLmkxOG5BdHRyaWJ1dGVzLCBbaW5kZXgsIGFyZ3NdKTtcbiAgICAgICAgICBpZiAoaGFzQmluZGluZ3MpIHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlSW5zdHJ1Y3Rpb24oZWxlbWVudC5zb3VyY2VTcGFuLCBSMy5pMThuQXBwbHksIFtpbmRleF0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBUaGUgc3R5bGUgYmluZGluZ3MgY29kZSBpcyBwbGFjZWQgaW50byB0d28gZGlzdGluY3QgYmxvY2tzIHdpdGhpbiB0aGUgdGVtcGxhdGUgZnVuY3Rpb24gQU9UXG4gICAgICAvLyBjb2RlOiBjcmVhdGlvbiBhbmQgdXBkYXRlLiBUaGUgY3JlYXRpb24gY29kZSBjb250YWlucyB0aGUgYGVsZW1lbnRTdHlsaW5nYCBpbnN0cnVjdGlvbnNcbiAgICAgIC8vIHdoaWNoIHdpbGwgYXBwbHkgdGhlIGNvbGxlY3RlZCBiaW5kaW5nIHZhbHVlcyB0byB0aGUgZWxlbWVudC4gYGVsZW1lbnRTdHlsaW5nYCBpc1xuICAgICAgLy8gZGVzaWduZWQgdG8gcnVuIGluc2lkZSBvZiBgZWxlbWVudFN0YXJ0YCBhbmQgYGVsZW1lbnRFbmRgLiBUaGUgdXBkYXRlIGluc3RydWN0aW9uc1xuICAgICAgLy8gKHRoaW5ncyBsaWtlIGBlbGVtZW50U3R5bGVQcm9wYCwgYGVsZW1lbnRDbGFzc1Byb3BgLCBldGMuLikgYXJlIGFwcGxpZWQgbGF0ZXIgb24gaW4gdGhpc1xuICAgICAgLy8gZmlsZVxuICAgICAgdGhpcy5wcm9jZXNzU3R5bGluZ0luc3RydWN0aW9uKFxuICAgICAgICAgIGltcGxpY2l0LFxuICAgICAgICAgIHN0eWxpbmdCdWlsZGVyLmJ1aWxkRWxlbWVudFN0eWxpbmdJbnN0cnVjdGlvbihlbGVtZW50LnNvdXJjZVNwYW4sIHRoaXMuY29uc3RhbnRQb29sKSxcbiAgICAgICAgICB0cnVlKTtcblxuICAgICAgLy8gR2VuZXJhdGUgTGlzdGVuZXJzIChvdXRwdXRzKVxuICAgICAgZWxlbWVudC5vdXRwdXRzLmZvckVhY2goKG91dHB1dEFzdDogdC5Cb3VuZEV2ZW50KSA9PiB7XG4gICAgICAgIHRoaXMuY3JlYXRpb25JbnN0cnVjdGlvbihcbiAgICAgICAgICAgIG91dHB1dEFzdC5zb3VyY2VTcGFuLCBSMy5saXN0ZW5lcixcbiAgICAgICAgICAgIHRoaXMucHJlcGFyZUxpc3RlbmVyUGFyYW1ldGVyKGVsZW1lbnQubmFtZSwgb3V0cHV0QXN0LCBlbGVtZW50SW5kZXgpKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIHRoZSBjb2RlIGhlcmUgd2lsbCBjb2xsZWN0IGFsbCB1cGRhdGUtbGV2ZWwgc3R5bGluZyBpbnN0cnVjdGlvbnMgYW5kIGFkZCB0aGVtIHRvIHRoZVxuICAgIC8vIHVwZGF0ZSBibG9jayBvZiB0aGUgdGVtcGxhdGUgZnVuY3Rpb24gQU9UIGNvZGUuIEluc3RydWN0aW9ucyBsaWtlIGBlbGVtZW50U3R5bGVQcm9wYCxcbiAgICAvLyBgZWxlbWVudFN0eWxpbmdNYXBgLCBgZWxlbWVudENsYXNzUHJvcGAgYW5kIGBlbGVtZW50U3R5bGluZ0FwcGx5YCBhcmUgYWxsIGdlbmVyYXRlZFxuICAgIC8vIGFuZCBhc3NpZ24gaW4gdGhlIGNvZGUgYmVsb3cuXG4gICAgc3R5bGluZ0J1aWxkZXIuYnVpbGRVcGRhdGVMZXZlbEluc3RydWN0aW9ucyh0aGlzLl92YWx1ZUNvbnZlcnRlcikuZm9yRWFjaChpbnN0cnVjdGlvbiA9PiB7XG4gICAgICB0aGlzLnByb2Nlc3NTdHlsaW5nSW5zdHJ1Y3Rpb24oaW1wbGljaXQsIGluc3RydWN0aW9uLCBmYWxzZSk7XG4gICAgfSk7XG5cbiAgICAvLyBHZW5lcmF0ZSBlbGVtZW50IGlucHV0IGJpbmRpbmdzXG4gICAgYWxsT3RoZXJJbnB1dHMuZm9yRWFjaCgoaW5wdXQ6IHQuQm91bmRBdHRyaWJ1dGUpID0+IHtcbiAgICAgIGNvbnN0IGluc3RydWN0aW9uID0gbWFwQmluZGluZ1RvSW5zdHJ1Y3Rpb24oaW5wdXQudHlwZSk7XG4gICAgICBpZiAoaW5wdXQudHlwZSA9PT0gQmluZGluZ1R5cGUuQW5pbWF0aW9uKSB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gaW5wdXQudmFsdWUudmlzaXQodGhpcy5fdmFsdWVDb252ZXJ0ZXIpO1xuICAgICAgICAvLyBzZXRQcm9wZXJ0eSB3aXRob3V0IGEgdmFsdWUgZG9lc24ndCBtYWtlIGFueSBzZW5zZVxuICAgICAgICBpZiAodmFsdWUubmFtZSB8fCB2YWx1ZS52YWx1ZSkge1xuICAgICAgICAgIGNvbnN0IGJpbmRpbmdOYW1lID0gcHJlcGFyZVN5bnRoZXRpY1Byb3BlcnR5TmFtZShpbnB1dC5uYW1lKTtcbiAgICAgICAgICB0aGlzLmFsbG9jYXRlQmluZGluZ1Nsb3RzKHZhbHVlKTtcbiAgICAgICAgICB0aGlzLnVwZGF0ZUluc3RydWN0aW9uKGlucHV0LnNvdXJjZVNwYW4sIFIzLmVsZW1lbnRQcm9wZXJ0eSwgKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgby5saXRlcmFsKGVsZW1lbnRJbmRleCksIG8ubGl0ZXJhbChiaW5kaW5nTmFtZSksXG4gICAgICAgICAgICAgIHRoaXMuY29udmVydFByb3BlcnR5QmluZGluZyhpbXBsaWNpdCwgdmFsdWUpXG4gICAgICAgICAgICBdO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGluc3RydWN0aW9uKSB7XG4gICAgICAgIGNvbnN0IHBhcmFtczogYW55W10gPSBbXTtcbiAgICAgICAgY29uc3Qgc2FuaXRpemF0aW9uUmVmID0gcmVzb2x2ZVNhbml0aXphdGlvbkZuKGlucHV0LCBpbnB1dC5zZWN1cml0eUNvbnRleHQpO1xuICAgICAgICBpZiAoc2FuaXRpemF0aW9uUmVmKSBwYXJhbXMucHVzaChzYW5pdGl6YXRpb25SZWYpO1xuXG4gICAgICAgIC8vIFRPRE8oY2h1Y2tqKTogcnVudGltZTogc2VjdXJpdHkgY29udGV4dFxuICAgICAgICBjb25zdCB2YWx1ZSA9IGlucHV0LnZhbHVlLnZpc2l0KHRoaXMuX3ZhbHVlQ29udmVydGVyKTtcbiAgICAgICAgdGhpcy5hbGxvY2F0ZUJpbmRpbmdTbG90cyh2YWx1ZSk7XG5cbiAgICAgICAgdGhpcy51cGRhdGVJbnN0cnVjdGlvbihpbnB1dC5zb3VyY2VTcGFuLCBpbnN0cnVjdGlvbiwgKCkgPT4ge1xuICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICBvLmxpdGVyYWwoZWxlbWVudEluZGV4KSwgby5saXRlcmFsKGlucHV0Lm5hbWUpLFxuICAgICAgICAgICAgdGhpcy5jb252ZXJ0UHJvcGVydHlCaW5kaW5nKGltcGxpY2l0LCB2YWx1ZSksIC4uLnBhcmFtc1xuICAgICAgICAgIF07XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fdW5zdXBwb3J0ZWQoYGJpbmRpbmcgdHlwZSAke2lucHV0LnR5cGV9YCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBUcmF2ZXJzZSBlbGVtZW50IGNoaWxkIG5vZGVzXG4gICAgdC52aXNpdEFsbCh0aGlzLCBlbGVtZW50LmNoaWxkcmVuKTtcblxuICAgIGlmICghaXNJMThuUm9vdEVsZW1lbnQgJiYgdGhpcy5pMThuKSB7XG4gICAgICB0aGlzLmkxOG4uYXBwZW5kRWxlbWVudChlbGVtZW50LmkxOG4gISwgZWxlbWVudEluZGV4LCB0cnVlKTtcbiAgICB9XG5cbiAgICBpZiAoIWNyZWF0ZVNlbGZDbG9zaW5nSW5zdHJ1Y3Rpb24pIHtcbiAgICAgIC8vIEZpbmlzaCBlbGVtZW50IGNvbnN0cnVjdGlvbiBtb2RlLlxuICAgICAgY29uc3Qgc3BhbiA9IGVsZW1lbnQuZW5kU291cmNlU3BhbiB8fCBlbGVtZW50LnNvdXJjZVNwYW47XG4gICAgICBpZiAoaXNJMThuUm9vdEVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5pMThuRW5kKHNwYW4sIGNyZWF0ZVNlbGZDbG9zaW5nSTE4bkluc3RydWN0aW9uKTtcbiAgICAgIH1cbiAgICAgIGlmIChpc05vbkJpbmRhYmxlTW9kZSkge1xuICAgICAgICB0aGlzLmNyZWF0aW9uSW5zdHJ1Y3Rpb24oc3BhbiwgUjMuZW5hYmxlQmluZGluZ3MpO1xuICAgICAgfVxuICAgICAgdGhpcy5jcmVhdGlvbkluc3RydWN0aW9uKHNwYW4sIGlzTmdDb250YWluZXIgPyBSMy5lbGVtZW50Q29udGFpbmVyRW5kIDogUjMuZWxlbWVudEVuZCk7XG4gICAgfVxuICB9XG5cbiAgdmlzaXRUZW1wbGF0ZSh0ZW1wbGF0ZTogdC5UZW1wbGF0ZSkge1xuICAgIGNvbnN0IHRlbXBsYXRlSW5kZXggPSB0aGlzLmFsbG9jYXRlRGF0YVNsb3QoKTtcblxuICAgIGlmICh0aGlzLmkxOG4pIHtcbiAgICAgIHRoaXMuaTE4bi5hcHBlbmRUZW1wbGF0ZSh0ZW1wbGF0ZS5pMThuICEsIHRlbXBsYXRlSW5kZXgpO1xuICAgIH1cblxuICAgIGNvbnN0IHRhZ05hbWUgPSBzYW5pdGl6ZUlkZW50aWZpZXIodGVtcGxhdGUudGFnTmFtZSB8fCAnJyk7XG4gICAgY29uc3QgY29udGV4dE5hbWUgPSBgJHt0YWdOYW1lID8gdGhpcy5jb250ZXh0TmFtZSArICdfJyArIHRhZ05hbWUgOiAnJ31fJHt0ZW1wbGF0ZUluZGV4fWA7XG4gICAgY29uc3QgdGVtcGxhdGVOYW1lID0gYCR7Y29udGV4dE5hbWV9X1RlbXBsYXRlYDtcblxuICAgIGNvbnN0IHBhcmFtZXRlcnM6IG8uRXhwcmVzc2lvbltdID0gW1xuICAgICAgby5saXRlcmFsKHRlbXBsYXRlSW5kZXgpLFxuICAgICAgby52YXJpYWJsZSh0ZW1wbGF0ZU5hbWUpLFxuICAgICAgby5saXRlcmFsKHRlbXBsYXRlLnRhZ05hbWUpLFxuICAgIF07XG5cbiAgICAvLyBmaW5kIGRpcmVjdGl2ZXMgbWF0Y2hpbmcgb24gYSBnaXZlbiA8bmctdGVtcGxhdGU+IG5vZGVcbiAgICB0aGlzLm1hdGNoRGlyZWN0aXZlcygnbmctdGVtcGxhdGUnLCB0ZW1wbGF0ZSk7XG5cbiAgICAvLyBwcmVwYXJlIGF0dHJpYnV0ZXMgcGFyYW1ldGVyIChpbmNsdWRpbmcgYXR0cmlidXRlcyB1c2VkIGZvciBkaXJlY3RpdmUgbWF0Y2hpbmcpXG4gICAgY29uc3QgYXR0cnNFeHByczogby5FeHByZXNzaW9uW10gPSBbXTtcbiAgICB0ZW1wbGF0ZS5hdHRyaWJ1dGVzLmZvckVhY2goXG4gICAgICAgIChhOiB0LlRleHRBdHRyaWJ1dGUpID0+IHsgYXR0cnNFeHBycy5wdXNoKGFzTGl0ZXJhbChhLm5hbWUpLCBhc0xpdGVyYWwoYS52YWx1ZSkpOyB9KTtcbiAgICBhdHRyc0V4cHJzLnB1c2goLi4udGhpcy5wcmVwYXJlU3ludGhldGljQW5kU2VsZWN0T25seUF0dHJzKHRlbXBsYXRlLmlucHV0cywgdGVtcGxhdGUub3V0cHV0cykpO1xuICAgIHBhcmFtZXRlcnMucHVzaCh0aGlzLnRvQXR0cnNQYXJhbShhdHRyc0V4cHJzKSk7XG5cbiAgICAvLyBsb2NhbCByZWZzIChleC46IDxuZy10ZW1wbGF0ZSAjZm9vPilcbiAgICBpZiAodGVtcGxhdGUucmVmZXJlbmNlcyAmJiB0ZW1wbGF0ZS5yZWZlcmVuY2VzLmxlbmd0aCkge1xuICAgICAgcGFyYW1ldGVycy5wdXNoKHRoaXMucHJlcGFyZVJlZnNQYXJhbWV0ZXIodGVtcGxhdGUucmVmZXJlbmNlcykpO1xuICAgICAgcGFyYW1ldGVycy5wdXNoKG8uaW1wb3J0RXhwcihSMy50ZW1wbGF0ZVJlZkV4dHJhY3RvcikpO1xuICAgIH1cblxuICAgIC8vIGhhbmRsZSBwcm9wZXJ0eSBiaW5kaW5ncyBlLmcuIHAoMSwgJ25nRm9yT2YnLCDJtWJpbmQoY3R4Lml0ZW1zKSk7XG4gICAgY29uc3QgY29udGV4dCA9IG8udmFyaWFibGUoQ09OVEVYVF9OQU1FKTtcbiAgICB0ZW1wbGF0ZS5pbnB1dHMuZm9yRWFjaChpbnB1dCA9PiB7XG4gICAgICBjb25zdCB2YWx1ZSA9IGlucHV0LnZhbHVlLnZpc2l0KHRoaXMuX3ZhbHVlQ29udmVydGVyKTtcbiAgICAgIHRoaXMuYWxsb2NhdGVCaW5kaW5nU2xvdHModmFsdWUpO1xuICAgICAgdGhpcy51cGRhdGVJbnN0cnVjdGlvbih0ZW1wbGF0ZS5zb3VyY2VTcGFuLCBSMy5lbGVtZW50UHJvcGVydHksICgpID0+IHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICBvLmxpdGVyYWwodGVtcGxhdGVJbmRleCksIG8ubGl0ZXJhbChpbnB1dC5uYW1lKSxcbiAgICAgICAgICB0aGlzLmNvbnZlcnRQcm9wZXJ0eUJpbmRpbmcoY29udGV4dCwgdmFsdWUpXG4gICAgICAgIF07XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIC8vIENyZWF0ZSB0aGUgdGVtcGxhdGUgZnVuY3Rpb25cbiAgICBjb25zdCB0ZW1wbGF0ZVZpc2l0b3IgPSBuZXcgVGVtcGxhdGVEZWZpbml0aW9uQnVpbGRlcihcbiAgICAgICAgdGhpcy5jb25zdGFudFBvb2wsIHRoaXMuX2JpbmRpbmdTY29wZSwgdGhpcy5sZXZlbCArIDEsIGNvbnRleHROYW1lLCB0aGlzLmkxOG4sXG4gICAgICAgIHRlbXBsYXRlSW5kZXgsIHRlbXBsYXRlTmFtZSwgW10sIHRoaXMuZGlyZWN0aXZlTWF0Y2hlciwgdGhpcy5kaXJlY3RpdmVzLFxuICAgICAgICB0aGlzLnBpcGVUeXBlQnlOYW1lLCB0aGlzLnBpcGVzLCB0aGlzLl9uYW1lc3BhY2UsIHRoaXMuZmlsZUJhc2VkSTE4blN1ZmZpeCxcbiAgICAgICAgdGhpcy5pMThuVXNlRXh0ZXJuYWxJZHMpO1xuXG4gICAgLy8gTmVzdGVkIHRlbXBsYXRlcyBtdXN0IG5vdCBiZSB2aXNpdGVkIHVudGlsIGFmdGVyIHRoZWlyIHBhcmVudCB0ZW1wbGF0ZXMgaGF2ZSBjb21wbGV0ZWRcbiAgICAvLyBwcm9jZXNzaW5nLCBzbyB0aGV5IGFyZSBxdWV1ZWQgaGVyZSB1bnRpbCBhZnRlciB0aGUgaW5pdGlhbCBwYXNzLiBPdGhlcndpc2UsIHdlIHdvdWxkbid0XG4gICAgLy8gYmUgYWJsZSB0byBzdXBwb3J0IGJpbmRpbmdzIGluIG5lc3RlZCB0ZW1wbGF0ZXMgdG8gbG9jYWwgcmVmcyB0aGF0IG9jY3VyIGFmdGVyIHRoZVxuICAgIC8vIHRlbXBsYXRlIGRlZmluaXRpb24uIGUuZy4gPGRpdiAqbmdJZj1cInNob3dpbmdcIj57eyBmb28gfX08L2Rpdj4gIDxkaXYgI2Zvbz48L2Rpdj5cbiAgICB0aGlzLl9uZXN0ZWRUZW1wbGF0ZUZucy5wdXNoKCgpID0+IHtcbiAgICAgIGNvbnN0IHRlbXBsYXRlRnVuY3Rpb25FeHByID0gdGVtcGxhdGVWaXNpdG9yLmJ1aWxkVGVtcGxhdGVGdW5jdGlvbihcbiAgICAgICAgICB0ZW1wbGF0ZS5jaGlsZHJlbiwgdGVtcGxhdGUudmFyaWFibGVzLFxuICAgICAgICAgIHRoaXMuX25nQ29udGVudFNlbGVjdG9ycy5sZW5ndGggKyB0aGlzLl9uZ0NvbnRlbnRTZWxlY3RvcnNPZmZzZXQsIHRlbXBsYXRlLmkxOG4pO1xuICAgICAgdGhpcy5jb25zdGFudFBvb2wuc3RhdGVtZW50cy5wdXNoKHRlbXBsYXRlRnVuY3Rpb25FeHByLnRvRGVjbFN0bXQodGVtcGxhdGVOYW1lLCBudWxsKSk7XG4gICAgICBpZiAodGVtcGxhdGVWaXNpdG9yLl9oYXNOZ0NvbnRlbnQpIHtcbiAgICAgICAgdGhpcy5faGFzTmdDb250ZW50ID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5fbmdDb250ZW50U2VsZWN0b3JzLnB1c2goLi4udGVtcGxhdGVWaXNpdG9yLl9uZ0NvbnRlbnRTZWxlY3RvcnMpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gZS5nLiB0ZW1wbGF0ZSgxLCBNeUNvbXBfVGVtcGxhdGVfMSlcbiAgICB0aGlzLmNyZWF0aW9uSW5zdHJ1Y3Rpb24odGVtcGxhdGUuc291cmNlU3BhbiwgUjMudGVtcGxhdGVDcmVhdGUsICgpID0+IHtcbiAgICAgIHBhcmFtZXRlcnMuc3BsaWNlKFxuICAgICAgICAgIDIsIDAsIG8ubGl0ZXJhbCh0ZW1wbGF0ZVZpc2l0b3IuZ2V0Q29uc3RDb3VudCgpKSxcbiAgICAgICAgICBvLmxpdGVyYWwodGVtcGxhdGVWaXNpdG9yLmdldFZhckNvdW50KCkpKTtcbiAgICAgIHJldHVybiB0cmltVHJhaWxpbmdOdWxscyhwYXJhbWV0ZXJzKTtcbiAgICB9KTtcblxuICAgIC8vIEdlbmVyYXRlIGxpc3RlbmVycyBmb3IgZGlyZWN0aXZlIG91dHB1dFxuICAgIHRlbXBsYXRlLm91dHB1dHMuZm9yRWFjaCgob3V0cHV0QXN0OiB0LkJvdW5kRXZlbnQpID0+IHtcbiAgICAgIHRoaXMuY3JlYXRpb25JbnN0cnVjdGlvbihcbiAgICAgICAgICBvdXRwdXRBc3Quc291cmNlU3BhbiwgUjMubGlzdGVuZXIsXG4gICAgICAgICAgdGhpcy5wcmVwYXJlTGlzdGVuZXJQYXJhbWV0ZXIoJ25nX3RlbXBsYXRlJywgb3V0cHV0QXN0LCB0ZW1wbGF0ZUluZGV4KSk7XG4gICAgfSk7XG4gIH1cblxuICAvLyBUaGVzZSBzaG91bGQgYmUgaGFuZGxlZCBpbiB0aGUgdGVtcGxhdGUgb3IgZWxlbWVudCBkaXJlY3RseS5cbiAgcmVhZG9ubHkgdmlzaXRSZWZlcmVuY2UgPSBpbnZhbGlkO1xuICByZWFkb25seSB2aXNpdFZhcmlhYmxlID0gaW52YWxpZDtcbiAgcmVhZG9ubHkgdmlzaXRUZXh0QXR0cmlidXRlID0gaW52YWxpZDtcbiAgcmVhZG9ubHkgdmlzaXRCb3VuZEF0dHJpYnV0ZSA9IGludmFsaWQ7XG4gIHJlYWRvbmx5IHZpc2l0Qm91bmRFdmVudCA9IGludmFsaWQ7XG5cbiAgdmlzaXRCb3VuZFRleHQodGV4dDogdC5Cb3VuZFRleHQpIHtcbiAgICBpZiAodGhpcy5pMThuKSB7XG4gICAgICBjb25zdCB2YWx1ZSA9IHRleHQudmFsdWUudmlzaXQodGhpcy5fdmFsdWVDb252ZXJ0ZXIpO1xuICAgICAgdGhpcy5hbGxvY2F0ZUJpbmRpbmdTbG90cyh2YWx1ZSk7XG4gICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBJbnRlcnBvbGF0aW9uKSB7XG4gICAgICAgIHRoaXMuaTE4bi5hcHBlbmRCb3VuZFRleHQodGV4dC5pMThuICEpO1xuICAgICAgICB0aGlzLmkxOG5BcHBlbmRCaW5kaW5ncyh2YWx1ZS5leHByZXNzaW9ucyk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgbm9kZUluZGV4ID0gdGhpcy5hbGxvY2F0ZURhdGFTbG90KCk7XG5cbiAgICB0aGlzLmNyZWF0aW9uSW5zdHJ1Y3Rpb24odGV4dC5zb3VyY2VTcGFuLCBSMy50ZXh0LCBbby5saXRlcmFsKG5vZGVJbmRleCldKTtcblxuICAgIGNvbnN0IHZhbHVlID0gdGV4dC52YWx1ZS52aXNpdCh0aGlzLl92YWx1ZUNvbnZlcnRlcik7XG4gICAgdGhpcy5hbGxvY2F0ZUJpbmRpbmdTbG90cyh2YWx1ZSk7XG4gICAgdGhpcy51cGRhdGVJbnN0cnVjdGlvbihcbiAgICAgICAgdGV4dC5zb3VyY2VTcGFuLCBSMy50ZXh0QmluZGluZyxcbiAgICAgICAgKCkgPT4gW28ubGl0ZXJhbChub2RlSW5kZXgpLCB0aGlzLmNvbnZlcnRQcm9wZXJ0eUJpbmRpbmcoby52YXJpYWJsZShDT05URVhUX05BTUUpLCB2YWx1ZSldKTtcbiAgfVxuXG4gIHZpc2l0VGV4dCh0ZXh0OiB0LlRleHQpIHtcbiAgICAvLyB3aGVuIGEgdGV4dCBlbGVtZW50IGlzIGxvY2F0ZWQgd2l0aGluIGEgdHJhbnNsYXRhYmxlXG4gICAgLy8gYmxvY2ssIHdlIGV4Y2x1ZGUgdGhpcyB0ZXh0IGVsZW1lbnQgZnJvbSBpbnN0cnVjdGlvbnMgc2V0LFxuICAgIC8vIHNpbmNlIGl0IHdpbGwgYmUgY2FwdHVyZWQgaW4gaTE4biBjb250ZW50IGFuZCBwcm9jZXNzZWQgYXQgcnVudGltZVxuICAgIGlmICghdGhpcy5pMThuKSB7XG4gICAgICB0aGlzLmNyZWF0aW9uSW5zdHJ1Y3Rpb24oXG4gICAgICAgICAgdGV4dC5zb3VyY2VTcGFuLCBSMy50ZXh0LCBbby5saXRlcmFsKHRoaXMuYWxsb2NhdGVEYXRhU2xvdCgpKSwgby5saXRlcmFsKHRleHQudmFsdWUpXSk7XG4gICAgfVxuICB9XG5cbiAgdmlzaXRJY3UoaWN1OiB0LkljdSkge1xuICAgIGxldCBpbml0V2FzSW52b2tlZCA9IGZhbHNlO1xuXG4gICAgLy8gaWYgYW4gSUNVIHdhcyBjcmVhdGVkIG91dHNpZGUgb2YgaTE4biBibG9jaywgd2Ugc3RpbGwgdHJlYXRcbiAgICAvLyBpdCBhcyBhIHRyYW5zbGF0YWJsZSBlbnRpdHkgYW5kIGludm9rZSBpMThuU3RhcnQgYW5kIGkxOG5FbmRcbiAgICAvLyB0byBnZW5lcmF0ZSBpMThuIGNvbnRleHQgYW5kIHRoZSBuZWNlc3NhcnkgaW5zdHJ1Y3Rpb25zXG4gICAgaWYgKCF0aGlzLmkxOG4pIHtcbiAgICAgIGluaXRXYXNJbnZva2VkID0gdHJ1ZTtcbiAgICAgIHRoaXMuaTE4blN0YXJ0KG51bGwsIGljdS5pMThuICEsIHRydWUpO1xuICAgIH1cblxuICAgIGNvbnN0IGkxOG4gPSB0aGlzLmkxOG4gITtcbiAgICBjb25zdCB2YXJzID0gdGhpcy5pMThuQmluZFByb3BzKGljdS52YXJzKTtcbiAgICBjb25zdCBwbGFjZWhvbGRlcnMgPSB0aGlzLmkxOG5CaW5kUHJvcHMoaWN1LnBsYWNlaG9sZGVycyk7XG5cbiAgICAvLyBvdXRwdXQgSUNVIGRpcmVjdGx5IGFuZCBrZWVwIElDVSByZWZlcmVuY2UgaW4gY29udGV4dFxuICAgIGNvbnN0IG1lc3NhZ2UgPSBpY3UuaTE4biAhYXMgaTE4bi5NZXNzYWdlO1xuICAgIGNvbnN0IHRyYW5zZm9ybUZuID0gKHJhdzogby5SZWFkVmFyRXhwcikgPT5cbiAgICAgICAgaW5zdHJ1Y3Rpb24obnVsbCwgUjMuaTE4blBvc3Rwcm9jZXNzLCBbcmF3LCBtYXBMaXRlcmFsKHZhcnMsIHRydWUpXSk7XG5cbiAgICAvLyBpbiBjYXNlIHRoZSB3aG9sZSBpMThuIG1lc3NhZ2UgaXMgYSBzaW5nbGUgSUNVIC0gd2UgZG8gbm90IG5lZWQgdG9cbiAgICAvLyBjcmVhdGUgYSBzZXBhcmF0ZSB0b3AtbGV2ZWwgdHJhbnNsYXRpb24sIHdlIGNhbiB1c2UgdGhlIHJvb3QgcmVmIGluc3RlYWRcbiAgICAvLyBhbmQgbWFrZSB0aGlzIElDVSBhIHRvcC1sZXZlbCB0cmFuc2xhdGlvblxuICAgIGlmIChpc1NpbmdsZUkxOG5JY3UoaTE4bi5tZXRhKSkge1xuICAgICAgdGhpcy5pMThuVHJhbnNsYXRlKG1lc3NhZ2UsIHBsYWNlaG9sZGVycywgaTE4bi5yZWYsIHRyYW5zZm9ybUZuKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gb3V0cHV0IElDVSBkaXJlY3RseSBhbmQga2VlcCBJQ1UgcmVmZXJlbmNlIGluIGNvbnRleHRcbiAgICAgIGNvbnN0IHJlZiA9IHRoaXMuaTE4blRyYW5zbGF0ZShtZXNzYWdlLCBwbGFjZWhvbGRlcnMsIHVuZGVmaW5lZCwgdHJhbnNmb3JtRm4pO1xuICAgICAgaTE4bi5hcHBlbmRJY3UoaWN1RnJvbUkxOG5NZXNzYWdlKG1lc3NhZ2UpLm5hbWUsIHJlZik7XG4gICAgfVxuXG4gICAgaWYgKGluaXRXYXNJbnZva2VkKSB7XG4gICAgICB0aGlzLmkxOG5FbmQobnVsbCwgdHJ1ZSk7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcHJpdmF0ZSBhbGxvY2F0ZURhdGFTbG90KCkgeyByZXR1cm4gdGhpcy5fZGF0YUluZGV4Kys7IH1cblxuICBnZXRDb25zdENvdW50KCkgeyByZXR1cm4gdGhpcy5fZGF0YUluZGV4OyB9XG5cbiAgZ2V0VmFyQ291bnQoKSB7IHJldHVybiB0aGlzLl9wdXJlRnVuY3Rpb25TbG90czsgfVxuXG4gIHByaXZhdGUgYmluZGluZ0NvbnRleHQoKSB7IHJldHVybiBgJHt0aGlzLl9iaW5kaW5nQ29udGV4dCsrfWA7IH1cblxuICAvLyBCaW5kaW5ncyBtdXN0IG9ubHkgYmUgcmVzb2x2ZWQgYWZ0ZXIgYWxsIGxvY2FsIHJlZnMgaGF2ZSBiZWVuIHZpc2l0ZWQsIHNvIGFsbFxuICAvLyBpbnN0cnVjdGlvbnMgYXJlIHF1ZXVlZCBpbiBjYWxsYmFja3MgdGhhdCBleGVjdXRlIG9uY2UgdGhlIGluaXRpYWwgcGFzcyBoYXMgY29tcGxldGVkLlxuICAvLyBPdGhlcndpc2UsIHdlIHdvdWxkbid0IGJlIGFibGUgdG8gc3VwcG9ydCBsb2NhbCByZWZzIHRoYXQgYXJlIGRlZmluZWQgYWZ0ZXIgdGhlaXJcbiAgLy8gYmluZGluZ3MuIGUuZy4ge3sgZm9vIH19IDxkaXYgI2Zvbz48L2Rpdj5cbiAgcHJpdmF0ZSBpbnN0cnVjdGlvbkZuKFxuICAgICAgZm5zOiAoKCkgPT4gby5TdGF0ZW1lbnQpW10sIHNwYW46IFBhcnNlU291cmNlU3BhbnxudWxsLCByZWZlcmVuY2U6IG8uRXh0ZXJuYWxSZWZlcmVuY2UsXG4gICAgICBwYXJhbXNPckZuOiBvLkV4cHJlc3Npb25bXXwoKCkgPT4gby5FeHByZXNzaW9uW10pLCBwcmVwZW5kOiBib29sZWFuID0gZmFsc2UpOiB2b2lkIHtcbiAgICBmbnNbcHJlcGVuZCA/ICd1bnNoaWZ0JyA6ICdwdXNoJ10oKCkgPT4ge1xuICAgICAgY29uc3QgcGFyYW1zID0gQXJyYXkuaXNBcnJheShwYXJhbXNPckZuKSA/IHBhcmFtc09yRm4gOiBwYXJhbXNPckZuKCk7XG4gICAgICByZXR1cm4gaW5zdHJ1Y3Rpb24oc3BhbiwgcmVmZXJlbmNlLCBwYXJhbXMpLnRvU3RtdCgpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBwcm9jZXNzU3R5bGluZ0luc3RydWN0aW9uKFxuICAgICAgaW1wbGljaXQ6IGFueSwgaW5zdHJ1Y3Rpb246IFN0eWxpbmdJbnN0cnVjdGlvbnxudWxsLCBjcmVhdGVNb2RlOiBib29sZWFuKSB7XG4gICAgaWYgKGluc3RydWN0aW9uKSB7XG4gICAgICBjb25zdCBwYXJhbXNGbiA9ICgpID0+XG4gICAgICAgICAgaW5zdHJ1Y3Rpb24uYnVpbGRQYXJhbXModmFsdWUgPT4gdGhpcy5jb252ZXJ0UHJvcGVydHlCaW5kaW5nKGltcGxpY2l0LCB2YWx1ZSwgdHJ1ZSkpO1xuICAgICAgaWYgKGNyZWF0ZU1vZGUpIHtcbiAgICAgICAgdGhpcy5jcmVhdGlvbkluc3RydWN0aW9uKGluc3RydWN0aW9uLnNvdXJjZVNwYW4sIGluc3RydWN0aW9uLnJlZmVyZW5jZSwgcGFyYW1zRm4pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy51cGRhdGVJbnN0cnVjdGlvbihpbnN0cnVjdGlvbi5zb3VyY2VTcGFuLCBpbnN0cnVjdGlvbi5yZWZlcmVuY2UsIHBhcmFtc0ZuKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGNyZWF0aW9uSW5zdHJ1Y3Rpb24oXG4gICAgICBzcGFuOiBQYXJzZVNvdXJjZVNwYW58bnVsbCwgcmVmZXJlbmNlOiBvLkV4dGVybmFsUmVmZXJlbmNlLFxuICAgICAgcGFyYW1zT3JGbj86IG8uRXhwcmVzc2lvbltdfCgoKSA9PiBvLkV4cHJlc3Npb25bXSksIHByZXBlbmQ/OiBib29sZWFuKSB7XG4gICAgdGhpcy5pbnN0cnVjdGlvbkZuKHRoaXMuX2NyZWF0aW9uQ29kZUZucywgc3BhbiwgcmVmZXJlbmNlLCBwYXJhbXNPckZuIHx8IFtdLCBwcmVwZW5kKTtcbiAgfVxuXG4gIHByaXZhdGUgdXBkYXRlSW5zdHJ1Y3Rpb24oXG4gICAgICBzcGFuOiBQYXJzZVNvdXJjZVNwYW58bnVsbCwgcmVmZXJlbmNlOiBvLkV4dGVybmFsUmVmZXJlbmNlLFxuICAgICAgcGFyYW1zT3JGbj86IG8uRXhwcmVzc2lvbltdfCgoKSA9PiBvLkV4cHJlc3Npb25bXSkpIHtcbiAgICB0aGlzLmluc3RydWN0aW9uRm4odGhpcy5fdXBkYXRlQ29kZUZucywgc3BhbiwgcmVmZXJlbmNlLCBwYXJhbXNPckZuIHx8IFtdKTtcbiAgfVxuXG4gIHByaXZhdGUgYWxsb2NhdGVQdXJlRnVuY3Rpb25TbG90cyhudW1TbG90czogbnVtYmVyKTogbnVtYmVyIHtcbiAgICBjb25zdCBvcmlnaW5hbFNsb3RzID0gdGhpcy5fcHVyZUZ1bmN0aW9uU2xvdHM7XG4gICAgdGhpcy5fcHVyZUZ1bmN0aW9uU2xvdHMgKz0gbnVtU2xvdHM7XG4gICAgcmV0dXJuIG9yaWdpbmFsU2xvdHM7XG4gIH1cblxuICBwcml2YXRlIGFsbG9jYXRlQmluZGluZ1Nsb3RzKHZhbHVlOiBBU1QpIHtcbiAgICB0aGlzLl9iaW5kaW5nU2xvdHMgKz0gdmFsdWUgaW5zdGFuY2VvZiBJbnRlcnBvbGF0aW9uID8gdmFsdWUuZXhwcmVzc2lvbnMubGVuZ3RoIDogMTtcbiAgfVxuXG4gIHByaXZhdGUgY29udmVydEV4cHJlc3Npb25CaW5kaW5nKGltcGxpY2l0OiBvLkV4cHJlc3Npb24sIHZhbHVlOiBBU1QpOiBvLkV4cHJlc3Npb24ge1xuICAgIGNvbnN0IGNvbnZlcnRlZFByb3BlcnR5QmluZGluZyA9XG4gICAgICAgIGNvbnZlcnRQcm9wZXJ0eUJpbmRpbmcodGhpcywgaW1wbGljaXQsIHZhbHVlLCB0aGlzLmJpbmRpbmdDb250ZXh0KCksIEJpbmRpbmdGb3JtLlRyeVNpbXBsZSk7XG4gICAgY29uc3QgdmFsRXhwciA9IGNvbnZlcnRlZFByb3BlcnR5QmluZGluZy5jdXJyVmFsRXhwcjtcbiAgICByZXR1cm4gby5pbXBvcnRFeHByKFIzLmJpbmQpLmNhbGxGbihbdmFsRXhwcl0pO1xuICB9XG5cbiAgcHJpdmF0ZSBjb252ZXJ0UHJvcGVydHlCaW5kaW5nKGltcGxpY2l0OiBvLkV4cHJlc3Npb24sIHZhbHVlOiBBU1QsIHNraXBCaW5kRm4/OiBib29sZWFuKTpcbiAgICAgIG8uRXhwcmVzc2lvbiB7XG4gICAgY29uc3QgaW50ZXJwb2xhdGlvbkZuID1cbiAgICAgICAgdmFsdWUgaW5zdGFuY2VvZiBJbnRlcnBvbGF0aW9uID8gaW50ZXJwb2xhdGUgOiAoKSA9PiBlcnJvcignVW5leHBlY3RlZCBpbnRlcnBvbGF0aW9uJyk7XG5cbiAgICBjb25zdCBjb252ZXJ0ZWRQcm9wZXJ0eUJpbmRpbmcgPSBjb252ZXJ0UHJvcGVydHlCaW5kaW5nKFxuICAgICAgICB0aGlzLCBpbXBsaWNpdCwgdmFsdWUsIHRoaXMuYmluZGluZ0NvbnRleHQoKSwgQmluZGluZ0Zvcm0uVHJ5U2ltcGxlLCBpbnRlcnBvbGF0aW9uRm4pO1xuICAgIHRoaXMuX3RlbXBWYXJpYWJsZXMucHVzaCguLi5jb252ZXJ0ZWRQcm9wZXJ0eUJpbmRpbmcuc3RtdHMpO1xuXG4gICAgY29uc3QgdmFsRXhwciA9IGNvbnZlcnRlZFByb3BlcnR5QmluZGluZy5jdXJyVmFsRXhwcjtcbiAgICByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBJbnRlcnBvbGF0aW9uIHx8IHNraXBCaW5kRm4gPyB2YWxFeHByIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvLmltcG9ydEV4cHIoUjMuYmluZCkuY2FsbEZuKFt2YWxFeHByXSk7XG4gIH1cblxuICBwcml2YXRlIG1hdGNoRGlyZWN0aXZlcyh0YWdOYW1lOiBzdHJpbmcsIGVsT3JUcGw6IHQuRWxlbWVudHx0LlRlbXBsYXRlKSB7XG4gICAgaWYgKHRoaXMuZGlyZWN0aXZlTWF0Y2hlcikge1xuICAgICAgY29uc3Qgc2VsZWN0b3IgPSBjcmVhdGVDc3NTZWxlY3Rvcih0YWdOYW1lLCBnZXRBdHRyc0ZvckRpcmVjdGl2ZU1hdGNoaW5nKGVsT3JUcGwpKTtcbiAgICAgIHRoaXMuZGlyZWN0aXZlTWF0Y2hlci5tYXRjaChcbiAgICAgICAgICBzZWxlY3RvciwgKGNzc1NlbGVjdG9yLCBzdGF0aWNUeXBlKSA9PiB7IHRoaXMuZGlyZWN0aXZlcy5hZGQoc3RhdGljVHlwZSk7IH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBQcmVwYXJlcyBhbGwgYXR0cmlidXRlIGV4cHJlc3Npb24gdmFsdWVzIGZvciB0aGUgYFRBdHRyaWJ1dGVzYCBhcnJheS5cbiAgICpcbiAgICogVGhlIHB1cnBvc2Ugb2YgdGhpcyBmdW5jdGlvbiBpcyB0byBwcm9wZXJseSBjb25zdHJ1Y3QgYW4gYXR0cmlidXRlcyBhcnJheSB0aGF0XG4gICAqIGlzIHBhc3NlZCBpbnRvIHRoZSBgZWxlbWVudFN0YXJ0YCAob3IganVzdCBgZWxlbWVudGApIGZ1bmN0aW9ucy4gQmVjYXVzZSB0aGVyZVxuICAgKiBhcmUgbWFueSBkaWZmZXJlbnQgdHlwZXMgb2YgYXR0cmlidXRlcywgdGhlIGFycmF5IG5lZWRzIHRvIGJlIGNvbnN0cnVjdGVkIGluIGFcbiAgICogc3BlY2lhbCB3YXkgc28gdGhhdCBgZWxlbWVudFN0YXJ0YCBjYW4gcHJvcGVybHkgZXZhbHVhdGUgdGhlbS5cbiAgICpcbiAgICogVGhlIGZvcm1hdCBsb29rcyBsaWtlIHRoaXM6XG4gICAqXG4gICAqIGBgYFxuICAgKiBhdHRycyA9IFtwcm9wLCB2YWx1ZSwgcHJvcDIsIHZhbHVlMixcbiAgICogICBDTEFTU0VTLCBjbGFzczEsIGNsYXNzMixcbiAgICogICBTVFlMRVMsIHN0eWxlMSwgdmFsdWUxLCBzdHlsZTIsIHZhbHVlMixcbiAgICogICBTRUxFQ1RfT05MWSwgbmFtZTEsIG5hbWUyLCBuYW1lMiwgLi4uXVxuICAgKiBgYGBcbiAgICovXG4gIHByaXZhdGUgcHJlcGFyZVN5bnRoZXRpY0FuZFNlbGVjdE9ubHlBdHRycyhcbiAgICAgIGlucHV0czogdC5Cb3VuZEF0dHJpYnV0ZVtdLCBvdXRwdXRzOiB0LkJvdW5kRXZlbnRbXSxcbiAgICAgIHN0eWxlcz86IFN0eWxpbmdCdWlsZGVyKTogby5FeHByZXNzaW9uW10ge1xuICAgIGNvbnN0IGF0dHJFeHByczogby5FeHByZXNzaW9uW10gPSBbXTtcbiAgICBjb25zdCBub25TeW50aGV0aWNJbnB1dHM6IHQuQm91bmRBdHRyaWJ1dGVbXSA9IFtdO1xuICAgIGNvbnN0IGFscmVhZHlTZWVuID0gbmV3IFNldDxzdHJpbmc+KCk7XG5cbiAgICBmdW5jdGlvbiBpc0FTVFdpdGhTb3VyY2UoYXN0OiBBU1QpOiBhc3QgaXMgQVNUV2l0aFNvdXJjZSB7XG4gICAgICByZXR1cm4gYXN0IGluc3RhbmNlb2YgQVNUV2l0aFNvdXJjZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpc0xpdGVyYWxQcmltaXRpdmUoYXN0OiBBU1QpOiBhc3QgaXMgTGl0ZXJhbFByaW1pdGl2ZSB7XG4gICAgICByZXR1cm4gYXN0IGluc3RhbmNlb2YgTGl0ZXJhbFByaW1pdGl2ZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhZGRBdHRyRXhwcihrZXk6IHN0cmluZyB8IG51bWJlciwgdmFsdWU/OiBvLkV4cHJlc3Npb24pOiB2b2lkIHtcbiAgICAgIGlmICh0eXBlb2Yga2V5ID09PSAnc3RyaW5nJykge1xuICAgICAgICBpZiAoIWFscmVhZHlTZWVuLmhhcyhrZXkpKSB7XG4gICAgICAgICAgYXR0ckV4cHJzLnB1c2goby5saXRlcmFsKGtleSkpO1xuICAgICAgICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBhdHRyRXhwcnMucHVzaCh2YWx1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGFscmVhZHlTZWVuLmFkZChrZXkpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhdHRyRXhwcnMucHVzaChvLmxpdGVyYWwoa2V5KSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGlucHV0cy5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IEVNUFRZX1NUUklOR19FWFBSID0gYXNMaXRlcmFsKCcnKTtcbiAgICAgIGlucHV0cy5mb3JFYWNoKGlucHV0ID0+IHtcbiAgICAgICAgaWYgKGlucHV0LnR5cGUgPT09IEJpbmRpbmdUeXBlLkFuaW1hdGlvbikge1xuICAgICAgICAgIC8vIEBhdHRyaWJ1dGVzIGFyZSBmb3IgUmVuZGVyZXIyIGFuaW1hdGlvbiBAdHJpZ2dlcnMsIGJ1dCB0aGlzIGZlYXR1cmVcbiAgICAgICAgICAvLyBtYXkgYmUgc3VwcG9ydGVkIGRpZmZlcmVudGx5IGluIGZ1dHVyZSB2ZXJzaW9ucyBvZiBhbmd1bGFyLiBIb3dldmVyLFxuICAgICAgICAgIC8vIEB0cmlnZ2VycyBzaG91bGQgYWx3YXlzIGp1c3QgYmUgdHJlYXRlZCBhcyByZWd1bGFyIGF0dHJpYnV0ZXMgKGl0J3MgdXBcbiAgICAgICAgICAvLyB0byB0aGUgcmVuZGVyZXIgdG8gZGV0ZWN0IGFuZCB1c2UgdGhlbSBpbiBhIHNwZWNpYWwgd2F5KS5cbiAgICAgICAgICBjb25zdCB2YWx1ZUV4cCA9IGlucHV0LnZhbHVlO1xuICAgICAgICAgIGlmIChpc0FTVFdpdGhTb3VyY2UodmFsdWVFeHApKSB7XG4gICAgICAgICAgICBjb25zdCBsaXRlcmFsID0gdmFsdWVFeHAuYXN0O1xuICAgICAgICAgICAgaWYgKGlzTGl0ZXJhbFByaW1pdGl2ZShsaXRlcmFsKSAmJiBsaXRlcmFsLnZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgYWRkQXR0ckV4cHIocHJlcGFyZVN5bnRoZXRpY1Byb3BlcnR5TmFtZShpbnB1dC5uYW1lKSwgRU1QVFlfU1RSSU5HX0VYUFIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBub25TeW50aGV0aWNJbnB1dHMucHVzaChpbnB1dCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIGl0J3MgaW1wb3J0YW50IHRoYXQgdGhpcyBvY2N1cnMgYmVmb3JlIFNlbGVjdE9ubHkgYmVjYXVzZSBvbmNlIGBlbGVtZW50U3RhcnRgXG4gICAgLy8gY29tZXMgYWNyb3NzIHRoZSBTZWxlY3RPbmx5IG1hcmtlciB0aGVuIGl0IHdpbGwgY29udGludWUgcmVhZGluZyBlYWNoIHZhbHVlIGFzXG4gICAgLy8gYXMgc2luZ2xlIHByb3BlcnR5IHZhbHVlIGNlbGwgYnkgY2VsbC5cbiAgICBpZiAoc3R5bGVzKSB7XG4gICAgICBzdHlsZXMucG9wdWxhdGVJbml0aWFsU3R5bGluZ0F0dHJzKGF0dHJFeHBycyk7XG4gICAgfVxuXG4gICAgaWYgKG5vblN5bnRoZXRpY0lucHV0cy5sZW5ndGggfHwgb3V0cHV0cy5sZW5ndGgpIHtcbiAgICAgIGFkZEF0dHJFeHByKGNvcmUuQXR0cmlidXRlTWFya2VyLlNlbGVjdE9ubHkpO1xuICAgICAgbm9uU3ludGhldGljSW5wdXRzLmZvckVhY2goKGk6IHQuQm91bmRBdHRyaWJ1dGUpID0+IGFkZEF0dHJFeHByKGkubmFtZSkpO1xuICAgICAgb3V0cHV0cy5mb3JFYWNoKChvOiB0LkJvdW5kRXZlbnQpID0+IHtcbiAgICAgICAgY29uc3QgbmFtZSA9XG4gICAgICAgICAgICBvLnR5cGUgPT09IFBhcnNlZEV2ZW50VHlwZS5BbmltYXRpb24gPyBnZXRTeW50aGV0aWNQcm9wZXJ0eU5hbWUoby5uYW1lKSA6IG8ubmFtZTtcbiAgICAgICAgYWRkQXR0ckV4cHIobmFtZSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gYXR0ckV4cHJzO1xuICB9XG5cbiAgcHJpdmF0ZSB0b0F0dHJzUGFyYW0oYXR0cnNFeHByczogby5FeHByZXNzaW9uW10pOiBvLkV4cHJlc3Npb24ge1xuICAgIHJldHVybiBhdHRyc0V4cHJzLmxlbmd0aCA+IDAgP1xuICAgICAgICB0aGlzLmNvbnN0YW50UG9vbC5nZXRDb25zdExpdGVyYWwoby5saXRlcmFsQXJyKGF0dHJzRXhwcnMpLCB0cnVlKSA6XG4gICAgICAgIG8uVFlQRURfTlVMTF9FWFBSO1xuICB9XG5cbiAgcHJpdmF0ZSBwcmVwYXJlUmVmc1BhcmFtZXRlcihyZWZlcmVuY2VzOiB0LlJlZmVyZW5jZVtdKTogby5FeHByZXNzaW9uIHtcbiAgICBpZiAoIXJlZmVyZW5jZXMgfHwgcmVmZXJlbmNlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBvLlRZUEVEX05VTExfRVhQUjtcbiAgICB9XG5cbiAgICBjb25zdCByZWZzUGFyYW0gPSBmbGF0dGVuKHJlZmVyZW5jZXMubWFwKHJlZmVyZW5jZSA9PiB7XG4gICAgICBjb25zdCBzbG90ID0gdGhpcy5hbGxvY2F0ZURhdGFTbG90KCk7XG4gICAgICAvLyBHZW5lcmF0ZSB0aGUgdXBkYXRlIHRlbXBvcmFyeS5cbiAgICAgIGNvbnN0IHZhcmlhYmxlTmFtZSA9IHRoaXMuX2JpbmRpbmdTY29wZS5mcmVzaFJlZmVyZW5jZU5hbWUoKTtcbiAgICAgIGNvbnN0IHJldHJpZXZhbExldmVsID0gdGhpcy5sZXZlbDtcbiAgICAgIGNvbnN0IGxocyA9IG8udmFyaWFibGUodmFyaWFibGVOYW1lKTtcbiAgICAgIHRoaXMuX2JpbmRpbmdTY29wZS5zZXQoXG4gICAgICAgICAgcmV0cmlldmFsTGV2ZWwsIHJlZmVyZW5jZS5uYW1lLCBsaHMsXG4gICAgICAgICAgRGVjbGFyYXRpb25Qcmlvcml0eS5ERUZBVUxULCAoc2NvcGU6IEJpbmRpbmdTY29wZSwgcmVsYXRpdmVMZXZlbDogbnVtYmVyKSA9PiB7XG4gICAgICAgICAgICAvLyBlLmcuIG5leHRDb250ZXh0KDIpO1xuICAgICAgICAgICAgY29uc3QgbmV4dENvbnRleHRTdG10ID1cbiAgICAgICAgICAgICAgICByZWxhdGl2ZUxldmVsID4gMCA/IFtnZW5lcmF0ZU5leHRDb250ZXh0RXhwcihyZWxhdGl2ZUxldmVsKS50b1N0bXQoKV0gOiBbXTtcblxuICAgICAgICAgICAgLy8gZS5nLiBjb25zdCAkZm9vJCA9IHJlZmVyZW5jZSgxKTtcbiAgICAgICAgICAgIGNvbnN0IHJlZkV4cHIgPSBsaHMuc2V0KG8uaW1wb3J0RXhwcihSMy5yZWZlcmVuY2UpLmNhbGxGbihbby5saXRlcmFsKHNsb3QpXSkpO1xuICAgICAgICAgICAgcmV0dXJuIG5leHRDb250ZXh0U3RtdC5jb25jYXQocmVmRXhwci50b0NvbnN0RGVjbCgpKTtcbiAgICAgICAgICB9LCB0cnVlKTtcbiAgICAgIHJldHVybiBbcmVmZXJlbmNlLm5hbWUsIHJlZmVyZW5jZS52YWx1ZV07XG4gICAgfSkpO1xuXG4gICAgcmV0dXJuIHRoaXMuY29uc3RhbnRQb29sLmdldENvbnN0TGl0ZXJhbChhc0xpdGVyYWwocmVmc1BhcmFtKSwgdHJ1ZSk7XG4gIH1cblxuICBwcml2YXRlIHByZXBhcmVMaXN0ZW5lclBhcmFtZXRlcih0YWdOYW1lOiBzdHJpbmcsIG91dHB1dEFzdDogdC5Cb3VuZEV2ZW50LCBpbmRleDogbnVtYmVyKTpcbiAgICAgICgpID0+IG8uRXhwcmVzc2lvbltdIHtcbiAgICBsZXQgZXZlbnROYW1lOiBzdHJpbmcgPSBvdXRwdXRBc3QubmFtZTtcblxuICAgIGxldCBiaW5kaW5nRm5OYW1lO1xuICAgIGlmIChvdXRwdXRBc3QudHlwZSA9PT0gUGFyc2VkRXZlbnRUeXBlLkFuaW1hdGlvbikge1xuICAgICAgLy8gc3ludGhldGljIEBsaXN0ZW5lci5mb28gdmFsdWVzIGFyZSB0cmVhdGVkIHRoZSBleGFjdCBzYW1lIGFzIGFyZSBzdGFuZGFyZCBsaXN0ZW5lcnNcbiAgICAgIGJpbmRpbmdGbk5hbWUgPSBwcmVwYXJlU3ludGhldGljTGlzdGVuZXJGdW5jdGlvbk5hbWUoZXZlbnROYW1lLCBvdXRwdXRBc3QucGhhc2UgISk7XG4gICAgICBldmVudE5hbWUgPSBwcmVwYXJlU3ludGhldGljTGlzdGVuZXJOYW1lKGV2ZW50TmFtZSwgb3V0cHV0QXN0LnBoYXNlICEpO1xuICAgIH0gZWxzZSB7XG4gICAgICBiaW5kaW5nRm5OYW1lID0gc2FuaXRpemVJZGVudGlmaWVyKGV2ZW50TmFtZSk7XG4gICAgfVxuXG4gICAgY29uc3QgdGFnTmFtZVNhbml0aXplZCA9IHNhbml0aXplSWRlbnRpZmllcih0YWdOYW1lKTtcbiAgICBjb25zdCBmdW5jdGlvbk5hbWUgPVxuICAgICAgICBgJHt0aGlzLnRlbXBsYXRlTmFtZX1fJHt0YWdOYW1lU2FuaXRpemVkfV8ke2JpbmRpbmdGbk5hbWV9XyR7aW5kZXh9X2xpc3RlbmVyYDtcbiAgICByZXR1cm4gKCkgPT4ge1xuXG4gICAgICBjb25zdCBsaXN0ZW5lclNjb3BlID0gdGhpcy5fYmluZGluZ1Njb3BlLm5lc3RlZFNjb3BlKHRoaXMuX2JpbmRpbmdTY29wZS5iaW5kaW5nTGV2ZWwpO1xuXG4gICAgICBjb25zdCBiaW5kaW5nRXhwciA9IGNvbnZlcnRBY3Rpb25CaW5kaW5nKFxuICAgICAgICAgIGxpc3RlbmVyU2NvcGUsIG8udmFyaWFibGUoQ09OVEVYVF9OQU1FKSwgb3V0cHV0QXN0LmhhbmRsZXIsICdiJyxcbiAgICAgICAgICAoKSA9PiBlcnJvcignVW5leHBlY3RlZCBpbnRlcnBvbGF0aW9uJykpO1xuXG4gICAgICBjb25zdCBzdGF0ZW1lbnRzID0gW1xuICAgICAgICAuLi5saXN0ZW5lclNjb3BlLnJlc3RvcmVWaWV3U3RhdGVtZW50KCksIC4uLmxpc3RlbmVyU2NvcGUudmFyaWFibGVEZWNsYXJhdGlvbnMoKSxcbiAgICAgICAgLi4uYmluZGluZ0V4cHIucmVuZGVyM1N0bXRzXG4gICAgICBdO1xuXG4gICAgICBjb25zdCBoYW5kbGVyID0gby5mbihcbiAgICAgICAgICBbbmV3IG8uRm5QYXJhbSgnJGV2ZW50Jywgby5EWU5BTUlDX1RZUEUpXSwgc3RhdGVtZW50cywgby5JTkZFUlJFRF9UWVBFLCBudWxsLFxuICAgICAgICAgIGZ1bmN0aW9uTmFtZSk7XG4gICAgICByZXR1cm4gW28ubGl0ZXJhbChldmVudE5hbWUpLCBoYW5kbGVyXTtcbiAgICB9O1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBWYWx1ZUNvbnZlcnRlciBleHRlbmRzIEFzdE1lbW9yeUVmZmljaWVudFRyYW5zZm9ybWVyIHtcbiAgcHJpdmF0ZSBfcGlwZUJpbmRFeHByczogRnVuY3Rpb25DYWxsW10gPSBbXTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgY29uc3RhbnRQb29sOiBDb25zdGFudFBvb2wsIHByaXZhdGUgYWxsb2NhdGVTbG90OiAoKSA9PiBudW1iZXIsXG4gICAgICBwcml2YXRlIGFsbG9jYXRlUHVyZUZ1bmN0aW9uU2xvdHM6IChudW1TbG90czogbnVtYmVyKSA9PiBudW1iZXIsXG4gICAgICBwcml2YXRlIGRlZmluZVBpcGU6XG4gICAgICAgICAgKG5hbWU6IHN0cmluZywgbG9jYWxOYW1lOiBzdHJpbmcsIHNsb3Q6IG51bWJlciwgdmFsdWU6IG8uRXhwcmVzc2lvbikgPT4gdm9pZCkge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICAvLyBBc3RNZW1vcnlFZmZpY2llbnRUcmFuc2Zvcm1lclxuICB2aXNpdFBpcGUocGlwZTogQmluZGluZ1BpcGUsIGNvbnRleHQ6IGFueSk6IEFTVCB7XG4gICAgLy8gQWxsb2NhdGUgYSBzbG90IHRvIGNyZWF0ZSB0aGUgcGlwZVxuICAgIGNvbnN0IHNsb3QgPSB0aGlzLmFsbG9jYXRlU2xvdCgpO1xuICAgIGNvbnN0IHNsb3RQc2V1ZG9Mb2NhbCA9IGBQSVBFOiR7c2xvdH1gO1xuICAgIC8vIEFsbG9jYXRlIG9uZSBzbG90IGZvciB0aGUgcmVzdWx0IHBsdXMgb25lIHNsb3QgcGVyIHBpcGUgYXJndW1lbnRcbiAgICBjb25zdCBwdXJlRnVuY3Rpb25TbG90ID0gdGhpcy5hbGxvY2F0ZVB1cmVGdW5jdGlvblNsb3RzKDIgKyBwaXBlLmFyZ3MubGVuZ3RoKTtcbiAgICBjb25zdCB0YXJnZXQgPSBuZXcgUHJvcGVydHlSZWFkKHBpcGUuc3BhbiwgbmV3IEltcGxpY2l0UmVjZWl2ZXIocGlwZS5zcGFuKSwgc2xvdFBzZXVkb0xvY2FsKTtcbiAgICBjb25zdCB7aWRlbnRpZmllciwgaXNWYXJMZW5ndGh9ID0gcGlwZUJpbmRpbmdDYWxsSW5mbyhwaXBlLmFyZ3MpO1xuICAgIHRoaXMuZGVmaW5lUGlwZShwaXBlLm5hbWUsIHNsb3RQc2V1ZG9Mb2NhbCwgc2xvdCwgby5pbXBvcnRFeHByKGlkZW50aWZpZXIpKTtcbiAgICBjb25zdCBhcmdzOiBBU1RbXSA9IFtwaXBlLmV4cCwgLi4ucGlwZS5hcmdzXTtcbiAgICBjb25zdCBjb252ZXJ0ZWRBcmdzOiBBU1RbXSA9XG4gICAgICAgIGlzVmFyTGVuZ3RoID8gdGhpcy52aXNpdEFsbChbbmV3IExpdGVyYWxBcnJheShwaXBlLnNwYW4sIGFyZ3MpXSkgOiB0aGlzLnZpc2l0QWxsKGFyZ3MpO1xuXG4gICAgY29uc3QgcGlwZUJpbmRFeHByID0gbmV3IEZ1bmN0aW9uQ2FsbChwaXBlLnNwYW4sIHRhcmdldCwgW1xuICAgICAgbmV3IExpdGVyYWxQcmltaXRpdmUocGlwZS5zcGFuLCBzbG90KSxcbiAgICAgIG5ldyBMaXRlcmFsUHJpbWl0aXZlKHBpcGUuc3BhbiwgcHVyZUZ1bmN0aW9uU2xvdCksXG4gICAgICAuLi5jb252ZXJ0ZWRBcmdzLFxuICAgIF0pO1xuICAgIHRoaXMuX3BpcGVCaW5kRXhwcnMucHVzaChwaXBlQmluZEV4cHIpO1xuICAgIHJldHVybiBwaXBlQmluZEV4cHI7XG4gIH1cblxuICB1cGRhdGVQaXBlU2xvdE9mZnNldHMoYmluZGluZ1Nsb3RzOiBudW1iZXIpIHtcbiAgICB0aGlzLl9waXBlQmluZEV4cHJzLmZvckVhY2goKHBpcGU6IEZ1bmN0aW9uQ2FsbCkgPT4ge1xuICAgICAgLy8gdXBkYXRlIHRoZSBzbG90IG9mZnNldCBhcmcgKGluZGV4IDEpIHRvIGFjY291bnQgZm9yIGJpbmRpbmcgc2xvdHNcbiAgICAgIGNvbnN0IHNsb3RPZmZzZXQgPSBwaXBlLmFyZ3NbMV0gYXMgTGl0ZXJhbFByaW1pdGl2ZTtcbiAgICAgIChzbG90T2Zmc2V0LnZhbHVlIGFzIG51bWJlcikgKz0gYmluZGluZ1Nsb3RzO1xuICAgIH0pO1xuICB9XG5cbiAgdmlzaXRMaXRlcmFsQXJyYXkoYXJyYXk6IExpdGVyYWxBcnJheSwgY29udGV4dDogYW55KTogQVNUIHtcbiAgICByZXR1cm4gbmV3IEJ1aWx0aW5GdW5jdGlvbkNhbGwoYXJyYXkuc3BhbiwgdGhpcy52aXNpdEFsbChhcnJheS5leHByZXNzaW9ucyksIHZhbHVlcyA9PiB7XG4gICAgICAvLyBJZiB0aGUgbGl0ZXJhbCBoYXMgY2FsY3VsYXRlZCAobm9uLWxpdGVyYWwpIGVsZW1lbnRzIHRyYW5zZm9ybSBpdCBpbnRvXG4gICAgICAvLyBjYWxscyB0byBsaXRlcmFsIGZhY3RvcmllcyB0aGF0IGNvbXBvc2UgdGhlIGxpdGVyYWwgYW5kIHdpbGwgY2FjaGUgaW50ZXJtZWRpYXRlXG4gICAgICAvLyB2YWx1ZXMuIE90aGVyd2lzZSwganVzdCByZXR1cm4gYW4gbGl0ZXJhbCBhcnJheSB0aGF0IGNvbnRhaW5zIHRoZSB2YWx1ZXMuXG4gICAgICBjb25zdCBsaXRlcmFsID0gby5saXRlcmFsQXJyKHZhbHVlcyk7XG4gICAgICByZXR1cm4gdmFsdWVzLmV2ZXJ5KGEgPT4gYS5pc0NvbnN0YW50KCkpID9cbiAgICAgICAgICB0aGlzLmNvbnN0YW50UG9vbC5nZXRDb25zdExpdGVyYWwobGl0ZXJhbCwgdHJ1ZSkgOlxuICAgICAgICAgIGdldExpdGVyYWxGYWN0b3J5KHRoaXMuY29uc3RhbnRQb29sLCBsaXRlcmFsLCB0aGlzLmFsbG9jYXRlUHVyZUZ1bmN0aW9uU2xvdHMpO1xuICAgIH0pO1xuICB9XG5cbiAgdmlzaXRMaXRlcmFsTWFwKG1hcDogTGl0ZXJhbE1hcCwgY29udGV4dDogYW55KTogQVNUIHtcbiAgICByZXR1cm4gbmV3IEJ1aWx0aW5GdW5jdGlvbkNhbGwobWFwLnNwYW4sIHRoaXMudmlzaXRBbGwobWFwLnZhbHVlcyksIHZhbHVlcyA9PiB7XG4gICAgICAvLyBJZiB0aGUgbGl0ZXJhbCBoYXMgY2FsY3VsYXRlZCAobm9uLWxpdGVyYWwpIGVsZW1lbnRzICB0cmFuc2Zvcm0gaXQgaW50b1xuICAgICAgLy8gY2FsbHMgdG8gbGl0ZXJhbCBmYWN0b3JpZXMgdGhhdCBjb21wb3NlIHRoZSBsaXRlcmFsIGFuZCB3aWxsIGNhY2hlIGludGVybWVkaWF0ZVxuICAgICAgLy8gdmFsdWVzLiBPdGhlcndpc2UsIGp1c3QgcmV0dXJuIGFuIGxpdGVyYWwgYXJyYXkgdGhhdCBjb250YWlucyB0aGUgdmFsdWVzLlxuICAgICAgY29uc3QgbGl0ZXJhbCA9IG8ubGl0ZXJhbE1hcCh2YWx1ZXMubWFwKFxuICAgICAgICAgICh2YWx1ZSwgaW5kZXgpID0+ICh7a2V5OiBtYXAua2V5c1tpbmRleF0ua2V5LCB2YWx1ZSwgcXVvdGVkOiBtYXAua2V5c1tpbmRleF0ucXVvdGVkfSkpKTtcbiAgICAgIHJldHVybiB2YWx1ZXMuZXZlcnkoYSA9PiBhLmlzQ29uc3RhbnQoKSkgP1xuICAgICAgICAgIHRoaXMuY29uc3RhbnRQb29sLmdldENvbnN0TGl0ZXJhbChsaXRlcmFsLCB0cnVlKSA6XG4gICAgICAgICAgZ2V0TGl0ZXJhbEZhY3RvcnkodGhpcy5jb25zdGFudFBvb2wsIGxpdGVyYWwsIHRoaXMuYWxsb2NhdGVQdXJlRnVuY3Rpb25TbG90cyk7XG4gICAgfSk7XG4gIH1cbn1cblxuLy8gUGlwZXMgYWx3YXlzIGhhdmUgYXQgbGVhc3Qgb25lIHBhcmFtZXRlciwgdGhlIHZhbHVlIHRoZXkgb3BlcmF0ZSBvblxuY29uc3QgcGlwZUJpbmRpbmdJZGVudGlmaWVycyA9IFtSMy5waXBlQmluZDEsIFIzLnBpcGVCaW5kMiwgUjMucGlwZUJpbmQzLCBSMy5waXBlQmluZDRdO1xuXG5mdW5jdGlvbiBwaXBlQmluZGluZ0NhbGxJbmZvKGFyZ3M6IG8uRXhwcmVzc2lvbltdKSB7XG4gIGNvbnN0IGlkZW50aWZpZXIgPSBwaXBlQmluZGluZ0lkZW50aWZpZXJzW2FyZ3MubGVuZ3RoXTtcbiAgcmV0dXJuIHtcbiAgICBpZGVudGlmaWVyOiBpZGVudGlmaWVyIHx8IFIzLnBpcGVCaW5kVixcbiAgICBpc1Zhckxlbmd0aDogIWlkZW50aWZpZXIsXG4gIH07XG59XG5cbmNvbnN0IHB1cmVGdW5jdGlvbklkZW50aWZpZXJzID0gW1xuICBSMy5wdXJlRnVuY3Rpb24wLCBSMy5wdXJlRnVuY3Rpb24xLCBSMy5wdXJlRnVuY3Rpb24yLCBSMy5wdXJlRnVuY3Rpb24zLCBSMy5wdXJlRnVuY3Rpb240LFxuICBSMy5wdXJlRnVuY3Rpb241LCBSMy5wdXJlRnVuY3Rpb242LCBSMy5wdXJlRnVuY3Rpb243LCBSMy5wdXJlRnVuY3Rpb244XG5dO1xuXG5mdW5jdGlvbiBwdXJlRnVuY3Rpb25DYWxsSW5mbyhhcmdzOiBvLkV4cHJlc3Npb25bXSkge1xuICBjb25zdCBpZGVudGlmaWVyID0gcHVyZUZ1bmN0aW9uSWRlbnRpZmllcnNbYXJncy5sZW5ndGhdO1xuICByZXR1cm4ge1xuICAgIGlkZW50aWZpZXI6IGlkZW50aWZpZXIgfHwgUjMucHVyZUZ1bmN0aW9uVixcbiAgICBpc1Zhckxlbmd0aDogIWlkZW50aWZpZXIsXG4gIH07XG59XG5cbmZ1bmN0aW9uIGluc3RydWN0aW9uKFxuICAgIHNwYW46IFBhcnNlU291cmNlU3BhbiB8IG51bGwsIHJlZmVyZW5jZTogby5FeHRlcm5hbFJlZmVyZW5jZSxcbiAgICBwYXJhbXM6IG8uRXhwcmVzc2lvbltdKTogby5FeHByZXNzaW9uIHtcbiAgcmV0dXJuIG8uaW1wb3J0RXhwcihyZWZlcmVuY2UsIG51bGwsIHNwYW4pLmNhbGxGbihwYXJhbXMsIHNwYW4pO1xufVxuXG4vLyBlLmcuIHgoMik7XG5mdW5jdGlvbiBnZW5lcmF0ZU5leHRDb250ZXh0RXhwcihyZWxhdGl2ZUxldmVsRGlmZjogbnVtYmVyKTogby5FeHByZXNzaW9uIHtcbiAgcmV0dXJuIG8uaW1wb3J0RXhwcihSMy5uZXh0Q29udGV4dClcbiAgICAgIC5jYWxsRm4ocmVsYXRpdmVMZXZlbERpZmYgPiAxID8gW28ubGl0ZXJhbChyZWxhdGl2ZUxldmVsRGlmZildIDogW10pO1xufVxuXG5mdW5jdGlvbiBnZXRMaXRlcmFsRmFjdG9yeShcbiAgICBjb25zdGFudFBvb2w6IENvbnN0YW50UG9vbCwgbGl0ZXJhbDogby5MaXRlcmFsQXJyYXlFeHByIHwgby5MaXRlcmFsTWFwRXhwcixcbiAgICBhbGxvY2F0ZVNsb3RzOiAobnVtU2xvdHM6IG51bWJlcikgPT4gbnVtYmVyKTogby5FeHByZXNzaW9uIHtcbiAgY29uc3Qge2xpdGVyYWxGYWN0b3J5LCBsaXRlcmFsRmFjdG9yeUFyZ3VtZW50c30gPSBjb25zdGFudFBvb2wuZ2V0TGl0ZXJhbEZhY3RvcnkobGl0ZXJhbCk7XG4gIC8vIEFsbG9jYXRlIDEgc2xvdCBmb3IgdGhlIHJlc3VsdCBwbHVzIDEgcGVyIGFyZ3VtZW50XG4gIGNvbnN0IHN0YXJ0U2xvdCA9IGFsbG9jYXRlU2xvdHMoMSArIGxpdGVyYWxGYWN0b3J5QXJndW1lbnRzLmxlbmd0aCk7XG4gIGxpdGVyYWxGYWN0b3J5QXJndW1lbnRzLmxlbmd0aCA+IDAgfHwgZXJyb3IoYEV4cGVjdGVkIGFyZ3VtZW50cyB0byBhIGxpdGVyYWwgZmFjdG9yeSBmdW5jdGlvbmApO1xuICBjb25zdCB7aWRlbnRpZmllciwgaXNWYXJMZW5ndGh9ID0gcHVyZUZ1bmN0aW9uQ2FsbEluZm8obGl0ZXJhbEZhY3RvcnlBcmd1bWVudHMpO1xuXG4gIC8vIExpdGVyYWwgZmFjdG9yaWVzIGFyZSBwdXJlIGZ1bmN0aW9ucyB0aGF0IG9ubHkgbmVlZCB0byBiZSByZS1pbnZva2VkIHdoZW4gdGhlIHBhcmFtZXRlcnNcbiAgLy8gY2hhbmdlLlxuICBjb25zdCBhcmdzID0gW1xuICAgIG8ubGl0ZXJhbChzdGFydFNsb3QpLFxuICAgIGxpdGVyYWxGYWN0b3J5LFxuICBdO1xuXG4gIGlmIChpc1Zhckxlbmd0aCkge1xuICAgIGFyZ3MucHVzaChvLmxpdGVyYWxBcnIobGl0ZXJhbEZhY3RvcnlBcmd1bWVudHMpKTtcbiAgfSBlbHNlIHtcbiAgICBhcmdzLnB1c2goLi4ubGl0ZXJhbEZhY3RvcnlBcmd1bWVudHMpO1xuICB9XG5cbiAgcmV0dXJuIG8uaW1wb3J0RXhwcihpZGVudGlmaWVyKS5jYWxsRm4oYXJncyk7XG59XG5cbi8qKlxuICogRnVuY3Rpb24gd2hpY2ggaXMgZXhlY3V0ZWQgd2hlbmV2ZXIgYSB2YXJpYWJsZSBpcyByZWZlcmVuY2VkIGZvciB0aGUgZmlyc3QgdGltZSBpbiBhIGdpdmVuXG4gKiBzY29wZS5cbiAqXG4gKiBJdCBpcyBleHBlY3RlZCB0aGF0IHRoZSBmdW5jdGlvbiBjcmVhdGVzIHRoZSBgY29uc3QgbG9jYWxOYW1lID0gZXhwcmVzc2lvbmA7IHN0YXRlbWVudC5cbiAqL1xuZXhwb3J0IHR5cGUgRGVjbGFyZUxvY2FsVmFyQ2FsbGJhY2sgPSAoc2NvcGU6IEJpbmRpbmdTY29wZSwgcmVsYXRpdmVMZXZlbDogbnVtYmVyKSA9PiBvLlN0YXRlbWVudFtdO1xuXG4vKiogVGhlIHByZWZpeCB1c2VkIHRvIGdldCBhIHNoYXJlZCBjb250ZXh0IGluIEJpbmRpbmdTY29wZSdzIG1hcC4gKi9cbmNvbnN0IFNIQVJFRF9DT05URVhUX0tFWSA9ICckJHNoYXJlZF9jdHgkJCc7XG5cbi8qKlxuICogVGhpcyBpcyB1c2VkIHdoZW4gb25lIHJlZmVycyB0byB2YXJpYWJsZSBzdWNoIGFzOiAnbGV0IGFiYyA9IG5leHRDb250ZXh0KDIpLiRpbXBsaWNpdGAuXG4gKiAtIGtleSB0byB0aGUgbWFwIGlzIHRoZSBzdHJpbmcgbGl0ZXJhbCBgXCJhYmNcImAuXG4gKiAtIHZhbHVlIGByZXRyaWV2YWxMZXZlbGAgaXMgdGhlIGxldmVsIGZyb20gd2hpY2ggdGhpcyB2YWx1ZSBjYW4gYmUgcmV0cmlldmVkLCB3aGljaCBpcyAyIGxldmVsc1xuICogdXAgaW4gZXhhbXBsZS5cbiAqIC0gdmFsdWUgYGxoc2AgaXMgdGhlIGxlZnQgaGFuZCBzaWRlIHdoaWNoIGlzIGFuIEFTVCByZXByZXNlbnRpbmcgYGFiY2AuXG4gKiAtIHZhbHVlIGBkZWNsYXJlTG9jYWxDYWxsYmFja2AgaXMgYSBjYWxsYmFjayB0aGF0IGlzIGludm9rZWQgd2hlbiBkZWNsYXJpbmcgdGhlIGxvY2FsLlxuICogLSB2YWx1ZSBgZGVjbGFyZWAgaXMgdHJ1ZSBpZiB0aGlzIHZhbHVlIG5lZWRzIHRvIGJlIGRlY2xhcmVkLlxuICogLSB2YWx1ZSBgbG9jYWxSZWZgIGlzIHRydWUgaWYgd2UgYXJlIHN0b3JpbmcgYSBsb2NhbCByZWZlcmVuY2VcbiAqIC0gdmFsdWUgYHByaW9yaXR5YCBkaWN0YXRlcyB0aGUgc29ydGluZyBwcmlvcml0eSBvZiB0aGlzIHZhciBkZWNsYXJhdGlvbiBjb21wYXJlZFxuICogdG8gb3RoZXIgdmFyIGRlY2xhcmF0aW9ucyBvbiB0aGUgc2FtZSByZXRyaWV2YWwgbGV2ZWwuIEZvciBleGFtcGxlLCBpZiB0aGVyZSBpcyBhXG4gKiBjb250ZXh0IHZhcmlhYmxlIGFuZCBhIGxvY2FsIHJlZiBhY2Nlc3NpbmcgdGhlIHNhbWUgcGFyZW50IHZpZXcsIHRoZSBjb250ZXh0IHZhclxuICogZGVjbGFyYXRpb24gc2hvdWxkIGFsd2F5cyBjb21lIGJlZm9yZSB0aGUgbG9jYWwgcmVmIGRlY2xhcmF0aW9uLlxuICovXG50eXBlIEJpbmRpbmdEYXRhID0ge1xuICByZXRyaWV2YWxMZXZlbDogbnVtYmVyOyBsaHM6IG8uUmVhZFZhckV4cHI7IGRlY2xhcmVMb2NhbENhbGxiYWNrPzogRGVjbGFyZUxvY2FsVmFyQ2FsbGJhY2s7XG4gIGRlY2xhcmU6IGJvb2xlYW47XG4gIHByaW9yaXR5OiBudW1iZXI7XG4gIGxvY2FsUmVmOiBib29sZWFuO1xufTtcblxuLyoqXG4gKiBUaGUgc29ydGluZyBwcmlvcml0eSBvZiBhIGxvY2FsIHZhcmlhYmxlIGRlY2xhcmF0aW9uLiBIaWdoZXIgbnVtYmVyc1xuICogbWVhbiB0aGUgZGVjbGFyYXRpb24gd2lsbCBhcHBlYXIgZmlyc3QgaW4gdGhlIGdlbmVyYXRlZCBjb2RlLlxuICovXG5jb25zdCBlbnVtIERlY2xhcmF0aW9uUHJpb3JpdHkgeyBERUZBVUxUID0gMCwgQ09OVEVYVCA9IDEsIFNIQVJFRF9DT05URVhUID0gMiB9XG5cbmV4cG9ydCBjbGFzcyBCaW5kaW5nU2NvcGUgaW1wbGVtZW50cyBMb2NhbFJlc29sdmVyIHtcbiAgLyoqIEtlZXBzIGEgbWFwIGZyb20gbG9jYWwgdmFyaWFibGVzIHRvIHRoZWlyIEJpbmRpbmdEYXRhLiAqL1xuICBwcml2YXRlIG1hcCA9IG5ldyBNYXA8c3RyaW5nLCBCaW5kaW5nRGF0YT4oKTtcbiAgcHJpdmF0ZSByZWZlcmVuY2VOYW1lSW5kZXggPSAwO1xuICBwcml2YXRlIHJlc3RvcmVWaWV3VmFyaWFibGU6IG8uUmVhZFZhckV4cHJ8bnVsbCA9IG51bGw7XG4gIHByaXZhdGUgc3RhdGljIF9ST09UX1NDT1BFOiBCaW5kaW5nU2NvcGU7XG5cbiAgc3RhdGljIGdldCBST09UX1NDT1BFKCk6IEJpbmRpbmdTY29wZSB7XG4gICAgaWYgKCFCaW5kaW5nU2NvcGUuX1JPT1RfU0NPUEUpIHtcbiAgICAgIEJpbmRpbmdTY29wZS5fUk9PVF9TQ09QRSA9IG5ldyBCaW5kaW5nU2NvcGUoKS5zZXQoMCwgJyRldmVudCcsIG8udmFyaWFibGUoJyRldmVudCcpKTtcbiAgICB9XG4gICAgcmV0dXJuIEJpbmRpbmdTY29wZS5fUk9PVF9TQ09QRTtcbiAgfVxuXG4gIHByaXZhdGUgY29uc3RydWN0b3IocHVibGljIGJpbmRpbmdMZXZlbDogbnVtYmVyID0gMCwgcHJpdmF0ZSBwYXJlbnQ6IEJpbmRpbmdTY29wZXxudWxsID0gbnVsbCkge31cblxuICBnZXQobmFtZTogc3RyaW5nKTogby5FeHByZXNzaW9ufG51bGwge1xuICAgIGxldCBjdXJyZW50OiBCaW5kaW5nU2NvcGV8bnVsbCA9IHRoaXM7XG4gICAgd2hpbGUgKGN1cnJlbnQpIHtcbiAgICAgIGxldCB2YWx1ZSA9IGN1cnJlbnQubWFwLmdldChuYW1lKTtcbiAgICAgIGlmICh2YWx1ZSAhPSBudWxsKSB7XG4gICAgICAgIGlmIChjdXJyZW50ICE9PSB0aGlzKSB7XG4gICAgICAgICAgLy8gbWFrZSBhIGxvY2FsIGNvcHkgYW5kIHJlc2V0IHRoZSBgZGVjbGFyZWAgc3RhdGVcbiAgICAgICAgICB2YWx1ZSA9IHtcbiAgICAgICAgICAgIHJldHJpZXZhbExldmVsOiB2YWx1ZS5yZXRyaWV2YWxMZXZlbCxcbiAgICAgICAgICAgIGxoczogdmFsdWUubGhzLFxuICAgICAgICAgICAgZGVjbGFyZUxvY2FsQ2FsbGJhY2s6IHZhbHVlLmRlY2xhcmVMb2NhbENhbGxiYWNrLFxuICAgICAgICAgICAgZGVjbGFyZTogZmFsc2UsXG4gICAgICAgICAgICBwcmlvcml0eTogdmFsdWUucHJpb3JpdHksXG4gICAgICAgICAgICBsb2NhbFJlZjogdmFsdWUubG9jYWxSZWZcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgLy8gQ2FjaGUgdGhlIHZhbHVlIGxvY2FsbHkuXG4gICAgICAgICAgdGhpcy5tYXAuc2V0KG5hbWUsIHZhbHVlKTtcbiAgICAgICAgICAvLyBQb3NzaWJseSBnZW5lcmF0ZSBhIHNoYXJlZCBjb250ZXh0IHZhclxuICAgICAgICAgIHRoaXMubWF5YmVHZW5lcmF0ZVNoYXJlZENvbnRleHRWYXIodmFsdWUpO1xuICAgICAgICAgIHRoaXMubWF5YmVSZXN0b3JlVmlldyh2YWx1ZS5yZXRyaWV2YWxMZXZlbCwgdmFsdWUubG9jYWxSZWYpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHZhbHVlLmRlY2xhcmVMb2NhbENhbGxiYWNrICYmICF2YWx1ZS5kZWNsYXJlKSB7XG4gICAgICAgICAgdmFsdWUuZGVjbGFyZSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZhbHVlLmxocztcbiAgICAgIH1cbiAgICAgIGN1cnJlbnQgPSBjdXJyZW50LnBhcmVudDtcbiAgICB9XG5cbiAgICAvLyBJZiB3ZSBnZXQgdG8gdGhpcyBwb2ludCwgd2UgYXJlIGxvb2tpbmcgZm9yIGEgcHJvcGVydHkgb24gdGhlIHRvcCBsZXZlbCBjb21wb25lbnRcbiAgICAvLyAtIElmIGxldmVsID09PSAwLCB3ZSBhcmUgb24gdGhlIHRvcCBhbmQgZG9uJ3QgbmVlZCB0byByZS1kZWNsYXJlIGBjdHhgLlxuICAgIC8vIC0gSWYgbGV2ZWwgPiAwLCB3ZSBhcmUgaW4gYW4gZW1iZWRkZWQgdmlldy4gV2UgbmVlZCB0byByZXRyaWV2ZSB0aGUgbmFtZSBvZiB0aGVcbiAgICAvLyBsb2NhbCB2YXIgd2UgdXNlZCB0byBzdG9yZSB0aGUgY29tcG9uZW50IGNvbnRleHQsIGUuZy4gY29uc3QgJGNvbXAkID0geCgpO1xuICAgIHJldHVybiB0aGlzLmJpbmRpbmdMZXZlbCA9PT0gMCA/IG51bGwgOiB0aGlzLmdldENvbXBvbmVudFByb3BlcnR5KG5hbWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIGxvY2FsIHZhcmlhYmxlIGZvciBsYXRlciByZWZlcmVuY2UuXG4gICAqXG4gICAqIEBwYXJhbSByZXRyaWV2YWxMZXZlbCBUaGUgbGV2ZWwgZnJvbSB3aGljaCB0aGlzIHZhbHVlIGNhbiBiZSByZXRyaWV2ZWRcbiAgICogQHBhcmFtIG5hbWUgTmFtZSBvZiB0aGUgdmFyaWFibGUuXG4gICAqIEBwYXJhbSBsaHMgQVNUIHJlcHJlc2VudGluZyB0aGUgbGVmdCBoYW5kIHNpZGUgb2YgdGhlIGBsZXQgbGhzID0gcmhzO2AuXG4gICAqIEBwYXJhbSBwcmlvcml0eSBUaGUgc29ydGluZyBwcmlvcml0eSBvZiB0aGlzIHZhclxuICAgKiBAcGFyYW0gZGVjbGFyZUxvY2FsQ2FsbGJhY2sgVGhlIGNhbGxiYWNrIHRvIGludm9rZSB3aGVuIGRlY2xhcmluZyB0aGlzIGxvY2FsIHZhclxuICAgKiBAcGFyYW0gbG9jYWxSZWYgV2hldGhlciBvciBub3QgdGhpcyBpcyBhIGxvY2FsIHJlZlxuICAgKi9cbiAgc2V0KHJldHJpZXZhbExldmVsOiBudW1iZXIsIG5hbWU6IHN0cmluZywgbGhzOiBvLlJlYWRWYXJFeHByLFxuICAgICAgcHJpb3JpdHk6IG51bWJlciA9IERlY2xhcmF0aW9uUHJpb3JpdHkuREVGQVVMVCxcbiAgICAgIGRlY2xhcmVMb2NhbENhbGxiYWNrPzogRGVjbGFyZUxvY2FsVmFyQ2FsbGJhY2ssIGxvY2FsUmVmPzogdHJ1ZSk6IEJpbmRpbmdTY29wZSB7XG4gICAgIXRoaXMubWFwLmhhcyhuYW1lKSB8fFxuICAgICAgICBlcnJvcihgVGhlIG5hbWUgJHtuYW1lfSBpcyBhbHJlYWR5IGRlZmluZWQgaW4gc2NvcGUgdG8gYmUgJHt0aGlzLm1hcC5nZXQobmFtZSl9YCk7XG4gICAgdGhpcy5tYXAuc2V0KG5hbWUsIHtcbiAgICAgIHJldHJpZXZhbExldmVsOiByZXRyaWV2YWxMZXZlbCxcbiAgICAgIGxoczogbGhzLFxuICAgICAgZGVjbGFyZTogZmFsc2UsXG4gICAgICBkZWNsYXJlTG9jYWxDYWxsYmFjazogZGVjbGFyZUxvY2FsQ2FsbGJhY2ssXG4gICAgICBwcmlvcml0eTogcHJpb3JpdHksXG4gICAgICBsb2NhbFJlZjogbG9jYWxSZWYgfHwgZmFsc2VcbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGdldExvY2FsKG5hbWU6IHN0cmluZyk6IChvLkV4cHJlc3Npb258bnVsbCkgeyByZXR1cm4gdGhpcy5nZXQobmFtZSk7IH1cblxuICBuZXN0ZWRTY29wZShsZXZlbDogbnVtYmVyKTogQmluZGluZ1Njb3BlIHtcbiAgICBjb25zdCBuZXdTY29wZSA9IG5ldyBCaW5kaW5nU2NvcGUobGV2ZWwsIHRoaXMpO1xuICAgIGlmIChsZXZlbCA+IDApIG5ld1Njb3BlLmdlbmVyYXRlU2hhcmVkQ29udGV4dFZhcigwKTtcbiAgICByZXR1cm4gbmV3U2NvcGU7XG4gIH1cblxuICBnZXRTaGFyZWRDb250ZXh0TmFtZShyZXRyaWV2YWxMZXZlbDogbnVtYmVyKTogby5SZWFkVmFyRXhwcnxudWxsIHtcbiAgICBjb25zdCBzaGFyZWRDdHhPYmogPSB0aGlzLm1hcC5nZXQoU0hBUkVEX0NPTlRFWFRfS0VZICsgcmV0cmlldmFsTGV2ZWwpO1xuICAgIHJldHVybiBzaGFyZWRDdHhPYmogJiYgc2hhcmVkQ3R4T2JqLmRlY2xhcmUgPyBzaGFyZWRDdHhPYmoubGhzIDogbnVsbDtcbiAgfVxuXG4gIG1heWJlR2VuZXJhdGVTaGFyZWRDb250ZXh0VmFyKHZhbHVlOiBCaW5kaW5nRGF0YSkge1xuICAgIGlmICh2YWx1ZS5wcmlvcml0eSA9PT0gRGVjbGFyYXRpb25Qcmlvcml0eS5DT05URVhUKSB7XG4gICAgICBjb25zdCBzaGFyZWRDdHhPYmogPSB0aGlzLm1hcC5nZXQoU0hBUkVEX0NPTlRFWFRfS0VZICsgdmFsdWUucmV0cmlldmFsTGV2ZWwpO1xuICAgICAgaWYgKHNoYXJlZEN0eE9iaikge1xuICAgICAgICBzaGFyZWRDdHhPYmouZGVjbGFyZSA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmdlbmVyYXRlU2hhcmVkQ29udGV4dFZhcih2YWx1ZS5yZXRyaWV2YWxMZXZlbCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZ2VuZXJhdGVTaGFyZWRDb250ZXh0VmFyKHJldHJpZXZhbExldmVsOiBudW1iZXIpIHtcbiAgICBjb25zdCBsaHMgPSBvLnZhcmlhYmxlKENPTlRFWFRfTkFNRSArIHRoaXMuZnJlc2hSZWZlcmVuY2VOYW1lKCkpO1xuICAgIHRoaXMubWFwLnNldChTSEFSRURfQ09OVEVYVF9LRVkgKyByZXRyaWV2YWxMZXZlbCwge1xuICAgICAgcmV0cmlldmFsTGV2ZWw6IHJldHJpZXZhbExldmVsLFxuICAgICAgbGhzOiBsaHMsXG4gICAgICBkZWNsYXJlTG9jYWxDYWxsYmFjazogKHNjb3BlOiBCaW5kaW5nU2NvcGUsIHJlbGF0aXZlTGV2ZWw6IG51bWJlcikgPT4ge1xuICAgICAgICAvLyBjb25zdCBjdHhfcjAgPSBuZXh0Q29udGV4dCgyKTtcbiAgICAgICAgcmV0dXJuIFtsaHMuc2V0KGdlbmVyYXRlTmV4dENvbnRleHRFeHByKHJlbGF0aXZlTGV2ZWwpKS50b0NvbnN0RGVjbCgpXTtcbiAgICAgIH0sXG4gICAgICBkZWNsYXJlOiBmYWxzZSxcbiAgICAgIHByaW9yaXR5OiBEZWNsYXJhdGlvblByaW9yaXR5LlNIQVJFRF9DT05URVhULFxuICAgICAgbG9jYWxSZWY6IGZhbHNlXG4gICAgfSk7XG4gIH1cblxuICBnZXRDb21wb25lbnRQcm9wZXJ0eShuYW1lOiBzdHJpbmcpOiBvLkV4cHJlc3Npb24ge1xuICAgIGNvbnN0IGNvbXBvbmVudFZhbHVlID0gdGhpcy5tYXAuZ2V0KFNIQVJFRF9DT05URVhUX0tFWSArIDApICE7XG4gICAgY29tcG9uZW50VmFsdWUuZGVjbGFyZSA9IHRydWU7XG4gICAgdGhpcy5tYXliZVJlc3RvcmVWaWV3KDAsIGZhbHNlKTtcbiAgICByZXR1cm4gY29tcG9uZW50VmFsdWUubGhzLnByb3AobmFtZSk7XG4gIH1cblxuICBtYXliZVJlc3RvcmVWaWV3KHJldHJpZXZhbExldmVsOiBudW1iZXIsIGxvY2FsUmVmTG9va3VwOiBib29sZWFuKSB7XG4gICAgLy8gV2Ugd2FudCB0byByZXN0b3JlIHRoZSBjdXJyZW50IHZpZXcgaW4gbGlzdGVuZXIgZm5zIGlmOlxuICAgIC8vIDEgLSB3ZSBhcmUgYWNjZXNzaW5nIGEgdmFsdWUgaW4gYSBwYXJlbnQgdmlldywgd2hpY2ggcmVxdWlyZXMgd2Fsa2luZyB0aGUgdmlldyB0cmVlIHJhdGhlclxuICAgIC8vIHRoYW4gdXNpbmcgdGhlIGN0eCBhcmcuIEluIHRoaXMgY2FzZSwgdGhlIHJldHJpZXZhbCBhbmQgYmluZGluZyBsZXZlbCB3aWxsIGJlIGRpZmZlcmVudC5cbiAgICAvLyAyIC0gd2UgYXJlIGxvb2tpbmcgdXAgYSBsb2NhbCByZWYsIHdoaWNoIHJlcXVpcmVzIHJlc3RvcmluZyB0aGUgdmlldyB3aGVyZSB0aGUgbG9jYWxcbiAgICAvLyByZWYgaXMgc3RvcmVkXG4gICAgaWYgKHRoaXMuaXNMaXN0ZW5lclNjb3BlKCkgJiYgKHJldHJpZXZhbExldmVsIDwgdGhpcy5iaW5kaW5nTGV2ZWwgfHwgbG9jYWxSZWZMb29rdXApKSB7XG4gICAgICBpZiAoIXRoaXMucGFyZW50ICEucmVzdG9yZVZpZXdWYXJpYWJsZSkge1xuICAgICAgICAvLyBwYXJlbnQgc2F2ZXMgdmFyaWFibGUgdG8gZ2VuZXJhdGUgYSBzaGFyZWQgYGNvbnN0ICRzJCA9IGdldEN1cnJlbnRWaWV3KCk7YCBpbnN0cnVjdGlvblxuICAgICAgICB0aGlzLnBhcmVudCAhLnJlc3RvcmVWaWV3VmFyaWFibGUgPSBvLnZhcmlhYmxlKHRoaXMucGFyZW50ICEuZnJlc2hSZWZlcmVuY2VOYW1lKCkpO1xuICAgICAgfVxuICAgICAgdGhpcy5yZXN0b3JlVmlld1ZhcmlhYmxlID0gdGhpcy5wYXJlbnQgIS5yZXN0b3JlVmlld1ZhcmlhYmxlO1xuICAgIH1cbiAgfVxuXG4gIHJlc3RvcmVWaWV3U3RhdGVtZW50KCk6IG8uU3RhdGVtZW50W10ge1xuICAgIC8vIHJlc3RvcmVWaWV3KCRzdGF0ZSQpO1xuICAgIHJldHVybiB0aGlzLnJlc3RvcmVWaWV3VmFyaWFibGUgP1xuICAgICAgICBbaW5zdHJ1Y3Rpb24obnVsbCwgUjMucmVzdG9yZVZpZXcsIFt0aGlzLnJlc3RvcmVWaWV3VmFyaWFibGVdKS50b1N0bXQoKV0gOlxuICAgICAgICBbXTtcbiAgfVxuXG4gIHZpZXdTbmFwc2hvdFN0YXRlbWVudHMoKTogby5TdGF0ZW1lbnRbXSB7XG4gICAgLy8gY29uc3QgJHN0YXRlJCA9IGdldEN1cnJlbnRWaWV3KCk7XG4gICAgY29uc3QgZ2V0Q3VycmVudFZpZXdJbnN0cnVjdGlvbiA9IGluc3RydWN0aW9uKG51bGwsIFIzLmdldEN1cnJlbnRWaWV3LCBbXSk7XG4gICAgcmV0dXJuIHRoaXMucmVzdG9yZVZpZXdWYXJpYWJsZSA/XG4gICAgICAgIFt0aGlzLnJlc3RvcmVWaWV3VmFyaWFibGUuc2V0KGdldEN1cnJlbnRWaWV3SW5zdHJ1Y3Rpb24pLnRvQ29uc3REZWNsKCldIDpcbiAgICAgICAgW107XG4gIH1cblxuICBpc0xpc3RlbmVyU2NvcGUoKSB7IHJldHVybiB0aGlzLnBhcmVudCAmJiB0aGlzLnBhcmVudC5iaW5kaW5nTGV2ZWwgPT09IHRoaXMuYmluZGluZ0xldmVsOyB9XG5cbiAgdmFyaWFibGVEZWNsYXJhdGlvbnMoKTogby5TdGF0ZW1lbnRbXSB7XG4gICAgbGV0IGN1cnJlbnRDb250ZXh0TGV2ZWwgPSAwO1xuICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMubWFwLnZhbHVlcygpKVxuICAgICAgICAuZmlsdGVyKHZhbHVlID0+IHZhbHVlLmRlY2xhcmUpXG4gICAgICAgIC5zb3J0KChhLCBiKSA9PiBiLnJldHJpZXZhbExldmVsIC0gYS5yZXRyaWV2YWxMZXZlbCB8fCBiLnByaW9yaXR5IC0gYS5wcmlvcml0eSlcbiAgICAgICAgLnJlZHVjZSgoc3RtdHM6IG8uU3RhdGVtZW50W10sIHZhbHVlOiBCaW5kaW5nRGF0YSkgPT4ge1xuICAgICAgICAgIGNvbnN0IGxldmVsRGlmZiA9IHRoaXMuYmluZGluZ0xldmVsIC0gdmFsdWUucmV0cmlldmFsTGV2ZWw7XG4gICAgICAgICAgY29uc3QgY3VyclN0bXRzID0gdmFsdWUuZGVjbGFyZUxvY2FsQ2FsbGJhY2sgISh0aGlzLCBsZXZlbERpZmYgLSBjdXJyZW50Q29udGV4dExldmVsKTtcbiAgICAgICAgICBjdXJyZW50Q29udGV4dExldmVsID0gbGV2ZWxEaWZmO1xuICAgICAgICAgIHJldHVybiBzdG10cy5jb25jYXQoY3VyclN0bXRzKTtcbiAgICAgICAgfSwgW10pIGFzIG8uU3RhdGVtZW50W107XG4gIH1cblxuXG4gIGZyZXNoUmVmZXJlbmNlTmFtZSgpOiBzdHJpbmcge1xuICAgIGxldCBjdXJyZW50OiBCaW5kaW5nU2NvcGUgPSB0aGlzO1xuICAgIC8vIEZpbmQgdGhlIHRvcCBzY29wZSBhcyBpdCBtYWludGFpbnMgdGhlIGdsb2JhbCByZWZlcmVuY2UgY291bnRcbiAgICB3aGlsZSAoY3VycmVudC5wYXJlbnQpIGN1cnJlbnQgPSBjdXJyZW50LnBhcmVudDtcbiAgICBjb25zdCByZWYgPSBgJHtSRUZFUkVOQ0VfUFJFRklYfSR7Y3VycmVudC5yZWZlcmVuY2VOYW1lSW5kZXgrK31gO1xuICAgIHJldHVybiByZWY7XG4gIH1cbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgYENzc1NlbGVjdG9yYCBnaXZlbiBhIHRhZyBuYW1lIGFuZCBhIG1hcCBvZiBhdHRyaWJ1dGVzXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUNzc1NlbGVjdG9yKHRhZzogc3RyaW5nLCBhdHRyaWJ1dGVzOiB7W25hbWU6IHN0cmluZ106IHN0cmluZ30pOiBDc3NTZWxlY3RvciB7XG4gIGNvbnN0IGNzc1NlbGVjdG9yID0gbmV3IENzc1NlbGVjdG9yKCk7XG5cbiAgY3NzU2VsZWN0b3Iuc2V0RWxlbWVudCh0YWcpO1xuXG4gIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGF0dHJpYnV0ZXMpLmZvckVhY2goKG5hbWUpID0+IHtcbiAgICBjb25zdCB2YWx1ZSA9IGF0dHJpYnV0ZXNbbmFtZV07XG5cbiAgICBjc3NTZWxlY3Rvci5hZGRBdHRyaWJ1dGUobmFtZSwgdmFsdWUpO1xuICAgIGlmIChuYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdjbGFzcycpIHtcbiAgICAgIGNvbnN0IGNsYXNzZXMgPSB2YWx1ZS50cmltKCkuc3BsaXQoL1xccysvKTtcbiAgICAgIGNsYXNzZXMuZm9yRWFjaChjbGFzc05hbWUgPT4gY3NzU2VsZWN0b3IuYWRkQ2xhc3NOYW1lKGNsYXNzTmFtZSkpO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIGNzc1NlbGVjdG9yO1xufVxuXG5mdW5jdGlvbiBpbnRlcnBvbGF0ZShhcmdzOiBvLkV4cHJlc3Npb25bXSk6IG8uRXhwcmVzc2lvbiB7XG4gIGFyZ3MgPSBhcmdzLnNsaWNlKDEpOyAgLy8gSWdub3JlIHRoZSBsZW5ndGggcHJlZml4IGFkZGVkIGZvciByZW5kZXIyXG4gIHN3aXRjaCAoYXJncy5sZW5ndGgpIHtcbiAgICBjYXNlIDM6XG4gICAgICByZXR1cm4gby5pbXBvcnRFeHByKFIzLmludGVycG9sYXRpb24xKS5jYWxsRm4oYXJncyk7XG4gICAgY2FzZSA1OlxuICAgICAgcmV0dXJuIG8uaW1wb3J0RXhwcihSMy5pbnRlcnBvbGF0aW9uMikuY2FsbEZuKGFyZ3MpO1xuICAgIGNhc2UgNzpcbiAgICAgIHJldHVybiBvLmltcG9ydEV4cHIoUjMuaW50ZXJwb2xhdGlvbjMpLmNhbGxGbihhcmdzKTtcbiAgICBjYXNlIDk6XG4gICAgICByZXR1cm4gby5pbXBvcnRFeHByKFIzLmludGVycG9sYXRpb240KS5jYWxsRm4oYXJncyk7XG4gICAgY2FzZSAxMTpcbiAgICAgIHJldHVybiBvLmltcG9ydEV4cHIoUjMuaW50ZXJwb2xhdGlvbjUpLmNhbGxGbihhcmdzKTtcbiAgICBjYXNlIDEzOlxuICAgICAgcmV0dXJuIG8uaW1wb3J0RXhwcihSMy5pbnRlcnBvbGF0aW9uNikuY2FsbEZuKGFyZ3MpO1xuICAgIGNhc2UgMTU6XG4gICAgICByZXR1cm4gby5pbXBvcnRFeHByKFIzLmludGVycG9sYXRpb243KS5jYWxsRm4oYXJncyk7XG4gICAgY2FzZSAxNzpcbiAgICAgIHJldHVybiBvLmltcG9ydEV4cHIoUjMuaW50ZXJwb2xhdGlvbjgpLmNhbGxGbihhcmdzKTtcbiAgfVxuICAoYXJncy5sZW5ndGggPj0gMTkgJiYgYXJncy5sZW5ndGggJSAyID09IDEpIHx8XG4gICAgICBlcnJvcihgSW52YWxpZCBpbnRlcnBvbGF0aW9uIGFyZ3VtZW50IGxlbmd0aCAke2FyZ3MubGVuZ3RofWApO1xuICByZXR1cm4gby5pbXBvcnRFeHByKFIzLmludGVycG9sYXRpb25WKS5jYWxsRm4oW28ubGl0ZXJhbEFycihhcmdzKV0pO1xufVxuXG4vKipcbiAqIE9wdGlvbnMgdGhhdCBjYW4gYmUgdXNlZCB0byBtb2RpZnkgaG93IGEgdGVtcGxhdGUgaXMgcGFyc2VkIGJ5IGBwYXJzZVRlbXBsYXRlKClgLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFBhcnNlVGVtcGxhdGVPcHRpb25zIHtcbiAgLyoqXG4gICAqIEluY2x1ZGUgd2hpdGVzcGFjZSBub2RlcyBpbiB0aGUgcGFyc2VkIG91dHB1dC5cbiAgICovXG4gIHByZXNlcnZlV2hpdGVzcGFjZXM/OiBib29sZWFuO1xuICAvKipcbiAgICogSG93IHRvIHBhcnNlIGludGVycG9sYXRpb24gbWFya2Vycy5cbiAgICovXG4gIGludGVycG9sYXRpb25Db25maWc/OiBJbnRlcnBvbGF0aW9uQ29uZmlnO1xufVxuXG4vKipcbiAqIFBhcnNlIGEgdGVtcGxhdGUgaW50byByZW5kZXIzIGBOb2RlYHMgYW5kIGFkZGl0aW9uYWwgbWV0YWRhdGEsIHdpdGggbm8gb3RoZXIgZGVwZW5kZW5jaWVzLlxuICpcbiAqIEBwYXJhbSB0ZW1wbGF0ZSB0ZXh0IG9mIHRoZSB0ZW1wbGF0ZSB0byBwYXJzZVxuICogQHBhcmFtIHRlbXBsYXRlVXJsIFVSTCB0byB1c2UgZm9yIHNvdXJjZSBtYXBwaW5nIG9mIHRoZSBwYXJzZWQgdGVtcGxhdGVcbiAqIEBwYXJhbSBvcHRpb25zIG9wdGlvbnMgdG8gbW9kaWZ5IGhvdyB0aGUgdGVtcGxhdGUgaXMgcGFyc2VkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVRlbXBsYXRlKFxuICAgIHRlbXBsYXRlOiBzdHJpbmcsIHRlbXBsYXRlVXJsOiBzdHJpbmcsXG4gICAgb3B0aW9uczogUGFyc2VUZW1wbGF0ZU9wdGlvbnMgPSB7fSk6IHtlcnJvcnM/OiBQYXJzZUVycm9yW10sIG5vZGVzOiB0Lk5vZGVbXX0ge1xuICBjb25zdCB7aW50ZXJwb2xhdGlvbkNvbmZpZywgcHJlc2VydmVXaGl0ZXNwYWNlc30gPSBvcHRpb25zO1xuICBjb25zdCBiaW5kaW5nUGFyc2VyID0gbWFrZUJpbmRpbmdQYXJzZXIoaW50ZXJwb2xhdGlvbkNvbmZpZyk7XG4gIGNvbnN0IGh0bWxQYXJzZXIgPSBuZXcgSHRtbFBhcnNlcigpO1xuICBjb25zdCBwYXJzZVJlc3VsdCA9XG4gICAgICBodG1sUGFyc2VyLnBhcnNlKHRlbXBsYXRlLCB0ZW1wbGF0ZVVybCwgey4uLm9wdGlvbnMsIHRva2VuaXplRXhwYW5zaW9uRm9ybXM6IHRydWV9KTtcblxuICBpZiAocGFyc2VSZXN1bHQuZXJyb3JzICYmIHBhcnNlUmVzdWx0LmVycm9ycy5sZW5ndGggPiAwKSB7XG4gICAgcmV0dXJuIHtlcnJvcnM6IHBhcnNlUmVzdWx0LmVycm9ycywgbm9kZXM6IFtdfTtcbiAgfVxuXG4gIGxldCByb290Tm9kZXM6IGh0bWwuTm9kZVtdID0gcGFyc2VSZXN1bHQucm9vdE5vZGVzO1xuXG4gIC8vIHByb2Nlc3MgaTE4biBtZXRhIGluZm9ybWF0aW9uIChzY2FuIGF0dHJpYnV0ZXMsIGdlbmVyYXRlIGlkcylcbiAgLy8gYmVmb3JlIHdlIHJ1biB3aGl0ZXNwYWNlIHJlbW92YWwgcHJvY2VzcywgYmVjYXVzZSBleGlzdGluZyBpMThuXG4gIC8vIGV4dHJhY3Rpb24gcHJvY2VzcyAobmcgeGkxOG4pIHJlbGllcyBvbiBhIHJhdyBjb250ZW50IHRvIGdlbmVyYXRlXG4gIC8vIG1lc3NhZ2UgaWRzXG4gIHJvb3ROb2RlcyA9XG4gICAgICBodG1sLnZpc2l0QWxsKG5ldyBJMThuTWV0YVZpc2l0b3IoaW50ZXJwb2xhdGlvbkNvbmZpZywgIXByZXNlcnZlV2hpdGVzcGFjZXMpLCByb290Tm9kZXMpO1xuXG4gIGlmICghcHJlc2VydmVXaGl0ZXNwYWNlcykge1xuICAgIHJvb3ROb2RlcyA9IGh0bWwudmlzaXRBbGwobmV3IFdoaXRlc3BhY2VWaXNpdG9yKCksIHJvb3ROb2Rlcyk7XG5cbiAgICAvLyBydW4gaTE4biBtZXRhIHZpc2l0b3IgYWdhaW4gaW4gY2FzZSB3ZSByZW1vdmUgd2hpdGVzcGFjZXMsIGJlY2F1c2VcbiAgICAvLyB0aGF0IG1pZ2h0IGFmZmVjdCBnZW5lcmF0ZWQgaTE4biBtZXNzYWdlIGNvbnRlbnQuIER1cmluZyB0aGlzIHBhc3NcbiAgICAvLyBpMThuIElEcyBnZW5lcmF0ZWQgYXQgdGhlIGZpcnN0IHBhc3Mgd2lsbCBiZSBwcmVzZXJ2ZWQsIHNvIHdlIGNhbiBtaW1pY1xuICAgIC8vIGV4aXN0aW5nIGV4dHJhY3Rpb24gcHJvY2VzcyAobmcgeGkxOG4pXG4gICAgcm9vdE5vZGVzID0gaHRtbC52aXNpdEFsbChcbiAgICAgICAgbmV3IEkxOG5NZXRhVmlzaXRvcihpbnRlcnBvbGF0aW9uQ29uZmlnLCAvKiBrZWVwSTE4bkF0dHJzICovIGZhbHNlKSwgcm9vdE5vZGVzKTtcbiAgfVxuXG4gIGNvbnN0IHtub2RlcywgZXJyb3JzfSA9IGh0bWxBc3RUb1JlbmRlcjNBc3Qocm9vdE5vZGVzLCBiaW5kaW5nUGFyc2VyKTtcbiAgaWYgKGVycm9ycyAmJiBlcnJvcnMubGVuZ3RoID4gMCkge1xuICAgIHJldHVybiB7ZXJyb3JzLCBub2RlczogW119O1xuICB9XG5cbiAgcmV0dXJuIHtub2Rlc307XG59XG5cbi8qKlxuICogQ29uc3RydWN0IGEgYEJpbmRpbmdQYXJzZXJgIHdpdGggYSBkZWZhdWx0IGNvbmZpZ3VyYXRpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYWtlQmluZGluZ1BhcnNlcihcbiAgICBpbnRlcnBvbGF0aW9uQ29uZmlnOiBJbnRlcnBvbGF0aW9uQ29uZmlnID0gREVGQVVMVF9JTlRFUlBPTEFUSU9OX0NPTkZJRyk6IEJpbmRpbmdQYXJzZXIge1xuICByZXR1cm4gbmV3IEJpbmRpbmdQYXJzZXIoXG4gICAgICBuZXcgUGFyc2VyKG5ldyBMZXhlcigpKSwgaW50ZXJwb2xhdGlvbkNvbmZpZywgbmV3IERvbUVsZW1lbnRTY2hlbWFSZWdpc3RyeSgpLCBudWxsLCBbXSk7XG59XG5cbmZ1bmN0aW9uIHJlc29sdmVTYW5pdGl6YXRpb25GbihpbnB1dDogdC5Cb3VuZEF0dHJpYnV0ZSwgY29udGV4dDogY29yZS5TZWN1cml0eUNvbnRleHQpIHtcbiAgc3dpdGNoIChjb250ZXh0KSB7XG4gICAgY2FzZSBjb3JlLlNlY3VyaXR5Q29udGV4dC5IVE1MOlxuICAgICAgcmV0dXJuIG8uaW1wb3J0RXhwcihSMy5zYW5pdGl6ZUh0bWwpO1xuICAgIGNhc2UgY29yZS5TZWN1cml0eUNvbnRleHQuU0NSSVBUOlxuICAgICAgcmV0dXJuIG8uaW1wb3J0RXhwcihSMy5zYW5pdGl6ZVNjcmlwdCk7XG4gICAgY2FzZSBjb3JlLlNlY3VyaXR5Q29udGV4dC5TVFlMRTpcbiAgICAgIC8vIHRoZSBjb21waWxlciBkb2VzIG5vdCBmaWxsIGluIGFuIGluc3RydWN0aW9uIGZvciBbc3R5bGUucHJvcD9dIGJpbmRpbmdcbiAgICAgIC8vIHZhbHVlcyBiZWNhdXNlIHRoZSBzdHlsZSBhbGdvcml0aG0ga25vd3MgaW50ZXJuYWxseSB3aGF0IHByb3BzIGFyZSBzdWJqZWN0XG4gICAgICAvLyB0byBzYW5pdGl6YXRpb24gKG9ubHkgW2F0dHIuc3R5bGVdIHZhbHVlcyBhcmUgZXhwbGljaXRseSBzYW5pdGl6ZWQpXG4gICAgICByZXR1cm4gaW5wdXQudHlwZSA9PT0gQmluZGluZ1R5cGUuQXR0cmlidXRlID8gby5pbXBvcnRFeHByKFIzLnNhbml0aXplU3R5bGUpIDogbnVsbDtcbiAgICBjYXNlIGNvcmUuU2VjdXJpdHlDb250ZXh0LlVSTDpcbiAgICAgIHJldHVybiBvLmltcG9ydEV4cHIoUjMuc2FuaXRpemVVcmwpO1xuICAgIGNhc2UgY29yZS5TZWN1cml0eUNvbnRleHQuUkVTT1VSQ0VfVVJMOlxuICAgICAgcmV0dXJuIG8uaW1wb3J0RXhwcihSMy5zYW5pdGl6ZVJlc291cmNlVXJsKTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNTaW5nbGVFbGVtZW50VGVtcGxhdGUoY2hpbGRyZW46IHQuTm9kZVtdKTogY2hpbGRyZW4gaXNbdC5FbGVtZW50XSB7XG4gIHJldHVybiBjaGlsZHJlbi5sZW5ndGggPT09IDEgJiYgY2hpbGRyZW5bMF0gaW5zdGFuY2VvZiB0LkVsZW1lbnQ7XG59XG5cbmZ1bmN0aW9uIGlzVGV4dE5vZGUobm9kZTogdC5Ob2RlKTogYm9vbGVhbiB7XG4gIHJldHVybiBub2RlIGluc3RhbmNlb2YgdC5UZXh0IHx8IG5vZGUgaW5zdGFuY2VvZiB0LkJvdW5kVGV4dCB8fCBub2RlIGluc3RhbmNlb2YgdC5JY3U7XG59XG5cbmZ1bmN0aW9uIGhhc1RleHRDaGlsZHJlbk9ubHkoY2hpbGRyZW46IHQuTm9kZVtdKTogYm9vbGVhbiB7XG4gIHJldHVybiBjaGlsZHJlbi5ldmVyeShpc1RleHROb2RlKTtcbn1cbiJdfQ==