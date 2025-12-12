<script lang="ts">
  import { Input } from "@lib/components/ui/input";
  import { Separator } from "@lib/components/ui/separator";
  import { client } from "@lib/api/index";
  import type { AuthUserClient, User } from "@shared/user";
  import Label from "@lib/components/ui/label/label.svelte";
  import * as Card from "@lib/components/ui/card";
  import Button from "@lib/components/ui/button/button.svelte";

  type ProfilePageData = {
    auth: AuthUserClient;
    user: User;
    avatarFile?: File;
    passwd: string;
    passwdRepeat: string;
  };

  let editMode = false;
  let session: ProfilePageData = {
    auth: client.auth!,
    user: client.user!,
    passwd: '',
    passwdRepeat: ''
  };

  client.onChange(() => {
    console.log('notifying profile form');
    session = {
      auth: client.auth!,
      user: client.user!,
      passwd: '',
      passwdRepeat: ''
    };
  });

  const toggleEditMode = () => {
    editMode = !editMode;
  };

  const handleFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    session.avatarFile = input.files?.[0] || undefined;
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    await client.updateUserInfo(session.user, session.avatarFile)
  };

</script>

<Card.Root class="size-full mx-auto">
  <Card.Header>
    <Card.Title class="text-3xl">Profile</Card.Title>
    <Card.Action>
      <Button
        type="button"
        variant={editMode ? "secondary" : "outline"}
        size="sm"
        onclick={toggleEditMode}
      >
        {editMode ? "Cancel" : "Edit"}
      </Button>
    </Card.Action>
  </Card.Header>
  <Card.Content>
    <form class="space-y-6" onsubmit={handleSubmit}>
      <div class="flex items-center gap-6">
        {#if client.avatar}
          <img
            src={client.avatar}
            alt={client.user?.name || 'user avatar'}
            class="size-20 rounded-full object-cover"
          />
        {:else}
          <div class="size-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-semibold">
            {client.user?.name.slice(0, 1).toUpperCase()}
          </div>
        {/if}

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
