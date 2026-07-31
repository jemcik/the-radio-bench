import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { ResultBox } from '@/components/ui/result-box'
import { cn } from '@/lib/utils'

interface Step {
  description: string
  result: string
}

interface Formula {
  name: string
  tex: string
  variables: string[]
  /** Per-variable solution steps. If a variable is absent, the widget shows
   *  a single "already isolated" step derived from `tex`. */
  solveSteps: Record<string, Step[]>
}

const buildFormulas = (t: (key: string) => string): Formula[] => [
  {
    name: t('ch0_3.formulaOhmsLaw'),
    tex: 'V = I × R',
    variables: ['V', 'I', 'R'],
    solveSteps: {
      I: [
        { description: t('ch0_3.formulaStartWith'), result: 'V = I × R' },
        { description: `${t('ch0_3.formulaDivideBothSides')} R`, result: 'I = V / R' },
      ],
      R: [
        { description: t('ch0_3.formulaStartWith'), result: 'V = I × R' },
        { description: `${t('ch0_3.formulaDivideBothSides')} I`, result: 'R = V / I' },
      ],
    },
  },
  {
    name: t('ch0_3.formulaPowerVC'),
    tex: 'P = I × V',
    variables: ['P', 'I', 'V'],
    solveSteps: {
      I: [
        { description: t('ch0_3.formulaStartWith'), result: 'P = I × V' },
        { description: `${t('ch0_3.formulaDivideBothSides')} V`, result: 'I = P / V' },
      ],
      V: [
        { description: t('ch0_3.formulaStartWith'), result: 'P = I × V' },
        { description: `${t('ch0_3.formulaDivideBothSides')} I`, result: 'V = P / I' },
      ],
    },
  },
  {
    name: t('ch0_3.formulaPowerIR'),
    tex: 'P = I² × R',
    variables: ['P', 'I', 'R'],
    solveSteps: {
      I: [
        { description: t('ch0_3.formulaStartWith'), result: 'P = I² × R' },
        { description: `${t('ch0_3.formulaDivideBothSides')} R`, result: 'P / R = I²' },
        { description: t('ch0_3.formulaTakeSquareRoot'), result: 'I = √(P / R)' },
      ],
      R: [
        { description: t('ch0_3.formulaStartWith'), result: 'P = I² × R' },
        { description: `${t('ch0_3.formulaDivideBothSides')} I²`, result: 'R = P / I²' },
      ],
    },
  },
  {
    name: t('ch0_3.formulaPowerVR'),
    tex: 'P = V² / R',
    variables: ['P', 'V', 'R'],
    solveSteps: {
      V: [
        { description: t('ch0_3.formulaStartWith'), result: 'P = V² / R' },
        { description: `${t('ch0_3.formulaMultiplyBothSides')} R`, result: 'P × R = V²' },
        { description: t('ch0_3.formulaTakeSquareRoot'), result: 'V = √(P × R)' },
      ],
      R: [
        { description: t('ch0_3.formulaStartWith'), result: 'P = V² / R' },
        { description: `${t('ch0_3.formulaMultiplyBothSides')} R`, result: 'P × R = V²' },
        { description: `${t('ch0_3.formulaDivideBothSides')} P`, result: 'R = V² / P' },
      ],
    },
  },
  {
    name: t('ch0_3.formulaFrequencyPeriod'),
    tex: 'f = 1 / T',
    variables: ['f', 'T'],
    solveSteps: {
      T: [
        { description: t('ch0_3.formulaStartWith'), result: 'f = 1 / T' },
        { description: t('ch0_3.formulaTakeReciprocal'), result: 'T = 1 / f' },
      ],
    },
  },
]

