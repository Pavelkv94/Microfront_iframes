/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import "./App.css";

const originsWhiteList = ["http://localhost:5001", "http://localhost:5002"];
// класс шина для контроля сообщения между микрофронтами
class HostBus {
  constructor(private originsWhiteList: string[]) {}
  iframes: any[] = [];
  //подписка на iframe
  registerIframe(event: any) {
    const iframe = event.source;
    const origin = event.origin.trim("/");
    //проверка на доверенный адрес
    if (this.originsWhiteList.includes(origin)) {
      this.iframes.push(iframe);
    } else {
      console.log("BAD IFRAME ORIGIN");
    }
  }

  // отправка экшена всем подписанным ифреймам
  emit(action: any) {
    this.iframes.forEach((iframe) => {
      iframe.postMessage(JSON.stringify(action), "*");
    });
  }
}

const hostBus = new HostBus(originsWhiteList);

function App() {
  const [menu, setMenu] = useState<string[]>([]);

  const sendToken = () => {
    const action = {
      type: "TOKEN_CREATED",
      payload: { token: "XXX-YYYY" },
    };

    //отправляем всем подписанным микрофронтам
    hostBus.emit(action);
  };

  //реагируем на события из ифрейма
  useEffect(() => {
    const messageHandler = (event: MessageEvent) => {
      if (!originsWhiteList.includes(event.origin)) {
        console.warn("Blocked message from untrusted origin:", event.origin);
        return; // Ignore messages from untrusted origins
      }

      try {
        const action: any = JSON.parse(event.data);

        switch (action.type) {
          case "MENU_SENT":
            setMenu((prev) => [...prev, ...action.payload.menu]);
            break;
          case "IFRAME-LOADED":
            hostBus.registerIframe(event); // Register the iframe
            break;
          case "REDUX-ACTION":
            hostBus.emit(action); // Send the action to all registered iframes
            break;
          default:
            console.warn("Unhandled action type:", action.type);
        }
      } catch (error) {
        console.error("Failed to handle message:", error);
      }
    };

    window.addEventListener("message", messageHandler);

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener("message", messageHandler);
    };
  }, []);

  return (
    <div className="App">
      <h1>HOST APP</h1>
      <ul>
        {menu.map((el: string) => (
          <li key={el}>{el}</li>
        ))}
      </ul>
      <button onClick={sendToken}>Send Token</button>
      {/* //todo можем поместить любой сайт без X-Frame-Options */}
      <iframe src={"http://localhost:5001/"} style={{ width: "500px", height: "800px", border: "none" }}></iframe>
      <iframe src={"http://localhost:5002/"} style={{ width: "500px", height: "800px", border: "none" }}></iframe>
    </div>
  );
}

export default App;
