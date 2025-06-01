import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';

function Messages() {
  const [searchParams] = useSearchParams();
  const listingId = searchParams.get('listingId');
  const hostId = searchParams.get('hostId');
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [listing, setListing] = useState(null);
  const token = localStorage.getItem('token');

  // ✅ Step 1: Fetch listing info
  useEffect(() => {
    if (!listingId) return;

    axios
      .get(`http://localhost:5050/api/listings/${listingId}`)
      .then((res) => setListing(res.data))
      .catch((err) => console.error('❌ Failed to fetch listing:', err));
  }, [listingId]);

  // ✅ Step 2: Get or create the conversation
  useEffect(() => {
    if (!token || !hostId) return;

    axios
      .post(
        'http://localhost:5050/api/messages/conversations',
        { recipientId: hostId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((res) => {
        setConversationId(res.data._id);
        setMessages(res.data.messages || []);
      })
      .catch((err) => {
        console.error('❌ Failed to fetch or create conversation:', err);
      });
  }, [hostId, token]);

  // ✅ Step 3: Send message
  const handleSend = async () => {
    if (!content.trim() || !conversationId) return;

    try {
      const res = await axios.post(
        `http://localhost:5050/api/messages/${conversationId}`,
        { content },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessages((prev) => [...prev, res.data]);
      setContent('');
    } catch (err) {
      console.error('❌ Failed to send message:', err);
    }
  };

  return (
    <div style={styles.container}>
      <h2>📬 Messages</h2>

      {/* ✅ Listing Info */}
      {listing && (
        <div style={styles.listingPreview}>
          <img
            src={listing.images?.[0] || '/default.jpg'}
            alt={listing.title}
            style={styles.previewImage}
          />
          <div>
            <h4 style={{ margin: 0 }}>{listing.title}</h4>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#555' }}>
              {listing.city} • {listing.price}€
            </p>
          </div>
        </div>
      )}

      {/* ✅ Message History */}
      <div style={styles.chatBox}>
        {messages.map((msg, i) => (
          <div key={i} style={styles.message}>
            <strong>{msg.sender?.name || 'Utilisateur'}:</strong> {msg.content}
          </div>
        ))}
      </div>

      {/* ✅ Message Input */}
      <div style={styles.inputArea}>
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Écrire un message..."
          style={styles.input}
        />
        <button onClick={handleSend} style={styles.button}>Envoyer</button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '600px',
    margin: '0 auto',
  },
  listingPreview: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1.5rem',
    padding: '1rem',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ddd',
    borderRadius: '8px',
  },
  previewImage: {
    width: '80px',
    height: '60px',
    objectFit: 'cover',
    borderRadius: '4px',
  },
  chatBox: {
    minHeight: '300px',
    maxHeight: '400px',
    overflowY: 'auto',
    border: '1px solid #ccc',
    padding: '1rem',
    borderRadius: '6px',
    marginBottom: '1rem',
    backgroundColor: '#fff',
  },
  message: {
    marginBottom: '0.75rem',
    background: '#f8f9fa',
    padding: '0.5rem',
    borderRadius: '4px',
  },
  inputArea: {
    display: 'flex',
    gap: '1rem',
  },
  input: {
    flex: 1,
    padding: '0.75rem',
    fontSize: '1rem',
    borderRadius: '6px',
    border: '1px solid #ccc',
  },
  button: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
};

export default Messages;
