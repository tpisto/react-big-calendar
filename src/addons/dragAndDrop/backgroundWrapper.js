import React from 'react'
import { DropTarget } from 'react-dnd'
import cn from 'classnames';

import dates from '../../utils/dates';
import BigCalendar from '../../index'

export function getEventTimes({ start, end }, dropDate, type) {
  // Calculate duration between original start and end dates
  const duration = dates.diff(start, end)

  // If the event is dropped in a "Day" cell, preserve an event's start time by extracting the hours and minutes off
  // the original start date and add it to newDate.value
  const nextStart = type === 'dateWrapper'
    ? dates.merge(dropDate, start) : dropDate

  const nextEnd = dates.add(nextStart, duration, 'milliseconds')

  return {
    start: nextStart,
    end: nextEnd
  }
}


class DraggableBackgroundWrapper extends React.Component {
  // constructor(...args) {
  //   super(...args);
  //   this.state = { isOver: false };
  // }
  //
  // componentWillMount() {
  //   let monitor = this.context.dragDropManager.getMonitor()
  //
  //   this.monitor = monitor
  //
  //   this.unsubscribeToStateChange = monitor
  //     .subscribeToStateChange(this.handleStateChange)
  //
  //   this.unsubscribeToOffsetChange = monitor
  //     .subscribeToOffsetChange(this.handleOffsetChange)
  // }
  //
  // componentWillUnmount() {
  //   this.monitor = null
  //   this.unsubscribeToStateChange()
  //   this.unsubscribeToOffsetChange()
  // }
  //
  // handleStateChange = () => {
  //   const event = this.monitor.getItem();
  //   if (!event && this.state.isOver) {
  //     this.setState({ isOver: false });
  //   }
  // }
  //
  // handleOffsetChange = () => {
  //   const { value } = this.props;
  //   const { start, end } = this.monitor.getItem();
  //
  //   const isOver = dates.inRange(value, start, end, 'minute');
  //   if (this.state.isOver !== isOver) {
  //     this.setState({ isOver });
  //   }
  // };

  render() {
    const { connectDropTarget, children, type, isOver } = this.props;
    const BackgroundWrapper = BigCalendar.components[type];

    let resultingChildren = children
    if (isOver)
      resultingChildren = React.cloneElement(children, {
        className: cn(children.props.className, 'rbc-dnd-over')
      })

    return (
      <BackgroundWrapper>
        {connectDropTarget(resultingChildren)}
      </BackgroundWrapper>
    );
  }
}

DraggableBackgroundWrapper.contextTypes = {
  onEventDrop: React.PropTypes.func,
  dragDropManager: React.PropTypes.object
}

function createWrapper(type) {
  function collectTarget(connect, monitor) {
    return {
      type,
      connectDropTarget: connect.dropTarget(),
      isOver: monitor.isOver(),
    };
  }


  const dropTarget = {
    drop(_, monitor, { props, context }) {
      const event = monitor.getItem();
      const { value } = props
      const { onEventDrop } = context

      onEventDrop({
        event,
        ...getEventTimes(event, value, type)
      })
    }
  };

  return DropTarget(['event'], dropTarget, collectTarget)(DraggableBackgroundWrapper);
}

export const DateCellWrapper = createWrapper('dateCellWrapper');
export const DayWrapper = createWrapper('dayWrapper');
