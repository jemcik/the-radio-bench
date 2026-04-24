// Chapter 0.2 — Lab Bench Setup
import { useTranslation, Trans } from 'react-i18next'
import LabActivity from '@/components/lab/LabActivity'
import MultimeterDiagram from '@/components/diagrams/MultimeterDiagram'
import OscilloscopeDiagram from '@/components/diagrams/OscilloscopeDiagram'
import BreadboardDiagram from '@/components/diagrams/BreadboardDiagram'
import { Callout } from '@/components/ui/callout'
import { Section } from '@/components/ui/section-heading'
import { G } from '@/features/glossary/glossary-term'
import { mathComponents } from '@/lib/trans-defaults'

export default function Chapter0_2() {
  const { t } = useTranslation('ui')

  return (
    <>
      <p>{t('ch0_2.intro')}</p>

      <p>
        <Trans i18nKey="ch0_2.coversInstruments" ns="ui"
          components={{ ...mathComponents, multimeter: <G k="multimeter" />,
            oscilloscope: <G k="oscilloscope" />,
            vna: <G k="vna" />,
            strong: <strong />, }}
        />
      </p>

      <Section id="multimeter" labelKey="ch0_2.sectionMultimeter" />

      <p>
        <Trans i18nKey="ch0_2.multimeterIntro" ns="ui"
          components={{ ...mathComponents, voltage: <G k="voltage" />,
            current: <G k="current" />,
            resistance: <G k="resistance" />,
            continuity: <G k="continuity" />,
            diode: <G k="diode testing" />,
            capacitance: <G k="capacitance" />, }}
        />
      </p>

      <Callout variant="danger">{t('ch0_2.multimeterDanger')}</Callout>

      <MultimeterDiagram />

      <ul>
        <li>
          <strong>{t('ch0_2.voltageLabel')}</strong> {t('ch0_2.voltageDesc')}
        </li>
        <li>
          <strong>{t('ch0_2.currentLabel')}</strong> {t('ch0_2.currentDesc')}
        </li>
        <li>
          <strong>{t('ch0_2.resistanceLabel')}</strong> {t('ch0_2.resistanceDesc')}
        </li>
      </ul>

      <p>
        <Trans i18nKey="ch0_2.multimeterBuying" ns="ui"
          components={{ ...mathComponents, strong: <strong /> }}
        />
      </p>

      <p>
        <Trans i18nKey="ch0_2.multimeterTrueRms" ns="ui"
          components={{ ...mathComponents, strong: <strong />, ac: <G k="ac" />, pwm: <G k="pwm" /> }}
        />
      </p>

      <Section id="oscilloscope" labelKey="ch0_2.sectionOscilloscope" />

      <p>{t('ch0_2.scopeIntro')}</p>

      <p>
        <Trans i18nKey="ch0_2.scopeControls" ns="ui"
          components={{ ...mathComponents, timediv: <G k="time/div" />,
            voltdiv: <G k="volt/div" />, }}
        />
      </p>

      <OscilloscopeDiagram />

      <Callout variant="key">
        <Trans i18nKey="ch0_2.scopeKey" ns="ui"
          components={{ ...mathComponents, strong: <strong /> }}
        />
      </Callout>

      <p>
        <Trans i18nKey="ch0_2.scopeSpecs" ns="ui"
          components={{ ...mathComponents, strong: <strong />, hf: <G k="hf" />, vhf: <G k="vhf" /> }}
        />
      </p>

      <p>
        <Trans i18nKey="ch0_2.scopeRecommendation" ns="ui"
          components={{ ...mathComponents, strong: <strong /> }}
        />
      </p>

      <p>
        <Trans i18nKey="ch0_2.scopeProbes" ns="ui"
          components={{ ...mathComponents, strong: <strong /> }}
        />
      </p>

      <p>
        <Trans i18nKey="ch0_2.scopeTriggering" ns="ui"
          components={{ ...mathComponents, strong: <strong /> }}
        />
      </p>

      <Section id="vna" labelKey="ch0_2.sectionVna" />

      <p>
        <Trans i18nKey="ch0_2.vnaIntro" ns="ui"
          components={{ ...mathComponents, impedance: <G k="impedance" />,
            swr: <G k="swr" />,
            lc: <G k="lc" />, }}
        />
      </p>

      <Callout variant="caution">
        <Trans i18nKey="ch0_2.vnaCaution" ns="ui"
          components={{ ...mathComponents, calibrated: <G k="calibrated" /> }}
        />
      </Callout>

      <p>{t('ch0_2.vnaNote')}</p>

      <p>
        <Trans i18nKey="ch0_2.vnaHobby" ns="ui"
          components={{ ...mathComponents, strong: <strong />, hf: <G k="hf" />, vhf: <G k="vhf" /> }}
        />
      </p>

      <p>
        <Trans i18nKey="ch0_2.vnaSparams" ns="ui"
          components={{ ...mathComponents, strong: <strong />, swr: <G k="swr" /> }}
        />
      </p>

      <Section id="arduino" labelKey="ch0_2.sectionArduino" />

      <p>
        <Trans i18nKey="ch0_2.arduinoIntro" ns="ui"
          components={{ ...mathComponents, pwm: <G k="pwm" />,
            square: <G k="square wave" />,
            freq: <G k="frequency" />,
            ac: <G k="ac" />, }}
        />
      </p>

      <p>
        <Trans i18nKey="ch0_2.arduinoPins" ns="ui"
          components={{ ...mathComponents, pwm: <G k="pwm" /> }}
        />
      </p>

      <Callout variant="note">{t('ch0_2.arduinoNote')}</Callout>

      <Section id="breadboard" labelKey="ch0_2.sectionBreadboard" />

      <p>
        <Trans i18nKey="ch0_2.breadboardIntro" ns="ui"
          components={{ ...mathComponents, breadboard: <G k="breadboard" /> }}
        />
      </p>

      <BreadboardDiagram />

      <ul>
        <li>{t('ch0_2.breadboardRails')}</li>
        <li>{t('ch0_2.breadboardRows')}</li>
        <li>
          <Trans i18nKey="ch0_2.breadboardGap" ns="ui"
            components={{ ...mathComponents, dip: <G k="dip chip" /> }}
          />
        </li>
      </ul>

      <p>
        <Trans i18nKey="ch0_2.breadboardSizes" ns="ui"
          components={{ ...mathComponents, strong: <strong /> }}
        />
      </p>

      <p>{t('ch0_2.breadboardQuality')}</p>

      <p>
        <Trans i18nKey="ch0_2.breadboardJumpers" ns="ui"
          components={{ ...mathComponents, strong: <strong /> }}
        />
      </p>

      <Section id="accessories" labelKey="ch0_2.sectionAccessories" />

      <p>{t('ch0_2.accessoriesIntro')}</p>

      <ul>
        <li>
          <Trans i18nKey="ch0_2.accessoriesClips" ns="ui"
            components={{ ...mathComponents, strong: <strong /> }}
          />
        </li>
        <li>
          <Trans i18nKey="ch0_2.accessoriesStrippers" ns="ui"
            components={{ ...mathComponents, strong: <strong /> }}
          />
        </li>
        <li>
          <Trans i18nKey="ch0_2.accessoriesMagnifier" ns="ui"
            components={{ ...mathComponents, strong: <strong /> }}
          />
        </li>
        <li>
          <Trans i18nKey="ch0_2.accessoriesEsd" ns="ui"
            components={{ ...mathComponents, strong: <strong /> }}
          />
        </li>
        <li>
          <Trans i18nKey="ch0_2.accessoriesPsu" ns="ui"
            components={{ ...mathComponents, strong: <strong /> }}
          />
        </li>
      </ul>

      <Section id="voltage-safety" labelKey="ch0_2.sectionSafety" />

      <p>
        <Trans i18nKey="ch0_2.safetyIntro" ns="ui"
          components={{ ...mathComponents, strong: <strong />,
            dc: <G k="dc" />, }}
        />
      </p>

      <Callout variant="danger">
        <Trans i18nKey="ch0_2.safetyDanger" ns="ui"
          components={{ ...mathComponents, strong: <strong /> }}
        />
      </Callout>

      <Callout variant="tip">{t('ch0_2.safetyTip')}</Callout>

      <LabActivity
        goal={t('ch0_2.labGoal')}
        equipment={[
          t('ch0_2.labEquip1'),
          t('ch0_2.labEquip2'),
          <Trans key="equip3" i18nKey="ch0_2.labEquip3" ns="ui"
            components={{ ...mathComponents, arduino: <G k="arduino" />, usb: <G k="usb" /> }}
          />,
          t('ch0_2.labEquip4'),
        ]}
        components={[
          t('ch0_2.labComp1'),
          t('ch0_2.labComp2'),
          t('ch0_2.labComp3'),
        ]}
        procedure={[
          {
            text: <Trans i18nKey="ch0_2.labStep1" ns="ui" components={{ ...mathComponents, dc: <G k="dc" /> }} />,
            note: t('ch0_2.labStep1Note'),
          },
          {
            text: <Trans i18nKey="ch0_2.labStep2" ns="ui"
              components={{ ...mathComponents, arduino: <G k="arduino" />, usb: <G k="usb" />, ide: <G k="ide" />, led: <G k="led" /> }}
            />,
          },
          {
            text: t('ch0_2.labStep3'),
            note: <Trans i18nKey="ch0_2.labStep3Note" ns="ui" components={{ ...mathComponents, square: <G k="square wave" /> }} />,
          },
          {
            text: <Trans i18nKey="ch0_2.labStep4" ns="ui"
              components={{ ...mathComponents, arduino: <G k="arduino" />, arduino2: <G k="arduino" />, gnd: <G k="gnd" />, timediv: <G k="time/div" />, voltdiv: <G k="volt/div" /> }}
            />,
          },
          {
            text: <Trans i18nKey="ch0_2.labStep5" ns="ui"
              components={{ ...mathComponents, square: <G k="square wave" />, cursor: <G k="cursor" /> }}
            />,
          },
          {
            text: <Trans i18nKey="ch0_2.labStep6" ns="ui"
              components={{ ...mathComponents, ac: <G k="ac" />, ac2: <G k="ac" />, gnd: <G k="gnd" />, rms: <G k="rms" />, rms2: <G k="rms" />, square: <G k="square wave" /> }}
            />,
          },
          {
            text: <Trans i18nKey="ch0_2.labStep7" ns="ui"
              components={{ ...mathComponents, gnd: <G k="gnd" />, breadboard: <G k="breadboard" />, inputz: <G k="input impedance" /> }}
            />,
          },
        ]}
        expectedResult={
          <Trans i18nKey="ch0_2.labExpected" ns="ui"
            components={{ ...mathComponents, square: <G k="square wave" />, pp: <G k="peak-to-peak" />, ac: <G k="ac" />, pwm: <G k="pwm" /> }}
          />
        }
        connectionToTheory={
          <Trans i18nKey="ch0_2.labConnection" ns="ui"
            components={{ ...mathComponents, dc: <G k="dc" /> }}
          />
        }
        troubleshooting={[
          <Trans key="t1" i18nKey="ch0_2.labTrouble1" ns="ui"
            components={{ ...mathComponents, arduino: <G k="arduino" />, gnd: <G k="gnd" />, voltdiv: <G k="volt/div" /> }}
          />,
          t('ch0_2.labTrouble2'),
          <Trans key="t3" i18nKey="ch0_2.labTrouble3" ns="ui"
            components={{ ...mathComponents, dc: <G k="dc" /> }}
          />,
        ]}
      />
    </>
  )
}
