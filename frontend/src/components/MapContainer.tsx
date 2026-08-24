'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Complaint } from '@/lib/db';

interface MapContainerProps {
  complaints: Complaint[];
  selectedCategory?: string;
  selectedStatus?: string;
}

declare global {
  interface Window {
    L: any;
  }
}

export default function MapContainer({ complaints, selectedCategory = 'All', selectedStatus = 'All' }: MapContainerProps) {
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [scriptsLoaded, setScriptsLoaded] = useState(false);

  // Dynamically load Leaflet assets from CDN to avoid Next.js SSR window error
  // and leaflet marker image bundling bugs
  useEffect(() => {
    if (window.L) {
      setScriptsLoaded(true);
      return;
    }

    // Load Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    document.head.appendChild(link);

    // Load Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    script.onload = () => {
      setScriptsLoaded(true);
    };
    document.body.appendChild(script);

    return () => {
      // Clean up script on unmount
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!scriptsLoaded || mapRef.current) return;

    const L = window.L;
    // Center of map (San Francisco coordinates as default mock location matching seed data)
    const map = L.map('leaflet-map-canvas', { zoomControl: true }).setView([37.7749, -122.4194], 12);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    mapRef.current = map;
    setMapLoaded(true);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        setMapLoaded(false);
      }
    };
  }, [scriptsLoaded]);

  // Update markers when complaints or filters change
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    const L = window.L;
    const map = mapRef.current;

    // Clear existing markers
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    // Filter complaints
    const filtered = complaints.filter(c => {
      const matchCat = selectedCategory === 'All' || c.category === selectedCategory;
      const matchStat = selectedStatus === 'All' || c.status === selectedStatus;
      return matchCat && matchStat;
    });

    // Create marker icon helper
    const getMarkerIcon = (status: string) => {
      let color = '#3b82f6'; // default blue
      if (status === 'Submitted' || status === 'Under Review') color = '#ef4444'; // Red/Orange
      if (status === 'Assigned' || status === 'In Progress') color = '#6366f1'; // Purple/Indigo
      if (status === 'Resolved' || status === 'Closed') color = '#10b981'; // Green

      const markerHtmlStyles = `
        background-color: ${color};
        width: 24px;
        height: 24px;
        display: block;
        left: -12px;
        top: -12px;
        position: relative;
        border-radius: 24px 24px 0;
        transform: rotate(-45deg);
        border: 2px solid #FFFFFF;
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
      `;

      return L.divIcon({
        className: "my-custom-pin",
        iconAnchor: [0, 24],
        popupAnchor: [0, -28],
        html: `<span style="${markerHtmlStyles}" />`
      });
    };

    // Add markers
    filtered.forEach(c => {
      const marker = L.marker([c.latitude, c.longitude], { icon: getMarkerIcon(c.status) });
      
      const popupContent = `
        <div style="font-family: var(--font-sans); padding: 4px; min-width: 160px;">
          <h4 style="margin: 0 0 6px 0; font-size: 13px; font-weight: 700; color: var(--foreground);">${c.title}</h4>
          <p style="margin: 0 0 8px 0; font-size: 11px; color: var(--muted);">${c.location}</p>
          <div style="display: flex; gap: 6px; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 10px; font-weight: 600; padding: 1px 6px; border-radius: 12px; background-color: var(--primary-light); color: var(--primary);">${c.category}</span>
            <span style="font-size: 10px; font-weight: 600; padding: 1px 6px; border-radius: 12px; background-color: var(--muted-light); color: var(--foreground);">${c.status}</span>
          </div>
          <a href="/citizen/track?id=${c.id}" style="font-size: 11px; font-weight: 700; color: var(--primary); text-decoration: none;">Track Status &rarr;</a>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.addTo(map);
      markersRef.current.push(marker);
    });

    // Fit map bounds to markers if they exist
    if (filtered.length > 0) {
      const group = new L.featureGroup(markersRef.current);
      map.fitBounds(group.getBounds().pad(0.1));
    }
  }, [complaints, mapLoaded, selectedCategory, selectedStatus]);

  return (
    <div className="map-wrapper animate-fade-in">
      {!scriptsLoaded && (
        <div className="map-loading">
          <div className="map-spinner" />
          <p style={{ fontSize: '14px', fontWeight: 600 }}>Initializing Interactive Map...</p>
        </div>
      )}
      <div id="leaflet-map-canvas" style={{ height: '100%', width: '100%', minHeight: '400px' }} />
    </div>
  );
}
