/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import "./App.css";
import { useMicrofrontendBus } from "./hooks/useMicrofrontendBus";

function App() {
  const [token, setToken] = useState();

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

  //отправка данных в родителя
  useEffect(() => {
    if (!mfBus) return;

    const action = {
      type: "MENU_SENT",
      payload: { menu: ["4444", "5555", "66666"] },
    };
    mfBus.emit(action);
  }, []);

  useEffect(() => {
    if (!mfBus) return;

    mfBus.registerMeInHost();
  }, []);

  const onProductDeletedHandler = () => {
    const ipcAction = {
      type: "STATE-ACTION",
      payload: {
        originalAction: {
          type: "CART-PRODUCT-DELETED",
          payload: { productId: 121 },
        },
        source: "MICROFRONT2",
      },
    };
    mfBus.emit(ipcAction);
  };
  return (
    <>
      <h1>REMOTE APP 2</h1>
      <p>token is {token}</p>
      <button onClick={onProductDeletedHandler}>hello to first microfrontend</button>
    </>
  );
}

export default App;
