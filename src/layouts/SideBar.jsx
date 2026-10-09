import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import AddIcon from "@mui/icons-material/Add";
import ChatIcon from "@mui/icons-material/Chat";
import DeleteIcon from "@mui/icons-material/Delete";

import { addChat, removeChat } from "../redux/slices/chatSlice";

const SideBar = ({ openSideBar, setOpenSideBar }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id: currentId } = useParams();

  const { data } = useSelector((state) => state.chat);

  // Tạo cuộc trò chuyện mới
  const handleNewChat = () => {
    const id = crypto.randomUUID();

    dispatch(addChat({ id }));
    navigate(`/chat/${id}`);

    // Đóng sidebar trên màn hình điện thoại
    setOpenSideBar?.(false);
  };

  // Mở cuộc trò chuyện
  const handleOpenChat = (chatId) => {
    navigate(`/chat/${chatId}`);
    setOpenSideBar?.(false);
  };

  // Xóa cuộc trò chuyện
  const handleRemoveChat = (e, chatId) => {
    e.stopPropagation();

    dispatch(removeChat(chatId));

    // Nếu đang xem chat vừa xóa thì quay về Home
    if (currentId === chatId) {
      navigate("/chat/info");
    }
  };

  return (
    <>
      {/* Overlay trên điện thoại */}
      {openSideBar && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setOpenSideBar?.(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50
          w-72 h-dvh p-8
          text-white bg-[#1e1f20]
          overflow-y-auto
          transition-transform duration-300
          lg:static lg:translate-x-0 lg:shrink-0
          ${openSideBar ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="mt-20">
          {/* Nút tạo chat */}
          <button
            type="button"
            onClick={handleNewChat}
            className="w-full px-4 py-3 flex items-center gap-2
              bg-gray-600 hover:bg-gray-500 mb-10 rounded-lg
              transition-colors"
          >
            <AddIcon />
            <span>Cuộc trò chuyện mới</span>
          </button>

          {/* Danh sách chat */}
          <div className="space-y-4">
            <p className="text-gray-300">Gần đây</p>

            <div className="flex flex-col gap-3">
              {data?.map((chat) => (
                <div
                  key={chat.id}
                  className={`
                    flex items-center justify-between gap-2
                    p-3 rounded-lg transition-colors
                    ${
                      currentId === chat.id
                        ? "bg-gray-600"
                        : "bg-gray-800 hover:bg-gray-700"
                    }
                  `}
                >
                  {/* Bấm để mở chat */}
                  <button
                    type="button"
                    onClick={() => handleOpenChat(chat.id)}
                    className="flex items-center gap-3 min-w-0 flex-1 text-left"
                  >
                    <ChatIcon className="shrink-0" />

                    <span className="truncate">
                      {chat.title || "Cuộc trò chuyện"}
                    </span>
                  </button>

                  {/* Nút xóa */}
                  <button
                    type="button"
                    title="Xóa cuộc trò chuyện"
                    aria-label="Xóa cuộc trò chuyện"
                    onClick={(e) => handleRemoveChat(e, chat.id)}
                    className="shrink-0 text-gray-400 hover:text-red-400"
                  >
                    <DeleteIcon />
                  </button>
                </div>
              ))}

              {(!data || data.length === 0) && (
                <p className="text-sm text-gray-500">
                  Chưa có cuộc trò chuyện nào.
                </p>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default SideBar;
