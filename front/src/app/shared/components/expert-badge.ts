import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { ExpertAdvisor, expertAdvisors } from '@shared/models/expert-advisor';
import { EXPERT_CONSTANTS } from '@shared/constants/expert.constants';

const expertColors: Record<ExpertAdvisor, string> = {
  candleSuite: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
  emaBb: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
  ichimoku: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
  rsiBreak: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  autoBot: 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
  strategyCreator: 'bg-rose-600/20 text-rose-400 border border-rose-600/30',
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
