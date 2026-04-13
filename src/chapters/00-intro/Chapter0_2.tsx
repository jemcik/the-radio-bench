// Chapter 0.2 — Lab Bench Setup
import { useTranslation, Trans } from 'react-i18next'
import LabActivity from '@/components/LabActivity/LabActivity'
import MultimeterDiagram from '@/components/diagrams/MultimeterDiagram'
import OscilloscopeDiagram from '@/components/diagrams/OscilloscopeDiagram'
import BreadboardDiagram from '@/components/diagrams/BreadboardDiagram'
import { Callout } from '@/components/ui/callout'
import { Section } from '@/components/ui/section-heading'
import { G } from '@/components/ui/glossary-term'

export default function Chapter0_2() {
  const { t } = useTranslation('ui')

  return (
    <>
      <p>{t('ch0_2.intro')}</p>

      <p>
        <Trans i18nKey="ch0_2.coversInstruments" ns="ui"
          components={{
            multimeter: <G k="multimeter" />,
            oscilloscope: <G k="oscilloscope" />,
            vna: <G k="vna" />,
            strong: <strong />,
          }}
        />
      </p>

      <Section id="multimeter" labelKey="ch0_2.sectionMultimeter">{t('ch0_2.sectionMultimeter')}</Section>

      <p>
        <Trans i18nKey="ch0_2.multimeterIntro" ns="ui"
          components={{
            voltage: <G k="voltage" />,
            current: <G k="current" />,
            resistance: <G k="resistance" />,
            continuity: <G k="continuity" />,
            diode: <G k="diode testing" />,
            capacitance: <G k="capacitance" />,
          }}
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

      <Section id="oscilloscope" labelKey="ch0_2.sectionOscilloscope">{t('ch0_2.sectionOscilloscope')}</Section>

      <p>{t('ch0_2.scopeIntro')}</p>

      <p>
        <Trans i18nKey="ch0_2.scopeControls" ns="ui"
          components={{
            timediv: <G k="time/div" />,
            voltdiv: <G k="volt/div" />,
          }}
        />
      </p>

      <OscilloscopeDiagram />

      <Callout variant="key">
        <Trans i18nKey="ch0_2.scopeKey" ns="ui"
          components={{ strong: <strong /> }}
        />
      </Callout>

      <Section id="vna" labelKey="ch0_2.sectionVna">{t('ch0_2.sectionVna')}</Section>

      <p>
        <Trans i18nKey="ch0_2.vnaIntro" ns="ui"
          components={{
            impedance: <G k="impedance" />,
            swr: <G k="swr" />,
            lc: <G k="lc" />,
          }}
        />
      </p>

      <Callout variant="caution">
        <Trans i18nKey="ch0_2.vnaCaution" ns="ui"
          components={{ calibrated: <G k="calibrated" /> }}
        />
      </Callout>

      <p>{t('ch0_2.vnaNote')}</p>

      <Section id="arduino" labelKey="ch0_2.sectionArduino">{t('ch0_2.sectionArduino')}</Section>

      <p>
        <Trans i18nKey="ch0_2.arduinoIntro" ns="ui"
          components={{
            pwm: <G k="pwm" />,
            square: <G k="square wave" />,
            freq: <G k="frequency" />,
            ac: <G k="ac" />,
          }}
        />
      </p>

      <p>
        <Trans i18nKey="ch0_2.arduinoPins" ns="ui"
          components={{ pwm: <G k="pwm" /> }}
        />
      </p>

      <Callout variant="note">{t('ch0_2.arduinoNote')}</Callout>

      <Section id="breadboard" labelKey="ch0_2.sectionBreadboard">{t('ch0_2.sectionBreadboard')}</Section>

      <p>
        <Trans i18nKey="ch0_2.breadboardIntro" ns="ui"
          components={{ breadboard: <G k="breadboard" /> }}
        />
      </p>

      <BreadboardDiagram />

      <ul>
        <li>{t('ch0_2.breadboardRails')}</li>
        <li>{t('ch0_2.breadboardRows')}</li>
        <li>
          <Trans i18nKey="ch0_2.breadboardGap" ns="ui"
            components={{ dip: <G k="dip chip" /> }}
          />
        </li>
      </ul>

      <Section id="voltage-safety" labelKey="ch0_2.sectionSafety">{t('ch0_2.sectionSafety')}</Section>

      <p>
        <Trans i18nKey="ch0_2.safetyIntro" ns="ui"
          components={{
            strong: <strong />,
            dc: <G k="dc" />,
          }}
        />
      </p>

      <Callout variant="tip">{t('ch0_2.safetyTip')}</Callout>

      <LabActivity
        goal={t('ch0_2.labGoal')}
        equipment={[
          t('ch0_2.labEquip1'),
          t('ch0_2.labEquip2'),
          <Trans key="equip3" i18nKey="ch0_2.labEquip3" ns="ui"
            components={{ arduino: <G k="arduino" />, usb: <G k="usb" /> }}
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
            text: <Trans i18nKey="ch0_2.labStep1" ns="ui" components={{ dc: <G k="dc" /> }} />,
            note: t('ch0_2.labStep1Note'),
          },
          {
            text: <Trans i18nKey="ch0_2.labStep2" ns="ui"
              components={{ arduino: <G k="arduino" />, usb: <G k="usb" />, ide: <G k="ide" />, led: <G k="led" /> }}
            />,
          },
          {
            text: t('ch0_2.labStep3'),
            note: <Trans i18nKey="ch0_2.labStep3Note" ns="ui" components={{ square: <G k="square wave" /> }} />,
          },
          {
            text: <Trans i18nKey="ch0_2.labStep4" ns="ui"
              components={{ arduino: <G k="arduino" />, arduino2: <G k="arduino" />, gnd: <G k="gnd" />, timediv: <G k="time/div" />, voltdiv: <G k="volt/div" /> }}
            />,
          },
          {
            text: <Trans i18nKey="ch0_2.labStep5" ns="ui"
              components={{ square: <G k="square wave" />, cursor: <G k="cursor" /> }}
            />,
          },
          {
            text: <Trans i18nKey="ch0_2.labStep6" ns="ui"
              components={{ ac: <G k="ac" />, ac2: <G k="ac" />, gnd: <G k="gnd" />, rms: <G k="rms" />, rms2: <G k="rms" />, square: <G k="square wave" /> }}
            />,
          },
          {
            text: <Trans i18nKey="ch0_2.labStep7" ns="ui"
              components={{ gnd: <G k="gnd" />, breadboard: <G k="breadboard" />, inputz: <G k="input impedance" /> }}
            />,
          },
        ]}
        expectedResult={
          <Trans i18nKey="ch0_2.labExpected" ns="ui"
            components={{ square: <G k="square wave" />, pp: <G k="peak-to-peak" />, ac: <G k="ac" />, pwm: <G k="pwm" /> }}
          />
        }
        connectionToTheory={
          <Trans i18nKey="ch0_2.labConnection" ns="ui"
            components={{ dc: <G k="dc" /> }}
          />
        }
        troubleshooting={[
          <Trans key="t1" i18nKey="ch0_2.labTrouble1" ns="ui"
            components={{ arduino: <G k="arduino" />, gnd: <G k="gnd" />, voltdiv: <G k="volt/div" /> }}
          />,
          t('ch0_2.labTrouble2'),
          <Trans key="t3" i18nKey="ch0_2.labTrouble3" ns="ui"
            components={{ dc: <G k="dc" /> }}
          />,
        ]}
      />
    </>
  )
}
