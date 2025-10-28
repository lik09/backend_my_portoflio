import axios from "axios";
import { config } from "./config";

export const request = (url="" , method ="get" ,data={}, isFormData = false)=>{
    return axios({
        url: config.base_url_api + url,
        method: method,
        data: data,
        headers: {
            "Accept" : "application/json",
            "Content-Type": isFormData ? "multipart/form-data" : "application/json"

        }
    }).then(res => {
        return res.data;
    }).catch((error) => {
         console.log("Error");
        return "error-in-catch";
    });
}


export async function requestFormData(url, method = 'GET', body = null, config = {}) {
// const baseUrl = config.base_url_api; // your API base
  const baseUrl = 'http://localhost:8000/api/'; // your API base


  const options = {
    method,
    headers: {
      // Don't set Content-Type for FormData; browser sets it with boundary
      ...config.headers,
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
