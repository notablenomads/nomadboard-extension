import { API_CONFIG } from '../config/constants';

export const createHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
  Accept: "application/json",
});

export const handleApiError = async (response: Response, operation: string): Promise<never> => {
  const errorText = await response.text();
  console.error(`${operation} error:`, errorText);
  throw new Error(`${operation} failed: ${response.statusText}. Response: ${errorText}`);
};

export const getAuthToken = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: false }, (token) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(token);
      }
    });
  });
};

export const getAuthTokenInteractive = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken(
      {
        interactive: true,
        scopes: API_CONFIG.SCOPES,
      },
      (token) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(token);
        }
      }
    );
  });
};

export const clearToken = async (token: string): Promise<void> => {
  if (token) {
    try {
      await new Promise<void>((resolve) => {
        chrome.identity.removeCachedAuthToken({ token }, resolve);
      });
    } catch (error) {
      console.error("Error removing token:", error);
    }
  }
};
