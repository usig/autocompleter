import React, { Component } from 'react';
import { Autocompleter } from '@usig-gcba/autocompleter';
import './App.css';

class App extends Component {

  constructor(props) {

    super(props);

    this.state = {
      autocompleter: '',
      showMap: false,
      loading: false,
      x: null,
      y: null,
      input: '',
      error: null,
      suggestions: [],
      selectedSuggestion: null,
      direccionesCaba: true,
      direccionesAmba: true,
      lugares: true,
      deficit: true,
      catastro: true,
      long: 3,
      pause: 300,
      maxSugg: 10
    };
  }



  handleInputChange = async event => {
    const text = event.target.value;
    this.state.autocompleter.updateSuggestions(text);
    this.setState({ input: text, showMap: false});
  };

  async onChange(e){
      
    if(
      e.target.name === 'direccionesCaba' ||
      e.target.name === 'direccionesAmba' ||
      e.target.name === 'lugares' ||
      e.target.name === 'deficit' ||
      e.target.name === 'catastro'
      ){
      this.state[e.target.name] = e.target.checked
      this.setState({
        [e.target.name]: e.target.checked
      });
      this.prueba();
    }else{
      this.state[e.target.name] = e.target.value;
      this.setState({
        [e.target.name]: e.target.value
      });
      this.prueba();
    }
  }

  handleClick = async suggestion => {
    console.log('suggestion', suggestion);
    let coord = await this.state.autocompleter.updateCoordenadas(suggestion);
    if (suggestion) {
      this.setState({ selectedSuggestion: suggestion });
      if (suggestion.type === 'CALLE') {
        this.setState({
          suggestions: [],
          input: suggestion.title + ' '
        });
      } else {
        this.setState({
          input: suggestion.title,
          suggestions: [],
          loading: true
        });
        if (suggestion.type === 'DIRECCION') {
          this.setState({
            showMap: true,
            loading: false,
            x: coord.x,
            y: coord.y
          });
        }
      }
    }
  };

  async prueba () {

    const  options = { 
      maxSuggestions: this.state.maxSugg,
      minTextLength: this.state.long,
      inputPause: this.state.pause,
      SuggesterDirecciones: this.state.direccionesCaba,
      SuggesterDireccionesAMBA: this.state.direccionesAmba,
      SuggesterLugares: this.state.lugares,
      SuggesterDeficitHabitacional: this.state.deficit,
      SuggesterCatastro: this.state.catastro,
    };
    //Callbacks del autocomplete
    const suggestionsCallback = async suggestions => {

      this.setState({ suggestions: suggestions });
    };

    const completeSuggestionsCallback = suggestions =>  {

      if (suggestions.length === 0) {
        this.setState({ suggestions: [] });
      } else {
        this.setState({ error: null });
      }
    };

    const errorCallback = error => {
      this.setState({ error: error });
    };

    const autocompleter = new Autocompleter(
      {
        onCompleteSuggestions: completeSuggestionsCallback,
        onSuggestions: suggestionsCallback,
        onError: errorCallback
      },
      options
    );

    if (options.SuggesterDirecciones) autocompleter.addSuggester('Direcciones', { inputPause: 250});
    if (options.SuggesterDireccionesAMBA) autocompleter.addSuggester('DireccionesAMBA');
    if (options.SuggesterLugares) autocompleter.addSuggester('Lugares');
    if (options.SuggesterDeficitHabitacional) autocompleter.addSuggester('DeficitHabitacional');
    if (options.SuggesterCatastro) autocompleter.addSuggester('Catastro');
    

    this.setState({ autocompleter: autocompleter, suggestions: [] });

  }

  componentDidMount() { // esto se ejecuta una vez al cargar el componente, deberias usar ShouldComponentUpdate
    // this.prueba();
    // Opciones de config del autocomplete
    var options = { 
      maxSuggestions: this.state.maxSugg,
      minTextLength: this.state.long,
      inputPause: this.state.pause,
      SuggesterDirecciones: this.state.direccionesCaba,
      SuggesterDireccionesAMBA: this.state.direccionesAmba,
      SuggesterLugares: this.state.lugares,
      SuggesterDeficitHabitacional: this.state.deficit,
      SuggesterCatastro: this.state.catastro,
    };    

    //Callbacks del autocomplete
    const suggestionsCallback = suggestions => {
      this.setState({ suggestions: suggestions });
    };

    const completeSuggestionsCallback = suggestions => {
      if (suggestions.length === 0) {
        this.setState({ suggestions: [] });
      } else {
        this.setState({ error: null });
      }
    };

    const errorCallback = error => {
      this.setState({ error: error });
    };

    const autocompleter = new Autocompleter(
      {
        onCompleteSuggestions: completeSuggestionsCallback,
        onSuggestions: suggestionsCallback,
        onError: errorCallback
      },
      options
    );
    
    if (options.SuggesterDirecciones) autocompleter.addSuggester('Direcciones', { inputPause: 250});
    if (options.SuggesterDireccionesAMBA) autocompleter.addSuggester('DireccionesAMBA');
    if (options.SuggesterLugares) autocompleter.addSuggester('Lugares');
    if (options.SuggesterDeficitHabitacional) autocompleter.addSuggester('DeficitHabitacional');
    if (options.SuggesterCatastro) autocompleter.addSuggester('Catastro');

    this.setState({ autocompleter: autocompleter, suggestions: [] });  

  }

