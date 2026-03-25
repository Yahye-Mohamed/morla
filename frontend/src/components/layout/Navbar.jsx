import { ShoppingCart, UserRound } from "lucide-react";
import brandMark from "@/assets/morla-mark.svg";
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
import { navigationLinks } from "@/data/navigation";

const iconButtonClass =
  "size-11 rounded-full border border-black/5 bg-white/72 text-[#111111] shadow-[0_12px_28px_rgba(0,0,0,0.08)] transition hover:-translate-y-0.5 hover:bg-white";

function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 rounded-full border border-black/5 bg-white/58 px-4 py-3 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur-2xl sm:px-5">
        <a className="flex items-center gap-3" href="#home">
          <span className="flex size-11 items-center justify-center rounded-full bg-white/75 shadow-[0_12px_28px_rgba(0,0,0,0.08)]">
            <img alt="Morla Cafe logo" className="size-9 rounded-full object-cover" src={brandMark} />
          </span>
        </a>

        <div className="flex items-center gap-2 sm:gap-2.5">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                aria-label="Open navigation menu"
                className="h-11 rounded-full border border-black/5 bg-white/72 px-5 text-sm font-semibold tracking-[0.14em] text-[#111111] shadow-[0_12px_28px_rgba(0,0,0,0.08)] transition hover:-translate-y-0.5 hover:bg-white"
                variant="ghost"
              >
                Home
              </Button>
            </SheetTrigger>

            <SheetContent className="rounded-l-[2rem] bg-[#fffdf9] px-6 py-16 sm:px-8">
              <SheetHeader className="gap-4">
                <SheetTitle className="text-[#111111]">Morla Cafe</SheetTitle>
              <SheetDescription>Open the one-page home section.</SheetDescription>
              </SheetHeader>

              <nav aria-label="Mobile navigation" className="mt-10 grid gap-3">
                {navigationLinks.map((link) => (
                  <SheetClose asChild key={link.href}>
                    <a
                      className="rounded-[1.6rem] border border-black/5 bg-white px-5 py-4 text-base font-semibold text-[#111111] transition hover:-translate-y-0.5 hover:bg-black/5"
                      href={link.href}
                    >
                      {link.label}
                    </a>
                  </SheetClose>
                ))}
              </nav>

            </SheetContent>
          </Sheet>

          <Button aria-label="Cart" className={iconButtonClass} size="icon" type="button" variant="ghost">
            <ShoppingCart className="size-5" />
            <span className="sr-only">Cart</span>
          </Button>

          <Button aria-label="Profile" className={iconButtonClass} size="icon" type="button" variant="ghost">
            <UserRound className="size-5" />
            <span className="sr-only">Profile</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
