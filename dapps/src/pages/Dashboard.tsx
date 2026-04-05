import { useCurrentAccount, useDAppKit } from "@mysten/dapp-kit-react";
import { SuiJsonRpcClient } from "@mysten/sui/jsonRpc";
import { getOwnedObjectsByType, useConnection } from "@evefrontier/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useState, type ReactNode } from "react";
import { useTollRules } from "../hooks/useTollRules";
import { encodeRuleId } from "../utils/shortLink";
import { PACKAGE_ID, WORLD_PACKAGE_ID } from "../config/constants";
import { MIST_PER_SUI } from "@mysten/sui/utils";
import { bcs } from "@mysten/sui/bcs";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  Plus,
  Edit2,
  Wallet,
  ExternalLink,
  Settings,
  ShieldAlert,
  Link2,
  Inbox,
  RefreshCw,
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";

export function Dashboard() {
  const account = useCurrentAccount();
  const {
    data: rules = [],
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useTollRules();
  const { signAndExecuteTransaction } = useDAppKit();
  const { isConnected } = useConnection();

  const ActionIconButton = ({
    label,
    onClick,
    disabled,
    className,
    children,
  }: {
    label: string;
    onClick?: () => void;
    disabled?: boolean;
    className: string;
    children: ReactNode;
  }) => {
    return (
      <span className="relative inline-flex">
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          className={`${className} peer`}
          aria-label={label}
        >
          {children}
        </button>
        <span
          role="tooltip"
          className="pointer-events-none absolute left-1/2 top-0 z-[60] -translate-x-1/2 -translate-y-[110%] whitespace-nowrap border border-eve-white/20 bg-[#0B0B0B] px-2 py-1 text-[10px] font-mono tracking-widest text-eve-white/80 opacity-0 transition-opacity peer-hover:opacity-100 peer-focus-visible:opacity-100"
        >
          {label}
        </span>
      </span>
    );
  };

  const [newFee, setNewFee] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState("");
  const [editFee, setEditFee] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const [gate1, setGate1] = useState("");
  const [gate2, setGate2] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [characterIdInput, setCharacterIdInput] = useState("");

  const client = new SuiJsonRpcClient({
    url: "https://fullnode.testnet.sui.io:443",
    network: "testnet",
  });

  const getGateOwnerCap = async (gateId: string): Promise<string | null> => {
    try {
      const tx = new Transaction();
      // Use the centralized WORLD_PACKAGE_ID from config
      tx.moveCall({
        target: `${WORLD_PACKAGE_ID}::gate::owner_cap_id`,
        arguments: [tx.object(gateId)],
      });

      const result = await client.devInspectTransactionBlock({
        sender: account?.address || "0x0",
        transactionBlock: tx,
      });

      if (result.effects?.status?.status !== "success") return null;

      const returnValues = result.results?.[0]?.returnValues;
      if (!returnValues?.length) return null;

      const [valueBytes] = returnValues[0];
      return bcs.Address.parse(Uint8Array.from(valueBytes));
    } catch (e) {
      console.error("Failed to get Gate OwnerCap:", e);
      return null;
    }
  };

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
    if (
      !newFee ||
      isNaN(Number(newFee)) ||
      !gate1 ||
      !gate2 ||
      !characterIdInput.trim() ||
      !newDesc.trim()
    ) {
      toast.error(
        "Please provide valid fee, description, gate IDs, and your Character ID.",
      );
      return;
    }

    setIsProcessing(true);
    const toastId = toast.loading("Initializing rule creation...");

    try {
      const CHARACTER_MODULE = "character";
      const GATE_MODULE = "gate";

      const CHARACTER_ID = characterIdInput.trim();

      toast.loading("Checking Gate Ownership...", { id: toastId });
      const gate1OwnerCapId = await getGateOwnerCap(gate1);
      const gate2OwnerCapId = await getGateOwnerCap(gate2);

      if (!gate1OwnerCapId || !gate2OwnerCapId) {
        throw new Error("Could not verify ownership for one or both gates.");
      }

      toast.loading("Constructing transaction...", { id: toastId });

      const tx = new Transaction();
      const feeInMist = BigInt(
        Math.floor(Number(newFee) * Number(MIST_PER_SUI)),
      );

      // Step 1: Create the rule
      tx.moveCall({
        target: `${PACKAGE_ID}::stargazer::create_rule`,
        arguments: [
          tx.pure.u64(feeInMist),
          tx.pure.string(newDesc.trim()),
          tx.pure.id(gate1),
          tx.pure.id(gate2),
        ],
      });

      const authType = `${PACKAGE_ID}::stargazer::StargazerAuth`;

      // Step 2: Authorize Gate 1
      const [gate1OwnerCap, gate1ReturnReceipt] = tx.moveCall({
        target: `${WORLD_PACKAGE_ID}::${CHARACTER_MODULE}::borrow_owner_cap`,
        typeArguments: [`${WORLD_PACKAGE_ID}::${GATE_MODULE}::Gate`],
        arguments: [tx.object(CHARACTER_ID), tx.object(gate1OwnerCapId)],
      });

      tx.moveCall({
        target: `${WORLD_PACKAGE_ID}::${GATE_MODULE}::authorize_extension`,
        typeArguments: [authType],
        arguments: [tx.object(gate1), gate1OwnerCap],
      });

      tx.moveCall({
        target: `${WORLD_PACKAGE_ID}::${CHARACTER_MODULE}::return_owner_cap`,
        typeArguments: [`${WORLD_PACKAGE_ID}::${GATE_MODULE}::Gate`],
        arguments: [tx.object(CHARACTER_ID), gate1OwnerCap, gate1ReturnReceipt],
      });

      // Step 3: Authorize Gate 2
      const [gate2OwnerCap, gate2ReturnReceipt] = tx.moveCall({
        target: `${WORLD_PACKAGE_ID}::${CHARACTER_MODULE}::borrow_owner_cap`,
        typeArguments: [`${WORLD_PACKAGE_ID}::${GATE_MODULE}::Gate`],
        arguments: [tx.object(CHARACTER_ID), tx.object(gate2OwnerCapId)],
      });

      tx.moveCall({
        target: `${WORLD_PACKAGE_ID}::${GATE_MODULE}::authorize_extension`,
        typeArguments: [authType],
        arguments: [tx.object(gate2), gate2OwnerCap],
      });

      tx.moveCall({
        target: `${WORLD_PACKAGE_ID}::${CHARACTER_MODULE}::return_owner_cap`,
        typeArguments: [`${WORLD_PACKAGE_ID}::${GATE_MODULE}::Gate`],
        arguments: [tx.object(CHARACTER_ID), gate2OwnerCap, gate2ReturnReceipt],
      });

      toast.loading("Awaiting wallet signature...", { id: toastId });

      await signAndExecuteTransaction({ transaction: tx });

      toast.success("Rule created and gates authorized!", { id: toastId });
      setNewFee("");
      setNewDesc("");
      setGate1("");
      setGate2("");
      setCharacterIdInput("");
      setIsCreating(false);
      refetch();
    } catch (e: any) {
      console.error(e);
      toast.error(`Error: ${e.message.slice(0, 80)}...`, { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  const openEditModal = (rule: any) => {
    setEditingRuleId(rule.id);
    setEditFee((Number(rule.feeAmount) / Number(MIST_PER_SUI)).toString());
    setEditDesc(rule.description || "");
    setIsEditOpen(true);
  };

  const handleUpdateFee = async () => {
    if (!editFee || isNaN(Number(editFee)) || !editDesc.trim()) {
      toast.error("Please provide valid fee and description.");
      return;
    }

    setIsProcessing(true);
    const toastId = toast.loading("Updating rule...");

    try {
      const feeInMist = BigInt(
        Math.floor(Number(editFee) * Number(MIST_PER_SUI)),
      );
      const tx = new Transaction();

      tx.moveCall({
        target: `${PACKAGE_ID}::stargazer::update_rule`,
        arguments: [tx.object(editingRuleId), tx.pure.u64(feeInMist)],
      });

      tx.moveCall({
        target: `${PACKAGE_ID}::stargazer::update_description`,
        arguments: [tx.object(editingRuleId), tx.pure.string(editDesc.trim())],
      });

      await signAndExecuteTransaction({ transaction: tx });

      toast.success("Rule updated successfully!", { id: toastId });
      setIsEditOpen(false);
      refetch();
    } catch (e: any) {
      toast.error(`Update failed: ${e.message}`, { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this rule? Any remaining SUI in the vault will be returned to your wallet.",
      )
    )
      return;

    setIsProcessing(true);
    const toastId = toast.loading("Deleting rule...");

    try {
      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::stargazer::delete_rule`,
        arguments: [tx.object(ruleId)],
      });

      await signAndExecuteTransaction({ transaction: tx });

      toast.success("Rule deleted successfully!", { id: toastId });
      refetch();
    } catch (e: any) {
      toast.error(`Deletion failed: ${e.message}`, { id: toastId });
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
            <Dialog.Content className="fixed left-[50%] top-[50%] z-50 flex w-full max-w-lg translate-x-[-50%] translate-y-[-50%] flex-col overflow-hidden border border-eve-white/20 bg-[#0B0B0B] shadow-[0_0_50px_rgba(0,0,0,0.8)] max-h-[85vh]">
              <div className="flex flex-col gap-2 p-8 pb-4">
                <Dialog.Title className="text-xl font-mono font-bold tracking-widest text-eve-white uppercase border-b border-eve-white/10 pb-4">
                  Initialize Protocol
                </Dialog.Title>
                <Dialog.Description className="text-sm text-eve-white/60 mt-2 font-sans">
                  Define the required SUI transit fee for this stargate network
                  node.
                </Dialog.Description>
              </div>

              <div className="flex-1 overflow-y-auto px-8 pb-6 space-y-6">
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
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-eve-white/30 font-mono text-sm">
                      SUI
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <label className="text-xs font-mono tracking-widest text-eve-white/80 uppercase">
                    Source Gate Object ID
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={gate1}
                      onChange={(e) => setGate1(e.target.value)}
                      placeholder="0x..."
                      className="w-full bg-black/50 border border-eve-white/20 text-eve-white font-mono text-sm p-4 focus:outline-none focus:border-eve-green transition-colors"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <label className="text-xs font-mono tracking-widest text-eve-white/80 uppercase">
                    Destination Gate Object ID
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={gate2}
                      onChange={(e) => setGate2(e.target.value)}
                      placeholder="0x..."
                      className="w-full bg-black/50 border border-eve-white/20 text-eve-white font-mono text-sm p-4 focus:outline-none focus:border-eve-green transition-colors"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-eve-white/10">
                  <label className="text-xs font-mono tracking-widest text-eve-white/80 uppercase flex items-center justify-between">
                    <span>
                      Character ID <span className="text-eve-orange">*</span>
                    </span>
                    <a
                      href="https://suiscan.xyz/testnet/home"
                      target="_blank"
                      rel="noreferrer"
                      className="text-eve-white/40 text-[10px] hover:text-eve-green transition-colors flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" /> Find on Suiscan
                    </a>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={characterIdInput}
                      onChange={(e) => setCharacterIdInput(e.target.value)}
                      placeholder="0x..."
                      className="w-full bg-black/50 border border-eve-white/20 text-eve-white font-mono text-sm p-4 focus:outline-none focus:border-eve-green transition-colors"
                    />
                  </div>
                  <p className="text-xs text-eve-white/40">
                    You can find your Character ID by searching your wallet
                    address on Suiscan and looking for a Shared Object of type{" "}
                    <code className="text-eve-white/60">
                      character::Character
                    </code>
                    .
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <label className="text-xs font-mono tracking-widest text-eve-white/80 uppercase">
                    Description <span className="text-eve-orange">*</span>
                  </label>
                  <input
                    type="text"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="e.g., Safe Passage to Jita"
                    className="w-full bg-black/50 border border-eve-white/20 text-eve-white font-mono text-sm p-4 focus:outline-none focus:border-eve-green transition-colors"
                    maxLength={100}
                  />
                </div>
              </div>

              <div className="flex gap-4 justify-end border-t border-eve-white/10 p-8 pt-4">
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
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 flex w-full max-w-lg translate-x-[-50%] translate-y-[-50%] flex-col overflow-hidden border border-eve-white/20 bg-[#0B0B0B] shadow-[0_0_50px_rgba(0,0,0,0.8)] max-h-[85vh]">
            <div className="flex flex-col gap-2 p-8 pb-4">
              <Dialog.Title className="text-xl font-mono font-bold tracking-widest text-eve-white uppercase border-b border-eve-white/10 pb-4">
                Modify Protocol
              </Dialog.Title>
              <Dialog.Description className="text-sm text-eve-white/60 mt-2 font-sans">
                Update the transit fee for this node.
              </Dialog.Description>
            </div>

            <div className="flex-1 overflow-y-auto px-8 pb-6 space-y-6">
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
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-eve-white/30 font-mono text-sm">
                    SUI
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-end border-t border-eve-white/10 p-8 pt-4">
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
          <span className="font-mono text-xs tracking-widest text-eve-green animate-pulse">
            SCANNING NETWORK...
          </span>
        </motion.div>
      ) : isError ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 border border-eve-white/10 bg-eve-white/5 backdrop-blur-sm"
        >
          <ShieldAlert className="w-14 h-14 text-eve-orange/80 mb-4" />
          <span className="text-eve-white/80 font-mono tracking-[0.2em] text-sm mb-2">
            QUERY FAILED
          </span>
          <span className="text-eve-white/50 font-sans text-sm mb-6">
            Query failed. Click refresh to retry.
          </span>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className={`inline-flex items-center gap-2 px-6 py-3 font-mono text-xs tracking-widest uppercase border transition-all ${
              isFetching
                ? "border-eve-white/10 text-eve-white/30 cursor-not-allowed"
                : "border-eve-white/20 text-eve-white/80 hover:bg-eve-white/5 hover:border-eve-white"
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
            {isFetching ? "REFRESHING..." : "REFRESH"}
          </button>
        </motion.div>
      ) : rules.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 border border-eve-white/10 bg-eve-white/5 backdrop-blur-sm"
        >
          <Inbox className="w-14 h-14 text-eve-white/40 mb-4" />
          <span className="text-eve-white/50 font-mono tracking-[0.2em] text-sm mb-6">
            NO PROTOCOLS ESTABLISHED YET
          </span>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className={`inline-flex items-center gap-2 px-6 py-3 font-mono text-xs tracking-widest uppercase border transition-all ${
              isFetching
                ? "border-eve-white/10 text-eve-white/30 cursor-not-allowed"
                : "border-eve-white/20 text-eve-white/80 hover:bg-eve-white/5 hover:border-eve-white"
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
            {isFetching ? "REFRESHING..." : "REFRESH"}
          </button>
        </motion.div>
      ) : (
        <div className="w-full overflow-x-auto overflow-y-visible">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-eve-white/20 bg-eve-white/5">
                <th className="py-4 px-6 font-mono text-xs tracking-widest text-eve-white/50 font-normal">
                  NODE ID
                </th>
                <th className="py-4 px-6 font-mono text-xs tracking-widest text-eve-white/50 font-normal">
                  DESCRIPTION
                </th>
                <th className="py-4 px-6 font-mono text-xs tracking-widest text-eve-white/50 font-normal">
                  TRANSIT FEE
                </th>
                <th className="py-4 px-6 font-mono text-xs tracking-widest text-eve-white/50 font-normal">
                  VAULT BALANCE
                </th>
                <th className="py-4 px-6 font-mono text-xs tracking-widest text-eve-white/50 font-normal text-right">
                  OPERATIONS
                </th>
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
                    {rule.id.slice(0, 6)}
                    <span className="text-eve-white/30">...</span>
                    {rule.id.slice(-4)}
                  </td>
                  <td className="py-4 px-6 font-sans text-sm text-eve-white/80">
                    {rule.description || "No description provided."}
                  </td>
                  <td className="py-4 px-6 font-mono font-bold text-eve-white">
                    {Number(rule.feeAmount) / Number(MIST_PER_SUI)} SUI
                  </td>
                  <td className="py-4 px-6 font-mono font-bold text-eve-green drop-shadow-[0_0_8px_rgba(189,255,0,0.3)]">
                    {Number(rule.vaultBalance) / Number(MIST_PER_SUI)} SUI
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex gap-2 justify-end opacity-50 group-hover:opacity-100 transition-opacity">
                      <ActionIconButton
                        label="Copy payment link"
                        onClick={() => {
                          const shortCode = encodeRuleId(rule.id);
                          const url = `${window.location.origin}/gate/${shortCode}`;
                          navigator.clipboard.writeText(url);
                          toast.success(
                            "Short Payment Link Copied to Clipboard!",
                          );
                        }}
                        className="p-2 border border-eve-white/20 text-eve-white hover:bg-eve-white/10 hover:border-eve-white transition-all"
                      >
                        <Link2 className="w-4 h-4" />
                      </ActionIconButton>
                      <ActionIconButton
                        label="Open payment page"
                        onClick={() => {
                          const shortCode = encodeRuleId(rule.id);
                          window.open(`/gate/${shortCode}`, "_blank");
                        }}
                        className="p-2 border border-eve-white/20 text-eve-white hover:bg-eve-white/10 hover:border-eve-white transition-all"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </ActionIconButton>
                      <ActionIconButton
                        label="Edit rule"
                        onClick={() => openEditModal(rule)}
                        className="p-2 border border-eve-white/20 text-eve-white hover:bg-eve-white/10 hover:border-eve-white transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </ActionIconButton>
                      <ActionIconButton
                        label="Delete rule"
                        onClick={() => handleDeleteRule(rule.id)}
                        className="p-2 border border-eve-white/20 text-eve-white hover:bg-red-500/20 hover:text-red-500 hover:border-red-500 transition-all"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </ActionIconButton>
                      <ActionIconButton
                        label="Withdraw vault"
                        onClick={() => handleWithdraw(rule.id)}
                        disabled={rule.vaultBalance === "0"}
                        className={`p-2 border transition-all ${
                          rule.vaultBalance === "0"
                            ? "border-eve-white/10 text-eve-white/30 cursor-not-allowed"
                            : "border-eve-green/50 text-eve-green hover:bg-eve-green hover:text-eve-black"
                        }`}
                      >
                        <Wallet className="w-4 h-4" />
                      </ActionIconButton>
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
