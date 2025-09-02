export type SKU = {
  code: string
  label: string
  price: number
}

export const SKUS: SKU[] = [
  { code: "1066023377", label: "PALOMITA MANT CH BOLSA", price: 10 },
  { code: "1066023385", label: "PALOMITA MANT GDE BOLSA", price: 12 },
  { code: "1066023393", label: "PALOMITA CARAM CH BOLSA", price: 10 },
  { code: "1066023407", label: "PALOMITA CARAM GDE BOLSA", price: 12 },
  { code: "1066023415", label: "PALOMITA QUESO CH BOLSA", price: 10 },
  { code: "1066023423", label: "PALOMITA QUESO GDE BOLSA", price: 12 },
  { code: "1066023431", label: "PALOMITA C/Q CHICA BOLSA", price: 10 },
  { code: "1066023440", label: "PALOMITA C/Q GDE BOLSA", price: 12 },
  { code: "1066023458", label: "LATA PALOMITAS MANTEQUILLA", price: 15 },
  { code: "1066023466", label: "LATA PALOMITAS CARAMELO", price: 15 },
  { code: "1066023474", label: "LATA PALOMITAS QUESO", price: 15 },
  { code: "1066023482", label: "LATA PALOMITAS CARAMELO Y QUESO", price: 15 },
  { code: "1066023512", label: "PALOMITA CHILE-LIMON CH", price: 10 },
  { code: "1066023521", label: "PALOMITA CHILE-LIMON GDE", price: 12 },
  { code: "1066023539", label: "LATA PALOMITA CHILE-LIMON", price: 15 },
  { code: "1066023571", label: "PALOMITA TEMPORADA CHICA", price: 10 },
  { code: "1066023580", label: "PALOMITA TEMPORADA GRANDE", price: 12 },
  { code: "1066023598", label: "PALOMITA TEMPORADA LATA", price: 15 },
  { code: "1083526310", label: "COMBINACIÓN 2 SABORES GOURMET LATA", price: 20 },
  { code: "1085256926", label: "COMBINACIÓN 2 SABORES TRADICIONAL LATA", price: 20 },
  { code: "1085256934", label: "COMBINACIÓN 2 SABORES TRADICIONAL Y GOURMET LATA", price: 20 },
  { code: "1095269551", label: "PALOMITA MANT CH BOLSA 2X1", price: 10 },
  { code: "1095295499", label: "PALOMITA MANT GDE BOLSA 2X1", price: 12 },
  { code: "1103324501", label: "PALOMITA JALAPEÑO CH BOLSA", price: 10 },
  { code: "1103473010", label: "PALOMITA JALAPEÑO GDE BOLSA", price: 12 },
  { code: "1103375521", label: "LATA PALOMITA JALAPEÑO", price: 15 },
]

export type ParsedSKU = SKU & {
  flavor: string
  pack: 'BOLSA' | 'LATA' | 'COMBINACIÓN' | 'OTRO'
  size: 'CH' | 'GDE' | 'CHICA' | 'GRANDE' | '2X1' | 'STD'
}


export const parse = (s: SKU): ParsedSKU => {
  const L = s.label.toUpperCase()

  const pack = L.includes('BOLSA') ? 'BOLSA'
    : L.includes('LATA') ? 'LATA'
    : L.includes('COMBINACIÓN') ? 'COMBINACIÓN'
    : 'OTRO'

  let size: ParsedSKU['size'] = 'STD'
  if (/(\bCH\b|CHICA)/.test(L)) size = L.includes('CHICA') ? 'CHICA' : 'CH'
  if (/(\bGDE\b|GRANDE)/.test(L)) size = L.includes('GRANDE') ? 'GRANDE' : 'GDE'
  if (L.includes('2X1')) size = '2X1'

  const flavor =
    L.includes('JALAPE') ? 'JALAPEÑO' :
    L.includes('CHILE-LIMON') ? 'CHILE-LIMÓN' :
    L.includes('MANT') || L.includes('MANTEQ') ? 'MANTEQUILLA' :
    L.includes('CARAM') ? 'CARAMELO' :
    L.includes('QUESO') ? 'QUESO' :
    L.includes('TEMPORADA') ? 'TEMPORADA' :
    L.includes('C/Q') ? 'C/Q' :
    'CLÁSICA'

  return { ...s, pack, size, flavor }
}

export const PARSED = SKUS.map(parse)
