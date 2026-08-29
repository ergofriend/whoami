import { unstable_getRequest as getRequest } from "waku/router/server";

import { HomeView } from "../components/HomeView";
import { buildServerInspection } from "../features/server/server-inspection";

export default function HomePage() {
  return <HomeView inspection={buildServerInspection(getRequest())} />;
}

export const getConfig = async () => ({ render: "dynamic" as const });
