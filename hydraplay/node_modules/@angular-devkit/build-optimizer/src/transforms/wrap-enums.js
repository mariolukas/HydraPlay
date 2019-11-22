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
function isBlockLike(node) {
    return node.kind === ts.SyntaxKind.Block
        || node.kind === ts.SyntaxKind.ModuleBlock
        || node.kind === ts.SyntaxKind.CaseClause
        || node.kind === ts.SyntaxKind.DefaultClause
        || node.kind === ts.SyntaxKind.SourceFile;
}
function getWrapEnumsTransformer() {
    return (context) => {
        const transformer = sf => {
            const result = visitBlockStatements(sf.statements, context);
            return ts.updateSourceFileNode(sf, ts.setTextRange(result, sf.statements));
        };
        return transformer;
    };
}
exports.getWrapEnumsTransformer = getWrapEnumsTransformer;
function visitBlockStatements(statements, context) {
    // copy of statements to modify; lazy initialized
    let updatedStatements;
    const visitor = (node) => {
        if (isBlockLike(node)) {
            let result = visitBlockStatements(node.statements, context);
            if (result === node.statements) {
                return node;
            }
            result = ts.setTextRange(result, node.statements);
            switch (node.kind) {
                case ts.SyntaxKind.Block:
                    return ts.updateBlock(node, result);
                case ts.SyntaxKind.ModuleBlock:
                    return ts.updateModuleBlock(node, result);
                case ts.SyntaxKind.CaseClause:
                    return ts.updateCaseClause(node, node.expression, result);
                case ts.SyntaxKind.DefaultClause:
                    return ts.updateDefaultClause(node, result);
                default:
                    return node;
            }
        }
        else {
            return ts.visitEachChild(node, visitor, context);
        }
    };
    // 'oIndex' is the original statement index; 'uIndex' is the updated statement index
    for (let oIndex = 0, uIndex = 0; oIndex < statements.length; oIndex++, uIndex++) {
        const currentStatement = statements[oIndex];
        // these can't contain an enum declaration
        if (currentStatement.kind === ts.SyntaxKind.ImportDeclaration) {
            continue;
        }
        // enum declarations must:
        //   * not be last statement
        //   * be a variable statement
        //   * have only one declaration
        //   * have an identifer as a declaration name
        if (oIndex < statements.length - 1
            && ts.isVariableStatement(currentStatement)
            && currentStatement.declarationList.declarations.length === 1) {
            const variableDeclaration = currentStatement.declarationList.declarations[0];
            if (ts.isIdentifier(variableDeclaration.name)) {
                const name = variableDeclaration.name.text;
                if (!variableDeclaration.initializer) {
                    const iife = findTs2_3EnumIife(name, statements[oIndex + 1]);
                    if (iife) {
                        // found an enum
                        if (!updatedStatements) {
                            updatedStatements = statements.slice();
                        }
                        // update IIFE and replace variable statement and old IIFE
                        updatedStatements.splice(uIndex, 2, updateEnumIife(currentStatement, iife[0], iife[1]));
                        // skip IIFE statement
                        oIndex++;
                        continue;
                    }
                }
                else if (ts.isObjectLiteralExpression(variableDeclaration.initializer)
                    && variableDeclaration.initializer.properties.length === 0) {
                    const enumStatements = findTs2_2EnumStatements(name, statements, oIndex + 1);
                    if (enumStatements.length > 0) {
                        // found an enum
                        if (!updatedStatements) {
                            updatedStatements = statements.slice();
                        }
                        // create wrapper and replace variable statement and enum member statements
                        updatedStatements.splice(uIndex, enumStatements.length + 1, createWrappedEnum(name, currentStatement, enumStatements, variableDeclaration.initializer));
                        // skip enum member declarations
                        oIndex += enumStatements.length;
                        continue;
                    }
                }
                else if (ts.isObjectLiteralExpression(variableDeclaration.initializer)
                    && variableDeclaration.initializer.properties.length !== 0) {
                    const literalPropertyCount = variableDeclaration.initializer.properties.length;
                    // tsickle es2015 enums first statement is an export declaration
                    const isPotentialEnumExport = ts.isExportDeclaration(statements[oIndex + 1]);
                    if (isPotentialEnumExport) {
                        // skip the export
                        oIndex++;
                    }
                    const enumStatements = findEnumNameStatements(name, statements, oIndex + 1);
                    if (enumStatements.length === literalPropertyCount) {
                        // found an enum
                        if (!updatedStatements) {
                            updatedStatements = statements.slice();
                        }
                        // create wrapper and replace variable statement and enum member statements
                        const deleteCount = enumStatements.length + (isPotentialEnumExport ? 2 : 1);
                        updatedStatements.splice(uIndex, deleteCount, createWrappedEnum(name, currentStatement, enumStatements, variableDeclaration.initializer, isPotentialEnumExport));
                        // skip enum member declarations
                        oIndex += enumStatements.length;
                        continue;
                    }
                }
            }
        }
        const result = ts.visitNode(currentStatement, visitor);
        if (result !== currentStatement) {
            if (!updatedStatements) {
                updatedStatements = statements.slice();
            }
            updatedStatements[uIndex] = result;
        }
    }
    // if changes, return updated statements
    // otherwise, return original array instance
    return updatedStatements ? ts.createNodeArray(updatedStatements) : statements;
}
// TS 2.3 enums have statements that are inside a IIFE.
function findTs2_3EnumIife(name, statement) {
    if (!ts.isExpressionStatement(statement)) {
        return null;
    }
    let expression = statement.expression;
    while (ts.isParenthesizedExpression(expression)) {
        expression = expression.expression;
    }
    if (!expression || !ts.isCallExpression(expression) || expression.arguments.length !== 1) {
        return null;
    }
    const callExpression = expression;
    let exportExpression;
    let argument = expression.arguments[0];
    if (!ts.isBinaryExpression(argument)) {
        return null;
    }
    if (!ts.isIdentifier(argument.left) || argument.left.text !== name) {
        return null;
    }
    let potentialExport = false;
    if (argument.operatorToken.kind === ts.SyntaxKind.FirstAssignment) {
        if (!ts.isBinaryExpression(argument.right)
            || argument.right.operatorToken.kind !== ts.SyntaxKind.BarBarToken) {
            return null;
        }
        potentialExport = true;
        argument = argument.right;
    }
    if (!ts.isBinaryExpression(argument)) {
        return null;
    }
    if (argument.operatorToken.kind !== ts.SyntaxKind.BarBarToken) {
        return null;
    }
    if (potentialExport && !ts.isIdentifier(argument.left)) {
        exportExpression = argument.left;
    }
    expression = expression.expression;
    while (ts.isParenthesizedExpression(expression)) {
        expression = expression.expression;
    }
    if (!expression || !ts.isFunctionExpression(expression) || expression.parameters.length !== 1) {
        return null;
    }
    const parameter = expression.parameters[0];
    if (!ts.isIdentifier(parameter.name)) {
        return null;
    }
    // The name of the parameter can be different than the name of the enum if it was renamed
    // due to scope hoisting.
    const parameterName = parameter.name.text;
    // In TS 2.3 enums, the IIFE contains only expressions with a certain format.
    // If we find any that is different, we ignore the whole thing.
    for (let bodyIndex = 0; bodyIndex < expression.body.statements.length; ++bodyIndex) {
        const bodyStatement = expression.body.statements[bodyIndex];
        if (!ts.isExpressionStatement(bodyStatement) || !bodyStatement.expression) {
            return null;
        }
        if (!ts.isBinaryExpression(bodyStatement.expression)
            || bodyStatement.expression.operatorToken.kind !== ts.SyntaxKind.FirstAssignment) {
            return null;
        }
        const assignment = bodyStatement.expression.left;
        const value = bodyStatement.expression.right;
        if (!ts.isElementAccessExpression(assignment) || !ts.isStringLiteral(value)) {
            return null;
        }
        if (!ts.isIdentifier(assignment.expression) || assignment.expression.text !== parameterName) {
            return null;
        }
        const memberArgument = assignment.argumentExpression;
        if (!memberArgument || !ts.isBinaryExpression(memberArgument)
            || memberArgument.operatorToken.kind !== ts.SyntaxKind.FirstAssignment) {
            return null;
        }
        if (!ts.isElementAccessExpression(memberArgument.left)) {
            return null;
        }
        if (!ts.isIdentifier(memberArgument.left.expression)
            || memberArgument.left.expression.text !== parameterName) {
            return null;
        }
        if (!memberArgument.left.argumentExpression
            || !ts.isStringLiteral(memberArgument.left.argumentExpression)) {
            return null;
        }
        if (memberArgument.left.argumentExpression.text !== value.text) {
            return null;
        }
    }
    return [callExpression, exportExpression];
}
// TS 2.2 enums have statements after the variable declaration, with index statements followed
// by value statements.
function findTs2_2EnumStatements(name, statements, statementOffset) {
    const enumValueStatements = [];
    const memberNames = [];
    let index = statementOffset;
    for (; index < statements.length; ++index) {
        // Ensure all statements are of the expected format and using the right identifer.
        // When we find a statement that isn't part of the enum, return what we collected so far.
        const current = statements[index];
        if (!ts.isExpressionStatement(current) || !ts.isBinaryExpression(current.expression)) {
            break;
        }
        const property = current.expression.left;
        if (!property || !ts.isPropertyAccessExpression(property)) {
            break;
        }
        if (!ts.isIdentifier(property.expression) || property.expression.text !== name) {
            break;
        }
        memberNames.push(property.name.text);
        enumValueStatements.push(current);
    }
    if (enumValueStatements.length === 0) {
        return [];
    }
    const enumNameStatements = findEnumNameStatements(name, statements, index, memberNames);
    if (enumNameStatements.length !== enumValueStatements.length) {
        return [];
    }
    return enumValueStatements.concat(enumNameStatements);
}
// Tsickle enums have a variable statement with indexes, followed by value statements.
// See https://github.com/angular/devkit/issues/229#issuecomment-338512056 fore more information.
function findEnumNameStatements(name, statements, statementOffset, memberNames) {
    const enumStatements = [];
    for (let index = statementOffset; index < statements.length; ++index) {
        // Ensure all statements are of the expected format and using the right identifer.
        // When we find a statement that isn't part of the enum, return what we collected so far.
        const current = statements[index];
        if (!ts.isExpressionStatement(current) || !ts.isBinaryExpression(current.expression)) {
            break;
        }
        const access = current.expression.left;
        const value = current.expression.right;
        if (!access || !ts.isElementAccessExpression(access) || !value || !ts.isStringLiteral(value)) {
            break;
        }
        if (memberNames && !memberNames.includes(value.text)) {
            break;
        }
        if (!ts.isIdentifier(access.expression) || access.expression.text !== name) {
            break;
        }
        if (!access.argumentExpression || !ts.isPropertyAccessExpression(access.argumentExpression)) {
            break;
        }
        const enumExpression = access.argumentExpression.expression;
        if (!ts.isIdentifier(enumExpression) || enumExpression.text !== name) {
            break;
        }
        if (value.text !== access.argumentExpression.name.text) {
            break;
        }
        enumStatements.push(current);
    }
    return enumStatements;
}
function updateHostNode(hostNode, expression) {
    // Update existing host node with the pure comment before the variable declaration initializer.
    const variableDeclaration = hostNode.declarationList.declarations[0];
    const outerVarStmt = ts.updateVariableStatement(hostNode, hostNode.modifiers, ts.updateVariableDeclarationList(hostNode.declarationList, [
        ts.updateVariableDeclaration(variableDeclaration, variableDeclaration.name, variableDeclaration.type, expression),
    ]));
    return outerVarStmt;
}
function updateEnumIife(hostNode, iife, exportAssignment) {
    if (!ts.isParenthesizedExpression(iife.expression)
        || !ts.isFunctionExpression(iife.expression.expression)) {
        throw new Error('Invalid IIFE Structure');
    }
    // Ignore export assignment if variable is directly exported
    if (hostNode.modifiers
        && hostNode.modifiers.findIndex(m => m.kind == ts.SyntaxKind.ExportKeyword) != -1) {
        exportAssignment = undefined;
    }
    const expression = iife.expression.expression;
    const updatedFunction = ts.updateFunctionExpression(expression, expression.modifiers, expression.asteriskToken, expression.name, expression.typeParameters, expression.parameters, expression.type, ts.updateBlock(expression.body, [
        ...expression.body.statements,
        ts.createReturn(expression.parameters[0].name),
    ]));
    let arg = ts.createObjectLiteral();
    if (exportAssignment) {
        arg = ts.createBinary(exportAssignment, ts.SyntaxKind.BarBarToken, arg);
    }
    const updatedIife = ts.updateCall(iife, ts.updateParen(iife.expression, updatedFunction), iife.typeArguments, [arg]);
    let value = ast_utils_1.addPureComment(updatedIife);
    if (exportAssignment) {
        value = ts.createBinary(exportAssignment, ts.SyntaxKind.FirstAssignment, updatedIife);
    }
    return updateHostNode(hostNode, value);
}
function createWrappedEnum(name, hostNode, statements, literalInitializer, addExportModifier = false) {
    literalInitializer = literalInitializer || ts.createObjectLiteral();
    const node = addExportModifier
        ? ts.updateVariableStatement(hostNode, [ts.createToken(ts.SyntaxKind.ExportKeyword)], hostNode.declarationList)
        : hostNode;
    const innerVarStmt = ts.createVariableStatement(undefined, ts.createVariableDeclarationList([
        ts.createVariableDeclaration(name, undefined, literalInitializer),
    ]));
    const innerReturn = ts.createReturn(ts.createIdentifier(name));
    const iife = ts.createImmediatelyInvokedFunctionExpression([
        innerVarStmt,
        ...statements,
        innerReturn,
    ]);
    return updateHostNode(node, ast_utils_1.addPureComment(ts.createParen(iife)));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid3JhcC1lbnVtcy5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsicGFja2FnZXMvYW5ndWxhcl9kZXZraXQvYnVpbGRfb3B0aW1pemVyL3NyYy90cmFuc2Zvcm1zL3dyYXAtZW51bXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7O0dBTUc7QUFDSCxpQ0FBaUM7QUFDakMsb0RBQXNEO0FBRXRELFNBQVMsV0FBVyxDQUFDLElBQWE7SUFDaEMsT0FBTyxJQUFJLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsS0FBSztXQUNqQyxJQUFJLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsV0FBVztXQUN2QyxJQUFJLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsVUFBVTtXQUN0QyxJQUFJLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsYUFBYTtXQUN6QyxJQUFJLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDO0FBQ2hELENBQUM7QUFFRCxTQUFnQix1QkFBdUI7SUFDckMsT0FBTyxDQUFDLE9BQWlDLEVBQWlDLEVBQUU7UUFDMUUsTUFBTSxXQUFXLEdBQWtDLEVBQUUsQ0FBQyxFQUFFO1lBQ3RELE1BQU0sTUFBTSxHQUFHLG9CQUFvQixDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFFNUQsT0FBTyxFQUFFLENBQUMsb0JBQW9CLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQzdFLENBQUMsQ0FBQztRQUVGLE9BQU8sV0FBVyxDQUFDO0lBQ3JCLENBQUMsQ0FBQztBQUNKLENBQUM7QUFWRCwwREFVQztBQUVELFNBQVMsb0JBQW9CLENBQzNCLFVBQXNDLEVBQ3RDLE9BQWlDO0lBR2pDLGlEQUFpRDtJQUNqRCxJQUFJ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R0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBRS9ELE1BQU0sSUFBSSxHQUFHLEVBQUUsQ0FBQywwQ0FBMEMsQ0FBQztRQUN6RCxZQUFZO1FBQ1osR0FBRyxVQUFVO1FBQ2IsV0FBVztLQUNaLENBQUMsQ0FBQztJQUVILE9BQU8sY0FBYyxDQUFDLElBQUksRUFBRSwwQkFBYyxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3BFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcbmltcG9ydCB7IGFkZFB1cmVDb21tZW50IH0gZnJvbSAnLi4vaGVscGVycy9hc3QtdXRpbHMnO1xuXG5mdW5jdGlvbiBpc0Jsb2NrTGlrZShub2RlOiB0cy5Ob2RlKTogbm9kZSBpcyB0cy5CbG9ja0xpa2Uge1xuICByZXR1cm4gbm9kZS5raW5kID09PSB0cy5TeW50YXhLaW5kLkJsb2NrXG4gICAgICB8fCBub2RlLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuTW9kdWxlQmxvY2tcbiAgICAgIHx8IG5vZGUua2luZCA9PT0gdHMuU3ludGF4S2luZC5DYXNlQ2xhdXNlXG4gICAgICB8fCBub2RlLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuRGVmYXVsdENsYXVzZVxuICAgICAgfHwgbm9kZS5raW5kID09PSB0cy5TeW50YXhLaW5kLlNvdXJjZUZpbGU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRXcmFwRW51bXNUcmFuc2Zvcm1lcigpOiB0cy5UcmFuc2Zvcm1lckZhY3Rvcnk8dHMuU291cmNlRmlsZT4ge1xuICByZXR1cm4gKGNvbnRleHQ6IHRzLlRyYW5zZm9ybWF0aW9uQ29udGV4dCk6IHRzLlRyYW5zZm9ybWVyPHRzLlNvdXJjZUZpbGU+ID0+IHtcbiAgICBjb25zdCB0cmFuc2Zvcm1lcjogdHMuVHJhbnNmb3JtZXI8dHMuU291cmNlRmlsZT4gPSBzZiA9PiB7XG4gICAgICBjb25zdCByZXN1bHQgPSB2aXNpdEJsb2NrU3RhdGVtZW50cyhzZi5zdGF0ZW1lbnRzLCBjb250ZXh0KTtcblxuICAgICAgcmV0dXJuIHRzLnVwZGF0ZVNvdXJjZUZpbGVOb2RlKHNmLCB0cy5zZXRUZXh0UmFuZ2UocmVzdWx0LCBzZi5zdGF0ZW1lbnRzKSk7XG4gICAgfTtcblxuICAgIHJldHVybiB0cmFuc2Zvcm1lcjtcbiAgfTtcbn1cblxuZnVuY3Rpb24gdmlzaXRCbG9ja1N0YXRlbWVudHMoXG4gIHN0YXRlbWVudHM6IHRzLk5vZGVBcnJheTx0cy5TdGF0ZW1lbnQ+LFxuICBjb250ZXh0OiB0cy5UcmFuc2Zvcm1hdGlvbkNvbnRleHQsXG4pOiB0cy5Ob2RlQXJyYXk8dHMuU3RhdGVtZW50PiB7XG5cbiAgLy8gY29weSBvZiBzdGF0ZW1lbnRzIHRvIG1vZGlmeTsgbGF6eSBpbml0aWFsaXplZFxuICBsZXQgdXBkYXRlZFN0YXRlbWVudHM6IEFycmF5PHRzLlN0YXRlbWVudD4gfCB1bmRlZmluZWQ7XG5cbiAgY29uc3QgdmlzaXRvcjogdHMuVmlzaXRvciA9IChub2RlKSA9PiB7XG4gICAgaWYgKGlzQmxvY2tMaWtlKG5vZGUpKSB7XG4gICAgICBsZXQgcmVzdWx0ID0gdmlzaXRCbG9ja1N0YXRlbWVudHMobm9kZS5zdGF0ZW1lbnRzLCBjb250ZXh0KTtcbiAgICAgIGlmIChyZXN1bHQgPT09IG5vZGUuc3RhdGVtZW50cykge1xuICAgICAgICByZXR1cm4gbm9kZTtcbiAgICAgIH1cbiAgICAgIHJlc3VsdCA9IHRzLnNldFRleHRSYW5nZShyZXN1bHQsIG5vZGUuc3RhdGVtZW50cyk7XG4gICAgICBzd2l0Y2ggKG5vZGUua2luZCkge1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQmxvY2s6XG4gICAgICAgICAgcmV0dXJuIHRzLnVwZGF0ZUJsb2NrKG5vZGUsIHJlc3VsdCk7XG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5Nb2R1bGVCbG9jazpcbiAgICAgICAgICByZXR1cm4gdHMudXBkYXRlTW9kdWxlQmxvY2sobm9kZSwgcmVzdWx0KTtcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkNhc2VDbGF1c2U6XG4gICAgICAgICAgcmV0dXJuIHRzLnVwZGF0ZUNhc2VDbGF1c2Uobm9kZSwgbm9kZS5leHByZXNzaW9uLCByZXN1bHQpO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuRGVmYXVsdENsYXVzZTpcbiAgICAgICAgICByZXR1cm4gdHMudXBkYXRlRGVmYXVsdENsYXVzZShub2RlLCByZXN1bHQpO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHJldHVybiBub2RlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdHMudmlzaXRFYWNoQ2hpbGQobm9kZSwgdmlzaXRvciwgY29udGV4dCk7XG4gICAgfVxuICB9O1xuXG4gIC8vICdvSW5kZXgnIGlzIHRoZSBvcmlnaW5hbCBzdGF0ZW1lbnQgaW5kZXg7ICd1SW5kZXgnIGlzIHRoZSB1cGRhdGVkIHN0YXRlbWVudCBpbmRleFxuICBmb3IgKGxldCBvSW5kZXggPSAwLCB1SW5kZXggPSAwOyBvSW5kZXggPCBzdGF0ZW1lbnRzLmxlbmd0aDsgb0luZGV4KyssIHVJbmRleCsrKSB7XG4gICAgY29uc3QgY3VycmVudFN0YXRlbWVudCA9IHN0YXRlbWVudHNbb0luZGV4XTtcblxuICAgIC8vIHRoZXNlIGNhbid0IGNvbnRhaW4gYW4gZW51bSBkZWNsYXJhdGlvblxuICAgIGlmIChjdXJyZW50U3RhdGVtZW50LmtpbmQgPT09IHRzLlN5bnRheEtpbmQuSW1wb3J0RGVjbGFyYXRpb24pIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGVudW0gZGVjbGFyYXRpb25zIG11c3Q6XG4gICAgLy8gICAqIG5vdCBiZSBsYXN0IHN0YXRlbWVudFxuICAgIC8vICAgKiBiZSBhIHZhcmlhYmxlIHN0YXRlbWVudFxuICAgIC8vICAgKiBoYXZlIG9ubHkgb25lIGRlY2xhcmF0aW9uXG4gICAgLy8gICAqIGhhdmUgYW4gaWRlbnRpZmVyIGFzIGEgZGVjbGFyYXRpb24gbmFtZVxuICAgIGlmIChvSW5kZXggPCBzdGF0ZW1lbnRzLmxlbmd0aCAtIDFcbiAgICAgICAgJiYgdHMuaXNWYXJpYWJsZVN0YXRlbWVudChjdXJyZW50U3RhdGVtZW50KVxuICAgICAgICAmJiBjdXJyZW50U3RhdGVtZW50LmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnMubGVuZ3RoID09PSAxKSB7XG5cbiAgICAgIGNvbnN0IHZhcmlhYmxlRGVjbGFyYXRpb24gPSBjdXJyZW50U3RhdGVtZW50LmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnNbMF07XG4gICAgICBpZiAodHMuaXNJZGVudGlmaWVyKHZhcmlhYmxlRGVjbGFyYXRpb24ubmFtZSkpIHtcbiAgICAgICAgY29uc3QgbmFtZSA9IHZhcmlhYmxlRGVjbGFyYXRpb24ubmFtZS50ZXh0O1xuXG4gICAgICAgIGlmICghdmFyaWFibGVEZWNsYXJhdGlvbi5pbml0aWFsaXplcikge1xuICAgICAgICAgIGNvbnN0IGlpZmUgPSBmaW5kVHMyXzNFbnVtSWlmZShuYW1lLCBzdGF0ZW1lbnRzW29JbmRleCArIDFdKTtcbiAgICAgICAgICBpZiAoaWlmZSkge1xuICAgICAgICAgICAgLy8gZm91bmQgYW4gZW51bVxuICAgICAgICAgICAgaWYgKCF1cGRhdGVkU3RhdGVtZW50cykge1xuICAgICAgICAgICAgICB1cGRhdGVkU3RhdGVtZW50cyA9IHN0YXRlbWVudHMuc2xpY2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIHVwZGF0ZSBJSUZFIGFuZCByZXBsYWNlIHZhcmlhYmxlIHN0YXRlbWVudCBhbmQgb2xkIElJRkVcbiAgICAgICAgICAgIHVwZGF0ZWRTdGF0ZW1lbnRzLnNwbGljZSh1SW5kZXgsIDIsIHVwZGF0ZUVudW1JaWZlKFxuICAgICAgICAgICAgICBjdXJyZW50U3RhdGVtZW50LFxuICAgICAgICAgICAgICBpaWZlWzBdLFxuICAgICAgICAgICAgICBpaWZlWzFdLFxuICAgICAgICAgICAgKSk7XG4gICAgICAgICAgICAvLyBza2lwIElJRkUgc3RhdGVtZW50XG4gICAgICAgICAgICBvSW5kZXgrKztcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh0cy5pc09iamVjdExpdGVyYWxFeHByZXNzaW9uKHZhcmlhYmxlRGVjbGFyYXRpb24uaW5pdGlhbGl6ZXIpXG4gICAgICAgICAgICAgICAgICAgJiYgdmFyaWFibGVEZWNsYXJhdGlvbi5pbml0aWFsaXplci5wcm9wZXJ0aWVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIGNvbnN0IGVudW1TdGF0ZW1lbnRzID0gZmluZFRzMl8yRW51bVN0YXRlbWVudHMobmFtZSwgc3RhdGVtZW50cywgb0luZGV4ICsgMSk7XG4gICAgICAgICAgaWYgKGVudW1TdGF0ZW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIC8vIGZvdW5kIGFuIGVudW1cbiAgICAgICAgICAgIGlmICghdXBkYXRlZFN0YXRlbWVudHMpIHtcbiAgICAgICAgICAgICAgdXBkYXRlZFN0YXRlbWVudHMgPSBzdGF0ZW1lbnRzLnNsaWNlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBjcmVhdGUgd3JhcHBlciBhbmQgcmVwbGFjZSB2YXJpYWJsZSBzdGF0ZW1lbnQgYW5kIGVudW0gbWVtYmVyIHN0YXRlbWVudHNcbiAgICAgICAgICAgIHVwZGF0ZWRTdGF0ZW1lbnRzLnNwbGljZSh1SW5kZXgsIGVudW1TdGF0ZW1lbnRzLmxlbmd0aCArIDEsIGNyZWF0ZVdyYXBwZWRFbnVtKFxuICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICBjdXJyZW50U3RhdGVtZW50LFxuICAgICAgICAgICAgICBlbnVtU3RhdGVtZW50cyxcbiAgICAgICAgICAgICAgdmFyaWFibGVEZWNsYXJhdGlvbi5pbml0aWFsaXplcixcbiAgICAgICAgICAgICkpO1xuICAgICAgICAgICAgLy8gc2tpcCBlbnVtIG1lbWJlciBkZWNsYXJhdGlvbnNcbiAgICAgICAgICAgIG9JbmRleCArPSBlbnVtU3RhdGVtZW50cy5sZW5ndGg7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodHMuaXNPYmplY3RMaXRlcmFsRXhwcmVzc2lvbih2YXJpYWJsZURlY2xhcmF0aW9uLmluaXRpYWxpemVyKVxuICAgICAgICAgICYmIHZhcmlhYmxlRGVjbGFyYXRpb24uaW5pdGlhbGl6ZXIucHJvcGVydGllcy5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICBjb25zdCBsaXRlcmFsUHJvcGVydHlDb3VudCA9IHZhcmlhYmxlRGVjbGFyYXRpb24uaW5pdGlhbGl6ZXIucHJvcGVydGllcy5sZW5ndGg7XG5cbiAgICAgICAgICAvLyB0c2lja2xlIGVzMjAxNSBlbnVtcyBmaXJzdCBzdGF0ZW1lbnQgaXMgYW4gZXhwb3J0IGRlY2xhcmF0aW9uXG4gICAgICAgICAgY29uc3QgaXNQb3RlbnRpYWxFbnVtRXhwb3J0ID0gdHMuaXNFeHBvcnREZWNsYXJhdGlvbihzdGF0ZW1lbnRzW29JbmRleCArIDFdKTtcbiAgICAgICAgICBpZiAoaXNQb3RlbnRpYWxFbnVtRXhwb3J0KSB7XG4gICAgICAgICAgICAvLyBza2lwIHRoZSBleHBvcnRcbiAgICAgICAgICAgIG9JbmRleCArKztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCBlbnVtU3RhdGVtZW50cyA9IGZpbmRFbnVtTmFtZVN0YXRlbWVudHMobmFtZSwgc3RhdGVtZW50cywgb0luZGV4ICsgMSk7XG4gICAgICAgICAgaWYgKGVudW1TdGF0ZW1lbnRzLmxlbmd0aCA9PT0gbGl0ZXJhbFByb3BlcnR5Q291bnQpIHtcbiAgICAgICAgICAgIC8vIGZvdW5kIGFuIGVudW1cbiAgICAgICAgICAgIGlmICghdXBkYXRlZFN0YXRlbWVudHMpIHtcbiAgICAgICAgICAgICAgdXBkYXRlZFN0YXRlbWVudHMgPSBzdGF0ZW1lbnRzLnNsaWNlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBjcmVhdGUgd3JhcHBlciBhbmQgcmVwbGFjZSB2YXJpYWJsZSBzdGF0ZW1lbnQgYW5kIGVudW0gbWVtYmVyIHN0YXRlbWVudHNcbiAgICAgICAgICAgIGNvbnN0IGRlbGV0ZUNvdW50ID0gZW51bVN0YXRlbWVudHMubGVuZ3RoICsgKGlzUG90ZW50aWFsRW51bUV4cG9ydCA/IDIgOiAxKTtcbiAgICAgICAgICAgIHVwZGF0ZWRTdGF0ZW1lbnRzLnNwbGljZSh1SW5kZXgsIGRlbGV0ZUNvdW50LCBjcmVhdGVXcmFwcGVkRW51bShcbiAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgY3VycmVudFN0YXRlbWVudCxcbiAgICAgICAgICAgICAgZW51bVN0YXRlbWVudHMsXG4gICAgICAgICAgICAgIHZhcmlhYmxlRGVjbGFyYXRpb24uaW5pdGlhbGl6ZXIsXG4gICAgICAgICAgICAgIGlzUG90ZW50aWFsRW51bUV4cG9ydCxcbiAgICAgICAgICAgICkpO1xuICAgICAgICAgICAgLy8gc2tpcCBlbnVtIG1lbWJlciBkZWNsYXJhdGlvbnNcbiAgICAgICAgICAgIG9JbmRleCArPSBlbnVtU3RhdGVtZW50cy5sZW5ndGg7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCByZXN1bHQgPSB0cy52aXNpdE5vZGUoY3VycmVudFN0YXRlbWVudCwgdmlzaXRvcik7XG4gICAgaWYgKHJlc3VsdCAhPT0gY3VycmVudFN0YXRlbWVudCkge1xuICAgICAgaWYgKCF1cGRhdGVkU3RhdGVtZW50cykge1xuICAgICAgICB1cGRhdGVkU3RhdGVtZW50cyA9IHN0YXRlbWVudHMuc2xpY2UoKTtcbiAgICAgIH1cbiAgICAgIHVwZGF0ZWRTdGF0ZW1lbnRzW3VJbmRleF0gPSByZXN1bHQ7XG4gICAgfVxuICB9XG5cbiAgLy8gaWYgY2hhbmdlcywgcmV0dXJuIHVwZGF0ZWQgc3RhdGVtZW50c1xuICAvLyBvdGhlcndpc2UsIHJldHVybiBvcmlnaW5hbCBhcnJheSBpbnN0YW5jZVxuICByZXR1cm4gdXBkYXRlZFN0YXRlbWVudHMgPyB0cy5jcmVhdGVOb2RlQXJyYXkodXBkYXRlZFN0YXRlbWVudHMpIDogc3RhdGVtZW50cztcbn1cblxuLy8gVFMgMi4zIGVudW1zIGhhdmUgc3RhdGVtZW50cyB0aGF0IGFyZSBpbnNpZGUgYSBJSUZFLlxuZnVuY3Rpb24gZmluZFRzMl8zRW51bUlpZmUoXG4gIG5hbWU6IHN0cmluZyxcbiAgc3RhdGVtZW50OiB0cy5TdGF0ZW1lbnQsXG4pOiBbdHMuQ2FsbEV4cHJlc3Npb24sIHRzLkV4cHJlc3Npb24gfCB1bmRlZmluZWRdIHwgbnVsbCB7XG4gIGlmICghdHMuaXNFeHByZXNzaW9uU3RhdGVtZW50KHN0YXRlbWVudCkpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGxldCBleHByZXNzaW9uID0gc3RhdGVtZW50LmV4cHJlc3Npb247XG4gIHdoaWxlICh0cy5pc1BhcmVudGhlc2l6ZWRFeHByZXNzaW9uKGV4cHJlc3Npb24pKSB7XG4gICAgZXhwcmVzc2lvbiA9IGV4cHJlc3Npb24uZXhwcmVzc2lvbjtcbiAgfVxuXG4gIGlmICghZXhwcmVzc2lvbiB8fCAhdHMuaXNDYWxsRXhwcmVzc2lvbihleHByZXNzaW9uKSB8fCBleHByZXNzaW9uLmFyZ3VtZW50cy5sZW5ndGggIT09IDEpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGNvbnN0IGNhbGxFeHByZXNzaW9uID0gZXhwcmVzc2lvbjtcbiAgbGV0IGV4cG9ydEV4cHJlc3Npb247XG5cbiAgbGV0IGFyZ3VtZW50ID0gZXhwcmVzc2lvbi5hcmd1bWVudHNbMF07XG4gIGlmICghdHMuaXNCaW5hcnlFeHByZXNzaW9uKGFyZ3VtZW50KSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgaWYgKCF0cy5pc0lkZW50aWZpZXIoYXJndW1lbnQubGVmdCkgfHwgYXJndW1lbnQubGVmdC50ZXh0ICE9PSBuYW1lKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBsZXQgcG90ZW50aWFsRXhwb3J0ID0gZmFsc2U7XG4gIGlmIChhcmd1bWVudC5vcGVyYXRvclRva2VuLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuRmlyc3RBc3NpZ25tZW50KSB7XG4gICAgaWYgKCF0cy5pc0JpbmFyeUV4cHJlc3Npb24oYXJndW1lbnQucmlnaHQpXG4gICAgICAgIHx8IGFyZ3VtZW50LnJpZ2h0Lm9wZXJhdG9yVG9rZW4ua2luZCAhPT0gdHMuU3ludGF4S2luZC5CYXJCYXJUb2tlbikge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcG90ZW50aWFsRXhwb3J0ID0gdHJ1ZTtcbiAgICBhcmd1bWVudCA9IGFyZ3VtZW50LnJpZ2h0O1xuICB9XG5cbiAgaWYgKCF0cy5pc0JpbmFyeUV4cHJlc3Npb24oYXJndW1lbnQpKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBpZiAoYXJndW1lbnQub3BlcmF0b3JUb2tlbi5raW5kICE9PSB0cy5TeW50YXhLaW5kLkJhckJhclRva2VuKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBpZiAocG90ZW50aWFsRXhwb3J0ICYmICF0cy5pc0lkZW50aWZpZXIoYXJndW1lbnQubGVmdCkpIHtcbiAgICBleHBvcnRFeHByZXNzaW9uID0gYXJndW1lbnQubGVmdDtcbiAgfVxuXG4gIGV4cHJlc3Npb24gPSBleHByZXNzaW9uLmV4cHJlc3Npb247XG4gIHdoaWxlICh0cy5pc1BhcmVudGhlc2l6ZWRFeHByZXNzaW9uKGV4cHJlc3Npb24pKSB7XG4gICAgZXhwcmVzc2lvbiA9IGV4cHJlc3Npb24uZXhwcmVzc2lvbjtcbiAgfVxuXG4gIGlmICghZXhwcmVzc2lvbiB8fCAhdHMuaXNGdW5jdGlvbkV4cHJlc3Npb24oZXhwcmVzc2lvbikgfHwgZXhwcmVzc2lvbi5wYXJhbWV0ZXJzLmxlbmd0aCAhPT0gMSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgY29uc3QgcGFyYW1ldGVyID0gZXhwcmVzc2lvbi5wYXJhbWV0ZXJzWzBdO1xuICBpZiAoIXRzLmlzSWRlbnRpZmllcihwYXJhbWV0ZXIubmFtZSkpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8vIFRoZSBuYW1lIG9mIHRoZSBwYXJhbWV0ZXIgY2FuIGJlIGRpZmZlcmVudCB0aGFuIHRoZSBuYW1lIG9mIHRoZSBlbnVtIGlmIGl0IHdhcyByZW5hbWVkXG4gIC8vIGR1ZSB0byBzY29wZSBob2lzdGluZy5cbiAgY29uc3QgcGFyYW1ldGVyTmFtZSA9IHBhcmFtZXRlci5uYW1lLnRleHQ7XG5cbiAgLy8gSW4gVFMgMi4zIGVudW1zLCB0aGUgSUlGRSBjb250YWlucyBvbmx5IGV4cHJlc3Npb25zIHdpdGggYSBjZXJ0YWluIGZvcm1hdC5cbiAgLy8gSWYgd2UgZmluZCBhbnkgdGhhdCBpcyBkaWZmZXJlbnQsIHdlIGlnbm9yZSB0aGUgd2hvbGUgdGhpbmcuXG4gIGZvciAobGV0IGJvZHlJbmRleCA9IDA7IGJvZHlJbmRleCA8IGV4cHJlc3Npb24uYm9keS5zdGF0ZW1lbnRzLmxlbmd0aDsgKytib2R5SW5kZXgpIHtcbiAgICBjb25zdCBib2R5U3RhdGVtZW50ID0gZXhwcmVzc2lvbi5ib2R5LnN0YXRlbWVudHNbYm9keUluZGV4XTtcblxuICAgIGlmICghdHMuaXNFeHByZXNzaW9uU3RhdGVtZW50KGJvZHlTdGF0ZW1lbnQpIHx8ICFib2R5U3RhdGVtZW50LmV4cHJlc3Npb24pIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGlmICghdHMuaXNCaW5hcnlFeHByZXNzaW9uKGJvZHlTdGF0ZW1lbnQuZXhwcmVzc2lvbilcbiAgICAgICAgfHwgYm9keVN0YXRlbWVudC5leHByZXNzaW9uLm9wZXJhdG9yVG9rZW4ua2luZCAhPT0gdHMuU3ludGF4S2luZC5GaXJzdEFzc2lnbm1lbnQpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IGFzc2lnbm1lbnQgPSBib2R5U3RhdGVtZW50LmV4cHJlc3Npb24ubGVmdDtcbiAgICBjb25zdCB2YWx1ZSA9IGJvZHlTdGF0ZW1lbnQuZXhwcmVzc2lvbi5yaWdodDtcbiAgICBpZiAoIXRzLmlzRWxlbWVudEFjY2Vzc0V4cHJlc3Npb24oYXNzaWdubWVudCkgfHwgIXRzLmlzU3RyaW5nTGl0ZXJhbCh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGlmICghdHMuaXNJZGVudGlmaWVyKGFzc2lnbm1lbnQuZXhwcmVzc2lvbikgfHwgYXNzaWdubWVudC5leHByZXNzaW9uLnRleHQgIT09IHBhcmFtZXRlck5hbWUpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IG1lbWJlckFyZ3VtZW50ID0gYXNzaWdubWVudC5hcmd1bWVudEV4cHJlc3Npb247XG4gICAgaWYgKCFtZW1iZXJBcmd1bWVudCB8fCAhdHMuaXNCaW5hcnlFeHByZXNzaW9uKG1lbWJlckFyZ3VtZW50KVxuICAgICAgICB8fCBtZW1iZXJBcmd1bWVudC5vcGVyYXRvclRva2VuLmtpbmQgIT09IHRzLlN5bnRheEtpbmQuRmlyc3RBc3NpZ25tZW50KSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cblxuICAgIGlmICghdHMuaXNFbGVtZW50QWNjZXNzRXhwcmVzc2lvbihtZW1iZXJBcmd1bWVudC5sZWZ0KSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgaWYgKCF0cy5pc0lkZW50aWZpZXIobWVtYmVyQXJndW1lbnQubGVmdC5leHByZXNzaW9uKVxuICAgICAgfHwgbWVtYmVyQXJndW1lbnQubGVmdC5leHByZXNzaW9uLnRleHQgIT09IHBhcmFtZXRlck5hbWUpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGlmICghbWVtYmVyQXJndW1lbnQubGVmdC5hcmd1bWVudEV4cHJlc3Npb25cbiAgICAgICAgfHwgIXRzLmlzU3RyaW5nTGl0ZXJhbChtZW1iZXJBcmd1bWVudC5sZWZ0LmFyZ3VtZW50RXhwcmVzc2lvbikpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGlmIChtZW1iZXJBcmd1bWVudC5sZWZ0LmFyZ3VtZW50RXhwcmVzc2lvbi50ZXh0ICE9PSB2YWx1ZS50ZXh0KSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gW2NhbGxFeHByZXNzaW9uLCBleHBvcnRFeHByZXNzaW9uXTtcbn1cblxuLy8gVFMgMi4yIGVudW1zIGhhdmUgc3RhdGVtZW50cyBhZnRlciB0aGUgdmFyaWFibGUgZGVjbGFyYXRpb24sIHdpdGggaW5kZXggc3RhdGVtZW50cyBmb2xsb3dlZFxuLy8gYnkgdmFsdWUgc3RhdGVtZW50cy5cbmZ1bmN0aW9uIGZpbmRUczJfMkVudW1TdGF0ZW1lbnRzKFxuICBuYW1lOiBzdHJpbmcsXG4gIHN0YXRlbWVudHM6IHRzLk5vZGVBcnJheTx0cy5TdGF0ZW1lbnQ+LFxuICBzdGF0ZW1lbnRPZmZzZXQ6IG51bWJlcixcbik6IHRzLlN0YXRlbWVudFtdIHtcbiAgY29uc3QgZW51bVZhbHVlU3RhdGVtZW50czogdHMuU3RhdGVtZW50W10gPSBbXTtcbiAgY29uc3QgbWVtYmVyTmFtZXM6IHN0cmluZ1tdID0gW107XG5cbiAgbGV0IGluZGV4ID0gc3RhdGVtZW50T2Zmc2V0O1xuICBmb3IgKDsgaW5kZXggPCBzdGF0ZW1lbnRzLmxlbmd0aDsgKytpbmRleCkge1xuICAgIC8vIEVuc3VyZSBhbGwgc3RhdGVtZW50cyBhcmUgb2YgdGhlIGV4cGVjdGVkIGZvcm1hdCBhbmQgdXNpbmcgdGhlIHJpZ2h0IGlkZW50aWZlci5cbiAgICAvLyBXaGVuIHdlIGZpbmQgYSBzdGF0ZW1lbnQgdGhhdCBpc24ndCBwYXJ0IG9mIHRoZSBlbnVtLCByZXR1cm4gd2hhdCB3ZSBjb2xsZWN0ZWQgc28gZmFyLlxuICAgIGNvbnN0IGN1cnJlbnQgPSBzdGF0ZW1lbnRzW2luZGV4XTtcbiAgICBpZiAoIXRzLmlzRXhwcmVzc2lvblN0YXRlbWVudChjdXJyZW50KSB8fCAhdHMuaXNCaW5hcnlFeHByZXNzaW9uKGN1cnJlbnQuZXhwcmVzc2lvbikpIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGNvbnN0IHByb3BlcnR5ID0gY3VycmVudC5leHByZXNzaW9uLmxlZnQ7XG4gICAgaWYgKCFwcm9wZXJ0eSB8fCAhdHMuaXNQcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb24ocHJvcGVydHkpKSB7XG4gICAgICBicmVhaztcbiAgICB9XG5cbiAgICBpZiAoIXRzLmlzSWRlbnRpZmllcihwcm9wZXJ0eS5leHByZXNzaW9uKSB8fCBwcm9wZXJ0eS5leHByZXNzaW9uLnRleHQgIT09IG5hbWUpIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIG1lbWJlck5hbWVzLnB1c2gocHJvcGVydHkubmFtZS50ZXh0KTtcbiAgICBlbnVtVmFsdWVTdGF0ZW1lbnRzLnB1c2goY3VycmVudCk7XG4gIH1cblxuICBpZiAoZW51bVZhbHVlU3RhdGVtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICBjb25zdCBlbnVtTmFtZVN0YXRlbWVudHMgPSBmaW5kRW51bU5hbWVTdGF0ZW1lbnRzKG5hbWUsIHN0YXRlbWVudHMsIGluZGV4LCBtZW1iZXJOYW1lcyk7XG4gIGlmIChlbnVtTmFtZVN0YXRlbWVudHMubGVuZ3RoICE9PSBlbnVtVmFsdWVTdGF0ZW1lbnRzLmxlbmd0aCkge1xuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIHJldHVybiBlbnVtVmFsdWVTdGF0ZW1lbnRzLmNvbmNhdChlbnVtTmFtZVN0YXRlbWVudHMpO1xufVxuXG4vLyBUc2lja2xlIGVudW1zIGhhdmUgYSB2YXJpYWJsZSBzdGF0ZW1lbnQgd2l0aCBpbmRleGVzLCBmb2xsb3dlZCBieSB2YWx1ZSBzdGF0ZW1lbnRzLlxuLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2RldmtpdC9pc3N1ZXMvMjI5I2lzc3VlY29tbWVudC0zMzg1MTIwNTYgZm9yZSBtb3JlIGluZm9ybWF0aW9uLlxuZnVuY3Rpb24gZmluZEVudW1OYW1lU3RhdGVtZW50cyhcbiAgbmFtZTogc3RyaW5nLFxuICBzdGF0ZW1lbnRzOiB0cy5Ob2RlQXJyYXk8dHMuU3RhdGVtZW50PixcbiAgc3RhdGVtZW50T2Zmc2V0OiBudW1iZXIsXG4gIG1lbWJlck5hbWVzPzogc3RyaW5nW10sXG4pOiB0cy5TdGF0ZW1lbnRbXSB7XG4gIGNvbnN0IGVudW1TdGF0ZW1lbnRzOiB0cy5TdGF0ZW1lbnRbXSA9IFtdO1xuXG4gIGZvciAobGV0IGluZGV4ID0gc3RhdGVtZW50T2Zmc2V0OyBpbmRleCA8IHN0YXRlbWVudHMubGVuZ3RoOyArK2luZGV4KSB7XG4gICAgLy8gRW5zdXJlIGFsbCBzdGF0ZW1lbnRzIGFyZSBvZiB0aGUgZXhwZWN0ZWQgZm9ybWF0IGFuZCB1c2luZyB0aGUgcmlnaHQgaWRlbnRpZmVyLlxuICAgIC8vIFdoZW4gd2UgZmluZCBhIHN0YXRlbWVudCB0aGF0IGlzbid0IHBhcnQgb2YgdGhlIGVudW0sIHJldHVybiB3aGF0IHdlIGNvbGxlY3RlZCBzbyBmYXIuXG4gICAgY29uc3QgY3VycmVudCA9IHN0YXRlbWVudHNbaW5kZXhdO1xuICAgIGlmICghdHMuaXNFeHByZXNzaW9uU3RhdGVtZW50KGN1cnJlbnQpIHx8ICF0cy5pc0JpbmFyeUV4cHJlc3Npb24oY3VycmVudC5leHByZXNzaW9uKSkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgY29uc3QgYWNjZXNzID0gY3VycmVudC5leHByZXNzaW9uLmxlZnQ7XG4gICAgY29uc3QgdmFsdWUgPSBjdXJyZW50LmV4cHJlc3Npb24ucmlnaHQ7XG4gICAgaWYgKCFhY2Nlc3MgfHwgIXRzLmlzRWxlbWVudEFjY2Vzc0V4cHJlc3Npb24oYWNjZXNzKSB8fCAhdmFsdWUgfHwgIXRzLmlzU3RyaW5nTGl0ZXJhbCh2YWx1ZSkpIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGlmIChtZW1iZXJOYW1lcyAmJiAhbWVtYmVyTmFtZXMuaW5jbHVkZXModmFsdWUudGV4dCkpIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGlmICghdHMuaXNJZGVudGlmaWVyKGFjY2Vzcy5leHByZXNzaW9uKSB8fCBhY2Nlc3MuZXhwcmVzc2lvbi50ZXh0ICE9PSBuYW1lKSB7XG4gICAgICBicmVhaztcbiAgICB9XG5cbiAgICBpZiAoIWFjY2Vzcy5hcmd1bWVudEV4cHJlc3Npb24gfHwgIXRzLmlzUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uKGFjY2Vzcy5hcmd1bWVudEV4cHJlc3Npb24pKSB7XG4gICAgICBicmVhaztcbiAgICB9XG5cbiAgICBjb25zdCBlbnVtRXhwcmVzc2lvbiA9IGFjY2Vzcy5hcmd1bWVudEV4cHJlc3Npb24uZXhwcmVzc2lvbjtcbiAgICBpZiAoIXRzLmlzSWRlbnRpZmllcihlbnVtRXhwcmVzc2lvbikgfHwgZW51bUV4cHJlc3Npb24udGV4dCAhPT0gbmFtZSkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgaWYgKHZhbHVlLnRleHQgIT09IGFjY2Vzcy5hcmd1bWVudEV4cHJlc3Npb24ubmFtZS50ZXh0KSB7XG4gICAgICBicmVhaztcbiAgICB9XG5cbiAgICBlbnVtU3RhdGVtZW50cy5wdXNoKGN1cnJlbnQpO1xuICB9XG5cbiAgcmV0dXJuIGVudW1TdGF0ZW1lbnRzO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVIb3N0Tm9kZShcbiAgaG9zdE5vZGU6IHRzLlZhcmlhYmxlU3RhdGVtZW50LFxuICBleHByZXNzaW9uOiB0cy5FeHByZXNzaW9uLFxuKTogdHMuU3RhdGVtZW50IHtcblxuICAvLyBVcGRhdGUgZXhpc3RpbmcgaG9zdCBub2RlIHdpdGggdGhlIHB1cmUgY29tbWVudCBiZWZvcmUgdGhlIHZhcmlhYmxlIGRlY2xhcmF0aW9uIGluaXRpYWxpemVyLlxuICBjb25zdCB2YXJpYWJsZURlY2xhcmF0aW9uID0gaG9zdE5vZGUuZGVjbGFyYXRpb25MaXN0LmRlY2xhcmF0aW9uc1swXTtcbiAgY29uc3Qgb3V0ZXJWYXJTdG10ID0gdHMudXBkYXRlVmFyaWFibGVTdGF0ZW1lbnQoXG4gICAgaG9zdE5vZGUsXG4gICAgaG9zdE5vZGUubW9kaWZpZXJzLFxuICAgIHRzLnVwZGF0ZVZhcmlhYmxlRGVjbGFyYXRpb25MaXN0KFxuICAgICAgaG9zdE5vZGUuZGVjbGFyYXRpb25MaXN0LFxuICAgICAgW1xuICAgICAgICB0cy51cGRhdGVWYXJpYWJsZURlY2xhcmF0aW9uKFxuICAgICAgICAgIHZhcmlhYmxlRGVjbGFyYXRpb24sXG4gICAgICAgICAgdmFyaWFibGVEZWNsYXJhdGlvbi5uYW1lLFxuICAgICAgICAgIHZhcmlhYmxlRGVjbGFyYXRpb24udHlwZSxcbiAgICAgICAgICBleHByZXNzaW9uLFxuICAgICAgICApLFxuICAgICAgXSxcbiAgICApLFxuICApO1xuXG4gIHJldHVybiBvdXRlclZhclN0bXQ7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUVudW1JaWZlKFxuICBob3N0Tm9kZTogdHMuVmFyaWFibGVTdGF0ZW1lbnQsXG4gIGlpZmU6IHRzLkNhbGxFeHByZXNzaW9uLFxuICBleHBvcnRBc3NpZ25tZW50PzogdHMuRXhwcmVzc2lvbixcbik6IHRzLlN0YXRlbWVudCB7XG4gIGlmICghdHMuaXNQYXJlbnRoZXNpemVkRXhwcmVzc2lvbihpaWZlLmV4cHJlc3Npb24pXG4gICAgICB8fCAhdHMuaXNGdW5jdGlvbkV4cHJlc3Npb24oaWlmZS5leHByZXNzaW9uLmV4cHJlc3Npb24pKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIElJRkUgU3RydWN0dXJlJyk7XG4gIH1cblxuICAvLyBJZ25vcmUgZXhwb3J0IGFzc2lnbm1lbnQgaWYgdmFyaWFibGUgaXMgZGlyZWN0bHkgZXhwb3J0ZWRcbiAgaWYgKGhvc3ROb2RlLm1vZGlmaWVyc1xuICAgICAgJiYgaG9zdE5vZGUubW9kaWZpZXJzLmZpbmRJbmRleChtID0+IG0ua2luZCA9PSB0cy5TeW50YXhLaW5kLkV4cG9ydEtleXdvcmQpICE9IC0xKSB7XG4gICAgZXhwb3J0QXNzaWdubWVudCA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIGNvbnN0IGV4cHJlc3Npb24gPSBpaWZlLmV4cHJlc3Npb24uZXhwcmVzc2lvbjtcbiAgY29uc3QgdXBkYXRlZEZ1bmN0aW9uID0gdHMudXBkYXRlRnVuY3Rpb25FeHByZXNzaW9uKFxuICAgIGV4cHJlc3Npb24sXG4gICAgZXhwcmVzc2lvbi5tb2RpZmllcnMsXG4gICAgZXhwcmVzc2lvbi5hc3Rlcmlza1Rva2VuLFxuICAgIGV4cHJlc3Npb24ubmFtZSxcbiAgICBleHByZXNzaW9uLnR5cGVQYXJhbWV0ZXJzLFxuICAgIGV4cHJlc3Npb24ucGFyYW1ldGVycyxcbiAgICBleHByZXNzaW9uLnR5cGUsXG4gICAgdHMudXBkYXRlQmxvY2soXG4gICAgICBleHByZXNzaW9uLmJvZHksXG4gICAgICBbXG4gICAgICAgIC4uLmV4cHJlc3Npb24uYm9keS5zdGF0ZW1lbnRzLFxuICAgICAgICB0cy5jcmVhdGVSZXR1cm4oZXhwcmVzc2lvbi5wYXJhbWV0ZXJzWzBdLm5hbWUgYXMgdHMuSWRlbnRpZmllciksXG4gICAgICBdLFxuICAgICksXG4gICk7XG5cbiAgbGV0IGFyZzogdHMuRXhwcmVzc2lvbiA9IHRzLmNyZWF0ZU9iamVjdExpdGVyYWwoKTtcbiAgaWYgKGV4cG9ydEFzc2lnbm1lbnQpIHtcbiAgICBhcmcgPSB0cy5jcmVhdGVCaW5hcnkoZXhwb3J0QXNzaWdubWVudCwgdHMuU3ludGF4S2luZC5CYXJCYXJUb2tlbiwgYXJnKTtcbiAgfVxuICBjb25zdCB1cGRhdGVkSWlmZSA9IHRzLnVwZGF0ZUNhbGwoXG4gICAgaWlmZSxcbiAgICB0cy51cGRhdGVQYXJlbihcbiAgICAgIGlpZmUuZXhwcmVzc2lvbixcbiAgICAgIHVwZGF0ZWRGdW5jdGlvbixcbiAgICApLFxuICAgIGlpZmUudHlwZUFyZ3VtZW50cyxcbiAgICBbYXJnXSxcbiAgKTtcblxuICBsZXQgdmFsdWU6IHRzLkV4cHJlc3Npb24gPSBhZGRQdXJlQ29tbWVudCh1cGRhdGVkSWlmZSk7XG4gIGlmIChleHBvcnRBc3NpZ25tZW50KSB7XG4gICAgdmFsdWUgPSB0cy5jcmVhdGVCaW5hcnkoXG4gICAgICBleHBvcnRBc3NpZ25tZW50LFxuICAgICAgdHMuU3ludGF4S2luZC5GaXJzdEFzc2lnbm1lbnQsXG4gICAgICB1cGRhdGVkSWlmZSk7XG4gIH1cblxuICByZXR1cm4gdXBkYXRlSG9zdE5vZGUoaG9zdE5vZGUsIHZhbHVlKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlV3JhcHBlZEVudW0oXG4gIG5hbWU6IHN0cmluZyxcbiAgaG9zdE5vZGU6IHRzLlZhcmlhYmxlU3RhdGVtZW50LFxuICBzdGF0ZW1lbnRzOiBBcnJheTx0cy5TdGF0ZW1lbnQ+LFxuICBsaXRlcmFsSW5pdGlhbGl6ZXI6IHRzLk9iamVjdExpdGVyYWxFeHByZXNzaW9uIHwgdW5kZWZpbmVkLFxuICBhZGRFeHBvcnRNb2RpZmllciA9IGZhbHNlLFxuKTogdHMuU3RhdGVtZW50IHtcbiAgbGl0ZXJhbEluaXRpYWxpemVyID0gbGl0ZXJhbEluaXRpYWxpemVyIHx8IHRzLmNyZWF0ZU9iamVjdExpdGVyYWwoKTtcblxuICBjb25zdCBub2RlID0gYWRkRXhwb3J0TW9kaWZpZXJcbiAgICA/IHRzLnVwZGF0ZVZhcmlhYmxlU3RhdGVtZW50KFxuICAgICAgaG9zdE5vZGUsXG4gICAgICBbdHMuY3JlYXRlVG9rZW4odHMuU3ludGF4S2luZC5FeHBvcnRLZXl3b3JkKV0sXG4gICAgICBob3N0Tm9kZS5kZWNsYXJhdGlvbkxpc3QsXG4gICAgKVxuICAgIDogaG9zdE5vZGU7XG5cbiAgY29uc3QgaW5uZXJWYXJTdG10ID0gdHMuY3JlYXRlVmFyaWFibGVTdGF0ZW1lbnQoXG4gICAgdW5kZWZpbmVkLFxuICAgIHRzLmNyZWF0ZVZhcmlhYmxlRGVjbGFyYXRpb25MaXN0KFtcbiAgICAgIHRzLmNyZWF0ZVZhcmlhYmxlRGVjbGFyYXRpb24obmFtZSwgdW5kZWZpbmVkLCBsaXRlcmFsSW5pdGlhbGl6ZXIpLFxuICAgIF0pLFxuICApO1xuXG4gIGNvbnN0IGlubmVyUmV0dXJuID0gdHMuY3JlYXRlUmV0dXJuKHRzLmNyZWF0ZUlkZW50aWZpZXIobmFtZSkpO1xuXG4gIGNvbnN0IGlpZmUgPSB0cy5jcmVhdGVJbW1lZGlhdGVseUludm9rZWRGdW5jdGlvbkV4cHJlc3Npb24oW1xuICAgIGlubmVyVmFyU3RtdCxcbiAgICAuLi5zdGF0ZW1lbnRzLFxuICAgIGlubmVyUmV0dXJuLFxuICBdKTtcblxuICByZXR1cm4gdXBkYXRlSG9zdE5vZGUobm9kZSwgYWRkUHVyZUNvbW1lbnQodHMuY3JlYXRlUGFyZW4oaWlmZSkpKTtcbn1cbiJdfQ==