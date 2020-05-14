import Suggester from './Suggester.js';
import 'isomorphic-fetch';
import URI from 'urijs';

const defaults = {
  serverTimeout: 30000,
  server: 'https://epok.buenosaires.gob.ar/deficithabitacional/buscarManzana/',
  maxRetries: 1,
  maxSuggestions: 10
};

function mkRequest(data, address, serverDefaults) {
    const url = URI(address).search(data);
    return fetch(url.toString(), serverDefaults).then(resp => resp.json());
  }

export default class SuggesterDeficitHabitacional extends Suggester {
  constructor(name, options) {
    let opts = Object.assign({}, defaults, options);
    super(name, opts);
    this.lastRequest = null;
  }

  getSuggestions(text, callback, maxSuggestions) {
    const data = {
      ubicacion: text
    };
    this.lastRequest = mkRequest(data, defaults.server, {}).then(
      res => {
        const results = res.instancias.map(d => {
          d.ubicacion.coordenadas = {
            x: parseFloat(d.ubicacion.centroide.split('(', 2)[1]),
            y: parseFloat(d.ubicacion.centroide.split(' ', 3)[2]),
            srid: 4326
          };
          return {
            title: d.nombre,
            subTitle: d.clase,
            type: d.type,
            suggesterName: this.name,
            contenido: d.contenido,
            coordenadas: d.ubicacion.coordenadas
          };
        });
        callback(results, text, this.name);
      },
      err => callback(err, text, this.name)
    );
  }

  ready() {
    return true;
  }

  setOptions(options) {
    this.options = Object.assign({}, this.options, options);
  }
}