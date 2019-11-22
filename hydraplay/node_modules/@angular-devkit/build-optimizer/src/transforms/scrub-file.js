"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const ts = require("typescript");
const ast_utils_1 = require("../helpers/ast-utils");
/**
 * @deprecated From 0.9.0
 */
function testScrubFile(content) {
    const markers = [
        'decorators',
        '__decorate',
        'propDecorators',
        'ctorParameters',
    ];
    return markers.some((marker) => content.indexOf(marker) !== -1);
}
exports.testScrubFile = testScrubFile;
// Don't remove `ctorParameters` from these.
const platformWhitelist = [
    'PlatformRef_',
    'TestabilityRegistry',
    'Console',
    'BrowserPlatformLocation',
];
const angularSpecifiers = [
    // Class level decorators.
    'Component',
    'Directive',
    'Injectable',
    'NgModule',
    'Pipe',
    // Property level decorators.
    'ContentChild',
    'ContentChildren',
    'HostBinding',
    'HostListener',
    'Input',
    'Output',
    'ViewChild',
    'ViewChildren',
];
function getScrubFileTransformer(program) {
    return scrubFileTransformer(program.getTypeChecker(), false);
}
exports.getScrubFileTransformer = getScrubFileTransformer;
function getScrubFileTransformerForCore(program) {
    return scrubFileTransformer(program.getTypeChecker(), true);
}
exports.getScrubFileTransformerForCore = getScrubFileTransformerForCore;
function scrubFileTransformer(checker, isAngularCoreFile) {
    return (context) => {
        const transformer = (sf) => {
            const ngMetadata = findAngularMetadata(sf, isAngularCoreFile);
            const tslibImports = findTslibImports(sf);
            const nodes = [];
            ts.forEachChild(sf, checkNodeForDecorators);
            function checkNodeForDecorators(node) {
                if (node.kind !== ts.SyntaxKind.ExpressionStatement) {
                    // TS 2.4 nests decorators inside downleveled class IIFEs, so we
                    // must recurse into them to find the relevant expression statements.
                    return ts.forEachChild(node, checkNodeForDecorators);
                }
                const exprStmt = node;
                if (isDecoratorAssignmentExpression(exprStmt)) {
                    nodes.push(...pickDecorationNodesToRemove(exprStmt, ngMetadata, checker));
                }
                if (isDecorateAssignmentExpression(exprStmt, tslibImports, checker)) {
                    nodes.push(...pickDecorateNodesToRemove(exprStmt, tslibImports, ngMetadata, checker));
                }
                if (isAngularDecoratorMetadataExpression(exprStmt, ngMetadata, tslibImports, checker)) {
                    nodes.push(node);
                }
                if (isPropDecoratorAssignmentExpression(exprStmt)) {
                    nodes.push(...pickPropDecorationNodesToRemove(exprStmt, ngMetadata, checker));
                }
                if (isCtorParamsAssignmentExpression(exprStmt)
                    && !isCtorParamsWhitelistedService(exprStmt)) {
                    nodes.push(node);
                }
            }
            const visitor = (node) => {
                // Check if node is a statement to be dropped.
                if (nodes.find((n) => n === node)) {
                    return undefined;
                }
                // Otherwise return node as is.
                return ts.visitEachChild(node, visitor, context);
            };
            return ts.visitNode(sf, visitor);
        };
        return transformer;
    };
}
function expect(node, kind) {
    if (node.kind !== kind) {
        throw new Error('Invalid node type.');
    }
    return node;
}
exports.expect = expect;
function nameOfSpecifier(node) {
    return node.name && node.name.text || '<unknown>';
}
function findAngularMetadata(node, isAngularCoreFile) {
    let specs = [];
    // Find all specifiers from imports of `@angular/core`.
    ts.forEachChild(node, (child) => {
        if (child.kind === ts.SyntaxKind.ImportDeclaration) {
            const importDecl = child;
            if (isAngularCoreImport(importDecl, isAngularCoreFile)) {
                specs.push(...ast_utils_1.collectDeepNodes(node, ts.SyntaxKind.ImportSpecifier)
                    .filter((spec) => isAngularCoreSpecifier(spec)));
            }
        }
    });
    // Check if the current module contains all know `@angular/core` specifiers.
    // If it does, we assume it's a `@angular/core` FESM.
    if (isAngularCoreFile) {
        const localDecl = findAllDeclarations(node)
            .filter((decl) => angularSpecifiers.indexOf(decl.name.text) !== -1);
        if (localDecl.length === angularSpecifiers.length) {
            specs = specs.concat(localDecl);
        }
    }
    return specs;
}
function findAllDeclarations(node) {
    const nodes = [];
    ts.forEachChild(node, (child) => {
        if (child.kind === ts.SyntaxKind.VariableStatement) {
            const vStmt = child;
            vStmt.declarationList.declarations.forEach((decl) => {
                if (decl.name.kind !== ts.SyntaxKind.Identifier) {
                    return;
                }
                nodes.push(decl);
            });
        }
    });
    return nodes;
}
function isAngularCoreImport(node, isAngularCoreFile) {
    if (!(node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier))) {
        return false;
    }
    const importText = node.moduleSpecifier.text;
    // Imports to `@angular/core` are always core imports.
    if (importText === '@angular/core') {
        return true;
    }
    // Relative imports from a Angular core file are also core imports.
    if (isAngularCoreFile && (importText.startsWith('./') || importText.startsWith('../'))) {
        return true;
    }
    return false;
}
function isAngularCoreSpecifier(node) {
    return angularSpecifiers.indexOf(nameOfSpecifier(node)) !== -1;
}
// Check if assignment is `Clazz.decorators = [...];`.
function isDecoratorAssignmentExpression(exprStmt) {
    if (exprStmt.expression.kind !== ts.SyntaxKind.BinaryExpression) {
        return false;
    }
    const expr = exprStmt.expression;
    if (expr.left.kind !== ts.SyntaxKind.PropertyAccessExpression) {
        return false;
    }
    const propAccess = expr.left;
    if (propAccess.expression.kind !== ts.SyntaxKind.Identifier) {
        return false;
    }
    if (propAccess.name.text !== 'decorators') {
        return false;
    }
    if (expr.operatorToken.kind !== ts.SyntaxKind.FirstAssignment) {
        return false;
    }
    if (expr.right.kind !== ts.SyntaxKind.ArrayLiteralExpression) {
        return false;
    }
    return true;
}
// Check if assignment is `Clazz = __decorate([...], Clazz)`.
function isDecorateAssignmentExpression(exprStmt, tslibImports, checker) {
    if (exprStmt.expression.kind !== ts.SyntaxKind.BinaryExpression) {
        return false;
    }
    const expr = exprStmt.expression;
    if (expr.left.kind !== ts.SyntaxKind.Identifier) {
        return false;
    }
    const classIdent = expr.left;
    let callExpr;
    if (expr.right.kind === ts.SyntaxKind.CallExpression) {
        callExpr = expr.right;
    }
    else if (expr.right.kind === ts.SyntaxKind.BinaryExpression) {
        // `Clazz = Clazz_1 = __decorate([...], Clazz)` can be found when there are static property
        // accesses.
        const innerExpr = expr.right;
        if (innerExpr.left.kind !== ts.SyntaxKind.Identifier
            || innerExpr.right.kind !== ts.SyntaxKind.CallExpression) {
            return false;
        }
        callExpr = innerExpr.right;
    }
    else {
        return false;
    }
    if (!isTslibHelper(callExpr, '__decorate', tslibImports, checker)) {
        return false;
    }
    if (callExpr.arguments.length !== 2) {
        return false;
    }
    if (callExpr.arguments[1].kind !== ts.SyntaxKind.Identifier) {
        return false;
    }
    const classArg = callExpr.arguments[1];
    if (classIdent.text !== classArg.text) {
        return false;
    }
    if (callExpr.arguments[0].kind !== ts.SyntaxKind.ArrayLiteralExpression) {
        return false;
    }
    return true;
}
// Check if expression is `__decorate([smt, __metadata("design:type", Object)], ...)`.
function isAngularDecoratorMetadataExpression(exprStmt, ngMetadata, tslibImports, checker) {
    if (exprStmt.expression.kind !== ts.SyntaxKind.CallExpression) {
        return false;
    }
    const callExpr = exprStmt.expression;
    if (!isTslibHelper(callExpr, '__decorate', tslibImports, checker)) {
        return false;
    }
    if (callExpr.arguments.length !== 4) {
        return false;
    }
    if (callExpr.arguments[0].kind !== ts.SyntaxKind.ArrayLiteralExpression) {
        return false;
    }
    const decorateArray = callExpr.arguments[0];
    // Check first array entry for Angular decorators.
    if (decorateArray.elements[0].kind !== ts.SyntaxKind.CallExpression) {
        return false;
    }
    const decoratorCall = decorateArray.elements[0];
    if (decoratorCall.expression.kind !== ts.SyntaxKind.Identifier) {
        return false;
    }
    const decoratorId = decoratorCall.expression;
    if (!identifierIsMetadata(decoratorId, ngMetadata, checker)) {
        return false;
    }
    // Check second array entry for __metadata call.
    if (decorateArray.elements[1].kind !== ts.SyntaxKind.CallExpression) {
        return false;
    }
    const metadataCall = decorateArray.elements[1];
    if (!isTslibHelper(metadataCall, '__metadata', tslibImports, checker)) {
        return false;
    }
    return true;
}
// Check if assignment is `Clazz.propDecorators = [...];`.
function isPropDecoratorAssignmentExpression(exprStmt) {
    if (exprStmt.expression.kind !== ts.SyntaxKind.BinaryExpression) {
        return false;
    }
    const expr = exprStmt.expression;
    if (expr.left.kind !== ts.SyntaxKind.PropertyAccessExpression) {
        return false;
    }
    const propAccess = expr.left;
    if (propAccess.expression.kind !== ts.SyntaxKind.Identifier) {
        return false;
    }
    if (propAccess.name.text !== 'propDecorators') {
        return false;
    }
    if (expr.operatorToken.kind !== ts.SyntaxKind.FirstAssignment) {
        return false;
    }
    if (expr.right.kind !== ts.SyntaxKind.ObjectLiteralExpression) {
        return false;
    }
    return true;
}
// Check if assignment is `Clazz.ctorParameters = [...];`.
function isCtorParamsAssignmentExpression(exprStmt) {
    if (exprStmt.expression.kind !== ts.SyntaxKind.BinaryExpression) {
        return false;
    }
    const expr = exprStmt.expression;
    if (expr.left.kind !== ts.SyntaxKind.PropertyAccessExpression) {
        return false;
    }
    const propAccess = expr.left;
    if (propAccess.name.text !== 'ctorParameters') {
        return false;
    }
    if (propAccess.expression.kind !== ts.SyntaxKind.Identifier) {
        return false;
    }
    if (expr.operatorToken.kind !== ts.SyntaxKind.FirstAssignment) {
        return false;
    }
    if (expr.right.kind !== ts.SyntaxKind.FunctionExpression
        && expr.right.kind !== ts.SyntaxKind.ArrowFunction) {
        return false;
    }
    return true;
}
function isCtorParamsWhitelistedService(exprStmt) {
    const expr = exprStmt.expression;
    const propAccess = expr.left;
    const serviceId = propAccess.expression;
    return platformWhitelist.indexOf(serviceId.text) !== -1;
}
// Remove Angular decorators from`Clazz.decorators = [...];`, or expression itself if all are
// removed.
function pickDecorationNodesToRemove(exprStmt, ngMetadata, checker) {
    const expr = expect(exprStmt.expression, ts.SyntaxKind.BinaryExpression);
    const literal = expect(expr.right, ts.SyntaxKind.ArrayLiteralExpression);
    if (!literal.elements.every((elem) => elem.kind === ts.SyntaxKind.ObjectLiteralExpression)) {
        return [];
    }
    const elements = literal.elements;
    const ngDecorators = elements.filter((elem) => isAngularDecorator(elem, ngMetadata, checker));
    return (elements.length > ngDecorators.length) ? ngDecorators : [exprStmt];
}
// Remove Angular decorators from `Clazz = __decorate([...], Clazz)`, or expression itself if all
// are removed.
function pickDecorateNodesToRemove(exprStmt, tslibImports, ngMetadata, checker) {
    const expr = expect(exprStmt.expression, ts.SyntaxKind.BinaryExpression);
    const classId = expect(expr.left, ts.SyntaxKind.Identifier);
    let callExpr;
    if (expr.right.kind === ts.SyntaxKind.CallExpression) {
        callExpr = expect(expr.right, ts.SyntaxKind.CallExpression);
    }
    else if (expr.right.kind === ts.SyntaxKind.BinaryExpression) {
        const innerExpr = expr.right;
        callExpr = expect(innerExpr.right, ts.SyntaxKind.CallExpression);
    }
    else {
        return [];
    }
    const arrLiteral = expect(callExpr.arguments[0], ts.SyntaxKind.ArrayLiteralExpression);
    if (!arrLiteral.elements.every((elem) => elem.kind === ts.SyntaxKind.CallExpression)) {
        return [];
    }
    const elements = arrLiteral.elements;
    const ngDecoratorCalls = elements.filter((el) => {
        if (el.expression.kind !== ts.SyntaxKind.Identifier) {
            return false;
        }
        const id = el.expression;
        return identifierIsMetadata(id, ngMetadata, checker);
    });
    // Only remove constructor parameter metadata on non-whitelisted classes.
    if (platformWhitelist.indexOf(classId.text) === -1) {
        // Remove __metadata calls of type 'design:paramtypes'.
        const metadataCalls = elements.filter((el) => {
            if (!isTslibHelper(el, '__metadata', tslibImports, checker)) {
                return false;
            }
            if (el.arguments.length < 2) {
                return false;
            }
            if (el.arguments[0].kind !== ts.SyntaxKind.StringLiteral) {
                return false;
            }
            const metadataTypeId = el.arguments[0];
            if (metadataTypeId.text !== 'design:paramtypes') {
                return false;
            }
            return true;
        });
        // Remove all __param calls.
        const paramCalls = elements.filter((el) => {
            if (!isTslibHelper(el, '__param', tslibImports, checker)) {
                return false;
            }
            if (el.arguments.length != 2) {
                return false;
            }
            if (el.arguments[0].kind !== ts.SyntaxKind.NumericLiteral) {
                return false;
            }
            return true;
        });
        ngDecoratorCalls.push(...metadataCalls, ...paramCalls);
    }
    // If all decorators are metadata decorators then return the whole `Class = __decorate([...])'`
    // statement so that it is removed in entirety
    return (elements.length === ngDecoratorCalls.length) ? [exprStmt] : ngDecoratorCalls;
}
// Remove Angular decorators from`Clazz.propDecorators = [...];`, or expression itself if all
// are removed.
function pickPropDecorationNodesToRemove(exprStmt, ngMetadata, checker) {
    const expr = expect(exprStmt.expression, ts.SyntaxKind.BinaryExpression);
    const literal = expect(expr.right, ts.SyntaxKind.ObjectLiteralExpression);
    if (!literal.properties.every((elem) => elem.kind === ts.SyntaxKind.PropertyAssignment &&
        elem.initializer.kind === ts.SyntaxKind.ArrayLiteralExpression)) {
        return [];
    }
    const assignments = literal.properties;
    // Consider each assignment individually. Either the whole assignment will be removed or
    // a particular decorator within will.
    const toRemove = assignments
        .map((assign) => {
        const decorators = expect(assign.initializer, ts.SyntaxKind.ArrayLiteralExpression).elements;
        if (!decorators.every((el) => el.kind === ts.SyntaxKind.ObjectLiteralExpression)) {
            return [];
        }
        const decsToRemove = decorators.filter((expression) => {
            const lit = expect(expression, ts.SyntaxKind.ObjectLiteralExpression);
            return isAngularDecorator(lit, ngMetadata, checker);
        });
        if (decsToRemove.length === decorators.length) {
            return [assign];
        }
        return decsToRemove;
    })
        .reduce((accum, toRm) => accum.concat(toRm), []);
    // If every node to be removed is a property assignment (full property's decorators) and
    // all properties are accounted for, remove the whole assignment. Otherwise, remove the
    // nodes which were marked as safe.
    if (toRemove.length === assignments.length &&
        toRemove.every((node) => node.kind === ts.SyntaxKind.PropertyAssignment)) {
        return [exprStmt];
    }
    return toRemove;
}
function isAngularDecorator(literal, ngMetadata, checker) {
    const types = literal.properties.filter(isTypeProperty);
    if (types.length !== 1) {
        return false;
    }
    const assign = expect(types[0], ts.SyntaxKind.PropertyAssignment);
    if (assign.initializer.kind !== ts.SyntaxKind.Identifier) {
        return false;
    }
    const id = assign.initializer;
    const res = identifierIsMetadata(id, ngMetadata, checker);
    return res;
}
function isTypeProperty(prop) {
    if (prop.kind !== ts.SyntaxKind.PropertyAssignment) {
        return false;
    }
    const assignment = prop;
    if (assignment.name.kind !== ts.SyntaxKind.Identifier) {
        return false;
    }
    const name = assignment.name;
    return name.text === 'type';
}
// Check if an identifier is part of the known Angular Metadata.
function identifierIsMetadata(id, metadata, checker) {
    const symbol = checker.getSymbolAtLocation(id);
    if (!symbol || !symbol.declarations || !symbol.declarations.length) {
        return false;
    }
    return symbol
        .declarations
        .some((spec) => metadata.indexOf(spec) !== -1);
}
// Check if an import is a tslib helper import (`import * as tslib from "tslib";`)
function isTslibImport(node) {
    return !!(node.moduleSpecifier &&
        node.moduleSpecifier.kind === ts.SyntaxKind.StringLiteral &&
        node.moduleSpecifier.text === 'tslib' &&
        node.importClause &&
        node.importClause.namedBindings &&
        node.importClause.namedBindings.kind === ts.SyntaxKind.NamespaceImport);
}
// Find all namespace imports for `tslib`.
function findTslibImports(node) {
    const imports = [];
    ts.forEachChild(node, (child) => {
        if (child.kind === ts.SyntaxKind.ImportDeclaration) {
            const importDecl = child;
            if (isTslibImport(importDecl)) {
                const importClause = importDecl.importClause;
                const namespaceImport = importClause.namedBindings;
                imports.push(namespaceImport);
            }
        }
    });
    return imports;
}
// Check if an identifier is part of the known tslib identifiers.
function identifierIsTslib(id, tslibImports, checker) {
    const symbol = checker.getSymbolAtLocation(id);
    if (!symbol || !symbol.declarations || !symbol.declarations.length) {
        return false;
    }
    return symbol
        .declarations
        .some((spec) => tslibImports.indexOf(spec) !== -1);
}
// Check if a function call is a tslib helper.
function isTslibHelper(callExpr, helper, tslibImports, checker) {
    let callExprIdent = callExpr.expression;
    if (callExpr.expression.kind !== ts.SyntaxKind.Identifier) {
        if (callExpr.expression.kind === ts.SyntaxKind.PropertyAccessExpression) {
            const propAccess = callExpr.expression;
            const left = propAccess.expression;
            callExprIdent = propAccess.name;
            if (left.kind !== ts.SyntaxKind.Identifier) {
                return false;
            }
            const id = left;
            if (!identifierIsTslib(id, tslibImports, checker)) {
                return false;
            }
        }
        else {
            return false;
        }
    }
    // node.text on a name that starts with two underscores will return three instead.
    // Unless it's an expression like tslib.__decorate, in which case it's only 2.
    if (callExprIdent.text !== `_${helper}` && callExprIdent.text !== helper) {
        return false;
    }
    return true;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NydWItZmlsZS5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsicGFja2FnZXMvYW5ndWxhcl9kZXZraXQvYnVpbGRfb3B0aW1pemVyL3NyYy90cmFuc2Zvcm1zL3NjcnViLWZpbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7O0dBTUc7QUFDSCxpQ0FBaUM7QUFDakMsb0RBQXdEO0FBRXhEOztHQUVHO0FBQ0gsU0FBZ0IsYUFBYSxDQUFDLE9BQWU7SUFDM0MsTUFBTSxPQUFPLEdBQUc7UUFDZCxZQUFZO1FBQ1osWUFBWTtRQUNaLGdCQUFnQjtRQUNoQixnQkFBZ0I7S0FDakIsQ0FBQztJQUVGLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2xFLENBQUM7QUFURCxzQ0FTQztBQUVELDRDQUE0QztBQUM1QyxNQUFNLGlCQUFpQixHQUFHO0lBQ3hCLGNBQWM7SUFDZCxxQkFBcUI7SUFDckIsU0FBUztJQUNULHlCQUF5QjtDQUMxQixDQUFDO0FBRUYsTUFBTSxpQkFBaUIsR0FBRztJQUN4QiwwQkFBMEI7SUFDMUIsV0FBVztJQUNYLFdBQVc7SUFDWCxZQUFZO0lBQ1osVUFBVTtJQUNWLE1BQU07SUFFTiw2QkFBNkI7SUFDN0IsY0FBYztJQUNkLGlCQUFpQjtJQUNqQixhQUFhO0lBQ2IsY0FBYztJQUNkLE9BQU87SUFDUCxRQUFRO0lBQ1IsV0FBVztJQUNYLGNBQWM7Q0FDZixDQUFDO0FBRUYsU0FBZ0IsdUJBQXVCLENBQUMsT0FBbUI7SUFDekQsT0FBTyxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDL0QsQ0FBQztBQUZELDBEQUVDO0FBRUQsU0FBZ0IsOEJBQThCLENBQzVDLE9BQW1CO0lBRW5CLE9BQU8sb0JBQW9CLENBQUMs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RTtRQUN6RCxJQUFJLFFBQVEsQ0FBQyxVQUFVLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsd0JBQXdCLEVBQUU7WUFDdkUsTUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDLFVBQXlDLENBQUM7WUFDdEUsTUFBTSxJQUFJLEdBQUcsVUFBVSxDQUFDLFVBQVUsQ0FBQztZQUNuQyxhQUFhLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQztZQUVoQyxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUU7Z0JBQzFDLE9BQU8sS0FBSyxDQUFDO2FBQ2Q7WUFFRCxNQUFNLEVBQUUsR0FBRyxJQUFxQixDQUFDO1lBRWpDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLEVBQUUsWUFBWSxFQUFFLE9BQU8sQ0FBQyxFQUFFO2dCQUNqRCxPQUFPLEtBQUssQ0FBQzthQUNkO1NBRUY7YUFBTTtZQUNMLE9BQU8sS0FBSyxDQUFDO1NBQ2Q7S0FDRjtJQUVELGtGQUFrRjtJQUNsRiw4RUFBOEU7SUFDOUUsSUFBSSxhQUFhLENBQUMsSUFBSSxLQUFLLElBQUksTUFBTSxFQUFFLElBQUksYUFBYSxDQUFDLElBQUksS0FBSyxNQUFNLEVBQUU7UUFDeEUsT0FBTyxLQUFLLENBQUM7S0FDZDtJQUVELE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuaW1wb3J0IHsgY29sbGVjdERlZXBOb2RlcyB9IGZyb20gJy4uL2hlbHBlcnMvYXN0LXV0aWxzJztcblxuLyoqXG4gKiBAZGVwcmVjYXRlZCBGcm9tIDAuOS4wXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0ZXN0U2NydWJGaWxlKGNvbnRlbnQ6IHN0cmluZykge1xuICBjb25zdCBtYXJrZXJzID0gW1xuICAgICdkZWNvcmF0b3JzJyxcbiAgICAnX19kZWNvcmF0ZScsXG4gICAgJ3Byb3BEZWNvcmF0b3JzJyxcbiAgICAnY3RvclBhcmFtZXRlcnMnLFxuICBdO1xuXG4gIHJldHVybiBtYXJrZXJzLnNvbWUoKG1hcmtlcikgPT4gY29udGVudC5pbmRleE9mKG1hcmtlcikgIT09IC0xKTtcbn1cblxuLy8gRG9uJ3QgcmVtb3ZlIGBjdG9yUGFyYW1ldGVyc2AgZnJvbSB0aGVzZS5cbmNvbnN0IHBsYXRmb3JtV2hpdGVsaXN0ID0gW1xuICAnUGxhdGZvcm1SZWZfJyxcbiAgJ1Rlc3RhYmlsaXR5UmVnaXN0cnknLFxuICAnQ29uc29sZScsXG4gICdCcm93c2VyUGxhdGZvcm1Mb2NhdGlvbicsXG5dO1xuXG5jb25zdCBhbmd1bGFyU3BlY2lmaWVycyA9IFtcbiAgLy8gQ2xhc3MgbGV2ZWwgZGVjb3JhdG9ycy5cbiAgJ0NvbXBvbmVudCcsXG4gICdEaXJlY3RpdmUnLFxuICAnSW5qZWN0YWJsZScsXG4gICdOZ01vZHVsZScsXG4gICdQaXBlJyxcblxuICAvLyBQcm9wZXJ0eSBsZXZlbCBkZWNvcmF0b3JzLlxuICAnQ29udGVudENoaWxkJyxcbiAgJ0NvbnRlbnRDaGlsZHJlbicsXG4gICdIb3N0QmluZGluZycsXG4gICdIb3N0TGlzdGVuZXInLFxuICAnSW5wdXQnLFxuICAnT3V0cHV0JyxcbiAgJ1ZpZXdDaGlsZCcsXG4gICdWaWV3Q2hpbGRyZW4nLFxuXTtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldFNjcnViRmlsZVRyYW5zZm9ybWVyKHByb2dyYW06IHRzLlByb2dyYW0pOiB0cy5UcmFuc2Zvcm1lckZhY3Rvcnk8dHMuU291cmNlRmlsZT4ge1xuICByZXR1cm4gc2NydWJGaWxlVHJhbnNmb3JtZXIocHJvZ3JhbS5nZXRUeXBlQ2hlY2tlcigpLCBmYWxzZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRTY3J1YkZpbGVUcmFuc2Zvcm1lckZvckNvcmUoXG4gIHByb2dyYW06IHRzLlByb2dyYW0sXG4pOiB0cy5UcmFuc2Zvcm1lckZhY3Rvcnk8dHMuU291cmNlRmlsZT4ge1xuICByZXR1cm4gc2NydWJGaWxlVHJhbnNmb3JtZXIocHJvZ3JhbS5nZXRUeXBlQ2hlY2tlcigpLCB0cnVlKTtcbn1cblxuZnVuY3Rpb24gc2NydWJGaWxlVHJhbnNmb3JtZXIoY2hlY2tlcjogdHMuVHlwZUNoZWNrZXIsIGlzQW5ndWxhckNvcmVGaWxlOiBib29sZWFuKSB7XG4gIHJldHVybiAoY29udGV4dDogdHMuVHJhbnNmb3JtYXRpb25Db250ZXh0KTogdHMuVHJhbnNmb3JtZXI8dHMuU291cmNlRmlsZT4gPT4ge1xuXG4gICAgY29uc3QgdHJhbnNmb3JtZXI6IHRzLlRyYW5zZm9ybWVyPHRzLlNvdXJjZUZpbGU+ID0gKHNmOiB0cy5Tb3VyY2VGaWxlKSA9PiB7XG5cbiAgICAgIGNvbnN0IG5nTWV0YWRhdGEgPSBmaW5kQW5ndWxhck1ldGFkYXRhKHNmLCBpc0FuZ3VsYXJDb3JlRmlsZSk7XG4gICAgICBjb25zdCB0c2xpYkltcG9ydHMgPSBmaW5kVHNsaWJJbXBvcnRzKHNmKTtcblxuICAgICAgY29uc3Qgbm9kZXM6IHRzLk5vZGVbXSA9IFtdO1xuICAgICAgdHMuZm9yRWFjaENoaWxkKHNmLCBjaGVja05vZGVGb3JEZWNvcmF0b3JzKTtcblxuICAgICAgZnVuY3Rpb24gY2hlY2tOb2RlRm9yRGVjb3JhdG9ycyhub2RlOiB0cy5Ob2RlKTogdm9pZCB7XG4gICAgICAgIGlmIChub2RlLmtpbmQgIT09IHRzLlN5bnRheEtpbmQuRXhwcmVzc2lvblN0YXRlbWVudCkge1xuICAgICAgICAgIC8vIFRTIDIuNCBuZXN0cyBkZWNvcmF0b3JzIGluc2lkZSBkb3dubGV2ZWxlZCBjbGFzcyBJSUZFcywgc28gd2VcbiAgICAgICAgICAvLyBtdXN0IHJlY3Vyc2UgaW50byB0aGVtIHRvIGZpbmQgdGhlIHJlbGV2YW50IGV4cHJlc3Npb24gc3RhdGVtZW50cy5cbiAgICAgICAgICByZXR1cm4gdHMuZm9yRWFjaENoaWxkKG5vZGUsIGNoZWNrTm9kZUZvckRlY29yYXRvcnMpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGV4cHJTdG10ID0gbm9kZSBhcyB0cy5FeHByZXNzaW9uU3RhdGVtZW50O1xuICAgICAgICBpZiAoaXNEZWNvcmF0b3JBc3NpZ25tZW50RXhwcmVzc2lvbihleHByU3RtdCkpIHtcbiAgICAgICAgICBub2Rlcy5wdXNoKC4uLnBpY2tEZWNvcmF0aW9uTm9kZXNUb1JlbW92ZShleHByU3RtdCwgbmdNZXRhZGF0YSwgY2hlY2tlcikpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc0RlY29yYXRlQXNzaWdubWVudEV4cHJlc3Npb24oZXhwclN0bXQsIHRzbGliSW1wb3J0cywgY2hlY2tlcikpIHtcbiAgICAgICAgICBub2Rlcy5wdXNoKC4uLnBpY2tEZWNvcmF0ZU5vZGVzVG9SZW1vdmUoZXhwclN0bXQsIHRzbGliSW1wb3J0cywgbmdNZXRhZGF0YSwgY2hlY2tlcikpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc0FuZ3VsYXJEZWNvcmF0b3JNZXRhZGF0YUV4cHJlc3Npb24oZXhwclN0bXQsIG5nTWV0YWRhdGEsIHRzbGliSW1wb3J0cywgY2hlY2tlcikpIHtcbiAgICAgICAgICBub2Rlcy5wdXNoKG5vZGUpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc1Byb3BEZWNvcmF0b3JBc3NpZ25tZW50RXhwcmVzc2lvbihleHByU3RtdCkpIHtcbiAgICAgICAgICBub2Rlcy5wdXNoKC4uLnBpY2tQcm9wRGVjb3JhdGlvbk5vZGVzVG9SZW1vdmUoZXhwclN0bXQsIG5nTWV0YWRhdGEsIGNoZWNrZXIpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNDdG9yUGFyYW1zQXNzaWdubWVudEV4cHJlc3Npb24oZXhwclN0bXQpXG4gICAgICAgICAgJiYgIWlzQ3RvclBhcmFtc1doaXRlbGlzdGVkU2VydmljZShleHByU3RtdCkpIHtcbiAgICAgICAgICBub2Rlcy5wdXNoKG5vZGUpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHZpc2l0b3I6IHRzLlZpc2l0b3IgPSAobm9kZTogdHMuTm9kZSk6IHRzLlZpc2l0UmVzdWx0PHRzLk5vZGU+ID0+IHtcbiAgICAgICAgLy8gQ2hlY2sgaWYgbm9kZSBpcyBhIHN0YXRlbWVudCB0byBiZSBkcm9wcGVkLlxuICAgICAgICBpZiAobm9kZXMuZmluZCgobikgPT4gbiA9PT0gbm9kZSkpIHtcbiAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gT3RoZXJ3aXNlIHJldHVybiBub2RlIGFzIGlzLlxuICAgICAgICByZXR1cm4gdHMudmlzaXRFYWNoQ2hpbGQobm9kZSwgdmlzaXRvciwgY29udGV4dCk7XG4gICAgICB9O1xuXG4gICAgICByZXR1cm4gdHMudmlzaXROb2RlKHNmLCB2aXNpdG9yKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHRyYW5zZm9ybWVyO1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXhwZWN0PFQgZXh0ZW5kcyB0cy5Ob2RlPihub2RlOiB0cy5Ob2RlLCBraW5kOiB0cy5TeW50YXhLaW5kKTogVCB7XG4gIGlmIChub2RlLmtpbmQgIT09IGtpbmQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgbm9kZSB0eXBlLicpO1xuICB9XG5cbiAgcmV0dXJuIG5vZGUgYXMgVDtcbn1cblxuZnVuY3Rpb24gbmFtZU9mU3BlY2lmaWVyKG5vZGU6IHRzLkltcG9ydFNwZWNpZmllcik6IHN0cmluZyB7XG4gIHJldHVybiBub2RlLm5hbWUgJiYgbm9kZS5uYW1lLnRleHQgfHwgJzx1bmtub3duPic7XG59XG5cbmZ1bmN0aW9uIGZpbmRBbmd1bGFyTWV0YWRhdGEobm9kZTogdHMuTm9kZSwgaXNBbmd1bGFyQ29yZUZpbGU6IGJvb2xlYW4pOiB0cy5Ob2RlW10ge1xuICBsZXQgc3BlY3M6IHRzLk5vZGVbXSA9IFtdO1xuICAvLyBGaW5kIGFsbCBzcGVjaWZpZXJzIGZyb20gaW1wb3J0cyBvZiBgQGFuZ3VsYXIvY29yZWAuXG4gIHRzLmZvckVhY2hDaGlsZChub2RlLCAoY2hpbGQpID0+IHtcbiAgICBpZiAoY2hpbGQua2luZCA9PT0gdHMuU3ludGF4S2luZC5JbXBvcnREZWNsYXJhdGlvbikge1xuICAgICAgY29uc3QgaW1wb3J0RGVjbCA9IGNoaWxkIGFzIHRzLkltcG9ydERlY2xhcmF0aW9uO1xuICAgICAgaWYgKGlzQW5ndWxhckNvcmVJbXBvcnQoaW1wb3J0RGVjbCwgaXNBbmd1bGFyQ29yZUZpbGUpKSB7XG4gICAgICAgIHNwZWNzLnB1c2goLi4uY29sbGVjdERlZXBOb2Rlczx0cy5JbXBvcnRTcGVjaWZpZXI+KG5vZGUsIHRzLlN5bnRheEtpbmQuSW1wb3J0U3BlY2lmaWVyKVxuICAgICAgICAgIC5maWx0ZXIoKHNwZWMpID0+IGlzQW5ndWxhckNvcmVTcGVjaWZpZXIoc3BlYykpKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIC8vIENoZWNrIGlmIHRoZSBjdXJyZW50IG1vZHVsZSBjb250YWlucyBhbGwga25vdyBgQGFuZ3VsYXIvY29yZWAgc3BlY2lmaWVycy5cbiAgLy8gSWYgaXQgZG9lcywgd2UgYXNzdW1lIGl0J3MgYSBgQGFuZ3VsYXIvY29yZWAgRkVTTS5cbiAgaWYgKGlzQW5ndWxhckNvcmVGaWxlKSB7XG4gICAgY29uc3QgbG9jYWxEZWNsID0gZmluZEFsbERlY2xhcmF0aW9ucyhub2RlKVxuICAgICAgLmZpbHRlcigoZGVjbCkgPT4gYW5ndWxhclNwZWNpZmllcnMuaW5kZXhPZigoZGVjbC5uYW1lIGFzIHRzLklkZW50aWZpZXIpLnRleHQpICE9PSAtMSk7XG4gICAgaWYgKGxvY2FsRGVjbC5sZW5ndGggPT09IGFuZ3VsYXJTcGVjaWZpZXJzLmxlbmd0aCkge1xuICAgICAgc3BlY3MgPSBzcGVjcy5jb25jYXQobG9jYWxEZWNsKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gc3BlY3M7XG59XG5cbmZ1bmN0aW9uIGZpbmRBbGxEZWNsYXJhdGlvbnMobm9kZTogdHMuTm9kZSk6IHRzLlZhcmlhYmxlRGVjbGFyYXRpb25bXSB7XG4gIGNvbnN0IG5vZGVzOiB0cy5WYXJpYWJsZURlY2xhcmF0aW9uW10gPSBbXTtcbiAgdHMuZm9yRWFjaENoaWxkKG5vZGUsIChjaGlsZCkgPT4ge1xuICAgIGlmIChjaGlsZC5raW5kID09PSB0cy5TeW50YXhLaW5kLlZhcmlhYmxlU3RhdGVtZW50KSB7XG4gICAgICBjb25zdCB2U3RtdCA9IGNoaWxkIGFzIHRzLlZhcmlhYmxlU3RhdGVtZW50O1xuICAgICAgdlN0bXQuZGVjbGFyYXRpb25MaXN0LmRlY2xhcmF0aW9ucy5mb3JFYWNoKChkZWNsKSA9PiB7XG4gICAgICAgIGlmIChkZWNsLm5hbWUua2luZCAhPT0gdHMuU3ludGF4S2luZC5JZGVudGlmaWVyKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIG5vZGVzLnB1c2goZGVjbCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBub2Rlcztcbn1cblxuZnVuY3Rpb24gaXNBbmd1bGFyQ29yZUltcG9ydChub2RlOiB0cy5JbXBvcnREZWNsYXJhdGlvbiwgaXNBbmd1bGFyQ29yZUZpbGU6IGJvb2xlYW4pOiBib29sZWFuIHtcbiAgaWYgKCEobm9kZS5tb2R1bGVTcGVjaWZpZXIgJiYgdHMuaXNTdHJpbmdMaXRlcmFsKG5vZGUubW9kdWxlU3BlY2lmaWVyKSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgY29uc3QgaW1wb3J0VGV4dCA9IG5vZGUubW9kdWxlU3BlY2lmaWVyLnRleHQ7XG5cbiAgLy8gSW1wb3J0cyB0byBgQGFuZ3VsYXIvY29yZWAgYXJlIGFsd2F5cyBjb3JlIGltcG9ydHMuXG4gIGlmIChpbXBvcnRUZXh0ID09PSAnQGFuZ3VsYXIvY29yZScpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8vIFJlbGF0aXZlIGltcG9ydHMgZnJvbSBhIEFuZ3VsYXIgY29yZSBmaWxlIGFyZSBhbHNvIGNvcmUgaW1wb3J0cy5cbiAgaWYgKGlzQW5ndWxhckNvcmVGaWxlICYmIChpbXBvcnRUZXh0LnN0YXJ0c1dpdGgoJy4vJykgfHwgaW1wb3J0VGV4dC5zdGFydHNXaXRoKCcuLi8nKSkpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gaXNBbmd1bGFyQ29yZVNwZWNpZmllcihub2RlOiB0cy5JbXBvcnRTcGVjaWZpZXIpOiBib29sZWFuIHtcbiAgcmV0dXJuIGFuZ3VsYXJTcGVjaWZpZXJzLmluZGV4T2YobmFtZU9mU3BlY2lmaWVyKG5vZGUpKSAhPT0gLTE7XG59XG5cbi8vIENoZWNrIGlmIGFzc2lnbm1lbnQgaXMgYENsYXp6LmRlY29yYXRvcnMgPSBbLi4uXTtgLlxuZnVuY3Rpb24gaXNEZWNvcmF0b3JBc3NpZ25tZW50RXhwcmVzc2lvbihleHByU3RtdDogdHMuRXhwcmVzc2lvblN0YXRlbWVudCk6IGJvb2xlYW4ge1xuICBpZiAoZXhwclN0bXQuZXhwcmVzc2lvbi5raW5kICE9PSB0cy5TeW50YXhLaW5kLkJpbmFyeUV4cHJlc3Npb24pIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgY29uc3QgZXhwciA9IGV4cHJTdG10LmV4cHJlc3Npb24gYXMgdHMuQmluYXJ5RXhwcmVzc2lvbjtcbiAgaWYgKGV4cHIubGVmdC5raW5kICE9PSB0cy5TeW50YXhLaW5kLlByb3BlcnR5QWNjZXNzRXhwcmVzc2lvbikge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBjb25zdCBwcm9wQWNjZXNzID0gZXhwci5sZWZ0IGFzIHRzLlByb3BlcnR5QWNjZXNzRXhwcmVzc2lvbjtcbiAgaWYgKHByb3BBY2Nlc3MuZXhwcmVzc2lvbi5raW5kICE9PSB0cy5TeW50YXhLaW5kLklkZW50aWZpZXIpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaWYgKHByb3BBY2Nlc3MubmFtZS50ZXh0ICE9PSAnZGVjb3JhdG9ycycpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaWYgKGV4cHIub3BlcmF0b3JUb2tlbi5raW5kICE9PSB0cy5TeW50YXhLaW5kLkZpcnN0QXNzaWdubWVudCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAoZXhwci5yaWdodC5raW5kICE9PSB0cy5TeW50YXhLaW5kLkFycmF5TGl0ZXJhbEV4cHJlc3Npb24pIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn1cblxuLy8gQ2hlY2sgaWYgYXNzaWdubWVudCBpcyBgQ2xhenogPSBfX2RlY29yYXRlKFsuLi5dLCBDbGF6eilgLlxuZnVuY3Rpb24gaXNEZWNvcmF0ZUFzc2lnbm1lbnRFeHByZXNzaW9uKFxuICBleHByU3RtdDogdHMuRXhwcmVzc2lvblN0YXRlbWVudCxcbiAgdHNsaWJJbXBvcnRzOiB0cy5OYW1lc3BhY2VJbXBvcnRbXSxcbiAgY2hlY2tlcjogdHMuVHlwZUNoZWNrZXIsXG4pOiBib29sZWFuIHtcblxuICBpZiAoZXhwclN0bXQuZXhwcmVzc2lvbi5raW5kICE9PSB0cy5TeW50YXhLaW5kLkJpbmFyeUV4cHJlc3Npb24pIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgY29uc3QgZXhwciA9IGV4cHJTdG10LmV4cHJlc3Npb24gYXMgdHMuQmluYXJ5RXhwcmVzc2lvbjtcbiAgaWYgKGV4cHIubGVmdC5raW5kICE9PSB0cy5TeW50YXhLaW5kLklkZW50aWZpZXIpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgY29uc3QgY2xhc3NJZGVudCA9IGV4cHIubGVmdCBhcyB0cy5JZGVudGlmaWVyO1xuICBsZXQgY2FsbEV4cHI6IHRzLkNhbGxFeHByZXNzaW9uO1xuXG4gIGlmIChleHByLnJpZ2h0LmtpbmQgPT09IHRzLlN5bnRheEtpbmQuQ2FsbEV4cHJlc3Npb24pIHtcbiAgICBjYWxsRXhwciA9IGV4cHIucmlnaHQgYXMgdHMuQ2FsbEV4cHJlc3Npb247XG4gIH0gZWxzZSBpZiAoZXhwci5yaWdodC5raW5kID09PSB0cy5TeW50YXhLaW5kLkJpbmFyeUV4cHJlc3Npb24pIHtcbiAgICAvLyBgQ2xhenogPSBDbGF6el8xID0gX19kZWNvcmF0ZShbLi4uXSwgQ2xhenopYCBjYW4gYmUgZm91bmQgd2hlbiB0aGVyZSBhcmUgc3RhdGljIHByb3BlcnR5XG4gICAgLy8gYWNjZXNzZXMuXG4gICAgY29uc3QgaW5uZXJFeHByID0gZXhwci5yaWdodCBhcyB0cy5CaW5hcnlFeHByZXNzaW9uO1xuICAgIGlmIChpbm5lckV4cHIubGVmdC5raW5kICE9PSB0cy5TeW50YXhLaW5kLklkZW50aWZpZXJcbiAgICAgIHx8IGlubmVyRXhwci5yaWdodC5raW5kICE9PSB0cy5TeW50YXhLaW5kLkNhbGxFeHByZXNzaW9uKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNhbGxFeHByID0gaW5uZXJFeHByLnJpZ2h0IGFzIHRzLkNhbGxFeHByZXNzaW9uO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmICghaXNUc2xpYkhlbHBlcihjYWxsRXhwciwgJ19fZGVjb3JhdGUnLCB0c2xpYkltcG9ydHMsIGNoZWNrZXIpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKGNhbGxFeHByLmFyZ3VtZW50cy5sZW5ndGggIT09IDIpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaWYgKGNhbGxFeHByLmFyZ3VtZW50c1sxXS5raW5kICE9PSB0cy5TeW50YXhLaW5kLklkZW50aWZpZXIpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgY29uc3QgY2xhc3NBcmcgPSBjYWxsRXhwci5hcmd1bWVudHNbMV0gYXMgdHMuSWRlbnRpZmllcjtcbiAgaWYgKGNsYXNzSWRlbnQudGV4dCAhPT0gY2xhc3NBcmcudGV4dCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAoY2FsbEV4cHIuYXJndW1lbnRzWzBdLmtpbmQgIT09IHRzLlN5bnRheEtpbmQuQXJyYXlMaXRlcmFsRXhwcmVzc2lvbikge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuXG4vLyBDaGVjayBpZiBleHByZXNzaW9uIGlzIGBfX2RlY29yYXRlKFtzbXQsIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCBPYmplY3QpXSwgLi4uKWAuXG5mdW5jdGlvbiBpc0FuZ3VsYXJEZWNvcmF0b3JNZXRhZGF0YUV4cHJlc3Npb24oXG4gIGV4cHJTdG10OiB0cy5FeHByZXNzaW9uU3RhdGVtZW50LFxuICBuZ01ldGFkYXRhOiB0cy5Ob2RlW10sXG4gIHRzbGliSW1wb3J0czogdHMuTmFtZXNwYWNlSW1wb3J0W10sXG4gIGNoZWNrZXI6IHRzLlR5cGVDaGVja2VyLFxuKTogYm9vbGVhbiB7XG5cbiAgaWYgKGV4cHJTdG10LmV4cHJlc3Npb24ua2luZCAhPT0gdHMuU3ludGF4S2luZC5DYWxsRXhwcmVzc2lvbikge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBjb25zdCBjYWxsRXhwciA9IGV4cHJTdG10LmV4cHJlc3Npb24gYXMgdHMuQ2FsbEV4cHJlc3Npb247XG4gIGlmICghaXNUc2xpYkhlbHBlcihjYWxsRXhwciwgJ19fZGVjb3JhdGUnLCB0c2xpYkltcG9ydHMsIGNoZWNrZXIpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmIChjYWxsRXhwci5hcmd1bWVudHMubGVuZ3RoICE9PSA0KSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmIChjYWxsRXhwci5hcmd1bWVudHNbMF0ua2luZCAhPT0gdHMuU3ludGF4S2luZC5BcnJheUxpdGVyYWxFeHByZXNzaW9uKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGNvbnN0IGRlY29yYXRlQXJyYXkgPSBjYWxsRXhwci5hcmd1bWVudHNbMF0gYXMgdHMuQXJyYXlMaXRlcmFsRXhwcmVzc2lvbjtcbiAgLy8gQ2hlY2sgZmlyc3QgYXJyYXkgZW50cnkgZm9yIEFuZ3VsYXIgZGVjb3JhdG9ycy5cbiAgaWYgKGRlY29yYXRlQXJyYXkuZWxlbWVudHNbMF0ua2luZCAhPT0gdHMuU3ludGF4S2luZC5DYWxsRXhwcmVzc2lvbikge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBjb25zdCBkZWNvcmF0b3JDYWxsID0gZGVjb3JhdGVBcnJheS5lbGVtZW50c1swXSBhcyB0cy5DYWxsRXhwcmVzc2lvbjtcbiAgaWYgKGRlY29yYXRvckNhbGwuZXhwcmVzc2lvbi5raW5kICE9PSB0cy5TeW50YXhLaW5kLklkZW50aWZpZXIpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgY29uc3QgZGVjb3JhdG9ySWQgPSBkZWNvcmF0b3JDYWxsLmV4cHJlc3Npb24gYXMgdHMuSWRlbnRpZmllcjtcbiAgaWYgKCFpZGVudGlmaWVySXNNZXRhZGF0YShkZWNvcmF0b3JJZCwgbmdNZXRhZGF0YSwgY2hlY2tlcikpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgLy8gQ2hlY2sgc2Vjb25kIGFycmF5IGVudHJ5IGZvciBfX21ldGFkYXRhIGNhbGwuXG4gIGlmIChkZWNvcmF0ZUFycmF5LmVsZW1lbnRzWzFdLmtpbmQgIT09IHRzLlN5bnRheEtpbmQuQ2FsbEV4cHJlc3Npb24pIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgY29uc3QgbWV0YWRhdGFDYWxsID0gZGVjb3JhdGVBcnJheS5lbGVtZW50c1sxXSBhcyB0cy5DYWxsRXhwcmVzc2lvbjtcbiAgaWYgKCFpc1RzbGliSGVscGVyKG1ldGFkYXRhQ2FsbCwgJ19fbWV0YWRhdGEnLCB0c2xpYkltcG9ydHMsIGNoZWNrZXIpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8vIENoZWNrIGlmIGFzc2lnbm1lbnQgaXMgYENsYXp6LnByb3BEZWNvcmF0b3JzID0gWy4uLl07YC5cbmZ1bmN0aW9uIGlzUHJvcERlY29yYXRvckFzc2lnbm1lbnRFeHByZXNzaW9uKGV4cHJTdG10OiB0cy5FeHByZXNzaW9uU3RhdGVtZW50KTogYm9vbGVhbiB7XG4gIGlmIChleHByU3RtdC5leHByZXNzaW9uLmtpbmQgIT09IHRzLlN5bnRheEtpbmQuQmluYXJ5RXhwcmVzc2lvbikge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBjb25zdCBleHByID0gZXhwclN0bXQuZXhwcmVzc2lvbiBhcyB0cy5CaW5hcnlFeHByZXNzaW9uO1xuICBpZiAoZXhwci5sZWZ0LmtpbmQgIT09IHRzLlN5bnRheEtpbmQuUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGNvbnN0IHByb3BBY2Nlc3MgPSBleHByLmxlZnQgYXMgdHMuUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uO1xuICBpZiAocHJvcEFjY2Vzcy5leHByZXNzaW9uLmtpbmQgIT09IHRzLlN5bnRheEtpbmQuSWRlbnRpZmllcikge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAocHJvcEFjY2Vzcy5uYW1lLnRleHQgIT09ICdwcm9wRGVjb3JhdG9ycycpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaWYgKGV4cHIub3BlcmF0b3JUb2tlbi5raW5kICE9PSB0cy5TeW50YXhLaW5kLkZpcnN0QXNzaWdubWVudCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAoZXhwci5yaWdodC5raW5kICE9PSB0cy5TeW50YXhLaW5kLk9iamVjdExpdGVyYWxFeHByZXNzaW9uKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8vIENoZWNrIGlmIGFzc2lnbm1lbnQgaXMgYENsYXp6LmN0b3JQYXJhbWV0ZXJzID0gWy4uLl07YC5cbmZ1bmN0aW9uIGlzQ3RvclBhcmFtc0Fzc2lnbm1lbnRFeHByZXNzaW9uKGV4cHJTdG10OiB0cy5FeHByZXNzaW9uU3RhdGVtZW50KTogYm9vbGVhbiB7XG4gIGlmIChleHByU3RtdC5leHByZXNzaW9uLmtpbmQgIT09IHRzLlN5bnRheEtpbmQuQmluYXJ5RXhwcmVzc2lvbikge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBjb25zdCBleHByID0gZXhwclN0bXQuZXhwcmVzc2lvbiBhcyB0cy5CaW5hcnlFeHByZXNzaW9uO1xuICBpZiAoZXhwci5sZWZ0LmtpbmQgIT09IHRzLlN5bnRheEtpbmQuUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGNvbnN0IHByb3BBY2Nlc3MgPSBleHByLmxlZnQgYXMgdHMuUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uO1xuICBpZiAocHJvcEFjY2Vzcy5uYW1lLnRleHQgIT09ICdjdG9yUGFyYW1ldGVycycpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaWYgKHByb3BBY2Nlc3MuZXhwcmVzc2lvbi5raW5kICE9PSB0cy5TeW50YXhLaW5kLklkZW50aWZpZXIpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaWYgKGV4cHIub3BlcmF0b3JUb2tlbi5raW5kICE9PSB0cy5TeW50YXhLaW5kLkZpcnN0QXNzaWdubWVudCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAoZXhwci5yaWdodC5raW5kICE9PSB0cy5TeW50YXhLaW5kLkZ1bmN0aW9uRXhwcmVzc2lvblxuICAgICYmIGV4cHIucmlnaHQua2luZCAhPT0gdHMuU3ludGF4S2luZC5BcnJvd0Z1bmN0aW9uXG4gICkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBpc0N0b3JQYXJhbXNXaGl0ZWxpc3RlZFNlcnZpY2UoZXhwclN0bXQ6IHRzLkV4cHJlc3Npb25TdGF0ZW1lbnQpOiBib29sZWFuIHtcbiAgY29uc3QgZXhwciA9IGV4cHJTdG10LmV4cHJlc3Npb24gYXMgdHMuQmluYXJ5RXhwcmVzc2lvbjtcbiAgY29uc3QgcHJvcEFjY2VzcyA9IGV4cHIubGVmdCBhcyB0cy5Qcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb247XG4gIGNvbnN0IHNlcnZpY2VJZCA9IHByb3BBY2Nlc3MuZXhwcmVzc2lvbiBhcyB0cy5JZGVudGlmaWVyO1xuXG4gIHJldHVybiBwbGF0Zm9ybVdoaXRlbGlzdC5pbmRleE9mKHNlcnZpY2VJZC50ZXh0KSAhPT0gLTE7XG59XG5cbi8vIFJlbW92ZSBBbmd1bGFyIGRlY29yYXRvcnMgZnJvbWBDbGF6ei5kZWNvcmF0b3JzID0gWy4uLl07YCwgb3IgZXhwcmVzc2lvbiBpdHNlbGYgaWYgYWxsIGFyZVxuLy8gcmVtb3ZlZC5cbmZ1bmN0aW9uIHBpY2tEZWNvcmF0aW9uTm9kZXNUb1JlbW92ZShcbiAgZXhwclN0bXQ6IHRzLkV4cHJlc3Npb25TdGF0ZW1lbnQsXG4gIG5nTWV0YWRhdGE6IHRzLk5vZGVbXSxcbiAgY2hlY2tlcjogdHMuVHlwZUNoZWNrZXIsXG4pOiB0cy5Ob2RlW10ge1xuXG4gIGNvbnN0IGV4cHIgPSBleHBlY3Q8dHMuQmluYXJ5RXhwcmVzc2lvbj4oZXhwclN0bXQuZXhwcmVzc2lvbiwgdHMuU3ludGF4S2luZC5CaW5hcnlFeHByZXNzaW9uKTtcbiAgY29uc3QgbGl0ZXJhbCA9IGV4cGVjdDx0cy5BcnJheUxpdGVyYWxFeHByZXNzaW9uPihleHByLnJpZ2h0LFxuICAgIHRzLlN5bnRheEtpbmQuQXJyYXlMaXRlcmFsRXhwcmVzc2lvbik7XG4gIGlmICghbGl0ZXJhbC5lbGVtZW50cy5ldmVyeSgoZWxlbSkgPT4gZWxlbS5raW5kID09PSB0cy5TeW50YXhLaW5kLk9iamVjdExpdGVyYWxFeHByZXNzaW9uKSkge1xuICAgIHJldHVybiBbXTtcbiAgfVxuICBjb25zdCBlbGVtZW50cyA9IGxpdGVyYWwuZWxlbWVudHMgYXMgdHMuTm9kZUFycmF5PHRzLk9iamVjdExpdGVyYWxFeHByZXNzaW9uPjtcbiAgY29uc3QgbmdEZWNvcmF0b3JzID0gZWxlbWVudHMuZmlsdGVyKChlbGVtKSA9PiBpc0FuZ3VsYXJEZWNvcmF0b3IoZWxlbSwgbmdNZXRhZGF0YSwgY2hlY2tlcikpO1xuXG4gIHJldHVybiAoZWxlbWVudHMubGVuZ3RoID4gbmdEZWNvcmF0b3JzLmxlbmd0aCkgPyBuZ0RlY29yYXRvcnMgOiBbZXhwclN0bXRdO1xufVxuXG4vLyBSZW1vdmUgQW5ndWxhciBkZWNvcmF0b3JzIGZyb20gYENsYXp6ID0gX19kZWNvcmF0ZShbLi4uXSwgQ2xhenopYCwgb3IgZXhwcmVzc2lvbiBpdHNlbGYgaWYgYWxsXG4vLyBhcmUgcmVtb3ZlZC5cbmZ1bmN0aW9uIHBpY2tEZWNvcmF0ZU5vZGVzVG9SZW1vdmUoXG4gIGV4cHJTdG10OiB0cy5FeHByZXNzaW9uU3RhdGVtZW50LFxuICB0c2xpYkltcG9ydHM6IHRzLk5hbWVzcGFjZUltcG9ydFtdLFxuICBuZ01ldGFkYXRhOiB0cy5Ob2RlW10sXG4gIGNoZWNrZXI6IHRzLlR5cGVDaGVja2VyLFxuKTogdHMuTm9kZVtdIHtcblxuICBjb25zdCBleHByID0gZXhwZWN0PHRzLkJpbmFyeUV4cHJlc3Npb24+KGV4cHJTdG10LmV4cHJlc3Npb24sIHRzLlN5bnRheEtpbmQuQmluYXJ5RXhwcmVzc2lvbik7XG4gIGNvbnN0IGNsYXNzSWQgPSBleHBlY3Q8dHMuSWRlbnRpZmllcj4oZXhwci5sZWZ0LCB0cy5TeW50YXhLaW5kLklkZW50aWZpZXIpO1xuICBsZXQgY2FsbEV4cHI6IHRzLkNhbGxFeHByZXNzaW9uO1xuXG4gIGlmIChleHByLnJpZ2h0LmtpbmQgPT09IHRzLlN5bnRheEtpbmQuQ2FsbEV4cHJlc3Npb24pIHtcbiAgICBjYWxsRXhwciA9IGV4cGVjdDx0cy5DYWxsRXhwcmVzc2lvbj4oZXhwci5yaWdodCwgdHMuU3ludGF4S2luZC5DYWxsRXhwcmVzc2lvbik7XG4gIH0gZWxzZSBpZiAoZXhwci5yaWdodC5raW5kID09PSB0cy5TeW50YXhLaW5kLkJpbmFyeUV4cHJlc3Npb24pIHtcbiAgICBjb25zdCBpbm5lckV4cHIgPSBleHByLnJpZ2h0IGFzIHRzLkJpbmFyeUV4cHJlc3Npb247XG4gICAgY2FsbEV4cHIgPSBleHBlY3Q8dHMuQ2FsbEV4cHJlc3Npb24+KGlubmVyRXhwci5yaWdodCwgdHMuU3ludGF4S2luZC5DYWxsRXhwcmVzc2lvbik7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgY29uc3QgYXJyTGl0ZXJhbCA9IGV4cGVjdDx0cy5BcnJheUxpdGVyYWxFeHByZXNzaW9uPihjYWxsRXhwci5hcmd1bWVudHNbMF0sXG4gICAgdHMuU3ludGF4S2luZC5BcnJheUxpdGVyYWxFeHByZXNzaW9uKTtcblxuICBpZiAoIWFyckxpdGVyYWwuZWxlbWVudHMuZXZlcnkoKGVsZW0pID0+IGVsZW0ua2luZCA9PT0gdHMuU3ludGF4S2luZC5DYWxsRXhwcmVzc2lvbikpIHtcbiAgICByZXR1cm4gW107XG4gIH1cbiAgY29uc3QgZWxlbWVudHMgPSBhcnJMaXRlcmFsLmVsZW1lbnRzIGFzIHRzLk5vZGVBcnJheTx0cy5DYWxsRXhwcmVzc2lvbj47XG4gIGNvbnN0IG5nRGVjb3JhdG9yQ2FsbHMgPSBlbGVtZW50cy5maWx0ZXIoKGVsKSA9PiB7XG4gICAgaWYgKGVsLmV4cHJlc3Npb24ua2luZCAhPT0gdHMuU3ludGF4S2luZC5JZGVudGlmaWVyKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IGlkID0gZWwuZXhwcmVzc2lvbiBhcyB0cy5JZGVudGlmaWVyO1xuXG4gICAgcmV0dXJuIGlkZW50aWZpZXJJc01ldGFkYXRhKGlkLCBuZ01ldGFkYXRhLCBjaGVja2VyKTtcbiAgfSk7XG5cbiAgLy8gT25seSByZW1vdmUgY29uc3RydWN0b3IgcGFyYW1ldGVyIG1ldGFkYXRhIG9uIG5vbi13aGl0ZWxpc3RlZCBjbGFzc2VzLlxuICBpZiAocGxhdGZvcm1XaGl0ZWxpc3QuaW5kZXhPZihjbGFzc0lkLnRleHQpID09PSAtMSkge1xuICAgIC8vIFJlbW92ZSBfX21ldGFkYXRhIGNhbGxzIG9mIHR5cGUgJ2Rlc2lnbjpwYXJhbXR5cGVzJy5cbiAgICBjb25zdCBtZXRhZGF0YUNhbGxzID0gZWxlbWVudHMuZmlsdGVyKChlbCkgPT4ge1xuICAgICAgaWYgKCFpc1RzbGliSGVscGVyKGVsLCAnX19tZXRhZGF0YScsIHRzbGliSW1wb3J0cywgY2hlY2tlcikpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgaWYgKGVsLmFyZ3VtZW50cy5sZW5ndGggPCAyKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGlmIChlbC5hcmd1bWVudHNbMF0ua2luZCAhPT0gdHMuU3ludGF4S2luZC5TdHJpbmdMaXRlcmFsKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IG1ldGFkYXRhVHlwZUlkID0gZWwuYXJndW1lbnRzWzBdIGFzIHRzLlN0cmluZ0xpdGVyYWw7XG4gICAgICBpZiAobWV0YWRhdGFUeXBlSWQudGV4dCAhPT0gJ2Rlc2lnbjpwYXJhbXR5cGVzJykge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0pO1xuICAgIC8vIFJlbW92ZSBhbGwgX19wYXJhbSBjYWxscy5cbiAgICBjb25zdCBwYXJhbUNhbGxzID0gZWxlbWVudHMuZmlsdGVyKChlbCkgPT4ge1xuICAgICAgaWYgKCFpc1RzbGliSGVscGVyKGVsLCAnX19wYXJhbScsIHRzbGliSW1wb3J0cywgY2hlY2tlcikpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgaWYgKGVsLmFyZ3VtZW50cy5sZW5ndGggIT0gMikge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBpZiAoZWwuYXJndW1lbnRzWzBdLmtpbmQgIT09IHRzLlN5bnRheEtpbmQuTnVtZXJpY0xpdGVyYWwpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9KTtcbiAgICBuZ0RlY29yYXRvckNhbGxzLnB1c2goLi4ubWV0YWRhdGFDYWxscywgLi4ucGFyYW1DYWxscyk7XG4gIH1cblxuICAvLyBJZiBhbGwgZGVjb3JhdG9ycyBhcmUgbWV0YWRhdGEgZGVjb3JhdG9ycyB0aGVuIHJldHVybiB0aGUgd2hvbGUgYENsYXNzID0gX19kZWNvcmF0ZShbLi4uXSknYFxuICAvLyBzdGF0ZW1lbnQgc28gdGhhdCBpdCBpcyByZW1vdmVkIGluIGVudGlyZXR5XG4gIHJldHVybiAoZWxlbWVudHMubGVuZ3RoID09PSBuZ0RlY29yYXRvckNhbGxzLmxlbmd0aCkgPyBbZXhwclN0bXRdIDogbmdEZWNvcmF0b3JDYWxscztcbn1cblxuLy8gUmVtb3ZlIEFuZ3VsYXIgZGVjb3JhdG9ycyBmcm9tYENsYXp6LnByb3BEZWNvcmF0b3JzID0gWy4uLl07YCwgb3IgZXhwcmVzc2lvbiBpdHNlbGYgaWYgYWxsXG4vLyBhcmUgcmVtb3ZlZC5cbmZ1bmN0aW9uIHBpY2tQcm9wRGVjb3JhdGlvbk5vZGVzVG9SZW1vdmUoXG4gIGV4cHJTdG10OiB0cy5FeHByZXNzaW9uU3RhdGVtZW50LFxuICBuZ01ldGFkYXRhOiB0cy5Ob2RlW10sXG4gIGNoZWNrZXI6IHRzLlR5cGVDaGVja2VyLFxuKTogdHMuTm9kZVtdIHtcblxuICBjb25zdCBleHByID0gZXhwZWN0PHRzLkJpbmFyeUV4cHJlc3Npb24+KGV4cHJTdG10LmV4cHJlc3Npb24sIHRzLlN5bnRheEtpbmQuQmluYXJ5RXhwcmVzc2lvbik7XG4gIGNvbnN0IGxpdGVyYWwgPSBleHBlY3Q8dHMuT2JqZWN0TGl0ZXJhbEV4cHJlc3Npb24+KGV4cHIucmlnaHQsXG4gICAgdHMuU3ludGF4S2luZC5PYmplY3RMaXRlcmFsRXhwcmVzc2lvbik7XG4gIGlmICghbGl0ZXJhbC5wcm9wZXJ0aWVzLmV2ZXJ5KChlbGVtKSA9PiBlbGVtLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuUHJvcGVydHlBc3NpZ25tZW50ICYmXG4gICAgKGVsZW0gYXMgdHMuUHJvcGVydHlBc3NpZ25tZW50KS5pbml0aWFsaXplci5raW5kID09PSB0cy5TeW50YXhLaW5kLkFycmF5TGl0ZXJhbEV4cHJlc3Npb24pKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG4gIGNvbnN0IGFzc2lnbm1lbnRzID0gbGl0ZXJhbC5wcm9wZXJ0aWVzIGFzIHRzLk5vZGVBcnJheTx0cy5Qcm9wZXJ0eUFzc2lnbm1lbnQ+O1xuICAvLyBDb25zaWRlciBlYWNoIGFzc2lnbm1lbnQgaW5kaXZpZHVhbGx5LiBFaXRoZXIgdGhlIHdob2xlIGFzc2lnbm1lbnQgd2lsbCBiZSByZW1vdmVkIG9yXG4gIC8vIGEgcGFydGljdWxhciBkZWNvcmF0b3Igd2l0aGluIHdpbGwuXG4gIGNvbnN0IHRvUmVtb3ZlID0gYXNzaWdubWVudHNcbiAgICAubWFwKChhc3NpZ24pID0+IHtcbiAgICAgIGNvbnN0IGRlY29yYXRvcnMgPVxuICAgICAgICBleHBlY3Q8dHMuQXJyYXlMaXRlcmFsRXhwcmVzc2lvbj4oYXNzaWduLmluaXRpYWxpemVyLFxuICAgICAgICAgIHRzLlN5bnRheEtpbmQuQXJyYXlMaXRlcmFsRXhwcmVzc2lvbikuZWxlbWVudHM7XG4gICAgICBpZiAoIWRlY29yYXRvcnMuZXZlcnkoKGVsKSA9PiBlbC5raW5kID09PSB0cy5TeW50YXhLaW5kLk9iamVjdExpdGVyYWxFeHByZXNzaW9uKSkge1xuICAgICAgICByZXR1cm4gW107XG4gICAgICB9XG4gICAgICBjb25zdCBkZWNzVG9SZW1vdmUgPSBkZWNvcmF0b3JzLmZpbHRlcigoZXhwcmVzc2lvbikgPT4ge1xuICAgICAgICBjb25zdCBsaXQgPSBleHBlY3Q8dHMuT2JqZWN0TGl0ZXJhbEV4cHJlc3Npb24+KGV4cHJlc3Npb24sXG4gICAgICAgICAgdHMuU3ludGF4S2luZC5PYmplY3RMaXRlcmFsRXhwcmVzc2lvbik7XG5cbiAgICAgICAgcmV0dXJuIGlzQW5ndWxhckRlY29yYXRvcihsaXQsIG5nTWV0YWRhdGEsIGNoZWNrZXIpO1xuICAgICAgfSk7XG4gICAgICBpZiAoZGVjc1RvUmVtb3ZlLmxlbmd0aCA9PT0gZGVjb3JhdG9ycy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIFthc3NpZ25dO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZGVjc1RvUmVtb3ZlO1xuICAgIH0pXG4gICAgLnJlZHVjZSgoYWNjdW0sIHRvUm0pID0+IGFjY3VtLmNvbmNhdCh0b1JtKSwgW10gYXMgdHMuTm9kZVtdKTtcbiAgLy8gSWYgZXZlcnkgbm9kZSB0byBiZSByZW1vdmVkIGlzIGEgcHJvcGVydHkgYXNzaWdubWVudCAoZnVsbCBwcm9wZXJ0eSdzIGRlY29yYXRvcnMpIGFuZFxuICAvLyBhbGwgcHJvcGVydGllcyBhcmUgYWNjb3VudGVkIGZvciwgcmVtb3ZlIHRoZSB3aG9sZSBhc3NpZ25tZW50LiBPdGhlcndpc2UsIHJlbW92ZSB0aGVcbiAgLy8gbm9kZXMgd2hpY2ggd2VyZSBtYXJrZWQgYXMgc2FmZS5cbiAgaWYgKHRvUmVtb3ZlLmxlbmd0aCA9PT0gYXNzaWdubWVudHMubGVuZ3RoICYmXG4gICAgdG9SZW1vdmUuZXZlcnkoKG5vZGUpID0+IG5vZGUua2luZCA9PT0gdHMuU3ludGF4S2luZC5Qcm9wZXJ0eUFzc2lnbm1lbnQpKSB7XG4gICAgcmV0dXJuIFtleHByU3RtdF07XG4gIH1cblxuICByZXR1cm4gdG9SZW1vdmU7XG59XG5cbmZ1bmN0aW9uIGlzQW5ndWxhckRlY29yYXRvcihcbiAgbGl0ZXJhbDogdHMuT2JqZWN0TGl0ZXJhbEV4cHJlc3Npb24sXG4gIG5nTWV0YWRhdGE6IHRzLk5vZGVbXSxcbiAgY2hlY2tlcjogdHMuVHlwZUNoZWNrZXIsXG4pOiBib29sZWFuIHtcblxuICBjb25zdCB0eXBlcyA9IGxpdGVyYWwucHJvcGVydGllcy5maWx0ZXIoaXNUeXBlUHJvcGVydHkpO1xuICBpZiAodHlwZXMubGVuZ3RoICE9PSAxKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGNvbnN0IGFzc2lnbiA9IGV4cGVjdDx0cy5Qcm9wZXJ0eUFzc2lnbm1lbnQ+KHR5cGVzWzBdLCB0cy5TeW50YXhLaW5kLlByb3BlcnR5QXNzaWdubWVudCk7XG4gIGlmIChhc3NpZ24uaW5pdGlhbGl6ZXIua2luZCAhPT0gdHMuU3ludGF4S2luZC5JZGVudGlmaWVyKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGNvbnN0IGlkID0gYXNzaWduLmluaXRpYWxpemVyIGFzIHRzLklkZW50aWZpZXI7XG4gIGNvbnN0IHJlcyA9IGlkZW50aWZpZXJJc01ldGFkYXRhKGlkLCBuZ01ldGFkYXRhLCBjaGVja2VyKTtcblxuICByZXR1cm4gcmVzO1xufVxuXG5mdW5jdGlvbiBpc1R5cGVQcm9wZXJ0eShwcm9wOiB0cy5PYmplY3RMaXRlcmFsRWxlbWVudCk6IGJvb2xlYW4ge1xuICBpZiAocHJvcC5raW5kICE9PSB0cy5TeW50YXhLaW5kLlByb3BlcnR5QXNzaWdubWVudCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBjb25zdCBhc3NpZ25tZW50ID0gcHJvcCBhcyB0cy5Qcm9wZXJ0eUFzc2lnbm1lbnQ7XG4gIGlmIChhc3NpZ25tZW50Lm5hbWUua2luZCAhPT0gdHMuU3ludGF4S2luZC5JZGVudGlmaWVyKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGNvbnN0IG5hbWUgPSBhc3NpZ25tZW50Lm5hbWUgYXMgdHMuSWRlbnRpZmllcjtcblxuICByZXR1cm4gbmFtZS50ZXh0ID09PSAndHlwZSc7XG59XG5cbi8vIENoZWNrIGlmIGFuIGlkZW50aWZpZXIgaXMgcGFydCBvZiB0aGUga25vd24gQW5ndWxhciBNZXRhZGF0YS5cbmZ1bmN0aW9uIGlkZW50aWZpZXJJc01ldGFkYXRhKFxuICBpZDogdHMuSWRlbnRpZmllcixcbiAgbWV0YWRhdGE6IHRzLk5vZGVbXSxcbiAgY2hlY2tlcjogdHMuVHlwZUNoZWNrZXIsXG4pOiBib29sZWFuIHtcbiAgY29uc3Qgc3ltYm9sID0gY2hlY2tlci5nZXRTeW1ib2xBdExvY2F0aW9uKGlkKTtcbiAgaWYgKCFzeW1ib2wgfHwgIXN5bWJvbC5kZWNsYXJhdGlvbnMgfHwgIXN5bWJvbC5kZWNsYXJhdGlvbnMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIHN5bWJvbFxuICAgIC5kZWNsYXJhdGlvbnNcbiAgICAuc29tZSgoc3BlYykgPT4gbWV0YWRhdGEuaW5kZXhPZihzcGVjKSAhPT0gLTEpO1xufVxuXG4vLyBDaGVjayBpZiBhbiBpbXBvcnQgaXMgYSB0c2xpYiBoZWxwZXIgaW1wb3J0IChgaW1wb3J0ICogYXMgdHNsaWIgZnJvbSBcInRzbGliXCI7YClcbmZ1bmN0aW9uIGlzVHNsaWJJbXBvcnQobm9kZTogdHMuSW1wb3J0RGVjbGFyYXRpb24pOiBib29sZWFuIHtcbiAgcmV0dXJuICEhKG5vZGUubW9kdWxlU3BlY2lmaWVyICYmXG4gICAgbm9kZS5tb2R1bGVTcGVjaWZpZXIua2luZCA9PT0gdHMuU3ludGF4S2luZC5TdHJpbmdMaXRlcmFsICYmXG4gICAgKG5vZGUubW9kdWxlU3BlY2lmaWVyIGFzIHRzLlN0cmluZ0xpdGVyYWwpLnRleHQgPT09ICd0c2xpYicgJiZcbiAgICBub2RlLmltcG9ydENsYXVzZSAmJlxuICAgIG5vZGUuaW1wb3J0Q2xhdXNlLm5hbWVkQmluZGluZ3MgJiZcbiAgICBub2RlLmltcG9ydENsYXVzZS5uYW1lZEJpbmRpbmdzLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuTmFtZXNwYWNlSW1wb3J0KTtcbn1cblxuLy8gRmluZCBhbGwgbmFtZXNwYWNlIGltcG9ydHMgZm9yIGB0c2xpYmAuXG5mdW5jdGlvbiBmaW5kVHNsaWJJbXBvcnRzKG5vZGU6IHRzLk5vZGUpOiB0cy5OYW1lc3BhY2VJbXBvcnRbXSB7XG4gIGNvbnN0IGltcG9ydHM6IHRzLk5hbWVzcGFjZUltcG9ydFtdID0gW107XG4gIHRzLmZvckVhY2hDaGlsZChub2RlLCAoY2hpbGQpID0+IHtcbiAgICBpZiAoY2hpbGQua2luZCA9PT0gdHMuU3ludGF4S2luZC5JbXBvcnREZWNsYXJhdGlvbikge1xuICAgICAgY29uc3QgaW1wb3J0RGVjbCA9IGNoaWxkIGFzIHRzLkltcG9ydERlY2xhcmF0aW9uO1xuICAgICAgaWYgKGlzVHNsaWJJbXBvcnQoaW1wb3J0RGVjbCkpIHtcbiAgICAgICAgY29uc3QgaW1wb3J0Q2xhdXNlID0gaW1wb3J0RGVjbC5pbXBvcnRDbGF1c2UgYXMgdHMuSW1wb3J0Q2xhdXNlO1xuICAgICAgICBjb25zdCBuYW1lc3BhY2VJbXBvcnQgPSBpbXBvcnRDbGF1c2UubmFtZWRCaW5kaW5ncyBhcyB0cy5OYW1lc3BhY2VJbXBvcnQ7XG4gICAgICAgIGltcG9ydHMucHVzaChuYW1lc3BhY2VJbXBvcnQpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIGltcG9ydHM7XG59XG5cbi8vIENoZWNrIGlmIGFuIGlkZW50aWZpZXIgaXMgcGFydCBvZiB0aGUga25vd24gdHNsaWIgaWRlbnRpZmllcnMuXG5mdW5jdGlvbiBpZGVudGlmaWVySXNUc2xpYihcbiAgaWQ6IHRzLklkZW50aWZpZXIsXG4gIHRzbGliSW1wb3J0czogdHMuTmFtZXNwYWNlSW1wb3J0W10sXG4gIGNoZWNrZXI6IHRzLlR5cGVDaGVja2VyLFxuKTogYm9vbGVhbiB7XG4gIGNvbnN0IHN5bWJvbCA9IGNoZWNrZXIuZ2V0U3ltYm9sQXRMb2NhdGlvbihpZCk7XG4gIGlmICghc3ltYm9sIHx8ICFzeW1ib2wuZGVjbGFyYXRpb25zIHx8ICFzeW1ib2wuZGVjbGFyYXRpb25zLmxlbmd0aCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiBzeW1ib2xcbiAgICAuZGVjbGFyYXRpb25zXG4gICAgLnNvbWUoKHNwZWMpID0+IHRzbGliSW1wb3J0cy5pbmRleE9mKHNwZWMgYXMgdHMuTmFtZXNwYWNlSW1wb3J0KSAhPT0gLTEpO1xufVxuXG4vLyBDaGVjayBpZiBhIGZ1bmN0aW9uIGNhbGwgaXMgYSB0c2xpYiBoZWxwZXIuXG5mdW5jdGlvbiBpc1RzbGliSGVscGVyKFxuICBjYWxsRXhwcjogdHMuQ2FsbEV4cHJlc3Npb24sXG4gIGhlbHBlcjogc3RyaW5nLFxuICB0c2xpYkltcG9ydHM6IHRzLk5hbWVzcGFjZUltcG9ydFtdLFxuICBjaGVja2VyOiB0cy5UeXBlQ2hlY2tlcixcbikge1xuXG4gIGxldCBjYWxsRXhwcklkZW50ID0gY2FsbEV4cHIuZXhwcmVzc2lvbiBhcyB0cy5JZGVudGlmaWVyO1xuXG4gIGlmIChjYWxsRXhwci5leHByZXNzaW9uLmtpbmQgIT09IHRzLlN5bnRheEtpbmQuSWRlbnRpZmllcikge1xuICAgIGlmIChjYWxsRXhwci5leHByZXNzaW9uLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uKSB7XG4gICAgICBjb25zdCBwcm9wQWNjZXNzID0gY2FsbEV4cHIuZXhwcmVzc2lvbiBhcyB0cy5Qcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb247XG4gICAgICBjb25zdCBsZWZ0ID0gcHJvcEFjY2Vzcy5leHByZXNzaW9uO1xuICAgICAgY2FsbEV4cHJJZGVudCA9IHByb3BBY2Nlc3MubmFtZTtcblxuICAgICAgaWYgKGxlZnQua2luZCAhPT0gdHMuU3ludGF4S2luZC5JZGVudGlmaWVyKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgaWQgPSBsZWZ0IGFzIHRzLklkZW50aWZpZXI7XG5cbiAgICAgIGlmICghaWRlbnRpZmllcklzVHNsaWIoaWQsIHRzbGliSW1wb3J0cywgY2hlY2tlcikpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICAvLyBub2RlLnRleHQgb24gYSBuYW1lIHRoYXQgc3RhcnRzIHdpdGggdHdvIHVuZGVyc2NvcmVzIHdpbGwgcmV0dXJuIHRocmVlIGluc3RlYWQuXG4gIC8vIFVubGVzcyBpdCdzIGFuIGV4cHJlc3Npb24gbGlrZSB0c2xpYi5fX2RlY29yYXRlLCBpbiB3aGljaCBjYXNlIGl0J3Mgb25seSAyLlxuICBpZiAoY2FsbEV4cHJJZGVudC50ZXh0ICE9PSBgXyR7aGVscGVyfWAgJiYgY2FsbEV4cHJJZGVudC50ZXh0ICE9PSBoZWxwZXIpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn1cbiJdfQ==