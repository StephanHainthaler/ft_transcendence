<script lang="ts">
  import { Alert, AlertDescription } from "$lib/components/ui/alert";
  import { client } from "$lib/api";
  import { validateInput } from "@lib/validation/inputValidation";
  import Label from "$lib/components/ui/label/label.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import Input from "$lib/components/ui/input/input.svelte";
  import { goto } from "$app/navigation";
  import {t, currentLocale} from "@lib/i18n/i18n";

  const handleLoginFormSubmit = async (e: Event) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const email = validateInput(usernameBuffer, { type: 'email' }).input;
      const username = validateInput(usernameBuffer, { type: 'username' }).input;

      await client.login({
        username,
        email,
        passwd: userPasswordBuffer,
      });

      goto('/');
    } catch (e: any) {
      errorMessage = e.message || e.toString();
    }
  }

  let usernameBuffer = $state("");
  let userPasswordBuffer = $state("");
  let errorMessage = $state("");

</script>

<form class="space-y-6" onsubmit={handleLoginFormSubmit}>
  <div class="space-y-4">
    <h2 class="text-2xl font-bold text-center">{$t('login.singin')}</h2>

    <div class="space-y-2">
      <Label for="username">{$t('login.username')}</Label>
      <Input 
        id="username"
        type="text"
        bind:value={usernameBuffer}
        placeholder={$t('login.username_ph')}
        required
      />
    </div>

    <div class="space-y-2">
      <Label for="password">{$t('login.password')}</Label>
      <Input 
        id="password"
        type="password"
        bind:value={userPasswordBuffer}
        placeholder={$t('login.password_ph')}
        required
      />
    </div>
  </div>

  {#if errorMessage}
    <Alert variant="destructive">
      <AlertDescription>{errorMessage}</AlertDescription>
    </Alert>
  {/if}

  <Button type="submit" class="w-full">
    {$t('login.singin')}
  </Button>
</form>
