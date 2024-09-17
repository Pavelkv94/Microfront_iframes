/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import "./App.css";
import { useMicrofrontendBus } from "./hooks/useMicrofrontendBus";

// класс шина для контроля сообщения c хостом

function App() {
  const [token, setToken] = useState();
  const [messageFromMicro2, setMessageFromMicro2] = useState("");
  const hostOrigin = "http://localhost:5000";

  const mfBus = useMicrofrontendBus(hostOrigin); // Use the custom useBus hook

  //реагируем на события извне
  useEffect(() => {
    if (!mfBus) return;

    //происходит подписка ифункция возвращает функцию отписки
    return mfBus.subscribe("TOKEN_CREATED", (action: any) => {
      setToken(action.payload.token);
    });
  }, []);

  useEffect(() => {
    if (!mfBus) return;

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
    if (!mfBus) return;

    mfBus.registerMeInHost();
  }, []);

  //отправка данных в родителя
  useEffect(() => {
    if (!mfBus) return;

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
