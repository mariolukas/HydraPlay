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
const tools_1 = require("@angular-devkit/schematics/tools");
const path_1 = require("path");
const semver_1 = require("semver");
const schematic_command_1 = require("../models/schematic-command");
const npm_install_1 = require("../tasks/npm-install");
const package_manager_1 = require("../utilities/package-manager");
const package_metadata_1 = require("../utilities/package-metadata");
const npa = require('npm-package-arg');
class AddCommand extends schematic_command_1.SchematicCommand {
    constructor() {
        super(...arguments);
        this.allowPrivateSchematics = true;
        this.packageManager = package_manager_1.getPackageManager(this.workspace.root);
    }
    async run(options) {
        if (!options.collection) {
            this.logger.fatal(`The "ng add" command requires a name argument to be specified eg. `
                + `${core_1.terminal.yellow('ng add [name] ')}. For more details, use "ng help".`);
            return 1;
        }
        let packageIdentifier;
        try {
            packageIdentifier = npa(options.collection);
        }
        catch (e) {
            this.logger.error(e.message);
            return 1;
        }
        if (packageIdentifier.registry && this.isPackageInstalled(packageIdentifier.name)) {
            // Already installed so just run schematic
            this.logger.info('Skipping installation: Package already installed');
            return this.executeSchematic(packageIdentifier.name, options['--']);
        }
        const usingYarn = this.packageManager === 'yarn';
        if (packageIdentifier.type === 'tag' && !packageIdentifier.rawSpec) {
            // only package name provided; search for viable version
            // plus special cases for packages that did not have peer deps setup
            let packageMetadata;
            try {
                packageMetadata = await package_metadata_1.fetchPackageMetadata(packageIdentifier.name, this.logger, { usingYarn });
            }
            catch (e) {
                this.logger.error('Unable to fetch package metadata: ' + e.message);
                return 1;
            }
            const latestManifest = packageMetadata.tags['latest'];
            if (latestManifest && Object.keys(latestManifest.peerDependencies).length === 0) {
                if (latestManifest.name === '@angular/pwa') {
                    const version = await this.findProjectVersion('@angular/cli');
                    // tslint:disable-next-line:no-any
                    const semverOptions = { includePrerelease: true };
                    if (version
                        && ((semver_1.validRange(version) && semver_1.intersects(version, '7', semverOptions))
                            || (semver_1.valid(version) && semver_1.satisfies(version, '7', semverOptions)))) {
                        packageIdentifier = npa.resolve('@angular/pwa', '0.12');
                    }
                }
            }
            else if (!latestManifest || (await this.hasMismatchedPeer(latestManifest))) {
                // 'latest' is invalid so search for most recent matching package
                const versionManifests = Array.from(packageMetadata.versions.values())
                    .filter(value => !semver_1.prerelease(value.version));
                versionManifests.sort((a, b) => semver_1.rcompare(a.version, b.version, true));
                let newIdentifier;
                for (const versionManifest of versionManifests) {
                    if (!(await this.hasMismatchedPeer(versionManifest))) {
                        newIdentifier = npa.resolve(packageIdentifier.name, versionManifest.version);
                        break;
                    }
                }
                if (!newIdentifier) {
                    this.logger.warn('Unable to find compatible package.  Using \'latest\'.');
                }
                else {
                    packageIdentifier = newIdentifier;
                }
            }
        }
        let collectionName = packageIdentifier.name;
        if (!packageIdentifier.registry) {
            try {
                const manifest = await package_metadata_1.fetchPackageManifest(packageIdentifier, this.logger, { usingYarn });
                collectionName = manifest.name;
                if (await this.hasMismatchedPeer(manifest)) {
                    console.warn('Package has unmet peer dependencies. Adding the package may not succeed.');
                }
            }
            catch (e) {
                this.logger.error('Unable to fetch package manifest: ' + e.message);
                return 1;
            }
        }
        await npm_install_1.default(packageIdentifier.raw, this.logger, this.packageManager, this.workspace.root);
        return this.executeSchematic(collectionName, options['--']);
    }
    isPackageInstalled(name) {
        try {
            node_1.resolve(name, {
                checkLocal: true,
                basedir: this.workspace.root,
                resolvePackageJson: true,
            });
            return true;
        }
        catch (e) {
            if (!(e instanceof node_1.ModuleNotFoundException)) {
                throw e;
            }
        }
        return false;
    }
    async executeSchematic(collectionName, options = []) {
        const runOptions = {
            schematicOptions: options,
            workingDir: this.workspace.root,
            collectionName,
            schematicName: 'ng-add',
            allowPrivate: true,
            dryRun: false,
            force: false,
        };
        try {
            return await this.runSchematic(runOptions);
        }
        catch (e) {
            if (e instanceof tools_1.NodePackageDoesNotSupportSchematics) {
                this.logger.error(core_1.tags.oneLine `
          The package that you are trying to add does not support schematics. You can try using
          a different version of the package or contact the package author to add ng-add support.
        `);
                return 1;
            }
            throw e;
        }
    }
    async findProjectVersion(name) {
        let installedPackage;
        try {
            installedPackage = node_1.resolve(name, { checkLocal: true, basedir: this.workspace.root, resolvePackageJson: true });
        }
        catch (_a) { }
        if (installedPackage) {
            try {
                const installed = await package_metadata_1.fetchPackageManifest(path_1.dirname(installedPackage), this.logger);
                return installed.version;
            }
            catch (_b) { }
        }
        let projectManifest;
        try {
            projectManifest = await package_metadata_1.fetchPackageManifest(this.workspace.root, this.logger);
        }
        catch (_c) { }
        if (projectManifest) {
            const version = projectManifest.dependencies[name] || projectManifest.devDependencies[name];
            if (version) {
                return version;
            }
        }
        return null;
    }
    async hasMismatchedPeer(manifest) {
        for (const peer in manifest.peerDependencies) {
            let peerIdentifier;
            try {
                peerIdentifier = npa.resolve(peer, manifest.peerDependencies[peer]);
            }
            catch (_a) {
                this.logger.warn(`Invalid peer dependency ${peer} found in package.`);
                continue;
            }
            if (peerIdentifier.type === 'version' || peerIdentifier.type === 'range') {
                try {
                    const version = await this.findProjectVersion(peer);
                    if (!version) {
                        continue;
                    }
                    // tslint:disable-next-line:no-any
                    const options = { includePrerelease: true };
                    if (!semver_1.intersects(version, peerIdentifier.rawSpec, options)
                        && !semver_1.satisfies(version, peerIdentifier.rawSpec, options)) {
                        return true;
                    }
                }
                catch (_b) {
                    // Not found or invalid so ignore
                    continue;
                }
            }
            else {
                // type === 'tag' | 'file' | 'directory' | 'remote' | 'git'
                // Cannot accurately compare these as the tag/location may have changed since install
            }
        }
        return false;
    }
}
exports.AddCommand = AddCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkLWltcGwuanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL2FuZ3VsYXIvY2xpL2NvbW1hbmRzL2FkZC1pbXBsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7OztHQU1HO0FBQ0gsK0NBQXNEO0FBQ3RELG9EQUE2RTtBQUM3RSw0REFBdUY7QUFDdkYsK0JBQStCO0FBQy9CLG1DQUF3RjtBQUV4RixtRUFBK0Q7QUFDL0Qsc0RBQThDO0FBQzlDLGtFQUFpRTtBQUNqRSxvRUFJdUM7QUFHdkMsTUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFFdkMsTUFBYSxVQUFXLFNBQVEsb0NBQWtDO0lBQWxFOztRQUNXLDJCQUFzQixHQUFHLElBQUksQ0FBQztRQUM5QixtQkFBYyxHQUFHLG1DQUFpQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7SUFzT25FLENBQUM7SUFwT0MsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFxQztRQUM3QyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRTtZQUN2QixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FDZixvRUFBb0U7a0JBQ2xFLEdBQUcsZUFBUSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxvQ0FBb0MsQ0FDM0UsQ0FBQztZQUVGLE9BQU8sQ0FBQyxDQUFDO1NBQ1Y7UUFFRCxJQUFJLGlCQUFpQixDQUFDO1FBQ3RCLElBQUk7WUFDRixpQkFBaUIsR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1NBQzdDO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDVixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFN0IsT0FBTyxDQUFDLENBQUM7U0FDVjtRQUVELElBQUksaUJBQWlCLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNqRiwwQ0FBMEM7WUFDMUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsa0RBQWtELENBQUMsQ0FBQztZQUVyRSxPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7U0FDckU7UUFFRCxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsY0FBYyxLQUFLLE1BQU0sQ0FBQztRQUVqRCxJQUFJLGlCQUFpQixDQUFDLElBQUksS0FBSyxLQUFLLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLEVBQUU7WUFDbEUsd0RBQXdEO1lBQ3hELG9FQUFvRTtZQUNwRSxJQUFJLGVBQWUsQ0FBQztZQUNwQixJQUFJO2dCQUNGLGVBQWUsR0FBRyxNQUFNLHVDQUFvQixDQUMxQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQ3RCLElBQUksQ0FBQyxNQUFNLEVBQ1gsRUFBRSxTQUFTLEVBQUUsQ0FDZCxDQUFDO2FBQ0g7WUFBQyxPQUFPLENBQUMsRUFBRTtnQkFDVixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxvQ0FBb0MsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBRXBFLE9BQU8sQ0FBQyxDQUFDO2FBQ1Y7WUFFRCxNQUFNLGNBQWMsR0FBRyxlQUFlLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3RELElBQUksY0FBYyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLGdCQUFnQixDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDL0UsSUFBSSxjQUFjLENBQUMsSUFBSSxLQUFLLGNBQWMsRUFBRTtvQkFDMUMsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMsa0JBQWtCLENBQUMsY0FBYyxDQUFDLENBQUM7b0JBQzlELGtDQUFrQztvQkFDbEMsTUFBTSxhQUFhLEdBQUcsRUFBRSxpQkFBaUIsRUFBRSxJQUFJLEVBQVMsQ0FBQztvQkFFekQsSUFBSSxPQUFPOzJCQUNKLENBQUMsQ0FBQyxtQkFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLG1CQUFVLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxhQUFhLENBQUMsQ0FBQzsrQkFDN0QsQ0FBQyxjQUFLLENBQUMsT0FBTyxDQUFDLElBQUksa0JBQVMsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFLGFBQWEsQ0FBQyxDQUFDLENBQUMsRUFBRTt3QkFDdEUsaUJBQWlCLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsTUFBTSxDQUFDLENBQUM7cUJBQ3pEO2lCQUNGO2FBQ0Y7aUJBQU0sSUFBSSxDQUFDLGNBQWMsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixDQUFDLGNBQWMsQ0FBQyxDQUFDLEVBQUU7Z0JBQzVFLGlFQUFpRTtnQkFDakUsTUFBTSxnQkFBZ0IsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUM7cUJBQ25FLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsbUJBQVUsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztnQkFFL0MsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsaUJBQVEsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFFdEUsSUFBSSxhQUFhLENBQUM7Z0JBQ2xCLEtBQUssTUFBTSxlQUFlLElBQUksZ0JBQWdCLEVBQUU7b0JBQzlDLElBQUksQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixDQUFDLGVBQWUsQ0FBQyxDQUFDLEVBQUU7d0JBQ3BELGFBQWEsR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLElBQUksRUFBRSxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7d0JBQzdFLE1BQU07cUJBQ1A7aUJBQ0Y7Z0JBRUQsSUFBSSxDQUFDLGFBQWEsRUFBRTtvQkFDbEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsdURBQXVELENBQUMsQ0FBQztpQkFDM0U7cUJBQU07b0JBQ0wsaUJBQWlCLEdBQUcsYUFBYSxDQUFDO2lCQUNuQzthQUNGO1NBQ0Y7UUFFRCxJQUFJLGNBQWMsR0FBRyxpQkFBaUIsQ0FBQyxJQUFJLENBQUM7UUFDNUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsRUFBRTtZQUMvQixJQUFJO2dCQUNGLE1BQU0sUUFBUSxHQUFHLE1BQU0sdUNBQW9CLENBQ3pDLGlCQUFpQixFQUNqQixJQUFJLENBQUMsTUFBTSxFQUNYLEVBQUUsU0FBUyxFQUFFLENBQ2QsQ0FBQztnQkFFRixjQUFjLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQztnQkFFL0IsSUFBSSxNQUFNLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsRUFBRTtvQkFDMUMsT0FBTyxDQUFDLElBQUksQ0FBQywwRUFBMEUsQ0FBQyxDQUFDO2lCQUMxRjthQUNGO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ1YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsb0NBQW9DLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUVwRSxPQUFPLENBQUMsQ0FBQzthQUNWO1NBQ0Y7UUFFRCxNQUFNLHFCQUFVLENBQ2QsaUJBQWlCLENBQUMsR0FBRyxFQUNyQixJQUFJLENBQUMsTUFBTSxFQUNYLElBQUksQ0FBQyxjQUFjLEVBQ25CLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUNwQixDQUFDO1FBRUYsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQzlELENBQUM7SUFFTyxrQkFBa0IsQ0FBQyxJQUFZO1FBQ3JDLElBQUk7WUFDRixjQUFPLENBQUMsSUFBSSxFQUFFO2dCQUNaLFVBQVUsRUFBRSxJQUFJO2dCQUNoQixPQUFPLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJO2dCQUM1QixrQkFBa0IsRUFBRSxJQUFJO2FBQ3pCLENBQUMsQ0FBQztZQUVILE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNWLElBQUksQ0FBQyxDQUFDLENBQUMsWUFBWSw4QkFBdUIsQ0FBQyxFQUFFO2dCQUMzQyxNQUFNLENBQUMsQ0FBQzthQUNUO1NBQ0Y7UUFFRCxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFFTyxLQUFLLENBQUMsZ0JBQWdCLENBQzVCLGNBQXNCLEVBQ3RCLFVBQW9CLEVBQUU7UUFFdEIsTUFBTSxVQUFVLEdBQUc7WUFDakIsZ0JBQWdCLEVBQUUsT0FBTztZQUN6QixVQUFVLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJO1lBQy9CLGNBQWM7WUFDZCxhQUFhLEVBQUUsUUFBUTtZQUN2QixZQUFZLEVBQUUsSUFBSTtZQUNsQixNQUFNLEVBQUUsS0FBSztZQUNiLEtBQUssRUFBRSxLQUFLO1NBQ2IsQ0FBQztRQUVGLElBQUk7WUFDRixPQUFPLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQztTQUM1QztRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1YsSUFBSSxDQUFDLFlBQVksMkNBQW1DLEVBQUU7Z0JBQ3BELElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFdBQUksQ0FBQyxPQUFPLENBQUE7OztTQUc3QixDQUFDLENBQUM7Z0JBRUgsT0FBTyxDQUFDLENBQUM7YUFDVjtZQUVELE1BQU0sQ0FBQyxDQUFDO1NBQ1Q7SUFDSCxDQUFDO0lBRU8sS0FBSyxDQUFDLGtCQUFrQixDQUFDLElBQVk7UUFDM0MsSUFBSSxnQkFBZ0IsQ0FBQztRQUNyQixJQUFJO1lBQ0YsZ0JBQWdCLEdBQUcsY0FBTyxDQUN4QixJQUFJLEVBQ0osRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxrQkFBa0IsRUFBRSxJQUFJLEVBQUUsQ0FDN0UsQ0FBQztTQUNIO1FBQUMsV0FBTSxHQUFHO1FBRVgsSUFBSSxnQkFBZ0IsRUFBRTtZQUNwQixJQUFJO2dCQUNGLE1BQU0sU0FBUyxHQUFHLE1BQU0sdUNBQW9CLENBQUMsY0FBTyxDQUFDLGdCQUFnQixDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUVyRixPQUFPLFNBQVMsQ0FBQyxPQUFPLENBQUM7YUFDMUI7WUFBQyxXQUFNLEdBQUU7U0FDWDtRQUVELElBQUksZUFBZSxDQUFDO1FBQ3BCLElBQUk7WUFDRixlQUFlLEdBQUcsTUFBTSx1Q0FBb0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDaEY7UUFBQyxXQUFNLEdBQUU7UUFFVixJQUFJLGVBQWUsRUFBRTtZQUNuQixNQUFNLE9BQU8sR0FBRyxlQUFlLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLGVBQWUsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDNUYsSUFBSSxPQUFPLEVBQUU7Z0JBQ1gsT0FBTyxPQUFPLENBQUM7YUFDaEI7U0FDRjtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVPLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxRQUF5QjtRQUN2RCxLQUFLLE1BQU0sSUFBSSxJQUFJLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRTtZQUM1QyxJQUFJLGNBQWMsQ0FBQztZQUNuQixJQUFJO2dCQUNGLGNBQWMsR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzthQUNyRTtZQUFDLFdBQU07Z0JBQ04sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsMkJBQTJCLElBQUksb0JBQW9CLENBQUMsQ0FBQztnQkFDdEUsU0FBUzthQUNWO1lBRUQsSUFBSSxjQUFjLENBQUMsSUFBSSxLQUFLLFNBQVMsSUFBSSxjQUFjLENBQUMsSUFBSSxLQUFLLE9BQU8sRUFBRTtnQkFDeEUsSUFBSTtvQkFDRixNQUFNLE9BQU8sR0FBRyxNQUFNLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDcEQsSUFBSSxDQUFDLE9BQU8sRUFBRTt3QkFDWixTQUFTO3FCQUNWO29CQUVELGtDQUFrQztvQkFDbEMsTUFBTSxPQUFPLEdBQUcsRUFBRSxpQkFBaUIsRUFBRSxJQUFJLEVBQVMsQ0FBQztvQkFFbkQsSUFBSSxDQUFDLG1CQUFVLENBQUMsT0FBTyxFQUFFLGNBQWMsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDOzJCQUNsRCxDQUFDLGtCQUFTLENBQUMsT0FBTyxFQUFFLGNBQWMsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLEVBQUU7d0JBQzNELE9BQU8sSUFBSSxDQUFDO3FCQUNiO2lCQUNGO2dCQUFDLFdBQU07b0JBQ04saUNBQWlDO29CQUNqQyxTQUFTO2lCQUNWO2FBQ0Y7aUJBQU07Z0JBQ0wsMkRBQTJEO2dCQUMzRCxxRkFBcUY7YUFDdEY7U0FFRjtRQUVELE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztDQUNGO0FBeE9ELGdDQXdPQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7IHRhZ3MsIHRlcm1pbmFsIH0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L2NvcmUnO1xuaW1wb3J0IHsgTW9kdWxlTm90Rm91bmRFeGNlcHRpb24sIHJlc29sdmUgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvY29yZS9ub2RlJztcbmltcG9ydCB7IE5vZGVQYWNrYWdlRG9lc05vdFN1cHBvcnRTY2hlbWF0aWNzIH0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L3NjaGVtYXRpY3MvdG9vbHMnO1xuaW1wb3J0IHsgZGlybmFtZSB9IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgaW50ZXJzZWN0cywgcHJlcmVsZWFzZSwgcmNvbXBhcmUsIHNhdGlzZmllcywgdmFsaWQsIHZhbGlkUmFuZ2UgfSBmcm9tICdzZW12ZXInO1xuaW1wb3J0IHsgQXJndW1lbnRzIH0gZnJvbSAnLi4vbW9kZWxzL2ludGVyZmFjZSc7XG5pbXBvcnQgeyBTY2hlbWF0aWNDb21tYW5kIH0gZnJvbSAnLi4vbW9kZWxzL3NjaGVtYXRpYy1jb21tYW5kJztcbmltcG9ydCBucG1JbnN0YWxsIGZyb20gJy4uL3Rhc2tzL25wbS1pbnN0YWxsJztcbmltcG9ydCB7IGdldFBhY2thZ2VNYW5hZ2VyIH0gZnJvbSAnLi4vdXRpbGl0aWVzL3BhY2thZ2UtbWFuYWdlcic7XG5pbXBvcnQge1xuICBQYWNrYWdlTWFuaWZlc3QsXG4gIGZldGNoUGFja2FnZU1hbmlmZXN0LFxuICBmZXRjaFBhY2thZ2VNZXRhZGF0YSxcbn0gZnJvbSAnLi4vdXRpbGl0aWVzL3BhY2thZ2UtbWV0YWRhdGEnO1xuaW1wb3J0IHsgU2NoZW1hIGFzIEFkZENvbW1hbmRTY2hlbWEgfSBmcm9tICcuL2FkZCc7XG5cbmNvbnN0IG5wYSA9IHJlcXVpcmUoJ25wbS1wYWNrYWdlLWFyZycpO1xuXG5leHBvcnQgY2xhc3MgQWRkQ29tbWFuZCBleHRlbmRzIFNjaGVtYXRpY0NvbW1hbmQ8QWRkQ29tbWFuZFNjaGVtYT4ge1xuICByZWFkb25seSBhbGxvd1ByaXZhdGVTY2hlbWF0aWNzID0gdHJ1ZTtcbiAgcmVhZG9ubHkgcGFja2FnZU1hbmFnZXIgPSBnZXRQYWNrYWdlTWFuYWdlcih0aGlzLndvcmtzcGFjZS5yb290KTtcblxuICBhc3luYyBydW4ob3B0aW9uczogQWRkQ29tbWFuZFNjaGVtYSAmIEFyZ3VtZW50cykge1xuICAgIGlmICghb3B0aW9ucy5jb2xsZWN0aW9uKSB7XG4gICAgICB0aGlzLmxvZ2dlci5mYXRhbChcbiAgICAgICAgYFRoZSBcIm5nIGFkZFwiIGNvbW1hbmQgcmVxdWlyZXMgYSBuYW1lIGFyZ3VtZW50IHRvIGJlIHNwZWNpZmllZCBlZy4gYFxuICAgICAgICArIGAke3Rlcm1pbmFsLnllbGxvdygnbmcgYWRkIFtuYW1lXSAnKX0uIEZvciBtb3JlIGRldGFpbHMsIHVzZSBcIm5nIGhlbHBcIi5gLFxuICAgICAgKTtcblxuICAgICAgcmV0dXJuIDE7XG4gICAgfVxuXG4gICAgbGV0IHBhY2thZ2VJZGVudGlmaWVyO1xuICAgIHRyeSB7XG4gICAgICBwYWNrYWdlSWRlbnRpZmllciA9IG5wYShvcHRpb25zLmNvbGxlY3Rpb24pO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRoaXMubG9nZ2VyLmVycm9yKGUubWVzc2FnZSk7XG5cbiAgICAgIHJldHVybiAxO1xuICAgIH1cblxuICAgIGlmIChwYWNrYWdlSWRlbnRpZmllci5yZWdpc3RyeSAmJiB0aGlzLmlzUGFja2FnZUluc3RhbGxlZChwYWNrYWdlSWRlbnRpZmllci5uYW1lKSkge1xuICAgICAgLy8gQWxyZWFkeSBpbnN0YWxsZWQgc28ganVzdCBydW4gc2NoZW1hdGljXG4gICAgICB0aGlzLmxvZ2dlci5pbmZvKCdTa2lwcGluZyBpbnN0YWxsYXRpb246IFBhY2thZ2UgYWxyZWFkeSBpbnN0YWxsZWQnKTtcblxuICAgICAgcmV0dXJuIHRoaXMuZXhlY3V0ZVNjaGVtYXRpYyhwYWNrYWdlSWRlbnRpZmllci5uYW1lLCBvcHRpb25zWyctLSddKTtcbiAgICB9XG5cbiAgICBjb25zdCB1c2luZ1lhcm4gPSB0aGlzLnBhY2thZ2VNYW5hZ2VyID09PSAneWFybic7XG5cbiAgICBpZiAocGFja2FnZUlkZW50aWZpZXIudHlwZSA9PT0gJ3RhZycgJiYgIXBhY2thZ2VJZGVudGlmaWVyLnJhd1NwZWMpIHtcbiAgICAgIC8vIG9ubHkgcGFja2FnZSBuYW1lIHByb3ZpZGVkOyBzZWFyY2ggZm9yIHZpYWJsZSB2ZXJzaW9uXG4gICAgICAvLyBwbHVzIHNwZWNpYWwgY2FzZXMgZm9yIHBhY2thZ2VzIHRoYXQgZGlkIG5vdCBoYXZlIHBlZXIgZGVwcyBzZXR1cFxuICAgICAgbGV0IHBhY2thZ2VNZXRhZGF0YTtcbiAgICAgIHRyeSB7XG4gICAgICAgIHBhY2thZ2VNZXRhZGF0YSA9IGF3YWl0IGZldGNoUGFja2FnZU1ldGFkYXRhKFxuICAgICAgICAgIHBhY2thZ2VJZGVudGlmaWVyLm5hbWUsXG4gICAgICAgICAgdGhpcy5sb2dnZXIsXG4gICAgICAgICAgeyB1c2luZ1lhcm4gfSxcbiAgICAgICAgKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ1VuYWJsZSB0byBmZXRjaCBwYWNrYWdlIG1ldGFkYXRhOiAnICsgZS5tZXNzYWdlKTtcblxuICAgICAgICByZXR1cm4gMTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgbGF0ZXN0TWFuaWZlc3QgPSBwYWNrYWdlTWV0YWRhdGEudGFnc1snbGF0ZXN0J107XG4gICAgICBpZiAobGF0ZXN0TWFuaWZlc3QgJiYgT2JqZWN0LmtleXMobGF0ZXN0TWFuaWZlc3QucGVlckRlcGVuZGVuY2llcykubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIGlmIChsYXRlc3RNYW5pZmVzdC5uYW1lID09PSAnQGFuZ3VsYXIvcHdhJykge1xuICAgICAgICAgIGNvbnN0IHZlcnNpb24gPSBhd2FpdCB0aGlzLmZpbmRQcm9qZWN0VmVyc2lvbignQGFuZ3VsYXIvY2xpJyk7XG4gICAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWFueVxuICAgICAgICAgIGNvbnN0IHNlbXZlck9wdGlvbnMgPSB7IGluY2x1ZGVQcmVyZWxlYXNlOiB0cnVlIH0gYXMgYW55O1xuXG4gICAgICAgICAgaWYgKHZlcnNpb25cbiAgICAgICAgICAgICAgJiYgKCh2YWxpZFJhbmdlKHZlcnNpb24pICYmIGludGVyc2VjdHModmVyc2lvbiwgJzcnLCBzZW12ZXJPcHRpb25zKSlcbiAgICAgICAgICAgICAgICAgIHx8ICh2YWxpZCh2ZXJzaW9uKSAmJiBzYXRpc2ZpZXModmVyc2lvbiwgJzcnLCBzZW12ZXJPcHRpb25zKSkpKSB7XG4gICAgICAgICAgICBwYWNrYWdlSWRlbnRpZmllciA9IG5wYS5yZXNvbHZlKCdAYW5ndWxhci9wd2EnLCAnMC4xMicpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICghbGF0ZXN0TWFuaWZlc3QgfHwgKGF3YWl0IHRoaXMuaGFzTWlzbWF0Y2hlZFBlZXIobGF0ZXN0TWFuaWZlc3QpKSkge1xuICAgICAgICAvLyAnbGF0ZXN0JyBpcyBpbnZhbGlkIHNvIHNlYXJjaCBmb3IgbW9zdCByZWNlbnQgbWF0Y2hpbmcgcGFja2FnZVxuICAgICAgICBjb25zdCB2ZXJzaW9uTWFuaWZlc3RzID0gQXJyYXkuZnJvbShwYWNrYWdlTWV0YWRhdGEudmVyc2lvbnMudmFsdWVzKCkpXG4gICAgICAgICAgLmZpbHRlcih2YWx1ZSA9PiAhcHJlcmVsZWFzZSh2YWx1ZS52ZXJzaW9uKSk7XG5cbiAgICAgICAgdmVyc2lvbk1hbmlmZXN0cy5zb3J0KChhLCBiKSA9PiByY29tcGFyZShhLnZlcnNpb24sIGIudmVyc2lvbiwgdHJ1ZSkpO1xuXG4gICAgICAgIGxldCBuZXdJZGVudGlmaWVyO1xuICAgICAgICBmb3IgKGNvbnN0IHZlcnNpb25NYW5pZmVzdCBvZiB2ZXJzaW9uTWFuaWZlc3RzKSB7XG4gICAgICAgICAgaWYgKCEoYXdhaXQgdGhpcy5oYXNNaXNtYXRjaGVkUGVlcih2ZXJzaW9uTWFuaWZlc3QpKSkge1xuICAgICAgICAgICAgbmV3SWRlbnRpZmllciA9IG5wYS5yZXNvbHZlKHBhY2thZ2VJZGVudGlmaWVyLm5hbWUsIHZlcnNpb25NYW5pZmVzdC52ZXJzaW9uKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghbmV3SWRlbnRpZmllcikge1xuICAgICAgICAgIHRoaXMubG9nZ2VyLndhcm4oJ1VuYWJsZSB0byBmaW5kIGNvbXBhdGlibGUgcGFja2FnZS4gIFVzaW5nIFxcJ2xhdGVzdFxcJy4nKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwYWNrYWdlSWRlbnRpZmllciA9IG5ld0lkZW50aWZpZXI7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgY29sbGVjdGlvbk5hbWUgPSBwYWNrYWdlSWRlbnRpZmllci5uYW1lO1xuICAgIGlmICghcGFja2FnZUlkZW50aWZpZXIucmVnaXN0cnkpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IG1hbmlmZXN0ID0gYXdhaXQgZmV0Y2hQYWNrYWdlTWFuaWZlc3QoXG4gICAgICAgICAgcGFja2FnZUlkZW50aWZpZXIsXG4gICAgICAgICAgdGhpcy5sb2dnZXIsXG4gICAgICAgICAgeyB1c2luZ1lhcm4gfSxcbiAgICAgICAgKTtcblxuICAgICAgICBjb2xsZWN0aW9uTmFtZSA9IG1hbmlmZXN0Lm5hbWU7XG5cbiAgICAgICAgaWYgKGF3YWl0IHRoaXMuaGFzTWlzbWF0Y2hlZFBlZXIobWFuaWZlc3QpKSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKCdQYWNrYWdlIGhhcyB1bm1ldCBwZWVyIGRlcGVuZGVuY2llcy4gQWRkaW5nIHRoZSBwYWNrYWdlIG1heSBub3Qgc3VjY2VlZC4nKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcignVW5hYmxlIHRvIGZldGNoIHBhY2thZ2UgbWFuaWZlc3Q6ICcgKyBlLm1lc3NhZ2UpO1xuXG4gICAgICAgIHJldHVybiAxO1xuICAgICAgfVxuICAgIH1cblxuICAgIGF3YWl0IG5wbUluc3RhbGwoXG4gICAgICBwYWNrYWdlSWRlbnRpZmllci5yYXcsXG4gICAgICB0aGlzLmxvZ2dlcixcbiAgICAgIHRoaXMucGFja2FnZU1hbmFnZXIsXG4gICAgICB0aGlzLndvcmtzcGFjZS5yb290LFxuICAgICk7XG5cbiAgICByZXR1cm4gdGhpcy5leGVjdXRlU2NoZW1hdGljKGNvbGxlY3Rpb25OYW1lLCBvcHRpb25zWyctLSddKTtcbiAgfVxuXG4gIHByaXZhdGUgaXNQYWNrYWdlSW5zdGFsbGVkKG5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHRyeSB7XG4gICAgICByZXNvbHZlKG5hbWUsIHtcbiAgICAgICAgY2hlY2tMb2NhbDogdHJ1ZSxcbiAgICAgICAgYmFzZWRpcjogdGhpcy53b3Jrc3BhY2Uucm9vdCxcbiAgICAgICAgcmVzb2x2ZVBhY2thZ2VKc29uOiB0cnVlLFxuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmICghKGUgaW5zdGFuY2VvZiBNb2R1bGVOb3RGb3VuZEV4Y2VwdGlvbikpIHtcbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGV4ZWN1dGVTY2hlbWF0aWMoXG4gICAgY29sbGVjdGlvbk5hbWU6IHN0cmluZyxcbiAgICBvcHRpb25zOiBzdHJpbmdbXSA9IFtdLFxuICApOiBQcm9taXNlPG51bWJlciB8IHZvaWQ+IHtcbiAgICBjb25zdCBydW5PcHRpb25zID0ge1xuICAgICAgc2NoZW1hdGljT3B0aW9uczogb3B0aW9ucyxcbiAgICAgIHdvcmtpbmdEaXI6IHRoaXMud29ya3NwYWNlLnJvb3QsXG4gICAgICBjb2xsZWN0aW9uTmFtZSxcbiAgICAgIHNjaGVtYXRpY05hbWU6ICduZy1hZGQnLFxuICAgICAgYWxsb3dQcml2YXRlOiB0cnVlLFxuICAgICAgZHJ5UnVuOiBmYWxzZSxcbiAgICAgIGZvcmNlOiBmYWxzZSxcbiAgICB9O1xuXG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBhd2FpdCB0aGlzLnJ1blNjaGVtYXRpYyhydW5PcHRpb25zKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBpZiAoZSBpbnN0YW5jZW9mIE5vZGVQYWNrYWdlRG9lc05vdFN1cHBvcnRTY2hlbWF0aWNzKSB7XG4gICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKHRhZ3Mub25lTGluZWBcbiAgICAgICAgICBUaGUgcGFja2FnZSB0aGF0IHlvdSBhcmUgdHJ5aW5nIHRvIGFkZCBkb2VzIG5vdCBzdXBwb3J0IHNjaGVtYXRpY3MuIFlvdSBjYW4gdHJ5IHVzaW5nXG4gICAgICAgICAgYSBkaWZmZXJlbnQgdmVyc2lvbiBvZiB0aGUgcGFja2FnZSBvciBjb250YWN0IHRoZSBwYWNrYWdlIGF1dGhvciB0byBhZGQgbmctYWRkIHN1cHBvcnQuXG4gICAgICAgIGApO1xuXG4gICAgICAgIHJldHVybiAxO1xuICAgICAgfVxuXG4gICAgICB0aHJvdyBlO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgZmluZFByb2plY3RWZXJzaW9uKG5hbWU6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nIHwgbnVsbD4ge1xuICAgIGxldCBpbnN0YWxsZWRQYWNrYWdlO1xuICAgIHRyeSB7XG4gICAgICBpbnN0YWxsZWRQYWNrYWdlID0gcmVzb2x2ZShcbiAgICAgICAgbmFtZSxcbiAgICAgICAgeyBjaGVja0xvY2FsOiB0cnVlLCBiYXNlZGlyOiB0aGlzLndvcmtzcGFjZS5yb290LCByZXNvbHZlUGFja2FnZUpzb246IHRydWUgfSxcbiAgICAgICk7XG4gICAgfSBjYXRjaCB7IH1cblxuICAgIGlmIChpbnN0YWxsZWRQYWNrYWdlKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBpbnN0YWxsZWQgPSBhd2FpdCBmZXRjaFBhY2thZ2VNYW5pZmVzdChkaXJuYW1lKGluc3RhbGxlZFBhY2thZ2UpLCB0aGlzLmxvZ2dlcik7XG5cbiAgICAgICAgcmV0dXJuIGluc3RhbGxlZC52ZXJzaW9uO1xuICAgICAgfSBjYXRjaCB7fVxuICAgIH1cblxuICAgIGxldCBwcm9qZWN0TWFuaWZlc3Q7XG4gICAgdHJ5IHtcbiAgICAgIHByb2plY3RNYW5pZmVzdCA9IGF3YWl0IGZldGNoUGFja2FnZU1hbmlmZXN0KHRoaXMud29ya3NwYWNlLnJvb3QsIHRoaXMubG9nZ2VyKTtcbiAgICB9IGNhdGNoIHt9XG5cbiAgICBpZiAocHJvamVjdE1hbmlmZXN0KSB7XG4gICAgICBjb25zdCB2ZXJzaW9uID0gcHJvamVjdE1hbmlmZXN0LmRlcGVuZGVuY2llc1tuYW1lXSB8fCBwcm9qZWN0TWFuaWZlc3QuZGV2RGVwZW5kZW5jaWVzW25hbWVdO1xuICAgICAgaWYgKHZlcnNpb24pIHtcbiAgICAgICAgcmV0dXJuIHZlcnNpb247XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGhhc01pc21hdGNoZWRQZWVyKG1hbmlmZXN0OiBQYWNrYWdlTWFuaWZlc3QpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBmb3IgKGNvbnN0IHBlZXIgaW4gbWFuaWZlc3QucGVlckRlcGVuZGVuY2llcykge1xuICAgICAgbGV0IHBlZXJJZGVudGlmaWVyO1xuICAgICAgdHJ5IHtcbiAgICAgICAgcGVlcklkZW50aWZpZXIgPSBucGEucmVzb2x2ZShwZWVyLCBtYW5pZmVzdC5wZWVyRGVwZW5kZW5jaWVzW3BlZXJdKTtcbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICB0aGlzLmxvZ2dlci53YXJuKGBJbnZhbGlkIHBlZXIgZGVwZW5kZW5jeSAke3BlZXJ9IGZvdW5kIGluIHBhY2thZ2UuYCk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAocGVlcklkZW50aWZpZXIudHlwZSA9PT0gJ3ZlcnNpb24nIHx8IHBlZXJJZGVudGlmaWVyLnR5cGUgPT09ICdyYW5nZScpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCB2ZXJzaW9uID0gYXdhaXQgdGhpcy5maW5kUHJvamVjdFZlcnNpb24ocGVlcik7XG4gICAgICAgICAgaWYgKCF2ZXJzaW9uKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYW55XG4gICAgICAgICAgY29uc3Qgb3B0aW9ucyA9IHsgaW5jbHVkZVByZXJlbGVhc2U6IHRydWUgfSBhcyBhbnk7XG5cbiAgICAgICAgICBpZiAoIWludGVyc2VjdHModmVyc2lvbiwgcGVlcklkZW50aWZpZXIucmF3U3BlYywgb3B0aW9ucylcbiAgICAgICAgICAgICAgJiYgIXNhdGlzZmllcyh2ZXJzaW9uLCBwZWVySWRlbnRpZmllci5yYXdTcGVjLCBvcHRpb25zKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAvLyBOb3QgZm91bmQgb3IgaW52YWxpZCBzbyBpZ25vcmVcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gdHlwZSA9PT0gJ3RhZycgfCAnZmlsZScgfCAnZGlyZWN0b3J5JyB8ICdyZW1vdGUnIHwgJ2dpdCdcbiAgICAgICAgLy8gQ2Fubm90IGFjY3VyYXRlbHkgY29tcGFyZSB0aGVzZSBhcyB0aGUgdGFnL2xvY2F0aW9uIG1heSBoYXZlIGNoYW5nZWQgc2luY2UgaW5zdGFsbFxuICAgICAgfVxuXG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG4iXX0=