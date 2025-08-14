import { useCallback } from "react";
import { ApiResponse } from "@/types";

export const useChromeMessaging = () => {
  const sendMessage = useCallback(<T = any>(action: string, data?: any): Promise<ApiResponse<T>> => {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ action, ...data }, (response: ApiResponse<T>) => {
        resolve(response);
      });
    });
  }, []);

  const sendMessageToTab = useCallback(<T = any>(tabId: number, action: string, data?: any): Promise<ApiResponse<T>> => {
    return new Promise((resolve) => {
      chrome.tabs.sendMessage(tabId, { action, ...data }, (response: ApiResponse<T>) => {
        resolve(response);
      });
    });
  }, []);

  return { sendMessage, sendMessageToTab };
};
