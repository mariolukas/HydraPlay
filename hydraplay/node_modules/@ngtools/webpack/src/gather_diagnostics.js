"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const benchmark_1 = require("./benchmark");
var DiagnosticMode;
(function (DiagnosticMode) {
    DiagnosticMode[DiagnosticMode["Syntactic"] = 1] = "Syntactic";
    DiagnosticMode[DiagnosticMode["Semantic"] = 2] = "Semantic";
    DiagnosticMode[DiagnosticMode["All"] = 3] = "All";
    DiagnosticMode[DiagnosticMode["Default"] = 3] = "Default";
})(DiagnosticMode = exports.DiagnosticMode || (exports.DiagnosticMode = {}));
class CancellationToken {
    constructor() {
        this._isCancelled = false;
    }
    requestCancellation() {
        this._isCancelled = true;
    }
    isCancellationRequested() {
        return this._isCancelled;
    }
    throwIfCancellationRequested() {
        if (this.isCancellationRequested()) {
            throw new ts.OperationCanceledException();
        }
    }
}
exports.CancellationToken = CancellationToken;
function hasErrors(diags) {
    return diags.some(d => d.category === ts.DiagnosticCategory.Error);
}
exports.hasErrors = hasErrors;
function gatherDiagnostics(program, jitMode, benchmarkLabel, mode = DiagnosticMode.All, cancellationToken) {
    const allDiagnostics = [];
    let checkOtherDiagnostics = true;
    function checkDiagnostics(fn) {
        if (checkOtherDiagnostics) {
            const diags = fn(undefined, cancellationToken);
            if (diags) {
                allDiagnostics.push(...diags);
                checkOtherDiagnostics = !hasErrors(diags);
            }
        }
    }
    const gatherSyntacticDiagnostics = (mode & DiagnosticMode.Syntactic) != 0;
    const gatherSemanticDiagnostics = (mode & DiagnosticMode.Semantic) != 0;
    if (jitMode) {
        const tsProgram = program;
        if (gatherSyntacticDiagnostics) {
            // Check syntactic diagnostics.
            benchmark_1.time(`${benchmarkLabel}.gatherDiagnostics.ts.getSyntacticDiagnostics`);
            checkDiagnostics(tsProgram.getSyntacticDiagnostics.bind(tsProgram));
            benchmark_1.timeEnd(`${benchmarkLabel}.gatherDiagnostics.ts.getSyntacticDiagnostics`);
        }
        if (gatherSemanticDiagnostics) {
            // Check semantic diagnostics.
            benchmark_1.time(`${benchmarkLabel}.gatherDiagnostics.ts.getSemanticDiagnostics`);
            checkDiagnostics(tsProgram.getSemanticDiagnostics.bind(tsProgram));
            benchmark_1.timeEnd(`${benchmarkLabel}.gatherDiagnostics.ts.getSemanticDiagnostics`);
        }
    }
    else {
        const angularProgram = program;
        if (gatherSyntacticDiagnostics) {
            // Check TypeScript syntactic diagnostics.
            benchmark_1.time(`${benchmarkLabel}.gatherDiagnostics.ng.getTsSyntacticDiagnostics`);
            checkDiagnostics(angularProgram.getTsSyntacticDiagnostics.bind(angularProgram));
            benchmark_1.timeEnd(`${benchmarkLabel}.gatherDiagnostics.ng.getTsSyntacticDiagnostics`);
        }
        if (gatherSemanticDiagnostics) {
            // Check TypeScript semantic and Angular structure diagnostics.
            benchmark_1.time(`${benchmarkLabel}.gatherDiagnostics.ng.getTsSemanticDiagnostics`);
            checkDiagnostics(angularProgram.getTsSemanticDiagnostics.bind(angularProgram));
            benchmark_1.timeEnd(`${benchmarkLabel}.gatherDiagnostics.ng.getTsSemanticDiagnostics`);
            // Check Angular semantic diagnostics
            benchmark_1.time(`${benchmarkLabel}.gatherDiagnostics.ng.getNgSemanticDiagnostics`);
            checkDiagnostics(angularProgram.getNgSemanticDiagnostics.bind(angularProgram));
            benchmark_1.timeEnd(`${benchmarkLabel}.gatherDiagnostics.ng.getNgSemanticDiagnostics`);
        }
    }
    return allDiagnostics;
}
exports.gatherDiagnostics = gatherDiagnostics;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2F0aGVyX2RpYWdub3N0aWNzLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJwYWNrYWdlcy9uZ3Rvb2xzL3dlYnBhY2svc3JjL2dhdGhlcl9kaWFnbm9zdGljcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQVFBLGlDQUFpQztBQUNqQywyQ0FBNEM7QUFFNUMsSUFBWSxjQU1YO0FBTkQsV0FBWSxjQUFjO0lBQ3hCLDZEQUFrQixDQUFBO0lBQ2xCLDJEQUFpQixDQUFBO0lBRWpCLGlEQUEwQixDQUFBO0lBQzFCLHlEQUFhLENBQUE7QUFDZixDQUFDLEVBTlcsY0FBYyxHQUFkLHNCQUFjLEtBQWQsc0JBQWMsUUFNekI7QUFFRCxNQUFhLGlCQUFpQjtJQUE5QjtRQUNVLGlCQUFZLEdBQUcsS0FBSyxDQUFDO0lBZS9CLENBQUM7SUFiQyxtQkFBbUI7UUFDakIsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7SUFDM0IsQ0FBQztJQUVELHVCQUF1QjtRQUNyQixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUM7SUFDM0IsQ0FBQztJQUVELDRCQUE0QjtRQUMxQixJQUFJLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxFQUFFO1lBQ2xDLE1BQU0sSUFBSSxFQUFFLENBQUMsMEJBQTBCLEVBQUUsQ0FBQztTQUMzQztJQUNILENBQUM7Q0FDRjtBQWhCRCw4Q0FnQkM7QUFFRCxTQUFnQixTQUFTLENBQUMsS0FBa0I7SUFDMUMsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsS0FBSyxFQUFFLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDckUsQ0FBQztBQUZELDhCQUVDO0FBRUQsU0FBZ0IsaUJBQWlCLENBQy9CLE9BQTZCLEVBQzdCLE9BQWdCLEVBQ2hCLGNBQXNCLEVBQ3RCLElBQUksR0FBRyxjQUFjLENBQUMsR0FBRyxFQUN6QixpQkFBcUM7SUFFckMsTUFBTSxjQUFjLEdBQXNDLEVBQUUsQ0FBQztJQUM3RCxJQUFJLHFCQUFxQixHQUFHLElBQUksQ0FBQztJQUVqQyxTQUFTLGdCQUFnQixDQUFxQixFQUFLO1FBQ2pELElBQUkscUJBQXFCLEVBQUU7WUFDekIsTUFBTSxLQUFLLEdBQUcsRUFBRSxDQUFDLFNBQVMsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1lBQy9DLElBQUksS0FBSyxFQUFFO2dCQUNULGNBQWMsQ0FBQyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQztnQkFFOUIscUJBQXFCLEdBQUcsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDM0M7U0FDRjtJQUNILENBQUM7SUFFRCxNQUFNLDBCQUEwQixHQUFHLENBQUMsSUFBSSxHQUFHLGNBQWMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDMUUsTUFBTSx5QkFBeUIsR0FBRyxDQUFDLElBQUksR0FBRyxjQUFjLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBRXhFLElBQUksT0FBTyxFQUFFO1FBQ1gsTUFBTSxTQUFTLEdBQUcsT0FBcUIsQ0FBQztRQUN4QyxJQUFJLDBCQUEwQixFQUFFO1lBQzlCLCtCQUErQjtZQUMvQixnQkFBSSxDQUFDLEdBQUcsY0FBYywrQ0FBK0MsQ0FBQyxDQUFDO1lBQ3ZFLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUNwRSxtQkFBTyxDQUFDLEdBQUcsY0FBYywrQ0FBK0MsQ0FBQyxDQUFDO1NBQzNFO1FBRUQsSUFBSSx5QkFBeUIsRUFBRTtZQUM3Qiw4QkFBOEI7WUFDOUIsZ0JBQUksQ0FBQyxHQUFHLGNBQWMsOENBQThDLENBQUMsQ0FBQztZQUN0RSxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDbkUsbUJBQU8sQ0FBQyxHQUFHLGNBQWMsOENBQThDLENBQUMsQ0FBQztTQUMxRTtLQUNGO1NBQU07UUFDTCxNQUFNLGNBQWMsR0FBRyxPQUFrQixDQUFDO1FBQzFDLElBQUksMEJBQTBCLEVBQUU7WUFDOUIsMENBQTBDO1lBQzFDLGdCQUFJLENBQUMsR0FBRyxjQUFjLGlEQUFpRCxDQUFDLENBQUM7WUFDekUsZ0JBQWdCLENBQUMsY0FBYyxDQUFDLHlCQUF5QixDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO1lBQ2hGLG1CQUFPLENBQUMsR0FBRyxjQUFjLGlEQUFpRCxDQUFDLENBQUM7U0FDN0U7UUFFRCxJQUFJLHlCQUF5QixFQUFFO1lBQzdCLCtEQUErRDtZQUMvRCxnQkFBSSxDQUFDLEdBQUcsY0FBYyxnREFBZ0QsQ0FBQyxDQUFDO1lBQ3hFLGdCQUFnQixDQUFDLGNBQWMsQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztZQUMvRSxtQkFBTyxDQUFDLEdBQUcsY0FBYyxnREFBZ0QsQ0FBQyxDQUFDO1lBRTNFLHFDQUFxQztZQUNyQyxnQkFBSSxDQUFDLEdBQUcsY0FBYyxnREFBZ0QsQ0FBQyxDQUFDO1lBQ3hFLGdCQUFnQixDQUFDLGNBQWMsQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztZQUMvRSxtQkFBTyxDQUFDLEdBQUcsY0FBYyxnREFBZ0QsQ0FBQyxDQUFDO1NBQzVFO0tBQ0Y7SUFFRCxPQUFPLGNBQWMsQ0FBQztBQUN4QixDQUFDO0FBOURELDhDQThEQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7IERpYWdub3N0aWMsIERpYWdub3N0aWNzLCBQcm9ncmFtIH0gZnJvbSAnQGFuZ3VsYXIvY29tcGlsZXItY2xpJztcbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuaW1wb3J0IHsgdGltZSwgdGltZUVuZCB9IGZyb20gJy4vYmVuY2htYXJrJztcblxuZXhwb3J0IGVudW0gRGlhZ25vc3RpY01vZGUge1xuICBTeW50YWN0aWMgPSAxIDw8IDAsXG4gIFNlbWFudGljID0gMSA8PCAxLFxuXG4gIEFsbCA9IFN5bnRhY3RpYyB8IFNlbWFudGljLFxuICBEZWZhdWx0ID0gQWxsLFxufVxuXG5leHBvcnQgY2xhc3MgQ2FuY2VsbGF0aW9uVG9rZW4gaW1wbGVtZW50cyB0cy5DYW5jZWxsYXRpb25Ub2tlbiB7XG4gIHByaXZhdGUgX2lzQ2FuY2VsbGVkID0gZmFsc2U7XG5cbiAgcmVxdWVzdENhbmNlbGxhdGlvbigpIHtcbiAgICB0aGlzLl9pc0NhbmNlbGxlZCA9IHRydWU7XG4gIH1cblxuICBpc0NhbmNlbGxhdGlvblJlcXVlc3RlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5faXNDYW5jZWxsZWQ7XG4gIH1cblxuICB0aHJvd0lmQ2FuY2VsbGF0aW9uUmVxdWVzdGVkKCkge1xuICAgIGlmICh0aGlzLmlzQ2FuY2VsbGF0aW9uUmVxdWVzdGVkKCkpIHtcbiAgICAgIHRocm93IG5ldyB0cy5PcGVyYXRpb25DYW5jZWxlZEV4Y2VwdGlvbigpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFzRXJyb3JzKGRpYWdzOiBEaWFnbm9zdGljcykge1xuICByZXR1cm4gZGlhZ3Muc29tZShkID0+IGQuY2F0ZWdvcnkgPT09IHRzLkRpYWdub3N0aWNDYXRlZ29yeS5FcnJvcik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnYXRoZXJEaWFnbm9zdGljcyhcbiAgcHJvZ3JhbTogdHMuUHJvZ3JhbSB8IFByb2dyYW0sXG4gIGppdE1vZGU6IGJvb2xlYW4sXG4gIGJlbmNobWFya0xhYmVsOiBzdHJpbmcsXG4gIG1vZGUgPSBEaWFnbm9zdGljTW9kZS5BbGwsXG4gIGNhbmNlbGxhdGlvblRva2VuPzogQ2FuY2VsbGF0aW9uVG9rZW4sXG4pOiBEaWFnbm9zdGljcyB7XG4gIGNvbnN0IGFsbERpYWdub3N0aWNzOiBBcnJheTx0cy5EaWFnbm9zdGljIHwgRGlhZ25vc3RpYz4gPSBbXTtcbiAgbGV0IGNoZWNrT3RoZXJEaWFnbm9zdGljcyA9IHRydWU7XG5cbiAgZnVuY3Rpb24gY2hlY2tEaWFnbm9zdGljczxUIGV4dGVuZHMgRnVuY3Rpb24+KGZuOiBUKSB7XG4gICAgaWYgKGNoZWNrT3RoZXJEaWFnbm9zdGljcykge1xuICAgICAgY29uc3QgZGlhZ3MgPSBmbih1bmRlZmluZWQsIGNhbmNlbGxhdGlvblRva2VuKTtcbiAgICAgIGlmIChkaWFncykge1xuICAgICAgICBhbGxEaWFnbm9zdGljcy5wdXNoKC4uLmRpYWdzKTtcblxuICAgICAgICBjaGVja090aGVyRGlhZ25vc3RpY3MgPSAhaGFzRXJyb3JzKGRpYWdzKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBjb25zdCBnYXRoZXJTeW50YWN0aWNEaWFnbm9zdGljcyA9IChtb2RlICYgRGlhZ25vc3RpY01vZGUuU3ludGFjdGljKSAhPSAwO1xuICBjb25zdCBnYXRoZXJTZW1hbnRpY0RpYWdub3N0aWNzID0gKG1vZGUgJiBEaWFnbm9zdGljTW9kZS5TZW1hbnRpYykgIT0gMDtcblxuICBpZiAoaml0TW9kZSkge1xuICAgIGNvbnN0IHRzUHJvZ3JhbSA9IHByb2dyYW0gYXMgdHMuUHJvZ3JhbTtcbiAgICBpZiAoZ2F0aGVyU3ludGFjdGljRGlhZ25vc3RpY3MpIHtcbiAgICAgIC8vIENoZWNrIHN5bnRhY3RpYyBkaWFnbm9zdGljcy5cbiAgICAgIHRpbWUoYCR7YmVuY2htYXJrTGFiZWx9LmdhdGhlckRpYWdub3N0aWNzLnRzLmdldFN5bnRhY3RpY0RpYWdub3N0aWNzYCk7XG4gICAgICBjaGVja0RpYWdub3N0aWNzKHRzUHJvZ3JhbS5nZXRTeW50YWN0aWNEaWFnbm9zdGljcy5iaW5kKHRzUHJvZ3JhbSkpO1xuICAgICAgdGltZUVuZChgJHtiZW5jaG1hcmtMYWJlbH0uZ2F0aGVyRGlhZ25vc3RpY3MudHMuZ2V0U3ludGFjdGljRGlhZ25vc3RpY3NgKTtcbiAgICB9XG5cbiAgICBpZiAoZ2F0aGVyU2VtYW50aWNEaWFnbm9zdGljcykge1xuICAgICAgLy8gQ2hlY2sgc2VtYW50aWMgZGlhZ25vc3RpY3MuXG4gICAgICB0aW1lKGAke2JlbmNobWFya0xhYmVsfS5nYXRoZXJEaWFnbm9zdGljcy50cy5nZXRTZW1hbnRpY0RpYWdub3N0aWNzYCk7XG4gICAgICBjaGVja0RpYWdub3N0aWNzKHRzUHJvZ3JhbS5nZXRTZW1hbnRpY0RpYWdub3N0aWNzLmJpbmQodHNQcm9ncmFtKSk7XG4gICAgICB0aW1lRW5kKGAke2JlbmNobWFya0xhYmVsfS5nYXRoZXJEaWFnbm9zdGljcy50cy5nZXRTZW1hbnRpY0RpYWdub3N0aWNzYCk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGNvbnN0IGFuZ3VsYXJQcm9ncmFtID0gcHJvZ3JhbSBhcyBQcm9ncmFtO1xuICAgIGlmIChnYXRoZXJTeW50YWN0aWNEaWFnbm9zdGljcykge1xuICAgICAgLy8gQ2hlY2sgVHlwZVNjcmlwdCBzeW50YWN0aWMgZGlhZ25vc3RpY3MuXG4gICAgICB0aW1lKGAke2JlbmNobWFya0xhYmVsfS5nYXRoZXJEaWFnbm9zdGljcy5uZy5nZXRUc1N5bnRhY3RpY0RpYWdub3N0aWNzYCk7XG4gICAgICBjaGVja0RpYWdub3N0aWNzKGFuZ3VsYXJQcm9ncmFtLmdldFRzU3ludGFjdGljRGlhZ25vc3RpY3MuYmluZChhbmd1bGFyUHJvZ3JhbSkpO1xuICAgICAgdGltZUVuZChgJHtiZW5jaG1hcmtMYWJlbH0uZ2F0aGVyRGlhZ25vc3RpY3MubmcuZ2V0VHNTeW50YWN0aWNEaWFnbm9zdGljc2ApO1xuICAgIH1cblxuICAgIGlmIChnYXRoZXJTZW1hbnRpY0RpYWdub3N0aWNzKSB7XG4gICAgICAvLyBDaGVjayBUeXBlU2NyaXB0IHNlbWFudGljIGFuZCBBbmd1bGFyIHN0cnVjdHVyZSBkaWFnbm9zdGljcy5cbiAgICAgIHRpbWUoYCR7YmVuY2htYXJrTGFiZWx9LmdhdGhlckRpYWdub3N0aWNzLm5nLmdldFRzU2VtYW50aWNEaWFnbm9zdGljc2ApO1xuICAgICAgY2hlY2tEaWFnbm9zdGljcyhhbmd1bGFyUHJvZ3JhbS5nZXRUc1NlbWFudGljRGlhZ25vc3RpY3MuYmluZChhbmd1bGFyUHJvZ3JhbSkpO1xuICAgICAgdGltZUVuZChgJHtiZW5jaG1hcmtMYWJlbH0uZ2F0aGVyRGlhZ25vc3RpY3MubmcuZ2V0VHNTZW1hbnRpY0RpYWdub3N0aWNzYCk7XG5cbiAgICAgIC8vIENoZWNrIEFuZ3VsYXIgc2VtYW50aWMgZGlhZ25vc3RpY3NcbiAgICAgIHRpbWUoYCR7YmVuY2htYXJrTGFiZWx9LmdhdGhlckRpYWdub3N0aWNzLm5nLmdldE5nU2VtYW50aWNEaWFnbm9zdGljc2ApO1xuICAgICAgY2hlY2tEaWFnbm9zdGljcyhhbmd1bGFyUHJvZ3JhbS5nZXROZ1NlbWFudGljRGlhZ25vc3RpY3MuYmluZChhbmd1bGFyUHJvZ3JhbSkpO1xuICAgICAgdGltZUVuZChgJHtiZW5jaG1hcmtMYWJlbH0uZ2F0aGVyRGlhZ25vc3RpY3MubmcuZ2V0TmdTZW1hbnRpY0RpYWdub3N0aWNzYCk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGFsbERpYWdub3N0aWNzO1xufVxuIl19