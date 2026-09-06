export type ZipGeocodeResult = {
  zipCode: string;
  locationLabel: string;
  latitude: number;
  longitude: number;
};

export function normalizeZip(input: string): string | null {
  const digits = input.replace(/\D/g, "").slice(0, 5);
  return digits.length === 5 ? digits : null;
}

export async function geocodeZip(zipInput: string): Promise<ZipGeocodeResult> {
  const zipCode = normalizeZip(zipInput);
  if (!zipCode) throw new Error("Enter a valid 5-digit US zip code");

  const res = await fetch(`https://api.zippopotam.us/us/${zipCode}`, {
    next: { revalidate: 86400 },
  });
  if (!res.ok) throw new Error("Zip code not found");

  const data = (await res.json()) as {
    places: { latitude: string; longitude: string; "place name": string; "state abbreviation": string }[];
  };
  const place = data.places[0];
  if (!place) throw new Error("Zip code not found");

  return {
    zipCode,
    locationLabel: `${place["place name"]}, ${place["state abbreviation"]}`,
    latitude: parseFloat(place.latitude),
    longitude: parseFloat(place.longitude),
  };
}