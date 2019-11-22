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
const url = require("url");
const require_project_module_1 = require("../angular-cli-files/utilities/require-project-module");
const utils_1 = require("../utils");
class ProtractorBuilder {
    constructor(context) {
        this.context = context;
    }
    run(builderConfig) {
        const options = builderConfig.options;
        const root = this.context.workspace.root;
        const projectRoot = core_1.resolve(root, builderConfig.root);
        // ensure that either one of this option is used
        if (options.devServerTarget && options.baseUrl) {
            throw new Error(core_1.tags.stripIndents `
      The 'baseUrl' option cannot be used with 'devServerTarget'.
      When present, 'devServerTarget' will be used to automatically setup 'baseUrl' for Protractor.
      `);
        }
        // TODO: verify using of(null) to kickstart things is a pattern.
        return rxjs_1.of(null).pipe(operators_1.concatMap(() => options.devServerTarget ? this._startDevServer(options) : rxjs_1.of(null)), operators_1.concatMap(() => options.webdriverUpdate ? this._updateWebdriver(projectRoot) : rxjs_1.of(null)), operators_1.concatMap(() => this._runProtractor(root, options)), operators_1.take(1));
    }
    // Note: this method mutates the options argument.
    _startDevServer(options) {
        const architect = this.context.architect;
        const [project, targetName, configuration] = options.devServerTarget.split(':');
        // Override dev server watch setting.
        const overrides = { watch: false };
        // Also override the port and host if they are defined in protractor options.
        if (options.host !== undefined) {
            overrides.host = options.host;
        }
        if (options.port !== undefined) {
            overrides.port = options.port;
        }
        const targetSpec = { project, target: targetName, configuration, overrides };
        const builderConfig = architect.getBuilderConfiguration(targetSpec);
        let devServerDescription;
        let baseUrl;
        return architect.getBuilderDescription(builderConfig).pipe(operators_1.tap(description => devServerDescription = description), operators_1.concatMap(devServerDescription => architect.validateBuilderOptions(builderConfig, devServerDescription)), operators_1.map(() => this.context.architect.getBuilder(devServerDescription, this.context)), operators_1.concatMap(builder => builder.run(builderConfig)), operators_1.tap(buildEvent => {
            if (!buildEvent.success) {
                return;
            }
            // Compute baseUrl from devServerOptions.
            if (builderConfig.options.publicHost) {
                let publicHost = builderConfig.options.publicHost;
                if (!/^\w+:\/\//.test(publicHost)) {
                    publicHost = `${builderConfig.options.ssl
                        ? 'https'
                        : 'http'}://${publicHost}`;
                }
                const clientUrl = url.parse(publicHost);
                baseUrl = url.format(clientUrl);
            }
            else {
                const result = buildEvent.result;
                baseUrl = url.format({
                    protocol: builderConfig.options.ssl ? 'https' : 'http',
                    hostname: options.host,
                    port: result && result.port.toString(),
                });
            }
            // Save the computed baseUrl back so that Protractor can use it.
            options.baseUrl = baseUrl;
        }));
    }
    _updateWebdriver(projectRoot) {
        // The webdriver-manager update command can only be accessed via a deep import.
        const webdriverDeepImport = 'webdriver-manager/built/lib/cmds/update';
        let webdriverUpdate; // tslint:disable-line:no-any
        try {
            // When using npm, webdriver is within protractor/node_modules.
            webdriverUpdate = require_project_module_1.requireProjectModule(core_1.getSystemPath(projectRoot), `protractor/node_modules/${webdriverDeepImport}`);
        }
        catch (_a) {
            try {
                // When using yarn, webdriver is found as a root module.
                webdriverUpdate = require_project_module_1.requireProjectModule(core_1.getSystemPath(projectRoot), webdriverDeepImport);
            }
            catch (_b) {
                throw new Error(core_1.tags.stripIndents `
          Cannot automatically find webdriver-manager to update.
          Update webdriver-manager manually and run 'ng e2e --no-webdriver-update' instead.
        `);
            }
        }
        // run `webdriver-manager update --standalone false --gecko false --quiet`
        // if you change this, update the command comment in prev line, and in `eject` task
        return rxjs_1.from(webdriverUpdate.program.run({
            standalone: false,
            gecko: false,
            quiet: true,
        }));
    }
    _runProtractor(root, options) {
        const additionalProtractorConfig = {
            elementExplorer: options.elementExplorer,
            baseUrl: options.baseUrl,
            specs: options.specs.length ? options.specs : undefined,
            suite: options.suite,
        };
        // TODO: Protractor manages process.exit itself, so this target will allways quit the
        // process. To work around this we run it in a subprocess.
        // https://github.com/angular/protractor/issues/4160
        return utils_1.runModuleAsObservableFork(core_1.getSystemPath(root), 'protractor/built/launcher', 'init', [
            core_1.getSystemPath(core_1.resolve(root, core_1.normalize(options.protractorConfig))),
            additionalProtractorConfig,
        ]);
    }
}
exports.ProtractorBuilder = ProtractorBuilder;
exports.default = ProtractorBuilder;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL2FuZ3VsYXJfZGV2a2l0L2J1aWxkX2FuZ3VsYXIvc3JjL3Byb3RyYWN0b3IvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7QUFVSCwrQ0FBcUY7QUFDckYsK0JBQTRDO0FBQzVDLDhDQUEyRDtBQUMzRCwyQkFBMkI7QUFDM0Isa0dBQTZGO0FBRTdGLG9DQUFxRDtBQWVyRCxNQUFhLGlCQUFpQjtJQUU1QixZQUFtQixPQUF1QjtRQUF2QixZQUFPLEdBQVAsT0FBTyxDQUFnQjtJQUFJLENBQUM7SUFFL0MsR0FBRyxDQUFDLGFBQTZEO1FBRS9ELE1BQU0sT0FBTyxHQUFHLGFBQWEsQ0FBQyxPQUFPLENBQUM7UUFDdEMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDO1FBQ3pDLE1BQU0sV0FBVyxHQUFHLGNBQU8sQ0FBQyxJQUFJLEVBQUUsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRXRELGdEQUFnRDtRQUNoRCxJQUFJLE9BQU8sQ0FBQyxlQUFlLElBQUksT0FBTyxDQUFDLE9BQU8sRUFBRTtZQUM5QyxNQUFNLElBQUksS0FBSyxDQUFDLFdBQUksQ0FBQyxZQUFZLENBQUE7OztPQUdoQyxDQUFDLENBQUM7U0FDSjtRQUVELGdFQUFnRTtRQUNoRSxPQUFPLFNBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQ2xCLHFCQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBRSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQ25GLHFCQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGdCQUFn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QUUsT0FBTyxDQUFDLE9BQU87WUFDeEIsS0FBSyxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxTQUFTO1lBQ3ZELEtBQUssRUFBRSxPQUFPLENBQUMsS0FBSztTQUNyQixDQUFDO1FBRUYscUZBQXFGO1FBQ3JGLDBEQUEwRDtRQUMxRCxvREFBb0Q7UUFDcEQsT0FBTyxpQ0FBeUIsQ0FDOUIsb0JBQWEsQ0FBQyxJQUFJLENBQUMsRUFDbkIsMkJBQTJCLEVBQzNCLE1BQU0sRUFDTjtZQUNFLG9CQUFhLENBQUMsY0FBTyxDQUFDLElBQUksRUFBRSxnQkFBUyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7WUFDakUsMEJBQTBCO1NBQzNCLENBQ0YsQ0FBQztJQUNKLENBQUM7Q0FDRjtBQWpJRCw4Q0FpSUM7QUFFRCxrQkFBZSxpQkFBaUIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgQnVpbGRFdmVudCxcbiAgQnVpbGRlcixcbiAgQnVpbGRlckNvbmZpZ3VyYXRpb24sXG4gIEJ1aWxkZXJDb250ZXh0LFxuICBCdWlsZGVyRGVzY3JpcHRpb24sXG59IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9hcmNoaXRlY3QnO1xuaW1wb3J0IHsgRGV2U2VydmVyUmVzdWx0IH0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L2J1aWxkLXdlYnBhY2snO1xuaW1wb3J0IHsgUGF0aCwgZ2V0U3lzdGVtUGF0aCwgbm9ybWFsaXplLCByZXNvbHZlLCB0YWdzIH0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L2NvcmUnO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgZnJvbSwgb2YgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IGNvbmNhdE1hcCwgbWFwLCB0YWtlLCB0YXAgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQgKiBhcyB1cmwgZnJvbSAndXJsJztcbmltcG9ydCB7IHJlcXVpcmVQcm9qZWN0TW9kdWxlIH0gZnJvbSAnLi4vYW5ndWxhci1jbGktZmlsZXMvdXRpbGl0aWVzL3JlcXVpcmUtcHJvamVjdC1tb2R1bGUnO1xuaW1wb3J0IHsgRGV2U2VydmVyQnVpbGRlck9wdGlvbnMgfSBmcm9tICcuLi9kZXYtc2VydmVyJztcbmltcG9ydCB7IHJ1bk1vZHVsZUFzT2JzZXJ2YWJsZUZvcmsgfSBmcm9tICcuLi91dGlscyc7XG5cblxuZXhwb3J0IGludGVyZmFjZSBQcm90cmFjdG9yQnVpbGRlck9wdGlvbnMge1xuICBwcm90cmFjdG9yQ29uZmlnOiBzdHJpbmc7XG4gIGRldlNlcnZlclRhcmdldD86IHN0cmluZztcbiAgc3BlY3M6IHN0cmluZ1tdO1xuICBzdWl0ZT86IHN0cmluZztcbiAgZWxlbWVudEV4cGxvcmVyOiBib29sZWFuO1xuICB3ZWJkcml2ZXJVcGRhdGU6IGJvb2xlYW47XG4gIHBvcnQ/OiBudW1iZXI7XG4gIGhvc3Q6IHN0cmluZztcbiAgYmFzZVVybDogc3RyaW5nO1xufVxuXG5leHBvcnQgY2xhc3MgUHJvdHJhY3RvckJ1aWxkZXIgaW1wbGVtZW50cyBCdWlsZGVyPFByb3RyYWN0b3JCdWlsZGVyT3B0aW9ucz4ge1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBjb250ZXh0OiBCdWlsZGVyQ29udGV4dCkgeyB9XG5cbiAgcnVuKGJ1aWxkZXJDb25maWc6IEJ1aWxkZXJDb25maWd1cmF0aW9uPFByb3RyYWN0b3JCdWlsZGVyT3B0aW9ucz4pOiBPYnNlcnZhYmxlPEJ1aWxkRXZlbnQ+IHtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSBidWlsZGVyQ29uZmlnLm9wdGlvbnM7XG4gICAgY29uc3Qgcm9vdCA9IHRoaXMuY29udGV4dC53b3Jrc3BhY2Uucm9vdDtcbiAgICBjb25zdCBwcm9qZWN0Um9vdCA9IHJlc29sdmUocm9vdCwgYnVpbGRlckNvbmZpZy5yb290KTtcblxuICAgIC8vIGVuc3VyZSB0aGF0IGVpdGhlciBvbmUgb2YgdGhpcyBvcHRpb24gaXMgdXNlZFxuICAgIGlmIChvcHRpb25zLmRldlNlcnZlclRhcmdldCAmJiBvcHRpb25zLmJhc2VVcmwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcih0YWdzLnN0cmlwSW5kZW50c2BcbiAgICAgIFRoZSAnYmFzZVVybCcgb3B0aW9uIGNhbm5vdCBiZSB1c2VkIHdpdGggJ2RldlNlcnZlclRhcmdldCcuXG4gICAgICBXaGVuIHByZXNlbnQsICdkZXZTZXJ2ZXJUYXJnZXQnIHdpbGwgYmUgdXNlZCB0byBhdXRvbWF0aWNhbGx5IHNldHVwICdiYXNlVXJsJyBmb3IgUHJvdHJhY3Rvci5cbiAgICAgIGApO1xuICAgIH1cblxuICAgIC8vIFRPRE86IHZlcmlmeSB1c2luZyBvZihudWxsKSB0byBraWNrc3RhcnQgdGhpbmdzIGlzIGEgcGF0dGVybi5cbiAgICByZXR1cm4gb2YobnVsbCkucGlwZShcbiAgICAgIGNvbmNhdE1hcCgoKSA9PiBvcHRpb25zLmRldlNlcnZlclRhcmdldCA/IHRoaXMuX3N0YXJ0RGV2U2VydmVyKG9wdGlvbnMpIDogb2YobnVsbCkpLFxuICAgICAgY29uY2F0TWFwKCgpID0+IG9wdGlvbnMud2ViZHJpdmVyVXBkYXRlID8gdGhpcy5fdXBkYXRlV2ViZHJpdmVyKHByb2plY3RSb290KSA6IG9mKG51bGwpKSxcbiAgICAgIGNvbmNhdE1hcCgoKSA9PiB0aGlzLl9ydW5Qcm90cmFjdG9yKHJvb3QsIG9wdGlvbnMpKSxcbiAgICAgIHRha2UoMSksXG4gICAgKTtcbiAgfVxuXG4gIC8vIE5vdGU6IHRoaXMgbWV0aG9kIG11dGF0ZXMgdGhlIG9wdGlvbnMgYXJndW1lbnQuXG4gIHByaXZhdGUgX3N0YXJ0RGV2U2VydmVyKG9wdGlvbnM6IFByb3RyYWN0b3JCdWlsZGVyT3B0aW9ucykge1xuICAgIGNvbnN0IGFyY2hpdGVjdCA9IHRoaXMuY29udGV4dC5hcmNoaXRlY3Q7XG4gICAgY29uc3QgW3Byb2plY3QsIHRhcmdldE5hbWUsIGNvbmZpZ3VyYXRpb25dID0gKG9wdGlvbnMuZGV2U2VydmVyVGFyZ2V0IGFzIHN0cmluZykuc3BsaXQoJzonKTtcbiAgICAvLyBPdmVycmlkZSBkZXYgc2VydmVyIHdhdGNoIHNldHRpbmcuXG4gICAgY29uc3Qgb3ZlcnJpZGVzOiBQYXJ0aWFsPERldlNlcnZlckJ1aWxkZXJPcHRpb25zPiA9IHsgd2F0Y2g6IGZhbHNlIH07XG4gICAgLy8gQWxzbyBvdmVycmlkZSB0aGUgcG9ydCBhbmQgaG9zdCBpZiB0aGV5IGFyZSBkZWZpbmVkIGluIHByb3RyYWN0b3Igb3B0aW9ucy5cbiAgICBpZiAob3B0aW9ucy5ob3N0ICE9PSB1bmRlZmluZWQpIHsgb3ZlcnJpZGVzLmhvc3QgPSBvcHRpb25zLmhvc3Q7IH1cbiAgICBpZiAob3B0aW9ucy5wb3J0ICE9PSB1bmRlZmluZWQpIHsgb3ZlcnJpZGVzLnBvcnQgPSBvcHRpb25zLnBvcnQ7IH1cbiAgICBjb25zdCB0YXJnZXRTcGVjID0geyBwcm9qZWN0LCB0YXJnZXQ6IHRhcmdldE5hbWUsIGNvbmZpZ3VyYXRpb24sIG92ZXJyaWRlcyB9O1xuICAgIGNvbnN0IGJ1aWxkZXJDb25maWcgPSBhcmNoaXRlY3QuZ2V0QnVpbGRlckNvbmZpZ3VyYXRpb248RGV2U2VydmVyQnVpbGRlck9wdGlvbnM+KHRhcmdldFNwZWMpO1xuICAgIGxldCBkZXZTZXJ2ZXJEZXNjcmlwdGlvbjogQnVpbGRlckRlc2NyaXB0aW9uO1xuICAgIGxldCBiYXNlVXJsOiBzdHJpbmc7XG5cbiAgICByZXR1cm4gYXJjaGl0ZWN0LmdldEJ1aWxkZXJEZXNjcmlwdGlvbihidWlsZGVyQ29uZmlnKS5waXBlKFxuICAgICAgdGFwKGRlc2NyaXB0aW9uID0+IGRldlNlcnZlckRlc2NyaXB0aW9uID0gZGVzY3JpcHRpb24pLFxuICAgICAgY29uY2F0TWFwKGRldlNlcnZlckRlc2NyaXB0aW9uID0+XG4gICAgICAgIGFyY2hpdGVjdC52YWxpZGF0ZUJ1aWxkZXJPcHRpb25zKGJ1aWxkZXJDb25maWcsIGRldlNlcnZlckRlc2NyaXB0aW9uKSksXG4gICAgICBtYXAoKCkgPT4gdGhpcy5jb250ZXh0LmFyY2hpdGVjdC5nZXRCdWlsZGVyKGRldlNlcnZlckRlc2NyaXB0aW9uLCB0aGlzLmNvbnRleHQpKSxcbiAgICAgIGNvbmNhdE1hcChidWlsZGVyID0+IGJ1aWxkZXIucnVuKGJ1aWxkZXJDb25maWcpKSxcbiAgICAgIHRhcChidWlsZEV2ZW50ID0+IHtcbiAgICAgICAgaWYgKCFidWlsZEV2ZW50LnN1Y2Nlc3MpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDb21wdXRlIGJhc2VVcmwgZnJvbSBkZXZTZXJ2ZXJPcHRpb25zLlxuICAgICAgICBpZiAoYnVpbGRlckNvbmZpZy5vcHRpb25zLnB1YmxpY0hvc3QpIHtcbiAgICAgICAgICBsZXQgcHVibGljSG9zdCA9IGJ1aWxkZXJDb25maWcub3B0aW9ucy5wdWJsaWNIb3N0O1xuICAgICAgICAgIGlmICghL15cXHcrOlxcL1xcLy8udGVzdChwdWJsaWNIb3N0KSkge1xuICAgICAgICAgICAgcHVibGljSG9zdCA9IGAke2J1aWxkZXJDb25maWcub3B0aW9ucy5zc2xcbiAgICAgICAgICAgICAgPyAnaHR0cHMnXG4gICAgICAgICAgICAgIDogJ2h0dHAnfTovLyR7cHVibGljSG9zdH1gO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBjbGllbnRVcmwgPSB1cmwucGFyc2UocHVibGljSG9zdCk7XG4gICAgICAgICAgYmFzZVVybCA9IHVybC5mb3JtYXQoY2xpZW50VXJsKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCByZXN1bHQ6IERldlNlcnZlclJlc3VsdCB8IHVuZGVmaW5lZCA9IGJ1aWxkRXZlbnQucmVzdWx0O1xuXG4gICAgICAgICAgYmFzZVVybCA9IHVybC5mb3JtYXQoe1xuICAgICAgICAgICAgcHJvdG9jb2w6IGJ1aWxkZXJDb25maWcub3B0aW9ucy5zc2wgPyAnaHR0cHMnIDogJ2h0dHAnLFxuICAgICAgICAgICAgaG9zdG5hbWU6IG9wdGlvbnMuaG9zdCxcbiAgICAgICAgICAgIHBvcnQ6IHJlc3VsdCAmJiByZXN1bHQucG9ydC50b1N0cmluZygpLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2F2ZSB0aGUgY29tcHV0ZWQgYmFzZVVybCBiYWNrIHNvIHRoYXQgUHJvdHJhY3RvciBjYW4gdXNlIGl0LlxuICAgICAgICBvcHRpb25zLmJhc2VVcmwgPSBiYXNlVXJsO1xuICAgICAgfSksXG4gICAgKTtcbiAgfVxuXG4gIHByaXZhdGUgX3VwZGF0ZVdlYmRyaXZlcihwcm9qZWN0Um9vdDogUGF0aCkge1xuICAgIC8vIFRoZSB3ZWJkcml2ZXItbWFuYWdlciB1cGRhdGUgY29tbWFuZCBjYW4gb25seSBiZSBhY2Nlc3NlZCB2aWEgYSBkZWVwIGltcG9ydC5cbiAgICBjb25zdCB3ZWJkcml2ZXJEZWVwSW1wb3J0ID0gJ3dlYmRyaXZlci1tYW5hZ2VyL2J1aWx0L2xpYi9jbWRzL3VwZGF0ZSc7XG4gICAgbGV0IHdlYmRyaXZlclVwZGF0ZTogYW55OyAvLyB0c2xpbnQ6ZGlzYWJsZS1saW5lOm5vLWFueVxuXG4gICAgdHJ5IHtcbiAgICAgIC8vIFdoZW4gdXNpbmcgbnBtLCB3ZWJkcml2ZXIgaXMgd2l0aGluIHByb3RyYWN0b3Ivbm9kZV9tb2R1bGVzLlxuICAgICAgd2ViZHJpdmVyVXBkYXRlID0gcmVxdWlyZVByb2plY3RNb2R1bGUoZ2V0U3lzdGVtUGF0aChwcm9qZWN0Um9vdCksXG4gICAgICAgIGBwcm90cmFjdG9yL25vZGVfbW9kdWxlcy8ke3dlYmRyaXZlckRlZXBJbXBvcnR9YCk7XG4gICAgfSBjYXRjaCB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBXaGVuIHVzaW5nIHlhcm4sIHdlYmRyaXZlciBpcyBmb3VuZCBhcyBhIHJvb3QgbW9kdWxlLlxuICAgICAgICB3ZWJkcml2ZXJVcGRhdGUgPSByZXF1aXJlUHJvamVjdE1vZHVsZShnZXRTeXN0ZW1QYXRoKHByb2plY3RSb290KSwgd2ViZHJpdmVyRGVlcEltcG9ydCk7XG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKHRhZ3Muc3RyaXBJbmRlbnRzYFxuICAgICAgICAgIENhbm5vdCBhdXRvbWF0aWNhbGx5IGZpbmQgd2ViZHJpdmVyLW1hbmFnZXIgdG8gdXBkYXRlLlxuICAgICAgICAgIFVwZGF0ZSB3ZWJkcml2ZXItbWFuYWdlciBtYW51YWxseSBhbmQgcnVuICduZyBlMmUgLS1uby13ZWJkcml2ZXItdXBkYXRlJyBpbnN0ZWFkLlxuICAgICAgICBgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBydW4gYHdlYmRyaXZlci1tYW5hZ2VyIHVwZGF0ZSAtLXN0YW5kYWxvbmUgZmFsc2UgLS1nZWNrbyBmYWxzZSAtLXF1aWV0YFxuICAgIC8vIGlmIHlvdSBjaGFuZ2UgdGhpcywgdXBkYXRlIHRoZSBjb21tYW5kIGNvbW1lbnQgaW4gcHJldiBsaW5lLCBhbmQgaW4gYGVqZWN0YCB0YXNrXG4gICAgcmV0dXJuIGZyb20od2ViZHJpdmVyVXBkYXRlLnByb2dyYW0ucnVuKHtcbiAgICAgIHN0YW5kYWxvbmU6IGZhbHNlLFxuICAgICAgZ2Vja286IGZhbHNlLFxuICAgICAgcXVpZXQ6IHRydWUsXG4gICAgfSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBfcnVuUHJvdHJhY3Rvcihyb290OiBQYXRoLCBvcHRpb25zOiBQcm90cmFjdG9yQnVpbGRlck9wdGlvbnMpOiBPYnNlcnZhYmxlPEJ1aWxkRXZlbnQ+IHtcbiAgICBjb25zdCBhZGRpdGlvbmFsUHJvdHJhY3RvckNvbmZpZzogUGFydGlhbDxQcm90cmFjdG9yQnVpbGRlck9wdGlvbnM+ID0ge1xuICAgICAgZWxlbWVudEV4cGxvcmVyOiBvcHRpb25zLmVsZW1lbnRFeHBsb3JlcixcbiAgICAgIGJhc2VVcmw6IG9wdGlvbnMuYmFzZVVybCxcbiAgICAgIHNwZWNzOiBvcHRpb25zLnNwZWNzLmxlbmd0aCA/IG9wdGlvbnMuc3BlY3MgOiB1bmRlZmluZWQsXG4gICAgICBzdWl0ZTogb3B0aW9ucy5zdWl0ZSxcbiAgICB9O1xuXG4gICAgLy8gVE9ETzogUHJvdHJhY3RvciBtYW5hZ2VzIHByb2Nlc3MuZXhpdCBpdHNlbGYsIHNvIHRoaXMgdGFyZ2V0IHdpbGwgYWxsd2F5cyBxdWl0IHRoZVxuICAgIC8vIHByb2Nlc3MuIFRvIHdvcmsgYXJvdW5kIHRoaXMgd2UgcnVuIGl0IGluIGEgc3VicHJvY2Vzcy5cbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9wcm90cmFjdG9yL2lzc3Vlcy80MTYwXG4gICAgcmV0dXJuIHJ1bk1vZHVsZUFzT2JzZXJ2YWJsZUZvcmsoXG4gICAgICBnZXRTeXN0ZW1QYXRoKHJvb3QpLFxuICAgICAgJ3Byb3RyYWN0b3IvYnVpbHQvbGF1bmNoZXInLFxuICAgICAgJ2luaXQnLFxuICAgICAgW1xuICAgICAgICBnZXRTeXN0ZW1QYXRoKHJlc29sdmUocm9vdCwgbm9ybWFsaXplKG9wdGlvbnMucHJvdHJhY3RvckNvbmZpZykpKSxcbiAgICAgICAgYWRkaXRpb25hbFByb3RyYWN0b3JDb25maWcsXG4gICAgICBdLFxuICAgICk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUHJvdHJhY3RvckJ1aWxkZXI7XG4iXX0=