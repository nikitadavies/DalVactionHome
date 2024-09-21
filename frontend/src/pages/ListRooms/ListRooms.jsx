import React, {useEffect, useState} from 'react';
import { RoomImage } from "../../assets";
import api from "../../api/index";  

export const ListRooms = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.property.getProperties()
        .then(response => {
            const roomsData = JSON.parse(response.body);
            console.log(roomsData);
            setRooms(Array.isArray(roomsData) ? roomsData : []);
        })
        .catch(error => {
            console.error("Error fetching properties:", error);
        })
        .finally(() => {
            setLoading(false);
        });
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <main className="container-fluid">
                <div className="row">
                    <FilterSidebar />
                    <PropertyListings rooms={rooms} />
                </div>
            </main>
        </div>
    );
};

const FilterSidebar = () => (
    <aside className="col-md-3 p-4">
        <h5>Filter by:</h5>
        <div className="mb-3">
            <label className="form-label">Your budget (per night)</label>
            <input type="range" className="form-range" min="150" max="300" step="10" />
            <div className="d-flex justify-content-between">
                <span>CAD 150</span>
                <span>CAD 300+</span>
            </div>
        </div>
        <div className="mb-3">
            <h6>Amenities</h6>
            {['Parking', 'Air conditioning', 'Parking', 'Fridge'].map((filter) => (
                <div className="form-check" key={filter}>
                    <input className="form-check-input" type="checkbox" value="" id={filter} />
                    <label className="form-check-label" htmlFor={filter}>{filter}</label>
                </div>
            ))}
        </div>
    </aside>
);

const PropertyListings = ({ rooms }) => {
    return (
        <div className="col-md-9 p-4">
            <h5>{rooms.length} Rooms found</h5>
            {rooms.map((property) => (
                <div className="card mb-3" key={property.id}>
                    <div className="row g-0">
                        <div className="col-md-4">
                            <img src={RoomImage} className="img-fluid rounded-start" alt="property" />
                        </div>
                        <div className="col-md-8">
                            <div className="card-body">
                                <h5 className="card-title">Suite #{property.roomId}</h5>
                                {/* <p className="card-text">{property.location} - {property.distance}</p> */}
                                  
                                   <div> Features:  {property.additionalFeature}</div>
                                
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <span className="badge bg-success">Overall Rating: {property.polarityOfFeedback}</span>
                                        <span className="text-muted ms-2">{property.feedback.length} reviews</span>
                                    </div>
                                    <div className="text-end">
                                        <span className="d-block">Queen Room with Two Queen Beds</span>
                                        <span className="d-block">2 large double beds</span>
                                        <span className="d-block fw-bold">{property.price} CAD/night</span>
                                    </div>
                                </div>
                                <a href={`/room-details/${property.roomId}`} className="btn btn-primary mt-3">See availability</a>
                            </div>
                        </div>
                    </div>
                </div>
            )).reverse()}
        </div>
    );
};
