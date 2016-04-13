import React, { Component } from 'react'
import AppSDK from 'dbfm-app-sdk'

import './index.scss'
import '../../assets/font/iconfont.scss'

import SongTitle from '../title'
import Progress from '../progress'
import Controls from '../controls'
import Cover from '../cover'

const sdk = new AppSDK()

let channelId = 123

class Song extends Component {

  constructor (props) {
    super(props)
    this.songs = []
    this.index = 0
    this.state = {
      singers: [],
      title: '',
      album: '',
      time: '',
      percent: '0%',
      url: '',
      picture: '',
      like: false,
      sid: ''
    }
  }

  updateState (nextState) {
    let newState = Object.assign({}, this.state, nextState)
    this.setState(newState)
  }

  updateSong () {
    sdk.songs({
      channel_id: channelId
    }, (err, songs) => {
      if (err) return console.error(err)

      this.updateState(songs[0])

      this.songs = songs
      this.index = 0

      console.log(songs)
    })
  }

  componentDidMount () {
    this.updateSong()
    this.listenUpdate()
  }

  pause () {
    this.refs.play.pause()
  }

  play () {
    this.refs.play.play()
  }

  handlePlay (pause) {
    pause ? this.pause() : this.play()
  }

  // next
  skip () {
    this.index += 1
    this.updateState(this.songs[this.index])
    this.updateSongs()
  }

  star () {
    let method = this.state.like ? 'unstar' : 'star'
    this.operate(method, (songs) => {
      this.updateState({
        like: !this.state.like
      })
    })
  }

  operate (method, cb) {
    sdk[method]({
      channel_id: channelId,
      sid: this.state.sid
    }, (err, songs) => {
      if (err) return console.error(err)
      cb && cb(songs)
    })
  }

  updateSongs () {
    if (this.songs.length <= this.index + 1) {
      this.operate('songs', (songs) => {
        this.songs = this.songs.concat(songs)
      })
    }
  }

  listenUpdate () {
    // 监听时间更新
    this.refs.play.addEventListener('timeupdate', () => {
      let pt = this.refs.play.currentTime
      let dt = this.refs.play.duration

      this.updateState({
        percent: pt / dt * 100 + '%',
        time: this.formatTime(pt)
      })
    })

    // 监听播放结束
    this.refs.play.addEventListener('ended', () => {
      this.skip()
    })
  }

  // 格式化时间
  formatTime (n) {
    var m = Math.floor(n / 60)
    var s = Math.ceil(n % 60)
    m = m < 10 ? '0' + m : m
    s = s < 10 ? '0' + s : s
    return m + ':' + s
  }

  render () {
    return (
      <div className="fullplayer">
        <div className="playing-info">
          <audio ref='play' src={this.state.url} preload autoPlay />

          <SongTitle {...this.state}
            onPlay={(pause) => { this.handlePlay(pause) }}
          />

          <Progress {...this.state} />

          <div className="below-progress"></div>

          <Controls {...this.state}
            onSkip={() => { this.skip() }}
            onStar={() => { this.star() }}
          />

        </div>
        <Cover {...this.state} />
      </div>
    )
  }
}

export default Song