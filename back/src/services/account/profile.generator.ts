import expertConst from '@shared/constants/expert.constants.ts';
import { Robot } from '@shared/models/robot.ts';
import { Timeframe } from '@shared/models/timeframe.ts';
import { EXPORTS_PATH } from '@src/config.ts';
import { writeFile } from 'fs/promises';
import path from 'path';
import { buildParametersInFile } from '../reb-report/reb-report.generator.ts';
import { fileService } from '../file.service.ts';
import { ExpertParameterConfig } from '@src/models/expert-parameter-config.ts';

export const profileGenerator = {
  async generateChr(robot: Robot): Promise<void> {
    await fileService.ensureDirectory(EXPORTS_PATH);

    const { name: expertName, ex5Name } = expertConst.EXPERT_CONSTANTS[robot.expert];

    const { periodType, periodSize } = getPeriodConfig(robot.timeframe);

    const parameters =
      robot.parameterSet?.parameters.map(
        (param) =>
          ({
            name: param.name,
            value: param.value,
            variable: false,
            min: 0,
            max: 0,
            step: 0,
          }) as ExpertParameterConfig,
      ) ?? [];

    const content = `<chart>
symbol=${robot.symbol}
period_type=${periodType}
period_size=${periodSize}
<expert>
name=${ex5Name}
path=Experts\\${ex5Name}.ex5
expertmode=1
<inputs>
${buildParametersInFile(robot, parameters)}

</chart>
`;

    const filename = `${robot.symbol}-${robot.timeframe}-${expertName.replaceAll(' ', '-')}.chr`;

    const filePath = path.join(EXPORTS_PATH, filename);
    await writeFile(filePath, content, 'utf-8');
  },

  async generateOpenOrderAlertChr(drawdown: number): Promise<void> {
    await fileService.ensureDirectory(EXPORTS_PATH);

    const content = `<chart>
id=7017193781657
symbol=EURCAD
description=Euro vs Canadian Dollar
period_type=1
period_size=1
digits=5
tick_size=0.000000
position_time=1784563200
scale_fix=0
scale_fixed_min=1.599200
scale_fixed_max=1.609400
scale_fix11=0
scale_bar=0
scale_bar_val=1.000000
scale=16
mode=1
fore=0
grid=0
volume=1
scroll=1
shift=0
shift_size=20.174800
fixed_pos=0.000000
ticker=1
ohlc=0
one_click=0
one_click_btn=1
bidline=1
askline=1
lastline=0
days=0
descriptions=0
tradelines=1
tradehistory=1
window_left=196
window_top=196
window_right=2795
window_bottom=777
window_type=3
floating=0
floating_left=0
floating_top=0
floating_right=0
floating_bottom=0
floating_type=1
floating_toolbar=1
floating_tbstate=
background_color=2626570
foreground_color=16777215
barup_color=6602270
bardown_color=3947760
bullcandle_color=6602270
bearcandle_color=3947760
chartline_color=65280
volumes_color=3329330
grid_color=10061943
bidline_color=10061943
askline_color=255
lastline_color=49152
stops_color=255
windows_total=1

<expert>
name=REB Open Orders Alert
path=Experts\\REB Open Orders Alert.ex5
expertmode=5
<inputs>
<unnamed>=
Gain_Sur_Compte_En_Monnaie_Depasse=0.0
Perte_Sur_Compte_En_Monnaie_Depasse=0.0
Gain_Sur_Compte_En_Pourcent_Depasse=0.0
Perte_Sur_Compte_En_Pourcent_Depasse=${drawdown.toFixed(1)}
Nombre_De_Magics_Sur_Compte_Depasse=-1
Nombre_De_Symboles_Actifs_Sur_Compte_Depasse=-1
Nombre_De_Magics_Sur_Un_Symbole_Sur_Compte_Depasse=-1
Gain_Journalier_Sur_Compte_En_Pourcent_Depasse=0.0
Perte_Journalier_Sur_Compte_En_Pourcent_Depasse=0.0
Marge_Sur_Compte_En_Pourcent_Inferieure=0.0
<unnamed>=
Gain_Sur_Symbole_En_Monnaie_Depasse=0.0
Perte_Sur_Symbole_En_Monnaie_Depasse=0.0
Gain_Sur_Symbole_En_Pourcent_Depasse=0.0
Perte_Sur_Symbole_En_Pourcent_Depasse=0.0
Nombre_De_Magics_Sur_Symbole_Depasse=-1
<unnamed>=
Cloturer_Toutes_Les_Positions=true
Cloturer_Les_Positions_Sur_Symbole=false
Arreter_Auto_Trading=false
Activer_Auto_Trading_Quand_Plus_De_Conditions=false
Minutes_Avant_Activation_Auto_Trading=0.0
Variable_Externe_A_Ajouter=
Retirer_Variable_Externe_Quand_Plus_De_Conditions=false
Minutes_Avant_Retrait_Variable_Externe=0.0
Envoyer_Alertes=false
Envoyer_Notifications=false
Delai_Entre_Envois_En_Minutes=60
</inputs>
</expert>

<window>
height=100.000000
objects=0

<indicator>
name=Main
path=
apply=1
show_data=1
scale_inherit=0
scale_line=0
scale_line_percent=50
scale_line_value=0.000000
scale_fix_min=0
scale_fix_min_val=0.000000
scale_fix_max=0
scale_fix_max_val=0.000000
expertmode=0
fixed_height=-1
</indicator>
</window>
</chart>
`;

    const filePath = path.join(EXPORTS_PATH, 'OOA.chr');
    await writeFile(filePath, content, 'utf-8');
  },
};

function getPeriodConfig(timeframe: Timeframe): { periodType: number; periodSize: number } {
  if (timeframe === 'D') {
    throw new Error('Not defined for D');
  }

  const typeChar = timeframe[0]; // M or H
  const size = Number(timeframe.slice(1));

  return {
    periodType: typeChar === 'M' ? 0 : 1,
    periodSize: size,
  };
}
