import { useEffect, useMemo, useState } from "react";
import { db } from "../lib/db";
import type { Order, OrderItem, Product } from "../lib/types";
import { Loading, Pill, timeAgo } from "../components/ui";

const rupees = (paise: number) => "₹" + (paise / 100).toLocaleString("en-IN");

export default function Shop() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [placing, setPlacing] = useState(false);
  const [done, setDone] = useState<Order | null>(null);

  const load = async () => {
    setProducts((await db.listProducts()).filter((p) => p.stock > 0));
    setOrders(await db.listOrders());
  };
  useEffect(() => {
    void load();
  }, []);

  const items: OrderItem[] = useMemo(
    () =>
      Object.entries(cart)
        .filter(([, q]) => q > 0)
        .map(([id, qty]) => {
          const p = products?.find((x) => x.id === id)!;
          return { product_id: id, name: p.name, price_paise: p.price_paise, qty };
        }),
    [cart, products],
  );
  const total = items.reduce((n, i) => n + i.price_paise * i.qty, 0);

  if (!products) return <Loading />;

  const add = (p: Product) => setCart((c) => ({ ...c, [p.id]: Math.min(p.stock, (c[p.id] ?? 0) + 1) }));
  const sub = (p: Product) => setCart((c) => ({ ...c, [p.id]: Math.max(0, (c[p.id] ?? 0) - 1) }));

  async function checkout() {
    if (!items.length) return;
    setPlacing(true);
    try {
      const order = await db.placeOrder(items);
      setDone(order);
      setCart({});
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Could not place order");
    }
    setPlacing(false);
  }

  if (done) {
    return (
      <div className="flex flex-col gap-4 pt-6 items-center text-center">
        <div className="h-14 w-14 rounded-full bg-pos-soft text-pos grid place-items-center text-2xl">✓</div>
        <h1 className="text-xl font-extrabold">Order placed</h1>
        <p className="text-sm text-muted max-w-xs">
          {rupees(done.total_paise)} · pay and collect at the front desk. Your gym has been notified.
        </p>
        <button className="btn-ghost" onClick={() => setDone(null)}>Back to shop</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pt-1 pb-28">
      <h1 className="text-xl font-extrabold">Shop</h1>

      <div className="grid grid-cols-2 gap-3">
        {products.map((p) => (
          <div key={p.id} className="card p-2.5 flex flex-col gap-1.5">
            <div className="h-20 rounded-lg bg-paper overflow-hidden grid place-items-center text-[10px] text-muted">
              {p.image_url ? <img src={p.image_url} alt="" className="h-full w-full object-cover" /> : p.category}
            </div>
            <div className="text-xs font-bold leading-tight">{p.name}</div>
            <div className="text-xs text-muted">{rupees(p.price_paise)}</div>
            {cart[p.id] ? (
              <div className="flex items-center justify-between">
                <button className="btn-ghost h-7 w-7 p-0 text-base" onClick={() => sub(p)}>–</button>
                <span className="text-sm font-extrabold">{cart[p.id]}</span>
                <button className="btn h-7 w-7 p-0 text-base" onClick={() => add(p)}>+</button>
              </div>
            ) : (
              <button className="btn py-1.5 text-xs" onClick={() => add(p)}>Add</button>
            )}
          </div>
        ))}
        {products.length === 0 && (
          <div className="col-span-2 card p-6 text-center text-sm text-muted">
            Nothing in the shop yet.
          </div>
        )}
      </div>

      {orders.length > 0 && (
        <div>
          <div className="eyebrow mb-2 mt-2">Your orders</div>
          <div className="card divide-y divide-line">
            {orders.map((o) => (
              <div key={o.id} className="px-4 py-3 flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold">{rupees(o.total_paise)}</div>
                  <div className="text-xs text-muted truncate">
                    {o.items.map((i) => `${i.qty}× ${i.name}`).join(", ")} · {timeAgo(o.created_at)}
                  </div>
                </div>
                <Pill tone={o.status === "collected" ? "pos" : o.status === "cancelled" ? "mut" : "acc"}>{o.status}</Pill>
              </div>
            ))}
          </div>
        </div>
      )}

      {items.length > 0 && (
        <div className="fixed left-0 right-0 bottom-16 px-4">
          <button className="btn w-full max-w-md mx-auto flex items-center justify-center gap-2 shadow-lg" disabled={placing} onClick={checkout}>
            {placing ? "Placing…" : `Place order · ${rupees(total)}`}
          </button>
        </div>
      )}
    </div>
  );
}
