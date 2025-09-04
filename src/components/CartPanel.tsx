import QtyInput from './QtyInput'

export type CartLine = {
  code: string
  title: string
  qty: number
  price?: number
}

type Props = {
  cart: CartLine[]
  hasPrices: boolean
  total: number
  updateQty: (code: string, newQty: number) => void
  removeLine: (code: string) => void
  currency?: string // por defecto MXN
}

export default function CartPanel({
  cart,
  hasPrices,
  total,
  updateQty,
  removeLine,
  currency = 'MXN',
}: Props) {
  return (
    <div className="card p-4">
      <h2 className="mb-3 text-lg font-semibold text-slate-800">Carrito</h2>
      {cart.length === 0 ? (
        <p className="text-sm text-slate-500">Sin productos.</p>
      ) : (
        <div className="space-y-2">
          {cart.map(line => (
            <div key={line.code} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2 text-sm">
              <div className="min-w-0">
                <div className="truncate font-medium">{line.title}</div>
                <div className="text-[11px] text-slate-500">#{line.code}</div>
              </div>
              <div className="justify-self-end">
                <QtyInput value={line.qty} onChange={(v) => updateQty(line.code, v)} />
              </div>
              <div className="justify-self-end tabular-nums">
                {typeof line.price === 'number'
                  ? (line.price * line.qty).toLocaleString('es-GT', { style: 'currency', currency })
                  : '—'}
              </div>
              <button className="btn-ghost px-3 py-2 rounded-2xl" onClick={() => removeLine(line.code)}>
                Quitar
              </button>
            </div>
          ))}
          {hasPrices && (
            <div className="mt-3 flex items-center justify-between">
              <span className="font-semibold">Total</span>
              <span className="font-bold">
                {total.toLocaleString('es-GT', { style: 'currency', currency })}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
