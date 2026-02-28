import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface RequestConfig extends AxiosRequestConfig {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-explicit-any
export interface Response<T = any> extends AxiosResponse<T> {}

export interface ErrorWithResponse {
  response?: { status?: number; data?: unknown };
  message?: string;
}

export class Request {
  constructor(private request = axios) {}

  public get<T>(url: string, config: RequestConfig = {}): Promise<Response<T>> {
    return this.request.get<T, Response<T>>(url, config);
  }

  public static isRequestError(error: AxiosError | ErrorWithResponse): boolean {
    return Boolean(error.response && error.response.status !== undefined);
  }
}
