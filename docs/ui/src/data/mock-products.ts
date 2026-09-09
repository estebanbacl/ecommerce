import type { Product } from '../types'

export const mockProducts: readonly Product[] = [
  {
    id: 'tech-001',
    name: 'Audífonos Orbit Pro',
    description: 'Audio inmersivo, cancelación activa y 32 horas de batería.',
    category: 'Tecnología',
    unitPrice: 12900,
    stock: 8,
    tone: 'violet',
  },
  {
    id: 'tech-002',
    name: 'Teclado Nova 75',
    description: 'Formato compacto, switches silenciosos y conexión dual.',
    category: 'Tecnología',
    unitPrice: 8900,
    stock: 5,
    tone: 'sky',
  },
  {
    id: 'accessory-001',
    name: 'Mochila Transit',
    description: 'Diseño urbano resistente al agua con espacio para portátil.',
    category: 'Accesorios',
    unitPrice: 6400,
    stock: 4,
    tone: 'amber',
  },
  {
    id: 'home-001',
    name: 'Lámpara Halo',
    description: 'Luz cálida regulable con una silueta serena y minimalista.',
    category: 'Hogar',
    unitPrice: 4500,
    stock: 7,
    tone: 'emerald',
  },
]
