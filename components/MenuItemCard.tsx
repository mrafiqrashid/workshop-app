"use client";

import { brand } from "@/lib/config/brand";
import type { MenuItem } from "./MenuClient";

export default function MenuItemCard({
  item,
  quantity,
  onQuantityChange,
}: {
  item: MenuItem;
  quantity: number;
  onQuantityChange: (id: string, quantity: number) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-gray-200 p-4">
      <div className="min-w-0">
        <h3 className="font-semibold">{item.name}</h3>
        {item.description && (
          <p className="mt-1 text-sm text-gray-600">{item.description}</p>
        )}
        <p className="mt-2 text-sm font-medium" style={{ color: brand.primaryColor }}>
          ${item.price.toFixed(2)}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={() => onQuantityChange(item.id, Math.max(0, quantity - 1))}
          disabled={quantity === 0}
          aria-label={`Decrease quantity of ${item.name}`}
          className="h-8 w-8 rounded-md border border-gray-300 text-gray-700 disabled:opacity-40"
        >
          −
        </button>
        <span className="w-5 text-center text-sm font-medium tabular-nums">{quantity}</span>
        <button
          type="button"
          onClick={() => onQuantityChange(item.id, quantity + 1)}
          aria-label={`Increase quantity of ${item.name}`}
          className="h-8 w-8 rounded-md border border-gray-300 text-gray-700"
        >
          +
        </button>
      </div>
    </div>
  );
}
