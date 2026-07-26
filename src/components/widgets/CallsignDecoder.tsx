/**
 * Chapter 4.4 §6 — call sign decoder.
 *
 * The teaching point is the contrast, not the lookup. Two call signs that look
 * structurally identical — two letters, a digit, a suffix — carry their
 * geography in completely different places:
 *
 *   UR5HAA  the digit means nothing; the oblast is the FIRST SUFFIX LETTER (H)
 *   W1AW    the digit IS the call area; the suffix carries no geography
 *
 * So the widget always shows where the country came from (the ITU Appendix 42
 * prefix block), and then, for the two systems the chapter teaches in detail,
 * what the remaining parts do. For every other prefix it names the country and
 * stops, rather than pretending to a completeness it does not have.
 *
 * Sources: ITU Radio Regulations Appendix 42 (prefix blocks); Регламент
 * аматорського радіозв'язку України, Додаток 31 (oblast letters, station-type
 * letter, UR0 reservation); FCC call-sign region map (US call areas).
 */
import { useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import Widget from '@/components/ui/widget'
import { ResultBox } from '@/components/ui/result-box'
import { mathComponents } from '@/lib/trans-defaults'

/** Ukrainian oblast letter → i18n key suffix. Додаток 31; O is deliberately unused. */
const UA_OBLAST: Record<string, string> = {
  A: 'sumy', B: 'ternopil', C: 'cherkasy', D: 'zakarpattia', E: 'dnipro',
  F: 'odesa', G: 'kherson', H: 'poltava', I: 'donetsk', J: 'crimea',
  K: 'rivne', L: 'kharkiv', M: 'luhansk', N: 'vinnytsia', P: 'volyn',
  Q: 'zaporizhzhia', R: 'chernihiv', S: 'ivanofrankivsk', T: 'khmelnytskyi',
  U: 'kyiv', V: 'kirovohrad', W: 'lviv', X: 'zhytomyr', Y: 'chernivtsi',
  Z: 'mykolaiv',
}

/**
 * US insular-area prefixes — Hawaii, Alaska, the Caribbean and the Pacific. Their digit
 * is not a mainland call area, so US_AREA must not be consulted for them: KH6 is Hawaii,
 * not California. Verified against the decoder in the browser.
 */
const US_INSULAR = /^[AKNW][HLP]$/

/** US call areas by numeral. FCC numbers its regions 1–13; the numeral is a separate column. */
const US_AREA: Record<string, string> = {
  '1': 'us1', '2': 'us2', '3': 'us3', '4': 'us4', '5': 'us5',
  '6': 'us6', '7': 'us7', '8': 'us8', '9': 'us9', '0': 'us0',
}

type Admin = 'ua' | 'us' | 'other' | 'unknown'

/** A deliberately partial table: enough that common calls resolve, honest about the rest. */
const PREFIX_COUNTRY: { test: RegExp; key: string; admin: Admin }[] = [
  { test: /^(UR|US|UT|UU|UV|UW|UX|UY|UZ)/, key: 'ukraine', admin: 'ua' },
  { test: /^(EM|EN|EO)/, key: 'ukraineSpecial', admin: 'ua' },
  { test: /^(A[A-L]|K|N|W)/, key: 'unitedStates', admin: 'us' },
  { test: /^(D[A-R])/, key: 'germany', admin: 'other' },
  { test: /^(G|M|2[A-Z])/, key: 'unitedKingdom', admin: 'other' },
  { test: /^F/, key: 'france', admin: 'other' },
  { test: /^(SP|SN|SO|SQ|SR|3Z)/, key: 'poland', admin: 'other' },
  { test: /^(OK|OL)/, key: 'czechia', admin: 'other' },
  { test: /^(OM|OM[0-9])/, key: 'slovakia', admin: 'other' },
  { test: /^(HA|HG)/, key: 'hungary', admin: 'other' },
  { test: /^(YO|YP|YQ|YR)/, key: 'romania', admin: 'other' },
  { test: /^(LY)/, key: 'lithuania', admin: 'other' },
  { test: /^(YL)/, key: 'latvia', admin: 'other' },
  { test: /^(ES)/, key: 'estonia', admin: 'other' },
  { test: /^(S[A-M])/, key: 'sweden', admin: 'other' },
  { test: /^(L[A-N])/, key: 'norway', admin: 'other' },
  { test: /^(OH|OF|OG|OI)/, key: 'finland', admin: 'other' },
  { test: /^(P[A-I])/, key: 'netherlands', admin: 'other' },
  { test: /^(O[N-T])/, key: 'belgium', admin: 'other' },
  { test: /^(E[A-H])/, key: 'spain', admin: 'other' },
  { test: /^(I|IZ|IK)/, key: 'italy', admin: 'other' },
  { test: /^(HB)/, key: 'switzerland', admin: 'other' },
  { test: /^(OE)/, key: 'austria', admin: 'other' },
  { test: /^(J[A-S]|7[J-N])/, key: 'japan', admin: 'other' },
  { test: /^(V[A-G]|VO|V[X-Y])/, key: 'canada', admin: 'other' },
  { test: /^(V[H-N]|AX)/, key: 'australia', admin: 'other' },
  { test: /^(P[P-Y])/, key: 'brazil', admin: 'other' },
]

interface Decoded {
  /** Cleaned call sign, uppercased, secondary indicator stripped. */
  call: string
  prefix: string
  digit: string
  suffix: string
  /** Present only when the call sign carries a `/P`-style indicator. */
  indicator: string | null
  countryKey: string | null
  admin: Admin
  /** «2×3» etc. — prefix letters × suffix letters. */
  format: string | null
}

export function decode(raw: string): Decoded | null {
  const cleaned = raw.toUpperCase().replace(/[^A-Z0-9/]/g, '')
  if (!cleaned) return null

  // A visiting operator writes UT/DL1ABC — the home call is the LONGER part.
  const segments = cleaned.split('/').filter(Boolean)
  if (segments.length === 0) return null
  const body = segments.reduce((a, b) => (b.length > a.length ? b : a))
  const indicator = segments.find(sg => sg !== body) ?? null

  const m = /^([A-Z0-9]{1,2}?)([0-9])([A-Z]*)$/.exec(body)
  if (!m) return null
  const [, prefix, digit, suffix] = m

  const found = PREFIX_COUNTRY.find(p => p.test.test(body))
  return {
    call: body,
    prefix,
    digit,
    suffix,
    indicator,
    countryKey: found?.key ?? null,
    admin: found?.admin ?? 'unknown',
    format: suffix ? `${prefix.length}×${suffix.length}` : null,
  }
}

export default function CallsignDecoder() {
  const { t } = useTranslation('ui')
  const [input, setInput] = useState('UR5HAA')

  const result = useMemo(() => decode(input), [input])

  const presets = ['UR5HAA', 'W1AW', 'UR0FVA', 'UT/DL1ABC'] as const

  const isUaRepeater = result?.admin === 'ua' && result.prefix === 'UR' && result.digit === '0'
  // EM/EN/EO are special-event and contest calls; their suffix does not encode an oblast.
  const isUaSpecial = result?.countryKey === 'ukraineSpecial'
  const readsOblast = result?.admin === 'ua' && !isUaRepeater && !isUaSpecial
  const oblastKey = readsOblast ? UA_OBLAST[result.suffix[0]] : undefined
  const areaKey =
    result && result.admin === 'us' && !US_INSULAR.test(result.prefix) ? US_AREA[result.digit] : undefined
  const uaCollective =
    readsOblast && result.suffix.length === 3 ? /[W-Z]/.test(result.suffix[1]) : false

  return (
    <Widget
      title={t('ch4_4.decoder.title')}
      description={<Trans i18nKey="ch4_4.decoder.description" ns="ui" components={{ ...mathComponents }} />}
    >
      <div className="flex flex-wrap items-end gap-4 text-sm">
        <div className="flex flex-col gap-1">
          <label htmlFor="dec-input" className="text-foreground font-medium">
            {t('ch4_4.decoder.inputLabel')}
          </label>
          <input
            id="dec-input"
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            className="border border-border rounded px-2 py-1 bg-background text-foreground font-mono text-sm w-44"
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-foreground font-medium">{t('ch4_4.decoder.presetLabel')}</span>
          <div className="flex flex-wrap gap-2">
            {presets.map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setInput(p)}
                className="border border-border rounded px-2 py-1 bg-background text-foreground font-mono text-sm hover:bg-muted"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {result === null ? (
        <p className="text-sm text-muted-foreground" data-testid="dec-invalid">
          {t('ch4_4.decoder.invalid')}
        </p>
      ) : (
        <>
          {/* The three parts, laid out so the reader sees the structure before the meaning */}
          <div className="flex flex-wrap gap-2" data-testid="dec-parts">
            <div className="rounded-md border border-border bg-muted/30 px-3 py-2">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{t('ch4_4.decoder.partPrefix')}</p>
              <p className="text-2xl font-mono font-semibold text-foreground">{result.prefix}</p>
            </div>
            <div className="rounded-md border border-border bg-muted/30 px-3 py-2">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{t('ch4_4.decoder.partDigit')}</p>
              <p className="text-2xl font-mono font-semibold text-foreground">{result.digit}</p>
            </div>
            <div className="rounded-md border border-border bg-muted/30 px-3 py-2">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{t('ch4_4.decoder.partSuffix')}</p>
              <p className="text-2xl font-mono font-semibold text-foreground">{result.suffix || '—'}</p>
            </div>
            {result.indicator && (
              <div className="rounded-md border border-border bg-muted/30 px-3 py-2">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{t('ch4_4.decoder.partIndicator')}</p>
                <p className="text-2xl font-mono font-semibold text-foreground">{result.indicator}</p>
              </div>
            )}
          </div>

          <ResultBox tone="primary" label={t('ch4_4.decoder.resultLabel')}>
            <p className="text-foreground mb-2" data-testid="dec-country">
              {result.countryKey
                ? t(`ch4_4.decoder.country.${result.countryKey}`)
                : t('ch4_4.decoder.countryUnknown')}
            </p>

            {result.admin === 'ua' && (
              <div className="text-sm text-foreground space-y-1" data-testid="dec-ua">
                {isUaRepeater ? (
                  <p>{t('ch4_4.decoder.uaRepeater')}</p>
                ) : oblastKey ? (
                  <p>
                    {t('ch4_4.decoder.uaOblastLead')}{' '}
                    <strong>{t(`ch4_4.decoder.oblast.${oblastKey}`)}</strong>
                  </p>
                ) : null}
                {readsOblast && result.suffix.length === 3 && (
                  <p>{uaCollective ? t('ch4_4.decoder.uaCollective') : t('ch4_4.decoder.uaIndividual')}</p>
                )}
                {readsOblast && <p className="text-muted-foreground">{t('ch4_4.decoder.uaDigitNote')}</p>}
              </div>
            )}

            {result.admin === 'us' && (
              <div className="text-sm text-foreground space-y-1" data-testid="dec-us">
                {areaKey && (
                  <p>
                    {t('ch4_4.decoder.usAreaLead')} <strong>{t(`ch4_4.decoder.area.${areaKey}`)}</strong>
                  </p>
                )}
                <p className="text-muted-foreground">{t('ch4_4.decoder.usSuffixNote')}</p>
              </div>
            )}

            {result.format && (
              <p className="text-sm text-muted-foreground mt-2" data-testid="dec-format">
                {t('ch4_4.decoder.formatLead')} <span className="font-mono">{result.format}</span>
              </p>
            )}

            {result.indicator && (
              <p className="text-sm text-muted-foreground mt-2" data-testid="dec-indicator-note">
                {t('ch4_4.decoder.indicatorNote', { indicator: result.indicator })}
              </p>
            )}
          </ResultBox>
        </>
      )}

      <p className="text-[13px] text-muted-foreground rounded-md border border-callout-note/30 bg-callout-note/[0.06] px-3 py-2">
        {t('ch4_4.decoder.tableNote')}
      </p>
    </Widget>
  )
}
