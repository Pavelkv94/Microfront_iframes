/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef } from "react";

// HostBus class as before
class HostBus {
  private originsWhiteList: string[];
  iframes: any[] = [];

  constructor(originsWhiteList: string[]) {
    this.originsWhiteList = originsWhiteList;
  }

  // Subscribe/register an iframe
  registerIframe(event: MessageEvent) {
    const iframe = event.source;
    const origin = event.origin.replace(/\/$/, ""); // Trim trailing slash from origin

    // Check if the origin is trusted
    if (this.originsWhiteList.includes(origin)) {
      if (!this.iframes.includes(iframe)) {
        this.iframes.push(iframe);
        console.log("Iframe registered:", origin);
      }
    } else {
      console.log("Untrusted iframe origin:", origin);
    }
  }

  // Emit action to all registered iframes
  emit(action: any) {
    this.iframes.forEach((iframe) => {
      iframe.postMessage(JSON.stringify(action), "*");
    });
  }
}

// Custom hook useHostBus
export const useHostBus = (originsWhiteList: string[]) => {
  const hostBusRef = useRef<HostBus | null>(null); // Ref to hold the HostBus instance

  // Create HostBus instance lazily
  if (!hostBusRef.current) {
    hostBusRef.current = new HostBus(originsWhiteList);
  }

  // Expose HostBus methods (emit and registerIframe)
  const emit = (action: any) => {
    hostBusRef.current?.emit(action);
  };

  const registerIframe = (event: MessageEvent) => {
    hostBusRef.current?.registerIframe(event);
  };

  return { emit, registerIframe };
};
