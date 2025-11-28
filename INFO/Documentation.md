# Index
DOM = Document Object Model = structure of the HTML file

VDOM = virtual DOM, its basically a lightweight JavaScript representation of the real DOM. When a component changes, a new VDOM is created and compared to the previous one, and only the minimal necessary updates are applied to the actual DOM.

> **_NOTE:_**  Basic Idea behind JavaScript: Make web pages become interactive by allowing the browser to dynamically change content.

# The Framework
We keep the html file the bare minimum and "outsource" everything to the code.
The framework used here basically keeps a very leightweight copy of the DOM but with custom defined virtual nodes - a VDOM.

> **_DEFINITION:_** A "node" can be understood as follows:
> 
> <img width="401" height="267" alt="image" src="https://github.com/user-attachments/assets/6dc9a2c1-17e7-4b54-bfb6-90e590abcea9" />

When a component changes, a new VDOM is created and compared to the previous one, and only the minimal necessary updates are applied to the actual DOM, so that it mirrors the VDOM.

<img width="331" height="117" alt="image" src="https://github.com/user-attachments/assets/7d3d3736-7a24-461f-b132-917d20480f61" />

# How the website is built
<img width="551" height="412" alt="image" src="https://github.com/user-attachments/assets/392e6239-f60b-4501-b49c-f0d8bcf77024" />

Here, "app" is the "div" element with the id "app".
Everything in line 12 will be on our website.

In the router, it gets selected (see line 54):

<img width="562" height="526" alt="image" src="https://github.com/user-attachments/assets/67767e0f-121b-4a22-a9ea-1842a90a7297" />

And then in line 68 the VDOM of the page gets mounted into the "app" div. This happens every time the router get's initialized!

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
> ```
> is the same as 
> ```js
>  container.innerHTML = `
>  <div>
>    <p>Hello</p>
>  </div>
>  `;
> ```

> **_NOTE:_** If you want to add button click functionality, in HTML you would do:
> ```js
>  container.innerHTML = `
>  <div>
>    <button id="myButton">Click me!</button>
>    <p id="myButtonResponse"></p>
>  </div>
>  `;
> ```
> and in JavaScript you have to add an EventListener for this button:
> ```js
> const answer = () => {
>  const response = document.getElementById("myButtonResponse");
>  const message = "Button clicked successfully!"; // or some fctn to fetch sth from the server path
>  response.innerText = message;
> }
> 
> const button = document.getElementById("myButton");
> button.addEventListener("click", answer); // asigns answer function to "onclick" field in the HTML node/element document.getElementById("myButton");
> // -> which is the same as:
> button.onclick = answer;
> ```

The "mount" function takes a VNODE and renders it.
<details>
  <summary>Definition of VNODE</summary>
The functions in elements.ts basically just return the VNODE type. These are elements for our VDOM. 

Technically, VNODE is a description of an node/element consisting of
1. a string called "tag", which will eigther be "div" or "p" or ...
2. "props" are the properties (so these are basically the "onclick" field's value, ...) of that node/element.
3. "...children" meaning I can put as many (comma-separated) child elements as I want

<img width="518" height="581" alt="image" src="https://github.com/user-attachments/assets/e34880e5-eb39-4fa4-858b-8ad86bee3fd3" />

> **_NOTE:_** So out of these we could create the above example HTML code too:
> ```js
> const newNode = div({}, 
>  button({ id: "myButton" }, "Click me!"), // "Click me!" is a child of "myButton"
>  p({ id: "myButtonResponse" })
> );
> ```

The props are updated via this function:

<img width="524" height="357" alt="image" src="https://github.com/user-attachments/assets/b8e729b9-ea0b-47b4-8f05-eac799a1cd09" />
</details>



