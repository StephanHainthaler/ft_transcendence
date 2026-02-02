<script lang="ts">
  let { type, label } = $props();
  
  const styles = {
    win: "bg-primary/10 text-primary border-primary/20 shadow-[0_0_10px_rgba(var(--my-primary),0.1)]",
    draw: "bg-muted text-muted-foreground border-border",
    loss: "bg-destructive/10 text-destructive border-destructive/20"
  };
</script>

<span class="px-3 py-1 rounded-full text-[9px] sm:text-[12px] font-black uppercase tracking-tighter border {styles[type]}">
  {label}
</span>