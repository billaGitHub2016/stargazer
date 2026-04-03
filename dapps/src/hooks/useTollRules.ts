import { useCurrentAccount } from "@mysten/dapp-kit-react";
import { useQuery } from "@tanstack/react-query";
import { PACKAGE_ID } from "../config/constants";

export interface TollRule {
  id: string;
  feeAmount: string;
  vaultBalance: string;
  owner: string;
}

// Using alternative RPC endpoint to bypass potential CORS preflight issues on Mysten's public nodes
const RPC_URL = "https://sui-testnet-endpoint.blockvision.org";

export function useTollRules() {
  const account = useCurrentAccount();

  return useQuery({
    queryKey: ["toll-rules", account?.address],
    queryFn: async () => {
      if (!account) return [];
      
      let hasNextPage = true;
      let cursor: any = null;
      const ruleIds: string[] = [];

      while (hasNextPage) {
        const res = await fetch(RPC_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "suix_queryEvents",
            params: [
              { MoveEventType: `${PACKAGE_ID}::stargazer::RuleCreated` },
              cursor,
              50,
              false
            ]
          })
        });
        const eventsData = await res.json();
        
        if (!eventsData.result) break;

        const events = eventsData.result;
        for (const event of events.data) {
          if (event.parsedJson && (event.parsedJson as any).owner === account.address) {
            ruleIds.push((event.parsedJson as any).rule_id);
          }
        }

        hasNextPage = events.hasNextPage;
        cursor = events.nextCursor;
      }

      const uniqueRuleIds = Array.from(new Set(ruleIds));

      if (uniqueRuleIds.length === 0) return [];

      const objRes = await fetch(RPC_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 2,
          method: "sui_multiGetObjects",
          params: [
            uniqueRuleIds,
            { showContent: true }
          ]
        })
      });
      const objData = await objRes.json();

      return objData.result
        .map((obj: any) => {
          if (obj.data?.content?.dataType === "moveObject") {
            const fields = obj.data.content.fields;
            return {
              id: obj.data.objectId,
              feeAmount: fields.fee_amount,
              vaultBalance: fields.vault,
              owner: fields.owner,
            } as TollRule;
          }
          return null;
        })
        .filter(Boolean) as TollRule[];
    },
    enabled: !!account,
    refetchInterval: 10000,
  });
}

export function useTollRule(ruleIdOrShortCode?: string) {
  return useQuery({
    queryKey: ["toll-rule", ruleIdOrShortCode],
    queryFn: async () => {
      if (!ruleIdOrShortCode) return null;

      let actualRuleId = ruleIdOrShortCode;

      // If it's a 6-character short code, we need to find the full rule ID
      if (ruleIdOrShortCode.length === 6 && !ruleIdOrShortCode.startsWith("0x")) {
        let hasNextPage = true;
        let cursor: any = null;

        while (hasNextPage) {
          const res = await fetch(RPC_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jsonrpc: "2.0",
              id: 1,
              method: "suix_queryEvents",
              params: [
                { MoveEventType: `${PACKAGE_ID}::stargazer::RuleCreated` },
                cursor,
                50,
                false
              ]
            })
          });
          const eventsData = await res.json();
          if (!eventsData.result) break;

          const events = eventsData.result;
          for (const event of events.data) {
            const parsedJson = event.parsedJson as any;
            if (parsedJson && parsedJson.rule_id) {
              const ruleIdHex = parsedJson.rule_id.startsWith('0x') 
                ? parsedJson.rule_id.slice(2) 
                : parsedJson.rule_id;
              
              if (ruleIdHex.startsWith(ruleIdOrShortCode)) {
                actualRuleId = parsedJson.rule_id;
                hasNextPage = false;
                break;
              }
            }
          }
          if (hasNextPage) {
            hasNextPage = events.hasNextPage;
            cursor = events.nextCursor;
          }
        }
      }

      const objRes = await fetch(RPC_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 3,
          method: "sui_getObject",
          params: [
            actualRuleId,
            { showContent: true }
          ]
        })
      });
      const objData = await objRes.json();
      const obj = objData.result;

      if (obj?.data?.content?.dataType === "moveObject") {
        const fields = obj.data.content.fields as any;
        return {
          id: obj.data.objectId,
          feeAmount: fields.fee_amount,
          vaultBalance: fields.vault,
          owner: fields.owner,
        } as TollRule;
      }

      return null;
    },
    enabled: !!ruleIdOrShortCode,
    refetchInterval: 100000,
  });
}
