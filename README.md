## Fake term.inator

This is written because of term.inator.ir's delay in updating courses.
It is mostly the same as terminator, with few modifications to run locally and fetching courses from edu.

## How to run
to use this, run the following command, and then open localhost:8000 in your browser.
no internet connection is required.

<!-- ```bash
python -m http.server
```
or -->
```bash
python runserver.py
```

## Update courses
To update courses, run the following command:

```bash
python update_courses.py
```

you will need the requests library to run this script. you can install it using pip:
```bash
pip install requests
```
