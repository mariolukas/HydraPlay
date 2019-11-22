"use strict";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
// tslint:disable
// TODO: cleanup this file, it's copied as is from Angular CLI.
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const glob = require("glob");
const webpack = require("webpack");
const webpackDevMiddleware = require('webpack-dev-middleware');
const karma_webpack_failure_cb_1 = require("./karma-webpack-failure-cb");
const stats_1 = require("../utilities/stats");
const stats_2 = require("../models/webpack-configs/stats");
const node_1 = require("@angular-devkit/core/node");
/**
 * Enumerate needed (but not require/imported) dependencies from this file
 *  to let the dependency validator know they are used.
 *
 * require('source-map-support')
 * require('karma-source-map-support')
 */
let blocked = [];
let isBlocked = false;
let webpackMiddleware;
let successCb;
let failureCb;
// Add files to the Karma files array.
function addKarmaFiles(files, newFiles, prepend = false) {
    const defaults = {
        included: true,
        served: true,
        watched: true
    };
    const processedFiles = newFiles
        // Remove globs that do not match any files, otherwise Karma will show a warning for these.
        .filter(file => glob.sync(file.pattern, { nodir: true }).length != 0)
        // Fill in pattern properties with defaults.
        .map(file => (Object.assign({}, defaults, file)));
    // It's important to not replace the array, because
    // karma already has a reference to the existing array.
    if (prepend) {
        files.unshift(...processedFiles);
    }
    else {
        files.push(...processedFiles);
    }
}
const init = (config, emitter, customFileHandlers) => {
    if (!config.buildWebpack) {
        throw new Error(`The '@angular-devkit/build-angular/plugins/karma' karma plugin is meant to` +
            ` be used from within Angular CLI and will not work correctly outside of it.`);
    }
    const options = config.buildWebpack.options;
    const logger = config.buildWebpack.logger || node_1.createConsoleLogger();
    successCb = config.buildWebpack.successCb;
    failureCb = config.buildWebpack.failureCb;
    config.reporters.unshift('@angular-devkit/build-angular--event-reporter');
    // When using code-coverage, auto-add coverage-istanbul.
    config.reporters = config.reporters || [];
    if (options.codeCoverage && config.reporters.indexOf('coverage-istanbul') === -1) {
        config.reporters.unshift('coverage-istanbul');
    }
    // Add a reporter that fixes sourcemap urls.
    if (options.sourceMap.scripts) {
        config.reporters.unshift('@angular-devkit/build-angular--sourcemap-reporter');
        // Code taken from https://github.com/tschaub/karma-source-map-support.
        // We can't use it directly because we need to add it conditionally in this file, and karma
        // frameworks cannot be added dynamically.
        const smsPath = path.dirname(require.resolve('source-map-support'));
        const ksmsPath = path.dirname(require.resolve('karma-source-map-support'));
        addKarmaFiles(config.files, [
            { pattern: path.join(smsPath, 'browser-source-map-support.js'), watched: false },
            { pattern: path.join(ksmsPath, 'client.js'), watched: false }
        ], true);
    }
    // Add webpack config.
    const webpackConfig = config.buildWebpack.webpackConfig;
    const webpackMiddlewareConfig = {
        // Hide webpack output because its noisy.
        logLevel: 'error',
        stats: false,
        watchOptions: { poll: options.poll },
        publicPath: '/_karma_webpack_/',
    };
    const compilationErrorCb = (error, errors) => {
        // Notify potential listeners of the compile error
        emitter.emit('compile_error', errors);
        // Finish Karma run early in case of compilation error.
        emitter.emit('run_complete', [], { exitCode: 1 });
        // Unblock any karma requests (potentially started using `karma run`)
        unblock();
    };
    webpackConfig.plugins.push(new karma_webpack_failure_cb_1.KarmaWebpackFailureCb(compilationErrorCb));
    // Use existing config if any.
    config.webpack = Object.assign(webpackConfig, config.webpack);
    config.webpackMiddleware = Object.assign(webpackMiddlewareConfig, config.webpackMiddleware);
    // Our custom context and debug files list the webpack bundles directly instead of using
    // the karma files array.
    config.customContextFile = `${__dirname}/karma-context.html`;
    config.customDebugFile = `${__dirname}/karma-debug.html`;
    // Add the request blocker and the webpack server fallback.
    config.beforeMiddleware = config.beforeMiddleware || [];
    config.beforeMiddleware.push('@angular-devkit/build-angular--blocker');
    config.middleware = config.middleware || [];
    config.middleware.push('@angular-devkit/build-angular--fallback');
    // The webpack tier owns the watch behavior so we want to force it in the config.
    webpackConfig.watch = !config.singleRun;
    if (config.singleRun) {
        // There's no option to turn off file watching in webpack-dev-server, but
        // we can override the file watcher instead.
        webpackConfig.plugins.unshift({
            apply: (compiler) => {
                compiler.hooks.afterEnvironment.tap('karma', () => {
                    compiler.watchFileSystem = { watch: () => { } };
                });
            },
        });
    }
    // Files need to be served from a custom path for Karma.
    webpackConfig.output.path = '/_karma_webpack_/';
    webpackConfig.output.publicPath = '/_karma_webpack_/';
    webpackConfig.output.devtoolModuleFilenameTemplate = '[namespace]/[resource-path]?[loaders]';
    let compiler;
    try {
        compiler = webpack(webpackConfig);
    }
    catch (e) {
        logger.error(e.stack || e);
        if (e.details) {
            logger.error(e.details);
        }
        throw e;
    }
    function handler(callback) {
        isBlocked = true;
        if (typeof callback === 'function') {
            callback();
        }
    }
    compiler.hooks.invalid.tap('karma', () => handler());
    compiler.hooks.watchRun.tapAsync('karma', (_, callback) => handler(callback));
    compiler.hooks.run.tapAsync('karma', (_, callback) => handler(callback));
    function unblock() {
        isBlocked = false;
        blocked.forEach((cb) => cb());
        blocked = [];
    }
    let lastCompilationHash;
    const statsConfig = stats_2.getWebpackStatsConfig();
    compiler.hooks.done.tap('karma', (stats) => {
        if (stats.compilation.errors.length > 0) {
            const json = stats.toJson(config.stats);
            // Print compilation errors.
            logger.error(stats_1.statsErrorsToString(json, statsConfig));
            lastCompilationHash = undefined;
            // Emit a failure build event if there are compilation errors.
            failureCb && failureCb();
        }
        else if (stats.hash != lastCompilationHash) {
            // Refresh karma only when there are no webpack errors, and if the compilation changed.
            lastCompilationHash = stats.hash;
            emitter.refreshFiles();
        }
        unblock();
    });
    webpackMiddleware = new webpackDevMiddleware(compiler, webpackMiddlewareConfig);
    // Forward requests to webpack server.
    customFileHandlers.push({
        urlRegex: /^\/_karma_webpack_\/.*/,
        handler: function handler(req, res) {
            webpackMiddleware(req, res, function () {
                // Ensure script and style bundles are served.
                // They are mentioned in the custom karma context page and we don't want them to 404.
                const alwaysServe = [
                    '/_karma_webpack_/runtime.js',
                    '/_karma_webpack_/polyfills.js',
                    '/_karma_webpack_/scripts.js',
                    '/_karma_webpack_/styles.js',
                    '/_karma_webpack_/vendor.js',
                ];
                if (alwaysServe.indexOf(req.url) != -1) {
                    res.statusCode = 200;
                    res.end();
                }
                else {
                    res.statusCode = 404;
                    res.end('Not found');
                }
            });
        }
    });
    emitter.on('exit', (done) => {
        webpackMiddleware.close();
        done();
    });
};
init.$inject = ['config', 'emitter', 'customFileHandlers'];
// Block requests until the Webpack compilation is done.
function requestBlocker() {
    return function (_request, _response, next) {
        if (isBlocked) {
            blocked.push(next);
        }
        else {
            next();
        }
    };
}
// Copied from "karma-jasmine-diff-reporter" source code:
// In case, when multiple reporters are used in conjunction
// with initSourcemapReporter, they both will show repetitive log
// messages when displaying everything that supposed to write to terminal.
// So just suppress any logs from initSourcemapReporter by doing nothing on
// browser log, because it is an utility reporter,
// unless it's alone in the "reporters" option and base reporter is used.
function muteDuplicateReporterLogging(context, config) {
    context.writeCommonMsg = function () { };
    const reporterName = '@angular/cli';
    const hasTrailingReporters = config.reporters.slice(-1).pop() !== reporterName;
    if (hasTrailingReporters) {
        context.writeCommonMsg = function () { };
    }
}
// Emits builder events.
const eventReporter = function (baseReporterDecorator, config) {
    baseReporterDecorator(this);
    muteDuplicateReporterLogging(this, config);
    this.onRunComplete = function (_browsers, results) {
        if (results.exitCode === 0) {
            successCb && successCb();
        }
        else {
            failureCb && failureCb();
        }
    };
    // avoid duplicate failure message
    this.specFailure = () => { };
};
eventReporter.$inject = ['baseReporterDecorator', 'config'];
// Strip the server address and webpack scheme (webpack://) from error log.
const sourceMapReporter = function (baseReporterDecorator, config) {
    baseReporterDecorator(this);
    muteDuplicateReporterLogging(this, config);
    const urlRegexp = /http:\/\/localhost:\d+\/_karma_webpack_\/webpack:\//gi;
    this.onSpecComplete = function (_browser, result) {
        if (!result.success && result.log.length > 0) {
            result.log.forEach((log, idx) => {
                result.log[idx] = log.replace(urlRegexp, '');
            });
        }
    };
    // avoid duplicate complete message
    this.onRunComplete = () => { };
    // avoid duplicate failure message
    this.specFailure = () => { };
};
sourceMapReporter.$inject = ['baseReporterDecorator', 'config'];
// When a request is not found in the karma server, try looking for it from the webpack server root.
function fallbackMiddleware() {
    return function (req, res, next) {
        if (webpackMiddleware) {
            const webpackUrl = '/_karma_webpack_' + req.url;
            const webpackReq = Object.assign({}, req, { url: webpackUrl });
            webpackMiddleware(webpackReq, res, next);
        }
        else {
            next();
        }
    };
}
module.exports = {
    'framework:@angular-devkit/build-angular': ['factory', init],
    'reporter:@angular-devkit/build-angular--sourcemap-reporter': ['type', sourceMapReporter],
    'reporter:@angular-devkit/build-angular--event-reporter': ['type', eventReporter],
    'middleware:@angular-devkit/build-angular--blocker': ['factory', requestBlocker],
    'middleware:@angular-devkit/build-angular--fallback': ['factory', fallbackMiddleware]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2FybWEuanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL2FuZ3VsYXJfZGV2a2l0L2J1aWxkX2FuZ3VsYXIvc3JjL2FuZ3VsYXItY2xpLWZpbGVzL3BsdWdpbnMva2FybWEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRztBQUNILGlCQUFpQjtBQUNqQiwrREFBK0Q7O0FBRS9ELDZCQUE2QjtBQUM3Qiw2QkFBNkI7QUFDN0IsbUNBQW1DO0FBQ25DLE1BQU0sb0JBQW9CLEdBQUcsT0FBTyxDQUFDLHdCQUF3QixDQUFDLENBQUM7QUFFL0QseUVBQW1FO0FBQ25FLDhDQUF5RDtBQUN6RCwyREFBd0U7QUFDeEUsb0RBQWdFO0FBSWhFOzs7Ozs7R0FNRztBQUdILElBQUksT0FBTyxHQUFVLEVBQUUsQ0FBQztBQUN4QixJQUFJLFNBQVMsR0FBRyxLQUFLLENBQUM7QUFDdEIsSUFBSSxpQkFBc0IsQ0FBQztBQUMzQixJQUFJLFNBQXFCLENBQUM7QUFDMUIsSUFBSSxTQUFxQixDQUFDO0FBRTFCLHNDQUFzQztBQUN0QyxTQUFTLGFBQWEsQ0FBQyxLQUFZLEVBQUUsUUFBZSxFQUFFLE9BQU8sR0FBRyxLQUFLO0lBQ25FLE1BQU0sUUFBUSxHQUFHO1FBQ2YsUUFBUSxFQUFFLElBQUk7UUFDZCxNQUFNLEVBQUUsSUFBSTtRQUNaLE9BQU8sRUFBRSxJQUFJO0tBQ2QsQ0FBQztJQUVGLE1BQU0sY0FBYyxHQUFHLFFBQVE7UUFDN0IsMkZBQTJGO1NBQzFGLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUM7UUFDckUsNENBQTRDO1NBQzNDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLG1CQUFNLFFBQVEsRUFBSyxJQUFJLEVBQUcsQ0FBQyxD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R0FBRyxFQUFFLFVBQVUsR0FBRSxDQUFBO1lBQzlDLGlCQUFpQixDQUFDLFVBQVUsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDMUM7YUFBTTtZQUNMLElBQUksRUFBRSxDQUFDO1NBQ1I7SUFDSCxDQUFDLENBQUM7QUFDSixDQUFDO0FBRUQsTUFBTSxDQUFDLE9BQU8sR0FBRztJQUNmLHlDQUF5QyxFQUFFLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQztJQUM1RCw0REFBNEQsRUFBRSxDQUFDLE1BQU0sRUFBRSxpQkFBaUIsQ0FBQztJQUN6Rix3REFBd0QsRUFBRSxDQUFDLE1BQU0sRUFBRSxhQUFhLENBQUM7SUFDakYsbURBQW1ELEVBQUUsQ0FBQyxTQUFTLEVBQUUsY0FBYyxDQUFDO0lBQ2hGLG9EQUFvRCxFQUFFLENBQUMsU0FBUyxFQUFFLGtCQUFrQixDQUFDO0NBQ3RGLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG4vLyB0c2xpbnQ6ZGlzYWJsZVxuLy8gVE9ETzogY2xlYW51cCB0aGlzIGZpbGUsIGl0J3MgY29waWVkIGFzIGlzIGZyb20gQW5ndWxhciBDTEkuXG5cbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBnbG9iIGZyb20gJ2dsb2InO1xuaW1wb3J0ICogYXMgd2VicGFjayBmcm9tICd3ZWJwYWNrJztcbmNvbnN0IHdlYnBhY2tEZXZNaWRkbGV3YXJlID0gcmVxdWlyZSgnd2VicGFjay1kZXYtbWlkZGxld2FyZScpO1xuXG5pbXBvcnQgeyBLYXJtYVdlYnBhY2tGYWlsdXJlQ2IgfSBmcm9tICcuL2thcm1hLXdlYnBhY2stZmFpbHVyZS1jYic7XG5pbXBvcnQgeyBzdGF0c0Vycm9yc1RvU3RyaW5nIH0gZnJvbSAnLi4vdXRpbGl0aWVzL3N0YXRzJztcbmltcG9ydCB7IGdldFdlYnBhY2tTdGF0c0NvbmZpZyB9IGZyb20gJy4uL21vZGVscy93ZWJwYWNrLWNvbmZpZ3Mvc3RhdHMnO1xuaW1wb3J0IHsgY3JlYXRlQ29uc29sZUxvZ2dlciB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9jb3JlL25vZGUnO1xuaW1wb3J0IHsgbG9nZ2luZyB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9jb3JlJztcbmltcG9ydCB7IFdlYnBhY2tUZXN0T3B0aW9ucyB9IGZyb20gJy4uL21vZGVscy9idWlsZC1vcHRpb25zJztcblxuLyoqXG4gKiBFbnVtZXJhdGUgbmVlZGVkIChidXQgbm90IHJlcXVpcmUvaW1wb3J0ZWQpIGRlcGVuZGVuY2llcyBmcm9tIHRoaXMgZmlsZVxuICogIHRvIGxldCB0aGUgZGVwZW5kZW5jeSB2YWxpZGF0b3Iga25vdyB0aGV5IGFyZSB1c2VkLlxuICpcbiAqIHJlcXVpcmUoJ3NvdXJjZS1tYXAtc3VwcG9ydCcpXG4gKiByZXF1aXJlKCdrYXJtYS1zb3VyY2UtbWFwLXN1cHBvcnQnKVxuICovXG5cblxubGV0IGJsb2NrZWQ6IGFueVtdID0gW107XG5sZXQgaXNCbG9ja2VkID0gZmFsc2U7XG5sZXQgd2VicGFja01pZGRsZXdhcmU6IGFueTtcbmxldCBzdWNjZXNzQ2I6ICgpID0+IHZvaWQ7XG5sZXQgZmFpbHVyZUNiOiAoKSA9PiB2b2lkO1xuXG4vLyBBZGQgZmlsZXMgdG8gdGhlIEthcm1hIGZpbGVzIGFycmF5LlxuZnVuY3Rpb24gYWRkS2FybWFGaWxlcyhmaWxlczogYW55W10sIG5ld0ZpbGVzOiBhbnlbXSwgcHJlcGVuZCA9IGZhbHNlKSB7XG4gIGNvbnN0IGRlZmF1bHRzID0ge1xuICAgIGluY2x1ZGVkOiB0cnVlLFxuICAgIHNlcnZlZDogdHJ1ZSxcbiAgICB3YXRjaGVkOiB0cnVlXG4gIH07XG5cbiAgY29uc3QgcHJvY2Vzc2VkRmlsZXMgPSBuZXdGaWxlc1xuICAgIC8vIFJlbW92ZSBnbG9icyB0aGF0IGRvIG5vdCBtYXRjaCBhbnkgZmlsZXMsIG90aGVyd2lzZSBLYXJtYSB3aWxsIHNob3cgYSB3YXJuaW5nIGZvciB0aGVzZS5cbiAgICAuZmlsdGVyKGZpbGUgPT4gZ2xvYi5zeW5jKGZpbGUucGF0dGVybiwgeyBub2RpcjogdHJ1ZSB9KS5sZW5ndGggIT0gMClcbiAgICAvLyBGaWxsIGluIHBhdHRlcm4gcHJvcGVydGllcyB3aXRoIGRlZmF1bHRzLlxuICAgIC5tYXAoZmlsZSA9PiAoeyAuLi5kZWZhdWx0cywgLi4uZmlsZSB9KSk7XG5cbiAgLy8gSXQncyBpbXBvcnRhbnQgdG8gbm90IHJlcGxhY2UgdGhlIGFycmF5LCBiZWNhdXNlXG4gIC8vIGthcm1hIGFscmVhZHkgaGFzIGEgcmVmZXJlbmNlIHRvIHRoZSBleGlzdGluZyBhcnJheS5cbiAgaWYgKHByZXBlbmQpIHtcbiAgICBmaWxlcy51bnNoaWZ0KC4uLnByb2Nlc3NlZEZpbGVzKTtcbiAgfSBlbHNlIHtcbiAgICBmaWxlcy5wdXNoKC4uLnByb2Nlc3NlZEZpbGVzKTtcbiAgfVxufVxuXG5jb25zdCBpbml0OiBhbnkgPSAoY29uZmlnOiBhbnksIGVtaXR0ZXI6IGFueSwgY3VzdG9tRmlsZUhhbmRsZXJzOiBhbnkpID0+IHtcbiAgaWYgKCFjb25maWcuYnVpbGRXZWJwYWNrKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBUaGUgJ0Bhbmd1bGFyLWRldmtpdC9idWlsZC1hbmd1bGFyL3BsdWdpbnMva2FybWEnIGthcm1hIHBsdWdpbiBpcyBtZWFudCB0b2AgK1xuICAgIGAgYmUgdXNlZCBmcm9tIHdpdGhpbiBBbmd1bGFyIENMSSBhbmQgd2lsbCBub3Qgd29yayBjb3JyZWN0bHkgb3V0c2lkZSBvZiBpdC5gXG4gICAgKVxuICB9XG4gIGNvbnN0IG9wdGlvbnMgPSBjb25maWcuYnVpbGRXZWJwYWNrLm9wdGlvbnMgYXMgV2VicGFja1Rlc3RPcHRpb25zO1xuICBjb25zdCBsb2dnZXI6IGxvZ2dpbmcuTG9nZ2VyID0gY29uZmlnLmJ1aWxkV2VicGFjay5sb2dnZXIgfHwgY3JlYXRlQ29uc29sZUxvZ2dlcigpO1xuICBzdWNjZXNzQ2IgPSBjb25maWcuYnVpbGRXZWJwYWNrLnN1Y2Nlc3NDYjtcbiAgZmFpbHVyZUNiID0gY29uZmlnLmJ1aWxkV2VicGFjay5mYWlsdXJlQ2I7XG5cbiAgY29uZmlnLnJlcG9ydGVycy51bnNoaWZ0KCdAYW5ndWxhci1kZXZraXQvYnVpbGQtYW5ndWxhci0tZXZlbnQtcmVwb3J0ZXInKTtcblxuICAvLyBXaGVuIHVzaW5nIGNvZGUtY292ZXJhZ2UsIGF1dG8tYWRkIGNvdmVyYWdlLWlzdGFuYnVsLlxuICBjb25maWcucmVwb3J0ZXJzID0gY29uZmlnLnJlcG9ydGVycyB8fCBbXTtcbiAgaWYgKG9wdGlvbnMuY29kZUNvdmVyYWdlICYmIGNvbmZpZy5yZXBvcnRlcnMuaW5kZXhPZignY292ZXJhZ2UtaXN0YW5idWwnKSA9PT0gLTEpIHtcbiAgICBjb25maWcucmVwb3J0ZXJzLnVuc2hpZnQoJ2NvdmVyYWdlLWlzdGFuYnVsJyk7XG4gIH1cblxuICAvLyBBZGQgYSByZXBvcnRlciB0aGF0IGZpeGVzIHNvdXJjZW1hcCB1cmxzLlxuICBpZiAob3B0aW9ucy5zb3VyY2VNYXAuc2NyaXB0cykge1xuICAgIGNvbmZpZy5yZXBvcnRlcnMudW5zaGlmdCgnQGFuZ3VsYXItZGV2a2l0L2J1aWxkLWFuZ3VsYXItLXNvdXJjZW1hcC1yZXBvcnRlcicpO1xuXG4gICAgLy8gQ29kZSB0YWtlbiBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS90c2NoYXViL2thcm1hLXNvdXJjZS1tYXAtc3VwcG9ydC5cbiAgICAvLyBXZSBjYW4ndCB1c2UgaXQgZGlyZWN0bHkgYmVjYXVzZSB3ZSBuZWVkIHRvIGFkZCBpdCBjb25kaXRpb25hbGx5IGluIHRoaXMgZmlsZSwgYW5kIGthcm1hXG4gICAgLy8gZnJhbWV3b3JrcyBjYW5ub3QgYmUgYWRkZWQgZHluYW1pY2FsbHkuXG4gICAgY29uc3Qgc21zUGF0aCA9IHBhdGguZGlybmFtZShyZXF1aXJlLnJlc29sdmUoJ3NvdXJjZS1tYXAtc3VwcG9ydCcpKTtcbiAgICBjb25zdCBrc21zUGF0aCA9IHBhdGguZGlybmFtZShyZXF1aXJlLnJlc29sdmUoJ2thcm1hLXNvdXJjZS1tYXAtc3VwcG9ydCcpKTtcblxuICAgIGFkZEthcm1hRmlsZXMoY29uZmlnLmZpbGVzLCBbXG4gICAgICB7IHBhdHRlcm46IHBhdGguam9pbihzbXNQYXRoLCAnYnJvd3Nlci1zb3VyY2UtbWFwLXN1cHBvcnQuanMnKSwgd2F0Y2hlZDogZmFsc2UgfSxcbiAgICAgIHsgcGF0dGVybjogcGF0aC5qb2luKGtzbXNQYXRoLCAnY2xpZW50LmpzJyksIHdhdGNoZWQ6IGZhbHNlIH1cbiAgICBdLCB0cnVlKTtcbiAgfVxuXG4gIC8vIEFkZCB3ZWJwYWNrIGNvbmZpZy5cbiAgY29uc3Qgd2VicGFja0NvbmZpZyA9IGNvbmZpZy5idWlsZFdlYnBhY2sud2VicGFja0NvbmZpZztcbiAgY29uc3Qgd2VicGFja01pZGRsZXdhcmVDb25maWcgPSB7XG4gICAgLy8gSGlkZSB3ZWJwYWNrIG91dHB1dCBiZWNhdXNlIGl0cyBub2lzeS5cbiAgICBsb2dMZXZlbDogJ2Vycm9yJyxcbiAgICBzdGF0czogZmFsc2UsXG4gICAgd2F0Y2hPcHRpb25zOiB7IHBvbGw6IG9wdGlvbnMucG9sbCB9LFxuICAgIHB1YmxpY1BhdGg6ICcvX2thcm1hX3dlYnBhY2tfLycsXG4gIH07XG5cbiAgY29uc3QgY29tcGlsYXRpb25FcnJvckNiID0gKGVycm9yOiBzdHJpbmcgfCB1bmRlZmluZWQsIGVycm9yczogc3RyaW5nW10pID0+IHtcbiAgICAvLyBOb3RpZnkgcG90ZW50aWFsIGxpc3RlbmVycyBvZiB0aGUgY29tcGlsZSBlcnJvclxuICAgIGVtaXR0ZXIuZW1pdCgnY29tcGlsZV9lcnJvcicsIGVycm9ycyk7XG5cbiAgICAvLyBGaW5pc2ggS2FybWEgcnVuIGVhcmx5IGluIGNhc2Ugb2YgY29tcGlsYXRpb24gZXJyb3IuXG4gICAgZW1pdHRlci5lbWl0KCdydW5fY29tcGxldGUnLCBbXSwgeyBleGl0Q29kZTogMSB9KTtcblxuICAgIC8vIFVuYmxvY2sgYW55IGthcm1hIHJlcXVlc3RzIChwb3RlbnRpYWxseSBzdGFydGVkIHVzaW5nIGBrYXJtYSBydW5gKVxuICAgIHVuYmxvY2soKTtcbiAgfVxuICB3ZWJwYWNrQ29uZmlnLnBsdWdpbnMucHVzaChuZXcgS2FybWFXZWJwYWNrRmFpbHVyZUNiKGNvbXBpbGF0aW9uRXJyb3JDYikpO1xuXG4gIC8vIFVzZSBleGlzdGluZyBjb25maWcgaWYgYW55LlxuICBjb25maWcud2VicGFjayA9IE9iamVjdC5hc3NpZ24od2VicGFja0NvbmZpZywgY29uZmlnLndlYnBhY2spO1xuICBjb25maWcud2VicGFja01pZGRsZXdhcmUgPSBPYmplY3QuYXNzaWduKHdlYnBhY2tNaWRkbGV3YXJlQ29uZmlnLCBjb25maWcud2VicGFja01pZGRsZXdhcmUpO1xuXG4gIC8vIE91ciBjdXN0b20gY29udGV4dCBhbmQgZGVidWcgZmlsZXMgbGlzdCB0aGUgd2VicGFjayBidW5kbGVzIGRpcmVjdGx5IGluc3RlYWQgb2YgdXNpbmdcbiAgLy8gdGhlIGthcm1hIGZpbGVzIGFycmF5LlxuICBjb25maWcuY3VzdG9tQ29udGV4dEZpbGUgPSBgJHtfX2Rpcm5hbWV9L2thcm1hLWNvbnRleHQuaHRtbGA7XG4gIGNvbmZpZy5jdXN0b21EZWJ1Z0ZpbGUgPSBgJHtfX2Rpcm5hbWV9L2thcm1hLWRlYnVnLmh0bWxgO1xuXG4gIC8vIEFkZCB0aGUgcmVxdWVzdCBibG9ja2VyIGFuZCB0aGUgd2VicGFjayBzZXJ2ZXIgZmFsbGJhY2suXG4gIGNvbmZpZy5iZWZvcmVNaWRkbGV3YXJlID0gY29uZmlnLmJlZm9yZU1pZGRsZXdhcmUgfHwgW107XG4gIGNvbmZpZy5iZWZvcmVNaWRkbGV3YXJlLnB1c2goJ0Bhbmd1bGFyLWRldmtpdC9idWlsZC1hbmd1bGFyLS1ibG9ja2VyJyk7XG4gIGNvbmZpZy5taWRkbGV3YXJlID0gY29uZmlnLm1pZGRsZXdhcmUgfHwgW107XG4gIGNvbmZpZy5taWRkbGV3YXJlLnB1c2goJ0Bhbmd1bGFyLWRldmtpdC9idWlsZC1hbmd1bGFyLS1mYWxsYmFjaycpO1xuXG4gIC8vIFRoZSB3ZWJwYWNrIHRpZXIgb3ducyB0aGUgd2F0Y2ggYmVoYXZpb3Igc28gd2Ugd2FudCB0byBmb3JjZSBpdCBpbiB0aGUgY29uZmlnLlxuICB3ZWJwYWNrQ29uZmlnLndhdGNoID0gIWNvbmZpZy5zaW5nbGVSdW47XG4gIGlmIChjb25maWcuc2luZ2xlUnVuKSB7XG4gICAgLy8gVGhlcmUncyBubyBvcHRpb24gdG8gdHVybiBvZmYgZmlsZSB3YXRjaGluZyBpbiB3ZWJwYWNrLWRldi1zZXJ2ZXIsIGJ1dFxuICAgIC8vIHdlIGNhbiBvdmVycmlkZSB0aGUgZmlsZSB3YXRjaGVyIGluc3RlYWQuXG4gICAgd2VicGFja0NvbmZpZy5wbHVnaW5zLnVuc2hpZnQoe1xuICAgICAgYXBwbHk6IChjb21waWxlcjogYW55KSA9PiB7IC8vIHRzbGludDpkaXNhYmxlLWxpbmU6bm8tYW55XG4gICAgICAgIGNvbXBpbGVyLmhvb2tzLmFmdGVyRW52aXJvbm1lbnQudGFwKCdrYXJtYScsICgpID0+IHtcbiAgICAgICAgICBjb21waWxlci53YXRjaEZpbGVTeXN0ZW0gPSB7IHdhdGNoOiAoKSA9PiB7IH0gfTtcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgIH0pO1xuICB9XG4gIC8vIEZpbGVzIG5lZWQgdG8gYmUgc2VydmVkIGZyb20gYSBjdXN0b20gcGF0aCBmb3IgS2FybWEuXG4gIHdlYnBhY2tDb25maWcub3V0cHV0LnBhdGggPSAnL19rYXJtYV93ZWJwYWNrXy8nO1xuICB3ZWJwYWNrQ29uZmlnLm91dHB1dC5wdWJsaWNQYXRoID0gJy9fa2FybWFfd2VicGFja18vJztcbiAgd2VicGFja0NvbmZpZy5vdXRwdXQuZGV2dG9vbE1vZHVsZUZpbGVuYW1lVGVtcGxhdGUgPSAnW25hbWVzcGFjZV0vW3Jlc291cmNlLXBhdGhdP1tsb2FkZXJzXSc7XG5cbiAgbGV0IGNvbXBpbGVyOiBhbnk7XG4gIHRyeSB7XG4gICAgY29tcGlsZXIgPSB3ZWJwYWNrKHdlYnBhY2tDb25maWcpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgbG9nZ2VyLmVycm9yKGUuc3RhY2sgfHwgZSlcbiAgICBpZiAoZS5kZXRhaWxzKSB7XG4gICAgICBsb2dnZXIuZXJyb3IoZS5kZXRhaWxzKVxuICAgIH1cbiAgICB0aHJvdyBlO1xuICB9XG5cbiAgZnVuY3Rpb24gaGFuZGxlcihjYWxsYmFjaz86ICgpID0+IHZvaWQpIHtcbiAgICBpc0Jsb2NrZWQgPSB0cnVlO1xuXG4gICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY2FsbGJhY2soKTtcbiAgICB9XG4gIH1cblxuICBjb21waWxlci5ob29rcy5pbnZhbGlkLnRhcCgna2FybWEnLCAoKSA9PiBoYW5kbGVyKCkpO1xuXG4gIGNvbXBpbGVyLmhvb2tzLndhdGNoUnVuLnRhcEFzeW5jKCdrYXJtYScsIChfOiBhbnksIGNhbGxiYWNrOiAoKSA9PiB2b2lkKSA9PiBoYW5kbGVyKGNhbGxiYWNrKSk7XG5cbiAgY29tcGlsZXIuaG9va3MucnVuLnRhcEFzeW5jKCdrYXJtYScsIChfOiBhbnksIGNhbGxiYWNrOiAoKSA9PiB2b2lkKSA9PiBoYW5kbGVyKGNhbGxiYWNrKSk7XG5cbiAgZnVuY3Rpb24gdW5ibG9jaygpe1xuICAgIGlzQmxvY2tlZCA9IGZhbHNlO1xuICAgIGJsb2NrZWQuZm9yRWFjaCgoY2IpID0+IGNiKCkpO1xuICAgIGJsb2NrZWQgPSBbXTtcbiAgfVxuXG4gIGxldCBsYXN0Q29tcGlsYXRpb25IYXNoOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gIGNvbnN0IHN0YXRzQ29uZmlnID0gZ2V0V2VicGFja1N0YXRzQ29uZmlnKCk7XG4gIGNvbXBpbGVyLmhvb2tzLmRvbmUudGFwKCdrYXJtYScsIChzdGF0czogYW55KSA9PiB7XG4gICAgaWYgKHN0YXRzLmNvbXBpbGF0aW9uLmVycm9ycy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCBqc29uID0gc3RhdHMudG9Kc29uKGNvbmZpZy5zdGF0cyk7XG4gICAgICAvLyBQcmludCBjb21waWxhdGlvbiBlcnJvcnMuXG4gICAgICBsb2dnZXIuZXJyb3Ioc3RhdHNFcnJvcnNUb1N0cmluZyhqc29uLCBzdGF0c0NvbmZpZykpO1xuICAgICAgbGFzdENvbXBpbGF0aW9uSGFzaCA9IHVuZGVmaW5lZDtcbiAgICAgIC8vIEVtaXQgYSBmYWlsdXJlIGJ1aWxkIGV2ZW50IGlmIHRoZXJlIGFyZSBjb21waWxhdGlvbiBlcnJvcnMuXG4gICAgICBmYWlsdXJlQ2IgJiYgZmFpbHVyZUNiKCk7XG4gICAgfSBlbHNlIGlmIChzdGF0cy5oYXNoICE9IGxhc3RDb21waWxhdGlvbkhhc2gpIHtcbiAgICAgIC8vIFJlZnJlc2gga2FybWEgb25seSB3aGVuIHRoZXJlIGFyZSBubyB3ZWJwYWNrIGVycm9ycywgYW5kIGlmIHRoZSBjb21waWxhdGlvbiBjaGFuZ2VkLlxuICAgICAgbGFzdENvbXBpbGF0aW9uSGFzaCA9IHN0YXRzLmhhc2g7XG4gICAgICBlbWl0dGVyLnJlZnJlc2hGaWxlcygpO1xuICAgIH1cbiAgICB1bmJsb2NrKCk7XG4gIH0pO1xuXG4gIHdlYnBhY2tNaWRkbGV3YXJlID0gbmV3IHdlYnBhY2tEZXZNaWRkbGV3YXJlKGNvbXBpbGVyLCB3ZWJwYWNrTWlkZGxld2FyZUNvbmZpZyk7XG5cbiAgLy8gRm9yd2FyZCByZXF1ZXN0cyB0byB3ZWJwYWNrIHNlcnZlci5cbiAgY3VzdG9tRmlsZUhhbmRsZXJzLnB1c2goe1xuICAgIHVybFJlZ2V4OiAvXlxcL19rYXJtYV93ZWJwYWNrX1xcLy4qLyxcbiAgICBoYW5kbGVyOiBmdW5jdGlvbiBoYW5kbGVyKHJlcTogYW55LCByZXM6IGFueSkge1xuICAgICAgd2VicGFja01pZGRsZXdhcmUocmVxLCByZXMsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8gRW5zdXJlIHNjcmlwdCBhbmQgc3R5bGUgYnVuZGxlcyBhcmUgc2VydmVkLlxuICAgICAgICAvLyBUaGV5IGFyZSBtZW50aW9uZWQgaW4gdGhlIGN1c3RvbSBrYXJtYSBjb250ZXh0IHBhZ2UgYW5kIHdlIGRvbid0IHdhbnQgdGhlbSB0byA0MDQuXG4gICAgICAgIGNvbnN0IGFsd2F5c1NlcnZlID0gW1xuICAgICAgICAgICcvX2thcm1hX3dlYnBhY2tfL3J1bnRpbWUuanMnLFxuICAgICAgICAgICcvX2thcm1hX3dlYnBhY2tfL3BvbHlmaWxscy5qcycsXG4gICAgICAgICAgJy9fa2FybWFfd2VicGFja18vc2NyaXB0cy5qcycsXG4gICAgICAgICAgJy9fa2FybWFfd2VicGFja18vc3R5bGVzLmpzJyxcbiAgICAgICAgICAnL19rYXJtYV93ZWJwYWNrXy92ZW5kb3IuanMnLFxuICAgICAgICBdO1xuICAgICAgICBpZiAoYWx3YXlzU2VydmUuaW5kZXhPZihyZXEudXJsKSAhPSAtMSkge1xuICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gMjAwO1xuICAgICAgICAgIHJlcy5lbmQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDQwNDtcbiAgICAgICAgICByZXMuZW5kKCdOb3QgZm91bmQnKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9KTtcblxuICBlbWl0dGVyLm9uKCdleGl0JywgKGRvbmU6IGFueSkgPT4ge1xuICAgIHdlYnBhY2tNaWRkbGV3YXJlLmNsb3NlKCk7XG4gICAgZG9uZSgpO1xuICB9KTtcbn07XG5cbmluaXQuJGluamVjdCA9IFsnY29uZmlnJywgJ2VtaXR0ZXInLCAnY3VzdG9tRmlsZUhhbmRsZXJzJ107XG5cbi8vIEJsb2NrIHJlcXVlc3RzIHVudGlsIHRoZSBXZWJwYWNrIGNvbXBpbGF0aW9uIGlzIGRvbmUuXG5mdW5jdGlvbiByZXF1ZXN0QmxvY2tlcigpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChfcmVxdWVzdDogYW55LCBfcmVzcG9uc2U6IGFueSwgbmV4dDogKCkgPT4gdm9pZCkge1xuICAgIGlmIChpc0Jsb2NrZWQpIHtcbiAgICAgIGJsb2NrZWQucHVzaChuZXh0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmV4dCgpO1xuICAgIH1cbiAgfTtcbn1cblxuLy8gQ29waWVkIGZyb20gXCJrYXJtYS1qYXNtaW5lLWRpZmYtcmVwb3J0ZXJcIiBzb3VyY2UgY29kZTpcbi8vIEluIGNhc2UsIHdoZW4gbXVsdGlwbGUgcmVwb3J0ZXJzIGFyZSB1c2VkIGluIGNvbmp1bmN0aW9uXG4vLyB3aXRoIGluaXRTb3VyY2VtYXBSZXBvcnRlciwgdGhleSBib3RoIHdpbGwgc2hvdyByZXBldGl0aXZlIGxvZ1xuLy8gbWVzc2FnZXMgd2hlbiBkaXNwbGF5aW5nIGV2ZXJ5dGhpbmcgdGhhdCBzdXBwb3NlZCB0byB3cml0ZSB0byB0ZXJtaW5hbC5cbi8vIFNvIGp1c3Qgc3VwcHJlc3MgYW55IGxvZ3MgZnJvbSBpbml0U291cmNlbWFwUmVwb3J0ZXIgYnkgZG9pbmcgbm90aGluZyBvblxuLy8gYnJvd3NlciBsb2csIGJlY2F1c2UgaXQgaXMgYW4gdXRpbGl0eSByZXBvcnRlcixcbi8vIHVubGVzcyBpdCdzIGFsb25lIGluIHRoZSBcInJlcG9ydGVyc1wiIG9wdGlvbiBhbmQgYmFzZSByZXBvcnRlciBpcyB1c2VkLlxuZnVuY3Rpb24gbXV0ZUR1cGxpY2F0ZVJlcG9ydGVyTG9nZ2luZyhjb250ZXh0OiBhbnksIGNvbmZpZzogYW55KSB7XG4gIGNvbnRleHQud3JpdGVDb21tb25Nc2cgPSBmdW5jdGlvbiAoKSB7IH07XG4gIGNvbnN0IHJlcG9ydGVyTmFtZSA9ICdAYW5ndWxhci9jbGknO1xuICBjb25zdCBoYXNUcmFpbGluZ1JlcG9ydGVycyA9IGNvbmZpZy5yZXBvcnRlcnMuc2xpY2UoLTEpLnBvcCgpICE9PSByZXBvcnRlck5hbWU7XG5cbiAgaWYgKGhhc1RyYWlsaW5nUmVwb3J0ZXJzKSB7XG4gICAgY29udGV4dC53cml0ZUNvbW1vbk1zZyA9IGZ1bmN0aW9uICgpIHsgfTtcbiAgfVxufVxuXG4vLyBFbWl0cyBidWlsZGVyIGV2ZW50cy5cbmNvbnN0IGV2ZW50UmVwb3J0ZXI6IGFueSA9IGZ1bmN0aW9uICh0aGlzOiBhbnksIGJhc2VSZXBvcnRlckRlY29yYXRvcjogYW55LCBjb25maWc6IGFueSkge1xuICBiYXNlUmVwb3J0ZXJEZWNvcmF0b3IodGhpcyk7XG5cbiAgbXV0ZUR1cGxpY2F0ZVJlcG9ydGVyTG9nZ2luZyh0aGlzLCBjb25maWcpO1xuXG4gIHRoaXMub25SdW5Db21wbGV0ZSA9IGZ1bmN0aW9uIChfYnJvd3NlcnM6IGFueSwgcmVzdWx0czogYW55KSB7XG4gICAgaWYgKHJlc3VsdHMuZXhpdENvZGUgPT09IDApIHtcbiAgICAgIHN1Y2Nlc3NDYiAmJiBzdWNjZXNzQ2IoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZmFpbHVyZUNiICYmIGZhaWx1cmVDYigpO1xuICAgIH1cbiAgfVxuXG4gIC8vIGF2b2lkIGR1cGxpY2F0ZSBmYWlsdXJlIG1lc3NhZ2VcbiAgdGhpcy5zcGVjRmFpbHVyZSA9ICgpID0+IHt9O1xufTtcblxuZXZlbnRSZXBvcnRlci4kaW5qZWN0ID0gWydiYXNlUmVwb3J0ZXJEZWNvcmF0b3InLCAnY29uZmlnJ107XG5cbi8vIFN0cmlwIHRoZSBzZXJ2ZXIgYWRkcmVzcyBhbmQgd2VicGFjayBzY2hlbWUgKHdlYnBhY2s6Ly8pIGZyb20gZXJyb3IgbG9nLlxuY29uc3Qgc291cmNlTWFwUmVwb3J0ZXI6IGFueSA9IGZ1bmN0aW9uICh0aGlzOiBhbnksIGJhc2VSZXBvcnRlckRlY29yYXRvcjogYW55LCBjb25maWc6IGFueSkge1xuICBiYXNlUmVwb3J0ZXJEZWNvcmF0b3IodGhpcyk7XG5cbiAgbXV0ZUR1cGxpY2F0ZVJlcG9ydGVyTG9nZ2luZyh0aGlzLCBjb25maWcpO1xuXG4gIGNvbnN0IHVybFJlZ2V4cCA9IC9odHRwOlxcL1xcL2xvY2FsaG9zdDpcXGQrXFwvX2thcm1hX3dlYnBhY2tfXFwvd2VicGFjazpcXC8vZ2k7XG5cbiAgdGhpcy5vblNwZWNDb21wbGV0ZSA9IGZ1bmN0aW9uIChfYnJvd3NlcjogYW55LCByZXN1bHQ6IGFueSkge1xuICAgIGlmICghcmVzdWx0LnN1Y2Nlc3MgJiYgcmVzdWx0LmxvZy5sZW5ndGggPiAwKSB7XG4gICAgICByZXN1bHQubG9nLmZvckVhY2goKGxvZzogc3RyaW5nLCBpZHg6IG51bWJlcikgPT4ge1xuICAgICAgICByZXN1bHQubG9nW2lkeF0gPSBsb2cucmVwbGFjZSh1cmxSZWdleHAsICcnKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICAvLyBhdm9pZCBkdXBsaWNhdGUgY29tcGxldGUgbWVzc2FnZVxuICB0aGlzLm9uUnVuQ29tcGxldGUgPSAoKSA9PiB7fTtcblxuICAvLyBhdm9pZCBkdXBsaWNhdGUgZmFpbHVyZSBtZXNzYWdlXG4gIHRoaXMuc3BlY0ZhaWx1cmUgPSAoKSA9PiB7fTtcbn07XG5cbnNvdXJjZU1hcFJlcG9ydGVyLiRpbmplY3QgPSBbJ2Jhc2VSZXBvcnRlckRlY29yYXRvcicsICdjb25maWcnXTtcblxuLy8gV2hlbiBhIHJlcXVlc3QgaXMgbm90IGZvdW5kIGluIHRoZSBrYXJtYSBzZXJ2ZXIsIHRyeSBsb29raW5nIGZvciBpdCBmcm9tIHRoZSB3ZWJwYWNrIHNlcnZlciByb290LlxuZnVuY3Rpb24gZmFsbGJhY2tNaWRkbGV3YXJlKCkge1xuICByZXR1cm4gZnVuY3Rpb24gKHJlcTogYW55LCByZXM6IGFueSwgbmV4dDogKCkgPT4gdm9pZCkge1xuICAgIGlmICh3ZWJwYWNrTWlkZGxld2FyZSkge1xuICAgICAgY29uc3Qgd2VicGFja1VybCA9ICcvX2thcm1hX3dlYnBhY2tfJyArIHJlcS51cmw7XG4gICAgICBjb25zdCB3ZWJwYWNrUmVxID0geyAuLi5yZXEsIHVybDogd2VicGFja1VybCB9XG4gICAgICB3ZWJwYWNrTWlkZGxld2FyZSh3ZWJwYWNrUmVxLCByZXMsIG5leHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBuZXh0KCk7XG4gICAgfVxuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgJ2ZyYW1ld29yazpAYW5ndWxhci1kZXZraXQvYnVpbGQtYW5ndWxhcic6IFsnZmFjdG9yeScsIGluaXRdLFxuICAncmVwb3J0ZXI6QGFuZ3VsYXItZGV2a2l0L2J1aWxkLWFuZ3VsYXItLXNvdXJjZW1hcC1yZXBvcnRlcic6IFsndHlwZScsIHNvdXJjZU1hcFJlcG9ydGVyXSxcbiAgJ3JlcG9ydGVyOkBhbmd1bGFyLWRldmtpdC9idWlsZC1hbmd1bGFyLS1ldmVudC1yZXBvcnRlcic6IFsndHlwZScsIGV2ZW50UmVwb3J0ZXJdLFxuICAnbWlkZGxld2FyZTpAYW5ndWxhci1kZXZraXQvYnVpbGQtYW5ndWxhci0tYmxvY2tlcic6IFsnZmFjdG9yeScsIHJlcXVlc3RCbG9ja2VyXSxcbiAgJ21pZGRsZXdhcmU6QGFuZ3VsYXItZGV2a2l0L2J1aWxkLWFuZ3VsYXItLWZhbGxiYWNrJzogWydmYWN0b3J5JywgZmFsbGJhY2tNaWRkbGV3YXJlXVxufTtcbiJdfQ==