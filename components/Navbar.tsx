"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/button";
import Image from "next/image";

export const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="rounded-full">
            <Image src="/images/logo.png" alt="Logo" width={20} height={20} className="rounded-full sm:w-6 sm:h-6" />
          </div>
          <span className="font-bold text-sm sm:text-lg tracking-tight">
            MANTLEX<span className="opacity-50 font-normal hidden sm:inline">.perp</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-3">
          <ThemeToggle />
          <ConnectButton.Custom>
            {({
              account,
              chain,
              openAccountModal,
              openConnectModal,
              authenticationStatus,
              mounted,
            }) => {
              const ready = mounted && authenticationStatus !== "loading";
              const connected =
                ready &&
                account &&
                chain &&
                (!authenticationStatus || authenticationStatus === "authenticated");

              return (
                <div
                  {...(!ready && {
                    "aria-hidden": true,
                    style: {
                      opacity: 0,
                      pointerEvents: "none",
                      userSelect: "none",
                    },
                  })}
                >
                  {(() => {
                    if (!connected) {
                      return (
                        <Button
                          onClick={openConnectModal}
                          className="font-mono text-xs sm:text-sm cursor-pointer px-3 sm:px-4"
                        >
                          <span className="hidden sm:inline">Connect Wallet</span>
                          <span className="sm:hidden">Connect</span>
                        </Button>
                      );
                    }

                    if (chain.unsupported) {
                      return (
                        <Button
                          variant="destructive"
                          className="font-mono text-xs sm:text-sm cursor-pointer"
                        >
                          <span className="hidden sm:inline">Wrong network</span>
                          <span className="sm:hidden">Wrong net</span>
                        </Button>
                      );
                    }

                    return (
                      <div className="flex gap-1 sm:gap-2">
                        <Button
                          variant="outline"
                          className="font-mono text-xs px-2 py-1 h-auto cursor-pointer hidden sm:flex"
                        >
                          {chain.hasIcon && (
                            <div
                              style={{
                                background: chain.iconBackground,
                                width: 12,
                                height: 12,
                                borderRadius: 999,
                                overflow: "hidden",
                                marginRight: 4,
                              }}
                            >
                              {chain.iconUrl && (
                                <img
                                  alt={chain.name ?? "Chain icon"}
                                  src={chain.iconUrl}
                                  style={{ width: 12, height: 12 }}
                                />
                              )}
                            </div>
                          )}
                          {chain.name}
                        </Button>

                        <Button
                          onClick={openAccountModal}
                          variant="outline"
                          className="font-mono text-xs cursor-pointer px-2 sm:px-3"
                        >
                          <span className="hidden sm:inline">{account.displayName}</span>
                          <span className="sm:hidden">{account.address.slice(0, 4)}...{account.address.slice(-3)}</span>
                        </Button>
                      </div>
                    );
                  })()}
                </div>
              );
            }}
          </ConnectButton.Custom>
        </div>
      </div>
    </nav>
  );
};
