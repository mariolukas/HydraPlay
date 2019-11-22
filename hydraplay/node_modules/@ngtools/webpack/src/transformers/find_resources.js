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
const ast_helpers_1 = require("./ast_helpers");
const replace_resources_1 = require("./replace_resources");
function findResources(sourceFile) {
    const resources = [];
    const decorators = ast_helpers_1.collectDeepNodes(sourceFile, ts.SyntaxKind.Decorator);
    for (const node of decorators) {
        if (!ts.isCallExpression(node.expression)) {
            continue;
        }
        const decoratorFactory = node.expression;
        const args = decoratorFactory.arguments;
        if (args.length !== 1 || !ts.isObjectLiteralExpression(args[0])) {
            // Unsupported component metadata
            continue;
        }
        ts.visitNodes(args[0].properties, (node) => {
            if (!ts.isPropertyAssignment(node) || ts.isComputedPropertyName(node.name)) {
                return node;
            }
            const name = node.name.text;
            switch (name) {
                case 'templateUrl':
                    const url = replace_resources_1.getResourceUrl(node.initializer);
                    if (url) {
                        resources.push(url);
                    }
                    break;
                case 'styleUrls':
                    if (!ts.isArrayLiteralExpression(node.initializer)) {
                        return node;
                    }
                    ts.visitNodes(node.initializer.elements, (node) => {
                        const url = replace_resources_1.getResourceUrl(node);
                        if (url) {
                            resources.push(url);
                        }
                        return node;
                    });
                    break;
            }
            return node;
        });
    }
    return resources;
}
exports.findResources = findResources;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmluZF9yZXNvdXJjZXMuanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL25ndG9vbHMvd2VicGFjay9zcmMvdHJhbnNmb3JtZXJzL2ZpbmRfcmVzb3VyY2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7OztHQU1HO0FBQ0gsaUNBQWlDO0FBQ2pDLCtDQUFpRDtBQUNqRCwyREFBcUQ7QUFFckQsU0FBZ0IsYUFBYSxDQUFDLFVBQXlCO0lBQ3JELE1BQU0sU0FBUyxHQUFhLEVBQUUsQ0FBQztJQUMvQixNQUFNLFVBQVUsR0FBRyw4QkFBZ0IsQ0FBZSxVQUFVLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUV2RixLQUFLLE1BQU0sSUFBSSxJQUFJLFVBQVUsRUFBRTtRQUM3QixJQUFJLENBQUMsRUFBRSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUN6QyxTQUFTO1NBQ1Y7UUFFRCxNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7UUFDekMsTUFBTSxJQUFJLEdBQUcsZ0JBQWdCLENBQUMsU0FBUyxDQUFDO1FBQ3hDLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMseUJBQXlCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDL0QsaUNBQWlDO1lBQ2pDLFNBQVM7U0FDVjtRQUVELEVBQUUsQ0FBQyxVQUFVLENBQ1YsSUFBSSxDQUFDLENBQUMsQ0FBZ0MsQ0FBQyxVQUFVLEVBQ2xELENBQUMsSUFBaUMsRUFBRSxFQUFFO1lBQ3BDLElBQUksQ0FBQyxFQUFFLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDMUUsT0FBTyxJQUFJLENBQUM7YUFDYjtZQUVELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO1lBQzVCLFFBQVEsSUFBSSxFQUFFO2dCQUNaLEtBQUssYUFBYTtvQkFDaEIsTUFBTSxHQUFHLEdBQUcsa0NBQWMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7b0JBRTdDLElBQUksR0FBRyxFQUFFO3dCQUNQLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7cUJBQ3JCO29CQUNELE1BQU07Z0JBRVIsS0FBSyxXQUFXO29CQUNkLElBQUksQ0FBQyxFQUFFLENBQUMsd0JBQXdCLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFO3dCQUNsRCxPQUFPLElBQUksQ0FBQztxQkFDYjtvQkFFRCxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLENBQUMsSUFBbUIsRUFBRSxFQUFFO3dCQUMvRCxNQUFNLEdBQUcsR0FBRyxrQ0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO3dCQUVqQyxJQUFJLEdBQUcsRUFBRTs0QkFDUCxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO3lCQUNyQjt3QkFFRCxPQUFPLElBQUksQ0FBQztvQkFDZCxDQUFDLENBQUMsQ0FBQztvQkFDSCxNQUFNO2FBQ1Q7WUFFRCxPQUFPLElBQUksQ0FBQztRQUNkLENBQUMsQ0FDRixDQUFDO0tBQ0g7SUFFRCxPQUFPLFNBQVMsQ0FBQztBQUNuQixDQUFDO0FBeERELHNDQXdEQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuaW1wb3J0IHsgY29sbGVjdERlZXBOb2RlcyB9IGZyb20gJy4vYXN0X2hlbHBlcnMnO1xuaW1wb3J0IHsgZ2V0UmVzb3VyY2VVcmwgfSBmcm9tICcuL3JlcGxhY2VfcmVzb3VyY2VzJztcblxuZXhwb3J0IGZ1bmN0aW9uIGZpbmRSZXNvdXJjZXMoc291cmNlRmlsZTogdHMuU291cmNlRmlsZSk6IHN0cmluZ1tdIHtcbiAgY29uc3QgcmVzb3VyY2VzOiBzdHJpbmdbXSA9IFtdO1xuICBjb25zdCBkZWNvcmF0b3JzID0gY29sbGVjdERlZXBOb2Rlczx0cy5EZWNvcmF0b3I+KHNvdXJjZUZpbGUsIHRzLlN5bnRheEtpbmQuRGVjb3JhdG9yKTtcblxuICBmb3IgKGNvbnN0IG5vZGUgb2YgZGVjb3JhdG9ycykge1xuICAgIGlmICghdHMuaXNDYWxsRXhwcmVzc2lvbihub2RlLmV4cHJlc3Npb24pKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBjb25zdCBkZWNvcmF0b3JGYWN0b3J5ID0gbm9kZS5leHByZXNzaW9uO1xuICAgIGNvbnN0IGFyZ3MgPSBkZWNvcmF0b3JGYWN0b3J5LmFyZ3VtZW50cztcbiAgICBpZiAoYXJncy5sZW5ndGggIT09IDEgfHwgIXRzLmlzT2JqZWN0TGl0ZXJhbEV4cHJlc3Npb24oYXJnc1swXSkpIHtcbiAgICAgIC8vIFVuc3VwcG9ydGVkIGNvbXBvbmVudCBtZXRhZGF0YVxuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgdHMudmlzaXROb2RlcyhcbiAgICAgIChhcmdzWzBdIGFzIHRzLk9iamVjdExpdGVyYWxFeHByZXNzaW9uKS5wcm9wZXJ0aWVzLFxuICAgICAgKG5vZGU6IHRzLk9iamVjdExpdGVyYWxFbGVtZW50TGlrZSkgPT4ge1xuICAgICAgICBpZiAoIXRzLmlzUHJvcGVydHlBc3NpZ25tZW50KG5vZGUpIHx8IHRzLmlzQ29tcHV0ZWRQcm9wZXJ0eU5hbWUobm9kZS5uYW1lKSkge1xuICAgICAgICAgIHJldHVybiBub2RlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbmFtZSA9IG5vZGUubmFtZS50ZXh0O1xuICAgICAgICBzd2l0Y2ggKG5hbWUpIHtcbiAgICAgICAgICBjYXNlICd0ZW1wbGF0ZVVybCc6XG4gICAgICAgICAgICBjb25zdCB1cmwgPSBnZXRSZXNvdXJjZVVybChub2RlLmluaXRpYWxpemVyKTtcblxuICAgICAgICAgICAgaWYgKHVybCkge1xuICAgICAgICAgICAgICByZXNvdXJjZXMucHVzaCh1cmwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICBjYXNlICdzdHlsZVVybHMnOlxuICAgICAgICAgICAgaWYgKCF0cy5pc0FycmF5TGl0ZXJhbEV4cHJlc3Npb24obm9kZS5pbml0aWFsaXplcikpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRzLnZpc2l0Tm9kZXMobm9kZS5pbml0aWFsaXplci5lbGVtZW50cywgKG5vZGU6IHRzLkV4cHJlc3Npb24pID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgdXJsID0gZ2V0UmVzb3VyY2VVcmwobm9kZSk7XG5cbiAgICAgICAgICAgICAgaWYgKHVybCkge1xuICAgICAgICAgICAgICAgIHJlc291cmNlcy5wdXNoKHVybCk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICByZXR1cm4gbm9kZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbm9kZTtcbiAgICAgIH0sXG4gICAgKTtcbiAgfVxuXG4gIHJldHVybiByZXNvdXJjZXM7XG59XG4iXX0=