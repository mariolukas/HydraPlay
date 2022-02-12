from hydraplay.server.handler.StaticFileHandler import StaticFileHandler
from hydraplay.server.handler.MopidySettingsHandler import MopidySettingsHandler
from hydraplay.server.SnapCastService import SnapCastService
from hydraplay.server.MopidyPoolService import MopidyPoolService
from hydraplay.config import Config
from pathlib import Path
import tornado
import logging
import time

import asyncio
import tornado.ioloop
import tornado.web
import tornado.httpserver
from tornado.platform.asyncio import AnyThreadEventLoopPolicy

class HydraServer:

    def __init__(self, configFile):

        asyncio.set_event_loop_policy(AnyThreadEventLoopPolicy())
        self.system_exit = SystemExit()
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(logging.DEBUG)
        self.config = Config(configFile)
        self.static_files = str(Path(__file__).resolve().parent) + "/static/"
        self.logger.debug(self.static_files)
        self.server_port = self.config.content['hydraplay']['port']
        self.webserver = None

        self.mopidy_sercice = MopidyPoolService(self.config.content)
        self.snapcast_service = SnapCastService(self.config.content)


    def run(self):
        self.logger.info("Hydraplay Server started.")


        self.mopidy_sercice.start()
        time.sleep(2)
        self.snapcast_service.start()

        self.logger.debug("Server listening on port {0}".format(self.server_port))
        self.webserver = self.routes()
        self.webserver.listen(self.server_port)
        tornado.ioloop.IOLoop.instance().start()

    def shutdown(self):
       #self.snapcast_service.stop()
       #self.snapcast_service.join()
       self.mopidy_sercice.stop()
       #self.mopidy_sercice.join()
       ioloop = tornado.ioloop.IOLoop.current()
       ioloop.add_callback(ioloop.stop)
       self.logger.info("Hydraplay Server stopped.")

    def routes(self):
        return tornado.web.Application([

            (r"/api/mopidy/settings", MopidySettingsHandler, {"config": self.config}),
            (r"/(.*)", StaticFileHandler, {"path": self.static_files, "default_filename": "index.html"})

        ])