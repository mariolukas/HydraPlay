from hydraplay.version import __version__
from hydraplay.server.HydraServer import HydraServer
import logging
import logging.handlers
import sys
import signal

class ServiceExit(Exception):
    """
    Custom exception which is used to trigger the clean exit
    of all running threads and the main program.
    """
    pass

def service_shutdown(signum, frame):
    raise ServiceExit


def checkForExecutable(program):
    import os
    def is_exe(fpath):
        return os.path.isfile(fpath) and os.access(fpath, os.X_OK)

    fpath, fname = os.path.split(program)
    if fpath:
        if is_exe(program):
            return program
    else:
        for path in os.environ["PATH"].split(os.pathsep):
            exe_file = os.path.join(path, program)
            if is_exe(exe_file):
                return exe_file

    return None

def checkDependencies():

   valid = True
   if not checkForExecutable('snapserver'):
       valid = False
       print("Snapcast Server executable not found.")

   if not checkForExecutable('mopidy'):
       valid = False
       print("Mopidy executable not found.")

   if (not valid):
       sys.exit(0)

def main():

    checkDependencies()

    signal.signal(signal.SIGTERM, service_shutdown)
    signal.signal(signal.SIGINT, service_shutdown)

    import argparse

    parser = argparse.ArgumentParser(prog="hydraplay")

    parser.add_argument("-v", "--version", action="store_true", dest="version",
                       help="Output HydraPlay version and exit")

    parser.add_argument("-d", "--debug", action="store_true", dest="debug",
                        help="Enable debug mode")

    parser.add_argument("--port", action="store", type=int, dest="port",
                        help="Specify the port on which to bind the server")

    parser.add_argument("--config", action="store", required=False, dest="config",
                        default="/etc/hydraplay/hydra.config.json",
                        help="Specify the config file to use. HydraPlay needs to have write access for the config dialog to work. Defaults to /etc/hydraplay/hydra.config.json")

    parser.add_argument("--logfile", action="store", dest="logConf", default=None,
                        help="Define the log file and path for logging. Defaults to /var/log/hydraplay/hydraplay.log")

    parser.add_argument("--loglevel", action="store", dest="logLevel", default="debug",
                        help="Specify the Log level. Possible Params are debug, info and warning")

    args = parser.parse_args()

    formatter = logging.Formatter('%(asctime)s [%(process)d:%(thread)d] %(levelname)s - %(name)s: %(message)s')
    logger = logging.getLogger()


    log_level = {
        "debug": logging.DEBUG,
        "info": logging.INFO,
        "warning": logging.WARNING
    }

    level = log_level.get(str(args.logLevel), "debug")

    if args.logConf:
        fh = logging.handlers.RotatingFileHandler(args.logConf, maxBytes=5000000, backupCount=5)
        fh.setLevel(level)
        fh.setFormatter(formatter)
        logger.addHandler(fh)
        logger.propagate = False
        logger.setLevel(level)
    else:
        ch = logging.StreamHandler()
        ch.setLevel(level)
        ch.setFormatter(formatter)
        logger.addHandler(ch)
        logger.propagate = False
        logger.setLevel(level)

    if args.version:
        print("HydraPlay version %s" % __version__)
        sys.exit(0)

    try:
        server = HydraServer(args.config)
        server.run()

    except ServiceExit:
        server.shutdown()
        # Terminate the running threads.
        # Set the shutdown flag on each thread to trigger a clean shutdown of each thread.


if __name__ == "__main__":
    main()
