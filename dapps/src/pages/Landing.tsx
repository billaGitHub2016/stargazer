import { useNavigate } from "react-router-dom";
import { useCurrentAccount } from "@mysten/dapp-kit-react";
import { useConnection } from "@evefrontier/dapp-kit";
import { motion } from "framer-motion";
import { ArrowRight, Globe } from "lucide-react";

export function Landing() {
  const navigate = useNavigate();
  const account = useCurrentAccount();
  const { handleConnect } = useConnection();

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] text-center relative w-full">
      {/* Cinematic ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] h-[800px] bg-eve-green/5 blur-[120px] rounded-full pointer-events-none z-[-1]" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="mb-6 inline-flex items-center gap-2 px-4 py-3 border border-eve-green/30 bg-eve-green/10 rounded-full text-eve-green text-xs font-mono tracking-widest"
      >
        <Globe className="w-3 h-3" />
        <span className="mb-0">EVE FRONTIER NETWORK ACTIVE</span>
      </motion.div>

      <motion.h1 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-5xl md:text-7xl font-mono font-bold tracking-[0.1em] text-eve-white uppercase mb-6 leading-tight drop-shadow-[0_0_15px_rgba(250,250,229,0.3)]"
      >
        Control Your<br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-eve-white via-eve-white to-eve-white/50">
          Frontier
        </span>
      </motion.h1>
      
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.4 }}
        className="text-lg md:text-xl text-eve-white/70 max-w-2xl mb-12 font-sans leading-relaxed"
      >
        Seize any advantage to survive and rebuild civilization. 
        Stargazer allows you to set up smart toll rules for your Stargates in EVE Frontier.
        Monetize your territory, control the flow, and rule the stars.
      </motion.p>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
      >
        {account ? (
          <button 
            className="group relative px-8 py-4 bg-eve-white text-eve-black font-mono text-sm tracking-widest font-bold uppercase transition-all duration-300 hover:shadow-[0_0_30px_rgba(250,250,229,0.3)] overflow-hidden"
            onClick={() => navigate("/dashboard")}
          >
            <span className="relative z-10 flex items-center gap-2">
              ENTER DASHBOARD
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0" />
          </button>
        ) : (
          <button 
            className="group relative px-8 py-4 bg-eve-white text-eve-black font-mono text-sm tracking-widest font-bold uppercase transition-all duration-300 hover:shadow-[0_0_30px_rgba(250,250,229,0.3)] overflow-hidden"
            onClick={() => handleConnect()}
          >
            <span className="relative z-10 flex items-center gap-2">
              BECOME A FOUNDER
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0" />
          </button>
        )}
      </motion.div>
      
      {/* Decorative tech elements */}
      <div className="absolute bottom-0 left-0 w-32 h-32 border-l border-b border-eve-white/10" />
      <div className="absolute top-0 right-0 w-32 h-32 border-r border-t border-eve-white/10" />
      <div className="absolute top-20 left-10 font-mono text-[10px] text-eve-white/20 tracking-widest">
        SYS.REQ // 0x8CFB...C7A2<br/>
        STATUS  // ONLINE
      </div>
    </div>
  );
}
