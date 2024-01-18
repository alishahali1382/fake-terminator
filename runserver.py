import os
from http.server import SimpleHTTPRequestHandler
from socketserver import TCPServer

os.chdir(os.path.dirname(os.path.abspath(__file__)))
os.chdir('site')

handler = SimpleHTTPRequestHandler
httpd = TCPServer(('localhost', 8000), handler)

httpd.serve_forever()
print("shit")