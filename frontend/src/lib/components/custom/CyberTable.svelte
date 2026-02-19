<script lang="ts">
  let { headers, children } = $props();
</script>

<div class="rounded-xl border border-border bg-card/20 backdrop-blur-xl overflow-hidden shadow-2xl">
  <table class="w-full text-left border-collapse">
    <thead class="bg-primary/10 border-b border-border text-primary text-[11px] font-black uppercase tracking-[0.15em]">
      <tr>
        {#each headers as header}
          <th class="p-4 {header.class ?? ''}">{header.label}</th>
        {/each}
      </tr>
    </thead>
    <tbody class="divide-y divide-border/30">
      {@render children()}
    </tbody>
  </table>
</div>
