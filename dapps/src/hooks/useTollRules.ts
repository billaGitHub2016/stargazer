import { useCurrentAccount } from "@mysten/dapp-kit-react";
import { useQuery } from "@tanstack/react-query";
import { PACKAGE_ID } from "../config/constants";

export interface TollRule {
  id: string;
  feeAmount: string;
  vaultBalance: string;
  owner: string;
}

const RPC_URL = "https://fullnode.testnet.sui.io:443";

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
          if (event.parsedJson.owner === account.address) {
            ruleIds.push(event.parsedJson.rule_id);
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

export function useTollRule(ruleId?: string) {
  return useQuery({
    queryKey: ["toll-rule", ruleId],
    queryFn: async () => {
      if (!ruleId) return null;

      const objRes = await fetch(RPC_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 3,
          method: "sui_getObject",
          params: [
            ruleId,
            { showContent: true }
          ]
        })
      });
      const objData = await objRes.json();
      const obj = objData.result;

      if (obj?.data?.content?.dataType === "moveObject") {
        const fields = obj.data.content.fields;
        return {
          id: obj.data.objectId,
          feeAmount: fields.fee_amount,
          vaultBalance: fields.vault,
          owner: fields.owner,
        } as TollRule;
      }

      return null;
    },
    enabled: !!ruleId,
    refetchInterval: 10000,
  });
}
