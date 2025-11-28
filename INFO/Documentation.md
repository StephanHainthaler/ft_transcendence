# Index
DOM = structure of the HTML file

VDOM = virtual DOM, its basically a lightweight JavaScript representation of the real DOM. When a component changes, a new VDOM is created and compared to the previous one, and only the minimal necessary updates are applied to the actual DOM.

# How the website is built
We keep the html file the bare minimum and "outsource" everything to the code.

<img width="551" height="412" alt="image" src="https://github.com/user-attachments/assets/392e6239-f60b-4501-b49c-f0d8bcf77024" />

Here, "app" is the "div" element with the id "app".
Everything in line 12 will be on our website.

In the router, it gets selected (see line 54):

<img width="562" height="526" alt="image" src="https://github.com/user-attachments/assets/67767e0f-121b-4a22-a9ea-1842a90a7297" />

And then in line 68 the VDOM of the page gets mounted into the "app" div. 

What we do is we add content to this "div" element.
And this is done in the "mount" function in vdom.ts:

<img width="444" height="132" alt="image" src="https://github.com/user-attachments/assets/d8bf0dc8-be5e-4bb9-97b2-815e508c7791" />

"container" is basically our app element (see line 12 in index.html image above).

> **_NOTE:_** Instead of using container.appendChild(element), we could also write the HTML markup as a string and assign it to container.innerHTML - but this has some disadvantages and is less flexible.
> ```js
>  const newDiv = document.createElement("div");
>  const newParagraph = document.createElement("p");
>  newParagraph.innerText = "Hello";
>  newDiv.appendChild(newParagraph);
>  container.appendChild(newDiv);
>```
>is the same as 
>```js
>  container.innerHTML = `
>  <div>
>    <p>Hello</p>
>  </div>
>  `;
>```



