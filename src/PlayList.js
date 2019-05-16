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

  next = () => {
    const { records } = this.props
    let { currentMedia } = this.state

    if (currentMedia + 1 <= records.length) {
      this.setState(state => {
        return {
          currentMedia: currentMedia + 1
        };
      });

      this.play()
    }

    if (currentMedia + 1 === records.length) {
      this.setState({ playing: false, currentMedia: 0 })
    }
  }

  play = () => {
    const { currentMedia } = this.state

    this.setState({ playing: true, elems: { [currentMedia]: 'play' } })
  }

  pause = () => {
    const { currentMedia } = this.state

    this.setState({ playing: false, elems: { [currentMedia]: 'pause' } })
  }

  reset = () => {
    this.setState(state => {
      const currentMedia = 0

      return {
        currentMedia,
        playing: false,
        elems: { [currentMedia]: 'reset' }
      };
    });
  }

  getMediaElem = (url, id, status) => {
    if (url.blob) {
      url = URL.createObjectURL(url.blob)
    }

    const download = `${id}.ogg`
    return <span>
      <Audio controls={false} src={url} autoplay={false} status={status} volume="0.1" onEnded={() => this.next()} />
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
        this.play()
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

      return <li key={id} data-id={item}>{this.getMediaElem(item, id, status)}</li>
    })

    return (
      <div>
        {records ? <div>
          <button onClick={this.play} disabled={playing}>Воспроизведение</button>
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
