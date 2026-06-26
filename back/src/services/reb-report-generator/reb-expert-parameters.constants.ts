export const REB_EXPERT_PARAMETERS: Record<'candleSuite' | 'emaBb' | 'rsiBreak', string[]> = {
  candleSuite: [
    `Suite=4||4||1||6||Y
Extreme_Research=50||100||200||500||Y`,
  ],

  emaBb: [
    `EMA_Slow_Period=200||50||0||200||N
BB_Period=20||20||0||100||Y
BB_Deviation=1||2||1||3||Y
BB_Way=1||0||0||1||Y`,
  ],

  rsiBreak: [
    `Extreme_Research=500||50||250||500||Y
RSI_Period=14||14||1||140||N
RSI_Start=30||30||20||50||Y
Delta_RSI_Buy=20||20||20||40||Y`,
  ],
};