  render() {
    return (
      <div className="App">
        <div className="section">
          <div id="header">
            <div id="logo">
              <h1>GOID AutoCompleter (Demo)</h1>
            </div>
          </div>
          <div id="buscador">
          <form id="mainForm" acceptCharset="utf-8">
          Lugar{' '}
          <input id="search-input" value={this.state.input} onChange={this.handleInputChange} />
          <span id="ejemplo">ej.: Callao y Corrientes, Florida 550, Teatro San Martín, etc.</span>
          {this.state.error ? this.state.error.message : null}
          {this.state.suggestions.map((suggestion, index) => {
            const title = suggestion.alias || suggestion.title || suggestion.nombre || suggestion.data.smp || suggestion.data;
            const subTitle = suggestion.subTitle ? suggestion.subTitle : suggestion.descripcion;
            return (
              <div className="sugerencia" key={index} onClick={() => this.handleClick(suggestion)}>
                <div
                  className="titulo-sugerencia"
                  id={title + '-title-sug-' + index}
                  aria-hidden="true"
                >
                  {title}
                </div>
                <div className="clase" id={subTitle + '-subtitle-sug-' + index} aria-hidden="true">
                  {subTitle}
                </div>
              </div>
            );
          })}
          {this.state.selectedSuggestion ? (
            <div style={{ zIndex: 0, display: 'inline-block', maxWidth: '35 vw' }}>
              <pre>{JSON.stringify(this.state.selectedSuggestion, null, 2)}</pre>
            </div>
          ) : null}
          {this.state.showMap ? (
            <img
              style={{ display: 'inline-block', maxWidth: '35 vw' }}
              alt="mapa"
              src={`http://servicios.usig.buenosaires.gob.ar/LocDir/mapa.phtml?x=${this.state.x}&y=${this.state.y}&w=600&punto=1&desc=`}
            />
          ) : null}
          <br/><fieldset title="Opciones" className="options">
          
     		    <legend>Opciones</legend>
              <table>
                <tbody>
                  <tr>
                    <td className="label"><label htmlFor="long">Mínima longitud del texto para activarse:</label></td>
                    <td><input 
                      value={this.state.long}
                      onChange={this.onChange.bind(this)}
                      name="long" id="long" type="number" size="1" maxLength="1" />
                    </td>
                  </tr>
                  <tr>
                    <td className="label"><label htmlFor="pause">Pausa necesaria para activarse (ms):</label></td>
                    <td><input 
                      value={this.state.pause}
                      onChange={this.onChange.bind(this)}
                      name="pause" id="pause" type="number" size="3" maxLength="3" />
                    </td>
                  </tr>
                  <tr>
                    <td className="label"><label htmlFor="maxSugg">Máx. número de sugerencias a mostrar:</label></td>
                    <td><input
                      value={this.state.maxSugg}
                      onChange={this.onChange.bind(this)}
                      name="maxSugg" id="maxSugg" type="number" size="2" maxLength="2" />
                    </td>
                  </tr>
                </tbody>
              </table><br/>
              <input name="direccionesCaba" id="direccionesCaba" type="checkbox"
                value={this.state.direccionesCaba}
                onChange={this.onChange.bind(this)}
                checked={this.state.direccionesCaba}/>Direcciones CABA
              <p className="label">Permite buscar direcciones por calle y altura o intersección dentro de la Ciudad Autonoma de Buenos Aires.</p>
              
              <input name="direccionesAmba" id="direccionesAmba" type="checkbox"
                value={this.state.direccionesAmba}
                onChange={this.onChange.bind(this)}
                checked={this.state.direccionesAmba}/>Direcciones AMBA
              <p className="label">Permite buscar direcciones por calle y altura o intersección dentro del Área Metropolitana de Buenos Aires.</p>
              
              <input name="lugares" id="lugares" type="checkbox"
                value={this.state.lugares}
                onChange={this.onChange.bind(this)}
                checked={this.state.lugares}/>Lugares
              <p className="label">Permite buscar lugares de interés en la Ciudad de Buenos Aires y el Área Metropolitana.</p>
              
              <input name="deficit" id="deficit" type="checkbox"
                value={this.state.deficit}
                onChange={this.onChange.bind(this)}
                checked={this.state.deficit}/>Zonas Vulnerables
              <p className="label">Permite buscar manzanas en zonas vulnerables de la Ciudad de Buenos Aires ingresando el nombre de la zona y el nombre de la manzana separadas por coma. Ej. "villa 15, manzana 1".</p>

              <input name="catastro" id="catastro" type="checkbox"
                value={this.state.catastro}
                onChange={this.onChange.bind(this)}
                checked={this.state.catastro}/>Catastro
              <p className="label">Permite ubicar coordenadas de un smp dentro de la Ciudad Autonoma de Buenos Aires ingresando seccion, manzana, y parcela separadas por (-). Ej "01-001-001A".</p>

          </fieldset>
          </form>
          </div>
          {/* <p>{JSON.stringify(this.state.autocompleter.options)}</p> */}
          <div id="footer">
            <p>&copy; 2020-2021 GOID - Gerencia Operativa de Ingeniería de Datos</p>
          </div>
        </div>
      </div>
    );
  }
}

export default App;