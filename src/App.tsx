import { useMemo, useRef, useState, useEffect } from 'react'
import { PARSED, type ParsedSKU } from './data/skus'
import Chip from './components/Chip'
import ProductCard from './components/ProductCard'
import QtyInput from './components/QtyInput'
import Ticket, { type TicketLine } from './components/Ticket'
import { useReactToPrint } from 'react-to-print'

type Pack = 'TODOS' | 'BOLSA' | 'LATA' | 'COMBINACIÓN'
type Size = 'TODOS' | 'CH' | 'GDE' | 'CHICA' | 'GRANDE' | '2X1'

let ORDER_SEQ = 1
const newOrderId = () => {
  const ts = new Date()
    .toISOString()
    .replace(/[-:T.Z]/g, '')
    .slice(0, 14) // yyyyMMddHHmmss
  return `${ts}${String(ORDER_SEQ++).padStart(3, '0')}`
}

export default function App() {
  const [query, setQuery] = useState('')
  const [pack, setPack] = useState<Pack>('TODOS')
  const [size, setSize] = useState<Size>('TODOS')
  const [selected, setSelected] = useState<ParsedSKU | null>(null)
  const [qty, setQty] = useState(1)

  // Carrito
  const [cart, setCart] = useState<TicketLine[]>([])
  const [orderId, setOrderId] = useState(newOrderId())

  const list = useMemo(() => {
    const raw = query.trim()
    const text = raw.toUpperCase()
    const digits = raw.replace(/\D/g, '')

    const exact = digits ? PARSED.find(p => p.code === digits) : undefined
    if (exact) return [exact]

    const filtered = PARSED.filter(p => {
      const inText =
        !text ||
        p.label.includes(text) ||
        p.flavor.includes(text) ||
        (!!digits && p.code.includes(digits))
      const okPack = pack === 'TODOS' || p.pack === pack
      const okSize = size === 'TODOS' || p.size === size
      return inText && okPack && okSize
    })

    return filtered.sort((a, b) => a.label.localeCompare(b.label, 'es'))
  }, [query, pack, size])

  const ticketRef = useRef<HTMLDivElement>(null)
  const handlePrint = useReactToPrint({
    contentRef: ticketRef,
    documentTitle: `ticket-${orderId}`,
  })

  // Enfocar el input al montar (opcional)
  const searchInputRef = useRef<HTMLInputElement>(null)
  useEffect(() => { searchInputRef.current?.focus() }, [])

  // Agregar al carrito (merge por code)
  const addToCart = () => {
    if (!selected) return
    setCart(prev => {
      const idx = prev.findIndex(l => l.code === selected.code)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = { ...next[idx], qty: next[idx].qty + qty }
        return next
      }
      return [
        ...prev,
        {
          code: selected.code,
          title: selected.label,
          qty,
          price: selected.price, // si tus SKUs tienen price
        },
      ]
    })
    // reset de cantidad para siguiente selección
    setQty(1)
  }

  const updateQty = (code: string, newQty: number) => {
    setCart(prev => prev.map(l => (l.code === code ? { ...l, qty: Math.max(1, newQty) } : l)))
  }

  const removeLine = (code: string) => {
    setCart(prev => prev.filter(l => l.code !== code))
  }

  const clearCart = () => {
    setCart([])
    setOrderId(newOrderId())
  }

  const hasPrices = cart.some(i => typeof i.price === 'number')
  const total = hasPrices ? cart.reduce((acc, it) => acc + (it.price || 0) * it.qty, 0) : 0

  return (
    <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 gap-6 p-6 md:grid-cols-[1.6fr_.9fr]">
      {/* Header */}
      <header className="col-span-full flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-800">🍿 Popcorn</h1>
        <div className="no-print flex items-center gap-2">
          <button className="btn-ghost px-3 py-2 rounded-2xl" onClick={clearCart}>Nueva orden</button>
          <button className="btn" onClick={handlePrint} disabled={cart.length === 0}>
            Imprimir ticket
          </button>
        </div>
      </header>

      {/* Left: buscador y productos */}
      <section className="no-print space-y-4">
        <div className="card p-4">
          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={searchInputRef}
              className="flex-1 rounded-2xl border border-slate-300 px-4 py-2 outline-none ring-brand-600 focus:ring-2"
              placeholder="Escanea código o busca por sabor…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const digits = query.replace(/\D/g, '')
                  const found = PARSED.find(p => p.code === digits)
                  if (found) setSelected(found)
                }
              }}
            />
            <div className="flex items-center gap-2">
              {(['TODOS','BOLSA','LATA','COMBINACIÓN'] as Pack[]).map(p => (
                <Chip key={p} label={p} active={pack === p} onClick={() => setPack(p)} />
              ))}
            </div>
            <div className="flex items-center gap-2">
              {(['TODOS','CH','GDE','CHICA','GRANDE','2X1'] as Size[]).map(s => (
                <Chip key={s} label={s} active={size === s} onClick={() => setSize(s)} />
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map(item => (
            <ProductCard
              key={item.code}
              item={item}
              active={selected?.code === item.code}
              onSelect={setSelected}
            />
          ))}
        </div>
      </section>

      {/* Right: detalle + carrito + ticket */}
      <aside className="space-y-4">
        <div className="card p-4">
          <h2 className="mb-3 text-lg font-semibold text-slate-800">Detalle</h2>
          {selected ? (
            <div className="space-y-3">
              <div className="text-sm">
                <p className="text-slate-500">Producto seleccionado</p>
                <p className="font-medium">{selected.label}</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Cantidad</span>
                <QtyInput value={qty} onChange={setQty} />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Precio</span>
                <span className="font-medium">
                  {typeof selected.price === 'number'
                    ? selected.price.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })
                    : '—'}
                </span>
              </div>
              <button className="btn w-full" onClick={addToCart}>
                Agregar al carrito
              </button>
              <p className="text-xs text-slate-500">
                #{selected.code} • {selected.pack} • {selected.size} • {selected.flavor}
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Selecciona un artículo y cantidad para agregar al carrito.</p>
          )}
        </div>

        {/* Carrito */}
        <div className="card p-4 no-print">
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
                      ? (line.price * line.qty).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })
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
                    {total.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Ticket */}
        <div className="card p-4">
          <h2 className="mb-3 text-lg font-semibold text-slate-800">Ticket</h2>
          <Ticket ref={ticketRef} orderId={orderId} items={cart} />
        </div>
      </aside>
    </div>
  )
}
