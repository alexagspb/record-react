import React, { Component } from 'react';

class Audio extends Component {

    shouldComponentUpdate() {
        return false
    }

    componentWillReceiveProps(newProps) {
        const { status } = newProps

        switch (status) {
            case 'play':
                this.elem.play()
                break;

            case 'pause':
                this.elem.pause()
                break;

            case 'reset':
                this.elem.load()
                break;

            default:
                break;
        }
    }

    componentDidMount() {
        const { onEnded } = this.props
        this.elem.onended = () => {
            onEnded()
        }
    }

    render() {
        const { src, controls, autoplay, volume } = this.props

        return <audio src={src}
            controls={controls}
            autoPlay={autoplay}
            volume={volume}
            ref={(node) => { this.elem = node; }}></audio>
    }
}

export default Audio