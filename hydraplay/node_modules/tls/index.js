var bind = Function.prototype.bind,
    slice = Array.prototype.slice,
    toString = Object.prototype.toString;

exports.bind = function (func, that) {
	var args = slice.call(arguments, 2);

	if (bind) {
		args.unshift(that);

		return bind.apply(func, args);
	}

	return function () {
		return func.apply(that, args.concat(slice.call(arguments)));
	};
}

exports.slice = function (object, begin, end) {
	return slice.call(object, begin, end);
};

exports.toString = function (object) {
	return toString.call(object);
};


exports.isNull = nativeTypeChecker('Null');
exports.isDate = nativeTypeChecker('Date');
exports.isMath = nativeTypeChecker('Math');
exports.isJSON = nativeTypeChecker('JSON');
exports.isError = nativeTypeChecker('Error');
exports.isArray = Array.isArray || nativeTypeChecker('Array');
exports.isObject = nativeTypeChecker('Object');
exports.isRegExp = nativeTypeChecker('RegExp');
exports.isNumber = nativeTypeChecker('Number');
exports.isString = nativeTypeChecker('String');
exports.isBoolean = nativeTypeChecker('Boolean');
exports.isFunction = nativeTypeChecker('Function');
exports.isArguments = nativeTypeChecker('Arguments');
exports.isUndefined = nativeTypeChecker('Undefined');

function nativeTypeChecker (type) {
	type = '[object ' + type + ']';

	return function (object) {return toString.call(object) === type;};
}


exports.isValid = function (object) {
	return !exports.isInvalid(object);
}

exports.isInvalid = function (object) {
	return exports.isNull(object) || exports.isUndefined(object);
}


exports.isImmutable = function (object) {
	return !exports.isMutable(object);
};

exports.isMutable = function (object) {
	return object &&
		!exports.isNumber(object) &&
		!exports.isString(object) &&
		!exports.isBoolean(object);
};


exports.isEnumerable = function (object) {
	if (!object) return false;

	if (exports.isNumber(object)) return exports.isInteger(object);

	if (exports.isInteger(object.length)) return object.length >= 0;

	return exports.isEnumerableObject(object);
};

exports.isEnumerableObject = function (object) {
	for (var _ in object) return true;

	return false;
};

exports.isEmpty = function (object) {
	return exports.isObject(object) ?
		!exports.isEnumerableObject(object) :
		!exports.isEnumerable(object);
}


exports.isFiniteNumber = function (number) {
	return exports.isNumber(number) && isFinite(number);
};

exports.isInteger = function (number) {
	return exports.isFiniteNumber(number) && Math.floor(number) === number;
};

exports.isVague = function (object) {
	return object && typeof object === 'object';
};

exports.isList = function (list) {
	return (
		exports.isVague(list) &&
		exports.isInteger(list.length) && list.length >= 0);
};


exports.isNaN = isNaN;


exports.nativeTypeOf = function (object) {
	var nativeType = object.toString(object);

	return nativeType.substring(8, nativeType.length - 1);
};

exports.typeOf = function (object) {
	return exports.isObject(object) ?
		object.constructor.name || 'Object' :
		exports.nativeTypeOf(object);
};


exports.safeApply = function (func, args, that) {
	return exports.isFunction(func) ?
		func.apply(that || this, args) :
		undefined;
};


exports.enumerate = function (object, iterator, that, _ignoreForEach) {
	if (!object) return object;

	that = that || this;

	if (!_ignoreForEach && exports.isFunction(object.forEach))
		return object.forEach(iterator, that);

	var key = 0, end = object.length;

	if (exports.isString(object)) {
		for (; key < end; key += 1) iterator.call(that, object.charAt(key), key, object);

	} if (exports.isList(object)) {
		for (; key < end; key += 1) iterator.call(that, object[key], key, object);

	} else if (exports.isInteger(object)) {
		if (object < 0) {
			end = 0;
			key = object;

		} else end = object;

		for (; key < end; key += 1) iterator.call(that, key, Math.abs(key), object);

	} else exports.enumerateObject(object, iterator, that);

	return object;
};

exports.enumerateObject = function (object, iterator, that) {
	var key;

	for (key in object) iterator.call(that, object[key], key, object);

	return object;
}


exports.assignAll = function (target, giver, filter, that, _method) {
	if (!exports.isMutable(target)) return target;

	_method = _method === 'enumerate' ? _method : 'enumerateObject';

	exports[_method](giver, function (value, key) {
		if (!exports.safeApply(filter, arguments, that || target)) {
			target[key] = value;
		}
	});

	return target;
};

exports.assignList = function (target, giver, filter, that) {
	return exports.assignAll(target, giver, filter, that, 'enumerate');
};

exports.assign = function (target, giver, filter, that) {
	return exports.assignAll(target, giver, function (_, key) {
		if (!giver.hasOwnProperty(key)) return true;

		return exports.safeApply(filter, arguments, that || this);
	}, that);
};


exports.toArray = function (object, begin, end) {
	if (exports.isArray()) return exports.isInteger(begin) ?
		exports.slice(object, begin, end) :
		object;

	if (exports.isArguments(object) || exports.isString(object))
		return exports.slice(object, begin, end);

	if (!exports.isList(object)) return undefined;

	if (!exports.isInteger(end)) end = object.length;

	begin = begin || 0;

	return exports.assignList([], object, function (_, i) {
		return begin > i || i >= end;
	});
};
