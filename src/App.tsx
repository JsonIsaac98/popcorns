import { useMemo, useRef, useState, useEffect } from 'react'
import { PARSED, type ParsedSKU } from './data/skus'
import Chip from './components/Chip'
import ProductCard from './components/ProductCard'
// import QtyInput from './components/QtyInput'
import Ticket, { type TicketLine } from './components/Ticket'
import CartPanel from './components/CartPanel'
import { useReactToPrint } from 'react-to-print'
import SalesReport, { type ReportLine } from './components/SalesReport'

type Pack = 'TODOS' | 'BOLSA' | 'LATA' | 'COMBINACIÓN'
type Size = 'TODOS' | 'CH' | 'GDE' | 'CHICA' | 'GRANDE' | '2X1'

let ORDER_SEQ = 1
const newOrderId = () => {
  const ts = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14)
  return `${ts}${String(ORDER_SEQ++).padStart(3, '0')}`
}

export default function App() {
  const [query, setQuery] = useState('')
  const [pack, setPack] = useState<Pack>('TODOS')
  const [size, setSize] = useState<Size>('TODOS')
  const [selected, setSelected] = useState<ParsedSKU | null>(null)
  // const [qty, setQty] = useState(1)

  // 
   const dailySales: ReportLine[] = [
    { code: '1066023377', title: 'PALOMITA MANT CH BOLSA', qty: 12, price: 10 },
    { code: '1066023385', title: 'PALOMITA MANT GDE BOLSA', qty: 8,  price: 12 },
    { code: '1066023474', title: 'LATA PALOMITAS QUESO',    qty: 6,  price: 15 },
    { code: '1066023521', title: 'PALOMITA CHILE-LIMON GDE', qty: 5,  price: 12 },
    { code: '1066023512', title: 'PALOMITA CHILE-LIMON CH',  qty: 9,  price: 10 },
  ]

   // --- Print del reporte
  const reportRef = useRef<HTMLDivElement>(null)
  const handlePrintReport = useReactToPrint({
    contentRef: reportRef,
    documentTitle: `reporte-${new Date().toISOString().slice(0,10)}`,
  })

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
    onAfterPrint: () => {
      clearCart()
      searchInputRef.current?.focus()
    }
  })


  // focus en input
  const searchInputRef = useRef<HTMLInputElement>(null)
  useEffect(() => { searchInputRef.current?.focus() }, [])

  // carrito ops
  // const addToCart = () => {
  //   if (!selected) return
  //   setCart(prev => {
  //     const idx = prev.findIndex(l => l.code === selected.code)
  //     if (idx >= 0) {
  //       const next = [...prev]
  //       next[idx] = { ...next[idx], qty: next[idx].qty + qty }
  //       return next
  //     }
  //     return [
  //       ...prev,
  //       { code: selected.code, title: selected.label, qty, price: selected.price },
  //     ]
  //   })
  //   setQty(1)
  // }

  // helper para sumar 1 unidad
const quickAdd = (p: ParsedSKU) => {
  setCart(prev => {
    const idx = prev.findIndex(l => l.code === p.code)
    if (idx >= 0) {
      const next = [...prev]
      next[idx] = { ...next[idx], qty: next[idx].qty + 1 }
      return next
    }
    return [...prev, { code: p.code, title: p.label, qty: 1, price: p.price }]
  })
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
    setQuery('')                           // limpia el input
  searchInputRef.current?.focus()  
  }

  const hasPrices = cart.some(i => typeof i.price === 'number')
  const total = hasPrices ? cart.reduce((acc, it) => acc + (it.price || 0) * it.qty, 0) : 0

  return (
    <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 gap-6 p-4 md:p-6 md:grid-cols-[1.6fr_.9fr]">
      {/* Header */}
      <header className="col-span-full sticky top-0 z-10 bg-slate-50/80 backdrop-blur supports-[backdrop-filter]:bg-slate-50/60 flex items-center justify-between px-1 py-3 md:static md:bg-transparent md:p-0">
        <h1 className="font-display text-xl md:text-2xl font-bold tracking-tight text-slate-800">
          🍿 Tienda Liverpool Polanco
        </h1>
        <div className="no-print flex items-center gap-2">
          <button className="btn-ghost px-3 py-2 rounded-2xl" onClick={handlePrintReport}>
            Reporte
          </button>
          <button className="btn-ghost px-3 py-2 rounded-2xl" onClick={clearCart}>Nueva orden</button>
          <button className="btn" onClick={handlePrint} disabled={cart.length === 0}>
            Imprimir ticket
          </button>
        </div>
      </header>

      {/* LEFT (móvil-first): búsqueda, carrito (mobile), productos */}
      <section className="no-print space-y-4">
        {/* Búsqueda / filtros */}
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

        {/* Carrito móvil (debajo de búsqueda) */}
        <div className="md:hidden">
          <CartPanel
            cart={cart}
            hasPrices={hasPrices}
            total={total}
            updateQty={updateQty}
            removeLine={removeLine}
            currency="MXN"
          />
        </div>

        {/* Grid de productos */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map(item => (
            <ProductCard
              key={item.code}
              item={item}
              active={selected?.code === item.code}
              onSelect={setSelected}
              onAdd={quickAdd}
            />
          ))}
        </div>
      </section>

      {/* RIGHT (desktop): detalle, carrito desktop, ticket */}
      <aside className="space-y-4 md:sticky md:top-6 h-fit">
        {/* <div className="card p-4">
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
        </div> */}

        {/* Carrito desktop */}
        <div className="hidden md:block no-print">
          <CartPanel
            cart={cart}
            hasPrices={hasPrices}
            total={total}
            updateQty={updateQty}
            removeLine={removeLine}
            currency="MXN"
          />
        </div>

        {/* Ticket */}
        <div className="card p-4 hidden">
          <h2 className="mb-3 text-lg font-semibold text-slate-800">Ticket</h2>
          <Ticket ref={ticketRef} orderId={orderId} items={cart} />
        </div>
      </aside>

      <div style={{ position: 'absolute', left: -10000, top: 0 }}>
        <div ref={reportRef as any}>
          <SalesReport
            dateStr={new Date().toLocaleDateString('es-MX')}
            items={dailySales}
            currency="MXN"
          />
        </div>
      </div>
    </div>
  )
}