export default function FormulaTransposer() {
  const { t } = useTranslation('ui')
  const [selectedFormulaIndex, setSelectedFormulaIndex] = useState(0)
  const [selectedVariable, setSelectedVariable] = useState<string | null>(null)

  const FORMULAS = useMemo(() => buildFormulas(t), [t])
  const selectedFormula = FORMULAS[selectedFormulaIndex]

  // Derive the active variable from stored state — when the stored choice
  // isn't part of the current formula (e.g. just switched from Ohm's law to
  // the reciprocal formula) fall back to the formula's first variable.
  // The formula-button click handler also resets `selectedVariable` to null
  // so this fallback kicks in cleanly.
  const variable =
    selectedVariable && selectedFormula.variables.includes(selectedVariable)
      ? selectedVariable
      // Fall back to the first variable that actually has a rearrangement to show.
      // Defaulting to variables[0] opened Ohm's law on «V already stands on its
      // own» — a step that demonstrates nothing — and opened f = 1/T on `f`,
      // hiding the reciprocal move the prose sends the reader there to see.
      : (selectedFormula.variables.find(v => selectedFormula.solveSteps[v])
         ?? selectedFormula.variables[0])

  const steps: Step[] = useMemo(() => {
    const custom = selectedFormula.solveSteps[variable]
    if (custom) return custom
    // Already-isolated case — derive the step from `tex` so data stays terse.
    return [{
      description: `${variable} ${t('ch0_3.formulaAlreadyIsolated')}`,
      result: selectedFormula.tex,
    }]
  }, [variable, selectedFormula, t])

  return (
    <Widget
      title={t('ch0_3.formulaTransposerTitle')}
      description={t('ch0_3.formulaTransposerDescription')}
    >
      {/* Formula selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">
          {t('ch0_3.formulaTransposerChoose')}
        </label>
        <div className="flex flex-wrap gap-2">
          {FORMULAS.map((formula, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedFormulaIndex(idx)
                setSelectedVariable(null)
              }}
              aria-pressed={selectedFormulaIndex === idx}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-all border',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                selectedFormulaIndex === idx
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border bg-card text-foreground hover:border-primary/50',
              )}
            >
              {/* `formula.name` was computed and never rendered, so the reader saw a
                  bare `f = 1 / T` with neither letter defined anywhere in this chapter. */}
              <span className="flex flex-col items-center gap-0.5">
                <span className="text-[11px] opacity-80">{formula.name}</span>
                <span className="font-mono">{formula.tex}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Variable selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">
          {t('ch0_3.formulaTransposerSolveFor')}
        </label>
        <div className="flex flex-wrap gap-2">
          {selectedFormula.variables.map((varName) => (
            <button
              key={varName}
              onClick={() => setSelectedVariable(varName)}
              aria-pressed={variable === varName}
              className={cn(
                'px-3 py-1.5 rounded text-sm font-medium transition-all border',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                variable === varName
                  ? 'bg-primary/20 text-primary border-primary/50'
                  : 'border-border bg-card text-foreground hover:border-primary/30',
              )}
            >
              <span className="font-mono font-bold text-base">{varName}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3 pt-4 border-t border-border">
        {steps.map((step, idx) => (
          <div key={idx} className="flex gap-3 items-start rounded-lg p-3 border bg-primary/5 border-primary/30">
            <div className="flex items-center justify-center w-7 h-7 rounded-full flex-shrink-0 bg-primary text-primary-foreground text-sm font-bold">
              {idx + 1}
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <p className="text-sm text-muted-foreground">{step.description}</p>
              <p className="font-mono text-base font-semibold text-foreground">{step.result}</p>
            </div>
          </div>
        ))}

        {/* The "Rearranged" highlight only adds value when there is real
            work above it. For the already-isolated case (one step whose
            result equals the formula itself), the lone step IS the answer
            and the success box would just repeat it. */}
        {steps.length > 1 && (
          <ResultBox tone="success" label={t('ch0_3.formulaTransposerResult')}>
            <p className="font-mono text-lg font-bold text-foreground">
              {steps[steps.length - 1]?.result}
            </p>
          </ResultBox>
        )}
      </div>
    </Widget>
  )
}
