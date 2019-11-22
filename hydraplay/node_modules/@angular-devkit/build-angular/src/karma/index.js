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
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const webpack_configs_1 = require("../angular-cli-files/models/webpack-configs");
const read_tsconfig_1 = require("../angular-cli-files/utilities/read-tsconfig");
const require_project_module_1 = require("../angular-cli-files/utilities/require-project-module");
const utils_1 = require("../utils");
const webpackMerge = require('webpack-merge');
class KarmaBuilder {
    constructor(context) {
        this.context = context;
    }
    run(builderConfig) {
        const root = this.context.workspace.root;
        const projectRoot = core_1.resolve(root, builderConfig.root);
        const host = new core_1.virtualFs.AliasHost(this.context.host);
        const options = utils_1.normalizeBuilderSchema(host, root, builderConfig);
        return rxjs_1.of(null).pipe(operators_1.concatMap(() => new rxjs_1.Observable(obs => {
            const karma = require_project_module_1.requireProjectModule(core_1.getSystemPath(projectRoot), 'karma');
            const karmaConfig = core_1.getSystemPath(core_1.resolve(root, core_1.normalize(options.karmaConfig)));
            // TODO: adjust options to account for not passing them blindly to karma.
            // const karmaOptions: any = Object.assign({}, options);
            // tslint:disable-next-line:no-any
            const karmaOptions = {};
            if (options.watch !== undefined) {
                karmaOptions.singleRun = !options.watch;
            }
            // Convert browsers from a string to an array
            if (options.browsers) {
                karmaOptions.browsers = options.browsers.split(',');
            }
            if (options.reporters) {
                // Split along commas to make it more natural, and remove empty strings.
                const reporters = options.reporters
                    .reduce((acc, curr) => acc.concat(curr.split(/,/)), [])
                    .filter(x => !!x);
                if (reporters.length > 0) {
                    karmaOptions.reporters = reporters;
                }
            }
            const sourceRoot = builderConfig.sourceRoot && core_1.resolve(root, builderConfig.sourceRoot);
            karmaOptions.buildWebpack = {
                root: core_1.getSystemPath(root),
                projectRoot: core_1.getSystemPath(projectRoot),
                options,
                webpackConfig: this.buildWebpackConfig(root, projectRoot, sourceRoot, host, options),
                // Pass onto Karma to emit BuildEvents.
                successCb: () => obs.next({ success: true }),
                failureCb: () => obs.next({ success: false }),
                // Workaround for https://github.com/karma-runner/karma/issues/3154
                // When this workaround is removed, user projects need to be updated to use a Karma
                // version that has a fix for this issue.
                toJSON: () => { },
                logger: this.context.logger,
            };
            // TODO: inside the configs, always use the project root and not the workspace root.
            // Until then we pretend the app root is relative (``) but the same as `projectRoot`.
            karmaOptions.buildWebpack.options.root = '';
            // Assign additional karmaConfig options to the local ngapp config
            karmaOptions.configFile = karmaConfig;
            // Complete the observable once the Karma server returns.
            const karmaServer = new karma.Server(karmaOptions, () => obs.complete());
            const karmaStartPromise = karmaServer.start();
            // Cleanup, signal Karma to exit.
            return () => {
                // Karma only has the `stop` method start with 3.1.1, so we must defensively check.
                if (karmaServer.stop && typeof karmaServer.stop === 'function') {
                    return karmaStartPromise.then(() => karmaServer.stop());
                }
            };
        })));
    }
    buildWebpackConfig(root, projectRoot, sourceRoot, host, options) {
        let wco;
        const tsConfigPath = core_1.getSystemPath(core_1.resolve(root, core_1.normalize(options.tsConfig)));
        const tsConfig = read_tsconfig_1.readTsconfig(tsConfigPath);
        const projectTs = require_project_module_1.requireProjectModule(core_1.getSystemPath(projectRoot), 'typescript');
        const supportES2015 = tsConfig.options.target !== projectTs.ScriptTarget.ES3
            && tsConfig.options.target !== projectTs.ScriptTarget.ES5;
        const compatOptions = Object.assign({}, options, { 
            // Some asset logic inside getCommonConfig needs outputPath to be set.
            outputPath: '' });
        wco = {
            root: core_1.getSystemPath(root),
            logger: this.context.logger,
            projectRoot: core_1.getSystemPath(projectRoot),
            sourceRoot: sourceRoot && core_1.getSystemPath(sourceRoot),
            // TODO: use only this.options, it contains all flags and configs items already.
            buildOptions: compatOptions,
            tsConfig,
            tsConfigPath,
            supportES2015,
        };
        wco.buildOptions.progress = utils_1.defaultProgress(wco.buildOptions.progress);
        const webpackConfigs = [
            webpack_configs_1.getCommonConfig(wco),
            webpack_configs_1.getStylesConfig(wco),
            webpack_configs_1.getNonAotTestConfig(wco, host),
            webpack_configs_1.getTestConfig(wco),
        ];
        return webpackMerge(webpackConfigs);
    }
}
exports.KarmaBuilder = KarmaBuilder;
exports.default = KarmaBuilder;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL2FuZ3VsYXJfZGV2a2l0L2J1aWxkX2FuZ3VsYXIvc3JjL2thcm1hL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7O0FBUUgsK0NBQTBGO0FBRTFGLCtCQUFzQztBQUN0Qyw4Q0FBMkM7QUFHM0MsaUZBS3FEO0FBQ3JELGdGQUE0RTtBQUM1RSxrR0FBNkY7QUFDN0Ysb0NBQW1FO0FBRW5FLE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUc5QyxNQUFhLFlBQVk7SUFDdkIsWUFBbUIsT0FBdUI7UUFBdkIsWUFBTyxHQUFQLE9BQU8sQ0FBZ0I7SUFBSSxDQUFDO0lBRS9DLEdBQUcsQ0FBQyxhQUF1RDtRQUN6RCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUM7UUFDekMsTUFBTSxXQUFXLEdBQUcsY0FBTyxDQUFDLElBQUksRUFBRSxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdEQsTUFBTSxJQUFJLEdBQUcsSUFBSSxnQkFBUyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQWdDLENBQUMsQ0FBQztRQUVwRixNQUFNLE9BQU8sR0FBRyw4QkFBc0IsQ0FDcEMsSUFBSSxFQUNKLElBQUksRUFDSixhQUFhLENBQ2QsQ0FBQztRQUVGLE9BQU8sU0FBRSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FDbEIscUJBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLGlCQUFVLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDbkMsTUFBTSxLQUFLLEdBQUcsNkNBQW9CLENBQUMsb0JBQWEsQ0FBQyxXQUFXLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUN4RSxNQUFNLFdBQVcsR0FBRyxvQkFBYSxDQUFDLGNBQU8sQ0FBQyxJQUFJLEVBQUUsZ0JB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LGNBQWMsR0FBUztZQUMzQixpQ0FBZSxDQUFDLEdBQUcsQ0FBQztZQUNwQixpQ0FBZSxDQUFDLEdBQUcsQ0FBQztZQUNwQixxQ0FBbUIsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDO1lBQzlCLCtCQUFhLENBQUMsR0FBRyxDQUFDO1NBQ25CLENBQUM7UUFFRixPQUFPLFlBQVksQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUN0QyxDQUFDO0NBQ0Y7QUFqSUQsb0NBaUlDO0FBRUQsa0JBQWUsWUFBWSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBCdWlsZEV2ZW50LFxuICBCdWlsZGVyLFxuICBCdWlsZGVyQ29uZmlndXJhdGlvbixcbiAgQnVpbGRlckNvbnRleHQsXG59IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9hcmNoaXRlY3QnO1xuaW1wb3J0IHsgUGF0aCwgZ2V0U3lzdGVtUGF0aCwgbm9ybWFsaXplLCByZXNvbHZlLCB2aXJ0dWFsRnMgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvY29yZSc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBvZiB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgY29uY2F0TWFwIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7IC8vIHRzbGludDpkaXNhYmxlLWxpbmU6bm8taW1wbGljaXQtZGVwZW5kZW5jaWVzXG5pbXBvcnQgeyBXZWJwYWNrQ29uZmlnT3B0aW9ucyB9IGZyb20gJy4uL2FuZ3VsYXItY2xpLWZpbGVzL21vZGVscy9idWlsZC1vcHRpb25zJztcbmltcG9ydCB7XG4gIGdldENvbW1vbkNvbmZpZyxcbiAgZ2V0Tm9uQW90VGVzdENvbmZpZyxcbiAgZ2V0U3R5bGVzQ29uZmlnLFxuICBnZXRUZXN0Q29uZmlnLFxufSBmcm9tICcuLi9hbmd1bGFyLWNsaS1maWxlcy9tb2RlbHMvd2VicGFjay1jb25maWdzJztcbmltcG9ydCB7IHJlYWRUc2NvbmZpZyB9IGZyb20gJy4uL2FuZ3VsYXItY2xpLWZpbGVzL3V0aWxpdGllcy9yZWFkLXRzY29uZmlnJztcbmltcG9ydCB7IHJlcXVpcmVQcm9qZWN0TW9kdWxlIH0gZnJvbSAnLi4vYW5ndWxhci1jbGktZmlsZXMvdXRpbGl0aWVzL3JlcXVpcmUtcHJvamVjdC1tb2R1bGUnO1xuaW1wb3J0IHsgZGVmYXVsdFByb2dyZXNzLCBub3JtYWxpemVCdWlsZGVyU2NoZW1hIH0gZnJvbSAnLi4vdXRpbHMnO1xuaW1wb3J0IHsgS2FybWFCdWlsZGVyU2NoZW1hLCBOb3JtYWxpemVkS2FybWFCdWlsZGVyU2NoZW1hIH0gZnJvbSAnLi9zY2hlbWEnO1xuY29uc3Qgd2VicGFja01lcmdlID0gcmVxdWlyZSgnd2VicGFjay1tZXJnZScpO1xuXG5cbmV4cG9ydCBjbGFzcyBLYXJtYUJ1aWxkZXIgaW1wbGVtZW50cyBCdWlsZGVyPEthcm1hQnVpbGRlclNjaGVtYT4ge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgY29udGV4dDogQnVpbGRlckNvbnRleHQpIHsgfVxuXG4gIHJ1bihidWlsZGVyQ29uZmlnOiBCdWlsZGVyQ29uZmlndXJhdGlvbjxLYXJtYUJ1aWxkZXJTY2hlbWE+KTogT2JzZXJ2YWJsZTxCdWlsZEV2ZW50PiB7XG4gICAgY29uc3Qgcm9vdCA9IHRoaXMuY29udGV4dC53b3Jrc3BhY2Uucm9vdDtcbiAgICBjb25zdCBwcm9qZWN0Um9vdCA9IHJlc29sdmUocm9vdCwgYnVpbGRlckNvbmZpZy5yb290KTtcbiAgICBjb25zdCBob3N0ID0gbmV3IHZpcnR1YWxGcy5BbGlhc0hvc3QodGhpcy5jb250ZXh0Lmhvc3QgYXMgdmlydHVhbEZzLkhvc3Q8ZnMuU3RhdHM+KTtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSBub3JtYWxpemVCdWlsZGVyU2NoZW1hKFxuICAgICAgaG9zdCxcbiAgICAgIHJvb3QsXG4gICAgICBidWlsZGVyQ29uZmlnLFxuICAgICk7XG5cbiAgICByZXR1cm4gb2YobnVsbCkucGlwZShcbiAgICAgIGNvbmNhdE1hcCgoKSA9PiBuZXcgT2JzZXJ2YWJsZShvYnMgPT4ge1xuICAgICAgICBjb25zdCBrYXJtYSA9IHJlcXVpcmVQcm9qZWN0TW9kdWxlKGdldFN5c3RlbVBhdGgocHJvamVjdFJvb3QpLCAna2FybWEnKTtcbiAgICAgICAgY29uc3Qga2FybWFDb25maWcgPSBnZXRTeXN0ZW1QYXRoKHJlc29sdmUocm9vdCwgbm9ybWFsaXplKG9wdGlvbnMua2FybWFDb25maWcpKSk7XG5cbiAgICAgICAgLy8gVE9ETzogYWRqdXN0IG9wdGlvbnMgdG8gYWNjb3VudCBmb3Igbm90IHBhc3NpbmcgdGhlbSBibGluZGx5IHRvIGthcm1hLlxuICAgICAgICAvLyBjb25zdCBrYXJtYU9wdGlvbnM6IGFueSA9IE9iamVjdC5hc3NpZ24oe30sIG9wdGlvbnMpO1xuICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYW55XG4gICAgICAgIGNvbnN0IGthcm1hT3B0aW9uczogYW55ID0ge307XG5cbiAgICAgICAgaWYgKG9wdGlvbnMud2F0Y2ggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGthcm1hT3B0aW9ucy5zaW5nbGVSdW4gPSAhb3B0aW9ucy53YXRjaDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENvbnZlcnQgYnJvd3NlcnMgZnJvbSBhIHN0cmluZyB0byBhbiBhcnJheVxuICAgICAgICBpZiAob3B0aW9ucy5icm93c2Vycykge1xuICAgICAgICAgIGthcm1hT3B0aW9ucy5icm93c2VycyA9IG9wdGlvbnMuYnJvd3NlcnMuc3BsaXQoJywnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvcHRpb25zLnJlcG9ydGVycykge1xuICAgICAgICAgIC8vIFNwbGl0IGFsb25nIGNvbW1hcyB0byBtYWtlIGl0IG1vcmUgbmF0dXJhbCwgYW5kIHJlbW92ZSBlbXB0eSBzdHJpbmdzLlxuICAgICAgICAgIGNvbnN0IHJlcG9ydGVycyA9IG9wdGlvbnMucmVwb3J0ZXJzXG4gICAgICAgICAgICAucmVkdWNlPHN0cmluZ1tdPigoYWNjLCBjdXJyKSA9PiBhY2MuY29uY2F0KGN1cnIuc3BsaXQoLywvKSksIFtdKVxuICAgICAgICAgICAgLmZpbHRlcih4ID0+ICEheCk7XG5cbiAgICAgICAgICBpZiAocmVwb3J0ZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGthcm1hT3B0aW9ucy5yZXBvcnRlcnMgPSByZXBvcnRlcnM7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc291cmNlUm9vdCA9IGJ1aWxkZXJDb25maWcuc291cmNlUm9vdCAmJiByZXNvbHZlKHJvb3QsIGJ1aWxkZXJDb25maWcuc291cmNlUm9vdCk7XG5cbiAgICAgICAga2FybWFPcHRpb25zLmJ1aWxkV2VicGFjayA9IHtcbiAgICAgICAgICByb290OiBnZXRTeXN0ZW1QYXRoKHJvb3QpLFxuICAgICAgICAgIHByb2plY3RSb290OiBnZXRTeXN0ZW1QYXRoKHByb2plY3RSb290KSxcbiAgICAgICAgICBvcHRpb25zLFxuICAgICAgICAgIHdlYnBhY2tDb25maWc6IHRoaXMuYnVpbGRXZWJwYWNrQ29uZmlnKHJvb3QsIHByb2plY3RSb290LCBzb3VyY2VSb290LCBob3N0LCBvcHRpb25zKSxcbiAgICAgICAgICAvLyBQYXNzIG9udG8gS2FybWEgdG8gZW1pdCBCdWlsZEV2ZW50cy5cbiAgICAgICAgICBzdWNjZXNzQ2I6ICgpID0+IG9icy5uZXh0KHsgc3VjY2VzczogdHJ1ZSB9KSxcbiAgICAgICAgICBmYWlsdXJlQ2I6ICgpID0+IG9icy5uZXh0KHsgc3VjY2VzczogZmFsc2UgfSksXG4gICAgICAgICAgLy8gV29ya2Fyb3VuZCBmb3IgaHR0cHM6Ly9naXRodWIuY29tL2thcm1hLXJ1bm5lci9rYXJtYS9pc3N1ZXMvMzE1NFxuICAgICAgICAgIC8vIFdoZW4gdGhpcyB3b3JrYXJvdW5kIGlzIHJlbW92ZWQsIHVzZXIgcHJvamVjdHMgbmVlZCB0byBiZSB1cGRhdGVkIHRvIHVzZSBhIEthcm1hXG4gICAgICAgICAgLy8gdmVyc2lvbiB0aGF0IGhhcyBhIGZpeCBmb3IgdGhpcyBpc3N1ZS5cbiAgICAgICAgICB0b0pTT046ICgpID0+IHsgfSxcbiAgICAgICAgICBsb2dnZXI6IHRoaXMuY29udGV4dC5sb2dnZXIsXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gVE9ETzogaW5zaWRlIHRoZSBjb25maWdzLCBhbHdheXMgdXNlIHRoZSBwcm9qZWN0IHJvb3QgYW5kIG5vdCB0aGUgd29ya3NwYWNlIHJvb3QuXG4gICAgICAgIC8vIFVudGlsIHRoZW4gd2UgcHJldGVuZCB0aGUgYXBwIHJvb3QgaXMgcmVsYXRpdmUgKGBgKSBidXQgdGhlIHNhbWUgYXMgYHByb2plY3RSb290YC5cbiAgICAgICAga2FybWFPcHRpb25zLmJ1aWxkV2VicGFjay5vcHRpb25zLnJvb3QgPSAnJztcblxuICAgICAgICAvLyBBc3NpZ24gYWRkaXRpb25hbCBrYXJtYUNvbmZpZyBvcHRpb25zIHRvIHRoZSBsb2NhbCBuZ2FwcCBjb25maWdcbiAgICAgICAga2FybWFPcHRpb25zLmNvbmZpZ0ZpbGUgPSBrYXJtYUNvbmZpZztcblxuICAgICAgICAvLyBDb21wbGV0ZSB0aGUgb2JzZXJ2YWJsZSBvbmNlIHRoZSBLYXJtYSBzZXJ2ZXIgcmV0dXJucy5cbiAgICAgICAgY29uc3Qga2FybWFTZXJ2ZXIgPSBuZXcga2FybWEuU2VydmVyKGthcm1hT3B0aW9ucywgKCkgPT4gb2JzLmNvbXBsZXRlKCkpO1xuICAgICAgICBjb25zdCBrYXJtYVN0YXJ0UHJvbWlzZSA9IGthcm1hU2VydmVyLnN0YXJ0KCk7XG5cbiAgICAgICAgLy8gQ2xlYW51cCwgc2lnbmFsIEthcm1hIHRvIGV4aXQuXG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgLy8gS2FybWEgb25seSBoYXMgdGhlIGBzdG9wYCBtZXRob2Qgc3RhcnQgd2l0aCAzLjEuMSwgc28gd2UgbXVzdCBkZWZlbnNpdmVseSBjaGVjay5cbiAgICAgICAgICBpZiAoa2FybWFTZXJ2ZXIuc3RvcCAmJiB0eXBlb2Yga2FybWFTZXJ2ZXIuc3RvcCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgcmV0dXJuIGthcm1hU3RhcnRQcm9taXNlLnRoZW4oKCkgPT4ga2FybWFTZXJ2ZXIuc3RvcCgpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9KSksXG4gICAgKTtcbiAgfVxuXG4gIGJ1aWxkV2VicGFja0NvbmZpZyhcbiAgICByb290OiBQYXRoLFxuICAgIHByb2plY3RSb290OiBQYXRoLFxuICAgIHNvdXJjZVJvb3Q6IFBhdGggfCB1bmRlZmluZWQsXG4gICAgaG9zdDogdmlydHVhbEZzLkhvc3Q8ZnMuU3RhdHM+LFxuICAgIG9wdGlvbnM6IE5vcm1hbGl6ZWRLYXJtYUJ1aWxkZXJTY2hlbWEsXG4gICkge1xuICAgIGxldCB3Y286IFdlYnBhY2tDb25maWdPcHRpb25zO1xuXG4gICAgY29uc3QgdHNDb25maWdQYXRoID0gZ2V0U3lzdGVtUGF0aChyZXNvbHZlKHJvb3QsIG5vcm1hbGl6ZShvcHRpb25zLnRzQ29uZmlnKSkpO1xuICAgIGNvbnN0IHRzQ29uZmlnID0gcmVhZFRzY29uZmlnKHRzQ29uZmlnUGF0aCk7XG5cbiAgICBjb25zdCBwcm9qZWN0VHMgPSByZXF1aXJlUHJvamVjdE1vZHVsZShnZXRTeXN0ZW1QYXRoKHByb2plY3RSb290KSwgJ3R5cGVzY3JpcHQnKSBhcyB0eXBlb2YgdHM7XG5cbiAgICBjb25zdCBzdXBwb3J0RVMyMDE1ID0gdHNDb25maWcub3B0aW9ucy50YXJnZXQgIT09IHByb2plY3RUcy5TY3JpcHRUYXJnZXQuRVMzXG4gICAgICAmJiB0c0NvbmZpZy5vcHRpb25zLnRhcmdldCAhPT0gcHJvamVjdFRzLlNjcmlwdFRhcmdldC5FUzU7XG5cbiAgICBjb25zdCBjb21wYXRPcHRpb25zOiB0eXBlb2Ygd2NvWydidWlsZE9wdGlvbnMnXSA9IHtcbiAgICAgIC4uLm9wdGlvbnMgYXMge30gYXMgdHlwZW9mIHdjb1snYnVpbGRPcHRpb25zJ10sXG4gICAgICAvLyBTb21lIGFzc2V0IGxvZ2ljIGluc2lkZSBnZXRDb21tb25Db25maWcgbmVlZHMgb3V0cHV0UGF0aCB0byBiZSBzZXQuXG4gICAgICBvdXRwdXRQYXRoOiAnJyxcbiAgICB9O1xuXG4gICAgd2NvID0ge1xuICAgICAgcm9vdDogZ2V0U3lzdGVtUGF0aChyb290KSxcbiAgICAgIGxvZ2dlcjogdGhpcy5jb250ZXh0LmxvZ2dlcixcbiAgICAgIHByb2plY3RSb290OiBnZXRTeXN0ZW1QYXRoKHByb2plY3RSb290KSxcbiAgICAgIHNvdXJjZVJvb3Q6IHNvdXJjZVJvb3QgJiYgZ2V0U3lzdGVtUGF0aChzb3VyY2VSb290KSxcbiAgICAgIC8vIFRPRE86IHVzZSBvbmx5IHRoaXMub3B0aW9ucywgaXQgY29udGFpbnMgYWxsIGZsYWdzIGFuZCBjb25maWdzIGl0ZW1zIGFscmVhZHkuXG4gICAgICBidWlsZE9wdGlvbnM6IGNvbXBhdE9wdGlvbnMsXG4gICAgICB0c0NvbmZpZyxcbiAgICAgIHRzQ29uZmlnUGF0aCxcbiAgICAgIHN1cHBvcnRFUzIwMTUsXG4gICAgfTtcblxuICAgIHdjby5idWlsZE9wdGlvbnMucHJvZ3Jlc3MgPSBkZWZhdWx0UHJvZ3Jlc3Mod2NvLmJ1aWxkT3B0aW9ucy5wcm9ncmVzcyk7XG5cbiAgICBjb25zdCB3ZWJwYWNrQ29uZmlnczoge31bXSA9IFtcbiAgICAgIGdldENvbW1vbkNvbmZpZyh3Y28pLFxuICAgICAgZ2V0U3R5bGVzQ29uZmlnKHdjbyksXG4gICAgICBnZXROb25Bb3RUZXN0Q29uZmlnKHdjbywgaG9zdCksXG4gICAgICBnZXRUZXN0Q29uZmlnKHdjbyksXG4gICAgXTtcblxuICAgIHJldHVybiB3ZWJwYWNrTWVyZ2Uod2VicGFja0NvbmZpZ3MpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEthcm1hQnVpbGRlcjtcbiJdfQ==