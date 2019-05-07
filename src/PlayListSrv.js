import React, { Component } from 'react';

class PlayList extends Component {
  constructor(props) {
    super()
    this.Plays = []
  }

  state = {
    currentMedia: 0
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
        this.setState({ currentMedia: 0 })
      }
    }
  }

  pause = () => {
    const { currentMedia } = this.state

    this.Plays[currentMedia].pause()
  }

  reset = () => {
    const { currentMedia } = this.state
    this.Plays[currentMedia].load()

    this.setState(state => {
      const currentMedia = 0

      return {
        currentMedia,
      };
    });
  }

  getMediaElem = (url, id) => {
    return <span>
      <audio controls src={url} ref={(elem) => { this.Plays[id] = elem }} />
    </span>
  }


  componentDidMount() {
    const { autoplay } = this.props

    if (autoplay) {
      this.playAll()
    }
  }

  render() {
    const { records, onReset } = this.props

    return (
      <div>
        {records && records.length > 1 ? <div>
          <button onClick={this.playAll}>Воспроизвести все</button>
          <button onClick={this.reset}>Начать сначала</button>
          <button onClick={this.pause}>Пауза</button>
        </div> : null}
        <button onClick={onReset}>Вернуться назад</button>
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
