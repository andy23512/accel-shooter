from utils import json_requests_factory

json_requests = json_requests_factory('clickup')


def get_task(task_id: str):
    return json_requests('get', f'/task/{task_id}')


def set_task_status(task_id: str, status: str):
    return json_requests('put', f'/task/{task_id}', data={'status': status})
