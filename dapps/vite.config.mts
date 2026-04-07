import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // loadEnv searches for .env files in the current directory
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    resolve: {
      dedupe: ['@mysten/dapp-kit-react', 'react', 'react-dom']
    },
    define: {
      'import.meta.env.VITE_OBJECT_ID': JSON.stringify(env.VITE_OBJECT_ID || "0x0000000000000000000000000000000000000000000000000000000000000000"),
      'import.meta.env.VITE_EVE_WORLD_PACKAGE_ID': JSON.stringify(env.VITE_EVE_WORLD_PACKAGE_ID || "0xd12a70c74c1e759445d6f209b01d43d860e97fcf2ef72ccbbd00afd828043f75"),
      'import.meta.env.VITE_SUI_GRAPHQL_ENDPOINT': JSON.stringify(env.VITE_SUI_GRAPHQL_ENDPOINT || "https://graphql.testnet.sui.io/graphql")
    }
  };
});
