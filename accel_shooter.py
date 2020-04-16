#!/usr/bin/env python
import sys

import clickup
import gitlab

project_name = sys.argv[1]
task_id = sys.argv[2]
task = clickup.get_task(task_id)
task_name = task['name']
task_url = task['url']
title = sys.argv[3] if len(sys.argv) >= 4 else task_name
clickup.set_task_status(task_id, 'in progress')

project_id = gitlab.get_project_id(project_name)
issue = gitlab.add_issue(project_id, title, task_url)
issue_url = issue['web_url']
issue_number = issue['iid']

print(f'GitLab Issue Number: #{issue_number}')
print(f'GitLab Issue: {issue_url}')
print(f'ClickUp Task: {task_url}')
print(f'HackMD Daily Progress: https://hackmd.io/yuC_4rDRTUCuorv8jlEU9g?both')
