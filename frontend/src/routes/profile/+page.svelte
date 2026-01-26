<script lang="ts">
  import { Input } from "@lib/components/ui/input";
  import { Separator } from "@lib/components/ui/separator";
  import { client } from "@lib/api/index";
  import type { AuthUserClient, User } from "@shared/user";
  import Label from "@lib/components/ui/label/label.svelte";
  import * as Card from "@lib/components/ui/card";
  import Button from "@lib/components/ui/button/button.svelte";
<<<<<<< HEAD
  import TwoFactorSetup from "@lib/components/TwoFactorSetup.svelte";
=======
  import {t} from "@lib/i18n/i18n";
  import * as Dialog from "$lib/components/ui/dialog";
  import { Trash } from "@lucide/svelte";
    import { toast } from "svelte-sonner";
>>>>>>> main

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
      if (currentAvatarEl && prevAvatarValue.length > 0) currentAvatarEl.src = prevAvatarValue;
    }
    editMode = !editMode;
  };

  let prevAvatarValue: string = $state('');

  let currentAvatarEl: HTMLImageElement | undefined = $state();

  const handleFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      session.avatarFile = file;
      if (currentAvatarEl && input.files?.[0]) {
        if (prevAvatarValue.length === 0) {
          prevAvatarValue = currentAvatarEl.src;
        }
        const url = URL.createObjectURL(file);
        currentAvatarEl.src = url;

        return () => URL.revokeObjectURL(url);
      }
    }
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    console.log(session);
    const updatePromise = client.updateUserInfo(session.user, session.avatarFile);
    toast.promise(updatePromise, {
      success: () => { return 'Updated successfully!' },
      loading: 'Loading...',
      error: (e) => `Failed to update Account: ${e}`,
    });
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
          if (currentAvatarEl) currentAvatarEl.src = prevAvatarValue;
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
    <Card.Title class="text-3xl">{$t('profile.profile')}</Card.Title>
  </Card.Header>
  <Card.Content>
    <form class="space-y-8" on:submit={handleSubmit}>
      <div class="space-y-4">
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-semibold">{$t('profile.pers_info')}</h2>
          <Button
            type="button"
            variant={editMode ? "secondary" : "outline"}
            size="sm"
            onclick={toggleEditMode}
          >
            {editMode ? $t('profile.cancel') : $t('profile.edit')}
          </Button>
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
              bind:value={session.auth.username}
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

    <!-- 2FA Section -->
    <div class="mt-8">
      <Separator class="mb-6" />
      <TwoFactorSetup />
    </div>
  </Card.Content>
</Card.Root>
