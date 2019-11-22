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
const schematics_1 = require("@angular-devkit/schematics");
const tasks_1 = require("@angular-devkit/schematics/tasks");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const semver = require("semver");
const npm_1 = require("./npm");
// Angular guarantees that a major is compatible with its following major (so packages that depend
// on Angular 5 are also compatible with Angular 6). This is, in code, represented by verifying
// that all other packages that have a peer dependency of `"@angular/core": "^5.0.0"` actually
// supports 6.0, by adding that compatibility to the range, so it is `^5.0.0 || ^6.0.0`.
// We export it to allow for testing.
function angularMajorCompatGuarantee(range) {
    let newRange = semver.validRange(range);
    if (!newRange) {
        return range;
    }
    let major = 1;
    while (!semver.gtr(major + '.0.0', newRange)) {
        major++;
        if (major >= 99) {
            // Use original range if it supports a major this high
            // Range is most likely unbounded (e.g., >=5.0.0)
            return newRange;
        }
    }
    // Add the major version as compatible with the angular compatible, with all minors. This is
    // already one major above the greatest supported, because we increment `major` before checking.
    // We add minors like this because a minor beta is still compatible with a minor non-beta.
    newRange = range;
    for (let minor = 0; minor < 20; minor++) {
        newRange += ` || ^${major}.${minor}.0-alpha.0 `;
    }
    return semver.validRange(newRange) || range;
}
exports.angularMajorCompatGuarantee = angularMajorCompatGuarantee;
// This is a map of packageGroupName to range extending function. If it isn't found, the range is
// kept the same.
const peerCompatibleWhitelist = {
    '@angular/core': angularMajorCompatGuarantee,
};
function _updatePeerVersion(infoMap, name, range) {
    // Resolve packageGroupName.
    const maybePackageInfo = infoMap.get(name);
    if (!maybePackageInfo) {
        return range;
    }
    if (maybePackageInfo.target) {
        name = maybePackageInfo.target.updateMetadata.packageGroupName || name;
    }
    else {
        name = maybePackageInfo.installed.updateMetadata.packageGroupName || name;
    }
    const maybeTransform = peerCompatibleWhitelist[name];
    if (maybeTransform) {
        if (typeof maybeTransform == 'function') {
            return maybeTransform(range);
        }
        else {
            return maybeTransform;
        }
    }
    return range;
}
function _validateForwardPeerDependencies(name, infoMap, peers, logger) {
    for (const [peer, range] of Object.entries(peers)) {
        logger.debug(`Checking forward peer ${peer}...`);
        const maybePeerInfo = infoMap.get(peer);
        if (!maybePeerInfo) {
            logger.error([
                `Package ${JSON.stringify(name)} has a missing peer dependency of`,
                `${JSON.stringify(peer)} @ ${JSON.stringify(range)}.`,
            ].join(' '));
            return true;
        }
        const peerVersion = maybePeerInfo.target && maybePeerInfo.target.packageJson.version
            ? maybePeerInfo.target.packageJson.version
            : maybePeerInfo.installed.version;
        logger.debug(`  Range intersects(${range}, ${peerVersion})...`);
        if (!semver.satisfies(peerVersion, range)) {
            logger.error([
                `Package ${JSON.stringify(name)} has an incompatible peer dependency to`,
                `${JSON.stringify(peer)} (requires ${JSON.stringify(range)},`,
                `would install ${JSON.stringify(peerVersion)})`,
            ].join(' '));
            return true;
        }
    }
    return false;
}
function _validateReversePeerDependencies(name, version, infoMap, logger) {
    for (const [installed, installedInfo] of infoMap.entries()) {
        const installedLogger = logger.createChild(installed);
        installedLogger.debug(`${installed}...`);
        const peers = (installedInfo.target || installedInfo.installed).packageJson.peerDependencies;
        for (const [peer, range] of Object.entries(peers || {})) {
            if (peer != name) {
                // Only check peers to the packages we're updating. We don't care about peers
                // that are unmet but we have no effect on.
                continue;
            }
            // Override the peer version range if it's whitelisted.
            const extendedRange = _updatePeerVersion(infoMap, peer, range);
            if (!semver.satisfies(version, extendedRange)) {
                logger.error([
                    `Package ${JSON.stringify(installed)} has an incompatible peer dependency to`,
                    `${JSON.stringify(name)} (requires`,
                    `${JSON.stringify(range)}${extendedRange == range ? '' : ' (extended)'},`,
                    `would install ${JSON.stringify(version)}).`,
                ].join(' '));
                return true;
            }
        }
    }
    return false;
}
function _validateUpdatePackages(infoMap, force, logger) {
    logger.debug('Updating the following packages:');
    infoMap.forEach(info => {
        if (info.target) {
            logger.debug(`  ${info.name} => ${info.target.version}`);
        }
    });
    let peerErrors = false;
    infoMap.forEach(info => {
        const { name, target } = info;
        if (!target) {
            return;
        }
        const pkgLogger = logger.createChild(name);
        logger.debug(`${name}...`);
        const peers = target.packageJson.peerDependencies || {};
        peerErrors = _validateForwardPeerDependencies(name, infoMap, peers, pkgLogger) || peerErrors;
        peerErrors
            = _validateReversePeerDependencies(name, target.version, infoMap, pkgLogger)
                || peerErrors;
    });
    if (!force && peerErrors) {
        throw new schematics_1.SchematicsException(`Incompatible peer dependencies found. See above.`);
    }
}
function _performUpdate(tree, context, infoMap, logger, migrateOnly) {
    const packageJsonContent = tree.read('/package.json');
    if (!packageJsonContent) {
        throw new schematics_1.SchematicsException('Could not find a package.json. Are you in a Node project?');
    }
    let packageJson;
    try {
        packageJson = JSON.parse(packageJsonContent.toString());
    }
    catch (e) {
        throw new schematics_1.SchematicsException('package.json could not be parsed: ' + e.message);
    }
    const updateDependency = (deps, name, newVersion) => {
        const oldVersion = deps[name];
        // We only respect caret and tilde ranges on update.
        const execResult = /^[\^~]/.exec(oldVersion);
        deps[name] = `${execResult ? execResult[0] : ''}${newVersion}`;
    };
    const toInstall = [...infoMap.values()]
        .map(x => [x.name, x.target, x.installed])
        // tslint:disable-next-line:no-non-null-assertion
        .filter(([name, target, installed]) => {
        return !!name && !!target && !!installed;
    });
    toInstall.forEach(([name, target, installed]) => {
        logger.info(`Updating package.json with dependency ${name} `
            + `@ ${JSON.stringify(target.version)} (was ${JSON.stringify(installed.version)})...`);
        if (packageJson.dependencies && packageJson.dependencies[name]) {
            updateDependency(packageJson.dependencies, name, target.version);
            if (packageJson.devDependencies && packageJson.devDependencies[name]) {
                delete packageJson.devDependencies[name];
            }
            if (packageJson.peerDependencies && packageJson.peerDependencies[name]) {
                delete packageJson.peerDependencies[name];
            }
        }
        else if (packageJson.devDependencies && packageJson.devDependencies[name]) {
            updateDependency(packageJson.devDependencies, name, target.version);
            if (packageJson.peerDependencies && packageJson.peerDependencies[name]) {
                delete packageJson.peerDependencies[name];
            }
        }
        else if (packageJson.peerDependencies && packageJson.peerDependencies[name]) {
            updateDependency(packageJson.peerDependencies, name, target.version);
        }
        else {
            logger.warn(`Package ${name} was not found in dependencies.`);
        }
    });
    const newContent = JSON.stringify(packageJson, null, 2);
    if (packageJsonContent.toString() != newContent || migrateOnly) {
        let installTask = [];
        if (!migrateOnly) {
            // If something changed, also hook up the task.
            tree.overwrite('/package.json', JSON.stringify(packageJson, null, 2));
            installTask = [context.addTask(new tasks_1.NodePackageInstallTask())];
        }
        // Run the migrate schematics with the list of packages to use. The collection contains
        // version information and we need to do this post installation. Please note that the
        // migration COULD fail and leave side effects on disk.
        // Run the schematics task of those packages.
        toInstall.forEach(([name, target, installed]) => {
            if (!target.updateMetadata.migrations) {
                return;
            }
            const collection = (target.updateMetadata.migrations.match(/^[./]/)
                ? name + '/'
                : '') + target.updateMetadata.migrations;
            context.addTask(new tasks_1.RunSchematicTask('@schematics/update', 'migrate', {
                package: name,
                collection,
                from: installed.version,
                to: target.version,
            }), installTask);
        });
    }
    return rxjs_1.of(undefined);
}
function _migrateOnly(info, context, from, to) {
    if (!info) {
        return rxjs_1.of();
    }
    const target = info.installed;
    if (!target || !target.updateMetadata.migrations) {
        return rxjs_1.of(undefined);
    }
    const collection = (target.updateMetadata.migrations.match(/^[./]/)
        ? info.name + '/'
        : '') + target.updateMetadata.migrations;
    context.addTask(new tasks_1.RunSchematicTask('@schematics/update', 'migrate', {
        package: info.name,
        collection,
        from: from,
        to: to || target.version,
    }));
    return rxjs_1.of(undefined);
}
function _getUpdateMetadata(packageJson, logger) {
    const metadata = packageJson['ng-update'];
    const result = {
        packageGroup: {},
        requirements: {},
    };
    if (!metadata || typeof metadata != 'object' || Array.isArray(metadata)) {
        return result;
    }
    if (metadata['packageGroup']) {
        const packageGroup = metadata['packageGroup'];
        // Verify that packageGroup is an array of strings or an map of versions. This is not an error
        // but we still warn the user and ignore the packageGroup keys.
        if (Array.isArray(packageGroup) && packageGroup.every(x => typeof x == 'string')) {
            result.packageGroup = packageGroup.reduce((group, name) => {
                group[name] = packageJson.version;
                return group;
            }, result.packageGroup);
        }
        else if (typeof packageGroup == 'object' && packageGroup
            && Object.values(packageGroup).every(x => typeof x == 'string')) {
            result.packageGroup = packageGroup;
        }
        else {
            logger.warn(`packageGroup metadata of package ${packageJson.name} is malformed. Ignoring.`);
        }
        result.packageGroupName = Object.keys(result.packageGroup)[0];
    }
    if (typeof metadata['packageGroupName'] == 'string') {
        result.packageGroupName = metadata['packageGroupName'];
    }
    if (metadata['requirements']) {
        const requirements = metadata['requirements'];
        // Verify that requirements are
        if (typeof requirements != 'object'
            || Array.isArray(requirements)
            || Object.keys(requirements).some(name => typeof requirements[name] != 'string')) {
            logger.warn(`requirements metadata of package ${packageJson.name} is malformed. Ignoring.`);
        }
        else {
            result.requirements = requirements;
        }
    }
    if (metadata['migrations']) {
        const migrations = metadata['migrations'];
        if (typeof migrations != 'string') {
            logger.warn(`migrations metadata of package ${packageJson.name} is malformed. Ignoring.`);
        }
        else {
            result.migrations = migrations;
        }
    }
    return result;
}
function _usageMessage(options, infoMap, logger) {
    const packageGroups = new Map();
    const packagesToUpdate = [...infoMap.entries()]
        .map(([name, info]) => {
        const tag = options.next
            ? (info.npmPackageJson['dist-tags']['next'] ? 'next' : 'latest') : 'latest';
        const version = info.npmPackageJson['dist-tags'][tag];
        const target = info.npmPackageJson.versions[version];
        return {
            name,
            info,
            version,
            tag,
            target,
        };
    })
        .filter(({ name, info, version, target }) => {
        return (target && semver.compare(info.installed.version, version) < 0);
    })
        .filter(({ target }) => {
        return target['ng-update'];
    })
        .map(({ name, info, version, tag, target }) => {
        // Look for packageGroup.
        if (target['ng-update'] && target['ng-update']['packageGroup']) {
            const packageGroup = target['ng-update']['packageGroup'];
            const packageGroupName = target['ng-update']['packageGroupName']
                || target['ng-update']['packageGroup'][0];
            if (packageGroupName) {
                if (packageGroups.has(name)) {
                    return null;
                }
                packageGroup.forEach((x) => packageGroups.set(x, packageGroupName));
                packageGroups.set(packageGroupName, packageGroupName);
                name = packageGroupName;
            }
        }
        let command = `ng update ${name}`;
        if (tag == 'next') {
            command += ' --next';
        }
        return [name, `${info.installed.version} -> ${version}`, command];
    })
        .filter(x => x !== null)
        .sort((a, b) => a && b ? a[0].localeCompare(b[0]) : 0);
    if (packagesToUpdate.length == 0) {
        logger.info('We analyzed your package.json and everything seems to be in order. Good work!');
        return rxjs_1.of(undefined);
    }
    logger.info('We analyzed your package.json, there are some packages to update:\n');
    // Find the largest name to know the padding needed.
    let namePad = Math.max(...[...infoMap.keys()].map(x => x.length)) + 2;
    if (!Number.isFinite(namePad)) {
        namePad = 30;
    }
    const pads = [namePad, 25, 0];
    logger.info('  '
        + ['Name', 'Version', 'Command to update'].map((x, i) => x.padEnd(pads[i])).join(''));
    logger.info(' ' + '-'.repeat(pads.reduce((s, x) => s += x, 0) + 20));
    packagesToUpdate.forEach(fields => {
        if (!fields) {
            return;
        }
        logger.info('  ' + fields.map((x, i) => x.padEnd(pads[i])).join(''));
    });
    logger.info('\n');
    logger.info('There might be additional packages that are outdated.');
    logger.info('Run "ng update --all" to try to update all at the same time.\n');
    return rxjs_1.of(undefined);
}
function _buildPackageInfo(tree, packages, allDependencies, npmPackageJson, logger) {
    const name = npmPackageJson.name;
    const packageJsonRange = allDependencies.get(name);
    if (!packageJsonRange) {
        throw new schematics_1.SchematicsException(`Package ${JSON.stringify(name)} was not found in package.json.`);
    }
    // Find out the currently installed version. Either from the package.json or the node_modules/
    // TODO: figure out a way to read package-lock.json and/or yarn.lock.
    let installedVersion;
    const packageContent = tree.read(`/node_modules/${name}/package.json`);
    if (packageContent) {
        const content = JSON.parse(packageContent.toString());
        installedVersion = content.version;
    }
    if (!installedVersion) {
        // Find the version from NPM that fits the range to max.
        installedVersion = semver.maxSatisfying(Object.keys(npmPackageJson.versions), packageJsonRange);
    }
    const installedPackageJson = npmPackageJson.versions[installedVersion] || packageContent;
    if (!installedPackageJson) {
        throw new schematics_1.SchematicsException(`An unexpected error happened; package ${name} has no version ${installedVersion}.`);
    }
    let targetVersion = packages.get(name);
    if (targetVersion) {
        if (npmPackageJson['dist-tags'][targetVersion]) {
            targetVersion = npmPackageJson['dist-tags'][targetVersion];
        }
        else if (targetVersion == 'next') {
            targetVersion = npmPackageJson['dist-tags']['latest'];
        }
        else {
            targetVersion = semver.maxSatisfying(Object.keys(npmPackageJson.versions), targetVersion);
        }
    }
    if (targetVersion && semver.lte(targetVersion, installedVersion)) {
        logger.debug(`Package ${name} already satisfied by package.json (${packageJsonRange}).`);
        targetVersion = undefined;
    }
    const target = targetVersion
        ? {
            version: targetVersion,
            packageJson: npmPackageJson.versions[targetVersion],
            updateMetadata: _getUpdateMetadata(npmPackageJson.versions[targetVersion], logger),
        }
        : undefined;
    // Check if there's an installed version.
    return {
        name,
        npmPackageJson,
        installed: {
            version: installedVersion,
            packageJson: installedPackageJson,
            updateMetadata: _getUpdateMetadata(installedPackageJson, logger),
        },
        target,
        packageJsonRange,
    };
}
function _buildPackageList(options, projectDeps, logger) {
    // Parse the packages options to set the targeted version.
    const packages = new Map();
    const commandLinePackages = (options.packages && options.packages.length > 0)
        ? options.packages
        : (options.all ? projectDeps.keys() : []);
    for (const pkg of commandLinePackages) {
        // Split the version asked on command line.
        const m = pkg.match(/^((?:@[^/]{1,100}\/)?[^@]{1,100})(?:@(.{1,100}))?$/);
        if (!m) {
            logger.warn(`Invalid package argument: ${JSON.stringify(pkg)}. Skipping.`);
            continue;
        }
        const [, npmName, maybeVersion] = m;
        const version = projectDeps.get(npmName);
        if (!version) {
            logger.warn(`Package not installed: ${JSON.stringify(npmName)}. Skipping.`);
            continue;
        }
        // Verify that people have an actual version in the package.json, otherwise (label or URL or
        // gist or ...) we don't update it.
        if (version.startsWith('http:') // HTTP
            || version.startsWith('file:') // Local folder
            || version.startsWith('git:') // GIT url
            || version.match(/^\w{1,100}\/\w{1,100}/) // GitHub's "user/repo"
            || version.match(/^(?:\.{0,2}\/)\w{1,100}/) // Local folder, maybe relative.
        ) {
            // We only do that for --all. Otherwise we have the installed version and the user specified
            // it on the command line.
            if (options.all) {
                logger.warn(`Package ${JSON.stringify(npmName)} has a custom version: `
                    + `${JSON.stringify(version)}. Skipping.`);
                continue;
            }
        }
        packages.set(npmName, (maybeVersion || (options.next ? 'next' : 'latest')));
    }
    return packages;
}
function _addPackageGroup(tree, packages, allDependencies, npmPackageJson, logger) {
    const maybePackage = packages.get(npmPackageJson.name);
    if (!maybePackage) {
        return;
    }
    const info = _buildPackageInfo(tree, packages, allDependencies, npmPackageJson, logger);
    const version = (info.target && info.target.version)
        || npmPackageJson['dist-tags'][maybePackage]
        || maybePackage;
    if (!npmPackageJson.versions[version]) {
        return;
    }
    const ngUpdateMetadata = npmPackageJson.versions[version]['ng-update'];
    if (!ngUpdateMetadata) {
        return;
    }
    let packageGroup = ngUpdateMetadata['packageGroup'];
    if (!packageGroup) {
        return;
    }
    if (Array.isArray(packageGroup) && !packageGroup.some(x => typeof x != 'string')) {
        packageGroup = packageGroup.reduce((acc, curr) => {
            acc[curr] = maybePackage;
            return acc;
        }, {});
    }
    // Only need to check if it's an object because we set it right the time before.
    if (typeof packageGroup != 'object'
        || packageGroup === null
        || Object.values(packageGroup).some(v => typeof v != 'string')) {
        logger.warn(`packageGroup metadata of package ${npmPackageJson.name} is malformed.`);
        return;
    }
    Object.keys(packageGroup)
        .filter(name => !packages.has(name)) // Don't override names from the command line.
        .filter(name => allDependencies.has(name)) // Remove packages that aren't installed.
        .forEach(name => {
        packages.set(name, packageGroup[name]);
    });
}
/**
 * Add peer dependencies of packages on the command line to the list of packages to update.
 * We don't do verification of the versions here as this will be done by a later step (and can
 * be ignored by the --force flag).
 * @private
 */
