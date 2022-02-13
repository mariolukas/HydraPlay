import json
import logging

from hydraplay.util.YAMLObject import YAMLobj

class Config:
    def __init__(self, file_name):
        self.logger = logging.getLogger(__name__)
        self.file_name = file_name
        try:
            self.content = self.load_json(file_name)
            self.content = YAMLobj(self.content)
        except Exception as error:
            self.logger.error("Config file is not valid JSON, please check your hydraplay config again.")
            return None

    def load_json(self, file):
        self.logger.debug("Loading config file.")
        with open(file) as json_data_file:
                data = json.load(json_data_file)
                # fill config with default values when not set
                self.logger.debug("Config file is valid.")
        return data

    def save_json(self, file_name=None):
        self.logger.debug("Saving config file.")
        if file_name:
            destination_file = file_name
        else:
            destination_file = self.file_name

        with open(destination_file, 'w') as outfile:
            json.dump(self.content, outfile, indent=4, ensure_ascii=False)
