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
function getPrefixFunctionsTransformer() {
    return (context) => {
        const transformer = (sf) => {
            const topLevelFunctions = findTopLevelFunctions(sf);
            const visitor = (node) => {
                // Add pure function comment to top level functions.
                if (topLevelFunctions.has(node)) {
                    const newNode = ast_utils_1.addPureComment(node);
                    // Replace node with modified one.
                    return ts.visitEachChild(newNode, visitor, context);
                }
                // Otherwise return node as is.
                return ts.visitEachChild(node, visitor, context);
            };
            return ts.visitNode(sf, visitor);
        };
        return transformer;
    };
}
exports.getPrefixFunctionsTransformer = getPrefixFunctionsTransformer;
function findTopLevelFunctions(parentNode) {
    const topLevelFunctions = new Set();
    function cb(node) {
        // Stop recursing into this branch if it's a definition construct.
        // These are function expression, function declaration, class, or arrow function (lambda).
        // The body of these constructs will not execute when loading the module, so we don't
        // need to mark function calls inside them as pure.
        // Class static initializers in ES2015 are an exception we don't cover. They would need similar
        // processing as enums to prevent property setting from causing the class to be retained.
        if (ts.isFunctionDeclaration(node)
            || ts.isFunctionExpression(node)
            || ts.isClassDeclaration(node)
            || ts.isArrowFunction(node)
            || ts.isMethodDeclaration(node)) {
            return;
        }
        let noPureComment = !ast_utils_1.hasPureComment(node);
        let innerNode = node;
        while (innerNode && ts.isParenthesizedExpression(innerNode)) {
            innerNode = innerNode.expression;
            noPureComment = noPureComment && !ast_utils_1.hasPureComment(innerNode);
        }
        if (!innerNode) {
            return;
        }
        if ((ts.isFunctionExpression(innerNode) || ts.isArrowFunction(innerNode))
            && ts.isParenthesizedExpression(node)) {
            // pure functions can be wrapped in parentizes
            // we should not add pure comments to this sort of syntax.
            // example var foo = (() => x)
            return;
        }
        if (noPureComment) {
            if (ts.isNewExpression(innerNode)) {
                topLevelFunctions.add(node);
            }
            else if (ts.isCallExpression(innerNode)) {
                let expression = innerNode.expression;
                while (expression && ts.isParenthesizedExpression(expression)) {
                    expression = expression.expression;
                }
                if (expression) {
                    if (ts.isFunctionExpression(expression)) {
                        // Skip IIFE's with arguments
                        // This could be improved to check if there are any references to variables
                        if (innerNode.arguments.length === 0) {
                            topLevelFunctions.add(node);
                        }
                    }
                    else {
                        topLevelFunctions.add(node);
                    }
                }
            }
        }
        ts.forEachChild(innerNode, cb);
    }
    ts.forEachChild(parentNode, cb);
    return topLevelFunctions;
}
exports.findTopLevelFunctions = findTopLevelFunctions;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlZml4LWZ1bmN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsicGFja2FnZXMvYW5ndWxhcl9kZXZraXQvYnVpbGRfb3B0aW1pemVyL3NyYy90cmFuc2Zvcm1zL3ByZWZpeC1mdW5jdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7O0dBTUc7QUFDSCxpQ0FBaUM7QUFDakMsb0RBQXNFO0FBRXRFLFNBQWdCLDZCQUE2QjtJQUMzQyxPQUFPLENBQUMsT0FBaUMsRUFBaUMsRUFBRTtRQUMxRSxNQUFNLFdBQVcsR0FBa0MsQ0FBQyxFQUFpQixFQUFFLEVBQUU7WUFFdkUsTUFBTSxpQkFBaUIsR0FBRyxxQkFBcUIsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUVwRCxNQUFNLE9BQU8sR0FBZSxDQUFDLElBQWEsRUFBVyxFQUFFO2dCQUNyRCxvREFBb0Q7Z0JBQ3BELElBQUksaUJBQWlCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFO29CQUMvQixNQUFNLE9BQU8sR0FBRywwQkFBYyxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUVyQyxrQ0FBa0M7b0JBQ2xDLE9BQU8sRUFBRSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO2lCQUNyRDtnQkFFRCwrQkFBK0I7Z0JBQy9CLE9BQU8sRUFBRSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ25ELENBQUMsQ0FBQztZQUVGLE9BQU8sRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDbkMsQ0FBQyxDQUFDO1FBRUYsT0FBTyxXQUFXLENBQUM7SUFDckIsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQXhCRCxzRUF3QkM7QUFFRCxTQUFnQixxQkFBcUIsQ0FBQyxVQUFtQjtJQUN2RCxNQUFNLGlCQUFpQixHQUFHLElBQUksR0FBRyxFQUFXLENBQUM7SUFFN0MsU0FBUyxFQUFFLENBQUMsSUFBYTtRQUN2QixrRUFBa0U7UUFDbEUsMEZBQTBGO1FBQzFGLHFGQUFxRjtRQUNyRixtREFBbUQ7UUFDbkQsK0ZBQStGO1FBQy9GLHlGQUF5RjtRQUN6RixJQUFJLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUM7ZUFDN0IsRUFBRSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQztlQUM3QixFQUFFLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDO2VBQzNCLEVBQUUsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDO2VBQ3hCLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsRUFDL0I7WUFDQSxPQUFPO1NBQ1I7UUFFRCxJQUFJLGFBQWEsR0FBRyxDQUFDLDBCQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDMUMsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDO1FBQ3JCLE9BQU8sU0FBUyxJQUFJLEVBQUUsQ0FBQyx5QkFBeUIsQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUMzRCxTQUFTLEdBQUcsU0FBUyxDQUFDLFVBQVUsQ0FBQztZQUNqQyxhQUFhLEdBQUcsYUFBYSxJQUFJLENBQUMsMEJBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUM3RDtRQUVELElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDZCxPQUFPO1NBQ1I7UUFFRCxJQUFJLENBQUMsRUFBRSxDQUFDLG9CQUFvQixDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLENBQUM7ZUFDcEUsRUFBRSxDQUFDLHlCQUF5QixDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ3JDLDhDQUE4QztZQUM5QywwREFBMEQ7WUFDMUQsOEJBQThCO1lBQ2hDLE9BQU87U0FDUjtRQUVELElBQUksYUFBYSxFQUFFO1lBQ2pCLElBQUksRUFBRSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsRUFBRTtnQkFDakMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQzdCO2lCQUFNLElBQUksRUFBRSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxFQUFFO2dCQUN6QyxJQUFJLFVBQVUsR0FBa0IsU0FBUyxDQUFDLFVBQVUsQ0FBQztnQkFDckQsT0FBTyxVQUFVLElBQUksRUFBRSxDQUFDLHlCQUF5QixDQUFDLFVBQVUsQ0FBQyxFQUFFO29CQUM3RCxVQUFVLEdBQUcsVUFBVSxDQUFDLFVBQVUsQ0FBQztpQkFDcEM7Z0JBQ0QsSUFBSSxVQUFVLEVBQUU7b0JBQ2QsSUFBSSxFQUFFLENBQUMsb0JBQW9CLENBQUMsVUFBVSxDQUFDLEVBQUU7d0JBQ3ZDLDZCQUE2Qjt3QkFDN0IsMkVBQTJFO3dCQUMzRSxJQUFJLFNBQVMsQ0FBQyxTQUFTLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTs0QkFDcEMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO3lCQUM3QjtxQkFDRjt5QkFBTTt3QkFDTCxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQzdCO2lCQUNGO2FBQ0Y7U0FDRjtRQUVELEVBQUUsQ0FBQyxZQUFZLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ2pDLENBQUM7SUFFRCxFQUFFLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUVoQyxPQUFPLGlCQUFpQixDQUFDO0FBQzNCLENBQUM7QUFsRUQsc0RBa0VDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5pbXBvcnQgeyBhZGRQdXJlQ29tbWVudCwgaGFzUHVyZUNvbW1lbnQgfSBmcm9tICcuLi9oZWxwZXJzL2FzdC11dGlscyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRQcmVmaXhGdW5jdGlvbnNUcmFuc2Zvcm1lcigpOiB0cy5UcmFuc2Zvcm1lckZhY3Rvcnk8dHMuU291cmNlRmlsZT4ge1xuICByZXR1cm4gKGNvbnRleHQ6IHRzLlRyYW5zZm9ybWF0aW9uQ29udGV4dCk6IHRzLlRyYW5zZm9ybWVyPHRzLlNvdXJjZUZpbGU+ID0+IHtcbiAgICBjb25zdCB0cmFuc2Zvcm1lcjogdHMuVHJhbnNmb3JtZXI8dHMuU291cmNlRmlsZT4gPSAoc2Y6IHRzLlNvdXJjZUZpbGUpID0+IHtcblxuICAgICAgY29uc3QgdG9wTGV2ZWxGdW5jdGlvbnMgPSBmaW5kVG9wTGV2ZWxGdW5jdGlvbnMoc2YpO1xuXG4gICAgICBjb25zdCB2aXNpdG9yOiB0cy5WaXNpdG9yID0gKG5vZGU6IHRzLk5vZGUpOiB0cy5Ob2RlID0+IHtcbiAgICAgICAgLy8gQWRkIHB1cmUgZnVuY3Rpb24gY29tbWVudCB0byB0b3AgbGV2ZWwgZnVuY3Rpb25zLlxuICAgICAgICBpZiAodG9wTGV2ZWxGdW5jdGlvbnMuaGFzKG5vZGUpKSB7XG4gICAgICAgICAgY29uc3QgbmV3Tm9kZSA9IGFkZFB1cmVDb21tZW50KG5vZGUpO1xuXG4gICAgICAgICAgLy8gUmVwbGFjZSBub2RlIHdpdGggbW9kaWZpZWQgb25lLlxuICAgICAgICAgIHJldHVybiB0cy52aXNpdEVhY2hDaGlsZChuZXdOb2RlLCB2aXNpdG9yLCBjb250ZXh0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE90aGVyd2lzZSByZXR1cm4gbm9kZSBhcyBpcy5cbiAgICAgICAgcmV0dXJuIHRzLnZpc2l0RWFjaENoaWxkKG5vZGUsIHZpc2l0b3IsIGNvbnRleHQpO1xuICAgICAgfTtcblxuICAgICAgcmV0dXJuIHRzLnZpc2l0Tm9kZShzZiwgdmlzaXRvcik7XG4gICAgfTtcblxuICAgIHJldHVybiB0cmFuc2Zvcm1lcjtcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpbmRUb3BMZXZlbEZ1bmN0aW9ucyhwYXJlbnROb2RlOiB0cy5Ob2RlKTogU2V0PHRzLk5vZGU+IHtcbiAgY29uc3QgdG9wTGV2ZWxGdW5jdGlvbnMgPSBuZXcgU2V0PHRzLk5vZGU+KCk7XG5cbiAgZnVuY3Rpb24gY2Iobm9kZTogdHMuTm9kZSkge1xuICAgIC8vIFN0b3AgcmVjdXJzaW5nIGludG8gdGhpcyBicmFuY2ggaWYgaXQncyBhIGRlZmluaXRpb24gY29uc3RydWN0LlxuICAgIC8vIFRoZXNlIGFyZSBmdW5jdGlvbiBleHByZXNzaW9uLCBmdW5jdGlvbiBkZWNsYXJhdGlvbiwgY2xhc3MsIG9yIGFycm93IGZ1bmN0aW9uIChsYW1iZGEpLlxuICAgIC8vIFRoZSBib2R5IG9mIHRoZXNlIGNvbnN0cnVjdHMgd2lsbCBub3QgZXhlY3V0ZSB3aGVuIGxvYWRpbmcgdGhlIG1vZHVsZSwgc28gd2UgZG9uJ3RcbiAgICAvLyBuZWVkIHRvIG1hcmsgZnVuY3Rpb24gY2FsbHMgaW5zaWRlIHRoZW0gYXMgcHVyZS5cbiAgICAvLyBDbGFzcyBzdGF0aWMgaW5pdGlhbGl6ZXJzIGluIEVTMjAxNSBhcmUgYW4gZXhjZXB0aW9uIHdlIGRvbid0IGNvdmVyLiBUaGV5IHdvdWxkIG5lZWQgc2ltaWxhclxuICAgIC8vIHByb2Nlc3NpbmcgYXMgZW51bXMgdG8gcHJldmVudCBwcm9wZXJ0eSBzZXR0aW5nIGZyb20gY2F1c2luZyB0aGUgY2xhc3MgdG8gYmUgcmV0YWluZWQuXG4gICAgaWYgKHRzLmlzRnVuY3Rpb25EZWNsYXJhdGlvbihub2RlKVxuICAgICAgfHwgdHMuaXNGdW5jdGlvbkV4cHJlc3Npb24obm9kZSlcbiAgICAgIHx8IHRzLmlzQ2xhc3NEZWNsYXJhdGlvbihub2RlKVxuICAgICAgfHwgdHMuaXNBcnJvd0Z1bmN0aW9uKG5vZGUpXG4gICAgICB8fCB0cy5pc01ldGhvZERlY2xhcmF0aW9uKG5vZGUpXG4gICAgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IG5vUHVyZUNvbW1lbnQgPSAhaGFzUHVyZUNvbW1lbnQobm9kZSk7XG4gICAgbGV0IGlubmVyTm9kZSA9IG5vZGU7XG4gICAgd2hpbGUgKGlubmVyTm9kZSAmJiB0cy5pc1BhcmVudGhlc2l6ZWRFeHByZXNzaW9uKGlubmVyTm9kZSkpIHtcbiAgICAgIGlubmVyTm9kZSA9IGlubmVyTm9kZS5leHByZXNzaW9uO1xuICAgICAgbm9QdXJlQ29tbWVudCA9IG5vUHVyZUNvbW1lbnQgJiYgIWhhc1B1cmVDb21tZW50KGlubmVyTm9kZSk7XG4gICAgfVxuXG4gICAgaWYgKCFpbm5lck5vZGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoKHRzLmlzRnVuY3Rpb25FeHByZXNzaW9uKGlubmVyTm9kZSkgfHwgdHMuaXNBcnJvd0Z1bmN0aW9uKGlubmVyTm9kZSkpXG4gICAgICAmJiB0cy5pc1BhcmVudGhlc2l6ZWRFeHByZXNzaW9uKG5vZGUpKSB7XG4gICAgICAgIC8vIHB1cmUgZnVuY3Rpb25zIGNhbiBiZSB3cmFwcGVkIGluIHBhcmVudGl6ZXNcbiAgICAgICAgLy8gd2Ugc2hvdWxkIG5vdCBhZGQgcHVyZSBjb21tZW50cyB0byB0aGlzIHNvcnQgb2Ygc3ludGF4LlxuICAgICAgICAvLyBleGFtcGxlIHZhciBmb28gPSAoKCkgPT4geClcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAobm9QdXJlQ29tbWVudCkge1xuICAgICAgaWYgKHRzLmlzTmV3RXhwcmVzc2lvbihpbm5lck5vZGUpKSB7XG4gICAgICAgIHRvcExldmVsRnVuY3Rpb25zLmFkZChub2RlKTtcbiAgICAgIH0gZWxzZSBpZiAodHMuaXNDYWxsRXhwcmVzc2lvbihpbm5lck5vZGUpKSB7XG4gICAgICAgIGxldCBleHByZXNzaW9uOiB0cy5FeHByZXNzaW9uID0gaW5uZXJOb2RlLmV4cHJlc3Npb247XG4gICAgICAgIHdoaWxlIChleHByZXNzaW9uICYmIHRzLmlzUGFyZW50aGVzaXplZEV4cHJlc3Npb24oZXhwcmVzc2lvbikpIHtcbiAgICAgICAgICBleHByZXNzaW9uID0gZXhwcmVzc2lvbi5leHByZXNzaW9uO1xuICAgICAgICB9XG4gICAgICAgIGlmIChleHByZXNzaW9uKSB7XG4gICAgICAgICAgaWYgKHRzLmlzRnVuY3Rpb25FeHByZXNzaW9uKGV4cHJlc3Npb24pKSB7XG4gICAgICAgICAgICAvLyBTa2lwIElJRkUncyB3aXRoIGFyZ3VtZW50c1xuICAgICAgICAgICAgLy8gVGhpcyBjb3VsZCBiZSBpbXByb3ZlZCB0byBjaGVjayBpZiB0aGVyZSBhcmUgYW55IHJlZmVyZW5jZXMgdG8gdmFyaWFibGVzXG4gICAgICAgICAgICBpZiAoaW5uZXJOb2RlLmFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgdG9wTGV2ZWxGdW5jdGlvbnMuYWRkKG5vZGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0b3BMZXZlbEZ1bmN0aW9ucy5hZGQobm9kZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdHMuZm9yRWFjaENoaWxkKGlubmVyTm9kZSwgY2IpO1xuICB9XG5cbiAgdHMuZm9yRWFjaENoaWxkKHBhcmVudE5vZGUsIGNiKTtcblxuICByZXR1cm4gdG9wTGV2ZWxGdW5jdGlvbnM7XG59XG4iXX0=