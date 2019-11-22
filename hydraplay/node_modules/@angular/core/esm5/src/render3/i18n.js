/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { SRCSET_ATTRS, URI_ATTRS, VALID_ATTRS, VALID_ELEMENTS, getTemplateContent } from '../sanitization/html_sanitizer';
import { InertBodyHelper } from '../sanitization/inert_body';
import { _sanitizeUrl, sanitizeSrcset } from '../sanitization/url_sanitizer';
import { assertDefined, assertEqual, assertGreaterThan } from './assert';
import { attachPatchData } from './context_discovery';
import { allocExpando, createNodeAtIndex, elementAttribute, load, textBinding } from './instructions';
import { NATIVE, RENDER_PARENT } from './interfaces/container';
import { COMMENT_MARKER, ELEMENT_MARKER } from './interfaces/i18n';
import { BINDING_INDEX, HEADER_OFFSET, HOST_NODE, RENDERER, TVIEW } from './interfaces/view';
import { appendChild, createTextNode, removeChild } from './node_manipulation';
import { getIsParent, getLView, getPreviousOrParentTNode, setIsParent, setPreviousOrParentTNode } from './state';
import { NO_CHANGE } from './tokens';
import { addAllToArray, getNativeByIndex, getNativeByTNode, getTNode, isLContainer, stringify } from './util';
var MARKER = "\uFFFD";
var ICU_BLOCK_REGEX = /^\s*(�\d+:?\d*�)\s*,\s*(select|plural)\s*,/;
var SUBTEMPLATE_REGEXP = /�\/?\*(\d+:\d+)�/gi;
var PH_REGEXP = /�(\/?[#*]\d+):?\d*�/gi;
var BINDING_REGEXP = /�(\d+):?\d*�/gi;
var ICU_REGEXP = /({\s*�\d+:?\d*�\s*,\s*\S{6}\s*,[\s\S]*})/gi;
// i18nPostproocess regexps
var PP_PLACEHOLDERS = /\[(�.+?�?)\]/g;
var PP_ICU_VARS = /({\s*)(VAR_(PLURAL|SELECT)(_\d+)?)(\s*,)/g;
var PP_ICUS = /�I18N_EXP_(ICU(_\d+)?)�/g;
/**
 * Breaks pattern into strings and top level {...} blocks.
 * Can be used to break a message into text and ICU expressions, or to break an ICU expression into
 * keys and cases.
 * Original code from closure library, modified for Angular.
 *
 * @param pattern (sub)Pattern to be broken.
 *
 */
function extractParts(pattern) {
    if (!pattern) {
        return [];
    }
    var prevPos = 0;
    var braceStack = [];
    var results = [];
    var braces = /[{}]/g;
    // lastIndex doesn't get set to 0 so we have to.
    braces.lastIndex = 0;
    var match;
    while (match = braces.exec(pattern)) {
        var pos = match.index;
        if (match[0] == '}') {
            braceStack.pop();
            if (braceStack.length == 0) {
                // End of the block.
                var block = pattern.substring(prevPos, pos);
                if (ICU_BLOCK_REGEX.test(block)) {
                    results.push(parseICUBlock(block));
                }
                else if (block) { // Don't push empty strings
                    results.push(block);
                }
                prevPos = pos + 1;
            }
        }
        else {
            if (braceStack.length == 0) {
                var substring_1 = pattern.substring(prevPos, pos);
                results.push(substring_1);
                prevPos = pos + 1;
            }
            braceStack.push('{');
        }
    }
    var substring = pattern.substring(prevPos);
    if (substring != '') {
        results.push(substring);
    }
    return results;
}
/**
 * Parses text containing an ICU expression and produces a JSON object for it.
 * Original code from closure library, modified for Angular.
 *
 * @param pattern Text containing an ICU expression that needs to be parsed.
 *
 */
function parseICUBlock(pattern) {
    var cases = [];
    var values = [];
    var icuType = 1 /* plural */;
    var mainBinding = 0;
    pattern = pattern.replace(ICU_BLOCK_REGEX, function (str, binding, type) {
        if (type === 'select') {
            icuType = 0 /* select */;
        }
        else {
            icuType = 1 /* plural */;
        }
        mainBinding = parseInt(binding.substr(1), 10);
        return '';
    });
    var parts = extractParts(pattern);
    // Looking for (key block)+ sequence. One of the keys has to be "other".
    for (var pos = 0; pos < parts.length;) {
        var key = parts[pos++].trim();
        if (icuType === 1 /* plural */) {
            // Key can be "=x", we just want "x"
            key = key.replace(/\s*(?:=)?(\w+)\s*/, '$1');
        }
        if (key.length) {
            cases.push(key);
        }
        var blocks = extractParts(parts[pos++]);
        if (blocks.length) {
            values.push(blocks);
        }
    }
    assertGreaterThan(cases.indexOf('other'), -1, 'Missing key "other" in ICU statement.');
    // TODO(ocombe): support ICU expressions in attributes, see #21615
    return { type: icuType, mainBinding: mainBinding, cases: cases, values: values };
}
/**
 * Removes everything inside the sub-templates of a message.
 */
function removeInnerTemplateTranslation(message) {
    var match;
    var res = '';
    var index = 0;
    var inTemplate = false;
    var tagMatched;
    while ((match = SUBTEMPLATE_REGEXP.exec(message)) !== null) {
        if (!inTemplate) {
            res += message.substring(index, match.index + match[0].length);
            tagMatched = match[1];
            inTemplate = true;
        }
        else {
            if (match[0] === MARKER + "/*" + tagMatched + MARKER) {
                index = match.index;
                inTemplate = false;
            }
        }
    }
    ngDevMode &&
        assertEqual(inTemplate, false, "Tag mismatch: unable to find the end of the sub-template in the translation \"" + message + "\"");
    res += message.substr(index);
    return res;
}
/**
 * Extracts a part of a message and removes the rest.
 *
 * This method is used for extracting a part of the message associated with a template. A translated
 * message can span multiple templates.
 *
 * Example:
 * ```
 * <div i18n>Translate <span *ngIf>me</span>!</div>
 * ```
 *
 * @param message The message to crop
 * @param subTemplateIndex Index of the sub-template to extract. If undefined it returns the
 * external template and removes all sub-templates.
 */
export function getTranslationForTemplate(message, subTemplateIndex) {
    if (typeof subTemplateIndex !== 'number') {
        // We want the root template message, ignore all sub-templates
        return removeInnerTemplateTranslation(message);
    }
    else {
        // We want a specific sub-template
        var start = message.indexOf(":" + subTemplateIndex + MARKER) + 2 + subTemplateIndex.toString().length;
        var end = message.search(new RegExp(MARKER + "\\/\\*\\d+:" + subTemplateIndex + MARKER));
        return removeInnerTemplateTranslation(message.substring(start, end));
    }
}
/**
 * Generate the OpCodes to update the bindings of a string.
 *
 * @param str The string containing the bindings.
 * @param destinationNode Index of the destination node which will receive the binding.
 * @param attrName Name of the attribute, if the string belongs to an attribute.
 * @param sanitizeFn Sanitization function used to sanitize the string after update, if necessary.
 */
function generateBindingUpdateOpCodes(str, destinationNode, attrName, sanitizeFn) {
    if (sanitizeFn === void 0) { sanitizeFn = null; }
    var updateOpCodes = [null, null]; // Alloc space for mask and size
    var textParts = str.split(BINDING_REGEXP);
    var mask = 0;
    for (var j = 0; j < textParts.length; j++) {
        var textValue = textParts[j];
        if (j & 1) {
            // Odd indexes are bindings
            var bindingIndex = parseInt(textValue, 10);
            updateOpCodes.push(-1 - bindingIndex);
            mask = mask | toMaskBit(bindingIndex);
        }
        else if (textValue !== '') {
            // Even indexes are text
            updateOpCodes.push(textValue);
        }
    }
    updateOpCodes.push(destinationNode << 2 /* SHIFT_REF */ |
        (attrName ? 1 /* Attr */ : 0 /* Text */));
    if (attrName) {
        updateOpCodes.push(attrName, sanitizeFn);
    }
    updateOpCodes[0] = mask;
    updateOpCodes[1] = updateOpCodes.length - 2;
    return updateOpCodes;
}
function getBindingMask(icuExpression, mask) {
    if (mask === void 0) { mask = 0; }
    mask = mask | toMaskBit(icuExpression.mainBinding);
    var match;
    for (var i = 0; i < icuExpression.values.length; i++) {
        var valueArr = icuExpression.values[i];
        for (var j = 0; j < valueArr.length; j++) {
            var value = valueArr[j];
            if (typeof value === 'string') {
                while (match = BINDING_REGEXP.exec(value)) {
                    mask = mask | toMaskBit(parseInt(match[1], 10));
                }
            }
            else {
                mask = getBindingMask(value, mask);
            }
        }
    }
    return mask;
}
var i18nIndexStack = [];
var i18nIndexStackPointer = -1;
/**
 * Convert binding index to mask bit.
 *
 * Each index represents a single bit on the bit-mask. Because bit-mask only has 32 bits, we make
 * the 32nd bit share all masks for all bindings higher than 32. Since it is extremely rare to have
 * more than 32 bindings this will be hit very rarely. The downside of hitting this corner case is
 * that we will execute binding code more often than necessary. (penalty of performance)
 */
function toMaskBit(bindingIndex) {
    return 1 << Math.min(bindingIndex, 31);
}
var parentIndexStack = [];
/**
 * Marks a block of text as translatable.
 *
 * The instructions `i18nStart` and `i18nEnd` mark the translation block in the template.
 * The translation `message` is the value which is locale specific. The translation string may
 * contain placeholders which associate inner elements and sub-templates within the translation.
 *
 * The translation `message` placeholders are:
 * - `�{index}(:{block})�`: *Binding Placeholder*: Marks a location where an expression will be
 *   interpolated into. The placeholder `index` points to the expression binding index. An optional
 *   `block` that matches the sub-template in which it was declared.
 * - `�#{index}(:{block})�`/`�/#{index}(:{block})�`: *Element Placeholder*:  Marks the beginning
 *   and end of DOM element that were embedded in the original translation block. The placeholder
 *   `index` points to the element index in the template instructions set. An optional `block` that
 *   matches the sub-template in which it was declared.
 * - `�*{index}:{block}�`/`�/*{index}:{block}�`: *Sub-template Placeholder*: Sub-templates must be
 *   split up and translated separately in each angular template function. The `index` points to the
 *   `template` instruction index. A `block` that matches the sub-template in which it was declared.
 *
 * @param index A unique index of the translation in the static block.
 * @param message The translation message.
 * @param subTemplateIndex Optional sub-template index in the `message`.
 */
export function i18nStart(index, message, subTemplateIndex) {
    var tView = getLView()[TVIEW];
    ngDevMode && assertDefined(tView, "tView should be defined");
    i18nIndexStack[++i18nIndexStackPointer] = index;
    if (tView.firstTemplatePass && tView.data[index + HEADER_OFFSET] === null) {
        i18nStartFirstPass(tView, index, message, subTemplateIndex);
    }
}
/**
 * See `i18nStart` above.
 */
function i18nStartFirstPass(tView, index, message, subTemplateIndex) {
    var viewData = getLView();
    var expandoStartIndex = tView.blueprint.length - HEADER_OFFSET;
    var previousOrParentTNode = getPreviousOrParentTNode();
    var parentTNode = getIsParent() ? getPreviousOrParentTNode() :
        previousOrParentTNode && previousOrParentTNode.parent;
    var parentIndex = parentTNode && parentTNode !== viewData[HOST_NODE] ?
        parentTNode.index - HEADER_OFFSET :
        index;
    var parentIndexPointer = 0;
    parentIndexStack[parentIndexPointer] = parentIndex;
    var createOpCodes = [];
    // If the previous node wasn't the direct parent then we have a translation without top level
    // element and we need to keep a reference of the previous element if there is one
    if (index > 0 && previousOrParentTNode !== parentTNode) {
        // Create an OpCode to select the previous TNode
        createOpCodes.push(previousOrParentTNode.index << 3 /* SHIFT_REF */ | 0 /* Select */);
    }
    var updateOpCodes = [];
    var icuExpressions = [];
    var templateTranslation = getTranslationForTemplate(message, subTemplateIndex);
    var msgParts = templateTranslation.split(PH_REGEXP);
    for (var i = 0; i < msgParts.length; i++) {
        var value = msgParts[i];
        if (i & 1) {
            // Odd indexes are placeholders (elements and sub-templates)
            if (value.charAt(0) === '/') {
                // It is a closing tag
                if (value.charAt(1) === '#') {
                    var phIndex = parseInt(value.substr(2), 10);
                    parentIndex = parentIndexStack[--parentIndexPointer];
                    createOpCodes.push(phIndex << 3 /* SHIFT_REF */ | 5 /* ElementEnd */);
                }
            }
            else {
                var phIndex = parseInt(value.substr(1), 10);
                // The value represents a placeholder that we move to the designated index
                createOpCodes.push(phIndex << 3 /* SHIFT_REF */ | 0 /* Select */, parentIndex << 17 /* SHIFT_PARENT */ | 1 /* AppendChild */);
                if (value.charAt(0) === '#') {
                    parentIndexStack[++parentIndexPointer] = parentIndex = phIndex;
                }
            }
        }
        else {
            // Even indexes are text (including bindings & ICU expressions)
            var parts = value.split(ICU_REGEXP);
            for (var j = 0; j < parts.length; j++) {
                value = parts[j];
                if (j & 1) {
                    // Odd indexes are ICU expressions
                    // Create the comment node that will anchor the ICU expression
                    allocExpando(viewData);
                    var icuNodeIndex = tView.blueprint.length - 1 - HEADER_OFFSET;
                    createOpCodes.push(COMMENT_MARKER, ngDevMode ? "ICU " + icuNodeIndex : '', parentIndex << 17 /* SHIFT_PARENT */ | 1 /* AppendChild */);
                    // Update codes for the ICU expression
                    var icuExpression = parseICUBlock(value.substr(1, value.length - 2));
                    var mask = getBindingMask(icuExpression);
                    icuStart(icuExpressions, icuExpression, icuNodeIndex, icuNodeIndex);
                    // Since this is recursive, the last TIcu that was pushed is the one we want
                    var tIcuIndex = icuExpressions.length - 1;
                    updateOpCodes.push(toMaskBit(icuExpression.mainBinding), // mask of the main binding
                    3, // skip 3 opCodes if not changed
                    -1 - icuExpression.mainBinding, icuNodeIndex << 2 /* SHIFT_REF */ | 2 /* IcuSwitch */, tIcuIndex, mask, // mask of all the bindings of this ICU expression
                    2, // skip 2 opCodes if not changed
                    icuNodeIndex << 2 /* SHIFT_REF */ | 3 /* IcuUpdate */, tIcuIndex);
                }
                else if (value !== '') {
                    // Even indexes are text (including bindings)
                    var hasBinding = value.match(BINDING_REGEXP);
                    // Create text nodes
                    allocExpando(viewData);
                    createOpCodes.push(
                    // If there is a binding, the value will be set during update
                    hasBinding ? '' : value, parentIndex << 17 /* SHIFT_PARENT */ | 1 /* AppendChild */);
                    if (hasBinding) {
                        addAllToArray(generateBindingUpdateOpCodes(value, tView.blueprint.length - 1 - HEADER_OFFSET), updateOpCodes);
                    }
                }
            }
        }
    }
    // NOTE: local var needed to properly assert the type of `TI18n`.
    var tI18n = {
        vars: tView.blueprint.length - HEADER_OFFSET - expandoStartIndex,
        expandoStartIndex: expandoStartIndex,
        create: createOpCodes,
        update: updateOpCodes,
        icus: icuExpressions.length ? icuExpressions : null,
    };
    tView.data[index + HEADER_OFFSET] = tI18n;
}
function appendI18nNode(tNode, parentTNode, previousTNode) {
    ngDevMode && ngDevMode.rendererMoveNode++;
    var viewData = getLView();
    if (!previousTNode) {
        previousTNode = parentTNode;
    }
    // re-organize node tree to put this node in the correct position.
    if (previousTNode === parentTNode && tNode !== parentTNode.child) {
        tNode.next = parentTNode.child;
        parentTNode.child = tNode;
    }
    else if (previousTNode !== parentTNode && tNode !== previousTNode.next) {
        tNode.next = previousTNode.next;
        previousTNode.next = tNode;
    }
    else {
        tNode.next = null;
    }
    if (parentTNode !== viewData[HOST_NODE]) {
        tNode.parent = parentTNode;
    }
    appendChild(getNativeByTNode(tNode, viewData), tNode, viewData);
    var slotValue = viewData[tNode.index];
    if (tNode.type !== 0 /* Container */ && isLContainer(slotValue)) {
        // Nodes that inject ViewContainerRef also have a comment node that should be moved
        appendChild(slotValue[NATIVE], tNode, viewData);
    }
    return tNode;
}
/**
 * Handles message string post-processing for internationalization.
 *
 * Handles message string post-processing by transforming it from intermediate
 * format (that might contain some markers that we need to replace) to the final
 * form, consumable by i18nStart instruction. Post processing steps include:
 *
 * 1. Resolve all multi-value cases (like [�*1:1��#2:1�|�#4:1�|�5�])
 * 2. Replace all ICU vars (like "VAR_PLURAL")
 * 3. Replace all ICU references with corresponding values (like �ICU_EXP_ICU_1�)
 *    in case multiple ICUs have the same placeholder name
 *
 * @param message Raw translation string for post processing
 * @param replacements Set of replacements that should be applied
 *
 * @returns Transformed string that can be consumed by i18nStart instruction
 *
 * @publicAPI
 */
export function i18nPostprocess(message, replacements) {
    //
    // Step 1: resolve all multi-value cases (like [�*1:1��#2:1�|�#4:1�|�5�])
    //
    var matches = {};
    var result = message.replace(PP_PLACEHOLDERS, function (_match, content) {
        if (!matches[content]) {
            matches[content] = content.split('|');
        }
        if (!matches[content].length) {
            throw new Error("i18n postprocess: unmatched placeholder - " + content);
        }
        return matches[content].shift();
    });
    // verify that we injected all values
    var hasUnmatchedValues = Object.keys(matches).some(function (key) { return !!matches[key].length; });
    if (hasUnmatchedValues) {
        throw new Error("i18n postprocess: unmatched values - " + JSON.stringify(matches));
    }
    // return current result if no replacements specified
    if (!Object.keys(replacements).length) {
        return result;
    }
    //
    // Step 2: replace all ICU vars (like "VAR_PLURAL")
    //
    result = result.replace(PP_ICU_VARS, function (match, start, key, _type, _idx, end) {
        return replacements.hasOwnProperty(key) ? "" + start + replacements[key] + end : match;
    });
    //
    // Step 3: replace all ICU references with corresponding values (like �ICU_EXP_ICU_1�)
    // in case multiple ICUs have the same placeholder name
    //
    result = result.replace(PP_ICUS, function (match, key) {
        if (replacements.hasOwnProperty(key)) {
            var list = replacements[key];
            if (!list.length) {
                throw new Error("i18n postprocess: unmatched ICU - " + match + " with key: " + key);
            }
            return list.shift();
        }
        return match;
    });
    return result;
}
/**
 * Translates a translation block marked by `i18nStart` and `i18nEnd`. It inserts the text/ICU nodes
 * into the render tree, moves the placeholder nodes and removes the deleted nodes.
 */
export function i18nEnd() {
    var tView = getLView()[TVIEW];
    ngDevMode && assertDefined(tView, "tView should be defined");
    i18nEndFirstPass(tView);
}
/**
 * See `i18nEnd` above.
 */
function i18nEndFirstPass(tView) {
    var viewData = getLView();
    ngDevMode && assertEqual(viewData[BINDING_INDEX], viewData[TVIEW].bindingStartIndex, 'i18nEnd should be called before any binding');
    var rootIndex = i18nIndexStack[i18nIndexStackPointer--];
    var tI18n = tView.data[rootIndex + HEADER_OFFSET];
    ngDevMode && assertDefined(tI18n, "You should call i18nStart before i18nEnd");
    // The last placeholder that was added before `i18nEnd`
    var previousOrParentTNode = getPreviousOrParentTNode();
    var visitedPlaceholders = readCreateOpCodes(rootIndex, tI18n.create, tI18n.expandoStartIndex, viewData);
    // Remove deleted placeholders
    // The last placeholder that was added before `i18nEnd` is `previousOrParentTNode`
    for (var i = rootIndex + 1; i <= previousOrParentTNode.index - HEADER_OFFSET; i++) {
        if (visitedPlaceholders.indexOf(i) === -1) {
            removeNode(i, viewData);
        }
    }
}
function readCreateOpCodes(index, createOpCodes, expandoStartIndex, viewData) {
    var renderer = getLView()[RENDERER];
    var currentTNode = null;
    var previousTNode = null;
    var visitedPlaceholders = [];
    for (var i = 0; i < createOpCodes.length; i++) {
        var opCode = createOpCodes[i];
        if (typeof opCode == 'string') {
            var textRNode = createTextNode(opCode, renderer);
            ngDevMode && ngDevMode.rendererCreateTextNode++;
            previousTNode = currentTNode;
            currentTNode =
                createNodeAtIndex(expandoStartIndex++, 3 /* Element */, textRNode, null, null);
            setIsParent(false);
        }
        else if (typeof opCode == 'number') {
            switch (opCode & 7 /* MASK_OPCODE */) {
                case 1 /* AppendChild */:
                    var destinationNodeIndex = opCode >>> 17 /* SHIFT_PARENT */;
                    var destinationTNode = void 0;
                    if (destinationNodeIndex === index) {
                        // If the destination node is `i18nStart`, we don't have a
                        // top-level node and we should use the host node instead
                        destinationTNode = viewData[HOST_NODE];
                    }
                    else {
                        destinationTNode = getTNode(destinationNodeIndex, viewData);
                    }
                    ngDevMode &&
                        assertDefined(currentTNode, "You need to create or select a node before you can insert it into the DOM");
                    previousTNode = appendI18nNode(currentTNode, destinationTNode, previousTNode);
                    destinationTNode.next = null;
                    break;
                case 0 /* Select */:
                    var nodeIndex = opCode >>> 3 /* SHIFT_REF */;
                    visitedPlaceholders.push(nodeIndex);
                    previousTNode = currentTNode;
                    currentTNode = getTNode(nodeIndex, viewData);
                    if (currentTNode) {
                        setPreviousOrParentTNode(currentTNode);
                        if (currentTNode.type === 3 /* Element */) {
                            setIsParent(true);
                        }
                    }
                    break;
                case 5 /* ElementEnd */:
                    var elementIndex = opCode >>> 3 /* SHIFT_REF */;
                    previousTNode = currentTNode = getTNode(elementIndex, viewData);
                    setPreviousOrParentTNode(currentTNode);
                    setIsParent(false);
                    break;
                case 4 /* Attr */:
                    var elementNodeIndex = opCode >>> 3 /* SHIFT_REF */;
                    var attrName = createOpCodes[++i];
                    var attrValue = createOpCodes[++i];
                    elementAttribute(elementNodeIndex, attrName, attrValue);
                    break;
                default:
                    throw new Error("Unable to determine the type of mutate operation for \"" + opCode + "\"");
            }
        }
        else {
            switch (opCode) {
                case COMMENT_MARKER:
                    var commentValue = createOpCodes[++i];
                    ngDevMode && assertEqual(typeof commentValue, 'string', "Expected \"" + commentValue + "\" to be a comment node value");
                    var commentRNode = renderer.createComment(commentValue);
                    ngDevMode && ngDevMode.rendererCreateComment++;
                    previousTNode = currentTNode;
                    currentTNode = createNodeAtIndex(expandoStartIndex++, 5 /* IcuContainer */, commentRNode, null, null);
                    attachPatchData(commentRNode, viewData);
                    currentTNode.activeCaseIndex = null;
                    // We will add the case nodes later, during the update phase
                    setIsParent(false);
                    break;
                case ELEMENT_MARKER:
                    var tagNameValue = createOpCodes[++i];
                    ngDevMode && assertEqual(typeof tagNameValue, 'string', "Expected \"" + tagNameValue + "\" to be an element node tag name");
                    var elementRNode = renderer.createElement(tagNameValue);
                    ngDevMode && ngDevMode.rendererCreateElement++;
                    previousTNode = currentTNode;
                    currentTNode = createNodeAtIndex(expandoStartIndex++, 3 /* Element */, elementRNode, tagNameValue, null);
                    break;
                default:
                    throw new Error("Unable to determine the type of mutate operation for \"" + opCode + "\"");
            }
        }
    }
    setIsParent(false);
    return visitedPlaceholders;
}
function readUpdateOpCodes(updateOpCodes, icus, bindingsStartIndex, changeMask, viewData, bypassCheckBit) {
    if (bypassCheckBit === void 0) { bypassCheckBit = false; }
    var caseCreated = false;
    for (var i = 0; i < updateOpCodes.length; i++) {
        // bit code to check if we should apply the next update
        var checkBit = updateOpCodes[i];
        // Number of opCodes to skip until next set of update codes
        var skipCodes = updateOpCodes[++i];
        if (bypassCheckBit || (checkBit & changeMask)) {
            // The value has been updated since last checked
            var value = '';
            for (var j = i + 1; j <= (i + skipCodes); j++) {
                var opCode = updateOpCodes[j];
                if (typeof opCode == 'string') {
                    value += opCode;
                }
                else if (typeof opCode == 'number') {
                    if (opCode < 0) {
                        // It's a binding index whose value is negative
                        value += stringify(viewData[bindingsStartIndex - opCode]);
                    }
                    else {
                        var nodeIndex = opCode >>> 2 /* SHIFT_REF */;
                        var tIcuIndex = void 0;
                        var tIcu = void 0;
                        var icuTNode = void 0;
                        switch (opCode & 3 /* MASK_OPCODE */) {
                            case 1 /* Attr */:
                                var attrName = updateOpCodes[++j];
                                var sanitizeFn = updateOpCodes[++j];
                                elementAttribute(nodeIndex, attrName, value, sanitizeFn);
                                break;
                            case 0 /* Text */:
                                textBinding(nodeIndex, value);
                                break;
                            case 2 /* IcuSwitch */:
                                tIcuIndex = updateOpCodes[++j];
                                tIcu = icus[tIcuIndex];
                                icuTNode = getTNode(nodeIndex, viewData);
                                // If there is an active case, delete the old nodes
                                if (icuTNode.activeCaseIndex !== null) {
                                    var removeCodes = tIcu.remove[icuTNode.activeCaseIndex];
                                    for (var k = 0; k < removeCodes.length; k++) {
                                        var removeOpCode = removeCodes[k];
                                        switch (removeOpCode & 7 /* MASK_OPCODE */) {
                                            case 3 /* Remove */:
                                                var nodeIndex_1 = removeOpCode >>> 3 /* SHIFT_REF */;
                                                removeNode(nodeIndex_1, viewData);
                                                break;
                                            case 6 /* RemoveNestedIcu */:
                                                var nestedIcuNodeIndex = removeCodes[k + 1] >>> 3 /* SHIFT_REF */;
                                                var nestedIcuTNode = getTNode(nestedIcuNodeIndex, viewData);
                                                var activeIndex = nestedIcuTNode.activeCaseIndex;
                                                if (activeIndex !== null) {
                                                    var nestedIcuTIndex = removeOpCode >>> 3 /* SHIFT_REF */;
                                                    var nestedTIcu = icus[nestedIcuTIndex];
                                                    addAllToArray(nestedTIcu.remove[activeIndex], removeCodes);
                                                }
                                                break;
                                        }
                                    }
                                }
                                // Update the active caseIndex
                                var caseIndex = getCaseIndex(tIcu, value);
                                icuTNode.activeCaseIndex = caseIndex !== -1 ? caseIndex : null;
                                // Add the nodes for the new case
                                readCreateOpCodes(-1, tIcu.create[caseIndex], tIcu.expandoStartIndex, viewData);
                                caseCreated = true;
                                break;
                            case 3 /* IcuUpdate */:
                                tIcuIndex = updateOpCodes[++j];
                                tIcu = icus[tIcuIndex];
                                icuTNode = getTNode(nodeIndex, viewData);
                                readUpdateOpCodes(tIcu.update[icuTNode.activeCaseIndex], icus, bindingsStartIndex, changeMask, viewData, caseCreated);
                                break;
                        }
                    }
                }
            }
        }
        i += skipCodes;
    }
}
function removeNode(index, viewData) {
    var removedPhTNode = getTNode(index, viewData);
    var removedPhRNode = getNativeByIndex(index, viewData);
    removeChild(removedPhTNode, removedPhRNode || null, viewData);
    removedPhTNode.detached = true;
    ngDevMode && ngDevMode.rendererRemoveNode++;
    var slotValue = load(index);
    if (isLContainer(slotValue)) {
        var lContainer = slotValue;
        if (removedPhTNode.type !== 0 /* Container */) {
            removeChild(removedPhTNode, lContainer[NATIVE] || null, viewData);
        }
        lContainer[RENDER_PARENT] = null;
    }
}
/**
 *
 * Use this instruction to create a translation block that doesn't contain any placeholder.
 * It calls both {@link i18nStart} and {@link i18nEnd} in one instruction.
 *
 * The translation `message` is the value which is locale specific. The translation string may
 * contain placeholders which associate inner elements and sub-templates within the translation.
 *
 * The translation `message` placeholders are:
 * - `�{index}(:{block})�`: *Binding Placeholder*: Marks a location where an expression will be
 *   interpolated into. The placeholder `index` points to the expression binding index. An optional
 *   `block` that matches the sub-template in which it was declared.
 * - `�#{index}(:{block})�`/`�/#{index}(:{block})�`: *Element Placeholder*:  Marks the beginning
 *   and end of DOM element that were embedded in the original translation block. The placeholder
 *   `index` points to the element index in the template instructions set. An optional `block` that
 *   matches the sub-template in which it was declared.
 * - `�*{index}:{block}�`/`�/*{index}:{block}�`: *Sub-template Placeholder*: Sub-templates must be
 *   split up and translated separately in each angular template function. The `index` points to the
 *   `template` instruction index. A `block` that matches the sub-template in which it was declared.
 *
 * @param index A unique index of the translation in the static block.
 * @param message The translation message.
 * @param subTemplateIndex Optional sub-template index in the `message`.
 */
export function i18n(index, message, subTemplateIndex) {
    i18nStart(index, message, subTemplateIndex);
    i18nEnd();
}
/**
 * Marks a list of attributes as translatable.
 *
 * @param index A unique index in the static block
 * @param values
 */
export function i18nAttributes(index, values) {
    var tView = getLView()[TVIEW];
    ngDevMode && assertDefined(tView, "tView should be defined");
    ngDevMode &&
        assertEqual(tView.firstTemplatePass, true, "You should only call i18nEnd on first template pass");
    if (tView.firstTemplatePass && tView.data[index + HEADER_OFFSET] === null) {
        i18nAttributesFirstPass(tView, index, values);
    }
}
/**
 * See `i18nAttributes` above.
 */
function i18nAttributesFirstPass(tView, index, values) {
    var previousElement = getPreviousOrParentTNode();
    var previousElementIndex = previousElement.index - HEADER_OFFSET;
    var updateOpCodes = [];
    for (var i = 0; i < values.length; i += 2) {
        var attrName = values[i];
        var message = values[i + 1];
        var parts = message.split(ICU_REGEXP);
        for (var j = 0; j < parts.length; j++) {
            var value = parts[j];
            if (j & 1) {
                // Odd indexes are ICU expressions
                // TODO(ocombe): support ICU expressions in attributes
            }
            else if (value !== '') {
                // Even indexes are text (including bindings)
                var hasBinding = !!value.match(BINDING_REGEXP);
                if (hasBinding) {
                    addAllToArray(generateBindingUpdateOpCodes(value, previousElementIndex, attrName), updateOpCodes);
                }
                else {
                    elementAttribute(previousElementIndex, attrName, value);
                }
            }
        }
    }
    tView.data[index + HEADER_OFFSET] = updateOpCodes;
}
var changeMask = 0;
var shiftsCounter = 0;
/**
 * Stores the values of the bindings during each update cycle in order to determine if we need to
 * update the translated nodes.
 *
 * @param expression The binding's new value or NO_CHANGE
 */
export function i18nExp(expression) {
    if (expression !== NO_CHANGE) {
        changeMask = changeMask | (1 << shiftsCounter);
    }
    shiftsCounter++;
}
/**
 * Updates a translation block or an i18n attribute when the bindings have changed.
 *
 * @param index Index of either {@link i18nStart} (translation block) or {@link i18nAttributes}
 * (i18n attribute) on which it should update the content.
 */
export function i18nApply(index) {
    if (shiftsCounter) {
        var lView = getLView();
        var tView = lView[TVIEW];
        ngDevMode && assertDefined(tView, "tView should be defined");
        var tI18n = tView.data[index + HEADER_OFFSET];
        var updateOpCodes = void 0;
        var icus = null;
        if (Array.isArray(tI18n)) {
            updateOpCodes = tI18n;
        }
        else {
            updateOpCodes = tI18n.update;
            icus = tI18n.icus;
        }
        var bindingsStartIndex = lView[BINDING_INDEX] - shiftsCounter - 1;
        readUpdateOpCodes(updateOpCodes, icus, bindingsStartIndex, changeMask, lView);
        // Reset changeMask & maskBit to default for the next update cycle
        changeMask = 0;
        shiftsCounter = 0;
    }
}
var Plural;
(function (Plural) {
    Plural[Plural["Zero"] = 0] = "Zero";
    Plural[Plural["One"] = 1] = "One";
    Plural[Plural["Two"] = 2] = "Two";
    Plural[Plural["Few"] = 3] = "Few";
    Plural[Plural["Many"] = 4] = "Many";
    Plural[Plural["Other"] = 5] = "Other";
})(Plural || (Plural = {}));
/**
 * Returns the plural case based on the locale.
 * This is a copy of the deprecated function that we used in Angular v4.
 * // TODO(ocombe): remove this once we can the real getPluralCase function
 *
 * @deprecated from v5 the plural case function is in locale data files common/locales/*.ts
 */
function getPluralCase(locale, nLike) {
    if (typeof nLike === 'string') {
        nLike = parseInt(nLike, 10);
    }
    var n = nLike;
    var nDecimal = n.toString().replace(/^[^.]*\.?/, '');
    var i = Math.floor(Math.abs(n));
    var v = nDecimal.length;
    var f = parseInt(nDecimal, 10);
    var t = parseInt(n.toString().replace(/^[^.]*\.?|0+$/g, ''), 10) || 0;
    var lang = locale.split('-')[0].toLowerCase();
    switch (lang) {
        case 'af':
        case 'asa':
        case 'az':
        case 'bem':
        case 'bez':
        case 'bg':
        case 'brx':
        case 'ce':
        case 'cgg':
        case 'chr':
        case 'ckb':
        case 'ee':
        case 'el':
        case 'eo':
        case 'es':
        case 'eu':
        case 'fo':
        case 'fur':
        case 'gsw':
        case 'ha':
        case 'haw':
        case 'hu':
        case 'jgo':
        case 'jmc':
        case 'ka':
        case 'kk':
        case 'kkj':
        case 'kl':
        case 'ks':
        case 'ksb':
        case 'ky':
        case 'lb':
        case 'lg':
        case 'mas':
        case 'mgo':
        case 'ml':
        case 'mn':
        case 'nb':
        case 'nd':
        case 'ne':
        case 'nn':
        case 'nnh':
        case 'nyn':
        case 'om':
        case 'or':
        case 'os':
        case 'ps':
        case 'rm':
        case 'rof':
        case 'rwk':
        case 'saq':
        case 'seh':
        case 'sn':
        case 'so':
        case 'sq':
        case 'ta':
        case 'te':
        case 'teo':
        case 'tk':
        case 'tr':
        case 'ug':
        case 'uz':
        case 'vo':
        case 'vun':
        case 'wae':
        case 'xog':
            if (n === 1)
                return Plural.One;
            return Plural.Other;
        case 'ak':
        case 'ln':
        case 'mg':
        case 'pa':
        case 'ti':
            if (n === Math.floor(n) && n >= 0 && n <= 1)
                return Plural.One;
            return Plural.Other;
        case 'am':
        case 'as':
        case 'bn':
        case 'fa':
        case 'gu':
        case 'hi':
        case 'kn':
        case 'mr':
        case 'zu':
            if (i === 0 || n === 1)
                return Plural.One;
            return Plural.Other;
        case 'ar':
            if (n === 0)
                return Plural.Zero;
            if (n === 1)
                return Plural.One;
            if (n === 2)
                return Plural.Two;
            if (n % 100 === Math.floor(n % 100) && n % 100 >= 3 && n % 100 <= 10)
                return Plural.Few;
            if (n % 100 === Math.floor(n % 100) && n % 100 >= 11 && n % 100 <= 99)
                return Plural.Many;
            return Plural.Other;
        case 'ast':
        case 'ca':
        case 'de':
        case 'en':
        case 'et':
        case 'fi':
        case 'fy':
        case 'gl':
        case 'it':
        case 'nl':
        case 'sv':
        case 'sw':
        case 'ur':
        case 'yi':
            if (i === 1 && v === 0)
                return Plural.One;
            return Plural.Other;
        case 'be':
            if (n % 10 === 1 && !(n % 100 === 11))
                return Plural.One;
            if (n % 10 === Math.floor(n % 10) && n % 10 >= 2 && n % 10 <= 4 &&
                !(n % 100 >= 12 && n % 100 <= 14))
                return Plural.Few;
            if (n % 10 === 0 || n % 10 === Math.floor(n % 10) && n % 10 >= 5 && n % 10 <= 9 ||
                n % 100 === Math.floor(n % 100) && n % 100 >= 11 && n % 100 <= 14)
                return Plural.Many;
            return Plural.Other;
        case 'br':
            if (n % 10 === 1 && !(n % 100 === 11 || n % 100 === 71 || n % 100 === 91))
                return Plural.One;
            if (n % 10 === 2 && !(n % 100 === 12 || n % 100 === 72 || n % 100 === 92))
                return Plural.Two;
            if (n % 10 === Math.floor(n % 10) && (n % 10 >= 3 && n % 10 <= 4 || n % 10 === 9) &&
                !(n % 100 >= 10 && n % 100 <= 19 || n % 100 >= 70 && n % 100 <= 79 ||
                    n % 100 >= 90 && n % 100 <= 99))
                return Plural.Few;
            if (!(n === 0) && n % 1e6 === 0)
                return Plural.Many;
            return Plural.Other;
        case 'bs':
        case 'hr':
        case 'sr':
            if (v === 0 && i % 10 === 1 && !(i % 100 === 11) || f % 10 === 1 && !(f % 100 === 11))
                return Plural.One;
            if (v === 0 && i % 10 === Math.floor(i % 10) && i % 10 >= 2 && i % 10 <= 4 &&
                !(i % 100 >= 12 && i % 100 <= 14) ||
                f % 10 === Math.floor(f % 10) && f % 10 >= 2 && f % 10 <= 4 &&
                    !(f % 100 >= 12 && f % 100 <= 14))
                return Plural.Few;
            return Plural.Other;
        case 'cs':
        case 'sk':
            if (i === 1 && v === 0)
                return Plural.One;
            if (i === Math.floor(i) && i >= 2 && i <= 4 && v === 0)
                return Plural.Few;
            if (!(v === 0))
                return Plural.Many;
            return Plural.Other;
        case 'cy':
            if (n === 0)
                return Plural.Zero;
            if (n === 1)
                return Plural.One;
            if (n === 2)
                return Plural.Two;
            if (n === 3)
                return Plural.Few;
            if (n === 6)
                return Plural.Many;
            return Plural.Other;
        case 'da':
            if (n === 1 || !(t === 0) && (i === 0 || i === 1))
                return Plural.One;
            return Plural.Other;
        case 'dsb':
        case 'hsb':
            if (v === 0 && i % 100 === 1 || f % 100 === 1)
                return Plural.One;
            if (v === 0 && i % 100 === 2 || f % 100 === 2)
                return Plural.Two;
            if (v === 0 && i % 100 === Math.floor(i % 100) && i % 100 >= 3 && i % 100 <= 4 ||
                f % 100 === Math.floor(f % 100) && f % 100 >= 3 && f % 100 <= 4)
                return Plural.Few;
            return Plural.Other;
        case 'ff':
        case 'fr':
        case 'hy':
        case 'kab':
            if (i === 0 || i === 1)
                return Plural.One;
            return Plural.Other;
        case 'fil':
            if (v === 0 && (i === 1 || i === 2 || i === 3) ||
                v === 0 && !(i % 10 === 4 || i % 10 === 6 || i % 10 === 9) ||
                !(v === 0) && !(f % 10 === 4 || f % 10 === 6 || f % 10 === 9))
                return Plural.One;
            return Plural.Other;
        case 'ga':
            if (n === 1)
                return Plural.One;
            if (n === 2)
                return Plural.Two;
            if (n === Math.floor(n) && n >= 3 && n <= 6)
                return Plural.Few;
            if (n === Math.floor(n) && n >= 7 && n <= 10)
                return Plural.Many;
            return Plural.Other;
        case 'gd':
            if (n === 1 || n === 11)
                return Plural.One;
            if (n === 2 || n === 12)
                return Plural.Two;
            if (n === Math.floor(n) && (n >= 3 && n <= 10 || n >= 13 && n <= 19))
                return Plural.Few;
            return Plural.Other;
        case 'gv':
            if (v === 0 && i % 10 === 1)
                return Plural.One;
            if (v === 0 && i % 10 === 2)
                return Plural.Two;
            if (v === 0 &&
                (i % 100 === 0 || i % 100 === 20 || i % 100 === 40 || i % 100 === 60 || i % 100 === 80))
                return Plural.Few;
            if (!(v === 0))
                return Plural.Many;
            return Plural.Other;
        case 'he':
            if (i === 1 && v === 0)
                return Plural.One;
            if (i === 2 && v === 0)
                return Plural.Two;
            if (v === 0 && !(n >= 0 && n <= 10) && n % 10 === 0)
                return Plural.Many;
            return Plural.Other;
        case 'is':
            if (t === 0 && i % 10 === 1 && !(i % 100 === 11) || !(t === 0))
                return Plural.One;
            return Plural.Other;
        case 'ksh':
            if (n === 0)
                return Plural.Zero;
            if (n === 1)
                return Plural.One;
            return Plural.Other;
        case 'kw':
        case 'naq':
        case 'se':
        case 'smn':
            if (n === 1)
                return Plural.One;
            if (n === 2)
                return Plural.Two;
            return Plural.Other;
        case 'lag':
            if (n === 0)
                return Plural.Zero;
            if ((i === 0 || i === 1) && !(n === 0))
                return Plural.One;
            return Plural.Other;
        case 'lt':
            if (n % 10 === 1 && !(n % 100 >= 11 && n % 100 <= 19))
                return Plural.One;
            if (n % 10 === Math.floor(n % 10) && n % 10 >= 2 && n % 10 <= 9 &&
                !(n % 100 >= 11 && n % 100 <= 19))
                return Plural.Few;
            if (!(f === 0))
                return Plural.Many;
            return Plural.Other;
        case 'lv':
        case 'prg':
            if (n % 10 === 0 || n % 100 === Math.floor(n % 100) && n % 100 >= 11 && n % 100 <= 19 ||
                v === 2 && f % 100 === Math.floor(f % 100) && f % 100 >= 11 && f % 100 <= 19)
                return Plural.Zero;
            if (n % 10 === 1 && !(n % 100 === 11) || v === 2 && f % 10 === 1 && !(f % 100 === 11) ||
                !(v === 2) && f % 10 === 1)
                return Plural.One;
            return Plural.Other;
        case 'mk':
            if (v === 0 && i % 10 === 1 || f % 10 === 1)
                return Plural.One;
            return Plural.Other;
        case 'mt':
            if (n === 1)
                return Plural.One;
            if (n === 0 || n % 100 === Math.floor(n % 100) && n % 100 >= 2 && n % 100 <= 10)
                return Plural.Few;
            if (n % 100 === Math.floor(n % 100) && n % 100 >= 11 && n % 100 <= 19)
                return Plural.Many;
            return Plural.Other;
        case 'pl':
            if (i === 1 && v === 0)
                return Plural.One;
            if (v === 0 && i % 10 === Math.floor(i % 10) && i % 10 >= 2 && i % 10 <= 4 &&
                !(i % 100 >= 12 && i % 100 <= 14))
                return Plural.Few;
            if (v === 0 && !(i === 1) && i % 10 === Math.floor(i % 10) && i % 10 >= 0 && i % 10 <= 1 ||
                v === 0 && i % 10 === Math.floor(i % 10) && i % 10 >= 5 && i % 10 <= 9 ||
                v === 0 && i % 100 === Math.floor(i % 100) && i % 100 >= 12 && i % 100 <= 14)
                return Plural.Many;
            return Plural.Other;
        case 'pt':
            if (n === Math.floor(n) && n >= 0 && n <= 2 && !(n === 2))
                return Plural.One;
            return Plural.Other;
        case 'ro':
            if (i === 1 && v === 0)
                return Plural.One;
            if (!(v === 0) || n === 0 ||
                !(n === 1) && n % 100 === Math.floor(n % 100) && n % 100 >= 1 && n % 100 <= 19)
                return Plural.Few;
            return Plural.Other;
        case 'ru':
        case 'uk':
            if (v === 0 && i % 10 === 1 && !(i % 100 === 11))
                return Plural.One;
            if (v === 0 && i % 10 === Math.floor(i % 10) && i % 10 >= 2 && i % 10 <= 4 &&
                !(i % 100 >= 12 && i % 100 <= 14))
                return Plural.Few;
            if (v === 0 && i % 10 === 0 ||
                v === 0 && i % 10 === Math.floor(i % 10) && i % 10 >= 5 && i % 10 <= 9 ||
                v === 0 && i % 100 === Math.floor(i % 100) && i % 100 >= 11 && i % 100 <= 14)
                return Plural.Many;
            return Plural.Other;
        case 'shi':
            if (i === 0 || n === 1)
                return Plural.One;
            if (n === Math.floor(n) && n >= 2 && n <= 10)
                return Plural.Few;
            return Plural.Other;
        case 'si':
            if (n === 0 || n === 1 || i === 0 && f === 1)
                return Plural.One;
            return Plural.Other;
        case 'sl':
            if (v === 0 && i % 100 === 1)
                return Plural.One;
            if (v === 0 && i % 100 === 2)
                return Plural.Two;
            if (v === 0 && i % 100 === Math.floor(i % 100) && i % 100 >= 3 && i % 100 <= 4 || !(v === 0))
                return Plural.Few;
            return Plural.Other;
        case 'tzm':
            if (n === Math.floor(n) && n >= 0 && n <= 1 || n === Math.floor(n) && n >= 11 && n <= 99)
                return Plural.One;
            return Plural.Other;
        // When there is no specification, the default is always "other"
        // Spec: http://cldr.unicode.org/index/cldr-spec/plural-rules
        // > other (required—general plural form — also used if the language only has a single form)
        default:
            return Plural.Other;
    }
}
function getPluralCategory(value, locale) {
    var plural = getPluralCase(locale, value);
    switch (plural) {
        case Plural.Zero:
            return 'zero';
        case Plural.One:
            return 'one';
        case Plural.Two:
            return 'two';
        case Plural.Few:
            return 'few';
        case Plural.Many:
            return 'many';
        default:
            return 'other';
    }
}
/**
 * Returns the index of the current case of an ICU expression depending on the main binding value
 *
 * @param icuExpression
 * @param bindingValue The value of the main binding used by this ICU expression
 */
function getCaseIndex(icuExpression, bindingValue) {
    var index = icuExpression.cases.indexOf(bindingValue);
    if (index === -1) {
        switch (icuExpression.type) {
            case 1 /* plural */: {
                // TODO(ocombe): replace this hard-coded value by the real LOCALE_ID value
                var locale = 'en-US';
                var resolvedCase = getPluralCategory(bindingValue, locale);
                index = icuExpression.cases.indexOf(resolvedCase);
                if (index === -1 && resolvedCase !== 'other') {
                    index = icuExpression.cases.indexOf('other');
                }
                break;
            }
            case 0 /* select */: {
                index = icuExpression.cases.indexOf('other');
                break;
            }
        }
    }
    return index;
}
/**
 * Generate the OpCodes for ICU expressions.
 *
 * @param tIcus
 * @param icuExpression
 * @param startIndex
 * @param expandoStartIndex
 */
function icuStart(tIcus, icuExpression, startIndex, expandoStartIndex) {
    var createCodes = [];
    var removeCodes = [];
    var updateCodes = [];
    var vars = [];
    var childIcus = [];
    for (var i = 0; i < icuExpression.values.length; i++) {
        // Each value is an array of strings & other ICU expressions
        var valueArr = icuExpression.values[i];
        var nestedIcus = [];
        for (var j = 0; j < valueArr.length; j++) {
            var value = valueArr[j];
            if (typeof value !== 'string') {
                // It is an nested ICU expression
                var icuIndex = nestedIcus.push(value) - 1;
                // Replace nested ICU expression by a comment node
                valueArr[j] = "<!--\uFFFD" + icuIndex + "\uFFFD-->";
            }
        }
        var icuCase = parseIcuCase(valueArr.join(''), startIndex, nestedIcus, tIcus, expandoStartIndex);
        createCodes.push(icuCase.create);
        removeCodes.push(icuCase.remove);
        updateCodes.push(icuCase.update);
        vars.push(icuCase.vars);
        childIcus.push(icuCase.childIcus);
    }
    var tIcu = {
        type: icuExpression.type,
        vars: vars,
        expandoStartIndex: expandoStartIndex + 1, childIcus: childIcus,
        cases: icuExpression.cases,
        create: createCodes,
        remove: removeCodes,
        update: updateCodes
    };
    tIcus.push(tIcu);
    var lView = getLView();
    var worstCaseSize = Math.max.apply(Math, tslib_1.__spread(vars));
    for (var i = 0; i < worstCaseSize; i++) {
        allocExpando(lView);
    }
}
/**
 * Transforms a string template into an HTML template and a list of instructions used to update
 * attributes or nodes that contain bindings.
 *
 * @param unsafeHtml The string to parse
 * @param parentIndex
 * @param nestedIcus
 * @param tIcus
 * @param expandoStartIndex
 */
function parseIcuCase(unsafeHtml, parentIndex, nestedIcus, tIcus, expandoStartIndex) {
    var inertBodyHelper = new InertBodyHelper(document);
    var inertBodyElement = inertBodyHelper.getInertBodyElement(unsafeHtml);
    if (!inertBodyElement) {
        throw new Error('Unable to generate inert body element');
    }
    var wrapper = getTemplateContent(inertBodyElement) || inertBodyElement;
    var opCodes = { vars: 0, childIcus: [], create: [], remove: [], update: [] };
    parseNodes(wrapper.firstChild, opCodes, parentIndex, nestedIcus, tIcus, expandoStartIndex);
    return opCodes;
}
var NESTED_ICU = /�(\d+)�/;
/**
 * Parses a node, its children and its siblings, and generates the mutate & update OpCodes.
 *
 * @param currentNode The first node to parse
 * @param icuCase The data for the ICU expression case that contains those nodes
 * @param parentIndex Index of the current node's parent
 * @param nestedIcus Data for the nested ICU expressions that this case contains
 * @param tIcus Data for all ICU expressions of the current message
 * @param expandoStartIndex Expando start index for the current ICU expression
 */
function parseNodes(currentNode, icuCase, parentIndex, nestedIcus, tIcus, expandoStartIndex) {
    if (currentNode) {
        var nestedIcusToCreate = [];
        while (currentNode) {
            var nextNode = currentNode.nextSibling;
            var newIndex = expandoStartIndex + ++icuCase.vars;
            switch (currentNode.nodeType) {
                case Node.ELEMENT_NODE:
                    var element = currentNode;
                    var tagName = element.tagName.toLowerCase();
                    if (!VALID_ELEMENTS.hasOwnProperty(tagName)) {
                        // This isn't a valid element, we won't create an element for it
                        icuCase.vars--;
                    }
                    else {
                        icuCase.create.push(ELEMENT_MARKER, tagName, parentIndex << 17 /* SHIFT_PARENT */ | 1 /* AppendChild */);
                        var elAttrs = element.attributes;
                        for (var i = 0; i < elAttrs.length; i++) {
                            var attr = elAttrs.item(i);
                            var lowerAttrName = attr.name.toLowerCase();
                            var hasBinding_1 = !!attr.value.match(BINDING_REGEXP);
                            // we assume the input string is safe, unless it's using a binding
                            if (hasBinding_1) {
                                if (VALID_ATTRS.hasOwnProperty(lowerAttrName)) {
                                    if (URI_ATTRS[lowerAttrName]) {
                                        addAllToArray(generateBindingUpdateOpCodes(attr.value, newIndex, attr.name, _sanitizeUrl), icuCase.update);
                                    }
                                    else if (SRCSET_ATTRS[lowerAttrName]) {
                                        addAllToArray(generateBindingUpdateOpCodes(attr.value, newIndex, attr.name, sanitizeSrcset), icuCase.update);
                                    }
                                    else {
                                        addAllToArray(generateBindingUpdateOpCodes(attr.value, newIndex, attr.name), icuCase.update);
                                    }
                                }
                                else {
                                    ngDevMode &&
                                        console.warn("WARNING: ignoring unsafe attribute value " + lowerAttrName + " on element " + tagName + " (see http://g.co/ng/security#xss)");
                                }
                            }
                            else {
                                icuCase.create.push(newIndex << 3 /* SHIFT_REF */ | 4 /* Attr */, attr.name, attr.value);
                            }
                        }
                        // Parse the children of this node (if any)
                        parseNodes(currentNode.firstChild, icuCase, newIndex, nestedIcus, tIcus, expandoStartIndex);
                        // Remove the parent node after the children
                        icuCase.remove.push(newIndex << 3 /* SHIFT_REF */ | 3 /* Remove */);
                    }
                    break;
                case Node.TEXT_NODE:
                    var value = currentNode.textContent || '';
                    var hasBinding = value.match(BINDING_REGEXP);
                    icuCase.create.push(hasBinding ? '' : value, parentIndex << 17 /* SHIFT_PARENT */ | 1 /* AppendChild */);
                    icuCase.remove.push(newIndex << 3 /* SHIFT_REF */ | 3 /* Remove */);
                    if (hasBinding) {
                        addAllToArray(generateBindingUpdateOpCodes(value, newIndex), icuCase.update);
                    }
                    break;
                case Node.COMMENT_NODE:
                    // Check if the comment node is a placeholder for a nested ICU
                    var match = NESTED_ICU.exec(currentNode.textContent || '');
                    if (match) {
                        var nestedIcuIndex = parseInt(match[1], 10);
                        var newLocal = ngDevMode ? "nested ICU " + nestedIcuIndex : '';
                        // Create the comment node that will anchor the ICU expression
                        icuCase.create.push(COMMENT_MARKER, newLocal, parentIndex << 17 /* SHIFT_PARENT */ | 1 /* AppendChild */);
                        var nestedIcu = nestedIcus[nestedIcuIndex];
                        nestedIcusToCreate.push([nestedIcu, newIndex]);
                    }
                    else {
                        // We do not handle any other type of comment
                        icuCase.vars--;
                    }
                    break;
                default:
                    // We do not handle any other type of element
                    icuCase.vars--;
            }
            currentNode = nextNode;
        }
        for (var i = 0; i < nestedIcusToCreate.length; i++) {
            var nestedIcu = nestedIcusToCreate[i][0];
            var nestedIcuNodeIndex = nestedIcusToCreate[i][1];
            icuStart(tIcus, nestedIcu, nestedIcuNodeIndex, expandoStartIndex + icuCase.vars);
            // Since this is recursive, the last TIcu that was pushed is the one we want
            var nestTIcuIndex = tIcus.length - 1;
            icuCase.vars += Math.max.apply(Math, tslib_1.__spread(tIcus[nestTIcuIndex].vars));
            icuCase.childIcus.push(nestTIcuIndex);
            var mask = getBindingMask(nestedIcu);
            icuCase.update.push(toMaskBit(nestedIcu.mainBinding), // mask of the main binding
            3, // skip 3 opCodes if not changed
            -1 - nestedIcu.mainBinding, nestedIcuNodeIndex << 2 /* SHIFT_REF */ | 2 /* IcuSwitch */, nestTIcuIndex, mask, // mask of all the bindings of this ICU expression
            2, // skip 2 opCodes if not changed
            nestedIcuNodeIndex << 2 /* SHIFT_REF */ | 3 /* IcuUpdate */, nestTIcuIndex);
            icuCase.remove.push(nestTIcuIndex << 3 /* SHIFT_REF */ | 6 /* RemoveNestedIcu */, nestedIcuNodeIndex << 3 /* SHIFT_REF */ | 3 /* Remove */);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaTE4bi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL3JlbmRlcjMvaTE4bi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxFQUFDLFlBQVksRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLGNBQWMsRUFBRSxrQkFBa0IsRUFBQyxNQUFNLGdDQUFnQyxDQUFDO0FBQ3hILE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSw0QkFBNEIsQ0FBQztBQUMzRCxPQUFPLEVBQUMsWUFBWSxFQUFFLGNBQWMsRUFBQyxNQUFNLCtCQUErQixDQUFDO0FBQzNFLE9BQU8sRUFBQyxhQUFhLEVBQUUsV0FBVyxFQUFFLGlCQUFpQixFQUFDLE1BQU0sVUFBVSxDQUFDO0FBQ3ZFLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUNwRCxPQUFPLEVBQUMsWUFBWSxFQUFFLGlCQUFpQixFQUFFLGdCQUFnQixFQUFFLElBQUksRUFBRSxXQUFXLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUNwRyxPQUFPLEVBQWEsTUFBTSxFQUFFLGFBQWEsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBQ3pFLE9BQU8sRUFBQyxjQUFjLEVBQUUsY0FBYyxFQUFpRyxNQUFNLG1CQUFtQixDQUFDO0FBS2pLLE9BQU8sRUFBQyxhQUFhLEVBQUUsYUFBYSxFQUFFLFNBQVMsRUFBUyxRQUFRLEVBQUUsS0FBSyxFQUFRLE1BQU0sbUJBQW1CLENBQUM7QUFDekcsT0FBTyxFQUFDLFdBQVcsRUFBRSxjQUFjLEVBQUUsV0FBVyxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDN0UsT0FBTyxFQUFDLFdBQVcsRUFBRSxRQUFRLEVBQUUsd0JBQXdCLEVBQUUsV0FBVyxFQUFFLHdCQUF3QixFQUFDLE1BQU0sU0FBUyxDQUFDO0FBQy9HLE9BQU8sRUFBQyxTQUFTLEVBQUMs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O1FBQ1YsS0FBSyxLQUFLLENBQUM7UUFDWCxLQUFLLEtBQUssQ0FBQztRQUNYLEtBQUssSUFBSSxDQUFDO1FBQ1YsS0FBSyxJQUFJLENBQUM7UUFDVixLQUFLLEtBQUssQ0FBQztRQUNYLEtBQUssSUFBSSxDQUFDO1FBQ1YsS0FBSyxJQUFJLENBQUM7UUFDVixLQUFLLEtBQUssQ0FBQztRQUNYLEtBQUssSUFBSSxDQUFDO1FBQ1YsS0FBSyxJQUFJLENBQUM7UUFDVixLQUFLLElBQUksQ0FBQztRQUNWLEtBQUssS0FBSyxDQUFDO1FBQ1gsS0FBSyxLQUFLLENBQUM7UUFDWCxLQUFLLElBQUksQ0FBQztRQUNWLEtBQUssSUFBSSxDQUFDO1FBQ1YsS0FBSyxJQUFJLENBQUM7UUFDVixLQUFLLElBQUksQ0FBQztRQUNWLEtBQUssSUFBSSxDQUFDO1FBQ1YsS0FBSyxJQUFJLENBQUM7UUFDVixLQUFLLEtBQUssQ0FBQztRQUNYLEtBQUssS0FBSyxDQUFDO1FBQ1gsS0FBSyxJQUFJLENBQUM7UUFDVixLQUFLLElBQUksQ0FBQztRQUNWLEtBQUssSUFBSSxDQUFDO1FBQ1YsS0FBSyxJQUFJLENBQUM7UUFDVixLQUFLLElBQUksQ0FBQztRQUNWLEtBQUssS0FBSyxDQUFDO1FBQ1gsS0FBSyxLQUFLLENBQUM7UUFDWCxLQUFLLEtBQUssQ0FBQztRQUNYLEtBQUssS0FBSyxDQUFDO1FBQ1gsS0FBSyxJQUFJLENBQUM7UUFDVixLQUFLLElBQUksQ0FBQztRQUNWLEtBQUssSUFBSSxDQUFDO1FBQ1YsS0FBSyxJQUFJLENBQUM7UUFDVixLQUFLLElBQUksQ0FBQztRQUNWLEtBQUssS0FBSyxDQUFDO1FBQ1gsS0FBSyxJQUFJLENBQUM7UUFDVixLQUFLLElBQUksQ0FBQztRQUNWLEtBQUssSUFBSSxDQUFDO1FBQ1YsS0FBSyxJQUFJLENBQUM7UUFDVixLQUFLLElBQUksQ0FBQztRQUNWLEtBQUssS0FBSyxDQUFDO1FBQ1gsS0FBSyxLQUFLLENBQUM7UUFDWCxLQUFLLEtBQUs7WUFDUixJQUFJLENBQUMsS0FBSyxDQUFD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RUFDMUIsa0JBQWtCLHFCQUE4QixvQkFBNkIsRUFDN0UsYUFBYSxFQUNiLElBQUksRUFBRyxrREFBa0Q7WUFDekQsQ0FBQyxFQUFNLGdDQUFnQztZQUN2QyxrQkFBa0IscUJBQThCLG9CQUE2QixFQUM3RSxhQUFhLENBQUMsQ0FBQztZQUNuQixPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FDZixhQUFhLHFCQUE4QiwwQkFBbUMsRUFDOUUsa0JBQWtCLHFCQUE4QixpQkFBMEIsQ0FBQyxDQUFDO1NBQ2pGO0tBQ0Y7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1NSQ1NFVF9BVFRSUywgVVJJX0FUVFJTLCBWQUxJRF9BVFRSUywgVkFMSURfRUxFTUVOVFMsIGdldFRlbXBsYXRlQ29udGVudH0gZnJvbSAnLi4vc2FuaXRpemF0aW9uL2h0bWxfc2FuaXRpemVyJztcbmltcG9ydCB7SW5lcnRCb2R5SGVscGVyfSBmcm9tICcuLi9zYW5pdGl6YXRpb24vaW5lcnRfYm9keSc7XG5pbXBvcnQge19zYW5pdGl6ZVVybCwgc2FuaXRpemVTcmNzZXR9IGZyb20gJy4uL3Nhbml0aXphdGlvbi91cmxfc2FuaXRpemVyJztcbmltcG9ydCB7YXNzZXJ0RGVmaW5lZCwgYXNzZXJ0RXF1YWwsIGFzc2VydEdyZWF0ZXJUaGFufSBmcm9tICcuL2Fzc2VydCc7XG5pbXBvcnQge2F0dGFjaFBhdGNoRGF0YX0gZnJvbSAnLi9jb250ZXh0X2Rpc2NvdmVyeSc7XG5pbXBvcnQge2FsbG9jRXhwYW5kbywgY3JlYXRlTm9kZUF0SW5kZXgsIGVsZW1lbnRBdHRyaWJ1dGUsIGxvYWQsIHRleHRCaW5kaW5nfSBmcm9tICcuL2luc3RydWN0aW9ucyc7XG5pbXBvcnQge0xDb250YWluZXIsIE5BVElWRSwgUkVOREVSX1BBUkVOVH0gZnJvbSAnLi9pbnRlcmZhY2VzL2NvbnRhaW5lcic7XG5pbXBvcnQge0NPTU1FTlRfTUFSS0VSLCBFTEVNRU5UX01BUktFUiwgSTE4bk11dGF0ZU9wQ29kZSwgSTE4bk11dGF0ZU9wQ29kZXMsIEkxOG5VcGRhdGVPcENvZGUsIEkxOG5VcGRhdGVPcENvZGVzLCBJY3VUeXBlLCBUSTE4biwgVEljdX0gZnJvbSAnLi9pbnRlcmZhY2VzL2kxOG4nO1xuaW1wb3J0IHtURWxlbWVudE5vZGUsIFRJY3VDb250YWluZXJOb2RlLCBUTm9kZSwgVE5vZGVUeXBlfSBmcm9tICcuL2ludGVyZmFjZXMvbm9kZSc7XG5pbXBvcnQge1JDb21tZW50LCBSRWxlbWVudH0gZnJvbSAnLi9pbnRlcmZhY2VzL3JlbmRlcmVyJztcbmltcG9ydCB7U2FuaXRpemVyRm59IGZyb20gJy4vaW50ZXJmYWNlcy9zYW5pdGl6YXRpb24nO1xuaW1wb3J0IHtTdHlsaW5nQ29udGV4dH0gZnJvbSAnLi9pbnRlcmZhY2VzL3N0eWxpbmcnO1xuaW1wb3J0IHtCSU5ESU5HX0lOREVYLCBIRUFERVJfT0ZGU0VULCBIT1NUX05PREUsIExWaWV3LCBSRU5ERVJFUiwgVFZJRVcsIFRWaWV3fSBmcm9tICcuL2ludGVyZmFjZXMvdmlldyc7XG5pbXBvcnQge2FwcGVuZENoaWxkLCBjcmVhdGVUZXh0Tm9kZSwgcmVtb3ZlQ2hpbGR9IGZyb20gJy4vbm9kZV9tYW5pcHVsYXRpb24nO1xuaW1wb3J0IHtnZXRJc1BhcmVudCwgZ2V0TFZpZXcsIGdldFByZXZpb3VzT3JQYXJlbnRUTm9kZSwgc2V0SXNQYXJlbnQsIHNldFByZXZpb3VzT3JQYXJlbnRUTm9kZX0gZnJvbSAnLi9zdGF0ZSc7XG5pbXBvcnQge05PX0NIQU5HRX0gZnJvbSAnLi90b2tlbnMnO1xuaW1wb3J0IHthZGRBbGxUb0FycmF5LCBnZXROYXRpdmVCeUluZGV4LCBnZXROYXRpdmVCeVROb2RlLCBnZXRUTm9kZSwgaXNMQ29udGFpbmVyLCBzdHJpbmdpZnl9IGZyb20gJy4vdXRpbCc7XG5cbmNvbnN0IE1BUktFUiA9IGDvv71gO1xuY29uc3QgSUNVX0JMT0NLX1JFR0VYID0gL15cXHMqKO+/vVxcZCs6P1xcZCrvv70pXFxzKixcXHMqKHNlbGVjdHxwbHVyYWwpXFxzKiwvO1xuY29uc3QgU1VCVEVNUExBVEVfUkVHRVhQID0gL++/vVxcLz9cXCooXFxkKzpcXGQrKe+/vS9naTtcbmNvbnN0IFBIX1JFR0VYUCA9IC/vv70oXFwvP1sjKl1cXGQrKTo/XFxkKu+/vS9naTtcbmNvbnN0IEJJTkRJTkdfUkVHRVhQID0gL++/vShcXGQrKTo/XFxkKu+/vS9naTtcbmNvbnN0IElDVV9SRUdFWFAgPSAvKHtcXHMq77+9XFxkKzo/XFxkKu+/vVxccyosXFxzKlxcU3s2fVxccyosW1xcc1xcU10qfSkvZ2k7XG5cbi8vIGkxOG5Qb3N0cHJvb2Nlc3MgcmVnZXhwc1xuY29uc3QgUFBfUExBQ0VIT0xERVJTID0gL1xcWyjvv70uKz/vv70/KVxcXS9nO1xuY29uc3QgUFBfSUNVX1ZBUlMgPSAvKHtcXHMqKShWQVJfKFBMVVJBTHxTRUxFQ1QpKF9cXGQrKT8pKFxccyosKS9nO1xuY29uc3QgUFBfSUNVUyA9IC/vv71JMThOX0VYUF8oSUNVKF9cXGQrKT8p77+9L2c7XG5cbmludGVyZmFjZSBJY3VFeHByZXNzaW9uIHtcbiAgdHlwZTogSWN1VHlwZTtcbiAgbWFpbkJpbmRpbmc6IG51bWJlcjtcbiAgY2FzZXM6IHN0cmluZ1tdO1xuICB2YWx1ZXM6IChzdHJpbmd8SWN1RXhwcmVzc2lvbilbXVtdO1xufVxuXG5pbnRlcmZhY2UgSWN1Q2FzZSB7XG4gIC8qKlxuICAgKiBOdW1iZXIgb2Ygc2xvdHMgdG8gYWxsb2NhdGUgaW4gZXhwYW5kbyBmb3IgdGhpcyBjYXNlLlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBtYXggbnVtYmVyIG9mIERPTSBlbGVtZW50cyB3aGljaCB3aWxsIGJlIGNyZWF0ZWQgYnkgdGhpcyBpMThuICsgSUNVIGJsb2Nrcy4gV2hlblxuICAgKiB0aGUgRE9NIGVsZW1lbnRzIGFyZSBiZWluZyBjcmVhdGVkIHRoZXkgYXJlIHN0b3JlZCBpbiB0aGUgRVhQQU5ETywgc28gdGhhdCB1cGRhdGUgT3BDb2RlcyBjYW5cbiAgICogd3JpdGUgaW50byB0aGVtLlxuICAgKi9cbiAgdmFyczogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBBbiBvcHRpb25hbCBhcnJheSBvZiBjaGlsZC9zdWIgSUNVcy5cbiAgICovXG4gIGNoaWxkSWN1czogbnVtYmVyW107XG5cbiAgLyoqXG4gICAqIEEgc2V0IG9mIE9wQ29kZXMgdG8gYXBwbHkgaW4gb3JkZXIgdG8gYnVpbGQgdXAgdGhlIERPTSByZW5kZXIgdHJlZSBmb3IgdGhlIElDVVxuICAgKi9cbiAgY3JlYXRlOiBJMThuTXV0YXRlT3BDb2RlcztcblxuICAvKipcbiAgICogQSBzZXQgb2YgT3BDb2RlcyB0byBhcHBseSBpbiBvcmRlciB0byBkZXN0cm95IHRoZSBET00gcmVuZGVyIHRyZWUgZm9yIHRoZSBJQ1UuXG4gICAqL1xuICByZW1vdmU6IEkxOG5NdXRhdGVPcENvZGVzO1xuXG4gIC8qKlxuICAgKiBBIHNldCBvZiBPcENvZGVzIHRvIGFwcGx5IGluIG9yZGVyIHRvIHVwZGF0ZSB0aGUgRE9NIHJlbmRlciB0cmVlIGZvciB0aGUgSUNVIGJpbmRpbmdzLlxuICAgKi9cbiAgdXBkYXRlOiBJMThuVXBkYXRlT3BDb2Rlcztcbn1cblxuLyoqXG4gKiBCcmVha3MgcGF0dGVybiBpbnRvIHN0cmluZ3MgYW5kIHRvcCBsZXZlbCB7Li4ufSBibG9ja3MuXG4gKiBDYW4gYmUgdXNlZCB0byBicmVhayBhIG1lc3NhZ2UgaW50byB0ZXh0IGFuZCBJQ1UgZXhwcmVzc2lvbnMsIG9yIHRvIGJyZWFrIGFuIElDVSBleHByZXNzaW9uIGludG9cbiAqIGtleXMgYW5kIGNhc2VzLlxuICogT3JpZ2luYWwgY29kZSBmcm9tIGNsb3N1cmUgbGlicmFyeSwgbW9kaWZpZWQgZm9yIEFuZ3VsYXIuXG4gKlxuICogQHBhcmFtIHBhdHRlcm4gKHN1YilQYXR0ZXJuIHRvIGJlIGJyb2tlbi5cbiAqXG4gKi9cbmZ1bmN0aW9uIGV4dHJhY3RQYXJ0cyhwYXR0ZXJuOiBzdHJpbmcpOiAoc3RyaW5nIHwgSWN1RXhwcmVzc2lvbilbXSB7XG4gIGlmICghcGF0dGVybikge1xuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIGxldCBwcmV2UG9zID0gMDtcbiAgY29uc3QgYnJhY2VTdGFjayA9IFtdO1xuICBjb25zdCByZXN1bHRzOiAoc3RyaW5nIHwgSWN1RXhwcmVzc2lvbilbXSA9IFtdO1xuICBjb25zdCBicmFjZXMgPSAvW3t9XS9nO1xuICAvLyBsYXN0SW5kZXggZG9lc24ndCBnZXQgc2V0IHRvIDAgc28gd2UgaGF2ZSB0by5cbiAgYnJhY2VzLmxhc3RJbmRleCA9IDA7XG5cbiAgbGV0IG1hdGNoO1xuICB3aGlsZSAobWF0Y2ggPSBicmFjZXMuZXhlYyhwYXR0ZXJuKSkge1xuICAgIGNvbnN0IHBvcyA9IG1hdGNoLmluZGV4O1xuICAgIGlmIChtYXRjaFswXSA9PSAnfScpIHtcbiAgICAgIGJyYWNlU3RhY2sucG9wKCk7XG5cbiAgICAgIGlmIChicmFjZVN0YWNrLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgIC8vIEVuZCBvZiB0aGUgYmxvY2suXG4gICAgICAgIGNvbnN0IGJsb2NrID0gcGF0dGVybi5zdWJzdHJpbmcocHJldlBvcywgcG9zKTtcbiAgICAgICAgaWYgKElDVV9CTE9DS19SRUdFWC50ZXN0KGJsb2NrKSkge1xuICAgICAgICAgIHJlc3VsdHMucHVzaChwYXJzZUlDVUJsb2NrKGJsb2NrKSk7XG4gICAgICAgIH0gZWxzZSBpZiAoYmxvY2spIHsgIC8vIERvbid0IHB1c2ggZW1wdHkgc3RyaW5nc1xuICAgICAgICAgIHJlc3VsdHMucHVzaChibG9jayk7XG4gICAgICAgIH1cblxuICAgICAgICBwcmV2UG9zID0gcG9zICsgMTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGJyYWNlU3RhY2subGVuZ3RoID09IDApIHtcbiAgICAgICAgY29uc3Qgc3Vic3RyaW5nID0gcGF0dGVybi5zdWJzdHJpbmcocHJldlBvcywgcG9zKTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKHN1YnN0cmluZyk7XG4gICAgICAgIHByZXZQb3MgPSBwb3MgKyAxO1xuICAgICAgfVxuICAgICAgYnJhY2VTdGFjay5wdXNoKCd7Jyk7XG4gICAgfVxuICB9XG5cbiAgY29uc3Qgc3Vic3RyaW5nID0gcGF0dGVybi5zdWJzdHJpbmcocHJldlBvcyk7XG4gIGlmIChzdWJzdHJpbmcgIT0gJycpIHtcbiAgICByZXN1bHRzLnB1c2goc3Vic3RyaW5nKTtcbiAgfVxuXG4gIHJldHVybiByZXN1bHRzO1xufVxuXG4vKipcbiAqIFBhcnNlcyB0ZXh0IGNvbnRhaW5pbmcgYW4gSUNVIGV4cHJlc3Npb24gYW5kIHByb2R1Y2VzIGEgSlNPTiBvYmplY3QgZm9yIGl0LlxuICogT3JpZ2luYWwgY29kZSBmcm9tIGNsb3N1cmUgbGlicmFyeSwgbW9kaWZpZWQgZm9yIEFuZ3VsYXIuXG4gKlxuICogQHBhcmFtIHBhdHRlcm4gVGV4dCBjb250YWluaW5nIGFuIElDVSBleHByZXNzaW9uIHRoYXQgbmVlZHMgdG8gYmUgcGFyc2VkLlxuICpcbiAqL1xuZnVuY3Rpb24gcGFyc2VJQ1VCbG9jayhwYXR0ZXJuOiBzdHJpbmcpOiBJY3VFeHByZXNzaW9uIHtcbiAgY29uc3QgY2FzZXMgPSBbXTtcbiAgY29uc3QgdmFsdWVzOiAoc3RyaW5nIHwgSWN1RXhwcmVzc2lvbilbXVtdID0gW107XG4gIGxldCBpY3VUeXBlID0gSWN1VHlwZS5wbHVyYWw7XG4gIGxldCBtYWluQmluZGluZyA9IDA7XG4gIHBhdHRlcm4gPSBwYXR0ZXJuLnJlcGxhY2UoSUNVX0JMT0NLX1JFR0VYLCBmdW5jdGlvbihzdHI6IHN0cmluZywgYmluZGluZzogc3RyaW5nLCB0eXBlOiBzdHJpbmcpIHtcbiAgICBpZiAodHlwZSA9PT0gJ3NlbGVjdCcpIHtcbiAgICAgIGljdVR5cGUgPSBJY3VUeXBlLnNlbGVjdDtcbiAgICB9IGVsc2Uge1xuICAgICAgaWN1VHlwZSA9IEljdVR5cGUucGx1cmFsO1xuICAgIH1cbiAgICBtYWluQmluZGluZyA9IHBhcnNlSW50KGJpbmRpbmcuc3Vic3RyKDEpLCAxMCk7XG4gICAgcmV0dXJuICcnO1xuICB9KTtcblxuICBjb25zdCBwYXJ0cyA9IGV4dHJhY3RQYXJ0cyhwYXR0ZXJuKSBhcyBzdHJpbmdbXTtcbiAgLy8gTG9va2luZyBmb3IgKGtleSBibG9jaykrIHNlcXVlbmNlLiBPbmUgb2YgdGhlIGtleXMgaGFzIHRvIGJlIFwib3RoZXJcIi5cbiAgZm9yIChsZXQgcG9zID0gMDsgcG9zIDwgcGFydHMubGVuZ3RoOykge1xuICAgIGxldCBrZXkgPSBwYXJ0c1twb3MrK10udHJpbSgpO1xuICAgIGlmIChpY3VUeXBlID09PSBJY3VUeXBlLnBsdXJhbCkge1xuICAgICAgLy8gS2V5IGNhbiBiZSBcIj14XCIsIHdlIGp1c3Qgd2FudCBcInhcIlxuICAgICAga2V5ID0ga2V5LnJlcGxhY2UoL1xccyooPzo9KT8oXFx3KylcXHMqLywgJyQxJyk7XG4gICAgfVxuICAgIGlmIChrZXkubGVuZ3RoKSB7XG4gICAgICBjYXNlcy5wdXNoKGtleSk7XG4gICAgfVxuXG4gICAgY29uc3QgYmxvY2tzID0gZXh0cmFjdFBhcnRzKHBhcnRzW3BvcysrXSkgYXMgc3RyaW5nW107XG4gICAgaWYgKGJsb2Nrcy5sZW5ndGgpIHtcbiAgICAgIHZhbHVlcy5wdXNoKGJsb2Nrcyk7XG4gICAgfVxuICB9XG5cbiAgYXNzZXJ0R3JlYXRlclRoYW4oY2FzZXMuaW5kZXhPZignb3RoZXInKSwgLTEsICdNaXNzaW5nIGtleSBcIm90aGVyXCIgaW4gSUNVIHN0YXRlbWVudC4nKTtcbiAgLy8gVE9ETyhvY29tYmUpOiBzdXBwb3J0IElDVSBleHByZXNzaW9ucyBpbiBhdHRyaWJ1dGVzLCBzZWUgIzIxNjE1XG4gIHJldHVybiB7dHlwZTogaWN1VHlwZSwgbWFpbkJpbmRpbmc6IG1haW5CaW5kaW5nLCBjYXNlcywgdmFsdWVzfTtcbn1cblxuLyoqXG4gKiBSZW1vdmVzIGV2ZXJ5dGhpbmcgaW5zaWRlIHRoZSBzdWItdGVtcGxhdGVzIG9mIGEgbWVzc2FnZS5cbiAqL1xuZnVuY3Rpb24gcmVtb3ZlSW5uZXJUZW1wbGF0ZVRyYW5zbGF0aW9uKG1lc3NhZ2U6IHN0cmluZyk6IHN0cmluZyB7XG4gIGxldCBtYXRjaDtcbiAgbGV0IHJlcyA9ICcnO1xuICBsZXQgaW5kZXggPSAwO1xuICBsZXQgaW5UZW1wbGF0ZSA9IGZhbHNlO1xuICBsZXQgdGFnTWF0Y2hlZDtcblxuICB3aGlsZSAoKG1hdGNoID0gU1VCVEVNUExBVEVfUkVHRVhQLmV4ZWMobWVzc2FnZSkpICE9PSBudWxsKSB7XG4gICAgaWYgKCFpblRlbXBsYXRlKSB7XG4gICAgICByZXMgKz0gbWVzc2FnZS5zdWJzdHJpbmcoaW5kZXgsIG1hdGNoLmluZGV4ICsgbWF0Y2hbMF0ubGVuZ3RoKTtcbiAgICAgIHRhZ01hdGNoZWQgPSBtYXRjaFsxXTtcbiAgICAgIGluVGVtcGxhdGUgPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAobWF0Y2hbMF0gPT09IGAke01BUktFUn0vKiR7dGFnTWF0Y2hlZH0ke01BUktFUn1gKSB7XG4gICAgICAgIGluZGV4ID0gbWF0Y2guaW5kZXg7XG4gICAgICAgIGluVGVtcGxhdGUgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBuZ0Rldk1vZGUgJiZcbiAgICAgIGFzc2VydEVxdWFsKFxuICAgICAgICAgIGluVGVtcGxhdGUsIGZhbHNlLFxuICAgICAgICAgIGBUYWcgbWlzbWF0Y2g6IHVuYWJsZSB0byBmaW5kIHRoZSBlbmQgb2YgdGhlIHN1Yi10ZW1wbGF0ZSBpbiB0aGUgdHJhbnNsYXRpb24gXCIke21lc3NhZ2V9XCJgKTtcblxuICByZXMgKz0gbWVzc2FnZS5zdWJzdHIoaW5kZXgpO1xuICByZXR1cm4gcmVzO1xufVxuXG4vKipcbiAqIEV4dHJhY3RzIGEgcGFydCBvZiBhIG1lc3NhZ2UgYW5kIHJlbW92ZXMgdGhlIHJlc3QuXG4gKlxuICogVGhpcyBtZXRob2QgaXMgdXNlZCBmb3IgZXh0cmFjdGluZyBhIHBhcnQgb2YgdGhlIG1lc3NhZ2UgYXNzb2NpYXRlZCB3aXRoIGEgdGVtcGxhdGUuIEEgdHJhbnNsYXRlZFxuICogbWVzc2FnZSBjYW4gc3BhbiBtdWx0aXBsZSB0ZW1wbGF0ZXMuXG4gKlxuICogRXhhbXBsZTpcbiAqIGBgYFxuICogPGRpdiBpMThuPlRyYW5zbGF0ZSA8c3BhbiAqbmdJZj5tZTwvc3Bhbj4hPC9kaXY+XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gbWVzc2FnZSBUaGUgbWVzc2FnZSB0byBjcm9wXG4gKiBAcGFyYW0gc3ViVGVtcGxhdGVJbmRleCBJbmRleCBvZiB0aGUgc3ViLXRlbXBsYXRlIHRvIGV4dHJhY3QuIElmIHVuZGVmaW5lZCBpdCByZXR1cm5zIHRoZVxuICogZXh0ZXJuYWwgdGVtcGxhdGUgYW5kIHJlbW92ZXMgYWxsIHN1Yi10ZW1wbGF0ZXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRUcmFuc2xhdGlvbkZvclRlbXBsYXRlKG1lc3NhZ2U6IHN0cmluZywgc3ViVGVtcGxhdGVJbmRleD86IG51bWJlcikge1xuICBpZiAodHlwZW9mIHN1YlRlbXBsYXRlSW5kZXggIT09ICdudW1iZXInKSB7XG4gICAgLy8gV2Ugd2FudCB0aGUgcm9vdCB0ZW1wbGF0ZSBtZXNzYWdlLCBpZ25vcmUgYWxsIHN1Yi10ZW1wbGF0ZXNcbiAgICByZXR1cm4gcmVtb3ZlSW5uZXJUZW1wbGF0ZVRyYW5zbGF0aW9uKG1lc3NhZ2UpO1xuICB9IGVsc2Uge1xuICAgIC8vIFdlIHdhbnQgYSBzcGVjaWZpYyBzdWItdGVtcGxhdGVcbiAgICBjb25zdCBzdGFydCA9XG4gICAgICAgIG1lc3NhZ2UuaW5kZXhPZihgOiR7c3ViVGVtcGxhdGVJbmRleH0ke01BUktFUn1gKSArIDIgKyBzdWJUZW1wbGF0ZUluZGV4LnRvU3RyaW5nKCkubGVuZ3RoO1xuICAgIGNvbnN0IGVuZCA9IG1lc3NhZ2Uuc2VhcmNoKG5ldyBSZWdFeHAoYCR7TUFSS0VSfVxcXFwvXFxcXCpcXFxcZCs6JHtzdWJUZW1wbGF0ZUluZGV4fSR7TUFSS0VSfWApKTtcbiAgICByZXR1cm4gcmVtb3ZlSW5uZXJUZW1wbGF0ZVRyYW5zbGF0aW9uKG1lc3NhZ2Uuc3Vic3RyaW5nKHN0YXJ0LCBlbmQpKTtcbiAgfVxufVxuXG4vKipcbiAqIEdlbmVyYXRlIHRoZSBPcENvZGVzIHRvIHVwZGF0ZSB0aGUgYmluZGluZ3Mgb2YgYSBzdHJpbmcuXG4gKlxuICogQHBhcmFtIHN0ciBUaGUgc3RyaW5nIGNvbnRhaW5pbmcgdGhlIGJpbmRpbmdzLlxuICogQHBhcmFtIGRlc3RpbmF0aW9uTm9kZSBJbmRleCBvZiB0aGUgZGVzdGluYXRpb24gbm9kZSB3aGljaCB3aWxsIHJlY2VpdmUgdGhlIGJpbmRpbmcuXG4gKiBAcGFyYW0gYXR0ck5hbWUgTmFtZSBvZiB0aGUgYXR0cmlidXRlLCBpZiB0aGUgc3RyaW5nIGJlbG9uZ3MgdG8gYW4gYXR0cmlidXRlLlxuICogQHBhcmFtIHNhbml0aXplRm4gU2FuaXRpemF0aW9uIGZ1bmN0aW9uIHVzZWQgdG8gc2FuaXRpemUgdGhlIHN0cmluZyBhZnRlciB1cGRhdGUsIGlmIG5lY2Vzc2FyeS5cbiAqL1xuZnVuY3Rpb24gZ2VuZXJhdGVCaW5kaW5nVXBkYXRlT3BDb2RlcyhcbiAgICBzdHI6IHN0cmluZywgZGVzdGluYXRpb25Ob2RlOiBudW1iZXIsIGF0dHJOYW1lPzogc3RyaW5nLFxuICAgIHNhbml0aXplRm46IFNhbml0aXplckZuIHwgbnVsbCA9IG51bGwpOiBJMThuVXBkYXRlT3BDb2RlcyB7XG4gIGNvbnN0IHVwZGF0ZU9wQ29kZXM6IEkxOG5VcGRhdGVPcENvZGVzID0gW251bGwsIG51bGxdOyAgLy8gQWxsb2Mgc3BhY2UgZm9yIG1hc2sgYW5kIHNpemVcbiAgY29uc3QgdGV4dFBhcnRzID0gc3RyLnNwbGl0KEJJTkRJTkdfUkVHRVhQKTtcbiAgbGV0IG1hc2sgPSAwO1xuXG4gIGZvciAobGV0IGogPSAwOyBqIDwgdGV4dFBhcnRzLmxlbmd0aDsgaisrKSB7XG4gICAgY29uc3QgdGV4dFZhbHVlID0gdGV4dFBhcnRzW2pdO1xuXG4gICAgaWYgKGogJiAxKSB7XG4gICAgICAvLyBPZGQgaW5kZXhlcyBhcmUgYmluZGluZ3NcbiAgICAgIGNvbnN0IGJpbmRpbmdJbmRleCA9IHBhcnNlSW50KHRleHRWYWx1ZSwgMTApO1xuICAgICAgdXBkYXRlT3BDb2Rlcy5wdXNoKC0xIC0gYmluZGluZ0luZGV4KTtcbiAgICAgIG1hc2sgPSBtYXNrIHwgdG9NYXNrQml0KGJpbmRpbmdJbmRleCk7XG4gICAgfSBlbHNlIGlmICh0ZXh0VmFsdWUgIT09ICcnKSB7XG4gICAgICAvLyBFdmVuIGluZGV4ZXMgYXJlIHRleHRcbiAgICAgIHVwZGF0ZU9wQ29kZXMucHVzaCh0ZXh0VmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZU9wQ29kZXMucHVzaChcbiAgICAgIGRlc3RpbmF0aW9uTm9kZSA8PCBJMThuVXBkYXRlT3BDb2RlLlNISUZUX1JFRiB8XG4gICAgICAoYXR0ck5hbWUgPyBJMThuVXBkYXRlT3BDb2RlLkF0dHIgOiBJMThuVXBkYXRlT3BDb2RlLlRleHQpKTtcbiAgaWYgKGF0dHJOYW1lKSB7XG4gICAgdXBkYXRlT3BDb2Rlcy5wdXNoKGF0dHJOYW1lLCBzYW5pdGl6ZUZuKTtcbiAgfVxuICB1cGRhdGVPcENvZGVzWzBdID0gbWFzaztcbiAgdXBkYXRlT3BDb2Rlc1sxXSA9IHVwZGF0ZU9wQ29kZXMubGVuZ3RoIC0gMjtcbiAgcmV0dXJuIHVwZGF0ZU9wQ29kZXM7XG59XG5cbmZ1bmN0aW9uIGdldEJpbmRpbmdNYXNrKGljdUV4cHJlc3Npb246IEljdUV4cHJlc3Npb24sIG1hc2sgPSAwKTogbnVtYmVyIHtcbiAgbWFzayA9IG1hc2sgfCB0b01hc2tCaXQoaWN1RXhwcmVzc2lvbi5tYWluQmluZGluZyk7XG4gIGxldCBtYXRjaDtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBpY3VFeHByZXNzaW9uLnZhbHVlcy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IHZhbHVlQXJyID0gaWN1RXhwcmVzc2lvbi52YWx1ZXNbaV07XG4gICAgZm9yIChsZXQgaiA9IDA7IGogPCB2YWx1ZUFyci5sZW5ndGg7IGorKykge1xuICAgICAgY29uc3QgdmFsdWUgPSB2YWx1ZUFycltqXTtcbiAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHdoaWxlIChtYXRjaCA9IEJJTkRJTkdfUkVHRVhQLmV4ZWModmFsdWUpKSB7XG4gICAgICAgICAgbWFzayA9IG1hc2sgfCB0b01hc2tCaXQocGFyc2VJbnQobWF0Y2hbMV0sIDEwKSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1hc2sgPSBnZXRCaW5kaW5nTWFzayh2YWx1ZSBhcyBJY3VFeHByZXNzaW9uLCBtYXNrKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIG1hc2s7XG59XG5cbmNvbnN0IGkxOG5JbmRleFN0YWNrOiBudW1iZXJbXSA9IFtdO1xubGV0IGkxOG5JbmRleFN0YWNrUG9pbnRlciA9IC0xO1xuXG4vKipcbiAqIENvbnZlcnQgYmluZGluZyBpbmRleCB0byBtYXNrIGJpdC5cbiAqXG4gKiBFYWNoIGluZGV4IHJlcHJlc2VudHMgYSBzaW5nbGUgYml0IG9uIHRoZSBiaXQtbWFzay4gQmVjYXVzZSBiaXQtbWFzayBvbmx5IGhhcyAzMiBiaXRzLCB3ZSBtYWtlXG4gKiB0aGUgMzJuZCBiaXQgc2hhcmUgYWxsIG1hc2tzIGZvciBhbGwgYmluZGluZ3MgaGlnaGVyIHRoYW4gMzIuIFNpbmNlIGl0IGlzIGV4dHJlbWVseSByYXJlIHRvIGhhdmVcbiAqIG1vcmUgdGhhbiAzMiBiaW5kaW5ncyB0aGlzIHdpbGwgYmUgaGl0IHZlcnkgcmFyZWx5LiBUaGUgZG93bnNpZGUgb2YgaGl0dGluZyB0aGlzIGNvcm5lciBjYXNlIGlzXG4gKiB0aGF0IHdlIHdpbGwgZXhlY3V0ZSBiaW5kaW5nIGNvZGUgbW9yZSBvZnRlbiB0aGFuIG5lY2Vzc2FyeS4gKHBlbmFsdHkgb2YgcGVyZm9ybWFuY2UpXG4gKi9cbmZ1bmN0aW9uIHRvTWFza0JpdChiaW5kaW5nSW5kZXg6IG51bWJlcik6IG51bWJlciB7XG4gIHJldHVybiAxIDw8IE1hdGgubWluKGJpbmRpbmdJbmRleCwgMzEpO1xufVxuXG5jb25zdCBwYXJlbnRJbmRleFN0YWNrOiBudW1iZXJbXSA9IFtdO1xuXG4vKipcbiAqIE1hcmtzIGEgYmxvY2sgb2YgdGV4dCBhcyB0cmFuc2xhdGFibGUuXG4gKlxuICogVGhlIGluc3RydWN0aW9ucyBgaTE4blN0YXJ0YCBhbmQgYGkxOG5FbmRgIG1hcmsgdGhlIHRyYW5zbGF0aW9uIGJsb2NrIGluIHRoZSB0ZW1wbGF0ZS5cbiAqIFRoZSB0cmFuc2xhdGlvbiBgbWVzc2FnZWAgaXMgdGhlIHZhbHVlIHdoaWNoIGlzIGxvY2FsZSBzcGVjaWZpYy4gVGhlIHRyYW5zbGF0aW9uIHN0cmluZyBtYXlcbiAqIGNvbnRhaW4gcGxhY2Vob2xkZXJzIHdoaWNoIGFzc29jaWF0ZSBpbm5lciBlbGVtZW50cyBhbmQgc3ViLXRlbXBsYXRlcyB3aXRoaW4gdGhlIHRyYW5zbGF0aW9uLlxuICpcbiAqIFRoZSB0cmFuc2xhdGlvbiBgbWVzc2FnZWAgcGxhY2Vob2xkZXJzIGFyZTpcbiAqIC0gYO+/vXtpbmRleH0oOntibG9ja30p77+9YDogKkJpbmRpbmcgUGxhY2Vob2xkZXIqOiBNYXJrcyBhIGxvY2F0aW9uIHdoZXJlIGFuIGV4cHJlc3Npb24gd2lsbCBiZVxuICogICBpbnRlcnBvbGF0ZWQgaW50by4gVGhlIHBsYWNlaG9sZGVyIGBpbmRleGAgcG9pbnRzIHRvIHRoZSBleHByZXNzaW9uIGJpbmRpbmcgaW5kZXguIEFuIG9wdGlvbmFsXG4gKiAgIGBibG9ja2AgdGhhdCBtYXRjaGVzIHRoZSBzdWItdGVtcGxhdGUgaW4gd2hpY2ggaXQgd2FzIGRlY2xhcmVkLlxuICogLSBg77+9I3tpbmRleH0oOntibG9ja30p77+9YC9g77+9LyN7aW5kZXh9KDp7YmxvY2t9Ke+/vWA6ICpFbGVtZW50IFBsYWNlaG9sZGVyKjogIE1hcmtzIHRoZSBiZWdpbm5pbmdcbiAqICAgYW5kIGVuZCBvZiBET00gZWxlbWVudCB0aGF0IHdlcmUgZW1iZWRkZWQgaW4gdGhlIG9yaWdpbmFsIHRyYW5zbGF0aW9uIGJsb2NrLiBUaGUgcGxhY2Vob2xkZXJcbiAqICAgYGluZGV4YCBwb2ludHMgdG8gdGhlIGVsZW1lbnQgaW5kZXggaW4gdGhlIHRlbXBsYXRlIGluc3RydWN0aW9ucyBzZXQuIEFuIG9wdGlvbmFsIGBibG9ja2AgdGhhdFxuICogICBtYXRjaGVzIHRoZSBzdWItdGVtcGxhdGUgaW4gd2hpY2ggaXQgd2FzIGRlY2xhcmVkLlxuICogLSBg77+9KntpbmRleH06e2Jsb2Nrfe+/vWAvYO+/vS8qe2luZGV4fTp7YmxvY2t977+9YDogKlN1Yi10ZW1wbGF0ZSBQbGFjZWhvbGRlcio6IFN1Yi10ZW1wbGF0ZXMgbXVzdCBiZVxuICogICBzcGxpdCB1cCBhbmQgdHJhbnNsYXRlZCBzZXBhcmF0ZWx5IGluIGVhY2ggYW5ndWxhciB0ZW1wbGF0ZSBmdW5jdGlvbi4gVGhlIGBpbmRleGAgcG9pbnRzIHRvIHRoZVxuICogICBgdGVtcGxhdGVgIGluc3RydWN0aW9uIGluZGV4LiBBIGBibG9ja2AgdGhhdCBtYXRjaGVzIHRoZSBzdWItdGVtcGxhdGUgaW4gd2hpY2ggaXQgd2FzIGRlY2xhcmVkLlxuICpcbiAqIEBwYXJhbSBpbmRleCBBIHVuaXF1ZSBpbmRleCBvZiB0aGUgdHJhbnNsYXRpb24gaW4gdGhlIHN0YXRpYyBibG9jay5cbiAqIEBwYXJhbSBtZXNzYWdlIFRoZSB0cmFuc2xhdGlvbiBtZXNzYWdlLlxuICogQHBhcmFtIHN1YlRlbXBsYXRlSW5kZXggT3B0aW9uYWwgc3ViLXRlbXBsYXRlIGluZGV4IGluIHRoZSBgbWVzc2FnZWAuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpMThuU3RhcnQoaW5kZXg6IG51bWJlciwgbWVzc2FnZTogc3RyaW5nLCBzdWJUZW1wbGF0ZUluZGV4PzogbnVtYmVyKTogdm9pZCB7XG4gIGNvbnN0IHRWaWV3ID0gZ2V0TFZpZXcoKVtUVklFV107XG4gIG5nRGV2TW9kZSAmJiBhc3NlcnREZWZpbmVkKHRWaWV3LCBgdFZpZXcgc2hvdWxkIGJlIGRlZmluZWRgKTtcbiAgaTE4bkluZGV4U3RhY2tbKytpMThuSW5kZXhTdGFja1BvaW50ZXJdID0gaW5kZXg7XG4gIGlmICh0Vmlldy5maXJzdFRlbXBsYXRlUGFzcyAmJiB0Vmlldy5kYXRhW2luZGV4ICsgSEVBREVSX09GRlNFVF0gPT09IG51bGwpIHtcbiAgICBpMThuU3RhcnRGaXJzdFBhc3ModFZpZXcsIGluZGV4LCBtZXNzYWdlLCBzdWJUZW1wbGF0ZUluZGV4KTtcbiAgfVxufVxuXG4vKipcbiAqIFNlZSBgaTE4blN0YXJ0YCBhYm92ZS5cbiAqL1xuZnVuY3Rpb24gaTE4blN0YXJ0Rmlyc3RQYXNzKFxuICAgIHRWaWV3OiBUVmlldywgaW5kZXg6IG51bWJlciwgbWVzc2FnZTogc3RyaW5nLCBzdWJUZW1wbGF0ZUluZGV4PzogbnVtYmVyKSB7XG4gIGNvbnN0IHZpZXdEYXRhID0gZ2V0TFZpZXcoKTtcbiAgY29uc3QgZXhwYW5kb1N0YXJ0SW5kZXggPSB0Vmlldy5ibHVlcHJpbnQubGVuZ3RoIC0gSEVBREVSX09GRlNFVDtcbiAgY29uc3QgcHJldmlvdXNPclBhcmVudFROb2RlID0gZ2V0UHJldmlvdXNPclBhcmVudFROb2RlKCk7XG4gIGNvbnN0IHBhcmVudFROb2RlID0gZ2V0SXNQYXJlbnQoKSA/IGdldFByZXZpb3VzT3JQYXJlbnRUTm9kZSgpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJldmlvdXNPclBhcmVudFROb2RlICYmIHByZXZpb3VzT3JQYXJlbnRUTm9kZS5wYXJlbnQ7XG4gIGxldCBwYXJlbnRJbmRleCA9IHBhcmVudFROb2RlICYmIHBhcmVudFROb2RlICE9PSB2aWV3RGF0YVtIT1NUX05PREVdID9cbiAgICAgIHBhcmVudFROb2RlLmluZGV4IC0gSEVBREVSX09GRlNFVCA6XG4gICAgICBpbmRleDtcbiAgbGV0IHBhcmVudEluZGV4UG9pbnRlciA9IDA7XG4gIHBhcmVudEluZGV4U3RhY2tbcGFyZW50SW5kZXhQb2ludGVyXSA9IHBhcmVudEluZGV4O1xuICBjb25zdCBjcmVhdGVPcENvZGVzOiBJMThuTXV0YXRlT3BDb2RlcyA9IFtdO1xuICAvLyBJZiB0aGUgcHJldmlvdXMgbm9kZSB3YXNuJ3QgdGhlIGRpcmVjdCBwYXJlbnQgdGhlbiB3ZSBoYXZlIGEgdHJhbnNsYXRpb24gd2l0aG91dCB0b3AgbGV2ZWxcbiAgLy8gZWxlbWVudCBhbmQgd2UgbmVlZCB0byBrZWVwIGEgcmVmZXJlbmNlIG9mIHRoZSBwcmV2aW91cyBlbGVtZW50IGlmIHRoZXJlIGlzIG9uZVxuICBpZiAoaW5kZXggPiAwICYmIHByZXZpb3VzT3JQYXJlbnRUTm9kZSAhPT0gcGFyZW50VE5vZGUpIHtcbiAgICAvLyBDcmVhdGUgYW4gT3BDb2RlIHRvIHNlbGVjdCB0aGUgcHJldmlvdXMgVE5vZGVcbiAgICBjcmVhdGVPcENvZGVzLnB1c2goXG4gICAgICAgIHByZXZpb3VzT3JQYXJlbnRUTm9kZS5pbmRleCA8PCBJMThuTXV0YXRlT3BDb2RlLlNISUZUX1JFRiB8IEkxOG5NdXRhdGVPcENvZGUuU2VsZWN0KTtcbiAgfVxuICBjb25zdCB1cGRhdGVPcENvZGVzOiBJMThuVXBkYXRlT3BDb2RlcyA9IFtdO1xuICBjb25zdCBpY3VFeHByZXNzaW9uczogVEljdVtdID0gW107XG5cbiAgY29uc3QgdGVtcGxhdGVUcmFuc2xhdGlvbiA9IGdldFRyYW5zbGF0aW9uRm9yVGVtcGxhdGUobWVzc2FnZSwgc3ViVGVtcGxhdGVJbmRleCk7XG4gIGNvbnN0IG1zZ1BhcnRzID0gdGVtcGxhdGVUcmFuc2xhdGlvbi5zcGxpdChQSF9SRUdFWFApO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IG1zZ1BhcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgbGV0IHZhbHVlID0gbXNnUGFydHNbaV07XG4gICAgaWYgKGkgJiAxKSB7XG4gICAgICAvLyBPZGQgaW5kZXhlcyBhcmUgcGxhY2Vob2xkZXJzIChlbGVtZW50cyBhbmQgc3ViLXRlbXBsYXRlcylcbiAgICAgIGlmICh2YWx1ZS5jaGFyQXQoMCkgPT09ICcvJykge1xuICAgICAgICAvLyBJdCBpcyBhIGNsb3NpbmcgdGFnXG4gICAgICAgIGlmICh2YWx1ZS5jaGFyQXQoMSkgPT09ICcjJykge1xuICAgICAgICAgIGNvbnN0IHBoSW5kZXggPSBwYXJzZUludCh2YWx1ZS5zdWJzdHIoMiksIDEwKTtcbiAgICAgICAgICBwYXJlbnRJbmRleCA9IHBhcmVudEluZGV4U3RhY2tbLS1wYXJlbnRJbmRleFBvaW50ZXJdO1xuICAgICAgICAgIGNyZWF0ZU9wQ29kZXMucHVzaChwaEluZGV4IDw8IEkxOG5NdXRhdGVPcENvZGUuU0hJRlRfUkVGIHwgSTE4bk11dGF0ZU9wQ29kZS5FbGVtZW50RW5kKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgcGhJbmRleCA9IHBhcnNlSW50KHZhbHVlLnN1YnN0cigxKSwgMTApO1xuICAgICAgICAvLyBUaGUgdmFsdWUgcmVwcmVzZW50cyBhIHBsYWNlaG9sZGVyIHRoYXQgd2UgbW92ZSB0byB0aGUgZGVzaWduYXRlZCBpbmRleFxuICAgICAgICBjcmVhdGVPcENvZGVzLnB1c2goXG4gICAgICAgICAgICBwaEluZGV4IDw8IEkxOG5NdXRhdGVPcENvZGUuU0hJRlRfUkVGIHwgSTE4bk11dGF0ZU9wQ29kZS5TZWxlY3QsXG4gICAgICAgICAgICBwYXJlbnRJbmRleCA8PCBJMThuTXV0YXRlT3BDb2RlLlNISUZUX1BBUkVOVCB8IEkxOG5NdXRhdGVPcENvZGUuQXBwZW5kQ2hpbGQpO1xuXG4gICAgICAgIGlmICh2YWx1ZS5jaGFyQXQoMCkgPT09ICcjJykge1xuICAgICAgICAgIHBhcmVudEluZGV4U3RhY2tbKytwYXJlbnRJbmRleFBvaW50ZXJdID0gcGFyZW50SW5kZXggPSBwaEluZGV4O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEV2ZW4gaW5kZXhlcyBhcmUgdGV4dCAoaW5jbHVkaW5nIGJpbmRpbmdzICYgSUNVIGV4cHJlc3Npb25zKVxuICAgICAgY29uc3QgcGFydHMgPSB2YWx1ZS5zcGxpdChJQ1VfUkVHRVhQKTtcbiAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgcGFydHMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgdmFsdWUgPSBwYXJ0c1tqXTtcblxuICAgICAgICBpZiAoaiAmIDEpIHtcbiAgICAgICAgICAvLyBPZGQgaW5kZXhlcyBhcmUgSUNVIGV4cHJlc3Npb25zXG4gICAgICAgICAgLy8gQ3JlYXRlIHRoZSBjb21tZW50IG5vZGUgdGhhdCB3aWxsIGFuY2hvciB0aGUgSUNVIGV4cHJlc3Npb25cbiAgICAgICAgICBhbGxvY0V4cGFuZG8odmlld0RhdGEpO1xuICAgICAgICAgIGNvbnN0IGljdU5vZGVJbmRleCA9IHRWaWV3LmJsdWVwcmludC5sZW5ndGggLSAxIC0gSEVBREVSX09GRlNFVDtcbiAgICAgICAgICBjcmVhdGVPcENvZGVzLnB1c2goXG4gICAgICAgICAgICAgIENPTU1FTlRfTUFSS0VSLCBuZ0Rldk1vZGUgPyBgSUNVICR7aWN1Tm9kZUluZGV4fWAgOiAnJyxcbiAgICAgICAgICAgICAgcGFyZW50SW5kZXggPDwgSTE4bk11dGF0ZU9wQ29kZS5TSElGVF9QQVJFTlQgfCBJMThuTXV0YXRlT3BDb2RlLkFwcGVuZENoaWxkKTtcblxuICAgICAgICAgIC8vIFVwZGF0ZSBjb2RlcyBmb3IgdGhlIElDVSBleHByZXNzaW9uXG4gICAgICAgICAgY29uc3QgaWN1RXhwcmVzc2lvbiA9IHBhcnNlSUNVQmxvY2sodmFsdWUuc3Vic3RyKDEsIHZhbHVlLmxlbmd0aCAtIDIpKTtcbiAgICAgICAgICBjb25zdCBtYXNrID0gZ2V0QmluZGluZ01hc2soaWN1RXhwcmVzc2lvbik7XG4gICAgICAgICAgaWN1U3RhcnQoaWN1RXhwcmVzc2lvbnMsIGljdUV4cHJlc3Npb24sIGljdU5vZGVJbmRleCwgaWN1Tm9kZUluZGV4KTtcbiAgICAgICAgICAvLyBTaW5jZSB0aGlzIGlzIHJlY3Vyc2l2ZSwgdGhlIGxhc3QgVEljdSB0aGF0IHdhcyBwdXNoZWQgaXMgdGhlIG9uZSB3ZSB3YW50XG4gICAgICAgICAgY29uc3QgdEljdUluZGV4ID0gaWN1RXhwcmVzc2lvbnMubGVuZ3RoIC0gMTtcbiAgICAgICAgICB1cGRhdGVPcENvZGVzLnB1c2goXG4gICAgICAgICAgICAgIHRvTWFza0JpdChpY3VFeHByZXNzaW9uLm1haW5CaW5kaW5nKSwgIC8vIG1hc2sgb2YgdGhlIG1haW4gYmluZGluZ1xuICAgICAgICAgICAgICAzLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBza2lwIDMgb3BDb2RlcyBpZiBub3QgY2hhbmdlZFxuICAgICAgICAgICAgICAtMSAtIGljdUV4cHJlc3Npb24ubWFpbkJpbmRpbmcsXG4gICAgICAgICAgICAgIGljdU5vZGVJbmRleCA8PCBJMThuVXBkYXRlT3BDb2RlLlNISUZUX1JFRiB8IEkxOG5VcGRhdGVPcENvZGUuSWN1U3dpdGNoLCB0SWN1SW5kZXgsXG4gICAgICAgICAgICAgIG1hc2ssICAvLyBtYXNrIG9mIGFsbCB0aGUgYmluZGluZ3Mgb2YgdGhpcyBJQ1UgZXhwcmVzc2lvblxuICAgICAgICAgICAgICAyLCAgICAgLy8gc2tpcCAyIG9wQ29kZXMgaWYgbm90IGNoYW5nZWRcbiAgICAgICAgICAgICAgaWN1Tm9kZUluZGV4IDw8IEkxOG5VcGRhdGVPcENvZGUuU0hJRlRfUkVGIHwgSTE4blVwZGF0ZU9wQ29kZS5JY3VVcGRhdGUsIHRJY3VJbmRleCk7XG4gICAgICAgIH0gZWxzZSBpZiAodmFsdWUgIT09ICcnKSB7XG4gICAgICAgICAgLy8gRXZlbiBpbmRleGVzIGFyZSB0ZXh0IChpbmNsdWRpbmcgYmluZGluZ3MpXG4gICAgICAgICAgY29uc3QgaGFzQmluZGluZyA9IHZhbHVlLm1hdGNoKEJJTkRJTkdfUkVHRVhQKTtcbiAgICAgICAgICAvLyBDcmVhdGUgdGV4dCBub2Rlc1xuICAgICAgICAgIGFsbG9jRXhwYW5kbyh2aWV3RGF0YSk7XG4gICAgICAgICAgY3JlYXRlT3BDb2Rlcy5wdXNoKFxuICAgICAgICAgICAgICAvLyBJZiB0aGVyZSBpcyBhIGJpbmRpbmcsIHRoZSB2YWx1ZSB3aWxsIGJlIHNldCBkdXJpbmcgdXBkYXRlXG4gICAgICAgICAgICAgIGhhc0JpbmRpbmcgPyAnJyA6IHZhbHVlLFxuICAgICAgICAgICAgICBwYXJlbnRJbmRleCA8PCBJMThuTXV0YXRlT3BDb2RlLlNISUZUX1BBUkVOVCB8IEkxOG5NdXRhdGVPcENvZGUuQXBwZW5kQ2hpbGQpO1xuXG4gICAgICAgICAgaWYgKGhhc0JpbmRpbmcpIHtcbiAgICAgICAgICAgIGFkZEFsbFRvQXJyYXkoXG4gICAgICAgICAgICAgICAgZ2VuZXJhdGVCaW5kaW5nVXBkYXRlT3BDb2Rlcyh2YWx1ZSwgdFZpZXcuYmx1ZXByaW50Lmxlbmd0aCAtIDEgLSBIRUFERVJfT0ZGU0VUKSxcbiAgICAgICAgICAgICAgICB1cGRhdGVPcENvZGVzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBOT1RFOiBsb2NhbCB2YXIgbmVlZGVkIHRvIHByb3Blcmx5IGFzc2VydCB0aGUgdHlwZSBvZiBgVEkxOG5gLlxuICBjb25zdCB0STE4bjogVEkxOG4gPSB7XG4gICAgdmFyczogdFZpZXcuYmx1ZXByaW50Lmxlbmd0aCAtIEhFQURFUl9PRkZTRVQgLSBleHBhbmRvU3RhcnRJbmRleCxcbiAgICBleHBhbmRvU3RhcnRJbmRleCxcbiAgICBjcmVhdGU6IGNyZWF0ZU9wQ29kZXMsXG4gICAgdXBkYXRlOiB1cGRhdGVPcENvZGVzLFxuICAgIGljdXM6IGljdUV4cHJlc3Npb25zLmxlbmd0aCA/IGljdUV4cHJlc3Npb25zIDogbnVsbCxcbiAgfTtcbiAgdFZpZXcuZGF0YVtpbmRleCArIEhFQURFUl9PRkZTRVRdID0gdEkxOG47XG59XG5cbmZ1bmN0aW9uIGFwcGVuZEkxOG5Ob2RlKHROb2RlOiBUTm9kZSwgcGFyZW50VE5vZGU6IFROb2RlLCBwcmV2aW91c1ROb2RlOiBUTm9kZSB8IG51bGwpOiBUTm9kZSB7XG4gIG5nRGV2TW9kZSAmJiBuZ0Rldk1vZGUucmVuZGVyZXJNb3ZlTm9kZSsrO1xuICBjb25zdCB2aWV3RGF0YSA9IGdldExWaWV3KCk7XG4gIGlmICghcHJldmlvdXNUTm9kZSkge1xuICAgIHByZXZpb3VzVE5vZGUgPSBwYXJlbnRUTm9kZTtcbiAgfVxuICAvLyByZS1vcmdhbml6ZSBub2RlIHRyZWUgdG8gcHV0IHRoaXMgbm9kZSBpbiB0aGUgY29ycmVjdCBwb3NpdGlvbi5cbiAgaWYgKHByZXZpb3VzVE5vZGUgPT09IHBhcmVudFROb2RlICYmIHROb2RlICE9PSBwYXJlbnRUTm9kZS5jaGlsZCkge1xuICAgIHROb2RlLm5leHQgPSBwYXJlbnRUTm9kZS5jaGlsZDtcbiAgICBwYXJlbnRUTm9kZS5jaGlsZCA9IHROb2RlO1xuICB9IGVsc2UgaWYgKHByZXZpb3VzVE5vZGUgIT09IHBhcmVudFROb2RlICYmIHROb2RlICE9PSBwcmV2aW91c1ROb2RlLm5leHQpIHtcbiAgICB0Tm9kZS5uZXh0ID0gcHJldmlvdXNUTm9kZS5uZXh0O1xuICAgIHByZXZpb3VzVE5vZGUubmV4dCA9IHROb2RlO1xuICB9IGVsc2Uge1xuICAgIHROb2RlLm5leHQgPSBudWxsO1xuICB9XG5cbiAgaWYgKHBhcmVudFROb2RlICE9PSB2aWV3RGF0YVtIT1NUX05PREVdKSB7XG4gICAgdE5vZGUucGFyZW50ID0gcGFyZW50VE5vZGUgYXMgVEVsZW1lbnROb2RlO1xuICB9XG5cbiAgYXBwZW5kQ2hpbGQoZ2V0TmF0aXZlQnlUTm9kZSh0Tm9kZSwgdmlld0RhdGEpLCB0Tm9kZSwgdmlld0RhdGEpO1xuXG4gIGNvbnN0IHNsb3RWYWx1ZSA9IHZpZXdEYXRhW3ROb2RlLmluZGV4XTtcbiAgaWYgKHROb2RlLnR5cGUgIT09IFROb2RlVHlwZS5Db250YWluZXIgJiYgaXNMQ29udGFpbmVyKHNsb3RWYWx1ZSkpIHtcbiAgICAvLyBOb2RlcyB0aGF0IGluamVjdCBWaWV3Q29udGFpbmVyUmVmIGFsc28gaGF2ZSBhIGNvbW1lbnQgbm9kZSB0aGF0IHNob3VsZCBiZSBtb3ZlZFxuICAgIGFwcGVuZENoaWxkKHNsb3RWYWx1ZVtOQVRJVkVdLCB0Tm9kZSwgdmlld0RhdGEpO1xuICB9XG4gIHJldHVybiB0Tm9kZTtcbn1cblxuLyoqXG4gKiBIYW5kbGVzIG1lc3NhZ2Ugc3RyaW5nIHBvc3QtcHJvY2Vzc2luZyBmb3IgaW50ZXJuYXRpb25hbGl6YXRpb24uXG4gKlxuICogSGFuZGxlcyBtZXNzYWdlIHN0cmluZyBwb3N0LXByb2Nlc3NpbmcgYnkgdHJhbnNmb3JtaW5nIGl0IGZyb20gaW50ZXJtZWRpYXRlXG4gKiBmb3JtYXQgKHRoYXQgbWlnaHQgY29udGFpbiBzb21lIG1hcmtlcnMgdGhhdCB3ZSBuZWVkIHRvIHJlcGxhY2UpIHRvIHRoZSBmaW5hbFxuICogZm9ybSwgY29uc3VtYWJsZSBieSBpMThuU3RhcnQgaW5zdHJ1Y3Rpb24uIFBvc3QgcHJvY2Vzc2luZyBzdGVwcyBpbmNsdWRlOlxuICpcbiAqIDEuIFJlc29sdmUgYWxsIG11bHRpLXZhbHVlIGNhc2VzIChsaWtlIFvvv70qMTox77+977+9IzI6Me+/vXzvv70jNDox77+9fO+/vTXvv71dKVxuICogMi4gUmVwbGFjZSBhbGwgSUNVIHZhcnMgKGxpa2UgXCJWQVJfUExVUkFMXCIpXG4gKiAzLiBSZXBsYWNlIGFsbCBJQ1UgcmVmZXJlbmNlcyB3aXRoIGNvcnJlc3BvbmRpbmcgdmFsdWVzIChsaWtlIO+/vUlDVV9FWFBfSUNVXzHvv70pXG4gKiAgICBpbiBjYXNlIG11bHRpcGxlIElDVXMgaGF2ZSB0aGUgc2FtZSBwbGFjZWhvbGRlciBuYW1lXG4gKlxuICogQHBhcmFtIG1lc3NhZ2UgUmF3IHRyYW5zbGF0aW9uIHN0cmluZyBmb3IgcG9zdCBwcm9jZXNzaW5nXG4gKiBAcGFyYW0gcmVwbGFjZW1lbnRzIFNldCBvZiByZXBsYWNlbWVudHMgdGhhdCBzaG91bGQgYmUgYXBwbGllZFxuICpcbiAqIEByZXR1cm5zIFRyYW5zZm9ybWVkIHN0cmluZyB0aGF0IGNhbiBiZSBjb25zdW1lZCBieSBpMThuU3RhcnQgaW5zdHJ1Y3Rpb25cbiAqXG4gKiBAcHVibGljQVBJXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpMThuUG9zdHByb2Nlc3MoXG4gICAgbWVzc2FnZTogc3RyaW5nLCByZXBsYWNlbWVudHM6IHtba2V5OiBzdHJpbmddOiAoc3RyaW5nIHwgc3RyaW5nW10pfSk6IHN0cmluZyB7XG4gIC8vXG4gIC8vIFN0ZXAgMTogcmVzb2x2ZSBhbGwgbXVsdGktdmFsdWUgY2FzZXMgKGxpa2UgW++/vSoxOjHvv73vv70jMjox77+9fO+/vSM0OjHvv71877+9Ne+/vV0pXG4gIC8vXG4gIGNvbnN0IG1hdGNoZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmdbXX0gPSB7fTtcbiAgbGV0IHJlc3VsdCA9IG1lc3NhZ2UucmVwbGFjZShQUF9QTEFDRUhPTERFUlMsIChfbWF0Y2gsIGNvbnRlbnQ6IHN0cmluZyk6IHN0cmluZyA9PiB7XG4gICAgaWYgKCFtYXRjaGVzW2NvbnRlbnRdKSB7XG4gICAgICBtYXRjaGVzW2NvbnRlbnRdID0gY29udGVudC5zcGxpdCgnfCcpO1xuICAgIH1cbiAgICBpZiAoIW1hdGNoZXNbY29udGVudF0ubGVuZ3RoKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYGkxOG4gcG9zdHByb2Nlc3M6IHVubWF0Y2hlZCBwbGFjZWhvbGRlciAtICR7Y29udGVudH1gKTtcbiAgICB9XG4gICAgcmV0dXJuIG1hdGNoZXNbY29udGVudF0uc2hpZnQoKSAhO1xuICB9KTtcblxuICAvLyB2ZXJpZnkgdGhhdCB3ZSBpbmplY3RlZCBhbGwgdmFsdWVzXG4gIGNvbnN0IGhhc1VubWF0Y2hlZFZhbHVlcyA9IE9iamVjdC5rZXlzKG1hdGNoZXMpLnNvbWUoa2V5ID0+ICEhbWF0Y2hlc1trZXldLmxlbmd0aCk7XG4gIGlmIChoYXNVbm1hdGNoZWRWYWx1ZXMpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYGkxOG4gcG9zdHByb2Nlc3M6IHVubWF0Y2hlZCB2YWx1ZXMgLSAke0pTT04uc3RyaW5naWZ5KG1hdGNoZXMpfWApO1xuICB9XG5cbiAgLy8gcmV0dXJuIGN1cnJlbnQgcmVzdWx0IGlmIG5vIHJlcGxhY2VtZW50cyBzcGVjaWZpZWRcbiAgaWYgKCFPYmplY3Qua2V5cyhyZXBsYWNlbWVudHMpLmxlbmd0aCkge1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvL1xuICAvLyBTdGVwIDI6IHJlcGxhY2UgYWxsIElDVSB2YXJzIChsaWtlIFwiVkFSX1BMVVJBTFwiKVxuICAvL1xuICByZXN1bHQgPSByZXN1bHQucmVwbGFjZShQUF9JQ1VfVkFSUywgKG1hdGNoLCBzdGFydCwga2V5LCBfdHlwZSwgX2lkeCwgZW5kKTogc3RyaW5nID0+IHtcbiAgICByZXR1cm4gcmVwbGFjZW1lbnRzLmhhc093blByb3BlcnR5KGtleSkgPyBgJHtzdGFydH0ke3JlcGxhY2VtZW50c1trZXldfSR7ZW5kfWAgOiBtYXRjaDtcbiAgfSk7XG5cbiAgLy9cbiAgLy8gU3RlcCAzOiByZXBsYWNlIGFsbCBJQ1UgcmVmZXJlbmNlcyB3aXRoIGNvcnJlc3BvbmRpbmcgdmFsdWVzIChsaWtlIO+/vUlDVV9FWFBfSUNVXzHvv70pXG4gIC8vIGluIGNhc2UgbXVsdGlwbGUgSUNVcyBoYXZlIHRoZSBzYW1lIHBsYWNlaG9sZGVyIG5hbWVcbiAgLy9cbiAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UoUFBfSUNVUywgKG1hdGNoLCBrZXkpOiBzdHJpbmcgPT4ge1xuICAgIGlmIChyZXBsYWNlbWVudHMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgY29uc3QgbGlzdCA9IHJlcGxhY2VtZW50c1trZXldIGFzIHN0cmluZ1tdO1xuICAgICAgaWYgKCFsaXN0Lmxlbmd0aCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGkxOG4gcG9zdHByb2Nlc3M6IHVubWF0Y2hlZCBJQ1UgLSAke21hdGNofSB3aXRoIGtleTogJHtrZXl9YCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbGlzdC5zaGlmdCgpICE7XG4gICAgfVxuICAgIHJldHVybiBtYXRjaDtcbiAgfSk7XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBUcmFuc2xhdGVzIGEgdHJhbnNsYXRpb24gYmxvY2sgbWFya2VkIGJ5IGBpMThuU3RhcnRgIGFuZCBgaTE4bkVuZGAuIEl0IGluc2VydHMgdGhlIHRleHQvSUNVIG5vZGVzXG4gKiBpbnRvIHRoZSByZW5kZXIgdHJlZSwgbW92ZXMgdGhlIHBsYWNlaG9sZGVyIG5vZGVzIGFuZCByZW1vdmVzIHRoZSBkZWxldGVkIG5vZGVzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gaTE4bkVuZCgpOiB2b2lkIHtcbiAgY29uc3QgdFZpZXcgPSBnZXRMVmlldygpW1RWSUVXXTtcbiAgbmdEZXZNb2RlICYmIGFzc2VydERlZmluZWQodFZpZXcsIGB0VmlldyBzaG91bGQgYmUgZGVmaW5lZGApO1xuICBpMThuRW5kRmlyc3RQYXNzKHRWaWV3KTtcbn1cblxuLyoqXG4gKiBTZWUgYGkxOG5FbmRgIGFib3ZlLlxuICovXG5mdW5jdGlvbiBpMThuRW5kRmlyc3RQYXNzKHRWaWV3OiBUVmlldykge1xuICBjb25zdCB2aWV3RGF0YSA9IGdldExWaWV3KCk7XG4gIG5nRGV2TW9kZSAmJiBhc3NlcnRFcXVhbChcbiAgICAgICAgICAgICAgICAgICB2aWV3RGF0YVtCSU5ESU5HX0lOREVYXSwgdmlld0RhdGFbVFZJRVddLmJpbmRpbmdTdGFydEluZGV4LFxuICAgICAgICAgICAgICAgICAgICdpMThuRW5kIHNob3VsZCBiZSBjYWxsZWQgYmVmb3JlIGFueSBiaW5kaW5nJyk7XG5cbiAgY29uc3Qgcm9vdEluZGV4ID0gaTE4bkluZGV4U3RhY2tbaTE4bkluZGV4U3RhY2tQb2ludGVyLS1dO1xuICBjb25zdCB0STE4biA9IHRWaWV3LmRhdGFbcm9vdEluZGV4ICsgSEVBREVSX09GRlNFVF0gYXMgVEkxOG47XG4gIG5nRGV2TW9kZSAmJiBhc3NlcnREZWZpbmVkKHRJMThuLCBgWW91IHNob3VsZCBjYWxsIGkxOG5TdGFydCBiZWZvcmUgaTE4bkVuZGApO1xuXG4gIC8vIFRoZSBsYXN0IHBsYWNlaG9sZGVyIHRoYXQgd2FzIGFkZGVkIGJlZm9yZSBgaTE4bkVuZGBcbiAgY29uc3QgcHJldmlvdXNPclBhcmVudFROb2RlID0gZ2V0UHJldmlvdXNPclBhcmVudFROb2RlKCk7XG4gIGNvbnN0IHZpc2l0ZWRQbGFjZWhvbGRlcnMgPVxuICAgICAgcmVhZENyZWF0ZU9wQ29kZXMocm9vdEluZGV4LCB0STE4bi5jcmVhdGUsIHRJMThuLmV4cGFuZG9TdGFydEluZGV4LCB2aWV3RGF0YSk7XG5cbiAgLy8gUmVtb3ZlIGRlbGV0ZWQgcGxhY2Vob2xkZXJzXG4gIC8vIFRoZSBsYXN0IHBsYWNlaG9sZGVyIHRoYXQgd2FzIGFkZGVkIGJlZm9yZSBgaTE4bkVuZGAgaXMgYHByZXZpb3VzT3JQYXJlbnRUTm9kZWBcbiAgZm9yIChsZXQgaSA9IHJvb3RJbmRleCArIDE7IGkgPD0gcHJldmlvdXNPclBhcmVudFROb2RlLmluZGV4IC0gSEVBREVSX09GRlNFVDsgaSsrKSB7XG4gICAgaWYgKHZpc2l0ZWRQbGFjZWhvbGRlcnMuaW5kZXhPZihpKSA9PT0gLTEpIHtcbiAgICAgIHJlbW92ZU5vZGUoaSwgdmlld0RhdGEpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiByZWFkQ3JlYXRlT3BDb2RlcyhcbiAgICBpbmRleDogbnVtYmVyLCBjcmVhdGVPcENvZGVzOiBJMThuTXV0YXRlT3BDb2RlcywgZXhwYW5kb1N0YXJ0SW5kZXg6IG51bWJlcixcbiAgICB2aWV3RGF0YTogTFZpZXcpOiBudW1iZXJbXSB7XG4gIGNvbnN0IHJlbmRlcmVyID0gZ2V0TFZpZXcoKVtSRU5ERVJFUl07XG4gIGxldCBjdXJyZW50VE5vZGU6IFROb2RlfG51bGwgPSBudWxsO1xuICBsZXQgcHJldmlvdXNUTm9kZTogVE5vZGV8bnVsbCA9IG51bGw7XG4gIGNvbnN0IHZpc2l0ZWRQbGFjZWhvbGRlcnM6IG51bWJlcltdID0gW107XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgY3JlYXRlT3BDb2Rlcy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IG9wQ29kZSA9IGNyZWF0ZU9wQ29kZXNbaV07XG4gICAgaWYgKHR5cGVvZiBvcENvZGUgPT0gJ3N0cmluZycpIHtcbiAgICAgIGNvbnN0IHRleHRSTm9kZSA9IGNyZWF0ZVRleHROb2RlKG9wQ29kZSwgcmVuZGVyZXIpO1xuICAgICAgbmdEZXZNb2RlICYmIG5nRGV2TW9kZS5yZW5kZXJlckNyZWF0ZVRleHROb2RlKys7XG4gICAgICBwcmV2aW91c1ROb2RlID0gY3VycmVudFROb2RlO1xuICAgICAgY3VycmVudFROb2RlID1cbiAgICAgICAgICBjcmVhdGVOb2RlQXRJbmRleChleHBhbmRvU3RhcnRJbmRleCsrLCBUTm9kZVR5cGUuRWxlbWVudCwgdGV4dFJOb2RlLCBudWxsLCBudWxsKTtcbiAgICAgIHNldElzUGFyZW50KGZhbHNlKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBvcENvZGUgPT0gJ251bWJlcicpIHtcbiAgICAgIHN3aXRjaCAob3BDb2RlICYgSTE4bk11dGF0ZU9wQ29kZS5NQVNLX09QQ09ERSkge1xuICAgICAgICBjYXNlIEkxOG5NdXRhdGVPcENvZGUuQXBwZW5kQ2hpbGQ6XG4gICAgICAgICAgY29uc3QgZGVzdGluYXRpb25Ob2RlSW5kZXggPSBvcENvZGUgPj4+IEkxOG5NdXRhdGVPcENvZGUuU0hJRlRfUEFSRU5UO1xuICAgICAgICAgIGxldCBkZXN0aW5hdGlvblROb2RlOiBUTm9kZTtcbiAgICAgICAgICBpZiAoZGVzdGluYXRpb25Ob2RlSW5kZXggPT09IGluZGV4KSB7XG4gICAgICAgICAgICAvLyBJZiB0aGUgZGVzdGluYXRpb24gbm9kZSBpcyBgaTE4blN0YXJ0YCwgd2UgZG9uJ3QgaGF2ZSBhXG4gICAgICAgICAgICAvLyB0b3AtbGV2ZWwgbm9kZSBhbmQgd2Ugc2hvdWxkIHVzZSB0aGUgaG9zdCBub2RlIGluc3RlYWRcbiAgICAgICAgICAgIGRlc3RpbmF0aW9uVE5vZGUgPSB2aWV3RGF0YVtIT1NUX05PREVdICE7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRlc3RpbmF0aW9uVE5vZGUgPSBnZXRUTm9kZShkZXN0aW5hdGlvbk5vZGVJbmRleCwgdmlld0RhdGEpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBuZ0Rldk1vZGUgJiZcbiAgICAgICAgICAgICAgYXNzZXJ0RGVmaW5lZChcbiAgICAgICAgICAgICAgICAgIGN1cnJlbnRUTm9kZSAhLFxuICAgICAgICAgICAgICAgICAgYFlvdSBuZWVkIHRvIGNyZWF0ZSBvciBzZWxlY3QgYSBub2RlIGJlZm9yZSB5b3UgY2FuIGluc2VydCBpdCBpbnRvIHRoZSBET01gKTtcbiAgICAgICAgICBwcmV2aW91c1ROb2RlID0gYXBwZW5kSTE4bk5vZGUoY3VycmVudFROb2RlICEsIGRlc3RpbmF0aW9uVE5vZGUsIHByZXZpb3VzVE5vZGUpO1xuICAgICAgICAgIGRlc3RpbmF0aW9uVE5vZGUubmV4dCA9IG51bGw7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgSTE4bk11dGF0ZU9wQ29kZS5TZWxlY3Q6XG4gICAgICAgICAgY29uc3Qgbm9kZUluZGV4ID0gb3BDb2RlID4+PiBJMThuTXV0YXRlT3BDb2RlLlNISUZUX1JFRjtcbiAgICAgICAgICB2aXNpdGVkUGxhY2Vob2xkZXJzLnB1c2gobm9kZUluZGV4KTtcbiAgICAgICAgICBwcmV2aW91c1ROb2RlID0gY3VycmVudFROb2RlO1xuICAgICAgICAgIGN1cnJlbnRUTm9kZSA9IGdldFROb2RlKG5vZGVJbmRleCwgdmlld0RhdGEpO1xuICAgICAgICAgIGlmIChjdXJyZW50VE5vZGUpIHtcbiAgICAgICAgICAgIHNldFByZXZpb3VzT3JQYXJlbnRUTm9kZShjdXJyZW50VE5vZGUpO1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRUTm9kZS50eXBlID09PSBUTm9kZVR5cGUuRWxlbWVudCkge1xuICAgICAgICAgICAgICBzZXRJc1BhcmVudCh0cnVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgSTE4bk11dGF0ZU9wQ29kZS5FbGVtZW50RW5kOlxuICAgICAgICAgIGNvbnN0IGVsZW1lbnRJbmRleCA9IG9wQ29kZSA+Pj4gSTE4bk11dGF0ZU9wQ29kZS5TSElGVF9SRUY7XG4gICAgICAgICAgcHJldmlvdXNUTm9kZSA9IGN1cnJlbnRUTm9kZSA9IGdldFROb2RlKGVsZW1lbnRJbmRleCwgdmlld0RhdGEpO1xuICAgICAgICAgIHNldFByZXZpb3VzT3JQYXJlbnRUTm9kZShjdXJyZW50VE5vZGUpO1xuICAgICAgICAgIHNldElzUGFyZW50KGZhbHNlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBJMThuTXV0YXRlT3BDb2RlLkF0dHI6XG4gICAgICAgICAgY29uc3QgZWxlbWVudE5vZGVJbmRleCA9IG9wQ29kZSA+Pj4gSTE4bk11dGF0ZU9wQ29kZS5TSElGVF9SRUY7XG4gICAgICAgICAgY29uc3QgYXR0ck5hbWUgPSBjcmVhdGVPcENvZGVzWysraV0gYXMgc3RyaW5nO1xuICAgICAgICAgIGNvbnN0IGF0dHJWYWx1ZSA9IGNyZWF0ZU9wQ29kZXNbKytpXSBhcyBzdHJpbmc7XG4gICAgICAgICAgZWxlbWVudEF0dHJpYnV0ZShlbGVtZW50Tm9kZUluZGV4LCBhdHRyTmFtZSwgYXR0clZhbHVlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuYWJsZSB0byBkZXRlcm1pbmUgdGhlIHR5cGUgb2YgbXV0YXRlIG9wZXJhdGlvbiBmb3IgXCIke29wQ29kZX1cImApO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzd2l0Y2ggKG9wQ29kZSkge1xuICAgICAgICBjYXNlIENPTU1FTlRfTUFSS0VSOlxuICAgICAgICAgIGNvbnN0IGNvbW1lbnRWYWx1ZSA9IGNyZWF0ZU9wQ29kZXNbKytpXSBhcyBzdHJpbmc7XG4gICAgICAgICAgbmdEZXZNb2RlICYmIGFzc2VydEVxdWFsKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZW9mIGNvbW1lbnRWYWx1ZSwgJ3N0cmluZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBgRXhwZWN0ZWQgXCIke2NvbW1lbnRWYWx1ZX1cIiB0byBiZSBhIGNvbW1lbnQgbm9kZSB2YWx1ZWApO1xuICAgICAgICAgIGNvbnN0IGNvbW1lbnRSTm9kZSA9IHJlbmRlcmVyLmNyZWF0ZUNvbW1lbnQoY29tbWVudFZhbHVlKTtcbiAgICAgICAgICBuZ0Rldk1vZGUgJiYgbmdEZXZNb2RlLnJlbmRlcmVyQ3JlYXRlQ29tbWVudCsrO1xuICAgICAgICAgIHByZXZpb3VzVE5vZGUgPSBjdXJyZW50VE5vZGU7XG4gICAgICAgICAgY3VycmVudFROb2RlID0gY3JlYXRlTm9kZUF0SW5kZXgoXG4gICAgICAgICAgICAgIGV4cGFuZG9TdGFydEluZGV4KyssIFROb2RlVHlwZS5JY3VDb250YWluZXIsIGNvbW1lbnRSTm9kZSwgbnVsbCwgbnVsbCk7XG4gICAgICAgICAgYXR0YWNoUGF0Y2hEYXRhKGNvbW1lbnRSTm9kZSwgdmlld0RhdGEpO1xuICAgICAgICAgIChjdXJyZW50VE5vZGUgYXMgVEljdUNvbnRhaW5lck5vZGUpLmFjdGl2ZUNhc2VJbmRleCA9IG51bGw7XG4gICAgICAgICAgLy8gV2Ugd2lsbCBhZGQgdGhlIGNhc2Ugbm9kZXMgbGF0ZXIsIGR1cmluZyB0aGUgdXBkYXRlIHBoYXNlXG4gICAgICAgICAgc2V0SXNQYXJlbnQoZmFsc2UpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEVMRU1FTlRfTUFSS0VSOlxuICAgICAgICAgIGNvbnN0IHRhZ05hbWVWYWx1ZSA9IGNyZWF0ZU9wQ29kZXNbKytpXSBhcyBzdHJpbmc7XG4gICAgICAgICAgbmdEZXZNb2RlICYmIGFzc2VydEVxdWFsKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZW9mIHRhZ05hbWVWYWx1ZSwgJ3N0cmluZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBgRXhwZWN0ZWQgXCIke3RhZ05hbWVWYWx1ZX1cIiB0byBiZSBhbiBlbGVtZW50IG5vZGUgdGFnIG5hbWVgKTtcbiAgICAgICAgICBjb25zdCBlbGVtZW50Uk5vZGUgPSByZW5kZXJlci5jcmVhdGVFbGVtZW50KHRhZ05hbWVWYWx1ZSk7XG4gICAgICAgICAgbmdEZXZNb2RlICYmIG5nRGV2TW9kZS5yZW5kZXJlckNyZWF0ZUVsZW1lbnQrKztcbiAgICAgICAgICBwcmV2aW91c1ROb2RlID0gY3VycmVudFROb2RlO1xuICAgICAgICAgIGN1cnJlbnRUTm9kZSA9IGNyZWF0ZU5vZGVBdEluZGV4KFxuICAgICAgICAgICAgICBleHBhbmRvU3RhcnRJbmRleCsrLCBUTm9kZVR5cGUuRWxlbWVudCwgZWxlbWVudFJOb2RlLCB0YWdOYW1lVmFsdWUsIG51bGwpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5hYmxlIHRvIGRldGVybWluZSB0aGUgdHlwZSBvZiBtdXRhdGUgb3BlcmF0aW9uIGZvciBcIiR7b3BDb2RlfVwiYCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgc2V0SXNQYXJlbnQoZmFsc2UpO1xuXG4gIHJldHVybiB2aXNpdGVkUGxhY2Vob2xkZXJzO1xufVxuXG5mdW5jdGlvbiByZWFkVXBkYXRlT3BDb2RlcyhcbiAgICB1cGRhdGVPcENvZGVzOiBJMThuVXBkYXRlT3BDb2RlcywgaWN1czogVEljdVtdIHwgbnVsbCwgYmluZGluZ3NTdGFydEluZGV4OiBudW1iZXIsXG4gICAgY2hhbmdlTWFzazogbnVtYmVyLCB2aWV3RGF0YTogTFZpZXcsIGJ5cGFzc0NoZWNrQml0ID0gZmFsc2UpIHtcbiAgbGV0IGNhc2VDcmVhdGVkID0gZmFsc2U7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgdXBkYXRlT3BDb2Rlcy5sZW5ndGg7IGkrKykge1xuICAgIC8vIGJpdCBjb2RlIHRvIGNoZWNrIGlmIHdlIHNob3VsZCBhcHBseSB0aGUgbmV4dCB1cGRhdGVcbiAgICBjb25zdCBjaGVja0JpdCA9IHVwZGF0ZU9wQ29kZXNbaV0gYXMgbnVtYmVyO1xuICAgIC8vIE51bWJlciBvZiBvcENvZGVzIHRvIHNraXAgdW50aWwgbmV4dCBzZXQgb2YgdXBkYXRlIGNvZGVzXG4gICAgY29uc3Qgc2tpcENvZGVzID0gdXBkYXRlT3BDb2Rlc1srK2ldIGFzIG51bWJlcjtcbiAgICBpZiAoYnlwYXNzQ2hlY2tCaXQgfHwgKGNoZWNrQml0ICYgY2hhbmdlTWFzaykpIHtcbiAgICAgIC8vIFRoZSB2YWx1ZSBoYXMgYmVlbiB1cGRhdGVkIHNpbmNlIGxhc3QgY2hlY2tlZFxuICAgICAgbGV0IHZhbHVlID0gJyc7XG4gICAgICBmb3IgKGxldCBqID0gaSArIDE7IGogPD0gKGkgKyBza2lwQ29kZXMpOyBqKyspIHtcbiAgICAgICAgY29uc3Qgb3BDb2RlID0gdXBkYXRlT3BDb2Rlc1tqXTtcbiAgICAgICAgaWYgKHR5cGVvZiBvcENvZGUgPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICB2YWx1ZSArPSBvcENvZGU7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIG9wQ29kZSA9PSAnbnVtYmVyJykge1xuICAgICAgICAgIGlmIChvcENvZGUgPCAwKSB7XG4gICAgICAgICAgICAvLyBJdCdzIGEgYmluZGluZyBpbmRleCB3aG9zZSB2YWx1ZSBpcyBuZWdhdGl2ZVxuICAgICAgICAgICAgdmFsdWUgKz0gc3RyaW5naWZ5KHZpZXdEYXRhW2JpbmRpbmdzU3RhcnRJbmRleCAtIG9wQ29kZV0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBub2RlSW5kZXggPSBvcENvZGUgPj4+IEkxOG5VcGRhdGVPcENvZGUuU0hJRlRfUkVGO1xuICAgICAgICAgICAgbGV0IHRJY3VJbmRleDogbnVtYmVyO1xuICAgICAgICAgICAgbGV0IHRJY3U6IFRJY3U7XG4gICAgICAgICAgICBsZXQgaWN1VE5vZGU6IFRJY3VDb250YWluZXJOb2RlO1xuICAgICAgICAgICAgc3dpdGNoIChvcENvZGUgJiBJMThuVXBkYXRlT3BDb2RlLk1BU0tfT1BDT0RFKSB7XG4gICAgICAgICAgICAgIGNhc2UgSTE4blVwZGF0ZU9wQ29kZS5BdHRyOlxuICAgICAgICAgICAgICAgIGNvbnN0IGF0dHJOYW1lID0gdXBkYXRlT3BDb2Rlc1srK2pdIGFzIHN0cmluZztcbiAgICAgICAgICAgICAgICBjb25zdCBzYW5pdGl6ZUZuID0gdXBkYXRlT3BDb2Rlc1srK2pdIGFzIFNhbml0aXplckZuIHwgbnVsbDtcbiAgICAgICAgICAgICAgICBlbGVtZW50QXR0cmlidXRlKG5vZGVJbmRleCwgYXR0ck5hbWUsIHZhbHVlLCBzYW5pdGl6ZUZuKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgY2FzZSBJMThuVXBkYXRlT3BDb2RlLlRleHQ6XG4gICAgICAgICAgICAgICAgdGV4dEJpbmRpbmcobm9kZUluZGV4LCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIGNhc2UgSTE4blVwZGF0ZU9wQ29kZS5JY3VTd2l0Y2g6XG4gICAgICAgICAgICAgICAgdEljdUluZGV4ID0gdXBkYXRlT3BDb2Rlc1srK2pdIGFzIG51bWJlcjtcbiAgICAgICAgICAgICAgICB0SWN1ID0gaWN1cyAhW3RJY3VJbmRleF07XG4gICAgICAgICAgICAgICAgaWN1VE5vZGUgPSBnZXRUTm9kZShub2RlSW5kZXgsIHZpZXdEYXRhKSBhcyBUSWN1Q29udGFpbmVyTm9kZTtcbiAgICAgICAgICAgICAgICAvLyBJZiB0aGVyZSBpcyBhbiBhY3RpdmUgY2FzZSwgZGVsZXRlIHRoZSBvbGQgbm9kZXNcbiAgICAgICAgICAgICAgICBpZiAoaWN1VE5vZGUuYWN0aXZlQ2FzZUluZGV4ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICBjb25zdCByZW1vdmVDb2RlcyA9IHRJY3UucmVtb3ZlW2ljdVROb2RlLmFjdGl2ZUNhc2VJbmRleF07XG4gICAgICAgICAgICAgICAgICBmb3IgKGxldCBrID0gMDsgayA8IHJlbW92ZUNvZGVzLmxlbmd0aDsgaysrKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlbW92ZU9wQ29kZSA9IHJlbW92ZUNvZGVzW2tdIGFzIG51bWJlcjtcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChyZW1vdmVPcENvZGUgJiBJMThuTXV0YXRlT3BDb2RlLk1BU0tfT1BDT0RFKSB7XG4gICAgICAgICAgICAgICAgICAgICAgY2FzZSBJMThuTXV0YXRlT3BDb2RlLlJlbW92ZTpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5vZGVJbmRleCA9IHJlbW92ZU9wQ29kZSA+Pj4gSTE4bk11dGF0ZU9wQ29kZS5TSElGVF9SRUY7XG4gICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVOb2RlKG5vZGVJbmRleCwgdmlld0RhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgY2FzZSBJMThuTXV0YXRlT3BDb2RlLlJlbW92ZU5lc3RlZEljdTpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5lc3RlZEljdU5vZGVJbmRleCA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlQ29kZXNbayArIDFdIGFzIG51bWJlciA+Pj4gSTE4bk11dGF0ZU9wQ29kZS5TSElGVF9SRUY7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXN0ZWRJY3VUTm9kZSA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2V0VE5vZGUobmVzdGVkSWN1Tm9kZUluZGV4LCB2aWV3RGF0YSkgYXMgVEljdUNvbnRhaW5lck5vZGU7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBhY3RpdmVJbmRleCA9IG5lc3RlZEljdVROb2RlLmFjdGl2ZUNhc2VJbmRleDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhY3RpdmVJbmRleCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXN0ZWRJY3VUSW5kZXggPSByZW1vdmVPcENvZGUgPj4+IEkxOG5NdXRhdGVPcENvZGUuU0hJRlRfUkVGO1xuICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXN0ZWRUSWN1ID0gaWN1cyAhW25lc3RlZEljdVRJbmRleF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGFkZEFsbFRvQXJyYXkobmVzdGVkVEljdS5yZW1vdmVbYWN0aXZlSW5kZXhdLCByZW1vdmVDb2Rlcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIFVwZGF0ZSB0aGUgYWN0aXZlIGNhc2VJbmRleFxuICAgICAgICAgICAgICAgIGNvbnN0IGNhc2VJbmRleCA9IGdldENhc2VJbmRleCh0SWN1LCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgaWN1VE5vZGUuYWN0aXZlQ2FzZUluZGV4ID0gY2FzZUluZGV4ICE9PSAtMSA/IGNhc2VJbmRleCA6IG51bGw7XG5cbiAgICAgICAgICAgICAgICAvLyBBZGQgdGhlIG5vZGVzIGZvciB0aGUgbmV3IGNhc2VcbiAgICAgICAgICAgICAgICByZWFkQ3JlYXRlT3BDb2RlcygtMSwgdEljdS5jcmVhdGVbY2FzZUluZGV4XSwgdEljdS5leHBhbmRvU3RhcnRJbmRleCwgdmlld0RhdGEpO1xuICAgICAgICAgICAgICAgIGNhc2VDcmVhdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgY2FzZSBJMThuVXBkYXRlT3BDb2RlLkljdVVwZGF0ZTpcbiAgICAgICAgICAgICAgICB0SWN1SW5kZXggPSB1cGRhdGVPcENvZGVzWysral0gYXMgbnVtYmVyO1xuICAgICAgICAgICAgICAgIHRJY3UgPSBpY3VzICFbdEljdUluZGV4XTtcbiAgICAgICAgICAgICAgICBpY3VUTm9kZSA9IGdldFROb2RlKG5vZGVJbmRleCwgdmlld0RhdGEpIGFzIFRJY3VDb250YWluZXJOb2RlO1xuICAgICAgICAgICAgICAgIHJlYWRVcGRhdGVPcENvZGVzKFxuICAgICAgICAgICAgICAgICAgICB0SWN1LnVwZGF0ZVtpY3VUTm9kZS5hY3RpdmVDYXNlSW5kZXggIV0sIGljdXMsIGJpbmRpbmdzU3RhcnRJbmRleCwgY2hhbmdlTWFzayxcbiAgICAgICAgICAgICAgICAgICAgdmlld0RhdGEsIGNhc2VDcmVhdGVkKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaSArPSBza2lwQ29kZXM7XG4gIH1cbn1cblxuZnVuY3Rpb24gcmVtb3ZlTm9kZShpbmRleDogbnVtYmVyLCB2aWV3RGF0YTogTFZpZXcpIHtcbiAgY29uc3QgcmVtb3ZlZFBoVE5vZGUgPSBnZXRUTm9kZShpbmRleCwgdmlld0RhdGEpO1xuICBjb25zdCByZW1vdmVkUGhSTm9kZSA9IGdldE5hdGl2ZUJ5SW5kZXgoaW5kZXgsIHZpZXdEYXRhKTtcbiAgcmVtb3ZlQ2hpbGQocmVtb3ZlZFBoVE5vZGUsIHJlbW92ZWRQaFJOb2RlIHx8IG51bGwsIHZpZXdEYXRhKTtcbiAgcmVtb3ZlZFBoVE5vZGUuZGV0YWNoZWQgPSB0cnVlO1xuICBuZ0Rldk1vZGUgJiYgbmdEZXZNb2RlLnJlbmRlcmVyUmVtb3ZlTm9kZSsrO1xuXG4gIGNvbnN0IHNsb3RWYWx1ZSA9IGxvYWQoaW5kZXgpIGFzIFJFbGVtZW50IHwgUkNvbW1lbnQgfCBMQ29udGFpbmVyIHwgU3R5bGluZ0NvbnRleHQ7XG4gIGlmIChpc0xDb250YWluZXIoc2xvdFZhbHVlKSkge1xuICAgIGNvbnN0IGxDb250YWluZXIgPSBzbG90VmFsdWUgYXMgTENvbnRhaW5lcjtcbiAgICBpZiAocmVtb3ZlZFBoVE5vZGUudHlwZSAhPT0gVE5vZGVUeXBlLkNvbnRhaW5lcikge1xuICAgICAgcmVtb3ZlQ2hpbGQocmVtb3ZlZFBoVE5vZGUsIGxDb250YWluZXJbTkFUSVZFXSB8fCBudWxsLCB2aWV3RGF0YSk7XG4gICAgfVxuICAgIGxDb250YWluZXJbUkVOREVSX1BBUkVOVF0gPSBudWxsO1xuICB9XG59XG5cbi8qKlxuICpcbiAqIFVzZSB0aGlzIGluc3RydWN0aW9uIHRvIGNyZWF0ZSBhIHRyYW5zbGF0aW9uIGJsb2NrIHRoYXQgZG9lc24ndCBjb250YWluIGFueSBwbGFjZWhvbGRlci5cbiAqIEl0IGNhbGxzIGJvdGgge0BsaW5rIGkxOG5TdGFydH0gYW5kIHtAbGluayBpMThuRW5kfSBpbiBvbmUgaW5zdHJ1Y3Rpb24uXG4gKlxuICogVGhlIHRyYW5zbGF0aW9uIGBtZXNzYWdlYCBpcyB0aGUgdmFsdWUgd2hpY2ggaXMgbG9jYWxlIHNwZWNpZmljLiBUaGUgdHJhbnNsYXRpb24gc3RyaW5nIG1heVxuICogY29udGFpbiBwbGFjZWhvbGRlcnMgd2hpY2ggYXNzb2NpYXRlIGlubmVyIGVsZW1lbnRzIGFuZCBzdWItdGVtcGxhdGVzIHdpdGhpbiB0aGUgdHJhbnNsYXRpb24uXG4gKlxuICogVGhlIHRyYW5zbGF0aW9uIGBtZXNzYWdlYCBwbGFjZWhvbGRlcnMgYXJlOlxuICogLSBg77+9e2luZGV4fSg6e2Jsb2NrfSnvv71gOiAqQmluZGluZyBQbGFjZWhvbGRlcio6IE1hcmtzIGEgbG9jYXRpb24gd2hlcmUgYW4gZXhwcmVzc2lvbiB3aWxsIGJlXG4gKiAgIGludGVycG9sYXRlZCBpbnRvLiBUaGUgcGxhY2Vob2xkZXIgYGluZGV4YCBwb2ludHMgdG8gdGhlIGV4cHJlc3Npb24gYmluZGluZyBpbmRleC4gQW4gb3B0aW9uYWxcbiAqICAgYGJsb2NrYCB0aGF0IG1hdGNoZXMgdGhlIHN1Yi10ZW1wbGF0ZSBpbiB3aGljaCBpdCB3YXMgZGVjbGFyZWQuXG4gKiAtIGDvv70je2luZGV4fSg6e2Jsb2NrfSnvv71gL2Dvv70vI3tpbmRleH0oOntibG9ja30p77+9YDogKkVsZW1lbnQgUGxhY2Vob2xkZXIqOiAgTWFya3MgdGhlIGJlZ2lubmluZ1xuICogICBhbmQgZW5kIG9mIERPTSBlbGVtZW50IHRoYXQgd2VyZSBlbWJlZGRlZCBpbiB0aGUgb3JpZ2luYWwgdHJhbnNsYXRpb24gYmxvY2suIFRoZSBwbGFjZWhvbGRlclxuICogICBgaW5kZXhgIHBvaW50cyB0byB0aGUgZWxlbWVudCBpbmRleCBpbiB0aGUgdGVtcGxhdGUgaW5zdHJ1Y3Rpb25zIHNldC4gQW4gb3B0aW9uYWwgYGJsb2NrYCB0aGF0XG4gKiAgIG1hdGNoZXMgdGhlIHN1Yi10ZW1wbGF0ZSBpbiB3aGljaCBpdCB3YXMgZGVjbGFyZWQuXG4gKiAtIGDvv70qe2luZGV4fTp7YmxvY2t977+9YC9g77+9Lyp7aW5kZXh9OntibG9ja33vv71gOiAqU3ViLXRlbXBsYXRlIFBsYWNlaG9sZGVyKjogU3ViLXRlbXBsYXRlcyBtdXN0IGJlXG4gKiAgIHNwbGl0IHVwIGFuZCB0cmFuc2xhdGVkIHNlcGFyYXRlbHkgaW4gZWFjaCBhbmd1bGFyIHRlbXBsYXRlIGZ1bmN0aW9uLiBUaGUgYGluZGV4YCBwb2ludHMgdG8gdGhlXG4gKiAgIGB0ZW1wbGF0ZWAgaW5zdHJ1Y3Rpb24gaW5kZXguIEEgYGJsb2NrYCB0aGF0IG1hdGNoZXMgdGhlIHN1Yi10ZW1wbGF0ZSBpbiB3aGljaCBpdCB3YXMgZGVjbGFyZWQuXG4gKlxuICogQHBhcmFtIGluZGV4IEEgdW5pcXVlIGluZGV4IG9mIHRoZSB0cmFuc2xhdGlvbiBpbiB0aGUgc3RhdGljIGJsb2NrLlxuICogQHBhcmFtIG1lc3NhZ2UgVGhlIHRyYW5zbGF0aW9uIG1lc3NhZ2UuXG4gKiBAcGFyYW0gc3ViVGVtcGxhdGVJbmRleCBPcHRpb25hbCBzdWItdGVtcGxhdGUgaW5kZXggaW4gdGhlIGBtZXNzYWdlYC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGkxOG4oaW5kZXg6IG51bWJlciwgbWVzc2FnZTogc3RyaW5nLCBzdWJUZW1wbGF0ZUluZGV4PzogbnVtYmVyKTogdm9pZCB7XG4gIGkxOG5TdGFydChpbmRleCwgbWVzc2FnZSwgc3ViVGVtcGxhdGVJbmRleCk7XG4gIGkxOG5FbmQoKTtcbn1cblxuLyoqXG4gKiBNYXJrcyBhIGxpc3Qgb2YgYXR0cmlidXRlcyBhcyB0cmFuc2xhdGFibGUuXG4gKlxuICogQHBhcmFtIGluZGV4IEEgdW5pcXVlIGluZGV4IGluIHRoZSBzdGF0aWMgYmxvY2tcbiAqIEBwYXJhbSB2YWx1ZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGkxOG5BdHRyaWJ1dGVzKGluZGV4OiBudW1iZXIsIHZhbHVlczogc3RyaW5nW10pOiB2b2lkIHtcbiAgY29uc3QgdFZpZXcgPSBnZXRMVmlldygpW1RWSUVXXTtcbiAgbmdEZXZNb2RlICYmIGFzc2VydERlZmluZWQodFZpZXcsIGB0VmlldyBzaG91bGQgYmUgZGVmaW5lZGApO1xuICBuZ0Rldk1vZGUgJiZcbiAgICAgIGFzc2VydEVxdWFsKFxuICAgICAgICAgIHRWaWV3LmZpcnN0VGVtcGxhdGVQYXNzLCB0cnVlLCBgWW91IHNob3VsZCBvbmx5IGNhbGwgaTE4bkVuZCBvbiBmaXJzdCB0ZW1wbGF0ZSBwYXNzYCk7XG4gIGlmICh0Vmlldy5maXJzdFRlbXBsYXRlUGFzcyAmJiB0Vmlldy5kYXRhW2luZGV4ICsgSEVBREVSX09GRlNFVF0gPT09IG51bGwpIHtcbiAgICBpMThuQXR0cmlidXRlc0ZpcnN0UGFzcyh0VmlldywgaW5kZXgsIHZhbHVlcyk7XG4gIH1cbn1cblxuLyoqXG4gKiBTZWUgYGkxOG5BdHRyaWJ1dGVzYCBhYm92ZS5cbiAqL1xuZnVuY3Rpb24gaTE4bkF0dHJpYnV0ZXNGaXJzdFBhc3ModFZpZXc6IFRWaWV3LCBpbmRleDogbnVtYmVyLCB2YWx1ZXM6IHN0cmluZ1tdKSB7XG4gIGNvbnN0IHByZXZpb3VzRWxlbWVudCA9IGdldFByZXZpb3VzT3JQYXJlbnRUTm9kZSgpO1xuICBjb25zdCBwcmV2aW91c0VsZW1lbnRJbmRleCA9IHByZXZpb3VzRWxlbWVudC5pbmRleCAtIEhFQURFUl9PRkZTRVQ7XG4gIGNvbnN0IHVwZGF0ZU9wQ29kZXM6IEkxOG5VcGRhdGVPcENvZGVzID0gW107XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgdmFsdWVzLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgY29uc3QgYXR0ck5hbWUgPSB2YWx1ZXNbaV07XG4gICAgY29uc3QgbWVzc2FnZSA9IHZhbHVlc1tpICsgMV07XG4gICAgY29uc3QgcGFydHMgPSBtZXNzYWdlLnNwbGl0KElDVV9SRUdFWFApO1xuICAgIGZvciAobGV0IGogPSAwOyBqIDwgcGFydHMubGVuZ3RoOyBqKyspIHtcbiAgICAgIGNvbnN0IHZhbHVlID0gcGFydHNbal07XG5cbiAgICAgIGlmIChqICYgMSkge1xuICAgICAgICAvLyBPZGQgaW5kZXhlcyBhcmUgSUNVIGV4cHJlc3Npb25zXG4gICAgICAgIC8vIFRPRE8ob2NvbWJlKTogc3VwcG9ydCBJQ1UgZXhwcmVzc2lvbnMgaW4gYXR0cmlidXRlc1xuICAgICAgfSBlbHNlIGlmICh2YWx1ZSAhPT0gJycpIHtcbiAgICAgICAgLy8gRXZlbiBpbmRleGVzIGFyZSB0ZXh0IChpbmNsdWRpbmcgYmluZGluZ3MpXG4gICAgICAgIGNvbnN0IGhhc0JpbmRpbmcgPSAhIXZhbHVlLm1hdGNoKEJJTkRJTkdfUkVHRVhQKTtcbiAgICAgICAgaWYgKGhhc0JpbmRpbmcpIHtcbiAgICAgICAgICBhZGRBbGxUb0FycmF5KFxuICAgICAgICAgICAgICBnZW5lcmF0ZUJpbmRpbmdVcGRhdGVPcENvZGVzKHZhbHVlLCBwcmV2aW91c0VsZW1lbnRJbmRleCwgYXR0ck5hbWUpLCB1cGRhdGVPcENvZGVzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBlbGVtZW50QXR0cmlidXRlKHByZXZpb3VzRWxlbWVudEluZGV4LCBhdHRyTmFtZSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgdFZpZXcuZGF0YVtpbmRleCArIEhFQURFUl9PRkZTRVRdID0gdXBkYXRlT3BDb2Rlcztcbn1cblxubGV0IGNoYW5nZU1hc2sgPSAwYjA7XG5sZXQgc2hpZnRzQ291bnRlciA9IDA7XG5cbi8qKlxuICogU3RvcmVzIHRoZSB2YWx1ZXMgb2YgdGhlIGJpbmRpbmdzIGR1cmluZyBlYWNoIHVwZGF0ZSBjeWNsZSBpbiBvcmRlciB0byBkZXRlcm1pbmUgaWYgd2UgbmVlZCB0b1xuICogdXBkYXRlIHRoZSB0cmFuc2xhdGVkIG5vZGVzLlxuICpcbiAqIEBwYXJhbSBleHByZXNzaW9uIFRoZSBiaW5kaW5nJ3MgbmV3IHZhbHVlIG9yIE5PX0NIQU5HRVxuICovXG5leHBvcnQgZnVuY3Rpb24gaTE4bkV4cDxUPihleHByZXNzaW9uOiBUIHwgTk9fQ0hBTkdFKTogdm9pZCB7XG4gIGlmIChleHByZXNzaW9uICE9PSBOT19DSEFOR0UpIHtcbiAgICBjaGFuZ2VNYXNrID0gY2hhbmdlTWFzayB8ICgxIDw8IHNoaWZ0c0NvdW50ZXIpO1xuICB9XG4gIHNoaWZ0c0NvdW50ZXIrKztcbn1cblxuLyoqXG4gKiBVcGRhdGVzIGEgdHJhbnNsYXRpb24gYmxvY2sgb3IgYW4gaTE4biBhdHRyaWJ1dGUgd2hlbiB0aGUgYmluZGluZ3MgaGF2ZSBjaGFuZ2VkLlxuICpcbiAqIEBwYXJhbSBpbmRleCBJbmRleCBvZiBlaXRoZXIge0BsaW5rIGkxOG5TdGFydH0gKHRyYW5zbGF0aW9uIGJsb2NrKSBvciB7QGxpbmsgaTE4bkF0dHJpYnV0ZXN9XG4gKiAoaTE4biBhdHRyaWJ1dGUpIG9uIHdoaWNoIGl0IHNob3VsZCB1cGRhdGUgdGhlIGNvbnRlbnQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpMThuQXBwbHkoaW5kZXg6IG51bWJlcikge1xuICBpZiAoc2hpZnRzQ291bnRlcikge1xuICAgIGNvbnN0IGxWaWV3ID0gZ2V0TFZpZXcoKTtcbiAgICBjb25zdCB0VmlldyA9IGxWaWV3W1RWSUVXXTtcbiAgICBuZ0Rldk1vZGUgJiYgYXNzZXJ0RGVmaW5lZCh0VmlldywgYHRWaWV3IHNob3VsZCBiZSBkZWZpbmVkYCk7XG4gICAgY29uc3QgdEkxOG4gPSB0Vmlldy5kYXRhW2luZGV4ICsgSEVBREVSX09GRlNFVF07XG4gICAgbGV0IHVwZGF0ZU9wQ29kZXM6IEkxOG5VcGRhdGVPcENvZGVzO1xuICAgIGxldCBpY3VzOiBUSWN1W118bnVsbCA9IG51bGw7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkodEkxOG4pKSB7XG4gICAgICB1cGRhdGVPcENvZGVzID0gdEkxOG4gYXMgSTE4blVwZGF0ZU9wQ29kZXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIHVwZGF0ZU9wQ29kZXMgPSAodEkxOG4gYXMgVEkxOG4pLnVwZGF0ZTtcbiAgICAgIGljdXMgPSAodEkxOG4gYXMgVEkxOG4pLmljdXM7XG4gICAgfVxuICAgIGNvbnN0IGJpbmRpbmdzU3RhcnRJbmRleCA9IGxWaWV3W0JJTkRJTkdfSU5ERVhdIC0gc2hpZnRzQ291bnRlciAtIDE7XG4gICAgcmVhZFVwZGF0ZU9wQ29kZXModXBkYXRlT3BDb2RlcywgaWN1cywgYmluZGluZ3NTdGFydEluZGV4LCBjaGFuZ2VNYXNrLCBsVmlldyk7XG5cbiAgICAvLyBSZXNldCBjaGFuZ2VNYXNrICYgbWFza0JpdCB0byBkZWZhdWx0IGZvciB0aGUgbmV4dCB1cGRhdGUgY3ljbGVcbiAgICBjaGFuZ2VNYXNrID0gMGIwO1xuICAgIHNoaWZ0c0NvdW50ZXIgPSAwO1xuICB9XG59XG5cbmVudW0gUGx1cmFsIHtcbiAgWmVybyA9IDAsXG4gIE9uZSA9IDEsXG4gIFR3byA9IDIsXG4gIEZldyA9IDMsXG4gIE1hbnkgPSA0LFxuICBPdGhlciA9IDUsXG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgcGx1cmFsIGNhc2UgYmFzZWQgb24gdGhlIGxvY2FsZS5cbiAqIFRoaXMgaXMgYSBjb3B5IG9mIHRoZSBkZXByZWNhdGVkIGZ1bmN0aW9uIHRoYXQgd2UgdXNlZCBpbiBBbmd1bGFyIHY0LlxuICogLy8gVE9ETyhvY29tYmUpOiByZW1vdmUgdGhpcyBvbmNlIHdlIGNhbiB0aGUgcmVhbCBnZXRQbHVyYWxDYXNlIGZ1bmN0aW9uXG4gKlxuICogQGRlcHJlY2F0ZWQgZnJvbSB2NSB0aGUgcGx1cmFsIGNhc2UgZnVuY3Rpb24gaXMgaW4gbG9jYWxlIGRhdGEgZmlsZXMgY29tbW9uL2xvY2FsZXMvKi50c1xuICovXG5mdW5jdGlvbiBnZXRQbHVyYWxDYXNlKGxvY2FsZTogc3RyaW5nLCBuTGlrZTogbnVtYmVyIHwgc3RyaW5nKTogUGx1cmFsIHtcbiAgaWYgKHR5cGVvZiBuTGlrZSA9PT0gJ3N0cmluZycpIHtcbiAgICBuTGlrZSA9IHBhcnNlSW50KDxzdHJpbmc+bkxpa2UsIDEwKTtcbiAgfVxuICBjb25zdCBuOiBudW1iZXIgPSBuTGlrZSBhcyBudW1iZXI7XG4gIGNvbnN0IG5EZWNpbWFsID0gbi50b1N0cmluZygpLnJlcGxhY2UoL15bXi5dKlxcLj8vLCAnJyk7XG4gIGNvbnN0IGkgPSBNYXRoLmZsb29yKE1hdGguYWJzKG4pKTtcbiAgY29uc3QgdiA9IG5EZWNpbWFsLmxlbmd0aDtcbiAgY29uc3QgZiA9IHBhcnNlSW50KG5EZWNpbWFsLCAxMCk7XG4gIGNvbnN0IHQgPSBwYXJzZUludChuLnRvU3RyaW5nKCkucmVwbGFjZSgvXlteLl0qXFwuP3wwKyQvZywgJycpLCAxMCkgfHwgMDtcblxuICBjb25zdCBsYW5nID0gbG9jYWxlLnNwbGl0KCctJylbMF0udG9Mb3dlckNhc2UoKTtcblxuICBzd2l0Y2ggKGxhbmcpIHtcbiAgICBjYXNlICdhZic6XG4gICAgY2FzZSAnYXNhJzpcbiAgICBjYXNlICdheic6XG4gICAgY2FzZSAnYmVtJzpcbiAgICBjYXNlICdiZXonOlxuICAgIGNhc2UgJ2JnJzpcbiAgICBjYXNlICdicngnOlxuICAgIGNhc2UgJ2NlJzpcbiAgICBjYXNlICdjZ2cnOlxuICAgIGNhc2UgJ2Nocic6XG4gICAgY2FzZSAnY2tiJzpcbiAgICBjYXNlICdlZSc6XG4gICAgY2FzZSAnZWwnOlxuICAgIGNhc2UgJ2VvJzpcbiAgICBjYXNlICdlcyc6XG4gICAgY2FzZSAnZXUnOlxuICAgIGNhc2UgJ2ZvJzpcbiAgICBjYXNlICdmdXInOlxuICAgIGNhc2UgJ2dzdyc6XG4gICAgY2FzZSAnaGEnOlxuICAgIGNhc2UgJ2hhdyc6XG4gICAgY2FzZSAnaHUnOlxuICAgIGNhc2UgJ2pnbyc6XG4gICAgY2FzZSAnam1jJzpcbiAgICBjYXNlICdrYSc6XG4gICAgY2FzZSAna2snOlxuICAgIGNhc2UgJ2traic6XG4gICAgY2FzZSAna2wnOlxuICAgIGNhc2UgJ2tzJzpcbiAgICBjYXNlICdrc2InOlxuICAgIGNhc2UgJ2t5JzpcbiAgICBjYXNlICdsYic6XG4gICAgY2FzZSAnbGcnOlxuICAgIGNhc2UgJ21hcyc6XG4gICAgY2FzZSAnbWdvJzpcbiAgICBjYXNlICdtbCc6XG4gICAgY2FzZSAnbW4nOlxuICAgIGNhc2UgJ25iJzpcbiAgICBjYXNlICduZCc6XG4gICAgY2FzZSAnbmUnOlxuICAgIGNhc2UgJ25uJzpcbiAgICBjYXNlICdubmgnOlxuICAgIGNhc2UgJ255bic6XG4gICAgY2FzZSAnb20nOlxuICAgIGNhc2UgJ29yJzpcbiAgICBjYXNlICdvcyc6XG4gICAgY2FzZSAncHMnOlxuICAgIGNhc2UgJ3JtJzpcbiAgICBjYXNlICdyb2YnOlxuICAgIGNhc2UgJ3J3ayc6XG4gICAgY2FzZSAnc2FxJzpcbiAgICBjYXNlICdzZWgnOlxuICAgIGNhc2UgJ3NuJzpcbiAgICBjYXNlICdzbyc6XG4gICAgY2FzZSAnc3EnOlxuICAgIGNhc2UgJ3RhJzpcbiAgICBjYXNlICd0ZSc6XG4gICAgY2FzZSAndGVvJzpcbiAgICBjYXNlICd0ayc6XG4gICAgY2FzZSAndHInOlxuICAgIGNhc2UgJ3VnJzpcbiAgICBjYXNlICd1eic6XG4gICAgY2FzZSAndm8nOlxuICAgIGNhc2UgJ3Z1bic6XG4gICAgY2FzZSAnd2FlJzpcbiAgICBjYXNlICd4b2cnOlxuICAgICAgaWYgKG4gPT09IDEpIHJldHVybiBQbHVyYWwuT25lO1xuICAgICAgcmV0dXJuIFBsdXJhbC5PdGhlcjtcbiAgICBjYXNlICdhayc6XG4gICAgY2FzZSAnbG4nOlxuICAgIGNhc2UgJ21nJzpcbiAgICBjYXNlICdwYSc6XG4gICAgY2FzZSAndGknOlxuICAgICAgaWYgKG4gPT09IE1hdGguZmxvb3IobikgJiYgbiA+PSAwICYmIG4gPD0gMSkgcmV0dXJuIFBsdXJhbC5PbmU7XG4gICAgICByZXR1cm4gUGx1cmFsLk90aGVyO1xuICAgIGNhc2UgJ2FtJzpcbiAgICBjYXNlICdhcyc6XG4gICAgY2FzZSAnYm4nOlxuICAgIGNhc2UgJ2ZhJzpcbiAgICBjYXNlICdndSc6XG4gICAgY2FzZSAnaGknOlxuICAgIGNhc2UgJ2tuJzpcbiAgICBjYXNlICdtcic6XG4gICAgY2FzZSAnenUnOlxuICAgICAgaWYgKGkgPT09IDAgfHwgbiA9PT0gMSkgcmV0dXJuIFBsdXJhbC5PbmU7XG4gICAgICByZXR1cm4gUGx1cmFsLk90aGVyO1xuICAgIGNhc2UgJ2FyJzpcbiAgICAgIGlmIChuID09PSAwKSByZXR1cm4gUGx1cmFsLlplcm87XG4gICAgICBpZiAobiA9PT0gMSkgcmV0dXJuIFBsdXJhbC5PbmU7XG4gICAgICBpZiAobiA9PT0gMikgcmV0dXJuIFBsdXJhbC5Ud287XG4gICAgICBpZiAobiAlIDEwMCA9PT0gTWF0aC5mbG9vcihuICUgMTAwKSAmJiBuICUgMTAwID49IDMgJiYgbiAlIDEwMCA8PSAxMCkgcmV0dXJuIFBsdXJhbC5GZXc7XG4gICAgICBpZiAobiAlIDEwMCA9PT0gTWF0aC5mbG9vcihuICUgMTAwKSAmJiBuICUgMTAwID49IDExICYmIG4gJSAxMDAgPD0gOTkpIHJldHVybiBQbHVyYWwuTWFueTtcbiAgICAgIHJldHVybiBQbHVyYWwuT3RoZXI7XG4gICAgY2FzZSAnYXN0JzpcbiAgICBjYXNlICdjYSc6XG4gICAgY2FzZSAnZGUnOlxuICAgIGNhc2UgJ2VuJzpcbiAgICBjYXNlICdldCc6XG4gICAgY2FzZSAnZmknOlxuICAgIGNhc2UgJ2Z5JzpcbiAgICBjYXNlICdnbCc6XG4gICAgY2FzZSAnaXQnOlxuICAgIGNhc2UgJ25sJzpcbiAgICBjYXNlICdzdic6XG4gICAgY2FzZSAnc3cnOlxuICAgIGNhc2UgJ3VyJzpcbiAgICBjYXNlICd5aSc6XG4gICAgICBpZiAoaSA9PT0gMSAmJiB2ID09PSAwKSByZXR1cm4gUGx1cmFsLk9uZTtcbiAgICAgIHJldHVybiBQbHVyYWwuT3RoZXI7XG4gICAgY2FzZSAnYmUnOlxuICAgICAgaWYgKG4gJSAxMCA9PT0gMSAmJiAhKG4gJSAxMDAgPT09IDExKSkgcmV0dXJuIFBsdXJhbC5PbmU7XG4gICAgICBpZiAobiAlIDEwID09PSBNYXRoLmZsb29yKG4gJSAxMCkgJiYgbiAlIDEwID49IDIgJiYgbiAlIDEwIDw9IDQgJiZcbiAgICAgICAgICAhKG4gJSAxMDAgPj0gMTIgJiYgbiAlIDEwMCA8PSAxNCkpXG4gICAgICAgIHJldHVybiBQbHVyYWwuRmV3O1xuICAgICAgaWYgKG4gJSAxMCA9PT0gMCB8fCBuICUgMTAgPT09IE1hdGguZmxvb3IobiAlIDEwKSAmJiBuICUgMTAgPj0gNSAmJiBuICUgMTAgPD0gOSB8fFxuICAgICAgICAgIG4gJSAxMDAgPT09IE1hdGguZmxvb3IobiAlIDEwMCkgJiYgbiAlIDEwMCA+PSAxMSAmJiBuICUgMTAwIDw9IDE0KVxuICAgICAgICByZXR1cm4gUGx1cmFsLk1hbnk7XG4gICAgICByZXR1cm4gUGx1cmFsLk90aGVyO1xuICAgIGNhc2UgJ2JyJzpcbiAgICAgIGlmIChuICUgMTAgPT09IDEgJiYgIShuICUgMTAwID09PSAxMSB8fCBuICUgMTAwID09PSA3MSB8fCBuICUgMTAwID09PSA5MSkpIHJldHVybiBQbHVyYWwuT25lO1xuICAgICAgaWYgKG4gJSAxMCA9PT0gMiAmJiAhKG4gJSAxMDAgPT09IDEyIHx8IG4gJSAxMDAgPT09IDcyIHx8IG4gJSAxMDAgPT09IDkyKSkgcmV0dXJuIFBsdXJhbC5Ud287XG4gICAgICBpZiAobiAlIDEwID09PSBNYXRoLmZsb29yKG4gJSAxMCkgJiYgKG4gJSAxMCA+PSAzICYmIG4gJSAxMCA8PSA0IHx8IG4gJSAxMCA9PT0gOSkgJiZcbiAgICAgICAgICAhKG4gJSAxMDAgPj0gMTAgJiYgbiAlIDEwMCA8PSAxOSB8fCBuICUgMTAwID49IDcwICYmIG4gJSAxMDAgPD0gNzkgfHxcbiAgICAgICAgICAgIG4gJSAxMDAgPj0gOTAgJiYgbiAlIDEwMCA8PSA5OSkpXG4gICAgICAgIHJldHVybiBQbHVyYWwuRmV3O1xuICAgICAgaWYgKCEobiA9PT0gMCkgJiYgbiAlIDFlNiA9PT0gMCkgcmV0dXJuIFBsdXJhbC5NYW55O1xuICAgICAgcmV0dXJuIFBsdXJhbC5PdGhlcjtcbiAgICBjYXNlICdicyc6XG4gICAgY2FzZSAnaHInOlxuICAgIGNhc2UgJ3NyJzpcbiAgICAgIGlmICh2ID09PSAwICYmIGkgJSAxMCA9PT0gMSAmJiAhKGkgJSAxMDAgPT09IDExKSB8fCBmICUgMTAgPT09IDEgJiYgIShmICUgMTAwID09PSAxMSkpXG4gICAgICAgIHJldHVybiBQbHVyYWwuT25lO1xuICAgICAgaWYgKHYgPT09IDAgJiYgaSAlIDEwID09PSBNYXRoLmZsb29yKGkgJSAxMCkgJiYgaSAlIDEwID49IDIgJiYgaSAlIDEwIDw9IDQgJiZcbiAgICAgICAgICAgICAgIShpICUgMTAwID49IDEyICYmIGkgJSAxMDAgPD0gMTQpIHx8XG4gICAgICAgICAgZiAlIDEwID09PSBNYXRoLmZsb29yKGYgJSAxMCkgJiYgZiAlIDEwID49IDIgJiYgZiAlIDEwIDw9IDQgJiZcbiAgICAgICAgICAgICAgIShmICUgMTAwID49IDEyICYmIGYgJSAxMDAgPD0gMTQpKVxuICAgICAgICByZXR1cm4gUGx1cmFsLkZldztcbiAgICAgIHJldHVybiBQbHVyYWwuT3RoZXI7XG4gICAgY2FzZSAnY3MnOlxuICAgIGNhc2UgJ3NrJzpcbiAgICAgIGlmIChpID09PSAxICYmIHYgPT09IDApIHJldHVybiBQbHVyYWwuT25lO1xuICAgICAgaWYgKGkgPT09IE1hdGguZmxvb3IoaSkgJiYgaSA+PSAyICYmIGkgPD0gNCAmJiB2ID09PSAwKSByZXR1cm4gUGx1cmFsLkZldztcbiAgICAgIGlmICghKHYgPT09IDApKSByZXR1cm4gUGx1cmFsLk1hbnk7XG4gICAgICByZXR1cm4gUGx1cmFsLk90aGVyO1xuICAgIGNhc2UgJ2N5JzpcbiAgICAgIGlmIChuID09PSAwKSByZXR1cm4gUGx1cmFsLlplcm87XG4gICAgICBpZiAobiA9PT0gMSkgcmV0dXJuIFBsdXJhbC5PbmU7XG4gICAgICBpZiAobiA9PT0gMikgcmV0dXJuIFBsdXJhbC5Ud287XG4gICAgICBpZiAobiA9PT0gMykgcmV0dXJuIFBsdXJhbC5GZXc7XG4gICAgICBpZiAobiA9PT0gNikgcmV0dXJuIFBsdXJhbC5NYW55O1xuICAgICAgcmV0dXJuIFBsdXJhbC5PdGhlcjtcbiAgICBjYXNlICdkYSc6XG4gICAgICBpZiAobiA9PT0gMSB8fCAhKHQgPT09IDApICYmIChpID09PSAwIHx8IGkgPT09IDEpKSByZXR1cm4gUGx1cmFsLk9uZTtcbiAgICAgIHJldHVybiBQbHVyYWwuT3RoZXI7XG4gICAgY2FzZSAnZHNiJzpcbiAgICBjYXNlICdoc2InOlxuICAgICAgaWYgKHYgPT09IDAgJiYgaSAlIDEwMCA9PT0gMSB8fCBmICUgMTAwID09PSAxKSByZXR1cm4gUGx1cmFsLk9uZTtcbiAgICAgIGlmICh2ID09PSAwICYmIGkgJSAxMDAgPT09IDIgfHwgZiAlIDEwMCA9PT0gMikgcmV0dXJuIFBsdXJhbC5Ud287XG4gICAgICBpZiAodiA9PT0gMCAmJiBpICUgMTAwID09PSBNYXRoLmZsb29yKGkgJSAxMDApICYmIGkgJSAxMDAgPj0gMyAmJiBpICUgMTAwIDw9IDQgfHxcbiAgICAgICAgICBmICUgMTAwID09PSBNYXRoLmZsb29yKGYgJSAxMDApICYmIGYgJSAxMDAgPj0gMyAmJiBmICUgMTAwIDw9IDQpXG4gICAgICAgIHJldHVybiBQbHVyYWwuRmV3O1xuICAgICAgcmV0dXJuIFBsdXJhbC5PdGhlcjtcbiAgICBjYXNlICdmZic6XG4gICAgY2FzZSAnZnInOlxuICAgIGNhc2UgJ2h5JzpcbiAgICBjYXNlICdrYWInOlxuICAgICAgaWYgKGkgPT09IDAgfHwgaSA9PT0gMSkgcmV0dXJuIFBsdXJhbC5PbmU7XG4gICAgICByZXR1cm4gUGx1cmFsLk90aGVyO1xuICAgIGNhc2UgJ2ZpbCc6XG4gICAgICBpZiAodiA9PT0gMCAmJiAoaSA9PT0gMSB8fCBpID09PSAyIHx8IGkgPT09IDMpIHx8XG4gICAgICAgICAgdiA9PT0gMCAmJiAhKGkgJSAxMCA9PT0gNCB8fCBpICUgMTAgPT09IDYgfHwgaSAlIDEwID09PSA5KSB8fFxuICAgICAgICAgICEodiA9PT0gMCkgJiYgIShmICUgMTAgPT09IDQgfHwgZiAlIDEwID09PSA2IHx8IGYgJSAxMCA9PT0gOSkpXG4gICAgICAgIHJldHVybiBQbHVyYWwuT25lO1xuICAgICAgcmV0dXJuIFBsdXJhbC5PdGhlcjtcbiAgICBjYXNlICdnYSc6XG4gICAgICBpZiAobiA9PT0gMSkgcmV0dXJuIFBsdXJhbC5PbmU7XG4gICAgICBpZiAobiA9PT0gMikgcmV0dXJuIFBsdXJhbC5Ud287XG4gICAgICBpZiAobiA9PT0gTWF0aC5mbG9vcihuKSAmJiBuID49IDMgJiYgbiA8PSA2KSByZXR1cm4gUGx1cmFsLkZldztcbiAgICAgIGlmIChuID09PSBNYXRoLmZsb29yKG4pICYmIG4gPj0gNyAmJiBuIDw9IDEwKSByZXR1cm4gUGx1cmFsLk1hbnk7XG4gICAgICByZXR1cm4gUGx1cmFsLk90aGVyO1xuICAgIGNhc2UgJ2dkJzpcbiAgICAgIGlmIChuID09PSAxIHx8IG4gPT09IDExKSByZXR1cm4gUGx1cmFsLk9uZTtcbiAgICAgIGlmIChuID09PSAyIHx8IG4gPT09IDEyKSByZXR1cm4gUGx1cmFsLlR3bztcbiAgICAgIGlmIChuID09PSBNYXRoLmZsb29yKG4pICYmIChuID49IDMgJiYgbiA8PSAxMCB8fCBuID49IDEzICYmIG4gPD0gMTkpKSByZXR1cm4gUGx1cmFsLkZldztcbiAgICAgIHJldHVybiBQbHVyYWwuT3RoZXI7XG4gICAgY2FzZSAnZ3YnOlxuICAgICAgaWYgKHYgPT09IDAgJiYgaSAlIDEwID09PSAxKSByZXR1cm4gUGx1cmFsLk9uZTtcbiAgICAgIGlmICh2ID09PSAwICYmIGkgJSAxMCA9PT0gMikgcmV0dXJuIFBsdXJhbC5Ud287XG4gICAgICBpZiAodiA9PT0gMCAmJlxuICAgICAgICAgIChpICUgMTAwID09PSAwIHx8IGkgJSAxMDAgPT09IDIwIHx8IGkgJSAxMDAgPT09IDQwIHx8IGkgJSAxMDAgPT09IDYwIHx8IGkgJSAxMDAgPT09IDgwKSlcbiAgICAgICAgcmV0dXJuIFBsdXJhbC5GZXc7XG4gICAgICBpZiAoISh2ID09PSAwKSkgcmV0dXJuIFBsdXJhbC5NYW55O1xuICAgICAgcmV0dXJuIFBsdXJhbC5PdGhlcjtcbiAgICBjYXNlICdoZSc6XG4gICAgICBpZiAoaSA9PT0gMSAmJiB2ID09PSAwKSByZXR1cm4gUGx1cmFsLk9uZTtcbiAgICAgIGlmIChpID09PSAyICYmIHYgPT09IDApIHJldHVybiBQbHVyYWwuVHdvO1xuICAgICAgaWYgKHYgPT09IDAgJiYgIShuID49IDAgJiYgbiA8PSAxMCkgJiYgbiAlIDEwID09PSAwKSByZXR1cm4gUGx1cmFsLk1hbnk7XG4gICAgICByZXR1cm4gUGx1cmFsLk90aGVyO1xuICAgIGNhc2UgJ2lzJzpcbiAgICAgIGlmICh0ID09PSAwICYmIGkgJSAxMCA9PT0gMSAmJiAhKGkgJSAxMDAgPT09IDExKSB8fCAhKHQgPT09IDApKSByZXR1cm4gUGx1cmFsLk9uZTtcbiAgICAgIHJldHVybiBQbHVyYWwuT3RoZXI7XG4gICAgY2FzZSAna3NoJzpcbiAgICAgIGlmIChuID09PSAwKSByZXR1cm4gUGx1cmFsLlplcm87XG4gICAgICBpZiAobiA9PT0gMSkgcmV0dXJuIFBsdXJhbC5PbmU7XG4gICAgICByZXR1cm4gUGx1cmFsLk90aGVyO1xuICAgIGNhc2UgJ2t3JzpcbiAgICBjYXNlICduYXEnOlxuICAgIGNhc2UgJ3NlJzpcbiAgICBjYXNlICdzbW4nOlxuICAgICAgaWYgKG4gPT09IDEpIHJldHVybiBQbHVyYWwuT25lO1xuICAgICAgaWYgKG4gPT09IDIpIHJldHVybiBQbHVyYWwuVHdvO1xuICAgICAgcmV0dXJuIFBsdXJhbC5PdGhlcjtcbiAgICBjYXNlICdsYWcnOlxuICAgICAgaWYgKG4gPT09IDApIHJldHVybiBQbHVyYWwuWmVybztcbiAgICAgIGlmICgoaSA9PT0gMCB8fCBpID09PSAxKSAmJiAhKG4gPT09IDApKSByZXR1cm4gUGx1cmFsLk9uZTtcbiAgICAgIHJldHVybiBQbHVyYWwuT3RoZXI7XG4gICAgY2FzZSAnbHQnOlxuICAgICAgaWYgKG4gJSAxMCA9PT0gMSAmJiAhKG4gJSAxMDAgPj0gMTEgJiYgbiAlIDEwMCA8PSAxOSkpIHJldHVybiBQbHVyYWwuT25lO1xuICAgICAgaWYgKG4gJSAxMCA9PT0gTWF0aC5mbG9vcihuICUgMTApICYmIG4gJSAxMCA+PSAyICYmIG4gJSAxMCA8PSA5ICYmXG4gICAgICAgICAgIShuICUgMTAwID49IDExICYmIG4gJSAxMDAgPD0gMTkpKVxuICAgICAgICByZXR1cm4gUGx1cmFsLkZldztcbiAgICAgIGlmICghKGYgPT09IDApKSByZXR1cm4gUGx1cmFsLk1hbnk7XG4gICAgICByZXR1cm4gUGx1cmFsLk90aGVyO1xuICAgIGNhc2UgJ2x2JzpcbiAgICBjYXNlICdwcmcnOlxuICAgICAgaWYgKG4gJSAxMCA9PT0gMCB8fCBuICUgMTAwID09PSBNYXRoLmZsb29yKG4gJSAxMDApICYmIG4gJSAxMDAgPj0gMTEgJiYgbiAlIDEwMCA8PSAxOSB8fFxuICAgICAgICAgIHYgPT09IDIgJiYgZiAlIDEwMCA9PT0gTWF0aC5mbG9vcihmICUgMTAwKSAmJiBmICUgMTAwID49IDExICYmIGYgJSAxMDAgPD0gMTkpXG4gICAgICAgIHJldHVybiBQbHVyYWwuWmVybztcbiAgICAgIGlmIChuICUgMTAgPT09IDEgJiYgIShuICUgMTAwID09PSAxMSkgfHwgdiA9PT0gMiAmJiBmICUgMTAgPT09IDEgJiYgIShmICUgMTAwID09PSAxMSkgfHxcbiAgICAgICAgICAhKHYgPT09IDIpICYmIGYgJSAxMCA9PT0gMSlcbiAgICAgICAgcmV0dXJuIFBsdXJhbC5PbmU7XG4gICAgICByZXR1cm4gUGx1cmFsLk90aGVyO1xuICAgIGNhc2UgJ21rJzpcbiAgICAgIGlmICh2ID09PSAwICYmIGkgJSAxMCA9PT0gMSB8fCBmICUgMTAgPT09IDEpIHJldHVybiBQbHVyYWwuT25lO1xuICAgICAgcmV0dXJuIFBsdXJhbC5PdGhlcjtcbiAgICBjYXNlICdtdCc6XG4gICAgICBpZiAobiA9PT0gMSkgcmV0dXJuIFBsdXJhbC5PbmU7XG4gICAgICBpZiAobiA9PT0gMCB8fCBuICUgMTAwID09PSBNYXRoLmZsb29yKG4gJSAxMDApICYmIG4gJSAxMDAgPj0gMiAmJiBuICUgMTAwIDw9IDEwKVxuICAgICAgICByZXR1cm4gUGx1cmFsLkZldztcbiAgICAgIGlmIChuICUgMTAwID09PSBNYXRoLmZsb29yKG4gJSAxMDApICYmIG4gJSAxMDAgPj0gMTEgJiYgbiAlIDEwMCA8PSAxOSkgcmV0dXJuIFBsdXJhbC5NYW55O1xuICAgICAgcmV0dXJuIFBsdXJhbC5PdGhlcjtcbiAgICBjYXNlICdwbCc6XG4gICAgICBpZiAoaSA9PT0gMSAmJiB2ID09PSAwKSByZXR1cm4gUGx1cmFsLk9uZTtcbiAgICAgIGlmICh2ID09PSAwICYmIGkgJSAxMCA9PT0gTWF0aC5mbG9vcihpICUgMTApICYmIGkgJSAxMCA+PSAyICYmIGkgJSAxMCA8PSA0ICYmXG4gICAgICAgICAgIShpICUgMTAwID49IDEyICYmIGkgJSAxMDAgPD0gMTQpKVxuICAgICAgICByZXR1cm4gUGx1cmFsLkZldztcbiAgICAgIGlmICh2ID09PSAwICYmICEoaSA9PT0gMSkgJiYgaSAlIDEwID09PSBNYXRoLmZsb29yKGkgJSAxMCkgJiYgaSAlIDEwID49IDAgJiYgaSAlIDEwIDw9IDEgfHxcbiAgICAgICAgICB2ID09PSAwICYmIGkgJSAxMCA9PT0gTWF0aC5mbG9vcihpICUgMTApICYmIGkgJSAxMCA+PSA1ICYmIGkgJSAxMCA8PSA5IHx8XG4gICAgICAgICAgdiA9PT0gMCAmJiBpICUgMTAwID09PSBNYXRoLmZsb29yKGkgJSAxMDApICYmIGkgJSAxMDAgPj0gMTIgJiYgaSAlIDEwMCA8PSAxNClcbiAgICAgICAgcmV0dXJuIFBsdXJhbC5NYW55O1xuICAgICAgcmV0dXJuIFBsdXJhbC5PdGhlcjtcbiAgICBjYXNlICdwdCc6XG4gICAgICBpZiAobiA9PT0gTWF0aC5mbG9vcihuKSAmJiBuID49IDAgJiYgbiA8PSAyICYmICEobiA9PT0gMikpIHJldHVybiBQbHVyYWwuT25lO1xuICAgICAgcmV0dXJuIFBsdXJhbC5PdGhlcjtcbiAgICBjYXNlICdybyc6XG4gICAgICBpZiAoaSA9PT0gMSAmJiB2ID09PSAwKSByZXR1cm4gUGx1cmFsLk9uZTtcbiAgICAgIGlmICghKHYgPT09IDApIHx8IG4gPT09IDAgfHxcbiAgICAgICAgICAhKG4gPT09IDEpICYmIG4gJSAxMDAgPT09IE1hdGguZmxvb3IobiAlIDEwMCkgJiYgbiAlIDEwMCA+PSAxICYmIG4gJSAxMDAgPD0gMTkpXG4gICAgICAgIHJldHVybiBQbHVyYWwuRmV3O1xuICAgICAgcmV0dXJuIFBsdXJhbC5PdGhlcjtcbiAgICBjYXNlICdydSc6XG4gICAgY2FzZSAndWsnOlxuICAgICAgaWYgKHYgPT09IDAgJiYgaSAlIDEwID09PSAxICYmICEoaSAlIDEwMCA9PT0gMTEpKSByZXR1cm4gUGx1cmFsLk9uZTtcbiAgICAgIGlmICh2ID09PSAwICYmIGkgJSAxMCA9PT0gTWF0aC5mbG9vcihpICUgMTApICYmIGkgJSAxMCA+PSAyICYmIGkgJSAxMCA8PSA0ICYmXG4gICAgICAgICAgIShpICUgMTAwID49IDEyICYmIGkgJSAxMDAgPD0gMTQpKVxuICAgICAgICByZXR1cm4gUGx1cmFsLkZldztcbiAgICAgIGlmICh2ID09PSAwICYmIGkgJSAxMCA9PT0gMCB8fFxuICAgICAgICAgIHYgPT09IDAgJiYgaSAlIDEwID09PSBNYXRoLmZsb29yKGkgJSAxMCkgJiYgaSAlIDEwID49IDUgJiYgaSAlIDEwIDw9IDkgfHxcbiAgICAgICAgICB2ID09PSAwICYmIGkgJSAxMDAgPT09IE1hdGguZmxvb3IoaSAlIDEwMCkgJiYgaSAlIDEwMCA+PSAxMSAmJiBpICUgMTAwIDw9IDE0KVxuICAgICAgICByZXR1cm4gUGx1cmFsLk1hbnk7XG4gICAgICByZXR1cm4gUGx1cmFsLk90aGVyO1xuICAgIGNhc2UgJ3NoaSc6XG4gICAgICBpZiAoaSA9PT0gMCB8fCBuID09PSAxKSByZXR1cm4gUGx1cmFsLk9uZTtcbiAgICAgIGlmIChuID09PSBNYXRoLmZsb29yKG4pICYmIG4gPj0gMiAmJiBuIDw9IDEwKSByZXR1cm4gUGx1cmFsLkZldztcbiAgICAgIHJldHVybiBQbHVyYWwuT3RoZXI7XG4gICAgY2FzZSAnc2knOlxuICAgICAgaWYgKG4gPT09IDAgfHwgbiA9PT0gMSB8fCBpID09PSAwICYmIGYgPT09IDEpIHJldHVybiBQbHVyYWwuT25lO1xuICAgICAgcmV0dXJuIFBsdXJhbC5PdGhlcjtcbiAgICBjYXNlICdzbCc6XG4gICAgICBpZiAodiA9PT0gMCAmJiBpICUgMTAwID09PSAxKSByZXR1cm4gUGx1cmFsLk9uZTtcbiAgICAgIGlmICh2ID09PSAwICYmIGkgJSAxMDAgPT09IDIpIHJldHVybiBQbHVyYWwuVHdvO1xuICAgICAgaWYgKHYgPT09IDAgJiYgaSAlIDEwMCA9PT0gTWF0aC5mbG9vcihpICUgMTAwKSAmJiBpICUgMTAwID49IDMgJiYgaSAlIDEwMCA8PSA0IHx8ICEodiA9PT0gMCkpXG4gICAgICAgIHJldHVybiBQbHVyYWwuRmV3O1xuICAgICAgcmV0dXJuIFBsdXJhbC5PdGhlcjtcbiAgICBjYXNlICd0em0nOlxuICAgICAgaWYgKG4gPT09IE1hdGguZmxvb3IobikgJiYgbiA+PSAwICYmIG4gPD0gMSB8fCBuID09PSBNYXRoLmZsb29yKG4pICYmIG4gPj0gMTEgJiYgbiA8PSA5OSlcbiAgICAgICAgcmV0dXJuIFBsdXJhbC5PbmU7XG4gICAgICByZXR1cm4gUGx1cmFsLk90aGVyO1xuICAgIC8vIFdoZW4gdGhlcmUgaXMgbm8gc3BlY2lmaWNhdGlvbiwgdGhlIGRlZmF1bHQgaXMgYWx3YXlzIFwib3RoZXJcIlxuICAgIC8vIFNwZWM6IGh0dHA6Ly9jbGRyLnVuaWNvZGUub3JnL2luZGV4L2NsZHItc3BlYy9wbHVyYWwtcnVsZXNcbiAgICAvLyA+IG90aGVyIChyZXF1aXJlZOKAlGdlbmVyYWwgcGx1cmFsIGZvcm0g4oCUIGFsc28gdXNlZCBpZiB0aGUgbGFuZ3VhZ2Ugb25seSBoYXMgYSBzaW5nbGUgZm9ybSlcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIFBsdXJhbC5PdGhlcjtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRQbHVyYWxDYXRlZ29yeSh2YWx1ZTogYW55LCBsb2NhbGU6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IHBsdXJhbCA9IGdldFBsdXJhbENhc2UobG9jYWxlLCB2YWx1ZSk7XG5cbiAgc3dpdGNoIChwbHVyYWwpIHtcbiAgICBjYXNlIFBsdXJhbC5aZXJvOlxuICAgICAgcmV0dXJuICd6ZXJvJztcbiAgICBjYXNlIFBsdXJhbC5PbmU6XG4gICAgICByZXR1cm4gJ29uZSc7XG4gICAgY2FzZSBQbHVyYWwuVHdvOlxuICAgICAgcmV0dXJuICd0d28nO1xuICAgIGNhc2UgUGx1cmFsLkZldzpcbiAgICAgIHJldHVybiAnZmV3JztcbiAgICBjYXNlIFBsdXJhbC5NYW55OlxuICAgICAgcmV0dXJuICdtYW55JztcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuICdvdGhlcic7XG4gIH1cbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBpbmRleCBvZiB0aGUgY3VycmVudCBjYXNlIG9mIGFuIElDVSBleHByZXNzaW9uIGRlcGVuZGluZyBvbiB0aGUgbWFpbiBiaW5kaW5nIHZhbHVlXG4gKlxuICogQHBhcmFtIGljdUV4cHJlc3Npb25cbiAqIEBwYXJhbSBiaW5kaW5nVmFsdWUgVGhlIHZhbHVlIG9mIHRoZSBtYWluIGJpbmRpbmcgdXNlZCBieSB0aGlzIElDVSBleHByZXNzaW9uXG4gKi9cbmZ1bmN0aW9uIGdldENhc2VJbmRleChpY3VFeHByZXNzaW9uOiBUSWN1LCBiaW5kaW5nVmFsdWU6IHN0cmluZyk6IG51bWJlciB7XG4gIGxldCBpbmRleCA9IGljdUV4cHJlc3Npb24uY2FzZXMuaW5kZXhPZihiaW5kaW5nVmFsdWUpO1xuICBpZiAoaW5kZXggPT09IC0xKSB7XG4gICAgc3dpdGNoIChpY3VFeHByZXNzaW9uLnR5cGUpIHtcbiAgICAgIGNhc2UgSWN1VHlwZS5wbHVyYWw6IHtcbiAgICAgICAgLy8gVE9ETyhvY29tYmUpOiByZXBsYWNlIHRoaXMgaGFyZC1jb2RlZCB2YWx1ZSBieSB0aGUgcmVhbCBMT0NBTEVfSUQgdmFsdWVcbiAgICAgICAgY29uc3QgbG9jYWxlID0gJ2VuLVVTJztcbiAgICAgICAgY29uc3QgcmVzb2x2ZWRDYXNlID0gZ2V0UGx1cmFsQ2F0ZWdvcnkoYmluZGluZ1ZhbHVlLCBsb2NhbGUpO1xuICAgICAgICBpbmRleCA9IGljdUV4cHJlc3Npb24uY2FzZXMuaW5kZXhPZihyZXNvbHZlZENhc2UpO1xuICAgICAgICBpZiAoaW5kZXggPT09IC0xICYmIHJlc29sdmVkQ2FzZSAhPT0gJ290aGVyJykge1xuICAgICAgICAgIGluZGV4ID0gaWN1RXhwcmVzc2lvbi5jYXNlcy5pbmRleE9mKCdvdGhlcicpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgY2FzZSBJY3VUeXBlLnNlbGVjdDoge1xuICAgICAgICBpbmRleCA9IGljdUV4cHJlc3Npb24uY2FzZXMuaW5kZXhPZignb3RoZXInKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBpbmRleDtcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZSB0aGUgT3BDb2RlcyBmb3IgSUNVIGV4cHJlc3Npb25zLlxuICpcbiAqIEBwYXJhbSB0SWN1c1xuICogQHBhcmFtIGljdUV4cHJlc3Npb25cbiAqIEBwYXJhbSBzdGFydEluZGV4XG4gKiBAcGFyYW0gZXhwYW5kb1N0YXJ0SW5kZXhcbiAqL1xuZnVuY3Rpb24gaWN1U3RhcnQoXG4gICAgdEljdXM6IFRJY3VbXSwgaWN1RXhwcmVzc2lvbjogSWN1RXhwcmVzc2lvbiwgc3RhcnRJbmRleDogbnVtYmVyLFxuICAgIGV4cGFuZG9TdGFydEluZGV4OiBudW1iZXIpOiB2b2lkIHtcbiAgY29uc3QgY3JlYXRlQ29kZXMgPSBbXTtcbiAgY29uc3QgcmVtb3ZlQ29kZXMgPSBbXTtcbiAgY29uc3QgdXBkYXRlQ29kZXMgPSBbXTtcbiAgY29uc3QgdmFycyA9IFtdO1xuICBjb25zdCBjaGlsZEljdXM6IG51bWJlcltdW10gPSBbXTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBpY3VFeHByZXNzaW9uLnZhbHVlcy5sZW5ndGg7IGkrKykge1xuICAgIC8vIEVhY2ggdmFsdWUgaXMgYW4gYXJyYXkgb2Ygc3RyaW5ncyAmIG90aGVyIElDVSBleHByZXNzaW9uc1xuICAgIGNvbnN0IHZhbHVlQXJyID0gaWN1RXhwcmVzc2lvbi52YWx1ZXNbaV07XG4gICAgY29uc3QgbmVzdGVkSWN1czogSWN1RXhwcmVzc2lvbltdID0gW107XG4gICAgZm9yIChsZXQgaiA9IDA7IGogPCB2YWx1ZUFyci5sZW5ndGg7IGorKykge1xuICAgICAgY29uc3QgdmFsdWUgPSB2YWx1ZUFycltqXTtcbiAgICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIC8vIEl0IGlzIGFuIG5lc3RlZCBJQ1UgZXhwcmVzc2lvblxuICAgICAgICBjb25zdCBpY3VJbmRleCA9IG5lc3RlZEljdXMucHVzaCh2YWx1ZSBhcyBJY3VFeHByZXNzaW9uKSAtIDE7XG4gICAgICAgIC8vIFJlcGxhY2UgbmVzdGVkIElDVSBleHByZXNzaW9uIGJ5IGEgY29tbWVudCBub2RlXG4gICAgICAgIHZhbHVlQXJyW2pdID0gYDwhLS3vv70ke2ljdUluZGV4fe+/vS0tPmA7XG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IGljdUNhc2U6IEljdUNhc2UgPVxuICAgICAgICBwYXJzZUljdUNhc2UodmFsdWVBcnIuam9pbignJyksIHN0YXJ0SW5kZXgsIG5lc3RlZEljdXMsIHRJY3VzLCBleHBhbmRvU3RhcnRJbmRleCk7XG4gICAgY3JlYXRlQ29kZXMucHVzaChpY3VDYXNlLmNyZWF0ZSk7XG4gICAgcmVtb3ZlQ29kZXMucHVzaChpY3VDYXNlLnJlbW92ZSk7XG4gICAgdXBkYXRlQ29kZXMucHVzaChpY3VDYXNlLnVwZGF0ZSk7XG4gICAgdmFycy5wdXNoKGljdUNhc2UudmFycyk7XG4gICAgY2hpbGRJY3VzLnB1c2goaWN1Q2FzZS5jaGlsZEljdXMpO1xuICB9XG4gIGNvbnN0IHRJY3U6IFRJY3UgPSB7XG4gICAgdHlwZTogaWN1RXhwcmVzc2lvbi50eXBlLFxuICAgIHZhcnMsXG4gICAgZXhwYW5kb1N0YXJ0SW5kZXg6IGV4cGFuZG9TdGFydEluZGV4ICsgMSwgY2hpbGRJY3VzLFxuICAgIGNhc2VzOiBpY3VFeHByZXNzaW9uLmNhc2VzLFxuICAgIGNyZWF0ZTogY3JlYXRlQ29kZXMsXG4gICAgcmVtb3ZlOiByZW1vdmVDb2RlcyxcbiAgICB1cGRhdGU6IHVwZGF0ZUNvZGVzXG4gIH07XG4gIHRJY3VzLnB1c2godEljdSk7XG4gIGNvbnN0IGxWaWV3ID0gZ2V0TFZpZXcoKTtcbiAgY29uc3Qgd29yc3RDYXNlU2l6ZSA9IE1hdGgubWF4KC4uLnZhcnMpO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHdvcnN0Q2FzZVNpemU7IGkrKykge1xuICAgIGFsbG9jRXhwYW5kbyhsVmlldyk7XG4gIH1cbn1cblxuLyoqXG4gKiBUcmFuc2Zvcm1zIGEgc3RyaW5nIHRlbXBsYXRlIGludG8gYW4gSFRNTCB0ZW1wbGF0ZSBhbmQgYSBsaXN0IG9mIGluc3RydWN0aW9ucyB1c2VkIHRvIHVwZGF0ZVxuICogYXR0cmlidXRlcyBvciBub2RlcyB0aGF0IGNvbnRhaW4gYmluZGluZ3MuXG4gKlxuICogQHBhcmFtIHVuc2FmZUh0bWwgVGhlIHN0cmluZyB0byBwYXJzZVxuICogQHBhcmFtIHBhcmVudEluZGV4XG4gKiBAcGFyYW0gbmVzdGVkSWN1c1xuICogQHBhcmFtIHRJY3VzXG4gKiBAcGFyYW0gZXhwYW5kb1N0YXJ0SW5kZXhcbiAqL1xuZnVuY3Rpb24gcGFyc2VJY3VDYXNlKFxuICAgIHVuc2FmZUh0bWw6IHN0cmluZywgcGFyZW50SW5kZXg6IG51bWJlciwgbmVzdGVkSWN1czogSWN1RXhwcmVzc2lvbltdLCB0SWN1czogVEljdVtdLFxuICAgIGV4cGFuZG9TdGFydEluZGV4OiBudW1iZXIpOiBJY3VDYXNlIHtcbiAgY29uc3QgaW5lcnRCb2R5SGVscGVyID0gbmV3IEluZXJ0Qm9keUhlbHBlcihkb2N1bWVudCk7XG4gIGNvbnN0IGluZXJ0Qm9keUVsZW1lbnQgPSBpbmVydEJvZHlIZWxwZXIuZ2V0SW5lcnRCb2R5RWxlbWVudCh1bnNhZmVIdG1sKTtcbiAgaWYgKCFpbmVydEJvZHlFbGVtZW50KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdVbmFibGUgdG8gZ2VuZXJhdGUgaW5lcnQgYm9keSBlbGVtZW50Jyk7XG4gIH1cbiAgY29uc3Qgd3JhcHBlciA9IGdldFRlbXBsYXRlQ29udGVudChpbmVydEJvZHlFbGVtZW50ICEpIGFzIEVsZW1lbnQgfHwgaW5lcnRCb2R5RWxlbWVudDtcbiAgY29uc3Qgb3BDb2RlczogSWN1Q2FzZSA9IHt2YXJzOiAwLCBjaGlsZEljdXM6IFtdLCBjcmVhdGU6IFtdLCByZW1vdmU6IFtdLCB1cGRhdGU6IFtdfTtcbiAgcGFyc2VOb2Rlcyh3cmFwcGVyLmZpcnN0Q2hpbGQsIG9wQ29kZXMsIHBhcmVudEluZGV4LCBuZXN0ZWRJY3VzLCB0SWN1cywgZXhwYW5kb1N0YXJ0SW5kZXgpO1xuICByZXR1cm4gb3BDb2Rlcztcbn1cblxuY29uc3QgTkVTVEVEX0lDVSA9IC/vv70oXFxkKynvv70vO1xuXG4vKipcbiAqIFBhcnNlcyBhIG5vZGUsIGl0cyBjaGlsZHJlbiBhbmQgaXRzIHNpYmxpbmdzLCBhbmQgZ2VuZXJhdGVzIHRoZSBtdXRhdGUgJiB1cGRhdGUgT3BDb2Rlcy5cbiAqXG4gKiBAcGFyYW0gY3VycmVudE5vZGUgVGhlIGZpcnN0IG5vZGUgdG8gcGFyc2VcbiAqIEBwYXJhbSBpY3VDYXNlIFRoZSBkYXRhIGZvciB0aGUgSUNVIGV4cHJlc3Npb24gY2FzZSB0aGF0IGNvbnRhaW5zIHRob3NlIG5vZGVzXG4gKiBAcGFyYW0gcGFyZW50SW5kZXggSW5kZXggb2YgdGhlIGN1cnJlbnQgbm9kZSdzIHBhcmVudFxuICogQHBhcmFtIG5lc3RlZEljdXMgRGF0YSBmb3IgdGhlIG5lc3RlZCBJQ1UgZXhwcmVzc2lvbnMgdGhhdCB0aGlzIGNhc2UgY29udGFpbnNcbiAqIEBwYXJhbSB0SWN1cyBEYXRhIGZvciBhbGwgSUNVIGV4cHJlc3Npb25zIG9mIHRoZSBjdXJyZW50IG1lc3NhZ2VcbiAqIEBwYXJhbSBleHBhbmRvU3RhcnRJbmRleCBFeHBhbmRvIHN0YXJ0IGluZGV4IGZvciB0aGUgY3VycmVudCBJQ1UgZXhwcmVzc2lvblxuICovXG5mdW5jdGlvbiBwYXJzZU5vZGVzKFxuICAgIGN1cnJlbnROb2RlOiBOb2RlIHwgbnVsbCwgaWN1Q2FzZTogSWN1Q2FzZSwgcGFyZW50SW5kZXg6IG51bWJlciwgbmVzdGVkSWN1czogSWN1RXhwcmVzc2lvbltdLFxuICAgIHRJY3VzOiBUSWN1W10sIGV4cGFuZG9TdGFydEluZGV4OiBudW1iZXIpIHtcbiAgaWYgKGN1cnJlbnROb2RlKSB7XG4gICAgY29uc3QgbmVzdGVkSWN1c1RvQ3JlYXRlOiBbSWN1RXhwcmVzc2lvbiwgbnVtYmVyXVtdID0gW107XG4gICAgd2hpbGUgKGN1cnJlbnROb2RlKSB7XG4gICAgICBjb25zdCBuZXh0Tm9kZTogTm9kZXxudWxsID0gY3VycmVudE5vZGUubmV4dFNpYmxpbmc7XG4gICAgICBjb25zdCBuZXdJbmRleCA9IGV4cGFuZG9TdGFydEluZGV4ICsgKytpY3VDYXNlLnZhcnM7XG4gICAgICBzd2l0Y2ggKGN1cnJlbnROb2RlLm5vZGVUeXBlKSB7XG4gICAgICAgIGNhc2UgTm9kZS5FTEVNRU5UX05PREU6XG4gICAgICAgICAgY29uc3QgZWxlbWVudCA9IGN1cnJlbnROb2RlIGFzIEVsZW1lbnQ7XG4gICAgICAgICAgY29uc3QgdGFnTmFtZSA9IGVsZW1lbnQudGFnTmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgIGlmICghVkFMSURfRUxFTUVOVFMuaGFzT3duUHJvcGVydHkodGFnTmFtZSkpIHtcbiAgICAgICAgICAgIC8vIFRoaXMgaXNuJ3QgYSB2YWxpZCBlbGVtZW50LCB3ZSB3b24ndCBjcmVhdGUgYW4gZWxlbWVudCBmb3IgaXRcbiAgICAgICAgICAgIGljdUNhc2UudmFycy0tO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpY3VDYXNlLmNyZWF0ZS5wdXNoKFxuICAgICAgICAgICAgICAgIEVMRU1FTlRfTUFSS0VSLCB0YWdOYW1lLFxuICAgICAgICAgICAgICAgIHBhcmVudEluZGV4IDw8IEkxOG5NdXRhdGVPcENvZGUuU0hJRlRfUEFSRU5UIHwgSTE4bk11dGF0ZU9wQ29kZS5BcHBlbmRDaGlsZCk7XG4gICAgICAgICAgICBjb25zdCBlbEF0dHJzID0gZWxlbWVudC5hdHRyaWJ1dGVzO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBlbEF0dHJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGF0dHIgPSBlbEF0dHJzLml0ZW0oaSkgITtcbiAgICAgICAgICAgICAgY29uc3QgbG93ZXJBdHRyTmFtZSA9IGF0dHIubmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgICBjb25zdCBoYXNCaW5kaW5nID0gISFhdHRyLnZhbHVlLm1hdGNoKEJJTkRJTkdfUkVHRVhQKTtcbiAgICAgICAgICAgICAgLy8gd2UgYXNzdW1lIHRoZSBpbnB1dCBzdHJpbmcgaXMgc2FmZSwgdW5sZXNzIGl0J3MgdXNpbmcgYSBiaW5kaW5nXG4gICAgICAgICAgICAgIGlmIChoYXNCaW5kaW5nKSB7XG4gICAgICAgICAgICAgICAgaWYgKFZBTElEX0FUVFJTLmhhc093blByb3BlcnR5KGxvd2VyQXR0ck5hbWUpKSB7XG4gICAgICAgICAgICAgICAgICBpZiAoVVJJX0FUVFJTW2xvd2VyQXR0ck5hbWVdKSB7XG4gICAgICAgICAgICAgICAgICAgIGFkZEFsbFRvQXJyYXkoXG4gICAgICAgICAgICAgICAgICAgICAgICBnZW5lcmF0ZUJpbmRpbmdVcGRhdGVPcENvZGVzKGF0dHIudmFsdWUsIG5ld0luZGV4LCBhdHRyLm5hbWUsIF9zYW5pdGl6ZVVybCksXG4gICAgICAgICAgICAgICAgICAgICAgICBpY3VDYXNlLnVwZGF0ZSk7XG4gICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKFNSQ1NFVF9BVFRSU1tsb3dlckF0dHJOYW1lXSkge1xuICAgICAgICAgICAgICAgICAgICBhZGRBbGxUb0FycmF5KFxuICAgICAgICAgICAgICAgICAgICAgICAgZ2VuZXJhdGVCaW5kaW5nVXBkYXRlT3BDb2RlcyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdHRyLnZhbHVlLCBuZXdJbmRleCwgYXR0ci5uYW1lLCBzYW5pdGl6ZVNyY3NldCksXG4gICAgICAgICAgICAgICAgICAgICAgICBpY3VDYXNlLnVwZGF0ZSk7XG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBhZGRBbGxUb0FycmF5KFxuICAgICAgICAgICAgICAgICAgICAgICAgZ2VuZXJhdGVCaW5kaW5nVXBkYXRlT3BDb2RlcyhhdHRyLnZhbHVlLCBuZXdJbmRleCwgYXR0ci5uYW1lKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGljdUNhc2UudXBkYXRlKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgbmdEZXZNb2RlICYmXG4gICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgICAgICAgICAgICAgICAgICBgV0FSTklORzogaWdub3JpbmcgdW5zYWZlIGF0dHJpYnV0ZSB2YWx1ZSAke2xvd2VyQXR0ck5hbWV9IG9uIGVsZW1lbnQgJHt0YWdOYW1lfSAoc2VlIGh0dHA6Ly9nLmNvL25nL3NlY3VyaXR5I3hzcylgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWN1Q2FzZS5jcmVhdGUucHVzaChcbiAgICAgICAgICAgICAgICAgICAgbmV3SW5kZXggPDwgSTE4bk11dGF0ZU9wQ29kZS5TSElGVF9SRUYgfCBJMThuTXV0YXRlT3BDb2RlLkF0dHIsIGF0dHIubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgYXR0ci52YWx1ZSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFBhcnNlIHRoZSBjaGlsZHJlbiBvZiB0aGlzIG5vZGUgKGlmIGFueSlcbiAgICAgICAgICAgIHBhcnNlTm9kZXMoXG4gICAgICAgICAgICAgICAgY3VycmVudE5vZGUuZmlyc3RDaGlsZCwgaWN1Q2FzZSwgbmV3SW5kZXgsIG5lc3RlZEljdXMsIHRJY3VzLCBleHBhbmRvU3RhcnRJbmRleCk7XG4gICAgICAgICAgICAvLyBSZW1vdmUgdGhlIHBhcmVudCBub2RlIGFmdGVyIHRoZSBjaGlsZHJlblxuICAgICAgICAgICAgaWN1Q2FzZS5yZW1vdmUucHVzaChuZXdJbmRleCA8PCBJMThuTXV0YXRlT3BDb2RlLlNISUZUX1JFRiB8IEkxOG5NdXRhdGVPcENvZGUuUmVtb3ZlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgTm9kZS5URVhUX05PREU6XG4gICAgICAgICAgY29uc3QgdmFsdWUgPSBjdXJyZW50Tm9kZS50ZXh0Q29udGVudCB8fCAnJztcbiAgICAgICAgICBjb25zdCBoYXNCaW5kaW5nID0gdmFsdWUubWF0Y2goQklORElOR19SRUdFWFApO1xuICAgICAgICAgIGljdUNhc2UuY3JlYXRlLnB1c2goXG4gICAgICAgICAgICAgIGhhc0JpbmRpbmcgPyAnJyA6IHZhbHVlLFxuICAgICAgICAgICAgICBwYXJlbnRJbmRleCA8PCBJMThuTXV0YXRlT3BDb2RlLlNISUZUX1BBUkVOVCB8IEkxOG5NdXRhdGVPcENvZGUuQXBwZW5kQ2hpbGQpO1xuICAgICAgICAgIGljdUNhc2UucmVtb3ZlLnB1c2gobmV3SW5kZXggPDwgSTE4bk11dGF0ZU9wQ29kZS5TSElGVF9SRUYgfCBJMThuTXV0YXRlT3BDb2RlLlJlbW92ZSk7XG4gICAgICAgICAgaWYgKGhhc0JpbmRpbmcpIHtcbiAgICAgICAgICAgIGFkZEFsbFRvQXJyYXkoZ2VuZXJhdGVCaW5kaW5nVXBkYXRlT3BDb2Rlcyh2YWx1ZSwgbmV3SW5kZXgpLCBpY3VDYXNlLnVwZGF0ZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIE5vZGUuQ09NTUVOVF9OT0RFOlxuICAgICAgICAgIC8vIENoZWNrIGlmIHRoZSBjb21tZW50IG5vZGUgaXMgYSBwbGFjZWhvbGRlciBmb3IgYSBuZXN0ZWQgSUNVXG4gICAgICAgICAgY29uc3QgbWF0Y2ggPSBORVNURURfSUNVLmV4ZWMoY3VycmVudE5vZGUudGV4dENvbnRlbnQgfHwgJycpO1xuICAgICAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICAgICAgY29uc3QgbmVzdGVkSWN1SW5kZXggPSBwYXJzZUludChtYXRjaFsxXSwgMTApO1xuICAgICAgICAgICAgY29uc3QgbmV3TG9jYWwgPSBuZ0Rldk1vZGUgPyBgbmVzdGVkIElDVSAke25lc3RlZEljdUluZGV4fWAgOiAnJztcbiAgICAgICAgICAgIC8vIENyZWF0ZSB0aGUgY29tbWVudCBub2RlIHRoYXQgd2lsbCBhbmNob3IgdGhlIElDVSBleHByZXNzaW9uXG4gICAgICAgICAgICBpY3VDYXNlLmNyZWF0ZS5wdXNoKFxuICAgICAgICAgICAgICAgIENPTU1FTlRfTUFSS0VSLCBuZXdMb2NhbCxcbiAgICAgICAgICAgICAgICBwYXJlbnRJbmRleCA8PCBJMThuTXV0YXRlT3BDb2RlLlNISUZUX1BBUkVOVCB8IEkxOG5NdXRhdGVPcENvZGUuQXBwZW5kQ2hpbGQpO1xuICAgICAgICAgICAgY29uc3QgbmVzdGVkSWN1ID0gbmVzdGVkSWN1c1tuZXN0ZWRJY3VJbmRleF07XG4gICAgICAgICAgICBuZXN0ZWRJY3VzVG9DcmVhdGUucHVzaChbbmVzdGVkSWN1LCBuZXdJbmRleF0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBXZSBkbyBub3QgaGFuZGxlIGFueSBvdGhlciB0eXBlIG9mIGNvbW1lbnRcbiAgICAgICAgICAgIGljdUNhc2UudmFycy0tO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAvLyBXZSBkbyBub3QgaGFuZGxlIGFueSBvdGhlciB0eXBlIG9mIGVsZW1lbnRcbiAgICAgICAgICBpY3VDYXNlLnZhcnMtLTtcbiAgICAgIH1cbiAgICAgIGN1cnJlbnROb2RlID0gbmV4dE5vZGUgITtcbiAgICB9XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5lc3RlZEljdXNUb0NyZWF0ZS5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgbmVzdGVkSWN1ID0gbmVzdGVkSWN1c1RvQ3JlYXRlW2ldWzBdO1xuICAgICAgY29uc3QgbmVzdGVkSWN1Tm9kZUluZGV4ID0gbmVzdGVkSWN1c1RvQ3JlYXRlW2ldWzFdO1xuICAgICAgaWN1U3RhcnQodEljdXMsIG5lc3RlZEljdSwgbmVzdGVkSWN1Tm9kZUluZGV4LCBleHBhbmRvU3RhcnRJbmRleCArIGljdUNhc2UudmFycyk7XG4gICAgICAvLyBTaW5jZSB0aGlzIGlzIHJlY3Vyc2l2ZSwgdGhlIGxhc3QgVEljdSB0aGF0IHdhcyBwdXNoZWQgaXMgdGhlIG9uZSB3ZSB3YW50XG4gICAgICBjb25zdCBuZXN0VEljdUluZGV4ID0gdEljdXMubGVuZ3RoIC0gMTtcbiAgICAgIGljdUNhc2UudmFycyArPSBNYXRoLm1heCguLi50SWN1c1tuZXN0VEljdUluZGV4XS52YXJzKTtcbiAgICAgIGljdUNhc2UuY2hpbGRJY3VzLnB1c2gobmVzdFRJY3VJbmRleCk7XG4gICAgICBjb25zdCBtYXNrID0gZ2V0QmluZGluZ01hc2sobmVzdGVkSWN1KTtcbiAgICAgIGljdUNhc2UudXBkYXRlLnB1c2goXG4gICAgICAgICAgdG9NYXNrQml0KG5lc3RlZEljdS5tYWluQmluZGluZyksICAvLyBtYXNrIG9mIHRoZSBtYWluIGJpbmRpbmdcbiAgICAgICAgICAzLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNraXAgMyBvcENvZGVzIGlmIG5vdCBjaGFuZ2VkXG4gICAgICAgICAgLTEgLSBuZXN0ZWRJY3UubWFpbkJpbmRpbmcsXG4gICAgICAgICAgbmVzdGVkSWN1Tm9kZUluZGV4IDw8IEkxOG5VcGRhdGVPcENvZGUuU0hJRlRfUkVGIHwgSTE4blVwZGF0ZU9wQ29kZS5JY3VTd2l0Y2gsXG4gICAgICAgICAgbmVzdFRJY3VJbmRleCxcbiAgICAgICAgICBtYXNrLCAgLy8gbWFzayBvZiBhbGwgdGhlIGJpbmRpbmdzIG9mIHRoaXMgSUNVIGV4cHJlc3Npb25cbiAgICAgICAgICAyLCAgICAgLy8gc2tpcCAyIG9wQ29kZXMgaWYgbm90IGNoYW5nZWRcbiAgICAgICAgICBuZXN0ZWRJY3VOb2RlSW5kZXggPDwgSTE4blVwZGF0ZU9wQ29kZS5TSElGVF9SRUYgfCBJMThuVXBkYXRlT3BDb2RlLkljdVVwZGF0ZSxcbiAgICAgICAgICBuZXN0VEljdUluZGV4KTtcbiAgICAgIGljdUNhc2UucmVtb3ZlLnB1c2goXG4gICAgICAgICAgbmVzdFRJY3VJbmRleCA8PCBJMThuTXV0YXRlT3BDb2RlLlNISUZUX1JFRiB8IEkxOG5NdXRhdGVPcENvZGUuUmVtb3ZlTmVzdGVkSWN1LFxuICAgICAgICAgIG5lc3RlZEljdU5vZGVJbmRleCA8PCBJMThuTXV0YXRlT3BDb2RlLlNISUZUX1JFRiB8IEkxOG5NdXRhdGVPcENvZGUuUmVtb3ZlKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==