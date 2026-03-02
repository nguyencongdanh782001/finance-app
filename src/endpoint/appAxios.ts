import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import queryString from "query-string";

function createAxiosClient(contentType: string): AxiosInstance {
  const appAxios = axios.create({
    headers: { "Content-Type": contentType },
    paramsSerializer: (params) => queryString.stringify(params),
  });

  appAxios.interceptors.request.use((config) => {
    // Do sth
    // const token = localStorage.getItem("token");

    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }

    if (config.headers?.["Un-Authorized"]) {
      config.headers.Authorization = undefined;
      delete config.headers["Un-Authorized"];
    }

    return config;
  });

  appAxios.interceptors.response.use(
    (response: AxiosResponse) => {
      // Do sth

      return {
        ...response,
        code: response.status.toString(),
        data: response.data,
      };
    },
    async (error: AxiosError<unknown>) => {
      // Do sth
      const code = error.response?.status?.toString();

      return {
        code,
        data: error.response?.data,
      };
    },
  );
  return appAxios;
}

export default createAxiosClient("application/json, text/plain, */*");
