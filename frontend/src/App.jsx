"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Coffee,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  PencilLine,
  Plus,
  RefreshCw,
  ReceiptText,
  Search,
  Settings2,
  ShoppingBag,
  Sparkles,
  Trash2,
  TrendingUp,
  UserRound,
  UtensilsCrossed,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { apiRequest } from "@/lib/api";
import { cn } from "@/lib/utils";

const brandMark = "/morla-mark.svg";

const TOKEN_KEY = "morla_admin_token";

const NAV_ITEMS = [
  { id: "overview", label: "Overview", description: "Daily summary", icon: LayoutDashboard },
  { id: "products", label: "Products", description: "Menu builder", icon: Package },
  { id: "orders", label: "Orders", description: "Kitchen queue", icon: ReceiptText },
  { id: "settings", label: "Settings", description: "System info", icon: Settings2 },
];

const PRODUCT_IMAGE_OPTIONS = [
  { label: "Espresso", value: "/products/espresso-hero.png", accent: "from-[#3d2720] to-[#8b5a3c]" },
  { label: "Vanilla Latte", value: "/products/vanilla-latte.png", accent: "from-[#c28d54] to-[#f0cfb0]" },
  { label: "Cinnamon", value: "/products/cinnamon-coffee.png", accent: "from-[#74422a] to-[#c88a5d]" },
  { label: "Flat White", value: "/products/flat-white-coffee.png", accent: "from-[#8a6e58] to-[#e4d1bf]" },
];

const ORDER_STATUS_OPTIONS = ["pending", "brewing", "ready", "served", "cancelled"];

const PAYMENT_METHODS = [
  { label: "Cash", value: "cash" },
  { label: "Card", value: "card" },
  { label: "Mobile", value: "mobile" },
  { label: "Online", value: "online" },
];

