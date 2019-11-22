"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const architect_1 = require("@angular-devkit/architect");
const core_1 = require("@angular-devkit/core");
const node_1 = require("@angular-devkit/core/node");
const bep_1 = require("../utilities/bep");
const json_schema_1 = require("../utilities/json-schema");
const command_1 = require("./command");
const parser_1 = require("./parser");
const workspace_loader_1 = require("./workspace-loader");
class ArchitectCommand extends command_1.Command {
    constructor() {
        super(...arguments);
        this._host = new node_1.NodeJsSyncHost();
        // If this command supports running multiple targets.
        this.multiTarget = false;
    }
    async initialize(options) {
        await super.initialize(options);
        this._registry = new core_1.json.schema.CoreSchemaRegistry();
        this._registry.addPostTransform(core_1.json.schema.transforms.addUndefinedDefaults);
        await this._loadWorkspaceAndArchitect();
        if (!this.target) {
            if (options.help) {
                // This is a special case where we just return.
                return;
            }
            const specifier = this._makeTargetSpecifier(options);
            if (!specifier.project || !specifier.target) {
                throw new Error('Cannot determine project or target for command.');
            }
            return;
        }
        const commandLeftovers = options['--'];
        let projectName = options.project;
        const targetProjectNames = [];
        for (const name of this._workspace.listProjectNames()) {
            if (this._architect.listProjectTargets(name).includes(this.target)) {
                targetProjectNames.push(name);
            }
        }
        if (targetProjectNames.length === 0) {
            throw new Error(`No projects support the '${this.target}' target.`);
        }
        if (projectName && !targetProjectNames.includes(projectName)) {
            throw new Error(`Project '${projectName}' does not support the '${this.target}' target.`);
        }
        if (!projectName && commandLeftovers && commandLeftovers.length > 0) {
            const builderNames = new Set();
            const leftoverMap = new Map();
            let potentialProjectNames = new Set(targetProjectNames);
            for (const name of targetProjectNames) {
                const builderConfig = this._architect.getBuilderConfiguration({
                    project: name,
                    target: this.target,
                });
                if (this.multiTarget) {
                    builderNames.add(builderConfig.builder);
                }
                const builderDesc = await this._architect.getBuilderDescription(builderConfig).toPromise();
                const optionDefs = await json_schema_1.parseJsonSchemaToOptions(this._registry, builderDesc.schema);
                const parsedOptions = parser_1.parseArguments([...commandLeftovers], optionDefs);
                const builderLeftovers = parsedOptions['--'] || [];
                leftoverMap.set(name, { optionDefs, parsedOptions });
                potentialProjectNames = new Set(builderLeftovers.filter(x => potentialProjectNames.has(x)));
            }
            if (potentialProjectNames.size === 1) {
                projectName = [...potentialProjectNames][0];
                // remove the project name from the leftovers
                const optionInfo = leftoverMap.get(projectName);
                if (optionInfo) {
                    const locations = [];
                    let i = 0;
                    while (i < commandLeftovers.length) {
                        i = commandLeftovers.indexOf(projectName, i + 1);
                        if (i === -1) {
                            break;
                        }
                        locations.push(i);
                    }
                    delete optionInfo.parsedOptions['--'];
                    for (const location of locations) {
                        const tempLeftovers = [...commandLeftovers];
                        tempLeftovers.splice(location, 1);
                        const tempArgs = parser_1.parseArguments([...tempLeftovers], optionInfo.optionDefs);
                        delete tempArgs['--'];
                        if (JSON.stringify(optionInfo.parsedOptions) === JSON.stringify(tempArgs)) {
                            options['--'] = tempLeftovers;
                            break;
                        }
                    }
                }
            }
            if (!projectName && this.multiTarget && builderNames.size > 1) {
                throw new Error(core_1.tags.oneLine `
          Architect commands with command line overrides cannot target different builders. The
          '${this.target}' target would run on projects ${targetProjectNames.join()} which have the
          following builders: ${'\n  ' + [...builderNames].join('\n  ')}
        `);
            }
        }
        if (!projectName && !this.multiTarget) {
            const defaultProjectName = this._workspace.getDefaultProjectName();
            if (targetProjectNames.length === 1) {
                projectName = targetProjectNames[0];
            }
            else if (defaultProjectName && targetProjectNames.includes(defaultProjectName)) {
                projectName = defaultProjectName;
            }
            else if (options.help) {
                // This is a special case where we just return.
                return;
            }
            else {
                throw new Error('Cannot determine project or target for command.');
            }
        }
        options.project = projectName;
        const builderConf = this._architect.getBuilderConfiguration({
            project: projectName || (targetProjectNames.length > 0 ? targetProjectNames[0] : ''),
            target: this.target,
        });
        const builderDesc = await this._architect.getBuilderDescription(builderConf).toPromise();
        this.description.options.push(...(await json_schema_1.parseJsonSchemaToOptions(this._registry, builderDesc.schema)));
    }
    async run(options) {
        return await this.runArchitectTarget(options);
    }
    async runBepTarget(command, configuration, buildEventLog) {
        const bep = new bep_1.BepJsonWriter(buildEventLog);
        // Send start
        bep.writeBuildStarted(command);
        let last = 1;
        let rebuild = false;
        await this._architect.run(configuration, { logger: this.logger }).forEach(event => {
            last = event.success ? 0 : 1;
            if (rebuild) {
                // NOTE: This will have an incorrect timestamp but this cannot be fixed
                //       until builders report additional status events
                bep.writeBuildStarted(command);
            }
            else {
                rebuild = true;
            }
            bep.writeBuildFinished(last);
        });
        return last;
    }
    async runSingleTarget(targetSpec, targetOptions, commandOptions) {
        // We need to build the builderSpec twice because architect does not understand
        // overrides separately (getting the configuration builds the whole project, including
        // overrides).
        const builderConf = this._architect.getBuilderConfiguration(targetSpec);
        const builderDesc = await this._architect.getBuilderDescription(builderConf).toPromise();
        const targetOptionArray = await json_schema_1.parseJsonSchemaToOptions(this._registry, builderDesc.schema);
        const overrides = parser_1.parseArguments(targetOptions, targetOptionArray, this.logger);
        if (overrides['--']) {
            (overrides['--'] || []).forEach(additional => {
                this.logger.fatal(`Unknown option: '${additional.split(/=/)[0]}'`);
            });
            return 1;
        }
        const realBuilderConf = this._architect.getBuilderConfiguration(Object.assign({}, targetSpec, { overrides }));
        const builderContext = {
            logger: this.logger,
            targetSpecifier: targetSpec,
        };
        if (commandOptions.buildEventLog && ['build', 'serve'].includes(this.description.name)) {
            // The build/serve commands supports BEP messaging
            this.logger.warn('BEP support is experimental and subject to change.');
            return this.runBepTarget(this.description.name, realBuilderConf, commandOptions.buildEventLog);
        }
        else {
            const result = await this._architect
                .run(realBuilderConf, builderContext)
                .toPromise();
            return result.success ? 0 : 1;
        }
    }
    async runArchitectTarget(options) {
        const extra = options['--'] || [];
        try {
            const targetSpec = this._makeTargetSpecifier(options);
            if (!targetSpec.project && this.target) {
                // This runs each target sequentially.
                // Running them in parallel would jumble the log messages.
                let result = 0;
                for (const project of this.getProjectNamesByTarget(this.target)) {
                    result |= await this.runSingleTarget(Object.assign({}, targetSpec, { project }), extra, options);
                }
                return result;
            }
            else {
                return await this.runSingleTarget(targetSpec, extra, options);
            }
        }
        catch (e) {
            if (e instanceof core_1.schema.SchemaValidationException) {
                const newErrors = [];
                for (const schemaError of e.errors) {
                    if (schemaError.keyword === 'additionalProperties') {
                        const unknownProperty = schemaError.params.additionalProperty;
                        if (unknownProperty in options) {
                            const dashes = unknownProperty.length === 1 ? '-' : '--';
                            this.logger.fatal(`Unknown option: '${dashes}${unknownProperty}'`);
                            continue;
                        }
                    }
                    newErrors.push(schemaError);
                }
                if (newErrors.length > 0) {
                    this.logger.error(new core_1.schema.SchemaValidationException(newErrors).message);
                }
                return 1;
            }
            else {
                throw e;
            }
        }
    }
    getProjectNamesByTarget(targetName) {
        const allProjectsForTargetName = this._workspace.listProjectNames().map(projectName => this._architect.listProjectTargets(projectName).includes(targetName) ? projectName : null).filter(x => !!x);
        if (this.multiTarget) {
            // For multi target commands, we always list all projects that have the target.
            return allProjectsForTargetName;
        }
        else {
            // For single target commands, we try the default project first,
            // then the full list if it has a single project, then error out.
            const maybeDefaultProject = this._workspace.getDefaultProjectName();
            if (maybeDefaultProject && allProjectsForTargetName.includes(maybeDefaultProject)) {
                return [maybeDefaultProject];
            }
            if (allProjectsForTargetName.length === 1) {
                return allProjectsForTargetName;
            }
            throw new Error(`Could not determine a single project for the '${targetName}' target.`);
        }
    }
    async _loadWorkspaceAndArchitect() {
        const workspaceLoader = new workspace_loader_1.WorkspaceLoader(this._host);
        const workspace = await workspaceLoader.loadWorkspace(this.workspace.root);
        this._workspace = workspace;
        this._architect = await new architect_1.Architect(workspace).loadArchitect().toPromise();
    }
    _makeTargetSpecifier(commandOptions) {
        let project, target, configuration;
        if (commandOptions.target) {
            [project, target, configuration] = commandOptions.target.split(':');
            if (commandOptions.configuration) {
                configuration = commandOptions.configuration;
            }
        }
        else {
            project = commandOptions.project;
            target = this.target;
            configuration = commandOptions.configuration;
            if (!configuration && commandOptions.prod) {
                configuration = 'production';
            }
        }
        if (!project) {
            project = '';
        }
        if (!target) {
            target = '';
        }
        return {
            project,
            configuration,
            target,
        };
    }
}
exports.ArchitectCommand = ArchitectCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJjaGl0ZWN0LWNvbW1hbmQuanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL2FuZ3VsYXIvY2xpL21vZGVscy9hcmNoaXRlY3QtY29tbWFuZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7R0FNRztBQUNILHlEQUttQztBQUNuQywrQ0FBd0U7QUFDeEUsb0RBQTJEO0FBQzNELDBDQUFpRDtBQUNqRCwwREFBb0U7QUFDcEUsdUNBQXdEO0FBRXhELHFDQUEwQztBQUMxQyx5REFBcUQ7QUFTckQsTUFBc0IsZ0JBRXBCLFNBQVEsaUJBQWdDO0lBRjFDOztRQUdVLFVBQUssR0FBRyxJQUFJLHFCQUFjLEVBQUUsQ0FBQztRQUtyQyxxREFBcUQ7UUFDM0MsZ0JBQVcsR0FBRyxLQUFLLENBQUM7SUE0VGhDLENBQUM7SUF4VFEsS0FBSyxDQUFDLFVBQVUsQ0FBQyxPQUE0QztRQUNsRSxNQUFNLEtBQUssQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFaEMsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLFdBQUksQ0FBQyxNQUFNLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUN0RCxJQUFJLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLFdBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLG9CQUFvQixDQUFDLENBQUM7UUFFN0UsTUFBTSxJQUFJLENBQUMsMEJBQTBCLEVBQUUsQ0FBQztRQUV4QyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNoQixJQUFJLE9BQU8sQ0FBQyxJQUFJLEVBQUU7Z0JBQ2hCLCtDQUErQztnQkFDL0MsT0FBTzthQUNSO1lBRUQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3JELElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRTtnQkFDM0MsTUFBTSxJQUFJLEtBQUss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QUksY0FBYyxDQUFDLE1BQU0sRUFBRTtZQUN6QixDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsYUFBYSxDQUFDLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFcEUsSUFBSSxjQUFjLENBQUMsYUFBYSxFQUFFO2dCQUNoQyxhQUFhLEdBQUcsY0FBYyxDQUFDLGFBQWEsQ0FBQzthQUM5QztTQUNGO2FBQU07WUFDTCxPQUFPLEdBQUcsY0FBYyxDQUFDLE9BQU8sQ0FBQztZQUNqQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztZQUNyQixhQUFhLEdBQUcsY0FBYyxDQUFDLGFBQWEsQ0FBQztZQUM3QyxJQUFJLENBQUMsYUFBYSxJQUFJLGNBQWMsQ0FBQyxJQUFJLEVBQUU7Z0JBQ3pDLGFBQWEsR0FBRyxZQUFZLENBQUM7YUFDOUI7U0FDRjtRQUVELElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDWixPQUFPLEdBQUcsRUFBRSxDQUFDO1NBQ2Q7UUFDRCxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ1gsTUFBTSxHQUFHLEVBQUUsQ0FBQztTQUNiO1FBRUQsT0FBTztZQUNMLE9BQU87WUFDUCxhQUFhO1lBQ2IsTUFBTTtTQUNQLENBQUM7SUFDSixDQUFDO0NBQ0Y7QUFyVUQsNENBcVVDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtcbiAgQXJjaGl0ZWN0LFxuICBCdWlsZGVyQ29uZmlndXJhdGlvbixcbiAgQnVpbGRlckNvbnRleHQsXG4gIFRhcmdldFNwZWNpZmllcixcbn0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L2FyY2hpdGVjdCc7XG5pbXBvcnQgeyBleHBlcmltZW50YWwsIGpzb24sIHNjaGVtYSwgdGFncyB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9jb3JlJztcbmltcG9ydCB7IE5vZGVKc1N5bmNIb3N0IH0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L2NvcmUvbm9kZSc7XG5pbXBvcnQgeyBCZXBKc29uV3JpdGVyIH0gZnJvbSAnLi4vdXRpbGl0aWVzL2JlcCc7XG5pbXBvcnQgeyBwYXJzZUpzb25TY2hlbWFUb09wdGlvbnMgfSBmcm9tICcuLi91dGlsaXRpZXMvanNvbi1zY2hlbWEnO1xuaW1wb3J0IHsgQmFzZUNvbW1hbmRPcHRpb25zLCBDb21tYW5kIH0gZnJvbSAnLi9jb21tYW5kJztcbmltcG9ydCB7IEFyZ3VtZW50cywgT3B0aW9uIH0gZnJvbSAnLi9pbnRlcmZhY2UnO1xuaW1wb3J0IHsgcGFyc2VBcmd1bWVudHMgfSBmcm9tICcuL3BhcnNlcic7XG5pbXBvcnQgeyBXb3Jrc3BhY2VMb2FkZXIgfSBmcm9tICcuL3dvcmtzcGFjZS1sb2FkZXInO1xuXG5leHBvcnQgaW50ZXJmYWNlIEFyY2hpdGVjdENvbW1hbmRPcHRpb25zIGV4dGVuZHMgQmFzZUNvbW1hbmRPcHRpb25zIHtcbiAgcHJvamVjdD86IHN0cmluZztcbiAgY29uZmlndXJhdGlvbj86IHN0cmluZztcbiAgcHJvZD86IGJvb2xlYW47XG4gIHRhcmdldD86IHN0cmluZztcbn1cblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEFyY2hpdGVjdENvbW1hbmQ8XG4gIFQgZXh0ZW5kcyBBcmNoaXRlY3RDb21tYW5kT3B0aW9ucyA9IEFyY2hpdGVjdENvbW1hbmRPcHRpb25zLFxuPiBleHRlbmRzIENvbW1hbmQ8QXJjaGl0ZWN0Q29tbWFuZE9wdGlvbnM+IHtcbiAgcHJpdmF0ZSBfaG9zdCA9IG5ldyBOb2RlSnNTeW5jSG9zdCgpO1xuICBwcm90ZWN0ZWQgX2FyY2hpdGVjdDogQXJjaGl0ZWN0O1xuICBwcm90ZWN0ZWQgX3dvcmtzcGFjZTogZXhwZXJpbWVudGFsLndvcmtzcGFjZS5Xb3Jrc3BhY2U7XG4gIHByb3RlY3RlZCBfcmVnaXN0cnk6IGpzb24uc2NoZW1hLlNjaGVtYVJlZ2lzdHJ5O1xuXG4gIC8vIElmIHRoaXMgY29tbWFuZCBzdXBwb3J0cyBydW5uaW5nIG11bHRpcGxlIHRhcmdldHMuXG4gIHByb3RlY3RlZCBtdWx0aVRhcmdldCA9IGZhbHNlO1xuXG4gIHRhcmdldDogc3RyaW5nIHwgdW5kZWZpbmVkO1xuXG4gIHB1YmxpYyBhc3luYyBpbml0aWFsaXplKG9wdGlvbnM6IEFyY2hpdGVjdENvbW1hbmRPcHRpb25zICYgQXJndW1lbnRzKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgc3VwZXIuaW5pdGlhbGl6ZShvcHRpb25zKTtcblxuICAgIHRoaXMuX3JlZ2lzdHJ5ID0gbmV3IGpzb24uc2NoZW1hLkNvcmVTY2hlbWFSZWdpc3RyeSgpO1xuICAgIHRoaXMuX3JlZ2lzdHJ5LmFkZFBvc3RUcmFuc2Zvcm0oanNvbi5zY2hlbWEudHJhbnNmb3Jtcy5hZGRVbmRlZmluZWREZWZhdWx0cyk7XG5cbiAgICBhd2FpdCB0aGlzLl9sb2FkV29ya3NwYWNlQW5kQXJjaGl0ZWN0KCk7XG5cbiAgICBpZiAoIXRoaXMudGFyZ2V0KSB7XG4gICAgICBpZiAob3B0aW9ucy5oZWxwKSB7XG4gICAgICAgIC8vIFRoaXMgaXMgYSBzcGVjaWFsIGNhc2Ugd2hlcmUgd2UganVzdCByZXR1cm4uXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3Qgc3BlY2lmaWVyID0gdGhpcy5fbWFrZVRhcmdldFNwZWNpZmllcihvcHRpb25zKTtcbiAgICAgIGlmICghc3BlY2lmaWVyLnByb2plY3QgfHwgIXNwZWNpZmllci50YXJnZXQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgZGV0ZXJtaW5lIHByb2plY3Qgb3IgdGFyZ2V0IGZvciBjb21tYW5kLicpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgY29tbWFuZExlZnRvdmVycyA9IG9wdGlvbnNbJy0tJ107XG4gICAgbGV0IHByb2plY3ROYW1lID0gb3B0aW9ucy5wcm9qZWN0O1xuICAgIGNvbnN0IHRhcmdldFByb2plY3ROYW1lczogc3RyaW5nW10gPSBbXTtcbiAgICBmb3IgKGNvbnN0IG5hbWUgb2YgdGhpcy5fd29ya3NwYWNlLmxpc3RQcm9qZWN0TmFtZXMoKSkge1xuICAgICAgaWYgKHRoaXMuX2FyY2hpdGVjdC5saXN0UHJvamVjdFRhcmdldHMobmFtZSkuaW5jbHVkZXModGhpcy50YXJnZXQpKSB7XG4gICAgICAgIHRhcmdldFByb2plY3ROYW1lcy5wdXNoKG5hbWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0YXJnZXRQcm9qZWN0TmFtZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYE5vIHByb2plY3RzIHN1cHBvcnQgdGhlICcke3RoaXMudGFyZ2V0fScgdGFyZ2V0LmApO1xuICAgIH1cblxuICAgIGlmIChwcm9qZWN0TmFtZSAmJiAhdGFyZ2V0UHJvamVjdE5hbWVzLmluY2x1ZGVzKHByb2plY3ROYW1lKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBQcm9qZWN0ICcke3Byb2plY3ROYW1lfScgZG9lcyBub3Qgc3VwcG9ydCB0aGUgJyR7dGhpcy50YXJnZXR9JyB0YXJnZXQuYCk7XG4gICAgfVxuXG4gICAgaWYgKCFwcm9qZWN0TmFtZSAmJiBjb21tYW5kTGVmdG92ZXJzICYmIGNvbW1hbmRMZWZ0b3ZlcnMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgYnVpbGRlck5hbWVzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgICBjb25zdCBsZWZ0b3Zlck1hcCA9IG5ldyBNYXA8c3RyaW5nLCB7IG9wdGlvbkRlZnM6IE9wdGlvbltdLCBwYXJzZWRPcHRpb25zOiBBcmd1bWVudHMgfT4oKTtcbiAgICAgIGxldCBwb3RlbnRpYWxQcm9qZWN0TmFtZXMgPSBuZXcgU2V0PHN0cmluZz4odGFyZ2V0UHJvamVjdE5hbWVzKTtcbiAgICAgIGZvciAoY29uc3QgbmFtZSBvZiB0YXJnZXRQcm9qZWN0TmFtZXMpIHtcbiAgICAgICAgY29uc3QgYnVpbGRlckNvbmZpZyA9IHRoaXMuX2FyY2hpdGVjdC5nZXRCdWlsZGVyQ29uZmlndXJhdGlvbih7XG4gICAgICAgICAgcHJvamVjdDogbmFtZSxcbiAgICAgICAgICB0YXJnZXQ6IHRoaXMudGFyZ2V0LFxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAodGhpcy5tdWx0aVRhcmdldCkge1xuICAgICAgICAgIGJ1aWxkZXJOYW1lcy5hZGQoYnVpbGRlckNvbmZpZy5idWlsZGVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGJ1aWxkZXJEZXNjID0gYXdhaXQgdGhpcy5fYXJjaGl0ZWN0LmdldEJ1aWxkZXJEZXNjcmlwdGlvbihidWlsZGVyQ29uZmlnKS50b1Byb21pc2UoKTtcbiAgICAgICAgY29uc3Qgb3B0aW9uRGVmcyA9IGF3YWl0IHBhcnNlSnNvblNjaGVtYVRvT3B0aW9ucyh0aGlzLl9yZWdpc3RyeSwgYnVpbGRlckRlc2Muc2NoZW1hKTtcbiAgICAgICAgY29uc3QgcGFyc2VkT3B0aW9ucyA9IHBhcnNlQXJndW1lbnRzKFsuLi5jb21tYW5kTGVmdG92ZXJzXSwgb3B0aW9uRGVmcyk7XG4gICAgICAgIGNvbnN0IGJ1aWxkZXJMZWZ0b3ZlcnMgPSBwYXJzZWRPcHRpb25zWyctLSddIHx8IFtdO1xuICAgICAgICBsZWZ0b3Zlck1hcC5zZXQobmFtZSwgeyBvcHRpb25EZWZzLCBwYXJzZWRPcHRpb25zIH0pO1xuXG4gICAgICAgIHBvdGVudGlhbFByb2plY3ROYW1lcyA9IG5ldyBTZXQoYnVpbGRlckxlZnRvdmVycy5maWx0ZXIoeCA9PiBwb3RlbnRpYWxQcm9qZWN0TmFtZXMuaGFzKHgpKSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChwb3RlbnRpYWxQcm9qZWN0TmFtZXMuc2l6ZSA9PT0gMSkge1xuICAgICAgICBwcm9qZWN0TmFtZSA9IFsuLi5wb3RlbnRpYWxQcm9qZWN0TmFtZXNdWzBdO1xuXG4gICAgICAgIC8vIHJlbW92ZSB0aGUgcHJvamVjdCBuYW1lIGZyb20gdGhlIGxlZnRvdmVyc1xuICAgICAgICBjb25zdCBvcHRpb25JbmZvID0gbGVmdG92ZXJNYXAuZ2V0KHByb2plY3ROYW1lKTtcbiAgICAgICAgaWYgKG9wdGlvbkluZm8pIHtcbiAgICAgICAgICBjb25zdCBsb2NhdGlvbnMgPSBbXTtcbiAgICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgICAgd2hpbGUgKGkgPCBjb21tYW5kTGVmdG92ZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgaSA9IGNvbW1hbmRMZWZ0b3ZlcnMuaW5kZXhPZihwcm9qZWN0TmFtZSwgaSArIDEpO1xuICAgICAgICAgICAgaWYgKGkgPT09IC0xKSB7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbG9jYXRpb25zLnB1c2goaSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGRlbGV0ZSBvcHRpb25JbmZvLnBhcnNlZE9wdGlvbnNbJy0tJ107XG4gICAgICAgICAgZm9yIChjb25zdCBsb2NhdGlvbiBvZiBsb2NhdGlvbnMpIHtcbiAgICAgICAgICAgIGNvbnN0IHRlbXBMZWZ0b3ZlcnMgPSBbLi4uY29tbWFuZExlZnRvdmVyc107XG4gICAgICAgICAgICB0ZW1wTGVmdG92ZXJzLnNwbGljZShsb2NhdGlvbiwgMSk7XG4gICAgICAgICAgICBjb25zdCB0ZW1wQXJncyA9IHBhcnNlQXJndW1lbnRzKFsuLi50ZW1wTGVmdG92ZXJzXSwgb3B0aW9uSW5mby5vcHRpb25EZWZzKTtcbiAgICAgICAgICAgIGRlbGV0ZSB0ZW1wQXJnc1snLS0nXTtcbiAgICAgICAgICAgIGlmIChKU09OLnN0cmluZ2lmeShvcHRpb25JbmZvLnBhcnNlZE9wdGlvbnMpID09PSBKU09OLnN0cmluZ2lmeSh0ZW1wQXJncykpIHtcbiAgICAgICAgICAgICAgb3B0aW9uc1snLS0nXSA9IHRlbXBMZWZ0b3ZlcnM7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoIXByb2plY3ROYW1lICYmIHRoaXMubXVsdGlUYXJnZXQgJiYgYnVpbGRlck5hbWVzLnNpemUgPiAxKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcih0YWdzLm9uZUxpbmVgXG4gICAgICAgICAgQXJjaGl0ZWN0IGNvbW1hbmRzIHdpdGggY29tbWFuZCBsaW5lIG92ZXJyaWRlcyBjYW5ub3QgdGFyZ2V0IGRpZmZlcmVudCBidWlsZGVycy4gVGhlXG4gICAgICAgICAgJyR7dGhpcy50YXJnZXR9JyB0YXJnZXQgd291bGQgcnVuIG9uIHByb2plY3RzICR7dGFyZ2V0UHJvamVjdE5hbWVzLmpvaW4oKX0gd2hpY2ggaGF2ZSB0aGVcbiAgICAgICAgICBmb2xsb3dpbmcgYnVpbGRlcnM6ICR7J1xcbiAgJyArIFsuLi5idWlsZGVyTmFtZXNdLmpvaW4oJ1xcbiAgJyl9XG4gICAgICAgIGApO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghcHJvamVjdE5hbWUgJiYgIXRoaXMubXVsdGlUYXJnZXQpIHtcbiAgICAgIGNvbnN0IGRlZmF1bHRQcm9qZWN0TmFtZSA9IHRoaXMuX3dvcmtzcGFjZS5nZXREZWZhdWx0UHJvamVjdE5hbWUoKTtcbiAgICAgIGlmICh0YXJnZXRQcm9qZWN0TmFtZXMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIHByb2plY3ROYW1lID0gdGFyZ2V0UHJvamVjdE5hbWVzWzBdO1xuICAgICAgfSBlbHNlIGlmIChkZWZhdWx0UHJvamVjdE5hbWUgJiYgdGFyZ2V0UHJvamVjdE5hbWVzLmluY2x1ZGVzKGRlZmF1bHRQcm9qZWN0TmFtZSkpIHtcbiAgICAgICAgcHJvamVjdE5hbWUgPSBkZWZhdWx0UHJvamVjdE5hbWU7XG4gICAgICB9IGVsc2UgaWYgKG9wdGlvbnMuaGVscCkge1xuICAgICAgICAvLyBUaGlzIGlzIGEgc3BlY2lhbCBjYXNlIHdoZXJlIHdlIGp1c3QgcmV0dXJuLlxuICAgICAgICByZXR1cm47XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBkZXRlcm1pbmUgcHJvamVjdCBvciB0YXJnZXQgZm9yIGNvbW1hbmQuJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgb3B0aW9ucy5wcm9qZWN0ID0gcHJvamVjdE5hbWU7XG5cbiAgICBjb25zdCBidWlsZGVyQ29uZiA9IHRoaXMuX2FyY2hpdGVjdC5nZXRCdWlsZGVyQ29uZmlndXJhdGlvbih7XG4gICAgICBwcm9qZWN0OiBwcm9qZWN0TmFtZSB8fCAodGFyZ2V0UHJvamVjdE5hbWVzLmxlbmd0aCA+IDAgPyB0YXJnZXRQcm9qZWN0TmFtZXNbMF0gOiAnJyksXG4gICAgICB0YXJnZXQ6IHRoaXMudGFyZ2V0LFxuICAgIH0pO1xuICAgIGNvbnN0IGJ1aWxkZXJEZXNjID0gYXdhaXQgdGhpcy5fYXJjaGl0ZWN0LmdldEJ1aWxkZXJEZXNjcmlwdGlvbihidWlsZGVyQ29uZikudG9Qcm9taXNlKCk7XG5cbiAgICB0aGlzLmRlc2NyaXB0aW9uLm9wdGlvbnMucHVzaCguLi4oXG4gICAgICBhd2FpdCBwYXJzZUpzb25TY2hlbWFUb09wdGlvbnModGhpcy5fcmVnaXN0cnksIGJ1aWxkZXJEZXNjLnNjaGVtYSlcbiAgICApKTtcbiAgfVxuXG4gIGFzeW5jIHJ1bihvcHRpb25zOiBBcmNoaXRlY3RDb21tYW5kT3B0aW9ucyAmIEFyZ3VtZW50cykge1xuICAgIHJldHVybiBhd2FpdCB0aGlzLnJ1bkFyY2hpdGVjdFRhcmdldChvcHRpb25zKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBhc3luYyBydW5CZXBUYXJnZXQ8VD4oXG4gICAgY29tbWFuZDogc3RyaW5nLFxuICAgIGNvbmZpZ3VyYXRpb246IEJ1aWxkZXJDb25maWd1cmF0aW9uPFQ+LFxuICAgIGJ1aWxkRXZlbnRMb2c6IHN0cmluZyxcbiAgKTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICBjb25zdCBiZXAgPSBuZXcgQmVwSnNvbldyaXRlcihidWlsZEV2ZW50TG9nKTtcblxuICAgIC8vIFNlbmQgc3RhcnRcbiAgICBiZXAud3JpdGVCdWlsZFN0YXJ0ZWQoY29tbWFuZCk7XG5cbiAgICBsZXQgbGFzdCA9IDE7XG4gICAgbGV0IHJlYnVpbGQgPSBmYWxzZTtcbiAgICBhd2FpdCB0aGlzLl9hcmNoaXRlY3QucnVuKGNvbmZpZ3VyYXRpb24sIHsgbG9nZ2VyOiB0aGlzLmxvZ2dlciB9KS5mb3JFYWNoKGV2ZW50ID0+IHtcbiAgICAgIGxhc3QgPSBldmVudC5zdWNjZXNzID8gMCA6IDE7XG5cbiAgICAgIGlmIChyZWJ1aWxkKSB7XG4gICAgICAgIC8vIE5PVEU6IFRoaXMgd2lsbCBoYXZlIGFuIGluY29ycmVjdCB0aW1lc3RhbXAgYnV0IHRoaXMgY2Fubm90IGJlIGZpeGVkXG4gICAgICAgIC8vICAgICAgIHVudGlsIGJ1aWxkZXJzIHJlcG9ydCBhZGRpdGlvbmFsIHN0YXR1cyBldmVudHNcbiAgICAgICAgYmVwLndyaXRlQnVpbGRTdGFydGVkKGNvbW1hbmQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVidWlsZCA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIGJlcC53cml0ZUJ1aWxkRmluaXNoZWQobGFzdCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gbGFzdDtcbiAgfVxuXG4gIHByb3RlY3RlZCBhc3luYyBydW5TaW5nbGVUYXJnZXQoXG4gICAgdGFyZ2V0U3BlYzogVGFyZ2V0U3BlY2lmaWVyLFxuICAgIHRhcmdldE9wdGlvbnM6IHN0cmluZ1tdLFxuICAgIGNvbW1hbmRPcHRpb25zOiBBcmNoaXRlY3RDb21tYW5kT3B0aW9ucyAmIEFyZ3VtZW50cykge1xuICAgIC8vIFdlIG5lZWQgdG8gYnVpbGQgdGhlIGJ1aWxkZXJTcGVjIHR3aWNlIGJlY2F1c2UgYXJjaGl0ZWN0IGRvZXMgbm90IHVuZGVyc3RhbmRcbiAgICAvLyBvdmVycmlkZXMgc2VwYXJhdGVseSAoZ2V0dGluZyB0aGUgY29uZmlndXJhdGlvbiBidWlsZHMgdGhlIHdob2xlIHByb2plY3QsIGluY2x1ZGluZ1xuICAgIC8vIG92ZXJyaWRlcykuXG4gICAgY29uc3QgYnVpbGRlckNvbmYgPSB0aGlzLl9hcmNoaXRlY3QuZ2V0QnVpbGRlckNvbmZpZ3VyYXRpb24odGFyZ2V0U3BlYyk7XG4gICAgY29uc3QgYnVpbGRlckRlc2MgPSBhd2FpdCB0aGlzLl9hcmNoaXRlY3QuZ2V0QnVpbGRlckRlc2NyaXB0aW9uKGJ1aWxkZXJDb25mKS50b1Byb21pc2UoKTtcbiAgICBjb25zdCB0YXJnZXRPcHRpb25BcnJheSA9IGF3YWl0IHBhcnNlSnNvblNjaGVtYVRvT3B0aW9ucyh0aGlzLl9yZWdpc3RyeSwgYnVpbGRlckRlc2Muc2NoZW1hKTtcbiAgICBjb25zdCBvdmVycmlkZXMgPSBwYXJzZUFyZ3VtZW50cyh0YXJnZXRPcHRpb25zLCB0YXJnZXRPcHRpb25BcnJheSwgdGhpcy5sb2dnZXIpO1xuXG4gICAgaWYgKG92ZXJyaWRlc1snLS0nXSkge1xuICAgICAgKG92ZXJyaWRlc1snLS0nXSB8fCBbXSkuZm9yRWFjaChhZGRpdGlvbmFsID0+IHtcbiAgICAgICAgdGhpcy5sb2dnZXIuZmF0YWwoYFVua25vd24gb3B0aW9uOiAnJHthZGRpdGlvbmFsLnNwbGl0KC89LylbMF19J2ApO1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiAxO1xuICAgIH1cbiAgICBjb25zdCByZWFsQnVpbGRlckNvbmYgPSB0aGlzLl9hcmNoaXRlY3QuZ2V0QnVpbGRlckNvbmZpZ3VyYXRpb24oeyAuLi50YXJnZXRTcGVjLCBvdmVycmlkZXMgfSk7XG4gICAgY29uc3QgYnVpbGRlckNvbnRleHQ6IFBhcnRpYWw8QnVpbGRlckNvbnRleHQ+ID0ge1xuICAgICAgbG9nZ2VyOiB0aGlzLmxvZ2dlcixcbiAgICAgIHRhcmdldFNwZWNpZmllcjogdGFyZ2V0U3BlYyxcbiAgICB9O1xuXG4gICAgaWYgKGNvbW1hbmRPcHRpb25zLmJ1aWxkRXZlbnRMb2cgJiYgWydidWlsZCcsICdzZXJ2ZSddLmluY2x1ZGVzKHRoaXMuZGVzY3JpcHRpb24ubmFtZSkpIHtcbiAgICAgIC8vIFRoZSBidWlsZC9zZXJ2ZSBjb21tYW5kcyBzdXBwb3J0cyBCRVAgbWVzc2FnaW5nXG4gICAgICB0aGlzLmxvZ2dlci53YXJuKCdCRVAgc3VwcG9ydCBpcyBleHBlcmltZW50YWwgYW5kIHN1YmplY3QgdG8gY2hhbmdlLicpO1xuXG4gICAgICByZXR1cm4gdGhpcy5ydW5CZXBUYXJnZXQoXG4gICAgICAgIHRoaXMuZGVzY3JpcHRpb24ubmFtZSxcbiAgICAgICAgcmVhbEJ1aWxkZXJDb25mLFxuICAgICAgICBjb21tYW5kT3B0aW9ucy5idWlsZEV2ZW50TG9nIGFzIHN0cmluZyxcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuX2FyY2hpdGVjdFxuICAgICAgICAucnVuKHJlYWxCdWlsZGVyQ29uZiwgYnVpbGRlckNvbnRleHQpXG4gICAgICAgIC50b1Byb21pc2UoKTtcblxuICAgICAgcmV0dXJuIHJlc3VsdC5zdWNjZXNzID8gMCA6IDE7XG4gICAgfVxuICB9XG5cbiAgcHJvdGVjdGVkIGFzeW5jIHJ1bkFyY2hpdGVjdFRhcmdldChcbiAgICBvcHRpb25zOiBBcmNoaXRlY3RDb21tYW5kT3B0aW9ucyAmIEFyZ3VtZW50cyxcbiAgKTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICBjb25zdCBleHRyYSA9IG9wdGlvbnNbJy0tJ10gfHwgW107XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgdGFyZ2V0U3BlYyA9IHRoaXMuX21ha2VUYXJnZXRTcGVjaWZpZXIob3B0aW9ucyk7XG4gICAgICBpZiAoIXRhcmdldFNwZWMucHJvamVjdCAmJiB0aGlzLnRhcmdldCkge1xuICAgICAgICAvLyBUaGlzIHJ1bnMgZWFjaCB0YXJnZXQgc2VxdWVudGlhbGx5LlxuICAgICAgICAvLyBSdW5uaW5nIHRoZW0gaW4gcGFyYWxsZWwgd291bGQganVtYmxlIHRoZSBsb2cgbWVzc2FnZXMuXG4gICAgICAgIGxldCByZXN1bHQgPSAwO1xuICAgICAgICBmb3IgKGNvbnN0IHByb2plY3Qgb2YgdGhpcy5nZXRQcm9qZWN0TmFtZXNCeVRhcmdldCh0aGlzLnRhcmdldCkpIHtcbiAgICAgICAgICByZXN1bHQgfD0gYXdhaXQgdGhpcy5ydW5TaW5nbGVUYXJnZXQoeyAuLi50YXJnZXRTcGVjLCBwcm9qZWN0IH0sIGV4dHJhLCBvcHRpb25zKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5ydW5TaW5nbGVUYXJnZXQodGFyZ2V0U3BlYywgZXh0cmEsIG9wdGlvbnMpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmIChlIGluc3RhbmNlb2Ygc2NoZW1hLlNjaGVtYVZhbGlkYXRpb25FeGNlcHRpb24pIHtcbiAgICAgICAgY29uc3QgbmV3RXJyb3JzOiBzY2hlbWEuU2NoZW1hVmFsaWRhdG9yRXJyb3JbXSA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IHNjaGVtYUVycm9yIG9mIGUuZXJyb3JzKSB7XG4gICAgICAgICAgaWYgKHNjaGVtYUVycm9yLmtleXdvcmQgPT09ICdhZGRpdGlvbmFsUHJvcGVydGllcycpIHtcbiAgICAgICAgICAgIGNvbnN0IHVua25vd25Qcm9wZXJ0eSA9IHNjaGVtYUVycm9yLnBhcmFtcy5hZGRpdGlvbmFsUHJvcGVydHk7XG4gICAgICAgICAgICBpZiAodW5rbm93blByb3BlcnR5IGluIG9wdGlvbnMpIHtcbiAgICAgICAgICAgICAgY29uc3QgZGFzaGVzID0gdW5rbm93blByb3BlcnR5Lmxlbmd0aCA9PT0gMSA/ICctJyA6ICctLSc7XG4gICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmZhdGFsKGBVbmtub3duIG9wdGlvbjogJyR7ZGFzaGVzfSR7dW5rbm93blByb3BlcnR5fSdgKTtcbiAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIG5ld0Vycm9ycy5wdXNoKHNjaGVtYUVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChuZXdFcnJvcnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKG5ldyBzY2hlbWEuU2NoZW1hVmFsaWRhdGlvbkV4Y2VwdGlvbihuZXdFcnJvcnMpLm1lc3NhZ2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIDE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgZ2V0UHJvamVjdE5hbWVzQnlUYXJnZXQodGFyZ2V0TmFtZTogc3RyaW5nKTogc3RyaW5nW10ge1xuICAgIGNvbnN0IGFsbFByb2plY3RzRm9yVGFyZ2V0TmFtZSA9IHRoaXMuX3dvcmtzcGFjZS5saXN0UHJvamVjdE5hbWVzKCkubWFwKHByb2plY3ROYW1lID0+XG4gICAgICB0aGlzLl9hcmNoaXRlY3QubGlzdFByb2plY3RUYXJnZXRzKHByb2plY3ROYW1lKS5pbmNsdWRlcyh0YXJnZXROYW1lKSA/IHByb2plY3ROYW1lIDogbnVsbCxcbiAgICApLmZpbHRlcih4ID0+ICEheCkgYXMgc3RyaW5nW107XG5cbiAgICBpZiAodGhpcy5tdWx0aVRhcmdldCkge1xuICAgICAgLy8gRm9yIG11bHRpIHRhcmdldCBjb21tYW5kcywgd2UgYWx3YXlzIGxpc3QgYWxsIHByb2plY3RzIHRoYXQgaGF2ZSB0aGUgdGFyZ2V0LlxuICAgICAgcmV0dXJuIGFsbFByb2plY3RzRm9yVGFyZ2V0TmFtZTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gRm9yIHNpbmdsZSB0YXJnZXQgY29tbWFuZHMsIHdlIHRyeSB0aGUgZGVmYXVsdCBwcm9qZWN0IGZpcnN0LFxuICAgICAgLy8gdGhlbiB0aGUgZnVsbCBsaXN0IGlmIGl0IGhhcyBhIHNpbmdsZSBwcm9qZWN0LCB0aGVuIGVycm9yIG91dC5cbiAgICAgIGNvbnN0IG1heWJlRGVmYXVsdFByb2plY3QgPSB0aGlzLl93b3Jrc3BhY2UuZ2V0RGVmYXVsdFByb2plY3ROYW1lKCk7XG4gICAgICBpZiAobWF5YmVEZWZhdWx0UHJvamVjdCAmJiBhbGxQcm9qZWN0c0ZvclRhcmdldE5hbWUuaW5jbHVkZXMobWF5YmVEZWZhdWx0UHJvamVjdCkpIHtcbiAgICAgICAgcmV0dXJuIFttYXliZURlZmF1bHRQcm9qZWN0XTtcbiAgICAgIH1cblxuICAgICAgaWYgKGFsbFByb2plY3RzRm9yVGFyZ2V0TmFtZS5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgcmV0dXJuIGFsbFByb2plY3RzRm9yVGFyZ2V0TmFtZTtcbiAgICAgIH1cblxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDb3VsZCBub3QgZGV0ZXJtaW5lIGEgc2luZ2xlIHByb2plY3QgZm9yIHRoZSAnJHt0YXJnZXROYW1lfScgdGFyZ2V0LmApO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgX2xvYWRXb3Jrc3BhY2VBbmRBcmNoaXRlY3QoKSB7XG4gICAgY29uc3Qgd29ya3NwYWNlTG9hZGVyID0gbmV3IFdvcmtzcGFjZUxvYWRlcih0aGlzLl9ob3N0KTtcblxuICAgIGNvbnN0IHdvcmtzcGFjZSA9IGF3YWl0IHdvcmtzcGFjZUxvYWRlci5sb2FkV29ya3NwYWNlKHRoaXMud29ya3NwYWNlLnJvb3QpO1xuXG4gICAgdGhpcy5fd29ya3NwYWNlID0gd29ya3NwYWNlO1xuICAgIHRoaXMuX2FyY2hpdGVjdCA9IGF3YWl0IG5ldyBBcmNoaXRlY3Qod29ya3NwYWNlKS5sb2FkQXJjaGl0ZWN0KCkudG9Qcm9taXNlKCk7XG4gIH1cblxuICBwcml2YXRlIF9tYWtlVGFyZ2V0U3BlY2lmaWVyKGNvbW1hbmRPcHRpb25zOiBBcmNoaXRlY3RDb21tYW5kT3B0aW9ucyk6IFRhcmdldFNwZWNpZmllciB7XG4gICAgbGV0IHByb2plY3QsIHRhcmdldCwgY29uZmlndXJhdGlvbjtcblxuICAgIGlmIChjb21tYW5kT3B0aW9ucy50YXJnZXQpIHtcbiAgICAgIFtwcm9qZWN0LCB0YXJnZXQsIGNvbmZpZ3VyYXRpb25dID0gY29tbWFuZE9wdGlvbnMudGFyZ2V0LnNwbGl0KCc6Jyk7XG5cbiAgICAgIGlmIChjb21tYW5kT3B0aW9ucy5jb25maWd1cmF0aW9uKSB7XG4gICAgICAgIGNvbmZpZ3VyYXRpb24gPSBjb21tYW5kT3B0aW9ucy5jb25maWd1cmF0aW9uO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBwcm9qZWN0ID0gY29tbWFuZE9wdGlvbnMucHJvamVjdDtcbiAgICAgIHRhcmdldCA9IHRoaXMudGFyZ2V0O1xuICAgICAgY29uZmlndXJhdGlvbiA9IGNvbW1hbmRPcHRpb25zLmNvbmZpZ3VyYXRpb247XG4gICAgICBpZiAoIWNvbmZpZ3VyYXRpb24gJiYgY29tbWFuZE9wdGlvbnMucHJvZCkge1xuICAgICAgICBjb25maWd1cmF0aW9uID0gJ3Byb2R1Y3Rpb24nO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghcHJvamVjdCkge1xuICAgICAgcHJvamVjdCA9ICcnO1xuICAgIH1cbiAgICBpZiAoIXRhcmdldCkge1xuICAgICAgdGFyZ2V0ID0gJyc7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHByb2plY3QsXG4gICAgICBjb25maWd1cmF0aW9uLFxuICAgICAgdGFyZ2V0LFxuICAgIH07XG4gIH1cbn1cbiJdfQ==