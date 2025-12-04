<script lang="ts">
  import * as Item from "$lib/components/ui/item";
  import Button from "../ui/button/button.svelte";

  const {
    title,
    desc,
    buttonDesc,
    callback
  }: {
    title: string,
    desc?: string,
    buttonDesc?: string,
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
  </Item.Actions>
</Item.Root>
