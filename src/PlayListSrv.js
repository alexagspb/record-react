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

  getMediaElem = (url, id) => {
    // url = base64url

    return <span>
      <audio controls src={url} ref={(elem) => { this.Plays[id] = elem }} />
    </span>
  }

  render() {
    const { records } = this.props

    return (
      <div>
        {records && records.length > 1 ? <div>
          <button onClick={this.playAll}>Воспроизвести все</button>
          <button onClick={this.reset}>Начать сначала</button>
          <button onClick={this.pause}>Пауза</button>
        </div> : null}
        <ul>
          {records && records.map((item, index) => {
            return <li key={index}>{this.getMediaElem(item, index)}</li>
          })}
        </ul>
      </div>
    )
  }

}

export default PlayList
