<script lang="ts">
  import { Input } from "@lib/components/ui/input";
  import { Separator } from "@lib/components/ui/separator";
  import { client } from "@lib/api/index.svelte";
  import type { AuthUserClient, User } from "@shared/user";
  import Label from "@lib/components/ui/label/label.svelte";
  import * as Card from "@lib/components/ui/card";
  import Button from "@lib/components/ui/button/button.svelte";
  import TwoFactorSetup from "@lib/components/custom/TwoFactorSetup.svelte";
  import { t } from "@lib/i18n/i18n";
  import * as Dialog from "$lib/components/ui/dialog";
  import { Eye, Trash } from "@lucide/svelte";
  import { toast } from "svelte-sonner";
  import { validateInputThrow, validateAvatarFile } from "@lib/validation/inputValidation";
  import NeonHeader from "@lib/components/custom/NeonHeader.svelte";
  import { isAppError } from "@lib/types/error";
  import { EyeOff } from "lucide-svelte";
  import { goto } from "$app/navigation";

  let showPassword = $state(false);
  let showPasswordRepeat = $state(false);
  let editMode = $state(false);
  let selectedFileName = $state('');

  type ProfilePageData = {
    auth: AuthUserClient;
    user: User;
    avatarFile?: File;
    passwd: string;
    passwdRepeat: string;
  };


  const user = client.user;
  const auth = client.auth;

  if ( !user || !auth ) {
      goto('/auth')
  }

  const sessionPromise = client.getSession().catch(() => {
    goto('/auth');
  });

  let session: ProfilePageData = $state({
    auth: auth,
    user: user,
    passwd: '',
    passwdRepeat: ''
  });

  let avatarSrc = $derived(session.avatarFile
    ? URL.createObjectURL(session.avatarFile)
    : client.avatar);

  const toggleEditMode = () => {
    if (editMode === true) {
      avatarSrc = prevAvatarValue;
    }
    editMode = !editMode;
  };

  let prevAvatarValue: string | undefined = $derived(client.avatar);
  let currentAvatarEl: HTMLImageElement | undefined = $state();

  const handleFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      const avatarError = validateAvatarFile(file);
      if (avatarError) {
        toast.error(avatarError);
        input.value = '';
        selectedFileName = '';
        return;
      }
      session.avatarFile = file;
      selectedFileName = file.name;
      if (currentAvatarEl && input.files?.[0]) {
        const url = URL.createObjectURL(file);
        avatarSrc = url;

        return () => URL.revokeObjectURL(url);
      }
    }
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    try {
      validateInputThrow(session.user.name, { type: 'displayName' });
      const user_name = validateInputThrow(session.auth.user_name, { type: 'username' });
      const email = validateInputThrow(session.auth.email, { type: 'email' });

      let passwd;
      if (session.passwd.length > 0) {
        validateInputThrow(session.passwd, { type: 'password' });
        if (session.passwd !== session.passwdRepeat) {
          throw Object.assign(new Error("pass_mismatch"), {isAppError: true});
        }
        passwd = session.passwd;
      }

      const combinedUpdatePromise = Promise.all([
        client.updateUserInfo(session.user, session.avatarFile),
        client.updateCredentials({ email, user_name, passwd })
      ]);

      toast.promise(combinedUpdatePromise, {
        success: () => {
          editMode = false;
          return $t('profile.updated', 'Updated successfully');
        },
        loading: $t('profile.loading2', 'Loading...'),
        error: (e) => $t('profile.update_err', 'Error updating profile'),
      });
    } catch (e: any) {
      let errorMessage = '';
      if (isAppError(e))
        errorMessage = $t('error.'+ e.message) || $t('error.general');
      else
      {
        const rawError = e.message || e.error || String(e);
        const translationKey = rawError.includes('.') ? `${rawError}` : null;
        errorMessage = translationKey ? $t(translationKey) : rawError ? rawError : $t('profile.update_err', 'Error updating profile');
      }
      toast.error(errorMessage);
    }
  };

  let deleteDialogOpen = $state(false);
  let deleteState = $state('none');

  const handleDelete = async () => {
    deleteState = 'running';
    const deletePromise = client.delete();
    toast.promise(deletePromise, {
      success: () => { return $t('profile.delete_success', 'Account deleted successfully!') },
      loading: $t('profile.loading', 'Loading...'),
      error: (e) => `${$t('profile.delete_err', 'Error deleting account')}: ${e}`,
    });
  }

  const togglePassword = () => {
    showPassword = !showPassword;
  };

  const togglePasswordRepeat = () => {
    showPasswordRepeat = !showPasswordRepeat;
  };

  $effect(() => {
    if (!editMode) {
      showPassword = false;
      showPasswordRepeat = false;
      session.passwd = '';
      session.passwdRepeat = '';
    }
  });

</script>

