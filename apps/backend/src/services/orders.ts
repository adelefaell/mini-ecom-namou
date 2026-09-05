import * as orderRepository from "../repositories/orders"
import type { OrderDto } from "@repo/shared-types"

export const EmptyCartError = orderRepository.EmptyCartError

export function placeOrder(userId: number): OrderDto {
  return orderRepository.placeOrder(userId)
}