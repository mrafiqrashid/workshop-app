"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { brand } from "@/lib/config/brand";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import OrderCard, { type Order } from "./OrderCard";

export default function OrderHistoryClient({ userEmail }: { userEmail: string }) {
  const supabase = getSupabaseBrowserClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("orders")
      .select(
        "id, status, total_amount, created_at, order_items(id, quantity, unit_price, menu_items(name))"
      )
      .order("created_at", { ascending: false });
    if (error) {
      setError("Couldn't load your orders. Refresh the page to try again.");
    } else {
      setOrders(data ?? []);
      setError(null);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional fetch-on-mount
    void loadOrders();
  }, [loadOrders]);

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold"
            style={{ color: brand.primaryColor }}
          >
            <Image src={brand.logo} alt={`${brand.name} logo`} width={28} height={28} />
            {brand.name}
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/app" className="text-gray-600 hover:text-gray-900">
              Menu
            </Link>
            <span className="hidden text-gray-500 sm:inline">{userEmail}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-2xl font-bold">My orders</h1>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="mt-6 space-y-4">
          {loading ? (
            <p className="text-gray-500">Loading…</p>
          ) : orders.length === 0 ? (
            <p className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-gray-500">
              No orders yet — place one from the menu.
            </p>
          ) : (
            orders.map((order) => <OrderCard key={order.id} order={order} />)
          )}
        </div>
      </main>
    </div>
  );
}
