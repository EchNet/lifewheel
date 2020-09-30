import * as React from "react"
import ReactDOM from "react-dom"
import { HashRouter as Router, Link, Switch, Redirect, Route } from "react-router-dom"
import "./launch.css"

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showDormantView: true,
      showActiveView: false,
      dormantViewOpacity: 1,
      activeViewContentVisible: false,
      activeViewFill: false,
      activeViewHeight: 0
    }
  }
  componentDidMount() {
    this.initialHeight = this.refs.container.clientHeight;
    console.log('initialHeight', this.initialHeight);
  }
  render() {
    return (
      <div ref="container" className="lw-container">
        { this.state.showDormantView && (
          <LaunchView opacity={this.state.dormantViewOpacity} 
              onClick={() => this.launch()} />
        )}
        { this.state.showActiveView && (
          <ActiveView fill={this.state.activeViewFill}
              contentVisible={this.state.activeViewContentVisible}
              height={this.state.activeViewHeight} />
        )}
      </div>
    )
  }
  launch() {
    this.setState({ dormantViewOpacity: 0 })
    setTimeout(() => this.goActive(), 1000)
  }
  goActive() {
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
    const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
    let activeViewFill = Math.max(vw, vh) <= 600;  // Small screen.

    this.setState({
      showDormantView: false,
      showActiveView: true,
      activeViewContentVisible: activeViewFill,
      activeViewFill,
      activeViewHeight: this.initialHeight
    })

    if (!activeViewFill) {
      setTimeout(() => this.continueTransition(), 100)
    }
  }
  continueTransition() {
    const preferredHeight = Math.floor(this.refs.container.clientWidth * 0.5)
    this.setState({
      activeViewHeight: preferredHeight
    })
    setTimeout(() => this.completeTransition(), 1000)
  }
  completeTransition() {
    this.setState({
      activeViewContentVisible: true
    })
  }
}

class LaunchView extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }
  render() {
    if (this.state.redirect) {
      return <Redirect to="/lw/"/>
    }
    return (
      <div className="lw-launch" style={{ opacity: this.props.opacity }}
          onClick={this.props.onClick}>
        <div className="lw-headline-container">
          Feeling <b>stuck?</b>
        </div>
        <div className="lw-link-container">
          <a>Click here.</a>
        </div>
      </div>
    )
  }
}

class ActiveView extends React.Component {
  render() {
    return (
      <div ref="container" className="lw-ActiveView">
        { this.props.contentVisible && "This is the active view." }
      </div>
    )
  }
}

ReactDOM.render(<App/>, document.getElementById("lifewheel-stage"))

if (module.hot) {
  module.hot.accept()
}
