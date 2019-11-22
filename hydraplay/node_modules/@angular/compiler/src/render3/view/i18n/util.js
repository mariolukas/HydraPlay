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
        define("@angular/compiler/src/render3/view/i18n/util", ["require", "exports", "tslib", "@angular/compiler/src/i18n/i18n_ast", "@angular/compiler/src/i18n/serializers/xmb", "@angular/compiler/src/output/map_util", "@angular/compiler/src/output/output_ast"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var i18n = require("@angular/compiler/src/i18n/i18n_ast");
    var xmb_1 = require("@angular/compiler/src/i18n/serializers/xmb");
    var map_util_1 = require("@angular/compiler/src/output/map_util");
    var o = require("@angular/compiler/src/output/output_ast");
    /* Closure variables holding messages must be named `MSG_[A-Z0-9]+` */
    var CLOSURE_TRANSLATION_PREFIX = 'MSG_';
    var CLOSURE_TRANSLATION_MATCHER_REGEXP = new RegExp("^" + CLOSURE_TRANSLATION_PREFIX);
    /* Prefix for non-`goog.getMsg` i18n-related vars */
    var TRANSLATION_PREFIX = 'I18N_';
    /** Closure uses `goog.getMsg(message)` to lookup translations */
    var GOOG_GET_MSG = 'goog.getMsg';
    /** I18n separators for metadata **/
    var I18N_MEANING_SEPARATOR = '|';
    var I18N_ID_SEPARATOR = '@@';
    /** Name of the i18n attributes **/
    exports.I18N_ATTR = 'i18n';
    exports.I18N_ATTR_PREFIX = 'i18n-';
    /** Prefix of var expressions used in ICUs */
    exports.I18N_ICU_VAR_PREFIX = 'VAR_';
    /** Prefix of ICU expressions for post processing */
    exports.I18N_ICU_MAPPING_PREFIX = 'I18N_EXP_';
    /** Placeholder wrapper for i18n expressions **/
    exports.I18N_PLACEHOLDER_SYMBOL = '�';
    function i18nTranslationToDeclStmt(variable, message, params) {
        var args = [o.literal(message)];
        if (params && Object.keys(params).length) {
            args.push(map_util_1.mapLiteral(params, true));
        }
        var fnCall = o.variable(GOOG_GET_MSG).callFn(args);
        return variable.set(fnCall).toDeclStmt(o.INFERRED_TYPE, [o.StmtModifier.Final]);
    }
    // Converts i18n meta informations for a message (id, description, meaning)
    // to a JsDoc statement formatted as expected by the Closure compiler.
    function i18nMetaToDocStmt(meta) {
        var tags = [];
        if (meta.description) {
            tags.push({ tagName: "desc" /* Desc */, text: meta.description });
        }
        if (meta.meaning) {
            tags.push({ tagName: "meaning" /* Meaning */, text: meta.meaning });
        }
        return tags.length == 0 ? null : new o.JSDocCommentStmt(tags);
    }
    function isI18nAttribute(name) {
        return name === exports.I18N_ATTR || name.startsWith(exports.I18N_ATTR_PREFIX);
    }
    exports.isI18nAttribute = isI18nAttribute;
    function isI18nRootNode(meta) {
        return meta instanceof i18n.Message;
    }
    exports.isI18nRootNode = isI18nRootNode;
    function isSingleI18nIcu(meta) {
        return isI18nRootNode(meta) && meta.nodes.length === 1 && meta.nodes[0] instanceof i18n.Icu;
    }
    exports.isSingleI18nIcu = isSingleI18nIcu;
    function hasI18nAttrs(element) {
        return element.attrs.some(function (attr) { return isI18nAttribute(attr.name); });
    }
    exports.hasI18nAttrs = hasI18nAttrs;
    function metaFromI18nMessage(message, id) {
        if (id === void 0) { id = null; }
        return {
            id: typeof id === 'string' ? id : message.id || '',
            meaning: message.meaning || '',
            description: message.description || ''
        };
    }
    exports.metaFromI18nMessage = metaFromI18nMessage;
    function icuFromI18nMessage(message) {
        return message.nodes[0];
    }
    exports.icuFromI18nMessage = icuFromI18nMessage;
    function wrapI18nPlaceholder(content, contextId) {
        if (contextId === void 0) { contextId = 0; }
        var blockId = contextId > 0 ? ":" + contextId : '';
        return "" + exports.I18N_PLACEHOLDER_SYMBOL + content + blockId + exports.I18N_PLACEHOLDER_SYMBOL;
    }
    exports.wrapI18nPlaceholder = wrapI18nPlaceholder;
    function assembleI18nBoundString(strings, bindingStartIndex, contextId) {
        if (bindingStartIndex === void 0) { bindingStartIndex = 0; }
        if (contextId === void 0) { contextId = 0; }
        if (!strings.length)
            return '';
        var acc = '';
        var lastIdx = strings.length - 1;
        for (var i = 0; i < lastIdx; i++) {
            acc += "" + strings[i] + wrapI18nPlaceholder(bindingStartIndex + i, contextId);
        }
        acc += strings[lastIdx];
        return acc;
    }
    exports.assembleI18nBoundString = assembleI18nBoundString;
    function getSeqNumberGenerator(startsAt) {
        if (startsAt === void 0) { startsAt = 0; }
        var current = startsAt;
        return function () { return current++; };
    }
    exports.getSeqNumberGenerator = getSeqNumberGenerator;
    function placeholdersToParams(placeholders) {
        var params = {};
        placeholders.forEach(function (values, key) {
            params[key] = o.literal(values.length > 1 ? "[" + values.join('|') + "]" : values[0]);
        });
        return params;
    }
    exports.placeholdersToParams = placeholdersToParams;
    function updatePlaceholderMap(map, name) {
        var values = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            values[_i - 2] = arguments[_i];
        }
        var current = map.get(name) || [];
        current.push.apply(current, tslib_1.__spread(values));
        map.set(name, current);
    }
    exports.updatePlaceholderMap = updatePlaceholderMap;
    function assembleBoundTextPlaceholders(meta, bindingStartIndex, contextId) {
        if (bindingStartIndex === void 0) { bindingStartIndex = 0; }
        if (contextId === void 0) { contextId = 0; }
        var startIdx = bindingStartIndex;
        var placeholders = new Map();
        var node = meta instanceof i18n.Message ? meta.nodes.find(function (node) { return node instanceof i18n.Container; }) : meta;
        if (node) {
            node
                .children.filter(function (child) { return child instanceof i18n.Placeholder; })
                .forEach(function (child, idx) {
                var content = wrapI18nPlaceholder(startIdx + idx, contextId);
                updatePlaceholderMap(placeholders, child.name, content);
            });
        }
        return placeholders;
    }
    exports.assembleBoundTextPlaceholders = assembleBoundTextPlaceholders;
    function findIndex(items, callback) {
        for (var i = 0; i < items.length; i++) {
            if (callback(items[i])) {
                return i;
            }
        }
        return -1;
    }
    exports.findIndex = findIndex;
    /**
     * Parses i18n metas like:
     *  - "@@id",
     *  - "description[@@id]",
     *  - "meaning|description[@@id]"
     * and returns an object with parsed output.
     *
     * @param meta String that represents i18n meta
     * @returns Object with id, meaning and description fields
     */
    function parseI18nMeta(meta) {
        var _a, _b;
        var id;
        var meaning;
        var description;
        if (meta) {
            var idIndex = meta.indexOf(I18N_ID_SEPARATOR);
            var descIndex = meta.indexOf(I18N_MEANING_SEPARATOR);
            var meaningAndDesc = void 0;
            _a = tslib_1.__read((idIndex > -1) ? [meta.slice(0, idIndex), meta.slice(idIndex + 2)] : [meta, ''], 2), meaningAndDesc = _a[0], id = _a[1];
            _b = tslib_1.__read((descIndex > -1) ?
                [meaningAndDesc.slice(0, descIndex), meaningAndDesc.slice(descIndex + 1)] :
                ['', meaningAndDesc], 2), meaning = _b[0], description = _b[1];
        }
        return { id: id, meaning: meaning, description: description };
    }
    exports.parseI18nMeta = parseI18nMeta;
    /**
     * Converts internal placeholder names to public-facing format
     * (for example to use in goog.getMsg call).
     * Example: `START_TAG_DIV_1` is converted to `startTagDiv_1`.
     *
     * @param name The placeholder name that should be formatted
     * @returns Formatted placeholder name
     */
    function formatI18nPlaceholderName(name) {
        var chunks = xmb_1.toPublicName(name).split('_');
        if (chunks.length === 1) {
            // if no "_" found - just lowercase the value
            return name.toLowerCase();
        }
        var postfix;
        // eject last element if it's a number
        if (/^\d+$/.test(chunks[chunks.length - 1])) {
            postfix = chunks.pop();
        }
        var raw = chunks.shift().toLowerCase();
        if (chunks.length) {
            raw += chunks.map(function (c) { return c.charAt(0).toUpperCase() + c.slice(1).toLowerCase(); }).join('');
        }
        return postfix ? raw + "_" + postfix : raw;
    }
    exports.formatI18nPlaceholderName = formatI18nPlaceholderName;
    /**
     * Generates a prefix for translation const name.
     *
     * @param extra Additional local prefix that should be injected into translation var name
     * @returns Complete translation const prefix
     */
    function getTranslationConstPrefix(extra) {
        return ("" + CLOSURE_TRANSLATION_PREFIX + extra).toUpperCase();
    }
    exports.getTranslationConstPrefix = getTranslationConstPrefix;
    /**
     * Generates translation declaration statements.
     *
     * @param variable Translation value reference
     * @param message Text message to be translated
     * @param meta Object that contains meta information (id, meaning and description)
     * @param params Object with placeholders key-value pairs
     * @param transformFn Optional transformation (post processing) function reference
     * @returns Array of Statements that represent a given translation
     */
    function getTranslationDeclStmts(variable, message, meta, params, transformFn) {
        if (params === void 0) { params = {}; }
        var statements = [];
        var docStatements = i18nMetaToDocStmt(meta);
        if (docStatements) {
            statements.push(docStatements);
        }
        if (transformFn) {
            statements.push(i18nTranslationToDeclStmt(variable, message, params));
            // Closure Compiler doesn't allow non-goo.getMsg const names to start with `MSG_`,
            // so we update variable name prefix in case post processing is required, so we can
            // assign the result of post-processing function to the var that starts with `I18N_`
            var raw = o.variable(variable.name);
            variable.name = variable.name.replace(CLOSURE_TRANSLATION_MATCHER_REGEXP, TRANSLATION_PREFIX);
            statements.push(variable.set(transformFn(raw)).toDeclStmt(o.INFERRED_TYPE, [o.StmtModifier.Final]));
        }
        else {
            statements.push(i18nTranslationToDeclStmt(variable, message, params));
        }
        return statements;
    }
    exports.getTranslationDeclStmts = getTranslationDeclStmts;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9yZW5kZXIzL3ZpZXcvaTE4bi91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUVILDBEQUErQztJQUMvQyxrRUFBMkQ7SUFFM0Qsa0VBQW9EO0lBQ3BELDJEQUFnRDtJQUdoRCxzRUFBc0U7SUFDdEUsSUFBTSwwQkFBMEIsR0FBRyxNQUFNLENBQUM7SUFDMUMsSUFBTSxrQ0FBa0MsR0FBRyxJQUFJLE1BQU0sQ0FBQyxNQUFJLDBCQUE0QixDQUFDLENBQUM7SUFFeEYsb0RBQW9EO0lBQ3BELElBQU0sa0JBQWtCLEdBQUcsT0FBTyxDQUFDO0lBR25DLGlFQUFpRTtJQUNqRSxJQUFNLFlBQVksR0FBRyxhQUFhLENBQUM7SUFFbkMsb0NBQW9DO0lBQ3BDLElBQU0sc0JBQXNCLEdBQUcsR0FBRyxDQUFDO0lBQ25DLElBQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDO0lBRS9CLG1DQUFtQztJQUN0QixRQUFBLFNBQVMsR0FBRyxNQUFNLENBQUM7SUFDbkIsUUFBQSxnQkFBZ0IsR0FBRyxPQUFPLENBQUM7SUFFeEMsNkNBQTZDO0lBQ2hDLFFBQUEsbUJBQW1CLEdBQUcsTUFBTSxDQUFDO0lBRTFDLG9EQUFvRDtJQUN2QyxRQUFBLHVCQUF1QixHQUFHLFdBQVcsQ0FBQztJQUVuRCxnREFBZ0Q7SUFDbkMsUUFBQSx1QkFBdUIsR0FBRyxHQUFHLENBQUM7SUFRM0MsU0FBUyx5QkFBeUIsQ0FDOUIsUUFBdUIsRUFBRSxPQUFlLEVBQ3hDLE1BQXVDO1FBQ3pDLElBQU0sSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQWlCLENBQUMsQ0FBQztRQUNsRCxJQUFJLE1BQU0sSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFD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SUFDcEIsQ0FBQztJQXhCRCwwREF3QkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIGkxOG4gZnJvbSAnLi4vLi4vLi4vaTE4bi9pMThuX2FzdCc7XG5pbXBvcnQge3RvUHVibGljTmFtZX0gZnJvbSAnLi4vLi4vLi4vaTE4bi9zZXJpYWxpemVycy94bWInO1xuaW1wb3J0ICogYXMgaHRtbCBmcm9tICcuLi8uLi8uLi9tbF9wYXJzZXIvYXN0JztcbmltcG9ydCB7bWFwTGl0ZXJhbH0gZnJvbSAnLi4vLi4vLi4vb3V0cHV0L21hcF91dGlsJztcbmltcG9ydCAqIGFzIG8gZnJvbSAnLi4vLi4vLi4vb3V0cHV0L291dHB1dF9hc3QnO1xuXG5cbi8qIENsb3N1cmUgdmFyaWFibGVzIGhvbGRpbmcgbWVzc2FnZXMgbXVzdCBiZSBuYW1lZCBgTVNHX1tBLVowLTldK2AgKi9cbmNvbnN0IENMT1NVUkVfVFJBTlNMQVRJT05fUFJFRklYID0gJ01TR18nO1xuY29uc3QgQ0xPU1VSRV9UUkFOU0xBVElPTl9NQVRDSEVSX1JFR0VYUCA9IG5ldyBSZWdFeHAoYF4ke0NMT1NVUkVfVFJBTlNMQVRJT05fUFJFRklYfWApO1xuXG4vKiBQcmVmaXggZm9yIG5vbi1gZ29vZy5nZXRNc2dgIGkxOG4tcmVsYXRlZCB2YXJzICovXG5jb25zdCBUUkFOU0xBVElPTl9QUkVGSVggPSAnSTE4Tl8nO1xuXG5cbi8qKiBDbG9zdXJlIHVzZXMgYGdvb2cuZ2V0TXNnKG1lc3NhZ2UpYCB0byBsb29rdXAgdHJhbnNsYXRpb25zICovXG5jb25zdCBHT09HX0dFVF9NU0cgPSAnZ29vZy5nZXRNc2cnO1xuXG4vKiogSTE4biBzZXBhcmF0b3JzIGZvciBtZXRhZGF0YSAqKi9cbmNvbnN0IEkxOE5fTUVBTklOR19TRVBBUkFUT1IgPSAnfCc7XG5jb25zdCBJMThOX0lEX1NFUEFSQVRPUiA9ICdAQCc7XG5cbi8qKiBOYW1lIG9mIHRoZSBpMThuIGF0dHJpYnV0ZXMgKiovXG5leHBvcnQgY29uc3QgSTE4Tl9BVFRSID0gJ2kxOG4nO1xuZXhwb3J0IGNvbnN0IEkxOE5fQVRUUl9QUkVGSVggPSAnaTE4bi0nO1xuXG4vKiogUHJlZml4IG9mIHZhciBleHByZXNzaW9ucyB1c2VkIGluIElDVXMgKi9cbmV4cG9ydCBjb25zdCBJMThOX0lDVV9WQVJfUFJFRklYID0gJ1ZBUl8nO1xuXG4vKiogUHJlZml4IG9mIElDVSBleHByZXNzaW9ucyBmb3IgcG9zdCBwcm9jZXNzaW5nICovXG5leHBvcnQgY29uc3QgSTE4Tl9JQ1VfTUFQUElOR19QUkVGSVggPSAnSTE4Tl9FWFBfJztcblxuLyoqIFBsYWNlaG9sZGVyIHdyYXBwZXIgZm9yIGkxOG4gZXhwcmVzc2lvbnMgKiovXG5leHBvcnQgY29uc3QgSTE4Tl9QTEFDRUhPTERFUl9TWU1CT0wgPSAn77+9JztcblxuZXhwb3J0IHR5cGUgSTE4bk1ldGEgPSB7XG4gIGlkPzogc3RyaW5nLFxuICBkZXNjcmlwdGlvbj86IHN0cmluZyxcbiAgbWVhbmluZz86IHN0cmluZ1xufTtcblxuZnVuY3Rpb24gaTE4blRyYW5zbGF0aW9uVG9EZWNsU3RtdChcbiAgICB2YXJpYWJsZTogby5SZWFkVmFyRXhwciwgbWVzc2FnZTogc3RyaW5nLFxuICAgIHBhcmFtcz86IHtbbmFtZTogc3RyaW5nXTogby5FeHByZXNzaW9ufSk6IG8uRGVjbGFyZVZhclN0bXQge1xuICBjb25zdCBhcmdzID0gW28ubGl0ZXJhbChtZXNzYWdlKSBhcyBvLkV4cHJlc3Npb25dO1xuICBpZiAocGFyYW1zICYmIE9iamVjdC5rZXlzKHBhcmFtcykubGVuZ3RoKSB7XG4gICAgYXJncy5wdXNoKG1hcExpdGVyYWwocGFyYW1zLCB0cnVlKSk7XG4gIH1cbiAgY29uc3QgZm5DYWxsID0gby52YXJpYWJsZShHT09HX0dFVF9NU0cpLmNhbGxGbihhcmdzKTtcbiAgcmV0dXJuIHZhcmlhYmxlLnNldChmbkNhbGwpLnRvRGVjbFN0bXQoby5JTkZFUlJFRF9UWVBFLCBbby5TdG10TW9kaWZpZXIuRmluYWxdKTtcbn1cblxuLy8gQ29udmVydHMgaTE4biBtZXRhIGluZm9ybWF0aW9ucyBmb3IgYSBtZXNzYWdlIChpZCwgZGVzY3JpcHRpb24sIG1lYW5pbmcpXG4vLyB0byBhIEpzRG9jIHN0YXRlbWVudCBmb3JtYXR0ZWQgYXMgZXhwZWN0ZWQgYnkgdGhlIENsb3N1cmUgY29tcGlsZXIuXG5mdW5jdGlvbiBpMThuTWV0YVRvRG9jU3RtdChtZXRhOiBJMThuTWV0YSk6IG8uSlNEb2NDb21tZW50U3RtdHxudWxsIHtcbiAgY29uc3QgdGFnczogby5KU0RvY1RhZ1tdID0gW107XG4gIGlmIChtZXRhLmRlc2NyaXB0aW9uKSB7XG4gICAgdGFncy5wdXNoKHt0YWdOYW1lOiBvLkpTRG9jVGFnTmFtZS5EZXNjLCB0ZXh0OiBtZXRhLmRlc2NyaXB0aW9ufSk7XG4gIH1cbiAgaWYgKG1ldGEubWVhbmluZykge1xuICAgIHRhZ3MucHVzaCh7dGFnTmFtZTogby5KU0RvY1RhZ05hbWUuTWVhbmluZywgdGV4dDogbWV0YS5tZWFuaW5nfSk7XG4gIH1cbiAgcmV0dXJuIHRhZ3MubGVuZ3RoID09IDAgPyBudWxsIDogbmV3IG8uSlNEb2NDb21tZW50U3RtdCh0YWdzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzSTE4bkF0dHJpYnV0ZShuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIG5hbWUgPT09IEkxOE5fQVRUUiB8fCBuYW1lLnN0YXJ0c1dpdGgoSTE4Tl9BVFRSX1BSRUZJWCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0kxOG5Sb290Tm9kZShtZXRhPzogaTE4bi5BU1QpOiBtZXRhIGlzIGkxOG4uTWVzc2FnZSB7XG4gIHJldHVybiBtZXRhIGluc3RhbmNlb2YgaTE4bi5NZXNzYWdlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNTaW5nbGVJMThuSWN1KG1ldGE/OiBpMThuLkFTVCk6IGJvb2xlYW4ge1xuICByZXR1cm4gaXNJMThuUm9vdE5vZGUobWV0YSkgJiYgbWV0YS5ub2Rlcy5sZW5ndGggPT09IDEgJiYgbWV0YS5ub2Rlc1swXSBpbnN0YW5jZW9mIGkxOG4uSWN1O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFzSTE4bkF0dHJzKGVsZW1lbnQ6IGh0bWwuRWxlbWVudCk6IGJvb2xlYW4ge1xuICByZXR1cm4gZWxlbWVudC5hdHRycy5zb21lKChhdHRyOiBodG1sLkF0dHJpYnV0ZSkgPT4gaXNJMThuQXR0cmlidXRlKGF0dHIubmFtZSkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWV0YUZyb21JMThuTWVzc2FnZShtZXNzYWdlOiBpMThuLk1lc3NhZ2UsIGlkOiBzdHJpbmcgfCBudWxsID0gbnVsbCk6IEkxOG5NZXRhIHtcbiAgcmV0dXJuIHtcbiAgICBpZDogdHlwZW9mIGlkID09PSAnc3RyaW5nJyA/IGlkIDogbWVzc2FnZS5pZCB8fCAnJyxcbiAgICBtZWFuaW5nOiBtZXNzYWdlLm1lYW5pbmcgfHwgJycsXG4gICAgZGVzY3JpcHRpb246IG1lc3NhZ2UuZGVzY3JpcHRpb24gfHwgJydcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGljdUZyb21JMThuTWVzc2FnZShtZXNzYWdlOiBpMThuLk1lc3NhZ2UpIHtcbiAgcmV0dXJuIG1lc3NhZ2Uubm9kZXNbMF0gYXMgaTE4bi5JY3VQbGFjZWhvbGRlcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdyYXBJMThuUGxhY2Vob2xkZXIoY29udGVudDogc3RyaW5nIHwgbnVtYmVyLCBjb250ZXh0SWQ6IG51bWJlciA9IDApOiBzdHJpbmcge1xuICBjb25zdCBibG9ja0lkID0gY29udGV4dElkID4gMCA/IGA6JHtjb250ZXh0SWR9YCA6ICcnO1xuICByZXR1cm4gYCR7STE4Tl9QTEFDRUhPTERFUl9TWU1CT0x9JHtjb250ZW50fSR7YmxvY2tJZH0ke0kxOE5fUExBQ0VIT0xERVJfU1lNQk9MfWA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhc3NlbWJsZUkxOG5Cb3VuZFN0cmluZyhcbiAgICBzdHJpbmdzOiBzdHJpbmdbXSwgYmluZGluZ1N0YXJ0SW5kZXg6IG51bWJlciA9IDAsIGNvbnRleHRJZDogbnVtYmVyID0gMCk6IHN0cmluZyB7XG4gIGlmICghc3RyaW5ncy5sZW5ndGgpIHJldHVybiAnJztcbiAgbGV0IGFjYyA9ICcnO1xuICBjb25zdCBsYXN0SWR4ID0gc3RyaW5ncy5sZW5ndGggLSAxO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGxhc3RJZHg7IGkrKykge1xuICAgIGFjYyArPSBgJHtzdHJpbmdzW2ldfSR7d3JhcEkxOG5QbGFjZWhvbGRlcihiaW5kaW5nU3RhcnRJbmRleCArIGksIGNvbnRleHRJZCl9YDtcbiAgfVxuICBhY2MgKz0gc3RyaW5nc1tsYXN0SWR4XTtcbiAgcmV0dXJuIGFjYztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFNlcU51bWJlckdlbmVyYXRvcihzdGFydHNBdDogbnVtYmVyID0gMCk6ICgpID0+IG51bWJlciB7XG4gIGxldCBjdXJyZW50ID0gc3RhcnRzQXQ7XG4gIHJldHVybiAoKSA9PiBjdXJyZW50Kys7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwbGFjZWhvbGRlcnNUb1BhcmFtcyhwbGFjZWhvbGRlcnM6IE1hcDxzdHJpbmcsIHN0cmluZ1tdPik6XG4gICAge1tuYW1lOiBzdHJpbmddOiBvLkV4cHJlc3Npb259IHtcbiAgY29uc3QgcGFyYW1zOiB7W25hbWU6IHN0cmluZ106IG8uRXhwcmVzc2lvbn0gPSB7fTtcbiAgcGxhY2Vob2xkZXJzLmZvckVhY2goKHZhbHVlczogc3RyaW5nW10sIGtleTogc3RyaW5nKSA9PiB7XG4gICAgcGFyYW1zW2tleV0gPSBvLmxpdGVyYWwodmFsdWVzLmxlbmd0aCA+IDEgPyBgWyR7dmFsdWVzLmpvaW4oJ3wnKX1dYCA6IHZhbHVlc1swXSk7XG4gIH0pO1xuICByZXR1cm4gcGFyYW1zO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlUGxhY2Vob2xkZXJNYXAobWFwOiBNYXA8c3RyaW5nLCBhbnlbXT4sIG5hbWU6IHN0cmluZywgLi4udmFsdWVzOiBhbnlbXSkge1xuICBjb25zdCBjdXJyZW50ID0gbWFwLmdldChuYW1lKSB8fCBbXTtcbiAgY3VycmVudC5wdXNoKC4uLnZhbHVlcyk7XG4gIG1hcC5zZXQobmFtZSwgY3VycmVudCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhc3NlbWJsZUJvdW5kVGV4dFBsYWNlaG9sZGVycyhcbiAgICBtZXRhOiBpMThuLkFTVCwgYmluZGluZ1N0YXJ0SW5kZXg6IG51bWJlciA9IDAsIGNvbnRleHRJZDogbnVtYmVyID0gMCk6IE1hcDxzdHJpbmcsIGFueVtdPiB7XG4gIGNvbnN0IHN0YXJ0SWR4ID0gYmluZGluZ1N0YXJ0SW5kZXg7XG4gIGNvbnN0IHBsYWNlaG9sZGVycyA9IG5ldyBNYXA8c3RyaW5nLCBhbnk+KCk7XG4gIGNvbnN0IG5vZGUgPVxuICAgICAgbWV0YSBpbnN0YW5jZW9mIGkxOG4uTWVzc2FnZSA/IG1ldGEubm9kZXMuZmluZChub2RlID0+IG5vZGUgaW5zdGFuY2VvZiBpMThuLkNvbnRhaW5lcikgOiBtZXRhO1xuICBpZiAobm9kZSkge1xuICAgIChub2RlIGFzIGkxOG4uQ29udGFpbmVyKVxuICAgICAgICAuY2hpbGRyZW4uZmlsdGVyKChjaGlsZDogaTE4bi5Ob2RlKSA9PiBjaGlsZCBpbnN0YW5jZW9mIGkxOG4uUGxhY2Vob2xkZXIpXG4gICAgICAgIC5mb3JFYWNoKChjaGlsZDogaTE4bi5QbGFjZWhvbGRlciwgaWR4OiBudW1iZXIpID0+IHtcbiAgICAgICAgICBjb25zdCBjb250ZW50ID0gd3JhcEkxOG5QbGFjZWhvbGRlcihzdGFydElkeCArIGlkeCwgY29udGV4dElkKTtcbiAgICAgICAgICB1cGRhdGVQbGFjZWhvbGRlck1hcChwbGFjZWhvbGRlcnMsIGNoaWxkLm5hbWUsIGNvbnRlbnQpO1xuICAgICAgICB9KTtcbiAgfVxuICByZXR1cm4gcGxhY2Vob2xkZXJzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmluZEluZGV4KGl0ZW1zOiBhbnlbXSwgY2FsbGJhY2s6IChpdGVtOiBhbnkpID0+IGJvb2xlYW4pOiBudW1iZXIge1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKGNhbGxiYWNrKGl0ZW1zW2ldKSkge1xuICAgICAgcmV0dXJuIGk7XG4gICAgfVxuICB9XG4gIHJldHVybiAtMTtcbn1cblxuLyoqXG4gKiBQYXJzZXMgaTE4biBtZXRhcyBsaWtlOlxuICogIC0gXCJAQGlkXCIsXG4gKiAgLSBcImRlc2NyaXB0aW9uW0BAaWRdXCIsXG4gKiAgLSBcIm1lYW5pbmd8ZGVzY3JpcHRpb25bQEBpZF1cIlxuICogYW5kIHJldHVybnMgYW4gb2JqZWN0IHdpdGggcGFyc2VkIG91dHB1dC5cbiAqXG4gKiBAcGFyYW0gbWV0YSBTdHJpbmcgdGhhdCByZXByZXNlbnRzIGkxOG4gbWV0YVxuICogQHJldHVybnMgT2JqZWN0IHdpdGggaWQsIG1lYW5pbmcgYW5kIGRlc2NyaXB0aW9uIGZpZWxkc1xuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VJMThuTWV0YShtZXRhPzogc3RyaW5nKTogSTE4bk1ldGEge1xuICBsZXQgaWQ6IHN0cmluZ3x1bmRlZmluZWQ7XG4gIGxldCBtZWFuaW5nOiBzdHJpbmd8dW5kZWZpbmVkO1xuICBsZXQgZGVzY3JpcHRpb246IHN0cmluZ3x1bmRlZmluZWQ7XG5cbiAgaWYgKG1ldGEpIHtcbiAgICBjb25zdCBpZEluZGV4ID0gbWV0YS5pbmRleE9mKEkxOE5fSURfU0VQQVJBVE9SKTtcbiAgICBjb25zdCBkZXNjSW5kZXggPSBtZXRhLmluZGV4T2YoSTE4Tl9NRUFOSU5HX1NFUEFSQVRPUik7XG4gICAgbGV0IG1lYW5pbmdBbmREZXNjOiBzdHJpbmc7XG4gICAgW21lYW5pbmdBbmREZXNjLCBpZF0gPVxuICAgICAgICAoaWRJbmRleCA+IC0xKSA/IFttZXRhLnNsaWNlKDAsIGlkSW5kZXgpLCBtZXRhLnNsaWNlKGlkSW5kZXggKyAyKV0gOiBbbWV0YSwgJyddO1xuICAgIFttZWFuaW5nLCBkZXNjcmlwdGlvbl0gPSAoZGVzY0luZGV4ID4gLTEpID9cbiAgICAgICAgW21lYW5pbmdBbmREZXNjLnNsaWNlKDAsIGRlc2NJbmRleCksIG1lYW5pbmdBbmREZXNjLnNsaWNlKGRlc2NJbmRleCArIDEpXSA6XG4gICAgICAgIFsnJywgbWVhbmluZ0FuZERlc2NdO1xuICB9XG5cbiAgcmV0dXJuIHtpZCwgbWVhbmluZywgZGVzY3JpcHRpb259O1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGludGVybmFsIHBsYWNlaG9sZGVyIG5hbWVzIHRvIHB1YmxpYy1mYWNpbmcgZm9ybWF0XG4gKiAoZm9yIGV4YW1wbGUgdG8gdXNlIGluIGdvb2cuZ2V0TXNnIGNhbGwpLlxuICogRXhhbXBsZTogYFNUQVJUX1RBR19ESVZfMWAgaXMgY29udmVydGVkIHRvIGBzdGFydFRhZ0Rpdl8xYC5cbiAqXG4gKiBAcGFyYW0gbmFtZSBUaGUgcGxhY2Vob2xkZXIgbmFtZSB0aGF0IHNob3VsZCBiZSBmb3JtYXR0ZWRcbiAqIEByZXR1cm5zIEZvcm1hdHRlZCBwbGFjZWhvbGRlciBuYW1lXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXRJMThuUGxhY2Vob2xkZXJOYW1lKG5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IGNodW5rcyA9IHRvUHVibGljTmFtZShuYW1lKS5zcGxpdCgnXycpO1xuICBpZiAoY2h1bmtzLmxlbmd0aCA9PT0gMSkge1xuICAgIC8vIGlmIG5vIFwiX1wiIGZvdW5kIC0ganVzdCBsb3dlcmNhc2UgdGhlIHZhbHVlXG4gICAgcmV0dXJuIG5hbWUudG9Mb3dlckNhc2UoKTtcbiAgfVxuICBsZXQgcG9zdGZpeDtcbiAgLy8gZWplY3QgbGFzdCBlbGVtZW50IGlmIGl0J3MgYSBudW1iZXJcbiAgaWYgKC9eXFxkKyQvLnRlc3QoY2h1bmtzW2NodW5rcy5sZW5ndGggLSAxXSkpIHtcbiAgICBwb3N0Zml4ID0gY2h1bmtzLnBvcCgpO1xuICB9XG4gIGxldCByYXcgPSBjaHVua3Muc2hpZnQoKSAhLnRvTG93ZXJDYXNlKCk7XG4gIGlmIChjaHVua3MubGVuZ3RoKSB7XG4gICAgcmF3ICs9IGNodW5rcy5tYXAoYyA9PiBjLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgYy5zbGljZSgxKS50b0xvd2VyQ2FzZSgpKS5qb2luKCcnKTtcbiAgfVxuICByZXR1cm4gcG9zdGZpeCA/IGAke3Jhd31fJHtwb3N0Zml4fWAgOiByYXc7XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgcHJlZml4IGZvciB0cmFuc2xhdGlvbiBjb25zdCBuYW1lLlxuICpcbiAqIEBwYXJhbSBleHRyYSBBZGRpdGlvbmFsIGxvY2FsIHByZWZpeCB0aGF0IHNob3VsZCBiZSBpbmplY3RlZCBpbnRvIHRyYW5zbGF0aW9uIHZhciBuYW1lXG4gKiBAcmV0dXJucyBDb21wbGV0ZSB0cmFuc2xhdGlvbiBjb25zdCBwcmVmaXhcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFRyYW5zbGF0aW9uQ29uc3RQcmVmaXgoZXh0cmE6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBgJHtDTE9TVVJFX1RSQU5TTEFUSU9OX1BSRUZJWH0ke2V4dHJhfWAudG9VcHBlckNhc2UoKTtcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZXMgdHJhbnNsYXRpb24gZGVjbGFyYXRpb24gc3RhdGVtZW50cy5cbiAqXG4gKiBAcGFyYW0gdmFyaWFibGUgVHJhbnNsYXRpb24gdmFsdWUgcmVmZXJlbmNlXG4gKiBAcGFyYW0gbWVzc2FnZSBUZXh0IG1lc3NhZ2UgdG8gYmUgdHJhbnNsYXRlZFxuICogQHBhcmFtIG1ldGEgT2JqZWN0IHRoYXQgY29udGFpbnMgbWV0YSBpbmZvcm1hdGlvbiAoaWQsIG1lYW5pbmcgYW5kIGRlc2NyaXB0aW9uKVxuICogQHBhcmFtIHBhcmFtcyBPYmplY3Qgd2l0aCBwbGFjZWhvbGRlcnMga2V5LXZhbHVlIHBhaXJzXG4gKiBAcGFyYW0gdHJhbnNmb3JtRm4gT3B0aW9uYWwgdHJhbnNmb3JtYXRpb24gKHBvc3QgcHJvY2Vzc2luZykgZnVuY3Rpb24gcmVmZXJlbmNlXG4gKiBAcmV0dXJucyBBcnJheSBvZiBTdGF0ZW1lbnRzIHRoYXQgcmVwcmVzZW50IGEgZ2l2ZW4gdHJhbnNsYXRpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFRyYW5zbGF0aW9uRGVjbFN0bXRzKFxuICAgIHZhcmlhYmxlOiBvLlJlYWRWYXJFeHByLCBtZXNzYWdlOiBzdHJpbmcsIG1ldGE6IEkxOG5NZXRhLFxuICAgIHBhcmFtczoge1tuYW1lOiBzdHJpbmddOiBvLkV4cHJlc3Npb259ID0ge30sXG4gICAgdHJhbnNmb3JtRm4/OiAocmF3OiBvLlJlYWRWYXJFeHByKSA9PiBvLkV4cHJlc3Npb24pOiBvLlN0YXRlbWVudFtdIHtcbiAgY29uc3Qgc3RhdGVtZW50czogby5TdGF0ZW1lbnRbXSA9IFtdO1xuICBjb25zdCBkb2NTdGF0ZW1lbnRzID0gaTE4bk1ldGFUb0RvY1N0bXQobWV0YSk7XG4gIGlmIChkb2NTdGF0ZW1lbnRzKSB7XG4gICAgc3RhdGVtZW50cy5wdXNoKGRvY1N0YXRlbWVudHMpO1xuICB9XG4gIGlmICh0cmFuc2Zvcm1Gbikge1xuICAgIHN0YXRlbWVudHMucHVzaChpMThuVHJhbnNsYXRpb25Ub0RlY2xTdG10KHZhcmlhYmxlLCBtZXNzYWdlLCBwYXJhbXMpKTtcblxuICAgIC8vIENsb3N1cmUgQ29tcGlsZXIgZG9lc24ndCBhbGxvdyBub24tZ29vLmdldE1zZyBjb25zdCBuYW1lcyB0byBzdGFydCB3aXRoIGBNU0dfYCxcbiAgICAvLyBzbyB3ZSB1cGRhdGUgdmFyaWFibGUgbmFtZSBwcmVmaXggaW4gY2FzZSBwb3N0IHByb2Nlc3NpbmcgaXMgcmVxdWlyZWQsIHNvIHdlIGNhblxuICAgIC8vIGFzc2lnbiB0aGUgcmVzdWx0IG9mIHBvc3QtcHJvY2Vzc2luZyBmdW5jdGlvbiB0byB0aGUgdmFyIHRoYXQgc3RhcnRzIHdpdGggYEkxOE5fYFxuICAgIGNvbnN0IHJhdyA9IG8udmFyaWFibGUodmFyaWFibGUubmFtZSAhKTtcbiAgICB2YXJpYWJsZS5uYW1lID0gdmFyaWFibGUubmFtZSAhLnJlcGxhY2UoQ0xPU1VSRV9UUkFOU0xBVElPTl9NQVRDSEVSX1JFR0VYUCwgVFJBTlNMQVRJT05fUFJFRklYKTtcblxuICAgIHN0YXRlbWVudHMucHVzaChcbiAgICAgICAgdmFyaWFibGUuc2V0KHRyYW5zZm9ybUZuKHJhdykpLnRvRGVjbFN0bXQoby5JTkZFUlJFRF9UWVBFLCBbby5TdG10TW9kaWZpZXIuRmluYWxdKSk7XG4gIH0gZWxzZSB7XG4gICAgc3RhdGVtZW50cy5wdXNoKGkxOG5UcmFuc2xhdGlvblRvRGVjbFN0bXQodmFyaWFibGUsIG1lc3NhZ2UsIHBhcmFtcykpO1xuICB9XG4gIHJldHVybiBzdGF0ZW1lbnRzO1xufSJdfQ==