<script lang="ts">
    type HeaderSize = "x1" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl";

    interface Props {
    text: any;
    size?: HeaderSize;
    level?: "h1" | "h2" | "h3" | "h4" | "span";
    }

    let { 
    text = "", 
    size = "4xl", 
    level = "h1"
    }:Props = $props<{ 
    text: any;
    size?: "x1" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl";
    level?: "h1" | "h2" | "h3" | "span";
    }>();

    const sizeClasses: Record<HeaderSize, string> = {
    "x1": "text-x1",
    "2xl": "text-2xl",
    "3xl": "text-3xl",
    "4xl": "text-4xl",
    "5xl": "text-5xl",
    "6xl": "text-6xl"
    };

  const selectedSize = $derived((sizeClasses[size] || sizeClasses["4xl"]));
</script>

<svelte:element this={level} 
  class="{selectedSize} font-black uppercase tracking-tighter text-white drop-shadow-[0_0_10px_var(--my-primary)]"
>
  {text}
</svelte:element>
