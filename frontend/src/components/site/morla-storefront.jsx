"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Heart, MapPin, Phone, Plus, Settings2, Shield, ShoppingBag, Sparkles, Star } from "lucide-react";
import { useTheme } from "next-themes";
import { apiRequest } from "@/lib/api";
import { useMorlaStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { drinkSizes, milkTypes, sugarLevels } from "@/lib/validators";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { MorlaSiteFooter, MorlaSiteHeader } from "@/components/site/morla-pages";

const CUSTOMIZATION_DEFAULTS = { size: "Medium", sugarLevel: "50%", milkType: "Oat" };
const SHOWCASE_ORDER = ["espresso-ice-coffee", "cappuccino-ice-coffee", "americano-coffee", "robusta-coffee"];
const FEATURED_ORDER = [
  "morla-signature-coffee",
  "robusta-coffee",
  "somali-tea-special",
  "espresso-ice-coffee",
];
const NEW_IN_MORLA_IMAGES = {
  left: "https://i.pinimg.com/736x/70/b8/83/70b883244fbec8527cf197a922f07377.jpg",
  right: "https://i.pinimg.com/736x/51/82/0b/51820b5b4bc4c7333fa9096b124c6480.jpg",
};

function money(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function ratingValue(products) {
  if (!products.length) return "4.9";
  return (products.reduce((sum, product) => sum + Number(product.rating || 0), 0) / products.length).toFixed(1);
}

function SectionTitle({ eyebrow, title, description }) {
  return (
    <div className="max-w-3xl space-y-2">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-black/45">{eyebrow}</p>
      <h2 className="font-display text-[clamp(1.9rem,4vw,3.2rem)] leading-none tracking-[-0.05em] text-[#191311]">
        {title}
      </h2>
      {description ? <p className="text-base leading-7 text-black/55">{description}</p> : null}
    </div>
  );
}

function StatCard({ value, label, icon: Icon }) {
  return (
    <Card className="border-white/70 bg-[rgba(255,255,255,0.72)] backdrop-blur-xl">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-display text-3xl leading-none text-[#191311]">{value}</p>
            <p className="mt-2 text-sm text-black/55">{label}</p>
          </div>
          <span className="flex size-11 items-center justify-center rounded-[1.1rem] bg-[#2c1f18] text-white">
            <Icon className="size-5" />
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

const HERO_BEANS = [
  { className: "left-2 top-8", size: "size-8", duration: "7.2s", delay: "-1.8s" },
  { className: "left-6 bottom-12", size: "size-6", duration: "8.4s", delay: "-0.9s" },
  { className: "right-4 top-12", size: "size-7", duration: "7.8s", delay: "-2.4s" },
  { className: "right-6 bottom-10", size: "size-8", duration: "9s", delay: "-1.2s" },
  { className: "left-[44%] top-4", size: "size-5", duration: "6.8s", delay: "-0.4s" },
  { className: "left-[58%] bottom-6", size: "size-6", duration: "8.6s", delay: "-3s" },
];

function FloatingCoffeeBeans() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      {HERO_BEANS.map((bean, index) => (
        <div
          className={cn("morla-bean-float absolute opacity-90", bean.className)}
          key={`${bean.className}-${index}`}
          style={{ "--bean-duration": bean.duration, "--bean-delay": bean.delay }}
        >
          <div className={cn("morla-bean-spin", bean.size)}>
            <div className="relative h-full w-full rounded-full bg-[linear-gradient(145deg,#5d3925_0%,#8f5a37_45%,#b37b4f_100%)] shadow-[0_12px_24px_rgba(52,29,17,0.18)]">
              <div className="absolute inset-y-[18%] left-1/2 w-[18%] -translate-x-1/2 rounded-full bg-[linear-gradient(180deg,rgba(255,236,215,0.9),rgba(88,53,34,0.55))] opacity-75" />
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.22),transparent_42%)]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function NewInMorlaBanner() {
  return (
    <Card className="overflow-hidden border-white/80 bg-[rgba(255,255,255,0.55)] shadow-[0_24px_60px_rgba(15,20,30,0.08)] backdrop-blur-xl">
      <CardContent className="p-0">
        <div className="relative isolate min-h-[320px] overflow-hidden rounded-[2rem]">
          <div className="absolute inset-0 bg-[#f7efe6]" />
          <div className="absolute inset-y-0 left-0 w-[55%] bg-[radial-gradient(circle_at_18%_26%,rgba(255,150,173,0.44),transparent_34%),linear-gradient(135deg,#f8d7df_0%,#fff2f5_52%,rgba(248,215,223,0.18)_100%)]" />
          <div className="absolute inset-y-0 right-0 w-[55%] bg-[radial-gradient(circle_at_82%_28%,rgba(145,198,132,0.38),transparent_34%),linear-gradient(225deg,#d6ebd0_0%,#f3faf0_52%,rgba(214,235,208,0.18)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.16),rgba(255,255,255,0)_18%,rgba(255,255,255,0)_82%,rgba(255,255,255,0.16))]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.34),transparent_40%)]" />

          <div className="absolute inset-y-0 left-0 flex w-1/2 items-start justify-start p-4 sm:p-6 lg:p-8">
            <div className="relative h-[270px] w-[270px] sm:h-[320px] sm:w-[320px]">
              <div className="absolute left-4 top-4 h-[210px] w-[210px] rounded-[2rem] bg-[rgba(255,255,255,0.22)] blur-2xl sm:h-[250px] sm:w-[250px]" />
              <img
                alt="New in Morla drink one"
                className="absolute left-0 top-0 h-full w-full object-contain drop-shadow-[0_24px_50px_rgba(0,0,0,0.18)]"
                src={NEW_IN_MORLA_IMAGES.left}
              />
            </div>
          </div>

          <div className="relative z-10 flex min-h-[320px] items-center justify-center px-6 py-10 text-center sm:px-8">
            <div className="max-w-lg space-y-4">
              <Badge className="mx-auto w-fit border-white/72 bg-white/84 text-black/62">
                <Sparkles className="size-3.5" />
                New in Morla
              </Badge>
              <h3 className="font-display text-[clamp(2.2rem,5vw,4.3rem)] leading-[0.92] tracking-[-0.07em] text-[#1a1310]">
                Strawberry and matcha, freshly poured in Morla
              </h3>
              <p className="mx-auto max-w-md text-sm leading-7 text-black/58 sm:text-base">
                A sweet strawberry moment on one side and a calm matcha finish on the other, styled with soft corners and a premium cafe mood.
              </p>
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <Button asChild className="h-11 rounded-full px-5">
                  <Link href="/menu">
                    Explore menu
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild className="h-11 rounded-full px-5" variant="outline">
                  <Link href="/contact">Visit Morla</Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="absolute inset-y-0 right-0 flex w-1/2 items-end justify-end p-4 sm:p-6 lg:p-8">
            <div className="relative h-[270px] w-[270px] sm:h-[320px] sm:w-[320px]">
              <div className="absolute right-4 bottom-4 h-[210px] w-[210px] rounded-[2rem] bg-[rgba(255,255,255,0.18)] blur-2xl sm:h-[250px] sm:w-[250px]" />
              <img
                alt="New in Morla drink two"
                className="absolute right-0 bottom-0 h-full w-full object-contain drop-shadow-[0_24px_50px_rgba(0,0,0,0.18)]"
                src={NEW_IN_MORLA_IMAGES.right}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FeatureRow({ icon: Icon, title, text }) {
  return (
    <div className="rounded-[1.35rem] border border-white/70 bg-white/72 p-4">
      <div className="flex items-start gap-3">
        <span className="flex size-10 items-center justify-center rounded-[1rem] bg-[#2c1f18] text-white">
          <Icon className="size-4" />
        </span>
        <div>
          <p className="font-semibold text-[#191311]">{title}</p>
          <p className="mt-1 text-sm leading-6 text-black/55">{text}</p>
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product, favorited, onAdd, onFavorite, onOpen }) {
  return (
    <Card className="overflow-hidden border-white/70 bg-[rgba(255,255,255,0.7)] shadow-[0_16px_40px_rgba(15,20,30,0.06)] backdrop-blur-xl">
      <div className="group relative block text-left">
        <button
          aria-label={`Open ${product.name} details`}
          className="relative block h-52 w-full overflow-hidden text-left"
          onClick={onOpen}
          type="button"
        >
          <img
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            src={product.image}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(17,12,10,0.18))]" />
        </button>
        <Badge className="absolute left-3 top-3 border-white/70 bg-white/75 text-black/55" variant="outline">
          {product.category}
        </Badge>
        <button
          aria-label={favorited ? `Remove ${product.name} from favorites` : `Save ${product.name} to favorites`}
          className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full border border-white/70 bg-white/82 text-[#211814]"
          onClick={onFavorite}
          type="button"
        >
          <Heart className={cn("size-3.5", favorited && "fill-[#d29a64] text-[#d29a64]")} />
        </button>
      </div>
      <CardHeader className="gap-1 px-5 py-4">
        <CardTitle className="text-[1.15rem] leading-6">{product.name}</CardTitle>
        <CardDescription className="max-h-12 overflow-hidden text-[0.9rem] leading-6">
          {product.description?.slice(0, 78)}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-3 px-5 pb-4 pt-0">
        <div>
          <p className="font-display text-xl">{money(product.price)}</p>
          <p className="mt-1 text-[0.68rem] uppercase tracking-[0.22em] text-black/42">{product.prepTime} min</p>
        </div>
        <div className="flex items-center gap-1 text-amber-500">
          <Star className="size-3.5 fill-current" />
          <span className="text-sm font-semibold text-[#191311]">{product.rating}</span>
        </div>
      </CardContent>
      <CardFooter className="justify-between px-5 pb-5 pt-0">
        <Button className="h-10 rounded-full px-4 text-sm" onClick={onAdd} type="button">
          Add to cart
          <Plus className="size-3.5" />
        </Button>
        <Button className="h-10 rounded-full px-4 text-sm" onClick={onOpen} type="button" variant="outline">
          Details
        </Button>
      </CardFooter>
    </Card>
  );
}

function ProductSkeleton() {
  return (
    <Card className="overflow-hidden border-white/70 bg-[rgba(255,255,255,0.7)] backdrop-blur-xl">
      <Skeleton className="h-52 w-full rounded-none" />
      <CardHeader className="gap-1 px-5 py-4">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-full" />
      </CardHeader>
      <CardContent className="space-y-3 px-5 pb-5 pt-0">
        <Skeleton className="h-7 w-1/3" />
        <Skeleton className="h-9 w-full rounded-full" />
      </CardContent>
    </Card>
  );
}

function MenuProductCard({ product, favorited, onAdd, onFavorite, onOpen }) {
  return (
    <Card className="overflow-hidden border-white/70 bg-[rgba(255,255,255,0.95)] shadow-[0_18px_48px_rgba(15,20,30,0.08)] backdrop-blur-xl">
      <div className="group relative block text-left">
        <button
          aria-label={`Open ${product.name}`}
          className="relative block h-56 w-full overflow-hidden bg-white text-left"
          onClick={onOpen}
          type="button"
        >
          <img
            alt={product.name}
            className="h-full w-full object-contain p-4 transition duration-500 group-hover:scale-[1.04]"
            src={product.image}
          />
        </button>
        <Badge className="absolute left-4 top-4 border-white/80 bg-white/90 text-black/55" variant="outline">
          {product.category}
        </Badge>
        <button
          aria-label={`Add ${product.name} to cart`}
          className="absolute right-4 top-4 flex size-11 items-center justify-center rounded-full border border-white/80 bg-white/90 text-[#111111] shadow-[0_10px_24px_rgba(15,20,30,0.08)] transition hover:bg-white"
          onClick={onAdd}
          type="button"
        >
          <ShoppingBag className="size-4" />
        </button>
        <button
          aria-label={favorited ? `Remove ${product.name} from favorites` : `Save ${product.name} to favorites`}
          className="absolute right-16 top-4 flex size-11 items-center justify-center rounded-full border border-white/80 bg-white/90 text-[#211814] shadow-[0_10px_24px_rgba(15,20,30,0.08)] transition hover:bg-white"
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

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-black/60">
      <span>{label}</span>
      <select
        className="h-12 rounded-[1.35rem] border border-black/10 bg-white/72 px-4 text-sm font-normal outline-none ring-0 transition focus:border-black/20"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function ProductDetails({ product, onAdd }) {
  const [size, setSize] = useState(CUSTOMIZATION_DEFAULTS.size);
  const [sugarLevel, setSugarLevel] = useState(CUSTOMIZATION_DEFAULTS.sugarLevel);
  const [milkType, setMilkType] = useState(CUSTOMIZATION_DEFAULTS.milkType);

  return (
    <div className="grid gap-6 lg:grid-cols-[0.96fr_1.04fr]">
      <div className="overflow-hidden rounded-[1.5rem]">
        <img alt={product.name} className="h-[420px] w-full object-cover" src={product.image} />
      </div>
      <div className="space-y-5">
        <DialogHeader>
          <Badge className="w-fit border-white/70 bg-white/72 text-black/55" variant="outline">
            {product.category}
          </Badge>
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

        <div className="grid gap-3 rounded-[1.5rem] border border-white/70 bg-white/72 p-4">
          <SelectField label="Size" value={size} onChange={setSize} options={drinkSizes} />
          <SelectField label="Sugar level" value={sugarLevel} onChange={setSugarLevel} options={sugarLevels} />
          <SelectField label="Milk type" value={milkType} onChange={setMilkType} options={milkTypes} />
        </div>

        <DialogFooter>
          <Button
            className="h-12 rounded-full px-6"
            onClick={() => onAdd({ size, sugarLevel, milkType })}
            type="button"
          >
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

export function MorlaCoffeeStorefront() {
  const { resolvedTheme } = useTheme();
  const [themeReady, setThemeReady] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [toast, setToast] = useState(null);

  const favorites = useMorlaStore((state) => state.favorites);
  const loyaltyPoints = useMorlaStore((state) => state.loyaltyPoints);
  const addToCart = useMorlaStore((state) => state.addToCart);
  const toggleFavorite = useMorlaStore((state) => state.toggleFavorite);

  const showcaseProducts = useMemo(() => {
    if (!products.length) return [];
    const bySlug = new Map(products.map((product) => [product.slug, product]));
    const ordered = SHOWCASE_ORDER.map((slug) => bySlug.get(slug)).filter(Boolean);
    return ordered.length ? ordered : products.slice(0, 4);
  }, [products]);

  const featuredProducts = useMemo(() => {
    if (!products.length) return [];
    const bySlug = new Map(products.map((product) => [product.slug, product]));
    const ordered = FEATURED_ORDER.map((slug) => bySlug.get(slug)).filter(Boolean);
    return ordered.length ? ordered : products.slice(0, 5);
  }, [products]);

  const heroImage =
    "https://i.pinimg.com/736x/c1/ba/26/c1ba263e6a686b4a96d0a1472b3a9834.jpg";
  const isDarkMode = themeReady && resolvedTheme === "dark";

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

  useEffect(() => {
    setThemeReady(true);
  }, []);

  function notify(title, description) {
    setToast({ title, description });
  }

  function handleAddToCart(product, customization = CUSTOMIZATION_DEFAULTS) {
    addToCart(product, customization);
    notify("Added to cart", product.name);
  }

  function handleFavorite(product) {
    toggleFavorite(product);
    notify("Favorites updated", product.name);
  }

  return (
    <div
      className={cn(
        "min-h-screen overflow-hidden",
        isDarkMode
          ? "bg-[radial-gradient(circle_at_top,rgba(90,61,38,0.35),transparent_26%),linear-gradient(180deg,#130d0b_0%,#0c0907_46%,#050403_100%)] text-[#f7eee5]"
          : "bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.78),transparent_26%),linear-gradient(180deg,#fff8f0_0%,#f3e8dc_46%,#cab8a6_100%)] text-[#211814]",
      )}
    >
      <MorlaSiteHeader />

      <main className="mx-auto grid max-w-7xl gap-20 px-4 py-6 sm:px-6 lg:px-8">
        <section className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div className="space-y-6 lg:translate-y-0 xl:translate-y-0 lg:mt-6 xl:mt-6">
            <Badge className="w-fit border-white/70 bg-white/72 text-black/55" variant="outline">
              <Sparkles className="size-3.5" />
              Premium specialty coffee
            </Badge>
            <div className="space-y-4">
              <h1 className="max-w-2xl font-display text-[clamp(3.2rem,7vw,6.8rem)] leading-[0.92] tracking-[-0.06em] text-[#191311]">
                Morla Coffee Shop
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-black/60">
                A luxurious coffee experience inspired by Blue Bottle and Starbucks, built for elegant ordering and smooth service.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="h-12 rounded-full px-6">
                <Link href="/menu">
                  Browse menu
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild className="h-12 rounded-full px-6" variant="outline">
                <Link href="/cart">View cart</Link>
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                [ratingValue(products), "Average rating", Star],
                [String(loyaltyPoints), "Loyalty points", Shield],
                [String(products.length || 8), "Premium drinks", Sparkles],
              ].map(([value, label, Icon]) => (
                <StatCard key={label} value={value} label={label} icon={Icon} />
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-x-8 bottom-0 h-28 rounded-full bg-black/18 blur-3xl" />
            <Card className="relative overflow-hidden border-white/80 bg-[rgba(255,255,255,0.72)] backdrop-blur-xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.52),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.14),rgba(34,24,20,0.08))]" />
              <div className="relative p-4 sm:p-6">
                <FloatingCoffeeBeans />
                <img
                  alt="Morla hero coffee"
                  className="relative z-20 h-[430px] w-full rounded-[1.8rem] object-cover shadow-[0_24px_60px_rgba(0,0,0,0.14)]"
                  src={heroImage}
                />
              </div>
            </Card>
          </div>
        </section>

        <NewInMorlaBanner />

        <section className="grid gap-6">
          <SectionTitle
            eyebrow="Featured"
            title="Premium picks"
          />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {(featuredProducts.length ? featuredProducts : products.slice(0, 4)).map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                favorited={favorites.includes(product._id)}
                onAdd={() => handleAddToCart(product)}
                onFavorite={() => handleFavorite(product)}
                onOpen={() => setSelectedProduct(product)}
              />
            ))}
            {loading ? Array.from({ length: 4 }).map((_, index) => <ProductSkeleton key={index} />) : null}
          </div>
        </section>

        <section className="grid gap-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-black/45">Menu</p>
              <h2 className="font-display text-[clamp(2.2rem,4.8vw,4rem)] leading-none tracking-[-0.06em] text-[#191311]">
                Our Products
              </h2>
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
                  onAdd={() => handleAddToCart(product)}
                  onFavorite={() => handleFavorite(product)}
                  onOpen={() => setSelectedProduct(product)}
                  product={product}
                />
              ))}
          </div>

          <div className="flex justify-center pt-2">
            <Button asChild className="h-11 rounded-full bg-[#111111] px-6 text-white hover:bg-[#111111]/90">
              <Link href="/menu">View all menu</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="border-white/70 bg-[rgba(255,255,255,0.72)] backdrop-blur-xl">
            <div className="p-6">
              <h3 className="font-display text-3xl">Visit Morla</h3>
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

          <Card className="border-white/70 bg-[rgba(255,255,255,0.72)] backdrop-blur-xl">
            <div className="p-6">
              <h3 className="font-display text-3xl">Why Morla</h3>
            </div>
            <div className="grid gap-3 px-6 pb-6">
              <FeatureRow
                icon={Sparkles}
                title="Luxury UI"
                text="Soft shadows, gold accents, and a premium visual hierarchy."
              />
              <FeatureRow
                icon={Shield}
                title="Fast service"
                text="Browse the menu, pick your drink, and jump straight to checkout."
              />
              <FeatureRow
                icon={MapPin}
                title="Easy pickup"
                text="Clear location details and a simple route to your next coffee."
              />
            </div>
            <div className="px-6 pb-6">
              <Button asChild className="h-12 rounded-full px-6">
                <Link href="/contact">
                  Contact Morla
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </Card>
        </section>
      </main>

      <MorlaSiteFooter />

      <Dialog open={Boolean(selectedProduct)} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent className="max-w-5xl">
          {selectedProduct ? (
            <ProductDetails
              product={selectedProduct}
              onAdd={(customization) => {
                addToCart(selectedProduct, customization);
                notify("Added to cart", selectedProduct.name);
              }}
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
    </div>
  );
}
