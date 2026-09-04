import { useEffect, useRef, useState } from "react";
import { db } from "../lib/db";
import type { Order, Product } from "../lib/types";
import { Loading, Pill, timeAgo } from "../components/ui";

const CATS = ["Supplements", "Apparel", "Accessories", "Other"];
const rupees = (paise: number) => "₹" + (paise / 100).toLocaleString("en-IN");
const blank = { name: "", description: "", category: "Supplements", price: "", stock: "" };

export default function Store() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [form, setForm] = useState(blank);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const load = async () => {
    setProducts(await db.listProducts(true));
    setOrders(await db.listOrders());
  };
  useEffect(() => {
    void load();
  }, []);
  if (!products) return <Loading />;

  function startEdit(p: Product | "new") {
    setEditing(p);
    if (p === "new") {
      setForm(blank);
      setImageUrl(null);
    } else {
      setForm({
        name: p.name,
        description: p.description ?? "",
        category: p.category,
        price: String(p.price_paise / 100),
        stock: String(p.stock),
      });
      setImageUrl(p.image_url);
    }
  }

  async function onImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      setImageUrl(await db.uploadAsset(file));
    } catch {
      alert("Upload failed");
    }
    setBusy(false);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const price_paise = Math.round(Number(form.price) * 100);
    if (!form.name.trim() || !Number.isFinite(price_paise)) return;
    setBusy(true);
    await db.saveProduct({
      id: editing !== "new" && editing ? editing.id : undefined,
      name: form.name.trim(),
      description: form.description.trim() || null,
      category: form.category,
      price_paise,
      stock: Math.max(0, Math.round(Number(form.stock) || 0)),
      image_url: imageUrl,
    });
    setEditing(null);
    setBusy(false);
    await load();
  }

  async function remove(p: Product) {
    if (!confirm(`Delete "${p.name}"?`)) return;
    await db.deleteProduct(p.id);
    await load();
  }

  async function setOrder(o: Order, status: Order["status"]) {
    await db.setOrderStatus(o.id, status);
    await load();
  }

  const pending = orders.filter((o) => o.status === "pending" || o.status === "paid");

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-extrabold flex-1">Store</h2>
        <button className="btn-ghost" onClick={() => startEdit("new")}>Add product</button>
      </div>

      {editing && (
        <form onSubmit={save} className="card p-4 flex flex-col gap-3">
          <div className="eyebrow">{editing === "new" ? "New product" : "Edit product"}</div>
          <div className="flex items-center gap-3">
            <div className="h-16 w-16 rounded-xl bg-paper grid place-items-center overflow-hidden flex-none text-[10px] text-muted">
              {imageUrl ? <img src={imageUrl} alt="" className="h-full w-full object-cover" /> : "no image"}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onImage} />
            <button type="button" className="btn-ghost py-2 px-3 text-xs" disabled={busy} onClick={() => fileRef.current?.click()}>
              {imageUrl ? "Replace image" : "Add image"}
            </button>
          </div>
          <input className="field" placeholder="Product name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
          <input className="field" placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="flex gap-3">
            <select className="field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATS.map((c) => <option key={c}>{c}</option>)}
            </select>
            <input className="field" inputMode="decimal" placeholder="Price ₹" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value.replace(/[^\d.]/g, "") })} />
            <input className="field" inputMode="numeric" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value.replace(/[^\d]/g, "") })} />
          </div>
          <div className="flex gap-2">
            <button className="btn flex-1" disabled={busy}>{busy ? "Saving…" : "Save"}</button>
            <button type="button" className="btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </form>
      )}

      <div>
        <div className="eyebrow mb-2">Catalogue ({products.length})</div>
        <div className="card divide-y divide-line">
          {products.map((p) => (
            <div key={p.id} className="px-4 py-3 flex items-center gap-3">
              <div className="h-11 w-11 rounded-lg bg-paper overflow-hidden flex-none grid place-items-center text-[9px] text-muted">
                {p.image_url ? <img src={p.image_url} alt="" className="h-full w-full object-cover" /> : p.category.slice(0, 3)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold truncate">{p.name}</div>
                <div className="text-xs text-muted">
                  {rupees(p.price_paise)} · {p.stock} in stock
                  {!p.active && " · hidden"}
                </div>
              </div>
              <button className="text-xs text-muted underline" onClick={() => startEdit(p)}>edit</button>
              <button className="text-xs text-accent underline" onClick={() => remove(p)}>delete</button>
            </div>
          ))}
          {products.length === 0 && <div className="px-4 py-6 text-center text-sm text-muted">No products yet.</div>}
        </div>
      </div>

      <div>
        <div className="eyebrow mb-2">Orders to fulfil ({pending.length})</div>
        <div className="card divide-y divide-line">
          {orders.map((o) => (
            <div key={o.id} className="px-4 py-3 flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <div className="flex-1 text-sm font-bold">{rupees(o.total_paise)}</div>
                <span className="text-xs text-muted">{timeAgo(o.created_at)}</span>
                <Pill tone={o.status === "collected" ? "pos" : o.status === "cancelled" ? "mut" : "acc"}>{o.status}</Pill>
              </div>
              <div className="text-xs text-muted">
                {o.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}
              </div>
              {(o.status === "pending" || o.status === "paid") && (
                <div className="flex gap-2 mt-1">
                  <button className="btn py-1.5 px-3 text-xs" onClick={() => setOrder(o, "collected")}>Mark collected</button>
                  <button className="btn-ghost py-1.5 px-3 text-xs" onClick={() => setOrder(o, "cancelled")}>Cancel</button>
                </div>
              )}
            </div>
          ))}
          {orders.length === 0 && <div className="px-4 py-6 text-center text-sm text-muted">No orders yet.</div>}
        </div>
      </div>
    </div>
  );
}
