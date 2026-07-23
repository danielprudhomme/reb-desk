import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { ExpertAdvisor, expertAdvisors } from '@shared/models/expert-advisor';
import { EXPERT_CONSTANTS } from '@shared/constants/expert.constants';

const expertColors: Record<ExpertAdvisor, string> = {
  // Standalone experts
  candleSuite: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
  emaBb: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
  ichimoku: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
  rsiBreak: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  autoBot: 'bg-orange-500/20 text-orange-300 border border-orange-500/30',

  // Score Combo (SC) family
  scBbEngulfing: 'bg-pink-500/20 text-pink-300 border border-pink-500/30',
  scIchiSar: 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30',
  scRsiBb: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
  scEmaRsi: 'bg-violet-500/20 text-violet-300 border border-violet-500/30',
  scEmaMacd: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
  scRsiEngulfing: 'bg-pink-600/20 text-pink-400 border border-pink-600/30',
  scEmaSar: 'bg-fuchsia-600/20 text-fuchsia-400 border border-fuchsia-600/30',
  scRsiOnly: 'bg-rose-600/20 text-rose-400 border border-rose-600/30',
  scStochOnly: 'bg-violet-600/20 text-violet-400 border border-violet-600/30',
};

@Component({
  selector: 'app-expert-badge',
  changeDetection: ChangeDetectionStrategy.Eager,
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
  expertConfigs = Object.fromEntries(
    expertAdvisors.map((expert) => [
      expert,
      {
        label: EXPERT_CONSTANTS[expert].name,
        classes: expertColors[expert],
      },
    ]),
  ) as Record<
    ExpertAdvisor,
    {
      label: string;
      classes: string;
    }
  >;
}
