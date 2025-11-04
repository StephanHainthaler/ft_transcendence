import "./app.css";

try {
  const el = document.getElementById("hello-world-trigger");
  if (!el) throw new Error("Failed to get 'hello-world-trigger'");

  el.addEventListener('click', async () => {
    try {
      const output = document.getElementById('hello-world-response');
      if (!output) throw new Error("Failed to get 'hello-world-response' element");

      const response = await fetch("/api/", {
        method: "GET",
      });

      console.log(response);
      const respJson = await response.text();
      output.innerHTML = respJson;
      output.className = 'bg-red-500';
      console.log(respJson);
    } catch (e: any) {
      console.error(e);
    }
  })
} catch (e: any) {
  console.error(e);
}
