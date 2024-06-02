import { useVirtualizer } from '@tanstack/react-virtual'
import { useRef } from 'react';
import './Section.css';

// const columns = new Array(10000)
//   .fill(true)
//   .map(() => 0.3 + Math.random() * 3.7
//     // const width = 100 + Math.round(Math.random() * 500);
//     // const aspectRatio = 0.3 + Math.random() * 3.7;
//     // const height = width * aspectRatio;
//     // return [width, height] as const;
//   );

declare global {
  interface Window {
    debuglogs: Array<any>;
  }
}
window.debuglogs = [];

export const Section = ({ columns }: { columns: Array<{ src: string, aspectRatio: number }> }) => {
  const parentRef = useRef<HTMLDivElement>()

  const mat = [[], []] as [number[], number[]];
  const backlog = [] as number[];
  const items = [] as Array<{ index: number, offset: number, width: number, height: number, filler?: boolean }>;
  const getNextPosition = () => {
    const lane = mat[0].length <= mat[1].length ? 0 : 1; // 2 lanes only
    const laneIx = mat[lane].length;
    let maxLanes = 1;
    while (mat[lane + maxLanes] && !mat[lane + maxLanes][laneIx]) {
      maxLanes += 1;
    }
    return [lane, laneIx, maxLanes] as const;
  }
  const positionItem = (ix: number) => {
    const [lane, laneIx, maxLanes] = getNextPosition();
    const { aspectRatio } = columns[ix];
    window.debuglogs[ix] = Object.assign(window.debuglogs[ix] ?? {}, { lane, laneIx, maxLanes, aspectRatio });
    if (aspectRatio < 3 / 5) {
      if (lane === 0 && maxLanes === 2) { // 2 lanes only
        mat[0][laneIx] = ix;
        mat[1][laneIx] = ix;
        items.push({ index: ix, offset: 0, width: 1, height: 2 });
        items.push({ index: ix, offset: 1, width: 1, height: 1, filler: true });
        Object.assign(window.debuglogs[ix], items[items.length - 1]);
      } else {
        window.debuglogs[ix].backlog ??= [];
        const { backlog, ...values } = window.debuglogs[ix];
        window.debuglogs[ix].backlog.push(values);
        backlog.push(ix);
      }
      return 1;
    }
    
    if (aspectRatio < 1) {
      if (lane === 0 && maxLanes === 2) {
        const { aspectRatio: nextAspectRatio } = columns[ix + 1] ?? {};
        if (!nextAspectRatio) {
          mat[0][laneIx] = ix;
          mat[1][laneIx] = ix;
          items.push({ index: ix, offset: 0, width: 1, height: 1 / aspectRatio });
          items.push({ index: ix, offset: 1, width: 1, height: 1, filler: true });
          Object.assign(window.debuglogs[ix], items[items.length - 1]);
          return 1;
        }
        if (nextAspectRatio > 1.25 && nextAspectRatio < 1.75) {
          mat[0][laneIx] = ix;
          mat[1][laneIx] = ix + 1;
          items.push({ index: ix, offset: 0, width: 1, height: 4 / 3 });
          Object.assign(window.debuglogs[ix], items[items.length - 1]);
          items.push({ index: ix + 1, offset: 4 / 3, width: 1, height: 2 / 3 });
          window.debuglogs[ix + 1] = items[items.length - 1];
          return 2;
        }
      }
      mat[lane][laneIx] = ix;
      items.push({ index: ix, offset: lane, width: 1, height: 1 });
      Object.assign(window.debuglogs[ix], items[items.length - 1]);
      return 1;
    }
    if (aspectRatio < 1.25) {
      mat[lane][laneIx] = ix;
      items.push({ index: ix, offset: lane, width: 1, height: 1 });
      Object.assign(window.debuglogs[ix], items[items.length - 1]);
      return 1;
    }
    if (aspectRatio < 1.75) {
      const { aspectRatio: nextAspectRatio } = columns[ix + 1] ?? {};
      if (!nextAspectRatio) {
        mat[0][laneIx] = ix;
        items.push({ index: ix, offset: 0, width: 1.5, height: 1 });
        Object.assign(window.debuglogs[ix], items[items.length - 1]);
        return 1;
      }
      if (lane === 0 && maxLanes === 2 && nextAspectRatio < 1) {
        mat[0][laneIx] = ix;
        mat[1][laneIx] = ix + 1;
        items.push({ index: ix, offset: 0, width: 1, height: 2 / 3 });
        Object.assign(window.debuglogs[ix], items[items.length - 1]);
        items.push({ index: ix + 1, offset: 2 / 3, width: 1, height: 4 / 3 });
        window.debuglogs[ix + 1] = items[items.length - 1];
        return 2;
      }
      if (aspectRatio < 1.5) {
        mat[lane][laneIx] = ix;
        items.push({ index: ix, offset: lane, width: 1, height: 1 });
        Object.assign(window.debuglogs[ix], items[items.length - 1]);
        return 1;
      } else {
        mat[lane][laneIx] = ix;
        mat[lane][laneIx + 1] = ix;
        items.push({ index: ix, offset: lane, width: 2, height: 1 });
        Object.assign(window.debuglogs[ix], items[items.length - 1]);
        return 1;
      }
    }
    if (aspectRatio < 2.5) {
      mat[lane][laneIx] = ix;
      mat[lane][laneIx + 1] = ix;
      items.push({ index: ix, offset: lane, width: 2, height: 1 });
      Object.assign(window.debuglogs[ix], items[items.length - 1]);
      return 1;
    }
    mat[lane][laneIx] = ix;
    mat[lane][laneIx + 1] = ix;
    mat[lane][laneIx + 2] = ix;
    items.push({ index: ix, offset: lane, width: 3, height: 1 });
    Object.assign(window.debuglogs[ix], items[items.length - 1]);
    return 1;
  };
  let ix = 0;
  while (ix < columns.length) { // TODO: exhaust backlog
    /* 2 lanes only */
    while (getNextPosition()[2] === 2 && backlog.length > 0) {
      const backlogItem = backlog.shift();
      positionItem(backlogItem!);
    }
    ix += positionItem(ix);
  }

  const columnVirtualizer = useVirtualizer({
    horizontal: true,
    count: items.length,
    getScrollElement: () => parentRef.current!,
    estimateSize: (i) => items[i].width * (617 + 12) / 2,
    overscan: 5,
    lanes: 2,
  })

  return (
    <div className="section">
      <div ref={parentRef as React.LegacyRef<HTMLDivElement>} className="grid">
      <div
          style={{
            width: `${columnVirtualizer.getTotalSize()}px`,
            height: '100%',
            position: 'relative',
          }}
        >
          {columnVirtualizer.getVirtualItems().map((virtualColumn) => (
            <div
              key={virtualColumn.index}
              className={items[virtualColumn.index].filler ? 'filler' : 'item'}
              style={{
                position: 'absolute',
                top: `${items[virtualColumn.index].offset * 50}%`,
                left: 0,
                height: `${items[virtualColumn.index].height * 50}%`,
                width: `${items[virtualColumn.index].width * (617 + 12) / 2}px`,
                transform: `translateX(${virtualColumn.start}px)`,
              }}
            >
              {!items[virtualColumn.index].filler && <>
                <img src={columns[items[virtualColumn.index].index].src} />
                <span>Column {items[virtualColumn.index].index}</span>
              </>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}