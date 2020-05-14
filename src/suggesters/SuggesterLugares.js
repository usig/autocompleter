import Suggester from './Suggester.js';
import 'isomorphic-fetch';
import URI from 'urijs';
import { lugares_webservice_url } from '../config';

/**
 * @class SuggesterLugares
 * Implementa un suggester de direcciones usando el Normalizador de Direcciones.<br/>
 * Requiere: jQuery-1.3.2+, jquery.class, usig.Suggester, Normalizador de Direcciones 1.4+, GeoCoder<br/>
 * @namespace usig
 * @cfg {Integer} maxSuggestions Maximo numero de sugerencias a devolver
 * @cfg {Integer} serverTimeout Tiempo maximo de espera (en ms) antes de abortar una busqueda en el servidor
 * @cfg {Integer} maxRetries Maximo numero de reintentos a realizar en caso de timeout
 * @cfg {Boolean} acceptSN Indica si debe permitir como altura S/N para las calles sin numeracion oficial. Por defecto es <code>True</code>. Ej: de los italianos s/n.
 * @cfg {Boolean} callesEnMinusculas Indica si se desea que los nombres de las calles normalizados sean en minúsculas (Por defecto: false)
 * @cfg {Boolean} ignorarTextoSobrante Indica si se desea ignorar el texto sobrante cuando se encuentra una direccion. Por ejemplo: Corrientes 1234 3ro D seria aceptado como Corrientes 1234 (Por defecto: true)
 * @cfg {Function} afterAbort Callback que es llamada cada vez que se aborta un pedido al servidor.
 * @cfg {Function} afterRetry Callback que es llamada cada vez que se reintenta un pedido al servidor.
 * @cfg {Function} afterServerRequest Callback que es llamada cada vez que se hace un pedido al servidor.
 * @cfg {Function} afterServerResponse Callback que es llamada cada vez que se recibe una respuesta del servidor.
 * @cfg {Function} onReady Callback que es llamada cuando el componente esta listo
 * @constructor
 * @param {Object} options (optional) Un objeto conteniendo overrides para las opciones disponibles
 */

const defaults = {
  serverTimeout: 30000,
  server: 'https://epok.buenosaires.gob.ar/buscar/',
  maxRetries: 1,
  maxSuggestions: 10,
  searchOptions: {
    start: 0,
    limit: 20,
    tipoBusqueda: 'ranking',
    categoria: undefined,
    clase: undefined,
    bbox: false,
    extent: undefined,
    returnRawData: false
  }
};

function mkRequest(data, address, serverDefaults) {
  const url = URI(address).search(data);
  return fetch(url.toString(), serverDefaults).then((resp) => resp.json());
}

export default class SuggesterLugares extends Suggester {
  constructor(name, options) {
    if (options !== undefined) {
      options.searchOptions = Object.assign({}, defaults.searchOptions, options.searchOptions);
    }
    let opts = Object.assign({}, defaults, options);
    super(name, opts);
    this.lastRequest = null;
  }

  async getLatLng2(lugar) {
    let response = await fetch(
      `${lugares_webservice_url}/?&id=${lugar.id}&geocodificar=true&srid=4326`
    );

    if (response.status === 200) {
      let json = await response.json();
      return json;
    }
  }

  /**
   * Dado un string, realiza una busqueda de direcciones y llama al callback con las
   * opciones encontradas.
   * @param {String} text Texto de input
   * @param {Function} callback Funcion que es llamada con la lista de sugerencias
   * @param {Integer} maxSuggestions (optional) Maximo numero de sugerencias a devolver
   */
  getSuggestions(text, callback, maxSuggestions) {
    const data = {
      start: this.options.searchOptions.start,
      limit: this.options.searchOptions.limit,
      texto: text,
      tipo: this.options.searchOptions.tipoBusqueda,
      totalFull: this.options.searchOptions.totalFull
    };
    this.lastRequest = mkRequest(data, defaults.server, {}).then(
      res => {
        const results = res.instancias.map((d) => {
          this.getLatLng2(d).then((r) => {
            if ( r.ubicacion ) {
              d.coordenadas = {
                x: parseFloat(r.ubicacion.centroide.split('(', 2)[1]),
                y: parseFloat(r.ubicacion.centroide.split(' ', 3)[2]),
                srid: 4326
              };
              return d.coordenadas;
            }
          });
          return {
            title: d.nombre,
            subTitle: d.clase,
            type: 'LUGAR',
            idEpok: d.id,
            suggesterName: this.name,
            data: d
          };
        });
        callback(results, text, this.name);
      },
      (err) => callback(err, text, this.name)
    );
  }

  /**
   * Indica si el componente esta listo para realizar sugerencias
   * @return {Boolean} Verdadero si el componente se encuentra listo para responder sugerencias
   */
  ready() {
    return true;
  }

  /**
   * Actualiza la configuracion del componente a partir de un objeto con overrides para las
   * opciones disponibles
   * @param {Object} options Objeto conteniendo overrides para las opciones disponibles
   */
  setOptions(options) {
    this.options = Object.assign({}, this.options, options);
  }
}
