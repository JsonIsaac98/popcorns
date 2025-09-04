import { forwardRef } from 'react'
import Barcode from 'react-barcode'
import dayjs from 'dayjs'

export type TicketLine = {
  code: string
  title: string
  qty: number
  price?: number
}

type Props = {
  orderId: string
  items: TicketLine[]
}

function currency(q: number | undefined) {
  if (typeof q !== 'number') return ''
  // return q.toLocaleString('es-GT', { style: 'currency', currency: 'GTQ' })
  return q.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })
}

function getBarcode(code: string) {
  const raw = code.trim()
  if (/^\d{12,13}$/.test(raw)) return { format: 'EAN13' as const, value: raw.slice(0, 13) }
  return { format: 'CODE128' as const, value: raw || 'ORDEN' }
}

const Ticket = forwardRef<HTMLDivElement, Props>(function Ticket(
  { orderId, items },
  ref
) {
  const { format, value } = getBarcode(orderId)
  const hasPrices = items.some(i => typeof i.price === 'number')
  const subtotal = hasPrices
    ? items.reduce((acc, it) => acc + (it.price || 0) * it.qty, 0)
    : undefined

  return (
    <div ref={ref} className="print-root">
      <div className="print-area mx-auto w-full max-w-sm rounded-2xl bg-white p-4 text-slate-800 ring-1 ring-slate-200">
        {/* Encabezado */}
        <div className="text-center">
          <h2 className="font-display text-lg font-bold tracking-wide">
            Tienda Liverpool Polanco • Punto de Venta
          </h2>
          <p className="text-xs text-slate-500">{dayjs().format('DD/MM/YYYY HH:mm')}</p>
          <p className="mt-1 text-[11px] text-slate-600">Orden: {orderId}</p>
        </div>

        <div className="my-3 h-px bg-slate-200" />

        {/* Líneas */}
        <div className="space-y-1">
          {items.map((it, idx) => (
            <div key={idx} className="grid grid-cols-[1fr_auto_auto] items-center gap-2 text-sm">
              <div className="min-w-0">
                <div className="truncate font-medium">{it.title}</div>
                <div className="text-[11px] text-slate-500">#{it.code}</div>
              </div>
              <div className="text-right tabular-nums">x{it.qty}</div>
              {hasPrices ? (
                <div className="text-right tabular-nums">{currency((it.price || 0) * it.qty)}</div>
              ) : (
                <div />
              )}
            </div>
          ))}
        </div>

        {hasPrices && (
          <>
            <div className="my-3 h-px bg-slate-200" />
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold">Total</span>
              <span className="font-bold">{currency(subtotal)}</span>
            </div>
          </>
        )}

        <div className="my-4 h-px bg-slate-200" />

        {/* Código de barras de la orden */}
        <div className="flex flex-col items-center gap-2">
          <Barcode value={value} format={format} height={70} width={1.5} displayValue />
          <p className="text-[10px] text-slate-500">Gracias por su compra</p>
        </div>
      </div>
    </div>
  )
})

export default Ticket
