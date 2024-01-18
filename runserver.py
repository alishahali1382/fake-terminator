import os
from http.server import SimpleHTTPRequestHandler
from socketserver import TCPServer

os.chdir(os.path.dirname(os.path.abspath(__file__)))
os.chdir('site')

PORT = 8000

handler = SimpleHTTPRequestHandler
TCPServer.allow_reuse_address = True
httpd = TCPServer(('localhost', PORT), handler)
print("Serving at port", PORT)

httpd.serve_forever()
