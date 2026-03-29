import { Flex, Heading, Text, Button } from "@radix-ui/themes";
import { useNavigate } from "react-router-dom";
import { useCurrentAccount } from "@mysten/dapp-kit-react";
import { useConnection } from "@evefrontier/dapp-kit";

export function Landing() {
  const navigate = useNavigate();
  const account = useCurrentAccount();
  const { handleConnect } = useConnection();

  return (
    <Flex direction="column" align="center" justify="center" style={{ minHeight: "75vh", textAlign: "center", position: "relative" }}>
      <div style={{
        position: "absolute",
        top: "-10%",
        left: "50%",
        transform: "translateX(-50%)",
        width: "80%",
        height: "80%",
        background: "radial-gradient(circle, rgba(250, 250, 229, 0.05) 0%, rgba(11, 11, 11, 0) 70%)",
        zIndex: -1,
        pointerEvents: "none"
      }} />

      <Heading size="9" style={{ 
        letterSpacing: "6px", 
        marginBottom: "24px", 
        textTransform: "uppercase",
        fontFamily: '"Frontier Disket Mono", monospace',
        color: "#FAFAE5",
        textShadow: "0 0 20px rgba(250, 250, 229, 0.2)"
      }}>
        Control Your Frontier
      </Heading>
      
      <Text size="5" style={{ 
        maxWidth: "650px", 
        marginBottom: "48px",
        color: "rgba(250, 250, 229, 0.7)",
        lineHeight: "1.6",
        fontFamily: '"Favorit", monospace'
      }}>
        Seize any advantage to survive and rebuild civilization. 
        Stargazer allows you to set up toll rules for your Stargates in EVE Frontier.
        Monetize your territory, control the flow, and rule the stars.
      </Text>

      <Flex gap="4">
        {account ? (
          <Button 
            size="4" 
            variant="solid" 
            style={{ 
              borderRadius: "2px", 
              backgroundColor: "#FAFAE5", 
              color: "#0B0B0B", 
              padding: "0 48px", 
              fontSize: "14px", 
              fontWeight: "bold",
              letterSpacing: "2px",
              cursor: "pointer",
              boxShadow: "0 4px 15px rgba(250, 250, 229, 0.15)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease"
            }}
            onClick={() => navigate("/dashboard")}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(250, 250, 229, 0.25)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 15px rgba(250, 250, 229, 0.15)"; }}
          >
            ENTER DASHBOARD
          </Button>
        ) : (
          <Button 
            size="4" 
            variant="solid" 
            style={{ 
              borderRadius: "2px", 
              backgroundColor: "#FAFAE5", 
              color: "#0B0B0B", 
              padding: "0 48px", 
              fontSize: "14px", 
              fontWeight: "bold",
              letterSpacing: "2px",
              cursor: "pointer",
              boxShadow: "0 4px 15px rgba(250, 250, 229, 0.15)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease"
            }}
            onClick={() => handleConnect()}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(250, 250, 229, 0.25)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 15px rgba(250, 250, 229, 0.15)"; }}
          >
            BECOME A FOUNDER
          </Button>
        )}
      </Flex>
    </Flex>
  );
}
