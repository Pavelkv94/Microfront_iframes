/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import "./App.css";

const hostOrigin = "http://localhost:5000";
// класс шина для контроля сообщения c хостом
class MFBus {
  constructor(private hostOrigin: string) {
    window.addEventListener("message", (event) => {
      const action = JSON.parse(event.data);
      if (this.subscribers[action.type]) {
        this.subscribers[action.type].forEach((subscriber: any) => {
          subscriber(action);
        });
      }
    });
  }

  subscribers: any = {
    // 'action-type': []
  };

  //подписка на iframe
  registerMeInHost() {
    const action = {
      type: "IFRAME-LOADED",
    };
    window.parent.postMessage(JSON.stringify(action), this.hostOrigin);
  }

  // отправка экшена всем подписанным ифреймам
  emit(action: any) {
    window.parent.postMessage(JSON.stringify(action), this.hostOrigin);
  }

  subscribe(actionType: string, callback: any) {
    if (!this.subscribers[actionType]) {
      this.subscribers[actionType] = [];
    }

    this.subscribers[actionType].push(callback);

    return () => {
      this.subscribers[actionType] = this.subscribers[actionType].filter((s: any) => s !== callback);
    };
  }
}

const mfBus = new MFBus(hostOrigin);

function App() {
  const [token, setToken] = useState();
  const [messageFromMicro2, setMessageFromMicro2] = useState("");

  //реагируем на события извне
  useEffect(() => {
    //происходит подписка ифункция возвращает функцию отписки
    return mfBus.subscribe("TOKEN_CREATED", (action: any) => {
      setToken(action.payload.token);
    });
  }, []);

  useEffect(() => {
    //происходит подписка ифункция возвращает функцию отписки
    return mfBus.subscribe("REDUX-ACTION", (action: any) => {
      switch (action.payload.originalAction.type) {
        case "CART-PRODUCT-DELETED": {
          setMessageFromMicro2(action.payload.originalAction.payload.productId);
        }
      }
    });
  }, []);

  useEffect(() => {
    mfBus.registerMeInHost();
  }, []);

  //отправка данных в родителя
  useEffect(() => {
    const action = {
      type: "MENU_SENT",
      payload: { menu: ["1", "222222", "33333"] },
    };
    mfBus.emit(action);
  }, []);

  return (
    <>
      <h1>REMOTE APP</h1>
      <p>token is {token}</p>
      <p>Product deleted: {messageFromMicro2}</p>
    </>
  );
}

export default App;
