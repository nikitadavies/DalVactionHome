import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import { toast } from 'react-toastify';

export const AgentRooms = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editRoomData, setEditRoomData] = useState({
    roomId: "",
    roomType: "",
    capacity: "",
    price: "",
    furnishedType: "",
    additionalFeature: "",
    feedbackId: "",
    PolarityOfFeedback: "",
    discountCode: "",
    propertyAgentId: "",
  });

  const fetchRooms = async () => {
    try {
      const propertyAgentId = JSON.parse(
        localStorage.getItem("userDetails")
      )?.userId;
      api.property.getProperties()
      .then(response => {
          const roomsData = JSON.parse(response.body);
          console.log(roomsData);
          setRooms(Array.isArray(roomsData) ? roomsData : []);
      })
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleCreateRoom = () => {
    setIsEditing(true);
    setEditRoomData({
      roomId: "",
      roomType: "",
      capacity: "",
      price: "",
      furnishedType: "",
      additionalFeature: "",
      feedbackId: "",
      PolarityOfFeedback: "",
      discountCode: "",
      propertyAgentId: JSON.parse(localStorage.getItem("userDetails")).userId,
    });
  };

  const handleEditRoom = (room) => {
    setIsEditing(true);
    setEditRoomData(room);
  };

  const handleSaveRoom = async (e) => {
    e.preventDefault();
    try {
      if (editRoomData.roomId) {
        api.property.addRoom(editRoomData).then(() => {
          toast.success('Room edited successfully!!');
      }); 
      } else {
       const payload  =  {"roomType": editRoomData.roomType,
          "capacity": editRoomData.capacity,
          "price" : editRoomData.price,
          "furnishedType" : editRoomData.furnishedType,
          "additionalFeature" : editRoomData.additionalFeature,
          "feedbackId": editRoomData.feedbackId,
          "PolarityOfFeedback" : editRoomData.PolarityOfFeedback,
          "discountCode" : editRoomData.discountCode,
          "propertyAgentId": editRoomData.propertyAgentId}
        api.property.addRoom(payload).then(() => {
          toast.success('Room created successfully!!');
      }); 
      }
      fetchRooms();
      setIsEditing(false);
      setEditRoomData({
        roomId: "",
        roomType: "",
        capacity: "",
        price: "",
        furnishedType: "",
        additionalFeature: "",
        feedbackId: "",
        PolarityOfFeedback: "",
        discountCode: "",
        propertyAgentId: "",
      });
    } catch (error) {
      console.error("Error saving room:", error);
    }
  };

  const renderRoomCard = (room) => (
    <div key={room.roomId} style={styles.roomCard}>
      <h3>{room.roomType}</h3>
      <p>Capacity: {room.capacity}</p>
      <p>Price: {room.price}$ / PER NIGHT</p>
      <p>Furnished: {room.furnishedType}</p>
      <p>Additional Features: {room.additionalFeature}</p>
      <p>Feedback ID: {room.feedbackId}</p>
      <p>Polarity of Feedback: {room.PolarityOfFeedback}</p>
      <p>Discount Code: {room.discountCode}</p>
      <button style={styles.editButton} onClick={() => handleEditRoom(room)}>
        Edit Room
      </button>
    </div>
  );

  const renderRoomForm = () => (
    <form onSubmit={handleSaveRoom} style={styles.form}>
      <div style={styles.formGroup}>
        <label style={styles.label}>Room Type:</label>
        <input
          type="text"
          name="roomType"
          value={editRoomData.roomType}
          onChange={(e) =>
            setEditRoomData({ ...editRoomData, roomType: e.target.value })
          }
          required
          style={styles.input}
        />
      </div>
      <div style={styles.formGroup}>
        <label style={styles.label}>Capacity:</label>
        <input
          type="text"
          name="capacity"
          value={editRoomData.capacity}
          onChange={(e) =>
            setEditRoomData({ ...editRoomData, capacity: e.target.value })
          }
          required
          style={styles.input}
        />
      </div>
      <div style={styles.formGroup}>
        <label style={styles.label}>Price:</label>
        <input
          type="text"
          name="price"
          value={editRoomData.price}
          onChange={(e) =>
            setEditRoomData({ ...editRoomData, price: e.target.value })
          }
          required
          style={styles.input}
        />
      </div>
      <div style={styles.formGroup}>
        <label style={styles.label}>Furnished Type:</label>
        <input
          type="text"
          name="furnishedType"
          value={editRoomData.furnishedType}
          onChange={(e) =>
            setEditRoomData({ ...editRoomData, furnishedType: e.target.value })
          }
          required
          style={styles.input}
        />
      </div>
      <div style={styles.formGroup}>
        <label style={styles.label}>Additional Features:</label>
        <input
          type="text"
          name="additionalFeature"
          value={editRoomData.additionalFeature}
          onChange={(e) =>
            setEditRoomData({
              ...editRoomData,
              additionalFeature: e.target.value,
            })
          }
          style={styles.input}
        />
      </div>
      <div style={styles.formGroup}>
        <label style={styles.label}>Discount Code:</label>
        <input
          type="text"
          name="discountCode"
          value={editRoomData.discountCode}
          onChange={(e) =>
            setEditRoomData({ ...editRoomData, discountCode: e.target.value })
          }
          style={styles.input}
        />
      </div>
      <div style={styles.buttonContainer}>
        <button type="submit" style={styles.saveButton}>
          Save
        </button>
        <button
          type="button"
          style={styles.cancelButton}
          onClick={() => setIsEditing(false)}
        >
          Cancel
        </button>
      </div>
    </form>
  );

  return (
    <div style={styles.container}>
      <div style={{display: "flex", justifyContent: "space-between"}}>
      <h2 style={styles.heading}>Manage Rooms</h2>
      <button onClick={handleCreateRoom} style={styles.createButton}>
        Create Room
      </button>
      </div>
      <div style={styles.roomsContainer}>
        {isEditing
          ? renderRoomForm()
          : rooms.map((room) => renderRoomCard(room))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "20px"
  },
  heading: {
    textAlign: "center",
    marginBottom: "20px",
  },
  createButton: {
    backgroundColor: "#FF9900",
    color: "white",
    border: "none",
    padding: "5px 10px",
    borderRadius: "5px",
    cursor: "pointer",
    display: "block",
  },
  roomCard: {
    border: "1px solid #ccc",
    padding: "20px",
    margin: "10px",
    borderRadius: "5px",
    width: "calc(33.333% - 20px)",
    boxSizing: "border-box",
  },
  roomsContainer: {
    display: "flex",
    flexWrap: "wrap"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    width: "300px",
    margin: "0 auto",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  label: {
    fontWeight: "bold",
  },
  input: {
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "space-between",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    padding: "10px",
    borderRadius: "5px",
    cursor: "pointer",
  },
  cancelButton: {
    backgroundColor: "#f44336",
    color: "white",
    border: "none",
    padding: "10px",
    borderRadius: "5px",
    cursor: "pointer",
  },
  editButton: {
    backgroundColor: "#FF9900",
    color: "white",
    border: "none",
    padding: "10px",
    borderRadius: "5px",
    cursor: "pointer",
    marginTop: "10px",
  },
};
