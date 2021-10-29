import json
import logging

from util.YAMLObject import YAMLobj

class Config:
    def __init__(self, file_name):
        self.logger = logging.getLogger(__name__)
        self.file_name = file_name
        self.content = self.load_json(file_name)
        self.content = YAMLobj(self.content)

    def load_json(self, file):
        self.logger.debug("Loading config file.")
        with open(file) as json_data_file:
            data = json.load(json_data_file)
            # fill config with default values when not set
            self.logger.debug("Checking for valid config values.")

        return data

    def save_json(self, file_name=None):
        self.logger.debug("Saving config file.")
        if file_name:
            destination_file = file_name
        else:
            destination_file = self.file_name

        with open(destination_file, 'w') as outfile:
            json.dump(self.content, outfile, indent=4, ensure_ascii=False)
