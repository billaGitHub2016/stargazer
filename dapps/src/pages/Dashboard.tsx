import { useCurrentAccount, useDAppKit } from "@mysten/dapp-kit-react";
import { Transaction } from "@mysten/sui/transactions";
import { useState } from "react";
import { useTollRules } from "../hooks/useTollRules";
import { encodeRuleId } from "../utils/shortLink";
import { PACKAGE_ID } from "../config/constants";
import { MIST_PER_SUI } from "@mysten/sui/utils";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Plus, Edit2, Wallet, ExternalLink, Settings, ShieldAlert, Link2 } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";

export function Dashboard() {
  const account = useCurrentAccount();
  const { data: rules = [], isLoading, refetch } = useTollRules();
  const { signAndExecuteTransaction } = useDAppKit();

  const [newFee, setNewFee] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState("");
  const [editFee, setEditFee] = useState("");

  if (!account) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4 text-center p-8 border border-eve-white/10 bg-eve-white/5 backdrop-blur-md rounded-lg"
        >
          <ShieldAlert className="w-12 h-12 text-eve-white/50 mb-2" />
          <span className="font-mono text-xl tracking-[0.2em] text-eve-white">
            AUTHENTICATION REQUIRED
          </span>
          <span className="text-eve-white/60 font-sans text-sm">
            Please connect your EVE wallet to access the control panel.
          </span>
        </motion.div>
      </div>
    );
  }

  const handleCreateRule = async () => {
    if (!newFee || isNaN(Number(newFee))) return;
    setIsProcessing(true);
    const toastId = toast.loading("Creating new rule...");
    
    try {
      const tx = new Transaction();
      const feeInMist = BigInt(Math.floor(Number(newFee) * Number(MIST_PER_SUI)));
      
      tx.moveCall({
        target: `${PACKAGE_ID}::stargazer::create_rule`,
        arguments: [tx.pure.u64(feeInMist)],
      });

      await signAndExecuteTransaction({ transaction: tx });
      toast.success("Rule created! It may take a few seconds to appear.", { id: toastId });
      setNewFee("");
      setIsCreating(false);
      refetch();
    } catch (e: any) {
      console.error(e);
      toast.error(`Error: ${e.message.slice(0, 50)}...`, { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateFee = async () => {
    if (!editFee || isNaN(Number(editFee)) || !editingRuleId) return;

    setIsProcessing(true);
    const toastId = toast.loading("Updating rule fee...");

    try {
      const tx = new Transaction();
      const feeInMist = BigInt(Math.floor(Number(editFee) * Number(MIST_PER_SUI)));
      
      tx.moveCall({
        target: `${PACKAGE_ID}::stargazer::update_rule`,
        arguments: [
          tx.object(editingRuleId),
          tx.pure.u64(feeInMist)
        ],
      });

      await signAndExecuteTransaction({ transaction: tx });
      toast.success("Fee updated successfully!", { id: toastId });
      setIsEditOpen(false);
      refetch();
    } catch (e: any) {
      console.error(e);
      toast.error(`Error: ${e.message.slice(0, 50)}...`, { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWithdraw = async (ruleId: string) => {
    if (!account) return;
    const toastId = toast.loading("Withdrawing tolls...");

    try {
      const tx = new Transaction();
      
      const coin = tx.moveCall({
        target: `${PACKAGE_ID}::stargazer::withdraw_tolls`,
        arguments: [tx.object(ruleId)],
      });

      tx.transferObjects([coin], tx.pure.address(account.address));

      await signAndExecuteTransaction({ transaction: tx });
      toast.success("Tolls withdrawn successfully!", { id: toastId });
      refetch();
    } catch (e: any) {
      console.error(e);
      toast.error(`Error: ${e.message.slice(0, 50)}...`, { id: toastId });
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8 border-b border-eve-white/10 pb-6">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-eve-green" />
          <h2 className="text-xl font-mono font-bold tracking-widest text-eve-white uppercase">
            Stargate Control
          </h2>
        </div>
        
        <Dialog.Root open={isCreating} onOpenChange={setIsCreating}>
          <Dialog.Trigger asChild>
            <button 
              className="flex items-center gap-2 px-6 py-3 bg-eve-white text-eve-black font-mono text-xs tracking-widest font-bold uppercase transition-all duration-300 hover:shadow-[0_0_20px_rgba(250,250,229,0.2)] hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => setIsCreating(true)}
            >
              <Plus className="w-4 h-4" />
              CREATE NEW RULE
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-6 border border-eve-white/20 bg-[#0B0B0B] p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            <div className="flex flex-col gap-2">
              <Dialog.Title className="text-xl font-mono font-bold tracking-widest text-eve-white uppercase border-b border-eve-white/10 pb-4">
                Initialize Protocol
              </Dialog.Title>
              <Dialog.Description className="text-sm text-eve-white/60 mt-2 font-sans">
                Define the required SUI transit fee for this stargate network node.
              </Dialog.Description>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-xs font-mono tracking-widest text-eve-white/80 uppercase">
                Transit Fee (SUI)
              </label>
              <div className="relative">
                <input 
                  type="number"
                  value={newFee}
                  onChange={(e) => setNewFee(e.target.value)}
                  placeholder="0.00" 
                  className="w-full bg-black/50 border border-eve-white/20 text-eve-white font-mono text-lg p-4 focus:outline-none focus:border-eve-green transition-colors"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-eve-white/30 font-mono text-sm">SUI</div>
              </div>
            </div>

              <div className="flex gap-4 mt-4 justify-end">
                <button 
                  className="px-6 py-3 border border-eve-white/20 text-eve-white/80 font-mono text-xs tracking-widest hover:bg-eve-white/5 transition-colors"
                  onClick={() => setIsCreating(false)}
                >
                  ABORT
                </button>
                <button 
                  disabled={isProcessing} 
                  onClick={handleCreateRule} 
                  className={`px-8 py-3 font-mono text-xs font-bold tracking-widest uppercase transition-all duration-300 ${
                    isProcessing 
                      ? "bg-eve-white/20 text-eve-white/50 cursor-not-allowed" 
                      : "bg-eve-green text-eve-black hover:shadow-[0_0_20px_rgba(189,255,0,0.3)]"
                  }`}
                >
                  {isProcessing ? "INITIALIZING..." : "CONFIRM"}
                </button>
              </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      </div>

        <Dialog.Root open={isEditOpen} onOpenChange={setIsEditOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-6 border border-eve-white/20 bg-[#0B0B0B] p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            <div className="flex flex-col gap-2">
              <Dialog.Title className="text-xl font-mono font-bold tracking-widest text-eve-white uppercase border-b border-eve-white/10 pb-4">
                Modify Protocol
              </Dialog.Title>
              <Dialog.Description className="text-sm text-eve-white/60 mt-2 font-sans">
                Update the transit fee for this node.
              </Dialog.Description>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-xs font-mono tracking-widest text-eve-white/80 uppercase">
                New Transit Fee (SUI)
              </label>
              <div className="relative">
                <input 
                  type="number"
                  value={editFee}
                  onChange={(e) => setEditFee(e.target.value)}
                  placeholder="0.00" 
                  className="w-full bg-black/50 border border-eve-white/20 text-eve-white font-mono text-lg p-4 focus:outline-none focus:border-eve-green transition-colors"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-eve-white/30 font-mono text-sm">SUI</div>
              </div>
            </div>

              <div className="flex gap-4 mt-4 justify-end">
                <button 
                  className="px-6 py-3 border border-eve-white/20 text-eve-white/80 font-mono text-xs tracking-widest hover:bg-eve-white/5 transition-colors"
                  onClick={() => setIsEditOpen(false)}
                >
                  ABORT
                </button>
                <button 
                  disabled={isProcessing} 
                  onClick={handleUpdateFee} 
                  className={`px-8 py-3 font-mono text-xs font-bold tracking-widest uppercase transition-all duration-300 ${
                    isProcessing 
                      ? "bg-eve-white/20 text-eve-white/50 cursor-not-allowed" 
                      : "bg-eve-green text-eve-black hover:shadow-[0_0_20px_rgba(189,255,0,0.3)]"
                  }`}
                >
                  {isProcessing ? "UPDATING..." : "CONFIRM"}
                </button>
              </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

        {isLoading ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 border border-eve-white/10 bg-eve-white/5 backdrop-blur-sm"
        >
          <div className="w-12 h-12 border-2 border-eve-green/20 border-t-eve-green rounded-full animate-spin mb-4" />
          <span className="font-mono text-xs tracking-widest text-eve-green animate-pulse">SCANNING NETWORK...</span>
        </motion.div>
      ) : rules.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 border border-eve-white/10 bg-eve-white/5 backdrop-blur-sm"
        >
          <div className="w-16 h-16 border border-eve-white/20 rounded-full flex items-center justify-center mb-4">
            <span className="text-eve-white/50 font-mono">00</span>
          </div>
          <span className="text-eve-white/50 font-mono tracking-[0.2em] text-sm">
            NO PROTOCOLS ESTABLISHED YET
          </span>
        </motion.div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-eve-white/20 bg-eve-white/5">
                <th className="py-4 px-6 font-mono text-xs tracking-widest text-eve-white/50 font-normal">NODE ID</th>
                <th className="py-4 px-6 font-mono text-xs tracking-widest text-eve-white/50 font-normal">TRANSIT FEE</th>
                <th className="py-4 px-6 font-mono text-xs tracking-widest text-eve-white/50 font-normal">VAULT BALANCE</th>
                <th className="py-4 px-6 font-mono text-xs tracking-widest text-eve-white/50 font-normal text-right">OPERATIONS</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule, index) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  key={rule.id} 
                  className="border-b border-eve-white/5 hover:bg-eve-white/5 transition-colors group"
                >
                  <td className="py-4 px-6 font-mono text-eve-white">
                    {rule.id.slice(0, 6)}<span className="text-eve-white/30">...</span>{rule.id.slice(-4)}
                  </td>
                  <td className="py-4 px-6 font-mono font-bold text-eve-white">
                    {Number(rule.feeAmount) / Number(MIST_PER_SUI)} SUI
                  </td>
                  <td className="py-4 px-6 font-mono font-bold text-eve-green drop-shadow-[0_0_8px_rgba(189,255,0,0.3)]">
                    {Number(rule.vaultBalance) / Number(MIST_PER_SUI)} SUI
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex gap-2 justify-end opacity-50 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          const shortCode = encodeRuleId(rule.id);
                          const url = `${window.location.origin}/gate/${shortCode}`;
                          navigator.clipboard.writeText(url);
                          toast.success("Short Payment Link Copied to Clipboard!");
                        }}
                        className="p-2 border border-eve-white/20 text-eve-white hover:bg-eve-white/10 hover:border-eve-white transition-all"
                        title="Copy Payment Link"
                      >
                        <Link2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          const shortCode = encodeRuleId(rule.id);
                          window.open(`/gate/${shortCode}`, "_blank");
                        }}
                        className="p-2 border border-eve-white/20 text-eve-white hover:bg-eve-white/10 hover:border-eve-white transition-all"
                        title="Open Payment Page"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          setEditingRuleId(rule.id);
                          setEditFee((Number(rule.feeAmount) / Number(MIST_PER_SUI)).toString());
                          setIsEditOpen(true);
                        }}
                        className="p-2 border border-eve-white/20 text-eve-white hover:bg-eve-white/10 hover:border-eve-white transition-all"
                        title="Edit Fee"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleWithdraw(rule.id)}
                        disabled={rule.vaultBalance === "0"}
                        className={`p-2 border transition-all ${
                          rule.vaultBalance === "0" 
                            ? "border-eve-white/10 text-eve-white/30 cursor-not-allowed" 
                            : "border-eve-green/50 text-eve-green hover:bg-eve-green hover:text-eve-black"
                        }`}
                        title="Withdraw Vault"
                      >
                        <Wallet className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
