"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 *
 */
const core_1 = require("@angular-devkit/core");
const interface_1 = require("./interface");
class ParseArgumentException extends core_1.BaseException {
    constructor(comments, parsed, ignored) {
        super(`One or more errors occured while parsing arguments:\n  ${comments.join('\n  ')}`);
        this.comments = comments;
        this.parsed = parsed;
        this.ignored = ignored;
    }
}
exports.ParseArgumentException = ParseArgumentException;
function _coerceType(str, type, v) {
    switch (type) {
        case interface_1.OptionType.Any:
            if (Array.isArray(v)) {
                return v.concat(str || '');
            }
            return _coerceType(str, interface_1.OptionType.Boolean, v) !== undefined
                ? _coerceType(str, interface_1.OptionType.Boolean, v)
                : _coerceType(str, interface_1.OptionType.Number, v) !== undefined
                    ? _coerceType(str, interface_1.OptionType.Number, v)
                    : _coerceType(str, interface_1.OptionType.String, v);
        case interface_1.OptionType.String:
            return str || '';
        case interface_1.OptionType.Boolean:
            switch (str) {
                case 'false':
                    return false;
                case undefined:
                case '':
                case 'true':
                    return true;
                default:
                    return undefined;
            }
        case interface_1.OptionType.Number:
            if (str === undefined) {
                return 0;
            }
            else if (str === '') {
                return undefined;
            }
            else if (Number.isFinite(+str)) {
                return +str;
            }
            else {
                return undefined;
            }
        case interface_1.OptionType.Array:
            return Array.isArray(v)
                ? v.concat(str || '')
                : v === undefined
                    ? [str || '']
                    : [v + '', str || ''];
        default:
            return undefined;
    }
}
function _coerce(str, o, v) {
    if (!o) {
        return _coerceType(str, interface_1.OptionType.Any, v);
    }
    else {
        const types = o.types || [o.type];
        // Try all the types one by one and pick the first one that returns a value contained in the
        // enum. If there's no enum, just return the first one that matches.
        for (const type of types) {
            const maybeResult = _coerceType(str, type, v);
            if (maybeResult !== undefined) {
                if (!o.enum || o.enum.includes(maybeResult)) {
                    return maybeResult;
                }
            }
        }
        return undefined;
    }
}
function _getOptionFromName(name, options) {
    const camelName = /(-|_)/.test(name)
        ? core_1.strings.camelize(name)
        : name;
    for (const option of options) {
        if (option.name === name || option.name === camelName) {
            return option;
        }
        if (option.aliases.some(x => x === name || x === camelName)) {
            return option;
        }
    }
    return undefined;
}
function _removeLeadingDashes(key) {
    const from = key.startsWith('--') ? 2 : key.startsWith('-') ? 1 : 0;
    return key.substr(from);
}
function _assignOption(arg, nextArg, { options, parsedOptions, leftovers, ignored, errors, warnings }) {
    const from = arg.startsWith('--') ? 2 : 1;
    let consumedNextArg = false;
    let key = arg.substr(from);
    let option = null;
    let value = '';
    const i = arg.indexOf('=');
    // If flag is --no-abc AND there's no equal sign.
    if (i == -1) {
        if (key.startsWith('no')) {
            // Only use this key if the option matching the rest is a boolean.
            const from = key.startsWith('no-') ? 3 : 2;
            const maybeOption = _getOptionFromName(core_1.strings.camelize(key.substr(from)), options);
            if (maybeOption && maybeOption.type == 'boolean') {
                value = 'false';
                option = maybeOption;
            }
        }
        if (option === null) {
            // Set it to true if it's a boolean and the next argument doesn't match true/false.
            const maybeOption = _getOptionFromName(key, options);
            if (maybeOption) {
                value = nextArg;
                let shouldShift = true;
                if (value && value.startsWith('-')) {
                    // Verify if not having a value results in a correct parse, if so don't shift.
                    if (_coerce(undefined, maybeOption) !== undefined) {
                        shouldShift = false;
                    }
                }
                // Only absorb it if it leads to a better value.
                if (shouldShift && _coerce(value, maybeOption) !== undefined) {
                    consumedNextArg = true;
                }
                else {
                    value = '';
                }
                option = maybeOption;
            }
        }
    }
    else {
        key = arg.substring(0, i);
        option = _getOptionFromName(_removeLeadingDashes(key), options) || null;
        if (option) {
            value = arg.substring(i + 1);
        }
    }
    if (option === null) {
        if (nextArg && !nextArg.startsWith('-')) {
            leftovers.push(arg, nextArg);
            consumedNextArg = true;
        }
        else {
            leftovers.push(arg);
        }
    }
    else {
        const v = _coerce(value, option, parsedOptions[option.name]);
        if (v !== undefined) {
            if (parsedOptions[option.name] !== v) {
                if (parsedOptions[option.name] !== undefined) {
                    warnings.push(`Option ${JSON.stringify(option.name)} was already specified with value `
                        + `${JSON.stringify(parsedOptions[option.name])}. The new value ${JSON.stringify(v)} `
                        + `will override it.`);
                }
                parsedOptions[option.name] = v;
                if (option.deprecated !== undefined && option.deprecated !== false) {
                    warnings.push(`Option ${JSON.stringify(option.name)} is deprecated${typeof option.deprecated == 'string' ? ': ' + option.deprecated : '.'}`);
                }
            }
        }
        else {
            let error = `Argument ${key} could not be parsed using value ${JSON.stringify(value)}.`;
            if (option.enum) {
                error += ` Valid values are: ${option.enum.map(x => JSON.stringify(x)).join(', ')}.`;
            }
            else {
                error += `Valid type(s) is: ${(option.types || [option.type]).join(', ')}`;
            }
            errors.push(error);
            ignored.push(arg);
        }
    }
    return consumedNextArg;
}
/**
 * Parse the arguments in a consistent way, but without having any option definition. This tries
 * to assess what the user wants in a free form. For example, using `--name=false` will set the
 * name properties to a boolean type.
 * This should only be used when there's no schema available or if a schema is "true" (anything is
 * valid).
 *
 * @param args Argument list to parse.
 * @returns An object that contains a property per flags from the args.
 */
