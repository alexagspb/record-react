import React, { Component } from 'react';

class PlayList extends Component {
  constructor(props) {
    super()
    this.Plays = []
  }

  state = {
    currentMedia: 1
  }

  playAll = () => {
    const { currentMedia } = this.state
    if (this.Plays[currentMedia]) {
      this.Plays[currentMedia].play()

      this.Plays[currentMedia].onended = () => {
        this.setState(state => {
          const currentMedia = ++state.currentMedia

          return {
            currentMedia,
          };
        });
        this.playAll()
      }
    } else {
      this.setState({ currentMedia: 1 })
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

  getMediaElem = (item) => {
    const download = `${item.id}${item.ext}`
    const url = URL.createObjectURL(item.blob)

    if (item.type === 'audio') {
      return <span><audio controls src={url} ref={(elem) => { this.Plays[item.id] = elem }} /><a href={url} download={download}>Скачать {download}</a></span>
    } else {
      return <span><video controls src={url} /><a href={url} download={download}>Скачать {download}</a></span>
    }
  }

  render() {
    const { records, onClick } = this.props

    return (
      <div>
        {records && records.length > 1 ? <div>
          <button onClick={this.playAll}>Воспроизвести все</button>
          <button onClick={this.reset}>Начать сначала</button>
          <button onClick={this.pause}>Пауза</button>
        </div> : null}
        <ul>
          {records && records.map((item) => {
            return <li key={item.id}>{this.getMediaElem(item)} <span className='upload_btn' onClick={() => onClick(item.blob)}>Загрузить на сервер</span></li>
          })}
        </ul>
      </div>
    )
  }

}

export default PlayList
