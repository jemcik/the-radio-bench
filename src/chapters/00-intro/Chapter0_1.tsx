// Chapter 0.1 — How to Use This Site
import { useTranslation, Trans } from 'react-i18next'
import ChapterFlowDiagram from '@/components/diagrams/ChapterFlowDiagram'
import { Callout } from '@/components/ui/callout'
import { Section } from '@/components/ui/section-heading'
import { G } from '@/features/glossary/glossary-term'

export default function Chapter0_1() {
  const { t } = useTranslation('ui')

  return (
    <>
      <p>{t('ch0_1.intro1')}</p>
      <p>{t('ch0_1.intro2')}</p>

      <Section id="chapter-structure" labelKey="ch0_1.sectionStructure" />

      <p>{t('ch0_1.eachChapterFollows')}</p>

      <ChapterFlowDiagram />

      <ul>
        <li>
          <strong>{t('ch0_1.conceptFirst')}</strong>{' '}
          {t('ch0_1.conceptFirstDetail')}
        </li>
        <li>
          <strong>{t('ch0_1.interactiveWidgets')}</strong>{' '}
          {t('ch0_1.interactiveWidgetsDetail')}
        </li>
        <li>
          <strong>{t('ch0_1.labActivities')}</strong>{' '}
          {t('ch0_1.labActivitiesDetail')}
        </li>
        <li>
          <strong>{t('ch0_1.quiz')}</strong>{' '}
          {t('ch0_1.quizDetail')}
        </li>
      </ul>

      <Section id="sidebar-icons" labelKey="ch0_1.sectionIcons" />

      <p>
        <Trans
          i18nKey="ch0_1.iconsDetail"
          ns="ui"
          components={{
            flask: <strong />,
            qmark: <strong />,
          }}
        />
      </p>

      <Section id="callout-boxes" labelKey="ch0_1.sectionCallouts" />

      <p>{t('ch0_1.calloutsIntro')}</p>

      <Callout variant="danger">
        <Trans i18nKey="ch0_1.calloutDanger" ns="ui" components={{ strong: <strong /> }} />
      </Callout>

      <Callout variant="key">
        <Trans i18nKey="ch0_1.calloutKey" ns="ui" components={{ strong: <strong /> }} />
      </Callout>

      <Callout variant="tip">
        {t('ch0_1.calloutTip')}
      </Callout>

      <Callout variant="note">
        {t('ch0_1.calloutNote')}
      </Callout>

      <Callout variant="caution">
        {t('ch0_1.calloutCaution')}
      </Callout>

      <Callout variant="experiment">
        {t('ch0_1.calloutExperiment')}
      </Callout>

      <Callout variant="onair">
        {t('ch0_1.calloutOnair')}
      </Callout>

      <Callout variant="math">
        {t('ch0_1.calloutMath')}
      </Callout>

      <Section id="recommended-path" labelKey="ch0_1.sectionPath" />

      <p>
        <Trans i18nKey="ch0_1.path1" ns="ui" components={{ strong: <strong /> }} />
      </p>

      <p>{t('ch0_1.path2')}</p>

      <Section id="note-on-maths" labelKey="ch0_1.sectionMaths" />

      <p>{t('ch0_1.maths1')}</p>
      <p>{t('ch0_1.maths2')}</p>

      <Section id="one-more-thing" labelKey="ch0_1.sectionOneMore" />

      <p>
        <Trans
          i18nKey="ch0_1.oneMore1"
          ns="ui"
          components={{
            erc: <G k="erc" />,
            arrl: <G k="arrl" />,
          }}
        />
      </p>

      <p>{t('ch0_1.oneMore2')}</p>
    </>
  )
}
