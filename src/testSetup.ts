import '@testing-library/jest-dom';

// Enable Leaflet SVG renderer support in JSDOM environment so real MapContainer,
// TileLayer, Polyline, and CircleMarker instances mount and fire real tileerror events.
if (typeof window !== 'undefined' && typeof SVGElement !== 'undefined') {
  const svgProto = SVGElement.prototype as SVGElement & {
    createSVGRect?: () => DOMRect;
  };
  if (!svgProto.createSVGRect) {
    svgProto.createSVGRect = () => new DOMRect(0, 0, 100, 100);
  }
}
