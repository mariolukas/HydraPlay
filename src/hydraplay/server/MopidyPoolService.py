import logging
import threading
import time
from pathlib import Path
from hydraplay.server.Executor import Executor
from jinja2 import Environment, FileSystemLoader

class MopidyPoolService(threading.Thread):
    def __init__(self, config):
        threading.Thread.__init__(self)
        self.logger = logging.getLogger(__name__)
        self.config = config
        self.executor_pool = []
        self.shutdown_flag = threading.Event()

    def run(self):
        for instance in range(self.config['mopidy']['instances']):

            if self.config['hydraplay']['source_type'] == "fifo":
                # create a fifo for each stream
                command = ['mkfifo', '/tmp/stream_{0}.fifo'.format(instance)]
                Executor("FIFO Task".format(instance), command).start()

            command = ['mopidy', '--config']
            command.append("/tmp/mopidy_{0}.conf".format(instance))
            self.executor_pool.append(Executor("Mopidy_{0}".format(instance), command))
            self.generate_mopidy_config(instance)
            self.executor_pool[instance].start()

        while not self.shutdown_flag.is_set():
            time.sleep(0.3)

    def reconfigure(self):
        for instance in range(self.config['mopidy']['instances']):
            self.executor.kill_process(instance)
            self.generate_mopidy_config(instance)
            self.executor.start_process(instance)

    def stop(self):
        for instance in range(self.config['mopidy']['instances']):
            self.executor_pool[instance].stop()
        self.shutdown_flag.set()

    def generate_mopidy_config(self, instance):
        self.logger.info("Generating Mopidy config for instance {0}".format(instance))

        template_path = str(Path(__file__).resolve().parent.parent) + "/config/templates/"
        templateLoader = FileSystemLoader(searchpath=template_path)
        templateEnvironment = Environment(loader=templateLoader)
        template = templateEnvironment.get_template("mopidy.conf.j2")
        mpd_port = self.config['mopidy']['mpd_base_port'] + instance
        web_port = self.config['mopidy']['web_base_port'] + instance
        tcp_port = self.config['mopidy']['tcp_sink_base_port']
        source_type = self.config['hydraplay']['source_type']
        renedered_config = template.render(hydraplay_config=self.config,
                                           stream_id=instance,
                                           mpd_port=mpd_port,
                                           web_port=web_port,
                                           tcp_port=tcp_port,
                                           source_type=source_type
                                           )
        with open(self.config['mopidy']['config_path'] + "mopidy_{0}.conf".format(instance), "w") as fh:
            fh.write(renedered_config)


