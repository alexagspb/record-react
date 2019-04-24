import React, { Component } from 'react';

import base64url from './base64url';
class PlayList extends Component {
  constructor(props) {
    super()
    this.Plays = []
  }

  state = {
    currentMedia: 1
  }

  getNextPlay = () => {
    this.setState(state => {
      const currentMedia = ++state.currentMedia

      return {
        currentMedia,
      };
    });
    this.playAll()
  }

  playAll = () => {
    const { currentMedia } = this.state
    if (this.Plays[currentMedia]) {
      this.Plays[currentMedia].play()

      this.Plays[currentMedia].onended = () => {
        this.getNextPlay()
      }
    } else {
      if (currentMedia < this.Plays.length) {
        this.getNextPlay()
      } else {
        this.setState({ currentMedia: 1 })
      }
    }
  }

  pause = () => {
    const { currentMedia } = this.state

    this.Plays[currentMedia].pause()
  }

  reset = () => {
    this.setState(state => {
      const currentMedia = 1

      return {
        currentMedia,
      };
    });
  }

  fade = (audio) => {
    if (audio.volume.toFixed(2) > 0) {
      audio.volume -= 0.1;
      setTimeout(() => this.fade(audio), 200);
    } else {
      audio.pause();
    }
  }

  fadeOut = () => {
    const { currentMedia } = this.state
    const audio = this.Plays[currentMedia];

    this.fade(audio)
  }

  getMediaElem = (item) => {
    const download = `${item.id}${item.ext}`
    let url = URL.createObjectURL(item.blob)

    url = base64url

    if (item.type === 'audio') {
      return <span>
        <audio controls src={url} ref={(elem) => { this.Plays[item.id] = elem }} />
        <a href={url} download={download}>Скачать {download}</a>
      </span>
    } else {
      return <span><video controls src={url} ref={(elem) => { this.Plays[item.id] = elem }} /><a href={url} download={download}>Скачать {download}</a></span>
    }
  }

  render() {
    const { records, onClick, onRemove } = this.props

    return (
      <div>
        {records && records.length > 1 ? <div>
          <button onClick={this.playAll}>Воспроизвести все</button>
          <button onClick={this.reset}>Начать сначала</button>
          <button onClick={this.pause}>Пауза</button>
        </div> : null}
        <ul>
          {records && records.map((item) => {
            return <li key={item.id}>{this.getMediaElem(item)}
              <span className='upload_btn' onClick={() => onClick(item.blob)}>Загрузить на сервер</span>
              <span className='fadeout_btn' onClick={this.fadeOut}>Fade Out</span>
              <span className='remove_btn' onClick={() => onRemove(item.id)}>×</span>
            </li>
          })}
        </ul>
      </div>
    )
  }

}

export default PlayList
