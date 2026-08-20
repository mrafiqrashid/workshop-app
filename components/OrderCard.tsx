type OrderItemLine = {
  id: string;
  quantity: number;
  unit_price: number;
  // Supabase infers embedded relations as arrays without generated DB types,
  // even though each order_item has exactly one menu_item.
  menu_items: { name: string }[];
};

export type Order = {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  order_items: OrderItemLine[];
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  preparing: "Preparing",
  ready: "Ready",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-gray-100 text-gray-700",
  preparing: "bg-amber-100 text-amber-800",
  ready: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-700",
};

export default function OrderCard({ order }: { order: Order }) {
  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {new Date(order.created_at).toLocaleString()}
        </p>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            STATUS_STYLE[order.status] ?? "bg-gray-100 text-gray-700"
          }`}
        >
          {STATUS_LABEL[order.status] ?? order.status}
        </span>
      </div>
      <ul className="mt-3 space-y-1 text-sm">
        {order.order_items.map((line) => (
          <li key={line.id} className="flex justify-between">
            <span>
              {line.quantity} × {line.menu_items[0]?.name ?? "Item"}
            </span>
            <span className="tabular-nums text-gray-600">
              ${(line.unit_price * line.quantity).toFixed(2)}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex justify-between border-t border-gray-200 pt-3 font-semibold">
        <span>Total</span>
        <span className="tabular-nums">${order.total_amount.toFixed(2)}</span>
      </div>
    </div>
  );
}
