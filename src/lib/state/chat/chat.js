import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    chatId: null,
    user: null,
    isCurrentUserBlocked: false,
    isRecieverUserBlocked: false,
  },
  reducers: {
    changeChat(state, action) {
      const { chatId, user, curruser } = action.payload;

      if (user.blocked.includes(curruser.id)) {
        state.chatId = chatId;
        state.user = null;
        state.isCurrentUserBlocked = true;
        state.isRecieverUserBlocked = false;
      } else if (curruser && curruser.blocked.includes(user.id)) {
        state.chatId = chatId;
        state.user = user;
        state.isCurrentUserBlocked = false;
        state.isRecieverUserBlocked = true;
      } else {
        state.chatId = chatId;
        state.user = user;
        state.isCurrentUserBlocked = false;
        state.isRecieverUserBlocked = false;
      }
    },
    toggleBlock(state) {
      state.isRecieverUserBlocked = !state.isRecieverUserBlocked;
    },
  },
});

export const { changeChat, toggleBlock } = chatSlice.actions;
export default chatSlice.reducer;
