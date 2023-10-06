"use client";

import { use, useEffect, useRef, useState } from "react";
import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { Drawer } from "vaul";

export default function Map() {
  const mapContainerRef = useRef(null);
  //   const floorSelectorRef = useRef(null);
  const mapboxMapRef = useRef(null);
  const mapsIndoorsRef = useRef(null);

  const [locationsList, setLocationsList] = useState([]);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  const mapViewOptions = {
    accessToken:
      "pk.eyJ1Ijoic21oZWFyZCIsImEiOiJjbG5hdmxhd3kwNjY3MmxtbGNqY3p1NWhxIn0.jY5n8pAE6DMd7li9oSP8fA",
    element: undefined,
    style: "mapbox://styles/mapbox/navigation-day-v1",
    center: { lat: 30.405049053263483, lng: -97.72107771405788 },
    zoom: 20,
    maxZoom: 24,
    minZoom: 19,
    pitch: 25,
    bearing: 59,
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

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const startTour = async () => {
    const mapboxMap = mapboxMapRef.current;
    const mapsIndoors = mapsIndoorsRef.current;

    setIsButtonDisabled(true);

    for (const location of locationsList) {
      mapboxMap.flyTo({
        center: [
          location.properties.anchor.coordinates[0],
          location.properties.anchor.coordinates[1],
        ],
        zoom: 21,
        duration: 3500,
        pitch: 45,
        bearing: mapboxMap.getBearing() + 90,
      });

      mapsIndoors.overrideDisplayRule(location.id, {
        wallsColor: "#FF0000",
        extrusionColor: "#FF0000",
        polygonVisible: true,
        polygonFillColor: "#FF0000",
        polygonFillOpacity: 1,
        polygonStrokeColor: "#FF0000",
        polygonStrokeOpacity: 1,
      });

      const marker = new mapboxgl.Marker({
        color: "#FF0000",
        anchor: "bottom",
        offset: [0, -10],
        pitchAlignment: "viewport",
        rotationAlignment: "viewport",
        scale: 1,
        visible: true,
      })
        .setLngLat([
          location.properties.anchor.coordinates[0],
          location.properties.anchor.coordinates[1],
        ])
        .addTo(mapboxMap);

      toast(location.properties.name, {
        duration: 4000,
        className: "justify-center",
      });

      await delay(4500);

      mapsIndoors.revertDisplayRule(location.id);
      marker.remove();
    }
    setIsButtonDisabled(false);
  };

  useEffect(() => {
    mapViewOptions.element = mapContainerRef.current;

    const mapView = new mapsindoors.mapView.MapboxView(mapViewOptions);
    const mapsIndoors = new mapsindoors.MapsIndoors({
      mapView: mapView,
    });
    mapsIndoorsRef.current = mapsIndoors;
    const mapboxMap = mapsIndoors.getMap();
    mapboxMapRef.current = mapboxMap;

    mapsIndoors.on("ready", () => {
      mapsIndoors.setFloor("50");
    });

    // const floorSelector = floorSelectorRef.current;

    // new mapsindoors.FloorSelector(floorSelector, mapsIndoors);
    // mapboxMap.addControl(
    //   {
    //     onAdd: function () {
    //       return floorSelector;
    //     },
    //     onRemove: function () {},
    //   },
    //   "top-left"
    // );

    const handleClick = (location) => {
      setLocationsList((prevLocations) => [...prevLocations, location]);
      setIsButtonDisabled(false);
      toast.success(location.properties.name + " added to tour!", {
        duration: 1000,
      });
    };

    mapsIndoors.on("click", handleClick);

    return () => {
      mapsIndoors.off("click", handleClick);
    };
  }, []);

  return (
    <>
      <Toaster position="bottom-center" visibleToasts={9} toastOptions={{}} />

      <Drawer.Root>
        <Drawer.Trigger asChild>
          <Button
            size="icon"
            className="absolute z-50 top-5 left-5"
            disabled={isButtonDisabled}
          >
            <MapPin />
          </Button>
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40" />
          <Drawer.Content className="bg-zinc-100 flex flex-col rounded-t-[10px] mt-24 fixed bottom-0 left-0 right-0 z-50">
            <div className="p-4 bg-white rounded-t-[10px] flex-1">
              <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-zinc-300 mb-8" />
              <div className="max-w-md mx-auto">
                <Drawer.Title className="font-medium mb-4 text-center">
                  Tour Locations
                </Drawer.Title>

                {/* make a list of locations */}
                {locationsList.map((location, index) => (
                  <span key={index} className="justify-between items-center">
                    <Badge variant="secondary" className="m-1 drop-shadow-md">
                      <MapPin className="mr-1" />
                      {location.properties.name}
                    </Badge>
                  </span>
                ))}
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      <Button
        className="absolute z-50 top-5 right-5"
        onClick={startTour}
        disabled={isButtonDisabled}
      >
        Start Tour!
      </Button>
      <div ref={mapContainerRef} className="min-h-screen" />
      {/* <div ref={floorSelectorRef} /> */}
    </>
  );
}
