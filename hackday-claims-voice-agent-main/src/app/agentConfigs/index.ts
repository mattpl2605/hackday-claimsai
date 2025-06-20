import { simpleHandoffScenario } from './simpleHandoff';

//import { chatSupervisorScenario } from './chatSupervisor';
import { customerAgentsScenario } from './customerAgents';

import type { RealtimeAgent } from '@openai/agents/realtime';

// Map of scenario key -> array of RealtimeAgent objects
export const allAgentSets: Record<string, RealtimeAgent[]> = {
  simpleHandoff: simpleHandoffScenario,
  customerAgents: customerAgentsScenario,
};

export const defaultAgentSetKey = 'customerAgents';
