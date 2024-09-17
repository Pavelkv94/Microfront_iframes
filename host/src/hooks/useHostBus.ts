import { useEffect, useRef, useCallback } from "react";

// Define types for actions
interface Action {
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any; // Adjust this as needed based on your action payload structure
}

// Define the HostBus class
class HostBus {
  private originsWhiteList: string[];
  private iframes: Window[] = []; // Type for iframes is Window

  constructor(originsWhiteList: string[]) {
    this.originsWhiteList = originsWhiteList;
  }

  // Register an iframe
  registerIframe(event: MessageEvent) {
    const iframe = event.source as Window;
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
  sendToRemote(action: Action) {
    this.iframes.forEach((iframe) => {
      iframe.postMessage(JSON.stringify(action), "*");
    });
  }
}

// Custom hook useHostBus
export const useHostBus = (originsWhiteList: string[]) => {
  const hostBusRef = useRef<HostBus | null>(null); // Ref to hold the HostBus instance

  // Initialize HostBus instance lazily
  if (!hostBusRef.current) {
    hostBusRef.current = new HostBus(originsWhiteList);
  }

  // Define the message handler with proper typing
  const messageHandler = useCallback(
    (event: MessageEvent) => {
      if (!originsWhiteList.includes(event.origin)) {
        console.warn("Blocked message from untrusted origin:", event.origin);
        return; // Ignore messages from untrusted origins
      }

      try {
        const action: Action = JSON.parse(event.data);

        switch (action.type) {
          case "IFRAME-LOADED":
            hostBusRef.current?.registerIframe(event); // Register the iframe
            break;
          case "STATE-ACTION":
            hostBusRef.current?.sendToRemote(action); // Send the action to all registered iframes
            break;
          default:
            console.warn("Unhandled action type:", action.type);
        }
      } catch (error) {
        console.error("Failed to handle message:", error);
      }
    },
    [originsWhiteList]
  );

  useEffect(() => {
    // Add event listener for messages
    window.addEventListener("message", messageHandler);

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener("message", messageHandler);
    };
  }, [messageHandler]);

  // Expose HostBus methods
  const sendToRemote = (action: Action) => {
    hostBusRef.current?.sendToRemote(action);
  };

  const registerIframe = (event: MessageEvent) => {
    hostBusRef.current?.registerIframe(event);
  };

  return { sendToRemote, registerIframe };
};
