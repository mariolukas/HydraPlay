import tornado.web
import tornado
import logging
import json
import shlex
import asyncio
import subprocess
from hydraplay.server.handler.BaseHandler import BaseHandler
from tornado.ioloop import IOLoop
import tornado.gen as gen

class MopidyExtensionHandler(BaseHandler):
    def initialize(self, *args, **kwargs):
        self.logger = logging.getLogger(__name__)

    async def _scan_files(self):
        command = 'mopidy --config /tmp/mopidy_0.conf local scan'

        self.logger.debug('Calling command: {}'.format(command))

        self.__process = tornado.process.Subprocess(["mopidy", "--config", "/tmp/mopidy_0.conf", "local", "scan"], stdout=tornado.process.Subprocess.STREAM)
        while True:
            try:
                line = await self.__process.stdout.read_until(b"\n")
                if "INFO" in line:
                    self.logger.debug(line)
                self.write(line)
            except:
                break

        # process = await asyncio.create_subprocess_exec(
        #     *shlex.split(command),
        #     stdout=asyncio.subprocess.PIPE,
        #     stderr=asyncio.subprocess.STDOUT
        # )
        # logging.debug('  - process created')
        #
        # result = await process.wait()
        # stdout, stderr = await process.communicate()
        # output = stdout.decode()

    async def get(self):
        self.logger.debug('Request started...')
        #output = await self._scan_files()
        IOLoop.current().spawn_callback(self._scan_files)
        response = json.dumps({'started_at': '12:00'})
        self.write(json.dumps(response))
