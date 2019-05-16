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
    playing: false,
    elems: {}
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

    this.setState({ playing: true, elems: { [currentMedia]: 'play' } })

    // if (this.Plays[currentMedia]) {
    //   this.Plays[currentMedia].elem.play()

    //   this.Plays[currentMedia].elem.onended = () => {
    //     this.getNextPlay()
    //   }
    // } else {
    //   if (currentMedia < this.Plays.length) {
    //     this.getNextPlay()
    //   } else {
    //     this.setState({ currentMedia: 0 })
    //   }
    // }
  }

  pause = () => {
    const { currentMedia } = this.state

    // this.Plays[currentMedia].elem.pause()

    this.setState({ playing: false, elems: { [currentMedia]: 'pause' } })
  }

  reset = () => {
    this.Plays.forEach((audio) => {
      audio.elem.load()
    })

    this.setState(state => {
      const currentMedia = 0

      return {
        currentMedia,
        playing: false,
        elems: { [currentMedia]: 'reset' }
      };
    });
  }

  getMediaElem = (url, id, index, status) => {
    if (url.blob) {
      url = URL.createObjectURL(url.blob)
    }

    const download = `${id}.ogg`
    return <span>
      <Audio controls={false} src={url} autoplay={false} status={status} volume="0.1" onEnded={this.getNextPlay} />
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
    const { records, playing, elems } = this.state




    const listItems = records.map((item, index) => {
      if (item.blob) {
        item = URL.createObjectURL(item.blob)
      }

      const status = elems[index] || 'reset'

      const id = item.slice(-8)

      return <li key={id} data-id={item}>{this.getMediaElem(item, id, index, status)}</li>
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
