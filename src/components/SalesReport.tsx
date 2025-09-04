import { forwardRef, useMemo } from 'react'
import Barcode from 'react-barcode'
import dayjs from 'dayjs'

export type ReportLine = {
  code: string
  title: string
  qty: number
  price?: number
}

type Props = {
  dateStr: string
  items: ReportLine[]
  currency?: string
}

function currency(q: number | undefined, currency = 'MXN') {
  if (typeof q !== 'number') return ''
  return q.toLocaleString('es-MX', { style: 'currency', currency })
}

const SalesReport = forwardRef<HTMLDivElement, Props>(function SalesReport(
  { dateStr, items, currency: cur = 'MXN' },
  ref
) {
  const hasPrices = items.some(i => typeof i.price === 'number')
  const totalQty = items.reduce((a, i) => a + i.qty, 0)
  const totalRevenue = hasPrices ? items.reduce((a, i) => a + (i.price || 0) * i.qty, 0) : 0

  // pequeño desglose por "pack" detectado por el título (BOLSA/LATA)
  const byPack = useMemo(() => {
    const acc: Record<string, { qty: number; revenue: number }> = {}
    for (const it of items) {
      const pack = it.title.includes('LATA') ? 'LATA' : 'BOLSA'
      acc[pack] ??= { qty: 0, revenue: 0 }
      acc[pack].qty += it.qty
      acc[pack].revenue += (it.price || 0) * it.qty
    }
    return acc
  }, [items])

  const reportId = `VENTAS-${dayjs().format('YYYYMMDD')}`

  return (
    <div ref={ref} className="print-root">
      <div className="print-area mx-auto w-full max-w-sm rounded-2xl bg-white p-4 text-slate-800 ring-1 ring-slate-200">
        <div className="text-center">
          <h2 className="font-display text-lg font-bold tracking-wide">Tienda Liverpool Polanco • Reporte</h2>
          <p className="text-xs text-slate-500">{dateStr}</p>
          <p className="mt-1 text-[11px] text-slate-600">ID: {reportId}</p>
        </div>

        <div className="my-3 h-px bg-slate-200" />

        {/* Resumen */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Total ítems</span>
            <span className="font-semibold tabular-nums">{totalQty}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Total ventas</span>
            <span className="font-bold tabular-nums">
              {hasPrices ? currency(totalRevenue, cur) : '—'}
            </span>
          </div>
        </div>

        <div className="mt-3 rounded-xl bg-slate-50 p-2">
          <p className="mb-1 text-xs font-semibold text-slate-600">Desglose por pack</p>
          {Object.entries(byPack).map(([pack, v]) => (
            <div key={pack} className="flex items-center justify-between text-sm">
              <span>{pack}</span>
              <span className="tabular-nums">
                {v.qty} {hasPrices ? `• ${currency(v.revenue, cur)}` : ''}
              </span>
            </div>
          ))}
        </div>

        <div className="my-3 h-px bg-slate-200" />

        {/* Líneas del día */}
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-600">Ventas del día</p>
          {items.map((it, idx) => (
            <div key={idx} className="grid grid-cols-[1fr_auto_auto] items-center gap-2 text-sm">
              <div className="min-w-0">
                <div className="truncate font-medium">{it.title}</div>
                <div className="text-[11px] text-slate-500">#{it.code}</div>
              </div>
              <div className="text-right tabular-nums">x{it.qty}</div>
              <div className="text-right tabular-nums">
                {hasPrices ? currency((it.price || 0) * it.qty, cur) : '—'}
              </div>
            </div>
          ))}
        </div>

        <div className="my-4 h-px bg-slate-200" />

        {/* Código de barras del reporte */}
        <div className="flex flex-col items-center gap-2">
          <Barcode value={reportId} format="CODE128" height={64} width={1} displayValue />
          <p className="text-[10px] text-slate-500">Impreso {dayjs().format('HH:mm')}</p>
        </div>
      </div>
    </div>
  )
})

export default SalesReport
