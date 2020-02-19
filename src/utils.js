import { usig_webservice_url } from './config';

export const getLatLng = async lugar => {
  let response = await fetch(
    `${usig_webservice_url}/normalizar/?direccion=${lugar.nombre}&geocodificar=true&srid=4326`
  );

  if (response.status === 200) {
    let json = await response.json();
    return json;
  }
};
