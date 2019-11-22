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
const interfaces_1 = require("./interfaces");
// Remove imports for which all identifiers have been removed.
// Needs type checker, and works even if it's not the first transformer.
// Works by removing imports for symbols whose identifiers have all been removed.
// Doesn't use the `symbol.declarations` because that previous transforms might have removed nodes
// but the type checker doesn't know.
// See https://github.com/Microsoft/TypeScript/issues/17552 for more information.
function elideImports(sourceFile, removedNodes, getTypeChecker) {
    const ops = [];
    if (removedNodes.length === 0) {
        return [];
    }
    const typeChecker = getTypeChecker();
    // Collect all imports and used identifiers
    const usedSymbols = new Set();
    const imports = [];
    ts.forEachChild(sourceFile, function visit(node) {
        // Skip removed nodes
        if (removedNodes.includes(node)) {
            return;
        }
        // Record import and skip
        if (ts.isImportDeclaration(node)) {
            imports.push(node);
            return;
        }
        let symbol;
        switch (node.kind) {
            case ts.SyntaxKind.Identifier:
                symbol = typeChecker.getSymbolAtLocation(node);
                break;
            case ts.SyntaxKind.ExportSpecifier:
                symbol = typeChecker.getExportSpecifierLocalTargetSymbol(node);
                break;
            case ts.SyntaxKind.ShorthandPropertyAssignment:
                symbol = typeChecker.getShorthandAssignmentValueSymbol(node);
                break;
        }
        if (symbol) {
            usedSymbols.add(symbol);
        }
        ts.forEachChild(node, visit);
    });
    if (imports.length === 0) {
        return [];
    }
    const isUnused = (node) => {
        const symbol = typeChecker.getSymbolAtLocation(node);
        return symbol && !usedSymbols.has(symbol);
    };
    for (const node of imports) {
        if (!node.importClause) {
            // "import 'abc';"
            continue;
        }
        const namedBindings = node.importClause.namedBindings;
        if (namedBindings && ts.isNamespaceImport(namedBindings)) {
            // "import * as XYZ from 'abc';"
            if (isUnused(namedBindings.name)) {
                ops.push(new interfaces_1.RemoveNodeOperation(sourceFile, node));
            }
        }
        else {
            const specifierOps = [];
            let clausesCount = 0;
            // "import { XYZ, ... } from 'abc';"
            if (namedBindings && ts.isNamedImports(namedBindings)) {
                let removedClausesCount = 0;
                clausesCount += namedBindings.elements.length;
                for (const specifier of namedBindings.elements) {
                    if (isUnused(specifier.name)) {
                        removedClausesCount++;
                        // in case we don't have any more namedImports we should remove the parent ie the {}
                        const nodeToRemove = clausesCount === removedClausesCount
                            ? specifier.parent
                            : specifier;
                        specifierOps.push(new interfaces_1.RemoveNodeOperation(sourceFile, nodeToRemove));
                    }
                }
            }
            // "import XYZ from 'abc';"
            if (node.importClause.name) {
                clausesCount++;
                if (isUnused(node.importClause.name)) {
                    specifierOps.push(new interfaces_1.RemoveNodeOperation(sourceFile, node.importClause.name));
                }
            }
            if (specifierOps.length === clausesCount) {
                ops.push(new interfaces_1.RemoveNodeOperation(sourceFile, node));
            }
            else {
                ops.push(...specifierOps);
            }
        }
    }
    return ops;
}
exports.elideImports = elideImports;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWxpZGVfaW1wb3J0cy5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsicGFja2FnZXMvbmd0b29scy93ZWJwYWNrL3NyYy90cmFuc2Zvcm1lcnMvZWxpZGVfaW1wb3J0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7R0FNRztBQUNILGlDQUFpQztBQUNqQyw2Q0FBdUU7QUFHdkUsOERBQThEO0FBQzlELHdFQUF3RTtBQUN4RSxpRkFBaUY7QUFDakYsa0dBQWtHO0FBQ2xHLHFDQUFxQztBQUNyQyxpRkFBaUY7QUFDakYsU0FBZ0IsWUFBWSxDQUMxQixVQUF5QixFQUN6QixZQUF1QixFQUN2QixjQUFvQztJQUVwQyxNQUFNLEdBQUcsR0FBeUIsRUFBRSxDQUFDO0lBRXJDLElBQUksWUFBWSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7UUFDN0IsT0FBTyxFQUFFLENBQUM7S0FDWDtJQUVELE1BQU0sV0FBVyxHQUFHLGNBQWMsRUFBRSxDQUFDO0lBRXJDLDJDQUEyQztJQUMzQyxNQUFNLFdBQVcsR0FBRyxJQUFJLEdBQUcsRUFBYSxDQUFDO0lBQ3pDLE1BQU0sT0FBTyxHQUEyQixFQUFFLENBQUM7SUFFM0MsRUFBRSxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsU0FBUyxLQUFLLENBQUMsSUFBSTtRQUM3QyxxQkFBcUI7UUFDckIsSUFBSSxZQUFZLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQy9CLE9BQU87U0FDUjtRQUVELHlCQUF5QjtRQUN6QixJQUFJLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNoQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRW5CLE9BQU87U0FDUjtRQUVELElBQUksTUFBNkIsQ0FBQztRQUVsQyxRQUFRLElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDakIsS0FBSyxFQUFFLENBQUMsVUFBVSxDQUFDLFVBQVU7Z0JBQzNCLE1BQU0sR0FBRyxX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QUU7Z0JBQ3hDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxnQ0FBbUIsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQzthQUNyRDtpQkFBTTtnQkFDTCxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsWUFBWSxDQUFDLENBQUM7YUFDM0I7U0FDRjtLQUNGO0lBRUQsT0FBTyxHQUFHLENBQUM7QUFDYixDQUFDO0FBbEhELG9DQWtIQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuaW1wb3J0IHsgUmVtb3ZlTm9kZU9wZXJhdGlvbiwgVHJhbnNmb3JtT3BlcmF0aW9uIH0gZnJvbSAnLi9pbnRlcmZhY2VzJztcblxuXG4vLyBSZW1vdmUgaW1wb3J0cyBmb3Igd2hpY2ggYWxsIGlkZW50aWZpZXJzIGhhdmUgYmVlbiByZW1vdmVkLlxuLy8gTmVlZHMgdHlwZSBjaGVja2VyLCBhbmQgd29ya3MgZXZlbiBpZiBpdCdzIG5vdCB0aGUgZmlyc3QgdHJhbnNmb3JtZXIuXG4vLyBXb3JrcyBieSByZW1vdmluZyBpbXBvcnRzIGZvciBzeW1ib2xzIHdob3NlIGlkZW50aWZpZXJzIGhhdmUgYWxsIGJlZW4gcmVtb3ZlZC5cbi8vIERvZXNuJ3QgdXNlIHRoZSBgc3ltYm9sLmRlY2xhcmF0aW9uc2AgYmVjYXVzZSB0aGF0IHByZXZpb3VzIHRyYW5zZm9ybXMgbWlnaHQgaGF2ZSByZW1vdmVkIG5vZGVzXG4vLyBidXQgdGhlIHR5cGUgY2hlY2tlciBkb2Vzbid0IGtub3cuXG4vLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL01pY3Jvc29mdC9UeXBlU2NyaXB0L2lzc3Vlcy8xNzU1MiBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbmV4cG9ydCBmdW5jdGlvbiBlbGlkZUltcG9ydHMoXG4gIHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUsXG4gIHJlbW92ZWROb2RlczogdHMuTm9kZVtdLFxuICBnZXRUeXBlQ2hlY2tlcjogKCkgPT4gdHMuVHlwZUNoZWNrZXIsXG4pOiBUcmFuc2Zvcm1PcGVyYXRpb25bXSB7XG4gIGNvbnN0IG9wczogVHJhbnNmb3JtT3BlcmF0aW9uW10gPSBbXTtcblxuICBpZiAocmVtb3ZlZE5vZGVzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIGNvbnN0IHR5cGVDaGVja2VyID0gZ2V0VHlwZUNoZWNrZXIoKTtcblxuICAvLyBDb2xsZWN0IGFsbCBpbXBvcnRzIGFuZCB1c2VkIGlkZW50aWZpZXJzXG4gIGNvbnN0IHVzZWRTeW1ib2xzID0gbmV3IFNldDx0cy5TeW1ib2w+KCk7XG4gIGNvbnN0IGltcG9ydHM6IHRzLkltcG9ydERlY2xhcmF0aW9uW10gPSBbXTtcblxuICB0cy5mb3JFYWNoQ2hpbGQoc291cmNlRmlsZSwgZnVuY3Rpb24gdmlzaXQobm9kZSkge1xuICAgIC8vIFNraXAgcmVtb3ZlZCBub2Rlc1xuICAgIGlmIChyZW1vdmVkTm9kZXMuaW5jbHVkZXMobm9kZSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBSZWNvcmQgaW1wb3J0IGFuZCBza2lwXG4gICAgaWYgKHRzLmlzSW1wb3J0RGVjbGFyYXRpb24obm9kZSkpIHtcbiAgICAgIGltcG9ydHMucHVzaChub2RlKTtcblxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBzeW1ib2w6IHRzLlN5bWJvbCB8IHVuZGVmaW5lZDtcblxuICAgIHN3aXRjaCAobm9kZS5raW5kKSB7XG4gICAgICBjYXNlIHRzLlN5bnRheEtpbmQuSWRlbnRpZmllcjpcbiAgICAgICAgc3ltYm9sID0gdHlwZUNoZWNrZXIuZ2V0U3ltYm9sQXRMb2NhdGlvbihub2RlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIHRzLlN5bnRheEtpbmQuRXhwb3J0U3BlY2lmaWVyOlxuICAgICAgICBzeW1ib2wgPSB0eXBlQ2hlY2tlci5nZXRFeHBvcnRTcGVjaWZpZXJMb2NhbFRhcmdldFN5bWJvbChub2RlIGFzIHRzLkV4cG9ydFNwZWNpZmllcik7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlNob3J0aGFuZFByb3BlcnR5QXNzaWdubWVudDpcbiAgICAgICAgc3ltYm9sID0gdHlwZUNoZWNrZXIuZ2V0U2hvcnRoYW5kQXNzaWdubWVudFZhbHVlU3ltYm9sKG5vZGUpO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICBpZiAoc3ltYm9sKSB7XG4gICAgICB1c2VkU3ltYm9scy5hZGQoc3ltYm9sKTtcbiAgICB9XG5cbiAgICB0cy5mb3JFYWNoQ2hpbGQobm9kZSwgdmlzaXQpO1xuICB9KTtcblxuICBpZiAoaW1wb3J0cy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICBjb25zdCBpc1VudXNlZCA9IChub2RlOiB0cy5JZGVudGlmaWVyKSA9PiB7XG4gICAgY29uc3Qgc3ltYm9sID0gdHlwZUNoZWNrZXIuZ2V0U3ltYm9sQXRMb2NhdGlvbihub2RlKTtcblxuICAgIHJldHVybiBzeW1ib2wgJiYgIXVzZWRTeW1ib2xzLmhhcyhzeW1ib2wpO1xuICB9O1xuXG4gIGZvciAoY29uc3Qgbm9kZSBvZiBpbXBvcnRzKSB7XG4gICAgaWYgKCFub2RlLmltcG9ydENsYXVzZSkge1xuICAgICAgLy8gXCJpbXBvcnQgJ2FiYyc7XCJcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGNvbnN0IG5hbWVkQmluZGluZ3MgPSBub2RlLmltcG9ydENsYXVzZS5uYW1lZEJpbmRpbmdzO1xuXG4gICAgaWYgKG5hbWVkQmluZGluZ3MgJiYgdHMuaXNOYW1lc3BhY2VJbXBvcnQobmFtZWRCaW5kaW5ncykpIHtcbiAgICAgIC8vIFwiaW1wb3J0ICogYXMgWFlaIGZyb20gJ2FiYyc7XCJcbiAgICAgIGlmIChpc1VudXNlZChuYW1lZEJpbmRpbmdzLm5hbWUpKSB7XG4gICAgICAgIG9wcy5wdXNoKG5ldyBSZW1vdmVOb2RlT3BlcmF0aW9uKHNvdXJjZUZpbGUsIG5vZGUpKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3Qgc3BlY2lmaWVyT3BzID0gW107XG4gICAgICBsZXQgY2xhdXNlc0NvdW50ID0gMDtcblxuICAgICAgLy8gXCJpbXBvcnQgeyBYWVosIC4uLiB9IGZyb20gJ2FiYyc7XCJcbiAgICAgIGlmIChuYW1lZEJpbmRpbmdzICYmIHRzLmlzTmFtZWRJbXBvcnRzKG5hbWVkQmluZGluZ3MpKSB7XG4gICAgICAgIGxldCByZW1vdmVkQ2xhdXNlc0NvdW50ID0gMDtcbiAgICAgICAgY2xhdXNlc0NvdW50ICs9IG5hbWVkQmluZGluZ3MuZWxlbWVudHMubGVuZ3RoO1xuXG4gICAgICAgIGZvciAoY29uc3Qgc3BlY2lmaWVyIG9mIG5hbWVkQmluZGluZ3MuZWxlbWVudHMpIHtcbiAgICAgICAgICBpZiAoaXNVbnVzZWQoc3BlY2lmaWVyLm5hbWUpKSB7XG4gICAgICAgICAgICByZW1vdmVkQ2xhdXNlc0NvdW50Kys7XG4gICAgICAgICAgICAvLyBpbiBjYXNlIHdlIGRvbid0IGhhdmUgYW55IG1vcmUgbmFtZWRJbXBvcnRzIHdlIHNob3VsZCByZW1vdmUgdGhlIHBhcmVudCBpZSB0aGUge31cbiAgICAgICAgICAgIGNvbnN0IG5vZGVUb1JlbW92ZSA9IGNsYXVzZXNDb3VudCA9PT0gcmVtb3ZlZENsYXVzZXNDb3VudFxuICAgICAgICAgICAgICA/IHNwZWNpZmllci5wYXJlbnRcbiAgICAgICAgICAgICAgOiBzcGVjaWZpZXI7XG5cbiAgICAgICAgICAgIHNwZWNpZmllck9wcy5wdXNoKG5ldyBSZW1vdmVOb2RlT3BlcmF0aW9uKHNvdXJjZUZpbGUsIG5vZGVUb1JlbW92ZSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBcImltcG9ydCBYWVogZnJvbSAnYWJjJztcIlxuICAgICAgaWYgKG5vZGUuaW1wb3J0Q2xhdXNlLm5hbWUpIHtcbiAgICAgICAgY2xhdXNlc0NvdW50Kys7XG5cbiAgICAgICAgaWYgKGlzVW51c2VkKG5vZGUuaW1wb3J0Q2xhdXNlLm5hbWUpKSB7XG4gICAgICAgICAgc3BlY2lmaWVyT3BzLnB1c2gobmV3IFJlbW92ZU5vZGVPcGVyYXRpb24oc291cmNlRmlsZSwgbm9kZS5pbXBvcnRDbGF1c2UubmFtZSkpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChzcGVjaWZpZXJPcHMubGVuZ3RoID09PSBjbGF1c2VzQ291bnQpIHtcbiAgICAgICAgb3BzLnB1c2gobmV3IFJlbW92ZU5vZGVPcGVyYXRpb24oc291cmNlRmlsZSwgbm9kZSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb3BzLnB1c2goLi4uc3BlY2lmaWVyT3BzKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gb3BzO1xufVxuIl19