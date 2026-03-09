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
        text={$t('terms.title')}
      />
    </Card.Title>
  </Card.Header>

  <Card.Content class="space-y-6 text-sm leading-relaxed">

    <p class="text-muted-foreground">
      {$t('terms.updated')}: 09-03-2026
    </p>

    <p>
      {$t('terms.intro')}
    </p>

    <Separator />

    <!-- Interpretation -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold">
        {$t('terms.interpretation_defs')}
      </h2>

      <Separator />

      <h3 class="font-semibold">
        {$t('terms.interpretation')}
      </h3>

      <p>
        {$t('terms.interpretation_text')}
      </p>

      <h3 class="font-semibold">
        {$t('terms.definitions')}
      </h3>

      <ul class="list-disc pl-6 space-y-2">
        <li>
          <strong>{$t('terms.label_affiliate')}</strong> — {$t('terms.def_affiliate')}
        </li>

        <li>
          <strong>{$t('terms.label_country')}</strong> — {$t('terms.country_name')}
        </li>

        <li>
          <strong>{$t('terms.label_company')}</strong> — {$t('terms.def_company')}
        </li>

        <li>
          <strong>{$t('terms.label_device')}</strong> — {$t('terms.def_device')}
        </li>

        <li>
          <strong>{$t('terms.label_service')}</strong> — {$t('terms.def_service')}
        </li>

        <li>
          <strong>{$t('terms.label_thirdparty')}</strong> — {$t('terms.def_thirdparty')}
        </li>

        <li>
          <strong>{$t('terms.label_website')}</strong> — 
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
          <strong>{$t('terms.label_you')}</strong> — {$t('terms.def_you')}
        </li>
      </ul>
    </section>

    <Separator />

    <!-- Acknowledgment -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold">{$t('terms.ack')}</h2>
      <Separator />
      <p>{$t('terms.ack_text1')}</p>
      <p>{$t('terms.ack_text2')}</p>
      <p>{$t('terms.age')}</p>
    </section>

    <Separator />

    <!-- External Links -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold">{$t('terms.links')}</h2>
      <Separator />
      <p>{$t('terms.links_text')}</p>
      <p>{$t('terms.links_disclaimer')}</p>
    </section>

    <Separator />

    <!-- Termination -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold">{$t('terms.termination')}</h2>
      <Separator />
      <p>{$t('terms.termination_text')}</p>
    </section>

    <Separator />

    <!-- Liability -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold">{$t('terms.liability')}</h2>
      <Separator />
      <p>{$t('terms.liability_text')}</p>
    </section>

    <Separator />

    <!-- Disclaimer -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold">{$t('terms.disclaimer')}</h2>
      <Separator />
      <p>{$t('terms.disclaimer_text')}</p>
    </section>

    <Separator />

    <!-- Governing Law -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold">{$t('terms.law')}</h2>
      <Separator />
      <p>{$t('terms.law_text')}</p>
    </section>

    <Separator />

    <!-- EU Users -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold">{$t('terms.eu')}</h2>
      <Separator />
      <p>{$t('terms.eu_text')}</p>
    </section>

    <Separator />

    <!-- Changes -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold">{$t('terms.changes')}</h2>
      <Separator />
      <p>{$t('terms.changes_text')}</p>
    </section>

    <Separator />

    <!-- Contact -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold">{$t('terms.contact')}</h2>
      <Separator />
      <p>{$t('terms.contact_desc')}</p>
      <ul class="list-disc pl-6">
        <li>{$t('terms.contact_phone')}: +42 420 4242420</li>
      </ul>
    </section>

  </Card.Content>
</Card.Root>