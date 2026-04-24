/**
 * Default component-map entries for `<Trans>` calls that render i18n
 * chapter text. Spread at the front of every Trans `components={}` so
 * the caller can still override per-call.
 *
 * Why this exists: i18n strings increasingly contain `<var>X_{Y}</var>`
 * for math variables with subscripts, plus the plain HTML `<sub>` /
 * `<sup>` for occasional inline subscripts. If a `<Trans>` components
 * map doesn't declare these, react-i18next renders them as literal
 * text and React HTML-escapes the angle brackets — readers see
 * «&lt;var&gt;V_{\mathrm{in}}&lt;/var&gt;» in the UI, which is always
 * a bug.
 *
 * Import and spread:
 *
 *     import { mathComponents } from '@/lib/trans-defaults'
 *     <Trans
 *       i18nKey="foo"
 *       components={{ ...mathComponents, strong: <strong /> }}
 *     />
 *
 * Callers can override any default by declaring the same key later
 * in their own map.
 */
import { MathVar } from '@/components/ui/math'

export const mathComponents = {
  var: <MathVar />,
  sub: <sub />,
  sup: <sup />,
} as const
