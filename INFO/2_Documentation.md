# 1. Index
DOM = Document Object Model = structure of the HTML file

VDOM = virtual DOM, its basically a lightweight JavaScript representation of the real DOM. When a component changes, a new VDOM is created and compared to the previous one, and only the minimal necessary updates are applied to the actual DOM. This will then actually change the website.

> **_NOTE:_**  Basic Idea behind JavaScript: Make web pages become interactive by allowing the browser to dynamically change content.

# 2. The Framework
We keep the html file the bare minimum and "outsource" everything to the code.
The framework used here basically keeps a very leightweight copy of the DOM but with custom defined virtual nodes - a VDOM.

> **_DEFINITION:_** A "node" can be understood as follows:
> 
> <img width="401" height="267" alt="image" src="https://github.com/user-attachments/assets/6dc9a2c1-17e7-4b54-bfb6-90e590abcea9" />

When a component changes, a new VDOM is created and compared to the previous one, and only the minimal necessary updates are applied to the actual DOM, so that it mirrors the VDOM.

<img width="331" height="117" alt="image" src="https://github.com/user-attachments/assets/7d3d3736-7a24-461f-b132-917d20480f61" />

# 3. How the website is built / works
When visiting http://localhost:8080/ we download the following from the server the HTML page: 

<img width="551" height="412" alt="image" src="https://github.com/user-attachments/assets/392e6239-f60b-4501-b49c-f0d8bcf77024" />

In line 14, you can see the "script" part. This is going to request / run the index.ts file:

<img width="414" height="542" alt="image" src="https://github.com/user-attachments/assets/36165c44-5354-48d5-b714-38f437a5317b" />

This will "construct" and initialize the router (line 18).

<img width="562" height="526" alt="image" src="https://github.com/user-attachments/assets/67767e0f-121b-4a22-a9ea-1842a90a7297" />

In the router's constructor, the app element gets selected (see line 54).
In the HTML code above, "app" is the "div" element with the id "app".
This meand everything in line 12 of this index.html will be on our website.

And then in line 68 - in the "init" function - the VDOM of the page gets mounted into the "app" div. This happens every time the router get's initialized!

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

<img width="517" height="333" alt="image" src="https://github.com/user-attachments/assets/e1012a7e-eb39-4e47-97bc-2805ccdef489" />

Here we create the elements, we look for the "on" keyword (f.e. "onclick") and if we have that we add an eventlistener using the value of the "on..." attribute.
We also add all the children of the node, specified in the VNODE.


## 3.1 The Router - Navigating the website.

There, the "app" node/element is stored.

Logic to navigate somewhere (f.e. "/user", "/profile", ...):

<img width="505" height="595" alt="image" src="https://github.com/user-attachments/assets/fb11b404-34d5-4e53-890d-ad1f4a4be232" />

<details>
  <summary>Loading a Page</summary>

When we navigate somewhere with the "goto", we actually load the page by fetching the respective file from the server - which can then be used dynamically at runtime. 

<img width="600" height="183" alt="image" src="https://github.com/user-attachments/assets/bdbbf52d-c11e-46f3-8065-d97fb7e9d881" />

And the pages are - as can be seen in the code - located here:

<img width="148" height="163" alt="image" src="https://github.com/user-attachments/assets/a28008fd-d3a6-4651-bae4-899f17ab5221" />

All of these pages will have a function "Page" that returns a HTML "div" node/element - using the VNODEs defined in elements.ts

F.e.:

<img width="498" height="175" alt="image" src="https://github.com/user-attachments/assets/2e27fc70-f047-48ec-a38f-1f5ca3529490" />
</details>

As you can see, the "goto" function then passes this loaded page (basically the "div" node/element defined+returned in the resp "Page" function) to the "update" function, to update the website ...


## 3.2 Updating the Website
This works via the "update" function. This function will update everything from the node/element that is passed to it downwards and finally assign "newNode" to the "oldVNode" (=the current one).

<img width="326" height="139" alt="image" src="https://github.com/user-attachments/assets/976e8ca2-1f3e-4070-83da-6e707407c72d" />

This function further calls the "patch" function, which renders the provided node/element to the DOM:

<img width="506" height="619" alt="image" src="https://github.com/user-attachments/assets/f68ea3e3-69fe-430c-ab21-64661649514a" />

It takes 
1. a "domeNode", which is a real DOM node
2. the oldNode, which is the VNODE before our changes
3. and the "newNode", which is the VNODE after our changes

It will compare "oldNode" with "newNode" and apply the changes to "domeNode".

Then we go through all children and for each child if they change, we will recursively call the patch function on them:

<img width="500" height="460" alt="image" src="https://github.com/user-attachments/assets/a31f40aa-388b-4544-a965-6b14eb9e4f98" />


# 4. The Login Process
When the AuthPage.ts gets loaded, the user can click f.e. on "Login" ..

<img width="636" height="702" alt="image" src="https://github.com/user-attachments/assets/45d6b7fb-685d-426a-9779-43343f20b574" />

.. and he then will be directed (onclick) to the LoginForm:

<img width="797" height="312" alt="image" src="https://github.com/user-attachments/assets/82afbe94-5b56-4b86-b25f-5420bfc8bf48" />

When a user inputs sth into the fields 'Email or Username' / 'Password', which get triggered "oninput" instead of "onclick", the input gets stored in a variable.

When the user then clicks on 'Sign in', the input gets validated. Then the login function of "client" is called:

<img width="562" height="308" alt="image" src="https://github.com/user-attachments/assets/929ce72a-4069-4035-b25d-917cf5e956b0" />

> **_NOTE:_**
> 
>  e.preventDefault() means the submission of an input is not interpreted as a HTML resubmission
> 
> e.stopPropagation() means that the "onclick" event in line 61 of LoginForm.ts does not trigger the "onclick" in line 51 of the file.

A certain state is stored in the browser during this process. This state defines, if I have the user and the auth intormation. As you can see, these are set to null initially:

<img width="607" height="245" alt="image" src="https://github.com/user-attachments/assets/bac0d95b-f5ef-415f-80a3-764a39c078ff" />

So from the client I call this function "isLoggedIn"

<img width="305" height="96" alt="image" src="https://github.com/user-attachments/assets/6ff5bf99-2222-4a91-a91a-e291c20dbfa4" />

where I check this information.

When the header / the dropdownMenu gets rendered, we check for this:

<img width="826" height="376" alt="image" src="https://github.com/user-attachments/assets/609c9034-329e-4c77-9a7a-68b348479b6a" />

and this defines which of the dropdown option are available to the user.


