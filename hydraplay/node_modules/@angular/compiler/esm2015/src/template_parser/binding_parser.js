/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { SecurityContext } from '../core';
import { BoundElementProperty, EmptyExpr, ParsedEvent, ParsedProperty, ParsedPropertyType, ParsedVariable, RecursiveAstVisitor } from '../expression_parser/ast';
import { mergeNsAndName } from '../ml_parser/tags';
import { ParseError, ParseErrorLevel, ParseSourceSpan } from '../parse_util';
import { CssSelector } from '../selector';
import { splitAtColon, splitAtPeriod } from '../util';
const PROPERTY_PARTS_SEPARATOR = '.';
const ATTRIBUTE_PREFIX = 'attr';
const CLASS_PREFIX = 'class';
const STYLE_PREFIX = 'style';
const ANIMATE_PROP_PREFIX = 'animate-';
/**
 * Parses bindings in templates and in the directive host area.
 */
export class BindingParser {
    constructor(_exprParser, _interpolationConfig, _schemaRegistry, pipes, errors) {
        this._exprParser = _exprParser;
        this._interpolationConfig = _interpolationConfig;
        this._schemaRegistry = _schemaRegistry;
        this.errors = errors;
        this.pipesByName = null;
        this._usedPipes = new Map();
        // When the `pipes` parameter is `null`, do not check for used pipes
        // This is used in IVY when we might not know the available pipes at compile time
        if (pipes) {
            const pipesByName = new Map();
            pipes.forEach(pipe => pipesByName.set(pipe.name, pipe));
            this.pipesByName = pipesByName;
        }
    }
    get interpolationConfig() { return this._interpolationConfig; }
    getUsedPipes() { return Array.from(this._usedPipes.values()); }
    createBoundHostProperties(dirMeta, sourceSpan) {
        if (dirMeta.hostProperties) {
            const boundProps = [];
            Object.keys(dirMeta.hostProperties).forEach(propName => {
                const expression = dirMeta.hostProperties[propName];
                if (typeof expression === 'string') {
                    this.parsePropertyBinding(propName, expression, true, sourceSpan, [], boundProps);
                }
                else {
                    this._reportError(`Value of the host property binding "${propName}" needs to be a string representing an expression but got "${expression}" (${typeof expression})`, sourceSpan);
                }
            });
            return boundProps;
        }
        return null;
    }
    createDirectiveHostPropertyAsts(dirMeta, elementSelector, sourceSpan) {
        const boundProps = this.createBoundHostProperties(dirMeta, sourceSpan);
        return boundProps &&
            boundProps.map((prop) => this.createBoundElementProperty(elementSelector, prop));
    }
    createDirectiveHostEventAsts(dirMeta, sourceSpan) {
        if (dirMeta.hostListeners) {
            const targetEvents = [];
            Object.keys(dirMeta.hostListeners).forEach(propName => {
                const expression = dirMeta.hostListeners[propName];
                if (typeof expression === 'string') {
                    this.parseEvent(propName, expression, sourceSpan, [], targetEvents);
                }
                else {
                    this._reportError(`Value of the host listener "${propName}" needs to be a string representing an expression but got "${expression}" (${typeof expression})`, sourceSpan);
                }
            });
            return targetEvents;
        }
        return null;
    }
    parseInterpolation(value, sourceSpan) {
        const sourceInfo = sourceSpan.start.toString();
        try {
            const ast = this._exprParser.parseInterpolation(value, sourceInfo, this._interpolationConfig);
            if (ast)
                this._reportExpressionParserErrors(ast.errors, sourceSpan);
            this._checkPipes(ast, sourceSpan);
            return ast;
        }
        catch (e) {
            this._reportError(`${e}`, sourceSpan);
            return this._exprParser.wrapLiteralPrimitive('ERROR', sourceInfo);
        }
    }
    // Parse an inline template binding. ie `<tag *tplKey="<tplValue>">`
    parseInlineTemplateBinding(tplKey, tplValue, sourceSpan, targetMatchableAttrs, targetProps, targetVars) {
        const bindings = this._parseTemplateBindings(tplKey, tplValue, sourceSpan);
        for (let i = 0; i < bindings.length; i++) {
            const binding = bindings[i];
            if (binding.keyIsVar) {
                targetVars.push(new ParsedVariable(binding.key, binding.name, sourceSpan));
            }
            else if (binding.expression) {
                this._parsePropertyAst(binding.key, binding.expression, sourceSpan, targetMatchableAttrs, targetProps);
            }
            else {
                targetMatchableAttrs.push([binding.key, '']);
                this.parseLiteralAttr(binding.key, null, sourceSpan, targetMatchableAttrs, targetProps);
            }
        }
    }
    _parseTemplateBindings(tplKey, tplValue, sourceSpan) {
        const sourceInfo = sourceSpan.start.toString();
        try {
            const bindingsResult = this._exprParser.parseTemplateBindings(tplKey, tplValue, sourceInfo);
            this._reportExpressionParserErrors(bindingsResult.errors, sourceSpan);
            bindingsResult.templateBindings.forEach((binding) => {
                if (binding.expression) {
                    this._checkPipes(binding.expression, sourceSpan);
                }
            });
            bindingsResult.warnings.forEach((warning) => { this._reportError(warning, sourceSpan, ParseErrorLevel.WARNING); });
            return bindingsResult.templateBindings;
        }
        catch (e) {
            this._reportError(`${e}`, sourceSpan);
            return [];
        }
    }
    parseLiteralAttr(name, value, sourceSpan, targetMatchableAttrs, targetProps) {
        if (isAnimationLabel(name)) {
            name = name.substring(1);
            if (value) {
                this._reportError(`Assigning animation triggers via @prop="exp" attributes with an expression is invalid.` +
                    ` Use property bindings (e.g. [@prop]="exp") or use an attribute without a value (e.g. @prop) instead.`, sourceSpan, ParseErrorLevel.ERROR);
            }
            this._parseAnimation(name, value, sourceSpan, targetMatchableAttrs, targetProps);
        }
        else {
            targetProps.push(new ParsedProperty(name, this._exprParser.wrapLiteralPrimitive(value, ''), ParsedPropertyType.LITERAL_ATTR, sourceSpan));
        }
    }
    parsePropertyBinding(name, expression, isHost, sourceSpan, targetMatchableAttrs, targetProps) {
        let isAnimationProp = false;
        if (name.startsWith(ANIMATE_PROP_PREFIX)) {
            isAnimationProp = true;
            name = name.substring(ANIMATE_PROP_PREFIX.length);
        }
        else if (isAnimationLabel(name)) {
            isAnimationProp = true;
            name = name.substring(1);
        }
        if (isAnimationProp) {
            this._parseAnimation(name, expression, sourceSpan, targetMatchableAttrs, targetProps);
        }
        else {
            this._parsePropertyAst(name, this._parseBinding(expression, isHost, sourceSpan), sourceSpan, targetMatchableAttrs, targetProps);
        }
    }
    parsePropertyInterpolation(name, value, sourceSpan, targetMatchableAttrs, targetProps) {
        const expr = this.parseInterpolation(value, sourceSpan);
        if (expr) {
            this._parsePropertyAst(name, expr, sourceSpan, targetMatchableAttrs, targetProps);
            return true;
        }
        return false;
    }
    _parsePropertyAst(name, ast, sourceSpan, targetMatchableAttrs, targetProps) {
        targetMatchableAttrs.push([name, ast.source]);
        targetProps.push(new ParsedProperty(name, ast, ParsedPropertyType.DEFAULT, sourceSpan));
    }
    _parseAnimation(name, expression, sourceSpan, targetMatchableAttrs, targetProps) {
        // This will occur when a @trigger is not paired with an expression.
        // For animations it is valid to not have an expression since */void
        // states will be applied by angular when the element is attached/detached
        const ast = this._parseBinding(expression || 'undefined', false, sourceSpan);
        targetMatchableAttrs.push([name, ast.source]);
        targetProps.push(new ParsedProperty(name, ast, ParsedPropertyType.ANIMATION, sourceSpan));
    }
    _parseBinding(value, isHostBinding, sourceSpan) {
        const sourceInfo = (sourceSpan && sourceSpan.start || '(unknown)').toString();
        try {
            const ast = isHostBinding ?
                this._exprParser.parseSimpleBinding(value, sourceInfo, this._interpolationConfig) :
                this._exprParser.parseBinding(value, sourceInfo, this._interpolationConfig);
            if (ast)
                this._reportExpressionParserErrors(ast.errors, sourceSpan);
            this._checkPipes(ast, sourceSpan);
            return ast;
        }
        catch (e) {
            this._reportError(`${e}`, sourceSpan);
            return this._exprParser.wrapLiteralPrimitive('ERROR', sourceInfo);
        }
    }
    createBoundElementProperty(elementSelector, boundProp) {
        if (boundProp.isAnimation) {
            return new BoundElementProperty(boundProp.name, 4 /* Animation */, SecurityContext.NONE, boundProp.expression, null, boundProp.sourceSpan);
        }
        let unit = null;
        let bindingType = undefined;
        let boundPropertyName = null;
        const parts = boundProp.name.split(PROPERTY_PARTS_SEPARATOR);
        let securityContexts = undefined;
        // Check check for special cases (prefix style, attr, class)
        if (parts.length > 1) {
            if (parts[0] == ATTRIBUTE_PREFIX) {
                boundPropertyName = parts[1];
                this._validatePropertyOrAttributeName(boundPropertyName, boundProp.sourceSpan, true);
                securityContexts = calcPossibleSecurityContexts(this._schemaRegistry, elementSelector, boundPropertyName, true);
                const nsSeparatorIdx = boundPropertyName.indexOf(':');
                if (nsSeparatorIdx > -1) {
                    const ns = boundPropertyName.substring(0, nsSeparatorIdx);
                    const name = boundPropertyName.substring(nsSeparatorIdx + 1);
                    boundPropertyName = mergeNsAndName(ns, name);
                }
                bindingType = 1 /* Attribute */;
            }
            else if (parts[0] == CLASS_PREFIX) {
                boundPropertyName = parts[1];
                bindingType = 2 /* Class */;
                securityContexts = [SecurityContext.NONE];
            }
            else if (parts[0] == STYLE_PREFIX) {
                unit = parts.length > 2 ? parts[2] : null;
                boundPropertyName = parts[1];
                bindingType = 3 /* Style */;
                securityContexts = [SecurityContext.STYLE];
            }
        }
        // If not a special case, use the full property name
        if (boundPropertyName === null) {
            boundPropertyName = this._schemaRegistry.getMappedPropName(boundProp.name);
            securityContexts = calcPossibleSecurityContexts(this._schemaRegistry, elementSelector, boundPropertyName, false);
            bindingType = 0 /* Property */;
            this._validatePropertyOrAttributeName(boundPropertyName, boundProp.sourceSpan, false);
        }
        return new BoundElementProperty(boundPropertyName, bindingType, securityContexts[0], boundProp.expression, unit, boundProp.sourceSpan);
    }
    parseEvent(name, expression, sourceSpan, targetMatchableAttrs, targetEvents) {
        if (isAnimationLabel(name)) {
            name = name.substr(1);
            this._parseAnimationEvent(name, expression, sourceSpan, targetEvents);
        }
        else {
            this._parseRegularEvent(name, expression, sourceSpan, targetMatchableAttrs, targetEvents);
        }
    }
    _parseAnimationEvent(name, expression, sourceSpan, targetEvents) {
        const matches = splitAtPeriod(name, [name, '']);
        const eventName = matches[0];
        const phase = matches[1].toLowerCase();
        if (phase) {
            switch (phase) {
                case 'start':
                case 'done':
                    const ast = this._parseAction(expression, sourceSpan);
                    targetEvents.push(new ParsedEvent(eventName, phase, 1 /* Animation */, ast, sourceSpan));
                    break;
                default:
                    this._reportError(`The provided animation output phase value "${phase}" for "@${eventName}" is not supported (use start or done)`, sourceSpan);
                    break;
            }
        }
        else {
            this._reportError(`The animation trigger output event (@${eventName}) is missing its phase value name (start or done are currently supported)`, sourceSpan);
        }
    }
    _parseRegularEvent(name, expression, sourceSpan, targetMatchableAttrs, targetEvents) {
        // long format: 'target: eventName'
        const [target, eventName] = splitAtColon(name, [null, name]);
        const ast = this._parseAction(expression, sourceSpan);
        targetMatchableAttrs.push([name, ast.source]);
        targetEvents.push(new ParsedEvent(eventName, target, 0 /* Regular */, ast, sourceSpan));
        // Don't detect directives for event names for now,
        // so don't add the event name to the matchableAttrs
    }
    _parseAction(value, sourceSpan) {
        const sourceInfo = (sourceSpan && sourceSpan.start || '(unknown').toString();
        try {
            const ast = this._exprParser.parseAction(value, sourceInfo, this._interpolationConfig);
            if (ast) {
                this._reportExpressionParserErrors(ast.errors, sourceSpan);
            }
            if (!ast || ast.ast instanceof EmptyExpr) {
                this._reportError(`Empty expressions are not allowed`, sourceSpan);
                return this._exprParser.wrapLiteralPrimitive('ERROR', sourceInfo);
            }
            this._checkPipes(ast, sourceSpan);
            return ast;
        }
        catch (e) {
            this._reportError(`${e}`, sourceSpan);
            return this._exprParser.wrapLiteralPrimitive('ERROR', sourceInfo);
        }
    }
    _reportError(message, sourceSpan, level = ParseErrorLevel.ERROR) {
        this.errors.push(new ParseError(sourceSpan, message, level));
    }
    _reportExpressionParserErrors(errors, sourceSpan) {
        for (const error of errors) {
            this._reportError(error.message, sourceSpan);
        }
    }
    // Make sure all the used pipes are known in `this.pipesByName`
    _checkPipes(ast, sourceSpan) {
        if (ast && this.pipesByName) {
            const collector = new PipeCollector();
            ast.visit(collector);
            collector.pipes.forEach((ast, pipeName) => {
                const pipeMeta = this.pipesByName.get(pipeName);
                if (!pipeMeta) {
                    this._reportError(`The pipe '${pipeName}' could not be found`, new ParseSourceSpan(sourceSpan.start.moveBy(ast.span.start), sourceSpan.start.moveBy(ast.span.end)));
                }
                else {
                    this._usedPipes.set(pipeName, pipeMeta);
                }
            });
        }
    }
    /**
     * @param propName the name of the property / attribute
     * @param sourceSpan
     * @param isAttr true when binding to an attribute
     */
    _validatePropertyOrAttributeName(propName, sourceSpan, isAttr) {
        const report = isAttr ? this._schemaRegistry.validateAttribute(propName) :
            this._schemaRegistry.validateProperty(propName);
        if (report.error) {
            this._reportError(report.msg, sourceSpan, ParseErrorLevel.ERROR);
        }
    }
}
export class PipeCollector extends RecursiveAstVisitor {
    constructor() {
        super(...arguments);
        this.pipes = new Map();
    }
    visitPipe(ast, context) {
        this.pipes.set(ast.name, ast);
        ast.exp.visit(this);
        this.visitAll(ast.args, context);
        return null;
    }
}
function isAnimationLabel(name) {
    return name[0] == '@';
}
export function calcPossibleSecurityContexts(registry, selector, propName, isAttribute) {
    const ctxs = [];
    CssSelector.parse(selector).forEach((selector) => {
        const elementNames = selector.element ? [selector.element] : registry.allKnownElementNames();
        const notElementNames = new Set(selector.notSelectors.filter(selector => selector.isElementSelector())
            .map((selector) => selector.element));
        const possibleElementNames = elementNames.filter(elementName => !notElementNames.has(elementName));
        ctxs.push(...possibleElementNames.map(elementName => registry.securityContext(elementName, propName, isAttribute)));
    });
    return ctxs.length === 0 ? [SecurityContext.NONE] : Array.from(new Set(ctxs)).sort();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmluZGluZ19wYXJzZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvdGVtcGxhdGVfcGFyc2VyL2JpbmRpbmdfcGFyc2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUdILE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFDeEMsT0FBTyxFQUEwQyxvQkFBb0IsRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFtQixjQUFjLEVBQUUsa0JBQWtCLEVBQUUsY0FBYyxFQUFlLG1CQUFtQixFQUFrQixNQUFNLDBCQUEwQixDQUFDO0FBR3ZQLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNqRCxPQUFPLEVBQUMsVUFBVSxFQUFFLGVBQWUsRUFBRSxlQUFlLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFM0UsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUN4QyxPQUFPLEVBQUMsWUFBWSxFQUFFLGFBQWEsRUFBQyxNQUFNLFNBQVMsQ0FBQztBQUVwRCxNQUFNLHdCQUF3QixHQUFHLEdBQUcsQ0FBQztBQUNyQyxNQUFNLGdCQUFnQixHQUFHLE1BQU0sQ0FBQztBQUNoQyxNQUFNLFlBQVksR0FBRyxPQUFPLENBQUM7QUFDN0IsTUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDO0FBRTdCLE1BQU0sbUJBQW1CLEdBQUcsVUFBVSxDQUFDO0FBRXZDOztHQUVHO0FBQ0gsTUFBTSxPQUFPLGFBQWE7SUFLeEIsWUFDWSxXQUFtQixFQUFVLG9CQUF5QyxFQUN0RSxlQUFzQyxFQUFFLEtBQWdDLEVBQ3pFLE1BQW9CO1FBRm5CLGdCQUFXLEdBQVgsV0FBVyxDQUFRO1FBQVUseUJBQW9CLEdBQXBCLG9CQUFvQixDQUFxQjtRQUN0RSxvQkFBZSxHQUFmLGVBQWUsQ0FBdUI7UUFDdkMsV0FBTSxHQUFOLE1BQU0sQ0FB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Q0FBQyxRQUFRLEVBQUUsRUFBRTtRQUMvQyxNQUFNLFlBQVksR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLG9CQUFvQixFQUFFLENBQUM7UUFDN0YsTUFBTSxlQUFlLEdBQ2pCLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLGlCQUFpQixFQUFFLENBQUM7YUFDakUsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUN0RCxNQUFNLG9CQUFvQixHQUN0QixZQUFZLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7UUFFMUUsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLG9CQUFvQixDQUFDLEdBQUcsQ0FDakMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLFdBQVcsRUFBRSxRQUFRLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3BGLENBQUMsQ0FBQyxDQUFDO0lBQ0gsT0FBTyxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUN2RixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbXBpbGVEaXJlY3RpdmVTdW1tYXJ5LCBDb21waWxlUGlwZVN1bW1hcnl9IGZyb20gJy4uL2NvbXBpbGVfbWV0YWRhdGEnO1xuaW1wb3J0IHtTZWN1cml0eUNvbnRleHR9IGZyb20gJy4uL2NvcmUnO1xuaW1wb3J0IHtBU1RXaXRoU291cmNlLCBCaW5kaW5nUGlwZSwgQmluZGluZ1R5cGUsIEJvdW5kRWxlbWVudFByb3BlcnR5LCBFbXB0eUV4cHIsIFBhcnNlZEV2ZW50LCBQYXJzZWRFdmVudFR5cGUsIFBhcnNlZFByb3BlcnR5LCBQYXJzZWRQcm9wZXJ0eVR5cGUsIFBhcnNlZFZhcmlhYmxlLCBQYXJzZXJFcnJvciwgUmVjdXJzaXZlQXN0VmlzaXRvciwgVGVtcGxhdGVCaW5kaW5nfSBmcm9tICcuLi9leHByZXNzaW9uX3BhcnNlci9hc3QnO1xuaW1wb3J0IHtQYXJzZXJ9IGZyb20gJy4uL2V4cHJlc3Npb25fcGFyc2VyL3BhcnNlcic7XG5pbXBvcnQge0ludGVycG9sYXRpb25Db25maWd9IGZyb20gJy4uL21sX3BhcnNlci9pbnRlcnBvbGF0aW9uX2NvbmZpZyc7XG5pbXBvcnQge21lcmdlTnNBbmROYW1lfSBmcm9tICcuLi9tbF9wYXJzZXIvdGFncyc7XG5pbXBvcnQge1BhcnNlRXJyb3IsIFBhcnNlRXJyb3JMZXZlbCwgUGFyc2VTb3VyY2VTcGFufSBmcm9tICcuLi9wYXJzZV91dGlsJztcbmltcG9ydCB7RWxlbWVudFNjaGVtYVJlZ2lzdHJ5fSBmcm9tICcuLi9zY2hlbWEvZWxlbWVudF9zY2hlbWFfcmVnaXN0cnknO1xuaW1wb3J0IHtDc3NTZWxlY3Rvcn0gZnJvbSAnLi4vc2VsZWN0b3InO1xuaW1wb3J0IHtzcGxpdEF0Q29sb24sIHNwbGl0QXRQZXJpb2R9IGZyb20gJy4uL3V0aWwnO1xuXG5jb25zdCBQUk9QRVJUWV9QQVJUU19TRVBBUkFUT1IgPSAnLic7XG5jb25zdCBBVFRSSUJVVEVfUFJFRklYID0gJ2F0dHInO1xuY29uc3QgQ0xBU1NfUFJFRklYID0gJ2NsYXNzJztcbmNvbnN0IFNUWUxFX1BSRUZJWCA9ICdzdHlsZSc7XG5cbmNvbnN0IEFOSU1BVEVfUFJPUF9QUkVGSVggPSAnYW5pbWF0ZS0nO1xuXG4vKipcbiAqIFBhcnNlcyBiaW5kaW5ncyBpbiB0ZW1wbGF0ZXMgYW5kIGluIHRoZSBkaXJlY3RpdmUgaG9zdCBhcmVhLlxuICovXG5leHBvcnQgY2xhc3MgQmluZGluZ1BhcnNlciB7XG4gIHBpcGVzQnlOYW1lOiBNYXA8c3RyaW5nLCBDb21waWxlUGlwZVN1bW1hcnk+fG51bGwgPSBudWxsO1xuXG4gIHByaXZhdGUgX3VzZWRQaXBlczogTWFwPHN0cmluZywgQ29tcGlsZVBpcGVTdW1tYXJ5PiA9IG5ldyBNYXAoKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgX2V4cHJQYXJzZXI6IFBhcnNlciwgcHJpdmF0ZSBfaW50ZXJwb2xhdGlvbkNvbmZpZzogSW50ZXJwb2xhdGlvbkNvbmZpZyxcbiAgICAgIHByaXZhdGUgX3NjaGVtYVJlZ2lzdHJ5OiBFbGVtZW50U2NoZW1hUmVnaXN0cnksIHBpcGVzOiBDb21waWxlUGlwZVN1bW1hcnlbXXxudWxsLFxuICAgICAgcHVibGljIGVycm9yczogUGFyc2VFcnJvcltdKSB7XG4gICAgLy8gV2hlbiB0aGUgYHBpcGVzYCBwYXJhbWV0ZXIgaXMgYG51bGxgLCBkbyBub3QgY2hlY2sgZm9yIHVzZWQgcGlwZXNcbiAgICAvLyBUaGlzIGlzIHVzZWQgaW4gSVZZIHdoZW4gd2UgbWlnaHQgbm90IGtub3cgdGhlIGF2YWlsYWJsZSBwaXBlcyBhdCBjb21waWxlIHRpbWVcbiAgICBpZiAocGlwZXMpIHtcbiAgICAgIGNvbnN0IHBpcGVzQnlOYW1lOiBNYXA8c3RyaW5nLCBDb21waWxlUGlwZVN1bW1hcnk+ID0gbmV3IE1hcCgpO1xuICAgICAgcGlwZXMuZm9yRWFjaChwaXBlID0+IHBpcGVzQnlOYW1lLnNldChwaXBlLm5hbWUsIHBpcGUpKTtcbiAgICAgIHRoaXMucGlwZXNCeU5hbWUgPSBwaXBlc0J5TmFtZTtcbiAgICB9XG4gIH1cblxuICBnZXQgaW50ZXJwb2xhdGlvbkNvbmZpZygpOiBJbnRlcnBvbGF0aW9uQ29uZmlnIHsgcmV0dXJuIHRoaXMuX2ludGVycG9sYXRpb25Db25maWc7IH1cblxuICBnZXRVc2VkUGlwZXMoKTogQ29tcGlsZVBpcGVTdW1tYXJ5W10geyByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLl91c2VkUGlwZXMudmFsdWVzKCkpOyB9XG5cbiAgY3JlYXRlQm91bmRIb3N0UHJvcGVydGllcyhkaXJNZXRhOiBDb21waWxlRGlyZWN0aXZlU3VtbWFyeSwgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuKTpcbiAgICAgIFBhcnNlZFByb3BlcnR5W118bnVsbCB7XG4gICAgaWYgKGRpck1ldGEuaG9zdFByb3BlcnRpZXMpIHtcbiAgICAgIGNvbnN0IGJvdW5kUHJvcHM6IFBhcnNlZFByb3BlcnR5W10gPSBbXTtcbiAgICAgIE9iamVjdC5rZXlzKGRpck1ldGEuaG9zdFByb3BlcnRpZXMpLmZvckVhY2gocHJvcE5hbWUgPT4ge1xuICAgICAgICBjb25zdCBleHByZXNzaW9uID0gZGlyTWV0YS5ob3N0UHJvcGVydGllc1twcm9wTmFtZV07XG4gICAgICAgIGlmICh0eXBlb2YgZXhwcmVzc2lvbiA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICB0aGlzLnBhcnNlUHJvcGVydHlCaW5kaW5nKHByb3BOYW1lLCBleHByZXNzaW9uLCB0cnVlLCBzb3VyY2VTcGFuLCBbXSwgYm91bmRQcm9wcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoXG4gICAgICAgICAgICAgIGBWYWx1ZSBvZiB0aGUgaG9zdCBwcm9wZXJ0eSBiaW5kaW5nIFwiJHtwcm9wTmFtZX1cIiBuZWVkcyB0byBiZSBhIHN0cmluZyByZXByZXNlbnRpbmcgYW4gZXhwcmVzc2lvbiBidXQgZ290IFwiJHtleHByZXNzaW9ufVwiICgke3R5cGVvZiBleHByZXNzaW9ufSlgLFxuICAgICAgICAgICAgICBzb3VyY2VTcGFuKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gYm91bmRQcm9wcztcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBjcmVhdGVEaXJlY3RpdmVIb3N0UHJvcGVydHlBc3RzKFxuICAgICAgZGlyTWV0YTogQ29tcGlsZURpcmVjdGl2ZVN1bW1hcnksIGVsZW1lbnRTZWxlY3Rvcjogc3RyaW5nLFxuICAgICAgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuKTogQm91bmRFbGVtZW50UHJvcGVydHlbXXxudWxsIHtcbiAgICBjb25zdCBib3VuZFByb3BzID0gdGhpcy5jcmVhdGVCb3VuZEhvc3RQcm9wZXJ0aWVzKGRpck1ldGEsIHNvdXJjZVNwYW4pO1xuICAgIHJldHVybiBib3VuZFByb3BzICYmXG4gICAgICAgIGJvdW5kUHJvcHMubWFwKChwcm9wKSA9PiB0aGlzLmNyZWF0ZUJvdW5kRWxlbWVudFByb3BlcnR5KGVsZW1lbnRTZWxlY3RvciwgcHJvcCkpO1xuICB9XG5cbiAgY3JlYXRlRGlyZWN0aXZlSG9zdEV2ZW50QXN0cyhkaXJNZXRhOiBDb21waWxlRGlyZWN0aXZlU3VtbWFyeSwgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuKTpcbiAgICAgIFBhcnNlZEV2ZW50W118bnVsbCB7XG4gICAgaWYgKGRpck1ldGEuaG9zdExpc3RlbmVycykge1xuICAgICAgY29uc3QgdGFyZ2V0RXZlbnRzOiBQYXJzZWRFdmVudFtdID0gW107XG4gICAgICBPYmplY3Qua2V5cyhkaXJNZXRhLmhvc3RMaXN0ZW5lcnMpLmZvckVhY2gocHJvcE5hbWUgPT4ge1xuICAgICAgICBjb25zdCBleHByZXNzaW9uID0gZGlyTWV0YS5ob3N0TGlzdGVuZXJzW3Byb3BOYW1lXTtcbiAgICAgICAgaWYgKHR5cGVvZiBleHByZXNzaW9uID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIHRoaXMucGFyc2VFdmVudChwcm9wTmFtZSwgZXhwcmVzc2lvbiwgc291cmNlU3BhbiwgW10sIHRhcmdldEV2ZW50cyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoXG4gICAgICAgICAgICAgIGBWYWx1ZSBvZiB0aGUgaG9zdCBsaXN0ZW5lciBcIiR7cHJvcE5hbWV9XCIgbmVlZHMgdG8gYmUgYSBzdHJpbmcgcmVwcmVzZW50aW5nIGFuIGV4cHJlc3Npb24gYnV0IGdvdCBcIiR7ZXhwcmVzc2lvbn1cIiAoJHt0eXBlb2YgZXhwcmVzc2lvbn0pYCxcbiAgICAgICAgICAgICAgc291cmNlU3Bhbik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHRhcmdldEV2ZW50cztcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBwYXJzZUludGVycG9sYXRpb24odmFsdWU6IHN0cmluZywgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuKTogQVNUV2l0aFNvdXJjZSB7XG4gICAgY29uc3Qgc291cmNlSW5mbyA9IHNvdXJjZVNwYW4uc3RhcnQudG9TdHJpbmcoKTtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBhc3QgPVxuICAgICAgICAgIHRoaXMuX2V4cHJQYXJzZXIucGFyc2VJbnRlcnBvbGF0aW9uKHZhbHVlLCBzb3VyY2VJbmZvLCB0aGlzLl9pbnRlcnBvbGF0aW9uQ29uZmlnKSAhO1xuICAgICAgaWYgKGFzdCkgdGhpcy5fcmVwb3J0RXhwcmVzc2lvblBhcnNlckVycm9ycyhhc3QuZXJyb3JzLCBzb3VyY2VTcGFuKTtcbiAgICAgIHRoaXMuX2NoZWNrUGlwZXMoYXN0LCBzb3VyY2VTcGFuKTtcbiAgICAgIHJldHVybiBhc3Q7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoYCR7ZX1gLCBzb3VyY2VTcGFuKTtcbiAgICAgIHJldHVybiB0aGlzLl9leHByUGFyc2VyLndyYXBMaXRlcmFsUHJpbWl0aXZlKCdFUlJPUicsIHNvdXJjZUluZm8pO1xuICAgIH1cbiAgfVxuXG4gIC8vIFBhcnNlIGFuIGlubGluZSB0ZW1wbGF0ZSBiaW5kaW5nLiBpZSBgPHRhZyAqdHBsS2V5PVwiPHRwbFZhbHVlPlwiPmBcbiAgcGFyc2VJbmxpbmVUZW1wbGF0ZUJpbmRpbmcoXG4gICAgICB0cGxLZXk6IHN0cmluZywgdHBsVmFsdWU6IHN0cmluZywgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgICAgdGFyZ2V0TWF0Y2hhYmxlQXR0cnM6IHN0cmluZ1tdW10sIHRhcmdldFByb3BzOiBQYXJzZWRQcm9wZXJ0eVtdLFxuICAgICAgdGFyZ2V0VmFyczogUGFyc2VkVmFyaWFibGVbXSkge1xuICAgIGNvbnN0IGJpbmRpbmdzID0gdGhpcy5fcGFyc2VUZW1wbGF0ZUJpbmRpbmdzKHRwbEtleSwgdHBsVmFsdWUsIHNvdXJjZVNwYW4pO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBiaW5kaW5ncy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgYmluZGluZyA9IGJpbmRpbmdzW2ldO1xuICAgICAgaWYgKGJpbmRpbmcua2V5SXNWYXIpIHtcbiAgICAgICAgdGFyZ2V0VmFycy5wdXNoKG5ldyBQYXJzZWRWYXJpYWJsZShiaW5kaW5nLmtleSwgYmluZGluZy5uYW1lLCBzb3VyY2VTcGFuKSk7XG4gICAgICB9IGVsc2UgaWYgKGJpbmRpbmcuZXhwcmVzc2lvbikge1xuICAgICAgICB0aGlzLl9wYXJzZVByb3BlcnR5QXN0KFxuICAgICAgICAgICAgYmluZGluZy5rZXksIGJpbmRpbmcuZXhwcmVzc2lvbiwgc291cmNlU3BhbiwgdGFyZ2V0TWF0Y2hhYmxlQXR0cnMsIHRhcmdldFByb3BzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRhcmdldE1hdGNoYWJsZUF0dHJzLnB1c2goW2JpbmRpbmcua2V5LCAnJ10pO1xuICAgICAgICB0aGlzLnBhcnNlTGl0ZXJhbEF0dHIoYmluZGluZy5rZXksIG51bGwsIHNvdXJjZVNwYW4sIHRhcmdldE1hdGNoYWJsZUF0dHJzLCB0YXJnZXRQcm9wcyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfcGFyc2VUZW1wbGF0ZUJpbmRpbmdzKHRwbEtleTogc3RyaW5nLCB0cGxWYWx1ZTogc3RyaW5nLCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4pOlxuICAgICAgVGVtcGxhdGVCaW5kaW5nW10ge1xuICAgIGNvbnN0IHNvdXJjZUluZm8gPSBzb3VyY2VTcGFuLnN0YXJ0LnRvU3RyaW5nKCk7XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgYmluZGluZ3NSZXN1bHQgPSB0aGlzLl9leHByUGFyc2VyLnBhcnNlVGVtcGxhdGVCaW5kaW5ncyh0cGxLZXksIHRwbFZhbHVlLCBzb3VyY2VJbmZvKTtcbiAgICAgIHRoaXMuX3JlcG9ydEV4cHJlc3Npb25QYXJzZXJFcnJvcnMoYmluZGluZ3NSZXN1bHQuZXJyb3JzLCBzb3VyY2VTcGFuKTtcbiAgICAgIGJpbmRpbmdzUmVzdWx0LnRlbXBsYXRlQmluZGluZ3MuZm9yRWFjaCgoYmluZGluZykgPT4ge1xuICAgICAgICBpZiAoYmluZGluZy5leHByZXNzaW9uKSB7XG4gICAgICAgICAgdGhpcy5fY2hlY2tQaXBlcyhiaW5kaW5nLmV4cHJlc3Npb24sIHNvdXJjZVNwYW4pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGJpbmRpbmdzUmVzdWx0Lndhcm5pbmdzLmZvckVhY2goXG4gICAgICAgICAgKHdhcm5pbmcpID0+IHsgdGhpcy5fcmVwb3J0RXJyb3Iod2FybmluZywgc291cmNlU3BhbiwgUGFyc2VFcnJvckxldmVsLldBUk5JTkcpOyB9KTtcbiAgICAgIHJldHVybiBiaW5kaW5nc1Jlc3VsdC50ZW1wbGF0ZUJpbmRpbmdzO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRoaXMuX3JlcG9ydEVycm9yKGAke2V9YCwgc291cmNlU3Bhbik7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICB9XG5cbiAgcGFyc2VMaXRlcmFsQXR0cihcbiAgICAgIG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZ3xudWxsLCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgICB0YXJnZXRNYXRjaGFibGVBdHRyczogc3RyaW5nW11bXSwgdGFyZ2V0UHJvcHM6IFBhcnNlZFByb3BlcnR5W10pIHtcbiAgICBpZiAoaXNBbmltYXRpb25MYWJlbChuYW1lKSkge1xuICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyaW5nKDEpO1xuICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX3JlcG9ydEVycm9yKFxuICAgICAgICAgICAgYEFzc2lnbmluZyBhbmltYXRpb24gdHJpZ2dlcnMgdmlhIEBwcm9wPVwiZXhwXCIgYXR0cmlidXRlcyB3aXRoIGFuIGV4cHJlc3Npb24gaXMgaW52YWxpZC5gICtcbiAgICAgICAgICAgICAgICBgIFVzZSBwcm9wZXJ0eSBiaW5kaW5ncyAoZS5nLiBbQHByb3BdPVwiZXhwXCIpIG9yIHVzZSBhbiBhdHRyaWJ1dGUgd2l0aG91dCBhIHZhbHVlIChlLmcuIEBwcm9wKSBpbnN0ZWFkLmAsXG4gICAgICAgICAgICBzb3VyY2VTcGFuLCBQYXJzZUVycm9yTGV2ZWwuRVJST1IpO1xuICAgICAgfVxuICAgICAgdGhpcy5fcGFyc2VBbmltYXRpb24obmFtZSwgdmFsdWUsIHNvdXJjZVNwYW4sIHRhcmdldE1hdGNoYWJsZUF0dHJzLCB0YXJnZXRQcm9wcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRhcmdldFByb3BzLnB1c2gobmV3IFBhcnNlZFByb3BlcnR5KFxuICAgICAgICAgIG5hbWUsIHRoaXMuX2V4cHJQYXJzZXIud3JhcExpdGVyYWxQcmltaXRpdmUodmFsdWUsICcnKSwgUGFyc2VkUHJvcGVydHlUeXBlLkxJVEVSQUxfQVRUUixcbiAgICAgICAgICBzb3VyY2VTcGFuKSk7XG4gICAgfVxuICB9XG5cbiAgcGFyc2VQcm9wZXJ0eUJpbmRpbmcoXG4gICAgICBuYW1lOiBzdHJpbmcsIGV4cHJlc3Npb246IHN0cmluZywgaXNIb3N0OiBib29sZWFuLCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgICB0YXJnZXRNYXRjaGFibGVBdHRyczogc3RyaW5nW11bXSwgdGFyZ2V0UHJvcHM6IFBhcnNlZFByb3BlcnR5W10pIHtcbiAgICBsZXQgaXNBbmltYXRpb25Qcm9wID0gZmFsc2U7XG4gICAgaWYgKG5hbWUuc3RhcnRzV2l0aChBTklNQVRFX1BST1BfUFJFRklYKSkge1xuICAgICAgaXNBbmltYXRpb25Qcm9wID0gdHJ1ZTtcbiAgICAgIG5hbWUgPSBuYW1lLnN1YnN0cmluZyhBTklNQVRFX1BST1BfUFJFRklYLmxlbmd0aCk7XG4gICAgfSBlbHNlIGlmIChpc0FuaW1hdGlvbkxhYmVsKG5hbWUpKSB7XG4gICAgICBpc0FuaW1hdGlvblByb3AgPSB0cnVlO1xuICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyaW5nKDEpO1xuICAgIH1cblxuICAgIGlmIChpc0FuaW1hdGlvblByb3ApIHtcbiAgICAgIHRoaXMuX3BhcnNlQW5pbWF0aW9uKG5hbWUsIGV4cHJlc3Npb24sIHNvdXJjZVNwYW4sIHRhcmdldE1hdGNoYWJsZUF0dHJzLCB0YXJnZXRQcm9wcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3BhcnNlUHJvcGVydHlBc3QoXG4gICAgICAgICAgbmFtZSwgdGhpcy5fcGFyc2VCaW5kaW5nKGV4cHJlc3Npb24sIGlzSG9zdCwgc291cmNlU3BhbiksIHNvdXJjZVNwYW4sXG4gICAgICAgICAgdGFyZ2V0TWF0Y2hhYmxlQXR0cnMsIHRhcmdldFByb3BzKTtcbiAgICB9XG4gIH1cblxuICBwYXJzZVByb3BlcnR5SW50ZXJwb2xhdGlvbihcbiAgICAgIG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZywgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLCB0YXJnZXRNYXRjaGFibGVBdHRyczogc3RyaW5nW11bXSxcbiAgICAgIHRhcmdldFByb3BzOiBQYXJzZWRQcm9wZXJ0eVtdKTogYm9vbGVhbiB7XG4gICAgY29uc3QgZXhwciA9IHRoaXMucGFyc2VJbnRlcnBvbGF0aW9uKHZhbHVlLCBzb3VyY2VTcGFuKTtcbiAgICBpZiAoZXhwcikge1xuICAgICAgdGhpcy5fcGFyc2VQcm9wZXJ0eUFzdChuYW1lLCBleHByLCBzb3VyY2VTcGFuLCB0YXJnZXRNYXRjaGFibGVBdHRycywgdGFyZ2V0UHJvcHMpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHByaXZhdGUgX3BhcnNlUHJvcGVydHlBc3QoXG4gICAgICBuYW1lOiBzdHJpbmcsIGFzdDogQVNUV2l0aFNvdXJjZSwgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgICAgdGFyZ2V0TWF0Y2hhYmxlQXR0cnM6IHN0cmluZ1tdW10sIHRhcmdldFByb3BzOiBQYXJzZWRQcm9wZXJ0eVtdKSB7XG4gICAgdGFyZ2V0TWF0Y2hhYmxlQXR0cnMucHVzaChbbmFtZSwgYXN0LnNvdXJjZSAhXSk7XG4gICAgdGFyZ2V0UHJvcHMucHVzaChuZXcgUGFyc2VkUHJvcGVydHkobmFtZSwgYXN0LCBQYXJzZWRQcm9wZXJ0eVR5cGUuREVGQVVMVCwgc291cmNlU3BhbikpO1xuICB9XG5cbiAgcHJpdmF0ZSBfcGFyc2VBbmltYXRpb24oXG4gICAgICBuYW1lOiBzdHJpbmcsIGV4cHJlc3Npb246IHN0cmluZ3xudWxsLCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgICB0YXJnZXRNYXRjaGFibGVBdHRyczogc3RyaW5nW11bXSwgdGFyZ2V0UHJvcHM6IFBhcnNlZFByb3BlcnR5W10pIHtcbiAgICAvLyBUaGlzIHdpbGwgb2NjdXIgd2hlbiBhIEB0cmlnZ2VyIGlzIG5vdCBwYWlyZWQgd2l0aCBhbiBleHByZXNzaW9uLlxuICAgIC8vIEZvciBhbmltYXRpb25zIGl0IGlzIHZhbGlkIHRvIG5vdCBoYXZlIGFuIGV4cHJlc3Npb24gc2luY2UgKi92b2lkXG4gICAgLy8gc3RhdGVzIHdpbGwgYmUgYXBwbGllZCBieSBhbmd1bGFyIHdoZW4gdGhlIGVsZW1lbnQgaXMgYXR0YWNoZWQvZGV0YWNoZWRcbiAgICBjb25zdCBhc3QgPSB0aGlzLl9wYXJzZUJpbmRpbmcoZXhwcmVzc2lvbiB8fCAndW5kZWZpbmVkJywgZmFsc2UsIHNvdXJjZVNwYW4pO1xuICAgIHRhcmdldE1hdGNoYWJsZUF0dHJzLnB1c2goW25hbWUsIGFzdC5zb3VyY2UgIV0pO1xuICAgIHRhcmdldFByb3BzLnB1c2gobmV3IFBhcnNlZFByb3BlcnR5KG5hbWUsIGFzdCwgUGFyc2VkUHJvcGVydHlUeXBlLkFOSU1BVElPTiwgc291cmNlU3BhbikpO1xuICB9XG5cbiAgcHJpdmF0ZSBfcGFyc2VCaW5kaW5nKHZhbHVlOiBzdHJpbmcsIGlzSG9zdEJpbmRpbmc6IGJvb2xlYW4sIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3Bhbik6XG4gICAgICBBU1RXaXRoU291cmNlIHtcbiAgICBjb25zdCBzb3VyY2VJbmZvID0gKHNvdXJjZVNwYW4gJiYgc291cmNlU3Bhbi5zdGFydCB8fCAnKHVua25vd24pJykudG9TdHJpbmcoKTtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBhc3QgPSBpc0hvc3RCaW5kaW5nID9cbiAgICAgICAgICB0aGlzLl9leHByUGFyc2VyLnBhcnNlU2ltcGxlQmluZGluZyh2YWx1ZSwgc291cmNlSW5mbywgdGhpcy5faW50ZXJwb2xhdGlvbkNvbmZpZykgOlxuICAgICAgICAgIHRoaXMuX2V4cHJQYXJzZXIucGFyc2VCaW5kaW5nKHZhbHVlLCBzb3VyY2VJbmZvLCB0aGlzLl9pbnRlcnBvbGF0aW9uQ29uZmlnKTtcbiAgICAgIGlmIChhc3QpIHRoaXMuX3JlcG9ydEV4cHJlc3Npb25QYXJzZXJFcnJvcnMoYXN0LmVycm9ycywgc291cmNlU3Bhbik7XG4gICAgICB0aGlzLl9jaGVja1BpcGVzKGFzdCwgc291cmNlU3Bhbik7XG4gICAgICByZXR1cm4gYXN0O1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRoaXMuX3JlcG9ydEVycm9yKGAke2V9YCwgc291cmNlU3Bhbik7XG4gICAgICByZXR1cm4gdGhpcy5fZXhwclBhcnNlci53cmFwTGl0ZXJhbFByaW1pdGl2ZSgnRVJST1InLCBzb3VyY2VJbmZvKTtcbiAgICB9XG4gIH1cblxuICBjcmVhdGVCb3VuZEVsZW1lbnRQcm9wZXJ0eShlbGVtZW50U2VsZWN0b3I6IHN0cmluZywgYm91bmRQcm9wOiBQYXJzZWRQcm9wZXJ0eSk6XG4gICAgICBCb3VuZEVsZW1lbnRQcm9wZXJ0eSB7XG4gICAgaWYgKGJvdW5kUHJvcC5pc0FuaW1hdGlvbikge1xuICAgICAgcmV0dXJuIG5ldyBCb3VuZEVsZW1lbnRQcm9wZXJ0eShcbiAgICAgICAgICBib3VuZFByb3AubmFtZSwgQmluZGluZ1R5cGUuQW5pbWF0aW9uLCBTZWN1cml0eUNvbnRleHQuTk9ORSwgYm91bmRQcm9wLmV4cHJlc3Npb24sIG51bGwsXG4gICAgICAgICAgYm91bmRQcm9wLnNvdXJjZVNwYW4pO1xuICAgIH1cblxuICAgIGxldCB1bml0OiBzdHJpbmd8bnVsbCA9IG51bGw7XG4gICAgbGV0IGJpbmRpbmdUeXBlOiBCaW5kaW5nVHlwZSA9IHVuZGVmaW5lZCAhO1xuICAgIGxldCBib3VuZFByb3BlcnR5TmFtZTogc3RyaW5nfG51bGwgPSBudWxsO1xuICAgIGNvbnN0IHBhcnRzID0gYm91bmRQcm9wLm5hbWUuc3BsaXQoUFJPUEVSVFlfUEFSVFNfU0VQQVJBVE9SKTtcbiAgICBsZXQgc2VjdXJpdHlDb250ZXh0czogU2VjdXJpdHlDb250ZXh0W10gPSB1bmRlZmluZWQgITtcblxuICAgIC8vIENoZWNrIGNoZWNrIGZvciBzcGVjaWFsIGNhc2VzIChwcmVmaXggc3R5bGUsIGF0dHIsIGNsYXNzKVxuICAgIGlmIChwYXJ0cy5sZW5ndGggPiAxKSB7XG4gICAgICBpZiAocGFydHNbMF0gPT0gQVRUUklCVVRFX1BSRUZJWCkge1xuICAgICAgICBib3VuZFByb3BlcnR5TmFtZSA9IHBhcnRzWzFdO1xuICAgICAgICB0aGlzLl92YWxpZGF0ZVByb3BlcnR5T3JBdHRyaWJ1dGVOYW1lKGJvdW5kUHJvcGVydHlOYW1lLCBib3VuZFByb3Auc291cmNlU3BhbiwgdHJ1ZSk7XG4gICAgICAgIHNlY3VyaXR5Q29udGV4dHMgPSBjYWxjUG9zc2libGVTZWN1cml0eUNvbnRleHRzKFxuICAgICAgICAgICAgdGhpcy5fc2NoZW1hUmVnaXN0cnksIGVsZW1lbnRTZWxlY3RvciwgYm91bmRQcm9wZXJ0eU5hbWUsIHRydWUpO1xuXG4gICAgICAgIGNvbnN0IG5zU2VwYXJhdG9ySWR4ID0gYm91bmRQcm9wZXJ0eU5hbWUuaW5kZXhPZignOicpO1xuICAgICAgICBpZiAobnNTZXBhcmF0b3JJZHggPiAtMSkge1xuICAgICAgICAgIGNvbnN0IG5zID0gYm91bmRQcm9wZXJ0eU5hbWUuc3Vic3RyaW5nKDAsIG5zU2VwYXJhdG9ySWR4KTtcbiAgICAgICAgICBjb25zdCBuYW1lID0gYm91bmRQcm9wZXJ0eU5hbWUuc3Vic3RyaW5nKG5zU2VwYXJhdG9ySWR4ICsgMSk7XG4gICAgICAgICAgYm91bmRQcm9wZXJ0eU5hbWUgPSBtZXJnZU5zQW5kTmFtZShucywgbmFtZSk7XG4gICAgICAgIH1cblxuICAgICAgICBiaW5kaW5nVHlwZSA9IEJpbmRpbmdUeXBlLkF0dHJpYnV0ZTtcbiAgICAgIH0gZWxzZSBpZiAocGFydHNbMF0gPT0gQ0xBU1NfUFJFRklYKSB7XG4gICAgICAgIGJvdW5kUHJvcGVydHlOYW1lID0gcGFydHNbMV07XG4gICAgICAgIGJpbmRpbmdUeXBlID0gQmluZGluZ1R5cGUuQ2xhc3M7XG4gICAgICAgIHNlY3VyaXR5Q29udGV4dHMgPSBbU2VjdXJpdHlDb250ZXh0Lk5PTkVdO1xuICAgICAgfSBlbHNlIGlmIChwYXJ0c1swXSA9PSBTVFlMRV9QUkVGSVgpIHtcbiAgICAgICAgdW5pdCA9IHBhcnRzLmxlbmd0aCA+IDIgPyBwYXJ0c1syXSA6IG51bGw7XG4gICAgICAgIGJvdW5kUHJvcGVydHlOYW1lID0gcGFydHNbMV07XG4gICAgICAgIGJpbmRpbmdUeXBlID0gQmluZGluZ1R5cGUuU3R5bGU7XG4gICAgICAgIHNlY3VyaXR5Q29udGV4dHMgPSBbU2VjdXJpdHlDb250ZXh0LlNUWUxFXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBJZiBub3QgYSBzcGVjaWFsIGNhc2UsIHVzZSB0aGUgZnVsbCBwcm9wZXJ0eSBuYW1lXG4gICAgaWYgKGJvdW5kUHJvcGVydHlOYW1lID09PSBudWxsKSB7XG4gICAgICBib3VuZFByb3BlcnR5TmFtZSA9IHRoaXMuX3NjaGVtYVJlZ2lzdHJ5LmdldE1hcHBlZFByb3BOYW1lKGJvdW5kUHJvcC5uYW1lKTtcbiAgICAgIHNlY3VyaXR5Q29udGV4dHMgPSBjYWxjUG9zc2libGVTZWN1cml0eUNvbnRleHRzKFxuICAgICAgICAgIHRoaXMuX3NjaGVtYVJlZ2lzdHJ5LCBlbGVtZW50U2VsZWN0b3IsIGJvdW5kUHJvcGVydHlOYW1lLCBmYWxzZSk7XG4gICAgICBiaW5kaW5nVHlwZSA9IEJpbmRpbmdUeXBlLlByb3BlcnR5O1xuICAgICAgdGhpcy5fdmFsaWRhdGVQcm9wZXJ0eU9yQXR0cmlidXRlTmFtZShib3VuZFByb3BlcnR5TmFtZSwgYm91bmRQcm9wLnNvdXJjZVNwYW4sIGZhbHNlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IEJvdW5kRWxlbWVudFByb3BlcnR5KFxuICAgICAgICBib3VuZFByb3BlcnR5TmFtZSwgYmluZGluZ1R5cGUsIHNlY3VyaXR5Q29udGV4dHNbMF0sIGJvdW5kUHJvcC5leHByZXNzaW9uLCB1bml0LFxuICAgICAgICBib3VuZFByb3Auc291cmNlU3Bhbik7XG4gIH1cblxuICBwYXJzZUV2ZW50KFxuICAgICAgbmFtZTogc3RyaW5nLCBleHByZXNzaW9uOiBzdHJpbmcsIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICAgIHRhcmdldE1hdGNoYWJsZUF0dHJzOiBzdHJpbmdbXVtdLCB0YXJnZXRFdmVudHM6IFBhcnNlZEV2ZW50W10pIHtcbiAgICBpZiAoaXNBbmltYXRpb25MYWJlbChuYW1lKSkge1xuICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyKDEpO1xuICAgICAgdGhpcy5fcGFyc2VBbmltYXRpb25FdmVudChuYW1lLCBleHByZXNzaW9uLCBzb3VyY2VTcGFuLCB0YXJnZXRFdmVudHMpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9wYXJzZVJlZ3VsYXJFdmVudChuYW1lLCBleHByZXNzaW9uLCBzb3VyY2VTcGFuLCB0YXJnZXRNYXRjaGFibGVBdHRycywgdGFyZ2V0RXZlbnRzKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9wYXJzZUFuaW1hdGlvbkV2ZW50KFxuICAgICAgbmFtZTogc3RyaW5nLCBleHByZXNzaW9uOiBzdHJpbmcsIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbiwgdGFyZ2V0RXZlbnRzOiBQYXJzZWRFdmVudFtdKSB7XG4gICAgY29uc3QgbWF0Y2hlcyA9IHNwbGl0QXRQZXJpb2QobmFtZSwgW25hbWUsICcnXSk7XG4gICAgY29uc3QgZXZlbnROYW1lID0gbWF0Y2hlc1swXTtcbiAgICBjb25zdCBwaGFzZSA9IG1hdGNoZXNbMV0udG9Mb3dlckNhc2UoKTtcbiAgICBpZiAocGhhc2UpIHtcbiAgICAgIHN3aXRjaCAocGhhc2UpIHtcbiAgICAgICAgY2FzZSAnc3RhcnQnOlxuICAgICAgICBjYXNlICdkb25lJzpcbiAgICAgICAgICBjb25zdCBhc3QgPSB0aGlzLl9wYXJzZUFjdGlvbihleHByZXNzaW9uLCBzb3VyY2VTcGFuKTtcbiAgICAgICAgICB0YXJnZXRFdmVudHMucHVzaChcbiAgICAgICAgICAgICAgbmV3IFBhcnNlZEV2ZW50KGV2ZW50TmFtZSwgcGhhc2UsIFBhcnNlZEV2ZW50VHlwZS5BbmltYXRpb24sIGFzdCwgc291cmNlU3BhbikpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoXG4gICAgICAgICAgICAgIGBUaGUgcHJvdmlkZWQgYW5pbWF0aW9uIG91dHB1dCBwaGFzZSB2YWx1ZSBcIiR7cGhhc2V9XCIgZm9yIFwiQCR7ZXZlbnROYW1lfVwiIGlzIG5vdCBzdXBwb3J0ZWQgKHVzZSBzdGFydCBvciBkb25lKWAsXG4gICAgICAgICAgICAgIHNvdXJjZVNwYW4pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9yZXBvcnRFcnJvcihcbiAgICAgICAgICBgVGhlIGFuaW1hdGlvbiB0cmlnZ2VyIG91dHB1dCBldmVudCAoQCR7ZXZlbnROYW1lfSkgaXMgbWlzc2luZyBpdHMgcGhhc2UgdmFsdWUgbmFtZSAoc3RhcnQgb3IgZG9uZSBhcmUgY3VycmVudGx5IHN1cHBvcnRlZClgLFxuICAgICAgICAgIHNvdXJjZVNwYW4pO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3BhcnNlUmVndWxhckV2ZW50KFxuICAgICAgbmFtZTogc3RyaW5nLCBleHByZXNzaW9uOiBzdHJpbmcsIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICAgIHRhcmdldE1hdGNoYWJsZUF0dHJzOiBzdHJpbmdbXVtdLCB0YXJnZXRFdmVudHM6IFBhcnNlZEV2ZW50W10pIHtcbiAgICAvLyBsb25nIGZvcm1hdDogJ3RhcmdldDogZXZlbnROYW1lJ1xuICAgIGNvbnN0IFt0YXJnZXQsIGV2ZW50TmFtZV0gPSBzcGxpdEF0Q29sb24obmFtZSwgW251bGwgISwgbmFtZV0pO1xuICAgIGNvbnN0IGFzdCA9IHRoaXMuX3BhcnNlQWN0aW9uKGV4cHJlc3Npb24sIHNvdXJjZVNwYW4pO1xuICAgIHRhcmdldE1hdGNoYWJsZUF0dHJzLnB1c2goW25hbWUgISwgYXN0LnNvdXJjZSAhXSk7XG4gICAgdGFyZ2V0RXZlbnRzLnB1c2gobmV3IFBhcnNlZEV2ZW50KGV2ZW50TmFtZSwgdGFyZ2V0LCBQYXJzZWRFdmVudFR5cGUuUmVndWxhciwgYXN0LCBzb3VyY2VTcGFuKSk7XG4gICAgLy8gRG9uJ3QgZGV0ZWN0IGRpcmVjdGl2ZXMgZm9yIGV2ZW50IG5hbWVzIGZvciBub3csXG4gICAgLy8gc28gZG9uJ3QgYWRkIHRoZSBldmVudCBuYW1lIHRvIHRoZSBtYXRjaGFibGVBdHRyc1xuICB9XG5cbiAgcHJpdmF0ZSBfcGFyc2VBY3Rpb24odmFsdWU6IHN0cmluZywgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuKTogQVNUV2l0aFNvdXJjZSB7XG4gICAgY29uc3Qgc291cmNlSW5mbyA9IChzb3VyY2VTcGFuICYmIHNvdXJjZVNwYW4uc3RhcnQgfHwgJyh1bmtub3duJykudG9TdHJpbmcoKTtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBhc3QgPSB0aGlzLl9leHByUGFyc2VyLnBhcnNlQWN0aW9uKHZhbHVlLCBzb3VyY2VJbmZvLCB0aGlzLl9pbnRlcnBvbGF0aW9uQ29uZmlnKTtcbiAgICAgIGlmIChhc3QpIHtcbiAgICAgICAgdGhpcy5fcmVwb3J0RXhwcmVzc2lvblBhcnNlckVycm9ycyhhc3QuZXJyb3JzLCBzb3VyY2VTcGFuKTtcbiAgICAgIH1cbiAgICAgIGlmICghYXN0IHx8IGFzdC5hc3QgaW5zdGFuY2VvZiBFbXB0eUV4cHIpIHtcbiAgICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoYEVtcHR5IGV4cHJlc3Npb25zIGFyZSBub3QgYWxsb3dlZGAsIHNvdXJjZVNwYW4pO1xuICAgICAgICByZXR1cm4gdGhpcy5fZXhwclBhcnNlci53cmFwTGl0ZXJhbFByaW1pdGl2ZSgnRVJST1InLCBzb3VyY2VJbmZvKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2NoZWNrUGlwZXMoYXN0LCBzb3VyY2VTcGFuKTtcbiAgICAgIHJldHVybiBhc3Q7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoYCR7ZX1gLCBzb3VyY2VTcGFuKTtcbiAgICAgIHJldHVybiB0aGlzLl9leHByUGFyc2VyLndyYXBMaXRlcmFsUHJpbWl0aXZlKCdFUlJPUicsIHNvdXJjZUluZm8pO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3JlcG9ydEVycm9yKFxuICAgICAgbWVzc2FnZTogc3RyaW5nLCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgICBsZXZlbDogUGFyc2VFcnJvckxldmVsID0gUGFyc2VFcnJvckxldmVsLkVSUk9SKSB7XG4gICAgdGhpcy5lcnJvcnMucHVzaChuZXcgUGFyc2VFcnJvcihzb3VyY2VTcGFuLCBtZXNzYWdlLCBsZXZlbCkpO1xuICB9XG5cbiAgcHJpdmF0ZSBfcmVwb3J0RXhwcmVzc2lvblBhcnNlckVycm9ycyhlcnJvcnM6IFBhcnNlckVycm9yW10sIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3Bhbikge1xuICAgIGZvciAoY29uc3QgZXJyb3Igb2YgZXJyb3JzKSB7XG4gICAgICB0aGlzLl9yZXBvcnRFcnJvcihlcnJvci5tZXNzYWdlLCBzb3VyY2VTcGFuKTtcbiAgICB9XG4gIH1cblxuICAvLyBNYWtlIHN1cmUgYWxsIHRoZSB1c2VkIHBpcGVzIGFyZSBrbm93biBpbiBgdGhpcy5waXBlc0J5TmFtZWBcbiAgcHJpdmF0ZSBfY2hlY2tQaXBlcyhhc3Q6IEFTVFdpdGhTb3VyY2UsIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3Bhbik6IHZvaWQge1xuICAgIGlmIChhc3QgJiYgdGhpcy5waXBlc0J5TmFtZSkge1xuICAgICAgY29uc3QgY29sbGVjdG9yID0gbmV3IFBpcGVDb2xsZWN0b3IoKTtcbiAgICAgIGFzdC52aXNpdChjb2xsZWN0b3IpO1xuICAgICAgY29sbGVjdG9yLnBpcGVzLmZvckVhY2goKGFzdCwgcGlwZU5hbWUpID0+IHtcbiAgICAgICAgY29uc3QgcGlwZU1ldGEgPSB0aGlzLnBpcGVzQnlOYW1lICEuZ2V0KHBpcGVOYW1lKTtcbiAgICAgICAgaWYgKCFwaXBlTWV0YSkge1xuICAgICAgICAgIHRoaXMuX3JlcG9ydEVycm9yKFxuICAgICAgICAgICAgICBgVGhlIHBpcGUgJyR7cGlwZU5hbWV9JyBjb3VsZCBub3QgYmUgZm91bmRgLFxuICAgICAgICAgICAgICBuZXcgUGFyc2VTb3VyY2VTcGFuKFxuICAgICAgICAgICAgICAgICAgc291cmNlU3Bhbi5zdGFydC5tb3ZlQnkoYXN0LnNwYW4uc3RhcnQpLCBzb3VyY2VTcGFuLnN0YXJ0Lm1vdmVCeShhc3Quc3Bhbi5lbmQpKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5fdXNlZFBpcGVzLnNldChwaXBlTmFtZSwgcGlwZU1ldGEpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHByb3BOYW1lIHRoZSBuYW1lIG9mIHRoZSBwcm9wZXJ0eSAvIGF0dHJpYnV0ZVxuICAgKiBAcGFyYW0gc291cmNlU3BhblxuICAgKiBAcGFyYW0gaXNBdHRyIHRydWUgd2hlbiBiaW5kaW5nIHRvIGFuIGF0dHJpYnV0ZVxuICAgKi9cbiAgcHJpdmF0ZSBfdmFsaWRhdGVQcm9wZXJ0eU9yQXR0cmlidXRlTmFtZShcbiAgICAgIHByb3BOYW1lOiBzdHJpbmcsIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbiwgaXNBdHRyOiBib29sZWFuKTogdm9pZCB7XG4gICAgY29uc3QgcmVwb3J0ID0gaXNBdHRyID8gdGhpcy5fc2NoZW1hUmVnaXN0cnkudmFsaWRhdGVBdHRyaWJ1dGUocHJvcE5hbWUpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9zY2hlbWFSZWdpc3RyeS52YWxpZGF0ZVByb3BlcnR5KHByb3BOYW1lKTtcbiAgICBpZiAocmVwb3J0LmVycm9yKSB7XG4gICAgICB0aGlzLl9yZXBvcnRFcnJvcihyZXBvcnQubXNnICEsIHNvdXJjZVNwYW4sIFBhcnNlRXJyb3JMZXZlbC5FUlJPUik7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBQaXBlQ29sbGVjdG9yIGV4dGVuZHMgUmVjdXJzaXZlQXN0VmlzaXRvciB7XG4gIHBpcGVzID0gbmV3IE1hcDxzdHJpbmcsIEJpbmRpbmdQaXBlPigpO1xuICB2aXNpdFBpcGUoYXN0OiBCaW5kaW5nUGlwZSwgY29udGV4dDogYW55KTogYW55IHtcbiAgICB0aGlzLnBpcGVzLnNldChhc3QubmFtZSwgYXN0KTtcbiAgICBhc3QuZXhwLnZpc2l0KHRoaXMpO1xuICAgIHRoaXMudmlzaXRBbGwoYXN0LmFyZ3MsIGNvbnRleHQpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzQW5pbWF0aW9uTGFiZWwobmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBuYW1lWzBdID09ICdAJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbGNQb3NzaWJsZVNlY3VyaXR5Q29udGV4dHMoXG4gICAgcmVnaXN0cnk6IEVsZW1lbnRTY2hlbWFSZWdpc3RyeSwgc2VsZWN0b3I6IHN0cmluZywgcHJvcE5hbWU6IHN0cmluZyxcbiAgICBpc0F0dHJpYnV0ZTogYm9vbGVhbik6IFNlY3VyaXR5Q29udGV4dFtdIHtcbiAgY29uc3QgY3R4czogU2VjdXJpdHlDb250ZXh0W10gPSBbXTtcbiAgQ3NzU2VsZWN0b3IucGFyc2Uoc2VsZWN0b3IpLmZvckVhY2goKHNlbGVjdG9yKSA9PiB7XG4gICAgY29uc3QgZWxlbWVudE5hbWVzID0gc2VsZWN0b3IuZWxlbWVudCA/IFtzZWxlY3Rvci5lbGVtZW50XSA6IHJlZ2lzdHJ5LmFsbEtub3duRWxlbWVudE5hbWVzKCk7XG4gICAgY29uc3Qgbm90RWxlbWVudE5hbWVzID1cbiAgICAgICAgbmV3IFNldChzZWxlY3Rvci5ub3RTZWxlY3RvcnMuZmlsdGVyKHNlbGVjdG9yID0+IHNlbGVjdG9yLmlzRWxlbWVudFNlbGVjdG9yKCkpXG4gICAgICAgICAgICAgICAgICAgIC5tYXAoKHNlbGVjdG9yKSA9PiBzZWxlY3Rvci5lbGVtZW50KSk7XG4gICAgY29uc3QgcG9zc2libGVFbGVtZW50TmFtZXMgPVxuICAgICAgICBlbGVtZW50TmFtZXMuZmlsdGVyKGVsZW1lbnROYW1lID0+ICFub3RFbGVtZW50TmFtZXMuaGFzKGVsZW1lbnROYW1lKSk7XG5cbiAgICBjdHhzLnB1c2goLi4ucG9zc2libGVFbGVtZW50TmFtZXMubWFwKFxuICAgICAgICBlbGVtZW50TmFtZSA9PiByZWdpc3RyeS5zZWN1cml0eUNvbnRleHQoZWxlbWVudE5hbWUsIHByb3BOYW1lLCBpc0F0dHJpYnV0ZSkpKTtcbiAgfSk7XG4gIHJldHVybiBjdHhzLmxlbmd0aCA9PT0gMCA/IFtTZWN1cml0eUNvbnRleHQuTk9ORV0gOiBBcnJheS5mcm9tKG5ldyBTZXQoY3R4cykpLnNvcnQoKTtcbn0iXX0=