"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const core_1 = require("@angular-devkit/core");
const node_1 = require("@angular-devkit/core/node");
const compiler_cli_1 = require("@angular/compiler-cli");
const ts = require("typescript");
const benchmark_1 = require("./benchmark");
const compiler_host_1 = require("./compiler_host");
const gather_diagnostics_1 = require("./gather_diagnostics");
const type_checker_messages_1 = require("./type_checker_messages");
// This file should run in a child process with the AUTO_START_ARG argument
exports.AUTO_START_ARG = '9d93e901-158a-4cf9-ba1b-2f0582ffcfeb';
class TypeChecker {
    constructor(_compilerOptions, _basePath, _JitMode, _rootNames, hostReplacementPaths) {
        this._compilerOptions = _compilerOptions;
        this._JitMode = _JitMode;
        this._rootNames = _rootNames;
        benchmark_1.time('TypeChecker.constructor');
        const host = new core_1.virtualFs.AliasHost(new node_1.NodeJsSyncHost());
        // Add file replacements.
        for (const from in hostReplacementPaths) {
            const normalizedFrom = core_1.resolve(core_1.normalize(_basePath), core_1.normalize(from));
            const normalizedWith = core_1.resolve(core_1.normalize(_basePath), core_1.normalize(hostReplacementPaths[from]));
            host.aliases.set(normalizedFrom, normalizedWith);
        }
        const compilerHost = new compiler_host_1.WebpackCompilerHost(_compilerOptions, _basePath, host, true);
        // We don't set a async resource loader on the compiler host because we only support
        // html templates, which are the only ones that can throw errors, and those can be loaded
        // synchronously.
        // If we need to also report errors on styles then we'll need to ask the main thread
        // for these resources.
        this._compilerHost = compiler_cli_1.createCompilerHost({
            options: this._compilerOptions,
            tsHost: compilerHost,
        });
        benchmark_1.timeEnd('TypeChecker.constructor');
    }
    _update(rootNames, changedCompilationFiles) {
        benchmark_1.time('TypeChecker._update');
        this._rootNames = rootNames;
        changedCompilationFiles.forEach((fileName) => {
            this._compilerHost.invalidate(fileName);
        });
        benchmark_1.timeEnd('TypeChecker._update');
    }
    _createOrUpdateProgram() {
        if (this._JitMode) {
            // Create the TypeScript program.
            benchmark_1.time('TypeChecker._createOrUpdateProgram.ts.createProgram');
            this._program = ts.createProgram(this._rootNames, this._compilerOptions, this._compilerHost, this._program);
            benchmark_1.timeEnd('TypeChecker._createOrUpdateProgram.ts.createProgram');
        }
        else {
            benchmark_1.time('TypeChecker._createOrUpdateProgram.ng.createProgram');
            // Create the Angular program.
            this._program = compiler_cli_1.createProgram({
                rootNames: this._rootNames,
                options: this._compilerOptions,
                host: this._compilerHost,
                oldProgram: this._program,
            });
            benchmark_1.timeEnd('TypeChecker._createOrUpdateProgram.ng.createProgram');
        }
    }
    _diagnose(cancellationToken) {
        const allDiagnostics = gather_diagnostics_1.gatherDiagnostics(this._program, this._JitMode, 'TypeChecker', gather_diagnostics_1.DiagnosticMode.Semantic, cancellationToken);
        // Report diagnostics.
        if (!cancellationToken.isCancellationRequested()) {
            const errors = allDiagnostics.filter((d) => d.category === ts.DiagnosticCategory.Error);
            const warnings = allDiagnostics.filter((d) => d.category === ts.DiagnosticCategory.Warning);
            if (errors.length > 0) {
                const message = compiler_cli_1.formatDiagnostics(errors);
                this.sendMessage(new type_checker_messages_1.LogMessage('error', 'ERROR in ' + message));
            }
            else {
                // Reset the changed file tracker only if there are no errors.
                this._compilerHost.resetChangedFileTracker();
            }
            if (warnings.length > 0) {
                const message = compiler_cli_1.formatDiagnostics(warnings);
                this.sendMessage(new type_checker_messages_1.LogMessage('warn', 'WARNING in ' + message));
            }
        }
    }
    sendMessage(msg) {
        if (process.send) {
            process.send(msg);
        }
    }
    update(rootNames, changedCompilationFiles, cancellationToken) {
        this._update(rootNames, changedCompilationFiles);
        this._createOrUpdateProgram();
        this._diagnose(cancellationToken);
    }
}
exports.TypeChecker = TypeChecker;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZV9jaGVja2VyLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJwYWNrYWdlcy9uZ3Rvb2xzL3dlYnBhY2svc3JjL3R5cGVfY2hlY2tlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7R0FNRztBQUNILCtDQUFxRTtBQUNyRSxvREFBMkQ7QUFDM0Qsd0RBTytCO0FBQy9CLGlDQUFpQztBQUNqQywyQ0FBNEM7QUFDNUMsbURBQXNEO0FBQ3RELDZEQUE0RjtBQUM1RixtRUFBeUU7QUFHekUsMkVBQTJFO0FBQzlELFFBQUEsY0FBYyxHQUFHLHNDQUFzQyxDQUFDO0FBRXJFLE1BQWEsV0FBVztJQUl0QixZQUNVLGdCQUFpQyxFQUN6QyxTQUFpQixFQUNULFFBQWlCLEVBQ2pCLFVBQW9CLEVBQzVCLG9CQUFnRDtRQUp4QyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWlCO1FBRWpDLGFBQVEsR0FBUixRQUFRLENBQVM7UUFDakIsZUFBVSxHQUFWLFVBQVUsQ0FBVTtRQUc1QixnQkFBSSxDQUFDLHlCQUF5QixDQUFDLENBQUM7UUFDaEMsTUFBTSxJQUFJLEdBQUcsSUFBSSxnQkFBUyxDQUFDLFNBQVMsQ0FBQyxJQUFJLHFCQUFjLEVBQUUsQ0FBQyxDQUFDO1FBRTNELHlCQUF5QjtRQUN6QixLQUFLLE1BQU0sSUFBSSxJQUFJLG9CQUFvQixFQUFFO1lBQ3ZDLE1BQU0sY0FBYyxHQUFHLGNBQU8sQ0FBQyxnQkFBUyxDQUFDLFNBQVMsQ0FBQyxFQUFFLGdCQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUN0RSxNQUFNLGNBQWMsR0FBRyxjQUFPLENBQzVCLGdCQUFTLENBQUMsU0FBUyxDQUFDLEVBQ3BCLGdCQUFTLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FDdEMsQ0FBQztZQUNGLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRSxjQUFjLENBQUMsQ0FBQztTQUNsRDtRQUVELE1BQU0s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QzthQUM5QztZQUVELElBQUksUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQ3ZCLE1BQU0sT0FBTyxHQUFHLGdDQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUM1QyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksa0NBQVUsQ0FBQyxNQUFNLEVBQUUsYUFBYSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUM7YUFDbkU7U0FDRjtJQUNILENBQUM7SUFFTyxXQUFXLENBQUMsR0FBdUI7UUFDekMsSUFBSSxPQUFPLENBQUMsSUFBSSxFQUFFO1lBQ2hCLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDbkI7SUFDSCxDQUFDO0lBRU0sTUFBTSxDQUFDLFNBQW1CLEVBQUUsdUJBQWlDLEVBQ3RELGlCQUFvQztRQUNoRCxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSx1QkFBdUIsQ0FBQyxDQUFDO1FBQ2pELElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO1FBQzlCLElBQUksQ0FBQyxTQUFTLENBQUMsaUJBQWlCLENBQUMsQ0FBQztJQUNwQyxDQUFDO0NBQ0Y7QUEvR0Qsa0NBK0dDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHsgbm9ybWFsaXplLCByZXNvbHZlLCB2aXJ0dWFsRnMgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvY29yZSc7XG5pbXBvcnQgeyBOb2RlSnNTeW5jSG9zdCB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9jb3JlL25vZGUnO1xuaW1wb3J0IHtcbiAgQ29tcGlsZXJIb3N0LFxuICBDb21waWxlck9wdGlvbnMsXG4gIFByb2dyYW0sXG4gIGNyZWF0ZUNvbXBpbGVySG9zdCxcbiAgY3JlYXRlUHJvZ3JhbSxcbiAgZm9ybWF0RGlhZ25vc3RpY3MsXG59IGZyb20gJ0Bhbmd1bGFyL2NvbXBpbGVyLWNsaSc7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcbmltcG9ydCB7IHRpbWUsIHRpbWVFbmQgfSBmcm9tICcuL2JlbmNobWFyayc7XG5pbXBvcnQgeyBXZWJwYWNrQ29tcGlsZXJIb3N0IH0gZnJvbSAnLi9jb21waWxlcl9ob3N0JztcbmltcG9ydCB7IENhbmNlbGxhdGlvblRva2VuLCBEaWFnbm9zdGljTW9kZSwgZ2F0aGVyRGlhZ25vc3RpY3MgfSBmcm9tICcuL2dhdGhlcl9kaWFnbm9zdGljcyc7XG5pbXBvcnQgeyBMb2dNZXNzYWdlLCBUeXBlQ2hlY2tlck1lc3NhZ2UgfSBmcm9tICcuL3R5cGVfY2hlY2tlcl9tZXNzYWdlcyc7XG5cblxuLy8gVGhpcyBmaWxlIHNob3VsZCBydW4gaW4gYSBjaGlsZCBwcm9jZXNzIHdpdGggdGhlIEFVVE9fU1RBUlRfQVJHIGFyZ3VtZW50XG5leHBvcnQgY29uc3QgQVVUT19TVEFSVF9BUkcgPSAnOWQ5M2U5MDEtMTU4YS00Y2Y5LWJhMWItMmYwNTgyZmZjZmViJztcblxuZXhwb3J0IGNsYXNzIFR5cGVDaGVja2VyIHtcbiAgcHJpdmF0ZSBfcHJvZ3JhbTogdHMuUHJvZ3JhbSB8IFByb2dyYW07XG4gIHByaXZhdGUgX2NvbXBpbGVySG9zdDogV2VicGFja0NvbXBpbGVySG9zdCAmIENvbXBpbGVySG9zdDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIF9jb21waWxlck9wdGlvbnM6IENvbXBpbGVyT3B0aW9ucyxcbiAgICBfYmFzZVBhdGg6IHN0cmluZyxcbiAgICBwcml2YXRlIF9KaXRNb2RlOiBib29sZWFuLFxuICAgIHByaXZhdGUgX3Jvb3ROYW1lczogc3RyaW5nW10sXG4gICAgaG9zdFJlcGxhY2VtZW50UGF0aHM6IHsgW3BhdGg6IHN0cmluZ106IHN0cmluZyB9LFxuICApIHtcbiAgICB0aW1lKCdUeXBlQ2hlY2tlci5jb25zdHJ1Y3RvcicpO1xuICAgIGNvbnN0IGhvc3QgPSBuZXcgdmlydHVhbEZzLkFsaWFzSG9zdChuZXcgTm9kZUpzU3luY0hvc3QoKSk7XG5cbiAgICAvLyBBZGQgZmlsZSByZXBsYWNlbWVudHMuXG4gICAgZm9yIChjb25zdCBmcm9tIGluIGhvc3RSZXBsYWNlbWVudFBhdGhzKSB7XG4gICAgICBjb25zdCBub3JtYWxpemVkRnJvbSA9IHJlc29sdmUobm9ybWFsaXplKF9iYXNlUGF0aCksIG5vcm1hbGl6ZShmcm9tKSk7XG4gICAgICBjb25zdCBub3JtYWxpemVkV2l0aCA9IHJlc29sdmUoXG4gICAgICAgIG5vcm1hbGl6ZShfYmFzZVBhdGgpLFxuICAgICAgICBub3JtYWxpemUoaG9zdFJlcGxhY2VtZW50UGF0aHNbZnJvbV0pLFxuICAgICAgKTtcbiAgICAgIGhvc3QuYWxpYXNlcy5zZXQobm9ybWFsaXplZEZyb20sIG5vcm1hbGl6ZWRXaXRoKTtcbiAgICB9XG5cbiAgICBjb25zdCBjb21waWxlckhvc3QgPSBuZXcgV2VicGFja0NvbXBpbGVySG9zdChcbiAgICAgIF9jb21waWxlck9wdGlvbnMsXG4gICAgICBfYmFzZVBhdGgsXG4gICAgICBob3N0LFxuICAgICAgdHJ1ZSxcbiAgICApO1xuICAgIC8vIFdlIGRvbid0IHNldCBhIGFzeW5jIHJlc291cmNlIGxvYWRlciBvbiB0aGUgY29tcGlsZXIgaG9zdCBiZWNhdXNlIHdlIG9ubHkgc3VwcG9ydFxuICAgIC8vIGh0bWwgdGVtcGxhdGVzLCB3aGljaCBhcmUgdGhlIG9ubHkgb25lcyB0aGF0IGNhbiB0aHJvdyBlcnJvcnMsIGFuZCB0aG9zZSBjYW4gYmUgbG9hZGVkXG4gICAgLy8gc3luY2hyb25vdXNseS5cbiAgICAvLyBJZiB3ZSBuZWVkIHRvIGFsc28gcmVwb3J0IGVycm9ycyBvbiBzdHlsZXMgdGhlbiB3ZSdsbCBuZWVkIHRvIGFzayB0aGUgbWFpbiB0aHJlYWRcbiAgICAvLyBmb3IgdGhlc2UgcmVzb3VyY2VzLlxuICAgIHRoaXMuX2NvbXBpbGVySG9zdCA9IGNyZWF0ZUNvbXBpbGVySG9zdCh7XG4gICAgICBvcHRpb25zOiB0aGlzLl9jb21waWxlck9wdGlvbnMsXG4gICAgICB0c0hvc3Q6IGNvbXBpbGVySG9zdCxcbiAgICB9KSBhcyBDb21waWxlckhvc3QgJiBXZWJwYWNrQ29tcGlsZXJIb3N0O1xuICAgIHRpbWVFbmQoJ1R5cGVDaGVja2VyLmNvbnN0cnVjdG9yJyk7XG4gIH1cblxuICBwcml2YXRlIF91cGRhdGUocm9vdE5hbWVzOiBzdHJpbmdbXSwgY2hhbmdlZENvbXBpbGF0aW9uRmlsZXM6IHN0cmluZ1tdKSB7XG4gICAgdGltZSgnVHlwZUNoZWNrZXIuX3VwZGF0ZScpO1xuICAgIHRoaXMuX3Jvb3ROYW1lcyA9IHJvb3ROYW1lcztcbiAgICBjaGFuZ2VkQ29tcGlsYXRpb25GaWxlcy5mb3JFYWNoKChmaWxlTmFtZSkgPT4ge1xuICAgICAgdGhpcy5fY29tcGlsZXJIb3N0LmludmFsaWRhdGUoZmlsZU5hbWUpO1xuICAgIH0pO1xuICAgIHRpbWVFbmQoJ1R5cGVDaGVja2VyLl91cGRhdGUnKTtcbiAgfVxuXG4gIHByaXZhdGUgX2NyZWF0ZU9yVXBkYXRlUHJvZ3JhbSgpIHtcbiAgICBpZiAodGhpcy5fSml0TW9kZSkge1xuICAgICAgLy8gQ3JlYXRlIHRoZSBUeXBlU2NyaXB0IHByb2dyYW0uXG4gICAgICB0aW1lKCdUeXBlQ2hlY2tlci5fY3JlYXRlT3JVcGRhdGVQcm9ncmFtLnRzLmNyZWF0ZVByb2dyYW0nKTtcbiAgICAgIHRoaXMuX3Byb2dyYW0gPSB0cy5jcmVhdGVQcm9ncmFtKFxuICAgICAgICB0aGlzLl9yb290TmFtZXMsXG4gICAgICAgIHRoaXMuX2NvbXBpbGVyT3B0aW9ucyxcbiAgICAgICAgdGhpcy5fY29tcGlsZXJIb3N0LFxuICAgICAgICB0aGlzLl9wcm9ncmFtIGFzIHRzLlByb2dyYW0sXG4gICAgICApIGFzIHRzLlByb2dyYW07XG4gICAgICB0aW1lRW5kKCdUeXBlQ2hlY2tlci5fY3JlYXRlT3JVcGRhdGVQcm9ncmFtLnRzLmNyZWF0ZVByb2dyYW0nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGltZSgnVHlwZUNoZWNrZXIuX2NyZWF0ZU9yVXBkYXRlUHJvZ3JhbS5uZy5jcmVhdGVQcm9ncmFtJyk7XG4gICAgICAvLyBDcmVhdGUgdGhlIEFuZ3VsYXIgcHJvZ3JhbS5cbiAgICAgIHRoaXMuX3Byb2dyYW0gPSBjcmVhdGVQcm9ncmFtKHtcbiAgICAgICAgcm9vdE5hbWVzOiB0aGlzLl9yb290TmFtZXMsXG4gICAgICAgIG9wdGlvbnM6IHRoaXMuX2NvbXBpbGVyT3B0aW9ucyxcbiAgICAgICAgaG9zdDogdGhpcy5fY29tcGlsZXJIb3N0LFxuICAgICAgICBvbGRQcm9ncmFtOiB0aGlzLl9wcm9ncmFtIGFzIFByb2dyYW0sXG4gICAgICB9KSBhcyBQcm9ncmFtO1xuICAgICAgdGltZUVuZCgnVHlwZUNoZWNrZXIuX2NyZWF0ZU9yVXBkYXRlUHJvZ3JhbS5uZy5jcmVhdGVQcm9ncmFtJyk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfZGlhZ25vc2UoY2FuY2VsbGF0aW9uVG9rZW46IENhbmNlbGxhdGlvblRva2VuKSB7XG4gICAgY29uc3QgYWxsRGlhZ25vc3RpY3MgPSBnYXRoZXJEaWFnbm9zdGljcyhcbiAgICAgIHRoaXMuX3Byb2dyYW0sIHRoaXMuX0ppdE1vZGUsICdUeXBlQ2hlY2tlcicsIERpYWdub3N0aWNNb2RlLlNlbWFudGljLCBjYW5jZWxsYXRpb25Ub2tlbik7XG5cbiAgICAvLyBSZXBvcnQgZGlhZ25vc3RpY3MuXG4gICAgaWYgKCFjYW5jZWxsYXRpb25Ub2tlbi5pc0NhbmNlbGxhdGlvblJlcXVlc3RlZCgpKSB7XG4gICAgICBjb25zdCBlcnJvcnMgPSBhbGxEaWFnbm9zdGljcy5maWx0ZXIoKGQpID0+IGQuY2F0ZWdvcnkgPT09IHRzLkRpYWdub3N0aWNDYXRlZ29yeS5FcnJvcik7XG4gICAgICBjb25zdCB3YXJuaW5ncyA9IGFsbERpYWdub3N0aWNzLmZpbHRlcigoZCkgPT4gZC5jYXRlZ29yeSA9PT0gdHMuRGlhZ25vc3RpY0NhdGVnb3J5Lldhcm5pbmcpO1xuXG4gICAgICBpZiAoZXJyb3JzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGZvcm1hdERpYWdub3N0aWNzKGVycm9ycyk7XG4gICAgICAgIHRoaXMuc2VuZE1lc3NhZ2UobmV3IExvZ01lc3NhZ2UoJ2Vycm9yJywgJ0VSUk9SIGluICcgKyBtZXNzYWdlKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBSZXNldCB0aGUgY2hhbmdlZCBmaWxlIHRyYWNrZXIgb25seSBpZiB0aGVyZSBhcmUgbm8gZXJyb3JzLlxuICAgICAgICB0aGlzLl9jb21waWxlckhvc3QucmVzZXRDaGFuZ2VkRmlsZVRyYWNrZXIoKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHdhcm5pbmdzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGZvcm1hdERpYWdub3N0aWNzKHdhcm5pbmdzKTtcbiAgICAgICAgdGhpcy5zZW5kTWVzc2FnZShuZXcgTG9nTWVzc2FnZSgnd2FybicsICdXQVJOSU5HIGluICcgKyBtZXNzYWdlKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBzZW5kTWVzc2FnZShtc2c6IFR5cGVDaGVja2VyTWVzc2FnZSkge1xuICAgIGlmIChwcm9jZXNzLnNlbmQpIHtcbiAgICAgIHByb2Nlc3Muc2VuZChtc2cpO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyB1cGRhdGUocm9vdE5hbWVzOiBzdHJpbmdbXSwgY2hhbmdlZENvbXBpbGF0aW9uRmlsZXM6IHN0cmluZ1tdLFxuICAgICAgICAgICAgICAgIGNhbmNlbGxhdGlvblRva2VuOiBDYW5jZWxsYXRpb25Ub2tlbikge1xuICAgIHRoaXMuX3VwZGF0ZShyb290TmFtZXMsIGNoYW5nZWRDb21waWxhdGlvbkZpbGVzKTtcbiAgICB0aGlzLl9jcmVhdGVPclVwZGF0ZVByb2dyYW0oKTtcbiAgICB0aGlzLl9kaWFnbm9zZShjYW5jZWxsYXRpb25Ub2tlbik7XG4gIH1cbn1cbiJdfQ==