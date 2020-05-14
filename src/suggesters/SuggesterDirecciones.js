/**
 * Created by federuiz on 7/11/17.
 */
import Suggester from './Suggester.js';
import { Normalizador } from '@usig-gcba/normalizador';
import { usig_webservice_url } from '../config';
import { catastro_webservice_url } from '../config';

/**
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
  serverTimeout: 5000,
  maxRetries: 5,
  maxSuggestions: 10,
  acceptSN: true,
  callesEnMinusculas: true,
  ignorarTextoSobrante: false
};

export default class SuggesterDirecciones extends Suggester {
  constructor(name, options) {
    let opts = Object.assign({}, defaults, options);
    super(name, opts);
    if (!this.options.normalizadorDirecciones && !Normalizador.inicializado()) {
      Normalizador.init(opts);
    }
    this.options.normalizadorDirecciones = Normalizador;
  }

  // Esta es la misma función que se usa en SuggesterDireccionesAMBA pero con
  // la url cambiada, idealmente se podríá extraer a un archivo tipo utils
  // y cambiarla para que dependiendo de si la dirección es CABA o AMBA
  // agregue la localidad a la búsqueda o no.
  async getLatLng2(lugar) {
    let response = await fetch(
      `${usig_webservice_url}/normalizar/?direccion=${lugar.nombre}&geocodificar=true&srid=4326`
    );

    if (response.status === 200) {
      let json = await response.json();
      return json;
    }
  }

  // Hay que indicarle al usuario que para obtener el smp, si o si tiene que idicarle una altura valida a la direccion.
  async getLatLng3(lugar) {
    let response = await fetch(
      `${catastro_webservice_url}/parcela/?codigo_calle=${lugar.codigo || lugar.calle.codigo}&altura=${lugar.altura}&geocodificar=true&srid=4326`
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
    if (this.options.debug) console.log("usig.SuggesterDirecciones.getSuggestions('" + text + "')");
    var maxSug = maxSuggestions != undefined ? maxSuggestions : this.options.maxSuggestions;
    try {
      let dirs = this.options.normalizadorDirecciones.normalizar(text, maxSug);
      dirs = dirs.map((d, i) => {
        d.descripcion = 'Ciudad Autónoma de Buenos Aires';

        this.getLatLng2(d).then((r) => {
          if (
            r['direccionesNormalizadas'] &&
            r['direccionesNormalizadas'][0] &&
            r['direccionesNormalizadas'][0]['coordenadas']
          ) {
            // Por alguna razón las coordenadas de CABA vienen como string
            // Si en algún momento se arregla/cambia podemos obviar la parte de
            // castear esos strings a floats.
            d.coordenadas = {
              x: parseFloat(r['direccionesNormalizadas'][0]['coordenadas']['x']),
              y: parseFloat(r['direccionesNormalizadas'][0]['coordenadas']['y']),
              srid: r['direccionesNormalizadas'][0]['coordenadas']['srid']
            };
            return d.coordenadas;
          }
        });
        this.getLatLng3(d).then((r) => {
          if (r['smp']) d.smp = r['smp'];
          return d.smp;
        });
        return {
          title: d.nombre,
          subTitle: d.descripcion,
          type: d.tipo,
          category: d.type,
          suggesterName: this.name,
          data: d
        };
      });
      callback(dirs, text, this.name);
    } catch (error) {
      if (this.options.ignorarTextoSobrante) {
        try {
          let opciones = this.options.normalizadorDirecciones.buscarDireccion(text);
          if (opciones !== false) {
            let dirs = [opciones.match];
            dirs.map((d) => {
              d.descripcion = 'Ciudad Autónoma de Buenos Aires';
              return {
                title: d.name,
                subTitle: d.descripcion,
                type: d.type,
                category: d.type,
                suggesterName: this.name,
                data: d
              };
            });
            callback(dirs, text, this.name);
          } else {
            if (error.id === 0) {
              callback([], text, this.name);
            }
            callback(error, text, this.name);
          }
        } catch (error) {
          callback(error, text, this.name);
        }
      } else {
        if (error.id === 0) {
          callback([], text, this.name);
        } else callback(error, text, this.name);
      }
    }
  }

  /**
   * Indica si el componente esta listo para realizar sugerencias
   * @return {Boolean} Verdadero si el componente se encuentra listo para responder sugerencias
   */
  ready() {
    return (
      this.options.normalizadorDirecciones && this.options.normalizadorDirecciones.inicializado()
    );
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
