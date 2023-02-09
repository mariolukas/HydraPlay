import threading
import subprocess
import logging
import re

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
                line = stdout_line.strip()

                if ('Mopidy' in self.label):
                    # mopidy log filter, removes redundant log information
                    filtered_line = re.sub(r'(INFO|DEBUG|ERROR)(\s+)\d+-\d+-\d+\s\d+:\d+:\d+,\d+', '', line)

                    # mopidy log filter
                    if "INFO" in line:
                        self.logger.info(filtered_line)
                    elif "ERROR" in line:
                        self.logger.error(filtered_line)
                    elif "DEBUG" in line:
                        self.logger.debug(filtered_line)
                    else:
                        self.logger.debug(line)


                elif ('Snapcast' in self.label):
                    #snapcast log filter, removes redundant log information
                    filtered_line = re.sub(r'\d+-\d+-\d+\s\d+-\d+\d+-\d+.\d+\ (\[(Notice|Debug|Error|Info)\])', '', line)

                    if "Info" in line or "Notice" in line:
                        self.logger.info(filtered_line)
                    if "Error" in line:
                        self.logger.error(filtered_line)
                    if "Debug" in line:
                        self.logger.debug(filtered_line)

                else:
                    self.logger.debug(line)

            self.process.stdout.close()
            return_code = self.process.wait()

            self.logger.info("Process {0} started.".format(self.label))
        except Exception as e:
            self.logger.error("Error while running Executer: {0}".format(e))

    def stop(self):
        try:
            self.process.terminate()
            self.logger.info("Process %s killed", self.label)
        except Exception as e:
            self.logger.error(e)



