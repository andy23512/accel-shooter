import json
import os
import requests

dir_path = os.path.dirname(os.path.realpath(__file__))


def json_requests_factory(site: str):
    if site == 'gitlab':
        api_url = 'https://gitlab.com/api/v4'
        with open(os.path.join(dir_path, 'gitlab_token')) as f:
            headers = {'Private-Token': f.readline().rstrip('\n\r')}
    elif site == 'clickup':
        api_url = 'https://api.clickup.com/api/v2'
        with open(os.path.join(dir_path, 'clickup_token')) as f:
            headers = {'Authorization': f.readline().rstrip("\n\r")}
    else:
        raise ValueError('This site is not supported')

    def json_requests(method: str, url: str, data=None):
        if method == 'get':
            response = requests.get(f'{api_url}{url}', headers=headers)
        elif method in ['post', 'put']:
            response = getattr(requests, method)(f'{api_url}{url}', headers=headers, data=data)
        else:
            raise ValueError('Method not supported')
        response.raise_for_status()
        return json.loads(response.content)
    return json_requests
