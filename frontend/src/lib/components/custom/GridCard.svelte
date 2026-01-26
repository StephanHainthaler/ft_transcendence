<script lang="ts">
  import * as Item from "$lib/components/ui/item";
  import type { Snippet } from "svelte";
  import Button from "../ui/button/button.svelte";
  import { t } from "@lib/i18n/i18n";
  import * as Avatar from "$lib/components/ui/avatar";

  const {
    title,
    desc,
    buttonDesc,
    avatarUrl,
    extraBtn,
    callback
  }: {
    title: string,
    desc?: string,
    buttonDesc?: string,
    avatarUrl?: string,
    extraBtn?: Snippet,
    callback: () => void
  } = $props();

</script>

<Item.Root variant="outline" class="group hover:border-zinc-700 transition-colors">
  <Item.Media>
    <Avatar.Root>
      <Avatar.Image src={avatarUrl} />
      <Avatar.Fallback>{title[0].toUpperCase()}</Avatar.Fallback>
    </Avatar.Root>
  </Item.Media>
  <Item.Content class="gap-2">
    <Item.Header>
      <Item.Title>
        <h3 class="text-white text-lg font-medium">{title}</h3>
      </Item.Title>
    </Item.Header>
    {#if desc}
      <Item.Description class="text-zinc-400 text-sm leading-relaxed">
        {desc}
      </Item.Description>
    {/if}
  </Item.Content>

  <Item.Actions>
    <Button
      onclick={callback}
      class="min-w-24 transition-colors"
    >
      {buttonDesc || $t('tournament.choose')}
    </Button>
    {@render extraBtn?.()}
  </Item.Actions>
</Item.Root>
