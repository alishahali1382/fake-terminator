import re
from pathlib import Path
from urllib.parse import urljoin

import bs4
import requests


def wget(session: requests.Session, url: str, local_path: Path):
    try:
        response = session.get(url)
        response.raise_for_status()  # Check for errors in the response
        with open(local_path, 'wb') as file:
            file.write(response.content)
        print(f"Downloaded: {url}")

    except requests.exceptions.RequestException as e:
        print(f"Failed to download file. Error: {e}")

def replace_relative_links(response_text):
    for typ in ['src', 'href']:
        link_pattern = rf'{typ}="(/[^"]*)"'
        response_text = re.sub(link_pattern, rf'{typ}=".\1"', response_text)
    return response_text

def get_file(session, domain, url):
    rel_path: Path = Path.cwd() / url
    if rel_path.exists():
        print(f"Exists: {url}")
        return
    rel_path.parent.mkdir(parents=True, exist_ok=True)
    rel_path.touch()
    wget(session, urljoin(domain, url), rel_path)

def get_files_from_css(session, domain, url):
    with open(Path.cwd() / url, "r") as f:
        css = f.read()
        for file in re.findall(r'url\("(.*?)"\)', css):            
            get_file(session, domain, f"./{urljoin(url, file)}")

def get_static_files(session, domain, content):
    soup = bs4.BeautifulSoup(content, 'html.parser')
    static_files = soup.find_all(['script', 'img'], src=True) + soup.find_all(['link', 'script'], href=True)

    for static_file in static_files:
        url = static_file.get('src')
        if not url:
            url = static_file.get('href')
        
        url = urljoin('schedule', url)        
        get_file(session, domain, url)
        if url.endswith(".css"):
            get_files_from_css(session, domain, url)

