import axios from "axios";
import { config } from "./config";

export const request = (url="" , method ="get" ,data={}, isFormData = false)=>{
    const token = localStorage.getItem('auth_token');
    return axios({
        url: config.base_url_api + url,
        method: method,
        data: data,
        headers: {
            "Accept" : "application/json",
            "Accept-Language": localStorage.getItem('lang') || 'en',
            ...(isFormData ? {} : { "Content-Type": "application/json" }),
            ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        }
    }).then(res => {
        return res.data;
    }).catch((error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            window.location.href = '/login';
            return null;
        }
        return { error: true, ...error.response?.data };
    });
}


export async function requestFormData(url, method = 'GET', body = null, opts = {}) {
  const baseUrl = config.base_url_api;

  const token = localStorage.getItem('auth_token');
  const options = {
    method,
    headers: {
      "Accept-Language": localStorage.getItem('lang') || 'en',
      ...opts.headers,
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    },
  };

  if (body) {
    options.body = body;
  }

  try {
    const response = await fetch(baseUrl + url, options);
    if (!response.ok) {
      // handle HTTP errors
      const errorText = await response.text();
      throw new Error(errorText || 'HTTP error');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}
