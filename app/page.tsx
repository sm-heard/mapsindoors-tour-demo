"use client";

import Script from "next/script";
import { useState } from "react";
import "./mapbox-gl.css";
import Map from "@/components/map";

export default function Home() {
  const [mapboxReady, setMapboxReady] = useState(false);
  const [mapsindoorsReady, setMapsindoorsReady] = useState(false);
  return (
    <>
      <Script
        src={
          "https://app.mapsindoors.com/mapsindoors/js/sdk/4.24.8/mapsindoors-4.24.8.js.gz?apikey=3ddemo"
        }
        onLoad={() => {
          setMapsindoorsReady(true);
        }}
      />
      <Script
        src={"https://api.mapbox.com/mapbox-gl-js/v2.14.1/mapbox-gl.js"}
        onLoad={() => {
          setMapboxReady(true);
        }}
      />

      {mapboxReady && mapsindoorsReady && (
        <div className="relative min-h-screen">
          <Map />
        </div>
      )}
    </>
  );
}
