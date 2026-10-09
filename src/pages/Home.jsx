import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addChat, addMessage, setNameChat } from "../redux/slices/chatSlice";
import Gemini from "../gemini";

const Home = () => {
  const [inputChat, setInputChat] = useState("");
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);
  const { data } = useSelector((state) => state.chat);
  const isChatPage = Boolean(id && id !== "info");
  const currentChat = data.find((chat) => chat.id === id);
  const messages = currentChat?.message || [];

  // Cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, loading]);

  // Tạo tiêu đề cuộc trò chuyện
  const generateChatTitle = async (text, chatId) => {
    try {
      const title = await Gemini(
        `Give this conversation a short title, maximum 10 characters. Topic: ${text}. Return only the title.`,
      );

      if (title?.trim()) {
        dispatch(
          setNameChat({
            newTitle: title.trim(),
            id: chatId,
          }),
        );
      }
    } catch (error) {
      console.error("Không thể tạo tiêu đề:", error);
    }
  };

  // Gửi tin nhắn đến Gemini
  const sendMessage = async (text, chatId, isNewChat = false) => {
    if (!text.trim() || loading) return;
    setLoading(true);
    try {
      const chat = data.find((item) => item.id === chatId);
      const history = isNewChat ? [] : chat?.message || [];
      const response = await Gemini(text, history);
      if (!response) {
        throw new Error("Gemini không trả về nội dung.");
      }
      dispatch(
        addMessage({
          id: chatId,
          userMessage: text,
          botMessage: response,
        }),
      );

      const shouldGenerateTitle =
        isNewChat ||
        (chat?.title?.toLowerCase() === "chat" && history.length === 0);

      if (shouldGenerateTitle) {
        await generateChatTitle(text, chatId);
      }
    } catch (error) {
      console.error("Lỗi gửi tin nhắn:", error);
      alert(error.message || "Không thể gửi tin nhắn. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  // Tạo chat mới khi cần
  const getChatId = () => {
    if (isChatPage) return { chatId: id, isNewChat: false };
    const chatId = crypto.randomUUID();
    dispatch(addChat({ id: chatId }));
    navigate(`/chat/${chatId}`);
    return { chatId, isNewChat: true };
  };

  // Xử lý gửi form
  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = inputChat.trim();
    if (!text || loading) return;
    setInputChat("");
    const { chatId, isNewChat } = getChatId();
    await sendMessage(text, chatId, isNewChat);
  };

  return (
    <div className="mx-auto mt-16 w-[95%] max-w-[90%] sm:mt-32 md:mt-64 sm:w-full">
      <div className="flex flex-col space-y-5 text-center">
        {isChatPage ? (
          <div className="flex h-[60dvh] min-h-[250px] flex-col space-y-4 overflow-x-hidden overflow-y-auto p-2 text-left sm:h-[400px] sm:p-4">
            {messages.map((item) => (
              <div
                className="flex min-w-0 items-baseline gap-3 sm:gap-6"
                key={item.id}
              >
                <p className="shrink-0 text-sm text-white sm:text-base">
                  {item.isBot ? "Gemini" : "Bạn"}
                </p>

                {item.isBot ? (
                  <div
                    className="min-w-0 break-words text-sm text-white sm:text-base"
                    dangerouslySetInnerHTML={{ __html: item.text }}
                  />
                ) : (
                  <p className="min-w-0 break-words text-sm text-white sm:text-base">
                    {item.text}
                  </p>
                )}
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div>
            <p className="inline-block bg-gradient-to-r from-blue-200 to-blue-800 bg-clip-text text-2xl text-transparent sm:text-3xl">
              Welcome to AI Studio
            </p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-4 flex w-full items-center gap-2 sm:gap-4"
        >
          <input
            type="text"
            value={inputChat}
            onChange={(e) => setInputChat(e.target.value)}
            disabled={loading}
            className="w-full min-w-0 rounded-2xl border border-transparent bg-input p-3 text-sm text-primary caret-gray-300 focus:outline-none focus:ring-0 sm:p-4 sm:text-base"
            placeholder="Nhập nội dung..."
          />

          <button
            type="submit"
            disabled={!inputChat.trim() || loading}
            className="shrink-0 rounded-lg bg-blue-500 px-4 py-3 text-sm text-white disabled:opacity-50 sm:p-4 sm:text-base"
          >
            Gửi
          </button>
        </form>
      </div>
    </div>
  );
};

export default Home;