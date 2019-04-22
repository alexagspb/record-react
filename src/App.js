import React, { Component } from 'react';
import './App.css';

import PlayList from './PlayList'

class App extends Component {
  state = {
    media: '',
    mediaSelected: false,
    mediaOptions: {},
    recording: false,
    records: [],
    counter: 0
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

  componentDidMount() {
    this.selectMediaType('audio')
  }

  render() {
    const { media, recording, mediaSelected, records } = this.state

    return (
      <div className="App">
        {
          mediaSelected
            ? <div className='App_buttons'>
              <button onClick={this.startRecord} disabled={recording}>Старт</button>
              <button onClick={this.stopRecord} disabled={!recording}>Стоп</button>
              <PlayList records={records} onClick={this.handleUpload} onRemove={this.removeRecord} />
              {
                recording && <h3>Идет запись...</h3>
              }
            </div>
            : <div>
              <label><input type="radio" name="media" value="video" onChange={() => this.selectMediaType('video')} checked={media === 'video'} />Видео</label>
              <label><input type="radio" name="media" value="audio" onChange={() => this.selectMediaType('audio')} checked={media === 'audio'} />Аyдио</label>
              <button onClick={this.selectRecord}>Начать запись</button>
            </div>
        }
      </div>
    );
  }
}

export default App;
