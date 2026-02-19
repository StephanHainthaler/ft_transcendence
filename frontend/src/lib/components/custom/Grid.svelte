<script lang="ts">
  import type { Snippet } from "svelte";

  import * as Card from "$lib/components/ui/card";
  const { title, head, children }: { title: string, head?: Snippet, children: Snippet } = $props();

</script>

<Card.Root class="size-full overflow-x-hidden overflow-y-scroll">
  <Card.Header class="flex justify-between align-center">
    <Card.Title>{title}</Card.Title>
    {@render head?.()}
  </Card.Header>
  <Card.Content class="size-full flex flex-col gap-2">
    {@render children()}
  </Card.Content>
</Card.Root>
