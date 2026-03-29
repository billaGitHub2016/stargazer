import { Box, Flex, Heading, Text, Button, Card } from "@radix-ui/themes";
import { useParams } from "react-router-dom";
import { useCurrentAccount, useDAppKit } from "@mysten/dapp-kit-react";
import { useConnection } from "@evefrontier/dapp-kit";
import { useState } from "react";
import { useTollRule } from "../hooks/useTollRules";
import { PACKAGE_ID } from "../config/constants";
import { Transaction } from "@mysten/sui/transactions";
import { MIST_PER_SUI } from "@mysten/sui/utils";
import toast from "react-hot-toast";

export function GatePayment() {
  const { ruleId } = useParams();
  const account = useCurrentAccount();
  const { handleConnect } = useConnection();
  const { data: rule, isLoading } = useTollRule(ruleId);
  const { signAndExecuteTransaction } = useDAppKit();

  const [isPaying, setIsPaying] = useState(false);
  const [paid, setPaid] = useState(false);

  const handlePayToll = async () => {
    if (!rule || !account) return;
    setIsPaying(true);
    const toastId = toast.loading("Processing payment...");
    
    try {
      const tx = new Transaction();
      
      const [paymentCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(rule.feeAmount)]);

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
      console.error(e);
      toast.error(`Payment failed: ${e.message.slice(0, 50)}...`, { id: toastId });
    } finally {
      setIsPaying(false);
    }
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: "70vh" }}>
        <Text size="5" color="gray">Loading Rule Data...</Text>
      </Flex>
    );
  }

  if (!rule) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: "70vh" }}>
        <Text size="5" color="red">Rule Not Found</Text>
      </Flex>
    );
  }

  const feeInSui = Number(rule.feeAmount) / Number(MIST_PER_SUI);

  return (
    <Flex justify="center" align="center" style={{ minHeight: "70vh" }}>
      <Card 
        style={{ 
          maxWidth: "500px", 
          width: "100%", 
          backgroundColor: "#0B0B0B", 
          border: "1px solid rgba(250, 250, 229, 0.1)",
          borderRadius: "2px",
          padding: "48px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)"
        }}
      >
        <Flex direction="column" align="center" gap="6" style={{ textAlign: "center" }}>
          <Heading size="6" style={{ 
            textTransform: "uppercase", 
            letterSpacing: "4px", 
            color: "#FAFAE5",
            fontFamily: '"Frontier Disket Mono", monospace'
          }}>
            Stargate Toll
          </Heading>
          
          <Box style={{ 
            padding: "24px", 
            backgroundColor: "rgba(250, 250, 229, 0.03)", 
            border: "1px dashed rgba(250, 250, 229, 0.2)", 
            width: "100%",
            borderRadius: "2px"
          }}>
            <Text style={{ display: "block", marginBottom: "8px", color: "rgba(250, 250, 229, 0.5)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>Rule ID</Text>
            <Text style={{ color: "#FAFAE5", wordBreak: "break-all", fontFamily: '"Frontier Disket Mono", monospace', fontSize: "14px" }}>{rule.id}</Text>
          </Box>

          <Flex direction="column" gap="2">
            <Text style={{ color: "rgba(250, 250, 229, 0.5)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>Required Fee</Text>
            <Text weight="bold" style={{ color: "#FAFAE5", fontSize: "42px", fontFamily: '"Frontier Disket Mono", monospace' }}>{feeInSui} SUI</Text>
          </Flex>

          {paid ? (
            <Box style={{ 
              padding: "24px", 
              backgroundColor: "rgba(189, 255, 0, 0.05)", 
              border: "1px solid rgba(189, 255, 0, 0.3)", 
              width: "100%",
              borderRadius: "2px"
            }}>
              <Text style={{ color: "#BDFF00", fontWeight: "bold", letterSpacing: "2px", fontFamily: '"Frontier Disket Mono", monospace' }}>PAYMENT SUCCESSFUL</Text>
              <Text style={{ display: "block", marginTop: "12px", color: "rgba(250, 250, 229, 0.7)", fontSize: "14px" }}>
                Jump permit has been issued. You may now proceed through the gate.
              </Text>
            </Box>
          ) : (
            <Box style={{ width: "100%", marginTop: "16px" }}>
              {!account ? (
                <Button 
                  size="4" 
                  style={{ 
                    width: "100%", 
                    borderRadius: "2px", 
                    backgroundColor: "#FAFAE5", 
                    color: "#0B0B0B",
                    cursor: "pointer",
                    fontWeight: "bold",
                    letterSpacing: "1px",
                    height: "56px"
                  }}
                  onClick={() => handleConnect()}
                >
                  CONNECT WALLET TO PAY
                </Button>
              ) : (
                <Button 
                  size="4" 
                  disabled={isPaying}
                  style={{ 
                    width: "100%", 
                    borderRadius: "2px", 
                    backgroundColor: isPaying ? "rgba(250, 250, 229, 0.2)" : "#FAFAE5", 
                    color: isPaying ? "rgba(250, 250, 229, 0.5)" : "#0B0B0B",
                    cursor: isPaying ? "not-allowed" : "pointer",
                    fontWeight: "bold",
                    letterSpacing: "1px",
                    height: "56px",
                    transition: "all 0.2s ease"
                  }}
                  onClick={handlePayToll}
                >
                  {isPaying ? "PROCESSING..." : `PAY ${feeInSui} SUI`}
                </Button>
              )}
            </Box>
          )}

          <Text style={{ marginTop: "16px", color: "rgba(250, 250, 229, 0.3)", fontSize: "12px", letterSpacing: "1px" }}>
            POWERED BY STARGAZER NETWORK
          </Text>
        </Flex>
      </Card>
    </Flex>
  );
}
