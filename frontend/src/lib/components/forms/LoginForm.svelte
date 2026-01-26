<script lang="ts">
  import { Alert, AlertDescription } from "$lib/components/ui/alert";
  import { client } from "$lib/api";
  import { validateInput } from "@lib/validation/inputValidation";
  import Label from "$lib/components/ui/label/label.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import Input from "$lib/components/ui/input/input.svelte";
  import { goto } from "$app/navigation";
  import {t, currentLocale} from "@lib/i18n/i18n";

  let usernameBuffer = $state("");
  let userPasswordBuffer = $state("");
  let totpToken = $state("");
  let errorMessage = $state("");
  let requires2FA = $state(false);

  const handleLoginFormSubmit = async (e: Event) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const email = validateInput(usernameBuffer, { type: 'email' }).input;
      const username = validateInput(usernameBuffer, { type: 'username' }).input;
<<<<<<< HEAD
      
      const result = await client.login({
=======

      await client.login({
>>>>>>> main
        username,
        email,
        passwd: userPasswordBuffer,
        totp_token: requires2FA ? totpToken : undefined,
      });

<<<<<<< HEAD
      // Check if 2FA is required
      if (result.requires_2fa) {
        requires2FA = true;
        errorMessage = "";
        return;
      }

=======
>>>>>>> main
      goto('/');
    } catch (e: any) {
      errorMessage = e.message || e.toString();
    }
  }
</script>

<form class="space-y-6" onsubmit={handleLoginFormSubmit}>
  <div class="space-y-4">
<<<<<<< HEAD
    <h2 class="text-2xl font-bold text-center">
      {requires2FA ? 'Enter 2FA Code' : 'Sign in'}
    </h2>

    {#if !requires2FA}
      <div class="space-y-2">
        <Label for="username">Email or Username</Label>
        <Input 
          id="username"
          type="text"
          bind:value={usernameBuffer}
          placeholder="Enter your email or username"
          required
        />
      </div>

      <div class="space-y-2">
        <Label for="password">Password</Label>
        <Input 
          id="password"
          type="password"
          bind:value={userPasswordBuffer}
          placeholder="Enter your password"
          required
        />
      </div>
    {:else}
      <p class="text-sm text-center text-muted-foreground">
        Enter the 6-digit code from your authenticator app
      </p>
      <div class="space-y-2">
        <Label for="totp">Authentication Code</Label>
        <Input 
          id="totp"
          type="text"
          bind:value={totpToken}
          placeholder="000000"
          maxlength={6}
          pattern="[0-9]*"
          inputmode="numeric"
          autocomplete="one-time-code"
          required
        />
      </div>
      <Button 
        type="button" 
        variant="ghost" 
        class="w-full"
        onclick={() => { requires2FA = false; totpToken = ''; }}
      >
        ← Back to login
      </Button>
    {/if}
=======
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
>>>>>>> main
  </div>

  {#if errorMessage}
    <Alert variant="destructive">
      <AlertDescription>{errorMessage}</AlertDescription>
    </Alert>
  {/if}

  <Button type="submit" class="w-full">
<<<<<<< HEAD
    {requires2FA ? 'Verify' : 'Sign In'}
=======
    {$t('login.singin')}
>>>>>>> main
  </Button>
</form>
