import { forwardRef } from 'react'
import Barcode from 'react-barcode'
import dayjs from 'dayjs'

type Props = {
  skuCode?: string
  title?: string
  qty: number
  price?: number
}

function currency(q: number | undefined) {
  if (typeof q !== 'number') return ''
  return q.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })
  // return q.toLocaleString('es-GT', { style: 'currency', currency: 'GTQ' })

}

function getBarcode(code?: string) {
  const raw = (code ?? '').trim()
  if (/^\d{12,13}$/.test(raw)) {
    return { format: 'EAN13' as const, value: raw.slice(0, 13) }
  }
  return { format: 'CODE128' as const, value: raw || 'PALOMITAS' }
}

const Ticket = forwardRef<HTMLDivElement, Props>(function Ticket(
  { skuCode, title, qty, price },
  ref
) {
  const total = typeof price === 'number' ? price * qty : undefined
  const { format, value } = getBarcode(skuCode)

  return (
    <div ref={ref} className="print-root">
      {/* TODO IMPRESO VA DENTRO DE print-area */}
      <div className="print-area mx-auto w-full max-w-sm bg-white p-4 text-slate-800 ring-1 ring-slate-200">
        {/* Encabezado */}
        <div className="text-center">
          <h2 className="font-display text-lg font-bold tracking-wide">
            POP CORN • Punto de Venta
          </h2>
          <p className="text-xs text-slate-500">
            {dayjs().format('DD/MM/YYYY HH:mm')}
          </p>
        </div>

        <div className="my-4 h-px bg-slate-200" />

        {/* Detalle */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Artículo</span>
            <span className="text-right">{title || '—'}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Cantidad</span>
            <span>{qty}</span>
          </div>
          {typeof price === 'number' && (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Precio</span>
                <span>{currency(price)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Total</span>
                <span className="font-semibold">{currency(total)}</span>
              </div>
            </>
          )}
        </div>

        <div className="my-4 h-px bg-slate-200" />

        {/* Código de barras */}
        <div className="flex flex-col items-center gap-2">
          <Barcode
            value={value}
            format={format}
            height={70}
            width={2}
            displayValue
          />
          <p className="text-[10px] text-slate-500">Gracias por su compra</p>
        </div>
      </div>
    </div>
  )
})

export default Ticket
