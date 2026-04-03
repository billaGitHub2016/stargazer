import { useParams } from "react-router-dom";
import { useCurrentAccount, useDAppKit } from "@mysten/dapp-kit-react";
import { useConnection } from "@evefrontier/dapp-kit";
import { useState, useMemo } from "react";
import { useTollRule } from "../hooks/useTollRules";
import { decodeRuleId } from "../utils/shortLink";
import { PACKAGE_ID } from "../config/constants";
import { Transaction } from "@mysten/sui/transactions";
import { MIST_PER_SUI } from "@mysten/sui/utils";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { ShieldCheck, Zap, AlertTriangle, Fingerprint } from "lucide-react";

export function GatePayment() {
  const { ruleId: rawRuleId } = useParams();
  const account = useCurrentAccount();
  const { handleConnect } = useConnection();
  
  const { data: rule, isLoading } = useTollRule(rawRuleId);
  const { signAndExecuteTransaction } = useDAppKit();

  const [isPaying, setIsPaying] = useState(false);
  const [paid, setPaid] = useState(false);

  const handlePayToll = async () => {
    if (!rule || !account) return;
    setIsPaying(true);
    const toastId = toast.loading("Processing payment...");
    
    try {
      const tx = new Transaction();
      
      // Let the user pay the fee directly from their gas coin
      // The amount is automatically checked by the contract
      const feeAmountMist = tx.pure.u64(rule.feeAmount);
      
      // Instead of splitting a separate coin, we just pass a split of the gas coin
      // Sui Wallet and others handle this pattern natively
      const [paymentCoin] = tx.splitCoins(tx.gas, [feeAmountMist]);
        
        tx.moveCall({
          target: `${PACKAGE_ID}::stargazer::pay_toll_only`,
          arguments: [
            tx.object(rule.id),
            paymentCoin,
          ],
        });

      await signAndExecuteTransaction({ transaction: tx });
      toast.success("Payment successful! Jump Permit Issued.", { id: toastId });
      setPaid(true);
    } catch (e: any) {
      console.error('gate payment: ', e);
      toast.error(`Payment failed: ${e.message}`, { id: toastId });
    } finally {
      setIsPaying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-2 border-eve-green/20 border-t-eve-green rounded-full animate-spin" />
        <span className="font-mono text-xs tracking-widest text-eve-green animate-pulse">ESTABLISHING LINK...</span>
      </div>
    );
  }

  if (!rule) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-2" />
        <span className="font-mono text-lg tracking-widest text-red-500">NODE NOT FOUND</span>
        <span className="font-sans text-eve-white/50 text-sm">The requested stargate protocol does not exist or has been terminated.</span>
      </div>
    );
  }

  const feeInSui = Number(rule.feeAmount) / Number(MIST_PER_SUI);

  return (
    <div className="flex justify-center items-center min-h-[70vh]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[500px] w-full bg-[#0B0B0B] border border-eve-white/10 p-10 relative overflow-hidden group"
      >
        {/* Decorative corner brackets */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-eve-white/30" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-eve-white/30" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-eve-white/30" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-eve-white/30" />

        <div className="flex flex-col items-center gap-8 text-center relative z-10">
          <div className="flex flex-col items-center gap-2">
            <Zap className="w-8 h-8 text-eve-green mb-2" />
            <h2 className="text-xl font-mono font-bold tracking-[0.2em] text-eve-white uppercase">
              Stargate Toll
            </h2>
          </div>
          
          <div className="p-6 bg-eve-white/5 border border-eve-white/10 w-full relative">
            <span className="block mb-2 text-eve-white/50 text-[10px] font-mono uppercase tracking-widest">Target Protocol ID</span>
            <span className="text-eve-white break-all font-mono text-xs">{rule.id}</span>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-eve-white/50 text-xs font-mono uppercase tracking-widest">Required Transit Fee</span>
            <span className="font-bold text-4xl text-eve-green font-mono drop-shadow-[0_0_10px_rgba(189,255,0,0.3)]">
              {feeInSui} SUI
            </span>
          </div>

          {paid ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 bg-eve-green/10 border border-eve-green/30 w-full flex flex-col items-center gap-3"
            >
              <ShieldCheck className="w-8 h-8 text-eve-green" />
              <span className="text-eve-green font-bold tracking-widest font-mono text-sm">PAYMENT SUCCESSFUL</span>
              <span className="block text-eve-white/70 text-xs font-sans mt-2">
                Jump permit has been issued. You may now proceed through the gate.
              </span>
            </motion.div>
          ) : (
            <div className="w-full mt-4">
              {!account ? (
                <button 
                  className="w-full h-14 bg-eve-white text-eve-black font-mono text-xs tracking-widest font-bold uppercase hover:bg-eve-white/90 transition-colors flex items-center justify-center gap-2"
                  onClick={() => handleConnect()}
                >
                  <Fingerprint className="w-4 h-4" />
                  AUTHENTICATE WALLET
                </button>
              ) : (
                <button 
                  disabled={isPaying}
                  className={`w-full h-14 font-mono text-xs tracking-widest font-bold uppercase transition-all duration-300 flex items-center justify-center gap-2 ${
                    isPaying 
                      ? "bg-eve-white/10 text-eve-white/50 cursor-not-allowed" 
                      : "bg-eve-green text-eve-black hover:shadow-[0_0_20px_rgba(189,255,0,0.3)]"
                  }`}
                  onClick={handlePayToll}
                >
                  {isPaying ? "PROCESSING TRANSACTION..." : `PAY ${feeInSui} SUI`}
                </button>
              )}
            </div>
          )}

          <span className="mt-4 text-eve-white/30 text-[10px] font-mono tracking-widest">
            POWERED BY STARGAZER NETWORK
          </span>
        </div>
      </motion.div>
    </div>
  );
}
