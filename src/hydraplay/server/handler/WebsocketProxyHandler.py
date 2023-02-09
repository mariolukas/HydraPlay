from tornado import websocket, web, ioloop
from tornado.websocket import websocket_connect
import json
import logging
import time


class WebsocketProxyHandler(websocket.WebSocketHandler):

    def initialize(self):
        self.logger = logging.getLogger(__name__)
        self.destination_connection = None
        self.binary = False
        self.ws_uri = "ws://"

    def check_origin(self, origin):
        return True

    async def open(self, uri):

        try:
            self.logger.debug("websocket route {0} requested".format(uri))
            uri = uri.split('/')

            # we have a snapcast connection
            if 'control' in uri[0]:

                # snapcsat audio stream
                if 'stream' in uri[1]:
                    self.binary = True

                self.ws_uri = "ws://127.0.0.1:1780/{0}".format(uri[1])

            # we have a mopidy connection
            if 'stream' in uri[0]:
                port = int(uri[1])+6680

                self.binary = False
                self.ws_uri = "ws://127.0.0.1:{0}/mopidy/ws".format(port)

            self.destination_connection = None

            client_connected = False
            connection_attempt = 0
            max_connection_attempt = 5
            while not client_connected:
                try:
                    self.destination_connection = await websocket_connect(url=self.ws_uri)
                    client_connected = True
                    self.logger.info("{0} connected.".format(self.ws_uri))

                except Exception as e:
                    # FIXME: Please refactor me! This is ugly

                    connection_attempt += 1
                    if (connection_attempt == max_connection_attempt):
                        self.logger.info("max number of connection attempts reached for {0}".format(self.ws_uri))
                        self.close()

                    reconnect_interval = 3
                    self.logger.info("{0} not Ready trying again in {1} seconds ...".format(self.ws_uri, reconnect_interval))
                    time.sleep(reconnect_interval)

            async def proxy_loop():
                while True:
                    msg = await self.destination_connection.read_message()
                    if msg is None:
                        break
                    await self.write_message(msg, self.binary)

            ioloop.IOLoop.current().spawn_callback(proxy_loop)

        except Exception as e:
            self.logger.error("Other Exception while handling {0}".format(self.ws_uri))
            self.logger.error(e)
            self.close_all()

    def on_message(self, message):
        try:
            if self.destination_connection:
                self.destination_connection.write_message(message, self.binary)
        except Exception as e:
            self.logger.error(e)
            self.close_all()

    def on_close(self):
        self.logger.debug("Closing connection {0}".format(self.ws_uri))
        self.destination_connection.close()

    def close_all(self):
        if self.destination_connection:
            self.destination_connection.close()
        self.close()
