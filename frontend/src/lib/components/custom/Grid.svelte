<script lang="ts">
  import type { Snippet } from "svelte";

  import * as Card from "$lib/components/ui/card";
  const { title, children }: { title: string, children: Snippet } = $props();

</script>

<Card.Root class="size-full overflow-hidden">
  <Card.Header>
    <Card.Title>{title}</Card.Title>
  </Card.Header>
  <Card.Content class="size-full flex flex-col">
    {@render children()}
  </Card.Content>
</Card.Root>
