import React from 'react';
import Flip from '../dist/main.js';
import ReactDom from 'react-dom';
import './index.less';
class Test extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [1, 2, 3],
      count: 4,
    };
  }

  onSort() {
    this.state.data.sort(() => {
      return Math.random() > 0.5 ? 1 : -1;
    });
    this.setState({
      data: [...this.state.data],
    });
  }

  onAdd() {
    const d = [...this.state.data];
    const i = this.random(0, d.length);
    this.setState({
      data: d.slice(0, i).concat(this.state.count, d.slice(i, d.length)),
      count: this.state.count + 1,
    });
  }

  onSub() {
    const d = [...this.state.data];
    const i = this.random(0, d.length);
    d.splice(i, 1);
    this.setState({
      data: [...d],
    });
  }

  random(min, max) {
    return Math.floor(Math.random() * (max + min) - min);
  }

  render() {
    return (
      <div>
        <div className="box" style={{ width: '500px' }}>
          <Flip tag="ul" className="flip-box" transClass="trans" speed="6000">
            {(() => {
              return this.state.data.map(item => <li key={item}>{item}</li>);
            })()}
          </Flip>
        </div>
        <hr />
        <button onClick={() => this.onAdd()}>增加</button>
        <button onClick={() => this.onSub()}>减少</button>
        <button onClick={() => this.onSort()}>随机排序</button>
      </div>
    );
  }
}

ReactDom.render(<Test />, document.getElementById('root'));
