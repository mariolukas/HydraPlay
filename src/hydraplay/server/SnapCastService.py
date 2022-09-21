import logging
import threading
import time
from pathlib import Path
from hydraplay.server.Executor import Executor
from jinja2 import Environment, FileSystemLoader


class SnapCastService(threading.Thread):
    def __init__(self, config):
        threading.Thread.__init__(self)
        self.daemon = True
        self.config = config
        self.logger = logging.getLogger(__name__)
        self.command = ['snapserver', '-c', '/tmp/snapserver.conf']
        self.shutodown_flag = threading.Event()
        self.executor = None

    def run(self):

        for idx, additional_stream in enumerate(self.config['snapcast_server']['additional_streams']):
           if self.config['snapcast_server']['additional_streams'][idx]['source_type'] == "fifo":
               # create a fifo for each stream
               command = ['mkfifo', '/tmp/additional_streams/stream_{0}.fifo'.format(self.config['mopidy']['instances']+idx)]
               Executor("FIFO Task".format(self.config['mopidy']['instances']+idx), command).start()

        self.executor = Executor("Snapcast Server", self.command)
        self.generate_config()
        self.executor.run()
        while not self.shutodown_flag.is_set():
            time.sleep(0.3)

    def reconfigure(self):
        self.executor.kill_process()
        self.generate_config()
        self.executor.start_process()

    def stop(self):
        self.executor.stop()
        self.shutodown_flag.set()
        self.delete_config()

    def delete_config(self):
        pass

    def render_template(self, template_filename, context):
        return self.template_environment.get_template(template_filename).render(context)

    def generate_config(self):
        self.logger.info("Generating Snapcast config")

        template_path = str(Path(__file__).resolve().parent.parent) + "/config/templates/"
        templateLoader = FileSystemLoader(searchpath=template_path)
        templateEnvironment = Environment(loader=templateLoader)
        template = templateEnvironment.get_template("snapserver.conf.j2")
        tcp_port = self.config['mopidy']['tcp_sink_base_port']
        codec = self.config['snapcast_server']['codec']
        source_type = self.config['hydraplay']['source_type']
        additional_streams = self.config['snapcast_server']['additional_streams']

        renedered_config = template.render(hydraplay_config=self.config,
                                           tcp_port=tcp_port,
                                           source_type=source_type,
                                           codec=codec,
                                           additional_streams=additional_streams
                                          )
        with open(self.config['snapcast_server']['config_path'] + "snapserver.conf", "w") as fh:
            fh.write(renedered_config)

