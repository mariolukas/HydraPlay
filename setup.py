# coding=utf-8
#!/usr/bin/env python

from setuptools import setup, Command, find_packages

#import versioneer

DESCRIPTION = "A multiroom audio server based on Mopidy and Snapcast"
LONG_DESCRIPTION = ""

EXTRAS_FOLDERS = [
    ("/etc/hydraplay.conf.d", 0o755)
]

EXTRAS_FILES = [
    ("/etc/init.d/", [("extras/hydraplay.init", "hydraplay", 0o755)]),
    ("/etc/default/", [("extras/hydraplay.default", "hydraplay", 0o644)]),
    ("/etc/logrotate.d/", [("extras/hydraplay.logrotate", "hydraplay", 0o644)]),
]


def get_extra_tuple(entry):
    import os

    if isinstance(entry, (tuple, list)):
        if len(entry) == 2:
            path, mode = entry
            filename = os.path.basename(path)
        elif len(entry) == 3:
            path, filename, mode = entry
        elif len(entry) == 1:
            path = entry[0]
            filename = os.path.basename(path)
            mode = None
        else:
            return None

    else:
        path = entry
        filename = os.path.basename(path)
        mode = None

    return path, filename, mode


class InstallExtrasCommand(Command):
    description = "install extras like init scripts and config files"
    user_options = [("force", "F", "force overwriting files if they already exist")]

    def initialize_options(self):
        self.force = None

    def finalize_options(self):
        if self.force is None:
            self.force = False

    def run(self):
        global EXTRAS_FILES, EXTRAS_FOLDERS
        import shutil
        import os

        for folder, mode in EXTRAS_FOLDERS:
            try:
                if os.path.exists(folder):
                    os.chmod(folder, mode)
                else:
                    os.mkdir(folder, mode)
            except Exception as e:
                import sys

                print(("Error while creating %s (%s), aborting" % (folder, e.message)))
                sys.exit(-1)

        for target, files in EXTRAS_FILES:
            for entry in files:
                extra_tuple = get_extra_tuple(entry)
                if extra_tuple is None:
                    print(
                        (
                            "Can't parse entry for target %s, skipping it: %r"
                            % (target, entry)
                        )
                    )
                    continue

                path, filename, mode = extra_tuple
                target_path = os.path.join(target, filename)

                path_exists = os.path.exists(target_path)
                if path_exists and not self.force:
                    print(
                        (
                            "Skipping copying %s to %s as it already exists, use --force to overwrite"
                            % (path, target_path)
                        )
                    )
                    continue

                try:
                    shutil.copy(path, target_path)
                    if mode:
                        os.chmod(target_path, mode)
                        print(
                            (
                                "Copied %s to %s and changed mode to %o"
                                % (path, target_path, mode)
                            )
                        )
                    else:
                        print(("Copied %s to %s" % (path, target_path)))
                except Exception as e:
                    if not path_exists and os.path.exists(target_path):
                        # we'll try to clean up again
                        try:
                            os.remove(target_path)
                        except:
                            pass

                    import sys

                    print(
                        (
                            "Error while copying %s to %s (%s), aborting"
                            % (path, target_path, e.message)
                        )
                    )
                    sys.exit(-1)


class UninstallExtrasCommand(Command):
    description = "uninstall extras like init scripts and config files"
    user_options = []

    def initialize_options(self):
        pass

    def finalize_options(self):
        pass

    def run(self):
        global EXTRAS_FILES, EXTRAS_FOLDERS
        import os

        for target, files in EXTRAS_FILES:
            for entry in files:
                extra_tuple = get_extra_tuple(entry)
                if extra_tuple is None:
                    print(
                        (
                            "Can't parse entry for target %s, skipping it: %r"
                            % (target, entry)
                        )
                    )

                path, filename, mode = extra_tuple
                target_path = os.path.join(target, filename)
                try:
                    os.remove(target_path)
                    print(("Removed %s" % target_path))
                except Exception as e:
                    print(
                        (
                            "Error while deleting %s from %s (%s), please remove manually"
                            % (filename, target, e.message)
                        )
                    )

        for folder, mode in EXTRAS_FOLDERS[::-1]:
            try:
                os.rmdir(folder)
            except Exception as e:
                print(
                    (
                        "Error while removing %s (%s), please remove manually"
                        % (folder, e.message)
                    )
                )


def params():
    name = "hydraplay"
    version = "0.7.3"
    description = DESCRIPTION
    long_description = LONG_DESCRIPTION
    author = "Mario Lukas"
    author_email = "info@mariolukas.de"
    url = "http://github.com/mariolukas/hydraplay"
    license = "GPLV3"

    #packages = ["hydraplay"]
    zip_safe = False

    packages = find_packages(where="src")
    package_dir = {
        "": "src",
    }

    cmdclass = {
            "install_extras": InstallExtrasCommand,
            "uninstall_extras": UninstallExtrasCommand,
    }

    install_requires = ["tornado", "jinja2"]

    package_data = {'hydraplay': ['config/*json', 'config/templates/*.j2', 'server/static/*','server/static/snapweb/*','server/static/snapweb/3rd-party/*','server/static/player/*' 'server/static/player/assets/images/*']}
    include_package_data = True

    #include_package_data = True
    entry_points = {
        "console_scripts": {
            "hydraplay = hydraplay.main:main"
        }
    }

    scripts = ['src/hydraplay.sh']

    return locals()

setup(**params())
