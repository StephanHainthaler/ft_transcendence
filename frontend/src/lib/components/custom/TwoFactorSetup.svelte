<script lang="ts">
  import { setup2FA, enable2FA, disable2FA } from "$lib/api/auth";
  import { t } from "@lib/i18n/i18n";
  import { Alert, AlertDescription } from "$lib/components/ui/alert";
  import { Button } from "$lib/components/ui/button";
  import Input from "$lib/components/ui/input/input.svelte";
  import Label from "$lib/components/ui/label/label.svelte";
  import { ShieldCheck, KeyIcon, KeyRound } from "lucide-svelte";
  import { client } from "@lib/api/index.svelte";
  import { toast } from "svelte-sonner";
  import { onMount } from "svelte";

  let step = $state<'idle' | 'setup' | 'verify'>('idle');
  let qrCodeUrl = $state('');
  let secretKey = $state('');
  let verifyCode = $state('');
  let errorMessage = $state('');
  let successMessage = $state('');
  let successdisabledMessage = $state('');

  let is2faActive = $state(false);


  const syncStatus = (data?: any) => {
    const source = data?.auth || client.auth;
    is2faActive = source?.two_fa_enabled === 1;
  };

  const mapTwoFaError = (e: any): string => {
    const msg = e?.message || e?.toString?.() || '';
    if (msg === '2FA already enabled for this User')
      return (String($t('twofa.error_already_enabled', 'Two-Factor Authentication is already enabled')));
    if (msg === 'Invalid 2FA token')
      return (String($t('twofa.error_invalid_token', 'Invalid verification code')));
    if (msg.includes('already disabled'))
    return (String($t('twofa.error_already_disabled', 'Two-Factor Authentication is already disabled')));
    if (msg.includes('Unauthenticated') || msg.includes('401'))
      return (String($t('twofa.error_unauthenticated', 'Session expired. Please login again')));
    if (msg.includes('Invalid 2FA token') || msg.includes('Invalid code'))
      return String($t('twofa.invalid_code', 'Invalid code. Please try again.'));
    return msg || $t('twofa.error_generic', 'An error occurred. Please try again.');
  };

  const startSetup = async () => {
    try {
      errorMessage = '';
      const result = await setup2FA();
      if (!result?.qrCodeUrl || !result?.secret)
        throw new Error('Invalid response');
      qrCodeUrl = result.qrCodeUrl;
      secretKey = result.secret;
      step = 'setup';
    } catch (e: any) {
      errorMessage = mapTwoFaError(e);
    }
  };

  const verifyAndEnable = async () => {
    try {
      errorMessage = '';
      await enable2FA(verifyCode);
      successMessage = (String($t('twofa.enabled_success', 'Enabled successfully!')));
      const response = await client.getAuth();
      syncStatus(response);
      toast.success(successMessage);
      reset();
    } catch (e: any) {
      errorMessage = mapTwoFaError(e);
    }
  };

  const reset = () => {
    step = 'idle';
    qrCodeUrl = '';
    secretKey = '';
    verifyCode = '';
    errorMessage = '';
  };

  const handleDisable2FA = async () => {
    try {
      const res = await disable2FA();
      if (res.success) {
        step = 'idle';
        const response = await client.getAuth();
        syncStatus(response);
        successdisabledMessage = (String($t('twofa.disabled_success', '2FA disabled successfully')));
        toast.success(successdisabledMessage);
      }
    } catch (e: any) {
      errorMessage = mapTwoFaError(e);
    }
  };

  onMount(async () => {
    const response = await client.getAuth();
    syncStatus(response);
  });

</script>

<div class="rounded-xl border border-border/50 bg-card/20 p-6 shadow-sm">
  {#if step === 'idle'}
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-8">
      <div class="p-2 rounded-lg bg-gradient-to-r from-chart-2 via-chart-3 to-chart-1">
        <ShieldCheck class="w-5 h-5 text-popover" />
      </div>
      <div class="space-y-4 flex-1">
        <h3 class="text-lg font-bold tracking-tight">
          {$t('twofa.title', 'Two-Factor Authentication')}
        </h3>
        <p class="text-sm text-muted-foreground leading-relaxed">
          {$t('twofa.description', 'Add an extra layer of security to your account')}
        </p>
        <p class="text-sm text-muted-foreground leading-relaxed">
          {$t('twofa.protect_text', 'Protect your account by requiring a verification code from your authenticator app when signing in.')}
        </p>
      </div>

      <div class="flex-shrink-0">
      {#if !is2faActive}
        <Button 
          class="bg-[#00E5FF] px-8 py-6 font-bold text-black hover:bg-[#00B4CC] transition-all duration-200 whitespace-nowrap" 
          onclick={startSetup}
        >
          {$t('twofa.enable_button', 'Enable 2FA')}
        </Button>
      {:else}
          <Button 
          class="bg-[#00E5FF] px-8 py-6 font-bold text-black hover:bg-[#00B4CC] transition-all duration-200 whitespace-nowrap" 
          onclick={handleDisable2FA}
        >
          {$t('twofa.disable_button', 'Disable 2FA')}
        </Button>
      {/if}
      </div>
    </div>

    {#if errorMessage}
      <Alert variant="destructive" class="mt-4 bg-destructive/10">
        <AlertDescription>{errorMessage}</AlertDescription>
      </Alert>
    {/if}

  {:else if step === 'setup'}
    <div class="space-y-6">
      <div class="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <div class="shrink-0 rounded-lg bg-white p-2">
          <img src={qrCodeUrl} alt="QR Code" class="size-32" />
        </div>
        
        <div class="flex-1 space-y-4">
          <p class="text-sm font-medium">{$t('twofa.scan_qr', 'Scan the QR code in your app:')}</p>
          <details class="group">
            <summary class="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
              {$t('twofa.manual_code', 'Manual Code')}
            </summary>
            <code class="mt-2 block break-all rounded border border-border/40 bg-background/50 p-2 text-[10px] text-cyan-400">
              {secretKey}
            </code>
          </details>
        </div>
      </div>

      <div class="space-y-2">
        <Label for="verify-code" class="text-xs font-semibold uppercase text-muted-foreground">
          {$t('twofa.enter_code', 'Verification Code')}
        </Label>
        <Input
          id="verify-code"
          type="text"
          bind:value={verifyCode}
          placeholder="000000"
          maxlength={6}
          class="max-w-[200px] bg-background/40"
        />
      </div>

      {#if errorMessage}
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      {/if}

      <div class="flex gap-3 pt-2">
        <Button variant="outline" class="border-border/50" onclick={reset}>
          {$t('twofa.cancel', 'Cancel')}
        </Button>
        <Button 
          class="bg-[#00E5FF] font-bold text-black hover:bg-[#00B4CC]" 
          onclick={verifyAndEnable} 
          disabled={verifyCode.length !== 6}
        >
          {$t('twofa.verify_enable', 'Verify and Enable')}
        </Button>
      </div>
    </div>
  {/if}
</div>