/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ParseError, ParseSourceSpan } from '../parse_util';
import { InterpolationConfig } from './interpolation_config';
import { TagDefinition } from './tags';
export declare enum TokenType {
    TAG_OPEN_START = 0,
    TAG_OPEN_END = 1,
    TAG_OPEN_END_VOID = 2,
    TAG_CLOSE = 3,
    TEXT = 4,
    ESCAPABLE_RAW_TEXT = 5,
    RAW_TEXT = 6,
    COMMENT_START = 7,
    COMMENT_END = 8,
    CDATA_START = 9,
    CDATA_END = 10,
    ATTR_NAME = 11,
    ATTR_VALUE = 12,
    DOC_TYPE = 13,
    EXPANSION_FORM_START = 14,
    EXPANSION_CASE_VALUE = 15,
    EXPANSION_CASE_EXP_START = 16,
    EXPANSION_CASE_EXP_END = 17,
    EXPANSION_FORM_END = 18,
    EOF = 19
}
export declare class Token {
    type: TokenType | null;
    parts: string[];
    sourceSpan: ParseSourceSpan;
    constructor(type: TokenType | null, parts: string[], sourceSpan: ParseSourceSpan);
}
export declare class TokenError extends ParseError {
    tokenType: TokenType | null;
    constructor(errorMsg: string, tokenType: TokenType | null, span: ParseSourceSpan);
}
export declare class TokenizeResult {
    tokens: Token[];
    errors: TokenError[];
    constructor(tokens: Token[], errors: TokenError[]);
}
/**
 * Options that modify how the text is tokenized.
 */
export interface TokenizeOptions {
    /** Whether to tokenize ICU messages (considered as text nodes when false). */
    tokenizeExpansionForms?: boolean;
    /** How to tokenize interpolation markers. */
    interpolationConfig?: InterpolationConfig;
}
export declare function tokenize(source: string, url: string, getTagDefinition: (tagName: string) => TagDefinition, options?: TokenizeOptions): TokenizeResult;
