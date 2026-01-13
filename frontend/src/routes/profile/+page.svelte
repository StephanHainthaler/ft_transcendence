<script lang="ts">
  import { Input } from "@lib/components/ui/input";
  import { Separator } from "@lib/components/ui/separator";
  import { client } from "@lib/api/index";
  import type { AuthUserClient, User } from "@shared/user";
  import Label from "@lib/components/ui/label/label.svelte";
  import * as Card from "@lib/components/ui/card";
  import Button from "@lib/components/ui/button/button.svelte";
  import * as Dialog from "$lib/components/ui/dialog";
  import { Trash } from "@lucide/svelte";
    import { toast } from "svelte-sonner";

  type ProfilePageData = {
    auth: AuthUserClient;
    user: User;
    avatarFile?: File;
    passwd: string;
    passwdRepeat: string;
  };

  const sessionPromise = client.getSession();

  let editMode = $state(false);

  let session: ProfilePageData = $state({
    auth: client.auth!,
    user: client.user!,
    passwd: '',
    passwdRepeat: ''
  });

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
      <Dialog.Title>Delete Account</Dialog.Title>
    </Dialog.Header>
    <div class="flex flex-col gap-4">
      {#if deleteState === 'none'}
      <p>Are you sure you want to delete you account?</p>
      <div class="flex gap-4 w-full">
        <Button onclick={async () => { await handleDelete(); deleteDialogOpen = false } }>
          Yes
        </Button>
        <Button onclick={() => {
          if (currentAvatarEl) currentAvatarEl.src = prevAvatarValue;
          deleteDialogOpen = false;
        }}>
          Cancel
        </Button>
      </div>
      {:else if deleteState === 'running' }
        <p>Deleting, please wait...</p>
      {:else}
        <p>Done! Redirecting...</p>
      {/if}
    </div>
  </Dialog.Content>
</Dialog.Root>

<Card.Root class="size-full mx-auto">
  <Card.Header>
    <Card.Title class="text-3xl">Profile</Card.Title>
    <Card.Action class="flex gap-4">
      <Button
        type="button"
        variant={editMode ? "secondary" : "outline"}
        size="sm"
        onclick={toggleEditMode}
      >
        {editMode ? "Cancel" : "Edit"}
      </Button>
      <Button
        variant={editMode ? "secondary" : "outline"}
        size="sm"
        onclick={() => deleteDialogOpen = true }
      >
        <Trash size='sm'/>
      </Button>
    </Card.Action>
  </Card.Header>
  <Card.Content>
    <form class="space-y-6" onsubmit={handleSubmit}>
      <div class="flex items-center gap-6">
        {#await sessionPromise then sess}
          {#if client.avatar}
            <img
              bind:this={currentAvatarEl}
              src={client.avatar}
              alt={sess.user?.name || 'user avatar'}
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
            <Label for="avatar">Change Avatar</Label>
            <Input
              id="avatar"
              type="file"
              accept="image/*"
              class="mt-2"
              onchange={handleFileChange}
            />
          </div>
        {/if}
      </div>

      <Separator />

      <div class="space-y-4">
        <h2 class="text-lg font-semibold">Personal Information</h2>
        <div class="space-y-2">
          <Label for="display-name">Display Name</Label>
          <Input
            id="display-name"
            bind:value={session.user.name}
            disabled={!editMode}
          />
        </div>
      </div>

      <Separator />

      <div class="space-y-4">
        <h2 class="text-lg font-semibold">Account Credentials</h2>
        <div class="grid gap-4 md:grid-cols-2">
          <div class="space-y-2">
            <Label for="username">Username</Label>
            <Input
              id="username"
              bind:value={session.auth.username}
              disabled={!editMode}
            />
          </div>
          <div class="space-y-2">
            <Label for="email">Email</Label>
            <Input
              id="email"
              type="email"
              bind:value={session.auth.email}
              disabled={!editMode}
            />
          </div>
        </div>
      </div>

      {#if editMode}
        <Separator />

        <div class="space-y-4">
          <h2 class="text-lg font-semibold">Change Password</h2>
          <div class="grid gap-4 md:grid-cols-2">
            <div class="space-y-2">
              <Label for="password">New Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter new password"
                bind:value={session.passwd}
                autocomplete="new-password"
              />
            </div>
            <div class="space-y-2">
              <Label for="password-repeat">Confirm Password</Label>
              <Input
                id="password-repeat"
                type="password"
                placeholder="Confirm new password"
                bind:value={session.passwdRepeat}
                autocomplete="new-password"
              />
            </div>
          </div>
        </div>

        <div class="flex justify-end pt-2">
          <Button type="submit">Save Changes</Button>
        </div>
      {/if}
    </form>
  </Card.Content>
</Card.Root>