function parseFreeFormArguments(args) {
    const parsedOptions = {};
    const leftovers = [];
    for (let arg = args.shift(); arg !== undefined; arg = args.shift()) {
        if (arg == '--') {
            leftovers.push(...args);
            break;
        }
        if (arg.startsWith('--')) {
            const eqSign = arg.indexOf('=');
            let name;
            let value;
            if (eqSign !== -1) {
                name = arg.substring(2, eqSign);
                value = arg.substring(eqSign + 1);
            }
            else {
                name = arg.substr(2);
                value = args.shift();
            }
            const v = _coerce(value, null, parsedOptions[name]);
            if (v !== undefined) {
                parsedOptions[name] = v;
            }
        }
        else if (arg.startsWith('-')) {
            arg.split('').forEach(x => parsedOptions[x] = true);
        }
        else {
            leftovers.push(arg);
        }
    }
    parsedOptions['--'] = leftovers;
    return parsedOptions;
}
exports.parseFreeFormArguments = parseFreeFormArguments;
/**
 * Parse the arguments in a consistent way, from a list of standardized options.
 * The result object will have a key per option name, with the `_` key reserved for positional
 * arguments, and `--` will contain everything that did not match. Any key that don't have an
 * option will be pushed back in `--` and removed from the object. If you need to validate that
 * there's no additionalProperties, you need to check the `--` key.
 *
 * @param args The argument array to parse.
 * @param options List of supported options. {@see Option}.
 * @param logger Logger to use to warn users.
 * @returns An object that contains a property per option.
 */
