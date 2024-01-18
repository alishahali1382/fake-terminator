import csv
import json
import os
import re
from pathlib import Path

import requests

edu_url = "https://edu.sharif.edu/list/courses"


class Course:
    def __init__(self, terminator_id, id, group, units, course_name, instructor, course_time, exam_time, details, link, *args) -> None:
        self.info = details
        self.course_id = f"{id}-{group}"
        self.course_number = str(id)
        self.name = course_name
        self.units = int(units)
        self.capacity = -1
        self.instructor = instructor
        self.class_times = self.get_class_times(course_time)
        self.id = terminator_id
        self.exam_time = exam_time
    
    @staticmethod
    def get_class_times(class_time_raw):
        if not class_time_raw:
            return ""
        hours = []
        for s in class_time_raw.split("تا"):
            h = re.findall(r'\d+', s)
            if len(h) == 1:
                hours.append(h[0])
            else:
                hours.append(str(int(h[0]) + int(h[1]) / 60))
        
        times = []
        class_time_raw_split = class_time_raw.split()
        for day_num, day_name in enumerate(["شنبه", "یک‌شنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه"]):
            if day_name in class_time_raw_split:
                times.append({'start': hours[0], 'end': hours[1], 'day': day_num})
        
        return json.dumps(times)


def fetch_courses_raw(edu_content):
    courses_pattern = re.compile(r'var\s+courses\s*=\s*(\[.*\]);', re.DOTALL)
    match = courses_pattern.search(edu_content)
    assert match, "No courses found!"
    return eval(match.group(1))

def write_courses_to_csv(courses, csv_filename):
    with open(csv_filename, "w") as f:
        writer = csv.writer(f)
        writer.writerow(["id", "group", "units", "course_name", "instructor", "course_time", "exam_time", "details", "link"])
        for course in courses:
            writer.writerow(course)

def get_departments(edu_content):
    return re.findall(r'<option value="(\d+)">(.*?)</option>', edu_content)

def get_courses(edu_content):
    courses_raw = fetch_courses_raw(edu_content)
    return [Course(i, *course) for i, course in enumerate(courses_raw)]


def write_courses_json(edu_content):
    all_courses = get_courses(edu_content)
    # group courses by str(course.course_id)[:2]
    course_dict: dict[str, list[Course]] = dict()
    for course in all_courses:
        course_dict.setdefault(str(course.course_id)[:2], []).append(course.__dict__)
    
    for department, courses in course_dict.items():
        path = Path("courses/list") / f"{department}"
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, "w") as f:
            f.write(json.dumps(courses, indent=4))


if __name__ == "__main__":
    os.chdir(os.path.dirname(__file__))
    os.chdir('site')
    content = requests.get(edu_url).text
    write_courses_json(content)
