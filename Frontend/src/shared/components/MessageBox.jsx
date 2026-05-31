function MessageBox({ message = "", type = "error" }) {
  if (!message) return null;

  return <p className={`message-box ${type}`}>{message}</p>;
}

export default MessageBox;