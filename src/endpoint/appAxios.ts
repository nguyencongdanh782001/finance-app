import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import queryString from "query-string";
import { API_ROUTES } from "@/constant/routes";

const ACCESS_TOKEN_STORAGE_KEY = "accessToken";
export const AUTH_TOKEN_CHANGED_EVENT = "auth-token-changed";

type RetriableAxiosConfig = AxiosError["config"] & {
  _retry?: boolean;
  _skipAuthRefresh?: boolean;
};

export const authTokenStorage = {
  getAccessToken: () => {
    if (typeof window === "undefined") {
      return null;
    }

    return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
  },
  setAccessToken: (token: string) => {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
    window.dispatchEvent(
      new CustomEvent(AUTH_TOKEN_CHANGED_EVENT, {
        detail: { accessToken: token },
      }),
    );
  },
  clearAccessToken: () => {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    window.dispatchEvent(
      new CustomEvent(AUTH_TOKEN_CHANGED_EVENT, {
        detail: { accessToken: null },
      }),
    );
  },
};

function createAxiosClient(contentType: string): AxiosInstance {
  const appAxios = axios.create({
    headers: { "Content-Type": contentType },
    withCredentials: true,
    paramsSerializer: (params) => queryString.stringify(params),
  });

  appAxios.interceptors.request.use((config) => {
    const token = authTokenStorage.getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.headers?.["Un-Authorized"]) {
      (config as RetriableAxiosConfig)._skipAuthRefresh = true;
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
      const originalConfig = error.config as RetriableAxiosConfig;

      if (
        error.response?.status === 401 &&
        originalConfig &&
        !originalConfig._retry &&
        !originalConfig._skipAuthRefresh &&
        originalConfig.url !== API_ROUTES.authRefresh
      ) {
        originalConfig._retry = true;

        const refreshResponse = await axios
          .post<{ accessToken: string }>(
            API_ROUTES.authRefresh,
            {},
            { withCredentials: true },
          )
          .catch(() => null);

        if (refreshResponse?.data.accessToken) {
          authTokenStorage.setAccessToken(refreshResponse.data.accessToken);
          originalConfig.headers = originalConfig.headers || {};
          originalConfig.headers.Authorization = `Bearer ${refreshResponse.data.accessToken}`;

          return appAxios(originalConfig);
        }

        authTokenStorage.clearAccessToken();
      }

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
