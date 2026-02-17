<script lang="ts">
  import { Input } from "@lib/components/ui/input";
  import { Separator } from "@lib/components/ui/separator";
  import { client } from "@lib/api/index.svelte";
  import type { AuthUserClient, User } from "@shared/user";
  import Label from "@lib/components/ui/label/label.svelte";
  import * as Card from "@lib/components/ui/card";
  import Button from "@lib/components/ui/button/button.svelte";
  import {t} from "@lib/i18n/i18n";
  import * as Dialog from "$lib/components/ui/dialog";
  import { Trash } from "@lucide/svelte";
  import { toast } from "svelte-sonner";
  import { validateInputThrow, validateAvatarFile } from "@lib/validation/inputValidation";
    import { isAppError } from "@lib/types/error";

  type ProfilePageData = {
    auth: AuthUserClient;
    user: User;
    avatarFile?: File;
    passwd: string;
    passwdRepeat: string;
  };

  const sessionPromise = client.getSession();

  let session: ProfilePageData = $state({
    auth: client.auth!,
    user: client.user!,
    passwd: '',
    passwdRepeat: ''
  });

  let avatarSrc = $derived(session.avatarFile
    ? URL.createObjectURL(session.avatarFile)
    : client.avatar);
  let editMode = $state(false);

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
        return;
      }
      session.avatarFile = file;
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
          throw new Error("Passwords don't match");
        }
        passwd = session.passwd;
      }

      const updatePromise = client.updateUserInfo(session.user, session.avatarFile);
      toast.promise(updatePromise, {
        success: () => {
          editMode = false;
          return 'Updated successfully!'
        },
        loading: 'Loading...',
        error: (e) => `Failed to update Account: ${e}`,
      });

      const updateAuthPromise = client.updateCredentials({ email, user_name, passwd });
      toast.promise(updateAuthPromise, {
        success: () => {
          editMode = false;
          return 'Updated successfully!'
        },
        loading: 'Loading...',
        error: (e) => `Failed to update Account: ${e}`,
      });
    } catch (e: any) {
      if (isAppError(e))
        toast.error($t('error.'+ e.message)
        || $t('error.general', 'Something went wrong'));
      toast.error($t('error.general', 'Something went wrong'));
    }
  };

  let deleteDialogOpen = $state(false);
  let deleteState = $state('none');

  const handleDelete = async () => {
    deleteState = 'running';
    const deletePromise = client.delete();
    toast.promise(deletePromise, {
      success: () => { return 'Deleted successfully!' },
      loading: 'Loading...',
      error: (e) => `Failed to delete Account: ${e}`,
    });
  }

</script>

<Dialog.Root open={deleteDialogOpen}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>{$t('profile.delete_account')}</Dialog.Title>
    </Dialog.Header>
    <div class="flex flex-col gap-4">
      {#if deleteState === 'none'}
      <p>{$t('profile.delete_confirm')}</p>
      <div class="flex gap-4 w-full">
        <Button onclick={async () => { await handleDelete(); deleteDialogOpen = false } }>
          {$t('profile.yes')}
        </Button>
        <Button onclick={() => {
          deleteDialogOpen = false;
        }}>
          {$t('profile.cancel')}
        </Button>
      </div>
      {:else if deleteState === 'running' }
        <p>{$t('profile.deleting')}</p>
      {:else}
        <p>{$t('profile.delete_success')}</p>
      {/if}
    </div>
  </Dialog.Content>
</Dialog.Root>

<Card.Root class="size-full mx-auto">
  <Card.Header>
     <Card.Action class="flex gap-4">
      <Button
        type="button"
        variant={editMode ? "secondary" : "outline"}
        size="sm"
        onclick={toggleEditMode}
      >
        {editMode ? $t('profile.cancel') : $t('profile.edit')}
      </Button>
      <Button
        variant={editMode ? "secondary" : "outline"}
        size="sm"
        onclick={() => deleteDialogOpen = true }
      >
        <Trash size='sm'/>
      </Button>
    </Card.Action>   <Card.Title class="text-3xl">{$t('profile.profile')}</Card.Title>
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
          <div class="flex-1">
            <Label for="avatar">{$t('profile.avatar_btn')}</Label>
            <Input
              id="avatar"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              class="mt-2"
              onchange={handleFileChange}
            />
          </div>
        {/if}
      </div>

      <Separator />

      <div class="space-y-4">
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-semibold">{$t('profile.pers_info')}</h2>
        </div>
        <Separator />
        <div class="space-y-2">
          <Label for="display-name">{$t('profile.disp_name')}</Label>
          <Input
            id="display-name"
            bind:value={session.user.name}
            disabled={!editMode}
          />
        </div>
      </div>

      <Separator />

      <div class="space-y-4">
        <h2 class="text-xl font-semibold">{$t('profile.credentials')}</h2>
        <Separator />
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="username">{$t('profile.username')}</Label>
            <Input
              id="username"
              bind:value={session.auth.user_name}
              disabled={!editMode}
            />
          </div>
          <div class="space-y-2">
            <Label for="email">{$t('profile.email')}</Label>
            <Input
              id="email"
              type="email"
              bind:value={session.auth.email}
              disabled={!editMode}
            />
          </div>
          <div class="space-y-2">
            <Label for="password">{$t('profile.password')}</Label>
            <Input
              id="password"
              type="password"
              placeholder="********"
              bind:value={session.passwd}
              autocomplete="new-password"
              disabled={!editMode}
            />
          </div>
          <div class="space-y-2">
            <Label for="password-repeat">{$t('profile.pass_repeat')}</Label>
            <Input
              id="password-repeat"
              type="password"
              placeholder="********"
              bind:value={session.passwdRepeat}
              autocomplete="new-password"
              disabled={!editMode}
            />
          </div>
        </div>
      </div>

      {#if editMode}
        <div class="flex justify-end pt-4">
          <Button type="submit">{$t('profile.save')}</Button>
        </div>
      {/if}
    </form>
  </Card.Content>
</Card.Root>
