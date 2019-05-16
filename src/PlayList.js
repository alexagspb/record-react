import React, { Component } from 'react';
import Sortable from 'react-sortablejs';

import Audio from './Audio'
class PlayList extends Component {
  constructor(props) {
    super()
    this.Plays = []
  }

  state = {
    currentMedia: 0,
    records: [],
    playing: false
  }

  getNextPlay = () => {
    this.setState(state => {
      const currentMedia = ++state.currentMedia

      return {
        currentMedia
      };
    });
    this.playAll()
  }

  playAll = () => {
    const { currentMedia } = this.state

    this.setState({ playing: true })

    if (this.Plays[currentMedia]) {
      this.Plays[currentMedia].elem.play()

      this.Plays[currentMedia].elem.onended = () => {
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

    this.Plays[currentMedia].elem.pause()

    this.setState({ playing: false })
  }

  reset = () => {
    this.Plays.forEach((audio) => {
      audio.elem.load()
    })

    this.setState(state => {
      const currentMedia = 0

      return {
        currentMedia,
        playing: false
      };
    });
  }

  getMediaElem = (url, id, index) => {
    if (url.blob) {
      url = URL.createObjectURL(url.blob)
    }

    const download = `${id}.ogg`
    return <span>
      <Audio controls={false} src={url} autoplay={false} volume="0.1" ref={(elem) => {
        this.Plays[index] = elem
      }} />
      <a href={url} download={download}>Скачать {download}</a>
    </span>
  }

  componentWillReceiveProps(newProps) {
    this.setState({ records: newProps.records });
  }

  componentDidMount() {
    const { autoplay, records } = this.props

    this.setState({ records });

    if (autoplay) {
      setTimeout(() => {
        this.playAll()
      }, 0);
    }
  }

  render() {
    const { onReset } = this.props
    const { records, playing } = this.state

    const listItems = records.map((item, index) => {
      if (item.blob) {
        item = URL.createObjectURL(item.blob)
      }

      const id = item.slice(-8)

      return <li key={id} data-id={item}>{this.getMediaElem(item, id, index)}</li>
    })

    return (
      <div>
        {records ? <div>
          <button onClick={this.playAll} disabled={playing}>Воспроизведение</button>
          <button onClick={this.reset}>Начать сначала</button>
          <button onClick={this.pause} disabled={!playing}>Пауза</button>
        </div> : null}
        <button onClick={onReset}>Вернуться назад</button>
        <Sortable
          tag="ul"
          onChange={(order) => {
            this.setState({ records: order });
            this.reset()
          }}
        >
          {listItems}
        </Sortable>

      </div>
    )
  }
}

export default PlayList
