import React, { useEffect, useRef, useState } from "react";
import notification from "../../assets/notification.mp3";
import { Offcanvas, FormControl } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import { AiOutlineMessage } from "react-icons/ai";
import { BsSendFill, BsEmojiSmile } from "react-icons/bs";
import Picker from "emoji-picker-react";
import "./Chat.css";

const ChatPanel = ({
  isVisible,
  toggleModal,
  chatMessages,
  sendMessage,
  setSendMessage,
  onSearch,
  receivedMessage,
}) => {
  const messagesEndRef = useRef(null);
  const notificationSound = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "auto" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  useEffect(() => {
    if (receivedMessage.text && !isVisible) {
      if (notificationSound.current) {
        notificationSound.current.play();
      }
      toast.info(`${receivedMessage.text}`, {
        icon: <AiOutlineMessage className="notification-message" size={30} />,
      });
    }
  }, [receivedMessage, isVisible]);

  const handleSend = () => {
    if (sendMessage.trim()) {
      onSearch(sendMessage);
      setSendMessage("");
      setShowEmojiPicker(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSend();
    }
  };

  const handleEmojiSelect = (emojiObject) => {
    setSendMessage((prevMessage) => prevMessage + emojiObject.emoji);
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <audio src={notification} ref={notificationSound} />

      <Offcanvas
        show={isVisible}
        onHide={() => {
          toggleModal(false);
          setShowEmojiPicker(false);
        }}
        placement="end"  // 👈 this makes it slide out from right
        className="chat-offcanvas"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Chat</Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body
          className="chat-body"
          onClick={() => setShowEmojiPicker(false)}
        >
          {chatMessages.length ? (
            <div className="message">
              {chatMessages.map((message, index) => (
                <div
                  key={index}
                  className={
                    message.type === "sent"
                      ? "message-sent"
                      : "message-reciever"
                  }
                >
                  {message.message}
                </div>
              ))}
              <div ref={messagesEndRef}></div>
            </div>
          ) : (
            <div className="no-message">
              <span>No messages here</span>
            </div>
          )}
        </Offcanvas.Body>

        <div className="chat-input-section">
          <FormControl
            placeholder="Send a message"
            className="chat-input"
            value={sendMessage}
            onChange={(e) => setSendMessage(e.target.value)}
            onClick={() => setShowEmojiPicker(false)}
            onKeyPress={handleKeyPress}
          />
          <BsEmojiSmile
            className="emoji-toggle"
            size={28}
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          />
          {showEmojiPicker && (
            <Picker
              searchDisabled={true}
              height={310}
              width={310}
              emojiStyle="google"
              onEmojiClick={handleEmojiSelect}
              className="emoji"
            />
          )}
          <BsSendFill className="send-message" size={28} onClick={handleSend} />
        </div>
      </Offcanvas>
    </>
  );
};

export default ChatPanel;
