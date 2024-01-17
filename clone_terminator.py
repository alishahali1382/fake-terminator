import os

import requests

from utils import fix_main_page, get_static_files

domain = 'https://term.inator.ir'
session = requests.Session()

with open('cookies', 'r') as f:
    session.cookies.update({c.split('=')[0]: c.split('=')[1] for c in f.read().split(';')})

if not os.path.exists('site'):
    os.mkdir('site')
os.chdir('site')
content = session.get(f"{domain}/schedule/").text
content = fix_main_page(content)
with open('index.html', 'w') as f:
    f.write(content)

get_static_files(session, domain, content)
