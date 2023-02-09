from hydraplay.server.handler.StaticFileHandler import StaticFileHandler
from hydraplay.server.handler.SettingsHandler import SettingsHandler
from hydraplay.server.handler.MopidyExtensionHandler import MopidyExtensionHandler
from hydraplay.server.handler.WebsocketProxyHandler import WebsocketProxyHandler
from hydraplay.server.SnapCastService import SnapCastService
from hydraplay.server.MopidyPoolService import MopidyPoolService
from hydraplay.config import Config
from pathlib import Path
import tornado
import logging
import time
import threading

import asyncio
import tornado.ioloop
import tornado.web
import tornado.httpserver
from tornado.platform.asyncio import AnyThreadEventLoopPolicy


class HydraServer:

    def __init__(self, configFile):
        self.mopidy_sercice = None
        self.webserver = None
        self.snapcast_service = None
        self.exit_on_error = False
        self.mopidy_service_started = threading.Event()

        try:
            self.config = Config(configFile)
            asyncio.set_event_loop_policy(AnyThreadEventLoopPolicy())
            self.system_exit = SystemExit()
            self.logger = logging.getLogger(__name__)
            self.logger.setLevel(logging.DEBUG)

            self.static_files = str(Path(__file__).resolve().parent) + "/static/"
            self.logger.debug(self.static_files)
            self.server_port = self.config.content['hydraplay']['port']

            self.mopidy_sercice = MopidyPoolService(self.config.content, self.mopidy_service_started)
            self.snapcast_service = SnapCastService(self.config.content)
        except:
            self.exit_on_error = True
            self.shutdown()

    def run(self):
        if not self.exit_on_error:
            self.logger.info("Hydraplay Server started.")
            self.mopidy_sercice.start()
            self.mopidy_service_started.wait()

            self.snapcast_service.start()
            self.logger.debug("Server listening on port {0}".format(self.server_port))
            self.webserver = self.routes()
            self.webserver.listen(self.server_port)
            tornado.ioloop.IOLoop.instance().start()

    def shutdown(self):
       #self.snapcast_service.stop()
       #self.snapcast_service.join()
       if self.mopidy_sercice is not None:
            self.mopidy_sercice.stop()
       #self.mopidy_sercice.join()
       ioloop = tornado.ioloop.IOLoop.current()
       ioloop.add_callback(ioloop.stop)
       self.logger.info("Hydraplay Server stopped.")

    def routes(self):
        return tornado.web.Application([
            (r'/socket/(.*)', WebsocketProxyHandler),
            (r"/api/media/scan", MopidyExtensionHandler),
            (r"/api/settings", SettingsHandler, {"config": self.config}),
            (r"/client/(.*)", StaticFileHandler, {"path": self.static_files+"/snapweb", "default_filename": "index.html"}),
            (r"/(.*)", StaticFileHandler, {"path": self.static_files+"/player", "default_filename": "index.html"}),
        ], cookie_secret="__TODO:_GENERATE_YOUR_OWN_RANDOM_VALUE_HERE__")