function money(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function formatDateTime(value) {
  if (!value) {
    return "Just now";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function createEmptyProductForm() {
  return {
    name: "",
    category: "Espresso",
    price: "4.50",
    image: PRODUCT_IMAGE_OPTIONS[0].value,
    description: "",
    featured: true,
    inStock: true,
    stock: "12",
    rating: "4.8",
    prepTime: "5",
  };
}

function mapProductToForm(product) {
  return {
    name: product.name || "",
    category: product.category || "Espresso",
    price: String(product.price ?? "4.50"),
    image: product.image || PRODUCT_IMAGE_OPTIONS[0].value,
    description: product.description || "",
    featured: Boolean(product.featured),
    inStock: Boolean(product.inStock),
    stock: String(product.stock ?? 0),
    rating: String(product.rating ?? 4.8),
    prepTime: String(product.prepTime ?? 5),
  };
}

function createEmptyOrderForm(defaultProductName = "") {
  return {
    customerName: "",
    phone: "",
    tableNumber: "",
    note: "",
    paymentMethod: "cash",
    status: "pending",
    productName: defaultProductName,
    qty: "1",
  };
}

function statusBadgeClass(status) {
  switch (status) {
    case "pending":
      return "border-amber-200 bg-amber-50 text-amber-800";
    case "brewing":
      return "border-sky-200 bg-sky-50 text-sky-800";
    case "ready":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "served":
      return "border-slate-200 bg-slate-100 text-slate-700";
    case "cancelled":
      return "border-rose-200 bg-rose-50 text-rose-800";
    default:
      return "border-white/60 bg-white/80 text-[#111111]";
  }
}

function sectionIconColor(index) {
  const colors = [
    "from-[#1f2a44] to-[#54607c]",
    "from-[#644126] to-[#9b6b45]",
    "from-[#4d3429] to-[#91684b]",
    "from-[#2f3c3c] to-[#7f8b84]",
  ];

  return colors[index % colors.length];
}

function App() {
  const [bootstrapping, setBootstrapping] = useState(true);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [productSaving, setProductSaving] = useState(false);
  const [orderSaving, setOrderSaving] = useState(false);
  const [busyOrderId, setBusyOrderId] = useState("");
  const [activeSection, setActiveSection] = useState("overview");
  const [admin, setAdmin] = useState(null);
  const [summary, setSummary] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [productForm, setProductForm] = useState(createEmptyProductForm());
  const [orderForm, setOrderForm] = useState(createEmptyOrderForm());
  const [loginForm, setLoginForm] = useState({
    username: "admin@morla.cafe",
    password: "morla1234",
  });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const activeNavItem = NAV_ITEMS.find((item) => item.id === activeSection) ?? NAV_ITEMS[0];
  const selectedProduct = products.find((product) => product._id === selectedProductId) ?? null;
  const selectedOrderProduct = products.find((product) => product.name === orderForm.productName) ?? products[0] ?? null;

  useEffect(() => {
    const savedToken = window.localStorage.getItem(TOKEN_KEY);

    if (savedToken) {
      setToken(savedToken);
    } else {
      setBootstrapping(false);
    }
  }, []);

  useEffect(() => {
    if (!token) {
      return;
    }

    loadBootstrapData(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (!products.length) {
      return;
    }

    setOrderForm((current) => {
      const isValidProduct = current.productName && products.some((product) => product.name === current.productName);

      if (isValidProduct) {
        return current;
      }

      return {
        ...current,
        productName: products[0].name,
      };
    });
  }, [products]);

  useEffect(() => {
    if (!notice) {
      return undefined;
    }

    const timer = window.setTimeout(() => setNotice(""), 3200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (!error) {
      return undefined;
    }

    const timer = window.setTimeout(() => setError(""), 4200);
    return () => window.clearTimeout(timer);
  }, [error]);

  async function loadBootstrapData(currentToken) {
    setLoading(true);
    setError("");

    try {
      const [meResponse, summaryResponse, productsResponse, ordersResponse] = await Promise.all([
        apiRequest("/auth/me", { token: currentToken }),
        apiRequest("/dashboard/summary", { token: currentToken }),
        apiRequest("/products", { token: currentToken }),
        apiRequest("/orders", { token: currentToken }),
      ]);

      const nextProducts = productsResponse.products ?? [];
      const nextOrders = ordersResponse.orders ?? [];

      setAdmin(meResponse.admin);
      setSummary(summaryResponse.summary);
      setProducts(nextProducts);
      setOrders(nextOrders);

      if (nextProducts.length > 0) {
        setSelectedProductId(nextProducts[0]._id);
        setProductForm(mapProductToForm(nextProducts[0]));
      } else {
        setSelectedProductId(null);
        setProductForm(createEmptyProductForm());
      }

      setOrderForm((current) => {
        const hasProduct = current.productName && nextProducts.some((product) => product.name === current.productName);

        if (hasProduct) {
          return current;
        }

        return createEmptyOrderForm(nextProducts[0]?.name || "");
      });
    } catch (requestError) {
      if (requestError.status === 401) {
        signOut("Your session expired. Please sign in again.");
        return;
      }

      setError(requestError.message);
    } finally {
      setLoading(false);
      setBootstrapping(false);
    }
  }

  async function refreshProducts(preferredId = null) {
    try {
      const [summaryResponse, productsResponse] = await Promise.all([
        apiRequest("/dashboard/summary", { token }),
        apiRequest("/products", { token }),
      ]);

      const nextProducts = productsResponse.products ?? [];
      setSummary(summaryResponse.summary);
      setProducts(nextProducts);

      const nextProduct =
        nextProducts.find((product) => product._id === preferredId) ?? nextProducts[0] ?? null;

      if (nextProduct) {
        setSelectedProductId(nextProduct._id);
        setProductForm(mapProductToForm(nextProduct));
      } else {
        setSelectedProductId(null);
        setProductForm(createEmptyProductForm());
      }
    } catch (requestError) {
      if (requestError.status === 401) {
        signOut("Your session expired. Please sign in again.");
        return;
      }

      setError(requestError.message);
    }
  }

  async function refreshOrders() {
    try {
      const [summaryResponse, ordersResponse] = await Promise.all([
        apiRequest("/dashboard/summary", { token }),
        apiRequest("/orders", { token }),
      ]);

      setSummary(summaryResponse.summary);
      setOrders(ordersResponse.orders ?? []);
    } catch (requestError) {
      if (requestError.status === 401) {
        signOut("Your session expired. Please sign in again.");
        return;
      }

      setError(requestError.message);
    }
  }

  function signOut(message = "") {
    window.localStorage.removeItem(TOKEN_KEY);
    setToken("");
    setAdmin(null);
    setSummary(null);
    setProducts([]);
    setOrders([]);
    setSelectedProductId(null);
    setProductForm(createEmptyProductForm());
    setOrderForm(createEmptyOrderForm());
    setError(message);
    setNotice("");
    setLoading(false);
    setAuthLoading(false);
  }

  async function handleLoginSubmit(event) {
    event.preventDefault();
    setAuthLoading(true);
    setError("");

    try {
      const response = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify(loginForm),
      });

      window.localStorage.setItem(TOKEN_KEY, response.token);
      setToken(response.token);
      setAdmin(response.admin);
      setNotice(`Welcome back, ${response.admin.name}.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setAuthLoading(false);
    }
  }

  function handleProductFieldChange(field, value) {
    setProductForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleOrderFieldChange(field, value) {
    setOrderForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function selectProduct(product) {
    setActiveSection("products");
    setSelectedProductId(product._id);
    setProductForm(mapProductToForm(product));
    setNotice(`${product.name} loaded for editing.`);
  }

  function createNewProduct() {
    setActiveSection("products");
    setSelectedProductId(null);
    setProductForm(createEmptyProductForm());
    setNotice("Ready to create a new product.");
  }

  async function handleProductSubmit(event) {
    event.preventDefault();
    setProductSaving(true);
    setError("");

    try {
      const payload = {
        ...productForm,
        price: Number(productForm.price),
        stock: Number(productForm.stock),
        rating: Number(productForm.rating),
        prepTime: Number(productForm.prepTime),
      };

      const response = selectedProductId
        ? await apiRequest(`/products/${selectedProductId}`, {
            token,
            method: "PATCH",
            body: JSON.stringify(payload),
          })
        : await apiRequest("/products", {
            token,
            method: "POST",
            body: JSON.stringify(payload),
          });

      setNotice(selectedProductId ? "Product updated." : "Product created.");
      await refreshProducts(response.product._id);
    } catch (requestError) {
      if (requestError.status === 401) {
        signOut("Your session expired. Please sign in again.");
        return;
      }

      setError(requestError.message);
    } finally {
      setProductSaving(false);
    }
  }

  async function deleteProduct() {
    if (!selectedProductId) {
      return;
    }

    const selected = products.find((product) => product._id === selectedProductId);
    const confirmed = window.confirm(`Delete ${selected?.name || "this product"}?`);

    if (!confirmed) {
      return;
    }

    setProductSaving(true);
    setError("");

    try {
      await apiRequest(`/products/${selectedProductId}`, {
        token,
        method: "DELETE",
      });

      setNotice("Product removed.");
      await refreshProducts();
    } catch (requestError) {
      if (requestError.status === 401) {
        signOut("Your session expired. Please sign in again.");
        return;
      }

      setError(requestError.message);
    } finally {
      setProductSaving(false);
    }
  }

  async function handleOrderSubmit(event) {
    event.preventDefault();
    setOrderSaving(true);
    setError("");

    try {
      const sourceProduct = products.find((product) => product.name === orderForm.productName) ?? products[0];

      if (!sourceProduct) {
        throw new Error("Create at least one product before adding orders.");
      }

      const payload = {
        customerName: orderForm.customerName,
        phone: orderForm.phone,
        tableNumber: orderForm.tableNumber,
        note: orderForm.note,
        paymentMethod: orderForm.paymentMethod,
        status: orderForm.status,
        barista: admin?.name || "Morla Admin",
        items: [
          {
            productName: sourceProduct.name,
            qty: Number(orderForm.qty),
            price: sourceProduct.price,
            image: sourceProduct.image,
            category: sourceProduct.category,
          },
        ],
      };

      await apiRequest("/orders", {
        token,
        method: "POST",
        body: JSON.stringify(payload),
      });

      setNotice("Order created.");
      setOrderForm(createEmptyOrderForm(sourceProduct.name));
      await refreshOrders();
    } catch (requestError) {
      if (requestError.status === 401) {
        signOut("Your session expired. Please sign in again.");
        return;
      }

      setError(requestError.message);
    } finally {
      setOrderSaving(false);
    }
  }

  async function updateOrderStatus(orderId, status) {
    setBusyOrderId(orderId);
    setError("");

    try {
      await apiRequest(`/orders/${orderId}`, {
        token,
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      setNotice(`Order updated to ${status}.`);
      await refreshOrders();
    } catch (requestError) {
      if (requestError.status === 401) {
        signOut("Your session expired. Please sign in again.");
        return;
      }

      setError(requestError.message);
    } finally {
      setBusyOrderId("");
    }
  }

  async function deleteOrder(orderId) {
    const selected = orders.find((order) => order._id === orderId);
    const confirmed = window.confirm(`Delete order for ${selected?.customerName || "this customer"}?`);

    if (!confirmed) {
      return;
    }

    setBusyOrderId(orderId);
    setError("");

    try {
      await apiRequest(`/orders/${orderId}`, {
        token,
        method: "DELETE",
      });

      setNotice("Order deleted.");
      await refreshOrders();
    } catch (requestError) {
      if (requestError.status === 401) {
        signOut("Your session expired. Please sign in again.");
        return;
      }

      setError(requestError.message);
    } finally {
      setBusyOrderId("");
    }
  }

  if (bootstrapping) {
    return <BootScreen />;
  }

  if (!token) {
    return (
      <LoginScreen
        authLoading={authLoading}
        error={error}
        loginForm={loginForm}
        onLoginFormChange={(field, value) =>
          setLoginForm((current) => ({
            ...current,
            [field]: value,
          }))
        }
        onSubmit={handleLoginSubmit}
      />
    );
  }

  return (
    <div className="relative h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.62),transparent_30%),linear-gradient(180deg,#f5efe7_0%,#e9e1d7_42%,#cec4b6_100%)] text-[#15110f]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(255,255,255,0.5),transparent_26%),radial-gradient(circle_at_84%_14%,rgba(255,217,181,0.25),transparent_22%),radial-gradient(circle_at_50%_100%,rgba(45,34,28,0.16),transparent_34%)]" />

      <div className="relative flex h-full">
        <aside className="hidden h-full w-[300px] shrink-0 flex-col border-r border-white/50 bg-[rgba(255,251,245,0.62)] px-5 py-5 backdrop-blur-2xl lg:flex">
          <div className="flex items-center gap-3 rounded-[1.8rem] border border-white/60 bg-white/60 px-4 py-4 shadow-[0_18px_48px_rgba(15,20,30,0.08)]">
            <span className="flex size-12 items-center justify-center rounded-full bg-white/80 shadow-[0_12px_26px_rgba(0,0,0,0.08)]">
              <img alt="Morla logo" className="size-9 rounded-full object-cover" src={brandMark} />
            </span>
            <div>
              <p className="font-display text-[1.7rem] leading-none tracking-[0.22em] text-[#15110f]">MORLA</p>
              <p className="mt-1 text-[0.68rem] font-semibold uppercase tracking-[0.36em] text-black/46">
                Admin Console
              </p>
            </div>
          </div>

          <nav aria-label="Desktop navigation" className="mt-5 grid gap-2">
            {NAV_ITEMS.map((item, index) => {
              const Icon = item.icon;
              const isActive = item.id === activeSection;

              return (
                <button
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-[1.6rem] border px-4 py-4 text-left transition duration-200",
                    isActive
                      ? "border-black/10 bg-black/8 shadow-[0_18px_40px_rgba(15,20,30,0.08)]"
                      : "border-transparent bg-white/55 hover:-translate-y-0.5 hover:bg-white/80",
                  )}
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  type="button"
                >
                  <span
                    className={cn(
                      "flex size-11 items-center justify-center rounded-[1.2rem] text-white shadow-[0_14px_26px_rgba(0,0,0,0.16)]",
                      `bg-gradient-to-br ${sectionIconColor(index)}`,
                    )}
                  >
                    <Icon className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-[#15110f]">{item.label}</span>
                    <span className="mt-1 block text-[0.72rem] uppercase tracking-[0.24em] text-black/42">
                      {item.description}
                    </span>
                  </span>
                  {isActive ? <ChevronRight className="size-4 text-black/65" /> : null}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto space-y-3">
            <div className="rounded-[1.8rem] border border-white/65 bg-[linear-gradient(180deg,rgba(255,255,255,0.8),rgba(255,248,240,0.92))] p-4 shadow-[0_18px_48px_rgba(15,20,30,0.08)]">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-black/45">Today</p>
              <div className="mt-3 flex items-end justify-between gap-4">
                <div>
                  <p className="font-display text-4xl leading-none text-[#15110f]">
                    {summary?.metrics?.revenueToday ? money(summary.metrics.revenueToday) : "$0.00"}
                  </p>
                  <p className="mt-2 text-sm text-black/55">Revenue from live orders</p>
                </div>
                <CircleDollarSign className="size-10 text-[#63422c]" />
              </div>
            </div>

            <Button
              className="h-12 w-full rounded-full px-5"
              onClick={() => signOut()}
              type="button"
              variant="outline"
            >
              <LogOut className="size-4" />
              Sign out
            </Button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <header className="flex items-center justify-between gap-3 border-b border-white/50 bg-[rgba(255,251,245,0.46)] px-4 py-4 backdrop-blur-2xl sm:px-5 lg:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    aria-label="Open admin menu"
                    className="size-11 rounded-full border border-black/5 bg-white/70 text-[#15110f] shadow-none hover:bg-white lg:hidden"
                    size="icon"
                    variant="outline"
                  >
                    <Menu className="size-5" />
                  </Button>
                </SheetTrigger>

                <SheetContent className="bg-[#fffaf4] px-5 py-12 sm:px-7">
                  <SheetHeader className="gap-3">
                    <SheetTitle className="text-[#15110f]">Morla Admin</SheetTitle>
                    <SheetDescription>Move between dashboard sections and manage the coffee shop.</SheetDescription>
                  </SheetHeader>

                  <nav aria-label="Mobile navigation" className="mt-8 grid gap-2">
                    {NAV_ITEMS.map((item, index) => {
                      const Icon = item.icon;
                      const isActive = item.id === activeSection;

                      return (
                        <SheetClose asChild key={item.id}>
                          <button
                            className={cn(
                              "flex items-center gap-3 rounded-[1.5rem] border px-4 py-4 text-left transition",
                              isActive
                                ? "border-black/10 bg-black/8"
                                : "border-white/70 bg-white/60 hover:bg-white",
                            )}
                            onClick={() => setActiveSection(item.id)}
                            type="button"
                          >
                            <span
                              className={cn(
                                "flex size-10 items-center justify-center rounded-[1rem] text-white",
                                `bg-gradient-to-br ${sectionIconColor(index)}`,
                              )}
                            >
                              <Icon className="size-4.5" />
                            </span>
                            <span>
                              <span className="block text-sm font-semibold text-[#15110f]">{item.label}</span>
                              <span className="block text-[0.68rem] uppercase tracking-[0.24em] text-black/45">
                                {item.description}
                              </span>
                            </span>
                          </button>
                        </SheetClose>
                      );
                    })}
                  </nav>

                  <Button
                    className="mt-8 h-12 w-full rounded-full px-5"
                    onClick={() => signOut()}
                    type="button"
                    variant="outline"
                  >
                    <LogOut className="size-4" />
                    Sign out
                  </Button>
                </SheetContent>
              </Sheet>

              <div className="min-w-0">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.38em] text-black/45">
                  {activeNavItem.description}
                </p>
                <h1 className="font-display mt-1 truncate text-2xl tracking-[0.04em] text-[#15110f] sm:text-[2rem]">
                  {activeNavItem.label}
                </h1>
              </div>
            </div>

            <div className="hidden min-w-0 flex-1 justify-center lg:flex">
              <div className="flex w-full max-w-[560px] items-center gap-3 rounded-full border border-white/65 bg-white/68 px-4 py-3 shadow-[0_18px_44px_rgba(15,20,30,0.08)] backdrop-blur-xl">
                <Search className="size-4 text-black/45" />
                <span className="truncate text-sm text-black/48">
                  Live kitchen control, menu editing, and coffee order tracking
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                className="hidden h-11 rounded-full px-5 lg:inline-flex"
                onClick={() => {
                  if (activeSection === "products") {
                    refreshProducts(selectedProductId);
                  } else if (activeSection === "orders") {
                    refreshOrders();
                  } else {
                    loadBootstrapData(token);
                  }
                }}
                type="button"
                variant="outline"
              >
                <RefreshCw className={cn("size-4", loading ? "animate-spin" : "")} />
                Refresh
              </Button>

              <div className="hidden items-center gap-3 rounded-full border border-white/65 bg-white/70 px-4 py-2.5 shadow-[0_16px_38px_rgba(15,20,30,0.08)] lg:flex">
                <span className="flex size-9 items-center justify-center rounded-full bg-[#1d1d22] text-white">
                  <UserRound className="size-4" />
                </span>
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-[#15110f]">{admin?.name || "Morla Admin"}</p>
                  <p className="text-[0.66rem] uppercase tracking-[0.32em] text-black/45">Admin</p>
                </div>
              </div>

              <Button
                className="h-11 rounded-full px-5"
                onClick={() => signOut()}
                type="button"
                variant="outline"
              >
                <LogOut className="size-4" />
                Logout
              </Button>
            </div>
          </header>

          {(notice || error) && (
            <div className="px-4 pt-4 sm:px-5 lg:px-6">
              <div
                className={cn(
                  "rounded-[1.5rem] border px-4 py-3 text-sm shadow-[0_16px_36px_rgba(15,20,30,0.08)] backdrop-blur-xl",
                  error
                    ? "border-rose-200 bg-rose-50/95 text-rose-800"
                    : "border-emerald-200 bg-emerald-50/95 text-emerald-800",
                )}
              >
                {error || notice}
              </div>
            </div>
          )}

          <main className="flex-1 overflow-hidden px-4 pb-4 pt-4 sm:px-5 lg:px-6 lg:pb-6">
            {activeSection === "overview" ? (
              <OverviewSection summary={summary} orders={orders} products={products} />
            ) : null}

            {activeSection === "products" ? (
              <ProductsSection
                createNewProduct={createNewProduct}
                deleteProduct={deleteProduct}
                onFieldChange={handleProductFieldChange}
                onSubmit={handleProductSubmit}
                productForm={productForm}
                productSaving={productSaving}
                products={products}
                selectedProduct={selectedProduct}
                selectProduct={selectProduct}
              />
            ) : null}

            {activeSection === "orders" ? (
              <OrdersSection
                busyOrderId={busyOrderId}
                deleteOrder={deleteOrder}
                onFieldChange={handleOrderFieldChange}
                onSubmit={handleOrderSubmit}
                orderForm={orderForm}
                orderSaving={orderSaving}
                orders={orders}
                products={products}
                selectedOrderProduct={selectedOrderProduct}
                updateOrderStatus={updateOrderStatus}
              />
            ) : null}

            {activeSection === "settings" ? <SettingsSection admin={admin} summary={summary} /> : null}

            {loading ? <LoadingOverlay /> : null}
          </main>
        </div>
      </div>
    </div>
  );
}

function fieldClass(extraClassName = "") {
  return cn(
    "w-full rounded-[1.35rem] border border-black/10 bg-white/72 px-4 py-3 text-sm text-[#15110f] outline-none transition placeholder:text-black/30 focus:border-black/20 focus:bg-white",
    extraClassName,
  );
}

function statusProgressColor(status) {
  switch (status) {
    case "pending":
      return "from-amber-300 to-amber-500";
    case "brewing":
      return "from-sky-300 to-sky-500";
    case "ready":
      return "from-emerald-300 to-emerald-500";
    case "served":
      return "from-slate-300 to-slate-500";
    case "cancelled":
      return "from-rose-300 to-rose-500";
    default:
      return "from-[#9b7b64] to-[#5b4332]";
  }
}

function BootScreen() {
  return (
    <div className="flex h-screen items-center justify-center bg-[linear-gradient(180deg,#f5efe7_0%,#e7dfd4_45%,#cdbfae_100%)] px-4 text-[#15110f]">
      <div className="rounded-[2.4rem] border border-white/70 bg-white/70 px-8 py-10 shadow-[0_24px_80px_rgba(15,20,30,0.12)] backdrop-blur-2xl">
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-full bg-white shadow-[0_12px_28px_rgba(0,0,0,0.08)]">
            <img alt="Morla logo" className="size-10 rounded-full object-cover" src={brandMark} />
          </div>
          <div>
            <p className="font-display text-4xl tracking-[0.2em]">MORLA</p>
            <p className="mt-1 text-[0.72rem] uppercase tracking-[0.34em] text-black/45">Admin console</p>
          </div>
        </div>

        <div className="mt-8 flex items-center gap-3">
          <RefreshCw className="size-5 animate-spin text-[#63422c]" />
          <p className="text-sm text-black/55">Loading your coffee shop dashboard...</p>
        </div>
      </div>
    </div>
  );
}

function LoginScreen({ authLoading, error, loginForm, onLoginFormChange, onSubmit }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.65),transparent_26%),linear-gradient(180deg,#f5efe7_0%,#e6ded1_52%,#cbbca8_100%)] px-4 py-6 text-[#15110f]">
      <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative overflow-hidden rounded-[2.6rem] border border-white/70 bg-[rgba(255,252,248,0.72)] p-8 shadow-[0_24px_80px_rgba(15,20,30,0.12)] backdrop-blur-2xl sm:p-10">
          <div className="absolute -right-10 top-10 size-40 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.65),rgba(255,255,255,0))] blur-2xl" />
          <div className="flex items-center gap-4">
            <div className="flex size-16 items-center justify-center rounded-full bg-white/80 shadow-[0_14px_32px_rgba(0,0,0,0.08)]">
              <img alt="Morla logo" className="size-12 rounded-full object-cover" src={brandMark} />
            </div>
            <div>
              <p className="font-display text-5xl tracking-[0.18em]">MORLA</p>
              <p className="mt-1 text-[0.72rem] uppercase tracking-[0.34em] text-black/45">Coffee shop admin</p>
            </div>
          </div>

          <p className="mt-8 max-w-xl text-[clamp(1.6rem,2.2vw,2.8rem)] leading-[1.05] tracking-[-0.06em] text-[#15110f]">
            A warm, fast dashboard for managing coffee products, kitchen orders, and day-to-day menu updates.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {PRODUCT_IMAGE_OPTIONS.slice(0, 3).map((option) => (
              <div
                className="overflow-hidden rounded-[1.5rem] border border-white/70 bg-white/72 shadow-[0_18px_40px_rgba(15,20,30,0.08)]"
                key={option.value}
              >
                <img alt={option.label} className="aspect-[1.25/1] w-full object-cover" src={option.value} />
                <div className="px-4 py-3">
                  <p className="text-sm font-semibold text-[#15110f]">{option.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Badge className="border-white/70 bg-white/74 text-black/55" variant="outline">
              <Coffee className="size-3.5" />
              Mongo connected
            </Badge>
            <Badge className="border-white/70 bg-white/74 text-black/55" variant="outline">
              <Sparkles className="size-3.5" />
              JWT protected
            </Badge>
            <Badge className="border-white/70 bg-white/74 text-black/55" variant="outline">
              <BarChart3 className="size-3.5" />
              Live summary
            </Badge>
          </div>
        </div>

        <div className="flex items-center">
          <form
            className="w-full rounded-[2.4rem] border border-white/70 bg-[rgba(255,252,248,0.84)] p-6 shadow-[0_24px_80px_rgba(15,20,30,0.12)] backdrop-blur-2xl sm:p-8"
            onSubmit={onSubmit}
          >
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.38em] text-black/45">Admin access</p>
            <h2 className="font-display mt-2 text-4xl tracking-[0.08em] text-[#15110f]">Sign in</h2>
            <p className="mt-2 text-sm leading-7 text-black/55">
              Use the default local credentials or change them in <code>backend/.env</code>.
            </p>

            <div className="mt-8 grid gap-4">
              <Field label="Username">
                <input
                  className={fieldClass()}
                  onChange={(event) => onLoginFormChange("username", event.target.value)}
                  placeholder="admin@morla.cafe"
                  value={loginForm.username}
                />
              </Field>

              <Field label="Password">
                <input
                  className={fieldClass()}
                  onChange={(event) => onLoginFormChange("password", event.target.value)}
                  placeholder="morla1234"
                  type="password"
                  value={loginForm.password}
                />
              </Field>
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-white/70 bg-white/74 p-4 shadow-[0_14px_34px_rgba(15,20,30,0.06)]">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-black/45">Default login</p>
              <p className="mt-2 text-sm font-semibold text-[#15110f]">admin@morla.cafe / morla1234</p>
            </div>

            {error ? (
              <div className="mt-4 rounded-[1.35rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                {error}
              </div>
            ) : null}

            <Button className="mt-6 h-12 w-full rounded-full px-6" disabled={authLoading} type="submit">
              {authLoading ? (
                <>
                  <RefreshCw className="size-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogOut className="size-4" />
                  Open admin
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Panel({ title, subtitle, action, children, className = "" }) {
  return (
    <section
      className={cn(
        "flex min-h-0 flex-col rounded-[2rem] border border-white/65 bg-[rgba(255,252,248,0.78)] p-4 shadow-[0_22px_70px_rgba(15,20,30,0.1)] backdrop-blur-2xl sm:p-5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-black/45">{subtitle}</p>
          <h2 className="font-display mt-1 text-2xl tracking-[0.06em] text-[#15110f]">{title}</h2>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>

      <div className="mt-4 min-h-0 flex-1">{children}</div>
    </section>
  );
}

function StatCard({ icon: Icon, title, value, detail, tone }) {
  return (
    <div className="rounded-[1.6rem] border border-white/70 bg-white/72 p-4 shadow-[0_18px_40px_rgba(15,20,30,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-black/45">{title}</p>
          <p className="font-display mt-2 text-[clamp(1.8rem,2vw,2.5rem)] leading-none text-[#15110f]">
            {value}
          </p>
          <p className="mt-2 text-sm text-black/50">{detail}</p>
        </div>
        <div
          className={cn(
            "flex size-12 items-center justify-center rounded-[1.1rem] bg-gradient-to-br text-white shadow-[0_14px_28px_rgba(15,20,30,0.16)]",
            tone,
          )}
        >
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, className = "" }) {
  return (
    <label className={cn("grid gap-2", className)}>
      <span className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-black/45">{label}</span>
      {children}
    </label>
  );
}

function InfoChip({ label, value }) {
  return (
    <div className="rounded-[1.35rem] border border-white/70 bg-white/74 px-4 py-3 shadow-[0_14px_34px_rgba(15,20,30,0.06)]">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-black/45">{label}</p>
      <p className="mt-2 text-sm font-semibold text-[#15110f]">{value}</p>
    </div>
  );
}

function NoteRow({ icon: Icon, text }) {
  return (
    <div className="flex items-start gap-3 rounded-[1.35rem] border border-white/70 bg-white/74 p-4 shadow-[0_14px_34px_rgba(15,20,30,0.06)]">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-[1rem] bg-[#1d1d22] text-white shadow-[0_10px_20px_rgba(0,0,0,0.14)]">
        <Icon className="size-4" />
      </div>
      <p className="text-sm leading-7 text-black/60">{text}</p>
    </div>
  );
}

function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex h-full flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-black/10 bg-white/60 px-6 py-10 text-center">
      <div className="flex size-14 items-center justify-center rounded-[1.4rem] bg-black/6 text-[#15110f]">
        <Icon className="size-6" />
      </div>
      <p className="mt-4 text-lg font-semibold text-[#15110f]">{title}</p>
      <p className="mt-2 max-w-sm text-sm leading-7 text-black/50">{description}</p>
    </div>
  );
}

function OverviewSection({ summary, orders, products }) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const derivedMetrics = {
    products: products.length,
    featuredProducts: products.filter((product) => product.featured).length,
    lowStock: products.filter((product) => product.stock <= 5).length,
    activeOrders: orders.filter((order) => ["pending", "brewing", "ready"].includes(order.status)).length,
    completedOrders: orders.filter((order) => order.status === "served").length,
    revenueToday: orders
      .filter((order) => new Date(order.createdAt) >= startOfToday && order.status !== "cancelled")
      .reduce((sum, order) => sum + Number(order.total || 0), 0),
  };

  const metrics = summary?.metrics ?? derivedMetrics;
  const statusCounts =
    summary?.statusCounts ??
    ORDER_STATUS_OPTIONS.map((status) => ({
      status,
      count: orders.filter((order) => order.status === status).length,
    }));
  const totalOrders = orders.length;
  const topProducts =
    summary?.topProducts ??
    products.slice(0, 4).map((product) => ({
      productName: product.name,
      units: product.stock,
      revenue: product.price * Math.max(product.stock, 1),
      image: product.image,
      category: product.category,
    }));
  const recentOrders = summary?.recentOrders ?? orders.slice(0, 5);

  return (
    <div className="grid h-full min-h-0 gap-4 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="grid min-h-0 gap-4">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            detail="Revenue from today's live queue"
            icon={CircleDollarSign}
            tone="from-[#2b1c17] to-[#6e4934]"
            title="Revenue Today"
            value={money(metrics.revenueToday)}
          />
          <StatCard
            detail="Items currently in the menu"
            icon={ShoppingBag}
            tone="from-[#4d3427] to-[#936647]"
            title="Products"
            value={metrics.products ?? products.length}
          />
          <StatCard
            detail="Tickets that still need action"
            icon={ReceiptText}
            tone="from-[#2e3449] to-[#59668b]"
            title="Active Orders"
            value={metrics.activeOrders ?? 0}
          />
          <StatCard
            detail="Items with stock levels to review"
            icon={TrendingUp}
            tone="from-[#5d251f] to-[#bc7056]"
            title="Low Stock"
            value={metrics.lowStock ?? 0}
          />
        </div>

        <Panel className="h-full min-h-0" subtitle="Service pulse" title="Status and best sellers">
          <div className="grid h-full min-h-0 gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[1.6rem] border border-white/70 bg-white/60 p-4 shadow-[0_16px_34px_rgba(15,20,30,0.06)]">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[#15110f]">Order status</p>
                <Badge className="border-white/70 bg-white/75 text-black/55" variant="outline">
                  <Sparkles className="size-3.5" />
                  Live
                </Badge>
              </div>

              <div className="mt-4 grid gap-4">
                {statusCounts.map((item) => (
                  <div key={item.status}>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="capitalize text-black/55">{item.status}</span>
                      <span className="font-semibold text-[#15110f]">{item.count}</span>
                    </div>
                    <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-black/6">
                      <div
                        className={cn("h-full rounded-full bg-gradient-to-r", statusProgressColor(item.status))}
                        style={{
                          width: totalOrders ? `${Math.max(10, Math.round((item.count / totalOrders) * 100))}%` : "10%",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.6rem] border border-white/70 bg-white/60 p-4 shadow-[0_16px_34px_rgba(15,20,30,0.06)]">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[#15110f]">Top products</p>
                <Badge className="border-white/70 bg-white/75 text-black/55" variant="outline">
                  <Search className="size-3.5" />
                  Browse ready
                </Badge>
              </div>

              {topProducts.length ? (
                <div className="mt-4 grid gap-3">
                  {topProducts.map((product, index) => (
                    <div
                      className="flex items-center gap-3 rounded-[1.35rem] border border-white/70 bg-white/75 px-3 py-3 shadow-[0_12px_28px_rgba(15,20,30,0.05)]"
                      key={`${product.productName}-${index}`}
                    >
                      <img
                        alt={product.productName}
                        className="size-14 rounded-[1.1rem] object-cover shadow-[0_10px_20px_rgba(0,0,0,0.12)]"
                        src={product.image}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-[#15110f]">{product.productName}</p>
                            <p className="mt-1 text-xs uppercase tracking-[0.24em] text-black/42">{product.category}</p>
                          </div>
                          <span className="text-right text-sm font-semibold text-[#15110f]">{money(product.revenue)}</span>
                        </div>
                        <p className="mt-2 text-xs uppercase tracking-[0.24em] text-black/42">
                          {product.units} sold
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4">
                  <EmptyState
                    description="Add products in the menu builder to see top sellers appear here."
                    icon={Package}
                    title="No best sellers yet"
                  />
                </div>
              )}
            </div>
          </div>
        </Panel>
      </div>

      <div className="grid min-h-0 gap-4">
        <Panel
          className="h-full min-h-0"
          subtitle="Recent activity"
          title="Latest orders"
          action={
            <Badge className="border-white/70 bg-white/75 text-black/55" variant="outline">
              {totalOrders} total
            </Badge>
          }
        >
          {recentOrders.length ? (
            <div className="grid h-full min-h-0 gap-3 overflow-auto pr-1">
              {recentOrders.map((order) => (
                <article
                  className="rounded-[1.45rem] border border-white/70 bg-white/75 p-4 shadow-[0_16px_34px_rgba(15,20,30,0.06)]"
                  key={order._id}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-[#15110f]">{order.customerName}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.24em] text-black/42">
                        {order.tableNumber || "Takeaway"}
                        {order.phone ? ` • ${order.phone}` : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={cn("border", statusBadgeClass(order.status))} variant="outline">
                        {order.status}
                      </Badge>
                      <p className="mt-2 font-display text-xl leading-none text-[#15110f]">{money(order.total)}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <InfoChip label="Placed" value={formatDateTime(order.createdAt)} />
                    <InfoChip label="Barista" value={order.barista || "Morla Team"} />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {order.items?.map((item) => (
                      <Badge
                        className="border-white/70 bg-white/78 text-black/55 normal-case tracking-normal"
                        key={`${order._id}-${item.productName}`}
                        variant="outline"
                      >
                        {item.qty}x {item.productName}
                      </Badge>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              description="When new orders are created they appear here with live status controls."
              icon={ReceiptText}
              title="No orders yet"
            />
          )}
        </Panel>

        <Panel
          className="h-full min-h-0"
          subtitle="Operations"
          title="Today snapshot"
          action={
            <Badge className="border-white/70 bg-white/75 text-black/55" variant="outline">
              <Clock3 className="size-3.5" />
              Auto refresh
            </Badge>
          }
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoChip label="Revenue" value={money(metrics.revenueToday)} />
            <InfoChip label="Featured" value={`${metrics.featuredProducts ?? 0} products`} />
            <InfoChip label="Active queue" value={`${metrics.activeOrders ?? 0} orders`} />
            <InfoChip label="Completed" value={`${metrics.completedOrders ?? 0} served`} />
          </div>

          <div className="mt-4 grid gap-3">
            <NoteRow
              icon={Coffee}
              text="Morla Cafe admin is connected to MongoDB and protected by JWT sign-in."
            />
            <NoteRow
              icon={Sparkles}
              text="Use Products to manage the menu and Orders to move kitchen tickets through the queue."
            />
            <NoteRow
              icon={TrendingUp}
              text="Keep an eye on low stock and recent orders during busy service periods."
            />
          </div>
        </Panel>
      </div>
    </div>
  );
}

function ProductsSection({
  createNewProduct,
  deleteProduct,
  onFieldChange,
  onSubmit,
  productForm,
  productSaving,
  products,
  selectedProduct,
  selectProduct,
}) {
  const previewProduct =
    selectedProduct ?? {
      _id: "draft",
      name: productForm.name || "Untitled brew",
      category: productForm.category || "Coffee",
      price: Number(productForm.price || 0),
      image: productForm.image || PRODUCT_IMAGE_OPTIONS[0].value,
      description: productForm.description || "Build the product details and the live preview will update here.",
      featured: Boolean(productForm.featured),
      inStock: Boolean(productForm.inStock),
      stock: Number(productForm.stock || 0),
      rating: Number(productForm.rating || 0),
      prepTime: Number(productForm.prepTime || 0),
    };

  return (
    <div className="grid h-full min-h-0 gap-4 xl:grid-cols-[0.92fr_1.08fr]">
      <Panel
        className="h-full min-h-0"
        subtitle="Menu inventory"
        title="Coffee products"
        action={
          <div className="flex items-center gap-2">
            <Badge className="border-white/70 bg-white/75 text-black/55" variant="outline">
              <Search className="size-3.5" />
              Search-ready
            </Badge>
            <Button className="h-10 px-4" onClick={createNewProduct} size="sm" type="button">
              <Plus className="size-4" />
              New product
            </Button>
          </div>
        }
      >
        <div className="grid h-full min-h-0 gap-4">
          <div className="rounded-[1.6rem] border border-white/70 bg-white/60 p-4 shadow-[0_16px_34px_rgba(15,20,30,0.06)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#15110f]">All products</p>
                <p className="mt-1 text-xs uppercase tracking-[0.24em] text-black/42">
                  {products.length} items in the catalog
                </p>
              </div>
              <Badge className="border-white/70 bg-white/75 text-black/55" variant="outline">
                <Package className="size-3.5" />
                Menu
              </Badge>
            </div>

            {products.length ? (
              <div className="mt-4 grid gap-3 overflow-auto pr-1">
                {products.map((product) => {
                  const isActive = selectedProduct?._id === product._id;

                  return (
                    <button
                      className={cn(
                        "flex items-center gap-3 rounded-[1.45rem] border p-3 text-left transition duration-200",
                        isActive
                          ? "border-black/10 bg-black/6 shadow-[0_16px_32px_rgba(15,20,30,0.08)]"
                          : "border-white/70 bg-white/74 hover:-translate-y-0.5 hover:bg-white",
                      )}
                      key={product._id}
                      onClick={() => selectProduct(product)}
                      type="button"
                    >
                      <img
                        alt={product.name}
                        className="size-16 rounded-[1.1rem] object-cover shadow-[0_12px_24px_rgba(0,0,0,0.12)]"
                        src={product.image}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-[#15110f]">{product.name}</p>
                            <p className="mt-1 text-xs uppercase tracking-[0.24em] text-black/42">{product.category}</p>
                          </div>
                          <p className="font-display text-xl leading-none text-[#15110f]">{money(product.price)}</p>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge
                            className="border-white/70 bg-white/72 text-black/55 normal-case tracking-normal"
                            variant="outline"
                          >
                            Stock {product.stock}
                          </Badge>
                          <Badge
                            className="border-white/70 bg-white/72 text-black/55 normal-case tracking-normal"
                            variant="outline"
                          >
                            {product.rating} rating
                          </Badge>
                          {product.featured ? (
                            <Badge
                              className="border-white/70 bg-white/72 text-black/55 normal-case tracking-normal"
                              variant="outline"
                            >
                              Featured
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="mt-4">
                <EmptyState
                  description="Create the first coffee item to start building the menu."
                  icon={Package}
                  title="No products yet"
                />
              </div>
            )}
          </div>
        </div>
      </Panel>

      <Panel
        className="h-full min-h-0"
        subtitle="Product editor"
        title={selectedProduct ? selectedProduct.name : "New product"}
        action={
          <Badge className="border-white/70 bg-white/75 text-black/55" variant="outline">
            {selectedProduct ? "Editing" : "Draft"}
          </Badge>
        }
      >
        <form className="grid h-full min-h-0 gap-4" onSubmit={onSubmit}>
          <div className="rounded-[1.6rem] border border-white/70 bg-white/60 p-4 shadow-[0_16px_34px_rgba(15,20,30,0.06)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#15110f]">{previewProduct.name}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.24em] text-black/42">{previewProduct.category}</p>
              </div>
              <p className="font-display text-2xl leading-none text-[#15110f]">{money(previewProduct.price)}</p>
            </div>

            <div className="mt-4 flex items-center gap-4">
              <img
                alt={previewProduct.name}
                className="size-24 rounded-[1.4rem] object-cover shadow-[0_14px_30px_rgba(0,0,0,0.14)]"
                src={previewProduct.image}
              />
              <div className="grid gap-2">
                <InfoChip label="Stock" value={`${previewProduct.stock} cups`} />
                <InfoChip label="Prep time" value={`${previewProduct.prepTime} min`} />
              </div>
            </div>

            <p className="mt-4 text-sm leading-7 text-black/55">{previewProduct.description}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name">
              <input
                className={fieldClass()}
                onChange={(event) => onFieldChange("name", event.target.value)}
                placeholder="Morla Espresso"
                value={productForm.name}
              />
            </Field>

            <Field label="Category">
              <input
                className={fieldClass()}
                onChange={(event) => onFieldChange("category", event.target.value)}
                placeholder="Espresso"
                value={productForm.category}
              />
            </Field>

            <Field label="Price">
              <input
                className={fieldClass()}
                onChange={(event) => onFieldChange("price", event.target.value)}
                placeholder="4.50"
                step="0.01"
                type="number"
                value={productForm.price}
              />
            </Field>

            <Field label="Stock">
              <input
                className={fieldClass()}
                onChange={(event) => onFieldChange("stock", event.target.value)}
                placeholder="12"
                type="number"
                value={productForm.stock}
              />
            </Field>

            <Field label="Rating">
              <input
                className={fieldClass()}
                onChange={(event) => onFieldChange("rating", event.target.value)}
                placeholder="4.8"
                step="0.1"
                type="number"
                value={productForm.rating}
              />
            </Field>

            <Field label="Prep time">
              <input
                className={fieldClass()}
                onChange={(event) => onFieldChange("prepTime", event.target.value)}
                placeholder="5"
                type="number"
                value={productForm.prepTime}
              />
            </Field>

            <Field label="Image">
              <select
                className={fieldClass()}
                onChange={(event) => onFieldChange("image", event.target.value)}
                value={productForm.image}
              >
                {PRODUCT_IMAGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field className="sm:col-span-2" label="Description">
              <textarea
                className={fieldClass("min-h-28 resize-none")}
                onChange={(event) => onFieldChange("description", event.target.value)}
                placeholder="Smooth espresso with a cocoa finish..."
                value={productForm.description}
              />
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              className={cn(
                "flex items-center justify-between rounded-[1.4rem] border px-4 py-4 text-left transition",
                productForm.featured
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                  : "border-white/70 bg-white/70 text-[#15110f]",
              )}
              onClick={() => onFieldChange("featured", !productForm.featured)}
              type="button"
            >
              <span>
                <span className="block text-sm font-semibold">Featured product</span>
                <span className="mt-1 block text-xs uppercase tracking-[0.24em] opacity-70">
                  {productForm.featured ? "Visible on homepage" : "Hidden from spotlight"}
                </span>
              </span>
              <span className="text-lg font-semibold">{productForm.featured ? "On" : "Off"}</span>
            </button>

            <button
              className={cn(
                "flex items-center justify-between rounded-[1.4rem] border px-4 py-4 text-left transition",
                productForm.inStock
                  ? "border-sky-200 bg-sky-50 text-sky-900"
                  : "border-white/70 bg-white/70 text-[#15110f]",
              )}
              onClick={() => onFieldChange("inStock", !productForm.inStock)}
              type="button"
            >
              <span>
                <span className="block text-sm font-semibold">In stock</span>
                <span className="mt-1 block text-xs uppercase tracking-[0.24em] opacity-70">
                  {productForm.inStock ? "Available to order" : "Paused for now"}
                </span>
              </span>
              <span className="text-lg font-semibold">{productForm.inStock ? "Yes" : "No"}</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button className="h-11 px-5" disabled={productSaving} type="submit">
              <PencilLine className="size-4" />
              {selectedProduct ? "Save changes" : "Create product"}
            </Button>
            <Button className="h-11 px-5" onClick={createNewProduct} type="button" variant="outline">
              <Plus className="size-4" />
              Reset form
            </Button>
            <Button
              className="h-11 px-5"
              disabled={!selectedProduct || productSaving}
              onClick={deleteProduct}
              type="button"
              variant="outline"
            >
              <Trash2 className="size-4" />
              Delete selected
            </Button>
          </div>
        </form>
      </Panel>
    </div>
  );
}

function OrdersSection({
  busyOrderId,
  deleteOrder,
  onFieldChange,
  onSubmit,
  orderForm,
  orderSaving,
  orders,
  products,
  selectedOrderProduct,
  updateOrderStatus,
}) {
  const hasProducts = products.length > 0;

  return (
    <div className="grid h-full min-h-0 gap-4 xl:grid-cols-[0.94fr_1.06fr]">
      <Panel
        className="h-full min-h-0"
        subtitle="New ticket"
        title="Create order"
        action={
          <Badge className="border-white/70 bg-white/75 text-black/55" variant="outline">
            <UtensilsCrossed className="size-3.5" />
            Kitchen
          </Badge>
        }
      >
        <form className="grid h-full min-h-0 gap-4" onSubmit={onSubmit}>
          <div className="rounded-[1.6rem] border border-white/70 bg-white/60 p-4 shadow-[0_16px_34px_rgba(15,20,30,0.06)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#15110f]">Selected brew</p>
                <p className="mt-1 text-xs uppercase tracking-[0.24em] text-black/42">
                  {selectedOrderProduct?.name || "Add products to unlock ordering"}
                </p>
              </div>
              {selectedOrderProduct ? (
                <p className="font-display text-2xl leading-none text-[#15110f]">{money(selectedOrderProduct.price)}</p>
              ) : null}
            </div>

            {selectedOrderProduct ? (
              <div className="mt-4 flex items-center gap-4">
                <img
                  alt={selectedOrderProduct.name}
                  className="size-24 rounded-[1.4rem] object-cover shadow-[0_14px_30px_rgba(0,0,0,0.14)]"
                  src={selectedOrderProduct.image}
                />
                <div className="grid gap-2">
                  <InfoChip label="Category" value={selectedOrderProduct.category} />
                  <InfoChip label="Prep time" value={`${selectedOrderProduct.prepTime} min`} />
                </div>
              </div>
            ) : (
              <div className="mt-4">
                <EmptyState
                  description="Create menu products first so the order form can attach items to a real brew."
                  icon={Coffee}
                  title="No products available"
                />
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Customer name">
              <input
                className={fieldClass()}
                onChange={(event) => onFieldChange("customerName", event.target.value)}
                placeholder="Amina Hassan"
                value={orderForm.customerName}
              />
            </Field>

            <Field label="Phone">
              <input
                className={fieldClass()}
                onChange={(event) => onFieldChange("phone", event.target.value)}
                placeholder="+252..."
                value={orderForm.phone}
              />
            </Field>

            <Field label="Table">
              <input
                className={fieldClass()}
                onChange={(event) => onFieldChange("tableNumber", event.target.value)}
                placeholder="T-04"
                value={orderForm.tableNumber}
              />
            </Field>

            <Field label="Qty">
              <input
                className={fieldClass()}
                min="1"
                onChange={(event) => onFieldChange("qty", event.target.value)}
                type="number"
                value={orderForm.qty}
              />
            </Field>

            <Field label="Product">
              <select
                className={fieldClass()}
                disabled={!hasProducts}
                onChange={(event) => onFieldChange("productName", event.target.value)}
                value={orderForm.productName}
              >
                {products.length ? (
                  products.map((product) => (
                    <option key={product._id} value={product.name}>
                      {product.name}
                    </option>
                  ))
                ) : (
                  <option value="">No products available</option>
                )}
              </select>
            </Field>

            <Field label="Payment method">
              <select
                className={fieldClass()}
                onChange={(event) => onFieldChange("paymentMethod", event.target.value)}
                value={orderForm.paymentMethod}
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field className="sm:col-span-2" label="Status">
              <select
                className={fieldClass()}
                onChange={(event) => onFieldChange("status", event.target.value)}
                value={orderForm.status}
              >
                {ORDER_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </Field>

            <Field className="sm:col-span-2" label="Note">
              <textarea
                className={fieldClass("min-h-28 resize-none")}
                onChange={(event) => onFieldChange("note", event.target.value)}
                placeholder="No sugar, extra hot..."
                value={orderForm.note}
              />
            </Field>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button className="h-11 px-5" disabled={orderSaving || !hasProducts} type="submit">
              <ReceiptText className="size-4" />
              {orderSaving ? "Saving..." : "Create order"}
            </Button>
          </div>
        </form>
      </Panel>

      <Panel
        className="h-full min-h-0"
        subtitle="Live queue"
        title="Orders"
        action={
          <Badge className="border-white/70 bg-white/75 text-black/55" variant="outline">
            {orders.length} orders
          </Badge>
        }
      >
        {orders.length ? (
          <div className="grid h-full min-h-0 gap-3 overflow-auto pr-1">
            {orders.map((order) => {
              const isBusy = busyOrderId === order._id;

              return (
                <article
                  className="rounded-[1.45rem] border border-white/70 bg-white/75 p-4 shadow-[0_16px_34px_rgba(15,20,30,0.06)]"
                  key={order._id}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-[#15110f]">{order.customerName}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.24em] text-black/42">
                        {order.tableNumber || "Takeaway"}
                        {order.phone ? ` • ${order.phone}` : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={cn("border", statusBadgeClass(order.status))} variant="outline">
                        {order.status}
                      </Badge>
                      <p className="mt-2 font-display text-xl leading-none text-[#15110f]">{money(order.total)}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <InfoChip label="Placed" value={formatDateTime(order.createdAt)} />
                    <InfoChip label="Barista" value={order.barista || "Morla Team"} />
                  </div>

                  <div className="mt-4 grid gap-2">
                    {order.items?.map((item) => (
                      <div
                        className="flex items-center gap-3 rounded-[1.25rem] border border-white/70 bg-white/72 px-3 py-2.5"
                        key={`${order._id}-${item.productName}`}
                      >
                        <img
                          alt={item.productName}
                          className="size-11 rounded-[1rem] object-cover shadow-[0_10px_20px_rgba(0,0,0,0.12)]"
                          src={item.image}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-[#15110f]">{item.productName}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.22em] text-black/42">{item.category}</p>
                        </div>
                        <p className="shrink-0 text-sm font-semibold text-[#15110f]">
                          {item.qty} x {money(item.price)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <select
                      className={fieldClass("h-10 w-[170px] px-3 py-2 text-xs uppercase tracking-[0.18em]")}
                      disabled={isBusy}
                      onChange={(event) => updateOrderStatus(order._id, event.target.value)}
                      value={order.status}
                    >
                      {ORDER_STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>

                    <Button
                      className="h-10 px-4"
                      disabled={isBusy}
                      onClick={() => deleteOrder(order._id)}
                      type="button"
                      variant="outline"
                    >
                      {isBusy ? <RefreshCw className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                      Delete
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState
            description="New orders will appear here with inline status controls and quick delete actions."
            icon={ReceiptText}
            title="No orders yet"
          />
        )}
      </Panel>
    </div>
  );
}

function SettingsSection({ admin, summary }) {
  const metrics = summary?.metrics ?? {};

  return (
    <div className="grid h-full min-h-0 gap-4 xl:grid-cols-[0.9fr_1.1fr]">
      <Panel
        className="h-full min-h-0"
        subtitle="Profile"
        title="Admin identity"
        action={
          <Badge className="border-white/70 bg-white/75 text-black/55" variant="outline">
            <UserRound className="size-3.5" />
            Account
          </Badge>
        }
      >
        <div className="flex items-center gap-4 rounded-[1.6rem] border border-white/70 bg-white/60 p-4 shadow-[0_16px_34px_rgba(15,20,30,0.06)]">
          <div className="flex size-18 items-center justify-center rounded-full bg-white shadow-[0_12px_28px_rgba(0,0,0,0.08)]">
            <img alt="Morla logo" className="size-12 rounded-full object-cover" src={brandMark} />
          </div>
          <div className="min-w-0">
            <p className="font-display text-4xl leading-none tracking-[0.18em] text-[#15110f]">
              {admin?.name || "Morla Admin"}
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.32em] text-black/42">
              {admin?.username || "admin@morla.cafe"}
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <InfoChip label="Role" value={admin?.role || "admin"} />
          <InfoChip label="Products" value={`${metrics.products ?? 0}`} />
          <InfoChip label="Featured" value={`${metrics.featuredProducts ?? 0}`} />
          <InfoChip label="Active orders" value={`${metrics.activeOrders ?? 0}`} />
        </div>

        <div className="mt-4 grid gap-3">
          <NoteRow
            icon={Sparkles}
            text="JWT authentication keeps the dashboard secure and local credentials can be changed in backend/.env."
          />
          <NoteRow icon={Coffee} text="The menu seeds from the product images stored in frontend/public/products." />
        </div>
      </Panel>

      <Panel
        className="h-full min-h-0"
        subtitle="System"
        title="Cafe stack"
        action={
          <Badge className="border-white/70 bg-white/75 text-black/55" variant="outline">
            <BarChart3 className="size-3.5" />
            Local setup
          </Badge>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <InfoChip label="Frontend" value="Vite + Tailwind" />
          <InfoChip label="UI" value="shadcn components" />
          <InfoChip label="API" value="Express /api proxy" />
          <InfoChip label="Database" value="MongoDB localhost" />
        </div>

        <div className="mt-4 grid gap-3">
          <NoteRow icon={ShoppingBag} text={`Revenue today is ${money(metrics.revenueToday)}.`} />
          <NoteRow
            icon={TrendingUp}
            text={`Low stock items are currently at ${metrics.lowStock ?? 0}, so we can keep the bar stocked.`}
          />
          <NoteRow icon={Clock3} text="Everything runs on a single-screen admin shell for quick cafe operations." />
        </div>
      </Panel>
    </div>
  );
}

function LoadingOverlay() {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-[rgba(245,239,231,0.5)] backdrop-blur-sm">
      <div className="rounded-[2rem] border border-white/70 bg-white/80 px-6 py-5 shadow-[0_20px_60px_rgba(15,20,30,0.12)]">
        <div className="flex items-center gap-3">
          <RefreshCw className="size-5 animate-spin text-[#63422c]" />
          <p className="text-sm font-medium text-black/60">Refreshing dashboard...</p>
        </div>
      </div>
    </div>
  );
}

export default App;
