<script lang="ts">
  import * as Item from "$lib/components/ui/item";
    import type { Snippet } from "svelte";
  import Button from "../ui/button/button.svelte";

  const {
    title,
    desc,
    buttonDesc,
    extraBtn,
    callback
  }: {
    title: string,
    desc?: string,
    buttonDesc?: string,
    extraBtn?: Snippet,
    callback: () => void
  } = $props();

</script>

<Item.Root variant="outline" class="group hover:border-zinc-700 transition-colors">
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
      {buttonDesc || 'Choose'}
    </Button>
    {@render extraBtn?.()}
  </Item.Actions>
</Item.Root>
