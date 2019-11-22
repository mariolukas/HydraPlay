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
function getFoldFileTransformer(program) {
    const checker = program.getTypeChecker();
    return (context) => {
        const transformer = (sf) => {
            const statementsToRemove = [];
            const classesWithoutStatements = findClassDeclarations(sf);
            let classes = findClassesWithStaticPropertyAssignments(sf, checker, classesWithoutStatements);
            const visitor = (node) => {
                if (classes.length === 0 && statementsToRemove.length === 0) {
                    // There are no more statements to fold.
                    return ts.visitEachChild(node, visitor, context);
                }
                // Check if node is a statement to be dropped.
                const stmtIdx = statementsToRemove.indexOf(node);
                if (stmtIdx != -1) {
                    statementsToRemove.splice(stmtIdx, 1);
                    return undefined;
                }
                // Check if node is a ES5 class to add statements to.
                let clazz = classes.find((cl) => cl.function === node);
                if (clazz) {
                    const functionExpression = node;
                    // Create a new body with all the original statements, plus new ones,
                    // plus return statement.
                    const newBody = ts.createBlock([
                        ...functionExpression.body.statements.slice(0, -1),
                        ...clazz.statements.map(st => st.expressionStatement),
                        ...functionExpression.body.statements.slice(-1),
                    ]);
                    const newNode = ts.createFunctionExpression(functionExpression.modifiers, functionExpression.asteriskToken, functionExpression.name, functionExpression.typeParameters, functionExpression.parameters, functionExpression.type, newBody);
                    // Update remaining classes and statements.
                    statementsToRemove.push(...clazz.statements.map(st => st.expressionStatement));
                    classes = classes.filter(cl => cl != clazz);
                    // Replace node with modified one.
                    return newNode;
                }
                // Check if node is a ES2015 class to replace with a pure IIFE.
                clazz = classes.find((cl) => !cl.function && cl.declaration === node);
                if (clazz) {
                    const classStatement = clazz.declaration;
                    const innerReturn = ts.createReturn(ts.createIdentifier(clazz.name));
                    const pureIife = ast_utils_1.addPureComment(ts.createImmediatelyInvokedFunctionExpression([
                        classStatement,
                        ...clazz.statements.map(st => st.expressionStatement),
                        innerReturn,
                    ]));
                    // Move the original class modifiers to the var statement.
                    const newNode = ts.createVariableStatement(clazz.declaration.modifiers, ts.createVariableDeclarationList([
                        ts.createVariableDeclaration(clazz.name, undefined, pureIife),
                    ], ts.NodeFlags.Const));
                    clazz.declaration.modifiers = undefined;
                    // Update remaining classes and statements.
                    statementsToRemove.push(...clazz.statements.map(st => st.expressionStatement));
                    classes = classes.filter(cl => cl != clazz);
                    return newNode;
                }
                // Otherwise return node as is.
                return ts.visitEachChild(node, visitor, context);
            };
            return ts.visitNode(sf, visitor);
        };
        return transformer;
    };
}
exports.getFoldFileTransformer = getFoldFileTransformer;
function findClassDeclarations(node) {
    const classes = [];
    // Find all class declarations, build a ClassData for each.
    ts.forEachChild(node, (child) => {
        // Check if it is a named class declaration first.
        // Technically it doesn't need a name in TS if it's the default export, but when downleveled
        // it will be have a name (e.g. `default_1`).
        if (ts.isClassDeclaration(child) && child.name) {
            classes.push({
                name: child.name.text,
                declaration: child,
                statements: [],
            });
            return;
        }
        if (child.kind !== ts.SyntaxKind.VariableStatement) {
            return;
        }
        const varStmt = child;
        if (varStmt.declarationList.declarations.length > 1) {
            return;
        }
        const varDecl = varStmt.declarationList.declarations[0];
        if (varDecl.name.kind !== ts.SyntaxKind.Identifier) {
            return;
        }
        const name = varDecl.name.text;
        const expr = varDecl.initializer;
        if (!expr || expr.kind !== ts.SyntaxKind.ParenthesizedExpression) {
            return;
        }
        if (expr.expression.kind !== ts.SyntaxKind.CallExpression) {
            return;
        }
        const callExpr = expr.expression;
        if (callExpr.expression.kind !== ts.SyntaxKind.FunctionExpression) {
            return;
        }
        const fn = callExpr.expression;
        if (fn.body.statements.length < 2) {
            return;
        }
        if (fn.body.statements[0].kind !== ts.SyntaxKind.FunctionDeclaration) {
            return;
        }
        const innerFn = fn.body.statements[0];
        if (fn.body.statements[fn.body.statements.length - 1].kind !== ts.SyntaxKind.ReturnStatement) {
            return;
        }
        if (!innerFn.name || innerFn.name.kind !== ts.SyntaxKind.Identifier) {
            return;
        }
        if (innerFn.name.text !== name) {
            return;
        }
        classes.push({
            name,
            declaration: varDecl,
            function: fn,
            statements: [],
        });
    });
    return classes;
}
function findClassesWithStaticPropertyAssignments(node, checker, classes) {
    // Find each assignment outside of the declaration.
    ts.forEachChild(node, (child) => {
        if (child.kind !== ts.SyntaxKind.ExpressionStatement) {
            return;
        }
        const expressionStatement = child;
        if (expressionStatement.expression.kind !== ts.SyntaxKind.BinaryExpression) {
            return;
        }
        const binEx = expressionStatement.expression;
        if (binEx.left.kind !== ts.SyntaxKind.PropertyAccessExpression) {
            return;
        }
        const propAccess = binEx.left;
        if (propAccess.expression.kind !== ts.SyntaxKind.Identifier) {
            return;
        }
        const symbol = checker.getSymbolAtLocation(propAccess.expression);
        if (!symbol) {
            return;
        }
        const decls = symbol.declarations;
        if (decls == undefined || decls.length === 0) {
            return;
        }
        const hostClass = classes.find((clazz => decls.includes(clazz.declaration)));
        if (!hostClass) {
            return;
        }
        const statement = { expressionStatement, hostClass };
        hostClass.statements.push(statement);
    });
    // Only return classes that have static property assignments.
    return classes.filter(cl => cl.statements.length != 0);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xhc3MtZm9sZC5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsicGFja2FnZXMvYW5ndWxhcl9kZXZraXQvYnVpbGRfb3B0aW1pemVyL3NyYy90cmFuc2Zvcm1zL2NsYXNzLWZvbGQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7O0dBTUc7QUFDSCxpQ0FBaUM7QUFDakMsb0RBQXNEO0FBY3RELFNBQWdCLHNCQUFzQixDQUFDLE9BQW1CO0lBQ3hELE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxjQUFjLEVBQUUsQ0FBQztJQUV6QyxPQUFPLENBQUMsT0FBaUMsRUFBaUMsRUFBRTtRQUUxRSxNQUFNLFdBQVcsR0FBa0MsQ0FBQyxFQUFpQixFQUFFLEVBQUU7WUFFdkUsTUFBTSxrQkFBa0IsR0FBNkIsRUFBRSxDQUFDO1lBQ3hELE1BQU0sd0JBQXdCLEdBQUcscUJBQXFCLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDM0QsSUFBSSxPQUFPLEdBQUcsd0NBQXdDLENBQUMsRUFBRSxFQUFFLE9BQU8sRUFBRSx3QkFBd0IsQ0FBQyxDQUFDO1lBRTlGLE1BQU0sT0FBTyxHQUFlLENBQUMsSUFBYSxFQUEyQixFQUFFO2dCQUNyRSxJQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLGtCQUFrQixDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7b0JBQzNELHdDQUF3QztvQkFDeEMsT0FBTyxFQUFFLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7aUJBQ2xEO2dCQUVELDhDQUE4QztnQkFDOUMsTUFBTSxPQUFPLEdBQUcsa0JBQWtCLENBQUMsT0FBTyxDQUFDLElBQThCLENBQUMsQ0FBQztnQkFDM0UsSUFBSSxPQUFPLElBQUksQ0FBQyxDQUFDLEVBQUU7b0JBQ2pCLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBRXRDLE9BQU8sU0FBUyxDQUFDO2lC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QUMsd0JBQXdCLEVBQUU7WUFDOUQsT0FBTztTQUNSO1FBQ0QsTUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLElBQW1DLENBQUM7UUFDN0QsSUFBSSxVQUFVLENBQUMsVUFBVSxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBRTtZQUMzRCxPQUFPO1NBQ1I7UUFFRCxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ2xFLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDWCxPQUFPO1NBQ1I7UUFFRCxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDO1FBQ2xDLElBQUksS0FBSyxJQUFJLFNBQVMsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUM1QyxPQUFPO1NBQ1I7UUFFRCxNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDN0UsSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNkLE9BQU87U0FDUjtRQUNELE1BQU0sU0FBUyxHQUFrQixFQUFFLG1CQUFtQixFQUFFLFNBQVMsRUFBRSxDQUFDO1FBRXBFLFNBQVMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3ZDLENBQUMsQ0FBQyxDQUFDO0lBRUgsNkRBQTZEO0lBQzdELE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ3pELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcbmltcG9ydCB7IGFkZFB1cmVDb21tZW50IH0gZnJvbSAnLi4vaGVscGVycy9hc3QtdXRpbHMnO1xuXG5pbnRlcmZhY2UgQ2xhc3NEYXRhIHtcbiAgbmFtZTogc3RyaW5nO1xuICBkZWNsYXJhdGlvbjogdHMuVmFyaWFibGVEZWNsYXJhdGlvbiB8IHRzLkNsYXNzRGVjbGFyYXRpb247XG4gIGZ1bmN0aW9uPzogdHMuRnVuY3Rpb25FeHByZXNzaW9uO1xuICBzdGF0ZW1lbnRzOiBTdGF0ZW1lbnREYXRhW107XG59XG5cbmludGVyZmFjZSBTdGF0ZW1lbnREYXRhIHtcbiAgZXhwcmVzc2lvblN0YXRlbWVudDogdHMuRXhwcmVzc2lvblN0YXRlbWVudDtcbiAgaG9zdENsYXNzOiBDbGFzc0RhdGE7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRGb2xkRmlsZVRyYW5zZm9ybWVyKHByb2dyYW06IHRzLlByb2dyYW0pOiB0cy5UcmFuc2Zvcm1lckZhY3Rvcnk8dHMuU291cmNlRmlsZT4ge1xuICBjb25zdCBjaGVja2VyID0gcHJvZ3JhbS5nZXRUeXBlQ2hlY2tlcigpO1xuXG4gIHJldHVybiAoY29udGV4dDogdHMuVHJhbnNmb3JtYXRpb25Db250ZXh0KTogdHMuVHJhbnNmb3JtZXI8dHMuU291cmNlRmlsZT4gPT4ge1xuXG4gICAgY29uc3QgdHJhbnNmb3JtZXI6IHRzLlRyYW5zZm9ybWVyPHRzLlNvdXJjZUZpbGU+ID0gKHNmOiB0cy5Tb3VyY2VGaWxlKSA9PiB7XG5cbiAgICAgIGNvbnN0IHN0YXRlbWVudHNUb1JlbW92ZTogdHMuRXhwcmVzc2lvblN0YXRlbWVudFtdID0gW107XG4gICAgICBjb25zdCBjbGFzc2VzV2l0aG91dFN0YXRlbWVudHMgPSBmaW5kQ2xhc3NEZWNsYXJhdGlvbnMoc2YpO1xuICAgICAgbGV0IGNsYXNzZXMgPSBmaW5kQ2xhc3Nlc1dpdGhTdGF0aWNQcm9wZXJ0eUFzc2lnbm1lbnRzKHNmLCBjaGVja2VyLCBjbGFzc2VzV2l0aG91dFN0YXRlbWVudHMpO1xuXG4gICAgICBjb25zdCB2aXNpdG9yOiB0cy5WaXNpdG9yID0gKG5vZGU6IHRzLk5vZGUpOiB0cy5WaXNpdFJlc3VsdDx0cy5Ob2RlPiA9PiB7XG4gICAgICAgIGlmIChjbGFzc2VzLmxlbmd0aCA9PT0gMCAmJiBzdGF0ZW1lbnRzVG9SZW1vdmUubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgLy8gVGhlcmUgYXJlIG5vIG1vcmUgc3RhdGVtZW50cyB0byBmb2xkLlxuICAgICAgICAgIHJldHVybiB0cy52aXNpdEVhY2hDaGlsZChub2RlLCB2aXNpdG9yLCBjb250ZXh0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENoZWNrIGlmIG5vZGUgaXMgYSBzdGF0ZW1lbnQgdG8gYmUgZHJvcHBlZC5cbiAgICAgICAgY29uc3Qgc3RtdElkeCA9IHN0YXRlbWVudHNUb1JlbW92ZS5pbmRleE9mKG5vZGUgYXMgdHMuRXhwcmVzc2lvblN0YXRlbWVudCk7XG4gICAgICAgIGlmIChzdG10SWR4ICE9IC0xKSB7XG4gICAgICAgICAgc3RhdGVtZW50c1RvUmVtb3ZlLnNwbGljZShzdG10SWR4LCAxKTtcblxuICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDaGVjayBpZiBub2RlIGlzIGEgRVM1IGNsYXNzIHRvIGFkZCBzdGF0ZW1lbnRzIHRvLlxuICAgICAgICBsZXQgY2xhenogPSBjbGFzc2VzLmZpbmQoKGNsKSA9PiBjbC5mdW5jdGlvbiA9PT0gbm9kZSk7XG4gICAgICAgIGlmIChjbGF6eikge1xuICAgICAgICAgIGNvbnN0IGZ1bmN0aW9uRXhwcmVzc2lvbiA9IG5vZGUgYXMgdHMuRnVuY3Rpb25FeHByZXNzaW9uO1xuXG4gICAgICAgICAgLy8gQ3JlYXRlIGEgbmV3IGJvZHkgd2l0aCBhbGwgdGhlIG9yaWdpbmFsIHN0YXRlbWVudHMsIHBsdXMgbmV3IG9uZXMsXG4gICAgICAgICAgLy8gcGx1cyByZXR1cm4gc3RhdGVtZW50LlxuICAgICAgICAgIGNvbnN0IG5ld0JvZHkgPSB0cy5jcmVhdGVCbG9jayhbXG4gICAgICAgICAgICAuLi5mdW5jdGlvbkV4cHJlc3Npb24uYm9keS5zdGF0ZW1lbnRzLnNsaWNlKDAsIC0xKSxcbiAgICAgICAgICAgIC4uLmNsYXp6LnN0YXRlbWVudHMubWFwKHN0ID0+IHN0LmV4cHJlc3Npb25TdGF0ZW1lbnQpLFxuICAgICAgICAgICAgLi4uZnVuY3Rpb25FeHByZXNzaW9uLmJvZHkuc3RhdGVtZW50cy5zbGljZSgtMSksXG4gICAgICAgICAgXSk7XG5cbiAgICAgICAgICBjb25zdCBuZXdOb2RlID0gdHMuY3JlYXRlRnVuY3Rpb25FeHByZXNzaW9uKFxuICAgICAgICAgICAgZnVuY3Rpb25FeHByZXNzaW9uLm1vZGlmaWVycyxcbiAgICAgICAgICAgIGZ1bmN0aW9uRXhwcmVzc2lvbi5hc3Rlcmlza1Rva2VuLFxuICAgICAgICAgICAgZnVuY3Rpb25FeHByZXNzaW9uLm5hbWUsXG4gICAgICAgICAgICBmdW5jdGlvbkV4cHJlc3Npb24udHlwZVBhcmFtZXRlcnMsXG4gICAgICAgICAgICBmdW5jdGlvbkV4cHJlc3Npb24ucGFyYW1ldGVycyxcbiAgICAgICAgICAgIGZ1bmN0aW9uRXhwcmVzc2lvbi50eXBlLFxuICAgICAgICAgICAgbmV3Qm9keSxcbiAgICAgICAgICApO1xuXG4gICAgICAgICAgLy8gVXBkYXRlIHJlbWFpbmluZyBjbGFzc2VzIGFuZCBzdGF0ZW1lbnRzLlxuICAgICAgICAgIHN0YXRlbWVudHNUb1JlbW92ZS5wdXNoKC4uLmNsYXp6LnN0YXRlbWVudHMubWFwKHN0ID0+IHN0LmV4cHJlc3Npb25TdGF0ZW1lbnQpKTtcbiAgICAgICAgICBjbGFzc2VzID0gY2xhc3Nlcy5maWx0ZXIoY2wgPT4gY2wgIT0gY2xhenopO1xuXG4gICAgICAgICAgLy8gUmVwbGFjZSBub2RlIHdpdGggbW9kaWZpZWQgb25lLlxuICAgICAgICAgIHJldHVybiBuZXdOb2RlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2hlY2sgaWYgbm9kZSBpcyBhIEVTMjAxNSBjbGFzcyB0byByZXBsYWNlIHdpdGggYSBwdXJlIElJRkUuXG4gICAgICAgIGNsYXp6ID0gY2xhc3Nlcy5maW5kKChjbCkgPT4gIWNsLmZ1bmN0aW9uICYmIGNsLmRlY2xhcmF0aW9uID09PSBub2RlKTtcbiAgICAgICAgaWYgKGNsYXp6KSB7XG4gICAgICAgICAgY29uc3QgY2xhc3NTdGF0ZW1lbnQgPSBjbGF6ei5kZWNsYXJhdGlvbiBhcyB0cy5DbGFzc0RlY2xhcmF0aW9uO1xuICAgICAgICAgIGNvbnN0IGlubmVyUmV0dXJuID0gdHMuY3JlYXRlUmV0dXJuKHRzLmNyZWF0ZUlkZW50aWZpZXIoY2xhenoubmFtZSkpO1xuXG4gICAgICAgICAgY29uc3QgcHVyZUlpZmUgPSBhZGRQdXJlQ29tbWVudChcbiAgICAgICAgICAgIHRzLmNyZWF0ZUltbWVkaWF0ZWx5SW52b2tlZEZ1bmN0aW9uRXhwcmVzc2lvbihbXG4gICAgICAgICAgICAgIGNsYXNzU3RhdGVtZW50LFxuICAgICAgICAgICAgICAuLi5jbGF6ei5zdGF0ZW1lbnRzLm1hcChzdCA9PiBzdC5leHByZXNzaW9uU3RhdGVtZW50KSxcbiAgICAgICAgICAgICAgaW5uZXJSZXR1cm4sXG4gICAgICAgICAgICBdKSk7XG5cbiAgICAgICAgICAvLyBNb3ZlIHRoZSBvcmlnaW5hbCBjbGFzcyBtb2RpZmllcnMgdG8gdGhlIHZhciBzdGF0ZW1lbnQuXG4gICAgICAgICAgY29uc3QgbmV3Tm9kZSA9IHRzLmNyZWF0ZVZhcmlhYmxlU3RhdGVtZW50KFxuICAgICAgICAgICAgY2xhenouZGVjbGFyYXRpb24ubW9kaWZpZXJzLFxuICAgICAgICAgICAgdHMuY3JlYXRlVmFyaWFibGVEZWNsYXJhdGlvbkxpc3QoW1xuICAgICAgICAgICAgICB0cy5jcmVhdGVWYXJpYWJsZURlY2xhcmF0aW9uKGNsYXp6Lm5hbWUsIHVuZGVmaW5lZCwgcHVyZUlpZmUpLFxuICAgICAgICAgICAgXSwgdHMuTm9kZUZsYWdzLkNvbnN0KSxcbiAgICAgICAgICApO1xuICAgICAgICAgIGNsYXp6LmRlY2xhcmF0aW9uLm1vZGlmaWVycyA9IHVuZGVmaW5lZDtcblxuICAgICAgICAgIC8vIFVwZGF0ZSByZW1haW5pbmcgY2xhc3NlcyBhbmQgc3RhdGVtZW50cy5cbiAgICAgICAgICBzdGF0ZW1lbnRzVG9SZW1vdmUucHVzaCguLi5jbGF6ei5zdGF0ZW1lbnRzLm1hcChzdCA9PiBzdC5leHByZXNzaW9uU3RhdGVtZW50KSk7XG4gICAgICAgICAgY2xhc3NlcyA9IGNsYXNzZXMuZmlsdGVyKGNsID0+IGNsICE9IGNsYXp6KTtcblxuICAgICAgICAgIHJldHVybiBuZXdOb2RlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gT3RoZXJ3aXNlIHJldHVybiBub2RlIGFzIGlzLlxuICAgICAgICByZXR1cm4gdHMudmlzaXRFYWNoQ2hpbGQobm9kZSwgdmlzaXRvciwgY29udGV4dCk7XG4gICAgICB9O1xuXG4gICAgICByZXR1cm4gdHMudmlzaXROb2RlKHNmLCB2aXNpdG9yKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHRyYW5zZm9ybWVyO1xuICB9O1xufVxuXG5mdW5jdGlvbiBmaW5kQ2xhc3NEZWNsYXJhdGlvbnMobm9kZTogdHMuTm9kZSk6IENsYXNzRGF0YVtdIHtcbiAgY29uc3QgY2xhc3NlczogQ2xhc3NEYXRhW10gPSBbXTtcbiAgLy8gRmluZCBhbGwgY2xhc3MgZGVjbGFyYXRpb25zLCBidWlsZCBhIENsYXNzRGF0YSBmb3IgZWFjaC5cbiAgdHMuZm9yRWFjaENoaWxkKG5vZGUsIChjaGlsZCkgPT4ge1xuICAgIC8vIENoZWNrIGlmIGl0IGlzIGEgbmFtZWQgY2xhc3MgZGVjbGFyYXRpb24gZmlyc3QuXG4gICAgLy8gVGVjaG5pY2FsbHkgaXQgZG9lc24ndCBuZWVkIGEgbmFtZSBpbiBUUyBpZiBpdCdzIHRoZSBkZWZhdWx0IGV4cG9ydCwgYnV0IHdoZW4gZG93bmxldmVsZWRcbiAgICAvLyBpdCB3aWxsIGJlIGhhdmUgYSBuYW1lIChlLmcuIGBkZWZhdWx0XzFgKS5cbiAgICBpZiAodHMuaXNDbGFzc0RlY2xhcmF0aW9uKGNoaWxkKSAmJiBjaGlsZC5uYW1lKSB7XG4gICAgICBjbGFzc2VzLnB1c2goe1xuICAgICAgICBuYW1lOiBjaGlsZC5uYW1lLnRleHQsXG4gICAgICAgIGRlY2xhcmF0aW9uOiBjaGlsZCxcbiAgICAgICAgc3RhdGVtZW50czogW10sXG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChjaGlsZC5raW5kICE9PSB0cy5TeW50YXhLaW5kLlZhcmlhYmxlU3RhdGVtZW50KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHZhclN0bXQgPSBjaGlsZCBhcyB0cy5WYXJpYWJsZVN0YXRlbWVudDtcbiAgICBpZiAodmFyU3RtdC5kZWNsYXJhdGlvbkxpc3QuZGVjbGFyYXRpb25zLmxlbmd0aCA+IDEpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgdmFyRGVjbCA9IHZhclN0bXQuZGVjbGFyYXRpb25MaXN0LmRlY2xhcmF0aW9uc1swXTtcbiAgICBpZiAodmFyRGVjbC5uYW1lLmtpbmQgIT09IHRzLlN5bnRheEtpbmQuSWRlbnRpZmllcikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBuYW1lID0gKHZhckRlY2wubmFtZSBhcyB0cy5JZGVudGlmaWVyKS50ZXh0O1xuICAgIGNvbnN0IGV4cHIgPSB2YXJEZWNsLmluaXRpYWxpemVyO1xuICAgIGlmICghZXhwciB8fCBleHByLmtpbmQgIT09IHRzLlN5bnRheEtpbmQuUGFyZW50aGVzaXplZEV4cHJlc3Npb24pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKChleHByIGFzIHRzLlBhcmVudGhlc2l6ZWRFeHByZXNzaW9uKS5leHByZXNzaW9uLmtpbmQgIT09IHRzLlN5bnRheEtpbmQuQ2FsbEV4cHJlc3Npb24pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgY2FsbEV4cHIgPSAoZXhwciBhcyB0cy5QYXJlbnRoZXNpemVkRXhwcmVzc2lvbikuZXhwcmVzc2lvbiBhcyB0cy5DYWxsRXhwcmVzc2lvbjtcbiAgICBpZiAoY2FsbEV4cHIuZXhwcmVzc2lvbi5raW5kICE9PSB0cy5TeW50YXhLaW5kLkZ1bmN0aW9uRXhwcmVzc2lvbikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBmbiA9IGNhbGxFeHByLmV4cHJlc3Npb24gYXMgdHMuRnVuY3Rpb25FeHByZXNzaW9uO1xuICAgIGlmIChmbi5ib2R5LnN0YXRlbWVudHMubGVuZ3RoIDwgMikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoZm4uYm9keS5zdGF0ZW1lbnRzWzBdLmtpbmQgIT09IHRzLlN5bnRheEtpbmQuRnVuY3Rpb25EZWNsYXJhdGlvbikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBpbm5lckZuID0gZm4uYm9keS5zdGF0ZW1lbnRzWzBdIGFzIHRzLkZ1bmN0aW9uRGVjbGFyYXRpb247XG4gICAgaWYgKGZuLmJvZHkuc3RhdGVtZW50c1tmbi5ib2R5LnN0YXRlbWVudHMubGVuZ3RoIC0gMV0ua2luZCAhPT0gdHMuU3ludGF4S2luZC5SZXR1cm5TdGF0ZW1lbnQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKCFpbm5lckZuLm5hbWUgfHwgaW5uZXJGbi5uYW1lLmtpbmQgIT09IHRzLlN5bnRheEtpbmQuSWRlbnRpZmllcikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoKGlubmVyRm4ubmFtZSBhcyB0cy5JZGVudGlmaWVyKS50ZXh0ICE9PSBuYW1lKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNsYXNzZXMucHVzaCh7XG4gICAgICBuYW1lLFxuICAgICAgZGVjbGFyYXRpb246IHZhckRlY2wsXG4gICAgICBmdW5jdGlvbjogZm4sXG4gICAgICBzdGF0ZW1lbnRzOiBbXSxcbiAgICB9KTtcbiAgfSk7XG5cbiAgcmV0dXJuIGNsYXNzZXM7XG59XG5cbmZ1bmN0aW9uIGZpbmRDbGFzc2VzV2l0aFN0YXRpY1Byb3BlcnR5QXNzaWdubWVudHMoXG4gIG5vZGU6IHRzLk5vZGUsXG4gIGNoZWNrZXI6IHRzLlR5cGVDaGVja2VyLFxuICBjbGFzc2VzOiBDbGFzc0RhdGFbXSxcbikge1xuICAvLyBGaW5kIGVhY2ggYXNzaWdubWVudCBvdXRzaWRlIG9mIHRoZSBkZWNsYXJhdGlvbi5cbiAgdHMuZm9yRWFjaENoaWxkKG5vZGUsIChjaGlsZCkgPT4ge1xuICAgIGlmIChjaGlsZC5raW5kICE9PSB0cy5TeW50YXhLaW5kLkV4cHJlc3Npb25TdGF0ZW1lbnQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgZXhwcmVzc2lvblN0YXRlbWVudCA9IGNoaWxkIGFzIHRzLkV4cHJlc3Npb25TdGF0ZW1lbnQ7XG4gICAgaWYgKGV4cHJlc3Npb25TdGF0ZW1lbnQuZXhwcmVzc2lvbi5raW5kICE9PSB0cy5TeW50YXhLaW5kLkJpbmFyeUV4cHJlc3Npb24pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgYmluRXggPSBleHByZXNzaW9uU3RhdGVtZW50LmV4cHJlc3Npb24gYXMgdHMuQmluYXJ5RXhwcmVzc2lvbjtcbiAgICBpZiAoYmluRXgubGVmdC5raW5kICE9PSB0cy5TeW50YXhLaW5kLlByb3BlcnR5QWNjZXNzRXhwcmVzc2lvbikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBwcm9wQWNjZXNzID0gYmluRXgubGVmdCBhcyB0cy5Qcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb247XG4gICAgaWYgKHByb3BBY2Nlc3MuZXhwcmVzc2lvbi5raW5kICE9PSB0cy5TeW50YXhLaW5kLklkZW50aWZpZXIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBzeW1ib2wgPSBjaGVja2VyLmdldFN5bWJvbEF0TG9jYXRpb24ocHJvcEFjY2Vzcy5leHByZXNzaW9uKTtcbiAgICBpZiAoIXN5bWJvbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGRlY2xzID0gc3ltYm9sLmRlY2xhcmF0aW9ucztcbiAgICBpZiAoZGVjbHMgPT0gdW5kZWZpbmVkIHx8IGRlY2xzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGhvc3RDbGFzcyA9IGNsYXNzZXMuZmluZCgoY2xhenogPT4gZGVjbHMuaW5jbHVkZXMoY2xhenouZGVjbGFyYXRpb24pKSk7XG4gICAgaWYgKCFob3N0Q2xhc3MpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3Qgc3RhdGVtZW50OiBTdGF0ZW1lbnREYXRhID0geyBleHByZXNzaW9uU3RhdGVtZW50LCBob3N0Q2xhc3MgfTtcblxuICAgIGhvc3RDbGFzcy5zdGF0ZW1lbnRzLnB1c2goc3RhdGVtZW50KTtcbiAgfSk7XG5cbiAgLy8gT25seSByZXR1cm4gY2xhc3NlcyB0aGF0IGhhdmUgc3RhdGljIHByb3BlcnR5IGFzc2lnbm1lbnRzLlxuICByZXR1cm4gY2xhc3Nlcy5maWx0ZXIoY2wgPT4gY2wuc3RhdGVtZW50cy5sZW5ndGggIT0gMCk7XG59XG4iXX0=