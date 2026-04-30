import { createClient } from '@supabase/supabase-js'
import { OrderDetails } from '../actions/orderLookupActions'
import crypto from 'crypto'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || ''
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || ''
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export function normalizeValue(value: string) {
  if (!value) return '';

  return value
    .normalize('NFD') // separa acentos
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/\s+/g, '') // remove espaços
    .toLowerCase(); // lowercase
}

export async function insertOrder(order: OrderDetails) {

  const data = {
    id: crypto.randomUUID(),
    order_number: order.number,
    color: order.color.toLowerCase().replace(' ', '-'),
    wheel_type: order.wheels.replace(' Wheels', '').toLowerCase(),
    customer_name: order.customer.name,
    customer_email: order.customer.email,
    customer_phone: order.customer.phone,
    customer_cpf: order.customer.document,
    payment_method: normalizeValue(order.payment),
    total_price: order.total_price,
    status: order.status,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    optionals: [],
  }
  
  const { error } = await supabase.from('orders').insert(data)
  if (error) console.error('insertOrder error:', error)
}

export async function deleteOrderByNumber(orderNumber: string) {
  await supabase.from('orders').delete().eq('order_number', orderNumber)
}

export async function deleteOrderByEmail(email: string) {
  await supabase.from('orders').delete().eq('customer_email', email)
}