"use client";

import { brand } from "@/lib/config/brand";
import type { MenuItem } from "./MenuClient";

export type CartLine = { item: MenuItem; quantity: number };

export default function CartSummary({
  lines,
  busy,
  onCheckout,
}: {
  lines: CartLine[];
  busy: boolean;
  onCheckout: () => void;
}) {
  const total = lines.reduce((sum, line) => sum + line.item.price * line.quantity, 0);

  if (lines.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500">
        Your cart is empty — add something from the menu.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <h3 className="font-semibold">Your order</h3>
      <ul className="mt-3 space-y-2">
        {lines.map(({ item, quantity }) => (
          <li key={item.id} className="flex justify-between text-sm">
            <span>
              {quantity} × {item.name}
            </span>
            <span className="tabular-nums text-gray-600">
              ${(item.price * quantity).toFixed(2)}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex justify-between border-t border-gray-200 pt-3 font-semibold">
        <span>Total</span>
        <span className="tabular-nums">${total.toFixed(2)}</span>
      </div>
      <button
        type="button"
        onClick={onCheckout}
        disabled={busy}
        className="mt-4 w-full rounded-md px-4 py-2 font-medium text-white disabled:opacity-60"
        style={{ backgroundColor: brand.primaryColor }}
      >
        {busy ? "Placing order…" : "Place order"}
      </button>
    </div>
  );
}
