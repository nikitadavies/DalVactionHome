import React from "react";
import {
  RoomImage,
} from "../../assets";

export const RoomSection = () => {
  const rooms = [
    {
      roomId: 1,
      roomType: "Single",
      price: 90,
      roomImage: RoomImage,
    },
    {
      roomId: 2,
      roomType: "Family",
      price: 120,
      roomImage: RoomImage,
    },
    {
      roomId: 3,
      roomType: "Presidential",
      price: 250,
      roomImage: RoomImage,
    },
  ];

  return (
    <div className="py-5 text-center">
      <h2 className="mb-4 text-dark mt-6">Rooms & Suites</h2>
      <p className="mb-5 text-muted">
        Comfortable, spacious , elegantly furnished rooms with luxury in-suite amenities
      </p>
      <div className="row justify-content-center px-5">
        {rooms.map((room) => (
          <div key={room.roomId} className="col-md-4 mb-4">
            <div className="card">
              <img
                src={room.roomImage}
                alt={`${room.roomType} Room`}
                className="card-img-top rounded"
                width="40px"
                
              />
              <div className="card-body text-center">
                <h5 className="card-title text-dark">{room.roomType} Room</h5>
                <p className="card-text text-warning">{room.price}$ / PER NIGHT</p>
              </div>
              <div className="hstack gap-2 justify-content-center">
           </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
