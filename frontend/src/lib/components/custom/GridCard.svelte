<script lang="ts">
  import * as Item from "$lib/components/ui/item";
  import type { Snippet } from "svelte";
  import Button from "../ui/button/button.svelte";
  import { t } from "@lib/i18n/i18n";
  import * as Avatar from "$lib/components/ui/avatar";
  import { Badge } from "$lib/components/ui/badge";

  const {
    title,
    isOnline,
    desc,
    buttonDesc,
    avatarUrl,
    extraBtn,
    callback
  }: {
    title: string,
    isOnline?: boolean,
    desc?: string,
    buttonDesc?: string,
    avatarUrl?: string,
    extraBtn?: Snippet,
    callback: (u?: any) => void
  } = $props();

</script>

<Item.Root variant="outline" class="group hover:border-zinc-700 transition-colors overflow-hidden">
  <Item.Media>
    <Avatar.Root>
      <Avatar.Image src={avatarUrl} />
      <Avatar.Fallback>{title[0]?.toUpperCase() || ':)'}</Avatar.Fallback>
    </Avatar.Root>
  </Item.Media>
  <Item.Content class="gap-2">
    <Item.Header>
      <Item.Title>
        <h3 class="text-white text-lg font-medium">{title}</h3>
        {#if isOnline === true}
          <Badge>{$t('online', 'Online')}</Badge>
        {:else if isOnline === false}
          <Badge variant='destructive'>{$t('offline', 'Offline')}</Badge>
        {/if}
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
      {buttonDesc || $t('tournament.choose', 'Choose')}
    </Button>
    {@render extraBtn?.()}
  </Item.Actions>
</Item.Root>
