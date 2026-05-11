import { Component, input } from '@angular/core';
import { ExpertAdvisor } from '@shared/models/expert-advisor';
import { EXPERT_NAMES } from '@shared/constants/expert.constants';

@Component({
  selector: 'app-expert-badge',
  template: `
    @let config = expertConfigs[expert()];
    <div
      class="inline-flex items-center justify-center rounded-md border px-2 py-1 text-xs font-medium whitespace-nowrap"
      [class]="config.classes"
    >
      {{ config.label }}
    </div>
  `,
})
export class ExpertBadge {
  expert = input.required<ExpertAdvisor>();
  expertConfigs: Record<
    ExpertAdvisor,
    {
      label: string;
      classes: string;
    }
  > = {
    rsiBreak: {
      label: EXPERT_NAMES['rsiBreak'],
      classes: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    },

    candleSuite: {
      label: EXPERT_NAMES['candleSuite'],
      classes: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
    },

    emaBb: {
      label: EXPERT_NAMES['emaBb'],
      classes: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
    },

    ichimoku: {
      label: EXPERT_NAMES['ichimoku'],
      classes: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
    },

    strategyCreator: {
      label: EXPERT_NAMES['strategyCreator'],
      classes: 'bg-pink-500/20 text-pink-300 border border-pink-500/30',
    },

    autoBot: {
      label: EXPERT_NAMES['autoBot'],
      classes: 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
    },
  };
}
