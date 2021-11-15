import tornado.web
import logging
import json
from hydraplay.server.handler.BaseHandler import BaseHandler

class MopidySettingsHandler(BaseHandler):
    def initialize(self, *args, **kwargs):
        self.logger = logging.getLogger(__name__)
        self.config = kwargs.get('config')

    def get(self):
        mopidy_instances = []
        for instance in range(self.config.content['mopidy']['instances']):
            port = int(self.config.content['mopidy']['web_base_port']) + instance
            mopidy_instance = dict()
            mopidy_instance['stream_id'] = 'MOPIDY-{0}'.format(instance)
            mopidy_instance['id'] = instance
            mopidy_instance['port'] = port
            mopidy_instances.append(mopidy_instance)

        self.write(json.dumps(mopidy_instances))

