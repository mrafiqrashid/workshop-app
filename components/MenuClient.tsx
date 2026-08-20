"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { brand } from "@/lib/config/brand";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import MenuItemCard from "./MenuItemCard";
import CartSummary, { type CartLine } from "./CartSummary";

export type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
};

export default function MenuClient({
  userId,
  userEmail,
  menuItems,
}: {
  userId: string;
  userEmail: string;
  menuItems: MenuItem[];
}) {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placed, setPlaced] = useState(false);

  function handleQuantityChange(id: string, quantity: number) {
    setPlaced(false);
    setQuantities((prev) => {
      const next = { ...prev };
      if (quantity === 0) delete next[id];
      else next[id] = quantity;
      return next;
    });
  }

  const lines: CartLine[] = Object.entries(quantities)
    .map(([id, quantity]) => {
      const item = menuItems.find((m) => m.id === id);
      return item ? { item, quantity } : null;
    })
    .filter((line): line is CartLine => line !== null);

  async function handleCheckout() {
    if (!supabase) {
      setError("Backend not connected.");
      return;
    }
    if (lines.length === 0) return;

    setBusy(true);
    setError(null);
    setPlaced(false);

    const total = lines.reduce((sum, line) => sum + line.item.price * line.quantity, 0);

    // user_id comes from the server-verified session — NEVER from the form.
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({ user_id: userId, total_amount: total })
      .select("id")
      .single();

    if (orderError || !order) {
      setError("Couldn't place your order. Please try again.");
      setBusy(false);
      return;
    }

    const { error: itemsError } = await supabase.from("order_items").insert(
      lines.map((line) => ({
        order_id: order.id,
        menu_item_id: line.item.id,
        quantity: line.quantity,
        unit_price: line.item.price,
      }))
    );

    if (itemsError) {
      setError("Order was created but the items failed to save. Please contact support.");
      setBusy(false);
      return;
    }

    setQuantities({});
    setPlaced(true);
    setBusy(false);
  }

  async function handleSignOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

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
            <Link href="/app/orders" className="text-gray-600 hover:text-gray-900">
              My orders
            </Link>
            <span className="hidden text-gray-500 sm:inline">{userEmail}</span>
            <button
              onClick={handleSignOut}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-gray-700 hover:bg-gray-50"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-2xl font-bold">Menu</h1>

        {placed && (
          <p className="mt-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
            Order placed! Track it on{" "}
            <Link href="/app/orders" className="font-medium underline">
              My orders
            </Link>
            .
          </p>
        )}
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="mt-6 space-y-3">
          {menuItems.length === 0 ? (
            <p className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-gray-500">
              No menu items yet.
            </p>
          ) : (
            menuItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                quantity={quantities[item.id] ?? 0}
                onQuantityChange={handleQuantityChange}
              />
            ))
          )}
        </div>

        <div className="mt-8">
          <CartSummary lines={lines} busy={busy} onCheckout={handleCheckout} />
        </div>
      </main>
    </div>
  );
}
