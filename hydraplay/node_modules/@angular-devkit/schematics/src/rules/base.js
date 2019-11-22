"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const exception_1 = require("../exception/exception");
const filtered_1 = require("../tree/filtered");
const host_tree_1 = require("../tree/host-tree");
const interface_1 = require("../tree/interface");
const scoped_1 = require("../tree/scoped");
const static_1 = require("../tree/static");
const virtual_1 = require("../tree/virtual");
const call_1 = require("./call");
/**
 * A Source that returns an tree as its single value.
 */
function source(tree) {
    return () => tree;
}
exports.source = source;
/**
 * A source that returns an empty tree.
 */
function empty() {
    return () => static_1.empty();
}
exports.empty = empty;
/**
 * Chain multiple rules into a single rule.
 */
function chain(rules) {
    return (tree, context) => {
        return rules.reduce((acc, curr) => {
            return call_1.callRule(curr, acc, context);
        }, rxjs_1.of(tree));
    };
}
exports.chain = chain;
/**
 * Apply multiple rules to a source, and returns the source transformed.
 */
function apply(source, rules) {
    return (context) => {
        return call_1.callRule(chain([
            ...rules,
            // Optimize the tree. Since this is a source tree, there's not much harm here and this might
            // avoid further issues.
            tree => {
                if (tree instanceof virtual_1.VirtualTree) {
                    tree.optimize();
                    return tree;
                }
                else if (tree.actions.length != 0) {
                    return static_1.optimize(tree);
                }
                else {
                    return tree;
                }
            },
        ]), call_1.callSource(source, context), context);
    };
}
exports.apply = apply;
/**
 * Merge an input tree with the source passed in.
 */
