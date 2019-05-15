import React, { Component } from 'react';
import Sortable from 'react-sortablejs';
class PlayList extends Component {
  constructor(props) {
    super()
    this.Plays = []
  }

  state = {
    currentMedia: 0,
    records: [],
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
    this.Plays.forEach((item) => {
      item.load()
    })

    this.setState(state => {
      const currentMedia = 0

      return {
        currentMedia,
      };
    });
  }

  getMediaElem = (url, id, index) => {
    if (url.blob) {
      url = URL.createObjectURL(url.blob)
    }

    const download = `${id}.ogg`
    return <span>
      <audio controls src={url} ref={(elem) => {
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
      this.playAll()
    }
  }

  render() {
    const { onReset } = this.props
    const { records } = this.state

    const listItems = records.map((item, index) => {
      if (item.blob) {
        item = URL.createObjectURL(item.blob)
      }

      const id = item.slice(-8)

      return <li key={id} data-id={item}>{this.getMediaElem(item, id, index)}</li>
    })

    return (
      <div>
        {records && records.length > 1 ? <div>
          <button onClick={this.playAll}>Воспроизвести все</button>
          <button onClick={this.reset}>Начать сначала</button>
          <button onClick={this.pause}>Пауза</button>
        </div> : null}
        <button onClick={onReset}>Вернуться назад</button>
        <Sortable
          tag="ul"
          onChange={(order) => {
            this.setState({ records: order });
          }}
        >
          {listItems}
        </Sortable>

      </div>
    )
  }

  // render() {
  //   const { records, onReset } = this.props

  //   return (
  //     <div>
  //       {records && records.length > 1 ? <div>
  //         <button onClick={this.playAll}>Воспроизвести все</button>
  //         <button onClick={this.reset}>Начать сначала</button>
  //         <button onClick={this.pause}>Пауза</button>
  //       </div> : null}
  //       <button onClick={onReset}>Вернуться назад</button>
  //       <ul>
  //         {records && records.map((item, index) => {
  //           return <li key={index}>{this.getMediaElem(item, index)}</li>
  //         })}
  //       </ul>
  //     </div>
  //   )
  // }

}

export default PlayList
