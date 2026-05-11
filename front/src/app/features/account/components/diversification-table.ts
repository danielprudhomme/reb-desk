import { Component, computed, input } from '@angular/core';
import { Robot } from '@shared/models/robot';

@Component({
  selector: 'app-diversification-table',
  template: `
    <div class="h-full w-full overflow-auto bg-neutral-950 text-neutral-100 p-4">
      <table class="border-collapse text-sm min-w-max shadow-2xl rounded-xl overflow-hidden">
        <thead>
          <tr>
            <th
              class="sticky top-0 left-0 z-20 bg-neutral-900 border border-neutral-700 p-3 font-semibold text-neutral-300"
            >
              Symbol \\ TF
            </th>

            @for (tf of displayedTimeframes(); track tf) {
              <th
                class="sticky top-0 z-10 bg-neutral-900 border border-neutral-700 p-3 min-w-[120px] font-semibold text-cyan-300"
              >
                {{ tf }}
              </th>
            }
          </tr>
        </thead>

        <tbody>
          @for (symbol of displayedSymbols(); track symbol) {
            <tr class="hover:bg-neutral-900/40 transition-colors">
              <td
                class="sticky left-0 z-10 bg-neutral-900 border border-neutral-700 p-3 font-bold text-neutral-200"
              >
                {{ symbol }}
              </td>

              @for (tf of displayedTimeframes(); track tf) {
                <td class="border border-neutral-800 p-2 text-center">
                  @if (getExpert(tf, symbol); as expert) {
                    <div
                      class="rounded-lg px-2 py-1 text-xs font-medium"
                      [class]="getExpertClass(expert)"
                    >
                      {{ expert }}
                    </div>
                  } @else {
                    <span class="text-neutral-600">-</span>
                  }
                </td>
              }
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class DiversificationTable {
  robots = input.required<Robot[]>();

  displayedSymbols = computed(() => {
    const set = new Set(this.robots().map((r) => r.symbol));
    return [...set];
  });

  displayedTimeframes = computed(() => {
    const set = new Set(this.robots().map((r) => r.timeframe));

    return [...set];
  });

  getExpert(timeframe: string, symbol: string): string | null {
    const robot = this.robots().find((r) => r.timeframe === timeframe && r.symbol === symbol);

    return robot?.expert ?? null;
  }

  getExpertClass(expert: string): string {
    switch (expert) {
      case 'candleSuite':
        return 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30';

      case 'emaBb':
        return 'bg-purple-500/20 text-purple-300 border border-purple-500/30';

      case 'rsiBreak':
        return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';

      case 'autoBot':
        return 'bg-orange-500/20 text-orange-300 border border-orange-500/30';

      case 'strategyCreator':
        return 'bg-pink-500/20 text-pink-300 border border-pink-500/30';

      default:
        return 'bg-neutral-800 text-neutral-200 border border-neutral-700';
    }
  }
}
