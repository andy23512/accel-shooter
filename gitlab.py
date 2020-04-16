import re
from utils import json_requests_factory

json_requests = json_requests_factory('gitlab')


def _get_user_id():
    user = json_requests('get', '/user')
    return user['id']


def get_project(project_id: str):
    return json_requests('get', f'/projects/{project_id}')


def add_issue(project_id: str, title: str, description: str):
    issue = json_requests(
        'post',
        f'/projects/{project_id}/issues',
        data={
            'title': title,
            'description': description,
            'assignee_ids': _get_user_id(),
        }
    )
    return issue
