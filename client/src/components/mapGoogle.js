import React from "react";
import GoogleMapReact from "google-map-react";
import { TiLocation } from "react-icons/ti";

const AnyReactComponent = ({ text }) => (
  <div>
    <TiLocation size={30} color="blue" />
    {text}
  </div>
);

export default function SimpleMap() {
  const defaultProps = {
    center: {
      lat: 43.5,
      lng: 16.46,
    },
    zoom: 13,
  };

  return (
    <div
      style={{
        height: "300px",
        width: "70%",
        margin: "auto",
        marginTop: "50px",
      }}
    >
      <GoogleMapReact
        bootstrapURLKeys={{ key: "" }}
        defaultCenter={defaultProps.center}
        defaultZoom={defaultProps.zoom}
      >
        <AnyReactComponent
          lat={43.51116826}
          lng={16.46886371}
          text={"Device 1"}
        />
        <AnyReactComponent lat={43.510933} lng={16.469151} text={"Device 2"} />
      </GoogleMapReact>
    </div>
  );
}
