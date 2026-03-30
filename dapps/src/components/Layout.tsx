import { abbreviateAddress, useConnection } from "@evefrontier/dapp-kit";
import { useCurrentAccount } from "@mysten/dapp-kit-react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Hexagon } from "lucide-react";

export function Layout() {
  const { handleConnect, handleDisconnect } = useConnection();
  const account = useCurrentAccount();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-[100dvh] bg-eve-black text-eve-white flex flex-col relative overflow-hidden">
      {/* Dynamic Background Noise/Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-20 z-0" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(250, 250, 229, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      
      <header className="sticky top-0 z-50 w-full border-b border-eve-white/10 bg-eve-black/80 backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate("/")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="relative flex items-center justify-center w-8 h-8">
              <Hexagon className="absolute inset-0 w-full h-full text-eve-green group-hover:text-eve-white transition-colors duration-300" strokeWidth={1.5} />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-mono font-bold text-eve-green group-hover:text-eve-white transition-colors duration-300 text-sm">S</span>
            </div>
            <h1 className="font-mono text-xl tracking-[0.2em] font-bold">STARGAZER</h1>
          </motion.div>

          <div className="flex items-center gap-6">
            {account && (
              <button 
                onClick={() => navigate("/dashboard")}
                className={`font-mono text-sm tracking-widest transition-colors duration-300 hover:text-eve-white ${location.pathname === '/dashboard' ? 'text-eve-green' : 'text-eve-white/60'}`}
              >
                DASHBOARD
              </button>
            )}
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-2 font-mono text-xs tracking-widest uppercase border transition-all duration-300 ${
                account 
                  ? "bg-eve-white/5 border-eve-white/20 text-eve-white hover:bg-eve-white/10" 
                  : "bg-eve-white text-eve-black border-eve-white hover:bg-transparent hover:text-eve-white"
              }`}
              onClick={() => (account?.address ? handleDisconnect() : handleConnect())}
            >
              {account ? abbreviateAddress(account.address) : "INITIATE LINK"}
            </motion.button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 relative z-10 w-full max-w-[1400px] mx-auto pt-12 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
