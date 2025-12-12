<script lang="ts">
  import * as Card from "$lib/components/ui/card";
  import * as Tabs from "$lib/components/ui/tabs";
  import LoginForm from "@lib/components/forms/LoginForm.svelte";
  import SignupForm from "@lib/components/forms/SignupForm.svelte";

</script>

<div class="w-full flex items-center justify-center p-4">
  <Tabs.Root value="login" class="w-full max-w-md">
    <Tabs.List class="grid w-full grid-cols-2">
      <Tabs.Trigger
        value="login"
      >
        Login
      </Tabs.Trigger>
      <Tabs.Trigger
        value="register"
      >
        Register
      </Tabs.Trigger>
    </Tabs.List>

    <Card.Root class="w-full max-w-md shadow-xl">
      <Card.Content class="pt-6 w-full">
        <Tabs.Content value="login" class="mt-0">
          <LoginForm />
        </Tabs.Content>

        <Tabs.Content value="register" class="mt-0">
          <SignupForm />
        </Tabs.Content>
      </Card.Content>
    </Card.Root>
  </Tabs.Root>
</div>