function parseArguments(args, options, logger) {
    if (options === null) {
        options = [];
    }
    const leftovers = [];
    const positionals = [];
    const parsedOptions = {};
    const ignored = [];
    const errors = [];
    const warnings = [];
    const state = { options, parsedOptions, positionals, leftovers, ignored, errors, warnings };
    for (let argIndex = 0; argIndex < args.length; argIndex++) {
        const arg = args[argIndex];
        let consumedNextArg = false;
        if (arg == '--') {
            // If we find a --, we're done.
            leftovers.push(...args.slice(argIndex + 1));
            break;
        }
        if (arg.startsWith('--')) {
            consumedNextArg = _assignOption(arg, args[argIndex + 1], state);
        }
        else if (arg.startsWith('-')) {
            // Argument is of form -abcdef.  Starts at 1 because we skip the `-`.
            for (let i = 1; i < arg.length; i++) {
                const flag = arg[i];
                // If the next character is an '=', treat it as a long flag.
                if (arg[i + 1] == '=') {
                    const f = '-' + flag + arg.slice(i + 1);
                    consumedNextArg = _assignOption(f, args[argIndex + 1], state);
                    break;
                }
                // Treat the last flag as `--a` (as if full flag but just one letter). We do this in
                // the loop because it saves us a check to see if the arg is just `-`.
                if (i == arg.length - 1) {
                    const arg = '-' + flag;
                    consumedNextArg = _assignOption(arg, args[argIndex + 1], state);
                }
                else {
                    const maybeOption = _getOptionFromName(flag, options);
                    if (maybeOption) {
                        const v = _coerce(undefined, maybeOption, parsedOptions[maybeOption.name]);
                        if (v !== undefined) {
                            parsedOptions[maybeOption.name] = v;
                        }
                    }
                }
            }
        }
        else {
            positionals.push(arg);
        }
        if (consumedNextArg) {
            argIndex++;
        }
    }
    // Deal with positionals.
    // TODO(hansl): this is by far the most complex piece of code in this file. Try to refactor it
    //   simpler.
    if (positionals.length > 0) {
        let pos = 0;
        for (let i = 0; i < positionals.length;) {
            let found = false;
            let incrementPos = false;
            let incrementI = true;
            // We do this with a found flag because more than 1 option could have the same positional.
            for (const option of options) {
                // If any option has this positional and no value, AND fit the type, we need to remove it.
                if (option.positional === pos) {
                    const coercedValue = _coerce(positionals[i], option, parsedOptions[option.name]);
                    if (parsedOptions[option.name] === undefined && coercedValue !== undefined) {
                        parsedOptions[option.name] = coercedValue;
                        found = true;
                    }
                    else {
                        incrementI = false;
                    }
                    incrementPos = true;
                }
            }
            if (found) {
                positionals.splice(i--, 1);
            }
            if (incrementPos) {
                pos++;
            }
            if (incrementI) {
                i++;
            }
        }
    }
    if (positionals.length > 0 || leftovers.length > 0) {
        parsedOptions['--'] = [...positionals, ...leftovers];
    }
    if (warnings.length > 0 && logger) {
        warnings.forEach(message => logger.warn(message));
    }
    if (errors.length > 0) {
        throw new ParseArgumentException(errors, parsedOptions, ignored);
    }
    return parsedOptions;
}
exports.parseArguments = parseArguments;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2VyLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJwYWNrYWdlcy9hbmd1bGFyL2NsaS9tb2RlbHMvcGFyc2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7R0FPRztBQUNILCtDQUF1RTtBQUN2RSwyQ0FBbUU7QUFHbkUsTUFBYSxzQkFBdUIsU0FBUSxvQkFBYTtJQUN2RCxZQUNrQixRQUFrQixFQUNsQixNQUFpQixFQUNqQixPQUFpQjtRQUVqQyxLQUFLLENBQUMsMERBQTBELFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBSnpFLGFBQVEsR0FBUixRQUFRLENBQVU7UUFDbEIsV0FBTSxHQUFOLE1BQU0sQ0FBVztRQUNqQixZQUFPLEdBQVAsT0FBTyxDQUFVO0lBR25DLENBQUM7Q0FDRjtBQVJELHdEQVFDO0FBR0QsU0FBUyxXQUFXLENBQUMsR0FBdUIsRUFBRSxJQUFnQixFQUFFLENBQVM7SUFDdkUsUUFBUSxJQUFJLEVBQUU7UUFDWixLQUFLLHNCQUFVLENBQUMsR0FBRztZQUNqQixJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ3BCLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLENBQUM7YUFDNUI7WUFFRCxPQUFPLFdBQVcsQ0FBQyxHQUFHLEVBQUUsc0JBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLEtBQUssU0FBUztnQkFDMUQsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsc0JBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO2dCQUN6QyxDQUFDLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRSxzQkFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsS0FBSyxTQUFTO29CQUNwRCxDQUFDLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRSxzQkFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7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QztxQkFDZDt5QkFBTTt3QkFDTCxVQUFVLEdBQUcsS0FBSyxDQUFDO3FCQUNwQjtvQkFDRCxZQUFZLEdBQUcsSUFBSSxDQUFDO2lCQUNyQjthQUNGO1lBRUQsSUFBSSxLQUFLLEVBQUU7Z0JBQ1QsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUM1QjtZQUNELElBQUksWUFBWSxFQUFFO2dCQUNoQixHQUFHLEVBQUUsQ0FBQzthQUNQO1lBQ0QsSUFBSSxVQUFVLEVBQUU7Z0JBQ2QsQ0FBQyxFQUFFLENBQUM7YUFDTDtTQUNGO0tBQ0Y7SUFFRCxJQUFJLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1FBQ2xELGFBQWEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsV0FBVyxFQUFFLEdBQUcsU0FBUyxDQUFDLENBQUM7S0FDdEQ7SUFFRCxJQUFJLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLE1BQU0sRUFBRTtRQUNqQyxRQUFRLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0tBQ25EO0lBRUQsSUFBSSxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtRQUNyQixNQUFNLElBQUksc0JBQXNCLENBQUMsTUFBTSxFQUFFLGFBQWEsRUFBRSxPQUFPLENBQUMsQ0FBQztLQUNsRTtJQUVELE9BQU8sYUFBYSxDQUFDO0FBQ3ZCLENBQUM7QUFuSEQsd0NBbUhDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqXG4gKi9cbmltcG9ydCB7IEJhc2VFeGNlcHRpb24sIGxvZ2dpbmcsIHN0cmluZ3MgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvY29yZSc7XG5pbXBvcnQgeyBBcmd1bWVudHMsIE9wdGlvbiwgT3B0aW9uVHlwZSwgVmFsdWUgfSBmcm9tICcuL2ludGVyZmFjZSc7XG5cblxuZXhwb3J0IGNsYXNzIFBhcnNlQXJndW1lbnRFeGNlcHRpb24gZXh0ZW5kcyBCYXNlRXhjZXB0aW9uIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIHJlYWRvbmx5IGNvbW1lbnRzOiBzdHJpbmdbXSxcbiAgICBwdWJsaWMgcmVhZG9ubHkgcGFyc2VkOiBBcmd1bWVudHMsXG4gICAgcHVibGljIHJlYWRvbmx5IGlnbm9yZWQ6IHN0cmluZ1tdLFxuICApIHtcbiAgICBzdXBlcihgT25lIG9yIG1vcmUgZXJyb3JzIG9jY3VyZWQgd2hpbGUgcGFyc2luZyBhcmd1bWVudHM6XFxuICAke2NvbW1lbnRzLmpvaW4oJ1xcbiAgJyl9YCk7XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBfY29lcmNlVHlwZShzdHI6IHN0cmluZyB8IHVuZGVmaW5lZCwgdHlwZTogT3B0aW9uVHlwZSwgdj86IFZhbHVlKTogVmFsdWUgfCB1bmRlZmluZWQge1xuICBzd2l0Y2ggKHR5cGUpIHtcbiAgICBjYXNlIE9wdGlvblR5cGUuQW55OlxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkodikpIHtcbiAgICAgICAgcmV0dXJuIHYuY29uY2F0KHN0ciB8fCAnJyk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBfY29lcmNlVHlwZShzdHIsIE9wdGlvblR5cGUuQm9vbGVhbiwgdikgIT09IHVuZGVmaW5lZFxuICAgICAgICA/IF9jb2VyY2VUeXBlKHN0ciwgT3B0aW9uVHlwZS5Cb29sZWFuLCB2KVxuICAgICAgICA6IF9jb2VyY2VUeXBlKHN0ciwgT3B0aW9uVHlwZS5OdW1iZXIsIHYpICE9PSB1bmRlZmluZWRcbiAgICAgICAgICA/IF9jb2VyY2VUeXBlKHN0ciwgT3B0aW9uVHlwZS5OdW1iZXIsIHYpXG4gICAgICAgICAgOiBfY29lcmNlVHlwZShzdHIsIE9wdGlvblR5cGUuU3RyaW5nLCB2KTtcblxuICAgIGNhc2UgT3B0aW9uVHlwZS5TdHJpbmc6XG4gICAgICByZXR1cm4gc3RyIHx8ICcnO1xuXG4gICAgY2FzZSBPcHRpb25UeXBlLkJvb2xlYW46XG4gICAgICBzd2l0Y2ggKHN0cikge1xuICAgICAgICBjYXNlICdmYWxzZSc6XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIGNhc2UgdW5kZWZpbmVkOlxuICAgICAgICBjYXNlICcnOlxuICAgICAgICBjYXNlICd0cnVlJzpcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcblxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICB9XG5cbiAgICBjYXNlIE9wdGlvblR5cGUuTnVtYmVyOlxuICAgICAgaWYgKHN0ciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiAwO1xuICAgICAgfSBlbHNlIGlmIChzdHIgPT09ICcnKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICB9IGVsc2UgaWYgKE51bWJlci5pc0Zpbml0ZSgrc3RyKSkge1xuICAgICAgICByZXR1cm4gK3N0cjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICB9XG5cbiAgICBjYXNlIE9wdGlvblR5cGUuQXJyYXk6XG4gICAgICByZXR1cm4gQXJyYXkuaXNBcnJheSh2KVxuICAgICAgICA/IHYuY29uY2F0KHN0ciB8fCAnJylcbiAgICAgICAgOiB2ID09PSB1bmRlZmluZWRcbiAgICAgICAgICA/IFtzdHIgfHwgJyddXG4gICAgICAgICAgOiBbdiArICcnLCBzdHIgfHwgJyddO1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbn1cblxuZnVuY3Rpb24gX2NvZXJjZShzdHI6IHN0cmluZyB8IHVuZGVmaW5lZCwgbzogT3B0aW9uIHwgbnVsbCwgdj86IFZhbHVlKTogVmFsdWUgfCB1bmRlZmluZWQge1xuICBpZiAoIW8pIHtcbiAgICByZXR1cm4gX2NvZXJjZVR5cGUoc3RyLCBPcHRpb25UeXBlLkFueSwgdik7XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgdHlwZXMgPSBvLnR5cGVzIHx8IFtvLnR5cGVdO1xuXG4gICAgLy8gVHJ5IGFsbCB0aGUgdHlwZXMgb25lIGJ5IG9uZSBhbmQgcGljayB0aGUgZmlyc3Qgb25lIHRoYXQgcmV0dXJucyBhIHZhbHVlIGNvbnRhaW5lZCBpbiB0aGVcbiAgICAvLyBlbnVtLiBJZiB0aGVyZSdzIG5vIGVudW0sIGp1c3QgcmV0dXJuIHRoZSBmaXJzdCBvbmUgdGhhdCBtYXRjaGVzLlxuICAgIGZvciAoY29uc3QgdHlwZSBvZiB0eXBlcykge1xuICAgICAgY29uc3QgbWF5YmVSZXN1bHQgPSBfY29lcmNlVHlwZShzdHIsIHR5cGUsIHYpO1xuICAgICAgaWYgKG1heWJlUmVzdWx0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaWYgKCFvLmVudW0gfHwgby5lbnVtLmluY2x1ZGVzKG1heWJlUmVzdWx0KSkge1xuICAgICAgICAgIHJldHVybiBtYXliZVJlc3VsdDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBfZ2V0T3B0aW9uRnJvbU5hbWUobmFtZTogc3RyaW5nLCBvcHRpb25zOiBPcHRpb25bXSk6IE9wdGlvbiB8IHVuZGVmaW5lZCB7XG4gIGNvbnN0IGNhbWVsTmFtZSA9IC8oLXxfKS8udGVzdChuYW1lKVxuICAgID8gc3RyaW5ncy5jYW1lbGl6ZShuYW1lKVxuICAgIDogbmFtZTtcblxuICBmb3IgKGNvbnN0IG9wdGlvbiBvZiBvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbi5uYW1lID09PSBuYW1lIHx8IG9wdGlvbi5uYW1lID09PSBjYW1lbE5hbWUpIHtcbiAgICAgIHJldHVybiBvcHRpb247XG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbi5hbGlhc2VzLnNvbWUoeCA9PiB4ID09PSBuYW1lIHx8IHggPT09IGNhbWVsTmFtZSkpIHtcbiAgICAgIHJldHVybiBvcHRpb247XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gX3JlbW92ZUxlYWRpbmdEYXNoZXMoa2V5OiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBmcm9tID0ga2V5LnN0YXJ0c1dpdGgoJy0tJykgPyAyIDoga2V5LnN0YXJ0c1dpdGgoJy0nKSA/IDEgOiAwO1xuXG4gIHJldHVybiBrZXkuc3Vic3RyKGZyb20pO1xufVxuXG5mdW5jdGlvbiBfYXNzaWduT3B0aW9uKFxuICBhcmc6IHN0cmluZyxcbiAgbmV4dEFyZzogc3RyaW5nIHwgdW5kZWZpbmVkLFxuICB7IG9wdGlvbnMsIHBhcnNlZE9wdGlvbnMsIGxlZnRvdmVycywgaWdub3JlZCwgZXJyb3JzLCB3YXJuaW5ncyB9OiB7XG4gICAgb3B0aW9uczogT3B0aW9uW10sXG4gICAgcGFyc2VkT3B0aW9uczogQXJndW1lbnRzLFxuICAgIHBvc2l0aW9uYWxzOiBzdHJpbmdbXSxcbiAgICBsZWZ0b3ZlcnM6IHN0cmluZ1tdLFxuICAgIGlnbm9yZWQ6IHN0cmluZ1tdLFxuICAgIGVycm9yczogc3RyaW5nW10sXG4gICAgd2FybmluZ3M6IHN0cmluZ1tdLFxuICB9LFxuKSB7XG4gIGNvbnN0IGZyb20gPSBhcmcuc3RhcnRzV2l0aCgnLS0nKSA/IDIgOiAxO1xuICBsZXQgY29uc3VtZWROZXh0QXJnID0gZmFsc2U7XG4gIGxldCBrZXkgPSBhcmcuc3Vic3RyKGZyb20pO1xuICBsZXQgb3B0aW9uOiBPcHRpb24gfCBudWxsID0gbnVsbDtcbiAgbGV0IHZhbHVlOiBzdHJpbmcgfCB1bmRlZmluZWQgPSAnJztcbiAgY29uc3QgaSA9IGFyZy5pbmRleE9mKCc9Jyk7XG5cbiAgLy8gSWYgZmxhZyBpcyAtLW5vLWFiYyBBTkQgdGhlcmUncyBubyBlcXVhbCBzaWduLlxuICBpZiAoaSA9PSAtMSkge1xuICAgIGlmIChrZXkuc3RhcnRzV2l0aCgnbm8nKSkge1xuICAgICAgLy8gT25seSB1c2UgdGhpcyBrZXkgaWYgdGhlIG9wdGlvbiBtYXRjaGluZyB0aGUgcmVzdCBpcyBhIGJvb2xlYW4uXG4gICAgICBjb25zdCBmcm9tID0ga2V5LnN0YXJ0c1dpdGgoJ25vLScpID8gMyA6IDI7XG4gICAgICBjb25zdCBtYXliZU9wdGlvbiA9IF9nZXRPcHRpb25Gcm9tTmFtZShzdHJpbmdzLmNhbWVsaXplKGtleS5zdWJzdHIoZnJvbSkpLCBvcHRpb25zKTtcbiAgICAgIGlmIChtYXliZU9wdGlvbiAmJiBtYXliZU9wdGlvbi50eXBlID09ICdib29sZWFuJykge1xuICAgICAgICB2YWx1ZSA9ICdmYWxzZSc7XG4gICAgICAgIG9wdGlvbiA9IG1heWJlT3B0aW9uO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChvcHRpb24gPT09IG51bGwpIHtcbiAgICAgIC8vIFNldCBpdCB0byB0cnVlIGlmIGl0J3MgYSBib29sZWFuIGFuZCB0aGUgbmV4dCBhcmd1bWVudCBkb2Vzbid0IG1hdGNoIHRydWUvZmFsc2UuXG4gICAgICBjb25zdCBtYXliZU9wdGlvbiA9IF9nZXRPcHRpb25Gcm9tTmFtZShrZXksIG9wdGlvbnMpO1xuICAgICAgaWYgKG1heWJlT3B0aW9uKSB7XG4gICAgICAgIHZhbHVlID0gbmV4dEFyZztcbiAgICAgICAgbGV0IHNob3VsZFNoaWZ0ID0gdHJ1ZTtcblxuICAgICAgICBpZiAodmFsdWUgJiYgdmFsdWUuc3RhcnRzV2l0aCgnLScpKSB7XG4gICAgICAgICAgLy8gVmVyaWZ5IGlmIG5vdCBoYXZpbmcgYSB2YWx1ZSByZXN1bHRzIGluIGEgY29ycmVjdCBwYXJzZSwgaWYgc28gZG9uJ3Qgc2hpZnQuXG4gICAgICAgICAgaWYgKF9jb2VyY2UodW5kZWZpbmVkLCBtYXliZU9wdGlvbikgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgc2hvdWxkU2hpZnQgPSBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBPbmx5IGFic29yYiBpdCBpZiBpdCBsZWFkcyB0byBhIGJldHRlciB2YWx1ZS5cbiAgICAgICAgaWYgKHNob3VsZFNoaWZ0ICYmIF9jb2VyY2UodmFsdWUsIG1heWJlT3B0aW9uKSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgY29uc3VtZWROZXh0QXJnID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YWx1ZSA9ICcnO1xuICAgICAgICB9XG4gICAgICAgIG9wdGlvbiA9IG1heWJlT3B0aW9uO1xuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBrZXkgPSBhcmcuc3Vic3RyaW5nKDAsIGkpO1xuICAgIG9wdGlvbiA9IF9nZXRPcHRpb25Gcm9tTmFtZShfcmVtb3ZlTGVhZGluZ0Rhc2hlcyhrZXkpLCBvcHRpb25zKSB8fCBudWxsO1xuICAgIGlmIChvcHRpb24pIHtcbiAgICAgIHZhbHVlID0gYXJnLnN1YnN0cmluZyhpICsgMSk7XG4gICAgfVxuICB9XG5cbiAgaWYgKG9wdGlvbiA9PT0gbnVsbCkge1xuICAgIGlmIChuZXh0QXJnICYmICFuZXh0QXJnLnN0YXJ0c1dpdGgoJy0nKSkge1xuICAgICAgbGVmdG92ZXJzLnB1c2goYXJnLCBuZXh0QXJnKTtcbiAgICAgIGNvbnN1bWVkTmV4dEFyZyA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxlZnRvdmVycy5wdXNoKGFyZyk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGNvbnN0IHYgPSBfY29lcmNlKHZhbHVlLCBvcHRpb24sIHBhcnNlZE9wdGlvbnNbb3B0aW9uLm5hbWVdKTtcbiAgICBpZiAodiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAocGFyc2VkT3B0aW9uc1tvcHRpb24ubmFtZV0gIT09IHYpIHtcbiAgICAgICAgaWYgKHBhcnNlZE9wdGlvbnNbb3B0aW9uLm5hbWVdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICB3YXJuaW5ncy5wdXNoKFxuICAgICAgICAgICAgYE9wdGlvbiAke0pTT04uc3RyaW5naWZ5KG9wdGlvbi5uYW1lKX0gd2FzIGFscmVhZHkgc3BlY2lmaWVkIHdpdGggdmFsdWUgYFxuICAgICAgICAgICAgKyBgJHtKU09OLnN0cmluZ2lmeShwYXJzZWRPcHRpb25zW29wdGlvbi5uYW1lXSl9LiBUaGUgbmV3IHZhbHVlICR7SlNPTi5zdHJpbmdpZnkodil9IGBcbiAgICAgICAgICAgICsgYHdpbGwgb3ZlcnJpZGUgaXQuYCxcbiAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgcGFyc2VkT3B0aW9uc1tvcHRpb24ubmFtZV0gPSB2O1xuXG4gICAgICAgIGlmIChvcHRpb24uZGVwcmVjYXRlZCAhPT0gdW5kZWZpbmVkICYmIG9wdGlvbi5kZXByZWNhdGVkICE9PSBmYWxzZSkge1xuICAgICAgICAgIHdhcm5pbmdzLnB1c2goYE9wdGlvbiAke0pTT04uc3RyaW5naWZ5KG9wdGlvbi5uYW1lKX0gaXMgZGVwcmVjYXRlZCR7XG4gICAgICAgICAgICB0eXBlb2Ygb3B0aW9uLmRlcHJlY2F0ZWQgPT0gJ3N0cmluZycgPyAnOiAnICsgb3B0aW9uLmRlcHJlY2F0ZWQgOiAnLid9YCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IGVycm9yID0gYEFyZ3VtZW50ICR7a2V5fSBjb3VsZCBub3QgYmUgcGFyc2VkIHVzaW5nIHZhbHVlICR7SlNPTi5zdHJpbmdpZnkodmFsdWUpfS5gO1xuICAgICAgaWYgKG9wdGlvbi5lbnVtKSB7XG4gICAgICAgIGVycm9yICs9IGAgVmFsaWQgdmFsdWVzIGFyZTogJHtvcHRpb24uZW51bS5tYXAoeCA9PiBKU09OLnN0cmluZ2lmeSh4KSkuam9pbignLCAnKX0uYDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVycm9yICs9IGBWYWxpZCB0eXBlKHMpIGlzOiAkeyhvcHRpb24udHlwZXMgfHwgW29wdGlvbi50eXBlXSkuam9pbignLCAnKX1gO1xuICAgICAgfVxuXG4gICAgICBlcnJvcnMucHVzaChlcnJvcik7XG4gICAgICBpZ25vcmVkLnB1c2goYXJnKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gY29uc3VtZWROZXh0QXJnO1xufVxuXG5cbi8qKlxuICogUGFyc2UgdGhlIGFyZ3VtZW50cyBpbiBhIGNvbnNpc3RlbnQgd2F5LCBidXQgd2l0aG91dCBoYXZpbmcgYW55IG9wdGlvbiBkZWZpbml0aW9uLiBUaGlzIHRyaWVzXG4gKiB0byBhc3Nlc3Mgd2hhdCB0aGUgdXNlciB3YW50cyBpbiBhIGZyZWUgZm9ybS4gRm9yIGV4YW1wbGUsIHVzaW5nIGAtLW5hbWU9ZmFsc2VgIHdpbGwgc2V0IHRoZVxuICogbmFtZSBwcm9wZXJ0aWVzIHRvIGEgYm9vbGVhbiB0eXBlLlxuICogVGhpcyBzaG91bGQgb25seSBiZSB1c2VkIHdoZW4gdGhlcmUncyBubyBzY2hlbWEgYXZhaWxhYmxlIG9yIGlmIGEgc2NoZW1hIGlzIFwidHJ1ZVwiIChhbnl0aGluZyBpc1xuICogdmFsaWQpLlxuICpcbiAqIEBwYXJhbSBhcmdzIEFyZ3VtZW50IGxpc3QgdG8gcGFyc2UuXG4gKiBAcmV0dXJucyBBbiBvYmplY3QgdGhhdCBjb250YWlucyBhIHByb3BlcnR5IHBlciBmbGFncyBmcm9tIHRoZSBhcmdzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VGcmVlRm9ybUFyZ3VtZW50cyhhcmdzOiBzdHJpbmdbXSk6IEFyZ3VtZW50cyB7XG4gIGNvbnN0IHBhcnNlZE9wdGlvbnM6IEFyZ3VtZW50cyA9IHt9O1xuICBjb25zdCBsZWZ0b3ZlcnMgPSBbXTtcblxuICBmb3IgKGxldCBhcmcgPSBhcmdzLnNoaWZ0KCk7IGFyZyAhPT0gdW5kZWZpbmVkOyBhcmcgPSBhcmdzLnNoaWZ0KCkpIHtcbiAgICBpZiAoYXJnID09ICctLScpIHtcbiAgICAgIGxlZnRvdmVycy5wdXNoKC4uLmFyZ3MpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgaWYgKGFyZy5zdGFydHNXaXRoKCctLScpKSB7XG4gICAgICBjb25zdCBlcVNpZ24gPSBhcmcuaW5kZXhPZignPScpO1xuICAgICAgbGV0IG5hbWU6IHN0cmluZztcbiAgICAgIGxldCB2YWx1ZTogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgICAgaWYgKGVxU2lnbiAhPT0gLTEpIHtcbiAgICAgICAgbmFtZSA9IGFyZy5zdWJzdHJpbmcoMiwgZXFTaWduKTtcbiAgICAgICAgdmFsdWUgPSBhcmcuc3Vic3RyaW5nKGVxU2lnbiArIDEpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmFtZSA9IGFyZy5zdWJzdHIoMik7XG4gICAgICAgIHZhbHVlID0gYXJncy5zaGlmdCgpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB2ID0gX2NvZXJjZSh2YWx1ZSwgbnVsbCwgcGFyc2VkT3B0aW9uc1tuYW1lXSk7XG4gICAgICBpZiAodiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHBhcnNlZE9wdGlvbnNbbmFtZV0gPSB2O1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoYXJnLnN0YXJ0c1dpdGgoJy0nKSkge1xuICAgICAgYXJnLnNwbGl0KCcnKS5mb3JFYWNoKHggPT4gcGFyc2VkT3B0aW9uc1t4XSA9IHRydWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZWZ0b3ZlcnMucHVzaChhcmcpO1xuICAgIH1cbiAgfVxuXG4gIHBhcnNlZE9wdGlvbnNbJy0tJ10gPSBsZWZ0b3ZlcnM7XG5cbiAgcmV0dXJuIHBhcnNlZE9wdGlvbnM7XG59XG5cblxuLyoqXG4gKiBQYXJzZSB0aGUgYXJndW1lbnRzIGluIGEgY29uc2lzdGVudCB3YXksIGZyb20gYSBsaXN0IG9mIHN0YW5kYXJkaXplZCBvcHRpb25zLlxuICogVGhlIHJlc3VsdCBvYmplY3Qgd2lsbCBoYXZlIGEga2V5IHBlciBvcHRpb24gbmFtZSwgd2l0aCB0aGUgYF9gIGtleSByZXNlcnZlZCBmb3IgcG9zaXRpb25hbFxuICogYXJndW1lbnRzLCBhbmQgYC0tYCB3aWxsIGNvbnRhaW4gZXZlcnl0aGluZyB0aGF0IGRpZCBub3QgbWF0Y2guIEFueSBrZXkgdGhhdCBkb24ndCBoYXZlIGFuXG4gKiBvcHRpb24gd2lsbCBiZSBwdXNoZWQgYmFjayBpbiBgLS1gIGFuZCByZW1vdmVkIGZyb20gdGhlIG9iamVjdC4gSWYgeW91IG5lZWQgdG8gdmFsaWRhdGUgdGhhdFxuICogdGhlcmUncyBubyBhZGRpdGlvbmFsUHJvcGVydGllcywgeW91IG5lZWQgdG8gY2hlY2sgdGhlIGAtLWAga2V5LlxuICpcbiAqIEBwYXJhbSBhcmdzIFRoZSBhcmd1bWVudCBhcnJheSB0byBwYXJzZS5cbiAqIEBwYXJhbSBvcHRpb25zIExpc3Qgb2Ygc3VwcG9ydGVkIG9wdGlvbnMuIHtAc2VlIE9wdGlvbn0uXG4gKiBAcGFyYW0gbG9nZ2VyIExvZ2dlciB0byB1c2UgdG8gd2FybiB1c2Vycy5cbiAqIEByZXR1cm5zIEFuIG9iamVjdCB0aGF0IGNvbnRhaW5zIGEgcHJvcGVydHkgcGVyIG9wdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlQXJndW1lbnRzKFxuICBhcmdzOiBzdHJpbmdbXSxcbiAgb3B0aW9uczogT3B0aW9uW10gfCBudWxsLFxuICBsb2dnZXI/OiBsb2dnaW5nLkxvZ2dlcixcbik6IEFyZ3VtZW50cyB7XG4gIGlmIChvcHRpb25zID09PSBudWxsKSB7XG4gICAgb3B0aW9ucyA9IFtdO1xuICB9XG5cbiAgY29uc3QgbGVmdG92ZXJzOiBzdHJpbmdbXSA9IFtdO1xuICBjb25zdCBwb3NpdGlvbmFsczogc3RyaW5nW10gPSBbXTtcbiAgY29uc3QgcGFyc2VkT3B0aW9uczogQXJndW1lbnRzID0ge307XG5cbiAgY29uc3QgaWdub3JlZDogc3RyaW5nW10gPSBbXTtcbiAgY29uc3QgZXJyb3JzOiBzdHJpbmdbXSA9IFtdO1xuICBjb25zdCB3YXJuaW5nczogc3RyaW5nW10gPSBbXTtcblxuICBjb25zdCBzdGF0ZSA9IHsgb3B0aW9ucywgcGFyc2VkT3B0aW9ucywgcG9zaXRpb25hbHMsIGxlZnRvdmVycywgaWdub3JlZCwgZXJyb3JzLCB3YXJuaW5ncyB9O1xuXG4gIGZvciAobGV0IGFyZ0luZGV4ID0gMDsgYXJnSW5kZXggPCBhcmdzLmxlbmd0aDsgYXJnSW5kZXgrKykge1xuICAgIGNvbnN0IGFyZyA9IGFyZ3NbYXJnSW5kZXhdO1xuICAgIGxldCBjb25zdW1lZE5leHRBcmcgPSBmYWxzZTtcblxuICAgIGlmIChhcmcgPT0gJy0tJykge1xuICAgICAgLy8gSWYgd2UgZmluZCBhIC0tLCB3ZSdyZSBkb25lLlxuICAgICAgbGVmdG92ZXJzLnB1c2goLi4uYXJncy5zbGljZShhcmdJbmRleCArIDEpKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGlmIChhcmcuc3RhcnRzV2l0aCgnLS0nKSkge1xuICAgICAgY29uc3VtZWROZXh0QXJnID0gX2Fzc2lnbk9wdGlvbihhcmcsIGFyZ3NbYXJnSW5kZXggKyAxXSwgc3RhdGUpO1xuICAgIH0gZWxzZSBpZiAoYXJnLnN0YXJ0c1dpdGgoJy0nKSkge1xuICAgICAgLy8gQXJndW1lbnQgaXMgb2YgZm9ybSAtYWJjZGVmLiAgU3RhcnRzIGF0IDEgYmVjYXVzZSB3ZSBza2lwIHRoZSBgLWAuXG4gICAgICBmb3IgKGxldCBpID0gMTsgaSA8IGFyZy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBmbGFnID0gYXJnW2ldO1xuICAgICAgICAvLyBJZiB0aGUgbmV4dCBjaGFyYWN0ZXIgaXMgYW4gJz0nLCB0cmVhdCBpdCBhcyBhIGxvbmcgZmxhZy5cbiAgICAgICAgaWYgKGFyZ1tpICsgMV0gPT0gJz0nKSB7XG4gICAgICAgICAgY29uc3QgZiA9ICctJyArIGZsYWcgKyBhcmcuc2xpY2UoaSArIDEpO1xuICAgICAgICAgIGNvbnN1bWVkTmV4dEFyZyA9IF9hc3NpZ25PcHRpb24oZiwgYXJnc1thcmdJbmRleCArIDFdLCBzdGF0ZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgLy8gVHJlYXQgdGhlIGxhc3QgZmxhZyBhcyBgLS1hYCAoYXMgaWYgZnVsbCBmbGFnIGJ1dCBqdXN0IG9uZSBsZXR0ZXIpLiBXZSBkbyB0aGlzIGluXG4gICAgICAgIC8vIHRoZSBsb29wIGJlY2F1c2UgaXQgc2F2ZXMgdXMgYSBjaGVjayB0byBzZWUgaWYgdGhlIGFyZyBpcyBqdXN0IGAtYC5cbiAgICAgICAgaWYgKGkgPT0gYXJnLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICBjb25zdCBhcmcgPSAnLScgKyBmbGFnO1xuICAgICAgICAgIGNvbnN1bWVkTmV4dEFyZyA9IF9hc3NpZ25PcHRpb24oYXJnLCBhcmdzW2FyZ0luZGV4ICsgMV0sIHN0YXRlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBtYXliZU9wdGlvbiA9IF9nZXRPcHRpb25Gcm9tTmFtZShmbGFnLCBvcHRpb25zKTtcbiAgICAgICAgICBpZiAobWF5YmVPcHRpb24pIHtcbiAgICAgICAgICAgIGNvbnN0IHYgPSBfY29lcmNlKHVuZGVmaW5lZCwgbWF5YmVPcHRpb24sIHBhcnNlZE9wdGlvbnNbbWF5YmVPcHRpb24ubmFtZV0pO1xuICAgICAgICAgICAgaWYgKHYgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICBwYXJzZWRPcHRpb25zW21heWJlT3B0aW9uLm5hbWVdID0gdjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcG9zaXRpb25hbHMucHVzaChhcmcpO1xuICAgIH1cblxuICAgIGlmIChjb25zdW1lZE5leHRBcmcpIHtcbiAgICAgIGFyZ0luZGV4Kys7XG4gICAgfVxuICB9XG5cbiAgLy8gRGVhbCB3aXRoIHBvc2l0aW9uYWxzLlxuICAvLyBUT0RPKGhhbnNsKTogdGhpcyBpcyBieSBmYXIgdGhlIG1vc3QgY29tcGxleCBwaWVjZSBvZiBjb2RlIGluIHRoaXMgZmlsZS4gVHJ5IHRvIHJlZmFjdG9yIGl0XG4gIC8vICAgc2ltcGxlci5cbiAgaWYgKHBvc2l0aW9uYWxzLmxlbmd0aCA+IDApIHtcbiAgICBsZXQgcG9zID0gMDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBvc2l0aW9uYWxzLmxlbmd0aDspIHtcbiAgICAgIGxldCBmb3VuZCA9IGZhbHNlO1xuICAgICAgbGV0IGluY3JlbWVudFBvcyA9IGZhbHNlO1xuICAgICAgbGV0IGluY3JlbWVudEkgPSB0cnVlO1xuXG4gICAgICAvLyBXZSBkbyB0aGlzIHdpdGggYSBmb3VuZCBmbGFnIGJlY2F1c2UgbW9yZSB0aGFuIDEgb3B0aW9uIGNvdWxkIGhhdmUgdGhlIHNhbWUgcG9zaXRpb25hbC5cbiAgICAgIGZvciAoY29uc3Qgb3B0aW9uIG9mIG9wdGlvbnMpIHtcbiAgICAgICAgLy8gSWYgYW55IG9wdGlvbiBoYXMgdGhpcyBwb3NpdGlvbmFsIGFuZCBubyB2YWx1ZSwgQU5EIGZpdCB0aGUgdHlwZSwgd2UgbmVlZCB0byByZW1vdmUgaXQuXG4gICAgICAgIGlmIChvcHRpb24ucG9zaXRpb25hbCA9PT0gcG9zKSB7XG4gICAgICAgICAgY29uc3QgY29lcmNlZFZhbHVlID0gX2NvZXJjZShwb3NpdGlvbmFsc1tpXSwgb3B0aW9uLCBwYXJzZWRPcHRpb25zW29wdGlvbi5uYW1lXSk7XG4gICAgICAgICAgaWYgKHBhcnNlZE9wdGlvbnNbb3B0aW9uLm5hbWVdID09PSB1bmRlZmluZWQgJiYgY29lcmNlZFZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHBhcnNlZE9wdGlvbnNbb3B0aW9uLm5hbWVdID0gY29lcmNlZFZhbHVlO1xuICAgICAgICAgICAgZm91bmQgPSB0cnVlO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpbmNyZW1lbnRJID0gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICAgIGluY3JlbWVudFBvcyA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGZvdW5kKSB7XG4gICAgICAgIHBvc2l0aW9uYWxzLnNwbGljZShpLS0sIDEpO1xuICAgICAgfVxuICAgICAgaWYgKGluY3JlbWVudFBvcykge1xuICAgICAgICBwb3MrKztcbiAgICAgIH1cbiAgICAgIGlmIChpbmNyZW1lbnRJKSB7XG4gICAgICAgIGkrKztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZiAocG9zaXRpb25hbHMubGVuZ3RoID4gMCB8fCBsZWZ0b3ZlcnMubGVuZ3RoID4gMCkge1xuICAgIHBhcnNlZE9wdGlvbnNbJy0tJ10gPSBbLi4ucG9zaXRpb25hbHMsIC4uLmxlZnRvdmVyc107XG4gIH1cblxuICBpZiAod2FybmluZ3MubGVuZ3RoID4gMCAmJiBsb2dnZXIpIHtcbiAgICB3YXJuaW5ncy5mb3JFYWNoKG1lc3NhZ2UgPT4gbG9nZ2VyLndhcm4obWVzc2FnZSkpO1xuICB9XG5cbiAgaWYgKGVycm9ycy5sZW5ndGggPiAwKSB7XG4gICAgdGhyb3cgbmV3IFBhcnNlQXJndW1lbnRFeGNlcHRpb24oZXJyb3JzLCBwYXJzZWRPcHRpb25zLCBpZ25vcmVkKTtcbiAgfVxuXG4gIHJldHVybiBwYXJzZWRPcHRpb25zO1xufVxuIl19