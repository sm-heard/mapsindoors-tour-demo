"use client";

import { use, useEffect, useRef, useState } from "react";
import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Settings } from "lucide-react";
import { Drawer } from "vaul";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function Map() {
  const mapsindoors = window.mapsindoors;
  const mapboxgl = window.mapboxgl;

  const mapContainerRef = useRef(null);
  //   const floorSelectorRef = useRef(null);
  const mapboxMapRef = useRef(null);
  const mapsIndoorsRef = useRef(null);
  const directionsServiceRef = useRef(null);
  const directionsRendererRef = useRef(null);

  const [locationsList, setLocationsList] = useState([]);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [buttonDisabledAnimation, setButtonDisabledAnimation] = useState(false);
  const [withRoutes, setWithRoutes] = useState(false);

  const zoomLevelMap = { far: 21, medium: 22, close: 23 };
  const [zoomLevel, setZoomLevel] = useState("far");

  const highlightMap = { red: "#FF0000", blue: "#0000FF", green: "#00FF00" };
  const [highlight, setHighlight] = useState("red");

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
  };

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function calculateBearing(startLat, startLng, endLat, endLng) {
    var startY = Math.cos(endLat) * Math.sin(endLng - startLng);
    var startX =
      Math.cos(startLat) * Math.sin(endLat) -
      Math.sin(startLat) * Math.cos(endLat) * Math.cos(endLng - startLng);
    var bearing = (Math.atan2(startY, startX) * 180) / Math.PI;
    return (bearing + 360) % 360;
  }

  const startTour = async () => {
    const mapboxMap = mapboxMapRef.current;
    const mapsIndoors = mapsIndoorsRef.current;
    const directionsService = directionsServiceRef.current;
    const directionsRenderer = directionsRendererRef.current;

    setIsButtonDisabled(true);
    setButtonDisabledAnimation(true);

    if (withRoutes === false) {
      for (const location of locationsList) {
        mapboxMap.flyTo({
          center: [
            location.properties.anchor.coordinates[0],
            location.properties.anchor.coordinates[1],
          ],
          zoom: zoomLevelMap[zoomLevel],
          duration: 3500,
          pitch: 45,
          bearing: mapboxMap.getBearing() + 90,
        });

        mapsIndoors.overrideDisplayRule(location.id, {
          wallsColor: highlightMap[highlight],
          extrusionColor: highlightMap[highlight],
          polygonVisible: true,
          polygonFillColor: highlightMap[highlight],
          polygonFillOpacity: .5,
          polygonStrokeColor: highlightMap[highlight],
          polygonStrokeOpacity: 1,
        });

        const marker = new mapboxgl.Marker({
          color: highlightMap[highlight],
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
      mapboxMap.flyTo({
        center: [-97.72107771405788, 30.405049053263483],
        zoom: 20,
        duration: 2000,
        pitch: 25,
        bearing: 59,
      });
      setIsButtonDisabled(false);
      setButtonDisabledAnimation(false);
    } else if (withRoutes === true && locationsList.length > 1) {
      let prevLocation = locationsList[0];

      for (const location of locationsList) {
        if (prevLocation !== location) {
          mapboxMap.flyTo({
            center: [
              prevLocation.properties.anchor.coordinates[0],
              prevLocation.properties.anchor.coordinates[1],
            ],
            zoom: zoomLevelMap[zoomLevel],
            duration: 1500,
            pitch: 45,
            bearing: mapboxMap.getBearing() + 90,
          });

          mapsIndoors.overrideDisplayRule(prevLocation.id, {
            wallsColor: highlightMap[highlight],
            extrusionColor: highlightMap[highlight],
            polygonVisible: true,
            polygonFillColor: highlightMap[highlight],
            polygonFillOpacity: .5,
            polygonStrokeColor: highlightMap[highlight],
            polygonStrokeOpacity: 1,
          });

          const marker = new mapboxgl.Marker({
            color: highlightMap[highlight],
            anchor: "bottom",
            offset: [0, -10],
            pitchAlignment: "viewport",
            rotationAlignment: "viewport",
            scale: 1,
            visible: true,
          })
            .setLngLat([
              prevLocation.properties.anchor.coordinates[0],
              prevLocation.properties.anchor.coordinates[1],
            ])
            .addTo(mapboxMap);

          toast(
            prevLocation.properties.name + " → " + location.properties.name,
            {
              duration: 10000,
              className: "justify-center",
              position: "bottom-right",
            }
          );

          await delay(2000);

          //   mapsIndoors.revertDisplayRule(prevLocation.id);
          //   marker.remove();

          let routeBearing = calculateBearing(
            prevLocation.properties.anchor.coordinates[1],
            prevLocation.properties.anchor.coordinates[0],
            location.properties.anchor.coordinates[1],
            location.properties.anchor.coordinates[0]
          );

          mapboxMap.flyTo({
            center: [
              location.properties.anchor.coordinates[0],
              location.properties.anchor.coordinates[1],
            ],
            zoom: zoomLevelMap[zoomLevel],
            duration: 1500,
            pitch: 45,
            // bearing: mapboxMap.getBearing() + 90,
            bearing: routeBearing,
          });

          mapsIndoors.overrideDisplayRule(location.id, {
            wallsColor: highlightMap[highlight],
            extrusionColor: highlightMap[highlight],
            polygonVisible: true,
            polygonFillColor: highlightMap[highlight],
            polygonFillOpacity: .5,
            polygonStrokeColor: highlightMap[highlight],
            polygonStrokeOpacity: 1,
          });

          const marker2 = new mapboxgl.Marker({
            color: highlightMap[highlight],
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

          await delay(2000);

          directionsService
            .getRoute({
              origin: {
                lat: prevLocation.properties.anchor.coordinates[1],
                lng: prevLocation.properties.anchor.coordinates[0],
                floor: 50,
              },
              destination: {
                lat: location.properties.anchor.coordinates[1],
                lng: location.properties.anchor.coordinates[0],
                floor: 50,
              },
            })
            .then((directionsResult) => {
              directionsRenderer.setOptions({
                strokeColor: highlightMap[highlight],
                strokeWeight: 4,
              });
              directionsRenderer.setRoute(directionsResult);
            });

          await delay(6500);

          mapsIndoors.revertDisplayRule(prevLocation.id);
          marker.remove();
          mapsIndoors.revertDisplayRule(location.id);
          marker2.remove();
          directionsRenderer.setRoute(null);

          prevLocation = location;
        }
      }
      mapboxMap.flyTo({
        center: [-97.72107771405788, 30.405049053263483],
        zoom: 20,
        duration: 2000,
        pitch: 25,
        bearing: 59,
      });

      setIsButtonDisabled(false);
      setButtonDisabledAnimation(false);
    }
  };

  useEffect(() => {
    mapViewOptions.element = mapContainerRef.current;

    const mapView = new mapsindoors.mapView.MapboxView(mapViewOptions);
    const mapsIndoors = new mapsindoors.MapsIndoors({
      mapView: mapView,
    });
    const mapboxMap = mapsIndoors.getMap();

    mapsIndoorsRef.current = mapsIndoors;
    mapboxMapRef.current = mapboxMap;

    const externalDirectionsProvider =
      new mapsindoors.directions.MapboxProvider(
        "pk.eyJ1Ijoic21oZWFyZCIsImEiOiJjbG5hdmxhd3kwNjY3MmxtbGNqY3p1NWhxIn0.jY5n8pAE6DMd7li9oSP8fA"
      );
    const directionsService = new mapsindoors.services.DirectionsService(
      externalDirectionsProvider
    );
    const directionsRenderer = new mapsindoors.directions.DirectionsRenderer({
      mapsIndoors: mapsIndoors,
      fitBounds: true,
      fitBoundsPadding: { top: 50, bottom: 50 },
      //   animation: null,
    });

    directionsServiceRef.current = directionsService;
    directionsRendererRef.current = directionsRenderer;

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

      <Drawer.Root>
        <Drawer.Trigger asChild>
          <Button
            size="icon"
            className="absolute z-50 top-5 right-32"
            disabled={buttonDisabledAnimation}
          >
            <Settings />
          </Button>
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40" />
          <Drawer.Content className="bg-zinc-100 flex flex-col rounded-t-[10px] mt-24 fixed bottom-0 left-0 right-0 z-50">
            <div className="p-4 bg-white rounded-t-[10px] flex-1">
              <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-zinc-300 mb-8" />
              <div className="max-w-md mx-auto">
                <Drawer.Title className="font-medium mb-4 text-center">
                  Settings
                </Drawer.Title>

                <div className="flex gap-2 justify-around">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="route-mode">Route Mode</Label>
                    <Switch
                      id="route-mode"
                      checked={withRoutes}
                      onCheckedChange={(checked) => {
                        setWithRoutes(checked);
                      }}
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-around">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="zoomLevel">Zoom To</Label>
                    <Select
                      value={zoomLevel}
                      onValueChange={(value) => {
                        setZoomLevel(value);
                      }}
                    >
                      <SelectTrigger id="zoomLevel" className="w-[100px]">
                        <SelectValue placeholder="Zoom To" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="far">Far</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="close">Close</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="highlight">Highlight</Label>
                    <Select
                      value={highlight}
                      onValueChange={(value) => {
                        setHighlight(value);
                      }}
                    >
                      <SelectTrigger id="highlight" className="w-[100px]">
                        <SelectValue placeholder="Highlight" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="red">Red</SelectItem>
                        <SelectItem value="green">Green</SelectItem>
                        <SelectItem value="blue">Blue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* <Select
        onValueChange={(value) => {
          setZoomLevel(value);
        }}
      >
        <SelectTrigger className="w-fit absolute z-50 top-5 right-32">
          <SelectValue placeholder="Zoom To" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="far">Far</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="close">Close</SelectItem>
        </SelectContent>
      </Select> */}

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
