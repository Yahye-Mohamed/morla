"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, ChevronDown, Heart, Lock, LogIn, Mail, Menu, Minus, Phone, Plus, Settings2, ShoppingBag, Sparkles, Star, MapPin, User, UserPlus, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { apiRequest } from "@/lib/api";
import { useMorlaStore } from "@/lib/store";
import { checkoutSchema, drinkSizes, milkTypes, paymentMethods, sugarLevels } from "@/lib/validators";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

const SHOWCASE_ORDER = [
  "espresso-ice-coffee",
  "cappuccino-ice-coffee",
  "americano-coffee",
  "robusta-coffee",
];

const CUSTOMIZATION_DEFAULTS = { size: "Medium", sugarLevel: "50%", milkType: "Oat" };

function money(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

export function PageShell({ children }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.82),transparent_24%),linear-gradient(180deg,#fffaf4_0%,#f5ebe0_48%,#cdbdaa_100%)] text-[#221816]">
      <MorlaSiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      <MorlaSiteFooter />
    </div>
  );
}

export function MorlaSiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/55 bg-[rgba(255,250,244,0.8)] backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link className="flex items-center gap-3" href="/">
          <img
            alt="Morla logo"
            className="size-11 rounded-full object-cover shadow-[0_12px_26px_rgba(0,0,0,0.08)]"
            src="/morla-mark.svg"
          />
          <div className="text-left">
            <p className="font-display text-xl tracking-[0.18em]">MORLA</p>
            <p className="text-[0.68rem] uppercase tracking-[0.3em] text-black/45">Coffee shop</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 lg:flex">
          {[
            ["Home", "/"],
            ["Menu", "/menu"],
            ["Contact", "/contact"],
          ].map(([label, href]) => (
            <Link
              className="rounded-full px-4 py-2 text-sm font-semibold text-black/60 transition hover:bg-white/75 hover:text-black"
              href={href}
              key={href}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            aria-label="Cart"
            className="inline-flex size-11 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--popover)] text-[color:var(--foreground)] transition hover:bg-[color:var(--card)]"
            href="/cart"
          >
            <ShoppingBag className="size-4" />
            <span className="sr-only">Cart</span>
          </Link>

          <Button asChild className="hidden h-11 rounded-full px-5 lg:inline-flex" variant="outline">
            <Link href="/signin">
              <LogIn className="size-4" />
              Sign in
            </Link>
          </Button>

          <Button asChild className="hidden h-11 rounded-full px-5 lg:inline-flex">
            <Link href="/signup">
              <UserPlus className="size-4" />
              Sign up
            </Link>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button className="size-11 rounded-full lg:hidden" type="button" variant="outline">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-[color:var(--popover)] text-[color:var(--popover-foreground)]">
              <SheetHeader>
                <SheetTitle className="font-display text-3xl tracking-[0.12em]">Morla Cafe</SheetTitle>
              </SheetHeader>
              <div className="mt-8 grid gap-2">
                {[
                  ["Home", "/"],
                  ["Menu", "/menu"],
                  ["Contact", "/contact"],
                ].map(([label, href]) => (
                  <SheetClose asChild key={href}>
                    <Link
                      className="flex items-center justify-between rounded-[1.35rem] border border-[color:var(--border)] bg-[color:var(--card)] px-4 py-4 text-left font-semibold"
                      href={href}
                    >
                      {label}
                      <ArrowRight className="size-4" />
                    </Link>
                  </SheetClose>
                ))}
                <div className="mt-4 grid gap-2 border-t border-[color:var(--border)] pt-4">
                  <SheetClose asChild>
                    <Link
                      className="flex items-center justify-between rounded-[1.35rem] border border-[color:var(--border)] bg-[color:var(--card)] px-4 py-4 text-left font-semibold"
                      href="/signin"
                    >
                      Sign in
                      <LogIn className="size-4" />
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link
                      className="flex items-center justify-between rounded-[1.35rem] border border-[color:var(--border)] bg-[#2c1f18] px-4 py-4 text-left font-semibold text-white"
                      href="/signup"
                    >
                      Sign up
                      <UserPlus className="size-4" />
                    </Link>
                  </SheetClose>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export function MorlaSiteFooter() {
  return (
    <footer className="border-t border-white/55 bg-[rgba(255,250,244,0.82)]">
      <div className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between gap-3 px-4 py-3 text-[0.72rem] uppercase tracking-[0.28em] text-black/45 sm:px-6 lg:px-8">
        <p>© 2026 Morla Coffee Shop</p>
        <div className="hidden items-center gap-4 sm:flex">
          <Link className="transition hover:text-black" href="/">
            Home
          </Link>
          <Link className="transition hover:text-black" href="/menu">
            Menu
          </Link>
          <Link className="transition hover:text-black" href="/contact">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}

export function MorlaMenuPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [toast, setToast] = useState(null);

  const addToCart = useMorlaStore((state) => state.addToCart);
  const favorites = useMorlaStore((state) => state.favorites);
  const toggleFavorite = useMorlaStore((state) => state.toggleFavorite);

  useEffect(() => {
    let mounted = true;

    async function loadProducts() {
      setLoading(true);
      try {
        const response = await apiRequest("/products");
        if (mounted) setProducts(response.products ?? []);
      } catch (error) {
        if (mounted) setToast({ title: "Menu unavailable", description: error.message });
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadProducts();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const showcaseProducts = useMemo(() => {
    if (!products.length) return [];
    const bySlug = new Map(products.map((product) => [product.slug, product]));
    const ordered = SHOWCASE_ORDER.map((slug) => bySlug.get(slug)).filter(Boolean);
    return ordered.length ? ordered : products.slice(0, 4);
  }, [products]);

  const catalogProducts = useMemo(
    () => products.filter((product) => !SHOWCASE_ORDER.includes(product.slug)),
    [products],
  );

  function notify(title, description) {
    setToast({ title, description });
  }

  function handleFavorite(product) {
    toggleFavorite(product);
    notify("Favorites updated", product.name);
  }

  function scrollToSection(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <PageShell>
      <section className="grid gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-black/45">Menu</p>
            <h1 className="font-display text-[clamp(2.2rem,4.8vw,4rem)] leading-none tracking-[-0.06em] text-[#191311]">
              Our Products
            </h1>
          </div>
          <Badge className="w-fit border-white/70 bg-white/72 text-black/55" variant="outline">
            100% premium
          </Badge>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, index) => <MenuProductSkeleton key={index} />)
            : (showcaseProducts.length ? showcaseProducts : products.slice(0, 4)).map((product) => (
              <MenuProductCard
                key={product._id}
                favorited={favorites.includes(product._id)}
                onAdd={() => {
                  addToCart(product, CUSTOMIZATION_DEFAULTS);
                  notify("Added to cart", product.name);
                }}
                onFavorite={() => handleFavorite(product)}
                onOpen={() => setSelectedProduct(product)}
                product={product}
              />
              ))}
        </div>

        <div className="flex justify-center pt-2">
          <Button className="h-11 rounded-full bg-[#111111] px-6 text-white hover:bg-[#111111]/90" type="button" onClick={() => scrollToSection("catalog")}>
            View All
          </Button>
        </div>
      </section>

      <section id="catalog" className="mt-10 grid gap-6">
        <div className="flex items-end justify-between">
          <SectionHeading eyebrow="All coffee" title="Complete menu" description="Browse every signature Morla drink in a clean grid." />
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {(catalogProducts.length ? catalogProducts : products).map((product) => (
            <MenuProductCard
              key={product._id}
              favorited={favorites.includes(product._id)}
              onAdd={() => {
                addToCart(product, CUSTOMIZATION_DEFAULTS);
                notify("Added to cart", product.name);
              }}
              onFavorite={() => handleFavorite(product)}
              onOpen={() => setSelectedProduct(product)}
              product={product}
            />
          ))}
        </div>
      </section>

      <Dialog open={Boolean(selectedProduct)} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent>
          {selectedProduct ? (
            <MenuProductDetails
              onAdd={(customization) => {
                addToCart(selectedProduct, customization);
                notify("Added to cart", selectedProduct.name);
              }}
              product={selectedProduct}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      {toast ? (
        <div className="fixed bottom-6 right-6 z-50 w-[min(92vw,360px)] rounded-[1.5rem] border border-white/70 bg-[rgba(255,250,244,0.92)] p-4 shadow-[0_22px_60px_rgba(15,20,30,0.18)] backdrop-blur-2xl">
          <p className="text-sm font-semibold text-[#191311]">{toast.title}</p>
          <p className="mt-1 text-sm text-black/55">{toast.description}</p>
        </div>
      ) : null}
    </PageShell>
  );
}

export function MorlaCartPage() {
  const cart = useMorlaStore((state) => state.cart);
  const clearCart = useMorlaStore((state) => state.clearCart);
  const removeFromCart = useMorlaStore((state) => state.removeFromCart);
  const updateQuantity = useMorlaStore((state) => state.updateQuantity);
  const customer = useMorlaStore((state) => state.customer);
  const setCustomer = useMorlaStore((state) => state.setCustomer);

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const serviceFee = subtotal ? 2.5 : 0;
  const grandTotal = subtotal + serviceFee;
  const checkoutForm = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: customer?.name || "",
      email: customer?.email || "",
      phone: customer?.phone || "",
      paymentMethod: "mobile",
      note: "",
    },
  });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    checkoutForm.reset({
      fullName: customer?.name || "",
      email: customer?.email || "",
      phone: customer?.phone || "",
      paymentMethod: "mobile",
      note: "",
    });
  }, [checkoutForm, customer?.email, customer?.name, customer?.phone]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function notify(title, description) {
    setToast({ title, description });
  }

  async function handleCheckout(values) {
    if (!cart.length) {
      notify("Your cart is empty", "Choose at least one coffee before checking out.");
      return;
    }

    try {
      await apiRequest("/orders", {
        method: "POST",
        body: JSON.stringify({
          customerName: values.fullName,
          customerEmail: values.email,
          phone: values.phone,
          note: values.note || "",
          paymentMethod: values.paymentMethod,
          status: "pending",
          tableNumber: "Takeaway",
          items: cart.map((item) => ({
            productName: item.name,
            qty: item.quantity,
            price: item.price,
            image: item.image,
            category: item.category,
          })),
        }),
      });

      setCustomer({ name: values.fullName, email: values.email, phone: values.phone });
      clearCart();
      notify("Order placed", "Your coffee is now in the queue.");
      checkoutForm.reset({
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        paymentMethod: values.paymentMethod,
        note: "",
      });
    } catch (error) {
      notify("Checkout failed", error.message);
    }
  }

  return (
    <PageShell>
      <section className="grid gap-6 lg:grid-cols-[1.04fr_0.96fr]">
        <Card>
          <div className="p-6">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-black/45">Cart</p>
            <h1 className="mt-2 font-display text-[clamp(2.2rem,4.8vw,4rem)] leading-none tracking-[-0.06em] text-[#191311]">
              Your order
            </h1>
            <p className="mt-3 text-sm leading-7 text-black/55">Fine-tune quantities and keep every coffee exactly where you want it.</p>
          </div>
          <div className="grid gap-3 px-6 pb-6">
            {cart.length ? (
              cart.map((item) => (
                <div className="flex items-center gap-3 rounded-[1.35rem] border border-white/70 bg-white/70 p-3" key={`${item.id}-${JSON.stringify(item.customization)}`}>
                  <img alt={item.name} className="size-16 rounded-[1.1rem] object-cover" src={item.image} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[#191311]">{item.name}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.22em] text-black/42">
                      {item.customization.size} / {item.customization.sugarLevel} / {item.customization.milkType}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[#191311]">{money(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button className="size-10 rounded-full" onClick={() => updateQuantity(item.id, item.quantity - 1)} type="button" variant="outline">
                      <Minus className="size-4" />
                    </Button>
                    <span className="w-6 text-center font-semibold">{item.quantity}</span>
                    <Button className="size-10 rounded-full" onClick={() => updateQuantity(item.id, item.quantity + 1)} type="button" variant="outline">
                      <Plus className="size-4" />
                    </Button>
                    <Button className="size-10 rounded-full" onClick={() => removeFromCart(item.id)} type="button" variant="outline">
                      <X className="size-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex min-h-[240px] items-center justify-center rounded-[1.6rem] border border-dashed border-black/10 bg-white/55 text-center">
                <div>
                  <ShoppingBag className="mx-auto size-10 text-black/25" />
                  <p className="mt-4 text-lg font-semibold text-[#191311]">Your cart is empty</p>
                  <p className="mt-2 text-sm text-black/45">Choose a brew from the menu to begin.</p>
                  <Button className="mt-5 h-11 rounded-full px-5" asChild variant="outline">
                    <Link href="/menu">Browse menu</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-black/45">Checkout</p>
            <h2 className="mt-2 font-display text-[clamp(2.2rem,4.8vw,4rem)] leading-none tracking-[-0.06em] text-[#191311]">
              Secure checkout
            </h2>
          </div>
          <div className="px-6 pb-6">
            <form className="grid gap-4" onSubmit={checkoutForm.handleSubmit(handleCheckout)}>
              <Input placeholder="Full name" {...checkoutForm.register("fullName")} />
              <Input placeholder="Email" {...checkoutForm.register("email")} />
              <Input placeholder="Phone" {...checkoutForm.register("phone")} />
              <select className="h-12 rounded-[1.35rem] border border-black/10 bg-white/72 px-4 text-sm" {...checkoutForm.register("paymentMethod")}>
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
              <Textarea placeholder="Special instructions..." {...checkoutForm.register("note")} />
              <div className="grid gap-3 rounded-[1.5rem] border border-white/70 bg-white/70 p-4">
                <div className="flex items-center justify-between text-sm text-black/55">
                  <span>Subtotal</span>
                  <span>{money(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-black/55">
                  <span>Service fee</span>
                  <span>{money(serviceFee)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-black/8 pt-3 text-lg font-semibold">
                  <span>Total</span>
                  <span>{money(grandTotal)}</span>
                </div>
              </div>
              <Button className="h-12 rounded-full" disabled={!cart.length} type="submit">
                Place order
              </Button>
            </form>
          </div>
        </Card>
      </section>

      {toast ? (
        <div className="fixed bottom-6 right-6 z-50 w-[min(92vw,360px)] rounded-[1.5rem] border border-white/70 bg-[rgba(255,250,244,0.92)] p-4 shadow-[0_22px_60px_rgba(15,20,30,0.18)] backdrop-blur-2xl">
          <p className="text-sm font-semibold text-[#191311]">{toast.title}</p>
          <p className="mt-1 text-sm text-black/55">{toast.description}</p>
        </div>
      ) : null}
    </PageShell>
  );
}

export function MorlaContactPage() {
  return (
    <PageShell>
      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <div className="p-6">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-black/45">Contact</p>
            <h1 className="mt-2 font-display text-[clamp(2.2rem,4.8vw,4rem)] leading-none tracking-[-0.06em] text-[#191311]">
              Visit Morla
            </h1>
            <p className="mt-3 text-sm leading-7 text-black/55">Warm interiors, smooth espresso, and a clean pickup experience.</p>
          </div>
          <div className="px-6 pb-6 space-y-4">
            <div className="overflow-hidden rounded-[1.6rem] border border-white/70">
              <iframe
                className="h-[360px] w-full"
                loading="lazy"
                src="https://www.google.com/maps?q=Morla+Coffee+Shop+Mogadishu&output=embed"
                title="Morla Coffee Shop map"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <InfoPill icon={MapPin} title="Location" value="City center" />
              <InfoPill icon={Phone} title="Phone" value="+252 61 000 0000" />
              <InfoPill icon={Settings2} title="Hours" value="7:00 AM - 11:00 PM" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-black/45">Message</p>
            <h2 className="mt-2 font-display text-[clamp(2.2rem,4.8vw,4rem)] leading-none tracking-[-0.06em] text-[#191311]">
              Say hello
            </h2>
            <p className="mt-3 text-sm leading-7 text-black/55">Send a quick note about catering, events, or pickup timing.</p>
          </div>
          <div className="px-6 pb-6">
            <form className="grid gap-4">
              <Input placeholder="Your name" />
              <Input placeholder="Email address" />
              <Textarea placeholder="Your message" />
              <Button className="h-12 rounded-full" type="button">
                Send message
              </Button>
            </form>
          </div>
        </Card>
      </section>
    </PageShell>
  );
}

function AuthPageShell({ children }) {
  return (
    <div className="flex min-h-[100svh] flex-col overflow-hidden bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.9),transparent_28%),linear-gradient(180deg,#ffffff_0%,#fbfcfe_48%,#f3f5f9_100%)] text-slate-900">
      <MorlaSiteHeader />
      <main className="mx-auto flex flex-1 max-w-7xl items-center justify-center px-4 py-2 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

function AuthField({ icon: Icon, label, placeholder, type = "text", autoComplete }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[0.82rem] font-medium text-slate-950">{label}</span>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-4 top-1/2 size-3.5 -translate-y-1/2 text-slate-500" />
        <Input
          autoComplete={autoComplete}
          className="h-11 rounded-[1rem] border-slate-200 bg-[#f7fafc] pl-12 pr-4 text-[0.88rem] text-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] placeholder:text-slate-400 focus:bg-white"
          placeholder={placeholder}
          type={type}
        />
      </div>
    </label>
  );
}

function AuthDivider() {
  return (
    <div className="flex items-center gap-4 py-0 text-[0.64rem] font-semibold uppercase tracking-[0.28em] text-slate-400">
      <span className="h-px flex-1 bg-slate-200" />
      <span>OR CONTINUE WITH</span>
      <span className="h-px flex-1 bg-slate-200" />
    </div>
  );
}

function GoogleButton({ label }) {
  return (
    <Button className="h-10 rounded-full border-slate-200 bg-white text-slate-950 shadow-none hover:bg-slate-50" type="button" variant="outline">
      <span className="inline-flex size-6 items-center justify-center rounded-full border border-slate-300 text-sm font-semibold">G</span>
      <span>{label}</span>
    </Button>
  );
}

export function MorlaSignInPage() {
  return (
    <AuthPageShell>
      <Card className="w-full max-w-[440px] border-slate-200/80 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
        <div className="space-y-3 p-4 sm:p-5">
          <div className="space-y-1.5 text-center">
            <p className="text-[0.64rem] font-semibold uppercase tracking-[0.28em] text-slate-500">ACCOUNT ACCESS</p>
            <h1 className="font-display text-[clamp(1.45rem,3vw,2rem)] leading-[0.98] tracking-[-0.06em] text-slate-950">
              Sign in to Morla Coffee Shop
            </h1>
          </div>

          <form className="grid gap-2.5" onSubmit={(event) => event.preventDefault()}>
            <AuthField autoComplete="username" icon={Mail} label="Email address" placeholder="you@example.com" />
            <AuthField autoComplete="current-password" icon={Lock} label="Password" placeholder="Enter your password" type="password" />

            <Button className="h-10 rounded-full text-[0.9rem]" type="submit">
              Sign in
            </Button>

            <AuthDivider />

            <GoogleButton label="Sign in with Google" />
          </form>

          <p className="text-center text-[0.72rem] text-slate-600 sm:text-xs">
            Don&apos;t have an account?{" "}
            <Link className="font-semibold text-slate-950 transition hover:text-slate-700" href="/signup">
              Create one
            </Link>
          </p>
        </div>
      </Card>
    </AuthPageShell>
  );
}

export function MorlaSignUpPage() {
  return (
    <AuthPageShell>
      <Card className="w-full max-w-[440px] border-slate-200/80 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
        <div className="space-y-3 p-4 sm:p-5">
          <div className="space-y-1.5 text-center">
            <p className="text-[0.64rem] font-semibold uppercase tracking-[0.28em] text-slate-500">CREATE ACCOUNT</p>
            <h1 className="font-display text-[clamp(1.45rem,3vw,2rem)] leading-[0.98] tracking-[-0.06em] text-slate-950">
              Sign up for Morla Coffee Shop
            </h1>
          </div>

          <form className="grid gap-2.5" onSubmit={(event) => event.preventDefault()}>
            <div className="grid gap-2 sm:grid-cols-2">
              <AuthField autoComplete="name" icon={User} label="Full name" placeholder="Your full name" />
              <AuthField autoComplete="email" icon={Mail} label="Email address" placeholder="you@example.com" type="email" />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <AuthField autoComplete="new-password" icon={Lock} label="Password" placeholder="Create a password" type="password" />
              <AuthField autoComplete="new-password" icon={Lock} label="Confirm password" placeholder="Repeat your password" type="password" />
            </div>

            <Button className="h-10 rounded-full text-[0.9rem]" type="submit">
              Sign up
            </Button>

            <AuthDivider />

            <GoogleButton label="Continue with Google" />
          </form>

          <p className="text-center text-[0.72rem] text-slate-600 sm:text-xs">
            Already have an account?{" "}
            <Link className="font-semibold text-slate-950 transition hover:text-slate-700" href="/signin">
              Sign in
            </Link>
          </p>
        </div>
      </Card>
    </AuthPageShell>
  );
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="max-w-3xl space-y-2">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-black/45">{eyebrow}</p>
      <h2 className="font-display text-[clamp(1.8rem,4vw,3rem)] leading-none tracking-[-0.05em] text-[#191311]">{title}</h2>
      <p className="text-base leading-7 text-black/55">{description}</p>
    </div>
  );
}

function MenuProductSkeleton() {
  return (
    <Card className="overflow-hidden border-white/70 bg-[rgba(255,255,255,0.95)] backdrop-blur-xl">
      <Skeleton className="h-56 w-full rounded-none bg-black/5" />
      <CardHeader className="gap-2 px-5 pt-5 pb-0">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-full" />
      </CardHeader>
      <CardContent className="flex items-end justify-between gap-4 px-5 py-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-5 w-12" />
      </CardContent>
      <CardFooter className="gap-3 px-5 pb-5 pt-0">
        <Skeleton className="h-11 flex-1 rounded-full" />
        <Skeleton className="h-11 w-24 rounded-full" />
      </CardFooter>
    </Card>
  );
}

function MenuProductCard({ product, favorited, onAdd, onFavorite, onOpen }) {
  const specialTheme = product.slug === "strawberry-shake" ? "strawberry" : product.slug === "matcha-milk" ? "matcha" : null;
  const isSpecial = Boolean(specialTheme);

  return (
    <Card
      className={cn(
        "overflow-hidden border-white/70 bg-[rgba(255,255,255,0.95)] shadow-[0_18px_48px_rgba(15,20,30,0.08)] backdrop-blur-xl",
        specialTheme === "strawberry" &&
          "border-[#f3bfd0] bg-[linear-gradient(180deg,rgba(255,240,246,0.98),rgba(255,255,255,0.98))] shadow-[0_18px_48px_rgba(236,72,153,0.12)]",
        specialTheme === "matcha" &&
          "border-[#c6e1bc] bg-[linear-gradient(180deg,rgba(240,250,236,0.98),rgba(255,255,255,0.98))] shadow-[0_18px_48px_rgba(84,143,69,0.12)]",
      )}
    >
      <div className="group relative block text-left">
        <button
          aria-label={`Open ${product.name}`}
          className={cn(
            "relative block h-56 w-full overflow-hidden text-left",
            specialTheme === "strawberry" &&
              "bg-[radial-gradient(circle_at_top,rgba(255,197,215,0.95),#fff0f6_46%,#ffffff_100%)]",
            specialTheme === "matcha" &&
              "bg-[radial-gradient(circle_at_top,rgba(201,234,193,0.95),#eef9eb_46%,#ffffff_100%)]",
            !isSpecial && "bg-white",
          )}
          onClick={onOpen}
          type="button"
        >
          <img
            alt={product.name}
            className={cn(
              "h-full w-full object-contain p-4 transition duration-500 group-hover:scale-[1.04]",
              specialTheme === "strawberry" && "drop-shadow-[0_18px_36px_rgba(255,105,153,0.22)]",
              specialTheme === "matcha" && "drop-shadow-[0_18px_36px_rgba(101,159,82,0.22)]",
            )}
            src={product.image}
          />
        </button>
        <Badge
          className={cn(
            "absolute left-4 top-4 border-white/80 bg-white/90 text-black/55",
            specialTheme === "strawberry" && "border-[#f4c3d5] bg-white/95 text-[#c14d7b]",
            specialTheme === "matcha" && "border-[#c6e1bc] bg-white/95 text-[#4a8d56]",
          )}
          variant="outline"
        >
          {product.category}
        </Badge>
        {isSpecial ? (
          <Badge
            className={cn(
              "absolute left-4 top-14",
              specialTheme === "strawberry" && "border-[#f4c3d5] bg-[#fff0f6] text-[#c14d7b]",
              specialTheme === "matcha" && "border-[#c6e1bc] bg-[#eef9eb] text-[#4a8d56]",
            )}
            variant="outline"
          >
            Special
          </Badge>
        ) : null}
        <button
          aria-label={favorited ? `Remove ${product.name} from favorites` : `Save ${product.name} to favorites`}
          className="absolute right-4 top-4 flex size-11 items-center justify-center rounded-full border border-white/80 bg-white/90 text-[#211814] shadow-[0_10px_24px_rgba(15,20,30,0.08)] transition hover:bg-white"
          onClick={onFavorite}
          type="button"
        >
          <Heart className={cn("size-4", favorited && "fill-[#d29a64] text-[#d29a64]")} />
        </button>
      </div>
      <CardHeader className="gap-2 px-5 pt-5 pb-0">
        <CardTitle className="text-[1.25rem] leading-6">{product.name}</CardTitle>
        <CardDescription className="max-h-12 overflow-hidden text-[0.95rem] leading-6 text-black/55">
          {product.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-end justify-between gap-4 px-5 py-4">
        <div>
          <p className="font-display text-2xl">{money(product.price)}</p>
          <p className="mt-1 text-[0.72rem] uppercase tracking-[0.22em] text-black/42">{product.prepTime} min</p>
        </div>
        <div className="flex items-center gap-1 text-amber-500">
          <Star className="size-4 fill-current" />
          <span className="text-sm font-semibold text-[#191311]">{product.rating}</span>
        </div>
      </CardContent>
      <CardFooter className="gap-3 px-5 pb-5 pt-0">
        <Button className="h-11 flex-1 rounded-full bg-[#2c1f18] px-5 text-white shadow-none hover:bg-[#2c1f18]/90" onClick={onAdd} type="button">
          Add to cart
          <Plus className="size-4" />
        </Button>
        <Button className="h-11 rounded-full border border-black/10 bg-white/80 px-5 text-[#2c1f18] hover:bg-white" onClick={onOpen} type="button" variant="outline">
          Details
        </Button>
      </CardFooter>
    </Card>
  );
}

function MenuProductDetails({ product, onAdd }) {
  const specialTheme = product.slug === "strawberry-shake" ? "strawberry" : product.slug === "matcha-milk" ? "matcha" : null;
  const isSpecial = Boolean(specialTheme);

  return (
    <div className="grid gap-6 lg:grid-cols-[0.96fr_1.04fr]">
      <div className="overflow-hidden rounded-[1.5rem]">
        <img alt={product.name} className="h-[420px] w-full object-cover" src={product.image} />
      </div>
      <div className="space-y-5">
        <DialogHeader>
          <div className="flex flex-wrap gap-2">
            <Badge
              className={cn(
                "w-fit border-white/70 bg-white/72 text-black/55",
                specialTheme === "strawberry" && "border-[#f4c3d5] bg-[#fff0f6] text-[#c14d7b]",
                specialTheme === "matcha" && "border-[#c6e1bc] bg-[#eef9eb] text-[#4a8d56]",
              )}
              variant="outline"
            >
              {product.category}
            </Badge>
            {isSpecial ? (
              <Badge
                className={cn(
                  "w-fit",
                  specialTheme === "strawberry" && "border-[#f4c3d5] bg-[#fff0f6] text-[#c14d7b]",
                  specialTheme === "matcha" && "border-[#c6e1bc] bg-[#eef9eb] text-[#4a8d56]",
                )}
                variant="outline"
              >
                Special
              </Badge>
            ) : null}
          </div>
          <DialogTitle className="font-display text-4xl tracking-[-0.04em]">{product.name}</DialogTitle>
          <DialogDescription>{product.description}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 rounded-[1.5rem] border border-white/70 bg-white/72 p-4">
          <div className="flex items-center justify-between text-sm text-black/55">
            <span>Price</span>
            <span>{money(product.price)}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-black/55">
            <span>Prep time</span>
            <span>{product.prepTime} minutes</span>
          </div>
          <div className="flex items-center justify-between text-sm text-black/55">
            <span>Rating</span>
            <span>{product.rating}</span>
          </div>
        </div>

        <DialogFooter>
          <Button className="h-12 rounded-full px-6" onClick={onAdd} type="button">
            Add to cart
          </Button>
        </DialogFooter>
      </div>
    </div>
  );
}

function InfoPill({ icon: Icon, title, value }) {
  return (
    <div className="rounded-[1.35rem] border border-white/70 bg-white/72 p-4">
      <div className="flex items-start gap-3">
        <span className="flex size-10 items-center justify-center rounded-[1rem] bg-[#2c1f18] text-white">
          <Icon className="size-4" />
        </span>
        <div>
          <p className="text-[0.68rem] uppercase tracking-[0.28em] text-black/45">{title}</p>
          <p className="mt-2 text-sm font-semibold text-[#191311]">{value}</p>
        </div>
      </div>
    </div>
  );
}
