import Suggester from './Suggester.js';
import { NormalizadorAMBA } from '@usig-gcba/normalizador';
import 'isomorphic-fetch';

import { usig_webservice_url } from '../config';

/**
 *
 * @class SuggesterDirecciones
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
  debug: false,
  serverTimeout: 30000,
  maxRetries: 1,
  maxSuggestions: 10
};

export default class SuggesterDireccionesAMBA extends Suggester {
  constructor(name, options) {
    if (options !== undefined) {
      options.searchOptions = Object.assign({}, defaults.searchOptions, options.searchOptions);
    }
    let opts = Object.assign({}, defaults, options);
    super(name, opts);
    if (!this.options.normalizadorAMBA) {
      this.options.normalizadorAMBA = NormalizadorAMBA.init({});
    }
    this.lastRequest = null;
  }

  // Esta es la misma función que se usa en SuggesterDirecciones pero con
  // la url cambiada, idealmente se podríá extraer a un archivo tipo utils
  // y cambiarla para que dependiendo de si la dirección es CABA o AMBA
  // agregue la localidad a la búsqueda o no.
  async getLatLng2(lugar) {
    let response = await fetch(
      `${usig_webservice_url}/normalizar/?direccion=${lugar.nombre}, ${lugar.descripcion.split(',', 2)[0]}&geocodificar=true&srid=4326`
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
    let maxSug = maxSuggestions !== undefined ? maxSuggestions : this.options.maxSuggestions;
    const midCallback = (results) => {
      results = results.map((d, i) => {
        if (d.tipo === 'DIRECCION') {
          this.getLatLng2(d).then((r) => {
            if (
              r['direccionesNormalizadas'] &&
              r['direccionesNormalizadas'][0] &&
              r['direccionesNormalizadas'][0]['coordenadas']
            ) {
              d.coordenadas = {
                x: parseFloat(r['direccionesNormalizadas'][0]['coordenadas']['x']),
                y: parseFloat(r['direccionesNormalizadas'][0]['coordenadas']['y']),
                srid: r['direccionesNormalizadas'][0]['coordenadas']['srid']
              };
              return d.coordenadas;
            }
          });
        }
        return {
          title: d.nombre,
          subTitle: d.descripcion,
          type: d.tipo,
          category: d.tipo,
          suggesterName: this.name,
          data: d
        };
      });
      callback(results, text, this.name);
    };
    this.options.normalizadorAMBA.buscar(
      text,
      (results) => midCallback(results),
      function (err) {
        console.log(err);
      },
      maxSug
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
