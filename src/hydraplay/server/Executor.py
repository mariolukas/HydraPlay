import threading
import subprocess
import logging

class Executor(threading.Thread):

    def __init__(self, label, command):
        threading.Thread.__init__(self)
        self.logger = logging.getLogger(__name__ + "." + label)
        self.process = None
        self.command = command
        self.label = label
        self.daemon = True

    def run(self):

        try:
            self.logger.debug("Command: {0}".format(self.command))
            self.process = subprocess.Popen(self.command,
                                            stdout=subprocess.PIPE,
                                            stderr=subprocess.STDOUT,
                                            universal_newlines=True,
                                            )
            for stdout_line in iter(self.process.stdout.readline, ""):
                self.logger.debug(stdout_line.strip())
            self.process.stdout.close()
            return_code = self.process.wait()

            self.logger.info("Process {0} started.".format(self.label))
        except Exception as e:
            self.logger.error(e)
            self.logger.error("Process {0} not started, executable {1} not found".format(self.label, self.command))

    def stop(self):
        try:
            self.process.terminate()
            self.logger.info("Process %s killed", self.label)
        except Exception as e:
            self.logger.error(e)



