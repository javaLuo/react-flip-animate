import React from 'react';

/**
 * props
 * @param tag 自定义生成的容器标签
 * @param speed 动画速度 默认300
 * @param transClass 自定义transition效果的class
 * @param className 容器className
 * **/
export default class Flip extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      Tag: this.props.tag || 'div',
    };
    this.f = Object.create(null);
    this.ref = React.createRef();
    this.prevChildren = [];
  }

  componentDidMount() {
    this.first(this.ref.current ? Array.from(this.ref.current.children) : []);
  }

  // children被改变，但DOM还未渲染时触发
  getSnapshotBeforeUpdate(prevProps, prevState) {
    const type = this.isValueChanged(prevProps.children, this.props.children);
    if (type) {
      this.first(this.ref.current ? Array.from(this.ref.current.children) : []);
    }
    return type;
  }

  componentDidUpdate(prevProps, prevState, type) {
    if (type) {
      this.last(this.ref.current, type);
      this.play(this.ref.current ? Array.from(this.ref.current.children) : []);
    }
  }

  // 判断是否有改变
  isValueChanged(a, b) {
    if (a.length < b.length) {
      return 2;
    } else if (a.length > b.length) {
      return 3;
    }
    for (let i = 0; i < a.length; i++) {
      if (a[i].key !== b[i].key) {
        return 1;
      }
    }
    return false;
  }

  // 记录起始位置
  first = doms => {
    const data = Object.create(null);
    doms.forEach((item, index) => {
      let no = item.getAttribute('data-flip-no');
      if (!no) {
        no = `${new Date().getTime()}_${index}`;
        item.setAttribute('data-flip-no', no);
      }

      if (!item.getAttribute('data-remove')) {
        data[no] = item.getBoundingClientRect();
        item.style.transform = '';
        item.style.webkitTransform = '';
      }
    });
    this.f = data;
    this.prevChildren = doms;
  };

  // 记录结束位置并反转
  last = (current, type) => {
    const doms = current ? Array.from(current.children) : [];

    doms.forEach((item, index) => {
      if (!item.getAttribute('data-remove')) {
        item.style.transitionDuration = 0;
        item.style.webkitTransitionDuration = 0;
        let no = item.getAttribute('data-flip-no');
        const l = item.getBoundingClientRect();

        if (!no) {
          // 有新增
          no = `${new Date().getTime()}_${index}`;
          item.setAttribute('data-flip-no', no);
          if (this.props.transClass) {
            item.classList.add(`${this.props.transClass}-enter`);
            item.style = '';
          } else {
            item.style.transform = `translate(0, 20px)`;
            item.style.webkitTransform = `translate(0, 20px)`;
            item.style.opacity = 0;
          }
        } else if (this.f[no]) {
          item.style.transform = `translate(${this.f[no].x - l.x}px, ${this.f[no].y - l.y}px)`;
          item.style.webkitTransform = `translate(${this.f[no].x - l.x}px, ${this.f[no].y - l.y}px)`;
          delete this.f[no];
        }
      }
    });
    if (type === 3) {
      const keys = Object.keys(this.f);

      for (let i = 0; i < keys.length; i++) {
        const willRemove = this.prevChildren.findIndex(item => {
          return item.getAttribute('data-flip-no') === keys[i];
        });
        if (willRemove >= 0) {
          const el = this.prevChildren[willRemove];
          current.insertBefore(el, doms[willRemove]);
          if (this.props.transClass) {
            el.style = '';
          }
          el.style.position = 'absolute';
          el.setAttribute('data-remove', true);
          el.addEventListener(
            'transitionend',
            (el.end = function cb() {
              el.removeEventListener('transitionend', cb);
              el.end = null;

              current.removeChild(el);
            }),
            false,
          );
        }
      }
    }
  };

  // // 播放
  play = doms => {
    setTimeout(() => {
      doms.forEach(item => {
        item.style.transition = `opacity ${this.props.speed || 300}ms, transform ${this.props.speed || 300}ms`;
        item.style.webkitTransition = `opacity ${this.props.speed}ms, -webkit-transform ${this.props.speed || 300}ms`;
      });
      setTimeout(() =>
        doms.forEach(item => {
          if (item.getAttribute('data-remove')) {
            if (this.props.transClass) {
              item.classList.add(`${this.props.transClass}-leave`);
            } else {
              item.style.transform = 'translate(0,20px)';
              item.style.webkitTransform = 'translate(0,20px)';
              item.style.opacity = 0;
            }
          } else {
            if (this.props.transClass) {
              item.classList.remove(`${this.props.transClass}-enter`);
            }
            item.style.transform = '';
            item.style.webkitTransform = '';
            item.style.opacity = 1;
          }
        }),
      );
    }, 16); // 给了个16ms，0的话效果有点奇怪，最后1个元素的动画总是会被浏览器自动省略掉
  };

  onPlay = () => {
    this.play(this.ref.current ? Array.from(this.ref.current.children) : []);
  };

  render() {
    return (
      <>
        <this.state.Tag className={this.props.className || null} ref={this.ref}>
          {this.props.children}
        </this.state.Tag>
      </>
    );
  }
}
