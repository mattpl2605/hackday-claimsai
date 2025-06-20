import { customerAutoAgent } from './customerAutoAgent';
import { customerConfusedElderlyAgent } from './customerConfusedElderlyAgent';
import { customerCustomerServiceAgent } from './customerCustomerServiceAgent';
import { customerHomeWaterAgent } from './customerHomeWaterAgent';
import { customerHouseFireAgent } from './customerHouseFireAgent';
import { customerWindshieldDamageAgent } from './customerWindshieldDamageAgent';

// Cast to `any` to satisfy TypeScript until the core types make RealtimeAgent
// assignable to `Agent<unknown>` (current library versions are invariant on
// the context type).
(customerAutoAgent.handoffs as any).push(customerConfusedElderlyAgent, customerCustomerServiceAgent, customerHomeWaterAgent, customerHouseFireAgent, customerWindshieldDamageAgent);
(customerConfusedElderlyAgent.handoffs as any).push(customerAutoAgent, customerCustomerServiceAgent, customerHomeWaterAgent, customerHouseFireAgent, customerWindshieldDamageAgent);
(customerCustomerServiceAgent.handoffs as any).push(customerAutoAgent, customerConfusedElderlyAgent, customerHomeWaterAgent, customerHouseFireAgent, customerWindshieldDamageAgent);
(customerHomeWaterAgent.handoffs as any).push(customerAutoAgent, customerConfusedElderlyAgent, customerCustomerServiceAgent, customerHouseFireAgent, customerWindshieldDamageAgent);
(customerHouseFireAgent.handoffs as any).push(customerAutoAgent, customerConfusedElderlyAgent, customerCustomerServiceAgent, customerHomeWaterAgent, customerWindshieldDamageAgent);
(customerWindshieldDamageAgent.handoffs as any).push(customerAutoAgent, customerConfusedElderlyAgent, customerCustomerServiceAgent, customerHomeWaterAgent, customerHouseFireAgent);


export const customerAgentsScenario = [
  customerAutoAgent,
  customerConfusedElderlyAgent,
  customerCustomerServiceAgent,
  customerHomeWaterAgent,
  customerHouseFireAgent,
  customerWindshieldDamageAgent,
];

// Name of the company represented by this agent set. Used by guardrails
export const customerAgentsCompanyName = 'State Farm'; 