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
const webpack = require("webpack");
const WebpackDevServer = require("webpack-dev-server");
const webpack_1 = require("../webpack");
class WebpackDevServerBuilder {
    constructor(context) {
        this.context = context;
    }
    run(builderConfig) {
        const configPath = core_1.resolve(this.context.workspace.root, core_1.normalize(builderConfig.options.webpackConfig));
        return this.loadWebpackConfig(core_1.getSystemPath(configPath)).pipe(operators_1.concatMap(config => this.runWebpackDevServer(config)));
    }
    loadWebpackConfig(webpackConfigPath) {
        return rxjs_1.from(Promise.resolve().then(() => require(webpackConfigPath)));
    }
    runWebpackDevServer(webpackConfig, devServerCfg, loggingCb = webpack_1.defaultLoggingCb) {
        return new rxjs_1.Observable(obs => {
            const devServerConfig = devServerCfg || webpackConfig.devServer || {};
            devServerConfig.host = devServerConfig.host || 'localhost';
            if (devServerConfig.port == undefined) {
                devServerConfig.port = 8080;
            }
            if (devServerConfig.stats) {
                webpackConfig.stats = devServerConfig.stats;
            }
            // Disable stats reporting by the devserver, we have our own logger.
            devServerConfig.stats = false;
            const webpackCompiler = webpack(webpackConfig);
            const server = new WebpackDevServer(webpackCompiler, devServerConfig);
            let result;
            webpackCompiler.hooks.done.tap('build-webpack', (stats) => {
                // Log stats.
                loggingCb(stats, webpackConfig, this.context.logger);
                obs.next({ success: !stats.hasErrors(), result });
            });
            server.listen(devServerConfig.port, devServerConfig.host, function (err) {
                if (err) {
                    obs.error(err);
                }
                else {
                    // this is ignored because of ts errors
                    // that this is overshadowed by it's outer contain
                    // @ts-ignore;
                    result = this.address();
                }
            });
            // Teardown logic. Close the server when unsubscribed from.
            return () => server.close();
        });
    }
}
exports.WebpackDevServerBuilder = WebpackDevServerBuilder;
exports.default = WebpackDevServerBuilder;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL2FuZ3VsYXJfZGV2a2l0L2J1aWxkX3dlYnBhY2svc3JjL3dlYnBhY2stZGV2LXNlcnZlci9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOztBQVFILCtDQUF5RTtBQUV6RSwrQkFBd0M7QUFDeEMsOENBQTJDO0FBQzNDLG1DQUFtQztBQUNuQyx1REFBdUQ7QUFDdkQsd0NBQStEO0FBUy9ELE1BQWEsdUJBQXVCO0lBRWxDLFlBQW1CLE9BQXVCO1FBQXZCLFlBQU8sR0FBUCxPQUFPLENBQWdCO0lBQUksQ0FBQztJQUUvQyxHQUFHLENBQUMsYUFBa0U7UUFFcEUsTUFBTSxVQUFVLEdBQUcsY0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksRUFDcEQsZ0JBQVMsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7UUFFbEQsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsb0JBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FDM0QscUJBQVMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUN0RCxDQUFDO0lBQ0osQ0FBQztJQUVNLGlCQUFpQixDQUFDLGlCQUF5QjtRQUNoRCxPQUFPLFdBQUksc0NBQVEsaUJBQWlCLEdBQUUsQ0FBQztJQUN6QyxDQUFDO0lBRU0sbUJBQW1CLENBQ3hCLGFBQW9DLEVBQ3BDLFlBQTZDLEVBQzdDLFlBQTZCLDBCQUFnQjtRQUU3QyxPQUFPLElBQUksaUJBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUMxQixNQUFNLGVBQWUsR0FBRyxZQUFZLElBQUksYUFBYSxDQUFDLFNBQVMsSUFBSSxFQUFFLENBQUM7WUFDdEUsZUFBZSxDQUFDLElBQUksR0FBRyxlQUFlLENBQUMsSUFBSSxJQUFJLFdBQVcsQ0FBQztZQUMzRCxJQUFJLGVBQWUsQ0FBQyxJQUFJLElBQUksU0FBUyxFQUFFO2dCQUNyQyxlQUFlLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQzthQUM3QjtZQUVELElBQUksZUFBZSxDQUFDLEtBQUssRUFBRTtnQkFDekIsYUFBYSxDQUFDLEtBQUssR0FBRyxlQUFlLENBQUMsS0FBNEMsQ0FBQzthQUNwRjtZQUNELG9FQUFvRTtZQUNwRSxlQUFlLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztZQUU5QixNQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDL0MsTUFBTSxNQUFNLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBQyxlQUFlLEVBQUUsZUFBZSxDQUFDLENBQUM7WUFDdEUsSUFBSSxNQUFtQyxDQUFDO1lBRXhDLGVBQWUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRTtnQkFDeEQsYUFBYTtnQkFDYixTQUFTLENBQUMsS0FBSyxFQUFFLGFBQWEsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUVyRCxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7WUFDcEQsQ0FBQyxDQUFDLENBQUM7WUFFSCxNQUFNLENBQUMsTUFBTSxDQUNYLGVBQWUsQ0FBQyxJQUFJLEVBQ3BCLGVBQWUsQ0FBQyxJQUFJLEVBQ3BCLFVBQVUsR0FBRztnQkFDWCxJQUFJLEdBQUcsRUFBRTtvQkFDUCxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2lCQUNoQjtxQkFBTTtvQkFDTCx1Q0FBdUM7b0JBQ3ZDLGtEQUFrRDtvQkFDbEQsY0FBYztvQkFDZCxNQUFNLEdBQUksSUFBbUIsQ0FBQyxPQUFPLEVBQUUsQ0FBQztpQkFDekM7WUFDSCxDQUFDLENBQ0YsQ0FBQztZQUVGLDJEQUEyRDtZQUMzRCxPQUFPLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM5QixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRjtBQWxFRCwwREFrRUM7QUFHRCxrQkFBZSx1QkFBdUIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgQnVpbGRFdmVudCxcbiAgQnVpbGRlcixcbiAgQnVpbGRlckNvbmZpZ3VyYXRpb24sXG4gIEJ1aWxkZXJDb250ZXh0LFxufSBmcm9tICdAYW5ndWxhci1kZXZraXQvYXJjaGl0ZWN0JztcbmltcG9ydCB7IGdldFN5c3RlbVBhdGgsIG5vcm1hbGl6ZSwgcmVzb2x2ZSB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9jb3JlJztcbmltcG9ydCAqIGFzIG5ldCBmcm9tICduZXQnO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgZnJvbSB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgY29uY2F0TWFwIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0ICogYXMgd2VicGFjayBmcm9tICd3ZWJwYWNrJztcbmltcG9ydCAqIGFzIFdlYnBhY2tEZXZTZXJ2ZXIgZnJvbSAnd2VicGFjay1kZXYtc2VydmVyJztcbmltcG9ydCB7IExvZ2dpbmdDYWxsYmFjaywgZGVmYXVsdExvZ2dpbmdDYiB9IGZyb20gJy4uL3dlYnBhY2snO1xuaW1wb3J0IHsgV2VicGFja0RldlNlcnZlckJ1aWxkZXJTY2hlbWEgfSBmcm9tICcuL3NjaGVtYSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGV2U2VydmVyUmVzdWx0IHtcbiAgcG9ydDogbnVtYmVyO1xuICBmYW1pbHk6IHN0cmluZztcbiAgYWRkcmVzczogc3RyaW5nO1xufVxuXG5leHBvcnQgY2xhc3MgV2VicGFja0RldlNlcnZlckJ1aWxkZXIgaW1wbGVtZW50cyBCdWlsZGVyPFdlYnBhY2tEZXZTZXJ2ZXJCdWlsZGVyU2NoZW1hPiB7XG5cbiAgY29uc3RydWN0b3IocHVibGljIGNvbnRleHQ6IEJ1aWxkZXJDb250ZXh0KSB7IH1cblxuICBydW4oYnVpbGRlckNvbmZpZzogQnVpbGRlckNvbmZpZ3VyYXRpb248V2VicGFja0RldlNlcnZlckJ1aWxkZXJTY2hlbWE+KVxuICAgIDogT2JzZXJ2YWJsZTxCdWlsZEV2ZW50PERldlNlcnZlclJlc3VsdD4+IHtcbiAgICBjb25zdCBjb25maWdQYXRoID0gcmVzb2x2ZSh0aGlzLmNvbnRleHQud29ya3NwYWNlLnJvb3QsXG4gICAgICBub3JtYWxpemUoYnVpbGRlckNvbmZpZy5vcHRpb25zLndlYnBhY2tDb25maWcpKTtcblxuICAgIHJldHVybiB0aGlzLmxvYWRXZWJwYWNrQ29uZmlnKGdldFN5c3RlbVBhdGgoY29uZmlnUGF0aCkpLnBpcGUoXG4gICAgICBjb25jYXRNYXAoY29uZmlnID0+IHRoaXMucnVuV2VicGFja0RldlNlcnZlcihjb25maWcpKSxcbiAgICApO1xuICB9XG5cbiAgcHVibGljIGxvYWRXZWJwYWNrQ29uZmlnKHdlYnBhY2tDb25maWdQYXRoOiBzdHJpbmcpOiBPYnNlcnZhYmxlPHdlYnBhY2suQ29uZmlndXJhdGlvbj4ge1xuICAgIHJldHVybiBmcm9tKGltcG9ydCh3ZWJwYWNrQ29uZmlnUGF0aCkpO1xuICB9XG5cbiAgcHVibGljIHJ1bldlYnBhY2tEZXZTZXJ2ZXIoXG4gICAgd2VicGFja0NvbmZpZzogd2VicGFjay5Db25maWd1cmF0aW9uLFxuICAgIGRldlNlcnZlckNmZz86IFdlYnBhY2tEZXZTZXJ2ZXIuQ29uZmlndXJhdGlvbixcbiAgICBsb2dnaW5nQ2I6IExvZ2dpbmdDYWxsYmFjayA9IGRlZmF1bHRMb2dnaW5nQ2IsXG4gICk6IE9ic2VydmFibGU8QnVpbGRFdmVudDxEZXZTZXJ2ZXJSZXN1bHQ+PiB7XG4gICAgcmV0dXJuIG5ldyBPYnNlcnZhYmxlKG9icyA9PiB7XG4gICAgICBjb25zdCBkZXZTZXJ2ZXJDb25maWcgPSBkZXZTZXJ2ZXJDZmcgfHwgd2VicGFja0NvbmZpZy5kZXZTZXJ2ZXIgfHwge307XG4gICAgICBkZXZTZXJ2ZXJDb25maWcuaG9zdCA9IGRldlNlcnZlckNvbmZpZy5ob3N0IHx8ICdsb2NhbGhvc3QnO1xuICAgICAgaWYgKGRldlNlcnZlckNvbmZpZy5wb3J0ID09IHVuZGVmaW5lZCkge1xuICAgICAgICBkZXZTZXJ2ZXJDb25maWcucG9ydCA9IDgwODA7XG4gICAgICB9XG5cbiAgICAgIGlmIChkZXZTZXJ2ZXJDb25maWcuc3RhdHMpIHtcbiAgICAgICAgd2VicGFja0NvbmZpZy5zdGF0cyA9IGRldlNlcnZlckNvbmZpZy5zdGF0cyBhcyB3ZWJwYWNrLlN0YXRzLlRvU3RyaW5nT3B0aW9uc09iamVjdDtcbiAgICAgIH1cbiAgICAgIC8vIERpc2FibGUgc3RhdHMgcmVwb3J0aW5nIGJ5IHRoZSBkZXZzZXJ2ZXIsIHdlIGhhdmUgb3VyIG93biBsb2dnZXIuXG4gICAgICBkZXZTZXJ2ZXJDb25maWcuc3RhdHMgPSBmYWxzZTtcblxuICAgICAgY29uc3Qgd2VicGFja0NvbXBpbGVyID0gd2VicGFjayh3ZWJwYWNrQ29uZmlnKTtcbiAgICAgIGNvbnN0IHNlcnZlciA9IG5ldyBXZWJwYWNrRGV2U2VydmVyKHdlYnBhY2tDb21waWxlciwgZGV2U2VydmVyQ29uZmlnKTtcbiAgICAgIGxldCByZXN1bHQ6IHVuZGVmaW5lZCB8IERldlNlcnZlclJlc3VsdDtcblxuICAgICAgd2VicGFja0NvbXBpbGVyLmhvb2tzLmRvbmUudGFwKCdidWlsZC13ZWJwYWNrJywgKHN0YXRzKSA9PiB7XG4gICAgICAgIC8vIExvZyBzdGF0cy5cbiAgICAgICAgbG9nZ2luZ0NiKHN0YXRzLCB3ZWJwYWNrQ29uZmlnLCB0aGlzLmNvbnRleHQubG9nZ2VyKTtcblxuICAgICAgICBvYnMubmV4dCh7IHN1Y2Nlc3M6ICFzdGF0cy5oYXNFcnJvcnMoKSwgcmVzdWx0IH0pO1xuICAgICAgfSk7XG5cbiAgICAgIHNlcnZlci5saXN0ZW4oXG4gICAgICAgIGRldlNlcnZlckNvbmZpZy5wb3J0LFxuICAgICAgICBkZXZTZXJ2ZXJDb25maWcuaG9zdCxcbiAgICAgICAgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIG9icy5lcnJvcihlcnIpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyB0aGlzIGlzIGlnbm9yZWQgYmVjYXVzZSBvZiB0cyBlcnJvcnNcbiAgICAgICAgICAgIC8vIHRoYXQgdGhpcyBpcyBvdmVyc2hhZG93ZWQgYnkgaXQncyBvdXRlciBjb250YWluXG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlO1xuICAgICAgICAgICAgcmVzdWx0ID0gKHRoaXMgYXMgbmV0LlNlcnZlcikuYWRkcmVzcygpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICk7XG5cbiAgICAgIC8vIFRlYXJkb3duIGxvZ2ljLiBDbG9zZSB0aGUgc2VydmVyIHdoZW4gdW5zdWJzY3JpYmVkIGZyb20uXG4gICAgICByZXR1cm4gKCkgPT4gc2VydmVyLmNsb3NlKCk7XG4gICAgfSk7XG4gIH1cbn1cblxuXG5leHBvcnQgZGVmYXVsdCBXZWJwYWNrRGV2U2VydmVyQnVpbGRlcjtcbiJdfQ==