#!/usr/bin/env python
import json
import sys
import webbrowser

import clickup
import gitlab

with open('./note_url') as f:
    note_url = f.readline().rstrip('\n\r')

with open('./project_map.json') as f:
    project_map = json.load(f)
if sys.argv[1] in project_map:
    project_id = project_map[sys.argv[1]]
else:
    project_id = sys.argv[1].replace('/', '%2F')
task_id = sys.argv[2]
task = clickup.get_task(task_id)
task_name = task['name']
task_url = task['url']
title = sys.argv[3] if len(sys.argv) >= 4 else task_name
clickup.set_task_status(task_id, 'in progress')

issue = gitlab.add_issue(project_id, title, task_url)
issue_url = issue['web_url']
issue_number = issue['iid']

print(f'GitLab Issue Number: #{issue_number}')
print(f'GitLab Issue: {issue_url}')
print(f'ClickUp Task: {task_url}')
print(f'HackMD Daily Progress: {note_url}')
webbrowser.open(note_url, new=2)
webbrowser.open(task_url, new=2)
webbrowser.open(issue_url, new=2)
