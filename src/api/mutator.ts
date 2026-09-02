import client from "./client";
import type { AxiosRequestConfig } from "axios";

type CustomInstanceConfig = Omit<AxiosRequestConfig, "headers" | "data"> & {
  headers?: HeadersInit;
  body?: unknown;
};

export const customInstance = async <T>(
  url: string,
  config?: CustomInstanceConfig,
): Promise<T> => {
  const response = await client.request<T>({
    url,
    ...config,
    headers: config?.headers as AxiosRequestConfig["headers"],
    data: config?.body,
  });
  return response as unknown as T;
};

export default customInstance;