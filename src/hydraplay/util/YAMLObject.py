class YAMLobj(dict):
    def __init__(self, args):
        super(YAMLobj, self).__init__(args)
        if isinstance(args, dict):
            for k, v in args.items():
                if not isinstance(v, dict):
                    self[k] = v
                else:
                    self.__setattr__(k, YAMLobj(v))

    def __getattr__(self, attr):
        return self.get(attr)

    def __setattr__(self, key, value):
        self.__setitem__(key, value)

    def __setitem__(self, key, value):
        super(YAMLobj, self).__setitem__(key, value)
        self.__dict__.update({key: value})

    def __delattr__(self, item):
        self.__delitem__(item)

    def __delitem__(self, key):
        super(YAMLobj, self).__delitem__(key)
        del self.__dict__[key]