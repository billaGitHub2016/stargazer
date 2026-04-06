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
    <div className="flex flex-col items-center min-h-[75vh] text-center relative w-full">
      {/* Cinematic ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] h-[800px] bg-eve-green/5 blur-[120px] rounded-full pointer-events-none z-[-1]" />

      <div className="w-full max-w-6xl px-6 pt-20 pb-16 flex flex-col items-center justify-center">
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
          Build Smart Tolls<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-eve-white via-eve-white to-eve-white/50">
            For Stargates
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="text-lg md:text-xl text-eve-white/70 max-w-3xl mb-10 font-sans leading-relaxed"
        >
          Create a Stargate toll rule without writing code. Set a transit fee and
          generate a ready-to-use payment dapp in one click—then bind it to your
          Stargate inside EVE Frontier and start collecting fees.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
        >
          {account ? (
            <button
              className="group relative px-8 py-4 bg-eve-white text-eve-black font-mono text-sm tracking-widest font-bold uppercase transition-all duration-300 hover:shadow-[0_0_30px_rgba(189,255,0,0.3)] overflow-hidden"
              onClick={() => navigate("/dashboard")}
            >
              <span className="relative z-10 flex items-center gap-2 text-eve-black group-hover:text-eve-black transition-colors duration-300">
                ENTER DASHBOARD
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-eve-green translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0" />
            </button>
          ) : (
            <button
              className="group relative px-8 py-4 bg-eve-white text-eve-black font-mono text-sm tracking-widest font-bold uppercase transition-all duration-300 hover:shadow-[0_0_30px_rgba(189,255,0,0.3)] overflow-hidden"
              onClick={() => handleConnect()}
            >
              <span className="relative z-10 flex items-center gap-2 text-eve-black group-hover:text-eve-black transition-colors duration-300">
                CONNECT WALLET
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-eve-green translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0" />
            </button>
          )}
        </motion.div>
      </div>

      <div className="w-full max-w-6xl px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full border border-eve-white/10 bg-eve-white/5 backdrop-blur-sm"
        >
          <div className="px-8 py-8 border-b border-eve-white/10">
            <div className="flex items-center justify-between gap-6 flex-col md:flex-row">
              <div className="text-left w-full">
                <div className="text-eve-white/50 font-mono text-xs tracking-widest mb-2">
                  QUICK START
                </div>
                <h2 className="text-eve-white font-mono text-2xl md:text-3xl tracking-[0.08em] uppercase mb-3">
                  How to Sell a Stargate Ticket
                </h2>
                <p className="text-eve-white/70 font-sans text-sm md:text-base leading-relaxed max-w-2xl">
                  Follow these steps to create a toll rule, share a payment link,
                  and sell tickets at the correct gate in-game.
                </p>
              </div>
              <div className="w-full md:w-[360px] aspect-[16/9] border border-eve-white/15 bg-black/30 flex items-center justify-center">
                <span className="text-eve-white/30 font-mono text-xs tracking-widest">
                  IMAGE PLACEHOLDER
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-eve-white/10">
            <div className="p-8 text-left">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 border border-eve-white/15 flex items-center justify-center font-mono text-eve-white/70 text-xs tracking-widest">
                  01
                </div>
                <div className="flex-1">
                  <div className="text-eve-white font-mono text-sm tracking-widest uppercase mb-2">
                    Create a Rule
                  </div>
                  <div className="text-eve-white/70 font-sans text-sm leading-relaxed">
                    Choose Gate 1 and Gate 2, set the transit fee, and publish the
                    toll rule to the network from the dashboard.
                  </div>
                </div>
              </div>
              <div className="mt-6 w-full aspect-[16/9] border border-eve-white/10 bg-black/30 flex items-center justify-center">
                <span className="text-eve-white/20 font-mono text-[10px] tracking-widest">
                  SCREENSHOT PLACEHOLDER
                </span>
              </div>
            </div>

            <div className="p-8 text-left">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 border border-eve-white/15 flex items-center justify-center font-mono text-eve-white/70 text-xs tracking-widest">
                  02
                </div>
                <div className="flex-1">
                  <div className="text-eve-white font-mono text-sm tracking-widest uppercase mb-2">
                    Share the Link
                  </div>
                  <div className="text-eve-white/70 font-sans text-sm leading-relaxed">
                    Copy the short payment link and send it to travelers. They can
                    open it directly to pay for the next transit.
                  </div>
                </div>
              </div>
              <div className="mt-6 w-full aspect-[16/9] border border-eve-white/10 bg-black/30 flex items-center justify-center">
                <span className="text-eve-white/20 font-mono text-[10px] tracking-widest">
                  SCREENSHOT PLACEHOLDER
                </span>
              </div>
            </div>

            <div className="p-8 text-left">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 border border-eve-white/15 flex items-center justify-center font-mono text-eve-white/70 text-xs tracking-widest">
                  03
                </div>
                <div className="flex-1">
                  <div className="text-eve-white font-mono text-sm tracking-widest uppercase mb-2">
                    Sell at the Right Gate
                  </div>
                  <div className="text-eve-white/70 font-sans text-sm leading-relaxed">
                    Open the payment page while standing at Gate 1 or Gate 2. The
                    page detects your current gate context and locks payment if the
                    rule does not match.
                  </div>
                </div>
              </div>
              <div className="mt-6 w-full aspect-[16/9] border border-eve-white/10 bg-black/30 flex items-center justify-center">
                <span className="text-eve-white/20 font-mono text-[10px] tracking-widest">
                  SCREENSHOT PLACEHOLDER
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
          className="mt-8 w-full border border-eve-white/10 bg-eve-white/5 backdrop-blur-sm"
        >
          <div className="px-8 py-8 border-b border-eve-white/10 text-left">
            <div className="text-eve-white/50 font-mono text-xs tracking-widest mb-2">
              UNDER THE HOOD
            </div>
            <h2 className="text-eve-white font-mono text-2xl md:text-3xl tracking-[0.08em] uppercase mb-3">
              Simple Architecture
            </h2>
            <p className="text-eve-white/70 font-sans text-sm md:text-base leading-relaxed max-w-3xl">
              Stargazer works by pairing a published toll rule with in-game context.
              When a player opens a payment link from the EVE Frontier client, the
              app reads the current Stargate from the client context, verifies it
              matches the rule’s Gate 1 / Gate 2, and only then allows payment.
            </p>
          </div>
          <div className="px-8 py-8 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="border border-eve-white/10 bg-black/30 p-6">
                <div className="text-eve-white font-mono text-xs tracking-widest uppercase mb-3">
                  Rule Data
                </div>
                <div className="text-eve-white/70 font-sans text-sm leading-relaxed">
                  Rules define Gate 1, Gate 2, description, fee, and a vault that
                  accumulates the collected tolls. The dashboard reads rules and
                  lets you create, edit, withdraw, or delete them.
                </div>
              </div>
              <div className="border border-eve-white/10 bg-black/30 p-6">
                <div className="text-eve-white font-mono text-xs tracking-widest uppercase mb-3">
                  Client Context Verification
                </div>
                <div className="text-eve-white/70 font-sans text-sm leading-relaxed">
                  The payment page uses the EVE Frontier dapp context to resolve
                  the player’s current Stargate. It determines direction (Gate 1 →
                  Gate 2 or Gate 2 → Gate 1) and blocks payment if the context does
                  not match the rule.
                </div>
              </div>
            </div>

            <div className="mt-8 w-full aspect-[21/9] border border-eve-white/10 bg-black/30 flex items-center justify-center">
              <span className="text-eve-white/20 font-mono text-[10px] tracking-widest">
                DIAGRAM PLACEHOLDER
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 w-32 h-32 border-l border-b border-eve-white/10" />
      <div className="absolute top-0 right-0 w-32 h-32 border-r border-t border-eve-white/10" />
      <div className="absolute top-20 left-10 font-mono text-[10px] text-eve-white/20 tracking-widest">
        SYS.REQ // 0x8CFB...C7A2<br />
        STATUS  // ONLINE
      </div>
    </div>
  );
}
