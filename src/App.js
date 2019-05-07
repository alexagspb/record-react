import React, { Component } from 'react';
import SuperForm from 'react-superforms'

import './App.css';

import PlayList from './PlayListSrv'

class App extends Component {

  state = {
    playType: '',
    mediaOptions: {
      tag: 'audio',
      type: 'audio/ogg',
      ext: '.ogg',
      gUM: { audio: true, video: false }
    },
    recording: false,
    records: [],
    counter: 0,
    stream: false,
    chunks: [],
    voices: ['alyss', 'jane', 'oksana', 'omazh'],
    voice: "oksana",
    emotions: ['good', 'evil', 'neutral'],
    emotion: 'neutral',
    rates: ['48000', '16000', '8000'],
    rate: '48000',
  }

  selectRecord = (e) => {
    e.preventDefault()

    const { mediaOptions } = this.state

    navigator.mediaDevices.getUserMedia(mediaOptions.gUM).then(_stream => {
      this.stream = _stream;
      this.recorder = new MediaRecorder(this.stream);
      this.recorder.ondataavailable = e => {
        this.chunks.push(e.data);
        if (this.recorder.state === 'inactive') {
          let blob = new Blob(this.chunks, { type: mediaOptions.tag })

          this.setState(state => {
            const records = [...state.records, { type: mediaOptions.tag, blob: blob, id: ++state.counter, ext: mediaOptions.ext }];

            return {
              records,
            };
          });
        }
      };
    }).catch((e) => {
      console.log(e);
    });

    this.setState({ playType: 'voiсe' })
  }

  startStream = () => {
    this.audioCtx = new AudioContext();
    const source = this.audioCtx.createMediaStreamSource(this.stream);
    const biquadFilter = this.audioCtx.createBiquadFilter();
    biquadFilter.type = "lowshelf";
    biquadFilter.frequency.value = 1000;
    source.connect(biquadFilter);
    biquadFilter.connect(this.audioCtx.destination);
    this.setState({ stream: true })
  }

  stopStream = () => {
    this.audioCtx.close();
    this.setState({ stream: false })
  }

  startRecord = (e) => {
    e.preventDefault()
    this.chunks = [];
    this.recorder && this.recorder.start();
    this.setState({ recording: true })
  }

  stopRecord = (e) => {
    e.preventDefault()
    this.recorder && this.recorder.stop();
    this.setState({ recording: false })
  }

  removeRecord = (id) => {
    this.setState(state => {
      const records = state.records.filter((item) => item.id !== id)

      return {
        records,
      };
    });
  }

  handleUpload = (blob) => {
    let xhr = new XMLHttpRequest();

    xhr.open("POST", 'upload.php', true);

    xhr.onload = function (e) {
      console.log(e);
    };

    xhr.send(blob);
  }

  handleChange = ({ name, value }, index) => {
    const chunks = this.state.chunks.slice(0)
    chunks[index][name] = value
    this.setState({
      chunks
    })
  }

  handleSubmit = (e) => {
    e && e.preventDefault()

    const { voice, emotion, rate } = this.state

    const chunks = this.state.chunks.map((item) => item.title).filter((item) => !!item)

    const data = {
      "chunks": chunks.length ? chunks : ["рейс", "Москва", "Тула", "отходит от платформы номер", '1', "рейс Москва Тула отходит от платформы номер 1"],
      params: {
        "sample_rate_hertz": +rate,
        emotion,
        voice
      }
    }

    const xhr = new XMLHttpRequest()
    xhr.open('POST', 'http://speech-kit.avto-pass.net/api')
    xhr.setRequestHeader('Content-type', 'application/json')
    xhr.send(JSON.stringify(data))
    xhr.onload = () => {
      const items = xhr.responseText.slice(0, -1).split(',')
      let records = []

      for (let i = 1; i < items.length; i += 2) {
        records.push('data:audio/ogg;base64,' + items[i].slice(0, -1))
      }
      this.setState({ records })
    }
  }

  pushChunk = (e) => {
    e && e.preventDefault()
    this.setState({
      chunks: [...this.state.chunks, { title: '' }]
    })
  }

  handleDelete = index => {
    const { chunks } = this.state
    this.setState({
      chunks: chunks.filter((chunk, i) => i !== index)
    })
  }

  handleRadioChange = (e, type) => {
    this.setState({
      [type]: e.target.value
    })
  }

  resetRecords = () => {
    this.setState({ records: [] })
  }

  render() {
    const { recording, records, stream, chunks, voices, emotions, rates, playType } = this.state

    if (stream) {
      return <div className="App"><button onClick={this.stopStream}>Остановить трансляцию</button></div>
    }

    return (
      <div className="App">
        <button onClick={this.startStream}>Начать трансляцию</button>

        {records && records.length
          ? <PlayList
            records={records}
            onClick={this.handleUpload}
            onRemove={this.removeRecord}
            onReset={this.resetRecords}
            autoplay={true}
          />
          :
          <div className='App_buttons'>
            {!playType && <div>
              <button onClick={this.startStream}>Начать запись голоса</button>
              <button onClick={() => { this.setState({ playType: 'data' }) }}>Начать ввод данных</button>
            </div>
            }
            {playType === 'voice' ?
              <div>
                <button onClick={this.startRecord} disabled={recording}>Начать запись</button>
                <button onClick={this.stopRecord} disabled={!recording}>Остановить запись</button>
                {recording && <h3>Идет запись...</h3>}
              </div>
              : null
            }

            {playType === 'data' ? <div>
              <form onSubmit={this.handleSubmit}>
                {chunks.map((chunk, index) => {
                  return (
                    <div className='App_form_container' key={index}>
                      <SuperForm
                        Component='div'
                        index={index}
                        value={chunk}
                        layout={['title']}
                        schema={{
                          title: {
                            label: 'Введите звуковую единицу',
                          },
                        }}
                        onChange={this.handleChange}
                      />
                      <div className='App_form_remove' onClick={e => {
                        this.handleDelete(index)
                      }}>
                        ×
                    </div>
                    </div>
                  )
                })}
                <button onClick={this.pushChunk}>+</button>
                <button type='submit'>Показать плейлист</button>
              </form>

              <div className="App_radio">
                {voices.map((item, index) => {
                  return (
                    <label key={index}>
                      <input type="radio" name='voice' value={item}
                        checked={this.state.voice === item}
                        onChange={(e) => this.handleRadioChange(e, 'voice')} />
                      {item}
                    </label>
                  )
                })}
              </div>
              <div className="App_radio">
                {emotions.map((item, index) => {
                  return (
                    <label key={index}>
                      <input type="radio" name='emotion' value={item}
                        checked={this.state.emotion === item}
                        onChange={(e) => this.handleRadioChange(e, 'emotion')} />
                      {item}
                    </label>
                  )
                })}
              </div>
              <div className="App_radio">
                {rates.map((item, index) => {
                  return (
                    <label key={index}>
                      <input type="radio" name='rate' value={item}
                        checked={this.state.rate === item}
                        onChange={(e) => this.handleRadioChange(e, 'rate')} />
                      {item}
                    </label>
                  )
                })}
              </div>
            </div>
              : null}
          </div>
        }
      </div >
    );
  }
}

export default App;
