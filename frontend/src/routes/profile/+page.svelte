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

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
  };
</script>

<Card.Root class="size-full mx-auto">
  <Card.Header>
    <Card.Title class="text-3xl">Profile</Card.Title>
  </Card.Header>
  <Card.Content>
    <form class="space-y-8" on:submit={handleSubmit}>
      <div class="space-y-4">
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-semibold">Personal Info</h2>
          <Button
            type="button"
            variant={editMode ? "secondary" : "outline"}
            size="sm"
            onclick={toggleEditMode}
          >
            {editMode ? "Cancel" : "Edit"}
          </Button>
        </div>
        <Separator />
        <div class="space-y-2">
          <Label for="display-name">Display Name</Label>
          <Input
            id="display-name"
            bind:value={session.user.name}
            disabled={!editMode}
          />
        </div>
      </div>

      <!-- Credentials Section -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold">Credentials</h2>
        <Separator />
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="username">Username</Label>
            <Input
              id="username"
              type="text"
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
          <div class="space-y-2">
            <Label for="password">Password</Label>
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
            <Label for="password-repeat">Repeat Password</Label>
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
          <Button type="submit">Save Changes</Button>
        </div>
      {/if}
    </form>
  </Card.Content>
</Card.Root>
