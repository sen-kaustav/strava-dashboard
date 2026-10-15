import { useMemo, useState } from 'react';
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import MonthNav from '../components/MonthNav.jsx';
import Dot from '../components/Dot.jsx';
import { ArrowOut } from '../components/Icons.jsx';
import { stravaUrl } from '../lib/format.js';

const col = createColumnHelper();

export default function Activities({ month, acts, nav }) {
  const [sorting, setSorting] = useState([{ id: 'date', desc: true }]);

  const columns = useMemo(() => [
    col.accessor((a) => a.start.getTime(), { id: 'date', header: 'Date', cell: (i) => i.row.original.dateLabel, sortDescFirst: true }),
    col.accessor('type', { id: 'type', header: 'Type', cell: (i) => <span className="type-cell"><Dot type={i.getValue()} />{i.getValue()}</span>, sortDescFirst: false }),
    col.accessor('km', { id: 'dist', header: 'Dist', cell: (i) => i.row.original.dist, sortDescFirst: true, meta: { align: 'right' } }),
    col.accessor('sec', { id: 'time', header: 'Time', cell: (i) => i.row.original.time, sortDescFirst: true, meta: { align: 'right' } }),
    col.display({
      id: 'strava', enableSorting: false, header: () => <span className="sr-only">Open in Strava</span>,
      cell: (i) => {
        const a = i.row.original;
        return (
          <a className="strava-link" href={stravaUrl(a.id)} target="_blank" rel="noopener noreferrer" aria-label={`Open ${a.name} on ${a.dateLabel} in Strava`}>
            <span className="strava-btn"><ArrowOut /></span>
          </a>
        );
      }
    })
  ], []);

  const table = useReactTable({
    data: acts, columns, state: { sorting }, onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(), enableSortingRemoval: false
  });

  return (
    <>
      <header className="page-head">
        <MonthNav {...nav} />
        <div className="small head-line">{acts.length} {acts.length === 1 ? 'activity' : 'activities'} · {month.dateLine}</div>
        <h1>{month.name}</h1>
      </header>

      <div className="table" role="table" aria-label={`${month.name} activities`}>
        {table.getHeaderGroups().map((hg) => (
          <div className="trow thead" role="row" key={hg.id}>
            {hg.headers.map((h) => {
              const dir = h.column.getIsSorted();
              const align = h.column.columnDef.meta?.align;
              return (
                <div role="columnheader" key={h.id} style={{ textAlign: align }} aria-sort={dir === 'asc' ? 'ascending' : dir === 'desc' ? 'descending' : h.column.getCanSort() ? 'none' : undefined}>
                  {h.column.getCanSort() ? (
                    <button type="button" className={dir ? 'sort on' : 'sort'} onClick={h.column.getToggleSortingHandler()}>
                      {flexRender(h.column.columnDef.header, h.getContext())}{dir ? (dir === 'asc' ? ' ▲' : ' ▼') : ''}
                    </button>
                  ) : flexRender(h.column.columnDef.header, h.getContext())}
                </div>
              );
            })}
          </div>
        ))}
        {table.getRowModel().rows.map((row) => (
          <div className="trow" role="row" key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <div role="cell" key={cell.id} style={{ textAlign: cell.column.columnDef.meta?.align }}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</div>
            ))}
          </div>
        ))}
        {acts.length === 0 && <div className="empty">No activities this month.</div>}
      </div>
      <p className="small hint">Tap a heading to sort. The arrow button opens the activity in the Strava app.</p>
    </>
  );
}