function _addPeerDependencies(tree, packages, allDependencies, npmPackageJson, logger) {
    const maybePackage = packages.get(npmPackageJson.name);
    if (!maybePackage) {
        return;
    }
    const info = _buildPackageInfo(tree, packages, allDependencies, npmPackageJson, logger);
    const version = (info.target && info.target.version)
        || npmPackageJson['dist-tags'][maybePackage]
        || maybePackage;
    if (!npmPackageJson.versions[version]) {
        return;
    }
    const packageJson = npmPackageJson.versions[version];
    const error = false;
    for (const [peer, range] of Object.entries(packageJson.peerDependencies || {})) {
        if (!packages.has(peer)) {
            packages.set(peer, range);
        }
    }
    if (error) {
        throw new schematics_1.SchematicsException('An error occured, see above.');
    }
}
function _getAllDependencies(tree) {
    const packageJsonContent = tree.read('/package.json');
    if (!packageJsonContent) {
        throw new schematics_1.SchematicsException('Could not find a package.json. Are you in a Node project?');
    }
    let packageJson;
    try {
        packageJson = JSON.parse(packageJsonContent.toString());
    }
    catch (e) {
        throw new schematics_1.SchematicsException('package.json could not be parsed: ' + e.message);
    }
    return new Map([
        ...Object.entries(packageJson.peerDependencies || {}),
        ...Object.entries(packageJson.devDependencies || {}),
        ...Object.entries(packageJson.dependencies || {}),
    ]);
}
function _formatVersion(version) {
    if (version === undefined) {
        return undefined;
    }
    if (!version.match(/^\d{1,30}\.\d{1,30}\.\d{1,30}/)) {
        version += '.0';
    }
    if (!version.match(/^\d{1,30}\.\d{1,30}\.\d{1,30}/)) {
        version += '.0';
    }
    if (!semver.valid(version)) {
        throw new schematics_1.SchematicsException(`Invalid migration version: ${JSON.stringify(version)}`);
    }
    return version;
}
function default_1(options) {
    if (!options.packages) {
        // We cannot just return this because we need to fetch the packages from NPM still for the
        // help/guide to show.
        options.packages = [];
    }
    else {
        // We split every packages by commas to allow people to pass in multiple and make it an array.
        options.packages = options.packages.reduce((acc, curr) => {
            return acc.concat(curr.split(','));
        }, []);
    }
    if (options.migrateOnly && options.from) {
        if (options.packages.length !== 1) {
            throw new schematics_1.SchematicsException('--from requires that only a single package be passed.');
        }
    }
    options.from = _formatVersion(options.from);
    options.to = _formatVersion(options.to);
    return (tree, context) => {
        const logger = context.logger;
        const allDependencies = _getAllDependencies(tree);
        const packages = _buildPackageList(options, allDependencies, logger);
        const usingYarn = options.packageManager === 'yarn';
        return rxjs_1.from([...allDependencies.keys()]).pipe(
        // Grab all package.json from the npm repository. This requires a lot of HTTP calls so we
        // try to parallelize as many as possible.
        operators_1.mergeMap(depName => npm_1.getNpmPackageJson(depName, logger, { registryUrl: options.registry, usingYarn, verbose: options.verbose })), 
        // Build a map of all dependencies and their packageJson.
        operators_1.reduce((acc, npmPackageJson) => {
            // If the package was not found on the registry. It could be private, so we will just
            // ignore. If the package was part of the list, we will error out, but will simply ignore
            // if it's either not requested (so just part of package.json. silently) or if it's a
            // `--all` situation. There is an edge case here where a public package peer depends on a
            // private one, but it's rare enough.
            if (!npmPackageJson.name) {
                if (packages.has(npmPackageJson.requestedName)) {
                    if (options.all) {
                        logger.warn(`Package ${JSON.stringify(npmPackageJson.requestedName)} was not `
                            + 'found on the registry. Skipping.');
                    }
                    else {
                        throw new schematics_1.SchematicsException(`Package ${JSON.stringify(npmPackageJson.requestedName)} was not found on the `
                            + 'registry. Cannot continue as this may be an error.');
                    }
                }
            }
            else {
                acc.set(npmPackageJson.name, npmPackageJson);
            }
            return acc;
        }, new Map()), operators_1.map(npmPackageJsonMap => {
            // Augment the command line package list with packageGroups and forward peer dependencies.
            // Each added package may uncover new package groups and peer dependencies, so we must
            // repeat this process until the package list stabilizes.
            let lastPackagesSize;
            do {
                lastPackagesSize = packages.size;
                npmPackageJsonMap.forEach((npmPackageJson) => {
                    _addPackageGroup(tree, packages, allDependencies, npmPackageJson, logger);
                    _addPeerDependencies(tree, packages, allDependencies, npmPackageJson, logger);
                });
            } while (packages.size > lastPackagesSize);
            // Build the PackageInfo for each module.
            const packageInfoMap = new Map();
            npmPackageJsonMap.forEach((npmPackageJson) => {
                packageInfoMap.set(npmPackageJson.name, _buildPackageInfo(tree, packages, allDependencies, npmPackageJson, logger));
            });
            return packageInfoMap;
        }), operators_1.switchMap(infoMap => {
            // Now that we have all the information, check the flags.
            if (packages.size > 0) {
                if (options.migrateOnly && options.from && options.packages) {
                    return _migrateOnly(infoMap.get(options.packages[0]), context, options.from, options.to);
                }
                const sublog = new core_1.logging.LevelCapLogger('validation', logger.createChild(''), 'warn');
                _validateUpdatePackages(infoMap, !!options.force, sublog);
                return _performUpdate(tree, context, infoMap, logger, !!options.migrateOnly);
            }
            else {
                return _usageMessage(options, infoMap, logger);
            }
        }), operators_1.switchMap(() => rxjs_1.of(tree)));
    };
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL3NjaGVtYXRpY3MvdXBkYXRlL3VwZGF0ZS9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7R0FNRztBQUNILCtDQUErQztBQUMvQywyREFNb0M7QUFDcEMsNERBQTRGO0FBQzVGLCtCQUE4RDtBQUM5RCw4Q0FBa0U7QUFDbEUsaUNBQWlDO0FBQ2pDLCtCQUEwQztBQVMxQyxrR0FBa0c7QUFDbEcsK0ZBQStGO0FBQy9GLDhGQUE4RjtBQUM5Rix3RkFBd0Y7QUFDeEYscUNBQXFDO0FBQ3JDLFNBQWdCLDJCQUEyQixDQUFDLEtBQWE7SUFDdkQsSUFBSSxRQUFRLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN4QyxJQUFJLENBQUMsUUFBUSxFQUFFO1FBQ2IsT0FBTyxLQUFLLENBQUM7S0FDZDtJQUNELElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztJQUNkLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxNQUFNLEVBQUUsUUFBUSxDQUFDLEVBQUU7UUFDNUMsS0FBSyxFQUFFLENBQUM7UUFDUixJQUFJLEtBQUssSUFBSSxFQUFFLEVBQUU7WUFDZixzREFBc0Q7WUFDdEQsaURBQWlEO1lBQ2pELE9BQU8sUUFBUSxDQUFDO1NBQ2pCO0tBQ0Y7SUFFRCw0RkFBNEY7SUFDNUYsZ0dBQWdHO0lBQ2hHLDBGQUEwRjtJQUMxRixRQUFRLEdBQUcsS0FBSyxDQUFDO0lBQ2pCLEtBQUssSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFLEtBQUssR0FBRyxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUU7UUFDdkMsUUFBUSxJQUFJLFFBQVEsS0FBSyxJQUFJLEtBQUssYUFBYSxDQUFDO0tBQ2pEO0lBRUQsT0FBTyxNQUFNLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEtBQUssQ0FBQztBQUM5QyxDQUFDO0FB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LENBQUM7SUFDSixDQUFDLENBQUM7QUFDSixDQUFDO0FBckhELDRCQXFIQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7IGxvZ2dpbmcgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvY29yZSc7XG5pbXBvcnQge1xuICBSdWxlLFxuICBTY2hlbWF0aWNDb250ZXh0LFxuICBTY2hlbWF0aWNzRXhjZXB0aW9uLFxuICBUYXNrSWQsXG4gIFRyZWUsXG59IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9zY2hlbWF0aWNzJztcbmltcG9ydCB7IE5vZGVQYWNrYWdlSW5zdGFsbFRhc2ssIFJ1blNjaGVtYXRpY1Rhc2sgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvc2NoZW1hdGljcy90YXNrcyc7XG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBmcm9tIGFzIG9ic2VydmFibGVGcm9tLCBvZiB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgbWFwLCBtZXJnZU1hcCwgcmVkdWNlLCBzd2l0Y2hNYXAgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQgKiBhcyBzZW12ZXIgZnJvbSAnc2VtdmVyJztcbmltcG9ydCB7IGdldE5wbVBhY2thZ2VKc29uIH0gZnJvbSAnLi9ucG0nO1xuaW1wb3J0IHsgTnBtUmVwb3NpdG9yeVBhY2thZ2VKc29uIH0gZnJvbSAnLi9ucG0tcGFja2FnZS1qc29uJztcbmltcG9ydCB7IERlcGVuZGVuY3ksIEpzb25TY2hlbWFGb3JOcG1QYWNrYWdlSnNvbkZpbGVzIH0gZnJvbSAnLi9wYWNrYWdlLWpzb24nO1xuaW1wb3J0IHsgU2NoZW1hIGFzIFVwZGF0ZVNjaGVtYSB9IGZyb20gJy4vc2NoZW1hJztcblxudHlwZSBWZXJzaW9uUmFuZ2UgPSBzdHJpbmcgJiB7IF9fVkVSU0lPTl9SQU5HRTogdm9pZDsgfTtcbnR5cGUgUGVlclZlcnNpb25UcmFuc2Zvcm0gPSBzdHJpbmcgfCAoKHJhbmdlOiBzdHJpbmcpID0+IHN0cmluZyk7XG5cblxuLy8gQW5ndWxhciBndWFyYW50ZWVzIHRoYXQgYSBtYWpvciBpcyBjb21wYXRpYmxlIHdpdGggaXRzIGZvbGxvd2luZyBtYWpvciAoc28gcGFja2FnZXMgdGhhdCBkZXBlbmRcbi8vIG9uIEFuZ3VsYXIgNSBhcmUgYWxzbyBjb21wYXRpYmxlIHdpdGggQW5ndWxhciA2KS4gVGhpcyBpcywgaW4gY29kZSwgcmVwcmVzZW50ZWQgYnkgdmVyaWZ5aW5nXG4vLyB0aGF0IGFsbCBvdGhlciBwYWNrYWdlcyB0aGF0IGhhdmUgYSBwZWVyIGRlcGVuZGVuY3kgb2YgYFwiQGFuZ3VsYXIvY29yZVwiOiBcIl41LjAuMFwiYCBhY3R1YWxseVxuLy8gc3VwcG9ydHMgNi4wLCBieSBhZGRpbmcgdGhhdCBjb21wYXRpYmlsaXR5IHRvIHRoZSByYW5nZSwgc28gaXQgaXMgYF41LjAuMCB8fCBeNi4wLjBgLlxuLy8gV2UgZXhwb3J0IGl0IHRvIGFsbG93IGZvciB0ZXN0aW5nLlxuZXhwb3J0IGZ1bmN0aW9uIGFuZ3VsYXJNYWpvckNvbXBhdEd1YXJhbnRlZShyYW5nZTogc3RyaW5nKSB7XG4gIGxldCBuZXdSYW5nZSA9IHNlbXZlci52YWxpZFJhbmdlKHJhbmdlKTtcbiAgaWYgKCFuZXdSYW5nZSkge1xuICAgIHJldHVybiByYW5nZTtcbiAgfVxuICBsZXQgbWFqb3IgPSAxO1xuICB3aGlsZSAoIXNlbXZlci5ndHIobWFqb3IgKyAnLjAuMCcsIG5ld1JhbmdlKSkge1xuICAgIG1ham9yKys7XG4gICAgaWYgKG1ham9yID49IDk5KSB7XG4gICAgICAvLyBVc2Ugb3JpZ2luYWwgcmFuZ2UgaWYgaXQgc3VwcG9ydHMgYSBtYWpvciB0aGlzIGhpZ2hcbiAgICAgIC8vIFJhbmdlIGlzIG1vc3QgbGlrZWx5IHVuYm91bmRlZCAoZS5nLiwgPj01LjAuMClcbiAgICAgIHJldHVybiBuZXdSYW5nZTtcbiAgICB9XG4gIH1cblxuICAvLyBBZGQgdGhlIG1ham9yIHZlcnNpb24gYXMgY29tcGF0aWJsZSB3aXRoIHRoZSBhbmd1bGFyIGNvbXBhdGlibGUsIHdpdGggYWxsIG1pbm9ycy4gVGhpcyBpc1xuICAvLyBhbHJlYWR5IG9uZSBtYWpvciBhYm92ZSB0aGUgZ3JlYXRlc3Qgc3VwcG9ydGVkLCBiZWNhdXNlIHdlIGluY3JlbWVudCBgbWFqb3JgIGJlZm9yZSBjaGVja2luZy5cbiAgLy8gV2UgYWRkIG1pbm9ycyBsaWtlIHRoaXMgYmVjYXVzZSBhIG1pbm9yIGJldGEgaXMgc3RpbGwgY29tcGF0aWJsZSB3aXRoIGEgbWlub3Igbm9uLWJldGEuXG4gIG5ld1JhbmdlID0gcmFuZ2U7XG4gIGZvciAobGV0IG1pbm9yID0gMDsgbWlub3IgPCAyMDsgbWlub3IrKykge1xuICAgIG5ld1JhbmdlICs9IGAgfHwgXiR7bWFqb3J9LiR7bWlub3J9LjAtYWxwaGEuMCBgO1xuICB9XG5cbiAgcmV0dXJuIHNlbXZlci52YWxpZFJhbmdlKG5ld1JhbmdlKSB8fCByYW5nZTtcbn1cblxuXG4vLyBUaGlzIGlzIGEgbWFwIG9mIHBhY2thZ2VHcm91cE5hbWUgdG8gcmFuZ2UgZXh0ZW5kaW5nIGZ1bmN0aW9uLiBJZiBpdCBpc24ndCBmb3VuZCwgdGhlIHJhbmdlIGlzXG4vLyBrZXB0IHRoZSBzYW1lLlxuY29uc3QgcGVlckNvbXBhdGlibGVXaGl0ZWxpc3Q6IHsgW25hbWU6IHN0cmluZ106IFBlZXJWZXJzaW9uVHJhbnNmb3JtIH0gPSB7XG4gICdAYW5ndWxhci9jb3JlJzogYW5ndWxhck1ham9yQ29tcGF0R3VhcmFudGVlLFxufTtcblxuaW50ZXJmYWNlIFBhY2thZ2VWZXJzaW9uSW5mbyB7XG4gIHZlcnNpb246IFZlcnNpb25SYW5nZTtcbiAgcGFja2FnZUpzb246IEpzb25TY2hlbWFGb3JOcG1QYWNrYWdlSnNvbkZpbGVzO1xuICB1cGRhdGVNZXRhZGF0YTogVXBkYXRlTWV0YWRhdGE7XG59XG5cbmludGVyZmFjZSBQYWNrYWdlSW5mbyB7XG4gIG5hbWU6IHN0cmluZztcbiAgbnBtUGFja2FnZUpzb246IE5wbVJlcG9zaXRvcnlQYWNrYWdlSnNvbjtcbiAgaW5zdGFsbGVkOiBQYWNrYWdlVmVyc2lvbkluZm87XG4gIHRhcmdldD86IFBhY2thZ2VWZXJzaW9uSW5mbztcbiAgcGFja2FnZUpzb25SYW5nZTogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgVXBkYXRlTWV0YWRhdGEge1xuICBwYWNrYWdlR3JvdXBOYW1lPzogc3RyaW5nO1xuICBwYWNrYWdlR3JvdXA6IHsgWyBwYWNrYWdlTmFtZTogc3RyaW5nIF06IHN0cmluZyB9O1xuICByZXF1aXJlbWVudHM6IHsgW3BhY2thZ2VOYW1lOiBzdHJpbmddOiBzdHJpbmcgfTtcbiAgbWlncmF0aW9ucz86IHN0cmluZztcbn1cblxuZnVuY3Rpb24gX3VwZGF0ZVBlZXJWZXJzaW9uKGluZm9NYXA6IE1hcDxzdHJpbmcsIFBhY2thZ2VJbmZvPiwgbmFtZTogc3RyaW5nLCByYW5nZTogc3RyaW5nKSB7XG4gIC8vIFJlc29sdmUgcGFja2FnZUdyb3VwTmFtZS5cbiAgY29uc3QgbWF5YmVQYWNrYWdlSW5mbyA9IGluZm9NYXAuZ2V0KG5hbWUpO1xuICBpZiAoIW1heWJlUGFja2FnZUluZm8pIHtcbiAgICByZXR1cm4gcmFuZ2U7XG4gIH1cbiAgaWYgKG1heWJlUGFja2FnZUluZm8udGFyZ2V0KSB7XG4gICAgbmFtZSA9IG1heWJlUGFja2FnZUluZm8udGFyZ2V0LnVwZGF0ZU1ldGFkYXRhLnBhY2thZ2VHcm91cE5hbWUgfHwgbmFtZTtcbiAgfSBlbHNlIHtcbiAgICBuYW1lID0gbWF5YmVQYWNrYWdlSW5mby5pbnN0YWxsZWQudXBkYXRlTWV0YWRhdGEucGFja2FnZUdyb3VwTmFtZSB8fCBuYW1lO1xuICB9XG5cbiAgY29uc3QgbWF5YmVUcmFuc2Zvcm0gPSBwZWVyQ29tcGF0aWJsZVdoaXRlbGlzdFtuYW1lXTtcbiAgaWYgKG1heWJlVHJhbnNmb3JtKSB7XG4gICAgaWYgKHR5cGVvZiBtYXliZVRyYW5zZm9ybSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gbWF5YmVUcmFuc2Zvcm0ocmFuZ2UpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbWF5YmVUcmFuc2Zvcm07XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJhbmdlO1xufVxuXG5mdW5jdGlvbiBfdmFsaWRhdGVGb3J3YXJkUGVlckRlcGVuZGVuY2llcyhcbiAgbmFtZTogc3RyaW5nLFxuICBpbmZvTWFwOiBNYXA8c3RyaW5nLCBQYWNrYWdlSW5mbz4sXG4gIHBlZXJzOiB7W25hbWU6IHN0cmluZ106IHN0cmluZ30sXG4gIGxvZ2dlcjogbG9nZ2luZy5Mb2dnZXJBcGksXG4pOiBib29sZWFuIHtcbiAgZm9yIChjb25zdCBbcGVlciwgcmFuZ2VdIG9mIE9iamVjdC5lbnRyaWVzKHBlZXJzKSkge1xuICAgIGxvZ2dlci5kZWJ1ZyhgQ2hlY2tpbmcgZm9yd2FyZCBwZWVyICR7cGVlcn0uLi5gKTtcbiAgICBjb25zdCBtYXliZVBlZXJJbmZvID0gaW5mb01hcC5nZXQocGVlcik7XG4gICAgaWYgKCFtYXliZVBlZXJJbmZvKSB7XG4gICAgICBsb2dnZXIuZXJyb3IoW1xuICAgICAgICBgUGFja2FnZSAke0pTT04uc3RyaW5naWZ5KG5hbWUpfSBoYXMgYSBtaXNzaW5nIHBlZXIgZGVwZW5kZW5jeSBvZmAsXG4gICAgICAgIGAke0pTT04uc3RyaW5naWZ5KHBlZXIpfSBAICR7SlNPTi5zdHJpbmdpZnkocmFuZ2UpfS5gLFxuICAgICAgXS5qb2luKCcgJykpO1xuXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBjb25zdCBwZWVyVmVyc2lvbiA9IG1heWJlUGVlckluZm8udGFyZ2V0ICYmIG1heWJlUGVlckluZm8udGFyZ2V0LnBhY2thZ2VKc29uLnZlcnNpb25cbiAgICAgID8gbWF5YmVQZWVySW5mby50YXJnZXQucGFja2FnZUpzb24udmVyc2lvblxuICAgICAgOiBtYXliZVBlZXJJbmZvLmluc3RhbGxlZC52ZXJzaW9uO1xuXG4gICAgbG9nZ2VyLmRlYnVnKGAgIFJhbmdlIGludGVyc2VjdHMoJHtyYW5nZX0sICR7cGVlclZlcnNpb259KS4uLmApO1xuICAgIGlmICghc2VtdmVyLnNhdGlzZmllcyhwZWVyVmVyc2lvbiwgcmFuZ2UpKSB7XG4gICAgICBsb2dnZXIuZXJyb3IoW1xuICAgICAgICBgUGFja2FnZSAke0pTT04uc3RyaW5naWZ5KG5hbWUpfSBoYXMgYW4gaW5jb21wYXRpYmxlIHBlZXIgZGVwZW5kZW5jeSB0b2AsXG4gICAgICAgIGAke0pTT04uc3RyaW5naWZ5KHBlZXIpfSAocmVxdWlyZXMgJHtKU09OLnN0cmluZ2lmeShyYW5nZSl9LGAsXG4gICAgICAgIGB3b3VsZCBpbnN0YWxsICR7SlNPTi5zdHJpbmdpZnkocGVlclZlcnNpb24pfSlgLFxuICAgICAgXS5qb2luKCcgJykpO1xuXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59XG5cblxuZnVuY3Rpb24gX3ZhbGlkYXRlUmV2ZXJzZVBlZXJEZXBlbmRlbmNpZXMoXG4gIG5hbWU6IHN0cmluZyxcbiAgdmVyc2lvbjogc3RyaW5nLFxuICBpbmZvTWFwOiBNYXA8c3RyaW5nLCBQYWNrYWdlSW5mbz4sXG4gIGxvZ2dlcjogbG9nZ2luZy5Mb2dnZXJBcGksXG4pIHtcbiAgZm9yIChjb25zdCBbaW5zdGFsbGVkLCBpbnN0YWxsZWRJbmZvXSBvZiBpbmZvTWFwLmVudHJpZXMoKSkge1xuICAgIGNvbnN0IGluc3RhbGxlZExvZ2dlciA9IGxvZ2dlci5jcmVhdGVDaGlsZChpbnN0YWxsZWQpO1xuICAgIGluc3RhbGxlZExvZ2dlci5kZWJ1ZyhgJHtpbnN0YWxsZWR9Li4uYCk7XG4gICAgY29uc3QgcGVlcnMgPSAoaW5zdGFsbGVkSW5mby50YXJnZXQgfHwgaW5zdGFsbGVkSW5mby5pbnN0YWxsZWQpLnBhY2thZ2VKc29uLnBlZXJEZXBlbmRlbmNpZXM7XG5cbiAgICBmb3IgKGNvbnN0IFtwZWVyLCByYW5nZV0gb2YgT2JqZWN0LmVudHJpZXMocGVlcnMgfHwge30pKSB7XG4gICAgICBpZiAocGVlciAhPSBuYW1lKSB7XG4gICAgICAgIC8vIE9ubHkgY2hlY2sgcGVlcnMgdG8gdGhlIHBhY2thZ2VzIHdlJ3JlIHVwZGF0aW5nLiBXZSBkb24ndCBjYXJlIGFib3V0IHBlZXJzXG4gICAgICAgIC8vIHRoYXQgYXJlIHVubWV0IGJ1dCB3ZSBoYXZlIG5vIGVmZmVjdCBvbi5cbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIE92ZXJyaWRlIHRoZSBwZWVyIHZlcnNpb24gcmFuZ2UgaWYgaXQncyB3aGl0ZWxpc3RlZC5cbiAgICAgIGNvbnN0IGV4dGVuZGVkUmFuZ2UgPSBfdXBkYXRlUGVlclZlcnNpb24oaW5mb01hcCwgcGVlciwgcmFuZ2UpO1xuXG4gICAgICBpZiAoIXNlbXZlci5zYXRpc2ZpZXModmVyc2lvbiwgZXh0ZW5kZWRSYW5nZSkpIHtcbiAgICAgICAgbG9nZ2VyLmVycm9yKFtcbiAgICAgICAgICBgUGFja2FnZSAke0pTT04uc3RyaW5naWZ5KGluc3RhbGxlZCl9IGhhcyBhbiBpbmNvbXBhdGlibGUgcGVlciBkZXBlbmRlbmN5IHRvYCxcbiAgICAgICAgICBgJHtKU09OLnN0cmluZ2lmeShuYW1lKX0gKHJlcXVpcmVzYCxcbiAgICAgICAgICBgJHtKU09OLnN0cmluZ2lmeShyYW5nZSl9JHtleHRlbmRlZFJhbmdlID09IHJhbmdlID8gJycgOiAnIChleHRlbmRlZCknfSxgLFxuICAgICAgICAgIGB3b3VsZCBpbnN0YWxsICR7SlNPTi5zdHJpbmdpZnkodmVyc2lvbil9KS5gLFxuICAgICAgICBdLmpvaW4oJyAnKSk7XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBfdmFsaWRhdGVVcGRhdGVQYWNrYWdlcyhcbiAgaW5mb01hcDogTWFwPHN0cmluZywgUGFja2FnZUluZm8+LFxuICBmb3JjZTogYm9vbGVhbixcbiAgbG9nZ2VyOiBsb2dnaW5nLkxvZ2dlckFwaSxcbik6IHZvaWQge1xuICBsb2dnZXIuZGVidWcoJ1VwZGF0aW5nIHRoZSBmb2xsb3dpbmcgcGFja2FnZXM6Jyk7XG4gIGluZm9NYXAuZm9yRWFjaChpbmZvID0+IHtcbiAgICBpZiAoaW5mby50YXJnZXQpIHtcbiAgICAgIGxvZ2dlci5kZWJ1ZyhgICAke2luZm8ubmFtZX0gPT4gJHtpbmZvLnRhcmdldC52ZXJzaW9ufWApO1xuICAgIH1cbiAgfSk7XG5cbiAgbGV0IHBlZXJFcnJvcnMgPSBmYWxzZTtcbiAgaW5mb01hcC5mb3JFYWNoKGluZm8gPT4ge1xuICAgIGNvbnN0IHtuYW1lLCB0YXJnZXR9ID0gaW5mbztcbiAgICBpZiAoIXRhcmdldCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHBrZ0xvZ2dlciA9IGxvZ2dlci5jcmVhdGVDaGlsZChuYW1lKTtcbiAgICBsb2dnZXIuZGVidWcoYCR7bmFtZX0uLi5gKTtcblxuICAgIGNvbnN0IHBlZXJzID0gdGFyZ2V0LnBhY2thZ2VKc29uLnBlZXJEZXBlbmRlbmNpZXMgfHwge307XG4gICAgcGVlckVycm9ycyA9IF92YWxpZGF0ZUZvcndhcmRQZWVyRGVwZW5kZW5jaWVzKG5hbWUsIGluZm9NYXAsIHBlZXJzLCBwa2dMb2dnZXIpIHx8IHBlZXJFcnJvcnM7XG4gICAgcGVlckVycm9yc1xuICAgICAgPSBfdmFsaWRhdGVSZXZlcnNlUGVlckRlcGVuZGVuY2llcyhuYW1lLCB0YXJnZXQudmVyc2lvbiwgaW5mb01hcCwgcGtnTG9nZ2VyKVxuICAgICAgfHwgcGVlckVycm9ycztcbiAgfSk7XG5cbiAgaWYgKCFmb3JjZSAmJiBwZWVyRXJyb3JzKSB7XG4gICAgdGhyb3cgbmV3IFNjaGVtYXRpY3NFeGNlcHRpb24oYEluY29tcGF0aWJsZSBwZWVyIGRlcGVuZGVuY2llcyBmb3VuZC4gU2VlIGFib3ZlLmApO1xuICB9XG59XG5cblxuZnVuY3Rpb24gX3BlcmZvcm1VcGRhdGUoXG4gIHRyZWU6IFRyZWUsXG4gIGNvbnRleHQ6IFNjaGVtYXRpY0NvbnRleHQsXG4gIGluZm9NYXA6IE1hcDxzdHJpbmcsIFBhY2thZ2VJbmZvPixcbiAgbG9nZ2VyOiBsb2dnaW5nLkxvZ2dlckFwaSxcbiAgbWlncmF0ZU9ubHk6IGJvb2xlYW4sXG4pOiBPYnNlcnZhYmxlPHZvaWQ+IHtcbiAgY29uc3QgcGFja2FnZUpzb25Db250ZW50ID0gdHJlZS5yZWFkKCcvcGFja2FnZS5qc29uJyk7XG4gIGlmICghcGFja2FnZUpzb25Db250ZW50KSB7XG4gICAgdGhyb3cgbmV3IFNjaGVtYXRpY3NFeGNlcHRpb24oJ0NvdWxkIG5vdCBmaW5kIGEgcGFja2FnZS5qc29uLiBBcmUgeW91IGluIGEgTm9kZSBwcm9qZWN0PycpO1xuICB9XG5cbiAgbGV0IHBhY2thZ2VKc29uOiBKc29uU2NoZW1hRm9yTnBtUGFja2FnZUpzb25GaWxlcztcbiAgdHJ5IHtcbiAgICBwYWNrYWdlSnNvbiA9IEpTT04ucGFyc2UocGFja2FnZUpzb25Db250ZW50LnRvU3RyaW5nKCkpIGFzIEpzb25TY2hlbWFGb3JOcG1QYWNrYWdlSnNvbkZpbGVzO1xuICB9IGNhdGNoIChlKSB7XG4gICAgdGhyb3cgbmV3IFNjaGVtYXRpY3NFeGNlcHRpb24oJ3BhY2thZ2UuanNvbiBjb3VsZCBub3QgYmUgcGFyc2VkOiAnICsgZS5tZXNzYWdlKTtcbiAgfVxuXG4gIGNvbnN0IHVwZGF0ZURlcGVuZGVuY3kgPSAoZGVwczogRGVwZW5kZW5jeSwgbmFtZTogc3RyaW5nLCBuZXdWZXJzaW9uOiBzdHJpbmcpID0+IHtcbiAgICBjb25zdCBvbGRWZXJzaW9uID0gZGVwc1tuYW1lXTtcbiAgICAvLyBXZSBvbmx5IHJlc3BlY3QgY2FyZXQgYW5kIHRpbGRlIHJhbmdlcyBvbiB1cGRhdGUuXG4gICAgY29uc3QgZXhlY1Jlc3VsdCA9IC9eW1xcXn5dLy5leGVjKG9sZFZlcnNpb24pO1xuICAgIGRlcHNbbmFtZV0gPSBgJHtleGVjUmVzdWx0ID8gZXhlY1Jlc3VsdFswXSA6ICcnfSR7bmV3VmVyc2lvbn1gO1xuICB9O1xuXG4gIGNvbnN0IHRvSW5zdGFsbCA9IFsuLi5pbmZvTWFwLnZhbHVlcygpXVxuICAgICAgLm1hcCh4ID0+IFt4Lm5hbWUsIHgudGFyZ2V0LCB4Lmluc3RhbGxlZF0pXG4gICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tbm9uLW51bGwtYXNzZXJ0aW9uXG4gICAgICAuZmlsdGVyKChbbmFtZSwgdGFyZ2V0LCBpbnN0YWxsZWRdKSA9PiB7XG4gICAgICAgIHJldHVybiAhIW5hbWUgJiYgISF0YXJnZXQgJiYgISFpbnN0YWxsZWQ7XG4gICAgICB9KSBhcyBbc3RyaW5nLCBQYWNrYWdlVmVyc2lvbkluZm8sIFBhY2thZ2VWZXJzaW9uSW5mb11bXTtcblxuICB0b0luc3RhbGwuZm9yRWFjaCgoW25hbWUsIHRhcmdldCwgaW5zdGFsbGVkXSkgPT4ge1xuICAgIGxvZ2dlci5pbmZvKFxuICAgICAgYFVwZGF0aW5nIHBhY2thZ2UuanNvbiB3aXRoIGRlcGVuZGVuY3kgJHtuYW1lfSBgXG4gICAgICArIGBAICR7SlNPTi5zdHJpbmdpZnkodGFyZ2V0LnZlcnNpb24pfSAod2FzICR7SlNPTi5zdHJpbmdpZnkoaW5zdGFsbGVkLnZlcnNpb24pfSkuLi5gLFxuICAgICk7XG5cbiAgICBpZiAocGFja2FnZUpzb24uZGVwZW5kZW5jaWVzICYmIHBhY2thZ2VKc29uLmRlcGVuZGVuY2llc1tuYW1lXSkge1xuICAgICAgdXBkYXRlRGVwZW5kZW5jeShwYWNrYWdlSnNvbi5kZXBlbmRlbmNpZXMsIG5hbWUsIHRhcmdldC52ZXJzaW9uKTtcblxuICAgICAgaWYgKHBhY2thZ2VKc29uLmRldkRlcGVuZGVuY2llcyAmJiBwYWNrYWdlSnNvbi5kZXZEZXBlbmRlbmNpZXNbbmFtZV0pIHtcbiAgICAgICAgZGVsZXRlIHBhY2thZ2VKc29uLmRldkRlcGVuZGVuY2llc1tuYW1lXTtcbiAgICAgIH1cbiAgICAgIGlmIChwYWNrYWdlSnNvbi5wZWVyRGVwZW5kZW5jaWVzICYmIHBhY2thZ2VKc29uLnBlZXJEZXBlbmRlbmNpZXNbbmFtZV0pIHtcbiAgICAgICAgZGVsZXRlIHBhY2thZ2VKc29uLnBlZXJEZXBlbmRlbmNpZXNbbmFtZV07XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChwYWNrYWdlSnNvbi5kZXZEZXBlbmRlbmNpZXMgJiYgcGFja2FnZUpzb24uZGV2RGVwZW5kZW5jaWVzW25hbWVdKSB7XG4gICAgICB1cGRhdGVEZXBlbmRlbmN5KHBhY2thZ2VKc29uLmRldkRlcGVuZGVuY2llcywgbmFtZSwgdGFyZ2V0LnZlcnNpb24pO1xuXG4gICAgICBpZiAocGFja2FnZUpzb24ucGVlckRlcGVuZGVuY2llcyAmJiBwYWNrYWdlSnNvbi5wZWVyRGVwZW5kZW5jaWVzW25hbWVdKSB7XG4gICAgICAgIGRlbGV0ZSBwYWNrYWdlSnNvbi5wZWVyRGVwZW5kZW5jaWVzW25hbWVdO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAocGFja2FnZUpzb24ucGVlckRlcGVuZGVuY2llcyAmJiBwYWNrYWdlSnNvbi5wZWVyRGVwZW5kZW5jaWVzW25hbWVdKSB7XG4gICAgICB1cGRhdGVEZXBlbmRlbmN5KHBhY2thZ2VKc29uLnBlZXJEZXBlbmRlbmNpZXMsIG5hbWUsIHRhcmdldC52ZXJzaW9uKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbG9nZ2VyLndhcm4oYFBhY2thZ2UgJHtuYW1lfSB3YXMgbm90IGZvdW5kIGluIGRlcGVuZGVuY2llcy5gKTtcbiAgICB9XG4gIH0pO1xuXG4gIGNvbnN0IG5ld0NvbnRlbnQgPSBKU09OLnN0cmluZ2lmeShwYWNrYWdlSnNvbiwgbnVsbCwgMik7XG4gIGlmIChwYWNrYWdlSnNvbkNvbnRlbnQudG9TdHJpbmcoKSAhPSBuZXdDb250ZW50IHx8IG1pZ3JhdGVPbmx5KSB7XG4gICAgbGV0IGluc3RhbGxUYXNrOiBUYXNrSWRbXSA9IFtdO1xuICAgIGlmICghbWlncmF0ZU9ubHkpIHtcbiAgICAgIC8vIElmIHNvbWV0aGluZyBjaGFuZ2VkLCBhbHNvIGhvb2sgdXAgdGhlIHRhc2suXG4gICAgICB0cmVlLm92ZXJ3cml0ZSgnL3BhY2thZ2UuanNvbicsIEpTT04uc3RyaW5naWZ5KHBhY2thZ2VKc29uLCBudWxsLCAyKSk7XG4gICAgICBpbnN0YWxsVGFzayA9IFtjb250ZXh0LmFkZFRhc2sobmV3IE5vZGVQYWNrYWdlSW5zdGFsbFRhc2soKSldO1xuICAgIH1cblxuICAgIC8vIFJ1biB0aGUgbWlncmF0ZSBzY2hlbWF0aWNzIHdpdGggdGhlIGxpc3Qgb2YgcGFja2FnZXMgdG8gdXNlLiBUaGUgY29sbGVjdGlvbiBjb250YWluc1xuICAgIC8vIHZlcnNpb24gaW5mb3JtYXRpb24gYW5kIHdlIG5lZWQgdG8gZG8gdGhpcyBwb3N0IGluc3RhbGxhdGlvbi4gUGxlYXNlIG5vdGUgdGhhdCB0aGVcbiAgICAvLyBtaWdyYXRpb24gQ09VTEQgZmFpbCBhbmQgbGVhdmUgc2lkZSBlZmZlY3RzIG9uIGRpc2suXG4gICAgLy8gUnVuIHRoZSBzY2hlbWF0aWNzIHRhc2sgb2YgdGhvc2UgcGFja2FnZXMuXG4gICAgdG9JbnN0YWxsLmZvckVhY2goKFtuYW1lLCB0YXJnZXQsIGluc3RhbGxlZF0pID0+IHtcbiAgICAgIGlmICghdGFyZ2V0LnVwZGF0ZU1ldGFkYXRhLm1pZ3JhdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBjb2xsZWN0aW9uID0gKFxuICAgICAgICB0YXJnZXQudXBkYXRlTWV0YWRhdGEubWlncmF0aW9ucy5tYXRjaCgvXlsuL10vKVxuICAgICAgICA/IG5hbWUgKyAnLydcbiAgICAgICAgOiAnJ1xuICAgICAgKSArIHRhcmdldC51cGRhdGVNZXRhZGF0YS5taWdyYXRpb25zO1xuXG4gICAgICBjb250ZXh0LmFkZFRhc2sobmV3IFJ1blNjaGVtYXRpY1Rhc2soJ0BzY2hlbWF0aWNzL3VwZGF0ZScsICdtaWdyYXRlJywge1xuICAgICAgICAgIHBhY2thZ2U6IG5hbWUsXG4gICAgICAgICAgY29sbGVjdGlvbixcbiAgICAgICAgICBmcm9tOiBpbnN0YWxsZWQudmVyc2lvbixcbiAgICAgICAgICB0bzogdGFyZ2V0LnZlcnNpb24sXG4gICAgICAgIH0pLFxuICAgICAgICBpbnN0YWxsVGFzayxcbiAgICAgICk7XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gb2Y8dm9pZD4odW5kZWZpbmVkKTtcbn1cblxuZnVuY3Rpb24gX21pZ3JhdGVPbmx5KFxuICBpbmZvOiBQYWNrYWdlSW5mbyB8IHVuZGVmaW5lZCxcbiAgY29udGV4dDogU2NoZW1hdGljQ29udGV4dCxcbiAgZnJvbTogc3RyaW5nLFxuICB0bz86IHN0cmluZyxcbikge1xuICBpZiAoIWluZm8pIHtcbiAgICByZXR1cm4gb2Y8dm9pZD4oKTtcbiAgfVxuXG4gIGNvbnN0IHRhcmdldCA9IGluZm8uaW5zdGFsbGVkO1xuICBpZiAoIXRhcmdldCB8fCAhdGFyZ2V0LnVwZGF0ZU1ldGFkYXRhLm1pZ3JhdGlvbnMpIHtcbiAgICByZXR1cm4gb2Y8dm9pZD4odW5kZWZpbmVkKTtcbiAgfVxuXG4gIGNvbnN0IGNvbGxlY3Rpb24gPSAoXG4gICAgdGFyZ2V0LnVwZGF0ZU1ldGFkYXRhLm1pZ3JhdGlvbnMubWF0Y2goL15bLi9dLylcbiAgICAgID8gaW5mby5uYW1lICsgJy8nXG4gICAgICA6ICcnXG4gICkgKyB0YXJnZXQudXBkYXRlTWV0YWRhdGEubWlncmF0aW9ucztcblxuICBjb250ZXh0LmFkZFRhc2sobmV3IFJ1blNjaGVtYXRpY1Rhc2soJ0BzY2hlbWF0aWNzL3VwZGF0ZScsICdtaWdyYXRlJywge1xuICAgICAgcGFja2FnZTogaW5mby5uYW1lLFxuICAgICAgY29sbGVjdGlvbixcbiAgICAgIGZyb206IGZyb20sXG4gICAgICB0bzogdG8gfHwgdGFyZ2V0LnZlcnNpb24sXG4gICAgfSksXG4gICk7XG5cbiAgcmV0dXJuIG9mPHZvaWQ+KHVuZGVmaW5lZCk7XG59XG5cbmZ1bmN0aW9uIF9nZXRVcGRhdGVNZXRhZGF0YShcbiAgcGFja2FnZUpzb246IEpzb25TY2hlbWFGb3JOcG1QYWNrYWdlSnNvbkZpbGVzLFxuICBsb2dnZXI6IGxvZ2dpbmcuTG9nZ2VyQXBpLFxuKTogVXBkYXRlTWV0YWRhdGEge1xuICBjb25zdCBtZXRhZGF0YSA9IHBhY2thZ2VKc29uWyduZy11cGRhdGUnXTtcblxuICBjb25zdCByZXN1bHQ6IFVwZGF0ZU1ldGFkYXRhID0ge1xuICAgIHBhY2thZ2VHcm91cDoge30sXG4gICAgcmVxdWlyZW1lbnRzOiB7fSxcbiAgfTtcblxuICBpZiAoIW1ldGFkYXRhIHx8IHR5cGVvZiBtZXRhZGF0YSAhPSAnb2JqZWN0JyB8fCBBcnJheS5pc0FycmF5KG1ldGFkYXRhKSkge1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBpZiAobWV0YWRhdGFbJ3BhY2thZ2VHcm91cCddKSB7XG4gICAgY29uc3QgcGFja2FnZUdyb3VwID0gbWV0YWRhdGFbJ3BhY2thZ2VHcm91cCddO1xuICAgIC8vIFZlcmlmeSB0aGF0IHBhY2thZ2VHcm91cCBpcyBhbiBhcnJheSBvZiBzdHJpbmdzIG9yIGFuIG1hcCBvZiB2ZXJzaW9ucy4gVGhpcyBpcyBub3QgYW4gZXJyb3JcbiAgICAvLyBidXQgd2Ugc3RpbGwgd2FybiB0aGUgdXNlciBhbmQgaWdub3JlIHRoZSBwYWNrYWdlR3JvdXAga2V5cy5cbiAgICBpZiAoQXJyYXkuaXNBcnJheShwYWNrYWdlR3JvdXApICYmIHBhY2thZ2VHcm91cC5ldmVyeSh4ID0+IHR5cGVvZiB4ID09ICdzdHJpbmcnKSkge1xuICAgICAgcmVzdWx0LnBhY2thZ2VHcm91cCA9IHBhY2thZ2VHcm91cC5yZWR1Y2UoKGdyb3VwLCBuYW1lKSA9PiB7XG4gICAgICAgIGdyb3VwW25hbWVdID0gcGFja2FnZUpzb24udmVyc2lvbjtcblxuICAgICAgICByZXR1cm4gZ3JvdXA7XG4gICAgICB9LCByZXN1bHQucGFja2FnZUdyb3VwKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBwYWNrYWdlR3JvdXAgPT0gJ29iamVjdCcgJiYgcGFja2FnZUdyb3VwXG4gICAgICAgICAgICAgICAmJiBPYmplY3QudmFsdWVzKHBhY2thZ2VHcm91cCkuZXZlcnkoeCA9PiB0eXBlb2YgeCA9PSAnc3RyaW5nJykpIHtcbiAgICAgIHJlc3VsdC5wYWNrYWdlR3JvdXAgPSBwYWNrYWdlR3JvdXA7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxvZ2dlci53YXJuKFxuICAgICAgICBgcGFja2FnZUdyb3VwIG1ldGFkYXRhIG9mIHBhY2thZ2UgJHtwYWNrYWdlSnNvbi5uYW1lfSBpcyBtYWxmb3JtZWQuIElnbm9yaW5nLmAsXG4gICAgICApO1xuICAgIH1cblxuICAgIHJlc3VsdC5wYWNrYWdlR3JvdXBOYW1lID0gT2JqZWN0LmtleXMocmVzdWx0LnBhY2thZ2VHcm91cClbMF07XG4gIH1cblxuICBpZiAodHlwZW9mIG1ldGFkYXRhWydwYWNrYWdlR3JvdXBOYW1lJ10gPT0gJ3N0cmluZycpIHtcbiAgICByZXN1bHQucGFja2FnZUdyb3VwTmFtZSA9IG1ldGFkYXRhWydwYWNrYWdlR3JvdXBOYW1lJ107XG4gIH1cblxuICBpZiAobWV0YWRhdGFbJ3JlcXVpcmVtZW50cyddKSB7XG4gICAgY29uc3QgcmVxdWlyZW1lbnRzID0gbWV0YWRhdGFbJ3JlcXVpcmVtZW50cyddO1xuICAgIC8vIFZlcmlmeSB0aGF0IHJlcXVpcmVtZW50cyBhcmVcbiAgICBpZiAodHlwZW9mIHJlcXVpcmVtZW50cyAhPSAnb2JqZWN0J1xuICAgICAgICB8fCBBcnJheS5pc0FycmF5KHJlcXVpcmVtZW50cylcbiAgICAgICAgfHwgT2JqZWN0LmtleXMocmVxdWlyZW1lbnRzKS5zb21lKG5hbWUgPT4gdHlwZW9mIHJlcXVpcmVtZW50c1tuYW1lXSAhPSAnc3RyaW5nJykpIHtcbiAgICAgIGxvZ2dlci53YXJuKFxuICAgICAgICBgcmVxdWlyZW1lbnRzIG1ldGFkYXRhIG9mIHBhY2thZ2UgJHtwYWNrYWdlSnNvbi5uYW1lfSBpcyBtYWxmb3JtZWQuIElnbm9yaW5nLmAsXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHQucmVxdWlyZW1lbnRzID0gcmVxdWlyZW1lbnRzO1xuICAgIH1cbiAgfVxuXG4gIGlmIChtZXRhZGF0YVsnbWlncmF0aW9ucyddKSB7XG4gICAgY29uc3QgbWlncmF0aW9ucyA9IG1ldGFkYXRhWydtaWdyYXRpb25zJ107XG4gICAgaWYgKHR5cGVvZiBtaWdyYXRpb25zICE9ICdzdHJpbmcnKSB7XG4gICAgICBsb2dnZXIud2FybihgbWlncmF0aW9ucyBtZXRhZGF0YSBvZiBwYWNrYWdlICR7cGFja2FnZUpzb24ubmFtZX0gaXMgbWFsZm9ybWVkLiBJZ25vcmluZy5gKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0Lm1pZ3JhdGlvbnMgPSBtaWdyYXRpb25zO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59XG5cblxuZnVuY3Rpb24gX3VzYWdlTWVzc2FnZShcbiAgb3B0aW9uczogVXBkYXRlU2NoZW1hLFxuICBpbmZvTWFwOiBNYXA8c3RyaW5nLCBQYWNrYWdlSW5mbz4sXG4gIGxvZ2dlcjogbG9nZ2luZy5Mb2dnZXJBcGksXG4pIHtcbiAgY29uc3QgcGFja2FnZUdyb3VwcyA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG4gIGNvbnN0IHBhY2thZ2VzVG9VcGRhdGUgPSBbLi4uaW5mb01hcC5lbnRyaWVzKCldXG4gICAgLm1hcCgoW25hbWUsIGluZm9dKSA9PiB7XG4gICAgICBjb25zdCB0YWcgPSBvcHRpb25zLm5leHRcbiAgICAgICAgPyAoaW5mby5ucG1QYWNrYWdlSnNvblsnZGlzdC10YWdzJ11bJ25leHQnXSA/ICduZXh0JyA6ICdsYXRlc3QnKSA6ICdsYXRlc3QnO1xuICAgICAgY29uc3QgdmVyc2lvbiA9IGluZm8ubnBtUGFja2FnZUpzb25bJ2Rpc3QtdGFncyddW3RhZ107XG4gICAgICBjb25zdCB0YXJnZXQgPSBpbmZvLm5wbVBhY2thZ2VKc29uLnZlcnNpb25zW3ZlcnNpb25dO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBuYW1lLFxuICAgICAgICBpbmZvLFxuICAgICAgICB2ZXJzaW9uLFxuICAgICAgICB0YWcsXG4gICAgICAgIHRhcmdldCxcbiAgICAgIH07XG4gICAgfSlcbiAgICAuZmlsdGVyKCh7IG5hbWUsIGluZm8sIHZlcnNpb24sIHRhcmdldCB9KSA9PiB7XG4gICAgICByZXR1cm4gKHRhcmdldCAmJiBzZW12ZXIuY29tcGFyZShpbmZvLmluc3RhbGxlZC52ZXJzaW9uLCB2ZXJzaW9uKSA8IDApO1xuICAgIH0pXG4gICAgLmZpbHRlcigoeyB0YXJnZXQgfSkgPT4ge1xuICAgICAgcmV0dXJuIHRhcmdldFsnbmctdXBkYXRlJ107XG4gICAgfSlcbiAgICAubWFwKCh7IG5hbWUsIGluZm8sIHZlcnNpb24sIHRhZywgdGFyZ2V0IH0pID0+IHtcbiAgICAgIC8vIExvb2sgZm9yIHBhY2thZ2VHcm91cC5cbiAgICAgIGlmICh0YXJnZXRbJ25nLXVwZGF0ZSddICYmIHRhcmdldFsnbmctdXBkYXRlJ11bJ3BhY2thZ2VHcm91cCddKSB7XG4gICAgICAgIGNvbnN0IHBhY2thZ2VHcm91cCA9IHRhcmdldFsnbmctdXBkYXRlJ11bJ3BhY2thZ2VHcm91cCddO1xuICAgICAgICBjb25zdCBwYWNrYWdlR3JvdXBOYW1lID0gdGFyZ2V0WyduZy11cGRhdGUnXVsncGFja2FnZUdyb3VwTmFtZSddXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8fCB0YXJnZXRbJ25nLXVwZGF0ZSddWydwYWNrYWdlR3JvdXAnXVswXTtcbiAgICAgICAgaWYgKHBhY2thZ2VHcm91cE5hbWUpIHtcbiAgICAgICAgICBpZiAocGFja2FnZUdyb3Vwcy5oYXMobmFtZSkpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHBhY2thZ2VHcm91cC5mb3JFYWNoKCh4OiBzdHJpbmcpID0+IHBhY2thZ2VHcm91cHMuc2V0KHgsIHBhY2thZ2VHcm91cE5hbWUpKTtcbiAgICAgICAgICBwYWNrYWdlR3JvdXBzLnNldChwYWNrYWdlR3JvdXBOYW1lLCBwYWNrYWdlR3JvdXBOYW1lKTtcbiAgICAgICAgICBuYW1lID0gcGFja2FnZUdyb3VwTmFtZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBsZXQgY29tbWFuZCA9IGBuZyB1cGRhdGUgJHtuYW1lfWA7XG4gICAgICBpZiAodGFnID09ICduZXh0Jykge1xuICAgICAgICBjb21tYW5kICs9ICcgLS1uZXh0JztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIFtuYW1lLCBgJHtpbmZvLmluc3RhbGxlZC52ZXJzaW9ufSAtPiAke3ZlcnNpb259YCwgY29tbWFuZF07XG4gICAgfSlcbiAgICAuZmlsdGVyKHggPT4geCAhPT0gbnVsbClcbiAgICAuc29ydCgoYSwgYikgPT4gYSAmJiBiID8gYVswXS5sb2NhbGVDb21wYXJlKGJbMF0pIDogMCk7XG5cbiAgaWYgKHBhY2thZ2VzVG9VcGRhdGUubGVuZ3RoID09IDApIHtcbiAgICBsb2dnZXIuaW5mbygnV2UgYW5hbHl6ZWQgeW91ciBwYWNrYWdlLmpzb24gYW5kIGV2ZXJ5dGhpbmcgc2VlbXMgdG8gYmUgaW4gb3JkZXIuIEdvb2Qgd29yayEnKTtcblxuICAgIHJldHVybiBvZjx2b2lkPih1bmRlZmluZWQpO1xuICB9XG5cbiAgbG9nZ2VyLmluZm8oXG4gICAgJ1dlIGFuYWx5emVkIHlvdXIgcGFja2FnZS5qc29uLCB0aGVyZSBhcmUgc29tZSBwYWNrYWdlcyB0byB1cGRhdGU6XFxuJyxcbiAgKTtcblxuICAvLyBGaW5kIHRoZSBsYXJnZXN0IG5hbWUgdG8ga25vdyB0aGUgcGFkZGluZyBuZWVkZWQuXG4gIGxldCBuYW1lUGFkID0gTWF0aC5tYXgoLi4uWy4uLmluZm9NYXAua2V5cygpXS5tYXAoeCA9PiB4Lmxlbmd0aCkpICsgMjtcbiAgaWYgKCFOdW1iZXIuaXNGaW5pdGUobmFtZVBhZCkpIHtcbiAgICBuYW1lUGFkID0gMzA7XG4gIH1cbiAgY29uc3QgcGFkcyA9IFtuYW1lUGFkLCAyNSwgMF07XG5cbiAgbG9nZ2VyLmluZm8oXG4gICAgJyAgJ1xuICAgICsgWydOYW1lJywgJ1ZlcnNpb24nLCAnQ29tbWFuZCB0byB1cGRhdGUnXS5tYXAoKHgsIGkpID0+IHgucGFkRW5kKHBhZHNbaV0pKS5qb2luKCcnKSxcbiAgKTtcbiAgbG9nZ2VyLmluZm8oJyAnICsgJy0nLnJlcGVhdChwYWRzLnJlZHVjZSgocywgeCkgPT4gcyArPSB4LCAwKSArIDIwKSk7XG5cbiAgcGFja2FnZXNUb1VwZGF0ZS5mb3JFYWNoKGZpZWxkcyA9PiB7XG4gICAgaWYgKCFmaWVsZHMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsb2dnZXIuaW5mbygnICAnICsgZmllbGRzLm1hcCgoeCwgaSkgPT4geC5wYWRFbmQocGFkc1tpXSkpLmpvaW4oJycpKTtcbiAgfSk7XG5cbiAgbG9nZ2VyLmluZm8oJ1xcbicpO1xuICBsb2dnZXIuaW5mbygnVGhlcmUgbWlnaHQgYmUgYWRkaXRpb25hbCBwYWNrYWdlcyB0aGF0IGFyZSBvdXRkYXRlZC4nKTtcbiAgbG9nZ2VyLmluZm8oJ1J1biBcIm5nIHVwZGF0ZSAtLWFsbFwiIHRvIHRyeSB0byB1cGRhdGUgYWxsIGF0IHRoZSBzYW1lIHRpbWUuXFxuJyk7XG5cbiAgcmV0dXJuIG9mPHZvaWQ+KHVuZGVmaW5lZCk7XG59XG5cblxuZnVuY3Rpb24gX2J1aWxkUGFja2FnZUluZm8oXG4gIHRyZWU6IFRyZWUsXG4gIHBhY2thZ2VzOiBNYXA8c3RyaW5nLCBWZXJzaW9uUmFuZ2U+LFxuICBhbGxEZXBlbmRlbmNpZXM6IFJlYWRvbmx5TWFwPHN0cmluZywgVmVyc2lvblJhbmdlPixcbiAgbnBtUGFja2FnZUpzb246IE5wbVJlcG9zaXRvcnlQYWNrYWdlSnNvbixcbiAgbG9nZ2VyOiBsb2dnaW5nLkxvZ2dlckFwaSxcbik6IFBhY2thZ2VJbmZvIHtcbiAgY29uc3QgbmFtZSA9IG5wbVBhY2thZ2VKc29uLm5hbWU7XG4gIGNvbnN0IHBhY2thZ2VKc29uUmFuZ2UgPSBhbGxEZXBlbmRlbmNpZXMuZ2V0KG5hbWUpO1xuICBpZiAoIXBhY2thZ2VKc29uUmFuZ2UpIHtcbiAgICB0aHJvdyBuZXcgU2NoZW1hdGljc0V4Y2VwdGlvbihcbiAgICAgIGBQYWNrYWdlICR7SlNPTi5zdHJpbmdpZnkobmFtZSl9IHdhcyBub3QgZm91bmQgaW4gcGFja2FnZS5qc29uLmAsXG4gICAgKTtcbiAgfVxuXG4gIC8vIEZpbmQgb3V0IHRoZSBjdXJyZW50bHkgaW5zdGFsbGVkIHZlcnNpb24uIEVpdGhlciBmcm9tIHRoZSBwYWNrYWdlLmpzb24gb3IgdGhlIG5vZGVfbW9kdWxlcy9cbiAgLy8gVE9ETzogZmlndXJlIG91dCBhIHdheSB0byByZWFkIHBhY2thZ2UtbG9jay5qc29uIGFuZC9vciB5YXJuLmxvY2suXG4gIGxldCBpbnN0YWxsZWRWZXJzaW9uOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gIGNvbnN0IHBhY2thZ2VDb250ZW50ID0gdHJlZS5yZWFkKGAvbm9kZV9tb2R1bGVzLyR7bmFtZX0vcGFja2FnZS5qc29uYCk7XG4gIGlmIChwYWNrYWdlQ29udGVudCkge1xuICAgIGNvbnN0IGNvbnRlbnQgPSBKU09OLnBhcnNlKHBhY2thZ2VDb250ZW50LnRvU3RyaW5nKCkpIGFzIEpzb25TY2hlbWFGb3JOcG1QYWNrYWdlSnNvbkZpbGVzO1xuICAgIGluc3RhbGxlZFZlcnNpb24gPSBjb250ZW50LnZlcnNpb247XG4gIH1cbiAgaWYgKCFpbnN0YWxsZWRWZXJzaW9uKSB7XG4gICAgLy8gRmluZCB0aGUgdmVyc2lvbiBmcm9tIE5QTSB0aGF0IGZpdHMgdGhlIHJhbmdlIHRvIG1heC5cbiAgICBpbnN0YWxsZWRWZXJzaW9uID0gc2VtdmVyLm1heFNhdGlzZnlpbmcoXG4gICAgICBPYmplY3Qua2V5cyhucG1QYWNrYWdlSnNvbi52ZXJzaW9ucyksXG4gICAgICBwYWNrYWdlSnNvblJhbmdlLFxuICAgICk7XG4gIH1cblxuICBjb25zdCBpbnN0YWxsZWRQYWNrYWdlSnNvbiA9IG5wbVBhY2thZ2VKc29uLnZlcnNpb25zW2luc3RhbGxlZFZlcnNpb25dIHx8IHBhY2thZ2VDb250ZW50O1xuICBpZiAoIWluc3RhbGxlZFBhY2thZ2VKc29uKSB7XG4gICAgdGhyb3cgbmV3IFNjaGVtYXRpY3NFeGNlcHRpb24oXG4gICAgICBgQW4gdW5leHBlY3RlZCBlcnJvciBoYXBwZW5lZDsgcGFja2FnZSAke25hbWV9IGhhcyBubyB2ZXJzaW9uICR7aW5zdGFsbGVkVmVyc2lvbn0uYCxcbiAgICApO1xuICB9XG5cbiAgbGV0IHRhcmdldFZlcnNpb246IFZlcnNpb25SYW5nZSB8IHVuZGVmaW5lZCA9IHBhY2thZ2VzLmdldChuYW1lKTtcbiAgaWYgKHRhcmdldFZlcnNpb24pIHtcbiAgICBpZiAobnBtUGFja2FnZUpzb25bJ2Rpc3QtdGFncyddW3RhcmdldFZlcnNpb25dKSB7XG4gICAgICB0YXJnZXRWZXJzaW9uID0gbnBtUGFja2FnZUpzb25bJ2Rpc3QtdGFncyddW3RhcmdldFZlcnNpb25dIGFzIFZlcnNpb25SYW5nZTtcbiAgICB9IGVsc2UgaWYgKHRhcmdldFZlcnNpb24gPT0gJ25leHQnKSB7XG4gICAgICB0YXJnZXRWZXJzaW9uID0gbnBtUGFja2FnZUpzb25bJ2Rpc3QtdGFncyddWydsYXRlc3QnXSBhcyBWZXJzaW9uUmFuZ2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRhcmdldFZlcnNpb24gPSBzZW12ZXIubWF4U2F0aXNmeWluZyhcbiAgICAgICAgT2JqZWN0LmtleXMobnBtUGFja2FnZUpzb24udmVyc2lvbnMpLFxuICAgICAgICB0YXJnZXRWZXJzaW9uLFxuICAgICAgKSBhcyBWZXJzaW9uUmFuZ2U7XG4gICAgfVxuICB9XG5cbiAgaWYgKHRhcmdldFZlcnNpb24gJiYgc2VtdmVyLmx0ZSh0YXJnZXRWZXJzaW9uLCBpbnN0YWxsZWRWZXJzaW9uKSkge1xuICAgIGxvZ2dlci5kZWJ1ZyhgUGFja2FnZSAke25hbWV9IGFscmVhZHkgc2F0aXNmaWVkIGJ5IHBhY2thZ2UuanNvbiAoJHtwYWNrYWdlSnNvblJhbmdlfSkuYCk7XG4gICAgdGFyZ2V0VmVyc2lvbiA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIGNvbnN0IHRhcmdldDogUGFja2FnZVZlcnNpb25JbmZvIHwgdW5kZWZpbmVkID0gdGFyZ2V0VmVyc2lvblxuICAgID8ge1xuICAgICAgdmVyc2lvbjogdGFyZ2V0VmVyc2lvbixcbiAgICAgIHBhY2thZ2VKc29uOiBucG1QYWNrYWdlSnNvbi52ZXJzaW9uc1t0YXJnZXRWZXJzaW9uXSxcbiAgICAgIHVwZGF0ZU1ldGFkYXRhOiBfZ2V0VXBkYXRlTWV0YWRhdGEobnBtUGFja2FnZUpzb24udmVyc2lvbnNbdGFyZ2V0VmVyc2lvbl0sIGxvZ2dlciksXG4gICAgfVxuICAgIDogdW5kZWZpbmVkO1xuXG4gIC8vIENoZWNrIGlmIHRoZXJlJ3MgYW4gaW5zdGFsbGVkIHZlcnNpb24uXG4gIHJldHVybiB7XG4gICAgbmFtZSxcbiAgICBucG1QYWNrYWdlSnNvbixcbiAgICBpbnN0YWxsZWQ6IHtcbiAgICAgIHZlcnNpb246IGluc3RhbGxlZFZlcnNpb24gYXMgVmVyc2lvblJhbmdlLFxuICAgICAgcGFja2FnZUpzb246IGluc3RhbGxlZFBhY2thZ2VKc29uLFxuICAgICAgdXBkYXRlTWV0YWRhdGE6IF9nZXRVcGRhdGVNZXRhZGF0YShpbnN0YWxsZWRQYWNrYWdlSnNvbiwgbG9nZ2VyKSxcbiAgICB9LFxuICAgIHRhcmdldCxcbiAgICBwYWNrYWdlSnNvblJhbmdlLFxuICB9O1xufVxuXG5cbmZ1bmN0aW9uIF9idWlsZFBhY2thZ2VMaXN0KFxuICBvcHRpb25zOiBVcGRhdGVTY2hlbWEsXG4gIHByb2plY3REZXBzOiBNYXA8c3RyaW5nLCBWZXJzaW9uUmFuZ2U+LFxuICBsb2dnZXI6IGxvZ2dpbmcuTG9nZ2VyQXBpLFxuKTogTWFwPHN0cmluZywgVmVyc2lvblJhbmdlPiB7XG4gIC8vIFBhcnNlIHRoZSBwYWNrYWdlcyBvcHRpb25zIHRvIHNldCB0aGUgdGFyZ2V0ZWQgdmVyc2lvbi5cbiAgY29uc3QgcGFja2FnZXMgPSBuZXcgTWFwPHN0cmluZywgVmVyc2lvblJhbmdlPigpO1xuICBjb25zdCBjb21tYW5kTGluZVBhY2thZ2VzID1cbiAgICAob3B0aW9ucy5wYWNrYWdlcyAmJiBvcHRpb25zLnBhY2thZ2VzLmxlbmd0aCA+IDApXG4gICAgPyBvcHRpb25zLnBhY2thZ2VzXG4gICAgOiAob3B0aW9ucy5hbGwgPyBwcm9qZWN0RGVwcy5rZXlzKCkgOiBbXSk7XG5cbiAgZm9yIChjb25zdCBwa2cgb2YgY29tbWFuZExpbmVQYWNrYWdlcykge1xuICAgIC8vIFNwbGl0IHRoZSB2ZXJzaW9uIGFza2VkIG9uIGNvbW1hbmQgbGluZS5cbiAgICBjb25zdCBtID0gcGtnLm1hdGNoKC9eKCg/OkBbXi9dezEsMTAwfVxcLyk/W15AXXsxLDEwMH0pKD86QCguezEsMTAwfSkpPyQvKTtcbiAgICBpZiAoIW0pIHtcbiAgICAgIGxvZ2dlci53YXJuKGBJbnZhbGlkIHBhY2thZ2UgYXJndW1lbnQ6ICR7SlNPTi5zdHJpbmdpZnkocGtnKX0uIFNraXBwaW5nLmApO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgY29uc3QgWywgbnBtTmFtZSwgbWF5YmVWZXJzaW9uXSA9IG07XG5cbiAgICBjb25zdCB2ZXJzaW9uID0gcHJvamVjdERlcHMuZ2V0KG5wbU5hbWUpO1xuICAgIGlmICghdmVyc2lvbikge1xuICAgICAgbG9nZ2VyLndhcm4oYFBhY2thZ2Ugbm90IGluc3RhbGxlZDogJHtKU09OLnN0cmluZ2lmeShucG1OYW1lKX0uIFNraXBwaW5nLmApO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gVmVyaWZ5IHRoYXQgcGVvcGxlIGhhdmUgYW4gYWN0dWFsIHZlcnNpb24gaW4gdGhlIHBhY2thZ2UuanNvbiwgb3RoZXJ3aXNlIChsYWJlbCBvciBVUkwgb3JcbiAgICAvLyBnaXN0IG9yIC4uLikgd2UgZG9uJ3QgdXBkYXRlIGl0LlxuICAgIGlmIChcbiAgICAgIHZlcnNpb24uc3RhcnRzV2l0aCgnaHR0cDonKSAgLy8gSFRUUFxuICAgICAgfHwgdmVyc2lvbi5zdGFydHNXaXRoKCdmaWxlOicpICAvLyBMb2NhbCBmb2xkZXJcbiAgICAgIHx8IHZlcnNpb24uc3RhcnRzV2l0aCgnZ2l0OicpICAvLyBHSVQgdXJsXG4gICAgICB8fCB2ZXJzaW9uLm1hdGNoKC9eXFx3ezEsMTAwfVxcL1xcd3sxLDEwMH0vKSAgLy8gR2l0SHViJ3MgXCJ1c2VyL3JlcG9cIlxuICAgICAgfHwgdmVyc2lvbi5tYXRjaCgvXig/OlxcLnswLDJ9XFwvKVxcd3sxLDEwMH0vKSAgLy8gTG9jYWwgZm9sZGVyLCBtYXliZSByZWxhdGl2ZS5cbiAgICApIHtcbiAgICAgIC8vIFdlIG9ubHkgZG8gdGhhdCBmb3IgLS1hbGwuIE90aGVyd2lzZSB3ZSBoYXZlIHRoZSBpbnN0YWxsZWQgdmVyc2lvbiBhbmQgdGhlIHVzZXIgc3BlY2lmaWVkXG4gICAgICAvLyBpdCBvbiB0aGUgY29tbWFuZCBsaW5lLlxuICAgICAgaWYgKG9wdGlvbnMuYWxsKSB7XG4gICAgICAgIGxvZ2dlci53YXJuKFxuICAgICAgICAgIGBQYWNrYWdlICR7SlNPTi5zdHJpbmdpZnkobnBtTmFtZSl9IGhhcyBhIGN1c3RvbSB2ZXJzaW9uOiBgXG4gICAgICAgICAgKyBgJHtKU09OLnN0cmluZ2lmeSh2ZXJzaW9uKX0uIFNraXBwaW5nLmAsXG4gICAgICAgICk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHBhY2thZ2VzLnNldChucG1OYW1lLCAobWF5YmVWZXJzaW9uIHx8IChvcHRpb25zLm5leHQgPyAnbmV4dCcgOiAnbGF0ZXN0JykpIGFzIFZlcnNpb25SYW5nZSk7XG4gIH1cblxuICByZXR1cm4gcGFja2FnZXM7XG59XG5cblxuZnVuY3Rpb24gX2FkZFBhY2thZ2VHcm91cChcbiAgdHJlZTogVHJlZSxcbiAgcGFja2FnZXM6IE1hcDxzdHJpbmcsIFZlcnNpb25SYW5nZT4sXG4gIGFsbERlcGVuZGVuY2llczogUmVhZG9ubHlNYXA8c3RyaW5nLCBWZXJzaW9uUmFuZ2U+LFxuICBucG1QYWNrYWdlSnNvbjogTnBtUmVwb3NpdG9yeVBhY2thZ2VKc29uLFxuICBsb2dnZXI6IGxvZ2dpbmcuTG9nZ2VyQXBpLFxuKTogdm9pZCB7XG4gIGNvbnN0IG1heWJlUGFja2FnZSA9IHBhY2thZ2VzLmdldChucG1QYWNrYWdlSnNvbi5uYW1lKTtcbiAgaWYgKCFtYXliZVBhY2thZ2UpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCBpbmZvID0gX2J1aWxkUGFja2FnZUluZm8odHJlZSwgcGFja2FnZXMsIGFsbERlcGVuZGVuY2llcywgbnBtUGFja2FnZUpzb24sIGxvZ2dlcik7XG5cbiAgY29uc3QgdmVyc2lvbiA9IChpbmZvLnRhcmdldCAmJiBpbmZvLnRhcmdldC52ZXJzaW9uKVxuICAgICAgICAgICAgICAgfHwgbnBtUGFja2FnZUpzb25bJ2Rpc3QtdGFncyddW21heWJlUGFja2FnZV1cbiAgICAgICAgICAgICAgIHx8IG1heWJlUGFja2FnZTtcbiAgaWYgKCFucG1QYWNrYWdlSnNvbi52ZXJzaW9uc1t2ZXJzaW9uXSkge1xuICAgIHJldHVybjtcbiAgfVxuICBjb25zdCBuZ1VwZGF0ZU1ldGFkYXRhID0gbnBtUGFja2FnZUpzb24udmVyc2lvbnNbdmVyc2lvbl1bJ25nLXVwZGF0ZSddO1xuICBpZiAoIW5nVXBkYXRlTWV0YWRhdGEpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBsZXQgcGFja2FnZUdyb3VwID0gbmdVcGRhdGVNZXRhZGF0YVsncGFja2FnZUdyb3VwJ107XG4gIGlmICghcGFja2FnZUdyb3VwKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmIChBcnJheS5pc0FycmF5KHBhY2thZ2VHcm91cCkgJiYgIXBhY2thZ2VHcm91cC5zb21lKHggPT4gdHlwZW9mIHggIT0gJ3N0cmluZycpKSB7XG4gICAgcGFja2FnZUdyb3VwID0gcGFja2FnZUdyb3VwLnJlZHVjZSgoYWNjLCBjdXJyKSA9PiB7XG4gICAgICBhY2NbY3Vycl0gPSBtYXliZVBhY2thZ2U7XG5cbiAgICAgIHJldHVybiBhY2M7XG4gICAgfSwge30gYXMgeyBbbmFtZTogc3RyaW5nXTogc3RyaW5nIH0pO1xuICB9XG5cbiAgLy8gT25seSBuZWVkIHRvIGNoZWNrIGlmIGl0J3MgYW4gb2JqZWN0IGJlY2F1c2Ugd2Ugc2V0IGl0IHJpZ2h0IHRoZSB0aW1lIGJlZm9yZS5cbiAgaWYgKHR5cGVvZiBwYWNrYWdlR3JvdXAgIT0gJ29iamVjdCdcbiAgICAgIHx8IHBhY2thZ2VHcm91cCA9PT0gbnVsbFxuICAgICAgfHwgT2JqZWN0LnZhbHVlcyhwYWNrYWdlR3JvdXApLnNvbWUodiA9PiB0eXBlb2YgdiAhPSAnc3RyaW5nJylcbiAgKSB7XG4gICAgbG9nZ2VyLndhcm4oYHBhY2thZ2VHcm91cCBtZXRhZGF0YSBvZiBwYWNrYWdlICR7bnBtUGFja2FnZUpzb24ubmFtZX0gaXMgbWFsZm9ybWVkLmApO1xuXG4gICAgcmV0dXJuO1xuICB9XG5cbiAgT2JqZWN0LmtleXMocGFja2FnZUdyb3VwKVxuICAgIC5maWx0ZXIobmFtZSA9PiAhcGFja2FnZXMuaGFzKG5hbWUpKSAgLy8gRG9uJ3Qgb3ZlcnJpZGUgbmFtZXMgZnJvbSB0aGUgY29tbWFuZCBsaW5lLlxuICAgIC5maWx0ZXIobmFtZSA9PiBhbGxEZXBlbmRlbmNpZXMuaGFzKG5hbWUpKSAgLy8gUmVtb3ZlIHBhY2thZ2VzIHRoYXQgYXJlbid0IGluc3RhbGxlZC5cbiAgICAuZm9yRWFjaChuYW1lID0+IHtcbiAgICAgIHBhY2thZ2VzLnNldChuYW1lLCBwYWNrYWdlR3JvdXBbbmFtZV0pO1xuICAgIH0pO1xufVxuXG4vKipcbiAqIEFkZCBwZWVyIGRlcGVuZGVuY2llcyBvZiBwYWNrYWdlcyBvbiB0aGUgY29tbWFuZCBsaW5lIHRvIHRoZSBsaXN0IG9mIHBhY2thZ2VzIHRvIHVwZGF0ZS5cbiAqIFdlIGRvbid0IGRvIHZlcmlmaWNhdGlvbiBvZiB0aGUgdmVyc2lvbnMgaGVyZSBhcyB0aGlzIHdpbGwgYmUgZG9uZSBieSBhIGxhdGVyIHN0ZXAgKGFuZCBjYW5cbiAqIGJlIGlnbm9yZWQgYnkgdGhlIC0tZm9yY2UgZmxhZykuXG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBfYWRkUGVlckRlcGVuZGVuY2llcyhcbiAgdHJlZTogVHJlZSxcbiAgcGFja2FnZXM6IE1hcDxzdHJpbmcsIFZlcnNpb25SYW5nZT4sXG4gIGFsbERlcGVuZGVuY2llczogUmVhZG9ubHlNYXA8c3RyaW5nLCBWZXJzaW9uUmFuZ2U+LFxuICBucG1QYWNrYWdlSnNvbjogTnBtUmVwb3NpdG9yeVBhY2thZ2VKc29uLFxuICBsb2dnZXI6IGxvZ2dpbmcuTG9nZ2VyQXBpLFxuKTogdm9pZCB7XG4gIGNvbnN0IG1heWJlUGFja2FnZSA9IHBhY2thZ2VzLmdldChucG1QYWNrYWdlSnNvbi5uYW1lKTtcbiAgaWYgKCFtYXliZVBhY2thZ2UpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCBpbmZvID0gX2J1aWxkUGFja2FnZUluZm8odHJlZSwgcGFja2FnZXMsIGFsbERlcGVuZGVuY2llcywgbnBtUGFja2FnZUpzb24sIGxvZ2dlcik7XG5cbiAgY29uc3QgdmVyc2lvbiA9IChpbmZvLnRhcmdldCAmJiBpbmZvLnRhcmdldC52ZXJzaW9uKVxuICAgICAgICAgICAgICAgfHwgbnBtUGFja2FnZUpzb25bJ2Rpc3QtdGFncyddW21heWJlUGFja2FnZV1cbiAgICAgICAgICAgICAgIHx8IG1heWJlUGFja2FnZTtcbiAgaWYgKCFucG1QYWNrYWdlSnNvbi52ZXJzaW9uc1t2ZXJzaW9uXSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IHBhY2thZ2VKc29uID0gbnBtUGFja2FnZUpzb24udmVyc2lvbnNbdmVyc2lvbl07XG4gIGNvbnN0IGVycm9yID0gZmFsc2U7XG5cbiAgZm9yIChjb25zdCBbcGVlciwgcmFuZ2VdIG9mIE9iamVjdC5lbnRyaWVzKHBhY2thZ2VKc29uLnBlZXJEZXBlbmRlbmNpZXMgfHwge30pKSB7XG4gICAgaWYgKCFwYWNrYWdlcy5oYXMocGVlcikpIHtcbiAgICAgIHBhY2thZ2VzLnNldChwZWVyLCByYW5nZSBhcyBWZXJzaW9uUmFuZ2UpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChlcnJvcikge1xuICAgIHRocm93IG5ldyBTY2hlbWF0aWNzRXhjZXB0aW9uKCdBbiBlcnJvciBvY2N1cmVkLCBzZWUgYWJvdmUuJyk7XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBfZ2V0QWxsRGVwZW5kZW5jaWVzKHRyZWU6IFRyZWUpOiBNYXA8c3RyaW5nLCBWZXJzaW9uUmFuZ2U+IHtcbiAgY29uc3QgcGFja2FnZUpzb25Db250ZW50ID0gdHJlZS5yZWFkKCcvcGFja2FnZS5qc29uJyk7XG4gIGlmICghcGFja2FnZUpzb25Db250ZW50KSB7XG4gICAgdGhyb3cgbmV3IFNjaGVtYXRpY3NFeGNlcHRpb24oJ0NvdWxkIG5vdCBmaW5kIGEgcGFja2FnZS5qc29uLiBBcmUgeW91IGluIGEgTm9kZSBwcm9qZWN0PycpO1xuICB9XG5cbiAgbGV0IHBhY2thZ2VKc29uOiBKc29uU2NoZW1hRm9yTnBtUGFja2FnZUpzb25GaWxlcztcbiAgdHJ5IHtcbiAgICBwYWNrYWdlSnNvbiA9IEpTT04ucGFyc2UocGFja2FnZUpzb25Db250ZW50LnRvU3RyaW5nKCkpIGFzIEpzb25TY2hlbWFGb3JOcG1QYWNrYWdlSnNvbkZpbGVzO1xuICB9IGNhdGNoIChlKSB7XG4gICAgdGhyb3cgbmV3IFNjaGVtYXRpY3NFeGNlcHRpb24oJ3BhY2thZ2UuanNvbiBjb3VsZCBub3QgYmUgcGFyc2VkOiAnICsgZS5tZXNzYWdlKTtcbiAgfVxuXG4gIHJldHVybiBuZXcgTWFwPHN0cmluZywgVmVyc2lvblJhbmdlPihbXG4gICAgLi4uT2JqZWN0LmVudHJpZXMocGFja2FnZUpzb24ucGVlckRlcGVuZGVuY2llcyB8fCB7fSksXG4gICAgLi4uT2JqZWN0LmVudHJpZXMocGFja2FnZUpzb24uZGV2RGVwZW5kZW5jaWVzIHx8IHt9KSxcbiAgICAuLi5PYmplY3QuZW50cmllcyhwYWNrYWdlSnNvbi5kZXBlbmRlbmNpZXMgfHwge30pLFxuICBdIGFzIFtzdHJpbmcsIFZlcnNpb25SYW5nZV1bXSk7XG59XG5cbmZ1bmN0aW9uIF9mb3JtYXRWZXJzaW9uKHZlcnNpb246IHN0cmluZyB8IHVuZGVmaW5lZCkge1xuICBpZiAodmVyc2lvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIGlmICghdmVyc2lvbi5tYXRjaCgvXlxcZHsxLDMwfVxcLlxcZHsxLDMwfVxcLlxcZHsxLDMwfS8pKSB7XG4gICAgdmVyc2lvbiArPSAnLjAnO1xuICB9XG4gIGlmICghdmVyc2lvbi5tYXRjaCgvXlxcZHsxLDMwfVxcLlxcZHsxLDMwfVxcLlxcZHsxLDMwfS8pKSB7XG4gICAgdmVyc2lvbiArPSAnLjAnO1xuICB9XG4gIGlmICghc2VtdmVyLnZhbGlkKHZlcnNpb24pKSB7XG4gICAgdGhyb3cgbmV3IFNjaGVtYXRpY3NFeGNlcHRpb24oYEludmFsaWQgbWlncmF0aW9uIHZlcnNpb246ICR7SlNPTi5zdHJpbmdpZnkodmVyc2lvbil9YCk7XG4gIH1cblxuICByZXR1cm4gdmVyc2lvbjtcbn1cblxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihvcHRpb25zOiBVcGRhdGVTY2hlbWEpOiBSdWxlIHtcbiAgaWYgKCFvcHRpb25zLnBhY2thZ2VzKSB7XG4gICAgLy8gV2UgY2Fubm90IGp1c3QgcmV0dXJuIHRoaXMgYmVjYXVzZSB3ZSBuZWVkIHRvIGZldGNoIHRoZSBwYWNrYWdlcyBmcm9tIE5QTSBzdGlsbCBmb3IgdGhlXG4gICAgLy8gaGVscC9ndWlkZSB0byBzaG93LlxuICAgIG9wdGlvbnMucGFja2FnZXMgPSBbXTtcbiAgfSBlbHNlIHtcbiAgICAvLyBXZSBzcGxpdCBldmVyeSBwYWNrYWdlcyBieSBjb21tYXMgdG8gYWxsb3cgcGVvcGxlIHRvIHBhc3MgaW4gbXVsdGlwbGUgYW5kIG1ha2UgaXQgYW4gYXJyYXkuXG4gICAgb3B0aW9ucy5wYWNrYWdlcyA9IG9wdGlvbnMucGFja2FnZXMucmVkdWNlKChhY2MsIGN1cnIpID0+IHtcbiAgICAgIHJldHVybiBhY2MuY29uY2F0KGN1cnIuc3BsaXQoJywnKSk7XG4gICAgfSwgW10gYXMgc3RyaW5nW10pO1xuICB9XG5cbiAgaWYgKG9wdGlvbnMubWlncmF0ZU9ubHkgJiYgb3B0aW9ucy5mcm9tKSB7XG4gICAgaWYgKG9wdGlvbnMucGFja2FnZXMubGVuZ3RoICE9PSAxKSB7XG4gICAgICB0aHJvdyBuZXcgU2NoZW1hdGljc0V4Y2VwdGlvbignLS1mcm9tIHJlcXVpcmVzIHRoYXQgb25seSBhIHNpbmdsZSBwYWNrYWdlIGJlIHBhc3NlZC4nKTtcbiAgICB9XG4gIH1cblxuICBvcHRpb25zLmZyb20gPSBfZm9ybWF0VmVyc2lvbihvcHRpb25zLmZyb20pO1xuICBvcHRpb25zLnRvID0gX2Zvcm1hdFZlcnNpb24ob3B0aW9ucy50byk7XG5cbiAgcmV0dXJuICh0cmVlOiBUcmVlLCBjb250ZXh0OiBTY2hlbWF0aWNDb250ZXh0KSA9PiB7XG4gICAgY29uc3QgbG9nZ2VyID0gY29udGV4dC5sb2dnZXI7XG4gICAgY29uc3QgYWxsRGVwZW5kZW5jaWVzID0gX2dldEFsbERlcGVuZGVuY2llcyh0cmVlKTtcbiAgICBjb25zdCBwYWNrYWdlcyA9IF9idWlsZFBhY2thZ2VMaXN0KG9wdGlvbnMsIGFsbERlcGVuZGVuY2llcywgbG9nZ2VyKTtcbiAgICBjb25zdCB1c2luZ1lhcm4gPSBvcHRpb25zLnBhY2thZ2VNYW5hZ2VyID09PSAneWFybic7XG5cbiAgICByZXR1cm4gb2JzZXJ2YWJsZUZyb20oWy4uLmFsbERlcGVuZGVuY2llcy5rZXlzKCldKS5waXBlKFxuICAgICAgLy8gR3JhYiBhbGwgcGFja2FnZS5qc29uIGZyb20gdGhlIG5wbSByZXBvc2l0b3J5LiBUaGlzIHJlcXVpcmVzIGEgbG90IG9mIEhUVFAgY2FsbHMgc28gd2VcbiAgICAgIC8vIHRyeSB0byBwYXJhbGxlbGl6ZSBhcyBtYW55IGFzIHBvc3NpYmxlLlxuICAgICAgbWVyZ2VNYXAoZGVwTmFtZSA9PiBnZXROcG1QYWNrYWdlSnNvbihcbiAgICAgICAgZGVwTmFtZSxcbiAgICAgICAgbG9nZ2VyLFxuICAgICAgICB7IHJlZ2lzdHJ5VXJsOiBvcHRpb25zLnJlZ2lzdHJ5LCB1c2luZ1lhcm4sIHZlcmJvc2U6IG9wdGlvbnMudmVyYm9zZSB9LFxuICAgICAgKSksXG5cbiAgICAgIC8vIEJ1aWxkIGEgbWFwIG9mIGFsbCBkZXBlbmRlbmNpZXMgYW5kIHRoZWlyIHBhY2thZ2VKc29uLlxuICAgICAgcmVkdWNlPE5wbVJlcG9zaXRvcnlQYWNrYWdlSnNvbiwgTWFwPHN0cmluZywgTnBtUmVwb3NpdG9yeVBhY2thZ2VKc29uPj4oXG4gICAgICAgIChhY2MsIG5wbVBhY2thZ2VKc29uKSA9PiB7XG4gICAgICAgICAgLy8gSWYgdGhlIHBhY2thZ2Ugd2FzIG5vdCBmb3VuZCBvbiB0aGUgcmVnaXN0cnkuIEl0IGNvdWxkIGJlIHByaXZhdGUsIHNvIHdlIHdpbGwganVzdFxuICAgICAgICAgIC8vIGlnbm9yZS4gSWYgdGhlIHBhY2thZ2Ugd2FzIHBhcnQgb2YgdGhlIGxpc3QsIHdlIHdpbGwgZXJyb3Igb3V0LCBidXQgd2lsbCBzaW1wbHkgaWdub3JlXG4gICAgICAgICAgLy8gaWYgaXQncyBlaXRoZXIgbm90IHJlcXVlc3RlZCAoc28ganVzdCBwYXJ0IG9mIHBhY2thZ2UuanNvbi4gc2lsZW50bHkpIG9yIGlmIGl0J3MgYVxuICAgICAgICAgIC8vIGAtLWFsbGAgc2l0dWF0aW9uLiBUaGVyZSBpcyBhbiBlZGdlIGNhc2UgaGVyZSB3aGVyZSBhIHB1YmxpYyBwYWNrYWdlIHBlZXIgZGVwZW5kcyBvbiBhXG4gICAgICAgICAgLy8gcHJpdmF0ZSBvbmUsIGJ1dCBpdCdzIHJhcmUgZW5vdWdoLlxuICAgICAgICAgIGlmICghbnBtUGFja2FnZUpzb24ubmFtZSkge1xuICAgICAgICAgICAgaWYgKHBhY2thZ2VzLmhhcyhucG1QYWNrYWdlSnNvbi5yZXF1ZXN0ZWROYW1lKSkge1xuICAgICAgICAgICAgICBpZiAob3B0aW9ucy5hbGwpIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIud2FybihgUGFja2FnZSAke0pTT04uc3RyaW5naWZ5KG5wbVBhY2thZ2VKc29uLnJlcXVlc3RlZE5hbWUpfSB3YXMgbm90IGBcbiAgICAgICAgICAgICAgICAgICsgJ2ZvdW5kIG9uIHRoZSByZWdpc3RyeS4gU2tpcHBpbmcuJyk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFNjaGVtYXRpY3NFeGNlcHRpb24oXG4gICAgICAgICAgICAgICAgICBgUGFja2FnZSAke0pTT04uc3RyaW5naWZ5KG5wbVBhY2thZ2VKc29uLnJlcXVlc3RlZE5hbWUpfSB3YXMgbm90IGZvdW5kIG9uIHRoZSBgXG4gICAgICAgICAgICAgICAgICArICdyZWdpc3RyeS4gQ2Fubm90IGNvbnRpbnVlIGFzIHRoaXMgbWF5IGJlIGFuIGVycm9yLicpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFjYy5zZXQobnBtUGFja2FnZUpzb24ubmFtZSwgbnBtUGFja2FnZUpzb24pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiBhY2M7XG4gICAgICAgIH0sXG4gICAgICAgIG5ldyBNYXA8c3RyaW5nLCBOcG1SZXBvc2l0b3J5UGFja2FnZUpzb24+KCksXG4gICAgICApLFxuXG4gICAgICBtYXAobnBtUGFja2FnZUpzb25NYXAgPT4ge1xuICAgICAgICAvLyBBdWdtZW50IHRoZSBjb21tYW5kIGxpbmUgcGFja2FnZSBsaXN0IHdpdGggcGFja2FnZUdyb3VwcyBhbmQgZm9yd2FyZCBwZWVyIGRlcGVuZGVuY2llcy5cbiAgICAgICAgLy8gRWFjaCBhZGRlZCBwYWNrYWdlIG1heSB1bmNvdmVyIG5ldyBwYWNrYWdlIGdyb3VwcyBhbmQgcGVlciBkZXBlbmRlbmNpZXMsIHNvIHdlIG11c3RcbiAgICAgICAgLy8gcmVwZWF0IHRoaXMgcHJvY2VzcyB1bnRpbCB0aGUgcGFja2FnZSBsaXN0IHN0YWJpbGl6ZXMuXG4gICAgICAgIGxldCBsYXN0UGFja2FnZXNTaXplO1xuICAgICAgICBkbyB7XG4gICAgICAgICAgbGFzdFBhY2thZ2VzU2l6ZSA9IHBhY2thZ2VzLnNpemU7XG4gICAgICAgICAgbnBtUGFja2FnZUpzb25NYXAuZm9yRWFjaCgobnBtUGFja2FnZUpzb24pID0+IHtcbiAgICAgICAgICAgIF9hZGRQYWNrYWdlR3JvdXAodHJlZSwgcGFja2FnZXMsIGFsbERlcGVuZGVuY2llcywgbnBtUGFja2FnZUpzb24sIGxvZ2dlcik7XG4gICAgICAgICAgICBfYWRkUGVlckRlcGVuZGVuY2llcyh0cmVlLCBwYWNrYWdlcywgYWxsRGVwZW5kZW5jaWVzLCBucG1QYWNrYWdlSnNvbiwgbG9nZ2VyKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSB3aGlsZSAocGFja2FnZXMuc2l6ZSA+IGxhc3RQYWNrYWdlc1NpemUpO1xuXG4gICAgICAgIC8vIEJ1aWxkIHRoZSBQYWNrYWdlSW5mbyBmb3IgZWFjaCBtb2R1bGUuXG4gICAgICAgIGNvbnN0IHBhY2thZ2VJbmZvTWFwID0gbmV3IE1hcDxzdHJpbmcsIFBhY2thZ2VJbmZvPigpO1xuICAgICAgICBucG1QYWNrYWdlSnNvbk1hcC5mb3JFYWNoKChucG1QYWNrYWdlSnNvbikgPT4ge1xuICAgICAgICAgIHBhY2thZ2VJbmZvTWFwLnNldChcbiAgICAgICAgICAgIG5wbVBhY2thZ2VKc29uLm5hbWUsXG4gICAgICAgICAgICBfYnVpbGRQYWNrYWdlSW5mbyh0cmVlLCBwYWNrYWdlcywgYWxsRGVwZW5kZW5jaWVzLCBucG1QYWNrYWdlSnNvbiwgbG9nZ2VyKSxcbiAgICAgICAgICApO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gcGFja2FnZUluZm9NYXA7XG4gICAgICB9KSxcblxuICAgICAgc3dpdGNoTWFwKGluZm9NYXAgPT4ge1xuICAgICAgICAvLyBOb3cgdGhhdCB3ZSBoYXZlIGFsbCB0aGUgaW5mb3JtYXRpb24sIGNoZWNrIHRoZSBmbGFncy5cbiAgICAgICAgaWYgKHBhY2thZ2VzLnNpemUgPiAwKSB7XG4gICAgICAgICAgaWYgKG9wdGlvbnMubWlncmF0ZU9ubHkgJiYgb3B0aW9ucy5mcm9tICYmIG9wdGlvbnMucGFja2FnZXMpIHtcbiAgICAgICAgICAgIHJldHVybiBfbWlncmF0ZU9ubHkoXG4gICAgICAgICAgICAgIGluZm9NYXAuZ2V0KG9wdGlvbnMucGFja2FnZXNbMF0pLFxuICAgICAgICAgICAgICBjb250ZXh0LFxuICAgICAgICAgICAgICBvcHRpb25zLmZyb20sXG4gICAgICAgICAgICAgIG9wdGlvbnMudG8sXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IHN1YmxvZyA9IG5ldyBsb2dnaW5nLkxldmVsQ2FwTG9nZ2VyKFxuICAgICAgICAgICAgJ3ZhbGlkYXRpb24nLFxuICAgICAgICAgICAgbG9nZ2VyLmNyZWF0ZUNoaWxkKCcnKSxcbiAgICAgICAgICAgICd3YXJuJyxcbiAgICAgICAgICApO1xuICAgICAgICAgIF92YWxpZGF0ZVVwZGF0ZVBhY2thZ2VzKGluZm9NYXAsICEhb3B0aW9ucy5mb3JjZSwgc3VibG9nKTtcblxuICAgICAgICAgIHJldHVybiBfcGVyZm9ybVVwZGF0ZSh0cmVlLCBjb250ZXh0LCBpbmZvTWFwLCBsb2dnZXIsICEhb3B0aW9ucy5taWdyYXRlT25seSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIF91c2FnZU1lc3NhZ2Uob3B0aW9ucywgaW5mb01hcCwgbG9nZ2VyKTtcbiAgICAgICAgfVxuICAgICAgfSksXG5cbiAgICAgIHN3aXRjaE1hcCgoKSA9PiBvZih0cmVlKSksXG4gICAgKTtcbiAgfTtcbn1cbiJdfQ==