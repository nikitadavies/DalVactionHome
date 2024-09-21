import React, { useEffect, useState } from 'react';
import './styles.css';
import axios from 'axios';
import { RoomImage } from "../../assets";
import api from "../../api/index"; 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
import { useNavigate, useParams } from 'react-router-dom';

const RoomDetails = () => {
    const { roomId } = useParams();
    const userId = JSON.parse(localStorage.getItem("userDetails"))?.userId;
    const [room, setRoom] = useState(null);
    const [bookingStartDate, setBookingStartDate] = useState('');
    const [bookingEndDate, setBookingEndDate] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        api.property.getPropertyDetailsById(roomId)
        .then(response => {
            const roomData = JSON.parse(response.body);
            console.log(roomData);
            setRoom(roomData);
        })
        .catch(error => {
            console.error("Error fetching properties:", error);
        })
        .finally(() => {
            setLoading(false);
        });
    }, [roomId]);

    const accessToken = localStorage.getItem("accessToken");

    const handleBooking = () => {
        if(!accessToken){
            navigate("/login");
        }
        const startDate = new Date(bookingStartDate);
        const endDate = new Date(bookingEndDate);
        const totalBookingDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

        const bookingPayload = {
            userId: userId,
            roomId: room.roomId,
            bookingStartDate: bookingStartDate,
            bookingEndDate: bookingEndDate,
            totalBookingDays: totalBookingDays
        };

        axios.post('https://2os6c3lw93.execute-api.us-east-1.amazonaws.com/dev/room-booking', bookingPayload)
        .then(response => {
            toast.success("Request submitted successfully. Please check email for status!");
        })
        .catch(error => {
            toast.error("Error booking room. Please try again.");
        });
    };

    if (loading) {
        return <div className="loader">Loading...</div>;
    }

    return (
        <>
        <ToastContainer />
        <div>
            <Header room={room} onBook={handleBooking} 
                    bookingStartDate={bookingStartDate} 
                    setBookingStartDate={setBookingStartDate}
                    bookingEndDate={bookingEndDate} 
                    setBookingEndDate={setBookingEndDate}/>
            <main className="container mt-4">
               <CheckInCheckOut />
                <HotelInfo room={room} />
                <Amenities room={room} />
            </main>
        </div>
        </>
    );
};

const Header = ({ room, onBook, bookingStartDate, setBookingStartDate, bookingEndDate, setBookingEndDate }) => (
    <header>
        <div className="container">
            <img
                src={RoomImage}
                alt="Room"
                className="card-img-top rounded"
                width="40px"
                height="400px"
            />
            <div className="d-flex justify-content-between align-items-center mt-3">
                <h1 className="h3">Suite #{room?.roomId}</h1>
                <div>
                    <input type="date" data-date-format="dd/mm/yyyy" value={bookingStartDate} onChange={(e) => setBookingStartDate(e.target.value)} />
                    <input type="date" data-date-format="dd/mm/yyyy" value={bookingEndDate} onChange={(e) => setBookingEndDate(e.target.value)} />
                    <button className="btn btn-primary" onClick={onBook}>Book room</button>
                </div>
            </div>
        </div>
    </header>
);

const HotelInfo = ({ room }) => (
    <section className="mt-4">
        <div className="d-flex">
            <div>
                <p><strong>{room.polarityOfFeedback} Exceptional</strong> <a href={`/reviews/${room.roomId}`}>See all reviews</a></p>
            </div>
        </div>
    </section>
);

const Amenities = ({ room }) => (
    <section className="mt-4">
        <h3>Popular amenities</h3>
        <div>{room.additonalFeature}</div>
        <a href="#">See all property amenities</a>
    </section>
);

const CheckInCheckOut = () => (
    <section className="mt-4">
        <div className="row text-center">
            <div className="col-md-6">
                <p><strong>Check-in time</strong></p>
                <p>12:00 PM</p>
            </div>
            <div className="col-md-6">
                <p><strong>Check-out time</strong></p>
                <p>11:59 AM</p>
            </div>
        </div>
    </section>
);

export default RoomDetails;
