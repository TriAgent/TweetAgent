import { errorToast } from "@components/base/Toast/error";

export const apiGet = async <ReturnType>(url: string, errorValue: ReturnType = null, errorMsg: string = null): Promise<ReturnType> => {
  try {
    const response = await fetch(url);
    if (!response.ok)
      throw new Error(response.statusText);

    return await response.json();
  }
  catch (e) {
    if (errorMsg)
      console.warn(errorMsg, e);
    else
      console.warn(e);
    return errorValue;
  }
}

export const apiPost = async <ReturnType>(url: string, body: any = {}, errorValue: ReturnType = null, errorMsg: string = null): Promise<ReturnType> => {
  return apiPostOrUpdate("POST", url, body, errorValue, errorMsg);
}

export const apiPut = async <ReturnType>(url: string, body: any = {}, errorValue: ReturnType = null, errorMsg: string = null): Promise<ReturnType> => {
  return apiPostOrUpdate("PUT", url, body, errorValue, errorMsg);
}

export const apiPostOrUpdate = async <ReturnType>(method: "POST"|"PUT", url: string, body: any = {}, errorValue: ReturnType = null, errorMsg: string = null): Promise<ReturnType> => {
  try {
    const response = await fetch(url, {
      method,
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      handleNestJSError(await response.text());
      return errorValue;
    }

    return await response.json();
  }
  catch (e) {
    if (errorMsg)
      console.warn(errorMsg, e);
    else
      console.warn(e);

    return errorValue;
  }
}

/**
 * Posts a multipart form data, expects JSON output.
 */
export const apiMultipartPOST = async <ReturnType>(url: string, body: FormData, errorValue: ReturnType = null, errorMsg: string = null): Promise<ReturnType> => {
  try {
    const response = await fetch(url, { method: "POST", body });
    if (!response.ok)
      throw new Error(response.statusText);

    return await response.json();
  }
  catch (e) {
    if (errorMsg)
      console.warn(errorMsg, e);
    else
      console.warn(e);
    return errorValue;
  }
}

type NestJSError = {
  statusCode: number;
  message: string;
}

/**
 * Tries to understand a non http 200 error as a nestjs error format and shows
 * an error toast to user.
 */
const handleNestJSError = (nestJsPayload: string) => {
  try {
    var jsonError = JSON.parse(nestJsPayload);
    if ("statusCode" in jsonError && "message" in jsonError) {
      // This seems to be anestjs error.
      const nestError = jsonError as NestJSError;
      errorToast(nestError.message);
    }
  }
  catch (e) {
    throw new Error(nestJsPayload);
  }
}