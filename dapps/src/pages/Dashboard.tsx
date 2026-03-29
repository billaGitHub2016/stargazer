import { Box, Flex, Heading, Text, Button, TextField, Table, Spinner } from "@radix-ui/themes";
import * as Dialog from "@radix-ui/react-dialog";
import { useCurrentAccount, useDAppKit } from "@mysten/dapp-kit-react";
import { Transaction } from "@mysten/sui/transactions";
import { useState } from "react";
import { useTollRules } from "../hooks/useTollRules";
import { PACKAGE_ID } from "../config/constants";
import { MIST_PER_SUI } from "@mysten/sui/utils";
import toast from "react-hot-toast";

export function Dashboard() {
  const account = useCurrentAccount();
  const { data: rules = [], isLoading, refetch } = useTollRules();
  const { signAndExecuteTransaction } = useDAppKit();

  const [newFee, setNewFee] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!account) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: "50vh" }}>
        <Text size="5" color="gray">Please connect your EVE wallet to access the dashboard.</Text>
      </Flex>
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

  const handleUpdateFee = async (ruleId: string, currentFee: string) => {
    const updatedFee = prompt("Enter new fee amount (SUI):", (Number(currentFee) / Number(MIST_PER_SUI)).toString());
    if (!updatedFee || isNaN(Number(updatedFee))) return;

    const toastId = toast.loading("Updating rule fee...");

    try {
      const tx = new Transaction();
      const feeInMist = BigInt(Math.floor(Number(updatedFee) * Number(MIST_PER_SUI)));
      
      tx.moveCall({
        target: `${PACKAGE_ID}::stargazer::update_rule`,
        arguments: [
          tx.object(ruleId),
          tx.pure.u64(feeInMist)
        ],
      });

      await signAndExecuteTransaction({ transaction: tx });
      toast.success("Fee updated successfully!", { id: toastId });
      refetch();
    } catch (e: any) {
      console.error(e);
      toast.error(`Error: ${e.message.slice(0, 50)}...`, { id: toastId });
    }
  };

  const handleWithdraw = async (ruleId: string) => {
    const toastId = toast.loading("Withdrawing tolls...");

    try {
      const tx = new Transaction();
      
      tx.moveCall({
        target: `${PACKAGE_ID}::stargazer::withdraw_tolls`,
        arguments: [tx.object(ruleId)],
      });

      await signAndExecuteTransaction({ transaction: tx });
      toast.success("Tolls withdrawn successfully!", { id: toastId });
      refetch();
    } catch (e: any) {
      console.error(e);
      toast.error(`Error: ${e.message.slice(0, 50)}...`, { id: toastId });
    }
  };

  return (
    <Box>
      <Flex justify="between" align="center" mb="6">
        <Heading size="7" style={{ 
          textTransform: "uppercase", 
          letterSpacing: "4px",
          fontFamily: '"Frontier Disket Mono", monospace',
          color: "#FAFAE5"
        }}>
          My Stargate Rules
        </Heading>
        
        <Dialog.Root open={isCreating} onOpenChange={setIsCreating}>
          <Dialog.Trigger>
            <Button 
              variant="solid" 
              style={{ 
                borderRadius: "2px", 
                backgroundColor: "#FAFAE5", 
                color: "#0B0B0B", 
                cursor: "pointer",
                fontWeight: "bold",
                letterSpacing: "1px",
                padding: "0 24px"
              }}
              onClick={() => setIsCreating(true)}
            >
              + CREATE NEW RULE
            </Button>
          </Dialog.Trigger>
          <Dialog.Content style={{ 
            maxWidth: 450, 
            backgroundColor: "rgba(11, 11, 11, 0.95)", 
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(250, 250, 229, 0.2)", 
            borderRadius: "2px", 
            zIndex: 1000, 
            position: "fixed", 
            top: "50%", 
            left: "50%", 
            transform: "translate(-50%, -50%)", 
            padding: "32px",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.8)"
          }}>
            <Dialog.Title style={{ color: "#FAFAE5", textTransform: "uppercase", letterSpacing: "2px", fontFamily: '"Frontier Disket Mono", monospace', marginBottom: "8px" }}>
              Create Toll Rule
            </Dialog.Title>
            <Dialog.Description style={{ marginBottom: "24px", color: "rgba(250, 250, 229, 0.6)", fontSize: "14px", lineHeight: "1.5" }}>
              Set the fee amount required to pass through your stargate.
            </Dialog.Description>

            <Flex direction="column" gap="3">
              <label>
                <Text as="div" size="2" mb="2" weight="bold" style={{ color: "rgba(250, 250, 229, 0.8)", textTransform: "uppercase", letterSpacing: "1px", fontSize: "12px" }}>Fee Amount (SUI)</Text>
                <TextField.Root 
                  value={newFee}
                  onChange={(e) => setNewFee(e.target.value)}
                  placeholder="0.00" 
                  style={{ 
                    borderRadius: "2px", 
                    backgroundColor: "rgba(0, 0, 0, 0.5)", 
                    color: "#FAFAE5", 
                    border: "1px solid rgba(250, 250, 229, 0.2)",
                    height: "40px",
                    fontFamily: '"Frontier Disket Mono", monospace',
                    fontSize: "16px"
                  }}
                />
              </label>
            </Flex>

            <Flex gap="3" mt="5" justify="end">
              <Dialog.Close>
                <Button 
                  variant="outline" 
                  style={{ 
                    borderRadius: "2px",
                    borderColor: "rgba(250, 250, 229, 0.2)",
                    color: "rgba(250, 250, 229, 0.8)",
                    cursor: "pointer"
                  }}
                >
                  CANCEL
                </Button>
              </Dialog.Close>
              <Button 
                disabled={isProcessing} 
                onClick={handleCreateRule} 
                style={{ 
                  borderRadius: "2px", 
                  backgroundColor: isProcessing ? "rgba(250, 250, 229, 0.2)" : "#FAFAE5", 
                  color: isProcessing ? "rgba(250, 250, 229, 0.5)" : "#0B0B0B",
                  cursor: isProcessing ? "not-allowed" : "pointer",
                  fontWeight: "bold",
                  letterSpacing: "1px"
                }}
              >
                {isProcessing ? "CREATING..." : "CONFIRM"}
              </Button>
            </Flex>
          </Dialog.Content>
        </Dialog.Root>
      </Flex>

      {isLoading ? (
        <Flex justify="center" align="center" style={{ padding: "80px", border: "1px dashed rgba(250, 250, 229, 0.2)", borderRadius: "2px" }}>
          <Spinner size="3" />
        </Flex>
      ) : rules.length === 0 ? (
        <Box style={{ padding: "80px", border: "1px dashed rgba(250, 250, 229, 0.2)", textAlign: "center", borderRadius: "2px" }}>
          <Text style={{ color: "rgba(250, 250, 229, 0.5)", fontFamily: '"Frontier Disket Mono", monospace' }}>
            NO RULES ESTABLISHED YET.
          </Text>
        </Box>
      ) : (
        <Table.Root variant="surface" style={{ backgroundColor: "transparent", border: "1px solid rgba(250, 250, 229, 0.1)", borderRadius: "2px" }}>
          <Table.Header>
            <Table.Row style={{ backgroundColor: "rgba(250, 250, 229, 0.05)" }}>
              <Table.ColumnHeaderCell style={{ color: "rgba(250, 250, 229, 0.5)", textTransform: "uppercase", fontSize: "12px", letterSpacing: "1px" }}>Rule ID</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell style={{ color: "rgba(250, 250, 229, 0.5)", textTransform: "uppercase", fontSize: "12px", letterSpacing: "1px" }}>Fee</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell style={{ color: "rgba(250, 250, 229, 0.5)", textTransform: "uppercase", fontSize: "12px", letterSpacing: "1px" }}>Vault Balance</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell style={{ color: "rgba(250, 250, 229, 0.5)", textTransform: "uppercase", fontSize: "12px", letterSpacing: "1px" }}>Actions</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {rules.map((rule) => (
              <Table.Row key={rule.id} style={{ borderBottom: "1px solid rgba(250, 250, 229, 0.05)" }}>
                <Table.Cell style={{ color: "#FAFAE5", fontFamily: '"Frontier Disket Mono", monospace', verticalAlign: "middle" }}>
                  {rule.id.slice(0, 6)}...{rule.id.slice(-4)}
                </Table.Cell>
                <Table.Cell style={{ color: "#FAFAE5", fontWeight: "bold", verticalAlign: "middle" }}>
                  {Number(rule.feeAmount) / Number(MIST_PER_SUI)} SUI
                </Table.Cell>
                <Table.Cell style={{ color: "#BDFF00", fontWeight: "bold", verticalAlign: "middle" }}>
                  {Number(rule.vaultBalance) / Number(MIST_PER_SUI)} SUI
                </Table.Cell>
                <Table.Cell>
                  <Flex gap="3">
                    <Button 
                      variant="outline" 
                      size="1" 
                      style={{ 
                        borderRadius: "2px", 
                        cursor: "pointer", 
                        color: "#FAFAE5", 
                        borderColor: "rgba(250, 250, 229, 0.3)",
                        textTransform: "uppercase",
                        fontSize: "10px",
                        letterSpacing: "1px"
                      }}
                      onClick={() => window.open(`/gate/${rule.id}`, "_blank")}
                    >
                      DApp
                    </Button>
                    <Button 
                      variant="solid" 
                      size="1" 
                      style={{ 
                        borderRadius: "2px", 
                        backgroundColor: "rgba(250, 250, 229, 0.1)", 
                        color: "#FAFAE5", 
                        cursor: "pointer",
                        textTransform: "uppercase",
                        fontSize: "10px",
                        letterSpacing: "1px"
                      }}
                      onClick={() => handleUpdateFee(rule.id, rule.feeAmount)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="solid" 
                      size="1" 
                      style={{ 
                        borderRadius: "2px", 
                        backgroundColor: rule.vaultBalance === "0" ? "rgba(250, 250, 229, 0.05)" : "#FAFAE5", 
                        color: rule.vaultBalance === "0" ? "rgba(250, 250, 229, 0.3)" : "#0B0B0B",
                        cursor: rule.vaultBalance === "0" ? "not-allowed" : "pointer",
                        textTransform: "uppercase",
                        fontSize: "10px",
                        fontWeight: "bold",
                        letterSpacing: "1px"
                      }}
                      onClick={() => handleWithdraw(rule.id)}
                      disabled={rule.vaultBalance === "0"}
                    >
                      Withdraw
                    </Button>
                  </Flex>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      )}
    </Box>
  );
}
