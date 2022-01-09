import fetch, { RequestInfo, RequestInit, Response } from "node-fetch";
import qs from "qs";
import { CONFIG } from "../config";
import { HttpMethod, Site } from "../models/models";
import { sleep } from "./sleep.utils";

const RETRY_SETTING = {
  retry: 5,
  pause: 12 * 1000,
};

async function fetchRetry(
  url: RequestInfo,
  opts?: RequestInit & {
    retry?: number;
    callback?: (retry?: number) => any;
    pause?: number;
  }
) {
  let retry = (opts && opts.retry) || 3;
  while (retry > 0) {
    try {
      return await fetch(url, opts).then(checkStatus);
    } catch (e) {
      if (opts?.callback) {
        opts.callback(retry);
      }
      retry = retry - 1;
      if (retry == 0) {
        throw e;
      }

      if (opts?.pause) {
        await sleep(opts.pause);
      }
    }
  }
  return Promise.reject();
}

function checkStatus(res: Response | undefined) {
  if (res) {
    if (res.ok) {
      return res;
    } else {
      throw Error(res.statusText);
    }
  } else {
    throw Error("Response is undefined.");
  }
}

export function callApiFactory(site: Site) {
  let apiUrl = "";
  let headers = {};
  switch (site) {
    case "GitLab":
      apiUrl = "https://gitlab.com/api/v4";
      headers = { "Private-Token": CONFIG.GitLabToken };
      break;
    case "ClickUp":
      apiUrl = "https://api.clickup.com/api/v2";
      headers = { Authorization: CONFIG.ClickUpToken };
      break;
    default:
      throw Error(`Site {site} is not supported.`);
  }
  return async <T>(
    method: HttpMethod,
    url: string,
    queryParams?: { [key: string]: any } | null,
    body?: { [key: string]: any } | string
  ): Promise<T> => {
    let params: any;
    if (typeof body === "object") {
      params = new URLSearchParams();
      Object.entries(body).forEach(([key, value]) => {
        params.set(key, value);
      });
    }
    if (typeof body === "string") {
      params = body;
    }
    if (queryParams) {
      url += "?" + qs.stringify(queryParams, { arrayFormat: "brackets" });
    }
    return fetchRetry(
      apiUrl + url,
      method === "get"
        ? {
            method,
            headers,
            ...RETRY_SETTING,
          }
        : { method, headers, body: params, ...RETRY_SETTING }
    )
      .then((res) => res?.json())
      .catch((error) => {
        console.log(apiUrl + url);
        throw error;
      });
  };
}