function mergeWith(source, strategy = interface_1.MergeStrategy.Default) {
    return (tree, context) => {
        const result = call_1.callSource(source, context);
        return result.pipe(operators_1.map(other => static_1.merge(tree, other, strategy || context.strategy)));
    };
}
exports.mergeWith = mergeWith;
function noop() {
    return (tree, _context) => tree;
}
exports.noop = noop;
function filter(predicate) {
    return ((tree) => {
        // TODO: Remove VirtualTree usage in 7.0
        if (virtual_1.VirtualTree.isVirtualTree(tree)) {
            return new filtered_1.FilteredTree(tree, predicate);
        }
        else if (host_tree_1.HostTree.isHostTree(tree)) {
            return new host_tree_1.FilterHostTree(tree, predicate);
        }
        else {
            throw new exception_1.SchematicsException('Tree type is not supported.');
        }
    });
}
exports.filter = filter;
function asSource(rule) {
    return apply(empty(), [rule]);
}
exports.asSource = asSource;
function branchAndMerge(rule, strategy = interface_1.MergeStrategy.Default) {
    return (tree, context) => {
        const branchedTree = static_1.branch(tree);
        return call_1.callRule(rule, rxjs_1.of(branchedTree), context)
            .pipe(operators_1.last(), operators_1.map(t => static_1.merge(tree, t, strategy)));
    };
}
exports.branchAndMerge = branchAndMerge;
function when(predicate, operator) {
    return (entry) => {
        if (predicate(entry.path, entry)) {
            return operator(entry);
        }
        else {
            return entry;
        }
    };
}
exports.when = when;
function partitionApplyMerge(predicate, ruleYes, ruleNo) {
    return (tree, context) => {
        const [yes, no] = static_1.partition(tree, predicate);
        if (!ruleNo) {
            // Shortcut.
            return call_1.callRule(ruleYes, rxjs_1.of(static_1.partition(tree, predicate)[0]), context)
                .pipe(operators_1.map(yesTree => static_1.merge(yesTree, no, context.strategy)));
        }
        return call_1.callRule(ruleYes, rxjs_1.of(yes), context)
            .pipe(operators_1.concatMap(yesTree => {
            return call_1.callRule(ruleNo, rxjs_1.of(no), context)
                .pipe(operators_1.map(noTree => static_1.merge(yesTree, noTree, context.strategy)));
        }));
    };
}
exports.partitionApplyMerge = partitionApplyMerge;
function forEach(operator) {
    return (tree) => {
        tree.visit((path, entry) => {
            if (!entry) {
                return;
            }
            const newEntry = operator(entry);
            if (newEntry === entry) {
                return;
            }
            if (newEntry === null) {
                tree.delete(path);
                return;
            }
            if (newEntry.path != path) {
                tree.rename(path, newEntry.path);
            }
            if (!newEntry.content.equals(entry.content)) {
                tree.overwrite(newEntry.path, newEntry.content);
            }
        });
        return tree;
    };
}
exports.forEach = forEach;
function composeFileOperators(operators) {
    return (entry) => {
        let current = entry;
        for (const op of operators) {
            current = op(current);
            if (current === null) {
                // Deleted, just return.
                return null;
            }
        }
        return current;
    };
}
exports.composeFileOperators = composeFileOperators;
function applyToSubtree(path, rules) {
    return (tree, context) => {
        const scoped = new scoped_1.ScopedTree(tree, path);
        return call_1.callRule(chain(rules), rxjs_1.of(scoped), context).pipe(operators_1.map(result => {
            if (result === scoped) {
                return tree;
            }
            else {
                throw new exception_1.SchematicsException('Original tree must be returned from all rules when using "applyToSubtree".');
            }
        }));
    };
}
exports.applyToSubtree = applyToSubtree;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsicGFja2FnZXMvYW5ndWxhcl9kZXZraXQvc2NoZW1hdGljcy9zcmMvcnVsZXMvYmFzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7R0FNRztBQUNILCtCQUFzRDtBQUN0RCw4Q0FBc0Q7QUFFdEQsc0RBQTZEO0FBQzdELCtDQUFnRDtBQUNoRCxpREFBNkQ7QUFDN0QsaURBQWtGO0FBQ2xGLDJDQUE0QztBQUM1QywyQ0FNd0I7QUFDeEIsNkNBQThDO0FBQzlDLGlDQUE4QztBQUc5Qzs7R0FFRztBQUNILFNBQWdCLE1BQU0sQ0FBQyxJQUFVO0lBQy9CLE9BQU8sR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDO0FBQ3BCLENBQUM7QUFGRCx3QkFFQztBQUdEOztHQUVHO0FBQ0gsU0FBZ0IsS0FBSztJQUNuQixPQUFPLEdBQUcsRUFBRSxDQUFDLGNBQVcsRUFBRSxDQUFDO0FBQzdCLENBQUM7QUFGRCxzQkFFQztBQUdEOztHQUVHO0FBQ0gsU0FBZ0IsS0FBSyxDQUFDLEtBQWE7SUFDakMsT0FBTyxDQUFDLElBQVUsRUFBRSxPQUF5QixFQUFFLEVBQUU7UUFDL0MsT0FBTyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBcUIsRUFBRSxJQUFVLEVBQUUsRUFBRTtZQUN4RCxPQUFPLGVBQVEsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3RDLENBQUMsRUFBRSxTQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUN6QixDQUFDLENBQUM7QUFDSixDQUFDO0FBTkQsc0JBTUM7QUFHRDs7R0FFRztBQUNILFNBQWdCLEtBQUssQ0FBQyxNQUFjLEVBQUUsS0FBYTtJQUNqRCxPQUFPLENBQUMsT0FBeUIsRUFBRSxFQUFFO1FBQ25DLE9BQU8sZUFBUSxDQUFDLEtBQUssQ0FBQztZQUNwQixHQUFHLEtBQUs7WUFDUiw0RkFBNEY7WUFDNUYsd0JBQXdC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LENBQUMsQ0FBQztBQUNKLENBQUM7QUFkRCxvREFjQztBQUVELFNBQWdCLGNBQWMsQ0FBQyxJQUFZLEVBQUUsS0FBYTtJQUN4RCxPQUFPLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUFFO1FBQ3ZCLE1BQU0sTUFBTSxHQUFHLElBQUksbUJBQVUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFMUMsT0FBTyxlQUFRLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFLFNBQVksQ0FBQyxNQUFNLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQy9ELGVBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUNYLElBQUksTUFBTSxLQUFLLE1BQU0sRUFBRTtnQkFDckIsT0FBTyxJQUFJLENBQUM7YUFDYjtpQkFBTTtnQkFDTCxNQUFNLElBQUksK0JBQW1CLENBQzNCLDRFQUE0RSxDQUM3RSxDQUFDO2FBQ0g7UUFDSCxDQUFDLENBQUMsQ0FDSCxDQUFDO0lBQ0osQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQWhCRCx3Q0FnQkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBvZiBhcyBvYnNlcnZhYmxlT2YgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IGNvbmNhdE1hcCwgbGFzdCwgbWFwIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHsgRmlsZU9wZXJhdG9yLCBSdWxlLCBTY2hlbWF0aWNDb250ZXh0LCBTb3VyY2UgfSBmcm9tICcuLi9lbmdpbmUvaW50ZXJmYWNlJztcbmltcG9ydCB7IFNjaGVtYXRpY3NFeGNlcHRpb24gfSBmcm9tICcuLi9leGNlcHRpb24vZXhjZXB0aW9uJztcbmltcG9ydCB7IEZpbHRlcmVkVHJlZSB9IGZyb20gJy4uL3RyZWUvZmlsdGVyZWQnO1xuaW1wb3J0IHsgRmlsdGVySG9zdFRyZWUsIEhvc3RUcmVlIH0gZnJvbSAnLi4vdHJlZS9ob3N0LXRyZWUnO1xuaW1wb3J0IHsgRmlsZUVudHJ5LCBGaWxlUHJlZGljYXRlLCBNZXJnZVN0cmF0ZWd5LCBUcmVlIH0gZnJvbSAnLi4vdHJlZS9pbnRlcmZhY2UnO1xuaW1wb3J0IHsgU2NvcGVkVHJlZSB9IGZyb20gJy4uL3RyZWUvc2NvcGVkJztcbmltcG9ydCB7XG4gIGJyYW5jaCxcbiAgZW1wdHkgYXMgc3RhdGljRW1wdHksXG4gIG1lcmdlIGFzIHN0YXRpY01lcmdlLFxuICBvcHRpbWl6ZSBhcyBzdGF0aWNPcHRpbWl6ZSxcbiAgcGFydGl0aW9uIGFzIHN0YXRpY1BhcnRpdGlvbixcbn0gZnJvbSAnLi4vdHJlZS9zdGF0aWMnO1xuaW1wb3J0IHsgVmlydHVhbFRyZWUgfSBmcm9tICcuLi90cmVlL3ZpcnR1YWwnO1xuaW1wb3J0IHsgY2FsbFJ1bGUsIGNhbGxTb3VyY2UgfSBmcm9tICcuL2NhbGwnO1xuXG5cbi8qKlxuICogQSBTb3VyY2UgdGhhdCByZXR1cm5zIGFuIHRyZWUgYXMgaXRzIHNpbmdsZSB2YWx1ZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNvdXJjZSh0cmVlOiBUcmVlKTogU291cmNlIHtcbiAgcmV0dXJuICgpID0+IHRyZWU7XG59XG5cblxuLyoqXG4gKiBBIHNvdXJjZSB0aGF0IHJldHVybnMgYW4gZW1wdHkgdHJlZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVtcHR5KCk6IFNvdXJjZSB7XG4gIHJldHVybiAoKSA9PiBzdGF0aWNFbXB0eSgpO1xufVxuXG5cbi8qKlxuICogQ2hhaW4gbXVsdGlwbGUgcnVsZXMgaW50byBhIHNpbmdsZSBydWxlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY2hhaW4ocnVsZXM6IFJ1bGVbXSk6IFJ1bGUge1xuICByZXR1cm4gKHRyZWU6IFRyZWUsIGNvbnRleHQ6IFNjaGVtYXRpY0NvbnRleHQpID0+IHtcbiAgICByZXR1cm4gcnVsZXMucmVkdWNlKChhY2M6IE9ic2VydmFibGU8VHJlZT4sIGN1cnI6IFJ1bGUpID0+IHtcbiAgICAgIHJldHVybiBjYWxsUnVsZShjdXJyLCBhY2MsIGNvbnRleHQpO1xuICAgIH0sIG9ic2VydmFibGVPZih0cmVlKSk7XG4gIH07XG59XG5cblxuLyoqXG4gKiBBcHBseSBtdWx0aXBsZSBydWxlcyB0byBhIHNvdXJjZSwgYW5kIHJldHVybnMgdGhlIHNvdXJjZSB0cmFuc2Zvcm1lZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5KHNvdXJjZTogU291cmNlLCBydWxlczogUnVsZVtdKTogU291cmNlIHtcbiAgcmV0dXJuIChjb250ZXh0OiBTY2hlbWF0aWNDb250ZXh0KSA9PiB7XG4gICAgcmV0dXJuIGNhbGxSdWxlKGNoYWluKFtcbiAgICAgIC4uLnJ1bGVzLFxuICAgICAgLy8gT3B0aW1pemUgdGhlIHRyZWUuIFNpbmNlIHRoaXMgaXMgYSBzb3VyY2UgdHJlZSwgdGhlcmUncyBub3QgbXVjaCBoYXJtIGhlcmUgYW5kIHRoaXMgbWlnaHRcbiAgICAgIC8vIGF2b2lkIGZ1cnRoZXIgaXNzdWVzLlxuICAgICAgdHJlZSA9PiB7XG4gICAgICAgIGlmICh0cmVlIGluc3RhbmNlb2YgVmlydHVhbFRyZWUpIHtcbiAgICAgICAgICB0cmVlLm9wdGltaXplKCk7XG5cbiAgICAgICAgICByZXR1cm4gdHJlZTtcbiAgICAgICAgfSBlbHNlIGlmICh0cmVlLmFjdGlvbnMubGVuZ3RoICE9IDApIHtcbiAgICAgICAgICByZXR1cm4gc3RhdGljT3B0aW1pemUodHJlZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRyZWU7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgXSksIGNhbGxTb3VyY2Uoc291cmNlLCBjb250ZXh0KSwgY29udGV4dCk7XG4gIH07XG59XG5cblxuLyoqXG4gKiBNZXJnZSBhbiBpbnB1dCB0cmVlIHdpdGggdGhlIHNvdXJjZSBwYXNzZWQgaW4uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtZXJnZVdpdGgoc291cmNlOiBTb3VyY2UsIHN0cmF0ZWd5OiBNZXJnZVN0cmF0ZWd5ID0gTWVyZ2VTdHJhdGVneS5EZWZhdWx0KTogUnVsZSB7XG4gIHJldHVybiAodHJlZTogVHJlZSwgY29udGV4dDogU2NoZW1hdGljQ29udGV4dCkgPT4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IGNhbGxTb3VyY2Uoc291cmNlLCBjb250ZXh0KTtcblxuICAgIHJldHVybiByZXN1bHQucGlwZShtYXAob3RoZXIgPT4gc3RhdGljTWVyZ2UodHJlZSwgb3RoZXIsIHN0cmF0ZWd5IHx8IGNvbnRleHQuc3RyYXRlZ3kpKSk7XG4gIH07XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIG5vb3AoKTogUnVsZSB7XG4gIHJldHVybiAodHJlZTogVHJlZSwgX2NvbnRleHQ6IFNjaGVtYXRpY0NvbnRleHQpID0+IHRyZWU7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGZpbHRlcihwcmVkaWNhdGU6IEZpbGVQcmVkaWNhdGU8Ym9vbGVhbj4pOiBSdWxlIHtcbiAgcmV0dXJuICgodHJlZTogVHJlZSkgPT4ge1xuICAgIC8vIFRPRE86IFJlbW92ZSBWaXJ0dWFsVHJlZSB1c2FnZSBpbiA3LjBcbiAgICBpZiAoVmlydHVhbFRyZWUuaXNWaXJ0dWFsVHJlZSh0cmVlKSkge1xuICAgICAgcmV0dXJuIG5ldyBGaWx0ZXJlZFRyZWUodHJlZSwgcHJlZGljYXRlKTtcbiAgICB9IGVsc2UgaWYgKEhvc3RUcmVlLmlzSG9zdFRyZWUodHJlZSkpIHtcbiAgICAgIHJldHVybiBuZXcgRmlsdGVySG9zdFRyZWUodHJlZSwgcHJlZGljYXRlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IFNjaGVtYXRpY3NFeGNlcHRpb24oJ1RyZWUgdHlwZSBpcyBub3Qgc3VwcG9ydGVkLicpO1xuICAgIH1cbiAgfSk7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGFzU291cmNlKHJ1bGU6IFJ1bGUpOiBTb3VyY2Uge1xuICByZXR1cm4gYXBwbHkoZW1wdHkoKSwgW3J1bGVdKTtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gYnJhbmNoQW5kTWVyZ2UocnVsZTogUnVsZSwgc3RyYXRlZ3kgPSBNZXJnZVN0cmF0ZWd5LkRlZmF1bHQpOiBSdWxlIHtcbiAgcmV0dXJuICh0cmVlOiBUcmVlLCBjb250ZXh0OiBTY2hlbWF0aWNDb250ZXh0KSA9PiB7XG4gICAgY29uc3QgYnJhbmNoZWRUcmVlID0gYnJhbmNoKHRyZWUpO1xuXG4gICAgcmV0dXJuIGNhbGxSdWxlKHJ1bGUsIG9ic2VydmFibGVPZihicmFuY2hlZFRyZWUpLCBjb250ZXh0KVxuICAgICAgLnBpcGUoXG4gICAgICAgIGxhc3QoKSxcbiAgICAgICAgbWFwKHQgPT4gc3RhdGljTWVyZ2UodHJlZSwgdCwgc3RyYXRlZ3kpKSxcbiAgICAgICk7XG4gIH07XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHdoZW4ocHJlZGljYXRlOiBGaWxlUHJlZGljYXRlPGJvb2xlYW4+LCBvcGVyYXRvcjogRmlsZU9wZXJhdG9yKTogRmlsZU9wZXJhdG9yIHtcbiAgcmV0dXJuIChlbnRyeTogRmlsZUVudHJ5KSA9PiB7XG4gICAgaWYgKHByZWRpY2F0ZShlbnRyeS5wYXRoLCBlbnRyeSkpIHtcbiAgICAgIHJldHVybiBvcGVyYXRvcihlbnRyeSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBlbnRyeTtcbiAgICB9XG4gIH07XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnRpdGlvbkFwcGx5TWVyZ2UoXG4gIHByZWRpY2F0ZTogRmlsZVByZWRpY2F0ZTxib29sZWFuPixcbiAgcnVsZVllczogUnVsZSxcbiAgcnVsZU5vPzogUnVsZSxcbik6IFJ1bGUge1xuICByZXR1cm4gKHRyZWU6IFRyZWUsIGNvbnRleHQ6IFNjaGVtYXRpY0NvbnRleHQpID0+IHtcbiAgICBjb25zdCBbeWVzLCBub10gPSBzdGF0aWNQYXJ0aXRpb24odHJlZSwgcHJlZGljYXRlKTtcblxuICAgIGlmICghcnVsZU5vKSB7XG4gICAgICAvLyBTaG9ydGN1dC5cbiAgICAgIHJldHVybiBjYWxsUnVsZShydWxlWWVzLCBvYnNlcnZhYmxlT2Yoc3RhdGljUGFydGl0aW9uKHRyZWUsIHByZWRpY2F0ZSlbMF0pLCBjb250ZXh0KVxuICAgICAgICAucGlwZShtYXAoeWVzVHJlZSA9PiBzdGF0aWNNZXJnZSh5ZXNUcmVlLCBubywgY29udGV4dC5zdHJhdGVneSkpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY2FsbFJ1bGUocnVsZVllcywgb2JzZXJ2YWJsZU9mKHllcyksIGNvbnRleHQpXG4gICAgICAucGlwZShjb25jYXRNYXAoeWVzVHJlZSA9PiB7XG4gICAgICAgIHJldHVybiBjYWxsUnVsZShydWxlTm8sIG9ic2VydmFibGVPZihubyksIGNvbnRleHQpXG4gICAgICAgICAgLnBpcGUobWFwKG5vVHJlZSA9PiBzdGF0aWNNZXJnZSh5ZXNUcmVlLCBub1RyZWUsIGNvbnRleHQuc3RyYXRlZ3kpKSk7XG4gICAgICB9KSk7XG4gIH07XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGZvckVhY2gob3BlcmF0b3I6IEZpbGVPcGVyYXRvcik6IFJ1bGUge1xuICByZXR1cm4gKHRyZWU6IFRyZWUpID0+IHtcbiAgICB0cmVlLnZpc2l0KChwYXRoLCBlbnRyeSkgPT4ge1xuICAgICAgaWYgKCFlbnRyeSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCBuZXdFbnRyeSA9IG9wZXJhdG9yKGVudHJ5KTtcbiAgICAgIGlmIChuZXdFbnRyeSA9PT0gZW50cnkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKG5ld0VudHJ5ID09PSBudWxsKSB7XG4gICAgICAgIHRyZWUuZGVsZXRlKHBhdGgpO1xuXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmIChuZXdFbnRyeS5wYXRoICE9IHBhdGgpIHtcbiAgICAgICAgdHJlZS5yZW5hbWUocGF0aCwgbmV3RW50cnkucGF0aCk7XG4gICAgICB9XG4gICAgICBpZiAoIW5ld0VudHJ5LmNvbnRlbnQuZXF1YWxzKGVudHJ5LmNvbnRlbnQpKSB7XG4gICAgICAgIHRyZWUub3ZlcndyaXRlKG5ld0VudHJ5LnBhdGgsIG5ld0VudHJ5LmNvbnRlbnQpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRyZWU7XG4gIH07XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbXBvc2VGaWxlT3BlcmF0b3JzKG9wZXJhdG9yczogRmlsZU9wZXJhdG9yW10pOiBGaWxlT3BlcmF0b3Ige1xuICByZXR1cm4gKGVudHJ5OiBGaWxlRW50cnkpID0+IHtcbiAgICBsZXQgY3VycmVudDogRmlsZUVudHJ5IHwgbnVsbCA9IGVudHJ5O1xuICAgIGZvciAoY29uc3Qgb3Agb2Ygb3BlcmF0b3JzKSB7XG4gICAgICBjdXJyZW50ID0gb3AoY3VycmVudCk7XG5cbiAgICAgIGlmIChjdXJyZW50ID09PSBudWxsKSB7XG4gICAgICAgIC8vIERlbGV0ZWQsIGp1c3QgcmV0dXJuLlxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gY3VycmVudDtcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5VG9TdWJ0cmVlKHBhdGg6IHN0cmluZywgcnVsZXM6IFJ1bGVbXSk6IFJ1bGUge1xuICByZXR1cm4gKHRyZWUsIGNvbnRleHQpID0+IHtcbiAgICBjb25zdCBzY29wZWQgPSBuZXcgU2NvcGVkVHJlZSh0cmVlLCBwYXRoKTtcblxuICAgIHJldHVybiBjYWxsUnVsZShjaGFpbihydWxlcyksIG9ic2VydmFibGVPZihzY29wZWQpLCBjb250ZXh0KS5waXBlKFxuICAgICAgbWFwKHJlc3VsdCA9PiB7XG4gICAgICAgIGlmIChyZXN1bHQgPT09IHNjb3BlZCkge1xuICAgICAgICAgIHJldHVybiB0cmVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBTY2hlbWF0aWNzRXhjZXB0aW9uKFxuICAgICAgICAgICAgJ09yaWdpbmFsIHRyZWUgbXVzdCBiZSByZXR1cm5lZCBmcm9tIGFsbCBydWxlcyB3aGVuIHVzaW5nIFwiYXBwbHlUb1N1YnRyZWVcIi4nLFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH0pLFxuICAgICk7XG4gIH07XG59XG4iXX0=