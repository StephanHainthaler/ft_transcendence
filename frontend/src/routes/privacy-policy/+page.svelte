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
        text={$t('privacy.title', 'Privacy Policy')}
      />
    </Card.Title>
  </Card.Header>

  <Card.Content class="space-y-6 text-sm leading-relaxed">

    <p class="text-muted-foreground">
      {$t('privacy.updated', 'Last updated')}: {'09-03-2026'}
    </p>

    <p>
      {$t('privacy.intro', 'This Privacy Policy describes our policies and procedures on the collection, use, and disclosure of your information when you use the Service and informs you about your privacy rights and how the law protects you.')}
    </p>

    <p>
      {$t('privacy.use_data', 'We use your Personal Data to provide and improve the Service. By using the Service, you agree to the collection and use of information in accordance with this Privacy Policy.')}
    </p>

    <Separator />

    <!-- Interpretation -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold">
        {$t('privacy.interpretation', 'Interpretation and Definitions')}
      </h2>

      <Separator />

      <h3 class="font-semibold">
        {$t('privacy.interpretation_title', 'Interpretation')}
      </h3>

      <p>
        {$t('privacy.interpretation_text', 'The words whose initial letters are capitalized have meanings defined under the following conditions. The following definitions have the same meaning whether they appear in singular or plural.')}
      </p>

      <h3 class="font-semibold">
        {$t('privacy.definitions', 'Definitions')}
      </h3>

      <ul class="list-disc pl-6 space-y-2">
        <li>
          <strong>{$t('privacy.label_account', 'Account')}</strong> — {$t('privacy.def_account', 'A unique account created for you to access our Service or parts of our Service.')}
        </li>
        <li>
          <strong>{$t('privacy.label_affiliate', 'Affiliate')}</strong> — {$t('privacy.def_affiliate', 'An entity that controls, is controlled by, or is under common control with a party.')}
        </li>
        <li>
          <strong>{$t('privacy.label_company', 'Company')}</strong> — {$t('privacy.def_company', 'FT_TRANSCENDENCE')}
        </li>
        <li>
          <strong>{$t('privacy.label_cookies', 'Cookies')}</strong> — {$t('privacy.def_cookies', 'Small files placed on your device that store browsing data and preferences.')}
        </li>
        <li>
          <strong>{$t('privacy.label_country', 'Country')}</strong> — {$t('privacy.country_name', 'Austria')}
        </li>
        <li>
          <strong>{$t('privacy.label_device', 'Device')}</strong> — {$t('privacy.def_device', 'Any device capable of accessing the Service such as a computer or mobile device.')}
        </li>
        <li>
          <strong>{$t('privacy.label_personal_data', 'Personal Data')}</strong> — {$t('privacy.def_personal_data', 'Information relating to an identified or identifiable individual.')}
        </li>
        <li>
          <strong>{$t('privacy.label_service', 'Service')}</strong> — {$t('privacy.def_service', 'The Website')}
        </li>
        <li>
          <strong>{$t('privacy.label_usage_data', 'Usage Data')}</strong> — {$t('privacy.def_usage', 'Data collected automatically during the use of the Service.')}
        </li>
        <li>
          <strong>{$t('privacy.label_you', 'You')}</strong> — {$t('privacy.def_you', 'The individual accessing or using the Service.')}
        </li>
      </ul>
    </section>

    <Separator />

    <!-- Collecting and Using -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold">
        {$t('privacy.collecting', 'Collecting and Using Your Personal Data')}
      </h2>

      <Separator />

      <h3 class="font-semibold">
        {$t('privacy.types', 'Types of Data Collected')}
      </h3>

      <h4 class="font-semibold">
        {$t('privacy.personal_data', 'Personal Data')}
      </h4>

      <p>
        {$t('privacy.personal_desc', 'While using our Service, we may ask you to provide certain personally identifiable information.')}
      </p>

      <ul class="list-disc pl-6">
        <li>{$t('privacy.data_email', 'Email address')}</li>
      </ul>

      <h4 class="font-semibold">
        {$t('privacy.usage_data', 'Usage Data')}
      </h4>

      <p>
        {$t('privacy.usage_desc', 'Usage Data is collected automatically when using the Service and may include IP address, browser type, visited pages, and other diagnostic data.')}
      </p>
    </section>

    <Separator />

    <!-- Cookies -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold">
        {$t('privacy.cookies', 'Tracking Technologies and Cookies')}
      </h2>

      <Separator />

      <p>
        {$t('privacy.cookies_desc', 'We use cookies and similar tracking technologies to track activity on our Service and store certain information.')}
      </p>

      <ul class="list-disc pl-6 space-y-2">
        <li>
          <strong>{$t('privacy.cookies_essential', 'Necessary Cookies')}</strong> — {$t('privacy.cookies_essential_desc', 'Essential for providing core website functionality.')}
        </li>
        <li>
          <strong>{$t('privacy.cookies_consent', 'Consent Cookies')}</strong> — {$t('privacy.cookies_consent_desc', 'Identify whether users accepted cookie policies.')}
        </li>
        <li>
          <strong>{$t('privacy.cookies_functional', 'Functionality Cookies')}</strong> — {$t('privacy.cookies_functional_desc', 'Remember preferences such as login details or language.')}
        </li>
      </ul>
    </section>

    <Separator />

    <!-- Retention -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold">
        {$t('privacy.retention', 'Retention of Your Personal Data')}
      </h2>

      <Separator />

      <p>
        {$t('privacy.retention_desc', 'The Company will retain your Personal Data only as long as necessary for the purposes described in this Privacy Policy.')}
      </p>

      <ul class="list-disc pl-6 space-y-2">
        <li>{$t('privacy.retention_accounts', 'User accounts: up to 24 months after account closure')}</li>
        <li>{$t('privacy.retention_tickets', 'Support tickets: up to 24 months')}</li>
        <li>{$t('privacy.retention_analytics', 'Analytics data: up to 24 months')}</li>
        <li>{$t('privacy.retention_logs', 'Server logs: up to 24 months')}</li>
      </ul>
    </section>

    <Separator />

    <!-- Security -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold">
        {$t('privacy.security', 'Security of Your Personal Data')}
      </h2>

      <Separator />

      <p>
        {$t('privacy.security_desc', 'While we strive to protect your Personal Data using commercially reasonable means, no transmission or storage method is completely secure.')}
      </p>
    </section>

    <Separator />

    <!-- Children -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold">
        {$t('privacy.children', "Children's Privacy")}
      </h2>

      <Separator />

      <p>
        {$t('privacy.children_desc', 'Our Service does not address anyone under the age of 16. We do not knowingly collect personal information from children under 16.')}
      </p>
    </section>

    <Separator />

    <!-- Changes -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold">
        {$t('privacy.changes', 'Changes to this Privacy Policy')}
      </h2>

      <Separator />

      <p>
        {$t('privacy.changes_desc', 'We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated revision date.')}
      </p>
    </section>

    <Separator />

    <!-- Contact -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold">
        {$t('privacy.contact', 'Contact Us')}
      </h2>

      <Separator />

      <p>
        {$t('privacy.contact_desc', 'If you have any questions about this Privacy Policy, you can contact us:')}
      </p>

      <ul class="list-disc pl-6">
        <li>{$t('privacy.contact_phone', 'By phone')}: +42 420 4242420</li>
      </ul>
    </section>

  </Card.Content>
</Card.Root>