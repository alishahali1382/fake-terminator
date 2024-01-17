import re
from pathlib import Path

import bs4
import requests

from utils import replace_relative_links, get_static_files

domain = 'https://term.inator.ir'
session = requests.Session()

with open('cookies', 'r') as f:
    session.cookies.update({c.split('=')[0]: c.split('=')[1] for c in f.read().split(';')})


content = session.get(f"{domain}/schedule/").text
content = replace_relative_links(content)
with open('schedule.html', 'w') as f:
    f.write(content)

get_static_files(session, domain, content)
