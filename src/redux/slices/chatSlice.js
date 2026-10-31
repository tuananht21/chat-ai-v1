import { createSlice } from "@reduxjs/toolkit"
import { marked } from "marked";
import DOMPurify from 'dompurify';

const initData = {
  data: []
}

const chatSlice = createSlice({
  name: 'chat',
  initialState: initData,
  reducers: {
    addChat: (state, action) => {
      const id = action.payload?.id || crypto.randomUUID();
      state.data.push({
        id: id,
        title: 'chat',
        message: []
      });
    },
    addMessage: (state, action) => {
      const { id, userMessage, botMessage } = action.payload;
      const chat = state.data.find((item) => item.id === id);
      if (chat) {
        const messageFormat = marked.parse(botMessage);
        const safeChat = DOMPurify.sanitize(messageFormat);
        const newMessage = [
          ...chat.message,
          { id: crypto.randomUUID(), text: userMessage, isBot: false },
          { id: crypto.randomUUID(), text: safeChat, isBot: true },
        ];

        chat.message = newMessage;
        //state.data = [...state.data];
      }
    },
    removeChat: (state, action) => {
      state.data = state.data.filter((chat) => chat.id !== action.payload);
    },
    setNameChat: (state, action) => {
      const { newTitle, id } = action.payload
      const chat = state.data.find((chat) => chat.id === id);
      if (chat) {
        chat.title = newTitle;
      }
    },
  }
});

export const { addChat, removeChat, addMessage, setNameChat } = chatSlice.actions

export default chatSlice.reducer