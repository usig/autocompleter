/**
 * Created by federuiz on 7/11/17.
 */
const defaults = {
  debug: false,
  serverTimeout: 15000,
  maxRetries: 5,
  maxSuggestions: 10
};

export default class Suggester {

  constructor(name, options){
    this.name = name;
    this.options = Object.assign({}, defaults, options);
    this.status = "done";
    this.inputTimer = null;
  }

  /**
   * Dado un string, realiza una busqueda de sugerencias y llama al callback con las
   * opciones encontradas.
   * @param {String} text Texto de input
   * @param {Function} callback Funcion que es llamada con la lista de sugerencias
   * @param {Integer} maxSuggestions (optional) Maximo numero de sugerencias a devolver
   */
  getSuggestions(text, callback, maxSuggestions){
    throw new this.MethodNotImplemented();
  };

  /**
   * Permite abortar la ultima consulta realizada
   */
  abort() {
    //throw new usig.Suggester.MethodNotImplemented();
  }

  /**
   * Actualiza la configuracion del componente a partir de un objeto con overrides para las
   * opciones disponibles
   * @param {Object} options Objeto conteniendo overrides para las opciones disponibles
   */
  setOptions(options) {
    this.options = Object.assign({}, this.opts, options);
  }

  /**
   * Devuelve las opciones actualmente vigentes para el componente.
   * @return {Object} Objeto conteniendo las opciones actualmente vigentes para el componente.
   */
  getOptions() {
    return this.options;
  }

  /**
   * Indica si el componente esta listo para realizar sugerencias
   * @return {Boolean} Verdadero si el componente se encuentra listo para responder sugerencias
   */
  ready() {
    throw new this.MethodNotImplemented();
  }

  MethodNotImplemented() {
    this.msg = 'Suggester: Method Not Implemented.';
    this.toString = function() {
      return this.msg;
    }
  }

  GeoCodingTypeError() {
    this.msg = 'Suggester: Wrong object type for geocoding.';
    this.toString = function() {
      return this.msg;
    }
  }
}
