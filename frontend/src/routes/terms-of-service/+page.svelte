<script lang="ts">
  import * as Card from "@lib/components/ui/card";
  import { Separator } from "@lib/components/ui/separator";
  import NeonHeader from "@lib/components/custom/NeonHeader.svelte";
  import { t } from "@lib/i18n/i18n";
</script>

<Card.Root class="size-full mx-auto overflow-y-auto">
  <Card.Header>
    <Card.Title>
      <NeonHeader
        size="2xl"
        level="h1"
        text={$t('terms.title', 'Terms of Service')}
      />
    </Card.Title>
  </Card.Header>

  <Card.Content class="space-y-6 text-sm leading-relaxed">

    <p class="text-muted-foreground">
      {$t('terms.updated', 'Last updated')}: March 09, 2026
    </p>

    <p>
      {$t(
        'terms.intro',
        'Please read these terms and conditions carefully before using Our Service.'
      )}
    </p>

    <Separator />

    <!-- Interpretation -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold">
        {$t('terms.interpretation_defs', 'Interpretation and Definitions')}
      </h2>

      <Separator />

      <h3 class="font-semibold">
        {$t('terms.interpretation', 'Interpretation')}
      </h3>

      <p>
        {$t(
          'terms.interpretation_text',
          'The words whose initial letters are capitalized have meanings defined under the following conditions.'
        )}
      </p>

      <h3 class="font-semibold">
        {$t('terms.definitions', 'Definitions')}
      </h3>

      <ul class="list-disc pl-6 space-y-2">
        <li>
          <strong>Affiliate</strong> —
          {$t(
            'terms.def_affiliate',
            'An entity that controls, is controlled by, or is under common control with a party.'
          )}
        </li>

        <li>
          <strong>Country</strong> — Austria
        </li>

        <li>
          <strong>Company</strong> —
          {$t('terms.def_company', 'FT_TRANSCENDENCE')}
        </li>

        <li>
          <strong>Device</strong> —
          {$t(
            'terms.def_device',
            'Any device capable of accessing the Service such as a computer or mobile device.'
          )}
        </li>

        <li>
          <strong>Service</strong> —
          {$t('terms.def_service', 'The Website')}
        </li>

        <li>
          <strong>Third-Party Social Media Service</strong> —
          {$t(
            'terms.def_thirdparty',
            'Services or content provided by third parties that may appear in the Service.'
          )}
        </li>

        <li>
          <strong>Website</strong> —
          <a
            href="https://www.KhukVvobisPgoberShainthaJuitz.at"
            target="_blank"
            rel="noopener noreferrer"
            class="underline"
          >
            https://www.KhukVvobisPgoberShainthaJuitz.at
          </a>
        </li>

        <li>
          <strong>You</strong> —
          {$t(
            'terms.def_you',
            'The individual accessing or using the Service.'
          )}
        </li>
      </ul>
    </section>

    <Separator />

    <!-- Acknowledgment -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold">
        {$t('terms.ack', 'Acknowledgment')}
      </h2>

      <Separator />

      <p>
        {$t(
          'terms.ack_text1',
          'These Terms and Conditions govern the use of this Service and the agreement between You and the Company.'
        )}
      </p>

      <p>
        {$t(
          'terms.ack_text2',
          'By accessing or using the Service You agree to be bound by these Terms.'
        )}
      </p>

      <p>
        {$t(
          'terms.age',
          'You represent that you are over the age of 18. The Company does not permit those under 18 to use the Service.'
        )}
      </p>
    </section>

    <Separator />

    <!-- External Links -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold">
        {$t('terms.links', 'Links to Other Websites')}
      </h2>

      <Separator />

      <p>
        {$t(
          'terms.links_text',
          'Our Service may contain links to third-party websites or services that are not owned or controlled by the Company.'
        )}
      </p>

      <p>
        {$t(
          'terms.links_disclaimer',
          'The Company assumes no responsibility for the content, privacy policies, or practices of third-party websites.'
        )}
      </p>
    </section>

    <Separator />

    <!-- Termination -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold">
        {$t('terms.termination', 'Termination')}
      </h2>

      <Separator />

      <p>
        {$t(
          'terms.termination_text',
          'We may terminate or suspend Your access immediately, without prior notice, if You breach these Terms.'
        )}
      </p>
    </section>

    <Separator />

    <!-- Liability -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold">
        {$t('terms.liability', 'Limitation of Liability')}
      </h2>

      <Separator />

      <p>
        {$t(
          'terms.liability_text',
          'The entire liability of the Company shall be limited to the amount paid through the Service or 100 USD if nothing was purchased.'
        )}
      </p>
    </section>

    <Separator />

    <!-- Disclaimer -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold">
        {$t('terms.disclaimer', '"AS IS" Disclaimer')}
      </h2>

      <Separator />

      <p>
        {$t(
          'terms.disclaimer_text',
          'The Service is provided "AS IS" and "AS AVAILABLE" without warranties of any kind.'
        )}
      </p>
    </section>

    <Separator />

    <!-- Governing Law -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold">
        {$t('terms.law', 'Governing Law')}
      </h2>

      <Separator />

      <p>
        {$t(
          'terms.law_text',
          'The laws of Austria shall govern these Terms and Your use of the Service.'
        )}
      </p>
    </section>

    <Separator />

    <!-- EU Users -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold">
        {$t('terms.eu', 'For European Union Users')}
      </h2>

      <Separator />

      <p>
        {$t(
          'terms.eu_text',
          'EU consumers benefit from mandatory provisions of the law of their country of residence.'
        )}
      </p>
    </section>

    <Separator />

    <!-- Changes -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold">
        {$t('terms.changes', 'Changes to These Terms')}
      </h2>

      <Separator />

      <p>
        {$t(
          'terms.changes_text',
          'We reserve the right to modify or replace these Terms at any time.'
        )}
      </p>
    </section>

    <Separator />

    <!-- Contact -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold">
        {$t('terms.contact', 'Contact Us')}
      </h2>

      <Separator />

      <p>
        {$t(
          'terms.contact_desc',
          'If you have any questions about these Terms, you can contact us:'
        )}
      </p>

      <ul class="list-disc pl-6">
        <li>By phone: +42 420 4242420</li>
      </ul>
    </section>

  </Card.Content>
</Card.Root>