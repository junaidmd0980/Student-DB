function MessageBox({ message = "", type = "info" }) {
  if (!message) return null;

  return <p className={`message-box ${type}`}>{message}</p>;
}

export default MessageBox;