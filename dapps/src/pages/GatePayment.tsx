import { useParams } from "react-router-dom";
import { useCurrentAccount, useDAppKit } from "@mysten/dapp-kit-react";
import { useConnection, useSmartObject } from "@evefrontier/dapp-kit";
import { useState, useMemo } from "react";
import { useTollRule } from "../hooks/useTollRules";
import { PACKAGE_ID } from "../config/constants";
import { Transaction } from "@mysten/sui/transactions";
import { MIST_PER_SUI } from "@mysten/sui/utils";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Zap,
  AlertTriangle,
  Fingerprint,
  Copy,
  RefreshCw,
} from "lucide-react";

export function GatePayment() {
  const { ruleId: rawRuleId } = useParams();
  const account = useCurrentAccount();
  const { handleConnect } = useConnection();

  const { data: rule, isLoading, isFetching, refetch } = useTollRule(rawRuleId);
  const { assembly: currentGateAssembly, loading: isGateLoading } =
    useSmartObject();
  const { signAndExecuteTransaction } = useDAppKit();

  const [isPaying, setIsPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [characterIdInput, setCharacterIdInput] = useState("");

  const formatObjectId = (id: string) => {
    const clean = id?.trim?.() ?? "";
    if (clean.length <= 16) return clean;
    return `${clean.slice(0, 10)}...${clean.slice(-6)}`;
  };

  const ruleObjectUrl = useMemo(() => {
    if (!rule) return null;
    return `https://suiscan.xyz/testnet/object/${rule.id}`;
  }, [rule]);

  const sourceGateObjectUrl = useMemo(() => {
    if (!rule) return null;
    return `https://suiscan.xyz/testnet/object/${rule.sourceGateId}`;
  }, [rule]);

  const destinationGateObjectUrl = useMemo(() => {
    if (!rule) return null;
    return `https://suiscan.xyz/testnet/object/${rule.destinationGateId}`;
  }, [rule]);

  const currentGateId = currentGateAssembly?.id;

  const directionText = useMemo(() => {
    if (!rule || !currentGateId) return null;
    if (currentGateId === rule.sourceGateId) return "Gate1 → Gate2";
    if (currentGateId === rule.destinationGateId) return "Gate2 → Gate1";
    return null;
  }, [currentGateId, rule]);

  const isGateMismatch = !!rule && !!currentGateId && !directionText;

  const handlePayToll = async () => {
    if (!rule || !account) return;
    if (isGateMismatch) {
      toast.error(`The current star gate does not belong to the rule ${rawRuleId} and cannot sell tickets.`);
      return;
    }
    if (!characterIdInput.trim()) {
      toast.error("Please enter your Character ID");
      return;
    }

    setIsPaying(true);
    const toastId = toast.loading("Processing payment...");

    try {
      const tx = new Transaction();

      const feeAmountMist = tx.pure.u64(rule.feeAmount);
      const [paymentCoin] = tx.splitCoins(tx.gas, [feeAmountMist]);

      tx.moveCall({
        target: `${PACKAGE_ID}::stargazer::pay_toll_and_jump`,
        arguments: [
          tx.object(rule.id),
          paymentCoin,
          tx.object(rule.sourceGateId),
          tx.object(rule.destinationGateId),
          tx.object(characterIdInput.trim()),
          tx.object("0x6"), // The Sui System Clock object ID is 0x6
        ],
      });

      await signAndExecuteTransaction({ transaction: tx });
      toast.success("Payment successful! Jump Permit Issued.", { id: toastId });
      setPaid(true);
    } catch (e: any) {
      console.error("gate payment: ", e);
      toast.error(`Payment failed: ${e.message}`, { id: toastId });
    } finally {
      setIsPaying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-2 border-eve-green/20 border-t-eve-green rounded-full animate-spin" />
        <span className="font-mono text-xs tracking-widest text-eve-green animate-pulse">
          ESTABLISHING LINK...
        </span>
      </div>
    );
  }

  if (!rule) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-2" />
        <span className="font-mono text-lg tracking-widest text-red-500">
          NODE NOT FOUND
        </span>
        <span className="font-sans text-eve-white/50 text-sm">
          The requested stargate protocol does not exist or has been terminated.
        </span>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className={`mt-2 inline-flex items-center gap-2 px-6 py-3 font-mono text-xs tracking-widest uppercase border transition-all ${
            isFetching
              ? "border-eve-white/10 text-eve-white/30 cursor-not-allowed"
              : "border-eve-white/20 text-eve-white/80 hover:bg-eve-white/5 hover:border-eve-white"
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          {isFetching ? "REFRESHING..." : "REFRESH DATA"}
        </button>
        <span className="font-sans text-eve-white/40 text-xs">
          Click refresh to retry fetching the protocol data.
        </span>
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

          <div className="p-6 bg-eve-white/5 border border-eve-white/10 w-full relative space-y-5">
            <div className="flex flex-row align-center">
              <div className="flex items-center justify-between mt-0">
                <span className="block text-eve-white/60 mb-0 text-xs font-mono uppercase tracking-widest mr-2">
                  Target Protocol ID:
                </span>
              </div>
              <div className="flex items-start justify-start mt-0">
                <a
                  href={ruleObjectUrl ?? undefined}
                  target="_blank"
                  rel="noreferrer"
                  className="text-eve-white break-all font-mono text-xs hover:text-eve-green transition-colors"
                  title="View on Suiscan"
                >
                  {formatObjectId(rule.id)}
                </a>
                <Copy
                  className="w-4 h-4 ml-2 cursor-pointer hover:text-eve-green transition-colors"
                  onClick={async (e) => {
                    try {
                      e.stopPropagation();
                      e.preventDefault();
                      await navigator.clipboard.writeText(rule.id);
                      toast.success("Rule ID copied to clipboard!");
                    } catch (e: any) {
                      toast.error(
                        `Copy failed: ${e?.message ?? "unknown error"}`,
                      );
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex flex-row align-center">
              <div className="flex items-center justify-between mt-0">
                <span className="block text-eve-white/60 mb-0 text-xs font-mono uppercase tracking-widest mr-2">
                  Ticket Direction:
                </span>
              </div>
              <div className="flex items-start justify-start mt-0">
                <span className="text-eve-white break-all font-mono text-xs mb-0">
                  {isGateLoading && !currentGateId
                    ? "Detecting current gate..."
                    : directionText ?? "Unknown"}
                </span>
              </div>
            </div>

            <div className="flex flex-row align-center">
              <div className="flex items-center justify-between mt-0">
                <span className="block text-eve-white/60 mb-0 text-xs font-mono uppercase tracking-widest mr-2">
                  Description:
                </span>
              </div>
              <div className="flex items-start justify-start mt-0">
                <span className="text-eve-white break-all font-mono text-xs mb-0">
                  {rule.description?.trim()
                    ? rule.description
                    : "No description provided."}
                </span>
              </div>
            </div>

            <div className="flex flex-row align-center">
              <div className="flex items-center justify-between mt-0">
                <span className="block text-eve-white/60 mb-0 text-xs font-mono uppercase tracking-widest mr-2">
                  Gate1 ID:
                </span>
              </div>
              <div className="flex items-start justify-start mt-0">
                <a
                  href={sourceGateObjectUrl ?? undefined}
                  target="_blank"
                  rel="noreferrer"
                  className="text-eve-white break-all font-mono text-xs hover:text-eve-green transition-colors"
                  title="View on Suiscan"
                >
                  {formatObjectId(rule.sourceGateId)}
                </a>
                <Copy
                  className="w-4 h-4 ml-2 cursor-pointer hover:text-eve-green transition-colors"
                  onClick={async (e) => {
                    try {
                      e.stopPropagation();
                      e.preventDefault();
                      await navigator.clipboard.writeText(rule.sourceGateId);
                      toast.success("Gate1 ID copied!");
                    } catch (e: any) {
                      toast.error(
                        `Copy failed: ${e?.message ?? "unknown error"}`,
                      );
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex flex-row align-center">
              <div className="flex items-center justify-between mt-0">
                <span className="block text-eve-white/60 mb-0 text-xs font-mono uppercase tracking-widest mr-2">
                  Gate2 ID:
                </span>
              </div>
              <div className="flex items-start justify-start mt-0">
                <a
                  href={destinationGateObjectUrl ?? undefined}
                  target="_blank"
                  rel="noreferrer"
                  className="text-eve-white break-all font-mono text-xs hover:text-eve-green transition-colors"
                  title="View on Suiscan"
                >
                  {formatObjectId(rule.destinationGateId)}
                </a>
                <Copy
                  className="w-4 h-4 ml-2 cursor-pointer hover:text-eve-green transition-colors"
                  onClick={async (e) => {
                    try {
                      e.stopPropagation();
                      e.preventDefault();
                      await navigator.clipboard.writeText(
                        rule.destinationGateId,
                      );
                      toast.success("Gate2 ID copied!");
                    } catch (e: any) {
                      toast.error(
                        `Copy failed: ${e?.message ?? "unknown error"}`,
                      );
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-eve-white/50 text-xs font-mono uppercase tracking-widest">
              Required Transit Fee
            </span>
            <span className="font-bold text-4xl text-eve-green font-mono drop-shadow-[0_0_10px_rgba(189,255,0,0.3)]">
              {feeInSui} SUI
            </span>
          </div>

          <div className="w-full flex flex-col gap-3">
            <label className="text-xs font-mono tracking-widest text-eve-white/80 uppercase text-left">
              Traveler Character ID <span className="text-eve-orange">*</span>
            </label>
            <input
              type="text"
              value={characterIdInput}
              onChange={(e) => setCharacterIdInput(e.target.value)}
              placeholder="0x..."
              className="w-full bg-black/50 border border-eve-white/20 text-eve-white font-mono text-sm p-4 focus:outline-none focus:border-eve-green transition-colors"
            />
          </div>

          {isGateMismatch && (
            <div className="w-full p-4 border border-red-500/30 bg-red-500/10 text-left">
              <span className="text-red-400 text-xs font-mono tracking-widest">
                The current star gate does not belong to the rule {rawRuleId}. Cannot sell tickets.
              </span>
            </div>
          )}

          {paid ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 bg-eve-green/10 border border-eve-green/30 w-full flex flex-col items-center gap-3"
            >
              <ShieldCheck className="w-8 h-8 text-eve-green" />
              <span className="text-eve-green font-bold tracking-widest font-mono text-sm">
                PAYMENT SUCCESSFUL
              </span>
              <span className="block text-eve-white/70 text-xs font-sans mt-2">
                Jump permit has been issued. You may now proceed through the
                gate.
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
                  disabled={isPaying || isGateMismatch}
                  className={`w-full h-14 font-mono text-xs tracking-widest font-bold uppercase transition-all duration-300 flex items-center justify-center gap-2 ${
                    isPaying || isGateMismatch
                      ? "bg-eve-white/10 text-eve-white/50 cursor-not-allowed"
                      : "bg-eve-green text-eve-black hover:shadow-[0_0_20px_rgba(189,255,0,0.3)]"
                  }`}
                  onClick={handlePayToll}
                >
                  {isPaying
                    ? "PROCESSING TRANSACTION..."
                    : `PAY ${feeInSui} SUI`}
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
