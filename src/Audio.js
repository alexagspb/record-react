import React, { Component } from 'react';

class Audio extends Component {

    shouldComponentUpdate() {
        return false
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