import { configureStore } from "@reduxjs/toolkit";
import fetchReducer from "./fetch/fetchUser"; 
import chatReducer from "./chat/chat"

const store = configureStore({
  reducer: {
    fetch: fetchReducer, 
    chat: chatReducer, 
  },
});

export default store;
