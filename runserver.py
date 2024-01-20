import os
from http.server import SimpleHTTPRequestHandler
from socketserver import TCPServer
from urllib.parse import parse_qs

os.chdir(os.path.dirname(os.path.abspath(__file__)))
os.chdir('site')


class TerminatorHTTPRequestHandler(SimpleHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        raw_data = self.rfile.read(content_length).decode('utf-8')
        data = parse_qs(raw_data)
        
        if self.path == '/schedule/add/':
            print("received data: ", data)
            group_id = data.get('group_id', [''])[0]
            self.send_response(200, "SUCCESS")
            self.end_headers()
            self.wfile.write(f"Received group_id: {group_id}".encode('utf-8'))

        elif self.path == '/schedule/remove/':
            print("received data: ", data)
            group_id = data.get('group_id', [''])[0]
            self.send_response(200, "SUCCESS")
            self.end_headers()
            self.wfile.write(f"Received group_id: {group_id}".encode('utf-8'))

        else:
            print("returned 404")
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b"Not Found")



PORT = 8000        

handler = TerminatorHTTPRequestHandler
TCPServer.allow_reuse_address = True
httpd = TCPServer(('localhost', PORT), handler)
print("Serving at port", PORT)

try:
    httpd.serve_forever()
except KeyboardInterrupt:
    httpd.server_close()
    print("Server stopped.")
