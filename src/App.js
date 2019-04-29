import React, { Component } from 'react';
// import SuperForm from 'react-superforms'
import { SuperForm } from './superforms/index'

import './App.css';

import PlayList from './PlayListSrv'

class App extends Component {

  state = {
    media: '',
    mediaSelected: false,
    mediaOptions: {},
    recording: false,
    records: [],
    counter: 0,
    stream: false,
    chunks: [],
  }

  selectMediaType = (value) => {
    const mediaOptions = value === 'video' ? {
      tag: 'video',
      type: 'video/webm',
      ext: '.mp4',
      gUM: { video: true, audio: true }
    }
      : {
        tag: 'audio',
        type: 'audio/ogg',
        ext: '.ogg',
        gUM: { audio: true, video: false }
      }

    this.setState({ media: value, mediaOptions })
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

    this.setState({ mediaSelected: true })
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

    // sample_rate_hertz: 48000, 16000, 8000
    // emotion: good, evil, neutral
    // voice: alyss, jane, oksana, omazh

    const chunks = this.state.chunks.map((item) => {
      return item.title
    })

    const data = {
      "chunks": chunks.length ? chunks : [" ", "рейс", "Москва", "Тула", "отходит от платформы номер", '1', "рейс Москва Тула отходит от платформы номер 1", " "],
      params: {
        "sample_rate_hertz": 48000,
        "emotion": "neutral",
        "voice": "oksana"
      }
    }

    const xhr = new XMLHttpRequest()
    xhr.open('POST', 'http://speech-kit.avto-pass.net/api')
    xhr.setRequestHeader('Content-type', 'application/json')
    xhr.send(JSON.stringify(data)) // Make sure to stringify
    xhr.onload = () => {
      const items = xhr.responseText.split(',')
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

  componentDidMount() {
    this.selectMediaType('audio')
  }

  render() {
    const { media, recording, mediaSelected, records, stream, chunks } = this.state

    if (stream) {
      return <div className="App"><button onClick={this.stopStream}>Остановить трансляцию</button></div>
    }

    return (
      <div className="App">
        {
          mediaSelected
            ? <div className='App_buttons'>
              <button onClick={this.startRecord} disabled={recording}>Старт</button>
              <button onClick={this.stopRecord} disabled={!recording}>Стоп</button>
              <button onClick={this.startStream}>Начать трансляцию</button>
              <PlayList records={records} onClick={this.handleUpload} onRemove={this.removeRecord} />
              {
                recording && <h3>Идет запись...</h3>
              }
              <form onSubmit={this.handleSubmit}>
                {JSON.stringify(chunks)}
                {chunks.map((chunk, index) => {
                  return (
                    <SuperForm
                      Component='div'
                      key={index}
                      index={index}
                      value={chunk}
                      onChange={this.handleChange}
                    />
                  )
                })}
                <button onClick={this.pushChunk}>+</button>
                <button type='submit'>Отправить</button>
              </form>
            </div>
            : <div>
              <label><input type="radio" name="media" value="video" onChange={() => this.selectMediaType('video')} checked={media === 'video'} />Видео</label>
              <label><input type="radio" name="media" value="audio" onChange={() => this.selectMediaType('audio')} checked={media === 'audio'} />Аyдио</label>
              <button onClick={this.selectRecord}>Начать запись</button>
            </div>
        }
      </div >
    );
  }
}

export default App;
