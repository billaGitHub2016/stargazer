import { Box, Flex, Heading, Button, Container } from "@radix-ui/themes";
import { abbreviateAddress, useConnection } from "@evefrontier/dapp-kit";
import { useCurrentAccount } from "@mysten/dapp-kit-react";
import { Outlet, useNavigate } from "react-router-dom";

export function Layout() {
  const { handleConnect, handleDisconnect } = useConnection();
  const account = useCurrentAccount();
  const navigate = useNavigate();

  return (
    <Box style={{ minHeight: "100vh", backgroundColor: "#0B0B0B", color: "#FAFAE5" }}>
      <Flex
        position="sticky"
        top="0"
        px="6"
        py="4"
        direction="row"
        align="center"
        justify="between"
        style={{
          borderBottom: "1px solid rgba(250, 250, 229, 0.1)",
          backgroundColor: "rgba(11, 11, 11, 0.85)",
          backdropFilter: "blur(12px)",
          zIndex: 100,
        }}
      >
        <Heading 
          size="6" 
          style={{ 
            cursor: "pointer", 
            letterSpacing: "4px", 
            textTransform: "uppercase",
            fontFamily: '"Frontier Disket Mono", monospace'
          }}
          onClick={() => navigate("/")}
        >
          STARGAZER
        </Heading>

        <Flex gap="4" align="center">
          {account && (
            <Button 
              variant="ghost" 
              onClick={() => navigate("/dashboard")} 
              style={{ color: "rgba(250, 250, 229, 0.8)", cursor: "pointer", fontSize: "14px" }}
            >
              DASHBOARD
            </Button>
          )}
          <Button
            variant="solid"
            style={{ 
              borderRadius: "2px", 
              border: "1px solid rgba(250, 250, 229, 0.3)", 
              backgroundColor: account ? "rgba(250, 250, 229, 0.05)" : "#FAFAE5", 
              color: account ? "#FAFAE5" : "#0B0B0B",
              cursor: "pointer",
              fontWeight: "bold",
              transition: "all 0.2s ease"
            }}
            onClick={() => (account?.address ? handleDisconnect() : handleConnect())}
          >
            {account ? abbreviateAddress(account?.address) : "CONNECT WALLET"}
          </Button>
        </Flex>
      </Flex>
      
      <Container size="4" style={{ padding: "40px 20px" }}>
        <Outlet />
      </Container>
    </Box>
  );
}
