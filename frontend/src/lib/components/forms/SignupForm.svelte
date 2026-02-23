<script lang="ts">
  import { client } from "@lib/api/index.svelte";
  import { validateInputThrow } from "@lib/validation/inputValidation";
  import { goto } from "$app/navigation";
  import Label from "../ui/label/label.svelte";
  import Input from "../ui/input/input.svelte";
  import Button from "../ui/button/button.svelte";
  import { Alert, AlertDescription } from "$lib/components/ui/alert";
  import {t, currentLocale} from "@lib/i18n/i18n";
  import { isAppError, type AppError } from "@lib/types/error";
  import { Eye, EyeOff } from 'lucide-svelte';

  let user_nameBuffer = $state('');
  let emailBuffer = $state('');
  let userPasswordBuffer = $state('');
  let userPasswordRepeatBuffer = $state('');
  let errorMessage = $state('');
  let isLoading = $state(false);
  let showPassword = $state(false);
  let showPasswordRepeat = $state(false);

  const handleSignupFormSubmit = async (e: Event) => {
    e.preventDefault();
    errorMessage = '';
    isLoading = true;

    try {
      const user_name = validateInputThrow(user_nameBuffer, { type: 'username' });
      const email = validateInputThrow(emailBuffer, { type: 'email' });
      validateInputThrow(userPasswordBuffer, { type: 'password' });

      if (userPasswordBuffer !== userPasswordRepeatBuffer) {
        throw Object.assign(new Error("pass_mismatch"),
        {isAppError: true}) as AppError;
      }

      await client.signup({
        user_name,
        email,
        passwd: userPasswordBuffer,
      });

      await goto('/');
    } catch (e: any) {
      if (isAppError(e))
        errorMessage = String($t('error.'+ e.message)) || String($t('error.general'));
      else
      {
        const rawError = e.message || e.error || String(e);
        const translationKey = rawError.includes('.') ? `${rawError}` : null;
        errorMessage = translationKey ? $t(translationKey) : $t('error.general');
      }
    } finally {
      isLoading = false;
    }
  }

  const togglePassword = () => {
    showPassword = !showPassword;
  };

  const togglePasswordRepeat = () => {
    showPasswordRepeat = !showPasswordRepeat;
  };

</script>

<form class="space-y-6" onsubmit={handleSignupFormSubmit}>
  <div class="space-y-4">
    <h2 class="text-2xl font-bold text-center">{$t('signup.register', 'Register')}</h2>

    <div class="space-y-2">
      <Label for="username-input">{$t('signup.username', 'Username')}</Label>
      <Input
        id="user_name-input"
        type="text"
        bind:value={user_nameBuffer}
        placeholder={$t('signup.username_ph')}
        required
        disabled={isLoading}
      />
    </div>

    <div class="space-y-2">
      <Label for="email-input">{$t('signup.email', 'Email')}</Label>
      <Input
        id="email-input"
        type="email"
        bind:value={emailBuffer}
        placeholder={$t('signup.email_ph', 'Enter your email')}
        autocomplete="off"
        required
        disabled={isLoading}
      />
    </div>

    <div class="space-y-2">
      <Label for="password-input">{$t('signup.password', 'Password')}</Label>
      <div class="relative">
        <Input
          id="password-input"
          type={showPassword ? 'text' : 'password'} 
          bind:value={userPasswordBuffer}
          placeholder={$t('signup.password_ph', 'Create a password')}
          autocomplete="new-password"
          required
          disabled={isLoading}
          class="pr-10" 
        />
        
        <button
          type="button"
          class="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-foreground transition-colors z-50 cursor-pointer"
          onclick={togglePassword}
          tabindex="-1"
        >
          {#if showPassword}
            <EyeOff size={20} />
          {:else}
            <Eye size={20} />
          {/if}
        </button>
      </div>
    </div>

    <div class="space-y-2">
      <Label for="password-repeat-input">{$t('signup.pass_repeat', 'Repeat your password')}</Label>
      <div class="relative">
        <Input
          id="password-repeat-input"
          type={showPasswordRepeat ? 'text' : 'password'} 
          bind:value={userPasswordRepeatBuffer}
          placeholder={$t('signup.pass_confirm', 'Confirm your password')}
          autocomplete="new-password"
          disabled={isLoading} 
          required
          class="pr-10" 
        />
        <button
          type="button"
          class="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground z-10"
          onclick={togglePasswordRepeat}
          tabindex="-1"
        >
          {#if showPasswordRepeat}
            <EyeOff size={20} />
          {:else}
            <Eye size={20} />
          {/if}
        </button>
      </div>
    </div>

  {#if errorMessage}
    <Alert variant="destructive">
      <AlertDescription>{errorMessage}</AlertDescription>
    </Alert>
  {/if}

  <Button type="submit" class="w-full" disabled={isLoading}>
    {isLoading ? $t('signup.loading') : $t('signup.signup')}
  </Button>
</form>
