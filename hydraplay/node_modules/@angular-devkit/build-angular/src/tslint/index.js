"use strict";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular-devkit/core");
const fs_1 = require("fs");
const glob = require("glob");
const minimatch_1 = require("minimatch");
const path = require("path");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const strip_bom_1 = require("../angular-cli-files/utilities/strip-bom");
class TslintBuilder {
    constructor(context) {
        this.context = context;
    }
    async loadTslint() {
        let tslint;
        try {
            tslint = await Promise.resolve().then(() => require('tslint')); // tslint:disable-line:no-implicit-dependencies
        }
        catch (_a) {
            throw new Error('Unable to find TSLint. Ensure TSLint is installed.');
        }
        const version = tslint.Linter.VERSION && tslint.Linter.VERSION.split('.');
        if (!version || version.length < 2 || Number(version[0]) < 5 || Number(version[1]) < 5) {
            throw new Error('TSLint must be version 5.5 or higher.');
        }
        return tslint;
    }
    run(builderConfig) {
        const root = this.context.workspace.root;
        const systemRoot = core_1.getSystemPath(root);
        const options = builderConfig.options;
        const targetSpecifier = this.context.targetSpecifier;
        const projectName = targetSpecifier && targetSpecifier.project || '';
        // Print formatter output only for non human-readable formats.
        const printInfo = ['prose', 'verbose', 'stylish'].includes(options.format)
            && !options.silent;
        if (printInfo) {
            this.context.logger.info(`Linting ${JSON.stringify(projectName)}...`);
        }
        if (!options.tsConfig && options.typeCheck) {
            throw new Error('A "project" must be specified to enable type checking.');
        }
        return rxjs_1.from(this.loadTslint()).pipe(operators_1.concatMap(projectTslint => new rxjs_1.Observable(obs => {
            const tslintConfigPath = options.tslintConfig
                ? path.resolve(systemRoot, options.tslintConfig)
                : null;
            const Linter = projectTslint.Linter;
            let result;
            if (options.tsConfig) {
                const tsConfigs = Array.isArray(options.tsConfig) ? options.tsConfig : [options.tsConfig];
                const allPrograms = tsConfigs.map(tsConfig => Linter.createProgram(path.resolve(systemRoot, tsConfig)));
                for (const program of allPrograms) {
                    const partial = lint(projectTslint, systemRoot, tslintConfigPath, options, program, allPrograms);
                    if (result == undefined) {
                        result = partial;
                    }
                    else {
                        result.failures = result.failures
                            .filter(curr => !partial.failures.some(prev => curr.equals(prev)))
                            .concat(partial.failures);
                        // we are not doing much with 'errorCount' and 'warningCount'
                        // apart from checking if they are greater than 0 thus no need to dedupe these.
                        result.errorCount += partial.errorCount;
                        result.warningCount += partial.warningCount;
                        if (partial.fixes) {
                            result.fixes = result.fixes ? result.fixes.concat(partial.fixes) : partial.fixes;
                        }
                    }
                }
            }
            else {
                result = lint(projectTslint, systemRoot, tslintConfigPath, options);
            }
            if (result == undefined) {
                throw new Error('Invalid lint configuration. Nothing to lint.');
            }
            if (!options.silent) {
                const Formatter = projectTslint.findFormatter(options.format);
                if (!Formatter) {
                    throw new Error(`Invalid lint format "${options.format}".`);
                }
                const formatter = new Formatter();
                const output = formatter.format(result.failures, result.fixes);
                if (output) {
                    this.context.logger.info(output);
                }
            }
            if (result.warningCount > 0 && printInfo) {
                this.context.logger.warn('Lint warnings found in the listed files.');
            }
            if (result.errorCount > 0 && printInfo) {
                this.context.logger.error('Lint errors found in the listed files.');
            }
            if (result.warningCount === 0 && result.errorCount === 0 && printInfo) {
                this.context.logger.info('All files pass linting.');
            }
            const success = options.force || result.errorCount === 0;
            obs.next({ success });
            return obs.complete();
        })));
    }
}
exports.default = TslintBuilder;
function lint(projectTslint, systemRoot, tslintConfigPath, options, program, allPrograms) {
    const Linter = projectTslint.Linter;
    const Configuration = projectTslint.Configuration;
    const files = getFilesToLint(systemRoot, options, Linter, program);
    const lintOptions = {
        fix: options.fix,
        formatter: options.format,
    };
    const linter = new Linter(lintOptions, program);
    let lastDirectory;
    let configLoad;
    for (const file of files) {
        let contents = '';
        if (program && allPrograms) {
            if (!program.getSourceFile(file)) {
                if (!allPrograms.some(p => p.getSourceFile(file) !== undefined)) {
                    // File is not part of any typescript program
                    throw new Error(`File '${file}' is not part of a TypeScript project '${options.tsConfig}'.`);
                }
                // if the Source file exists but it's not in the current program skip
                continue;
            }
        }
        else {
            contents = getFileContents(file);
        }
        // Only check for a new tslint config if the path changes.
        const currentDirectory = path.dirname(file);
        if (currentDirectory !== lastDirectory) {
            configLoad = Configuration.findConfiguration(tslintConfigPath, file);
            lastDirectory = currentDirectory;
        }
        if (configLoad) {
            linter.lint(file, contents, configLoad.results);
        }
    }
    return linter.getResult();
}
function getFilesToLint(root, options, linter, program) {
    const ignore = options.exclude;
    if (options.files.length > 0) {
        return options.files
            .map(file => glob.sync(file, { cwd: root, ignore, nodir: true }))
            .reduce((prev, curr) => prev.concat(curr), [])
            .map(file => path.join(root, file));
    }
    if (!program) {
        return [];
    }
    let programFiles = linter.getFileNames(program);
    if (ignore && ignore.length > 0) {
        // normalize to support ./ paths
        const ignoreMatchers = ignore
            .map(pattern => new minimatch_1.Minimatch(path.normalize(pattern), { dot: true }));
        programFiles = programFiles
            .filter(file => !ignoreMatchers.some(matcher => matcher.match(path.relative(root, file))));
    }
    return programFiles;
}
function getFileContents(file) {
    // NOTE: The tslint CLI checks for and excludes MPEG transport streams; this does not.
    try {
        return strip_bom_1.stripBom(fs_1.readFileSync(file, 'utf-8'));
    }
    catch (_a) {
        throw new Error(`Could not read file '${file}'.`);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL2FuZ3VsYXJfZGV2a2l0L2J1aWxkX2FuZ3VsYXIvc3JjL3RzbGludC9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOztBQVFILCtDQUFxRDtBQUNyRCwyQkFBa0M7QUFDbEMsNkJBQTZCO0FBQzdCLHlDQUFzQztBQUN0Qyw2QkFBNkI7QUFDN0IsK0JBQXdDO0FBQ3hDLDhDQUEyQztBQUczQyx3RUFBb0U7QUFjcEUsTUFBcUIsYUFBYTtJQUVoQyxZQUFtQixPQUF1QjtRQUF2QixZQUFPLEdBQVAsT0FBTyxDQUFnQjtJQUFJLENBQUM7SUFFdkMsS0FBSyxDQUFDLFVBQVU7UUFDdEIsSUFBSSxNQUFNLENBQUM7UUFDWCxJQUFJO1lBQ0YsTUFBTSxHQUFHLDJDQUFhLFFBQVEsRUFBQyxDQUFDLENBQUMsK0NBQStDO1NBQ2pGO1FBQUMsV0FBTTtZQUNOLE1BQU0sSUFBSSxLQUFLLENBQUMsb0RBQW9ELENBQUMsQ0FBQztTQUN2RTtRQUVELE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMxRSxJQUFJLENBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUN0RixNQUFNLElBQUksS0FBSyxDQUFDLHVDQUF1QyxDQUFDLENBQUM7U0FDMUQ7UUFFRCxPQUFPLE1BQU0sQ0FBQztJQUNoQixDQUFDO0lBRUQsR0FBRyxDQUFDLGFBQXlEO1FBRTNELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENB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LENBQUM7QUFFRCxTQUFTLGVBQWUsQ0FBQyxJQUFZO0lBQ25DLHNGQUFzRjtJQUN0RixJQUFJO1FBQ0YsT0FBTyxvQkFBUSxDQUFDLGlCQUFZLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7S0FDOUM7SUFBQyxXQUFNO1FBQ04sTUFBTSxJQUFJLEtBQUssQ0FBQyx3QkFBd0IsSUFBSSxJQUFJLENBQUMsQ0FBQztLQUNuRDtBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIEJ1aWxkRXZlbnQsXG4gIEJ1aWxkZXIsXG4gIEJ1aWxkZXJDb25maWd1cmF0aW9uLFxuICBCdWlsZGVyQ29udGV4dCxcbn0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L2FyY2hpdGVjdCc7XG5pbXBvcnQgeyBnZXRTeXN0ZW1QYXRoIH0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L2NvcmUnO1xuaW1wb3J0IHsgcmVhZEZpbGVTeW5jIH0gZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgZ2xvYiBmcm9tICdnbG9iJztcbmltcG9ydCB7IE1pbmltYXRjaCB9IGZyb20gJ21pbmltYXRjaCc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgZnJvbSB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgY29uY2F0TWFwIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0ICogYXMgdHNsaW50IGZyb20gJ3RzbGludCc7IC8vIHRzbGludDpkaXNhYmxlLWxpbmU6bm8taW1wbGljaXQtZGVwZW5kZW5jaWVzXG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JzsgLy8gdHNsaW50OmRpc2FibGUtbGluZTpuby1pbXBsaWNpdC1kZXBlbmRlbmNpZXNcbmltcG9ydCB7IHN0cmlwQm9tIH0gZnJvbSAnLi4vYW5ndWxhci1jbGktZmlsZXMvdXRpbGl0aWVzL3N0cmlwLWJvbSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgVHNsaW50QnVpbGRlck9wdGlvbnMge1xuICB0c2xpbnRDb25maWc/OiBzdHJpbmc7XG4gIHRzQ29uZmlnPzogc3RyaW5nIHwgc3RyaW5nW107XG4gIGZpeDogYm9vbGVhbjtcbiAgdHlwZUNoZWNrOiBib29sZWFuO1xuICBmb3JjZTogYm9vbGVhbjtcbiAgc2lsZW50OiBib29sZWFuO1xuICBmb3JtYXQ6IHN0cmluZztcbiAgZXhjbHVkZTogc3RyaW5nW107XG4gIGZpbGVzOiBzdHJpbmdbXTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVHNsaW50QnVpbGRlciBpbXBsZW1lbnRzIEJ1aWxkZXI8VHNsaW50QnVpbGRlck9wdGlvbnM+IHtcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgY29udGV4dDogQnVpbGRlckNvbnRleHQpIHsgfVxuXG4gIHByaXZhdGUgYXN5bmMgbG9hZFRzbGludCgpIHtcbiAgICBsZXQgdHNsaW50O1xuICAgIHRyeSB7XG4gICAgICB0c2xpbnQgPSBhd2FpdCBpbXBvcnQoJ3RzbGludCcpOyAvLyB0c2xpbnQ6ZGlzYWJsZS1saW5lOm5vLWltcGxpY2l0LWRlcGVuZGVuY2llc1xuICAgIH0gY2F0Y2gge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmFibGUgdG8gZmluZCBUU0xpbnQuIEVuc3VyZSBUU0xpbnQgaXMgaW5zdGFsbGVkLicpO1xuICAgIH1cblxuICAgIGNvbnN0IHZlcnNpb24gPSB0c2xpbnQuTGludGVyLlZFUlNJT04gJiYgdHNsaW50LkxpbnRlci5WRVJTSU9OLnNwbGl0KCcuJyk7XG4gICAgaWYgKCF2ZXJzaW9uIHx8IHZlcnNpb24ubGVuZ3RoIDwgMiB8fCBOdW1iZXIodmVyc2lvblswXSkgPCA1IHx8IE51bWJlcih2ZXJzaW9uWzFdKSA8IDUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVFNMaW50IG11c3QgYmUgdmVyc2lvbiA1LjUgb3IgaGlnaGVyLicpO1xuICAgIH1cblxuICAgIHJldHVybiB0c2xpbnQ7XG4gIH1cblxuICBydW4oYnVpbGRlckNvbmZpZzogQnVpbGRlckNvbmZpZ3VyYXRpb248VHNsaW50QnVpbGRlck9wdGlvbnM+KTogT2JzZXJ2YWJsZTxCdWlsZEV2ZW50PiB7XG5cbiAgICBjb25zdCByb290ID0gdGhpcy5jb250ZXh0LndvcmtzcGFjZS5yb290O1xuICAgIGNvbnN0IHN5c3RlbVJvb3QgPSBnZXRTeXN0ZW1QYXRoKHJvb3QpO1xuICAgIGNvbnN0IG9wdGlvbnMgPSBidWlsZGVyQ29uZmlnLm9wdGlvbnM7XG4gICAgY29uc3QgdGFyZ2V0U3BlY2lmaWVyID0gdGhpcy5jb250ZXh0LnRhcmdldFNwZWNpZmllcjtcbiAgICBjb25zdCBwcm9qZWN0TmFtZSA9IHRhcmdldFNwZWNpZmllciAmJiB0YXJnZXRTcGVjaWZpZXIucHJvamVjdCB8fCAnJztcblxuICAgIC8vIFByaW50IGZvcm1hdHRlciBvdXRwdXQgb25seSBmb3Igbm9uIGh1bWFuLXJlYWRhYmxlIGZvcm1hdHMuXG4gICAgY29uc3QgcHJpbnRJbmZvID0gWydwcm9zZScsICd2ZXJib3NlJywgJ3N0eWxpc2gnXS5pbmNsdWRlcyhvcHRpb25zLmZvcm1hdClcbiAgICAgICYmICFvcHRpb25zLnNpbGVudDtcblxuICAgIGlmIChwcmludEluZm8pIHtcbiAgICAgIHRoaXMuY29udGV4dC5sb2dnZXIuaW5mbyhgTGludGluZyAke0pTT04uc3RyaW5naWZ5KHByb2plY3ROYW1lKX0uLi5gKTtcbiAgICB9XG5cbiAgICBpZiAoIW9wdGlvbnMudHNDb25maWcgJiYgb3B0aW9ucy50eXBlQ2hlY2spIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQSBcInByb2plY3RcIiBtdXN0IGJlIHNwZWNpZmllZCB0byBlbmFibGUgdHlwZSBjaGVja2luZy4nKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnJvbSh0aGlzLmxvYWRUc2xpbnQoKSkucGlwZShjb25jYXRNYXAocHJvamVjdFRzbGludCA9PiBuZXcgT2JzZXJ2YWJsZShvYnMgPT4ge1xuICAgICAgY29uc3QgdHNsaW50Q29uZmlnUGF0aCA9IG9wdGlvbnMudHNsaW50Q29uZmlnXG4gICAgICAgID8gcGF0aC5yZXNvbHZlKHN5c3RlbVJvb3QsIG9wdGlvbnMudHNsaW50Q29uZmlnKVxuICAgICAgICA6IG51bGw7XG4gICAgICBjb25zdCBMaW50ZXIgPSBwcm9qZWN0VHNsaW50LkxpbnRlcjtcblxuICAgICAgbGV0IHJlc3VsdDogdW5kZWZpbmVkIHwgdHNsaW50LkxpbnRSZXN1bHQ7XG4gICAgICBpZiAob3B0aW9ucy50c0NvbmZpZykge1xuICAgICAgICBjb25zdCB0c0NvbmZpZ3MgPSBBcnJheS5pc0FycmF5KG9wdGlvbnMudHNDb25maWcpID8gb3B0aW9ucy50c0NvbmZpZyA6IFtvcHRpb25zLnRzQ29uZmlnXTtcbiAgICAgICAgY29uc3QgYWxsUHJvZ3JhbXMgPVxuICAgICAgICAgIHRzQ29uZmlncy5tYXAodHNDb25maWcgPT4gTGludGVyLmNyZWF0ZVByb2dyYW0ocGF0aC5yZXNvbHZlKHN5c3RlbVJvb3QsIHRzQ29uZmlnKSkpO1xuXG4gICAgICAgIGZvciAoY29uc3QgcHJvZ3JhbSBvZiBhbGxQcm9ncmFtcykge1xuICAgICAgICAgIGNvbnN0IHBhcnRpYWxcbiAgICAgICAgICAgID0gbGludChwcm9qZWN0VHNsaW50LCBzeXN0ZW1Sb290LCB0c2xpbnRDb25maWdQYXRoLCBvcHRpb25zLCBwcm9ncmFtLCBhbGxQcm9ncmFtcyk7XG4gICAgICAgICAgaWYgKHJlc3VsdCA9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHBhcnRpYWw7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdC5mYWlsdXJlcyA9IHJlc3VsdC5mYWlsdXJlc1xuICAgICAgICAgICAgICAuZmlsdGVyKGN1cnIgPT4gIXBhcnRpYWwuZmFpbHVyZXMuc29tZShwcmV2ID0+IGN1cnIuZXF1YWxzKHByZXYpKSlcbiAgICAgICAgICAgICAgLmNvbmNhdChwYXJ0aWFsLmZhaWx1cmVzKTtcblxuICAgICAgICAgICAgLy8gd2UgYXJlIG5vdCBkb2luZyBtdWNoIHdpdGggJ2Vycm9yQ291bnQnIGFuZCAnd2FybmluZ0NvdW50J1xuICAgICAgICAgICAgLy8gYXBhcnQgZnJvbSBjaGVja2luZyBpZiB0aGV5IGFyZSBncmVhdGVyIHRoYW4gMCB0aHVzIG5vIG5lZWQgdG8gZGVkdXBlIHRoZXNlLlxuICAgICAgICAgICAgcmVzdWx0LmVycm9yQ291bnQgKz0gcGFydGlhbC5lcnJvckNvdW50O1xuICAgICAgICAgICAgcmVzdWx0Lndhcm5pbmdDb3VudCArPSBwYXJ0aWFsLndhcm5pbmdDb3VudDtcblxuICAgICAgICAgICAgaWYgKHBhcnRpYWwuZml4ZXMpIHtcbiAgICAgICAgICAgICAgcmVzdWx0LmZpeGVzID0gcmVzdWx0LmZpeGVzID8gcmVzdWx0LmZpeGVzLmNvbmNhdChwYXJ0aWFsLmZpeGVzKSA6IHBhcnRpYWwuZml4ZXM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHQgPSBsaW50KHByb2plY3RUc2xpbnQsIHN5c3RlbVJvb3QsIHRzbGludENvbmZpZ1BhdGgsIG9wdGlvbnMpO1xuICAgICAgfVxuXG4gICAgICBpZiAocmVzdWx0ID09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgbGludCBjb25maWd1cmF0aW9uLiBOb3RoaW5nIHRvIGxpbnQuJyk7XG4gICAgICB9XG5cbiAgICAgIGlmICghb3B0aW9ucy5zaWxlbnQpIHtcbiAgICAgICAgY29uc3QgRm9ybWF0dGVyID0gcHJvamVjdFRzbGludC5maW5kRm9ybWF0dGVyKG9wdGlvbnMuZm9ybWF0KTtcbiAgICAgICAgaWYgKCFGb3JtYXR0ZXIpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgbGludCBmb3JtYXQgXCIke29wdGlvbnMuZm9ybWF0fVwiLmApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGZvcm1hdHRlciA9IG5ldyBGb3JtYXR0ZXIoKTtcblxuICAgICAgICBjb25zdCBvdXRwdXQgPSBmb3JtYXR0ZXIuZm9ybWF0KHJlc3VsdC5mYWlsdXJlcywgcmVzdWx0LmZpeGVzKTtcbiAgICAgICAgaWYgKG91dHB1dCkge1xuICAgICAgICAgIHRoaXMuY29udGV4dC5sb2dnZXIuaW5mbyhvdXRwdXQpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChyZXN1bHQud2FybmluZ0NvdW50ID4gMCAmJiBwcmludEluZm8pIHtcbiAgICAgICAgdGhpcy5jb250ZXh0LmxvZ2dlci53YXJuKCdMaW50IHdhcm5pbmdzIGZvdW5kIGluIHRoZSBsaXN0ZWQgZmlsZXMuJyk7XG4gICAgICB9XG5cbiAgICAgIGlmIChyZXN1bHQuZXJyb3JDb3VudCA+IDAgJiYgcHJpbnRJbmZvKSB7XG4gICAgICAgIHRoaXMuY29udGV4dC5sb2dnZXIuZXJyb3IoJ0xpbnQgZXJyb3JzIGZvdW5kIGluIHRoZSBsaXN0ZWQgZmlsZXMuJyk7XG4gICAgICB9XG5cbiAgICAgIGlmIChyZXN1bHQud2FybmluZ0NvdW50ID09PSAwICYmIHJlc3VsdC5lcnJvckNvdW50ID09PSAwICYmIHByaW50SW5mbykge1xuICAgICAgICB0aGlzLmNvbnRleHQubG9nZ2VyLmluZm8oJ0FsbCBmaWxlcyBwYXNzIGxpbnRpbmcuJyk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHN1Y2Nlc3MgPSBvcHRpb25zLmZvcmNlIHx8IHJlc3VsdC5lcnJvckNvdW50ID09PSAwO1xuICAgICAgb2JzLm5leHQoeyBzdWNjZXNzIH0pO1xuXG4gICAgICByZXR1cm4gb2JzLmNvbXBsZXRlKCk7XG4gICAgfSkpKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBsaW50KFxuICBwcm9qZWN0VHNsaW50OiB0eXBlb2YgdHNsaW50LFxuICBzeXN0ZW1Sb290OiBzdHJpbmcsXG4gIHRzbGludENvbmZpZ1BhdGg6IHN0cmluZyB8IG51bGwsXG4gIG9wdGlvbnM6IFRzbGludEJ1aWxkZXJPcHRpb25zLFxuICBwcm9ncmFtPzogdHMuUHJvZ3JhbSxcbiAgYWxsUHJvZ3JhbXM/OiB0cy5Qcm9ncmFtW10sXG4pIHtcbiAgY29uc3QgTGludGVyID0gcHJvamVjdFRzbGludC5MaW50ZXI7XG4gIGNvbnN0IENvbmZpZ3VyYXRpb24gPSBwcm9qZWN0VHNsaW50LkNvbmZpZ3VyYXRpb247XG5cbiAgY29uc3QgZmlsZXMgPSBnZXRGaWxlc1RvTGludChzeXN0ZW1Sb290LCBvcHRpb25zLCBMaW50ZXIsIHByb2dyYW0pO1xuICBjb25zdCBsaW50T3B0aW9ucyA9IHtcbiAgICBmaXg6IG9wdGlvbnMuZml4LFxuICAgIGZvcm1hdHRlcjogb3B0aW9ucy5mb3JtYXQsXG4gIH07XG5cbiAgY29uc3QgbGludGVyID0gbmV3IExpbnRlcihsaW50T3B0aW9ucywgcHJvZ3JhbSk7XG5cbiAgbGV0IGxhc3REaXJlY3Rvcnk7XG4gIGxldCBjb25maWdMb2FkO1xuICBmb3IgKGNvbnN0IGZpbGUgb2YgZmlsZXMpIHtcbiAgICBsZXQgY29udGVudHMgPSAnJztcbiAgICBpZiAocHJvZ3JhbSAmJiBhbGxQcm9ncmFtcykge1xuICAgICAgaWYgKCFwcm9ncmFtLmdldFNvdXJjZUZpbGUoZmlsZSkpIHtcbiAgICAgICAgaWYgKCFhbGxQcm9ncmFtcy5zb21lKHAgPT4gcC5nZXRTb3VyY2VGaWxlKGZpbGUpICE9PSB1bmRlZmluZWQpKSB7XG4gICAgICAgICAgLy8gRmlsZSBpcyBub3QgcGFydCBvZiBhbnkgdHlwZXNjcmlwdCBwcm9ncmFtXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYEZpbGUgJyR7ZmlsZX0nIGlzIG5vdCBwYXJ0IG9mIGEgVHlwZVNjcmlwdCBwcm9qZWN0ICcke29wdGlvbnMudHNDb25maWd9Jy5gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGlmIHRoZSBTb3VyY2UgZmlsZSBleGlzdHMgYnV0IGl0J3Mgbm90IGluIHRoZSBjdXJyZW50IHByb2dyYW0gc2tpcFxuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29udGVudHMgPSBnZXRGaWxlQ29udGVudHMoZmlsZSk7XG4gICAgfVxuXG4gICAgLy8gT25seSBjaGVjayBmb3IgYSBuZXcgdHNsaW50IGNvbmZpZyBpZiB0aGUgcGF0aCBjaGFuZ2VzLlxuICAgIGNvbnN0IGN1cnJlbnREaXJlY3RvcnkgPSBwYXRoLmRpcm5hbWUoZmlsZSk7XG4gICAgaWYgKGN1cnJlbnREaXJlY3RvcnkgIT09IGxhc3REaXJlY3RvcnkpIHtcbiAgICAgIGNvbmZpZ0xvYWQgPSBDb25maWd1cmF0aW9uLmZpbmRDb25maWd1cmF0aW9uKHRzbGludENvbmZpZ1BhdGgsIGZpbGUpO1xuICAgICAgbGFzdERpcmVjdG9yeSA9IGN1cnJlbnREaXJlY3Rvcnk7XG4gICAgfVxuXG4gICAgaWYgKGNvbmZpZ0xvYWQpIHtcbiAgICAgIGxpbnRlci5saW50KGZpbGUsIGNvbnRlbnRzLCBjb25maWdMb2FkLnJlc3VsdHMpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBsaW50ZXIuZ2V0UmVzdWx0KCk7XG59XG5cbmZ1bmN0aW9uIGdldEZpbGVzVG9MaW50KFxuICByb290OiBzdHJpbmcsXG4gIG9wdGlvbnM6IFRzbGludEJ1aWxkZXJPcHRpb25zLFxuICBsaW50ZXI6IHR5cGVvZiB0c2xpbnQuTGludGVyLFxuICBwcm9ncmFtPzogdHMuUHJvZ3JhbSxcbik6IHN0cmluZ1tdIHtcbiAgY29uc3QgaWdub3JlID0gb3B0aW9ucy5leGNsdWRlO1xuXG4gIGlmIChvcHRpb25zLmZpbGVzLmxlbmd0aCA+IDApIHtcbiAgICByZXR1cm4gb3B0aW9ucy5maWxlc1xuICAgICAgLm1hcChmaWxlID0+IGdsb2Iuc3luYyhmaWxlLCB7IGN3ZDogcm9vdCwgaWdub3JlLCBub2RpcjogdHJ1ZSB9KSlcbiAgICAgIC5yZWR1Y2UoKHByZXYsIGN1cnIpID0+IHByZXYuY29uY2F0KGN1cnIpLCBbXSlcbiAgICAgIC5tYXAoZmlsZSA9PiBwYXRoLmpvaW4ocm9vdCwgZmlsZSkpO1xuICB9XG5cbiAgaWYgKCFwcm9ncmFtKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgbGV0IHByb2dyYW1GaWxlcyA9IGxpbnRlci5nZXRGaWxlTmFtZXMocHJvZ3JhbSk7XG5cbiAgaWYgKGlnbm9yZSAmJiBpZ25vcmUubGVuZ3RoID4gMCkge1xuICAgIC8vIG5vcm1hbGl6ZSB0byBzdXBwb3J0IC4vIHBhdGhzXG4gICAgY29uc3QgaWdub3JlTWF0Y2hlcnMgPSBpZ25vcmVcbiAgICAgIC5tYXAocGF0dGVybiA9PiBuZXcgTWluaW1hdGNoKHBhdGgubm9ybWFsaXplKHBhdHRlcm4pLCB7IGRvdDogdHJ1ZSB9KSk7XG5cbiAgICBwcm9ncmFtRmlsZXMgPSBwcm9ncmFtRmlsZXNcbiAgICAgIC5maWx0ZXIoZmlsZSA9PiAhaWdub3JlTWF0Y2hlcnMuc29tZShtYXRjaGVyID0+IG1hdGNoZXIubWF0Y2gocGF0aC5yZWxhdGl2ZShyb290LCBmaWxlKSkpKTtcbiAgfVxuXG4gIHJldHVybiBwcm9ncmFtRmlsZXM7XG59XG5cbmZ1bmN0aW9uIGdldEZpbGVDb250ZW50cyhmaWxlOiBzdHJpbmcpOiBzdHJpbmcge1xuICAvLyBOT1RFOiBUaGUgdHNsaW50IENMSSBjaGVja3MgZm9yIGFuZCBleGNsdWRlcyBNUEVHIHRyYW5zcG9ydCBzdHJlYW1zOyB0aGlzIGRvZXMgbm90LlxuICB0cnkge1xuICAgIHJldHVybiBzdHJpcEJvbShyZWFkRmlsZVN5bmMoZmlsZSwgJ3V0Zi04JykpO1xuICB9IGNhdGNoIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYENvdWxkIG5vdCByZWFkIGZpbGUgJyR7ZmlsZX0nLmApO1xuICB9XG59XG4iXX0=