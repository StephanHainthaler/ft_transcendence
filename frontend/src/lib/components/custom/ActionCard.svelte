<script lang="ts">
    import { HelpCircle } from "lucide-svelte";
    import { goto } from "$app/navigation";
    let {
        link = "/play",
        icon: Icon = HelpCircle, 
        icon_shade: IconShade = HelpCircle,
        colorClass = "primary",
        title = "Action"
        } = $props();

    const themes = {
        primary: {
            border: "border-primary/30 hover:border-primary",
            bg: "bg-primary/5 hover:bg-primary/10",
            iconBg: "bg-primary/10 border-primary/20 group-hover:bg-primary",
            text: "group-hover:text-primary",
            shade: "text-primary/5"
        },
        accent: {
            border: "border-accent/30 hover:border-accent",
            bg: "bg-accent/5 hover:bg-accent/10",
            iconBg: "bg-accent/10 border-accent/20 group-hover:bg-accent",
            text: "group-hover:text-accent",
            shade: "text-accent/5"
        }
    };

    const theme = $derived(themes[colorClass] || themes.primary);

</script>

<div
    role="button"
    tabindex="0"
    class="group relative overflow-hidden border-2 p-8 transition-all {theme.border} {theme.bg}"
    onclick={() => goto(link)}
    onkeydown={(e) => e.key === 'Enter' && goto(link)}
>
    <div class="relative flex items-center gap-6">
        <div class="p-3 border transition-all {theme.iconBg} group-hover:text-black">
            <Icon class="size-8" weight="fill" />
        </div>
        <div class="md:table-cell text-left max-w-[250px] align-middle truncate pr-2">
            <h2 class="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter italic {theme.text}">
                {title}
            </h2>
        </div>
    </div>
    
    <IconShade 
        class="size-20 absolute -right-4 -bottom-4 rotate-12 group-hover:scale-110 transition-transform {theme.shade}" 
    />
</div>