<Dialog.Root open={deleteDialogOpen}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>{$t('profile.delete_account', 'Delete Account')}</Dialog.Title>
    </Dialog.Header>
    <div class="flex flex-col gap-4">
      {#if deleteState === 'none'}
      <p>{$t('profile.delete_confirm', 'Are you sure you want to delete your account? This action cannot be undone.')}</p>
      <div class="flex gap-4 w-full">
        <Button onclick={async () => { await handleDelete(); deleteDialogOpen = false } }>
          {$t('profile.yes', 'Yes')}
        </Button>
        <Button onclick={() => {
          deleteDialogOpen = false;
        }}>
          {$t('profile.cancel', 'Cancel')}
        </Button>
      </div>
      {:else if deleteState === 'running' }
        <p>{$t('profile.deleting', 'Deleting account...')}</p>
      {:else}
        <p>{$t('profile.delete_success', 'Account deleted successfully!')}</p>
      {/if}
    </div>
  </Dialog.Content>
</Dialog.Root>

{#if user && auth}
<Card.Root class="size-full mx-auto overflow-y-auto">
  <Card.Header>
     <Card.Action class="flex gap-4">
      <Button
        type="button"
        variant={editMode ? "secondary" : "outline"}
        size="sm"
        onclick={toggleEditMode}
      >
        {editMode ? $t('profile.cancel', 'Cancel') : $t('profile.edit', 'Edit')}      </Button>
      <Button
        variant={editMode ? "secondary" : "outline"}
        size="sm"
        onclick={() => deleteDialogOpen = true }
      >
        <Trash size='sm'/>
      </Button>
    </Card.Action>
      <Card.Title>
        <NeonHeader
          size="2xl"
          level="h1"
          text={$t('profile.profile', 'Profile')} />
      </Card.Title>
  </Card.Header>
  <Card.Content>
    <form class="space-y-6" onsubmit={handleSubmit}>
      <div class="flex items-center gap-6">
        {#await sessionPromise}
          <div class="size-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-semibold">
            {client.user?.name.slice(0, 1).toUpperCase()}
          </div>
        {:then}
          {#if avatarSrc}
            <img
              bind:this={currentAvatarEl}
              src={avatarSrc}
              alt={'user avatar'}
              class="size-20 rounded-full object-cover text-center"
            />
          {:else}
            <div class="size-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-semibold">
              {client.user?.name.slice(0, 1).toUpperCase()}
            </div>
          {/if}
        {:catch}
          <div></div>
        {/await}

        {#if editMode}
          <div class="mt-2 flex-1 justify-center">
            <Label for="avatar">{$t('profile.avatar_btn', 'Upload Avatar')}</Label>
            <div class="mt-2 flex items-center gap-2">
              <Input
                id="avatar"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                class="mt-2 hidden"
                onchange={handleFileChange}
              />
              <Button class="mt-2"
                variant="outline"
                onclick={() => document.getElementById('avatar')?.click()}
              >
                {$t('profile.choose_file', 'Choose file')}
              </Button>
              <span class="mt-2 text-xs text-muted-foreground truncate max-w-[150px]">
                {selectedFileName || $t('profile.no_file', 'No file chosen')}
              </span>
            </div>
          </div>
        {/if}
      </div>

      <Separator />

      <div class="space-y-4">
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-semibold">{$t('profile.pers_info', 'Personal Info')}</h2>
        </div>
        <Separator />
        <div class="space-y-2">
          <Label for="display-name">{$t('profile.disp_name', 'Display Name')}</Label>
          <Input
            id="display-name"
            bind:value={session.user.name}
            disabled={!editMode}
          />
        </div>
      </div>

      <Separator />

      <div class="space-y-4">
        <h2 class="text-xl font-semibold">{$t('profile.credentials', 'Credentials')}</h2>
        <Separator />
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="username">{$t('profile.username', 'Username')}</Label>
            <Input
              id="username"
              bind:value={session.auth.user_name}
              disabled={!editMode}
            />
          </div>
          <div class="space-y-2">
            <Label for="email">{$t('profile.email', 'Email')}</Label>
            <Input
              id="email"
              type="email"
              bind:value={session.auth.email}
              disabled={!editMode}
            />
          </div>
          <div class="space-y-2">
            <Label for="password">{$t('profile.password', 'Password')}</Label>
            <div class="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="********"
                bind:value={session.passwd}
                autocomplete="new-password"
                disabled={!editMode}
                class="pr-10"
              />
              <button
                type="button"
                class="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-foreground transition-colors z-10 cursor-pointer disabled:opacity-50"
                onclick={togglePassword}
                tabindex="-1"
                disabled={!editMode}
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
          <Label for="password-repeat">{$t('profile.pass_repeat', 'Repeat Password')}</Label>
          <div class="relative">
            <Input
              id="password-repeat"
              type="password"
              placeholder="********"
              bind:value={session.passwdRepeat}
              autocomplete="new-password"
              disabled={!editMode}
            />
              <button
                type="button"
                class="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-foreground transition-colors z-10 cursor-pointer disabled:opacity-50"
                onclick={togglePasswordRepeat}
                tabindex="-1"
                disabled={!editMode}
              >
                {#if showPasswordRepeat}
                  <EyeOff size={20} />
                {:else}
                  <Eye size={20} />
                {/if}
              </button>
            </div>
          </div>
        </div>
      </div>

      {#if editMode}
        <div class="flex justify-end pt-4">
          <Button type="submit">{$t('profile.save', 'Save Changes')}</Button>
        </div>
      {/if}
    </form>

    <!-- 2FA Section -->
    <div class="mt-8">
      <Separator class="mb-6" />
      <TwoFactorSetup />
    </div>
  </Card.Content>
</Card.Root>
{/if}