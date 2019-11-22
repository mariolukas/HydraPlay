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
const tools_1 = require("@angular-devkit/schematics/tools");
const fs_1 = require("fs");
const path_1 = require("path");
const interface_1 = require("../models/interface");
class CommandJsonPathException extends core_1.BaseException {
    constructor(path, name) {
        super(`File ${path} was not found while constructing the subcommand ${name}.`);
        this.path = path;
        this.name = name;
    }
}
exports.CommandJsonPathException = CommandJsonPathException;
function _getEnumFromValue(value, enumeration, defaultValue) {
    if (typeof value !== 'string') {
        return defaultValue;
    }
    if (Object.values(enumeration).indexOf(value) !== -1) {
        // TODO: this should be unknown
        // tslint:disable-next-line:no-any
        return value;
    }
    return defaultValue;
}
async function parseJsonSchemaToSubCommandDescription(name, jsonPath, registry, schema) {
    const options = await parseJsonSchemaToOptions(registry, schema);
    const aliases = [];
    if (core_1.json.isJsonArray(schema.$aliases)) {
        schema.$aliases.forEach(value => {
            if (typeof value == 'string') {
                aliases.push(value);
            }
        });
    }
    if (core_1.json.isJsonArray(schema.aliases)) {
        schema.aliases.forEach(value => {
            if (typeof value == 'string') {
                aliases.push(value);
            }
        });
    }
    if (typeof schema.alias == 'string') {
        aliases.push(schema.alias);
    }
    let longDescription = '';
    if (typeof schema.$longDescription == 'string' && schema.$longDescription) {
        const ldPath = path_1.resolve(path_1.dirname(jsonPath), schema.$longDescription);
        try {
            longDescription = fs_1.readFileSync(ldPath, 'utf-8');
        }
        catch (e) {
            throw new CommandJsonPathException(ldPath, name);
        }
    }
    let usageNotes = '';
    if (typeof schema.$usageNotes == 'string' && schema.$usageNotes) {
        const unPath = path_1.resolve(path_1.dirname(jsonPath), schema.$usageNotes);
        try {
            usageNotes = fs_1.readFileSync(unPath, 'utf-8');
        }
        catch (e) {
            throw new CommandJsonPathException(unPath, name);
        }
    }
    const description = '' + (schema.description === undefined ? '' : schema.description);
    return Object.assign({ name,
        description }, (longDescription ? { longDescription } : {}), (usageNotes ? { usageNotes } : {}), { options,
        aliases });
}
exports.parseJsonSchemaToSubCommandDescription = parseJsonSchemaToSubCommandDescription;
async function parseJsonSchemaToCommandDescription(name, jsonPath, registry, schema) {
    const subcommand = await parseJsonSchemaToSubCommandDescription(name, jsonPath, registry, schema);
    // Before doing any work, let's validate the implementation.
    if (typeof schema.$impl != 'string') {
        throw new Error(`Command ${name} has an invalid implementation.`);
    }
    const ref = new tools_1.ExportStringRef(schema.$impl, path_1.dirname(jsonPath));
    const impl = ref.ref;
    if (impl === undefined || typeof impl !== 'function') {
        throw new Error(`Command ${name} has an invalid implementation.`);
    }
    const scope = _getEnumFromValue(schema.$scope, interface_1.CommandScope, interface_1.CommandScope.Default);
    const hidden = !!schema.$hidden;
    return Object.assign({}, subcommand, { scope,
        hidden,
        impl });
}
exports.parseJsonSchemaToCommandDescription = parseJsonSchemaToCommandDescription;
async function parseJsonSchemaToOptions(registry, schema) {
    const options = [];
    function visitor(current, pointer, parentSchema) {
        if (!parentSchema) {
            // Ignore root.
            return;
        }
        else if (pointer.split(/\/(?:properties|items|definitions)\//g).length > 2) {
            // Ignore subitems (objects or arrays).
            return;
        }
        else if (core_1.json.isJsonArray(current)) {
            return;
        }
        if (pointer.indexOf('/not/') != -1) {
            // We don't support anyOf/not.
            throw new Error('The "not" keyword is not supported in JSON Schema.');
        }
        const ptr = core_1.json.schema.parseJsonPointer(pointer);
        const name = ptr[ptr.length - 1];
        if (ptr[ptr.length - 2] != 'properties') {
            // Skip any non-property items.
            return;
        }
        const typeSet = core_1.json.schema.getTypesOfSchema(current);
        if (typeSet.size == 0) {
            throw new Error('Cannot find type of schema.');
        }
        // We only support number, string or boolean (or array of those), so remove everything else.
        const types = [...typeSet].filter(x => {
            switch (x) {
                case 'boolean':
                case 'number':
                case 'string':
                    return true;
                case 'array':
                    // Only include arrays if they're boolean, string or number.
                    if (core_1.json.isJsonObject(current.items)
                        && typeof current.items.type == 'string'
                        && ['boolean', 'number', 'string'].includes(current.items.type)) {
                        return true;
                    }
                    return false;
                default:
                    return false;
            }
        }).map(x => _getEnumFromValue(x, interface_1.OptionType, interface_1.OptionType.String));
        if (types.length == 0) {
            // This means it's not usable on the command line. e.g. an Object.
            return;
        }
        // Only keep enum values we support (booleans, numbers and strings).
        const enumValues = (core_1.json.isJsonArray(current.enum) && current.enum || []).filter(x => {
            switch (typeof x) {
                case 'boolean':
                case 'number':
                case 'string':
                    return true;
                default:
                    return false;
            }
        });
        let defaultValue = undefined;
        if (current.default !== undefined) {
            switch (types[0]) {
                case 'string':
                    if (typeof current.default == 'string') {
                        defaultValue = current.default;
                    }
                    break;
                case 'number':
                    if (typeof current.default == 'number') {
                        defaultValue = current.default;
                    }
                    break;
                case 'boolean':
                    if (typeof current.default == 'boolean') {
                        defaultValue = current.default;
                    }
                    break;
            }
        }
        const type = types[0];
        const $default = current.$default;
        const $defaultIndex = (core_1.json.isJsonObject($default) && $default['$source'] == 'argv')
            ? $default['index'] : undefined;
        const positional = typeof $defaultIndex == 'number'
            ? $defaultIndex : undefined;
        const required = core_1.json.isJsonArray(current.required)
            ? current.required.indexOf(name) != -1 : false;
        const aliases = core_1.json.isJsonArray(current.aliases) ? [...current.aliases].map(x => '' + x)
            : current.alias ? ['' + current.alias] : [];
        const format = typeof current.format == 'string' ? current.format : undefined;
        const visible = current.visible === undefined || current.visible === true;
        const hidden = !!current.hidden || !visible;
        // Deprecated is set only if it's true or a string.
        const xDeprecated = current['x-deprecated'];
        const deprecated = (xDeprecated === true || typeof xDeprecated == 'string')
            ? xDeprecated : undefined;
        const option = Object.assign({ name, description: '' + (current.description === undefined ? '' : current.description) }, types.length == 1 ? { type } : { type, types }, defaultValue !== undefined ? { default: defaultValue } : {}, enumValues && enumValues.length > 0 ? { enum: enumValues } : {}, { required,
            aliases }, format !== undefined ? { format } : {}, { hidden }, deprecated !== undefined ? { deprecated } : {}, positional !== undefined ? { positional } : {});
        options.push(option);
    }
    const flattenedSchema = await registry.flatten(schema).toPromise();
    core_1.json.schema.visitJsonSchema(flattenedSchema, visitor);
    // Sort by positional.
    return options.sort((a, b) => {
        if (a.positional) {
            if (b.positional) {
                return a.positional - b.positional;
            }
            else {
                return 1;
            }
        }
        else if (b.positional) {
            return -1;
        }
        else {
            return 0;
        }
    });
}
exports.parseJsonSchemaToOptions = parseJsonSchemaToOptions;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbi1zY2hlbWEuanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL2FuZ3VsYXIvY2xpL3V0aWxpdGllcy9qc29uLXNjaGVtYS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7R0FNRztBQUNILCtDQUEyRDtBQUMzRCw0REFBbUU7QUFDbkUsMkJBQWtDO0FBQ2xDLCtCQUF3QztBQUN4QyxtREFRNkI7QUFHN0IsTUFBYSx3QkFBeUIsU0FBUSxvQkFBYTtJQUN6RCxZQUE0QixJQUFZLEVBQWtCLElBQVk7UUFDcEUsS0FBSyxDQUFDLFFBQVEsSUFBSSxvREFBb0QsSUFBSSxHQUFHLENBQUMsQ0FBQztRQURyRCxTQUFJLEdBQUosSUFBSSxDQUFRO1FBQWtCLFNBQUksR0FBSixJQUFJLENBQVE7SUFFdEUsQ0FBQztDQUNGO0FBSkQsNERBSUM7QUFFRCxTQUFTLGlCQUFpQixDQUN4QixLQUFxQixFQUNyQixXQUFjLEVBQ2QsWUFBZTtJQUVmLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxFQUFFO1FBQzdCLE9BQU8sWUFBWSxDQUFDO0tBQ3JCO0lBRUQsSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtRQUNwRCwrQkFBK0I7UUFDL0Isa0NBQWtDO1FBQ2xDLE9BQU8sS0FBaUIsQ0FBQztLQUMxQjtJQUVELE9BQU8sWUFBWSxDQUFDO0FBQ3RCLENBQUM7QUFFTSxLQUFLLFVBQVUsc0NBQXNDLENBQzFELElBQVksRUFDWixRQUFnQixFQUNoQixRQUFvQyxFQUNwQyxNQUF1QjtJQUV2QixNQUFNLE9BQU8sR0FBRyxNQUFNLHdCQUF3QixDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUVqRSxNQUFNLE9BQU8sR0FBYSxFQUFFLENBQUM7SUFDN0IsSUFBSSxXQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENB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QUMsQ0FBQyxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQ2xELENBQUM7UUFFRixPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3ZCLENBQUM7SUFFRCxNQUFNLGVBQWUsR0FBRyxNQUFNLFFBQVEsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDbkUsV0FBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsZUFBZSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBRXRELHNCQUFzQjtJQUN0QixPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDM0IsSUFBSSxDQUFDLENBQUMsVUFBVSxFQUFFO1lBQ2hCLElBQUksQ0FBQyxDQUFDLFVBQVUsRUFBRTtnQkFDaEIsT0FBTyxDQUFDLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxVQUFVLENBQUM7YUFDcEM7aUJBQU07Z0JBQ0wsT0FBTyxDQUFDLENBQUM7YUFDVjtTQUNGO2FBQU0sSUFBSSxDQUFDLENBQUMsVUFBVSxFQUFFO1lBQ3ZCLE9BQU8sQ0FBQyxDQUFDLENBQUM7U0FDWDthQUFNO1lBQ0wsT0FBTyxDQUFDLENBQUM7U0FDVjtJQUNILENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQTVKRCw0REE0SkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgeyBCYXNlRXhjZXB0aW9uLCBqc29uIH0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L2NvcmUnO1xuaW1wb3J0IHsgRXhwb3J0U3RyaW5nUmVmIH0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L3NjaGVtYXRpY3MvdG9vbHMnO1xuaW1wb3J0IHsgcmVhZEZpbGVTeW5jIH0gZnJvbSAnZnMnO1xuaW1wb3J0IHsgZGlybmFtZSwgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtcbiAgQ29tbWFuZENvbnN0cnVjdG9yLFxuICBDb21tYW5kRGVzY3JpcHRpb24sXG4gIENvbW1hbmRTY29wZSxcbiAgT3B0aW9uLFxuICBPcHRpb25UeXBlLFxuICBTdWJDb21tYW5kRGVzY3JpcHRpb24sXG4gIFZhbHVlLFxufSBmcm9tICcuLi9tb2RlbHMvaW50ZXJmYWNlJztcblxuXG5leHBvcnQgY2xhc3MgQ29tbWFuZEpzb25QYXRoRXhjZXB0aW9uIGV4dGVuZHMgQmFzZUV4Y2VwdGlvbiB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyByZWFkb25seSBwYXRoOiBzdHJpbmcsIHB1YmxpYyByZWFkb25seSBuYW1lOiBzdHJpbmcpIHtcbiAgICBzdXBlcihgRmlsZSAke3BhdGh9IHdhcyBub3QgZm91bmQgd2hpbGUgY29uc3RydWN0aW5nIHRoZSBzdWJjb21tYW5kICR7bmFtZX0uYCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gX2dldEVudW1Gcm9tVmFsdWU8RSwgVCBleHRlbmRzIEVba2V5b2YgRV0+KFxuICB2YWx1ZToganNvbi5Kc29uVmFsdWUsXG4gIGVudW1lcmF0aW9uOiBFLFxuICBkZWZhdWx0VmFsdWU6IFQsXG4pOiBUIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gZGVmYXVsdFZhbHVlO1xuICB9XG5cbiAgaWYgKE9iamVjdC52YWx1ZXMoZW51bWVyYXRpb24pLmluZGV4T2YodmFsdWUpICE9PSAtMSkge1xuICAgIC8vIFRPRE86IHRoaXMgc2hvdWxkIGJlIHVua25vd25cbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYW55XG4gICAgcmV0dXJuIHZhbHVlIGFzIGFueSBhcyBUO1xuICB9XG5cbiAgcmV0dXJuIGRlZmF1bHRWYWx1ZTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHBhcnNlSnNvblNjaGVtYVRvU3ViQ29tbWFuZERlc2NyaXB0aW9uKFxuICBuYW1lOiBzdHJpbmcsXG4gIGpzb25QYXRoOiBzdHJpbmcsXG4gIHJlZ2lzdHJ5OiBqc29uLnNjaGVtYS5TY2hlbWFSZWdpc3RyeSxcbiAgc2NoZW1hOiBqc29uLkpzb25PYmplY3QsXG4pOiBQcm9taXNlPFN1YkNvbW1hbmREZXNjcmlwdGlvbj4ge1xuICBjb25zdCBvcHRpb25zID0gYXdhaXQgcGFyc2VKc29uU2NoZW1hVG9PcHRpb25zKHJlZ2lzdHJ5LCBzY2hlbWEpO1xuXG4gIGNvbnN0IGFsaWFzZXM6IHN0cmluZ1tdID0gW107XG4gIGlmIChqc29uLmlzSnNvbkFycmF5KHNjaGVtYS4kYWxpYXNlcykpIHtcbiAgICBzY2hlbWEuJGFsaWFzZXMuZm9yRWFjaCh2YWx1ZSA9PiB7XG4gICAgICBpZiAodHlwZW9mIHZhbHVlID09ICdzdHJpbmcnKSB7XG4gICAgICAgIGFsaWFzZXMucHVzaCh2YWx1ZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbiAgaWYgKGpzb24uaXNKc29uQXJyYXkoc2NoZW1hLmFsaWFzZXMpKSB7XG4gICAgc2NoZW1hLmFsaWFzZXMuZm9yRWFjaCh2YWx1ZSA9PiB7XG4gICAgICBpZiAodHlwZW9mIHZhbHVlID09ICdzdHJpbmcnKSB7XG4gICAgICAgIGFsaWFzZXMucHVzaCh2YWx1ZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbiAgaWYgKHR5cGVvZiBzY2hlbWEuYWxpYXMgPT0gJ3N0cmluZycpIHtcbiAgICBhbGlhc2VzLnB1c2goc2NoZW1hLmFsaWFzKTtcbiAgfVxuXG4gIGxldCBsb25nRGVzY3JpcHRpb24gPSAnJztcbiAgaWYgKHR5cGVvZiBzY2hlbWEuJGxvbmdEZXNjcmlwdGlvbiA9PSAnc3RyaW5nJyAmJiBzY2hlbWEuJGxvbmdEZXNjcmlwdGlvbikge1xuICAgIGNvbnN0IGxkUGF0aCA9IHJlc29sdmUoZGlybmFtZShqc29uUGF0aCksIHNjaGVtYS4kbG9uZ0Rlc2NyaXB0aW9uKTtcbiAgICB0cnkge1xuICAgICAgbG9uZ0Rlc2NyaXB0aW9uID0gcmVhZEZpbGVTeW5jKGxkUGF0aCwgJ3V0Zi04Jyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhyb3cgbmV3IENvbW1hbmRKc29uUGF0aEV4Y2VwdGlvbihsZFBhdGgsIG5hbWUpO1xuICAgIH1cbiAgfVxuICBsZXQgdXNhZ2VOb3RlcyA9ICcnO1xuICBpZiAodHlwZW9mIHNjaGVtYS4kdXNhZ2VOb3RlcyA9PSAnc3RyaW5nJyAmJiBzY2hlbWEuJHVzYWdlTm90ZXMpIHtcbiAgICBjb25zdCB1blBhdGggPSByZXNvbHZlKGRpcm5hbWUoanNvblBhdGgpLCBzY2hlbWEuJHVzYWdlTm90ZXMpO1xuICAgIHRyeSB7XG4gICAgICB1c2FnZU5vdGVzID0gcmVhZEZpbGVTeW5jKHVuUGF0aCwgJ3V0Zi04Jyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhyb3cgbmV3IENvbW1hbmRKc29uUGF0aEV4Y2VwdGlvbih1blBhdGgsIG5hbWUpO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IGRlc2NyaXB0aW9uID0gJycgKyAoc2NoZW1hLmRlc2NyaXB0aW9uID09PSB1bmRlZmluZWQgPyAnJyA6IHNjaGVtYS5kZXNjcmlwdGlvbik7XG5cbiAgcmV0dXJuIHtcbiAgICBuYW1lLFxuICAgIGRlc2NyaXB0aW9uLFxuICAgIC4uLihsb25nRGVzY3JpcHRpb24gPyB7IGxvbmdEZXNjcmlwdGlvbiB9IDoge30pLFxuICAgIC4uLih1c2FnZU5vdGVzID8geyB1c2FnZU5vdGVzIH0gOiB7fSksXG4gICAgb3B0aW9ucyxcbiAgICBhbGlhc2VzLFxuICB9O1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcGFyc2VKc29uU2NoZW1hVG9Db21tYW5kRGVzY3JpcHRpb24oXG4gIG5hbWU6IHN0cmluZyxcbiAganNvblBhdGg6IHN0cmluZyxcbiAgcmVnaXN0cnk6IGpzb24uc2NoZW1hLlNjaGVtYVJlZ2lzdHJ5LFxuICBzY2hlbWE6IGpzb24uSnNvbk9iamVjdCxcbik6IFByb21pc2U8Q29tbWFuZERlc2NyaXB0aW9uPiB7XG4gIGNvbnN0IHN1YmNvbW1hbmQgPVxuICAgIGF3YWl0IHBhcnNlSnNvblNjaGVtYVRvU3ViQ29tbWFuZERlc2NyaXB0aW9uKG5hbWUsIGpzb25QYXRoLCByZWdpc3RyeSwgc2NoZW1hKTtcblxuICAvLyBCZWZvcmUgZG9pbmcgYW55IHdvcmssIGxldCdzIHZhbGlkYXRlIHRoZSBpbXBsZW1lbnRhdGlvbi5cbiAgaWYgKHR5cGVvZiBzY2hlbWEuJGltcGwgIT0gJ3N0cmluZycpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYENvbW1hbmQgJHtuYW1lfSBoYXMgYW4gaW52YWxpZCBpbXBsZW1lbnRhdGlvbi5gKTtcbiAgfVxuICBjb25zdCByZWYgPSBuZXcgRXhwb3J0U3RyaW5nUmVmPENvbW1hbmRDb25zdHJ1Y3Rvcj4oc2NoZW1hLiRpbXBsLCBkaXJuYW1lKGpzb25QYXRoKSk7XG4gIGNvbnN0IGltcGwgPSByZWYucmVmO1xuXG4gIGlmIChpbXBsID09PSB1bmRlZmluZWQgfHwgdHlwZW9mIGltcGwgIT09ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYENvbW1hbmQgJHtuYW1lfSBoYXMgYW4gaW52YWxpZCBpbXBsZW1lbnRhdGlvbi5gKTtcbiAgfVxuXG4gIGNvbnN0IHNjb3BlID0gX2dldEVudW1Gcm9tVmFsdWUoc2NoZW1hLiRzY29wZSwgQ29tbWFuZFNjb3BlLCBDb21tYW5kU2NvcGUuRGVmYXVsdCk7XG4gIGNvbnN0IGhpZGRlbiA9ICEhc2NoZW1hLiRoaWRkZW47XG5cbiAgcmV0dXJuIHtcbiAgICAuLi5zdWJjb21tYW5kLFxuICAgIHNjb3BlLFxuICAgIGhpZGRlbixcbiAgICBpbXBsLFxuICB9O1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcGFyc2VKc29uU2NoZW1hVG9PcHRpb25zKFxuICByZWdpc3RyeToganNvbi5zY2hlbWEuU2NoZW1hUmVnaXN0cnksXG4gIHNjaGVtYToganNvbi5Kc29uT2JqZWN0LFxuKTogUHJvbWlzZTxPcHRpb25bXT4ge1xuICBjb25zdCBvcHRpb25zOiBPcHRpb25bXSA9IFtdO1xuXG4gIGZ1bmN0aW9uIHZpc2l0b3IoXG4gICAgY3VycmVudDoganNvbi5Kc29uT2JqZWN0IHwganNvbi5Kc29uQXJyYXksXG4gICAgcG9pbnRlcjoganNvbi5zY2hlbWEuSnNvblBvaW50ZXIsXG4gICAgcGFyZW50U2NoZW1hPzoganNvbi5Kc29uT2JqZWN0IHwganNvbi5Kc29uQXJyYXksXG4gICkge1xuICAgIGlmICghcGFyZW50U2NoZW1hKSB7XG4gICAgICAvLyBJZ25vcmUgcm9vdC5cbiAgICAgIHJldHVybjtcbiAgICB9IGVsc2UgaWYgKHBvaW50ZXIuc3BsaXQoL1xcLyg/OnByb3BlcnRpZXN8aXRlbXN8ZGVmaW5pdGlvbnMpXFwvL2cpLmxlbmd0aCA+IDIpIHtcbiAgICAgIC8vIElnbm9yZSBzdWJpdGVtcyAob2JqZWN0cyBvciBhcnJheXMpLlxuICAgICAgcmV0dXJuO1xuICAgIH0gZWxzZSBpZiAoanNvbi5pc0pzb25BcnJheShjdXJyZW50KSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChwb2ludGVyLmluZGV4T2YoJy9ub3QvJykgIT0gLTEpIHtcbiAgICAgIC8vIFdlIGRvbid0IHN1cHBvcnQgYW55T2Yvbm90LlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGUgXCJub3RcIiBrZXl3b3JkIGlzIG5vdCBzdXBwb3J0ZWQgaW4gSlNPTiBTY2hlbWEuJyk7XG4gICAgfVxuXG4gICAgY29uc3QgcHRyID0ganNvbi5zY2hlbWEucGFyc2VKc29uUG9pbnRlcihwb2ludGVyKTtcbiAgICBjb25zdCBuYW1lID0gcHRyW3B0ci5sZW5ndGggLSAxXTtcblxuICAgIGlmIChwdHJbcHRyLmxlbmd0aCAtIDJdICE9ICdwcm9wZXJ0aWVzJykge1xuICAgICAgLy8gU2tpcCBhbnkgbm9uLXByb3BlcnR5IGl0ZW1zLlxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHR5cGVTZXQgPSBqc29uLnNjaGVtYS5nZXRUeXBlc09mU2NoZW1hKGN1cnJlbnQpO1xuXG4gICAgaWYgKHR5cGVTZXQuc2l6ZSA9PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBmaW5kIHR5cGUgb2Ygc2NoZW1hLicpO1xuICAgIH1cblxuICAgIC8vIFdlIG9ubHkgc3VwcG9ydCBudW1iZXIsIHN0cmluZyBvciBib29sZWFuIChvciBhcnJheSBvZiB0aG9zZSksIHNvIHJlbW92ZSBldmVyeXRoaW5nIGVsc2UuXG4gICAgY29uc3QgdHlwZXMgPSBbLi4udHlwZVNldF0uZmlsdGVyKHggPT4ge1xuICAgICAgc3dpdGNoICh4KSB7XG4gICAgICAgIGNhc2UgJ2Jvb2xlYW4nOlxuICAgICAgICBjYXNlICdudW1iZXInOlxuICAgICAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgICAgIHJldHVybiB0cnVlO1xuXG4gICAgICAgIGNhc2UgJ2FycmF5JzpcbiAgICAgICAgICAvLyBPbmx5IGluY2x1ZGUgYXJyYXlzIGlmIHRoZXkncmUgYm9vbGVhbiwgc3RyaW5nIG9yIG51bWJlci5cbiAgICAgICAgICBpZiAoanNvbi5pc0pzb25PYmplY3QoY3VycmVudC5pdGVtcylcbiAgICAgICAgICAgICAgJiYgdHlwZW9mIGN1cnJlbnQuaXRlbXMudHlwZSA9PSAnc3RyaW5nJ1xuICAgICAgICAgICAgICAmJiBbJ2Jvb2xlYW4nLCAnbnVtYmVyJywgJ3N0cmluZyddLmluY2x1ZGVzKGN1cnJlbnQuaXRlbXMudHlwZSkpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9KS5tYXAoeCA9PiBfZ2V0RW51bUZyb21WYWx1ZSh4LCBPcHRpb25UeXBlLCBPcHRpb25UeXBlLlN0cmluZykpO1xuXG4gICAgaWYgKHR5cGVzLmxlbmd0aCA9PSAwKSB7XG4gICAgICAvLyBUaGlzIG1lYW5zIGl0J3Mgbm90IHVzYWJsZSBvbiB0aGUgY29tbWFuZCBsaW5lLiBlLmcuIGFuIE9iamVjdC5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBPbmx5IGtlZXAgZW51bSB2YWx1ZXMgd2Ugc3VwcG9ydCAoYm9vbGVhbnMsIG51bWJlcnMgYW5kIHN0cmluZ3MpLlxuICAgIGNvbnN0IGVudW1WYWx1ZXMgPSAoanNvbi5pc0pzb25BcnJheShjdXJyZW50LmVudW0pICYmIGN1cnJlbnQuZW51bSB8fCBbXSkuZmlsdGVyKHggPT4ge1xuICAgICAgc3dpdGNoICh0eXBlb2YgeCkge1xuICAgICAgICBjYXNlICdib29sZWFuJzpcbiAgICAgICAgY2FzZSAnbnVtYmVyJzpcbiAgICAgICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcblxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9KSBhcyBWYWx1ZVtdO1xuXG4gICAgbGV0IGRlZmF1bHRWYWx1ZTogc3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBpZiAoY3VycmVudC5kZWZhdWx0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHN3aXRjaCAodHlwZXNbMF0pIHtcbiAgICAgICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgICAgICBpZiAodHlwZW9mIGN1cnJlbnQuZGVmYXVsdCA9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgZGVmYXVsdFZhbHVlID0gY3VycmVudC5kZWZhdWx0O1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnbnVtYmVyJzpcbiAgICAgICAgICBpZiAodHlwZW9mIGN1cnJlbnQuZGVmYXVsdCA9PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgZGVmYXVsdFZhbHVlID0gY3VycmVudC5kZWZhdWx0O1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnYm9vbGVhbic6XG4gICAgICAgICAgaWYgKHR5cGVvZiBjdXJyZW50LmRlZmF1bHQgPT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgICAgICBkZWZhdWx0VmFsdWUgPSBjdXJyZW50LmRlZmF1bHQ7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHR5cGUgPSB0eXBlc1swXTtcbiAgICBjb25zdCAkZGVmYXVsdCA9IGN1cnJlbnQuJGRlZmF1bHQ7XG4gICAgY29uc3QgJGRlZmF1bHRJbmRleCA9IChqc29uLmlzSnNvbk9iamVjdCgkZGVmYXVsdCkgJiYgJGRlZmF1bHRbJyRzb3VyY2UnXSA9PSAnYXJndicpXG4gICAgICA/ICRkZWZhdWx0WydpbmRleCddIDogdW5kZWZpbmVkO1xuICAgIGNvbnN0IHBvc2l0aW9uYWw6IG51bWJlciB8IHVuZGVmaW5lZCA9IHR5cGVvZiAkZGVmYXVsdEluZGV4ID09ICdudW1iZXInXG4gICAgICA/ICRkZWZhdWx0SW5kZXggOiB1bmRlZmluZWQ7XG5cbiAgICBjb25zdCByZXF1aXJlZCA9IGpzb24uaXNKc29uQXJyYXkoY3VycmVudC5yZXF1aXJlZClcbiAgICAgID8gY3VycmVudC5yZXF1aXJlZC5pbmRleE9mKG5hbWUpICE9IC0xIDogZmFsc2U7XG4gICAgY29uc3QgYWxpYXNlcyA9IGpzb24uaXNKc29uQXJyYXkoY3VycmVudC5hbGlhc2VzKSA/IFsuLi5jdXJyZW50LmFsaWFzZXNdLm1hcCh4ID0+ICcnICsgeClcbiAgICAgIDogY3VycmVudC5hbGlhcyA/IFsnJyArIGN1cnJlbnQuYWxpYXNdIDogW107XG4gICAgY29uc3QgZm9ybWF0ID0gdHlwZW9mIGN1cnJlbnQuZm9ybWF0ID09ICdzdHJpbmcnID8gY3VycmVudC5mb3JtYXQgOiB1bmRlZmluZWQ7XG4gICAgY29uc3QgdmlzaWJsZSA9IGN1cnJlbnQudmlzaWJsZSA9PT0gdW5kZWZpbmVkIHx8IGN1cnJlbnQudmlzaWJsZSA9PT0gdHJ1ZTtcbiAgICBjb25zdCBoaWRkZW4gPSAhIWN1cnJlbnQuaGlkZGVuIHx8ICF2aXNpYmxlO1xuXG4gICAgLy8gRGVwcmVjYXRlZCBpcyBzZXQgb25seSBpZiBpdCdzIHRydWUgb3IgYSBzdHJpbmcuXG4gICAgY29uc3QgeERlcHJlY2F0ZWQgPSBjdXJyZW50Wyd4LWRlcHJlY2F0ZWQnXTtcbiAgICBjb25zdCBkZXByZWNhdGVkID0gKHhEZXByZWNhdGVkID09PSB0cnVlIHx8IHR5cGVvZiB4RGVwcmVjYXRlZCA9PSAnc3RyaW5nJylcbiAgICAgID8geERlcHJlY2F0ZWQgOiB1bmRlZmluZWQ7XG5cbiAgICBjb25zdCBvcHRpb246IE9wdGlvbiA9IHtcbiAgICAgIG5hbWUsXG4gICAgICBkZXNjcmlwdGlvbjogJycgKyAoY3VycmVudC5kZXNjcmlwdGlvbiA9PT0gdW5kZWZpbmVkID8gJycgOiBjdXJyZW50LmRlc2NyaXB0aW9uKSxcbiAgICAgIC4uLnR5cGVzLmxlbmd0aCA9PSAxID8geyB0eXBlIH0gOiB7IHR5cGUsIHR5cGVzIH0sXG4gICAgICAuLi5kZWZhdWx0VmFsdWUgIT09IHVuZGVmaW5lZCA/IHsgZGVmYXVsdDogZGVmYXVsdFZhbHVlIH0gOiB7fSxcbiAgICAgIC4uLmVudW1WYWx1ZXMgJiYgZW51bVZhbHVlcy5sZW5ndGggPiAwID8geyBlbnVtOiBlbnVtVmFsdWVzIH0gOiB7fSxcbiAgICAgIHJlcXVpcmVkLFxuICAgICAgYWxpYXNlcyxcbiAgICAgIC4uLmZvcm1hdCAhPT0gdW5kZWZpbmVkID8geyBmb3JtYXQgfSA6IHt9LFxuICAgICAgaGlkZGVuLFxuICAgICAgLi4uZGVwcmVjYXRlZCAhPT0gdW5kZWZpbmVkID8geyBkZXByZWNhdGVkIH0gOiB7fSxcbiAgICAgIC4uLnBvc2l0aW9uYWwgIT09IHVuZGVmaW5lZCA/IHsgcG9zaXRpb25hbCB9IDoge30sXG4gICAgfTtcblxuICAgIG9wdGlvbnMucHVzaChvcHRpb24pO1xuICB9XG5cbiAgY29uc3QgZmxhdHRlbmVkU2NoZW1hID0gYXdhaXQgcmVnaXN0cnkuZmxhdHRlbihzY2hlbWEpLnRvUHJvbWlzZSgpO1xuICBqc29uLnNjaGVtYS52aXNpdEpzb25TY2hlbWEoZmxhdHRlbmVkU2NoZW1hLCB2aXNpdG9yKTtcblxuICAvLyBTb3J0IGJ5IHBvc2l0aW9uYWwuXG4gIHJldHVybiBvcHRpb25zLnNvcnQoKGEsIGIpID0+IHtcbiAgICBpZiAoYS5wb3NpdGlvbmFsKSB7XG4gICAgICBpZiAoYi5wb3NpdGlvbmFsKSB7XG4gICAgICAgIHJldHVybiBhLnBvc2l0aW9uYWwgLSBiLnBvc2l0aW9uYWw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gMTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGIucG9zaXRpb25hbCkge1xuICAgICAgcmV0dXJuIC0xO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gMDtcbiAgICB9XG4gIH0pO1xufVxuIl19