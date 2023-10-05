"use client";

import { use, useEffect, useRef, useState } from "react";
import { Toaster, toast } from 'sonner';
import { Button } from "@/components/ui/button"

export default function Map() {
  const mapContainerRef = useRef(null);
  
  const mapViewOptions = {
    accessToken:
      "pk.eyJ1Ijoic21oZWFyZCIsImEiOiJjbG5hdmxhd3kwNjY3MmxtbGNqY3p1NWhxIn0.jY5n8pAE6DMd7li9oSP8fA",
    element: undefined,
    style: "mapbox://styles/mapbox/navigation-day-v1",
    center: { lat: 30.405049053263483, lng: -97.72107771405788 },
    zoom: 20,
    maxZoom: 24,
    minZoom: 19,
    pitch: 45,
    bearing: 49,
    // bounds: [
    //   [-97.72107723039518, 30.40456044442378],
    //   [-97.72103878321172, 30.405409581795666],
    // ],
    // fitBoundsOptions: {
    //   bearing: 49,
    //   zoom: 20,
    //   pitch: 45,
    //   duration: 3000,
    //   linear: true,
    //   easing: function (t) {
    //     return t * t * t;
    //     },
    // },
  };

  let locationsList = [];


  useEffect(() => {

    mapViewOptions.element = mapContainerRef.current;

    const mapView = new window.mapsindoors.mapView.MapboxView(mapViewOptions);
    const mapsIndoors = new window.mapsindoors.MapsIndoors({
      mapView: mapView,
    });
    const mapboxMap = mapsIndoors.getMap();

    mapsIndoors.on("click", (location) => {

        if (locationsList.indexOf(location) === -1) {
          locationsList.push(location);
          toast.success(location.properties.name + " added to tour!", {
            duration: 5000,
          });
        } else {
          toast.error(location.properties.name + " already in tour!", {
            duration: 5000,
          });
        }
        });

        console.log(locationsList);

  }, []);

 

  return(
  <>
  <Toaster position="bottom-center" visibleToasts={9} />
  <Button className="absolute z-50 top-5 right-5">Start Tour!</Button>
  <div ref={mapContainerRef} className="min-h-screen" />
  </>
  );
}
