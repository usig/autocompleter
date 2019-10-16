/* global describe, it, before */

import chai from 'chai';
import {Autocompleter, Suggester} from '../lib/Autocompleter.min.js';

chai.expect();

const expect = chai.expect;

let autocompleter;
let sug = new Suggester('fede', {});
console.log (sug.getOptions());
describe('Dado una instancia del Autocompleter con dos Sugesters de direcciones', () => {
  before((done) => {
    autocompleter = new Autocompleter();
    setTimeout(() => done(), 2000);
  });
  //TODO implement missing tests
  describe('Cuando creo una instancia de autocompleter', () => {

    it('deberia llamar al callback de cambio de estado', (done) => {
      const updateCallback = (res) => {
        expect(res.currentText).to.be.equal("libertad");
        done();
      };
      autocompleter.setCallbacks({onUpdate: updateCallback});
      autocompleter.updateSuggestions("libertad");
    });
    it('deberia llamar al callback de sugerencias de un suggester', (done) => {
      const suggestionsCallback = (res) => {
        expect(res.length).to.be.equal(2);
        done();
      };
      autocompleter.setCallbacks({onSuggestions: suggestionsCallback});
      autocompleter.updateSuggestions("libertad");
    });
    it('deberia llamar al callback de sugerencias de todos suggester', (done) => {
      const suggestionsCallback = (res) => {
        expect(res.length).to.be.equal(4);
        done();
      };
      autocompleter.setCallbacks({onCompleteSuggestions: suggestionsCallback});
      autocompleter.updateSuggestions("libertad");
    });
    it('deberia llamar al callback de mensaje de resultados vacios', (done) => {
      const messageCallback = (res) => {
        expect(res.message).to.be.equal("No results found");
        done();
      };
      const errorCallback = (res) => {
        console.log(res);
        done();
      };
      autocompleter.setCallbacks({onMessage: messageCallback, onError: errorCallback});
      autocompleter.updateSuggestions("asdfgh");
    });
    it('deberia cancelar la primer busqueda en caso de una nueva antes del tiempo de espera', (done) => {
      const suggestionsCallback = (res) => {
        expect(res.length).to.be.equal(2);
        expect(res[0].calle.nombre).to.be.equal("SOLIS");
        done();
      };
      autocompleter.setCallbacks({onCompleteSuggestions: suggestionsCallback});
      autocompleter.updateSuggestions("libertad");
      autocompleter.updateSuggestions("Solis 777");
      expect(autocompleter.getGlobalState().currentText).to.be.equal("Solis 777");

    });
  });
});
